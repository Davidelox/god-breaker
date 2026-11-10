import { describe, it, expect, afterEach } from 'vitest';
import { t, setLang, getLang, godOf } from '../src/i18n.js';
import { ES } from '../src/data/es.js';
import { MISSIONS } from '../src/data/missions.js';
import { SPECIALS, ELEMENTS } from '../src/data/specials.js';
import { TYPES } from '../src/data/types.js';

const holes = (s) => (s.match(/\{\d\}/g) ?? []).sort().join();

describe('idioma', () => {
  afterEach(() => setLang('en'));

  it('en inglés deja el texto igual y rellena los valores', () => {
    expect(getLang()).toBe('en');
    expect(t('PLAY')).toBe('PLAY');
    expect(t('TURN {0}', 7)).toBe('TURN 7');
  });

  it('en español traduce, rellena valores y usa patrones', () => {
    setLang('es');
    expect(t('PLAY')).toBe('JUGAR');
    expect(t('TURN {0}', 7)).toBe('TURNO 7');
    expect(t('Capture 25 beasts')).toBe('Captura 25 bestias');
    expect(t('All Norse beasts')).toBe('Todas las bestias: Nórdica');
    expect(t('Texto sin traducir')).toBe('Texto sin traducir');
    expect(godOf('nordica', 'Norse')).toBe('Dios nórdico');
  });

  it('las traducciones conservan los huecos {0}, {1}…', () => {
    for (const [en, es] of Object.entries(ES)) expect(holes(es), en).toBe(holes(en));
  });

  it('todas las misiones, hechizos, elementos y orígenes tienen traducción', () => {
    setLang('es');
    for (const m of MISSIONS) expect(t(m.title), m.title).not.toBe(m.title);
    for (const sp of SPECIALS) {
      expect(ES[sp.name], sp.name).toBeTruthy();
      expect(ES[sp.desc], sp.desc).toBeTruthy();
    }
    for (const el of Object.values(ELEMENTS)) expect(t(el.short)).toMatch(/^[A-ZÑ]{3}$/);
    for (const ty of Object.values(TYPES)) expect(ES[ty.name], ty.name).toBeTruthy();
  });
});
