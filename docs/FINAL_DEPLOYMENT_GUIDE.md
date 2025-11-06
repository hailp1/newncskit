# 🚀 NCSKIT.ORG - Final Deployment Guide

## 📊 Current Status
- ✅ **Backend**: Running on http://localhost:8000
- ✅ **Frontend**: Running on http://localhost:3000  
- ✅ **Configuration**: Ready for ncskit.org
- ⏳ **Tunnel**: Needs manual setup (Windows Defender issue)

## 🎯 Quick Deployment Steps

### Step 1: Add Windows Defender Exception
1. Open **Windows Security**
2. Go to **Virus & threat protection** → **Manage settings**
3. Under **Exclusions**, click **Add or remove exclusions**
4. Add **File** exclusion for `cloudflared.exe`

### Step 2: Run Tunnel Setup Commands
```bash
# Login to Cloudflare
.\cloudflared.exe tunnel login

# Create tunnel named 'ncskit'
.\cloudflared.exe tunnel create ncskit

# Note down the Tunnel ID from output
# Example: Created tunnel ncskit with id xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

# Create DNS routes
.\cloudflared.exe tunnel route dns ncskit ncskit.org
.\cloudflared.exe tunnel route dns ncskit www.ncskit.org
.\cloudflared.exe tunnel route dns ncskit api.ncskit.org
.\cloudflared.exe tunnel route dns ncskit admin.ncskit.org
.\cloudflared.exe tunnel route dns ncskit health.ncskit.org
```

### Step 3: Update Configuration
Run the update script:
```bash
update-tunnel-config.bat
```
Enter your Tunnel ID when prompted.

### Step 4: Start Production
```bash
start-ncskit-production.bat
```

## 🌐 Expected Live URLs

After successful setup:
- **https://ncskit.org** - Main website
- **https://www.ncskit.org** - Main website (www)
- **https://api.ncskit.org** - API endpoints
- **https://admin.ncskit.org/admin/** - Django admin
- **https://health.ncskit.org/health/** - Health check

## 🔧 Configuration Details

### Tunnel Configuration (`ncskit-tunnel-config.yml`)
```yaml
tunnel: [YOUR_TUNNEL_ID]
credentials-file: C:\Users\OWNER\.cloudflared\[YOUR_TUNNEL_ID].json

ingress:
  - hostname: ncskit.org
    service: http://localhost:3000
  - hostname: www.ncskit.org  
    service: http://localhost:3000
  - hostname: api.ncskit.org
    service: http://localhost:8000
  - hostname: admin.ncskit.org
    service: http://localhost:8000
  - hostname: health.ncskit.org
    service: http://localhost:8000
  - service: http_status:404
```

### Service Mapping
- **Frontend (Next.js)**: Port 3000 → ncskit.org, www.ncskit.org
- **Backend (Django)**: Port 8000 → api.ncskit.org, admin.ncskit.org, health.ncskit.org

## 🚨 Troubleshooting

### If tunnel fails to start:
1. Check Windows Defender exclusions
2. Verify Tunnel ID in config file
3. Check credentials file exists: `C:\Users\OWNER\.cloudflared\[TUNNEL_ID].json`
4. Validate config: `.\cloudflared.exe tunnel --config ncskit-tunnel-config.yml validate`

### If websites don't load:
1. Verify local servers are running (localhost:3000, localhost:8000)
2. Check tunnel logs in `cloudflared.log`
3. Verify DNS propagation: `nslookup ncskit.org`

## 📞 Next Steps

1. **Complete tunnel setup** using the manual steps above
2. **Test all URLs** to ensure proper routing
3. **Monitor logs** for any issues
4. **Setup SSL certificates** (handled automatically by Cloudflare)

## 🎉 Success Indicators

When everything works:
- ✅ All URLs respond with 200 status
- ✅ Frontend loads at ncskit.org
- ✅ API endpoints work at api.ncskit.org
- ✅ Admin panel accessible at admin.ncskit.org/admin/
- ✅ Health check returns OK at health.ncskit.org/health/

**NCSKIT is ready for production! 🚀**