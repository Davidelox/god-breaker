// Retratos de las mascotas (estilo «selección de personaje»): primer plano de perfil, mirando a la
// derecha con la cabeza alta. Cada animal es una lista de piezas (polígonos en una rejilla de
// 48x56) que se rellenan píxel a píxel, sin suavizado. El sombreado sale de la propia forma:
// el contorno exterior recibe luz de contra, el interior queda en sombra y cada pieza se separa
// de la de debajo con una línea oscura. Así el pixel art queda limpio y coherente entre mascotas.
//
// Pieza: { p: [[x, y], ...] (polígono) | e: [cx, cy, rx, ry] (elipse), t: tono }
// Tonos: 'fur' pelo, 'dark' pelo en sombra, 'light' pelo claro (pecho, hocico), 'inner' interior
// de oreja, 'acc' / 'accD' acento propio (llamas, pico, corona…), 'glow' detalle brillante.
import { PET_SHAPES } from './petShapes.js';

// Detalles: eye [x, y, ancho], nose [x, y], star [x, y], lines: [[x1, y1, x2, y2, tono], ...]

const PETS = PET_SHAPES;

const inPoly = (x, y, pts) => {
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i], [xj, yj] = pts[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
};
const inPart = (x, y, part) => {
  const px = x + 0.5, py = y + 0.5;
  if (part.e) { const [cx, cy, rx, ry] = part.e; return ((px - cx) / rx) ** 2 + ((py - cy) / ry) ** 2 <= 1; }
  return inPoly(px, py, part.p);
};

const hexRgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const rgbHex = (c) => '#' + c.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');
/** Color de la paleta de 4 paradas (de oscuro a claro) en la posición t (0..1). */
function ramp(stops, t) {
  const cs = stops.map(hexRgb);
  const x = Math.max(0, Math.min(0.999, t)) * (cs.length - 1);
  const k = Math.floor(x), f = x - k;
  return rgbHex(cs[k].map((v, j) => v + (cs[k + 1][j] - v) * f));
}

export const PORTRAIT_W = 54;
export const PORTRAIT_H = 62;
export const PET_ANIMALS = Object.keys(PETS);

/**
 * Retrato dramático de una mascota (54x62 con marco de oro): cielo oscuro con halo detrás de la
 * cabeza, el animal en sombra con luz de contra y los ojos brillando.
 * opts: { animal, stops (4 colores de oscuro a claro), eye, accent: [claro, oscuro], seed }
 */
export function drawPetPortrait({ animal, stops, eye = '#ffd84a', accent, seed = 11, lift = 0, locked = false }) {
  const W = 48, H = 56;
  const pet = PETS[animal] ?? PETS.fox;
  const c = document.createElement('canvas');
  c.width = PORTRAIT_W;
  c.height = PORTRAIT_H;
  const ctx = c.getContext('2d');
  const px = (x, y, col) => { ctx.fillStyle = col; ctx.fillRect(3 + x, 3 + y, 1, 1); };
  ctx.fillStyle = '#6a3e0c'; ctx.fillRect(0, 0, PORTRAIT_W, PORTRAIT_H);
  ctx.fillStyle = '#d8a030'; ctx.fillRect(1, 1, PORTRAIT_W - 2, PORTRAIT_H - 2);
  ctx.fillStyle = '#ffe27a'; ctx.fillRect(1, 1, PORTRAIT_W - 2, 1);
  const R = (t) => ramp(stops, t);
  let s = seed;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const [hx, hy] = pet.halo ?? [28, 18];
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const d = Math.hypot(x - hx, y - hy);
    px(x, y, d > 17.3 && d < 18.5 ? R(0.3) : d > 15 && d < 17.3 ? R(0.07) : y < 30 ? R(0) : R(0.03));
  }
  for (let i = 0; i < 18; i++) px(Math.floor(rnd() * W), Math.floor(rnd() * H), rnd() < 0.5 ? R(0.4) : R(0.15));
  for (let i = 0; i < 12; i++) px(Math.floor(rnd() * W), Math.floor(rnd() * 30), rnd() < 0.4 ? stops[3] : R(0.5));

  // Mapa de piezas: qué pieza (la de más arriba) ocupa cada píxel
  const id = new Int16Array(W * H).fill(-1);
  pet.parts.forEach((part, i) => {
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (inPart(x, y, part)) id[y * W + x] = i;
  });
  const get = (x, y) => (x < 0 || y < 0 || x >= W || y >= H ? -1 : id[y * W + x]);
  const [aL, aD] = accent ?? [R(0.6), R(0.25)];
  // lift: aclara el animal (p. ej. el mono blanquecino) sin aclarar el cielo
  const B = (t) => R(Math.min(0.97, t + lift * (1 - t)));
  // Tono base (en sombra) y tono de luz de contra de cada clase de pieza
  const BASE = { fur: B(0.16), dark: B(0.08), light: B(0.3), inner: B(0.05), acc: aD, accD: aD, glow: R(0.6), pink: '#c04a78' };
  const LIT = { fur: B(0.55), dark: B(0.35), light: B(0.8), inner: B(0.2), acc: aL, accD: aL, glow: stops[3], pink: '#ffc8dc' };
  const MID = { fur: B(0.26), dark: B(0.16), light: B(0.45), inner: B(0.1), acc: aL, accD: aD, glow: R(0.8), pink: '#ff7aa8' };
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = get(x, y);
    if (i < 0) continue;
    const t = pet.parts[i].t;
    const out = (dx, dy) => get(x + dx, y + dy) < 0;
    let col = BASE[t];
    if (locked) { px(x, y, '#000000'); continue; }
    // Luz de contra desde atrás-arriba-derecha: el borde exterior brilla y se degrada hacia dentro
    if (out(1, 0) || out(0, -1) || out(1, -1)) col = LIT[t];
    else if (out(2, 0) || out(0, -2) || out(2, -2) || out(-1, 0)) col = MID[t];
    // Separación con la pieza de debajo (línea oscura en el borde de la de arriba)
    const under = [get(x - 1, y), get(x, y + 1), get(x + 1, y), get(x, y - 1)].some((j) => j >= 0 && j < i && pet.parts[j].t !== t);
    if (under && !(out(1, 0) || out(0, -1))) col = R(0.02);
    px(x, y, col);
  }
  // Contorno exterior
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (get(x, y) >= 0) continue;
    if ([[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => get(x + dx, y + dy) >= 0)) px(x, y, locked ? '#000000' : R(0));
  }
  if (locked) return frameRivets(ctx, c);
  // Líneas de detalle (boca, mechones…)
  for (const [x1, y1, x2, y2, t] of pet.lines ?? []) {
    const n = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1));
    for (let k = 0; k <= n; k++) px(Math.round(x1 + ((x2 - x1) * k) / n), Math.round(y1 + ((y2 - y1) * k) / n), t === 'lit' ? R(0.6) : R(0.02));
  }
  // Ojo almendrado: delineado, iris brillante, pupila y brillo
  if (pet.eye) {
    const [ex, ey, ew] = pet.eye;
    for (let k = -1; k <= ew; k++) px(ex + k, ey - 1, R(0));
    for (let k = 0; k < ew; k++) px(ex + k, ey, eye);
    for (let k = 1; k < ew - 1; k++) px(ex + k, ey + 1, eye);
    px(ex + ew, ey + 1, R(0)); px(ex - 1, ey + 1, R(0)); px(ex - 2, ey, R(0));
    for (let k = 0; k < ew; k++) px(ex + k, ey + 2, R(0));
    px(ex + Math.floor(ew / 2), ey, R(0)); px(ex + Math.floor(ew / 2), ey + 1, R(0));
    px(ex + Math.floor(ew / 2) + 1, ey, '#ffffff');
  }
  if (pet.nose) { const [nx, ny] = pet.nose; px(nx, ny, R(0)); px(nx + 1, ny, R(0)); px(nx, ny + 1, R(0)); px(nx + 1, ny - 1, R(0.5)); }
  if (pet.star) {
    const [sx, sy] = pet.star;
    for (const [dx, dy] of [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]]) px(sx + dx, sy + dy, stops[3]);
  }
  // Constelaciones sobre el cuerpo (Osa Mayor, concha de galaxia…)
  for (const [sx, sy] of pet.stars ?? []) { px(sx, sy, '#ffffff'); px(sx + 1, sy, stops[3]); px(sx, sy + 1, R(0.6)); }
  return frameRivets(ctx, c);
}

function frameRivets(ctx, c) {
  ctx.fillStyle = '#ffe27a';
  for (const [x, y] of [[2, 2], [PORTRAIT_W - 4, 2], [2, PORTRAIT_H - 4], [PORTRAIT_W - 4, PORTRAIT_H - 4]]) ctx.fillRect(x, y, 2, 2);
  return c;
}
