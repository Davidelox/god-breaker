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
// Las doradas no cuentan en las misiones de capturas generales (solo en las de doradas)
const normalCaptures = (d) => Math.max(0, d.stats.captures - d.stats.shinies);
/** Especies que tienes en dorado (cada dorada solo se captura una vez). */
const goldSpecies = (d) => CREATURES.filter((c) => d.collection[c.id]?.shinyCount > 0).length;
const fmt = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

function buildCapture() {
  return [
  ...[50, 150, 350, 600, 800].map((n) => ({
    id: `cap_${n}`, title: `Capture ${n} beasts`, target: n, progress: normalCaptures
  })),
  ...[50, 125, 300, 500].map((n) => ({
    id: `uniq_${n}`, title: `${n} different beasts`, target: n, progress: (d) => caughtList(d).length
  })),
  { id: 'uniq_all', title: 'Complete the collection', target: CREATURES.length, progress: (d) => caughtList(d).length },
  ...TYPE_ORDER.map((t) => ({
    id: `type_${t}`,
    title: `All ${TYPES[t].name} beasts`,
    target: CREATURES.filter((c) => c.type === t && !c.legendary).length,
    progress: (d) => caughtList(d).filter((c) => c.type === t && !c.legendary).length
  })),
  { id: 'legend_60', title: 'Capture 60 different gods', target: 60, progress: (d) => caughtList(d).filter((c) => c.legendary).length },
  { id: 'legend_all', title: `Capture all ${LEGENDARIES.length} gods`, target: Math.max(1, LEGENDARIES.length), progress: (d) => caughtList(d).filter((c) => c.legendary).length },
  { id: 'shiny_200', title: 'Capture 200 gold beasts', target: 200, progress: goldSpecies },
  { id: 'shiny_400', title: 'Capture 400 gold beasts', target: 400, progress: goldSpecies },
  { id: 'shiny_all', title: `Capture all ${CREATURES.length} gold beasts`, target: CREATURES.length, progress: goldSpecies }
].map((m) => ({ ...m, cat: 'captura' }));
}

/** Orígenes abiertos desde el principio; el resto se desbloquea con misiones. */
export const BASE_ORIGINS = ['griega', 'nordica', 'egipcia'];

/** Camino de desbloqueo: [origen, tipo de misión, objetivo]. */
// Se alternan misiones de habilidad (turno en una partida) y de constancia (capturas acumuladas).
const UNLOCK_PATH = [
  ['celta', 'cap', 50],
  ['eslava', 'turn', 50],
  ['iberica', 'cap', 200],
  ['europea', 'turn', 75],
  ['japonesa', 'godcap', 30],
  ['asiatica', 'turn', 100],
  ['indomalaya', 'uniq', 300],
  ['medioriental', 'turn', 125],
  ['americana', 'cap', 500],
  ['africana', 'godcap', 100],
  ['oceanica', 'turn', 150]
];

/** Dioses capturados contando las repeticiones. */
const godCaptures = (d) => CREATURES.reduce((n, c) => {
  const e = c.legendary && d.collection[c.id];
  return n + (e ? Math.max(0, e.count - e.shinyCount) : 0); // sin contar las doradas
}, 0);

const unlockTitle = (kind, n) =>
  kind === 'turn' ? `Reach turn ${n}` : kind === 'cap' ? `Capture ${n} beasts` : kind === 'godcap' ? `Capture ${n} gods` : kind === 'boss' ? (n === 1 ? 'Defeat a god' : `Defeat ${n} gods`) : `${n} different beasts`;
const unlockProgress = (kind) =>
  kind === 'turn' ? (d, run) => Math.max(d.stats.bestTurn, run?.turn ?? 0)
    : kind === 'cap' ? normalCaptures
      : kind === 'boss' ? (d) => d.stats.bossKills
        : kind === 'godcap' ? godCaptures
        : (d) => caughtList(d).length;

const unlocks = () => UNLOCK_PATH.map(([origin, kind, n]) => ({
  id: `unlock_${origin}`, title: unlockTitle(kind, n), target: n, progress: unlockProgress(kind),
  cat: 'desbloqueo', reward: { unlock: origin }
}));

/** Misiones grandes: dan un orbe Divino; el resto, uno Rúnico. */
const BIG = new Set(['cap_600', 'cap_800', 'uniq_500', 'uniq_all', 'legend_all', 'shiny_10', 'score_100000', 'turn_75', 'boss_30', 'clear_20', 'power_100']);
const withReward = (m) => ({
  ...m,
  reward: TITLES[m.id] ? { title: m.id } : AVATARS[m.id] ? { avatar: m.id } : { orb: BIG.has(m.id) || m.id.startsWith('type_') ? 'ultra' : 'super' }
});

// Especiales (la categoría interna sigue siendo «progreso»). Las «en una partida» usan el récord
// guardado y la partida en curso (run).
const progress = [
  ...[75000, 125000, 150000].map((n) => ({
    id: `score_${n}`, title: `${fmt(n)} points in one game`, target: n,
    progress: (d, run) => Math.max(d.bestScore, Math.floor(run?.score ?? 0))
  })),
  ...[125, 175, 205].map((n) => ({
    id: `turn_${n}`, title: `Reach turn ${n}`, target: n,
    progress: (d, run) => Math.max(d.stats.bestTurn, run?.turn ?? 0)
  })),
  ...[20, 40, 100].map((n) => ({
    id: `maxboss_${n}`, title: `Defeat ${n} gods with a MAX spell`, target: n,
    progress: (d) => d.stats.maxBossKills ?? 0
  })),
  ...[5, 10].map((n) => ({
    id: `clearrun_${n}`, title: `Clear the board ${n} times in one game`, target: n,
    progress: (d, run) => Math.max(d.stats.bestRunClears ?? 0, run?.clears ?? 0)
  })),
  { id: 'clear_100', title: 'Clear the board 100 times', target: 100, progress: (d) => d.stats.clears },
  {
    id: 'combo_15', title: 'Cast 15 different combos in one game', target: 15,
    progress: (d, run) => Math.max(d.stats.bestRunCombos ?? 0, run?.combos ?? 0)
  },
  { id: 'power_300', title: 'Cast 300 spells', target: 300, progress: (d) => d.stats.powersUsed },
  { id: 'shotcap_3', title: 'Capture 3 beings in one shot', target: 3, progress: (d) => d.stats.bestShotCaptures ?? 0 },
  { id: 'bestshot_45', title: 'Destroy 45 blocks in one shot', target: 45, progress: (d) => d.stats.bestShotKills ?? 0 },
  { id: 'vertical_50', title: 'Perform 50 vertical strikes', target: 50, progress: (d) => d.stats.verticalAttacks ?? 0 },
  {
    id: 'nomagic_100', title: 'Reach turn 100 without casting spells', target: 100,
    progress: (d, run) => Math.max(d.stats.bestNoMagicTurn ?? 0, run?.noMagicTurn ?? 0)
  },
  { id: 'godstreak_3', title: 'Capture 3 gods in a row with a Runic or Divine orb', target: 3, progress: (d) => d.stats.bestGodStreak ?? 0 }
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

/** Misión de orígenes: su recompensa (abrir un origen) se cobra sola, pero solo al acabar la partida. */
export const isOriginMission = (m) => m.cat === 'desbloqueo';

/**
 * Marca como completadas las misiones ya cumplidas (fuera de la partida). Las de orígenes solo
 * cuentan si `origins` (no hay partida en curso) y abren su origen al momento; las demás quedan
 * pendientes de cobrar en el menú de misiones. Devuelve las misiones nuevas.
 */
export function claimMissions(save, { origins = true } = {}) {
  const list = newlyCompleted(save.data, null, { origins });
  save.completeMissions(list.map((m) => m.id));
  for (const m of list) if (isOriginMission(m)) save.claimMission(m.id);
  return list;
}

/** Misiones cumplidas que aún no estaban marcadas como completadas. */
export function newlyCompleted(data, run, { origins = true } = {}) {
  return MISSIONS.filter((m) => (origins || !isOriginMission(m)) && !data.missions[m.id] && missionProgress(m, data, run) >= m.target);
}

/** Misiones completadas cuya recompensa aún no se ha cobrado en el menú de misiones. */
export const claimableMissions = (data) => MISSIONS.filter((m) => !isOriginMission(m) && data.missions[m.id] && !data.claimed?.[m.id]);

/** Cobra la recompensa de una misión completada (el orbe va al banco). Devuelve la misión o null. */
export function claimReward(save, id) {
  const m = MISSIONS.find((x) => x.id === id);
  if (!m || isOriginMission(m) || !save.claimMission(id)) return null;
  if (m.reward?.orb) save.addBank(m.reward.orb);
  return m;
}
