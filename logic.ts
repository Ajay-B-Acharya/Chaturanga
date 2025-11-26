import { BOARD_SIZE, SUMMON_TILES } from './constants';
import { BoardState, Piece, PieceType, PlayerColor, Position, TEAM_A, TEAM_B } from './types';

// Helper: Check if position is on board
const isOnBoard = (pos: Position) => pos.row >= 0 && pos.row < BOARD_SIZE && pos.col >= 0 && pos.col < BOARD_SIZE;

// Helper: Get team for player
export const getTeam = (color: PlayerColor) => TEAM_A.includes(color) ? 'A' : 'B';

// Helper: Get teammate color
export const getTeammateColor = (color: PlayerColor): PlayerColor => {
  if (color === PlayerColor.GREEN) return PlayerColor.BLUE;
  if (color === PlayerColor.BLUE) return PlayerColor.GREEN;
  if (color === PlayerColor.RED) return PlayerColor.YELLOW;
  return PlayerColor.RED; // YELLOW -> RED
};

// Helper: Check if two pieces are teammates
const isTeammate = (p1: PlayerColor, p2: PlayerColor) => getTeam(p1) === getTeam(p2);

// Helper: Check Piece Category
// Lower: Pawn, Boat
// Higher: King, Rook, Knight
const isLowerCategory = (type: PieceType) => type === PieceType.PAWN || type === PieceType.BOAT;
const isHigherCategory = (type: PieceType) => !isLowerCategory(type);

// Calculate Moves
export const getValidMoves = (
  board: (Piece | null)[][],
  piece: Piece,
  pos: Position,
  diceValue: number
): Position[] => {
  const moves: Position[] = [];
  const { row, col } = pos;

  // Dice Constraint Check
  let allowedTypes: PieceType[] = [];
  if (diceValue === 1) allowedTypes = [PieceType.BOAT];
  else if (diceValue === 3) allowedTypes = [PieceType.KNIGHT];
  else if (diceValue === 4) allowedTypes = [PieceType.ROOK];
  else if (diceValue === 6) allowedTypes = [PieceType.KING, PieceType.PAWN];

  if (!allowedTypes.includes(piece.type)) return [];
  if (piece.isNeutral) return []; // Neutral pieces (eliminated players) cannot move

  // Movement Logic
  const tryAddMove = (r: number, c: number) => {
    const targetPos = { row: r, col: c };
    if (!isOnBoard(targetPos)) return;

    const targetPiece = board[r][c];

    // Collision logic
    if (targetPiece) {
      // RULE: Lower Category pieces cannot capture Higher Category pieces
      if (isLowerCategory(piece.type) && isHigherCategory(targetPiece.type)) {
        return; 
      }

      // Cannot capture own KING (Teammate King protection)
      if (targetPiece.type === PieceType.KING && isTeammate(piece.owner, targetPiece.owner)) {
        return;
      }
      // Can capture anyone else (including teammates if not King)
      // Exception: Cannot capture own self (obviously)
      if (targetPiece.owner === piece.owner && targetPiece.type === piece.type && r === row && c === col) return;
    }

    moves.push(targetPos);
  };

  switch (piece.type) {
    case PieceType.PAWN: {
      // Forward direction depends on player orientation in 4-Corner Setup
      let dRow = 0;
      let dCol = 0;
      
      if (piece.owner === PlayerColor.GREEN) dRow = -1;      // Green (Bottom) moves UP
      else if (piece.owner === PlayerColor.BLUE) dRow = 1;   // Blue (Top) moves DOWN
      else if (piece.owner === PlayerColor.RED) dCol = -1;   // Red (Right) moves LEFT
      else if (piece.owner === PlayerColor.YELLOW) dCol = 1; // Yellow (Left) moves RIGHT

      // Move Forward 1 (Non-capture)
      const fwdR = row + dRow;
      const fwdC = col + dCol;
      if (isOnBoard({ row: fwdR, col: fwdC }) && !board[fwdR][fwdC]) {
        moves.push({ row: fwdR, col: fwdC });
      }

      // Capture Diagonals
      const diags = [];
      if (dRow !== 0) { diags.push({ r: row + dRow, c: col - 1 }, { r: row + dRow, c: col + 1 }); }
      if (dCol !== 0) { diags.push({ r: row - 1, c: col + dCol }, { r: row + 1, c: col + dCol }); }

      diags.forEach(d => {
        if (isOnBoard({ row: d.r, col: d.c })) {
          const t = board[d.r][d.c];
          // Pawn captures only enemies or teammates (not empty space)
          if (t) {
             // RULE: Lower Category (Pawn) cannot capture Higher Category pieces
             if (isHigherCategory(t.type)) return;

             if (!(t.type === PieceType.KING && isTeammate(piece.owner, t.owner))) {
                 moves.push({ row: d.r, col: d.c });
             }
          }
        }
      });
      break;
    }

    case PieceType.KING: {
      // 1 square any direction
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          tryAddMove(row + dr, col + dc);
        }
      }
      break;
    }

    case PieceType.KNIGHT: {
      // L shape, jumps
      const jumps = [
        { r: -2, c: -1 }, { r: -2, c: 1 },
        { r: -1, c: -2 }, { r: -1, c: 2 },
        { r: 1, c: -2 }, { r: 1, c: 2 },
        { r: 2, c: -1 }, { r: 2, c: 1 },
      ];
      jumps.forEach(j => tryAddMove(row + j.r, col + j.c));
      break;
    }

    case PieceType.BOAT: {
      // Diagonal 1 or 2 squares
      // Jumps allowed if moving 2 squares (does not check intermediate square)
      const movesList = [
        // 1 Step
        { r: -1, c: -1 }, { r: -1, c: 1 }, { r: 1, c: -1 }, { r: 1, c: 1 },
        // 2 Steps
        { r: -2, c: -2 }, { r: -2, c: 2 }, { r: 2, c: -2 }, { r: 2, c: 2 }
      ];
      movesList.forEach(m => tryAddMove(row + m.r, col + m.c));
      break;
    }

    case PieceType.ROOK: {
      // Orthogonal, 1 or 2 squares (Elephant)
      // Jumps allowed (does not stop at obstacles)
      const dirs = [{ r: 0, c: 1 }, { r: 0, c: -1 }, { r: 1, c: 0 }, { r: -1, c: 0 }];
      dirs.forEach(d => {
         // 1 Step
         tryAddMove(row + d.r, col + d.c);
         // 2 Steps
         tryAddMove(row + d.r * 2, col + d.c * 2);
      });
      break;
    }
  }

  return moves;
};

// Check if a move results in a Pawn summoning a King
export const checkPawnSummon = (
  player: PlayerColor, 
  targetPos: Position
): boolean => {
  const tiles = SUMMON_TILES[player];
  return tiles.some(t => t.row === targetPos.row && t.col === targetPos.col);
};