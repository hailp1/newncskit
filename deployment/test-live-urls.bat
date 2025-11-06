@echo off
title NCSKIT Live URL Tester
color 0A

echo.
echo ========================================
echo    🧪 NCSKIT Live URL Tester
echo ========================================
echo.

:test_loop
echo 🔍 Testing URLs at %time%...
echo.

powershell -Command "try { $r = Invoke-WebRequest -Uri 'https://ncskit.org' -TimeoutSec 5; Write-Host '✅ ncskit.org - Status:' $r.StatusCode -ForegroundColor Green } catch { Write-Host '⏳ ncskit.org - Still propagating...' -ForegroundColor Yellow }"

powershell -Command "try { $r = Invoke-WebRequest -Uri 'https://api.ncskit.org/health/' -TimeoutSec 5; Write-Host '✅ api.ncskit.org/health/ - Status:' $r.StatusCode -ForegroundColor Green } catch { Write-Host '⏳ api.ncskit.org/health/ - Still propagating...' -ForegroundColor Yellow }"

powershell -Command "try { $r = Invoke-WebRequest -Uri 'https://admin.ncskit.org/admin/' -TimeoutSec 5; Write-Host '✅ admin.ncskit.org/admin/ - Status:' $r.StatusCode -ForegroundColor Green } catch { Write-Host '⏳ admin.ncskit.org/admin/ - Still propagating...' -ForegroundColor Yellow }"

powershell -Command "try { $r = Invoke-WebRequest -Uri 'https://health.ncskit.org/health/' -TimeoutSec 5; Write-Host '✅ health.ncskit.org/health/ - Status:' $r.StatusCode -ForegroundColor Green } catch { Write-Host '⏳ health.ncskit.org/health/ - Still propagating...' -ForegroundColor Yellow }"

echo.
echo 🔄 Testing again in 30 seconds... (Ctrl+C to stop)
timeout /t 30 /nobreak >nul
goto test_loop