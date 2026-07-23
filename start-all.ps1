# ============================================================================
# E-LEARNING SYSTEM - START ALL SERVICES
# Mở đồng thời Backend (Laravel) và Frontend (React)
# ============================================================================

$ErrorActionPreference = "Stop"

$PROJECT_ROOT = Get-Location
$BACKEND_DIR = "$PROJECT_ROOT\backend"
$FRONTEND_DIR = "$PROJECT_ROOT\frontend"
$PID_FILE = "$PROJECT_ROOT\.pids.txt"

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  E-LEARNING SYSTEM - STARTING SERVICES" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Xóa file PID cũ nếu tồn tại
if (Test-Path $PID_FILE) {
    Remove-Item $PID_FILE -Force
}

# Kiểm tra thư mục backend
if (-not (Test-Path $BACKEND_DIR)) {
    Write-Host "[ERROR] Backend folder not found: $BACKEND_DIR" -ForegroundColor Red
    exit 1
}

# Kiểm tra thư mục frontend
if (-not (Test-Path $FRONTEND_DIR)) {
    Write-Host "[ERROR] Frontend folder not found: $FRONTEND_DIR" -ForegroundColor Red
    exit 1
}

# Lưu Process IDs
$pids = @()

# ============================================================================
# 1. START BACKEND (Laravel)
# ============================================================================
Write-Host "[1/2] Starting Backend (Laravel)..." -ForegroundColor Yellow

# Kiểm tra xem port 8000 có đang được sử dụng không
$backendPort = 8000
$backendInUse = Get-NetTCPConnection -LocalPort $backendPort -ErrorAction SilentlyContinue

if ($backendInUse) {
    Write-Host "  Port $backendPort is already in use. Backend may already be running." -ForegroundColor Yellow
} else {
    # Mở cmd mới để chạy Laravel
    $backendJob = Start-Process -FilePath "cmd.exe" `
        -ArgumentList "/c cd /d $BACKEND_DIR && php artisan serve --port=$backendPort" `
        -PassThru `
        -WindowStyle Normal
    
    $pids += $backendJob.Id
    Write-Host "  Backend started on http://localhost:$backendPort" -ForegroundColor Green
    Write-Host "  Process ID: $($backendJob.Id)" -ForegroundColor Gray
}

# ============================================================================
# 2. START FRONTEND (React)
# ============================================================================
Write-Host ""
Write-Host "[2/2] Starting Frontend (React)..." -ForegroundColor Yellow

# Kiểm tra xem port 5173 có đang được sử dụng không
$frontendPort = 5173
$frontendInUse = Get-NetTCPConnection -LocalPort $frontendPort -ErrorAction SilentlyContinue

if ($frontendInUse) {
    Write-Host "  Port $frontendPort is already in use. Frontend may already be running." -ForegroundColor Yellow
} else {
    # Mở cmd mới để chạy Vite
    $frontendJob = Start-Process -FilePath "cmd.exe" `
        -ArgumentList "/c cd /d $FRONTEND_DIR && npm run dev" `
        -PassThru `
        -WindowStyle Normal
    
    $pids += $frontendJob.Id
    Write-Host "  Frontend started on http://localhost:$frontendPort" -ForegroundColor Green
    Write-Host "  Process ID: $($frontendJob.Id)" -ForegroundColor Gray
}

# ============================================================================
# Lưu Process IDs để stop-all.ps1 có thể sử dụng
# ============================================================================
$pids | Out-File -FilePath $PID_FILE -Encoding UTF8

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  ALL SERVICES STARTED SUCCESSFULLY!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Backend:  http://localhost:$backendPort" -ForegroundColor White
Write-Host "  Frontend: http://localhost:$frontendPort" -ForegroundColor White
Write-Host ""
Write-Host "  To stop all services, run: .\stop-all.ps1" -ForegroundColor Yellow
Write-Host ""
Write-Host "  NOTE: Keep this window open to maintain the services." -ForegroundColor Gray
Write-Host "  Press Ctrl+C to stop this script (will NOT stop the services)." -ForegroundColor Gray

# Đợi cho đến khi user nhấn Ctrl+C
try {
    while ($true) {
        Start-Sleep -Seconds 1
    }
}
finally {
    Write-Host ""
    Write-Host "Script stopped. Use .\stop-all.ps1 to stop all services." -ForegroundColor Yellow
}
