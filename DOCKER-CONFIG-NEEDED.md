# 🔧 Docker Config - Bạn Cần Điền

## ✅ Đã Tự Động Config

- ✅ `POSTGRES_PASSWORD` - Đã set password mạnh
- ✅ `NEXTAUTH_SECRET` - Đã generate random 64 chars

## ⚠️ BẠN CẦN ĐIỀN (Quan Trọng!)

Mở file: `.env`

### 1. GEMINI_API_KEY (BẮT BUỘC nếu dùng AI)
```env
GEMINI_API_KEY=your-gemini-api-key-here
```

**Lấy từ:** https://makersuite.google.com/app/apikey

### 2. GOOGLE_CLIENT_ID & SECRET (TÙY CHỌN)
```env
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
```

**Lấy từ:** https://console.cloud.google.com/apis/credentials

**Nhớ thêm redirect URI:**
- http://localhost:3000/api/auth/callback/google
- https://ncskit.org/api/auth/callback/google

### 3. CLOUDFLARE_TUNNEL_TOKEN (TÙY CHỌN)
```env
CLOUDFLARE_TUNNEL_TOKEN=your-tunnel-token
```

**Lấy từ:** Cloudflare Dashboard → Zero Trust → Networks → Tunnels

**Hoặc:** Để trống và chạy tunnel riêng với `.\setup-tunnel.ps1`

---

## 🚀 Sau Khi Config Xong

```powershell
# Start Docker stack
.\docker-start.ps1
```

---

## 📝 Current Config Status

- ✅ POSTGRES_PASSWORD: Set
- ✅ NEXTAUTH_SECRET: Generated
- ⚠️ GEMINI_API_KEY: Cần điền
- ⚠️ GOOGLE_CLIENT_ID: Optional
- ⚠️ GOOGLE_CLIENT_SECRET: Optional
- ⚠️ CLOUDFLARE_TUNNEL_TOKEN: Optional

---

**File to edit:** `.env`
**Command:** `notepad .env`
