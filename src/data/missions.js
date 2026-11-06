// Misiones de captura y de progreso. Cada una calcula su avance a partir del guardado
// (y de la partida en curso, si se pasa `run`). Las recompensas se definirán más adelante.
import { CREATURES, LEGENDARIES } from './creatures.js';
import { TYPES, TYPE_ORDER } from './types.js';

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
  const list = [...buildCapture(), ...progress].filter(
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

/** Misiones cumplidas que aún no estaban marcadas como completadas. */
export function newlyCompleted(data, run) {
  return MISSIONS.filter((m) => !data.missions[m.id] && missionProgress(m, data, run) >= m.target);
}
