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

export const CREATURES = [];
let id = 1;
for (const type of TYPE_ORDER) {
  NAMES[type].forEach((name, i) => {
    CREATURES.push({ id: id++, name, type, rarity: RARITY_BY_SLOT[i], legendary: false });
  });
}
for (const type of TYPE_ORDER) {
  CREATURES.push({ id: id++, name: LEGENDARY[type], type, rarity: 4, legendary: true });
}

export const NORMAL_CREATURES = CREATURES.filter((c) => !c.legendary);
export const LEGENDARIES = CREATURES.filter((c) => c.legendary);
export const CREATURE_IDS = new Set(CREATURES.map((c) => c.id));
export const creatureById = (cid) => CREATURES.find((c) => c.id === Number(cid));
