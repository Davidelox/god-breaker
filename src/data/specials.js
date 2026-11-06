// Tiros especiales: se cargan con energía y su tipo aplica la tabla de eficacia.
export const SPECIAL_COST = 100;

export const SPECIALS = [
  { id: 'estallido', name: 'Estallido ígneo', type: 'fuego', desc: 'Las bolas explotan y dañan alrededor' },
  { id: 'torrente', name: 'Torrente', type: 'agua', desc: 'Cada bola atraviesa hasta 3 bloques (MAX: todos)' },
  { id: 'enredadera', name: 'Enredadera', type: 'planta', desc: 'Disparas el doble de bolas' },
  { id: 'arco', name: 'Arco voltaico', type: 'electrico', desc: 'Cada golpe salta a 2 bloques' },
  { id: 'escarcha', name: 'Escarcha', type: 'hielo', desc: 'Las bolas hacen el doble de daño' },
  { id: 'derrumbe', name: 'Derrumbe', type: 'roca', desc: 'Rocas a los 2 bloques con más vida: -50% (legendario -30%)' }
];

export const specialById = (id) => SPECIALS.find((s) => s.id === id) ?? null;
