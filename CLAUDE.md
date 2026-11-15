# god-breaker (God Breaker)

## Sincronización entre equipos (Windows ↔ Mac)

Este proyecto se trabaja alternando entre un PC con Windows y un Mac, sincronizado por GitHub.
Repos sincronizados: **ito** (GitHub: `Davidelox/itoapp`), **god-breaker** (God Breaker) y **claude-skills** (skills globales de Claude Code).

- **"update repos"**: cuando el usuario diga exactamente esta frase, en los TRES repos (ito, god-breaker y claude-skills):
  `git add -A`, commit con un mensaje descriptivo en español de lo hecho, y `git push`.
  Si un repo no tiene cambios, decirlo y seguir con el otro. Nunca subir `.env`.
  - Windows: `E:\Claude Code\ito`, `E:\Claude Code\God Breaker` y `C:\Users\Saek\.claude\skills`
  - Mac: `~/Claude Code/ito`, `~/Claude Code/God Breaker` y `~/.claude/skills`
- **Pull automático**: un hook `SessionStart` (`.claude/settings.json`) hace `git pull --ff-only` del proyecto y de `~/.claude/skills` al abrir sesión.
  Si el pull falla (cambios locales sin subir o conflicto), avisar al usuario antes de tocar nada.
