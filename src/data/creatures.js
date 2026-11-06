// Catálogo de bestias. rarity: 1 común, 2 poco común, 3 rara, 4 legendaria (dioses).
// El contenido sale del bestiario mitológico (bestiary.js); un pack (public/pack/criaturas.json)
// puede sustituirlo al arrancar.
import { TYPE_ORDER } from './types.js';
import { buildBestiary } from './bestiary.js';

export const DEFAULT_CREATURES = buildBestiary(TYPE_ORDER);
export const CREATURES = [];
export const NORMAL_CREATURES = [];
export const LEGENDARIES = [];
export const CREATURE_IDS = new Set();
const BY_ID = new Map();

export function setCreatures(list) {
  CREATURES.length = 0;
  NORMAL_CREATURES.length = 0;
  LEGENDARIES.length = 0;
  CREATURE_IDS.clear();
  BY_ID.clear();
  for (const c of list) {
    CREATURES.push(c);
    (c.legendary ? LEGENDARIES : NORMAL_CREATURES).push(c);
    CREATURE_IDS.add(c.id);
    BY_ID.set(c.id, c);
  }
}

export const creatureById = (cid) => BY_ID.get(Number(cid));

setCreatures(DEFAULT_CREATURES);
