# Changelog

Todos los cambios importantes de este proyecto se anotan aquí.
Formato: [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) · Versiones: [SemVer](https://semver.org/lang/es/).

## [Unreleased]

## [0.3.0] - 2026-11-06

### Changed
- La posición y la dirección de lanzamiento quedan fijas durante todo el turno. Antes, la primera bola en volver movía el lanzador y el resto salía desde ahí.
- Un marcador semitransparente indica dónde se lanzará el siguiente turno.
- La fila de arriba del todo siempre queda vacía: los bloques nuevos aparecen en la segunda fila (`SPAWN_ROW`).
- La guía de apuntado es mucho más corta (70 px, `AIM_GUIDE_LENGTH`).
- Torrente (agua): además de atravesar, las bolas son algo más grandes (radio 6 en lugar de 4, `WATER_BALL_R`).

## [0.2.0] - 2026-11-06

### Added
- Rebote irregular al golpear justo en la esquina de un bloque (desvío aleatorio de hasta ±14°).
- En un golpe de esquina hay un 2 % de probabilidad de que la bola salga en vertical pura. Puede quedarse rebotando entre el techo y un bloque; el botón ▼ la recoge.
- Aviso «Pulsa ▼ para recoger las bolas» si un disparo dura más de 12 segundos.

### Changed
- El botón de velocidad cambia entre x1, x2 y x3. Está siempre visible, se mantiene entre turnos y partidas y se guarda en el guardado (`settings.speed`).
- Ya no se acelera solo a x2 tras 6 segundos de disparo.
- Menos criaturas: probabilidad de bloque con criatura del 30 % al 15 %.
- Legendario solo cada 10 turnos. Se elimina el parámetro de prueba `?boss`.
- Los bloques bajan siempre exactamente una fila por turno: el legendario ya no hace bajar dos filas, porque el turno anterior le deja libres sus dos columnas.
- Escarcha ya no impide que bajen los bloques; ahora las bolas hacen el doble de daño.

## [0.1.0] - 2026-11-06

### Added
- Prototipo jugable de rompebloques por turnos con Phaser 4 y resolución vertical pensada para móvil (360×640).
- Apuntado arrastrando con el dedo o el ratón, o con las flechas y espacio. Línea de trayectoria.
- Bloques normales, bloques con criatura y jefes legendarios de 2×2. Cada 10 turnos aparece un jefe.
- 40 criaturas originales (32 normales y 8 legendarias) de 8 tipos, con sprites pixel art generados por código.
- Captura al destruir un bloque con criatura, con una probabilidad que depende de su rareza. Versión shiny con probabilidad 1/256.
- Pantalla de colección con siluetas, ficha de cada criatura y vista shiny.
- Barra de energía y 6 tiros especiales por tipo, con tabla de eficacia (x2 / x0.5).
- Bolas extra (+1), acelerar (x2) y recoger las bolas.
- Guardado versionado con validación, migraciones y recuperación de datos corruptos.
- Control de errores: registro persistente (últimos 25) y pantalla de error con «Reiniciar» y «Copiar informe».
- Tests de guardado y de datos con Vitest.
