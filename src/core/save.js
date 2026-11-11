// Guardado versionado: validación, migraciones y recuperación ante datos corruptos.
import { logError } from './errors.js';
import { SPEEDS } from '../config.js';

export const SAVE_KEY = 'beastbreaker.save';
export const SAVE_VERSION = 1;

export function defaultSave() {
  return {
    version: SAVE_VERSION,
    bestScore: 0,
    collection: {}, // id -> { count, shinyCount, firstAt }
    stats: { games: 0, captures: 0, shinies: 0, bossKills: 0, clears: 0, powersUsed: 0, bestTurn: 0 },
    profile: { title: null, avatar: null }, // título y avatar elegidos (id de su misión)
    bank: { super: 0, ultra: 0 }, // orbes de recompensa de misiones para la siguiente partida
    seen: [], // ids de las criaturas que ya han salido alguna vez en una partida (vistas)
    missions: {}, // id de misión -> fecha en que se completó
    claimed: {}, // id de misión -> fecha en que se cobró su recompensa (en el menú de misiones)
    settings: { speed: 1, music: true, sfx: true, grid: false, haptics: true, lang: 'en', autoTurbo: true },
    tutorial: { off: false, seen: [] } // consejos de la primera partida ya vistos (o desactivados)
  };
}

/**
 * Migraciones: la clave es la versión de origen y devuelve el formato de la siguiente.
 * Cuando cambie el formato: sube SAVE_VERSION y añade aquí el paso correspondiente.
 */
const MIGRATIONS = {
  // v0 = prototipo sin versión, que solo guardaba { best }.
  0: (s) => ({ ...defaultSave(), bestScore: Number(s.best) || 0, version: 1 })
};

export function migrate(raw) {
  let s = raw;
  let v = Number.isInteger(s.version) ? s.version : 0;
  if (v > SAVE_VERSION) {
    throw new Error(`This save comes from a newer version (v${v})`);
  }
  while (v < SAVE_VERSION) {
    const step = MIGRATIONS[v];
    if (!step) throw new Error(`No migration from save version ${v}`);
    s = step(s);
    v = s.version;
  }
  return s;
}

const nonNegInt = (n) => (Number.isFinite(n) && n > 0 ? Math.floor(n) : 0);

/** Corrige tipos y descarta entradas inválidas o de criaturas que no existen. */
export function sanitize(s, validIds) {
  const out = defaultSave();
  out.bestScore = nonNegInt(s.bestScore);
  const stats = s.stats && typeof s.stats === 'object' ? s.stats : {};
  out.stats = {};
  for (const key of Object.keys(defaultSave().stats)) out.stats[key] = nonNegInt(stats[key]);
  const missions = s.missions && typeof s.missions === 'object' ? s.missions : {};
  for (const [id, at] of Object.entries(missions)) if (typeof at === 'string') out.missions[id] = at;
  // Guardados anteriores a las recompensas manuales: lo ya completado ya había dado su premio
  const claimed = s.claimed && typeof s.claimed === 'object' ? s.claimed : out.missions;
  for (const [id, at] of Object.entries(claimed)) if (typeof at === 'string' && out.missions[id]) out.claimed[id] = at;
  const seenIds = Array.isArray(s.seen) ? s.seen.map(Number).filter((id) => Number.isInteger(id) && (!validIds || validIds.has(id))) : [];
  out.seen = [...new Set(seenIds)];
  out.bank = { super: nonNegInt(s.bank?.super), ultra: nonNegInt(s.bank?.ultra) };
  const str = (v) => (typeof v === 'string' ? v : null);
  out.profile = { title: str(s.profile?.title), avatar: str(s.profile?.avatar) };
  const speed = s.settings?.speed;
  out.settings = {
    speed: SPEEDS.includes(speed) ? speed : 1,
    music: s.settings?.music !== false,
    sfx: s.settings?.sfx !== false,
    grid: s.settings?.grid === true,
    haptics: s.settings?.haptics !== false,
    lang: s.settings?.lang === 'es' ? 'es' : 'en',
    autoTurbo: s.settings?.autoTurbo !== false // velocidad automática cuando ningún orbe puede golpear
  };
  const seen = Array.isArray(s.tutorial?.seen) ? s.tutorial.seen.filter((t) => typeof t === 'string') : [];
  out.tutorial = { off: s.tutorial?.off === true, seen: [...new Set(seen)] };
  const col = s.collection && typeof s.collection === 'object' ? s.collection : {};
  for (const [id, e] of Object.entries(col)) {
    if (validIds && !validIds.has(Number(id))) continue;
    if (!e || typeof e !== 'object') continue;
    const count = nonNegInt(e.count);
    if (count === 0) continue;
    out.collection[id] = {
      count,
      shinyCount: Math.min(count, nonNegInt(e.shinyCount)),
      firstAt: typeof e.firstAt === 'string' ? e.firstAt : new Date(0).toISOString()
    };
  }
  return out;
}

export function parseSave(text, validIds) {
  if (text == null || text === '') return defaultSave();
  const raw = JSON.parse(text);
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    throw new Error('Invalid save format');
  }
  return sanitize(migrate(raw), validIds);
}

export function memoryStorage() {
  const m = new Map();
  return {
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => m.set(k, String(v)),
    removeItem: (k) => m.delete(k)
  };
}

function browserStorage() {
  try {
    const ls = globalThis.localStorage;
    const probe = '__bb_probe__';
    ls.setItem(probe, '1');
    ls.removeItem(probe);
    return ls;
  } catch {
    logError('save', 'localStorage unavailable; progress will not be kept between sessions');
    return memoryStorage();
  }
}

export class SaveStore {
  constructor(storage = browserStorage(), validIds = null) {
    this.storage = storage;
    this.validIds = validIds;
    this.recovered = false;
    this.data = defaultSave();
  }

  load() {
    let text = null;
    try {
      text = this.storage.getItem(SAVE_KEY);
      this.data = parseSave(text, this.validIds);
    } catch (err) {
      logError('save-load', err);
      // Conservamos una copia del guardado dañado para poder recuperarlo a mano.
      try {
        if (text) this.storage.setItem(`${SAVE_KEY}.corrupt`, text);
      } catch {
        /* ignorado */
      }
      this.data = defaultSave();
      this.recovered = true;
      this.write();
    }
    return this.data;
  }

  write() {
    try {
      this.storage.setItem(SAVE_KEY, JSON.stringify(this.data));
      return true;
    } catch (err) {
      logError('save-write', err);
      return false;
    }
  }

  entry(id) {
    return this.data.collection[id] ?? null;
  }

  recordCapture(id, shiny) {
    const prev = this.data.collection[id];
    const isNew = !prev;
    const isNewShiny = shiny && !(prev?.shinyCount > 0);
    const e = prev ?? { count: 0, shinyCount: 0, firstAt: new Date().toISOString() };
    e.count += 1;
    if (shiny) e.shinyCount += 1;
    this.data.collection[id] = e;
    this.data.stats.captures += 1;
    if (shiny) this.data.stats.shinies += 1;
    this.write();
    return { isNew, isNewShiny };
  }

  recordGame(score, turn = 0) {
    const isBest = score > this.data.bestScore;
    if (isBest) this.data.bestScore = score;
    this.data.stats.games += 1;
    this.data.stats.bestTurn = Math.max(this.data.stats.bestTurn, turn);
    this.write();
    return isBest;
  }

  /** ¿Ha salido ya esta criatura en alguna partida? (las capturadas cuentan como vistas) */
  isSeen(id) {
    return this.data.seen.includes(Number(id)) || !!this.data.collection[id];
  }

  /** Marca una criatura como vista. Devuelve true si es la primera vez. */
  markSeen(id) {
    if (this.isSeen(id)) return false;
    this.data.seen.push(Number(id));
    this.write();
    return true;
  }

  /** Elige título o avatar del perfil (id de su misión, o null para el de por defecto). */
  setProfile(key, id) {
    this.data.profile[key] = id;
    this.write();
  }

  /** Guarda orbes de recompensa para la siguiente partida. */
  addBank(orb, n = 1) {
    this.data.bank[orb] = (this.data.bank[orb] ?? 0) + n;
    this.write();
  }

  /** Saca los orbes de recompensa guardados (al empezar una partida nueva). */
  takeBank() {
    const bank = { ...this.data.bank };
    this.data.bank = { super: 0, ultra: 0 };
    this.write();
    return bank;
  }

  /** ¿Hay que mostrar este consejo del tutorial? */
  wantsTip(id) {
    const t = this.data.tutorial;
    return !t.off && !t.seen.includes(id);
  }

  markTip(id) {
    if (!this.data.tutorial.seen.includes(id)) this.data.tutorial.seen.push(id);
    this.write();
  }

  /** Desactiva el resto de consejos del tutorial. */
  skipTips() {
    this.data.tutorial.off = true;
    this.write();
  }

  /** Borra capturas, misiones, récord y estadísticas. Mantiene los ajustes y el tutorial visto. */
  resetProgress() {
    const settings = this.data.settings;
    const tutorial = this.data.tutorial;
    this.data = defaultSave();
    this.data.settings = settings;
    this.data.tutorial = tutorial;
    return this.write();
  }

  bumpStat(key, n = 1) {
    this.data.stats[key] = (this.data.stats[key] ?? 0) + n;
    this.write();
  }

  /** Marca misiones como completadas; devuelve solo las nuevas. */
  completeMissions(ids) {
    const fresh = ids.filter((id) => !this.data.missions[id]);
    const now = new Date().toISOString();
    for (const id of fresh) this.data.missions[id] = now;
    if (fresh.length) this.write();
    return fresh;
  }

  /** Cobra la recompensa de una misión completada; false si no estaba completada o ya se cobró. */
  claimMission(id) {
    if (!this.data.missions[id] || this.data.claimed[id]) return false;
    this.data.claimed[id] = new Date().toISOString();
    this.write();
    return true;
  }

  counts() {
    const entries = Object.values(this.data.collection);
    return {
      caught: entries.length,
      shiny: entries.filter((e) => e.shinyCount > 0).length,
      total: entries.reduce((sum, e) => sum + e.count, 0)
    };
  }
}
