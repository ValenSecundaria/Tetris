export type Cell = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7; // 0 vacío, 1..7 piezas
export interface Point { x: number; y: number; }


export interface Piece {
    id: Cell; // 1..7
    matrix: number[][]; // rotación actual 4x4 o 3x3
    x: number; // columna en el tablero
    y: number; // fila en el tablero
    rotationIndex: number; // índice de rotación
}


export interface GameState {
    board: Cell[][];
    score: number;
    level: number;
    lines: number;
    running: boolean;
    gameOver: boolean;
    playerName: string;
}