# Test Upload API Script
# This script tests the analysis API endpoints

$baseUrl = "https://app.ncskit.org"
# For local testing, use: $baseUrl = "http://localhost:3000"

Write-Host "Testing Analysis API Endpoints..." -ForegroundColor Cyan
Write-Host ""

# Test 1: Test endpoint
Write-Host "1. Testing /api/analysis/test endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/analysis/test" -Method Get
    Write-Host "✓ Test endpoint working!" -ForegroundColor Green
    Write-Host "Response: $($response | ConvertTo-Json -Depth 3)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Test endpoint failed!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 2: Upload endpoint with GET (should fail gracefully)
Write-Host "2. Testing /api/analysis/upload with GET (should return error)..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/analysis/upload" -Method Get
    Write-Host "✓ Upload endpoint returns proper error for GET!" -ForegroundColor Green
    Write-Host "Response: $($response | ConvertTo-Json -Depth 3)" -ForegroundColor Gray
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 405) {
        Write-Host "✓ Upload endpoint correctly rejects GET requests (405)!" -ForegroundColor Green
    } else {
        Write-Host "✗ Unexpected error!" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""

# Test 3: Health endpoint
Write-Host "3. Testing /api/analysis/health endpoint..." -ForegroundColor Yellow
try {
    $body = @{
        projectId = "test-project-123"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$baseUrl/api/analysis/health" `
        -Method Post `
        -ContentType "application/json" `
        -Body $body
    
    Write-Host "✓ Health endpoint working!" -ForegroundColor Green
    Write-Host "Response: $($response | ConvertTo-Json -Depth 3)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Health endpoint failed!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "API Testing Complete!" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. If all tests pass, try uploading a CSV file at $baseUrl/analysis/new"
Write-Host "2. Check browser console for detailed logs"
Write-Host "3. If issues persist, check Vercel logs: vercel logs --follow"
