# Deploy to Vercel - New Version
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Deploying to Vercel - New Version" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Set-Location frontend

Write-Host "Checking for uncommitted changes..." -ForegroundColor Yellow
git status

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Step 1: Add all changes" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
git add .

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Step 2: Commit changes" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
$commitMsg = Read-Host "Enter commit message (or press Enter for default)"
if ([string]::IsNullOrWhiteSpace($commitMsg)) {
    $commitMsg = "feat: Update admin blog system types"
}

git commit -m $commitMsg

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Step 3: Push to repository" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
git push origin main

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Deployment initiated!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Your changes have been pushed to the repository." -ForegroundColor Green
Write-Host "If your project is connected to Vercel, it will automatically deploy." -ForegroundColor Green
Write-Host ""
Write-Host "You can monitor the deployment at:" -ForegroundColor Yellow
Write-Host "https://vercel.com/dashboard" -ForegroundColor Cyan
Write-Host ""
Write-Host "Or deploy manually using Vercel CLI:" -ForegroundColor Yellow
Write-Host "  vercel --prod" -ForegroundColor Cyan
Write-Host ""

Read-Host "Press Enter to exit"
