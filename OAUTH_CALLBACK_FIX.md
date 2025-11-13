# 🔧 Khắc Phục OAuth Callback về localhost - Hướng Dẫn Chi Tiết

## 🚨 Vấn Đề

Khi login bằng Google hoặc LinkedIn OAuth trên **ncskit.org**, callback URL đang redirect về:
```
http://localhost:3000/api/auth/callback/google
http://localhost:3000/api/auth/callback/linkedin
```

Thay vì:
```
https://ncskit.org/api/auth/callback/google
https://ncskit.org/api/auth/callback/linkedin
```

---

## ✅ Đã Thực Hiện

### 1. Cập Nhật Code

**File:** `frontend/src/lib/auth.ts`
- ✅ Callback `redirect()` ưu tiên `NEXTAUTH_URL` từ environment
- ✅ Function `getBaseUrl()` để detect base URL đúng

**File:** `frontend/src/app/api/auth/[...nextauth]/route.ts`
- ✅ Thêm logging để debug `NEXTAUTH_URL` trong production

**File:** `build-production.ps1`
- ✅ Đảm bảo load `.env.production` trước khi start server
- ✅ Set environment variables vào PowerShell session mới

### 2. Environment Variables

**File:** `frontend/.env.production`
```env
NEXTAUTH_URL=https://ncskit.org
NEXT_PUBLIC_APP_URL=https://ncskit.org
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
LINKEDIN_CLIENT_ID=your-linkedin-client-id
LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret
NEXTAUTH_SECRET=your-production-secret
```

---

## 🔍 Nguyên Nhân

Vấn đề xảy ra vì:

1. **NextAuth detect base URL từ request headers** - Khi chạy qua Cloudflare Tunnel, request có thể có `Host: localhost:3000` thay vì `Host: ncskit.org`
2. **Environment variables không được load đúng** - Production server có thể không load `.env.production` trước khi NextAuth khởi tạo
3. **NextAuth tạo OAuth URLs trước khi detect NEXTAUTH_URL** - OAuth authorization URLs được tạo từ request URL thay vì `NEXTAUTH_URL`

---

## 🛠️ Giải Pháp

### Bước 1: Đảm Bảo Environment Variables Được Set

**Kiểm tra `.env.production`:**
```powershell
cd frontend
Get-Content .env.production | Select-String "NEXTAUTH_URL"
```

**Phải có:**
```
NEXTAUTH_URL=https://ncskit.org
NEXT_PUBLIC_APP_URL=https://ncskit.org
```

### Bước 2: Rebuild và Restart Production Server

```powershell
cd D:\newNCSKITORG\newNCSkit\local_ncs
.\build-production.ps1
```

Script sẽ:
1. Load `.env.production` vào PowerShell session
2. Set `NODE_ENV=production`
3. Start Next.js server với environment variables đúng

### Bước 3: Kiểm Tra Logs

Sau khi start server, kiểm tra logs trong PowerShell window:
```
[NextAuth] NEXTAUTH_URL: https://ncskit.org
[NextAuth] NEXT_PUBLIC_APP_URL: https://ncskit.org
```

Nếu thấy `undefined` hoặc `http://localhost:3000`, có nghĩa là environment variables chưa được load đúng.

### Bước 4: Cập Nhật Google Cloud Console ⚠️ QUAN TRỌNG

**Vào:** https://console.cloud.google.com/apis/credentials

**Click vào OAuth 2.0 Client ID của bạn**

#### Authorized JavaScript origins:
```
https://ncskit.org
https://www.ncskit.org
http://localhost:3000  (cho development)
```

#### Authorized redirect URIs:
```
https://ncskit.org/api/auth/callback/google
https://www.ncskit.org/api/auth/callback/google
http://localhost:3000/api/auth/callback/google  (cho development)
```

**Click SAVE**

**⚠️ LƯU Ý:**
- Phải là `https://` (không phải `http://`)
- Không có trailing slash `/`
- Phải có cả `ncskit.org` và `www.ncskit.org`

### Bước 5: Cập Nhật LinkedIn Developer Portal ⚠️ QUAN TRỌNG

**Vào:** https://www.linkedin.com/developers/apps

**Chọn app của bạn → Auth tab**

#### Authorized redirect URLs:
```
https://ncskit.org/api/auth/callback/linkedin
https://www.ncskit.org/api/auth/callback/linkedin
http://localhost:3000/api/auth/callback/linkedin  (cho development)
```

**Click SAVE**

---

## 🧪 Test

### 1. Test Google OAuth

1. Vào https://ncskit.org/auth/login
2. Click "Login with Google"
3. **Kiểm tra URL trong browser address bar:**
   - Phải là: `https://accounts.google.com/...`
   - **KHÔNG được** có `redirect_uri=http://localhost:3000/...`
4. Sau khi authorize, callback phải về: `https://ncskit.org/api/auth/callback/google`

### 2. Test LinkedIn OAuth

1. Vào https://ncskit.org/auth/login
2. Click "Login with LinkedIn"
3. **Kiểm tra URL trong browser address bar:**
   - Phải là: `https://www.linkedin.com/oauth/...`
   - **KHÔNG được** có `redirect_uri=http://localhost:3000/...`
4. Sau khi authorize, callback phải về: `https://ncskit.org/api/auth/callback/linkedin`

---

## 🐛 Troubleshooting

### Vẫn redirect về localhost

**Nguyên nhân 1:** Environment variables không được load
- **Fix:** Kiểm tra `.env.production` có đúng không
- **Fix:** Restart production server sau khi sửa `.env.production`
- **Fix:** Kiểm tra logs xem `NEXTAUTH_URL` có được log không

**Nguyên nhân 2:** Google/LinkedIn Console chưa cập nhật redirect URIs
- **Fix:** Đảm bảo đã thêm `https://ncskit.org/api/auth/callback/google` vào Google Console
- **Fix:** Đảm bảo đã thêm `https://ncskit.org/api/auth/callback/linkedin` vào LinkedIn Developer Portal
- **Fix:** Đợi vài phút sau khi save (có thể có delay)

**Nguyên nhân 3:** Browser cache
- **Fix:** Clear browser cache (Ctrl+Shift+Delete)
- **Fix:** Thử incognito/private mode
- **Fix:** Thử browser khác

**Nguyên nhân 4:** Cloudflare Tunnel headers
- **Fix:** Kiểm tra Cloudflare Tunnel config có đúng không
- **Fix:** Đảm bảo `NEXTAUTH_URL` được set trong environment, không phụ thuộc vào request headers

### Error: "OAuthSignin"

**Nguyên nhân:** OAuth provider không nhận diện được redirect URI

**Fix:**
1. Kiểm tra redirect URI trong Google/LinkedIn Console có đúng không
2. Đảm bảo không có trailing slash `/`
3. Đảm bảo là `https://` (không phải `http://`)
4. Đảm bảo có cả `ncskit.org` và `www.ncskit.org` (nếu cần)

---

## 📝 Checklist

- [x] Code đã được cập nhật để ưu tiên `NEXTAUTH_URL`
- [x] `.env.production` có `NEXTAUTH_URL=https://ncskit.org`
- [x] `build-production.ps1` load `.env.production` trước khi start server
- [ ] **Google Cloud Console đã cập nhật redirect URIs** ⚠️
- [ ] **LinkedIn Developer Portal đã cập nhật redirect URIs** ⚠️
- [ ] Production server đã restart sau khi cập nhật
- [ ] Test Google OAuth - callback về `https://ncskit.org`
- [ ] Test LinkedIn OAuth - callback về `https://ncskit.org`

---

## 🎯 Kết Quả Mong Đợi

Sau khi fix:
- ✅ Login Google trên ncskit.org → Callback về `https://ncskit.org/api/auth/callback/google`
- ✅ Login LinkedIn trên ncskit.org → Callback về `https://ncskit.org/api/auth/callback/linkedin`
- ✅ OAuth flow hoạt động đúng trên production
- ✅ Không còn redirect về localhost

---

## ⚠️ Lưu Ý Quan Trọng

1. **Phải cập nhật Google/LinkedIn Console** - Đây là bước BẮT BUỘC, không thể bỏ qua
2. **Phải restart production server** sau khi sửa `.env.production`
3. **Đợi vài phút** sau khi update OAuth provider console (có thể có delay)
4. **Clear browser cache** để test lại

---

*Cập nhật: 2025-01-XX*

