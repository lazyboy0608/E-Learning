# ============================================================================
# E-LEARNING SYSTEM - START ALL SERVICES
# Khoi dong Backend (Laravel), WebSocket (Reverb) va Frontend (React Vite)
# ============================================================================

$ErrorActionPreference = "Continue"

$PROJECT_ROOT = $PSScriptRoot
if (-not $PROJECT_ROOT) {
    $PROJECT_ROOT = Get-Location
}

$BACKEND_DIR = Join-Path $PROJECT_ROOT "backend"
$FRONTEND_DIR = Join-Path $PROJECT_ROOT "frontend"
$PID_FILE = Join-Path $PROJECT_ROOT ".pids.txt"

Clear-Host
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "         E-LEARNING SYSTEM - KHOI DONG HE THONG           " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  Project directory: $PROJECT_ROOT" -ForegroundColor Gray
Write-Host ""

# Xoa file PID cu neu ton tai
if (Test-Path $PID_FILE) {
    Remove-Item $PID_FILE -Force -ErrorAction SilentlyContinue
}

# 1. Kiem tra thu muc backend & frontend
if (-not (Test-Path $BACKEND_DIR)) {
    Write-Host "[ERROR] Khong tim thay thu muc backend: $BACKEND_DIR" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $FRONTEND_DIR)) {
    Write-Host "[ERROR] Khong tim thay thu muc frontend: $FRONTEND_DIR" -ForegroundColor Red
    exit 1
}

# 2. Kiem tra MySQL Database (Port 3306)
$mysqlPort = 3306
$mysqlActive = Get-NetTCPConnection -LocalPort $mysqlPort -State Listen -ErrorAction SilentlyContinue
if (-not $mysqlActive) {
    Write-Host "[CANH BAO] Khong thay cong 3306 (MySQL) hoat dong!" -ForegroundColor Yellow
    Write-Host "  -> Hay dam bao ban da BAT MySQL trong XAMPP hoac Laragon." -ForegroundColor Yellow
    Write-Host ""
} else {
    Write-Host "[OK] Co so du lieu MySQL dang hoat dong (Port 3306)." -ForegroundColor Green
    Write-Host ""
}

$pids = @()

# ============================================================================
# BUOC 1: KHOI DONG BACKEND (Laravel API - Port 8000)
# ============================================================================
Write-Host "[1/3] Dang khoi dong Backend (Laravel API)..." -ForegroundColor Yellow
$backendPort = 8000
$backendInUse = Get-NetTCPConnection -LocalPort $backendPort -State Listen -ErrorAction SilentlyContinue

if ($backendInUse) {
    Write-Host "  [!] Cong $backendPort da co dich vu chay. Backend co the da duoc bat truoc." -ForegroundColor Yellow
} else {
    $backendJob = Start-Process -FilePath "cmd.exe" `
        -ArgumentList "/k title Laravel Backend - Port $backendPort && cd /d `"$BACKEND_DIR`" && php artisan serve --port=$backendPort" `
        -PassThru `
        -WindowStyle Minimized

    $pids += $backendJob.Id
    Write-Host "  [OK] Backend da khoi dong tai: http://localhost:$backendPort" -ForegroundColor Green
}

# ============================================================================
# BUOC 2: KHOI DONG WEBSOCKET (Laravel Reverb - Port 8080)
# ============================================================================
Write-Host ""
Write-Host "[2/3] Dang khoi dong WebSocket Realtime (Laravel Reverb)..." -ForegroundColor Yellow
$reverbPort = 8080
$reverbInUse = Get-NetTCPConnection -LocalPort $reverbPort -State Listen -ErrorAction SilentlyContinue

if ($reverbInUse) {
    Write-Host "  [!] Cong $reverbPort da co dich vu chay. Reverb co the da duoc bat truoc." -ForegroundColor Yellow
} else {
    $reverbJob = Start-Process -FilePath "cmd.exe" `
        -ArgumentList "/k title Reverb WebSocket - Port $reverbPort && cd /d `"$BACKEND_DIR`" && php artisan reverb:start" `
        -PassThru `
        -WindowStyle Minimized

    $pids += $reverbJob.Id
    Write-Host "  [OK] WebSocket Reverb da khoi dong tai: http://localhost:$reverbPort" -ForegroundColor Green
}

# ============================================================================
# BUOC 3: KHOI DONG FRONTEND (React Vite - Port 5173)
# ============================================================================
Write-Host ""
Write-Host "[3/3] Dang khoi dong Frontend (React Vite)..." -ForegroundColor Yellow
$frontendPort = 5173
$frontendInUse = Get-NetTCPConnection -LocalPort $frontendPort -State Listen -ErrorAction SilentlyContinue

if ($frontendInUse) {
    Write-Host "  [!] Cong $frontendPort da co dich vu chay. Frontend co the da duoc bat truoc." -ForegroundColor Yellow
} else {
    $frontendJob = Start-Process -FilePath "cmd.exe" `
        -ArgumentList "/k title React Frontend - Port $frontendPort && cd /d `"$FRONTEND_DIR`" && npm run dev" `
        -PassThru `
        -WindowStyle Minimized

    $pids += $frontendJob.Id
    Write-Host "  [OK] Frontend da khoi dong tai: http://localhost:$frontendPort" -ForegroundColor Green
}

# Luu danh sach PID ra file de stop-all su dung
if ($pids.Count -gt 0) {
    $pids | Out-File -FilePath $PID_FILE -Encoding UTF8
}

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "       TAT CA DICH VU DA DUOC KHOI DONG THANH CONG!       " -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  * Frontend (Website):   http://localhost:5173" -ForegroundColor White
Write-Host "  * Backend (REST API):   http://localhost:8000" -ForegroundColor White
Write-Host "  * Reverb (WebSocket):   http://localhost:8080" -ForegroundColor White
Write-Host ""
Write-Host "  -> Dang tu dong mo trinh duyet web den he thong..." -ForegroundColor Gray

# Cho 2 giay de server khoi tao xong roi mo trinh duyet
Start-Sleep -Seconds 2
Start-Process "http://localhost:5173"

Write-Host ""
Write-Host "  De DUNG toan bo he thong, chay file: .\stop-all.ps1 (hoac click stop-all.bat)" -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Cua so nay se tu dong dong sau 5 giay..." -ForegroundColor Gray
Start-Sleep -Seconds 5
