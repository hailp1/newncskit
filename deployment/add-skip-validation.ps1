# Add SKIP_ENV_VALIDATION to all environments

Set-Location frontend

Write-Host "Adding SKIP_ENV_VALIDATION..." -ForegroundColor Cyan

"true" | Out-File -FilePath "temp.txt" -Encoding utf8 -NoNewline

Write-Host "  Production..." -ForegroundColor Yellow
Get-Content "temp.txt" | npx vercel env add SKIP_ENV_VALIDATION production 2>&1 | Out-Null

Write-Host "  Preview..." -ForegroundColor Yellow
Get-Content "temp.txt" | npx vercel env add SKIP_ENV_VALIDATION preview 2>&1 | Out-Null

Write-Host "  Development..." -ForegroundColor Yellow
Get-Content "temp.txt" | npx vercel env add SKIP_ENV_VALIDATION development 2>&1 | Out-Null

Remove-Item "temp.txt"

Write-Host "✅ SKIP_ENV_VALIDATION added to all environments" -ForegroundColor Green

Set-Location ..
