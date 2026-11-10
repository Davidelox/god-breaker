// Hechizos elementales: se cargan con la barra de magia. Cada elemento tiene su color.
export const SPECIAL_COST = 100;

export const ELEMENTS = {
  fuego: { name: 'Fire', short: 'FIR', base: '#e8613c', light: '#ffa25c', dark: '#a8322a' },
  agua: { name: 'Water', short: 'WAT', base: '#3c8ce8', light: '#78c0ff', dark: '#24569c' },
  planta: { name: 'Nature', short: 'NAT', base: '#4cb04c', light: '#8ce070', dark: '#2c703c' },
  electrico: { name: 'Thunder', short: 'THU', base: '#f0c830', light: '#fff07a', dark: '#b08420' },
  hielo: { name: 'Ice', short: 'ICE', base: '#8cd8f0', light: '#d4f4ff', dark: '#4c94b8' },
  roca: { name: 'Earth', short: 'EAR', base: '#a08868', light: '#c8b08c', dark: '#685440' },
  oscuridad: { name: 'Darkness', short: 'DRK', base: '#6a4ca8', light: '#b494f0', dark: '#3a2668' }
};

// Los id se mantienen de la versión con «poderes» (los usa la lógica del juego).
// Cada hechizo tiene nivel 1 (un hueco) y MAX (los dos huecos con el mismo hechizo).
export const SPECIALS = [
  { id: 'estallido', name: 'Fireball', type: 'fuego', desc: 'Hits all blocks around. MAX: 2 blocks around' },
  { id: 'torrente', name: 'Tidal Wave', type: 'agua', desc: 'Big orbs pierce 2 blocks. MAX: 3 blocks' },
  { id: 'enredadera', name: 'Overgrowth', type: 'planta', desc: '+50% orbs. MAX: twice as many orbs' },
  { id: 'arco', name: 'Chain Lightning', type: 'electrico', desc: 'Each hit zaps 4 random blocks. MAX: 6' },
  { id: 'escarcha', name: 'Ice Lance', type: 'hielo', desc: 'Orbs deal double damage. MAX: triple' },
  { id: 'derrumbe', name: 'Stone Rain', type: 'roca', desc: 'Breaks 2 toughest blocks, god -50%. MAX: 3, god -80%' },
  { id: 'sombra', name: 'Shadow Bounce', type: 'oscuridad', desc: 'Orbs bounce once off the floor. MAX: +1 extra life' }
];

export const specialById = (id) => SPECIALS.find((s) => s.id === id) ?? null;
