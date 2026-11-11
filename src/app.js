// Arranque del juego. Se carga desde main.js cuando la página ya está maquetada, para que
// config.js mida bien la pantalla y la zona segura del móvil.
import Phaser from 'phaser';
import { logError } from './core/errors.js';
import { W, FULL_H, MOBILE, DEBUG, SAFE_TOP, SCALE_K, measureSafeArea } from './config.js';
import { audio } from './audio/audio.js';
import { loadPack } from './data/pack.js';
import BootScene from './scenes/BootScene.js';
import TitleScene from './scenes/TitleScene.js';
import GameScene from './scenes/GameScene.js';
import CollectionScene from './scenes/CollectionScene.js';
import GuideScene from './scenes/GuideScene.js';
import MissionsScene from './scenes/MissionsScene.js';
import StatsScene from './scenes/StatsScene.js';

// Los navegadores solo permiten audio después de una interacción del usuario.
const unlockAudio = () => audio.unlock();
window.addEventListener('pointerdown', unlockAudio, { passive: true });
window.addEventListener('keydown', unlockAudio);

export function start() {
  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: 'game',
    width: W,
    height: FULL_H,
    backgroundColor: '#0c1020',
    pixelArt: true,
    // En el móvil el lienzo tiene la proporción de la pantalla y la cubre entera (ENVELOP: sin franjas);
    // en escritorio se encaja (FIT).
    scale: { mode: MOBILE ? Phaser.Scale.ENVELOP : Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    input: { activePointers: 2 },
    scene: [BootScene, TitleScene, GameScene, CollectionScene, GuideScene, MissionsScene, StatsScene]
  });
  if (DEBUG || import.meta.env.DEV) window.__game = game;
}

/** Carga el pack de contenido y crea el juego. */
export async function boot() {
  await loadPack().catch((err) => logError('pack', err));
  start();
  recheckSafeArea();
}

/**
 * En el iPhone la zona segura puede llegar tarde. Si al poco de arrancar resulta mayor que la que
 * se usó (el menú quedaría bajo la isla), se recarga la página una vez para recolocarlo todo.
 */
function recheckSafeArea() {
  if (!MOBILE) return;
  setTimeout(() => {
    try {
      const top = Math.round(measureSafeArea().top * SCALE_K);
      const key = 'godbreaker.safeReload';
      if (top > SAFE_TOP + 6 && !sessionStorage.getItem(key)) {
        sessionStorage.setItem(key, '1');
        location.reload();
      }
    } catch {
      /* sin sessionStorage o sin medida: se deja como está */
    }
  }, 700);
}
