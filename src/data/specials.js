// Hechizos elementales: se cargan con la barra de magia. Cada elemento tiene su color.
export const SPECIAL_COST = 100;

export const ELEMENTS = {
  fuego: { name: 'Fire', short: 'FIR', base: '#e8613c', light: '#ffa25c', dark: '#a8322a' },
  agua: { name: 'Water', short: 'WAT', base: '#3c8ce8', light: '#78c0ff', dark: '#24569c' },
  planta: { name: 'Nature', short: 'NAT', base: '#4cb04c', light: '#8ce070', dark: '#2c703c' },
  electrico: { name: 'Thunder', short: 'THU', base: '#f0c830', light: '#fff07a', dark: '#b08420' },
  hielo: { name: 'Ice', short: 'ICE', base: '#8cd8f0', light: '#d4f4ff', dark: '#4c94b8' },
  roca: { name: 'Earth', short: 'EAR', base: '#a08868', light: '#c8b08c', dark: '#685440' }
};

// Los id se mantienen de la versión con «poderes» (los usa la lógica del juego).
export const SPECIALS = [
  { id: 'estallido', name: 'Fireball', type: 'fuego', desc: 'Orbs explode and hit nearby blocks' },
  { id: 'torrente', name: 'Tidal Wave', type: 'agua', desc: 'Each orb pierces up to 3 blocks (MAX: all)' },
  { id: 'enredadera', name: 'Overgrowth', type: 'planta', desc: 'You launch twice as many orbs' },
  { id: 'arco', name: 'Chain Lightning', type: 'electrico', desc: 'Each hit jumps to 2 blocks' },
  { id: 'escarcha', name: 'Ice Lance', type: 'hielo', desc: 'Orbs deal double damage' },
  { id: 'derrumbe', name: 'Stone Rain', type: 'roca', desc: 'Rocks hit the 2 toughest blocks: -50% HP (gods -30%)' }
];

export const specialById = (id) => SPECIALS.find((s) => s.id === id) ?? null;
