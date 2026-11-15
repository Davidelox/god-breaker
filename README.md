# God Breaker

Rompebloques por turnos en pixel art. Eres un cazador humano encargado de vencer y capturar seres de la mitología y dioses griegos, nórdicos y egipcios, lanzando orbes. Completa el bestiario de 600 bestias (también sus versiones doradas, «gold»).
El juego está en inglés; la documentación del proyecto, en español.
Hecho con [Phaser 4](https://phaser.io) y Vite. Se juega en el navegador y se empaqueta como app de Android e iOS con [Capacitor](https://capacitorjs.com).

## Comandos

```bash
npm install      # instalar dependencias
npm run dev      # servidor de desarrollo (http://localhost:5173, también accesible desde el móvil en tu red)
npm test         # tests
npm run build    # versión final en dist/
```

## App móvil (Capacitor)

Los proyectos nativos están en `android/` e `ios/` y se suben al repo. Identificador de la app: `com.davidelox.godbreaker` (`capacitor.config.json`). Solo vertical.

```bash
npm run cap:sync   # compila el juego y lo copia a las dos apps
npm run ios        # compila, copia y abre el proyecto en Xcode (solo Mac)
npm run android    # compila, copia y abre el proyecto en Android Studio
```

- Después de cambiar el juego hay que volver a ejecutar `npm run cap:sync` (o `ios` / `android`): las apps llevan una copia de `dist/`.
- iOS solo se puede compilar en el Mac (Xcode). Android, en los dos equipos.
- Android necesita Java 21 o superior. Android Studio ya trae el suyo; para compilar desde la terminal: `JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home" ./gradlew assembleDebug` (dentro de `android/`).
- En Xcode, elige un simulador de iPhone y pulsa ▶. Para depurar la vista web: Safari del Mac → menú Desarrollo → el simulador o el iPhone.

## Hoja de sprites

Con `npm run dev` en marcha, abre `http://localhost:5173/tools/bestiario.html` para ver los 600 sprites por origen.

## Parámetros de prueba (en la URL)

| Parámetro | Efecto |
|---|---|
| `?gold` (o `?shiny`) | Probabilidad de versión dorada del 25 % |
| `?debug` | Expone `window.__game` también en la versión final |
| `?safe=59,34` | En vista de móvil, simula la zona segura de un iPhone (px arriba, abajo) |

Ejemplo: `http://localhost:5173/?gold`

## Estructura

```
src/
  core/      errores, guardado versionado, números aleatorios
  data/      bestiario, elementos, hechizos, orbes, misiones y packs
  gfx/       sprites generados por código (beastArt.js: bestias) y componentes de interfaz
  scenes/    Boot, Title, Game, Collection
tests/       tests con Vitest
```

## Control de errores

- Los errores no capturados se guardan en `localStorage` (`beastbreaker.errorlog`, últimos 25) y muestran una pantalla con «Reiniciar» y «Copiar informe».
- El guardado (`beastbreaker.save`) tiene número de versión. Si está dañado se guarda una copia en `beastbreaker.save.corrupt` y se empieza de cero sin que el juego se cierre.
- Si cambias el formato del guardado, sube `SAVE_VERSION` y añade una migración en `src/core/save.js`.

## Versiones

- Se sigue [SemVer](https://semver.org/lang/es/). La versión de `package.json` aparece en la pantalla de título.
- Cada cambio se anota en `CHANGELOG.md`, en la sección *Unreleased*.
- Para publicar una versión: `npm version minor` (o `patch` / `major`), mueve *Unreleased* a la nueva versión y ejecuta `git push --follow-tags`.
- Para los commits se usa [Conventional Commits](https://www.conventionalcommits.org/es/) (`feat:`, `fix:`, `chore:`…).
