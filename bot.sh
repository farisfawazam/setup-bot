#!/usr/bin/env bash

# Setup Bot - Linux VPS Background Manager
# Usage: ./bot.sh {start|stop|restart|status|log|deploy|install}

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PID_FILE="$APP_DIR/bot.pid"
LOG_FILE="$APP_DIR/bot.log"
NODE_BIN="$(command -v node 2>/dev/null)"

cd "$APP_DIR" || exit 1

check_node() {
  if [ -z "$NODE_BIN" ]; then
    echo "❌ Node.js belum terinstall! Install minimal Node.js v18/v20:"
    echo "   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -"
    echo "   sudo apt install -y nodejs"
    exit 1
  fi
}

check_env() {
  if [ ! -f "$APP_DIR/.env" ]; then
    echo "⚠️ File .env tidak ditemukan!"
    if [ -f "$APP_DIR/.env.example" ]; then
      cp "$APP_DIR/.env.example" "$APP_DIR/.env"
      echo "ℹ️ Template .env dibuat dari .env.example. Silakan edit isinya: nano .env"
    fi
    exit 1
  fi
}

get_pid() {
  if [ -f "$PID_FILE" ]; then
    cat "$PID_FILE" 2>/dev/null
  fi
}

is_running() {
  local pid
  pid="$(get_pid)"
  if [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null; then
    return 0
  else
    return 1
  fi
}

start_bot() {
  check_node
  check_env

  if is_running; then
    echo "⚠️ Bot sudah aktif dengan PID: $(get_pid)"
    exit 0
  fi

  echo "🚀 Memulai Setup Bot di background..."
  nohup "$NODE_BIN" "$APP_DIR/index.js" >> "$LOG_FILE" 2>&1 &
  local new_pid=$!
  echo "$new_pid" > "$PID_FILE"

  sleep 1.5
  if kill -0 "$new_pid" 2>/dev/null; then
    echo "✅ Bot berhasil berjalan di background (PID: $new_pid)"
    echo "📜 Pantau log secara realtime: ./bot.sh log"
  else
    echo "❌ Bot gagal start! Periksa error di log:"
    tail -n 20 "$LOG_FILE"
  fi
}

stop_bot() {
  if ! is_running; then
    echo "ℹ️ Bot tidak sedang berjalan."
    rm -f "$PID_FILE" 2>/dev/null
    exit 0
  fi

  local pid
  pid="$(get_pid)"
  echo "🛑 Menghentikan bot (PID: $pid)..."
  kill -15 "$pid" 2>/dev/null

  for _ in {1..10}; do
    if ! kill -0 "$pid" 2>/dev/null; then
      break
    fi
    sleep 0.5
  done

  if kill -0 "$pid" 2>/dev/null; then
    echo "⚠️ Force killing bot..."
    kill -9 "$pid" 2>/dev/null
  fi

  rm -f "$PID_FILE" 2>/dev/null
  echo "✅ Bot berhasil dihentikan."
}

restart_bot() {
  echo "🔄 Merestart bot..."
  stop_bot
  sleep 1
  start_bot
}

status_bot() {
  if is_running; then
    local pid
    pid="$(get_pid)"
    echo "🟢 [STATUS] AKTIF"
    echo "   PID      : $pid"
    if command -v ps >/dev/null 2>&1; then
      local mem
      mem="$(ps -p "$pid" -o %mem= 2>/dev/null | tr -d ' ')"
      local cpu
      cpu="$(ps -p "$pid" -o %cpu= 2>/dev/null | tr -d ' ')"
      echo "   RAM Use  : ${mem}%"
      echo "   CPU Use  : ${cpu}%"
    fi
  else
    echo "🔴 [STATUS] MATI"
    rm -f "$PID_FILE" 2>/dev/null
  fi
}

log_bot() {
  if [ ! -f "$LOG_FILE" ]; then
    touch "$LOG_FILE"
  fi
  echo "📜 Menampilkan log bot (Tekan Ctrl+C untuk keluar)..."
  tail -n 40 -f "$LOG_FILE"
}

deploy_cmds() {
  check_node
  check_env
  echo "📡 Mendaftarkan slash commands ke Discord REST API..."
  "$NODE_BIN" "$APP_DIR/deploy-commands.js"
}

install_deps() {
  check_node
  echo "📦 Memasang dependensi npm..."
  npm install --production
  echo "✅ Selesai."
}

case "$1" in
  start)
    start_bot
    ;;
  stop)
    stop_bot
    ;;
  restart)
    restart_bot
    ;;
  status)
    status_bot
    ;;
  log|logs)
    log_bot
    ;;
  deploy)
    deploy_cmds
    ;;
  install)
    install_deps
    ;;
  *)
    echo "Format penggunaan: ./bot.sh {start|stop|restart|status|log|deploy|install}"
    echo ""
    echo "Perintah:"
    echo "  start    : Jalankan bot di background (24/7)"
    echo "  stop     : Matikan bot"
    echo "  restart  : Restart bot"
    echo "  status   : Cek status bot & pemakaian RAM"
    echo "  log      : Lihat log output realtime"
    echo "  deploy   : Register slash commands Discord"
    echo "  install  : Install paket dependensi npm"
    exit 1
    ;;
esac
