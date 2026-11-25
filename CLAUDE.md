# god-breaker (God Breaker)

## Sincronización entre equipos (Windows ↔ Mac)

Este proyecto se trabaja alternando entre un PC con Windows y un Mac, sincronizado por GitHub.
Repos sincronizados: **ito** (GitHub: `Davidelox/itoapp`), **god-breaker** (God Breaker) y **claude-skills** (skills globales de Claude Code).

- **"update repos"**: cuando el usuario diga exactamente esta frase, en los TRES repos (ito, god-breaker y claude-skills):
  `git add -A`, commit con un mensaje descriptivo en español de lo hecho, y `git push`.
  Si un repo no tiene cambios, decirlo y seguir con el otro. Nunca subir `.env`.
- **"Estado actual"**: en cada "update repos", ANTES del commit, actualizar la sección `## Estado actual` de este archivo
  en cada proyecto que haya tenido trabajo: en qué se está, qué falta y decisiones/preferencias nuevas del usuario.
  Pocas líneas, siempre sustituyendo lo obsoleto (no es un diario). Al empezar en cualquier equipo, leerla primero.
  - Windows: `E:\Claude Code\ito`, `E:\Claude Code\God Breaker` y `C:\Users\Saek\.claude\skills`
  - Mac: `~/Developer/Claude Code/ito`, `~/Developer/Claude Code/God Breaker` y `~/.claude/skills`
- **Pull automático**: un hook `SessionStart` (`.claude/settings.json`) hace `git pull --ff-only` del proyecto y de `~/.claude/skills` al abrir sesión.
  Si el pull falla (cambios locales sin subir o conflicto), avisar al usuario antes de tocar nada.
- **Detección de cambios del otro equipo**: un hook `UserPromptSubmit` (`.claude/hooks/check-remote.sh`) hace `git fetch` del proyecto y de `~/.claude/skills`
  antes de cada mensaje. Si hay commits nuevos en GitHub, avisar al usuario de que se van a bajar los cambios del otro equipo,
  hacer `git pull --ff-only` y solo entonces continuar con la petición. Si el pull falla, parar y preguntar.

## Estado actual
_Actualizado: 2026-11-15 (Mac)_

- **Último trabajo**: el juego ya es app de iOS y Android con Capacitor 8 (`ios/`, `android/` en el repo; `npm run ios` / `npm run android`).
  Guardado copiado en Preferences nativo y vibración con @capacitor/haptics. Más sensación de impacto: tono de combo creciente,
  avisos COMBO xN!, micropausa en criaturas, retroceso del lanzador y salto del marcador. Probado en simulador de iPhone.
- **Pendiente**: que el usuario pruebe y ajuste intensidades de los efectos de impacto; probar el APK en emulador/móvil Android;
  sacar la versión 0.20.0 (el Unreleased del CHANGELOG es muy largo). Ideas: efectos de sonido con jsfxr/ChipTone, música
  compuesta (Furnace/BeepBox/GarageBand), sprites a mano para dioses y acompañantes con el pack de imágenes.
- **Decisiones**: nada de herramientas de pago para los gráficos (Pixelorama/LibreSprite en vez de Aseprite).
  Android necesita JDK 21 (en Mac: `brew install openjdk@21` + `org.gradle.java.home` en `~/.gradle/gradle.properties`).
