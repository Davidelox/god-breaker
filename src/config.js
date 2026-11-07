// Constantes del juego. Resolución lógica vertical pensada para móvil.
const params = new URLSearchParams(globalThis.location?.search ?? '');

// Tamaño lógico. La maqueta base es 360x640 (9:16). En el móvil el lienzo ocupa toda la pantalla,
// también la zona de la hora y la de la barra de inicio, sin franjas: se calcula un ancho (W) y un
// alto total (FULL_H) con la misma proporción que la pantalla. El contenido se coloca en la zona
// segura: H es el alto útil (sin SAFE_TOP arriba ni SAFE_BOTTOM abajo) y las escenas desplazan la
// cámara SAFE_TOP hacia abajo (ver fitCamera en gfx/ui.js). En escritorio todo queda en 360x640.
// El tablero mide siempre lo mismo: el alto extra se reparte entre el menú superior (HUD_EXTRA)
// y el inferior (BOTTOM_EXTRA) de la partida.
export const BASE_W = 360;
export const BASE_H = 640;
/** Zona segura (muesca / isla y barra de inicio) en px de CSS, según env(safe-area-inset-*). */
export function measureSafeArea() {
  const doc = globalThis.document;
  if (!doc?.body) return { top: 0, bottom: 0 };
  const probe = doc.createElement('div');
  probe.style.cssText = 'position:fixed;left:0;top:0;visibility:hidden;padding-top:env(safe-area-inset-top);padding-bottom:env(safe-area-inset-bottom)';
  doc.body.appendChild(probe);
  const cs = getComputedStyle(probe);
  const top = parseFloat(cs.paddingTop) || 0, bottom = parseFloat(cs.paddingBottom) || 0;
  probe.remove();
  return { top, bottom };
}

/** ¿Es un iPhone con el juego abierto desde el icono de la pantalla de inicio? */
export function iosHomeScreenApp() {
  const nav = globalThis.navigator;
  if (!/iPhone|iPod/.test(nav?.userAgent ?? '')) return false;
  const mm = (q) => !!globalThis.matchMedia?.(q).matches;
  return !!nav.standalone || mm('(display-mode: standalone)') || mm('(display-mode: fullscreen)');
}

function screenInfo() {
  const desktop = { mobile: false };
  try {
    const doc = globalThis.document;
    if (!doc) return desktop;
    const el = doc.getElementById('game');
    const w = el?.clientWidth || globalThis.innerWidth, h = el?.clientHeight || globalThis.innerHeight;
    const touch = globalThis.matchMedia?.('(pointer: coarse)').matches;
    if (!w || !h || !touch || Math.min(w, h) > 600) return desktop;
    let { top, bottom } = measureSafeArea();
    // Reserva: en el iPhone abierto desde el icono (pantalla completa) el juego se dibuja también
    // bajo la isla / muesca. iOS no siempre da bien la zona segura al arrancar, así que se reserva
    // como mínimo lo que ocupan en los iPhone actuales: 59 px arriba y 34 abajo.
    if (iosHomeScreenApp() && h / w >= 2) {
      top = Math.max(top, 59);
      bottom = Math.max(bottom, 34);
    }
    // Prueba: ?safe=59,34 simula la zona segura de un iPhone (arriba, abajo) en el navegador
    const sim = params.get('safe')?.split(',').map(Number);
    if (sim?.length === 2 && sim.every((v) => v >= 0)) [top, bottom] = sim;
    return { mobile: true, w, h, top, bottom };
  } catch {
    return desktop;
  }
}
const S = screenInfo();
// Unidades lógicas por px: que quepan 360 de ancho y 640 de alto útil
const K = S.mobile ? Math.max(BASE_W / S.w, BASE_H / Math.max(1, S.h - S.top - S.bottom)) : 1;
export const MOBILE = S.mobile;
export const SCALE_K = K; // unidades lógicas por px de CSS (para volver a medir la zona segura)
export const W = S.mobile ? Math.round(S.w * K) : BASE_W;
export const FULL_H = S.mobile ? Math.round(S.h * K) : BASE_H;
export const SAFE_TOP = S.mobile ? Math.round(S.top * K) : 0;
export const SAFE_BOTTOM = S.mobile ? Math.round(S.bottom * K) : 0;
export const H = FULL_H - SAFE_TOP - SAFE_BOTTOM;
export const EXTRA_H = H - BASE_H;
export const HUD_EXTRA = Math.round(EXTRA_H * 0.45);
export const BOTTOM_EXTRA = EXTRA_H - HUD_EXTRA;
export const FONT = '"Press Start 2P", monospace';

// Tablero
export const COLS = 7;
export const ROWS = 10; // si un bloque llega a la última fila, fin de la partida
export const CELL = 48;
export const BOARD_X = (W - COLS * CELL) / 2;
export const BOARD_TOP = 64 + HUD_EXTRA;
export const BOARD_BOTTOM = BOARD_TOP + ROWS * CELL;
export const BOARD_RIGHT = BOARD_X + COLS * CELL;
// El disparo sale desde la línea de derrota (arriba de la última fila). Las bolas vuelven a esa línea.
export const LAUNCH_Y = BOARD_TOP + (ROWS - 1) * CELL;
// Borde inferior visible del tablero: incluye la fila vacía bajo la línea de derrota.
export const BOARD_FLOOR_Y = BOARD_BOTTOM + 6;

// Bolas
export const BALL_R = 6;
export const WATER_BALL_R = BALL_R + 2; // bolas algo más grandes con el especial de agua
export const BALL_TEXTURE_R = 4; // radio del sprite 'ball' (8x8 px); se escala según el radio real
export const SPAWN_ROW = 1; // la fila 0 (arriba del todo) siempre queda vacía
export const BALL_SPEED = 620;
export const START_BALLS = 1;
export const LAUNCH_DELAY = 115; // ms entre orbes a x1: separación de ~70 px (crece con la velocidad, ver SPACING_GROWTH)
export const SPEEDS = [1, 1.5, 2, 3, 4]; // velocidades del botón de velocidad
// (Las esquinas de los bloques son redondeadas en la física: ver CORNER_R en GameScene.js)
export const VERTICAL_LOCK_CHANCE = 0.02; // en un golpe de esquina, la bola sale en vertical pura

// Contenido
export const CREATURE_CHANCE = 0.11; // probabilidad de que un bloque nuevo sea una bestia
export const CREATURE_FROM_TURN = 5; // en los 4 primeros turnos no salen bestias (los dioses van aparte)
export const BOSS_EVERY = 8; // un legendario cada 10 turnos
export const SHINY_RATE = params.has('shiny') || params.has('gold') ? 0.25 : 0.03; // probabilidad base de la versión dorada (gold)
export const SHINY_BOOST_RATE = 0.11; // probabilidad de gold con el medidor gold lleno
export const SHINY_BOOST_TURNS = 3;
export const SHINY_METER_MAX = 100;
// Lo que suma al medidor shiny
export const SHINY_GAIN = { perKillOver3: 8, legendary: 35, clear: 40, capture: 10, captureGod: 25 };
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
export const RARITY_NAMES = { 1: 'Common', 2: 'Uncommon', 3: 'Rare', 4: 'Legendary' };

export const DEBUG = params.has('debug');
