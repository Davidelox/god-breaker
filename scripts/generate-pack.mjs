// Genera public/pack/criaturas.json y public/pack/bolas.json a partir del bestiario
// mitológico (src/data/bestiary.js): 500 seres y 100 dioses legendarios, sin imágenes
// (el juego usa sus sprites generados). Sustituye cada `imagen` por tus propios diseños.
// Uso: node scripts/generate-pack.mjs
import { writeFileSync, mkdirSync } from 'node:fs';
import { DEFAULT_CREATURES } from '../src/data/creatures.js';
import { TYPE_ORDER } from '../src/data/types.js';
import { BALL_ORDER, BALL_TYPES } from '../src/data/balls.js';

const entries = DEFAULT_CREATURES.map((c) => ({
  id: c.id,
  nombre: c.name,
  origen: c.type,
  rareza: c.legendary ? null : c.rarity,
  legendaria: c.legendary,
  ...(c.pantheon ? { panteon: c.pantheon } : {}),
  sprite: c.art,
  imagen: null,
  imagenShiny: null
}));

mkdirSync(new URL('../public/pack/', import.meta.url), { recursive: true });
const pack = {
  version: 1,
  descripcion: 'Bestiario mitológico: 500 seres y 100 dioses (griegos, nórdicos y egipcios). "sprite" describe el dibujo generado; pon tu PNG en "imagen" para sustituirlo.',
  origenes: TYPE_ORDER,
  criaturas: entries
};
writeFileSync(new URL('../public/pack/criaturas.json', import.meta.url), JSON.stringify(pack, null, 1) + '\n');
writeFileSync(
  new URL('../public/pack/bolas.json', import.meta.url),
  JSON.stringify({ version: 1, bolas: BALL_ORDER.map((id) => ({ id, nombre: BALL_TYPES[id].name, imagen: null })) }, null, 2) + '\n'
);
const legends = entries.filter((e) => e.legendaria).length;
console.log(`Pack generado: ${entries.length} bestias (${legends} dioses legendarios) y ${BALL_ORDER.length} orbes.`);
