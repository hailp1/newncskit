# Simple OAuth credentials update script
param(
    [string]$Provider,
    [string]$ClientId,
    [string]$ClientSecret
)

Write-Host "UPDATE OAUTH CREDENTIALS" -ForegroundColor Green
Write-Host "========================" -ForegroundColor Cyan
Write-Host ""

if (-not $Provider -or -not $ClientId -or -not $ClientSecret) {
    Write-Host "Missing parameters!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Usage:" -ForegroundColor Yellow
    Write-Host ".\update-oauth-simple.ps1 -Provider google -ClientId YOUR_ID -ClientSecret YOUR_SECRET" -ForegroundColor Cyan
    exit 1
}

$envFile = "frontend\.env.local"
$content = Get-Content $envFile

switch ($Provider.ToLower()) {
    "google" {
        $content = $content -replace "GOOGLE_CLIENT_ID=.*", "GOOGLE_CLIENT_ID=$ClientId"
        $content = $content -replace "GOOGLE_CLIENT_SECRET=.*", "GOOGLE_CLIENT_SECRET=$ClientSecret"
        Write-Host "Updated Google OAuth credentials" -ForegroundColor Green
    }
    "linkedin" {
        $content = $content -replace "LINKEDIN_CLIENT_ID=.*", "LINKEDIN_CLIENT_ID=$ClientId"
        $content = $content -replace "LINKEDIN_CLIENT_SECRET=.*", "LINKEDIN_CLIENT_SECRET=$ClientSecret"
        Write-Host "Updated LinkedIn OAuth credentials" -ForegroundColor Green
    }
    "orcid" {
        $content = $content -replace "ORCID_CLIENT_ID=.*", "ORCID_CLIENT_ID=$ClientId"
        $content = $content -replace "ORCID_CLIENT_SECRET=.*", "ORCID_CLIENT_SECRET=$ClientSecret"
        Write-Host "Updated ORCID OAuth credentials" -ForegroundColor Green
    }
}

$content | Set-Content $envFile

Write-Host ""
Write-Host "SUCCESS!" -ForegroundColor Green
Write-Host "Provider: $Provider" -ForegroundColor Cyan
Write-Host "Client ID: $($ClientId.Substring(0, 20))..." -ForegroundColor Cyan
Write-Host ""
Write-Host "Next: Run verification" -ForegroundColor Yellow
Write-Host "node scripts/verify-oauth.js" -ForegroundColor Cyan