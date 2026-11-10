// Dioses rediseñados a mano (40x48 px) con animación de reposo. Sustituyen al sprite generado
// de esos dioses. Cada función dibuja un fotograma en el instante t (segundos): respiran, y cada
// uno tiene su detalle animado (rayo de Zeus, ojos y orejas de Anubis, capa y cuervo de Odín).
// Para añadir otro dios: una función más en GOD_ART con su nombre exacto del bestiario.

export const GOD_W = 40;
export const GOD_H = 48;
/** Fotogramas de la animación de reposo y su duración (ms). */
export const GOD_FRAMES = 6;
export const GOD_FRAME_MS = 260;

function canvas() {
  const c = document.createElement('canvas');
  c.width = GOD_W;
  c.height = GOD_H;
  return c;
}

function painter(c) {
  const ctx = c.getContext('2d');
  return (x, y, w, h, col) => {
    ctx.fillStyle = col;
    ctx.fillRect(Math.round(x), Math.round(y), w, h);
  };
}

/** Contorno oscuro de 1 px alrededor de la figura. */
function outline(src, col = '#0a0810') {
  const w = src.width, h = src.height;
  const o = document.createElement('canvas');
  o.width = w;
  o.height = h;
  const s = src.getContext('2d').getImageData(0, 0, w, h).data;
  const ctx = o.getContext('2d');
  ctx.fillStyle = col;
  const A = (x, y) => x >= 0 && y >= 0 && x < w && y < h && s[(y * w + x) * 4 + 3] > 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (!A(x, y) && (A(x + 1, y) || A(x - 1, y) || A(x, y + 1) || A(x, y - 1))) ctx.fillRect(x, y, 1, 1);
    }
  }
  ctx.drawImage(src, 0, 0);
  return o;
}


const SKIN = '#e8b890';

/**
 * Figura humana base (40x48), con el mismo estilo que Zeus: piernas o vestido largo, túnica,
 * brazos (abajo o en alto), cabeza con ojos, pelo (corto o largo) y barba opcional.
 * Devuelve el desplazamiento de la respiración (b) para colocar los atributos encima.
 */
function figure(p, t, o) {
  const b = Math.round(Math.sin(t * 2) * 0.6);
  const skin = o.skin ?? SKIN;
  const robeEnd = o.dress ? 46 : 41;
  if (!o.dress) {
    p(14, 40, 5, 6, o.legs ?? skin); p(21, 40, 5, 6, o.legs ?? skin);
    p(13, 45, 6, 2, o.shoe ?? '#8a6a40'); p(21, 45, 6, 2, o.shoe ?? '#8a6a40');
  }
  p(13, 24 + b, 14, robeEnd - 24 - b, o.robe); p(13, 24 + b, 3, robeEnd - 24 - b, o.robeShade ?? o.robe);
  if (o.dress) p(12, 40, 16, 6, o.robe);
  if (o.belt) p(13, 32 + b, 14, 2, o.belt);
  if (o.trim) p(13, robeEnd - 2, 14, 2, o.trim);
  // Brazos
  if (o.armL === 'up') p(10, 13 + b, 3, 13, skin); else p(10, 25 + b, 3, 10, skin);
  if (o.armR === 'up') p(27, 13 + b, 3, 13, skin); else p(27, 25 + b, 3, 10, skin);
  p(11, 24 + b, 4, 3, o.sleeve ?? o.robe); p(25, 24 + b, 4, 3, o.sleeve ?? o.robe);
  // Cabeza
  p(18, 21 + b, 4, 3, skin);
  p(14, 10 + b, 12, 11, skin);
  p(16, 14 + b, 2, 2, o.eyes ?? '#2a6aa8'); p(22, 14 + b, 2, 2, o.eyes ?? '#2a6aa8');
  p(18, 18 + b, 4, 1, '#b07060');
  if (o.hair) {
    p(13, 8 + b, 14, 4, o.hair); p(13, 10 + b, 2, 6, o.hair); p(25, 10 + b, 2, 6, o.hair);
    if (o.longHair) { p(12, 10 + b, 3, 16, o.hair); p(25, 10 + b, 3, 16, o.hair); }
  }
  if (o.beard) { p(14, 16 + b, 12, 7, o.beard); p(16, 22 + b, 8, 3, o.beard); p(17, 18 + b, 6, 1, '#9a6050'); }
  return b;
}

/** Destello animado (dos fotogramas) en el punto x, y. */
const twinkle = (p, t, x, y, col = '#ffffff') => {
  if (Math.floor(t * 4) % 2) { p(x, y - 1, 1, 3, col); p(x - 1, y, 3, 1, col); } else p(x, y, 1, 1, col);
};

/** Desplazamiento de la respiración (el mismo que usa figure). */
const bob = (t) => Math.round(Math.sin(t * 2) * 0.6);

/** Alas a ambos lados (detrás de la figura); flap: 0 o 1 para aletear. */
function wings(p, y, col, col2, flap = 0, span = 9) {
  for (const side of [-1, 1]) {
    const x0 = side < 0 ? 13 - span : 27;
    for (let i = 0; i < 4; i++) {
      const w = span - i * 2;
      p(side < 0 ? x0 + i * 2 : x0, y + i * 3 - flap, w, 3, i % 2 ? col2 : col);
    }
  }
}

/** Casco nórdico (con cuernos o alas opcionales). */
function helm(p, b, col, extra = null, extraCol = '#e8e0d0') {
  p(13, 6 + b, 14, 6, col); p(14, 7 + b, 12, 1, '#ffffff33'); p(19, 11 + b, 2, 5, col);
  if (extra === 'horns') { p(10, 3 + b, 3, 5, extraCol); p(9, 1 + b, 2, 3, extraCol); p(27, 3 + b, 3, 5, extraCol); p(29, 1 + b, 2, 3, extraCol); }
  if (extra === 'wings') { p(9, 4 + b, 4, 4, extraCol); p(8, 3 + b, 2, 2, extraCol); p(27, 4 + b, 4, 4, extraCol); p(30, 3 + b, 2, 2, extraCol); }
}

/** Cuello de piel sobre los hombros. */
const furCollar = (p, b, col) => { p(11, 22 + b, 18, 4, col); p(10, 23 + b, 2, 3, col); p(28, 23 + b, 2, 3, col); };

/** Trenzas a los lados de la cara. */
const braids = (p, b, col) => { for (let i = 0; i < 5; i++) { p(12, 14 + b + i * 3, 2, 2, col); p(26, 14 + b + i * 3, 2, 2, col); } };

const EG_SKIN = '#c8885c';
/** Collar ancho egipcio (usekh) de oro y lapislázuli. */
const usekh = (p, b) => { p(12, 22 + b, 16, 4, '#d8a030'); p(13, 23 + b, 14, 1, '#2a5ab8'); p(14, 25 + b, 12, 1, '#c84848'); };
/** Tocado nemes a rayas. */
const nemes = (p, b, a = '#d8a030', c2 = '#2a5ab8') => { p(13, 7 + b, 14, 5, a); p(12, 10 + b, 3, 12, a); p(25, 10 + b, 3, 12, a); for (let i = 0; i < 4; i++) { p(12, 12 + b + i * 3, 3, 1, c2); p(25, 12 + b + i * 3, 3, 1, c2); } };
/** Disco solar con cobra (ureo) sobre la cabeza; brillo animado. */
const sunDisk = (p, t, b, y = 0) => { const g = Math.sin(t * 3) > 0; p(15, y + b, 10, 8, g ? '#ff5030' : '#e8402c'); p(16, y + 1 + b, 3, 2, '#ff9c80'); p(19, y + 7 + b, 2, 2, '#ffd84a'); };
/** Anj (llave de la vida). */
const ankh = (p, x, y, col = '#ffd84a') => { p(x + 1, y, 3, 1, col); p(x, y + 1, 1, 3, col); p(x + 4, y + 1, 1, 3, col); p(x + 1, y + 4, 3, 1, col); p(x - 1, y + 5, 7, 1, col); p(x + 2, y + 6, 1, 6, col); };
/** Cetro uas (bastón con cabeza de animal). */
const was = (p, x, y, h, col = '#d8a030') => { p(x, y, 2, h, col); p(x - 1, y, 4, 2, col); p(x + 2, y - 1, 2, 2, col); p(x, y + h, 3, 1, col); };

/** Cabezas de animal sobre la figura (cubren la cabeza humana). */
function animalHead(p, b, kind, col, eye = '#101018') {
  switch (kind) {
    case 'falcon':
      p(14, 8 + b, 12, 13, col); p(25, 12 + b, 3, 3, '#ffd84a'); p(26, 15 + b, 2, 2, '#ffd84a');
      p(20, 11 + b, 3, 3, '#ffffff'); p(21, 12 + b, 2, 2, eye); p(19, 14 + b, 2, 5, '#101018'); break;
    case 'ibis':
      p(15, 9 + b, 10, 10, '#f4f4f8'); p(15, 9 + b, 10, 3, '#101018'); p(21, 12 + b, 2, 2, eye);
      p(25, 14 + b, 4, 2, '#101018'); p(28, 16 + b, 3, 2, '#101018'); p(30, 18 + b, 2, 3, '#101018'); break;
    case 'lion':
      p(12, 7 + b, 16, 15, col); p(15, 11 + b, 10, 10, '#e8b860'); p(13, 6 + b, 3, 3, col); p(24, 6 + b, 3, 3, col);
      p(16, 13 + b, 2, 2, '#ffd84a'); p(22, 13 + b, 2, 2, '#ffd84a'); p(19, 17 + b, 2, 2, '#5a3020'); p(17, 19 + b, 6, 1, '#5a3020'); break;
    case 'cat':
      p(14, 9 + b, 12, 11, col); p(14, 5 + b, 3, 5, col); p(23, 5 + b, 3, 5, col); p(15, 6 + b, 1, 2, '#d88c9c'); p(24, 6 + b, 1, 2, '#d88c9c');
      p(16, 13 + b, 2, 2, '#5ce070'); p(22, 13 + b, 2, 2, '#5ce070'); p(19, 16 + b, 2, 1, '#d88c9c'); p(25, 15 + b, 2, 2, '#ffd84a'); break;
    case 'croc':
      p(13, 8 + b, 12, 12, col); p(24, 13 + b, 8, 5, col); p(24, 17 + b, 8, 1, '#e8e0c8'); p(31, 13 + b, 1, 1, '#101018');
      p(19, 10 + b, 3, 2, '#ffd84a'); p(20, 10 + b, 1, 2, eye); break;
    case 'ram':
      p(14, 9 + b, 12, 12, col); p(23, 15 + b, 5, 5, col); p(19, 12 + b, 2, 2, eye);
      p(9, 8 + b, 6, 6, '#e8d8b0'); p(10, 9 + b, 4, 4, '#c8b890'); p(25, 8 + b, 6, 6, '#e8d8b0'); p(26, 9 + b, 4, 4, '#c8b890'); break;
    case 'hippo':
      p(12, 8 + b, 16, 14, col); p(14, 16 + b, 12, 6, '#c89c9c'); p(16, 18 + b, 2, 1, '#5a3030'); p(22, 18 + b, 2, 1, '#5a3030');
      p(16, 11 + b, 2, 2, eye); p(22, 11 + b, 2, 2, eye); p(13, 6 + b, 3, 3, col); p(24, 6 + b, 3, 3, col); break;
    case 'set':
      p(14, 9 + b, 12, 11, col); p(24, 14 + b, 6, 3, col); p(29, 15 + b, 2, 3, col); p(19, 12 + b, 2, 2, '#ff3030');
      p(15, 2 + b, 3, 8, col); p(22, 2 + b, 3, 8, col); p(14, 1 + b, 5, 2, col); p(21, 1 + b, 5, 2, col); break;
    case 'vulture':
      p(14, 9 + b, 12, 11, '#e8e0d0'); p(24, 13 + b, 4, 3, '#ffd84a'); p(27, 15 + b, 2, 2, '#ffd84a'); p(20, 12 + b, 2, 2, eye); p(13, 18 + b, 14, 4, '#f4f4f8'); break;
    case 'scarab':
      p(13, 6 + b, 14, 15, '#1c3c4c'); p(15, 8 + b, 10, 6, '#2c6c8c'); p(19, 6 + b, 2, 15, '#101820');
      p(11, 10 + b, 2, 2, '#1c3c4c'); p(27, 10 + b, 2, 2, '#1c3c4c'); p(12, 4 + b, 2, 3, '#1c3c4c'); p(26, 4 + b, 2, 3, '#1c3c4c'); break;
    case 'cobra':
      p(15, 7 + b, 10, 14, col); p(13, 10 + b, 14, 8, col); p(17, 11 + b, 6, 6, '#e8d070'); p(17, 10 + b, 2, 2, eye); p(21, 10 + b, 2, 2, eye); p(19, 15 + b, 1, 3, '#c83030'); break;
    case 'frog':
      p(13, 9 + b, 14, 11, col); p(14, 7 + b, 4, 4, col); p(22, 7 + b, 4, 4, col); p(15, 8 + b, 2, 2, '#ffd84a'); p(23, 8 + b, 2, 2, '#ffd84a'); p(15, 16 + b, 10, 1, '#2c4c2c'); break;
    case 'bull':
      p(13, 9 + b, 14, 12, col); p(15, 16 + b, 10, 5, '#5a3a2a'); p(16, 12 + b, 2, 2, '#ffd84a'); p(22, 12 + b, 2, 2, '#ffd84a');
      p(10, 6 + b, 4, 3, '#e8d8b0'); p(26, 6 + b, 4, 3, '#e8d8b0'); break;
  }
}

/** Ala en abanico que nace en el hombro (x,y) y se abre hacia atrás y arriba. dir -1 = hacia la izquierda. */
function sideWing(p, x, y, col, col2, flap, dir = 1, n = 6) {
  for (let i = 0; i < n; i++) {
    const w = 4 + i * 2, yy = y - i * (flap ? 1 : 2);
    const xx = dir < 0 ? x - i - w : x + i;
    p(xx, yy, w, 2, i === n - 1 ? col2 : col);
    p(dir < 0 ? xx : xx + w - 2, yy + 1, 2, 2, col2);
  }
}

/** Disco relleno de radio r centrado en (cx,cy). */
function disc(p, cx, cy, r, col) {
  for (let dy = -r; dy <= r; dy++) {
    const h = Math.round(Math.sqrt(r * r - dy * dy));
    p(cx - h, cy + dy, h * 2, 1, col);
  }
}

export const GOD_ART = {
  Zeus(t) {
    const c = canvas(), p = painter(c);
    const b = Math.round(Math.sin(t * 2) * 0.6);
    p(10, 40, 20, 4, '#e8eef8'); p(6, 42, 10, 3, '#c8d4f0'); p(24, 42, 12, 3, '#c8d4f0');
    p(13, 26 + b, 14, 15, '#f4f0e8'); p(13, 26 + b, 4, 15, '#d8d0c0'); p(20, 26 + b, 7, 3, '#d8a030'); p(14, 36 + b, 12, 2, '#d8a030');
    p(11, 26 + b, 3, 9, '#e8b890'); p(26, 18 + b, 3, 10, '#e8b890'); p(27, 14 + b, 3, 5, '#e8b890');
    p(14, 10 + b, 12, 10, '#e8b890'); p(13, 15 + b, 14, 8, '#f4f4f8'); p(15, 21 + b, 10, 4, '#e8e8f0'); p(17, 24 + b, 6, 2, '#d8d8e0'); p(13, 8 + b, 14, 4, '#f4f4f8');
    p(16, 13 + b, 2, 2, '#2a6aa8'); p(22, 13 + b, 2, 2, '#2a6aa8'); p(18, 17 + b, 4, 1, '#c8a080');
    p(13, 8 + b, 14, 2, '#d8a030'); p(12, 7 + b, 2, 2, '#ffd84a'); p(26, 7 + b, 2, 2, '#ffd84a'); p(19, 6 + b, 2, 2, '#ffd84a');
    const f = Math.floor(t * 8) % 2, bx = 29, by = 2 + b;
    p(bx, by, 3, 2, '#fff8a0'); p(bx - 1, by + 2, 3, 2, f ? '#ffe050' : '#fff8a0'); p(bx + 1, by + 4, 3, 2, '#ffe050'); p(bx, by + 6, 3, 2, '#ffd84a'); p(bx + 2, by + 8, 2, 3, '#ffd84a');
    return c;
  },
  Anubis(t) {
    const c = canvas(), p = painter(c);
    const b = Math.round(Math.sin(t * 2) * 0.6);
    const ear = Math.sin(t * 3) > 0.9 ? 1 : 0;
    p(13, 38, 5, 8, '#1a1420'); p(22, 38, 5, 8, '#1a1420'); p(12, 30 + b, 16, 9, '#f4f0e8'); p(12, 30 + b, 16, 2, '#d8a030'); p(18, 32 + b, 4, 7, '#2a5ab8');
    p(12, 20 + b, 16, 11, '#1a1420'); p(11, 21 + b, 18, 4, '#d8a030'); p(12, 22 + b, 16, 1, '#2a5ab8'); p(13, 24 + b, 14, 1, '#c84848');
    p(9, 21 + b, 3, 10, '#1a1420'); p(28, 21 + b, 3, 10, '#1a1420'); p(8, 26 + b, 3, 2, '#d8a030'); p(29, 26 + b, 3, 2, '#d8a030');
    p(14, 8 + b, 12, 13, '#2a2430'); p(13, 10 + b, 4, 12, '#d8a030'); p(23, 10 + b, 4, 12, '#d8a030');
    p(13, 13 + b, 4, 1, '#2a5ab8'); p(23, 13 + b, 4, 1, '#2a5ab8'); p(13, 17 + b, 4, 1, '#2a5ab8'); p(23, 17 + b, 4, 1, '#2a5ab8');
    p(16, 1 + b + ear, 3, 9, '#2a2430'); p(21, 1 + b + ear, 3, 9, '#2a2430'); p(17, 3 + b + ear, 1, 5, '#5a3c3c'); p(22, 3 + b + ear, 1, 5, '#5a3c3c');
    p(17, 14 + b, 8, 4, '#2a2430'); p(24, 15 + b, 4, 3, '#2a2430'); p(27, 16 + b, 1, 1, '#101018');
    const glow = Math.sin(t * 4) > 0 ? '#ffe27a' : '#d8a030';
    p(18, 11 + b, 2, 1, glow); p(21, 11 + b, 2, 1, glow);
    p(32, 6, 2, 40, '#d8a030'); p(31, 5, 4, 2, '#d8a030'); p(30, 4, 2, 2, '#d8a030');
    p(6, 24 + b, 3, 3, '#ffd84a'); p(7, 27 + b, 1, 4, '#ffd84a'); p(5, 27 + b, 5, 1, '#ffd84a');
    return c;
  },
  Odin(t) {
    const c = canvas(), p = painter(c);
    const b = Math.round(Math.sin(t * 2) * 0.6);
    const cape = Math.round(Math.sin(t * 2.5));
    p(8 + cape, 18 + b, 24, 28, '#1c2c5c'); p(8 + cape, 18 + b, 3, 28, '#14204a'); p(13, 38, 5, 8, '#3a2a20'); p(22, 38, 5, 8, '#3a2a20');
    p(12, 20 + b, 16, 18, '#5a6a80'); p(12, 28 + b, 16, 2, '#8a6a40'); p(18, 28 + b, 4, 2, '#d8a030');
    p(14, 8 + b, 12, 11, '#e0b890'); p(13, 14 + b, 14, 12, '#c8c8d0'); p(15, 24 + b, 10, 5, '#b8b8c4'); p(17, 28 + b, 6, 4, '#a8a8b8');
    p(16, 12 + b, 3, 2, '#101018'); p(15, 12 + b, 5, 1, '#101018'); p(22, 12 + b, 2, 2, '#7ac8f0');
    p(9, 6 + b, 22, 3, '#2a2a3a'); p(14, 2 + b, 12, 5, '#2a2a3a'); p(14, 6 + b, 12, 1, '#d8a030');
    p(5, 4, 2, 42, '#8a6a40'); p(4, 1, 4, 4, '#c8d4f0'); p(5, 0, 2, 2, '#ffffff');
    const fl = Math.floor(t * 6) % 2, rx = 27, ry = 16 + b - (fl ? 1 : 0);
    p(rx, ry, 6, 4, '#101018'); p(rx + 5, ry - 1, 3, 3, '#101018'); p(rx + 7, ry, 2, 1, '#3a3a4a'); p(rx + 6, ry, 1, 1, '#e05858');
    p(rx + (fl ? -2 : 0), ry + (fl ? -2 : 1), 4, 2, '#202030');
    return c;
  },
  // ---------- Dioses olímpicos ----------
  Hera(t) {
    const c = canvas(), p = painter(c);
    // Abanico de plumas de pavo real detrás, que brilla
    const sh = Math.floor(t * 3) % 3;
    for (let i = 0; i < 7; i++) {
      const x = 4 + i * 5, y = 6 + Math.abs(3 - i) * 2;
      p(x, y, 3, 14, '#1c6c5c'); p(x, y, 3, 3, i % 3 === sh ? '#5ce0f0' : '#2a5ab8'); p(x + 1, y + 1, 1, 1, '#ffd84a');
    }
    const b = figure(p, t, { robe: '#e8eef8', robeShade: '#c8d4f0', dress: true, belt: '#d8a030', hair: '#3a2010', longHair: true, eyes: '#5a3c8c', trim: '#2a5ab8' });
    p(13, 7 + b, 14, 2, '#d8a030'); p(15, 5 + b, 2, 2, '#ffd84a'); p(19, 4 + b, 2, 3, '#ffd84a'); p(23, 5 + b, 2, 2, '#ffd84a');
    p(31, 8, 2, 38, '#d8a030'); p(30, 5, 4, 4, '#2a5ab8'); p(31, 6, 2, 2, '#ffd84a');
    return c;
  },
  Poseidon(t) {
    const c = canvas(), p = painter(c);
    const b = figure(p, t, { robe: '#2c8c8c', robeShade: '#1c6c6c', belt: '#d8a030', hair: '#c8d8e0', beard: '#c8d8e0', armR: 'up', eyes: '#1c6c8c' });
    p(13, 7 + b, 14, 2, '#d8a030'); p(14, 5 + b, 2, 2, '#ffd84a'); p(19, 4 + b, 2, 3, '#ffd84a'); p(24, 5 + b, 2, 2, '#ffd84a');
    // Tridente en alto
    p(28, 2 + b, 2, 30, '#d8a030'); p(25, 2 + b, 8, 2, '#d8a030'); p(25, 0 + b, 2, 3, '#ffe27a'); p(28, -1 + b, 2, 3, '#ffe27a'); p(31, 0 + b, 2, 3, '#ffe27a');
    // Ola a los pies que va y viene
    const w = Math.round(Math.sin(t * 3) * 2);
    p(2 + w, 42, 36, 6, '#2c8cd8'); p(4 + w, 40, 8, 3, '#78c0ff'); p(20 + w, 40, 10, 3, '#78c0ff'); p(6 + w, 39, 3, 2, '#ffffff'); p(24 + w, 39, 3, 2, '#ffffff');
    return c;
  },
  Hades(t) {
    const c = canvas(), p = painter(c);
    // Llamas azules del inframundo detrás
    const f = Math.floor(t * 6) % 2;
    p(6, 18 - f, 4, 22, '#2a3c8c'); p(30, 16 + f, 4, 24, '#2a3c8c'); p(7, 14 - f, 2, 6, '#5ca0f0'); p(31, 12 + f, 2, 6, '#5ca0f0');
    const b = figure(p, t, { robe: '#1c1428', robeShade: '#100c18', belt: '#5a4c8c', hair: '#101018', beard: '#101018', skin: '#c8b8b0', eyes: '#5ca0f0', armR: 'up', shoe: '#101018', legs: '#1c1428' });
    // Corona de pinchos negros
    p(13, 6 + b, 14, 3, '#2a2438'); p(14, 3 + b, 2, 3, '#2a2438'); p(19, 2 + b, 2, 4, '#2a2438'); p(24, 3 + b, 2, 3, '#2a2438');
    // Bidente
    p(28, 3 + b, 2, 30, '#5a5068'); p(26, 3 + b, 6, 2, '#5a5068'); p(26, 0 + b, 2, 3, '#c8c8e0'); p(30, 0 + b, 2, 3, '#c8c8e0');
    return c;
  },
  Athena(t) {
    const c = canvas(), p = painter(c);
    const b = figure(p, t, { robe: '#e8eef8', robeShade: '#c8d4f0', dress: true, belt: '#d8a030', hair: '#5a3c20', longHair: true, eyes: '#8a8a9c', armR: 'up' });
    // Casco corintio con penacho rojo
    p(13, 6 + b, 14, 6, '#c8a040'); p(14, 7 + b, 12, 1, '#ffe27a'); p(16, 1 + b, 8, 6, '#c83a2c'); p(17, 0 + b, 6, 2, '#e05858');
    // Lanza y escudo con la cabeza de Gorgona
    p(28, 0 + b, 2, 40, '#8a6a40'); p(27, 0 + b, 4, 3, '#c8d4f0');
    p(3, 24 + b, 12, 14, '#d8a030'); p(4, 25 + b, 10, 12, '#c8a040'); p(7, 28 + b, 4, 4, '#5c8c5c'); p(6, 27 + b, 1, 1, '#5c8c5c'); p(11, 27 + b, 1, 1, '#5c8c5c');
    // Lechuza en el hombro que parpadea
    const blink = Math.sin(t * 2.5) > 0.9;
    p(26, 18 + b, 6, 6, '#8a7050'); p(27, 19 + b, 1, 1, blink ? '#8a7050' : '#ffd84a'); p(30, 19 + b, 1, 1, blink ? '#8a7050' : '#ffd84a'); p(28, 21 + b, 2, 1, '#d8a030');
    return c;
  },
  Apollo(t) {
    const c = canvas(), p = painter(c);
    // Disco solar detrás con rayos que giran
    const r = Math.floor(t * 2) % 2;
    for (let y = 0; y < 22; y++) {
      const half = Math.round(Math.sqrt(Math.max(0, 121 - (y - 11) ** 2)));
      p(20 - half, 1 + y, half * 2, 1, Math.abs(y - 11) < 8 && half > 3 ? '#fff0a0' : '#ffd84a');
    }
    for (const [x, y] of r ? [[19, 0], [19, 22], [8, 11], [30, 11]] : [[11, 3], [27, 3], [11, 19], [27, 19]]) p(x, y, 2, 2, '#ffe27a');
    const b = figure(p, t, { robe: '#f4f0e8', robeShade: '#d8d0c0', belt: '#d8a030', hair: '#ffd84a', eyes: '#2a6aa8' });
    p(13, 7 + b, 14, 2, '#5c9c3c'); p(12, 8 + b, 2, 2, '#7cc04c'); p(26, 8 + b, 2, 2, '#7cc04c');
    // Lira dorada
    p(4, 26 + b, 2, 10, '#d8a030'); p(10, 26 + b, 2, 10, '#d8a030'); p(4, 34 + b, 8, 2, '#d8a030'); p(4, 26 + b, 8, 1, '#ffd84a');
    for (let i = 0; i < 3; i++) p(6 + i, 27 + b, 1, 7, Math.floor(t * 6) % 3 === i ? '#ffffff' : '#c8c8d0');
    return c;
  },
  Artemis(t) {
    const c = canvas(), p = painter(c);
    // Luna creciente arriba
    p(28, 1, 6, 8, '#f4f4f8'); p(30, 1, 5, 7, '#00000000');
    const ctx = c.getContext('2d');
    ctx.clearRect(30, 2, 4, 6);
    const b = figure(p, t, { robe: '#5c8c3c', robeShade: '#3c6c2c', belt: '#8a6a40', hair: '#7a4a20', longHair: true, eyes: '#3c6c2c', legs: SKIN, shoe: '#6a4a20' });
    p(13, 7 + b, 14, 2, '#c8c8e0'); p(19, 5 + b, 2, 3, '#f4f4f8');
    // Arco tensado y flecha
    const pull = Math.round(Math.sin(t * 2) + 1);
    p(4, 14 + b, 2, 24, '#8a5a30'); p(5, 13 + b, 2, 2, '#8a5a30'); p(5, 37 + b, 2, 2, '#8a5a30'); p(7 - pull, 15 + b, 1, 22, '#e8e8f0');
    p(1, 25 + b, 12, 1, '#c8a060'); p(0, 24 + b, 2, 3, '#c8c8e0');
    // Carcaj a la espalda
    p(26, 18 + b, 4, 10, '#6a4a20'); p(26, 16 + b, 1, 3, '#e05858'); p(28, 15 + b, 1, 4, '#e05858');
    return c;
  },
  Ares(t) {
    const c = canvas(), p = painter(c);
    const cape = Math.round(Math.sin(t * 2.5));
    p(9 + cape, 22, 22, 24, '#a82c2c'); p(9 + cape, 22, 3, 24, '#7c1c1c');
    const b = figure(p, t, { robe: '#a87c3c', robeShade: '#7c5c2c', belt: '#5a3c1c', beard: '#3a2010', hair: '#3a2010', eyes: '#c83a2c', legs: '#a87c3c', shoe: '#5a3c1c' });
    // Coraza y casco con cresta
    p(14, 25 + b, 12, 6, '#c8a040'); p(16, 26 + b, 2, 4, '#ffe27a');
    p(13, 6 + b, 14, 6, '#c8a040'); p(14, 11 + b, 2, 6, '#c8a040'); p(24, 11 + b, 2, 6, '#c8a040'); p(14, 1 + b, 12, 5, '#c83a2c');
    // Espada y escudo redondo
    p(30, 18 + b, 2, 14, '#e8e8f0'); p(28, 30 + b, 6, 2, '#5a3c1c');
    p(3, 26 + b, 10, 10, '#a82c2c'); p(5, 28 + b, 6, 6, '#c8a040'); p(7, 30 + b, 2, 2, '#ffe27a');
    // Ascuas que suben
    const e = (t * 20) % 20;
    p(6, 20 - e, 1, 1, '#ff7a20'); p(32, 24 - ((e + 8) % 20), 1, 1, '#ffd84a');
    return c;
  },
  Aphrodite(t) {
    const c = canvas(), p = painter(c);
    // Concha detrás
    for (let i = 0; i < 6; i++) p(6 + i * 5, 26 - Math.abs(2.5 - i) * 2, 4, 20, i % 2 ? '#f4c8d0' : '#ffe0e8');
    const b = figure(p, t, { robe: '#f088a8', robeShade: '#d0688c', dress: true, belt: '#ffd84a', hair: '#ffd84a', longHair: true, eyes: '#2a8a6a' });
    p(14, 7 + b, 3, 3, '#e05878'); p(23, 7 + b, 3, 3, '#e05878');
    // Paloma en la mano
    p(4, 22 + b, 6, 4, '#ffffff'); p(9, 21 + b, 2, 2, '#ffffff'); p(3, 21 + b, 2, 2, '#e8e8f0'); p(10, 22 + b, 1, 1, '#ffb030');
    // Corazones que flotan
    const hy = 18 - ((t * 8) % 16);
    for (const x of [31, 34]) { p(x, hy + (x - 31), 1, 1, '#ff6890'); p(x + 2, hy + (x - 31), 1, 1, '#ff6890'); p(x, hy + 1 + (x - 31), 3, 1, '#ff6890'); p(x + 1, hy + 2 + (x - 31), 1, 1, '#ff6890'); }
    return c;
  },
  Hephaestus(t) {
    const c = canvas(), p = painter(c);
    const b = figure(p, t, { robe: '#5a3c20', robeShade: '#3c2810', belt: '#2a1c10', beard: '#5a2c10', hair: '#5a2c10', skin: '#c89060', eyes: '#3a2010', armR: 'up', legs: '#c89060', shoe: '#2a1c10' });
    // Delantal de cuero
    p(15, 26 + b, 10, 14, '#7a5030');
    // Yunque y martillo que golpea con chispas
    p(2, 38, 14, 4, '#5a5a68'); p(5, 42, 8, 4, '#3a3a48'); p(1, 37, 5, 2, '#5a5a68');
    const up = Math.floor(t * 3) % 2;
    p(27, (up ? 8 : 14) + b, 2, 12, '#8a6a40'); p(25, (up ? 6 : 12) + b, 6, 4, '#7a7a88');
    if (!up) { p(12, 34, 1, 1, '#ffd84a'); p(15, 33, 1, 1, '#ff7a20'); p(10, 32, 1, 1, '#ffe27a'); }
    return c;
  },
  Hermes(t) {
    const c = canvas(), p = painter(c);
    const b = figure(p, t, { robe: '#f4f0e8', robeShade: '#d8d0c0', belt: '#d8a030', hair: '#c8803c', eyes: '#2a6aa8', armR: 'up' });
    // Pétaso alado
    p(11, 7 + b, 18, 2, '#c8a060'); p(14, 4 + b, 12, 4, '#c8a060');
    const flap = Math.floor(t * 6) % 2;
    p(9, 3 + b - flap, 4, 3, '#ffffff'); p(27, 3 + b - flap, 4, 3, '#ffffff');
    // Sandalias aladas
    p(11, 43 - flap, 3, 2, '#ffffff'); p(27, 43 - flap, 3, 2, '#ffffff');
    // Caduceo
    p(28, 2 + b, 2, 30, '#d8a030'); p(26, 2 + b, 6, 2, '#ffffff'); p(27, 7 + b, 1, 2, '#5c9c3c'); p(30, 9 + b, 1, 2, '#5c9c3c'); p(27, 11 + b, 1, 2, '#5c9c3c'); p(30, 13 + b, 1, 2, '#5c9c3c');
    return c;
  },
  Dionysus(t) {
    const c = canvas(), p = painter(c);
    const b = figure(p, t, { robe: '#8c3c8c', robeShade: '#6c2c6c', belt: '#5c9c3c', hair: '#3a2010', eyes: '#6c2c6c', armR: 'up' });
    // Corona de hiedra con uvas
    p(13, 7 + b, 14, 2, '#5c9c3c'); p(12, 8 + b, 2, 3, '#7cc04c'); p(26, 8 + b, 2, 3, '#7cc04c'); p(24, 5 + b, 3, 3, '#6c2c8c');
    // Copa de vino
    p(27, 9 + b, 6, 3, '#d8a030'); p(29, 12 + b, 2, 3, '#d8a030'); p(28, 9 + b, 4, 1, '#a82c4c');
    // Tirso con piña
    p(5, 6 + b, 2, 36, '#8a6a40'); p(4, 3 + b, 4, 5, '#c8a040'); p(5, 4 + b, 2, 1, '#8a6a40');
    // Racimo de uvas que se balancea
    const sw = Math.round(Math.sin(t * 2.5));
    p(14 + sw, 34 + b, 2, 2, '#6c2c8c'); p(16 + sw, 34 + b, 2, 2, '#8c4cac'); p(15 + sw, 36 + b, 2, 2, '#6c2c8c');
    return c;
  },
  Demeter(t) {
    const c = canvas(), p = painter(c);
    const b = figure(p, t, { robe: '#5c9c3c', robeShade: '#3c7c2c', dress: true, belt: '#d8a030', hair: '#c8803c', longHair: true, eyes: '#3c7c2c', armR: 'up' });
    // Corona de espigas
    for (let i = 0; i < 5; i++) p(14 + i * 3, 3 + b + (i % 2), 1, 5, '#ffd84a');
    p(13, 7 + b, 14, 2, '#d8a030');
    // Gavilla de trigo que se mece
    const sw = Math.round(Math.sin(t * 2) * 1.5);
    for (let i = 0; i < 4; i++) { p(28 + i, 2 + b + sw * (i % 2), 1, 14, '#c8a040'); p(28 + i + sw, 1 + b, 1, 3, '#ffd84a'); }
    p(27, 14 + b, 6, 2, '#8a6a40');
    return c;
  },
  Hestia(t) {
    const c = canvas(), p = painter(c);
    const b = figure(p, t, { robe: '#d87830', robeShade: '#b05c20', dress: true, belt: '#8a4c20', hair: '#5a3c20', longHair: true, eyes: '#8a4c20' });
    // Velo
    p(12, 7 + b, 16, 4, '#f4ecd8'); p(11, 10 + b, 3, 18, '#f4ecd8'); p(26, 10 + b, 3, 18, '#f4ecd8');
    // Llama del hogar entre las manos, que titila
    const f = Math.floor(t * 8) % 2;
    p(16, 30 + b, 8, 3, '#8a4c20'); p(17, 25 + b - f, 6, 5, '#ff7a20'); p(18, 22 + b - f, 4, 4, '#ffd84a'); p(19, 20 + b - f, 2, 3, '#fff8d0');
    return c;
  },
  Persephone(t) {
    const c = canvas(), p = painter(c);
    // Mitad primavera (flores) y mitad inframundo (sombra)
    p(0, 40, 20, 8, '#5c9c3c'); p(20, 40, 20, 8, '#2a2438');
    p(3, 38, 2, 2, '#f070a0'); p(9, 39, 2, 2, '#ffd84a'); p(15, 38, 2, 2, '#ffffff');
    const b = figure(p, t, { robe: '#a83c6c', robeShade: '#7c2c4c', dress: true, belt: '#2a2438', hair: '#3a2010', longHair: true, eyes: '#5c9c3c' });
    // Corona de flores
    for (let i = 0; i < 5; i++) p(13 + i * 3, 6 + b, 2, 2, ['#f070a0', '#ffd84a', '#ffffff', '#f070a0', '#ffd84a'][i]);
    // Granada en la mano
    p(4, 30 + b, 6, 6, '#c8283c'); p(5, 29 + b, 2, 2, '#5c9c3c'); p(6, 32 + b, 1, 1, '#ff8890');
    twinkle(p, t, 32, 10, '#f4c8e0');
    return c;
  },
  Cronus(t) {
    const c = canvas(), p = painter(c);
    const b = figure(p, t, { robe: '#5a5468', robeShade: '#3c3848', belt: '#8a7a5a', hair: '#c8c8d0', beard: '#d8d8e0', skin: '#d8b090', eyes: '#5a5468', armR: 'up' });
    p(16, 26 + b, 8, 12, '#d8d8e0');
    // Hoz gigante
    p(29, 2 + b, 2, 38, '#6a5a40'); p(22, 2 + b, 9, 2, '#c8c8d8'); p(20, 4 + b, 3, 2, '#c8c8d8'); p(19, 6 + b, 2, 3, '#c8c8d8');
    // Reloj de arena con la arena cayendo
    p(3, 26 + b, 8, 2, '#8a6a40'); p(3, 38 + b, 8, 2, '#8a6a40'); p(4, 28 + b, 6, 4, '#e8e0c8'); p(4, 34 + b, 6, 4, '#e8e0c8');
    const sand = Math.floor(t * 2) % 4;
    p(5, 28 + b + sand, 4, 3 - Math.min(2, sand), '#d8b060'); p(5, 36 + b - Math.min(2, sand), 4, 2 + Math.min(2, sand), '#d8b060'); p(6, 32 + b, 2, 2, '#d8b060');
    return c;
  }
,
  // ---------- Dioses griegos (tanda 2) ----------
  Rhea(t) {
    const c = canvas(), p = painter(c);
    const b = figure(p, t, { robe: '#8c5c3c', robeShade: '#6c442c', dress: true, belt: '#d8a030', hair: '#3a2010', longHair: true, eyes: '#5a3c20' });
    // Corona mural (torres) y piedra envuelta en pañales (la que dio a Crono)
    p(13, 4 + b, 14, 5, '#c8a040'); p(14, 2 + b, 3, 3, '#c8a040'); p(19, 2 + b, 3, 3, '#c8a040'); p(24, 2 + b, 3, 3, '#c8a040');
    p(3, 26 + b, 9, 8, '#e8e0d0'); p(4, 27 + b, 7, 2, '#a8a090'); p(4, 31 + b, 7, 1, '#a8a090');
    // León a sus pies que mueve la cola
    const tail = Math.floor(t * 3) % 2;
    p(26, 38, 12, 6, '#c89040'); p(33, 34, 6, 6, '#c89040'); p(32, 33, 8, 3, '#8a5a20'); p(36, 36, 1, 1, '#101018'); p(24, 37 - tail, 3, 2, '#8a5a20');
    return c;
  },
  Gaia(t) {
    const c = canvas(), p = painter(c);
    // Brotes que crecen alrededor
    const g = Math.floor(t * 2) % 3;
    for (const [x, h] of [[2, 6], [6, 9], [32, 8], [36, 5]]) { p(x, 46 - h - g, 2, h + g, '#5c9c3c'); p(x - 1, 46 - h - g, 4, 2, '#8ce070'); }
    const b = figure(p, t, { robe: '#5c8c3c', robeShade: '#3c6c2c', dress: true, belt: '#8a5a30', hair: '#4a3020', longHair: true, skin: '#c89060', eyes: '#3c6c2c' });
    // Pelo con hojas y flores
    p(12, 10 + b, 3, 3, '#8ce070'); p(25, 14 + b, 3, 3, '#8ce070'); p(14, 6 + b, 2, 2, '#f070a0'); p(23, 6 + b, 2, 2, '#ffd84a');
    p(16, 30 + b, 8, 8, '#4c7c2c'); p(18, 32 + b, 4, 4, '#8a5a30');
    return c;
  },
  Uranus(t) {
    const c = canvas(), p = painter(c);
    // Bóveda celeste detrás: un arco de cielo estrellado que sostiene con los brazos
    for (let x = 0; x < 40; x++) {
      const y = Math.round(10 - Math.sqrt(Math.max(0, 400 - (x - 20) ** 2)) * 0.45);
      p(x, y, 1, 4, '#2c3c8c');
    }
    twinkle(p, t + 0.5, 6, 6); twinkle(p, t, 33, 6);
    const b = figure(p, t, { robe: '#1c2c6c', robeShade: '#101c4c', belt: '#c8c8f0', hair: '#c8d4f0', beard: '#c8d4f0', eyes: '#8cc8ff', armL: 'up', armR: 'up' });
    // Manto de cielo estrellado: estrellas que titilan en la túnica
    for (const [x, y] of [[15, 27], [21, 30], [17, 35], [24, 37], [14, 39]]) p(x, y + b, 1, 1, '#ffffff');
    twinkle(p, t, 18, 32 + b);
    return c;
  },
  Nyx(t) {
    const c = canvas(), p = painter(c);
    // Velo de noche que ondea detrás
    const w = Math.round(Math.sin(t * 2));
    p(5 + w, 8, 30, 38, '#14102c'); p(5 + w, 8, 3, 38, '#0c0820');
    const b = figure(p, t, { robe: '#2a1c4c', robeShade: '#1c1238', dress: true, belt: '#8a7ab8', hair: '#0c0818', longHair: true, skin: '#c8b8d8', eyes: '#b494f0' });
    // Corona de estrellas y estrellas en el velo
    for (const [x, y] of [[14, 6], [19, 4], [24, 6]]) p(x, y + b, 2, 2, '#f4f4f8');
    for (const [x, y] of [[8, 14], [31, 20], [9, 32], [32, 38]]) twinkle(p, t + x, x + w, y);
    return c;
  },
  Tartarus(t) {
    const c = canvas(), p = painter(c);
    // Abismo: una boca de oscuridad con ojos rojos y cadenas
    for (let y = 0; y < 44; y++) {
      const half = Math.round(16 * Math.sin((y / 44) * Math.PI) + 2);
      p(20 - half, 2 + y, half * 2, 1, y % 6 < 3 ? '#1c1020' : '#140c18');
    }
    const g = Math.sin(t * 3) > 0;
    p(13, 16, 4, 3, g ? '#ff3030' : '#a01818'); p(23, 16, 4, 3, g ? '#ff3030' : '#a01818');
    p(12, 26, 16, 3, '#2c0810'); for (let i = 0; i < 5; i++) p(13 + i * 3, 25, 2, 2, '#e8e0d0');
    // Cadenas que cuelgan y se balancean
    const sw = Math.round(Math.sin(t * 2));
    for (let i = 0; i < 6; i++) { p(4 + sw, 6 + i * 6, 3, 4, '#5a5a68'); p(33 - sw, 8 + i * 6, 3, 4, '#5a5a68'); }
    return c;
  },
  Eros(t) {
    const c = canvas(), p = painter(c);
    const flap = Math.floor(t * 5) % 2;
    wings(p, 16 + bob(t), '#ffffff', '#f4d0e0', flap, 8);
    const b = figure(p, t, { robe: '#f8e8f0', robeShade: '#e8c8d8', belt: '#ff6890', hair: '#ffd84a', eyes: '#2a6aa8', skin: '#f0c8a0' });
    // Arco y flecha de corazón
    p(3, 20 + b, 2, 16, '#d8a030'); p(4, 19 + b, 2, 2, '#d8a030'); p(4, 35 + b, 2, 2, '#d8a030'); p(6, 21 + b, 1, 14, '#ffffff');
    p(5, 27 + b, 10, 1, '#c8a060'); p(14, 26 + b, 1, 3, '#ff6890'); p(15, 27 + b, 1, 1, '#ff6890');
    return c;
  },
  Hecate(t) {
    const c = canvas(), p = painter(c);
    // Tres caras: dos de perfil a los lados de la cabeza
    const b0 = bob(t);
    p(8, 11 + b0, 6, 9, '#d8c8b8'); p(9, 14 + b0, 1, 1, '#b494f0'); p(26, 11 + b0, 6, 9, '#d8c8b8'); p(30, 14 + b0, 1, 1, '#b494f0');
    const b = figure(p, t, { robe: '#3c2c5c', robeShade: '#2a1c44', dress: true, belt: '#b494f0', hair: '#101018', longHair: true, skin: '#d8c8b8', eyes: '#b494f0' });
    p(13, 7 + b, 14, 2, '#c8c8e0'); p(19, 4 + b, 2, 4, '#f4f4f8');
    // Dos antorchas con llamas que titilan
    const f = Math.floor(t * 8) % 2;
    for (const x of [3, 34]) { p(x, 20 + b, 2, 16, '#6a4a20'); p(x - 1, 16 + b - f, 4, 5, '#ff7a20'); p(x, 14 + b - f, 2, 3, '#ffd84a'); }
    return c;
  },
  Helios(t) {
    const c = canvas(), p = painter(c);
    // Corona de rayos de sol que giran
    const r = Math.floor(t * 3) % 2;
    const b = figure(p, t, { robe: '#ffb030', robeShade: '#d88c20', belt: '#fff0a0', hair: '#ff8c20', eyes: '#c86010', armR: 'up' });
    for (let i = 0; i < 7; i++) {
      const x = 12 + i * 3, h = 4 + ((i + r) % 2) * 3;
      p(x, 8 + b - h, 2, h, i % 2 ? '#ffd84a' : '#fff0a0');
    }
    p(13, 7 + b, 14, 2, '#ffd84a');
    // Látigo de su carro, que restalla
    p(28, 4 + b, 2, 12, '#8a6a40'); p(30, 2 + b - r, 6, 1, '#ffe27a'); p(35, 3 + b - r, 1, 3, '#ffe27a');
    return c;
  },
  Selene(t) {
    const c = canvas(), p = painter(c);
    const b = figure(p, t, { robe: '#c8d4f0', robeShade: '#a8b4d8', dress: true, belt: '#8cb4ff', hair: '#2a2c4c', longHair: true, skin: '#e8d8d0', eyes: '#2a5ab8' });
    // Luna creciente sobre la frente, que brilla
    const g = Math.sin(t * 2) > 0 ? '#ffffff' : '#e8f0ff';
    p(14, 3 + b, 3, 5, g); p(23, 3 + b, 3, 5, g); p(16, 6 + b, 8, 2, g);
    // Velo que flota en un arco sobre su cabeza
    const w = Math.round(Math.sin(t * 2.5));
    p(6, 2 + w, 3, 20, '#a8b4d8'); p(31, 2 - w, 3, 20, '#a8b4d8'); p(8, 0 + w, 24, 2, '#a8b4d8');
    return c;
  },
  Nike(t) {
    const c = canvas(), p = painter(c);
    const flap = Math.floor(t * 4) % 2;
    wings(p, 12 + bob(t), '#ffffff', '#e8e0d0', flap, 11);
    const b = figure(p, t, { robe: '#f4f0e8', robeShade: '#d8d0c0', dress: true, belt: '#d8a030', hair: '#8a5a20', longHair: true, eyes: '#5a3c20', armR: 'up' });
    // Corona de laurel en alto y palma de la victoria
    p(26, 6 + b, 8, 2, '#5c9c3c'); p(26, 4 + b, 2, 3, '#7cc04c'); p(32, 4 + b, 2, 3, '#7cc04c');
    p(5, 22 + b, 2, 18, '#6a8a3c'); for (let i = 0; i < 4; i++) { p(2, 22 + b + i * 3, 4, 1, '#7cc04c'); p(7, 23 + b + i * 3, 4, 1, '#7cc04c'); }
    twinkle(p, t, 30, 2 + b, '#ffe27a');
    return c;
  },
  Thanatos(t) {
    const c = canvas(), p = painter(c);
    const flap = Math.floor(t * 3) % 2;
    wings(p, 14 + bob(t), '#2a2a3a', '#3c3c4c', flap, 10);
    const b = figure(p, t, { robe: '#1c1c28', robeShade: '#101018', belt: '#5a5a68', hair: '#101018', skin: '#c8c8c8', eyes: '#c8c8e0', legs: '#1c1c28', shoe: '#101018' });
    // Antorcha invertida que se apaga y espada
    const f = Math.floor(t * 6) % 2;
    p(4, 22 + b, 2, 14, '#6a4a20'); p(3, 36 + b + f, 4, 3, '#5a5a68');
    p(30, 16 + b, 2, 16, '#c8c8d8'); p(28, 30 + b, 6, 2, '#3c3c4c');
    return c;
  },
  Hypnos(t) {
    const c = canvas(), p = painter(c);
    const b = figure(p, t, { robe: '#5a5c9c', robeShade: '#40427c', belt: '#c8c8f0', hair: '#c8a060', eyes: SKIN });
    // Ojos cerrados (duerme) y alitas en la cabeza
    p(16, 15 + b, 2, 1, '#5a3c3c'); p(22, 15 + b, 2, 1, '#5a3c3c');
    const flap = Math.floor(t * 2) % 2;
    p(10, 8 + b - flap, 4, 3, '#ffffff'); p(26, 8 + b - flap, 4, 3, '#ffffff');
    // Amapola en la mano y «Z» que suben
    p(4, 28 + b, 2, 8, '#5c9c3c'); p(3, 25 + b, 4, 4, '#e05858'); p(4, 26 + b, 2, 2, '#101018');
    const z = Math.floor(t * 2) % 3;
    p(29, 10 - z * 3, 3, 1, '#e8e8f0'); p(30, 11 - z * 3, 1, 1, '#e8e8f0'); p(29, 12 - z * 3, 3, 1, '#e8e8f0');
    return c;
  },
  Pan(t) {
    const c = canvas(), p = painter(c);
    const b = figure(p, t, { robe: '#8a6a40', robeShade: '#6a4a20', belt: '#5c9c3c', hair: '#5a3c20', beard: '#5a3c20', skin: '#d8a070', eyes: '#5c9c3c', legs: '#6a4a20', shoe: '#2a1c10' });
    // Cuernos de cabra y orejas puntiagudas
    p(13, 4 + b, 3, 5, '#d8c8a0'); p(24, 4 + b, 3, 5, '#d8c8a0'); p(12, 3 + b, 2, 2, '#d8c8a0'); p(26, 3 + b, 2, 2, '#d8c8a0');
    // Patas de cabra con pelo
    p(13, 40, 6, 5, '#6a4a20'); p(21, 40, 6, 5, '#6a4a20');
    // Siringa que toca, con notas que suben
    p(26, 18 + b, 8, 6, '#c8a060'); for (let i = 0; i < 4; i++) p(26 + i * 2, 24 + b, 1, i + 1, '#c8a060');
    const n = (t * 10) % 14;
    p(33, 14 - n, 2, 2, '#ffffff'); p(34, 11 - n, 1, 3, '#ffffff');
    return c;
  },
  Oceanus(t) {
    const c = canvas(), p = painter(c);
    // Cola de serpiente marina en lugar de piernas, que ondula
    const w = Math.round(Math.sin(t * 3) * 2);
    p(12, 38, 16, 6, '#2c8c8c'); p(26 + w, 40, 8, 4, '#2c8c8c'); p(32 + w, 36, 4, 6, '#2c8c8c'); p(34 + w, 33, 5, 4, '#5cc0c0');
    const b = figure(p, t, { robe: '#3ca0a0', robeShade: '#2c8080', dress: true, belt: '#d8a030', hair: '#c8e0e0', beard: '#c8e0e0', eyes: '#1c6c8c' });
    // Pinzas de cangrejo como cuernos
    p(11, 3 + b, 4, 6, '#e05838'); p(10, 2 + b, 3, 3, '#e05838'); p(25, 3 + b, 4, 6, '#e05838'); p(27, 2 + b, 3, 3, '#e05838');
    p(4, 24 + b, 6, 3, '#78c0ff'); twinkle(p, t, 6, 22 + b, '#d8f4ff');
    return c;
  },
  Prometheus(t) {
    const c = canvas(), p = painter(c);
    const b = figure(p, t, { robe: '#a87c4c', robeShade: '#7c5c34', belt: '#5a3c20', hair: '#5a2c10', beard: '#5a2c10', eyes: '#c86010', armR: 'up' });
    // Antorcha con el fuego robado a los dioses
    const f = Math.floor(t * 8) % 2;
    p(28, 10 + b, 2, 16, '#6a4a20'); p(26, 4 + b - f, 6, 7, '#ff7a20'); p(27, 2 + b - f, 4, 4, '#ffd84a'); p(28, 0 + b - f, 2, 3, '#fff8d0');
    // Cadena rota en la muñeca
    p(8, 33 + b, 6, 2, '#7a7a88'); p(4, 34 + b, 4, 2, '#7a7a88'); p(2, 36 + b, 3, 2, '#7a7a88');
    return c;
  },
  Atlas(t) {
    const c = canvas(), p = painter(c);
    // El cielo (esfera) sobre los hombros
    const b = figure(p, t, { robe: '#8a6a40', robeShade: '#6a4a20', belt: '#5a3c20', hair: '#5a3c20', beard: '#5a3c20', skin: '#c89060', eyes: '#3a2010', armL: 'up', armR: 'up' });
    // El cielo: una esfera con meridianos que gira despacio, sobre la cabeza y las manos
    const rot = Math.floor(t * 2) % 4;
    for (let y = 0; y < 12; y++) {
      const half = Math.round(Math.sqrt(Math.max(0, 36 - (y - 6) ** 2)) * 1.5);
      p(20 - half, y - 1 + b, half * 2, 1, '#2c4c9c');
    }
    for (let k = 0; k < 3; k++) p(14 + ((k * 4 + rot) % 12), 0 + b, 1, 10, '#5c8cd8');
    p(11, 5 + b, 18, 1, '#5c8cd8');
    twinkle(p, t, 15, 3 + b); twinkle(p, t + 0.5, 25, 6 + b);
    p(17, 26 + b, 6, 4, '#a87850'); // músculos marcados
    return c;
  },
  Typhon(t) {
    const c = canvas(), p = painter(c);
    // Cuerpo de gigante con alas y piernas de serpientes que se retuercen
    const flap = Math.floor(t * 4) % 2;
    wings(p, 10 + bob(t), '#4c2c2c', '#6c3c3c', flap, 10);
    const b = figure(p, t, { robe: '#5c3c3c', robeShade: '#3c2828', dress: true, hair: '#2a1c1c', beard: '#2a1c1c', skin: '#a87860', eyes: '#ff7a20' });
    const w = Math.round(Math.sin(t * 3) * 2);
    for (const [x, d] of [[6, 1], [14, -1], [24, 1], [32, -1]]) {
      p(x + w * d, 38, 4, 8, '#5c8c3c'); p(x + w * d - 1, 36, 6, 3, '#7cac4c'); p(x + w * d, 36, 1, 1, '#ff3030');
    }
    // Llamas de la boca
    const f = Math.floor(t * 8) % 2;
    if (f) { p(18, 22 + b, 4, 2, '#ff7a20'); p(19, 24 + b, 2, 2, '#ffd84a'); }
    return c;
  },
  Boreas(t) {
    const c = canvas(), p = painter(c);
    const flap = Math.floor(t * 4) % 2;
    wings(p, 12 + bob(t), '#c8d8e8', '#a8c0d8', flap, 10);
    const b = figure(p, t, { robe: '#8cb4d8', robeShade: '#6c94b8', belt: '#e8f4ff', hair: '#e8f4ff', beard: '#e8f4ff', eyes: '#2a6aa8', skin: '#d8d0e0' });
    // Sopla el viento del norte: ráfagas y copos que vuelan
    const g = (t * 30) % 20;
    p(28, 18 + b, 2, 2, '#c8a0a0');
    for (const [y, o] of [[16, 0], [20, 6], [24, 12]]) p(30 + ((g + o) % 10), y + b, 5, 1, '#e8f4ff');
    p(34, 12 + ((g * 2) % 20), 1, 1, '#ffffff'); p(37, 22 + ((g * 3) % 16), 1, 1, '#ffffff');
    return c;
  }
,
  // ---------- Dioses nórdicos ----------
  Thor(t) {
    const c = canvas(), p = painter(c);
    const b = figure(p, t, { robe: '#a83030', robeShade: '#7c2020', belt: '#d8a030', hair: '#c8481c', beard: '#c8481c', eyes: '#2a6aa8', armR: 'up', legs: '#5a3c20' });
    helm(p, b, '#9a9aa8');
    furCollar(p, b, '#8a6a40');
    // Mjolnir en alto con rayos que crepitan
    p(28, 10 + b, 2, 8, '#6a4a20'); p(24, 4 + b, 10, 7, '#7a7a88'); p(25, 5 + b, 8, 1, '#a8a8b8');
    const f = Math.floor(t * 8) % 3;
    if (f === 0) { p(23, 2 + b, 1, 3, '#fff07a'); p(22, 0 + b, 2, 2, '#fff07a'); }
    if (f === 1) { p(34, 2 + b, 1, 4, '#fff07a'); p(35, 0 + b, 2, 2, '#fff07a'); }
    return c;
  },
  Loki(t) {
    const c = canvas(), p = painter(c);
    const b = figure(p, t, { robe: '#2c6c3c', robeShade: '#1c4c2c', belt: '#d8a030', hair: '#101018', eyes: '#7cf07c', skin: '#e0c0a0' });
    // Casco de cuernos largos y curvos
    p(13, 7 + b, 14, 3, '#2c4c2c'); p(11, 2 + b, 2, 7, '#c8c040'); p(9, 0 + b, 3, 3, '#c8c040'); p(27, 2 + b, 2, 7, '#c8c040'); p(28, 0 + b, 3, 3, '#c8c040');
    p(17, 18 + b, 6, 1, '#5a2c2c'); p(22, 17 + b, 1, 1, '#5a2c2c'); // sonrisa torcida
    // Llama verde en la mano y serpiente enroscada en el brazo
    const f = Math.floor(t * 8) % 2;
    p(3, 26 + b - f, 6, 6, '#3cc85c'); p(4, 23 + b - f, 4, 4, '#a0ff90'); p(5, 21 + b - f, 2, 3, '#e8ffd8');
    p(27, 28 + b, 4, 2, '#5c8c3c'); p(28, 31 + b, 3, 2, '#5c8c3c'); p(30, 27 + b, 1, 1, '#ff3030');
    return c;
  },
  Frigg(t) {
    const c = canvas(), p = painter(c);
    const b = figure(p, t, { robe: '#e8eef8', robeShade: '#c8d4f0', dress: true, belt: '#d8a030', hair: '#c8a060', longHair: true, eyes: '#2a6aa8' });
    p(13, 7 + b, 14, 2, '#d8a030'); p(19, 5 + b, 2, 3, '#8cb4ff');
    // Rueca con nubes de lana que gira
    p(30, 10 + b, 2, 30, '#8a6a40'); const r = Math.floor(t * 3) % 2;
    p(27 + r, 6 + b, 8, 6, '#ffffff'); p(28 - r, 4 + b, 6, 3, '#e8eef8');
    // Llaves en el cinturón
    p(15, 34 + b, 2, 4, '#d8a030'); p(19, 34 + b, 2, 5, '#d8a030');
    return c;
  },
  Freyja(t) {
    const c = canvas(), p = painter(c);
    // Capa de plumas de halcón detrás
    p(7, 18, 26, 26, '#8a6a40'); for (let i = 0; i < 5; i++) p(7 + i * 5, 40, 4, 4, '#6a4a20');
    const b = figure(p, t, { robe: '#e8a8b8', robeShade: '#c8889c', dress: true, belt: '#d8a030', hair: '#ffd84a', longHair: true, eyes: '#2a8a6a' });
    // Collar Brisingamen que destella
    p(15, 23 + b, 10, 2, '#ffd84a'); twinkle(p, t, 20, 24 + b, '#ffffff');
    // Gato a su lado que mueve la cola
    const tl = Math.floor(t * 3) % 2;
    p(30, 38, 7, 6, '#c8c8d0'); p(31, 34, 5, 5, '#c8c8d0'); p(31, 32, 2, 2, '#c8c8d0'); p(34, 32, 2, 2, '#c8c8d0'); p(32, 36, 1, 1, '#5ce070'); p(37, 34 - tl, 2, 5, '#c8c8d0');
    return c;
  },
  Freyr(t) {
    const c = canvas(), p = painter(c);
    const b = figure(p, t, { robe: '#5c9c3c', robeShade: '#3c7c2c', belt: '#d8a030', hair: '#e8c060', beard: '#e8c060', eyes: '#3c7c2c' });
    p(13, 7 + b, 14, 2, '#7cc04c');
    // Espada que lucha sola, flotando
    const fl = Math.round(Math.sin(t * 3) * 2);
    p(32, 6 + fl, 2, 18, '#e8e8f0'); p(30, 22 + fl, 6, 2, '#d8a030'); p(32, 24 + fl, 2, 4, '#8a6a40');
    // Jabalí dorado Gullinbursti
    p(1, 36, 12, 8, '#d8a030'); p(0, 38, 3, 4, '#ffd84a'); p(2, 34, 8, 2, '#ffe27a'); p(1, 39, 1, 1, '#101018'); p(3, 44, 2, 2, '#8a6a20'); p(9, 44, 2, 2, '#8a6a20');
    twinkle(p, t, 6, 33, '#fff8d0');
    return c;
  },
  Tyr(t) {
    const c = canvas(), p = painter(c);
    const cape = Math.round(Math.sin(t * 2.5));
    p(9 + cape, 22, 22, 24, '#7c2020');
    const b = figure(p, t, { robe: '#7a7a88', robeShade: '#5a5a68', belt: '#5a3c20', hair: '#5a3c20', beard: '#5a3c20', eyes: '#5a5a68', armR: 'up' });
    helm(p, b, '#9a9aa8');
    // Mano izquierda perdida (muñón vendado) y espada en alto
    p(10, 33 + b, 3, 2, '#e8e0d0');
    p(28, 0 + b, 2, 16, '#e8e8f0'); p(26, 14 + b, 6, 2, '#d8a030');
    return c;
  },
  Baldr(t) {
    const c = canvas(), p = painter(c);
    // Resplandor blanco que late
    const g = Math.sin(t * 2) > 0 ? '#fff8d088' : '#fff0b066';
    for (let y = 0; y < 44; y++) {
      const half = Math.round(Math.sqrt(Math.max(0, 1 - ((y - 22) / 22) ** 2)) * 15);
      p(20 - half, 2 + y, half * 2, 1, g);
    }
    const b = figure(p, t, { robe: '#ffffff', robeShade: '#e8e8f0', belt: '#ffd84a', hair: '#fff0a0', eyes: '#5cc0f0' });
    p(13, 7 + b, 14, 2, '#ffd84a');
    // Ramita de muérdago a sus pies (lo único que puede dañarle)
    p(30, 40, 1, 6, '#5c8c3c'); p(29, 41, 3, 2, '#7cc04c'); p(31, 39, 1, 1, '#ffffff');
    return c;
  },
  Heimdall(t) {
    const c = canvas(), p = painter(c);
    // Bifrost, el puente del arcoíris, detrás
    const cols = ['#e05858', '#ff9c30', '#ffd84a', '#5cc85c', '#4c8cf0', '#a070f0'];
    cols.forEach((col, i) => p(0, 30 + i * 2, 40, 2, col));
    const b = figure(p, t, { robe: '#e8e8f0', robeShade: '#c8c8d8', belt: '#d8a030', hair: '#f4f4f8', eyes: '#ffd84a', armR: 'up' });
    helm(p, b, '#d8a030', 'wings', '#ffffff');
    p(17, 18 + b, 6, 1, '#ffd84a'); // dientes de oro
    // Gjallarhorn que sopla, con ondas de sonido
    p(27, 6 + b, 4, 10, '#e8d8b0'); p(29, 3 + b, 6, 4, '#e8d8b0'); p(30, 4 + b, 4, 2, '#c8a060');
    const w = Math.floor(t * 4) % 3;
    p(35 + w, 2 + b, 1, 5, '#ffffff'); if (w) p(37 + w, 1 + b, 1, 7, '#e8f4ff');
    return c;
  },
  Hel(t) {
    const c = canvas(), p = painter(c);
    // Mitad viva y mitad muerta
    const b = figure(p, t, { robe: '#1c1c28', robeShade: '#101018', dress: true, belt: '#5a5a68', hair: '#101018', longHair: true, skin: '#e8d8c8', eyes: '#5ca0f0' });
    p(20, 10 + b, 6, 11, '#5a6a6c'); p(22, 14 + b, 2, 2, '#101018'); p(21, 17 + b, 4, 1, '#c8c8c8');
    p(20, 24 + b, 7, 20, '#2a2c34'); for (let i = 0; i < 4; i++) p(21, 26 + b + i * 4, 5, 1, '#c8c8c8');
    // Niebla fría que se arrastra
    const m = Math.round(Math.sin(t * 2) * 2);
    p(0 + m, 42, 14, 4, '#8a9aa8'); p(26 - m, 43, 14, 3, '#8a9aa8');
    return c;
  },
  Njord(t) {
    const c = canvas(), p = painter(c);
    const b = figure(p, t, { robe: '#3c6c8c', robeShade: '#2c4c6c', belt: '#c8a060', hair: '#8a7a6a', beard: '#8a7a6a', eyes: '#2c6c8c' });
    // Remo y espuma de mar a los pies
    p(30, 6 + b, 2, 32, '#8a6a40'); p(29, 34 + b, 4, 8, '#a87c4c');
    const w = Math.round(Math.sin(t * 3) * 2);
    p(0 + w, 43, 40, 5, '#2c8cd8'); p(4 + w, 41, 6, 2, '#ffffff'); p(20 + w, 41, 8, 2, '#ffffff');
    // Gaviota que planea
    const gy = 4 + Math.round(Math.sin(t * 2));
    p(3, gy, 3, 1, '#ffffff'); p(6, gy + 1, 2, 1, '#ffffff'); p(8, gy, 3, 1, '#ffffff');
    return c;
  },
  Idun(t) {
    const c = canvas(), p = painter(c);
    const b = figure(p, t, { robe: '#7cb04c', robeShade: '#5c903c', dress: true, belt: '#d8a030', hair: '#c8803c', longHair: true, eyes: '#3c7c2c' });
    p(13, 7 + b, 14, 2, '#f070a0');
    // Cesta de manzanas doradas de la juventud que brillan
    p(26, 28 + b, 10, 6, '#8a6a40'); p(27, 25 + b, 3, 3, '#ffd84a'); p(30, 24 + b, 3, 3, '#ffe27a'); p(33, 25 + b, 3, 3, '#ffd84a');
    twinkle(p, t, 31, 23 + b, '#ffffff');
    return c;
  },
  Bragi(t) {
    const c = canvas(), p = painter(c);
    const b = figure(p, t, { robe: '#8c4c2c', robeShade: '#6c3c1c', belt: '#d8a030', hair: '#c8c8d0', beard: '#d8d8e0', eyes: '#5a3c20' });
    p(16, 25 + b, 8, 12, '#d8d8e0');
    // Arpa con cuerdas que vibran y runas en el aire
    p(26, 14 + b, 2, 22, '#d8a030'); p(26, 14 + b, 10, 2, '#d8a030'); p(34, 14 + b, 2, 14, '#d8a030');
    for (let i = 0; i < 3; i++) p(28 + i * 2, 16 + b, 1, 18 - i * 4, Math.floor(t * 6) % 3 === i ? '#ffffff' : '#c8c8d0');
    const r = (t * 8) % 12;
    p(4, 14 - r, 1, 4, '#ffd84a'); p(5, 15 - r, 1, 1, '#ffd84a'); p(6, 14 - r, 1, 2, '#ffd84a');
    return c;
  },
  Vidar(t) {
    const c = canvas(), p = painter(c);
    const b = figure(p, t, { robe: '#3c4c3c', robeShade: '#2c3c2c', belt: '#5a3c20', hair: '#3a2c20', beard: '#3a2c20', eyes: '#5a6a5a', legs: '#3c4c3c' });
    helm(p, b, '#5a5a68');
    p(17, 18 + b, 6, 1, '#3a2c20'); // el dios silencioso
    // Zapato gigante (con el que pisará a Fenrir) y espada
    p(19, 42, 12, 5, '#5a3c20'); p(20, 41, 10, 1, '#8a6a40');
    p(30, 18 + b, 2, 16, '#c8c8d8'); p(28, 32 + b, 6, 2, '#5a3c20');
    return c;
  },
  Vali(t) {
    const c = canvas(), p = painter(c);
    const b = figure(p, t, { robe: '#5c6c9c', robeShade: '#3c4c7c', belt: '#c8a060', hair: '#c8803c', eyes: '#2a6aa8', legs: '#5c6c9c' });
    // Arco de cazador y flecha en tensión
    const pull = Math.round(Math.sin(t * 2.5) + 1);
    p(4, 16 + b, 2, 22, '#8a5a30'); p(7 - pull, 17 + b, 1, 20, '#e8e8f0'); p(2, 26 + b, 12, 1, '#c8a060'); p(1, 25 + b, 2, 3, '#c8c8e0');
    furCollar(p, b, '#a88050');
    return c;
  },
  Ull(t) {
    const c = canvas(), p = painter(c);
    const b = figure(p, t, { robe: '#e8eef8', robeShade: '#c8d4e0', belt: '#8a6a40', hair: '#e8d8b0', beard: '#e8d8b0', eyes: '#2a6aa8', legs: '#8a6a40' });
    furCollar(p, b, '#f4f4f8');
    // Esquís y arco; copos que caen
    p(4, 45, 18, 2, '#8a6a40'); p(20, 45, 18, 2, '#8a6a40'); p(3, 44, 2, 1, '#8a6a40');
    p(30, 14 + b, 2, 22, '#8a5a30'); p(29, 13 + b, 2, 2, '#8a5a30');
    const f = (t * 12) % 40;
    p(6, f, 1, 1, '#ffffff'); p(34, (f + 20) % 40, 1, 1, '#ffffff'); p(14, (f + 10) % 40, 1, 1, '#ffffff');
    return c;
  },
  Skadi(t) {
    const c = canvas(), p = painter(c);
    const b = figure(p, t, { robe: '#f4f4f8', robeShade: '#d8e0e8', belt: '#5a7a9c', hair: '#2a3c5c', longHair: true, eyes: '#5ca0f0', legs: '#c8d4e0' });
    furCollar(p, b, '#ffffff');
    // Esquís, arco y lobo blanco
    p(6, 45, 28, 2, '#5a7a9c');
    p(4, 16 + b, 2, 22, '#5a7a9c'); p(5, 15 + b, 2, 2, '#5a7a9c');
    p(28, 38, 10, 6, '#e8eef8'); p(34, 34, 5, 5, '#e8eef8'); p(35, 33, 1, 2, '#e8eef8'); p(37, 33, 1, 2, '#e8eef8'); p(36, 36, 1, 1, '#5ca0f0');
    twinkle(p, t, 10, 6, '#e8f4ff');
    return c;
  },
  Sif(t) {
    const c = canvas(), p = painter(c);
    const b = figure(p, t, { robe: '#d8a060', robeShade: '#b88040', dress: true, belt: '#8a5a30', hair: '#ffd84a', longHair: true, eyes: '#2a6aa8' });
    // Pelo de oro (forjado por los enanos) que brilla
    p(11, 10 + b, 3, 26, '#ffd84a'); p(26, 10 + b, 3, 26, '#ffd84a');
    const sh = Math.floor(t * 3) % 4;
    p(12, 12 + b + sh * 5, 1, 2, '#ffffff'); p(27, 30 + b - sh * 5, 1, 2, '#ffffff');
    // Gavilla de trigo
    for (let i = 0; i < 3; i++) p(31 + i, 18 + b, 1, 14, '#c8a040'); p(30, 26 + b, 5, 2, '#8a6a40');
    return c;
  },
  Forseti(t) {
    const c = canvas(), p = painter(c);
    const b = figure(p, t, { robe: '#e8e0c8', robeShade: '#c8c0a8', belt: '#d8a030', hair: '#c8a060', beard: '#c8a060', eyes: '#5a3c20', armR: 'up' });
    p(13, 7 + b, 14, 2, '#d8a030');
    // Hacha de oro de la justicia y balanza que oscila
    p(28, 4 + b, 2, 20, '#8a6a40'); p(30, 4 + b, 6, 8, '#ffd84a'); p(31, 5 + b, 4, 1, '#fff0a0');
    const tilt = Math.round(Math.sin(t * 2));
    p(4, 24 + b, 10, 1, '#d8a030'); p(8, 22 + b, 2, 12, '#d8a030'); p(3, 26 + b + tilt, 4, 2, '#d8a030'); p(11, 26 + b - tilt, 4, 2, '#d8a030');
    return c;
  },
  Hod(t) {
    const c = canvas(), p = painter(c);
    const b = figure(p, t, { robe: '#4c4c5c', robeShade: '#34344a', belt: '#5a3c20', hair: '#3a2c20', beard: '#3a2c20', eyes: '#c8c8c8' });
    // Venda en los ojos (el dios ciego)
    p(14, 13 + b, 12, 3, '#e8e0d0'); p(26, 14 + b, 3, 2, '#e8e0d0');
    // Flecha de muérdago que lleva en la mano
    p(28, 18 + b, 1, 18, '#7cc04c'); p(27, 17 + b, 3, 2, '#5c8c3c'); p(28, 35 + b, 1, 2, '#ffffff');
    // Bastón de ciego que tantea
    const sw = Math.round(Math.sin(t * 2));
    p(5 + sw, 24 + b, 2, 22, '#8a6a40');
    return c;
  },
  Aegir(t) {
    const c = canvas(), p = painter(c);
    const b = figure(p, t, { robe: '#2c6c7c', robeShade: '#1c4c5c', belt: '#c8a060', hair: '#d8e8e8', beard: '#e8f4f4', eyes: '#2c8c8c', skin: '#c8a888' });
    // Caldero donde elabora la cerveza de los dioses, con espuma que sube
    p(2, 32, 14, 12, '#3a3a48'); p(1, 31, 16, 2, '#5a5a68'); p(3, 44, 3, 2, '#3a3a48'); p(12, 44, 3, 2, '#3a3a48');
    const f = Math.floor(t * 3) % 3;
    p(3, 28 - f, 12, 3 + f, '#f4f0e0'); p(5, 26 - f, 4, 2, '#ffffff');
    p(28, 30 + b, 4, 6, '#d8a030'); // cuerno de cerveza
    return c;
  },
  Ran(t) {
    const c = canvas(), p = painter(c);
    const b = figure(p, t, { robe: '#1c5c6c', robeShade: '#103c4c', dress: true, belt: '#5ca0a0', hair: '#5c8c8c', longHair: true, eyes: '#5ce0f0', skin: '#b8c8c8' });
    // Red de pescar llena de oro de los ahogados
    const sw = Math.round(Math.sin(t * 2));
    for (let i = 0; i < 4; i++) { p(26 + sw, 22 + b + i * 4, 12, 1, '#c8c8a0'); p(26 + i * 4 + sw, 22 + b, 1, 13, '#c8c8a0'); }
    p(29 + sw, 30 + b, 2, 2, '#ffd84a'); p(33 + sw, 26 + b, 2, 2, '#ffd84a');
    p(13, 7 + b, 14, 2, '#5ca0a0');
    return c;
  },
  Mimir(t) {
    const c = canvas(), p = painter(c);
    // Solo la cabeza sabia, flotando sobre su pozo
    p(8, 36, 24, 10, '#5a5a68'); p(10, 34, 20, 3, '#7a7a88'); p(11, 37, 18, 3, '#2c6cb8');
    const fl = Math.round(Math.sin(t * 2) * 1.5);
    p(12, 10 + fl, 16, 16, '#d8b090'); p(10, 8 + fl, 20, 5, '#c8c8d0'); p(12, 20 + fl, 16, 10, '#d8d8e0'); p(15, 28 + fl, 10, 4, '#c8c8d0');
    p(15, 15 + fl, 3, 2, '#2c6cb8'); p(22, 15 + fl, 3, 2, '#2c6cb8');
    // Runas de sabiduría que flotan
    twinkle(p, t, 6, 12, '#ffd84a'); twinkle(p, t + 0.5, 33, 16, '#ffd84a');
    return c;
  },
  Sol(t) {
    const c = canvas(), p = painter(c);
    const b = figure(p, t, { robe: '#ffb030', robeShade: '#d88c20', dress: true, belt: '#fff0a0', hair: '#ffd84a', longHair: true, eyes: '#c86010', armL: 'up', armR: 'up' });
    // Sostiene el sol en lo alto
    const g = Math.sin(t * 3) > 0 ? '#fff8d0' : '#ffe27a';
    for (let y = 0; y < 10; y++) { const half = Math.round(Math.sqrt(Math.max(0, 25 - (y - 5) ** 2)) * 1.1); p(20 - half, y, half * 2, 1, y > 2 && y < 8 ? g : '#ffd84a'); }
    p(19, 0, 2, 1, '#ffffff');
    return c;
  },
  Mani(t) {
    const c = canvas(), p = painter(c);
    const b = figure(p, t, { robe: '#3c4c8c', robeShade: '#2c3c6c', belt: '#c8d4f0', hair: '#c8d4f0', eyes: '#8cb4ff', armR: 'up' });
    // Luna creciente en la mano, que brilla
    p(27, 2 + b, 7, 12, '#f4f4f8');
    c.getContext('2d').clearRect(30, 3 + b, 5, 9);
    twinkle(p, t, 34, 4 + b, '#e8f0ff');
    for (const [x, y] of [[4, 8], [8, 20], [5, 34]]) p(x, y, 1, 1, '#ffffff');
    return c;
  },
  Nott(t) {
    const c = canvas(), p = painter(c);
    // Su caballo Hrimfaxi (crines de escarcha) detrás
    p(2, 26, 14, 12, '#1c1c2c'); p(0, 20, 6, 10, '#1c1c2c'); p(0, 18, 4, 3, '#c8e8ff'); p(4, 38, 2, 8, '#1c1c2c'); p(12, 38, 2, 8, '#1c1c2c');
    const b = figure(p, t, { robe: '#1c1438', robeShade: '#100c24', dress: true, belt: '#8a7ab8', hair: '#0c0818', longHair: true, skin: '#c8a888', eyes: '#b494f0' });
    for (const [x, y] of [[30, 6], [34, 14], [28, 22]]) twinkle(p, t + x, x, y, '#ffffff');
    return c;
  },
  Dagr(t) {
    const c = canvas(), p = painter(c);
    // Su caballo Skinfaxi (crines de luz) detrás
    p(24, 26, 14, 12, '#f4f0e8'); p(34, 20, 6, 10, '#f4f0e8'); p(36, 18, 4, 3, '#ffd84a'); p(26, 38, 2, 8, '#f4f0e8'); p(34, 38, 2, 8, '#f4f0e8');
    const g = Math.floor(t * 3) % 2;
    p(36, 16 - g, 4, 2, '#ffe27a');
    const b = figure(p, t, { robe: '#ffd870', robeShade: '#e8b850', belt: '#ffffff', hair: '#fff0a0', eyes: '#5cc0f0' });
    p(13, 7 + b, 14, 2, '#ffffff');
    return c;
  },
  Eir(t) {
    const c = canvas(), p = painter(c);
    const b = figure(p, t, { robe: '#f4f4f8', robeShade: '#d8dce8', dress: true, belt: '#5cc87c', hair: '#c8803c', longHair: true, eyes: '#3c9c5c' });
    // Manos que brillan con luz sanadora verde
    const g = Math.sin(t * 3) > 0 ? '#a0ffb0' : '#5cc87c';
    p(8, 32 + b, 5, 5, g); p(27, 32 + b, 5, 5, g);
    twinkle(p, t, 10, 30 + b, '#e8ffe8'); twinkle(p, t + 0.5, 29, 30 + b, '#e8ffe8');
    // Hierbas medicinales en el pelo
    p(13, 7 + b, 3, 2, '#5c9c3c'); p(24, 7 + b, 3, 2, '#5c9c3c');
    return c;
  },
  Sigyn(t) {
    const c = canvas(), p = painter(c);
    const b = figure(p, t, { robe: '#6c5c8c', robeShade: '#4c3c6c', dress: true, belt: '#c8a060', hair: '#8a5a30', longHair: true, eyes: '#5a3c20', armL: 'up', armR: 'up' });
    // Cuenco en alto que recoge el veneno que gotea
    p(12, 4 + b, 16, 4, '#c8c8d8'); p(14, 8 + b, 12, 1, '#a8a8b8');
    const d = Math.floor(t * 4) % 4;
    p(20, d + b - 2, 1, 2, '#7cf07c');
    return c;
  },
  Jord(t) {
    const c = canvas(), p = painter(c);
    // Montañas detrás: ella es la Tierra
    for (const [x, h] of [[0, 16], [10, 22], [26, 18]]) for (let y = 0; y < h; y++) p(x + y / 2, 46 - h + y, Math.max(2, h - y), 1, '#5a6a4a');
    p(10, 24, 4, 2, '#ffffff'); p(26, 28, 3, 2, '#ffffff');
    const b = figure(p, t, { robe: '#6a5a3c', robeShade: '#4a3c28', dress: true, belt: '#5c9c3c', hair: '#3a2c20', longHair: true, skin: '#b88060', eyes: '#5c9c3c' });
    p(13, 7 + b, 14, 2, '#5c9c3c');
    const g = Math.floor(t * 2) % 2;
    p(16, 40 - g, 2, 2 + g, '#8ce070'); p(23, 41 - g, 2, 2 + g, '#8ce070');
    return c;
  },
  Magni(t) {
    const c = canvas(), p = painter(c);
    const b = figure(p, t, { robe: '#a84030', robeShade: '#7c2c20', belt: '#d8a030', hair: '#d86c2c', eyes: '#2a6aa8', armL: 'up', armR: 'up', skin: '#e0a880' });
    p(14, 26 + b, 12, 6, '#c88870'); // brazos y pecho fuertes
    // Levanta el martillo de su padre sobre la cabeza
    p(10, 2 + b, 20, 6, '#7a7a88'); p(11, 3 + b, 18, 1, '#a8a8b8'); p(19, 8 + b, 2, 4, '#6a4a20');
    const f = Math.floor(t * 6) % 2;
    if (f) { p(8, 0 + b, 1, 3, '#fff07a'); p(31, 1 + b, 1, 3, '#fff07a'); }
    return c;
  },
  Modi(t) {
    const c = canvas(), p = painter(c);
    const b = figure(p, t, { robe: '#5a2c2c', robeShade: '#3c1c1c', belt: '#5a5a68', hair: '#7c2c1c', beard: '#7c2c1c', eyes: '#ff3030', armR: 'up' });
    helm(p, b, '#5a5a68', 'horns', '#e8e0d0');
    // Hacha de guerra y furia (vapor rojo)
    p(28, 2 + b, 2, 26, '#6a4a20'); p(30, 2 + b, 6, 9, '#a8a8b8'); p(31, 3 + b, 5, 1, '#e8e8f0');
    const f = Math.floor(t * 4) % 3;
    p(8, 6 - f, 2, 2, '#e05858'); p(31, 14 - f, 2, 2, '#e05858');
    return c;
  },
  Gefjon(t) {
    const c = canvas(), p = painter(c);
    const b = figure(p, t, { robe: '#c89060', robeShade: '#a87040', dress: true, belt: '#5a3c20', hair: '#e8c060', longHair: true, eyes: '#5a3c20' });
    p(13, 7 + b, 14, 2, '#d8a030');
    // Arado con el que separó la tierra, y surco de tierra que se abre
    p(26, 30 + b, 2, 14, '#8a6a40'); p(26, 42, 12, 2, '#8a6a40'); p(35, 40, 4, 4, '#7a7a88');
    const g = Math.floor(t * 2) % 3;
    p(0, 45, 10 + g * 4, 2, '#6a4a20');
    // Cuernos de buey (sus cuatro hijos convertidos en bueyes)
    p(4, 20 + b, 4, 3, '#e8d8b0'); p(3, 18 + b, 2, 3, '#e8d8b0');
    return c;
  }
,
  // ---------- Dioses egipcios ----------
  Ra(t) {
    const c = canvas(), p = painter(c);
    const b = figure(p, t, { robe: '#f4f0e8', robeShade: '#d8d0c0', belt: '#d8a030', skin: EG_SKIN, legs: EG_SKIN, shoe: '#c8a060', armR: 'up' });
    usekh(p, b); animalHead(p, b, 'falcon', '#6a4a2c'); sunDisk(p, t, b, 0);
    p(16, 2 + b, 1, 1, '#ffffff');
    // Rayos del sol que salen del disco
    const r = Math.floor(t * 3) % 2;
    p(11, 2 + b + r, 3, 1, '#ffd84a'); p(26, 2 + b + r, 3, 1, '#ffd84a'); p(19, -1 + b, 2, 1, '#ffd84a');
    was(p, 28, 8 + b, 32); ankh(p, 6, 26 + b);
    return c;
  },
  Osiris(t) {
    const c = canvas(), p = painter(c);
    const b = figure(p, t, { robe: '#f4f0e8', robeShade: '#d8d0c0', dress: true, belt: '#d8a030', skin: '#4c9c5c', eyes: '#101018' });
    usekh(p, b);
    // Corona atef (blanca con plumas) y barba postiza
    p(16, 0 + b, 8, 9, '#f4f4f8'); p(14, 2 + b, 2, 8, '#c8a040'); p(24, 2 + b, 2, 8, '#c8a040'); p(19, 21 + b, 2, 4, '#3a2c20');
    // Cayado y mayal cruzados sobre el pecho
    p(14, 26 + b, 2, 12, '#2a5ab8'); p(13, 25 + b, 4, 2, '#d8a030'); p(24, 26 + b, 2, 12, '#d8a030'); p(25, 25 + b, 3, 1, '#2a5ab8'); p(26, 26 + b, 1, 3, '#2a5ab8');
    const g = Math.sin(t * 2) > 0; if (g) p(18, 12 + b, 4, 1, '#7cf07c');
    return c;
  },
  Isis(t) {
    const c = canvas(), p = painter(c);
    const flap = Math.floor(t * 3) % 2;
    // Alas extendidas de colores
    for (const side of [-1, 1]) for (let i = 0; i < 4; i++) {
      const x = side < 0 ? 1 + i : 27; p(x, 22 + i * 3 - flap, 12 - i, 3, ['#2a5ab8', '#c84848', '#5c9c3c', '#d8a030'][i]);
    }
    const b = figure(p, t, { robe: '#f4f0e8', robeShade: '#d8d0c0', dress: true, belt: '#c84848', hair: '#101018', longHair: true, skin: EG_SKIN, eyes: '#101018' });
    usekh(p, b);
    // Trono sobre la cabeza (su jeroglífico)
    p(16, 1 + b, 8, 3, '#d8a030'); p(16, 4 + b, 3, 4, '#d8a030'); p(21, 4 + b, 3, 4, '#d8a030');
    return c;
  },
  Horus(t) {
    const c = canvas(), p = painter(c);
    const b = figure(p, t, { robe: '#f4f0e8', robeShade: '#d8d0c0', belt: '#d8a030', skin: EG_SKIN, legs: EG_SKIN, shoe: '#c8a060', armR: 'up' });
    usekh(p, b); animalHead(p, b, 'falcon', '#8a5a30');
    // Corona doble del Alto y Bajo Egipto
    p(16, 1 + b, 8, 8, '#f4f4f8'); p(14, 4 + b, 12, 5, '#c84848'); p(23, 0 + b, 2, 5, '#c84848');
    // Ojo de Horus que brilla en el pecho y lanza
    const g = Math.sin(t * 3) > 0;
    p(17, 28 + b, 6, 2, g ? '#5cc0f0' : '#2a5ab8'); p(19, 30 + b, 1, 3, '#101018');
    p(28, 2 + b, 2, 36, '#8a6a40'); p(27, 0 + b, 4, 3, '#c8c8d8');
    return c;
  },
  Set(t) {
    const c = canvas(), p = painter(c);
    // Tormenta de arena a su alrededor
    const w = (t * 20) % 40;
    for (const [y, o] of [[30, 0], [36, 12], [42, 24]]) p((w + o) % 40, y, 6, 1, '#c8a060');
    const b = figure(p, t, { robe: '#8a3a2c', robeShade: '#d8d0c0', belt: '#d8a030', skin: EG_SKIN, legs: EG_SKIN, shoe: '#c8a060', armR: 'up' });
    usekh(p, b); animalHead(p, b, 'set', '#8a3a2c');
    was(p, 28, 4 + b, 36, '#5a3c20');
    return c;
  },
  Thoth(t) {
    const c = canvas(), p = painter(c);
    const b = figure(p, t, { robe: '#f4f0e8', robeShade: '#d8d0c0', belt: '#d8a030', skin: EG_SKIN, legs: EG_SKIN, shoe: '#c8a060' });
    usekh(p, b); animalHead(p, b, 'ibis');
    p(15, 3 + b, 10, 5, '#f4f4f8'); p(16, 4 + b, 8, 3, '#c8c8d8'); // disco lunar
    // Escribe en un papiro: pluma de cálamo que se mueve
    p(2, 28 + b, 10, 8, '#e8d8a0'); p(3, 30 + b, 6, 1, '#5a3c20'); p(3, 32 + b, 5, 1, '#5a3c20');
    const w = Math.floor(t * 4) % 3;
    p(8 + w, 26 + b, 1, 6, '#8a6a40');
    return c;
  },
  Maat(t) {
    const c = canvas(), p = painter(c);
    const flap = Math.floor(t * 3) % 2;
    for (const side of [-1, 1]) for (let i = 0; i < 3; i++) p(side < 0 ? 2 + i : 26, 24 + i * 3 - flap, 12 - i, 3, i % 2 ? '#2a5ab8' : '#5c9c3c');
    const b = figure(p, t, { robe: '#f4f0e8', robeShade: '#d8d0c0', dress: true, belt: '#2a5ab8', hair: '#101018', longHair: true, skin: EG_SKIN, eyes: '#101018' });
    usekh(p, b);
    // La pluma de la verdad en la cabeza, que se mece
    const sw = Math.round(Math.sin(t * 2));
    p(19 + sw, 0 + b, 2, 9, '#f4f4f8'); p(20 + sw, 0 + b, 1, 9, '#c8c8d8');
    p(13, 8 + b, 14, 2, '#c84848');
    return c;
  },
  Ptah(t) {
    const c = canvas(), p = painter(c);
    const b = figure(p, t, { robe: '#4c9c7c', robeShade: '#3c7c5c', dress: true, belt: '#d8a030', skin: '#5cac8c', eyes: '#101018' });
    // Casquete azul y barba recta
    p(13, 6 + b, 14, 6, '#2a5ab8'); p(19, 21 + b, 2, 5, '#3a2c20');
    usekh(p, b);
    // Cetro que combina uas, anj y djed
    p(19, 34 + b, 2, 10, '#d8a030'); ankh(p, 17, 26 + b);
    for (let i = 0; i < 3; i++) p(17, 38 + b + i * 2, 6, 1, '#2a5ab8');
    return c;
  },
  Sekhmet(t) {
    const c = canvas(), p = painter(c);
    const b = figure(p, t, { robe: '#c84838', robeShade: '#a83828', dress: true, belt: '#d8a030', skin: EG_SKIN, eyes: '#ffd84a' });
    usekh(p, b); animalHead(p, b, 'lion', '#c8803c'); sunDisk(p, t, b, 0);
    // Aliento de fuego
    const f = Math.floor(t * 6) % 2;
    if (f) { p(24, 19 + b, 4, 2, '#ff7a20'); p(28, 18 + b, 3, 3, '#ffd84a'); }
    ankh(p, 4, 26 + b);
    return c;
  },
  Bastet(t) {
    const c = canvas(), p = painter(c);
    const b = figure(p, t, { robe: '#5c9c8c', robeShade: '#3c7c6c', dress: true, belt: '#d8a030', skin: EG_SKIN, eyes: '#101018' });
    usekh(p, b); animalHead(p, b, 'cat', '#1c1c24');
    // Sistro que agita y gatito a sus pies
    const sh = Math.floor(t * 6) % 2;
    p(28, 18 + b, 2, 12, '#d8a030'); p(26, 12 + b + sh, 6, 7, '#d8a030'); p(27, 13 + b + sh, 4, 5, '#5c9c8c'); p(27, 15 + b + sh, 4, 1, '#ffffff');
    p(2, 40, 7, 6, '#1c1c24'); p(3, 38, 2, 2, '#1c1c24'); p(6, 38, 2, 2, '#1c1c24'); p(4, 41, 1, 1, '#5ce070');
    return c;
  },
  Hathor(t) {
    const c = canvas(), p = painter(c);
    const b = figure(p, t, { robe: '#c84848', robeShade: '#a83838', dress: true, belt: '#d8a030', hair: '#101018', longHair: true, skin: EG_SKIN, eyes: '#101018' });
    usekh(p, b);
    // Cuernos de vaca con el disco solar entre ellos
    p(11, 0 + b, 3, 8, '#e8d8b0'); p(26, 0 + b, 3, 8, '#e8d8b0'); p(12, 7 + b, 2, 2, '#e8d8b0'); p(26, 7 + b, 2, 2, '#e8d8b0');
    sunDisk(p, t, b, 0);
    // Espejo de cobre
    p(4, 24 + b, 6, 6, '#e8a050'); p(5, 25 + b, 4, 4, '#ffd8a0'); p(6, 30 + b, 2, 6, '#d8a030');
    return c;
  },
  Amun(t) {
    const c = canvas(), p = painter(c);
    const b = figure(p, t, { robe: '#f4f0e8', robeShade: '#d8d0c0', belt: '#d8a030', skin: '#3c6cb8', eyes: '#101018', legs: '#3c6cb8', shoe: '#c8a060', armR: 'up' });
    usekh(p, b);
    // Corona de dos plumas altas que se mecen
    const sw = Math.round(Math.sin(t * 2));
    p(14, 6 + b, 12, 4, '#d8a030'); p(16 + sw, -2 + b, 3, 9, '#c84848'); p(21 + sw, -2 + b, 3, 9, '#2a5ab8');
    p(19, 21 + b, 2, 4, '#3a2c20');
    was(p, 28, 6 + b, 34); ankh(p, 5, 26 + b);
    return c;
  },
  Aten(t) {
    const c = canvas(), p = painter(c);
    // El disco solar con rayos que acaban en manos
    for (let y = 0; y < 20; y++) { const half = Math.round(Math.sqrt(Math.max(0, 100 - (y - 10) ** 2))); p(20 - half, 2 + y, half * 2, 1, '#ffb030'); }
    p(16, 6, 8, 6, '#ffd870');
    const r = Math.floor(t * 3) % 2;
    for (let i = 0; i < 7; i++) {
      const x = 6 + i * 4, len = 14 + ((i + r) % 2) * 4;
      p(x, 22, 1, len, '#ffd84a'); p(x - 1, 22 + len, 3, 2, '#ffd84a');
    }
    p(19, 22, 2, 3, '#5c9c3c'); // ureo
    return c;
  },
  Nephthys(t) {
    const c = canvas(), p = painter(c);
    const flap = Math.floor(t * 3) % 2;
    for (const side of [-1, 1]) for (let i = 0; i < 4; i++) p(side < 0 ? 1 + i : 27, 22 + i * 3 - flap, 12 - i, 3, i % 2 ? '#3c2c5c' : '#5c4c8c');
    const b = figure(p, t, { robe: '#3c2c5c', robeShade: '#2c1c4c', dress: true, belt: '#d8a030', hair: '#101018', longHair: true, skin: EG_SKIN, eyes: '#101018' });
    usekh(p, b);
    // Jeroglífico de la casa con el cesto sobre la cabeza
    p(15, 0 + b, 10, 3, '#d8a030'); p(15, 3 + b, 2, 5, '#d8a030'); p(23, 3 + b, 2, 5, '#d8a030'); p(15, 7 + b, 10, 1, '#d8a030');
    return c;
  },
  Sobek(t) {
    const c = canvas(), p = painter(c);
    const b = figure(p, t, { robe: '#2c6c5c', robeShade: '#d8d0c0', belt: '#d8a030', skin: EG_SKIN, legs: EG_SKIN, shoe: '#c8a060', armR: 'up' });
    usekh(p, b); animalHead(p, b, 'croc', '#3c7c3c');
    // Plumas y disco, y agua del Nilo a los pies
    p(15, 1 + b, 3, 7, '#2a5ab8'); p(19, 0 + b, 3, 8, '#c84848'); sunDisk(p, t, b, 2);
    was(p, 28, 6 + b, 34);
    const w = Math.round(Math.sin(t * 3) * 2);
    p(0 + w, 45, 40, 3, '#2c8cd8');
    return c;
  },
  Khnum(t) {
    const c = canvas(), p = painter(c);
    const b = figure(p, t, { robe: '#f4f0e8', robeShade: '#d8d0c0', belt: '#d8a030', skin: EG_SKIN, legs: EG_SKIN, shoe: '#c8a060' });
    usekh(p, b); animalHead(p, b, 'ram', '#c8a880');
    // Torno de alfarero donde modela a los humanos, que gira
    p(2, 40, 14, 3, '#8a6a40'); p(7, 43, 4, 3, '#6a4a20');
    const r = Math.floor(t * 4) % 2;
    p(4, 34, 10, 6, '#c86a3c'); p(6 + r * 4, 35, 2, 4, '#e8905c'); p(7, 32, 4, 3, '#c86a3c');
    return c;
  },
  Khonsu(t) {
    const c = canvas(), p = painter(c);
    const b = figure(p, t, { robe: '#f4f0e8', robeShade: '#d8d0c0', dress: true, belt: '#d8a030', skin: EG_SKIN, eyes: '#101018' });
    usekh(p, b); animalHead(p, b, 'falcon', '#5c5c7c');
    // Luna llena sobre creciente, que brilla
    const g = Math.sin(t * 2) > 0 ? '#ffffff' : '#e8f0ff';
    p(16, 0 + b, 8, 6, g); p(14, 5 + b, 12, 2, '#c8c8d8');
    p(14, 26 + b, 2, 12, '#2a5ab8'); p(24, 26 + b, 2, 12, '#d8a030');
    return c;
  },
  Shu(t) {
    const c = canvas(), p = painter(c);
    const b = figure(p, t, { robe: '#f4f0e8', robeShade: '#d8d0c0', belt: '#d8a030', skin: EG_SKIN, legs: EG_SKIN, shoe: '#c8a060', armL: 'up', armR: 'up' });
    usekh(p, b);
    // Pluma de avestruz en la cabeza y aire que sopla alrededor
    const sw = Math.round(Math.sin(t * 3));
    p(19 + sw, 0 + b, 3, 8, '#f4f4f8'); p(13, 8 + b, 14, 2, '#101018');
    const g = (t * 24) % 30;
    for (const [y, o] of [[6, 0], [14, 10], [28, 20]]) { p((g + o) % 36, y, 4, 1, '#c8e8ff'); }
    return c;
  },
  Tefnut(t) {
    const c = canvas(), p = painter(c);
    const b = figure(p, t, { robe: '#3c8cb8', robeShade: '#2c6c98', dress: true, belt: '#d8a030', skin: EG_SKIN, eyes: '#ffd84a' });
    usekh(p, b); animalHead(p, b, 'lion', '#c89c5c'); sunDisk(p, t, b, 0);
    // Gotas de rocío que caen de su mano
    const d = Math.floor(t * 6) % 6;
    p(6, 30 + d * 2, 1, 2, '#78c0ff'); p(9, 34 + ((d + 3) % 6) * 2, 1, 2, '#78c0ff'); p(4, 28, 6, 3, EG_SKIN);
    return c;
  },
  Geb(t) {
    const c = canvas(), p = painter(c);
    // Tumbado como la tierra, con plantas que brotan de su cuerpo
    const b = Math.round(Math.sin(t * 2) * 0.6);
    p(2, 34 + b, 36, 8, '#5c8c3c'); p(4, 32 + b, 30, 3, '#4c7c2c'); p(30, 28 + b, 8, 8, '#4c8c4c');
    p(32, 30 + b, 2, 2, '#101018'); p(30, 26 + b, 8, 3, '#d8a030');
    const g = Math.floor(t * 2) % 3;
    for (const x of [6, 12, 18, 24]) { p(x, 28 + b - g, 2, 5 + g, '#7cc04c'); p(x - 1, 27 + b - g, 4, 2, '#a0e070'); }
    // Ganso sobre su cabeza (su símbolo)
    p(31, 20 + b, 6, 5, '#f4f4f8'); p(36, 18 + b, 2, 3, '#f4f4f8'); p(38, 19 + b, 2, 1, '#ff9030');
    return c;
  },
  Nut(t) {
    const c = canvas(), p = painter(c);
    // Arqueada como la bóveda del cielo, cubierta de estrellas
    for (let x = 2; x < 38; x++) { const y = Math.round(6 + Math.abs(x - 20) * 1.2); p(x, y - 4, 1, 6, '#1c2c6c'); }
    p(2, 28, 4, 18, '#1c2c6c'); p(34, 28, 4, 18, '#1c2c6c');
    for (const [x, y] of [[10, 10], [18, 4], [26, 8], [32, 18], [6, 22]]) twinkle(p, t + x, x, y, '#ffffff');
    // Cara mirando hacia abajo y sol que viaja por su cuerpo
    p(34, 24, 6, 6, EG_SKIN); p(35, 27, 2, 1, '#101018');
    const s2 = Math.floor(t * 2) % 5;
    p(8 + s2 * 5, 8 + Math.abs(s2 - 2) * 2, 3, 3, '#ff5030');
    return c;
  },
  Bes(t) {
    const c = canvas(), p = painter(c);
    // Enano protector, de frente, con lengua fuera y corona de plumas
    const b = Math.round(Math.sin(t * 2) * 0.6);
    p(12, 30 + b, 16, 12, '#c8885c'); p(13, 42, 5, 4, '#c8885c'); p(22, 42, 5, 4, '#c8885c'); p(12, 34 + b, 16, 4, '#8a5a30');
    p(11, 14 + b, 18, 16, '#c8885c'); p(10, 20 + b, 20, 10, '#8a5a30');
    p(14, 18 + b, 3, 3, '#ffffff'); p(23, 18 + b, 3, 3, '#ffffff'); p(15, 19 + b, 2, 2, '#101018'); p(24, 19 + b, 2, 2, '#101018');
    const tongue = Math.floor(t * 3) % 2;
    p(18, 24 + b, 4, 2 + tongue, '#e05858');
    for (let i = 0; i < 5; i++) p(11 + i * 4, 6 + b - (i % 2) * 2, 3, 9, ['#c84848', '#2a5ab8', '#5c9c3c', '#2a5ab8', '#c84848'][i]);
    p(4, 30 + b, 3, 12, '#d8a030'); p(2, 28 + b, 7, 3, '#d8a030'); // pandero
    return c;
  },
  Taweret(t) {
    const c = canvas(), p = painter(c);
    const b = figure(p, t, { robe: '#7c8c9c', robeShade: '#5c6c7c', dress: true, belt: '#d8a030', skin: '#7c8c9c', eyes: '#101018' });
    p(12, 26 + b, 16, 14, '#8c9cac'); // tripa de hipopótamo
    usekh(p, b); animalHead(p, b, 'hippo', '#7c8c9c');
    // Peluca, plumas y el jeroglífico «sa» de protección
    p(13, 4 + b, 14, 4, '#101018'); p(16, 0 + b, 3, 5, '#c84848'); p(21, 0 + b, 3, 5, '#2a5ab8');
    p(29, 26 + b, 6, 2, '#d8a030'); p(30, 28 + b, 4, 6, '#d8a030');
    const g = Math.sin(t * 2) > 0; if (g) twinkle(p, t, 32, 24 + b, '#ffffff');
    return c;
  },
  Apophis(t) {
    const c = canvas(), p = painter(c);
    // La gran serpiente del caos, enroscada y con ojos rojos
    const w = Math.round(Math.sin(t * 3) * 2);
    p(4, 34, 32, 10, '#3c2c4c'); p(8, 30, 24, 6, '#4c3c5c'); p(6 + w, 24, 10, 8, '#4c3c5c'); p(4 + w, 16, 10, 10, '#5c4c6c');
    p(2 + w, 12, 14, 8, '#5c4c6c'); for (let i = 0; i < 6; i++) p(8 + i * 5, 36, 3, 2, '#8a6aac');
    const g = Math.sin(t * 4) > 0;
    p(5 + w, 14, 2, 2, g ? '#ff3030' : '#a01818'); p(11 + w, 14, 2, 2, g ? '#ff3030' : '#a01818');
    p(0 + w, 18, 4, 1, '#e05858'); p(0 + w, 19, 1, 2, '#e05858');
    return c;
  },
  Atum(t) {
    const c = canvas(), p = painter(c);
    const b = figure(p, t, { robe: '#f4f0e8', robeShade: '#d8d0c0', belt: '#d8a030', skin: EG_SKIN, legs: EG_SKIN, shoe: '#c8a060', armR: 'up' });
    usekh(p, b);
    // Corona doble y barba; el sol poniente detrás
    const sy = 30 + Math.round(Math.sin(t) * 2);
    p(2, sy, 8, 8, '#ff8c30'); p(3, sy + 1, 6, 6, '#ffb060');
    p(16, 1 + b, 8, 8, '#f4f4f8'); p(14, 4 + b, 12, 5, '#c84848'); p(19, 21 + b, 2, 4, '#3a2c20');
    was(p, 28, 6 + b, 34); ankh(p, 30, 22 + b);
    return c;
  },
  Khepri(t) {
    const c = canvas(), p = painter(c);
    const b = figure(p, t, { robe: '#f4f0e8', robeShade: '#d8d0c0', belt: '#d8a030', skin: EG_SKIN, legs: EG_SKIN, shoe: '#c8a060' });
    usekh(p, b); animalHead(p, b, 'scarab');
    // Empuja el sol naciente
    const r = Math.floor(t * 3) % 2;
    p(28, 30 + r, 10, 10, '#ff8c30'); p(30, 32 + r, 6, 6, '#ffd84a'); p(29, 30 + r, 2, 2, '#fff0a0');
    return c;
  },
  Montu(t) {
    const c = canvas(), p = painter(c);
    const b = figure(p, t, { robe: '#c84838', robeShade: '#d8d0c0', belt: '#d8a030', skin: EG_SKIN, legs: EG_SKIN, shoe: '#c8a060', armR: 'up' });
    usekh(p, b); animalHead(p, b, 'falcon', '#5a3c20');
    // Dos plumas, disco solar y lanza de guerra
    p(16, 0 + b, 2, 8, '#2a5ab8'); p(22, 0 + b, 2, 8, '#2a5ab8'); sunDisk(p, t, b, 2);
    p(28, 0 + b, 2, 40, '#8a6a40'); p(27, 0 + b, 4, 4, '#c8c8d8');
    p(3, 26 + b, 9, 12, '#d8a030'); p(5, 28 + b, 5, 8, '#c84848');
    return c;
  },
  Neith(t) {
    const c = canvas(), p = painter(c);
    const b = figure(p, t, { robe: '#5c9c5c', robeShade: '#3c7c3c', dress: true, belt: '#d8a030', hair: '#101018', longHair: true, skin: EG_SKIN, eyes: '#101018' });
    usekh(p, b);
    p(14, 4 + b, 12, 5, '#c84848'); p(23, 0 + b, 2, 5, '#c84848'); // corona roja
    // Arco y flechas cruzadas que se tensan
    const pull = Math.round(Math.sin(t * 2.5) + 1);
    p(30, 14 + b, 2, 24, '#8a5a30'); p(32 - pull, 15 + b, 1, 22, '#e8e8f0');
    p(3, 24 + b, 10, 1, '#c8a060'); p(3, 28 + b, 10, 1, '#c8a060'); p(2, 23 + b, 2, 3, '#c8c8d8'); p(2, 27 + b, 2, 3, '#c8c8d8');
    return c;
  },
  Serket(t) {
    const c = canvas(), p = painter(c);
    const b = figure(p, t, { robe: '#d8b070', robeShade: '#b89050', dress: true, belt: '#5a3c20', hair: '#101018', longHair: true, skin: EG_SKIN, eyes: '#101018' });
    usekh(p, b);
    // Escorpión sobre la cabeza, que mueve la cola
    const tl = Math.floor(t * 3) % 2;
    p(14, 4 + b, 12, 4, '#8a5a20'); p(12, 3 + b, 3, 2, '#8a5a20'); p(25, 3 + b, 3, 2, '#8a5a20');
    p(18, 0 + b, 2, 4, '#8a5a20'); p(19 + tl, -2 + b, 3, 2, '#c84848');
    ankh(p, 30, 24 + b);
    return c;
  },
  Wadjet(t) {
    const c = canvas(), p = painter(c);
    // Cobra erguida con capucha abierta, que se balancea
    const sw = Math.round(Math.sin(t * 2) * 2);
    p(10, 38, 22, 8, '#3c8c3c'); p(14 + sw, 24, 6, 16, '#3c8c3c');
    p(8 + sw, 8, 18, 18, '#3c8c3c'); p(11 + sw, 11, 12, 13, '#e8d070'); for (let i = 0; i < 4; i++) p(13 + sw, 13 + i * 3, 8, 1, '#3c8c3c');
    p(13 + sw, 4, 8, 7, '#4c9c4c'); p(15 + sw, 6, 2, 2, '#ff3030'); p(19 + sw, 6, 2, 2, '#ff3030');
    const tg = Math.floor(t * 5) % 2; if (tg) { p(17 + sw, 11, 1, 3, '#e05858'); p(16 + sw, 13, 3, 1, '#e05858'); }
    p(12 + sw, 2, 10, 3, '#c84848'); // corona roja del Bajo Egipto
    return c;
  },
  Nekhbet(t) {
    const c = canvas(), p = painter(c);
    const flap = Math.floor(t * 3) % 2;
    for (const side of [-1, 1]) for (let i = 0; i < 4; i++) p(side < 0 ? 0 + i : 28, 16 + i * 3 - flap, 12 - i, 3, i % 2 ? '#e8e0d0' : '#3a2c20');
    const b = figure(p, t, { robe: '#f4f0e8', robeShade: '#d8d0c0', dress: true, belt: '#d8a030', skin: EG_SKIN, eyes: '#101018' });
    usekh(p, b); animalHead(p, b, 'vulture');
    p(15, 2 + b, 10, 7, '#f4f4f8'); // corona blanca del Alto Egipto
    p(4, 34, 6, 6, '#d8a030'); p(5, 35, 4, 4, '#2a5ab8'); // anillo shen
    return c;
  },
  Hapi(t) {
    const c = canvas(), p = painter(c);
    const b = figure(p, t, { robe: '#3c8cb8', robeShade: '#2c6c98', belt: '#5c9c3c', skin: '#4c8cc8', eyes: '#101018', legs: '#4c8cc8', shoe: '#2c6c98' });
    p(13, 26 + b, 14, 10, '#5c9cd8'); // vientre abundante
    // Papiros en la cabeza y bandeja de ofrendas; el Nilo que crece
    for (let i = 0; i < 3; i++) p(15 + i * 4, 1 + b, 2, 8, '#5c9c3c'), p(14 + i * 4, 0 + b, 4, 2, '#8ce070');
    p(26, 18 + b, 10, 2, '#d8a030'); p(27, 15 + b, 3, 3, '#ffd84a'); p(31, 15 + b, 3, 3, '#c84848');
    const w = Math.round(Math.sin(t * 2) * 2);
    p(0, 43 - w, 40, 5 + w, '#2c8cd8'); p(6, 42 - w, 6, 1, '#78c0ff'); p(24, 42 - w, 8, 1, '#78c0ff');
    return c;
  }
,
  // ---------- Dioses de otras mitologías ----------
  Cailleach(t) {
    const c = canvas(), p = painter(c);
    const b = figure(p, t, { robe: '#4c5c6c', robeShade: '#34404c', dress: true, belt: '#8a7a6a', hair: '#e8e8f0', longHair: true, skin: '#7c9cbc', eyes: '#e8f4ff' });
    // Bruja del invierno: cara azul, un ojo, bastón que congela y nieve
    p(21, 14 + b, 3, 2, '#7c9cbc');
    p(4, 12 + b, 2, 34, '#5a4a3a'); p(3, 10 + b, 4, 3, '#c8e8ff');
    const f = (t * 12) % 44;
    p(10, f, 1, 1, '#ffffff'); p(32, (f + 22) % 44, 1, 1, '#ffffff'); p(28, (f + 10) % 44, 1, 1, '#ffffff');
    twinkle(p, t, 5, 9, '#ffffff');
    return c;
  },
  Fomorian(t) {
    const c = canvas(), p = painter(c);
    // Gigante del mar de un solo ojo, una pierna gruesa y un brazo con maza
    const b = Math.round(Math.sin(t * 2) * 0.6);
    p(13, 38, 12, 8, '#5c6c4c'); p(12, 20 + b, 18, 20, '#6c7c5c'); p(12, 32 + b, 18, 3, '#3c4c2c');
    p(28, 18 + b, 4, 16, '#6c7c5c'); p(29, 10 + b, 4, 10, '#7a5a3a'); p(27, 6 + b, 8, 6, '#5a4a3a');
    p(13, 6 + b, 16, 14, '#7c8c6c'); p(12, 4 + b, 18, 4, '#3c4c3c');
    const blink = Math.sin(t * 2.5) > 0.92;
    p(17, 10 + b, 8, 5, blink ? '#7c8c6c' : '#f4f4e8'); if (!blink) p(20, 11 + b, 3, 3, '#c83030');
    p(16, 17 + b, 10, 2, '#3c2c2c'); p(17, 17 + b, 2, 2, '#e8e0c8'); p(23, 17 + b, 2, 2, '#e8e0c8');
    p(3, 40, 34, 2, '#2c6c8c'); // espuma del mar
    return c;
  },
  Simargl(t) {
    const c = canvas(), p = painter(c);
    // Perro alado de fuego
    const flap = Math.floor(t * 4) % 2;
    const b = Math.round(Math.sin(t * 2));
    p(6, 22 + b, 24, 10, '#c85a2c'); p(8, 30 + b, 20, 2, '#a84a20'); p(26, 16 + b, 10, 10, '#c85a2c'); p(34, 20 + b, 5, 4, '#a84a20'); p(38, 20 + b, 1, 1, '#101018');
    p(28, 13 + b, 3, 4, '#c85a2c'); p(32, 13 + b, 3, 4, '#c85a2c'); p(31, 18 + b, 2, 2, '#ffd84a');
    for (const x of [8, 13, 22, 27]) { p(x, 32 + b, 3, 10, '#a84a20'); p(x, 42, 4, 2, '#6a2a10'); }
    sideWing(p, 22, 22 + b, '#ff7a20', '#ffd84a', flap, -1, 6);
    const tl = Math.floor(t * 6) % 2;
    p(1, 20 + b - tl, 6, 4, '#ff7a20'); p(0, 18 + b - tl, 3, 3, '#ffd84a');
    return c;
  },
  Nuberu(t) {
    const c = canvas(), p = painter(c);
    // Señor de las tormentas, sobre una nube y con sombrero de ala ancha
    const b = figure(p, t, { robe: '#5a5a6c', robeShade: '#3c3c4c', belt: '#2a2a3a', hair: '#3a2c20', beard: '#c8c8d0', eyes: '#5ca0f0', armR: 'up' });
    p(9, 6 + b, 22, 3, '#2a2a3a'); p(14, 2 + b, 12, 5, '#2a2a3a');
    p(2, 38, 36, 8, '#7c7c8c'); p(6, 34, 12, 6, '#8c8c9c'); p(20, 35, 14, 5, '#8c8c9c');
    const f = Math.floor(t * 6) % 3;
    if (f === 0) { p(30, 6 + b, 2, 4, '#fff07a'); p(28, 9 + b, 2, 4, '#fff07a'); p(30, 12 + b, 2, 4, '#fff07a'); }
    const r = (t * 16) % 10;
    p(8, 42 + r, 1, 2, '#78c0ff'); p(26, 44 + ((r + 5) % 10), 1, 2, '#78c0ff');
    return c;
  },
  Basajaun(t) {
    const c = canvas(), p = painter(c);
    // Señor del bosque, gigante cubierto de pelo con un bastón
    const b = Math.round(Math.sin(t * 2) * 0.6);
    p(10, 12 + b, 20, 30, '#6a4a2c'); for (let i = 0; i < 6; i++) p(10 + i * 4, 40, 3, 6, '#5a3c20');
    p(12, 6 + b, 16, 10, '#7a5a3c'); p(15, 10 + b, 10, 6, '#c89c78'); p(16, 12 + b, 2, 2, '#101018'); p(22, 12 + b, 2, 2, '#101018');
    for (let i = 0; i < 8; i++) p(11 + i * 2, 16 + b + (i % 2) * 2, 2, 3, '#5a3c20');
    p(31, 4 + b, 3, 42, '#5a3c20'); p(30, 3 + b, 5, 3, '#7cac4c');
    const lf = (t * 6) % 30; p(4, lf, 2, 2, '#8ce070');
    return c;
  },
  Laume(t) {
    const c = canvas(), p = painter(c);
    // Hada báltica con el arcoíris como cinturón
    const cols = ['#e05858', '#ff9c30', '#ffd84a', '#5cc85c', '#4c8cf0', '#a070f0'];
    const sh = Math.floor(t * 3) % cols.length;
    cols.forEach((col, k) => {
      const r = 19 - k;
      for (let x = 20 - r; x < 20 + r; x++) p(x, Math.round(22 - Math.sqrt(r * r - (x + 0.5 - 20) ** 2)), 1, 2, cols[(k + sh) % cols.length]);
    });
    const b = figure(p, t, { robe: '#e8eef8', robeShade: '#c8d4e8', dress: true, hair: '#ffd84a', longHair: true, eyes: '#5cc85c' });
    cols.forEach((col, i) => p(13 + i * 2, 32 + b, 2, 2, col));
    p(13, 7 + b, 14, 2, '#7cc04c'); p(15, 6 + b, 2, 1, '#ff9cc0'); p(23, 6 + b, 2, 1, '#ff9cc0');
    return c;
  },
  Hiisi(t) {
    const c = canvas(), p = painter(c);
    // Demonio del bosque: cuerpo de tronco, cuernos de rama y ojos verdes
    const b = Math.round(Math.sin(t * 2) * 0.6);
    p(12, 16 + b, 16, 26, '#4c3c2c'); p(13, 20 + b, 3, 20, '#3c2c1c'); p(10, 40, 6, 6, '#4c3c2c'); p(24, 40, 6, 6, '#4c3c2c');
    p(13, 6 + b, 14, 12, '#5c4c3c'); p(10, 2 + b, 3, 6, '#5c4c3c'); p(8, 0 + b, 3, 3, '#5c4c3c'); p(27, 2 + b, 3, 6, '#5c4c3c'); p(29, 0 + b, 3, 3, '#5c4c3c');
    const g = Math.sin(t * 3) > 0 ? '#7cf07c' : '#3cc85c';
    p(15, 10 + b, 3, 2, g); p(22, 10 + b, 3, 2, g); p(16, 14 + b, 8, 1, '#2c1c10');
    p(6, 18 + b, 6, 3, '#4c3c2c'); p(28, 18 + b, 6, 3, '#4c3c2c'); p(4, 16 + b, 3, 3, '#5c8c3c'); p(33, 16 + b, 3, 3, '#5c8c3c');
    return c;
  },
  Yatagarasu(t) {
    const c = canvas(), p = painter(c);
    // Cuervo de tres patas del sol
    disc(p, 20, 11, 10, '#e8402c'); disc(p, 20, 11, 8, '#ff5a30'); disc(p, 20, 11, 5, '#ff8040');
    const flap = Math.floor(t * 4) % 2;
    const b = Math.round(Math.sin(t * 2));
    sideWing(p, 15, 24 + b, '#101018', '#3a3a58', flap, -1, 5);
    sideWing(p, 25, 24 + b, '#101018', '#3a3a58', flap, 1, 5);
    p(15, 16 + b, 10, 14, '#1c1c28'); p(14, 19 + b, 12, 9, '#1c1c28'); p(17, 30 + b, 6, 4, '#101018');
    p(16, 8 + b, 9, 9, '#1c1c28'); p(25, 11 + b, 5, 2, '#4a4a58'); p(25, 13 + b, 3, 1, '#3a3a48'); p(22, 10 + b, 2, 2, '#ffd84a');
    for (const x of [15, 19, 23]) { p(x, 33 + b, 2, 8, '#3a3a48'); p(x - 1, 41 + b, 4, 2, '#3a3a48'); }
    return c;
  },
  Daidarabotchi(t) {
    const c = canvas(), p = painter(c);
    // Gigante que creó montañas y lagos: alza un monte nevado y deja un lago en su huella
    for (let dy = 0; dy < 9; dy++) p(31 - dy, 1 + dy, dy * 2 + 1, 1, dy < 3 ? '#ffffff' : '#5c7c4c');
    p(26, 8, 10, 2, '#4c6c3c');
    const b = figure(p, t, { robe: '#6c7c5c', robeShade: '#4c5c3c', belt: '#3a2c20', hair: '#2a2a2a', skin: '#a88868', eyes: '#3a2c20', armR: 'up' });
    p(2, 44, 14, 3, '#2c8cd8'); twinkle(p, t, 8, 44, '#e8f4ff');
    const cl = (t * 4) % 40; p(cl, 3, 6, 2, '#e8eef8');
    return c;
  },
  Zhulong(t) {
    const c = canvas(), p = painter(c);
    // Dragón antorcha: cuerpo de serpiente roja y cara humana; abre y cierra los ojos (día/noche)
    for (let i = 0; i < 7; i++) {
      const y = 30 + Math.round(Math.sin(i * 0.9 + t * 3) * 4);
      p(1 + i * 4, y, 7, 9, i % 2 ? '#c83030' : '#a82020'); p(2 + i * 4, y + 7, 5, 2, '#e8a040');
    }
    p(26, 18, 10, 16, '#c83030');
    p(25, 6, 14, 16, '#a82020'); for (let i = 0; i < 4; i++) p(25 + i * 4, 3 + (i % 2), 2, 4, '#a82020');
    p(27, 9, 10, 11, '#e8b890'); p(28, 2, 2, 5, '#ffd84a'); p(34, 2, 2, 5, '#ffd84a');
    const day = Math.sin(t) > 0;
    p(29, 12, 2, day ? 2 : 1, day ? '#ffd84a' : '#5a3c3c'); p(33, 12, 2, day ? 2 : 1, day ? '#ffd84a' : '#5a3c3c');
    p(30, 17, 4, 1, '#7a2020');
    // vela en la boca
    p(34, 17, 5, 2, '#f4e8c8'); const f = Math.floor(t * 8) % 2; p(38, 14 - f, 2, 3, '#ff7a20'); p(38, 13 - f, 1, 1, '#ffd84a');
    return c;
  },
  Garuda(t) {
    const c = canvas(), p = painter(c);
    const flap = Math.floor(t * 4) % 2;
    wings(p, 12 + bob(t), '#e8402c', '#ffd84a', flap, 11);
    const b = figure(p, t, { robe: '#e8a030', robeShade: '#c88020', belt: '#c83030', skin: '#d8a060', eyes: '#101018', legs: '#d8a060' });
    animalHead(p, b, 'falcon', '#c85a2c'); p(14, 4 + b, 12, 5, '#ffd84a'); p(16, 2 + b, 2, 3, '#ffd84a'); p(22, 2 + b, 2, 3, '#ffd84a');
    p(13, 37, 14, 3, '#5c9c3c'); p(12, 38, 2, 2, '#5c9c3c'); // serpiente entre sus garras
    return c;
  },
  Kamadhenu(t) {
    const c = canvas(), p = painter(c);
    // Vaca divina blanca con cara de mujer, alas y cola de pavo real
    const flap = Math.floor(t * 3) % 2;
    const sh = Math.floor(t * 3) % 3;
    for (let i = 0; i < 4; i++) { p(0, 20 + i * 4, 7, 3, i % 3 === sh ? '#5ce0f0' : '#2a8a6a'); p(2, 21 + i * 4, 2, 1, '#ffd84a'); }
    p(6, 20, 24, 14, '#f4f4f8'); p(8, 32, 20, 2, '#d8d8e0'); p(14, 26, 6, 2, '#d8a030');
    for (const x of [8, 13, 22, 27]) { p(x, 34, 3, 10, '#f4f4f8'); p(x, 44, 3, 2, '#d8a030'); }
    sideWing(p, 22, 20, '#f4f4f8', '#e8c880', flap, -1, 6);
    p(28, 10, 10, 12, '#e8b890'); p(27, 8, 12, 4, '#101018'); p(27, 12, 2, 10, '#101018'); p(30, 14, 2, 2, '#101018'); p(35, 14, 2, 2, '#101018'); p(32, 18, 3, 1, '#c86060');
    p(27, 6, 3, 3, '#d8a030'); p(36, 6, 3, 3, '#d8a030'); p(31, 6, 4, 2, '#d8a030'); twinkle(p, t, 33, 3, '#ffd84a');
    return c;
  },
  Shesha(t) {
    const c = canvas(), p = painter(c);
    // Serpiente de muchas cabezas que forma un dosel
    p(6, 32, 28, 2, '#4c7c9c'); p(3, 34, 34, 10, '#3c6c8c'); p(5, 44, 30, 2, '#2c5c7c'); p(8, 36, 24, 3, '#4c7c9c');
    for (let i = 0; i < 7; i++) p(5 + i * 5, 41, 3, 2, '#c8d870');
    p(16, 22, 8, 12, '#4c7c9c'); p(18, 24, 4, 10, '#c8d870');
    const sw = Math.round(Math.sin(t * 2));
    for (let i = 0; i < 5; i++) {
      const x = 2 + i * 8, y = 2 + Math.abs(2 - i) * 3 + (i % 2 ? sw : -sw);
      for (let k = 1; k <= 4; k++) p(Math.round(x + 2 + (18 - x - 2) * k / 5), Math.round(y + 8 + (22 - y - 8) * k / 5), 3, 3, '#4c7c9c');
      p(x, y, 7, 8, '#5c8cac'); p(x + 1, y + 2, 5, 4, '#c8d870'); p(x + 1, y + 1, 1, 1, '#ff3030'); p(x + 5, y + 1, 1, 1, '#ff3030');
    }
    twinkle(p, t, 20, 18, '#ffd84a');
    return c;
  },
  Pazuzu(t) {
    const c = canvas(), p = painter(c);
    // Demonio del viento: cuatro alas, cabeza de león, garras y cola de escorpión
    const flap = Math.floor(t * 4) % 2;
    wings(p, 6 + bob(t), '#5a4a3a', '#7a6a5a', flap, 10);
    wings(p, 18 + bob(t), '#5a4a3a', '#7a6a5a', 1 - flap, 9);
    const b = figure(p, t, { robe: '#6a5a4a', robeShade: '#4a3a2a', belt: '#3a2a1a', skin: '#8a7a5a', eyes: '#ffd84a', armR: 'up', legs: '#8a7a5a', shoe: '#3a2a1a' });
    animalHead(p, b, 'lion', '#7a6a4a');
    p(17, 18 + b, 6, 2, '#2a1a10'); p(18, 18 + b, 1, 2, '#ffffff'); p(21, 18 + b, 1, 2, '#ffffff');
    const tl = Math.floor(t * 3) % 2; p(30, 34, 3, 8, '#5a4a3a'); p(32, 30 - tl, 4, 4, '#5a4a3a'); p(35, 29 - tl, 2, 2, '#c83030');
    return c;
  },
  Lamassu(t) {
    const c = canvas(), p = painter(c);
    // Toro alado con cabeza humana, barba rizada y tiara de cuernos
    const flap = Math.floor(t * 3) % 2;
    p(4, 22, 26, 14, '#d8b880'); p(6, 34, 22, 2, '#b89860');
    for (const x of [5, 10, 20, 25]) { p(x, 36, 4, 9, '#d8b880'); p(x, 44, 4, 2, '#8a6a40'); }
    p(1, 22, 4, 3, '#c8a060'); p(0, 24, 2, 4, '#5a3c20');
    sideWing(p, 24, 22, '#c8a060', '#f4dca0', flap, -1, 7);
    p(26, 8, 12, 14, '#d8b880'); p(25, 4, 14, 5, '#5a3c20'); p(26, 2, 12, 2, '#d8a030'); p(25, 3, 2, 3, '#d8a030'); p(37, 3, 2, 3, '#d8a030');
    p(29, 12, 2, 2, '#101018'); p(34, 12, 2, 2, '#101018');
    for (let i = 0; i < 4; i++) { p(27 + i * 3, 18, 2, 8, '#3a2c20'); p(27 + i * 3, 20 + (i % 2) * 2, 2, 1, '#5a3c20'); }
    return c;
  },
  Camazotz(t) {
    const c = canvas(), p = painter(c);
    // Dios murciélago de la muerte, alas membranosas y cuchillo de obsidiana
    const flap = Math.floor(t * 5) % 2;
    for (const side of [-1, 1]) {
      for (let i = 0; i < 4; i++) p(side < 0 ? 1 + i * 3 : 27, 14 + i * 3 + flap * 2, side < 0 ? 12 - i * 3 : 12 - i * 3, 3, '#3a2a3a');
      p(side < 0 ? 1 : 37, 14 + flap * 2, 2, 12, '#2a1a2a');
    }
    const b = figure(p, t, { robe: '#3a2a3a', robeShade: '#2a1a2a', belt: '#c83030', skin: '#5a4a5a', eyes: '#ff3030', legs: '#5a4a5a', shoe: '#2a1a2a' });
    p(14, 8 + b, 12, 13, '#4a3a4a'); p(13, 2 + b, 4, 8, '#4a3a4a'); p(23, 2 + b, 4, 8, '#4a3a4a');
    p(16, 12 + b, 2, 2, '#ff3030'); p(22, 12 + b, 2, 2, '#ff3030'); p(18, 16 + b, 4, 3, '#2a1a2a'); p(18, 18 + b, 1, 2, '#ffffff'); p(21, 18 + b, 1, 2, '#ffffff');
    p(28, 28 + b, 2, 8, '#101018'); p(29, 26 + b, 2, 3, '#3c3c4c');
    return c;
  },
  Amaru(t) {
    const c = canvas(), p = painter(c);
    // Serpiente-dragón andina con alas, cabeza de llama y cola de pez
    const flap = Math.floor(t * 3) % 2;
    const w = Math.round(Math.sin(t * 2) * 2);
    const ys = [];
    for (let i = 0; i < 7; i++) { ys[i] = 26 + Math.round(Math.sin(i * 0.9 + t * 3) * 3); p(2 + i * 5, ys[i], 6, 8, i % 2 ? '#3c8c6c' : '#2c7c5c'); }
    sideWing(p, 20, ys[3], '#5cc0a0', '#a8f0d8', flap, -1, 5);
    p(30 + w, 14, 9, 12, '#3c8c6c'); p(31 + w, 10, 3, 5, '#3c8c6c'); p(36 + w, 10, 3, 5, '#3c8c6c'); p(33 + w, 18, 2, 2, '#ffd84a'); p(37 + w, 22, 2, 2, '#2c5c4c');
    p(0, 28, 4, 8, '#5cc0a0'); p(0, 26, 2, 3, '#7ce0c0'); p(0, 35, 2, 3, '#7ce0c0');
    const rb = ['#e05858', '#ffd84a', '#5cc85c', '#4c8cf0', '#a070f0', '#e05858'];
    for (let i = 0; i < 6; i++) p(5 + i * 5, ys[i] - 1, 2, 1, rb[i]);
    return c;
  },
  Inkanyamba(t) {
    const c = canvas(), p = painter(c);
    // Gran serpiente de las cascadas con cabeza de caballo; la cascada cae detrás
    const fall = Math.floor(t * 8) % 4;
    p(26, 0, 12, 46, '#5ca0d8'); for (let i = 0; i < 6; i++) p(27 + (i % 3) * 4, (i * 8 + fall * 2) % 46, 1, 5, '#e8f4ff');
    p(0, 42, 40, 6, '#2c6cb8');
    for (let i = 0; i < 6; i++) p(2 + i * 4, 30 + Math.round(Math.sin(i + t * 3) * 3), 6, 8, '#3c4c5c');
    p(6, 12, 10, 20, '#3c4c5c'); p(4, 6, 12, 10, '#4c5c6c'); p(0, 9, 6, 6, '#4c5c6c');
    p(8, 3, 3, 4, '#4c5c6c'); p(5, 9, 2, 2, '#ffd84a'); p(12, 4, 6, 10, '#2c3c4c');
    const f = Math.floor(t * 6) % 3; if (f === 0) { p(18, 2, 2, 5, '#fff07a'); p(20, 6, 2, 4, '#fff07a'); }
    return c;
  },
  Taniwha(t) {
    const c = canvas(), p = painter(c);
    // Guardián del agua maorí: dragón de agua con espirales koru tatuadas
    const w = Math.round(Math.sin(t * 2) * 2);
    p(0, 40 + w, 40, 8 - w, '#2c8cb8'); p(4, 38 + w, 8, 2, '#78c0ff'); p(26, 38 + w, 10, 2, '#78c0ff');
    for (let i = 0; i < 6; i++) p(2 + i * 5, 26 + Math.round(Math.sin(i + t * 2) * 3), 7, 10, '#2c5c4c');
    p(26, 10, 12, 18, '#2c5c4c'); p(30, 6, 10, 8, '#3c6c5c'); p(36, 9, 3, 2, '#ffffff');
    p(33, 8, 2, 2, '#ff9030');
    // Espirales koru tatuadas en el cuerpo
    for (const [x, y] of [[8, 28], [18, 30], [29, 16]]) { p(x, y, 4, 1, '#8ce0c0'); p(x + 3, y, 1, 3, '#8ce0c0'); p(x + 1, y + 2, 3, 1, '#8ce0c0'); p(x + 1, y + 1, 1, 1, '#8ce0c0'); }
    p(28, 4, 2, 6, '#2c5c4c'); p(32, 2, 2, 5, '#2c5c4c');
    return c;
  }

};

/** Fotograma i de la animación de un dios rediseñado (con contorno), o null si no tiene diseño propio. */
export function godFrame(name, i = 0) {
  const draw = GOD_ART[name];
  if (!draw) return null;
  return outline(draw((i * GOD_FRAME_MS) / 1000));
}

/** Ayudantes de dibujo compartidos con los diseños a mano de las bestias (beasts.js). */
export { canvas, painter, outline, figure, twinkle, bob, wings, sideWing, disc, animalHead, SKIN };
