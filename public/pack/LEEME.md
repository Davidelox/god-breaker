# Pack de contenido

Esta carpeta permite cambiar las criaturas y las bolas del juego sin tocar el código.
Si borras la carpeta, o algún archivo tiene errores, el juego usa su contenido por defecto.

## criaturas.json

```json
{
  "version": 1,
  "criaturas": [
    { "id": 1, "nombre": "Ascuín", "tipo": "fuego", "rareza": 1, "legendaria": false, "imagen": null, "imagenShiny": null }
  ]
}
```

| Campo | Valores |
|---|---|
| `id` | Número entero único, mayor que 0. **No cambies los id que ya existen**: el guardado usa el id. |
| `nombre` | Texto, hasta 14 caracteres. Evita mayúsculas con tilde al principio: la fuente pixel no las tiene. |
| `tipo` | `fuego`, `agua`, `planta`, `electrico`, `hielo`, `roca`, `fantasma` o `psiquico` |
| `rareza` | 1 (común), 2 (poco común) o 3 (rara). En las legendarias se ignora. |
| `legendaria` | `true` o `false`. Las legendarias aparecen como jefes de 2x2. |
| `imagen` | Ruta de un PNG dentro de esta carpeta, por ejemplo `"criaturas/0001.png"`, o `null` para usar el sprite generado. |
| `imagenShiny` | PNG de la versión shiny (opcional). Si es `null` y hay `imagen`, la shiny se crea cambiando los colores de la normal. |

Las entradas con errores se ignoran (quedan anotadas en el registro de errores del juego) y el resto se carga igualmente.

## bolas.json

```json
{ "version": 1, "bolas": [ { "id": "normal", "nombre": "Normal", "imagen": null } ] }
```

Los `id` válidos son `normal`, `super` y `ultra`. `imagen` es la ruta de un PNG o `null` para usar la bola generada.

## Imágenes

- Formato PNG con fondo transparente.
- Las criaturas se encajan en una caja de proporción 14x17 (legendarias 18x21), apoyadas abajo. Funcionan bien a 56x68 px (legendarias 72x84) o cualquier múltiplo.
- Las bolas se encajan en un cuadrado; 32x32 px es un buen tamaño.
- Para pixel art, usa tamaños múltiplos exactos para que no se deformen los píxeles.

## Regenerar el pack provisional

```bash
node scripts/generate-pack.mjs 1025
```

Esto sobrescribe `criaturas.json` y `bolas.json` con nombres inventados y sin imágenes.
