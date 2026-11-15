#!/usr/bin/env bash
# Hook UserPromptSubmit: antes de cada mensaje del usuario comprueba si hay
# commits nuevos en GitHub (subidos desde el otro equipo) en este proyecto y
# en ~/.claude/skills. Si los hay, pide a Claude que avise y haga el pull
# antes de continuar. Funciona igual en Mac y en Windows (Git Bash).

check() {
  local dir="$1" name="$2"
  [ -d "$dir/.git" ] || return 0
  # Fetch rápido; si no hay red o tarda, se ignora en silencio.
  git -C "$dir" -c http.lowSpeedLimit=1000 -c http.lowSpeedTime=5 fetch -q 2>/dev/null || return 0
  local behind
  behind=$(git -C "$dir" rev-list --count 'HEAD..@{u}' 2>/dev/null) || return 0
  [ "${behind:-0}" -gt 0 ] || return 0
  local commits
  commits=$(git -C "$dir" log --format='  - %s' 'HEAD..@{u}' 2>/dev/null | head -5)
  cat <<EOF
[sincronización] Hay $behind commit(s) nuevo(s) en GitHub para "$name" que no están en este equipo (subidos desde el otro equipo):
$commits
ANTES de hacer nada más con la petición del usuario: dile que se han detectado cambios del otro equipo en "$name" y que vas a hacer el pull, ejecuta \`git -C "$dir" pull --ff-only\` e informa del resultado. Si el pull falla (cambios locales sin subir o conflicto), para y pregunta al usuario cómo seguir. Después continúa con su petición.
EOF
}

check "${CLAUDE_PROJECT_DIR:-$PWD}" "$(basename "${CLAUDE_PROJECT_DIR:-$PWD}")"
check "$HOME/.claude/skills" "claude-skills"
exit 0
