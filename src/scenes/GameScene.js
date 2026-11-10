import Phaser from 'phaser';
import {
  W, H, FULL_H, SAFE_TOP, COLS, ROWS, CELL, BOARD_X, BOARD_TOP, BOARD_BOTTOM, BOARD_RIGHT, WALL_L, WALL_R, LAUNCH_Y, BOARD_FLOOR_Y, HUD_EXTRA, BOTTOM_EXTRA,
  BALL_R, BALL_SPEED, START_BALLS, LAUNCH_DELAY, CREATURE_CHANCE, CREATURE_FROM_TURN, CAUGHT_WEIGHT, BOSS_EVERY, GOD_W, GOD_H, SHINY_RATE,
  BALL_TEXTURE_R, VERTICAL_LOCK_CHANCE, SPEEDS, WATER_BALL_R, SPAWN_ROW, BOUNCE_SLOW, BOUNCE_RECOVER, CORNER_JITTER,
  SHINY_BOOST_RATE, SHINY_BOOST_TURNS, SHINY_METER_MAX, SHINY_GAIN, MAX_POWERS,
  HP_PER_TURN, CREATURE_HP_BONUS, CREATURE_HP_PER_RARITY, BALLS_PER_TURN, PICKUP_CHANCE, PICKUP_COOLDOWN, rowBlocksFor, MAGIC_GAIN, RARITY_WEIGHTS, SHINY_MAGIC_FACTOR, BOSS_HP
} from '../config.js';
import { NORMAL_CREATURES, LEGENDARIES, creatureById } from '../data/creatures.js';
import { TYPES, hexToNum } from '../data/types.js';
import { SPECIAL_COST, specialById, ELEMENTS } from '../data/specials.js';
import { BALL_TYPES, BALL_ORDER, captureChance, rollRewardBall, rollPower } from '../data/balls.js';
import { checkTips } from './tutorial.js';
import { t as tr } from '../i18n.js';
import { loadRun, saveRun, clearRun } from '../core/run.js';
import { creatureKey, addCreatureImage, texScale, blockBgKey, blockBgOrigin, HP_FONT } from '../gfx/sprites.js';
import { text, bodyText, makeButton, makePanel, drawPanel, floatText, makeAudioToggles, fitCamera, fullRect, COLORS } from '../gfx/ui.js';
import { weightedPick, randInt, shuffle } from '../core/rng.js';
import { logError } from '../core/errors.js';
import { Weather } from '../gfx/weather.js';
import { audio } from '../audio/audio.js';
import { haptics } from '../core/haptics.js';
import { newlyCompleted, MISSIONS } from '../data/missions.js';

const PLAIN_COLORS = [0x5ab0e8, 0x58c878, 0xe8c040, 0xe88a40, 0xe05858, 0xb860d8, 0x8860e8];
const MIN_ANGLE = Phaser.Math.DegToRad(8);
const TRAIL_POINTS = 16; // posiciones recientes guardadas de cada orbe (para colocar su estela)
// Estela: línea fina y luminosa (mezcla aditiva) que sigue el recorrido del orbe, también por los
// rebotes, y se estrecha y apaga hacia atrás. TRAIL_LEN: largo en px; TRAIL_SEGS: tramos.
const TRAIL_LEN = 40;
const TRAIL_SEGS = 6;
const GHOSTS = []; // (antes, copias del orbe detrás de él; ya no se usan)
const IMPACT_TTL = 0.14; // s que dura la marca del punto de impacto en un rebote
const CORNER_R = 1; // redondeo de las esquinas en la física (px): casi en ángulo recto, el golpe es en la esquina real
// Separación entre orbes: a velocidad x1 sale uno cada LAUNCH_DELAY ms; a más velocidad la
// separación en pantalla crece un SPACING_GROWTH por cada punto de velocidad (x4: +60 %),
// para que la ráfaga no se vea tan cargada.
const SPACING_GROWTH = 0.2;
const WATER_PIERCE = 2; // bloques que atraviesa cada orbe con Tidal Wave
const WATER_PIERCE_MAX = 3; // con Tidal Wave MAX
const VERTICAL_ATTACK_BOUNCES = 6; // rebotes verticales seguidos antes del Ataque vertical
const VERTICAL_ATTACK_BONUS = 200; // + 50 por bloque roto
const PLANT_COLOR = 0x8ce070;
const SHADOW_COLOR = 0xb494f0;
// Sin tildes en mayúsculas: la fuente pixel no tiene esos glifos.
const upper = (str) => str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
const ROCK_GOD = 0.5; // Stone Rain: parte de la vida total que quita a un dios (los demás bloques se destruyen)
const ROCK_GOD_MAX = 0.8;
const TURBO_SPEED = 6; // velocidad automática cuando ningún orbe puede golpear nada más
const pct = (r) => `${Math.round(r * 1000) / 10}%`;
const DANGER_Y = BOARD_TOP + (ROWS - 1) * CELL;
const BOTTOM_BAR_Y = BOARD_FLOOR_Y + 50; // botones de poderes y bolas, justo bajo los medidores

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('game');
  }

  init(data) {
    this.save = this.registry.get('save');
    // CONTINUE: partida guardada automáticamente; si no, partida nueva (se borra la anterior)
    this.resumeRun = data?.resume ? loadRun(undefined, (id) => !!creatureById(id)) : null;
    if (!this.resumeRun) clearRun();
    this.restoring = false;
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
    // Estadísticas de la partida (para el cartel de fin de partida)
    this.runStats = { blocks: 0, beasts: 0, gods: 0, spells: 0, bestShot: 0 };
    this.turbo = false;
    this.holdFast = false; // pantalla pulsada durante el lanzamiento: velocidad x2
    this.clearCelebrated = false;
    this.hitStop = 0;
    // Objetos creados bajo demanda: la escena se reutiliza al reintentar, así que se reinician aquí.
    this.bossWarn = null;
    this.powerTag = null;
    this.maxAura = null;
    this.shinyMeter = 0;
    this.shinyBoostTurns = 0;
    this.goldMode = false; // modo gold activo (fondo dorado y destellos, ver updateGoldMode)
    this.goldSparkles = null;
    this.weatherColor = null;
    this.blocks = [];
    this.pickups = [];
    this.balls = [];
    this.bolts = [];
    this.hitBlocks = new Set(); // bloques con texto pendiente (ver flushHits)
    this.impacts = []; // marcas de los puntos de impacto de los rebotes
    this.bossNow = false; // en el turno actual baja un dios
    this.bossPending = false; // dios pospuesto porque su llegada te haría perder
    this.extraLife = false; // Shadow Bounce MAX: salva una vez de perder (ver useExtraLife)
    this.hudDirty = false;
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
    this.paused = false;
    this.anyDead = false;
    this.pendingCaptures = 0;
    this.toastQueue = [];
    this.toastBusy = false;
    this.showcaseQueue = [];
    this.tipQueue = []; // tutorial de la primera partida (ver tutorial.js)
    this.tipOpen = false;
    this.tipFlags = { escaped: false };
    this.showcaseBusy = false;
    this.showcaseBatch = [];
    this.showcaseTimer = null;
  }

  create() {
    fitCamera(this);
    this.drawBoard();
    this.aimG = this.add.graphics().setDepth(5);
    this.trailG = this.add.graphics().setDepth(7).setBlendMode(Phaser.BlendModes.ADD);
    audio.setMood(0);
    audio.setTrack('battle');
    this.fxG = this.add.graphics().setDepth(25);
    this.launcher = this.add.image(this.launchX, LAUNCH_Y, 'ball_normal').setDepth(6).setScale((BALL_R / BALL_TEXTURE_R) * texScale('ball_normal'));
    this.nextMarker = this.add.image(0, LAUNCH_Y, 'ball_normal').setDepth(6).setAlpha(0.4).setVisible(false).setScale((BALL_R / BALL_TEXTURE_R) * texScale('ball_normal'));
    this.launchText = text(this, this.launchX, LAUNCH_Y - 14, '', 8).setOrigin(0.5).setDepth(6).setStroke('#101828', 3);
    this.createHud();
    this.createSpecialBar();

    if (this.resumeRun) this.restoreRun(this.resumeRun);
    else this.spawnRow(); // primer turno: una sola fila

    this.setupInput();
    this.updateBossWarning();
    this.refreshHud();
    this.refreshSpecials();
    this.autoSave();
    this.time.delayedCall(450, () => checkTips(this));
  }

  // ---------- Dibujo e interfaz ----------

  drawBoard() {
    // Capas: fondo (color del clima) < partículas del clima < cuadrícula y marco
    this.bgG = this.add.graphics().setDepth(-3);
    // El clima da el color del fondo; en modo gold se mezcla con dorado (ver boardTint)
    this.weather = new Weather(this, -2, (color) => {
      this.weatherColor = color;
      this.drawBoardFill(this.boardTint(color));
    });
    // Cuadrícula opcional (ajuste CUADRICULA en la pausa; oculta por defecto)
    this.gridG = this.add.graphics().setDepth(-1);
    this.gridG.lineStyle(1, 0xffffff, 0.06);
    for (let c = 1; c < COLS; c++) this.gridG.lineBetween(BOARD_X + c * CELL, BOARD_TOP, BOARD_X + c * CELL, BOARD_BOTTOM);
    for (let r = 1; r < ROWS; r++) this.gridG.lineBetween(WALL_L, BOARD_TOP + r * CELL, WALL_R, BOARD_TOP + r * CELL);
    this.gridG.setVisible(this.save.data.settings.grid);
    const g = this.add.graphics().setDepth(-1);
    g.fillStyle(0xe05858, 0.5);
    for (let x = WALL_L; x < WALL_R; x += 8) g.fillRect(x, DANGER_Y, 4, 2);
    // El tablero ocupa todo el ancho: los laterales son los bordes de la pantalla (solo líneas arriba y abajo)
    g.fillStyle(0x3a4668);
    g.fillRect(WALL_L, BOARD_TOP - 2, WALL_R - WALL_L, 2);
    g.fillRect(WALL_L, BOARD_FLOOR_Y, WALL_R - WALL_L, 2);
  }

  /** Color del fondo del tablero: el del clima, mezclado con un dorado suave en modo gold. */
  boardTint(color) {
    if (!this.goldMode) return color;
    const a = Phaser.Display.Color.IntegerToColor(color);
    const c = Phaser.Display.Color.Interpolate.ColorWithColor(a, Phaser.Display.Color.IntegerToColor(0x6a3e0c), 100, 38);
    return Phaser.Display.Color.GetColor(c.r, c.g, c.b);
  }

  /** Entra o sale del modo gold (probabilidad gold aumentada): fondo dorado y destellos suaves. */
  updateGoldMode() {
    const on = this.shinyBoostTurns > 0 && this.state !== 'over';
    if (on === !!this.goldMode) return;
    this.goldMode = on;
    if (this.weatherColor != null) this.drawBoardFill(this.boardTint(this.weatherColor));
    this.goldSparkles?.remove();
    this.goldSparkles = null;
    if (!on) return;
    this.goldSparkles = this.time.addEvent({
      delay: 150, loop: true,
      callback: () => {
        const x = WALL_L + Math.random() * (WALL_R - WALL_L);
        const y = BOARD_TOP + Math.random() * (BOARD_FLOOR_Y - BOARD_TOP);
        const sp = this.add.image(x, y, 'spark').setDepth(-1).setTint(0xffe27a).setAlpha(0).setScale(0.6 + Math.random() * 0.8);
        this.tweens.add({ targets: sp, alpha: 0.6, angle: 45, duration: 520, yoyo: true, ease: 'Sine.easeInOut', onComplete: () => sp.destroy() });
      }
    });
  }

  drawBoardFill(color) {
    const from = this.boardColor ?? color;
    this.boardColor = color;
    const paint = (c) => {
      this.bgG.clear();
      this.bgG.fillStyle(COLORS.night);
      this.bgG.fillRect(0, -SAFE_TOP, W, FULL_H);
      this.bgG.fillStyle(c);
      this.bgG.fillRect(WALL_L, BOARD_TOP, WALL_R - WALL_L, BOARD_FLOOR_Y - BOARD_TOP);
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
    this.showToast(tr('The weather changes: {0}', tr(w.name)), '#3a5a8a');
  }

  // Menú superior. En pantallas alargadas (iPhone) crece con HUD_EXTRA: panel más alto,
  // marcador más grande y botones más grandes. El tablero no cambia de tamaño.
  createHud() {
    const k = HUD_EXTRA;
    const big = k >= 36;
    const hudH = 54 + k;
    makePanel(this, 4, 4, W - 8, hudH);
    const rowY = (f) => 4 + hudH * f;
    this.scoreText = text(this, 14, rowY(0.25), '', big ? 16 : 8, COLORS.inkHex).setOrigin(0, 0.5);
    this.bestText = text(this, 14, rowY(big ? 0.55 : 0.52), '', 8, '#56607c').setOrigin(0, 0.5);
    this.turnText = text(this, 14, rowY(0.78), '', 8, '#56607c').setOrigin(0, 0.5);
    this.captText = text(this, 112, rowY(0.78), '', 8, '#56607c').setOrigin(0, 0.5);
    this.lifeText = text(this, 112, rowY(big ? 0.55 : 0.52), '', 8, '#6a4ca8').setOrigin(0, 0.5);
    // Botones: velocidad y pausa, alineados a la derecha. La pausa es más grande y dorada.
    const bh = Math.min(40, 24 + k * 0.35);
    const by = big ? rowY(0.27) : 22;
    // La velocidad tiene el mismo alto y fuente que la pausa (algo más ancha: «x12»), con su color
    const ph = Math.min(hudH - 8, bh + 10), pw = Math.max(40, ph + 4), sw = Math.max(64, pw + 16);
    const px = W - 8 - pw / 2, sx = px - pw / 2 - 6 - sw / 2;
    this.menuBtn = makeButton(this, px, 4 + hudH / 2, pw, ph, 'II', () => this.openPause(), { size: 16, fill: COLORS.gold });
    // Velocidad x1/x2/x3: se mantiene entre turnos y entre partidas.
    this.speedBtn = makeButton(this, sx, 4 + hudH / 2, sw, ph, `x${this.speedMul}`, () => {
      this.speedMul = SPEEDS[(SPEEDS.indexOf(this.speedMul) + 1) % SPEEDS.length];
      this.save.data.settings.speed = this.speedMul;
      this.save.write();
      this.refreshHud();
    }, { size: 16 });
    // Cartel de modo gold a la izquierda de la velocidad: turnos gold que quedan
    const bw2 = 52, bh2 = Math.min(ph, 22 + k * 0.3);
    const gx = sx - sw / 2 - 6 - bw2 / 2, gy = 4 + hudH * (big ? 0.5 : 0.36);
    const gbg = this.add.graphics();
    gbg.fillStyle(0x7a5408);
    gbg.fillRect(-bw2 / 2, -bh2 / 2 + 2, bw2, bh2);
    gbg.fillStyle(COLORS.gold);
    gbg.fillRect(-bw2 / 2, -bh2 / 2, bw2, bh2 - 2);
    gbg.fillStyle(0xfff4c8);
    gbg.fillRect(-bw2 / 2 + 2, -bh2 / 2 + 2, bw2 - 4, 2);
    this.goldLabel = text(this, 0, -1, '', 8, '#5a3c00').setOrigin(0.5);
    this.goldBadge = this.add.container(gx, gy, [gbg, this.goldLabel]).setVisible(false);
    this.tweens.add({ targets: this.goldBadge, scale: 1.06, duration: 600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
  }

  // Barra inferior: medidores de magia y gold, 2 huecos de hechizo y selector de orbe.
  // En pantallas alargadas los botones crecen con BOTTOM_EXTRA para ocupar el espacio.
  createSpecialBar() {
    const b = BOTTOM_EXTRA;
    const big = b >= 40;
    const barY = BOARD_FLOOR_Y + 10 + Math.round(b * 0.12);
    this.barY = barY;
    text(this, 6, barY, 'MAGIC', 8, '#4ce0e8').setOrigin(0, 0);
    text(this, W / 2 + 4, barY, 'GOLD', 8, '#ffd84a').setOrigin(0, 0);
    this.energyG = this.add.graphics();
    // Aviso sobre cada barra cuando está bloqueada (2 hechizos guardados / turnos de oro)
    this.magicLock = text(this, 50 + (W / 2 - 58) / 2, barY + 4, 'FULL', 8, '#ffffff').setOrigin(0.5).setStroke('#101828', 3).setDepth(1).setVisible(false);
    this.goldLock = text(this, W / 2 + 46 + (W / 2 - 52) / 2, barY + 4, 'ACTIVE', 8, '#fff4c8').setOrigin(0.5).setStroke('#5a3c00', 3).setDepth(1).setVisible(false);
    const bh = Math.min(84, 44 + b * 0.55);
    const by = b ? Math.round((barY + 16 + H - 8) / 2) : BOTTOM_BAR_Y;
    // De izquierda a derecha: 2 hechizos, orbes Runic y Divine (se activan de uno en uno; sin
    // ninguno se lanza el común) y la bajada rápida ▼ en la esquina. Ocupan todo el ancho.
    const gap = 4, rw = 48;
    const bw = Math.floor((W - 8 - rw - gap * 4) / 4);
    const bx = (i) => 4 + i * (bw + gap) + bw / 2;
    this.slotButtons = [];
    for (let i = 0; i < MAX_POWERS; i++) {
      const btn = makeButton(this, bx(i), by, bw, bh, '-', () => this.toggleSlot(i), { size: big ? 16 : 8 });
      this.slotButtons.push(btn);
    }
    // Dos hechizos iguales: un solo botón que ocupa los dos huecos, con el nombre del hechizo MAX
    this.maxSlotBtn = makeButton(this, (bx(0) + bx(1)) / 2, by, bw * 2 + gap, bh, '', () => this.toggleMaxSlot()).setVisible(false);
    this.ballButtons = {};
    BALL_ORDER.filter((id) => id !== 'normal').forEach((id, i) => {
      const btn = makeButton(this, bx(MAX_POWERS + i), by, bw, bh, '', () => this.selectBall(id), {
        fill: BALL_TYPES[id].fill
      });
      this.ballButtons[id] = btn;
    });
    this.recallBtn = makeButton(this, W - 4 - rw / 2, by, rw, bh, '▼', () => this.recallBalls(), { size: 16 });
    this.refreshSpecials();
  }

  drawMeter(x, y, w, ratio, color) {
    this.energyG.fillStyle(0x080a14);
    this.energyG.fillRect(x, y, w, 8);
    this.energyG.fillStyle(color);
    this.energyG.fillRect(x + 1, y + 1, (w - 2) * Math.min(1, ratio), 6);
  }

  /** Velocidad del lanzamiento: la elegida, la automática (turbo) y x2 si se mantiene pulsada la pantalla. */
  currentSpeed() {
    const base = this.turbo ? Math.max(TURBO_SPEED, this.speedMul) : this.speedMul;
    return base * (this.holdFast ? 2 : 1);
  }

  refreshHud() {
    const best = Math.max(this.save.data.bestScore, Math.floor(this.score));
    this.scoreText.setText(tr('SCORE {0}', Math.floor(this.score)));
    this.bestText.setText(tr('BEST {0}', best));
    this.turnText.setText(tr('TURN {0}', this.turn));
    this.captText.setText(tr('CAPTURED {0}', this.runCaptures.length));
    this.lifeText.setText(this.extraLife ? tr('+1 LIFE') : '');
    // Modo gold: cartel con los turnos que quedan, fondo dorado y destellos
    this.goldBadge.setVisible(this.shinyBoostTurns > 0);
    this.goldLabel.setText(tr('GOLD {0}', this.shinyBoostTurns));
    this.updateGoldMode();
    const shooting = this.state === 'shooting';
    const fast = shooting && (this.turbo || this.holdFast);
    this.speedBtn.setLabel(fast ? `x${this.currentSpeed()}` : `x${this.speedMul}`).setSelected(fast || this.speedMul > 1);
    this.recallBtn.setEnabled(shooting);
    const n = shooting ? this.toLaunch : this.ballCount;
    this.launchText.setText(n > 0 ? `x${n}` : '').setX(this.launchX);
    this.launcher.setX(this.launchX);
  }

  refreshSpecials() {
    const ballKey = `ball_${this.selectedBall}`;
    this.launcher?.setTexture(ballKey).setScale((BALL_R / BALL_TEXTURE_R) * texScale(ballKey));
    const barY = this.barY ?? BOARD_FLOOR_Y + 10;
    this.energyG.clear();
    // Barras bloqueadas: magia con los 2 huecos llenos y gold durante los turnos de oro
    const locked = this.powers.length >= MAX_POWERS;
    const goldOn = this.shinyBoostTurns > 0;
    this.drawMeter(50, barY, W / 2 - 58, locked ? 1 : this.energy / SPECIAL_COST, locked ? 0x56607c : 0x4ce0e8);
    this.drawMeter(W / 2 + 46, barY, W / 2 - 52, goldOn ? 1 : this.shinyMeter / SHINY_METER_MAX, goldOn ? 0xa07c28 : 0xffd84a);
    this.magicLock.setVisible(locked);
    this.goldLock.setVisible(goldOn);
    const aim = this.state === 'aim';
    // Dos hechizos iguales: un único botón con el hechizo MAX en lugar de los dos huecos
    const merged = this.powers.length === 2 && this.powers[0] === this.powers[1];
    this.slotButtons.forEach((btn, i) => {
      const sp = specialById(this.powers[i]);
      btn.setVisible(!merged);
      btn.setLabel(sp ? ELEMENTS[sp.type].short : '-');
      btn.setFill(sp ? hexToNum(ELEMENTS[sp.type].base) : 0x3a4668, '#ffffff');
      btn.setEnabled(!!sp && aim);
      btn.setSelected(this.selectedSlots.has(i));
    });
    this.maxSlotBtn.setVisible(merged);
    if (merged) {
      const sp = specialById(this.powers[0]);
      this.maxSlotBtn.setLabel(`${upper(tr(sp.name))}\nMAX`);
      this.maxSlotBtn.setFill(hexToNum(ELEMENTS[sp.type].base), '#ffffff');
      this.maxSlotBtn.setEnabled(aim).setSelected(this.selectedSlots.size === 2);
    }
    for (const [id, btn] of Object.entries(this.ballButtons)) {
      const n = this.ballInv[id];
      btn.setLabel(`${upper(tr(BALL_TYPES[id].name))}\n${n}`);
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
        // Se queda 2,1 s y luego se desvanece poco a poco (0,7 s)
        this.time.delayedCall(2100, () => {
          this.tweens.add({
            targets: layer, alpha: 0, duration: 700, ease: 'Sine.easeIn',
            onComplete: () => { layer.destroy(); this.nextToast(); }
          });
        });
      }
    });
  }

  // ---------- Entrada ----------

  setupInput() {
    this.input.on('pointerdown', (p) => {
      // Mantener pulsada la pantalla mientras vuelan los orbes: velocidad doble
      if (this.state === 'shooting' && !this.paused) {
        this.holdFast = true;
        this.refreshHud();
        return;
      }
      if (this.state !== 'aim' || this.paused) return;
      if (p.worldY < BOARD_TOP || p.worldY > LAUNCH_Y + 4) return;
      this.aiming = true;
      this.updateAim(p);
    });
    this.input.on('pointermove', (p) => {
      if (this.aiming) this.updateAim(p);
    });
    const releaseFast = () => {
      if (!this.holdFast) return;
      this.holdFast = false;
      this.refreshHud();
    };
    this.input.on('pointerupoutside', releaseFast);
    this.input.on('pointerup', () => {
      releaseFast();
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
    const dx = p.worldX - this.launchX;
    const dy = p.worldY - LAUNCH_Y;
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
    // Línea recta de puntos hasta la pared o el techo (sin mostrar el rebote). Desde el primer
    // bloque que tocaría el orbe sigue por encima de los bloques, con transparencia.
    let blocked = false;
    for (let d = 0; d < 1400; d += 4) {
      x += vx * 4;
      y += vy * 4;
      if (x < WALL_L + BALL_R || x > WALL_R - BALL_R || y < BOARD_TOP + BALL_R) {
        // Punto de choque también en la pared o el techo (donde el orbe tocaría)
        const cx = Phaser.Math.Clamp(x, WALL_L + BALL_R, WALL_R - BALL_R);
        const cy = Math.max(y, BOARD_TOP + BALL_R);
        g.fillStyle(0xffffff, blocked ? 0.4 : 0.9);
        g.fillRect(Math.round(cx) - 2, Math.round(cy) - 2, 5, 5);
        break;
      }
      if (!blocked && this.blocks.some((b) => !b.dead && this.circleHitsRect(x, y, b))) {
        blocked = true;
        g.fillStyle(0xffffff, 0.9);
        g.fillRect(Math.round(x) - 2, Math.round(y) - 2, 5, 5); // punto de choque
      }
      if (d % 8 === 0) {
        g.fillStyle(0xffffff, blocked ? 0.3 : 0.85);
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
    return { x0, y0, x1: x0 + b.w * CELL - 4, y1: y0 + b.h * CELL - 4 };
  }

  /** Mismo choque que la física (esquinas redondeadas), para la línea de apuntado. */
  circleHitsRect(x, y, b) {
    const r = this.blockRect(b);
    const cx = Phaser.Math.Clamp(x, r.x0 + CORNER_R, r.x1 - CORNER_R);
    const cy = Phaser.Math.Clamp(y, r.y0 + CORNER_R, r.y1 - CORNER_R);
    return (x - cx) ** 2 + (y - cy) ** 2 < (BALL_R + CORNER_R) ** 2;
  }

  plainColor(hp) {
    return PLAIN_COLORS[Math.min(PLAIN_COLORS.length - 1, Math.floor(Math.log2(Math.max(1, hp))))];
  }

  spawnRow() {
    const t = this.turn;
    const taken = new Set();
    // El dios ocupa 3x2 (GOD_W x GOD_H) y aparece por encima de todo: en su turno el tablero baja 2 filas
    // (ver endTurn), así que siempre queda hueco libre arriba. La fila superior sigue vacía.
    const row = SPAWN_ROW;
    // Turno del dios (decidido en endTurn, que puede posponerlo): baja él solo, sin más bloques.
    if (this.bossNow) {
      const col = randInt(0, COLS - GOD_W);
      this.addBlock({ col, row, w: GOD_W, h: GOD_H, kind: 'boss', creature: this.nextLegendary(), hp: BOSS_HP(t) });
      for (let c = col; c < col + GOD_W; c++) taken.add(c);
      this.showToast('A god descends!', '#b07800');
      audio.play('bossAppear');
    }
    const free = shuffle([...Array(COLS).keys()].filter((c) => !taken.has(c)));
    if (!this.bossNow) {
      // De 3 a 6 bloques por fila, más cuanto más avanza la partida (ROW_BLOCKS_BY_TURN);
      // siempre queda al menos un hueco libre
      const count = weightedPick(rowBlocksFor(t));
      // Como mucho una bestia por turno.
      let beastAllowed = true;
      for (let i = 0; i < Math.min(count, free.length - 1); i++) {
        if (this.addRandomBlock(row, free[i], t, beastAllowed)) beastAllowed = false;
      }
    }
    // La bola extra +1 ya no sale en todas las filas
    // Bola extra +1: solo una en pantalla, y no vuelve a salir hasta que pasen PICKUP_COOLDOWN tiradas tras recogerla
    if (!this.pickups.length && this.pickupCooldown <= 0 && Math.random() < this.pickupChance) {
      this.addPickup(row, free[free.length - 1]);
    }
  }

  /** Criatura al azar de la lista: las ya capturadas pesan CAUGHT_WEIGHT y las que faltan, 1. */
  pickCreature(list) {
    const w = (c) => (this.save.entry(c.id) ? CAUGHT_WEIGHT : 1);
    let r = Math.random() * list.reduce((sum, c) => sum + w(c), 0);
    for (const c of list) if ((r -= w(c)) < 0) return c;
    return list[list.length - 1];
  }

  /** Dios al azar sin repetir hasta que hayan salido todos (los no capturados, con más probabilidad). */
  nextLegendary() {
    if (!this.legendBag.length) this.legendBag = shuffle([...LEGENDARIES]);
    const god = this.pickCreature(this.legendBag);
    this.legendBag.splice(this.legendBag.indexOf(god), 1);
    return god;
  }

  /** Añade un bloque normal o, si se permite, quizá una bestia. Devuelve true si ha salido una bestia. */
  addRandomBlock(row, col, t, beastAllowed = true) {
    if (beastAllowed && t >= CREATURE_FROM_TURN && Math.random() < CREATURE_CHANCE) {
      const rarity = weightedPick(RARITY_WEIGHTS);
      const creature = this.pickCreature(NORMAL_CREATURES.filter((c) => c.rarity === rarity));
      const bonus = CREATURE_HP_BONUS + CREATURE_HP_PER_RARITY * (rarity - 1);
      this.addBlock({ row, col, w: 1, h: 1, kind: 'creature', creature, hp: Math.ceil(this.baseHp(t) * (1 + bonus)) });
      return true;
    }
    this.addBlock({ row, col, w: 1, h: 1, kind: 'plain', hp: this.baseHp(t) });
    return false;
  }

  /** Vida base de un bloque en el turno t (con algo de variación). */
  /** Vida de los bloques nuevos del turno t: progresiva y la misma para todos. */
  baseHp(t) {
    return Math.max(1, Math.round(t * this.hpPerTurn));
  }

  addBlock(d) {
    const shinyRate = this.shinyBoostTurns > 0 ? Math.max(SHINY_BOOST_RATE, SHINY_RATE) : SHINY_RATE;
    const blk = { ...d, maxHp: d.maxHp ?? d.hp, dead: false, shiny: d.shiny ?? (!!d.creature && Math.random() < shinyRate) };
    blk.w = d.w ?? 1;
    blk.h = d.h ?? 1;
    const size = blk.w * CELL; // ancho en px
    const height = blk.h * CELL; // alto en px
    const px = BOARD_X + d.col * CELL + size / 2;
    const py = BOARD_TOP + d.row * CELL + height / 2;
    const cont = this.add.container(px, py).setDepth(d.kind === 'boss' ? 4 : 3);
    const color = d.creature ? hexToNum(TYPES[d.creature.type].light) : this.plainColor(blk.maxHp);
    const bg = this.add.image(0, 0, blockBgKey(this, color, d.kind === 'boss' ? COLORS.gold : 0x101828, size, height)).setOrigin(blockBgOrigin(size), blockBgOrigin(height));
    cont.add(bg);
    blk.bg = bg;
    blk.color = color;
    if (d.creature) {
      // Bestias grandes en su casilla; los dioses llenan todo su bloque de 3x2
      const spr = addCreatureImage(this, 0, d.kind === 'boss' ? -4 : -5, d.creature.id, blk.shiny, d.kind === 'boss' ? 5 : 3);
      cont.add(spr);
      blk.sprite = spr;
      // La primera vez que sale una criatura se ve como silueta negra (no en las gold)
      if (this.save.markSeen(d.creature.id) && !blk.shiny) spr.setTint(0x000000);
      this.tweens.add({ targets: spr, y: spr.y - 2, duration: 400 + Math.random() * 300, yoyo: true, repeat: -1 });
      if (blk.shiny) this.decorateShiny(blk, cont, size, height);
      if (!this.save.entry(d.creature.id)) this.addNewMark(blk, cont, size, height);
    }
    // Vida en grande; en bloques con criatura va abajo para no tapar el sprite
    blk.hpText = this.add.bitmapText(0, d.kind === 'boss' ? height / 2 - 24 : d.creature ? height / 2 - 9 : 0, HP_FONT, '', 20).setOrigin(0.5).setLetterSpacing(-4);
    blk.hpMaxW = size - 8;
    blk.hpScale = d.kind === 'creature' ? 0.75 : 1; // en las bestias, número algo menor para ver el sprite
    if (d.kind === 'boss') {
      // Barra de vida del legendario: fondo, rastro blanco que se queda atrás y relleno de color
      const w = size - 24;
      const y = height / 2 - 9;
      blk.barW = w;
      const bg = this.add.image(-w / 2 - 1, y, 'px').setOrigin(0, 0.5).setDisplaySize(w + 2, 8).setTint(0x101828);
      // Barras como imágenes de un píxel teñidas y estiradas (no cortan el lote de dibujo)
      const bar = (x, h, color, ww) => this.add.image(x, y, 'px').setOrigin(0, 0.5).setDisplaySize(ww, h).setTint(color);
      blk.barLag = bar(-w / 2, 6, 0xffffff, w);
      blk.barFill = bar(-w / 2, 6, 0x58c878, w);
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
  decorateShiny(blk, cont, size, height = size) {
    const glow = this.add.rectangle(0, 0, size + 6, height + 6, COLORS.gold, 0.5);
    cont.addAt(glow, 0);
    this.tweens.add({ targets: glow, alpha: 0.12, scale: 1.06, duration: 520, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    blk.bg.setTexture(blockBgKey(this, blk.color, COLORS.gold, size, height));
    const hx = size / 2 - 7, hy = height / 2 - 7;
    [[-hx, -hy], [hx, -hy], [hx, hy], [-hx, hy]].forEach(([x, y], i) => {
      const sp = this.add.image(x, y, 'spark').setAlpha(0);
      cont.add(sp);
      this.tweens.add({ targets: sp, alpha: 1, scale: { from: 0.5, to: 1.4 }, duration: 260, yoyo: true, repeat: -1, repeatDelay: 500, delay: i * 190 });
    });
    if (this.restoring) return; // partida restaurada: sin anuncio
    // Haz de luz que cae sobre el bloque
    const beam = this.add.rectangle(cont.x, BOARD_TOP, 10, cont.y - BOARD_TOP, COLORS.gold, 0.45).setOrigin(0.5, 0).setDepth(18);
    this.tweens.add({ targets: beam, scaleX: 4, alpha: 0, duration: 700, ease: 'Quad.easeOut', onComplete: () => beam.destroy() });
    this.showToast(tr('A GOLD {0} appeared!', blk.creature.name), '#b07800');
    audio.play('shiny');
  }

  // Aviso en la fila superior (siempre vacía) cuando falta poco para el legendario.
  updateBossWarning() {
    const left = BOSS_EVERY - (this.turn % BOSS_EVERY);
    const show = ((left >= 1 && left <= 2) || this.bossPending) && this.state !== 'over';
    if (!show) {
      this.bossWarn?.setVisible(false);
      return;
    }
    if (!this.bossWarn) {
      const y = BOARD_TOP + CELL / 2;
      const bar = this.add.rectangle(W / 2, y, WALL_R - WALL_L - 8, CELL - 12, 0xe05858, 0.22);
      const label = text(this, W / 2, y, '', 8, '#ffb0b0').setOrigin(0.5).setStroke('#101828', 3);
      this.bossWarn = this.add.container(0, 0, [bar, label]).setDepth(2);
      this.bossWarn.label = label;
      this.tweens.add({ targets: bar, alpha: 0.08, duration: 600, yoyo: true, repeat: -1 });
    }
    this.bossWarn.label.setText(tr(this.bossPending ? 'A GOD WAITS FOR ROOM' : left === 1 ? 'A GOD COMES NEXT TURN!' : 'A GOD IN 2 TURNS'));
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
    const k = blk.hpScale ?? 1;
    blk.hpText.setScale(k);
    if (blk.hpText.width > blk.hpMaxW) blk.hpText.setScale((k * blk.hpMaxW) / blk.hpText.width);
    if (blk.barFill) this.updateBossBar(blk);
  }

  updateBossBar(blk) {
    const ratio = Phaser.Math.Clamp(blk.hp / blk.maxHp, 0, 1);
    const w = Math.max(0, blk.barW * ratio);
    blk.barFill.displayWidth = w;
    blk.barFill.setTint(ratio > 0.5 ? 0x58c878 : ratio > 0.25 ? 0xe8c040 : 0xe05858);
    // El rastro blanco alcanza a la vida actual tras un instante
    this.tweens.killTweensOf(blk.barLag);
    this.tweens.add({ targets: blk.barLag, displayWidth: w, delay: 220, duration: 260, ease: 'Quad.easeOut' });
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
      move(b.cont, b.row, b.h);
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

  /** Botón MAX (los dos huecos con el mismo hechizo): se activan o desactivan juntos. */
  toggleMaxSlot() {
    if (this.state !== 'aim' || this.paused || this.powers.length < 2) return;
    if (this.selectedSlots.size === 2) this.selectedSlots.clear();
    else {
      this.selectedSlots = new Set([0, 1]);
      const sp = specialById(this.powers[0]);
      this.showToast(`${tr(sp.name)} MAX: ${tr(sp.desc)}`);
    }
    this.refreshSpecials();
  }

  toggleSlot(i) {
    if (this.state !== 'aim' || this.paused || !this.powers[i]) return;
    if (this.selectedSlots.has(i)) this.selectedSlots.delete(i);
    else {
      this.selectedSlots.add(i);
      const sp = specialById(this.powers[i]);
      this.showToast(`${tr(sp.name)}: ${tr(sp.desc)}`);
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
      this.runStats.spells += this.activeSpecials.length;
      this.checkMissions();
    }
    // Bola de captura del lanzamiento
    this.shotBall = this.selectedBall;
    if (this.shotBall !== 'normal') {
      this.ballInv[this.shotBall]--;
      this.selectedBall = 'normal'; // tras usar una bola especial se vuelve a la normal
    }
    this.state = 'shooting';
    this.shotTime = 0;
    this.shotKills = 0;
    this.shotMagic = this.activeSpecials.length > 0; // con hechizo, el medidor gold suma la mitad
    this.turbo = false;
    this.clearCelebrated = false;
    this.nextLaunchX = null;
    // Posición y dirección fijas durante todo el turno.
    this.shotX = this.launchX;
    this.shotAngle = this.aimAngle;
    // Overgrowth añade orbes extra (+50 %; MAX: x2). Solo los añadidos son verdes.
    this.shotBase = this.ballCount;
    this.launchedCount = 0;
    const plant = this.powerLevel('enredadera');
    this.toLaunch = plant === 2 ? this.ballCount * 2 : plant ? Math.ceil(this.ballCount * 1.5) : this.ballCount;
    // Shadow Bounce MAX: una vida extra para el resto de la partida (no se acumula)
    if (this.powerLevel('sombra') === 2) this.grantExtraLife();
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
    const r = water ? WATER_BALL_R : BALL_R; // Tidal Wave: orbes grandes (MAX: el mismo tamaño)
    // Bola de su tipo (normal roja/blanca, super azul/roja, ultra amarilla/negra);
    // con poder activo o si es una bola añadida de Enredadera, se pinta del color del poder.
    const others = this.activeSpecials.filter((sp) => sp.id !== 'enredadera');
    const powered = extra || others.length > 0;
    const ballKey = powered ? 'ball' : `ball_${this.shotBall}`;
    const img = this.add.image(this.shotX, LAUNCH_Y, ballKey).setDepth(8).setScale((r / BALL_TEXTURE_R) * texScale(ballKey));
    let trailColor = BALL_TYPES[this.shotBall].trail;
    if (extra) trailColor = PLANT_COLOR;
    else if (others.length) trailColor = hexToNum(ELEMENTS[others[0].type].light);
    if (powered) img.setTint(trailColor);
    // Estela: copias del orbe que se van encogiendo y apagando (ver GHOSTS)
    const ghosts = GHOSTS.map(() => {
      const gimg = this.add.image(this.shotX, LAUNCH_Y, ballKey).setDepth(7).setAlpha(0);
      if (powered) gimg.setTint(trailColor);
      return gimg;
    });
    if (extra) {
      // Bola añadida por Enredadera: destello verde al salir y brillo que late
      this.fxRing(this.shotX, LAUNCH_Y, PLANT_COLOR, 14, 260, 2);
      this.fxBurst(this.shotX, LAUNCH_Y, [PLANT_COLOR, 0x4cb04c, 0xf070a0], 5, 18, 360, -8);
    }
    audio.play('launch');
    this.balls.push({
      extra,
      x: this.shotX,
      y: LAUNCH_Y - 1,
      r,
      vx: Math.cos(this.shotAngle) * BALL_SPEED,
      vy: Math.sin(this.shotAngle) * BALL_SPEED,
      k: 1, // multiplicador de velocidad (baja tras cada rebote y vuelve a 1 acelerando)
      contact: null, // último punto de contacto (pared o bloque) en este fotograma, para dibujarlo
      img,
      baseScale: img.scaleX, // escala del orbe redondo (se estira según la velocidad, ver orientBall)
      ghosts,
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
    if (last) this.nextLaunchX = Phaser.Math.Clamp(last.x, WALL_L + BALL_R, WALL_R - BALL_R);
    for (const b of this.balls) b.done = true;
    if (this.nextLaunchX === null) this.nextLaunchX = this.launchX;
  }

  update(_time, delta) {
    if (this.paused || this.state === 'over') return;
    let dt = Math.min(delta, 50) / 1000;
    // Pausa de impacto (al derrotar a un legendario): las bolas van a cámara lenta un instante
    if (this.hitStop > 0) {
      this.hitStop -= dt;
      dt *= 0.15;
    }
    this.weather.update(dt);
    this.drawBolts(dt);
    // Destellos, números de vida y marcador de los golpes del fotograma anterior
    this.flushHits();
    if (this.hudDirty && this.time.now - (this.hudAt ?? 0) >= 60) {
      this.hudDirty = false;
      this.hudAt = this.time.now;
      this.refreshHud();
    }

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
      this.showToast('Press ▼ to recall your orbs');
    }
    const speed = this.currentSpeed();
    // A más velocidad los orbes salen algo más espaciados (en distancia) para no saturar la pantalla
    if (this.launchTimer) this.launchTimer.timeScale = speed / (1 + SPACING_GROWTH * (speed - 1));

    const total = dt * speed;
    const steps = Math.max(1, Math.ceil((total * BALL_SPEED) / 3));
    const s = total / steps;
    // Datos que no cambian durante el fotograma: se calculan una vez (antes, en cada paso de cada orbe)
    this.waterLevel = this.powerLevel('torrente');
    for (const blk of this.blocks) blk.rect = this.blockRect(blk);
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
        b.ghosts?.forEach((gimg) => gimg.destroy());
        b.ghosts = null;
      } else if (b.img) {
        // Si ha rebotado en este fotograma, se dibuja tocando la pared o el bloque (a mucha
        // velocidad, si no, el rebote ocurre entre dos fotogramas y nunca se ve el contacto).
        if (b.contact) {
          b.img.setPosition(b.contact.x, b.contact.y);
          b.trail.push(b.contact.x, b.contact.y);
          b.contact = null;
          this.orientBall(b, speed, true);
        } else {
          b.img.setPosition(b.x, b.y);
          this.orientBall(b, speed, false);
        }
        b.trail.push(b.x, b.y);
        if (b.trail.length > TRAIL_POINTS * 2) b.trail.splice(0, 2);
      }
    }
    this.drawTrails(dt);
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
    // Con Shadow Bounce, un orbe que aún no ha rebotado en el suelo todavía puede volver a subir
    const shadow = this.hasSpecial('sombra');
    if (nothingLeft || live.every((b) => b.vy > 0 && b.y - b.r > lowest && (!shadow || b.floorBounced))) {
      this.turbo = true;
      this.refreshHud();
    }
  }

  /** Punto del recorrido reciente que está a dist px por detrás del orbe (sigue los rebotes). */
  trailPoint(b, dist) {
    const t = b.trail;
    let left = dist;
    for (let i = t.length / 2 - 1; i > 0; i--) {
      const x1 = t[i * 2], y1 = t[i * 2 + 1], x0 = t[i * 2 - 2], y0 = t[i * 2 - 1];
      const seg = Math.hypot(x1 - x0, y1 - y0);
      if (seg >= left && seg > 0) {
        const f = left / seg;
        return { x: x1 + (x0 - x1) * f, y: y1 + (y0 - y1) * f, ok: true };
      }
      left -= seg;
    }
    return { x: t[0] ?? b.x, y: t[1] ?? b.y, ok: false };
  }

  // Estela tipo cometa (copias del orbe cada vez más pequeñas y transparentes), resplandor suave
  // alrededor de cada orbe y marcas de los puntos de impacto de los rebotes.
  drawTrails(dt = 0) {
    const g = this.trailG;
    g.clear();
    for (const b of this.balls) {
      if (!b.img) continue;
      if (b.ghosts) {
        GHOSTS.forEach((cfg, i) => {
          const p = this.trailPoint(b, cfg.d);
          // Al salir del lanzador aún no hay recorrido: la estela aparece poco a poco
          b.ghosts[i].setPosition(p.x, p.y).setRotation(b.img.rotation)
            .setScale(b.img.scaleX * cfg.s, b.img.scaleY * cfg.s).setAlpha(p.ok ? cfg.a : 0);
        });
      }
      // Línea luminosa: halo del color del orbe y núcleo blanco, más finos y tenues hacia atrás
      let prev = { x: b.img.x, y: b.img.y };
      for (let i = 1; i <= TRAIL_SEGS; i++) {
        const p = this.trailPoint(b, (TRAIL_LEN * i) / TRAIL_SEGS);
        const k = 1 - (i - 1) / TRAIL_SEGS; // 1 → casi 0
        g.lineStyle(Math.max(1, b.r * 0.75 * k), b.trailColor, 0.3 * k);
        g.lineBetween(prev.x, prev.y, p.x, p.y);
        g.lineStyle(Math.max(1, b.r * 0.28 * k), 0xffffff, 0.5 * k);
        g.lineBetween(prev.x, prev.y, p.x, p.y);
        if (!p.ok) break; // al salir del lanzador aún no hay recorrido
        prev = p;
      }
      g.fillStyle(b.trailColor, 0.12);
      g.fillCircle(b.x, b.y, b.r * 1.2);
    }
    // Puntos de impacto: destello pequeño que crece y se apaga
    if (this.impacts?.length) {
      for (const im of this.impacts) {
        const k = Math.max(0, im.ttl / IMPACT_TTL); // 1 → 0
        const r = 2 + (1 - k) * 4;
        g.fillStyle(0xffffff, 0.85 * k);
        g.fillCircle(im.x, im.y, r * 0.6);
        g.lineStyle(1, im.color, 0.9 * k);
        g.strokeCircle(im.x, im.y, r + 1);
        im.ttl -= dt;
      }
      this.impacts = this.impacts.filter((im) => im.ttl > 0);
    }
  }

  /**
   * Orbe ligeramente ovalado en la dirección en la que va: se alarga más cuanto más rápido
   * se mueve (velocidad del juego y aceleración tras el rebote). El fotograma en que toca una
   * pared o un bloque se aplasta un poco.
   */
  orientBall(b, speed, squash) {
    const st = squash ? -0.12 : Math.min(0.24, 0.08 + 0.035 * speed) * (0.4 + 0.6 * b.k);
    b.img.setRotation(Math.atan2(b.vy, b.vx)).setScale(b.baseScale * (1 + st), b.baseScale * (1 - st * 0.55));
  }

  /** Rebote: el orbe sale más lento y acelera; se guarda el punto de contacto y su marca. */
  bounced(b, ix, iy) {
    b.k = BOUNCE_SLOW;
    b.contact = { x: b.x, y: b.y };
    if (this.impacts.length < 60) this.impacts.push({ x: ix, y: iy, ttl: IMPACT_TTL, color: b.trailColor });
  }

  stepBall(b, s) {
    b.x += b.vx * s * b.k;
    b.y += b.vy * s * b.k;
    // Aceleración de vuelta a la velocidad normal tras un rebote
    if (b.k < 1) b.k = Math.min(1, b.k + (1 - b.k) * Math.min(1, s * BOUNCE_RECOVER) + 0.0005);
    if (b.x < WALL_L + b.r) {
      b.x = WALL_L + b.r;
      b.vx = Math.abs(b.vx);
      this.bounced(b, WALL_L, b.y);
    } else if (b.x > WALL_R - b.r) {
      b.x = WALL_R - b.r;
      b.vx = -Math.abs(b.vx);
      this.bounced(b, WALL_R, b.y);
    }
    let verticalBounce = false;
    if (b.y < BOARD_TOP + b.r) {
      b.y = BOARD_TOP + b.r;
      b.vy = Math.abs(b.vy);
      verticalBounce = b.vx === 0;
      this.bounced(b, b.x, BOARD_TOP);
    }
    if (b.y >= LAUNCH_Y && this.hasSpecial('sombra') && !b.floorBounced) {
      // Shadow Bounce: el orbe rebota una vez en el suelo en lugar de volver
      b.floorBounced = true;
      b.y = LAUNCH_Y - 1;
      b.vy = -Math.abs(b.vy);
      this.bounced(b, b.x, LAUNCH_Y);
      this.fxRing(b.x, LAUNCH_Y, SHADOW_COLOR, 14, 260, 2);
      this.fxBurst(b.x, LAUNCH_Y, [SHADOW_COLOR, 0x6a4ca8, 0xffffff], 5, 18, 300, -10);
    }
    if (b.y >= LAUNCH_Y) {
      b.done = true;
      // La última bola en volver marca dónde se lanzará el próximo turno
      // (el lanzador actual no se mueve hasta que acaba el turno).
      this.nextLaunchX = Phaser.Math.Clamp(b.x, WALL_L + BALL_R, WALL_R - BALL_R);
      this.nextMarker.setPosition(this.nextLaunchX, LAUNCH_Y).setVisible(true);
      return;
    }

    // Tidal Wave: cada orbe atraviesa los primeros bloques que toca (2; MAX: 3) y luego rebota normal.
    const water = this.waterLevel;
    const pierceMax = water === 2 ? WATER_PIERCE_MAX : WATER_PIERCE;
    const br = b.r;
    // Esquinas redondeadas: el bloque se trata como un rectángulo encogido CORNER_R px por lado
    // y el orbe como un círculo de radio br + CORNER_R. En los lados es lo mismo que antes;
    // en las esquinas la normal gira de forma continua, así el rebote depende del punto exacto.
    const effR = br + CORNER_R;

    for (const blk of this.blocks) {
      if (blk.dead) continue;
      const r = blk.rect ?? this.blockRect(blk);

      // Descarte rápido (usamos los límites originales de la caja real)
      if (b.x + br <= r.x0 || b.x - br >= r.x1 || b.y + br <= r.y0 || b.y - br >= r.y1) {
        if (b.inside.size) b.inside.delete(blk);
        continue;
      }

      // Encogemos lógicamente el rectángulo para crear la curva en las esquinas
      const shrinkX0 = r.x0 + CORNER_R;
      const shrinkX1 = r.x1 - CORNER_R;
      const shrinkY0 = r.y0 + CORNER_R;
      const shrinkY1 = r.y1 - CORNER_R;

      // Buscamos el punto más cercano en el rectángulo encogido
      const cx = b.x < shrinkX0 ? shrinkX0 : b.x > shrinkX1 ? shrinkX1 : b.x;
      const cy = b.y < shrinkY0 ? shrinkY0 : b.y > shrinkY1 ? shrinkY1 : b.y;

      const dx = b.x - cx;
      const dy = b.y - cy;
      const d2 = dx * dx + dy * dy;

      // Comprobamos la distancia contra el radio expandido (effR)
      if (d2 >= effR * effR) {
        if (b.inside.size) b.inside.delete(blk);
        continue;
      }

      if (b.inside.has(blk)) continue; // sigue dentro de un bloque que ya atravesó
      
      if (water && (b.pierced ?? 0) < pierceMax) {
        b.inside.add(blk);
        b.pierced = (b.pierced ?? 0) + 1;
        this.hitBlock(blk, b);
        if (b.pierced === pierceMax && b.img) {
          b.img.setTint(0xffffff);
          b.ghosts?.forEach((gimg) => gimg.setTint(0xffffff));
          b.trailColor = 0xffffff;
          this.fxRing(b.x, b.y, 0x78c0ff, 12, 240, 2);
        }
        continue;
      }

      let nx;
      let ny;
      let push;
      const d = Math.sqrt(d2);
      if (d > 0.0001) {
        nx = dx / d;
        ny = dy / d;
        push = effR - d; // cuánto hay que sacar el orbe para que quede justo tocando
      } else {
        // El centro del orbe está dentro del rectángulo encogido: sale por el lado más cercano
        const pen = [b.x - r.x0, r.x1 - b.x, b.y - r.y0, r.y1 - b.y];
        const m = pen.indexOf(Math.min(...pen));
        [nx, ny] = [[-1, 0], [1, 0], [0, -1], [0, 1]][m];
        push = br + pen[m];
      }

      const dot = b.vx * nx + b.vy * ny;
      let hitNow = false;
      if (dot < 0) {
        // Rebote: reflexión sobre la normal (conserva la dirección; la velocidad baja y se recupera)
        b.vx -= 2 * dot * nx;
        b.vy -= 2 * dot * ny;
        // Golpe en una esquina: pequeño desvío aleatorio del ángulo y, muy de vez en cuando,
        // el orbe queda en vertical (Ataque vertical).
        const onCorner = (b.x < shrinkX0 || b.x > shrinkX1) && (b.y < shrinkY0 || b.y > shrinkY1);
        if (onCorner) this.cornerBounce(b);
        hitNow = true;
      }

      b.x += nx * push;
      b.y += ny * push;
      // Punto de contacto: el borde del orbe que toca el bloque
      if (hitNow) this.bounced(b, b.x - nx * br, b.y - ny * br);
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

  /**
   * Golpe en la esquina de un bloque: el orbe sale casi siempre hacia donde debe, con un pequeño
   * desvío aleatorio (media de tres números: los desvíos grandes son raros, hasta CORNER_JITTER).
   * Muy de vez en cuando queda en vertical, que es lo que permite el Ataque vertical.
   */
  cornerBounce(b) {
    if (Math.random() < VERTICAL_LOCK_CHANCE) {
      b.vy = (b.vy < 0 ? -1 : 1) * BALL_SPEED;
      b.vx = 0;
      return;
    }
    const jitter = ((Math.random() + Math.random() + Math.random()) / 1.5 - 1) * CORNER_JITTER;
    const cos = Math.cos(jitter), sin = Math.sin(jitter);
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
    // Ice Lance: x2 (MAX x3). No hay debilidades por elemento.
    const ice = this.powerLevel('escarcha');
    const dmg = ice === 2 ? 3 : ice ? 2 : 1;
    const { x, y } = blk.cont;
    this.powerHitFx(blk, x, y, ball);
    this.damage(blk, dmg);
    const fire = this.powerLevel('estallido');
    if (fire) {
      // Daño a los bloques de alrededor (las 8 casillas); MAX: hasta 2 casillas de distancia
      for (const n of this.neighbors(blk, fire)) this.damage(n, 1);
    }
    const elec = this.powerLevel('arco');
    if (elec) {
      // Cada golpe salta a 4 bloques al azar de todo el tablero (MAX: 6)
      const near = shuffle(this.blocks.filter((o) => !o.dead && o !== blk))
        .slice(0, elec === 2 ? 6 : 4)
        .map((o) => ({ o }));
      for (const { o } of near) {
        const big = elec === 2;
        this.bolts.push({ x1: x, y1: y, x2: o.cont.x, y2: o.cont.y, ttl: big ? 0.26 : 0.16, max: big ? 0.26 : 0.16, big });
        this.fxBurst(o.cont.x, o.cont.y, [0xfff07a, 0xffffff], big ? 10 : 4, big ? 30 : 18, big ? 320 : 200);
        if (big) {
          // MAX: rayos gruesos con onda en cada bloque alcanzado
          this.fxRing(o.cont.x, o.cont.y, 0xfff07a, 30, 300, 3);
          this.maxShake(50, 0.002);
        }
        this.damage(o, 1);
      }
    }
  }

  neighbors(blk, range = 1) {
    return this.blocks.filter(
      (o) => !o.dead && o !== blk &&
        o.col <= blk.col + blk.w - 1 + range && o.col + o.w - 1 >= blk.col - range &&
        o.row <= blk.row + blk.h - 1 + range && o.row + o.h - 1 >= blk.row - range
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
    const targets = this.blocks.filter((o) => !o.dead && o.col <= col && o.col + o.w - 1 >= col);
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
    haptics.pulse('big');
    floatText(this, cx, BOARD_TOP + CELL * 3, `+${gained}`, COLORS.goldHex, 16);
    this.showToast(tr('VERTICAL STRIKE! +{0}', gained), '#b07800');
    audio.play('vertical');
  }

  damage(blk, dmg) {
    if (blk.dead || dmg <= 0) return;
    this.addScore(Math.min(dmg, blk.hp));
    blk.hp -= dmg;
    // Sin destellos de color: el golpe se nota con una pequeña vibración del bloque (punch)
    this.hitBlocks.add(blk);
    haptics.pulse('hit');
    this.punch(blk);
    audio.play('hit', { boss: blk.kind === 'boss' });
    if (blk.hp <= 0.001) this.destroyBlock(blk);
    else blk.textDirty = true;
  }

  /**
   * Una vez por fotograma: apaga los destellos que han caducado y actualiza el número de vida
   * de los bloques golpeados (como mucho cada 80 ms por bloque: cada cambio de texto se vuelve
   * a dibujar y a subir a la GPU, y con muchos orbes eran cientos por segundo).
   */
  flushHits(force = false) {
    if (!this.hitBlocks.size) return;
    const now = this.time.now;
    for (const blk of this.hitBlocks) {
      if (blk.dead) {
        this.hitBlocks.delete(blk);
        continue;
      }
      if (blk.flashUntil && now >= blk.flashUntil) {
        blk.bg.clearTint();
        blk.flashUntil = 0;
      }
      if (blk.redUntil && now >= blk.redUntil) {
        blk.sprite?.clearTint();
        blk.redUntil = 0;
      }
      if (blk.textDirty && (force || now - (blk.textAt ?? 0) >= 80)) {
        blk.textDirty = false;
        blk.textAt = now;
        this.updateBlockText(blk);
      }
      if (!blk.flashUntil && !blk.redUntil && !blk.textDirty) this.hitBlocks.delete(blk);
    }
  }

  // Reacción leve al impacto: el bloque se encoge un instante y vuelve (los legendarios, menos).
  // Golpe: pequeña vibración horizontal del bloque (unas oscilaciones que se apagan en ~110 ms).
  // No cambia el tamaño ni el color, así el orbe siempre se ve tocando el borde real.
  punch(blk) {
    const now = this.time.now;
    if (now - (blk.lastPunch ?? 0) < 70) return;
    blk.lastPunch = now;
    const c = blk.cont;
    const baseX = BOARD_X + blk.col * CELL + (blk.w * CELL) / 2;
    const amp = blk.kind === 'boss' ? 1 : 1.5;
    blk.shakeTween?.remove();
    blk.shakeTween = this.tweens.addCounter({
      from: 0, to: 1, duration: 110,
      onUpdate: (tw) => {
        const v = tw.getValue();
        if (!blk.dead) c.x = baseX + Math.sin(v * Math.PI * 5) * amp * (1 - v);
      },
      onComplete: () => { if (!blk.dead) c.x = baseX; }
    });
  }

  // Destrucción: destello, onda, fragmentos con gravedad y sacudida según el tamaño.
  destroyBlock(blk) {
    blk.dead = true;
    this.anyDead = true;
    haptics.pulse(blk.kind === 'boss' ? 'big' : 'break');
    const { x, y } = blk.cont;
    const size = blk.w * CELL - 4;
    const boss = blk.kind === 'boss';
    const flash = this.add.rectangle(x, y, size, blk.h * CELL - 4, 0xffffff).setDepth(19);
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
      this.celebrateBoss(blk, x, y);
    } else {
      if (blk.creature) this.cameras.main.shake(70, 0.0025);
      audio.play(blk.creature ? 'breakCreature' : 'break');
    }
    const bonus = blk.kind === 'plain' ? 5 : blk.kind === 'creature' ? 20 * blk.creature.rarity : 300;
    this.addScore(bonus);
    this.shotKills++;
    this.runStats.blocks++;
    if (blk.kind === 'creature') this.runStats.beasts++;
    if (blk.kind === 'boss') this.runStats.gods++;
    this.runStats.bestShot = Math.max(this.runStats.bestShot, this.shotKills);
    if (blk.kind === 'boss') {
      this.awardBall();
      this.addShiny(SHINY_GAIN.legendary);
      this.save.bumpStat('bossKills');
      this.checkMissions();
      this.time.delayedCall(600, () => this.changeWeather());
      this.time.delayedCall(120, () => this.riseUnder(blk));
    }
    this.addEnergy(MAGIC_GAIN[blk.kind] ?? MAGIC_GAIN.plain);
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
    const main = ELEMENTS[specials[0].type];
    const tint = this.add
      .rectangle(WALL_L, BOARD_TOP, WALL_R - WALL_L, BOARD_FLOOR_Y - BOARD_TOP, hexToNum(main.base), max ? 0.4 : 0.28)
      .setOrigin(0)
      .setDepth(17);
    this.tweens.add({ targets: tint, alpha: 0, duration: 650, onComplete: () => tint.destroy() });
    const y = BOARD_TOP + CELL * 4.5;
    const objs = [];
    const hold = combo || max ? 900 : 520;
    if (combo) {
      // Combinación: banda partida con el color de cada tipo
      const [a, b] = specials.map((sp) => ELEMENTS[sp.type]);
      objs.push(this.add.rectangle(W / 4, y, W / 2, 64, hexToNum(a.dark), 0.9));
      objs.push(this.add.rectangle((3 * W) / 4, y, W / 2, 64, hexToNum(b.dark), 0.9));
      objs.push(text(this, W / 2, y - 18, 'COMBO!', 16, COLORS.goldHex).setOrigin(0.5).setStroke('#101828', 4));
      objs.push(text(this, W / 4, y + 6, a.short, 16, '#ffffff').setOrigin(0.5).setStroke('#101828', 4));
      objs.push(text(this, W / 2, y + 6, '+', 16, COLORS.goldHex).setOrigin(0.5).setStroke('#101828', 4));
      objs.push(text(this, (3 * W) / 4, y + 6, b.short, 16, '#ffffff').setOrigin(0.5).setStroke('#101828', 4));
      objs.push(text(this, W / 2, y + 24, specials.map((sp) => upper(tr(sp.name))).join(' + '), 8, '#ffffff').setOrigin(0.5).setStroke('#101828', 3));
    } else {
      objs.push(this.add.rectangle(W / 2, y, W, max ? 64 : 40, hexToNum(main.dark), 0.9).setStrokeStyle(max ? 3 : 0, COLORS.gold));
      objs.push(text(this, W / 2, y - (max ? 10 : 0), upper(tr(specials[0].name)), 16, '#ffffff').setOrigin(0.5).setStroke('#101828', 4));
      if (max) objs.push(text(this, W / 2, y + 16, 'MAX SPELL!', 8, COLORS.goldHex).setOrigin(0.5).setStroke('#101828', 3));
    }
    if (max) this.maxIntro(specials[0], y);
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
      const t = ELEMENTS[sp.type];
      this.fxBurst(this.launchX, LAUNCH_Y, [hexToNum(t.base), hexToNum(t.light), 0xffffff], 14, 34, 500, -10);
    }
    // Indicador durante el lanzamiento
    const tag = max ? `${tr(main.short)} MAX` : specials.map((sp) => tr(ELEMENTS[sp.type].short)).join('+');
    this.powerTag?.destroy();
    this.powerTag = text(this, BOARD_X + 4, LAUNCH_Y - 2, tag, 8, max || combo ? COLORS.goldHex : '#ffffff').setOrigin(0, 0.5).setDepth(6).setStroke('#101828', 3);
  }

  /**
   * Hechizo MAX (dos iguales): destello del color del elemento, golpe de zoom, rayos que giran
   * detrás del cartel, «MAX!» gigante, brillo que cruza la banda, ondas desde el lanzador,
   * fuentes de partículas en las esquinas y un aura en los bordes mientras dura el lanzamiento.
   */
  maxIntro(sp, y) {
    const el = ELEMENTS[sp.type];
    const base = hexToNum(el.base), light = hexToNum(el.light), dark = hexToNum(el.dark);
    const cam = this.cameras.main;
    const rgb = Phaser.Display.Color.IntegerToColor(light);
    cam.flash(260, rgb.red, rgb.green, rgb.blue);
    this.tweens.add({ targets: cam, zoom: 1.06, duration: 120, yoyo: true, hold: 140, ease: 'Quad.easeOut' });
    // Rayos detrás del cartel
    const rays = this.add.graphics({ x: W / 2, y }).setDepth(45);
    rays.fillStyle(light, 0.35);
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      rays.fillTriangle(0, 0, Math.cos(a - 0.1) * 260, Math.sin(a - 0.1) * 260, Math.cos(a + 0.1) * 260, Math.sin(a + 0.1) * 260);
    }
    rays.setScale(0);
    this.tweens.add({ targets: rays, scale: 1, angle: 70, duration: 1300, ease: 'Quad.easeOut' });
    this.tweens.add({ targets: rays, alpha: 0, delay: 800, duration: 500, onComplete: () => rays.destroy() });
    // «MAX!» gigante que cae encima del cartel y late
    const big = text(this, W / 2, y - 50, 'MAX!', 32, COLORS.goldHex).setOrigin(0.5).setDepth(47).setStroke('#101828', 6).setScale(3).setAlpha(0);
    this.tweens.add({ targets: big, scale: 1, alpha: 1, duration: 260, ease: 'Back.easeOut' });
    this.tweens.add({ targets: big, scale: 1.15, duration: 160, delay: 260, yoyo: true, repeat: 2 });
    this.tweens.add({ targets: big, alpha: 0, y: y - 80, delay: 1100, duration: 300, onComplete: () => big.destroy() });
    // Brillo que cruza la banda
    const shine = this.add.rectangle(-30, y, 26, 64, 0xffffff, 0.55).setDepth(47).setAngle(18);
    this.tweens.add({ targets: shine, x: W + 30, duration: 420, delay: 140, ease: 'Quad.easeInOut', onComplete: () => shine.destroy() });
    // Ondas desde el lanzador y fuentes en las esquinas inferiores
    for (let i = 0; i < 3; i++) this.time.delayedCall(i * 120, () => this.fxRing(this.launchX, LAUNCH_Y, i % 2 ? light : 0xffffff, 40, 520, 4));
    for (const x of [WALL_L + 4, WALL_R - 4]) {
      for (let i = 0; i < 3; i++) {
        this.time.delayedCall(i * 90, () => this.fxBurst(x, LAUNCH_Y, [base, light, 0xffffff, COLORS.gold], 12, 110, 800, 40));
      }
    }
    audio.play('bossAppear');
    // Aura en los bordes del tablero durante todo el lanzamiento
    this.maxAura?.destroy();
    const aura = this.add.graphics().setDepth(2).setBlendMode(Phaser.BlendModes.ADD);
    const h = BOARD_FLOOR_Y - BOARD_TOP;
    for (let i = 0; i < 4; i++) {
      aura.fillStyle(i < 2 ? light : dark, 0.32 - i * 0.07);
      aura.fillRect(WALL_L + i * 3, BOARD_TOP, 3, h);
      aura.fillRect(WALL_R - (i + 1) * 3, BOARD_TOP, 3, h);
      aura.fillRect(WALL_L, BOARD_TOP + i * 3, WALL_R - WALL_L, 3);
    }
    this.tweens.add({ targets: aura, alpha: 0.35, duration: 380, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    this.maxAura = aura;
  }

  /** Temblor pequeño para los golpes de los hechizos MAX (como mucho cada 140 ms). */
  maxShake(ms = 70, k = 0.0025) {
    const now = this.time.now;
    if (now - (this.lastMaxShake ?? 0) < 140) return;
    this.lastMaxShake = now;
    this.cameras.main.shake(ms, k);
  }

  /** Efecto de cada golpe según los poderes activos (limitado por bloque para no saturar). */
  powerHitFx(blk, x, y, ball = null) {
    if (!this.activeSpecials.length) return;
    const now = this.time.now;
    if (now - (blk.lastFx ?? 0) < 90) return;
    blk.lastFx = now;
    const lv = (id) => this.powerLevel(id);
    if (this.hasSpecial('estallido')) {
      this.fxRing(x, y, 0xffa25c, 26, 300, 4);
      this.fxBurst(x, y, [0xffd84a, 0xe8613c, 0xffa25c], 8, 34, 380, -14);
      if (lv('estallido') === 2) {
        // MAX: explosión doble, más grande, con llamas que suben y temblor
        this.fxRing(x, y, 0xffd84a, 46, 420, 6);
        this.time.delayedCall(80, () => this.fxRing(x, y, 0xe8613c, 60, 460, 3));
        this.fxBurst(x, y, [0xffffff, 0xffd84a, 0xe8613c, 0xffa25c], 16, 64, 520, -40);
        this.maxShake();
      }
      audio.play('fireHit');
    }
    if (this.hasSpecial('torrente')) {
      this.fxRing(x, y, 0x78c0ff, 18, 280, 2);
      this.fxBurst(x, y, [0x78c0ff, 0xd8f4ff], 5, 22, 320, 16);
      if (lv('torrente') === 2) {
        // MAX: ola que rompe: ondas dobles y salpicadura alta que cae
        this.fxRing(x, y, 0xd8f4ff, 40, 420, 4);
        this.time.delayedCall(90, () => this.fxRing(x, y, 0x3c8ce0, 54, 460, 3));
        this.fxBurst(x, y - 6, [0xffffff, 0x78c0ff, 0x3c8ce0, 0xd8f4ff], 16, 56, 620, 70);
        this.maxShake(60, 0.002);
      }
      audio.play('splash');
    }
    if (ball?.extra) {
      this.fxBurst(x, y, [PLANT_COLOR, 0x4cb04c, 0xf070a0], 5, 20, 420, 18);
      if (lv('enredadera') === 2) {
        // MAX: estallido de hojas y flores
        this.fxRing(x, y, PLANT_COLOR, 36, 420, 4);
        this.fxBurst(x, y, [PLANT_COLOR, 0x4cb04c, 0xf070a0, 0xffe070, 0xffffff], 14, 50, 620, 24);
      }
    }
    if (this.hasSpecial('arco')) audio.play('zap');
    if (this.hasSpecial('escarcha')) {
      const ice = this.add.rectangle(x, y, blk.w * CELL - 4, blk.h * CELL - 4, 0xd4f4ff, 0.55).setDepth(5);
      this.tweens.add({ targets: ice, alpha: 0, duration: 420, onComplete: () => ice.destroy() });
      this.fxBurst(x, y, [0xffffff, 0xd4f4ff, 0x8cd8f0], 6, 26, 460, 8);
      if (lv('escarcha') === 2) {
        // MAX: el bloque se congela con un estallido de esquirlas de hielo en estrella
        this.fxRing(x, y, 0xffffff, 40, 420, 5);
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
          const shard = this.add.rectangle(x, y, 14, 3, i % 2 ? 0xffffff : 0x8cd8f0).setDepth(21).setRotation(a);
          this.tweens.add({
            targets: shard, x: x + Math.cos(a) * 46, y: y + Math.sin(a) * 46, scaleX: 0.3, alpha: 0,
            duration: 420, ease: 'Quad.easeOut', onComplete: () => shard.destroy()
          });
        }
        this.maxShake(60, 0.002);
      }
      audio.play('frost');
    }
  }

  rockslide() {
    // Las rocas destruyen los 2 bloques con más vida (MAX: 3). A un dios le quitan el 50 % de
    // su vida total (MAX: 80 %).
    const maxRock = this.powerLevel('derrumbe') === 2;
    const targets = this.blocks
      .filter((b) => !b.dead)
      .sort((a, b) => b.hp - a.hp)
      .slice(0, maxRock ? 3 : 2);
    targets.forEach((blk, i) => {
      const rock = this.add.image(blk.cont.x, BOARD_TOP - 10, 'rock').setScale((blk.kind === 'boss' ? 7 : 4) * (maxRock ? 1.5 : 1)).setDepth(22);
      this.tweens.add({ targets: rock, angle: 220, duration: 320, delay: i * 60 });
      this.tweens.add({
        targets: rock, y: blk.cont.y, duration: 320, delay: i * 60, ease: 'Quad.easeIn',
        onComplete: () => {
          rock.destroy();
          this.cameras.main.shake(110, 0.006);
          audio.play('rumble');
          this.fxRing(blk.cont.x, blk.cont.y, 0xc8b08c, 30, 360);
          this.fxBurst(blk.cont.x, blk.cont.y, [0xa08868, 0x685440, 0xc8b08c], 12, 40, 520, 30);
          if (maxRock) {
            // MAX: impacto enorme, doble onda y lluvia de piedras
            this.cameras.main.shake(200, 0.012);
            this.time.delayedCall(90, () => this.fxRing(blk.cont.x, blk.cont.y, 0xffe0b0, 46, 460, 5));
            this.fxBurst(blk.cont.x, blk.cont.y, [0xffffff, 0xa08868, 0x685440, 0xc8b08c], 20, 70, 700, 60);
          }
          if (!blk.dead) this.damage(blk, blk.kind === 'boss' ? blk.maxHp * (maxRock ? ROCK_GOD_MAX : ROCK_GOD) : blk.hp);
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
      const k = bolt.big ? 2 : 1; // MAX: rayos el doble de gruesos
      this.fxG.lineStyle(6 * k + 2 * (k - 1), 0xfff07a, 0.25 * a); // halo
      this.fxG.strokePoints(pts);
      this.fxG.lineStyle(2 * k, 0xffffff, a); // núcleo
      this.fxG.strokePoints(pts);
      bolt.ttl -= dt;
    }
    this.bolts = this.bolts.filter((b) => b.ttl > 0);
  }

  addScore(n) {
    this.score += n;
    this.hudDirty = true; // el marcador se redibuja como mucho una vez por fotograma (ver update)
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
      this.showToast(tr('New spell: {0}!', tr(sp.name)), ELEMENTS[sp.type].dark);
    }
    this.refreshSpecials();
  }

  /** Legendario derrotado: cámara lenta, cadena de explosiones, ondas, fuente de estrellas y cartel. */
  celebrateBoss(blk, x, y) {
    const cam = this.cameras.main;
    const t = TYPES[blk.creature.type];
    const color = hexToNum(t.base);
    this.hitStop = 0.45;
    cam.flash(220, 255, 255, 255);
    cam.shake(600, 0.012);
    this.tweens.add({ targets: cam, zoom: 1.08, duration: 160, yoyo: true, hold: 120, ease: 'Quad.easeOut' });
    audio.play('bossBreak');
    // Cadena de explosiones alrededor del legendario
    for (let i = 0; i < 6; i++) {
      this.time.delayedCall(i * 110, () => {
        const ex = x + (Math.random() - 0.5) * CELL * 1.6;
        const ey = y + (Math.random() - 0.5) * CELL * 1.6;
        this.fxRing(ex, ey, i % 2 ? 0xffffff : color, 22, 380, 4);
        this.fxBurst(ex, ey, [color, hexToNum(t.light), COLORS.gold, 0xffffff], 12, 46, 520, 20);
        audio.play('fireHit');
      });
    }
    // Gran onda expansiva doble
    [0, 180].forEach((delay, i) => {
      const ring = this.add.circle(x, y, 30).setStrokeStyle(i ? 4 : 8, i ? 0xffffff : COLORS.gold).setDepth(48).setAlpha(0);
      this.tweens.add({ targets: ring, alpha: { from: 1, to: 0 }, scale: 9, duration: 900, delay, ease: 'Cubic.easeOut', onComplete: () => ring.destroy() });
    });
    // Fuente de estrellas y monedas doradas
    for (let i = 0; i < 30; i++) {
      const sp = i % 2 ? this.add.image(x, y, 'spark').setScale(1.4 + Math.random()) : this.add.rectangle(x, y, 4, 4, COLORS.gold);
      sp.setDepth(49);
      const a = -Math.PI / 2 + (Math.random() - 0.5) * 2.2;
      const d = 90 + Math.random() * 120;
      this.tweens.add({
        targets: sp,
        x: { value: x + Math.cos(a) * d, ease: 'Quad.easeOut' },
        y: { value: y + Math.sin(a) * d + 140, ease: 'Back.easeIn' },
        angle: (Math.random() - 0.5) * 540,
        alpha: { from: 1, to: 0 },
        duration: 1100 + Math.random() * 500,
        onComplete: () => sp.destroy()
      });
    }
    // Cartel
    const cy = BOARD_TOP + CELL * 2.4;
    const band = this.add.rectangle(W / 2, cy, W, 58, hexToNum(t.dark), 0.92).setDepth(50).setStrokeStyle(3, COLORS.gold).setScale(1, 0);
    const title = text(this, W / 2, cy - 10, 'GOD DEFEATED!', 8, COLORS.goldHex).setOrigin(0.5).setDepth(51).setStroke('#101828', 3).setAlpha(0);
    const name = text(this, W / 2, cy + 10, upper(blk.creature.name), 16, '#ffffff').setOrigin(0.5).setDepth(51).setStroke('#101828', 4).setScale(0);
    this.tweens.add({ targets: band, scaleY: 1, duration: 180, ease: 'Back.easeOut', delay: 150 });
    this.tweens.add({ targets: title, alpha: 1, duration: 200, delay: 250 });
    this.tweens.add({ targets: name, scale: 1, duration: 360, delay: 300, ease: 'Back.easeOut' });
    this.tweens.add({
      targets: [band, title, name], alpha: 0, delay: 1900, duration: 350,
      onComplete: () => { band.destroy(); title.destroy(); name.destroy(); }
    });
    floatText(this, x, y - 30, '+300', COLORS.goldHex, 16);
    this.time.delayedCall(350, () => audio.play('clear'));
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
    const title = text(this, cx, cy - 14, 'BOARD\nCLEARED!', 24, COLORS.goldHex).setOrigin(0.5).setDepth(50).setStroke('#101828', 6).setScale(0);
    const bonus = text(this, cx, cy + 40, '+500  SPECIAL ORB', 8, '#ffffff').setOrigin(0.5).setDepth(50).setStroke('#101828', 4).setAlpha(0);
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
        this.showToast(tr('Mission complete! {0}', tr(this.missionTitle(id))), '#2a8a40');
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
    if (this.shinyBoostTurns > 0) return; // durante los turnos de oro el medidor no se llena
    if (this.shotMagic) n *= SHINY_MAGIC_FACTOR; // lanzamiento con hechizo: la mitad
    this.shinyMeter += n;
    if (this.shinyMeter >= SHINY_METER_MAX) {
      this.shinyMeter = 0;
      this.shinyBoostTurns = SHINY_BOOST_TURNS;
      audio.play('shiny');
      this.showToast(tr('Gold chance {0} for {1} turns!', pct(SHINY_BOOST_RATE), SHINY_BOOST_TURNS), '#b07800');
    }
    this.refreshSpecials();
    this.refreshHud();
  }

  awardBall() {
    const id = rollRewardBall();
    this.ballInv[id]++;
    audio.play('reward');
    this.showToast(tr('You got a {0} orb!', tr(BALL_TYPES[id].name)), '#2a6aa8');
    this.refreshSpecials();
  }

  tryCapture(blk, x, y) {
    const c = blk.creature;
    const shiny = blk.shiny;
    const success = Math.random() < captureChance(this.shotBall, c, shiny);
    this.pendingCaptures++;
    const scale = blk.kind === 'boss' ? 3 : 2;
    const spr = addCreatureImage(this, x, y, c.id, shiny, scale).setDepth(30);
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
  addNewMark(blk, cont, size, height = size) {
    const x = -size / 2 + 8;
    const y = -height / 2 + 8;
    // Círculo rojo con «!» (imagen precalculada: no corta el lote de dibujo como las formas)
    const mark = this.add.image(x, y, 'newmark');
    const badge = this.add.container(0, 0, [mark]);
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
    this.addShiny(c.legendary ? SHINY_GAIN.captureGod : SHINY_GAIN.capture);
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
    this.autoSave(); // la captura pudo terminar ya empezado el turno siguiente
  }

  // ---------- Escaparate de captura ----------

  /**
   * Las capturas nuevas se agrupan: las que llegan casi a la vez (mismo lanzamiento)
   * se muestran juntas en una misma tarjeta, hasta 4 por tarjeta.
   */
  queueShowcase(item) {
    this.showcaseBatch.push(item);
    this.showcaseTimer?.remove();
    this.showcaseTimer = this.time.delayedCall(450, () => {
      const batch = this.showcaseBatch.splice(0);
      for (let i = 0; i < batch.length; i += 4) this.showcaseQueue.push(batch.slice(i, i + 4));
      if (!this.showcaseBusy) this.nextShowcase();
    });
  }

  /**
   * Tarjeta de captura nueva en la esquina inferior izquierda, a tamaño real (sin escalar, para que
   * el texto se lea nítido): sprite a la izquierda y nombre en la fuente de lectura (VT323).
   * Con varias capturas a la vez, una fila por criatura (hasta 4 por tarjeta).
   */
  nextShowcase() {
    const group = this.showcaseQueue.shift();
    if (!group) {
      this.showcaseBusy = false;
      return;
    }
    this.showcaseBusy = true;
    const n = group.length;
    const single = n === 1;
    const anyShiny = group.some((g) => g.shiny);
    const cardW = Math.min(220, W - 16);
    const rowH = 32;
    const cardH = single ? 88 : 30 + n * rowH;
    const cx = WALL_L + 8 + cardW / 2;
    const cy = LAUNCH_Y - 8 - cardH / 2;
    const left = -cardW / 2;
    const hold = 1600 + (n - 1) * 300;
    const parts = [];
    const floaters = [];
    const card = this.add.graphics();
    drawPanel(card, left, -cardH / 2, cardW, cardH, { fill: anyShiny ? 0xfff4c8 : COLORS.paper, border: anyShiny ? 0xb07800 : COLORS.ink });
    parts.push(card);
    const titleStr = single ? (group[0].shiny ? 'NEW GOLD BEAST!' : 'NEW CAPTURE!') : tr('{0} NEW CAPTURES!', n);
    const titleX = single ? left + 80 : left + 10;
    parts.push(text(this, titleX, -cardH / 2 + 14, titleStr, 8, anyShiny ? '#b07800' : '#2a8a40').setOrigin(0, 0.5));

    if (single) {
      const { c, shiny } = group[0];
      const t = TYPES[c.type];
      const sx = left + 40, sy = 4;
      const glow = this.add.circle(sx, sy, 30, hexToNum(t.light), 0.6);
      const spr = addCreatureImage(this, sx, sy, c.id, shiny, c.legendary ? 2.6 : 3.4);
      parts.push(glow, spr);
      floaters.push({ target: spr, y: sy - 4, duration: 360, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      floaters.push({ target: glow, scale: 1.15, alpha: 0.3, duration: 440, yoyo: true, repeat: -1 });
      const name = bodyText(this, titleX, -4, c.name, 10, shiny ? '#b07800' : COLORS.inkHex, { align: 'left', wordWrap: { width: cardW - 88 } })
        .setOrigin(0, 0.5);
      const chipLabel = text(this, titleX + 4, cardH / 2 - 16, upper(tr(t.name)), 8, '#ffffff').setOrigin(0, 0.5);
      const chip = this.add.rectangle(titleX, cardH / 2 - 16, chipLabel.width + 8, 14, hexToNum(t.base)).setOrigin(0, 0.5);
      parts.push(name, chip, chipLabel);
      if (shiny) {
        const sp = this.add.image(sx + 24, sy - 24, 'spark').setScale(1.6);
        parts.push(sp);
        floaters.push({ target: sp, alpha: 0.2, duration: 220, yoyo: true, repeat: -1 });
      }
    } else {
      group.forEach(({ c, shiny }, i) => {
        const t = TYPES[c.type];
        const y = -cardH / 2 + 30 + i * rowH + rowH / 2 - 2;
        const glow = this.add.circle(left + 22, y, 13, hexToNum(t.light), 0.6);
        const spr = addCreatureImage(this, left + 22, y, c.id, shiny, c.legendary ? 1.2 : 1.6);
        const name = bodyText(this, left + 42, y, c.name, 8, shiny ? '#b07800' : COLORS.inkHex).setOrigin(0, 0.5);
        const tag = text(this, cardW / 2 - 8, y, t.short, 8, t.dark).setOrigin(1, 0.5);
        parts.push(glow, spr, name, tag);
        floaters.push({ target: spr, y: y - 3, duration: 320 + i * 40, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      });
    }

    const outX = -cardW / 2 - 20; // entra y sale deslizándose por la izquierda
    const layer = this.add.container(outX, cy, parts).setDepth(44);
    for (const { target, ...cfg } of floaters) this.tweens.add({ targets: target, ...cfg });
    audio.play(anyShiny ? 'shiny' : 'reward');
    this.tweens.add({
      targets: layer, x: cx, duration: 320, ease: 'Back.easeOut',
      onComplete: () => this.tweens.add({
        targets: layer, x: outX, alpha: 0, delay: hold, duration: 260, ease: 'Quad.easeIn',
        onComplete: () => {
          layer.destroy();
          this.nextShowcase();
        }
      })
    });
  }

  // ---------- Hueco del legendario ----------

  /**
   * Al caer un legendario, desde su fila hacia abajo (incluidos los bloques que estaban a su lado)
   * todo sube manteniendo columnas y orden: cada fila ocupada se coloca justo debajo de la
   * anterior fila con bloques, así desaparecen las filas que quedan vacías.
   */
  riseUnder(boss) {
    const items = [
      ...this.blocks.filter((b) => !b.dead).map((b) => ({ kind: 'block', o: b, size: b.h })),
      ...this.pickups.map((p) => ({ kind: 'pickup', o: p, size: 1 }))
    ];
    const group = items.filter((it) => it.o.row >= boss.row);
    if (!group.length) return;
    // Última fila ocupada por encima del legendario
    let target = SPAWN_ROW;
    for (const it of items) if (it.o.row < boss.row) target = Math.max(target, it.o.row + it.size);
    // Filas ocupadas por el grupo, de arriba abajo; las vacías se eliminan
    const occupied = new Set();
    for (const it of group) for (let r = 0; r < it.size; r++) occupied.add(it.o.row + r);
    const map = new Map();
    for (const r of [...occupied].sort((a, b) => a - b)) map.set(r, target++);
    let moved = false;
    for (const it of group) {
      const row = map.get(it.o.row);
      if (row === it.o.row) continue;
      it.o.row = row;
      moved = true;
      const t = it.kind === 'block' ? it.o.cont : it.o.img;
      const y = BOARD_TOP + row * CELL + (it.size * CELL) / 2;
      t.riseTween = this.tweens.add({ targets: t, y, duration: 300, ease: 'Back.easeOut' });
    }
    if (moved) audio.play('rumble');
  }

  /**
   * Huida: el orbe se rompe, la criatura sale de un salto y se va corriendo (a saltitos)
   * por un lado de la pantalla elegido al azar, para que se vea claro que no se ha capturado.
   */
  captureFail(c, spr, orb, scale) {
    const x0 = orb.x, y0 = orb.y;
    orb.destroy();
    this.tipFlags.escaped = true;
    audio.play('escape');
    // Trozos del orbe roto
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + Math.random() * 0.5;
      const bit = this.add.rectangle(x0, y0, 4, 4, 0xe8eef8).setDepth(32);
      this.tweens.add({ targets: bit, x: x0 + Math.cos(a) * 18, y: y0 + Math.sin(a) * 18 + 6, alpha: 0, duration: 380, onComplete: () => bit.destroy() });
    }
    const full = scale * texScale(spr.texture.key);
    spr.setDepth(33).setScale(full);
    const dir = Math.random() < 0.5 ? -1 : 1;
    const exitX = dir > 0 ? W + 50 : -50;
    const dist = Math.abs(exitX - x0);
    const run = Math.max(500, dist * 2.4); // ms para salir de la pantalla
    // Texto grande que salta y se desvanece
    const msg = text(this, x0, y0 - 26, 'ESCAPED!', 14, '#ff7a5c').setOrigin(0.5).setDepth(34).setStroke('#101828', 4).setScale(0);
    this.tweens.add({ targets: msg, scale: 1, duration: 200, ease: 'Back.easeOut' });
    this.tweens.add({ targets: msg, y: y0 - 46, alpha: 0, delay: 700, duration: 400, onComplete: () => msg.destroy() });
    // Salto de sorpresa y carrera hacia el borde
    this.tweens.add({
      targets: spr, y: y0 - 16, duration: 140, yoyo: true, ease: 'Quad.easeOut',
      onComplete: () => {
        this.tweens.add({ targets: spr, x: exitX, duration: run, ease: 'Quad.easeIn', onComplete: () => spr.destroy() });
        // Saltitos y nubes de polvo mientras corre
        this.tweens.add({ targets: spr, y: y0 - 7, duration: 90, yoyo: true, repeat: Math.ceil(run / 180), ease: 'Sine.easeOut' });
        this.tweens.add({ targets: spr, angle: dir * 8, duration: 90, yoyo: true, repeat: Math.ceil(run / 180) });
        const dust = this.time.addEvent({
          delay: 110, repeat: Math.ceil(run / 110),
          callback: () => {
            if (!spr.active) return dust.remove();
            const puff = this.add.rectangle(spr.x - dir * spr.displayWidth * 0.35, y0 + spr.displayHeight * 0.35, 5, 5, 0xc8d0dc, 0.8).setDepth(32);
            this.tweens.add({ targets: puff, y: puff.y - 6, scale: 1.8, alpha: 0, duration: 320, onComplete: () => puff.destroy() });
          }
        });
      }
    });
  }

  // ---------- Turnos ----------

  endTurn() {
    this.state = 'resolving';
    this.holdFast = false;
    this.launchTimer?.remove();
    this.launchTimer = null;
    this.flushHits(true);
    if (this.hudDirty) {
      this.hudDirty = false;
      this.refreshHud();
    }
    this.blocks = this.blocks.filter((b) => !b.dead);
    if (this.nextLaunchX !== null) this.launchX = this.nextLaunchX;
    this.nextMarker.setVisible(false);
    this.powerTag?.destroy();
    this.powerTag = null;
    this.maxAura?.destroy();
    this.maxAura = null;
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
    // Baja una fila; si llega un dios, dos (aparece encima de los bloques actuales).
    // Si bajar dos filas te haría perder, el dios se pospone hasta que haya sitio.
    const bossDue = this.isBossTurn(this.turn) || this.bossPending;
    const roomForBoss = !this.blocks.some((b) => b.row + b.h - 1 + 2 >= ROWS - 1);
    this.bossNow = bossDue && roomForBoss;
    if (bossDue && !roomForBoss) {
      if (!this.bossPending) this.showToast('A god waits for room on the board...', '#a03030');
      this.bossPending = true;
    } else if (this.bossNow) {
      this.bossPending = false;
    }
    if (this.extraLife && this.blocks.some((b) => b.row + b.h >= ROWS - 1)) {
      // Vida extra: este turno las filas no bajan (ni sale fila nueva) en lugar de perder
      if (this.bossNow) this.bossPending = true;
      this.bossNow = false;
      this.useExtraLife();
    } else {
      this.shiftAll(this.bossNow ? 2 : 1, true);
      // Las bolas extra que llegan abajo se recogen solas.
      for (const p of [...this.pickups]) if (p.row >= ROWS - 1) this.takePickup(p);
      if (this.blocks.some((b) => b.row + b.h - 1 >= ROWS - 1)) {
        this.time.delayedCall(250, () => this.gameOver());
        this.refreshHud();
        return;
      }
      this.spawnRow();
    }
    this.checkMissions();
    if (this.shinyBoostTurns > 0) this.shinyBoostTurns--;
    this.updateBossWarning();
    if (BOSS_EVERY - (this.turn % BOSS_EVERY) === 2) {
      this.showToast('A god arrives in 2 turns!', '#a03030');
      audio.play('bossAppear');
    }
    this.time.delayedCall(220, () => {
      if (this.state !== 'resolving') return;
      this.state = 'aim';
      this.refreshHud();
      this.refreshSpecials();
      this.autoSave();
      checkTips(this);
    });
    this.refreshHud();
  }

  /** Shadow Bounce MAX: una vida extra para el resto de la partida (no se acumula). */
  grantExtraLife() {
    if (this.extraLife) {
      this.showToast('You already have an extra life', '#3a2668');
      return;
    }
    this.extraLife = true;
    this.showToast('+1 EXTRA LIFE for this run!', '#3a2668');
    audio.play('shiny');
    this.refreshHud();
  }

  /**
   * Se gasta la vida extra: las filas no bajan este turno y el lanzador se mueve a la columna
   * libre (sin bloque en la fila justo encima del lanzamiento) más cercana.
   */
  useExtraLife() {
    this.extraLife = false;
    const lastRow = ROWS - 2;
    const blocked = new Set();
    for (const b of this.blocks) {
      if (b.dead || b.row > lastRow || b.row + b.h - 1 < lastRow) continue;
      for (let c = b.col; c < b.col + b.w; c++) blocked.add(c);
    }
    const free = [...Array(COLS).keys()].filter((c) => !blocked.has(c));
    if (free.length) {
      const colX = (c) => BOARD_X + c * CELL + CELL / 2;
      free.sort((a, b) => Math.abs(colX(a) - this.launchX) - Math.abs(colX(b) - this.launchX));
      this.launchX = colX(free[0]);
    }
    const cam = this.cameras.main;
    cam.flash(300, 180, 148, 240);
    cam.shake(200, 0.006);
    this.fxRing(this.launchX, LAUNCH_Y, SHADOW_COLOR, 50, 600, 5);
    this.fxBurst(this.launchX, LAUNCH_Y, [SHADOW_COLOR, 0x6a4ca8, 0xffffff], 18, 60, 700, -20);
    floatText(this, W / 2, LAUNCH_Y - 60, 'EXTRA LIFE USED!', '#b494f0');
    this.showToast('Saved! The rows hold this turn', '#3a2668');
    audio.play('shiny');
  }

  openPause() {
    if (this.paused || this.state === 'over') return;
    this.paused = true;
    this.aiming = false;
    this.holdFast = false;
    this.aimG.clear();
    this.tweens.pauseAll();
    this.time.paused = true;
    const layer = this.add.container(0, 0).setDepth(60);
    layer.add(fullRect(this, 0x000000, 0.6).setInteractive());
    layer.add(makePanel(this, 24, 200, W - 48, 300));
    layer.add(makeAudioToggles(this, 390, this.save));
    const vibLabel = () => tr('VIBRATION {0}', tr(this.save.data.settings.haptics ? 'ON' : 'OFF'));
    const vibBtn = makeButton(this, W / 2, 470, 200, 30, vibLabel(), () => {
      const st = this.save.data.settings;
      st.haptics = !st.haptics;
      this.save.write();
      haptics.setEnabled(st.haptics);
      vibBtn.setLabel(vibLabel());
      if (st.haptics) haptics.pulse('break');
    });
    layer.add(vibBtn);
    const gridLabel = () => tr('GRID {0}', tr(this.save.data.settings.grid ? 'ON' : 'OFF'));
    const gridBtn = makeButton(this, W / 2, 432, 200, 30, gridLabel(), () => {
      const st = this.save.data.settings;
      st.grid = !st.grid;
      this.save.write();
      this.gridG.setVisible(st.grid);
      gridBtn.setLabel(gridLabel());
    });
    layer.add(gridBtn);
    layer.add(text(this, W / 2, 228, 'PAUSED', 16, COLORS.inkHex).setOrigin(0.5));
    layer.add(makeButton(this, W / 2, 285, 180, 34, 'RESUME', () => {
      layer.destroy();
      this.tweens.resumeAll();
      this.time.paused = false;
      this.paused = false;
    }));
    // La partida queda guardada (desde el principio del turno actual): CONTINUE en el menú
    layer.add(makeButton(this, W / 2, 335, 180, 34, 'QUIT TO MENU', () => {
      this.time.paused = false;
      this.checkMissions();
      this.scene.start('title');
    }));
  }

  // ---------- Guardado automático de la partida ----------

  /** Estado de la partida al empezar un turno (orbes quietos), para poder seguirla después. */
  snapshot() {
    return {
      turn: this.turn,
      score: Math.floor(this.score),
      ballCount: this.ballCount,
      pickupCooldown: this.pickupCooldown,
      legendBag: this.legendBag.map((c) => c.id),
      energy: this.energy,
      powers: [...this.powers],
      balls: { super: this.ballInv.super, ultra: this.ballInv.ultra },
      selectedBall: this.selectedBall,
      shinyMeter: this.shinyMeter,
      shinyBoostTurns: this.shinyBoostTurns,
      bossPending: this.bossPending,
      extraLife: this.extraLife,
      launchX: this.launchX,
      weather: this.weather?.index ?? 0,
      runCaptures: this.runCaptures.map(({ id, shiny }) => ({ id, shiny })),
      runStats: { ...this.runStats },
      blocks: this.blocks.filter((b) => !b.dead).map((b) => ({
        col: b.col, row: b.row, w: b.w, h: b.h, kind: b.kind, id: b.creature?.id ?? null, hp: b.hp, maxHp: b.maxHp, shiny: b.shiny
      })),
      pickups: this.pickups.filter((p) => !p.taken).map((p) => ({ col: p.col, row: p.row }))
    };
  }

  autoSave() {
    if (this.state === 'aim') saveRun(this.snapshot());
  }

  /** Vuelve a montar una partida guardada (ver core/run.js). */
  restoreRun(run) {
    this.restoring = true;
    this.turn = run.turn;
    this.score = run.score;
    this.ballCount = run.ballCount;
    this.pickupCooldown = run.pickupCooldown;
    this.legendBag = run.legendBag.map((id) => creatureById(id)).filter(Boolean);
    this.energy = run.energy;
    this.powers = run.powers.filter((id) => specialById(id)).slice(0, MAX_POWERS);
    this.ballInv.super = run.balls.super;
    this.ballInv.ultra = run.balls.ultra;
    this.selectedBall = this.ballInv[run.selectedBall] > 0 ? run.selectedBall : 'normal';
    this.shinyMeter = run.shinyMeter;
    this.shinyBoostTurns = run.shinyBoostTurns;
    this.bossPending = run.bossPending;
    this.extraLife = run.extraLife;
    if (run.launchX != null) this.launchX = Phaser.Math.Clamp(run.launchX, WALL_L + BALL_R, WALL_R - BALL_R);
    this.runCaptures = run.runCaptures;
    this.runStats = { ...this.runStats, ...run.runStats };
    for (const b of run.blocks) {
      const creature = b.id != null ? creatureById(b.id) : null;
      if (b.kind !== 'plain' && !creature) continue;
      this.addBlock({ col: b.col, row: b.row, w: b.w, h: b.h, kind: b.kind, creature, hp: b.hp, maxHp: b.maxHp, shiny: b.shiny });
    }
    for (const p of run.pickups) this.addPickup(p.row, p.col);
    if (run.weather && this.weather) {
      this.weather.index = run.weather;
      if (!this.weather.current) this.weather.index = 0;
      this.weather.reset();
    }
    audio.setMood(this.weather?.index ?? 0);
    this.restoring = false;
    this.showToast(tr('Run resumed: turn {0}', this.turn), '#2a6aa8');
  }

  gameOver() {
    if (this.state === 'over') return;
    // Esperamos a que terminen las capturas en curso para contar sus puntos.
    if (this.pendingCaptures > 0) {
      this.time.delayedCall(150, () => this.gameOver());
      return;
    }
    this.state = 'over';
    clearRun();
    this.launchTimer?.remove();
    const score = Math.floor(this.score);
    const isBest = this.save.recordGame(score, this.turn);
    this.checkMissions();
    audio.play('gameover');
    this.defeatEffect();
    this.time.delayedCall(900, () => audio.setTrack('defeat'));
    this.time.delayedCall(1300, () => this.showDefeatPanel(score, isBest));
  }

  /**
   * Derrota: destello rojo, temblor, el tablero se oscurece y los bloques se desmoronan y caen
   * de abajo arriba; los orbes que quedaban desaparecen.
   */
  defeatEffect() {
    const cam = this.cameras.main;
    cam.flash(260, 200, 40, 40);
    cam.shake(420, 0.012);
    this.trailG.clear();
    for (const b of this.balls) {
      b.img?.destroy();
      b.ghosts?.forEach((g) => g.destroy());
    }
    this.balls = [];
    this.recallBtn.setEnabled(false);
    const shade = this.add.rectangle(WALL_L, BOARD_TOP, WALL_R - WALL_L, BOARD_FLOOR_Y - BOARD_TOP, 0x200008, 0).setOrigin(0).setDepth(20);
    this.tweens.add({ targets: shade, fillAlpha: 0.55, duration: 900 });
    const blocks = this.blocks.filter((b) => !b.dead).sort((a, b) => b.row - a.row);
    blocks.forEach((blk) => {
      const delay = (ROWS - 1 - blk.row) * 70 + Math.random() * 60;
      this.tweens.killTweensOf(blk.cont);
      this.tweens.add({
        targets: blk.cont, y: blk.cont.y + 6, duration: 90, delay, yoyo: true,
        onComplete: () => this.tweens.add({
          targets: blk.cont, y: FULL_H + 60, angle: (Math.random() - 0.5) * 120, alpha: 0.2,
          duration: 700 + Math.random() * 300, ease: 'Quad.easeIn'
        })
      });
      this.time.delayedCall(delay, () => this.fxBurst(blk.cont.x, blk.cont.y, [blk.color, 0x101828, 0x56607c], 6, 26, 500, 40));
    });
    for (const p of this.pickups) this.tweens.add({ targets: p.img, alpha: 0, scale: 0, duration: 400 });
  }

  /** Cartel de fin de partida: puntuación que sube, estadísticas de la partida y capturas. */
  showDefeatPanel(score, isBest) {
    const layer = this.add.container(0, 0).setDepth(60);
    const dim = fullRect(this, 0x000000, 0).setInteractive();
    layer.add(dim);
    this.tweens.add({ targets: dim, fillAlpha: 0.6, duration: 400 });
    const px = 16, pw = W - 32, py = 70, ph = 500;
    const card = this.add.container(0, 0);
    layer.add(card);
    const panel = this.add.graphics();
    drawPanel(panel, px, py, pw, ph);
    // Franja superior roja con el título
    panel.fillStyle(0xa83232);
    panel.fillRect(px + 4, py + 4, pw - 8, 44);
    panel.fillStyle(0xd85050);
    panel.fillRect(px + 4, py + 4, pw - 8, 4);
    card.add(panel);
    card.add(text(this, W / 2, py + 27, 'GAME OVER', 16, '#ffffff').setOrigin(0.5).setStroke('#4a1010', 4));
    // Puntuación grande que cuenta hacia arriba
    card.add(text(this, W / 2, py + 66, 'SCORE', 8, '#56607c').setOrigin(0.5));
    const scoreText = text(this, W / 2, py + 88, '0', 24, isBest ? '#b07800' : COLORS.inkHex).setOrigin(0.5);
    card.add(scoreText);
    this.tweens.addCounter({ from: 0, to: score, duration: Math.min(1400, 400 + score / 4), ease: 'Quad.easeOut', onUpdate: (tw) => scoreText.setText(String(Math.round(tw.getValue()))) });
    if (isBest) {
      const best = text(this, W / 2, py + 114, 'NEW BEST!', 8, '#ffffff').setOrigin(0.5);
      const ribbon = this.add.rectangle(W / 2, py + 114, best.width + 20, 16, 0xd08800);
      card.add([ribbon, best]);
      this.tweens.add({ targets: [ribbon, best], scale: 1.1, duration: 420, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    } else {
      card.add(text(this, W / 2, py + 114, tr('BEST  {0}', this.save.data.bestScore), 8, '#56607c').setOrigin(0.5));
    }
    // Estadísticas en dos columnas
    const s = this.runStats;
    const shinies = this.runCaptures.filter((c) => c.shiny).length;
    const rows = [
      ['Turn reached', this.turn],
      ['Blocks broken', s.blocks],
      ['Beasts defeated', s.beasts],
      ['Gods defeated', s.gods],
      ['Spells cast', s.spells],
      ['Best launch', tr('{0} blocks', s.bestShot)],
      ['Captures', shinies ? `${this.runCaptures.length} (${tr('{0} gold', shinies)})` : this.runCaptures.length]
    ];
    const sy = py + 140;
    const line = this.add.graphics();
    line.fillStyle(0xd8dce8);
    rows.forEach(([label, value], i) => {
      const y = sy + i * 26;
      card.add(bodyText(this, px + 18, y, label, 8, COLORS.inkHex).setOrigin(0, 0.5));
      card.add(bodyText(this, px + pw - 18, y, String(value), 8, '#2a6aa8').setOrigin(1, 0.5));
      line.fillRect(px + 14, y + 12, pw - 28, 1);
    });
    card.add(line);
    // Capturas de la partida: miniaturas (hasta 7) y cuántas más
    const cy = sy + rows.length * 26 + 22;
    card.add(text(this, W / 2, cy, this.runCaptures.length ? 'CAPTURED THIS RUN' : 'NO CAPTURES THIS RUN', 8, '#56607c').setOrigin(0.5));
    const shown = this.runCaptures.slice(-7);
    const gap = 38;
    shown.forEach(({ id, shiny }, i) => {
      const x = W / 2 + (i - (shown.length - 1) / 2) * gap;
      const c = creatureById(id);
      if (shiny) card.add(this.add.circle(x, cy + 30, 16, COLORS.gold, 0.45));
      const img = addCreatureImage(this, x, cy + 30, id, shiny, c?.legendary ? 1.4 : 1.8).setAlpha(0);
      card.add(img);
      this.tweens.add({ targets: img, alpha: 1, y: cy + 28, duration: 260, delay: 500 + i * 90 });
    });
    if (this.runCaptures.length > shown.length) {
      card.add(text(this, W / 2, cy + 56, tr('+{0} more', this.runCaptures.length - shown.length), 8, '#56607c').setOrigin(0.5));
    }
    card.add(makeButton(this, W / 2 - 72, py + ph - 34, 128, 34, 'RETRY', () => this.scene.restart({}), { fill: 0x8cdc7c }));
    card.add(makeButton(this, W / 2 + 72, py + ph - 34, 128, 34, 'MENU', () => this.scene.start('title')));
    // Entrada del cartel desde arriba
    card.y = -FULL_H;
    this.tweens.add({ targets: card, y: 0, duration: 520, ease: 'Back.easeOut' });
  }
}
