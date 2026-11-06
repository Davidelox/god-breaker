// Packs de contenido: permiten sustituir el catálogo de criaturas y las imágenes de las bolas
// sin tocar el código. Ficheros en public/pack/ (ver public/pack/LEEME.md).
// Si el pack no existe o tiene errores, el juego usa el contenido por defecto.
import { setCreatures, DEFAULT_CREATURES } from './creatures.js';
import { BALL_TYPES } from './balls.js';
import { TYPES } from './types.js';
import { buildMissions } from './missions.js';
import { logError } from '../core/errors.js';

const PACK_DIR = './pack/';

/** Imágenes que BootScene debe precargar: { key, url } */
export const PACK_IMAGES = [];
/** id de criatura -> { normal: key, shiny: key|null } ; id de bola -> key */
export const CUSTOM_CREATURE_IMAGES = new Map();
export const CUSTOM_BALL_IMAGES = new Map();

async function fetchJson(file) {
  try {
    const res = await fetch(PACK_DIR + file, { cache: 'no-cache' });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null; // sin pack (o abierto sin servidor): se usan los valores por defecto
  }
}

const isImagePath = (v) => typeof v === 'string' && v.trim() !== '' && !v.includes('..');

/**
 * Valida la lista de criaturas del pack. Devuelve { list, errors }.
 * Las entradas inválidas se descartan (con aviso en el registro de errores).
 */
export function validateCreatures(raw) {
  const errors = [];
  const list = [];
  const seen = new Set();
  if (!Array.isArray(raw)) return { list, errors: ['"criaturas" debe ser una lista'] };
  raw.forEach((e, i) => {
    const where = `criatura #${i + 1}`;
    if (!e || typeof e !== 'object') return errors.push(`${where}: no es un objeto`);
    const id = Number(e.id);
    if (!Number.isInteger(id) || id <= 0) return errors.push(`${where}: id inválido`);
    if (seen.has(id)) return errors.push(`${where}: id ${id} repetido`);
    if (typeof e.nombre !== 'string' || !e.nombre.trim()) return errors.push(`${where}: falta "nombre"`);
    if (!TYPES[e.tipo]) return errors.push(`${where}: tipo "${e.tipo}" no existe`);
    const legendary = e.legendaria === true;
    const rarity = legendary ? 4 : Number(e.rareza);
    if (!legendary && ![1, 2, 3].includes(rarity)) return errors.push(`${where}: "rareza" debe ser 1, 2 o 3`);
    seen.add(id);
    list.push({
      id,
      name: e.nombre.trim().slice(0, 14),
      type: e.tipo,
      rarity,
      legendary,
      image: isImagePath(e.imagen) ? e.imagen : null,
      imageShiny: isImagePath(e.imagenShiny) ? e.imagenShiny : null
    });
  });
  return { list, errors };
}

export async function loadPack() {
  // Criaturas
  const data = await fetchJson('criaturas.json');
  if (data) {
    const { list, errors } = validateCreatures(data.criaturas);
    if (errors.length) logError('pack', `${errors.length} entradas del pack ignoradas`, { errors: errors.slice(0, 20) });
    if (list.some((c) => !c.legendary)) {
      list.sort((a, b) => a.id - b.id);
      setCreatures(list);
      for (const c of list) {
        if (c.image) {
          const normal = `src_cr_${c.id}`;
          PACK_IMAGES.push({ key: normal, url: PACK_DIR + c.image });
          let shiny = null;
          if (c.imageShiny) {
            shiny = `src_cr_${c.id}_s`;
            PACK_IMAGES.push({ key: shiny, url: PACK_DIR + c.imageShiny });
          }
          CUSTOM_CREATURE_IMAGES.set(c.id, { normal, shiny });
        }
      }
    } else {
      logError('pack', 'El pack no tiene ninguna criatura normal válida; se usa el catálogo por defecto');
      setCreatures(DEFAULT_CREATURES);
    }
  }
  // Bolas
  const balls = await fetchJson('bolas.json');
  if (balls && Array.isArray(balls.bolas)) {
    for (const b of balls.bolas) {
      if (!b || !BALL_TYPES[b.id]) continue;
      if (typeof b.nombre === 'string' && b.nombre.trim()) BALL_TYPES[b.id].name = b.nombre.trim().slice(0, 8);
      if (isImagePath(b.imagen)) {
        const key = `src_ball_${b.id}`;
        PACK_IMAGES.push({ key, url: PACK_DIR + b.imagen });
        CUSTOM_BALL_IMAGES.set(b.id, key);
      }
    }
  }
  buildMissions();
}
