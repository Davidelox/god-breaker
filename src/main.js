import '@fontsource/press-start-2p';
import Phaser from 'phaser';
import { installErrorHandlers, logError, showFatal } from './core/errors.js';
import { W, H, DEBUG } from './config.js';
import BootScene from './scenes/BootScene.js';
import TitleScene from './scenes/TitleScene.js';
import GameScene from './scenes/GameScene.js';
import CollectionScene from './scenes/CollectionScene.js';

installErrorHandlers();

function start() {
  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: 'game',
    width: W,
    height: H,
    backgroundColor: '#0c1020',
    pixelArt: true,
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    input: { activePointers: 2 },
    scene: [BootScene, TitleScene, GameScene, CollectionScene]
  });
  if (DEBUG || import.meta.env.DEV) window.__game = game;
}

// Esperamos a la fuente pixel para que el texto no salga con la tipografía de reserva.
document.fonts
  .load('8px "Press Start 2P"')
  .catch((err) => logError('font', err))
  .finally(() => {
    try {
      start();
    } catch (err) {
      showFatal(logError('boot', err));
    }
  });
