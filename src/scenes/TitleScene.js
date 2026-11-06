import Phaser from 'phaser';
import { W, H } from '../config.js';
import { VERSION } from '../version.js';
import { CREATURES } from '../data/creatures.js';
import { creatureKey } from '../gfx/sprites.js';
import { text, makeButton, makePanel, makeAudioToggles, COLORS } from '../gfx/ui.js';
import { pick } from '../core/rng.js';

export default class TitleScene extends Phaser.Scene {
  constructor() {
    super('title');
  }

  create() {
    const save = this.registry.get('save');
    this.drawBackdrop();

    text(this, W / 2 + 2, 112, 'BEAST\nBREAKER', 24, '#101828').setOrigin(0.5);
    text(this, W / 2, 110, 'BEAST\nBREAKER', 24, COLORS.goldHex).setOrigin(0.5);
    text(this, W / 2, 168, 'Rompe bloques.\nCaptura criaturas.', 8, '#a8b4cc').setOrigin(0.5);

    // Desfile de criaturas
    const shown = [0, 1, 2].map(() => pick(CREATURES));
    shown.forEach((c, i) => {
      const img = this.add.image(W / 2 + (i - 1) * 80, 250, creatureKey(c.id, false)).setScale(c.legendary ? 3 : 4);
      this.tweens.add({ targets: img, y: 244, duration: 500 + i * 120, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    });

    makePanel(this, 40, 312, W - 80, 64);
    const { caught, total } = save.counts();
    text(this, W / 2, 330, `RECORD  ${save.data.bestScore}`, 8, COLORS.inkHex).setOrigin(0.5);
    text(this, W / 2, 352, `COLECCION ${caught}/${CREATURES.length}  ATRAPADAS ${total}`, 8, COLORS.inkHex).setOrigin(0.5);

    makeButton(this, W / 2, 404, 200, 40, 'JUGAR', () => this.scene.start('game'), { size: 16 });
    makeButton(this, W / 2, 452, 200, 34, 'COLECCION', () => this.scene.start('collection'));
    makeButton(this, W / 2 - 52, 494, 96, 34, 'MISIONES', () => this.scene.start('missions'));
    makeButton(this, W / 2 + 52, 494, 96, 34, 'GUIA', () => this.scene.start('guide'));
    makeAudioToggles(this, 542, save);

    text(this, W / 2, H - 20, `v${VERSION}`, 8, '#56607c').setOrigin(0.5);

    if (save.recovered) {
      save.recovered = false;
      makePanel(this, 16, 566, W - 32, 40, { fill: 0xffe0e0 });
      text(this, W / 2, 586, 'El guardado estaba dañado\ny se ha reiniciado.', 8, '#a03030').setOrigin(0.5);
    }
  }

  drawBackdrop() {
    const g = this.add.graphics();
    g.fillStyle(COLORS.night);
    g.fillRect(0, 0, W, H);
    g.fillStyle(0x141c34);
    for (let y = 0; y < H; y += 24) {
      for (let x = (y / 24) % 2 ? 12 : 0; x < W; x += 24) g.fillRect(x, y, 12, 12);
    }
  }
}
