# 🌐 Cloudflare Tunnel Setup - Sẵn Sàng!

## ✅ TRẠNG THÁI HIỆN TẠI

### Docker Build
- ✅ **HOÀN TẤT!** 
- ✅ Frontend image: Built
- ✅ R Analytics image: Built
- ✅ PostgreSQL: Ready (official image)

### Cloudflared
- ✅ **Downloaded!** (version 2025.11.1)
- ✅ File: `cloudflared.exe`
- ✅ Ready to setup tunnel

---

## 🚀 SETUP CLOUDFLARE TUNNEL

### Bước 1: Login Cloudflare

```powershell
.\cloudflared.exe tunnel login
```

**Sẽ xảy ra:**
1. Browser sẽ tự động mở
2. Đăng nhập Cloudflare account của bạn
3. **Chọn domain: `ncskit.org`**
4. Click **"Authorize"**

**Link để verify domain:**
- Cloudflare Dashboard: https://dash.cloudflare.com
- Chọn domain: `ncskit.org`
- Verify domain ownership nếu chưa

---

### Bước 2: Create Tunnel

```powershell
.\cloudflared.exe tunnel create ncskit
```

**Output sẽ có:**
```
Created tunnel ncskit with id: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

**⚠️ LƯU LẠI TUNNEL ID!** (Cần cho bước sau)

---

### Bước 3: Create Config File

Tôi sẽ tạo file `cloudflared-config.yml` sau khi bạn có Tunnel ID.

**Template:**
```yaml
tunnel: <TUNNEL_ID>
credentials-file: C:\Users\<YOUR_USERNAME>\.cloudflared\<TUNNEL_ID>.json

ingress:
  - hostname: ncskit.org
    service: http://localhost:3000
  
  - hostname: www.ncskit.org
    service: http://localhost:3000
  
  - service: http_status:404
```

---

### Bước 4: Route DNS

```powershell
.\cloudflared.exe tunnel route dns ncskit ncskit.org
.\cloudflared.exe tunnel route dns ncskit www.ncskit.org
```

**Sẽ tạo DNS records:**
- `ncskit.org` → `<TUNNEL_ID>.cfargotunnel.com`
- `www.ncskit.org` → `<TUNNEL_ID>.cfargotunnel.com`

---

### Bước 5: Verify DNS

**Vào Cloudflare Dashboard:**
1. Go to: https://dash.cloudflare.com
2. Select: `ncskit.org`
3. Click: **DNS** → **Records**

**Kiểm tra có 2 CNAME records:**

| Type  | Name | Target                           | Proxy  |
|-------|------|----------------------------------|--------|
| CNAME | @    | `<TUNNEL_ID>.cfargotunnel.com`  | 🟠 Yes |
| CNAME | www  | `<TUNNEL_ID>.cfargotunnel.com`  | 🟠 Yes |

---

## 🔗 LINKS QUAN TRỌNG

### 1. Cloudflare Dashboard
https://dash.cloudflare.com

### 2. Domain Management (ncskit.org)
https://dash.cloudflare.com/[YOUR_ACCOUNT_ID]/ncskit.org

### 3. DNS Records
https://dash.cloudflare.com/[YOUR_ACCOUNT_ID]/ncskit.org/dns

### 4. Tunnel Management
https://dash.cloudflare.com/[YOUR_ACCOUNT_ID]/zero-trust/networks/tunnels

### 5. Verify Domain Ownership
https://dash.cloudflare.com/[YOUR_ACCOUNT_ID]/ncskit.org/overview

---

## 📝 THÔNG TIN CẦN CUNG CẤP

### Để Verify Domain:

**Option A: DNS Verification**
- Add TXT record do Cloudflare cung cấp
- Wait 5-10 phút

**Option B: HTTP Verification**
- Upload file lên server
- Cloudflare sẽ verify

**Option C: Email Verification**
- Cloudflare gửi email đến admin@ncskit.org
- Click link verify

---

## 🎯 SAU KHI SETUP XONG

### 1. Start Docker Services
```powershell
docker-compose -f docker-compose.production.yml up -d
```

### 2. Run Migrations
```powershell
docker-compose -f docker-compose.production.yml exec frontend npx prisma migrate deploy
```

### 3. Start Tunnel
```powershell
.\cloudflared.exe tunnel --config cloudflared-config.yml run ncskit
```

### 4. Access Site
- Local: http://localhost:3000
- Public: https://ncskit.org

---

## 🚀 QUICK START (Copy & Paste)

```powershell
# 1. Login
.\cloudflared.exe tunnel login

# 2. Create tunnel
.\cloudflared.exe tunnel create ncskit

# 3. Route DNS
.\cloudflared.exe tunnel route dns ncskit ncskit.org
.\cloudflared.exe tunnel route dns ncskit www.ncskit.org

# 4. Start Docker
docker-compose -f docker-compose.production.yml up -d

# 5. Migrate
docker-compose -f docker-compose.production.yml exec frontend npx prisma migrate deploy

# 6. Start tunnel (new terminal)
.\cloudflared.exe tunnel --config cloudflared-config.yml run ncskit
```

---

## ❓ CẦN GIÚP?

### Domain chưa verify?
→ Vào: https://dash.cloudflare.com → Select domain → Follow verification steps

### Không có quyền truy cập domain?
→ Cần add domain vào Cloudflare account trước

### Tunnel không connect?
→ Check firewall, ensure port 3000 is open

---

**Status:** ✅ Ready to Setup!
**Next Step:** Run `.\cloudflared.exe tunnel login`
**Time:** ~5 phút
