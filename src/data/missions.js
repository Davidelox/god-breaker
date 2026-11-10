// Misiones de desbloqueo, captura y progreso. Cada una calcula su avance a partir del guardado
// (y de la partida en curso, si se pasa `run`) y tiene una recompensa:
// - Desbloqueo: abre un origen mitológico nuevo (sus bestias y dioses empiezan a salir).
// - Captura: un título para el perfil (ver profile.js).
// - Progreso: un avatar (dios rediseñado) que también cambia el orbe común.
// (Las misiones sin título ni avatar darían un orbe para la siguiente partida.)
import { CREATURES, LEGENDARIES } from './creatures.js';
import { TYPES, TYPE_ORDER } from './types.js';
import { TITLES, AVATARS } from './profile.js';

const caughtList = (d) => CREATURES.filter((c) => d.collection[c.id]);
const fmt = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

function buildCapture() {
  return [
  ...[10, 25, 50, 100, 250].map((n) => ({
    id: `cap_${n}`, title: `Capture ${n} beasts`, target: n, progress: (d) => d.stats.captures
  })),
  ...[10, 20, 30, 50].map((n) => ({
    id: `uniq_${n}`, title: `${n} different beasts`, target: n, progress: (d) => caughtList(d).length
  })),
  { id: 'uniq_all', title: 'Complete the collection', target: CREATURES.length, progress: (d) => caughtList(d).length },
  ...TYPE_ORDER.map((t) => ({
    id: `type_${t}`,
    title: `All ${TYPES[t].name} beasts`,
    target: CREATURES.filter((c) => c.type === t && !c.legendary).length,
    progress: (d) => caughtList(d).filter((c) => c.type === t && !c.legendary).length
  })),
  { id: 'legend_1', title: 'Capture a god', target: 1, progress: (d) => caughtList(d).filter((c) => c.legendary).length },
  { id: 'legend_all', title: `Capture all ${LEGENDARIES.length} gods`, target: Math.max(1, LEGENDARIES.length), progress: (d) => caughtList(d).filter((c) => c.legendary).length },
  { id: 'shiny_1', title: 'Capture a gold beast', target: 1, progress: (d) => d.stats.shinies },
  { id: 'shiny_5', title: 'Capture 5 gold beasts', target: 5, progress: (d) => d.stats.shinies }
].map((m) => ({ ...m, cat: 'captura' }));
}

/** Orígenes abiertos desde el principio; el resto se desbloquea con misiones. */
export const BASE_ORIGINS = ['griega', 'nordica', 'egipcia'];

/** Camino de desbloqueo: [origen, tipo de misión, objetivo]. */
const UNLOCK_PATH = [
  ['celta', 'turn', 15],
  ['eslava', 'cap', 20],
  ['iberica', 'turn', 25],
  ['europea', 'cap', 50],
  ['japonesa', 'boss', 3],
  ['asiatica', 'turn', 35],
  ['indomalaya', 'cap', 100],
  ['medioriental', 'uniq', 60],
  ['americana', 'turn', 45],
  ['africana', 'cap', 200],
  ['oceanica', 'turn', 60]
];

const unlockTitle = (kind, n) =>
  kind === 'turn' ? `Reach turn ${n}` : kind === 'cap' ? `Capture ${n} beasts` : kind === 'boss' ? (n === 1 ? 'Defeat a god' : `Defeat ${n} gods`) : `${n} different beasts`;
const unlockProgress = (kind) =>
  kind === 'turn' ? (d, run) => Math.max(d.stats.bestTurn, run?.turn ?? 0)
    : kind === 'cap' ? (d) => d.stats.captures
      : kind === 'boss' ? (d) => d.stats.bossKills
        : (d) => caughtList(d).length;

const unlocks = () => UNLOCK_PATH.map(([origin, kind, n]) => ({
  id: `unlock_${origin}`, title: unlockTitle(kind, n), target: n, progress: unlockProgress(kind),
  cat: 'desbloqueo', reward: { unlock: origin }
}));

/** Misiones grandes: dan un orbe Divino; el resto, uno Rúnico. */
const BIG = new Set(['cap_100', 'cap_250', 'uniq_50', 'uniq_all', 'legend_all', 'shiny_5', 'score_50000', 'turn_60', 'boss_20', 'clear_10', 'power_50']);
const withReward = (m) => ({
  ...m,
  reward: TITLES[m.id] ? { title: m.id } : AVATARS[m.id] ? { avatar: m.id } : { orb: BIG.has(m.id) || m.id.startsWith('type_') ? 'ultra' : 'super' }
});

const progress = [
  ...[5000, 20000, 50000].map((n) => ({
    id: `score_${n}`, title: `${fmt(n)} points in one game`, target: n,
    progress: (d, run) => Math.max(d.bestScore, Math.floor(run?.score ?? 0))
  })),
  ...[20, 40, 60].map((n) => ({
    id: `turn_${n}`, title: `Reach turn ${n}`, target: n,
    progress: (d, run) => Math.max(d.stats.bestTurn, run?.turn ?? 0)
  })),
  ...[1, 5, 20].map((n) => ({
    id: `boss_${n}`, title: n === 1 ? 'Defeat a god' : `Defeat ${n} gods`, target: n,
    progress: (d) => d.stats.bossKills
  })),
  ...[1, 10].map((n) => ({
    id: `clear_${n}`, title: n === 1 ? 'Clear the board' : `Clear the board ${n} times`, target: n,
    progress: (d) => d.stats.clears
  })),
  ...[10, 50].map((n) => ({ id: `power_${n}`, title: `Cast ${n} spells`, target: n, progress: (d) => d.stats.powersUsed })),
  { id: 'games_10', title: 'Play 10 games', target: 10, progress: (d) => d.stats.games }
].map((m) => ({ ...m, cat: 'progreso' }));

export const MISSIONS = [];

/** (Re)calcula las misiones según el catálogo actual (p. ej. tras cargar un pack). */
export function buildMissions() {
  const list = [...unlocks(), ...[...buildCapture(), ...progress].map(withReward)].filter(
    // Fuera las misiones imposibles (p. ej. «50 distintas» con un catálogo de 40)
    (m) => m.target > 0 && !(m.id.startsWith('uniq_') && m.id !== 'uniq_all' && m.target > CREATURES.length)
  );
  MISSIONS.length = 0;
  MISSIONS.push(...list);
}

buildMissions();

export function missionProgress(m, data, run) {
  return Math.min(m.target, Math.max(0, m.progress(data, run) || 0));
}

/** Orígenes desbloqueados: los de partida y los de las misiones de desbloqueo completadas. */
export function unlockedOrigins(data) {
  const set = new Set(BASE_ORIGINS);
  for (const m of MISSIONS) if (m.reward?.unlock && data.missions[m.id]) set.add(m.reward.unlock);
  return set;
}

/** Misión que desbloquea un origen (o null si está abierto desde el principio). */
export const unlockMissionFor = (origin) => MISSIONS.find((m) => m.reward?.unlock === origin) ?? null;

/**
 * Marca como completadas las misiones ya cumplidas (fuera de la partida) y guarda los orbes
 * de recompensa. Devuelve las misiones nuevas.
 */
export function claimMissions(save) {
  const fresh = save.completeMissions(newlyCompleted(save.data).map((m) => m.id));
  const list = fresh.map((id) => MISSIONS.find((m) => m.id === id)).filter(Boolean);
  for (const m of list) if (m.reward?.orb) save.addBank(m.reward.orb);
  return list;
}

/** Misiones cumplidas que aún no estaban marcadas como completadas. */
export function newlyCompleted(data, run) {
  return MISSIONS.filter((m) => !data.missions[m.id] && missionProgress(m, data, run) >= m.target);
}
