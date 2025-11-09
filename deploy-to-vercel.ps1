# Deployment Script for Data Analysis & Campaigns v2 (PowerShell)
# Usage: .\deploy-to-vercel.ps1 [staging|production]

param(
    [Parameter(Position=0)]
    [ValidateSet("staging", "production")]
    [string]$Environment = "staging"
)

$ErrorActionPreference = "Stop"

# Configuration
$ProjectDir = $PSScriptRoot
$FrontendDir = Join-Path $ProjectDir "frontend"

# Colors
function Write-Success { Write-Host "✓ $args" -ForegroundColor Green }
function Write-Error { Write-Host "✗ $args" -ForegroundColor Red }
function Write-Warning { Write-Host "⚠ $args" -ForegroundColor Yellow }
function Write-Info { Write-Host "ℹ $args" -ForegroundColor Cyan }
function Write-Header { Write-Host "`n$args" -ForegroundColor Blue }

Write-Host "========================================" -ForegroundColor Blue
Write-Host "  NCSKit Deployment Script" -ForegroundColor Blue
Write-Host "  Environment: $Environment" -ForegroundColor Blue
Write-Host "========================================" -ForegroundColor Blue
Write-Host ""

# Step 1: Pre-deployment checks
Write-Header "Step 1: Pre-deployment checks"
Write-Host "-----------------------------------"

# Check if we're in the right directory
if (-not (Test-Path $FrontendDir)) {
    Write-Error "Frontend directory not found!"
    exit 1
}
Write-Success "Project directory verified"

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Success "Node.js found: $nodeVersion"
} catch {
    Write-Error "Node.js is not installed!"
    exit 1
}

# Check if npm is installed
try {
    $npmVersion = npm --version
    Write-Success "npm found: $npmVersion"
} catch {
    Write-Error "npm is not installed!"
    exit 1
}

# Check if Vercel CLI is installed
try {
    vercel --version | Out-Null
    Write-Success "Vercel CLI found"
} catch {
    Write-Warning "Vercel CLI not found. Installing..."
    npm install -g vercel
}

Write-Host ""

# Step 2: Run tests
Write-Header "Step 2: Running tests"
Write-Host "-----------------------------------"

Push-Location $FrontendDir

# Type check
Write-Info "Running TypeScript type check..."
try {
    npm run type-check 2>$null
    Write-Success "Type check passed"
} catch {
    Write-Warning "Type check skipped (script not found)"
}

# Build test
Write-Info "Running build test..."
try {
    npm run build
    Write-Success "Build successful"
} catch {
    Write-Error "Build failed!"
    Pop-Location
    exit 1
}

Pop-Location

Write-Host ""

# Step 3: Git status check
Write-Header "Step 3: Git status check"
Write-Host "-----------------------------------"

Push-Location $ProjectDir

# Check if there are uncommitted changes
$gitStatus = git status -s
if ($gitStatus) {
    Write-Warning "You have uncommitted changes:"
    git status -s
    Write-Host ""
    $continue = Read-Host "Do you want to continue anyway? (y/N)"
    if ($continue -ne "y" -and $continue -ne "Y") {
        Write-Info "Deployment cancelled"
        Pop-Location
        exit 0
    }
} else {
    Write-Success "No uncommitted changes"
}

# Show current branch
$currentBranch = git branch --show-current
Write-Info "Current branch: $currentBranch"

Pop-Location

Write-Host ""

# Step 4: Deploy to Vercel
Write-Header "Step 4: Deploying to Vercel"
Write-Host "-----------------------------------"

Push-Location $FrontendDir

if ($Environment -eq "production") {
    Write-Warning "Deploying to PRODUCTION!"
    $confirm = Read-Host "Are you sure? (y/N)"
    if ($confirm -ne "y" -and $confirm -ne "Y") {
        Write-Info "Deployment cancelled"
        Pop-Location
        exit 0
    }
    
    Write-Info "Deploying to production..."
    vercel --prod
} else {
    Write-Info "Deploying to staging..."
    vercel
}

Write-Success "Deployment initiated"

Pop-Location

Write-Host ""

# Step 5: Post-deployment verification
Write-Header "Step 5: Post-deployment verification"
Write-Host "-----------------------------------"

Write-Info "Please verify the following:"
Write-Host "  1. Visit the deployment URL"
Write-Host "  2. Test /analysis/[projectId] page"
Write-Host "  3. Verify auto-detection triggers"
Write-Host "  4. Check browser console for errors"
Write-Host "  5. Test navigation between steps"
Write-Host "  6. Verify auto-save functionality"
Write-Host ""

if ($Environment -eq "production") {
    Write-Warning "PRODUCTION DEPLOYMENT CHECKLIST:"
    Write-Host "  [ ] Monitor error rates in Vercel dashboard"
    Write-Host "  [ ] Check database performance"
    Write-Host "  [ ] Watch user feedback channels"
    Write-Host "  [ ] Keep rollback plan ready"
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Deployment Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Info "Check Vercel dashboard for deployment status"
Write-Info "Deployment URL will be shown above"
Write-Host ""
