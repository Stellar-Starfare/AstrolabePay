param(
    [string]$Identity = "deployer",
    [string]$Network = "testnet"
)

Write-Host "Deploying AstrolabePay to $Network using $Identity..." -ForegroundColor Cyan
$wasmPath = "$PSScriptRoot\..\contracts\astrolabe_core\target\wasm32-unknown-unknown\release\astrolabe_core.wasm"

if (-not (Test-Path $wasmPath)) {
    Write-Host "Building WASM binary..." -ForegroundColor Yellow
    & "$PSScriptRoot\build-contracts.ps1"
}

stellar contract deploy --wasm $wasmPath --source $Identity --network $Network --alias astrolabe_core
