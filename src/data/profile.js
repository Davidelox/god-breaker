// Perfil del cazador: títulos (recompensa de las misiones de captura) y avatares (recompensa de las
// misiones de progreso). Ambos se desbloquean al completar su misión y se eligen en el menú
// principal. El avatar es una mascota celestial: un animal luminoso con detalles cósmicos (al estilo
// de un espíritu guardián). Su paleta y su símbolo dan forma al orbe común.
// Se guardan en save.profile = { title, avatar } (id de la misión o null).

/** Título por defecto, antes de desbloquear ninguno. */
export const DEFAULT_TITLE = 'Novice Hunter';

/** Títulos: id de la misión de captura → nombre (en inglés; se traduce con t()). */
export const TITLES = {
  cap_50: 'Rookie Hunter',
  cap_150: 'Blasphemous Mercenary',
  cap_350: 'Beast Tamer',
  cap_600: 'Mythic Terror',
  cap_800: 'The Collector',
  uniq_50: 'Explorer',
  uniq_125: 'Scholar',
  uniq_300: 'Occultist',
  uniq_500: 'Mythologist',
  uniq_all: 'Keeper of Myths',
  legend_60: 'Templeless Traitor',
  legend_all: 'God Destroyer',
  shiny_200: 'Goblin',
  shiny_400: 'Treasurer',
  shiny_all: 'Millionaire',
  type_griega: 'Olympian',
  type_nordica: 'Einherjar',
  type_egipcia: 'Pharaoh',
  type_celta: 'Druid',
  type_eslava: 'Witch Hunter',
  type_iberica: 'Wanderer',
  type_europea: 'Alchemist',
  type_japonesa: 'Onmyoji',
  type_asiatica: 'Dragon God',
  type_indomalaya: 'Yogi',
  type_medioriental: 'Djinn Master',
  type_americana: 'Shaman',
  type_africana: 'Griot',
  type_oceanica: 'Navigator'
};

/** Paletas cósmicas de las mascotas (de oscuro a claro): recolorean al animal y pintan su orbe. */
export const AVATAR_STYLES = {
  sun: ['#1a1002', '#9a6a10', '#ffd030', '#fff8d0'], // amarillo sol (perro)
  moon: ['#0e0c1c', '#57527e', '#cbc6ec', '#ffffff'], // plata lavanda (gato)
  rose: ['#1c0812', '#8c3060', '#ff9ac8', '#fff0f6'], // rosa (conejo)
  aurora: ['#04140e', '#1c7c5c', '#6cf0b0', '#eaffef'], // esmeralda (zorro)
  frost: ['#0a1420', '#4c7c9c', '#c4ecff', '#ffffff'], // hielo (lobo)
  nebula: ['#14061e', '#6c2c8c', '#f070c0', '#ffe0f4'], // magenta (elefante)
  ivory: ['#16141a', '#86807a', '#ece6dc', '#ffffff'], // blanco marfil (mono)
  bronze: ['#140c04', '#7c5420', '#e8b860', '#fff4dc'], // bronce sagrado (búho)
  specter: ['#04120f', '#1c7468', '#72f0d8', '#f0fffa'], // turquesa espectral (ciervo)
  royal: ['#020a1e', '#123c9c', '#4a8cff', '#dce8ff'], // azul real (ballena)
  crystal: ['#03141c', '#1c80a8', '#8cecff', '#f2feff'], // cristal cian (delfín)
  ghost: ['#05030c', '#3a2a5c', '#a088e0', '#f0e8ff'], // violeta fantasma (tiburón)
  lime: ['#0c1404', '#4c7c14', '#b8f050', '#f4ffd8'], // lima galáctica (tortuga)
  crimson: ['#1c0204', '#a01020', '#ff4a3a', '#ffe0c0'], // carmesí ígneo (caballo)
  indigo: ['#060824', '#2c348c', '#8c96ff', '#f0f0ff'], // índigo (oso)
  fire: ['#200a00', '#c85008', '#ff9a1a', '#fff2b0'], // naranja brillante (dragón)
  ash: ['#060606', '#3a363c', '#a29ea8', '#f2f0f4'], // ceniza (araña)
  copper: ['#140804', '#7c3418', '#e88048', '#ffe8d4'], // cobre rúnico (serpiente)
  sky: ['#081420', '#3a7cb0', '#a8dcff', '#ffffff'] // cielo (ratón)
};

/**
 * Mascotas celestiales: id de la misión de progreso → animal.
 * pet: nombre corto; name: nombre completo; art: dibujo (motor de beastArt.js); style: paleta;
 * mark: símbolo dentro del orbe.
 */
export const AVATARS = {
  score_75000: { pet: 'Dog', name: 'Solar Dog', art: 'quad kind:dog c:silver', style: 'sun', mark: 'paw', portrait: { animal: 'dog', lift: 0.08, eye: '#ff4a2a' } },
  score_125000: { pet: 'Cat', name: 'Moon Cat', art: 'quad kind:cat c:silver', style: 'moon', mark: 'moon', portrait: { animal: 'cat', eye: '#ffe24a' } },
  score_150000: { pet: 'Rabbit', name: 'Star Rabbit', art: 'quad kind:rabbit c:silver', style: 'rose', mark: 'star', portrait: { animal: 'rabbit', eye: '#4ae0ff' } },
  turn_125: { pet: 'Fox', name: 'Celestial Fox', art: 'quad kind:fox c:silver tail:bushy', style: 'aurora', mark: 'star', portrait: { animal: 'fox', eye: '#ffb020' } },
  turn_175: { pet: 'Wolf', name: 'Frost Wolf', art: 'quad kind:wolf c:silver', style: 'frost', mark: 'moon', portrait: { animal: 'wolf', eye: '#3a8cff' } },
  turn_205: { pet: 'Elephant', name: 'Cosmic Elephant', art: 'quad kind:elephant c:silver', style: 'nebula', mark: 'star', portrait: { animal: 'elephant', eye: '#ffe070', accent: ['#fff4dc', '#c8a878'] } },
  maxboss_20: { pet: 'Monkey', name: 'Divine Monkey', art: 'hum head:monkey body:fur fur:silver c:silver tail:long legs:goat', style: 'ivory', mark: 'star', portrait: { animal: 'monkey', lift: 0.38, eye: '#e83040', accent: ['#ffd8c0', '#c08a78'] } },
  maxboss_40: { pet: 'Owl', name: 'Sacred Owl', art: 'bird c:silver wingc:silver face:owl', style: 'bronze', mark: 'eye', portrait: { animal: 'owl', eye: '#ffe84a', accent: ['#ffd84a', '#c08a10'] } },
  maxboss_100: { pet: 'Stag', name: 'Spectral Stag', art: 'quad kind:deer c:silver horns:antler hornc:white', style: 'specter', mark: 'eye', portrait: { animal: 'stag', eye: '#ffffff' } },
  clearrun_5: { pet: 'Whale', name: 'Imperial Whale', art: 'fish kind:whale c:silver c2:white', style: 'royal', mark: 'wave', portrait: { animal: 'whale', eye: '#ffd84a', accent: ['#ffd84a', '#a07c28'] } },
  clearrun_10: { pet: 'Dolphin', name: 'Crystal Dolphin', art: 'fish kind:shark c:silver c2:white', style: 'crystal', mark: 'wave', portrait: { animal: 'dolphin', eye: '#3a6cff' } },
  clear_100: { pet: 'Shark', name: 'Ghost Shark', art: 'fish kind:shark c:silver c2:white', style: 'ghost', mark: 'eye', portrait: { animal: 'shark', eye: '#ff2a4a' } },
  combo_15: { pet: 'Turtle', name: 'Galaxy Turtle', art: 'turtle c:silver', style: 'lime', mark: 'ring', portrait: { animal: 'turtle', eye: '#ff7ad0', accent: ['#6c4cd0', '#2a1a6c'] } },
  power_300: { pet: 'Horse', name: 'Fiery Horse', art: 'quad kind:horse c:silver mane manec:white', style: 'crimson', mark: 'star', portrait: { animal: 'horse', eye: '#ffe04a', accent: ['#ff7a20', '#a02c10'] } },
  shotcap_3: { pet: 'Bear', name: 'Great Bear', art: 'quad kind:bear c:silver', style: 'indigo', mark: 'paw', portrait: { animal: 'bear', eye: '#a0f0ff' } },
  godstreak_3: { pet: 'Dragon', name: 'Golden Dragon', art: 'drag c:silver c2:white', style: 'fire', mark: 'star', portrait: { animal: 'dragon', lift: 0.16, eye: '#fff04a', accent: ['#ffd84a', '#a07c28'] } },
  vertical_50: { pet: 'Serpent', name: 'Runic Serpent', art: 'snake', style: 'copper', mark: 'rune', portrait: { animal: 'snake', eye: '#7cff7c', accent: ['#ff3a3a', '#901010'] } },
  nomagic_100: { pet: 'Mouse', name: 'Mouse God', art: 'mouse', style: 'sky', mark: 'crown', portrait: { animal: 'mouse', eye: '#ffd84a', accent: ['#ffd84a', '#a07c28'] } },
  bestshot_45: { pet: 'Spider', name: 'Immortal Spider', art: 'spider', style: 'ash', mark: 'web', portrait: { animal: 'spider', eye: '#ff1a1a' } }
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
  return { stops, mark: a.mark, eye: a.portrait?.eye ?? '#ffffff', trail: parseInt(stops[2].slice(1), 16) };
}
