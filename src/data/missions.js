// Misiones de captura y de progreso. Cada una calcula su avance a partir del guardado
// (y de la partida en curso, si se pasa `run`). Las recompensas se definirán más adelante.
import { CREATURES } from './creatures.js';
import { TYPES, TYPE_ORDER } from './types.js';

const caughtList = (d) => CREATURES.filter((c) => d.collection[c.id]);
const fmt = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.');

const capture = [
  ...[10, 25, 50, 100, 250].map((n) => ({
    id: `cap_${n}`, title: `Captura ${n} bestias`, target: n, progress: (d) => d.stats.captures
  })),
  ...[10, 20, 30].map((n) => ({
    id: `uniq_${n}`, title: `${n} bestias distintas`, target: n, progress: (d) => caughtList(d).length
  })),
  { id: 'uniq_all', title: 'Completa la colección', target: CREATURES.length, progress: (d) => caughtList(d).length },
  ...TYPE_ORDER.map((t) => ({
    id: `type_${t}`,
    title: `Todas las de tipo ${TYPES[t].name}`,
    target: CREATURES.filter((c) => c.type === t && !c.legendary).length,
    progress: (d) => caughtList(d).filter((c) => c.type === t && !c.legendary).length
  })),
  { id: 'legend_1', title: 'Captura un legendario', target: 1, progress: (d) => caughtList(d).filter((c) => c.legendary).length },
  { id: 'legend_all', title: 'Captura los 8 legendarios', target: 8, progress: (d) => caughtList(d).filter((c) => c.legendary).length },
  { id: 'shiny_1', title: 'Captura una shiny', target: 1, progress: (d) => d.stats.shinies },
  { id: 'shiny_5', title: 'Captura 5 shiny', target: 5, progress: (d) => d.stats.shinies }
].map((m) => ({ ...m, cat: 'captura' }));

const progress = [
  ...[5000, 20000, 50000].map((n) => ({
    id: `score_${n}`, title: `${fmt(n)} puntos en una partida`, target: n,
    progress: (d, run) => Math.max(d.bestScore, Math.floor(run?.score ?? 0))
  })),
  ...[20, 40, 60].map((n) => ({
    id: `turn_${n}`, title: `Llega al turno ${n}`, target: n,
    progress: (d, run) => Math.max(d.stats.bestTurn, run?.turn ?? 0)
  })),
  ...[1, 5, 20].map((n) => ({
    id: `boss_${n}`, title: n === 1 ? 'Derrota un legendario' : `Derrota ${n} legendarios`, target: n,
    progress: (d) => d.stats.bossKills
  })),
  ...[1, 10].map((n) => ({
    id: `clear_${n}`, title: n === 1 ? 'Limpia la pantalla' : `Limpia la pantalla ${n} veces`, target: n,
    progress: (d) => d.stats.clears
  })),
  ...[10, 50].map((n) => ({ id: `power_${n}`, title: `Usa ${n} poderes`, target: n, progress: (d) => d.stats.powersUsed })),
  { id: 'games_10', title: 'Juega 10 partidas', target: 10, progress: (d) => d.stats.games }
].map((m) => ({ ...m, cat: 'progreso' }));

export const MISSIONS = [...capture, ...progress];

export function missionProgress(m, data, run) {
  return Math.min(m.target, Math.max(0, m.progress(data, run) || 0));
}

/** Misiones cumplidas que aún no estaban marcadas como completadas. */
export function newlyCompleted(data, run) {
  return MISSIONS.filter((m) => !data.missions[m.id] && missionProgress(m, data, run) >= m.target);
}
