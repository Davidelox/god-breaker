import { describe, it, expect } from 'vitest';
import { MISSIONS, missionProgress, newlyCompleted } from '../src/data/missions.js';
import { defaultSave, SaveStore, memoryStorage } from '../src/core/save.js';
import { CREATURE_IDS, CREATURES } from '../src/data/creatures.js';

describe('misiones', () => {
  it('tienen id único y objetivo positivo', () => {
    expect(new Set(MISSIONS.map((m) => m.id)).size).toBe(MISSIONS.length);
    for (const m of MISSIONS) expect(m.target).toBeGreaterThan(0);
  });

  it('cuentan el progreso desde el guardado y la partida en curso', () => {
    const d = defaultSave();
    d.stats.captures = 62;
    d.stats.shinies = 2; // las doradas no cuentan: 60 capturas normales
    const cap25 = MISSIONS.find((m) => m.id === 'cap_50');
    const score = MISSIONS.find((m) => m.id === 'score_75000');
    expect(missionProgress(cap25, d)).toBe(50);
    expect(missionProgress(score, d, { score: 80000 })).toBe(75000);
    const ids = newlyCompleted(d, { score: 80000, turn: 3 }).map((m) => m.id);
    expect(ids).toContain('cap_50');
    expect(ids).toContain('score_75000');
    expect(ids).not.toContain('cap_150');
  });
  it('especiales: récords por partida y del lanzamiento', () => {
    const s = new SaveStore(memoryStorage(), CREATURE_IDS);
    s.load();
    s.bestStat('bestRunClears', 4);
    s.bestStat('bestRunClears', 2); // no baja
    expect(s.data.stats.bestRunClears).toBe(4);
    const run5 = MISSIONS.find((m) => m.id === 'clearrun_5');
    expect(missionProgress(run5, s.data)).toBe(4);
    expect(missionProgress(run5, s.data, { clears: 5 })).toBe(5);
    const nm = MISSIONS.find((m) => m.id === 'nomagic_100');
    expect(missionProgress(nm, s.data, { noMagicTurn: 40 })).toBe(40);
    s.bestStat('bestShotCaptures', 3);
    expect(newlyCompleted(s.data).map((m) => m.id)).toContain('shotcap_3');
  });
  it('las doradas solo cuentan para sus misiones', () => {
    const d = defaultSave();
    d.stats.captures = 60;
    d.stats.shinies = 20;
    const cap = MISSIONS.find((m) => m.id === 'cap_50');
    expect(missionProgress(cap, d)).toBe(40);
    const gold = MISSIONS.find((m) => m.id === 'shiny_200');
    const ids = CREATURES.slice(0, 5).map((c) => c.id);
    for (const id of ids) d.collection[id] = { count: 2, shinyCount: 1 };
    expect(missionProgress(gold, d)).toBe(5);
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
    d.stats.bestTurn = 51;
    const ids = newlyCompleted(d).map((m) => m.id);
    expect(ids).toContain('unlock_eslava');
    d.missions.unlock_eslava = 'x';
    expect(unlockedOrigins(d).has('eslava')).toBe(true);
  });
  it('los dioses capturados cuentan las repeticiones', () => {
    const d = defaultSave();
    const god = CREATURES.find((c) => c.legendary);
    d.collection[god.id] = { count: 30, shinyCount: 0 };
    expect(newlyCompleted(d).map((m) => m.id)).toContain('unlock_japonesa');
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
    d.profile = { title: 'cap_50', avatar: 'maxboss_20' };
    expect(currentTitle(d)).toBe(DEFAULT_TITLE);
    expect(currentAvatar(d)).toBeNull();
    d.missions.cap_50 = 'x';
    d.missions.maxboss_20 = 'x';
    expect(currentTitle(d)).toBe(DEFAULT_TITLE); // completadas pero sin recoger
    d.claimed.cap_50 = 'x';
    d.claimed.maxboss_20 = 'x';
    expect(currentTitle(d)).toBe('Rookie Hunter');
    expect(currentAvatar(d)).toBe('maxboss_20');
    expect(avatarOrb('maxboss_20').stops[2]).toBe('#ece6dc');
    expect(avatarOrb('maxboss_20').eye).toBe('#e83040');
    expect(avatarOrb('maxboss_20').mark).toBe('star');
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
    s.data.stats.bestTurn = 51;
    expect(newlyCompleted(s.data, null, { origins: false }).map((m) => m.id)).not.toContain('unlock_eslava');
    claimMissions(s, { origins: false });
    expect(unlockedOrigins(s.data).has('eslava')).toBe(false);
    claimMissions(s, { origins: true });
    expect(unlockedOrigins(s.data).has('eslava')).toBe(true);
    expect(s.data.claimed.unlock_eslava).toBeTruthy(); // los orígenes se abren solos
  });
  it('el resto se completa pero su recompensa hay que recogerla', () => {
    const s = store();
    s.data.stats.captures = 50;
    s.data.profile.title = 'cap_50';
    claimMissions(s, { origins: false });
    expect(s.data.missions.cap_50).toBeTruthy();
    expect(claimableMissions(s.data).map((m) => m.id)).toContain('cap_50');
    expect(currentTitle(s.data)).toBe(DEFAULT_TITLE);
    expect(claimReward(s, 'cap_50')?.id).toBe('cap_50');
    expect(claimReward(s, 'cap_50')).toBeNull(); // no se cobra dos veces
    expect(currentTitle(s.data)).toBe('Rookie Hunter');
    expect(claimableMissions(s.data).map((m) => m.id)).not.toContain('cap_50');
  });
  it('los guardados antiguos dan por recogido lo que ya estaba completado', () => {
    const mem = memoryStorage();
    mem.setItem('beastbreaker.save', JSON.stringify({ version: 1, missions: { cap_50: '2026-01-01' } }));
    const s = new SaveStore(mem, CREATURE_IDS);
    s.load();
    expect(s.data.claimed.cap_50).toBe('2026-01-01');
  });
});
