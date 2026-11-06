// Sprites pixel art generados por código. Las bestias se dibujan con src/gfx/beastArt.js.
// Cada criatura usa su id como semilla, así que su forma es siempre la misma.
import Phaser from 'phaser';
import { creatureById } from '../data/creatures.js';
import { drawBeast, goldCanvas } from './beastArt.js';
import { CUSTOM_CREATURE_IMAGES, CUSTOM_BALL_IMAGES } from '../data/pack.js';

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

/** Textura del fondo de un bloque (relleno + borde de 2 px), creada una vez por combinación. */
export function blockBgKey(scene, fill, border, size) {
  const key = `blkbg_${fill.toString(16)}_${border.toString(16)}_${size}`;
  if (scene.textures.exists(key)) return key;
  const s = size - 2;
  const canvas = document.createElement('canvas');
  canvas.width = s;
  canvas.height = s;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = `#${border.toString(16).padStart(6, '0')}`;
  ctx.fillRect(0, 0, s, s);
  ctx.fillStyle = `#${fill.toString(16).padStart(6, '0')}`;
  ctx.fillRect(2, 2, s - 4, s - 4);
  scene.textures.addCanvas(key, canvas);
  return key;
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
