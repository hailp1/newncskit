Write-Host "Downloading R for Windows..." -ForegroundColor Green

$url = "https://cran.r-project.org/bin/windows/base/R-4.5.2-win.exe"
$output = "$env:TEMP\R-installer.exe"

Invoke-WebRequest -Uri $url -OutFile $output
Write-Host "Downloaded to: $output" -ForegroundColor Yellow
Write-Host "Please run the installer manually" -ForegroundColor Cyan