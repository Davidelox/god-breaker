import { describe, it, expect } from 'vitest';
import * as types from '../src/data/types.js';
import { CREATURES, LEGENDARIES, NORMAL_CREATURES } from '../src/data/creatures.js';
import { SPECIALS, ELEMENTS } from '../src/data/specials.js';
import { BEINGS, GODS, PANTHEON_NAMES } from '../src/data/bestiary.js';
import { parseDesc } from '../src/gfx/beastArt.js';

const { TYPES, TYPE_ORDER } = types;

describe('datos', () => {
  it('ya no hay tabla de debilidades', () => {
    expect(types.effectiveness).toBeUndefined();
    expect(types.CHART).toBeUndefined();
  });

  it('bestiario: 600 bestias, 481 seres y 119 dioses (100 griegos, nórdicos y egipcios + 19 de otras mitologías)', () => {
    expect(CREATURES.length).toBe(600);
    expect(NORMAL_CREATURES.length).toBe(481);
    expect(LEGENDARIES.length).toBe(119);
    expect(LEGENDARIES.filter((c) => GODS[c.pantheon]).length).toBe(100);
    expect(Object.keys(GODS).sort()).toEqual(['egipcia', 'griega', 'nordica']);
    expect(LEGENDARIES.every((c) => c.rarity === 4 && PANTHEON_NAMES[c.pantheon] && c.pantheon === c.type)).toBe(true);
  });

  it('cada bestia tiene un origen mitológico y los dioses son de su panteón', () => {
    for (const c of CREATURES) expect(TYPE_ORDER).toContain(c.type);
    for (const t of TYPE_ORDER) expect(CREATURES.some((c) => c.type === t)).toBe(true);
    for (const c of LEGENDARIES) expect(c.type).toBe(c.pantheon);
  });

  it('cada bestia tiene un descriptor de sprite con un arquetipo conocido', () => {
    const ARCHS = ['hum', 'quad', 'bird', 'serp', 'drag', 'ldrag', 'fish', 'kraken', 'turtle', 'spider', 'insect', 'ghost', 'wisp', 'head', 'tree', 'plant', 'obj', 'cloud'];
    for (const c of CREATURES) expect(ARCHS, c.name).toContain(parseDesc(c.art).arch);
    expect(new Set(CREATURES.map((c) => c.art)).size).toBeGreaterThan(560);
  });

  it('id y nombres únicos, orígenes válidos y nombres aptos para la fuente', () => {
    expect(new Set(CREATURES.map((c) => c.id)).size).toBe(CREATURES.length);
    expect(new Set(CREATURES.map((c) => c.name.toLowerCase())).size).toBe(CREATURES.length);
    for (const c of CREATURES) {
      expect(TYPES[c.type]).toBeDefined();
      expect(c.name.length).toBeLessThanOrEqual(14);
      expect(c.name[0]).not.toMatch(/[ÁÉÍÓÚ]/);
    }
    for (const t of Object.keys(BEINGS)) expect(TYPE_ORDER).toContain(t);
  });

  it('hay seres de las 3 rarezas', () => {
    for (const r of [1, 2, 3]) expect(NORMAL_CREATURES.filter((c) => c.rarity === r).length).toBeGreaterThan(50);
  });

  it('los hechizos usan elementos con color propio', () => {
    for (const s of SPECIALS) expect(ELEMENTS[s.type]).toBeDefined();
  });
});

import { captureChance, rollRewardBall, rollPower } from '../src/data/balls.js';
import { specialById } from '../src/data/specials.js';

describe('orbes y hechizos', () => {
  const normal = { legendary: false };
  const legend = { legendary: true };
  it('aplica los ratios de captura de cada orbe', () => {
    expect(captureChance('normal', normal, false)).toBe(0.6);
    expect(captureChance('normal', legend, false)).toBe(0.25);
    expect(captureChance('super', normal, false)).toBe(0.75);
    expect(captureChance('super', legend, false)).toBe(0.4);
    expect(captureChance('ultra', normal, false)).toBe(0.9);
    expect(captureChance('ultra', legend, false)).toBe(0.6);
  });
  it('las shiny se capturan siempre', () => {
    expect(captureChance('normal', legend, true)).toBe(1);
  });
  it('la recompensa es rúnico el 80 % y divino el 20 %', () => {
    expect(rollRewardBall(() => 0.79)).toBe('super');
    expect(rollRewardBall(() => 0.8)).toBe('ultra');
  });
  it('el hechizo aleatorio siempre es válido', () => {
    for (const r of [0, 0.5, 0.999]) expect(specialById(rollPower(() => r))).not.toBeNull();
  });
  it('hay 7 hechizos, cada uno con su elemento (también Darkness)', () => {
    expect(SPECIALS).toHaveLength(7);
    expect(new Set(SPECIALS.map((s) => s.id)).size).toBe(7);
    for (const sp of SPECIALS) expect(ELEMENTS[sp.type]).toBeTruthy();
    expect(specialById('sombra').type).toBe('oscuridad');
  });
});

import { rowBlocksFor, MAGIC_GAIN } from '../src/config.js';

describe('dificultad', () => {
  const avg = (w) => w.reduce((s, [n, p]) => s + n * p, 0) / w.reduce((s, [, p]) => s + p, 0);
  it('los bloques por fila crecen con la partida (3-6 bloques)', () => {
    expect(avg(rowBlocksFor(1))).toBeCloseTo(3.4);
    expect(avg(rowBlocksFor(10))).toBeCloseTo(4.25);
    expect(avg(rowBlocksFor(40))).toBeCloseTo(4.6);
    for (const t of [1, 5, 6, 15, 16, 99]) for (const [n] of rowBlocksFor(t)) expect(n >= 3 && n <= 6).toBe(true);
  });
  it('magia por bloque', () => {
    expect(MAGIC_GAIN).toEqual({ plain: 4, creature: 10, boss: 40 });
  });
});
