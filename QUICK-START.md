# ⚡ Quick Start - Cloudflare Tunnel for ncskit.org

## 🎯 Mục tiêu
Public app Next.js từ localhost lên domain **ncskit.org** qua Cloudflare Tunnel

---

## 📋 Các bước thực hiện (5 phút)

### 1️⃣ Download Cloudflared (30 giây)
```powershell
Invoke-WebRequest -Uri "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe" -OutFile "cloudflared.exe"
```

### 2️⃣ Login Cloudflare (1 phút)
```bash
.\cloudflared.exe tunnel login
```
→ Browser mở → Chọn **ncskit.org** → Authorize

### 3️⃣ Tạo Tunnel (30 giây)
```bash
.\cloudflared.exe tunnel create ncskit
```
→ **LƯU LẠI TUNNEL ID** (dạng: abc123-def456-...)

### 4️⃣ Config DNS (1 phút)
```bash
.\cloudflared.exe tunnel route dns ncskit ncskit.org
.\cloudflared.exe tunnel route dns ncskit www.ncskit.org
```

### 5️⃣ Tạo Config File (1 phút)

Tạo file `cloudflared-config.yml`:
```yaml
tunnel: <TUNNEL_ID_CỦA_BẠN>
credentials-file: C:\Users\<TÊN_USER>\.cloudflared\<TUNNEL_ID>.json

ingress:
  - hostname: ncskit.org
    service: http://localhost:3000
  - hostname: www.ncskit.org
    service: http://localhost:3000
  - service: http_status:404
```

**Thay thế:**
- `<TUNNEL_ID_CỦA_BẠN>` = Tunnel ID từ bước 3
- `<TÊN_USER>` = Username Windows của bạn

### 6️⃣ Start Everything (1 phút)

**Terminal 1 - Start Next.js:**
```bash
cd frontend
npm run dev
```

**Terminal 2 - Start Tunnel:**
```bash
.\cloudflared.exe tunnel --config cloudflared-config.yml run ncskit
```

### 7️⃣ Truy cập
🎉 Mở browser: **https://ncskit.org**

---

## 🔧 Hoặc dùng Script tự động

```powershell
# Chạy script setup (làm bước 2-5 tự động)
.\setup-tunnel.ps1

# Sau đó start
.\start-tunnel.ps1
```

---

## 📊 DNS Records (Tham khảo)

Sau khi chạy bước 4, Cloudflare tự động tạo:

| Type  | Name | Target                        | Proxy |
|-------|------|-------------------------------|-------|
| CNAME | @    | <TUNNEL_ID>.cfargotunnel.com | ✅    |
| CNAME | www  | <TUNNEL_ID>.cfargotunnel.com | ✅    |

Kiểm tra tại: **Cloudflare Dashboard → ncskit.org → DNS**

---

## 🚀 Production (Windows Service)

Sau khi test OK, cài đặt service:

```powershell
# Install
.\cloudflared.exe service install

# Start
sc start cloudflared

# Kiểm tra
sc query cloudflared
```

→ Tunnel sẽ tự động chạy khi Windows khởi động

---

## ❓ Troubleshooting

### Lỗi: "tunnel credentials file not found"
→ Sửa đường dẫn trong `cloudflared-config.yml`

### Lỗi: "connection refused"
→ Đảm bảo Next.js đang chạy: `cd frontend && npm run dev`

### DNS không resolve
→ Đợi 5-10 phút, sau đó: `ipconfig /flushdns`

### SSL error
→ Cloudflare Dashboard → SSL/TLS → Set "Full"

---

## 📞 Cần giúp?

1. Xem chi tiết: `CLOUDFLARE_TUNNEL_SETUP.md`
2. DNS config: `DNS-CONFIG-GUIDE.md`
3. Cloudflare Docs: https://developers.cloudflare.com/cloudflare-one/

---

## ✅ Checklist

- [ ] Download cloudflared.exe
- [ ] Login Cloudflare
- [ ] Create tunnel "ncskit"
- [ ] Route DNS
- [ ] Create config file
- [ ] Start Next.js (port 3000)
- [ ] Start tunnel
- [ ] Test https://ncskit.org
- [ ] Install as service (production)

---

**Thời gian ước tính: 5-10 phút**
**Khó khăn: ⭐⭐☆☆☆ (Dễ)**
