// Control de errores: registro persistente + pantalla de error amigable.
import { VERSION } from '../version.js';

const LOG_KEY = 'beastbreaker.errorlog';
const MAX_ENTRIES = 25;

function readLog() {
  try {
    const raw = globalThis.localStorage?.getItem(LOG_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

/** Registra un error (sin lanzar nunca). Devuelve la entrada creada. */
export function logError(source, err, extra) {
  const entry = {
    t: new Date().toISOString(),
    v: VERSION,
    source,
    message: String(err?.message ?? err ?? 'Unknown error'),
    stack: typeof err?.stack === 'string' ? err.stack.split('\n').slice(0, 8).join('\n') : undefined,
    extra
  };
  console.error(`[${source}]`, err, extra ?? '');
  try {
    const list = readLog();
    list.push(entry);
    globalThis.localStorage?.setItem(LOG_KEY, JSON.stringify(list.slice(-MAX_ENTRIES)));
  } catch {
    /* almacenamiento lleno o bloqueado: no hacemos nada */
  }
  return entry;
}

export const getErrorLog = readLog;

export function clearErrorLog() {
  try {
    globalThis.localStorage?.removeItem(LOG_KEY);
  } catch {
    /* ignorado */
  }
}

let fatalShown = false;

/** Muestra la pantalla de error (una sola vez) con opción de reiniciar o copiar el informe. */
export function showFatal(entry) {
  if (fatalShown || typeof document === 'undefined') return;
  const el = document.getElementById('error-overlay');
  if (!el) return;
  fatalShown = true;
  el.innerHTML = '';
  const box = document.createElement('div');
  box.className = 'box';
  const title = document.createElement('p');
  title.textContent = 'Oops! Something went wrong.';
  const info = document.createElement('p');
  info.textContent = 'Your collection is saved. Restart to keep playing.';
  const pre = document.createElement('pre');
  pre.textContent = `v${entry.v} · ${entry.source}\n${entry.message}`;
  const restart = document.createElement('button');
  restart.textContent = 'Restart';
  restart.onclick = () => location.reload();
  const copy = document.createElement('button');
  copy.textContent = 'Copy report';
  copy.onclick = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(getErrorLog(), null, 2));
      copy.textContent = 'Copied';
    } catch {
      copy.textContent = 'Could not copy';
    }
  };
  box.append(title, info, pre, restart, copy);
  el.append(box);
  el.style.display = 'flex';
}

export function installErrorHandlers() {
  window.addEventListener('error', (e) => {
    showFatal(logError('window', e.error ?? e.message));
  });
  window.addEventListener('unhandledrejection', (e) => {
    showFatal(logError('promise', e.reason));
  });
}
