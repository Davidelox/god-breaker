import { describe, it, expect, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { validateCreatures } from '../src/data/pack.js';
import { DEFAULT_CREATURES } from '../src/data/creatures.js';

vi.spyOn(console, 'error').mockImplementation(() => {});

describe('pack de criaturas', () => {
  it('acepta entradas válidas y descarta las erróneas', () => {
    const { list, errors } = validateCreatures([
      { id: 1, nombre: 'Uno', origen: 'griega', rareza: 1, legendaria: false, sprite: 'hum c:red' },
      { id: 2, nombre: 'Dos', origen: 'inventado', rareza: 1 },
      { id: 1, nombre: 'Repetido', origen: 'japonesa', rareza: 1 },
      { id: 3, nombre: 'Leyenda', tipo: 'nordica', legendaria: true, panteon: 'nordica', imagen: 'criaturas/3.png' },
      { id: 4, nombre: '', origen: 'celta', rareza: 2 },
      { id: 5, nombre: 'Rara', origen: 'eslava', rareza: 7 }
    ]);
    expect(list.map((c) => c.id)).toEqual([1, 3]);
    expect(list[0]).toMatchObject({ type: 'griega', art: 'hum c:red' });
    expect(list[1]).toMatchObject({ type: 'nordica', legendary: true, rarity: 4, pantheon: 'nordica', image: 'criaturas/3.png' });
    expect(errors.length).toBe(4);
  });

  it('el pack incluido es el bestiario completo (600 bestias, 100 dioses)', () => {
    const pack = JSON.parse(readFileSync(new URL('../public/pack/criaturas.json', import.meta.url), 'utf8'));
    const { list, errors } = validateCreatures(pack.criaturas);
    expect(errors).toEqual([]);
    expect(list.length).toBe(600);
    expect(list.filter((c) => c.legendary).length).toBe(100);
    for (const c of DEFAULT_CREATURES) {
      expect(list.find((x) => x.id === c.id)).toMatchObject({ name: c.name, type: c.type, pantheon: c.pantheon, art: c.art });
    }
  });
});
