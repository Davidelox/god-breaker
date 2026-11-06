// Constantes del juego. Resolución lógica vertical pensada para móvil.
const params = new URLSearchParams(globalThis.location?.search ?? '');

export const W = 360;
export const H = 640;
export const FONT = '"Press Start 2P", monospace';

// Tablero
export const COLS = 7;
export const ROWS = 10; // si un bloque llega a la última fila, fin de la partida
export const CELL = 48;
export const BOARD_X = (W - COLS * CELL) / 2;
export const BOARD_TOP = 64;
export const BOARD_BOTTOM = BOARD_TOP + ROWS * CELL;
export const BOARD_RIGHT = BOARD_X + COLS * CELL;
export const LAUNCH_Y = BOARD_BOTTOM + 12;

// Bolas
export const BALL_R = 4;
export const BALL_SPEED = 620;
export const START_BALLS = 3;
export const LAUNCH_DELAY = 55;

// Contenido
export const CREATURE_CHANCE = 0.3;
export const BOSS_EVERY = params.has('boss') ? 3 : 10;
export const SHINY_RATE = params.has('shiny') ? 0.25 : 1 / 256;
export const CAPTURE_CHANCE = { 1: 0.6, 2: 0.4, 3: 0.25, 4: 0.15 };
export const RARITY_NAMES = { 1: 'Común', 2: 'Poco común', 3: 'Rara', 4: 'Legendaria' };

export const DEBUG = params.has('debug');
