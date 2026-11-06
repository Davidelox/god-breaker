import { describe, it, expect } from 'vitest';
import { MISSIONS, missionProgress, newlyCompleted } from '../src/data/missions.js';
import { defaultSave, SaveStore, memoryStorage } from '../src/core/save.js';
import { CREATURE_IDS } from '../src/data/creatures.js';

describe('misiones', () => {
  it('tienen id único y objetivo positivo', () => {
    expect(new Set(MISSIONS.map((m) => m.id)).size).toBe(MISSIONS.length);
    for (const m of MISSIONS) expect(m.target).toBeGreaterThan(0);
  });

  it('cuentan el progreso desde el guardado y la partida en curso', () => {
    const d = defaultSave();
    d.stats.captures = 12;
    const cap10 = MISSIONS.find((m) => m.id === 'cap_10');
    const score = MISSIONS.find((m) => m.id === 'score_5000');
    expect(missionProgress(cap10, d)).toBe(10);
    expect(missionProgress(score, d, { score: 6200 })).toBe(5000);
    const ids = newlyCompleted(d, { score: 6200, turn: 3 }).map((m) => m.id);
    expect(ids).toContain('cap_10');
    expect(ids).toContain('score_5000');
    expect(ids).not.toContain('cap_25');
  });

  it('no repite misiones ya completadas', () => {
    const s = new SaveStore(memoryStorage(), CREATURE_IDS);
    s.load();
    s.recordCapture(1, false);
    expect(s.completeMissions(['legend_1', 'cap_10'])).toEqual(['legend_1', 'cap_10']);
    expect(s.completeMissions(['cap_10'])).toEqual([]);
    const again = new SaveStore(s.storage, CREATURE_IDS);
    again.load();
    expect(Object.keys(again.data.missions)).toEqual(['legend_1', 'cap_10']);
  });
});
