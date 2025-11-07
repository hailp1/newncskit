# Deploy to Vercel Script
# Automates the deployment process to Vercel

param(
    [switch]$Production,
    [switch]$Preview,
    [switch]$SkipBuild,
    [switch]$SkipTests,
    [string]$Message = ""
)

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  NCSKIT Vercel Deployment" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Determine deployment type
$deploymentType = if ($Production) { "Production" } else { "Preview" }
Write-Host "Deployment Type: $deploymentType" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the correct directory
if (-not (Test-Path "frontend/package.json")) {
    Write-Host "❌ Error: Must run from project root directory" -ForegroundColor Red
    exit 1
}

# Step 1: Check Git status
Write-Host "Step 1: Checking Git status..." -ForegroundColor Yellow

$gitStatus = git status --porcelain 2>$null

if ($gitStatus -and -not $Preview) {
    Write-Host "⚠️  You have uncommitted changes:" -ForegroundColor Yellow
    git status --short
    Write-Host ""
    
    $response = Read-Host "Do you want to commit these changes? (y/N)"
    
    if ($response -eq "y" -or $response -eq "Y") {
        if (-not $Message) {
            $Message = Read-Host "Enter commit message"
        }
        
        Write-Host "   Staging all changes..." -ForegroundColor Cyan
        git add .
        
        Write-Host "   Committing changes..." -ForegroundColor Cyan
        git commit -m $Message
        
        Write-Host "✅ Changes committed" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Proceeding with uncommitted changes" -ForegroundColor Yellow
    }
} else {
    Write-Host "✅ Working directory is clean" -ForegroundColor Green
}

Write-Host ""

# Step 2: Run tests (unless skipped)
if (-not $SkipTests) {
    Write-Host "Step 2: Running tests..." -ForegroundColor Yellow
    
    Set-Location frontend
    
    Write-Host "   Running type check..." -ForegroundColor Cyan
    npm run type-check
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Type check failed" -ForegroundColor Red
        Set-Location ..
        exit 1
    }
    
    Write-Host "   Running tests..." -ForegroundColor Cyan
    npm run test
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Tests failed" -ForegroundColor Red
        Set-Location ..
        exit 1
    }
    
    Write-Host "✅ All tests passed" -ForegroundColor Green
    
    Set-Location ..
} else {
    Write-Host "Step 2: Skipping tests (--SkipTests flag)" -ForegroundColor Yellow
}

Write-Host ""

# Step 3: Build locally (unless skipped)
if (-not $SkipBuild) {
    Write-Host "Step 3: Building locally..." -ForegroundColor Yellow
    
    Set-Location frontend
    
    Write-Host "   Running build..." -ForegroundColor Cyan
    npm run build
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Build failed" -ForegroundColor Red
        Set-Location ..
        exit 1
    }
    
    Write-Host "✅ Build successful" -ForegroundColor Green
    
    Set-Location ..
} else {
    Write-Host "Step 3: Skipping local build (--SkipBuild flag)" -ForegroundColor Yellow
}

Write-Host ""

# Step 4: Push to Git (for production)
if ($Production) {
    Write-Host "Step 4: Pushing to Git repository..." -ForegroundColor Yellow
    
    $currentBranch = git branch --show-current
    Write-Host "   Current branch: $currentBranch" -ForegroundColor Cyan
    
    if ($currentBranch -ne "main" -and $currentBranch -ne "master") {
        Write-Host "⚠️  You are not on main/master branch" -ForegroundColor Yellow
        $response = Read-Host "Do you want to continue? (y/N)"
        
        if ($response -ne "y" -and $response -ne "Y") {
            Write-Host "Deployment cancelled" -ForegroundColor Yellow
            exit 0
        }
    }
    
    Write-Host "   Pushing to remote..." -ForegroundColor Cyan
    git push origin $currentBranch
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to push to Git" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✅ Pushed to Git successfully" -ForegroundColor Green
} else {
    Write-Host "Step 4: Skipping Git push (preview deployment)" -ForegroundColor Yellow
}

Write-Host ""

# Step 5: Deploy to Vercel
Write-Host "Step 5: Deploying to Vercel..." -ForegroundColor Yellow

Set-Location frontend

if ($Production) {
    Write-Host "   Deploying to production..." -ForegroundColor Cyan
    Write-Host "   This will update your live site!" -ForegroundColor Yellow
    Write-Host ""
    
    $response = Read-Host "Are you sure you want to deploy to production? (y/N)"
    
    if ($response -ne "y" -and $response -ne "Y") {
        Write-Host "Deployment cancelled" -ForegroundColor Yellow
        Set-Location ..
        exit 0
    }
    
    vercel --prod
} else {
    Write-Host "   Deploying to preview..." -ForegroundColor Cyan
    vercel
}

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Deployment failed" -ForegroundColor Red
    Set-Location ..
    exit 1
}

Write-Host "✅ Deployment successful" -ForegroundColor Green

Set-Location ..

Write-Host ""

# Step 6: Get deployment URL
Write-Host "Step 6: Getting deployment URL..." -ForegroundColor Yellow

Set-Location frontend

$deploymentInfo = vercel ls --json 2>$null | ConvertFrom-Json | Select-Object -First 1

if ($deploymentInfo) {
    $deploymentUrl = "https://$($deploymentInfo.url)"
    Write-Host "✅ Deployment URL: $deploymentUrl" -ForegroundColor Green
    
    # Copy to clipboard (Windows)
    $deploymentUrl | Set-Clipboard
    Write-Host "   URL copied to clipboard" -ForegroundColor Cyan
} else {
    Write-Host "⚠️  Could not retrieve deployment URL" -ForegroundColor Yellow
    Write-Host "   Check Vercel dashboard: https://vercel.com/dashboard" -ForegroundColor Cyan
}

Set-Location ..

Write-Host ""

# Step 7: Summary
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Deployment Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Deployment Type: $deploymentType" -ForegroundColor White
if ($deploymentInfo) {
    Write-Host "Deployment URL: $deploymentUrl" -ForegroundColor White
}
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Open deployment URL to verify" -ForegroundColor White
Write-Host "  2. Check deployment logs: vercel logs <url>" -ForegroundColor White
Write-Host "  3. Monitor health checks: <url>/api/health" -ForegroundColor White
if (-not $Production) {
    Write-Host "  4. If preview looks good, deploy to production:" -ForegroundColor White
    Write-Host "     .\deployment\deploy-to-vercel.ps1 -Production" -ForegroundColor Gray
}
Write-Host ""
Write-Host "Useful Commands:" -ForegroundColor Cyan
Write-Host "  vercel logs <url>  - View deployment logs" -ForegroundColor Gray
Write-Host "  vercel ls          - List all deployments" -ForegroundColor Gray
Write-Host "  vercel inspect     - Inspect deployment details" -ForegroundColor Gray
Write-Host "  vercel rollback    - Rollback to previous deployment" -ForegroundColor Gray
Write-Host ""
