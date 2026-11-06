import Phaser from 'phaser';
import { generateTextures } from '../gfx/sprites.js';
import { SaveStore } from '../core/save.js';
import { CREATURE_IDS } from '../data/creatures.js';
import { logError, showFatal } from '../core/errors.js';
import { audio } from '../audio/audio.js';
import { PACK_IMAGES } from '../data/pack.js';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('boot');
  }

  preload() {
    // Imágenes del pack (si las hay). Si alguna falla se usa el sprite generado.
    this.load.on('loaderror', (file) => logError('pack-imagen', `No se pudo cargar ${file.src ?? file.key}`));
    for (const { key, url } of PACK_IMAGES) this.load.image(key, url);
  }

  create() {
    try {
      generateTextures(this);
      const store = new SaveStore(undefined, CREATURE_IDS);
      store.load();
      audio.configure(store.data.settings);
      this.registry.set('save', store);
      this.scene.start('title');
    } catch (err) {
      showFatal(logError('boot', err));
    }
  }
}
