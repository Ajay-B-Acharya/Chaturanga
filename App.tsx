import React, { useState, useEffect, useCallback } from 'react';
import {
  GameState, PlayerColor, Piece, PieceType, Position,
  DICE_VALUES, TEAM_A, TEAM_B, PLAYER_ORDER, BoardState, TeamStats
} from './types';
import { INITIAL_BOARD } from './constants';
import { getValidMoves, getTeam, checkPawnSummon, getTeammateColor } from './logic';
import Board from './components/Board';
import Controls from './components/Controls';
import { Scroll, Crown, ArrowRight, Swords } from 'lucide-react';

// Deep copy helper
const cloneBoard = (grid: (Piece | null)[][]) => grid.map(row => row.map(p => p ? { ...p } : null));

const App: React.FC = () => {
  // --- STATE ---
  const [isGameStarted, setIsGameStarted] = useState(false);

  const [gameState, setGameState] = useState<GameState>({
    board: cloneBoard(INITIAL_BOARD),
    currentPlayerIndex: 0,
    diceValue: null,
    phase: 'ROLL',
    selectedPosition: null,
    validMoves: [],
    teams: {
      A: { kingsAlive: 2, summonsUsed: 0 },
      B: { kingsAlive: 2, summonsUsed: 0 },
    },
    playersAlive: [true, true, true, true],
    logs: ['Welcome to Chaturanga! Green to roll.'],
    winner: null,
    consecutiveNoMoves: 0,
  });

  // --- HELPERS ---
  const log = (msg: string) => {
    setGameState(prev => ({ ...prev, logs: [...prev.logs, msg] }));
  };

  const nextTurn = useCallback((currentParams: Partial<GameState> = {}) => {
    setGameState(prev => {
      let nextIndex = (prev.currentPlayerIndex + 1) % 4;

      // Skip eliminated players
      let attempts = 0;
      // Need to check up-to-date playersAlive if passed in params, else use prev
      const currentAlive = currentParams.playersAlive || prev.playersAlive;

      while (!currentAlive[nextIndex] && attempts < 4) {
        nextIndex = (nextIndex + 1) % 4;
        attempts++;
      }

      if (attempts >= 4) {
        // Should be game over handled elsewhere, but safety break
        return { ...prev, ...currentParams };
      }

      const nextPlayer = PLAYER_ORDER[nextIndex];

      return {
        ...prev,
        ...currentParams,
        currentPlayerIndex: nextIndex,
        diceValue: null,
        phase: 'ROLL',
        selectedPosition: null,
        validMoves: [],
      };
    });
  }, []);

  const checkWinCondition = (teams: { A: TeamStats, B: TeamStats }) => {
    if (teams.A.kingsAlive === 0) return 'TEAM_B';
    if (teams.B.kingsAlive === 0) return 'TEAM_A';
    return null;
  };

  // Revive a player and unfreeze their pieces
  const revivePlayer = (
    board: (Piece | null)[][],
    playersAlive: boolean[],
    playerToRevive: PlayerColor
  ) => {
    const index = PLAYER_ORDER.indexOf(playerToRevive);
    playersAlive[index] = true;

    // Unfreeze all pieces of this player
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = board[r][c];
        if (p && p.owner === playerToRevive) {
          p.isNeutral = false;
        }
      }
    }
  };

  // --- ACTIONS ---

  const handleRoll = () => {
    const roll = DICE_VALUES[Math.floor(Math.random() * DICE_VALUES.length)];
    const currentPlayer = PLAYER_ORDER[gameState.currentPlayerIndex];

    // Check if any moves are possible with this roll
    let hasLegalMoves = false;
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = gameState.board[r][c];
        if (p && p.owner === currentPlayer && !p.isNeutral) {
          const moves = getValidMoves(gameState.board, p, { row: r, col: c }, roll);
          if (moves.length > 0) {
            hasLegalMoves = true;
            break;
          }
        }
      }
      if (hasLegalMoves) break;
    }

    setGameState(prev => ({
      ...prev,
      diceValue: roll,
      phase: hasLegalMoves ? 'SELECT' : 'ROLL', // Will effectively skip if handled below
      logs: [...prev.logs, `${getPlayerName(currentPlayer)} rolled a ${roll}!`]
    }));

    if (!hasLegalMoves) {
      setTimeout(() => {
        log(`${getPlayerName(currentPlayer)} has no moves for ${roll}. Skipping turn.`);
        setGameState(prev => ({ ...prev, consecutiveNoMoves: prev.consecutiveNoMoves + 1 }));
        nextTurn();
      }, 1500);
    } else {
      setGameState(prev => ({ ...prev, consecutiveNoMoves: 0 }));
    }
  };

  const handleTileClick = (pos: Position) => {
    const { phase, board, currentPlayerIndex, diceValue, selectedPosition, validMoves, teams } = gameState;
    const currentPlayer = PLAYER_ORDER[currentPlayerIndex];
    const clickedPiece = board[pos.row][pos.col];

    // 1. SELECT PHASE
    if (phase === 'SELECT') {
      if (!clickedPiece) return;
      if (clickedPiece.owner !== currentPlayer) return;
      if (clickedPiece.isNeutral) return;

      if (!diceValue) return;

      const moves = getValidMoves(board, clickedPiece, pos, diceValue);
      if (moves.length === 0) {
        log("This piece cannot move with the current dice roll.");
        return;
      }

      setGameState(prev => ({
        ...prev,
        selectedPosition: pos,
        validMoves: moves,
        phase: 'MOVE'
      }));
      return;
    }

    // 2. MOVE PHASE
    if (phase === 'MOVE') {
      // If clicking same piece, deselect
      if (selectedPosition && pos.row === selectedPosition.row && pos.col === selectedPosition.col) {
        setGameState(prev => ({ ...prev, phase: 'SELECT', selectedPosition: null, validMoves: [] }));
        return;
      }
      // If clicking another own piece, try to select it instead
      if (clickedPiece && clickedPiece.owner === currentPlayer && !clickedPiece.isNeutral) {
        const moves = getValidMoves(board, clickedPiece, pos, diceValue!);
        if (moves.length > 0) {
          setGameState(prev => ({
            ...prev,
            selectedPosition: pos,
            validMoves: moves,
            phase: 'MOVE'
          }));
          return;
        }
      }

      // Execute Move
      const isValid = validMoves.some(m => m.row === pos.row && m.col === pos.col);
      if (isValid && selectedPosition) {
        executeMove(selectedPosition, pos);
      }
      return;
    }

    // 3. SUMMON PLACEMENT PHASE
    if (phase === 'SUMMON_PLACEMENT') {
      if (clickedPiece) {
        log("Target tile must be empty for summoning.");
        return;
      }
      executeSummon(pos);
    }
  };

  const executeMove = (from: Position, to: Position) => {
    setGameState(prev => {
      const newBoard = cloneBoard(prev.board);
      const movingPiece = newBoard[from.row][from.col]!;
      const targetPiece = newBoard[to.row][to.col];

      let newTeams = { ...prev.teams };
      let newPlayersAlive = [...prev.playersAlive];
      let summonTriggered = false;
      let summonReason = '';
      let winner: 'TEAM_A' | 'TEAM_B' | 'DRAW' | null = null;
      const currentTeamKey = getTeam(movingPiece.owner);

      // Capture Logic
      if (targetPiece) {
        log(`${getPlayerName(movingPiece.owner)} captured ${getPlayerName(targetPiece.owner)}'s ${targetPiece.type}!`);

        // KING KILL
        if (targetPiece.type === PieceType.KING) {
          const victimTeamKey = getTeam(targetPiece.owner);
          newTeams[victimTeamKey].kingsAlive--;

          // Mark victim as dead
          const victimIndex = PLAYER_ORDER.indexOf(targetPiece.owner);
          newPlayersAlive[victimIndex] = false;

          // Turn victim's pieces neutral
          for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
              const p = newBoard[r][c];
              if (p && p.owner === targetPiece.owner) {
                p.isNeutral = true;
              }
            }
          }

          // Check Summon Condition for Killer (Method 1: Kill Opponent King)
          // Condition: Killer's team has exactly 1 king alive AND summons used < 2
          if (newTeams[currentTeamKey].kingsAlive === 1 && newTeams[currentTeamKey].summonsUsed < 2) {
            summonTriggered = true;
            summonReason = 'King Capture';
          }
        }
      }

      // Move Piece
      newBoard[to.row][to.col] = movingPiece;
      newBoard[from.row][from.col] = null;

      // PAWN PROMOTION / SUMMON CHECK (Method 2)
      if (!summonTriggered && movingPiece.type === PieceType.PAWN) {
        const isSummonTile = checkPawnSummon(movingPiece.owner, to);
        if (isSummonTile) {
          if (newTeams[currentTeamKey].kingsAlive === 1 && newTeams[currentTeamKey].summonsUsed < 2) {
            // Check if teammate is dead
            const teammateColor = getTeammateColor(movingPiece.owner);
            const teammateIndex = PLAYER_ORDER.indexOf(teammateColor);

            if (!newPlayersAlive[teammateIndex]) {
              // REVIVAL
              movingPiece.type = PieceType.KING;
              movingPiece.owner = teammateColor; // Reassign to dead teammate
              movingPiece.id = `${teammateColor}-REVIVED-KING-${Date.now()}`;

              revivePlayer(newBoard, newPlayersAlive, teammateColor);
              log(`${getPlayerName(prev.board[from.row][from.col]!.owner)} sacrificed a Pawn to REVIVE ${getPlayerName(teammateColor)}!`);
            } else {
              // Normal Promotion (Unlikely if rule implies 1 King Alive = Summon only for revival, but safe fallback)
              movingPiece.type = PieceType.KING;
              log(`${getPlayerName(movingPiece.owner)}'s Pawn ascended to KING!`);
            }

            newTeams[currentTeamKey].kingsAlive++;
            newTeams[currentTeamKey].summonsUsed++;
          }
        }
      }

      // Win Check
      winner = checkWinCondition(newTeams);

      const newState: GameState = {
        ...prev,
        board: newBoard,
        teams: newTeams,
        playersAlive: newPlayersAlive,
        winner,
        selectedPosition: null,
        validMoves: [],
      };

      if (winner) {
        return newState;
      }

      // If Summon triggered by King Kill (Method 1) -> Enter Placement Phase
      if (summonTriggered) {
        log(`${getPlayerName(movingPiece.owner)} earned a King Summon! Select an empty tile.`);
        return {
          ...newState,
          phase: 'SUMMON_PLACEMENT'
        };
      }

      // Next Turn Logic
      let nextIndex = (prev.currentPlayerIndex + 1) % 4;
      let attempts = 0;
      // Check using newPlayersAlive
      while (!newPlayersAlive[nextIndex] && attempts < 4) {
        nextIndex = (nextIndex + 1) % 4;
        attempts++;
      }

      if (attempts >= 4) {
        return newState;
      }

      return {
        ...newState,
        currentPlayerIndex: nextIndex,
        diceValue: null,
        phase: 'ROLL'
      };
    });
  };

  const executeSummon = (pos: Position) => {
    setGameState(prev => {
      const newBoard = cloneBoard(prev.board);
      const currentPlayer = PLAYER_ORDER[prev.currentPlayerIndex];
      const teamKey = getTeam(currentPlayer);

      const teammateColor = getTeammateColor(currentPlayer);
      const teammateIndex = PLAYER_ORDER.indexOf(teammateColor);
      const newPlayersAlive = [...prev.playersAlive];

      let summonedOwner = currentPlayer;
      let message = `${getPlayerName(currentPlayer)} summoned a new King at [${pos.row}, ${pos.col}]!`;

      // If teammate is dead, summon for them (Revival)
      if (!prev.playersAlive[teammateIndex]) {
        summonedOwner = teammateColor;
        revivePlayer(newBoard, newPlayersAlive, teammateColor);
        message = `${getPlayerName(currentPlayer)} summoned a King to REVIVE ${getPlayerName(teammateColor)}!`;
      }

      // Place King
      newBoard[pos.row][pos.col] = {
        id: `${summonedOwner}-SUMMONED-KING-${Date.now()}`,
        type: PieceType.KING,
        owner: summonedOwner
      };

      const newTeams = { ...prev.teams };
      newTeams[teamKey].kingsAlive++;
      newTeams[teamKey].summonsUsed++;

      log(message);

      // Next Turn Logic (Use updated alive array)
      let nextIndex = (prev.currentPlayerIndex + 1) % 4;
      let attempts = 0;
      while (!newPlayersAlive[nextIndex] && attempts < 4) {
        nextIndex = (nextIndex + 1) % 4;
        attempts++;
      }

      return {
        ...prev,
        board: newBoard,
        teams: newTeams,
        playersAlive: newPlayersAlive, // Update alive state
        phase: 'ROLL',
        currentPlayerIndex: nextIndex,
        diceValue: null
      };
    });
  };

  const restartGame = () => {
    setGameState({
      board: cloneBoard(INITIAL_BOARD),
      currentPlayerIndex: 0,
      diceValue: null,
      phase: 'ROLL',
      selectedPosition: null,
      validMoves: [],
      teams: {
        A: { kingsAlive: 2, summonsUsed: 0 },
        B: { kingsAlive: 2, summonsUsed: 0 },
      },
      playersAlive: [true, true, true, true],
      logs: ['Game Restarted!'],
      winner: null,
      consecutiveNoMoves: 0,
    });
  };

  const getPlayerName = (p: PlayerColor) => {
    switch (p) {
      case PlayerColor.RED: return 'Red';
      case PlayerColor.GREEN: return 'Green';
      case PlayerColor.YELLOW: return 'Yellow';
      case PlayerColor.BLUE: return 'Blue';
    }
  };

  // --- LANDING PAGE RENDER ---
  if (!isGameStarted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden bg-[#0c0a09]">
        {/* Ancient Pattern Overlays */}
        <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,_#2a231d_0%,_#0c0a09_100%)] z-0"></div>
        <div className="fixed inset-0 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/dark-wood.png')] opacity-20 z-0"></div>

        {/* Main Landing Content */}
        <div className="relative z-10 flex flex-col items-center gap-8 p-12 bg-[#1c1917]/90 border-4 border-[#78350f] shadow-[0_0_80px_rgba(0,0,0,0.9)] rounded-sm max-w-2xl w-full text-center">
          {/* Decorative Corners */}
          <div className="absolute top-2 left-2 w-12 h-12 border-t-4 border-l-4 border-amber-600"></div>
          <div className="absolute top-2 right-2 w-12 h-12 border-t-4 border-r-4 border-amber-600"></div>
          <div className="absolute bottom-2 left-2 w-12 h-12 border-b-4 border-l-4 border-amber-600"></div>
          <div className="absolute bottom-2 right-2 w-12 h-12 border-b-4 border-r-4 border-amber-600"></div>

          <div className="mb-4 animate-fade-in">
            <div className="flex justify-center gap-6 mb-6">
              <Crown size={56} className="text-amber-500 drop-shadow-[0_0_10px_rgba(245,158,11,0.6)]" />
              <Swords size={56} className="text-amber-700 drop-shadow-[0_0_10px_rgba(120,53,15,0.6)]" />
            </div>
            <h1 className="text-6xl md:text-8xl font-display text-transparent bg-clip-text bg-gradient-to-b from-amber-100 via-amber-400 to-amber-700 drop-shadow-lg tracking-[0.15em] uppercase leading-tight">
              Chaturanga
            </h1>
            <p className="text-[#a8a29e] font-serif text-2xl mt-4 italic tracking-wide border-b border-[#78350f] pb-6 inline-block">
              The Royal Game of India
            </p>
          </div>

          <div className="space-y-4 max-w-lg mx-auto text-[#d6d3d1] font-serif leading-relaxed text-lg">
            <p>
              Before Chess, there was <span className="text-amber-500 font-bold">Chaturanga</span>.
            </p>
            <p className="text-sm opacity-80 leading-loose">
              Command the four divisions of the ancient army: Infantry, Cavalry, Elephants, and Chariots.
              Forge alliances, roll the dice of fate, and capture the enemy Kings.
            </p>
          </div>

          <button
            onClick={() => setIsGameStarted(true)}
            className="group relative px-16 py-5 bg-[#451a03] hover:bg-[#78350f] text-amber-100 rounded-sm shadow-2xl transition-all duration-300 hover:-translate-y-1 border-2 border-[#ea580c]/50 mt-8 overflow-hidden w-full md:w-auto"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none"></div>

            {/* Button Shine Effect */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%]"></div>

            <div className="relative z-10 flex items-center justify-center gap-4 font-display text-2xl tracking-[0.2em] font-bold">
              <span>ENTER ARENA</span>
              <ArrowRight className="group-hover:translate-x-2 transition-transform duration-300" />
            </div>
          </button>
        </div>

        {/* Footer Credit */}
        <div className="absolute bottom-4 text-[#57534e] text-xs font-serif tracking-widest opacity-60">
          EST. 6TH CENTURY AD
        </div>
      </div>
    );
  }

  // --- GAME RENDER ---
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      {/* Ancient Pattern Overlay */}
      <div className="fixed inset-0 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/dark-wood.png')] opacity-20 z-0"></div>

      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-[250px_auto_350px] gap-8 items-start relative z-10 animate-fade-in-slow">

        {/* Left Panel: Rules Scroll */}
        <div className="hidden lg:flex flex-col gap-4">
          <div className="relative p-6 bg-[#1c1917] rounded-sm border-2 border-[#78350f] shadow-2xl">
            {/* Decorative Corners */}
            <div className="absolute top-1 left-1 w-4 h-4 border-t-2 border-l-2 border-amber-600"></div>
            <div className="absolute top-1 right-1 w-4 h-4 border-t-2 border-r-2 border-amber-600"></div>
            <div className="absolute bottom-1 left-1 w-4 h-4 border-b-2 border-l-2 border-amber-600"></div>
            <div className="absolute bottom-1 right-1 w-4 h-4 border-b-2 border-r-2 border-amber-600"></div>

            <div className="flex items-center gap-2 mb-4 border-b border-[#57534e] pb-2">
              <Scroll className="text-amber-600" />
              <h3 className="font-display font-bold text-amber-500 text-xl">The Rules</h3>
            </div>

            <ul className="text-[#d6d3d1] text-sm space-y-3 font-serif leading-relaxed">
              <li><span className="text-amber-600 font-bold">Teams:</span> Green+Blue vs Yellow+Red.</li>
              <li><span className="text-amber-600 font-bold">Dice:</span> Roll to command your troops.</li>
              <li><span className="text-amber-600 font-bold">1:</span> Boat (Diagonal Jump 2)</li>
              <li><span className="text-amber-600 font-bold">3:</span> Knight (L-Jump)</li>
              <li><span className="text-amber-600 font-bold">4:</span> Elephant (Straight Max 2)</li>
              <li><span className="text-amber-600 font-bold">6:</span> King or Pawn (Step 1)</li>
              <li className="italic text-[#a8a29e] border-t border-[#57534e] pt-2">Kill enemy kings to claim victory. Summon reinforcements by Valor (Kill) or Strategy (Reach Summon Tiles).</li>
            </ul>
          </div>
        </div>

        {/* Center Board */}
        <div className="flex flex-col items-center">
          <Board gameState={gameState} onTileClick={handleTileClick} />
        </div>

        {/* Right Controls */}
        <div className="flex justify-center w-full">
          <Controls gameState={gameState} onRoll={handleRoll} onRestart={restartGame} />
        </div>

      </div>
    </div>
  );
};

export default App;