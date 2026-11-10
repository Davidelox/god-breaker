// Sprites pixel art generados por código. Las bestias se dibujan con src/gfx/beastArt.js.
// Cada criatura usa su id como semilla, así que su forma es siempre la misma.
import Phaser from 'phaser';
import { creatureById } from '../data/creatures.js';
import { drawBeast, goldCanvas } from './beastArt.js';
import { CUSTOM_CREATURE_IMAGES, CUSTOM_BALL_IMAGES } from '../data/pack.js';
import { AVATARS, AVATAR_STYLES, avatarOrb } from '../data/profile.js';

// Las imágenes de un pack se guardan a CUSTOM_RES veces la resolución de los sprites generados
// para no perder detalle; texScale() compensa esa diferencia al dibujarlas.
const CUSTOM_RES = 4;
const TEX_RES = new Map();
let textures = null;

/** Factor de escala para que cualquier textura se vea al tamaño de un sprite generado. */
export const texScale = (key) => 1 / (TEX_RES.get(key) ?? 1);

/**
 * Clave de textura de una criatura. Las texturas se crean bajo demanda (con 1000+ criaturas
 * no merece la pena generarlas todas al arrancar): imagen del pack si existe, si no, sprite generado.
 */
export function creatureKey(id, shiny) {
  const key = `cr_${id}${shiny ? '_s' : ''}`;
  if (textures && !textures.exists(key)) buildCreatureTexture(Number(id), shiny, key);
  return key;
}

/** Añade la imagen de una criatura con la escala corregida. */
export function addCreatureImage(scene, x, y, id, shiny, scale) {
  const key = creatureKey(id, shiny);
  return scene.add.image(x, y, key).setScale(scale * texScale(key));
}

// Caja en «píxeles de sprite» donde se encaja la imagen del pack (igual que los generados)
const BOX = { normal: [14, 17], legendary: [18, 21] };

function fitImage(source, box, gold) {
  const [bw, bh] = box;
  const canvas = document.createElement('canvas');
  canvas.width = bw * CUSTOM_RES;
  canvas.height = bh * CUSTOM_RES;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  const k = Math.min(canvas.width / source.width, canvas.height / source.height);
  const w = Math.round(source.width * k);
  const h = Math.round(source.height * k);
  ctx.drawImage(source, Math.round((canvas.width - w) / 2), canvas.height - h, w, h);
  return gold ? goldCanvas(canvas) : canvas;
}

function buildCreatureTexture(id, shiny, key) {
  const c = creatureById(id);
  if (!c) return;
  const custom = CUSTOM_CREATURE_IMAGES.get(id);
  if (custom && textures.exists(custom.normal)) {
    const useShinyImg = shiny && custom.shiny && textures.exists(custom.shiny);
    const src = textures.get(useShinyImg ? custom.shiny : custom.normal).getSourceImage();
    textures.addCanvas(key, fitImage(src, c.legendary ? BOX.legendary : BOX.normal, shiny && !useShinyImg));
    TEX_RES.set(key, CUSTOM_RES);
    return;
  }
  textures.addCanvas(key, drawCreature(c, shiny));
  TEX_RES.set(key, BEAST_RES);
}

const OUTLINE = '#1a1a24';

// Las bestias se dibujan al doble de resolución que la caja (14x17, legendarias 18x21)
// para tener más detalle; texScale() compensa el tamaño.
const BEAST_RES = 2;

/** Lienzo del sprite generado de una bestia (a partir de su descriptor «art»). */
export function drawCreature(c, shiny) {
  const [bw, bh] = c.legendary ? BOX.legendary : BOX.normal;
  const canvas = drawBeast(c.art ?? 'wisp', bw * BEAST_RES, bh * BEAST_RES, c.id);
  return shiny ? goldCanvas(canvas) : canvas; // «shiny» = versión dorada
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

// Bolas de lanzamiento bicolor: A = anillo, B = núcleo, h = brillo
// Orbes del cazador: esfera de cristal con brillo arriba a la izquierda y sombra abajo.
const BALL_2 = ['..AAAA..', '.ALLBBA.', 'ALhLBBBA', 'ALLBBBDA', 'ABBBBBDA', 'ABBBBDDA', '.ABDDDA.', '..AAAA..'];
const BALL_COLORS = {
  normal: { A: '#061820', L: '#b8faff', B: '#30d8f0', D: '#1a8cb0', h: '#ffffff' },
  super: { A: '#12062c', L: '#e0d0ff', B: '#9a5cf8', D: '#5c30b8', h: '#ffffff' },
  ultra: { A: '#2a1602', L: '#fff4b0', B: '#ffc820', D: '#c88010', h: '#ffffff' }
};
const BALL = ['..kkkk..', '.kWWWWk.', 'kWWWWWgk', 'kWWWWWgk', 'kWWWWWgk', 'kWWWWggk', '.kggggk.', '..kkkk..'];
const ORB = [
  '....kk....', '...kCCk...', '..kCWCCk..', '.kCWCCCCk.', 'kCWCCCCCCk', 'kCCCCCCCDk',
  'kCCCCCCCDk', '.kCCCCCDk.', '..kCCCDk..', '...kCDk...', '....kk....'
];
const SPARK = ['..W..', '..W..', 'WWYWW', '..W..', '..W..'];
const PICKUP = ['..GGGG..', '.G....G.', 'G..WW..G', 'G.WWWW.G', 'G.WWWW.G', 'G..WW..G', '.G....G.', '..GGGG..'];
const ROCK = ['.kkkk.', 'kRRRrk', 'kRRrrk', 'kRrrrk', '.kkkk.'];

// ---------- Bloques del tablero (rendimiento) ----------
// Antes cada bloque era un rectángulo (forma) + un texto con su propia textura. En WebGL cada cambio
// entre formas e imágenes corta el lote de dibujo, y cada texto nuevo se rasteriza y sube a la GPU:
// con muchos bloques y dioses eso daba tirones en móvil. Ahora el fondo es una imagen y el número
// de vida usa una fuente de mapa de bits, así todo se dibuja en muy pocos lotes.

export const HP_FONT = 'hpfont';
const HP_GLYPH = 20; // celda de cada cifra (16 px de letra + 2 px de contorno por lado)

function makeHpFont(scene) {
  const chars = '0123456789';
  const canvas = document.createElement('canvas');
  canvas.width = HP_GLYPH * chars.length;
  canvas.height = HP_GLYPH;
  const ctx = canvas.getContext('2d');
  ctx.font = '16px "Press Start 2P", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#101828';
  ctx.fillStyle = '#f8f8f8';
  [...chars].forEach((ch, i) => {
    const x = i * HP_GLYPH + HP_GLYPH / 2, y = HP_GLYPH / 2 + 1;
    ctx.strokeText(ch, x, y);
    ctx.fillText(ch, x, y);
  });
  scene.textures.addCanvas(HP_FONT, canvas);
  const data = Phaser.GameObjects.RetroFont.Parse(scene, {
    image: HP_FONT, width: HP_GLYPH, height: HP_GLYPH, chars, charsPerRow: chars.length,
    spacing: { x: 0, y: 0 }, offset: { x: 0, y: 0 }, lineSpacing: 0
  });
  scene.cache.bitmapFont.add(HP_FONT, data);
}

/** Sombra de los bloques: la textura es BLOCK_SHADOW px más grande abajo a la derecha. */
export const BLOCK_SHADOW = 3;
/** Origen (x o y) para que el bloque (sin la sombra) quede centrado en su posición. */
export const blockBgOrigin = (size) => (size - 2) / 2 / (size - 2 + BLOCK_SHADOW);

/** Mezcla un color hacia blanco (f > 0) o negro (f < 0). */
function tone(c, f) {
  const ch = (v) => Math.round(f >= 0 ? v + (255 - v) * f : v * (1 + f));
  const r = ch((c >> 16) & 255), g = ch((c >> 8) & 255), b = ch(c & 255);
  return `rgb(${r},${g},${b})`;
}

/**
 * Textura del fondo de un bloque, estilo pixel art, creada una vez por combinación:
 * sombra proyectada, borde con esquinas recortadas, bisel (luz arriba-izquierda, sombra
 * abajo-derecha), textura de piedra tramada y un brillo en la esquina.
 */
export function blockBgKey(scene, fill, border, size, height = size) {
  const key = `blkbg2_${fill.toString(16)}_${border.toString(16)}_${size}x${height}`;
  if (scene.textures.exists(key)) return key;
  const s = size - 2, t = height - 2; // ancho y alto del bloque (los dioses son 3x2)
  const canvas = document.createElement('canvas');
  canvas.width = s + BLOCK_SHADOW;
  canvas.height = t + BLOCK_SHADOW;
  const ctx = canvas.getContext('2d');
  const rect = (x, y, w, h, color) => {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
  };
  // Silueta con las esquinas recortadas (1 px)
  const shape = (o, color) => {
    rect(o + 1, o, s - 2, t, color);
    rect(o, o + 1, s, t - 2, color);
  };
  shape(BLOCK_SHADOW, 'rgba(4,6,14,0.45)');
  shape(0, `#${border.toString(16).padStart(6, '0')}`);
  // Cuerpo
  const i0 = 2, iw = s - 4, ih = t - 4;
  rect(i0, i0, iw, ih, tone(fill, 0));
  // Textura: trama de píxeles más oscuros y alguna mancha, fija para cada color
  let seed = (fill * 2654435761) >>> 0;
  const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
  ctx.fillStyle = tone(fill, -0.1);
  for (let y = i0 + 3; y < i0 + ih - 3; y += 4) {
    for (let x = i0 + 3 + ((y >> 2) % 2) * 2; x < i0 + iw - 3; x += 4) if (rnd() < 0.35) ctx.fillRect(x, y, 1, 1);
  }
  for (let k = 0; k < Math.round(Math.sqrt(iw * ih) / 12); k++) {
    const x = i0 + 4 + Math.floor(rnd() * (iw - 10)), y = i0 + 4 + Math.floor(rnd() * (ih - 10));
    rect(x, y, 2, 1, tone(fill, -0.14));
    rect(x, y + 1, 1, 1, tone(fill, -0.14));
    rect(x + 1, y - 1, 2, 1, tone(fill, 0.18));
  }
  // Bisel: luz arriba e izquierda, sombra abajo y derecha (2 px, con escalón en las esquinas)
  rect(i0, i0, iw, 2, tone(fill, 0.38));
  rect(i0, i0, 2, ih, tone(fill, 0.26));
  rect(i0, i0 + ih - 2, iw, 2, tone(fill, -0.32));
  rect(i0 + iw - 2, i0 + 2, 2, ih - 2, tone(fill, -0.22));
  rect(i0 + 2, i0 + 2, iw - 6, 1, tone(fill, 0.16));
  // Brillo de la esquina
  rect(i0 + 3, i0 + 3, 3, 1, 'rgba(255,255,255,0.85)');
  rect(i0 + 3, i0 + 4, 1, 2, 'rgba(255,255,255,0.85)');
  scene.textures.addCanvas(key, canvas);
  return key;
}

/** Recolorea un lienzo con un mapa de degradado (de oscuro a claro) según la luminosidad. */
function gradientMap(src, stops) {
  const c = document.createElement('canvas');
  c.width = src.width;
  c.height = src.height;
  const ctx = c.getContext('2d');
  ctx.drawImage(src, 0, 0);
  const img = ctx.getImageData(0, 0, c.width, c.height);
  const cols = stops.map((h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] === 0) continue;
    const l = Math.min(0.999, (0.3 * d[i] + 0.59 * d[i + 1] + 0.11 * d[i + 2]) / 255) * (cols.length - 1);
    const k = Math.floor(l), f = l - k;
    for (let j = 0; j < 3; j++) d[i + j] = Math.round(cols[k][j] + (cols[k + 1][j] - cols[k][j]) * f);
  }
  ctx.putImageData(img, 0, 0);
  return c;
}

/** Recorta un lienzo a la caja de sus píxeles visibles. */
function trimCanvas(src) {
  const ctx = src.getContext('2d');
  const { data, width, height } = ctx.getImageData(0, 0, src.width, src.height);
  let x0 = width, y0 = height, x1 = -1, y1 = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * 4 + 3] === 0) continue;
      x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y);
    }
  }
  if (x1 < 0) return src;
  const c = document.createElement('canvas');
  c.width = x1 - x0 + 1;
  c.height = y1 - y0 + 1;
  c.getContext('2d').drawImage(src, -x0, -y0);
  return c;
}

/**
 * Retrato de la mascota celestial (48x56): marco de oro, cielo profundo con estrellas y nebulosa,
 * y el animal luminoso (recoloreado con su paleta) con halo y estrellas por el cuerpo.
 */
export function avatarKey(scene, id) {
  const key = `avatar_${id}`;
  if (scene.textures.exists(key)) return key;
  const a = AVATARS[id];
  const stops = AVATAR_STYLES[a.style];
  const w = 48, h = 56;
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  // Marco de oro
  ctx.fillStyle = '#6a3e0c';
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#d8a030';
  ctx.fillRect(1, 1, w - 2, h - 2);
  ctx.fillStyle = '#ffe27a';
  ctx.fillRect(1, 1, w - 2, 1);
  // Cielo con nebulosa y estrellas
  ctx.fillStyle = '#05060f';
  ctx.fillRect(4, 4, w - 8, h - 8);
  let seed = [...id].reduce((s, ch) => s + ch.charCodeAt(0), 7);
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  ctx.fillStyle = stops[1];
  for (let i = 0; i < 6; i++) {
    ctx.globalAlpha = 0.18;
    const r = 6 + rnd() * 8;
    ctx.fillRect(Math.round(8 + rnd() * (w - 24)), Math.round(8 + rnd() * (h - 24)), r, r * 0.7);
  }
  ctx.globalAlpha = 1;
  for (let i = 0; i < 22; i++) {
    ctx.fillStyle = rnd() < 0.3 ? stops[3] : '#8890b0';
    ctx.fillRect(4 + Math.floor(rnd() * (w - 8)), 4 + Math.floor(rnd() * (h - 8)), 1, 1);
  }
  // Animal: recortado, recoloreado y escalado a entero para llenar el marco
  // Se dibuja a doble resolución para que el animal llene el marco con más detalle
  let art = trimCanvas(gradientMap(drawBeast(a.art, 72, 84, 101), stops));
  const fit = Math.min((w - 10) / art.width, (h - 12) / art.height);
  const k = fit >= 1 ? Math.floor(fit) : fit;
  const dw = art.width * k, dh = art.height * k;
  const dx = Math.round((w - dw) / 2), dy = Math.round((h - dh) / 2) + 2;
  // Halo luminoso alrededor de la silueta (como un espíritu)
  const glow = document.createElement('canvas');
  glow.width = art.width;
  glow.height = art.height;
  const gctx = glow.getContext('2d');
  gctx.drawImage(art, 0, 0);
  gctx.globalCompositeOperation = 'source-in';
  gctx.fillStyle = stops[2];
  gctx.fillRect(0, 0, glow.width, glow.height);
  ctx.globalAlpha = 0.45;
  for (const [ox, oy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) ctx.drawImage(glow, dx + ox * k, dy + oy * k, dw, dh);
  ctx.globalAlpha = 1;
  ctx.drawImage(art, dx, dy, dw, dh);
  // Estrellas sobre el cuerpo (solo encima del animal)
  const stars = document.createElement('canvas');
  stars.width = dw;
  stars.height = dh;
  const sctx = stars.getContext('2d');
  sctx.drawImage(art, 0, 0, dw, dh);
  sctx.globalCompositeOperation = 'source-atop';
  sctx.fillStyle = '#ffffff';
  for (let i = 0; i < 7; i++) sctx.fillRect(Math.floor(rnd() * dw), Math.floor(rnd() * dh), 1, 1);
  ctx.drawImage(stars, dx, dy);
  // Remaches
  ctx.fillStyle = '#ffe27a';
  for (const [x, y] of [[2, 2], [w - 4, 2], [2, h - 4], [w - 4, h - 4]]) ctx.fillRect(x, y, 2, 2);
  scene.textures.addCanvas(key, c);
  return key;
}

// Marcas dentro del orbe (coordenadas en la esfera de 8x8), en blanco brillante
const ORB_MARKS = {
  paw: [[3, 3], [5, 3], [4, 5], [3, 5], [5, 5]],
  moon: [[4, 2], [3, 3], [3, 4], [4, 5]],
  star: [[4, 2], [3, 4], [4, 3], [4, 4], [5, 4], [4, 5]],
  eye: [[3, 4], [4, 4], [5, 4], [4, 3], [4, 5]],
  wave: [[2, 4], [3, 3], [4, 4], [5, 3]],
  ring: [[3, 3], [4, 3], [3, 5], [4, 5], [2, 4], [5, 4]]
};

/**
 * Orbe de una mascota (8x8, el mismo tamaño que el común): esfera luminosa con su paleta (borde de
 * su tono medio en lugar de oscuro, cuerpo brillante), su símbolo en blanco y destellos dentro.
 */
export function petOrbKey(scene, id) {
  const key = `orb_pet_${id}`;
  if (scene.textures.exists(key)) return key;
  const o = avatarOrb(id);
  const [, d, b, l] = o.stops;
  const c = document.createElement('canvas');
  c.width = c.height = 8;
  const ctx = c.getContext('2d');
  ctx.drawImage(drawPixels(BALL_2, { A: d, L: l, B: b, D: d, h: '#ffffff' }), 0, 0);
  // Luz interior: el centro algo más claro
  ctx.fillStyle = l;
  ctx.globalAlpha = 0.5;
  ctx.fillRect(2, 2, 4, 4);
  ctx.globalAlpha = 1;
  // Símbolo de la mascota
  ctx.fillStyle = '#ffffff';
  for (const [x, y] of ORB_MARKS[o.mark] ?? []) ctx.fillRect(x, y, 1, 1);
  // Destellos dentro de la esfera
  ctx.fillStyle = l;
  for (const [x, y] of [[2, 5], [6, 3]]) ctx.fillRect(x, y, 1, 1);
  scene.textures.addCanvas(key, c);
  return key;
}

/** Orbe común: el de la mascota elegida (con marca y adorno) o el de siempre si no hay ninguna. */
export function setCommonOrb(scene, avatarId) {
  if (CUSTOM_BALL_IMAGES.get('normal')) return; // el pack trae su propia imagen
  const src = avatarId && AVATARS[avatarId] ? scene.textures.get(petOrbKey(scene, avatarId)).getSourceImage() : drawPixels(BALL_2, BALL_COLORS.normal);
  if (scene.textures.exists('ball_normal')) scene.textures.remove('ball_normal');
  const c = document.createElement('canvas');
  c.width = src.width;
  c.height = src.height;
  c.getContext('2d').drawImage(src, 0, 0);
  scene.textures.addCanvas('ball_normal', c);
}

/** Píxel blanco (barras teñidas) y marca roja «!» de bestia sin capturar, como imágenes. */
function makeUiBits(scene) {
  const px = document.createElement('canvas');
  px.width = px.height = 1;
  const pctx = px.getContext('2d');
  pctx.fillStyle = '#ffffff';
  pctx.fillRect(0, 0, 1, 1);
  scene.textures.addCanvas('px', px);
  const m = document.createElement('canvas');
  m.width = m.height = 14;
  const ctx = m.getContext('2d');
  ctx.fillStyle = '#101828';
  ctx.beginPath();
  ctx.arc(7, 7, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#e05858';
  ctx.beginPath();
  ctx.arc(7, 7, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(6, 3, 2, 5);
  ctx.fillRect(6, 9, 2, 2);
  scene.textures.addCanvas('newmark', m);
}

export function generateTextures(scene) {
  textures = scene.textures;
  makeHpFont(scene);
  makeUiBits(scene);
  const pal = { k: OUTLINE, W: '#ffffff', g: '#b8c0d8', C: '#4ce0e8', D: '#2a8a9c', Y: '#ffd84a', G: '#7cf07c', R: '#a08868', r: '#685440' };
  scene.textures.addCanvas('ball', drawPixels(BALL, pal));
  for (const [id, colors] of Object.entries(BALL_COLORS)) {
    const src = CUSTOM_BALL_IMAGES.get(id);
    if (src && textures.exists(src)) {
      // Imagen de bola del pack, encajada en el mismo tamaño que la bola generada (8x8)
      textures.addCanvas(`ball_${id}`, fitImage(textures.get(src).getSourceImage(), [8, 8], false));
      TEX_RES.set(`ball_${id}`, CUSTOM_RES);
    } else {
      scene.textures.addCanvas(`ball_${id}`, drawPixels(BALL_2, colors));
    }
  }
  scene.textures.addCanvas('orb', drawPixels(ORB, pal));
  scene.textures.addCanvas('spark', drawPixels(SPARK, pal));
  scene.textures.addCanvas('pickup', drawPixels(PICKUP, pal));
  scene.textures.addCanvas('rock', drawPixels(ROCK, pal));
}
