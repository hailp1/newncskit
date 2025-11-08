# Deploy to Vercel Script
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Deploying to Vercel Production" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Change to frontend directory
Set-Location frontend

Write-Host "Step 1: Login to Vercel" -ForegroundColor Yellow
Write-Host "Please follow the browser prompts to login..." -ForegroundColor Gray
vercel login

Write-Host ""
Write-Host "Step 2: Deploy to Production" -ForegroundColor Yellow
Write-Host "Deploying your application..." -ForegroundColor Gray
vercel --prod

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Deployment Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Your application has been deployed to Vercel!" -ForegroundColor Green
Write-Host "Check your Vercel dashboard for the deployment URL." -ForegroundColor Yellow
Write-Host ""

Read-Host "Press Enter to exit"
