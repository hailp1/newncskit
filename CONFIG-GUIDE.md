# 🔧 Configuration Guide - Bạn Cần Config Những Gì

## ✅ Đã Chuẩn Bị Sẵn

- ✅ Build production thành công
- ✅ Scripts deploy đã sẵn sàng
- ✅ File `.env.production` đã tạo
- ✅ Cloudflare Tunnel scripts đã sẵn sàng

---

## 📝 BẠN CẦN CONFIG 3 VIỆC

### 1️⃣ **Cập Nhật Environment Variables** (BẮT BUỘC)

Mở file: `frontend/.env.production`

**Cần thay đổi:**

```env
# 1. Database Production (BẮT BUỘC)
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@YOUR_HOST:5432/ncskit_production
# ↑ Thay YOUR_PASSWORD và YOUR_HOST bằng thông tin database production của bạn

# 2. NextAuth Secret (BẮT BUỘC - Generate mới)
NEXTAUTH_SECRET=CHANGE_THIS_TO_A_SECURE_RANDOM_STRING_IN_PRODUCTION
# ↑ Generate bằng lệnh: openssl rand -base64 32
# Hoặc dùng: https://generate-secret.vercel.app/32

# 3. Gemini API Key (BẮT BUỘC nếu dùng AI features)
GEMINI_API_KEY=your-production-gemini-api-key-here
# ↑ Lấy từ: https://makersuite.google.com/app/apikey

# 4. Google OAuth (TÙY CHỌN - nếu dùng Google login)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
# ↑ Lấy từ: https://console.cloud.google.com/apis/credentials
# Nhớ thêm redirect URI: https://ncskit.org/api/auth/callback/google
```

**Các giá trị khác đã OK, không cần đổi:**
- ✅ `NEXTAUTH_URL=https://ncskit.org`
- ✅ `NEXT_PUBLIC_APP_URL=https://ncskit.org`
- ✅ `NODE_ENV=production`

---

### 2️⃣ **Setup Cloudflare Tunnel** (LẦN ĐẦU)

**Nếu chưa có tunnel, chạy:**

```powershell
# Chạy script tự động
.\setup-tunnel.ps1
```

Script sẽ hỏi bạn từng bước:
1. Login Cloudflare (browser sẽ mở)
2. Chọn domain `ncskit.org`
3. Tạo tunnel tên `ncskit`
4. Tự động tạo config file
5. Route DNS

**Hoặc thủ công:**

```powershell
# 1. Download cloudflared (nếu chưa có)
Invoke-WebRequest -Uri "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe" -OutFile "cloudflared.exe"

# 2. Login
.\cloudflared.exe tunnel login

# 3. Create tunnel
.\cloudflared.exe tunnel create ncskit

# 4. Route DNS
.\cloudflared.exe tunnel route dns ncskit ncskit.org
.\cloudflared.exe tunnel route dns ncskit www.ncskit.org
```

---

### 3️⃣ **Verify DNS trong Cloudflare Dashboard** (QUAN TRỌNG)

1. Đăng nhập: https://dash.cloudflare.com
2. Chọn domain: `ncskit.org`
3. Vào: **DNS** → **Records**
4. Kiểm tra có 2 CNAME records:

| Type  | Name | Target                                    | Proxy  |
|-------|------|-------------------------------------------|--------|
| CNAME | @    | `<TUNNEL_ID>.cfargotunnel.com`           | 🟠 Yes |
| CNAME | www  | `<TUNNEL_ID>.cfargotunnel.com`           | 🟠 Yes |

**Lưu ý:** 
- Proxy status phải là **Proxied** (🟠 Orange cloud)
- `<TUNNEL_ID>` sẽ tự động điền sau khi chạy setup-tunnel.ps1

---

## 🚀 SAU KHI CONFIG XONG

### Deploy Production:

```powershell
# Chạy PowerShell as Administrator
.\deploy-production.ps1 -ServiceMode
```

Script sẽ tự động:
1. ✅ Build production
2. ✅ Run database migrations
3. ✅ Start Next.js với PM2
4. ✅ Start Cloudflare Tunnel as Windows Service
5. ✅ Site live tại https://ncskit.org

---

## 📊 Monitoring

```powershell
# Check status
pm2 status
sc query cloudflared

# View logs
pm2 logs ncskit-prod
```

---

## 🛑 Stop Services

```powershell
pm2 stop ncskit-prod
sc stop cloudflared
```

---

## ❓ Troubleshooting

### Lỗi: "Database connection failed"
→ Kiểm tra `DATABASE_URL` trong `.env.production`

### Lỗi: "NEXTAUTH_SECRET is not set"
→ Generate và set `NEXTAUTH_SECRET`

### Lỗi: "Tunnel not connecting"
→ Chạy lại: `.\setup-tunnel.ps1`

### Site không truy cập được
→ Đợi 5-10 phút để DNS propagate
→ Check: `nslookup ncskit.org`

---

## 📞 Cần Giúp?

Xem chi tiết trong:
- `PRODUCTION-DEPLOYMENT-CHECKLIST.md` - Checklist đầy đủ
- `DNS-CONFIG-GUIDE.md` - Hướng dẫn DNS
- `CLOUDFLARE_TUNNEL_SETUP.md` - Hướng dẫn Tunnel

---

## ⚡ TÓM TẮT - 3 BƯỚC

1. **Config `.env.production`** (5 phút)
   - Database URL
   - NEXTAUTH_SECRET
   - GEMINI_API_KEY

2. **Setup Tunnel** (5 phút)
   ```powershell
   .\setup-tunnel.ps1
   ```

3. **Deploy** (2 phút)
   ```powershell
   .\deploy-production.ps1 -ServiceMode
   ```

**DONE! 🎉** Site live tại https://ncskit.org
