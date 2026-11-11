// Pantalla de misiones: pestañas de orígenes (desbloqueos), captura y progreso, con barra de
// avance y la recompensa de cada misión.
import Phaser from 'phaser';
import { W, H } from '../config.js';
import { MISSIONS, missionProgress, claimMissions, claimableMissions, claimReward, isOriginMission } from '../data/missions.js';
import { hasRun } from '../core/run.js';
import { TYPES, hexToNum } from '../data/types.js';
import { BALL_TYPES } from '../data/balls.js';
import { TITLES, avatarName } from '../data/profile.js';
import { text, makeButton, drawPanel, fitCamera, fullRect, showTip, COLORS } from '../gfx/ui.js';
import { audio } from '../audio/audio.js';
import { t as tr } from '../i18n.js';

/** Número corto para el avance: 950, 3.5K, 75K. */
const short = (n) => (n < 1000 ? String(n) : n < 10000 ? `${Math.floor(n / 100) / 10}K` : `${Math.floor(n / 1000)}K`);

const PER_PAGE = 6;
// Largo fijo de la barra de avance: deja sitio a la derecha para «150K/150K»
const BAR_W = W - 56 - 82;
const ROW_H = 72;
const TABS = [
  ['desbloqueo', 'ORIGINS'],
  ['captura', 'CAPTURE'],
  ['progreso', 'SPECIALS']
];

export default class MissionsScene extends Phaser.Scene {
  constructor() {
    super('missions');
  }

  init() {
    this.tab = 'desbloqueo';
    this.page = 0;
  }

  create() {
    this.save = this.registry.get('save');
    this.running = hasRun();
    claimMissions(this.save, { origins: !this.running }); // las de orígenes esperan a que acabe la partida
    fitCamera(this);
    fullRect(this, COLORS.night);
    text(this, W / 2, 20, 'MISSIONS', 16, COLORS.goldHex).setOrigin(0.5);
    this.doneText = text(this, W / 2, 44, '', 8, '#a8b4cc').setOrigin(0.5);
    this.tabButtons = TABS.map(([id, label], i) =>
      makeButton(this, W / 2 + (i - 1) * 106, 74, 100, 30, label, () => {
        this.tab = id;
        this.page = 0;
        this.render();
      })
    );
    this.badges = this.add.container(0, 0).setDepth(5);
    this.layer = this.add.container(0, 0);
    this.pageText = text(this, W / 2, H - 62, '', 8, '#a8b4cc').setOrigin(0.5);
    makeButton(this, 44, H - 30, 56, 34, '<', () => this.go(-1), { size: 16 });
    makeButton(this, W / 2, H - 30, 150, 34, 'BACK', () => this.scene.start('title'));
    makeButton(this, W - 44, H - 30, 56, 34, '>', () => this.go(1), { size: 16 });
    this.input.keyboard?.on('keydown-ESC', () => this.scene.start('title'));
    this.render();
  }

  list() {
    return MISSIONS.filter((m) => m.cat === this.tab);
  }

  go(d) {
    const pages = Math.ceil(this.list().length / PER_PAGE);
    this.page = (this.page + d + pages) % pages;
    this.render();
  }

  /** Globos con las recompensas por cobrar de cada pestaña. */
  drawBadges() {
    this.badges.removeAll(true);
    const pending = claimableMissions(this.save.data);
    TABS.forEach(([id], i) => {
      const n = pending.filter((m) => m.cat === id).length;
      if (!n) return;
      const x = W / 2 + (i - 1) * 106 + 46, y = 60;
      this.badges.add([this.add.circle(x, y, 9, 0xd83030).setStrokeStyle(2, 0x101828), text(this, x, y, String(n), 8, '#ffffff').setOrigin(0.5)]);
    });
  }

  /** Cobra la recompensa de una misión completada al pulsarla. */
  claim(m, x, y) {
    const done = claimReward(this.save, m.id);
    if (!done) return;
    audio.play('mission');
    const r = m.reward;
    const what = r.title ? tr('New title: {0}!', tr(TITLES[r.title])) : r.avatar ? tr('New companion: {0}!', tr(avatarName(r.avatar))) : tr('+1 {0} orb for your next game', tr(BALL_TYPES[r.orb].name));
    for (let i = 0; i < 8; i++) {
      const sp = this.add.image(x, y, 'spark').setScale(1.8).setTint(0xffd84a).setDepth(20);
      const a = (i / 8) * Math.PI * 2;
      this.tweens.add({ targets: sp, x: x + Math.cos(a) * 46, y: y + Math.sin(a) * 26, alpha: 0, duration: 520, ease: 'Quad.easeOut', onComplete: () => sp.destroy() });
    }
    this.render();
    showTip(this, W / 2, y - 6, what, { gap: 14 });
  }

  render() {
    this.layer.removeAll(true);
    this.drawBadges();
    const done = MISSIONS.filter((m) => this.save.data.missions[m.id]).length;
    this.doneText.setText(tr('Completed {0}/{1}', done, MISSIONS.length));
    TABS.forEach(([id], i) => this.tabButtons[i].setSelected(this.tab === id));
    const list = this.list();
    const pages = Math.ceil(list.length / PER_PAGE);
    this.pageText.setText(`${this.page + 1} / ${pages}`);
    list.slice(this.page * PER_PAGE, (this.page + 1) * PER_PAGE).forEach((m, i) => {
      const y = 100 + i * ROW_H;
      const completed = !!this.save.data.missions[m.id];
      const claimable = completed && !isOriginMission(m) && !this.save.data.claimed[m.id];
      const value = missionProgress(m, this.save.data);
      const g = this.add.graphics();
      drawPanel(g, 14, y, W - 28, ROW_H - 8, { fill: claimable ? 0xc8f0b8 : completed ? 0xfff4c8 : COLORS.paper, border: claimable ? 0x2a8a40 : COLORS.ink });
      this.layer.add(g);
      // Título: si no cabe en una línea, pasa a dos (más juntas)
      const title = text(this, 28, y + 17, m.title, 8, COLORS.inkHex, { align: 'left', lineSpacing: 3, wordWrap: { width: W - 92 } }).setOrigin(0, 0.5);
      if (title.height > 14) title.setOrigin(0, 0).setY(y + 6);
      this.layer.add(title);
      // Avance a la derecha (en corto: 3.5K/75K); la barra mide siempre lo mismo
      const by = y + 44;
      this.layer.add(text(this, W - 28, by, `${short(value)}/${short(m.target)}`, 8, '#56607c').setOrigin(1, 0.5));
      const bx = 28, bw = BAR_W;
      const r = m.reward;
      const waiting = !completed && r?.unlock && this.running && value >= m.target;
      // Barra ancha (completada): la recompensa va escrita dentro; si no, barra fina de avance
      let inside = null, fillCol = 0x4ce0e8, textCol = '#ffffff';
      if (claimable) { inside = tr('Claim!'); fillCol = 0x2a8a40; }
      else if (waiting) { inside = tr('When your game ends'); fillCol = 0x56607c; }
      else if (completed && r?.unlock) { const t = TYPES[r.unlock]; inside = tr(t.name); fillCol = hexToNum(t.base); }
      else if (completed && r?.title) { inside = tr(TITLES[r.title]); fillCol = COLORS.gold; textCol = '#4a3000'; }
      else if (completed && r?.avatar) { inside = tr(avatarName(r.avatar)); fillCol = 0x7a4ac0; }
      else if (completed && r?.orb) { inside = tr('Reward received'); fillCol = COLORS.gold; textCol = '#4a3000'; }
      if (inside) {
        g.fillStyle(0x283048);
        g.fillRect(bx, by - 7, bw, 14);
        g.fillStyle(fillCol);
        g.fillRect(bx + 1, by - 6, bw - 2, 12);
        g.fillStyle(0xffffff, 0.3);
        g.fillRect(bx + 1, by - 6, bw - 2, 1);
        const lbl = text(this, bx + bw / 2, by, inside, 8, textCol).setOrigin(0.5);
        if (lbl.width > bw - 6) lbl.setScale((bw - 6) / lbl.width);
        this.layer.add(lbl);
        if (claimable) this.tweens.add({ targets: lbl, alpha: 0.35, duration: 520, yoyo: true, repeat: -1 });
      } else {
        g.fillStyle(0x283048);
        g.fillRect(bx, by - 3, bw, 6);
        g.fillStyle(0x4ce0e8);
        g.fillRect(bx + 1, by - 2, Math.max(0, (bw - 2) * (value / m.target)), 4);
      }
      if (claimable) {
        // Completada y sin cobrar: se pulsa para recibir la recompensa (sorpresa hasta entonces)
        const hit = this.add.zone(W / 2, y + (ROW_H - 8) / 2, W - 28, ROW_H - 8).setInteractive({ useHandCursor: true });
        hit.on('pointerup', () => this.claim(m, W / 2, y + 28));
        this.layer.add(hit);
        const gift = this.add.image(W - 34, y + 16, 'spark').setScale(2.6).setTint(0x2a8a40);
        this.layer.add(gift);
        this.tweens.add({ targets: gift, scale: 3.2, duration: 420, yoyo: true, repeat: -1 });
        return;
      }
      if (completed) {
        const star = this.add.image(W - 34, y + 16, 'spark').setScale(2.4).setTint(0xd08800);
        this.layer.add(star);
        this.tweens.add({ targets: star, angle: 90, duration: 1600, repeat: -1 });
      }
    });
    const hint = this.tab === 'desbloqueo'
      ? 'Origins unlock when the game in which you complete them ends.'
      : this.tab === 'captura' ? 'Tap completed missions to claim their title.' : 'Tap completed missions to claim their companion.';
    this.layer.add(text(this, W / 2, H - 98, hint, 8, '#a8b4cc', { wordWrap: { width: W - 40 } }).setOrigin(0.5));
  }
}
