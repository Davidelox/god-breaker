import { describe, it, expect, vi } from 'vitest';
import { SaveStore, SAVE_KEY, SAVE_VERSION, memoryStorage, parseSave, migrate } from '../src/core/save.js';
import { CREATURE_IDS } from '../src/data/creatures.js';

vi.spyOn(console, 'error').mockImplementation(() => {});

describe('guardado', () => {
  it('empieza con datos por defecto si no hay guardado', () => {
    const s = new SaveStore(memoryStorage(), CREATURE_IDS);
    s.load();
    expect(s.data.version).toBe(SAVE_VERSION);
    expect(s.data.bestScore).toBe(0);
    expect(s.recovered).toBe(false);
  });

  it('migra el formato antiguo sin versión', () => {
    expect(migrate({ best: 500 }).bestScore).toBe(500);
  });

  it('rechaza guardados de una versión futura', () => {
    expect(() => parseSave(JSON.stringify({ version: 99 }))).toThrow(/newer version/);
  });

  it('recupera un guardado corrupto y guarda una copia', () => {
    const storage = memoryStorage();
    storage.setItem(SAVE_KEY, '{esto no es json');
    const s = new SaveStore(storage, CREATURE_IDS);
    s.load();
    expect(s.recovered).toBe(true);
    expect(s.data.bestScore).toBe(0);
    expect(storage.getItem(`${SAVE_KEY}.corrupt`)).toBe('{esto no es json');
  });

  it('descarta criaturas inexistentes y valores no válidos', () => {
    const data = parseSave(
      JSON.stringify({
        version: 1,
        bestScore: -5,
        collection: { 1: { count: 2, shinyCount: 9 }, 999: { count: 1 }, 2: { count: 'x' } }
      }),
      CREATURE_IDS
    );
    expect(data.bestScore).toBe(0);
    expect(Object.keys(data.collection)).toEqual(['1']);
    expect(data.collection[1].shinyCount).toBe(2);
  });

  it('registra capturas y detecta novedades', () => {
    const s = new SaveStore(memoryStorage(), CREATURE_IDS);
    s.load();
    expect(s.recordCapture(3, false)).toEqual({ isNew: true, isNewShiny: false });
    expect(s.recordCapture(3, true)).toEqual({ isNew: false, isNewShiny: true });
    expect(s.recordCapture(3, true)).toEqual({ isNew: false, isNewShiny: false });
    expect(s.counts()).toEqual({ caught: 1, shiny: 1, total: 3 });
  });

  it('persiste y recarga el récord', () => {
    const storage = memoryStorage();
    const a = new SaveStore(storage, CREATURE_IDS);
    a.load();
    expect(a.recordGame(1234)).toBe(true);
    expect(a.recordGame(100)).toBe(false);
    const b = new SaveStore(storage, CREATURE_IDS);
    b.load();
    expect(b.data.bestScore).toBe(1234);
    expect(b.data.stats.games).toBe(2);
  });

  it('recuerda los consejos del tutorial vistos o desactivados', () => {
    const storage = memoryStorage();
    const a = new SaveStore(storage, CREATURE_IDS);
    a.load();
    expect(a.wantsTip('aim')).toBe(true);
    a.markTip('aim');
    const b = new SaveStore(storage, CREATURE_IDS);
    b.load();
    expect(b.wantsTip('aim')).toBe(false);
    expect(b.wantsTip('beast')).toBe(true);
    b.skipTips();
    b.resetProgress();
    expect(b.wantsTip('beast')).toBe(false);
  });
});

describe('ajustes', () => {
  it('guarda la velocidad y descarta valores no válidos', () => {
    expect(parseSave(JSON.stringify({ version: 1, settings: { speed: 3 } })).settings.speed).toBe(3);
    expect(parseSave(JSON.stringify({ version: 1, settings: { speed: 7 } })).settings.speed).toBe(1);
    expect(parseSave(JSON.stringify({ version: 1 })).settings.speed).toBe(1);
  });
});

describe('ajustes de audio', () => {
  it('música y sonido activados por defecto y se respetan si se desactivan', () => {
    expect(parseSave(JSON.stringify({ version: 1 })).settings).toMatchObject({ music: true, sfx: true });
    expect(parseSave(JSON.stringify({ version: 1, settings: { music: false } })).settings).toMatchObject({ music: false, sfx: true });
  });
});

describe('ajustes v0.6', () => {
  it('acepta x1.5 y x4, y la cuadrícula está oculta por defecto', () => {
    expect(parseSave(JSON.stringify({ version: 1, settings: { speed: 1.5 } })).settings.speed).toBe(1.5);
    expect(parseSave(JSON.stringify({ version: 1, settings: { speed: 4 } })).settings.speed).toBe(4);
    expect(parseSave(JSON.stringify({ version: 1 })).settings.grid).toBe(false);
    expect(parseSave(JSON.stringify({ version: 1 })).settings.haptics).toBe(true);
    expect(parseSave(JSON.stringify({ version: 1, settings: { haptics: false } })).settings.haptics).toBe(false);
  });
});

describe('borrar progreso', () => {
  it('borra capturas, misiones, récord y estadísticas, pero mantiene los ajustes', () => {
    const storage = memoryStorage();
    const s = new SaveStore(storage, CREATURE_IDS);
    s.load();
    s.recordCapture(1, true);
    s.recordGame(5000, 20);
    s.completeMissions(['cap_10']);
    s.data.settings.speed = 3;
    s.data.settings.music = false;
    s.resetProgress();
    const again = new SaveStore(storage, CREATURE_IDS);
    again.load();
    expect(again.data.collection).toEqual({});
    expect(again.data.missions).toEqual({});
    expect(again.data.bestScore).toBe(0);
    expect(again.data.stats.captures).toBe(0);
    expect(again.data.settings).toMatchObject({ speed: 3, music: false });
  });
});

describe('criaturas vistas', () => {
  it('marca las vistas una sola vez, las guarda y cuenta las capturadas como vistas', () => {
    const storage = memoryStorage();
    const a = new SaveStore(storage, CREATURE_IDS);
    a.load();
    expect(a.markSeen(3)).toBe(true);
    expect(a.markSeen(3)).toBe(false);
    a.recordCapture(4, false);
    const b = new SaveStore(storage, CREATURE_IDS);
    b.load();
    expect(b.isSeen(3)).toBe(true);
    expect(b.isSeen(4)).toBe(true);
    expect(b.isSeen(5)).toBe(false);
  });
});
