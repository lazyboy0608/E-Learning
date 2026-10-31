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
# BUOC 1: KHOI DONG MINIO (Object Storage - Port 9000)
# ============================================================================
Write-Host "[1/4] Dang khoi dong MinIO (Object Storage - Port 9000)..." -ForegroundColor Yellow
$minioPort = 9000
$minioConsolePort = 9001
$minioInUse = Get-NetTCPConnection -LocalPort $minioPort -State Listen -ErrorAction SilentlyContinue

$MINIO_DATA_DIR = Join-Path $PROJECT_ROOT "backend\storage\minio-data"
if (-not (Test-Path $MINIO_DATA_DIR)) {
    New-Item -ItemType Directory -Path $MINIO_DATA_DIR -Force | Out-Null
}

# Tu dong tao thu muc bucket de MinIO khoi tao san bucket smartedu-materials
$MINIO_BUCKET_DIR = Join-Path $MINIO_DATA_DIR "smartedu-materials"
if (-not (Test-Path $MINIO_BUCKET_DIR)) {
    New-Item -ItemType Directory -Path $MINIO_BUCKET_DIR -Force | Out-Null
}

if ($minioInUse) {
    Write-Host "  [!] Cong $minioPort da co dich vu chay. MinIO co the da duoc bat truoc." -ForegroundColor Yellow
} else {
    $minioExe = Get-Command minio -ErrorAction SilentlyContinue
    $localMinio = Join-Path $PROJECT_ROOT "minio.exe"
    $binMinio = Join-Path $PROJECT_ROOT "bin\minio.exe"

    $minioPath = $null
    if (Test-Path $binMinio) {
        $minioPath = $binMinio
    } elseif (Test-Path $localMinio) {
        $minioPath = $localMinio
    } elseif ($minioExe) {
        $minioPath = $minioExe.Source
    }

    # Neu chua co minio.exe, tu dong tai ve thu muc bin\minio.exe
    if (-not $minioPath) {
        Write-Host "  -> Dang tu dong tai MinIO server ve bin\minio.exe..." -ForegroundColor Cyan
        $binDir = Join-Path $PROJECT_ROOT "bin"
        if (-not (Test-Path $binDir)) {
            New-Item -ItemType Directory -Path $binDir -Force | Out-Null
        }
        $minioDownloadUrl = "https://github.com/minio/minio/releases/download/RELEASE.2024-05-10T01-41-38Z/minio.windows-amd64.RELEASE.2024-05-10T01-41-38Z.exe"
        try {
            curl.exe -L -o $binMinio $minioDownloadUrl
            if (Test-Path $binMinio) {
                $minioPath = $binMinio
                Write-Host "  [OK] Da tai thanh cong MinIO server ve: $binMinio" -ForegroundColor Green
            }
        } catch {
            Write-Host "  [!] Khong the tu dong tai MinIO: $($_.Exception.Message)" -ForegroundColor Yellow
        }
    }

    if ($minioPath) {
        $minioJob = Start-Process -FilePath "cmd.exe" `
            -ArgumentList "/k title MinIO Storage - Port $minioPort && set MINIO_ROOT_USER=minioadmin && set MINIO_ROOT_PASSWORD=minioadmin && `"$minioPath`" server `"$MINIO_DATA_DIR`" --address :$minioPort --console-address :$minioConsolePort" `
            -PassThru `
            -WindowStyle Minimized

        $pids += $minioJob.Id
        Write-Host "  [OK] MinIO da khoi dong tai: http://localhost:$minioPort (Console: http://localhost:$minioConsolePort)" -ForegroundColor Green
    } else {
        # Thu khoi dong qua Docker neu Docker Desktop dang hoat dong
        $dockerService = Get-Service com.docker.service -ErrorAction SilentlyContinue
        $dockerCmd = Get-Command docker -ErrorAction SilentlyContinue
        $dockerStarted = $false

        if ($dockerCmd -and $dockerService -and $dockerService.Status -eq 'Running') {
            try {
                $dockerPs = & docker ps -a --filter "name=smartedu-minio" --format "{{.Names}}" 2>$null
                if ($dockerPs -match "smartedu-minio") {
                    & docker start smartedu-minio 2>$null | Out-Null
                    if ($LASTEXITCODE -eq 0) {
                        $dockerStarted = $true
                    }
                } else {
                    & docker run -d --name smartedu-minio `
                        -p ${minioPort}:9000 -p ${minioConsolePort}:9001 `
                        -e "MINIO_ROOT_USER=minioadmin" `
                        -e "MINIO_ROOT_PASSWORD=minioadmin" `
                        -v "${MINIO_DATA_DIR}:/data" `
                        minio/minio server /data --console-address ":9001" 2>$null | Out-Null
                    if ($LASTEXITCODE -eq 0) {
                        $dockerStarted = $true
                    }
                }
            } catch {}
        }

        if ($dockerStarted) {
            Write-Host "  [OK] MinIO Docker container da khoi dong tai: http://localhost:$minioPort (Console: http://localhost:$minioConsolePort)" -ForegroundColor Green
        } else {
            Write-Host "  [CANH BAO] Chua tim thay minio.exe hoac Docker container MinIO dang chay!" -ForegroundColor Yellow
            Write-Host "    -> De su dung MinIO server: Dat file minio.exe vao thu muc du an hoac chay qua Docker." -ForegroundColor Gray
            Write-Host "    -> He thong dang hoat dong o che do tu dong Fallback luu tru (Local Public Storage)." -ForegroundColor Green
        }
    }
}

# ============================================================================
# BUOC 2: KHOI DONG BACKEND (Laravel API - Port 8000)
# ============================================================================
Write-Host ""
Write-Host "[2/4] Dang khoi dong Backend (Laravel API)..." -ForegroundColor Yellow
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
# BUOC 3: KHOI DONG WEBSOCKET (Laravel Reverb - Port 8080)
# ============================================================================
Write-Host ""
Write-Host "[3/4] Dang khoi dong WebSocket Realtime (Laravel Reverb)..." -ForegroundColor Yellow
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
# BUOC 4: KHOI DONG FRONTEND (React Vite - Port 5173)
# ============================================================================
Write-Host ""
Write-Host "[4/4] Dang khoi dong Frontend (React Vite)..." -ForegroundColor Yellow
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
Write-Host "  * MinIO (Object Storage): http://localhost:9000 (Console: http://localhost:9001)" -ForegroundColor White
Write-Host "  * Frontend (Website):     http://localhost:5173" -ForegroundColor White
Write-Host "  * Backend (REST API):     http://localhost:8000" -ForegroundColor White
Write-Host "  * Reverb (WebSocket):     http://localhost:8080" -ForegroundColor White
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
