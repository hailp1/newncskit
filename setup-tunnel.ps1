# Cloudflare Tunnel Setup Script for Windows
# Run this script in PowerShell (Admin)

Write-Host "🚀 NCSKIT Cloudflare Tunnel Setup" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Check if cloudflared is installed
$cloudflaredPath = Get-Command cloudflared -ErrorAction SilentlyContinue

if (-not $cloudflaredPath) {
    Write-Host "❌ cloudflared not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please download cloudflared from:" -ForegroundColor Yellow
    Write-Host "https://github.com/cloudflare/cloudflared/releases/latest" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Or run this command to download:" -ForegroundColor Yellow
    Write-Host 'Invoke-WebRequest -Uri "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe" -OutFile "cloudflared.exe"' -ForegroundColor Green
    exit 1
}

Write-Host "✅ cloudflared found at: $($cloudflaredPath.Source)" -ForegroundColor Green
Write-Host ""

# Step 1: Login
Write-Host "Step 1: Login to Cloudflare" -ForegroundColor Cyan
Write-Host "----------------------------" -ForegroundColor Cyan
$login = Read-Host "Do you want to login now? (y/n)"

if ($login -eq "y") {
    Write-Host "Opening browser for authentication..." -ForegroundColor Yellow
    cloudflared tunnel login
    Write-Host "✅ Login complete!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Skipping login. Run 'cloudflared tunnel login' manually." -ForegroundColor Yellow
}

Write-Host ""

# Step 2: Create Tunnel
Write-Host "Step 2: Create Tunnel" -ForegroundColor Cyan
Write-Host "---------------------" -ForegroundColor Cyan
$create = Read-Host "Do you want to create tunnel 'ncskit'? (y/n)"

if ($create -eq "y") {
    Write-Host "Creating tunnel..." -ForegroundColor Yellow
    $output = cloudflared tunnel create ncskit 2>&1
    Write-Host $output
    
    # Extract Tunnel ID
    if ($output -match "Created tunnel ncskit with id ([a-f0-9-]+)") {
        $tunnelId = $matches[1]
        Write-Host ""
        Write-Host "✅ Tunnel created successfully!" -ForegroundColor Green
        Write-Host "Tunnel ID: $tunnelId" -ForegroundColor Yellow
        Write-Host ""
        
        # Save to file
        $tunnelId | Out-File -FilePath "tunnel-id.txt" -Encoding UTF8
        Write-Host "💾 Tunnel ID saved to tunnel-id.txt" -ForegroundColor Green
    }
} else {
    Write-Host "⚠️  Skipping tunnel creation." -ForegroundColor Yellow
}

Write-Host ""

# Step 3: Create Config
Write-Host "Step 3: Create Configuration File" -ForegroundColor Cyan
Write-Host "----------------------------------" -ForegroundColor Cyan

if (Test-Path "tunnel-id.txt") {
    $tunnelId = Get-Content "tunnel-id.txt" -Raw
    $tunnelId = $tunnelId.Trim()
    $username = $env:USERNAME
    
    $config = @"
# Cloudflare Tunnel Configuration for ncskit.org
tunnel: $tunnelId
credentials-file: C:\Users\$username\.cloudflared\$tunnelId.json

ingress:
  - hostname: ncskit.org
    service: http://localhost:3000
    originRequest:
      noTLSVerify: true
  
  - hostname: www.ncskit.org
    service: http://localhost:3000
    originRequest:
      noTLSVerify: true
  
  - service: http_status:404
"@
    
    $config | Out-File -FilePath "cloudflared-config.yml" -Encoding UTF8
    Write-Host "✅ Config file created: cloudflared-config.yml" -ForegroundColor Green
} else {
    Write-Host "⚠️  Tunnel ID not found. Please create tunnel first." -ForegroundColor Yellow
}

Write-Host ""

# Step 4: Route DNS
Write-Host "Step 4: Route DNS" -ForegroundColor Cyan
Write-Host "-----------------" -ForegroundColor Cyan
$dns = Read-Host "Do you want to route DNS now? (y/n)"

if ($dns -eq "y") {
    Write-Host "Routing ncskit.org..." -ForegroundColor Yellow
    cloudflared tunnel route dns ncskit ncskit.org
    
    Write-Host "Routing www.ncskit.org..." -ForegroundColor Yellow
    cloudflared tunnel route dns ncskit www.ncskit.org
    
    Write-Host "✅ DNS routes created!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Skipping DNS routing." -ForegroundColor Yellow
    Write-Host "Run these commands manually:" -ForegroundColor Yellow
    Write-Host "  cloudflared tunnel route dns ncskit ncskit.org" -ForegroundColor Green
    Write-Host "  cloudflared tunnel route dns ncskit www.ncskit.org" -ForegroundColor Green
}

Write-Host ""
Write-Host "=================================" -ForegroundColor Cyan
Write-Host "✅ Setup Complete!" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Start your Next.js app: cd frontend && npm run dev" -ForegroundColor White
Write-Host "2. Start tunnel: cloudflared tunnel --config cloudflared-config.yml run ncskit" -ForegroundColor White
Write-Host "3. Visit: https://ncskit.org" -ForegroundColor White
Write-Host ""
Write-Host "To install as Windows service:" -ForegroundColor Yellow
Write-Host "  cloudflared service install" -ForegroundColor White
Write-Host "  sc start cloudflared" -ForegroundColor White
Write-Host ""
