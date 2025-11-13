# 🌐 DNS Configuration for ncskit.org

## Quick Setup Guide

### Step 1: Download Cloudflared
```powershell
# Run in PowerShell (Admin)
Invoke-WebRequest -Uri "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe" -OutFile "cloudflared.exe"
```

### Step 2: Login to Cloudflare
```bash
.\cloudflared.exe tunnel login
```
- Browser will open
- Select domain: **ncskit.org**
- Click Authorize

### Step 3: Create Tunnel
```bash
.\cloudflared.exe tunnel create ncskit
```
**Save the Tunnel ID** that appears (format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)

### Step 4: Get DNS Configuration

After creating tunnel, Cloudflare will automatically provide DNS records. 

**OR** run this command to route DNS:
```bash
.\cloudflared.exe tunnel route dns ncskit ncskit.org
.\cloudflared.exe tunnel route dns ncskit www.ncskit.org
```

---

## Manual DNS Configuration (If needed)

If automatic routing doesn't work, add these records manually in Cloudflare Dashboard:

### Go to: Cloudflare Dashboard → ncskit.org → DNS → Records

### Add these CNAME records:

#### Record 1: Root Domain
```
Type: CNAME
Name: @
Target: <TUNNEL_ID>.cfargotunnel.com
Proxy status: Proxied (Orange cloud)
TTL: Auto
```

#### Record 2: WWW Subdomain
```
Type: CNAME
Name: www
Target: <TUNNEL_ID>.cfargotunnel.com
Proxy status: Proxied (Orange cloud)
TTL: Auto
```

**Replace `<TUNNEL_ID>` with your actual Tunnel ID from Step 3**

---

## Example DNS Records

If your Tunnel ID is: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`

Then your DNS records should be:

| Type  | Name | Target                                              | Proxy  |
|-------|------|-----------------------------------------------------|--------|
| CNAME | @    | a1b2c3d4-e5f6-7890-abcd-ef1234567890.cfargotunnel.com | ✅ Yes |
| CNAME | www  | a1b2c3d4-e5f6-7890-abcd-ef1234567890.cfargotunnel.com | ✅ Yes |

---

## Verification

After adding DNS records, verify with:

```bash
# Check DNS propagation
nslookup ncskit.org
nslookup www.ncskit.org

# Or use online tool
# https://dnschecker.org
```

---

## Complete Setup Commands

```powershell
# 1. Download cloudflared
Invoke-WebRequest -Uri "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe" -OutFile "cloudflared.exe"

# 2. Login
.\cloudflared.exe tunnel login

# 3. Create tunnel
.\cloudflared.exe tunnel create ncskit

# 4. Route DNS (automatic)
.\cloudflared.exe tunnel route dns ncskit ncskit.org
.\cloudflared.exe tunnel route dns ncskit www.ncskit.org

# 5. Create config file (copy tunnel ID from step 3)
# Edit cloudflared-config.yml with your Tunnel ID

# 6. Start tunnel
.\cloudflared.exe tunnel --config cloudflared-config.yml run ncskit
```

---

## Troubleshooting

### DNS not resolving?
- Wait 5-10 minutes for DNS propagation
- Clear DNS cache: `ipconfig /flushdns`
- Check Cloudflare DNS settings
- Ensure Proxy is enabled (Orange cloud)

### Tunnel not connecting?
- Ensure Next.js is running on port 3000
- Check firewall settings
- Verify config file path is correct

### SSL/TLS errors?
- Go to Cloudflare Dashboard → SSL/TLS
- Set to "Full" or "Flexible" mode
- Enable "Always Use HTTPS"

---

## Next Steps

1. ✅ Create tunnel
2. ✅ Configure DNS
3. ✅ Start Next.js: `cd frontend && npm run dev`
4. ✅ Start tunnel: `.\cloudflared.exe tunnel --config cloudflared-config.yml run ncskit`
5. ✅ Visit: https://ncskit.org

---

## Production Deployment

### Install as Windows Service:
```powershell
# Install
.\cloudflared.exe service install

# Start
sc start cloudflared

# Check status
sc query cloudflared

# Stop
sc stop cloudflared
```

---

## Support

- Cloudflare Tunnel Docs: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/
- DNS Checker: https://dnschecker.org
- Cloudflare Community: https://community.cloudflare.com/
