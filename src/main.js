import '@fontsource/press-start-2p';
import '@fontsource/vt323';
import { installErrorHandlers, logError, showFatal } from './core/errors.js';

installErrorHandlers();

// iPhone abierto desde el icono: a veces iOS da a la página el alto que tendría en Safari (con su
// barra inferior) y abajo queda una franja vacía. Se fuerza el alto real de la pantalla.
function fillIosScreen() {
  const nav = navigator;
  const standalone = nav.standalone || matchMedia('(display-mode: standalone)').matches || matchMedia('(display-mode: fullscreen)').matches;
  if (!/iPhone|iPod/.test(nav.userAgent) || !standalone) return;
  const screenH = Math.max(screen.width, screen.height); // alto en vertical (px de CSS)
  const el = document.getElementById('game');
  if (el && el.clientHeight < screenH - 8) el.style.height = `${screenH}px`;
}
try {
  fillIosScreen();
} catch (err) {
  logError('ios-height', err);
}

// El juego (y config.js, que mide la pantalla) se carga cuando la fuente pixel está lista y la
// página ya se ha maquetado: en el iPhone la zona segura (env(safe-area-inset-*)) puede valer 0
// en los primeros instantes y entonces la parte de arriba quedaría tapada por la isla.
const nextFrame = () => new Promise((resolve) => requestAnimationFrame(() => resolve()));
Promise.all([
  document.fonts.load('8px "Press Start 2P"').catch((err) => logError('font', err)),
  document.fonts.load('16px "VT323"').catch((err) => logError('font', err)),
  nextFrame().then(nextFrame)
])
  .then(() => import('./app.js'))
  .then((app) => app.boot())
  .catch((err) => showFatal(logError('boot', err)));
