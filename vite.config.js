import { defineConfig } from 'vite';
import { readFileSync } from 'node:fs';

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'));

export default defineConfig({
  // Rutas relativas: necesario para empaquetar luego con Capacitor (móvil).
  base: './',
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version)
  },
  server: {
    host: true // permite abrir el juego desde el móvil en la misma red
  },
  test: {
    environment: 'node'
  }
});
