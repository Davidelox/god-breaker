import Phaser from 'phaser';
import {
  W, H, COLS, ROWS, CELL, BOARD_X, BOARD_TOP, BOARD_BOTTOM, BOARD_RIGHT, LAUNCH_Y,
  BALL_R, BALL_SPEED, START_BALLS, LAUNCH_DELAY, CREATURE_CHANCE, BOSS_EVERY, SHINY_RATE,
  CORNER_JITTER, BALL_TEXTURE_R, VERTICAL_LOCK_CHANCE, SPEEDS, WATER_BALL_R, SPAWN_ROW,
  SHINY_BOOST_RATE, SHINY_BOOST_TURNS, SHINY_METER_MAX, SHINY_GAIN, MAX_POWERS,
  HP_PER_TURN, CREATURE_HP_BONUS, CREATURE_HP_PER_RARITY, BALLS_PER_TURN, PICKUP_CHANCE, PICKUP_COOLDOWN, ROW_GROWTH_TURNS, BOSS_HP
} from '../config.js';
import { NORMAL_CREATURES, LEGENDARIES } from '../data/creatures.js';
import { TYPES, effectiveness, hexToNum } from '../data/types.js';
import { SPECIAL_COST, specialById } from '../data/specials.js';
import { BALL_TYPES, BALL_ORDER, captureChance, rollRewardBall, rollPower } from '../data/balls.js';
import { creatureKey } from '../gfx/sprites.js';
import { text, makeButton, makePanel, drawPanel, floatText, makeAudioToggles, COLORS } from '../gfx/ui.js';
import { pick, weightedPick, randInt, shuffle } from '../core/rng.js';
import { logError } from '../core/errors.js';
import { Weather } from '../gfx/weather.js';
import { audio } from '../audio/audio.js';
import { newlyCompleted, MISSIONS } from '../data/missions.js';

const PLAIN_COLORS = [0x5ab0e8, 0x58c878, 0xe8c040, 0xe88a40, 0xe05858, 0xb860d8, 0x8860e8];
const MIN_ANGLE = Phaser.Math.DegToRad(8);
const TRAIL_POINTS = 5;
const WATER_PIERCE = 3; // bloques que atraviesa cada bola con Torrente normal (MAX: todos)
const VERTICAL_ATTACK_BOUNCES = 6; // rebotes verticales seguidos antes del Ataque vertical
const VERTICAL_ATTACK_BONUS = 200; // + 50 por bloque roto
const PLANT_COLOR = 0x8ce070;
// Sin tildes en mayúsculas: la fuente pixel no tiene esos glifos.
const upper = (str) => str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
const ROCK_PCT = 0.5; // Derrumbe: % de la vida actual que quita
const ROCK_BOSS_PCT = 0.3;
const TURBO_SPEED = 5; // velocidad automática cuando ninguna bola puede golpear nada más
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
    // Valores de dificultad (en la escena para poder ajustarlos y simularlos)
    this.hpPerTurn = HP_PER_TURN;
    this.pickupChance = PICKUP_CHANCE;
    this.pickupCooldown = 0; // turnos que faltan para que pueda salir otra bola extra
    this.legendBag = []; // legendarios pendientes de salir, en orden aleatorio
    this.pendingBalls = 0;
    this.energy = 0;
    this.powers = []; // ids de poderes guardados (máx. MAX_POWERS)
    this.selectedSlots = new Set(); // huecos de poder marcados para el próximo lanzamiento
    this.activeSpecials = []; // poderes activos en el lanzamiento en curso
    this.ballInv = { normal: Infinity, super: 0, ultra: 0 };
    this.selectedBall = 'normal';
    this.shotBall = 'normal';
    this.shotKills = 0;
    this.turbo = false;
    this.clearCelebrated = false;
    // Objetos creados bajo demanda: la escena se reutiliza al reintentar, así que se reinician aquí.
    this.bossWarn = null;
    this.powerTag = null;
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
    this.toLaunch = 0;
    this.launchTimer = null;
    this.runCaptures = [];
    this.lastEffTextAt = 0;
    this.paused = false;
    this.anyDead = false;
    this.pendingCaptures = 0;
    this.toastQueue = [];
    this.toastBusy = false;
    this.showcaseQueue = [];
    this.showcaseBusy = false;
    this.showcaseBatch = [];
    this.showcaseTimer = null;
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

    this.spawnRow(); // primer turno: una sola fila

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
    const turbo = this.turbo && this.state === 'shooting';
    this.speedBtn.setLabel(turbo ? `x${TURBO_SPEED}` : `x${this.speedMul}`).setSelected(turbo || this.speedMul > 1);
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
    // El legendario ocupa 2x2 y aparece por encima de todo: en su turno el tablero baja 2 filas
    // (ver endTurn), así que siempre queda hueco libre arriba. La fila superior sigue vacía.
    const row = SPAWN_ROW;
    if (this.isBossTurn(t)) {
      const col = randInt(0, COLS - 2);
      this.addBlock({ col, row, size: 2, kind: 'boss', creature: this.nextLegendary(), hp: BOSS_HP(t) });
      taken.add(col).add(col + 1);
      this.showToast('¡Aparece un legendario!', '#b07800');
      audio.play('bossAppear');
    }
    const free = shuffle([...Array(COLS).keys()].filter((c) => !taken.has(c)));
    const maxBlocks = Math.min(free.length - 1, 3 + Math.floor(t / ROW_GROWTH_TURNS));
    const count = Math.max(1, randInt(2, Math.max(2, maxBlocks)));
    for (let i = 0; i < Math.min(count, free.length - 1); i++) this.addRandomBlock(row, free[i], t);
    // La bola extra +1 ya no sale en todas las filas
    // Bola extra +1: solo una en pantalla, y no vuelve a salir hasta que pasen PICKUP_COOLDOWN tiradas tras recogerla
    if (!this.pickups.length && this.pickupCooldown <= 0 && Math.random() < this.pickupChance) {
      this.addPickup(row, free[free.length - 1]);
    }
  }

  /** Legendario al azar sin repetir hasta que hayan salido los 8. */
  nextLegendary() {
    if (!this.legendBag.length) this.legendBag = shuffle([...LEGENDARIES]);
    return this.legendBag.pop();
  }

  addRandomBlock(row, col, t) {
    if (Math.random() < CREATURE_CHANCE) {
      const rarity = weightedPick([[1, 60], [2, 30], [3, 10]]);
      const creature = pick(NORMAL_CREATURES.filter((c) => c.rarity === rarity));
      const bonus = CREATURE_HP_BONUS + CREATURE_HP_PER_RARITY * (rarity - 1);
      this.addBlock({ row, col, size: 1, kind: 'creature', creature, hp: Math.ceil(this.baseHp(t) * (1 + bonus)) });
    } else {
      this.addBlock({ row, col, size: 1, kind: 'plain', hp: this.baseHp(t) });
    }
  }

  /** Vida base de un bloque en el turno t (con algo de variación). */
  /** Vida de los bloques nuevos del turno t: progresiva y la misma para todos. */
  baseHp(t) {
    return Math.max(1, Math.round(t * this.hpPerTurn));
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
      const spr = this.add.image(0, d.kind === 'boss' ? -14 : -7, creatureKey(d.creature.id, blk.shiny)).setScale(d.kind === 'boss' ? 3 : 2);
      cont.add(spr);
      blk.sprite = spr;
      this.tweens.add({ targets: spr, y: spr.y - 2, duration: 400 + Math.random() * 300, yoyo: true, repeat: -1 });
      if (blk.shiny) this.decorateShiny(blk, cont, size);
      if (!this.save.entry(d.creature.id)) this.addNewMark(blk, cont, size);
    }
    // Vida en grande; en bloques con criatura va abajo para no tapar el sprite
    blk.hpText = text(this, 0, d.creature ? size / 2 - 12 : 0, '', 16).setOrigin(0.5).setStroke('#101828', 4);
    blk.hpMaxW = size - 8;
    if (d.kind === 'boss') {
      // Barra de vida del legendario: fondo, rastro blanco que se queda atrás y relleno de color
      const w = size - 20;
      const y = size / 2 - 28;
      blk.barW = w;
      const bg = this.add.rectangle(-w / 2 - 1, y, w + 2, 8, 0x101828).setOrigin(0, 0.5);
      blk.barLag = this.add.rectangle(-w / 2, y, w, 6, 0xffffff).setOrigin(0, 0.5);
      blk.barFill = this.add.rectangle(-w / 2, y, w, 6, 0x58c878).setOrigin(0, 0.5);
      cont.add([bg, blk.barLag, blk.barFill]);
    }
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
    // Con 3 o más cifras se reduce lo justo para que quepa en el bloque
    blk.hpText.setScale(1);
    if (blk.hpText.width > blk.hpMaxW) blk.hpText.setScale(blk.hpMaxW / blk.hpText.width);
    if (blk.barFill) this.updateBossBar(blk);
  }

  updateBossBar(blk) {
    const ratio = Phaser.Math.Clamp(blk.hp / blk.maxHp, 0, 1);
    const w = Math.max(0, blk.barW * ratio);
    blk.barFill.width = w;
    blk.barFill.setFillStyle(ratio > 0.5 ? 0x58c878 : ratio > 0.25 ? 0xe8c040 : 0xe05858);
    // El rastro blanco alcanza a la vida actual tras un instante
    this.tweens.killTweensOf(blk.barLag);
    this.tweens.add({ targets: blk.barLag, width: w, delay: 220, duration: 260, ease: 'Quad.easeOut' });
  }

  shiftAll(n, animate) {
    if (n <= 0) return;
    const move = (obj, row, size = 1) => {
      const y = BOARD_TOP + row * CELL + (size * CELL) / 2;
      // Si aún estaba subiendo por el hueco de un legendario, esa animación se cancela
      obj.riseTween?.remove();
      obj.riseTween = null;
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

  /** 1 = normal, 2 = MAX (los dos huecos con el mismo poder). */
  powerLevel(id) {
    return this.activeSpecials.filter((s) => s.id === id).length;
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
    this.turbo = false;
    this.clearCelebrated = false;
    this.nextLaunchX = null;
    // Posición y dirección fijas durante todo el turno.
    this.shotX = this.launchX;
    this.shotAngle = this.aimAngle;
    // Enredadera añade bolas extra (x2; en MAX, x3). Solo las añadidas son verdes.
    this.shotBase = this.ballCount;
    this.launchedCount = 0;
    this.toLaunch = this.ballCount * (1 + this.powerLevel('enredadera'));
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
    const extra = this.hasSpecial('enredadera') && this.launchedCount >= this.shotBase;
    this.launchedCount++;
    const water = this.powerLevel('torrente');
    const r = water === 2 ? WATER_BALL_R + 3 : water ? WATER_BALL_R : BALL_R;
    const img = this.add.image(this.shotX, LAUNCH_Y, 'ball').setDepth(8).setScale(r / BALL_TEXTURE_R);
    let trailColor = 0xffffff;
    const others = this.activeSpecials.filter((sp) => sp.id !== 'enredadera');
    if (extra) trailColor = PLANT_COLOR;
    else if (others.length) trailColor = hexToNum(TYPES[others[0].type].light);
    else if (BALL_TYPES[this.shotBall].tint) trailColor = BALL_TYPES[this.shotBall].tint;
    if (trailColor !== 0xffffff) img.setTint(trailColor);
    if (extra) {
      // Bola añadida por Enredadera: destello verde al salir y brillo que late
      this.fxRing(this.shotX, LAUNCH_Y, PLANT_COLOR, 14, 260, 2);
      this.fxBurst(this.shotX, LAUNCH_Y, [PLANT_COLOR, 0x4cb04c, 0xf070a0], 5, 18, 360, -8);
      this.tweens.add({ targets: img, scale: (r / BALL_TEXTURE_R) * 1.35, duration: 180, yoyo: true, repeat: -1 });
    }
    audio.play('launch');
    this.balls.push({
      extra,
      x: this.shotX,
      y: LAUNCH_Y - 1,
      r,
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
    const speed = this.turbo ? Math.max(TURBO_SPEED, this.speedMul) : this.speedMul;
    if (this.launchTimer) this.launchTimer.timeScale = speed;

    const total = dt * speed;
    const steps = Math.max(1, Math.ceil((total * BALL_SPEED) / 3));
    const s = total / steps;
    for (let i = 0; i < steps; i++) {
      for (const b of this.balls) if (!b.done) this.stepBall(b, s);
      if (this.anyDead) {
        this.blocks = this.blocks.filter((b) => !b.dead);
        this.anyDead = false;
      }
    }
    // Pantalla limpia en mitad del lanzamiento: se recogen solas las bolas que quedan.
    if (this.blocks.length === 0 && !this.clearCelebrated) this.celebrateClear();
    this.updateTurbo();
    for (const b of this.balls) {
      if (b.done && b.img) {
        b.img.destroy();
        b.img = null;
      } else if (b.img) {
        b.img.setPosition(b.x, b.y);
        b.trail.push(b.x, b.y);
        if (b.trail.length > TRAIL_POINTS * 2) b.trail.splice(0, 2);
      }
    }
    this.drawTrails();
    this.balls = this.balls.filter((b) => !b.done);
    if (this.toLaunch === 0 && this.balls.length === 0) this.endTurn();
  }

  // Recogida automática: las bolas en vuelo vuelan al lanzador en cascada, con destellos y notas ascendentes.
  /**
   * Turbo: cuando ya se han lanzado todas las bolas y ninguna puede golpear nada más
   * (pantalla limpia, o todas bajando por debajo del último bloque y bola extra),
   * el resto del turno va a x5. No cambia la velocidad elegida por el jugador.
   */
  updateTurbo() {
    if (this.turbo || this.toLaunch > 0) return;
    const live = this.balls.filter((b) => !b.done);
    if (!live.length) return;
    let lowest = -Infinity;
    for (const blk of this.blocks) if (!blk.dead) lowest = Math.max(lowest, this.blockRect(blk).y1);
    for (const p of this.pickups) if (!p.taken) lowest = Math.max(lowest, BOARD_TOP + p.row * CELL + CELL / 2 + 8);
    const nothingLeft = lowest === -Infinity;
    if (nothingLeft || live.every((b) => b.vy > 0 && b.y - b.r > lowest)) {
      this.turbo = true;
      this.refreshHud();
    }
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
    let verticalBounce = false;
    if (b.y < BOARD_TOP + b.r) {
      b.y = BOARD_TOP + b.r;
      b.vy = Math.abs(b.vy);
      verticalBounce = b.vx === 0;
    }
    if (b.y >= LAUNCH_Y) {
      b.done = true;
      // La última bola en volver marca dónde se lanzará el próximo turno
      // (el lanzador actual no se mueve hasta que acaba el turno).
      this.nextLaunchX = Phaser.Math.Clamp(b.x, BOARD_X + 8, BOARD_RIGHT - 8);
      this.nextMarker.setPosition(this.nextLaunchX, LAUNCH_Y).setVisible(true);
      return;
    }

    // Torrente: cada bola atraviesa hasta WATER_PIERCE bloques (MAX: sin límite) y luego rebota normal.
    const water = this.powerLevel('torrente');
    for (const blk of this.blocks) {
      if (blk.dead) continue;
      const r = this.blockRect(blk);
      const cx = Phaser.Math.Clamp(b.x, r.x0, r.x1);
      const cy = Phaser.Math.Clamp(b.y, r.y0, r.y1);
      const dx = b.x - cx;
      const dy = b.y - cy;
      const d2 = dx * dx + dy * dy;
      if (d2 >= b.r * b.r) {
        b.inside.delete(blk);
        continue;
      }
      if (b.inside.has(blk)) continue; // sigue dentro de un bloque que ya atravesó
      if (water && (water === 2 || (b.pierced ?? 0) < WATER_PIERCE)) {
        b.inside.add(blk);
        b.pierced = (b.pierced ?? 0) + 1;
        this.hitBlock(blk, b);
        if (water === 1 && b.pierced === WATER_PIERCE && b.img) {
          // Se agota el torrente de esta bola: pequeña salpicadura y vuelve a rebotar
          b.img.setTint(0xffffff);
          b.trailColor = 0xffffff;
          this.fxRing(b.x, b.y, 0x78c0ff, 12, 240, 2);
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
      this.hitBlock(blk, b);
      if (b.vx === 0) verticalBounce = true;
      break;
    }
    if (verticalBounce) this.noteVerticalBounce(b);
    else if (b.vx !== 0) b.vBounces = 0;

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
    this.pickupCooldown = PICKUP_COOLDOWN + 1; // se descuenta al final de este turno y de los 2 siguientes
    audio.play('pickup');
    floatText(this, p.img.x, p.img.y, '+1', '#7cf07c');
    this.tweens.killTweensOf(p.img);
    this.tweens.add({ targets: p.img, scale: 0, duration: 150, onComplete: () => p.img.destroy() });
    this.pickups = this.pickups.filter((q) => q !== p);
  }

  // ---------- Daño, especiales y captura ----------

  hitBlock(blk, ball = null) {
    // Con dos poderes activos se usa la mejor eficacia de sus tipos.
    const eff = this.activeSpecials.length
      ? Math.max(...this.activeSpecials.map((s) => effectiveness(s.type, blk.creature?.type)))
      : 1;
    // Escarcha: x2 (MAX x3). Torrente MAX: x2.
    const ice = this.powerLevel('escarcha');
    const mult = (ice === 2 ? 3 : ice ? 2 : 1) * (this.powerLevel('torrente') === 2 ? 2 : 1);
    const dmg = mult * eff;
    const { x, y } = blk.cont;
    this.powerHitFx(blk, x, y, ball);
    this.damage(blk, dmg, eff);
    const fire = this.powerLevel('estallido');
    if (fire) {
      // MAX: daño completo y alcance de 2 casillas
      for (const n of this.neighbors(blk, fire)) this.damage(n, (fire === 2 ? 1 : 0.5) * effectiveness('fuego', n.creature?.type));
    }
    const elec = this.powerLevel('arco');
    if (elec) {
      // MAX: salta a 4 bloques y llega más lejos
      const near = this.blocks
        .filter((o) => !o.dead && o !== blk)
        .map((o) => ({ o, d: Phaser.Math.Distance.Between(x, y, o.cont.x, o.cont.y) }))
        .filter((e) => e.d < CELL * (elec === 2 ? 4 : 2.6))
        .sort((a, b2) => a.d - b2.d)
        .slice(0, elec === 2 ? 4 : 2);
      for (const { o } of near) {
        this.bolts.push({ x1: x, y1: y, x2: o.cont.x, y2: o.cont.y, ttl: 0.16, max: 0.16 });
        this.fxBurst(o.cont.x, o.cont.y, [0xfff07a, 0xffffff], 4, 18, 200);
        this.damage(o, effectiveness('electrico', o.creature?.type));
      }
    }
  }

  neighbors(blk, range = 1) {
    return this.blocks.filter(
      (o) => !o.dead && o !== blk &&
        o.col <= blk.col + blk.size - 1 + range && o.col + o.size - 1 >= blk.col - range &&
        o.row <= blk.row + blk.size - 1 + range && o.row + o.size - 1 >= blk.row - range
    );
  }

  // ---------- Ataque vertical ----------

  noteVerticalBounce(b) {
    b.vBounces = (b.vBounces ?? 0) + 1;
    if (b.vBounces >= VERTICAL_ATTACK_BOUNCES && !b.verticalDone) this.verticalAttack(b);
  }

  /** Bola atrapada en vertical: rompe la columna entera, con bonus. */
  verticalAttack(b) {
    const col = Phaser.Math.Clamp(Math.floor((b.x - BOARD_X) / CELL), 0, COLS - 1);
    const targets = this.blocks.filter((o) => !o.dead && o.col <= col && o.col + o.size - 1 >= col);
    if (!targets.length) return;
    b.verticalDone = true;
    const before = this.score;
    targets.forEach((o) => this.damage(o, o.hp + 0.01));
    this.addScore(VERTICAL_ATTACK_BONUS + 50 * targets.length);
    const gained = Math.floor(this.score - before);
    const cx = BOARD_X + col * CELL + CELL / 2;
    const beam = this.add.rectangle(cx, BOARD_TOP, CELL - 4, LAUNCH_Y - BOARD_TOP, 0xffffff, 0.9).setOrigin(0.5, 0).setDepth(23);
    this.tweens.add({ targets: beam, scaleX: 2.2, alpha: 0, duration: 520, ease: 'Quad.easeOut', onComplete: () => beam.destroy() });
    const core = this.add.rectangle(cx, BOARD_TOP, 8, LAUNCH_Y - BOARD_TOP, COLORS.gold, 1).setOrigin(0.5, 0).setDepth(24);
    this.tweens.add({ targets: core, scaleX: 0, duration: 420, onComplete: () => core.destroy() });
    this.cameras.main.shake(260, 0.01);
    this.cameras.main.flash(160, 255, 250, 220);
    floatText(this, cx, BOARD_TOP + CELL * 3, `+${gained}`, COLORS.goldHex, 16);
    this.showToast(`¡ATAQUE VERTICAL! +${gained}`, '#b07800');
    audio.play('vertical');
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
    this.tweens.add({ targets: flash, scale: 1.5, alpha: 0, duration: boss ? 420 : 240, ease: 'Quad.easeOut', onComplete: () => flash.destroy() });
    // Onda expansiva: anillo del color del bloque + anillo blanco más rápido + relleno tenue
    const ring = this.add.circle(x, y, size * 0.35).setStrokeStyle(boss ? 5 : 3, blk.color).setDepth(19);
    this.tweens.add({ targets: ring, scale: boss ? 5.5 : 3.6, alpha: 0, duration: boss ? 750 : 450, ease: 'Cubic.easeOut', onComplete: () => ring.destroy() });
    const ring2 = this.add.circle(x, y, size * 0.3).setStrokeStyle(2, 0xffffff).setDepth(19);
    this.tweens.add({ targets: ring2, scale: boss ? 4.2 : 2.7, alpha: 0, duration: boss ? 520 : 320, ease: 'Quad.easeOut', onComplete: () => ring2.destroy() });
    const wave = this.add.circle(x, y, size * 0.4, blk.color, 0.22).setDepth(18);
    this.tweens.add({ targets: wave, scale: boss ? 4.5 : 3, alpha: 0, duration: boss ? 600 : 380, ease: 'Quad.easeOut', onComplete: () => wave.destroy() });
    // Los bloques cercanos acusan la onda
    for (const n of this.neighbors(blk, boss ? 2 : 1)) this.punch(n);
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
      this.time.delayedCall(120, () => this.riseUnder(blk));
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
    const max = specials.length === 2 && specials[0].id === specials[1].id;
    const combo = specials.length === 2 && !max;
    const main = TYPES[specials[0].type];
    const tint = this.add
      .rectangle(BOARD_X, BOARD_TOP, COLS * CELL, LAUNCH_Y + 6 - BOARD_TOP, hexToNum(main.base), max ? 0.4 : 0.28)
      .setOrigin(0)
      .setDepth(17);
    this.tweens.add({ targets: tint, alpha: 0, duration: 650, onComplete: () => tint.destroy() });
    const y = BOARD_TOP + CELL * 4.5;
    const objs = [];
    const hold = combo || max ? 900 : 520;
    if (combo) {
      // Combinación: banda partida con el color de cada tipo
      const [a, b] = specials.map((sp) => TYPES[sp.type]);
      objs.push(this.add.rectangle(W / 4, y, W / 2, 64, hexToNum(a.dark), 0.9));
      objs.push(this.add.rectangle((3 * W) / 4, y, W / 2, 64, hexToNum(b.dark), 0.9));
      objs.push(text(this, W / 2, y - 18, '¡COMBO!', 16, COLORS.goldHex).setOrigin(0.5).setStroke('#101828', 4));
      objs.push(text(this, W / 4, y + 6, a.short, 16, '#ffffff').setOrigin(0.5).setStroke('#101828', 4));
      objs.push(text(this, W / 2, y + 6, '+', 16, COLORS.goldHex).setOrigin(0.5).setStroke('#101828', 4));
      objs.push(text(this, (3 * W) / 4, y + 6, b.short, 16, '#ffffff').setOrigin(0.5).setStroke('#101828', 4));
      objs.push(text(this, W / 2, y + 24, specials.map((sp) => upper(sp.name)).join(' + '), 8, '#ffffff').setOrigin(0.5).setStroke('#101828', 3));
    } else {
      objs.push(this.add.rectangle(W / 2, y, W, max ? 64 : 40, hexToNum(main.dark), 0.9).setStrokeStyle(max ? 3 : 0, COLORS.gold));
      objs.push(text(this, W / 2, y - (max ? 10 : 0), upper(specials[0].name), 16, '#ffffff').setOrigin(0.5).setStroke('#101828', 4));
      if (max) objs.push(text(this, W / 2, y + 16, '¡PODER MAX!', 8, COLORS.goldHex).setOrigin(0.5).setStroke('#101828', 3));
    }
    const layer = this.add.container(0, 0, objs).setDepth(46).setAlpha(0);
    layer.setScale(1, 0.2);
    layer.y = y * 0.8;
    this.tweens.add({
      targets: layer, alpha: 1, scaleY: 1, y: 0, duration: 160, ease: 'Back.easeOut',
      onComplete: () => this.tweens.add({ targets: layer, alpha: 0, delay: hold, duration: 220, onComplete: () => layer.destroy() })
    });
    this.cameras.main.shake(max ? 220 : 120, max ? 0.006 : 0.003);
    audio.play('powerCast');
    if (max) audio.play('shiny');
    for (const sp of specials) {
      const t = TYPES[sp.type];
      this.fxBurst(this.launchX, LAUNCH_Y, [hexToNum(t.base), hexToNum(t.light), 0xffffff], 14, 34, 500, -10);
    }
    // Indicador durante el lanzamiento
    const tag = max ? `${main.short} MAX` : specials.map((sp) => TYPES[sp.type].short).join('+');
    this.powerTag?.destroy();
    this.powerTag = text(this, BOARD_X + 4, LAUNCH_Y - 2, tag, 8, max || combo ? COLORS.goldHex : '#ffffff').setOrigin(0, 0.5).setDepth(6).setStroke('#101828', 3);
  }

  /** Efecto de cada golpe según los poderes activos (limitado por bloque para no saturar). */
  powerHitFx(blk, x, y, ball = null) {
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
    if (ball?.extra) {
      this.fxBurst(x, y, [PLANT_COLOR, 0x4cb04c, 0xf070a0], 5, 20, 420, 18);
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
    // Los 2 bloques con más vida reciben un golpe directo del 50 % de su vida actual (30 % si es legendario).
    const targets = this.blocks
      .filter((b) => !b.dead)
      .sort((a, b) => b.hp - a.hp)
      .slice(0, this.powerLevel('derrumbe') === 2 ? 4 : 2); // MAX: 4 bloques
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
          if (!blk.dead) this.damage(blk, blk.hp * (blk.kind === 'boss' ? ROCK_BOSS_PCT : ROCK_PCT));
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

  /** Pantalla limpia: destello, ondas doradas, lluvia de estrellas, cartel grande y fanfarria. */
  celebrateClear() {
    this.clearCelebrated = true;
    const cx = W / 2;
    const cy = BOARD_TOP + (LAUNCH_Y - BOARD_TOP) / 2;
    const cam = this.cameras.main;
    cam.flash(260, 255, 250, 220);
    cam.shake(380, 0.008);
    this.tweens.add({ targets: cam, zoom: 1.06, duration: 140, yoyo: true, ease: 'Quad.easeOut' });
    // Ondas doradas y blancas desde el centro
    [0, 140, 280].forEach((delay, i) => {
      const ring = this.add.circle(cx, cy, 20).setStrokeStyle(i === 1 ? 3 : 5, i === 1 ? 0xffffff : COLORS.gold).setDepth(48).setAlpha(0);
      this.tweens.add({ targets: ring, alpha: { from: 1, to: 0 }, scale: 12, duration: 900, delay, ease: 'Cubic.easeOut', onComplete: () => ring.destroy() });
    });
    // Rayos de luz girando detrás del cartel
    const rays = this.add.graphics().setDepth(47).setPosition(cx, cy);
    rays.fillStyle(COLORS.gold, 0.18);
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      rays.fillTriangle(0, 0, Math.cos(a - 0.12) * 260, Math.sin(a - 0.12) * 260, Math.cos(a + 0.12) * 260, Math.sin(a + 0.12) * 260);
    }
    rays.setScale(0);
    this.tweens.add({ targets: rays, scale: 1, angle: 60, duration: 1400, ease: 'Cubic.easeOut' });
    this.tweens.add({ targets: rays, alpha: 0, delay: 900, duration: 600, onComplete: () => rays.destroy() });
    // Lluvia de estrellas y confeti
    const colors = [COLORS.gold, 0xffffff, 0x4ce0e8, 0xff7cd0, 0x8ce070];
    for (let i = 0; i < 46; i++) {
      const a = Math.random() * Math.PI * 2;
      const d = 80 + Math.random() * 170;
      const star = i % 3 === 0
        ? this.add.image(cx, cy, 'spark').setScale(1.5 + Math.random() * 1.5)
        : this.add.rectangle(cx, cy, 4, 4, colors[i % colors.length]);
      star.setDepth(49);
      this.tweens.add({
        targets: star,
        x: { value: cx + Math.cos(a) * d, ease: 'Cubic.easeOut' },
        y: { value: cy + Math.sin(a) * d + 60, ease: 'Quad.easeIn' },
        angle: (Math.random() - 0.5) * 720,
        alpha: { from: 1, to: 0 },
        duration: 900 + Math.random() * 700,
        onComplete: () => star.destroy()
      });
    }
    // Cartel
    const title = text(this, cx, cy - 14, '¡PANTALLA\nLIMPIA!', 24, COLORS.goldHex).setOrigin(0.5).setDepth(50).setStroke('#101828', 6).setScale(0);
    const bonus = text(this, cx, cy + 40, '+500  BOLA ESPECIAL', 8, '#ffffff').setOrigin(0.5).setDepth(50).setStroke('#101828', 4).setAlpha(0);
    this.tweens.add({ targets: title, scale: 1, duration: 420, ease: 'Back.easeOut' });
    this.tweens.add({ targets: title, angle: { from: -4, to: 4 }, duration: 260, yoyo: true, repeat: 2, delay: 420 });
    this.tweens.add({ targets: bonus, alpha: 1, y: cy + 34, delay: 300, duration: 250 });
    this.tweens.add({ targets: [title, bonus], alpha: 0, scale: 1.3, delay: 1600, duration: 350, onComplete: () => { title.destroy(); bonus.destroy(); } });
    audio.play('clear');
    this.time.delayedCall(250, () => audio.play('shiny'));
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

  /** Exclamación pequeña en criaturas que aún no están en la colección. */
  addNewMark(blk, cont, size) {
    const x = -size / 2 + 8;
    const y = -size / 2 + 8;
    const dot = this.add.circle(x, y, 6, 0xe05858).setStrokeStyle(1, 0x101828);
    // «!» dibujado en píxeles para que se lea bien a este tamaño
    const mark = this.add.graphics();
    mark.fillStyle(0xffffff);
    mark.fillRect(x - 1, y - 4, 2, 5);
    mark.fillRect(x - 1, y + 2, 2, 2);
    const badge = this.add.container(0, 0, [dot, mark]);
    cont.add(badge);
    blk.newMark = badge;
    this.tweens.add({ targets: badge, y: -2, duration: 380, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
  }

  captureSuccess(c, shiny, orb, x, y) {
    const res = this.save.recordCapture(c.id, shiny);
    // Ya capturada: quitar la exclamación al resto de bloques de esa criatura
    for (const o of this.blocks) {
      if (o.creature?.id === c.id && o.newMark) {
        o.newMark.destroy();
        o.newMark = null;
      }
    }
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
    // Solo se muestra en grande la primera vez que se captura esa criatura
    if (res.isNew) this.queueShowcase({ c, shiny });
  }

  // ---------- Escaparate de captura ----------

  /**
   * Las capturas nuevas se agrupan: las que llegan casi a la vez (mismo lanzamiento)
   * se muestran juntas en una misma tarjeta, hasta 6 por tarjeta.
   */
  queueShowcase(item) {
    this.showcaseBatch.push(item);
    this.showcaseTimer?.remove();
    this.showcaseTimer = this.time.delayedCall(450, () => {
      const batch = this.showcaseBatch.splice(0);
      for (let i = 0; i < batch.length; i += 6) this.showcaseQueue.push(batch.slice(i, i + 6));
      if (!this.showcaseBusy) this.nextShowcase();
    });
  }

  nextShowcase() {
    const group = this.showcaseQueue.shift();
    if (!group) {
      this.showcaseBusy = false;
      return;
    }
    this.showcaseBusy = true;
    const n = group.length;
    const single = n === 1;
    const cols = single ? 1 : Math.min(3, n);
    const rows = Math.ceil(n / cols);
    const cellW = single ? 140 : 88;
    const cellH = single ? 104 : 84;
    const cardW = cols * cellW + 16;
    const cardH = rows * cellH + 40;
    const anyShiny = group.some((g) => g.shiny);
    const cx = W / 2;
    const cy = BOARD_TOP + CELL * 3.6;
    const hold = 1100 + (n - 1) * 250;
    const parts = [];

    const rays = this.add.graphics();
    rays.fillStyle(anyShiny ? COLORS.gold : 0xffffff, 0.16);
    const rr = Math.max(cardW, cardH);
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      rays.fillTriangle(0, 0, Math.cos(a - 0.13) * rr, Math.sin(a - 0.13) * rr, Math.cos(a + 0.13) * rr, Math.sin(a + 0.13) * rr);
    }
    parts.push(rays);
    const card = this.add.graphics();
    drawPanel(card, -cardW / 2, -cardH / 2, cardW, cardH, { fill: anyShiny ? 0xfff4c8 : COLORS.paper, border: anyShiny ? 0xb07800 : COLORS.ink });
    parts.push(card);
    const titleStr = single ? (group[0].shiny ? '¡NUEVA SHINY!' : '¡NUEVA CAPTURA!') : `¡${n} NUEVAS CAPTURAS!`;
    parts.push(text(this, 0, -cardH / 2 + 14, titleStr, 8, anyShiny ? '#b07800' : '#2a8a40').setOrigin(0.5));

    const floaters = [];
    group.forEach(({ c, shiny }, i) => {
      const t = TYPES[c.type];
      const col = i % cols;
      const row = Math.floor(i / cols);
      // Centra la última fila si no está completa
      const inRow = Math.min(cols, n - row * cols);
      const x = (col - (inRow - 1) / 2) * cellW;
      const y = -cardH / 2 + 28 + row * cellH + cellH / 2 - 8;
      const glow = this.add.circle(x, y - 10, single ? 36 : 24, hexToNum(t.light), 0.6);
      const spr = this.add.image(x, y - 12, creatureKey(c.id, shiny)).setScale(single ? (c.legendary ? 3.5 : 4.5) : c.legendary ? 2.2 : 3);
      const name = text(this, x, y + (single ? 30 : 22), c.name, 8, COLORS.inkHex).setOrigin(0.5);
      parts.push(glow, spr, name);
      if (single) {
        parts.push(this.add.rectangle(x, y + 46, 64, 14, hexToNum(t.base)));
        parts.push(text(this, x, y + 46, upper(t.name), 8, '#ffffff').setOrigin(0.5));
      }
      if (shiny) {
        const sp = this.add.image(x + (single ? 30 : 20), y - (single ? 40 : 30), 'spark').setScale(1.6);
        parts.push(sp);
        floaters.push({ target: sp, alpha: 0.2, duration: 220, yoyo: true, repeat: -1 });
      }
      floaters.push({ target: spr, y: spr.y - 5, duration: 320 + i * 40, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      floaters.push({ target: glow, scale: 1.2, alpha: 0.25, duration: 420, yoyo: true, repeat: -1 });
    });

    const layer = this.add.container(cx, cy, parts).setDepth(44).setScale(0);
    for (const { target, ...cfg } of floaters) this.tweens.add({ targets: target, ...cfg });
    this.tweens.add({ targets: rays, angle: 90, duration: hold + 600 });
    audio.play(anyShiny ? 'shiny' : 'reward');
    this.tweens.add({
      targets: layer, scale: 1, duration: 280, ease: 'Back.easeOut',
      onComplete: () => this.tweens.add({
        targets: layer, scale: 0.4, alpha: 0, y: cy - 40, delay: hold, duration: 220, ease: 'Quad.easeIn',
        onComplete: () => {
          layer.destroy();
          this.nextShowcase();
        }
      })
    });
  }

  // ---------- Hueco del legendario ----------

  /**
   * Al caer un legendario, todos los bloques (y bolas extra) desde su fila hacia abajo, en cualquier
   * columna, suben hasta quedar justo debajo de otro bloque (o de la fila de aparición).
   */
  riseUnder(boss) {
    const items = [
      ...this.blocks.filter((b) => !b.dead).map((b) => ({ kind: 'block', o: b, col: b.col, size: b.size })),
      ...this.pickups.map((p) => ({ kind: 'pickup', o: p, col: p.col, size: 1 }))
    ];
    const occupied = (row, col, size, self) =>
      items.some((it) => it !== self && it.o.row <= row && it.o.row + it.size - 1 >= row && it.col <= col + size - 1 && it.col + it.size - 1 >= col);
    const movers = items
      .filter((it) => it.o.row >= boss.row)
      .sort((a, b) => a.o.row - b.o.row);
    let moved = false;
    for (const it of movers) {
      let row = it.o.row;
      // Sube mientras la fila de encima esté libre en todas sus columnas
      while (row - 1 >= SPAWN_ROW && !occupied(row - 1, it.col, it.size, it)) row--;
      if (row === it.o.row) continue;
      it.o.row = row;
      moved = true;
      const target = it.kind === 'block' ? it.o.cont : it.o.img;
      const y = BOARD_TOP + row * CELL + (it.size * CELL) / 2;
      target.riseTween = this.tweens.add({ targets: target, y, duration: 260, ease: 'Back.easeOut' });
    }
    if (moved) audio.play('rumble');
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
    this.powerTag?.destroy();
    this.powerTag = null;
    this.trailG.clear();
    // Munición: +1 automática cada ronda, más las bolas extra recogidas
    this.ballCount += this.pendingBalls + BALLS_PER_TURN;
    floatText(this, this.launchX, LAUNCH_Y - 26, `+${this.pendingBalls + BALLS_PER_TURN}`, '#7cf07c');
    this.pendingBalls = 0;
    this.activeSpecials = [];
    this.turn++;

    // Lanzamiento muy efectivo: llena el medidor shiny.
    if (this.shotKills > 3) this.addShiny((this.shotKills - 3) * SHINY_GAIN.perKillOver3);
    // Pantalla limpia: bola especial, medidor shiny y bonus.
    if (this.blocks.length === 0) {
      if (!this.clearCelebrated) this.celebrateClear();
      this.addScore(500);
      this.awardBall();
      this.addShiny(SHINY_GAIN.clear);
      this.save.bumpStat('clears');
    }

    if (this.pickupCooldown > 0) this.pickupCooldown--;
    // Baja una fila; si llega un legendario, dos (aparece encima de los bloques actuales).
    this.shiftAll(this.isBossTurn(this.turn) ? 2 : 1, true);
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
