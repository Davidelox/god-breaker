// Catálogo de criaturas originales. rarity: 1 común, 2 poco común, 3 rara, 4 legendaria.
import { TYPE_ORDER } from './types.js';

const NAMES = {
  fuego: ['Ascuín', 'Tizonte', 'Fogarín', 'Magmolo'],
  agua: ['Gotín', 'Burbullo', 'Marejo', 'Abismar'],
  planta: ['Brotito', 'Musguín', 'Helechón', 'Robledo'],
  electrico: ['Voltín', 'Chisparro', 'Dinamón', 'Tormentejo'],
  hielo: ['Escarchín', 'Nevadín', 'Glaciaro', 'Témpano'],
  roca: ['Guijarrín', 'Pedrusco', 'Basaltón', 'Montañón'],
  fantasma: ['Sombrín', 'Ectoplín', 'Espectrón', 'Animón'],
  psiquico: ['Mentín', 'Psicorbe', 'Oráculo', 'Astralio']
};

const LEGENDARY = {
  fuego: 'Pirovórax',
  agua: 'Leviacuo',
  planta: 'Gaiaflor',
  electrico: 'Fulgurión',
  hielo: 'Glaciadón',
  roca: 'Titanita',
  fantasma: 'Nocthar',
  psiquico: 'Cosmóbius'
};

const RARITY_BY_SLOT = [1, 1, 2, 3];

const DEFAULTS = [];
let id = 1;
for (const type of TYPE_ORDER) {
  NAMES[type].forEach((name, i) => {
    DEFAULTS.push({ id: id++, name, type, rarity: RARITY_BY_SLOT[i], legendary: false });
  });
}
for (const type of TYPE_ORDER) {
  DEFAULTS.push({ id: id++, name: LEGENDARY[type], type, rarity: 4, legendary: true });
}

// Segunda generación (id 41+). Se añaden al final para no cambiar los id de los guardados.
const NAMES_2 = {
  fuego: ['Chamuscón', 'Hogarín', 'Brasilisco', 'Volcanejo'],
  agua: ['Charquín', 'Coralito', 'Medusón', 'Mareón'],
  planta: ['Setín', 'Raicejo', 'Espinillo', 'Florazul'],
  electrico: ['Pilucho', 'Relampín', 'Bobinón', 'Centellón'],
  hielo: ['Copito', 'Gelidín', 'Granizón', 'Carambano'],
  roca: ['Cascajo', 'Peñasquín', 'Pizarrón', 'Obsidión'],
  fantasma: ['Bruman', 'Fantasmín', 'Penumbro', 'Velador'],
  psiquico: ['Runín', 'Telepín', 'Augurio', 'Psiconte']
};
const RARITY_BY_SLOT_2 = [1, 2, 2, 3];
for (const type of TYPE_ORDER) {
  NAMES_2[type].forEach((name, i) => {
    DEFAULTS.push({ id: id++, name, type, rarity: RARITY_BY_SLOT_2[i], legendary: false });
  });
}

// Las listas se exportan como objetos estables y se rellenan con setCreatures():
// así un pack (public/pack/criaturas.json) puede sustituir el catálogo al arrancar.
export const DEFAULT_CREATURES = DEFAULTS;
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

setCreatures(DEFAULTS);
