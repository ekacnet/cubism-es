#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENDPOINT="https://demo.promlabs.com"
QUERY="${1:-demo_memory_usage_bytes}"
OUT_FILE="${2:-${SCRIPT_DIR}/data/prom.json}"
DURATION_MINUTES="${3:-60}"
STEP="${4:-30s}"

node "${SCRIPT_DIR}/generate-prom-json.js" \
  "$ENDPOINT" \
  "$QUERY" \
  "$OUT_FILE" \
  "$DURATION_MINUTES" \
  "$STEP"
