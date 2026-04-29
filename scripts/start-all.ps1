# ============================================
# SAFAR Chain — Start All Services (PowerShell)
# ============================================
Write-Host "🌿 SAFAR Chain — Starting all services..." -ForegroundColor Green

$root = Split-Path -Parent $PSScriptRoot

# 1. Start Python AI Service
Write-Host "`n[1/3] Starting Python AI Service (port 8001)..." -ForegroundColor Cyan
$aiJob = Start-Job -ScriptBlock {
    param($path)
    Set-Location $path
    python -m uvicorn main:app --host 0.0.0.0 --port 8001
} -ArgumentList "$root\ai_service"

# 2. Check Ollama
Write-Host "[2/3] Checking Ollama..." -ForegroundColor Cyan
try {
    $ollamaVersion = ollama --version 2>&1
    Write-Host "  Ollama found: $ollamaVersion" -ForegroundColor Green
    Write-Host "  Ensuring phi3:mini model is available..."
    ollama pull phi3:mini
} catch {
    Write-Host "  Ollama not found. LLM endpoints will return 503." -ForegroundColor Yellow
}

# 3. Start Node.js Backend
Write-Host "[3/3] Starting Node.js Backend (port 3000)..." -ForegroundColor Cyan
Set-Location "$root\backend"
npm run dev

# Cleanup on exit
Write-Host "`nStopping services..." -ForegroundColor Yellow
Stop-Job $aiJob -ErrorAction SilentlyContinue
Remove-Job $aiJob -ErrorAction SilentlyContinue
