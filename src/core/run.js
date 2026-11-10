// Guardado automático de la partida en curso (aparte del guardado principal).
// Se guarda al empezar cada turno, con los orbes quietos: al volver se sigue desde ese turno.
// Se borra al perder o al empezar una partida nueva.
import { logError } from './errors.js';
import { COLS, GOD_W, GOD_H } from '../config.js';

export const RUN_KEY = 'godbreaker.run';
export const RUN_VERSION = 1;

const num = (n, def = 0) => (Number.isFinite(n) ? n : def);
const int = (n, def = 0) => Math.max(0, Math.floor(num(n, def)));

/**
 * Comprueba y corrige una partida guardada. Devuelve null si no vale (versión distinta,
 * formato roto o sin bloques válidos que colocar).
 * @param {object} raw
 * @param {(id:number)=>boolean} [validId] dice si existe una criatura con ese id
 */
export function sanitizeRun(raw, validId = () => true) {
  if (!raw || typeof raw !== 'object' || raw.v !== RUN_VERSION) return null;
  const turn = int(raw.turn);
  if (turn < 1) return null;
  const blocks = (Array.isArray(raw.blocks) ? raw.blocks : [])
    .filter((b) => b && Number.isInteger(b.col) && Number.isInteger(b.row) && num(b.hp) > 0)
    .filter((b) => b.id == null || validId(b.id))
    .map((b) => {
      const kind = ['plain', 'creature', 'boss'].includes(b.kind) ? b.kind : 'plain';
      // Los dioses ocupan GOD_W x GOD_H (las partidas de antes los guardaban de 2x2)
      const boss = kind === 'boss';
      return {
        col: boss ? Math.min(b.col, COLS - GOD_W) : b.col,
        row: b.row,
        w: boss ? GOD_W : 1,
        h: boss ? GOD_H : 1,
        kind,
        id: b.id ?? null,
        hp: num(b.hp),
        maxHp: Math.max(num(b.hp), num(b.maxHp, b.hp)),
        shiny: b.shiny === true
      };
    })
    .filter((b) => b.kind === 'plain' || b.id != null);
  const strings = (a) => (Array.isArray(a) ? a.filter((x) => typeof x === 'string') : []);
  return {
    v: RUN_VERSION,
    turn,
    score: int(raw.score),
    ballCount: Math.max(1, int(raw.ballCount, 1)),
    pickupCooldown: int(raw.pickupCooldown),
    legendBag: (Array.isArray(raw.legendBag) ? raw.legendBag : []).filter((id) => validId(id)),
    energy: int(raw.energy),
    powers: strings(raw.powers).slice(0, 2),
    balls: { super: int(raw.balls?.super), ultra: int(raw.balls?.ultra) },
    selectedBall: ['normal', 'super', 'ultra'].includes(raw.selectedBall) ? raw.selectedBall : 'normal',
    shinyMeter: int(raw.shinyMeter),
    shinyBoostTurns: int(raw.shinyBoostTurns),
    bossPending: raw.bossPending === true,
    extraLife: raw.extraLife === true,
    launchX: num(raw.launchX, null),
    weather: int(raw.weather),
    // Tema del tablero (origen mitológico); las partidas de antes usaban greek / egypt / norse
    stage: { greek: 'griega', egypt: 'egipcia', norse: 'nordica' }[raw.stage] ?? (typeof raw.stage === 'string' ? raw.stage : 'griega'),
    runStats: Object.fromEntries(['blocks', 'beasts', 'gods', 'spells', 'bestShot'].map((k) => [k, int(raw.runStats?.[k])])),
    runCaptures: (Array.isArray(raw.runCaptures) ? raw.runCaptures : [])
      .filter((c) => c && validId(c.id))
      .map((c) => ({ id: c.id, shiny: c.shiny === true })),
    blocks,
    pickups: (Array.isArray(raw.pickups) ? raw.pickups : [])
      .filter((p) => p && Number.isInteger(p.col) && Number.isInteger(p.row))
      .map((p) => ({ col: p.col, row: p.row }))
  };
}

export function loadRun(storage = globalThis.localStorage, validId) {
  try {
    const text = storage?.getItem(RUN_KEY);
    if (!text) return null;
    const run = sanitizeRun(JSON.parse(text), validId);
    if (!run) storage.removeItem(RUN_KEY);
    return run;
  } catch (err) {
    logError('run-load', err);
    try {
      storage?.removeItem(RUN_KEY);
    } catch {
      /* ignorado */
    }
    return null;
  }
}

export function saveRun(run, storage = globalThis.localStorage) {
  try {
    storage?.setItem(RUN_KEY, JSON.stringify({ ...run, v: RUN_VERSION }));
    return true;
  } catch (err) {
    logError('run-save', err);
    return false;
  }
}

export function clearRun(storage = globalThis.localStorage) {
  try {
    storage?.removeItem(RUN_KEY);
  } catch {
    /* ignorado */
  }
}
