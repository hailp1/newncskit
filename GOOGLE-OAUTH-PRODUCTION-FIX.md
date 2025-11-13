# ✅ Khắc Phục Google OAuth Callback - Đã Thực Hiện

## 🎯 Vấn Đề

Khi login bằng Google OAuth trên **ncskit.org**, callback URL đang redirect về:
```
http://localhost:3000/api/auth/callback/google
```

Thay vì:
```
https://ncskit.org/api/auth/callback/google
```

---

## ✅ Đã Thực Hiện

### 1. ✅ Cập Nhật Code (`frontend/src/lib/auth.ts`)

- ✅ Thêm function `getBaseUrl()` để tự động detect base URL
- ✅ Thêm callback `redirect()` để đảm bảo redirect URLs đúng domain
- ✅ Ưu tiên sử dụng `NEXTAUTH_URL` từ environment

### 2. ✅ Kiểm Tra Environment Variables

File `.env.production` đã có:
```
NEXTAUTH_URL=https://ncskit.org
```

---

## 📋 Cần Làm Tiếp (QUAN TRỌNG!)

### 1. Cập Nhật Google Cloud Console ⚠️ BẮT BUỘC

**Vào:** https://console.cloud.google.com/apis/credentials

**Click vào OAuth 2.0 Client ID của bạn**

#### Authorized JavaScript origins:
Thêm các URLs sau:
```
https://ncskit.org
https://www.ncskit.org
http://localhost:3000  (giữ lại cho development)
```

#### Authorized redirect URIs:
Thêm các URLs sau:
```
https://ncskit.org/api/auth/callback/google
https://www.ncskit.org/api/auth/callback/google
http://localhost:3000/api/auth/callback/google  (giữ lại cho development)
```

**Click SAVE**

**⚠️ LƯU Ý:**
- Phải là `https://` (không phải `http://`)
- Không có trailing slash `/`
- Phải có cả `ncskit.org` và `www.ncskit.org`

---

### 2. Đảm Bảo Environment Variables Trong Production

Nếu deploy qua Cloudflare Tunnel, đảm bảo trong production environment có:

```env
NEXTAUTH_URL=https://ncskit.org
NEXT_PUBLIC_APP_URL=https://ncskit.org
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
NEXTAUTH_SECRET=your-production-secret
```

---

### 3. Rebuild và Restart Next.js

Sau khi cập nhật Google Console và environment variables:

```powershell
cd frontend
npm run build
npm start
```

Hoặc nếu đang chạy dev:
```powershell
# Dừng dev server (Ctrl+C)
# Restart
npm run dev
```

---

## 🧪 Test OAuth Flow

### Test trên Production (ncskit.org):

1. Vào: https://ncskit.org/auth/login
2. Click "Login with Google"
3. Kiểm tra URL trong browser:
   - **Phải redirect đến:** `https://accounts.google.com/...`
   - **Sau khi authorize, callback phải về:** `https://ncskit.org/api/auth/callback/google`
   - **KHÔNG được về:** `http://localhost:3000/...`

### Test trên Development (localhost):

1. Vào: http://localhost:3000/auth/login
2. Click "Login with Google"
3. Phải hoạt động bình thường với localhost

---

## 🔍 Kiểm Tra Logs

Nếu vẫn còn lỗi, kiểm tra:

1. **Next.js logs** trong terminal
2. **Browser Console** (F12) - xem có lỗi gì không
3. **Network tab** - xem request/response của OAuth flow

---

## 📝 Checklist

- [x] Code đã được cập nhật với `getBaseUrl()` và `redirect()` callback
- [x] `.env.production` đã có `NEXTAUTH_URL=https://ncskit.org`
- [ ] **Google Cloud Console đã được cập nhật với production URLs**
- [ ] **Environment variables trong production đã được set đúng**
- [ ] **Next.js đã được rebuild và restart**
- [ ] **Đã test OAuth flow trên ncskit.org**

---

## 🚨 Nếu Vẫn Còn Lỗi

### Kiểm Tra NEXTAUTH_URL

```powershell
# Trong production, kiểm tra environment variable
# Phải là: NEXTAUTH_URL=https://ncskit.org
# KHÔNG được là: NEXTAUTH_URL=http://localhost:3000
```

### Kiểm Tra Google Console

- Đảm bảo đã click **SAVE** sau khi thêm URLs
- Đợi 2-3 phút để Google cập nhật (có thể có delay)
- Kiểm tra lại URLs không có typo

### Clear Cache

```powershell
cd frontend
Remove-Item -Recurse -Force .next
npm run build
```

---

## ✅ Kết Quả Mong Đợi

Sau khi hoàn tất:
- ✅ Login trên ncskit.org → Callback về `https://ncskit.org/api/auth/callback/google`
- ✅ Login trên localhost → Callback về `http://localhost:3000/api/auth/callback/google`
- ✅ OAuth flow hoạt động đúng trên cả 2 môi trường

---

*Cập nhật: 2025-11-13*

