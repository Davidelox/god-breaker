// Escenario temático del tablero: losas y decoración según la mitología del último dios.
// Hay un tema por cada origen mitológico (14): losas con su color y material, glifos grabados
// (jeroglíficos, runas, nudos celtas, kanji, espirales maoríes…) y una franja decorativa arriba.
// Las losas se dibujan semitransparentes sobre el color del clima (que se sigue viendo debajo).

// tile/tile2: losas en damero; line: juntas y vetas; dark: glifos; border: tipo de franja y colores
const THEMES = {
  griega: { tile: '#d8d0c0', tile2: '#c8bca4', line: '#b0a690', dark: '#8a6a30', glyphs: 'greek', border: ['meander', '#d8a030'] },
  nordica: { tile: '#3a5a7c', tile2: '#2e4c6c', line: '#6a9cc0', dark: '#a0d8f0', glyphs: 'runes', border: ['frost', '#e8f4ff', '#c8e8ff'] },
  egipcia: { tile: '#d8b070', tile2: '#c89a58', line: '#a07840', dark: '#3a2410', glyphs: 'hiero', border: ['egypt', '#2a5ab8', '#d0a030', '#c84848'] },
  celta: { tile: '#4c7c5c', tile2: '#3c6c4c', line: '#2c4c38', dark: '#a0d0a0', glyphs: 'celtic', border: ['knot', '#d8c070', '#2c4c38'] },
  eslava: { tile: '#7a5034', tile2: '#6a4428', line: '#4a2c18', dark: '#e0b080', glyphs: 'slavic', border: ['embroidery', '#c83030', '#f4ecd8'] },
  iberica: { tile: '#c8704c', tile2: '#b8603c', line: '#8a4428', dark: '#f4e0c0', glyphs: 'iberian', border: ['azulejo', '#2a5ab8', '#f4f4f8'] },
  europea: { tile: '#5a5868', tile2: '#4c4a5a', line: '#34323e', dark: '#c8b8e0', glyphs: 'alchemy', border: ['gothic', '#8a7ab8', '#34323e'] },
  japonesa: { tile: '#c8b078', tile2: '#b89c64', line: '#8a7040', dark: '#5a2a1c', glyphs: 'kanji', border: ['torii', '#c83a2c', '#1c1418'] },
  asiatica: { tile: '#3c8c6c', tile2: '#2e7c5c', line: '#1c5c44', dark: '#f0d070', glyphs: 'cloud', border: ['cloud', '#e0b030', '#1c5c44'] },
  indomalaya: { tile: '#d88c3c', tile2: '#c87c2c', line: '#9c5c1c', dark: '#7a2c5c', glyphs: 'mandala', border: ['lotus', '#e05888', '#f4d070'] },
  medioriental: { tile: '#3ca0b8', tile2: '#2e90a8', line: '#1c6c80', dark: '#f4ecd8', glyphs: 'cuneiform', border: ['star', '#f4d070', '#1c4c78'] },
  americana: { tile: '#7c8c74', tile2: '#6c7c64', line: '#4c5a48', dark: '#c8483c', glyphs: 'aztec', border: ['stepfret', '#c8483c', '#e8d8b0'] },
  africana: { tile: '#c89048', tile2: '#b88038', line: '#8a5c24', dark: '#3a2010', glyphs: 'adinkra', border: ['kente', '#d8b020', '#c83030', '#2c8a3c', '#1c1418'] },
  oceanica: { tile: '#d8c8a0', tile2: '#c8b890', line: '#a09068', dark: '#2c7c8c', glyphs: 'koru', border: ['wave', '#2ca8b8', '#f4f4f8'] }
};

/** Tema de tablero de cada origen (uno propio por mitología). */
export const STAGE_FOR_ORIGIN = Object.fromEntries(Object.keys(THEMES).map((o) => [o, o]));
export const STAGES = Object.keys(THEMES);

// Glifos de 5x5 grabados en algunas losas
const GLYPHS = {
  greek: [['xxxxx', 'x...x', 'x.x.x', 'x.xxx', 'x....'], ['.xxx.', 'x...x', 'xxxxx', 'x...x', 'x...x']],
  runes: [['x.x..', 'xx.x.', 'x..x.', 'x....', 'x....'], ['x...x', 'x..x.', 'x.x..', 'xx...', 'x....'], ['x...x', '.x.x.', '..x..', '.x.x.', 'x...x']],
  hiero: [['.xxx.', 'x.x.x', '.xxx.', '..x..', '.x.x.'], ['.xxx.', '.x.x.', 'xxxxx', '..x..', '..x..'], ['..xx.', '.xxx.', 'xxxx.', '..x..', '.x.x.']],
  celtic: [['.x.x.', 'x.x.x', '.x.x.', 'x.x.x', '.x.x.'], ['..x..', '.x.x.', 'x.x.x', '.x.x.', '..x..']],
  slavic: [['x.x.x', '.xxx.', 'xxxxx', '.xxx.', 'x.x.x'], ['..x..', '.xxx.', 'xx.xx', '.xxx.', '..x..']],
  iberian: [['.xx..', 'x..x.', '.xx.x', '..x.x', '...x.'], ['x...x', '.x.x.', '..x..', '.x.x.', 'x...x']],
  alchemy: [['..x..', '.x.x.', 'x...x', 'xxxxx', '.....'], ['.xxx.', 'x...x', '.xxx.', '..x..', '.xxx.']],
  kanji: [['xxxxx', '..x..', 'xxxxx', '..x..', '.x.x.'], ['x.x.x', 'xxxxx', 'x.x.x', '..x..', 'xxxxx']],
  cloud: [['.xx..', 'x..x.', 'x.xxx', '.x..x', '..xx.'], ['xx.xx', 'x.x.x', '.....', 'xx.xx', 'x.x.x']],
  mandala: [['..x..', '.xxx.', 'xx.xx', '.xxx.', '..x..'], ['x.x.x', '.x.x.', 'x.x.x', '.x.x.', 'x.x.x']],
  cuneiform: [['x.x..', 'xx.x.', 'x....', 'x.x..', 'xx.x.'], ['xx...', 'x.xx.', '...x.', 'xx...', 'x.xx.']],
  aztec: [['xxxxx', 'x.x.x', 'xxxxx', 'x...x', 'xxxxx'], ['xxx..', 'x.x..', 'x.xxx', 'x...x', 'xxxxx']],
  adinkra: [['.x.x.', 'xxxxx', '.x.x.', 'xxxxx', '.x.x.'], ['x...x', '.xxx.', '.x.x.', '.xxx.', 'x...x']],
  koru: [['.xxx.', 'x...x', 'x.x.x', 'x..x.', '.x...'], ['..xx.', '.x..x', 'x.x.x', '.x...', '..xxx']]
};

/** Franja decorativa de arriba (8 px de alto) según su tipo. */
function drawBorder(br, w, [kind, a, b, c, d]) {
  for (let x = 0; x < w; x += 8) {
    switch (kind) {
      case 'meander': br(x, 0, 8, 2, a); br(x, 2, 2, 4, a); br(x, 6, 6, 2, a); br(x + 4, 2, 2, 2, a); break;
      case 'frost': br(x, 0, 8, 2, a); br(x + 1, 2, 2, 3, b); br(x + 5, 2, 2, 2 + ((x / 8) % 3), b); break;
      case 'egypt': br(x, 0, 4, 4, a); br(x + 4, 0, 4, 4, b); br(x, 4, 8, 1, '#3a2410'); br(x + 2, 5, 4, 2, (x / 8) % 2 ? c : b); break;
      case 'knot': br(x, 0, 8, 1, a); br(x, 7, 8, 1, a); br(x + 1, 1, 2, 2, a); br(x + 3, 3, 2, 2, a); br(x + 5, 5, 2, 2, a); br(x + 5, 1, 2, 2, b); br(x + 1, 5, 2, 2, b); break;
      case 'embroidery': br(x, 0, 8, 8, b); br(x + 3, 0, 2, 8, a); br(x, 3, 8, 2, a); br(x + 1, 1, 1, 1, a); br(x + 6, 6, 1, 1, a); break;
      case 'azulejo': br(x, 0, 8, 8, b); br(x + 2, 2, 4, 4, a); br(x + 3, 0, 2, 2, a); br(x + 3, 6, 2, 2, a); br(x, 3, 2, 2, a); br(x + 6, 3, 2, 2, a); break;
      case 'gothic': br(x, 4, 8, 4, b); br(x + 1, 2, 2, 6, a); br(x + 5, 2, 2, 6, a); br(x + 3, 0, 2, 4, a); break;
      case 'torii': br(x, 0, 8, 2, b); br(x, 2, 8, 2, a); br(x + 1, 4, 2, 4, a); br(x + 5, 4, 2, 4, a); break;
      case 'cloud': br(x, 0, 8, 1, a); br(x + 1, 2, 3, 3, a); br(x + 2, 3, 1, 1, b); br(x + 5, 3, 2, 2, a); br(x, 7, 8, 1, a); break;
      case 'lotus': br(x, 6, 8, 2, b); br(x + 3, 0, 2, 6, a); br(x + 1, 2, 2, 4, a); br(x + 5, 2, 2, 4, a); br(x + 3, 1, 2, 2, b); break;
      case 'star': br(x, 0, 8, 8, b); br(x + 3, 0, 2, 8, a); br(x, 3, 8, 2, a); br(x + 1, 1, 2, 2, a); br(x + 5, 5, 2, 2, a); br(x + 5, 1, 2, 2, a); br(x + 1, 5, 2, 2, a); break;
      case 'stepfret': br(x, 0, 8, 8, b); br(x, 0, 2, 8, a); br(x, 6, 6, 2, a); br(x + 4, 2, 2, 6, a); br(x + 2, 2, 4, 2, a); break;
      case 'kente': br(x, 0, 2, 8, a); br(x + 2, 0, 2, 8, b); br(x + 4, 0, 2, 8, c); br(x + 6, 0, 2, 8, d); br(x, 3, 8, 2, a); break;
      case 'wave': br(x, 4, 8, 4, a); br(x + 1, 2, 4, 2, a); br(x + 4, 1, 2, 2, b); br(x + 5, 3, 2, 1, b); break;
    }
  }
}

/**
 * Crea (una vez) las texturas del tema: losas (todo el tablero) y franja decorativa de arriba.
 * Devuelve { tiles, border } (claves de textura).
 */
export function stageTextures(scene, theme, w, h, cell) {
  if (!THEMES[theme]) theme = 'griega';
  const tilesKey = `stage_${theme}_${w}x${h}`, borderKey = `stage_${theme}_border_${w}`;
  if (scene.textures.exists(tilesKey)) return { tiles: tilesKey, border: borderKey };
  const T = THEMES[theme];
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d');
  const rect = (x, y, ww, hh, col) => {
    ctx.fillStyle = col;
    ctx.fillRect(x, y, ww, hh);
  };
  let seed = [...theme].reduce((s, ch) => s + ch.charCodeAt(0), 7) * 97;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const glyphs = GLYPHS[T.glyphs];
  for (let r = 0; r * cell < h; r++) {
    for (let col = 0; col * cell < w; col++) {
      const x = col * cell, y = r * cell;
      rect(x, y, cell, cell, (r + col) % 2 ? T.tile2 : T.tile);
      rect(x, y, cell, 1, T.line);
      rect(x, y, 1, cell, T.line);
      // Vetas o grietas finas en algunas losas
      if (rnd() < 0.35) {
        ctx.fillStyle = T.line;
        let vx = x + 6 + rnd() * (cell - 12), vy = y + 4;
        for (let k = 0; k < 6; k++) {
          ctx.fillRect(Math.round(vx), Math.round(vy), 1, 3);
          vx += (rnd() - 0.5) * 6;
          vy += 5;
        }
      }
      // Glifo grabado
      if (glyphs && rnd() < 0.3) {
        const gl = glyphs[Math.floor(rnd() * glyphs.length)];
        const gx = x + 8 + Math.floor(rnd() * (cell - 26)), gy = y + 8 + Math.floor(rnd() * (cell - 26));
        gl.forEach((row, j) => [...row].forEach((ch, i) => ch === 'x' && rect(gx + i * 2, gy + j * 2, 2, 2, T.dark)));
      }
    }
  }
  scene.textures.addCanvas(tilesKey, c);

  const b = document.createElement('canvas');
  b.width = w;
  b.height = 8;
  const bctx = b.getContext('2d');
  drawBorder((x, y, ww, hh, col) => {
    bctx.fillStyle = col;
    bctx.fillRect(x, y, ww, hh);
  }, w, T.border);
  scene.textures.addCanvas(borderKey, b);
  return { tiles: tilesKey, border: borderKey };
}
