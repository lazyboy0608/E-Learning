# ============================================================================
# E-LEARNING SYSTEM - STOP ALL SERVICES
# Táº¯t táº¥t cáº£ Backend (Laravel) vÃ  Frontend (React) processes
# ============================================================================

$ErrorActionPreference = "Continue"

$PROJECT_ROOT = "d:\Ai Tee\doan"
$PID_FILE = "$PROJECT_ROOT\.pids.txt"

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  E-LEARNING SYSTEM - STOPPING SERVICES" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

$killedCount = 0

# ============================================================================
# CÃ¡ch 1: Äá»c Process IDs tá»« file vÃ  kill
# ============================================================================
if (Test-Path $PID_FILE) {
    Write-Host "[Method 1] Reading Process IDs from file..." -ForegroundColor Yellow
    
    $pids = Get-Content $PID_FILE
    
    foreach ($pid in $pids) {
        if ($pid -and $pid -ne "") {
            try {
                $process = Get-Process -Id $pid -ErrorAction SilentlyContinue
                if ($process) {
                    Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
                    Write-Host "  Killed process ID: $pid ($( $process.ProcessName ))" -ForegroundColor Green
                    $killedCount++
                }
            }
            catch {
                # Process cÃ³ thá»ƒ Ä‘Ã£ tá»± Ä‘á»™ng táº¯t
            }
        }
    }
    
    # XÃ³a file PID sau khi Ä‘Ã£ kill
    Remove-Item $PID_FILE -Force
}

# ============================================================================
# CÃ¡ch 2: Kill táº¥t cáº£ cmd.exe processes liÃªn quan Ä‘áº¿n project
# ============================================================================
Write-Host ""
Write-Host "[Method 2] Killing related cmd.exe processes..." -ForegroundColor Yellow

# TÃ¬m vÃ  kill cÃ¡c cmd processes cháº¡y Laravel/Vite
$cmdProcesses = Get-Process -Name "cmd" -ErrorAction SilentlyContinue

foreach ($proc in $cmdProcesses) {
    try {
        $commandLine = $proc.CommandLine
        if ($commandLine) {
            # Kiá»ƒm tra náº¿u cmd cháº¡y Laravel hoáº·c Vite
            if ($commandLine -match "php artisan|composer|vite|npm run dev" -and $commandLine -match "Ai.Tee|doan") {
                Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
                Write-Host "  Killed cmd.exe (ID: $($proc.Id)) - Laravel/Vite process" -ForegroundColor Green
                $killedCount++
            }
        }
    }
    catch {
        # Bá» qua lá»—i náº¿u khÃ´ng Ä‘á»c Ä‘Æ°á»£c command line
    }
}

# ============================================================================
# CÃ¡ch 3: Kill cÃ¡c processes cá»¥ thá»ƒ
# ============================================================================
Write-Host ""
Write-Host "[Method 3] Stopping specific processes..." -ForegroundColor Yellow

# Kill PHP processes liÃªn quan Ä‘áº¿n artisan serve
$phpProcesses = Get-Process -Name "php" -ErrorAction SilentlyContinue
foreach ($proc in $phpProcesses) {
    try {
        $commandLine = $proc.CommandLine
        if ($commandLine -match "artisan serve" -and $commandLine -match "Ai.Tee|doan") {
            Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
            Write-Host "  Killed php.exe (ID: $($proc.Id)) - Laravel server" -ForegroundColor Green
            $killedCount++
        }
    }
    catch {
        # Bá» qua lá»—i
    }
}

# Kill node processes liÃªn quan Ä‘áº¿n Vite
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
foreach ($proc in $nodeProcesses) {
    try {
        $commandLine = $proc.CommandLine
        if ($commandLine -match "vite|react" -and $commandLine -match "Ai.Tee|doan") {
            Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
            Write-Host "  Killed node.exe (ID: $($proc.Id)) - Vite dev server" -ForegroundColor Green
            $killedCount++
        }
    }
    catch {
        # Bá» qua lá»—i
    }
}

# ============================================================================
# Giáº£i phÃ³ng ports náº¿u cáº§n
# ============================================================================
Write-Host ""
Write-Host "[Cleanup] Checking for processes on ports..." -ForegroundColor Yellow

# Kiá»ƒm tra port 8000 (Laravel)
$port8000 = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue
if ($port8000) {
    foreach ($conn in $port8000) {
        try {
            $process = Get-Process -Id $conn.OwningProcess -ErrorAction SilentlyContinue
            if ($process) {
                Stop-Process -Id $conn.OwningProcess -Force -ErrorAction SilentlyContinue
                Write-Host "  Released port 8000 (Process: $($process.ProcessName))" -ForegroundColor Green
                $killedCount++
            }
        }
        catch {
            # Bá» qua lá»—i
        }
    }
}

# Kiá»ƒm tra port 5173 (Vite)
$port5173 = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue
if ($port5173) {
    foreach ($conn in $port5173) {
        try {
            $process = Get-Process -Id $conn.OwningProcess -ErrorAction SilentlyContinue
            if ($process) {
                Stop-Process -Id $conn.OwningProcess -Force -ErrorAction SilentlyContinue
                Write-Host "  Released port 5173 (Process: $($process.ProcessName))" -ForegroundColor Green
                $killedCount++
            }
        }
        catch {
            # Skip errors
        }
    }
}

# ============================================================================
# Káº¿t quáº£
# ============================================================================
Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan

if ($killedCount -gt 0) {
    Write-Host "  STOPPED $killedCount processes successfully!" -ForegroundColor Green
} else {
    Write-Host "  No processes found to stop." -ForegroundColor Yellow
}

Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Ports 8000 (Backend) and 5173 (Frontend) should now be free." -ForegroundColor White
Write-Host ""

# Chá» 1 giÃ¢y rá»“i thÃ´ng bÃ¡o hoÃ n táº¥t
Start-Sleep -Seconds 1
