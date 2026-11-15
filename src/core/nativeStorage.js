// Guardado duradero en la app (iPhone y Android).
//
// El juego guarda en localStorage, que es síncrono y cómodo. Pero en la app nativa el sistema puede
// borrar los datos de la vista web (iOS lo hace si falta espacio), y se perdería el progreso.
// Por eso, en la app, cada escritura de las claves importantes se copia también en Preferences
// (UserDefaults en iOS, SharedPreferences en Android), que no se borra. Al arrancar se restaura
// localStorage desde ahí antes de cargar el juego.
//
// En el navegador no hace nada.
import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
import { logError } from './errors.js';

/** Claves que se copian (guardado y partida a medias). */
export const DURABLE_KEYS = ['beastbreaker.save', 'godbreaker.run'];

export const isNative = () => Capacitor.isNativePlatform();

/**
 * Restaura localStorage desde Preferences y, a partir de ahí, copia en Preferences cada cambio de
 * las claves duraderas. Se llama una vez, antes de arrancar el juego.
 */
export async function setupNativeStorage(
  ls = globalThis.localStorage,
  prefs = Preferences,
  native = isNative(),
  StorageProto = globalThis.Storage?.prototype
) {
  if (!native || !ls) return;
  for (const key of DURABLE_KEYS) {
    try {
      const { value } = await prefs.get({ key });
      if (value != null) ls.setItem(key, value); // Preferences manda: es la copia que no se borra
      else {
        const local = ls.getItem(key); // instalada antes de existir esta copia
        if (local != null) await prefs.set({ key, value: local });
      }
    } catch (err) {
      logError('native-storage', err);
    }
  }
  mirrorWrites(ls, prefs, StorageProto);
}

/** Copia en Preferences las escrituras y borrados de las claves duraderas. */
function mirrorWrites(ls, prefs, proto) {
  const target = proto ?? ls; // en el navegador es Storage.prototype; en los tests, el propio objeto
  const { setItem, removeItem } = target;
  const keys = new Set(DURABLE_KEYS);
  const fail = (err) => logError('native-storage', err);
  target.setItem = function (key, value) {
    setItem.call(this, key, value);
    if (this === ls && keys.has(key)) prefs.set({ key, value: String(value) }).catch(fail);
  };
  target.removeItem = function (key) {
    removeItem.call(this, key);
    if (this === ls && keys.has(key)) prefs.remove({ key }).catch(fail);
  };
}
