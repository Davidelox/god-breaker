// Idioma del juego: inglés (por defecto) o español.
// Los textos se escriben en inglés en el código y se traducen con t(): la clave es el propio texto
// inglés, con {0}, {1}… para los valores que cambian. Las traducciones están en data/es.js.
// El idioma se guarda en los ajustes (save.settings.lang); al cambiarlo se reinicia la escena.
import { ES, ES_PATTERNS, ES_GOD_OF } from './data/es.js';

export const LANGS = ['en', 'es'];
let lang = 'en';

export function setLang(l) {
  lang = LANGS.includes(l) ? l : 'en';
}

export const getLang = () => lang;

const fill = (s, args) => (args.length ? s.replace(/\{(\d)\}/g, (_, i) => String(args[i] ?? '')) : s);

/** Traduce un texto inglés al idioma actual (si no hay traducción, se queda en inglés). */
export function t(en, ...args) {
  if (lang !== 'es' || en == null) return fill(en ?? '', args);
  let out = ES[en];
  if (out == null) {
    // Textos con números que vienen de los datos (p. ej. títulos de misiones)
    for (const [re, rep] of ES_PATTERNS) {
      if (re.test(en)) {
        out = en.replace(re, rep);
        break;
      }
    }
  }
  // La fuente pixel no tiene vocales mayúsculas con tilde (sí Ñ, ¡ y ¿): se escriben sin tilde
  return fill(out ?? en, args).replace(/[ÁÉÍÓÚ]/g, (c) => NO_ACCENT[c]);
}

const NO_ACCENT = { Á: 'A', É: 'E', Í: 'I', Ó: 'O', Ú: 'U' };

/** «Dios nórdico» / «Norse god»: el dios de una mitología (origin = id de origen). */
export function godOf(origin, pantheonName) {
  return lang === 'es' ? ES_GOD_OF[origin] ?? `Dios ${pantheonName}` : `${pantheonName} god`;
}
