// Vibración (respuesta háptica) al golpear y romper bloques.
//
// - App nativa (Capacitor, iPhone y Android): el motor háptico del móvil (@capacitor/haptics),
//   con toques de distinta fuerza.
// - Android y otros navegadores con la API de vibración: navigator.vibrate(ms).
// - iPhone: Safari no tiene esa API. Desde iOS 18 un interruptor nativo (<input type="checkbox" switch>)
//   da un toque háptico al cambiar; se usa uno oculto y se pulsa por código. En versiones anteriores
//   de iOS no hace nada (el juego funciona igual).
//
// Los golpes pueden ser cientos por segundo: se limita la frecuencia para que la vibración se note
// como pequeños toques y no como un zumbido continuo.

import { Capacitor } from '@capacitor/core';
import { Haptics as NativeHaptics, ImpactStyle } from '@capacitor/haptics';

const GAP = { hit: 70, break: 45, big: 0 }; // ms mínimos entre toques de cada tipo
const PATTERN = { hit: 8, break: 18, big: [30, 40, 30] }; // Android: duración (ms) o patrón
const IMPACT = { hit: ImpactStyle.Light, break: ImpactStyle.Medium, big: ImpactStyle.Heavy }; // app nativa

class Haptics {
  constructor() {
    this.enabled = true;
    this.last = {};
    this.iosSwitch = null;
    this.native = Capacitor.isNativePlatform();
    this.canVibrate = typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function';
  }

  setEnabled(on) {
    this.enabled = !!on;
  }

  /** Interruptor oculto de iOS (se crea la primera vez). */
  ensureIosSwitch() {
    if (this.iosSwitch || typeof document === 'undefined') return this.iosSwitch;
    try {
      const label = document.createElement('label');
      label.setAttribute('aria-hidden', 'true');
      label.style.cssText = 'position:fixed;left:-100px;top:0;width:1px;height:1px;overflow:hidden;opacity:0;pointer-events:none';
      const input = document.createElement('input');
      input.type = 'checkbox';
      input.setAttribute('switch', '');
      input.tabIndex = -1;
      label.appendChild(input);
      document.body.appendChild(label);
      this.iosSwitch = label;
    } catch {
      this.iosSwitch = null;
    }
    return this.iosSwitch;
  }

  /** kind: 'hit' (golpe), 'break' (bloque roto) o 'big' (dios derrotado, ataque vertical…). */
  pulse(kind = 'hit') {
    if (!this.enabled) return;
    const now = performance.now();
    if (now - (this.last[kind] ?? -1e9) < GAP[kind]) return;
    this.last[kind] = now;
    try {
      if (this.native) {
        const tap = () => NativeHaptics.impact({ style: IMPACT[kind] }).catch(() => {});
        tap();
        if (kind === 'big') {
          setTimeout(tap, 90);
          setTimeout(tap, 180);
        }
        return;
      }
      if (this.canVibrate) {
        navigator.vibrate(PATTERN[kind]);
        return;
      }
      const sw = this.ensureIosSwitch();
      if (!sw) return;
      sw.click();
      // Un golpe fuerte son varios toques seguidos
      if (kind === 'big') {
        setTimeout(() => sw.click(), 90);
        setTimeout(() => sw.click(), 180);
      } else if (kind === 'break') {
        setTimeout(() => sw.click(), 40);
      }
    } catch {
      /* sin vibración disponible: no pasa nada */
    }
  }
}

export const haptics = new Haptics();
