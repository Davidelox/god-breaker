# Changelog

Todos los cambios importantes de este proyecto se anotan aquí.
Formato: [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) · Versiones: [SemVer](https://semver.org/lang/es/).

## [Unreleased]

### Avisos
- Los letreros de información de arriba (explicación de los hechizos y demás avisos) duran 1 segundo más (2,1 s) y se desvanecen poco a poco en lugar de desaparecer de golpe.

### Apuntado
- El punto de choque de la línea de apuntado también se marca en las paredes y el techo, no solo en los bloques.

### Equilibrio
- Barra de magia (100 = un hechizo): bloque normal +4, bestia +10, dios +40 (antes +6, +12 y +50; MAGIC_GAIN en config.js).
- Nuevas probabilidades de captura: Común 60 % (dioses 25 %), Rúnico 75 % (40 %), Divino 90 % (60 %). Las gold, siempre 100 %.
- Rareza de las bestias que salen: común 50 %, poco común 30 %, rara 20 % (RARITY_WEIGHTS en config.js).
- Cada fila nueva trae de 3 a 6 bloques y crece con la partida (ROW_BLOCKS_BY_TURN en config.js): turnos 1-5, 3 (60 %) o 4 (40 %); turnos 6-15, 3 (25 %), 4 (35 %), 5 (30 %) o 6 (10 %); desde el turno 16, 3 (15 %), 4 (30 %), 5 (35 %) o 6 (20 %).
- En un lanzamiento con hechizo, todo lo que suma al medidor gold (bloques de más, dioses, tablero limpio y capturas de ese lanzamiento) vale la mitad (SHINY_MAGIC_FACTOR).

### Fin de partida
- Efecto de derrota: destello rojo y temblor, el tablero se oscurece, los orbes desaparecen y los bloques se desmoronan y caen de abajo arriba soltando polvo.
- Música de derrota: pista lenta en la menor (Am - F - Dm - E) con coro, bajo largo, timbal suave y una melodía de trompa que desciende. Entra tras el sonido de derrota y suena hasta salir del cartel.
- Cartel de derrota más detallado: entra desde arriba con una franja roja «GAME OVER», la puntuación grande contando hacia arriba, récord o cinta «NEW BEST!», y las estadísticas de la partida (turno alcanzado, bloques rotos, bestias y dioses derrotados, hechizos lanzados, mejor lanzamiento y capturas). Debajo, las miniaturas de las últimas capturas de la partida (las gold con brillo). Las estadísticas se guardan también con la partida en curso.

### Orbes
- Estela más transparente.

### Hechizos y barras
- Con dos hechizos iguales guardados, los dos huecos se juntan en un solo botón ancho con el nombre del hechizo y «MAX» (p. ej. «BOLA DE FUEGO / MAX»), que activa los dos a la vez.
- Barra de magia bloqueada con los dos huecos llenos: se ve llena en gris con «FULL» / «LLENA». Barra gold bloqueada durante los turnos de oro: llena en dorado apagado con «ACTIVE» / «ACTIVO», y ya no suma nada hasta que terminan.

### Orbes
- Estela nueva: una línea fina y luminosa (halo del color del orbe y núcleo blanco, con mezcla aditiva) de unos 40 px que sigue el recorrido, también en los rebotes, y se estrecha y apaga hacia atrás. Sustituye a las copias del orbe que se veían antes.

### Modo gold
- Con el medidor gold lleno (probabilidad gold aumentada), el fondo del tablero se tiñe de un dorado cálido y suave sobre el color del clima, con destellos dorados que aparecen y se apagan poco a poco por el tablero. Al terminar, el fondo vuelve a su color.
- Cartel dorado a la izquierda del botón de velocidad con los turnos gold que quedan («GOLD 3» / «ORO 3»); sustituye al texto pequeño que había a la derecha del menú.

### Aparición de criaturas
- Las criaturas ya capturadas salen con la mitad de probabilidad que las que faltan (CAUGHT_WEIGHT = 0,5 en config.js), dentro de su rareza. A los dioses se les aplica lo mismo al elegir el siguiente, sin repetir hasta que salen todos.

### Tablero
- Sin bordes laterales: el ancho lógico pasa de 360 a 336 (= 7 casillas de 48), así que el tablero ocupa todo el ancho y la cuadrícula está formada por cuadrados exactos, también en las columnas de los lados. Las paredes de los rebotes son los bordes del tablero, que en el móvil y en el escritorio coinciden con los de la pantalla (en una pantalla más ancha de lo normal, el tablero queda centrado).

### Idioma
- En español, la huida de una criatura muestra «HA HUIDO!!».

### Criaturas vistas
- La primera vez que una criatura sale en una partida, su bloque la muestra como silueta negra; desde entonces cuenta como «vista» (se guarda en save.seen). Las gold se ven siempre doradas.
- Colección con tres estados: nunca vista (silueta negra), vista pero no capturada (transparente, con su nombre en la ficha: «Seen, not captured yet») y capturada (color normal). La vista gold no cambia.

### Partida
- Línea de apuntado con los puntos más juntos (cada 8 px). Ya no se corta en el primer bloque: marca el punto de choque y sigue por encima de los bloques, transparente, hasta la pared o el techo.

### Menú principal
- Botones de colores por sección: jugar/continuar en verde, nueva partida en verde claro, colección en azul, misiones en naranja y guía en morado.

### Idioma
- Opción de idioma en el menú principal: «LANGUAGE: ENGLISH» / «IDIOMA: ESPAÑOL». Se guarda en los ajustes y traduce todo el juego: menús, partida, avisos, tutorial, guía, colección, misiones, mitologías, rarezas, orbes, climas y hechizos (los nombres de las criaturas no cambian).
- Sistema de traducción en src/i18n.js (t()) con el diccionario en src/data/es.js: la clave es el texto inglés, con {0}, {1}… para los valores. Los textos fijos se traducen solos al dibujarse (text, botones y avisos); los títulos de misiones con números usan patrones.
- La fuente pixel no tiene vocales mayúsculas con tilde: en mayúsculas se escriben sin tilde (la Ñ, ¡ y ¿ sí se ven).

### Partida
- El botón de velocidad tiene el mismo alto y tamaño de letra que el de pausa, con su color de siempre.
- Bestias más grandes dentro de su bloque (con el número de vida algo más pequeño para que se vean) y dioses que ocupan todo su bloque de 3x2.

### Dioses
- Los dioses ocupan 6 casillas: 3 de ancho y 2 de alto (GOD_W / GOD_H en config.js). Los bloques tienen ahora ancho y alto (w / h) en lugar de un solo tamaño. Las partidas guardadas con dioses de 2x2 se cargan con el nuevo tamaño.

### Hechizos
- Fireball: daña todos los bloques de alrededor (8 casillas). MAX: hasta 2 casillas de distancia.
- Overgrowth: +50 % de orbes. MAX: el doble.
- Chain Lightning: cada golpe salta a 4 bloques al azar de todo el tablero. MAX: 6.
- Tidal Wave: orbes grandes que atraviesan los 2 primeros bloques. MAX: los 3 primeros, con el mismo tamaño de orbe (ya no atraviesa todo ni hace doble daño).
- Stone Rain: destruye los 2 bloques con más vida; a un dios le quita el 50 % de su vida total. MAX: 3 bloques, y el 80 % a un dios.
- Nuevo hechizo Shadow Bounce (elemento Darkness, DRK, morado): los orbes rebotan una vez en el suelo antes de volver.
- Shadow Bounce MAX: además del rebote, da una vida extra para el resto de la partida (no se acumula; se ve «+1 LIFE» arriba y se guarda con la partida). Si un turno fuera a hacerte perder, se gasta: ese turno las filas no bajan, no sale fila nueva (un dios que tocara se pospone) y el lanzador pasa a la columna más cercana sin bloque justo encima.
- La guía muestra los 7 hechizos con su efecto normal y MAX, y el dios de 3x2.

### Pantalla de juego
- El tablero ocupa todo el ancho: los rebotes laterales son los propios bordes de la pantalla (WALL_L / WALL_R en config.js). Los bloques siguen en su cuadrícula centrada; el fondo, el clima, la línea de peligro y los efectos llegan de borde a borde.
- Barra inferior a todo el ancho y con botones más alargados: 2 hechizos, orbes RUNIC y DIVINE, y la bajada rápida ▼ en la esquina inferior derecha (siempre visible; activa solo con los orbes en juego). Se quita el botón COMMON: sin orbe especial activado se lanza el común, y RUNIC y DIVINE se activan de uno en uno.
- Arriba quedan la velocidad y la pausa, que ahora es más grande y dorada.

### Capturas
- Cartel de captura nueva rehecho para que se lea: a tamaño real (antes se encogía y el texto quedaba borroso), con el sprite a la izquierda, el nombre en la fuente de lectura y el origen en una etiqueta. Con varias capturas a la vez, una fila por criatura (hasta 4 por cartel).

### Hechizos MAX
- Al lanzar dos hechizos iguales: destello del color del elemento, golpe de zoom, rayos girando tras el cartel, «MAX!» gigante, brillo que cruza la banda, ondas desde el lanzador, fuentes de partículas en las esquinas y un aura en los bordes del tablero durante todo el lanzamiento.
- Cada golpe MAX es más vistoso: Fireball con explosión doble y temblor, Tidal Wave con ola doble y salpicadura, Ice Lance con esquirlas en estrella, Chain Lightning con rayos el doble de gruesos y ondas, Stone Rain con rocas más grandes e impacto enorme, y Overgrowth con estallido de hojas y flores.

### Partida guardada
- Guardado automático de la partida en curso al empezar cada turno (localStorage `godbreaker.run`, aparte del guardado principal; ver src/core/run.js): bloques con su vida, bestias y dioses (también gold), orbes, hechizos, orbes especiales, medidores, clima, posición del lanzador, dioses pendientes y capturas de la partida.
- «QUIT TO MENU» ya no termina la partida: en el título aparece «CONTINUE» (y el turno de la partida guardada) para seguir desde el principio del turno en que se salió. También al cerrar la app.
- «NEW GAME» pide confirmación, da por terminada la partida guardada (cuenta para el récord) y empieza otra. Al perder o al borrar el progreso se borra la partida guardada.

### Orbes
- Los orbes son ligeramente ovalados en la dirección en la que van: se alargan más cuanto más rápido se mueven y se aplastan un poco al tocar una pared o un bloque. La estela sigue la misma forma.
- Mantener pulsada la pantalla mientras vuelan los orbes duplica la velocidad (también sobre la velocidad automática); al soltar vuelve a la normal. El botón de velocidad muestra la velocidad real.

### Orbes y rebotes
- Velocidad base más baja en todas las velocidades (BALL_SPEED 620 → 470 px/s) y algo más de separación entre orbes al lanzar (LAUNCH_DELAY 115 → 150 ms).
- Aceleración tras los rebotes: al rebotar el orbe sale al 55 % de su velocidad y acelera hasta la normal en unos 0,35 s (BOUNCE_SLOW / BOUNCE_RECOVER en config.js).
- Contacto visible en paredes y techo: el fotograma del rebote el orbe se dibuja tocando el muro, y se marca el punto de contacto con un destello (antes solo en los bloques). A alta velocidad ya se ve el choque.
- Esquinas de los bloques casi en ángulo recto en la física (CORNER_R 4 → 1): el golpe de esquina ocurre en la esquina real. Al dar en una esquina el orbe sale con un pequeño desvío aleatorio (casi siempre pequeño, como mucho 12°, CORNER_JITTER); se mantiene la rara salida en vertical del Ataque vertical.
- Orbes más grandes (radio 6 → 8) y del mismo tamaño con cualquier hechizo (los orbes extra de Overgrowth ya no laten); con Tidal Wave son aún más grandes (12, y 14 en MAX).
- Cuando ningún orbe en juego puede golpear un bloque, la velocidad automática pasa a x6 (antes x5).

### Capturas
- Huida más clara: si la captura falla, el orbe se rompe en trozos, la criatura da un salto de susto y se va corriendo a saltitos (con polvo) por un lado de la pantalla elegido al azar, con un «ESCAPED!» grande.
- El cartel de nueva captura aparece más pequeño en la esquina inferior izquierda del tablero, entrando y saliendo por la izquierda, y dura algo más.

### Tutorial y guía
- Consejos en la primera partida, la primera vez que pasa cada cosa: apuntar y lanzar, cada ronda, bestias, orbe extra, huida, hechizos, velocidad, dioses, bestias gold y peligro. Paran la partida hasta pulsar GOT IT; SKIP TIPS los desactiva. Se guardan en el guardado (tutorial), también al borrar el progreso.
- Fuente más legible en los textos de la guía y de los consejos: VT323 (pixel art de lectura); los títulos siguen con Press Start 2P.

### Bloques
- Nuevo diseño pixel art: sombra proyectada, borde con esquinas recortadas, bisel (luz arriba a la izquierda, sombra abajo a la derecha), textura de piedra tramada y brillo en la esquina.

### Pantalla
- iPhone (acceso directo): se reservan siempre como mínimo 59 px arriba y 34 abajo para la isla / muesca y la barra de inicio, también cuando la app se abre en modo pantalla completa; si al poco de arrancar iOS da una zona segura mayor, la página se recarga una vez para recolocarlo todo. El manifiesto pasa a display «standalone», el modo que mejor soporta iOS.

### Pantalla
- iPhone: la parte de arriba ya no queda tapada por la isla dinámica o la muesca. La zona segura se mide cuando la página ya está maquetada (el juego se carga desde src/app.js después del primer fotograma), y si iOS aún la da como 0 en el modo pantalla completa se usan 59 px arriba y 34 abajo.

### Orbes e impactos
- Estela tipo cometa: en lugar de una sola sombra, cuatro copias del orbe cada vez más pequeñas y transparentes siguen su recorrido (también en los rebotes), formando una cola continua y suave. Ajustable con GHOSTS en GameScene.js.
- Al rebotar en un bloque se marca el punto exacto de contacto con un pequeño destello en su borde.
- Los bloques ya no cambian de color ni de tamaño al recibir un golpe (antes destello blanco, tinte rojo en las bestias y encogimiento): ahora solo vibran un poco en horizontal. Al no encogerse, el orbe siempre se ve tocando el borde real del bloque.

### Vibración
- Vibración al golpear bloques (toque corto, como mucho cada 70 ms), al romperlos (toque más largo) y al derrotar a un dios o hacer un Ataque vertical (tres toques). En Android usa la API de vibración; en iPhone (iOS 18 o posterior) usa el toque háptico de un interruptor nativo oculto, porque Safari no tiene API de vibración. En iOS anteriores no vibra.
- Opción «VIBRATION ON/OFF» en la pausa; se guarda con los ajustes (activada por defecto).

### Pantalla
- En el móvil el juego cubre toda la pantalla, sin franjas en los laterales ni abajo: el lienzo tiene exactamente la proporción de la pantalla y se extiende también por la zona de la hora y la de la barra de inicio. Los fondos llegan hasta los bordes y el contenido se mantiene dentro de la zona segura (SAFE_TOP / SAFE_BOTTOM en config.js). En escritorio todo queda igual (360x640).
- Parámetro de prueba ?safe=59,34 para simular en el navegador la zona segura de un iPhone (arriba, abajo).

### Colección
- 19 seres divinos de otras mitologías pasan a ser dioses (legendarios): Cailleach y Fomorian (celtas), Simargl (eslavo), Nuberu y Basajaun (ibéricos), Laume e Hiisi (europeos), Yatagarasu y Daidarabotchi (japoneses), Zhulong (Asia oriental), Garuda, Kamadhenu y Shesha (hindúes), Pazuzu y Lamassu (Oriente Medio), Camazotz y Amaru (americanos), Inkanyamba (africano) y Taniwha (oceánico). Ahora hay 119 dioses y 481 seres. Bajan como jefes igual que el resto de dioses, y la colección muestra su panteón («Japanese god»…). Ninguna bestia cambia de número, así que el guardado sigue valiendo.
- Marco de color por rareza en la colección: verde común, azul poco común, morado rara y dorado los dioses.
- El selector de mitología pasa a ser una fila de botones (ALL y uno por cada mitología, con su color y abreviatura), en lugar de flechas y lista desplegable. Debajo se muestra la sección elegida y su progreso.
- Nuevo filtro «GODS» para ver solo los legendarios (dioses), combinable con la mitología, «CAUGHT» y la vista gold.

### Colección
- La colección se divide en secciones por mitología: un selector «< NORSE 7/103 >» bajo la cabecera recorre «ALL BEASTS» y los 14 orígenes, con las capturadas y el total de cada uno (en la vista gold, las capturadas en gold). Al tocar el nombre se abre una lista con todas las mitologías y su progreso para saltar a cualquiera. Las flechas arriba/abajo del teclado también cambian de sección. La sección y el filtro «CAUGHT ONLY» se recuerdan mientras el juego esté abierto.
- La cuadrícula aprovecha el alto disponible: 6 filas en pantallas 9:16 y hasta 8 en móviles alargados.

### Pantalla
- En móviles alargados (iPhone) el juego ocupa todo el alto, sin franjas negras: el alto lógico se adapta a la pantalla (de 640 a 800). En la partida el tablero no cambia de tamaño; el espacio extra hace más grandes el menú superior (marcador en grande y botones mayores) y el inferior (botones de hechizos y orbes más altos). En pantallas 9:16 o de escritorio todo queda igual que antes.

### Balance
- En el turno en que baja un dios no sale ningún otro bloque ni bestia (solo puede salir el orbe extra +1).
- Si la llegada de un dios (que hace bajar el tablero 2 filas) te haría perder, se pospone: ese turno el tablero baja solo 1 fila y aparece el aviso «A GOD WAITS FOR ROOM». El dios llega en el primer turno en que haya sitio.
- Probabilidad de gold: 3 % siempre (antes 1 %) y 11 % con la barra gold llena, durante 3 turnos (antes 3 %).
- Capturar bestias también llena la barra gold: +10 por bestia y +25 por dios. La guía lo menciona.

### Física
- La estela de luz de los orbes se sustituye por una sombra: una copia del orbe muy transparente (18 %) que le sigue a 14 px por su recorrido, incluidos los rebotes. Se mantiene el resplandor suave alrededor del orbe. Ajustable con GHOST_DIST y GHOST_ALPHA en GameScene.js.
- Esquinas de los bloques redondeadas en la física (CORNER_R = 4 px): el ángulo de salida depende del punto exacto del golpe y desaparece el desvío aleatorio en las esquinas. La línea de apuntado usa el mismo choque.
- Corregido el empuje tras el rebote con las esquinas redondeadas, que metía el orbe ~4 px dentro del bloque y podía contar varios golpes por rebote.
- El Ataque vertical sigue siendo posible: un golpe en la curva de una esquina puede dejar el orbe en vertical (2 %).
- Más separación entre orbes: ~70 px a x1 (antes ~59) y creciendo con la velocidad (~110 px a x4), para que la ráfaga no se vea tan cargada.

### Performance
- Tablero con muchos bloques y dioses mucho más ligero de dibujar (de 134 a 38 llamadas de dibujo por fotograma con 40 bloques y 2 dioses): el fondo de cada bloque es una imagen en lugar de una forma, el número de vida usa una fuente de mapa de bits generada al arrancar (sin rasterizar texto) y la marca «!» y las barras de vida de los dioses son imágenes. Antes cada bloque cortaba el lote de dibujo varias veces.
- Menos tirones en móvil durante los lanzamientos:
  - El marcador y el número de vida de los bloques ya no se redibujan en cada golpe (cada cambio de texto se rasteriza y se sube a la GPU): el marcador se actualiza como mucho cada 60 ms y cada bloque cada 80 ms, con el valor final siempre al acabar el turno.
  - Los destellos de golpe se apagan en un repaso por fotograma en lugar de crear dos temporizadores por golpe.
  - Física: la caja de cada bloque y el nivel de Maremoto se calculan una vez por fotograma (antes, en cada paso de cada orbe) y se descartan los bloques lejanos sin cálculos ni objetos nuevos.
  - Música de combate: se programa pulso a pulso en lugar del compás entero de golpe, y el ostinato, el bajo y los charles comparten filtros (unos 60 nodos de audio menos por compás). Suena igual.

### Added
- Publicación automática en GitHub Pages (`.github/workflows/deploy.yml`): en cada push a master se pasan los tests, se compila y se publica.
- Instalable en la pantalla de inicio del móvil: manifiesto web, icono propio (`scripts/make-icons.mjs`), pantalla completa en iPhone y márgenes para la muesca.
- Estela de luz en los orbes: halo del color del orbe y núcleo blanco, translúcidos, que se estrechan y se apagan, con brillo aditivo y un resplandor suave alrededor de cada orbe. Mide como mucho 48 px, menos que la separación entre orbes, para que una ráfaga no forme una línea continua.
- Orbes con más contraste: contorno casi negro y colores más saturados, para que se vean sólidos sobre el tablero.
- Colección: botón «CAUGHT ONLY» para ver solo las bestias capturadas (en la vista gold, solo las capturadas en gold). Se recuerda mientras el juego esté abierto.
- Música de combate épica durante la partida (generada con Web Audio): 112 BPM, tambores graves tipo taiko con redobles al final de cada frase, caja y charles, bajo, ostinato de cuerdas en semicorcheas, acordes de metales, coro y una melodía heroica que entra tras 4 compases; cada 16 compases hay un puente más intenso. Sigue los acordes del clima. En los menús suena la música ambiente de siempre.
- Logo nuevo en la pantalla de título: «GOD» en oro con degradado, contorno grueso y sombra, entre ramas de laurel; «BREAKER» en plata con líneas ornamentales; halo y rayos girando detrás, destellos sobre las letras y animación de entrada con sacudida y destello.
- Escaparate en la pantalla de título: una sola bestia flotando que va cambiando cada pocos segundos entre las capturadas, incluidas sus versiones gold (con aura y destellos dorados), con su nombre y origen. Sin capturas, muestra la silueta de un dios.

### Changed
- El juego pasa a llamarse **God Breaker** (título, pestaña del navegador y `package.json`). Las claves del guardado no cambian, así que el progreso se conserva.
- Todo el juego está en inglés: menús, guía, misiones, avisos, pantalla de error, climas, hechizos (Fireball, Tidal Wave, Overgrowth, Chain Lightning, Ice Lance, Stone Rain), orbes (Common, Runic, Divine), orígenes y los nombres del bestiario en su forma inglesa (Cerberus, Phoenix, Athena, Thoth…). La documentación sigue en español.
- La versión shiny pasa a ser la versión **gold**: los sprites se vuelven dorados (cada color pasa a la rampa de oro según su luminosidad) en lugar de cambiar de tono. Vale también para las imágenes del pack sin `imagenShiny`. El parámetro de prueba `?gold` funciona igual que `?shiny`.
- La Meiga gallega sustituye al Ventolín, cuyo nombre coincide en inglés con una marca registrada.

### Removed
- Subtítulo de la pantalla principal.

### Balance
- No aparecen bestias en los 4 primeros turnos (los dioses siguen apareciendo cada 8 turnos).
- Probabilidad de que un bloque sea una bestia: del 15 % al 11 %.
- Como mucho aparece una bestia por turno, y ninguna en el turno en que baja un dios.

### Added
- Premisa: eres un cazador humano encargado de vencer y capturar seres míticos y dioses, usando orbes como proyectiles.
- Bestiario mitológico (`src/data/bestiary.js`) con 600 bestias agrupadas por su procedencia:
  - 500 seres de la mitología y el folclore de 14 orígenes: grecorromana, nórdica, egipcia, celta y británica, eslava, ibérica, europea, japonesa, Asia oriental, India y Malasia, Oriente Medio, americana, africana y oceánica.
  - 100 legendarios, que son dioses: 34 griegos, 33 nórdicos y 33 egipcios. La colección muestra su panteón.
- Sprites nuevos para las 600 bestias, generados a partir de su representación tradicional (`src/gfx/beastArt.js`): Anubis con cabeza de chacal y cetro, Medusa con serpientes en el pelo, Cerbero con tres cabezas, Pegaso con alas, Odín tuerto con sombrero y lanza… Se dibujan al doble de resolución que antes, con contorno entre piezas, y la versión shiny cambia el tono de los colores.
- `tools/bestiario.html`: hoja con todos los sprites, filtrable por origen y nombre (`?n=Zeus,Anubis&k=5` para verlos grandes).
- Campos nuevos en `criaturas.json`: `origen`, `sprite` (descripción del dibujo) y `panteon` (`griega`, `nordica` o `egipcia`).

### Changed
- El catálogo por defecto y el pack incluido son ahora el bestiario, ordenado por origen (cada origen con sus seres y después sus dioses). Los id 1-600 pasan a ser bestias nuevas: las capturas de guardados anteriores se conservan, pero apuntan a la bestia que ahora tiene ese id.
- Los tipos de las bestias se sustituyen por su origen mitológico, que da el color del bloque. Las misiones por tipo pasan a ser por origen («Japonesa al completo»…).
- Los hechizos conservan su elemento (fuego, agua, naturaleza, rayo, hielo y tierra) con colores propios, independientes de las bestias.
- Los poderes pasan a ser hechizos elementales, con la misma función: Bola de fuego, Maremoto, Germinación, Cadena de rayos, Lanza de hielo y Lluvia de rocas. La barra de PODER pasa a llamarse MAGIA.
- Las bolas pasan a ser orbes (común, rúnico y divino), con un sprite nuevo de esfera de cristal en cian, violeta y dorado.
- Los textos de legendarios hablan de dioses: «¡Desciende un dios!», «¡DIOS DERROTADO!», misiones «Captura un dios», etc.

### Removed
- Sistema de debilidades por tipo: todos los golpes hacen el mismo daño. Desaparecen «¡MUY EFICAZ!» / «poco eficaz», el parpadeo naranja y gris y la página TIPOS de la guía.
- Generador de nombres inventados de `scripts/generate-pack.mjs`: ahora el script vuelca el bestiario.
- Sprites antiguos de «manchas» simétricas generadas al azar.

## [0.19.0] - 2026-11-06

### Added
- Sistema de packs de contenido en `public/pack/` (explicado en `public/pack/LEEME.md`):
  - `criaturas.json`: catálogo de criaturas (id, nombre, tipo, rareza, legendaria y PNG opcionales normal y shiny).
  - `bolas.json`: nombre e imagen PNG opcional de las bolas normal, super y ultra.
  - Las entradas con errores se ignoran y quedan anotadas en el registro de errores. Si falta el pack, se usa el contenido por defecto.
  - Las imágenes del pack se encajan al tamaño de los sprites. Si una criatura tiene imagen pero no `imagenShiny`, su shiny se obtiene cambiando los colores.
- Pack provisional de 1025 criaturas (64 legendarias, 8 por tipo) con nombres inventados y sin imágenes, y 3 bolas. Las 72 primeras son las actuales con el mismo id, así que los guardados siguen valiendo.
- `scripts/generate-pack.mjs` para regenerar el pack provisional (`node scripts/generate-pack.mjs 1025`).
- Colección: botones `<<` y `>>` para saltar de 10 en 10 páginas cuando hay muchas.

### Changed
- Las texturas de criaturas se crean bajo demanda en lugar de todas al arrancar, para que el inicio siga siendo rápido con más de 1000 criaturas.
- Las misiones se recalculan según el catálogo cargado. Se ocultan las imposibles, por ejemplo «50 distintas» con un catálogo menor.

## [0.18.1] - 2026-11-06

### Changed
- El color del parpadeo al golpear una criatura depende de la eficacia: naranja si es muy eficaz, gris si es poco eficaz y rojo si es normal.
- Bola super: fondo blanco y borde azul. Bola ultra: fondo amarillo y borde negro.
- Después de lanzar con una bola especial (super o ultra), la selección vuelve sola a la bola normal.

## [0.18.0] - 2026-11-06

### Added
- Bolas de lanzamiento con sprite propio por tipo, con estela y lanzador a juego:
  - Normal: anillo rojo y centro blanco.
  - Super: anillo azul y centro rojo.
  - Ultra: rayas diagonales amarillas y negras.
- Con un poder activo, o en las bolas añadidas por Enredadera, la bola se pinta del color del poder.
- Las criaturas parpadean en rojo al recibir un golpe.
- Derrota de legendario más espectacular:
  - Cámara lenta breve, destello blanco, sacudida fuerte y zoom.
  - Cadena de 6 explosiones alrededor y onda expansiva doble dorada y blanca.
  - Fuente de estrellas y monedas, y cartel «¡LEGENDARIO DERROTADO!» con su nombre.
  - «+300» grande y fanfarria.

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
