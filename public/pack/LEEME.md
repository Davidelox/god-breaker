# Pack de contenido

Esta carpeta permite cambiar las bestias y los orbes del juego sin tocar el código.
Si borras la carpeta, o algún archivo tiene errores, el juego usa su contenido por defecto (el mismo bestiario).

El pack incluido es el **bestiario mitológico**: 500 seres de la mitología y el folclore de todo el mundo
y 100 dioses legendarios (34 griegos, 33 nórdicos y 33 egipcios), agrupados por su procedencia mitológica.
Cada bestia tiene su propio sprite generado, basado en su representación tradicional, hasta que añadas tus diseños.

## criaturas.json

```json
{
  "version": 1,
  "criaturas": [
    { "id": 1, "nombre": "Lampad", "origen": "griega", "rareza": 1, "legendaria": false, "sprite": "hum fem c:orange hairc:red item:torch aura:fire", "imagen": null, "imagenShiny": null },
    { "id": 84, "nombre": "Zeus", "origen": "griega", "rareza": null, "legendaria": true, "panteon": "griega", "sprite": "hum big c:white …", "imagen": null, "imagenShiny": null }
  ]
}
```

| Campo | Valores |
|---|---|
| `id` | Número entero único, mayor que 0. **No cambies los id que ya existen**: el guardado usa el id. |
| `nombre` | Texto en inglés (el juego está en inglés), hasta 14 caracteres. Evita mayúsculas con tilde: la fuente pixel no las tiene. |
| `origen` | Procedencia mitológica (ver tabla de abajo). También se acepta el nombre antiguo `tipo`. |
| `rareza` | 1 (común), 2 (poco común) o 3 (rara). En las legendarias se ignora. |
| `legendaria` | `true` o `false`. Las legendarias (dioses) aparecen como jefes de 2x2. |
| `panteon` | Solo legendarias, opcional: `griega`, `nordica` o `egipcia`. Se muestra en la colección («Greek god»). |
| `sprite` | Descripción del dibujo generado (ver «Sprites generados»). Solo se usa si no hay `imagen`. |
| `imagen` | Ruta de un PNG dentro de esta carpeta, por ejemplo `"criaturas/0001.png"`, o `null` para usar el sprite generado. |
| `imagenShiny` | PNG de la versión dorada («gold», opcional). Si es `null`, se crea pasando la imagen normal a tonos dorados. |

### Orígenes

| `origen` | Se muestra como |
|---|---|
| `griega` | Greco-Roman |
| `nordica` | Norse |
| `egipcia` | Egyptian |
| `celta` | Celtic (celta y británica) |
| `eslava` | Slavic |
| `iberica` | Iberian |
| `europea` | European (resto de Europa) |
| `japonesa` | Japanese |
| `asiatica` | East Asian (China, Corea, Tíbet, Mongolia) |
| `indomalaya` | Indo-Malay (India y sudeste asiático) |
| `medioriental` | Middle Eastern (Mesopotamia, Persia, Arabia, Anatolia) |
| `americana` | American |
| `africana` | African |
| `oceanica` | Oceanian |

El origen da el color del bloque y agrupa la colección y las misiones. No hay debilidades.

### Sprites generados

Si una bestia no tiene `imagen`, el juego la dibuja con `src/gfx/beastArt.js` a partir de `sprite`:
un arquetipo seguido de opciones `clave:valor`, por ejemplo `hum head:jackal fur:black body:kilt item:was item2:ankh`
(Anubis) o `quad kind:dog c:black heads:3 tail:snake` (Cerbero).
Arquetipos: `hum` (figura humanoide), `quad` (cuadrúpedo), `bird`, `serp` (serpiente), `drag` (dragón),
`ldrag` (dragón oriental), `fish`, `kraken`, `turtle`, `spider`, `insect`, `ghost`, `wisp`, `head`, `tree`, `plant`, `obj` y `cloud`.
Las opciones de cada uno están en el propio archivo. Para ver todos los sprites, abre
`http://localhost:5173/tools/bestiario.html` con el servidor de desarrollo en marcha.

Las entradas con errores se ignoran (quedan anotadas en el registro de errores del juego) y el resto se carga igualmente.

## bolas.json (orbes)

```json
{ "version": 1, "bolas": [ { "id": "normal", "nombre": "Common", "imagen": null } ] }
```

Los `id` válidos son `normal` (orbe Common), `super` (orbe Runic) y `ultra` (orbe Divine).
`nombre` admite hasta 8 caracteres. `imagen` es la ruta de un PNG o `null` para usar el orbe generado.

## Imágenes

- Formato PNG con fondo transparente.
- Las bestias se encajan en una caja de proporción 14x17 (legendarias 18x21), apoyadas abajo. Funcionan bien a 56x68 px (legendarias 72x84) o cualquier múltiplo. Los sprites generados miden 28x34 (legendarias 36x42).
- Los orbes se encajan en un cuadrado; 32x32 px es un buen tamaño.
- Para pixel art, usa tamaños múltiplos exactos para que no se deformen los píxeles.

## Regenerar el pack

El bestiario está en `src/data/bestiary.js`. Si lo cambias, regenera el pack:

```bash
node scripts/generate-pack.mjs
```

Esto sobrescribe `criaturas.json` y `bolas.json` (se pierden las rutas de `imagen` y los cambios de `sprite` que hayas hecho a mano).
