import Phaser from 'phaser';
import {
  W, H, COLS, ROWS, CELL, BOARD_X, BOARD_TOP, BOARD_BOTTOM, BOARD_RIGHT, LAUNCH_Y,
  BALL_R, BALL_SPEED, START_BALLS, LAUNCH_DELAY, CREATURE_CHANCE, BOSS_EVERY, SHINY_RATE,
  CORNER_JITTER, BALL_TEXTURE_R, VERTICAL_LOCK_CHANCE, SPEEDS, WATER_BALL_R, SPAWN_ROW,
  SHINY_BOOST_RATE, SHINY_BOOST_TURNS, SHINY_METER_MAX, SHINY_GAIN, MAX_POWERS
} from '../config.js';
import { NORMAL_CREATURES, LEGENDARIES } from '../data/creatures.js';
import { TYPES, effectiveness, hexToNum } from '../data/types.js';
import { SPECIAL_COST, specialById } from '../data/specials.js';
import { BALL_TYPES, BALL_ORDER, captureChance, rollRewardBall, rollPower } from '../data/balls.js';
import { creatureKey } from '../gfx/sprites.js';
import { text, makeButton, makePanel, floatText, makeAudioToggles, COLORS } from '../gfx/ui.js';
import { pick, weightedPick, randInt, shuffle } from '../core/rng.js';
import { logError } from '../core/errors.js';
import { Weather } from '../gfx/weather.js';
import { audio } from '../audio/audio.js';
import { newlyCompleted, MISSIONS } from '../data/missions.js';

const PLAIN_COLORS = [0x5ab0e8, 0x58c878, 0xe8c040, 0xe88a40, 0xe05858, 0xb860d8, 0x8860e8];
const MIN_ANGLE = Phaser.Math.DegToRad(8);
const TRAIL_POINTS = 5;
const pct = (r) => `${Math.round(r * 1000) / 10}%`;
const DANGER_Y = BOARD_TOP + (ROWS - 1) * CELL;

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('game');
  }

  init() {
    this.save = this.registry.get('save');
    this.turn = 1;
    this.score = 0;
    this.ballCount = START_BALLS;
    this.pendingBalls = 0;
    this.energy = 0;
    this.powers = []; // ids de poderes guardados (máx. MAX_POWERS)
    this.selectedSlots = new Set(); // huecos de poder marcados para el próximo lanzamiento
    this.activeSpecials = []; // poderes activos en el lanzamiento en curso
    this.ballInv = { normal: Infinity, super: 0, ultra: 0 };
    this.selectedBall = 'normal';
    this.shotBall = 'normal';
    this.shotKills = 0;
    this.collecting = false;
    this.shinyMeter = 0;
    this.shinyBoostTurns = 0;
    this.blocks = [];
    this.pickups = [];
    this.balls = [];
    this.bolts = [];
    this.state = 'aim'; // aim | shooting | resolving | over
    this.launchX = W / 2;
    this.nextLaunchX = null;
    this.aimAngle = -Math.PI / 2;
    this.aiming = false;
    this.aimValid = false;
    this.speedMul = SPEEDS.includes(this.save.data.settings.speed) ? this.save.data.settings.speed : 1;
    this.shotTime = 0;
    this.recallHinted = false;
    this.reservedBossCol = null;
    this.toLaunch = 0;
    this.launchTimer = null;
    this.runCaptures = [];
    this.lastEffTextAt = 0;
    this.paused = false;
    this.anyDead = false;
    this.pendingCaptures = 0;
    this.toastQueue = [];
    this.toastBusy = false;
  }

  create() {
    this.drawBoard();
    this.aimG = this.add.graphics().setDepth(5);
    this.trailG = this.add.graphics().setDepth(7);
    audio.setMood(0);
    this.fxG = this.add.graphics().setDepth(25);
    this.launcher = this.add.image(this.launchX, LAUNCH_Y, 'ball').setDepth(6).setScale(BALL_R / BALL_TEXTURE_R);
    this.nextMarker = this.add.image(0, LAUNCH_Y, 'ball').setDepth(6).setAlpha(0.4).setVisible(false).setScale(BALL_R / BALL_TEXTURE_R);
    this.launchText = text(this, this.launchX, LAUNCH_Y - 14, '', 8).setOrigin(0.5).setDepth(6).setStroke('#101828', 3);
    this.createHud();
    this.createSpecialBar();

    this.spawnRow();
    this.shiftAll(1, false);
    this.spawnRow();

    this.setupInput();
    this.updateBossWarning();
    this.refreshHud();
  }

  // ---------- Dibujo e interfaz ----------

  drawBoard() {
    // Capas: fondo (color del clima) < partículas del clima < cuadrícula y marco
    this.bgG = this.add.graphics().setDepth(-3);
    this.weather = new Weather(this, -2, (color) => this.drawBoardFill(color));
    // Cuadrícula opcional (ajuste CUADRICULA en la pausa; oculta por defecto)
    this.gridG = this.add.graphics().setDepth(-1);
    this.gridG.lineStyle(1, 0xffffff, 0.06);
    for (let c = 1; c < COLS; c++) this.gridG.lineBetween(BOARD_X + c * CELL, BOARD_TOP, BOARD_X + c * CELL, BOARD_BOTTOM);
    for (let r = 1; r < ROWS; r++) this.gridG.lineBetween(BOARD_X, BOARD_TOP + r * CELL, BOARD_RIGHT, BOARD_TOP + r * CELL);
    this.gridG.setVisible(this.save.data.settings.grid);
    const g = this.add.graphics().setDepth(-1);
    g.fillStyle(0xe05858, 0.5);
    for (let x = BOARD_X; x < BOARD_RIGHT; x += 8) g.fillRect(x, DANGER_Y, 4, 2);
    g.lineStyle(2, 0x3a4668);
    g.strokeRect(BOARD_X - 1, BOARD_TOP - 1, COLS * CELL + 2, LAUNCH_Y + 8 - BOARD_TOP);
  }

  drawBoardFill(color) {
    const from = this.boardColor ?? color;
    this.boardColor = color;
    const paint = (c) => {
      this.bgG.clear();
      this.bgG.fillStyle(COLORS.night);
      this.bgG.fillRect(0, 0, W, H);
      this.bgG.fillStyle(c);
      this.bgG.fillRect(BOARD_X, BOARD_TOP, COLS * CELL, LAUNCH_Y + 6 - BOARD_TOP);
    };
    if (from === color) return paint(color);
    // Transición suave del color de fondo
    const a = Phaser.Display.Color.IntegerToColor(from);
    const b = Phaser.Display.Color.IntegerToColor(color);
    this.tweens.addCounter({
      from: 0, to: 100, duration: 1200,
      onUpdate: (tw) => {
        const c = Phaser.Display.Color.Interpolate.ColorWithColor(a, b, 100, tw.getValue());
        paint(Phaser.Display.Color.GetColor(c.r, c.g, c.b));
      }
    });
  }

  changeWeather() {
    const w = this.weather.next();
    audio.setMood(this.weather.index);
    audio.play('weather');
    this.showToast(`El clima cambia: ${w.name}`, '#3a5a8a');
  }

  createHud() {
    makePanel(this, 4, 4, W - 8, 54);
    this.scoreText = text(this, 14, 14, '', 8, COLORS.inkHex).setOrigin(0, 0);
    this.bestText = text(this, 14, 28, '', 8, '#56607c').setOrigin(0, 0);
    this.turnText = text(this, 14, 42, '', 8, '#56607c').setOrigin(0, 0);
    this.captText = text(this, 130, 42, '', 8, '#56607c').setOrigin(0, 0);
    this.boostText = text(this, W - 14, 42, '', 8, '#c0409c').setOrigin(1, 0);
    this.menuBtn = makeButton(this, W - 26, 22, 30, 24, 'II', () => this.openPause());
    // Velocidad x1/x2/x3: se mantiene entre turnos y entre partidas.
    this.speedBtn = makeButton(this, W - 112, 22, 44, 24, `x${this.speedMul}`, () => {
      this.speedMul = SPEEDS[(SPEEDS.indexOf(this.speedMul) + 1) % SPEEDS.length];
      this.save.data.settings.speed = this.speedMul;
      this.save.write();
      this.refreshHud();
    });
    this.recallBtn = makeButton(this, W - 68, 22, 40, 24, '▼', () => this.recallBalls());
  }

  // Barra inferior: medidores de poder y shiny, 2 huecos de poder y selector de bola.
  createSpecialBar() {
    const barY = LAUNCH_Y + 14;
    text(this, BOARD_X, barY, 'PODER', 8, '#4ce0e8').setOrigin(0, 0);
    text(this, W / 2 + 4, barY, 'SHINY', 8, '#ff7cd0').setOrigin(0, 0);
    this.energyG = this.add.graphics();
    this.slotButtons = [];
    for (let i = 0; i < MAX_POWERS; i++) {
      const btn = makeButton(this, 4 + 37 + i * 78, H - 26, 74, 40, '-', () => this.toggleSlot(i));
      this.slotButtons.push(btn);
    }
    this.ballButtons = {};
    BALL_ORDER.forEach((id, i) => {
      const btn = makeButton(this, 162 + 31 + i * 65, H - 26, 62, 40, '', () => this.selectBall(id), {
        fill: BALL_TYPES[id].fill
      });
      this.ballButtons[id] = btn;
    });
    this.refreshSpecials();
  }

  drawMeter(x, y, w, ratio, color) {
    this.energyG.fillStyle(0x080a14);
    this.energyG.fillRect(x, y, w, 8);
    this.energyG.fillStyle(color);
    this.energyG.fillRect(x + 1, y + 1, (w - 2) * Math.min(1, ratio), 6);
  }

  refreshHud() {
    const best = Math.max(this.save.data.bestScore, Math.floor(this.score));
    this.scoreText.setText(`PUNTOS ${Math.floor(this.score)}`);
    this.bestText.setText(`RECORD ${best}`);
    this.turnText.setText(`TURNO ${this.turn}`);
    this.captText.setText(`CAPTURAS ${this.runCaptures.length}`);
    this.boostText.setText(this.shinyBoostTurns > 0 ? `SHINY ${pct(SHINY_BOOST_RATE)} x${this.shinyBoostTurns}` : '');
    const shooting = this.state === 'shooting';
    this.speedBtn.setLabel(`x${this.speedMul}`).setSelected(this.speedMul > 1);
    this.recallBtn.setVisible(shooting);
    const n = shooting ? this.toLaunch : this.ballCount;
    this.launchText.setText(n > 0 ? `x${n}` : '').setX(this.launchX);
    this.launcher.setX(this.launchX);
  }

  refreshSpecials() {
    const barY = LAUNCH_Y + 14;
    this.energyG.clear();
    const locked = this.powers.length >= MAX_POWERS;
    this.drawMeter(BOARD_X + 44, barY, W / 2 - BOARD_X - 52, this.energy / SPECIAL_COST, locked ? 0x56607c : 0x4ce0e8);
    this.drawMeter(W / 2 + 48, barY, W / 2 - BOARD_X - 48, this.shinyMeter / SHINY_METER_MAX, 0xff7cd0);
    const aim = this.state === 'aim';
    this.slotButtons.forEach((btn, i) => {
      const sp = specialById(this.powers[i]);
      btn.setLabel(sp ? TYPES[sp.type].short : '-');
      btn.setFill(sp ? hexToNum(TYPES[sp.type].base) : 0x3a4668, '#ffffff');
      btn.setEnabled(!!sp && aim);
      btn.setSelected(this.selectedSlots.has(i));
    });
    for (const id of BALL_ORDER) {
      const n = this.ballInv[id];
      const btn = this.ballButtons[id];
      btn.setLabel(id === 'normal' ? 'NORMAL' : `${BALL_TYPES[id].name.toUpperCase()}\n${n}`);
      btn.setEnabled(n > 0 && aim);
      btn.setSelected(this.selectedBall === id);
    }
  }

  showToast(msg, color = COLORS.inkHex) {
    if (this.toastQueue.length >= 4) this.toastQueue.shift();
    this.toastQueue.push({ msg, color });
    if (!this.toastBusy) this.nextToast();
  }

  nextToast() {
    const item = this.toastQueue.shift();
    if (!item) {
      this.toastBusy = false;
      return;
    }
    this.toastBusy = true;
    const layer = this.add.container(0, -60).setDepth(45);
    // El texto largo pasa a varias líneas y el panel crece con él.
    const label = text(this, W / 2, 0, item.msg, 8, item.color, { wordWrap: { width: W - 64 } }).setOrigin(0.5, 0);
    const h = label.height + 16;
    label.setY(BOARD_TOP + 6 + 8);
    layer.add(makePanel(this, 20, BOARD_TOP + 6, W - 40, h));
    layer.add(label);
    this.tweens.add({
      targets: layer, y: 0, duration: 160, ease: 'Back.easeOut',
      onComplete: () => {
        this.time.delayedCall(1100, () => {
          this.tweens.add({
            targets: layer, alpha: 0, duration: 160,
            onComplete: () => { layer.destroy(); this.nextToast(); }
          });
        });
      }
    });
  }

  // ---------- Entrada ----------

  setupInput() {
    this.input.on('pointerdown', (p) => {
      if (this.state !== 'aim' || this.paused) return;
      if (p.y < BOARD_TOP || p.y > LAUNCH_Y + 4) return;
      this.aiming = true;
      this.updateAim(p);
    });
    this.input.on('pointermove', (p) => {
      if (this.aiming) this.updateAim(p);
    });
    this.input.on('pointerup', () => {
      if (!this.aiming) return;
      this.aiming = false;
      this.aimG.clear();
      if (this.aimValid && this.state === 'aim' && !this.paused) this.fire();
    });
    this.keys = this.input.keyboard?.addKeys('LEFT,RIGHT');
    this.input.keyboard?.on('keydown-SPACE', () => {
      if (this.state === 'aim' && !this.paused) this.fire();
    });
    this.input.keyboard?.on('keydown-ESC', () => (this.paused ? null : this.openPause()));
  }

  updateAim(p) {
    const dx = p.x - this.launchX;
    const dy = p.y - LAUNCH_Y;
    if (dy > -6) {
      this.aimValid = false;
      this.aimG.clear();
      return;
    }
    this.aimAngle = Phaser.Math.Clamp(Math.atan2(dy, dx), -Math.PI + MIN_ANGLE, -MIN_ANGLE);
    this.aimValid = true;
    this.drawAim();
  }

  drawAim() {
    const g = this.aimG;
    g.clear();
    let x = this.launchX;
    let y = LAUNCH_Y;
    const vx = Math.cos(this.aimAngle);
    const vy = Math.sin(this.aimAngle);
    // Línea recta hasta el primer obstáculo (borde, techo o bloque), sin mostrar el rebote.
    for (let d = 0; d < 1000; d += 4) {
      x += vx * 4;
      y += vy * 4;
      if (x < BOARD_X + BALL_R || x > BOARD_RIGHT - BALL_R || y < BOARD_TOP + BALL_R) break;
      if (this.blocks.some((b) => !b.dead && this.circleHitsRect(x, y, b))) break;
      if (d % 12 === 0) {
        g.fillStyle(0xffffff, 0.85);
        g.fillRect(Math.round(x) - 1, Math.round(y) - 1, 3, 3);
      }
    }
  }

  // ---------- Bloques ----------

  isBossTurn(t) {
    return t > 0 && t % BOSS_EVERY === 0;
  }

  blockRect(b) {
    const x0 = BOARD_X + b.col * CELL + 2;
    const y0 = BOARD_TOP + b.row * CELL + 2;
    return { x0, y0, x1: x0 + b.size * CELL - 4, y1: y0 + b.size * CELL - 4 };
  }

  circleHitsRect(x, y, b) {
    const r = this.blockRect(b);
    const cx = Phaser.Math.Clamp(x, r.x0, r.x1);
    const cy = Phaser.Math.Clamp(y, r.y0, r.y1);
    return (x - cx) ** 2 + (y - cy) ** 2 < BALL_R * BALL_R;
  }

  plainColor(hp) {
    return PLAIN_COLORS[Math.min(PLAIN_COLORS.length - 1, Math.floor(Math.log2(Math.max(1, hp))))];
  }

  spawnRow() {
    const t = this.turn;
    const taken = new Set();
    // El legendario ocupa 2x2. Para que el tablero baje siempre una sola fila,
    // el turno anterior deja libres sus dos columnas, que tras bajar quedan vacías justo debajo.
    // Los bloques nuevos aparecen en SPAWN_ROW: la fila de arriba del todo siempre queda vacía.
    const row = SPAWN_ROW;
    if (this.isBossTurn(t) && this.reservedBossCol !== null) {
      const col = this.reservedBossCol;
      this.reservedBossCol = null;
      this.addBlock({ col, row, size: 2, kind: 'boss', creature: pick(LEGENDARIES), hp: 20 + t * 6 });
      taken.add(col).add(col + 1);
      this.showToast('¡Aparece un legendario!', '#b07800');
      audio.play('bossAppear');
    } else if (this.isBossTurn(t + 1)) {
      this.reservedBossCol = randInt(0, COLS - 2);
      taken.add(this.reservedBossCol).add(this.reservedBossCol + 1);
    }
    const free = shuffle([...Array(COLS).keys()].filter((c) => !taken.has(c)));
    const maxBlocks = Math.min(free.length - 1, 3 + Math.floor(t / 6));
    const count = Math.max(1, randInt(2, Math.max(2, maxBlocks)));
    for (let i = 0; i < Math.min(count, free.length - 1); i++) this.addRandomBlock(row, free[i], t);
    this.addPickup(row, free[free.length - 1]);
  }

  addRandomBlock(row, col, t) {
    if (Math.random() < CREATURE_CHANCE) {
      const rarity = weightedPick([[1, 60], [2, 30], [3, 10]]);
      const creature = pick(NORMAL_CREATURES.filter((c) => c.rarity === rarity));
      this.addBlock({ row, col, size: 1, kind: 'creature', creature, hp: Math.ceil(t * (1 + 0.4 * rarity)) });
    } else {
      this.addBlock({ row, col, size: 1, kind: 'plain', hp: Math.random() < 0.2 ? t * 2 : t });
    }
  }

  addBlock(d) {
    const shinyRate = this.shinyBoostTurns > 0 ? Math.max(SHINY_BOOST_RATE, SHINY_RATE) : SHINY_RATE;
    const blk = { ...d, maxHp: d.hp, dead: false, shiny: !!d.creature && Math.random() < shinyRate };
    const size = d.size * CELL;
    const px = BOARD_X + d.col * CELL + size / 2;
    const py = BOARD_TOP + d.row * CELL + size / 2;
    const cont = this.add.container(px, py).setDepth(d.kind === 'boss' ? 4 : 3);
    const color = d.creature ? hexToNum(TYPES[d.creature.type].light) : this.plainColor(d.hp);
    const bg = this.add.rectangle(0, 0, size - 4, size - 4, color).setStrokeStyle(2, d.kind === 'boss' ? COLORS.gold : 0x101828);
    cont.add(bg);
    blk.bg = bg;
    blk.color = color;
    if (d.creature) {
      const spr = this.add.image(0, d.kind === 'boss' ? -8 : -4, creatureKey(d.creature.id, blk.shiny)).setScale(d.kind === 'boss' ? 3 : 2);
      cont.add(spr);
      blk.sprite = spr;
      this.tweens.add({ targets: spr, y: spr.y - 2, duration: 400 + Math.random() * 300, yoyo: true, repeat: -1 });
      if (blk.shiny) this.decorateShiny(blk, cont, size);
    }
    blk.hpText = text(this, 0, d.creature ? size / 2 - 10 : 0, '', 8).setOrigin(0.5).setStroke('#101828', 3);
    cont.add(blk.hpText);
    blk.cont = cont;
    cont.setScale(0);
    this.tweens.add({ targets: cont, scale: 1, duration: 200, ease: 'Back.easeOut' });
    this.updateBlockText(blk);
    this.blocks.push(blk);
    return blk;
  }

  // Shiny: aura dorada que late, borde dorado, destellos en las esquinas y anuncio al aparecer.
  decorateShiny(blk, cont, size) {
    const glow = this.add.rectangle(0, 0, size + 6, size + 6, COLORS.gold, 0.5);
    cont.addAt(glow, 0);
    this.tweens.add({ targets: glow, alpha: 0.12, scale: 1.06, duration: 520, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    blk.bg.setStrokeStyle(2, COLORS.gold);
    const h = size / 2 - 7;
    [[-h, -h], [h, -h], [h, h], [-h, h]].forEach(([x, y], i) => {
      const sp = this.add.image(x, y, 'spark').setAlpha(0);
      cont.add(sp);
      this.tweens.add({ targets: sp, alpha: 1, scale: { from: 0.5, to: 1.4 }, duration: 260, yoyo: true, repeat: -1, repeatDelay: 500, delay: i * 190 });
    });
    // Haz de luz que cae sobre el bloque
    const beam = this.add.rectangle(cont.x, BOARD_TOP, 10, cont.y - BOARD_TOP, COLORS.gold, 0.45).setOrigin(0.5, 0).setDepth(18);
    this.tweens.add({ targets: beam, scaleX: 4, alpha: 0, duration: 700, ease: 'Quad.easeOut', onComplete: () => beam.destroy() });
    this.showToast(`¡Ha aparecido un ${blk.creature.name} SHINY!`, '#b07800');
    audio.play('shiny');
  }

  // Aviso en la fila superior (siempre vacía) cuando falta poco para el legendario.
  updateBossWarning() {
    const left = BOSS_EVERY - (this.turn % BOSS_EVERY);
    const show = left >= 1 && left <= 2 && this.state !== 'over';
    if (!show) {
      this.bossWarn?.setVisible(false);
      return;
    }
    if (!this.bossWarn) {
      const y = BOARD_TOP + CELL / 2;
      const bar = this.add.rectangle(W / 2, y, COLS * CELL - 4, CELL - 12, 0xe05858, 0.22);
      const label = text(this, W / 2, y, '', 8, '#ffb0b0').setOrigin(0.5).setStroke('#101828', 3);
      this.bossWarn = this.add.container(0, 0, [bar, label]).setDepth(2);
      this.bossWarn.label = label;
      this.tweens.add({ targets: bar, alpha: 0.08, duration: 600, yoyo: true, repeat: -1 });
    }
    this.bossWarn.label.setText(left === 1 ? '¡LEGENDARIO EL PROXIMO TURNO!' : 'LEGENDARIO EN 2 TURNOS');
    this.bossWarn.setVisible(true);
  }

  addPickup(row, col) {
    const img = this.add.image(BOARD_X + col * CELL + CELL / 2, BOARD_TOP + row * CELL + CELL / 2, 'pickup').setScale(2).setDepth(3);
    this.tweens.add({ targets: img, scale: 2.3, duration: 400, yoyo: true, repeat: -1 });
    this.pickups.push({ row, col, img, taken: false });
  }

  updateBlockText(blk) {
    blk.hpText.setText(String(Math.ceil(blk.hp)));
  }

  shiftAll(n, animate) {
    if (n <= 0) return;
    const move = (obj, row, size = 1) => {
      const y = BOARD_TOP + row * CELL + (size * CELL) / 2;
      if (animate) this.tweens.add({ targets: obj, y, duration: 200, ease: 'Quad.easeOut' });
      else obj.y = y;
    };
    for (const b of this.blocks) {
      b.row += n;
      move(b.cont, b.row, b.size);
    }
    for (const p of this.pickups) {
      p.row += n;
      move(p.img, p.row);
    }
  }

  // ---------- Disparo y física ----------

  hasSpecial(id) {
    return this.activeSpecials.some((s) => s.id === id);
  }

  toggleSlot(i) {
    if (this.state !== 'aim' || this.paused || !this.powers[i]) return;
    if (this.selectedSlots.has(i)) this.selectedSlots.delete(i);
    else {
      this.selectedSlots.add(i);
      const sp = specialById(this.powers[i]);
      this.showToast(`${sp.name}: ${sp.desc}`);
    }
    this.refreshSpecials();
  }

  selectBall(id) {
    if (this.state !== 'aim' || this.paused || !(this.ballInv[id] > 0)) return;
    this.selectedBall = this.selectedBall === id ? 'normal' : id;
    this.refreshSpecials();
  }

  fire() {
    if (this.state !== 'aim') return;
    this.aimG.clear();
    // Poderes marcados (pueden ser los dos a la vez): se gastan al lanzar.
    const slots = [...this.selectedSlots].sort((a, b) => a - b);
    this.activeSpecials = slots.map((i) => specialById(this.powers[i])).filter(Boolean);
    this.powers = this.powers.filter((_, i) => !this.selectedSlots.has(i));
    this.selectedSlots.clear();
    if (this.activeSpecials.length) {
      this.powerIntro(this.activeSpecials);
      this.save.bumpStat('powersUsed', this.activeSpecials.length);
      this.checkMissions();
    }
    // Bola de captura del lanzamiento
    this.shotBall = this.selectedBall;
    if (this.shotBall !== 'normal') {
      this.ballInv[this.shotBall]--;
      if (this.ballInv[this.shotBall] <= 0) this.selectedBall = 'normal';
    }
    this.state = 'shooting';
    this.shotTime = 0;
    this.shotKills = 0;
    this.collecting = false;
    this.nextLaunchX = null;
    // Posición y dirección fijas durante todo el turno.
    this.shotX = this.launchX;
    this.shotAngle = this.aimAngle;
    this.toLaunch = this.ballCount * (this.hasSpecial('enredadera') ? 2 : 1);
    if (this.hasSpecial('derrumbe')) this.rockslide();
    this.launchOne();
    this.launchTimer = this.time.addEvent({ delay: LAUNCH_DELAY, loop: true, callback: () => this.launchOne() });
    this.refreshHud();
    this.refreshSpecials();
  }

  launchOne() {
    if (this.toLaunch <= 0) {
      this.launchTimer?.remove();
      this.launchTimer = null;
      return;
    }
    this.toLaunch--;
    const big = this.hasSpecial('torrente');
    const img = this.add.image(this.shotX, LAUNCH_Y, 'ball').setDepth(8).setScale((big ? WATER_BALL_R : BALL_R) / BALL_TEXTURE_R);
    let trailColor = 0xffffff;
    if (this.activeSpecials.length) trailColor = hexToNum(TYPES[this.activeSpecials[0].type].light);
    else if (BALL_TYPES[this.shotBall].tint) trailColor = BALL_TYPES[this.shotBall].tint;
    if (trailColor !== 0xffffff) img.setTint(trailColor);
    audio.play('launch');
    this.balls.push({
      x: this.shotX,
      y: LAUNCH_Y - 1,
      r: big ? WATER_BALL_R : BALL_R,
      vx: Math.cos(this.shotAngle) * BALL_SPEED,
      vy: Math.sin(this.shotAngle) * BALL_SPEED,
      img,
      trail: [],
      trailColor,
      inside: new Set(),
      done: false
    });
    this.refreshHud();
  }

  recallBalls() {
    if (this.state !== 'shooting') return;
    this.toLaunch = 0;
    this.launchTimer?.remove();
    this.launchTimer = null;
    // La última bola en desaparecer marca el próximo punto de lanzamiento.
    const inFlight = this.balls.filter((b) => !b.done);
    const last = inFlight[inFlight.length - 1];
    if (last) this.nextLaunchX = Phaser.Math.Clamp(last.x, BOARD_X + 8, BOARD_RIGHT - 8);
    for (const b of this.balls) b.done = true;
    if (this.nextLaunchX === null) this.nextLaunchX = this.launchX;
  }

  update(_time, delta) {
    if (this.paused || this.state === 'over') return;
    const dt = Math.min(delta, 50) / 1000;
    this.weather.update(dt);
    this.drawBolts(dt);

    if (this.state === 'aim' && this.keys) {
      const dir = (this.keys.RIGHT.isDown ? 1 : 0) - (this.keys.LEFT.isDown ? 1 : 0);
      if (dir) {
        this.aimAngle = Phaser.Math.Clamp(this.aimAngle + dir * 1.4 * dt, -Math.PI + MIN_ANGLE, -MIN_ANGLE);
        this.drawAim();
      }
    }
    if (this.state !== 'shooting') return;

    this.shotTime += dt;
    if (this.shotTime > 12 && !this.recallHinted) {
      this.recallHinted = true;
      this.showToast('Pulsa ▼ para recoger las bolas');
    }
    if (this.launchTimer) this.launchTimer.timeScale = this.speedMul;

    const total = dt * this.speedMul;
    const steps = Math.max(1, Math.ceil((total * BALL_SPEED) / 3));
    const s = total / steps;
    for (let i = 0; i < steps; i++) {
      for (const b of this.balls) if (!b.done && !b.collecting) this.stepBall(b, s);
      if (this.anyDead) {
        this.blocks = this.blocks.filter((b) => !b.dead);
        this.anyDead = false;
      }
    }
    // Pantalla limpia en mitad del lanzamiento: se recogen solas las bolas que quedan.
    if (!this.collecting && this.blocks.length === 0) this.collectAll();
    for (const b of this.balls) {
      if (b.done && b.img) {
        b.img.destroy();
        b.img = null;
      } else if (b.img) {
        if (!b.collecting) b.img.setPosition(b.x, b.y);
        b.trail.push(b.img.x, b.img.y);
        if (b.trail.length > TRAIL_POINTS * 2) b.trail.splice(0, 2);
      }
    }
    this.drawTrails();
    this.balls = this.balls.filter((b) => !b.done);
    if (this.toLaunch === 0 && this.balls.length === 0) this.endTurn();
  }

  // Recogida automática: las bolas en vuelo vuelan al lanzador en cascada, con destellos y notas ascendentes.
  collectAll() {
    this.collecting = true;
    this.launchTimer?.remove();
    this.launchTimer = null;
    this.toLaunch = 0;
    const tx = this.nextLaunchX ?? this.shotX;
    this.nextLaunchX = tx;
    this.nextMarker.setPosition(tx, LAUNCH_Y).setVisible(true);
    const flying = this.balls.filter((b) => !b.done);
    if (!flying.length) return;
    this.showToast('Recogiendo bolas...', '#2a8a40');
    flying.forEach((b, i) => {
      b.collecting = true;
      const delay = i * 35;
      const midX = (b.img.x + tx) / 2 + (Math.random() - 0.5) * 80;
      const midY = Math.min(b.img.y, LAUNCH_Y) - 40 - Math.random() * 60;
      const curve = new Phaser.Curves.QuadraticBezier(
        new Phaser.Math.Vector2(b.img.x, b.img.y), new Phaser.Math.Vector2(midX, midY), new Phaser.Math.Vector2(tx, LAUNCH_Y)
      );
      const p = new Phaser.Math.Vector2();
      this.tweens.addCounter({
        from: 0, to: 1, duration: 420, delay, ease: 'Cubic.easeIn',
        onUpdate: (tw) => {
          if (!b.img) return;
          curve.getPoint(tw.getValue(), p);
          b.img.setPosition(p.x, p.y);
        },
        onComplete: () => {
          b.done = true;
          audio.play('collect', { step: i });
          const sp = this.add.image(tx, LAUNCH_Y, 'spark').setDepth(9).setScale(1.5);
          this.tweens.add({ targets: sp, y: LAUNCH_Y - 14, scale: 0, angle: 90, duration: 260, onComplete: () => sp.destroy() });
          this.launcher.setScale((BALL_R / BALL_TEXTURE_R) * 1.5);
          this.tweens.add({ targets: this.launcher, scale: BALL_R / BALL_TEXTURE_R, duration: 120 });
        }
      });
    });
  }

  // Estela leve: puntos que se encogen y se desvanecen detrás de cada bola.
  drawTrails() {
    const g = this.trailG;
    g.clear();
    for (const b of this.balls) {
      if (!b.img) continue;
      const n = b.trail.length / 2;
      for (let i = 0; i < n - 1; i++) {
        const k = (i + 1) / n;
        const size = Math.max(1, Math.round(b.r * 1.4 * k));
        g.fillStyle(b.trailColor, 0.28 * k);
        g.fillRect(Math.round(b.trail[i * 2] - size / 2), Math.round(b.trail[i * 2 + 1] - size / 2), size, size);
      }
    }
  }

  stepBall(b, s) {
    b.x += b.vx * s;
    b.y += b.vy * s;
    if (b.x < BOARD_X + b.r) {
      b.x = BOARD_X + b.r;
      b.vx = Math.abs(b.vx);
    } else if (b.x > BOARD_RIGHT - b.r) {
      b.x = BOARD_RIGHT - b.r;
      b.vx = -Math.abs(b.vx);
    }
    if (b.y < BOARD_TOP + b.r) {
      b.y = BOARD_TOP + b.r;
      b.vy = Math.abs(b.vy);
    }
    if (b.y >= LAUNCH_Y) {
      b.done = true;
      // La última bola en volver marca dónde se lanzará el próximo turno
      // (el lanzador actual no se mueve hasta que acaba el turno).
      this.nextLaunchX = Phaser.Math.Clamp(b.x, BOARD_X + 8, BOARD_RIGHT - 8);
      this.nextMarker.setPosition(this.nextLaunchX, LAUNCH_Y).setVisible(true);
      return;
    }

    const piercing = this.hasSpecial('torrente');
    for (const blk of this.blocks) {
      if (blk.dead) continue;
      const r = this.blockRect(blk);
      const cx = Phaser.Math.Clamp(b.x, r.x0, r.x1);
      const cy = Phaser.Math.Clamp(b.y, r.y0, r.y1);
      const dx = b.x - cx;
      const dy = b.y - cy;
      const d2 = dx * dx + dy * dy;
      if (d2 >= b.r * b.r) {
        if (piercing) b.inside.delete(blk);
        continue;
      }
      if (piercing) {
        if (!b.inside.has(blk)) {
          b.inside.add(blk);
          this.hitBlock(blk);
        }
        continue;
      }
      let nx;
      let ny;
      let d = Math.sqrt(d2);
      if (d > 0.0001) {
        nx = dx / d;
        ny = dy / d;
      } else {
        // El centro de la bola está dentro: salimos por el lado más cercano.
        const pen = [b.x - r.x0, r.x1 - b.x, b.y - r.y0, r.y1 - b.y];
        const m = pen.indexOf(Math.min(...pen));
        [nx, ny] = [[-1, 0], [1, 0], [0, -1], [0, 1]][m];
        d = -pen[m];
      }
      const dot = b.vx * nx + b.vy * ny;
      if (dot < 0) {
        b.vx -= 2 * dot * nx;
        b.vy -= 2 * dot * ny;
        // Golpe justo en la esquina: rebote irregular y, muy rara vez, la bola queda en vertical.
        const corner = (b.x < r.x0 || b.x > r.x1) && (b.y < r.y0 || b.y > r.y1);
        if (corner) this.cornerBounce(b);
      }
      b.x += nx * (b.r - d);
      b.y += ny * (b.r - d);
      this.hitBlock(blk);
      break;
    }

    // Evita bolas atrapadas rebotando casi en horizontal.
    if (Math.abs(b.vy) < BALL_SPEED * 0.08) {
      b.vy = (b.vy <= 0 ? -1 : 1) * BALL_SPEED * 0.08;
      const k = BALL_SPEED / Math.hypot(b.vx, b.vy);
      b.vx *= k;
      b.vy *= k;
    }

    for (const p of this.pickups) {
      if (p.taken) continue;
      const px = BOARD_X + p.col * CELL + CELL / 2;
      const py = BOARD_TOP + p.row * CELL + CELL / 2;
      if ((b.x - px) ** 2 + (b.y - py) ** 2 < (b.r + 8) ** 2) this.takePickup(p);
    }
  }

  cornerBounce(b) {
    if (Math.random() < VERTICAL_LOCK_CHANCE) {
      b.vy = (b.vy < 0 ? -1 : 1) * BALL_SPEED;
      b.vx = 0;
      return;
    }
    const jitter = (Math.random() * 2 - 1) * CORNER_JITTER;
    const cos = Math.cos(jitter);
    const sin = Math.sin(jitter);
    [b.vx, b.vy] = [b.vx * cos - b.vy * sin, b.vx * sin + b.vy * cos];
  }

  takePickup(p) {
    p.taken = true;
    this.pendingBalls++;
    audio.play('pickup');
    floatText(this, p.img.x, p.img.y, '+1', '#7cf07c');
    this.tweens.killTweensOf(p.img);
    this.tweens.add({ targets: p.img, scale: 0, duration: 150, onComplete: () => p.img.destroy() });
    this.pickups = this.pickups.filter((q) => q !== p);
  }

  // ---------- Daño, especiales y captura ----------

  hitBlock(blk) {
    // Con dos poderes activos se usa la mejor eficacia de sus tipos.
    const eff = this.activeSpecials.length
      ? Math.max(...this.activeSpecials.map((s) => effectiveness(s.type, blk.creature?.type)))
      : 1;
    const dmg = (this.hasSpecial('escarcha') ? 2 : 1) * eff;
    const { x, y } = blk.cont;
    this.powerHitFx(blk, x, y);
    this.damage(blk, dmg, eff);
    if (this.hasSpecial('estallido')) {
      for (const n of this.neighbors(blk)) this.damage(n, 0.5 * effectiveness('fuego', n.creature?.type));
    }
    if (this.hasSpecial('arco')) {
      const near = this.blocks
        .filter((o) => !o.dead && o !== blk)
        .map((o) => ({ o, d: Phaser.Math.Distance.Between(x, y, o.cont.x, o.cont.y) }))
        .filter((e) => e.d < CELL * 2.6)
        .sort((a, b2) => a.d - b2.d)
        .slice(0, 2);
      for (const { o } of near) {
        this.bolts.push({ x1: x, y1: y, x2: o.cont.x, y2: o.cont.y, ttl: 0.16, max: 0.16 });
        this.fxBurst(o.cont.x, o.cont.y, [0xfff07a, 0xffffff], 4, 18, 200);
        this.damage(o, effectiveness('electrico', o.creature?.type));
      }
    }
  }

  neighbors(blk) {
    return this.blocks.filter(
      (o) => !o.dead && o !== blk &&
        o.col <= blk.col + blk.size && o.col + o.size >= blk.col &&
        o.row <= blk.row + blk.size && o.row + o.size >= blk.row
    );
  }

  damage(blk, dmg, eff = 1) {
    if (blk.dead || dmg <= 0) return;
    this.addScore(Math.min(dmg, blk.hp));
    blk.hp -= dmg;
    blk.bg.setFillStyle(0xffffff);
    this.time.delayedCall(50, () => !blk.dead && blk.bg.setFillStyle(blk.color));
    this.punch(blk);
    audio.play('hit', { boss: blk.kind === 'boss' });
    if (eff !== 1 && this.time.now - this.lastEffTextAt > 400) {
      this.lastEffTextAt = this.time.now;
      floatText(this, blk.cont.x, blk.cont.y - 16, eff > 1 ? '¡MUY EFICAZ!' : 'poco eficaz', eff > 1 ? COLORS.goldHex : '#a8b4cc');
    }
    if (blk.hp <= 0.001) this.destroyBlock(blk);
    else this.updateBlockText(blk);
  }

  // Reacción leve al impacto: el bloque se encoge un instante y vuelve (los legendarios, menos).
  punch(blk) {
    const now = this.time.now;
    if (now - (blk.lastPunch ?? 0) < 70) return;
    blk.lastPunch = now;
    const amount = blk.kind === 'boss' ? 0.04 : 0.09;
    const c = blk.cont;
    this.tweens.add({ targets: c, scaleX: 1 - amount, scaleY: 1 - amount, duration: 45, yoyo: true, ease: 'Quad.easeOut', onComplete: () => !blk.dead && c.setScale(1) });
    if (blk.sprite) {
      this.tweens.add({ targets: blk.sprite, angle: { from: (Math.random() < 0.5 ? -1 : 1) * (blk.kind === 'boss' ? 4 : 8), to: 0 }, duration: 160, ease: 'Back.easeOut' });
    }
  }

  // Destrucción: destello, onda, fragmentos con gravedad y sacudida según el tamaño.
  destroyBlock(blk) {
    blk.dead = true;
    this.anyDead = true;
    const { x, y } = blk.cont;
    const size = blk.size * CELL - 4;
    const boss = blk.kind === 'boss';
    const flash = this.add.rectangle(x, y, size, size, 0xffffff).setDepth(19);
    this.tweens.add({ targets: flash, scale: 1.35, alpha: 0, duration: boss ? 380 : 200, ease: 'Quad.easeOut', onComplete: () => flash.destroy() });
    const ring = this.add.circle(x, y, size * 0.35).setStrokeStyle(2, blk.color).setDepth(19);
    this.tweens.add({ targets: ring, scale: boss ? 2.6 : 1.8, alpha: 0, duration: boss ? 500 : 280, onComplete: () => ring.destroy() });
    const pieces = boss ? 28 : blk.creature ? 16 : 12;
    for (let i = 0; i < pieces; i++) {
      const a = Math.random() * Math.PI * 2;
      const dist = (boss ? 60 : 26) + Math.random() * (boss ? 60 : 26);
      const s = 2 + Math.floor(Math.random() * (boss ? 5 : 4));
      const color = Math.random() < 0.25 ? 0xffffff : blk.color;
      const p = this.add.rectangle(x + (Math.random() - 0.5) * size * 0.6, y + (Math.random() - 0.5) * size * 0.6, s, s, color).setDepth(20);
      this.tweens.add({
        targets: p,
        x: { value: p.x + Math.cos(a) * dist, ease: 'Quad.easeOut' },
        y: { value: p.y + Math.sin(a) * dist + 24, ease: 'Quad.easeIn' },
        angle: (Math.random() - 0.5) * 360,
        alpha: 0,
        duration: 420 + Math.random() * 260,
        onComplete: () => p.destroy()
      });
    }
    if (boss) {
      this.cameras.main.shake(260, 0.008);
      this.cameras.main.flash(180, 255, 240, 200);
      audio.play('bossBreak');
    } else {
      if (blk.creature) this.cameras.main.shake(70, 0.0025);
      audio.play(blk.creature ? 'breakCreature' : 'break');
    }
    const bonus = blk.kind === 'plain' ? 5 : blk.kind === 'creature' ? 20 * blk.creature.rarity : 300;
    this.addScore(bonus);
    this.shotKills++;
    if (blk.kind === 'boss') {
      this.awardBall();
      this.addShiny(SHINY_GAIN.legendary);
      this.save.bumpStat('bossKills');
      this.checkMissions();
      this.time.delayedCall(600, () => this.changeWeather());
    }
    this.addEnergy(blk.kind === 'plain' ? 6 : blk.kind === 'creature' ? 12 : 50);
    if (blk.creature) this.tryCapture(blk, x, y);
    blk.cont.destroy();
  }

  // ---------- Efectos de poderes ----------

  /** Fragmentos que salen despedidos. gravity: caída extra en px (negativa = suben). */
  fxBurst(x, y, colors, count, dist, dur, gravity = 10) {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const d = dist * (0.5 + Math.random() * 0.7);
      const s = 2 + Math.floor(Math.random() * 3);
      const p = this.add.rectangle(x, y, s, s, colors[i % colors.length]).setDepth(21);
      this.tweens.add({
        targets: p,
        x: { value: x + Math.cos(a) * d, ease: 'Quad.easeOut' },
        y: { value: y + Math.sin(a) * d + gravity, ease: 'Quad.easeIn' },
        alpha: 0,
        duration: dur * (0.7 + Math.random() * 0.5),
        onComplete: () => p.destroy()
      });
    }
  }

  fxRing(x, y, color, radius, dur, width = 3) {
    const ring = this.add.circle(x, y, radius * 0.3).setStrokeStyle(width, color).setDepth(21);
    this.tweens.add({ targets: ring, scale: 3.3, alpha: 0, duration: dur, ease: 'Quad.easeOut', onComplete: () => ring.destroy() });
  }

  /** Presentación del poder: destello del tablero, cartel que cruza la pantalla y sonido. */
  powerIntro(specials) {
    const main = TYPES[specials[0].type];
    const tint = this.add
      .rectangle(BOARD_X, BOARD_TOP, COLS * CELL, LAUNCH_Y + 6 - BOARD_TOP, hexToNum(main.base), 0.28)
      .setOrigin(0)
      .setDepth(17);
    this.tweens.add({ targets: tint, alpha: 0, duration: 650, onComplete: () => tint.destroy() });
    const y = BOARD_TOP + CELL * 4.5;
    const band = this.add.rectangle(W / 2, y, W, 40, hexToNum(main.dark), 0.85).setDepth(46).setScale(1, 0);
    const name = specials.map((s) => s.name.toUpperCase()).join(' + ');
    const label = text(this, W + 160, y, name, specials.length > 1 ? 8 : 16, '#ffffff').setOrigin(0.5).setDepth(47).setStroke('#101828', 4);
    this.tweens.add({ targets: band, scaleY: 1, duration: 120, yoyo: true, hold: 520, onComplete: () => band.destroy() });
    this.tweens.add({
      targets: label, x: W / 2, duration: 220, ease: 'Back.easeOut',
      onComplete: () =>
        this.tweens.add({ targets: label, x: -200, delay: 380, duration: 200, ease: 'Quad.easeIn', onComplete: () => label.destroy() })
    });
    this.cameras.main.shake(120, 0.003);
    audio.play('powerCast');
    for (const sp of specials) {
      const t = TYPES[sp.type];
      this.fxBurst(this.launchX, LAUNCH_Y, [hexToNum(t.base), hexToNum(t.light), 0xffffff], 14, 34, 500, -10);
    }
  }

  /** Efecto de cada golpe según los poderes activos (limitado por bloque para no saturar). */
  powerHitFx(blk, x, y) {
    if (!this.activeSpecials.length) return;
    const now = this.time.now;
    if (now - (blk.lastFx ?? 0) < 90) return;
    blk.lastFx = now;
    if (this.hasSpecial('estallido')) {
      this.fxRing(x, y, 0xffa25c, 26, 300, 4);
      this.fxBurst(x, y, [0xffd84a, 0xe8613c, 0xffa25c], 8, 34, 380, -14);
      audio.play('fireHit');
    }
    if (this.hasSpecial('torrente')) {
      this.fxRing(x, y, 0x78c0ff, 18, 280, 2);
      this.fxBurst(x, y, [0x78c0ff, 0xd8f4ff], 5, 22, 320, 16);
      audio.play('splash');
    }
    if (this.hasSpecial('enredadera')) {
      this.fxBurst(x, y, [0x8ce070, 0x4cb04c, 0xf070a0], 5, 20, 420, 18);
    }
    if (this.hasSpecial('arco')) audio.play('zap');
    if (this.hasSpecial('escarcha')) {
      const size = blk.size * CELL - 4;
      const ice = this.add.rectangle(x, y, size, size, 0xd4f4ff, 0.55).setDepth(5);
      this.tweens.add({ targets: ice, alpha: 0, duration: 420, onComplete: () => ice.destroy() });
      this.fxBurst(x, y, [0xffffff, 0xd4f4ff, 0x8cd8f0], 6, 26, 460, 8);
      audio.play('frost');
    }
  }

  rockslide() {
    const alive = this.blocks.filter((b) => !b.dead);
    if (!alive.length) return;
    const lowest = Math.max(...alive.map((b) => b.row + b.size - 1));
    const targets = alive.filter((b) => b.row <= lowest && b.row + b.size - 1 >= lowest);
    const dmg = this.ballCount;
    targets.forEach((blk, i) => {
      const rock = this.add.image(blk.cont.x, BOARD_TOP - 10, 'rock').setScale(blk.kind === 'boss' ? 7 : 4).setDepth(22);
      this.tweens.add({ targets: rock, angle: 220, duration: 320, delay: i * 60 });
      this.tweens.add({
        targets: rock, y: blk.cont.y, duration: 320, delay: i * 60, ease: 'Quad.easeIn',
        onComplete: () => {
          rock.destroy();
          this.cameras.main.shake(110, 0.006);
          audio.play('rumble');
          this.fxRing(blk.cont.x, blk.cont.y, 0xc8b08c, 30, 360);
          this.fxBurst(blk.cont.x, blk.cont.y, [0xa08868, 0x685440, 0xc8b08c], 12, 40, 520, 30);
          // A un legendario no lo elimina: le quita la mitad de su salud actual.
          if (blk.kind === 'boss') this.damage(blk, blk.hp * 0.5);
          else this.damage(blk, dmg * effectiveness('roca', blk.creature?.type));
          this.blocks = this.blocks.filter((b) => !b.dead);
        }
      });
    });
  }

  drawBolts(dt) {
    this.fxG.clear();
    if (!this.bolts.length) return;
    for (const bolt of this.bolts) {
      const pts = [];
      for (let i = 0; i <= 6; i++) {
        const t = i / 6;
        const j = i === 0 || i === 6 ? 0 : (Math.random() - 0.5) * 14;
        pts.push(new Phaser.Math.Vector2(Phaser.Math.Linear(bolt.x1, bolt.x2, t) + j, Phaser.Math.Linear(bolt.y1, bolt.y2, t) + j));
      }
      const a = Math.max(0, bolt.ttl / (bolt.max ?? 0.12));
      this.fxG.lineStyle(6, 0xfff07a, 0.25 * a); // halo
      this.fxG.strokePoints(pts);
      this.fxG.lineStyle(2, 0xffffff, a); // núcleo
      this.fxG.strokePoints(pts);
      bolt.ttl -= dt;
    }
    this.bolts = this.bolts.filter((b) => b.ttl > 0);
  }

  addScore(n) {
    this.score += n;
    this.refreshHud();
  }

  addEnergy(n) {
    // Un lanzamiento con poder no carga la barra, y con los 2 huecos llenos tampoco.
    if (this.activeSpecials.length) return;
    if (this.powers.length >= MAX_POWERS) {
      this.energy = 0;
      return;
    }
    this.energy += n;
    if (this.energy >= SPECIAL_COST) {
      this.energy = 0;
      const sp = specialById(rollPower());
      this.powers.push(sp.id);
      audio.play('power');
      this.showToast(`¡Nuevo poder: ${sp.name}!`, TYPES[sp.type].dark);
    }
    this.refreshSpecials();
  }

  /** Comprueba misiones recién cumplidas (contando la partida en curso) y las anuncia. */
  checkMissions() {
    try {
      const fresh = this.save.completeMissions(newlyCompleted(this.save.data, { score: this.score, turn: this.turn }).map((m) => m.id));
      for (const id of fresh) {
        this.showToast(`¡Misión cumplida! ${this.missionTitle(id)}`, '#2a8a40');
        audio.play('mission');
      }
    } catch (err) {
      logError('missions', err);
    }
  }

  missionTitle(id) {
    return MISSIONS.find((m) => m.id === id)?.title ?? id;
  }

  addShiny(n) {
    this.shinyMeter += n;
    if (this.shinyMeter >= SHINY_METER_MAX) {
      this.shinyMeter = 0;
      this.shinyBoostTurns = SHINY_BOOST_TURNS;
      audio.play('shiny');
      this.showToast(`¡Shiny al ${pct(SHINY_BOOST_RATE)} durante ${SHINY_BOOST_TURNS} turnos!`, '#c0409c');
    }
    this.refreshSpecials();
    this.refreshHud();
  }

  awardBall() {
    const id = rollRewardBall();
    this.ballInv[id]++;
    audio.play('reward');
    this.showToast(`¡Bola ${BALL_TYPES[id].name.toLowerCase()} conseguida!`, '#2a6aa8');
    this.refreshSpecials();
  }

  tryCapture(blk, x, y) {
    const c = blk.creature;
    const shiny = blk.shiny;
    const success = Math.random() < captureChance(this.shotBall, c, shiny);
    this.pendingCaptures++;
    const scale = blk.kind === 'boss' ? 3 : 2;
    const spr = this.add.image(x, y, creatureKey(c.id, shiny)).setScale(scale).setDepth(30);
    const orb = this.add.image(x, y, 'orb').setScale(2).setDepth(31).setAlpha(0);
    if (BALL_TYPES[this.shotBall].tint) orb.setTint(BALL_TYPES[this.shotBall].tint);
    this.tweens.add({
      targets: spr, scale: 0, duration: 220, ease: 'Quad.easeIn',
      onComplete: () => {
        orb.setAlpha(1);
        this.tweens.add({
          targets: orb, angle: { from: -20, to: 20 }, duration: 140, yoyo: true, repeat: 2,
          onYoyo: () => audio.play('shake'),
          onComplete: () => {
            orb.setAngle(0);
            try {
              if (success) this.captureSuccess(c, shiny, orb, x, y);
              else this.captureFail(c, spr, orb, scale);
            } catch (err) {
              logError('capture', err, { id: c.id });
            }
            this.pendingCaptures--;
            if (!success) return;
            spr.destroy();
          }
        });
      }
    });
  }

  captureSuccess(c, shiny, orb, x, y) {
    const res = this.save.recordCapture(c.id, shiny);
    this.time.delayedCall(600, () => this.checkMissions());
    audio.play(shiny ? 'shiny' : 'capture');
    this.runCaptures.push({ id: c.id, shiny });
    this.addScore(shiny ? 1000 : 100);
    floatText(this, x, y - 12, shiny ? '+1000' : '+100', COLORS.goldHex);
    for (let i = 0; i < 6; i++) {
      const s = this.add.image(x, y, 'spark').setDepth(32).setScale(2);
      const a = (i / 6) * Math.PI * 2;
      this.tweens.add({ targets: s, x: x + Math.cos(a) * 22, y: y + Math.sin(a) * 22, alpha: 0, duration: 400, onComplete: () => s.destroy() });
    }
    this.tweens.add({ targets: orb, y: y - 30, alpha: 0, duration: 500, delay: 150, onComplete: () => orb.destroy() });
    let msg = `¡${c.name} capturado!`;
    if (shiny) msg = `¡${c.name} SHINY!`;
    if (res.isNew || res.isNewShiny) msg += ' NUEVO';
    this.showToast(msg, shiny ? '#b07800' : COLORS.inkHex);
  }

  captureFail(c, spr, orb, scale) {
    orb.destroy();
    audio.play('escape');
    spr.setScale(scale);
    floatText(this, spr.x, spr.y - 12, '¡Escapó!', '#a8b4cc');
    this.tweens.add({ targets: spr, y: spr.y - 20, alpha: 0, duration: 450, onComplete: () => spr.destroy() });
  }

  // ---------- Turnos ----------

  endTurn() {
    this.state = 'resolving';
    this.launchTimer?.remove();
    this.launchTimer = null;
    this.blocks = this.blocks.filter((b) => !b.dead);
    if (this.nextLaunchX !== null) this.launchX = this.nextLaunchX;
    this.nextMarker.setVisible(false);
    this.trailG.clear();
    this.ballCount += this.pendingBalls;
    this.pendingBalls = 0;
    this.activeSpecials = [];
    this.turn++;

    // Lanzamiento muy efectivo: llena el medidor shiny.
    if (this.shotKills > 3) this.addShiny((this.shotKills - 3) * SHINY_GAIN.perKillOver3);
    // Pantalla limpia: bola especial, medidor shiny y bonus.
    if (this.blocks.length === 0) {
      this.showToast('¡Pantalla limpia!', '#2a8a40');
      audio.play('clear');
      this.addScore(500);
      this.awardBall();
      this.addShiny(SHINY_GAIN.clear);
      this.save.bumpStat('clears');
    }

    // Siempre baja exactamente una fila.
    this.shiftAll(1, true);
    // Las bolas extra que llegan abajo se recogen solas.
    for (const p of [...this.pickups]) if (p.row >= ROWS - 1) this.takePickup(p);
    if (this.blocks.some((b) => b.row + b.size - 1 >= ROWS - 1)) {
      this.time.delayedCall(250, () => this.gameOver());
      this.refreshHud();
      return;
    }
    this.spawnRow();
    this.checkMissions();
    if (this.shinyBoostTurns > 0) this.shinyBoostTurns--;
    this.updateBossWarning();
    if (BOSS_EVERY - (this.turn % BOSS_EVERY) === 2) {
      this.showToast('¡Un legendario llegará en 2 turnos!', '#a03030');
      audio.play('bossAppear');
    }
    this.time.delayedCall(220, () => {
      if (this.state !== 'resolving') return;
      this.state = 'aim';
      this.refreshHud();
      this.refreshSpecials();
    });
    this.refreshHud();
  }

  openPause() {
    if (this.paused || this.state === 'over') return;
    this.paused = true;
    this.aiming = false;
    this.aimG.clear();
    this.tweens.pauseAll();
    this.time.paused = true;
    const layer = this.add.container(0, 0).setDepth(60);
    layer.add(this.add.rectangle(0, 0, W, H, 0x000000, 0.6).setOrigin(0).setInteractive());
    layer.add(makePanel(this, 24, 200, W - 48, 270));
    layer.add(makeAudioToggles(this, 390, this.save));
    const gridLabel = () => `CUADRICULA ${this.save.data.settings.grid ? 'SI' : 'NO'}`;
    const gridBtn = makeButton(this, W / 2, 432, 200, 30, gridLabel(), () => {
      const st = this.save.data.settings;
      st.grid = !st.grid;
      this.save.write();
      this.gridG.setVisible(st.grid);
      gridBtn.setLabel(gridLabel());
    });
    layer.add(gridBtn);
    layer.add(text(this, W / 2, 228, 'PAUSA', 16, COLORS.inkHex).setOrigin(0.5));
    layer.add(makeButton(this, W / 2, 285, 180, 34, 'CONTINUAR', () => {
      layer.destroy();
      this.tweens.resumeAll();
      this.time.paused = false;
      this.paused = false;
    }));
    layer.add(makeButton(this, W / 2, 335, 180, 34, 'SALIR AL MENU', () => {
      this.time.paused = false;
      this.save.recordGame(Math.floor(this.score), this.turn);
      this.checkMissions();
      this.scene.start('title');
    }));
  }

  gameOver() {
    if (this.state === 'over') return;
    // Esperamos a que terminen las capturas en curso para contar sus puntos.
    if (this.pendingCaptures > 0) {
      this.time.delayedCall(150, () => this.gameOver());
      return;
    }
    this.state = 'over';
    this.launchTimer?.remove();
    const score = Math.floor(this.score);
    const isBest = this.save.recordGame(score, this.turn);
    this.checkMissions();
    audio.play('gameover');
    const shinies = this.runCaptures.filter((c) => c.shiny).length;
    const layer = this.add.container(0, 0).setDepth(60);
    layer.add(this.add.rectangle(0, 0, W, H, 0x000000, 0.65).setOrigin(0).setInteractive());
    layer.add(makePanel(this, 30, 170, W - 60, 290));
    layer.add(text(this, W / 2, 200, 'FIN DE LA\nPARTIDA', 16, COLORS.inkHex).setOrigin(0.5));
    const lines = [
      `PUNTOS  ${score}`,
      isBest ? '¡NUEVO RECORD!' : `RECORD  ${this.save.data.bestScore}`,
      `TURNOS  ${this.turn}`,
      `CAPTURAS ${this.runCaptures.length}${shinies ? `  SHINY ${shinies}` : ''}`
    ];
    layer.add(text(this, W / 2, 290, lines.join('\n'), 8, isBest ? '#b07800' : COLORS.inkHex).setOrigin(0.5));
    layer.add(makeButton(this, W / 2, 370, 180, 34, 'REINTENTAR', () => this.scene.restart()));
    layer.add(makeButton(this, W / 2, 418, 180, 34, 'MENU', () => this.scene.start('title')));
  }
}
