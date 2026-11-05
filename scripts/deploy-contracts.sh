#!/usr/bin/env bash
set -euo pipefail

# Deploy AstrolabePay to Stellar Soroban
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONTRACT_DIR="$SCRIPT_DIR/../contracts/astrolabe_core"
WASM_PATH="$CONTRACT_DIR/target/wasm32-unknown-unknown/release/astrolabe_core.wasm"

IDENTITY="${1:-deployer}"
NETWORK="${2:-testnet}"

echo "🚀 Deploying AstrolabePay to $NETWORK using identity '$IDENTITY'..."

if [ ! -f "$WASM_PATH" ]; then
    echo "📦 Building WASM binary first..."
    "$SCRIPT_DIR/build-contracts.sh"
fi

stellar contract deploy \
    --wasm "$WASM_PATH" \
    --source "$IDENTITY" \
    --network "$NETWORK" \
    --alias astrolabe_core

echo "✅ Contract deployment complete."
