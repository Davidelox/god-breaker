import { describe, it, expect } from 'vitest';
import { setupNativeStorage } from '../src/core/nativeStorage.js';
import { memoryStorage, SAVE_KEY } from '../src/core/save.js';
import { RUN_KEY } from '../src/core/run.js';

function fakePrefs(initial = {}) {
  const m = new Map(Object.entries(initial));
  return {
    m,
    get: async ({ key }) => ({ value: m.has(key) ? m.get(key) : null }),
    set: async ({ key, value }) => void m.set(key, value),
    remove: async ({ key }) => void m.delete(key)
  };
}
const tick = () => new Promise((r) => setTimeout(r, 0));

describe('nativeStorage', () => {
  it('en el navegador no toca nada', async () => {
    const ls = memoryStorage();
    const prefs = fakePrefs({ [SAVE_KEY]: 'x' });
    await setupNativeStorage(ls, prefs, false, null);
    expect(ls.getItem(SAVE_KEY)).toBeNull();
  });

  it('restaura localStorage desde Preferences (p. ej. si iOS lo borró)', async () => {
    const ls = memoryStorage();
    await setupNativeStorage(ls, fakePrefs({ [SAVE_KEY]: '{"a":1}' }), true, null);
    expect(ls.getItem(SAVE_KEY)).toBe('{"a":1}');
  });

  it('copia a Preferences lo que ya había en localStorage', async () => {
    const ls = memoryStorage();
    ls.setItem(SAVE_KEY, 'viejo');
    const prefs = fakePrefs();
    await setupNativeStorage(ls, prefs, true, null);
    expect(prefs.m.get(SAVE_KEY)).toBe('viejo');
  });

  it('copia escrituras y borrados de las claves duraderas, y solo de esas', async () => {
    const ls = memoryStorage();
    const prefs = fakePrefs();
    await setupNativeStorage(ls, prefs, true, null);
    ls.setItem(SAVE_KEY, 'nuevo');
    ls.setItem(RUN_KEY, 'partida');
    ls.setItem('otra', 'no');
    await tick();
    expect(prefs.m.get(SAVE_KEY)).toBe('nuevo');
    expect(prefs.m.get(RUN_KEY)).toBe('partida');
    expect(prefs.m.has('otra')).toBe(false);
    ls.removeItem(RUN_KEY);
    await tick();
    expect(prefs.m.has(RUN_KEY)).toBe(false);
    expect(ls.getItem(RUN_KEY)).toBeNull();
  });
});
