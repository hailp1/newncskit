# ✅ Đã Thực Hiện - Khắc Phục Google OAuth Callback

## 🎯 Vấn Đề Đã Khắc Phục

**Lỗi:** Google OAuth callback redirect về `http://localhost:3000` thay vì `https://ncskit.org` khi ở production.

---

## ✅ Đã Thực Hiện

### 1. ✅ Cập Nhật Code (`frontend/src/lib/auth.ts`)

**Thêm function `getBaseUrl()`:**
```typescript
function getBaseUrl(): string {
  // In production, use NEXTAUTH_URL if set
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL
  }
  
  // Fallback to localhost for development
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
}
```

**Thêm callback `redirect()`:**
```typescript
async redirect({ url, baseUrl }) {
  const actualBaseUrl = getBaseUrl()
  
  if (url.startsWith('/')) {
    return `${actualBaseUrl}${url}`
  }
  
  // ... validation logic
  return actualBaseUrl
}
```

### 2. ✅ Cập Nhật Script `start-all-services.ps1`

**Tính năng mới:**
- ✅ Kill processes đang dùng ports: 3000, 5432, 8000, 6379
- ✅ Kill Node.js processes cũ
- ✅ Kill Cloudflared processes cũ
- ✅ Stop Docker containers cũ
- ✅ Kiểm tra tất cả services sau khi khởi động

### 3. ✅ Đã Chạy Script

Script `start-all-services.ps1` đang chạy trong background để:
- Giải phóng ports
- Khởi động PostgreSQL
- Khởi động Next.js
- Khởi động Cloudflare Tunnel

---

## 📋 Cần Làm Tiếp (QUAN TRỌNG!)

### ⚠️ BƯỚC 1: Cập Nhật Google Cloud Console (BẮT BUỘC)

**Vào:** https://console.cloud.google.com/apis/credentials

**Click vào OAuth 2.0 Client ID của bạn**

#### Authorized JavaScript origins:
```
https://ncskit.org
https://www.ncskit.org
http://localhost:3000
```

#### Authorized redirect URIs:
```
https://ncskit.org/api/auth/callback/google
https://www.ncskit.org/api/auth/callback/google
http://localhost:3000/api/auth/callback/google
```

**Click SAVE**

**⚠️ LƯU Ý:**
- Phải là `https://` (không phải `http://`)
- Không có trailing slash `/`
- Đợi 2-3 phút sau khi save (Google có thể có delay)

---

### ⚠️ BƯỚC 2: Kiểm Tra Environment Variables

Trong production environment (Cloudflare Tunnel/Vercel), đảm bảo có:

```env
NEXTAUTH_URL=https://ncskit.org
NEXT_PUBLIC_APP_URL=https://ncskit.org
```

**Kiểm tra:**
- Vào Cloudflare Dashboard → Workers/Pages → Environment Variables
- Hoặc trong `.env.production` nếu deploy local

---

### ⚠️ BƯỚC 3: Rebuild Next.js (Nếu Cần)

Nếu đã thay đổi code hoặc environment variables:

```powershell
cd frontend
npm run build
npm start
```

Hoặc nếu đang dev:
```powershell
# Dừng dev server (Ctrl+C trong cửa sổ Next.js)
# Restart
npm run dev
```

---

## 🧪 Test

### Test trên Production:

1. Vào: https://ncskit.org/auth/login
2. Click "Login with Google"
3. Kiểm tra:
   - ✅ Redirect đến `https://accounts.google.com/...`
   - ✅ Callback về `https://ncskit.org/api/auth/callback/google`
   - ❌ KHÔNG về `http://localhost:3000/...`

---

## 📊 Trạng Thái

- ✅ Code đã được cập nhật
- ✅ Script đã được cập nhật và đang chạy
- ⏳ Đang chờ: Cập nhật Google Cloud Console
- ⏳ Đang chờ: Kiểm tra environment variables

---

## 📝 Files Đã Tạo/Cập Nhật

1. ✅ `frontend/src/lib/auth.ts` - Đã cập nhật
2. ✅ `start-all-services.ps1` - Đã cập nhật với kill processes
3. ✅ `GOOGLE-OAUTH-PRODUCTION-FIX.md` - Hướng dẫn chi tiết
4. ✅ `FIX-GOOGLE-OAUTH-CALLBACK.md` - Tài liệu kỹ thuật

---

## 🎯 Kết Quả Mong Đợi

Sau khi hoàn tất các bước trên:
- ✅ OAuth callback sẽ về đúng domain production
- ✅ Login hoạt động đúng trên cả production và development
- ✅ Không còn lỗi redirect về localhost

---

*Hoàn tất: 2025-11-13*

