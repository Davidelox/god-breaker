// Pantalla de estadísticas: récords (mejores marcas) y totales acumulados, en dos pestañas.
import Phaser from 'phaser';
import { W, H } from '../config.js';
import { CREATURES, LEGENDARIES } from '../data/creatures.js';
import { MISSIONS, unlockedOrigins } from '../data/missions.js';
import { TYPE_ORDER } from '../data/types.js';
import { unlockedTitles, unlockedAvatars, TITLES, AVATARS } from '../data/profile.js';
import { text, makeButton, drawPanel, fitCamera, fullRect, COLORS } from '../gfx/ui.js';
import { t as tr } from '../i18n.js';

const fmt = (n) => String(Math.floor(n ?? 0)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
const ROW_H = 36;
const DARK_BTN = { fill: 0x2a1e44, border: 0xd8a030, textColor: '#ffe27a' };

export default class StatsScene extends Phaser.Scene {
  constructor() {
    super('stats');
  }

  init() {
    this.tab = 'records';
  }

  create() {
    this.save = this.registry.get('save');
    fitCamera(this);
    fullRect(this, COLORS.night);
    text(this, W / 2, 20, 'STATISTICS', 16, COLORS.goldHex).setOrigin(0.5);
    this.tabButtons = [['records', 'RECORDS'], ['totals', 'TOTALS']].map(([id, label], i) =>
      makeButton(this, W / 2 + (i ? 72 : -72), 56, 136, 30, label, () => {
        this.tab = id;
        this.render();
      }, DARK_BTN)
    );
    this.layer = this.add.container(0, 0);
    makeButton(this, W / 2, H - 30, 150, 34, 'BACK', () => this.scene.start('title'), DARK_BTN);
    this.input.keyboard?.on('keydown-ESC', () => this.scene.start('title'));
    this.render();
  }

  rows() {
    const d = this.save.data, s = d.stats;
    const col = Object.values(d.collection);
    const caught = col.length;
    const gold = col.filter((e) => e.shinyCount > 0).length;
    const gods = LEGENDARIES.filter((c) => d.collection[c.id]).length;
    const godCaps = LEGENDARIES.reduce((n, c) => n + (d.collection[c.id]?.count ?? 0), 0);
    const missions = MISSIONS.filter((m) => d.missions[m.id]).length;
    if (this.tab === 'records') {
      return [
        ['Highest score', fmt(d.bestScore)],
        ['Highest turn', fmt(s.bestTurn)],
        ['Highest turn without spells', fmt(s.bestNoMagicTurn)],
        ['Blocks destroyed in a single shot', fmt(s.bestShotKills)],
        ['Captures in a single shot', fmt(s.bestShotCaptures)],
        ['Blocks destroyed in a game', fmt(s.bestRunBlocks)],
        ['Creatures destroyed in a game', fmt(s.bestRunBeasts)],
        ['Captures in a game', fmt(s.bestRunCaptures)],
        ['Gods destroyed in a game', fmt(s.bestRunGodKills)],
        ['Gods captured in a game', fmt(s.bestRunGodCaptures)],
        ['Spells cast in a game', fmt(s.bestRunSpells)],
        ['Board clears in a single game', fmt(s.bestRunClears)],
        ['Spell combos in a single game', fmt(s.bestRunCombos)]
      ];
    }
    return [
      ['Games played', fmt(s.games)],
      ['Captures', fmt(Math.max(0, s.captures - s.shinies))],
      ['Different beasts', `${caught}/${CREATURES.length}`],
      ['Gold captures', `${gold}/${CREATURES.length}`],
      ['Gods captured', `${gods}/${LEGENDARIES.length}`],
      ['God captures (with repeats)', fmt(godCaps)],
      ['Gods defeated', fmt(s.bossKills)],
      ['Gods defeated with MAX', fmt(s.maxBossKills)],
      ['Board clears', fmt(s.clears)],
      ['Spells cast', fmt(s.powersUsed)],
      ['Vertical strikes', fmt(s.verticalAttacks)],
      ['Missions completed', `${missions}/${MISSIONS.length}`],
      ['Origins unlocked', `${unlockedOrigins(d).size}/${TYPE_ORDER.length}`],
      ['Titles', `${unlockedTitles(d).length}/${Object.keys(TITLES).length}`],
      ['Companions', `${unlockedAvatars(d).length}/${Object.keys(AVATARS).length}`]
    ];
  }

  render() {
    this.layer.removeAll(true);
    this.tabButtons[0].setSelected(this.tab === 'records');
    this.tabButtons[1].setSelected(this.tab === 'totals');
    const rows = this.rows();
    const top = 84, rowH = Math.min(ROW_H, Math.floor((H - 70 - top) / rows.length));
    const g = this.add.graphics();
    drawPanel(g, 14, top, W - 28, rows.length * rowH + 12, { fill: 0x1a1430, border: 0xd8a030 });
    this.layer.add(g);
    rows.forEach(([label, value], i) => {
      const y = top + 6 + i * rowH + rowH / 2;
      if (i % 2) {
        g.fillStyle(0xffffff, 0.04);
        g.fillRect(18, y - rowH / 2, W - 36, rowH);
      }
      this.layer.add(text(this, 26, y, tr(label), 8, '#e8dcc0', { align: 'left', lineSpacing: 3, wordWrap: { width: W - 130 } }).setOrigin(0, 0.5));
      this.layer.add(text(this, W - 26, y, value, 8, COLORS.goldHex).setOrigin(1, 0.5));
    });
  }
}
