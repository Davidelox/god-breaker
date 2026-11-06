import { describe, it, expect, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { validateCreatures } from '../src/data/pack.js';
import { DEFAULT_CREATURES } from '../src/data/creatures.js';

vi.spyOn(console, 'error').mockImplementation(() => {});

describe('pack de criaturas', () => {
  it('acepta entradas válidas y descarta las erróneas', () => {
    const { list, errors } = validateCreatures([
      { id: 1, nombre: 'Uno', tipo: 'fuego', rareza: 1, legendaria: false },
      { id: 2, nombre: 'Dos', tipo: 'inventado', rareza: 1 },
      { id: 1, nombre: 'Repetido', tipo: 'agua', rareza: 1 },
      { id: 3, nombre: 'Leyenda', tipo: 'roca', legendaria: true, imagen: 'criaturas/3.png' },
      { id: 4, nombre: '', tipo: 'agua', rareza: 2 },
      { id: 5, nombre: 'Rara', tipo: 'hielo', rareza: 7 }
    ]);
    expect(list.map((c) => c.id)).toEqual([1, 3]);
    expect(list[1]).toMatchObject({ legendary: true, rarity: 4, image: 'criaturas/3.png' });
    expect(errors.length).toBe(4);
  });

  it('el pack provisional tiene 1025 criaturas válidas y mantiene las 72 originales', () => {
    const pack = JSON.parse(readFileSync(new URL('../public/pack/criaturas.json', import.meta.url), 'utf8'));
    const { list, errors } = validateCreatures(pack.criaturas);
    expect(errors).toEqual([]);
    expect(list.length).toBe(1025);
    for (const c of DEFAULT_CREATURES) expect(list.find((x) => x.id === c.id)).toMatchObject({ name: c.name, type: c.type });
  });
});
