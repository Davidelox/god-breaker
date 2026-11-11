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
    d.stats.captures = 30;
    const cap25 = MISSIONS.find((m) => m.id === 'cap_25');
    const score = MISSIONS.find((m) => m.id === 'score_10000');
    expect(missionProgress(cap25, d)).toBe(25);
    expect(missionProgress(score, d, { score: 12000 })).toBe(10000);
    const ids = newlyCompleted(d, { score: 12000, turn: 3 }).map((m) => m.id);
    expect(ids).toContain('cap_25');
    expect(ids).toContain('score_10000');
    expect(ids).not.toContain('cap_75');
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

import { unlockedOrigins, BASE_ORIGINS, unlockMissionFor, claimMissions, claimableMissions, claimReward } from '../src/data/missions.js';
import { TYPE_ORDER } from '../src/data/types.js';

describe('desbloqueos y recompensas', () => {
  it('al principio solo están abiertos los orígenes base', () => {
    expect([...unlockedOrigins(defaultSave())].sort()).toEqual([...BASE_ORIGINS].sort());
  });
  it('cada origen bloqueado tiene una misión que lo abre', () => {
    for (const o of TYPE_ORDER) if (!BASE_ORIGINS.includes(o)) expect(unlockMissionFor(o), o).not.toBeNull();
  });
  it('completar una misión de desbloqueo abre su origen', () => {
    const d = defaultSave();
    d.stats.bestTurn = 21;
    const ids = newlyCompleted(d).map((m) => m.id);
    expect(ids).toContain('unlock_celta');
    d.missions.unlock_celta = 'x';
    expect(unlockedOrigins(d).has('celta')).toBe(true);
  });
  it('captura da títulos, progreso da avatares; los orbes se guardan para la siguiente partida', () => {
    for (const m of MISSIONS) expect(m.reward?.unlock || m.reward?.title || m.reward?.avatar || m.reward?.orb, m.id).toBeTruthy();
    for (const m of MISSIONS.filter((x) => x.cat === 'captura')) expect(m.reward.title, m.id).toBeTruthy();
    for (const m of MISSIONS.filter((x) => x.cat === 'progreso')) expect(m.reward.avatar, m.id).toBeTruthy();
    const s = new SaveStore(memoryStorage(), CREATURE_IDS);
    s.load();
    s.addBank('super');
    s.addBank('ultra', 2);
    expect(s.takeBank()).toEqual({ super: 1, ultra: 2 });
    expect(s.takeBank()).toEqual({ super: 0, ultra: 0 });
  });
});

import { currentTitle, currentAvatar, avatarOrb, DEFAULT_TITLE, AVATARS, AVATAR_STYLES } from '../src/data/profile.js';
import { LEGENDARIES } from '../src/data/creatures.js';

describe('perfil', () => {
  it('título y avatar solo cuentan si se ha recogido la recompensa de su misión', () => {
    const d = defaultSave();
    d.profile = { title: 'cap_25', avatar: 'boss_3' };
    expect(currentTitle(d)).toBe(DEFAULT_TITLE);
    expect(currentAvatar(d)).toBeNull();
    d.missions.cap_25 = 'x';
    d.missions.boss_3 = 'x';
    expect(currentTitle(d)).toBe(DEFAULT_TITLE); // completadas pero sin recoger
    d.claimed.cap_25 = 'x';
    d.claimed.boss_3 = 'x';
    expect(currentTitle(d)).toBe('Hunter');
    expect(currentAvatar(d)).toBe('boss_3');
    expect(avatarOrb('boss_3').stops[2]).toBe('#ffc820');
    expect(avatarOrb('boss_3').mark).toBe('star');
  });
  it('cada mascota celestial tiene dibujo, paleta, marca y adorno', () => {
    for (const a of Object.values(AVATARS)) {
      expect(a.art && a.pet && a.name, a.pet).toBeTruthy();
      expect(AVATAR_STYLES[a.style], a.style).toBeTruthy();
      expect(a.mark, a.pet).toBeTruthy();
    }
  });
});

describe('recompensas: orígenes al acabar la partida, el resto a mano', () => {
  const store = () => {
    const s = new SaveStore(memoryStorage(), CREATURE_IDS);
    s.load();
    return s;
  };
  it('las misiones de orígenes no se completan mientras hay una partida en curso', () => {
    const s = store();
    s.data.stats.bestTurn = 21;
    expect(newlyCompleted(s.data, null, { origins: false }).map((m) => m.id)).not.toContain('unlock_celta');
    claimMissions(s, { origins: false });
    expect(unlockedOrigins(s.data).has('celta')).toBe(false);
    claimMissions(s, { origins: true });
    expect(unlockedOrigins(s.data).has('celta')).toBe(true);
    expect(s.data.claimed.unlock_celta).toBeTruthy(); // los orígenes se abren solos
  });
  it('el resto se completa pero su recompensa hay que recogerla', () => {
    const s = store();
    s.data.stats.captures = 30;
    s.data.profile.title = 'cap_25';
    claimMissions(s, { origins: false });
    expect(s.data.missions.cap_25).toBeTruthy();
    expect(claimableMissions(s.data).map((m) => m.id)).toContain('cap_25');
    expect(currentTitle(s.data)).toBe(DEFAULT_TITLE);
    expect(claimReward(s, 'cap_25')?.id).toBe('cap_25');
    expect(claimReward(s, 'cap_25')).toBeNull(); // no se cobra dos veces
    expect(currentTitle(s.data)).toBe('Hunter');
    expect(claimableMissions(s.data).map((m) => m.id)).not.toContain('cap_25');
  });
  it('los guardados antiguos dan por recogido lo que ya estaba completado', () => {
    const mem = memoryStorage();
    mem.setItem('beastbreaker.save', JSON.stringify({ version: 1, missions: { cap_25: '2026-01-01' } }));
    const s = new SaveStore(mem, CREATURE_IDS);
    s.load();
    expect(s.data.claimed.cap_25).toBe('2026-01-01');
  });
});
