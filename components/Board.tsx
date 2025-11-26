import React from 'react';
import { GameState, Position, PieceType } from '../types';
import PieceIcon from './PieceIcon';
import { BOARD_SIZE } from '../constants';

interface BoardProps {
  gameState: GameState;
  onTileClick: (pos: Position) => void;
}

const Board: React.FC<BoardProps> = ({ gameState, onTileClick }) => {
  const { board, selectedPosition, validMoves, phase, teams, currentPlayerIndex } = gameState;
  const isSummoning = phase === 'SUMMON_PLACEMENT';

  const renderTile = (row: number, col: number) => {
    const piece = board[row][col];
    const isSelected = selectedPosition?.row === row && selectedPosition?.col === col;
    const isValidMove = validMoves.some(m => m.row === row && m.col === col);
    
    // Ancient Board Colors
    // (0,0) [Top-Left] is Dark in reference
    const isDark = (row + col) % 2 === 0;
    
    // Jade Green and Antique Parchment
    const darkColor = 'bg-[#355e3b]'; // Hunter Green / Jade
    const lightColor = 'bg-[#f0e68c]'; // Khaki / Parchment

    let bgClass = isDark ? darkColor : lightColor;
    let overlayClass = '';

    // Highlight Logic
    if (isSelected) {
        bgClass = 'bg-amber-400';
        overlayClass = 'shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]';
    } else if (isValidMove) {
       if (piece) {
           bgClass = 'bg-red-900'; // Capture target
           overlayClass = 'animate-pulse';
       } else {
           bgClass = 'bg-emerald-300/80'; // Move target (lighter overlay)
       }
    } else if (isSummoning && !piece) {
       bgClass = 'bg-blue-300/50 animate-pulse'; // Summon target
    }

    const isNeutral = piece?.isNeutral;

    return (
      <div
        key={`${row}-${col}`}
        onClick={() => onTileClick({ row, col })}
        className={`
          w-full h-full relative flex items-center justify-center
          ${bgClass} ${overlayClass}
          border border-opacity-20 border-black
          ${(isValidMove || (isSummoning && !piece) || (piece && !isNeutral)) ? 'cursor-pointer hover:brightness-110' : 'cursor-default'}
          transition-all duration-150
        `}
      >
        {/* Valid Move Marker */}
        {isValidMove && !piece && (
           <div className="absolute w-3 h-3 bg-[#1a4d2e] rounded-full opacity-60 shadow-sm"></div>
        )}

        {piece && (
          <div className={`w-[90%] h-[90%] flex items-center justify-center ${isNeutral ? 'opacity-40 grayscale brightness-50' : ''}`}>
             <PieceIcon type={piece.type} owner={piece.owner} />
          </div>
        )}
      </div>
    );
  };

  const colLabels = ['1', '2', '3', '4', '5', '6', '7', '8'];
  const rowLabels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

  return (
    <div className="relative p-4 inline-block rounded-md shadow-[0_20px_50px_rgba(0,0,0,0.7)] bg-[#3e2723] border-[6px] border-[#251610]">
      {/* Metallic/Gold Border Inlay */}
      <div className="absolute inset-0 border-[2px] border-[#8b5a2b] pointer-events-none rounded-sm"></div>
      
      {/* Top Labels */}
      <div className="flex pl-8 pr-8 mb-1">
        {colLabels.map((l) => (
          <div key={l} className="flex-1 text-center font-bold text-[#bcaaa4] font-display text-sm sm:text-base drop-shadow-md">
            {l}
          </div>
        ))}
      </div>

      <div className="flex">
        {/* Left Labels */}
        <div className="flex flex-col w-8 mr-1">
          {rowLabels.map((l) => (
            <div key={l} className="flex-1 flex items-center justify-center font-bold text-[#bcaaa4] font-display text-sm sm:text-base drop-shadow-md">
              {l}
            </div>
          ))}
        </div>

        {/* The Grid Frame */}
        <div className="relative p-1 bg-[#251610] shadow-inner">
            <div className="grid grid-cols-8 gap-0 w-[320px] h-[320px] sm:w-[480px] sm:h-[480px] md:w-[600px] md:h-[600px] border-2 border-[#1a100c]">
            {Array.from({ length: BOARD_SIZE }).map((_, row) =>
                Array.from({ length: BOARD_SIZE }).map((_, col) => renderTile(row, col))
            )}
            </div>
        </div>

        {/* Right Labels */}
        <div className="flex flex-col w-8 ml-1">
          {rowLabels.map((l) => (
            <div key={l} className="flex-1 flex items-center justify-center font-bold text-[#bcaaa4] font-display text-sm sm:text-base drop-shadow-md">
              {l}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Labels */}
      <div className="flex pl-8 pr-8 mt-1">
        {colLabels.map((l) => (
          <div key={l} className="flex-1 text-center font-bold text-[#bcaaa4] font-display text-sm sm:text-base drop-shadow-md">
            {l}
          </div>
        ))}
      </div>
      
      {/* Engraved Name */}
      <div className="absolute top-2 left-4 text-[10px] text-[#5d4037] font-display tracking-[0.2em] opacity-80 pointer-events-none">
        ANCIENT ARENA
      </div>
    </div>
  );
};

export default Board;