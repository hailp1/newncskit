# Script to automatically download and install R on Windows

Write-Host "🔧 NCSKIT R Installation Script" -ForegroundColor Blue
Write-Host "=================================" -ForegroundColor Blue

# Check if R is already installed
try {
    $rVersion = Rscript --version 2>$null
    if ($rVersion) {
        Write-Host "✅ R is already installed: $rVersion" -ForegroundColor Green
        Write-Host "Proceeding to install R packages..." -ForegroundColor Yellow
        Rscript install_packages.R
        exit 0
    }
} catch {
    Write-Host "R not found. Proceeding with installation..." -ForegroundColor Yellow
}

# Download R installer
$rVersion = "4.3.2"
$downloadUrl = "https://cran.r-project.org/bin/windows/base/R-$rVersion-win.exe"
$installerPath = "$env:TEMP\R-$rVersion-win.exe"

Write-Host "📥 Downloading R $rVersion..." -ForegroundColor Yellow
Write-Host "URL: $downloadUrl" -ForegroundColor Gray

try {
    Invoke-WebRequest -Uri $downloadUrl -OutFile $installerPath -UseBasicParsing
    Write-Host "✅ Download completed!" -ForegroundColor Green
} catch {
    Write-Host "❌ Download failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Please download R manually from: https://cran.r-project.org/bin/windows/base/" -ForegroundColor Yellow
    exit 1
}

# Install R
Write-Host "🔧 Installing R..." -ForegroundColor Yellow
Write-Host "This may take a few minutes..." -ForegroundColor Gray

try {
    Start-Process -FilePath $installerPath -ArgumentList "/SILENT" -Wait
    Write-Host "✅ R installation completed!" -ForegroundColor Green
} catch {
    Write-Host "❌ Installation failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Please run the installer manually: $installerPath" -ForegroundColor Yellow
    exit 1
}

# Add R to PATH (if not already there)
$rPath = "C:\Program Files\R\R-$rVersion\bin"
$currentPath = [Environment]::GetEnvironmentVariable("PATH", "User")

if ($currentPath -notlike "*$rPath*") {
    Write-Host "🔧 Adding R to PATH..." -ForegroundColor Yellow
    [Environment]::SetEnvironmentVariable("PATH", "$currentPath;$rPath", "User")
    $env:PATH += ";$rPath"
    Write-Host "✅ R added to PATH!" -ForegroundColor Green
}

# Verify installation
Write-Host "🔍 Verifying R installation..." -ForegroundColor Yellow
try {
    $rVersionCheck = Rscript --version 2>$null
    Write-Host "✅ R verification successful: $rVersionCheck" -ForegroundColor Green
} catch {
    Write-Host "⚠️  R installed but not in PATH. Please restart your terminal." -ForegroundColor Yellow
    Write-Host "Or manually add to PATH: $rPath" -ForegroundColor Gray
}

# Install R packages
Write-Host "📦 Installing R packages..." -ForegroundColor Yellow
try {
    Rscript install_packages.R
    Write-Host "✅ R packages installed successfully!" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Package installation may have failed. Please run manually:" -ForegroundColor Yellow
    Write-Host "Rscript install_packages.R" -ForegroundColor Gray
}

# Clean up
Remove-Item $installerPath -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "🎉 Installation completed!" -ForegroundColor Green
Write-Host "You can now run the R service with:" -ForegroundColor White
Write-Host "Rscript run_service.R" -ForegroundColor Cyan
Write-Host ""
Write-Host "If you encounter issues, please restart your terminal and try again." -ForegroundColor Yellow