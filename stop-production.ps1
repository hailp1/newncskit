# ============================================
# Stop Production Services
# Dừng tất cả production services
# ============================================

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "STOP PRODUCTION SERVICES" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Stop processes on port 3000
Write-Host "Stopping processes on port 3000..." -ForegroundColor Yellow
$port3000 = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if ($port3000) {
    $processes = $port3000 | Select-Object -Unique -ExpandProperty OwningProcess
    foreach ($pid in $processes) {
        try {
            $proc = Get-Process -Id $pid -ErrorAction SilentlyContinue
            if ($proc) {
                Write-Host "  Stopping process $pid ($($proc.ProcessName))..." -ForegroundColor Gray
                Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
            }
        } catch {
            # Ignore errors
        }
    }
    Start-Sleep -Seconds 2
    Write-Host "✅ Port 3000 processes stopped" -ForegroundColor Green
} else {
    Write-Host "ℹ️  No processes on port 3000" -ForegroundColor Gray
}

# Stop Next.js processes
Write-Host "Stopping Next.js processes..." -ForegroundColor Yellow
$nextProcesses = Get-Process node -ErrorAction SilentlyContinue | Where-Object {
    try {
        $cmdLine = (Get-CimInstance Win32_Process -Filter "ProcessId = $($_.Id)").CommandLine
        $cmdLine -match "next"
    } catch {
        $false
    }
}

if ($nextProcesses) {
    $nextProcesses | ForEach-Object {
        Write-Host "  Stopping process $($_.Id) ($($_.ProcessName))..." -ForegroundColor Gray
        Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
    }
    Start-Sleep -Seconds 2
    Write-Host "✅ Next.js processes stopped" -ForegroundColor Green
} else {
    Write-Host "ℹ️  No Next.js processes found" -ForegroundColor Gray
}

# Stop Cloudflare Tunnel
Write-Host "Stopping Cloudflare Tunnel..." -ForegroundColor Yellow
$tunnelProcesses = Get-Process cloudflared -ErrorAction SilentlyContinue
if ($tunnelProcesses) {
    $tunnelProcesses | ForEach-Object {
        Write-Host "  Stopping process $($_.Id) ($($_.ProcessName))..." -ForegroundColor Gray
        Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
    }
    Start-Sleep -Seconds 2
    Write-Host "✅ Cloudflare Tunnel stopped" -ForegroundColor Green
} else {
    Write-Host "ℹ️  No Cloudflare Tunnel processes found" -ForegroundColor Gray
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ All production services stopped" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

