# ✅ Cloudflare Tunnel - SẴN SÀNG!

## 🎉 SETUP HOÀN TẤT!

### ✅ Tunnel Information
- **Tunnel Name:** ncskit
- **Tunnel ID:** bce1d1b0-1f68-4b83-a7d8-6aa36095346f
- **Status:** Ready
- **Config File:** `cloudflared-config.yml` ✅ Created

### ✅ DNS Routes
- ✅ `ncskit.org` → Tunnel (Already configured)
- ✅ `www.ncskit.org` → Tunnel (Already configured)

### ✅ Configuration
```yaml
tunnel: bce1d1b0-1f68-4b83-a7d8-6aa36095346f
credentials-file: C:\Users\OWNER\.cloudflared\bce1d1b0-1f68-4b83-a7d8-6aa36095346f.json

ingress:
  - hostname: ncskit.org
    service: http://localhost:3000
  
  - hostname: www.ncskit.org
    service: http://localhost:3000
  
  - service: http_status:404
```

---

## 🚀 START SERVICES

### 1. Start Docker Stack
```powershell
docker-compose -f docker-compose.production.yml up -d
```

### 2. Wait for Services (~10s)
```powershell
Start-Sleep -Seconds 10
```

### 3. Check Status
```powershell
docker-compose -f docker-compose.production.yml ps
```

### 4. Run Database Migrations
```powershell
docker-compose -f docker-compose.production.yml exec frontend npx prisma migrate deploy
```

### 5. Start Cloudflare Tunnel
```powershell
.\cloudflared.exe tunnel --config cloudflared-config.yml run ncskit
```

---

## 🎯 QUICK START (All-in-One)

### Terminal 1: Docker Services
```powershell
# Start all services
docker-compose -f docker-compose.production.yml up -d

# Wait
Start-Sleep -Seconds 15

# Run migrations
docker-compose -f docker-compose.production.yml exec frontend npx prisma migrate deploy

# View logs
docker-compose -f docker-compose.production.yml logs -f
```

### Terminal 2: Cloudflare Tunnel
```powershell
# Start tunnel
.\cloudflared.exe tunnel --config cloudflared-config.yml run ncskit
```

---

## 🌐 ACCESS URLS

### Local (Before Tunnel)
- http://localhost:3000

### Public (After Tunnel)
- https://ncskit.org
- https://www.ncskit.org

---

## 📊 VERIFY DNS

### Check DNS Records
```powershell
nslookup ncskit.org
nslookup www.ncskit.org
```

### Cloudflare Dashboard
1. Go to: https://dash.cloudflare.com
2. Select: `ncskit.org`
3. Click: **DNS** → **Records**

**Should see:**
| Type  | Name | Target                                              | Proxy  |
|-------|------|-----------------------------------------------------|--------|
| CNAME | @    | bce1d1b0-1f68-4b83-a7d8-6aa36095346f.cfargotunnel.com | 🟠 Yes |
| CNAME | www  | bce1d1b0-1f68-4b83-a7d8-6aa36095346f.cfargotunnel.com | 🟠 Yes |

---

## 🔧 MONITORING

### View Docker Logs
```powershell
# All services
docker-compose -f docker-compose.production.yml logs -f

# Specific service
docker-compose -f docker-compose.production.yml logs -f frontend
docker-compose -f docker-compose.production.yml logs -f r-analytics
docker-compose -f docker-compose.production.yml logs -f postgres
```

### View Tunnel Logs
Tunnel logs will show in the terminal where you run the tunnel command.

### Check Service Health
```powershell
# Docker services
docker-compose -f docker-compose.production.yml ps

# Test frontend
curl http://localhost:3000

# Test R Analytics
curl http://localhost:8000/health
```

---

## 🛑 STOP SERVICES

### Stop Docker
```powershell
docker-compose -f docker-compose.production.yml down
```

### Stop Tunnel
Press `Ctrl+C` in the tunnel terminal

---

## 🔄 RESTART SERVICES

### Restart Docker
```powershell
docker-compose -f docker-compose.production.yml restart
```

### Restart Specific Service
```powershell
docker-compose -f docker-compose.production.yml restart frontend
```

---

## 📝 NEXT STEPS

1. ✅ Tunnel configured
2. ✅ DNS routes ready
3. ✅ Config file created
4. 🔄 Start Docker services
5. 🔄 Run migrations
6. 🔄 Start tunnel
7. 🔄 Test site

---

**Status:** ✅ Ready to Start!
**Command:** `docker-compose -f docker-compose.production.yml up -d`
**Time:** ~2 minutes to full deployment
