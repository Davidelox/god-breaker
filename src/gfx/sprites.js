// Sprites pixel art generados por código. Las bestias se dibujan con src/gfx/beastArt.js.
// Cada criatura usa su id como semilla, así que su forma es siempre la misma.
import Phaser from 'phaser';
import { creatureById } from '../data/creatures.js';
import { drawBeast, goldCanvas } from './beastArt.js';
import { godFrame, GOD_FRAMES } from './gods.js';
import { beastFrame } from './beasts.js';

/** Fotograma i del diseño a mano de una criatura (dios o bestia), o null si no tiene. */
const handFrame = (c, i) => (c.legendary ? godFrame(c.name, i) : beastFrame(c.name, i));
import { CUSTOM_CREATURE_IMAGES, CUSTOM_BALL_IMAGES } from '../data/pack.js';
import { AVATARS, AVATAR_STYLES, avatarOrb } from '../data/profile.js';
import { drawPetPortrait } from './petPortraits.js';

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
  // Dioses y bestias rediseñados a mano (gods.js, beasts.js): primer fotograma de su animación
  const art = handFrame(c, 0);
  if (art) {
    textures.addCanvas(key, fitImage(art, c.legendary ? BOX.legendary : BOX.normal, shiny));
    TEX_RES.set(key, CUSTOM_RES);
    return;
  }
  textures.addCanvas(key, drawCreature(c, shiny));
  TEX_RES.set(key, BEAST_RES);
}

/** Texturas de los fotogramas de la animación de una criatura rediseñada a mano (o null si no tiene). */
export function godFrameKeys(id, shiny) {
  const c = creatureById(id);
  if (!c || CUSTOM_CREATURE_IMAGES.get(Number(id)) || !handFrame(c, 0)) return null;
  const box = c.legendary ? BOX.legendary : BOX.normal;
  const base = creatureKey(id, shiny);
  const keys = [base];
  for (let i = 1; i < GOD_FRAMES; i++) {
    const key = `${base}_f${i}`;
    if (!textures.exists(key)) {
      textures.addCanvas(key, fitImage(handFrame(c, i), box, shiny));
      TEX_RES.set(key, CUSTOM_RES);
    }
    keys.push(key);
  }
  return keys;
}

const OUTLINE = '#1a1a24';

// Las bestias se dibujan al triple de resolución que la caja (14x17, legendarias 18x21)
// para tener más detalle; texScale() compensa el tamaño.
const BEAST_RES = 3;

/** Lienzo del sprite generado de una bestia (a partir de su descriptor «art»). */
export function drawCreature(c, shiny, desc = c.art ?? 'wisp') {
  const [bw, bh] = c.legendary ? BOX.legendary : BOX.normal;
  const canvas = enhanceSprite(drawBeast(desc, bw * BEAST_RES, bh * BEAST_RES, c.id));
  return shiny ? goldCanvas(canvas) : canvas; // «shiny» = versión dorada
}

/**
 * Mejora de luz de los sprites generados: borde de luz arriba (como si la luz viniera de encima),
 * sombra en la parte de abajo de cada forma y un poco más de saturación. El contorno oscuro no
 * se toca.
 */
function enhanceSprite(src) {
  const w = src.width, h = src.height;
  const ctx = src.getContext('2d');
  const img = ctx.getImageData(0, 0, w, h);
  const d = img.data, orig = new Uint8ClampedArray(d);
  const lum = (i) => 0.3 * orig[i] + 0.59 * orig[i + 1] + 0.11 * orig[i + 2];
  const edge = (x, y) => x < 0 || y < 0 || x >= w || y >= h || orig[(y * w + x) * 4 + 3] === 0 || lum((y * w + x) * 4) < 40;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      if (orig[i + 3] === 0 || lum(i) < 40) continue;
      const g = lum(i);
      let f = 0;
      if (edge(x, y - 1)) f = 0.22; // luz arriba
      else if (edge(x, y + 1)) f = -0.18; // sombra abajo
      for (let k = 0; k < 3; k++) {
        let v = g + (orig[i + k] - g) * 1.15; // saturación
        v = f > 0 ? v + (255 - v) * f : v * (1 + f);
        d[i + k] = v;
      }
    }
  }
  ctx.putImageData(img, 0, 0);
  return src;
}

/** Textura de la criatura con los ojos cerrados (parpadeo), o null si su dibujo no tiene ojos que cerrar. */
export function creatureBlinkKey(id, shiny) {
  const c = creatureById(id);
  if (!c || handFrame(c, 0) || CUSTOM_CREATURE_IMAGES.get(Number(id))) return null;
  if (/\beyes:/.test(c.art ?? '')) return null;
  const key = `${creatureKey(id, shiny)}_blink`;
  if (textures.exists(key)) return key;
  if (BLINK_NONE.has(key)) return null;
  const closed = drawCreature(c, shiny, `${c.art ?? 'wisp'} eyes:closed`);
  const open = textures.get(creatureKey(id, shiny)).getSourceImage();
  // Si no cambia nada (dibujo sin cara), no hay parpadeo
  const a = closed.getContext('2d').getImageData(0, 0, closed.width, closed.height).data;
  const b = open.getContext('2d').getImageData(0, 0, open.width, open.height).data;
  let same = a.length === b.length;
  for (let i = 0; same && i < a.length; i++) if (a[i] !== b[i]) same = false;
  if (same) {
    BLINK_NONE.add(key);
    return null;
  }
  textures.addCanvas(key, closed);
  TEX_RES.set(key, BEAST_RES);
  return key;
}
const BLINK_NONE = new Set();

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

// Iconos de la interfaz (puntos, turno, capturas) y de cada elemento de los hechizos
const ICONS = {
  crown: [['.x.x.x.', 'xxxxxxx', 'xyyyyyx', 'xxxxxxx'], { x: '#ffd84a', y: '#a8640c' }],
  hour: [['xxxxx', '.xyx.', '..x..', '.xyx.', 'xxxxx'], { x: '#e8dcc0', y: '#d8a030' }],
  music: [['...xxxxxx', '...xyyyyx', '...x....x', '...x....x', '...x....x', '.xxx..xxx', 'xyyx.xyyx', 'xyyx.xyyx', '.xx...xx.'], { x: '#ffe27a', y: '#d8a030' }],
  sound: [['....x....', '...xx..x.', 'xxxyx...x', 'xyyyx.x.x', 'xyyyx.x.x', 'xxxyx...x', '...xx..x.', '....x....'], { x: '#ffe27a', y: '#d8a030' }],
  gear: [['...x.x...', '.x.xxx.x.', '..xyyyx..', 'xxy...yxx', '.xy...yx.', 'xxy...yxx', '..xyyyx..', '.x.xxx.x.', '...x.x...'], { x: '#ffe27a', y: '#d8a030' }],
  stats: [['.......x.', '.......x.', '....x..x.', '....x..x.', '.x..x..x.', '.x..x..x.', '.x..x..x.', 'xxxxxxxxx'], { x: '#ffe27a' }],
  orbicon: [['.xxx.', 'xyyzx', 'xyyyx', 'xyyyx', '.xxx.'], { x: '#061820', y: '#30d8f0', z: '#ffffff' }],
  fuego: [['...x...', '..xyx..', '..xyx..', '.xyzyx.', 'xyzzzyx', 'xyzzzyx', '.xxxxx.'], { x: '#a8322a', y: '#ff7a20', z: '#ffe050' }],
  agua: [['...x...', '..xyx..', '.xyyyx.', 'xyyzyyx', 'xyyyyyx', '.xyyyx.', '..xxx..'], { x: '#24569c', y: '#78c0ff', z: '#ffffff' }],
  planta: [['....xx.', '..xxyx.', '.xyyyx.', 'xyyzyx.', 'xyzyx..', 'xzxx...', 'z......'], { x: '#2c703c', y: '#8ce070', z: '#e8ffd0' }],
  electrico: [['...xxx.', '..xyx..', '.xyx...', 'xyyyyx.', '..xyx..', '.xyx...', '.xx....'], { x: '#b08420', y: '#fff07a' }],
  hielo: [['...x...', '.x.x.x.', '..xyx..', 'xxyzyxx', '..xyx..', '.x.x.x.', '...x...'], { x: '#8cd8f0', y: '#d4f4ff', z: '#ffffff' }],
  roca: [['..xxx..', '.xyyyx.', 'xyyzyyx', 'xyzyyyx', 'xyyyyzx', '.xyyyx.', '..xxx..'], { x: '#685440', y: '#a08868', z: '#c8b08c' }],
  oscuridad: [['..xxx..', '.xyyx..', 'xyyx...', 'xyyx...', 'xyyx...', '.xyyx..', '..xxx..'], { x: '#3a2668', y: '#b494f0' }]
};

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

/**
 * Retrato de la mascota (54x62): primer plano de perfil, en sombra con luz de contra, halo y marco
 * de oro (dibujado a mano en petPortraits.js con la paleta de la mascota).
 */
export function avatarKey(scene, id, locked = false) {
  const key = `avatar_${id}${locked ? '_locked' : ''}`;
  if (scene.textures.exists(key)) return key;
  const a = AVATARS[id];
  const seed = [...id].reduce((n, ch) => n + ch.charCodeAt(0), 7);
  scene.textures.addCanvas(key, drawPetPortrait({ ...a.portrait, stops: AVATAR_STYLES[a.style], seed, locked }));
  return key;
}

// Marcas dentro del orbe (coordenadas en la esfera de 8x8), en blanco brillante
const ORB_MARKS = {
  paw: [[3, 3], [5, 3], [4, 5], [3, 5], [5, 5]],
  moon: [[4, 2], [3, 3], [3, 4], [4, 5]],
  star: [[4, 2], [3, 4], [4, 3], [4, 4], [5, 4], [4, 5]],
  eye: [[3, 4], [4, 4], [5, 4], [4, 3], [4, 5]],
  wave: [[2, 4], [3, 3], [4, 4], [5, 3]],
  ring: [[3, 3], [4, 3], [3, 5], [4, 5], [2, 4], [5, 4]],
  web: [[2, 2], [3, 3], [4, 4], [5, 5], [5, 3], [3, 5], [4, 2], [4, 6], [2, 4], [6, 4]],
  rune: [[3, 2], [3, 3], [3, 4], [3, 5], [4, 2], [5, 3], [4, 4], [5, 5]],
  crown: [[2, 3], [4, 2], [5, 3], [2, 4], [3, 4], [4, 4], [5, 4], [3, 5], [4, 5]]
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
  // Símbolo de la mascota, del color de sus ojos
  ctx.fillStyle = o.eye ?? '#ffffff';
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
  for (const [key, [rows, colors]] of Object.entries(ICONS)) scene.textures.addCanvas(`icon_${key}`, drawPixels(rows, colors));
  scene.textures.addCanvas('spark', drawPixels(SPARK, pal));
  scene.textures.addCanvas('pickup', drawPixels(PICKUP, pal));
  scene.textures.addCanvas('rock', drawPixels(ROCK, pal));
}
