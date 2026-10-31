# ============================================================================
# E-LEARNING SYSTEM - STOP ALL SERVICES
# Tat tat ca Backend (Laravel), WebSocket (Reverb) va Frontend (React Vite)
# ============================================================================

$ErrorActionPreference = "Continue"

$PROJECT_ROOT = $PSScriptRoot
if (-not $PROJECT_ROOT) {
    $PROJECT_ROOT = Get-Location
}

$PID_FILE = Join-Path $PROJECT_ROOT ".pids.txt"

Clear-Host
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "           E-LEARNING SYSTEM - DUNG TAT CA DICH VU        " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""

$killedCount = 0

# ============================================================================
# Cach 1: Doc Process IDs tu file .pids.txt va tat
# ============================================================================
if (Test-Path $PID_FILE) {
    Write-Host "[1/3] Dang tat cac tien trinh theo PID da luu..." -ForegroundColor Yellow
    
    $pids = Get-Content $PID_FILE
    
    foreach ($pidNum in $pids) {
        $pidNum = "$pidNum".Trim()
        if ($pidNum -and $pidNum -ne "") {
            try {
                $process = Get-Process -Id $pidNum -ErrorAction SilentlyContinue
                if ($process) {
                    Stop-Process -Id $pidNum -Force -ErrorAction SilentlyContinue
                    Write-Host "  -> Da dung tien trinh PID: $pidNum ($($process.ProcessName))" -ForegroundColor Green
                    $killedCount++
                }
            } catch {
                # Bo qua neu process da tat
            }
        }
    }
    
    Remove-Item $PID_FILE -Force -ErrorAction SilentlyContinue
}

# ============================================================================
# Cach 2: Giai phong triet de cac Port mang (8000, 8080, 5173, 9000, 9001)
# ============================================================================
Write-Host ""
Write-Host "[2/3] Dang kiem tra va giai phong cac cong mang (8000, 8080, 5173, 9000, 9001)..." -ForegroundColor Yellow

$portsToCheck = @(8000, 8080, 5173, 9000, 9001)

foreach ($port in $portsToCheck) {
    $connections = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
    if ($connections) {
        foreach ($conn in $connections) {
            $owningPid = $conn.OwningProcess
            if ($owningPid -and $owningPid -ne 0) {
                try {
                    $proc = Get-Process -Id $owningPid -ErrorAction SilentlyContinue
                    if ($proc) {
                        Stop-Process -Id $owningPid -Force -ErrorAction SilentlyContinue
                        Write-Host "  -> Da giai phong cong $port (Dung $($proc.ProcessName) - PID: $owningPid)" -ForegroundColor Green
                        $killedCount++
                    }
                } catch {
                    # Bo qua neu khong the dung
                }
            }
        }
    }
}

# Dung container Docker MinIO neu docker service dang chay
$dockerService = Get-Service com.docker.service -ErrorAction SilentlyContinue
if ($dockerService -and $dockerService.Status -eq 'Running') {
    try {
        $dockerPs = & docker ps --filter "name=smartedu-minio" --format "{{.Names}}" 2>$null
        if ($dockerPs -match "smartedu-minio") {
            & docker stop smartedu-minio 2>$null | Out-Null
            Write-Host "  -> Da dung Docker container: smartedu-minio" -ForegroundColor Green
            $killedCount++
        }
    } catch {}
}

# ============================================================================
# Cach 3: Don dep cac cua so cmd chay Laravel/Reverb/Vite/MinIO
# ============================================================================
Write-Host ""
Write-Host "[3/3] Dang quet va tat cac tien trinh cmd lien quan..." -ForegroundColor Yellow

$cmdProcs = Get-Process -Name "cmd" -ErrorAction SilentlyContinue
foreach ($cmd in $cmdProcs) {
    try {
        $title = $cmd.MainWindowTitle
        if ($title -match "Laravel Backend|Reverb WebSocket|React Frontend|MinIO Storage") {
            Stop-Process -Id $cmd.Id -Force -ErrorAction SilentlyContinue
            Write-Host "  -> Da tat cua so cmd: $title (PID: $($cmd.Id))" -ForegroundColor Green
            $killedCount++
        }
    } catch {
        # Bo qua loi
    }
}

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Cyan
if ($killedCount -gt 0) {
    Write-Host "  DA DUNG THANH CONG TAT CA $killedCount TIEN TRINH DICH VU!" -ForegroundColor Green
} else {
    Write-Host "  Tat ca cac dich vu da o trang thai tat tu truoc." -ForegroundColor Yellow
}
Write-Host "  Cac cong 9000 (MinIO), 8000 (Backend), 8080 (Reverb) va 5173 (Frontend) da duoc giai phong." -ForegroundColor White
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Cua so nay se tu dong dong sau 3 giay..." -ForegroundColor Gray
Start-Sleep -Seconds 3
