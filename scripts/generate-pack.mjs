// Genera public/pack/criaturas.json y public/pack/bolas.json con contenido PROVISIONAL:
// nombres inventados y sin imagen (el juego usa sus sprites generados). Está pensado para que
// sustituyas cada entrada por tus propios diseños. Uso: node scripts/generate-pack.mjs [total]
//
// Las 72 primeras entradas son las criaturas actuales del juego, con el mismo id,
// para que los guardados existentes sigan siendo válidos.
import { writeFileSync, mkdirSync } from 'node:fs';
import { DEFAULT_CREATURES } from '../src/data/creatures.js';
import { TYPE_ORDER } from '../src/data/types.js';
import { mulberry32 } from '../src/core/rng.js';

const TOTAL = Number(process.argv[2]) || 1025;
const LEGENDARY_PER_TYPE = 8; // legendarios en total por tipo (incluye los que ya existen)
const rng = mulberry32(20261106);

// Generador de nombres provisionales a partir de sílabas
const START = ['Ba', 'Bru', 'Ca', 'Cro', 'Da', 'Dro', 'Fa', 'Fi', 'Gla', 'Gu', 'Ja', 'La', 'Lu', 'Ma', 'Mo', 'Na', 'Ni', 'Pa', 'Pi', 'Que', 'Ra', 'Ro', 'Sa', 'Si', 'Ta', 'Tri', 'Va', 'Ve', 'Za', 'Zu'];
const MID = ['bo', 'ca', 'da', 'fe', 'gor', 'la', 'li', 'mar', 'na', 'ne', 'ra', 'ri', 'so', 'ta', 'to', 'vi', 'zu', ''];
const END = ['bón', 'chín', 'do', 'lín', 'lo', 'món', 'na', 'ndo', 'nón', 'ñín', 'rax', 'rín', 'ro', 'sa', 'tín', 'to', 'trón', 'zo'];
const pick = (arr) => arr[Math.floor(rng() * arr.length)];
const used = new Set(DEFAULT_CREATURES.map((c) => c.name.toLowerCase()));
function newName() {
  for (;;) {
    const name = pick(START) + pick(MID) + pick(END);
    if (name.length <= 12 && !used.has(name.toLowerCase())) {
      used.add(name.toLowerCase());
      return name;
    }
  }
}

const entries = DEFAULT_CREATURES.map((c) => ({
  id: c.id,
  nombre: c.name,
  tipo: c.type,
  rareza: c.legendary ? null : c.rarity,
  legendaria: c.legendary,
  imagen: null,
  imagenShiny: null
}));

const legendCount = Object.fromEntries(TYPE_ORDER.map((t) => [t, DEFAULT_CREATURES.filter((c) => c.legendary && c.type === t).length]));
const remaining = TOTAL - entries.length;
// Reparto de los legendarios nuevos de forma regular a lo largo del catálogo
const newLegends = TYPE_ORDER.reduce((s, t) => s + Math.max(0, LEGENDARY_PER_TYPE - legendCount[t]), 0);
const legendEvery = Math.max(1, Math.floor(remaining / Math.max(1, newLegends)));

let typeIdx = 0;
for (let i = 0; i < remaining; i++) {
  const id = entries.length + 1;
  const type = TYPE_ORDER[typeIdx++ % TYPE_ORDER.length];
  const wantLegend = (i + 1) % legendEvery === 0 && legendCount[type] < LEGENDARY_PER_TYPE;
  if (wantLegend) legendCount[type]++;
  const r = rng();
  entries.push({
    id,
    nombre: newName(),
    tipo: type,
    rareza: wantLegend ? null : r < 0.5 ? 1 : r < 0.8 ? 2 : 3,
    legendaria: wantLegend,
    imagen: null,
    imagenShiny: null
  });
}

mkdirSync(new URL('../public/pack/', import.meta.url), { recursive: true });
const pack = {
  version: 1,
  descripcion: 'Catálogo provisional. Sustituye nombres, tipos e imágenes por tus propios diseños.',
  tipos: TYPE_ORDER,
  criaturas: entries
};
writeFileSync(new URL('../public/pack/criaturas.json', import.meta.url), JSON.stringify(pack, null, 1) + '\n');
writeFileSync(
  new URL('../public/pack/bolas.json', import.meta.url),
  JSON.stringify(
    {
      version: 1,
      bolas: [
        { id: 'normal', nombre: 'Normal', imagen: null },
        { id: 'super', nombre: 'Super', imagen: null },
        { id: 'ultra', nombre: 'Ultra', imagen: null }
      ]
    },
    null,
    2
  ) + '\n'
);
const legends = entries.filter((e) => e.legendaria).length;
console.log(`Pack generado: ${entries.length} criaturas (${legends} legendarias) y 3 bolas.`);
