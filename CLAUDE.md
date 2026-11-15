# god-breaker (PokeBlock Breaker)

## Sincronización entre equipos (Windows ↔ Mac)

Este proyecto se trabaja alternando entre un PC con Windows y un Mac, sincronizado por GitHub.
Repos sincronizados: **ito** y **god-breaker** (PokeBlock Breaker).

- **"update repos"**: cuando el usuario diga exactamente esta frase, en AMBOS repos (ito y god-breaker):
  `git add -A`, commit con un mensaje descriptivo en español de lo hecho, y `git push`.
  Si un repo no tiene cambios, decirlo y seguir con el otro. Nunca subir `.env`.
  - Windows: `E:\Claude Code\ito` y `E:\Claude Code\PokeBlock Breaker`
  - Mac: `~/Claude Code/ito` y `~/Claude Code/PokeBlock Breaker`
- **Pull automático**: un hook `SessionStart` (`.claude/settings.json`) hace `git pull --ff-only` al abrir sesión.
  Si el pull falla (cambios locales sin subir o conflicto), avisar al usuario antes de tocar nada.
