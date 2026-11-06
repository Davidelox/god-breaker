# Beast Breaker

Rompebloques por turnos en pixel art: destruye bloques, captura criaturas y completa la colección (también las shiny).
Hecho con [Phaser 4](https://phaser.io) y Vite. Se juega en el navegador y está preparado para llevarlo a móvil con Capacitor.

## Comandos

```bash
npm install      # instalar dependencias
npm run dev      # servidor de desarrollo (http://localhost:5173, también accesible desde el móvil en tu red)
npm test         # tests
npm run build    # versión final en dist/
```

## Parámetros de prueba (en la URL)

| Parámetro | Efecto |
|---|---|
| `?shiny` | Probabilidad de shiny del 25 % |
| `?debug` | Expone `window.__game` también en la versión final |

Ejemplo: `http://localhost:5173/?shiny`

## Estructura

```
src/
  core/      errores, guardado versionado, números aleatorios
  data/      criaturas, tipos y tabla de eficacia, especiales
  gfx/       sprites generados por código y componentes de interfaz
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
