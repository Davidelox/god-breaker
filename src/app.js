// Arranque del juego. Se carga desde main.js cuando la página ya está maquetada, para que
// config.js mida bien la pantalla y la zona segura del móvil.
import Phaser from 'phaser';
import { logError } from './core/errors.js';
import { W, FULL_H, MOBILE, DEBUG } from './config.js';
import { audio } from './audio/audio.js';
import { loadPack } from './data/pack.js';
import BootScene from './scenes/BootScene.js';
import TitleScene from './scenes/TitleScene.js';
import GameScene from './scenes/GameScene.js';
import CollectionScene from './scenes/CollectionScene.js';
import GuideScene from './scenes/GuideScene.js';
import MissionsScene from './scenes/MissionsScene.js';

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
    scene: [BootScene, TitleScene, GameScene, CollectionScene, GuideScene, MissionsScene]
  });
  if (DEBUG || import.meta.env.DEV) window.__game = game;
}

/** Carga el pack de contenido y crea el juego. */
export async function boot() {
  await loadPack().catch((err) => logError('pack', err));
  start();
}
