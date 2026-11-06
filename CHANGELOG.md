# Changelog

Todos los cambios importantes de este proyecto se anotan aquí.
Formato: [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) · Versiones: [SemVer](https://semver.org/lang/es/).

## [Unreleased]

## [0.17.0] - 2026-11-06

### Added
- Botón BORRAR PROGRESO en el menú principal, con confirmación. Borra capturas, misiones, récord y estadísticas y mantiene los ajustes (velocidad, música, sonido y cuadrícula).

### Changed
- Vuelve la fila vacía bajo la línea de derrota: el tablero llega otra vez hasta abajo, pero el disparo sigue saliendo desde la línea (`BOARD_FLOOR_Y`).
- Al derrotar a un legendario, también se tienen en cuenta los bloques que estaban en sus filas. Desde su fila hacia abajo, cada fila ocupada se coloca justo debajo de la anterior fila con bloques. Desaparecen las filas que quedan vacías (como la que ocupaba el legendario) y cada bloque conserva su columna.

## [0.16.0] - 2026-11-06

### Changed
- El disparo sale desde la línea de derrota (la línea roja), no desde abajo del todo. Las bolas vuelven a esa misma línea y el tablero termina en ella.
- Los botones de poderes y bolas suben justo debajo de los medidores, para que no quede un hueco entre ellos.

## [0.15.3] - 2026-11-06

### Changed
- Al derrotar a un legendario, todo lo que hay desde su fila hacia abajo sube en bloque y conserva su formación: cada bloque mantiene su columna y su distancia con los demás. Sube hasta quedar justo debajo de la primera fila con bloques que haya por encima, o hasta la fila de aparición.

## [0.15.2] - 2026-11-06

### Changed
- Al derrotar a un legendario suben todos los bloques y bolas extra desde su fila hacia abajo, en cualquier columna (antes, solo los que estaban bajo sus columnas). Cada uno sube hasta quedar justo debajo de otro bloque o hasta la fila de aparición.

## [0.15.1] - 2026-11-06

### Changed
- El escaparate de captura solo aparece la primera vez que se captura cada criatura. Las capturas repetidas se quedan con sus destellos y «+100».
- Las capturas nuevas que llegan casi a la vez (mismo lanzamiento) se muestran todas juntas en una sola tarjeta: «¡N NUEVAS CAPTURAS!», en cuadrícula de hasta 3 columnas y 6 criaturas por tarjeta. Si hay más, salen varias tarjetas seguidas.

## [0.15.0] - 2026-11-06

### Added
- Escaparate de captura. Al capturar, aparece en el centro del tablero una tarjeta con la criatura en grande, flotando y con aura de su color, rayos girando detrás, «¡CAPTURADO!» y el nombre y tipo.
  - Etiqueta «NUEVO» si es la primera vez. Versión dorada con destellos y «¡SHINY CAPTURADO!» para las shiny.
  - No pausa el juego. Las capturas seguidas se muestran en cola, y más rápido si se acumulan. Sustituye al mensaje de texto de captura.
- Al derrotar a un legendario, los bloques y bolas extra que estaban debajo de sus columnas suben hasta quedar justo debajo de otro bloque (o hasta la fila de aparición).

## [0.14.0] - 2026-11-06

### Added
- Barra de vida en los legendarios, bajo el sprite y encima del número. Es verde por encima del 50 %, amarilla hasta el 25 % y roja por debajo. Un rastro blanco se queda atrás un instante tras cada golpe para que se note el daño.

## [0.13.1] - 2026-11-06

### Changed
- Número de vida de los bloques al doble de tamaño (16 px, borde más grueso). Con 3 o más cifras se reduce lo justo para caber en el bloque. En los bloques con criatura, el sprite sube un poco para dejar sitio.

## [0.13.0] - 2026-11-06

### Changed
- Bola extra +1: como máximo una en pantalla. Tras recogerla deben pasar 2 tiradas antes de que pueda salir otra (`PICKUP_COOLDOWN`). Cuando está permitido, sale con un 50 % de probabilidad por fila (`PICKUP_CHANCE`).
- Legendarios: salen en orden aleatorio y no se repiten hasta que hayan salido los 8.
- El primer turno empieza con una sola fila de bloques.

## [0.12.0] - 2026-11-06

### Added
- Munición +1 automática en cada ronda (`BALLS_PER_TURN`), además de las bolas extra recogidas. Al acabar el turno sale «+N» sobre el lanzador.

### Changed
- La vida de los bloques es progresiva y la misma para todos los bloques nuevos de una ronda: turno x1,3 redondeado (`HP_PER_TURN`). Se quitan la variación aleatoria y los bloques pesados.
- Criaturas: +12 % de vida, +2 % más por cada nivel de rareza (común 12 %, poco común 14 %, rara 16 %). Constantes `CREATURE_HP_BONUS` y `CREATURE_HP_PER_RARITY`.
- Bola extra +1: del 60 % al 30 % de las filas (`PICKUP_CHANCE`), ajustado con simulaciones al ganar ahora +1 bola fija por ronda.
- La guía menciona la bola extra de cada ronda.

## [0.11.0] - 2026-11-06

### Added
- Celebración de pantalla limpia en el mismo instante en que cae el último bloque:
  - Destello, sacudida y pulso de zoom de cámara.
  - Tres ondas doradas y blancas, rayos de luz girando y lluvia de estrellas y confeti.
  - Cartel grande «¡PANTALLA LIMPIA!» que rebota, con «+500 BOLA ESPECIAL».
  - Fanfarria con destello sonoro.
- Ajustes de dificultad en `config.js`: `HP_PER_TURN`, `HEAVY_CHANCE`, `PICKUP_CHANCE`, `ROW_GROWTH_TURNS` y `BOSS_HP`.

### Changed
- Más difícil:
  - Vida de los bloques = turno x1,3 (±20 %), con un 25 % de bloques pesados de vida doble.
  - La bola extra +1 sale en el 60 % de las filas, no en todas.
  - Las filas se llenan antes: un bloque más cada 5 turnos (antes, 6).
  - Legendarios con más vida (20 + turno x8).
- Con un jugador automático sencillo, las partidas pasan de unos 16 a unos 12 turnos.

### Fixed
- «Reintentar» después de haber visto el aviso de legendario cerraba el juego con un error, porque reutilizaba el aviso de la partida anterior.

## [0.10.2] - 2026-11-06

### Added
- Las criaturas que aún no tienes en la colección llevan una pequeña exclamación roja que flota en la esquina de su bloque. Al capturar una, la exclamación desaparece del resto de bloques de esa criatura.

### Changed
- Onda expansiva más grande al destruir bloques: anillo del color del bloque de mayor alcance, segundo anillo blanco y una onda de relleno tenue. Los bloques vecinos se sacuden con la onda (con los legendarios, hasta 2 casillas).

## [0.10.1] - 2026-11-06

### Changed
- Torrente (agua): cada bola atraviesa como máximo 3 bloques (`WATER_PIERCE`). Al agotarse hace una pequeña salpicadura, pierde el color azul y vuelve a rebotar normal.
- Torrente MAX: atraviesa todos los bloques sin límite y conserva las bolas más grandes y el doble daño.

## [0.10.0] - 2026-11-06

### Added
- Ataque vertical: si una bola queda rebotando en vertical, a los 6 rebotes rompe la columna entera. Da los puntos de romper esos bloques más 200 de bonus y 50 por bloque, con haz de luz, sacudida, mensaje y sonido. Vale también contra legendarios.
- COMBO: al lanzar 2 poderes distintos aparece una banda partida con el color de cada tipo, «¡COMBO!», las siglas y los nombres.
- Poderes MAX: dos poderes iguales a la vez dan una versión mejorada, con banda dorada y «¡PODER MAX!».
  - Estallido MAX: daño completo (no la mitad) y alcance de 2 casillas.
  - Torrente MAX: bolas aún más grandes y doble daño.
  - Enredadera MAX: triple de bolas.
  - Arco voltaico MAX: salta a 4 bloques y llega más lejos.
  - Escarcha MAX: triple daño.
  - Derrumbe MAX: golpea a los 4 bloques con más vida.
- Indicador del poder activo junto al lanzador durante el turno (p. ej. «FUE+ELE» o «PLA MAX»).

### Changed
- Enredadera: solo las bolas añadidas son verdes. Salen con un destello verde, laten mientras vuelan y sueltan hojas al golpear. Las bolas normales mantienen su color (o el del otro poder o bola especial).
- Los nombres de los poderes en mayúsculas se muestran sin tilde, porque la fuente no tiene esos glifos.

## [0.9.0] - 2026-11-06

### Added
- 32 criaturas nuevas, 4 por tipo (id 41-72). Hay 72 en total: 64 normales y 8 legendarias.
- Las nuevas se añaden al final, así que los id y los guardados anteriores siguen siendo válidos.
- Colección paginada: 35 por página, 3 páginas, con < > o las flechas del teclado.
- Misión «50 bestias distintas».

### Changed
- Derrumbe (roca): las rocas caen sobre los 2 bloques con más vida y les quitan directamente el 50 % de su vida actual (30 % si es legendario), sin tener en cuenta el tipo. Constantes `ROCK_PCT` y `ROCK_BOSS_PCT`.
- Las misiones «Todas las de tipo X» piden ahora las 8 criaturas normales de cada tipo. Las que ya estaban completadas siguen completadas.

## [0.8.1] - 2026-11-06

### Changed
- Se quitan las dos recogidas animadas de bolas: la de pantalla limpia y la anticipada.
- En su lugar, cuando ya se han lanzado todas las bolas y ninguna puede golpear nada más, el resto del turno pasa a velocidad x5 y el botón muestra «x5». Ocurre con la pantalla limpia o cuando todas bajan por debajo del último bloque y de las bolas extra.
- Las bolas siguen su recorrido real, así que el siguiente lanzamiento sale de donde cae la última. La velocidad elegida por el jugador no cambia.

## [0.8.0] - 2026-11-06

### Added
- Recogida anticipada: una bola que va hacia abajo y ya está por debajo de todos los bloques y bolas extra se recoge sola. Vuela en curva hasta el punto exacto donde habría caído, con destello y nota.
- Ese punto cuenta como su caída, así que la última bola en desaparecer sigue marcando el siguiente lanzamiento.

### Changed
- Cuando llega un legendario, el tablero baja 2 filas y el legendario aparece arriba del todo, por encima de los bloques actuales. Ya no ocupa un hueco reservado entre ellos. El resto de turnos sigue bajando 1 fila.
- La guía explica que con el legendario se bajan 2 filas.

## [0.7.0] - 2026-11-06

### Added
- Recogida automática: si limpias la pantalla en mitad de un lanzamiento, las bolas que siguen en el aire vuelan en curva al lanzador, en cascada, con destellos y notas ascendentes.
- Efectos de poderes:
  - Al activar un poder: destello del tablero con el color del tipo, cartel con el nombre que cruza la pantalla, sacudida, sonido y partículas en el lanzador.
  - Estallido: explosión con anillo y brasas. Torrente: ondas y gotas. Enredadera: hojas y pétalos.
  - Arco voltaico: rayos con halo y chispas. Escarcha: el bloque se cubre de hielo y suelta cristales.
  - Derrumbe: rocas más grandes que giran, con polvo, escombros y estruendo.
- Colección: contador «Bestias atrapadas» (total, con repetidas) y número de capturas (xN) en cada bestia, también en la vista shiny.
- Misiones (35), en dos pestañas:
  - Captura: total, distintas, cada tipo, legendarios y shiny.
  - Progreso: puntos, turno alcanzado, legendarios derrotados, pantallas limpias, poderes usados y partidas.
  - Barra de avance en cada misión. Aviso «¡Misión cumplida!» con sonido durante la partida. Las recompensas quedan pendientes.
- Botón MISIONES en el menú principal.
- Nuevas estadísticas guardadas: `bossKills`, `clears`, `powersUsed` y `bestTurn`. Las misiones completadas se guardan en `missions`.

### Changed
- Más separación entre bolas al lanzar (`LAUNCH_DELAY` de 55 a 95 ms, unos 60 px), para que no parezcan una línea.
- Los porcentajes de shiny que muestran el marcador, los avisos y la guía salen de `config.js`, así que reflejan tus valores (1 % base y 3 % con el medidor lleno).

## [0.6.0] - 2026-11-06

### Added
- Velocidad x1.5. El botón recorre x1, x1.5, x2, x3 y x4.
- Pantalla GUIA en el menú principal: 7 páginas visuales (objetivo, bloques, captura, poderes, tipos, shiny y controles).
- Aviso de legendario 2 turnos antes: mensaje, sonido y franja roja parpadeante en la fila superior. Cambia a «¡LEGENDARIO EL PROXIMO TURNO!» el turno anterior.
- Aparición de shiny resaltada: haz de luz, aura dorada que late, borde dorado, destellos en las esquinas, mensaje y sonido.
- Opción CUADRICULA SI/NO en la pausa (`settings.grid`).

### Changed
- La cuadrícula del tablero está oculta por defecto.
- Derrumbe (roca) no elimina a un legendario: le quita el 50 % de su salud actual.
- El sprite de la bola se escala según `BALL_R`. Antes, con `BALL_R = 6`, la bola se veía más pequeña que su colisión.
- `WATER_BALL_R` pasa a ser `BALL_R + 2`, para que Torrente siga haciendo las bolas algo más grandes.

### Fixed
- Las velocidades guardadas fuera de x1/x2/x3 (por ejemplo x4) volvían a x1 al recargar.

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
