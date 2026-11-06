import Phaser from 'phaser';
import { W, H, RARITY_NAMES } from '../config.js';
import { CREATURES } from '../data/creatures.js';
import { PANTHEON_NAMES } from '../data/bestiary.js';
import { TYPES, TYPE_ORDER, hexToNum } from '../data/types.js';
import { addCreatureImage } from '../gfx/sprites.js';
import { text, makeButton, makePanel, fitCamera, fullRect, COLORS } from '../gfx/ui.js';

const GRID_COLS = 5;
const CELL_W = 68;
const CELL_H = 62;
const GRID_X = (W - GRID_COLS * CELL_W) / 2;
// Selector de mitología: dos filas de botones (ALL + 14 orígenes) y debajo el nombre y el progreso
const SECTION_Y = 76; // centro de la primera fila de botones
const SECTION_ROW_H = 24;
const SECTION_LABEL_Y = SECTION_Y + SECTION_ROW_H * 2 - 2;
const GRID_Y = SECTION_LABEL_Y + 14;
// Filas que caben entre el selector y los controles de abajo (más en pantallas altas)
const GRID_ROWS = Math.max(5, Math.floor((H - 122 - GRID_Y) / CELL_H));
const PER_PAGE = GRID_COLS * GRID_ROWS;
// Secciones: todas las bestias y una por mitología
const SECTIONS = ['all', ...TYPE_ORDER];
// Color del marco de cada casilla según la rareza (4 = dios: dorado)
const RARITY_FRAME = { 1: 0x58c878, 2: 0x4c8cf0, 3: 0xa060e8, 4: COLORS.gold };
const sectionName =(s) => (s === 'all' ? 'ALL BEASTS' : TYPES[s].name.toUpperCase());

export default class CollectionScene extends Phaser.Scene {
  constructor() {
    super('collection');
  }

  init() {
    this.showShiny = false;
    this.page = 0;
    // El filtro «solo capturadas» y la sección se recuerdan mientras el juego esté abierto
    this.onlyCaught = !!this.registry.get('collectionOnlyCaught');
    this.onlyGods = !!this.registry.get('collectionOnlyGods');
    const saved = this.registry.get('collectionSection');
    this.section = SECTIONS.includes(saved) ? saved : 'all';
  }

  owned(c) {
    const e = this.save.entry(c.id);
    return this.showShiny ? e?.shinyCount > 0 : e?.count > 0;
  }

  /** Bestias de la sección actual: todas o solo las capturadas (en la vista gold, las capturadas en gold). */
  /** Bestias de una sección con el filtro de dioses aplicado (sin el de capturadas). */
  sectionBeasts(s) {
    return CREATURES.filter((c) => (s === 'all' || c.type === s) && (!this.onlyGods || c.legendary));
  }

  list() {
    const beasts = this.sectionBeasts(this.section);
    return this.onlyCaught ? beasts.filter((c) => this.owned(c)) : beasts;
  }

  updatePages() {
    this.pages = Math.max(1, Math.ceil(this.list().length / PER_PAGE));
    this.page = Math.min(this.page, this.pages - 1);
  }

  create() {
    this.save = this.registry.get('save');
    fitCamera(this);
    fullRect(this, COLORS.night);

    const { caught, shiny, total } = this.save.counts();
    text(this, W / 2, 18, 'COLLECTION', 16, COLORS.goldHex).setOrigin(0.5);
    text(this, W / 2, 40, `Unique ${caught}/${CREATURES.length}  Gold ${shiny}`, 8, '#a8b4cc').setOrigin(0.5);
    text(this, W / 2, 56, `Beasts caught: ${total}`, 8, COLORS.goldHex).setOrigin(0.5);

    // Selector de mitología: un botón por sección (8 arriba y 7 abajo) con su color
    const perRow = 8;
    const bw = (W - 16) / perRow;
    this.sectionBtns = {};
    SECTIONS.forEach((s, i) => {
      const row = Math.floor(i / perRow);
      const inRow = row === 0 ? perRow : SECTIONS.length - perRow;
      const x = W / 2 + (i % perRow - (inRow - 1) / 2) * bw;
      const y = SECTION_Y + row * SECTION_ROW_H;
      const fill = s === 'all' ? 0x3a4668 : hexToNum(TYPES[s].dark);
      this.sectionBtns[s] = makeButton(this, x, y, bw - 3, SECTION_ROW_H - 3, s === 'all' ? 'ALL' : TYPES[s].short, () => this.setSection(s), {
        fill, textColor: '#ffffff'
      });
    });
    this.sectionText = text(this, W / 2, SECTION_LABEL_Y, '', 8, '#ffffff').setOrigin(0.5).setStroke('#101828', 3);

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
    const filterLabel = () => `CAUGHT: ${this.onlyCaught ? 'ON' : 'OFF'}`;
    this.filterBtn = makeButton(this, W / 2 - 80, H - 104, 150, 24, filterLabel(), () => {
      this.onlyCaught = !this.onlyCaught;
      this.registry.set('collectionOnlyCaught', this.onlyCaught);
      this.filterBtn.setLabel(filterLabel()).setSelected(this.onlyCaught);
      this.page = 0;
      this.drawGrid();
    }).setSelected(this.onlyCaught);
    // Filtro: solo los legendarios (dioses)
    const godsLabel = () => `GODS: ${this.onlyGods ? 'ON' : 'OFF'}`;
    this.godsBtn = makeButton(this, W / 2 + 80, H - 104, 150, 24, godsLabel(), () => {
      this.onlyGods = !this.onlyGods;
      this.registry.set('collectionOnlyGods', this.onlyGods);
      this.godsBtn.setLabel(godsLabel()).setSelected(this.onlyGods);
      this.page = 0;
      this.drawGrid();
    }).setSelected(this.onlyGods);
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
    const all = this.sectionBeasts(s);
    return [all.filter((c) => this.owned(c)).length, all.length];
  }

  drawSection() {
    for (const [s, btn] of Object.entries(this.sectionBtns)) btn.setSelected(s === this.section);
    const [have, all] = this.sectionCount(this.section);
    const what = this.onlyGods ? (this.section === 'all' ? 'ALL GODS' : `${sectionName(this.section)} GODS`) : sectionName(this.section);
    this.sectionText.setText(`${what}  ${have}/${all}`);
    this.sectionText.setColor(this.section === 'all' ? '#ffffff' : TYPES[this.section].light);
  }

  drawGrid() {
    this.gridLayer.removeAll(true);
    this.updatePages();
    this.drawSection();
    const list = this.list();
    this.pageText.setText(`${this.page + 1} / ${this.pages}`);
    for (const b of this.jumpBtns) b.setVisible(this.pages > 10);
    const noGods = this.onlyGods && !this.sectionBeasts(this.section).length;
    this.emptyText.setText(list.length ? '' : noGods ? 'No gods in\nthis mythology.' : this.showShiny ? 'No gold beasts\ncaptured here yet.' : 'No beasts\ncaptured here yet.');
    list.slice(this.page * PER_PAGE, (this.page + 1) * PER_PAGE).forEach((c, i) => {
      const cx = GRID_X + (i % GRID_COLS) * CELL_W + CELL_W / 2;
      const cy = GRID_Y + Math.floor(i / GRID_COLS) * CELL_H + CELL_H / 2;
      const entry = this.save.entry(c.id);
      const owned = this.showShiny ? entry?.shinyCount > 0 : !!entry;
      const g = this.add.graphics();
      g.fillStyle(owned ? hexToNum(TYPES[c.type].dark) : 0x182038);
      g.fillRect(cx - CELL_W / 2 + 2, cy - CELL_H / 2 + 2, CELL_W - 4, CELL_H - 4);
      // Marco según la rareza: verde común, azul poco común, morado rara y dorado los dioses
      g.lineStyle(2, RARITY_FRAME[c.rarity] ?? COLORS.gold, owned ? 1 : 0.6);
      g.strokeRect(cx - CELL_W / 2 + 3, cy - CELL_H / 2 + 3, CELL_W - 6, CELL_H - 6);
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
    const dim = fullRect(this, 0x000000, 0.6).setInteractive();
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
