# Test Supabase Connection from Vercel Deployment
# This script tests if Vercel frontend can connect to Supabase

param(
    [string]$DeploymentUrl = "https://frontend-l0bgox7rq-hailp1s-projects.vercel.app"
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Testing Supabase Connection" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Deployment URL: $DeploymentUrl" -ForegroundColor White
Write-Host ""

# Test 1: Health Check Endpoint
Write-Host "Test 1: Supabase Health Check..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$DeploymentUrl/api/health/supabase" -UseBasicParsing -ErrorAction Stop
    $data = $response.Content | ConvertFrom-Json
    
    Write-Host "✅ Status: $($data.status)" -ForegroundColor Green
    Write-Host "   Database: $($data.checks.database.status)" -ForegroundColor $(if ($data.checks.database.status -eq 'healthy') { 'Green' } else { 'Red' })
    Write-Host "   Auth: $($data.checks.auth.status)" -ForegroundColor $(if ($data.checks.auth.status -eq 'healthy') { 'Green' } else { 'Red' })
    Write-Host "   Storage: $($data.checks.storage.status)" -ForegroundColor $(if ($data.checks.storage.status -eq 'healthy') { 'Green' } else { 'Red' })
    Write-Host ""
    
    if ($data.checks.database.error) {
        Write-Host "   Database Error: $($data.checks.database.error)" -ForegroundColor Red
    }
    if ($data.checks.auth.error) {
        Write-Host "   Auth Error: $($data.checks.auth.error)" -ForegroundColor Red
    }
    if ($data.checks.storage.error) {
        Write-Host "   Storage Error: $($data.checks.storage.error)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Failed to connect" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "   Status Code: $statusCode" -ForegroundColor Red
        
        if ($statusCode -eq 401 -or $statusCode -eq 403) {
            Write-Host ""
            Write-Host "⚠️  Preview deployment requires authentication" -ForegroundColor Yellow
            Write-Host "   Try accessing the URL in your browser first:" -ForegroundColor Cyan
            Write-Host "   $DeploymentUrl/api/health/supabase" -ForegroundColor Gray
        }
    }
}

Write-Host ""

# Test 2: Environment Variables Check
Write-Host "Test 2: Environment Variables..." -ForegroundColor Yellow
Write-Host "   Checking Vercel environment variables..." -ForegroundColor Cyan

Set-Location frontend

$envVars = @(
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY"
)

foreach ($var in $envVars) {
    $result = npx vercel env ls 2>&1 | Select-String -Pattern $var
    if ($result) {
        Write-Host "   ✅ $var is configured" -ForegroundColor Green
    } else {
        Write-Host "   ❌ $var is missing" -ForegroundColor Red
    }
}

Set-Location ..

Write-Host ""

# Test 3: Local Supabase Connection
Write-Host "Test 3: Direct Supabase Connection..." -ForegroundColor Yellow
Write-Host "   Testing direct connection to Supabase..." -ForegroundColor Cyan

$supabaseUrl = "https://hfczndbrexnaoczxmopn.supabase.co"

try {
    $response = Invoke-WebRequest -Uri "$supabaseUrl/rest/v1/" -UseBasicParsing -ErrorAction Stop
    Write-Host "   ✅ Supabase is accessible" -ForegroundColor Green
    Write-Host "   Status: $($response.StatusCode)" -ForegroundColor Gray
} catch {
    Write-Host "   ❌ Cannot reach Supabase" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Summary
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Test Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Deployment URL:" -ForegroundColor White
Write-Host "  $DeploymentUrl" -ForegroundColor Gray
Write-Host ""

Write-Host "Supabase URL:" -ForegroundColor White
Write-Host "  $supabaseUrl" -ForegroundColor Gray
Write-Host ""

Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "  1. If preview requires auth, test in browser" -ForegroundColor White
Write-Host "  2. Check Vercel logs for detailed errors" -ForegroundColor White
Write-Host "  3. Verify Supabase RLS policies allow access" -ForegroundColor White
Write-Host "  4. Deploy to production: npx vercel --prod" -ForegroundColor White
Write-Host ""

Write-Host "Useful Links:" -ForegroundColor Cyan
Write-Host "  Vercel Dashboard: https://vercel.com/hailp1s-projects/frontend" -ForegroundColor Gray
Write-Host "  Supabase Dashboard: https://app.supabase.com/project/hfczndbrexnaoczxmopn" -ForegroundColor Gray
Write-Host "  Deployment Logs: https://vercel.com/hailp1s-projects/frontend/deployments" -ForegroundColor Gray
Write-Host ""
