import Phaser from 'phaser';
import { W, H, FULL_H, SAFE_TOP, SAFE_BOTTOM } from '../config.js';
import { VERSION } from '../version.js';
import { CREATURES, LEGENDARIES, creatureById } from '../data/creatures.js';
import { loadRun, clearRun } from '../core/run.js';
import { TYPES } from '../data/types.js';
import { addCreatureImage } from '../gfx/sprites.js';
import { text, makeButton, makePanel, makeAudioToggles, makeLangToggle, fitCamera, fullRect, COLORS } from '../gfx/ui.js';
import { t as tr, godOf } from '../i18n.js';
import { pick, shuffle } from '../core/rng.js';
import { audio } from '../audio/audio.js';

// Color de cada sección del menú principal
const MENU = { play: 0x8cdc7c, newGame: 0xd8f0d0, collection: 0x9cc8ff, missions: 0xffc488, guide: 0xd4bcff };

const upper = (str) => str.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase();

export default class TitleScene extends Phaser.Scene {
  constructor() {
    super('title');
  }

  create() {
    const save = this.registry.get('save');
    fitCamera(this);
    this.drawBackdrop();
    audio.setTrack('ambient');

    this.drawLogo();
    this.createShowcase(save);

    makePanel(this, 40, 312, W - 80, 64);
    const { caught, total } = save.counts();
    // Partida guardada automáticamente: CONTINUE la sigue, NEW GAME la abandona
    const run = loadRun(undefined, (id) => !!creatureById(id));
    text(this, W / 2, 330, run ? tr('BEST {0}  RUN: TURN {1}', save.data.bestScore, run.turn) : tr('BEST  {0}', save.data.bestScore), 8, COLORS.inkHex).setOrigin(0.5);
    text(this, W / 2, 352, tr('COLLECTION {0}/{1}  CAUGHT {2}', caught, CREATURES.length, total), 8, COLORS.inkHex).setOrigin(0.5);

    if (run) {
      makeButton(this, W / 2, 404, 200, 40, 'CONTINUE', () => this.scene.start('game', { resume: true }), { size: 16, fill: MENU.play });
      makeButton(this, W / 2 - 52, 452, 96, 34, 'NEW GAME', () => this.confirmNewGame(save, run), { fill: MENU.newGame });
      makeButton(this, W / 2 + 52, 452, 96, 34, 'COLLECTION', () => this.scene.start('collection'), { fill: MENU.collection });
    } else {
      makeButton(this, W / 2, 404, 200, 40, 'PLAY', () => this.scene.start('game', {}), { size: 16, fill: MENU.play });
      makeButton(this, W / 2, 452, 200, 34, 'COLLECTION', () => this.scene.start('collection'), { fill: MENU.collection });
    }
    makeButton(this, W / 2 - 52, 494, 96, 34, 'MISSIONS', () => this.scene.start('missions'), { fill: MENU.missions });
    makeButton(this, W / 2 + 52, 494, 96, 34, 'GUIDE', () => this.scene.start('guide'), { fill: MENU.guide });
    makeAudioToggles(this, 542, save);
    // Idioma: inglés / español (se redibuja el menú con el nuevo idioma)
    makeLangToggle(this, W / 2, 581, 280, save, () => this.scene.restart());

    text(this, 34, H - 20, `v${VERSION}`, 8, '#56607c').setOrigin(0.5);
    makeButton(this, W - 86, H - 22, 156, 26, 'RESET PROGRESS', () => this.confirmReset(save), {
      fill: 0xffd0d0,
      textColor: '#a03030'
    });

    if (save.recovered) {
      save.recovered = false;
      makePanel(this, 16, 566, W - 32, 40, { fill: 0xffe0e0 });
      text(this, W / 2, 586, 'Your save was damaged\nand has been reset.', 8, '#a03030').setOrigin(0.5);
    }
  }

  /** Empezar de cero con una partida guardada: se da por terminada (cuenta para el récord). */
  confirmNewGame(save, run) {
    const layer = this.add.container(0, 0).setDepth(50);
    layer.add(fullRect(this, 0x000000, 0.7).setInteractive());
    layer.add(makePanel(this, 24, 210, W - 48, 210));
    layer.add(text(this, W / 2, 244, 'NEW GAME?', 16, COLORS.inkHex).setOrigin(0.5));
    layer.add(text(this, W / 2, 300, tr('Your current run (turn {0},\nscore {1}) will end.', run.turn, run.score), 8, COLORS.inkHex).setOrigin(0.5));
    layer.add(makeButton(this, W / 2 - 72, 380, 128, 34, 'CANCEL', () => layer.destroy()));
    layer.add(makeButton(this, W / 2 + 72, 380, 128, 34, 'NEW GAME', () => {
      save.recordGame(run.score, run.turn);
      clearRun();
      this.scene.start('game', {});
    }, { fill: 0xd8f0d0 }));
  }

  confirmReset(save) {
    const layer = this.add.container(0, 0).setDepth(50);
    layer.add(fullRect(this, 0x000000, 0.7).setInteractive());
    layer.add(makePanel(this, 24, 210, W - 48, 210, { fill: 0xfff0f0 }));
    layer.add(text(this, W / 2, 244, 'RESET PROGRESS?', 16, '#a03030').setOrigin(0.5));
    layer.add(text(this, W / 2, 296, 'Captures, missions, best score\nand stats will be erased.\nThis cannot be undone.', 8, COLORS.inkHex).setOrigin(0.5));
    layer.add(makeButton(this, W / 2 - 72, 380, 128, 34, 'CANCEL', () => layer.destroy()));
    layer.add(makeButton(this, W / 2 + 72, 380, 128, 34, 'YES, RESET', () => {
      save.resetProgress();
      clearRun();
      this.scene.restart();
    }, { fill: 0xe05858, textColor: '#ffffff' }));
  }

  // ---------- Logo ----------

  /** Logo «GOD BREAKER»: letras con degradado, rayos girando, laureles, adornos y destellos. */
  drawLogo() {
    const cx = W / 2;
    const gy = 84; // centro de «GOD»
    const by = 142; // centro de «BREAKER»

    // Halo y rayos detrás del título
    const glow = this.add.graphics();
    for (let i = 6; i >= 1; i--) {
      glow.fillStyle(0xffc840, 0.035 * i);
      glow.fillCircle(cx, gy + 10, 22 + i * 14);
    }
    const rays = this.add.graphics({ x: cx, y: gy + 10 });
    for (let i = 0; i < 18; i++) {
      const ang = (i / 18) * Math.PI * 2;
      rays.fillStyle(0xffe08a, i % 2 ? 0.05 : 0.09);
      rays.fillTriangle(0, 0, Math.cos(ang - 0.07) * 190, Math.sin(ang - 0.07) * 190, Math.cos(ang + 0.07) * 190, Math.sin(ang + 0.07) * 190);
    }
    this.tweens.add({ targets: rays, angle: 360, duration: 60000, repeat: -1 });

    // Laureles a ambos lados de «GOD»
    const laurel = this.add.graphics();
    for (const side of [-1, 1]) {
      // Rama curva de abajo arriba, con hojas alternas a cada lado
      const at = (t) => [cx + side * (86 + 12 * Math.sin(t * Math.PI)), gy + 28 - t * 58];
      for (let i = 0; i <= 20; i++) {
        const [x, y] = at(i / 20);
        laurel.fillStyle(0x3a1c04);
        laurel.fillRect(x - 1.5, y - 1.5, 3, 3);
        laurel.fillStyle(0xc08a20);
        laurel.fillRect(x - 0.5, y - 0.5, 1, 1);
      }
      for (let i = 0; i < 6; i++) {
        const t = 0.08 + i * 0.16;
        const [x, y] = at(t);
        for (const out of [1, -1]) {
          const lx = x + side * out * 6, ly = y - 3;
          laurel.fillStyle(0x3a1c04);
          laurel.fillEllipse(lx, ly, 11, 7);
          laurel.fillStyle(out > 0 ? 0xffd84a : 0xc08a20);
          laurel.fillEllipse(lx, ly, 8, 4);
        }
      }
    }
    laurel.setAlpha(0);
    this.tweens.add({ targets: laurel, alpha: 1, duration: 600, delay: 450 });

    // «GOD»: oro con degradado, contorno grueso y sombra
    const god = text(this, cx, gy, 'GOD', 48, '#ffd84a').setOrigin(0.5);
    god.setStroke('#3a1c04', 10).setShadow(0, 7, '#05060c', 0, true, true);
    this.gradient(god, ['#fffbe0', '#ffe27a', '#f0b030', '#a8640c']);
    // «BREAKER»: plata azulada
    const breaker = text(this, cx, by, 'BREAKER', 24, '#dfe8ff').setOrigin(0.5);
    breaker.setStroke('#0c1020', 7).setShadow(0, 4, '#05060c', 0, true, true);
    this.gradient(breaker, ['#ffffff', '#c8d4f0', '#7c8cb8', '#4c5a88']);

    // Líneas ornamentales con rombos a los lados de «BREAKER»
    const orn = this.add.graphics();
    const diamond = (x, r, color) => {
      orn.fillStyle(color);
      orn.fillTriangle(x - r, by, x, by - r, x + r, by);
      orn.fillTriangle(x - r, by, x, by + r, x + r, by);
    };
    for (const side of [-1, 1]) {
      const x0 = cx + side * 96, x1 = cx + side * 158;
      orn.fillStyle(0x3a1c04);
      orn.fillRect(Math.min(x0, x1), by - 2, Math.abs(x1 - x0), 5);
      orn.fillStyle(0xffd84a);
      orn.fillRect(Math.min(x0, x1), by - 1, Math.abs(x1 - x0), 2);
      for (const [x, r] of [[x1, 5], [x0 + side * 10, 3]]) {
        diamond(x, r + 1.5, 0x3a1c04);
        diamond(x, r, 0xffd84a);
      }
    }

    // Entrada: «GOD» cae con rebote y destello; «BREAKER» y adornos aparecen después
    god.setScale(2.4).setAlpha(0);
    this.tweens.add({
      targets: god, scale: 1, alpha: 1, duration: 420, ease: 'Back.easeOut',
      onComplete: () => {
        this.cameras.main.shake(120, 0.004);
        this.cameras.main.flash(140, 255, 236, 170);
        this.tweens.add({ targets: god, y: gy - 3, duration: 1800, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      }
    });
    breaker.setAlpha(0).setY(by + 14);
    orn.setAlpha(0);
    this.tweens.add({ targets: breaker, alpha: 1, y: by, duration: 380, delay: 380, ease: 'Quad.easeOut' });
    this.tweens.add({ targets: orn, alpha: 1, duration: 400, delay: 560 });

    // Destellos que aparecen sobre las letras
    this.time.addEvent({
      delay: 650, loop: true, callback: () => {
        const big = Math.random() < 0.65;
        const x = cx + (big ? Phaser.Math.Between(-66, 66) : Phaser.Math.Between(-78, 78));
        const y = big ? gy + Phaser.Math.Between(-20, 20) : by + Phaser.Math.Between(-9, 9);
        const sp = this.add.image(x, y, 'spark').setScale(0).setDepth(5);
        this.tweens.add({ targets: sp, scale: 2.2, angle: 90, duration: 260, yoyo: true, ease: 'Quad.easeOut', onComplete: () => sp.destroy() });
      }
    });
  }

  /** Rellena un texto con un degradado vertical (colores de arriba abajo). */
  gradient(t, stops) {
    const ctx = t.context ?? t.canvas?.getContext('2d');
    if (!ctx) return;
    const grd = ctx.createLinearGradient(0, 0, 0, t.height);
    stops.forEach((c, i) => grd.addColorStop(i / (stops.length - 1), c));
    t.setFill(grd);
  }

  // ---------- Escaparate ----------

  /**
   * Una sola bestia flotando bajo el título, que va cambiando entre las capturadas
   * (también sus versiones gold). Sin capturas, muestra la silueta de un dios.
   */
  createShowcase(save) {
    const pool = [];
    for (const c of CREATURES) {
      const e = save.entry(c.id);
      if (e?.count > 0) pool.push({ c, gold: false });
      if (e?.shinyCount > 0) pool.push({ c, gold: true });
    }
    this.showPool = shuffle(pool);
    this.showIndex = 0;
    const x = W / 2, y = 232;
    this.showY = y;

    this.pedestal = this.add.ellipse(x, y + 38, 96, 14, 0xffd84a, 0.16);
    this.showAura = this.add.ellipse(x, y, 90, 90, 0xffd84a, 0);
    this.showName = text(this, x, y + 52, '', 8, '#f8f8f8').setOrigin(0.5).setStroke('#0c1020', 3);
    this.showInfo = text(this, x, y + 64, '', 8, '#a8b4cc').setOrigin(0.5).setStroke('#0c1020', 3);

    if (!this.showPool.length) {
      const c = LEGENDARIES.length ? pick(LEGENDARIES) : CREATURES[0];
      this.showImg = addCreatureImage(this, x, y, c.id, false, c.legendary ? 3.6 : 4.4).setTint(0x000000).setAlpha(0.85);
      this.showName.setText('???');
      this.showInfo.setText(tr('Capture beasts to show them here'));
      this.tweens.add({ targets: this.showImg, y: y - 6, duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      return;
    }
    this.showBeast(this.showPool[0], true);
    this.tweens.add({ targets: this.pedestal, scaleX: 0.85, alpha: 0.1, duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    if (this.showPool.length > 1) {
      this.time.addEvent({
        delay: 3400, loop: true, callback: () => {
          this.showIndex = (this.showIndex + 1) % this.showPool.length;
          if (this.showIndex === 0) shuffle(this.showPool);
          this.showBeast(this.showPool[this.showIndex]);
        }
      });
    }
  }

  showBeast({ c, gold }, first = false) {
    const x = W / 2, y = this.showY;
    const scale = c.legendary ? 3.6 : 4.4;
    const swapIn = () => {
      this.showImg?.destroy();
      this.tweens.killTweensOf(this.showAura);
      this.showImg = addCreatureImage(this, x, y, c.id, gold, scale).setDepth(2);
      const final = this.showImg.scale;
      this.showImg.setScale(0).setAlpha(0);
      this.tweens.add({ targets: this.showImg, scale: final, alpha: 1, duration: 320, ease: 'Back.easeOut' });
      this.tweens.add({ targets: this.showImg, y: y - 6, duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.easeInOut', delay: 320 });
      const auraColor = gold ? 0xffd84a : parseInt(TYPES[c.type].light.slice(1), 16);
      this.showAura.setFillStyle(auraColor, gold ? 0.3 : 0.14).setScale(0.6).setAlpha(1);
      this.tweens.add({ targets: this.showAura, scale: 1.1, alpha: 0.5, duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      this.showName.setText(upper(c.name)).setColor(gold ? '#ffd84a' : '#f8f8f8');
      const kind = c.legendary ? godOf(c.type, TYPES[c.type].name) : tr(TYPES[c.type].name);
      this.showInfo.setText(gold ? tr('GOLD  {0}', kind) : kind).setColor(gold ? '#e0b030' : '#a8b4cc');
      for (const t of [this.showName, this.showInfo]) {
        t.setAlpha(0);
        this.tweens.add({ targets: t, alpha: 1, duration: 300 });
      }
      if (gold && !first) {
        for (let i = 0; i < 6; i++) {
          const sp = this.add.image(x, y, 'spark').setScale(1.6).setDepth(3);
          const a = (i / 6) * Math.PI * 2;
          this.tweens.add({ targets: sp, x: x + Math.cos(a) * 44, y: y + Math.sin(a) * 44, alpha: 0, duration: 520, ease: 'Quad.easeOut', onComplete: () => sp.destroy() });
        }
      }
    };
    if (first || !this.showImg) return swapIn();
    this.tweens.killTweensOf(this.showImg);
    this.tweens.add({ targets: this.showImg, alpha: 0, scale: this.showImg.scale * 0.6, duration: 220, onComplete: swapIn });
    this.tweens.add({ targets: [this.showName, this.showInfo], alpha: 0, duration: 220 });
  }

  drawBackdrop() {
    const g = this.add.graphics();
    g.fillStyle(COLORS.night);
    g.fillRect(0, -SAFE_TOP, W, FULL_H);
    g.fillStyle(0x141c34);
    for (let y = -Math.ceil(SAFE_TOP / 24) * 24; y < H + SAFE_BOTTOM; y += 24) {
      for (let x = (y / 24) % 2 ? 12 : 0; x < W; x += 24) g.fillRect(x, y, 12, 12);
    }
  }
}
