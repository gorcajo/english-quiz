#!/bin/bash -e

DIR="$(dirname "$0")"
PORT=8000
URL="http://localhost:$PORT/oralquiz.html"

python3 -m http.server --directory "$DIR" "$PORT" &
SERVER_PID=$!
trap 'kill "$SERVER_PID" 2>/dev/null' EXIT

sleep 0.5
open "$URL"

wait "$SERVER_PID"
