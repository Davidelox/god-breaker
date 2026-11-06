// Guía visual: páginas cortas con dibujos y poco texto.
import Phaser from 'phaser';
import { W, H, BOSS_EVERY, SHINY_RATE, SHINY_BOOST_RATE, SHINY_BOOST_TURNS } from '../config.js';

const pct = (r) => `${Math.round(r * 1000) / 10}%`;
const upper = (str) => str.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase();
import { CREATURES, LEGENDARIES } from '../data/creatures.js';
import { TYPES, hexToNum } from '../data/types.js';
import { SPECIALS, ELEMENTS } from '../data/specials.js';
import { BALL_TYPES, BALL_ORDER } from '../data/balls.js';
import { addCreatureImage } from '../gfx/sprites.js';
import { text, makeButton, makePanel, drawPanel, fitCamera, fullRect, COLORS } from '../gfx/ui.js';

const INK = COLORS.inkHex;
const SOFT = '#56607c';

export default class GuideScene extends Phaser.Scene {
  constructor() {
    super('guide');
  }

  init(data) {
    this.page = data?.page ?? 0;
  }

  create() {
    fitCamera(this);
    fullRect(this, COLORS.night);
    this.pages = [
      ['GOAL', () => this.pageGoal()],
      ['BLOCKS', () => this.pageBlocks()],
      ['CAPTURE', () => this.pageCapture()],
      ['SPELLS', () => this.pagePowers()],
      ['GOLD', () => this.pageShiny()],
      ['CONTROLS', () => this.pageControls()]
    ];
    makePanel(this, 12, 64, W - 24, 500);
    this.layer = this.add.container(0, 0);
    this.title = text(this, W / 2, 24, '', 16, COLORS.goldHex).setOrigin(0.5);
    this.counter = text(this, W / 2, 46, '', 8, '#a8b4cc').setOrigin(0.5);
    makeButton(this, 44, H - 36, 56, 36, '<', () => this.go(-1), { size: 16 });
    makeButton(this, W / 2, H - 36, 150, 36, 'BACK', () => this.scene.start('title'));
    makeButton(this, W - 44, H - 36, 56, 36, '>', () => this.go(1), { size: 16 });
    this.input.keyboard?.on('keydown-LEFT', () => this.go(-1));
    this.input.keyboard?.on('keydown-RIGHT', () => this.go(1));
    this.input.keyboard?.on('keydown-ESC', () => this.scene.start('title'));
    this.render();
  }

  go(d) {
    this.page = (this.page + d + this.pages.length) % this.pages.length;
    this.render();
  }

  render() {
    this.layer.removeAll(true);
    this.tweens.killAll();
    const [name, draw] = this.pages[this.page];
    this.title.setText(name);
    this.counter.setText(`${this.page + 1} / ${this.pages.length}`);
    draw();
  }

  // ---------- utilidades de dibujo ----------
  add2(...objs) {
    this.layer.add(objs);
    return objs[0];
  }

  label(x, y, str, color = INK, size = 8, origin = 0.5) {
    const opts = origin === 0 ? { align: 'left', wordWrap: { width: W - x - 24 } } : { wordWrap: { width: W - 60 } };
    return this.add2(text(this, x, y, str, size, color, opts).setOrigin(origin, 0.5));
  }

  block(x, y, size, color, hp, creature, shiny = false, spriteScale = null) {
    const objs = [this.add.rectangle(x, y, size, size, color).setStrokeStyle(2, creature?.legendary ? COLORS.gold : 0x101828)];
    if (creature) {
      objs.push(addCreatureImage(this, x, y - size * 0.08, creature.id, shiny, spriteScale ?? (creature.legendary ? 3 : 2)));
    }
    if (hp != null) {
      objs.push(text(this, x, creature ? y + size / 2 - 9 : y, String(hp), 8).setOrigin(0.5).setStroke('#101828', 3));
    }
    this.add2(...objs);
  }

  ball(x, y, tint, scale = 2) {
    const b = this.add.image(x, y, 'ball').setScale(scale);
    if (tint) b.setTint(tint);
    return this.add2(b);
  }

  meter(x, y, w, ratio, color) {
    const g = this.add.graphics();
    g.fillStyle(0x080a14);
    g.fillRect(x, y, w, 10);
    g.fillStyle(color);
    g.fillRect(x + 1, y + 1, (w - 2) * ratio, 8);
    this.add2(g);
  }

  // ---------- páginas ----------

  pageGoal() {
    // Mini tablero
    const g = this.add.graphics();
    g.fillStyle(COLORS.board);
    g.fillRect(70, 84, 220, 250);
    g.fillStyle(0xe05858, 0.7);
    for (let x = 70; x < 290; x += 8) g.fillRect(x, 300, 4, 2);
    this.add2(g);
    this.block(110, 130, 36, 0x58c878, 3);
    this.block(150, 130, 36, 0xe8c040, 5);
    this.block(230, 170, 36, 0x5ab0e8, 2);
    this.block(190, 130, 36, hexToNum(TYPES[CREATURES[4].type].light), 4, CREATURES[4]);
    const aim = this.add.graphics();
    aim.fillStyle(0xffffff, 0.9);
    for (let i = 1; i < 14; i++) aim.fillRect(180 - i * 5 - 1, 318 - i * 12 - 1, 3, 3);
    this.add2(aim);
    this.ball(180, 320, null, 1.5);
    const hand = this.label(212, 322, '← drag and release', '#a8b4cc');
    this.tweens.add({ targets: hand, x: 220, duration: 500, yoyo: true, repeat: -1 });
    this.label(W / 2, 370, 'Aim and launch all your orbs.');
    this.label(W / 2, 400, 'The number is the block HP.');
    this.label(W / 2, 430, 'Each round: +1 orb, all drop 1 row.');
    this.label(W / 2, 466, 'If a block reaches the\nred line, the game ends.', '#a03030');
    this.label(W / 2, 516, 'You are a hunter: defeat\nand capture beasts and gods.', '#2a6aa8');
  }

  pageBlocks() {
    const rows = [
      [() => this.block(64, 112, 40, 0xe88a40, 8), 'Plain block'],
      [() => this.block(64, 172, 40, hexToNum(TYPES[CREATURES[0].type].light), 6, CREATURES[0]), 'Beast: defeat it to\ntry to capture it'],
      [() => this.add2(this.add.image(64, 230, 'pickup').setScale(2)), 'Extra orb +1\nfor the next turn']
    ];
    rows.forEach(([draw, str], i) => {
      draw();
      this.label(104, 112 + i * 60, str, INK, 8, 0);
    });
    this.block(W / 2, 340, 88, hexToNum(TYPES[LEGENDARIES[0].type].light), 80, LEGENDARIES[0]);
    this.label(W / 2, 410, `Legendary god: every ${BOSS_EVERY} turns.`);
    this.label(W / 2, 434, 'Warned 2 turns ahead. When it\narrives, all drops 2 rows.', SOFT);
    const warn = this.add.rectangle(W / 2, 480, 260, 28, 0xe05858, 0.3);
    this.add2(warn);
    this.tweens.add({ targets: warn, alpha: 0.1, duration: 600, yoyo: true, repeat: -1 });
    this.label(W / 2, 480, 'A GOD IN 2 TURNS', '#a03030');
    this.label(W / 2, 524, 'Defeating it changes the\nweather and gives a special orb.', SOFT);
  }

  pageCapture() {
    const orb = this.add2(this.add.image(W / 2, 112, 'orb').setScale(4));
    this.tweens.add({ targets: orb, angle: { from: -18, to: 18 }, duration: 260, yoyo: true, repeat: -1 });
    this.label(W / 2, 156, 'When you defeat a beast,\nthe orb tries to capture it.');
    this.label(W - 80, 200, 'beast    god', SOFT);
    BALL_ORDER.forEach((id, i) => {
      const t = BALL_TYPES[id];
      const y = 232 + i * 46;
      const g = this.add.graphics();
      drawPanel(g, 30, y - 18, 110, 36, { fill: t.fill });
      this.add2(g);
      this.label(85, y, upper(t.name));
      this.label(W - 112, y, `${Math.round(t.rates.normal * 100)}%`, '#2a8a40');
      this.label(W - 52, y, `${Math.round(t.rates.legendary * 100)}%`, '#b07800');
    });
    this.label(W / 2, 384, 'Pick an orb at the bottom\nright before launching.');
    this.label(W / 2, 436, `${upper(BALL_TYPES.super.name)} (80%) or ${upper(BALL_TYPES.ultra.name)} (20%):\nclear the board or\ndefeat a god.`, '#2a6aa8');
    this.label(W / 2, 510, 'Gold beasts: always 100%!', '#b07800');
  }

  pagePowers() {
    this.label(W / 2, 96, 'Fill the MAGIC bar', INK);
    this.meter(80, 112, 200, 0.75, 0x4ce0e8);
    this.label(W / 2, 144, '= a random spell. Hold up to 2.', SOFT);
    SPECIALS.forEach((sp, i) => {
      const t = ELEMENTS[sp.type];
      const y = 182 + i * 50;
      const g = this.add.graphics();
      drawPanel(g, 26, y - 18, 64, 36, { fill: hexToNum(t.base) });
      this.add2(g);
      this.label(58, y, t.short, '#ffffff');
      this.add2(text(this, 100, y - 16, sp.name, 8, INK).setOrigin(0, 0));
      this.add2(text(this, 100, y - 2, sp.desc, 8, SOFT, { align: 'left', lineSpacing: 3, wordWrap: { width: 228 } }).setOrigin(0, 0));
    });
    this.label(W / 2, 490, '2 at once = COMBO. 2 equal = MAX.', '#2a6aa8');
    this.label(W / 2, 526, 'With a spell active, or both\nslots full, the bar stops filling.', SOFT);
  }

  pageShiny() {
    const c = CREATURES[9];
    const glow = this.add.rectangle(W / 2, 140, 96, 96, COLORS.gold, 0.4);
    this.add2(glow);
    this.tweens.add({ targets: glow, alpha: 0.1, scale: 1.08, duration: 520, yoyo: true, repeat: -1 });
    this.block(W / 2, 140, 84, hexToNum(TYPES[c.type].light), null, c, true, 4);
    for (const [x, y] of [[-38, -38], [38, -38], [38, 38], [-38, 38]]) {
      const sp = this.add2(this.add.image(W / 2 + x, 140 + y, 'spark').setScale(2));
      this.tweens.add({ targets: sp, alpha: 0.2, duration: 300, yoyo: true, repeat: -1, delay: Math.random() * 300 });
    }
    this.label(W / 2, 212, `Gold: a golden version.\nAppears ${pct(SHINY_RATE)} of the time.`);
    this.label(W / 2, 260, 'Fill the GOLD meter:', INK);
    this.meter(80, 278, 200, 0.6, 0xffd84a);
    ['Many blocks in one shot', 'Capturing beasts', 'Defeating a god', 'Clearing the board'].forEach((s, i) => {
      this.label(W / 2, 314 + i * 24, `+ ${s}`, SOFT);
    });
    this.label(W / 2, 420, `Full = ${pct(SHINY_BOOST_RATE)} gold chance\nfor ${SHINY_BOOST_TURNS} turns.`, '#b07800');
    this.label(W / 2, 480, 'Gold beasts are always\ncaptured.', '#b07800');
  }

  pageControls() {
    const rows = [
      ['x1.5', 'Speed: x1, x1.5,\nx2, x3 or x4'],
      ['▼', 'Recall all orbs'],
      ['II', 'Pause, music, sound\nand grid'],
      [ELEMENTS.fuego.short, 'Tap a spell to arm\nit before launching'],
      [upper(BALL_TYPES.super.name), 'Tap an orb to use\nit for the launch']
    ];
    rows.forEach(([icon, str], i) => {
      const y = 112 + i * 70;
      const g = this.add.graphics();
      drawPanel(g, 28, y - 18, 70, 36);
      this.add2(g);
      this.label(63, y, icon);
      this.label(112, y, str, INK, 8, 0);
    });
    this.label(W / 2, 480, 'Keyboard: arrows to aim,\nSPACE to launch.', SOFT);
    this.label(W / 2, 526, 'Orbs launch from where the\nlast one landed.', SOFT);
  }
}
