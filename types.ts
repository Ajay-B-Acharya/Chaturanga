
export enum PlayerColor {
  RED = 'RED',     // Player 4 (Right) - Team B
  GREEN = 'GREEN', // Player 1 (Bottom) - Team A
  YELLOW = 'YELLOW', // Player 2 (Left) - Team B
  BLUE = 'BLUE',    // Player 3 (Top) - Team A
}

export enum PieceType {
  KING = 'KING',
  ROOK = 'ROOK',
  KNIGHT = 'KNIGHT',
  BOAT = 'BOAT',
  PAWN = 'PAWN',
}

export interface Position {
  row: number;
  col: number;
}

export interface Piece {
  id: string;
  type: PieceType;
  owner: PlayerColor;
  isNeutral?: boolean; // If player is eliminated
}

export interface BoardState {
  grid: (Piece | null)[][];
}

export interface TeamStats {
  kingsAlive: number;
  summonsUsed: number;
}

export interface GameState {
  board: (Piece | null)[][];
  currentPlayerIndex: number; // 0=Green, 1=Yellow, 2=Blue, 3=Red
  diceValue: number | null;
  phase: 'ROLL' | 'SELECT' | 'MOVE' | 'SUMMON_PLACEMENT' | 'GAME_OVER';
  selectedPosition: Position | null;
  validMoves: Position[];
  teams: {
    A: TeamStats; // Green & Blue
    B: TeamStats; // Yellow & Red
  };
  playersAlive: boolean[]; // [Green, Yellow, Blue, Red]
  logs: string[];
  winner: 'TEAM_A' | 'TEAM_B' | 'DRAW' | null;
  consecutiveNoMoves: number;
}

export const DICE_VALUES = [1, 3, 4, 6];

// Updated Teams based on Rules:
// Team A: Green & Blue
// Team B: Red & Yellow
export const TEAM_A = [PlayerColor.GREEN, PlayerColor.BLUE];
export const TEAM_B = [PlayerColor.RED, PlayerColor.YELLOW];

// Updated Player Order to alternate teams (Clockwise):
// 1. Green (Bottom) - Team A
// 2. Yellow (Left) - Team B
// 3. Blue (Top) - Team A
// 4. Red (Right) - Team B
export const PLAYER_ORDER = [
  PlayerColor.GREEN, 
  PlayerColor.YELLOW, 
  PlayerColor.BLUE, 
  PlayerColor.RED
];
