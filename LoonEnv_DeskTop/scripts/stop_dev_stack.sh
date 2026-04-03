#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOG_DIR="$ROOT_DIR/.omx/logs/dev-stack"
BACKEND_PORT="${PERFOPT_PORT:-8080}"
FRONTEND_PORT="${FRONTEND_PORT:-3000}"

log() {
  printf '[%s] %s\n' "$(date +'%F %T')" "$*"
}

stop_pid_file() {
  local pid_file="$1"
  if [[ -f "$pid_file" ]]; then
    local pid
    pid="$(cat "$pid_file" 2>/dev/null || true)"
    if [[ -n "${pid:-}" ]] && kill -0 "$pid" 2>/dev/null; then
      log "Stopping pid=$pid from $(basename "$pid_file")"
      kill "$pid" 2>/dev/null || true
      sleep 1
      if kill -0 "$pid" 2>/dev/null; then
        kill -9 "$pid" 2>/dev/null || true
      fi
    fi
    rm -f "$pid_file"
  fi
}

kill_port() {
  local port="$1"
  local pids=""
  if command -v lsof >/dev/null 2>&1; then
    pids="$(lsof -ti tcp:"$port" 2>/dev/null || true)"
  elif command -v fuser >/dev/null 2>&1; then
    pids="$(fuser -n tcp "$port" 2>/dev/null || true)"
  fi
  if [[ -n "${pids:-}" ]]; then
    log "Cleaning remaining processes on port ${port}: ${pids}"
    kill ${pids} 2>/dev/null || true
    sleep 1
    kill -9 ${pids} 2>/dev/null || true
  fi
}

main() {
  stop_pid_file "$LOG_DIR/backend.pid"
  stop_pid_file "$LOG_DIR/frontend.pid"
  kill_port "$BACKEND_PORT"
  kill_port "$FRONTEND_PORT"
  log "Stopped local backend/frontend stack."
}

main "$@"
