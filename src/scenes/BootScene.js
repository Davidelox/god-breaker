import Phaser from 'phaser';
import { generateTextures } from '../gfx/sprites.js';
import { SaveStore } from '../core/save.js';
import { CREATURE_IDS } from '../data/creatures.js';
import { logError, showFatal } from '../core/errors.js';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('boot');
  }

  create() {
    try {
      generateTextures(this);
      const store = new SaveStore(undefined, CREATURE_IDS);
      store.load();
      this.registry.set('save', store);
      this.scene.start('title');
    } catch (err) {
      showFatal(logError('boot', err));
    }
  }
}
