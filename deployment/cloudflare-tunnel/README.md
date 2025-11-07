# Cloudflare Tunnel Setup Guide

This directory contains scripts to setup and manage Cloudflare Tunnel for NCSKIT Analytics.

## Overview

Cloudflare Tunnel creates a secure connection between your local R Analytics service and the internet without exposing ports or configuring firewalls.

**Architecture:**
```
Internet → Cloudflare → Tunnel → Local Services
                                  ├─ R Analytics (port 8000)
                                  └─ Next.js (port 3000)
```

## Quick Start

### 1. Install Cloudflared

```powershell
.\install-cloudflared.ps1
```

This will:
- Download cloudflared CLI
- Install to `C:\Program Files\cloudflared\`
- Add to system PATH

**Note:** Restart your terminal after installation.

### 2. Authenticate

```powershell
.\authenticate-cloudflared.ps1
```

This will:
- Open browser for Cloudflare login
- Save credentials to `~/.cloudflared/cert.pem`

### 3. Create Tunnel

```powershell
.\create-tunnel.ps1
```

This will:
- Create tunnel named `ncskit-analytics`
- Generate configuration file
- Save to `./config/tunnel-config.yml`

### 4. Configure DNS

```powershell
.\configure-dns.ps1
```

This will:
- Setup DNS records for your domain
- Route `analytics.ncskit.org` to tunnel

**Or manually in Cloudflare Dashboard:**
1. Go to DNS settings
2. Add CNAME record:
   - Name: `analytics`
   - Target: `<tunnel-id>.cfargotunnel.com`

### 5. Test Tunnel

```powershell
.\test-tunnel.ps1
```

This will verify:
- Tunnel exists
- Configuration is valid
- Local services are running
- DNS is configured

### 6. Start Tunnel

**Option A: Manual (for testing)**
```powershell
.\start-tunnel.ps1
```
Press Ctrl+C to stop.

**Option B: Windows Service (production)**
```powershell
# Run as Administrator
.\setup-tunnel-service.ps1
```

This will:
- Install tunnel as Windows Service
- Enable auto-start on boot
- Start the service

## Configuration

### Tunnel Configuration File

Location: `./config/tunnel-config.yml`

```yaml
tunnel: <tunnel-id>
credentials-file: ~/.cloudflared/<tunnel-id>.json

ingress:
  # R Analytics API
  - hostname: analytics.ncskit.org
    service: http://localhost:8000
    
  # Next.js Frontend (optional)
  - hostname: ncskit.org
    service: http://localhost:3000
    
  # Catch-all
  - service: http_status:404

loglevel: info
logfile: ./logs/cloudflared.log
```

### Routes

| Domain | Local Service | Port |
|--------|--------------|------|
| analytics.ncskit.org | R Analytics API | 8000 |
| ncskit.org | Next.js Frontend | 3000 |

## Service Management

### Start Service
```powershell
Start-Service CloudflaredTunnel
```

### Stop Service
```powershell
Stop-Service CloudflaredTunnel
# Or use: .\stop-tunnel.ps1
```

### Restart Service
```powershell
Restart-Service CloudflaredTunnel
```

### Check Status
```powershell
Get-Service CloudflaredTunnel
```

### View Logs
```powershell
Get-Content .\logs\cloudflared.log -Tail 50 -Wait
```

### Uninstall Service
```powershell
# Run as Administrator
cloudflared service uninstall
```

## Troubleshooting

### Tunnel won't start
1. Check if local services are running:
   ```powershell
   # R Analytics
   curl http://localhost:8000/health
   
   # Next.js
   curl http://localhost:3000
   ```

2. Check tunnel configuration:
   ```powershell
   cloudflared tunnel info ncskit-analytics
   ```

3. View logs:
   ```powershell
   Get-Content .\logs\cloudflared.log -Tail 100
   ```

### DNS not resolving
1. Check DNS configuration:
   ```powershell
   cloudflared tunnel route dns list
   ```

2. Verify in Cloudflare Dashboard:
   - Go to DNS settings
   - Look for CNAME records pointing to tunnel

3. Wait for DNS propagation (can take 5-10 minutes)

### Service won't install
1. Run PowerShell as Administrator
2. Check cloudflared is installed:
   ```powershell
   cloudflared --version
   ```
3. Verify configuration file exists:
   ```powershell
   Test-Path .\config\tunnel-config.yml
   ```

### Connection errors
1. Check firewall settings
2. Verify Cloudflare account is active
3. Check tunnel credentials:
   ```powershell
   Test-Path ~/.cloudflared/cert.pem
   ```

## Security

### Credentials
- Stored in: `~/.cloudflared/`
- Keep these files secure
- Don't commit to version control

### Access Control
- Configure in Cloudflare Dashboard
- Use Cloudflare Access for authentication
- Enable rate limiting

### Monitoring
- Check logs regularly
- Monitor tunnel status
- Set up alerts in Cloudflare

## Advanced Configuration

### Multiple Services
Add more ingress rules in `tunnel-config.yml`:

```yaml
ingress:
  - hostname: api.ncskit.org
    service: http://localhost:8080
  - hostname: admin.ncskit.org
    service: http://localhost:9000
  - service: http_status:404
```

### Load Balancing
Use multiple tunnel instances:

```powershell
cloudflared tunnel create ncskit-analytics-2
```

### Custom Ports
Change local service ports in configuration:

```yaml
ingress:
  - hostname: analytics.ncskit.org
    service: http://localhost:8001  # Custom port
```

## Scripts Reference

| Script | Purpose | Admin Required |
|--------|---------|----------------|
| `install-cloudflared.ps1` | Install cloudflared CLI | Yes |
| `authenticate-cloudflared.ps1` | Login to Cloudflare | No |
| `create-tunnel.ps1` | Create new tunnel | No |
| `configure-dns.ps1` | Setup DNS records | No |
| `test-tunnel.ps1` | Test configuration | No |
| `start-tunnel.ps1` | Start tunnel manually | No |
| `stop-tunnel.ps1` | Stop tunnel service | Yes |
| `setup-tunnel-service.ps1` | Install as service | Yes |

## Resources

- [Cloudflare Tunnel Documentation](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/)
- [Cloudflared GitHub](https://github.com/cloudflare/cloudflared)
- [Cloudflare Dashboard](https://dash.cloudflare.com/)

## Support

For issues:
1. Check logs: `.\logs\cloudflared.log`
2. Run test script: `.\test-tunnel.ps1`
3. Review Cloudflare Tunnel docs
4. Contact NCSKIT support

## Version

Cloudflared version: Latest (auto-updated)
Configuration version: 1.0.0
