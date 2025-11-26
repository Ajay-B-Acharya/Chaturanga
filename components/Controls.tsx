import React from 'react';
import { GameState, PlayerColor, DICE_VALUES, TEAM_A, TEAM_B } from '../types';
import { Dices, RefreshCw, Trophy, Crown, Skull } from 'lucide-react';

interface ControlsProps {
  gameState: GameState;
  onRoll: () => void;
  onRestart: () => void;
}

const Controls: React.FC<ControlsProps> = ({ gameState, onRoll, onRestart }) => {
  const { currentPlayerIndex, diceValue, phase, teams, playersAlive, logs, winner } = gameState;
  const currentPlayer = [PlayerColor.GREEN, PlayerColor.YELLOW, PlayerColor.BLUE, PlayerColor.RED][currentPlayerIndex];
  
  const getPlayerName = (p: PlayerColor) => {
    switch (p) {
      case PlayerColor.RED: return 'RED (Right)';
      case PlayerColor.GREEN: return 'GREEN (Bottom)';
      case PlayerColor.YELLOW: return 'YELLOW (Left)';
      case PlayerColor.BLUE: return 'BLUE (Top)';
    }
  };

  const getTeamColor = (p: PlayerColor) => {
    return TEAM_A.includes(p) ? 'text-emerald-500 drop-shadow-md' : 'text-amber-500 drop-shadow-md';
  };

  const DiceIcon = ({ val }: { val: number }) => (
    <div className="w-20 h-20 bg-[#292524] rounded-lg flex items-center justify-center shadow-[inset_0_2px_4px_rgba(0,0,0,0.8),0_4px_8px_rgba(0,0,0,0.5)] border border-[#78350f] relative overflow-hidden group">
      {/* Marble Texture Effect */}
      <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')]"></div>
      <span className="text-5xl font-black text-[#e7e5e4] font-display z-10">{val}</span>
    </div>
  );

  return (
    <div className="flex flex-col h-full gap-5 w-full max-w-md">
      
      {/* Header Panel / Tablet */}
      <div className="bg-[#1c1917] p-1 rounded-sm shadow-xl border-2 border-[#57534e]">
         <div className="bg-[#292524] p-4 border border-[#44403c] flex flex-col items-center">
            <h2 className="text-2xl font-display text-[#d4d4d4] mb-3 border-b-2 border-[#78350f] w-full text-center pb-2 tracking-widest">
                {winner ? 'VICTORY' : 'COMMAND'}
            </h2>
            
            {!winner && (
            <div className="flex items-center justify-between w-full px-2 mt-2">
                <div className="flex flex-col items-center">
                    <span className="text-[10px] text-[#a8a29e] uppercase tracking-widest mb-1">Current Turn</span>
                    <span className={`text-xl font-bold font-display ${getTeamColor(currentPlayer)}`}>
                    {getPlayerName(currentPlayer)}
                    </span>
                </div>
                <div className="h-10 w-px bg-gradient-to-b from-transparent via-[#78350f] to-transparent"></div>
                <div className="flex flex-col items-center">
                    <span className="text-[10px] text-[#a8a29e] uppercase tracking-widest mb-1">Phase</span>
                    <span className="text-lg font-bold text-[#e7e5e4] font-serif italic">
                        {phase === 'ROLL' ? 'Fate\'s Roll' : 
                        phase === 'SELECT' ? 'Strategize' :
                        phase === 'MOVE' ? 'Advance' :
                        phase === 'SUMMON_PLACEMENT' ? 'Resurrect' : 'Wait'}
                    </span>
                </div>
            </div>
            )}
         </div>
      </div>

      {/* Main Action Area */}
      <div className="flex-1 bg-[#1c1917] p-1 rounded-sm shadow-xl border-2 border-[#57534e] min-h-[220px]">
        <div className="h-full bg-[#0c0a09] p-6 border border-[#44403c] flex flex-col items-center justify-center relative overflow-hidden">
             {/* Background Glow */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-amber-900/20 blur-3xl pointer-events-none"></div>

            {winner ? (
                <div className="text-center z-10">
                    <Trophy size={64} className="mx-auto text-amber-500 mb-4 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]" />
                    <h3 className="text-3xl font-display text-white mb-2 tracking-widest">{winner.replace('_', ' ')}</h3>
                    <div className="text-sm text-gray-400 font-serif italic mb-6">Glory to the victors</div>
                    <button 
                    onClick={onRestart}
                    className="px-8 py-3 bg-[#1a4d2e] hover:bg-[#14532d] border border-[#4ade80]/30 text-emerald-100 rounded-sm font-bold font-display flex items-center gap-2 mx-auto transition-all hover:shadow-[0_0_15px_rgba(74,222,128,0.3)]"
                    >
                    <RefreshCw size={18} /> NEW ERA
                    </button>
                </div>
            ) : (
                <>
                    {phase === 'ROLL' ? (
                    <button
                        onClick={onRoll}
                        className="group relative px-10 py-5 bg-[#7c2d12] hover:bg-[#9a3412] text-amber-100 rounded-sm shadow-lg transform transition-all hover:-translate-y-1 border border-orange-900/50"
                    >
                        {/* Button Shine */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
                        <div className="flex items-center gap-4 relative z-10">
                        <Dices size={36} className="text-amber-400 group-hover:rotate-180 transition-transform duration-700" />
                        <span className="text-2xl font-bold font-display tracking-widest text-shadow">CAST DICE</span>
                        </div>
                    </button>
                    ) : (
                    <div className="flex flex-col items-center gap-4 z-10">
                        <div className="flex items-center gap-6">
                            <div className="text-right">
                                <span className="block text-[#a8a29e] uppercase text-[10px] tracking-widest">Oracle Says</span>
                                <span className="text-amber-500 font-display text-xl">
                                    {diceValue === 1 && "The Boat"}
                                    {diceValue === 3 && "The Horse"}
                                    {diceValue === 4 && "The Elephant"}
                                    {diceValue === 6 && "The King"}
                                </span>
                            </div>
                            {diceValue && <DiceIcon val={diceValue} />}
                        </div>
                        
                        <div className="text-sm text-[#d6d3d1] text-center px-4 font-serif italic border-t border-[#44403c] pt-3 mt-1 w-full">
                            {diceValue === 1 && "The Boat may sail (1 or 2 Diagonal)"}
                            {diceValue === 3 && "The Knight may leap (L-Shape)"}
                            {diceValue === 4 && "The Elephant may charge (Straight 1 or 2)"}
                            {diceValue === 6 && "The King or Pawn may step (1 Tile)"}
                        </div>
                        
                        {phase === 'SUMMON_PLACEMENT' && (
                            <div className="mt-2 text-blue-300 font-bold animate-pulse text-center font-display tracking-wide drop-shadow-md">
                                SELECT SACRED GROUND TO SUMMON
                            </div>
                        )}
                    </div>
                    )}
                </>
            )}
        </div>
      </div>

      {/* Stats Tablets */}
      <div className="grid grid-cols-2 gap-4">
          {/* Team A Tablet */}
          <div className="bg-[#1c1917] p-3 rounded-sm border border-[#064e3b] shadow-md relative overflow-hidden">
             <div className="absolute top-0 right-0 p-1 opacity-10"><Crown size={48} /></div>
             <h4 className="text-emerald-500 font-display font-bold text-sm mb-3 border-b border-[#064e3b] pb-1 tracking-wider">TEAM A</h4>
             <div className="flex justify-between text-xs text-[#a8a29e] mb-1 font-serif">
                 <span>Kings Alive</span> <span className="text-[#e7e5e4] text-lg leading-none font-display">{teams.A.kingsAlive}</span>
             </div>
             <div className="flex justify-between text-xs text-[#a8a29e] font-serif">
                 <span>Summons</span> <span className="text-[#e7e5e4] font-mono">{teams.A.summonsUsed}/2</span>
             </div>
             <div className="mt-3 flex gap-2 justify-center">
                 <div className={`w-2 h-2 rotate-45 ${playersAlive[0] ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-[#44403c]'}`}></div>
                 <div className={`w-2 h-2 rotate-45 ${playersAlive[2] ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]' : 'bg-[#44403c]'}`}></div>
             </div>
          </div>

          {/* Team B Tablet */}
          <div className="bg-[#1c1917] p-3 rounded-sm border border-[#78350f] shadow-md relative overflow-hidden">
             <div className="absolute top-0 right-0 p-1 opacity-10"><Skull size={48} /></div>
             <h4 className="text-amber-500 font-display font-bold text-sm mb-3 border-b border-[#78350f] pb-1 tracking-wider">TEAM B</h4>
             <div className="flex justify-between text-xs text-[#a8a29e] mb-1 font-serif">
                 <span>Kings Alive</span> <span className="text-[#e7e5e4] text-lg leading-none font-display">{teams.B.kingsAlive}</span>
             </div>
             <div className="flex justify-between text-xs text-[#a8a29e] font-serif">
                 <span>Summons</span> <span className="text-[#e7e5e4] font-mono">{teams.B.summonsUsed}/2</span>
             </div>
             <div className="mt-3 flex gap-2 justify-center">
                 <div className={`w-2 h-2 rotate-45 ${playersAlive[1] ? 'bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.8)]' : 'bg-[#44403c]'}`}></div>
                 <div className={`w-2 h-2 rotate-45 ${playersAlive[3] ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]' : 'bg-[#44403c]'}`}></div>
             </div>
          </div>
      </div>

      {/* Ancient Log Scroll */}
      <div className="bg-[#1c1917] rounded-sm p-1 border border-[#57534e] shadow-inner h-36">
        <div className="h-full bg-[#0f0e0d] p-2 overflow-y-auto font-serif text-xs text-[#d6d3d1] italic leading-loose">
            {logs.length === 0 && <span className="text-[#57534e]">The chronicles begin...</span>}
            {logs.slice().reverse().map((log, i) => (
                <div key={i} className="mb-1 border-b border-[#292524] pb-1 last:border-0">
                    <span className="text-[#78350f] font-bold mr-1">›</span> {log}
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default Controls;