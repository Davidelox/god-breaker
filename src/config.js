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
// El disparo sale desde la línea de derrota (arriba de la última fila). Las bolas vuelven a esa línea.
export const LAUNCH_Y = BOARD_TOP + (ROWS - 1) * CELL;

// Bolas
export const BALL_R = 6;
export const WATER_BALL_R = BALL_R + 2; // bolas algo más grandes con el especial de agua
export const BALL_TEXTURE_R = 4; // radio del sprite 'ball' (8x8 px); se escala según el radio real
export const SPAWN_ROW = 1; // la fila 0 (arriba del todo) siempre queda vacía
export const BALL_SPEED = 620;
export const START_BALLS = 1;
export const LAUNCH_DELAY = 95; // ms entre bolas: separación visible (~60 px) en lugar de una línea
export const SPEEDS = [1, 1.5, 2, 3, 4]; // velocidades del botón de velocidad
export const CORNER_JITTER = (14 * Math.PI) / 180; // desvío máximo al chocar justo en una esquina
export const VERTICAL_LOCK_CHANCE = 0.02; // en un golpe de esquina, la bola sale en vertical pura

// Contenido
export const CREATURE_CHANCE = 0.15;
export const BOSS_EVERY = 8; // un legendario cada 10 turnos
export const SHINY_RATE = params.has('shiny') ? 0.25 : 0.01; // probabilidad base de shiny
export const SHINY_BOOST_RATE = 0.03; // con el medidor shiny lleno
export const SHINY_BOOST_TURNS = 3;
export const SHINY_METER_MAX = 100;
// Lo que suma al medidor shiny
export const SHINY_GAIN = { perKillOver3: 8, legendary: 35, clear: 40 };
export const MAX_POWERS = 2; // poderes que se pueden guardar

// Dificultad (ajustable)
export const HP_PER_TURN = 1.3; // vida de los bloques nuevos = turno x esto (todos iguales)
export const CREATURE_HP_BONUS = 0.12; // criaturas: +12 % de vida...
export const CREATURE_HP_PER_RARITY = 0.02; // ...y +2 % por cada nivel de rareza por encima de común
export const BALLS_PER_TURN = 1; // munición que se gana automáticamente cada ronda
export const PICKUP_CHANCE = 0.5; // probabilidad de que salga una bola extra +1 cuando está permitido
export const PICKUP_COOLDOWN = 2; // tiradas que deben pasar tras recoger la bola extra antes de que salga otra
export const ROW_GROWTH_TURNS = 5; // cada cuántos turnos cabe un bloque más por fila
export const BOSS_HP = (turn) => 20 + turn * 8;
export const RARITY_NAMES = { 1: 'Común', 2: 'Poco común', 3: 'Rara', 4: 'Legendaria' };

export const DEBUG = params.has('debug');
