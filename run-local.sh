#!/bin/bash
#
# RaveMap — ADB reverse port forwarding + PocketBase launcher
# Routes Android device connections through USB to laptop's PocketBase instance
#
# Usage: ./run-local.sh
#

set -euo pipefail

PORT=8090
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

ok()   { echo "  ✓ $*"; }
fail() { echo "  ✗ $*" >&2; exit 1; }
info() { echo "  · $*"; }

echo "==========================================="
echo " RaveMap — Local Dev Server"
echo "==========================================="
echo

# ── 1. Check PocketBase binary ────────────────────────────────────────────────
PB_BIN=""
if command -v pocketbase &>/dev/null; then
  PB_BIN="pocketbase"
elif [ -f "$SCRIPT_DIR/pocketbase" ]; then
  PB_BIN="$SCRIPT_DIR/pocketbase"
else
  fail "pocketbase binary not found. Download from https://pocketbase.io/docs/"
fi
ok "PocketBase binary: $PB_BIN"

# ── 2. Check .env ─────────────────────────────────────────────────────────────
if [ ! -f "$SCRIPT_DIR/.env" ]; then
  fail ".env file not found — create it with LLM_API_KEY and LLM_BASE_URL"
fi
ok ".env found"

# ── 3. ADB reverse forwarding ─────────────────────────────────────────────────
if ! command -v adb &>/dev/null; then
  fail "adb not found — install Android SDK Platform Tools"
fi

DEVICES=$(adb devices 2>/dev/null | grep -v "List" | grep "device$" | wc -l)
if [ "$DEVICES" -eq 0 ]; then
  fail "No Android device connected via USB — plug in device and enable USB debugging"
fi
ok "$DEVICES device(s) connected"

adb reverse tcp:$PORT tcp:$PORT 2>/dev/null || fail "ADB reverse forwarding failed"
ok "ADB reverse forwarding active (Android localhost:$PORT → laptop localhost:$PORT)"

# ── 4. Load .env into environment ─────────────────────────────────────────────
set -a
source "$SCRIPT_DIR/.env"
set +a
ok "Environment loaded from .env"

# ── 5. Start PocketBase ───────────────────────────────────────────────────────
echo
echo "==========================================="
echo " PocketBase running on http://localhost:$PORT"
echo " Admin UI: http://localhost:$PORT/_/"
echo " API endpoint: http://localhost:$PORT/api/ravemap/add-events"
echo ""
echo " Android app should use: http://localhost:$PORT"
echo " Stop: Ctrl+C"
echo "==========================================="
echo

exec "$PB_BIN" serve --http="0.0.0.0:$PORT" --dir="$SCRIPT_DIR/pb_data" --hooksDir="$SCRIPT_DIR/pb_hooks"
