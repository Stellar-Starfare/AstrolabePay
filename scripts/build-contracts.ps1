# Build AstrolabePay Soroban contract
Write-Host "Building AstrolabePay Soroban Contract..." -ForegroundColor Cyan
Set-Location "$PSScriptRoot\..\contracts\astrolabe_core"
stellar contract build
if ($LASTEXITCODE -eq 0) {
    Write-Host "Contract compiled successfully to target/wasm32-unknown-unknown/release/astrolabe_core.wasm" -ForegroundColor Green
} else {
    Write-Host "Build failed" -ForegroundColor Red
    exit 1
}
