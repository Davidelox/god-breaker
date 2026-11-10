// Bestias rediseñadas a mano (40x48 px) con animación de reposo, en el mismo estilo que los dioses
// (gods.js). Sustituyen al sprite generado de esas bestias. Cada función dibuja un fotograma en el
// instante t (segundos). Para añadir otra: una función más en BEAST_ART con su nombre exacto del
// bestiario.
import { canvas, painter, outline, figure, twinkle, bob, wings, sideWing, disc, animalHead, SKIN, GOD_FRAME_MS } from './gods.js';

const DARK = '#101018';
const EG_SKIN = '#c8885c';

/** Figura pequeña y rechoncha (enanos, duendes): cabeza grande, cuerpo corto. Devuelve la respiración b. */
function dwarf(p, t, o) {
  const b = bob(t);
  const skin = o.skin ?? SKIN;
  p(14, 41, 5, 4, o.legs ?? '#5a3c20'); p(21, 41, 5, 4, o.legs ?? '#5a3c20');
  p(13, 44, 6, 2, o.shoe ?? '#3a2a1a'); p(21, 44, 6, 2, o.shoe ?? '#3a2a1a');
  p(12, 28 + b, 16, 14 - b, o.robe); p(12, 28 + b, 3, 14 - b, o.robeShade ?? o.robe);
  if (o.belt) p(12, 35 + b, 16, 2, o.belt);
  p(9, 29 + b, 3, 9, skin); p(28, 29 + b, 3, 9, skin);
  p(13, 16 + b, 14, 12, skin);
  p(16, 20 + b, 2, 2, o.eyes ?? '#3a2a1a'); p(22, 20 + b, 2, 2, o.eyes ?? '#3a2a1a');
  p(18, 24 + b, 4, 1, '#b07060');
  if (o.hair) p(12, 14 + b, 16, 4, o.hair);
  if (o.beard) { p(13, 22 + b, 14, 8, o.beard); p(15, 29 + b, 10, 3, o.beard); p(17, 24 + b, 6, 1, '#9a6050'); }
  return b;
}

/**
 * Cuadrúpedo de perfil mirando a la derecha: patas, cuerpo, cola y cabeza del tipo indicado
 * (horse, dog, lion, bull, deer, boar). Devuelve la respiración b.
 */
function quad(p, t, o) {
  const b = bob(t);
  const col = o.col, sh = o.shade ?? col, eye = o.eye ?? DARK;
  [8, 13, 23, 28].forEach((x, i) => { if (o.hind === false && i < 2) return; p(x, 32, 3, 11, i % 2 ? sh : col); p(x, 43, 3, 2, o.hoof ?? sh); });
  // Cola
  const sw = Math.floor(t * 3) % 2;
  if (o.tail !== false) { p(3, 21 + b + sw, 4, 3, o.tailc ?? sh); p(2, 23 + b + sw, 2, 7, o.tailc ?? sh); }
  p(6, 20 + b, 24, 13, col); p(8, 31 + b, 20, 2, o.belly ?? sh);
  const h = o.head ?? 'horse';
  if (h === 'horse') {
    p(25, 12 + b, 7, 12, col); p(28, 8 + b, 9, 8, col); p(34, 12 + b, 5, 5, col); p(28, 5 + b, 2, 4, col);
    p(31, 10 + b, 2, 2, eye); p(38, 14 + b, 1, 1, DARK);
    if (o.mane) for (let i = 0; i < 5; i++) p(23 - (i % 2), 8 + b + i * 3, 3, 3, o.mane);
  } else if (h === 'dog') {
    p(25, 14 + b, 7, 10, col); p(27, 10 + b, 9, 8, col); p(35, 13 + b, 4, 4, col); p(38, 13 + b, 1, 2, DARK);
    p(27, 6 + b, 3, 5, col); p(32, 6 + b, 3, 5, col); p(32, 12 + b, 2, 2, eye);
    if (o.fangs) p(36, 17 + b, 1, 2, '#ffffff');
  } else if (h === 'lion') {
    p(22, 8 + b, 15, 18, o.mane ?? sh); p(27, 11 + b, 10, 10, col); p(35, 15 + b, 4, 4, col); p(38, 15 + b, 1, 1, DARK);
    p(31, 13 + b, 2, 2, eye); p(34, 19 + b, 4, 1, '#5a3020');
  } else if (h === 'bull') {
    p(25, 14 + b, 8, 10, col); p(28, 11 + b, 10, 10, col); p(34, 17 + b, 5, 4, o.muzzle ?? sh);
    p(30, 13 + b, 2, 2, eye); const hc = o.horn ?? '#e8d8b0';
    p(26, 9 + b, 4, 2, hc); p(25, 5 + b, 2, 5, hc); p(26, 3 + b, 2, 2, hc); p(33, 9 + b, 4, 2, hc); p(36, 5 + b, 2, 5, hc); p(35, 3 + b, 2, 2, hc);
  } else if (h === 'deer') {
    p(25, 12 + b, 6, 12, col); p(28, 9 + b, 8, 7, col); p(35, 12 + b, 4, 4, col); p(38, 12 + b, 1, 1, DARK);
    p(31, 11 + b, 2, 2, eye); p(26, 7 + b, 3, 3, col);
  } else if (h === 'goat') {
    const hc = o.horn ?? '#8a7a6a';
    p(25, 12 + b, 6, 11, col); p(27, 9 + b, 9, 7, col); p(34, 12 + b, 4, 4, col); p(37, 13 + b, 1, 1, DARK);
    p(30, 11 + b, 2, 1, eye); p(33, 16 + b, 2, 4, o.beard ?? sh); p(26, 10 + b, 2, 2, sh);
    p(28, 5 + b, 3, 5, hc); p(26, 3 + b, 3, 3, hc); p(24, 4 + b, 2, 3, hc);
  } else if (h === 'wolf') {
    p(23, 14 + b, 5, 10, sh); p(25, 13 + b, 7, 11, col); p(27, 9 + b, 9, 8, col); p(35, 12 + b, 5, 4, col); p(39, 12 + b, 1, 2, DARK);
    p(27, 5 + b, 3, 5, col); p(32, 5 + b, 3, 5, col); p(32, 11 + b, 2, 2, eye); p(35, 16 + b, 4, 1, DARK);
    if (o.fangs) { p(36, 16 + b, 1, 2, '#ffffff'); p(38, 16 + b, 1, 2, '#ffffff'); }
  } else if (h === 'cat') {
    p(26, 10 + b, 12, 11, col); p(26, 6 + b, 3, 5, col); p(35, 6 + b, 3, 5, col); p(27, 7 + b, 1, 2, '#d88c9c'); p(36, 7 + b, 1, 2, '#d88c9c');
    p(28, 13 + b, 3, 2, eye); p(33, 13 + b, 3, 2, eye); p(29, 13 + b, 1, 2, DARK); p(34, 13 + b, 1, 2, DARK); p(31, 17 + b, 2, 1, '#d88c9c');
    p(37, 16 + b, 3, 1, '#c8c8d0'); p(37, 18 + b, 3, 1, '#c8c8d0');
  } else if (h === 'croc') {
    p(25, 14 + b, 7, 10, col); p(27, 12 + b, 8, 8, col); p(33, 15 + b, 7, 5, col);
    p(29, 11 + b, 3, 2, col); p(30, 12 + b, 2, 2, eye); p(33, 19 + b, 7, 1, DARK);
    for (let i = 0; i < 3; i++) p(34 + i * 2, 20 + b, 1, 1, '#ffffff');
  } else if (h === 'boar') {
    p(24, 14 + b, 10, 12, col); p(32, 17 + b, 7, 6, col); p(37, 18 + b, 2, 3, '#c89c9c');
    p(34, 22 + b, 2, 3, '#f4f4e8'); p(29, 16 + b, 2, 2, eye); p(26, 11 + b, 3, 4, col);
  }
  return b;
}

/** Ave de perfil mirando a la derecha. Devuelve la respiración b. */
function bird(p, t, o) {
  const b = bob(t);
  const flap = Math.floor(t * 4) % 2;
  const leg = o.leg ?? '#d8a030';
  p(16, 37, 2, 7, leg); p(22, 37, 2, 7, leg); p(14, 44, 6, 1, leg); p(20, 44, 6, 1, leg);
  p(4, 25 + b, 9, 5, o.tail ?? o.wing ?? o.col); p(1, 27 + b, 5, 4, o.tail ?? o.wing ?? o.col);
  p(10, 20 + b, 20, 18, o.col); p(12, 18 + b, 16, 2, o.col); p(16, 30 + b, 12, 7, o.belly ?? o.col);
  if (flap) sideWing(p, 22, 22 + b, o.wing ?? o.col, o.wing2 ?? o.belly ?? o.col, 0, -1, 6);
  else { p(10, 22 + b, 15, 10, o.wing ?? o.col); for (let i = 0; i < 4; i++) p(10 + i * 4, 31 + b, 3, 3, o.wing2 ?? o.wing ?? o.col); }
  if (!o.noHead) {
    p(24, 8 + b, 12, 12, o.head ?? o.col);
    p(31, 11 + b, 2, 2, o.eye ?? DARK);
    p(35, 13 + b, 5, 2, o.beak ?? '#d8a030'); p(35, 15 + b, 3, 1, o.beak ?? '#d8a030');
  }
  return b;
}

/** Serpiente que ondula por el suelo con la cabeza alzada a la derecha. Devuelve la ondulación. */
function serpent(p, t, o) {
  const ys = [];
  for (let i = 0; i < 7; i++) {
    const y = 34 + Math.round(Math.sin(i * 1.1 + t * 3) * 3);
    ys.push(y);
    p(1 + i * 4, y, 6, 8, i % 2 ? o.col : o.shade ?? o.col); p(2 + i * 4, y + 6, 4, 2, o.belly ?? o.col);
  }
  if (!o.noHead) {
    p(28, 18, 6, 18, o.col); p(29, 20, 3, 16, o.belly ?? o.col);
    p(27, 12, 12, 8, o.col); p(36, 15, 3, 3, o.col); p(31, 14, 2, 2, o.eye ?? '#ffd84a');
    if (Math.floor(t * 3) % 3 === 0) { p(39, 17, 1, 1, '#e83030'); p(38, 17, 1, 3, '#e83030'); }
  }
  return ys;
}

/** Pez o burbuja que sube (agua). */
const bubble = (p, t, x, y0, k = 0) => { const y = y0 - ((t * 10 + k * 7) % 14); p(x, y, 2, 2, '#a8e0ff'); };
/** Copo de nieve que cae. */
const flake = (p, t, x, k = 0) => p(x, (t * 8 + k * 11) % 46, 1, 1, '#ffffff');
/** Llamita animada en (x,y). */
const flame = (p, t, x, y, k = 0) => {
  const f = Math.floor(t * 8 + k) % 2;
  p(x, y - f, 3, 4 + f, '#ff7a20'); p(x + 1, y + 1 - f, 1, 2, '#ffd84a'); p(x + 1, y - 2 - f, 1, 2, '#ff9c40');
};

/** Gigante: torso desnudo y ancho, brazos gruesos, cabeza grande. o.oneEye para cíclopes. Devuelve b. */
function giant(p, t, o) {
  const b = bob(t);
  const skin = o.skin ?? SKIN, sh = o.shade ?? '#c89870';
  p(12, 38, 6, 8, o.legs ?? skin); p(22, 38, 6, 8, o.legs ?? skin);
  p(11, 45, 8, 2, o.shoe ?? '#5a3c20'); p(21, 45, 8, 2, o.shoe ?? '#5a3c20');
  p(9, 19 + b, 22, 21 - b, o.armor ?? skin); p(9, 19 + b, 3, 21 - b, o.armorShade ?? sh);
  if (!o.armor) { p(13, 24 + b, 5, 1, sh); p(22, 24 + b, 5, 1, sh); p(19, 27 + b, 2, 5, sh); }
  if (o.robe) { p(10, 33 + b, 20, 7 - b, o.robe); p(10, 33 + b, 20, 2, o.belt ?? '#3a2a1a'); }
  p(5, 20 + b, 5, 14, skin); p(4, 33 + b, 6, 4, skin);
  if (o.armR === 'up') { p(30, 8 + b, 5, 13, skin); p(30, 5 + b, 6, 4, skin); } else { p(30, 20 + b, 5, 14, skin); p(30, 33 + b, 6, 4, skin); }
  p(17, 17 + b, 6, 3, skin);
  p(14, 6 + b, 12, 13, skin);
  if (o.oneEye) { p(16, 9 + b, 8, 5, '#f4f4f8'); p(19, 10 + b, 3, 3, o.eyes ?? DARK); p(15, 8 + b, 10, 1, '#5a3c30'); }
  else { p(16, 11 + b, 2, 2, o.eyes ?? DARK); p(22, 11 + b, 2, 2, o.eyes ?? DARK); p(15, 10 + b, 4, 1, '#5a3c30'); p(21, 10 + b, 4, 1, '#5a3c30'); }
  p(18, 16 + b, 4, 1, '#8a4a40');
  if (o.hair) {
    p(13, 4 + b, 14, 4, o.hair); p(13, 6 + b, 2, 6, o.hair); p(25, 6 + b, 2, 6, o.hair);
    if (o.wild) for (let i = 0; i < 5; i++) p(12 + i * 4, 1 + b + (i % 2) * 2, 3, 4, o.hair);
  }
  if (o.beard) { p(14, 14 + b, 12, 6, o.beard); p(16, 19 + b, 8, 3, o.beard); p(18, 15 + b, 4, 1, '#5a3020'); }
  return b;
}

/** Cabeza humana suelta (9x10) en x,y. */
function head(p, x, y, o) {
  const skin = o.skin ?? SKIN;
  p(x, y, 9, 10, skin);
  if (o.eyes !== false) { p(x + 2, y + 4, 1, 2, o.eyes ?? DARK); p(x + 6, y + 4, 1, 2, o.eyes ?? DARK); }
  p(x + 3, y + 7, 3, 1, '#9a5a50');
  if (o.hair) { p(x - 1, y - 1, 11, 3, o.hair); p(x - 1, y + 1, 2, o.long ? 12 : 5, o.hair); p(x + 8, y + 1, 2, o.long ? 12 : 5, o.hair); }
  if (o.beard) { p(x, y + 6, 9, 5, o.beard); p(x + 3, y + 7, 3, 1, '#5a3020'); }
}

/** Cabeza de perro de perfil (12x12) en x,y mirando a la derecha. */
function dogHead(p, t, x, y, col, eye = '#ff3030', k = 0) {
  p(x, y + 4, 9, 8, col); p(x + 8, y + 7, 4, 4, col); p(x + 11, y + 7, 1, 2, DARK);
  p(x, y, 3, 5, col); p(x + 5, y + 1, 3, 4, col); p(x + 5, y + 6, 2, 2, eye);
  const open = Math.floor(t * 3 + k) % 3 === 0;
  p(x + 8, y + 11, 4, open ? 2 : 1, '#5a1a1a'); p(x + 9, y + 11, 1, 2, '#ffffff'); p(x + 11, y + 11, 1, 2, '#ffffff');
}

/** Cola de pez de sirena/tritón sobre una roca (tapa las piernas de figure). */
function merTail(p, t, b, col, fin) {
  const f = Math.floor(t * 3) % 2;
  p(4, 43, 30, 5, '#6a6a7a'); p(6, 42, 10, 1, '#8a8a9a');
  p(13, 34 + b, 14, 8 - b, col); p(13, 39, 18, 4, col); p(24, 36, 9, 4, col);
  p(32, 32 - f, 5, 4, fin); p(32, 39 + f, 5, 3, fin);
  for (let i = 0; i < 4; i++) p(15 + i * 4, 40, 2, 1, fin);
}

/** Llamarada que sale de (x,y) hacia la derecha. */
function fireBreath(p, t, x, y) {
  const f = Math.floor(t * 8) % 2;
  const cols = ['#ffd84a', '#ff9c30', '#ff7a20', '#e84a20'];
  for (let i = 0; i < 4; i++) p(x + i * 2, y - i - f, 3, 2 + i * 2 + f, cols[i]);
}

/** Brasa que sube. */
const ember = (p, t, x, y0, k = 0) => p(x + Math.round(Math.sin(t * 3 + k)), y0 - ((t * 12 + k * 9) % 20), 1, 1, '#ffb040');

/** Cabeza de serpiente o dragón (7x6) en x,y; dir 1 mira a la derecha. */
function snakeHead(p, t, x, y, col, belly, eye = '#ff3030', dir = 1, k = 0) {
  p(x, y, 7, 6, col); p(dir > 0 ? x + 6 : x - 2, y + 2, 3, 3, col);
  p(dir > 0 ? x + 4 : x + 1, y + 1, 2, 2, eye); p(x + 1, y + 4, 5, 1, belly);
  if (Math.floor(t * 3 + k) % 3 === 0) p(dir > 0 ? x + 9 : x - 3, y + 4, 1, 2, '#e83030');
}

/** Cuello de (x0,y0) a (x1,y1) en pasos de 3x3. */
function neck(p, x0, y0, x1, y1, col, n = 5, w = 4) {
  for (let k = 0; k <= n; k++) p(Math.round(x0 + (x1 - x0) * k / n), Math.round(y0 + (y1 - y0) * k / n), w, w, col);
}

/** Hecatónquiro: gigante de tres cabezas y muchos brazos que se agitan. */
function hundredHanded(p, t, o) {
  const skin = o.skin, w = Math.floor(t * 4) % 2;
  for (let i = 0; i < 4; i++) {
    const y = 8 + i * 7 + ((i + w) % 2) * 2;
    p(0, y, 10, 3, skin); p(0, y - 2, 3, 3, skin);
    p(30, y, 10, 3, skin); p(37, y - 2, 3, 3, skin);
  }
  const b = giant(p, t, { skin, shade: o.shade, robe: o.robe, hair: o.hair, wild: o.wild, eyes: o.eyes });
  head(p, 4, 6 + b, { skin, hair: o.hair, eyes: o.eyes });
  head(p, 27, 6 + b, { skin, hair: o.hair, eyes: o.eyes });
  return b;
}

/** Dragón agazapado mirando a la derecha: cola con púas, patas, cuello, cabeza con cuernos y alas opcionales. */
function dragon(p, t, o) {
  const b = bob(t);
  const col = o.col, sh = o.shade ?? col, bel = o.belly ?? sh, claw = o.claw ?? '#e8e0c8';
  const sw = Math.round(Math.sin(t * 2) * 2);
  p(0, 27 + sw, 5, 4, col); p(3, 30 + sw / 2, 6, 5, col); p(1, 25 + sw, 2, 2, o.spike ?? sh);
  if (o.legs !== 2) { p(8, 34, 5, 10, sh); p(6, 43, 7, 2, claw); }
  p(7, 24 + b, 22, 13, col); p(9, 33 + b, 18, 3, bel); for (let i = 0; i < 4; i++) p(10 + i * 5, 34 + b, 1, 2, sh);
  p(23, 34, 5, 10, col); p(22, 43, 7, 2, claw);
  for (let i = 0; i < 5; i++) p(9 + i * 4, 22 + b - (i % 2), 2, 3, o.spike ?? sh);
  if (o.wings !== false) sideWing(p, 20, 23 + b, o.wing ?? sh, o.wing2 ?? bel, Math.floor(t * 3) % 2, -1, 7);
  p(25, 14 + b, 6, 12, col); p(27, 16 + b, 3, 10, bel);
  p(25, 7 + b, 12, 8, col); p(35, 10 + b, 5, 4, col); p(39, 10 + b, 1, 1, DARK);
  p(30, 9 + b, 2, 2, o.eye ?? '#ffd84a'); p(26, 3 + b, 2, 5, o.horn ?? '#e8e0c8'); p(29, 4 + b, 2, 4, o.horn ?? '#e8e0c8');
  p(33, 14 + b, 6, 1, sh); p(34, 15 + b, 1, 1, '#ffffff'); p(37, 15 + b, 1, 1, '#ffffff');
  return b;
}

/** Espíritu flotante con bajos ondulantes. Devuelve el desplazamiento f. */
function ghost(p, t, o) {
  const f = Math.round(Math.sin(t * 2) * 2), wv = Math.floor(t * 4) % 2;
  p(12, 10 + f, 16, 24, o.col); p(10, 16 + f, 20, 18, o.col);
  for (let i = 0; i < 5; i++) p(10 + i * 4, 34 + f + ((i + wv) % 2) * 2, 4, 6, o.col);
  if (o.hair) { p(11, 8 + f, 18, 5, o.hair); p(9, 11 + f, 4, 20, o.hair); p(27, 11 + f, 4, 20, o.hair); }
  if (o.hood) { p(10, 6 + f, 20, 6, o.hood); p(9, 10 + f, 4, 20, o.hood); p(27, 10 + f, 4, 20, o.hood); }
  p(15, 18 + f, 3, 3, o.eye ?? DARK); p(22, 18 + f, 3, 3, o.eye ?? DARK); p(18, 25 + f, 4, 2, o.mouth ?? '#3a3a4a');
  return f;
}

/** Ballena-isla en el mar: lomo con hierba y un árbol. */
function islandWhale(p, t, o) {
  const w = Math.round(Math.sin(t * 2) * 1.5);
  p(2, 22 + w, 36, 16, o.col); p(0, 26 + w, 4, 10, o.col); p(36, 26 + w, 4, 8, o.col);
  p(4, 20 + w, 30, 4, o.top ?? '#5c9c3c'); p(8, 18 + w, 20, 3, o.top ?? '#5c9c3c');
  p(14, 8 + w, 2, 11, '#6a4a2a'); p(10, 4 + w, 10, 6, '#3c7c3c'); p(24, 15 + w, 6, 4, '#7a7a8a');
  p(31, 28 + w, 2, 2, o.eye ?? DARK); p(26, 34 + w, 12, 1, '#2a2a34');
  p(0, 38, 40, 10, '#2c6cb8'); p(4, 37 - w, 10, 2, '#a8e0ff'); p(24, 37 + w, 12, 2, '#a8e0ff');
  return w;
}

/** Cabeza humana sobre un cuerpo de ave (bird con noHead). */
function birdHead(p, b, o) {
  const skin = o.skin ?? SKIN;
  p(24, 6 + b, 12, 4, o.hair); p(24, 9 + b, 12, 11, skin); p(23, 8 + b, 3, o.short ? 6 : 14, o.hair);
  p(28, 13 + b, 2, 2, o.eyes ?? DARK); p(33, 13 + b, 2, 2, o.eyes ?? DARK); p(30, 17 + b, 4, 1, '#a85a50');
  if (o.crown) { p(25, 3 + b, 10, 3, o.crown); p(25, 1 + b, 2, 2, o.crown); p(29, 0 + b, 2, 3, o.crown); p(33, 1 + b, 2, 2, o.crown); }
}

/** Pez de perfil mirando a la derecha que nada arriba y abajo. */
function fish(p, t, o) {
  const y = 20 + Math.round(Math.sin(t * 2.5) * 2), f = Math.floor(t * 4) % 2;
  p(2, y - 4 + f, 6, 6, o.fin ?? o.col); p(2, y + 4 - f, 6, 6, o.fin ?? o.col);
  p(6, y, 6, 6, o.col); p(10, y - 4, 22, 14, o.col); p(14, y - 7, 14, 4, o.col); p(30, y - 1, 6, 8, o.col);
  p(16, y - 10, 8, 4, o.fin ?? o.col); p(18, y + 10, 6, 3, o.fin ?? o.col);
  if (o.stripe) for (let i = 0; i < 4; i++) p(13 + i * 5, y - 5, 2, 14, o.stripe);
  p(12, y + 4, 20, 3, o.belly ?? o.col);
  p(29, y, 3, 3, '#f4f4f8'); p(30, y + 1, 2, 2, DARK); p(35, y + 4, 2, 1, DARK);
  return y;
}

/** Tortuga de perfil mirando a la derecha: caparazón abombado, patas y cabeza. Devuelve b. */
function turtle(p, t, o) {
  const b = bob(t);
  [6, 13, 22, 29].forEach((x) => { p(x, 36, 5, 8, o.skin); p(x - 1, 43, 7, 2, o.skinShade ?? o.skin); });
  p(1, 34 + b, 5, 3, o.skin);
  for (let y = 0; y < 16; y++) { const w = Math.round(17 * Math.sin(Math.PI * (y + 6) / 32)); p(19 - w, 20 + y + b, w * 2, 1, o.shell); }
  p(4, 34 + b, 30, 3, o.rim ?? o.skinShade ?? o.skin);
  return b;
}

/** Figura con kimono: vestido largo, obi ancho con lazo, mangas amplias y cuello cruzado. Devuelve b. */
function kimono(p, t, o) {
  const b = figure(p, t, { ...o, dress: true });
  const sl = o.sleeveCol ?? o.robe, skin = o.skin ?? SKIN;
  if (o.armL !== 'up') { p(8, 24 + b, 6, 11, sl); p(9, 35 + b, 3, 2, skin); }
  if (o.armR !== 'up') { p(26, 24 + b, 6, 11, sl); p(28, 35 + b, 3, 2, skin); }
  p(18, 24 + b, 2, 5, o.collar ?? '#f4f4f0'); p(20, 25 + b, 2, 4, o.collar ?? '#f4f4f0');
  p(13, 31 + b, 14, 4, o.obi ?? '#e8c040'); p(19, 32 + b, 3, 2, o.obiKnot ?? '#c83030');
  if (o.pattern) for (let i = 0; i < 5; i++) p(14 + i * 3, 38 + (i % 2) * 4, 2, 2, o.pattern);
  return b;
}

/** Hitodama: bola de fuego fantasmal con la llama hacia arriba, flotando. */
function wisp(p, t, x, y, col, core, k = 0) {
  const f = Math.floor(t * 6 + k) % 2;
  y += Math.round(Math.sin(t * 2 + k) * 2);
  p(x - 1 + f, y - 10, 2, 4, col); p(x - 2, y - 7, 4, 4, col); p(x - 3 + f, y - 4, 5, 3, col);
  disc(p, x, y, 4, col); disc(p, x, y + 1, 2, core);
}

/** Ocho patas de araña que nacen en (cx,cy), suben a la rodilla y bajan al suelo; se mueven alternas. */
function spiderLegs(p, t, cx, cy, col, joint = col) {
  const a = Math.floor(t * 3) % 2;
  [[1, 20, 0], [5, 15, 4], [9, 12, 9], [13, 14, 13]].forEach(([kx, ky, fx], i) => {
    const up = (i + a) % 2;
    for (const s of [-1, 1]) {
      const K = s < 0 ? kx : 38 - kx, F = s < 0 ? fx : 38 - fx;
      neck(p, cx - 1, cy, K, ky - up, col, 6, 2); neck(p, K, ky - up, F, 44, col, 8, 2); p(K, ky - up, 2, 2, joint);
    }
  });
}

/** Dragón oriental largo que serpentea en S de la cola (abajo izq.) a la cabeza (arriba der.). Devuelve [hx, hy]. */
function longDragon(p, t, o) {
  const col = o.col, sh = o.shade ?? col, bel = o.belly ?? sh, mane = o.mane ?? bel, claw = o.claw ?? '#e8e0c8';
  const N = 48, ph = Math.sin(t * 2) * 0.6, pt = (u) => [3 + u * 25, 31 - u * 17 + Math.round(Math.sin(u * 7.5 + ph) * 7 * (1 - u * 0.5))];
  if (o.clouds) {
    const d = Math.round(Math.sin(t) * 2);
    p(d, 40, 14, 4, '#f4f4f8'); p(3 + d, 38, 8, 2, '#f4f4f8'); p(1 + d, 43, 12, 1, '#c8d8e8');
    p(22 - d, 42, 16, 4, '#f4f4f8'); p(26 - d, 40, 8, 2, '#f4f4f8'); p(23 - d, 45, 14, 1, '#c8d8e8');
  }
  if (o.wings) { const [wx, wy] = pt(0.62); sideWing(p, wx, wy - 3, o.wings, o.wing2 ?? '#ffffff', Math.floor(t * 3) % 2, -1, 6); }
  for (let k = 0; k <= N; k++) {
    const u = k / N, [x, y] = pt(u), w = 3 + Math.round(u * 3), h = Math.floor(w / 2);
    p(x - h, y - h, w, w, col); p(x - h, y + w - h - 1, w, 1, bel);
    if (k % 4 === 0 && k > 3) p(x - 1, y - h - 2, 2, 2, mane);
    else if (k % 4 === 2) p(x, y, 1, 1, sh);
  }
  { const [x, y] = pt(0); p(x - 3, y - 3, 4, 3, mane); p(x - 3, y + 1, 4, 3, mane); }
  for (const u of [0.32, 0.72]) { const [x, y] = pt(u); p(x, y + 2, 2, 5, col); p(x - 1, y + 7, 4, 1, claw); p(x + 2, y + 6, 1, 2, claw); }
  const [hx, hy] = pt(1);
  p(hx - 6, hy - 6, 4, 11, mane); p(hx - 8, hy - 3, 3, 7, mane);
  p(hx - 2, hy - 5, 10, 8, col); p(hx + 7, hy - 3, 4, 4, col); p(hx + 10, hy - 3, 1, 1, DARK);
  p(hx + 3, hy + 2, 8, 2, bel); p(hx + 4, hy + 2, 1, 1, '#ffffff'); p(hx + 8, hy + 2, 1, 1, '#ffffff');
  p(hx + 1, hy - 3, 3, 2, o.eye ?? '#ffd84a'); p(hx + 2, hy - 3, 1, 2, DARK); p(hx, hy - 5, 5, 1, sh);
  if (o.horns !== false) { const hc = o.horn ?? '#e8d8b0'; p(hx - 1, hy - 10, 2, 5, hc); p(hx - 3, hy - 9, 2, 2, hc); p(hx + 2, hy - 9, 2, 4, hc); p(hx + 3, hy - 11, 2, 2, hc); }
  const ww = Math.floor(t * 3) % 2;
  p(hx + 9, hy, 1, 1, mane); p(hx + 10, hy + 1 + ww, 1, 3, mane); p(hx + 9, hy + 4 + ww, 1, 2, mane);
  p(hx + 2, hy + 4, 1, 3, mane); p(hx + 1, hy + 6, 1, 2, mane);
  if (o.pearl) {
    const f = Math.floor(t * 6) % 2;
    p(34 + f, 25, 1, 2, '#ff9c40'); p(38 - f, 26, 1, 2, '#ff9c40'); p(36, 24 - f, 1, 2, '#ffd84a');
    disc(p, 36, 30, 3, '#f4f8ff'); p(35, 29, 2, 1, '#ffffff'); p(37, 31, 1, 1, '#a8d8f0');
  }
  return [hx, hy];
}

/** Cabeza de zorro de perfil (x24-39, y6-20) mirando a la derecha. */
function foxHead(p, b, col, eye, mark) {
  p(24, 11 + b, 10, 9, col); p(32, 14 + b, 5, 5, col); p(36, 15 + b, 3, 3, col); p(38, 15 + b, 2, 2, DARK);
  p(24, 8 + b, 4, 3, col); p(25, 6 + b, 2, 2, col); p(30, 8 + b, 4, 3, col); p(31, 6 + b, 2, 2, col); p(25, 9 + b, 1, 2, '#e8a0b0'); p(31, 9 + b, 1, 2, '#e8a0b0');
  p(29, 13 + b, 3, 1, eye); if (mark) { p(28, 12 + b, 4, 1, mark); p(26, 16 + b, 2, 2, mark); }
  p(33, 19 + b, 5, 1, '#d8d8d0');
}

/** Cola de escorpión que sale de (x,y) y se curva hacia arriba con el aguijón; k: tamaño de los segmentos. */
function scorpTail(p, t, x, y, col, sting = '#e8d070', dir = 1, k = 3) {
  const sw = Math.round(Math.sin(t * 3));
  const pts = [[0, 0], [-1, -4], [-1, -8], [0, -12], [2, -15], [5, -16], [8 + sw, -14]];
  pts.forEach(([dx, dy], i) => p(x + dx * dir - (dir < 0 ? k : 0), y + dy, k, k, i % 2 ? col : sting === col ? col : col));
  pts.forEach(([dx, dy], i) => { if (i % 2) p(x + dx * dir, y + dy + k - 1, 1, 1, '#2a1a10'); });
  const [ex, ey] = pts[pts.length - 1];
  p(x + ex * dir + (dir > 0 ? k - 1 : -1), ey + y + k - 1, 2, 3, sting); p(x + ex * dir + (dir > 0 ? k : -2), y + ey + k + 2, 1, 2, sting);
}

/** Ave de frente con las alas abiertas. Devuelve b. */
function frontBird(p, t, o) {
  const b = bob(t), flap = Math.floor(t * 3) % 2, leg = o.leg ?? '#e8c040';
  wings(p, 10 + b, o.wing, o.wing2 ?? o.wing, flap, 13);
  p(14, 14 + b, 12, 22, o.body); p(17, 18 + b, 6, 14, o.belly ?? o.body);
  p(15, 4 + b, 10, 10, o.head ?? o.body); p(16, 7 + b, 2, 2, o.eye ?? '#ffd84a'); p(22, 7 + b, 2, 2, o.eye ?? '#ffd84a');
  p(18, 10 + b, 4, 4, o.beak ?? '#e8c040'); p(19, 14 + b, 2, 1, o.beak ?? '#e8c040');
  p(13, 36, 14, 4, o.tail ?? o.wing); p(16, 38, 2, 7, leg); p(22, 38, 2, 7, leg); p(14, 45, 5, 1, leg); p(21, 45, 5, 1, leg);
  return b;
}

/** Rayo en zigzag desde (x,y). */
const bolt = (p, x, y, col = '#fff07a') => { p(x, y, 2, 4, col); p(x - 2, y + 3, 2, 4, col); p(x, y + 6, 2, 5, col); };

export const BEAST_ART = {
  // ---------- Griegas: comunes ----------
  Lampad(t) {
    const c = canvas(), p = painter(c);
    // Ninfa del inframundo con antorcha
    const b = figure(p, t, { robe: '#e8782c', robeShade: '#c85a1c', dress: true, hair: '#c83020', longHair: true, eyes: '#ffd84a', armR: 'up', belt: '#5a2a1a' });
    p(28, 6 + b, 2, 9, '#6a4a2a'); flame(p, t, 27, 2 + b);
    for (let k = 0; k < 3; k++) { const y = 40 - ((t * 12 + k * 13) % 34); p(4 + k * 13 + (k === 2 ? 2 : 0), y, 1, 1, '#ffb040'); }
    return c;
  },
  Potamid(t) {
    const c = canvas(), p = painter(c);
    // Ninfa de río que vierte agua de su cántaro
    const b = figure(p, t, { robe: '#2c9c9c', robeShade: '#1c7c7c', dress: true, hair: '#4c9c4c', longHair: true, eyes: '#2c6c9c' });
    p(13, 7 + b, 14, 2, '#7cc04c');
    p(27, 24 + b, 7, 7, '#c8783c'); p(28, 23 + b, 5, 2, '#a85a2c');
    const f = Math.floor(t * 8) % 3;
    for (let y = 31; y < 46; y += 3) p(33, y + b + f % 3, 1, 2, '#78c0ff');
    p(28, 45, 10, 2, '#4c9cd8');
    return c;
  },
  Crenaea(t) {
    const c = canvas(), p = painter(c);
    // Ninfa de las fuentes, con corona de flores y un surtidor a sus pies
    const b = figure(p, t, { robe: '#3cc0d8', robeShade: '#2c9cb8', dress: true, hair: '#2c9c8c', longHair: true, eyes: '#2c6c9c' });
    for (let i = 0; i < 4; i++) p(14 + i * 4, 7 + b, 2, 2, ['#ff7ca0', '#ffffff', '#ffd84a', '#ff7ca0'][i]);
    p(0, 42, 10, 5, '#a8a8b8'); p(1, 41, 8, 1, '#c8c8d8');
    const h = 4 + Math.floor(t * 6) % 3;
    p(4, 41 - h, 2, h, '#a8e0ff'); p(2, 41 - h, 1, 2, '#a8e0ff'); p(7, 41 - h, 1, 2, '#a8e0ff');
    return c;
  },
  Naiad(t) {
    const c = canvas(), p = painter(c);
    // Ninfa del agua dulce con una perla y ondas a sus pies
    const b = figure(p, t, { robe: '#4c8cd8', robeShade: '#3c6cb8', dress: true, hair: '#2c5cb8', longHair: true, eyes: '#78c0ff' });
    p(13, 7 + b, 14, 2, '#7cc04c');
    p(29, 33 + b, 3, 3, '#f4f4f8'); twinkle(p, t, 30, 32 + b);
    const w = Math.floor(t * 3) % 2;
    p(2 + w * 2, 46, 10, 1, '#78c0ff'); p(28 - w * 2, 46, 10, 1, '#78c0ff');
    bubble(p, t, 6, 44); bubble(p, t, 34, 44, 1);
    return c;
  },
  Nereid(t) {
    const c = canvas(), p = painter(c);
    // Ninfa del mar sobre una ola, con tiara y concha con perla
    const w = Math.round(Math.sin(t * 2.5) * 1.5);
    const b = figure(p, t, { robe: '#3cc0d8', robeShade: '#2c9cb8', dress: true, hair: '#e8b030', longHair: true, eyes: '#2c6c9c' });
    p(15, 7 + b, 10, 2, '#d8d8e8'); p(19, 5 + b, 2, 2, '#78c0ff');
    p(28, 32 + b, 5, 3, '#f4c8b8'); p(29, 31 + b, 2, 2, '#f4f4f8');
    p(0, 43 + w, 40, 5, '#2c8cd8'); p(2, 41 + w, 8, 2, '#a8e0ff'); p(26, 42 - w, 10, 2, '#a8e0ff'); p(8, 40 + w, 3, 2, '#ffffff');
    return c;
  },
  Oceanid(t) {
    const c = canvas(), p = painter(c);
    // Ninfa del océano, burbujas que suben
    const b = figure(p, t, { robe: '#2c3c8c', robeShade: '#1c2c6c', dress: true, hair: '#3cc8e8', longHair: true, eyes: '#3cc8e8', trim: '#3cc8e8' });
    p(13, 7 + b, 14, 2, '#3c9c6c');
    p(29, 33 + b, 3, 3, '#f4f4f8');
    bubble(p, t, 4, 40); bubble(p, t, 7, 44, 1); bubble(p, t, 34, 42, 2);
    return c;
  },
  Napaea(t) {
    const c = canvas(), p = painter(c);
    // Ninfa de los valles entre flores que se mecen
    const b = figure(p, t, { robe: '#8cd04c', robeShade: '#6cb03c', dress: true, hair: '#8a5a30', longHair: true, eyes: '#4c8c3c' });
    for (let i = 0; i < 4; i++) p(14 + i * 4, 7 + b, 2, 2, ['#ff7ca0', '#ffd84a', '#ffffff', '#ff7ca0'][i]);
    const s = Math.floor(t * 2) % 2;
    for (const [x, col] of [[3, '#ff7ca0'], [7, '#ffd84a'], [32, '#ffffff'], [36, '#ff7ca0']]) {
      p(x, 40, 1, 7, '#4c9c3c'); p(x - 1 + s, 38, 3, 3, col);
    }
    return c;
  },
  Alseid(t) {
    const c = canvas(), p = painter(c);
    // Ninfa de las arboledas, pelo de hojas y hojas que caen
    const b = figure(p, t, { robe: '#3c9c4c', robeShade: '#2c7c3c', dress: true, hair: '#7c8c2c', longHair: true, eyes: '#4c8c3c' });
    for (let i = 0; i < 6; i++) p(12 + i * 3, 6 + b + (i % 2), 3, 3, i % 2 ? '#8cc04c' : '#5c9c3c');
    for (let k = 0; k < 3; k++) { const y = (t * 9 + k * 15) % 46; p(3 + k * 15 + Math.round(Math.sin(t * 3 + k) * 2), y, 2, 1, '#8cc04c'); }
    return c;
  },
  Meliad(t) {
    const c = canvas(), p = painter(c);
    // Ninfa del fresno, con lanza de fresno
    const b = figure(p, t, { robe: '#6c8c4c', robeShade: '#4c6c3c', dress: true, hair: '#c8a070', longHair: true, eyes: '#4c6c3c', armR: 'up' });
    p(28, 2 + b, 2, 44, '#8a6a40'); p(27, 0 + b, 4, 3, '#c8c8d8'); p(28, -1 + b, 2, 1, '#e8e8f0');
    p(26, 10 + b, 3, 2, '#7cc04c'); p(30, 14 + b, 3, 2, '#7cc04c');
    return c;
  },
  Dryad(t) {
    const c = canvas(), p = painter(c);
    // Ninfa del bosque con piel de madera, vestido y pelo de hojas, enredaderas en los brazos
    const b = figure(p, t, { robe: '#5cb04c', robeShade: '#3c903c', dress: true, skin: '#a87c50', hair: '#5cb04c', longHair: true, eyes: '#c8f070' });
    for (let i = 0; i < 6; i++) p(11 + i * 3, 6 + b + (i % 2), 3, 3, i % 2 ? '#8ce06c' : '#4c9c3c');
    p(10, 28 + b, 3, 1, '#3c7c2c'); p(27, 30 + b, 3, 1, '#3c7c2c'); p(9, 33 + b, 2, 2, '#ff7ca0');
    p(15, 16 + b, 1, 4, '#8a5c30'); p(24, 15 + b, 1, 3, '#8a5c30');
    return c;
  },
  Hamadryad(t) {
    const c = canvas(), p = painter(c);
    // Árbol con cara y brazos de rama, cubierto de flores rosas
    const s = Math.round(Math.sin(t * 2) * 1);
    p(14, 22, 12, 24, '#7a5434'); p(15, 22, 3, 24, '#5a3c20'); p(10, 44, 20, 3, '#5a3c20');
    p(16, 28, 2, 2, '#ffd84a'); p(22, 28, 2, 2, '#ffd84a'); p(18, 33, 4, 1, '#3a2614');
    p(4, 24 + s, 10, 3, '#7a5434'); p(3, 21 + s, 3, 4, '#7a5434'); p(26, 24 - s, 10, 3, '#7a5434'); p(34, 21 - s, 3, 4, '#7a5434');
    p(4, 2, 32, 20, '#4c9c3c'); p(2, 6, 36, 12, '#4c9c3c'); p(8, 0, 24, 4, '#5cb04c'); p(6, 4, 10, 6, '#5cb04c');
    const sh = Math.floor(t * 2) % 2;
    for (const [x, y] of [[8, 6], [16, 3], [26, 7], [12, 14], [30, 13], [20, 10], [5, 12], [34, 5]]) p(x, y + ((x + sh) % 2), 2, 2, '#ff9cc8');
    const fy = (t * 8) % 24; p(32, 22 + fy, 2, 1, '#ff9cc8');
    return c;
  },
  Aura(t) {
    const c = canvas(), p = painter(c);
    // Ninfa de la brisa: alas blancas, sin piernas, estela de viento
    const flap = Math.floor(t * 4) % 2;
    wings(p, 14 + bob(t), '#f4f4f8', '#c8e8f8', flap, 9);
    const b = figure(p, t, { robe: '#f4f4f8', robeShade: '#d8e4f0', dress: true, hair: '#5cd8e8', longHair: true, eyes: '#3cc8e8' });
    c.getContext('2d').clearRect(12, 40, 16, 8);
    p(14, 40, 12, 2, '#e8f0f8'); p(16, 42, 8, 2, '#c8e8f8'); p(18, 44, 4, 2, '#a8d8f0');
    const w = (t * 30) % 40;
    p(w, 10, 8, 1, '#c8f0ff'); p((w + 20) % 40, 30, 6, 1, '#c8f0ff');
    return c;
  },
  Sibyl(t) {
    const c = canvas(), p = painter(c);
    // Profetisa en trance: velo blanco, pergamino y vapor del oráculo que sube
    const b = figure(p, t, { robe: '#7c3cb0', robeShade: '#5c2c90', dress: true, hair: '#3a2a1a', eyes: '#3a2a1a' });
    p(16, 14 + b, 2, 1, '#3a2a1a'); p(22, 14 + b, 2, 1, '#3a2a1a'); p(16, 15 + b, 2, 1, SKIN); p(22, 15 + b, 2, 1, SKIN);
    p(12, 7 + b, 16, 5, '#f4f4f8'); p(11, 10 + b, 3, 18, '#f4f4f8'); p(26, 10 + b, 3, 18, '#f4f4f8');
    p(27, 32 + b, 6, 7, '#f4e8c8'); p(27, 32 + b, 6, 1, '#c8a878'); p(27, 38 + b, 6, 1, '#c8a878'); p(28, 34 + b, 4, 1, '#7a6a5a');
    for (let k = 0; k < 3; k++) { const y = 44 - ((t * 8 + k * 6) % 18); p(4 + Math.round(Math.sin(t * 2 + k) * 2), y, 3, 2, '#c8c0e0'); }
    return c;
  },
  Oneiros(t) {
    const c = canvas(), p = painter(c);
    // Niño de los sueños que flota dormido, alitas y corona de estrellas
    const f = Math.round(Math.sin(t * 2) * 2);
    const flap = Math.floor(t * 3) % 2;
    sideWing(p, 14, 26 + f, '#c8b0f0', '#f4e8ff', flap, -1, 4); sideWing(p, 26, 26 + f, '#c8b0f0', '#f4e8ff', flap, 1, 4);
    p(14, 26 + f, 12, 10, '#b098e0'); p(16, 36 + f, 8, 4, '#b098e0'); p(18, 40 + f, 4, 3, '#c8b0f0');
    p(14, 12 + f, 12, 13, SKIN); p(13, 10 + f, 14, 4, '#e8c878');
    p(16, 18 + f, 2, 1, '#5a3c30'); p(22, 18 + f, 2, 1, '#5a3c30'); p(18, 22 + f, 3, 1, '#c87070');
    p(11, 28 + f, 3, 6, SKIN); p(26, 28 + f, 3, 6, SKIN);
    for (const [x, y] of [[14, 7], [20, 5], [26, 7]]) twinkle(p, t + x, x, y + f, '#ffe878');
    const z = (t * 6) % 12; p(31, 12 - z, 3, 1, '#f4e8ff'); p(33, 13 - z, 1, 1, '#f4e8ff'); p(31, 14 - z, 3, 1, '#f4e8ff');
    return c;
  },
  Kabeiros(t) {
    const c = canvas(), p = painter(c);
    // Pequeño herrero sagrado con martillo que golpea el yunque
    const b = dwarf(p, t, { robe: '#7a5434', robeShade: '#5a3c20', belt: '#c8a030', skin: '#b8885c', hair: '#2a2020', beard: '#2a2020', legs: '#b8885c' });
    p(28, 38, 10, 3, '#5a5a6c'); p(30, 41, 6, 5, '#4a4a5c'); p(27, 37, 12, 1, '#7a7a8c');
    const up = Math.floor(t * 4) % 2;
    p(30, (up ? 26 : 32) + b, 2, 8, '#8a6a40'); p(28, (up ? 22 : 30) + b, 6, 4, '#8a8a9c');
    if (!up) { p(34, 33, 1, 1, '#ffd84a'); p(36, 34, 1, 1, '#ff9030'); p(33, 35, 1, 1, '#ffd84a'); }
    return c;
  },
  Dactyl(t) {
    const c = canvas(), p = painter(c);
    // Duende herrero del monte Ida con gorro rojo y martillo de bronce
    const b = dwarf(p, t, { robe: '#b07c3c', robeShade: '#8a5c2c', belt: '#5a3c20', hair: '#6a4a2a', beard: '#6a4a2a' });
    p(13, 10 + b, 14, 6, '#c83030'); p(16, 7 + b, 8, 4, '#c83030'); p(22, 6 + b, 4, 3, '#a82020');
    const sw = Math.floor(t * 3) % 2;
    p(28, 22 + b + sw, 2, 12, '#7a5434'); p(26, 20 + b + sw, 7, 4, '#c8883c'); p(27, 21 + b + sw, 2, 1, '#f0c070');
    return c;
  },
  Pyrausta(t) {
    const c = canvas(), p = painter(c);
    // Insecto alado que vive en el fuego de las forjas
    const f = Math.round(Math.sin(t * 3) * 2);
    const flap = Math.floor(t * 8) % 2;
    p(4, 12 + f - flap * 3, 14, 8 - flap * 2, '#ff9c40'); p(22, 12 + f - flap * 3, 14, 8 - flap * 2, '#ff9c40');
    p(6, 14 + f - flap * 3, 8, 3, '#ffd84a'); p(26, 14 + f - flap * 3, 8, 3, '#ffd84a');
    p(16, 14 + f, 8, 8, '#c83020'); p(17, 22 + f, 6, 12, '#a82018'); for (let i = 0; i < 3; i++) p(17, 24 + f + i * 3, 6, 1, '#ff7a20');
    p(15, 8 + f, 10, 7, '#c83020'); p(16, 10 + f, 3, 3, '#ffd84a'); p(21, 10 + f, 3, 3, '#ffd84a');
    p(15, 4 + f, 1, 5, '#a82018'); p(24, 4 + f, 1, 5, '#a82018');
    flame(p, t, 13, 40); flame(p, t, 19, 39, 1); flame(p, t, 25, 40, 2);
    p(10, 44, 22, 3, '#c83020');
    return c;
  },
  Hippalectryon(t) {
    const c = canvas(), p = painter(c);
    // Mitad caballo (delante) y mitad gallo (detrás): patas de ave, cola en abanico y ala dorada
    const b = bob(t);
    p(23, 32, 3, 11, '#e8e8f0'); p(28, 32, 3, 11, '#d8d8e0'); p(23, 43, 3, 2, '#8a8a9c'); p(28, 43, 3, 2, '#8a8a9c');
    p(10, 32, 2, 11, '#d8a030'); p(15, 32, 2, 11, '#d8a030'); p(8, 43, 5, 1, '#d8a030'); p(13, 43, 5, 1, '#d8a030');
    const sp = Math.floor(t * 3) % 2;
    ['#c83030', '#e85030', '#3c8c3c', '#e85030', '#c83030'].forEach((col, i) => p(1 + i * 2, 6 + i * 2 - sp, 3, 18 - i * 2, col));
    p(6, 20 + b, 24, 13, '#f4f4f8'); p(8, 31 + b, 20, 2, '#d8d8e0');
    p(25, 12 + b, 7, 12, '#f4f4f8'); p(28, 8 + b, 9, 8, '#f4f4f8'); p(34, 12 + b, 5, 5, '#f4f4f8'); p(31, 10 + b, 2, 2, DARK);
    p(28, 4 + b, 4, 4, '#c83030'); p(29, 3 + b, 2, 2, '#c83030');
    sideWing(p, 22, 22 + b, '#e8b030', '#ffe080', Math.floor(t * 4) % 2, -1, 5);
    return c;
  },
  Stymphalian(t) {
    const c = canvas(), p = painter(c);
    // Ave de bronce que dispara sus plumas de metal
    const b = bird(p, t, { col: '#b0783c', wing: '#c8883c', wing2: '#e8b060', belly: '#8a5a2c', beak: '#c8c8d8', eye: '#ff3030', leg: '#7a5a3c' });
    p(24, 8 + b, 4, 3, '#e8b060');
    const x = 4 + ((t * 40) % 36);
    p(x, 6, 5, 1, '#e8b060'); p(x + 5, 6, 1, 1, '#ffffff');
    return c;
  },
  Aello(t) {
    const c = canvas(), p = painter(c);
    // Arpía de la tormenta: cuerpo de ave gris y cabeza de mujer de ojos rojos
    const b = bird(p, t, { col: '#7a7a8c', wing: '#5a6a7c', wing2: '#8a9aac', belly: '#9a9aac', leg: '#c8a030', noHead: true });
    p(24, 6 + b, 12, 4, '#1c1c24'); p(24, 9 + b, 12, 11, '#e8d8c8'); p(23, 8 + b, 3, 14, '#1c1c24');
    p(28, 13 + b, 2, 2, '#e83030'); p(33, 13 + b, 2, 2, '#e83030'); p(30, 17 + b, 4, 1, '#7a4040');
    const w = (t * 34) % 40; p(w, 4, 7, 1, '#c8d0e0'); p((w + 18) % 40, 22, 5, 1, '#c8d0e0');
    return c;
  },
  Zetes(t) {
    const c = canvas(), p = painter(c);
    // Hijo del viento norte: alas de hielo y espada, aliento helado
    const flap = Math.floor(t * 4) % 2;
    wings(p, 14 + bob(t), '#a8e0ff', '#e8f8ff', flap, 10);
    const b = figure(p, t, { robe: '#2c3c7c', robeShade: '#1c2c5c', belt: '#a8e0ff', hair: '#f4f4f8', eyes: '#78c0ff', armR: 'up' });
    p(28, 2 + b, 2, 13, '#d8e8f8'); p(26, 14 + b, 6, 2, '#8a8aa8');
    flake(p, t, 4); flake(p, t, 35, 2); flake(p, t, 20, 3);
    return c;
  },
  Calais(t) {
    const c = canvas(), p = painter(c);
    // Hermano de Zetes: alas cian y lanza
    const flap = 1 - Math.floor(t * 4) % 2;
    wings(p, 14 + bob(t), '#5cd8e8', '#c8f4ff', flap, 10);
    const b = figure(p, t, { robe: '#3c6cd8', robeShade: '#2c4cb8', belt: '#c8c8d8', hair: '#c8c8d8', eyes: '#5cd8e8', armR: 'up' });
    p(28, 0 + b, 2, 46, '#8a6a40'); p(27, -1 + b, 4, 4, '#c8c8d8');
    const w = (t * 30) % 40; p(w, 6, 6, 1, '#c8f4ff');
    return c;
  },
  Chione(t) {
    const c = canvas(), p = painter(c);
    // Ninfa de la nieve con tiara de hielo y copos que caen
    const b = figure(p, t, { robe: '#f4f8ff', robeShade: '#d0e0f0', dress: true, hair: '#c8d0e0', longHair: true, eyes: '#78c0ff', trim: '#a8e0ff' });
    p(15, 7 + b, 10, 2, '#a8e0ff'); p(17, 4 + b, 2, 3, '#a8e0ff'); p(21, 4 + b, 2, 3, '#a8e0ff'); p(19, 3 + b, 2, 4, '#e8f8ff');
    flake(p, t, 3); flake(p, t, 8, 2); flake(p, t, 33, 1); flake(p, t, 37, 3);
    twinkle(p, t, 19, 2 + b, '#ffffff');
    return c;
  },
  Hyperborean(t) {
    const c = canvas(), p = painter(c);
    // Habitante del norte lejano: abrigo de piel blanca, pelo dorado y arco
    const b = figure(p, t, { robe: '#e8e8f0', robeShade: '#c8c8d8', belt: '#8a6a40', hair: '#e8b830', eyes: '#3c6cb8', legs: '#c8c8d8', shoe: '#8a6a40' });
    p(11, 22 + b, 18, 4, '#f8f8ff'); p(12, 38 + b, 16, 3, '#f8f8ff');
    p(31, 14 + b, 2, 24, '#8a5a30'); p(30, 13 + b, 2, 2, '#8a5a30'); p(30, 37 + b, 2, 2, '#8a5a30'); p(29, 15 + b, 1, 22, '#d8d8e0');
    flake(p, t, 4); flake(p, t, 36, 2);
    return c;
  },
  Faun(t) {
    const c = canvas(), p = painter(c);
    // Fauno: patas de cabra, cuernecillos, orejas puntiagudas y siringa con notas
    const b = figure(p, t, { robe: SKIN, robeShade: '#d8a880', skin: SKIN, hair: '#7a4a2a', eyes: '#5a3c20', legs: '#b08a5c', shoe: '#3a2a1a' });
    p(13, 34 + b, 14, 8 - b, '#b08a5c'); p(13, 34 + b, 14, 2, '#c89c6c'); p(15, 42, 3, 2, '#b08a5c'); p(22, 42, 3, 2, '#b08a5c');
    p(15, 5 + b, 2, 4, '#e8d8b0'); p(23, 5 + b, 2, 4, '#e8d8b0'); p(12, 12 + b, 2, 3, SKIN); p(26, 12 + b, 2, 3, SKIN);
    for (let i = 0; i < 4; i++) p(22 + i * 2, 18 + b + i, 2, 7 - i, '#c8a050');
    const n = (t * 8) % 14; p(31 + Math.round(Math.sin(t * 4)), 14 - n, 2, 2, '#ffffff'); p(33 + Math.round(Math.sin(t * 4)), 10 - n, 1, 4, '#ffffff');
    return c;
  },
  Amphisbaena(t) {
    const c = canvas(), p = painter(c);
    // Serpiente con una cabeza en cada extremo
    serpent(p, t, { col: '#7c8c3c', shade: '#6c7c2c', belly: '#d8c88c', noHead: true });
    const s = Math.round(Math.sin(t * 2));
    for (const [x, d] of [[2, -1], [30, 1]]) {
      const hy = 16 + (d > 0 ? s : -s);
      p(x + 1, hy + 6, 7, 36 - hy - 6, '#7c8c3c'); p(x + 3, hy + 8, 3, 36 - hy - 8, '#d8c88c');
      p(d > 0 ? x : x - 2, hy, 10, 8, '#7c8c3c'); p(d > 0 ? x + 6 : x + 1, hy + 2, 2, 2, '#ffd84a');
      p(d > 0 ? x + 2 : x, hy + 6, 6, 1, '#5c6c2c');
      if (Math.floor(t * 3 + (d > 0 ? 1 : 0)) % 3 === 0) p(d > 0 ? x + 10 : x - 3, hy + 4, 1, 2, '#e83030');
    }
    return c;
  },
  Cerastes(t) {
    const c = canvas(), p = painter(c);
    // Víbora cornuda enroscada en la arena
    p(0, 42, 40, 5, '#e8c878'); p(4, 41, 6, 1, '#d8b868'); p(28, 41, 8, 1, '#d8b868');
    p(6, 32, 28, 10, '#c8a060'); p(9, 28, 22, 6, '#b89050'); p(12, 34, 16, 4, '#e8d0a0');
    for (let i = 0; i < 6; i++) p(8 + i * 4, 31 + (i % 2) * 3, 2, 2, '#8a6a3c');
    p(18, 16, 6, 14, '#c8a060');
    const s = Math.round(Math.sin(t * 2));
    p(14 + s, 10, 12, 8, '#c8a060'); p(15 + s, 6, 2, 5, '#e8e0c8'); p(23 + s, 6, 2, 5, '#e8e0c8');
    p(17 + s, 12, 2, 2, '#ffd84a'); p(22 + s, 12, 2, 2, '#ffd84a');
    if (Math.floor(t * 3) % 3 === 0) { p(19 + s, 18, 2, 3, '#e83030'); }
    return c;
  },
  Catoblepas(t) {
    const c = canvas(), p = painter(c);
    // Bestia de cabeza tan pesada que la arrastra por el suelo; su mirada roja mata
    const b = bob(t);
    [8, 13, 23, 28].forEach((x, i) => { p(x, 30, 4, 13, i % 2 ? '#2a2a34' : '#3a3a44'); p(x, 43, 4, 2, '#1c1c24'); });
    p(2, 18 + b, 4, 3, '#2a2a34'); p(1, 20 + b, 2, 6, '#2a2a34');
    p(5, 16 + b, 26, 15, '#3a3a44'); p(8, 13 + b, 18, 4, '#4a4a54'); for (let i = 0; i < 6; i++) p(7 + i * 4, 12 + b, 2, 3, '#2a2a34');
    p(28, 22 + b, 6, 10, '#3a3a44'); p(30, 30, 10, 14, '#4a4a54'); p(29, 28, 3, 3, '#e8d8b0');
    const g = Math.sin(t * 3) > 0 ? '#ff3030' : '#c82020';
    p(34, 33, 3, 2, g); p(37, 33, 2, 2, '#ff8080');
    p(35, 40, 4, 2, '#2a2a34');
    return c;
  },
  Crocotta(t) {
    const c = canvas(), p = painter(c);
    // Hiena-lobo que imita voces humanas: manchas, colmillos y una lomera de crin
    const b = quad(p, t, { col: '#c8a068', shade: '#a8804c', belly: '#e0c898', head: 'dog', fangs: true, eye: '#ffd84a', tailc: '#6a4a2a' });
    for (const [x, y] of [[9, 23], [15, 26], [20, 22], [12, 29], [24, 27]]) p(x, y + b, 2, 2, '#6a4a2a');
    for (let i = 0; i < 6; i++) p(8 + i * 4, 18 + b, 3, 3, '#6a4a2a');
    if (Math.floor(t * 2) % 3 === 0) p(36, 18 + b, 3, 2, '#3a1a1a');
    return c;
  },
  Blemmyae(t) {
    const c = canvas(), p = painter(c);
    // Hombre sin cabeza con la cara en el pecho y una maza
    const b = bob(t);
    p(14, 40, 5, 6, '#b8885c'); p(21, 40, 5, 6, '#b8885c'); p(13, 45, 6, 2, '#5a3c20'); p(21, 45, 6, 2, '#5a3c20');
    p(10, 12 + b, 20, 28 - b, '#b8885c'); p(10, 12 + b, 3, 28 - b, '#a8784c'); p(11, 32 + b, 18, 8, '#7a5434'); p(11, 32 + b, 18, 2, '#5a3c20');
    p(14, 16 + b, 4, 3, '#f4f4f8'); p(22, 16 + b, 4, 3, '#f4f4f8'); p(15, 17 + b, 2, 2, DARK); p(23, 17 + b, 2, 2, DARK);
    p(13, 14 + b, 6, 1, '#3a2a1a'); p(21, 14 + b, 6, 1, '#3a2a1a'); p(19, 20 + b, 2, 4, '#a8784c');
    const m = Math.floor(t * 2) % 3 === 0 ? 3 : 2; p(16, 26 + b, 8, m, '#5a2020'); p(17, 26 + b, 6, 1, '#f4f4f8');
    p(6, 14 + b, 4, 14, '#b8885c'); p(30, 14 + b, 4, 14, '#b8885c');
    p(32, 4 + b, 4, 12, '#6a4a2a'); p(31, 2 + b, 6, 5, '#7a5434'); p(33, 16 + b, 2, 12, '#5a3c20');
    return c;
  },
  Cynocephalus(t) {
    const c = canvas(), p = painter(c);
    // Hombre con cabeza de perro, túnica roja y lanza
    const b = figure(p, t, { robe: '#b83030', robeShade: '#982020', belt: '#d8a030', skin: '#8a6a4a', eyes: DARK, armR: 'up', legs: '#8a6a4a' });
    p(14, 8 + b, 12, 13, '#7a5434'); p(24, 13 + b, 7, 6, '#7a5434'); p(30, 13 + b, 2, 2, DARK);
    p(14, 3 + b, 3, 7, '#6a4a2a'); p(22, 3 + b, 3, 7, '#6a4a2a'); p(20, 12 + b, 2, 2, '#ffd84a'); p(25, 18 + b, 5, 1, '#3a2a1a');
    if (Math.floor(t * 3) % 3 === 0) p(27, 19 + b, 3, 3, '#e87080');
    p(28, 0 + b, 2, 46, '#8a6a40'); p(27, -1 + b, 4, 4, '#c8c8d8');
    return c;
  },
  Strix(t) {
    const c = canvas(), p = painter(c);
    // Ave nocturna de mal agüero, negra y de ojos rojos
    const b = bird(p, t, { col: '#2a2a34', wing: '#1c1c24', wing2: '#3a3a48', belly: '#3a3a48', beak: '#8a8a9c', eye: '#ff3030', leg: '#5a5a6c' });
    p(25, 6 + b, 3, 4, '#2a2a34'); p(32, 6 + b, 3, 4, '#2a2a34');
    if (Math.sin(t * 3) > 0) { p(30, 10 + b, 4, 4, '#ff3030'); p(31, 11 + b, 2, 2, '#ffd84a'); }
    return c;
  },
  // ---------- Griegas: poco comunes ----------
  Harpy(t) {
    const c = canvas(), p = painter(c);
    // Arpía: cuerpo de ave parda, cabeza de mujer que chilla y garras
    const b = bird(p, t, { col: '#8a6040', wing: '#6a4a30', wing2: '#a8804c', belly: '#a8804c', leg: '#d8a030', noHead: true });
    p(24, 6 + b, 12, 4, '#2a1a10'); p(24, 9 + b, 12, 11, '#c8946c'); p(23, 8 + b, 3, 14, '#2a1a10');
    p(28, 13 + b, 2, 2, '#ffd84a'); p(33, 13 + b, 2, 2, '#ffd84a');
    const scream = Math.floor(t * 3) % 2; p(30, 16 + b, 4, scream ? 3 : 1, '#5a2020');
    p(13, 44, 4, 2, '#3a2a1a'); p(23, 44, 4, 2, '#3a2a1a');
    for (let i = 0; i < 4; i++) p(26 + i * 3, 4 + b - (i % 2), 2, 3, '#a8804c');
    return c;
  },
  Siren(t) {
    const c = canvas(), p = painter(c);
    // Sirena sobre una roca con espejo, notas de su canto
    const b = figure(p, t, { robe: '#3cc0d8', robeShade: '#2c9cb8', hair: '#c83020', longHair: true, eyes: '#2c9c8c', armR: 'up' });
    merTail(p, t, b, '#2c9c8c', '#5ce0c8');
    p(29, 10 + b, 4, 4, '#d8a030'); p(30, 11 + b, 2, 2, '#c8f0ff'); p(30, 14 + b, 2, 3, '#d8a030');
    const n = (t * 8) % 16; p(4, 20 - n, 2, 2, '#ffffff'); p(6, 16 - n, 1, 4, '#ffffff'); p(7, 16 - n, 2, 1, '#ffffff');
    return c;
  },
  Hippocampus(t) {
    const c = canvas(), p = painter(c);
    // Caballo marino: delante caballo con crin de algas, detrás cola de pez que se enrosca
    const w = Math.round(Math.sin(t * 2.5) * 1.5);
    const b = quad(p, t, { col: '#3cc0d8', shade: '#2c9cb8', belly: '#e8f8ff', head: 'horse', mane: '#2c9c8c', hind: false, tail: false, hoof: '#e8f8ff' });
    p(2, 24 + b, 8, 8, '#2c9cb8'); p(0, 16 + b, 5, 10, '#2c9cb8'); p(0, 11 + b, 7, 5, '#5ce0c8'); p(4, 9 + b, 3, 3, '#5ce0c8');
    for (let i = 0; i < 3; i++) p(10 + i * 4, 28 + b, 2, 2, '#e8f8ff');
    p(0, 43 + w, 40, 5, '#2c8cd8'); p(4, 41 + w, 8, 2, '#a8e0ff'); p(26, 42 - w, 10, 2, '#a8e0ff');
    return c;
  },
  Ichthyocentaur(t) {
    const c = canvas(), p = painter(c);
    // Tritón de pelo verde con barba y tridente
    const b = figure(p, t, { robe: '#c89870', robeShade: '#b08060', skin: '#c89870', hair: '#3c9c5c', beard: '#3c9c5c', eyes: '#2c6c9c', armR: 'up' });
    p(13, 30 + b, 14, 2, '#3c9c5c');
    merTail(p, t, b, '#2c9c8c', '#5ce0c8');
    p(28, 2 + b, 2, 34, '#d8a030'); p(25, 2 + b, 8, 2, '#d8a030'); p(25, -1 + b, 2, 3, '#d8a030'); p(28, -2 + b, 2, 4, '#d8a030'); p(31, -1 + b, 2, 3, '#d8a030');
    return c;
  },
  Satyr(t) {
    const c = canvas(), p = painter(c);
    // Sátiro: cuernos de cabra, barba, patas peludas y copa de vino que se derrama
    const b = figure(p, t, { robe: '#c89870', robeShade: '#b08060', skin: '#c89870', hair: '#2a1a10', beard: '#2a1a10', eyes: '#5a3c20', legs: '#6a4a2a', shoe: '#2a1a10', armR: 'up' });
    p(13, 34 + b, 14, 8 - b, '#6a4a2a'); p(13, 34 + b, 14, 2, '#7a5434');
    p(13, 4 + b, 3, 6, '#5a4a3a'); p(11, 2 + b, 3, 3, '#5a4a3a'); p(24, 4 + b, 3, 6, '#5a4a3a'); p(26, 2 + b, 3, 3, '#5a4a3a');
    p(11, 12 + b, 3, 3, '#c89870'); p(26, 12 + b, 3, 3, '#c89870');
    p(28, 9 + b, 6, 4, '#d8a030'); p(30, 13 + b, 2, 3, '#d8a030'); p(29, 9 + b, 4, 1, '#8a2048');
    const d = (t * 10) % 8; p(33, 12 + b + d, 1, 2, '#a82858');
    return c;
  },
  Silvanus(t) {
    const c = canvas(), p = painter(c);
    // Espíritu de los bosques y lindes: corona de hojas, barba gris y hoz
    const b = figure(p, t, { robe: '#4c8c3c', robeShade: '#3c6c2c', belt: '#8a6a40', hair: '#a8a8b0', beard: '#a8a8b0', eyes: '#3c6c2c', armR: 'up' });
    for (let i = 0; i < 6; i++) p(12 + i * 3, 6 + b + (i % 2), 3, 3, i % 2 ? '#8cc04c' : '#5c9c3c');
    p(29, 8 + b, 2, 12, '#8a6a40'); p(28, 4 + b, 7, 2, '#c8c8d8'); p(33, 6 + b, 2, 3, '#c8c8d8');
    const s = Math.floor(t * 2) % 2;
    p(4, 38, 2, 9, '#5a3c20'); p(1 + s, 32, 8, 7, '#5c9c3c'); p(34, 40, 2, 7, '#5a3c20'); p(32 - s, 35, 6, 6, '#5c9c3c');
    return c;
  },
  Centaur(t) {
    const c = canvas(), p = painter(c);
    // Centauro con arco tenso: cuerpo de caballo y torso humano
    const b = bob(t);
    const col = '#8a5a30', sh = '#6a4220';
    [4, 9, 19, 24].forEach((x, i) => { p(x, 34, 3, 10, i % 2 ? sh : col); p(x, 43, 3, 2, '#3a2a1a'); });
    const sw = Math.floor(t * 3) % 2; p(0, 26 + b + sw, 3, 9, '#2a1a10');
    p(2, 25 + b, 24, 10, col); p(4, 33 + b, 20, 2, sh);
    p(19, 15 + b, 10, 12, '#c89870'); p(19, 15 + b, 2, 12, '#b08060');
    p(19, 3 + b, 10, 11, '#c89870'); p(18, 1 + b, 12, 4, '#2a1a10'); p(18, 3 + b, 2, 6, '#2a1a10');
    p(19, 9 + b, 10, 6, '#2a1a10'); p(22, 10 + b, 4, 1, '#5a3020');
    p(21, 6 + b, 2, 2, DARK); p(26, 6 + b, 2, 2, DARK);
    const pull = Math.floor(t * 2) % 2;
    p(28, 16 + b, 6, 3, '#c89870'); p(20, 17 + b, 6 - pull * 2, 3, '#c89870');
    p(34, 6 + b, 2, 24, '#8a5a30'); p(33, 5 + b, 2, 2, '#8a5a30'); p(33, 29 + b, 2, 2, '#8a5a30');
    p(33 - (pull ? 0 : 3), 7 + b, 1, 10, '#e8e0d0'); p(33 - (pull ? 0 : 3), 17 + b, 1, 12, '#e8e0d0');
    p(22 - pull * 2, 17 + b, 12, 1, '#a8a8b8'); p(34, 16 + b, 3, 3, '#c8c8d8');
    return c;
  },
  'Ceryneian Hind'(t) {
    const c = canvas(), p = painter(c);
    // Cierva de cuernos de oro y pezuñas de bronce, más rápida que una flecha
    const b = quad(p, t, { col: '#d8a848', shade: '#b8883c', belly: '#f0d898', head: 'deer', hoof: '#a8783c', tailc: '#f0d898' });
    p(28, 2 + b, 2, 7, '#ffd84a'); p(25, 4 + b, 3, 2, '#ffd84a'); p(24, 1 + b, 2, 3, '#ffd84a'); p(30, 3 + b, 3, 2, '#ffd84a'); p(32, 0 + b, 2, 3, '#ffd84a'); p(28, 0 + b, 2, 2, '#ffd84a');
    for (const [x, y] of [[10, 24], [16, 22], [21, 26]]) p(x, y + b, 2, 2, '#f8f0c8');
    twinkle(p, t, 32, 1 + b, '#ffffff');
    return c;
  },
  Griffin(t) {
    const c = canvas(), p = painter(c);
    // Grifo: cuerpo de león, cabeza y alas de águila
    const flap = Math.floor(t * 3) % 2;
    const b = quad(p, t, { col: '#c8a060', shade: '#a8804c', belly: '#e8c890', head: 'none', tailc: '#8a6040' });
    p(1, 28 + b, 3, 3, '#6a4a2a');
    p(25, 14 + b, 8, 10, '#f4f4f8'); p(27, 7 + b, 10, 10, '#f4f4f8'); p(29, 5 + b, 4, 3, '#e8e8f0');
    p(36, 11 + b, 4, 3, '#ffd84a'); p(37, 14 + b, 2, 2, '#e8b830'); p(31, 10 + b, 2, 2, DARK); p(30, 9 + b, 4, 1, '#8a6040');
    p(23, 43, 4, 2, '#e8b830'); p(28, 43, 4, 2, '#e8b830');
    sideWing(p, 22, 22 + b, '#8a6040', '#c8a070', flap, -1, 7);
    return c;
  },
  Pegasus(t) {
    const c = canvas(), p = painter(c);
    // Caballo alado blanco entre nubes
    const flap = Math.floor(t * 3) % 2;
    const cl = (t * 5) % 44;
    p(cl - 4, 4, 8, 3, '#e8f0f8'); p(cl - 2, 2, 4, 2, '#e8f0f8');
    const b = quad(p, t, { col: '#f4f4f8', shade: '#d8d8e8', belly: '#e8e8f0', head: 'horse', mane: '#c8d8f0', hoof: '#d8a030', tailc: '#c8d8f0' });
    sideWing(p, 22, 22 + b, '#c8dcf4', '#ffffff', flap, -1, 7);
    p(0, 45, 12, 2, '#e8f0f8'); p(26, 46, 14, 2, '#e8f0f8');
    return c;
  },
  Basilisk(t) {
    const c = canvas(), p = painter(c);
    // Rey de las serpientes: corona y mirada que brilla
    serpent(p, t, { col: '#3c8c3c', shade: '#2c7c2c', belly: '#a8d860', eye: '#ff3030' });
    p(27, 9, 10, 3, '#ffd84a'); p(27, 6, 2, 3, '#ffd84a'); p(31, 5, 2, 4, '#ffd84a'); p(35, 6, 2, 3, '#ffd84a'); p(31, 9, 2, 2, '#e83030');
    if (Math.sin(t * 3) > 0) { p(30, 13, 4, 4, '#ff6060'); p(31, 14, 2, 2, '#ffffff'); }
    return c;
  },
  'Nemean Lion'(t) {
    const c = canvas(), p = painter(c);
    // León de piel dorada que ninguna arma atraviesa
    const b = quad(p, t, { col: '#e8b030', shade: '#c89020', belly: '#f8d880', head: 'lion', mane: '#a8682c', eye: '#e83030', tailc: '#a8682c' });
    p(36, 20 + b, 1, 2, '#ffffff'); p(38, 20 + b, 1, 2, '#ffffff');
    const g = Math.floor(t * 3) % 4; p(8 + g * 5, 21 + b, 3, 1, '#fff4c0'); twinkle(p, t, 12 + g * 3, 24 + b, '#ffffff');
    return c;
  },
  Erymanthian(t) {
    const c = canvas(), p = painter(c);
    // Jabalí gigante de cerdas negras que resopla
    const b = quad(p, t, { col: '#7a5434', shade: '#5a3c20', belly: '#9a6c48', head: 'boar', eye: '#e83030', tailc: '#3a2a1a' });
    for (let i = 0; i < 7; i++) p(6 + i * 4, 16 + b + (i % 2), 3, 5, '#2a1a10');
    if (Math.floor(t * 2) % 2) { p(38, 22 + b, 2, 1, '#e8e8f0'); p(38, 18 + b, 1, 1, '#e8e8f0'); }
    return c;
  },
  'Cretan Bull'(t) {
    const c = canvas(), p = painter(c);
    // Toro blanco salido del mar, resopla vapor
    const b = quad(p, t, { col: '#f4f4f8', shade: '#d8d8e0', belly: '#e8e8f0', head: 'bull', muzzle: '#e8c8c8', horn: '#e8d8b0', tailc: '#c8c8d0' });
    p(36, 21 + b, 1, 1, '#5a3030');
    const st = Math.floor(t * 3) % 3; if (st) { p(39 - st, 23 + b - st, 1, 1, '#c8d8e8'); p(38, 24 + b - st * 2, 2, 1, '#c8d8e8'); }
    p(0, 45, 40, 2, '#4c9cd8');
    return c;
  },
  'Diomedes Mare'(t) {
    const c = canvas(), p = painter(c);
    // Yegua negra carnívora: crin roja, ojos que brillan y dientes afilados
    const b = quad(p, t, { col: '#2a2a34', shade: '#1c1c24', belly: '#3a3a44', head: 'horse', mane: '#c83030', eye: '#ff3030', tailc: '#c83030' });
    if (Math.sin(t * 3) > 0) p(30, 9 + b, 4, 4, '#ff6060');
    p(35, 16 + b, 4, 2, '#5a1a1a'); p(35, 16 + b, 1, 2, '#ffffff'); p(37, 16 + b, 1, 2, '#ffffff');
    return c;
  },
  Khalkotauros(t) {
    const c = canvas(), p = painter(c);
    // Toro de bronce de Hefesto que escupe fuego
    const b = quad(p, t, { col: '#c8883c', shade: '#a8682c', belly: '#e8a858', head: 'bull', muzzle: '#8a5a2c', horn: '#e8b060', eye: '#ffd84a', hoof: '#6a4a2a', tailc: '#8a5a2c' });
    for (const [x, y] of [[9, 23], [15, 23], [21, 23], [9, 28], [21, 28]]) p(x, y + b, 1, 1, '#f0c070');
    p(14, 21 + b, 1, 10, '#8a5a2c');
    fireBreath(p, t, 37, 19 + b);
    return c;
  },
  Cacus(t) {
    const c = canvas(), p = painter(c);
    // Gigante de piel roja que escupe fuego, con piel de bestia y maza
    const b = giant(p, t, { skin: '#c84a3a', shade: '#a83a2a', robe: '#7a5434', belt: '#5a3c20', hair: '#1c1010', beard: '#1c1010', eyes: '#ffd84a', armR: 'up' });
    p(9, 19 + b, 8, 6, '#7a5434');
    p(31, 0 + b, 5, 10, '#6a4a2a'); p(30, -1 + b, 7, 4, '#7a5434');
    const f = Math.floor(t * 8) % 2; p(19, 16 + b, 2, 2, '#ffd84a'); p(18, 18 + b, 4, 2 + f, '#ff7a20'); p(17, 20 + b + f, 6, 2, '#e84a20');
    return c;
  },
  Aethon(t) {
    const c = canvas(), p = painter(c);
    // Caballo del carro del sol: naranja, crin de fuego que ondea
    const b = quad(p, t, { col: '#e8782c', shade: '#c85a1c', belly: '#f8a858', head: 'horse', hoof: '#ffd84a', tailc: '#ff7a20' });
    for (let i = 0; i < 5; i++) flame(p, t, 22 - (i % 2), 6 + b + i * 3, i);
    flame(p, t, 1, 18 + b, 2);
    return c;
  },
  Phlegon(t) {
    const c = canvas(), p = painter(c);
    // Caballo del sol rojo con crin amarilla y pezuñas que dejan llamas
    const b = quad(p, t, { col: '#c83020', shade: '#a82018', belly: '#e85030', head: 'horse', mane: '#ffd84a', hoof: '#ffd84a', tailc: '#ffd84a' });
    [8, 13, 23, 28].forEach((x, i) => flame(p, t, x, 42, i));
    ember(p, t, 6, 30); ember(p, t, 18, 32, 1);
    return c;
  },
  Graeae(t) {
    const c = canvas(), p = painter(c);
    // Tres hermanas grises que comparten un solo ojo
    const b = bob(t);
    p(1, 26 + b, 11, 21 - b, '#6a6a78'); p(28, 26 + b, 11, 21 - b, '#6a6a78');
    head(p, 2, 14 + b, { skin: '#c8b8a8', hair: '#e8e8f0', long: true, eyes: false });
    head(p, 29, 14 + b, { skin: '#c8b8a8', hair: '#e8e8f0', long: true, eyes: false });
    figure(p, t, { robe: '#7a7a88', robeShade: '#5a5a68', dress: true, skin: '#c8b8a8', hair: '#e8e8f0', longHair: true, eyes: '#5a4a4a' });
    p(16, 14 + b, 2, 2, '#5a4a4a'); p(22, 14 + b, 2, 2, '#5a4a4a');
    for (const x of [4, 8, 31, 35]) p(x, 18 + b, 1, 1, '#5a4a4a');
    const who = Math.floor(t * 1.5) % 3, ex = [5, 18, 32][who], ey = who === 1 ? 13 : 17;
    p(ex, ey + b, 4, 3, '#f4f4f8'); p(ex + 1, ey + b, 2, 3, '#3c9cd8'); p(ex + 1, ey + 1 + b, 1, 1, DARK);
    return c;
  },
  Argus(t) {
    const c = canvas(), p = painter(c);
    // Gigante de cien ojos con armadura de bronce: los ojos parpadean por turnos
    const b = giant(p, t, { skin: '#c89870', armor: '#b0783c', armorShade: '#8a5a2c', robe: '#8a5a2c', hair: '#3a2a1a', eyes: '#3c6cb8', armR: 'up' });
    const blink = Math.floor(t * 4) % 6;
    [[12, 22], [18, 21], [24, 22], [14, 28], [22, 28], [6, 24], [31, 13], [6, 30], [18, 34], [32, 26]].forEach(([x, y], i) => {
      if (i % 6 === blink) p(x, y + b + 1, 3, 1, '#5a3c20');
      else { p(x, y + b, 3, 3, '#f4f4f8'); p(x + 1, y + 1 + b, 1, 1, '#3c6cb8'); }
    });
    p(31, -1 + b, 5, 9, '#6a4a2a');
    return c;
  },
  Python(t) {
    const c = canvas(), p = painter(c);
    // Serpiente gigante de Delfos enroscada sobre la roca del oráculo
    p(4, 42, 32, 5, '#7a7a8a'); p(6, 41, 8, 1, '#9a9aaa');
    p(5, 31, 30, 11, '#6c7c2c'); p(8, 27, 24, 6, '#7c8c3c'); p(10, 34, 20, 5, '#d8c88c');
    for (let i = 0; i < 7; i++) p(6 + i * 4, 31 + (i % 2) * 2, 2, 2, '#4c5c1c');
    p(16, 14, 8, 15, '#7c8c3c'); p(18, 16, 4, 13, '#d8c88c');
    const s = Math.round(Math.sin(t * 2) * 2);
    p(12 + s, 4, 18, 11, '#7c8c3c'); p(26 + s, 8, 6, 6, '#7c8c3c'); p(17 + s, 7, 3, 3, '#ffd84a'); p(18 + s, 8, 1, 2, DARK);
    p(26 + s, 13, 6, 1, '#4c5c1c');
    if (Math.floor(t * 3) % 3 === 0) { p(32 + s, 11, 3, 1, '#e83030'); p(34 + s, 10, 1, 3, '#e83030'); }
    return c;
  },
  Sphinx(t) {
    const c = canvas(), p = painter(c);
    // Esfinge griega: cuerpo de león, alas doradas y cara de mujer
    const flap = Math.floor(t * 2) % 2;
    const b = quad(p, t, { col: '#d8b070', shade: '#b8904c', belly: '#e8c890', head: 'none', tailc: '#a8804c' });
    p(1, 30 + b, 3, 3, '#6a4a2a');
    p(25, 14 + b, 9, 10, '#d8b070');
    p(26, 6 + b, 11, 11, '#e8b890'); p(25, 4 + b, 13, 4, '#1c1010'); p(25, 6 + b, 3, 14, '#1c1010');
    p(29, 10 + b, 2, 2, DARK); p(34, 10 + b, 2, 2, DARK); p(31, 14 + b, 3, 1, '#a85050'); p(27, 4 + b, 10, 1, '#d8a030');
    sideWing(p, 22, 22 + b, '#d8a030', '#ffe080', flap, -1, 7);
    return c;
  },
  Empusa(t) {
    const c = canvas(), p = painter(c);
    // Espectro de Hécate: pelo de fuego, colmillos y una pierna de bronce
    const b = figure(p, t, { robe: '#1c1c28', robeShade: '#101018', skin: '#e8e0e8', eyes: '#ff3030', legs: '#e8e0e8', shoe: '#2a2a34' });
    p(21, 40, 5, 6, '#c8883c'); p(21, 45, 6, 2, '#8a5a2c');
    for (let i = 0; i < 5; i++) flame(p, t, 12 + i * 3, 4 + b + (i % 2) * 2, i);
    p(12, 9 + b, 16, 3, '#ff7a20'); p(12, 10 + b, 2, 10, '#ff7a20'); p(26, 10 + b, 2, 10, '#ff7a20');
    p(18, 18 + b, 1, 2, '#ffffff'); p(21, 18 + b, 1, 2, '#ffffff');
    return c;
  },
  Lamia(t) {
    const c = canvas(), p = painter(c);
    // Mujer con cola de serpiente enroscada y colmillos
    const b = figure(p, t, { robe: '#7c3cb0', robeShade: '#5c2c90', skin: '#e8c8b0', hair: '#1c1010', longHair: true, eyes: '#ffd84a' });
    c.getContext('2d').clearRect(12, 38, 16, 10);
    const w = Math.round(Math.sin(t * 2.5) * 2);
    p(12, 34 + b, 16, 6, '#3c8c3c'); p(8, 39, 26, 7, '#3c8c3c'); p(10, 42, 20, 3, '#a8d860');
    p(32, 36 + w, 5, 5, '#3c8c3c'); p(36, 33 + w, 3, 4, '#3c8c3c'); for (let i = 0; i < 6; i++) p(9 + i * 4, 40, 2, 1, '#2c6c2c');
    p(18, 18 + b, 1, 2, '#ffffff'); p(21, 18 + b, 1, 2, '#ffffff');
    return c;
  },
  Ker(t) {
    const c = canvas(), p = painter(c);
    // Espíritu de la muerte violenta: alas negras, garras rojas, colmillos
    const flap = Math.floor(t * 4) % 2;
    wings(p, 12 + bob(t), '#1c1c24', '#3a2a3a', flap, 10);
    const b = figure(p, t, { robe: '#2a1a24', robeShade: '#1c1018', dress: true, skin: '#e0d8e0', hair: '#1c1010', longHair: true, eyes: '#ff3030' });
    p(9, 34 + b, 4, 3, '#c82020'); p(27, 34 + b, 4, 3, '#c82020'); p(9, 37 + b, 1, 2, '#c82020'); p(30, 37 + b, 1, 2, '#c82020');
    p(18, 18 + b, 1, 2, '#ffffff'); p(21, 18 + b, 1, 2, '#ffffff'); p(18, 20 + b, 4, 1, '#a82020');
    return c;
  },
  Vrykolakas(t) {
    const c = canvas(), p = painter(c);
    // No-muerto que sale de su tumba: capa negra, colmillos y niebla
    const b = figure(p, t, { robe: '#1c1c28', robeShade: '#101018', dress: true, skin: '#c8d0c8', hair: '#101018', eyes: '#ff3030', trim: '#5a1a2a' });
    p(10, 22 + b, 3, 16, '#3a1020'); p(27, 22 + b, 3, 16, '#3a1020'); p(11, 21 + b, 18, 3, '#1c1c28'); p(10, 18 + b, 3, 4, '#1c1c28'); p(27, 18 + b, 3, 4, '#1c1c28');
    p(18, 18 + b, 1, 2, '#ffffff'); p(21, 18 + b, 1, 2, '#ffffff');
    p(0, 42, 10, 5, '#5a5a6a'); p(2, 36, 6, 6, '#6a6a7a'); p(4, 38, 2, 3, '#4a4a5a');
    const m = (t * 4) % 40; p(m, 44, 8, 2, '#c8c8d8'); p((m + 20) % 40, 45, 6, 2, '#a8a8b8');
    return c;
  },

  // ---------- Griegas: raras ----------
  Ladon(t) {
    const c = canvas(), p = painter(c);
    // Dragón de tres cabezas que guarda las manzanas de oro
    p(0, 2, 12, 22, '#3c8c3c'); p(4, 22, 3, 24, '#6a4a2a'); p(2, 0, 8, 4, '#4c9c4c');
    for (const [x, y] of [[2, 6], [7, 10], [3, 15], [8, 18]]) { p(x, y, 3, 3, '#ffd84a'); p(x + 1, y - 1, 1, 1, '#5a3c20'); }
    twinkle(p, t, 9, 9, '#ffffff');
    p(8, 34, 30, 12, '#3c8c3c'); p(10, 32, 26, 4, '#4c9c4c'); p(12, 40, 22, 4, '#d8c050');
    for (let i = 0; i < 6; i++) p(11 + i * 4, 33, 2, 2, '#2c6c2c');
    const s = Math.round(Math.sin(t * 2));
    neck(p, 20, 32, 15, 14 + s, '#3c8c3c'); neck(p, 24, 32, 25, 6 - s, '#3c8c3c'); neck(p, 28, 32, 32, 18 + s, '#3c8c3c');
    snakeHead(p, t, 13, 10 + s, '#4c9c4c', '#d8c050', '#ff3030', 1, 0);
    snakeHead(p, t, 23, 2 - s, '#4c9c4c', '#d8c050', '#ff3030', 1, 1);
    snakeHead(p, t, 30, 14 + s, '#4c9c4c', '#d8c050', '#ff3030', 1, 2);
    return c;
  },
  Campe(t) {
    const c = canvas(), p = painter(c);
    // Carcelera del Tártaro: mujer de piel verde con pelo de serpientes, alas de murciélago y cuerpo de escorpión
    const flap = Math.floor(t * 4) % 2;
    for (const d of [-1, 1]) for (let i = 0; i < 4; i++) p(d < 0 ? 1 + i * 2 : 27, 10 + i * 3 + flap * 2, 12 - i * 3, 3, '#2a1a24');
    const tl = Math.floor(t * 3) % 2;
    p(3, 30, 4, 10, '#1c1c24'); p(2, 22 - tl, 4, 9, '#1c1c24'); p(4, 18 - tl, 5, 4, '#1c1c24'); p(8, 19 - tl, 2, 3, '#c83030');
    const b = figure(p, t, { robe: '#1c1c24', robeShade: '#101018', skin: '#7cac5c', eyes: '#ffd84a' });
    c.getContext('2d').clearRect(12, 39, 16, 9);
    p(6, 36, 28, 7, '#2a2a34'); p(8, 34, 24, 3, '#3a3a44');
    for (let i = 0; i < 4; i++) { p(6 + i * 3, 43, 2, 4, '#2a2a34'); p(26 + i * 3, 43, 2, 4, '#2a2a34'); }
    const sw = Math.floor(t * 4) % 2;
    for (let i = 0; i < 5; i++) { const x = 12 + i * 4; p(x, 6 + b - ((i + sw) % 2) * 2, 2, 5, '#3c8c3c'); p(x - 1, 5 + b - ((i + sw) % 2) * 2, 3, 2, '#5cac4c'); }
    return c;
  },
  Echidna(t) {
    const c = canvas(), p = painter(c);
    // Madre de los monstruos: mitad mujer, mitad serpiente de grandes anillos
    const w = Math.round(Math.sin(t * 2) * 2);
    p(0, 36, 40, 10, '#5c6c2c'); p(2, 32, 20, 6, '#6c7c3c'); p(4, 40, 32, 3, '#c8b860');
    for (let i = 0; i < 9; i++) p(1 + i * 4, 37 + (i % 2) * 2, 2, 2, '#3c4c1c');
    p(32, 30 + w, 6, 7, '#6c7c3c'); p(35, 26 + w, 4, 5, '#6c7c3c');
    const b = figure(p, t, { robe: '#3c8c4c', robeShade: '#2c6c3c', skin: '#d8c0a0', hair: '#1c1010', longHair: true, eyes: '#ffd84a' });
    p(12, 34 + b, 16, 6, '#6c7c3c'); p(14, 36 + b, 12, 2, '#c8b860');
    p(18, 18 + b, 1, 2, '#ffffff'); p(21, 18 + b, 1, 2, '#ffffff');
    return c;
  },
  Medusa(t) {
    const c = canvas(), p = painter(c);
    // Gorgona: serpientes por pelo que se retuercen y mirada que convierte en piedra
    const b = figure(p, t, { robe: '#7c3cb0', robeShade: '#5c2c90', dress: true, skin: '#c8d8a8', eyes: '#ffd84a', belt: '#d8a030' });
    const sw = Math.floor(t * 4) % 2;
    [[10, 12], [11, 6], [15, 3], [20, 2], [25, 4], [28, 9], [29, 14]].forEach(([x, y], i) => {
      const o = (i + sw) % 2;
      p(x, y + b + o, 3, 6, i % 2 ? '#3c8c3c' : '#4c9c4c'); p(x - 1 + (i < 3 ? 0 : 1), y + b - 2 + o, 3, 3, '#5cac4c'); p(x + (i < 3 ? 0 : 1), y + b - 1 + o, 1, 1, '#ff3030');
    });
    p(13, 8 + b, 14, 4, '#3c8c3c');
    if (Math.sin(t * 3) > 0) { p(15, 13 + b, 4, 4, '#fff07a'); p(21, 13 + b, 4, 4, '#fff07a'); }
    p(32, 38, 6, 8, '#9a9aa8'); p(33, 34, 4, 4, '#9a9aa8'); p(34, 36, 1, 1, '#6a6a78');
    return c;
  },
  Scylla(t) {
    const c = canvas(), p = painter(c);
    // Mujer sobre tentáculos con cabezas de perro que asoman de su cintura
    const w = Math.floor(t * 3) % 2;
    for (let i = 0; i < 6; i++) { const x = 3 + i * 6; p(x, 36, 4, 8, '#2c8c8c'); p(x + (i % 2 ? 2 : -2) * (w ? 1 : -1), 43, 4, 3, '#2c8c8c'); p(x + 1, 38, 2, 1, '#8ce0d0'); }
    const b = figure(p, t, { robe: '#2c9c9c', robeShade: '#1c7c7c', skin: '#c8a888', hair: '#1c1010', longHair: true, eyes: '#ffd84a' });
    c.getContext('2d').clearRect(12, 40, 16, 4);
    p(10, 33 + b, 20, 6, '#2c8c8c');
    dogHead(p, t, 0, 24 + b, '#5a5a6a', '#ff3030', 0);
    p(28, 28 + b, 9, 8, '#5a5a6a'); p(36, 31 + b, 3, 4, '#5a5a6a'); p(33, 30 + b, 2, 2, '#ff3030'); p(28, 25 + b, 3, 4, '#5a5a6a');
    p(0, 46, 40, 2, '#2c6cb8');
    return c;
  },
  Charybdis(t) {
    const c = canvas(), p = painter(c);
    // Remolino que se traga el mar: anillos que giran y una boca con dientes en el centro
    const r = Math.floor(t * 6);
    for (let k = 0; k < 4; k++) {
      const rx = 19 - k * 4, ry = 12 - k * 3, cy = 30;
      for (let a = 0; a < 16; a++) {
        const ang = (a / 16) * Math.PI * 2 + (r + k) * 0.4 * (k % 2 ? -1 : 1);
        p(20 + Math.round(Math.cos(ang) * rx) - 1, cy + Math.round(Math.sin(ang) * ry), 3, 2, a % 4 === 0 ? '#e8f8ff' : ['#2c5cb8', '#2c4c9c', '#1c3c8c', '#1c2c6c'][k]);
      }
    }
    p(13, 26, 14, 9, '#1c0c1c'); p(15, 25, 10, 1, '#1c0c1c');
    for (let i = 0; i < 5; i++) { p(14 + i * 3, 26, 2, 2, '#f4f4e8'); p(15 + i * 3, 33, 2, 2, '#f4f4e8'); }
    const op = Math.floor(t * 2) % 2; p(17, 29 - op, 6, 1 + op * 2, '#5a1020');
    for (let i = 0; i < 3; i++) p(4 + i * 12 + r % 4, 6 + ((r + i * 3) % 8), 3, 1, '#a8e0ff');
    return c;
  },
  Hydra(t) {
    const c = canvas(), p = painter(c);
    // Hidra de siete cabezas sobre su pantano
    p(0, 44, 40, 4, '#3c5c3c');
    p(6, 30, 28, 14, '#3c8c3c'); p(9, 28, 22, 4, '#4c9c4c'); p(10, 36, 20, 6, '#a8d860');
    p(3, 38, 6, 4, '#3c8c3c'); p(0, 40, 4, 3, '#3c8c3c');
    const s = Math.floor(t * 3) % 2;
    const hs = [];
    for (let i = 0; i < 7; i++) {
      const a = Math.PI * (1.04 + i * 0.153);
      hs.push([17 + Math.round(Math.cos(a) * 18), 30 + Math.round(Math.sin(a) * (i % 2 ? 26 : 19)) + ((i + s) % 2)]);
    }
    hs.forEach(([hx, hy]) => neck(p, 18, 30, hx + 2, hy + 4, '#2c6c2c', 6, 3));
    hs.forEach(([hx, hy], i) => snakeHead(p, t, hx, hy, '#7cc85c', '#d8e870', '#ff3030', i < 3 ? -1 : 1, i));
    return c;
  },
  Ketos(t) {
    const c = canvas(), p = painter(c);
    // Monstruo marino que surge de las olas con las fauces abiertas
    const w = Math.round(Math.sin(t * 2.5) * 1.5);
    const op = Math.floor(t * 2) % 2;
    p(0, 20, 6, 6, '#2c8c8c'); p(0, 16, 4, 5, '#c83030'); p(3, 14, 3, 4, '#c83030');
    p(4, 26, 14, 14, '#2c8c8c'); p(8, 28, 8, 8, '#e8c8a0');
    p(14, 10, 22, 22, '#2c8c8c'); p(18, 6, 4, 6, '#c83030'); p(24, 4, 4, 7, '#c83030'); p(30, 6, 3, 5, '#c83030');
    p(16, 24 + op, 22, 6, '#2c8c8c'); p(20, 18, 19, 6 + op, '#5a1020');
    for (let i = 0; i < 6; i++) { p(20 + i * 3, 18, 2, 2, '#f4f4e8'); p(21 + i * 3, 22 + op, 2, 2, '#f4f4e8'); }
    p(22, 13, 4, 3, '#ffd84a'); p(23, 13, 2, 2, '#c83030');
    p(0, 38 + w, 40, 10, '#2c6cb8'); p(2, 36 + w, 10, 2, '#a8e0ff'); p(22, 37 - w, 14, 2, '#a8e0ff');
    return c;
  },
  Chimera(t) {
    const c = canvas(), p = painter(c);
    // Quimera: león que escupe fuego, cabeza de cabra en el lomo y cola de serpiente
    const b = quad(p, t, { col: '#d8a038', shade: '#b8802c', belly: '#e8c070', head: 'lion', mane: '#a8682c', eye: '#e83030', tail: false });
    const s = Math.round(Math.sin(t * 2));
    p(2, 24 + b, 4, 4, '#3c8c3c'); p(0, 16 + b, 4, 9, '#3c8c3c'); snakeHead(p, t, 0, 10 + b + s, '#4c9c4c', '#a8d860', '#ffd84a', 1, 1);
    p(14, 12 + b, 6, 9, '#e8e0d0'); p(12, 6 + b, 8, 8, '#e8e0d0'); p(10, 2 + b, 2, 6, '#8a7a6a'); p(17, 2 + b, 2, 6, '#8a7a6a'); p(9, 1 + b, 2, 2, '#8a7a6a'); p(18, 1 + b, 2, 2, '#8a7a6a');
    p(14, 9 + b, 2, 1, '#ffd84a'); p(12, 13 + b, 3, 4, '#c8c0b0');
    fireBreath(p, t, 37, 17 + b);
    return c;
  },
  Orthrus(t) {
    const c = canvas(), p = painter(c);
    // Perro de dos cabezas con cola de serpiente
    const b = quad(p, t, { col: '#2a2a34', shade: '#1c1c24', belly: '#3a3a44', head: 'none', tail: false });
    p(2, 24 + b, 4, 4, '#3c6c3c'); p(0, 16 + b, 4, 9, '#3c6c3c'); snakeHead(p, t, 0, 10 + b, '#4c8c4c', '#a8d860', '#ffd84a', 1, 2);
    p(24, 14 + b, 8, 10, '#2a2a34');
    dogHead(p, t, 22, 4 + b, '#3a3a44', '#ff3030', 0);
    dogHead(p, t, 27, 12 + b, '#2a2a34', '#ff3030', 1);
    return c;
  },
  Cerberus(t) {
    const c = canvas(), p = painter(c);
    // Perro de tres cabezas guardián del inframundo, entre llamas
    flame(p, t, 2, 40); flame(p, t, 35, 41, 1); flame(p, t, 18, 42, 2);
    const b = quad(p, t, { col: '#2a2a34', shade: '#1c1c24', belly: '#3a3a44', head: 'none', tail: false });
    p(2, 24 + b, 4, 4, '#3c6c3c'); p(0, 16 + b, 4, 9, '#3c6c3c'); snakeHead(p, t, 0, 10 + b, '#4c8c4c', '#a8d860', '#ffd84a', 1, 2);
    p(22, 12 + b, 10, 12, '#2a2a34');
    dogHead(p, t, 17, 6 + b, '#3a3a44', '#ff3030', 0);
    dogHead(p, t, 25, 1 + b, '#33333d', '#ff3030', 1);
    dogHead(p, t, 27, 13 + b, '#2a2a34', '#ff3030', 2);
    p(22, 22 + b, 10, 2, '#c83030'); p(26, 24 + b, 2, 2, '#d8a030');
    return c;
  },
  Minotaur(t) {
    const c = canvas(), p = painter(c);
    // Hombre-toro del laberinto con hacha doble
    const b = giant(p, t, { skin: '#a87850', shade: '#8a5c38', robe: '#a82020', belt: '#5a1a10', armR: 'up' });
    p(12, 4 + b, 16, 16, '#5a3c20'); p(15, 13 + b, 10, 7, '#7a5434'); p(17, 17 + b, 2, 1, DARK); p(21, 17 + b, 2, 1, DARK);
    p(15, 9 + b, 2, 2, '#ff3030'); p(23, 9 + b, 2, 2, '#ff3030');
    p(7, 3 + b, 6, 3, '#e8d8b0'); p(6, 0 + b, 3, 4, '#e8d8b0'); p(27, 3 + b, 6, 3, '#e8d8b0'); p(31, 0 + b, 3, 4, '#e8d8b0');
    p(18, 19 + b, 4, 2, '#d8a030');
    if (Math.floor(t * 2) % 2) { p(13, 18 + b, 2, 1, '#e8e8f0'); p(25, 18 + b, 2, 1, '#e8e8f0'); }
    p(32, 0 + b, 2, 22, '#6a4a2a'); p(34, 1 + b, 5, 7, '#a8a8b8'); p(27, 1 + b, 5, 7, '#a8a8b8'); p(35, 2 + b, 2, 5, '#d8d8e0');
    return c;
  },
  Cyclops(t) {
    const c = canvas(), p = painter(c);
    // Gigante de un solo ojo con maza, que parpadea
    const b = giant(p, t, { skin: '#c89870', robe: '#7a5434', hair: '#1c1010', beard: '#1c1010', oneEye: true, eyes: '#3c6cb8', armR: 'up' });
    if (Math.floor(t * 4) % 6 === 0) p(16, 9 + b, 8, 5, '#c89870');
    p(31, -1 + b, 5, 12, '#6a4a2a'); p(30, -2 + b, 7, 5, '#7a5434'); p(32, 0 + b, 1, 1, '#3a2a1a');
    return c;
  },
  Arges(t) {
    const c = canvas(), p = painter(c);
    // Cíclope del resplandor, de pelo rojo encrespado, con el rayo recién forjado
    const b = giant(p, t, { skin: '#e0b088', robe: '#7a5434', hair: '#c83020', wild: true, oneEye: true, eyes: '#ffd84a', armR: 'up' });
    const f = Math.floor(t * 6) % 2;
    p(32, 0 + b, 3, 4, '#fff07a'); p(30, 3 + b, 3, 4, '#fff07a'); p(32, 6 + b, 3, 4, '#fff07a');
    if (f) { p(29, -1 + b, 1, 1, '#ffffff'); p(37, 5 + b, 1, 1, '#ffffff'); p(28, 9 + b, 1, 1, '#ffffff'); }
    twinkle(p, t, 6, 6, '#fff07a');
    return c;
  },
  Steropes(t) {
    const c = canvas(), p = painter(c);
    // Cíclope del relámpago: rayos azulados en la mano
    const b = giant(p, t, { skin: '#d8a880', robe: '#2c3c7c', belt: '#1c2c5c', hair: '#1c1010', oneEye: true, eyes: '#5ca0f0', armR: 'up' });
    const f = Math.floor(t * 6) % 3;
    p(32, 0 + b, 2, 4, '#a8e0ff'); p(30, 3 + b, 3, 3, '#a8e0ff'); p(32, 5 + b, 2, 4, '#a8e0ff');
    if (f === 0) { p(2, 0, 2, 5, '#c8f0ff'); p(4, 4, 2, 5, '#c8f0ff'); p(2, 8, 2, 4, '#c8f0ff'); }
    return c;
  },
  Brontes(t) {
    const c = canvas(), p = painter(c);
    // Cíclope del trueno: barba gris y martillo que retumba
    const b = giant(p, t, { skin: '#c89870', robe: '#5a5a6a', belt: '#3a3a4a', hair: '#8a8a98', beard: '#8a8a98', oneEye: true, eyes: '#3c6cb8', armR: 'up' });
    const up = Math.floor(t * 3) % 2;
    p(32, (up ? 0 : 4) + b, 2, 12, '#6a4a2a'); p(29, (up ? -2 : 2) + b, 8, 5, '#6a6a7a');
    if (!up) for (let i = 0; i < 3; i++) p(4 + i * 12, 2 + i, 6, 2, '#5a5a6a');
    return c;
  },
  Antaeus(t) {
    const c = canvas(), p = painter(c);
    // Luchador gigante que saca su fuerza de la tierra: piedras que suben a él
    const b = giant(p, t, { skin: '#b07c50', shade: '#8a5c38', robe: '#7a5434', hair: '#1c1010', beard: '#1c1010' });
    p(0, 44, 40, 4, '#7a5a3c'); p(0, 43, 12, 1, '#8a6a4c'); p(28, 43, 12, 1, '#8a6a4c');
    for (let k = 0; k < 3; k++) { const y = 44 - ((t * 10 + k * 7) % 22); p(2 + k * 15 + (k === 2 ? 4 : 0), y, 3, 2, '#9a7a5a'); }
    p(4, 31 + b, 6, 6, '#b07c50'); p(30, 31 + b, 6, 6, '#b07c50');
    return c;
  },
  Geryon(t) {
    const c = canvas(), p = painter(c);
    // Guerrero de tres cuerpos: tres cabezas con casco, armadura roja, lanza y escudo
    const b = giant(p, t, { skin: '#d8b090', armor: '#a82020', armorShade: '#7c1818', robe: '#7c1818', belt: '#c8883c', armR: 'up' });
    p(13, 3 + b, 14, 6, '#c8883c'); p(19, 0 + b, 2, 4, '#c83030');
    head(p, 3, 8 + b, { skin: '#d8b090' }); p(2, 6 + b, 11, 4, '#c8883c');
    head(p, 28, 8 + b, { skin: '#d8b090' }); p(27, 6 + b, 11, 4, '#c8883c');
    p(2, 22 + b, 10, 13, '#c8883c'); p(4, 24 + b, 6, 9, '#a8682c'); p(6, 27 + b, 2, 3, '#ffd84a');
    p(32, -2 + b, 2, 46, '#6a4a2a'); p(31, -3 + b, 4, 4, '#c8c8d8');
    return c;
  },
  Briareus(t) {
    const c = canvas(), p = painter(c);
    // Hecatónquiro de pelo negro encrespado y piel bronceada
    hundredHanded(p, t, { skin: '#c89870', shade: '#a87850', robe: '#5a5a6a', hair: '#1c1010', wild: true });
    return c;
  },
  Cottus(t) {
    const c = canvas(), p = painter(c);
    // Hecatónquiro de pelo castaño: lanza piedras con sus cien manos
    const b = hundredHanded(p, t, { skin: '#e0b890', shade: '#c09870', robe: '#7a5434', hair: '#6a4a2a' });
    const y = (t * 20) % 16; p(1, 4 - y + 8, 4, 3, '#8a8a98'); p(35, 10 - y + 6, 4, 3, '#8a8a98');
    return c;
  },
  Gyges(t) {
    const c = canvas(), p = painter(c);
    // Hecatónquiro de piel oscura y pelo gris
    const b = hundredHanded(p, t, { skin: '#8a6040', shade: '#6a4428', robe: '#3c4c5c', hair: '#a8a8b0', wild: true, eyes: '#ffd84a' });
    return c;
  },
  Talos(t) {
    const c = canvas(), p = painter(c);
    // Autómata de bronce con una sola vena de icor que le baja hasta el tobillo
    const b = giant(p, t, { skin: '#c8883c', shade: '#a8682c', armor: '#c8883c', armorShade: '#a8682c', legs: '#c8883c', shoe: '#8a5a2c', eyes: '#ff3030' });
    p(13, 3 + b, 14, 7, '#a8682c'); p(12, 6 + b, 16, 2, '#8a5a2c'); p(19, 0 + b, 2, 4, '#c83030');
    if (Math.sin(t * 3) > 0) { p(15, 10 + b, 4, 4, '#ff6060'); p(21, 10 + b, 4, 4, '#ff6060'); }
    for (const [x, y] of [[11, 22], [27, 22], [11, 30], [27, 30]]) p(x, y + b, 1, 1, '#f0c070');
    p(19, 22 + b, 2, 14, '#8a5a2c');
    const pulse = Math.floor(t * 4) % 4;
    p(24, 38, 1, 8, '#e8b030'); p(24, 38 + pulse * 2, 1, 2, '#fff07a'); p(23, 45, 3, 1, '#6a6a7a');
    return c;
  },
  Lycanthrope(t) {
    const c = canvas(), p = painter(c);
    // Hombre lobo bajo la luna llena, con garras
    disc(p, 32, 7, 6, '#f4f0d8'); p(30, 5, 2, 2, '#d8d4b8'); p(34, 9, 2, 1, '#d8d4b8');
    const b = figure(p, t, { robe: '#6a6a78', robeShade: '#4a4a58', skin: '#6a6a78', eyes: '#ffd84a', legs: '#6a6a78', shoe: '#3a3a44', armL: 'up', armR: 'up' });
    p(12, 22 + b, 16, 6, '#8a8a98'); p(13, 38 + b, 14, 3, '#3a3a44');
    p(14, 8 + b, 12, 13, '#7a7a88'); p(24, 13 + b, 7, 6, '#7a7a88'); p(30, 13 + b, 1, 2, DARK);
    p(14, 3 + b, 3, 6, '#6a6a78'); p(22, 3 + b, 3, 6, '#6a6a78'); p(20, 11 + b, 2, 2, '#ffd84a');
    p(25, 18 + b, 6, 2, '#3a1a1a'); p(26, 18 + b, 1, 2, '#ffffff'); p(29, 18 + b, 1, 2, '#ffffff');
    for (const x of [9, 12, 27, 30]) p(x, 11 + b, 1, 3, '#f4f4e8');
    if (Math.floor(t * 2) % 3 === 0) { p(31, 15 + b, 2, 1, '#c8c8d8'); p(33, 13 + b, 2, 1, '#c8c8d8'); }
    return c;
  },
  Phoenix(t) {
    const c = canvas(), p = painter(c);
    // Ave de fuego que renace de sus cenizas: cresta, cola larga y brasas
    const b = bird(p, t, { col: '#e84a20', wing: '#ff7a20', wing2: '#ffd84a', belly: '#ff9c30', tail: '#ffd84a', beak: '#ffd84a', eye: '#ffd84a', leg: '#c8883c' });
    p(0, 30 + b, 6, 3, '#ff7a20'); p(0, 33 + b, 4, 6, '#e84a20'); p(2, 38 + b, 4, 6, '#ffd84a');
    for (let i = 0; i < 3; i++) flame(p, t, 25 + i * 3, 4 + b - (i % 2), i);
    for (let k = 0; k < 4; k++) ember(p, t, 6 + k * 9, 46, k);
    p(8, 44, 24, 3, '#5a5a6a'); p(12, 43, 16, 1, '#7a7a8a');
    return c;
  },

  // ---------- Nórdicas: comunes ----------
  Tomte(t) {
    const c = canvas(), p = painter(c);
    // Duende de la granja con gorro rojo, barba blanca y farol
    const b = dwarf(p, t, { robe: '#7a7a88', robeShade: '#5a5a68', belt: '#3a2a1a', hair: '#e8e8f0', beard: '#f4f4f8' });
    p(13, 10 + b, 14, 6, '#c83030'); p(15, 6 + b, 9, 5, '#c83030'); p(21, 3 + b, 4, 4, '#a82020'); p(24, 2 + b, 2, 2, '#f4f4f8');
    p(30, 32 + b, 5, 7, '#3a3a44'); p(31, 33 + b, 3, 5, Math.sin(t * 5) > 0 ? '#ffd84a' : '#ffb030'); p(32, 30 + b, 1, 2, '#3a3a44');
    flake(p, t, 4); flake(p, t, 36, 2);
    return c;
  },
  Ratatosk(t) {
    const c = canvas(), p = painter(c);
    // Ardilla mensajera que sube y baja por el fresno del mundo
    p(30, 0, 8, 48, '#7a5434'); p(31, 0, 2, 48, '#5a3c20'); p(14, 30, 16, 4, '#7a5434');
    const y = Math.round(Math.sin(t * 2) * 2);
    p(2, 10 + y, 8, 16, '#c86a30'); p(0, 6 + y, 8, 8, '#c86a30'); p(4, 4 + y, 4, 4, '#e08a4c');
    p(8, 18 + y, 12, 12, '#b85a20'); p(10, 22 + y, 7, 8, '#e8c8a0');
    p(16, 12 + y, 10, 9, '#c86a30'); p(17, 9 + y, 3, 4, '#c86a30'); p(23, 15 + y, 3, 3, '#c86a30');
    p(20, 14 + y, 2, 2, DARK); p(25, 16 + y, 1, 1, DARK);
    p(10, 30, 3, 2, '#8a4a20'); p(17, 30, 3, 2, '#8a4a20'); p(20, 22 + y, 4, 2, '#c86a30');
    if (Math.floor(t * 2) % 2) { p(22, 6, 5, 4, '#f4e8c8'); p(23, 7, 3, 1, '#7a6a5a'); }
    return c;
  },
  Heidrun(t) {
    const c = canvas(), p = painter(c);
    // Cabra que da hidromiel en lugar de leche, comiendo hojas del árbol
    p(28, 0, 12, 6, '#4c9c3c'); p(32, 4, 6, 4, '#5cac4c');
    const b = quad(p, t, { col: '#f4f4f8', shade: '#d8d8e0', belly: '#e8e8f0', head: 'goat', horn: '#a8987c', beard: '#d8d8e0', tailc: '#e8e8f0' });
    p(16, 33 + b, 6, 3, '#e8b8b8');
    const d = (t * 10) % 10; p(18, 36 + d, 1, 2, '#e8b030'); p(14, 45, 10, 2, '#e8b030');
    return c;
  },
  Eikthyrnir(t) {
    const c = canvas(), p = painter(c);
    // Ciervo de cuyas astas gotean los ríos del mundo
    const b = quad(p, t, { col: '#8a5a30', shade: '#6a4220', belly: '#c8a070', head: 'deer', hoof: '#3a2a1a', tailc: '#e8d8b0' });
    const hc = '#e8d8b0';
    p(27, 0 + b, 2, 8, hc); p(24, 2 + b, 3, 2, hc); p(23, 0 + b, 2, 3, hc); p(29, 2 + b, 4, 2, hc); p(32, 0 + b, 2, 3, hc); p(30, 0 + b, 1, 2, hc);
    for (const [x, k] of [[23, 0], [33, 1], [27, 2]]) p(x, 4 + ((t * 14 + k * 5) % 14), 1, 2, '#78c0ff');
    return c;
  },
  Tanngrisnir(t) {
    const c = canvas(), p = painter(c);
    // Cabra gris del carro de Thor, con chispas en los cuernos
    const b = quad(p, t, { col: '#8a8a98', shade: '#6a6a78', belly: '#a8a8b8', head: 'goat', horn: '#d8d0b8', beard: '#5a5a68', tailc: '#5a5a68' });
    if (Math.floor(t * 6) % 3 === 0) { p(22, 1 + b, 1, 3, '#fff07a'); p(21, 3 + b, 1, 2, '#fff07a'); }
    p(4, 40, 3, 4, '#8a5a30');
    return c;
  },
  Vedrfolnir(t) {
    const c = canvas(), p = painter(c);
    // Halcón que vive entre los ojos del águila de Yggdrasil, agitado por el viento
    const b = bird(p, t, { col: '#8a8a98', wing: '#5a6a7c', wing2: '#a8b8c8', belly: '#c8c8d8', beak: '#e8b030', leg: '#e8b030', eye: '#ffd84a' });
    p(24, 8 + b, 12, 3, '#5a6a7c'); p(33, 12 + b, 2, 2, '#f4f4f8');
    p(2, 44, 36, 3, '#7a5434');
    const w = (t * 30) % 40; p(w, 4, 7, 1, '#c8d8e8');
    return c;
  },
  Nacken(t) {
    const c = canvas(), p = painter(c);
    // Espíritu del agua que toca el violín, medio sumergido
    const b = figure(p, t, { robe: '#e0e8e0', robeShade: '#c0c8c0', skin: '#e0e8e0', hair: '#3c8c4c', longHair: true, eyes: '#2c9c8c', armR: 'up' });
    const w = Math.round(Math.sin(t * 2.5));
    p(0, 34 + w, 40, 14, '#2c8cb8'); p(2, 33 + w, 10, 2, '#a8e0ff'); p(26, 33 - w, 12, 2, '#a8e0ff');
    p(26, 20 + b, 6, 9, '#8a5a30'); p(27, 22 + b, 4, 5, '#a8784c'); p(28, 13 + b, 2, 8, '#5a3c20');
    const bow = Math.floor(t * 4) % 2; p(20 + bow * 2, 18 + b, 14, 1, '#d8c8a8');
    const n = (t * 8) % 14; p(4, 24 - n, 2, 2, '#ffffff'); p(6, 20 - n, 1, 4, '#ffffff');
    return c;
  },
  Havfrue(t) {
    const c = canvas(), p = painter(c);
    // Sirena nórdica de pelo de oro y cola azul
    const b = figure(p, t, { robe: '#f4f4f8', robeShade: '#d8d8e8', hair: '#e8b830', longHair: true, eyes: '#3c6cd8' });
    merTail(p, t, b, '#2c5cb8', '#78b0f0');
    p(0, 46, 40, 2, '#2c6cb8'); bubble(p, t, 36, 30);
    return c;
  },
  Elf(t) {
    const c = canvas(), p = painter(c);
    // Elfo de la luz: orejas puntiagudas, pelo dorado y arco, entre destellos
    const b = figure(p, t, { robe: '#3c9c4c', robeShade: '#2c7c3c', belt: '#d8a030', hair: '#e8c040', longHair: true, eyes: '#5cd870', legs: '#2c5c2c', shoe: '#5a3c20' });
    p(11, 12 + b, 3, 2, SKIN); p(9, 10 + b, 3, 2, SKIN); p(26, 12 + b, 3, 2, SKIN); p(28, 10 + b, 3, 2, SKIN);
    p(31, 14 + b, 2, 24, '#c8a040'); p(30, 13 + b, 2, 2, '#c8a040'); p(30, 37 + b, 2, 2, '#c8a040'); p(29, 15 + b, 1, 22, '#e8e0d0');
    twinkle(p, t, 5, 8, '#fff8b0'); twinkle(p, t + 0.5, 35, 4, '#fff8b0');
    return c;
  },
  Dwarf(t) {
    const c = canvas(), p = painter(c);
    // Enano herrero con casco, barba roja larga y hacha
    const b = dwarf(p, t, { robe: '#7a5434', robeShade: '#5a3c20', belt: '#d8a030', hair: '#c84a20', beard: '#c84a20' });
    p(13, 12 + b, 14, 5, '#8a8a98'); p(15, 10 + b, 10, 3, '#8a8a98'); p(19, 14 + b, 2, 6, '#8a8a98'); p(11, 11 + b, 2, 4, '#e8d8b0'); p(27, 11 + b, 2, 4, '#e8d8b0');
    p(15, 32 + b, 10, 6, '#c84a20');
    p(31, 20 + b, 2, 18, '#6a4a2a'); p(32, 19 + b, 6, 8, '#a8a8b8'); p(37, 18 + b, 2, 10, '#d8d8e0');
    return c;
  },
  Andvari(t) {
    const c = canvas(), p = painter(c);
    // Enano del oro maldito con su anillo y un montón de monedas
    const b = dwarf(p, t, { robe: '#6a6a78', robeShade: '#4a4a58', belt: '#3a2a1a', hair: '#e8e8f0', beard: '#f4f4f8' });
    p(15, 32 + b, 10, 6, '#f4f4f8');
    p(28, 30 + b, 6, 6, '#ffd84a'); p(30, 32 + b, 2, 2, '#6a6a78'); twinkle(p, t, 33, 29 + b);
    p(0, 40, 12, 7, '#d8a030'); p(2, 38, 8, 3, '#e8b830'); p(4, 36, 4, 2, '#ffd84a'); twinkle(p, t + 0.3, 5, 37);
    return c;
  },
  Leppaludi(t) {
    const c = canvas(), p = painter(c);
    // Trol perezoso de piel de piedra que bosteza
    const b = giant(p, t, { skin: '#8a8a7a', shade: '#6a6a5a', robe: '#7a5434', hair: '#a8a8a0', wild: true, eyes: '#3a3a2a' });
    p(16, 11 + b, 2, 1, '#8a8a7a'); p(22, 11 + b, 2, 1, '#8a8a7a');
    const y = Math.floor(t * 1.5) % 3 === 0; p(17, 15 + b, 6, y ? 4 : 1, '#3a2020');
    for (const [x, yy] of [[11, 24], [26, 30], [15, 34]]) p(x, yy + b, 2, 2, '#6a6a5a');
    if (y) { p(30, 4, 2, 1, '#ffffff'); p(32, 2, 3, 1, '#ffffff'); }
    return c;
  },
  'Yule Cat'(t) {
    const c = canvas(), p = painter(c);
    // Gato negro gigante de Navidad con ojos que brillan en la nieve
    const b = quad(p, t, { col: '#1c1c24', shade: '#101018', belly: '#2a2a34', head: 'cat', eye: Math.sin(t * 3) > 0 ? '#fff07a' : '#ffd84a', tail: false, hoof: '#1c1c24' });
    const sw = Math.floor(t * 2) % 2; p(2, 8 + sw, 3, 16, '#1c1c24'); p(4, 22, 4, 3, '#1c1c24'); p(1 + sw, 6, 3, 3, '#1c1c24');
    p(0, 45, 40, 3, '#f4f8ff'); flake(p, t, 10); flake(p, t, 22, 2); flake(p, t, 36, 1);
    return c;
  },
  Gryla(t) {
    const c = canvas(), p = painter(c);
    // Ogresa de las montañas con cuernos de cabra y su saco
    const b = giant(p, t, { skin: '#7c8c5c', shade: '#5c6c3c', robe: '#6a4a2a', hair: '#1c1c14', wild: true, eyes: '#ffd84a' });
    p(10, 1 + b, 3, 6, '#5a4a3a'); p(8, 0 + b, 3, 3, '#5a4a3a'); p(27, 1 + b, 3, 6, '#5a4a3a'); p(29, 0 + b, 3, 3, '#5a4a3a');
    p(18, 16 + b, 1, 2, '#ffffff'); p(21, 16 + b, 1, 2, '#ffffff');
    p(30, 30 + b, 10, 14, '#a8885c'); p(32, 28 + b, 6, 3, '#8a6a40'); p(34, 26 + b, 2, 3, '#6a4a2a');
    const wig = Math.floor(t * 4) % 2; p(33 + wig, 34 + b, 3, 3, '#8a6a40');
    return c;
  },
  Jokull(t) {
    const c = canvas(), p = painter(c);
    // Gigante glaciar con armadura y corona de hielo
    const b = giant(p, t, { skin: '#a8d8f0', shade: '#78b0d8', armor: '#e8f4ff', armorShade: '#a8d0f0', legs: '#c8e8f8', shoe: '#78b0d8', hair: '#f4f8ff', beard: '#f4f8ff', eyes: '#2c6cb8' });
    p(14, 1 + b, 12, 4, '#a8e0ff'); for (let i = 0; i < 4; i++) p(14 + i * 4, -1 + b, 2, 3, '#e8f8ff');
    for (const [x, y] of [[12, 24], [24, 26], [18, 30]]) p(x, y + b, 3, 1, '#78b0d8');
    twinkle(p, t, 20, 0 + b, '#ffffff'); flake(p, t, 2); flake(p, t, 37, 2);
    return c;
  },
  Snaer(t) {
    const c = canvas(), p = painter(c);
    // Rey de la nieve: barba larga, corona de plata y bastón de hielo
    const b = figure(p, t, { robe: '#f4f8ff', robeShade: '#c8d8e8', dress: true, hair: '#f4f8ff', beard: '#ffffff', eyes: '#78b0d8', armR: 'up' });
    p(14, 26 + b, 12, 6, '#ffffff'); p(15, 6 + b, 10, 3, '#c8c8d8'); p(15, 4 + b, 2, 2, '#c8c8d8'); p(19, 3 + b, 2, 3, '#c8c8d8'); p(23, 4 + b, 2, 2, '#c8c8d8');
    p(29, 4 + b, 2, 42, '#a8d8f0'); p(27, 1 + b, 6, 4, '#e8f8ff'); twinkle(p, t, 30, 2 + b);
    flake(p, t, 3); flake(p, t, 8, 2); flake(p, t, 35, 1);
    return c;
  },
  Fonn(t) {
    const c = canvas(), p = painter(c);
    // Doncella de la nieve acumulada, con un ventisquero a sus pies
    const b = figure(p, t, { robe: '#f4f8ff', robeShade: '#d0e0f0', dress: true, hair: '#d0d8e8', longHair: true, eyes: '#78c0ff' });
    p(15, 7 + b, 10, 2, '#a8e0ff'); p(19, 4 + b, 2, 3, '#e8f8ff');
    p(0, 42, 40, 6, '#f4f8ff'); p(0, 40, 14, 3, '#e8f0f8'); p(26, 39, 14, 4, '#e8f0f8');
    const d = (t * 14) % 40; p(d, 38, 3, 1, '#ffffff'); p((d + 20) % 40, 36, 2, 1, '#ffffff');
    return c;
  },
  Mara(t) {
    const c = canvas(), p = painter(c);
    // Pesadilla que se sienta sobre los durmientes: sombra de ojos rojos
    const f = ghost(p, t, { col: '#2a2440', hair: '#101018', eye: Math.sin(t * 3) > 0 ? '#ff3030' : '#c82020', mouth: '#101018' });
    p(18, 26 + f, 1, 2, '#e8e8f0'); p(21, 26 + f, 1, 2, '#e8e8f0');
    return c;
  },
  Fylgja(t) {
    const c = canvas(), p = painter(c);
    // Espíritu acompañante, pálido y amable, con forma de zorro en su luz
    const f = ghost(p, t, { col: '#c8b0e8', hair: '#f4f4f8', eye: '#5a3c8c', mouth: '#a890c8' });
    p(15, 23 + f, 2, 1, '#e8a0c8'); p(23, 23 + f, 2, 1, '#e8a0c8');
    const x = 30 + Math.round(Math.sin(t * 2) * 2);
    p(x, 38, 6, 4, '#e8d8f8'); p(x + 5, 35, 4, 4, '#e8d8f8'); p(x + 5, 33, 1, 2, '#e8d8f8'); p(x + 8, 33, 1, 2, '#e8d8f8'); p(x - 3, 37, 3, 2, '#e8d8f8');
    twinkle(p, t, 6, 8, '#f4e8ff');
    return c;
  },
  Disir(t) {
    const c = canvas(), p = painter(c);
    // Espíritus femeninos de los antepasados, encapuchados y luminosos
    const f = ghost(p, t, { col: '#f4f4f8', hood: '#8a8a98', eye: '#5a5a6a', mouth: '#c8c8d8' });
    for (const [x, y] of [[4, 14], [34, 20], [6, 34]]) twinkle(p, t + x, x, y + f, '#fff8c8');
    return c;
  },

  // ---------- Nórdicas: poco comunes ----------
  Logi(t) {
    const c = canvas(), p = painter(c);
    // El fuego hecho gigante: piel naranja y pelo de llamas
    const b = figure(p, t, { robe: '#e86a2c', robeShade: '#c84a1c', skin: '#f08a3c', belt: '#a82020', eyes: '#ffd84a', legs: '#f08a3c', shoe: '#a82020' });
    p(13, 34 + b, 14, 7, '#a82020');
    for (let i = 0; i < 5; i++) flame(p, t, 12 + i * 3, 5 + b + (i % 2) * 2, i);
    p(13, 9 + b, 14, 3, '#ff7a20');
    for (let k = 0; k < 4; k++) ember(p, t, 4 + k * 10, 46, k);
    return c;
  },
  Arvak(t) {
    const c = canvas(), p = painter(c);
    // «El madrugador», caballo dorado del carro del sol, con crin de fuego
    const b = quad(p, t, { col: '#e8b030', shade: '#c89020', belly: '#f8d880', head: 'horse', hoof: '#8a5a20', tailc: '#ff7a20' });
    for (let i = 0; i < 5; i++) flame(p, t, 22 - (i % 2), 6 + b + i * 3, i);
    disc(p, 6, 6, 5, '#ffb030'); disc(p, 6, 6, 3, '#fff07a');
    return c;
  },
  Alsvid(t) {
    const c = canvas(), p = painter(c);
    // «El muy rápido», caballo amarillo del sol con fuelles que lo refrescan
    const b = quad(p, t, { col: '#f0d040', shade: '#d0b030', belly: '#f8e890', head: 'horse', mane: '#f4f4f8', hoof: '#8a6a20', tailc: '#f4f4f8' });
    p(10, 18 + b, 8, 5, '#8a5a30'); p(11, 19 + b, 6, 3, '#a8784c');
    const g = Math.floor(t * 4) % 2; for (let i = 0; i < 3; i++) p(4 + i * 12, 2 + g, 1, 4, '#fff8b0');
    return c;
  },
  Skinfaxi(t) {
    const c = canvas(), p = painter(c);
    // Caballo del día: blanco de crin dorada que ilumina el cielo
    const g = Math.floor(t * 3) % 2;
    for (let i = 0; i < 6; i++) p(30 + Math.round(Math.cos(i) * 8), 9 + Math.round(Math.sin(i) * 8), 2, 2, g ? '#fff8b0' : '#ffe878');
    const b = quad(p, t, { col: '#f4f4f8', shade: '#d8d8e0', belly: '#e8e8f0', head: 'horse', mane: '#e8b830', hoof: '#d8a030', tailc: '#e8b830' });
    return c;
  },
  Hrimfaxi(t) {
    const c = canvas(), p = painter(c);
    // Caballo de la noche: de su bocado cae la escarcha que forma el rocío
    const b = quad(p, t, { col: '#2a2c4c', shade: '#1c1e38', belly: '#3a3c5c', head: 'horse', mane: '#a8e0ff', hoof: '#a8e0ff', tailc: '#a8e0ff' });
    for (const [x, y] of [[4, 4], [14, 8], [24, 2], [36, 6]]) twinkle(p, t + x, x, y, '#ffffff');
    p(37, 17 + b, 2, 2, '#e8f8ff'); p(38, 20 + ((t * 10) % 20), 1, 2, '#a8e0ff');
    return c;
  },
  Gullinbursti(t) {
    const c = canvas(), p = painter(c);
    // Jabalí de cerdas de oro que brillan en la oscuridad
    const b = quad(p, t, { col: '#e8b030', shade: '#c89020', belly: '#f8d880', head: 'boar', eye: '#8a3a10', tailc: '#c89020' });
    const g = Math.floor(t * 4) % 2;
    for (let i = 0; i < 7; i++) p(6 + i * 4, 16 + b + (i % 2), 3, 5, (i + g) % 2 ? '#fff07a' : '#ffd84a');
    twinkle(p, t, 10, 12 + b); twinkle(p, t + 0.4, 26, 10 + b);
    return c;
  },
  Tanngnjostr(t) {
    const c = canvas(), p = painter(c);
    // La otra cabra de Thor, pizarra, bajo una nube de tormenta
    p(4, 0, 30, 6, '#5a5a6a'); p(8, 4, 22, 3, '#6a6a7a');
    if (Math.floor(t * 6) % 3 === 0) { p(16, 7, 2, 3, '#fff07a'); p(14, 10, 2, 3, '#fff07a'); }
    const b = quad(p, t, { col: '#5a6a7c', shade: '#4a5a6c', belly: '#7a8a9c', head: 'goat', horn: '#d8d0b8', beard: '#3a4a5c', tailc: '#3a4a5c' });
    return c;
  },
  Margygr(t) {
    const c = canvas(), p = painter(c);
    // Ogresa del mar: pelo negro salvaje, colmillos y cola de pez
    const b = figure(p, t, { robe: '#c89870', robeShade: '#a87850', skin: '#c89870', hair: '#101018', longHair: true, eyes: '#ffd84a' });
    p(10, 12 + b, 2, 16, '#101018'); p(28, 12 + b, 2, 16, '#101018');
    merTail(p, t, b, '#2c3c7c', '#5c7cc8');
    p(17, 18 + b, 6, 2, '#3a1a1a'); p(18, 18 + b, 1, 2, '#ffffff'); p(21, 18 + b, 1, 2, '#ffffff');
    p(0, 46, 40, 2, '#2c6cb8');
    return c;
  },
  Hulder(t) {
    const c = canvas(), p = painter(c);
    // Doncella del bosque, bella por delante, con cola de vaca que intenta esconder
    const sw = Math.floor(t * 3) % 2;
    p(4, 30, 3, 12, '#c8a070'); p(2 + sw, 40, 4, 5, '#6a4a2a'); p(7, 30, 6, 3, '#c8a070');
    const b = figure(p, t, { robe: '#3c8c3c', robeShade: '#2c6c2c', dress: true, hair: '#e8b830', longHair: true, eyes: '#3c6cb8', belt: '#c83030' });
    for (let i = 0; i < 4; i++) p(14 + i * 4, 7 + b, 2, 2, ['#ffffff', '#ff7ca0', '#ffd84a', '#ffffff'][i]);
    return c;
  },
  Skogsra(t) {
    const c = canvas(), p = painter(c);
    // Señora del bosque con pelo de musgo y cola de zorro
    const sw = Math.floor(t * 3) % 2;
    p(2, 32 - sw, 10, 6, '#c86a30'); p(0, 30 - sw, 4, 5, '#c86a30'); p(0, 30 - sw, 2, 3, '#f4f4f8');
    const b = figure(p, t, { robe: '#5c7c3c', robeShade: '#4c6c2c', dress: true, skin: '#d8c0a0', hair: '#6c8c3c', longHair: true, eyes: '#ffd84a' });
    for (let i = 0; i < 6; i++) p(11 + i * 3, 6 + b + (i % 2), 3, 3, i % 2 ? '#8cac4c' : '#5c7c2c');
    p(13, 30 + b, 2, 8, '#7a5434'); p(25, 28 + b, 2, 10, '#7a5434');
    return c;
  },
  Kari(t) {
    const c = canvas(), p = painter(c);
    // El viento: una nube con cara y barba gris que sopla
    const f = Math.round(Math.sin(t * 2));
    p(2, 12 + f, 30, 18, '#e8f0f8'); p(6, 8 + f, 22, 6, '#e8f0f8'); p(0, 16 + f, 6, 10, '#e8f0f8'); p(26, 10 + f, 8, 8, '#f4f8ff');
    p(10, 16 + f, 3, 2, '#3a4a5c'); p(20, 16 + f, 3, 2, '#3a4a5c'); p(8, 14 + f, 6, 1, '#8a9aac'); p(18, 14 + f, 6, 1, '#8a9aac');
    p(8, 22 + f, 18, 10, '#a8a8b8'); p(10, 30 + f, 12, 4, '#a8a8b8'); p(24, 22 + f, 4, 3, '#5a5a6a');
    const w = Math.floor(t * 6) % 3;
    for (let i = 0; i < 3; i++) p(28 + w * 2, 20 + f + i * 3, 8 - i * 2, 1, '#c8e8ff');
    flake(p, t, 34, 1); flake(p, t, 38, 3);
    return c;
  },
  Valkyrie(t) {
    const c = canvas(), p = painter(c);
    // Valquiria con casco alado, lanza y escudo redondo
    const b = figure(p, t, { robe: '#3c6cb8', robeShade: '#2c4c98', belt: '#d8a030', hair: '#e8b830', longHair: true, eyes: '#3c6cb8', armR: 'up', legs: '#a8a8b8', shoe: '#5a5a6a' });
    p(14, 22 + b, 12, 10, '#a8a8b8'); p(15, 23 + b, 10, 1, '#d8d8e0');
    p(13, 6 + b, 14, 5, '#c8c8d8'); p(8, 3 + b, 5, 5, '#f4f4f8'); p(6, 1 + b, 3, 3, '#f4f4f8'); p(27, 3 + b, 5, 5, '#f4f4f8'); p(31, 1 + b, 3, 3, '#f4f4f8');
    p(28, -2 + b, 2, 48, '#8a6a40'); p(27, -3 + b, 4, 4, '#d8d8e0');
    disc(p, 8, 32 + b, 6, '#c8883c'); disc(p, 8, 32 + b, 4, '#a82020'); p(7, 31 + b, 2, 2, '#d8a030');
    return c;
  },
  Sleipnir(t) {
    const c = canvas(), p = painter(c);
    // Caballo gris de ocho patas de Odín
    const b = bob(t), col = '#9a9aa8', sh = '#7a7a88', st = Math.floor(t * 4) % 2;
    [6, 9, 12, 15, 21, 24, 27, 30].forEach((x, i) => { p(x, 32 + ((i + st) % 2), 2, 11 - ((i + st) % 2), i % 2 ? sh : col); p(x, 43, 2, 2, '#3a3a44'); });
    p(2, 21 + b, 4, 3, '#e8e8f0'); p(1, 23 + b, 2, 7, '#e8e8f0');
    p(5, 20 + b, 27, 13, col); p(7, 31 + b, 23, 2, sh);
    p(26, 12 + b, 7, 12, col); p(29, 8 + b, 9, 8, col); p(35, 12 + b, 5, 5, col); p(29, 5 + b, 2, 4, col);
    p(32, 10 + b, 2, 2, DARK); p(39, 14 + b, 1, 1, DARK);
    for (let i = 0; i < 5; i++) p(24 - (i % 2), 8 + b + i * 3, 3, 3, '#e8e8f0');
    p(31, 9 + b, 2, 1, '#d8a030');
    return c;
  },
  Huginn(t) {
    const c = canvas(), p = painter(c);
    // Cuervo «Pensamiento» de Odín, de ojo blanco
    const b = bird(p, t, { col: '#1c1c24', wing: '#101018', wing2: '#3a3a48', belly: '#2a2a34', beak: '#7a7a88', eye: '#f4f4f8', leg: '#3a3a44' });
    p(25, 8 + b, 10, 2, '#3a3a5a');
    p(2, 44, 36, 3, '#6a4a2a');
    if (Math.floor(t * 2) % 3 === 0) { p(36, 6, 3, 1, '#f4f4f8'); p(38, 4, 1, 1, '#f4f4f8'); }
    return c;
  },
  Muninn(t) {
    const c = canvas(), p = painter(c);
    // Cuervo «Memoria» de Odín, azul noche de ojo cian, con runas que flotan
    const b = bird(p, t, { col: '#1c2040', wing: '#141830', wing2: '#3a4070', belly: '#2a2c4c', beak: '#7a7a88', eye: '#5ce0f0', leg: '#3a3a44' });
    p(2, 44, 36, 3, '#6a4a2a');
    const y = (t * 6) % 12; p(4, 14 - y, 1, 4, '#5ce0f0'); p(5, 15 - y, 2, 1, '#5ce0f0'); p(36, 10 - y / 2, 1, 4, '#5ce0f0'); p(37, 12 - y / 2, 1, 1, '#5ce0f0');
    return c;
  },
  Troll(t) {
    const c = canvas(), p = painter(c);
    // Trol del bosque: piel de musgo, orejas largas, nariz enorme y garrote
    const b = giant(p, t, { skin: '#7c9c5c', shade: '#5c7c3c', robe: '#6a4a2a', hair: '#3c6c2c', wild: true, eyes: '#ffd84a', armR: 'up' });
    p(9, 9 + b, 5, 3, '#7c9c5c'); p(7, 7 + b, 3, 3, '#7c9c5c'); p(26, 9 + b, 5, 3, '#7c9c5c'); p(30, 7 + b, 3, 3, '#7c9c5c');
    p(18, 12 + b, 4, 5, '#6c8c4c'); p(19, 16 + b, 3, 2, '#5c7c3c');
    p(31, -2 + b, 5, 12, '#6a4a2a'); p(30, -3 + b, 7, 5, '#7a5434');
    return c;
  },
  Lindworm(t) {
    const c = canvas(), p = painter(c);
    // Sierpe sin alas con solo dos patas delanteras
    const b = dragon(p, t, { col: '#3c8c3c', shade: '#2c6c2c', belly: '#e8d050', wings: false, legs: 2, eye: '#ffd84a' });
    return c;
  },
  Drifa(t) {
    const c = canvas(), p = painter(c);
    // Doncella de la ventisca: sin piernas, se deshace en nieve que sopla
    const b = figure(p, t, { robe: '#c8e8f8', robeShade: '#a8d0f0', dress: true, hair: '#f4f8ff', longHair: true, eyes: '#3c9cd8' });
    c.getContext('2d').clearRect(10, 38, 20, 10);
    const w = Math.floor(t * 4) % 2;
    p(13, 38, 14, 2, '#e8f4ff'); p(15 + w, 40, 10, 2, '#e8f4ff'); p(17 - w, 42, 6, 2, '#f4f8ff');
    for (let k = 0; k < 4; k++) p((t * 24 + k * 10) % 40, 6 + k * 10, 2, 1, '#ffffff');
    return c;
  },
  Mjoll(t) {
    const c = canvas(), p = painter(c);
    // Nieve recién caída: corona de flores escarchadas y orbe de hielo
    const b = figure(p, t, { robe: '#f4ecd8', robeShade: '#d8d0b8', dress: true, hair: '#f4f8ff', longHair: true, eyes: '#78c0ff' });
    for (let i = 0; i < 4; i++) p(14 + i * 4, 7 + b, 2, 2, i % 2 ? '#c8e8ff' : '#ffffff');
    disc(p, 30, 32 + b, 3, '#a8e0ff'); p(29, 31 + b, 1, 1, '#ffffff'); twinkle(p, t, 31, 28 + b);
    flake(p, t, 4); flake(p, t, 36, 2);
    return c;
  },
  Frosti(t) {
    const c = canvas(), p = painter(c);
    // Guerrero de la escarcha con armadura de plata y hacha
    const b = figure(p, t, { robe: '#5cc8d8', robeShade: '#3ca8b8', belt: '#c8c8d8', hair: '#f4f8ff', beard: '#f4f8ff', eyes: '#2c6cb8', armR: 'up', legs: '#a8a8b8', shoe: '#5a5a6a' });
    p(13, 22 + b, 14, 4, '#c8c8d8'); p(13, 6 + b, 14, 5, '#c8c8d8');
    p(29, 2 + b, 2, 26, '#6a4a2a'); p(30, 2 + b, 6, 8, '#c8e8f8'); p(35, 1 + b, 2, 10, '#ffffff');
    flake(p, t, 3); flake(p, t, 8, 2);
    return c;
  },
  Thorri(t) {
    const c = canvas(), p = painter(c);
    // Señor del pleno invierno con piel blanca, barba larga y cuerno de beber
    const b = giant(p, t, { skin: '#e8c8a8', armor: '#f4f4f8', armorShade: '#d8d8e0', robe: '#d8d8e0', hair: '#a8a8b0', beard: '#c8c8d0', eyes: '#3c6cb8', armR: 'up' });
    p(15, 20 + b, 10, 6, '#c8c8d0');
    p(30, 4 + b, 8, 4, '#e8d8b0'); p(36, 1 + b, 3, 4, '#e8d8b0'); p(30, 4 + b, 2, 4, '#d8a030');
    if (Math.floor(t * 2) % 2) p(37, 5 + b, 1, 2, '#e8b030');
    flake(p, t, 3); flake(p, t, 8, 2);
    return c;
  },
  Goa(t) {
    const c = canvas(), p = painter(c);
    // El deshielo: flores que brotan de la nieve a su alrededor
    const b = figure(p, t, { robe: '#c8b0e8', robeShade: '#a890c8', dress: true, hair: '#f4f4f8', longHair: true, eyes: '#5cc85c' });
    for (let i = 0; i < 4; i++) p(14 + i * 4, 7 + b, 2, 2, ['#ff7ca0', '#ffd84a', '#5cc85c', '#ff7ca0'][i]);
    p(0, 44, 40, 4, '#f4f8ff');
    const g = Math.floor(t * 2) % 3;
    for (const [x, col] of [[3, '#ff7ca0'], [8, '#ffd84a'], [32, '#a070f0'], [36, '#ff7ca0']]) { p(x, 44 - g, 1, 2 + g, '#4c9c3c'); p(x - 1, 42 - g, 3, 2, col); }
    return c;
  },
  Stallo(t) {
    const c = canvas(), p = painter(c);
    // Gigante del norte vestido de pieles y hierro, con hacha
    const b = giant(p, t, { skin: '#c89870', armor: '#8a8a98', armorShade: '#6a6a78', robe: '#5a5a68', hair: '#1c1010', eyes: '#3a2a1a', armR: 'up' });
    p(9, 19 + b, 22, 4, '#a8a8b0'); for (let i = 0; i < 5; i++) p(10 + i * 4, 22 + b, 2, 2, '#a8a8b0');
    p(31, -2 + b, 3, 24, '#6a4a2a'); p(33, -2 + b, 6, 9, '#8a8a98'); p(38, -3 + b, 2, 11, '#c8c8d8');
    return c;
  },
  Hrimgerd(t) {
    const c = canvas(), p = painter(c);
    // Giganta de la escarcha con colmillos y melena blanca salvaje
    const b = giant(p, t, { skin: '#a8d0e8', shade: '#78a8c8', robe: '#2c3c7c', belt: '#1c2c5c', hair: '#f4f8ff', wild: true, eyes: '#2c4c9c' });
    p(9, 19 + b, 22, 10, '#2c3c7c'); p(11, 8 + b, 3, 20, '#f4f8ff'); p(26, 8 + b, 3, 20, '#f4f8ff');
    p(17, 16 + b, 6, 2, '#1c2c4c'); p(18, 16 + b, 1, 3, '#ffffff'); p(21, 16 + b, 1, 3, '#ffffff');
    flake(p, t, 2); flake(p, t, 37, 2);
    return c;
  },
  Hyrrokkin(t) {
    const c = canvas(), p = painter(c);
    // Giganta que cabalga un lobo con riendas de víboras
    const b = giant(p, t, { skin: '#6a7a8a', shade: '#4a5a6a', armor: '#1c1c24', armorShade: '#101018', robe: '#1c1c24', hair: '#e8e8f0', eyes: '#ffd84a', armR: 'up' });
    p(11, 8 + b, 3, 22, '#e8e8f0'); p(26, 8 + b, 3, 22, '#e8e8f0');
    const w = Math.floor(t * 4) % 2;
    p(33, 6 + b, 2, 3, '#3c8c3c'); p(34, 9 + b + w, 2, 4, '#3c8c3c'); p(33, 13 + b, 2, 4, '#3c8c3c'); p(34, 17 + b - w, 2, 3, '#3c8c3c');
    p(32, 3 + b, 4, 3, '#4c9c4c'); p(33, 4 + b, 1, 1, '#ff3030');
    return c;
  },
  Jotun(t) {
    const c = canvas(), p = painter(c);
    // Gigante de hielo con garrote, barba blanca y aliento helado
    const b = giant(p, t, { skin: '#a8d8f0', shade: '#78b0d8', robe: '#6a6a78', hair: '#f4f8ff', beard: '#f4f8ff', eyes: '#2c4c9c', armR: 'up' });
    p(31, -2 + b, 5, 12, '#7a7a8a'); p(30, -3 + b, 7, 5, '#8a8a9a');
    const br = Math.floor(t * 3) % 3; if (br) p(4, 14 + b, br * 3, 1, '#e8f8ff');
    flake(p, t, 3); flake(p, t, 37, 2);
    return c;
  },

  // ---------- Nórdicas: raras ----------
  Eldjotun(t) {
    const c = canvas(), p = painter(c);
    // Gigante de fuego de Muspelheim con espada en llamas
    const b = giant(p, t, { skin: '#c8402c', shade: '#a8301c', armor: '#2a2a34', armorShade: '#1c1c24', robe: '#8a3a1c', eyes: '#ffd84a', armR: 'up' });
    for (let i = 0; i < 5; i++) flame(p, t, 12 + i * 4, 2 + b + (i % 2) * 2, i);
    p(13, 6 + b, 14, 2, '#ff7a20');
    for (const [x, y] of [[11, 22], [26, 22], [18, 28]]) p(x, y + b, 3, 1, '#a8501c');
    p(32, -3 + b, 3, 18, '#ff9c30'); p(33, -3 + b, 1, 18, '#fff07a'); p(30, 14 + b, 7, 2, '#5a3c20');
    flame(p, t, 32, -2 + b, 2); flame(p, t, 32, 6 + b, 3);
    for (let k = 0; k < 3; k++) ember(p, t, 4 + k * 14, 46, k);
    return c;
  },
  Skoll(t) {
    const c = canvas(), p = painter(c);
    // Lobo negro que persigue al sol para devorarlo
    disc(p, 8, 7, 6, '#ff9c30'); disc(p, 8, 7, 4, '#ffd84a');
    const b = quad(p, t, { col: '#1c1c24', shade: '#101018', belly: '#2a2a34', head: 'wolf', eye: '#ffd84a', fangs: true, tailc: '#101018' });
    for (let k = 0; k < 3; k++) flame(p, t, 4 + k * 4, 16 + b - (k % 2) * 2, k);
    return c;
  },
  Hati(t) {
    const c = canvas(), p = painter(c);
    // Lobo que persigue a la luna: pelaje pizarra y ojos cian
    disc(p, 8, 7, 6, '#e8f0f8'); p(5, 5, 2, 2, '#c8d0e0'); p(9, 9, 2, 1, '#c8d0e0');
    const b = quad(p, t, { col: '#4a5a6c', shade: '#3a4a5c', belly: '#6a7a8c', head: 'wolf', eye: Math.sin(t * 3) > 0 ? '#a8f8ff' : '#5ce0f0', fangs: true, tailc: '#3a4a5c' });
    flake(p, t, 6); flake(p, t, 18, 2);
    return c;
  },
  Hafgufa(t) {
    const c = canvas(), p = painter(c);
    // Monstruo marino tan grande que parece una isla de roca
    const w = islandWhale(p, t, { col: '#5a6a7c', top: '#7a7a8a' });
    p(10, 4 + w, 10, 6, '#5a6a5c'); p(14, 8 + w, 2, 11, '#4a4a5a');
    const op = Math.floor(t * 2) % 2; p(32, 32 + w, 6, 2 + op * 2, '#2a1a24');
    return c;
  },
  Lyngbakr(t) {
    const c = canvas(), p = painter(c);
    // Ballena cubierta de brezo que los marinos confunden con una isla; resopla un chorro
    const w = islandWhale(p, t, { col: '#4c6c4c', top: '#a070a0' });
    const h = 4 + Math.floor(t * 4) % 3 * 2;
    p(30, 20 - h + w, 2, h, '#a8e0ff'); p(28, 19 - h + w, 2, 2, '#e8f8ff'); p(32, 19 - h + w, 2, 2, '#e8f8ff');
    return c;
  },
  Kraken(t) {
    const c = canvas(), p = painter(c);
    // Calamar gigante carmesí que agita sus ocho brazos
    p(0, 42, 40, 6, '#1c3c8c');
    const w = Math.floor(t * 4);
    for (let i = 0; i < 8; i++) {
      const x0 = 6 + i * 4;
      for (let k = 0; k < 5; k++) p(x0 + Math.round(Math.sin(k * 0.8 + (w + i) * 0.9) * (i < 4 ? -k : k) * 0.7), 26 + k * 4, 3, 4, i % 2 ? '#a82030' : '#c83040');
    }
    p(10, 4, 20, 22, '#c83040'); p(13, 1, 14, 4, '#c83040'); p(16, -1, 8, 3, '#a82030');
    p(13, 15, 5, 5, '#ffd84a'); p(22, 15, 5, 5, '#ffd84a'); p(15, 16, 2, 3, DARK); p(24, 16, 2, 3, DARK);
    for (const [x, y] of [[14, 7], [22, 9], [18, 4]]) p(x, y, 2, 2, '#e86070');
    return c;
  },
  Jormungandr(t) {
    const c = canvas(), p = painter(c);
    // La serpiente del mundo rodea el mar y se muerde la cola
    p(0, 38, 40, 10, '#1c4c9c');
    const r = Math.floor(t * 3);
    for (let a = 0; a < 22; a++) {
      const ang = (a / 22) * Math.PI * 2 - Math.PI / 2;
      const x = 20 + Math.round(Math.cos(ang) * 15), y = 22 + Math.round(Math.sin(ang) * 15);
      p(x - 2, y - 2, 5, 5, a % 2 ? '#2c8c6c' : '#3c9c7c');
      if (a % 3 === r % 3) p(x, y - 3, 2, 2, '#7ce0a0');
    }
    p(16, 2, 10, 8, '#3c9c7c'); p(14, 4, 3, 5, '#3c9c7c'); p(21, 3, 3, 3, '#ffd84a'); p(22, 4, 1, 1, DARK);
    p(13, 7, 5, 2, '#e8e0c8'); p(10, 6, 5, 4, '#2c8c6c');
    for (let i = 0; i < 3; i++) p(4 + i * 12 + (r % 4), 40 + (i % 2) * 3, 4, 1, '#a8e0ff');
    return c;
  },
  Draugr(t) {
    const c = canvas(), p = painter(c);
    // No-muerto de los túmulos: piel pizarra, armadura negra y ojos cian
    const b = figure(p, t, { robe: '#2a2a34', robeShade: '#1c1c24', belt: '#6a6a78', skin: '#6a7a8a', hair: '#8a8a98', beard: '#8a8a98', eyes: Math.sin(t * 3) > 0 ? '#a8f8ff' : '#5ce0f0', armR: 'up', legs: '#3a3a44', shoe: '#1c1c24' });
    p(13, 6 + b, 14, 5, '#5a5a68'); p(19, 10 + b, 2, 5, '#5a5a68');
    p(13, 22 + b, 14, 4, '#6a6a78'); for (let i = 0; i < 4; i++) p(14 + i * 3, 28 + b, 1, 1, '#8a8a98');
    p(28, 0 + b, 2, 14, '#a8a8b8'); p(26, 13 + b, 6, 2, '#5a5a68');
    const m = (t * 4) % 40; p(m, 45, 8, 2, '#5a6a7a');
    return c;
  },
  Helhest(t) {
    const c = canvas(), p = painter(c);
    // Caballo de tres patas de la diosa Hel, de ojos rojos
    const b = bob(t), col = '#1c1c24', sh = '#101018';
    [8, 23, 28].forEach((x, i) => { p(x, 32, 3, 11, i % 2 ? sh : col); p(x, 43, 3, 2, '#3a3a44'); });
    p(2, 21 + b, 4, 3, '#8a8a98'); p(1, 23 + b, 2, 7, '#8a8a98');
    p(6, 20 + b, 24, 13, col); p(8, 31 + b, 20, 2, sh);
    for (let i = 0; i < 4; i++) p(9 + i * 4, 22 + b, 1, 7, '#3a3a44');
    p(25, 12 + b, 7, 12, col); p(28, 8 + b, 9, 8, col); p(34, 12 + b, 5, 5, col); p(28, 5 + b, 2, 4, col);
    p(31, 10 + b, 2, 2, Math.sin(t * 3) > 0 ? '#ff3030' : '#c82020'); p(38, 14 + b, 1, 1, '#ff3030');
    for (let i = 0; i < 5; i++) p(23 - (i % 2), 8 + b + i * 3, 3, 3, '#8a8a98');
    const m = (t * 4) % 40; p(m, 45, 8, 2, '#4a4a5a');
    return c;
  },
  Garm(t) {
    const c = canvas(), p = painter(c);
    // Perro guardián de Hel con el pecho manchado de sangre y la cadena rota
    const b = quad(p, t, { col: '#1c1c24', shade: '#101018', belly: '#2a2a34', head: 'wolf', eye: '#ff3030', fangs: true, tailc: '#101018' });
    p(25, 20 + b, 7, 6, '#8a1a1a'); p(26, 26 + b, 2, 3, '#8a1a1a');
    p(23, 18 + b, 10, 2, '#7a7a88');
    const sw = Math.floor(t * 3) % 2; for (let i = 0; i < 3; i++) p(20 - i * 3, 20 + b + i * 2 + sw, 2, 2, '#7a7a88');
    if (Math.floor(t * 3) % 3 === 0) p(38, 17 + b, 2, 2, '#ffffff');
    return c;
  },
  Nidhogg(t) {
    const c = canvas(), p = painter(c);
    // Dragón negro que roe la raíz del árbol del mundo
    p(26, 38, 14, 4, '#7a5434'); p(32, 34, 8, 5, '#7a5434'); p(36, 42, 4, 6, '#6a4a2a');
    const b = dragon(p, t, { col: '#3a3448', shade: '#2a2438', belly: '#7a4ca0', wing: '#2a2438', wing2: '#6a3c8c', eye: '#ff3030', horn: '#8a7a8a', spike: '#4a2a6a', claw: '#8a7a8a' });
    if (Math.floor(t * 4) % 2) { p(38, 18 + b, 2, 2, '#a8784c'); p(35, 36, 1, 1, '#c8a070'); }
    return c;
  },
  Fenrir(t) {
    const c = canvas(), p = painter(c);
    // Lobo gigantesco que rompe sus cadenas
    const b = bob(t), col = '#7a7a88', sh = '#5a5a68';
    [5, 11, 23, 29].forEach((x, i) => { p(x, 30, 4, 13, i % 2 ? sh : col); p(x - 1, 43, 6, 2, '#3a3a44'); });
    p(0, 16 + b, 6, 4, sh); p(0, 18 + b, 3, 8, sh);
    p(3, 16 + b, 28, 16, col); p(5, 29 + b, 24, 3, '#9a9aa8'); for (let i = 0; i < 6; i++) p(5 + i * 4, 14 + b, 3, 3, sh);
    p(22, 8 + b, 12, 14, col); p(18, 12 + b, 6, 12, sh); p(31, 11 + b, 9, 7, col); p(39, 11 + b, 1, 2, DARK);
    p(23, 3 + b, 4, 6, col); p(29, 3 + b, 4, 6, col); p(29, 11 + b, 3, 2, '#ffd84a');
    const op = Math.floor(t * 2) % 2; p(31, 17 + b, 9, 2 + op * 2, '#5a1a1a'); p(32, 17 + b, 1, 2, '#ffffff'); p(35, 17 + b, 1, 2, '#ffffff'); p(38, 17 + b, 1, 2, '#ffffff');
    p(6, 40, 3, 3, '#c8c8d8'); p(10, 42, 3, 2, '#c8c8d8'); p(30, 39, 3, 3, '#c8c8d8'); p(34, 41 - op, 3, 2, '#c8c8d8');
    return c;
  },
  Hrungnir(t) {
    const c = canvas(), p = painter(c);
    // Gigante de piedra con cabeza de roca, corazón de tres puntas y piedra de afilar
    const b = giant(p, t, { skin: '#8a8a7a', shade: '#6a6a5a', legs: '#7a7a6a', shoe: '#5a5a4a', eyes: '#5ce0f0', armR: 'up' });
    for (const [x, y] of [[12, 24], [24, 22], [16, 32], [26, 34], [6, 26]]) p(x, y + b, 3, 2, '#6a6a5a');
    p(14, 6 + b, 12, 3, '#9a9a8a'); p(13, 8 + b, 2, 8, '#6a6a5a');
    p(18, 22 + b, 4, 2, '#5a5a4a'); p(19, 24 + b, 2, 2, '#5a5a4a');
    p(31, -1 + b, 6, 12, '#a8a898'); p(32, 0 + b, 1, 10, '#c8c8b8');
    return c;
  },
  Fafnir(t) {
    const c = canvas(), p = painter(c);
    // Enano convertido en dragón, tumbado sobre su tesoro
    p(0, 42, 40, 6, '#d8a030'); p(4, 40, 32, 3, '#e8b830'); p(10, 38, 6, 3, '#ffd84a');
    const b = dragon(p, t, { col: '#3c8c3c', shade: '#2c6c2c', belly: '#e8b830', wings: false, eye: '#ff3030', claw: '#d8a030' });
    twinkle(p, t, 6, 40); twinkle(p, t + 0.5, 32, 41);
    if (Math.floor(t * 3) % 3 === 0) { p(39, 13 + b, 1, 1, '#a8e070'); p(38, 11 + b, 1, 1, '#a8e070'); }
    return c;
  },
  Hrimthurs(t) {
    const c = canvas(), p = painter(c);
    // Gigante de escarcha con melena blanca y ojos que brillan en azul
    const b = giant(p, t, { skin: '#78c8e0', shade: '#58a8c8', legs: '#78c8e0', shoe: '#3c88a8', hair: '#f4f8ff', wild: true, eyes: Math.sin(t * 3) > 0 ? '#a8f8ff' : '#3c9cff' });
    p(11, 8 + b, 3, 14, '#f4f8ff'); p(26, 8 + b, 3, 14, '#f4f8ff');
    for (const [x, y] of [[10, 26], [27, 26], [16, 34]]) p(x, y + b, 3, 3, '#e8f8ff');
    flake(p, t, 2); flake(p, t, 37, 2); flake(p, t, 20, 4);
    return c;
  },
  Thrym(t) {
    const c = canvas(), p = painter(c);
    // Rey de los gigantes, con el martillo de Thor que robó
    const b = giant(p, t, { skin: '#a8d0e8', shade: '#78a8c8', armor: '#7a7a88', armorShade: '#5a5a68', robe: '#5a5a68', hair: '#c8c8d8', beard: '#c8c8d8', eyes: '#2c4c9c', armR: 'up' });
    p(14, 1 + b, 12, 4, '#c8c8d8'); for (let i = 0; i < 4; i++) p(14 + i * 4, -1 + b, 2, 3, '#e8e8f0');
    p(32, 2 + b, 2, 9, '#6a4a2a'); p(29, -1 + b, 8, 5, '#8a8a98');
    if (Math.floor(t * 6) % 3 === 0) { p(37, 0 + b, 2, 1, '#fff07a'); p(28, 2 + b, 1, 1, '#fff07a'); }
    return c;
  },
  Thiazi(t) {
    const c = canvas(), p = painter(c);
    // Gigante transformado en águila enorme
    const flap = Math.floor(t * 3) % 2;
    sideWing(p, 12, 26, '#5a6a7c', '#8a9aac', flap, -1, 6); sideWing(p, 28, 26, '#5a6a7c', '#8a9aac', flap, 1, 6);
    const b = bob(t);
    p(12, 16 + b, 16, 20, '#6a7a8c'); p(14, 26 + b, 12, 8, '#a8b8c8'); p(14, 36, 4, 4, '#5a6a7c'); p(22, 36, 4, 4, '#5a6a7c');
    p(15, 40, 2, 5, '#e8b030'); p(23, 40, 2, 5, '#e8b030'); p(13, 45, 6, 1, '#e8b030'); p(21, 45, 6, 1, '#e8b030');
    p(14, 4 + b, 12, 12, '#7a8a9c'); p(16, 8 + b, 3, 3, '#ffd84a'); p(22, 8 + b, 3, 3, '#ffd84a'); p(17, 9 + b, 1, 1, DARK); p(23, 9 + b, 1, 1, DARK);
    p(18, 11 + b, 4, 5, '#e8b030'); p(19, 16 + b, 2, 1, '#c89020');
    return c;
  },
  Hymir(t) {
    const c = canvas(), p = painter(c);
    // Gigante del mar helado con su caldero enorme y una mirada que rompe columnas
    const b = giant(p, t, { skin: '#a8d0e8', shade: '#78a8c8', armor: '#7a5434', armorShade: '#5a3c20', robe: '#5a3c20', hair: '#f4f8ff', beard: '#f4f8ff', eyes: '#2c4c9c' });
    p(15, 20 + b, 10, 8, '#f4f8ff');
    p(26, 30, 14, 14, '#4a4a5a'); p(25, 29, 16, 3, '#6a6a7a'); p(28, 33, 10, 2, '#5a5a6a');
    const st = (t * 6) % 10; p(30, 26 - st, 2, 2, '#c8d8e8'); p(35, 24 - st, 2, 2, '#c8d8e8');
    return c;
  },
  Bergelmir(t) {
    const c = canvas(), p = painter(c);
    // Gigante que sobrevivió al diluvio de sangre de Ymir en un tronco hueco
    const b = giant(p, t, { skin: '#6a7a8a', shade: '#4a5a6a', robe: '#2c3c7c', hair: '#8a8a98', beard: '#8a8a98', eyes: '#ffd84a' });
    const w = Math.round(Math.sin(t * 2.5) * 1.5);
    p(0, 36 + w, 40, 6, '#7a5434'); p(0, 36 + w, 40, 2, '#9a6c48'); p(2, 38 + w, 2, 2, '#5a3c20'); p(36, 38 + w, 2, 2, '#5a3c20');
    p(0, 42, 40, 6, '#8a1a2a'); p(4, 41 - w, 8, 1, '#c84050'); p(26, 41 + w, 10, 1, '#c84050');
    return c;
  },
  Skrymir(t) {
    const c = canvas(), p = painter(c);
    // Gigante tan enorme que Thor durmió en su guante; carga un saco de provisiones
    const b = giant(p, t, { skin: '#c89870', armor: '#7a7a88', armorShade: '#5a5a68', robe: '#5a5a68', hair: '#9a9aa8', beard: '#9a9aa8', eyes: '#3a2a1a' });
    p(15, 20 + b, 10, 10, '#9a9aa8');
    p(28, 8 + b, 12, 14, '#a8885c'); p(31, 6 + b, 6, 3, '#8a6a40'); p(30, 20 + b, 4, 14, '#c89870');
    p(0, 38, 10, 9, '#8a7a5a'); p(2, 36, 3, 3, '#8a7a5a'); p(6, 35, 3, 4, '#8a7a5a');
    if (Math.floor(t * 1.5) % 3 === 0) { p(30, 2, 3, 1, '#ffffff'); p(34, 0, 2, 1, '#ffffff'); }
    return c;
  },
  Fornjot(t) {
    const c = canvas(), p = painter(c);
    // Gigante primigenio, padre del mar, el viento y el fuego, con corona y frío alrededor
    const b = giant(p, t, { skin: '#3a3c5c', shade: '#2a2c4c', armor: '#1c2c5c', armorShade: '#101c4c', robe: '#101c4c', hair: '#f4f8ff', beard: '#f4f8ff', eyes: '#a8e0ff' });
    p(14, 20 + b, 12, 10, '#f4f8ff'); p(16, 30 + b, 8, 4, '#f4f8ff');
    p(14, 1 + b, 12, 4, '#d8a030'); for (let i = 0; i < 4; i++) p(14 + i * 4, -1 + b, 2, 3, '#ffd84a');
    const k = Math.floor(t * 2) % 3;
    p(2, 6, 4, 4, k === 0 ? '#78c0ff' : '#3c6cb8'); p(34, 6, 4, 4, k === 1 ? '#e8f8ff' : '#a8a8b8'); flame(p, t, 3, 18 + (k === 2 ? 0 : 1));
    flake(p, t, 36, 2);
    return c;
  },
  Hraesvelg(t) {
    const c = canvas(), p = painter(c);
    // Gigante con forma de águila blanca: cuando bate las alas nace el viento del mundo
    const flap = Math.floor(t * 3) % 2;
    sideWing(p, 12, 24, '#e8f0f8', '#a8d0f0', flap, -1, 6); sideWing(p, 28, 24, '#e8f0f8', '#a8d0f0', flap, 1, 6);
    const b = bob(t);
    p(12, 16 + b, 16, 20, '#f4f8ff'); p(14, 26 + b, 12, 8, '#d8e8f8');
    p(15, 40, 2, 5, '#e8b030'); p(23, 40, 2, 5, '#e8b030'); p(13, 45, 6, 1, '#e8b030'); p(21, 45, 6, 1, '#e8b030'); p(14, 36, 12, 4, '#e8f0f8');
    p(14, 4 + b, 12, 12, '#ffffff'); p(16, 8 + b, 3, 3, '#5ce0f0'); p(22, 8 + b, 3, 3, '#5ce0f0'); p(18, 11 + b, 4, 5, '#e8b030');
    for (let i = 0; i < 3; i++) { const x = (t * 30 + i * 13) % 40; p(x, 38 + i * 3, 6, 1, '#c8e8ff'); }
    return c;
  },
  Audumla(t) {
    const c = canvas(), p = painter(c);
    // Vaca primigenia que lame el hielo salado del que nace el primer dios
    p(30, 30, 10, 16, '#c8e8f8'); p(32, 28, 8, 3, '#e8f8ff');
    const lick = Math.floor(t * 3) % 2;
    p(33, 28 - lick, 4, 4, '#e8b890'); p(34, 26 - lick, 2, 2, '#c8a070');
    const b = quad(p, t, { col: '#f4f4f8', shade: '#d8d8e0', belly: '#e8e8f0', head: 'bull', muzzle: '#e8c0c0', horn: '#d8c8a0', tailc: '#c8c8d0' });
    for (const [x, y] of [[10, 22], [18, 25]]) p(x, y + b, 4, 3, '#c8c8d0');
    p(16, 33 + b, 6, 3, '#e8b8b8');
    for (let i = 0; i < 4; i++) p(4 + i * 6, 45, 4, 2, '#f4f4f8');
    p(37, 21 + b + lick, 2, 2, '#e88a9a');
    return c;
  },
  Ymir(t) {
    const c = canvas(), p = painter(c);
    // El primer gigante, de cuyo cuerpo se hizo el mundo: hielo, barba inmensa y escarcha
    const b = giant(p, t, { skin: '#c8e0f0', shade: '#98c0d8', legs: '#c8e0f0', shoe: '#78a8c8', hair: '#ffffff', beard: '#ffffff', eyes: '#2c6cb8' });
    p(12, 18 + b, 16, 14, '#ffffff'); p(14, 32 + b, 12, 6, '#ffffff'); p(16, 38 + b, 8, 3, '#f4f8ff');
    for (let i = 0; i < 4; i++) p(13 + i * 4, 22 + b + (i % 2) * 4, 1, 6, '#e0ecf4');
    p(0, 44, 40, 4, '#e8f4ff');
    flake(p, t, 2); flake(p, t, 6, 2); flake(p, t, 34, 1); flake(p, t, 38, 3);
    return c;
  },

  // ---------- Egipcias ----------
  Ba(t) {
    const c = canvas(), p = painter(c);
    // El alma: ave de alas doradas con cabeza humana, junto a un anj
    const b = bird(p, t, { col: '#c8883c', wing: '#d8a030', wing2: '#ffe080', belly: '#e8b060', leg: '#c8883c', noHead: true });
    birdHead(p, b, { skin: EG_SKIN, hair: '#101018', short: true });
    p(23, 8 + b, 3, 6, '#101018'); p(24, 20 + b, 12, 2, '#2a5ab8');
    p(2, 34, 5, 1, '#ffd84a'); p(1, 35, 1, 3, '#ffd84a'); p(6, 35, 1, 3, '#ffd84a'); p(2, 38, 5, 1, '#ffd84a'); p(3, 39, 2, 7, '#ffd84a'); p(0, 40, 8, 1, '#ffd84a');
    twinkle(p, t, 4, 30, '#fff8b0');
    return c;
  },
  Abtu(t) {
    const c = canvas(), p = painter(c);
    // Pez dorado de rayas de lapislázuli que nada junto a la barca del sol
    const y = fish(p, t, { col: '#e8b030', fin: '#2a5ab8', stripe: '#2a5ab8', belly: '#f8d880' });
    p(0, 42, 40, 6, '#2c6cb8'); p(4, 41, 10, 1, '#a8e0ff'); p(24, 41, 12, 1, '#a8e0ff');
    bubble(p, t, 36, 16); bubble(p, t, 38, 22, 1);
    return c;
  },
  Serpopard(t) {
    const c = canvas(), p = painter(c);
    // Leopardo de cuello de serpiente que se mece
    const b = quad(p, t, { col: '#d8a048', shade: '#b8802c', belly: '#f0c878', head: 'none', tailc: '#b8802c' });
    for (const [x, y] of [[9, 23], [15, 26], [21, 22], [12, 29], [25, 27], [18, 30]]) p(x, y + b, 2, 2, '#6a4a2a');
    const sw = Math.round(Math.sin(t * 2) * 2);
    for (let k = 0; k < 6; k++) p(25 + Math.round(Math.sin(k * 0.8 + t * 2) * 2) + k, 20 + b - k * 3, 5, 5, '#d8a048');
    p(29 + sw, 0 + b, 9, 6, '#d8a048'); p(37 + sw, 2 + b, 3, 3, '#d8a048'); p(33 + sw, 2 + b, 2, 2, '#ffd84a'); p(29 + sw, -1 + b, 2, 2, '#d8a048');
    for (const [x, y] of [[27, 14], [29, 8]]) p(x, y + b, 2, 2, '#6a4a2a');
    return c;
  },
  Akhekh(t) {
    const c = canvas(), p = painter(c);
    // Grifo del desierto: cuerpo de león, cabeza de ave con cresta y alas de lapislázuli
    const flap = Math.floor(t * 3) % 2;
    const b = quad(p, t, { col: '#d8c088', shade: '#b8a068', belly: '#e8d8a8', head: 'none', tailc: '#8a7a4a' });
    p(25, 14 + b, 8, 10, '#d8c088'); p(27, 7 + b, 10, 10, '#c8b078'); p(36, 11 + b, 4, 3, '#ffd84a'); p(31, 10 + b, 2, 2, DARK);
    for (let i = 0; i < 3; i++) p(26 + i * 3, 3 + b + (i % 2), 2, 5, '#2a5ab8');
    sideWing(p, 22, 22 + b, '#2a5ab8', '#78a8f0', flap, -1, 7);
    p(0, 45, 40, 3, '#e8c878');
    return c;
  },
  Uraeus(t) {
    const c = canvas(), p = painter(c);
    // Cobra dorada erguida con la capucha abierta y disco solar; escupe fuego
    const s = Math.round(Math.sin(t * 2));
    p(2, 40, 26, 6, '#d8a030'); p(4, 36, 22, 5, '#c89020'); p(26, 41, 8, 4, '#c89020'); p(33, 38, 3, 4, '#c89020'); p(35, 36, 2, 3, '#c89020');
    for (let i = 0; i < 5; i++) { p(5 + i * 5, 42, 3, 2, '#a82020'); p(7 + i * 4, 37, 2, 1, '#f0d070'); }
    for (let k = 0; k < 5; k++) { const x = 12 + Math.round(Math.sin(k * 0.8 + 1) * 3) + Math.round(s * k / 4); p(x, 32 - k * 4, 7, 6, '#d8a030'); p(x + 2, 32 - k * 4, 3, 6, '#f0d070'); }
    for (let y = 0; y < 14; y++) {
      const w = Math.round(3 + 7 * Math.sin(Math.PI * (y + 2) / 17));
      p(16 + s - w, 8 + y, w * 2, 1, '#d8a030');
      if (y > 1 && y < 12 && w > 4) { p(16 + s - w + 1, 8 + y, 2, 1, '#c83030'); p(16 + s + w - 3, 8 + y, 2, 1, '#c83030'); }
    }
    p(14 + s, 10, 4, 10, '#f0d070'); for (let i = 0; i < 3; i++) p(14 + s, 12 + i * 3, 4, 1, '#c89020');
    p(12 + s, 3, 9, 7, '#d8a030'); p(13 + s, 5, 2, 2, '#ff3030'); p(18 + s, 5, 2, 2, '#ff3030'); p(20 + s, 6, 3, 3, '#d8a030');
    disc(p, 16 + s, 0, 3, '#e8402c');
    fireBreath(p, t, 23 + s, 6);
    return c;
  },
  Medjed(t) {
    const c = canvas(), p = painter(c);
    // «El que golpea»: una sábana con ojos y pies que dispara rayos con la mirada
    const f = Math.round(Math.sin(t * 2) * 1.5);
    p(12, 6 + f, 16, 4, '#f4f4f8'); p(10, 10 + f, 20, 30, '#f4f4f8'); p(8, 18 + f, 24, 22, '#f4f4f8');
    p(14, 41, 4, 4, '#c8885c'); p(22, 41, 4, 4, '#c8885c');
    p(12, 18 + f, 7, 4, '#ffffff'); p(21, 18 + f, 7, 4, '#ffffff'); p(14, 19 + f, 3, 3, DARK); p(23, 19 + f, 3, 3, DARK);
    p(11, 17 + f, 9, 1, DARK); p(20, 17 + f, 9, 1, DARK); p(14, 22 + f, 1, 4, DARK); p(25, 22 + f, 1, 4, DARK);
    if (Math.floor(t * 3) % 3 === 0) { p(28, 19 + f, 12, 1, '#fff07a'); p(28, 21 + f, 12, 1, '#ffd84a'); }
    return c;
  },
  Criosphinx(t) {
    const c = canvas(), p = painter(c);
    // Esfinge con cabeza de carnero, tumbada como guardiana del templo
    const b = bob(t), col = '#e8b030';
    p(2, 26, 4, 4, '#c89020'); p(0, 24, 3, 3, '#c89020');
    p(4, 28 + b, 28, 12, col); p(6, 38, 28, 6, col); p(26, 40, 14, 4, col); p(34, 44, 6, 2, '#c89020');
    p(24, 14 + b, 12, 16, col); p(22, 10 + b, 14, 12, '#e8d8b0'); p(34, 15 + b, 5, 5, '#e8d8b0'); p(30, 13 + b, 2, 2, DARK);
    p(20, 8 + b, 7, 7, '#c8b080'); p(21, 9 + b, 5, 5, '#a89060'); p(19, 14 + b, 3, 3, '#c8b080');
    p(25, 20 + b, 3, 10, '#2a5ab8'); p(25, 22 + b, 3, 1, '#d8a030'); p(25, 26 + b, 3, 1, '#d8a030');
    p(0, 46, 40, 2, '#c8a060');
    return c;
  },
  Hieracosphinx(t) {
    const c = canvas(), p = painter(c);
    // Esfinge con cabeza de halcón y doble corona
    const b = bob(t), col = '#e8b030';
    p(2, 26, 4, 4, '#c89020'); p(0, 24, 3, 3, '#c89020');
    p(4, 28 + b, 28, 12, col); p(6, 38, 28, 6, col); p(26, 40, 14, 4, col); p(34, 44, 6, 2, '#c89020');
    p(24, 12 + b, 12, 18, '#8a5a30'); p(35, 16 + b, 4, 3, '#ffd84a'); p(36, 19 + b, 2, 2, '#ffd84a');
    p(30, 15 + b, 3, 3, '#ffffff'); p(31, 16 + b, 2, 2, DARK); p(30, 18 + b, 2, 4, DARK);
    p(25, 6 + b, 9, 6, '#f4f4f8'); p(27, 2 + b, 5, 5, '#f4f4f8'); p(24, 8 + b, 3, 4, '#c83030');
    p(0, 46, 40, 2, '#c8a060');
    return c;
  },
  Bennu(t) {
    const c = canvas(), p = painter(c);
    // Garza plateada del renacer, sobre la piedra benben al salir el sol
    disc(p, 8, 8, 5, '#ff9c30'); disc(p, 8, 8, 3, '#ffd84a');
    p(10, 40, 20, 7, '#c8a060'); p(14, 36, 12, 5, '#d8b070'); p(18, 33, 4, 4, '#e8c880');
    const b = bob(t);
    p(17, 24, 2, 10, '#5a5a6a'); p(22, 24, 2, 10, '#5a5a6a');
    p(4, 16 + b, 8, 4, '#8a8a98'); p(2, 18 + b, 6, 8, '#8a8a98');
    p(10, 10 + b, 18, 14, '#c8c8d8'); p(12, 14 + b, 12, 8, '#a8a8b8');
    p(24, 2 + b, 4, 12, '#c8c8d8'); p(24, 0 + b, 8, 5, '#c8c8d8'); p(27, 1 + b, 2, 2, '#ffd84a');
    p(32, 2 + b, 8, 2, DARK); p(22, -1 + b, 3, 3, '#f4f4f8'); p(20, 0 + b, 3, 2, '#f4f4f8');
    return c;
  },
  Ammit(t) {
    const c = canvas(), p = painter(c);
    // La devoradora: cabeza de cocodrilo, melena de león y cuartos de hipopótamo, junto a la balanza
    const b = bob(t);
    p(2, 4, 2, 14, '#d8a030'); p(0, 4, 10, 1, '#d8a030'); p(0, 5, 2, 3, '#d8a030'); p(8, 5, 2, 3, '#d8a030');
    const tip = Math.floor(t) % 2; p(0, 8 + tip, 3, 2, '#c83040'); p(7, 9 - tip, 3, 2, '#f4f4f8');
    [8, 13].forEach((x) => { p(x, 34, 5, 9, '#a87c6c'); p(x, 43, 5, 2, '#7a5a4c'); });
    [23, 28].forEach((x) => { p(x, 32, 3, 11, '#d8a048'); p(x, 43, 4, 2, '#8a6030'); });
    p(6, 22 + b, 14, 13, '#a87c6c'); p(18, 20 + b, 13, 13, '#d8a048');
    p(20, 10 + b, 12, 14, '#c88030'); p(24, 12 + b, 9, 8, '#3c8c4c'); p(31, 14 + b, 9, 5, '#3c8c4c');
    p(31, 18 + b, 9, 1, DARK); for (let i = 0; i < 4; i++) p(32 + i * 2, 19 + b, 1, 1, '#ffffff');
    p(27, 13 + b, 2, 2, '#ffd84a');
    if (Math.floor(t * 2) % 2) p(34, 19 + b, 5, 2, '#5a1a1a');
    return c;
  },

  // ---------- Celtas ----------
  Grindylow(t) {
    const c = canvas(), p = painter(c);
    // Diablillo del agua con garras largas que asoma de la charca
    const w = Math.round(Math.sin(t * 2.5));
    const b = dwarf(p, t, { robe: '#5c8c4c', robeShade: '#4c7c3c', skin: '#6c9c5c', hair: '#4c6c3c', eyes: '#ffd84a' });
    p(10, 12 + b, 20, 5, '#4c6c3c'); for (let i = 0; i < 5; i++) p(10 + i * 4, 10 + b + (i % 2) * 2, 3, 4, '#4c6c3c');
    p(18, 24 + b, 1, 2, '#ffffff'); p(21, 24 + b, 1, 2, '#ffffff');
    const g = Math.floor(t * 3) % 2;
    p(5, 26 + b - g * 3, 4, 2, '#6c9c5c'); p(3, 23 + b - g * 3, 1, 4, '#e8e0c8'); p(5, 22 + b - g * 3, 1, 4, '#e8e0c8'); p(7, 23 + b - g * 3, 1, 4, '#e8e0c8');
    p(31, 26 + b, 4, 2, '#6c9c5c'); p(33, 23 + b, 1, 4, '#e8e0c8'); p(35, 22 + b, 1, 4, '#e8e0c8');
    p(0, 36 + w, 40, 12, '#2c5c5c'); p(2, 35 + w, 10, 2, '#5c9c8c'); p(26, 35 - w, 12, 2, '#5c9c8c');
    return c;
  },
  'Peg Powler'(t) {
    const c = canvas(), p = painter(c);
    // Bruja verde del río con colmillos que emerge de la corriente
    const b = figure(p, t, { robe: '#5c7c3c', robeShade: '#4c6c2c', skin: '#7cac6c', hair: '#3c7c3c', longHair: true, eyes: '#ffd84a', armL: 'up' });
    p(18, 18 + b, 1, 2, '#ffffff'); p(21, 18 + b, 1, 2, '#ffffff'); p(8, 11 + b, 1, 3, '#e8e0c8'); p(10, 10 + b, 1, 3, '#e8e0c8');
    const w = Math.round(Math.sin(t * 2.5));
    p(0, 32 + w, 40, 16, '#3c6c5c'); p(0, 31 + w, 12, 2, '#8cc0a0'); p(24, 31 - w, 16, 2, '#8cc0a0');
    const f = (t * 20) % 40; p(f, 38, 6, 1, '#8cc0a0'); p((f + 18) % 40, 42, 5, 1, '#8cc0a0');
    return c;
  },
  Merrow(t) {
    const c = canvas(), p = painter(c);
    // Sirena irlandesa con el gorro rojo que le permite vivir bajo el mar
    const b = figure(p, t, { robe: '#c83030', robeShade: '#a82020', hair: '#3c9c5c', longHair: true, eyes: '#2c9c8c' });
    p(13, 6 + b, 14, 4, '#c83030'); p(15, 3 + b, 10, 4, '#c83030'); p(23, 2 + b, 3, 3, '#a82020');
    merTail(p, t, b, '#2c8c4c', '#5cc87c');
    p(0, 46, 40, 2, '#2c6cb8');
    return c;
  },
  Selkie(t) {
    const c = canvas(), p = painter(c);
    // Mujer-foca que se quitó la piel: la lleva colgada y mira al mar
    const b = figure(p, t, { robe: '#5a6a7c', robeShade: '#4a5a6c', dress: true, hair: '#101018', longHair: true, eyes: '#3a4a5c' });
    p(14, 22 + b, 12, 1, '#f4f4f8'); for (let i = 0; i < 4; i++) p(15 + i * 3, 23 + b, 1, 1, '#f4f4f8');
    p(27, 26 + b, 8, 16, '#8a8a98'); p(29, 24 + b, 5, 3, '#8a8a98'); p(30, 25 + b, 1, 1, DARK); p(28, 30 + b, 6, 1, '#6a6a78');
    const w = Math.round(Math.sin(t * 2.5));
    p(0, 44 + w, 40, 4, '#2c6cb8'); p(2, 43 + w, 8, 1, '#a8e0ff');
    return c;
  },
  Kelpie(t) {
    const c = canvas(), p = painter(c);
    // Caballo de agua negro con crin de algas que gotea
    const b = quad(p, t, { col: '#1c2040', shade: '#141830', belly: '#2a2c4c', head: 'horse', mane: '#3c8c4c', eye: '#5ce0c0', hoof: '#3c8c4c', tailc: '#3c8c4c' });
    for (const [x, k] of [[22, 0], [10, 1], [16, 2]]) p(x, 22 + b + ((t * 12 + k * 6) % 20), 1, 2, '#78c0ff');
    p(0, 44, 40, 4, '#2c4c7c'); p(2, 43, 8, 1, '#78a0c8');
    return c;
  },
  Brownie(t) {
    const c = canvas(), p = painter(c);
    // Duende de la casa que trabaja de noche a cambio de un cuenco de nata
    const b = dwarf(p, t, { robe: '#8a5a30', robeShade: '#6a4220', belt: '#5a3c20', hair: '#7a4a2a', beard: '#7a4a2a' });
    p(28, 32 + b, 10, 4, '#e8d8c0'); p(29, 36 + b, 8, 2, '#c8b8a0'); p(29, 31 + b, 8, 1, '#ffffff');
    const sw = Math.floor(t * 3) % 2; p(4, 20 + sw, 2, 24, '#a8784c'); p(1, 40 + sw, 8, 6, '#c8a060');
    return c;
  },
  Knocker(t) {
    const c = canvas(), p = painter(c);
    // Duende de las minas con casco y vela, que golpea la roca con su martillo
    p(0, 0, 8, 48, '#5a5a68'); p(32, 0, 8, 48, '#5a5a68'); p(2, 10, 3, 2, '#e8b030'); p(34, 30, 3, 2, '#e8b030');
    const b = dwarf(p, t, { robe: '#7a5434', robeShade: '#5a3c20', belt: '#3a2a1a', hair: '#8a8a98', beard: '#8a8a98' });
    p(13, 12 + b, 14, 5, '#7a7a88'); p(15, 10 + b, 10, 3, '#7a7a88'); p(19, 6 + b, 2, 4, '#f4e8c8'); flame(p, t, 18, 3 + b);
    const up = Math.floor(t * 4) % 2;
    p(29, (up ? 24 : 28) + b, 2, 8, '#6a4a2a'); p(28, (up ? 22 : 26) + b, 4, 3, '#8a8a98');
    if (!up) { p(32, 27, 1, 1, '#ffd84a'); p(31, 29, 1, 1, '#ffd84a'); }
    return c;
  },
  Spriggan(t) {
    const c = canvas(), p = painter(c);
    // Guardián de los túmulos de piel de piedra, pequeño y con su sombra de gigante detrás
    const sh = Math.floor(t * 2) % 2;
    p(13 - sh, 0, 14 + sh * 2, 12, '#3a3a4a'); p(5 - sh, 11, 30 + sh * 2, 8, '#3a3a4a'); p(8, 18, 24, 28, '#3a3a4a'); p(1 - sh, 13, 5, 22, '#3a3a4a'); p(34 + sh, 13, 5, 22, '#3a3a4a');
    p(15, 5, 3, 2, '#ff3030'); p(22, 5, 3, 2, '#ff3030');
    const b = dwarf(p, t, { robe: '#5c7c3c', robeShade: '#4c6c2c', skin: '#9a9a8a', hair: '#a8a8a0', eyes: '#3a3a2a' });
    for (let i = 0; i < 5; i++) p(11 + i * 4, 11 + b + (i % 2) * 2, 3, 4, '#a8a8a0');
    p(10, 18 + b, 3, 2, '#9a9a8a'); p(27, 18 + b, 3, 2, '#9a9a8a');
    return c;
  },
  Boggart(t) {
    const c = canvas(), p = painter(c);
    // Duende travieso de pelo negro, colmillos y ojos amarillos que se asoma
    const pk = Math.round(Math.sin(t * 2) * 3);
    p(26, 0, 14, 48, '#6a4a2a'); p(26, 0, 2, 48, '#4a3218');
    const b = dwarf(p, t, { robe: '#6a6a78', robeShade: '#4a4a58', skin: '#8a6a4a', hair: '#101018', eyes: '#ffd84a' });
    for (let i = 0; i < 5; i++) p(11 + i * 4, 11 + b + (i % 2) * 2, 3, 5, '#101018');
    p(17, 24 + b, 6, 2, '#3a1a1a'); p(18, 24 + b, 1, 2, '#ffffff'); p(21, 24 + b, 1, 2, '#ffffff');
    p(30 + pk, 20, 3, 2, '#8a6a4a');
    return c;
  },
  Banshee(t) {
    const c = canvas(), p = painter(c);
    // Espíritu que llora anunciando una muerte: melena blanca y grito
    const f = ghost(p, t, { col: '#9a9aa8', hair: '#f4f4f8', eye: '#3a3a4a', mouth: '#1c1c24' });
    p(17, 24 + f, 6, 5, '#1c1c24');
    const w = Math.floor(t * 4) % 3;
    for (let i = 0; i <= w; i++) { p(31 + i * 3, 20 + f - i * 2, 1, 6 + i * 4, '#c8c8f0'); p(8 - i * 3, 20 + f - i * 2, 1, 6 + i * 4, '#c8c8f0'); }
    p(16, 23 + f, 1, 4, '#a8c8f0'); p(23, 23 + f, 1, 4, '#a8c8f0');
    return c;
  },
  Barghest(t) {
    const c = canvas(), p = painter(c);
    // Perro negro gigante con cadenas y ojos que brillan
    const b = quad(p, t, { col: '#1c1c24', shade: '#101018', belly: '#2a2a34', head: 'dog', fangs: true, eye: Math.sin(t * 3) > 0 ? '#ff6060' : '#ff3030', tailc: '#101018' });
    p(23, 18 + b, 10, 2, '#7a7a88');
    const sw = Math.floor(t * 3) % 2; for (let i = 0; i < 4; i++) p(22 - i * 3, 20 + b + i * 3 + sw, 2, 2, '#7a7a88');
    p(5, 31, 3, 2, '#7a7a88');
    return c;
  },
  'Black Dog'(t) {
    const c = canvas(), p = painter(c);
    // Perro fantasma de las encrucijadas, entre niebla
    const b = quad(p, t, { col: '#1c1c3a', shade: '#141428', belly: '#2a2a48', head: 'dog', eye: Math.sin(t * 3) > 0 ? '#ff6060' : '#ff3030', tailc: '#141428' });
    for (let i = 0; i < 6; i++) p(6 + i * 4, 18 + b + (i % 2), 3, 3, '#141428');
    const m = (t * 4) % 40; p(m, 42, 10, 3, '#5a5a7a'); p((m + 20) % 40, 44, 8, 3, '#4a4a6a');
    return c;
  },
  'Tylwyth Teg'(t) {
    const c = canvas(), p = painter(c);
    // Hada galesa con alas de libélula, rodeada de luz
    const f = Math.round(Math.sin(t * 3) * 2), flap = Math.floor(t * 6) % 2;
    p(4, 14 + f - flap * 2, 10, 6, '#a8f0f8'); p(26, 14 + f - flap * 2, 10, 6, '#a8f0f8'); p(6, 22 + f, 8, 4, '#78d8e8'); p(26, 22 + f, 8, 4, '#78d8e8');
    const b = dwarf(p, t, { robe: '#8cd04c', robeShade: '#6cb03c', hair: '#e8c040', eyes: '#3c9c4c' });
    p(12, 16 + b, 2, 12, '#e8c040'); p(26, 16 + b, 2, 12, '#e8c040');
    c.getContext('2d').clearRect(12, 41, 16, 7);
    p(15, 41 + f, 3, 3, SKIN); p(22, 41 + f, 3, 3, SKIN);
    twinkle(p, t, 4, 6, '#fff8b0'); twinkle(p, t + 0.4, 34, 34, '#fff8b0'); twinkle(p, t + 0.7, 8, 38, '#fff8b0');
    return c;
  },
  Korrigan(t) {
    const c = canvas(), p = painter(c);
    // Duendecilla bretona que baila junto a los menhires, de ojos rojos
    p(0, 10, 7, 36, '#8a8a98'); p(1, 8, 5, 3, '#8a8a98'); p(33, 18, 7, 28, '#8a8a98');
    const hop = Math.floor(t * 4) % 2;
    const b = dwarf(p, t, { robe: '#2c3c7c', robeShade: '#1c2c5c', belt: '#c83030', hair: '#c83020', eyes: '#ff3030' });
    p(12, 16 + b, 2, 12, '#c83020'); p(26, 16 + b, 2, 12, '#c83020'); p(10, 20 + b, 3, 2, SKIN); p(27, 20 + b, 3, 2, SKIN);
    if (hop) { p(9, 26 + b, 3, 3, '#2c3c7c'); p(28, 26 + b, 3, 3, '#2c3c7c'); }
    p(4, 44, 32, 3, '#4c7c3c');
    return c;
  },
  'Leanan Sidhe'(t) {
    const c = canvas(), p = painter(c);
    // Musa de las hadas, pálida y bella, con su arpa
    const b = figure(p, t, { robe: '#a82040', robeShade: '#881830', dress: true, skin: '#f4e8e8', hair: '#e8b830', longHair: true, eyes: '#3c9c5c', belt: '#d8a030' });
    c.getContext('2d').clearRect(29, 24 + b, 6, 12);
    for (let i = 0; i < 3; i++) p(30 + i * 2, 24 + b, 1, 12, '#f4e8c8');
    const n = (t * 8) % 14; p(36, 18 - n, 2, 2, '#ffffff'); p(38, 14 - n, 1, 4, '#ffffff');
    return c;
  },
  Leprechaun(t) {
    const c = canvas(), p = painter(c);
    // Zapatero de las hadas con sombrero de copa verde, barba roja y su olla de oro
    const b = dwarf(p, t, { robe: '#2c8c3c', robeShade: '#1c6c2c', belt: '#3a2a1a', hair: '#c84a20', beard: '#c84a20', legs: '#2c6c2c' });
    p(11, 13 + b, 18, 3, '#1c6c2c'); p(14, 4 + b, 12, 10, '#2c8c3c'); p(14, 11 + b, 12, 2, '#101018'); p(18, 11 + b, 4, 2, '#ffd84a');
    p(28, 38, 12, 8, '#2a2a34'); p(27, 37, 14, 2, '#3a3a44'); p(29, 34, 10, 4, '#ffd84a'); twinkle(p, t, 33, 34);
    const cn = Math.floor(t * 3) % 3; p(10 - cn * 2, 30 - cn * 4, 3, 3, '#ffd84a');
    return c;
  },
  'Each uisge'(t) {
    const c = canvas(), p = painter(c);
    // Caballo de mar escocés, azul marino, de ojos rojos, que sale de las olas
    const b = quad(p, t, { col: '#1c2c6c', shade: '#141c5c', belly: '#2c3c7c', head: 'horse', mane: '#2c9c8c', eye: '#ff3030', hoof: '#2c9c8c', tailc: '#2c9c8c' });
    const w = Math.round(Math.sin(t * 2.5) * 1.5);
    p(0, 38 + w, 40, 10, '#2c6cb8'); p(2, 37 + w, 10, 2, '#a8e0ff'); p(24, 37 - w, 12, 2, '#a8e0ff');
    return c;
  },
  Afanc(t) {
    const c = canvas(), p = painter(c);
    // Monstruo del lago, como un cocodrilo enorme, que asoma del agua
    const b = quad(p, t, { col: '#5c7c3c', shade: '#4c6c2c', belly: '#8c9c5c', head: 'croc', eye: '#ffd84a', tailc: '#4c6c2c' });
    for (let i = 0; i < 6; i++) p(7 + i * 4, 18 + b + (i % 2), 3, 3, '#3c5c2c');
    const w = Math.round(Math.sin(t * 2.5));
    p(0, 36 + w, 40, 12, '#2c5c7c'); p(2, 35 + w, 10, 2, '#78a8c8'); p(26, 35 - w, 12, 2, '#78a8c8');
    return c;
  },
  Glaistig(t) {
    const c = canvas(), p = painter(c);
    // Dama verde de las Highlands, mitad mujer y mitad cabra
    const b = figure(p, t, { robe: '#3c8c4c', robeShade: '#2c6c3c', hair: '#e8b830', longHair: true, eyes: '#3c9c5c', legs: '#8a8a98', shoe: '#3a3a44', belt: '#d8a030' });
    p(13, 34 + b, 14, 8 - b, '#8a8a98'); p(13, 34 + b, 14, 2, '#a8a8b8'); p(15, 42, 3, 2, '#8a8a98'); p(22, 42, 3, 2, '#8a8a98');
    for (let i = 0; i < 4; i++) p(14 + i * 4, 7 + b, 2, 2, '#ffffff');
    return c;
  },
  Pooka(t) {
    const c = canvas(), p = painter(c);
    // Duende que toma forma de caballo negro de ojos dorados (y orejas de liebre)
    const b = quad(p, t, { col: '#1c1c24', shade: '#101018', belly: '#2a2a34', head: 'horse', mane: '#101018', eye: Math.sin(t * 3) > 0 ? '#fff07a' : '#ffd84a', tailc: '#101018' });
    p(28, 0 + b, 2, 6, '#1c1c24'); p(31, 1 + b, 2, 5, '#1c1c24');
    const m = (t * 5) % 40; p(m, 44, 8, 2, '#4a4a5a');
    return c;
  },
  'Cu Sith'(t) {
    const c = canvas(), p = painter(c);
    // Perro de las hadas, verde oscuro, enorme y de cola enroscada
    const b = quad(p, t, { col: '#3c6c3c', shade: '#2c5c2c', belly: '#4c7c4c', head: 'dog', eye: '#ffd84a', tail: false });
    p(3, 12 + b, 6, 10, '#2c5c2c'); p(6, 10 + b, 6, 4, '#2c5c2c'); p(9, 12 + b, 3, 4, '#2c5c2c');
    for (let i = 0; i < 6; i++) p(6 + i * 4, 18 + b + (i % 2), 3, 3, '#2c5c2c');
    twinkle(p, t, 36, 4, '#c8f0c8');
    return c;
  },
  Wulver(t) {
    const c = canvas(), p = painter(c);
    // Hombre lobo bondadoso de las Shetland que deja pescado a los pobres
    const b = figure(p, t, { robe: '#7a5434', robeShade: '#5a3c20', skin: '#8a6a4a', eyes: DARK, legs: '#8a6a4a', shoe: '#3a2a1a', belt: '#3a2a1a' });
    p(14, 8 + b, 12, 13, '#8a6a4a'); p(24, 13 + b, 7, 6, '#8a6a4a'); p(30, 13 + b, 1, 2, DARK);
    p(14, 3 + b, 3, 6, '#7a5a3a'); p(22, 3 + b, 3, 6, '#7a5a3a'); p(20, 11 + b, 2, 2, '#ffd84a'); p(25, 18 + b, 5, 1, '#3a2a1a');
    const sw = Math.floor(t * 3) % 2;
    p(28, 34 + b, 2, 2, '#a8a8b8'); p(26, 36 + b + sw, 8, 4, '#a8b8c8'); p(33, 35 + b + sw, 3, 6, '#a8b8c8'); p(27, 37 + b + sw, 1, 1, DARK);
    return c;
  },
  'Green Man'(t) {
    const c = canvas(), p = painter(c);
    // Rostro hecho de hojas que brota del bosque
    const s = Math.floor(t * 2) % 2;
    for (let i = 0; i < 9; i++) for (let j = 0; j < 4; j++) p(1 + i * 4 + (j % 2) * 2, 2 + j * 4 + ((i + s) % 2), 4, 4, (i + j) % 2 ? '#5cac3c' : '#3c8c2c');
    p(6, 12, 28, 26, '#6cac4c'); p(4, 16, 4, 16, '#4c9c3c'); p(32, 16, 4, 16, '#4c9c3c');
    p(11, 20, 6, 3, '#f4f8e8'); p(23, 20, 6, 3, '#f4f8e8'); p(13, 20, 3, 3, '#3c2c10'); p(25, 20, 3, 3, '#3c2c10');
    p(10, 17, 8, 2, '#3c7c2c'); p(22, 17, 8, 2, '#3c7c2c'); p(18, 22, 4, 7, '#5c9c3c');
    for (let i = 0; i < 6; i++) p(6 + i * 5, 32 + (i % 2) * 3, 5, 6, i % 2 ? '#4c9c3c' : '#3c8c2c');
    p(15, 31, 10, 3, '#2c4c1c');
    for (let i = 0; i < 4; i++) p(13 + i * 4, 40 + (i % 2) * 2, 3, 5, '#3c8c2c');
    return c;
  },
  'Cait Sith'(t) {
    const c = canvas(), p = painter(c);
    // Gato negro de las hadas, tan grande como un perro, con una mancha blanca en el pecho
    const b = quad(p, t, { col: '#1c1c24', shade: '#101018', belly: '#2a2a34', head: 'cat', eye: '#5ce070', tail: false, hoof: '#1c1c24' });
    p(26, 21 + b, 6, 7, '#f4f4f8'); p(27, 28 + b, 4, 2, '#f4f4f8');
    const sw = Math.floor(t * 2) % 2; p(2, 8 + sw, 3, 16, '#1c1c24'); p(4, 22, 4, 3, '#1c1c24'); p(1 + sw, 6, 3, 3, '#1c1c24');
    return c;
  },
  Dullahan(t) {
    const c = canvas(), p = painter(c);
    // Jinete sin cabeza de armadura negra que alza su propia cabeza, que brilla
    const b = figure(p, t, { robe: '#2a2a34', robeShade: '#1c1c24', belt: '#5a5a68', skin: '#e8e0d0', legs: '#3a3a44', shoe: '#1c1c24', armL: 'up' });
    c.getContext('2d').clearRect(13, 8, 14, 16);
    p(12, 22 + b, 16, 4, '#5a5a68'); p(18, 21 + b, 4, 2, '#8a1a1a');
    p(10, 24 + b, 3, 18, '#3a3a48'); p(27, 24 + b, 3, 18, '#3a3a48');
    p(6, 2 + b, 10, 11, '#e8e0d0'); p(8, 6 + b, 2, 2, '#ffd84a'); p(12, 6 + b, 2, 2, '#ffd84a'); p(8, 10 + b, 6, 1, '#5a1a1a'); p(5, 0 + b, 12, 3, '#3a3a44');
    if (Math.sin(t * 3) > 0) { p(4, 4 + b, 1, 1, '#c8f0ff'); p(17, 8 + b, 1, 1, '#c8f0ff'); }
    p(29, 26 + b, 10, 1, '#e8e0d0'); for (let i = 0; i < 4; i++) p(30 + i * 2, 25 + b + (i % 2) * 2, 1, 1, '#e8e0d0');
    return c;
  },
  'Ddraig Goch'(t) {
    const c = canvas(), p = painter(c);
    // El dragón rojo de Gales, rampante y con las alas abiertas
    const b = dragon(p, t, { col: '#c83030', shade: '#a82020', belly: '#e8b030', wing: '#a82020', wing2: '#e85050', eye: '#ffd84a', horn: '#e8d8b0', spike: '#e8b030' });
    p(0, 45, 40, 3, '#4c9c3c');
    if (Math.floor(t * 3) % 3 === 0) { p(39, 12 + b, 1, 1, '#c8c8d8'); p(38, 10 + b, 1, 1, '#c8c8d8'); }
    return c;
  },

  // ---------- Eslavas ----------
  Ovinnik(t) {
    const c = canvas(), p = painter(c);
    // Espíritu del granero con forma de gato negro de ojos de brasa, sobre la paja
    p(0, 38, 40, 10, '#d8b050'); for (let i = 0; i < 10; i++) p(i * 4, 36 + (i % 2) * 2, 1, 4, '#e8c860');
    const b = quad(p, t, { col: '#1c1c24', shade: '#101018', belly: '#2a2a34', head: 'cat', eye: Math.sin(t * 3) > 0 ? '#ff6060' : '#ff3030', tail: false, hoof: '#1c1c24' });
    const sw = Math.floor(t * 2) % 2; p(2, 8 + sw, 3, 16, '#1c1c24'); p(4, 22, 4, 3, '#1c1c24'); p(1 + sw, 6, 3, 3, '#1c1c24');
    ember(p, t, 6, 36); ember(p, t, 30, 36, 2);
    return c;
  },
  Poludnitsa(t) {
    const c = canvas(), p = painter(c);
    // Dama del mediodía: vestido blanco, hoz y el sol abrasador sobre el trigo
    const g = Math.floor(t * 3) % 2;
    disc(p, 20, 6, 6, g ? '#fff07a' : '#ffd84a');
    const b = figure(p, t, { robe: '#f4f4f8', robeShade: '#d8d8e0', dress: true, hair: '#e8b830', longHair: true, eyes: '#3c6cb8', armR: 'up', belt: '#c83030' });
    p(29, 8 + b, 2, 12, '#8a6a40'); p(28, 4 + b, 7, 2, '#c8c8d8'); p(33, 6 + b, 2, 3, '#c8c8d8');
    for (let i = 0; i < 6; i++) { p(1 + i * 2, 36, 1, 10, '#c8a040'); p(i * 2, 34 + (i + g) % 2, 2, 3, '#e8c060'); p(28 + i * 2, 38, 1, 8, '#c8a040'); p(27 + i * 2, 36 + (i + g) % 2, 2, 3, '#e8c060'); }
    return c;
  },
  'Ognjeni Vuk'(t) {
    const c = canvas(), p = painter(c);
    // Lobo de fuego: pelaje rojo y llamas que le salen del lomo
    const b = quad(p, t, { col: '#c83020', shade: '#a82018', belly: '#e85030', head: 'wolf', eye: '#ffd84a', fangs: true, tailc: '#ff7a20' });
    for (let i = 0; i < 6; i++) flame(p, t, 6 + i * 4, 15 + b - (i % 2), i);
    for (let k = 0; k < 3; k++) ember(p, t, 8 + k * 12, 14, k);
    return c;
  },
  Rusalka(t) {
    const c = canvas(), p = painter(c);
    // Espíritu de las ahogadas: pálida, pelo verde mojado y sin pies, sobre el agua
    const b = figure(p, t, { robe: '#e8eef4', robeShade: '#c8d4e0', dress: true, skin: '#d8e0e0', hair: '#3c8c6c', longHair: true, eyes: '#5ce0c0' });
    c.getContext('2d').clearRect(10, 38, 20, 10);
    const w = Math.floor(t * 3) % 2;
    p(13, 38, 14, 2, '#e8eef4'); p(15 + w, 40, 10, 2, '#c8d4e0');
    p(0, 44, 40, 4, '#2c6c8c'); p(4 + w * 2, 43, 10, 1, '#78c0d8'); p(24 - w * 2, 43, 10, 1, '#78c0d8');
    for (const [x, k] of [[12, 0], [27, 1]]) p(x, 24 + ((t * 10 + k * 6) % 14), 1, 2, '#78c0ff');
    return c;
  },
  Vila(t) {
    const c = canvas(), p = painter(c);
    // Ninfa de las montañas con alas blancas y pelo de oro
    const flap = Math.floor(t * 4) % 2;
    wings(p, 12 + bob(t), '#f4f4f8', '#c8d8f0', flap, 10);
    const b = figure(p, t, { robe: '#f4f4f8', robeShade: '#d8e0e8', dress: true, hair: '#e8b830', longHair: true, eyes: '#3c9c5c', belt: '#e8b830' });
    for (let i = 0; i < 4; i++) p(14 + i * 4, 7 + b, 2, 2, '#ffffff');
    twinkle(p, t, 4, 40, '#fff8b0');
    return c;
  },
  Mavka(t) {
    const c = canvas(), p = painter(c);
    // Ninfa del bosque, pálida, con vestido de hojas y flores en el pelo
    const b = figure(p, t, { robe: '#5cac3c', robeShade: '#3c8c2c', dress: true, skin: '#e8e8e0', hair: '#e8b830', longHair: true, eyes: '#3c9c5c' });
    for (let i = 0; i < 6; i++) p(11 + i * 3, 6 + b + (i % 2), 3, 3, i % 2 ? '#8ce06c' : '#4c9c3c');
    p(14, 7 + b, 2, 2, '#ff7ca0'); p(24, 7 + b, 2, 2, '#ffffff');
    for (let i = 0; i < 4; i++) p(12 + i * 4, 40 + (i % 2) * 2, 3, 3, '#8ce06c');
    const lf = (t * 9) % 46; p(4 + Math.round(Math.sin(t * 3) * 2), lf, 2, 1, '#8cc04c');
    return c;
  },
  Snegurochka(t) {
    const c = canvas(), p = painter(c);
    // Doncella de nieve con kokoshnik blanco, abrigo celeste y trenza dorada
    const b = figure(p, t, { robe: '#a8d8f0', robeShade: '#88b8d8', dress: true, hair: '#e8b830', eyes: '#3c6cb8', trim: '#ffffff' });
    p(12, 4 + b, 16, 6, '#f4f8ff'); p(14, 2 + b, 12, 3, '#f4f8ff'); p(19, 5 + b, 2, 2, '#a8e0ff');
    p(25, 14 + b, 3, 22, '#e8b830'); p(25, 36 + b, 3, 2, '#5cc0e8');
    p(13, 26 + b, 14, 1, '#ffffff'); for (let i = 0; i < 3; i++) p(15 + i * 4, 30 + b, 2, 2, '#ffffff');
    flake(p, t, 3); flake(p, t, 8, 2); flake(p, t, 35, 1);
    return c;
  },
  Morozko(t) {
    const c = canvas(), p = painter(c);
    // Abuelo Escarcha: túnica azul, barba blanca larga, corona y bastón de hielo
    const b = figure(p, t, { robe: '#2c5cb8', robeShade: '#1c4c98', dress: true, hair: '#f4f8ff', beard: '#ffffff', eyes: '#3c6cb8', armR: 'up', trim: '#ffffff' });
    p(14, 26 + b, 12, 8, '#ffffff'); p(13, 4 + b, 14, 5, '#2c5cb8'); p(13, 7 + b, 14, 2, '#ffffff');
    p(29, 4 + b, 2, 42, '#a8d8f0'); p(27, 1 + b, 6, 4, '#e8f8ff'); twinkle(p, t, 30, 2 + b);
    flake(p, t, 3); flake(p, t, 8, 2); flake(p, t, 36, 1);
    return c;
  },
  Karachun(t) {
    const c = canvas(), p = painter(c);
    // Espíritu del solsticio de invierno que acorta los días: capucha y ojos de hielo
    const f = ghost(p, t, { col: '#1c2c5c', hood: '#141c4c', eye: Math.sin(t * 3) > 0 ? '#a8f8ff' : '#5ce0f0', mouth: '#101030' });
    flake(p, t, 3); flake(p, t, 36, 2); flake(p, t, 20, 4);
    return c;
  },
  Gamayun(t) {
    const c = canvas(), p = painter(c);
    // Ave profética de cabeza de mujer, plumaje azul y corona
    const b = bird(p, t, { col: '#1c2c6c', wing: '#2c5cb8', wing2: '#78a8f0', belly: '#2c3c7c', leg: '#d8a030', noHead: true });
    birdHead(p, b, { hair: '#101018', crown: '#d8a030', eyes: '#3c6cb8' });
    const n = (t * 6) % 14; p(6, 14 - n, 1, 4, '#ffd84a'); p(7, 15 - n, 2, 1, '#ffd84a');
    return c;
  },
  Alkonost(t) {
    const c = canvas(), p = painter(c);
    // Ave del paraíso de cabeza de mujer, blanca y lavanda, cuyo canto hace olvidar
    const b = bird(p, t, { col: '#f4f4f8', wing: '#c8b0e8', wing2: '#f4e8ff', belly: '#e8e8f0', leg: '#d8a030', noHead: true });
    birdHead(p, b, { hair: '#e8b830', crown: '#d8a030', eyes: '#7c3cb0' });
    const n = (t * 8) % 16; p(4, 20 - n, 2, 2, '#c8b0e8'); p(6, 16 - n, 1, 4, '#c8b0e8');
    return c;
  },
  Sirin(t) {
    const c = canvas(), p = painter(c);
    // Ave de la tristeza de cabeza de mujer, plumaje oscuro y morado
    const b = bird(p, t, { col: '#1c1c3a', wing: '#5c2c90', wing2: '#a070f0', belly: '#2a2a48', leg: '#d8a030', noHead: true });
    birdHead(p, b, { hair: '#101018', crown: '#c8c8d8', eyes: '#a070f0', skin: '#e8d8d8' });
    p(29, 15 + b, 1, 3, '#a8c8f0');
    return c;
  },
  Vodyanoy(t) {
    const c = canvas(), p = painter(c);
    // Señor de las aguas con cara de rana, barba de algas y medio cuerpo en el agua
    const b = giant(p, t, { skin: '#5c8c4c', shade: '#4c7c3c', eyes: '#ffd84a' });
    p(12, 4 + b, 16, 14, '#5c8c4c'); p(13, 2 + b, 5, 5, '#5c8c4c'); p(22, 2 + b, 5, 5, '#5c8c4c');
    p(14, 3 + b, 3, 3, '#ffd84a'); p(23, 3 + b, 3, 3, '#ffd84a'); p(15, 4 + b, 1, 2, DARK); p(24, 4 + b, 1, 2, DARK);
    p(13, 13 + b, 14, 1, '#2c4c2c'); for (let i = 0; i < 5; i++) p(13 + i * 3, 14 + b, 2, 6 + (i % 2) * 2, '#3c7c4c');
    const w = Math.round(Math.sin(t * 2.5));
    p(0, 32 + w, 40, 16, '#2c5c7c'); p(2, 31 + w, 10, 2, '#78a8c8'); p(26, 31 - w, 12, 2, '#78a8c8');
    bubble(p, t, 6, 44); bubble(p, t, 34, 44, 1);
    return c;
  },
  Kikimora(t) {
    const c = canvas(), p = painter(c);
    // Espíritu doméstico gris y desgreñado que hila de noche
    const b = dwarf(p, t, { robe: '#6a4a2a', robeShade: '#4a3218', skin: '#9a9aa8', hair: '#101018', eyes: '#ffd84a' });
    for (let i = 0; i < 6; i++) p(10 + i * 4, 10 + b + (i % 2) * 3, 3, 6, '#101018');
    p(10, 18 + b, 2, 14, '#101018'); p(28, 18 + b, 2, 14, '#101018');
    const sp = Math.floor(t * 6) % 2;
    p(31, 22 + b, 2, 16, '#a8784c'); p(29 + sp, 28 + b, 6, 4, '#e8e0d0'); p(30, 38 + b, 4, 2, '#8a5a30');
    return c;
  },
  Domovoi(t) {
    const c = canvas(), p = painter(c);
    // Espíritu protector del hogar: camisa roja, pelo gris y barba hasta el suelo, junto a la estufa
    p(28, 22, 12, 26, '#e8d8c8'); p(30, 34, 8, 6, '#2a1a10'); flame(p, t, 32, 35); flame(p, t, 35, 36, 2);
    const b = dwarf(p, t, { robe: '#c83030', robeShade: '#a82020', belt: '#d8a030', hair: '#9a9aa8', beard: '#a8a8b8' });
    p(13, 30 + b, 14, 12, '#a8a8b8'); p(15, 42, 10, 2, '#a8a8b8');
    for (let i = 0; i < 5; i++) p(11 + i * 4, 12 + b + (i % 2), 3, 4, '#9a9aa8');
    return c;
  },
  Leshy(t) {
    const c = canvas(), p = painter(c);
    // Señor del bosque: piel de corteza, barba de musgo, pelo de hojas y astas
    const b = giant(p, t, { skin: '#8a6a4a', shade: '#6a4a2a', robe: '#5c7c3c', belt: '#3c5c2c', hair: '#5cac3c', beard: '#4c7c3c', eyes: '#7cf07c' });
    p(10, 0 + b, 2, 6, '#7a5434'); p(7, 1 + b, 3, 2, '#7a5434'); p(6, -1 + b, 2, 3, '#7a5434'); p(28, 0 + b, 2, 6, '#7a5434'); p(30, 1 + b, 3, 2, '#7a5434'); p(32, -1 + b, 2, 3, '#7a5434');
    for (const [x, y] of [[12, 24], [24, 28], [16, 34]]) p(x, y + b, 1, 4, '#6a4a2a');
    const lf = (t * 9) % 46; p(2 + Math.round(Math.sin(t * 3) * 2), lf, 2, 1, '#8cc04c'); p(36, (lf + 20) % 46, 2, 1, '#8cc04c');
    return c;
  },
  Smok(t) {
    const c = canvas(), p = painter(c);
    // Dragón de Wawel que escupe fuego desde su cueva
    p(0, 0, 14, 48, '#5a5a68'); p(0, 0, 40, 4, '#5a5a68'); p(2, 6, 6, 40, '#2a2a34');
    const b = dragon(p, t, { col: '#3c8c3c', shade: '#2c6c2c', belly: '#e8d050', wing: '#2c6c2c', wing2: '#5cac4c', eye: '#ffd84a' });
    fireBreath(p, t, 37, 13 + b);
    return c;
  },
  Koschei(t) {
    const c = canvas(), p = painter(c);
    // El inmortal: calavera coronada, armadura negra y espada; su muerte, escondida en una aguja dentro de un huevo
    const b = figure(p, t, { robe: '#2a2a34', robeShade: '#1c1c24', belt: '#8a8a98', skin: '#e8e0d0', legs: '#3a3a44', shoe: '#1c1c24', armR: 'up', eyes: DARK });
    p(14, 10 + b, 12, 11, '#e8e0d0'); p(15, 13 + b, 4, 4, DARK); p(21, 13 + b, 4, 4, DARK); p(19, 17 + b, 2, 2, DARK);
    for (let i = 0; i < 4; i++) p(15 + i * 3, 20 + b, 2, 2, '#e8e0d0');
    if (Math.sin(t * 3) > 0) { p(16, 14 + b, 2, 2, '#ff3030'); p(22, 14 + b, 2, 2, '#ff3030'); }
    p(14, 6 + b, 12, 4, '#d8a030'); for (let i = 0; i < 4; i++) p(14 + i * 4, 4 + b, 2, 3, '#ffd84a');
    p(13, 22 + b, 14, 4, '#5a5a68');
    p(28, 0 + b, 2, 14, '#a8a8b8'); p(26, 13 + b, 6, 2, '#5a5a68');
    p(4, 38, 6, 8, '#f4f4e8'); p(5, 37, 4, 1, '#f4f4e8'); p(6, 40, 1, 4, '#c8c8d8'); twinkle(p, t, 7, 36);
    return c;
  },
  'Baba Yaga'(t) {
    const c = canvas(), p = painter(c);
    // La bruja del bosque volando en su mortero, con pañuelo rojo, colmillos y escoba
    const f = Math.round(Math.sin(t * 2) * 2);
    const b = dwarf(p, t, { robe: '#6a4a2a', robeShade: '#4a3218', skin: '#c8b098', hair: '#9a9aa8', eyes: '#3a2a1a' });
    p(12, 13 + b, 16, 4, '#c83030'); p(10, 16 + b, 4, 14, '#c83030'); p(26, 16 + b, 4, 14, '#c83030');
    for (let i = 0; i < 4; i++) p(10 + i * 6, 17 + b + (i % 2) * 2, 2, 8, '#9a9aa8');
    p(19, 20 + b, 2, 4, '#b8987c'); p(18, 24 + b, 1, 2, '#ffffff'); p(21, 24 + b, 1, 2, '#ffffff');
    c.getContext('2d').clearRect(8, 36, 24, 12);
    p(8, 32 + f, 24, 12, '#7a6a5a'); p(7, 31 + f, 26, 3, '#8a7a6a'); p(10, 34 + f, 2, 8, '#5a4a3a'); p(12, 43 + f, 16, 2, '#5a4a3a');
    p(32, 6 + f, 2, 36, '#a8784c'); p(30, 38 + f, 6, 8, '#c8a060');
    const m = Math.floor(t * 6) % 3; p(14 + m * 4, 46, 4, 2, '#8a8a98');
    return c;
  },
  Zmey(t) {
    const c = canvas(), p = painter(c);
    // Dragón de tres cabezas que escupe fuego
    const b = dragon(p, t, { col: '#3c8c3c', shade: '#2c6c2c', belly: '#a8d860', wing: '#2c6c2c', wing2: '#7cc85c', eye: '#ff3030' });
    const s = Math.round(Math.sin(t * 2));
    neck(p, 24, 18 + b, 17, 6 + s, '#3c8c3c', 4); neck(p, 28, 22 + b, 33, 24 - s, '#3c8c3c', 4);
    snakeHead(p, t, 14, 2 + s, '#4c9c4c', '#a8d860', '#ff3030', 1, 1);
    snakeHead(p, t, 31, 21 - s, '#4c9c4c', '#a8d860', '#ff3030', 1, 2);
    fireBreath(p, t, 37, 13 + b);
    return c;
  },
  Firebird(t) {
    const c = canvas(), p = painter(c);
    // Pájaro de fuego con cola de pavo real cuyas plumas brillan como brasas
    const sh = Math.floor(t * 3) % 3;
    for (let i = 0; i < 5; i++) {
      const y = 8 + i * 6;
      for (let k = 0; k < 4; k++) p(10 - k * 3, y + 14 - Math.round((14 - i * 3) * k / 4) * 0 + Math.round((22 - y) * (1 - k / 4) * 0.5), 3, 2, '#ff7a20');
      p(0, y - 1, 4, 4, '#e84a20'); p(1, y, 2, 2, i % 3 === sh ? '#fff07a' : '#ffd84a');
    }
    const b = bird(p, t, { col: '#ff7a20', wing: '#e84a20', wing2: '#ffd84a', belly: '#ffb040', tail: '#ff9c30', beak: '#ffd84a', eye: '#ffd84a', leg: '#c8883c' });
    for (let i = 0; i < 3; i++) flame(p, t, 25 + i * 3, 4 + b - (i % 2), i);
    for (let k = 0; k < 3; k++) ember(p, t, 6 + k * 12, 46, k);
    return c;
  },
  Vampire(t) {
    const c = canvas(), p = painter(c);
    // Vampiro pálido con capa carmesí de cuello alto y colmillos
    const flap = Math.floor(t * 2) % 2;
    p(6 - flap, 22, 7, 24, '#a82030'); p(27, 22, 7 + flap, 24, '#a82030'); p(7 - flap, 24, 4, 20, '#5a1020'); p(29, 24, 4 + flap, 20, '#5a1020');
    const b = figure(p, t, { robe: '#1c1c24', robeShade: '#101018', belt: '#a82030', skin: '#e8e0e8', hair: '#101018', eyes: Math.sin(t * 3) > 0 ? '#ff3030' : '#c82020', legs: '#1c1c24', shoe: '#101018' });
    p(10, 16 + b, 4, 8, '#a82030'); p(26, 16 + b, 4, 8, '#a82030'); p(18, 9 + b, 4, 3, '#101018');
    p(18, 18 + b, 1, 2, '#ffffff'); p(21, 18 + b, 1, 2, '#ffffff');
    p(17, 24 + b, 6, 3, '#f4f4f8'); p(19, 27 + b, 2, 2, '#a82030');
    const bx = (t * 16) % 40; p(bx, 4, 2, 1, '#2a2a34'); p(bx - 2, 3, 2, 1, '#2a2a34'); p(bx + 2, 3, 2, 1, '#2a2a34');
    return c;
  },

  // ---------- Ibéricas ----------
  Xana(t) {
    const c = canvas(), p = painter(c);
    // Hada asturiana de las fuentes que se peina con un peine de oro junto a su ovillo dorado
    const b = figure(p, t, { robe: '#f4f4f8', robeShade: '#d8d8e8', dress: true, hair: '#e8b830', longHair: true, eyes: '#3c9cd8', armR: 'up' });
    const cm = Math.floor(t * 3) % 2; p(27, 9 + b + cm * 3, 5, 2, '#ffd84a'); for (let i = 0; i < 3; i++) p(27 + i * 2, 11 + b + cm * 3, 1, 2, '#ffd84a');
    p(30, 40, 5, 5, '#ffd84a'); p(31, 41, 2, 1, '#fff8b0'); p(34, 44, 6, 1, '#ffd84a');
    p(0, 44, 14, 4, '#4c9cd8'); p(2, 43, 8, 1, '#a8e0ff'); bubble(p, t, 6, 44);
    return c;
  },
  Duende(t) {
    const c = canvas(), p = painter(c);
    // Duende de la casa con gorro rojo que hace travesuras de noche y apaga las velas
    const b = dwarf(p, t, { robe: '#c83030', robeShade: '#a82020', belt: '#5a3c20', hair: '#7a4a2a', beard: '#7a4a2a' });
    p(13, 10 + b, 14, 6, '#c83030'); p(15, 6 + b, 9, 5, '#c83030'); p(21, 3 + b, 4, 4, '#a82020');
    p(32, 30, 3, 10, '#f4e8c8'); p(30, 40, 7, 2, '#8a6a40');
    if (Math.floor(t * 2) % 2) flame(p, t, 32, 26); else { p(33, 26, 1, 2, '#a8a8b8'); p(34, 23, 1, 2, '#a8a8b8'); }
    return c;
  },
  Trenti(t) {
    const c = canvas(), p = painter(c);
    // Duendecillo del bosque cántabro cubierto de hojas y musgo, de ojos amarillos
    const b = dwarf(p, t, { robe: '#5cac3c', robeShade: '#3c8c2c', skin: '#7c9c5c', hair: '#5cac3c', eyes: '#ffd84a' });
    for (let i = 0; i < 6; i++) p(10 + i * 4, 11 + b + (i % 2) * 2, 4, 5, i % 2 ? '#8cd06c' : '#4c9c3c');
    for (let i = 0; i < 5; i++) p(12 + i * 4, 30 + b + (i % 2) * 4, 3, 3, '#8cd06c');
    const s = Math.floor(t * 2) % 2;
    p(0, 34 + s, 8, 12, '#3c7c2c'); p(32, 36 - s, 8, 10, '#3c7c2c');
    return c;
  },
  Trasgo(t) {
    const c = canvas(), p = painter(c);
    // Trasgo cojo y travieso, de gorro rojo, rabo fino y pelo negro revuelto
    const sw = Math.floor(t * 3) % 2;
    p(4, 30, 6, 2, '#1c1c24'); p(2, 26 - sw, 2, 5, '#1c1c24'); p(1, 24 - sw, 3, 3, '#1c1c24');
    const b = dwarf(p, t, { robe: '#c83030', robeShade: '#a82020', belt: '#3a2a1a', hair: '#101018', eyes: '#ffd84a', legs: '#5a3c20' });
    for (let i = 0; i < 4; i++) p(11 + i * 5, 12 + b + (i % 2) * 2, 3, 5, '#101018');
    p(13, 10 + b, 14, 4, '#c83030'); p(15, 7 + b, 9, 4, '#c83030');
    p(17, 24 + b, 6, 2, '#3a1a1a'); p(18, 24 + b, 1, 2, '#ffffff'); p(21, 24 + b, 1, 2, '#ffffff');
    p(21, 41, 5, 2, '#5a3c20');
    return c;
  },
  Anjana(t) {
    const c = canvas(), p = painter(c);
    // Hada buena cántabra: alas blancas, corona de flores y bastón que reparte dones
    const flap = Math.floor(t * 3) % 2;
    wings(p, 12 + bob(t), '#f4f4f8', '#d8e8f8', flap, 9);
    const b = figure(p, t, { robe: '#f4f4f8', robeShade: '#d8d8e8', dress: true, hair: '#101018', longHair: true, eyes: '#3c6cb8', armR: 'up', belt: '#5cc0e8' });
    for (let i = 0; i < 4; i++) p(14 + i * 4, 7 + b, 2, 2, ['#ff7ca0', '#ffd84a', '#ffffff', '#ff7ca0'][i]);
    p(29, 4 + b, 2, 42, '#d8a030'); p(27, 1 + b, 6, 4, '#ffd84a'); twinkle(p, t, 30, 0 + b, '#ffffff');
    for (let k = 0; k < 3; k++) twinkle(p, t + k, 4 + k * 15, 40 - k * 4, '#fff8b0');
    return c;
  },
  Meiga(t) {
    const c = canvas(), p = painter(c);
    // Meiga gallega con sombrero picudo y escoba, junto a la queimada de llama azul
    const b = figure(p, t, { robe: '#1c1c24', robeShade: '#101018', dress: true, hair: '#9a9aa8', longHair: true, eyes: '#3c9c5c', armR: 'up' });
    p(10, 8 + b, 20, 2, '#1c1c24'); p(14, 4 + b, 12, 5, '#1c1c24'); p(17, 0 + b, 7, 5, '#1c1c24'); p(22, -1 + b, 4, 3, '#1c1c24'); p(14, 7 + b, 12, 1, '#7c3cb0');
    p(29, 4 + b, 2, 34, '#8a6a40'); p(27, 36 + b, 6, 10, '#c8a060');
    p(0, 40, 10, 6, '#8a6a40'); p(1, 39, 8, 2, '#a8784c');
    const f = Math.floor(t * 8) % 2; p(2, 34 - f, 6, 5 + f, '#5c8cf0'); p(3, 32 - f, 4, 3, '#a8c8ff');
    return c;
  },
  Odei(t) {
    const c = canvas(), p = painter(c);
    // Genio vasco de la tormenta: nubarrón con ojos, lluvia y rayos
    const f = Math.round(Math.sin(t * 2));
    p(2, 8 + f, 36, 18, '#2a2c4c'); p(6, 4 + f, 26, 6, '#2a2c4c'); p(0, 12 + f, 6, 10, '#2a2c4c'); p(30, 5 + f, 8, 6, '#3a3c5c');
    p(8, 6 + f, 10, 3, '#4a4c6c'); p(22, 6 + f, 10, 3, '#4a4c6c');
    p(11, 14 + f, 5, 3, '#fff07a'); p(24, 14 + f, 5, 3, '#fff07a'); p(15, 21 + f, 10, 2, '#101028');
    const r = (t * 20) % 12;
    for (let i = 0; i < 6; i++) p(4 + i * 6, 28 + ((r + i * 4) % 14), 1, 3, '#78a8f0');
    if (Math.floor(t * 6) % 3 === 0) { p(20, 26, 2, 5, '#fff07a'); p(18, 30, 2, 5, '#fff07a'); p(20, 34, 2, 6, '#fff07a'); }
    return c;
  },
  Washerwoman(t) {
    const c = canvas(), p = painter(c);
    // Lavandera de la noche: espectro blanco que lava ropa en el río
    const f = ghost(p, t, { col: '#e8eef4', hood: '#f4f8ff', eye: '#5a6a7a', mouth: '#a8b8c8' });
    const w = Math.floor(t * 3) % 2;
    p(6, 30 + f, 6, 3, '#e8eef4'); p(28, 30 + f, 6, 3, '#e8eef4');
    p(8 + w * 2, 33 + f, 24, 4, '#c8d0e0'); p(10 + w * 2, 37 + f, 4, 3, '#c8d0e0');
    p(0, 42, 40, 6, '#2c4c7c'); p(4, 41, 10, 1, '#78a8c8'); p(24, 41, 10, 1, '#78a8c8');
    bubble(p, t, 20, 46);
    return c;
  },
  'Santa Compaña'(t) {
    const c = canvas(), p = painter(c);
    // Procesión de almas encapuchadas con velas en la niebla
    const step = Math.floor(t * 2) % 2;
    for (const [x, k] of [[0, 0], [13, 1], [26, 0]]) {
      const y = 12 + ((k + step) % 2);
      p(x + 2, y, 10, 6, '#1c1c24'); p(x + 1, y + 4, 12, 30, '#2a2a34'); p(x + 4, y + 3, 6, 5, '#000000');
      p(x + 5, y + 5, 1, 1, '#5a5a6a'); p(x + 8, y + 5, 1, 1, '#5a5a6a');
      p(x + 10, y + 12, 2, 8, '#f4e8c8'); flame(p, t, x + 9, y + 8, x);
    }
    const m = (t * 4) % 40; p(m, 42, 10, 3, '#8a8a9a'); p((m + 20) % 40, 44, 8, 3, '#7a7a8a');
    return c;
  },
  Sacamantecas(t) {
    const c = canvas(), p = painter(c);
    // El hombre del saco: sombrero de ala ancha, capa negra, cuchillo y saco a la espalda
    p(26, 18, 12, 18, '#a8885c'); p(29, 16, 6, 3, '#8a6a40');
    const b = figure(p, t, { robe: '#1c1c24', robeShade: '#101018', dress: true, skin: '#d8d0c8', hair: '#3a3a44', eyes: '#3a3a44', armL: 'up' });
    p(9, 8 + b, 22, 2, '#1c1c24'); p(13, 3 + b, 14, 6, '#1c1c24'); p(13, 7 + b, 14, 1, '#5a1a1a');
    p(16, 18 + b, 8, 1, '#7a5a5a');
    p(10, 6 + b, 2, 6, '#c8c8d8'); p(9, 12 + b, 4, 2, '#5a3c20');
    if (Math.floor(t * 3) % 3 === 0) twinkle(p, t, 11, 5 + b);
    return c;
  },
  Busgosu(t) {
    const c = canvas(), p = painter(c);
    // Guardián del bosque asturiano: patas de cabra, cuernos y barba de musgo
    const b = figure(p, t, { robe: '#c89870', robeShade: '#a87850', skin: '#c89870', hair: '#4c7c3c', beard: '#4c7c3c', eyes: '#5a3c20', legs: '#7a5434', shoe: '#2a1a10', armR: 'up' });
    p(13, 34 + b, 14, 8 - b, '#7a5434'); p(13, 34 + b, 14, 2, '#8a6440');
    p(13, 4 + b, 3, 6, '#5a4a3a'); p(11, 2 + b, 3, 3, '#5a4a3a'); p(24, 4 + b, 3, 6, '#5a4a3a'); p(26, 2 + b, 3, 3, '#5a4a3a');
    p(28, 2 + b, 2, 40, '#6a4a2a'); p(26, 0 + b, 6, 4, '#4c9c3c');
    const lf = (t * 9) % 46; p(4, lf, 2, 1, '#8cc04c');
    return c;
  },
  Tartalo(t) {
    const c = canvas(), p = painter(c);
    // Cíclope vasco vestido de pieles que guarda su rebaño
    const b = giant(p, t, { skin: '#c89870', armor: '#7a5434', armorShade: '#5a3c20', robe: '#5a3c20', hair: '#101018', wild: true, oneEye: true, eyes: '#5a3c20' });
    if (Math.floor(t * 4) % 6 === 0) p(16, 9 + b, 8, 5, '#c89870');
    const s = Math.floor(t * 2) % 2;
    p(30, 38, 9, 6, '#f4f4f8'); p(36, 35, 4, 4, '#3a3a44'); p(31, 44, 1, 2, '#3a3a44'); p(37, 44, 1, 2, '#3a3a44'); p(29 + s, 36, 2, 2, '#f4f4f8');
    return c;
  },
  'Ojáncanu'(t) {
    const c = canvas(), p = painter(c);
    // Cíclope cántabro de barba roja, doble fila de dientes, que arranca árboles
    const b = giant(p, t, { skin: '#c89870', armor: '#7a7a88', armorShade: '#5a5a68', robe: '#5a5a68', hair: '#c84a20', beard: '#c84a20', oneEye: true, eyes: '#3a2a1a', armR: 'up' });
    p(15, 20 + b, 10, 8, '#c84a20'); p(17, 15 + b, 6, 2, '#f4f4e8'); p(17, 17 + b, 6, 1, '#3a1a1a');
    p(32, -2 + b, 3, 22, '#6a4a2a'); p(28, -4 + b, 12, 6, '#4c9c3c'); p(30, 20 + b, 2, 3, '#6a4a2a'); p(34, 20 + b, 2, 3, '#6a4a2a');
    return c;
  },
  'Cuélebre'(t) {
    const c = canvas(), p = painter(c);
    // Serpiente alada asturiana que guarda tesoros en su cueva
    p(0, 0, 40, 4, '#5a5a68'); p(0, 0, 4, 48, '#5a5a68'); p(36, 0, 4, 48, '#5a5a68');
    p(4, 42, 14, 4, '#d8a030'); p(6, 40, 8, 2, '#ffd84a'); twinkle(p, t, 8, 41);
    serpent(p, t, { col: '#3c8c3c', shade: '#2c6c2c', belly: '#e8d050', eye: '#ffd84a' });
    sideWing(p, 26, 22, '#5c7c3c', '#8cac5c', Math.floor(t * 3) % 2, -1, 6);
    return c;
  },
  Coca(t) {
    const c = canvas(), p = painter(c);
    // Dragona sin alas de las fiestas, con escamas verdes y vientre amarillo
    const b = dragon(p, t, { col: '#4c9c3c', shade: '#3c7c2c', belly: '#e8d050', wings: false, eye: '#ffd84a', spike: '#c83030' });
    for (let i = 0; i < 4; i++) p(10 + i * 5, 26 + b, 2, 2, '#3c7c2c');
    return c;
  },
  Herensuge(t) {
    const c = canvas(), p = painter(c);
    // Dragón vasco de tres cabezas que escupe fuego desde su sima
    p(0, 44, 40, 4, '#5a5a4a');
    const b = dragon(p, t, { col: '#6c7c3c', shade: '#5c6c2c', belly: '#d8c088', wing: '#5c6c2c', wing2: '#a8a068', eye: '#ff3030' });
    const s = Math.round(Math.sin(t * 2));
    neck(p, 24, 18 + b, 17, 6 + s, '#6c7c3c', 4); neck(p, 28, 22 + b, 33, 24 - s, '#6c7c3c', 4);
    snakeHead(p, t, 14, 2 + s, '#7c8c4c', '#d8c088', '#ff3030', 1, 1);
    snakeHead(p, t, 31, 21 - s, '#7c8c4c', '#d8c088', '#ff3030', 1, 2);
    fireBreath(p, t, 37, 13 + b);
    return c;
  },

  // ---------- Europeas ----------
  Salamander(t) {
    const c = canvas(), p = painter(c);
    // Lagartija negra de manchas amarillas que vive en el fuego
    for (let k = 0; k < 6; k++) flame(p, t, 2 + k * 6, 40, k);
    p(4, 46, 34, 2, '#c83020');
    const w = Math.round(Math.sin(t * 3));
    p(0, 30 + w, 8, 3, '#1c1c24'); p(6, 28, 24, 8, '#1c1c24'); p(28, 26, 10, 7, '#1c1c24'); p(36, 28, 3, 3, '#1c1c24');
    for (const [x, y] of [[9, 29], [15, 31], [21, 29], [30, 27], [3, 30]]) p(x, y, 3, 2, '#ffd84a');
    p(32, 27, 2, 2, '#ffd84a'); p(33, 27, 1, 1, DARK);
    for (const x of [8, 24]) { p(x, 35, 3, 4, '#1c1c24'); p(x - 1, 38, 5, 1, '#1c1c24'); }
    return c;
  },
  'Lidérc'(t) {
    const c = canvas(), p = painter(c);
    // Pollito de fuego húngaro que nace de un huevo incubado bajo el brazo
    p(4, 38, 10, 8, '#f4f4e8'); p(5, 36, 8, 3, '#f4f4e8'); p(6, 37, 2, 1, '#c8c8b8'); p(10, 38, 1, 2, '#c8c8b8');
    const b = bird(p, t, { col: '#ff7a20', wing: '#e84a20', wing2: '#ffd84a', belly: '#ffb040', beak: '#ffd84a', eye: DARK, leg: '#e8883c' });
    for (let i = 0; i < 3; i++) flame(p, t, 26 + i * 3, 4 + b - (i % 2), i);
    ember(p, t, 4, 30); ember(p, t, 36, 36, 2);
    return c;
  },
  Zburator(t) {
    const c = canvas(), p = painter(c);
    // Joven rumano de alas de fuego que visita de noche a las doncellas
    const flap = Math.floor(t * 4) % 2;
    wings(p, 12 + bob(t), '#ff7a20', '#ffd84a', flap, 10);
    const b = figure(p, t, { robe: '#1c2c6c', robeShade: '#141c5c', belt: '#d8a030', hair: '#101018', eyes: '#ffd84a' });
    for (let k = 0; k < 3; k++) ember(p, t, 4 + k * 15, 46, k);
    return c;
  },
  Tulikettu(t) {
    const c = canvas(), p = painter(c);
    // Zorro de fuego cuya cola enciende la aurora boreal
    const sh = Math.floor(t * 3) % 3;
    for (let i = 0; i < 8; i++) p(i * 5, 2 + Math.round(Math.sin(i + t * 2) * 2), 5, 8, ['#5ce0a0', '#5cc0e8', '#a070f0'][(i + sh) % 3]);
    const b = quad(p, t, { col: '#e8782c', shade: '#c85a1c', belly: '#f8e8d8', head: 'wolf', eye: DARK, tail: false });
    p(36, 12 + b, 3, 2, '#f8e8d8'); p(27, 5 + b, 3, 5, '#e8782c'); p(32, 5 + b, 3, 5, '#e8782c');
    for (let k = 0; k < 4; k++) flame(p, t, 0 + k * 2, 16 + b + k * 2 - (k % 2) * 2, k);
    p(2, 22 + b, 6, 4, '#ff7a20');
    return c;
  },
  Aitvaras(t) {
    const c = canvas(), p = painter(c);
    // Espíritu lituano: gallo de fuego con cola de serpiente llameante que trae riquezas
    const b = bird(p, t, { col: '#e84a20', wing: '#ff7a20', wing2: '#ffd84a', belly: '#ff9c30', tail: '#ff7a20', beak: '#ffd84a', eye: '#ffd84a', leg: '#c8883c' });
    p(26, 4 + b, 6, 4, '#c83030'); p(27, 2 + b, 2, 3, '#c83030'); p(30, 3 + b, 2, 2, '#c83030'); p(33, 16 + b, 3, 4, '#c83030');
    p(0, 32 + b, 6, 4, '#e84a20'); p(0, 36 + b, 3, 6, '#ff7a20'); flame(p, t, 1, 40 + b, 1);
    const cn = Math.floor(t * 3) % 3; p(8 - cn * 2, 8 + cn * 4, 3, 3, '#ffd84a');
    return c;
  },
  Nixie(t) {
    const c = canvas(), p = painter(c);
    // Ninfa germánica del agua de cola verde y pelo dorado
    const b = figure(p, t, { robe: '#3cc0d8', robeShade: '#2c9cb8', hair: '#e8b830', longHair: true, eyes: '#2c9c8c' });
    merTail(p, t, b, '#2c9c4c', '#7ce09c');
    p(0, 46, 40, 2, '#2c6cb8'); bubble(p, t, 4, 30); bubble(p, t, 36, 26, 2);
    return c;
  },
  Undine(t) {
    const c = canvas(), p = painter(c);
    // Espíritu elemental del agua: cuerpo que se vuelve ola en lugar de piernas
    const b = figure(p, t, { robe: '#4c9cd8', robeShade: '#3c7cb8', dress: true, skin: '#c8e8f8', hair: '#5ce0f0', longHair: true, eyes: '#2c6cb8' });
    c.getContext('2d').clearRect(10, 36, 20, 12);
    const w = Math.floor(t * 4) % 4;
    for (let i = 0; i < 4; i++) p(12 + Math.round(Math.sin(i + w) * 2), 36 + i * 3, 16 - i * 2, 3, i % 2 ? '#78c0ff' : '#4c9cd8');
    p(4 + w, 44, 6, 2, '#a8e0ff'); p(30 - w, 44, 6, 2, '#a8e0ff');
    bubble(p, t, 6, 38); bubble(p, t, 34, 36, 1);
    return c;
  },
  Wolpertinger(t) {
    const c = canvas(), p = painter(c);
    // Liebre bávara con astas de ciervo y alitas
    const b = bob(t), hop = Math.floor(t * 3) % 3 === 0 ? 2 : 0;
    p(4, 30 - hop, 5, 5, '#f4f4f8');
    p(8, 26 + b - hop, 22, 14, '#8a5a30'); p(10, 36 - hop, 20, 4, '#a8784c'); p(6, 38 - hop, 10, 6, '#7a4a20'); p(4, 43 - hop, 10, 2, '#6a3a18');
    p(26, 38 - hop, 4, 7, '#8a5a30');
    p(24, 16 + b - hop, 12, 12, '#8a5a30'); p(34, 21 + b - hop, 3, 3, '#a8784c'); p(36, 22 + b - hop, 1, 1, '#e88a9a'); p(30, 19 + b - hop, 2, 2, DARK);
    p(25, 6 + b - hop, 3, 11, '#8a5a30'); p(29, 8 + b - hop, 3, 9, '#7a4a20');
    p(26, 0 + b - hop, 2, 7, '#e8d8b0'); p(23, 2 + b - hop, 3, 2, '#e8d8b0'); p(31, 2 + b - hop, 2, 6, '#e8d8b0'); p(33, 3 + b - hop, 3, 2, '#e8d8b0');
    sideWing(p, 18, 28 + b - hop, '#a8784c', '#e8d8b0', Math.floor(t * 5) % 2, -1, 4);
    return c;
  },
  Fairy(t) {
    const c = canvas(), p = painter(c);
    // Hada pequeña de alas rosas con varita que suelta estrellas
    const f = Math.round(Math.sin(t * 3) * 2), flap = Math.floor(t * 6) % 2;
    p(4, 14 + f - flap * 2, 10, 7, '#ffb0d8'); p(26, 14 + f - flap * 2, 10, 7, '#ffb0d8'); p(6, 22 + f, 8, 5, '#ff90c8'); p(26, 22 + f, 8, 5, '#ff90c8');
    const b = dwarf(p, t, { robe: '#ff7cb0', robeShade: '#e85c98', hair: '#e8c040', eyes: '#3c6cb8' });
    p(12, 16 + b, 2, 12, '#e8c040'); p(26, 16 + b, 2, 12, '#e8c040');
    c.getContext('2d').clearRect(12, 41, 16, 7); p(15, 41 + f, 3, 3, SKIN); p(22, 41 + f, 3, 3, SKIN);
    p(31, 20 + b, 1, 10, '#f4f4f8'); p(30, 17 + b, 3, 3, '#ffd84a'); twinkle(p, t, 31, 15 + b, '#ffffff');
    const st = (t * 10) % 16; p(34 + Math.round(st / 4), 18 + st, 1, 1, '#fff8b0');
    return c;
  },
  Sylph(t) {
    const c = canvas(), p = painter(c);
    // Espíritu elemental del aire: alas de libélula, pelo blanco y cuerpo de brisa
    const flap = Math.floor(t * 6) % 2;
    p(2, 12 - flap * 2, 12, 8, '#a8f0f8'); p(26, 12 - flap * 2, 12, 8, '#a8f0f8'); p(4, 22, 10, 5, '#78d8e8'); p(26, 22, 10, 5, '#78d8e8');
    const b = figure(p, t, { robe: '#f4f8ff', robeShade: '#d8e8f8', dress: true, skin: '#f4ece8', hair: '#f4f8ff', longHair: true, eyes: '#5cc0e8' });
    c.getContext('2d').clearRect(10, 38, 20, 10);
    p(13, 38, 14, 2, '#e8f4ff'); p(16, 40, 8, 2, '#d8ecf8'); p(18, 42, 4, 2, '#c8e4f4');
    const w = (t * 30) % 40; p(w, 34, 8, 1, '#c8f0ff'); p((w + 20) % 40, 8, 6, 1, '#c8f0ff');
    return c;
  },
  Turul(t) {
    const c = canvas(), p = painter(c);
    // Halcón mítico de los magiares con las alas abiertas y una espada en las garras
    const flap = Math.floor(t * 3) % 2;
    sideWing(p, 12, 26, '#c8883c', '#ffd84a', flap, -1, 6); sideWing(p, 28, 26, '#c8883c', '#ffd84a', flap, 1, 6);
    const b = bob(t);
    p(12, 16 + b, 16, 20, '#c8883c'); p(14, 26 + b, 12, 8, '#e8b060');
    p(10, 42, 20, 2, '#c8c8d8'); p(8, 41, 4, 4, '#d8a030');
    p(15, 36, 2, 6, '#e8b030'); p(23, 36, 2, 6, '#e8b030');
    p(14, 4 + b, 12, 12, '#c8883c'); p(16, 8 + b, 3, 3, '#ffd84a'); p(22, 8 + b, 3, 3, '#ffd84a'); p(17, 9 + b, 1, 1, DARK); p(23, 9 + b, 1, 1, DARK);
    p(18, 11 + b, 4, 5, '#ffd84a');
    return c;
  },
  Pakkanen(t) {
    const c = canvas(), p = painter(c);
    // Duendecillo de la helada finlandesa, vestido de pieles blancas, que pinta escarcha
    const b = dwarf(p, t, { robe: '#f4f8ff', robeShade: '#d8e4f0', hair: '#ffffff', beard: '#ffffff', eyes: '#3c9cff', legs: '#c8d8e8' });
    p(12, 12 + b, 16, 5, '#f4f8ff'); p(15, 9 + b, 10, 4, '#f4f8ff');
    for (let k = 0; k < 4; k++) { const x = 3 + k * 10; p(x, 44, 1, 3, '#a8e0ff'); p(x - 1, 45, 3, 1, '#a8e0ff'); }
    flake(p, t, 4); flake(p, t, 34, 2);
    return c;
  },
  Pakkasukko(t) {
    const c = canvas(), p = painter(c);
    // Viejo de la helada con abrigo de piel blanca, barba larga y bastón de hielo
    const b = figure(p, t, { robe: '#f4f8ff', robeShade: '#d8e4f0', dress: true, hair: '#ffffff', beard: '#ffffff', eyes: '#3c6cb8', armR: 'up', trim: '#a8c8e0' });
    p(14, 26 + b, 12, 10, '#ffffff'); p(12, 6 + b, 16, 5, '#e8f0f8'); p(11, 9 + b, 18, 2, '#f4f8ff');
    p(29, 4 + b, 2, 42, '#a8d8f0'); p(27, 1 + b, 6, 4, '#e8f8ff'); twinkle(p, t, 30, 2 + b);
    flake(p, t, 3); flake(p, t, 8, 2); flake(p, t, 36, 1);
    return c;
  },
  Gnome(t) {
    const c = canvas(), p = painter(c);
    // Gnomo de jardín: gorro rojo puntiagudo, barba blanca larga, junto a una seta
    const b = dwarf(p, t, { robe: '#2c5cb8', robeShade: '#1c4c98', belt: '#3a2a1a', hair: '#f4f4f8', beard: '#ffffff' });
    p(15, 30 + b, 10, 8, '#ffffff');
    p(13, 10 + b, 14, 6, '#c83030'); p(15, 5 + b, 10, 6, '#c83030'); p(17, 1 + b, 6, 5, '#c83030'); p(19, -1 + b, 3, 3, '#a82020');
    p(31, 36, 3, 10, '#f4e8d8'); p(27, 30, 12, 7, '#c83030'); p(29, 31, 2, 2, '#ffffff'); p(34, 32, 2, 2, '#ffffff');
    return c;
  },
  Kobold(t) {
    const c = canvas(), p = painter(c);
    // Duende de las minas con capucha verde, farol y ojos amarillos
    p(0, 0, 6, 48, '#4a4a58'); p(34, 0, 6, 48, '#4a4a58'); p(1, 20, 3, 2, '#5ce0f0');
    const b = dwarf(p, t, { robe: '#7a5434', robeShade: '#5a3c20', belt: '#3a2a1a', skin: '#a88868', eyes: '#ffd84a' });
    p(11, 12 + b, 18, 6, '#3c8c3c'); p(13, 8 + b, 14, 5, '#3c8c3c'); p(11, 16 + b, 3, 10, '#3c8c3c'); p(26, 16 + b, 3, 10, '#3c8c3c');
    p(30, 30 + b, 5, 7, '#3a3a44'); p(31, 31 + b, 3, 5, Math.sin(t * 5) > 0 ? '#ffd84a' : '#ffb030'); p(32, 28 + b, 1, 2, '#3a3a44');
    return c;
  },
  'Menninkäinen'(t) {
    const c = canvas(), p = painter(c);
    // Duende finlandés del bosque con gorro marrón y barba gris, entre setas
    const b = dwarf(p, t, { robe: '#5c7c3c', robeShade: '#4c6c2c', belt: '#3a2a1a', hair: '#9a9aa8', beard: '#9a9aa8' });
    p(13, 10 + b, 14, 6, '#7a5434'); p(15, 6 + b, 9, 5, '#7a5434'); p(21, 3 + b, 4, 4, '#5a3c20');
    for (const x of [2, 32]) { p(x + 2, 40, 2, 6, '#f4e8d8'); p(x, 37, 6, 4, '#c88030'); }
    const lf = (t * 9) % 46; p(36, lf, 2, 1, '#8cc04c');
    return c;
  },
  Myrmecoleon(t) {
    const c = canvas(), p = painter(c);
    // Hormiga-león: delante león, detrás cuerpo de hormiga
    const b = bob(t), st = Math.floor(t * 4) % 2;
    for (let i = 0; i < 3; i++) p(4 + i * 4, 32 + ((i + st) % 2), 1, 11, '#5a3c20');
    p(0, 22 + b, 10, 10, '#7a5434'); p(8, 26 + b, 6, 6, '#6a4420'); p(12, 22 + b, 10, 10, '#7a5434');
    [23, 28].forEach((x) => { p(x, 32, 3, 11, '#c8a048'); p(x, 43, 4, 2, '#8a6a30'); });
    p(20, 20 + b, 12, 13, '#c8a048');
    p(22, 8 + b, 15, 18, '#a8782c'); p(27, 11 + b, 10, 10, '#d8b058'); p(35, 15 + b, 4, 4, '#d8b058'); p(31, 13 + b, 2, 2, '#e83030'); p(34, 19 + b, 4, 1, '#5a3020');
    return c;
  },
  Tatzelwurm(t) {
    const c = canvas(), p = painter(c);
    // Gusano alpino con cabeza de gato y solo dos patas delanteras
    const w = Math.round(Math.sin(t * 3) * 2);
    for (let i = 0; i < 6; i++) p(1 + i * 4, 32 + Math.round(Math.sin(i * 0.9 + t * 3) * 2), 6, 8, i % 2 ? '#7a7a88' : '#6a6a78');
    p(20, 28, 12, 12, '#7a7a88'); p(22, 38, 3, 6, '#6a6a78'); p(28, 38, 3, 6, '#6a6a78'); p(21, 43, 5, 2, '#e8e0c8'); p(27, 43, 5, 2, '#e8e0c8');
    p(26, 14 + w, 13, 12, '#8a8a98'); p(26, 10 + w, 3, 5, '#8a8a98'); p(35, 10 + w, 3, 5, '#8a8a98');
    p(28, 18 + w, 3, 2, '#ffd84a'); p(33, 18 + w, 3, 2, '#ffd84a'); p(29, 18 + w, 1, 2, DARK); p(34, 18 + w, 1, 2, DARK);
    p(31, 22 + w, 2, 1, '#d88c9c'); p(30, 23 + w, 4, 1, '#3a2a2a');
    return c;
  },
  Gargoyle(t) {
    const c = canvas(), p = painter(c);
    // Gárgola de piedra agazapada en la cornisa, de ojos rojos; a veces se mueve
    p(0, 40, 40, 8, '#6a6a78'); p(0, 40, 40, 2, '#8a8a98');
    const flap = Math.floor(t * 2) % 4 === 0 ? 1 : 0;
    sideWing(p, 12, 22, '#7a7a88', '#9a9aa8', flap, -1, 5); sideWing(p, 28, 22, '#7a7a88', '#9a9aa8', flap, 1, 5);
    p(12, 22, 16, 14, '#8a8a98'); p(10, 32, 6, 8, '#8a8a98'); p(24, 32, 6, 8, '#8a8a98');
    p(9, 38, 3, 2, '#5a5a68'); p(28, 38, 3, 2, '#5a5a68');
    p(13, 8, 14, 14, '#8a8a98'); p(13, 4, 3, 5, '#6a6a78'); p(24, 4, 3, 5, '#6a6a78');
    p(16, 12, 2, 2, Math.sin(t * 3) > 0 ? '#ff3030' : '#a82020'); p(22, 12, 2, 2, Math.sin(t * 3) > 0 ? '#ff3030' : '#a82020');
    p(16, 17, 8, 2, '#3a3a44'); p(17, 17, 1, 2, '#e8e8e0'); p(22, 17, 1, 2, '#e8e8e0');
    for (const [x, y] of [[15, 26], [22, 30]]) p(x, y, 3, 1, '#6a6a78');
    return c;
  },
  "Will-o'-wisp"(t) {
    const c = canvas(), p = painter(c);
    // Fuego fatuo: llama cian que flota sobre la ciénaga y atrae a los viajeros
    p(0, 42, 40, 6, '#2c3c3c'); for (let i = 0; i < 5; i++) p(3 + i * 8, 38, 1, 5, '#4c6c4c');
    const f = Math.round(Math.sin(t * 2.5) * 3), k = Math.floor(t * 6) % 2;
    disc(p, 20, 22 + f, 9, '#2c8c9c'); disc(p, 20, 22 + f, 7, '#3cc0d8'); disc(p, 20, 23 + f, 4, '#a8f8ff');
    p(17, 10 + f - k, 6, 6, '#3cc0d8'); p(19, 6 + f - k, 3, 5, '#78e0f0'); p(20, 3 + f - k, 1, 3, '#a8f8ff');
    p(17, 21 + f, 2, 2, '#1c4c5c'); p(22, 21 + f, 2, 2, '#1c4c5c');
    twinkle(p, t, 6, 14, '#a8f8ff'); twinkle(p, t + 0.5, 34, 30, '#a8f8ff');
    return c;
  },
  'Etiäinen'(t) {
    const c = canvas(), p = painter(c);
    // El doble que llega antes que uno: espíritu y su sombra que se adelanta
    const k = Math.floor(t * 2) % 2;
    const ctx = c.getContext('2d');
    ctx.globalAlpha = 0.45; ghost(p, t + 1, { col: '#c8d8e8', hair: '#8a6a4a', eye: '#5a6a7a', mouth: '#a8b8c8' });
    const img = ctx.getImageData(0, 0, 40, 48); ctx.clearRect(0, 0, 40, 48); ctx.putImageData(img, 6 + k * 2, 0);
    ctx.globalAlpha = 1;
    ghost(p, t, { col: '#f4f4f8', hair: '#7a5434', eye: '#3a3a4a', mouth: '#c8c8d8' });
    return c;
  },
  Homunculus(t) {
    const c = canvas(), p = painter(c);
    // Hombrecillo de alquimista dentro de su matraz
    p(16, 0, 8, 12, '#a8d8e8'); p(15, 0, 10, 2, '#8a6a40');
    disc(p, 20, 30, 15, '#a8d8e8'); disc(p, 20, 30, 13, '#d8f0f8');
    p(8, 34, 24, 8, '#a8e0c8');
    const f = Math.round(Math.sin(t * 2) * 1.5);
    p(16, 18 + f, 8, 8, '#f0c0a0'); p(17, 21 + f, 2, 2, DARK); p(21, 21 + f, 2, 2, DARK); p(18, 24 + f, 4, 1, '#b07060');
    p(15, 26 + f, 10, 8, '#f0c0a0'); p(13, 27 + f, 2, 5, '#f0c0a0'); p(25, 27 + f, 2, 5, '#f0c0a0'); p(16, 34 + f, 3, 4, '#f0c0a0'); p(21, 34 + f, 3, 4, '#f0c0a0');
    bubble(p, t, 10, 38); bubble(p, t, 28, 40, 1);
    p(12, 20, 2, 6, '#ffffff');
    return c;
  },
  Cockatrice(t) {
    const c = canvas(), p = painter(c);
    // Gallo con alas de murciélago verde y cola de serpiente, de mirada mortal
    const b = bird(p, t, { col: '#f4f4f8', wing: '#3c8c3c', wing2: '#7cc85c', belly: '#e8e8f0', tail: '#3c8c3c', beak: '#ffd84a', eye: '#ff3030', leg: '#ffd84a' });
    p(26, 4 + b, 6, 4, '#c83030'); p(27, 2 + b, 2, 3, '#c83030'); p(30, 3 + b, 2, 2, '#c83030'); p(33, 16 + b, 3, 4, '#c83030');
    p(0, 24 + b, 4, 10, '#3c8c3c'); snakeHead(p, t, 0, 18 + b, '#4c9c4c', '#a8d860', '#ffd84a', -1, 1);
    return c;
  },
  Wyvern(t) {
    const c = canvas(), p = painter(c);
    // Dragón de dos patas con alas grandes, gris pizarra
    const b = dragon(p, t, { col: '#5a6a7c', shade: '#4a5a6c', belly: '#d8c088', wing: '#4a5a6c', wing2: '#8a9aac', legs: 2, eye: '#ffd84a' });
    p(0, 22, 3, 4, '#4a5a6c'); p(0, 20, 2, 3, '#8a9aac');
    return c;
  },
  Kulshedra(t) {
    const c = canvas(), p = painter(c);
    // Serpiente albanesa negra con cuernos y alas que escupe fuego y trae sequía
    p(0, 44, 40, 4, '#c8a060'); for (let i = 0; i < 4; i++) p(4 + i * 10, 45, 4, 1, '#8a6a40');
    serpent(p, t, { col: '#3c3c50', shade: '#4a4a60', belly: '#8a7a9a', eye: '#ff3030' });
    p(28, 8, 2, 5, '#8a7a6a'); p(34, 8, 2, 5, '#8a7a6a');
    sideWing(p, 27, 22, '#2c2c40', '#6a5a80', Math.floor(t * 3) % 2, -1, 6);
    fireBreath(p, t, 36, 12);
    return c;
  },
  Ajatar(t) {
    const c = canvas(), p = painter(c);
    // Diablesa-serpiente de los bosques finlandeses, verde musgo, cuernos negros y fuego
    p(0, 0, 6, 46, '#5a3c20'); p(34, 0, 6, 46, '#5a3c20'); p(0, 0, 40, 4, '#3c6c2c');
    serpent(p, t, { col: '#5c7c3c', shade: '#4c6c2c', belly: '#a8c070', eye: '#ff3030' });
    p(28, 7, 2, 6, '#1c1c24'); p(34, 7, 2, 6, '#1c1c24'); p(27, 6, 2, 2, '#1c1c24'); p(35, 6, 2, 2, '#1c1c24');
    fireBreath(p, t, 36, 12);
    return c;
  },
  Tarasque(t) {
    const c = canvas(), p = painter(c);
    // Tarasca: caparazón de tortuga con púas, cabeza de dragón y cola de escorpión
    const b = turtle(p, t, { shell: '#5c7c3c', skin: '#3c8c4c', skinShade: '#2c6c3c', rim: '#c8a060' });
    for (let i = 0; i < 6; i++) p(6 + i * 5, 20 + b + Math.abs(2.5 - i) * 1.5, 2, 4, '#e8d8b0');
    const tl = Math.floor(t * 3) % 2; p(0, 26 + b, 4, 8, '#3c8c4c'); p(1, 20 + b - tl, 3, 7, '#3c8c4c'); p(3, 18 + b - tl, 3, 3, '#c83030');
    p(32, 24 + b, 6, 10, '#3c8c4c'); p(30, 16 + b, 10, 9, '#3c8c4c'); p(32, 13 + b, 2, 4, '#e8d8b0'); p(36, 13 + b, 2, 4, '#e8d8b0');
    p(34, 18 + b, 2, 2, '#ffd84a'); p(33, 23 + b, 7, 1, DARK); p(35, 24 + b, 1, 1, '#ffffff'); p(38, 24 + b, 1, 1, '#ffffff');
    return c;
  },
  Melusine(t) {
    const c = canvas(), p = painter(c);
    // Dama con cola de serpiente azul y alas de dragón, que se revela el sábado
    const flap = Math.floor(t * 3) % 2;
    for (const d of [-1, 1]) for (let i = 0; i < 4; i++) p(d < 0 ? 1 + i * 2 : 27, 12 + i * 3 + flap * 2, 12 - i * 3, 3, '#1c2c6c');
    const b = figure(p, t, { robe: '#3c6cd8', robeShade: '#2c4cb8', hair: '#e8b830', longHair: true, eyes: '#3c6cb8' });
    c.getContext('2d').clearRect(12, 38, 16, 10);
    const w = Math.round(Math.sin(t * 2.5) * 2);
    p(12, 34 + b, 16, 6, '#2c5cb8'); p(8, 39, 26, 7, '#2c5cb8'); p(10, 42, 20, 3, '#78a8f0');
    p(32, 36 + w, 5, 5, '#2c5cb8'); p(36, 33 + w, 3, 4, '#2c5cb8'); for (let i = 0; i < 6; i++) p(9 + i * 4, 40, 2, 1, '#1c4c98');
    return c;
  },
  Lorelei(t) {
    const c = canvas(), p = painter(c);
    // Sirena del Rin sentada en su roca, peinando su pelo dorado mientras canta
    const b = figure(p, t, { robe: '#e8b830', robeShade: '#c89820', dress: true, hair: '#ffd84a', longHair: true, eyes: '#3c9c5c', armR: 'up' });
    const cm = Math.floor(t * 3) % 2; p(27, 9 + b + cm * 3, 5, 2, '#f4f4f8'); for (let i = 0; i < 3; i++) p(27 + i * 2, 11 + b + cm * 3, 1, 2, '#f4f4f8');
    p(4, 42, 32, 6, '#6a6a78'); p(8, 40, 24, 3, '#7a7a88');
    p(0, 44, 6, 4, '#2c6cb8'); p(34, 44, 6, 4, '#2c6cb8');
    const n = (t * 8) % 16; p(4, 26 - n, 2, 2, '#ffffff'); p(6, 22 - n, 1, 4, '#ffffff'); p(7, 22 - n, 2, 1, '#ffffff');
    return c;
  },
  'Iku-Turso'(t) {
    const c = canvas(), p = painter(c);
    // Monstruo marino finlandés: cabeza con cuernos y seis tentáculos que salen del mar
    p(0, 36, 40, 12, '#1c3c7c'); p(2, 35, 10, 2, '#5c8cc8'); p(26, 35, 12, 2, '#5c8cc8');
    const w = Math.floor(t * 4);
    for (let i = 0; i < 6; i++) {
      const x0 = 2 + i * 6 + (i > 2 ? 4 : 0);
      for (let k = 0; k < 5; k++) p(x0 + Math.round(Math.sin(k * 0.9 + (w + i) * 0.8) * 2), 34 - k * 5 + (i % 2) * 4, 3, 5, '#1c2c5c');
    }
    p(12, 14, 16, 22, '#2c3c6c'); p(14, 8, 12, 8, '#2c3c6c'); p(12, 4, 3, 6, '#c8c8b8'); p(25, 4, 3, 6, '#c8c8b8');
    p(15, 16, 3, 3, '#ffd84a'); p(22, 16, 3, 3, '#ffd84a'); p(16, 24, 8, 2, '#101028');
    return c;
  },
  Solomonar(t) {
    const c = canvas(), p = painter(c);
    // Mago rumano que cabalga dragones y manda en las tormentas, con su libro y bastón
    p(2, 0, 36, 6, '#4a4a5a'); p(6, 4, 28, 3, '#5a5a6a');
    if (Math.floor(t * 6) % 3 === 0) { p(6, 7, 2, 4, '#fff07a'); p(4, 10, 2, 4, '#fff07a'); }
    const b = figure(p, t, { robe: '#1c1c24', robeShade: '#101018', dress: true, hair: '#9a9aa8', beard: '#a8a8b8', eyes: '#3c6cb8', armR: 'up' });
    p(14, 26 + b, 12, 10, '#a8a8b8'); p(10, 8 + b, 20, 2, '#1c1c24'); p(14, 2 + b, 12, 7, '#1c1c24'); p(17, -2 + b, 6, 5, '#1c1c24');
    p(29, 4 + b, 2, 42, '#6a4a2a'); disc(p, 30, 3 + b, 2, '#a8e0ff');
    p(6, 30 + b, 6, 8, '#7a2030'); p(7, 31 + b, 4, 6, '#f4e8c8');
    return c;
  },
  Hippogriff(t) {
    const c = canvas(), p = painter(c);
    // Hipogrifo: delante águila, detrás caballo, con alas blancas
    const flap = Math.floor(t * 3) % 2;
    const b = quad(p, t, { col: '#f4f4f8', shade: '#d8d8e0', belly: '#e8e8f0', head: 'none', tailc: '#c8c8d0' });
    p(22, 20 + b, 10, 13, '#c8a070'); p(23, 43, 4, 2, '#e8b030'); p(28, 43, 4, 2, '#e8b030'); p(23, 32, 3, 11, '#c8a070'); p(28, 32, 3, 11, '#c8a070');
    p(25, 14 + b, 8, 10, '#c8a070'); p(27, 7 + b, 10, 10, '#f4f4f8'); p(36, 11 + b, 4, 3, '#ffd84a'); p(37, 14 + b, 2, 2, '#e8b030'); p(31, 10 + b, 2, 2, DARK);
    sideWing(p, 22, 22 + b, '#c8dcf4', '#ffffff', flap, -1, 7);
    return c;
  },
  Krampus(t) {
    const c = canvas(), p = painter(c);
    // Krampus: pelaje negro, cuernos, lengua larga, cadenas con cascabel y varas
    const b = figure(p, t, { robe: '#1c1c24', robeShade: '#101018', skin: '#c83030', eyes: '#ffd84a', legs: '#1c1c24', shoe: '#3a3a44', armR: 'up' });
    p(13, 34 + b, 14, 8 - b, '#1c1c24'); for (let i = 0; i < 6; i++) p(12 + i * 3, 23 + b + (i % 2), 2, 3, '#2a2a34');
    p(12, 8 + b, 16, 4, '#1c1c24'); p(11, 2 + b, 3, 8, '#2a2a34'); p(9, 0 + b, 3, 3, '#2a2a34'); p(26, 2 + b, 3, 8, '#2a2a34'); p(28, 0 + b, 3, 3, '#2a2a34');
    const tg = Math.floor(t * 3) % 2; p(19, 19 + b, 3, 6 + tg * 2, '#e85070'); p(18, 18 + b, 1, 2, '#ffffff'); p(22, 18 + b, 1, 2, '#ffffff');
    p(28, 2 + b, 1, 14, '#8a5a30'); p(30, 1 + b, 1, 14, '#8a5a30'); p(32, 3 + b, 1, 12, '#8a5a30');
    const sw = Math.floor(t * 4) % 2; for (let i = 0; i < 5; i++) p(6 + i * 2, 30 + b + i * 2 + sw, 2, 2, '#8a8a98');
    p(4, 40 + b, 4, 4, '#d8a030');
    return c;
  },
  Golem(t) {
    const c = canvas(), p = painter(c);
    // Gigante de arcilla con la palabra de vida en la frente y ojos cian
    const b = giant(p, t, { skin: '#b8885c', shade: '#987048', legs: '#a87c50', shoe: '#7a5a3c', eyes: '#5ce0f0' });
    p(13, 4 + b, 14, 15, '#b8885c'); p(15, 10 + b, 3, 3, '#5ce0f0'); p(22, 10 + b, 3, 3, '#5ce0f0'); p(17, 16 + b, 6, 1, '#7a5a3c');
    p(16, 6 + b, 8, 2, Math.sin(t * 3) > 0 ? '#ffd84a' : '#c8a040');
    for (const [x, y] of [[11, 24], [26, 28], [14, 34], [6, 26]]) p(x, y + b, 3, 1, '#987048');
    return c;
  },
  Ogre(t) {
    const c = canvas(), p = painter(c);
    // Ogro calvo de piel oliva con colmillos y garrote, que se relame
    const b = giant(p, t, { skin: '#8a9a5c', shade: '#6a7a3c', robe: '#7a5434', eyes: '#3a2a1a', armR: 'up' });
    p(17, 15 + b, 6, 3, '#3a2a1a'); p(17, 14 + b, 1, 3, '#f4f4e8'); p(22, 14 + b, 1, 3, '#f4f4e8');
    if (Math.floor(t * 2) % 3 === 0) p(20, 17 + b, 3, 2, '#c85060');
    p(31, -2 + b, 5, 12, '#6a4a2a'); p(30, -3 + b, 7, 5, '#7a5434'); p(32, -1 + b, 1, 1, '#c8c8d8'); p(35, 1 + b, 1, 1, '#c8c8d8');
    return c;
  },
  Bolla(t) {
    const c = canvas(), p = painter(c);
    // Serpiente albanesa que duerme todo el año y solo abre los ojos un día
    const open = Math.floor(t * 0.6) % 3 === 0;
    serpent(p, t, { col: '#5a6a7c', shade: '#4a5a6c', belly: '#a8a8b8', eye: open ? DARK : '#5a6a7c' });
    if (!open) { p(31, 15, 2, 1, '#2a2a34'); const z = (t * 6) % 10; p(36, 6 - z, 3, 1, '#c8c8d8'); p(37, 7 - z, 1, 1, '#c8c8d8'); p(36, 8 - z, 3, 1, '#c8c8d8'); }
    else p(30, 13, 4, 4, '#f4f4f8'), p(31, 14, 2, 2, DARK);
    return c;
  },
  Succubus(t) {
    const c = canvas(), p = painter(c);
    // Demonio de los sueños: alas de murciélago, cuernecillos y cola fina
    const flap = Math.floor(t * 3) % 2;
    for (const d of [-1, 1]) for (let i = 0; i < 4; i++) p(d < 0 ? 1 + i * 2 : 27, 12 + i * 3 + flap * 2, 12 - i * 3, 3, '#2a1a2a');
    const sw = Math.floor(t * 3) % 2; p(28, 38, 6, 2, '#e890b0'); p(33, 34 - sw, 2, 5, '#e890b0'); p(32, 32 - sw, 4, 3, '#e890b0');
    const b = figure(p, t, { robe: '#1c1c24', robeShade: '#101018', dress: true, skin: '#f0b0c0', hair: '#101018', longHair: true, eyes: '#a070f0' });
    p(14, 5 + b, 2, 4, '#1c1c24'); p(24, 5 + b, 2, 4, '#1c1c24');
    const h = (t * 6) % 12; p(34, 18 - h, 2, 2, '#ff7ca0'); p(36, 18 - h, 2, 2, '#ff7ca0'); p(35, 20 - h, 2, 1, '#ff7ca0');
    return c;
  },
  Strigoi(t) {
    const c = canvas(), p = painter(c);
    // Muerto rumano que se levanta de noche: pálido, túnica carmesí y colmillos
    const b = figure(p, t, { robe: '#a82030', robeShade: '#881828', dress: true, skin: '#d8e0d8', hair: '#101018', longHair: true, eyes: Math.sin(t * 3) > 0 ? '#ff3030' : '#c82020', armL: 'up', armR: 'up' });
    p(18, 18 + b, 1, 2, '#ffffff'); p(21, 18 + b, 1, 2, '#ffffff');
    for (const x of [9, 11, 27, 29]) p(x, 11 + b, 1, 3, '#d8e0d8');
    disc(p, 33, 6, 4, '#e8e0b0');
    const m = (t * 4) % 40; p(m, 44, 8, 2, '#5a5a6a');
    return c;
  },
  Dybbuk(t) {
    const c = canvas(), p = painter(c);
    // Alma errante que busca un cuerpo: espíritu lavanda de ojos vacíos
    const ctx = c.getContext('2d');
    const f = ghost(p, t, { col: '#b8a0d8', eye: '#1c1428', mouth: '#1c1428' });
    p(14, 17 + f, 5, 5, '#1c1428'); p(21, 17 + f, 5, 5, '#1c1428'); p(17, 25 + f, 6, 4, '#1c1428');
    ctx.globalAlpha = 0.5; p(4 + Math.round(Math.sin(t * 3) * 2), 10 + f, 4, 20, '#d8c8f0'); p(32 - Math.round(Math.sin(t * 3) * 2), 12 + f, 4, 18, '#d8c8f0'); ctx.globalAlpha = 1;
    return c;
  },
  'Táltos'(t) {
    const c = canvas(), p = painter(c);
    // Chamán húngaro de capucha blanca con tambor y bastón, que viaja en espíritu
    const b = figure(p, t, { robe: '#f4f4f8', robeShade: '#d8d8e0', dress: true, hair: '#7a5434', beard: '#7a5434', eyes: '#3c6cb8', armR: 'up', belt: '#c83030' });
    p(12, 6 + b, 16, 5, '#f4f4f8'); p(11, 9 + b, 3, 14, '#f4f4f8'); p(26, 9 + b, 3, 14, '#f4f4f8');
    p(29, 2 + b, 2, 44, '#8a6a40'); for (let i = 0; i < 3; i++) p(31, 4 + b + i * 3, 2, 2, ['#c83030', '#3c8c3c', '#ffd84a'][i]);
    const hit = Math.floor(t * 4) % 2;
    disc(p, 7, 32 + b, 5, '#e8d8b0'); p(5, 30 + b, 4, 1, '#c83030'); p(7, 28 + b, 1, 8, '#c83030');
    if (hit) { p(0, 26 + b, 2, 1, '#ffd84a'); p(13, 26 + b, 2, 1, '#ffd84a'); }
    return c;
  },
  'Garabonciás'(t) {
    const c = canvas(), p = painter(c);
    // Estudiante-brujo húngaro de capa negra y ojos amarillos con su libro de hechizos
    const b = figure(p, t, { robe: '#1c1c24', robeShade: '#101018', dress: true, hair: '#3a2a1a', eyes: '#ffd84a', armR: 'up' });
    p(10, 22 + b, 3, 22, '#2a2a34'); p(27, 22 + b, 3, 22, '#2a2a34');
    p(10, 8 + b, 20, 2, '#1c1c24'); p(14, 2 + b, 12, 7, '#1c1c24'); p(17, -2 + b, 6, 5, '#1c1c24');
    const pg = Math.floor(t * 3) % 2;
    p(26, 6 + b, 10, 7, '#5a2a1a'); p(27, 6 + b, 4, 6, '#f4e8c8'); p(31 + pg, 6 + b, 4 - pg, 6, '#f4e8c8');
    for (let k = 0; k < 3; k++) { const y = 4 - ((t * 8 + k * 4) % 8); p(28 + k * 3, y + b, 1, 2, '#ffd84a'); }
    return c;
  },
  Monoceros(t) {
    const c = canvas(), p = painter(c);
    // Monoceronte: caballo pardo con un cuerno negro larguísimo, patas de elefante y cola fina
    const b = quad(p, t, { col: '#c8a070', shade: '#a8804c', belly: '#e0c098', head: 'horse', mane: '#8a6040', hoof: '#6a5040', tail: false });
    [8, 13, 23, 28].forEach((x) => p(x - 1, 40, 5, 5, '#a8804c'));
    p(35, 2 + b, 2, 8, '#1c1c24'); p(36, 0 + b, 1, 3, '#1c1c24'); p(34, 8 + b, 3, 2, '#1c1c24');
    const sw = Math.floor(t * 3) % 2; p(4, 22 + b, 2, 12, '#8a6040'); p(3 + sw, 33 + b, 3, 3, '#8a6040');
    return c;
  },
  Unicorn(t) {
    const c = canvas(), p = painter(c);
    // Unicornio blanco de crin lavanda con cuerno de oro que destella
    const b = quad(p, t, { col: '#f4f4f8', shade: '#d8d8e8', belly: '#e8e8f0', head: 'horse', mane: '#c8a8f0', hoof: '#d8a030', tailc: '#c8a8f0' });
    p(34, 3 + b, 2, 6, '#ffd84a'); p(35, 0 + b, 1, 4, '#ffd84a'); p(34, 5 + b, 2, 1, '#c89020');
    twinkle(p, t, 36, 0 + b, '#ffffff');
    for (let k = 0; k < 3; k++) twinkle(p, t + k * 0.7, 4 + k * 12, 6 + k * 3, '#f4e8ff');
    return c;
  },
  Aspidochelone(t) {
    const c = canvas(), p = painter(c);
    // Tortuga marina tan enorme que los marinos la toman por una isla y acampan encima
    const w = Math.round(Math.sin(t * 2) * 1.5);
    for (let y = 0; y < 16; y++) { const hw = Math.round(19 * Math.sin(Math.PI * (y + 6) / 32)); p(19 - hw, 18 + y + w, hw * 2, 1, '#7a7a88'); }
    for (const [x, y] of [[8, 24], [18, 22], [28, 25], [13, 29], [24, 30]]) p(x, y + w, 4, 2, '#5a5a68');
    p(6, 16 + w, 22, 4, '#5c9c3c'); p(14, 6 + w, 2, 11, '#6a4a2a'); p(10, 2 + w, 10, 6, '#3c7c3c');
    p(24, 12 + w, 2, 5, '#8a6a40'); flame(p, t, 23, 9 + w);
    p(34, 26 + w, 6, 6, '#6a7a6a'); p(36, 27 + w, 2, 2, DARK);
    p(0, 34, 40, 14, '#2c6cb8'); p(4, 33 - w, 10, 2, '#a8e0ff'); p(26, 33 + w, 10, 2, '#a8e0ff');
    return c;
  },
  Mandrake(t) {
    const c = canvas(), p = painter(c);
    // Raíz con forma humana que grita al ser arrancada, con hojas en la cabeza
    const pull = Math.floor(t * 2) % 2;
    p(0, 42, 40, 6, '#5a3c20'); p(0, 42, 40, 1, '#7a5434');
    const y = pull ? -2 : 0;
    for (let i = 0; i < 5; i++) p(12 + i * 4, 2 + y + (i % 2) * 2, 4, 10, i % 2 ? '#5cac3c' : '#3c8c2c');
    p(14, 12 + y, 12, 14, '#c8a070'); p(13, 24 + y, 14, 10, '#b8905c');
    p(16, 17 + y, 2, 2, DARK); p(22, 17 + y, 2, 2, DARK);
    p(17, 21 + y, 6, pull ? 4 : 2, '#3a1a1a');
    p(9, 26 + y, 4, 2, '#b8905c'); p(7, 28 + y, 2, 4, '#b8905c'); p(27, 26 + y, 4, 2, '#b8905c'); p(31, 28 + y, 2, 4, '#b8905c');
    p(15, 34 + y, 3, 9, '#b8905c'); p(22, 34 + y, 3, 9, '#b8905c'); p(14, 40, 1, 4, '#a8804c'); p(25, 40, 1, 4, '#a8804c');
    if (pull) for (let i = 0; i < 3; i++) { p(4 - i * 2, 14 + i * 4, 1, 3, '#f4f4f8'); p(35 + i * 2, 14 + i * 4, 1, 3, '#f4f4f8'); }
    return c;
  },
  Borametz(t) {
    const c = canvas(), p = painter(c);
    // El cordero vegetal: un corderito que crece en lo alto de un tallo y pace a su alrededor
    p(0, 44, 40, 4, '#5a3c20');
    for (const [x, d] of [[4, 1], [28, -1]]) { p(x, 40, 8, 4, '#3c8c2c'); p(x + 2 + d, 38, 4, 3, '#5cac3c'); }
    const sw = Math.round(Math.sin(t * 2) * 1.5);
    p(19, 26, 2, 18, '#5c8c3c'); p(20 + sw, 24, 2, 3, '#5c8c3c');
    p(10 + sw, 10, 20, 12, '#f4f4e8'); for (let i = 0; i < 5; i++) p(10 + sw + i * 4, 8 + (i % 2), 4, 3, '#f4f4e8');
    p(26 + sw, 8, 8, 8, '#e8d8c8'); p(29 + sw, 10, 2, 2, DARK); p(25 + sw, 9, 2, 3, '#d8c8b8');
    for (const x of [12, 16, 22, 26]) p(x + sw, 22, 2, 4, '#3c3c44');
    const lf = Math.floor(t * 2) % 2; p(32 + sw, 15 + lf, 3, 2, '#5cac3c');
    return c;
  },
  Dragon(t) {
    const c = canvas(), p = painter(c);
    // El dragón europeo: rojo, alas enormes y fuego sobre su montón de oro
    p(0, 44, 40, 4, '#d8a030'); p(4, 42, 10, 2, '#ffd84a'); twinkle(p, t, 8, 42);
    const b = dragon(p, t, { col: '#c83030', shade: '#a82020', belly: '#e8c888', wing: '#a82020', wing2: '#e8c888', eye: '#ffd84a', spike: '#e8c888' });
    fireBreath(p, t, 37, 13 + b);
    return c;
  },

  // ---------- Japonesas ----------
  Hinezumi(t) {
    const c = canvas(), p = painter(c);
    // Rata de fuego de los volcanes: su pelaje arde, y con él se teje una tela que no se quema
    const b = bob(t), sw = Math.round(Math.sin(t * 3));
    p(0, 44, 40, 4, '#3a2a2a'); p(6, 43, 8, 1, '#ff7a20'); p(26, 43, 6, 1, '#ff7a20');
    [[8, 37], [6, 38], [4, 38], [2, 37], [1, 35], [1 + sw, 33], [2 + sw, 31]].forEach(([x, y]) => p(x, y, 2, 2, '#e8907a'));
    p(8, 28 + b, 20, 12 - b, '#d84a20'); p(10, 26 + b, 16, 2, '#d84a20'); p(9, 37, 18, 3, '#ffb070'); p(10, 29 + b, 4, 6, '#b83a18');
    p(24, 26 + b, 10, 10, '#d84a20'); p(33, 30 + b, 5, 5, '#d84a20'); p(38, 31 + b, 2, 2, '#ff9cb0');
    p(24, 22 + b, 5, 5, '#d84a20'); p(25, 23 + b, 3, 3, '#ff9cb0'); p(30, 22 + b, 5, 5, '#d84a20'); p(31, 23 + b, 3, 3, '#ff9cb0');
    p(30, 28 + b, 3, 3, DARK); p(31, 28 + b, 1, 1, '#ffffff');
    p(35, 34 + b, 5, 1, '#f4e0c0'); p(35, 36 + b, 4, 1, '#f4e0c0');
    p(11, 40, 4, 3, '#ff9cb0'); p(24, 40, 4, 3, '#ff9cb0');
    flame(p, t, 11, 23 + b); flame(p, t, 16, 22 + b, 1); flame(p, t, 21, 23 + b, 2);
    ember(p, t, 14, 20); ember(p, t, 22, 20, 3);
    return c;
  },
  Furaribi(t) {
    const c = canvas(), p = painter(c);
    // Ave hecha de fuego que vaga de noche dejando un rastro de llamas
    const b = bird(p, t, { col: '#e85a20', wing: '#ff9c30', wing2: '#ffd84a', belly: '#ffb040', tail: '#ff7a20', beak: '#ffd84a', eye: '#fff07a', leg: '#c83020' });
    flame(p, t, 26, 6 + b); flame(p, t, 30, 5 + b, 1); flame(p, t, 2, 22 + b, 2); flame(p, t, 6, 21 + b, 3);
    for (let k = 0; k < 4; k++) ember(p, t, 4 + k * 9, 46, k);
    return c;
  },
  Kitsunebi(t) {
    const c = canvas(), p = painter(c);
    // Fuegos fatuos azules del zorro: luces que flotan en fila sobre los campos de noche
    p(0, 44, 40, 4, '#1c2c24'); for (let i = 0; i < 8; i++) p(1 + i * 5, 41 + (i % 2), 2, 3, '#2c4c3c');
    p(28, 36, 8, 8, '#2a2a44'); p(29, 30, 7, 7, '#2a2a44'); p(29, 27, 2, 4, '#2a2a44'); p(34, 27, 2, 4, '#2a2a44'); p(35, 33, 3, 2, '#2a2a44');
    p(22, 41, 7, 3, '#2a2a44'); p(20, 38, 3, 4, '#2a2a44');
    if (Math.floor(t * 2) % 3) { p(31, 32, 1, 1, '#a8f0ff'); p(34, 32, 1, 1, '#a8f0ff'); }
    wisp(p, t, 8, 30, '#5c9cf0', '#d8f0ff'); wisp(p, t, 18, 18, '#5c9cf0', '#d8f0ff', 2); wisp(p, t, 31, 14, '#78b8ff', '#ffffff', 4);
    return c;
  },
  Kappa(t) {
    const c = canvas(), p = painter(c);
    // Kappa del río: piel verde, caparazón, pico y el plato de agua en la cabeza que no debe derramar
    p(0, 45, 14, 3, '#4c9cd8'); p(2, 44, 8, 1, '#a8e0ff');
    p(8, 27, 24, 15, '#7a6a3a'); p(9, 28, 22, 1, '#9a8a4a');
    const b = dwarf(p, t, { robe: '#4cac5c', robeShade: '#3c8c4c', skin: '#5cbc6c', legs: '#4cac5c', shoe: '#3c8c4c', eyes: '#101018' });
    p(15, 30 + b, 10, 11, '#e8d070'); p(15, 33 + b, 10, 1, '#c8b050'); p(15, 37 + b, 10, 1, '#c8b050'); p(19, 30 + b, 1, 11, '#c8b050');
    p(12, 14 + b, 16, 4, '#2c5c3c'); p(12, 16 + b, 2, 5, '#2c5c3c'); p(26, 16 + b, 2, 5, '#2c5c3c');
    p(14, 12 + b, 12, 3, '#d8e8f0'); p(15, 12 + b, 10, 1, '#78c8f0'); twinkle(p, t, 22, 12 + b);
    p(17, 23 + b, 6, 3, '#e8b030'); p(18, 26 + b, 4, 1, '#c89020');
    p(7, 37 + b, 5, 2, '#5cbc6c');
    p(29, 36 + b, 8, 3, '#3c9c3c'); p(30, 36 + b, 6, 1, '#78d06c'); p(36, 36 + b, 1, 3, '#d8e070');
    return c;
  },
  Ningyo(t) {
    const c = canvas(), p = painter(c);
    // Sirena japonesa: quien come su carne vive siglos; llora perlas sobre las rocas
    const b = figure(p, t, { robe: '#c83030', robeShade: '#a82020', hair: '#101018', longHair: true, eyes: '#3a2a1a', skin: '#f0d0b0' });
    merTail(p, t, b, '#f088a8', '#ffb0c8');
    for (let i = 0; i < 4; i++) p(15 + i * 3, 25 + b, 2, 2, '#f4f4f8');
    p(24, 7 + b, 5, 2, '#ffd84a'); p(27, 6 + b, 2, 1, '#ff7ca0');
    const tr = (t * 8) % 6; p(16, 16 + b + tr, 1, 1, '#f4f4f8');
    bubble(p, t, 36, 40);
    return c;
  },
  Amabie(t) {
    const c = canvas(), p = painter(c);
    // Amabie: sirena con pico, escamas y pelo larguísimo que anuncia cosechas y protege de epidemias
    const b = figure(p, t, { robe: '#3cb0a8', robeShade: '#2c9088', hair: '#f4f4f8', longHair: true, eyes: '#101018', skin: '#f4e0c8' });
    p(11, 10 + b, 4, 31, '#f4f4f8'); p(25, 10 + b, 4, 31, '#f4f4f8'); p(10, 38, 3, 4, '#e8e8f0'); p(27, 38, 3, 4, '#e8e8f0');
    for (let r = 0; r < 4; r++) for (let x = 0; x < 3; x++) p(16 + x * 3 + (r % 2), 27 + r * 3 + b, 2, 1, '#a8f0e0');
    p(18, 17 + b, 4, 2, '#ffb030'); p(19, 19 + b, 2, 1, '#ffb030');
    p(13, 40, 15, 4, '#3cb0a8');
    const f = Math.floor(t * 3) % 2;
    p(11 - f, 43, 6, 3, '#2c9088'); p(18, 44, 4, 3, '#2c9088'); p(23 + f, 43, 6, 3, '#2c9088');
    p(0, 46, 40, 2, '#2c6cb8'); p(4, 45, 4, 1, '#a8e0ff'); p(32, 45, 4, 1, '#a8e0ff');
    return c;
  },
  Kodama(t) {
    const c = canvas(), p = painter(c);
    // Espíritus de los árboles centenarios: cabecitas blancas que giran la cabeza con un traqueteo
    p(0, 0, 9, 48, '#6a4a2a'); p(2, 0, 2, 48, '#8a6a40'); p(6, 8, 1, 10, '#4a3420'); p(5, 26, 1, 8, '#4a3420');
    p(0, 0, 40, 5, '#2c6c2c'); for (let i = 0; i < 6; i++) p(9 + i * 5, 4 + (i % 2), 5, 3, '#4c9c4c');
    p(0, 44, 40, 4, '#3c6c2c'); for (let i = 0; i < 5; i++) p(10 + i * 6, 43, 3, 1, '#5c9c4c');
    const tl = [0, 1, 0, -1][Math.floor(t * 3) % 4];
    p(18, 31, 8, 13, '#e8f0e0'); p(15, 33, 3, 5, '#e8f0e0'); p(26, 33, 3, 5, '#e8f0e0');
    const hx = 15 + tl;
    p(hx, 18, 14, 13, '#f0f4ec'); p(hx + 1, 17, 12, 1, '#f0f4ec'); p(hx + 1, 31, 12, 1, '#d8e0d4');
    p(hx + 3, 23, 2, 3, '#2a2a2a'); p(hx + 9, 23, 2, 3, '#2a2a2a'); p(hx + 6, 27, 2, 2, '#2a2a2a');
    p(33, 37, 5, 7, '#e8f0e0'); const hy = tl ? 30 : 29;
    p(31 - tl, hy, 9, 9, '#f0f4ec'); p(33 - tl, hy + 3, 1, 2, '#2a2a2a'); p(36 - tl, hy + 3, 1, 2, '#2a2a2a'); p(34 - tl, hy + 6, 1, 1, '#2a2a2a');
    return c;
  },
  Kijimuna(t) {
    const c = canvas(), p = painter(c);
    // Niño espíritu de los banianos de Okinawa: pelo rojo alborotado; le encantan los ojos de pescado
    p(0, 0, 6, 48, '#7a5a3a'); for (let i = 0; i < 4; i++) p(1 + i, 6 + i * 8, 1, 30 - i * 6, '#5a3c20');
    p(0, 45, 40, 3, '#c8b080');
    const b = dwarf(p, t, { robe: '#d89070', robeShade: '#c07858', skin: '#d89070', legs: '#d89070', shoe: '#c07858', eyes: '#101018' });
    p(12, 35 + b, 16, 5, '#4c9c3c'); for (let i = 0; i < 4; i++) p(12 + i * 4, 39, 3, 3, '#3c8c2c');
    p(10, 10 + b, 20, 8, '#d83020'); for (let i = 0; i < 6; i++) p(9 + i * 4, 6 + b + (i % 2) * 2, 3, 5, '#e84a30');
    p(10, 16 + b, 3, 9, '#d83020'); p(27, 16 + b, 3, 9, '#d83020');
    p(15, 23 + b, 2, 1, '#e86a5a'); p(23, 23 + b, 2, 1, '#e86a5a');
    const w = Math.floor(t * 3) % 2;
    p(30, 30 + b - w, 7, 4, '#a8b8c8'); p(36, 29 + b - w, 3, 6, '#8898a8'); p(31, 31 + b - w, 1, 1, DARK); p(30, 33 + b - w, 6, 1, '#d8e0e8');
    return c;
  },
  Yamawaro(t) {
    const c = canvas(), p = painter(c);
    // Niño de la montaña con un solo ojo, cubierto de pelo; ayuda a los leñadores a cambio de comida
    p(0, 44, 40, 4, '#6a6a5a'); p(2, 41, 7, 4, '#8a8a7a'); p(32, 42, 6, 3, '#8a8a7a');
    const b = dwarf(p, t, { robe: '#8a5a30', robeShade: '#6a4a28', skin: '#d8a070', legs: '#8a5a30', shoe: '#6a4a28', eyes: '#d8a070' });
    for (let i = 0; i < 4; i++) { p(13 + i * 4, 31 + b + (i % 2) * 3, 2, 4, '#a87040'); p(12 + i * 4, 40, 3, 2, '#6a4a28'); }
    p(11, 11 + b, 18, 6, '#101018'); for (let i = 0; i < 5; i++) p(10 + i * 4, 8 + b + (i % 2) * 2, 3, 4, '#101018');
    p(11, 16 + b, 3, 6, '#101018'); p(26, 16 + b, 3, 6, '#101018');
    const bl = Math.floor(t * 3) % 5 === 0;
    p(16, 18 + b, 8, 1, '#5a3c30');
    if (bl) p(17, 21 + b, 6, 1, DARK); else { p(17, 19 + b, 6, 4, '#f4f4f8'); p(19, 20 + b, 3, 3, DARK); p(20, 20 + b, 1, 1, '#ffffff'); }
    p(29, 33 + b, 6, 5, '#f4f4f0'); p(30, 32 + b, 4, 1, '#f4f4f0'); p(30, 36 + b, 4, 2, '#1c2c1c');
    return c;
  },
  Tanuki(t) {
    const c = canvas(), p = painter(c);
    // Tanuki transformista: sombrero de paja, calabaza de sake y una gran barriga que toca como un tambor
    const sw = Math.floor(t * 3) % 2;
    p(3, 33 + sw, 8, 7, '#8a6040'); p(3, 35 + sw, 8, 1, '#3a2a1a'); p(3, 38 + sw, 8, 1, '#3a2a1a');
    const b = dwarf(p, t, { robe: '#8a6040', robeShade: '#6a4a30', skin: '#8a6040', legs: '#6a4a30', shoe: '#3a2a1a', eyes: '#8a6040' });
    p(14, 30 + b, 12, 11, '#e8c890'); p(16, 32 + b, 8, 1, '#d8b070');
    p(13, 14 + b, 3, 3, '#6a4a30'); p(24, 14 + b, 3, 3, '#6a4a30');
    p(14, 19 + b, 5, 3, '#3a2a1a'); p(21, 19 + b, 5, 3, '#3a2a1a'); p(16, 20 + b, 1, 1, '#ffd84a'); p(23, 20 + b, 1, 1, '#ffd84a');
    p(16, 22 + b, 8, 5, '#f4e8d0'); p(19, 22 + b, 2, 2, DARK); p(18, 25 + b, 4, 1, '#8a4a40');
    p(8, 12 + b, 24, 3, '#d8b060'); p(12, 9 + b, 16, 3, '#c8a050'); p(16, 7 + b, 8, 2, '#b89040'); p(9, 14 + b, 22, 1, '#a88040');
    p(30, 33 + b, 6, 6, '#d8a030'); p(31, 30 + b, 4, 3, '#d8a030'); p(32, 29 + b, 2, 1, '#8a5a30'); p(30, 35 + b, 6, 1, '#c83030');
    return c;
  },
  Mujina(t) {
    const c = canvas(), p = painter(c);
    // Tejón embaucador de las montañas, de rayas blancas, que engaña a los viajeros
    p(0, 44, 40, 4, '#4a3a2a');
    const b = quad(p, t, { col: '#7a7a84', shade: '#5a5a64', belly: '#4a4a54', head: 'none', hoof: '#2a2a34', tailc: '#5a5a64' });
    p(8, 20 + b, 22, 2, '#e8e8f0'); for (let i = 0; i < 5; i++) p(8 + i * 5, 24 + b, 3, 1, '#9a9aa4');
    p(26, 18 + b, 12, 10, '#7a7a84'); p(26, 19 + b, 13, 2, '#f4f4f8'); p(28, 21 + b, 9, 2, '#2a2a34');
    p(32, 21 + b, 2, 1, '#ffd84a'); p(36, 23 + b, 4, 3, '#3a3a44'); p(39, 23 + b, 1, 1, DARK);
    p(27, 16 + b, 3, 3, '#5a5a64'); p(28, 25 + b, 8, 1, '#f4f4f8');
    return c;
  },
  Kamaitachi(t) {
    const c = canvas(), p = painter(c);
    // Comadreja que viaja en un remolino y corta con las hoces de sus patas: la herida no sangra
    for (let i = 0; i < 7; i++) { const a = i * 0.9 + t * 4; p(20 + Math.cos(a) * 17, 26 + Math.sin(a) * 9, 4, 1, '#78e0f0'); p(20 + Math.cos(a + 0.5) * 12, 26 + Math.sin(a + 0.5) * 6, 2, 1, '#c8f8ff'); }
    const lf = t * 4; p(20 + Math.cos(lf) * 15, 26 + Math.sin(lf) * 8, 2, 2, '#5cac3c');
    const b = Math.round(Math.sin(t * 3) * 2);
    p(2, 16 + b, 9, 5, '#d8c090'); p(0, 13 + b, 5, 5, '#d8c090'); p(0, 12 + b, 3, 3, '#a8885a');
    p(10, 22 + b, 18, 7, '#e8d8a8'); p(12, 20 + b, 12, 2, '#e8d8a8'); p(12, 28 + b, 14, 2, '#f4ecd0');
    p(26, 17 + b, 9, 8, '#e8d8a8'); p(34, 20 + b, 4, 4, '#e8d8a8'); p(37, 20 + b, 2, 1, DARK); p(27, 15 + b, 3, 3, '#e8d8a8'); p(28, 16 + b, 1, 1, '#d88c9c');
    p(30, 19 + b, 2, 2, DARK); p(32, 24 + b, 4, 1, '#f4ecd0');
    p(11, 29 + b, 3, 6, '#d8c090'); p(5, 35 + b, 7, 2, '#d8e0f0'); p(4, 32 + b, 2, 4, '#d8e0f0');
    p(27, 25 + b, 3, 7, '#d8c090'); p(29, 32 + b, 6, 2, '#d8e0f0'); p(34, 28 + b, 2, 5, '#d8e0f0'); p(33, 27 + b, 2, 2, '#ffffff');
    return c;
  },
  'Ittan-momen'(t) {
    const c = canvas(), p = painter(c);
    // Tira de algodón blanco que vuela de noche y se enrolla en la cara de los viajeros
    for (const [x, y] of [[30, 4], [36, 12], [6, 40], [24, 2]]) twinkle(p, t + x, x, y, '#fff8c0');
    for (let i = 13; i >= 1; i--) {
      const x = 4 + i * 2.2, y = 8 + i * 2.5 + Math.round(Math.sin(i * 0.7 - t * 4) * 3);
      p(x, y, 7, 5, i % 2 ? '#f4f4f0' : '#e8e8e0'); p(x, y + 4, 7, 1, '#c8c8c0');
    }
    const y0 = 8 + Math.round(Math.sin(-t * 4) * 3);
    p(1, y0 - 3, 11, 9, '#f4f4f0'); p(1, y0 + 5, 11, 1, '#c8c8c0');
    p(3, y0, 2, 2, DARK); p(8, y0, 2, 2, DARK);
    const w = Math.floor(t * 3) % 2; p(11, y0 + 3 - w, 5, 2, '#f4f4f0'); p(0, y0 + 6 + w, 2, 4, '#f4f4f0');
    return c;
  },
  'Yuki-onna'(t) {
    const c = canvas(), p = painter(c);
    // Mujer de las nieves: kimono blanco, piel helada y un aliento que congela a los viajeros
    for (let k = 0; k < 8; k++) flake(p, t, 2 + k * 5, k);
    p(0, 45, 40, 3, '#f4f8ff');
    const b = kimono(p, t, { robe: '#f4f8ff', robeShade: '#d8e4f4', sleeveCol: '#e8f0fc', skin: '#e8f0f8', hair: '#101018', longHair: true, eyes: '#5a9cd8', obi: '#a8d0f0', obiKnot: '#78b0e0', collar: '#a8d0f0', pattern: '#c8e0f8' });
    p(18, 18 + b, 4, 1, '#8ab0d0');
    const s = (t * 8) % 9; p(26 + s, 17 + b - s / 3, 3, 2, '#d8f0ff'); p(29 + s, 15 + b - s / 3, 2, 2, '#ffffff');
    return c;
  },
  'Tsurara-onna'(t) {
    const c = canvas(), p = painter(c);
    // Mujer de los carámbanos: nace del hielo que cuelga de los aleros y se funde en primavera
    p(0, 0, 40, 3, '#4a3a2a');
    for (const [x, h] of [[1, 10], [5, 6], [9, 12], [29, 5], [33, 9], [37, 14]]) { p(x, 3, 2, h, '#c8f0ff'); p(x, 3, 1, h - 2, '#ffffff'); }
    const d = (t * 10) % 12; p(37, 18 + d, 1, 2, '#a8e0ff');
    const b = kimono(p, t, { robe: '#a8e0f8', robeShade: '#88c8e8', sleeveCol: '#c8ecfc', skin: '#e0f4fc', hair: '#1c2c5c', longHair: true, eyes: '#2a6aa8', obi: '#f4f8ff', obiKnot: '#5c9cf0', collar: '#ffffff', pattern: '#ffffff' });
    p(24, 5 + b, 2, 6, '#c8f0ff'); p(24, 5 + b, 1, 4, '#ffffff');
    return c;
  },
  Yukinko(t) {
    const c = canvas(), p = painter(c);
    // Niño de nieve que juega en las noches nevadas; quien lo coge en brazos se queda helado
    for (let k = 0; k < 7; k++) flake(p, t, 3 + k * 6, k);
    p(0, 45, 40, 3, '#f4f8ff');
    p(2, 37, 8, 8, '#f4f4f8'); p(3, 31, 6, 6, '#f4f4f8'); p(4, 33, 1, 1, DARK); p(7, 33, 1, 1, DARK); p(5, 35, 2, 1, '#ff9c40');
    const b = dwarf(p, t, { robe: '#f4f4f8', robeShade: '#d8d8e8', belt: '#a8c8e8', hair: '#101018', eyes: '#101018', legs: '#e8e8f0', shoe: '#a8784c' });
    for (let i = 0; i < 4; i++) { p(11 + i * 5, 27 + b, 4, 3, '#ffffff'); p(12 + i * 4, 40, 3, 2, '#ffffff'); }
    p(12, 13 + b, 16, 6, '#101018'); p(12, 18 + b, 3, 6, '#101018'); p(25, 18 + b, 3, 6, '#101018');
    p(15, 23 + b, 2, 1, '#f0a0a8'); p(23, 23 + b, 2, 1, '#f0a0a8');
    const up = Math.floor(t * 2) % 2;
    p(28, 28 + b - up * 3, 3, 4, SKIN); p(29, 23 + b - up * 3, 6, 6, '#ffffff'); p(30, 24 + b - up * 3, 2, 1, '#d8e8f8');
    return c;
  },
  'Yuki-warashi'(t) {
    const c = canvas(), p = painter(c);
    // Niña de la nieve con sombrero de paja: trae suerte a la casa donde se queda
    for (let k = 0; k < 7; k++) flake(p, t, 2 + k * 6, k + 3);
    p(0, 45, 40, 3, '#f4f8ff');
    const b = dwarf(p, t, { robe: '#a8d8f0', robeShade: '#88b8e0', belt: '#2c5ca8', hair: '#101018', eyes: '#101018', shoe: '#c8a050', legs: '#88b8e0' });
    p(8, 29 + b, 5, 8, '#a8d8f0'); p(27, 29 + b, 5, 8, '#a8d8f0'); p(18, 28 + b, 4, 3, '#ffffff');
    for (let i = 0; i < 3; i++) p(14 + i * 5, 38 + (i % 2) * 2, 2, 2, '#ffffff');
    p(12, 17 + b, 3, 6, '#101018'); p(25, 17 + b, 3, 6, '#101018');
    p(15, 23 + b, 2, 1, '#f0a0a8'); p(23, 23 + b, 2, 1, '#f0a0a8');
    p(7, 14 + b, 26, 3, '#d8b060'); p(11, 11 + b, 18, 3, '#c8a050'); p(15, 8 + b, 10, 3, '#b89040');
    p(13, 10 + b, 14, 1, '#ffffff'); p(17, 7 + b, 6, 1, '#ffffff'); p(8, 13 + b, 6, 1, '#ffffff');
    for (let i = 0; i < 5; i++) p(9 + i * 5, 15 + b, 1, 2, '#a88040');
    return c;
  },
  Onibi(t) {
    const c = canvas(), p = painter(c);
    // Fuego fantasma azul que flota en los cementerios con una calavera ardiendo dentro
    p(1, 38, 7, 10, '#6a6a7a'); p(2, 36, 5, 2, '#6a6a7a'); p(32, 36, 7, 12, '#6a6a7a'); p(33, 34, 5, 2, '#6a6a7a');
    const f = Math.floor(t * 6) % 2, y = Math.round(Math.sin(t * 2) * 2);
    p(13 + f, 3 + y, 4, 9, '#3c6cf0'); p(23 - f, 5 + y, 4, 8, '#3c6cf0'); p(18, 0 + y, 4, 10, '#5c8cf0');
    disc(p, 20, 23 + y, 12, '#3c6cf0'); disc(p, 20, 24 + y, 9, '#78a8ff');
    p(14, 17 + y, 12, 10, '#f4f4f0'); p(16, 27 + y, 8, 4, '#f4f4f0');
    p(15, 20 + y, 4, 4, '#1c2c6c'); p(21, 20 + y, 4, 4, '#1c2c6c'); p(16, 21 + y, 2, 2, '#a8f0ff'); p(22, 21 + y, 2, 2, '#a8f0ff');
    p(19, 25 + y, 2, 2, '#1c2c6c'); p(16, 29 + y, 8, 1, '#1c2c6c'); p(18, 28 + y, 1, 3, '#1c2c6c'); p(21, 28 + y, 1, 3, '#1c2c6c');
    for (let k = 0; k < 3; k++) { const e = (t * 10 + k * 7) % 16; p(10 + k * 9, 40 - e, 1, 1, '#a8c8ff'); }
    return c;
  },
  Yurei(t) {
    const c = canvas(), p = painter(c);
    // Fantasma de kimono blanco, pelo negro suelto y el triángulo de papel en la frente; flota sin pies
    wisp(p, t, 34, 16, '#5c9cf0', '#d8f0ff');
    const f = ghost(p, t, { col: '#f0f4f8', hair: '#101018', eye: '#3a4a5a', mouth: '#8a9aaa' });
    p(18, 9 + f, 5, 2, '#ffffff'); p(19, 11 + f, 3, 1, '#ffffff');
    p(19, 27 + f, 2, 9, '#d0d8e0'); p(17, 26 + f, 2, 2, '#d0d8e0');
    p(9, 23 + f, 9, 3, '#f0f4f8'); p(22, 23 + f, 9, 3, '#f0f4f8');
    p(9, 26 + f, 2, 3, '#e0e8f0'); p(12, 26 + f, 1, 3, '#e0e8f0'); p(29, 26 + f, 2, 3, '#e0e8f0'); p(27, 26 + f, 1, 3, '#e0e8f0');
    return c;
  },
  Funayurei(t) {
    const c = canvas(), p = painter(c);
    // Fantasmas de ahogados que piden un cucharón para llenar de agua los barcos y hundirlos
    const f = ghost(p, t, { col: '#c8d8e0', hair: '#101018', eye: '#2a3a4a', mouth: '#5a6a7a' });
    p(28, 20 + f, 6, 3, '#c8d8e0'); p(33, 7 + f, 2, 16, '#8a6a40'); p(30, 3 + f, 7, 5, '#a8784c'); p(31, 4 + f, 5, 2, '#5a3c20');
    const d = (t * 12) % 9; p(31, 9 + f + d, 1, 2, '#78c8f0'); p(30, 13 + f + ((d + 4) % 9), 1, 2, '#78c8f0');
    p(0, 36, 40, 12, '#1c3c6c'); p(0, 35, 40, 2, '#2c5c9c');
    for (let i = 0; i < 4; i++) p((t * 4 + i * 10) % 40, 35, 4, 1, '#a8e0ff');
    const w = Math.floor(t * 3) % 2;
    p(3, 29 + w, 3, 7, '#c8d8e0'); p(2, 28 + w, 1, 3, '#c8d8e0'); p(6, 28 + w, 1, 2, '#c8d8e0');
    p(35, 31 - w, 3, 5, '#c8d8e0'); p(34, 30 - w, 1, 3, '#c8d8e0'); p(38, 30 - w, 1, 2, '#c8d8e0');
    return c;
  },
  Nopperabo(t) {
    const c = canvas(), p = painter(c);
    // El sin rostro: parece una persona normal hasta que se gira y su cara es lisa como un huevo
    p(2, 33, 7, 9, '#f0e0b0'); p(2, 36, 7, 1, '#c8a060'); p(2, 39, 7, 1, '#c8a060'); p(3, 32, 5, 1, '#5a3c20'); p(3, 42, 5, 1, '#5a3c20');
    if (Math.floor(t * 4) % 3) p(4, 35, 3, 3, '#fff8c0');
    const b = kimono(p, t, { robe: '#2a3c6c', robeShade: '#1c2c5c', sleeveCol: '#2a3c6c', hair: '#101018', eyes: SKIN, obi: '#8a8a9a', obiKnot: '#5a5a6a', collar: '#d8d8e0' });
    p(18, 18 + b, 4, 1, SKIN); p(16, 12 + b, 3, 2, '#f8d8b8');
    p(18, 5 + b, 4, 4, '#101018');
    return c;
  },
  Rokurokubi(t) {
    const c = canvas(), p = painter(c);
    // Mujer de cuello larguísimo que se estira de noche para lamer el aceite de las lámparas
    p(1, 30, 8, 14, '#f0e0b0'); p(0, 29, 10, 2, '#5a3c20'); p(0, 44, 10, 2, '#5a3c20'); p(3, 35, 4, 4, '#fff07a');
    p(12, 30, 16, 16, '#7c3c8c'); p(12, 30, 3, 16, '#5c2c6c'); p(11, 40, 18, 6, '#7c3c8c');
    p(12, 36, 16, 3, '#e8c040'); p(19, 37, 3, 2, '#c83030'); p(18, 30, 4, 3, '#f4f4f8');
    p(8, 31, 5, 9, '#7c3c8c'); p(27, 31, 5, 9, '#7c3c8c'); p(9, 40, 3, 2, '#f4e8e0'); p(28, 40, 3, 2, '#f4e8e0');
    for (let i = 0; i < 3; i++) p(15 + i * 5, 42, 2, 2, '#c8a0e8');
    let x = 19, y = 30;
    for (let k = 0; k <= 10; k++) { x = 19 + Math.round(Math.sin(k * 0.5 + t * 2) * 4) + Math.round(k * 0.5); y = 30 - k * 1.8; p(x, y, 3, 3, '#f4e8e0'); }
    const hx = x - 4, hy = y - 6;
    p(hx, hy, 10, 10, '#f4e8e0'); p(hx - 1, hy - 1, 12, 3, '#101018'); p(hx + 2, hy - 4, 6, 4, '#101018'); p(hx - 1, hy, 2, 7, '#101018'); p(hx + 9, hy, 2, 7, '#101018');
    p(hx + 7, hy - 4, 4, 1, '#ffd84a');
    p(hx + 2, hy + 4, 2, 1, DARK); p(hx + 6, hy + 4, 2, 1, DARK); p(hx + 4, hy + 7, 2, 1, '#d83040');
    if (Math.floor(t * 3) % 3 === 0) p(hx + 4, hy + 8, 1, 3, '#e86a8a');
    return c;
  },
  Bakeneko(t) {
    const c = canvas(), p = painter(c);
    // Gato que ha vivido demasiado y se transforma: baila de pie con una toalla en la cabeza
    const sw = Math.floor(t * 3) % 2;
    p(6, 30, 3, 12, '#e8d8b0'); p(4 - sw, 24, 3, 7, '#e8d8b0'); p(3 - sw, 22, 3, 3, '#a8885a');
    p(9, 33, 3, 10, '#e8d8b0'); p(8 + sw, 28, 3, 6, '#e8d8b0'); p(8 + sw, 26, 3, 3, '#a8885a');
    const b = kimono(p, t, { robe: '#7c3cb0', robeShade: '#5c2c90', sleeveCol: '#7c3cb0', skin: '#e8d8b0', eyes: '#e8d8b0', obi: '#1c1c24', obiKnot: '#e8c040', collar: '#e8d8b0', pattern: '#c8a0e8', armR: 'up' });
    animalHead(p, b, 'cat', '#e8d8b0');
    p(16, 7 + b, 8, 3, '#f4f4f8'); p(23, 9 + b, 4, 3, '#f4f4f8'); p(17, 8 + b, 1, 1, '#5c8cf0'); p(21, 8 + b, 1, 1, '#5c8cf0');
    p(27, 10 + b, 4, 3, '#e8d8b0'); p(28, 10 + b, 2, 1, '#ff9cb0');
    return c;
  },
  Inugami(t) {
    const c = canvas(), p = painter(c);
    // Perro espíritu que sirve a una familia de brujos y posee a sus enemigos
    for (let i = 0; i < 5; i++) { const y = 26 - ((t * 8 + i * 5) % 22); p(2 + i * 8, y, 3, 4, '#4a2c6c'); p(3 + i * 8, y - 2, 2, 2, '#3a2058'); }
    const b = quad(p, t, { col: '#f4f4f0', shade: '#d8d8d0', belly: '#e8e8e0', head: 'dog', eye: '#ff3030', fangs: true, hoof: '#c8c8c0', tailc: '#e8e8e0' });
    p(32, 12 + b, 2, 2, '#ff8080');
    p(23, 22 + b, 8, 2, '#d8b060'); p(25, 24 + b, 2, 4, '#ffffff'); p(28, 24 + b, 2, 3, '#ffffff');
    return c;
  },
  Tsukumogami(t) {
    const c = canvas(), p = painter(c);
    // Objeto que al cumplir cien años cobra vida: el paraguas de papel con un ojo, lengua y una pata
    const h = Math.floor(t * 3) % 2 ? 0 : -3;
    p(14, 46, 12, 1, '#2a2a3a');
    p(19, 24 + h, 2, 14, '#8a6a40');
    for (let y = 0; y < 18; y++) { const w = Math.round(2 + y * 0.9); p(20 - w, 4 + y + h, w * 2, 1, '#8c4cc8'); }
    for (let i = 0; i < 4; i++) p(19 - i * 4, 6 + i * 4 + h, 1, 15 - i * 4, '#6c2ca8');
    p(3, 22 + h, 34, 2, '#5c2c90'); for (let i = 0; i < 6; i++) p(4 + i * 6, 24 + h, 3, 1, '#8c4cc8');
    p(19, 0 + h, 2, 4, '#5a3c20');
    const bl = Math.floor(t * 3) % 4 === 3;
    if (bl) p(15, 13 + h, 10, 1, DARK); else { p(15, 10 + h, 10, 6, '#f4f4f8'); p(18, 11 + h, 4, 4, DARK); p(19, 11 + h, 1, 1, '#ffffff'); }
    p(17, 18 + h, 6, 2, '#3a1a2a'); p(20, 19 + h, 4, 7, '#e84a6a'); p(23, 24 + h, 2, 2, '#e84a6a');
    p(18, 36 + h, 4, 6, '#e8b890'); p(15, 42 + h, 10, 2, '#8a5a30'); p(16, 44 + h, 2, 1, '#5a3c20'); p(22, 44 + h, 2, 1, '#5a3c20');
    return c;
  },
  Zashikiwarashi(t) {
    const c = canvas(), p = painter(c);
    // Niña espíritu de las casas antiguas: mientras viva en ella la familia prospera
    p(0, 44, 40, 4, '#c8b878'); p(0, 44, 40, 1, '#a89858'); p(20, 44, 1, 4, '#a89858');
    const b = dwarf(p, t, { robe: '#c83030', robeShade: '#a82020', belt: '#e8c040', eyes: '#101018', legs: '#f4f4f8', shoe: '#c83030' });
    p(12, 13 + b, 16, 5, '#101018'); p(12, 17 + b, 3, 8, '#101018'); p(25, 17 + b, 3, 8, '#101018'); p(15, 17 + b, 10, 2, '#101018');
    p(15, 23 + b, 2, 1, '#f0a0a8'); p(23, 23 + b, 2, 1, '#f0a0a8');
    p(14, 31 + b, 2, 2, '#ffd84a'); p(23, 38, 2, 2, '#ffd84a'); p(16, 39, 2, 2, '#f4f4f8'); p(18, 28 + b, 4, 2, '#f4f4f8');
    const y = 37 - Math.round(Math.abs(Math.sin(t * 3)) * 6);
    p(31, y, 7, 7, '#e84a6a'); p(31, y + 3, 7, 1, '#ffd84a'); p(34, y, 1, 7, '#5c8cf0'); p(32, y + 1, 1, 1, '#ffffff');
    return c;
  },
  Satori(t) {
    const c = canvas(), p = painter(c);
    // Ser peludo de la montaña que lee la mente y dice en voz alta lo que piensas antes que tú
    const b = figure(p, t, { robe: '#8a5a30', robeShade: '#6a4a28', skin: '#8a5a30', legs: '#8a5a30', shoe: '#6a4a28', eyes: '#8a5a30' });
    for (let i = 0; i < 5; i++) p(13 + i * 3, 25 + b, 2, 15 + (i % 2) * 2, '#a87040');
    p(10, 33 + b, 3, 3, '#6a4a28'); p(27, 33 + b, 3, 3, '#6a4a28');
    p(12, 6 + b, 16, 6, '#6a4a28'); for (let i = 0; i < 4; i++) p(12 + i * 4, 4 + b + (i % 2), 3, 3, '#6a4a28');
    p(15, 12 + b, 10, 9, '#e8a890'); p(16, 14 + b, 2, 2, DARK); p(22, 14 + b, 2, 2, DARK); p(16, 14 + b, 1, 1, '#ffd84a'); p(22, 14 + b, 1, 1, '#ffd84a');
    p(15, 12 + b, 10, 1, '#5a3c20'); p(19, 17 + b, 1, 1, '#8a4a40'); p(21, 17 + b, 1, 1, '#8a4a40'); p(18, 19 + b, 4, 1, '#8a3a30');
    p(27, 8, 2, 2, '#f4f4f8'); p(29, 5, 3, 3, '#f4f4f8'); p(30, 0, 10, 6, '#f4f4f8'); p(31, -1, 8, 1, '#f4f4f8');
    if (Math.floor(t * 2) % 2) { p(33, 1, 3, 1, DARK); p(35, 2, 1, 1, DARK); p(34, 3, 1, 1, DARK); p(34, 5, 1, 1, DARK); }
    else { p(34, 1, 1, 3, DARK); p(34, 5, 1, 1, DARK); }
    return c;
  },
  Kudan(t) {
    const c = canvas(), p = painter(c);
    // Ternero con cara humana que nace, pronuncia una profecía certera y muere a los pocos días
    p(0, 44, 40, 4, '#8a7a4a'); p(2, 41, 9, 3, '#f4e8c8'); p(2, 41, 1, 3, '#c8a070'); p(10, 41, 1, 3, '#c8a070');
    const b = quad(p, t, { col: '#8a5a30', shade: '#6a4a28', belly: '#c8a070', head: 'none', hoof: '#3a2a1a', tailc: '#5a3c20' });
    p(10, 23 + b, 5, 4, '#f4ecd8'); p(18, 26 + b, 4, 3, '#f4ecd8');
    p(25, 14 + b, 7, 12, '#8a5a30');
    p(25, 11 + b, 3, 2, '#8a5a30'); p(37, 11 + b, 3, 2, '#8a5a30'); p(28, 4 + b, 2, 3, '#e8d8b0'); p(35, 4 + b, 2, 3, '#e8d8b0');
    head(p, 28, 8 + b, { hair: '#101018', skin: '#e8b890' });
    const sp = Math.floor(t * 3) % 2; p(31, 15 + b, 3, sp ? 2 : 1, '#5a1a1a');
    return c;
  },
  Hakuja(t) {
    const c = canvas(), p = painter(c);
    // Serpiente blanca mensajera de los dioses: verla trae riqueza y buena fortuna
    p(1, 6, 14, 2, '#d83c30'); p(2, 10, 12, 1, '#d83c30'); p(3, 8, 2, 18, '#d83c30'); p(11, 8, 2, 18, '#d83c30'); p(0, 5, 16, 1, '#3a2a2a');
    serpent(p, t, { col: '#f4f4f0', shade: '#e0dccc', belly: '#e8dcc0', eye: '#ff3030' });
    p(31, 14, 2, 2, '#ff3030'); p(32, 14, 1, 1, '#ffb0b0');
    for (let i = 0; i < 3; i++) { p(16 + i * 6, 44, 4, 2, '#e8c040'); p(17 + i * 6, 44, 2, 1, '#fff07a'); }
    twinkle(p, t, 22, 43, '#fff07a');
    return c;
  },
  Shisa(t) {
    const c = canvas(), p = painter(c);
    // León-perro guardián de los tejados de Okinawa: boca abierta para atrapar la buena suerte
    p(0, 43, 40, 5, '#c84a30'); for (let i = 0; i < 8; i++) p(i * 5, 43, 4, 2, '#e86a40');
    const b = quad(p, t, { col: '#c87a40', shade: '#a85a28', belly: '#e8a060', head: 'lion', mane: '#c83020', eye: DARK, hoof: '#a85a28', tailc: '#c83020' });
    for (let i = 0; i < 6; i++) p(23 + (i % 3) * 4, 9 + b + Math.floor(i / 3) * 12, 2, 2, '#e86a40');
    p(2, 20 + b, 3, 3, '#e86a40');
    p(30, 12 + b, 4, 4, '#f4f4f8'); p(31, 13 + b, 2, 2, DARK);
    p(33, 19 + b, 6, 4, '#5a1a1a'); p(33, 19 + b, 1, 2, '#ffffff'); p(38, 19 + b, 1, 2, '#ffffff'); p(35, 21 + b, 2, 1, '#e84a6a');
    return c;
  },
  Tsuchinoko(t) {
    const c = canvas(), p = painter(c);
    // Serpiente rechoncha como una botella que salta y rueda; dicen que le encanta el sake
    p(0, 44, 40, 4, '#7a6a4a'); for (let i = 0; i < 6; i++) p(2 + i * 7, 42, 1, 2, '#5c8c3c');
    const h = -Math.round(Math.abs(Math.sin(t * 3)) * 5);
    p(10, 45, 18 + h, 1, '#5a4a30');
    p(30, 41, 5, 3, '#c83030'); p(31, 41, 3, 1, '#f4f4f0');
    p(2, 34 + h, 6, 2, '#8a6a40'); p(0, 35 + h, 3, 1, '#8a6a40');
    for (let y = 0; y < 16; y++) { const w = Math.round(12 * Math.pow(Math.sin(Math.PI * (y + 1) / 17), 0.4)); p(18 - w, 24 + y + h, w * 2, 1, '#8a6a40'); }
    p(9, 36 + h, 18, 2, '#d8c090'); for (let i = 0; i < 4; i++) p(11 + i * 4, 29 + h + (i % 2), 2, 2, '#5a4a28');
    p(27, 28 + h, 10, 8, '#8a6a40'); p(36, 30 + h, 3, 4, '#8a6a40');
    p(31, 29 + h, 2, 2, '#ffd84a'); p(32, 29 + h, 1, 2, DARK); p(32, 34 + h, 6, 1, DARK); p(33, 33 + h, 4, 1, '#d8c090');
    return c;
  },
  Nurikabe(t) {
    const c = canvas(), p = painter(c);
    // Muro invisible que corta el paso de noche; solo se aparta si golpeas su base con un bastón
    p(0, 44, 40, 4, '#4a4a3a');
    const b = bob(t);
    p(10, 40, 6, 5, '#b8b0a0'); p(24, 40, 6, 5, '#b8b0a0');
    p(0, 22 + b, 5, 4, '#d8d0c0'); p(35, 22 + b, 5, 4, '#d8d0c0');
    p(4, 4 + b, 32, 37 - b, '#d8d0c0'); p(4, 4 + b, 3, 37 - b, '#b8b0a0'); p(3, 3 + b, 34, 2, '#a8a090');
    p(10, 8 + b, 1, 5, '#a8a090'); p(10, 13 + b, 4, 1, '#a8a090'); p(29, 30 + b, 1, 6, '#a8a090'); p(26, 36 + b, 3, 1, '#a8a090'); p(8, 32 + b, 4, 3, '#c8c0b0');
    if (Math.floor(t * 3) % 5 === 0) { p(11, 16 + b, 6, 1, DARK); p(23, 16 + b, 6, 1, DARK); }
    else { p(11, 14 + b, 6, 4, '#f4f4f8'); p(13, 15 + b, 3, 3, DARK); p(23, 14 + b, 6, 4, '#f4f4f8'); p(25, 15 + b, 3, 3, DARK); }
    p(16, 26 + b, 8, 2, '#6a6050');
    return c;
  },
  Kasha(t) {
    const c = canvas(), p = painter(c);
    // Gato demonio envuelto en llamas que roba los cadáveres de los funerales
    for (let i = 0; i < 7; i++) flame(p, t, 1 + i * 6, 43, i);
    const b = quad(p, t, { col: '#2e2e3c', shade: '#22222c', belly: '#4a4a58', head: 'cat', eye: '#ffd84a', tail: false, hoof: '#22222c' });
    p(4, 12 + b, 3, 10, '#44445a'); p(6, 20 + b, 3, 3, '#44445a'); flame(p, t, 4, 8 + b, 1); flame(p, t, 2, 11 + b, 2); flame(p, t, 6, 10 + b, 3);
    p(9, 24 + b, 3, 1, '#5a5a6a'); p(16, 22 + b, 4, 1, '#5a5a6a');
    for (let k = 0; k < 3; k++) ember(p, t, 12 + k * 9, 40, k);
    return c;
  },
  Wanyudo(t) {
    const c = canvas(), p = painter(c);
    // Rueda de carro en llamas con la cabeza de un monje furioso: arranca el alma de quien la mira
    const cx = 20, cy = 24, a0 = t * 3;
    for (let i = 0; i < 9; i++) { const a = Math.PI + i * Math.PI / 8; flame(p, t, cx + Math.cos(a) * 17 - 1, cy + Math.sin(a) * 17, i); }
    for (let i = 0; i < 48; i++) { const a = i / 48 * Math.PI * 2; p(cx + Math.cos(a) * 15 - 1, cy + Math.sin(a) * 15 - 1, 3, 3, '#6a4a2a'); }
    for (let i = 0; i < 40; i++) { const a = i / 40 * Math.PI * 2; p(cx + Math.cos(a) * 13 - 1, cy + Math.sin(a) * 13 - 1, 2, 2, '#8a6a40'); }
    for (let k = 0; k < 8; k++) { const a = a0 + k * Math.PI / 4; for (let r = 7; r <= 12; r++) p(cx + Math.cos(a) * r - 1, cy + Math.sin(a) * r - 1, 2, 2, '#5a3c20'); }
    p(13, 17, 14, 14, '#d8a070'); p(11, 13, 18, 5, '#101018'); for (let i = 0; i < 5; i++) p(10 + i * 4, 10 + (i % 2) * 2, 3, 4, '#101018');
    p(11, 17, 3, 11, '#101018'); p(26, 17, 3, 11, '#101018');
    p(14, 19, 5, 1, DARK); p(21, 19, 5, 1, DARK); p(15, 21, 4, 2, '#ff3030'); p(21, 21, 4, 2, '#ff3030');
    p(19, 24, 2, 2, '#b87850'); p(16, 27, 8, 2, '#5a1a1a'); p(17, 27, 1, 2, '#ffffff'); p(22, 27, 1, 2, '#ffffff');
    return c;
  },
  'Nure-onna'(t) {
    const c = canvas(), p = painter(c);
    // Mujer serpiente que aparece en la orilla lavándose el pelo y atrapa a los pescadores
    serpent(p, t, { col: '#2a3c6c', shade: '#1c2c5c', belly: '#8a9ab8', noHead: true });
    p(24, 18, 7, 18, '#2a3c6c'); p(26, 20, 3, 16, '#8a9ab8');
    p(21, 8, 3, 22, '#101018'); p(32, 8, 3, 18, '#101018');
    const b = bob(t);
    head(p, 23, 8 + b, { hair: '#101018', long: true, skin: '#d8e0e8', eyes: '#ffd84a' });
    p(26, 15 + b, 1, 2, '#ffffff'); p(28, 15 + b, 1, 2, '#ffffff');
    if (Math.floor(t * 3) % 3 === 0) { p(27, 17 + b, 1, 3, '#e83030'); p(26, 20 + b, 1, 1, '#e83030'); p(28, 20 + b, 1, 1, '#e83030'); }
    const d = (t * 10) % 8; p(22, 30 + d, 1, 2, '#78c8f0'); p(33, 26 + ((d + 3) % 8), 1, 2, '#78c8f0');
    p(0, 44, 40, 4, '#1c3c6c'); p(4, 43, 8, 1, '#5c8cc8'); p(26, 43, 8, 1, '#5c8cc8');
    return c;
  },
  'Ushi-oni'(t) {
    const c = canvas(), p = painter(c);
    // Demonio de las costas con cuerpo de araña y cabeza de buey con cara de ogro; escupe veneno
    p(0, 44, 40, 4, '#c8b080'); p(4, 43, 6, 1, '#e8d8a0');
    spiderLegs(p, t, 20, 28, '#2e2e3c', '#5a5a6a');
    disc(p, 20, 17, 10, '#22222c'); p(16, 11, 8, 2, '#3a3a48'); p(14, 15, 12, 1, '#3a3a48');
    const b = bob(t);
    p(11, 20 + b, 18, 14, '#c83030'); p(11, 20 + b, 3, 14, '#a82020'); p(11, 18 + b, 18, 3, '#101018');
    p(7, 17 + b, 5, 3, '#e8d8b0'); p(5, 13 + b, 3, 5, '#e8d8b0'); p(28, 17 + b, 5, 3, '#e8d8b0'); p(32, 13 + b, 3, 5, '#e8d8b0');
    p(14, 23 + b, 4, 3, '#ffd84a'); p(22, 23 + b, 4, 3, '#ffd84a'); p(15, 24 + b, 2, 2, DARK); p(23, 24 + b, 2, 2, DARK);
    p(13, 22 + b, 5, 1, DARK); p(22, 22 + b, 5, 1, DARK); p(18, 27 + b, 4, 2, '#a82020');
    p(13, 30 + b, 14, 3, '#3a1010'); p(14, 29 + b, 2, 3, '#ffffff'); p(24, 29 + b, 2, 3, '#ffffff');
    if (Math.floor(t * 3) % 3 === 0) { p(19, 34 + b, 2, 3, '#7ce060'); p(18, 38 + b, 2, 2, '#7ce060'); }
    return c;
  },
  Isonade(t) {
    const c = canvas(), p = painter(c);
    // Tiburón gigante de las costas que barre a los marineros con su cola llena de garfios
    p(0, 0, 40, 3, '#2c6cb8'); for (let i = 0; i < 5; i++) p((t * 5 + i * 9) % 40, 3, 4, 1, '#a8e0ff');
    const y = fish(p, t, { col: '#5a6a7a', fin: '#4a5a6a', belly: '#c8d0d8' });
    p(18, y - 14, 4, 4, '#4a5a6a'); p(19, y - 17, 2, 3, '#4a5a6a');
    p(30, y + 5, 8, 2, '#3a1a1a'); for (let i = 0; i < 4; i++) p(30 + i * 2, y + 5, 1, 1, '#ffffff');
    p(24, y - 2, 1, 5, '#3a4a5a'); p(26, y - 2, 1, 5, '#3a4a5a'); p(30, y + 1, 2, 2, '#ff3030');
    for (const [dx, dy] of [[1, -7], [4, -6], [1, 11], [4, 10]]) { p(dx, y + dy, 2, 1, '#d8e0e8'); p(dx, y + dy + (dy < 0 ? 1 : -1), 1, 1, '#d8e0e8'); }
    bubble(p, t, 36, 40); bubble(p, t, 8, 44, 2);
    return c;
  },
  Mizuchi(t) {
    const c = canvas(), p = painter(c);
    // Dragón de agua sin cuernos que habita ríos y pozos y escupe veneno
    p(0, 38, 40, 10, '#2c6cb8');
    for (let i = 0; i < 9; i++) { const x = 1 + i * 3, y = 32 - Math.round(Math.abs(Math.sin(i * 0.6 + t * 2)) * 10); p(x, y, 5, 7, i % 2 ? '#2c9c8c' : '#3cbca8'); p(x + 1, y + 5, 3, 2, '#a8f0e0'); p(x + 2, y - 1, 2, 1, '#78e0f0'); }
    neck(p, 28, 34, 29, 16, '#3cbca8', 6, 5);
    p(30, 18, 2, 14, '#a8f0e0');
    p(26, 10, 12, 8, '#3cbca8'); p(35, 13, 5, 4, '#3cbca8'); p(39, 13, 1, 1, DARK); p(34, 17, 6, 1, '#1c5c5c');
    p(30, 11, 2, 2, '#ffd84a'); p(25, 7, 3, 4, '#78e0f0'); p(28, 6, 3, 4, '#78e0f0'); p(31, 8, 2, 3, '#78e0f0');
    const w = Math.round(Math.sin(t * 3)); p(36, 18 + w, 3, 1, '#a8f0e0'); p(38, 19 + w, 2, 3, '#a8f0e0');
    p(0, 37, 40, 2, '#5c9cd8'); for (let i = 0; i < 4; i++) p((t * 4 + i * 11) % 40, 37, 4, 1, '#ffffff');
    return c;
  },
  Umibozu(t) {
    const c = canvas(), p = painter(c);
    // Gigante negro y calvo que surge del mar en calma y vuelca los barcos
    const r = Math.round(Math.sin(t * 1.5) * 2);
    disc(p, 20, 20 + r, 15, '#34365a'); p(5, 20 + r, 30, 20, '#34365a'); p(5, 20 + r, 4, 20, '#26284a');
    p(12, 9 + r, 5, 2, '#5a5c80'); p(10, 12 + r, 2, 3, '#5a5c80');
    p(11, 19 + r, 6, 6, '#f4f4f8'); p(23, 19 + r, 6, 6, '#f4f4f8'); p(13, 21 + r, 2, 2, DARK); p(25, 21 + r, 2, 2, DARK);
    p(0, 36, 40, 12, '#1c3c6c'); p(4, 35, 32, 2, '#a8c8e8'); p(9, 34, 6, 1, '#a8c8e8'); p(26, 34, 5, 1, '#a8c8e8');
    for (let i = 0; i < 4; i++) p((i * 11 + t * 6) % 40, 40 + (i % 2) * 4, 5, 1, '#5c8cc8');
    const bt = Math.round(Math.sin(t * 3));
    p(30, 40 + bt, 9, 3, '#8a5a30'); p(31, 43 + bt, 7, 1, '#5a3c20'); p(34, 33 + bt, 1, 7, '#5a3c20'); p(35, 34 + bt, 3, 4, '#f4f4f0');
    return c;
  },
  Hoko(t) {
    const c = canvas(), p = painter(c);
    // Espíritu de los árboles milenarios: un perro sin cola con cara humana que sale del tronco talado
    p(0, 30, 10, 16, '#6a4a2a'); p(0, 29, 10, 2, '#c8a070'); p(2, 29, 5, 1, '#a8784c'); p(3, 32, 1, 10, '#4a3420');
    for (let i = 0; i < 3; i++) p(1 + i * 3, 27 - (i % 2), 2, 2, '#5cac3c');
    p(0, 45, 40, 3, '#4a6a2a');
    const b = quad(p, t, { col: '#c8a070', shade: '#a88050', belly: '#e8c890', head: 'none', tail: false, hoof: '#8a6040' });
    p(25, 14 + b, 7, 12, '#c8a070');
    p(26, 5 + b, 3, 5, '#a88050'); p(35, 5 + b, 3, 5, '#a88050');
    head(p, 28, 8 + b, { hair: '#101018', skin: '#e8b890' });
    return c;
  },
  Raiju(t) {
    const c = canvas(), p = painter(c);
    // Bestia del trueno con forma de lobo: cae del cielo con el rayo y duerme en los ombligos
    const fl = Math.floor(t * 6) % 3;
    if (fl === 0) { p(4, 0, 2, 5, '#fff07a'); p(2, 4, 2, 5, '#fff07a'); p(4, 8, 2, 6, '#fff07a'); }
    const b = quad(p, t, { col: '#3c6cd8', shade: '#2c4cb8', belly: '#78a8f0', head: 'wolf', eye: '#ffd84a', fangs: true, hoof: '#ffd84a', tailc: '#ffd84a' });
    for (let i = 0; i < 6; i++) p(8 + i * 3, 18 + b - (i % 2) * 2, 2, 3, '#ffd84a');
    p(22, 10 + b, 2, 3, '#ffd84a'); p(24, 12 + b, 2, 3, '#ffd84a');
    for (let k = 0; k < 3; k++) { const x = [10, 20, 34][k], y = [36, 30, 28][(k + fl) % 3]; p(x, y, 1, 3, '#fff07a'); p(x + 1, y + 2, 1, 2, '#fff07a'); }
    return c;
  },
  Raicho(t) {
    const c = canvas(), p = painter(c);
    // Ave del trueno que surca las tormentas: al batir las alas suenan truenos
    p(0, 0, 40, 5, '#3a3c5c'); p(4, 4, 10, 2, '#3a3c5c'); p(22, 4, 14, 3, '#3a3c5c'); p(8, 1, 10, 2, '#4a4c6c');
    const b = bird(p, t, { col: '#f0d040', wing: '#d8a030', wing2: '#fff07a', belly: '#fff8b0', tail: '#d8a030', beak: '#5a5a6a', eye: '#2a6aa8', leg: '#5a5a6a' });
    p(26, 6 + b, 2, 3, '#fff07a'); p(29, 5 + b, 2, 4, '#fff07a');
    if (Math.floor(t * 6) % 2) { p(6, 7, 2, 5, '#ffffff'); p(4, 11, 2, 4, '#ffffff'); p(6, 14, 2, 4, '#ffffff'); }
    else { p(33, 8, 2, 4, '#ffffff'); p(35, 11, 2, 4, '#ffffff'); }
    return c;
  },
  Nue(t) {
    const c = canvas(), p = painter(c);
    // Quimera de las nubes negras: cara de mono, cuerpo de tigre y una serpiente por cola
    p(10, 0, 30, 5, '#3a3c5c'); p(14, 4, 20, 2, '#3a3c5c'); if (Math.floor(t * 6) % 3 === 0) { p(30, 6, 2, 4, '#fff07a'); p(28, 9, 2, 4, '#fff07a'); }
    const b = quad(p, t, { col: '#d8a040', shade: '#b88030', belly: '#e8c870', head: 'none', tail: false, hoof: '#5a3c20' });
    for (let i = 0; i < 5; i++) p(9 + i * 4, 21 + b, 2, 9, '#2a2a1a');
    for (const x of [8, 13, 23, 28]) p(x, 36, 3, 1, '#2a2a1a');
    neck(p, 6, 24 + b, 3, 15 + b, '#4c8c3c', 4, 3);
    snakeHead(p, t, 1, 9 + b, '#4c8c3c', '#a8d870', '#ffd84a', 1);
    p(25, 10 + b, 12, 12, '#8a5a30'); p(28, 13 + b, 8, 8, '#e88070'); p(24, 14 + b, 3, 4, '#e88070');
    p(29, 15 + b, 2, 2, DARK); p(33, 15 + b, 2, 2, DARK); p(29, 15 + b, 1, 1, '#ffd84a'); p(33, 15 + b, 1, 1, '#ffd84a');
    p(31, 18 + b, 2, 1, '#8a3a30'); p(30, 20 + b, 4, 1, DARK);
    return c;
  },
  Tengu(t) {
    const c = canvas(), p = painter(c);
    // Tengu de la montaña: cara roja de nariz larguísima, alas negras y abanico de plumas
    wings(p, 12 + bob(t), '#1c1c24', '#3a3a44', Math.floor(t * 3) % 2, 10);
    const b = figure(p, t, { robe: '#f4f4f0', robeShade: '#d8d8d0', skin: '#d83c30', hair: '#f4f4f8', longHair: true, beard: '#f4f4f8', eyes: '#ffd84a', armR: 'up', legs: '#e8e8e0', shoe: '#5a3c20', belt: '#2a2a34' });
    p(15, 12 + b, 4, 1, '#f4f4f8'); p(21, 12 + b, 4, 1, '#f4f4f8');
    p(19, 14 + b, 9, 3, '#d83c30'); p(27, 15 + b, 3, 2, '#c82c20');
    p(18, 4 + b, 5, 5, '#101018'); p(19, 3 + b, 3, 1, '#101018');
    for (let i = 0; i < 4; i++) p(14 + i * 3, 26 + b + (i % 2), 2, 2, '#e8a030');
    p(27, 1 + b, 9, 9, '#e8e0d0'); p(28, 2 + b, 7, 1, '#c8c0b0'); p(28, 5 + b, 7, 1, '#c8c0b0'); p(31, 1 + b, 1, 9, '#c8c0b0'); p(29, 10 + b, 2, 3, '#8a5a30');
    return c;
  },
  'Karasu-tengu'(t) {
    const c = canvas(), p = painter(c);
    // Tengu cuervo: cabeza de cuervo con pico, alas negras y el bastón de anillas de los ascetas
    wings(p, 12 + bob(t), '#1c1c24', '#3a3a5a', Math.floor(t * 3) % 2, 10);
    const b = figure(p, t, { robe: '#2a3c6c', robeShade: '#1c2c5c', skin: '#3a3a44', eyes: '#3a3a44', legs: '#2a2a34', shoe: '#5a3c20', belt: '#e8c040', armR: 'up' });
    p(14, 9 + b, 12, 12, '#1c1c24'); p(24, 14 + b, 6, 3, '#e8b030'); p(29, 15 + b, 2, 2, '#c89020');
    p(19, 12 + b, 3, 3, '#ffd84a'); p(20, 13 + b, 1, 1, DARK); p(13, 20 + b, 14, 3, '#2a2a34');
    p(17, 5 + b, 5, 4, '#101018');
    for (let i = 0; i < 3; i++) p(15 + i * 4, 26 + b, 2, 2, '#f4f4f8');
    p(30, 2 + b, 2, 44 - b, '#8a6a40'); p(28, 0 + b, 6, 1, '#d8a030'); p(28, 0 + b, 1, 5, '#d8a030'); p(33, 0 + b, 1, 5, '#d8a030');
    const j = Math.floor(t * 4) % 2; p(27 + j, 4 + b, 2, 2, '#e8c040'); p(32 - j, 4 + b, 2, 2, '#e8c040');
    return c;
  },
  Jorogumo(t) {
    const c = canvas(), p = painter(c);
    // Araña que se transforma en una bella mujer para atraer a los hombres a su tela
    for (let i = 0; i < 5; i++) { p(0, i * 3, 12 - i * 2, 1, '#5a5a6a'); p(i * 3, 0, 1, 12 - i * 2, '#5a5a6a'); }
    for (let i = 0; i < 5; i++) { p(28 + i * 2, i * 3, 12 - i * 2, 1, '#5a5a6a'); p(39 - i * 3, 0, 1, 12 - i * 2, '#5a5a6a'); }
    spiderLegs(p, t, 20, 38, '#c8a030', '#2a2a1a');
    const b = kimono(p, t, { robe: '#b81c3c', robeShade: '#981030', sleeveCol: '#b81c3c', hair: '#101018', longHair: true, eyes: '#ffd84a', obi: '#e8c040', obiKnot: '#1c1c24', collar: '#f4f4f0', skin: '#f4e0d0' });
    disc(p, 20, 40, 8, '#2a2a1a'); p(13, 37, 14, 2, '#e8c040'); p(14, 41, 12, 2, '#e8c040'); p(16, 45, 8, 1, '#e8c040');
    p(24, 6 + b, 5, 2, '#e8c040'); p(18, 18 + b, 4, 1, '#c83040');
    return c;
  },
  Gashadokuro(t) {
    const c = canvas(), p = painter(c);
    // Esqueleto gigante formado por los huesos de los muertos de hambre; caza de noche con un traqueteo
    const g = Math.floor(t * 3) % 2;
    p(4, 28, 2, 10, '#e8e0c8'); p(34, 28, 2, 10, '#e8e0c8');
    p(0, 26 - g, 6, 4, '#e8e0c8'); for (let i = 0; i < 4; i++) p(i * 2, 20 - g, 1, 6, '#e8e0c8');
    p(34, 26 + g, 6, 4, '#e8e0c8'); for (let i = 0; i < 4; i++) p(33 + i * 2, 20 + g, 1, 6, '#e8e0c8');
    p(18, 26, 4, 18, '#e8e0c8'); for (let i = 0; i < 4; i++) { p(10, 28 + i * 4, 20, 2, '#e8e0c8'); p(9, 29 + i * 4, 2, 2, '#c8c0a8'); p(29, 29 + i * 4, 2, 2, '#c8c0a8'); }
    p(6, 27, 28, 2, '#d8d0b8');
    p(8, 2, 24, 18, '#e8e0c8'); p(10, 0, 20, 2, '#e8e0c8'); p(8, 2, 3, 18, '#c8c0a8'); p(7, 10, 2, 6, '#e8e0c8'); p(31, 10, 2, 6, '#e8e0c8');
    p(11, 8, 7, 7, '#1c1010'); p(22, 8, 7, 7, '#1c1010');
    const gl = Math.floor(t * 4) % 2 ? '#ff3030' : '#c82020'; p(13, 10, 3, 3, gl); p(24, 10, 3, 3, gl);
    p(18, 15, 4, 4, '#1c1010');
    p(12, 20 + g, 16, 6, '#e8e0c8'); p(12, 20, 16, 1 + g, '#1c1010'); for (let i = 0; i < 5; i++) p(13 + i * 3, 19, 1, 2, '#1c1010');
    return c;
  },
  Baku(t) {
    const c = canvas(), p = painter(c);
    // Devorador de pesadillas: trompa de elefante, ojos de rinoceronte y patas de tigre
    const s = Math.floor(t * 3) % 3;
    p(28 + s, 0 + s, 10 - s * 2, 5 - s, '#c88ce8'); p(30 + s, 1 + s, 4, 2, '#5a3c7a');
    const b = quad(p, t, { col: '#6a7a8a', shade: '#5a6a7a', belly: '#8a9aaa', head: 'none', hoof: '#3a4a5a', tailc: '#5a6a7a' });
    for (const [x, y] of [[9, 22], [15, 25], [21, 22], [12, 28], [24, 27]]) p(x, y + b, 3, 2, '#f4f4f8');
    for (const x of [8, 13, 23, 28]) p(x, 42, 3, 1, '#2a2a34');
    p(25, 12 + b, 10, 12, '#6a7a8a'); p(23, 12 + b, 4, 7, '#5a6a7a'); p(30, 15 + b, 2, 2, DARK); p(29, 14 + b, 4, 1, '#4a5a6a');
    p(33, 13 + b, 4, 4, '#6a7a8a'); p(35, 9 + b, 3, 5, '#6a7a8a'); p(36, 6 + b, 3, 4, '#6a7a8a'); p(36, 6 + b, 3, 1, '#4a5a6a');
    p(33, 20 + b, 4, 2, '#f4f4e8');
    return c;
  },
  Tsuchigumo(t) {
    const c = canvas(), p = painter(c);
    // Araña de tierra gigante con cara de ogro y patas de tigre que vive en cuevas de las montañas
    for (let i = 0; i < 4; i++) { p(0, i * 3, 10 - i * 2, 1, '#5a5a6a'); p(i * 3, 0, 1, 10 - i * 2, '#5a5a6a'); p(30 + i * 2, i * 3, 10 - i * 2, 1, '#5a5a6a'); p(39 - i * 3, 0, 1, 10 - i * 2, '#5a5a6a'); }
    p(0, 44, 40, 4, '#5a4a3a');
    spiderLegs(p, t, 20, 28, '#8a6a40', '#e8b040');
    disc(p, 20, 18, 10, '#6a4a2a'); for (let i = 0; i < 4; i++) p(12 + i * 4, 12 + (i % 2) * 3, 2, 8, '#4a3018');
    const b = bob(t);
    p(12, 22 + b, 16, 13, '#c83030'); p(12, 22 + b, 3, 13, '#a82020');
    p(14, 18 + b, 3, 5, '#f4ecd0'); p(23, 18 + b, 3, 5, '#f4ecd0');
    p(14, 25 + b, 4, 3, '#ffd84a'); p(22, 25 + b, 4, 3, '#ffd84a'); p(15, 26 + b, 2, 2, DARK); p(23, 26 + b, 2, 2, DARK);
    p(13, 24 + b, 5, 1, DARK); p(22, 24 + b, 5, 1, DARK);
    p(14, 31 + b, 12, 3, '#3a1010'); p(15, 30 + b, 2, 3, '#ffffff'); p(23, 30 + b, 2, 3, '#ffffff');
    return c;
  },
  Hinotori(t) {
    const c = canvas(), p = painter(c);
    // Fénix de fuego: quien bebe su sangre se vuelve inmortal; renace de sus cenizas
    const cols = ['#ffd84a', '#ff7a20', '#d83020'];
    for (let k = 0; k < 3; k++) for (let i = 0; i < 9; i++) p(8 - i * 0.7 + k * 3 + Math.round(Math.sin(i * 0.8 + t * 3 + k) * 1.5), 28 + i * 2, 3, 2, cols[k]);
    for (let k = 0; k < 3; k++) p(2 + k * 3, 45, 3, 3, '#ffd84a');
    const b = bird(p, t, { col: '#d83020', wing: '#ff7a20', wing2: '#ffd84a', belly: '#ffb040', tail: '#ff9c30', beak: '#ffd84a', eye: DARK, leg: '#d8a030' });
    p(26, 4 + b, 2, 4, '#ffd84a'); p(29, 3 + b, 2, 5, '#ffd84a'); p(32, 5 + b, 2, 3, '#ffd84a'); p(29, 2 + b, 2, 1, '#fff07a');
    p(33, 16 + b, 2, 3, '#ff3030');
    flame(p, t, 18, 16 + b, 1); for (let k = 0; k < 3; k++) ember(p, t, 14 + k * 8, 30, k);
    return c;
  },
  Bakekujira(t) {
    const c = canvas(), p = painter(c);
    // Ballena fantasma hecha solo de huesos que aparece en la costa de Shimane con aves extrañas
    p(0, 36, 40, 12, '#1c3c6c');
    const w = Math.round(Math.sin(t * 2) * 1.5);
    for (let i = 0; i < 9; i++) p(22 - i * 2.3, 18 + w + Math.round(i * 0.6), 3, 3, '#e8e0c8');
    for (let i = 0; i < 6; i++) { const x = 20 - i * 3; p(x, 21 + w + Math.round(i * 0.5), 2, 15 - i * 2, '#d8d0b8'); }
    p(0, 18 + w, 4, 2, '#e8e0c8'); p(0, 22 + w, 3, 2, '#e8e0c8'); p(2, 20 + w, 2, 2, '#e8e0c8');
    p(24, 14 + w, 14, 10, '#e8e0c8'); p(26, 24 + w, 12, 3, '#e8e0c8'); p(24, 14 + w, 14, 1, '#f4f0e0');
    p(28, 17 + w, 4, 4, '#1c1010'); p(29, 18 + w, 2, 2, '#ff3030'); p(34, 22 + w, 4, 1, '#1c1010'); p(37, 18 + w, 1, 3, '#1c1010');
    p(0, 35, 40, 2, '#2c5c9c'); for (let i = 0; i < 4; i++) p((t * 4 + i * 10) % 40, 35, 4, 1, '#a8e0ff');
    for (let i = 0; i < 3; i++) { const x = (t * 8 + i * 13) % 40, y = 3 + i * 4; p(x, y, 3, 1, '#2a2a34'); p(x + 1, y - 1 + (Math.floor(t * 4 + i) % 2) * 2, 1, 1, '#2a2a34'); }
    return c;
  },
  Akkorokamui(t) {
    const c = canvas(), p = painter(c);
    // Pulpo rojo gigantesco de la bahía de Uchiura: tan grande que tiñe de rojo el mar y el cielo
    p(0, 40, 40, 8, '#2c5c9c'); p(0, 39, 40, 1, '#5c8cc8');
    const b = Math.round(Math.sin(t * 2));
    for (let i = 0; i < 8; i++) {
      const bx = 5 + i * 4, dir = i < 4 ? -1 : 1;
      for (let k = 0; k < 9; k++) {
        const x = bx + dir * k * 0.8 + Math.round(Math.sin(k * 0.7 + t * 3 + i) * 2), y = 24 + k * 2.2;
        p(x, y, k < 5 ? 4 : 3, 3, i % 2 ? '#c83020' : '#e84a30'); if (k % 2) p(x + 1, y + 2, 1, 1, '#ffc0a0');
      }
    }
    disc(p, 20, 13 + b, 12, '#e84a30'); p(9, 13 + b, 22, 12, '#e84a30'); p(9, 13 + b, 3, 12, '#c83020');
    p(14, 4 + b, 3, 2, '#ff8c60'); p(24, 6 + b, 2, 2, '#ff8c60'); p(19, 2 + b, 2, 1, '#ff8c60');
    p(12, 15 + b, 6, 4, '#ffd84a'); p(22, 15 + b, 6, 4, '#ffd84a'); p(13, 16 + b, 4, 2, DARK); p(23, 16 + b, 4, 2, DARK);
    return c;
  },
  Jubokko(t) {
    const c = canvas(), p = painter(c);
    // Árbol de los campos de batalla que bebe sangre y atrapa con sus ramas a los que pasan
    p(0, 44, 40, 4, '#4a3a2a'); p(3, 41, 5, 4, '#e8e0c8'); p(4, 42, 1, 1, DARK); p(6, 42, 1, 1, DARK); p(31, 42, 4, 3, '#e8e0c8');
    const s = Math.round(Math.sin(t * 2) * 1.5);
    neck(p, 15, 18, 4 + s, 6, '#4a3a3a', 5, 3); neck(p, 24, 18, 35 - s, 6, '#4a3a3a', 5, 3); neck(p, 18, 14, 16, 2, '#4a3a3a', 4, 3);
    for (const [x, d] of [[3 + s, 1], [36 - s, -1]]) { p(x, 1, 1, 6, '#4a3a3a'); p(x + d * 2, 2, 1, 5, '#4a3a3a'); p(x - d * 2, 3, 1, 4, '#4a3a3a'); }
    p(14, 16, 12, 30, '#4a3a3a'); p(10, 40, 20, 6, '#4a3a3a'); p(14, 16, 3, 30, '#3a2a2a'); p(22, 20, 1, 8, '#3a2a2a');
    p(16, 24, 3, 2, '#ff3030'); p(22, 24, 3, 2, '#ff3030'); p(17, 30, 7, 3, '#1c1010'); p(18, 30, 1, 1, '#c8c0a8'); p(22, 30, 1, 1, '#c8c0a8');
    const d = (t * 8) % 10;
    p(3 + s, 7 + d, 1, 2, '#c81c1c'); p(36 - s, 7 + ((d + 5) % 10), 1, 2, '#c81c1c'); p(17, 33 + (d % 6), 1, 2, '#c81c1c');
    p(2 + s, 0, 3, 1, '#c81c1c'); p(35 - s, 0, 3, 1, '#c81c1c');
    return c;
  },
  Oni(t) {
    const c = canvas(), p = painter(c);
    // Ogro rojo con cuernos y colmillos, taparrabos de piel de tigre y la maza de hierro con pinchos
    const b = giant(p, t, { skin: '#d83c30', shade: '#b82c20', robe: '#e8c040', belt: '#3a2a1a', hair: '#101018', wild: true, eyes: '#ffd84a', legs: '#d83c30', shoe: '#b82c20' });
    for (let i = 0; i < 4; i++) p(12 + i * 5, 36 + b, 2, 4, '#2a2a1a');
    p(15, 0 + b, 3, 5, '#f4ecd0'); p(22, 0 + b, 3, 5, '#f4ecd0');
    p(17, 16 + b, 6, 1, '#5a1a1a'); p(17, 16 + b, 1, 2, '#ffffff'); p(22, 16 + b, 1, 2, '#ffffff');
    neck(p, 32, 34 + b, 35, 1 + b, '#4a4a5a', 8, 4);
    for (let i = 0; i < 4; i++) p(32 + (i % 2) * 3 + Math.round(i * 0.3), 4 + b + i * 6, 2, 2, '#c8c8d8');
    p(31, 33 + b, 6, 4, '#d83c30');
    return c;
  },
  Kitsune(t) {
    const c = canvas(), p = painter(c);
    // Zorro de nueve colas: siglos de vida le dan poder, fuego de zorro y forma humana
    const sw = Math.sin(t * 2) * 0.04;
    for (let k = 0; k < 9; k++) {
      const a = Math.PI * (0.42 + k * 0.07 + sw), cl = k % 2 ? '#dcdce4' : '#fafaf6';
      for (let r = 0; r < 19; r++) { const w = r > 15 ? 2 : 3, x = 13 + Math.cos(a) * r, y = 30 - Math.sin(a) * r * 1.3; p(x - 1, y, 1, w, '#b8c0d0'); p(x, y, w, w, r > 15 ? '#78d8f0' : cl); }
    }
    const b = bob(t);
    p(8, 30, 12, 14, '#f4f4f0'); p(10, 24 + b, 16, 12, '#f4f4f0'); p(22, 22 + b, 8, 14, '#ffffff');
    p(22, 34, 3, 10, '#f4f4f0'); p(27, 34, 3, 10, '#f4f4f0'); p(21, 43, 5, 2, '#e8e8e0'); p(26, 43, 5, 2, '#e8e8e0'); p(7, 42, 8, 3, '#e8e8e0');
    p(24, 11 + b, 10, 9, '#f4f4f0'); p(32, 14 + b, 5, 5, '#f4f4f0'); p(36, 15 + b, 3, 3, '#f4f4f0'); p(38, 15 + b, 2, 2, DARK);
    p(24, 8 + b, 4, 3, '#f4f4f0'); p(25, 6 + b, 2, 2, '#f4f4f0'); p(30, 8 + b, 4, 3, '#f4f4f0'); p(31, 6 + b, 2, 2, '#f4f4f0'); p(25, 9 + b, 1, 2, '#e8a0b0'); p(31, 9 + b, 1, 2, '#e8a0b0');
    p(29, 13 + b, 3, 1, DARK); p(28, 12 + b, 4, 1, '#e83040'); p(26, 16 + b, 2, 2, '#e83040'); p(33, 19 + b, 5, 1, '#d8d8d0');
    wisp(p, t, 4, 40, '#5ce0e8', '#e8ffff', 1); wisp(p, t, 36, 33, '#5ce0e8', '#e8ffff', 3);
    return c;
  },

  // ---------- Asiáticas ----------
  Huodou(t) {
    const c = canvas(), p = painter(c);
    // Perro negro que come fuego y escupe llamas: donde aparece estalla un incendio
    for (let i = 0; i < 5; i++) flame(p, t, 2 + i * 8, 43, i);
    const b = quad(p, t, { col: '#3a3a4a', shade: '#2a2a38', belly: '#4a4a5c', head: 'dog', eye: '#ff3030', fangs: true, hoof: '#2a2a38', tailc: '#2a2a38' });
    flame(p, t, 3, 18 + b, 1); flame(p, t, 11, 17 + b, 2); flame(p, t, 19, 17 + b, 3);
    fireBreath(p, t, 36, 17 + b);
    return c;
  },
  Bulgae(t) {
    const c = canvas(), p = painter(c);
    // Perros de fuego del reino de la oscuridad que persiguen al sol: sus mordiscos son los eclipses
    disc(p, 9, 8, 6, '#ffb030'); disc(p, 9, 8, 4, '#ffd84a'); disc(p, 14, 7, 4, '#2a2a3a');
    const b = quad(p, t, { col: '#e8602c', shade: '#c84a20', belly: '#ffb070', head: 'dog', eye: '#ffd84a', fangs: true, hoof: '#c84a20', tailc: '#ffd84a' });
    flame(p, t, 3, 19 + b, 1); flame(p, t, 10, 17 + b, 2); flame(p, t, 18, 17 + b, 3);
    for (let k = 0; k < 3; k++) ember(p, t, 6 + k * 10, 40, k);
    return c;
  },
  Bifang(t) {
    const c = canvas(), p = painter(c);
    // Grulla de una sola pata, verde con manchas rojas y pico blanco: trae el fuego allí donde va
    const b = bird(p, t, { col: '#2c9c8c', wing: '#2c8c7c', wing2: '#e83030', belly: '#78d0c0', tail: '#e83030', beak: '#f4f4f8', eye: DARK, leg: '#c83020' });
    c.getContext('2d').clearRect(20, 37, 7, 9);
    for (const [x, y] of [[13, 22], [20, 27], [12, 30]]) p(x, y + b, 2, 2, '#e83030');
    p(26, 6 + b, 4, 2, '#e83030'); p(25, 7 + b, 2, 2, '#e83030');
    flame(p, t, 37, 9 + b); ember(p, t, 36, 20, 1); ember(p, t, 30, 24, 2);
    return c;
  },
  Sanzuwu(t) {
    const c = canvas(), p = painter(c);
    // Cuervo de tres patas que vive en el sol y lo lleva cada día por el cielo
    disc(p, 20, 22, 18, '#ffb030'); disc(p, 20, 22, 15, '#ffd84a');
    for (let k = 0; k < 4; k++) twinkle(p, t + k, [4, 36, 6, 34][k], [8, 8, 38, 38][k], '#fff8b0');
    const b = bird(p, t, { col: '#c82818', wing: '#a81c10', wing2: '#e85030', belly: '#e84a30', beak: '#3a2a1a', eye: '#ffd84a', leg: '#3a2a1a' });
    p(19, 37, 2, 7, '#3a2a1a'); p(18, 44, 4, 1, '#3a2a1a');
    p(26, 6 + b, 3, 2, '#e85030');
    return c;
  },
  Dokkaebi(t) {
    const c = canvas(), p = painter(c);
    // Duende coreano de un cuerno con su garrote mágico: lo que pide al golpear el suelo aparece
    const b = figure(p, t, { robe: '#4c7cd8', robeShade: '#3c6cc8', skin: '#4c7cd8', legs: '#4c7cd8', shoe: '#3c6cc8', eyes: '#ffd84a', hair: '#101018', armR: 'up' });
    p(13, 33 + b, 14, 8, '#c8a070'); p(13, 33 + b, 14, 2, '#8a6a40'); for (let i = 0; i < 3; i++) p(15 + i * 4, 37 + b, 2, 3, '#a8885a');
    for (let i = 0; i < 4; i++) p(12 + i * 4, 6 + b + (i % 2), 3, 4, '#101018');
    p(19, 1 + b, 3, 8, '#f4ecd0'); p(20, 0 + b, 1, 1, '#f4ecd0');
    p(16, 13 + b, 3, 1, DARK); p(21, 13 + b, 3, 1, DARK);
    p(16, 18 + b, 8, 2, '#3a1a1a'); p(17, 18 + b, 1, 2, '#ffffff'); p(22, 18 + b, 1, 2, '#ffffff');
    p(27, 2 + b, 5, 12, '#8a5a30'); p(26, 3 + b, 1, 2, '#6a4020'); p(32, 6 + b, 1, 2, '#6a4020'); p(26, 9 + b, 1, 2, '#6a4020'); p(28, 2 + b, 3, 1, '#a8784c');
    twinkle(p, t, 35, 4 + b, '#ffd84a'); twinkle(p, t + 1, 6, 40, '#ffd84a');
    return c;
  },
  Kui(t) {
    const c = canvas(), p = painter(c);
    // Buey de una sola pata, gris como la tormenta: su bramido es el trueno y su ojo brilla como el sol
    p(0, 0, 22, 5, '#3a3c5c'); p(4, 4, 14, 2, '#3a3c5c');
    const b = quad(p, t, { col: '#5a6a7a', shade: '#4a5a6a', belly: '#7a8a9a', head: 'bull', eye: '#fff07a', hoof: '#3a4a5a', tailc: '#3a4a5a' });
    c.getContext('2d').clearRect(0, 34, 40, 14);
    p(16, 33, 6, 11, '#4a5a6a'); p(15, 43, 8, 2, '#3a4a5a'); p(0, 45, 40, 3, '#4a4a3a');
    p(29, 12 + b, 4, 1, '#fff8b0'); p(29, 15 + b, 4, 1, '#fff8b0');
    if (Math.floor(t * 4) % 2) { p(8, 5, 2, 4, '#fff07a'); p(6, 8, 2, 4, '#fff07a'); p(8, 11, 2, 4, '#fff07a'); p(35, 21 + b, 4, 1, '#c8d8f0'); p(36, 23 + b, 4, 1, '#c8d8f0'); }
    return c;
  },
  Leishou(t) {
    const c = canvas(), p = painter(c);
    // Bestia del trueno con melena de relámpagos que baja a la tierra con la tormenta
    p(0, 0, 18, 5, '#3a3c5c'); p(3, 4, 10, 2, '#3a3c5c');
    const b = quad(p, t, { col: '#2a3c6c', shade: '#1c2c5c', belly: '#3c5c9c', head: 'lion', mane: '#f0d040', eye: '#fff07a', hoof: '#f0d040', tailc: '#f0d040' });
    const f = Math.floor(t * 6) % 3;
    for (let i = 0; i < 4; i++) { const x = [21, 24, 36, 22][i], y = [8, 5, 7, 22][i] + b; if ((i + f) % 3) { p(x, y, 2, 2, '#fff8b0'); p(x - 1, y + 2, 2, 2, '#fff8b0'); } }
    if (f === 0) { p(6, 5, 2, 4, '#fff07a'); p(4, 8, 2, 4, '#fff07a'); p(6, 11, 2, 5, '#fff07a'); }
    return c;
  },
  Tulpar(t) {
    const c = canvas(), p = painter(c);
    // Caballo alado de las estepas, de alas doradas, que lleva a los héroes hasta el cielo
    p(0, 45, 40, 3, '#a8a050'); for (let i = 0; i < 6; i++) p(2 + i * 7, 43, 1, 2, '#c8c070');
    const b = quad(p, t, { col: '#f4f4f0', shade: '#d8d8d0', belly: '#e8e8e0', head: 'horse', mane: '#e8c040', tailc: '#e8c040', hoof: '#c8a030' });
    sideWing(p, 16, 22 + b, '#e8c040', '#fff07a', Math.floor(t * 3) % 2, -1, 7);
    p(26, 22 + b, 6, 2, '#c83030'); p(27, 24 + b, 2, 2, '#e8c040');
    return c;
  },
  Bingcan(t) {
    const c = canvas(), p = painter(c);
    // Gusano de seda de hielo de las montañas nevadas: su seda no se moja ni se quema
    for (let k = 0; k < 6; k++) flake(p, t, 3 + k * 7, k);
    p(0, 44, 40, 4, '#f4f8ff');
    p(0, 34, 6, 10, '#ffffff'); for (let i = 0; i < 4; i++) p(0, 35 + i * 2, 6, 1, '#d8e8f8'); p(5, 33, 6, 1, '#ffffff');
    const a = 6 + Math.round(Math.sin(t * 3) * 3);
    for (let i = 0; i < 7; i++) {
      const x = 7 + i * 4, y = 34 - Math.round(Math.sin(Math.PI * i / 7) * a);
      p(x, y, 5, 8, i % 2 ? '#c8ecfc' : '#e8f8ff'); p(x, y, 1, 8, '#a8d8f0'); p(x + 1, y + 8, 2, 2, '#88b8e0'); p(x + 2, y - 2, 1, 2, '#ffffff');
    }
    p(33, 30, 7, 9, '#e8f8ff'); p(34, 32, 1, 2, DARK); p(37, 32, 1, 2, DARK); p(34, 37, 4, 1, '#78a8d0'); p(34, 28, 1, 2, '#a8d8f0'); p(38, 28, 1, 2, '#a8d8f0');
    twinkle(p, t, 22, 24, '#ffffff');
    return c;
  },
  Bixi(t) {
    const c = canvas(), p = painter(c);
    // Tortuga-dragón de fuerza enorme que carga las estelas de piedra de los emperadores
    p(0, 45, 40, 3, '#8a8a7a');
    const b = turtle(p, t, { shell: '#7a8a7a', skin: '#3c9c7c', skinShade: '#2c7c5c', rim: '#5a6a5a' });
    for (let i = 0; i < 5; i++) p(6 + i * 6, 26 + b + (i % 2) * 3, 4, 3, '#9aaa9a');
    p(11, 20 + b, 18, 2, '#8a8a82'); p(13, 4 + b, 14, 17, '#a8a8a0'); p(12, 2 + b, 16, 3, '#b8b8b0'); p(14, 0 + b, 12, 2, '#b8b8b0'); p(13, 4 + b, 2, 17, '#909088');
    p(17, 1 + b, 6, 1, '#7a7a72'); for (let i = 0; i < 4; i++) { p(17, 7 + b + i * 3, 2, 1, '#6a6a62'); p(21, 7 + b + i * 3, 3, 1, '#6a6a62'); }
    p(33, 27 + b, 6, 7, '#3c9c7c'); p(37, 29 + b, 3, 4, '#3c9c7c'); p(35, 28 + b, 2, 2, '#ffd84a'); p(33, 24 + b, 2, 3, '#e8d8b0'); p(36, 25 + b, 1, 2, '#e8d8b0');
    p(37, 33 + b, 3, 1, '#ffffff'); const w = Math.floor(t * 3) % 2; p(39, 34 + b + w, 1, 3, '#78d0b0');
    return c;
  },
  Bulgasari(t) {
    const c = canvas(), p = painter(c);
    // Bestia coreana nacida de un grano de arroz que come hierro y crece sin parar; ninguna arma la hiere
    p(0, 45, 40, 3, '#5a4a3a'); p(2, 44, 4, 1, '#a8a8b8'); p(8, 44, 1, 1, '#a8a8b8'); p(33, 44, 5, 1, '#a8a8b8');
    const b = quad(p, t, { col: '#6a6a74', shade: '#5a5a64', belly: '#7a7a84', head: 'none', hoof: '#3a3a44', tailc: '#5a5a64' });
    for (let i = 0; i < 8; i++) { p(6 + i * 3, 15 + b - (i % 2) * 2, 1, 6, '#d8d8e8'); p(7 + i * 3, 25 + b, 1, 3, '#a8a8b8'); }
    p(25, 12 + b, 11, 11, '#6a6a74'); p(25, 10 + b, 3, 3, '#6a6a74'); p(32, 10 + b, 3, 3, '#6a6a74');
    p(30, 15 + b, 2, 2, '#ff3030'); p(29, 14 + b, 4, 1, '#4a4a54');
    p(35, 16 + b, 3, 3, '#6a6a74'); p(37, 18 + b, 3, 4, '#6a6a74'); p(33, 21 + b, 4, 1, '#f4f4f8');
    const ch = Math.floor(t * 3) % 2; p(38, 22 + b + ch, 1, 4, '#a8a8b8');
    return c;
  },
  Suanni(t) {
    const c = canvas(), p = painter(c);
    // León de jade que adora el humo del incienso: por eso se sienta sobre los incensarios
    p(1, 37, 10, 7, '#a87a30'); p(0, 35, 12, 2, '#c89a40'); p(2, 44, 2, 2, '#8a5a20'); p(8, 44, 2, 2, '#8a5a20'); p(4, 39, 4, 2, '#e8c040');
    for (let k = 0; k < 4; k++) p(5 + Math.round(Math.sin(t * 2 + k) * 2), 31 - k * 6 - Math.floor((t * 6) % 5), 2, 3, '#c8c8d8');
    const b = quad(p, t, { col: '#3cac8c', shade: '#2c8c6c', belly: '#78d0b0', head: 'lion', mane: '#e8c040', eye: DARK, hoof: '#2c8c6c', tailc: '#e8c040', tail: false });
    for (let i = 0; i < 6; i++) p(23 + (i % 3) * 4, 9 + b + Math.floor(i / 3) * 12, 2, 2, '#fff07a');
    p(12, 22 + b, 3, 6, '#e8c040'); p(11, 20 + b, 3, 3, '#e8c040');
    return c;
  },
  Jiaolong(t) {
    const c = canvas(), p = painter(c);
    // Dragón de las aguas sin cuernos que provoca crecidas y tormentas en ríos y lagos
    longDragon(p, t, { col: '#2a3c7c', shade: '#1c2c6c', belly: '#5ce0f0', mane: '#5ce0f0', horns: false, eye: '#ffd84a' });
    p(0, 43, 40, 5, '#2c6cb8'); for (let i = 0; i < 4; i++) p((t * 4 + i * 11) % 40, 42, 5, 1, '#a8e0ff');
    bubble(p, t, 34, 44); bubble(p, t, 12, 46, 3);
    return c;
  },
  Chiwen(t) {
    const c = canvas(), p = painter(c);
    // Hijo del dragón con cuerpo de pez que se pone en los tejados para protegerlos del fuego
    p(0, 40, 40, 8, '#4a5a6a'); for (let i = 0; i < 8; i++) p(i * 5, 40, 4, 3, '#6a7a8a');
    const y = fish(p, t, { col: '#3cac8c', fin: '#2c8c6c', belly: '#a8e8d0' });
    for (let i = 0; i < 4; i++) p(14 + i * 4, y + (i % 2) * 3, 2, 1, '#2c8c6c');
    p(28, y - 8, 2, 5, '#e8c040'); p(31, y - 7, 2, 4, '#e8c040'); p(27, y - 9, 2, 1, '#e8c040');
    const w = Math.floor(t * 3) % 2; p(36, y + 6, 3, 1, '#a8e8d0'); p(38, y + 7 + w, 1, 3, '#a8e8d0');
    const d = (t * 10) % 12; p(37, y + 10 + d, 1, 2, '#78c8f0'); p(34, y + 14 + ((d + 6) % 12), 1, 2, '#78c8f0');
    return c;
  },
  Kunpeng(t) {
    const c = canvas(), p = painter(c);
    // El gran pez Kun que se convierte en el ave Peng, tan enorme que sus alas tapan el cielo
    p(0, 40, 40, 8, '#1c3c6c'); for (let i = 0; i < 4; i++) p((t * 4 + i * 10) % 40, 40, 4, 1, '#a8e0ff');
    const fw = Math.floor(t * 3) % 2; p(3, 36 + fw, 6, 5, '#5a7aa8'); p(1, 33 + fw, 4, 4, '#5a7aa8'); p(7, 33 + fw, 4, 4, '#5a7aa8');
    const b = bob(t), flap = Math.floor(t * 3) % 2;
    wings(p, 10 + b, '#2c4c9c', '#5c8cf0', flap, 13);
    p(14, 14 + b, 12, 22, '#2a3c7c'); p(17, 20 + b, 6, 14, '#5c7cc8'); for (let i = 0; i < 4; i++) p(17, 22 + b + i * 3, 6, 1, '#3c5ca8');
    p(15, 5 + b, 10, 10, '#2a3c7c'); p(16, 8 + b, 2, 2, '#ffd84a'); p(22, 8 + b, 2, 2, '#ffd84a');
    p(18, 11 + b, 4, 4, '#e8b030'); p(19, 15 + b, 2, 1, '#c89020'); p(18, 2 + b, 4, 3, '#5c8cf0');
    p(13, 36, 14, 4, '#2c4c9c'); p(15, 36, 2, 4, '#5c8cf0'); p(23, 36, 2, 4, '#5c8cf0');
    return c;
  },
  Druk(t) {
    const c = canvas(), p = painter(c);
    // Dragón del trueno de Bután, blanco y azul, que lleva perlas entre las garras
    longDragon(p, t, { col: '#f4f4f8', shade: '#d8e0e8', belly: '#78d8f0', mane: '#3c7cd8', eye: '#3c7cd8', horn: '#e8c040', pearl: true, clouds: true });
    if (Math.floor(t * 6) % 3 === 0) { p(4, 2, 2, 4, '#fff07a'); p(2, 5, 2, 4, '#fff07a'); p(4, 8, 2, 5, '#fff07a'); }
    return c;
  },
  Tianlong(t) {
    const c = canvas(), p = painter(c);
    // Dragón celestial dorado y alado que guarda los palacios de los dioses
    for (let k = 0; k < 4; k++) twinkle(p, t + k, [4, 14, 6, 36][k], [6, 2, 20, 40][k], '#fff8b0');
    longDragon(p, t, { col: '#e8c040', shade: '#c8a030', belly: '#fff8e0', mane: '#d83020', wings: '#f4f4f8', wing2: '#d8e0e8', eye: '#d83020', horn: '#f4f4f8' });
    return c;
  },
  Yinglong(t) {
    const c = canvas(), p = painter(c);
    // Dragón alado de jade que trae la lluvia: ayudó a domar las grandes inundaciones
    for (let i = 0; i < 6; i++) p(2 + i * 7, (t * 20 + i * 9) % 44, 1, 3, '#78a8f0');
    longDragon(p, t, { col: '#3cac7c', shade: '#2c8c5c', belly: '#c8f0a0', mane: '#f0d040', wings: '#e8c040', wing2: '#fff07a', eye: '#f0d040', horn: '#e8d8b0' });
    return c;
  },
  Shenlong(t) {
    const c = canvas(), p = painter(c);
    // Dragón espíritu azul que manda sobre el viento, las nubes y la lluvia
    longDragon(p, t, { col: '#3c6cd8', shade: '#2c4cb8', belly: '#e8c040', mane: '#f4f4f8', eye: '#ffd84a', horn: '#e8c040', clouds: true });
    const w = (t * 12) % 30; p(w, 4, 4, 1, '#c8e0ff'); p(w + 6, 6, 3, 1, '#c8e0ff');
    return c;
  },
  Chuchunya(t) {
    const c = canvas(), p = painter(c);
    // Hombre salvaje de Siberia, alto y peludo, que roba la comida a los cazadores
    p(0, 45, 40, 3, '#e8f0f8'); p(0, 20, 4, 25, '#3c5c3c'); p(36, 24, 4, 21, '#3c5c3c');
    const b = giant(p, t, { skin: '#c89878', shade: '#a87858', armor: '#8a8a94', armorShade: '#6a6a74', hair: '#9a9aa4', wild: true, legs: '#8a8a94', shoe: '#6a6a74', eyes: '#3a2a1a' });
    p(5, 20 + b, 5, 13, '#8a8a94'); p(30, 20 + b, 5, 13, '#8a8a94');
    for (let i = 0; i < 5; i++) { p(11 + i * 4, 22 + b + (i % 2) * 4, 2, 5, '#a8a8b4'); p(12 + i * 4, 36, 2, 3, '#6a6a74'); }
    p(13, 13 + b, 14, 2, '#9a9aa4'); p(14, 15 + b, 2, 5, '#9a9aa4'); p(24, 15 + b, 2, 5, '#9a9aa4');
    const s = Math.floor(t * 3) % 2;
    p(34, 34 + b + s, 6, 3, '#a8b8c8'); p(38, 33 + b + s, 2, 5, '#8898a8'); p(35, 35 + b + s, 1, 1, DARK);
    return c;
  },
  Yeti(t) {
    const c = canvas(), p = painter(c);
    // Gigante de las nieves del Himalaya, de pelo blanco, que deja huellas enormes
    for (let k = 0; k < 7; k++) flake(p, t, 2 + k * 6, k);
    p(0, 45, 40, 3, '#e8f0f8'); p(2, 46, 3, 1, '#a8c0d8'); p(34, 46, 3, 1, '#a8c0d8');
    const b = giant(p, t, { skin: '#f4f4f8', shade: '#d8d8e8', hair: '#f4f4f8', wild: true, legs: '#f4f4f8', shoe: '#d8d8e8', armR: Math.floor(t * 2) % 2 ? 'up' : undefined });
    for (let i = 0; i < 5; i++) p(11 + i * 4, 22 + b + (i % 2) * 5, 1, 6, '#d8d8e8');
    p(15, 8 + b, 10, 11, '#8a8aa0'); p(16, 11 + b, 2, 2, '#ffd84a'); p(22, 11 + b, 2, 2, '#ffd84a'); p(15, 10 + b, 10, 1, '#6a6a80');
    p(18, 13 + b, 4, 2, '#6a6a80'); p(17, 16 + b, 6, 2, '#3a1a2a'); p(17, 16 + b, 1, 2, '#ffffff'); p(22, 16 + b, 1, 2, '#ffffff');
    for (let i = 0; i < 3; i++) p(4 + i * 2, 37 + b, 1, 2, '#3a3a4a');
    return c;
  },
  'Snow Lion'(t) {
    const c = canvas(), p = painter(c);
    // León de las nieves del Tíbet, de melena turquesa, que salta entre las cumbres
    for (let y = 0; y < 22; y++) { const w = Math.round(y * 0.8); p(9 - w, 24 + y, w * 2 + 1, 1, y < 6 ? '#f4f8ff' : '#7a8aa8'); }
    p(0, 45, 40, 3, '#f4f8ff');
    const b = quad(p, t, { col: '#f4f4f0', shade: '#d8d8d0', belly: '#e8e8e0', head: 'lion', mane: '#3cc8c0', eye: DARK, hoof: '#d8d8d0', tailc: '#3cc8c0' });
    for (let i = 0; i < 6; i++) p(23 + (i % 3) * 4, 9 + b + Math.floor(i / 3) * 12, 2, 2, '#a8f0e8');
    for (const x of [8, 13, 23, 28]) p(x - 1, 34, 5, 2, '#3cc8c0');
    p(9, 33 + b, 18, 1, '#3cc8c0');
    return c;
  },
  Almas(t) {
    const c = canvas(), p = painter(c);
    // Hombre salvaje de las montañas de Mongolia, cubierto de pelo pardo, que huye de la gente
    p(0, 45, 40, 3, '#a89060'); for (let i = 0; i < 6; i++) p(1 + i * 7, 43, 1, 2, '#c8b070');
    const b = figure(p, t, { robe: '#8a5a30', robeShade: '#6a4a28', skin: '#c89878', legs: '#8a5a30', shoe: '#6a4a28', hair: '#6a4a28', longHair: true, eyes: '#3a2a1a' });
    p(10, 25 + b, 3, 9, '#8a5a30'); p(27, 25 + b, 3, 9, '#8a5a30');
    for (let i = 0; i < 4; i++) p(14 + i * 3, 25 + b + (i % 2) * 3, 2, 12, '#a87040');
    p(15, 13 + b, 10, 1, '#8a6a50'); p(15, 18 + b, 10, 4, '#6a4a28'); p(18, 18 + b, 4, 1, '#8a4a40');
    p(28, 33 + b, 5, 4, '#8a8a8a'); p(29, 33 + b, 2, 1, '#a8a8a8');
    return c;
  },
  Olgoikhorkhoi(t) {
    const c = canvas(), p = painter(c);
    // Gusano de la muerte del Gobi: rojo como un intestino, escupe ácido y mata con descargas
    p(0, 40, 40, 8, '#d8b070'); p(0, 38, 16, 3, '#d8b070'); p(26, 39, 14, 2, '#d8b070');
    let x = 16, y = 42;
    for (let k = 0; k <= 10; k++) { x = 14 + Math.round(Math.sin(k * 0.4 + t * 2) * 3) + Math.round(k * 0.3); y = 42 - k * 2.6; p(x, y, 8, 4, k % 2 ? '#c83030' : '#e84a4a'); p(x, y + 3, 8, 1, '#a82020'); }
    p(x - 1, y - 3, 10, 4, '#e84a4a'); p(x + 1, y - 3, 6, 2, '#3a1010'); p(x + 1, y - 3, 1, 1, '#f4e8e0'); p(x + 3, y - 3, 1, 1, '#f4e8e0'); p(x + 5, y - 3, 1, 1, '#f4e8e0');
    const f = Math.floor(t * 4) % 4;
    if (f < 2) { p(x + 9, y - 5 - f, 2, 2, '#9cf060'); p(x + 12, y - 4 + f * 2, 2, 2, '#9cf060'); p(x + 14, y + f * 3, 1, 2, '#9cf060'); }
    else { p(x - 4, y, 1, 3, '#fff07a'); p(x - 5, y + 3, 1, 3, '#fff07a'); p(x + 10, y + 4, 1, 3, '#fff07a'); p(x + 11, y + 7, 1, 2, '#fff07a'); }
    p(8, 41, 24, 3, '#d8b070'); p(10, 40, 4, 1, '#e8c890');
    return c;
  },
  Jiangshi(t) {
    const c = canvas(), p = painter(c);
    // Vampiro saltarín de la dinastía Qing: rígido, brazos al frente y un talismán en la frente
    const h = -Math.round(Math.abs(Math.sin(t * 3)) * 4);
    p(13, 46, 14, 1, '#2a2a3a');
    p(15, 40 + h, 4, 6, '#1c2c5c'); p(21, 40 + h, 4, 6, '#1c2c5c'); p(14, 45 + h, 6, 2, '#101018'); p(20, 45 + h, 6, 2, '#101018');
    p(13, 23 + h, 14, 18, '#2a3c6c'); p(13, 23 + h, 3, 18, '#1c2c5c'); p(13, 39 + h, 14, 2, '#e8c040');
    p(16, 29 + h, 8, 7, '#e8c040'); p(17, 30 + h, 6, 5, '#d83030'); p(19, 31 + h, 2, 2, '#f4f4f8');
    p(25, 20 + h, 13, 3, '#1c2c5c'); p(36, 20 + h, 4, 3, '#a8c8a0');
    p(25, 24 + h, 12, 4, '#2a3c6c'); p(35, 24 + h, 2, 4, '#e8c040'); p(37, 24 + h, 3, 4, '#a8c8a0'); p(39, 27 + h, 1, 2, '#d8d0a0');
    p(18, 21 + h, 4, 3, '#a8c8a0');
    p(14, 10 + h, 12, 12, '#a8c8a0'); p(15, 15 + h, 2, 1, DARK); p(23, 15 + h, 2, 1, DARK); p(17, 20 + h, 1, 2, '#ffffff'); p(22, 20 + h, 1, 2, '#ffffff');
    p(13, 5 + h, 14, 6, '#101018'); p(12, 9 + h, 16, 2, '#101018'); p(19, 3 + h, 2, 2, '#d83030');
    const fl = Math.floor(t * 4) % 2;
    p(17 + fl, 8 + h, 6, 11, '#f0d040'); p(19 + fl, 10 + h, 2, 1, '#d83030'); p(18 + fl, 12 + h, 4, 1, '#d83030'); p(19 + fl, 14 + h, 1, 3, '#d83030'); p(21 + fl, 15 + h, 1, 2, '#d83030');
    return c;
  },
  'Jade Rabbit'(t) {
    const c = canvas(), p = painter(c);
    // Conejo de jade que machaca en la luna el elixir de la inmortalidad
    disc(p, 20, 22, 18, '#f0d878'); p(5, 14, 4, 3, '#d8c060'); p(28, 30, 5, 4, '#d8c060'); p(9, 33, 3, 3, '#d8c060'); p(30, 8, 3, 2, '#d8c060');
    p(24, 34, 12, 9, '#8a6a40'); p(23, 33, 14, 2, '#a8784c'); p(27, 43, 6, 2, '#6a4a28'); p(25, 34, 10, 1, '#78e0a8');
    const u = Math.floor(t * 3) % 2 ? 0 : -5;
    p(8, 26, 12, 16, '#ffffff'); p(11, 30, 7, 10, '#f0f0f0'); p(6, 42, 6, 3, '#ffffff'); p(14, 42, 6, 3, '#ffffff'); p(6, 34, 3, 4, '#ffffff');
    p(9, 14, 11, 11, '#ffffff'); p(10, 2, 3, 13, '#ffffff'); p(15, 1, 3, 13, '#ffffff'); p(11, 4, 1, 9, '#ffb0c0'); p(16, 3, 1, 9, '#ffb0c0');
    p(16, 18, 2, 2, '#e83040'); p(19, 21, 1, 1, '#ff9cb0'); p(13, 22, 3, 1, '#ffd0d8');
    p(26, 18 + u, 3, 18, '#c8a070'); p(25, 18 + u, 5, 3, '#a8784c'); p(18, 28 + Math.round(u / 2), 9, 3, '#ffffff');
    if (!u) { twinkle(p, t, 31, 31, '#a8f0c8'); twinkle(p, t + 1, 24, 30, '#a8f0c8'); }
    return c;
  },
  Luduan(t) {
    const c = canvas(), p = painter(c);
    // Unicornio-león de jade que habla todas las lenguas y solo aparece ante gobernantes sabios
    p(1, 2, 15, 9, '#f4e8c8'); p(0, 2, 1, 9, '#c8a070'); p(16, 2, 1, 9, '#c8a070');
    const sh = Math.floor(t * 3) % 3;
    for (let i = 0; i < 3; i++) p(3 + ((i + sh) % 3) * 2, 4 + i * 2, 8 - i * 2, 1, '#8a6a40');
    const b = quad(p, t, { col: '#3cac8c', shade: '#2c8c6c', belly: '#a8e8d0', head: 'lion', mane: '#2c7c5c', eye: DARK, hoof: '#2c8c6c', tailc: '#2c7c5c' });
    p(31, 2 + b, 2, 8, '#e8c040'); p(32, 0 + b, 1, 2, '#fff07a');
    for (let i = 0; i < 4; i++) p(9 + i * 5, 23 + b + (i % 2) * 3, 2, 2, '#2c8c6c');
    return c;
  },
  Zhuque(t) {
    const c = canvas(), p = painter(c);
    // Ave bermellón del sur, guardiana del verano y del fuego
    for (let i = 0; i < 6; i++) flame(p, t, 2 + i * 7, 44, i);
    const cols = ['#a81c30', '#e83020', '#ff9c30'];
    for (let k = 0; k < 3; k++) for (let i = 0; i < 10; i++) p(9 - i * 0.8 + k * 2 + Math.round(Math.sin(i * 0.6 + t * 3 + k) * 1.5), 28 + i * 1.5, 3, 2, i > 7 ? '#ffd84a' : cols[k]);
    const b = bird(p, t, { col: '#e83020', wing: '#a81c30', wing2: '#ff7a20', belly: '#ff9c40', tail: '#a81c30', beak: '#ffd84a', eye: DARK, leg: '#d8a030' });
    p(26, 4 + b, 2, 4, '#ffd84a'); p(29, 3 + b, 2, 5, '#ffd84a'); p(32, 5 + b, 2, 3, '#ffd84a');
    for (let k = 0; k < 3; k++) ember(p, t, 14 + k * 9, 22, k);
    return c;
  },
  Fenghuang(t) {
    const c = canvas(), p = painter(c);
    // Fénix chino, reina de las aves: cola de pavo real y cresta roja; aparece en tiempos de paz
    const sw = Math.sin(t * 2) * 0.03;
    for (let k = 0; k < 7; k++) {
      const a = Math.PI * (0.5 + k * 0.09 + sw);
      for (let r = 0; r < 15; r++) p(12 + Math.cos(a) * r, 30 - Math.sin(a) * r * 1.2, 2, 2, k % 2 ? '#2c9c9c' : '#3cbcac');
      const x = 12 + Math.cos(a) * 15, y = 30 - Math.sin(a) * 18;
      p(x - 1, y - 1, 4, 4, '#2c9c9c'); p(x, y, 2, 2, '#e8c040'); p(x, y, 1, 1, '#2a3c7c');
    }
    const b = bird(p, t, { col: '#e8c040', wing: '#d83030', wing2: '#ff7a20', belly: '#fff07a', tail: '#2c9c9c', beak: '#d8a030', eye: DARK, leg: '#d8a030' });
    p(26, 4 + b, 2, 4, '#d83030'); p(29, 3 + b, 2, 5, '#d83030'); p(32, 5 + b, 2, 3, '#d83030'); p(33, 16 + b, 2, 3, '#d83030');
    for (let i = 0; i < 3; i++) p(14 + i * 5, 24 + b, 2, 1, '#2c9c9c');
    return c;
  },
  Xiezhi(t) {
    const c = canvas(), p = painter(c);
    // Bestia de la justicia con un solo cuerno: distingue al culpable y lo embiste
    const tl = Math.floor(t * 2) % 2;
    p(6, 2, 1, 10, '#e8c040'); p(1, 3 + tl, 11, 1, '#e8c040'); p(0, 7 + tl * 2, 4, 1, '#e8c040'); p(9, 7 - tl * 2 + 2, 4, 1, '#e8c040');
    p(1, 4 + tl, 1, 3 + tl, '#c8a030'); p(11, 4 + tl, 1, 5 - tl, '#c8a030'); p(4, 12, 5, 1, '#e8c040');
    const b = quad(p, t, { col: '#2a3c6c', shade: '#1c2c5c', belly: '#3c5c9c', head: 'goat', horn: '#2a3c6c', beard: '#1c2c5c', eye: '#ffd84a', hoof: '#e8c040', tailc: '#1c2c5c' });
    p(29, 0 + b, 2, 9, '#e8c040'); p(29, 0 + b, 1, 7, '#fff07a');
    for (let i = 0; i < 4; i++) p(9 + i * 5, 22 + b + (i % 2) * 3, 3, 2, '#3c5c9c');
    p(23, 12 + b, 3, 10, '#1c2c5c');
    return c;
  },
  Haetae(t) {
    const c = canvas(), p = painter(c);
    // León guardián coreano de un cuerno, con escamas y cascabel: protege del fuego
    p(0, 44, 40, 4, '#9a9a9a'); p(0, 44, 40, 1, '#b8b8b8');
    const b = quad(p, t, { col: '#e8b830', shade: '#c89820', belly: '#f4d870', head: 'lion', mane: '#3cac8c', eye: DARK, hoof: '#c89820', tailc: '#3cac8c' });
    p(31, 3 + b, 2, 6, '#3cac8c');
    for (let r = 0; r < 2; r++) for (let i = 0; i < 4; i++) p(9 + i * 4 + r * 2, 23 + r * 4 + b, 2, 1, '#c89820');
    for (let i = 0; i < 6; i++) p(23 + (i % 3) * 4, 9 + b + Math.floor(i / 3) * 12, 2, 2, '#a8e8d0');
    p(25, 23 + b, 6, 2, '#d83030'); const sw = Math.floor(t * 3) % 2; p(26 + sw, 25 + b, 4, 4, '#e8c040'); p(27 + sw, 28 + b, 2, 1, '#5a3c20');
    return c;
  },
  Pixiu(t) {
    const c = canvas(), p = painter(c);
    // Bestia alada que come oro y no lo suelta nunca: por eso atrae la riqueza
    p(28, 43, 12, 3, '#d8a030'); p(31, 41, 6, 2, '#e8c040'); twinkle(p, t, 33, 41, '#fff8b0');
    const b = quad(p, t, { col: '#e8b830', shade: '#c89820', belly: '#f4d870', head: 'lion', mane: '#d8a020', eye: DARK, hoof: '#c89820', tailc: '#d8a020' });
    sideWing(p, 18, 21 + b, '#e8c040', '#fff07a', Math.floor(t * 3) % 2, -1, 6);
    p(26, 4 + b, 2, 5, '#fff07a'); p(24, 3 + b, 2, 2, '#fff07a'); p(30, 4 + b, 2, 5, '#fff07a'); p(28, 3 + b, 2, 2, '#fff07a');
    for (let k = 0; k < 2; k++) { const q = (t * 6 + k * 5) % 10, x = 38 - q * 0.2, y = 2 + q * 1.5; p(x, y, 3, 3, '#ffd84a'); p(x + 1, y + 1, 1, 1, '#a87a20'); }
    return c;
  },
  Baize(t) {
    const c = canvas(), p = painter(c);
    // Bestia blanca y sabia que habla y conoce a todos los demonios; tiene ojos por todo el cuerpo
    const b = quad(p, t, { col: '#f4f4f0', shade: '#d8d8d0', belly: '#e8e8e0', head: 'goat', horn: '#e8c040', beard: '#ffffff', eye: DARK, hoof: '#c8c8c0', tailc: '#ffffff' });
    p(22, 10 + b, 4, 14, '#ffffff'); p(23, 12 + b, 1, 10, '#d8d8d0');
    const open = Math.floor(t * 2) % 3;
    [[9, 23], [15, 22], [21, 25], [12, 28]].forEach(([x, y], i) => {
      if ((i + open) % 3) { p(x - 1, y + b, 5, 3, '#8a8a9a'); p(x, y + b, 3, 3, '#2a6aa8'); p(x + 1, y + 1 + b, 1, 1, DARK); }
      else p(x - 1, y + 1 + b, 5, 1, '#8a8a9a');
    });
    p(29, 9 + b, 2, 1, '#2a6aa8');
    return c;
  },
  'Huli jing'(t) {
    const c = canvas(), p = painter(c);
    // Espíritu zorro chino que se transforma en una bella mujer; sus nueve colas la delatan
    const sw = Math.sin(t * 2) * 0.03;
    for (let k = 0; k < 9; k++) {
      const a = Math.PI * (0.1 + k * 0.1 + sw), cl = k % 2 ? '#dcdce4' : '#fafaf6';
      for (let r = 6; r < 20; r++) { const x = 20 + Math.cos(a) * r, y = 34 - Math.sin(a) * r * 1.1; p(x - 1, y, 1, 3, '#b8c0d0'); p(x, y, 3, 3, r > 17 ? '#ffb070' : cl); }
    }
    const b = kimono(p, t, { robe: '#c83030', robeShade: '#a82020', sleeveCol: '#c83030', hair: '#101018', longHair: true, eyes: '#e8c040', obi: '#e8c040', obiKnot: '#c83030', collar: '#e8c040', pattern: '#e8c040', skin: '#f4e0d0' });
    p(13, 4 + b, 3, 5, '#101018'); p(24, 4 + b, 3, 5, '#101018'); p(14, 6 + b, 1, 2, '#d86a7a'); p(25, 6 + b, 1, 2, '#d86a7a');
    p(19, 11 + b, 2, 2, '#d83030'); p(18, 18 + b, 4, 1, '#d83040');
    return c;
  },
  Gumiho(t) {
    const c = canvas(), p = painter(c);
    // Zorra coreana de nueve colas que guarda en la boca su perla de zorro; de ojos rojos bajo la luna
    const ctx = c.getContext('2d');
    disc(p, 33, 6, 5, '#f4f0c8'); ctx.globalCompositeOperation = 'destination-out'; disc(p, 35, 4, 4, '#000'); ctx.globalCompositeOperation = 'source-over';
    const sw = Math.sin(t * 2) * 0.04;
    for (let k = 0; k < 9; k++) {
      const a = Math.PI * (0.33 + k * 0.05 + sw), cl = k % 2 ? '#dcdce4' : '#fafaf6';
      for (let r = 0; r < 18; r++) { const x = 9 + Math.cos(a) * r * 0.9, y = 23 - Math.sin(a) * r * 1.15; p(x - 1, y, 1, 3, '#b8c0d0'); p(x, y, 3, 3, r > 14 ? '#c8c8d8' : cl); }
    }
    const b = quad(p, t, { col: '#f4f4f0', shade: '#d8d8d0', belly: '#ffffff', head: 'none', tail: false, hoof: '#d8d8d0' });
    foxHead(p, b, '#f4f4f0', '#ff3030', null);
    p(29, 12 + b, 3, 3, '#ff3030'); p(30, 13 + b, 1, 1, '#ffd0d0');
    p(37, 18 + b, 3, 3, '#78e0ff'); twinkle(p, t, 38, 18 + b, '#ffffff');
    return c;
  },
  Qilin(t) {
    const c = canvas(), p = painter(c);
    // Unicornio chino con escamas y cuerpo de ciervo envuelto en llamas: anuncia la llegada de un sabio
    const b = quad(p, t, { col: '#e8b830', shade: '#c89820', belly: '#f4d870', head: 'deer', eye: DARK, hoof: '#3a2a1a', tailc: '#e85030' });
    for (let j = 0; j < 3; j++) for (let i = 0; i < 5; i++) p(8 + i * 4 + (j % 2) * 2, 21 + j * 4 + b, 2, 2, '#3cac8c');
    p(22, 10 + b, 3, 14, '#e85030'); p(21, 12 + b, 2, 10, '#ff7a40');
    p(27, 1 + b, 2, 7, '#e8d8b0'); p(25, 3 + b, 2, 2, '#e8d8b0'); p(30, 0 + b, 2, 7, '#e8d8b0'); p(32, 2 + b, 2, 2, '#e8d8b0');
    p(35, 16 + b, 2, 4, '#e85030'); p(37, 14 + b, 2, 1, '#e85030');
    [8, 13, 23, 28].forEach((x, i) => flame(p, t, x, 39, i));
    flame(p, t, 12, 17 + b, 1); flame(p, t, 18, 17 + b, 3);
    return c;
  },

  // ---------- Indomalayas ----------
  Diwata(t) {
    const c = canvas(), p = painter(c);
    // Hada de los bosques filipinos con corona de flores: protege los árboles y castiga a quien los tala
    p(0, 0, 3, 30, '#3c8c3c'); p(37, 0, 3, 26, '#3c8c3c'); for (let i = 0; i < 5; i++) { p(2, 3 + i * 6, 3, 2, '#5cac4c'); p(35, 5 + i * 5, 3, 2, '#5cac4c'); }
    const b = figure(p, t, { robe: '#4cac5c', robeShade: '#3c8c4c', dress: true, hair: '#101018', longHair: true, eyes: '#5a3c20', skin: '#d8a070', armL: 'up' });
    for (let i = 0; i < 4; i++) { p(12 + i * 4, 44, 3, 3, '#3c8c3c'); p(15 + i * 3, 28 + b + (i % 2) * 6, 3, 2, '#78d06c'); }
    ['#ff7ca0', '#ffd84a', '#ffffff', '#ff7ca0', '#ffd84a'].forEach((cl, i) => p(13 + i * 3, 7 + b, 2, 2, cl));
    p(9, 9 + b, 4, 4, '#ff7ca0'); p(10, 10 + b, 2, 2, '#ffd84a');
    for (let k = 0; k < 4; k++) twinkle(p, t + k, [6, 33, 30, 8][k], [22, 14, 34, 38][k], '#d8ff70');
    return c;
  },
  'Nuno sa punso'(t) {
    const c = canvas(), p = painter(c);
    // Anciano enano que vive en los hormigueros: si lo pisas sin pedir permiso, te maldice
    for (let y = 0; y < 12; y++) { const w = 8 + Math.round(y * 1.2); p(20 - w, 36 + y, w * 2, 1, '#a8784c'); }
    p(6, 42, 2, 2, '#5a3c20'); p(31, 44, 2, 2, '#5a3c20'); p(9, 46, 2, 1, '#5a3c20');
    for (let i = 0; i < 4; i++) p(4 + ((t * 6 + i * 8) % 30), 47 - (i % 2), 1, 1, '#2a1a10');
    const b = dwarf(p, t, { robe: '#8a6040', robeShade: '#6a4a30', belt: '#3a2a1a', hair: '#f4f4f8', beard: '#f4f4f8', eyes: '#3a2a1a', skin: '#c8906a' });
    p(15, 30 + b, 10, 12, '#f4f4f8'); p(17, 42, 6, 3, '#f4f4f8'); p(16, 20 + b, 3, 1, '#f4f4f8'); p(21, 20 + b, 3, 1, '#f4f4f8');
    p(11, 12 + b, 18, 3, '#c8a060'); p(15, 9 + b, 10, 3, '#b89050'); p(18, 7 + b, 4, 2, '#a88040');
    p(31, 24 + b, 2, 21, '#8a6a40'); p(29, 24 + b, 4, 2, '#8a6a40');
    return c;
  },
  Pontianak(t) {
    const c = canvas(), p = painter(c);
    // Fantasma de mujer de vestido blanco y pelo larguísimo que acecha en los bananos; huele a frangipani
    p(1, 14, 4, 34, '#7a8a4a'); p(0, 8, 14, 4, '#3c8c3c'); p(4, 4, 10, 3, '#4cac4c'); p(10, 11, 4, 8, '#3c8c3c'); p(0, 11, 3, 6, '#3c8c3c');
    const f = ghost(p, t, { col: '#f4f4f0', hair: '#101018', eye: '#ff3030', mouth: '#3a1a1a' });
    p(10, 6 + f, 20, 5, '#101018'); p(13, 11 + f, 3, 6, '#101018'); p(25, 11 + f, 3, 5, '#101018');
    p(18, 25 + f, 1, 2, '#ffffff'); p(21, 25 + f, 1, 2, '#ffffff');
    p(7, 24 + f, 4, 4, '#e8e0d8'); p(7, 28 + f, 1, 2, '#c8c0b8'); p(10, 28 + f, 1, 2, '#c8c0b8');
    p(19, 31 + f, 2, 4, '#c81c1c');
    const fy = Math.round(Math.sin(t * 2) * 2); p(32, 10 + fy, 5, 5, '#ffffff'); p(33, 11 + fy, 3, 3, '#ffd84a'); p(34, 12 + fy, 1, 1, '#ffffff');
    return c;
  },
  Manananggal(t) {
    const c = canvas(), p = painter(c);
    // Bruja que separa su torso de las piernas y vuela de noche con alas de murciélago
    const pale = '#e8e0e8', fl = Math.floor(t * 3) % 2, y = Math.round(Math.sin(t * 2) * 2);
    p(28, 36, 10, 6, '#c81c3c'); p(28, 35, 10, 1, '#8a1010'); p(29, 42, 3, 4, pale); p(34, 42, 3, 4, pale); p(28, 46, 4, 1, '#5a3c30'); p(34, 46, 4, 1, '#5a3c30');
    for (const d of [-1, 1]) for (let i = 0; i < 13; i++) {
      const x = d < 0 ? 13 - i : 26 + i, top = 19 + y - Math.round(i * (fl ? 0.5 : 1.1)), bot = 27 + y - Math.round(i * 0.4) - (i % 4 === 3 ? 2 : 0);
      p(x, top, 1, Math.max(1, bot - top), '#2a2a34'); p(x, top, 1, 1, '#6a6a7a'); if (i % 4 === 0) p(x, top, 1, bot - top - 1, '#4a4a5a');
    }
    p(14, 18 + y, 12, 10, '#c81c3c'); p(11, 19 + y, 3, 8, pale); p(26, 19 + y, 3, 8, pale); p(11, 27 + y, 1, 2, '#c8c0c8'); p(28, 27 + y, 1, 2, '#c8c0c8');
    const sw = Math.floor(t * 4) % 2;
    p(17, 28 + y, 2, 6 + sw, '#c84a6a'); p(20, 28 + y, 2, 8 - sw, '#d86a8a'); p(23, 28 + y, 2, 5 + sw, '#c84a6a');
    p(14, 6 + y, 12, 12, pale); p(13, 4 + y, 14, 4, '#101018'); p(12, 6 + y, 3, 16, '#101018'); p(25, 6 + y, 3, 16, '#101018');
    p(16, 10 + y, 2, 2, '#ff3030'); p(22, 10 + y, 2, 2, '#ff3030'); p(17, 15 + y, 6, 1, '#5a1a1a'); p(18, 15 + y, 1, 2, '#ffffff'); p(21, 15 + y, 1, 2, '#ffffff');
    return c;
  },
  Aswang(t) {
    const c = canvas(), p = painter(c);
    // Monstruo cambiaformas que de día parece una mujer normal y de noche saca una lengua larguísima
    disc(p, 32, 7, 5, '#f4f0c8');
    const b = figure(p, t, { robe: '#1c1c24', robeShade: '#101018', dress: true, skin: '#a87050', hair: '#101018', longHair: true, eyes: '#ff3030' });
    p(16, 14 + b, 2, 2, '#ff6060'); p(22, 14 + b, 2, 2, '#ff6060');
    p(18, 18 + b, 4, 2, '#3a1010');
    for (let i = 0; i < 14; i++) p(21 + i * 1.2, 19 + b + i * 1.8 + Math.round(Math.sin(i * 0.8 + t * 4)), 2, 2, '#c84a6a');
    p(36, 44, 1, 2, '#c84a6a'); p(38, 44, 1, 2, '#c84a6a');
    p(10, 34 + b, 3, 2, '#a87050'); p(9, 35 + b, 1, 2, '#e8e0d0'); p(27, 34 + b, 3, 2, '#a87050'); p(30, 35 + b, 1, 2, '#e8e0d0');
    return c;
  },
  Kinnara(t) {
    const c = canvas(), p = painter(c);
    // Mitad hombre, mitad pájaro: músico celestial que vive en los bosques del Himalaya
    const b = bird(p, t, { col: '#e8c040', wing: '#d8a030', wing2: '#fff07a', belly: '#fff8b0', tail: '#d8a030', leg: '#c89020', noHead: true });
    birdHead(p, b, { hair: '#101018', short: true, crown: '#ffd84a', skin: '#d8a070' });
    p(26, 21 + b, 8, 2, '#e8c040'); p(29, 21 + b, 2, 2, '#ff3030');
    const n = (t * 6) % 12;
    p(4, 14 - n, 2, 2, '#f4f4f8'); p(5, 10 - n, 1, 4, '#f4f4f8'); p(8, 20 - ((n + 6) % 12), 2, 2, '#f4f4f8'); p(9, 16 - ((n + 6) % 12), 1, 4, '#f4f4f8');
    return c;
  },
  Gandharva(t) {
    const c = canvas(), p = painter(c);
    // Músico celestial de la corte de Indra, con su laúd y patas de ave
    const b = figure(p, t, { robe: '#c8885c', robeShade: '#a8683c', skin: '#c8885c', legs: '#d8a030', shoe: '#c89020', hair: '#101018', eyes: '#3a2a1a' });
    p(13, 32 + b, 14, 9, '#d83030'); p(13, 32 + b, 14, 2, '#e8c040'); p(16, 36 + b, 2, 5, '#a82020');
    for (let i = 0; i < 3; i++) { p(15, 41 + i * 2, 4, 1, '#a87a20'); p(21, 41 + i * 2, 4, 1, '#a87a20'); }
    p(12, 46, 4, 1, '#c89020'); p(18, 46, 2, 1, '#c89020'); p(20, 46, 4, 1, '#c89020'); p(26, 46, 2, 1, '#c89020');
    p(15, 5 + b, 10, 4, '#e8c040'); p(17, 3 + b, 2, 2, '#e8c040'); p(21, 2 + b, 2, 3, '#e8c040'); p(19, 6 + b, 2, 2, '#ff3030'); p(15, 25 + b, 10, 1, '#e8c040');
    neck(p, 8, 36 + b, 31, 14 + b, '#8a5a30', 8, 2); disc(p, 8, 37 + b, 3, '#c87a30'); disc(p, 31, 14 + b, 3, '#c87a30');
    const n = (t * 6) % 12; p(34, 30 - n, 2, 2, '#f4f4f8'); p(35, 26 - n, 1, 4, '#f4f4f8'); p(4, 24 - ((n + 6) % 12), 2, 2, '#f4f4f8'); p(5, 20 - ((n + 6) % 12), 1, 4, '#f4f4f8');
    return c;
  },
  Apsara(t) {
    const c = canvas(), p = painter(c);
    // Bailarina celestial que danza para los dioses flotando entre nubes
    for (let i = 0; i < 9; i++) p(2 + i * 4, 21 + Math.round(Math.sin(i * 0.8 + t * 3) * 3), 4, 2, '#78d0f0');
    const b = figure(p, t, { robe: '#f088b0', robeShade: '#d06890', dress: true, hair: '#101018', eyes: '#3a2a1a', skin: '#e8b890', armR: 'up', belt: '#e8c040' });
    p(15, 6 + b, 10, 3, '#e8c040'); p(19, 4 + b, 2, 2, '#ff3030'); p(15, 24 + b, 10, 1, '#e8c040');
    p(27, 9 + b, 5, 4, '#ff9cc0'); p(28, 8 + b, 3, 1, '#ffffff'); p(29, 13 + b, 1, 2, '#3c8c3c');
    p(4, 41, 32, 7, '#f4f4f8'); p(8, 38, 24, 4, '#f4f4f8'); p(2, 44, 6, 3, '#f4f4f8'); p(6, 46, 28, 1, '#d8e0f0');
    return c;
  },
  Engkanto(t) {
    const c = canvas(), p = painter(c);
    // Ser encantado de piel clara y pelo dorado que vive en los árboles balete y seduce a los humanos
    p(31, 0, 9, 48, '#6a5a3a'); for (let i = 0; i < 4; i++) p(30 + i * 2, 0, 1, 48, '#5a4a2a'); p(28, 30, 3, 18, '#6a5a3a');
    const b = figure(p, t, { robe: '#f4f4f8', robeShade: '#d8d8e8', skin: '#f4e8e0', hair: '#e8c040', longHair: true, eyes: '#5ce0a0', legs: '#f4f4f8', shoe: '#d8d8e8', belt: '#e8c040' });
    p(10, 12 + b, 2, 3, '#f4e8e0'); p(9, 11 + b, 1, 2, '#f4e8e0'); p(28, 12 + b, 2, 3, '#f4e8e0'); p(30, 11 + b, 1, 2, '#f4e8e0');
    for (let k = 0; k < 4; k++) twinkle(p, t + k, [4, 8, 26, 3][k], [10, 30, 4, 42][k], '#fff8b0');
    return c;
  },
  Makara(t) {
    const c = canvas(), p = painter(c);
    // Bestia marina con cuerpo de pez, trompa de elefante y fauces de cocodrilo: montura de la diosa Ganga
    p(0, 42, 40, 6, '#2c6cb8'); for (let i = 0; i < 4; i++) p((t * 4 + i * 10) % 40, 42, 4, 1, '#a8e0ff');
    const y = fish(p, t, { col: '#3cac8c', fin: '#e8c040', belly: '#e8c040' });
    for (let i = 0; i < 4; i++) p(14 + i * 4, y - 2 + (i % 2) * 3, 2, 2, '#e8c040');
    p(32, y + 3, 7, 3, '#3cac8c'); for (let i = 0; i < 3; i++) p(33 + i * 2, y + 3, 1, 1, '#ffffff');
    const w = Math.floor(t * 3) % 2;
    p(34, y - 3, 3, 3, '#3cac8c'); p(36, y - 7, 3, 5, '#3cac8c'); p(35 - w, y - 9, 3, 2, '#3cac8c');
    p(32, y + 6, 4, 1, '#f4f4e8');
    return c;
  },
  Naga(t) {
    const c = canvas(), p = painter(c);
    // Ser serpiente de torso humano, guardián de tesoros bajo las aguas, coronado por cobras
    for (let i = 0; i < 5; i++) { const x = 6 + i * 6, y = 2 + Math.abs(i - 2) * 2; p(x + 1, y + 6, 3, 8, '#3cac7c'); p(x, y, 5, 6, '#3cac7c'); p(x + 1, y + 2, 1, 1, '#ffd84a'); p(x + 3, y + 2, 1, 1, '#ffd84a'); p(x + 1, y + 4, 3, 1, '#e8d070'); }
    const b = figure(p, t, { robe: '#c8885c', robeShade: '#a8683c', skin: '#c8885c', hair: '#101018', eyes: '#ffd84a' });
    p(12, 34, 16, 10, '#3cac7c'); for (let i = 0; i < 4; i++) p(15, 35 + i * 2, 10, 1, '#e8d070');
    p(4, 40, 32, 6, '#3cac7c'); p(5, 44, 30, 2, '#2c8c5c'); const sw = Math.floor(t * 3) % 2; p(34, 36 + sw, 4, 4, '#3cac7c'); p(37, 34 + sw, 2, 3, '#3cac7c');
    p(14, 25 + b, 12, 2, '#e8c040'); p(19, 27 + b, 2, 2, '#ff3030'); p(10, 28 + b, 3, 1, '#e8c040'); p(27, 28 + b, 3, 1, '#e8c040');
    p(15, 6 + b, 10, 3, '#e8c040'); p(16, 4 + b, 2, 2, '#e8c040'); p(19, 3 + b, 2, 3, '#e8c040'); p(22, 4 + b, 2, 2, '#e8c040');
    return c;
  },
  Vasuki(t) {
    const c = canvas(), p = painter(c);
    // Rey de las serpientes con capucha de cobra: sirvió de cuerda para batir el océano de leche
    p(0, 44, 40, 4, '#f4f4f0'); p(4, 43, 8, 1, '#ffffff');
    for (let yy = 0; yy < 18; yy++) { const w = Math.round(8 * Math.sin(Math.PI * (yy + 2) / 22)); p(32 - w, 7 + yy, w * 2, 1, yy % 4 === 0 ? '#1c2c6c' : '#2a3c7c'); }
    p(25, 17, 3, 3, '#e8c040'); p(36, 17, 3, 3, '#e8c040'); p(26, 18, 1, 1, DARK); p(37, 18, 1, 1, DARK);
    serpent(p, t, { col: '#2a3c7c', shade: '#1c2c6c', belly: '#e8c040', eye: '#ff3030' });
    p(28, 8, 10, 4, '#e8c040'); p(29, 6, 2, 2, '#e8c040'); p(32, 5, 2, 3, '#e8c040'); p(35, 6, 2, 2, '#e8c040'); p(32, 9, 2, 2, '#ff3030');
    return c;
  },
  Yaksha(t) {
    const c = canvas(), p = painter(c);
    // Guardián gigante de piel verde, colmillos y ojos saltones que protege los templos y los tesoros
    const b = giant(p, t, { skin: '#3cac7c', shade: '#2c8c5c', robe: '#d83030', belt: '#e8c040', eyes: DARK });
    p(15, 9 + b, 4, 4, '#f4f4f8'); p(21, 9 + b, 4, 4, '#f4f4f8'); p(16, 10 + b, 2, 2, DARK); p(22, 10 + b, 2, 2, DARK);
    p(17, 15 + b, 6, 2, '#5a1a1a'); p(17, 13 + b, 1, 3, '#ffffff'); p(22, 13 + b, 1, 3, '#ffffff');
    p(16, 0 + b, 8, 2, '#e8c040'); p(14, 2 + b, 12, 4, '#e8c040'); p(19, 3 + b, 2, 2, '#ff3030');
    p(12, 19 + b, 16, 3, '#e8c040'); p(15, 20 + b, 2, 1, '#ff3030'); p(23, 20 + b, 2, 1, '#ff3030');
    p(33, 18 + b, 2, 22, '#8a5a30'); p(31, 10 + b, 6, 9, '#e8c040'); p(31, 13 + b, 6, 1, '#c89020'); p(31, 16 + b, 6, 1, '#c89020');
    return c;
  },
  Vanara(t) {
    const c = canvas(), p = painter(c);
    // Guerrero mono del ejército de Rama, fuerte y saltarín, con su maza dorada
    const sw = Math.floor(t * 3) % 2;
    p(7, 30, 2, 10, '#c8903c'); p(5, 26 - sw, 2, 5, '#c8903c'); p(5, 25 - sw, 3, 2, '#c8903c');
    const b = figure(p, t, { robe: '#c8903c', robeShade: '#a87030', skin: '#c8903c', legs: '#c8903c', shoe: '#a87030', armR: 'up', eyes: '#c8903c' });
    p(13, 32 + b, 14, 8, '#d83030'); p(13, 32 + b, 14, 2, '#e8c040');
    p(16, 13 + b, 8, 7, '#f0c8a0'); p(17, 14 + b, 2, 2, DARK); p(21, 14 + b, 2, 2, DARK); p(17, 18 + b, 6, 2, '#e8b088'); p(19, 18 + b, 2, 1, '#8a4a30');
    p(12, 13 + b, 2, 3, '#f0c8a0'); p(26, 13 + b, 2, 3, '#f0c8a0');
    p(15, 7 + b, 10, 3, '#e8c040'); p(19, 5 + b, 2, 2, '#e8c040');
    p(28, 6 + b, 2, 9, '#c89020'); disc(p, 29, 4 + b, 4, '#e8c040'); p(26, 4 + b, 7, 1, '#c89020'); p(29, 0 + b, 1, 8, '#c89020');
    return c;
  },
  Vetala(t) {
    const c = canvas(), p = painter(c);
    // Espíritu que habita los cadáveres y cuelga cabeza abajo de las ramas en los crematorios
    p(0, 2, 40, 4, '#5a3c20'); p(4, 0, 2, 2, '#5a3c20'); p(32, 6, 3, 3, '#5a3c20'); p(33, 9, 1, 3, '#5a3c20');
    const s = Math.round(Math.sin(t * 2)), sk = '#6a7a8a';
    p(15, 3, 5, 3, sk); p(21, 3, 5, 3, sk); p(16, 6, 4, 10, sk); p(21, 6, 4, 10, sk);
    p(14 + s, 16, 12, 5, '#e8e0d0'); p(14 + s, 20, 12, 12, sk); for (let i = 0; i < 3; i++) p(16 + s, 23 + i * 3, 8, 1, '#4a5a6a');
    const a = Math.floor(t * 3) % 2;
    p(10 + s, 22, 3, 14 + a, sk); p(27 + s, 22, 3, 14 - a, sk); p(10 + s, 36 + a, 1, 2, '#e8e0d0'); p(29 + s, 36 - a, 1, 2, '#e8e0d0');
    p(14 + s * 2, 32, 12, 11, sk); p(16 + s * 2, 37, 2, 2, '#ff3030'); p(22 + s * 2, 37, 2, 2, '#ff3030');
    p(17 + s * 2, 34, 6, 1, DARK); p(17 + s * 2, 33, 1, 2, '#ffffff'); p(22 + s * 2, 33, 1, 2, '#ffffff');
    p(13 + s * 2, 42, 14, 3, '#f4f4f8'); for (let i = 0; i < 5; i++) p(13 + s * 2 + i * 3, 44, 2, 2 + (i % 2) * 2, '#f4f4f8');
    return c;
  },
  Airavata(t) {
    const c = canvas(), p = painter(c);
    // Elefante blanco del dios Indra, con dos pares de colmillos y gualdrapa de oro
    const b = quad(p, t, { col: '#f4f4f0', shade: '#d8d8d0', belly: '#e8e8e0', head: 'none', hoof: '#c8c8c0', tailc: '#d8d8d0' });
    [7, 12, 22, 27].forEach((x) => { p(x, 32, 5, 12, '#ececea'); p(x, 43, 5, 1, '#c8c8c0'); });
    p(10, 20 + b, 16, 10, '#d83030'); p(10, 20 + b, 16, 1, '#e8c040'); p(10, 29 + b, 16, 2, '#e8c040'); for (let i = 0; i < 6; i++) p(11 + i * 3, 31 + b, 1, 2, '#e8c040');
    p(16, 23 + b, 4, 4, '#e8c040'); p(17, 24 + b, 2, 2, '#ff3030');
    p(24, 10 + b, 12, 14, '#f4f4f0'); p(21, 11 + b, 6, 10, '#e8e8e0'); p(30, 14 + b, 2, 2, DARK);
    p(26, 8 + b, 8, 4, '#e8c040'); p(29, 9 + b, 2, 2, '#ff3030');
    const w = Math.floor(t * 3) % 2;
    p(34, 18 + b, 4, 4, '#f4f4f0'); p(36, 13 + b - w, 4, 6, '#f4f4f0'); p(37, 9 + b - w, 3, 5, '#f4f4f0');
    p(32, 22 + b, 6, 2, '#fff8e0'); p(33, 25 + b, 5, 2, '#fff8e0');
    return c;
  },
  Barong(t) {
    const c = canvas(), p = painter(c);
    // León protector de Bali, de melena blanca y máscara dorada, que lucha contra la bruja Rangda
    p(2, 12, 3, 10, '#e8c040'); p(1, 10, 4, 3, '#d83030');
    const b = quad(p, t, { col: '#d83030', shade: '#b82020', belly: '#e8c040', head: 'none', hoof: '#e8c040', tail: false });
    for (let i = 0; i < 8; i++) p(7 + i * 3, 30 + b, 2, 6 + (i % 2) * 2, '#f4f4f8');
    p(8, 20 + b, 22, 2, '#e8c040'); for (let i = 0; i < 4; i++) p(10 + i * 5, 23 + b, 2, 2, '#a8e0ff');
    p(21, 4 + b, 5, 24, '#f4f4f8'); p(23, 3 + b, 13, 4, '#f4f4f8');
    p(24, 8 + b, 14, 15, '#e8c040'); p(26, 4 + b, 10, 4, '#e8c040'); p(28, 5 + b, 2, 2, '#ff3030'); p(32, 5 + b, 2, 2, '#ff3030');
    p(26, 11 + b, 4, 4, '#f4f4f8'); p(27, 12 + b, 2, 2, DARK); p(32, 11 + b, 4, 4, '#f4f4f8'); p(33, 12 + b, 2, 2, DARK);
    p(26, 16 + b, 11, 5, '#d83030'); p(27, 19 + b, 9, 2, '#f4f4f8'); p(27, 18 + b, 1, 3, '#ffffff'); p(35, 18 + b, 1, 3, '#ffffff');
    const jw = Math.floor(t * 4) % 2; p(26, 22 + b + jw, 11, 2, '#e8c040');
    return c;
  },
  Timingila(t) {
    const c = canvas(), p = painter(c);
    // Pez gigantesco del océano que se traga ballenas enteras
    const jaw = Math.floor(t * 2) % 2 * 2, w = Math.round(Math.sin(t * 2));
    p(0, 4, 4, 10, '#2c8c8c'); p(0, 28, 4, 10, '#2c8c8c');
    p(3, 10 + w, 28, 26, '#2c9c9c'); p(6, 7 + w, 20, 3, '#2c9c9c'); p(10, 3 + w, 8, 5, '#2c8c8c');
    p(4, 30 + w, 26, 6, '#e8d8a8'); for (let i = 0; i < 4; i++) p(7 + i * 6, 30 + w, 1, 6, '#c8b888');
    p(28, 8 + w, 12, 8, '#2c9c9c'); p(28, 28 + w + jaw, 12, 6, '#2c9c9c');
    p(30, 16 + w, 10, 12 + jaw, '#3a1a2a'); for (let i = 0; i < 5; i++) { p(30 + i * 2, 16 + w, 1, 2, '#ffffff'); p(30 + i * 2, 26 + w + jaw, 1, 2, '#ffffff'); }
    p(23, 13 + w, 3, 3, '#f4f4f8'); p(24, 14 + w, 2, 2, DARK);
    const k = (t * 3) % 4; p(34 + k, 19 + w, 6, 5, '#5a7aa8'); p(38 + k, 18 + w, 2, 2, '#5a7aa8');
    bubble(p, t, 8, 46); bubble(p, t, 20, 44, 3);
    return c;
  },
  Tikbalang(t) {
    const c = canvas(), p = painter(c);
    // Gigante con cabeza de caballo y piernas larguísimas que extravía a los viajeros en el bosque
    const b = giant(p, t, { skin: '#8a5a40', shade: '#6a4a30', legs: '#8a5a40', shoe: '#3a2a1a', robe: '#3a2a20', belt: '#5a3c20' });
    p(13, 2 + b, 12, 12, '#2a2a3a'); p(14, 12 + b, 10, 9, '#2a2a3a'); p(15, 19 + b, 8, 2, '#3a3a4a');
    p(16, 19 + b, 2, 1, DARK); p(21, 19 + b, 2, 1, DARK);
    p(14, 7 + b, 2, 2, '#ff7a20'); p(22, 7 + b, 2, 2, '#ff7a20');
    p(13, 0 + b, 3, 3, '#2a2a3a'); p(22, 0 + b, 3, 3, '#2a2a3a');
    for (let i = 0; i < 6; i++) p(25 - (i % 2), 2 + b + i * 3, 3, 3, '#e8c040');
    for (let i = 0; i < 4; i++) p(12 + i * 4, 24 + b + (i % 2) * 4, 2, 4, '#6a4a30');
    return c;
  },
  Kapre(t) {
    const c = canvas(), p = painter(c);
    // Gigante peludo que vive en los árboles grandes fumando un puro enorme
    p(0, 0, 9, 48, '#5a4a2a'); p(31, 0, 9, 48, '#5a4a2a'); p(0, 0, 40, 4, '#2c5c2c'); p(4, 3, 8, 2, '#3c7c3c'); p(28, 3, 8, 2, '#3c7c3c');
    const b = giant(p, t, { skin: '#7a5040', shade: '#5a3a2a', robe: '#6a4a28', belt: '#3a2a1a', hair: '#101018', wild: true, beard: '#101018', eyes: '#ffd84a' });
    for (let i = 0; i < 4; i++) p(12 + i * 4, 22 + b + (i % 2) * 4, 2, 4, '#5a3a2a');
    p(22, 16 + b, 8, 2, '#8a5a30'); p(30, 16 + b, 1, 2, Math.floor(t * 4) % 2 ? '#ff7a20' : '#ffd84a');
    for (let k = 0; k < 3; k++) { const q = (t * 8 + k * 5) % 15; p(30 + Math.round(Math.sin(t * 3 + k)), 13 - q, 2, 2, '#c8c8d0'); }
    return c;
  },
  Ucchaisrava(t) {
    const c = canvas(), p = painter(c);
    // Caballo blanco de siete cabezas nacido del batido del océano de leche; vuela con alas blancas
    p(0, 45, 40, 3, '#f4f4f0');
    const bb = bob(t);
    for (const [dx, dy] of [[-8, -2], [-4, -7]]) {
      p(25 + dx, 12 + dy + bb, 7, 12, '#e0e0d8'); p(28 + dx, 8 + dy + bb, 9, 8, '#e0e0d8'); p(34 + dx, 12 + dy + bb, 5, 5, '#e0e0d8');
      p(28 + dx, 5 + dy + bb, 2, 4, '#e0e0d8'); p(31 + dx, 10 + dy + bb, 2, 2, DARK); p(24 + dx, 8 + dy + bb, 3, 10, '#e8c040');
    }
    const b = quad(p, t, { col: '#f4f4f0', shade: '#d8d8d0', belly: '#e8e8e0', head: 'horse', mane: '#e8c040', tailc: '#e8c040', hoof: '#c8a030' });
    sideWing(p, 16, 22 + b, '#f4f4f8', '#c8d8e8', Math.floor(t * 3) % 2, -1, 7);
    return c;
  },
  Jatayu(t) {
    const c = canvas(), p = painter(c);
    // Rey de los buitres que murió luchando contra Ravana para salvar a Sita
    p(0, 44, 40, 4, '#8a7a6a'); p(4, 42, 8, 2, '#9a8a7a');
    const b = bird(p, t, { col: '#8a5a30', wing: '#c8903c', wing2: '#e8c070', belly: '#e8d8b0', tail: '#6a4a28', beak: '#e8c040', eye: '#ffd84a', leg: '#e8c040' });
    p(22, 18 + b, 8, 3, '#f4f4f0'); p(38, 15 + b, 2, 3, '#e8c040');
    p(26, 4 + b, 8, 4, '#e8c040'); p(27, 2 + b, 2, 2, '#e8c040'); p(30, 1 + b, 2, 3, '#e8c040'); p(33, 2 + b, 2, 2, '#e8c040'); p(30, 5 + b, 2, 2, '#ff3030');
    return c;
  },
  Sampati(t) {
    const c = canvas(), p = painter(c);
    // Hermano de Jatayu: voló tan cerca del sol para protegerlo que se le quemaron las alas
    disc(p, 7, 7, 6, '#ffd84a'); disc(p, 7, 7, 4, '#fff07a');
    const b = bird(p, t, { col: '#c83020', wing: '#ff7a20', wing2: '#3a2a2a', belly: '#ffb040', tail: '#a82018', beak: '#e8c040', eye: DARK, leg: '#e8c040' });
    flame(p, t, 12, 19 + b, 1); flame(p, t, 18, 18 + b, 2); flame(p, t, 6, 22 + b, 3);
    for (let k = 0; k < 3; k++) { ember(p, t, 10 + k * 6, 20, k); const q = (t * 6 + k * 4) % 12; p(14 + k * 4, 14 - q, 2, 2, '#6a6a7a'); }
    p(26, 4 + b, 8, 3, '#e8c040'); p(30, 2 + b, 2, 2, '#e8c040');
    return c;
  },
  Gandaberunda(t) {
    const c = canvas(), p = painter(c);
    // Ave de dos cabezas tan poderosa que lleva elefantes en las garras
    const b = bob(t), flap = Math.floor(t * 3) % 2;
    wings(p, 12 + b, '#d83030', '#e8c040', flap, 12);
    p(14, 16 + b, 12, 18, '#e8c040'); for (let i = 0; i < 4; i++) p(16 + (i % 2) * 4, 20 + b + i * 3, 4, 1, '#c89020');
    p(13, 34, 14, 5, '#d83030'); p(15, 34, 2, 5, '#e8c040'); p(23, 34, 2, 5, '#e8c040');
    p(12, 10 + b, 5, 8, '#e8c040'); p(23, 10 + b, 5, 8, '#e8c040');
    p(8, 4 + b, 8, 7, '#e8c040'); p(4, 7 + b, 4, 3, '#d8a030'); p(4, 10 + b, 2, 1, '#d8a030'); p(10, 6 + b, 2, 2, DARK); p(9, 2 + b, 4, 2, '#d83030');
    p(24, 4 + b, 8, 7, '#e8c040'); p(32, 7 + b, 4, 3, '#d8a030'); p(34, 10 + b, 2, 1, '#d8a030'); p(28, 6 + b, 2, 2, DARK); p(27, 2 + b, 4, 2, '#d83030');
    p(15, 38, 2, 4, '#d8a030'); p(23, 38, 2, 4, '#d8a030');
    const sw = Math.round(Math.sin(t * 3));
    p(8 + sw, 41, 9, 6, '#8a8a9a'); p(7 + sw, 42, 2, 4, '#8a8a9a'); p(9 + sw, 43, 1, 1, DARK); p(6 + sw, 45, 1, 2, '#f4f4e8');
    p(23 - sw, 41, 9, 6, '#8a8a9a'); p(31 - sw, 42, 2, 4, '#8a8a9a'); p(30 - sw, 43, 1, 1, DARK); p(33 - sw, 45, 1, 2, '#f4f4e8');
    return c;
  },
  Rakshasa(t) {
    const c = canvas(), p = painter(c);
    // Demonio devorador de hombres de piel púrpura, colmillos y armadura de oro: el pueblo de Ravana
    const b = giant(p, t, { skin: '#7c3cb0', shade: '#5c2c90', armor: '#e8c040', armorShade: '#c89820', robe: '#d83030', belt: '#e8c040', hair: '#101018', wild: true, eyes: '#ff3030', legs: '#7c3cb0', shoe: '#c89820' });
    p(13, 23 + b, 14, 1, '#c89820'); p(13, 28 + b, 14, 1, '#c89820'); p(19, 25 + b, 2, 2, '#ff3030');
    p(13, 2 + b, 2, 3, '#f4ecd0'); p(25, 2 + b, 2, 3, '#f4ecd0');
    p(15, 3 + b, 10, 3, '#e8c040'); p(17, 1 + b, 2, 2, '#e8c040'); p(21, 1 + b, 2, 2, '#e8c040');
    p(17, 16 + b, 6, 1, '#5a1a1a'); p(17, 15 + b, 1, 3, '#ffffff'); p(22, 15 + b, 1, 3, '#ffffff');
    p(33, 8 + b, 3, 25, '#d8e0e8'); p(34, 8 + b, 1, 25, '#ffffff'); p(33, 6 + b, 2, 2, '#d8e0e8');
    p(31, 32 + b, 7, 2, '#e8c040'); p(33, 34 + b, 3, 4, '#8a5a30');
    return c;
  },

  // ---------- Oriente Medio ----------
  Girtablilu(t) {
    const c = canvas(), p = painter(c);
    // Hombre-escorpión que guarda las puertas por donde sale el sol, con arco y casco de cuernos
    scorpTail(p, t, 29, 36, '#c87a40', '#e8d070', 1, 3);
    const b = figure(p, t, { robe: '#c8885c', robeShade: '#a8683c', skin: '#c8885c', hair: '#101018', beard: '#101018', eyes: '#3a2a1a' });
    p(13, 6 + b, 14, 6, '#5a4a3a'); p(10, 4 + b, 3, 4, '#e8d8b0'); p(27, 4 + b, 3, 4, '#e8d8b0'); p(19, 4 + b, 2, 2, '#e8c040');
    p(11, 35, 18, 8, '#c87a40'); p(11, 35, 18, 2, '#a85a28'); for (let i = 0; i < 4; i++) p(12 + i * 4, 37, 1, 6, '#a85a28');
    const w = Math.floor(t * 3) % 2;
    for (let i = 0; i < 3; i++) { p(8 - i, 40 + i * 2 + (w + i) % 2, 4, 1, '#c87a40'); p(28 + i, 40 + i * 2 + (w + i + 1) % 2, 4, 1, '#c87a40'); }
    p(6, 12 + b, 2, 24, '#8a5a30'); p(7, 11 + b, 2, 2, '#8a5a30'); p(7, 35 + b, 2, 2, '#8a5a30'); p(9, 13 + b, 1, 22, '#e8e0c8');
    return c;
  },
  Karkadann(t) {
    const c = canvas(), p = painter(c);
    // Bestia de las estepas persas, más fiera que un rinoceronte, con un enorme cuerno negro
    p(0, 45, 40, 3, '#c8a868');
    const b = quad(p, t, { col: '#c8a070', shade: '#a88050', belly: '#d8b888', head: 'none', hoof: '#5a4a30', tailc: '#5a4a30' });
    [7, 12, 22, 27].forEach((x) => p(x, 32, 5, 12, '#b89060'));
    p(6, 18 + b, 24, 3, '#d8b888'); for (let i = 0; i < 4; i++) p(10 + i * 5, 23 + b, 1, 6, '#a88050');
    p(23, 13 + b, 12, 12, '#c8a070'); p(33, 17 + b, 6, 7, '#c8a070'); p(38, 21 + b, 1, 2, DARK);
    p(24, 11 + b, 3, 3, '#a88050'); p(29, 16 + b, 2, 2, DARK); p(34, 23 + b, 5, 1, '#8a6a40');
    p(35, 15 + b, 4, 2, '#2a2a2a'); p(36, 7 + b, 2, 8, '#2a2a2a'); p(37, 4 + b, 1, 4, '#3a3a3a');
    return c;
  },
  Peri(t) {
    const c = canvas(), p = painter(c);
    // Hada persa de alas de libélula, hija del fuego y de la luz, que se alimenta de perfumes
    const fl = Math.floor(t * 6) % 2;
    for (const d of [-1, 1]) {
      const x = d < 0 ? 3 + fl : 28 - fl;
      p(x, 9, 9, 11, '#c8a8f0'); p(x + 1, 8, 7, 1, '#c8a8f0'); p(x + 1, 11, 7, 1, '#8c4cc8'); p(x + 4, 9, 1, 11, '#8c4cc8');
      p(x + 1, 21, 7, 8, '#b898e0'); p(x + 3, 21, 1, 8, '#8c4cc8');
    }
    const b = figure(p, t, { robe: '#b8a0e8', robeShade: '#9880d0', dress: true, hair: '#101018', longHair: true, eyes: '#8c4cc8', belt: '#e8c040' });
    p(15, 7 + b, 10, 2, '#e8c040'); p(19, 5 + b, 2, 2, '#e8c040'); p(19, 6 + b, 2, 1, '#78e0ff');
    for (let k = 0; k < 3; k++) twinkle(p, t + k, [6, 34, 20][k], [36, 38, 2][k], '#fff8b0');
    return c;
  },
  Genie(t) {
    const c = canvas(), p = painter(c);
    // Genio azul atado a una lámpara: concede deseos a quien la frota
    p(2, 40, 12, 5, '#e8c040'); p(12, 41, 5, 2, '#e8c040'); p(0, 39, 4, 2, '#e8c040'); p(5, 38, 6, 2, '#d8a030'); p(4, 45, 8, 2, '#c89020'); p(6, 41, 2, 1, '#fff07a');
    const sw = Math.round(Math.sin(t * 3) * 2);
    for (let i = 0; i < 6; i++) p(9 + i * 2 + (i % 2) * sw, 37 - i * 2, 6 + i, 3, '#5c8cf0');
    const b = figure(p, t, { robe: '#4c7cd8', robeShade: '#3c6cc8', skin: '#4c7cd8', hair: '#101018', beard: '#101018', eyes: '#f4f4f8' });
    c.getContext('2d').clearRect(12, 38, 16, 10);
    p(14, 34 + b, 12, 4, '#5c8cf0'); p(16, 37, 8, 2, '#5c8cf0');
    p(13, 28 + b, 14, 3, '#4c7cd8'); p(12, 28 + b, 2, 3, '#e8c040'); p(26, 28 + b, 2, 3, '#e8c040');
    p(14, 24 + b, 12, 2, '#e8c040'); p(18, 3 + b, 4, 6, '#101018'); p(18, 8 + b, 4, 1, '#e8c040');
    p(13, 15 + b, 1, 2, '#e8c040'); p(26, 15 + b, 1, 2, '#e8c040');
    twinkle(p, t, 34, 10, '#fff8b0'); twinkle(p, t + 2, 6, 20, '#fff8b0');
    return c;
  },
  Huma(t) {
    const c = canvas(), p = painter(c);
    // Ave del paraíso que nunca se posa: si su sombra te toca, serás rey
    const cols = ['#e8c040', '#fff07a', '#d8a030'];
    for (let k = 0; k < 3; k++) for (let i = 0; i < 11; i++) p(9 - i * 0.8 + k * 2 + Math.round(Math.sin(i * 0.6 + t * 3 + k) * 1.5), 28 + i * 1.5, 3, 2, cols[k]);
    const b = bird(p, t, { col: '#e8c040', wing: '#fff07a', wing2: '#ffffff', belly: '#fff8b0', tail: '#d8a030', beak: '#d8a030', eye: DARK });
    c.getContext('2d').clearRect(13, 37 + b + 1, 14, 9);
    p(14, 46, 14, 1, '#3a3a2a');
    p(26, 4 + b, 2, 4, '#ffd84a'); p(29, 3 + b, 2, 5, '#ffd84a'); p(32, 5 + b, 2, 3, '#ffd84a');
    return c;
  },
  Chamrosh(t) {
    const c = canvas(), p = painter(c);
    // Perro con cabeza y alas de águila que recoge las semillas que caen del Árbol de la Vida
    const b = quad(p, t, { col: '#c8a070', shade: '#a88050', belly: '#d8b888', head: 'none', hoof: '#e8c040', tailc: '#a88050' });
    sideWing(p, 18, 22 + b, '#8a5a30', '#c8903c', Math.floor(t * 3) % 2, -1, 7);
    p(25, 14 + b, 7, 10, '#8a5a30'); p(26, 8 + b, 10, 10, '#8a5a30'); p(26, 16 + b, 8, 3, '#f4f4f0');
    p(35, 11 + b, 4, 3, '#e8c040'); p(37, 14 + b, 2, 2, '#e8c040'); p(31, 10 + b, 2, 2, '#ffd84a'); p(32, 10 + b, 1, 1, DARK);
    const s = (t * 6) % 10; p(4, 4 + s, 2, 2, '#8a6a30'); p(12, 8 + ((s + 5) % 10), 2, 2, '#8a6a30');
    return c;
  },
  Mushussu(t) {
    const c = canvas(), p = painter(c);
    // Dragón-serpiente de Babilonia, de escamas azules, garras de león y de águila y cola de escorpión
    p(0, 44, 40, 4, '#2c4cb8'); for (let i = 0; i < 8; i++) p(i * 5 + 1, 45, 3, 2, '#e8c040');
    const b = quad(p, t, { col: '#2c5cc8', shade: '#1c3c98', belly: '#e8c040', head: 'none', tail: false, hoof: '#e8c040' });
    for (let j = 0; j < 2; j++) for (let i = 0; i < 5; i++) p(8 + i * 4 + j * 2, 22 + j * 4 + b, 2, 1, '#78a8f0');
    scorpTail(p, t, 4, 21 + b, '#2c5cc8', '#e8c040', 1, 3);
    neck(p, 25, 22 + b, 29, 11 + b, '#2c5cc8', 5, 5);
    p(27, 7 + b, 12, 6, '#2c5cc8'); p(36, 9 + b, 4, 3, '#2c5cc8'); p(31, 8 + b, 2, 2, '#ffd84a');
    p(28, 2 + b, 2, 6, '#e8c040'); p(30, 1 + b, 2, 2, '#e8c040'); p(32, 3 + b, 2, 5, '#e8c040');
    if (Math.floor(t * 3) % 3 === 0) { p(39, 11 + b, 1, 3, '#e83030'); }
    return c;
  },
  Vishap(t) {
    const c = canvas(), p = painter(c);
    // Dragón-serpiente armenio de las montañas y las aguas, al que se dedican estelas de piedra
    p(1, 14, 8, 30, '#8a8a7a'); p(2, 12, 6, 2, '#8a8a7a'); p(3, 18, 4, 3, '#6a6a5a'); p(3, 24, 4, 1, '#6a6a5a'); p(4, 28, 2, 8, '#6a6a5a');
    serpent(p, t, { col: '#2c9c9c', shade: '#1c7c7c', belly: '#8a9aa8', eye: '#ffd84a' });
    p(28, 8, 2, 5, '#e8d8b0'); p(27, 7, 2, 2, '#e8d8b0'); p(32, 8, 2, 5, '#e8d8b0'); p(33, 6, 2, 2, '#e8d8b0');
    for (let i = 0; i < 4; i++) p(29, 21 + i * 4, 3, 1, '#1c7c7c');
    return c;
  },
  Ugallu(t) {
    const c = canvas(), p = painter(c);
    // Demonio-león babilonio con patas de ave y puñal: protege las casas de los malos espíritus
    const b = figure(p, t, { robe: '#c8903c', robeShade: '#a87030', skin: '#c8903c', legs: '#d8a030', shoe: '#c89020', armR: 'up' });
    p(13, 32 + b, 14, 9, '#d8c8a0'); p(13, 32 + b, 14, 2, '#8a5a30'); for (let i = 0; i < 4; i++) p(14 + i * 3, 38 + b, 1, 3, '#a89870');
    animalHead(p, b, 'lion', '#a86a28');
    for (let i = 0; i < 3; i++) { p(15, 41 + i * 2, 4, 1, '#a87a20'); p(21, 41 + i * 2, 4, 1, '#a87a20'); }
    p(28, 5 + b, 2, 8, '#d8e0e8'); p(27, 12 + b, 4, 1, '#e8c040'); p(28, 13 + b, 2, 2, '#8a5a30');
    p(8, 28 + b, 3, 8, '#8a6a40'); p(7, 26 + b, 5, 3, '#6a6a7a');
    return c;
  },
  Anzu(t) {
    const c = canvas(), p = painter(c);
    // Águila de cabeza de león que robó la Tablilla de los Destinos a los dioses
    const b = bob(t), flap = Math.floor(t * 3) % 2;
    wings(p, 11 + b, '#1c2c6c', '#2c5cc8', flap, 12);
    p(14, 18 + b, 12, 18, '#2c5cc8'); for (let i = 0; i < 4; i++) p(16 + (i % 2) * 4, 21 + b + i * 3, 4, 1, '#1c3c98');
    p(13, 36, 14, 5, '#1c2c6c'); p(15, 38, 2, 6, '#e8c040'); p(23, 38, 2, 6, '#e8c040'); p(13, 44, 6, 1, '#e8c040'); p(21, 44, 6, 1, '#e8c040');
    p(12, 4 + b, 16, 16, '#c8903c'); p(15, 7 + b, 10, 10, '#e8b860'); p(16, 9 + b, 2, 2, '#ffd84a'); p(22, 9 + b, 2, 2, '#ffd84a');
    p(19, 13 + b, 2, 2, '#5a3020'); p(17, 16 + b, 6, 1, '#5a3020'); p(18, 16 + b, 1, 2, '#ffffff'); p(21, 16 + b, 1, 2, '#ffffff');
    p(17, 26 + b, 6, 8, '#c8a868'); p(18, 28 + b, 4, 1, '#8a6a40'); p(18, 30 + b, 4, 1, '#8a6a40'); twinkle(p, t, 20, 25 + b, '#fff8b0');
    return c;
  },
  Manticore(t) {
    const c = canvas(), p = painter(c);
    // Cuerpo de león rojo, cara humana con tres filas de dientes y cola de escorpión que lanza púas
    const b = quad(p, t, { col: '#c83c30', shade: '#a82c20', belly: '#e86a50', head: 'none', tail: false, hoof: '#a82c20' });
    scorpTail(p, t, 5, 20 + b, '#a82c20', '#2a2a2a', 1, 3);
    const f = (t * 10) % 12; p(16 + f, 2, 3, 1, '#2a2a2a');
    p(22, 7 + b, 15, 19, '#c8903c'); for (let i = 0; i < 4; i++) p(21 + (i % 2), 9 + b + i * 4, 2, 3, '#a87030');
    p(26, 10 + b, 10, 11, '#e8b890'); p(25, 9 + b, 12, 3, '#101018');
    p(28, 13 + b, 2, 2, '#3a2a1a'); p(33, 13 + b, 2, 2, '#3a2a1a');
    p(28, 17 + b, 7, 3, '#5a1a1a'); for (let i = 0; i < 4; i++) { p(28 + i * 2, 17 + b, 1, 1, '#ffffff'); p(29 + i * 2, 18 + b, 1, 1, '#ffffff'); p(28 + i * 2, 19 + b, 1, 1, '#ffffff'); }
    return c;
  },
  Tepegoz(t) {
    const c = canvas(), p = painter(c);
    // Cíclope de las leyendas turcas con un ojo en la coronilla, que devoraba ovejas y hombres
    p(0, 45, 40, 3, '#7a8a4a');
    const b = giant(p, t, { skin: '#c89070', shade: '#a87050', armor: '#8a5a30', armorShade: '#6a4a28', hair: '#101018', wild: true, oneEye: true, legs: '#c89070', shoe: '#5a3c20' });
    for (let i = 0; i < 5; i++) p(10 + i * 4, 38 - b, 3, 2, '#6a4a28');
    p(17, 16 + b, 6, 2, '#5a1a1a'); p(18, 16 + b, 1, 2, '#ffffff'); p(21, 16 + b, 1, 2, '#ffffff');
    const sw = Math.floor(t * 3) % 2;
    p(32, 38 + sw, 8, 6, '#f4f4f0'); p(31, 37 + sw, 4, 4, '#3a3a3a'); p(32, 38 + sw, 1, 1, '#f4f4f8'); p(33, 44, 2, 2, '#3a3a3a'); p(37, 44, 2, 2, '#3a3a3a');
    return c;
  },
  Ghoul(t) {
    const c = canvas(), p = painter(c);
    // Demonio del desierto que ronda los cementerios y adopta la forma del último que devoró
    p(0, 45, 40, 3, '#c8a868'); p(1, 36, 6, 9, '#8a8a7a'); p(2, 34, 4, 2, '#8a8a7a'); p(33, 38, 6, 7, '#8a8a7a'); p(34, 36, 4, 2, '#8a8a7a');
    const b = figure(p, t, { robe: '#7a7a74', robeShade: '#5a5a54', skin: '#8a9a8a', legs: '#8a9a8a', shoe: '#6a7a6a', hair: '#101018', longHair: true, eyes: '#ffd84a' });
    for (let i = 0; i < 4; i++) p(13 + i * 4, 40 + (i % 2), 3, 2, '#7a7a74');
    for (let i = 0; i < 4; i++) p(12 + i * 4, 6 + b + (i % 2), 3, 4, '#101018');
    p(18, 18 + b, 4, 2, '#3a1a1a'); p(18, 18 + b, 1, 2, '#ffffff'); p(21, 18 + b, 1, 2, '#ffffff');
    const cl = Math.floor(t * 3) % 2; p(9, 35 + b + cl, 1, 3, '#e8e0c8'); p(11, 35 + b + cl, 1, 3, '#e8e0c8'); p(28, 35 + b - cl, 1, 3, '#e8e0c8'); p(30, 35 + b - cl, 1, 3, '#e8e0c8');
    return c;
  },
  Div(t) {
    const c = canvas(), p = painter(c);
    // Demonio gigante persa de piel oscura con manchas, cuernos larguísimos y colmillos
    const b = giant(p, t, { skin: '#3a3c6c', shade: '#2a2c5c', robe: '#c83030', belt: '#e8c040', hair: '#101018', eyes: '#ff3030', legs: '#3a3c6c', shoe: '#2a2c5c', armR: 'up' });
    for (const [x, y] of [[12, 24], [22, 27], [16, 31], [6, 26], [32, 14]]) p(x, y + b, 2, 2, '#5a5c8c');
    p(12, 1 + b, 3, 6, '#e8d8b0'); p(10, -1 + b, 3, 4, '#e8d8b0'); p(25, 1 + b, 3, 6, '#e8d8b0'); p(27, -1 + b, 3, 4, '#e8d8b0');
    p(17, 16 + b, 6, 2, '#5a1a1a'); p(17, 15 + b, 1, 3, '#ffffff'); p(22, 15 + b, 1, 3, '#ffffff');
    p(30, 0 + b, 8, 6, '#6a6a7a'); p(31, 1 + b, 3, 2, '#8a8a9a');
    return c;
  },
  Shahmaran(t) {
    const c = canvas(), p = painter(c);
    // Reina de las serpientes, mitad mujer y mitad serpiente, sabia guardiana de los secretos de la medicina
    const b = figure(p, t, { robe: '#a82838', robeShade: '#882030', skin: '#e8c0a0', hair: '#101018', longHair: true, eyes: '#3c9c5c' });
    p(10, 34, 20, 10, '#d8a830'); for (let i = 0; i < 5; i++) p(11 + i * 4, 36 + (i % 2) * 3, 2, 2, '#3a2a1a');
    p(2, 40, 36, 6, '#d8a830'); p(3, 44, 34, 2, '#b88820'); for (let i = 0; i < 8; i++) p(4 + i * 4, 41, 2, 1, '#3a2a1a');
    const sw = Math.floor(t * 3) % 2;
    snakeHead(p, t, 33, 32 + sw, '#d8a830', '#f4e8a0', '#ff3030', 1); snakeHead(p, t, 0, 32 - sw, '#d8a830', '#f4e8a0', '#ff3030', 1, 1);
    p(15, 5 + b, 10, 4, '#e8c040'); p(16, 3 + b, 2, 2, '#e8c040'); p(19, 2 + b, 2, 3, '#e8c040'); p(22, 3 + b, 2, 2, '#e8c040'); p(19, 6 + b, 2, 2, '#3c9c5c');
    return c;
  },
  Shadhavar(t) {
    const c = canvas(), p = painter(c);
    // Antílope de un cuerno hueco con ramas: cuando sopla el viento, el cuerno toca una música hermosa
    const b = quad(p, t, { col: '#c8a070', shade: '#a88050', belly: '#f4e8d0', head: 'deer', eye: DARK, hoof: '#5a4a30', tailc: '#f4e8d0' });
    p(29, 0 + b, 2, 10, '#e8c040'); p(27, 3 + b, 2, 2, '#e8c040'); p(31, 4 + b, 2, 2, '#e8c040'); p(26, 1 + b, 2, 2, '#e8c040'); p(32, 1 + b, 2, 2, '#e8c040');
    p(29, 2 + b, 1, 1, '#5a3c20'); p(29, 6 + b, 1, 1, '#5a3c20');
    const n = (t * 6) % 12;
    p(34, 8 - n * 0.5, 2, 2, '#f4f4f8'); p(35, 4 - n * 0.5, 1, 4, '#f4f4f8'); p(4 + n, 6, 2, 2, '#f4f4f8'); p(5 + n, 2, 1, 4, '#f4f4f8');
    return c;
  },
  Ifrit(t) {
    const c = canvas(), p = painter(c);
    // Genio de fuego, gigante y temible, con cuernos largos y una melena de llamas
    const b = giant(p, t, { skin: '#d83c30', shade: '#b82c20', eyes: '#ffd84a' });
    c.getContext('2d').clearRect(0, 37, 40, 11);
    for (let i = 0; i < 5; i++) { const sw = Math.round(Math.sin(t * 4 + i) * 2); p(10 + i * 4 + sw, 37 + i * 2, 10 - i * 1.5, 3, i % 2 ? '#ff7a20' : '#ffb040'); }
    p(12, 19 + b, 16, 3, '#e8c040'); p(15, 20 + b, 2, 1, '#78e0ff'); p(23, 20 + b, 2, 1, '#78e0ff');
    p(12, 3 + b, 3, 5, '#2a2a2a'); p(10, 0 + b, 3, 4, '#2a2a2a'); p(25, 3 + b, 3, 5, '#2a2a2a'); p(27, 0 + b, 3, 4, '#2a2a2a');
    for (let i = 0; i < 5; i++) flame(p, t, 13 + i * 3, 4 + b + (i % 2), i);
    p(17, 16 + b, 6, 1, '#5a1a1a');
    for (let k = 0; k < 3; k++) ember(p, t, 6 + k * 14, 34, k);
    return c;
  },
  'Azi Dahaka'(t) {
    const c = canvas(), p = painter(c);
    // Dragón de tres cabezas, seis ojos y tres bocas, lleno de serpientes y alimañas; encarna la mentira
    const b = dragon(p, t, { col: '#2a2c4c', shade: '#1c1e3c', belly: '#c81c3c', wings: false, eye: '#ff3030', spike: '#c81c3c', horn: '#c81c3c' });
    neck(p, 24, 22 + b, 14, 9 + b, '#2a2c4c', 5, 4); snakeHead(p, t, 6, 4 + b, '#2a2c4c', '#c81c3c', '#ff3030', -1, 1);
    neck(p, 26, 20 + b, 20, 4 + b, '#2a2c4c', 5, 4); snakeHead(p, t, 17, 0 + b, '#2a2c4c', '#c81c3c', '#ff3030', 1, 2);
    fireBreath(p, t, 37, 13 + b);
    for (let k = 0; k < 2; k++) { const q = (t * 4 + k * 5) % 10; p(4 + k * 12 + q, 46, 4, 1, '#3c8c3c'); p(7 + k * 12 + q, 45, 1, 1, '#3c8c3c'); }
    return c;
  },
  Bahamut(t) {
    const c = canvas(), p = painter(c);
    // Pez cósmico inmenso que sostiene al toro que a su vez carga la Tierra sobre el abismo
    p(0, 40, 40, 8, '#1c2c5c'); for (let i = 0; i < 4; i++) p((t * 3 + i * 10) % 40, 40, 4, 1, '#5c8cc8');
    const y = fish(p, t, { col: '#e8c040', fin: '#f4f4f8', belly: '#fff8e0', stripe: '#d8a030' });
    p(14, y - 14, 10, 6, '#8a5a30'); p(15, y - 8, 2, 2, '#8a5a30'); p(21, y - 8, 2, 2, '#8a5a30'); p(23, y - 15, 4, 4, '#8a5a30'); p(24, y - 17, 1, 2, '#e8d8b0'); p(26, y - 17, 1, 2, '#e8d8b0');
    disc(p, 18, y - 19, 4, '#3c8c3c'); p(16, y - 21, 3, 2, '#2c6cb8'); p(19, y - 18, 3, 2, '#2c6cb8');
    return c;
  },
  Leviathan(t) {
    const c = canvas(), p = painter(c);
    // Serpiente marina colosal de escamas impenetrables que hace hervir el mar con su aliento de fuego
    p(0, 38, 40, 10, '#1c3c6c');
    for (let i = 0; i < 9; i++) { const x = 1 + i * 3, y = 30 - Math.round(Math.abs(Math.sin(i * 0.6 + t * 2)) * 10); p(x, y, 5, 9, i % 2 ? '#1c2c6c' : '#2a3c7c'); p(x + 1, y - 2, 2, 2, '#3cc8c0'); }
    neck(p, 27, 34, 27, 16, '#2a3c7c', 6, 6);
    for (let i = 0; i < 4; i++) p(25, 18 + i * 4, 2, 2, '#3cc8c0');
    p(24, 8, 13, 10, '#2a3c7c'); p(34, 11, 6, 6, '#2a3c7c'); p(29, 10, 3, 2, '#ffd84a'); p(34, 16, 6, 1, '#101028');
    p(23, 5, 2, 4, '#3cc8c0'); p(26, 3, 2, 5, '#3cc8c0'); p(29, 4, 2, 4, '#3cc8c0');
    fireBreath(p, t, 37, 12);
    p(0, 37, 40, 2, '#5c8cc8'); for (let i = 0; i < 4; i++) p((t * 4 + i * 11) % 40, 37, 4, 1, '#ffffff');
    return c;
  },
  Behemoth(t) {
    const c = canvas(), p = painter(c);
    // La bestia de tierra más grande de la creación: huesos de bronce y una cola como un cedro
    p(0, 45, 40, 3, '#5a6a3a');
    const b = quad(p, t, { col: '#5a6a7a', shade: '#4a5a6a', belly: '#7a8a9a', head: 'none', hoof: '#3a4a5a', tail: false });
    p(1, 18 + b, 6, 4, '#3c6c3c'); p(0, 14 + b, 4, 6, '#3c6c3c'); p(4, 20 + b, 3, 6, '#5a4a3a');
    p(4, 15 + b, 28, 20, '#5a6a7a'); p(4, 15 + b, 28, 3, '#6a7a8a'); for (let i = 0; i < 4; i++) p(8 + i * 6, 20 + b, 1, 12, '#4a5a6a');
    [6, 12, 21, 27].forEach((x) => { p(x, 34, 6, 10, '#4a5a6a'); p(x, 43, 6, 2, '#3a4a5a'); });
    p(26, 14 + b, 13, 14, '#5a6a7a'); p(30, 24 + b, 9, 4, '#7a8a9a'); p(31, 17 + b, 2, 2, '#ffd84a'); p(27, 12 + b, 3, 3, '#4a5a6a');
    p(36, 12 + b, 3, 6, '#e8e0c8'); p(37, 9 + b, 2, 3, '#e8e0c8'); p(34, 27 + b, 2, 1, '#2a2a3a');
    return c;
  },
  Ziz(t) {
    const c = canvas(), p = painter(c);
    // Ave tan enorme que con los pies en el mar su cabeza toca el cielo y sus alas tapan el sol
    const b = bob(t), flap = Math.floor(t * 3) % 2;
    wings(p, 10 + b, '#2c7cd8', '#5ce0f0', flap, 13);
    p(14, 14 + b, 12, 22, '#1c2c6c'); p(17, 18 + b, 6, 14, '#3c5ca8');
    p(15, 4 + b, 10, 10, '#1c2c6c'); p(16, 7 + b, 2, 2, '#5ce0f0'); p(22, 7 + b, 2, 2, '#5ce0f0'); p(18, 10 + b, 4, 4, '#e8c040'); p(19, 14 + b, 2, 1, '#c89020');
    p(16, 36, 2, 8, '#e8c040'); p(22, 36, 2, 8, '#e8c040');
    const d = Math.round(Math.sin(t) * 2); p(0 + d, 26, 14, 4, '#f4f4f8'); p(26 - d, 28, 14, 4, '#f4f4f8'); p(3 + d, 24, 8, 2, '#f4f4f8');
    p(0, 42, 40, 6, '#2c6cb8'); for (let i = 0; i < 4; i++) p((t * 4 + i * 10) % 40, 42, 4, 1, '#a8e0ff');
    return c;
  },
  Roc(t) {
    const c = canvas(), p = painter(c);
    // Ave gigantesca de los mares de Simbad que caza elefantes para alimentar a sus crías
    const b = bird(p, t, { col: '#8a5a30', wing: '#c8a070', wing2: '#e8c890', belly: '#c8a070', tail: '#6a4a28', beak: '#e8c040', eye: '#ffd84a', leg: '#e8c040' });
    c.getContext('2d').clearRect(12, 44, 16, 4);
    const sw = Math.round(Math.sin(t * 3));
    p(10 + sw, 40, 16, 7, '#8a8a9a'); p(8 + sw, 41, 3, 5, '#8a8a9a'); p(7 + sw, 45, 2, 2, '#8a8a9a'); p(9 + sw, 42, 1, 1, DARK); p(10 + sw, 44, 2, 1, '#f4f4e8');
    p(12 + sw, 47, 3, 1, '#7a7a8a'); p(21 + sw, 47, 3, 1, '#7a7a8a'); p(14, 39, 4, 2, '#e8c040'); p(20, 39, 4, 2, '#e8c040');
    p(38, 15 + b, 2, 3, '#e8c040');
    return c;
  },
  Anqa(t) {
    const c = canvas(), p = painter(c);
    // Ave fabulosa de Arabia, tan grande y rara que solo se ve una vez cada muchos siglos
    const cols = ['#e8c040', '#fff07a', '#d8a030'];
    for (let k = 0; k < 3; k++) for (let i = 0; i < 10; i++) p(9 - i * 0.8 + k * 2 + Math.round(Math.sin(i * 0.6 + t * 3 + k) * 1.5), 28 + i * 1.6, 3, 2, cols[k]);
    const b = bird(p, t, { col: '#7c3cb0', wing: '#a868e0', wing2: '#e8c8ff', belly: '#c8a0e8', tail: '#e8c040', beak: '#e8c040', eye: '#ffd84a', leg: '#e8c040' });
    p(26, 4 + b, 2, 4, '#e8c040'); p(29, 3 + b, 2, 5, '#e8c040'); p(32, 5 + b, 2, 3, '#e8c040');
    for (let k = 0; k < 3; k++) twinkle(p, t + k, [4, 36, 22][k], [6, 30, 2][k], '#fff8b0');
    return c;
  },
  Simurgh(t) {
    const c = canvas(), p = painter(c);
    // Ave sabia y antiquísima que anida en el Árbol de Todas las Semillas; sus plumas curan
    p(0, 38, 40, 4, '#6a4a2a'); p(30, 34, 3, 4, '#6a4a2a'); for (let i = 0; i < 4; i++) p(32 + i * 2, 31 + (i % 2), 3, 3, '#3c8c3c');
    for (let k = 0; k < 3; k++) for (let i = 0; i < 10; i++) {
      const x = 10 - i * 0.6 + k * 3, y = 30 + i * 1.6 + Math.round(Math.sin(i * 0.5 + t * 2 + k));
      p(x, y, 3, 2, '#2c9c8c'); if (i === 9) { p(x - 1, y, 4, 3, '#2c9c8c'); p(x, y + 1, 2, 1, '#e8c040'); }
    }
    const b = bird(p, t, { col: '#2c9c9c', wing: '#3cac7c', wing2: '#e8c040', belly: '#a8e0d0', tail: '#e8c040', beak: '#d8a030', eye: DARK, leg: '#d8a030' });
    c.getContext('2d').clearRect(12, 42, 16, 6);
    p(14, 37, 2, 2, '#d8a030'); p(22, 37, 2, 2, '#d8a030');
    p(26, 4 + b, 2, 4, '#d83030'); p(29, 3 + b, 2, 5, '#d83030'); p(32, 5 + b, 2, 3, '#d83030');
    const f = (t * 4) % 12; p(6 + f, 44 + Math.round(Math.sin(t * 3)), 3, 1, '#3cac7c');
    return c;
  },

  // ---------- Americanas ----------
  Iara(t) {
    const c = canvas(), p = painter(c);
    // Sirena del Amazonas que canta en los ríos y arrastra a los hombres al fondo del agua
    const b = figure(p, t, { robe: '#3c9c4c', robeShade: '#2c7c3c', skin: '#c8885c', hair: '#101018', longHair: true, eyes: '#3a2a1a' });
    merTail(p, t, b, '#3cac5c', '#78d07c');
    p(13, 7 + b, 4, 3, '#ff7ca0'); p(14, 8 + b, 2, 1, '#ffd84a');
    p(0, 46, 40, 2, '#2c7c8c'); p(0, 44, 6, 3, '#3c9c3c'); p(34, 44, 6, 3, '#3c9c3c');
    const n = (t * 6) % 12; p(32, 14 - n * 0.5, 2, 2, '#f4f4f8'); p(33, 10 - n * 0.5, 1, 4, '#f4f4f8');
    return c;
  },
  Boto(t) {
    const c = canvas(), p = painter(c);
    // Delfín rosado del Amazonas que de noche se vuelve un hombre de blanco con sombrero para esconder su espiráculo
    p(0, 42, 40, 6, '#5a7a6a'); for (let i = 0; i < 4; i++) p((t * 4 + i * 10) % 40, 42, 4, 1, '#a8c8b8');
    const j = Math.floor(t * 2) % 2;
    p(1, 36 - j * 3, 9, 5, '#f0a0b0'); p(9, 37 - j * 3, 3, 2, '#f0a0b0'); p(4, 34 - j * 3, 3, 2, '#e08898'); p(0, 38 - j * 3, 2, 3, '#e08898'); p(8, 37 - j * 3, 1, 1, DARK);
    const b = figure(p, t, { robe: '#f4f4f0', robeShade: '#d8d8d0', skin: '#c8885c', legs: '#f4f4f0', shoe: '#f4f4f8', eyes: '#3a2a1a', hair: '#101018' });
    p(18, 24 + b, 4, 6, '#d83030'); p(13, 24 + b, 14, 1, '#d8d8d0');
    p(10, 8 + b, 20, 2, '#f4f4f0'); p(14, 4 + b, 12, 5, '#f4f4f0'); p(14, 7 + b, 12, 1, '#2a2a34');
    return c;
  },
  Pincoya(t) {
    const c = canvas(), p = painter(c);
    // Espíritu del mar de Chiloé: si baila mirando al mar, la pesca será abundante
    p(0, 44, 40, 4, '#e8d8a8'); p(0, 46, 40, 2, '#2c6cb8'); for (let i = 0; i < 3; i++) p(4 + i * 12, 43, 4, 1, '#3c8c5c');
    const up = Math.floor(t * 2) % 2;
    const b = figure(p, t, { robe: '#2cacac', robeShade: '#1c8c8c', dress: true, hair: '#e8c040', longHair: true, eyes: '#2a6aa8', armL: up ? 'up' : undefined, armR: up ? undefined : 'up' });
    for (let i = 0; i < 4; i++) p(13 + i * 4, 30 + b + (i % 2) * 6, 2, 3, '#3c8c5c');
    const x = up ? 7 : 27; disc(p, x + 2, 11 + b, 3, '#a8f0ff'); p(x + 1, 10 + b, 2, 1, '#ffffff');
    return c;
  },
  Millalobo(t) {
    const c = canvas(), p = painter(c);
    // Rey del mar de Chiloé, mitad hombre y mitad lobo marino, de pelaje gris y corona
    const b = figure(p, t, { robe: '#7a7a84', robeShade: '#5a5a64', skin: '#c8885c', hair: '#101018', eyes: '#3a2a1a' });
    for (let i = 0; i < 4; i++) p(14 + i * 3, 26 + b + (i % 2) * 3, 2, 6, '#9a9aa4');
    merTail(p, t, b, '#7a7a84', '#5a5a64');
    p(15, 5 + b, 10, 4, '#e8c040'); p(16, 3 + b, 2, 2, '#e8c040'); p(19, 2 + b, 2, 3, '#e8c040'); p(22, 3 + b, 2, 2, '#e8c040');
    p(14, 18 + b, 12, 4, '#101018'); p(17, 18 + b, 6, 1, '#b07060');
    bubble(p, t, 36, 40); bubble(p, t, 2, 38, 3);
    return c;
  },
  Camahueto(t) {
    const c = canvas(), p = painter(c);
    // Ternero verde de un solo cuerno dorado que nace en la tierra y corre a romper las rocas hacia el mar
    p(0, 44, 40, 4, '#6a6a5a'); p(30, 38, 10, 6, '#8a8a7a'); p(33, 36, 6, 2, '#8a8a7a'); p(31, 40, 2, 1, '#5a5a4a');
    const b = quad(p, t, { col: '#3c9c4c', shade: '#2c7c3c', belly: '#78c87c', head: 'none', eye: DARK, hoof: '#2c5c2c', tailc: '#2c7c3c' });
    p(25, 14 + b, 8, 10, '#3c9c4c'); p(28, 10 + b, 10, 10, '#3c9c4c'); p(34, 16 + b, 6, 5, '#2c7c3c'); p(37, 17 + b, 1, 1, DARK); p(30, 13 + b, 2, 2, DARK);
    p(25, 10 + b, 4, 2, '#2c7c3c'); p(37, 10 + b, 3, 2, '#2c7c3c'); p(32, 3 + b, 2, 8, '#e8c040'); p(32, 1 + b, 1, 2, '#fff07a');
    if (Math.floor(t * 3) % 2) { p(36, 34, 2, 2, '#8a8a7a'); p(38, 32, 1, 1, '#8a8a7a'); }
    return c;
  },
  Alux(t) {
    const c = canvas(), p = painter(c);
    // Duendecillo maya que cuida las milpas: si le dejas ofrendas protege la cosecha
    p(0, 45, 40, 3, '#8a6a40');
    for (const x of [2, 34]) { p(x + 1, 14, 2, 31, '#5c9c3c'); p(x - 1, 20, 3, 2, '#78c050'); p(x + 3, 26, 3, 2, '#78c050'); p(x + 2, 16, 3, 5, '#e8c040'); }
    const b = dwarf(p, t, { robe: '#8a5a3a', robeShade: '#6a4a2a', skin: '#8a5a3a', legs: '#8a5a3a', shoe: '#6a4a2a', hair: '#101018', eyes: '#101018' });
    p(12, 34 + b, 16, 6, '#f4f4f0'); p(18, 38 + b, 4, 4, '#f4f4f0');
    p(12, 13 + b, 16, 4, '#101018'); p(13, 16 + b, 3, 6, '#101018'); p(24, 16 + b, 3, 6, '#101018');
    p(14, 11 + b, 12, 2, '#e8c040'); p(19, 9 + b, 2, 3, '#3cac7c');
    p(28, 42, 6, 3, '#c8a060'); p(29, 41, 4, 1, '#f4e8c8');
    return c;
  },
  Chaneque(t) {
    const c = canvas(), p = painter(c);
    // Niño-duende de la selva veracruzana que asusta a la gente hasta hacerle perder el alma
    p(0, 45, 40, 3, '#4a6a2a'); p(0, 30, 6, 15, '#3c7c3c'); p(34, 26, 6, 19, '#3c7c3c');
    const b = dwarf(p, t, { robe: '#c8885c', robeShade: '#a8683c', skin: '#c8885c', legs: '#c8885c', shoe: '#a8683c', eyes: '#101018' });
    p(12, 35 + b, 16, 5, '#3c9c3c'); for (let i = 0; i < 4; i++) p(12 + i * 4, 39, 3, 3, '#2c8c2c');
    p(11, 11 + b, 18, 6, '#101018'); for (let i = 0; i < 5; i++) p(10 + i * 4, 8 + b + (i % 2) * 2, 3, 4, '#101018');
    p(17, 24 + b, 6, 2, '#5a1a1a'); p(18, 24 + b, 1, 1, '#ffffff'); p(21, 24 + b, 1, 1, '#ffffff');
    const w = Math.floor(t * 3) % 2; p(29 + w, 26 + b, 3, 3, '#c8885c');
    return c;
  },
  Pukwudgie(t) {
    const c = canvas(), p = painter(c);
    // Hombrecillo gris de orejas largas, con arco y flechas envenenadas; puede lanzar fuego
    p(0, 45, 40, 3, '#5a5a3a');
    const b = dwarf(p, t, { robe: '#8a6a40', robeShade: '#6a4a28', skin: '#8a8a94', legs: '#8a8a94', shoe: '#6a6a74', eyes: '#ffd84a' });
    p(8, 17 + b, 5, 3, '#8a8a94'); p(6, 15 + b, 3, 3, '#8a8a94'); p(27, 17 + b, 5, 3, '#8a8a94'); p(31, 15 + b, 3, 3, '#8a8a94');
    p(11, 11 + b, 18, 6, '#b8b8c4'); for (let i = 0; i < 5; i++) p(10 + i * 4, 8 + b + (i % 2) * 2, 3, 4, '#b8b8c4');
    for (let i = 0; i < 4; i++) p(12 + i * 4, 26 + b, 1, 4, '#c8c8d0');
    p(31, 22 + b, 2, 20, '#8a5a30'); p(32, 21 + b, 2, 2, '#8a5a30'); p(32, 41 + b, 2, 2, '#8a5a30'); p(30, 23 + b, 1, 18, '#e8e0c8');
    const f = Math.floor(t * 3) % 3; if (!f) { p(24, 32 + b, 9, 1, '#a87a40'); p(33, 31 + b, 2, 3, '#c8c8d0'); }
    return c;
  },
  Pombero(t) {
    const c = canvas(), p = painter(c);
    // Hombrecillo peludo de las noches guaraníes que silba como los pájaros; hay que dejarle tabaco y miel
    p(0, 45, 40, 3, '#5a4a2a');
    const b = dwarf(p, t, { robe: '#2a2a2a', robeShade: '#1a1a1a', skin: '#5a3c2a', legs: '#2a2a2a', shoe: '#1a1a1a', eyes: '#ffd84a' });
    for (let i = 0; i < 5; i++) { p(12 + i * 3, 30 + b + (i % 2) * 3, 2, 6, '#3a3a3a'); p(9 + (i % 2) * 19, 30 + i * 2, 3, 1, '#3a3a3a'); }
    p(8, 13 + b, 24, 3, '#c8a060'); p(13, 9 + b, 14, 4, '#b89050'); p(13, 12 + b, 14, 1, '#6a4a28');
    p(18, 24 + b, 3, 2, '#2a1a10');
    const n = (t * 6) % 10; p(23 + n, 22 - n * 0.5, 2, 2, '#f4f4f8'); p(24 + n, 18 - n * 0.5, 1, 4, '#f4f4f8');
    p(32, 6, 4, 3, '#e8c040'); p(35, 7, 2, 1, '#d8a030'); p(31, 5 + Math.floor(t * 4) % 2, 2, 2, '#e8c040');
    return c;
  },
  'Yasy Yateré'(t) {
    const c = canvas(), p = painter(c);
    // Niño rubio de la siesta, con sombrero de paja y bastón de oro: se lleva a los niños que no duermen
    p(0, 45, 40, 3, '#8a7a4a');
    const b = dwarf(p, t, { robe: '#e8c870', robeShade: '#d8b050', skin: '#e8c870', legs: '#e8c870', shoe: '#d8b050', hair: '#fff07a', eyes: '#3c7cd8' });
    p(12, 35 + b, 16, 5, '#f4f4f0');
    p(7, 14 + b, 26, 3, '#d8b060'); p(11, 11 + b, 18, 3, '#c8a050'); p(15, 8 + b, 10, 3, '#b89040');
    p(12, 17 + b, 3, 6, '#fff07a'); p(25, 17 + b, 3, 6, '#fff07a');
    p(31, 18 + b, 2, 27 - b, '#e8c040'); p(30, 17 + b, 4, 2, '#fff07a'); twinkle(p, t, 32, 16 + b, '#ffffff');
    return c;
  },
  Saci(t) {
    const c = canvas(), p = painter(c);
    // Niño travieso de una sola pierna, gorro rojo mágico y pipa, que viaja en remolinos de polvo
    for (let i = 0; i < 6; i++) { const a = i * 1.1 + t * 5; p(20 + Math.cos(a) * (8 + i * 2), 44 - i * 2 + Math.sin(a) * 2, 3, 1, '#c8a878'); }
    const h = -Math.round(Math.abs(Math.sin(t * 3)) * 3);
    const b = dwarf(p, t, { robe: '#5a3c2a', robeShade: '#4a2c1a', skin: '#5a3c2a', legs: '#5a3c2a', shoe: '#4a2c1a', eyes: '#101018' });
    c.getContext('2d').clearRect(20, 40, 8, 8);
    p(12, 35 + b, 16, 6, '#d83030');
    p(13, 12 + b, 14, 5, '#d83030'); p(15, 9 + b, 9, 4, '#d83030'); p(22, 7 + b, 4, 4, '#c82020');
    p(18, 24 + b, 4, 1, '#f4e8e0');
    p(22, 25 + b, 6, 1, '#8a5a30'); p(27, 23 + b, 3, 3, '#8a5a30');
    for (let k = 0; k < 3; k++) { const q = (t * 8 + k * 5) % 14; p(28 + Math.round(Math.sin(t * 3 + k)), 21 - q, 2, 2, '#c8c8d0'); }
    if (h) p(14, 45, 6, 1, '#3a3a2a');
    return c;
  },
  Tlaloque(t) {
    const c = canvas(), p = painter(c);
    // Ayudante de Tláloc que rompe sus cántaros en el cielo para que llueva, truene o graniza
    for (let i = 0; i < 6; i++) p(2 + i * 7, (t * 20 + i * 9) % 44, 1, 3, '#78a8f0');
    const b = dwarf(p, t, { robe: '#3c6cd8', robeShade: '#2c4cb8', skin: '#3c6cd8', legs: '#3c6cd8', shoe: '#2c4cb8', eyes: '#3c6cd8' });
    p(12, 35 + b, 16, 6, '#f4f4f0');
    p(14, 19 + b, 5, 5, '#f4f4f0'); p(21, 19 + b, 5, 5, '#f4f4f0'); p(16, 21 + b, 2, 2, DARK); p(23, 21 + b, 2, 2, DARK);
    p(16, 25 + b, 8, 2, '#f4f4f0'); for (let i = 0; i < 3; i++) p(17 + i * 2, 27 + b, 1, 2, '#f4f4f0');
    p(12, 12 + b, 16, 4, '#f4f4f0'); p(14, 10 + b, 3, 3, '#3cac7c'); p(23, 10 + b, 3, 3, '#3cac7c');
    const tilt = Math.floor(t * 2) % 2;
    p(28, 22 + b + tilt, 9, 9, '#c87a40'); p(29, 21 + b + tilt, 7, 2, '#a85a28'); p(30, 25 + b + tilt, 5, 1, '#5cc0e8');
    p(35, 31 + b, 1, 3, '#78c8f0'); p(34, 35 + b + ((t * 10) % 6), 1, 2, '#78c8f0');
    return c;
  },
  Keelut(t) {
    const c = canvas(), p = painter(c);
    // Perro sin pelo de los cementerios inuit, con pelo solo en las patas para no dejar huella
    p(0, 45, 40, 3, '#e8f0f8');
    const b = quad(p, t, { col: '#4a4a58', shade: '#3a3a48', belly: '#5a5a68', head: 'dog', eye: '#ff3030', fangs: true, hoof: '#2a2a34', tailc: '#3a3a48' });
    [8, 13, 23, 28].forEach((x) => { p(x - 1, 40, 5, 4, '#e8e8f0'); p(x - 1, 43, 5, 1, '#c8c8d0'); });
    for (let i = 0; i < 3; i++) p(10 + i * 6, 22 + b, 3, 1, '#3a3a48');
    return c;
  },
  Qiqirn(t) {
    const c = canvas(), p = painter(c);
    // Perro gigante y calvo, con pelo solo en boca, pies, orejas y cola; huye si gritas su nombre
    p(0, 45, 40, 3, '#e8f0f8');
    const b = quad(p, t, { col: '#e8c8b8', shade: '#d8b0a0', belly: '#f0d8c8', head: 'dog', eye: DARK, hoof: '#f4f4f8', tailc: '#e8c8b8' });
    [8, 13, 23, 28].forEach((x) => p(x - 1, 40, 5, 4, '#f4f4f8'));
    p(27, 6 + b, 3, 3, '#f4f4f8'); p(32, 6 + b, 3, 3, '#f4f4f8'); p(35, 15 + b, 5, 4, '#f4f4f8'); p(1, 26 + b, 4, 5, '#f4f4f8');
    p(10, 24 + b, 4, 1, '#d8a090'); p(18, 26 + b, 4, 1, '#d8a090');
    return c;
  },
  Mahaha(t) {
    const c = canvas(), p = painter(c);
    // Demonio helado de piel azulada y sonrisa permanente que mata a cosquillas en el Ártico
    for (let k = 0; k < 6; k++) flake(p, t, 3 + k * 7, k);
    p(0, 45, 40, 3, '#e8f0f8');
    const b = figure(p, t, { robe: '#a8c8e0', robeShade: '#88a8c8', skin: '#a8c8e0', legs: '#a8c8e0', shoe: '#88a8c8', hair: '#f4f4f8', longHair: true, eyes: '#ffffff', armL: 'up', armR: 'up' });
    p(13, 34 + b, 14, 6, '#f4f4f8');
    for (let i = 0; i < 4; i++) p(12 + i * 4, 6 + b + (i % 2), 3, 4, '#f4f4f8');
    p(15, 13 + b, 4, 3, '#1c2c4c'); p(21, 13 + b, 4, 3, '#1c2c4c'); p(16, 14 + b, 2, 1, '#ffffff'); p(22, 14 + b, 2, 1, '#ffffff');
    p(15, 18 + b, 10, 2, '#1c2c4c'); for (let i = 0; i < 5; i++) p(15 + i * 2, 18 + b, 1, 1, '#ffffff');
    const w = Math.floor(t * 4) % 2;
    p(9 + w, 10 + b, 1, 3, '#e8f0f8'); p(11 - w, 10 + b, 1, 3, '#e8f0f8'); p(28 + w, 10 + b, 1, 3, '#e8f0f8'); p(30 - w, 10 + b, 1, 3, '#e8f0f8');
    return c;
  },
  Adlet(t) {
    const c = canvas(), p = painter(c);
    // Hombre con cabeza y piernas de perro, nacido de una mujer y un perro según la leyenda inuit
    p(0, 45, 40, 3, '#e8f0f8');
    const b = figure(p, t, { robe: '#f4f4f0', robeShade: '#d8d8d0', skin: '#f4f4f0', legs: '#e8e8e0', shoe: '#c8c8c0' });
    p(13, 30 + b, 14, 2, '#c8b890'); for (let i = 0; i < 4; i++) p(14 + i * 3, 26 + b + (i % 2) * 5, 2, 2, '#e0e0d8');
    p(14, 9 + b, 12, 12, '#e8e8e0'); p(14, 5 + b, 3, 5, '#e8e8e0'); p(23, 5 + b, 3, 5, '#e8e8e0'); p(15, 6 + b, 1, 3, '#d8a0a0'); p(24, 6 + b, 1, 3, '#d8a0a0');
    p(17, 15 + b, 6, 6, '#f4f4f0'); p(19, 15 + b, 2, 2, DARK); p(18, 19 + b, 4, 1, '#5a1a1a');
    p(16, 12 + b, 2, 2, '#ffd84a'); p(22, 12 + b, 2, 2, '#ffd84a');
    p(8, 20 + b, 2, 24, '#8a6a40'); p(7, 19 + b, 4, 3, '#c8c8d0');
    return c;
  },
  Tupilaq(t) {
    const c = canvas(), p = painter(c);
    // Monstruo tallado en hueso por un hechicero inuit y lanzado al mar para vengarse de un enemigo
    p(0, 44, 40, 4, '#2c5c8c'); for (let i = 0; i < 4; i++) p((t * 4 + i * 10) % 40, 44, 4, 1, '#a8e0ff');
    const b = bob(t), bn = '#e8e0c8', d = '#5a4a3a';
    p(13, 8 + b, 14, 13, bn); p(15, 12 + b, 4, 4, d); p(21, 12 + b, 4, 4, d); p(16, 13 + b, 2, 2, '#ff3030'); p(22, 13 + b, 2, 2, '#ff3030');
    p(19, 16 + b, 2, 2, d); p(15, 19 + b, 10, 2, d); for (let i = 0; i < 4; i++) p(16 + i * 2, 19 + b, 1, 2, bn);
    p(12, 4 + b, 3, 5, bn); p(25, 4 + b, 3, 5, bn);
    p(18, 21 + b, 4, 18, bn); for (let i = 0; i < 4; i++) p(13, 24 + b + i * 3, 14, 2, bn);
    const w = Math.floor(t * 3) % 2;
    p(8, 23 + b + w, 5, 2, bn); p(6, 25 + b + w, 2, 6, bn); p(27, 23 + b - w, 5, 2, bn); p(32, 25 + b - w, 2, 6, bn);
    p(15, 38, 3, 6, bn); p(22, 38, 3, 6, bn); p(13, 43, 5, 1, bn); p(22, 43, 5, 1, bn);
    return c;
  },
  Qalupalik(t) {
    const c = canvas(), p = painter(c);
    // Mujer del mar de piel verde y uñas largas que se lleva a los niños que juegan cerca del hielo
    p(0, 0, 40, 4, '#e8f4fc'); p(4, 4, 10, 2, '#c8e4f4'); p(26, 4, 8, 2, '#c8e4f4');
    const b = figure(p, t, { robe: '#3c7c5c', robeShade: '#2c5c4c', skin: '#78a888', hair: '#101018', longHair: true, eyes: '#ffd84a' });
    p(12, 22 + b, 16, 3, '#5c9c7c'); p(14, 24 + b, 3, 8, '#5c9c7c'); p(23, 24 + b, 3, 8, '#5c9c7c');
    merTail(p, t, b, '#3c8c5c', '#2c6c4c');
    p(9, 35 + b, 1, 3, '#e8e0c8'); p(11, 35 + b, 1, 3, '#e8e0c8'); p(28, 35 + b, 1, 3, '#e8e0c8'); p(30, 35 + b, 1, 3, '#e8e0c8');
    bubble(p, t, 36, 36); bubble(p, t, 3, 30, 4);
    return c;
  },
  Akhlut(t) {
    const c = canvas(), p = painter(c);
    // Orca que sale del mar convertida en lobo: sus huellas llevan del hielo al agua
    p(0, 45, 40, 3, '#e8f0f8');
    const b = quad(p, t, { col: '#1c1c24', shade: '#101018', belly: '#f4f4f8', head: 'wolf', eye: '#f4f4f8', fangs: true, hoof: '#101018', tail: false });
    p(9, 27 + b, 18, 4, '#f4f4f8'); p(29, 9 + b, 4, 2, '#f4f4f8'); p(26, 16 + b, 6, 3, '#f4f4f8');
    p(15, 14 + b, 4, 6, '#1c1c24'); p(16, 11 + b, 2, 4, '#1c1c24');
    const sw = Math.floor(t * 3) % 2; p(3, 22 + b, 4, 4, '#1c1c24'); p(0, 18 + b - sw, 4, 4, '#1c1c24'); p(0, 26 + b + sw, 4, 4, '#1c1c24');
    return c;
  },
  Amarok(t) {
    const c = canvas(), p = painter(c);
    // Lobo gigante que caza solo y devora a quien sale de noche a cazar sin compañía
    disc(p, 8, 8, 6, '#f4f0c8'); p(5, 6, 2, 2, '#d8d4b0');
    p(0, 45, 40, 3, '#e8f0f8');
    const b = quad(p, t, { col: '#7a7a84', shade: '#5a5a64', belly: '#c8c8d0', head: 'wolf', eye: '#ffd84a', fangs: true, hoof: '#4a4a54', tailc: '#5a5a64' });
    for (let i = 0; i < 6; i++) p(8 + i * 4, 19 + b - (i % 2), 2, 2, '#9a9aa4');
    p(23, 18 + b, 6, 6, '#c8c8d0');
    return c;
  },
  Nanurluk(t) {
    const c = canvas(), p = painter(c);
    // Oso polar tan enorme que confunde a los cazadores con presas pequeñas
    p(0, 44, 40, 4, '#c8e4f4'); p(4, 43, 12, 1, '#e8f4fc');
    const b = quad(p, t, { col: '#f4f4f0', shade: '#d8d8d0', belly: '#e8e8e0', head: 'none', hoof: '#2a2a34', tail: false });
    [7, 12, 22, 27].forEach((x) => p(x, 32, 5, 12, '#ececea'));
    p(4, 17 + b, 28, 16, '#f4f4f0'); p(6, 15 + b, 20, 3, '#f4f4f0');
    p(26, 16 + b, 11, 10, '#f4f4f0'); p(35, 20 + b, 5, 5, '#f4f4f0'); p(38, 20 + b, 2, 2, DARK);
    p(26, 13 + b, 3, 3, '#f4f4f0'); p(31, 18 + b, 2, 2, DARK); p(35, 24 + b, 4, 1, '#3a3a44');
    p(2, 40, 2, 3, '#3a2a1a'); p(1, 38, 4, 2, '#3a2a1a');
    return c;
  },
  Ijiraq(t) {
    const c = canvas(), p = painter(c);
    // Espíritu cambiaformas con astas de caribú que esconde a los niños perdidos en la tundra
    const f = ghost(p, t, { col: '#5a6a7a', hood: '#8a8a94', eye: '#ff3030', mouth: '#2a3a4a' });
    p(15, 18 + f, 3, 3, '#ff6060'); p(22, 18 + f, 3, 3, '#ff6060');
    p(12, 0 + f, 2, 8, '#c8b890'); p(9, 2 + f, 3, 2, '#c8b890'); p(10, 0 + f, 2, 2, '#c8b890');
    p(26, 0 + f, 2, 8, '#c8b890'); p(28, 2 + f, 3, 2, '#c8b890'); p(28, 0 + f, 2, 2, '#c8b890');
    for (let k = 0; k < 3; k++) twinkle(p, t + k, [4, 34, 6][k], [14, 20, 40][k], '#a8f0c8');
    return c;
  },
  'Luz mala'(t) {
    const c = canvas(), p = painter(c);
    // Luz amarilla que flota de noche sobre la pampa, donde hay huesos o tesoros enterrados
    p(0, 44, 40, 4, '#3a4a2a'); for (let i = 0; i < 8; i++) p(1 + i * 5, 41 + (i % 2), 1, 3, '#5a6a3a');
    p(28, 30, 2, 14, '#8a6a40'); p(25, 33, 8, 2, '#8a6a40');
    const y = 18 + Math.round(Math.sin(t * 2) * 3);
    disc(p, 16, y, 9, '#e8a020'); disc(p, 16, y, 7, '#ffd84a'); disc(p, 16, y, 4, '#fff8c0');
    for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + t * 2; p(16 + Math.cos(a) * 12, y + Math.sin(a) * 12, 2, 2, '#ffd84a'); }
    p(14, 41, 5, 3, '#e8e0c8');
    return c;
  },
  'La Llorona'(t) {
    const c = canvas(), p = painter(c);
    // Mujer de blanco que vaga junto a los ríos gritando: «¡Ay, mis hijos!»
    p(0, 42, 40, 6, '#2c5c8c'); for (let i = 0; i < 4; i++) p((t * 4 + i * 10) % 40, 42, 4, 1, '#a8c8e8');
    const f = ghost(p, t, { col: '#f4f4f8', hair: '#101018', eye: '#2a2a3a', mouth: '#2a1a2a' });
    p(17, 24 + f, 6, 5, '#2a1a2a'); p(18, 25 + f, 4, 3, '#5a1a2a');
    const tr = (t * 8) % 8; p(15, 21 + f + tr, 1, 2, '#a8e0ff'); p(24, 21 + f + ((tr + 4) % 8), 1, 2, '#a8e0ff');
    p(8, 12 + f, 4, 3, '#f4f4f8'); p(28, 12 + f, 4, 3, '#f4f4f8'); p(8, 9 + f, 2, 3, '#f4f4f8'); p(30, 9 + f, 2, 3, '#f4f4f8');
    if (Math.floor(t * 3) % 2) { p(2, 20, 3, 1, '#d8e0f0'); p(1, 23, 4, 1, '#d8e0f0'); p(35, 20, 3, 1, '#d8e0f0'); p(35, 23, 4, 1, '#d8e0f0'); }
    return c;
  },
  'Silbón'(t) {
    const c = canvas(), p = painter(c);
    // Espanto llanero altísimo con sombrero y un saco de huesos: si su silbido suena lejos, está cerca
    p(0, 45, 40, 3, '#8a7a4a');
    const b = figure(p, t, { robe: '#6a4a28', robeShade: '#5a3a1a', skin: '#5a6a7a', legs: '#4a3a2a', shoe: '#3a2a1a', eyes: '#ff3030' });
    p(14, 0 + b, 12, 9, '#8a6a40'); p(6, 8 + b, 28, 3, '#8a6a40'); p(14, 7 + b, 12, 1, '#5a3c20');
    p(27, 22 + b, 10, 14, '#c8a870'); p(28, 21 + b, 4, 2, '#a88850'); p(30, 26 + b, 4, 2, '#f4f4e8'); p(32, 30 + b, 3, 2, '#f4f4e8');
    p(19, 18 + b, 2, 2, '#3a2a2a');
    const n = (t * 6) % 12; p(4, 22 - n, 2, 2, '#f4f4f8'); p(5, 18 - n, 1, 4, '#f4f4f8');
    return c;
  },
  Cadejo(t) {
    const c = canvas(), p = painter(c);
    // Perro blanco de ojos rojos y pezuñas de cabra que protege a los caminantes de noche
    p(0, 45, 40, 3, '#5a4a3a');
    const b = quad(p, t, { col: '#f4f4f0', shade: '#d8d8d0', belly: '#e8e8e0', head: 'dog', eye: '#ff3030', hoof: '#3a2a1a', tailc: '#d8d8d0' });
    p(31, 11 + b, 4, 4, '#ff8080'); p(32, 12 + b, 2, 2, '#ff3030');
    for (let i = 0; i < 5; i++) p(24 + i * 3, 23 + b + (i % 2), 2, 2, '#9a9aa4');
    return c;
  },
  Peuchen(t) {
    const c = canvas(), p = painter(c);
    // Serpiente voladora chilena que chupa la sangre de los animales y silba de forma espantosa
    sideWing(p, 18, 30, '#8a5a30', '#c8a070', Math.floor(t * 4) % 2, -1, 7);
    serpent(p, t, { col: '#8a5a30', shade: '#6a4a28', belly: '#c8a070', eye: '#ff3030' });
    sideWing(p, 33, 24, '#a87040', '#e8c890', Math.floor(t * 4 + 1) % 2, 1, 4);
    const n = (t * 6) % 10; p(38 - n * 0.3, 8 - n * 0.5, 2, 1, '#f4f4f8'); p(36 - n * 0.3, 6 - n * 0.5, 1, 1, '#f4f4f8');
    return c;
  },
  Pishtaco(t) {
    const c = canvas(), p = painter(c);
    // Hombre forastero de blanco que asalta a los viajeros de los Andes para robarles la grasa
    p(0, 45, 40, 3, '#8a7a5a');
    const b = figure(p, t, { robe: '#f4f4f0', robeShade: '#d8d8d0', skin: '#f4d8c8', legs: '#3a3a44', shoe: '#2a2a34', hair: '#e8c040', beard: '#e8c040', eyes: '#3c7cd8', armR: 'up' });
    p(9, 9 + b, 22, 2, '#f4f4f0'); p(14, 4 + b, 12, 6, '#f4f4f0'); p(14, 8 + b, 12, 1, '#3a3a44');
    p(28, 4 + b, 2, 9, '#d8e0e8'); p(27, 12 + b, 4, 1, '#8a5a30'); twinkle(p, t, 29, 4 + b);
    p(5, 30 + b, 7, 10, '#a87a50'); p(6, 29 + b, 5, 2, '#8a5a30');
    return c;
  },
  Nunnehi(t) {
    const c = canvas(), p = painter(c);
    // Pueblo espiritual cherokee que vive bajo los montes y ayuda a los perdidos; brillan al aparecer
    disc(p, 20, 24, 18, '#e8c84a'); disc(p, 20, 24, 16, '#f4dc7a');
    const b = figure(p, t, { robe: '#c8a070', robeShade: '#a88050', skin: '#c8885c', legs: '#c8a070', shoe: '#8a6040', hair: '#101018', longHair: true, eyes: '#3a2a1a' });
    for (let i = 0; i < 5; i++) p(13 + i * 3, 40, 2, 2, '#8a6040');
    p(13, 30 + b, 14, 2, '#d83030'); p(15, 26 + b, 10, 1, '#3c8cd8');
    p(25, 2 + b, 2, 8, '#f4f4f8'); p(25, 2 + b, 2, 3, '#2a2a2a'); p(13, 10 + b, 14, 2, '#d83030');
    for (let k = 0; k < 4; k++) twinkle(p, t + k, [3, 36, 5, 34][k], [10, 12, 40, 40][k], '#ffffff');
    return c;
  },
  Alicanto(t) {
    const c = canvas(), p = painter(c);
    // Ave del desierto de Atacama que come oro y plata: sus alas brillan de noche y guían a las minas
    p(0, 44, 40, 4, '#c8a878'); p(30, 40, 8, 4, '#a88858'); p(32, 41, 2, 1, '#ffd84a'); p(35, 42, 2, 1, '#d8e0e8');
    const b = bird(p, t, { col: '#e8c040', wing: '#c8d0d8', wing2: '#f4f8ff', belly: '#fff07a', tail: '#c8d0d8', beak: '#d8e0e8', eye: '#ffffff', leg: '#c8d0d8' });
    p(30, 10 + b, 4, 4, '#fff8c0'); p(31, 11 + b, 2, 2, '#ffffff');
    for (let k = 0; k < 4; k++) twinkle(p, t + k, [12, 20, 6, 26][k], [24, 22, 28, 30][k] + b, '#ffffff');
    return c;
  },
  'Teju Jagua'(t) {
    const c = canvas(), p = painter(c);
    // Lagarto enorme de siete cabezas de perro, guardián de las cuevas y los tesoros guaraníes
    p(0, 45, 40, 3, '#6a5a3a'); p(1, 42, 6, 3, '#e8c040'); twinkle(p, t, 3, 42);
    const b = bob(t), sw = Math.round(Math.sin(t * 3));
    p(0, 32 + sw, 6, 3, '#3c8c3c'); p(4, 30, 6, 4, '#3c8c3c');
    p(8, 26 + b, 22, 10, '#3c8c3c'); p(10, 34 + b, 18, 2, '#a8c870'); for (let i = 0; i < 5; i++) p(10 + i * 4, 27 + b, 2, 2, '#2c6c2c');
    [9, 15, 22, 27].forEach((x, i) => { p(x, 35, 3, 8, '#3c8c3c'); p(x - (i % 2), 43, 5, 1, '#2c5c2c'); });
    neck(p, 26, 28 + b, 26, 12 + b, '#3c8c3c', 4, 4); neck(p, 22, 28 + b, 14, 10 + b, '#3c8c3c', 4, 4); neck(p, 28, 30 + b, 30, 22 + b, '#3c8c3c', 3, 4);
    dogHead(p, t, 26, 4 + b, '#c8a070', '#ff3030', 0); dogHead(p, t, 10, 2 + b, '#c8a070', '#ff3030', 1); dogHead(p, t, 28, 16 + b, '#c8a070', '#ff3030', 2);
    return c;
  },
  'Boitatá'(t) {
    const c = canvas(), p = painter(c);
    // Serpiente de fuego de enormes ojos brillantes que protege los campos de los que los queman
    for (let k = 0; k < 6; k++) ember(p, t, 4 + k * 6, 44, k);
    const ys = serpent(p, t, { col: '#ff7a20', shade: '#e8501c', belly: '#ffd84a', eye: '#ffffff' });
    ys.forEach((y, i) => flame(p, t, 2 + i * 4, y - 3, i));
    p(29, 13, 5, 4, '#ffffff'); p(30, 14, 3, 2, '#fff8c0'); flame(p, t, 30, 9, 3); flame(p, t, 34, 10, 5);
    return c;
  },
  Cherufe(t) {
    const c = canvas(), p = painter(c);
    // Gigante de lava que vive en los volcanes mapuches y provoca erupciones y terremotos
    p(0, 42, 40, 6, '#3a2a2a'); for (let i = 0; i < 4; i++) p(3 + i * 10, 43, 5, 2, '#ff7a20');
    const b = giant(p, t, { skin: '#a84a28', shade: '#882a18', legs: '#a84a28', shoe: '#5a2a1a', eyes: '#ffd84a' });
    for (const [x, y] of [[12, 23], [22, 26], [16, 31], [6, 25], [32, 28], [25, 34]]) p(x, y + b, 3, 1, '#ffb040');
    p(17, 16 + b, 6, 2, '#ff7a20');
    for (let i = 0; i < 5; i++) flame(p, t, 13 + i * 3, 3 + b + (i % 2), i);
    for (let k = 0; k < 3; k++) ember(p, t, 4 + k * 15, 36, k);
    return c;
  },
  Mishipeshu(t) {
    const c = canvas(), p = painter(c);
    // Pantera de las aguas del lago Superior, con cuernos de cobre, púas en el lomo y cola larguísima
    p(0, 44, 40, 4, '#2c5c8c'); for (let i = 0; i < 4; i++) p((t * 4 + i * 10) % 40, 44, 4, 1, '#a8c8e8');
    const b = quad(p, t, { col: '#c87a40', shade: '#a85a28', belly: '#e8a060', head: 'cat', eye: '#ffd84a', hoof: '#a85a28', tail: false });
    for (let i = 0; i < 7; i++) p(7 + i * 3, 16 + b - (i % 2) * 2, 2, 5, '#e8c040');
    p(26, 4 + b, 2, 5, '#e8c040'); p(24, 2 + b, 3, 2, '#e8c040'); p(36, 4 + b, 2, 5, '#e8c040'); p(37, 2 + b, 3, 2, '#e8c040');
    const sw = Math.round(Math.sin(t * 3) * 2);
    for (let i = 0; i < 9; i++) p(5 - i * 0.5, 22 + i * 2 + (i > 5 ? sw : 0), 3, 3, i % 2 ? '#c87a40' : '#a85a28');
    for (let i = 0; i < 3; i++) p(2 - i, 26 + i * 4, 1, 2, '#e8c040');
    return c;
  },
  Ahuizotl(t) {
    const c = canvas(), p = painter(c);
    // Perrito negro del agua con una mano en la punta de la cola: arrastra a los pescadores al fondo
    p(0, 40, 40, 8, '#2c5c8c'); for (let i = 0; i < 4; i++) p((t * 4 + i * 10) % 40, 40, 4, 1, '#a8c8e8');
    const b = quad(p, t, { col: '#2a2a34', shade: '#1c1c24', belly: '#3a3a48', head: 'dog', eye: '#ff3030', hoof: '#1c1c24', tail: false });
    for (let i = 0; i < 5; i++) p(8 + i * 4, 19 + b - (i % 2), 1, 3, '#4a4a5a');
    const sw = Math.round(Math.sin(t * 3) * 2);
    p(4, 22 + b, 3, 2, '#2a2a34'); p(2, 18 + b, 2, 5, '#2a2a34'); p(1, 12 + b + sw, 2, 7, '#2a2a34');
    p(0, 8 + b + sw, 4, 5, '#6a6a7c'); for (let i = 0; i < 4; i++) p(i, 5 + b + sw, 1, 3, '#6a6a7c'); p(4, 10 + b + sw, 2, 1, '#6a6a7c');
    return c;
  },
  Curupira(t) {
    const c = canvas(), p = painter(c);
    // Guardián de la selva de pelo rojo y pies al revés: sus huellas engañan a los cazadores
    p(0, 45, 40, 3, '#4a6a2a'); p(0, 20, 5, 25, '#5a4a2a'); p(35, 18, 5, 27, '#5a4a2a'); p(0, 16, 8, 6, '#3c8c3c'); p(32, 14, 8, 6, '#3c8c3c');
    const b = dwarf(p, t, { robe: '#c8885c', robeShade: '#a8683c', skin: '#c8885c', legs: '#c8885c', shoe: '#c8885c', eyes: '#3c9c3c' });
    p(12, 35 + b, 16, 5, '#3c9c3c'); for (let i = 0; i < 4; i++) p(12 + i * 4, 39, 3, 3, '#2c8c2c');
    p(11, 10 + b, 18, 7, '#e8401c'); for (let i = 0; i < 5; i++) p(10 + i * 4, 6 + b + (i % 2) * 2, 3, 5, '#ff6a2c'); p(11, 16 + b, 3, 8, '#e8401c'); p(26, 16 + b, 3, 8, '#e8401c');
    p(10, 44, 6, 2, '#a8683c'); p(18, 44, 6, 2, '#a8683c'); p(9, 44, 1, 2, '#c8885c'); p(17, 44, 1, 2, '#c8885c');
    p(2, 46, 2, 1, '#2a3a1a'); p(6, 46, 2, 1, '#2a3a1a');
    return c;
  },
  Caipora(t) {
    const c = canvas(), p = painter(c);
    // Protectora de los animales del bosque que cabalga un pecarí y castiga a los cazadores codiciosos
    p(0, 45, 40, 3, '#4a6a2a');
    const sw = Math.floor(t * 3) % 2;
    p(22, 38, 16, 6, '#4a3a2a'); p(36, 39, 4, 3, '#4a3a2a'); p(39, 40, 1, 1, '#c8a0a0'); p(35, 38, 2, 2, DARK); p(24, 44, 2, 2 - sw, '#2a2a1a'); p(33, 44, 2, 1 + sw, '#2a2a1a'); p(24, 37, 10, 1, '#6a5a4a');
    const b = dwarf(p, t, { robe: '#6a4a30', robeShade: '#5a3a20', skin: '#6a4a30', legs: '#6a4a30', shoe: '#5a3a20', eyes: '#ffd84a' });
    p(12, 35 + b, 16, 5, '#5cac3c'); for (let i = 0; i < 4; i++) p(12 + i * 4, 39, 3, 3, '#3c8c2c');
    p(11, 10 + b, 18, 7, '#e8401c'); for (let i = 0; i < 5; i++) p(10 + i * 4, 6 + b + (i % 2) * 2, 3, 5, '#ff6a2c');
    p(7, 14 + b, 2, 31 - b, '#8a6a40'); p(6, 13 + b, 4, 2, '#5cac3c');
    return c;
  },
  Chullachaqui(t) {
    const c = canvas(), p = painter(c);
    // Duende de la selva que imita a tus seres queridos para perderte; lo delata su pie deforme
    p(0, 45, 40, 3, '#4a6a2a'); for (let i = 0; i < 3; i++) p(2 + i * 14, 30 - (i % 2) * 6, 3, 15 + (i % 2) * 6, '#3c7c3c');
    const b = figure(p, t, { robe: '#f4f4f0', robeShade: '#d8d8d0', skin: '#c8885c', legs: '#f4f4f0', shoe: '#8a6a40', hair: '#101018', eyes: '#3a2a1a' });
    p(21, 44, 7, 3, '#6a4a30'); p(26, 43, 2, 1, '#6a4a30');
    p(10, 9 + b, 20, 2, '#c8a060'); p(14, 5 + b, 12, 5, '#c8a060'); p(14, 8 + b, 12, 1, '#6a4a28');
    if (Math.floor(t * 3) % 3 === 0) p(18, 18 + b, 4, 2, '#5a1a1a');
    return c;
  },
  Madremonte(t) {
    const c = canvas(), p = painter(c);
    // Señora del monte, cubierta de musgo y hojas, que castiga a quien tala el bosque o roba ganado
    p(0, 45, 40, 3, '#3c5c2c');
    const b = figure(p, t, { robe: '#3c7c3c', robeShade: '#2c5c2c', dress: true, skin: '#7a9a5a', hair: '#4cac3c', longHair: true, eyes: '#ffd84a', armL: 'up', armR: 'up' });
    for (let i = 0; i < 6; i++) { p(10 + i * 4, 6 + b + (i % 2) * 2, 4, 4, i % 2 ? '#78d06c' : '#3c9c3c'); p(13 + i * 3, 28 + b + (i % 3) * 5, 3, 2, '#78d06c'); }
    p(10, 22 + b, 3, 14, '#4cac3c'); p(27, 22 + b, 3, 14, '#4cac3c');
    for (const x of [8, 28]) { p(x, 8 + b, 2, 6, '#7a9a5a'); p(x - 1, 6 + b, 1, 3, '#5a4a2a'); p(x + 2, 5 + b, 1, 3, '#5a4a2a'); }
    for (let k = 0; k < 3; k++) { const q = (t * 6 + k * 7) % 20; p(4 + k * 14 + Math.round(Math.sin(t * 2 + k) * 2), 4 + q * 2, 2, 2, '#78d06c'); }
    return c;
  },
  Piasa(t) {
    const c = canvas(), p = painter(c);
    // El pájaro que devora hombres pintado en los acantilados del Misisipi: cara humana, astas y escamas
    const b = quad(p, t, { col: '#3c8c4c', shade: '#2c6c3c', belly: '#a8c870', head: 'none', tail: false, hoof: '#e8e0c8' });
    sideWing(p, 18, 22 + b, '#c83030', '#e8c040', Math.floor(t * 3) % 2, -1, 7);
    for (let i = 0; i < 12; i++) p(5 - Math.round(Math.sin(i * 0.5) * 4), 22 + i * 1.8, 3, 3, i % 2 ? '#3c8c4c' : '#2c6c3c');
    p(4, 44, 4, 2, '#3c8c4c');
    p(25, 14 + b, 7, 10, '#3c8c4c');
    head(p, 28, 9 + b, { skin: '#e8c8a0', beard: '#5a3c20', eyes: '#c83030' });
    p(28, 4 + b, 2, 6, '#e8e0c8'); p(26, 3 + b, 2, 2, '#e8e0c8'); p(35, 4 + b, 2, 6, '#e8e0c8'); p(37, 3 + b, 2, 2, '#e8e0c8');
    return c;
  },
  Wakinyan(t) {
    const c = canvas(), p = painter(c);
    // Seres del trueno lakota: al abrir los ojos lanzan rayos y su batir de alas es el trueno
    p(0, 0, 40, 4, '#3a3c5c');
    frontBird(p, t, { wing: '#4a5a6a', wing2: '#7a8a9a', body: '#1c2c5c', belly: '#2c4c8c', eye: '#fff07a', beak: '#e8c040', tail: '#4a5a6a' });
    if (Math.floor(t * 4) % 2) { bolt(p, 4, 30); bolt(p, 36, 30); }
    return c;
  },
  Chenoo(t) {
    const c = canvas(), p = painter(c);
    // Gigante caníbal mi'kmaq con el corazón de hielo, antes humano, que vaga por los bosques nevados
    for (let k = 0; k < 6; k++) flake(p, t, 3 + k * 7, k);
    p(0, 45, 40, 3, '#e8f0f8');
    const b = giant(p, t, { skin: '#a8c8e0', shade: '#88a8c8', armor: '#7a7a84', armorShade: '#5a5a64', hair: '#f4f4f8', wild: true, eyes: '#ff3030', legs: '#7a7a84', shoe: '#5a5a64' });
    p(17, 16 + b, 6, 2, '#3a1a2a'); p(17, 15 + b, 1, 3, '#ffffff'); p(22, 15 + b, 1, 3, '#ffffff');
    const g = Math.floor(t * 3) % 2; p(18, 24 + b, 4, 4, g ? '#a8f0ff' : '#78d0f0'); p(19, 25 + b, 1, 1, '#ffffff');
    return c;
  },
  Kiwakwe(t) {
    const c = canvas(), p = painter(c);
    // Gigante de hielo abenaki que arranca árboles enteros y devora a los hombres en invierno
    p(0, 45, 40, 3, '#e8f0f8');
    const b = giant(p, t, { skin: '#c8dcec', shade: '#a8bcd0', robe: '#4a5a6a', belt: '#2a3a4a', hair: '#f4f4f8', wild: true, eyes: '#1c2c5c', armR: 'up', legs: '#c8dcec', shoe: '#a8bcd0' });
    p(17, 16 + b, 6, 2, '#3a1a2a'); p(17, 15 + b, 1, 3, '#ffffff'); p(22, 15 + b, 1, 3, '#ffffff');
    p(32, 0 + b, 3, 10, '#5a4a2a'); p(28, 0, 10, 3, '#3c7c4c'); p(30, 2, 8, 2, '#5c9c5c');
    for (let i = 0; i < 3; i++) p(30 + i * 2, 9 + b, 1, 3, '#5a4a2a');
    return c;
  },
  Wendigo(t) {
    const c = canvas(), p = painter(c);
    // Espíritu caníbal del invierno: esquelético, con cráneo de ciervo y astas, siempre hambriento
    for (let k = 0; k < 6; k++) flake(p, t, 3 + k * 7, k + 2);
    p(0, 45, 40, 3, '#e8f0f8');
    const pale = '#d8d0c8', bn = '#f4ecd8', b = bob(t);
    p(16, 30, 3, 15, pale); p(21, 30, 3, 15, pale); p(15, 44, 4, 1, '#5a5a5a'); p(21, 44, 4, 1, '#5a5a5a');
    p(14, 18 + b, 12, 13, pale); for (let i = 0; i < 4; i++) p(15, 20 + b + i * 3, 10, 1, '#a8a098');
    const w = Math.floor(t * 3) % 2;
    p(10, 18 + b, 3, 22, pale); p(27, 18 + b, 3, 22, pale);
    for (let i = 0; i < 3; i++) { p(9 + i, 40 + b + w, 1, 4, '#3a3a3a'); p(28 + i, 40 + b - w, 1, 4, '#3a3a3a'); }
    p(15, 6 + b, 10, 12, bn); p(17, 15 + b, 6, 4, bn); p(16, 9 + b, 3, 3, '#1c1010'); p(21, 9 + b, 3, 3, '#1c1010');
    const g = Math.floor(t * 4) % 2 ? '#ff3030' : '#c82020'; p(17, 10 + b, 1, 1, g); p(22, 10 + b, 1, 1, g);
    p(18, 17 + b, 4, 1, '#1c1010');
    p(14, 0 + b, 2, 7, bn); p(11, 1 + b, 3, 2, bn); p(10, 0 + b, 2, 2, bn); p(24, 0 + b, 2, 7, bn); p(26, 1 + b, 3, 2, bn); p(28, 0 + b, 2, 2, bn);
    return c;
  },
  'Lobisón'(t) {
    const c = canvas(), p = painter(c);
    // El séptimo hijo varón que en luna llena se convierte en un enorme perro-lobo
    disc(p, 8, 8, 6, '#f4f0c8'); p(5, 6, 2, 2, '#d8d4b0');
    p(0, 45, 40, 3, '#4a3a2a');
    const b = quad(p, t, { col: '#6a4a2a', shade: '#4a3018', belly: '#8a6a40', head: 'wolf', eye: '#ff3030', fangs: true, hoof: '#3a2a1a', tailc: '#4a3018' });
    for (let i = 0; i < 6; i++) p(8 + i * 4, 18 + b - (i % 2), 2, 3, '#4a3018');
    return c;
  },
  Nahual(t) {
    const c = canvas(), p = painter(c);
    // Brujo que se transforma en jaguar: aquí a medio camino entre hombre y fiera
    p(0, 45, 40, 3, '#4a6a2a');
    const b = figure(p, t, { robe: '#c8885c', robeShade: '#a8683c', skin: '#c8885c', legs: '#c8885c', shoe: '#a8683c' });
    p(13, 32 + b, 14, 9, '#f4f4f0'); p(13, 32 + b, 14, 2, '#d83030');
    animalHead(p, b, 'cat', '#d8a040');
    for (const [x, y] of [[15, 10], [23, 11], [14, 16], [24, 16]]) p(x, y + b, 2, 2, '#3a2a1a');
    p(16, 13 + b, 2, 2, '#ffd84a'); p(22, 13 + b, 2, 2, '#ffd84a');
    for (const [x, y] of [[10, 27], [28, 28], [11, 31]]) p(x, y + b, 1, 1, '#3a2a1a');
    for (let i = 0; i < 3; i++) p(10 + i, 35 + b, 1, 2, '#f4f4f0');
    return c;
  },
  Ucumar(t) {
    const c = canvas(), p = painter(c);
    // Hombre-oso de los montes argentinos, peludo y fortísimo, que grita «uhu, uhu» por la noche
    p(0, 45, 40, 3, '#5a4a3a');
    const b = giant(p, t, { skin: '#2a2a2a', shade: '#1a1a1a', legs: '#2a2a2a', shoe: '#1a1a1a', eyes: '#ffd84a' });
    for (let i = 0; i < 5; i++) p(11 + i * 4, 22 + b + (i % 2) * 5, 2, 5, '#3a3a3a');
    p(14, 4 + b, 4, 4, '#2a2a2a'); p(22, 4 + b, 4, 4, '#2a2a2a');
    p(16, 13 + b, 8, 6, '#6a5a4a'); p(19, 13 + b, 2, 2, DARK); p(18, 17 + b, 4, 1, '#3a1a1a');
    return c;
  },
  Mapinguari(t) {
    const c = canvas(), p = painter(c);
    // Gigante peludo de la Amazonía, de un solo ojo y con una boca enorme en la barriga
    p(0, 45, 40, 3, '#4a6a2a');
    const b = giant(p, t, { skin: '#a8582c', shade: '#884018', legs: '#a8582c', shoe: '#6a3010', oneEye: true, eyes: '#ff3030', hair: '#884018', wild: true });
    for (let i = 0; i < 5; i++) p(11 + i * 4, 20 + b + (i % 2) * 2, 2, 4, '#884018');
    const o = Math.floor(t * 3) % 2;
    p(14, 27 + b, 12, 6 + o, '#3a1010'); for (let i = 0; i < 5; i++) { p(15 + i * 2, 27 + b, 1, 2, '#ffffff'); p(15 + i * 2, 31 + b + o, 1, 2, '#ffffff'); }
    p(17, 16 + b, 6, 1, '#884018');
    for (let i = 0; i < 3; i++) { p(3 + i, 37 + b, 1, 3, '#f4ecd0'); p(32 + i, 37 + b, 1, 3, '#f4ecd0'); }
    return c;
  },
  Xiuhcoatl(t) {
    const c = canvas(), p = painter(c);
    // Serpiente de fuego, arma de Huitzilopochtli: con ella venció a sus cuatrocientos hermanos
    const ys = serpent(p, t, { col: '#2cb8c8', shade: '#1c98a8', belly: '#ff9c30', eye: '#ffd84a' });
    ys.forEach((y, i) => { if (i % 2 === 0) { p(2 + i * 4, y - 4, 2, 4, '#ff7a20'); p(3 + i * 4, y - 6, 2, 3, '#ffd84a'); } });
    p(28, 22, 6, 2, '#ff7a20'); p(28, 28, 6, 2, '#ff7a20');
    for (let i = 0; i < 3; i++) p(27 + i * 4, 8 - (i % 2), 2, 5, i % 2 ? '#ffd84a' : '#ff7a20');
    p(0, 32, 3, 3, '#e8c040'); p(0, 30, 2, 2, '#ff7a20');
    flame(p, t, 38, 14, 2);
    return c;
  },
  Thunderbird(t) {
    const c = canvas(), p = painter(c);
    // Ave del trueno de los pueblos del noroeste: sus alas mueven las nubes y sus ojos lanzan rayos
    p(0, 0, 40, 4, '#3a3c5c'); p(6, 3, 10, 2, '#3a3c5c'); p(24, 3, 10, 2, '#3a3c5c');
    const b = frontBird(p, t, { wing: '#c83030', wing2: '#8a5a30', body: '#8a5a30', belly: '#f0d040', head: '#c83030', eye: '#fff07a', beak: '#e8c040', tail: '#c83030' });
    for (let i = 0; i < 3; i++) { p(2 + i * 3, 15 + i * 3 + b, 2, 2, '#1c1c24'); p(36 - i * 3, 15 + i * 3 + b, 2, 2, '#1c1c24'); }
    p(15, 2 + b, 3, 3, '#c83030'); p(22, 2 + b, 3, 3, '#c83030');
    if (Math.floor(t * 4) % 2) { bolt(p, 6, 32); bolt(p, 34, 32); }
    return c;
  },
  Sachamama(t) {
    const c = canvas(), p = painter(c);
    // Serpiente gigantesca de la selva, tan quieta que le crecen plantas encima como si fuera un tronco
    p(0, 44, 40, 4, '#3a4a2a');
    const ys = serpent(p, t, { col: '#6a7a3a', shade: '#5a6a2a', belly: '#a8a868', eye: '#ffd84a' });
    ys.forEach((y, i) => { if (i % 2) { p(3 + i * 4, y - 4, 1, 4, '#4a8a2a'); p(1 + i * 4, y - 6, 5, 3, '#5cac3c'); } else p(2 + i * 4, y - 2, 3, 2, '#78c050'); });
    p(30, 18, 3, 10, '#8a8a4a'); p(28, 10, 4, 3, '#5cac3c'); p(36, 9, 3, 2, '#5cac3c'); p(33, 11, 1, 1, '#ffd84a');
    return c;
  },
  Sasquatch(t) {
    const c = canvas(), p = painter(c);
    // El gran simio peludo de los bosques del noroeste, que deja huellas enormes y nunca se deja fotografiar
    p(0, 45, 40, 3, '#4a5a2a'); p(0, 6, 5, 39, '#3a5a3a'); p(35, 10, 5, 35, '#3a5a3a'); p(0, 2, 8, 6, '#2c4c2c'); p(32, 6, 8, 6, '#2c4c2c');
    const b = giant(p, t, { skin: '#6a4a2a', shade: '#5a3a1a', hair: '#6a4a2a', legs: '#6a4a2a', shoe: '#4a3018', eyes: DARK });
    for (let i = 0; i < 5; i++) p(11 + i * 4, 21 + b + (i % 2) * 5, 2, 6, '#5a3a1a');
    p(15, 9 + b, 10, 10, '#a88868'); p(16, 11 + b, 2, 2, DARK); p(22, 11 + b, 2, 2, DARK); p(15, 9 + b, 10, 2, '#5a3a1a');
    p(18, 14 + b, 4, 2, '#7a5a3a'); p(17, 17 + b, 6, 1, '#3a2a1a');
    p(30, 46, 6, 2, '#3a2a1a');
    return c;
  },

  // ---------- Africanas ----------
  Tokoloshe(t) {
    const c = canvas(), p = painter(c);
    // Duende zulú calvo y travieso: por miedo a él la gente pone las camas sobre ladrillos
    p(0, 34, 40, 4, '#a87a50'); p(0, 33, 40, 1, '#c8a070'); p(2, 38, 6, 8, '#a84a30'); p(32, 38, 6, 8, '#a84a30'); p(2, 41, 6, 1, '#883a20'); p(32, 41, 6, 1, '#883a20');
    const b = dwarf(p, t, { robe: '#4a3020', robeShade: '#3a2010', skin: '#4a3020', legs: '#4a3020', shoe: '#3a2010', eyes: '#ff3030' });
    p(12, 35 + b, 16, 5, '#8a5a30');
    p(9, 18 + b, 4, 6, '#4a3020'); p(27, 18 + b, 4, 6, '#4a3020'); p(10, 20 + b, 2, 2, '#6a4a30'); p(28, 20 + b, 2, 2, '#6a4a30');
    p(15, 17 + b, 3, 1, '#6a4a30'); p(16, 20 + b, 3, 2, '#ff3030');
    p(17, 24 + b, 6, 2, '#2a1010'); p(17, 24 + b, 1, 2, '#ffffff'); p(22, 24 + b, 1, 2, '#ffffff');
    const pk = Math.floor(t * 2) % 2; if (pk) twinkle(p, t, 20, 12 + b, '#ff6060');
    return c;
  },
  Kongamato(t) {
    const c = canvas(), p = painter(c);
    // «El que rompe las barcas»: reptil volador de los ríos de Zambia, de alas de piel y pico dentado
    p(0, 42, 40, 6, '#3c6c5c'); for (let i = 0; i < 4; i++) p((t * 4 + i * 10) % 40, 42, 4, 1, '#8ab8a8');
    p(2, 44, 10, 2, '#8a5a30'); p(4, 43, 6, 1, '#6a4a28');
    const y = Math.round(Math.sin(t * 2) * 2), fl = Math.floor(t * 3) % 2;
    for (const d of [-1, 1]) for (let i = 0; i < 14; i++) {
      const x = d < 0 ? 15 - i : 25 + i, top = 18 + y - Math.round(i * (fl ? 0.3 : 0.9)), bot = 26 + y - Math.round(i * 0.5);
      p(x, top, 1, Math.max(1, bot - top), '#a85a30'); p(x, top, 1, 1, '#6a3a18');
    }
    p(15, 16 + y, 10, 12, '#c86a38'); p(17, 26 + y, 2, 6, '#a85a30'); p(22, 26 + y, 2, 6, '#a85a30');
    p(16, 8 + y, 8, 9, '#c86a38'); p(18, 3 + y, 4, 6, '#a85a30');
    p(17, 11 + y, 2, 2, '#ffd84a'); p(22, 11 + y, 2, 2, '#ffd84a');
    p(18, 17 + y, 4, 6, '#c86a38'); p(18, 22 + y, 4, 1, '#3a1a10'); p(18, 19 + y, 1, 1, '#ffffff'); p(21, 20 + y, 1, 1, '#ffffff');
    return c;
  },
  Impundulu(t) {
    const c = canvas(), p = painter(c);
    // Ave del rayo xhosa, blanca y negra, que baja con la tormenta y deja la tierra quemada
    p(0, 0, 40, 5, '#3a3c5c'); p(6, 4, 12, 2, '#3a3c5c'); p(24, 4, 10, 2, '#3a3c5c');
    const b = bird(p, t, { col: '#f4f4f8', wing: '#1c1c24', wing2: '#4a4a5a', belly: '#ffffff', tail: '#1c1c24', beak: '#e8c040', eye: '#ff3030', leg: '#e8c040' });
    if (Math.floor(t * 4) % 2) { bolt(p, 4, 8); bolt(p, 36, 24); p(28, 44, 6, 1, '#3a2a1a'); }
    for (let k = 0; k < 2; k++) twinkle(p, t + k, 8 + k * 24, 34, '#fff07a');
    return c;
  },
  Abada(t) {
    const c = canvas(), p = painter(c);
    // Pequeño unicornio del Congo con cola de jabalí: su cuerno cura los venenos
    p(0, 45, 40, 3, '#a89060');
    const b = quad(p, t, { col: '#c8a070', shade: '#a88050', belly: '#e8d0a8', head: 'horse', mane: '#8a6040', eye: DARK, hoof: '#5a4a30', tailc: '#5a4a30' });
    p(32, 1 + b, 2, 8, '#f4ecd0'); p(33, 0 + b, 1, 2, '#f4ecd0'); p(31, 6 + b, 2, 2, '#d8c8a8');
    p(1, 22 + b, 3, 2, '#5a4a30');
    return c;
  },
  Sasabonsam(t) {
    const c = canvas(), p = painter(c);
    // Vampiro ashanti de alas de murciélago y dientes de hierro que caza desde las copas de los árboles
    p(0, 0, 40, 4, '#5a3c20'); p(0, 3, 10, 2, '#3c7c3c'); p(30, 3, 10, 2, '#3c7c3c');
    const y = 0, fl = Math.floor(t * 3) % 2;
    for (const d of [-1, 1]) for (let i = 0; i < 13; i++) {
      const x = d < 0 ? 12 - i : 27 + i, top = 22 - Math.round(i * (fl ? 0.4 : 1.0)), bot = 32 - Math.round(i * 0.4) - (i % 4 === 3 ? 2 : 0);
      p(x, top, 1, Math.max(1, bot - top), '#2a2a34'); p(x, top, 1, 1, '#5a5a6a');
    }
    const b = figure(p, t, { robe: '#5a3c2a', robeShade: '#4a2c1a', skin: '#5a3c2a', legs: '#5a3c2a', shoe: '#5a3c2a', eyes: '#ff3030', hair: '#101018' });
    p(13, 32 + b, 14, 9, '#c83030');
    p(17, 18 + b, 6, 2, '#2a1010'); p(17, 18 + b, 1, 2, '#a8b0b8'); p(19, 18 + b, 1, 2, '#a8b0b8'); p(22, 18 + b, 1, 2, '#a8b0b8');
    p(13, 44, 2, 2, '#e8e0c8'); p(25, 44, 2, 2, '#e8e0c8'); p(9, 35 + b, 1, 2, '#e8e0c8'); p(30, 35 + b, 1, 2, '#e8e0c8');
    return c;
  },
  Grootslang(t) {
    const c = canvas(), p = painter(c);
    // Bestia primordial, mitad elefante y mitad serpiente, que guarda diamantes en una cueva sin fondo
    p(0, 0, 40, 6, '#3a3a44'); p(0, 6, 4, 38, '#3a3a44'); p(36, 6, 4, 38, '#3a3a44'); p(0, 44, 40, 4, '#4a4a54');
    for (const [x, y] of [[6, 41], [30, 42], [33, 10]]) { p(x, y, 3, 2, '#a8f0ff'); twinkle(p, t + x, x + 1, y - 1, '#ffffff'); }
    const b = quad(p, t, { col: '#5a6a7a', shade: '#4a5a6a', belly: '#6a7a8a', head: 'none', hoof: '#3a4a5a', tail: false });
    const sw = Math.round(Math.sin(t * 3) * 2);
    for (let i = 0; i < 8; i++) p(5 - Math.round(Math.sin(i * 0.6) * 2), 22 + i * 2.5, 3, 3, i % 2 ? '#5a6a7a' : '#4a5a6a');
    snakeHead(p, t, 6 + sw, 40, '#5a6a7a', '#8a9aaa', '#ffd84a', 1);
    p(24, 11 + b, 12, 13, '#5a6a7a'); p(21, 12 + b, 6, 10, '#4a5a6a'); p(30, 14 + b, 2, 2, '#ffd84a');
    p(34, 18 + b, 4, 4, '#5a6a7a'); p(36, 22 + b, 3, 8, '#5a6a7a'); p(35, 29 + b, 3, 2, '#5a6a7a'); p(32, 22 + b, 4, 2, '#f4f4e8');
    return c;
  },
  'Mokele-mbembe'(t) {
    const c = canvas(), p = painter(c);
    // «El que detiene los ríos»: bestia enorme de cuello larguísimo que vive en los pantanos del Congo
    const b = quad(p, t, { col: '#6a7a6a', shade: '#5a6a5a', belly: '#8a9a8a', head: 'none', hoof: '#4a5a4a', tailc: '#5a6a5a' });
    [7, 12, 22, 27].forEach((x) => p(x, 32, 5, 12, '#5a6a5a'));
    p(4, 16 + b, 28, 18, '#6a7a6a'); p(6, 14 + b, 22, 3, '#6a7a6a');
    const sw = Math.round(Math.sin(t * 1.5) * 2);
    neck(p, 26, 18 + b, 31 + sw, 3 + b, '#6a7a6a', 8, 5);
    p(29 + sw, 0 + b, 10, 5, '#6a7a6a'); p(35 + sw, 1 + b, 2, 1, DARK); p(32 + sw, 4 + b, 6, 1, '#4a5a4a');
    p(0, 36, 40, 12, '#3c6c5c'); p(0, 35, 40, 2, '#5c8c7c'); for (let i = 0; i < 4; i++) p((t * 3 + i * 10) % 40, 36, 4, 1, '#a8c8b8');
    p(2, 30, 2, 6, '#3c7c3c'); p(36, 28, 2, 8, '#3c7c3c'); p(1, 28, 4, 2, '#5cac3c'); p(35, 26, 4, 2, '#5cac3c');
    return c;
  },
  'Ninki Nanka'(t) {
    const c = canvas(), p = painter(c);
    // Dragón de los pantanos de Gambia, con una cresta brillante como un espejo: verlo trae desgracia
    p(0, 44, 40, 4, '#3c5c3c'); for (let i = 0; i < 5; i++) p(2 + i * 8, 40, 2, 4, '#5c8c3c');
    const b = dragon(p, t, { col: '#3c9c4c', shade: '#2c7c3c', belly: '#e8d070', wings: false, eye: '#ffd84a', spike: '#e8d070', horn: '#e8d070' });
    p(26, 2 + b, 8, 3, '#c8e8f0'); p(27, 3 + b, 3, 1, '#ffffff'); twinkle(p, t, 32, 2 + b, '#ffffff');
    return c;
  },
  // ---------- Oceánicas ----------
  Menehune(t) {
    const c = canvas(), p = painter(c);
    // Hombrecillos hawaianos que construyen estanques y templos de piedra en una sola noche
    p(0, 45, 40, 3, '#5a5a4a'); p(30, 38, 10, 7, '#7a7a6a'); p(32, 34, 7, 4, '#8a8a7a'); p(31, 41, 8, 1, '#5a5a4a');
    const b = dwarf(p, t, { robe: '#a8683c', robeShade: '#8a5028', skin: '#a8683c', legs: '#a8683c', shoe: '#8a5028', hair: '#101018', eyes: '#101018' });
    p(12, 35 + b, 16, 5, '#c83030'); p(12, 35 + b, 16, 1, '#e8c040');
    p(12, 13 + b, 16, 4, '#101018'); p(12, 16 + b, 2, 5, '#101018'); p(26, 16 + b, 2, 5, '#101018');
    const sw = Math.floor(t * 3) % 2;
    p(30, 18 + b + sw * 4, 2, 14, '#8a6a40'); p(28, 16 + b + sw * 4, 6, 3, '#5a5a6a');
    if (sw) { p(34, 33, 1, 1, '#c8c8b8'); p(36, 31, 1, 1, '#c8c8b8'); }
    return c;
  },
  Hakawai(t) {
    const c = canvas(), p = painter(c);
    // Ave misteriosa maorí que solo se oye de noche, bajando en picado desde el cielo con un rugido
    for (const [x, y] of [[4, 4], [30, 6], [36, 24], [8, 30]]) twinkle(p, t + x, x, y, '#fff8c0');
    const b = bird(p, t, { col: '#1c1c24', wing: '#4a5a6a', wing2: '#7a8a9a', belly: '#2a2a34', tail: '#3a4a5a', beak: '#5a5a6a', eye: '#ffd84a', leg: '#5a5a6a' });
    p(36, 14 + b, 4, 1, '#5a5a6a'); p(38, 15 + b, 2, 1, '#5a5a6a');
    if (Math.floor(t * 3) % 3 === 0) { p(1, 12, 3, 1, '#c8d8e8'); p(0, 15, 4, 1, '#c8d8e8'); p(1, 18, 3, 1, '#c8d8e8'); }
    return c;
  },
  Patupaiarehe(t) {
    const c = canvas(), p = painter(c);
    // Pueblo de las hadas maoríes, de piel clara y pelo rojo, que viven en la niebla de las montañas y tocan la flauta
    const b = figure(p, t, { robe: '#f4f4f0', robeShade: '#d8d8d0', skin: '#f4e0d8', legs: '#f4e0d8', shoe: '#d8c8c0', hair: '#d8502c', longHair: true, eyes: '#3c8c5c', armR: 'up' });
    for (let i = 0; i < 4; i++) p(13 + i * 4, 38, 2, 3, '#c8c0b0');
    p(24, 15 + b, 7, 2, '#8a6a40'); p(30, 14 + b, 2, 4, '#8a6a40');
    const n = (t * 6) % 12; p(33 + n * 0.3, 12 - n, 2, 2, '#f4f4f8'); p(34 + n * 0.3, 8 - n, 1, 4, '#f4f4f8');
    const d = Math.round(Math.sin(t) * 3);
    p(0 + d, 38, 16, 3, '#d8e0e8'); p(22 - d, 41, 18, 3, '#d8e0e8'); p(4 - d, 44, 20, 2, '#c8d0d8');
    return c;
  },
  Bunyip(t) {
    const c = canvas(), p = painter(c);
    // Bestia de los pantanos australianos que ruge de noche desde el fondo de las charcas
    p(0, 30, 40, 18, '#3c5c4c'); p(0, 29, 40, 2, '#5c8c7c'); for (let i = 0; i < 4; i++) p((t * 3 + i * 10) % 40, 30, 4, 1, '#a8c8b8');
    p(1, 22, 2, 8, '#6a8a3a'); p(36, 20, 2, 10, '#6a8a3a'); p(0, 20, 4, 3, '#8aaa4a'); p(35, 18, 4, 3, '#8aaa4a');
    const y = Math.round(Math.sin(t * 2) * 2);
    p(6, 24 + y, 24, 10, '#6a4a2a'); p(8, 22 + y, 18, 3, '#6a4a2a'); p(4, 28 + y, 4, 4, '#5a3a1a'); p(1, 30 + y, 4, 2, '#5a3a1a');
    p(22, 12 + y, 14, 14, '#6a4a2a'); p(32, 18 + y, 7, 7, '#8a6a40'); p(37, 19 + y, 2, 2, DARK);
    p(26, 10 + y, 3, 4, '#6a4a2a'); p(30, 10 + y, 3, 4, '#6a4a2a'); p(28, 15 + y, 2, 2, '#ffd84a'); p(28, 15 + y, 1, 1, DARK);
    const o = Math.floor(t * 3) % 3 === 0 ? 2 : 0;
    p(32, 24 + y, 7, 1 + o, '#3a1a1a'); p(33, 23 + y, 1, 3, '#f4f4e8'); p(37, 23 + y, 1, 3, '#f4f4e8');
    p(0, 34, 40, 14, '#3c5c4c');
    return c;
  },
  Pouakai(t) {
    const c = canvas(), p = painter(c);
    // Águila gigante maorí que se lanzaba sobre los hombres; existió de verdad: el águila de Haast
    p(0, 44, 40, 4, '#5a6a4a');
    const b = bird(p, t, { col: '#1c1c24', wing: '#2a2a34', wing2: '#f4f4f8', belly: '#3a3a44', tail: '#f4f4f8', beak: '#e8c040', eye: '#ffd84a', leg: '#e8c040' });
    p(24, 18 + b, 8, 3, '#f4f4f8'); p(38, 15 + b, 2, 3, '#e8c040'); p(30, 9 + b, 4, 1, '#3a3a44');
    for (let i = 0; i < 3; i++) { p(13 + i * 2, 44, 1, 2, '#e8c040'); p(19 + i * 2, 44, 1, 2, '#e8c040'); }
    return c;
  },
  Yowie(t) {
    const c = canvas(), p = painter(c);
    // Gran simio peludo de los bosques de eucaliptos australianos, alto como dos hombres
    p(0, 45, 40, 3, '#a85a30'); p(0, 10, 4, 35, '#d8d0c0'); p(36, 14, 4, 31, '#d8d0c0'); p(0, 6, 9, 5, '#7a9a6a'); p(31, 10, 9, 5, '#7a9a6a');
    const b = giant(p, t, { skin: '#7a5030', shade: '#6a4020', hair: '#7a5030', legs: '#7a5030', shoe: '#5a3018', eyes: '#ffd84a' });
    for (let i = 0; i < 5; i++) p(11 + i * 4, 21 + b + (i % 2) * 5, 2, 6, '#6a4020');
    p(15, 9 + b, 10, 10, '#b89878'); p(16, 11 + b, 2, 2, DARK); p(22, 11 + b, 2, 2, DARK); p(15, 9 + b, 10, 2, '#6a4020');
    p(18, 14 + b, 4, 2, '#8a6a4a'); p(17, 17 + b, 6, 1, '#3a2a1a');
    return c;
  },

};

/** Fotograma i de la animación de una bestia rediseñada (con contorno), o null si no tiene diseño propio. */
export function beastFrame(name, i = 0) {
  const draw = BEAST_ART[name];
  if (!draw) return null;
  return outline(draw((i * GOD_FRAME_MS) / 1000));
}
