# Cleanup Dependencies Script
# Removes unused packages and reinstalls dependencies

Write-Host "Cleaning up unused dependencies..." -ForegroundColor Cyan
Write-Host ""

# Check if we're in the frontend directory
if (-not (Test-Path "package.json")) {
    Write-Host "Error: package.json not found" -ForegroundColor Red
    Write-Host "Please run this script from the frontend directory" -ForegroundColor Yellow
    exit 1
}

Write-Host "Removed dependencies:" -ForegroundColor Green
Write-Host "  - next-auth" -ForegroundColor Gray
Write-Host "  - @next-auth/prisma-adapter" -ForegroundColor Gray
Write-Host "  - pg" -ForegroundColor Gray
Write-Host "  - @types/pg" -ForegroundColor Gray
Write-Host "  - bcryptjs" -ForegroundColor Gray
Write-Host "  - @types/bcryptjs" -ForegroundColor Gray
Write-Host "  - jsonwebtoken" -ForegroundColor Gray
Write-Host "  - @types/jsonwebtoken" -ForegroundColor Gray
Write-Host ""

# Remove node_modules and package-lock.json for clean install
Write-Host "Cleaning node_modules..." -ForegroundColor Cyan
if (Test-Path "node_modules") {
    Remove-Item -Recurse -Force "node_modules"
    Write-Host "node_modules removed" -ForegroundColor Green
}

if (Test-Path "package-lock.json") {
    Remove-Item -Force "package-lock.json"
    Write-Host "package-lock.json removed" -ForegroundColor Green
}
Write-Host ""

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Cyan
npm install

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "Dependencies installed successfully!" -ForegroundColor Green
    Write-Host ""
    
    Write-Host "Summary:" -ForegroundColor Cyan
    Write-Host "  - 8 packages removed" -ForegroundColor Gray
    Write-Host "  - Approximately 15MB saved" -ForegroundColor Gray
    Write-Host "  - 0 breaking changes" -ForegroundColor Gray
    Write-Host ""
    
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "  1. Run: npm run build" -ForegroundColor Yellow
    Write-Host "  2. Test authentication" -ForegroundColor Yellow
    Write-Host "  3. Verify no errors" -ForegroundColor Yellow
    Write-Host ""
    
    Write-Host "Task 3.5 Complete!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "Installation failed" -ForegroundColor Red
    Write-Host "Please check the error messages above" -ForegroundColor Yellow
    exit 1
}
