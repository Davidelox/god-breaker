// Sprites pixel art generados por código (provisionales hasta tener arte dibujado a mano).
// Cada criatura usa su id como semilla, así que su forma es siempre la misma.
import { CREATURES } from '../data/creatures.js';
import { TYPES } from '../data/types.js';
import { mulberry32 } from '../core/rng.js';

export const creatureKey = (id, shiny) => `cr_${id}${shiny ? '_s' : ''}`;

const OUTLINE = '#1a1a24';
const PAD_TOP = 3; // espacio para crestas, orejas y coronas

function makeMask(n, rng, legendary) {
  const half = n / 2;
  const m = Array.from({ length: n }, () => Array(n).fill(0));
  const cy = n * 0.56;
  const rx = half * (legendary ? 0.9 : 0.72 + rng() * 0.26);
  const ry = (n / 2) * (0.7 + rng() * 0.25);
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < half; x++) {
      const dx = half - 1 - x + 0.5;
      const d = (dx / rx) ** 2 + ((y + 0.5 - cy) / ry) ** 2;
      const on = d < 0.55 ? true : d < 1.1 ? rng() < 0.55 : rng() < 0.05;
      m[y][x] = m[y][n - 1 - x] = on ? 1 : 0;
    }
  }
  // Nos quedamos solo con la parte conectada al centro (sin píxeles sueltos).
  const keep = Array.from({ length: n }, () => Array(n).fill(0));
  const stack = [[half - 1, Math.floor(cy)]];
  while (stack.length) {
    const [x, y] = stack.pop();
    if (x < 0 || y < 0 || x >= n || y >= n || keep[y][x] || !m[y][x]) continue;
    keep[y][x] = 1;
    stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
  }
  return keep;
}

function bodyBounds(grid) {
  let ty = Infinity;
  let by = -1;
  grid.forEach((row, y) => {
    if (row.some((v) => v === 1)) {
      ty = Math.min(ty, y);
      by = Math.max(by, y);
    }
  });
  return { ty, by };
}

function rowExtent(row) {
  const lx = row.indexOf(1);
  const rx = row.lastIndexOf(1);
  return { lx, rx };
}

export function buildCreatureGrid(c) {
  const rng = mulberry32(c.id * 7919 + 1337);
  const n = c.legendary ? 16 : 12;
  const half = n / 2;
  const GW = n + 2;
  const GH = n + PAD_TOP + 2;
  const grid = Array.from({ length: GH }, () => Array(GW).fill(0));
  const set = (x, y, v) => {
    if (x >= 0 && y >= 0 && x < GW && y < GH) grid[y][x] = v;
  };

  const mask = makeMask(n, rng, c.legendary);
  mask.forEach((row, y) => row.forEach((v, x) => v && set(x + 1, y + PAD_TOP + 1, 1)));
  const { ty, by } = bodyBounds(grid);
  const cL = half; // columna central izquierda (coordenadas de la rejilla)
  const cR = half + 1;

  // Rasgos de tipo
  const top = rowExtent(grid[ty]);
  switch (c.type) {
    case 'fuego':
      set(cL, ty - 1, 5); set(cR, ty - 1, 5); set(rng() < 0.5 ? cL : cR, ty - 2, 5); set(cL, ty - 3, 5);
      break;
    case 'planta':
      set(cL, ty - 1, 5); set(cR, ty - 1, 5); set(cL, ty - 2, 5); set(cR, ty - 2, 5);
      break;
    case 'electrico':
      set(top.lx, ty - 1, 5); set(top.lx - 1, ty - 2, 5); set(top.lx, ty - 3, 5);
      set(top.rx, ty - 1, 5); set(top.rx + 1, ty - 2, 5); set(top.rx, ty - 3, 5);
      break;
    case 'hielo':
      set(top.lx + 1, ty - 1, 5); set(top.lx + 1, ty - 2, 5);
      set(top.rx - 1, ty - 1, 5); set(top.rx - 1, ty - 2, 5);
      set(cL, ty - 1, 5); set(cR, ty - 1, 5);
      break;
    case 'agua': {
      const mid = rowExtent(grid[by - 2]);
      set(mid.lx - 1, by - 2, 5); set(mid.lx - 1, by - 3, 5);
      set(mid.rx + 1, by - 2, 5); set(mid.rx + 1, by - 3, 5);
      break;
    }
    case 'fantasma':
      grid[by].forEach((v, x) => { if (v === 1 && x % 2 === 0) grid[by][x] = 0; });
      break;
    case 'roca':
      for (let i = 0; i < 5; i++) {
        const x = 1 + Math.floor(rng() * n);
        const y = ty + 1 + Math.floor(rng() * (by - ty));
        if (grid[y][x] === 1) grid[y][x] = 6;
      }
      break;
    default:
      break;
  }

  // Ojos (2 de alto: brillo blanco + pupila), boca
  const eyeRow = ty + Math.max(2, Math.round((by - ty) * 0.38));
  const k = 1 + Math.floor(rng() * Math.min(2, half - 2));
  for (const ex of [cL - k, cR + k]) {
    set(ex, eyeRow, 2);
    set(ex, eyeRow - 1, 3);
  }
  if (rng() < 0.7 && grid[eyeRow + 2]?.[cL]) {
    set(cL, eyeRow + 2, 4);
    set(cR, eyeRow + 2, 4);
  }
  if (c.type === 'psiquico') {
    set(cL, eyeRow - 3, 5); set(cR, eyeRow - 3, 5);
  }
  if (c.legendary) {
    // corona
    const cy = ty - 1;
    for (const x of [cL - 3, cL, cR, cR + 3]) set(x, cy, 7);
    set(cL - 3, cy - 1, 7); set(cR + 3, cy - 1, 7); set(cL, cy - 2, 7); set(cR, cy - 2, 7);
  }
  return grid;
}

export function drawCreature(c, shiny) {
  const grid = buildCreatureGrid(c);
  const t = TYPES[c.type];
  const pal = shiny ? t.shiny : t;
  const GH = grid.length;
  const GW = grid[0].length;
  const canvas = document.createElement('canvas');
  canvas.width = GW;
  canvas.height = GH;
  const ctx = canvas.getContext('2d');
  const at = (x, y) => (x >= 0 && y >= 0 && x < GW && y < GH ? grid[y][x] : 0);
  for (let y = 0; y < GH; y++) {
    for (let x = 0; x < GW; x++) {
      const v = grid[y][x];
      let color = null;
      if (v === 0) {
        if (at(x + 1, y) || at(x - 1, y) || at(x, y + 1) || at(x, y - 1)) color = OUTLINE;
      } else if (v === 1) {
        if (!at(x, y - 1) || !at(x - 1, y)) color = pal.light;
        else if (!at(x, y + 1) || !at(x + 1, y)) color = pal.dark;
        else color = pal.base;
      } else if (v === 2) color = OUTLINE;
      else if (v === 3) color = '#ffffff';
      else if (v === 4) color = '#40202c';
      else if (v === 5) color = t.accent;
      else if (v === 6) color = pal.dark;
      else if (v === 7) color = '#ffd84a';
      if (color) {
        ctx.fillStyle = color;
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }
  return canvas;
}

function drawPixels(rows, palette) {
  const canvas = document.createElement('canvas');
  canvas.width = rows[0].length;
  canvas.height = rows.length;
  const ctx = canvas.getContext('2d');
  rows.forEach((row, y) => {
    [...row].forEach((ch, x) => {
      if (ch === '.') return;
      ctx.fillStyle = palette[ch];
      ctx.fillRect(x, y, 1, 1);
    });
  });
  return canvas;
}

const BALL = ['..kkkk..', '.kWWWWk.', 'kWWWWWgk', 'kWWWWWgk', 'kWWWWWgk', 'kWWWWggk', '.kggggk.', '..kkkk..'];
const ORB = [
  '....kk....', '...kCCk...', '..kCWCCk..', '.kCWCCCCk.', 'kCWCCCCCCk', 'kCCCCCCCDk',
  'kCCCCCCCDk', '.kCCCCCDk.', '..kCCCDk..', '...kCDk...', '....kk....'
];
const SPARK = ['..W..', '..W..', 'WWYWW', '..W..', '..W..'];
const PICKUP = ['..GGGG..', '.G....G.', 'G..WW..G', 'G.WWWW.G', 'G.WWWW.G', 'G..WW..G', '.G....G.', '..GGGG..'];
const ROCK = ['.kkkk.', 'kRRRrk', 'kRRrrk', 'kRrrrk', '.kkkk.'];

export function generateTextures(scene) {
  for (const c of CREATURES) {
    for (const shiny of [false, true]) {
      scene.textures.addCanvas(creatureKey(c.id, shiny), drawCreature(c, shiny));
    }
  }
  const pal = { k: OUTLINE, W: '#ffffff', g: '#b8c0d8', C: '#4ce0e8', D: '#2a8a9c', Y: '#ffd84a', G: '#7cf07c', R: '#a08868', r: '#685440' };
  scene.textures.addCanvas('ball', drawPixels(BALL, pal));
  scene.textures.addCanvas('orb', drawPixels(ORB, pal));
  scene.textures.addCanvas('spark', drawPixels(SPARK, pal));
  scene.textures.addCanvas('pickup', drawPixels(PICKUP, pal));
  scene.textures.addCanvas('rock', drawPixels(ROCK, pal));
}
