// Genera los iconos de la app (pantalla de inicio del iPhone / Android) en public/icons/:
// un orbe dorado con una corona de rayos sobre fondo nocturno, en pixel art.
// Uso: node scripts/make-icons.mjs
import { writeFileSync, mkdirSync } from 'node:fs';
import { deflateSync } from 'node:zlib';

const G = 32; // rejilla de píxeles del dibujo
const hex = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const C = {
  bg: hex('#0c1020'), bg2: hex('#141c34'), ray: hex('#3a3018'), ray2: hex('#5c4818'),
  out: hex('#2a1602'), dark: hex('#c88010'), base: hex('#ffc820'), light: hex('#fff4b0'), white: hex('#ffffff')
};

function drawGrid() {
  const g = Array.from({ length: G }, () => Array(G).fill(C.bg));
  const cx = G / 2, cy = G / 2;
  for (let y = 0; y < G; y++) {
    for (let x = 0; x < G; x++) {
      const dx = x + 0.5 - cx, dy = y + 0.5 - cy;
      const d = Math.hypot(dx, dy);
      const a = Math.atan2(dy, dx);
      if ((x + y) % 2 === 0 && d > 13) g[y][x] = C.bg2;
      // Rayos
      if (d > 9 && d < 15.5 && Math.abs(Math.sin(a * 6)) > 0.82) g[y][x] = d < 12.5 ? C.ray2 : C.ray;
      // Orbe
      if (d <= 9) g[y][x] = C.out;
      if (d <= 8) {
        // Sombreado: luz arriba a la izquierda
        const l = (-dx - dy) / 8;
        g[y][x] = l > 0.55 ? C.light : l > -0.35 ? C.base : C.dark;
      }
    }
  }
  // Brillo
  for (const [x, y] of [[12, 11], [13, 11], [12, 12]]) g[y][x] = C.white;
  return g;
}

function png(size, grid) {
  const k = size / G;
  const raw = Buffer.alloc((size * 3 + 1) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (size * 3 + 1)] = 0;
    for (let x = 0; x < size; x++) {
      const [r, gg, b] = grid[Math.floor(y / k)][Math.floor(x / k)];
      const i = y * (size * 3 + 1) + 1 + x * 3;
      raw[i] = r; raw[i + 1] = gg; raw[i + 2] = b;
    }
  }
  const crcTable = Array.from({ length: 256 }, (_, n) => {
    let c = n;
    for (let j = 0; j < 8; j++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    return c >>> 0;
  });
  const crc = (buf) => {
    let c = 0xffffffff;
    for (const v of buf) c = crcTable[(c ^ v) & 255] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
  };
  const chunk = (type, data) => {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const td = Buffer.concat([Buffer.from(type), data]);
    const c = Buffer.alloc(4);
    c.writeUInt32BE(crc(td));
    return Buffer.concat([len, td, c]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 2; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0))
  ]);
}

const grid = drawGrid();
mkdirSync(new URL('../public/icons/', import.meta.url), { recursive: true });
for (const size of [180, 192, 512]) {
  writeFileSync(new URL(`../public/icons/icon-${size}.png`, import.meta.url), png(size, grid));
}
console.log('Iconos generados en public/icons/');
