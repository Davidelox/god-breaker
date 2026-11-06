# Changelog

Todos los cambios importantes de este proyecto se anotan aquí.
Formato: [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) · Versiones: [SemVer](https://semver.org/lang/es/).

## [Unreleased]

## [0.5.0] - 2026-11-06

### Added
- Fondos de clima animados y suaves: noche despejada, lluvia, nieve, tormenta de arena, niebla y sol radiante. El clima cambia (con fundido) cada vez que derrotas a un legendario. Es solo visual.
- Estela leve en los proyectiles, del color de la bola o del poder.
- Reacción al impacto: el bloque se encoge un instante y la criatura se tambalea (los legendarios, menos).
- Destrucción más vistosa: destello, onda, fragmentos con gravedad y sacudida de cámara (fuerte con legendarios).
- Efectos de sonido generados con Web Audio para lanzar, golpear, romper, capturar, shiny, recompensas, poderes, pantalla limpia, legendarios, botones y fin de partida.
- Música ambiente generativa y suave. Su tono cambia con cada clima.
- Botones MUSICA y SONIDO en la pantalla de título y en la pausa. Se guardan en `settings.music` y `settings.sfx`.

## [0.4.0] - 2026-11-06

### Added
- Bolas de captura: normal, super y ultra. Se elige una para cada lanzamiento y se gasta al lanzar.
  - Normal: 40 % de captura (10 % en legendarios). Super: 70 % (30 %). Ultra: 90 % (50 %).
  - Se consigue una bola super (80 %) o ultra (20 %) al limpiar la pantalla o derrotar a un legendario.
- Medidor shiny. Se llena con lanzamientos muy efectivos (más de 3 bloques destruidos), legendarios derrotados y pantallas limpias. Al llenarse, la probabilidad de shiny sube al 10 % durante 3 turnos.
- Pantalla limpia: +500 puntos, bola especial y carga del medidor shiny.
- Hasta 2 poderes guardados. Se pueden usar los dos a la vez en el mismo lanzamiento.

### Changed
- El poder que se consigue al llenar la barra es aleatorio.
- Un lanzamiento con poder activo no carga la barra. Con los 2 huecos llenos, la barra no se rellena.
- La probabilidad de captura ya no depende de la rareza, sino de la bola. Las shiny se capturan siempre.
- Probabilidad base de shiny: del 1/256 al 2 %.
- La guía de apuntado llega en línea recta hasta el borde (o el primer bloque) sin mostrar el rebote. Se elimina `AIM_GUIDE_LENGTH`.
- El siguiente lanzamiento sale desde donde desaparece la última bola, no la primera.
- Los avisos largos pasan a varias líneas.
- Barra inferior rediseñada: medidores de poder y shiny, 2 huecos de poder y selector de bola.

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
