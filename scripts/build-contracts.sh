#!/usr/bin/env bash
set -euo pipefail

# Build AstrolabePay Soroban contract
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONTRACT_DIR="$SCRIPT_DIR/../contracts/astrolabe_core"

echo "🧭 Building AstrolabePay Soroban Contract..."
cd "$CONTRACT_DIR"

if command -v stellar &> /dev/null; then
    stellar contract build
elif command -v cargo &> /dev/null; then
    cargo build --target wasm32-unknown-unknown --release
else
    echo "❌ Error: Neither 'stellar' CLI nor 'cargo' found in PATH."
    exit 1
fi

WASM_OUTPUT="$CONTRACT_DIR/target/wasm32-unknown-unknown/release/astrolabe_core.wasm"
if [ -f "$WASM_OUTPUT" ]; then
    echo "✅ Contract compiled successfully to $WASM_OUTPUT"
else
    echo "❌ Build failed: WASM binary not found."
    exit 1
fi
