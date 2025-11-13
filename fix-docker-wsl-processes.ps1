# Fix Docker WSL Lingering Processes

Write-Host "=== Fixing Docker WSL Processes ===" -ForegroundColor Cyan
Write-Host ""

# List of PIDs from error message
$pids = @(10452, 11008, 11532, 11868, 13304, 14656, 14876)

Write-Host "Killing lingering WSL and Docker processes..." -ForegroundColor Yellow
Write-Host ""

foreach ($pid in $pids) {
    try {
        $process = Get-Process -Id $pid -ErrorAction SilentlyContinue
        if ($process) {
            Write-Host "Killing PID $pid ($($process.ProcessName))..." -ForegroundColor Gray
            Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
            Write-Host "  ✓ Killed PID $pid" -ForegroundColor Green
        } else {
            Write-Host "  - PID $pid already terminated" -ForegroundColor Gray
        }
    } catch {
        Write-Host "  - PID $pid not found or already terminated" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "Killing all WSL processes..." -ForegroundColor Yellow

# Kill all wsl.exe processes
Get-Process -Name "wsl" -ErrorAction SilentlyContinue | ForEach-Object {
    Write-Host "Killing WSL process PID $($_.Id)..." -ForegroundColor Gray
    Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
}

# Kill Docker build processes
Get-Process -Name "com.docker.build" -ErrorAction SilentlyContinue | ForEach-Object {
    Write-Host "Killing Docker build process PID $($_.Id)..." -ForegroundColor Gray
    Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
}

Write-Host ""
Write-Host "Shutting down WSL..." -ForegroundColor Yellow
wsl --shutdown

Start-Sleep -Seconds 3

Write-Host ""
Write-Host "✓ All processes killed and WSL shutdown" -ForegroundColor Green
Write-Host ""
Write-Host "Now starting Docker Desktop..." -ForegroundColor Cyan

# Start Docker Desktop
Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"

Write-Host ""
Write-Host "Docker Desktop is starting..." -ForegroundColor Yellow
Write-Host "This may take 2-3 minutes" -ForegroundColor Gray
Write-Host ""
Write-Host "Wait for Docker icon in system tray to stop animating" -ForegroundColor Cyan
Write-Host "Then run: docker ps" -ForegroundColor White
