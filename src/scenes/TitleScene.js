import Phaser from 'phaser';
import { W, H, FULL_H, SAFE_TOP, SAFE_BOTTOM } from '../config.js';
import { VERSION } from '../version.js';
import { CREATURES, LEGENDARIES, creatureById } from '../data/creatures.js';
import { loadRun, clearRun } from '../core/run.js';
import { claimMissions } from '../data/missions.js';
import { TYPES } from '../data/types.js';
import { addCreatureImage, avatarKey, setCommonOrb } from '../gfx/sprites.js';
import { TITLES, AVATARS, AVATAR_STYLES, DEFAULT_TITLE, currentTitle, currentAvatar, avatarName, avatarOrb } from '../data/profile.js';
import { MISSIONS } from '../data/missions.js';
import { text, makeButton, makePanel, makeAudioToggles, makeLangToggle, fitCamera, fullRect, COLORS } from '../gfx/ui.js';
import { t as tr, godOf } from '../i18n.js';
import { pick, shuffle } from '../core/rng.js';
import { audio } from '../audio/audio.js';

// Estilo épico del menú principal: botón principal de oro y el resto oscuros con borde dorado
const GOLD_BTN = { fill: 0xffd84a, border: 0x6a3e0c, textColor: '#3a1c04' };
const DARK_BTN = { fill: 0x2a1e44, border: 0xd8a030, textColor: '#ffe27a' };
const SOFT_BTN = { fill: 0x161c34, border: 0x8a6a30, textColor: '#e8dcc0' };
const RED_BTN = { fill: 0x4a1418, border: 0xc04040, textColor: '#ffb8b0' };
const EPIC_PANEL = { fill: 0x1a1430, border: 0xd8a030 };

/**
 * Texto del logo dibujado en un lienzo propio: sombra, contorno, degradado y grietas oscuras con
 * borde claro que solo se pintan sobre las letras (source-atop).
 */
function logoTexture(scene, key, str, size, stops, strokeColor, strokeW, shadowY, cracks, { inner = null, depth = 0, depthColor = '#000' } = {}) {
  if (scene.textures.exists(key)) scene.textures.remove(key);
  const font = `${size}px "Press Start 2P"`;
  const probe = document.createElement('canvas').getContext('2d');
  probe.font = font;
  const tw = Math.ceil(probe.measureText(str).width);
  const pad = strokeW + 4;
  const canvas = document.createElement('canvas');
  canvas.width = tw + pad * 2;
  canvas.height = size + pad * 2 + shadowY + depth;
  const ctx = canvas.getContext('2d');
  ctx.font = font;
  ctx.textBaseline = 'top';
  ctx.lineJoin = 'round';
  const x = pad, y = pad;
  // Sombra
  ctx.fillStyle = '#05060c';
  ctx.strokeStyle = '#05060c';
  ctx.lineWidth = strokeW;
  ctx.strokeText(str, x, y + shadowY);
  ctx.fillText(str, x, y + shadowY);
  // Relieve: capas oscuras hacia abajo (letras talladas con volumen)
  for (let d = depth; d >= 1; d--) {
    ctx.strokeStyle = depthColor;
    ctx.fillStyle = depthColor;
    ctx.strokeText(str, x, y + d);
    ctx.fillText(str, x, y + d);
  }
  // Contorno exterior, contorno interior (aro de color) y relleno con degradado
  ctx.strokeStyle = strokeColor;
  ctx.strokeText(str, x, y);
  if (inner) {
    ctx.lineWidth = Math.max(2, strokeW * 0.45);
    ctx.strokeStyle = inner;
    ctx.strokeText(str, x, y);
    ctx.lineWidth = strokeW;
  }
  const grd = ctx.createLinearGradient(0, y, 0, y + size);
  stops.forEach((c, i) => grd.addColorStop(i / (stops.length - 1), c));
  ctx.fillStyle = grd;
  ctx.fillText(str, x, y);
  // Grietas: zigzag de arriba abajo con alguna rama, solo sobre las letras
  ctx.globalCompositeOperation = 'source-atop';
  let seed = size * 31 + str.length;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const unit = Math.max(2, Math.round(size / 12));
  for (let k = 0; k < cracks; k++) {
    let cx2 = x + tw * ((k + 0.5) / cracks) + (rnd() - 0.5) * tw * 0.15;
    let cy2 = y - 2;
    const pts = [[cx2, cy2]];
    while (cy2 < y + size) {
      cx2 += (rnd() - 0.5) * size * 0.35;
      cy2 += size * (0.15 + rnd() * 0.15);
      pts.push([cx2, cy2]);
    }
    const line = (p2, w, color, dx = 0) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = w;
      ctx.beginPath();
      p2.forEach(([px, py], i) => (i ? ctx.lineTo(px + dx, py) : ctx.moveTo(px + dx, py)));
      ctx.stroke();
    };
    line(pts, unit, 'rgba(40,16,2,0.9)');
    line(pts, Math.max(1, unit / 2), 'rgba(255,250,220,0.55)', unit);
    // Rama corta
    const [bx, byy] = pts[1 + Math.floor(rnd() * (pts.length - 2))] ?? pts[0];
    line([[bx, byy], [bx + (rnd() < 0.5 ? -1 : 1) * size * 0.3, byy + size * 0.18]], Math.max(1, unit - 1), 'rgba(40,16,2,0.85)');
  }
  ctx.globalCompositeOperation = 'source-over';
  scene.textures.addCanvas(key, canvas);
  return key;
}

const upper = (str) => str.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase();

export default class TitleScene extends Phaser.Scene {
  constructor() {
    super('title');
  }

  create() {
    const save = this.registry.get('save');
    claimMissions(save); // misiones ya cumplidas: se marcan y dan su recompensa
    fitCamera(this);
    this.drawBackdrop();
    audio.setTrack('ambient');

    this.drawLogo();
    this.createShowcase(save);
    this.createProfile(save);

    makePanel(this, 40, 312, W - 80, 64, EPIC_PANEL);
    const { caught, total } = save.counts();
    // Partida guardada automáticamente: CONTINUE la sigue, NEW GAME la abandona
    const run = loadRun(undefined, (id) => !!creatureById(id));
    text(this, W / 2, 330, run ? tr('BEST {0}  RUN: TURN {1}', save.data.bestScore, run.turn) : tr('BEST  {0}', save.data.bestScore), 8, '#ffe27a').setOrigin(0.5);
    text(this, W / 2, 352, tr('COLLECTION {0}/{1}  CAUGHT {2}', caught, CREATURES.length, total), 8, '#e8dcc0').setOrigin(0.5);

    if (run) {
      makeButton(this, W / 2, 404, 200, 40, 'CONTINUE', () => this.scene.start('game', { resume: true }), { size: 16, ...GOLD_BTN });
      makeButton(this, W / 2 - 52, 452, 96, 34, 'NEW GAME', () => this.confirmNewGame(save, run), DARK_BTN);
      makeButton(this, W / 2 + 52, 452, 96, 34, 'COLLECTION', () => this.scene.start('collection'), DARK_BTN);
    } else {
      makeButton(this, W / 2, 404, 200, 40, 'PLAY', () => this.scene.start('game', {}), { size: 16, ...GOLD_BTN });
      makeButton(this, W / 2, 452, 200, 34, 'COLLECTION', () => this.scene.start('collection'), DARK_BTN);
    }
    makeButton(this, W / 2, 494, 200, 34, 'MISSIONS', () => this.scene.start('missions'), DARK_BTN);
    makeAudioToggles(this, 542, save, SOFT_BTN);
    // Idioma: inglés / español (se redibuja el menú con el nuevo idioma)
    makeLangToggle(this, W / 2, 581, 280, save, () => this.scene.restart(), SOFT_BTN);

    // Abajo: el tutorial (antes «Guía») junto a borrar progreso
    makeButton(this, 8 + 64, H - 22, 128, 26, 'TUTORIAL', () => this.scene.start('guide'), DARK_BTN);
    makeButton(this, W - 8 - 78, H - 22, 156, 26, 'RESET PROGRESS', () => this.confirmReset(save), RED_BTN);
    text(this, W / 2, this.pedimentY, `v${VERSION}`, 8, '#6a4a2a').setOrigin(0.5);

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

  /** Logo «GOD BREAKER»: letras agrietadas sobre una tablilla de piedra, rayos girando y destellos. */
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

    // Tablilla de piedra con borde de oro y grietas, donde va tallado el título
    const tablet = this.drawTablet(20, 36, W - 40, 140);
    tablet.setAlpha(0);
    this.tweens.add({ targets: tablet, alpha: 1, duration: 500, delay: 200 });
    this.pedimentY = 36 + 140 - 10; // número de versión, abajo de la tablilla

    // Laureles dorados a ambos lados de «GOD»
    const laurel = this.add.graphics();
    for (const side of [-1, 1]) {
      // Rama curva de abajo arriba, con hojas alternas a cada lado
      const at = (t) => [cx + side * (84 + 12 * Math.sin(t * Math.PI)), gy + 30 - t * 60];
      for (let i = 0; i <= 20; i++) {
        const [x, y] = at(i / 20);
        laurel.fillStyle(0x3a1c04);
        laurel.fillRect(x - 1.5, y - 1.5, 3, 3);
        laurel.fillStyle(0xc08a20);
        laurel.fillRect(x - 0.5, y - 0.5, 1, 1);
      }
      for (let i = 0; i < 6; i++) {
        const [x, y] = at(0.08 + i * 0.16);
        for (const out of [1, -1]) {
          const lx = x + side * out * 6, ly = y - 3;
          laurel.fillStyle(0x3a1c04);
          laurel.fillEllipse(lx, ly, 11, 7);
          laurel.fillStyle(out > 0 ? 0xffd84a : 0xc08a20);
          laurel.fillEllipse(lx, ly, 8, 4);
        }
      }
      // Lazo y rombo dorado bajo cada rama
      const [bx, byy] = at(0);
      laurel.fillStyle(0x6a3e0c);
      laurel.fillTriangle(bx - 5, byy + 2, bx, byy + 10, bx + 5, byy + 2);
      laurel.fillStyle(0xffd84a);
      laurel.fillTriangle(bx - 3, byy + 3, bx, byy + 8, bx + 3, byy + 3);
    }
    laurel.setAlpha(0);
    this.tweens.add({ targets: laurel, alpha: 1, duration: 600, delay: 450 });

    // «GOD»: oro con degradado, contorno grueso, sombra y grietas (bloques que se rompen)
    const god = this.add.image(cx, gy, logoTexture(this, 'logo_god', 'GOD', 48, ['#fff8d0', '#ffd84a', '#e8a020', '#8a4a08'], '#2a1002', 10, 6, 4, { inner: '#fff0a0', depth: 5, depthColor: '#5a2c04' }));
    // «BREAKER»: plata azulada, también agrietada
    // «BREAKER»: azul lapislázuli con aro de oro, también agrietada
    const breaker = this.add.image(cx, by, logoTexture(this, 'logo_breaker', 'BREAKER', 24, ['#d8e4ff', '#7c9cf0', '#3c58c0', '#1c2c7c'], '#0c1020', 7, 3, 3, { inner: '#d8a030', depth: 3, depthColor: '#0c1020' }));

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
    this.tweens.add({ targets: breaker, alpha: 1, y: by, duration: 380, delay: 380, ease: 'Quad.easeOut' });

    // Trocitos que se desprenden de las grietas de vez en cuando
    this.time.addEvent({
      delay: 900, loop: true, callback: () => {
        const x = cx + Phaser.Math.Between(-60, 60), y = gy + 20;
        const chip = this.add.rectangle(x, y, 3, 3, Math.random() < 0.5 ? 0xf0b030 : 0x6a3e0c).setDepth(4);
        this.tweens.add({ targets: chip, y: y + 40 + Math.random() * 30, x: x + Phaser.Math.Between(-10, 10), angle: 180, alpha: 0, duration: 900, ease: 'Quad.easeIn', onComplete: () => chip.destroy() });
      }
    });

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

  // ---------- Perfil: título y avatar ----------

  /** Retrato del avatar (o el orbe común si no hay) y título del cazador bajo el logo. */
  createProfile(save) {
    setCommonOrb(this, avatarOrb(currentAvatar(save.data))?.colors);
    // Cinta con el título elegido
    const ry = 190;
    this.titleText = text(this, W / 2, ry, '', 8, '#ffe27a').setOrigin(0.5).setDepth(3);
    this.titleRibbon = this.add.graphics().setDepth(2);
    const zone = this.add.zone(W / 2, ry, 200, 20).setInteractive({ useHandCursor: true });
    zone.on('pointerup', () => this.openTitlePicker(save));
    this.drawTitleRibbon(save);
    // Retrato del avatar a la izquierda del escaparate
    this.avatarImg = this.add.image(48, 240, '__DEFAULT').setDepth(3);
    this.avatarImg.setInteractive({ useHandCursor: true }).on('pointerup', () => this.openAvatarPicker(save));
    this.drawAvatar(save);
    this.tweens.add({ targets: this.avatarImg, y: 236, duration: 1600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
  }

  drawTitleRibbon(save) {
    const str = tr(currentTitle(save.data)).toUpperCase();
    this.titleText.setText(`« ${str} »`);
    const w = this.titleText.width + 24, h = 16, x = W / 2 - w / 2, y = 190 - h / 2;
    const g = this.titleRibbon;
    g.clear();
    g.fillStyle(0x6a3e0c);
    g.fillTriangle(x - 10, y + 2, x + 2, y + h / 2 + 1, x - 10, y + h);
    g.fillTriangle(x + w + 10, y + 2, x + w - 2, y + h / 2 + 1, x + w + 10, y + h);
    g.fillStyle(0x6a3e0c);
    g.fillRect(x - 1, y - 1, w + 2, h + 2);
    g.fillStyle(0x2a1e44);
    g.fillRect(x, y, w, h);
    g.fillStyle(0xd8a030);
    g.fillRect(x, y, w, 1);
    g.fillRect(x, y + h - 1, w, 1);
  }

  drawAvatar(save) {
    const id = currentAvatar(save.data);
    if (id) {
      const god = LEGENDARIES.find((c) => c.name === AVATARS[id].god) ?? LEGENDARIES[0];
      this.avatarImg.setTexture(avatarKey(this, id, god.id, AVATAR_STYLES[AVATARS[id].style].stops)).setScale(1.1);
    } else {
      this.avatarImg.setTexture('ball_normal').setScale(5);
    }
  }

  /** Capa de selector con panel, título y botón de cerrar. */
  pickerLayer(title) {
    const layer = this.add.container(0, 0).setDepth(60);
    layer.add(fullRect(this, 0x000000, 0.75).setInteractive());
    layer.add(makePanel(this, 12, 40, W - 24, H - 80, EPIC_PANEL));
    layer.add(text(this, W / 2, 60, title, 16, '#ffe27a').setOrigin(0.5));
    layer.add(makeButton(this, W / 2, H - 62, 140, 30, 'CLOSE', () => layer.destroy(), DARK_BTN));
    return layer;
  }

  /** Selector de título: los desbloqueados se pueden elegir; los demás dicen qué misión los da. */
  openTitlePicker(save) {
    const layer = this.pickerLayer('TITLES');
    const ids = [null, ...Object.keys(TITLES)];
    const perPage = 20;
    let page = 0;
    const list = this.add.container(0, 0);
    layer.add(list);
    const pageText = text(this, W / 2, H - 92, '', 8, '#a8b4cc').setOrigin(0.5);
    layer.add(pageText);
    const draw = () => {
      list.removeAll(true);
      ids.slice(page * perPage, (page + 1) * perPage).forEach((id, i) => {
        const x = W / 2 + (i % 2 ? 76 : -76), y = 92 + Math.floor(i / 2) * 30;
        const open = !id || save.data.missions[id];
        const name = id ? TITLES[id] : DEFAULT_TITLE;
        const btn = makeButton(this, x, y, 146, 26, open ? tr(name).toUpperCase() : '???', () => {
          if (!open) {
            const m = MISSIONS.find((mm) => mm.id === id);
            this.toast(tr('Mission: {0}', tr(m?.title ?? '')));
            return;
          }
          save.setProfile('title', id);
          this.drawTitleRibbon(save);
          layer.destroy();
        }, open ? DARK_BTN : SOFT_BTN);
        if (!open) btn.setAlpha(0.5);
        btn.setSelected((save.data.profile.title ?? null) === id && open);
        list.add(btn);
      });
      pageText.setText(`${page + 1} / ${Math.ceil(ids.length / perPage)}`);
    };
    layer.add(makeButton(this, 50, H - 92, 50, 24, '<', () => { page = (page + 1) % 2; draw(); }, DARK_BTN));
    layer.add(makeButton(this, W - 50, H - 92, 50, 24, '>', () => { page = (page + 1) % 2; draw(); }, DARK_BTN));
    draw();
  }

  /** Selector de avatar: retratos desbloqueados (los demás, en silueta). Cambia el orbe común. */
  openAvatarPicker(save) {
    const layer = this.pickerLayer('AVATARS');
    const ids = [null, ...Object.keys(AVATARS)];
    const cols = 4, cw = (W - 40) / cols, ch = 84;
    ids.forEach((id, i) => {
      const x = 20 + cw * (i % cols) + cw / 2, y = 112 + Math.floor(i / cols) * ch;
      const open = !id || save.data.missions[id];
      let img;
      if (id) {
        const god = LEGENDARIES.find((c) => c.name === AVATARS[id].god) ?? LEGENDARIES[0];
        img = this.add.image(x, y, avatarKey(this, id, god.id, AVATAR_STYLES[AVATARS[id].style].stops)).setScale(1.15);
        if (!open) img.setTint(0x2a2440); // bloqueado: retrato en sombra
      } else {
        img = this.add.image(x, y, 'ball').setScale(5).setTint(0x30d8f0); // orbe común de siempre
      }
      const selected = (currentAvatar(save.data) ?? null) === id;
      const ring = this.add.rectangle(x, y, 60, 70).setStrokeStyle(2, selected ? 0xffe27a : 0x000000, selected ? 1 : 0);
      const label = text(this, x, y + 40, id ? (open ? AVATARS[id].god : '???') : tr('Default'), 8, open ? '#e8dcc0' : '#56607c').setOrigin(0.5);
      img.setInteractive({ useHandCursor: true }).on('pointerup', () => {
        if (!open) {
          const m = MISSIONS.find((mm) => mm.id === id);
          this.toast(tr('Mission: {0}', tr(m?.title ?? '')));
          return;
        }
        save.setProfile('avatar', id);
        setCommonOrb(this, avatarOrb(id)?.colors);
        this.drawAvatar(save);
        layer.destroy();
      });
      layer.add([ring, img, label]);
    });
    layer.add(text(this, W / 2, H - 100, 'Your avatar also changes your common orb.', 8, '#a8b4cc', { wordWrap: { width: W - 60 } }).setOrigin(0.5));
  }

  /** Aviso breve encima de todo (en los selectores del perfil). */
  toast(msg) {
    const t = text(this, W / 2, H - 120, msg, 8, '#ffe27a', { wordWrap: { width: W - 60 } }).setOrigin(0.5).setDepth(80).setStroke('#0c1020', 4);
    this.tweens.add({ targets: t, alpha: 0, delay: 1600, duration: 500, onComplete: () => t.destroy() });
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

  /** Tablilla de mármol con borde de oro, remaches, textura de piedra y grietas. */
  drawTablet(x, y, w, h) {
    const g = this.add.graphics();
    // Sombra
    g.fillStyle(0x05060c, 0.6);
    g.fillRect(x + 4, y + 6, w, h);
    // Borde de oro con contorno oscuro
    g.fillStyle(0x6a3e0c);
    g.fillRect(x - 2, y - 2, w + 4, h + 4);
    g.fillStyle(0xd8a030);
    g.fillRect(x, y, w, h);
    g.fillStyle(0xffe27a);
    g.fillRect(x, y, w, 2);
    // Piedra
    const ix = x + 5, iy = y + 5, iw = w - 10, ih = h - 10;
    g.fillStyle(0xc8bca4);
    g.fillRect(ix, iy, iw, ih);
    g.fillStyle(0xe0d6c0);
    g.fillRect(ix, iy, iw, 3);
    g.fillRect(ix, iy, 3, ih);
    g.fillStyle(0x908470);
    g.fillRect(ix, iy + ih - 3, iw, 3);
    g.fillRect(ix + iw - 3, iy, 3, ih);
    // Textura de piedra (fija)
    let seed = 11;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < 90; i++) {
      g.fillStyle(rnd() < 0.5 ? 0xb0a48c : 0xd6ccb6);
      g.fillRect(ix + 4 + Math.floor(rnd() * (iw - 8)), iy + 4 + Math.floor(rnd() * (ih - 8)), 2, 1);
    }
    // Grietas desde los bordes
    const crack = (pts) => {
      g.lineStyle(2, 0x5a4a3a, 0.9);
      g.strokePoints(pts.map(([a, b]) => new Phaser.Math.Vector2(a, b)));
      g.lineStyle(1, 0xf4ecdc, 0.7);
      g.strokePoints(pts.map(([a, b]) => new Phaser.Math.Vector2(a + 2, b)));
    };
    crack([[ix + 40, iy], [ix + 46, iy + 14], [ix + 40, iy + 24], [ix + 48, iy + 36]]);
    crack([[ix + iw - 60, iy + ih], [ix + iw - 66, iy + ih - 14], [ix + iw - 58, iy + ih - 22]]);
    crack([[ix, iy + ih - 30], [ix + 12, iy + ih - 26], [ix + 18, iy + ih - 34]]);
    crack([[ix + iw, iy + 24], [ix + iw - 12, iy + 30], [ix + iw - 16, iy + 42], [ix + iw - 26, iy + 46]]);
    // Esquina rota (arriba a la derecha) y remaches de oro en las otras
    g.fillStyle(0x0c0e22);
    g.fillTriangle(x + w - 22, y - 2, x + w + 2, y - 2, x + w + 2, y + 20);
    g.fillStyle(0xd8a030);
    g.fillTriangle(x + w - 22, y, x + w, y + 20, x + w - 26, y + 4);
    for (const [rx, ry] of [[x + 8, y + 8], [x + 8, y + h - 12], [x + w - 12, y + h - 12]]) {
      g.fillStyle(0x6a3e0c);
      g.fillRect(rx - 1, ry - 1, 6, 6);
      g.fillStyle(0xffd84a);
      g.fillRect(rx, ry, 4, 4);
    }
    return g;
  }

  /**
   * Fondo: ruinas flotantes. Cielo nocturno con estrellas y constelaciones, columnas rotas a los
   * lados, trozos de mármol (algunos de oro) que flotan despacio y una isla de piedra abajo.
   */
  drawBackdrop() {
    const top = -SAFE_TOP, bottom = H + SAFE_BOTTOM, full = bottom - top;
    const g = this.add.graphics();
    const sky = [[0, 0x070818], [0.45, 0x121034], [0.8, 0x221840], [1, 0x2c1c46]];
    const mix = (a, b, f) => {
      const ca = Phaser.Display.Color.IntegerToColor(a), cb = Phaser.Display.Color.IntegerToColor(b);
      const c = Phaser.Display.Color.Interpolate.ColorWithColor(ca, cb, 100, f * 100);
      return Phaser.Display.Color.GetColor(c.r, c.g, c.b);
    };
    for (let y = top; y < bottom; y += 4) {
      const f = (y - top) / full;
      let i = 0;
      while (i < sky.length - 2 && f > sky[i + 1][0]) i++;
      const [f0, c0] = sky[i], [f1, c1] = sky[i + 1];
      g.fillStyle(mix(c0, c1, Math.min(1, (f - f0) / (f1 - f0))));
      g.fillRect(0, y, W, 4);
    }
    // Estrellas (fijas)
    let seed = 7;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < 90; i++) {
      const x = Math.floor(rnd() * W), y = top + Math.floor(rnd() * full * 0.8);
      g.fillStyle(0xffffff, 0.2 + rnd() * 0.6);
      g.fillRect(x, y, rnd() < 0.12 ? 2 : 1, rnd() < 0.12 ? 2 : 1);
    }
    // Constelaciones (líneas violetas que unen estrellas)
    const constellations = [
      [[18, 210], [40, 196], [62, 214], [56, 238]],
      [[W - 70, 250], [W - 46, 232], [W - 22, 246], [W - 30, 272]],
      [[W - 60, top + 30], [W - 36, top + 22], [W - 14, top + 38]]
    ];
    for (const pts of constellations) {
      g.lineStyle(1, 0x8a7ab8, 0.45);
      g.strokePoints(pts.map(([a, b]) => new Phaser.Math.Vector2(a, b)));
      for (const [a, b] of pts) {
        g.fillStyle(0xffffff, 0.9);
        g.fillRect(a - 1, b - 1, 3, 3);
      }
    }
    // Resplandor dorado tras la tablilla
    for (let i = 6; i >= 1; i--) {
      g.fillStyle(0xffc860, 0.025 * i);
      g.fillEllipse(W / 2, 110, 180 + i * 30, 140 + i * 26);
    }
    // Isla de piedra flotando abajo
    const iy = H - 70;
    g.fillStyle(0x1a1430);
    g.fillEllipse(W / 2, iy + 30, W * 1.15, 90);
    g.fillStyle(0x3a2c50);
    g.fillEllipse(W / 2, iy, W * 1.1, 40);
    g.fillStyle(0x5a4870);
    g.fillEllipse(W / 2, iy - 6, W * 1.0, 22);
    // Columnas rotas a los lados (cima irregular)
    const column = (cx, baseY, height) => {
      const cw = 26, topY = baseY - height;
      g.fillStyle(0xe8e0d0, 0.92);
      g.fillRect(cx - cw / 2, topY, cw, height);
      for (let k = 0; k < 3; k++) {
        g.fillStyle(0xb0a690, 0.92);
        g.fillRect(cx - cw / 2 + 5 + k * 7, topY + 6, 2, height - 10);
      }
      g.fillStyle(0x8a8070, 0.92);
      g.fillRect(cx + cw / 2 - 4, topY, 4, height);
      // Rotura: dientes de distinta altura
      g.fillStyle(0xe8e0d0, 0.92);
      g.fillTriangle(cx - cw / 2, topY, cx - cw / 2 + 9, topY - 10, cx - cw / 2 + 14, topY);
      g.fillTriangle(cx - 2, topY, cx + 5, topY - 6, cx + cw / 2, topY);
      // Basa
      g.fillStyle(0xd8d0c0, 0.95);
      g.fillRect(cx - cw / 2 - 5, baseY - 8, cw + 10, 8);
      g.fillStyle(0xd8a030);
      g.fillRect(cx - cw / 2 - 5, baseY - 8, cw + 10, 2);
    };
    column(26, iy - 4, 190);
    column(W - 26, iy - 4, 130);
    // Trozos de mármol (y alguno de oro) que flotan despacio
    const pieces = [
      [54, 200, 12, false], [W - 60, 190, 10, true], [30, 300, 9, false], [W - 34, 312, 14, false],
      [70, 420, 8, true], [W - 72, 440, 10, false], [18, 520, 11, false], [W - 20, 540, 9, true]
    ];
    pieces.forEach(([x, y, size, gold], i) => {
      const piece = this.add.graphics({ x, y });
      piece.fillStyle(gold ? 0x6a3e0c : 0x7a7060);
      piece.fillRect(-size / 2 - 1, -size / 2 - 1, size + 2, size * 0.8 + 2);
      piece.fillStyle(gold ? 0xd8a030 : 0xcfc6b4);
      piece.fillRect(-size / 2, -size / 2, size, size * 0.8);
      piece.fillStyle(gold ? 0xffe27a : 0xe8e0d0);
      piece.fillRect(-size / 2, -size / 2, size, 2);
      piece.setAngle((i % 2 ? 1 : -1) * (8 + i * 3));
      this.tweens.add({ targets: piece, y: y - 5 - (i % 3) * 2, angle: piece.angle + (i % 2 ? 10 : -10), duration: 2600 + i * 300, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    });
  }
}
