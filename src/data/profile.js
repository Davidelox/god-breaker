// Perfil del cazador: títulos (recompensa de las misiones de captura) y avatares (recompensa de las
// misiones de progreso). Ambos se desbloquean al completar su misión y se eligen en el menú
// principal. El avatar es una mascota celestial: un animal luminoso con detalles cósmicos (al estilo
// de un espíritu guardián). Su paleta y su símbolo dan forma al orbe común.
// Se guardan en save.profile = { title, avatar } (id de la misión o null).

/** Título por defecto, antes de desbloquear ninguno. */
export const DEFAULT_TITLE = 'Novice Hunter';

/** Títulos: id de la misión de captura → nombre (en inglés; se traduce con t()). */
export const TITLES = {
  cap_25: 'Hunter',
  cap_75: 'Tracker',
  cap_150: 'Beast Tamer',
  cap_300: 'Collector',
  cap_600: 'The Legendary',
  uniq_20: 'Explorer',
  uniq_40: 'Scholar',
  uniq_80: 'Occultist',
  uniq_150: 'Mythologist',
  uniq_all: 'Keeper of Myths',
  legend_3: 'Godslayer',
  legend_all: 'Lord of Pantheons',
  shiny_2: 'Goldseeker',
  shiny_10: 'Golden Hand',
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

/** Paletas cósmicas de las mascotas (de oscuro a claro): recolorean al animal y pintan su orbe. */
export const AVATAR_STYLES = {
  starlight: ['#060a1e', '#2c4c9c', '#8cc8ff', '#f4fbff'],
  lunar: ['#0c0a1e', '#4a4a7c', '#c8c8f0', '#ffffff'],
  nebula: ['#14061e', '#6c2c8c', '#f070c0', '#ffe0f4'],
  comet: ['#04121a', '#1a6c8c', '#5ce0f0', '#e8ffff'],
  aurora: ['#04140e', '#1c7c5c', '#6cf0b0', '#eaffef'],
  solar: ['#1c0c02', '#a8640c', '#ffc820', '#fff8d0'],
  ember: ['#1c0402', '#a02c10', '#ff7a20', '#fff0a0'],
  void: ['#06040e', '#2a1a44', '#9a6ae0', '#f0e0ff'],
  tidal: ['#020c1c', '#0c4c8c', '#3ca0f0', '#d8f0ff'],
  frost: ['#0a1420', '#4c7c9c', '#b8e8ff', '#ffffff']
};

/**
 * Mascotas celestiales: id de la misión de progreso → animal.
 * pet: nombre corto; name: nombre completo; art: dibujo (motor de beastArt.js); style: paleta;
 * mark: símbolo dentro del orbe.
 */
export const AVATARS = {
  score_10000: { pet: 'Dog', name: 'Star Dog', art: 'quad kind:dog c:silver', style: 'starlight', mark: 'paw' },
  score_40000: { pet: 'Cat', name: 'Moon Cat', art: 'quad kind:cat c:silver', style: 'lunar', mark: 'moon' },
  score_100000: { pet: 'Dragon', name: 'Comet Dragon', art: 'drag c:silver c2:white', style: 'ember', mark: 'star' },
  turn_30: { pet: 'Fox', name: 'Aurora Fox', art: 'quad kind:fox c:silver tail:bushy', style: 'aurora', mark: 'star' },
  turn_50: { pet: 'Wolf', name: 'Frost Wolf', art: 'quad kind:wolf c:silver', style: 'frost', mark: 'moon' },
  turn_75: { pet: 'Elephant', name: 'Cosmic Elephant', art: 'quad kind:elephant c:silver', style: 'nebula', mark: 'star' },
  boss_3: { pet: 'Monkey', name: 'Sun Monkey', art: 'hum head:monkey body:fur fur:silver c:silver tail:long legs:goat', style: 'solar', mark: 'star' },
  boss_10: { pet: 'Owl', name: 'Night Owl', art: 'bird c:silver wingc:silver face:owl', style: 'void', mark: 'eye' },
  boss_30: { pet: 'Stag', name: 'Comet Stag', art: 'quad kind:deer c:silver horns:antler hornc:white', style: 'comet', mark: 'star' },
  clear_3: { pet: 'Rabbit', name: 'Moon Rabbit', art: 'quad kind:rabbit c:silver', style: 'lunar', mark: 'moon' },
  clear_20: { pet: 'Dolphin', name: 'Tide Dolphin', art: 'fish kind:shark c:silver c2:white', style: 'tidal', mark: 'wave' },
  power_25: { pet: 'Turtle', name: 'Galaxy Turtle', art: 'turtle c:silver', style: 'aurora', mark: 'ring' },
  power_100: { pet: 'Horse', name: 'Solar Horse', art: 'quad kind:horse c:silver mane manec:white', style: 'solar', mark: 'star' },
  games_25: { pet: 'Bear', name: 'Great Bear', art: 'quad kind:bear c:silver', style: 'starlight', mark: 'paw' }
};

/** Nombre del avatar en inglés: «Moon Cat». */
export const avatarName = (id) => AVATARS[id]?.name ?? '';

/** Títulos desbloqueados (ids de misión), en el orden de la lista. */
export const unlockedTitles = (data) => Object.keys(TITLES).filter((id) => data.claimed?.[id]);

/** Avatares desbloqueados (ids de misión), en el orden de la lista. */
export const unlockedAvatars = (data) => Object.keys(AVATARS).filter((id) => data.claimed?.[id]);

/** Título que se muestra: el elegido si está desbloqueado; si no, el de por defecto. */
export function currentTitle(data) {
  const id = data.profile?.title;
  return id && TITLES[id] && data.claimed?.[id] ? TITLES[id] : DEFAULT_TITLE;
}

/** Avatar elegido (id) si está desbloqueado; si no, null. */
export function currentAvatar(data) {
  const id = data.profile?.avatar;
  return id && AVATARS[id] && data.claimed?.[id] ? id : null;
}

/** Diseño del orbe de una mascota: paleta, símbolo interior y color de la estela. */
export function avatarOrb(id) {
  const a = AVATARS[id];
  const stops = a && AVATAR_STYLES[a.style];
  if (!stops) return null;
  return { stops, mark: a.mark, trail: parseInt(stops[2].slice(1), 16) };
}
