import { describe, it, expect } from 'vitest';
import { sanitizeRun, loadRun, saveRun, clearRun, RUN_KEY, RUN_VERSION } from '../src/core/run.js';
import { memoryStorage } from '../src/core/save.js';

const sample = () => ({
  v: RUN_VERSION,
  turn: 12,
  score: 3400,
  ballCount: 14,
  legendBag: [5, 999999],
  powers: ['estallido', 7],
  balls: { super: 2, ultra: 1 },
  selectedBall: 'super',
  launchX: 140,
  weather: 2,
  runCaptures: [{ id: 5, shiny: true }],
  blocks: [
    { col: 1, row: 3, size: 1, kind: 'plain', hp: 10, maxHp: 15 },
    { col: 2, row: 1, size: 2, kind: 'boss', id: 5, hp: 80, maxHp: 120, shiny: false },
    { col: 4, row: 2, size: 1, kind: 'creature', id: 999999, hp: 8 },
    { col: 5, row: 2, size: 1, kind: 'plain', hp: 0 }
  ],
  pickups: [{ col: 6, row: 1 }]
});
const validId = (id) => id !== 999999;

describe('partida guardada', () => {
  it('conserva el estado y descarta lo que no vale', () => {
    const run = sanitizeRun(sample(), validId);
    expect(run.turn).toBe(12);
    expect(run.legendBag).toEqual([5]);
    expect(run.powers).toEqual(['estallido']);
    expect(run.blocks.map((b) => b.kind)).toEqual(['plain', 'boss']);
    expect(run.blocks[1]).toMatchObject({ w: 3, h: 2, id: 5, hp: 80, maxHp: 120 });
    expect(run.pickups).toEqual([{ col: 6, row: 1 }]);
  });

  it('rechaza versiones distintas o datos rotos', () => {
    expect(sanitizeRun({ ...sample(), v: 99 })).toBeNull();
    expect(sanitizeRun({ v: RUN_VERSION, turn: 0 })).toBeNull();
    expect(sanitizeRun(null)).toBeNull();
  });

  it('guarda, carga y borra', () => {
    const storage = memoryStorage();
    expect(loadRun(storage)).toBeNull();
    saveRun(sample(), storage);
    expect(loadRun(storage, validId).score).toBe(3400);
    clearRun(storage);
    expect(loadRun(storage)).toBeNull();
    storage.setItem(RUN_KEY, '{roto');
    expect(loadRun(storage)).toBeNull();
    expect(storage.getItem(RUN_KEY)).toBeNull();
  });
});
