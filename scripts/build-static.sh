#!/usr/bin/env bash
# Build static viewer with optional base path (GitHub Pages needs /bmw-scheme).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BASE_PATH="${1:-}"

cd "$ROOT/parser"
python -m pip install -U pip
pip install -e .
bmw-parse parse-dir "$ROOT/files" -o "$ROOT/viewer/public/data"

cd "$ROOT/viewer"
npm ci
BASE_PATH="$BASE_PATH" npm run build

echo "Built → $ROOT/viewer/out (BASE_PATH=${BASE_PATH:-none})"
