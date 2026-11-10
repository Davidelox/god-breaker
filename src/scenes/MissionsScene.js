// Pantalla de misiones: pestañas de orígenes (desbloqueos), captura y progreso, con barra de
// avance y la recompensa de cada misión.
import Phaser from 'phaser';
import { W, H } from '../config.js';
import { MISSIONS, missionProgress, claimMissions } from '../data/missions.js';
import { TYPES, hexToNum } from '../data/types.js';
import { BALL_TYPES } from '../data/balls.js';
import { TITLES, avatarName } from '../data/profile.js';
import { text, makeButton, drawPanel, fitCamera, fullRect, COLORS } from '../gfx/ui.js';
import { t as tr } from '../i18n.js';

const PER_PAGE = 6;
const ROW_H = 72;
const TABS = [
  ['desbloqueo', 'ORIGINS'],
  ['captura', 'CAPTURE'],
  ['progreso', 'PROGRESS']
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
    claimMissions(this.save); // las ya cumplidas se marcan (y dan su recompensa) al entrar
    fitCamera(this);
    fullRect(this, COLORS.night);
    const done = MISSIONS.filter((m) => this.save.data.missions[m.id]).length;
    text(this, W / 2, 20, 'MISSIONS', 16, COLORS.goldHex).setOrigin(0.5);
    text(this, W / 2, 44, tr('Completed {0}/{1}', done, MISSIONS.length), 8, '#a8b4cc').setOrigin(0.5);
    this.tabButtons = TABS.map(([id, label], i) =>
      makeButton(this, W / 2 + (i - 1) * 106, 74, 100, 30, label, () => {
        this.tab = id;
        this.page = 0;
        this.render();
      })
    );
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

  render() {
    this.layer.removeAll(true);
    TABS.forEach(([id], i) => this.tabButtons[i].setSelected(this.tab === id));
    const list = this.list();
    const pages = Math.ceil(list.length / PER_PAGE);
    this.pageText.setText(`${this.page + 1} / ${pages}`);
    list.slice(this.page * PER_PAGE, (this.page + 1) * PER_PAGE).forEach((m, i) => {
      const y = 100 + i * ROW_H;
      const completed = !!this.save.data.missions[m.id];
      const value = missionProgress(m, this.save.data);
      const g = this.add.graphics();
      drawPanel(g, 14, y, W - 28, ROW_H - 8, { fill: completed ? 0xfff4c8 : COLORS.paper });
      // Barra de progreso
      const bw = W - 120;
      g.fillStyle(0x283048);
      g.fillRect(28, y + 38, bw, 10);
      g.fillStyle(completed ? COLORS.gold : 0x4ce0e8);
      g.fillRect(29, y + 39, (bw - 2) * (value / m.target), 8);
      this.layer.add(g);
      this.layer.add(text(this, 28, y + 14, m.title, 8, COLORS.inkHex).setOrigin(0, 0.5));
      this.layer.add(text(this, W - 28, y + 43, `${value}/${m.target}`, 8, '#56607c').setOrigin(1, 0.5));
      // Recompensa: origen que se desbloquea (con su color) u orbe para la próxima partida
      const r = m.reward;
      if (r?.unlock) {
        const t = TYPES[r.unlock];
        const label = text(this, 36, y + 27, tr(completed ? 'Unlocked: {0}' : 'Unlocks {0}', tr(t.name)), 8, '#ffffff').setOrigin(0, 0.5);
        const chip = this.add.rectangle(30, y + 27, label.width + 12, 13, hexToNum(completed ? t.base : t.dark)).setOrigin(0, 0.5);
        this.layer.add([chip, label]);
      } else if (r?.title || r?.avatar) {
        const what = r.title ? tr('Title: {0}', tr(TITLES[r.title])) : tr('Pet: {0}', tr(avatarName(r.avatar)));
        this.layer.add(text(this, 28, y + 27, what, 8, r.title ? '#b07800' : '#7a4ac0').setOrigin(0, 0.5));
      } else if (r?.orb) {
        this.layer.add(text(this, 28, y + 27, completed ? tr('Reward received') : tr('Reward: +1 {0} orb', tr(BALL_TYPES[r.orb].name)), 8, r.orb === 'ultra' ? '#b07800' : '#7a4ac0').setOrigin(0, 0.5));
      }
      if (completed) {
        const star = this.add.image(W - 34, y + 18, 'spark').setScale(2.4).setTint(0xd08800);
        this.layer.add(star);
        this.tweens.add({ targets: star, angle: 90, duration: 1600, repeat: -1 });
      }
    });
    this.layer.add(text(this, W / 2, H - 98, this.tab === 'desbloqueo' ? 'Unlock new origins by completing these missions.' : this.tab === 'captura' ? 'Earn titles to show on the main menu.' : 'Earn pets: they also change your common orb.', 8, '#a8b4cc', { wordWrap: { width: W - 40 } }).setOrigin(0.5));
  }
}
