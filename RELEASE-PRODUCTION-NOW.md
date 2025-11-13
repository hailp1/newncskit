# 🚀 Release Production - Hướng Dẫn Thực Hiện

## ✅ Đã Kiểm Tra

### Code Configuration
- ✅ **Google OAuth:** Đã cấu hình với auto-detect base URL
- ✅ **LinkedIn OAuth:** Đã cấu hình với auto-detect base URL
- ✅ **Redirect Callback:** Tự động sử dụng `NEXTAUTH_URL` từ environment
- ✅ **getBaseUrl():** Tự động detect base URL cho production

### Services
- ✅ PostgreSQL: Đang chạy (Port 5432)
- ✅ Next.js: Đang chạy (Port 3000)
- ✅ Cloudflare Tunnel: Đang chạy

---

## 📋 Các Bước Release Production

### ⚠️ BƯỚC 1: Cập Nhật Google Cloud Console (5 phút)

**URL:** https://console.cloud.google.com/apis/credentials

1. Click vào **OAuth 2.0 Client ID** của bạn
2. Scroll xuống phần **Authorized JavaScript origins**
3. Thêm:
   ```
   https://ncskit.org
   https://www.ncskit.org
   ```
   (Giữ lại `http://localhost:3000` nếu có)

4. Scroll xuống phần **Authorized redirect URIs**
5. Thêm:
   ```
   https://ncskit.org/api/auth/callback/google
   https://www.ncskit.org/api/auth/callback/google
   ```
   (Giữ lại `http://localhost:3000/api/auth/callback/google` nếu có)

6. Click **SAVE**
7. Đợi 2-3 phút để Google cập nhật

---

### ⚠️ BƯỚC 2: Cập Nhật LinkedIn Developer Portal (5 phút)

**URL:** https://www.linkedin.com/developers/apps

1. Chọn app **NCSKIT** của bạn (hoặc tạo mới nếu chưa có)
2. Vào tab **Auth**
3. Scroll xuống phần **Authorized Redirect URLs**
4. Thêm:
   ```
   https://ncskit.org/api/auth/callback/linkedin
   https://www.ncskit.org/api/auth/callback/linkedin
   ```
   (Giữ lại `http://localhost:3000/api/auth/callback/linkedin` nếu có)

5. Đảm bảo có permissions:
   - ✅ Sign In with LinkedIn using OpenID Connect
   - ✅ r_emailaddress
   - ✅ profile (hoặc r_liteprofile)

6. Click **Update**
7. Đợi 2-3 phút để LinkedIn cập nhật

---

### ⚠️ BƯỚC 3: Kiểm Tra Environment Variables (2 phút)

Trong production environment (Cloudflare Tunnel/Vercel), đảm bảo có:

```env
# Base URLs
NEXTAUTH_URL=https://ncskit.org
NEXT_PUBLIC_APP_URL=https://ncskit.org
NODE_ENV=production

# NextAuth
NEXTAUTH_SECRET=<strong-secret-min-32-chars>

# Google OAuth
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>

# LinkedIn OAuth
LINKEDIN_CLIENT_ID=<your-linkedin-client-id>
LINKEDIN_CLIENT_SECRET=<your-linkedin-client-secret>
```

**Nếu dùng Cloudflare Tunnel:**
- Environment variables được set trong Cloudflare Dashboard
- Hoặc trong file `.env.production` nếu chạy local

---

### ⚠️ BƯỚC 4: Rebuild Next.js (Nếu Cần) (3 phút)

Nếu đã thay đổi code hoặc environment variables:

```powershell
cd frontend
npm run build
npm start
```

Hoặc nếu đang dev:
```powershell
# Dừng dev server (Ctrl+C)
# Restart
npm run dev
```

---

### ⚠️ BƯỚC 5: Test OAuth Flows (5 phút)

#### Test Google OAuth:
1. Vào: **https://ncskit.org/auth/login**
2. Click **"Login with Google"**
3. Kiểm tra:
   - ✅ Redirect đến `https://accounts.google.com/...`
   - ✅ Sau khi authorize, callback về `https://ncskit.org/api/auth/callback/google`
   - ✅ **KHÔNG** về `http://localhost:3000/...`
   - ✅ Login thành công và redirect về dashboard

#### Test LinkedIn OAuth:
1. Vào: **https://ncskit.org/auth/login**
2. Click **"Login with LinkedIn"**
3. Kiểm tra:
   - ✅ Redirect đến LinkedIn login page
   - ✅ Sau khi authorize, callback về `https://ncskit.org/api/auth/callback/linkedin`
   - ✅ **KHÔNG** về `http://localhost:3000/...`
   - ✅ Login thành công và redirect về dashboard

---

## ✅ Checklist Hoàn Tất

- [ ] Google Cloud Console đã được cập nhật
- [ ] LinkedIn Developer Portal đã được cập nhật
- [ ] Environment variables đã được set trong production
- [ ] Next.js đã được rebuild (nếu cần)
- [ ] Google OAuth flow đã được test và hoạt động
- [ ] LinkedIn OAuth flow đã được test và hoạt động
- [ ] Callback URLs về đúng domain (không về localhost)

---

## 🎯 Kết Quả Mong Đợi

Sau khi hoàn tất tất cả các bước:

✅ **Google OAuth:**
- Login trên ncskit.org → Callback về `https://ncskit.org/api/auth/callback/google`
- Login trên localhost → Callback về `http://localhost:3000/api/auth/callback/google`

✅ **LinkedIn OAuth:**
- Login trên ncskit.org → Callback về `https://ncskit.org/api/auth/callback/linkedin`
- Login trên localhost → Callback về `http://localhost:3000/api/auth/callback/linkedin`

✅ **Website Production:**
- Accessible qua https://ncskit.org
- Tất cả OAuth providers hoạt động
- Session được tạo và persist đúng
- Không có lỗi trong console/logs

---

## 📞 Nếu Có Vấn Đề

### Lỗi "redirect_uri_mismatch"
- Kiểm tra redirect URIs trong Google/LinkedIn console
- Đảm bảo URL chính xác (không có typo, không có trailing slash)

### Callback vẫn về localhost
- Kiểm tra `NEXTAUTH_URL` trong production environment
- Phải là `https://ncskit.org` (không phải `http://localhost:3000`)
- Restart Next.js sau khi thay đổi environment variables

### OAuth không hoạt động
- Kiểm tra browser console (F12) xem có lỗi gì
- Kiểm tra Next.js logs
- Verify environment variables đã được set đúng

---

## 📝 Files Tham Khảo

- `PRODUCTION-RELEASE-CHECKLIST.md` - Checklist chi tiết
- `LINKEDIN-OAUTH-PRODUCTION-FIX.md` - Hướng dẫn LinkedIn OAuth
- `GOOGLE-OAUTH-PRODUCTION-FIX.md` - Hướng dẫn Google OAuth
- `FIX-GOOGLE-OAUTH-CALLBACK.md` - Technical details

---

**🎉 Chúc mừng! Sau khi hoàn tất các bước trên, website sẽ sẵn sàng cho production!**

*Tạo: 2025-11-13*

