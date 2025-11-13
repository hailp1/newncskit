# 🔧 Khắc Phục Google OAuth Callback về localhost trong Production

## 🚨 Vấn Đề

Khi login bằng Google OAuth trên **ncskit.org**, callback URL đang redirect về:
```
http://localhost:3000/api/auth/callback/google
```

Thay vì:
```
https://ncskit.org/api/auth/callback/google
```

---

## ✅ Giải Pháp Đã Áp Dụng

### 1. Cập Nhật `auth.ts` với Auto-Detect Base URL

Đã thêm function `getBaseUrl()` để:
- Ưu tiên sử dụng `NEXTAUTH_URL` từ environment
- Fallback về `NEXT_PUBLIC_APP_URL` hoặc localhost

### 2. Cập Nhật Redirect Callback

Đã thêm callback `redirect()` để đảm bảo:
- Redirect URLs luôn sử dụng đúng base URL
- Tự động detect từ environment variables

---

## 📋 Cần Kiểm Tra

### 1. Environment Variables trong Production

Đảm bảo các biến sau được set đúng:

```env
# Production (.env.production hoặc Vercel/Cloudflare environment)
NEXTAUTH_URL=https://ncskit.org
NEXT_PUBLIC_APP_URL=https://ncskit.org
```

**Lưu ý:** 
- Phải là `https://` (không phải `http://`)
- Không có trailing slash `/`

### 2. Google Cloud Console - OAuth Redirect URIs

Vào: https://console.cloud.google.com/apis/credentials

**Authorized JavaScript origins:**
```
https://ncskit.org
https://www.ncskit.org
http://localhost:3000  (cho development)
```

**Authorized redirect URIs:**
```
https://ncskit.org/api/auth/callback/google
https://www.ncskit.org/api/auth/callback/google
http://localhost:3000/api/auth/callback/google  (cho development)
```

**⚠️ QUAN TRỌNG:** 
- Phải có cả `ncskit.org` và `www.ncskit.org`
- Phải là `https://` (không phải `http://`)
- Không có trailing slash `/`

---

## 🔍 Kiểm Tra Cấu Hình

### Kiểm Tra Environment Variables

```powershell
# Trong production environment (Vercel/Cloudflare)
# Kiểm tra các biến sau:
NEXTAUTH_URL=https://ncskit.org
NEXT_PUBLIC_APP_URL=https://ncskit.org
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

### Test OAuth Flow

1. **Trên ncskit.org:**
   - Vào: https://ncskit.org/auth/login
   - Click "Login with Google"
   - Kiểm tra URL redirect trong browser
   - Phải là: `https://accounts.google.com/...`
   - Sau khi authorize, callback phải về: `https://ncskit.org/api/auth/callback/google`

2. **Kiểm Tra Logs:**
   - Xem Next.js logs trong production
   - Kiểm tra có lỗi gì không

---

## 🛠️ Nếu Vẫn Còn Lỗi

### 1. Clear Cache và Rebuild

```powershell
cd frontend
Remove-Item -Recurse -Force .next
npm run build
```

### 2. Kiểm Tra NextAuth Debug

Thêm vào `.env.production`:
```env
NEXTAUTH_DEBUG=true
```

### 3. Kiểm Tra Request Headers

Trong production, kiểm tra:
- `Host` header có đúng không
- `X-Forwarded-Host` có được set đúng không (nếu dùng proxy)

---

## 📝 Thay Đổi Code

### File: `frontend/src/lib/auth.ts`

1. ✅ Thêm function `getBaseUrl()`
2. ✅ Thêm callback `redirect()` để handle redirect URLs
3. ✅ Đảm bảo sử dụng đúng base URL từ environment

---

## 🎯 Kết Quả Mong Đợi

Sau khi fix:
- ✅ Login trên ncskit.org → Callback về `https://ncskit.org/api/auth/callback/google`
- ✅ Login trên localhost → Callback về `http://localhost:3000/api/auth/callback/google`
- ✅ OAuth flow hoạt động đúng trên cả 2 môi trường

---

## ⚠️ Lưu Ý

1. **Phải restart Next.js** sau khi thay đổi environment variables
2. **Phải rebuild** nếu thay đổi code
3. **Kiểm tra Google Console** đã thêm đúng redirect URIs chưa
4. **Đợi vài phút** sau khi update Google Console (có thể có delay)

---

*Cập nhật: 2025-11-13*

