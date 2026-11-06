import Phaser from 'phaser';
import { W, H, RARITY_NAMES } from '../config.js';
import { CREATURES } from '../data/creatures.js';
import { TYPES, hexToNum } from '../data/types.js';
import { creatureKey } from '../gfx/sprites.js';
import { text, makeButton, makePanel, COLORS } from '../gfx/ui.js';

const GRID_COLS = 5;
const CELL_W = 68;
const CELL_H = 62;
const GRID_X = (W - GRID_COLS * CELL_W) / 2;
const GRID_Y = 76;
const GRID_ROWS = 7;
const PER_PAGE = GRID_COLS * GRID_ROWS;

export default class CollectionScene extends Phaser.Scene {
  constructor() {
    super('collection');
  }

  init() {
    this.showShiny = false;
    this.page = 0;
  }

  create() {
    this.save = this.registry.get('save');
    this.add.rectangle(0, 0, W, H, COLORS.night).setOrigin(0);

    const { caught, shiny, total } = this.save.counts();
    text(this, W / 2, 18, 'COLECCION', 16, COLORS.goldHex).setOrigin(0.5);
    text(this, W / 2, 40, `Distintas ${caught}/${CREATURES.length}  Shiny ${shiny}`, 8, '#a8b4cc').setOrigin(0.5);
    text(this, W / 2, 56, `Bestias atrapadas: ${total}`, 8, COLORS.goldHex).setOrigin(0.5);

    this.gridLayer = this.add.container(0, 0);
    this.pages = Math.ceil(CREATURES.length / PER_PAGE);
    this.pageText = text(this, W / 2, H - 70, '', 8, '#a8b4cc').setOrigin(0.5);
    makeButton(this, W / 2 - 80, H - 70, 50, 26, '<', () => this.go(-1), { size: 16 });
    makeButton(this, W / 2 + 80, H - 70, 50, 26, '>', () => this.go(1), { size: 16 });
    this.input.keyboard?.on('keydown-LEFT', () => this.go(-1));
    this.input.keyboard?.on('keydown-RIGHT', () => this.go(1));
    this.drawGrid();

    makeButton(this, 90, H - 28, 150, 32, 'VOLVER', () => this.scene.start('title'));
    this.shinyBtn = makeButton(this, W - 90, H - 28, 150, 32, 'VER SHINY', () => {
      this.showShiny = !this.showShiny;
      this.shinyBtn.setLabel(this.showShiny ? 'VER NORMAL' : 'VER SHINY');
      this.drawGrid();
    });
  }

  go(d) {
    this.page = (this.page + d + this.pages) % this.pages;
    this.drawGrid();
  }

  drawGrid() {
    this.gridLayer.removeAll(true);
    this.pageText.setText(`${this.page + 1} / ${this.pages}`);
    CREATURES.slice(this.page * PER_PAGE, (this.page + 1) * PER_PAGE).forEach((c, i) => {
      const cx = GRID_X + (i % GRID_COLS) * CELL_W + CELL_W / 2;
      const cy = GRID_Y + Math.floor(i / GRID_COLS) * CELL_H + CELL_H / 2;
      const entry = this.save.entry(c.id);
      const owned = this.showShiny ? entry?.shinyCount > 0 : !!entry;
      const g = this.add.graphics();
      g.fillStyle(owned ? hexToNum(TYPES[c.type].dark) : 0x182038);
      g.fillRect(cx - CELL_W / 2 + 2, cy - CELL_H / 2 + 2, CELL_W - 4, CELL_H - 4);
      if (c.legendary) {
        g.lineStyle(2, COLORS.gold);
        g.strokeRect(cx - CELL_W / 2 + 3, cy - CELL_H / 2 + 3, CELL_W - 6, CELL_H - 6);
      }
      const img = this.add.image(cx, cy - 6, creatureKey(c.id, this.showShiny)).setScale(c.legendary ? 2 : 2.5);
      if (!owned) img.setTint(0x000000).setAlpha(0.7);
      const num = text(this, cx, cy + CELL_H / 2 - 10, `#${String(c.id).padStart(2, '0')}`, 8, owned ? '#f8f8f8' : '#56607c').setOrigin(0.5);
      // Contador de capturas de esta bestia (o de su versión shiny)
      const n = this.showShiny ? entry?.shinyCount ?? 0 : entry?.count ?? 0;
      const badge = n > 0
        ? text(this, cx + CELL_W / 2 - 5, cy - CELL_H / 2 + 6, `x${n}`, 8, COLORS.goldHex).setOrigin(1, 0).setStroke('#101828', 3)
        : null;
      const hit = this.add.zone(cx, cy, CELL_W - 4, CELL_H - 4).setInteractive({ useHandCursor: true });
      hit.on('pointerup', () => this.showDetail(c));
      this.gridLayer.add([g, img, num, hit]);
      if (badge) this.gridLayer.add(badge);
    });
  }

  showDetail(c) {
    const entry = this.save.entry(c.id);
    const layer = this.add.container(0, 0).setDepth(10);
    const dim = this.add.rectangle(0, 0, W, H, 0x000000, 0.6).setOrigin(0).setInteractive();
    const panel = makePanel(this, 30, 150, W - 60, 300);
    layer.add([dim, panel]);
    const known = !!entry;
    const shinyOwned = entry?.shinyCount > 0;
    const img = this.add.image(W / 2, 230, creatureKey(c.id, this.showShiny && shinyOwned)).setScale(6);
    if (!known) img.setTint(0x000000);
    layer.add(img);
    const t = TYPES[c.type];
    const lines = known
      ? [
          `#${String(c.id).padStart(2, '0')} ${c.name}`,
          `Tipo: ${t.name}`,
          `Rareza: ${RARITY_NAMES[c.rarity]}`,
          `Capturadas: ${entry.count}`,
          `Shiny: ${shinyOwned ? `sí (${entry.shinyCount})` : 'no'}`
        ]
      : [`#${String(c.id).padStart(2, '0')} ???`, `Tipo: ${t.name}`, `Rareza: ${RARITY_NAMES[c.rarity]}`, 'Aún no capturada'];
    layer.add(text(this, W / 2, 340, lines.join('\n'), 8, COLORS.inkHex).setOrigin(0.5));
    layer.add(makeButton(this, W / 2, 420, 140, 30, 'CERRAR', () => layer.destroy()));
  }
}
