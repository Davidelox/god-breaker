// Motor de sprites de bestias: dibuja pixel art a partir de un descriptor de texto.
//
// Un descriptor es «arquetipo clave:valor clave:valor bandera …», por ejemplo:
//   'hum head:jackal skin:black body:kilt crown:nemes item:was item2:ankh'
//   'quad kind:dog heads:3 c:black eye:red tail:snake'
// Arquetipos: hum (figura humanoide), quad (cuadrúpedo de perfil), bird, serp (serpiente),
// drag (dragón occidental), ldrag (dragón oriental), fish, kraken, turtle, spider, insect,
// ghost, wisp, head (cabeza flotante), tree, plant, obj, cloud.
// Las claves que un arquetipo no entiende se ignoran. Los colores son nombres de PAL o #rrggbb.
//
// El dibujo se hace sobre una rejilla de «materiales». Al final se sombrea cada material
// (claro arriba, oscuro abajo y a la derecha) y se añade un contorno oscuro alrededor.
import { mulberry32 } from '../core/rng.js';

const OUT = '#14141e';

/** Rampas de color [oscuro, base, claro]. */
export const PAL = {
  red: ['#8c2028', '#d83a3a', '#ff7a6a'], crimson: ['#601828', '#a82840', '#e05870'],
  orange: ['#a04a18', '#e8782c', '#ffb060'], fire: ['#c03810', '#ff8a20', '#ffe060'],
  yellow: ['#b08a18', '#f0d040', '#fff4a0'], gold: ['#8c6410', '#e0b030', '#fff0a0'],
  brown: ['#4c3020', '#7c5434', '#a87c54'], tan: ['#8c6c44', '#c8a070', '#ecd0a0'],
  sand: ['#a08850', '#d8c088', '#f4e4bc'], cream: ['#b8a888', '#ece0c4', '#fffaf0'],
  white: ['#9ca4b8', '#e8ecf4', '#ffffff'], gray: ['#4c5060', '#808898', '#b8c0cc'],
  slate: ['#2c3444', '#4c5870', '#7c8ca4'], black: ['#101018', '#2a2a36', '#4c4c5c'],
  green: ['#1c5c30', '#3ca050', '#7cd878'], lime: ['#5c8c20', '#9cd040', '#d8f880'],
  olive: ['#4c5020', '#7c7c38', '#aca860'], moss: ['#2c4c28', '#4c7440', '#7ca468'],
  teal: ['#145c5c', '#2c9c94', '#6cd8c8'], cyan: ['#1c7c9c', '#40c8e8', '#a8f0ff'],
  blue: ['#1c3c8c', '#3468d8', '#78a8ff'], navy: ['#101c48', '#203478', '#405cb0'],
  purple: ['#3c1c6c', '#6c40b0', '#a07ce0'], violet: ['#5c2c8c', '#9c5cd8', '#d0a0ff'],
  pink: ['#a03c6c', '#e870a8', '#ffb0d4'], magenta: ['#801c60', '#c83c98', '#f080d0'],
  bronze: ['#6c4418', '#b07830', '#e0b068'], copper: ['#7c3818', '#c06838', '#f0a070'],
  silver: ['#6c7488', '#b0b8c8', '#eef2f8'], bone: ['#8c8468', '#d8d0b0', '#f8f4e4'],
  skin: ['#b06c4c', '#f0b088', '#ffd8b8'], skin2: ['#8c5434', '#c8885c', '#e8b088'],
  skin3: ['#4c2c1c', '#7c4c30', '#a8704c'], pale: ['#a8a0b0', '#e0dce8', '#fcfaff'],
  ghost: ['#7c94b8', '#c8dcf0', '#f4faff'], ice: ['#5c9cc8', '#a8e0f8', '#ecfcff'],
  stone: ['#545058', '#8c8890', '#bcb8c0'], wood: ['#4c3018', '#7c5028', '#a87840'],
  leaf: ['#24642c', '#44a040', '#88d860'], water: ['#1c58a0', '#3890e0', '#88d0ff'],
  night: ['#0c0c24', '#1c1c44', '#38386c'], blood: ['#500c14', '#8c1c24', '#c83c3c'],
  jade: ['#145c44', '#2ca878', '#78e0b0'], rust: ['#5c2c14', '#9c4c24', '#cc7c48'],
  lavender: ['#7c6ca8', '#b8a8e0', '#e8e0ff'], peach: ['#c07858', '#f8b898', '#fff0e0'],
  lapis: ['#142c78', '#2048b0', '#4c7ce0'], ochre: ['#7c5414', '#c08c28', '#e8c068']
};

function hexShade(hex, f) {
  const n = parseInt(hex.slice(1), 16);
  let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  const t = f < 0 ? 0 : 255;
  const k = Math.abs(f);
  r = Math.round(r + (t - r) * k); g = Math.round(g + (t - g) * k); b = Math.round(b + (t - b) * k);
  return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
}

function ramp(name) {
  if (PAL[name]) return PAL[name];
  if (/^#[0-9a-f]{6}$/i.test(name ?? '')) return [hexShade(name, -0.38), name, hexShade(name, 0.35)];
  return PAL.gray;
}

const cache = new Map();
/** Material sombreado (o plano con flat). noOut: no genera contorno. */
function M(name, opts = {}) {
  const key = `${name}|${opts.flat ? 1 : 0}|${opts.noOut ? 1 : 0}|${opts.tone ?? 1}|${opts.alpha ?? 1}`;
  if (!cache.has(key)) {
    const r = ramp(name);
    const tone = opts.tone ?? 1; // 0 = oscuro, 1 = base, 2 = claro (para materiales planos)
    let col = r[tone];
    if (opts.alpha != null && opts.alpha < 1) {
      const n = parseInt(col.slice(1), 16);
      col = `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${opts.alpha})`;
    }
    const darker = opts.dark ? [hexShade(r[0], -0.25), r[0], r[1]] : r;
    cache.set(key, { r: darker, flat: !!opts.flat, noOut: !!opts.noOut, c: col });
  }
  return cache.get(key);
}
const Mdark = (name) => {
  const key = `${name}|dark`;
  if (!cache.has(key)) {
    const r = ramp(name);
    cache.set(key, { r: [hexShade(r[0], -0.3), r[0], r[1]], flat: false, noOut: false, c: r[0] });
  }
  return cache.get(key);
};
const F = (name, tone = 1) => M(name, { flat: true, tone });
/** Variante clara (alas, plumas): separa visualmente piezas del mismo color que el cuerpo. */
const Mlight = (name) => {
  const key = `${name}|light`;
  if (!cache.has(key)) {
    const r = ramp(name);
    cache.set(key, { r: [r[1], r[2], hexShade(r[2], 0.45)], flat: false, noOut: false, c: r[2] });
  }
  return cache.get(key);
};

/** Ala levantada vista de perfil (cuadrúpedos y dragones), con la punta hacia atrás. */
function sideWing(g, kind, x, y, span, col, far = false) {
  const m = far ? Mdark(col) : kind === 'bat' ? M(col) : Mlight(col);
  if (kind === 'bat') {
    g.poly([[x + span * 0.15, y], [x + span * 0.1, y - span * 0.9], [x - span * 0.6, y - span * 1.1], [x - span * 0.95, y - span * 0.5],
      [x - span * 0.65, y - span * 0.55], [x - span * 0.6, y - span * 0.2], [x - span * 0.3, y - span * 0.3], [x - span * 0.2, y]], m);
    g.line(x + span * 0.1, y - span * 0.9, x - span * 0.65, y - span * 0.55, Mdark(col));
    g.line(x + span * 0.1, y - span * 0.9, x - span * 0.3, y - span * 0.3, Mdark(col));
    return;
  }
  if (kind === 'fire') {
    g.poly([[x + span * 0.15, y], [x, y - span * 1.1], [x - span * 0.8, y - span], [x - span * 0.3, y]], F('fire', 1));
    g.poly([[x + span * 0.05, y], [x - span * 0.05, y - span * 0.6], [x - span * 0.4, y - span * 0.5], [x - span * 0.2, y]], F('fire', 2));
    return;
  }
  g.poly([[x + span * 0.2, y], [x + span * 0.2, y - span * 0.75], [x - span * 0.1, y - span * 1.15], [x - span * 0.85, y - span * 1.05],
    [x - span * 0.7, y - span * 0.75], [x - span * 0.85, y - span * 0.5], [x - span * 0.55, y - span * 0.35], [x - span * 0.6, y - span * 0.1], [x - span * 0.2, y + span * 0.1]], m);
  for (let i = 1; i <= 3; i++) g.line(x - span * 0.05 * i, y - span * 0.2, x - span * (0.25 + 0.2 * i), y - span * (1.05 - 0.22 * i), Mdark(col));
}
const GLOW = (name, alpha = 0.45) => M(name, { flat: true, noOut: true, alpha, tone: 2 });

// ---------------------------------------------------------------- rejilla

class Grid {
  constructor(w, h) {
    this.w = w;
    this.h = h;
    this.a = new Array(w * h).fill(null);
    this.z = new Int32Array(w * h); // orden de dibujo, para el contorno interior entre piezas
    this.seq = 0;
  }
  /** Cada pieza nueva se considera «delante» de las anteriores. */
  next() {
    this.seq++;
  }
  get(x, y) {
    return x < 0 || y < 0 || x >= this.w || y >= this.h ? null : this.a[y * this.w + x];
  }
  px(x, y, m) {
    x = Math.floor(x);
    y = Math.floor(y);
    if (x >= 0 && y >= 0 && x < this.w && y < this.h) {
      this.a[y * this.w + x] = m;
      this.z[y * this.w + x] = this.seq;
    }
  }
  /** Rectángulo en coordenadas continuas: cubre los píxeles cuyo centro cae dentro. */
  rect(x, y, w, h, m) {
    this.next();
    const x0 = Math.ceil(x - 0.5), x1 = Math.max(x0, Math.ceil(x + w - 0.5) - 1);
    const y0 = Math.ceil(y - 0.5), y1 = Math.max(y0, Math.ceil(y + h - 0.5) - 1);
    for (let yy = y0; yy <= y1; yy++) for (let xx = x0; xx <= x1; xx++) this.px(xx, yy, m);
  }
  ell(cx, cy, rx, ry, m, clip) {
    this.next();
    rx = Math.max(rx, 0.5);
    ry = Math.max(ry, 0.5);
    for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) {
      for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
        const dx = (x + 0.5 - cx) / rx, dy = (y + 0.5 - cy) / ry;
        if (dx * dx + dy * dy <= 1.0001 && (!clip || clip(x + 0.5, y + 0.5))) this.px(x, y, m);
      }
    }
  }
  poly(pts, m) {
    this.next();
    const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
    for (let y = Math.floor(Math.min(...ys)); y <= Math.ceil(Math.max(...ys)); y++) {
      for (let x = Math.floor(Math.min(...xs)); x <= Math.ceil(Math.max(...xs)); x++) {
        const px = x + 0.5, py = y + 0.5;
        let inside = false;
        for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
          const [xi, yi] = pts[i], [xj, yj] = pts[j];
          if (yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) inside = !inside;
        }
        if (inside) this.px(x, y, m);
      }
    }
  }
  line(x0, y0, x1, y1, m, t = 1) {
    this.next();
    const n = Math.ceil(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) * 2) + 1;
    for (let i = 0; i <= n; i++) {
      const x = x0 + ((x1 - x0) * i) / n, y = y0 + ((y1 - y0) * i) / n;
      if (t <= 1.2) this.px(x, y, m);
      else this.dot(x, y, t / 2, m);
    }
  }
  dot(cx, cy, r, m) {
    r = Math.max(r, 0.5);
    for (let y = Math.floor(cy - r); y <= Math.ceil(cy + r); y++) {
      for (let x = Math.floor(cx - r); x <= Math.ceil(cx + r); x++) {
        const dx = (x + 0.5 - cx) / r, dy = (y + 0.5 - cy) / r;
        if (dx * dx + dy * dy <= 1.0001) this.px(x, y, m);
      }
    }
  }
  /** Curva cuadrática con grosor variable (t0 → t1). */
  curve(p0, p1, p2, m, t0 = 1, t1 = t0) {
    this.next();
    const n = 40;
    for (let i = 0; i <= n; i++) {
      const s = i / n, a = (1 - s) * (1 - s), b = 2 * (1 - s) * s, c = s * s;
      const x = a * p0[0] + b * p1[0] + c * p2[0], y = a * p0[1] + b * p1[1] + c * p2[1];
      const t = t0 + (t1 - t0) * s;
      if (t <= 1.2) this.px(x, y, m);
      else this.dot(x, y, t / 2, m);
    }
  }
}

/** ¿Hay junto a este píxel una pieza distinta dibujada delante? Entonces hace de contorno. */
function behind(g, x, y, m) {
  const z = g.z[y * g.w + x];
  for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    const n = g.get(x + dx, y + dy);
    if (n && n !== m && !n.flat && n.r !== m.r && g.z[(y + dy) * g.w + x + dx] > z) return true;
  }
  return false;
}

function render(g) {
  const canvas = document.createElement('canvas');
  canvas.width = g.w;
  canvas.height = g.h;
  const ctx = canvas.getContext('2d');
  for (let y = 0; y < g.h; y++) {
    for (let x = 0; x < g.w; x++) {
      const m = g.get(x, y);
      let col = null;
      if (!m) {
        const n = [g.get(x + 1, y), g.get(x - 1, y), g.get(x, y + 1), g.get(x, y - 1)];
        if (n.some((q) => q && !q.noOut)) col = OUT;
      } else if (m.flat) col = m.c;
      else if (behind(g, x, y, m)) col = hexShade(m.r[0], -0.45);
      else if (g.get(x, y - 1) !== m) col = m.r[2];
      else if (g.get(x, y + 1) !== m || g.get(x + 1, y) !== m) col = m.r[0];
      else col = m.r[1];
      if (col) {
        ctx.fillStyle = col;
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }
  return canvas;
}

// ---------------------------------------------------------------- descriptor

export function parseDesc(desc) {
  const [arch, ...rest] = String(desc ?? '').trim().split(/\s+/);
  const P = { arch: arch || 'wisp' };
  for (const tok of rest) {
    const i = tok.indexOf(':');
    if (i < 0) P[tok] = true;
    else {
      const v = tok.slice(i + 1);
      P[tok.slice(0, i)] = v === 'false' ? false : v === 'true' ? true : v;
    }
  }
  return P;
}

const num = (v, d) => (v == null || v === true ? d : Number(v));

// ---------------------------------------------------------------- piezas comunes

function eyeAt(g, x, y, P, big = false) {
  const col = P.eye ?? (P.glow ? 'yellow' : null);
  const m = col ? F(col, P.glow ? 2 : 1) : F('black', 0);
  g.px(x, y, m);
  if (big) {
    g.px(x, y - 1, F('white', 2));
  }
}

function aura(g, P, cx, cy, rx, ry) {
  const a = P.aura;
  if (!a) return;
  const col = a === true ? 'yellow' : a === 'fire' ? 'fire' : a === 'dark' ? 'purple' : a === 'ice' ? 'ice' : a === 'storm' ? 'cyan' : a;
  if (a === 'fire') {
    for (let i = -3; i <= 3; i++) {
      const x = cx + i * rx * 0.28;
      const top = cy - ry * (i % 2 ? 0.8 : 1.05);
      g.poly([[x - rx * 0.22, cy + ry * 0.3], [x + rx * 0.22, cy + ry * 0.3], [x, top]], M('fire', { flat: true, noOut: true, alpha: 0.5, tone: 1 }));
    }
    return;
  }
  g.ell(cx, cy, rx, ry, GLOW(col, a === 'dark' ? 0.35 : 0.25));
}

function flames(g, x, y, w, h, rng) {
  const n = Math.max(2, Math.round(w / 1.6));
  for (let i = 0; i < n; i++) {
    const fx = x - w / 2 + (w * (i + 0.5)) / n;
    const fh = h * (0.6 + rng() * 0.5);
    g.poly([[fx - w / n * 0.7, y], [fx + w / n * 0.7, y], [fx, y - fh]], F('fire', 1));
    g.poly([[fx - w / n * 0.35, y], [fx + w / n * 0.35, y], [fx, y - fh * 0.55]], F('fire', 2));
  }
}

function wings(g, kind, x, y, span, col, side = 0, u = 1) {
  // side: 0 ambas, -1 izquierda, 1 derecha. y = altura de la base del ala.
  const sides = side ? [side] : [-1, 1];
  for (const s of sides) {
    const X = (dx) => x + s * dx;
    if (kind === 'bat') {
      const m = M(col);
      g.poly([[X(0), y], [X(span * 0.3), y - span * 0.75], [X(span), y - span * 0.55], [X(span * 0.95), y + span * 0.2],
        [X(span * 0.7), y + span * 0.05], [X(span * 0.5), y + span * 0.3], [X(span * 0.3), y + span * 0.12], [X(0), y + span * 0.45]], m);
      g.line(X(0), y, X(span), y - span * 0.55, Mdark(col));
      g.line(X(span * 0.3), y - span * 0.75, X(span * 0.5), y + span * 0.3, Mdark(col));
    } else if (kind === 'insect') {
      g.ell(X(span * 0.55), y - span * 0.35, span * 0.5, span * 0.32, M(col, { flat: true, alpha: 0.7, tone: 2 }));
      g.ell(X(span * 0.45), y + span * 0.2, span * 0.38, span * 0.22, M(col, { flat: true, alpha: 0.7, tone: 2 }));
    } else if (kind === 'fire') {
      g.poly([[X(0), y], [X(span * 0.4), y - span * 0.9], [X(span), y - span * 0.7], [X(span * 0.8), y], [X(span * 0.9), y + span * 0.3], [X(0), y + span * 0.4]], F('fire', 1));
      g.poly([[X(0), y], [X(span * 0.35), y - span * 0.5], [X(span * 0.6), y], [X(0), y + span * 0.25]], F('fire', 2));
    } else {
      // pluma
      const m = Mlight(col);
      g.poly([[X(0), y + span * 0.1], [X(span * 0.25), y - span * 0.6], [X(span * 0.8), y - span * 0.95], [X(span), y - span * 0.6],
        [X(span * 0.9), y], [X(span * 0.7), y + span * 0.35], [X(span * 0.4), y + span * 0.55], [X(0), y + span * 0.45]], m);
      for (let i = 1; i <= 3; i++) {
        const t = i / 4;
        g.line(X(span * (0.2 + 0.25 * t)), y + span * (0.4 - 0.1 * t), X(span * (0.45 + 0.45 * t)), y + span * (0.45 - 0.6 * t), Mdark(col));
      }
    }
  }
}

// ---------------------------------------------------------------- cabezas (de frente)

function drawHair(g, P, x, y, r, phase, rng) {
  const style = P.hair === true ? 'short' : P.hair ?? (P.fem ? 'long' : 'short');
  const hc = P.hairc ?? (P.hair === 'snakes' ? 'green' : 'brown');
  const m = M(hc);
  if (phase === 'back') {
    if (style === 'long' || style === 'braids' || style === 'wildlong') {
      g.rect(x - r * 1.05, y - r * 0.2, r * 2.1, r * (style === 'wildlong' ? 2.8 : 2.4), m);
    }
    if (style === 'wild' || style === 'wildlong' || style === 'mane') g.ell(x, y - r * 0.1, r * 1.3, r * 1.2, m);
    return;
  }
  if (style === 'none' || style === 'bald') return;
  if (style === 'flame') {
    flames(g, x, y - r * 0.4, r * 2.2, r * 1.8, rng);
    return;
  }
  // casquete
  g.ell(x, y - r * 0.25, r * 1.02, r * 0.85, m, (px, py) => py < y - r * 0.2 || Math.abs(px - x) > r * 0.75);
  if (style === 'bun' || style === 'topknot') g.ell(x, y - r * 1.15, r * 0.4, r * 0.35, m);
  if (style === 'wild' || style === 'wildlong') {
    for (let i = -2; i <= 2; i++) g.poly([[x + i * r * 0.4 - r * 0.25, y - r * 0.8], [x + i * r * 0.4 + r * 0.25, y - r * 0.8], [x + i * r * 0.5, y - r * (1.4 + rng() * 0.4)]], m);
  }
  if (style === 'sidelock') g.rect(x + r * 0.85, y - r * 0.2, r * 0.35, r * 1.8, m);
  if (style === 'braids') {
    g.rect(x - r * 1.1, y, r * 0.4, r * 2.6, Mdark(hc));
    g.rect(x + r * 0.7, y, r * 0.4, r * 2.6, Mdark(hc));
  }
  if (style === 'leaves') {
    for (let i = -2; i <= 2; i++) g.ell(x + i * r * 0.45, y - r * (0.9 - Math.abs(i) * 0.12), r * 0.35, r * 0.3, M('leaf'));
  }
  if (style === 'snakes') {
    for (const [i, len] of [[-2, 0.9], [-1, 1.3], [0, 1.5], [1, 1.3], [2, 0.9]]) {
      const bx = x + i * r * 0.42, sx = x + i * r * 0.75, sy = y - r * (0.6 + len * 0.55);
      g.curve([bx, y - r * 0.6], [bx + i * r * 0.1, sy + r * 0.2], [sx, sy], Mlight(hc), 1.2, 1.2);
      g.dot(sx, sy, r * 0.2, Mlight(hc));
      g.px(sx, sy, F('red', 2));
    }
    for (const s of [-1, 1]) g.curve([x + s * r * 0.8, y - r * 0.2], [x + s * r * 1.3, y + r * 0.4], [x + s * r * 1, y + r * 1], Mlight(hc), 1.2, 1);
  }
}

function face(g, P, x, y, r, opts = {}) {
  const eyes = P.eyes;
  const ey = y + r * (opts.ey ?? 0.1);
  const ex = Math.max(1, Math.round(r * 0.42));
  if (eyes === 'none') return;
  if (eyes === 'one') {
    g.ell(x, ey - 0.5, r * 0.36, r * 0.3, F('white', 2));
    g.px(x, ey - 0.5, F(P.eye ?? 'red'));
  } else if (eyes === 'closed') {
    g.px(x - ex, ey, F('black', 0)); g.px(x - ex - 1, ey, F('black', 0));
    g.px(x + ex - 1, ey, F('black', 0)); g.px(x + ex, ey, F('black', 0));
  } else if (eyes === 'patch') {
    g.px(x - ex - 0.5, ey, F('black', 0));
    g.line(x - r, ey - r * 0.6, x + r, ey - r * 0.1, F('black', 0));
    g.rect(x + ex - 1, ey - 1, 2, 2, F('black', 0));
  } else if (eyes === 'blind') {
    g.rect(x - r * 0.9, ey - 0.5, r * 1.8, 1.6, F('white', 1));
  } else {
    eyeAt(g, x - ex - 0.5, ey, P, opts.big);
    eyeAt(g, x + ex - 0.5, ey, P, opts.big);
    if (eyes === 'three') g.px(x - 0.5, ey - r * 0.45, F(P.eye ?? 'red'));
    if (eyes === 'many') {
      for (const [dx, dy] of [[-0.75, -0.45], [0.75, -0.45], [0, -0.55], [-0.6, 0.5], [0.6, 0.5]]) g.px(x + dx * r, y + dy * r, F(P.eye ?? 'blue'));
    }
  }
  if (P.mark === 'horus') {
    g.px(x - ex - 0.5, ey + 1, F('black', 0)); g.px(x + ex - 0.5, ey + 1, F('black', 0));
    g.px(x - ex - 1.5, ey + 2, F('black', 0)); g.px(x + ex + 0.5, ey + 2, F('black', 0));
  }
  if (P.mark === 'paint') { g.px(x - ex - 0.5, ey + 1.5, F('red')); g.px(x + ex - 0.5, ey + 1.5, F('red')); }
  if (!opts.noMouth && r >= 3 && !P.beard) {
    const my = y + r * 0.6;
    if (P.fangs) { g.px(x - 1, my, F('white', 2)); g.px(x, my, F('white', 2)); }
    else if (P.mouth === 'open' || P.scream) g.rect(x - 1, my - 0.5, 2, 2, F('blood', 0));
    else g.px(x - 0.5, my, F(P.lip ?? 'blood', P.lip ? 1 : 0));
  }
  if (P.tongue) g.line(x - 0.5, y + r * 0.7, x - 0.5, y + r * 1.9, F('red'));
  if (P.mask) g.rect(x - r * 0.95, ey - 1, r * 1.9, 2.2, F(P.mask === true ? 'black' : P.mask, 1));
}

function horns(g, kind, x, y, r, col = 'bone') {
  if (!kind) return;
  const m = M(col);
  if (kind === 'ram') {
    for (const s of [-1, 1]) { g.ell(x + s * r * 1.05, y - r * 0.2, r * 0.55, r * 0.6, m); g.ell(x + s * r * 1.05, y - r * 0.2, r * 0.2, r * 0.22, Mdark(col)); }
  } else if (kind === 'bull' || kind === 'cow') {
    for (const s of [-1, 1]) g.curve([x + s * r * 0.7, y - r * 0.6], [x + s * r * 1.9, y - r * 0.7], [x + s * r * 1.6, y - r * 1.8], m, 2, 1);
  } else if (kind === 'antler') {
    for (const s of [-1, 1]) {
      g.line(x + s * r * 0.5, y - r * 0.8, x + s * r * 1.4, y - r * 2.2, m);
      g.line(x + s * r * 0.9, y - r * 1.4, x + s * r * 0.6, y - r * 2.1, m);
      g.line(x + s * r * 1.2, y - r * 1.9, x + s * r * 1.9, y - r * 2.1, m);
    }
  } else if (kind === 'goat') {
    for (const s of [-1, 1]) g.curve([x + s * r * 0.4, y - r * 0.8], [x + s * r * 0.6, y - r * 2], [x + s * r * 1.4, y - r * 1.7], m, 1.6, 1);
  } else if (kind === 'long') {
    for (const s of [-1, 1]) g.line(x + s * r * 0.5, y - r * 0.8, x + s * r * 0.9, y - r * 2.3, m, 1.4);
  } else if (kind === 'one') {
    g.poly([[x - r * 0.25, y - r * 0.8], [x + r * 0.25, y - r * 0.8], [x, y - r * 1.9]], m);
  } else {
    // pequeños
    for (const s of [-1, 1]) g.poly([[x + s * r * 0.35, y - r * 0.7], [x + s * r * 0.8, y - r * 0.6], [x + s * r * 0.75, y - r * 1.5]], m);
  }
}

function animalEars(g, x, y, r, m, h = 1, w = 0.4) {
  for (const s of [-1, 1]) g.poly([[x + s * r * 0.25, y - r * 0.5], [x + s * r * (0.25 + w * 2), y - r * 0.4], [x + s * r * 0.65, y - r * (0.7 + h)]], m);
}

function headShape(g, P, x, y, r, rng) {
  const type = P.head ?? 'human';
  const skin = M(P.skin ?? 'skin');
  const furName = P.fur ?? P.skin ?? 'brown';
  const fur = M(furName);
  const light = M(P.fur2 ?? 'cream');
  switch (type) {
    case 'jackal': case 'dog': case 'wolf': case 'fox': case 'set': {
      const tall = type === 'jackal' ? 1.4 : type === 'set' ? 1.2 : type === 'fox' ? 1 : 0.85;
      if (type === 'set') for (const s of [-1, 1]) g.rect(x + s * r * 0.5 - r * 0.25, y - r * 2.1, r * 0.5, r * 1.4, fur);
      else animalEars(g, x, y, r, fur, tall, 0.25);
      g.ell(x, y, r * 0.8, r * 0.8, fur);
      g.ell(x, y + r * 0.55, r * 0.45, r * 0.5, type === 'fox' ? light : fur);
      g.px(x - 0.5, y + r * 0.35, F('black', 0));
      eyeAt(g, x - r * 0.45 - 0.5, y - r * 0.1, { eye: P.eye ?? (type === 'jackal' ? 'gold' : null) });
      eyeAt(g, x + r * 0.45 - 0.5, y - r * 0.1, { eye: P.eye ?? (type === 'jackal' ? 'gold' : null) });
      break;
    }
    case 'falcon': case 'hawk': case 'eagle': case 'bird': case 'crow': case 'vulture': case 'rooster': {
      g.ell(x, y, r * 0.85, r * 0.95, type === 'vulture' ? M('pink') : fur);
      if (type === 'eagle') g.ell(x, y - r * 0.2, r * 0.8, r * 0.7, M('white'));
      if (type === 'rooster') g.poly([[x - r * 0.4, y - r * 0.8], [x + r * 0.4, y - r * 0.8], [x + r * 0.2, y - r * 1.5], [x, y - r * 1.1], [x - r * 0.3, y - r * 1.5]], M('red'));
      g.poly([[x - r * 0.35, y + r * 0.1], [x + r * 0.35, y + r * 0.1], [x, y + r * 0.95]], M(P.beak ?? (type === 'crow' ? 'gray' : 'gold')));
      eyeAt(g, x - r * 0.45 - 0.5, y - r * 0.15, P);
      eyeAt(g, x + r * 0.45 - 0.5, y - r * 0.15, P);
      if (type === 'falcon' || P.mark === 'horus') {
        g.px(x - r * 0.55 - 0.5, y + r * 0.2, F('black', 0)); g.px(x + r * 0.55 - 0.5, y + r * 0.2, F('black', 0));
      }
      break;
    }
    case 'ibis': {
      g.ell(x, y, r * 0.75, r * 0.85, fur);
      g.curve([x - r * 0.1, y + r * 0.3], [x - r * 0.4, y + r * 1.6], [x - r * 1.4, y + r * 2.1], M('black'), 1.6, 1);
      eyeAt(g, x - r * 0.4 - 0.5, y - r * 0.1, P); eyeAt(g, x + r * 0.4 - 0.5, y - r * 0.1, P);
      break;
    }
    case 'owl': {
      g.ell(x, y, r * 0.95, r * 0.9, fur);
      animalEars(g, x, y, r, fur, 0.5, 0.3);
      for (const s of [-1, 1]) { g.ell(x + s * r * 0.42, y - r * 0.05, r * 0.35, r * 0.35, F('yellow', 2)); g.px(x + s * r * 0.42 - 0.5, y - r * 0.05, F('black', 0)); }
      g.px(x - 0.5, y + r * 0.45, F('gold'));
      break;
    }
    case 'lion': case 'lioness': case 'cat': case 'tiger': case 'leopard': {
      if (type === 'lion') g.ell(x, y + r * 0.05, r * 1.35, r * 1.3, M(P.mane ?? 'ochre'));
      if (type === 'cat' || type === 'tiger' || type === 'leopard') animalEars(g, x, y, r, fur, type === 'cat' ? 0.9 : 0.5, 0.25);
      else for (const s of [-1, 1]) g.ell(x + s * r * 0.65, y - r * 0.7, r * 0.28, r * 0.28, fur);
      g.ell(x, y, r * 0.82, r * 0.8, fur);
      g.ell(x, y + r * 0.45, r * 0.45, r * 0.38, light);
      g.px(x - 0.5, y + r * 0.25, F('black', 0));
      eyeAt(g, x - r * 0.42 - 0.5, y - r * 0.1, { eye: P.eye ?? 'yellow' });
      eyeAt(g, x + r * 0.42 - 0.5, y - r * 0.1, { eye: P.eye ?? 'yellow' });
      if (type === 'tiger') for (const s of [-1, 1]) g.line(x + s * r * 0.8, y, x + s * r * 0.5, y + r * 0.1, F('black', 0));
      if (type === 'leopard') for (const [dx, dy] of [[-0.5, -0.55], [0.5, -0.55], [0, -0.7]]) g.px(x + dx * r, y + dy * r, F('black', 0));
      break;
    }
    case 'croc': {
      g.ell(x, y - r * 0.2, r * 0.75, r * 0.75, fur);
      g.rect(x - r * 0.45, y, r * 0.9, r * 1.7, fur);
      g.px(x - r * 0.45 - 0.5, y + r * 1.2, F('white', 2)); g.px(x + r * 0.45, y + r * 1.2, F('white', 2));
      eyeAt(g, x - r * 0.45 - 0.5, y - r * 0.55, { eye: P.eye ?? 'yellow' });
      eyeAt(g, x + r * 0.45 - 0.5, y - r * 0.55, { eye: P.eye ?? 'yellow' });
      break;
    }
    case 'ram': case 'goat': case 'cow': case 'bull': case 'horse': case 'deer': case 'ox': {
      const long = type === 'horse' || type === 'deer';
      if (type === 'ram') horns(g, 'ram', x, y, r, P.hornc ?? 'sand');
      if (type === 'cow' || type === 'bull' || type === 'ox') horns(g, 'bull', x, y, r, P.hornc ?? 'bone');
      if (type === 'goat') horns(g, 'goat', x, y, r, P.hornc ?? 'bone');
      if (type === 'deer') horns(g, 'antler', x, y, r, P.hornc ?? 'tan');
      for (const s of [-1, 1]) g.ell(x + s * r * 0.85, y - r * 0.35, r * 0.35, r * 0.18, fur);
      g.ell(x, y + (long ? r * 0.2 : 0), r * 0.7, r * (long ? 1.15 : 0.9), fur);
      g.ell(x, y + r * (long ? 0.95 : 0.65), r * 0.5, r * 0.35, light);
      g.px(x - r * 0.25 - 0.5, y + r * (long ? 1 : 0.7), F('black', 0)); g.px(x + r * 0.25 - 0.5, y + r * (long ? 1 : 0.7), F('black', 0));
      if (type === 'goat') g.poly([[x - r * 0.2, y + r * 0.9], [x + r * 0.2, y + r * 0.9], [x, y + r * 1.7]], M('white'));
      eyeAt(g, x - r * 0.42 - 0.5, y - r * 0.2, P); eyeAt(g, x + r * 0.42 - 0.5, y - r * 0.2, P);
      if (type === 'horse') g.rect(x - 0.5, y - r * 1.1, 1, r * 0.6, Mdark(furName));
      break;
    }
    case 'boar': case 'pig': {
      animalEars(g, x, y, r, fur, 0.4, 0.3);
      g.ell(x, y, r * 0.9, r * 0.85, fur);
      g.ell(x, y + r * 0.45, r * 0.42, r * 0.32, M('pink'));
      if (type === 'boar') for (const s of [-1, 1]) g.line(x + s * r * 0.45, y + r * 0.6, x + s * r * 0.7, y + r * 0.1, F('white', 2));
      eyeAt(g, x - r * 0.42 - 0.5, y - r * 0.25, P); eyeAt(g, x + r * 0.42 - 0.5, y - r * 0.25, P);
      break;
    }
    case 'bear': case 'monkey': case 'bat': case 'rabbit': case 'hippo': case 'elephant': case 'rodent': {
      if (type === 'bear' || type === 'monkey') for (const s of [-1, 1]) g.ell(x + s * r * 0.75, y - r * 0.6, r * 0.3, r * 0.3, fur);
      if (type === 'bat') animalEars(g, x, y, r, fur, 1.1, 0.5);
      if (type === 'rabbit') for (const s of [-1, 1]) g.ell(x + s * r * 0.35, y - r * 1.4, r * 0.25, r * 0.8, fur);
      if (type === 'elephant') for (const s of [-1, 1]) g.ell(x + s * r * 1.05, y, r * 0.65, r * 0.85, fur);
      if (type === 'rodent') for (const s of [-1, 1]) g.ell(x + s * r * 0.7, y - r * 0.7, r * 0.35, r * 0.35, fur);
      g.ell(x, y, r * (type === 'hippo' ? 1.05 : 0.85), r * 0.85, fur);
      if (type === 'monkey') g.ell(x, y + r * 0.15, r * 0.6, r * 0.55, M(P.fur2 ?? 'peach'));
      if (type === 'hippo') g.ell(x, y + r * 0.45, r * 0.85, r * 0.45, light);
      if (type === 'bear') g.ell(x, y + r * 0.4, r * 0.4, r * 0.3, light);
      if (type === 'elephant') {
        g.rect(x - r * 0.2, y + r * 0.3, r * 0.4, r * 1.7, fur);
        for (const s of [-1, 1]) g.line(x + s * r * 0.4, y + r * 0.6, x + s * r * 0.6, y + r * 1.1, F('white', 2));
      }
      eyeAt(g, x - r * 0.42 - 0.5, y - r * 0.15, P); eyeAt(g, x + r * 0.42 - 0.5, y - r * 0.15, P);
      if (type !== 'elephant') g.px(x - 0.5, y + r * 0.3, F('black', 0));
      break;
    }
    case 'frog': case 'kappa': {
      g.ell(x, y, r * 1, r * 0.8, M(P.skin ?? 'green'));
      if (type === 'kappa') {
        g.ell(x, y - r * 0.5, r * 1.05, r * 0.4, M(P.hairc ?? 'black'));
        g.ell(x, y - r * 0.75, r * 0.55, r * 0.22, F('cream', 2));
        g.poly([[x - r * 0.35, y + r * 0.25], [x + r * 0.35, y + r * 0.25], [x, y + r * 0.8]], M('yellow'));
      } else g.rect(x - r * 0.5, y + r * 0.45, r, 1, F('black', 0));
      eyeAt(g, x - r * 0.5 - 0.5, y - r * 0.15, P, true); eyeAt(g, x + r * 0.5 - 0.5, y - r * 0.15, P, true);
      break;
    }
    case 'skull': {
      g.ell(x, y, r * 0.85, r * 0.9, M(P.skin ?? 'bone'));
      g.rect(x - r * 0.4, y + r * 0.6, r * 0.8, r * 0.4, M(P.skin ?? 'bone'));
      for (const s of [-1, 1]) g.rect(x + s * r * 0.4 - 1, y - r * 0.1, 2, 2, F(P.eye ?? 'black', P.eye ? 2 : 0));
      g.px(x - 0.5, y + r * 0.4, F('black', 0));
      break;
    }
    case 'scarab': {
      g.ell(x, y, r * 0.95, r * 1.05, M('teal'));
      g.line(x - 0.5, y - r, x - 0.5, y + r, Mdark('teal'));
      for (const s of [-1, 1]) g.line(x + s * r * 0.6, y - r * 0.8, x + s * r * 1.2, y - r * 1.5, M('black'));
      break;
    }
    case 'cobra': case 'snake': {
      g.ell(x, y + r * 0.2, r * 1.15, r * 1.1, Mdark(P.fur ?? 'green'));
      g.ell(x, y, r * 0.6, r * 0.8, M(P.fur ?? 'green'));
      eyeAt(g, x - r * 0.3 - 0.5, y - r * 0.2, { eye: P.eye ?? 'yellow' });
      eyeAt(g, x + r * 0.3 - 0.5, y - r * 0.2, { eye: P.eye ?? 'yellow' });
      g.line(x - 0.5, y + r * 0.8, x - 0.5, y + r * 1.3, F('red'));
      break;
    }
    case 'block': {
      g.rect(x - r * 0.9, y - r * 0.9, r * 1.8, r * 1.8, M(P.skin ?? 'stone'));
      for (const s of [-1, 1]) g.rect(x + s * r * 0.45 - 0.5, y - r * 0.1, 1.4, 1, F(P.eye ?? 'cyan', 2));
      break;
    }
    case 'insect': {
      g.ell(x, y, r * 0.8, r * 0.75, fur);
      for (const s of [-1, 1]) { g.ell(x + s * r * 0.45, y - r * 0.1, r * 0.3, r * 0.35, F(P.eye ?? 'red')); g.line(x + s * r * 0.2, y - r * 0.6, x + s * r * 0.7, y - r * 1.5, M('black')); }
      break;
    }
    case 'tengu': {
      g.ell(x, y, r * 0.9, r * 0.95, M(P.skin ?? 'red'));
      g.line(x - 0.5, y, x + r * 0.6, y + r * 1.3, M(P.skin ?? 'red'), 2);
      face(g, { ...P, eyes: P.eyes }, x, y, r, { noMouth: true, ey: -0.15 });
      break;
    }
    case 'fish': {
      g.ell(x, y, r * 0.9, r * 1, fur);
      for (const s of [-1, 1]) g.poly([[x + s * r * 0.8, y], [x + s * r * 1.5, y - r * 0.6], [x + s * r * 1.4, y + r * 0.5]], Mdark(furName));
      eyeAt(g, x - r * 0.5 - 0.5, y - r * 0.1, P, true); eyeAt(g, x + r * 0.5 - 0.5, y - r * 0.1, P, true);
      g.rect(x - r * 0.4, y + r * 0.55, r * 0.8, 1, F('black', 0));
      break;
    }
    default: {
      // humana (también oni, dios, etc.)
      if (P.ears === 'pointy') for (const s of [-1, 1]) g.poly([[x + s * r * 0.7, y - r * 0.1], [x + s * r * 0.8, y + r * 0.35], [x + s * r * 1.5, y - r * 0.6]], skin);
      else if (P.ears === 'long') for (const s of [-1, 1]) g.poly([[x + s * r * 0.7, y - r * 0.2], [x + s * r * 0.8, y + r * 0.3], [x + s * r * 1.8, y - r * 0.4]], skin);
      else for (const s of [-1, 1]) g.px(x + s * r * 0.95 - 0.5, y + r * 0.1, skin);
      g.ell(x, y, r * 0.9, r * 0.98, skin);
      if (P.half) {
        g.ell(x, y, r * 0.9, r * 0.98, M(P.half === true ? 'bone' : P.half), (px) => px > x);
        g.rect(x + r * 0.42 - 1, y + r * 0.05, 2, 2, F('black', 0));
      }
      face(g, P, x, y, r, { big: P.small || P.child });
      if (P.beard) {
        const long = P.beard === 'long';
        g.ell(x, y + r * 0.6, r * 0.9, r * (long ? 1.3 : 0.7), M(P.beardc ?? P.hairc ?? 'brown'), (px, py) => py > y + r * 0.35);
        g.rect(x - r * 0.5, y + r * 0.45, r, 1, M(P.beardc ?? P.hairc ?? 'brown'));
      }
    }
  }
}

function crown(g, P, x, y, r, rng) {
  const c = P.crown;
  if (!c) return;
  const gold = M(P.crownc ?? 'gold');
  const top = y - r * 0.95;
  switch (c) {
    case 'crown': case 'tiara':
      g.rect(x - r * 0.85, top - 1, r * 1.7, 1.6, gold);
      for (const dx of c === 'tiara' ? [0] : [-0.7, 0, 0.7]) g.poly([[x + dx * r - 1, top - 0.5], [x + dx * r + 1, top - 0.5], [x + dx * r, top - r * 0.75]], gold);
      if (c === 'tiara') g.px(x - 0.5, top - 0.5, F('red', 2));
      break;
    case 'helm': case 'wingedhelm': case 'hornhelm': case 'crest': {
      const hm = M(P.helmc ?? 'silver');
      g.ell(x, y - r * 0.25, r * 1.02, r * 0.85, hm, (px, py) => py < y - r * 0.1);
      g.rect(x - 0.5, y - r * 0.2, 1, r * 0.6, hm);
      if (c === 'wingedhelm') wings(g, 'feather', x, y - r * 0.6, r * 1.1, 'white', 0);
      if (c === 'hornhelm') horns(g, 'long', x, y, r, 'bone');
      if (c === 'crest' || P.crest) g.curve([x - r * 0.9, y - r * 0.9], [x, y - r * 2.3], [x + r * 1.3, y - r * 0.6], M(P.crest ?? 'red'), 2, 1);
      break;
    }
    case 'disk': case 'ra':
      g.ell(x, top - r * 0.75, r * 0.8, r * 0.8, M('red'));
      g.ell(x - r * 0.2, top - r * 0.95, r * 0.3, r * 0.3, F('orange', 2));
      g.rect(x - 0.5, top - 1, 1, 1.5, M('gold'));
      break;
    case 'nemes': {
      const blue = M(P.nemesc ?? 'lapis');
      g.poly([[x - r * 1.05, y - r * 0.3], [x - r * 0.9, y - r * 1], [x + r * 0.9, y - r * 1], [x + r * 1.05, y - r * 0.3], [x + r * 1.3, y + r * 1.8], [x + r * 0.75, y + r * 1.8], [x + r * 0.75, y - r * 0.2], [x - r * 0.75, y - r * 0.2], [x - r * 0.75, y + r * 1.8], [x - r * 1.3, y + r * 1.8]], gold);
      for (let yy = y - r * 0.8; yy < y + r * 1.8; yy += 2) {
        g.rect(x - r * 1.3, yy, r * 0.5, 1, blue);
        g.rect(x + r * 0.8, yy, r * 0.5, 1, blue);
      }
      g.rect(x - 0.5, top - 1, 1, 1.5, M('gold'));
      break;
    }
    case 'white': case 'pschent': case 'red':
      if (c === 'pschent' || c === 'red') g.rect(x - r * 0.9, top - r * 0.5, r * 1.8, r * 0.7, M('red'));
      if (c === 'pschent' || c === 'white') g.ell(x, top - r * 1.1, r * 0.55, r * 1, M('white'));
      if (c === 'red') g.rect(x + r * 0.5, top - r * 1.4, r * 0.4, r * 1, M('red'));
      break;
    case 'atef':
      g.ell(x, top - r * 1, r * 0.5, r * 1.1, M('white'));
      for (const s of [-1, 1]) g.poly([[x + s * r * 0.5, top], [x + s * r * 0.9, top], [x + s * r * 0.8, top - r * 1.9]], M('white'));
      break;
    case 'feather':
      g.poly([[x - 0.5, top], [x + r * 0.5, top], [x + r * 0.7, top - r * 2], [x + r * 0.2, top - r * 1.6]], M('white'));
      g.rect(x - r * 0.95, top + r * 0.1, r * 1.9, 1.2, M('red'));
      break;
    case 'plumes':
      for (const dx of [-0.35, 0.35]) g.rect(x + dx * r - 0.8, top - r * 2.4, 1.6, r * 2.4, M(P.plumec ?? 'gold'));
      g.rect(x - r * 0.9, top - 0.5, r * 1.8, r * 0.6, M('red'));
      break;
    case 'hathor':
      for (const s of [-1, 1]) g.curve([x + s * r * 0.3, top], [x + s * r * 1.5, top - r * 0.8], [x + s * r * 0.6, top - r * 2], M('black'), 1.6, 1);
      g.ell(x, top - r * 1, r * 0.6, r * 0.6, M('red'));
      break;
    case 'moon':
      g.ell(x, top - r * 0.6, r * 0.9, r * 0.6, M('silver'), (px, py) => py > top - r * 0.6 + r * 0.05 || (px - x) ** 2 + (py - (top - r * 0.9)) ** 2 > (r * 0.75) ** 2);
      if (P.disk !== false && P.moondisk) g.ell(x, top - r * 1, r * 0.45, r * 0.45, M('gold'));
      break;
    case 'rays':
      for (let i = 0; i < 7; i++) {
        const a = Math.PI + (i * Math.PI) / 6;
        g.line(x + Math.cos(a) * r, y + Math.sin(a) * r * 0.9, x + Math.cos(a) * r * 1.9, y + Math.sin(a) * r * 1.9, F('yellow', 2));
      }
      g.rect(x - r * 0.9, top, r * 1.8, 1.2, gold);
      break;
    case 'laurel': case 'grapes': case 'flowers': case 'wreath':
      for (let i = -3; i <= 3; i++) {
        const px = x + (i / 3) * r * 0.95, py = top + r * 0.25 + Math.abs(i) * r * 0.06;
        g.px(px, py, c === 'grapes' ? M(i % 2 ? 'purple' : 'leaf') : c === 'flowers' ? F(i % 2 ? 'pink' : 'yellow', 2) : M('leaf'));
        g.px(px, py - 1, c === 'grapes' ? M('purple') : M('leaf'));
      }
      break;
    case 'hood': case 'veil': case 'cowl': {
      const hc = M(P.hoodc ?? P.c ?? 'gray');
      g.ell(x, y - r * 0.15, r * 1.15, r * 1.15, hc, (px, py) => py < y - r * 0.45 || Math.abs(px - x) > r * 0.8);
      if (c === 'veil') g.rect(x - r * 1.15, y, r * 2.3, r * 1.8, hc);
      break;
    }
    case 'wizard': case 'witch': {
      const hc = M(P.hatc ?? 'navy');
      g.rect(x - r * 1.4, top + r * 0.1, r * 2.8, 1.5, hc);
      g.poly([[x - r * 0.8, top + r * 0.2], [x + r * 0.8, top + r * 0.2], [x + r * 0.5, top - r * 1.4], [x + r * 1.2, top - r * 1.8]], hc);
      break;
    }
    case 'redcap':
      g.poly([[x - r * 0.95, top + r * 0.4], [x + r * 0.95, top + r * 0.4], [x + r * 0.9, top - r * 1.4]], M(P.hatc ?? 'red'));
      break;
    case 'brim': case 'sombrero': case 'kasa': case 'petasos': {
      const hc = M(P.hatc ?? (c === 'kasa' ? 'tan' : 'brown'));
      const wd = c === 'sombrero' ? 1.9 : 1.6;
      if (c === 'kasa') g.poly([[x - r * wd, top + r * 0.5], [x + r * wd, top + r * 0.5], [x, top - r * 0.6]], hc);
      else {
        g.rect(x - r * wd, top + r * 0.3, r * wd * 2, 1.6, hc);
        g.ell(x, top, r * 0.75, r * 0.6, hc, (px, py) => py < top + r * 0.4);
      }
      if (c === 'petasos') wings(g, 'feather', x, top, r * 0.9, 'white', 0);
      break;
    }
    case 'towers':
      g.rect(x - r * 0.9, top - r * 0.6, r * 1.8, r * 0.7, gold);
      for (const dx of [-0.7, 0, 0.7]) g.rect(x + dx * r - 0.8, top - r * 1, 1.6, r * 0.5, gold);
      break;
    case 'throne':
      g.rect(x - r * 0.4, top - r * 1.4, r * 0.4, r * 1.4, M('lapis'));
      g.rect(x - r * 0.4, top - r * 0.5, r * 1, r * 0.5, M('lapis'));
      break;
    case 'house':
      g.rect(x - r * 0.6, top - r * 0.9, r * 1.2, r * 0.9, M('lapis'));
      g.rect(x - r * 0.4, top - r * 1.4, r * 0.8, r * 0.5, M('gold'));
      break;
    case 'scorpion':
      g.ell(x, top - r * 0.4, r * 0.7, r * 0.4, M('copper'));
      g.curve([x + r * 0.6, top - r * 0.4], [x + r * 1.3, top - r * 1.5], [x + r * 0.3, top - r * 1.4], M('copper'), 1, 1);
      break;
    case 'goose':
      g.ell(x, top - r * 0.5, r * 0.8, r * 0.5, M('white'));
      g.line(x + r * 0.5, top - r * 0.6, x + r * 0.8, top - r * 1.5, M('white'), 1.4);
      g.px(x + r * 1.1, top - r * 1.5, F('orange'));
      break;
    case 'vulture':
      g.ell(x, y - r * 0.35, r * 1.1, r * 0.8, M('white'), (px, py) => py < y - r * 0.25);
      for (const s of [-1, 1]) g.rect(x + s * r * 1.05 - 0.8, y - r * 0.4, 1.6, r * 1.6, M('white'));
      g.px(x - 0.5, top - 0.5, M('gold'));
      break;
    case 'lotus': case 'papyrus':
      for (const dx of [-0.6, 0, 0.6]) g.line(x + dx * r * 0.5, top, x + dx * r, top - r * 1.3, M('leaf'));
      for (const dx of [-0.6, 0, 0.6]) g.ell(x + dx * r, top - r * 1.4, r * 0.3, r * 0.3, c === 'lotus' ? M('blue') : M('lime'));
      break;
    case 'cap':
      g.ell(x, y - r * 0.35, r * 0.95, r * 0.75, M(P.capc ?? 'lapis'), (px, py) => py < y - r * 0.3);
      break;
    case 'band':
      g.poly([[x - r * 0.5, top + r * 0.3], [x + r * 0.5, top + r * 0.3], [x, top + r * 0.9]], M('white'));
      break;
    case 'headwings':
      for (const s of [-1, 1]) g.poly([[x + s * r * 0.8, y - r * 0.4], [x + s * r * 2, y - r * 1.4], [x + s * r * 1.6, y - r * 0.2]], M('white'));
      break;
    case 'antlers':
      horns(g, 'antler', x, y, r, 'tan');
      break;
    case 'halo':
      break;
    case 'stars':
      for (let i = 0; i < 4; i++) g.px(x - r + rng() * r * 2, top - r * 0.6 - rng() * r, F('yellow', 2));
      break;
    default:
      break;
  }
}

/** Cabeza completa: pelo trasero, forma, pelo delantero, cuernos y tocado. */
function drawHead(g, P, x, y, r, rng) {
  if (P.crown === 'halo') g.ell(x, y - r * 0.1, r * 1.45, r * 1.45, F('yellow', 2));
  if (P.halo) g.ell(x, y - r * 0.1, r * 1.5, r * 1.5, F(P.halo === true ? 'yellow' : P.halo, 2));
  const animal = P.head && P.head !== 'human' && P.head !== 'oni';
  if (!animal) drawHair(g, P, x, y, r, 'back', rng);
  headShape(g, P, x, y, r, rng);
  if (!animal) drawHair(g, P, x, y, r, 'front', rng);
  if (P.head === 'oni' && !P.horns) horns(g, 'small', x, y, r, P.hornc ?? 'bone');
  horns(g, P.horns, x, y, r, P.hornc ?? 'bone');
  crown(g, P, x, y, r, rng);
}

// ---------------------------------------------------------------- objetos en la mano

function item(g, kind, hx, hy, P, u, H, left = false) {
  if (!kind) return;
  const yb = H - 2;
  const top = Math.max(2, hy - 13 * u);
  const s = left ? -1 : 1;
  const wood = M('wood');
  const metal = M(P.itemc ?? 'silver');
  const gold = M('gold');
  switch (kind) {
    case 'spear': case 'trident': case 'bident': case 'staff': case 'was': case 'scythe': case 'caduceus': case 'thyrsus': case 'crook': case 'banner': case 'broom': {
      const shaft = kind === 'staff' || kind === 'broom' ? wood : kind === 'was' || kind === 'caduceus' || kind === 'crook' ? gold : wood;
      g.rect(hx - 0.5, top, 1, yb - top, shaft);
      if (kind === 'spear') g.poly([[hx - 1.5, top + 2], [hx + 1.5, top + 2], [hx, top - 2.5 * u]], metal);
      if (kind === 'trident' || kind === 'bident') {
        g.rect(hx - 2.5 * u, top, 5 * u, 1, M(P.itemc ?? 'gold'));
        for (const dx of kind === 'trident' ? [-2.5, 0, 2.5] : [-1.6, 1.6]) g.rect(hx + dx * u - 0.5, top - 3 * u, 1, 3 * u, M(P.itemc ?? 'gold'));
      }
      if (kind === 'staff') g.ell(hx, top, 1.5 * u, 1.5 * u, M(P.itemc ?? 'cyan', { flat: true, tone: 2 }));
      if (kind === 'was') { g.line(hx, top, hx + 2 * u, top - 1.5 * u, gold); g.line(hx, yb, hx - 1, yb - 1.5 * u, gold); }
      if (kind === 'scythe') g.curve([hx, top], [hx - 5 * u * s, top - 2 * u], [hx - 7 * u * s, top + 3 * u], metal, 1.4, 1);
      if (kind === 'caduceus') { g.ell(hx, top, 1, 1, gold); wings(g, 'feather', hx, top + 1, 2.2 * u, 'white'); g.curve([hx - 1.5, top + 3 * u], [hx + 2, top + 5 * u], [hx - 1.5, top + 7 * u], M('green')); }
      if (kind === 'thyrsus') g.ell(hx, top, 1.4 * u, 2 * u, M('olive'));
      if (kind === 'crook') g.curve([hx, top + 2], [hx, top - 2 * u], [hx + 2.5 * u * s, top], gold, 1.4, 1);
      if (kind === 'banner') g.rect(hx, top, 5 * u * s, 4 * u, M(P.itemc ?? 'red'));
      if (kind === 'broom') g.poly([[hx - 2 * u, yb], [hx + 2 * u, yb], [hx, yb - 4 * u]], M('tan'));
      break;
    }
    case 'sword': case 'knife':
      g.rect(hx - 0.5, hy - (kind === 'knife' ? 4 : 9) * u, 1.4, (kind === 'knife' ? 4 : 9) * u, M(P.itemc ?? 'silver'));
      g.rect(hx - 1.5 * u, hy, 3 * u, 1, gold);
      break;
    case 'hammer': case 'mjolnir':
      g.rect(hx - 0.5, hy - 1, 1.2, 4 * u, wood);
      g.rect(hx - 2.5 * u, hy - 3.5 * u, 5 * u, 3 * u, M(P.itemc ?? 'silver'));
      break;
    case 'axe':
      g.rect(hx - 0.5, hy - 8 * u, 1, 10 * u, wood);
      g.poly([[hx, hy - 8 * u], [hx + 3.5 * u * s, hy - 9.5 * u], [hx + 3.5 * u * s, hy - 4.5 * u], [hx, hy - 6 * u]], metal);
      break;
    case 'club':
      g.line(hx, hy + 1, hx + 1 * s, hy - 8 * u, wood, 2.4);
      break;
    case 'sickle':
      g.curve([hx, hy], [hx + 4 * u * s, hy - 4 * u], [hx, hy - 6 * u], M(P.itemc ?? 'silver'), 1.4, 1);
      break;
    case 'torch': case 'flame':
      if (kind === 'torch') g.rect(hx - 0.5, hy - 5 * u, 1.2, 6 * u, wood);
      g.ell(hx, hy - (kind === 'torch' ? 6.5 : 2) * u, 1.6 * u, 2.2 * u, F('fire', 1));
      g.ell(hx, hy - (kind === 'torch' ? 6 : 1.5) * u, 0.8 * u, 1.2 * u, F('fire', 2));
      break;
    case 'bolt':
      g.poly([[hx + 1 * u, hy - 9 * u], [hx - 1.5 * u, hy - 3.5 * u], [hx + 0.5 * u, hy - 3.5 * u], [hx - 1 * u, hy + 1 * u], [hx + 2.5 * u, hy - 5 * u], [hx + 0.5 * u, hy - 5 * u], [hx + 2.5 * u, hy - 9 * u]], F('yellow', 2));
      break;
    case 'bow':
      g.curve([hx + 1 * s, hy - 7 * u], [hx + 4.5 * u * s, hy - 2 * u], [hx + 1 * s, hy + 3 * u], M('wood'), 1.4, 1.4);
      g.line(hx + 1 * s, hy - 7 * u, hx + 1 * s, hy + 3 * u, F('white', 2));
      break;
    case 'lyre': case 'harp':
      g.curve([hx - 1.5 * u, hy - 5 * u], [hx, hy + 2 * u], [hx + 1.5 * u, hy - 5 * u], gold, 1.3, 1.3);
      g.rect(hx - 1.5 * u, hy - 5 * u, 3 * u, 1, gold);
      g.line(hx - 0.5, hy - 5 * u, hx - 0.5, hy, F('white', 2));
      break;
    case 'shield':
      g.ell(hx, hy - 2 * u, 3 * u, 3.4 * u, M(P.shieldc ?? 'bronze'));
      g.ell(hx, hy - 2 * u, 1, 1, gold);
      break;
    case 'horn':
      g.curve([hx, hy], [hx + 3 * u * s, hy - 1 * u], [hx + 4 * u * s, hy - 5 * u], M('bone'), 1.2, 2.6);
      break;
    case 'cup': case 'bowl': case 'cauldron':
      if (kind === 'cauldron') g.ell(hx, hy, 3 * u, 2.4 * u, M('black'));
      else { g.rect(hx - 1.5 * u, hy - 2.5 * u, 3 * u, 2 * u, M(P.itemc ?? 'gold')); if (kind === 'cup') g.rect(hx - 0.5, hy - 1, 1, 2, gold); }
      break;
    case 'jar': case 'vase':
      g.ell(hx, hy - 1.5 * u, 2 * u, 2.4 * u, M(P.itemc ?? 'copper'));
      g.rect(hx - 1, hy - 4.5 * u, 2, 1.5 * u, M('copper'));
      break;
    case 'apple': case 'pomegranate': case 'orb': case 'sun': case 'pearl': case 'egg':
      g.ell(hx, hy - 1.5 * u, (kind === 'sun' ? 2.4 : 1.6) * u, (kind === 'sun' ? 2.4 : 1.6) * u,
        kind === 'sun' ? F('yellow', 2) : M(P.itemc ?? (kind === 'apple' ? 'gold' : kind === 'pomegranate' ? 'red' : kind === 'pearl' ? 'white' : kind === 'egg' ? 'cream' : 'cyan')));
      break;
    case 'globe':
      g.ell(hx, hy, 6 * u, 6 * u, M('blue'));
      g.ell(hx - 1.5 * u, hy - 1 * u, 2.5 * u, 2 * u, M('green'));
      break;
    case 'basket':
      g.rect(hx - 2 * u, hy - 2 * u, 4 * u, 2.5 * u, M('tan'));
      for (const dx of [-1, 0, 1]) g.ell(hx + dx * 1.2 * u, hy - 2.5 * u, 1, 1, M('gold'));
      break;
    case 'wheat': case 'papyrus': case 'herbs': case 'mistletoe':
      for (const dx of [-1, 0, 1]) g.line(hx, hy + 1, hx + dx * 1.5 * u, hy - 6 * u, M(kind === 'wheat' ? 'gold' : 'leaf'));
      if (kind === 'wheat') for (const dx of [-1, 0, 1]) g.ell(hx + dx * 1.5 * u, hy - 6 * u, 0.8, 1.5 * u, M('gold'));
      break;
    case 'key':
      g.rect(hx - 0.5, hy - 4 * u, 1, 4 * u, gold);
      g.ell(hx, hy - 4.5 * u, 1.2 * u, 1.2 * u, gold);
      break;
    case 'mirror':
      g.rect(hx - 0.5, hy - 1, 1, 2 * u, gold);
      g.ell(hx, hy - 2.5 * u, 1.8 * u, 2 * u, M('cyan'));
      break;
    case 'book': case 'scroll': case 'tablet':
      g.rect(hx - 2 * u, hy - 3 * u, 4 * u, 3 * u, M(kind === 'book' ? 'red' : kind === 'tablet' ? 'stone' : 'cream'));
      break;
    case 'lantern': case 'lamp':
      if (kind === 'lantern') g.rect(hx - 0.5, hy - 2 * u, 1, 2 * u, M('black'));
      g.ell(hx, hy + 1 * u, 1.8 * u, 2 * u, kind === 'lamp' ? M('gold') : F('yellow', 2));
      break;
    case 'ankh':
      g.ell(hx, hy - 4 * u, 1.2 * u, 1.4 * u, gold);
      g.ell(hx, hy - 4 * u, 0.4 * u, 0.6 * u, F('black', 0));
      g.rect(hx - 1.8 * u, hy - 2.7 * u, 3.6 * u, 1, gold);
      g.rect(hx - 0.5, hy - 2.7 * u, 1, 3 * u, gold);
      break;
    case 'flail':
      g.rect(hx - 0.5, hy - 3 * u, 1, 3 * u, gold);
      for (const dx of [-1, 0, 1]) g.line(hx, hy - 3 * u, hx + dx + 2 * s, hy - 1 * u, M('lapis'));
      break;
    case 'net':
      for (let i = 0; i < 4; i++) { g.line(hx - 2 * u + i * 1.3 * u, hy - 4 * u, hx - 2 * u + i * 1.3 * u, hy + 2 * u, F('tan', 2)); g.line(hx - 2.5 * u, hy - 3 * u + i * 1.5 * u, hx + 2.5 * u, hy - 3 * u + i * 1.5 * u, F('tan', 2)); }
      break;
    case 'panpipes':
      for (let i = 0; i < 4; i++) g.rect(hx - 2 * u + i * u, hy - (3 - i * 0.5) * u, 0.9 * u, (3 - i * 0.5) * u, M('tan'));
      break;
    case 'spindle': case 'distaff':
      g.rect(hx - 0.5, hy - 6 * u, 1, 7 * u, wood);
      g.ell(hx, hy - 5 * u, 1.5 * u, 1.8 * u, M('white'));
      break;
    case 'skull':
      g.ell(hx, hy - 1.5 * u, 1.6 * u, 1.6 * u, M('bone'));
      g.px(hx - 1, hy - 1.5 * u, F('black', 0)); g.px(hx + 0.5, hy - 1.5 * u, F('black', 0));
      break;
    case 'chain':
      for (let i = 0; i < 5; i++) g.ell(hx, hy + i * 1.6 * u, 0.9 * u, 0.9 * u, M('gray'));
      break;
    case 'sack':
      g.ell(hx, hy + 1 * u, 2.5 * u, 3 * u, M('tan'));
      break;
    case 'fan':
      g.poly([[hx, hy], [hx - 3 * u, hy - 4 * u], [hx + 3 * u, hy - 4 * u]], M(P.itemc ?? 'red'));
      break;
    case 'gourd':
      g.ell(hx, hy, 1.5 * u, 1.7 * u, M('orange')); g.ell(hx, hy - 2 * u, 1 * u, 1 * u, M('orange'));
      break;
    case 'cigar':
      g.rect(hx - 1.5 * u, hy - 1, 3 * u, 1, M('brown')); g.px(hx + 1.5 * u * s, hy - 1, F('fire', 2));
      break;
    case 'umbrella':
      g.rect(hx - 0.5, hy - 6 * u, 1, 7 * u, wood);
      g.ell(hx, hy - 6 * u, 4 * u, 2 * u, M(P.itemc ?? 'red'), (px, py) => py < hy - 6 * u + 0.5);
      break;
    case 'plough':
      g.line(hx, hy, hx + 4 * u * s, hy + 4 * u, wood, 1.4); g.poly([[hx + 4 * u * s, hy + 4 * u], [hx + 6 * u * s, hy + 5 * u], [hx + 3 * u * s, hy + 5.5 * u]], metal);
      break;
    case 'moon':
      g.ell(hx, hy - 2 * u, 2 * u, 2 * u, M('silver'), (px, py) => (px - hx - u) ** 2 + (py - hy + 2.5 * u) ** 2 > (1.6 * u) ** 2);
      break;
    case 'snake':
      g.curve([hx, hy + 2 * u], [hx + 3 * u * s, hy - 2 * u], [hx, hy - 5 * u], M('green'), 1.4, 1.4);
      break;
    case 'wand':
      g.rect(hx - 0.5, hy - 4 * u, 1, 4 * u, M('wood')); g.px(hx - 0.5, hy - 4.5 * u, F('white', 2));
      break;
    default:
      break;
  }
}

// ---------------------------------------------------------------- arquetipos

function humanoid(g, P, rng) {
  const W = g.w, H = g.h;
  const S = num(P.scale, 1) * (P.small ? 0.7 : P.child ? 0.82 : 1);
  const u = (H / 34) * S;
  const bw = P.big ? 1.35 : P.slim ? 0.85 : 1;
  const legs = P.legs ?? 'human';
  const yb = H - 2;
  let cx = W / 2 + (legs === 'horse' ? -3.5 * (H / 34) : legs === 'scorpion' ? -2 * (H / 34) : 0) + num(P.dx, 0);
  const skinName = P.skin ?? (P.body === 'kilt' ? 'skin2' : 'skin');
  const skin = M(skinName);
  const cName = P.c ?? (P.fem ? 'violet' : 'blue');
  const cloth = M(cName);
  const c2Name = P.c2 ?? cName;
  const cloth2 = M(c2Name);
  const body = P.body ?? (P.fem ? 'robe' : 'tunic');
  const fur = P.fur ?? 'brown';

  const legLen = (legs === 'horse' ? 8.5 : legs === 'spider' || legs === 'scorpion' ? 7.5 : 7) * u;
  const hipY = yb - legLen - (P.float ? 2 * u : 0);
  const shY = hipY - 8 * u * (P.big ? 1.05 : 1);
  const headR = (P.small ? 4.8 : P.child ? 4.6 : 4.1) * u * (P.big ? 0.82 : 1) * num(P.headscale, 1);
  const headCY = shY - headR * 0.82;
  const halfSh = (P.fem ? 2.9 : 3.3) * u * bw, halfHip = (P.fem ? 3 : 2.7) * u * bw;

  aura(g, P, cx, (headCY + yb) / 2, 9 * u, (yb - headCY) / 2 + 3 * u);
  if (P.cape) g.poly([[cx - halfSh, shY], [cx + halfSh, shY], [cx + halfSh + 2.5 * u, yb - 1], [cx - halfSh - 2.5 * u, yb - 1]], M(P.cape === true ? 'red' : P.cape));
  if (P.wings) wings(g, P.wingk ?? (P.wings === 'bat' ? 'bat' : P.wings === 'fire' ? 'fire' : P.wings === 'insect' ? 'insect' : 'feather'),
    cx, shY + 1.5 * u, 8 * u * (P.big ? 1.2 : 1), ['bat', 'fire', 'insect', 'feather', true].includes(P.wings) ? (P.wingc ?? (P.wings === 'bat' ? 'black' : 'white')) : P.wings, 0, u);
  if (P.tail) {
    const tm = M(P.tailc ?? fur);
    if (P.tail === 'fox') for (let i = 0; i < num(P.tails, 1); i++) g.curve([cx, hipY], [cx + (6 + i) * u, hipY + 2 * u], [cx + (5 + i * 1.5) * u, hipY - (5 + i) * u], tm, 2.6, 1.6);
    else g.curve([cx, hipY], [cx + 6 * u, hipY + 3 * u], [cx + 6 * u, hipY - 4 * u], tm, 1.4, 1);
  }

  // ---- parte inferior
  if (legs === 'horse') {
    const hx = cx + 5.5 * u, hy = yb - 6 * u;
    const hm = M(P.fur ?? 'brown');
    g.curve([hx + 6 * u, hy - 1], [hx + 9 * u, hy + 1 * u], [hx + 8 * u, hy + 5 * u], M(P.tailc ?? 'black'), 2, 1);
    for (const [dx, dk] of [[-3.5, 1], [4.5, 1], [-2, 0], [6, 0]]) g.rect(hx + dx * u - 0.8 * u, hy, 1.6 * u, yb - hy + 0.5, dk ? Mdark(P.fur ?? 'brown') : hm);
    g.ell(hx + 1 * u, hy - 0.5 * u, 6.8 * u, 3 * u, hm);
  } else if (legs === 'spider' || legs === 'scorpion') {
    const am = M(P.fur ?? 'black');
    for (let i = 0; i < 4; i++) for (const s of [-1, 1]) {
      const bx = cx + s * (1 + i * 0.6) * u, by = hipY + 2 * u;
      g.curve([bx, by], [bx + s * (4 + i) * u, by - 3 * u], [bx + s * (5 + i * 1.6) * u, yb], am, 1.2, 1);
    }
    g.ell(cx + (legs === 'scorpion' ? 3 * u : 0), hipY + 3 * u, 5 * u, 3 * u, am);
    if (legs === 'scorpion') {
      for (let i = 0; i < 5; i++) g.ell(cx + (7 + i * 1.2) * u, hipY + 1 * u - i * 2.3 * u, 1.4 * u, 1.4 * u, am);
      g.poly([[cx + 12 * u, hipY - 10 * u], [cx + 10 * u, hipY - 12 * u], [cx + 13 * u, hipY - 12 * u]], M('red'));
    }
  } else if (legs === 'fish') {
    const tm = M(P.tailc ?? 'teal');
    g.poly([[cx - halfHip, hipY - 1], [cx + halfHip, hipY - 1], [cx + halfHip * 0.6, yb - 4 * u], [cx + 2 * u, yb - 3 * u], [cx - 1 * u, yb - 3 * u]], tm);
    g.poly([[cx + 0.5 * u, yb - 3.5 * u], [cx + 5 * u, yb - 0.5], [cx + 1 * u, yb - 1.5 * u], [cx - 3 * u, yb - 0.5]], Mdark(P.tailc ?? 'teal'));
    if (P.sea !== false) g.rect(0, yb - 1.5 * u, W, 2 * u, GLOW('water', 0.6));
  } else if (legs === 'snake') {
    const tm = M(P.tailc ?? 'green');
    g.rect(cx - halfHip, hipY - 1, halfHip * 2, 3 * u, tm);
    g.ell(cx, yb - 2.2 * u, halfHip + 5 * u, 2.4 * u, tm);
    g.ell(cx + 1 * u, yb - 4.4 * u, halfHip + 2 * u, 2 * u, tm);
    g.curve([cx + halfHip + 4 * u, yb - 2 * u], [cx + halfHip + 7 * u, yb - 4 * u], [cx + halfHip + 5 * u, yb - 7 * u], tm, 1.6, 1);
  } else if (legs === 'none') {
    const gm = body === 'bare' ? skin : cloth;
    g.poly([[cx - halfHip - 1 * u, hipY - 1], [cx + halfHip + 1 * u, hipY - 1], [cx + 1.5 * u, yb - 3 * u], [cx + 4 * u, yb - 1], [cx - 1 * u, yb - 3 * u]], gm);
  } else if (legs === 'goat' || legs === 'bird') {
    const lm = M(legs === 'bird' ? (P.legc ?? 'gold') : fur);
    for (const s of [-1, 1]) {
      g.rect(cx + s * 1.6 * u - 1.1 * u, hipY, 2.2 * u, 3.5 * u, legs === 'bird' ? M(P.wingc ?? 'white') : lm);
      g.line(cx + s * 1.6 * u, hipY + 3 * u, cx + s * 2.4 * u, yb - 1, lm, 1.4 * u);
      g.rect(cx + s * 2.4 * u - 1 * u, yb - 1, 2 * u, 1.2, M('black'));
    }
  } else if (!(body === 'robe' || body === 'dress' || body === 'mummy' || body === 'kimono')) {
    const legM = P.legc ? M(P.legc) : body === 'armor' ? cloth2 : body === 'bare' || body === 'kilt' || body === 'loin' || body === 'fur' ? skin : cloth2;
    for (const s of [-1, 1]) {
      g.rect(cx + s * (halfHip * 0.5) - 1.15 * u * bw, hipY, 2.3 * u * bw, legLen, legM);
      g.rect(cx + s * (halfHip * 0.5) - 1.3 * u * bw, yb - 1 * u, 2.6 * u * bw, 1.2 * u, M(P.shoec ?? (body === 'bare' || body === 'loin' ? skinName : 'brown')));
    }
  }

  // ---- torso
  const torso = [[cx - halfSh, shY], [cx + halfSh, shY], [cx + halfHip, hipY], [cx - halfHip, hipY]];
  if (body === 'robe' || body === 'dress' || body === 'kimono') {
    const bottom = legs === 'human' ? yb : hipY + 2 * u;
    g.poly([[cx - halfSh, shY], [cx + halfSh, shY], [cx + halfHip + 2.2 * u, bottom], [cx - halfHip - 2.2 * u, bottom]], cloth);
    if (body === 'kimono') {
      g.line(cx - 2 * u, shY, cx + 0.5, hipY - 2 * u, F('white', 2));
      g.line(cx + 2 * u, shY, cx - 0.5, hipY - 2 * u, F('white', 2));
      g.rect(cx - halfHip - 0.5 * u, hipY - 2.5 * u, (halfHip + 0.5 * u) * 2, 2 * u, cloth2);
    } else if (P.c2) {
      g.rect(cx - halfHip - 0.5, hipY - 1.5 * u, halfHip * 2 + 1, 1, cloth2);
      if (legs === 'human') g.rect(cx - halfHip - 2.2 * u, yb - 1, (halfHip + 2.2 * u) * 2, 1, cloth2);
    }
  } else if (body === 'mummy') {
    g.poly([[cx - halfSh, shY], [cx + halfSh, shY], [cx + halfHip, hipY], [cx + halfHip * 0.8, yb], [cx - halfHip * 0.8, yb], [cx - halfHip, hipY]], cloth);
    for (let yy = shY + 2; yy < yb; yy += 2.5 * u) g.line(cx - halfHip, yy, cx + halfHip, yy + 1, Mdark(cName));
  } else if (body === 'bare' || body === 'kilt' || body === 'loin' || body === 'fur' || body === 'bones') {
    g.poly(torso, body === 'bones' ? M('black') : body === 'fur' ? M(fur) : skin);
    if (body === 'bones') for (let i = 0; i < 3; i++) g.rect(cx - halfSh * 0.7, shY + 1.5 * u + i * 2 * u, halfSh * 1.4, 1, M('bone'));
    if (body === 'kilt') {
      g.poly([[cx - halfHip - 0.5, hipY - 1.2 * u], [cx + halfHip + 0.5, hipY - 1.2 * u], [cx + halfHip + 1 * u, hipY + 3.5 * u], [cx - halfHip - 1 * u, hipY + 3.5 * u]], M(P.c ?? 'cream'));
      g.rect(cx - halfHip, hipY - 1.4 * u, halfHip * 2, 1, M('gold'));
      g.ell(cx, shY + 0.5, halfSh + 0.5, 2 * u, M(P.c2 ?? 'gold'), (px, py) => py > shY);
    }
    if (body === 'loin') g.rect(cx - halfHip, hipY - 1, halfHip * 2, 2.5 * u, M(P.c ?? 'brown'));
    if (P.c2 && body === 'bare') g.line(cx - halfSh, shY + 1, cx + halfHip, hipY - 1, cloth2, 1.4);
  } else if (body === 'armor') {
    g.poly(torso, cloth2);
    g.rect(cx - halfHip - 0.5 * u, hipY - 1, halfHip * 2 + 1 * u, 2.5 * u, cloth);
    g.ell(cx, shY + 2.5 * u, halfSh * 0.6, 1.8 * u, M(c2Name, { tone: 2, flat: true }));
  } else {
    // túnica
    g.poly(torso, cloth);
    g.poly([[cx - halfHip, hipY - 1], [cx + halfHip, hipY - 1], [cx + halfHip + 1 * u, hipY + 3 * u], [cx - halfHip - 1 * u, hipY + 3 * u]], cloth);
    if (P.c2) g.rect(cx - halfHip, hipY - 1.5 * u, halfHip * 2, 1, cloth2);
  }
  if (P.collar) g.ell(cx, shY + 0.5, halfSh + 0.5, 2 * u, M(P.collar === true ? 'gold' : P.collar), (px, py) => py > shY);
  if (P.necklace) g.rect(cx - 1.5 * u, shY + 1.5 * u, 3 * u, 1, F(P.necklace === true ? 'gold' : P.necklace, 2));

  // ---- brazos
  const sleeve = body === 'bare' || body === 'kilt' || body === 'loin' || body === 'bones' ? skin : body === 'armor' ? cloth2 : body === 'fur' ? M(fur) : cloth;
  const handY = hipY + 0.5 * u;
  const armW = 1.9 * u * (P.big ? 1.25 : 1);
  if (body === 'mummy' && !P.item) {
    g.rect(cx - halfSh + 0.5, shY + 2.5 * u, halfSh * 2 - 1, 2 * u, sleeve);
  } else if (P.pose === 'up') {
    for (const s of [-1, 1]) g.line(cx + s * halfSh, shY + 1, cx + s * (halfSh + 2.5 * u), headCY - headR * 1.6, sleeve, armW);
  } else if (P.pose === 'wide') {
    for (const s of [-1, 1]) g.line(cx + s * halfSh, shY + 1, cx + s * (halfSh + 5 * u), shY - 2 * u, sleeve, armW);
  } else {
    for (const s of [-1, 1]) {
      g.rect(cx + s * (halfSh + armW / 2) - armW / 2, shY + 0.3, armW, handY - shY, sleeve);
      g.rect(cx + s * (halfSh + armW / 2) - armW / 2, handY - 0.3, armW, 1.4 * u, P.claws ? M(P.claws === true ? 'bone' : P.claws) : skin);
    }
  }
  const nArms = num(P.arms, 2);
  if (nArms > 2) {
    const extra = Math.min(nArms - 2, 8);
    for (let i = 0; i < extra; i++) {
      const s = i % 2 ? 1 : -1;
      const k = Math.floor(i / 2);
      g.line(cx + s * halfSh * 0.8, shY + (1 + k) * u, cx + s * (halfSh + (4 + k * 1.5) * u), shY - (3 - k * 2.5) * u, skin, armW * 0.9);
    }
  }

  // ---- cabeza(s)
  if (!P.headless) {
    const nh = num(P.heads, 1);
    const offs = nh === 1 ? [0] : nh === 2 ? [-1, 1] : [-1.25, 0, 1.25];
    for (const o of offs) drawHead(g, P, cx + o * headR * 1.5, headCY - (nh > 1 && o === 0 ? 1 : 0), nh > 1 ? headR * 0.82 : headR, rng);
  } else if (P.chestface) {
    face(g, { ...P, mouth: 'open' }, cx, shY + 3.5 * u, 3.4 * u);
  } else {
    g.rect(cx - 1.5 * u, shY - 1, 3 * u, 1.2, M('blood'));
    drawHead(g, { ...P, crown: null }, cx - halfSh - 1 * u, handY - headR * 0.6, headR * 0.75, rng);
  }

  // ---- objetos
  item(g, P.item, cx + halfSh + armW / 2, P.pose === 'up' ? headCY - headR * 2 : handY, P, u, H);
  item(g, P.item2, cx - halfSh - armW / 2, handY, P, u, H, true);
  if (P.pose === 'up' && P.item === 'globe') item(g, 'globe', cx, headCY - headR * 2.2, P, u, H);
  if (P.flames) flames(g, cx, yb, W * 0.9, 5 * u, rng);
}

// ---------------- cuadrúpedos (de perfil, mirando a la derecha)

const QUAD = {
  dog: { bl: 6, bh: 3, leg: 5, neck: 2, head: 2.6, snout: 1.8, ear: 'up' },
  wolf: { bl: 6.8, bh: 3.2, leg: 5.4, neck: 2, head: 2.7, snout: 2, ear: 'up' },
  fox: { bl: 6, bh: 2.6, leg: 4, neck: 1.5, head: 2.4, snout: 1.8, ear: 'up' },
  hyena: { bl: 6.5, bh: 3.4, leg: 5, neck: 1.5, head: 2.8, snout: 1.6, ear: 'round' },
  lion: { bl: 7.2, bh: 3.6, leg: 5, neck: 1.5, head: 3, snout: 1.4, ear: 'round' },
  cat: { bl: 5.5, bh: 2.6, leg: 4.2, neck: 1, head: 2.6, snout: 0.8, ear: 'up' },
  tiger: { bl: 7.2, bh: 3.4, leg: 5, neck: 1.2, head: 2.9, snout: 1.2, ear: 'round' },
  horse: { bl: 7.5, bh: 3.4, leg: 7, neck: 4.5, head: 2.4, snout: 2.4, ear: 'up', hoof: 1 },
  deer: { bl: 6.5, bh: 2.8, leg: 7.5, neck: 4, head: 2.2, snout: 1.8, ear: 'side', hoof: 1 },
  bull: { bl: 8, bh: 4.4, leg: 5, neck: 1, head: 3, snout: 1.6, ear: 'side', hoof: 1 },
  cow: { bl: 7.5, bh: 4, leg: 5, neck: 1.2, head: 2.8, snout: 1.6, ear: 'side', hoof: 1 },
  boar: { bl: 7, bh: 4, leg: 3.5, neck: 0.5, head: 3, snout: 2, ear: 'up', hoof: 1 },
  goat: { bl: 6, bh: 3, leg: 5.5, neck: 2, head: 2.3, snout: 1.6, ear: 'side', hoof: 1 },
  sheep: { bl: 6, bh: 3.6, leg: 4, neck: 1, head: 2.3, snout: 1.4, ear: 'side', hoof: 1 },
  bear: { bl: 8, bh: 4.6, leg: 4.5, neck: 1, head: 3, snout: 1.6, ear: 'round' },
  rabbit: { bl: 4.5, bh: 3, leg: 2.5, neck: 0.5, head: 2.4, snout: 0.8, ear: 'long' },
  rodent: { bl: 4.5, bh: 2.6, leg: 2, neck: 0.5, head: 2.2, snout: 1.4, ear: 'round' },
  elephant: { bl: 8.5, bh: 5.5, leg: 6, neck: 0.5, head: 4, snout: 0, ear: 'big' },
  lizard: { bl: 8, bh: 2.2, leg: 2.5, neck: 1, head: 2.4, snout: 2, ear: null },
  rhino: { bl: 8, bh: 4.4, leg: 4.5, neck: 0.5, head: 3, snout: 2, ear: 'up', hoof: 1 },
  monkey: { bl: 5, bh: 3, leg: 4.5, neck: 1, head: 2.6, snout: 0.6, ear: 'round' },
  dragon: { bl: 7, bh: 3.6, leg: 4.5, neck: 3, head: 2.6, snout: 2.4, ear: null },
  croc: { bl: 8, bh: 2.4, leg: 2.5, neck: 0.5, head: 2.4, snout: 3, ear: null },
  hippo: { bl: 8, bh: 4.6, leg: 3.5, neck: 0.5, head: 3.2, snout: 1.8, ear: 'round' }
};

function sideHead(g, P, kind, hx, hy, r, cm, rng) {
  const furName = P.c ?? 'brown';
  const hk = P.head ?? kind;
  const snoutLen = (QUAD[hk]?.snout ?? 1.6) * (r / 2.6);
  if (hk === 'eagle' || hk === 'bird' || hk === 'rooster') {
    g.ell(hx, hy, r * 0.95, r * 0.9, M(P.headc ?? (hk === 'eagle' ? 'white' : furName)));
    g.poly([[hx + r * 0.6, hy - r * 0.3], [hx + r * 1.9, hy + r * 0.1], [hx + r * 0.8, hy + r * 0.7]], M('gold'));
    if (hk === 'rooster') g.poly([[hx - r * 0.4, hy - r * 0.6], [hx + r * 0.5, hy - r * 0.6], [hx, hy - r * 1.5]], M('red'));
    eyeAt(g, hx + r * 0.2, hy - r * 0.25, P);
    return;
  }
  if (hk === 'human') {
    g.ell(hx, hy, r * 0.9, r * 1, M(P.skin ?? 'skin'));
    drawHair(g, { ...P, hair: P.hair ?? 'long', fem: P.fem }, hx - r * 0.2, hy, r, 'front', rng);
    if (P.hair === 'mane' || P.mane) g.ell(hx - r * 0.5, hy + r * 0.2, r * 0.9, r * 1.3, M(P.manec ?? 'ochre'), (px) => px < hx - r * 0.2);
    if (P.beard) g.ell(hx + r * 0.2, hy + r * 0.9, r * 0.7, r * 0.8, M(P.beardc ?? P.hairc ?? 'black'));
    eyeAt(g, hx + r * 0.45, hy, P);
    if (P.crown) crown(g, P, hx, hy, r, rng);
    return;
  }
  if (hk === 'snake') {
    g.ell(hx, hy, r * 0.9, r * 0.7, M(P.headc ?? 'green'));
    g.ell(hx + r * 0.8, hy + r * 0.1, r * 0.7, r * 0.5, M(P.headc ?? 'green'));
    eyeAt(g, hx + r * 0.3, hy - r * 0.3, { eye: 'yellow' });
    return;
  }
  // cabeza animal genérica
  const ear = QUAD[hk]?.ear ?? 'up';
  if (ear === 'up') g.poly([[hx - r * 0.6, hy - r * 0.5], [hx + r * 0.1, hy - r * 0.6], [hx - r * 0.35, hy - r * (kind === 'horse' ? 1.5 : 1.7)]], cm);
  if (ear === 'round') g.ell(hx - r * 0.4, hy - r * 0.8, r * 0.35, r * 0.35, cm);
  if (ear === 'long') g.ell(hx - r * 0.3, hy - r * 1.6, r * 0.3, r * 1, cm);
  if (ear === 'side') g.ell(hx - r * 0.7, hy - r * 0.3, r * 0.5, r * 0.25, cm);
  if (ear === 'big') g.ell(hx - r * 0.5, hy, r * 0.8, r * 1, Mdark(furName));
  g.ell(hx, hy, r * 0.95, r * 0.85, cm);
  if (snoutLen > 0) g.ell(hx + r * 0.6 + snoutLen * 0.5, hy + r * 0.25, snoutLen * 0.75 + r * 0.2, r * 0.5, M(P.snoutc ?? furName));
  if (hk === 'elephant') {
    g.curve([hx + r * 0.7, hy + r * 0.2], [hx + r * 1.4, hy + r * 1.5], [hx + r * 1.1, hy + r * 2.4], cm, r * 0.6, r * 0.4);
    g.line(hx + r * 0.7, hy + r * 0.8, hx + r * 1.6, hy + r * 1, F('white', 2));
  }
  if (hk === 'boar') g.line(hx + r * 1.2, hy + r * 0.6, hx + r * 1.4, hy - r * 0.1, F('white', 2));
  if (hk === 'lion' && (P.mane !== false)) g.ell(hx - r * 0.3, hy + r * 0.1, r * 1.1, r * 1.25, M(P.manec ?? 'ochre'), (px) => px < hx + r * 0.1);
  if (P.mane && hk !== 'lion') g.rect(hx - r * 1.2, hy - r * 0.6, r * 0.8, r * 2, M(P.manec ?? 'black'));
  eyeAt(g, hx + r * 0.2, hy - r * 0.2, P);
  g.px(hx + r * 0.6 + snoutLen + r * 0.1, hy + r * 0.1, F('black', 0));
  if (P.fangs) g.px(hx + r * 0.6 + snoutLen * 0.6, hy + r * 0.75, F('white', 2));
  if (P.horn) g.line(hx + r * 0.3, hy - r * 0.6, hx + r * 1.2, hy - r * 2.4, M(P.hornc ?? 'gold'), 1.2);
  if (P.horns) {
    const hc = M(P.hornc ?? 'bone');
    if (P.horns === 'antler') { g.line(hx - r * 0.2, hy - r * 0.7, hx - r * 0.6, hy - r * 2.4, hc); g.line(hx - r * 0.4, hy - r * 1.6, hx + r * 0.4, hy - r * 2.2, hc); g.line(hx - r * 0.5, hy - r * 2, hx - r * 1.3, hy - r * 2.3, hc); }
    else if (P.horns === 'ram') { g.ell(hx - r * 0.4, hy - r * 0.3, r * 0.6, r * 0.6, hc); g.ell(hx - r * 0.4, hy - r * 0.3, r * 0.2, r * 0.2, Mdark(P.hornc ?? 'bone')); }
    else if (P.horns === 'nose') g.poly([[hx + r * 0.9 + snoutLen, hy - r * 0.1], [hx + r * 0.4 + snoutLen, hy - r * 0.1], [hx + r * 0.9 + snoutLen, hy - r * 1.4]], hc);
    else g.curve([hx - r * 0.1, hy - r * 0.6], [hx + r * 0.2, hy - r * 1.8], [hx + r * 1.1, hy - r * 1.6], hc, 1.6, 1);
  }
}

function quad(g, P, rng) {
  const W = g.w, H = g.h;
  const kind = QUAD[P.kind] ? P.kind : 'dog';
  const Q = { ...QUAD[kind], ...(P.neck ? { neck: num(P.neck, 2) } : {}) };
  const S = num(P.scale, 1);
  const u = (H / 34) * S * (P.small ? 0.75 : 1);
  const yb = H - 2;
  const cName = P.c ?? 'brown';
  const cm = M(cName);
  const dm = Mdark(cName);
  const bx = W / 2 - 2 * u + num(P.dx, 0) * u;
  const by = yb - Q.leg * u - Q.bh * 0.55 * u;
  aura(g, P, bx + 2 * u, by - 1 * u, Q.bl * u + 4 * u, Q.bh * u + 6 * u);
  // ala lejana
  const wk = P.wings === 'bat' ? 'bat' : P.wings === 'fire' ? 'fire' : 'feather';
  const wc = P.wings === true || P.wings === 'bat' || P.wings === 'fire' ? (P.wingc ?? 'white') : P.wings;
  if (P.wings) sideWing(g, wk, bx + 2.5 * u, by - Q.bh * u * 0.7, 9 * u, wc, true);
  // cola
  const tx = bx - Q.bl * u * 0.9, ty = by - Q.bh * u * 0.3;
  const tail = P.tail ?? (kind === 'horse' ? 'horse' : kind === 'lion' ? 'tuft' : kind === 'fox' ? 'bushy' : kind === 'lizard' || kind === 'dragon' ? 'lizard' : 'thin');
  if (tail === 'snake') {
    g.curve([tx, ty], [tx - 5 * u, ty - 1 * u], [tx - 4 * u, ty - 7 * u], M(P.tailc ?? 'green'), 1.8, 1.4);
    g.ell(tx - 3.5 * u, ty - 7.5 * u, 1.4 * u, 1.1 * u, M(P.tailc ?? 'green'));
    g.px(tx - 3 * u, ty - 7.8 * u, F('yellow'));
  } else if (tail === 'scorpion') {
    for (let i = 0; i < 5; i++) g.ell(tx - 1.5 * u - i * 0.6 * u, ty - i * 2 * u, 1.2 * u, 1.2 * u, M(P.tailc ?? 'black'));
    g.poly([[tx - 4 * u, ty - 10 * u], [tx - 1 * u, ty - 10.5 * u], [tx - 2 * u, ty - 12.5 * u]], M('red'));
  } else if (tail === 'fire') flames(g, tx - 1 * u, ty + 2 * u, 5 * u, 6 * u, rng);
  else if (tail === 'fan' || num(P.tails, 1) > 1) {
    const n = num(P.tails, 3);
    for (let i = 0; i < n; i++) {
      const a = Math.PI * (0.45 + (0.65 * i) / Math.max(1, n - 1));
      const ex = tx + Math.cos(a) * 8 * u, ey = ty - Math.sin(a) * 8 * u;
      g.curve([tx, ty], [tx + Math.cos(a) * 4 * u, ty - Math.sin(a) * 2 * u], [ex, ey], i % 2 ? M(P.tailc ?? cName) : Mlight(P.tailc ?? cName), 2.4, 1.8);
      g.dot(ex, ey, 0.9 * u, M(P.tipc ?? 'gold'));
    }
  } else if (tail === 'horse') g.curve([tx, ty], [tx - 3 * u, ty + 1 * u], [tx - 2 * u, ty + 7 * u], M(P.tailc ?? P.manec ?? 'black'), 2, 1.2);
  else if (tail === 'bushy') g.curve([tx, ty], [tx - 4 * u, ty + 1 * u], [tx - 5 * u, ty - 3 * u], M(P.tailc ?? cName), 2.6, 2);
  else if (tail === 'lizard') g.curve([tx, ty + 1 * u], [tx - 4 * u, ty + 4 * u], [tx - 7 * u, ty + 2 * u], cm, 2.4, 1);
  else if (tail === 'fish') { g.curve([tx, ty], [tx - 4 * u, ty + 1 * u], [tx - 5 * u, ty - 2 * u], cm, 2, 1.2); g.poly([[tx - 5 * u, ty - 2 * u], [tx - 8 * u, ty - 4 * u], [tx - 7 * u, ty]], dm); }
  else if (tail !== 'none') {
    g.curve([tx, ty], [tx - 3 * u, ty + 1 * u], [tx - 3 * u, ty + 4 * u], M(P.tailc ?? cName), 1, 1);
    if (tail === 'tuft') g.ell(tx - 3 * u, ty + 4.5 * u, 1 * u, 1 * u, M(P.manec ?? 'brown'));
  }
  // patas
  const nl = num(P.legs, 4);
  const legW = 1.6 * u * (kind === 'elephant' || kind === 'bull' || kind === 'bear' ? 1.5 : 1);
  const back = bx - Q.bl * u * 0.6, front = bx + Q.bl * u * 0.55;
  const legXs = nl >= 8 ? [back - 1.2 * u, back, back + 1.2 * u, front - 1.2 * u, front, front + 1.2 * u] : [back, front];
  for (const lx of legXs) g.rect(lx + 1 * u - legW / 2, by, legW, yb - by + 0.5, dm);
  for (const lx of legXs) g.rect(lx - legW / 2, by, legW, yb - by + 0.5, cm);
  if (Q.hoof) for (const lx of legXs) g.rect(lx - legW / 2, yb - 0.6, legW, 1, M(P.hoofc ?? 'black'));
  // cuerpo
  g.ell(bx, by - 0.5 * u, Q.bl * u, Q.bh * u, cm);
  if (P.c2) g.ell(bx, by + Q.bh * u * 0.45, Q.bl * u * 0.75, Q.bh * u * 0.35, M(P.c2));
  if (P.spots) for (let i = 0; i < 6; i++) g.px(bx - Q.bl * u * 0.7 + rng() * Q.bl * u * 1.4, by - Q.bh * u * 0.6 + rng() * Q.bh * u, F(P.spots === true ? 'black' : P.spots, 0));
  if (P.stripes) for (let i = -2; i <= 2; i++) g.line(bx + i * 2 * u, by - Q.bh * u * 0.9, bx + i * 2 * u - 1 * u, by + Q.bh * u * 0.2, F(P.stripes === true ? 'black' : P.stripes, 0));
  if (P.spikes) for (let i = -3; i <= 3; i++) g.poly([[bx + i * 1.5 * u - 0.8 * u, by - Q.bh * u * 0.85], [bx + i * 1.5 * u + 0.8 * u, by - Q.bh * u * 0.85], [bx + i * 1.5 * u, by - Q.bh * u - 1.8 * u]], M(P.spikes === true ? 'bone' : P.spikes));
  if (P.island) {
    g.ell(bx, by - Q.bh * u, Q.bl * u * 0.8, 1.5 * u, M('sand'));
    g.rect(bx - 1, by - Q.bh * u - 6 * u, 1.4, 5 * u, M('wood'));
    g.ell(bx, by - Q.bh * u - 6.5 * u, 2.5 * u, 1.5 * u, M('leaf'));
  }
  // ala cercana
  if (P.wings) sideWing(g, wk, bx + 0.5 * u, by - Q.bh * u * 0.5, 10 * u, wc);
  if (P.rider) humanoid(g, { ...parseDesc(`hum ${P.rider.replace(/,/g, ' ').replace(/=/g, ':')}`), legs: 'none', scale: 0.6, dx: bx - W / 2, float: true }, rng);
  // cuello y cabezas
  const nh = num(P.heads, 1);
  const r = Q.head * u * (P.bighead ? 1.25 : 1);
  const heads = [];
  for (let i = nh - 1; i >= 0; i--) {
    const off = (i - (nh - 1) / 2) * r * 1.7;
    const hx = bx + Q.bl * u * 0.85 + Q.neck * u * 0.6 + r * 0.4 + off * 0.45 - (nh > 1 ? r * 0.3 : 0);
    const hy = by - Q.bh * u * 0.6 - Q.neck * u - r * 0.3 + off * 1.15 - (nh > 1 ? r * 0.5 : 0);
    heads.push([i, hx, hy]);
    g.line(bx + Q.bl * u * 0.6, by - Q.bh * u * 0.2, hx - r * 0.3, hy + r * 0.3, i === 0 ? cm : dm, Math.max(2, r * 1.3));
    if (P.mane && kind === 'horse') g.line(bx + Q.bl * u * 0.45, by - Q.bh * u * 0.8, hx - r * 0.6, hy - r * 0.5, M(P.manec ?? 'black'), 1.6);
  }
  for (const [i, hx, hy] of heads) {
    const hp = i === 1 && P.head2 ? { ...P, head: P.head2, horns: P.head2 === 'goat' ? true : P.horns, headc: undefined } : P;
    sideHead(g, hp, kind, hx, hy, r, P.headc && !(i === 1 && P.head2) ? M(P.headc) : i === 0 ? cm : dm, rng);
  }
  if (P.fire) g.poly([[bx + Q.bl * u + r * 3, by - Q.bh * u - Q.neck * u], [W - 1, by - Q.bh * u - Q.neck * u - 2.5 * u], [W - 1, by - Q.bh * u - Q.neck * u + 3 * u]], F('fire', 2));
  if (P.flames) flames(g, bx, by - Q.bh * u * 0.6, Q.bl * u * 1.6, 5 * u, rng);
}

// ---------------- aves (de perfil)

function bird(g, P, rng) {
  const W = g.w, H = g.h;
  const u = (H / 34) * num(P.scale, 1);
  const yb = H - 2;
  const cName = P.c ?? 'brown';
  const cm = M(cName);
  const wName = P.wingc ?? P.c2 ?? cName;
  if (P.front || num(P.heads, 1) > 1) {
    // de frente con las alas abiertas
    const cx = W / 2, cy = yb - 11 * u;
    aura(g, P, cx, cy, 13 * u, 10 * u);
    wings(g, P.fire ? 'fire' : 'feather', cx, cy - 1 * u, 10 * u, wName, 0, u);
    g.poly([[cx - 2 * u, cy + 4 * u], [cx + 2 * u, cy + 4 * u], [cx + 4 * u, yb - 2 * u], [cx - 4 * u, yb - 2 * u]], M(P.tailc ?? wName));
    g.ell(cx, cy + 1 * u, 3.6 * u, 5 * u, cm);
    if (P.c2) g.ell(cx, cy + 2.5 * u, 2.2 * u, 3 * u, M(P.c2));
    const nh = num(P.heads, 1);
    const offs = nh === 1 ? [0] : [-1, 1];
    for (const o of offs) {
      const hx = cx + o * 2.8 * u, hy = cy - 5 * u;
      if (nh > 1) g.line(cx + o * 1 * u, cy - 2 * u, hx, hy, cm, 2.4 * u);
      if (P.face === 'human') drawHead(g, { ...P, head: 'human', fem: true, hair: P.hair ?? 'long' }, hx, hy, 3 * u, rng);
      else {
        g.ell(hx, hy, 2.2 * u, 2.2 * u, M(P.headc ?? cName));
        g.poly([[hx + o * 1.2 * u, hy], [hx + o * 4 * u + (o ? 0 : 0.5), hy + 1 * u], [hx + o * 1.2 * u, hy + 1.8 * u]], M(P.beak ?? 'gold'));
        if (!o) g.poly([[hx - 1 * u, hy + 0.5 * u], [hx + 1 * u, hy + 0.5 * u], [hx, hy + 3 * u]], M(P.beak ?? 'gold'));
        eyeAt(g, hx + o * 0.6 * u - 0.5, hy - 0.5 * u, P);
        if (!o) { eyeAt(g, hx - 1 * u, hy - 0.5 * u, P); eyeAt(g, hx + 0.5 * u, hy - 0.5 * u, P); }
        if (P.crest) crestOn(g, hx, hy - 2 * u, P, u);
      }
    }
    for (const s of [-1, 1]) g.line(cx + s * 1.2 * u, cy + 5 * u, cx + s * 1.6 * u, yb, M(P.legc ?? 'gold'));
    if (P.bolts) for (const s of [-1, 1]) item(g, 'bolt', cx + s * 9 * u, cy + 6 * u, P, u * 0.8, H);
    return;
  }
  const bx = W / 2 - 1 * u, by = yb - 8 * u;
  aura(g, P, bx, by - 4 * u, 12 * u, 11 * u);
  // cola
  if (P.tail === 'long' || P.fire) {
    for (let i = 0; i < 3; i++) g.curve([bx - 3 * u, by], [bx - 9 * u, by + (i - 1) * 3 * u], [bx - 10 * u, by + (4 + i * 2) * u], P.fire ? F('fire', i === 1 ? 2 : 1) : M(P.tailc ?? wName), 2, 1);
  } else if (P.tail === 'peacock') {
    g.ell(bx - 6 * u, by - 3 * u, 6 * u, 7 * u, M(P.tailc ?? 'teal'));
    for (let i = 0; i < 5; i++) g.px(bx - 9 * u + i * 1.6 * u, by - 6 * u + (i % 2) * 3 * u, F('gold', 2));
  } else g.poly([[bx - 3 * u, by - 1 * u], [bx - 9 * u, by + 1 * u], [bx - 8 * u, by + 3.5 * u], [bx - 2 * u, by + 2 * u]], M(P.tailc ?? wName));
  // ala lejana
  wings(g, P.fire ? 'fire' : 'feather', bx + 1 * u, by - 2 * u, 9 * u, wName, 1, u);
  // patas
  const nl = num(P.legs, 2);
  for (let i = 0; i < nl; i++) {
    const lx = bx - 1 * u + i * 1.6 * u;
    g.line(lx, by + 3 * u, lx + 0.5 * u, yb, M(P.legc ?? 'gold'));
    g.rect(lx - 0.5 * u, yb - 0.5, 2 * u, 1, M(P.legc ?? 'gold'));
  }
  // cuerpo y cabeza
  g.ell(bx, by, 5 * u, 3.6 * u, cm);
  if (P.c2) g.ell(bx + 1.5 * u, by + 1 * u, 3 * u, 2.2 * u, M(P.c2));
  const hx = bx + 5 * u, hy = by - 5 * u;
  g.line(bx + 3 * u, by - 1 * u, hx - 0.5 * u, hy + 1 * u, cm, 2.6 * u);
  if (P.face === 'human') {
    drawHead(g, { ...P, head: 'human', fem: P.male ? false : true, hair: P.hair ?? 'long', c: undefined }, hx, hy, 2.8 * u, rng);
  } else {
    g.ell(hx, hy, 2.4 * u, 2.2 * u, M(P.headc ?? cName));
    const beakLen = P.beakl === 'long' ? 6 : 3;
    if (P.beakl === 'long') g.curve([hx + 2 * u, hy], [hx + 4 * u, hy + 1 * u], [hx + beakLen * u, hy + 3 * u], M(P.beak ?? 'black'), 1.2, 1);
    else g.poly([[hx + 1.8 * u, hy - 0.8 * u], [hx + (2 + beakLen) * u, hy + 0.6 * u], [hx + 1.8 * u, hy + 1.2 * u]], M(P.beak ?? 'gold'));
    eyeAt(g, hx + 0.6 * u, hy - 0.6 * u, P);
    if (P.crest) crestOn(g, hx - 0.5 * u, hy - 2 * u, P, u);
    if (P.crown) crown(g, { ...P, crown: P.crown }, hx, hy, 2.4 * u, rng);
  }
  // ala cercana
  wings(g, P.fire ? 'fire' : 'feather', bx - 1 * u, by - 1 * u, 10 * u, wName, -1, u);
  if (P.bolts) item(g, 'bolt', bx - 7 * u, by + 7 * u, P, u, H);
  if (P.carry) item(g, P.carry, hx + 2 * u, by + 5 * u, P, u, H);
}

function crestOn(g, x, y, P, u) {
  const cm = M(P.crest === true ? 'red' : P.crest);
  for (let i = -1; i <= 1; i++) g.line(x + i * u, y + 1, x + i * 1.5 * u - 1 * u, y - 2.5 * u, cm, 1.2);
}

// ---------------- serpientes

function serp(g, P, rng) {
  const W = g.w, H = g.h;
  const u = (H / 34) * num(P.scale, 1);
  const yb = H - 2;
  const cName = P.c ?? 'green';
  const cm = M(cName);
  const bm = M(P.c2 ?? 'sand');
  const cx = W / 2;
  aura(g, P, cx, yb - 9 * u, 12 * u, 10 * u);
  if (P.wings) wings(g, 'feather', cx, yb - 12 * u, 9 * u, P.wings === true ? 'white' : P.wings, 0, u);
  const nh = num(P.heads, 1);
  if (P.sea) {
    // jorobas saliendo del agua
    for (const [dx, rr] of [[-8, 2.5], [-3, 3]]) g.ell(cx + dx * u, yb - 2 * u, rr * u, rr * u * 1.2, cm, (px, py) => py < yb - 2 * u);
    g.curve([cx + 1 * u, yb - 1 * u], [cx + 4 * u, yb - 10 * u], [cx + 3 * u, yb - 17 * u], cm, 3.4 * u, 2.6 * u);
    if (P.spikes) for (let i = 0; i < 4; i++) g.px(cx + 2 * u - i * 0.3 * u, yb - (6 + i * 3) * u, M(P.spikes === true ? 'red' : P.spikes));
    g.rect(0, yb - 2 * u, W, 2.5 * u, GLOW('water', 0.7));
    headSnake(g, P, cx + 4 * u, yb - 18 * u, 2.4 * u, rng);
    return;
  }
  if (P.amphi) {
    g.ell(cx, yb - 3 * u, 9 * u, 3 * u, cm);
    g.ell(cx, yb - 3 * u, 6 * u, 1.2 * u, M(cName, { dark: true }));
    g.curve([cx - 8 * u, yb - 4 * u], [cx - 11 * u, yb - 8 * u], [cx - 8 * u, yb - 11 * u], cm, 2.4 * u, 2.2 * u);
    g.curve([cx + 8 * u, yb - 4 * u], [cx + 11 * u, yb - 8 * u], [cx + 8 * u, yb - 11 * u], cm, 2.4 * u, 2.2 * u);
    headSnake(g, P, cx - 7 * u, yb - 12 * u, 2 * u, rng, -1);
    headSnake(g, P, cx + 7 * u, yb - 12 * u, 2 * u, rng);
    return;
  }
  // espiral
  g.ell(cx - 1 * u, yb - 2.5 * u, 9 * u, 2.8 * u, cm);
  g.ell(cx, yb - 5.5 * u, 7 * u, 2.5 * u, cm);
  g.ell(cx, yb - 4.3 * u, 6 * u, 0.8 * u, bm);
  g.curve([cx + 8 * u, yb - 2 * u], [cx + 12 * u, yb - 3 * u], [cx + 11 * u, yb - 6 * u], cm, 1.6 * u, 1);
  if (P.rattle) g.ell(cx + 11 * u, yb - 6.5 * u, 0.8 * u, 1.2 * u, M('tan'));
  const tops = nh === 1 ? [[cx + 3 * u, yb - 17 * u]] : Array.from({ length: Math.min(nh, 9) }, (_, i) => {
    const t = nh === 1 ? 0.5 : i / (Math.min(nh, 9) - 1);
    return [cx - 9 * u + t * 18 * u, yb - (16 - Math.abs(t - 0.5) * 8) * u];
  });
  tops.forEach(([tx, ty], i) => {
    g.curve([cx, yb - 6 * u], [tx + (nh === 1 ? -6 * u : 0), (ty + yb - 6 * u) / 2], [tx, ty + 2 * u], cm, (nh === 1 ? 3.6 : 2.2) * u, (nh === 1 ? 2.6 : 1.8) * u);
    if (nh === 1) g.curve([cx, yb - 6 * u], [tx - 6 * u + 1 * u, (ty + yb - 6 * u) / 2 + 1 * u], [tx + 1 * u, ty + 3 * u], bm, 1.2 * u, 1);
  });
  tops.forEach(([tx, ty]) => headSnake(g, P, tx, ty, (nh === 1 ? 2.6 : 1.8) * u, rng));
}

function headSnake(g, P, x, y, r, rng, dir = 1) {
  const cName = P.headc ?? P.c ?? 'green';
  if (P.hood) g.ell(x - dir * r * 0.3, y + r * 0.6, r * 1.3, r * 1.7, Mdark(cName));
  if (P.feathers) for (let i = 0; i < 6; i++) {
    const a = Math.PI * (0.6 + i * 0.28);
    g.line(x, y, x + Math.cos(a) * r * 2.2 * -dir, y + Math.sin(a) * r * 2.2, M(P.feathers === true ? 'green' : P.feathers), 1.6);
  }
  if (P.horns) horns(g, P.horns === true ? 'small' : P.horns, x, y + r * 0.3, r, P.hornc ?? 'bone');
  g.ell(x, y, r * 1.1, r * 0.85, M(cName));
  g.ell(x + dir * r * 0.9, y + r * 0.2, r * 0.8, r * 0.55, M(cName));
  eyeAt(g, x + dir * r * 0.3 - 0.5, y - r * 0.35, { eye: P.eye ?? 'yellow', glow: P.glow });
  if (P.fire) g.poly([[x + dir * r * 1.6, y + r * 0.4], [x + dir * r * 6, y - r * 0.8], [x + dir * r * 6, y + r * 2]], F('fire', 2));
  else g.line(x + dir * r * 1.6, y + r * 0.5, x + dir * r * 2.3, y + r * 0.9, F('red'));
  if (P.crown) crown(g, P, x, y + r * 0.4, r, rng);
  if (P.whiskers) for (const s of [-1, 1]) g.curve([x + dir * r, y + r * 0.4], [x + dir * r * 2, y + r * (0.4 + s * 0.6)], [x + dir * r * 2.6, y + r * (1 + s)], F(P.whiskers === true ? 'gold' : P.whiskers, 2), 1, 1);
}

// ---------------- dragón occidental

function drag(g, P, rng) {
  const W = g.w, H = g.h;
  const u = (H / 34) * num(P.scale, 1);
  const yb = H - 2;
  const cName = P.c ?? 'red';
  const cm = M(cName);
  const dm = Mdark(cName);
  const bx = W / 2 - 2 * u, by = yb - 7 * u;
  const nl = num(P.legs, 4);
  aura(g, P, bx, by - 5 * u, 13 * u, 11 * u);
  const dw = P.wings !== 'false' && P.wings !== false && P.wings !== 'none';
  if (dw) sideWing(g, 'bat', bx + 2 * u, by - 3 * u, 10 * u, P.wingc ?? cName, true);
  // cola con punta
  g.curve([bx - 5 * u, by], [bx - 11 * u, by + 5 * u], [bx - 12 * u, by - 3 * u], cm, 2.8 * u, 1);
  g.poly([[bx - 12 * u, by - 3 * u], [bx - 14 * u, by - 5 * u], [bx - 11 * u, by - 6 * u]], dm);
  // patas
  if (nl >= 4) { g.rect(bx - 4 * u, by, 2 * u, yb - by + 0.5, dm); g.rect(bx + 3.5 * u, by, 2 * u, yb - by + 0.5, dm); }
  g.rect(bx - 2.5 * u, by, 2.2 * u, yb - by + 0.5, cm);
  if (nl >= 4) g.rect(bx + 5 * u, by, 2.2 * u, yb - by + 0.5, cm);
  g.ell(bx, by - 1 * u, 6.5 * u, 4 * u, cm);
  g.ell(bx + 1 * u, by + 1.5 * u, 4.5 * u, 1.8 * u, M(P.c2 ?? 'sand'));
  if (P.spikes !== false) for (let i = -2; i <= 2; i++) g.poly([[bx + i * 2 * u - 0.8 * u, by - 4.6 * u], [bx + i * 2 * u + 0.8 * u, by - 4.6 * u], [bx + i * 2 * u, by - 6.2 * u]], M(P.spikec ?? P.c2 ?? 'sand'));
  // cuellos
  const nh = num(P.heads, 1);
  const dheads = [];
  for (let i = nh - 1; i >= 0; i--) {
    const off = (i - (nh - 1) / 2) * 4.5 * u;
    const hx = bx + 8 * u + off * 0.5, hy = yb - 18 * u + Math.abs(off) * 0.8 + (nh > 1 ? 2 * u : 0);
    g.curve([bx + 4 * u, by - 2 * u], [bx + 9 * u + off, by - 4 * u], [hx, hy + 2 * u], i === 0 ? cm : dm, 3 * u, 2.4 * u);
    dheads.push([hx, hy]);
  }
  for (const [hx, hy] of dheads) {
    dragonHead(g, P, hx, hy, 2.6 * u * (nh > 1 ? 0.85 : 1), cName, rng);
  }
  if (dw) sideWing(g, 'bat', bx, by - 2.5 * u, 12 * u, P.wingc ?? cName);
}

function dragonHead(g, P, x, y, r, cName, rng) {
  const cm = M(cName);
  if (P.horns !== false) g.curve([x - r * 0.4, y - r * 0.5], [x - r * 1.2, y - r * 1.5], [x - r * 2, y - r * 1.4], M(P.hornc ?? 'bone'), 1.6, 1);
  g.ell(x, y, r, r * 0.85, cm);
  g.ell(x + r * 1.2, y + r * 0.3, r * 1.1, r * 0.55, cm);
  g.px(x + r * 2, y + r * 0.05, F('black', 0));
  eyeAt(g, x + r * 0.2, y - r * 0.3, { eye: P.eye ?? 'yellow', glow: true });
  g.rect(x + r * 0.4, y + r * 0.6, r * 1.6, 1, F('white', 2));
  if (P.fire) {
    g.poly([[x + r * 2.2, y + r * 0.5], [g.w - 1, y - r * 1.5], [g.w - 1, y + r * 2.6]], F('fire', 1));
    g.poly([[x + r * 2.2, y + r * 0.5], [g.w - 1, y - r * 0.4], [g.w - 1, y + r * 1.4]], F('fire', 2));
  }
  if (P.ice) g.poly([[x + r * 2.2, y + r * 0.5], [g.w - 1, y - r * 1.2], [g.w - 1, y + r * 2.2]], F('ice', 2));
  if (P.crown) crown(g, P, x, y + r * 0.2, r, rng);
}

// ---------------- dragón oriental

function ldrag(g, P, rng) {
  const W = g.w, H = g.h;
  const u = (H / 34) * num(P.scale, 1);
  const cName = P.c ?? 'jade';
  const cm = M(cName);
  const bm = M(P.c2 ?? 'gold');
  const mid = H * 0.55;
  aura(g, P, W / 2, mid, W / 2, H / 2.4);
  const pts = [];
  for (let i = 0; i <= 40; i++) {
    const t = i / 40;
    pts.push([2 * u + t * (W - 10 * u), mid + 2 * u + Math.sin(t * Math.PI * 1.6 + 0.2) * 4.5 * u * (P.flat ? 0.5 : 1) - t * 5 * u]);
  }
  pts.forEach(([x, y], i) => {
    const t = i / 40;
    const r = (0.5 + Math.min(1, t * 2.2) * 1.6) * u * (P.thick ? 1.3 : 1);
    g.ell(x, y, r, r, cm);
  });
  pts.forEach(([x, y], i) => {
    const t = i / 40;
    if (i % 3 === 0 && t > 0.15) g.px(x, y + (1 + Math.min(1, t * 2.5)) * u, bm);
  });
  if (P.mane !== false) pts.forEach(([x, y], i) => { if (i % 4 === 2 && i > 6) g.px(x, y - (2.4 + Math.min(1, i / 16)) * u, M(P.manec ?? 'red')); });
  for (const t of [0.35, 0.7]) {
    const [x, y] = pts[Math.round(t * 40)];
    g.line(x, y + 1.5 * u, x + 1.5 * u, y + 4.5 * u, cm, 1.4);
    g.px(x + 2 * u, y + 4.8 * u, F('white', 2));
  }
  const [hx, hy] = pts[40];
  const r = 2.8 * u;
  if (P.horns !== false) for (const s of [0, 1]) g.line(hx - r * 0.2 - s, hy - r * 0.6, hx - r * (1.6 + s * 0.4), hy - r * (2.4 - s * 0.6), M(P.hornc ?? 'gold'), 1.2);
  if (P.manec || P.mane !== false) g.ell(hx - r * 0.9, hy, r * 0.9, r * 1.1, M(P.manec ?? 'red'));
  g.ell(hx, hy, r, r * 0.9, cm);
  g.ell(hx + r * 1.1, hy + r * 0.3, r * 0.9, r * 0.6, cm);
  eyeAt(g, hx + r * 0.2, hy - r * 0.3, { eye: P.eye ?? 'yellow', glow: true });
  for (const s of [-1, 1]) g.curve([hx + r * 1.5, hy + r * 0.5], [hx + r * 2, hy + r * (0.6 + s * 0.3)], [hx + r * 1.9, hy + r * (1.2 + s * 0.35)], F(P.whiskc ?? 'gold', 2), 1, 1);
  if (P.pearl) g.ell(W - 3 * u, hy + r * 2.5, 1.5 * u, 1.5 * u, F('white', 2));
  if (P.wings) wings(g, 'feather', pts[18][0], pts[18][1] - 2 * u, 7 * u, P.wings === true ? 'white' : P.wings, -1, u);
  if (P.clouds) for (const [x, y] of [[0.2, 0.2], [0.75, 0.88]]) g.ell(W * x, H * y, 3 * u, 1.5 * u, F('white', 2));
}

// ---------------- criaturas marinas

function fish(g, P, rng) {
  const W = g.w, H = g.h;
  const u = (H / 34) * num(P.scale, 1);
  const yb = H - 2;
  const kind = P.kind ?? 'fish';
  const cName = P.c ?? (kind === 'whale' ? 'navy' : 'teal');
  const cm = M(cName);
  const cx = W / 2, cy = yb - 9 * u;
  if (P.sea !== false) g.rect(0, yb - 4 * u, W, 4.5 * u, GLOW('water', 0.6));
  if (kind === 'whale' || kind === 'ketos' || kind === 'shark') {
    g.poly([[cx - 8 * u, cy], [cx - 13 * u, cy - 4 * u], [cx - 12 * u, cy + 1 * u], [cx - 13 * u, cy + 5 * u]], cm);
    g.ell(cx, cy, 9.5 * u, (kind === 'whale' ? 5.5 : 4.5) * u, cm);
    g.ell(cx + 1 * u, cy + 2.5 * u, 7.5 * u, 2.2 * u, M(P.c2 ?? (kind === 'whale' ? 'silver' : 'sand')));
    if (kind === 'shark') g.poly([[cx - 2 * u, cy - 4 * u], [cx + 2 * u, cy - 4 * u], [cx - 2 * u, cy - 9 * u]], cm);
    if (kind === 'ketos') {
      g.ell(cx + 8 * u, cy - 3 * u, 3.5 * u, 3 * u, cm);
      g.ell(cx + 11 * u, cy - 2 * u, 2.4 * u, 1.6 * u, cm);
      g.rect(cx + 9 * u, cy - 1 * u, 4 * u, 1, F('white', 2));
      for (let i = 0; i < 3; i++) g.poly([[cx + (5 - i * 3) * u, cy - 4.5 * u], [cx + (7 - i * 3) * u, cy - 4.5 * u], [cx + (6 - i * 3) * u, cy - 7 * u]], M(P.c2 ?? 'red'));
      eyeAt(g, cx + 8.5 * u, cy - 4 * u, { eye: 'yellow', glow: true });
    } else {
      eyeAt(g, cx + 6 * u, cy - 0.5 * u, P);
      g.line(cx + 4 * u, cy + 1.5 * u, cx + 9 * u, cy + 1 * u, F('black', 0));
    }
    if (P.spout) for (const s of [-1, 1]) g.curve([cx + 3 * u, cy - 5 * u], [cx + 3 * u + s * 2 * u, cy - 10 * u], [cx + 3 * u + s * 4 * u, cy - 8 * u], F('cyan', 2), 1, 1);
    if (P.island) {
      g.ell(cx - 1 * u, cy - 4.5 * u, 6 * u, 1.6 * u, M('sand'));
      for (const dx of [-3, 2]) { g.rect(cx + dx * u, cy - 11 * u, 1.2, 6 * u, M('wood')); g.ell(cx + dx * u, cy - 11.5 * u, 2.5 * u, 1.5 * u, M('leaf')); }
    }
    if (P.horn) g.line(cx + 9 * u, cy - 2 * u, cx + 13 * u, cy - 6 * u, M('bone'), 1.4);
    return;
  }
  if (kind === 'eel') {
    for (let i = 0; i <= 30; i++) {
      const t = i / 30;
      g.ell(2 * u + t * (W - 6 * u), cy + Math.sin(t * Math.PI * 2) * 4 * u, 1.6 * u, 1.6 * u, cm);
    }
    eyeAt(g, W - 4 * u, cy - 1 * u, P);
    return;
  }
  // pez / carpa
  g.poly([[cx - 6 * u, cy], [cx - 11 * u, cy - 5 * u], [cx - 10 * u, cy + 5 * u]], Mdark(cName));
  g.ell(cx, cy, 7 * u, 4.5 * u, cm);
  if (P.c2) g.ell(cx + 1 * u, cy + 2 * u, 5 * u, 1.8 * u, M(P.c2));
  g.poly([[cx - 2 * u, cy - 4 * u], [cx + 3 * u, cy - 4 * u], [cx - 3 * u, cy - 7.5 * u]], Mdark(cName));
  for (let i = 0; i < 4; i++) g.px(cx - 3 * u + i * 1.8 * u, cy - 1 * u + (i % 2) * 1.5 * u, Mdark(cName));
  eyeAt(g, cx + 4.5 * u, cy - 1 * u, P, true);
  if (P.whiskers) g.curve([cx + 7 * u, cy + 1 * u], [cx + 10 * u, cy + 3 * u], [cx + 11 * u, cy + 6 * u], F('gold', 2));
  if (P.horns) horns(g, 'small', cx + 5 * u, cy - 3 * u, 2 * u, 'bone');
}

function kraken(g, P, rng) {
  const W = g.w, H = g.h;
  const u = (H / 34) * num(P.scale, 1);
  const yb = H - 2;
  const cName = P.c ?? 'crimson';
  const cm = M(cName);
  const cx = W / 2, my = yb - 15 * u;
  if (P.sea !== false) g.rect(0, yb - 3 * u, W, 3.5 * u, GLOW('water', 0.6));
  const n = num(P.arms, 6);
  for (let i = 0; i < n; i++) {
    const t = n === 1 ? 0.5 : i / (n - 1);
    const ex = 1.5 * u + t * (W - 3 * u);
    g.curve([cx + (t - 0.5) * 6 * u, my + 4 * u], [ex + (t - 0.5) * 4 * u, yb - 4 * u], [ex - (t - 0.5) * 6 * u, yb - 1 * u], cm, 2.4 * u, 1);
  }
  if (P.head === 'human') {
    drawHead(g, { ...P, fem: true, skin: P.skin ?? 'skin' }, cx, my - 4 * u, 4 * u, rng);
    return;
  }
  g.ell(cx, my - 2 * u, 6 * u, 7.5 * u, cm);
  for (const s of [-1, 1]) {
    g.ell(cx + s * 2.5 * u, my + 1.5 * u, 1.6 * u, 1.6 * u, F('yellow', 2));
    g.px(cx + s * 2.5 * u - 0.5, my + 1.5 * u, F('black', 0));
  }
  for (let i = 0; i < 4; i++) g.px(cx - 3 * u + i * 2 * u, my - 6 * u, Mdark(cName));
}

function turtle(g, P, rng) {
  const W = g.w, H = g.h;
  const u = (H / 34) * num(P.scale, 1);
  const yb = H - 2;
  const cName = P.c ?? 'green';
  const sName = P.shell ?? 'olive';
  const cx = W / 2 - 1 * u, cy = yb - 4 * u;
  if (P.sea) g.rect(0, yb - 3 * u, W, 3.5 * u, GLOW('water', 0.6));
  for (const dx of [-6, 4]) g.rect(cx + dx * u, cy, 2.6 * u, yb - cy + 0.5, M(cName));
  g.ell(cx + 9 * u, cy - 2 * u, 2.8 * u, 2.4 * u, M(cName));
  eyeAt(g, cx + 10 * u, cy - 3 * u, P);
  if (P.head === 'dragon') { g.curve([cx + 8 * u, cy - 3 * u], [cx + 8 * u, cy - 6 * u], [cx + 6 * u, cy - 7 * u], M('bone'), 1.4, 1); g.ell(cx + 11.5 * u, cy - 1.5 * u, 1.5 * u, 1 * u, M(cName)); }
  g.ell(cx, cy - 1 * u, 9 * u, 7 * u, M(sName), (px, py) => py < cy + 1 * u);
  for (const [dx, dy] of [[-4, -3], [0, -5], [4, -3], [-2, -1], [2, -1]]) g.ell(cx + dx * u, cy + dy * u, 1.4 * u, 1 * u, Mdark(sName));
  g.rect(cx - 9 * u, cy + 0.5 * u, 18 * u, 1.2 * u, M(P.c2 ?? 'sand'));
  if (P.island) {
    g.ell(cx, cy - 7 * u, 6 * u, 1.6 * u, M('sand'));
    for (const dx of [-2, 2]) { g.rect(cx + dx * u, cy - 13 * u, 1.2, 6 * u, M('wood')); g.ell(cx + dx * u, cy - 13.5 * u, 2.5 * u, 1.5 * u, M('leaf')); }
  }
  if (P.stele) { g.rect(cx - 2 * u, cy - 15 * u, 4 * u, 9 * u, M('stone')); for (let i = 0; i < 3; i++) g.rect(cx - 1 * u, cy - 13 * u + i * 2 * u, 2 * u, 1, F('black', 0)); }
}

function spider(g, P, rng) {
  const W = g.w, H = g.h;
  const u = (H / 34) * num(P.scale, 1);
  const yb = H - 2;
  const cName = P.c ?? 'black';
  const cm = M(cName);
  const cx = W / 2, cy = yb - 8 * u;
  for (let i = 0; i < 4; i++) for (const s of [-1, 1]) {
    const bx = cx + s * 2 * u, by = cy + (i - 1.5) * 1.2 * u;
    g.curve([bx, by], [bx + s * (5 + i) * u, by - (6 - i * 1.5) * u], [bx + s * (8 + i * 1.2) * u, yb], cm, 1.6, 1);
  }
  g.ell(cx, cy - 3 * u, 5.5 * u, 5 * u, cm);
  if (P.mark) g.ell(cx, cy - 4 * u, 2 * u, 2 * u, M(P.mark === true ? 'red' : P.mark));
  g.ell(cx, cy + 2 * u, 3.5 * u, 3 * u, M(P.headc ?? cName));
  if (P.face === 'oni') {
    horns(g, 'small', cx, cy + 2 * u, 3 * u, 'bone');
    face(g, { eye: 'red', fangs: true }, cx, cy + 2 * u, 3 * u);
  } else {
    for (const [dx, dy] of [[-1.2, 1], [1.2, 1], [-0.5, 0], [0.5, 0], [-2, 1.5], [2, 1.5]]) g.px(cx + dx * u, cy + 2 * u + dy * u, F(P.eye ?? 'red', 2));
  }
}

function insect(g, P, rng) {
  const W = g.w, H = g.h;
  const u = (H / 34) * num(P.scale, 1);
  const cName = P.c ?? 'brown';
  const cx = W / 2, cy = H * 0.55;
  aura(g, P, cx, cy, 10 * u, 9 * u);
  wings(g, P.fire ? 'fire' : 'insect', cx, cy, 9 * u, P.wingc ?? 'white', 0, u);
  for (const s of [-1, 1]) for (let i = 0; i < 3; i++) g.line(cx + s * 1 * u, cy + i * 1.6 * u, cx + s * 4 * u, cy + (i * 2 + 3) * u, M('black'));
  g.ell(cx, cy + 3 * u, 2.2 * u, 4.5 * u, M(cName));
  g.ell(cx, cy - 1.5 * u, 2 * u, 2 * u, M(cName));
  g.ell(cx, cy - 4 * u, 1.8 * u, 1.6 * u, M(P.headc ?? cName));
  for (const s of [-1, 1]) { g.px(cx + s * 0.9 * u - 0.5, cy - 4 * u, F(P.eye ?? 'red', 2)); g.line(cx + s * 0.6 * u, cy - 5 * u, cx + s * 3 * u, cy - 8.5 * u, M('black')); }
}

// ---------------- espíritus

function ghost(g, P, rng) {
  const W = g.w, H = g.h;
  const u = (H / 34) * num(P.scale, 1);
  const yb = H - 2;
  const cName = P.c ?? 'ghost';
  const cm = P.solid ? M(cName) : M(cName);
  const cx = W / 2, hy = yb - 19 * u;
  aura(g, P, cx, yb - 12 * u, 11 * u, 13 * u);
  if (P.wings) wings(g, P.wings === 'bat' ? 'bat' : 'feather', cx, hy + 6 * u, 8 * u, P.wingc ?? (P.wings === 'bat' ? 'black' : 'white'), 0, u);
  // cuerpo ondulado
  const pts = [[cx - 4 * u, hy + 2 * u], [cx + 4 * u, hy + 2 * u], [cx + 7 * u, yb - 4 * u]];
  const waves = 4;
  for (let i = 0; i <= waves; i++) {
    const x = cx + 7 * u - (14 * u * i) / waves;
    pts.push([x, yb - (i % 2 ? 4 : 1) * u]);
  }
  pts.push([cx - 7 * u, yb - 4 * u]);
  g.poly(pts, cm);
  if (P.c2) g.rect(cx - 5 * u, hy + 7 * u, 10 * u, 1.5 * u, M(P.c2));
  // manos
  if (P.hands !== false) for (const s of [-1, 1]) {
    g.line(cx + s * 4 * u, hy + 5 * u, cx + s * 7 * u, hy + 7 * u, cm, 2 * u);
    g.px(cx + s * 7.5 * u, hy + 8 * u, M(P.skin ?? 'pale'));
  }
  if (P.chain) item(g, 'chain', cx + 6 * u, hy + 8 * u, P, u, H);
  if (P.item) item(g, P.item, cx + 7.5 * u, hy + 8 * u, P, u, H);
  // cabeza
  if (!P.headless) {
    const hr = 3.6 * u;
    if (P.hair) g.rect(cx - hr * 1.05, hy - hr * 0.6, hr * 2.1, hr * 3.2, M(P.hairc ?? 'black'));
    if (P.hood) g.ell(cx, hy - 0.3 * u, hr * 1.3, hr * 1.3, M(P.hood === true ? cName : P.hood));
    if (P.head && P.head !== 'human') headShape(g, P, cx, hy, hr, rng);
    else {
      g.ell(cx, hy, hr * 0.9, hr, M(P.skin ?? (P.hood ? 'pale' : cName)));
      if (P.hair) g.ell(cx, hy - hr * 0.3, hr * 1.02, hr * 0.8, M(P.hairc ?? 'black'), (px, py) => py < hy - hr * 0.4 || Math.abs(px - cx) > hr * 0.6);
      if (P.empty) for (const s of [-1, 1]) g.rect(cx + s * hr * 0.4 - 1, hy - 0.5, 2, 2, F('black', 0));
      else face(g, { ...P, eye: P.eye ?? (P.glow ? 'cyan' : null) }, cx, hy, hr);
      if (P.mouth === 'open' || P.scream) g.ell(cx, hy + hr * 0.6, hr * 0.3, hr * 0.35, F('black', 0));
    }
    if (P.crown) crown(g, P, cx, hy, hr, rng);
  }
}

function wisp(g, P, rng) {
  const W = g.w, H = g.h;
  const u = (H / 34) * num(P.scale, 1);
  const cName = P.c ?? 'cyan';
  const cx = W / 2, cy = H * 0.58;
  const n = num(P.count, 1);
  for (let k = 0; k < n; k++) {
    const x = n === 1 ? cx : cx + (k - (n - 1) / 2) * 8 * u, y = cy + (k % 2) * 4 * u;
    const r = (n === 1 ? 6 : 4) * u;
    g.ell(x, y, r * 1.7, r * 1.7, GLOW(cName, 0.25));
    g.poly([[x - r, y], [x + r, y], [x + r * 0.2, y - r * 2.4], [x - r * 0.4, y - r * 1.4]], F(cName, 1));
    g.ell(x, y, r, r, F(cName, 1));
    g.ell(x, y + r * 0.1, r * 0.6, r * 0.6, F(cName, 2));
    if (P.skull) headShape(g, { head: 'skull', eye: 'black' }, x, y, r * 0.7, rng);
    else if (P.face !== false) {
      g.px(x - r * 0.35, y - r * 0.1, F('black', 0)); g.px(x + r * 0.25, y - r * 0.1, F('black', 0));
    }
  }
  if (P.lantern) item(g, 'lantern', cx, H - 8 * u, P, u, H);
}

function floatingHead(g, P, rng) {
  const W = g.w, H = g.h;
  const u = (H / 34) * num(P.scale, 1);
  const yb = H - 2;
  const cx = W / 2, hy = H * 0.38;
  const r = 5.5 * u;
  if (P.entrails) {
    g.curve([cx - 1 * u, hy + r], [cx - 4 * u, yb - 6 * u], [cx - 1 * u, yb - 2 * u], M('blood'), 2.4 * u, 1.4 * u);
    g.ell(cx + 1.5 * u, hy + r + 4 * u, 2 * u, 2.4 * u, M('crimson'));
  }
  if (P.neck) {
    g.curve([cx, hy + r], [cx + 8 * u, hy + 6 * u], [cx - 2 * u, yb - 8 * u], M(P.skin ?? 'pale'), 1.8 * u, 1.8 * u);
    humanoid(g, { ...P, scale: 0.55, crown: null, headless: false, head: 'none', item: null, heads: 1, dx: -2 * u, fem: true, body: 'kimono' }, rng);
  }
  if (P.wheel) {
    g.ell(cx, hy, r * 1.9, r * 1.9, M('wood'));
    g.ell(cx, hy, r * 1.5, r * 1.5, M('black'));
    for (let i = 0; i < 8; i++) { const a = (i * Math.PI) / 4; g.line(cx, hy, cx + Math.cos(a) * r * 1.6, hy + Math.sin(a) * r * 1.6, M('wood')); }
    flames(g, cx, hy - r * 1.4, r * 3.6, r * 1.6, rng);
  }
  if (P.well) { g.rect(cx - 8 * u, yb - 6 * u, 16 * u, 6 * u, M('stone')); g.rect(cx - 7 * u, yb - 6.5 * u, 14 * u, 1.5 * u, GLOW('water', 0.9)); }
  if (P.hair === 'long') g.curve([cx, hy], [cx - 1 * u, hy + r * 1.8], [cx + 2 * u, hy + r * 2.5], M(P.hairc ?? 'black'), r * 1.8, 1);
  drawHead(g, { ...P, hair: P.hair === 'long' ? 'long' : P.hair }, cx, hy, r, rng);
}

function tree(g, P, rng) {
  const W = g.w, H = g.h;
  const u = (H / 34) * num(P.scale, 1);
  const yb = H - 2;
  const cx = W / 2;
  const kind = P.kind ?? 'tree';
  if (kind === 'kodama') {
    const m = M(P.c ?? 'white');
    g.rect(cx - 2.5 * u, yb - 8 * u, 5 * u, 8 * u, m);
    for (const s of [-1, 1]) g.rect(cx + s * 3 * u - 0.8 * u, yb - 7 * u, 1.6 * u, 4 * u, m);
    g.ell(cx, yb - 12 * u, 4 * u, 4.5 * u, m);
    for (const s of [-1, 1]) g.rect(cx + s * 1.4 * u - 0.5, yb - 12.5 * u, 1, 1.4, F('black', 0));
    g.ell(cx, yb - 10.5 * u, 0.6 * u, 0.6 * u, F('black', 0));
    return;
  }
  const wood = M(P.c ?? 'wood');
  g.rect(cx - 3 * u, yb - 15 * u, 6 * u, 15 * u, wood);
  for (const s of [-1, 1]) g.line(cx + s * 2 * u, yb, cx + s * 6 * u, yb, wood, 1.6);
  if (kind === 'dead') {
    for (const s of [-1, 1]) {
      g.line(cx + s * 1 * u, yb - 13 * u, cx + s * 8 * u, yb - 22 * u, wood, 1.6);
      g.line(cx + s * 4 * u, yb - 17 * u, cx + s * 3 * u, yb - 24 * u, wood, 1.2);
      g.line(cx + s * 6 * u, yb - 19 * u, cx + s * 11 * u, yb - 18 * u, wood, 1.2);
    }
    if (P.blood) for (let i = 0; i < 4; i++) g.px(cx - 6 * u + rng() * 12 * u, yb - 18 * u - rng() * 5 * u, F('red'));
  } else {
    const lm = M(P.leaf ?? 'leaf');
    for (const [dx, dy, r] of [[-5, -18, 5], [5, -18, 5], [0, -23, 6], [0, -16, 5]]) g.ell(cx + dx * u, yb + dy * u, r * u, r * u * 0.85, lm);
    if (P.flowers) for (let i = 0; i < 6; i++) g.px(cx - 8 * u + rng() * 16 * u, yb - 25 * u + rng() * 12 * u, F(P.flowers === true ? 'pink' : P.flowers, 2));
  }
  for (const s of [-1, 1]) g.ell(cx + s * 1.3 * u, yb - 9 * u, 0.9 * u, 1.2 * u, F(P.eye ?? 'black', P.eye ? 2 : 0));
  g.ell(cx, yb - 5.5 * u, 1.3 * u, 1 * u, F('black', 0));
  if (P.arms) for (const s of [-1, 1]) g.line(cx + s * 3 * u, yb - 10 * u, cx + s * 8 * u, yb - 6 * u, wood, 1.6);
}

function plant(g, P, rng) {
  const W = g.w, H = g.h;
  const u = (H / 34) * num(P.scale, 1);
  const yb = H - 2;
  const cx = W / 2;
  if (P.kind === 'lamb') {
    g.line(cx, yb, cx, yb - 8 * u, M('green'), 1.6);
    for (const s of [-1, 1]) g.ell(cx + s * 3 * u, yb - 2 * u, 3 * u, 1.2 * u, M('leaf'));
    g.line(cx, yb, cx, yb - 4 * u, M('green'), 1.6);
    quad(g, { kind: 'sheep', c: 'cream', scale: 0.95, dx: 1 }, rng);
    return;
  }
  const root = M(P.c ?? 'tan');
  for (const s of [-1, 1]) {
    g.line(cx + s * 1.5 * u, yb - 6 * u, cx + s * 3.5 * u, yb, root, 1.6);
    g.line(cx + s * 3 * u, yb - 11 * u, cx + s * 7 * u, yb - 7 * u, root, 1.4);
  }
  g.ell(cx, yb - 10 * u, 4 * u, 5.5 * u, root);
  for (let i = -2; i <= 2; i++) g.ell(cx + i * 1.8 * u, yb - 17 * u - (2 - Math.abs(i)) * 1.5 * u, 1.4 * u, 3 * u, M('leaf'));
  face(g, { eye: 'black', scream: true, mouth: 'open' }, cx, yb - 11 * u, 3.5 * u);
}

function obj(g, P, rng) {
  const W = g.w, H = g.h;
  const u = (H / 34) * num(P.scale, 1);
  const yb = H - 2;
  const cx = W / 2;
  const kind = P.kind ?? 'lantern';
  const cm = M(P.c ?? 'red');
  switch (kind) {
    case 'umbrella':
      g.rect(cx - 0.5, yb - 10 * u, 1.4, 10 * u, M('wood'));
      g.poly([[cx - 10 * u, yb - 9 * u], [cx + 10 * u, yb - 9 * u], [cx, yb - 22 * u]], cm);
      for (let i = -2; i <= 2; i++) g.line(cx, yb - 22 * u, cx + i * 4.5 * u, yb - 9 * u, Mdark(P.c ?? 'red'));
      g.ell(cx, yb - 15 * u, 1.8 * u, 1.8 * u, F('white', 2)); g.px(cx - 0.5, yb - 15 * u, F('black', 0));
      g.line(cx, yb - 12 * u, cx + 1, yb - 7 * u, F('red'), 1.4);
      break;
    case 'lantern':
      g.rect(cx - 2 * u, yb - 25 * u, 4 * u, 2 * u, M('black'));
      g.ell(cx, yb - 15 * u, 7 * u, 9 * u, M(P.c ?? 'cream'));
      for (let i = -2; i <= 2; i++) g.rect(cx - 7 * u, yb - 15 * u + i * 3 * u, 14 * u, 1, Mdark(P.c ?? 'cream'));
      g.rect(cx - 3 * u, yb - 6 * u, 6 * u, 2 * u, M('black'));
      eyeAt(g, cx - 2.5 * u, yb - 17 * u, P, true); eyeAt(g, cx + 2 * u, yb - 17 * u, P, true);
      g.rect(cx - 2.5 * u, yb - 13 * u, 5 * u, 2.5 * u, F('crimson', 0));
      g.line(cx, yb - 11.5 * u, cx + 0.5, yb - 7 * u, F('pink', 2), 1.4);
      break;
    case 'wall':
      g.rect(cx - 11 * u, yb - 22 * u, 22 * u, 22 * u, M(P.c ?? 'stone'));
      for (let y = 0; y < 5; y++) for (let x = 0; x < 3; x++) g.rect(cx - 11 * u + ((x + (y % 2) * 0.5) * 8 * u), yb - 22 * u + y * 4.4 * u, 1, 4.4 * u, Mdark(P.c ?? 'stone'));
      for (let y = 1; y < 5; y++) g.rect(cx - 11 * u, yb - 22 * u + y * 4.4 * u, 22 * u, 1, Mdark(P.c ?? 'stone'));
      for (const s of [-1, 1]) { g.ell(cx + s * 4 * u, yb - 14 * u, 1.6 * u, 1.6 * u, F('white', 2)); g.px(cx + s * 4 * u - 0.5, yb - 14 * u, F('black', 0)); }
      break;
    case 'cloth':
      for (let i = 0; i <= 30; i++) {
        const t = i / 30;
        g.rect(1 * u + t * (W - 4 * u), H * 0.5 + Math.sin(t * Math.PI * 2.4) * 6 * u - 2 * u, 1.6 * u, 4 * u, M(P.c ?? 'white'));
      }
      eyeAt(g, W - 4 * u, H * 0.5 + Math.sin(Math.PI * 2.4) * 6 * u - 1 * u, P);
      break;
    case 'aten': {
      for (let i = 0; i < 7; i++) {
        const x = cx + (i - 3) * 3.2 * u;
        g.line(cx, H * 0.3, x, yb - 2 * u, F('yellow', 2));
        g.ell(x, yb - 1.5 * u, 1 * u, 1 * u, M('gold'));
      }
      g.ell(cx, H * 0.3, 8 * u, 8 * u, M(P.c ?? 'gold'));
      g.ell(cx, H * 0.3, 5.5 * u, 5.5 * u, M('red'));
      g.rect(cx - 0.5, H * 0.3 + 8 * u, 1.5, 3 * u, M('gold'));
      break;
    }
    case 'flask': {
      g.ell(cx, yb - 8 * u, 8 * u, 8 * u, M('cyan', { flat: true, alpha: 0.55, tone: 2 }));
      g.rect(cx - 2 * u, yb - 22 * u, 4 * u, 7 * u, M('cyan', { flat: true, alpha: 0.55, tone: 2 }));
      g.rect(cx - 2.5 * u, yb - 23 * u, 5 * u, 1.5 * u, M('wood'));
      humanoid(g, { ...P, arch: 'hum', scale: 0.45, small: false, dx: 0 }, rng);
      break;
    }
    case 'cart': {
      g.rect(cx - 9 * u, yb - 12 * u, 18 * u, 6 * u, M('wood'));
      for (const s of [-1, 1]) { g.ell(cx + s * 6 * u, yb - 4 * u, 4 * u, 4 * u, M('wood')); g.ell(cx + s * 6 * u, yb - 4 * u, 1.5 * u, 1.5 * u, M('black')); }
      break;
    }
    default: {
      g.ell(cx, yb - 10 * u, 8 * u, 9 * u, cm);
      face(g, P, cx, yb - 10 * u, 6 * u);
    }
  }
}

function cloud(g, P, rng) {
  const W = g.w, H = g.h;
  const u = (H / 34) * num(P.scale, 1);
  const cx = W / 2, cy = H * 0.4;
  const cm = M(P.c ?? 'slate');
  if (P.rain) for (let i = 0; i < 6; i++) g.line(cx - 8 * u + i * 3.2 * u, cy + 6 * u, cx - 9 * u + i * 3.2 * u, H - 3 * u, F('cyan', 2));
  if (P.bolts !== false) item(g, 'bolt', cx + 5 * u, cy + 14 * u, P, u, H);
  for (const [dx, dy, r] of [[-7, 1, 5], [7, 1, 5], [0, -2, 7], [-3, 3, 5], [4, 3, 5]]) g.ell(cx + dx * u, cy + dy * u, r * u, r * u * 0.8, cm);
  face(g, { eye: P.eye ?? 'yellow', glow: true, mouth: P.mouth, ...P }, cx, cy, 5 * u, { noMouth: !P.mouth });
  if (P.puff) g.curve([cx + 8 * u, cy + 3 * u], [cx + 12 * u, cy + 4 * u], [W, cy + 1 * u], F('white', 2), 2, 1);
  if (P.beard) g.ell(cx, cy + 6 * u, 5 * u, 3 * u, M(P.beardc ?? 'white'));
  if (P.hat) crown(g, { crown: 'brim', hatc: P.hat === true ? 'brown' : P.hat }, cx, cy - 3 * u, 5 * u, rng);
}

const ARCH = { hum: humanoid, quad, bird, serp, drag, ldrag, fish, kraken, turtle, spider, insect, ghost, wisp, head: floatingHead, tree, plant, obj, cloud };

/** Dibuja la bestia en un lienzo de w x h píxeles. seed: semilla de las pequeñas variaciones. */
export function drawBeast(desc, w, h, seed = 1) {
  const P = typeof desc === 'string' ? parseDesc(desc) : desc;
  const g = new Grid(w, h);
  const rng = mulberry32(seed * 7919 + 13);
  (ARCH[P.arch] ?? wisp)(g, P, rng);
  return render(g);
}

/** Versión dorada: cada color pasa a la rampa de oro según su luminosidad (el contorno queda bronce oscuro). */
const GOLD_STOPS = [[0, [42, 24, 4]], [0.22, [108, 68, 16]], [0.45, [184, 132, 32]], [0.7, [240, 192, 64]], [1, [255, 248, 200]]];
export function goldCanvas(src) {
  const c = document.createElement('canvas');
  c.width = src.width;
  c.height = src.height;
  const ctx = c.getContext('2d');
  ctx.drawImage(src, 0, 0);
  const img = ctx.getImageData(0, 0, c.width, c.height);
  const d = img.data;
  const lum = (i) => (0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]) / 255;
  // El contorno se queda oscuro; el resto se estira para que toda bestia brille, también las oscuras.
  // Percentiles 5 y 85: unos pocos píxeles muy claros (ojos, dientes) no deben apagar el resto.
  const ls = [];
  const isOut = (i) => d[i] === 20 && d[i + 1] === 20 && d[i + 2] === 30; // color OUT del contorno
  for (let i = 0; i < d.length; i += 4) if (d[i + 3] && !isOut(i)) ls.push(lum(i));
  ls.sort((x, y) => x - y);
  const lo = ls.length ? ls[Math.floor(ls.length * 0.08)] : 0;
  const hi = ls.length ? ls[Math.floor(ls.length * 0.9)] : 1;
  const span = Math.max(0.12, hi - lo);
  for (let i = 0; i < d.length; i += 4) {
    if (!d[i + 3]) continue;
    const l0 = lum(i);
    const l = isOut(i) ? 0 : 0.3 + 0.7 * Math.min(1, Math.max(0, (l0 - lo) / span));
    let k = 1;
    while (k < GOLD_STOPS.length - 1 && GOLD_STOPS[k][0] < l) k++;
    const [g0, c0] = GOLD_STOPS[k - 1], [g1, c1] = GOLD_STOPS[k];
    const t = (l - g0) / (g1 - g0 || 1);
    for (let j = 0; j < 3; j++) d[i + j] = Math.round(c0[j] + (c1[j] - c0[j]) * t);
  }
  ctx.putImageData(img, 0, 0);
  return c;
}
