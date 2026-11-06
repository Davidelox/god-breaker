/* global __APP_VERSION__ */
// La versión se inyecta desde package.json al compilar (ver vite.config.js).
export const VERSION = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : 'dev';
