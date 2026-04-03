#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ALGORITHM_MODULE_ID="${ALGORITHM_MODULE_ID:-perfopt}"
BACKEND_ROOT="$ROOT_DIR/backend/perfopt_v0"
BACKEND_SCRIPT="$ROOT_DIR/backend/algorithm_library/resolve_module.py"
LOG_DIR="$ROOT_DIR/.omx/logs/dev-stack"
BACKEND_HOST="${PERFOPT_HOST:-127.0.0.1}"
BACKEND_PORT="${PERFOPT_PORT:-8080}"
FRONTEND_HOST="${FRONTEND_HOST:-127.0.0.1}"
FRONTEND_PORT="${FRONTEND_PORT:-3000}"
FRONTEND_URL="http://${FRONTEND_HOST}:${FRONTEND_PORT}"
BACKEND_URL="http://${BACKEND_HOST}:${BACKEND_PORT}"
SHUTTING_DOWN=0

PYTHON_CANDIDATES=(
  "/home/yhzhu/LoongEnv_R0.1/venv-shared/bin/python3"
  "/home/yhzhu/LoongEnv/venv-shared/bin/python3"
  "/usr/bin/python3"
)

log() {
  printf '[%s] %s\n' "$(date +'%F %T')" "$*"
}

stop_pid_file() {
  local pid_file="$1"
  if [[ -f "$pid_file" ]]; then
    local pid
    pid="$(cat "$pid_file" 2>/dev/null || true)"
    if [[ -n "${pid:-}" ]] && kill -0 "$pid" 2>/dev/null; then
      log "Stopping stale pid=$pid from $(basename "$pid_file")"
      kill "$pid" 2>/dev/null || true
      sleep 1
      if kill -0 "$pid" 2>/dev/null; then
        log "Force killing stale pid=$pid"
        kill -9 "$pid" 2>/dev/null || true
      fi
    fi
    rm -f "$pid_file"
  fi
}

cleanup_all() {
  if [[ "$SHUTTING_DOWN" -eq 1 ]]; then
    return
  fi
  SHUTTING_DOWN=1
  log "Shutting down local dev stack"
  stop_pid_file "$LOG_DIR/backend.pid"
  stop_pid_file "$LOG_DIR/frontend.pid"
  kill_port "$BACKEND_PORT"
  kill_port "$FRONTEND_PORT"
}

find_python() {
  local candidate
  for candidate in "${PYTHON_CANDIDATES[@]}"; do
    if [[ -x "$candidate" ]]; then
      printf '%s' "$candidate"
      return 0
    fi
  done
  return 1
}

port_pids() {
  local port="$1"
  if command -v lsof >/dev/null 2>&1; then
    lsof -ti tcp:"$port" 2>/dev/null || true
  elif command -v fuser >/dev/null 2>&1; then
    fuser -n tcp "$port" 2>/dev/null || true
  fi
}

kill_port() {
  local port="$1"
  local pids
  pids="$(port_pids "$port")"
  if [[ -n "${pids:-}" ]]; then
    log "Port ${port} occupied by: ${pids}; terminating"
    kill ${pids} 2>/dev/null || true
    sleep 1
    pids="$(port_pids "$port")"
    if [[ -n "${pids:-}" ]]; then
      log "Force killing remaining pids on port ${port}: ${pids}"
      kill -9 ${pids} 2>/dev/null || true
    fi
  fi
}

wait_http_ok() {
  local url="$1"
  local retries="${2:-30}"
  local i
  for i in $(seq 1 "$retries"); do
    if command -v curl >/dev/null 2>&1 && curl -fsS "$url" >/dev/null 2>&1; then
      return 0
    fi
    sleep 0.5
  done
  return 1
}

cleanup_stale_processes() {
  log "Cleaning stale frontend/backend processes before startup"
  stop_pid_file "$LOG_DIR/backend.pid"
  stop_pid_file "$LOG_DIR/frontend.pid"
  kill_port "$BACKEND_PORT"
  kill_port "$FRONTEND_PORT"
}

main() {
  mkdir -p "$LOG_DIR"
  trap cleanup_all INT TERM EXIT

  if [[ ! -f "$BACKEND_SCRIPT" ]]; then
    log "Missing backend script: $BACKEND_SCRIPT"
    exit 1
  fi

  local py
  py="$(find_python)" || {
    log "No usable Python runtime found for PerfOpt backend."
    exit 1
  }

  if ! command -v npm >/dev/null 2>&1; then
    log "Missing npm; install Node.js first."
    exit 1
  fi

  cleanup_stale_processes

  local backend_entry
  backend_entry="$("$py" "$BACKEND_SCRIPT" "$ALGORITHM_MODULE_ID")" || {
    log "Failed to resolve backend module entry for module=$ALGORITHM_MODULE_ID"
    exit 1
  }

  log "Starting backend module=$ALGORITHM_MODULE_ID with: $py $backend_entry"
  PERFOPT_HOST="$BACKEND_HOST" PERFOPT_PORT="$BACKEND_PORT" \
    "$py" "$backend_entry" >>"$LOG_DIR/backend.log" 2>&1 &
  echo $! >"$LOG_DIR/backend.pid"

  if ! wait_http_ok "$BACKEND_URL/health" 40; then
    log "Backend did not become healthy: $BACKEND_URL/health"
    exit 1
  fi
  log "Backend healthy at $BACKEND_URL/health"

  log "Starting frontend dev server"
  cd "$ROOT_DIR"
  npm run dev -- --host "$FRONTEND_HOST" --port "$FRONTEND_PORT" >>"$LOG_DIR/frontend.log" 2>&1 &
  echo $! >"$LOG_DIR/frontend.pid"

  if ! wait_http_ok "$FRONTEND_URL" 40; then
    log "Frontend did not become reachable: $FRONTEND_URL"
    exit 1
  fi
  log "Frontend reachable at $FRONTEND_URL"

  if command -v xdg-open >/dev/null 2>&1; then
    xdg-open "$FRONTEND_URL" >/dev/null 2>&1 &
  fi

  log "Dev stack is running. Press Ctrl+C to stop and clean up. Logs: $LOG_DIR"
  wait
}

main "$@"
