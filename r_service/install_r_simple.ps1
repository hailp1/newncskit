Write-Host "🔧 Installing R for NCSKIT..." -ForegroundColor Blue

# Check if R exists
$rExists = Get-Command "Rscript" -ErrorAction SilentlyContinue
if ($rExists) {
    Write-Host "✅ R is already installed!" -ForegroundColor Green
    Write-Host "Installing R packages..." -ForegroundColor Yellow
    Rscript install_packages.R
    exit
}

# Download R
$url = "https://cran.r-project.org/bin/windows/base/R-4.3.2-win.exe"
$output = "$env:TEMP\R-installer.exe"

Write-Host "📥 Downloading R..." -ForegroundColor Yellow
Invoke-WebRequest -Uri $url -OutFile $output

Write-Host "🔧 Installing R (this may take a few minutes)..." -ForegroundColor Yellow
Start-Process -FilePath $output -ArgumentList "/SILENT" -Wait

Write-Host "✅ R installation completed!" -ForegroundColor Green
Write-Host "Please restart your terminal and run:" -ForegroundColor Yellow
Write-Host "Rscript install_packages.R" -ForegroundColor Cyan