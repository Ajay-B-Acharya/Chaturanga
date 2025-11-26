import React from 'react';
import { PieceType, PlayerColor } from '../types';

interface PieceIconProps {
  type: PieceType;
  owner: PlayerColor;
  className?: string;
}

const PieceIcon: React.FC<PieceIconProps> = ({ type, owner, className }) => {
  const getColorClasses = (owner: PlayerColor) => {
    // Colors tuned for a "Painted Stone/Ivory" aesthetic
    // Using slightly desaturated but rich pigments with strong drop shadows
    switch (owner) {
      // RED: Cinnabar / Red Lacquer
      case PlayerColor.RED: return 'text-[#e11d48] drop-shadow-[1px_2px_2px_rgba(0,0,0,0.9)]';
      
      // GREEN: Jade / Emerald
      case PlayerColor.GREEN: return 'text-[#10b981] drop-shadow-[1px_2px_2px_rgba(0,0,0,0.9)]';
      
      // YELLOW: Gold Leaf / Saffron
      case PlayerColor.YELLOW: return 'text-[#fbbf24] drop-shadow-[1px_2px_2px_rgba(0,0,0,0.9)]';
      
      // BLUE: Lapis Lazuli
      case PlayerColor.BLUE: return 'text-[#0ea5e9] drop-shadow-[1px_2px_2px_rgba(0,0,0,0.9)]';
      
      default: return 'text-gray-500';
    }
  };

  const AncientIcon = () => {
     // Intricate "Carved" SVG paths
     switch (type) {
      case PieceType.KING: 
        // RAJAH (Turban/Crown)
        return (
          <svg viewBox="0 0 100 100" fill="currentColor" className="w-[85%] h-[85%] filter drop-shadow-sm">
             {/* Base */}
             <path d="M20,80 Q50,95 80,80 L80,75 Q50,90 20,75 Z" opacity="0.9" />
             {/* Turban Folds */}
             <path d="M15,75 Q10,50 30,35 Q50,20 70,35 Q90,50 85,75 Q50,90 15,75" />
             <path d="M30,35 Q50,45 70,35" stroke="currentColor" strokeWidth="2" fill="none" strokeOpacity="0.3" />
             <path d="M25,55 Q50,65 75,55" stroke="currentColor" strokeWidth="2" fill="none" strokeOpacity="0.3" />
             {/* Central Jewel/Ornament */}
             <path d="M45,20 L50,10 L55,20 L50,30 Z" fill="currentColor" />
             <circle cx="50" cy="50" r="4" fill="rgba(0,0,0,0.3)" />
          </svg>
        );
      
      case PieceType.ROOK: 
        // GAJA (Elephant)
        return (
           <svg viewBox="0 0 100 100" fill="currentColor" className="w-[90%] h-[90%] filter drop-shadow-sm">
               {/* Body/Head */}
               <path d="M70,40 Q85,40 90,55 T80,85 L70,85 L70,60 L30,60 L30,85 L20,85 Q10,85 10,60 Q10,30 40,25 Q60,20 70,40" />
               {/* Trunk */}
               <path d="M90,55 Q95,70 85,80" stroke="currentColor" strokeWidth="6" fill="none" strokeLinecap="round" />
               {/* Ear */}
               <path d="M55,35 Q75,35 70,55 Q60,65 50,55 Z" opacity="0.8" />
               {/* Howdah (Tower on back) */}
               <path d="M30,25 L35,10 L55,10 L60,25 Z" fill="currentColor" opacity="0.9" />
               <rect x="38" y="12" width="14" height="10" fill="rgba(0,0,0,0.2)" />
               {/* Eye */}
               <circle cx="75" cy="45" r="2" fill="rgba(0,0,0,0.5)" />
           </svg>
        );
      
      case PieceType.KNIGHT: 
        // ASHVA (Horse)
        return (
            <svg viewBox="0 0 100 100" fill="currentColor" className="w-[85%] h-[85%] filter drop-shadow-sm">
                {/* Neck Base */}
                <path d="M30,85 L70,85 L75,70 Q50,75 40,50 L30,85" />
                {/* Head */}
                <path d="M40,50 Q30,20 50,15 Q60,10 75,25 Q85,35 75,50 Q70,60 65,55 Q60,50 65,45 Q70,40 60,35 Q50,30 45,50 Z" />
                {/* Mane */}
                <path d="M42,20 Q35,30 38,45" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.8" />
                <path d="M45,15 Q38,25 42,40" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.8" />
                {/* Eye */}
                <circle cx="60" cy="30" r="2" fill="rgba(0,0,0,0.5)" />
            </svg>
        );

      case PieceType.BOAT: 
        // NAUKA (Ship)
        return (
            <svg viewBox="0 0 100 100" fill="currentColor" className="w-[90%] h-[90%] filter drop-shadow-sm">
                 {/* Hull */}
                 <path d="M10,65 Q50,90 90,65 L85,60 Q50,80 15,60 Z" />
                 {/* Mast */}
                 <rect x="48" y="25" width="4" height="40" rx="1" />
                 {/* Sail */}
                 <path d="M52,25 Q80,40 52,55 Z" opacity="0.9" />
                 <path d="M48,28 Q20,40 48,52 Z" opacity="0.7" />
                 {/* Flag */}
                 <path d="M48,15 L60,20 L48,25 Z" />
            </svg>
        );
      
      case PieceType.PAWN: 
        // PADATI (Soldier/Helmet)
        return (
            <svg viewBox="0 0 100 100" fill="currentColor" className="w-[80%] h-[80%] filter drop-shadow-sm">
                {/* Base */}
                <ellipse cx="50" cy="80" rx="25" ry="10" />
                {/* Body */}
                <path d="M35,75 Q50,15 65,75 Z" />
                {/* Head/Helmet */}
                <circle cx="50" cy="35" r="18" />
                {/* Spike */}
                <path d="M50,17 L50,5" stroke="currentColor" strokeWidth="4" />
                {/* Shield Detail (Carving) */}
                <path d="M40,35 Q50,45 60,35" stroke="rgba(0,0,0,0.3)" strokeWidth="2" fill="none" />
            </svg>
        );
    }
  };

  return (
    <div className={`${getColorClasses(owner)} ${className || ''} flex items-center justify-center w-full h-full transition-transform duration-300 transform hover:scale-110 drop-shadow-2xl`}>
      {/* Inner "Carving" Highlight Effect */}
      <div className="relative w-full h-full flex items-center justify-center">
         <AncientIcon />
         {/* Texture Overlay for Stone feel */}
         <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-black/10 mix-blend-overlay pointer-events-none rounded-full mask-image-icon"></div>
      </div>
    </div>
  );
};

export default PieceIcon;