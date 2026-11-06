import { describe, it, expect } from 'vitest';
import { effectiveness, TYPES, CHART, TYPE_ORDER } from '../src/data/types.js';
import { CREATURES, LEGENDARIES } from '../src/data/creatures.js';
import { SPECIALS } from '../src/data/specials.js';

describe('datos', () => {
  it('calcula la eficacia de tipos', () => {
    expect(effectiveness('fuego', 'planta')).toBe(2);
    expect(effectiveness('fuego', 'agua')).toBe(0.5);
    expect(effectiveness('fuego', 'fantasma')).toBe(1);
    expect(effectiveness(undefined, 'agua')).toBe(1);
  });

  it('la tabla solo usa tipos existentes', () => {
    for (const [t, row] of Object.entries(CHART)) {
      expect(TYPES[t]).toBeDefined();
      for (const d of [...row.strong, ...row.weak]) expect(TYPE_ORDER).toContain(d);
    }
  });

  it('cada criatura tiene id único, tipo válido y un legendario por tipo', () => {
    const ids = new Set(CREATURES.map((c) => c.id));
    expect(ids.size).toBe(CREATURES.length);
    for (const c of CREATURES) expect(TYPES[c.type]).toBeDefined();
    expect(new Set(LEGENDARIES.map((l) => l.type)).size).toBe(TYPE_ORDER.length);
  });

  it('los especiales usan tipos válidos', () => {
    for (const s of SPECIALS) expect(TYPES[s.type]).toBeDefined();
  });
});
