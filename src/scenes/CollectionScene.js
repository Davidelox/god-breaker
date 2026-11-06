import Phaser from 'phaser';
import { W, H, RARITY_NAMES } from '../config.js';
import { CREATURES } from '../data/creatures.js';
import { PANTHEON_NAMES } from '../data/bestiary.js';
import { TYPES, TYPE_ORDER, hexToNum } from '../data/types.js';
import { addCreatureImage } from '../gfx/sprites.js';
import { text, makeButton, makePanel, drawPanel, COLORS } from '../gfx/ui.js';

const GRID_COLS = 5;
const CELL_W = 68;
const CELL_H = 62;
const GRID_X = (W - GRID_COLS * CELL_W) / 2;
const SECTION_Y = 84; // selector de mitología
const GRID_Y = 104;
// Filas que caben entre el selector y los controles de abajo (más en pantallas altas)
const GRID_ROWS = Math.max(5, Math.floor((H - 122 - GRID_Y) / CELL_H));
const PER_PAGE = GRID_COLS * GRID_ROWS;
// Secciones: todas las bestias y una por mitología
const SECTIONS = ['all', ...TYPE_ORDER];
const sectionName = (s) => (s === 'all' ? 'ALL BEASTS' : TYPES[s].name.toUpperCase());

export default class CollectionScene extends Phaser.Scene {
  constructor() {
    super('collection');
  }

  init() {
    this.showShiny = false;
    this.page = 0;
    // El filtro «solo capturadas» y la sección se recuerdan mientras el juego esté abierto
    this.onlyCaught = !!this.registry.get('collectionOnlyCaught');
    const saved = this.registry.get('collectionSection');
    this.section = SECTIONS.includes(saved) ? saved : 'all';
  }

  owned(c) {
    const e = this.save.entry(c.id);
    return this.showShiny ? e?.shinyCount > 0 : e?.count > 0;
  }

  /** Bestias de la sección actual: todas o solo las capturadas (en la vista gold, las capturadas en gold). */
  list() {
    const inSection = this.section === 'all' ? CREATURES : CREATURES.filter((c) => c.type === this.section);
    return this.onlyCaught ? inSection.filter((c) => this.owned(c)) : inSection;
  }

  updatePages() {
    this.pages = Math.max(1, Math.ceil(this.list().length / PER_PAGE));
    this.page = Math.min(this.page, this.pages - 1);
  }

  create() {
    this.save = this.registry.get('save');
    this.add.rectangle(0, 0, W, H, COLORS.night).setOrigin(0);

    const { caught, shiny, total } = this.save.counts();
    text(this, W / 2, 18, 'COLLECTION', 16, COLORS.goldHex).setOrigin(0.5);
    text(this, W / 2, 40, `Unique ${caught}/${CREATURES.length}  Gold ${shiny}`, 8, '#a8b4cc').setOrigin(0.5);
    text(this, W / 2, 56, `Beasts caught: ${total}`, 8, COLORS.goldHex).setOrigin(0.5);

    // Selector de mitología: < SECCIÓN (capturadas/total) >. Tocar el nombre abre la lista.
    makeButton(this, 26, SECTION_Y, 36, 28, '<', () => this.changeSection(-1), { size: 16 });
    makeButton(this, W - 26, SECTION_Y, 36, 28, '>', () => this.changeSection(1), { size: 16 });
    this.sectionG = this.add.graphics();
    this.sectionText = text(this, W / 2, SECTION_Y, '', 8, '#ffffff').setOrigin(0.5).setStroke('#101828', 3);
    this.add.zone(W / 2, SECTION_Y, W - 104, 28).setInteractive({ useHandCursor: true }).on('pointerup', () => this.openPicker());

    this.gridLayer = this.add.container(0, 0);
    this.pageText = text(this, W / 2, H - 70, '', 8, '#a8b4cc').setOrigin(0.5);
    makeButton(this, W / 2 - 80, H - 70, 50, 26, '<', () => this.go(-1), { size: 16 });
    makeButton(this, W / 2 + 80, H - 70, 50, 26, '>', () => this.go(1), { size: 16 });
    // Saltos de 10 páginas para secciones grandes
    this.jumpBtns = [
      makeButton(this, W / 2 - 140, H - 70, 50, 26, '<<', () => this.go(-10)),
      makeButton(this, W / 2 + 140, H - 70, 50, 26, '>>', () => this.go(10))
    ];
    this.input.keyboard?.on('keydown-LEFT', () => this.go(-1));
    this.input.keyboard?.on('keydown-RIGHT', () => this.go(1));
    this.input.keyboard?.on('keydown-UP', () => this.changeSection(-1));
    this.input.keyboard?.on('keydown-DOWN', () => this.changeSection(1));

    // Filtro: solo las capturadas
    const filterLabel = () => `CAUGHT ONLY: ${this.onlyCaught ? 'ON' : 'OFF'}`;
    this.filterBtn = makeButton(this, W / 2, H - 104, 200, 24, filterLabel(), () => {
      this.onlyCaught = !this.onlyCaught;
      this.registry.set('collectionOnlyCaught', this.onlyCaught);
      this.filterBtn.setLabel(filterLabel()).setSelected(this.onlyCaught);
      this.page = 0;
      this.drawGrid();
    }).setSelected(this.onlyCaught);
    this.emptyText = text(this, W / 2, GRID_Y + 150, '', 8, '#a8b4cc').setOrigin(0.5);
    this.drawGrid();

    makeButton(this, 90, H - 28, 150, 32, 'BACK', () => this.scene.start('title'));
    this.shinyBtn = makeButton(this, W - 90, H - 28, 150, 32, 'SHOW GOLD', () => {
      this.showShiny = !this.showShiny;
      this.shinyBtn.setLabel(this.showShiny ? 'SHOW NORMAL' : 'SHOW GOLD');
      this.drawGrid();
    });
  }

  go(d) {
    this.page = (((this.page + d) % this.pages) + this.pages) % this.pages;
    this.drawGrid();
  }

  setSection(s) {
    this.section = s;
    this.registry.set('collectionSection', s);
    this.page = 0;
    this.drawGrid();
  }

  changeSection(d) {
    const i = SECTIONS.indexOf(this.section);
    this.setSection(SECTIONS[(i + d + SECTIONS.length) % SECTIONS.length]);
  }

  /** Capturadas / total de una sección (según la vista normal o gold). */
  sectionCount(s) {
    const all = s === 'all' ? CREATURES : CREATURES.filter((c) => c.type === s);
    return [all.filter((c) => this.owned(c)).length, all.length];
  }

  drawSection() {
    const color = this.section === 'all' ? 0x3a4668 : hexToNum(TYPES[this.section].dark);
    const g = this.sectionG;
    g.clear();
    drawPanel(g, 46, SECTION_Y - 14, W - 92, 28, { fill: color, border: 0x101828 });
    const [have, all] = this.sectionCount(this.section);
    this.sectionText.setText(`${sectionName(this.section)}  ${have}/${all}`);
  }

  /** Lista de todas las secciones para saltar directamente a una. */
  openPicker() {
    const layer = this.add.container(0, 0).setDepth(10);
    layer.add(this.add.rectangle(0, 0, W, H, 0x000000, 0.7).setOrigin(0).setInteractive());
    const rows = Math.ceil(SECTIONS.length / 2);
    const top = Math.max(60, H / 2 - (rows * 38 + 90) / 2);
    layer.add(makePanel(this, 12, top, W - 24, rows * 38 + 90));
    layer.add(text(this, W / 2, top + 20, 'MYTHOLOGY', 16, COLORS.inkHex).setOrigin(0.5));
    SECTIONS.forEach((s, i) => {
      const [have, all] = this.sectionCount(s);
      const x = i % 2 ? W * 0.75 - 6 : W * 0.25 + 6;
      const y = top + 56 + Math.floor(i / 2) * 38;
      const fill = s === 'all' ? 0x3a4668 : hexToNum(TYPES[s].dark);
      const label = `${s === 'all' ? 'ALL' : TYPES[s].name.toUpperCase()}\n${have}/${all}`;
      const btn = makeButton(this, x, y, W / 2 - 24, 34, label, () => {
        layer.destroy();
        this.setSection(s);
      }, { fill, textColor: '#ffffff' });
      btn.setSelected(s === this.section);
      layer.add(btn);
    });
    layer.add(makeButton(this, W / 2, top + 56 + rows * 38, 140, 28, 'CLOSE', () => layer.destroy()));
  }

  drawGrid() {
    this.gridLayer.removeAll(true);
    this.updatePages();
    this.drawSection();
    const list = this.list();
    this.pageText.setText(`${this.page + 1} / ${this.pages}`);
    for (const b of this.jumpBtns) b.setVisible(this.pages > 10);
    this.emptyText.setText(list.length ? '' : this.showShiny ? 'No gold beasts\ncaptured here yet.' : 'No beasts\ncaptured here yet.');
    list.slice(this.page * PER_PAGE, (this.page + 1) * PER_PAGE).forEach((c, i) => {
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
      const img = addCreatureImage(this, cx, cy - 6, c.id, this.showShiny, c.legendary ? 2 : 2.5);
      if (!owned) img.setTint(0x000000).setAlpha(0.7);
      const num = text(this, cx, cy + CELL_H / 2 - 10, `#${String(c.id).padStart(2, '0')}`, 8, owned ? '#f8f8f8' : '#56607c').setOrigin(0.5);
      // Contador de capturas de esta bestia (o de su versión gold)
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
    const img = addCreatureImage(this, W / 2, 230, c.id, this.showShiny && shinyOwned, 6);
    if (!known) img.setTint(0x000000);
    layer.add(img);
    const t = TYPES[c.type];
    const origin = c.pantheon ? `${PANTHEON_NAMES[c.pantheon]} god` : `Rarity: ${RARITY_NAMES[c.rarity]}`;
    const lines = known
      ? [
          `#${String(c.id).padStart(2, '0')} ${c.name}`,
          `Origin: ${t.name}`,
          origin,
          `Captured: ${entry.count}`,
          `Gold: ${shinyOwned ? `yes (${entry.shinyCount})` : 'no'}`
        ]
      : [`#${String(c.id).padStart(2, '0')} ???`, `Origin: ${t.name}`, origin, 'Not captured yet'];
    layer.add(text(this, W / 2, 340, lines.join('\n'), 8, COLORS.inkHex).setOrigin(0.5));
    layer.add(makeButton(this, W / 2, 420, 140, 30, 'CLOSE', () => layer.destroy()));
  }
}
