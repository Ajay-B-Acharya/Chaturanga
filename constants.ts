import { Piece, PieceType, PlayerColor } from './types';

export const BOARD_SIZE = 8;

export const INITIAL_BOARD: (Piece | null)[][] = Array(8).fill(null).map(() => Array(8).fill(null));

// Helper to place pieces
const place = (row: number, col: number, type: PieceType, owner: PlayerColor, grid: (Piece | null)[][]) => {
  grid[row][col] = {
    id: `${owner}-${type}-${row}-${col}`,
    type,
    owner,
  };
};

// --- CHATURAJI (4-Corner) SETUP ---
// Matches the provided image layout.
// Order from Corner inward: Boat, Knight, Rook, King.

// YELLOW (Top-Left Corner, Vertical)
// Main pieces at Col 0, Rows 0-3. Order Top->Down: Boat, Knight, Rook, King
place(0, 0, PieceType.BOAT, PlayerColor.YELLOW, INITIAL_BOARD);
place(1, 0, PieceType.KNIGHT, PlayerColor.YELLOW, INITIAL_BOARD);
place(2, 0, PieceType.ROOK, PlayerColor.YELLOW, INITIAL_BOARD);
place(3, 0, PieceType.KING, PlayerColor.YELLOW, INITIAL_BOARD);
// Pawns at Col 1
[0, 1, 2, 3].forEach(r => place(r, 1, PieceType.PAWN, PlayerColor.YELLOW, INITIAL_BOARD));

// BLUE (Top-Right Corner, Horizontal)
// Main pieces at Row 0, Cols 7-4. Order Right->Left: Boat, Knight, Rook, King
place(0, 7, PieceType.BOAT, PlayerColor.BLUE, INITIAL_BOARD);
place(0, 6, PieceType.KNIGHT, PlayerColor.BLUE, INITIAL_BOARD);
place(0, 5, PieceType.ROOK, PlayerColor.BLUE, INITIAL_BOARD);
place(0, 4, PieceType.KING, PlayerColor.BLUE, INITIAL_BOARD);
// Pawns at Row 1
[7, 6, 5, 4].forEach(c => place(1, c, PieceType.PAWN, PlayerColor.BLUE, INITIAL_BOARD));

// RED (Bottom-Right Corner, Vertical)
// Main pieces at Col 7, Rows 7-4. Order Bottom->Top: Boat, Knight, Rook, King
place(7, 7, PieceType.BOAT, PlayerColor.RED, INITIAL_BOARD);
place(6, 7, PieceType.KNIGHT, PlayerColor.RED, INITIAL_BOARD);
place(5, 7, PieceType.ROOK, PlayerColor.RED, INITIAL_BOARD);
place(4, 7, PieceType.KING, PlayerColor.RED, INITIAL_BOARD);
// Pawns at Col 6
[7, 6, 5, 4].forEach(r => place(r, 6, PieceType.PAWN, PlayerColor.RED, INITIAL_BOARD));

// GREEN (Bottom-Left Corner, Horizontal)
// Main pieces at Row 7, Cols 0-3. Order Left->Right: Boat, Knight, Rook, King
place(7, 0, PieceType.BOAT, PlayerColor.GREEN, INITIAL_BOARD);
place(7, 1, PieceType.KNIGHT, PlayerColor.GREEN, INITIAL_BOARD);
place(7, 2, PieceType.ROOK, PlayerColor.GREEN, INITIAL_BOARD);
place(7, 3, PieceType.KING, PlayerColor.GREEN, INITIAL_BOARD);
// Pawns at Row 6
[0, 1, 2, 3].forEach(c => place(6, c, PieceType.PAWN, PlayerColor.GREEN, INITIAL_BOARD));


export const SUMMON_TILES: Record<PlayerColor, {row: number, col: number}[]> = {
  [PlayerColor.YELLOW]: [
    // Own Back Rank (Col 0, Rows 0-3)
    { row: 0, col: 0 }, { row: 1, col: 0 }, { row: 2, col: 0 }, { row: 3, col: 0 },
    // Enemy (Red) Back Rank (Col 7, Rows 4-7)
    { row: 4, col: 7 }, { row: 5, col: 7 }, { row: 6, col: 7 }, { row: 7, col: 7 },
  ],
  [PlayerColor.BLUE]: [
    // Own Back Rank (Row 0, Cols 4-7)
    { row: 0, col: 4 }, { row: 0, col: 5 }, { row: 0, col: 6 }, { row: 0, col: 7 },
    // Enemy (Green) Back Rank (Row 7, Cols 0-3)
    { row: 7, col: 0 }, { row: 7, col: 1 }, { row: 7, col: 2 }, { row: 7, col: 3 },
  ],
  [PlayerColor.RED]: [
    // Own Back Rank (Col 7, Rows 4-7)
    { row: 4, col: 7 }, { row: 5, col: 7 }, { row: 6, col: 7 }, { row: 7, col: 7 },
    // Enemy (Yellow) Back Rank (Col 0, Rows 0-3)
    { row: 0, col: 0 }, { row: 1, col: 0 }, { row: 2, col: 0 }, { row: 3, col: 0 },
  ],
  [PlayerColor.GREEN]: [
    // Own Back Rank (Row 7, Cols 0-3)
    { row: 7, col: 0 }, { row: 7, col: 1 }, { row: 7, col: 2 }, { row: 7, col: 3 },
    // Enemy (Blue) Back Rank (Row 0, Cols 4-7)
    { row: 0, col: 4 }, { row: 0, col: 5 }, { row: 0, col: 6 }, { row: 0, col: 7 },
  ],
};