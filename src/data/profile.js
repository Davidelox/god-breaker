// Perfil del cazador: títulos (recompensa de las misiones de captura) y avatares (recompensa de las
// misiones de progreso). Ambos se desbloquean al completar su misión y se eligen en el menú
// principal. El avatar es un dios rediseñado con una paleta propia, y esa misma paleta pinta el
// orbe común. Se guardan en save.profile = { title, avatar } (id de la misión o null).

/** Título por defecto, antes de desbloquear ninguno. */
export const DEFAULT_TITLE = 'Novice Hunter';

/** Títulos: id de la misión de captura → nombre (en inglés; se traduce con t()). */
export const TITLES = {
  cap_10: 'Hunter',
  cap_25: 'Tracker',
  cap_50: 'Beast Tamer',
  cap_100: 'Collector',
  cap_250: 'The Legendary',
  uniq_10: 'Explorer',
  uniq_20: 'Scholar',
  uniq_30: 'Occultist',
  uniq_50: 'Mythologist',
  uniq_all: 'Keeper of Myths',
  legend_1: 'Godslayer',
  legend_all: 'Lord of Pantheons',
  shiny_1: 'Goldseeker',
  shiny_5: 'Golden Hand',
  type_griega: 'Olympian',
  type_nordica: 'Einherjar',
  type_egipcia: 'Pharaoh',
  type_celta: 'Druid',
  type_eslava: 'Witch Hunter',
  type_iberica: 'Wanderer',
  type_europea: 'Alchemist',
  type_japonesa: 'Onmyoji',
  type_asiatica: 'Dragon Sage',
  type_indomalaya: 'Yogi',
  type_medioriental: 'Djinn Master',
  type_americana: 'Shaman',
  type_africana: 'Griot',
  type_oceanica: 'Navigator'
};

/**
 * Paletas de los avatares (de oscuro a claro). Recolorean al dios (mapa de degradado) y dan los
 * colores del orbe común: anillo, sombra, cuerpo y brillo; la estela usa el color del cuerpo.
 */
export const AVATAR_STYLES = {
  gold: { name: 'Gold', stops: ['#2a1602', '#a8640c', '#ffc820', '#fff4b0'] },
  obsidian: { name: 'Obsidian', stops: ['#06040e', '#2a1a44', '#7a4ac0', '#e0c8ff'] },
  spectral: { name: 'Spectral', stops: ['#04141c', '#1a6c8c', '#5ce0f0', '#e8ffff'] },
  flame: { name: 'Flame', stops: ['#1c0402', '#a02c10', '#ff7a20', '#fff0a0'] },
  verdant: { name: 'Verdant', stops: ['#04140a', '#1c6c30', '#6ce070', '#efffd0'] },
  blood: { name: 'Blood', stops: ['#140204', '#6c0c18', '#e03040', '#ffd0d0'] },
  celestial: { name: 'Celestial', stops: ['#0a0c2a', '#3c58c0', '#a8c8ff', '#ffffff'] },
  stone: { name: 'Stone', stops: ['#141210', '#5a5040', '#b8ac90', '#f4ecd8'] }
};

/** Avatares: id de la misión de progreso → dios (por nombre) y estilo. */
export const AVATARS = {
  score_5000: { god: 'Hermes', style: 'celestial' },
  score_20000: { god: 'Apollo', style: 'gold' },
  score_50000: { god: 'Zeus', style: 'gold' },
  turn_20: { god: 'Athena', style: 'stone' },
  turn_40: { god: 'Poseidon', style: 'spectral' },
  turn_60: { god: 'Odin', style: 'celestial' },
  boss_1: { god: 'Ares', style: 'blood' },
  boss_5: { god: 'Thor', style: 'spectral' },
  boss_20: { god: 'Hades', style: 'obsidian' },
  clear_1: { god: 'Horus', style: 'gold' },
  clear_10: { god: 'Ra', style: 'flame' },
  power_10: { god: 'Loki', style: 'verdant' },
  power_50: { god: 'Anubis', style: 'obsidian' },
  games_10: { god: 'Freyja', style: 'verdant' }
};

/** Nombre del avatar en inglés: «Zeus · Gold». */
export const avatarName = (id) => (AVATARS[id] ? `${AVATARS[id].god} · ${AVATAR_STYLES[AVATARS[id].style].name}` : '');

/** Títulos desbloqueados (ids de misión), en el orden de la lista. */
export const unlockedTitles = (data) => Object.keys(TITLES).filter((id) => data.missions[id]);

/** Avatares desbloqueados (ids de misión), en el orden de la lista. */
export const unlockedAvatars = (data) => Object.keys(AVATARS).filter((id) => data.missions[id]);

/** Título que se muestra: el elegido si está desbloqueado; si no, el de por defecto. */
export function currentTitle(data) {
  const id = data.profile?.title;
  return id && TITLES[id] && data.missions[id] ? TITLES[id] : DEFAULT_TITLE;
}

/** Avatar elegido (id) si está desbloqueado; si no, null. */
export function currentAvatar(data) {
  const id = data.profile?.avatar;
  return id && AVATARS[id] && data.missions[id] ? id : null;
}

/** Colores del orbe común para un avatar (formato de BALL_2) y color de su estela. */
export function avatarOrb(id) {
  const st = AVATAR_STYLES[AVATARS[id]?.style];
  if (!st) return null;
  const [a, d, b, l] = st.stops;
  return { colors: { A: a, L: l, B: b, D: d, h: '#ffffff' }, trail: parseInt(b.slice(1), 16) };
}
