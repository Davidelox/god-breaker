import '@fontsource/press-start-2p';
import { installErrorHandlers, logError, showFatal } from './core/errors.js';

installErrorHandlers();

// El juego (y config.js, que mide la pantalla) se carga cuando la fuente pixel está lista y la
// página ya se ha maquetado: en el iPhone la zona segura (env(safe-area-inset-*)) puede valer 0
// en los primeros instantes y entonces la parte de arriba quedaría tapada por la isla.
const nextFrame = () => new Promise((resolve) => requestAnimationFrame(() => resolve()));
Promise.all([
  document.fonts.load('8px "Press Start 2P"').catch((err) => logError('font', err)),
  nextFrame().then(nextFrame)
])
  .then(() => import('./app.js'))
  .then((app) => app.boot())
  .catch((err) => showFatal(logError('boot', err)));
