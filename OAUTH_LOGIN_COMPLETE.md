# ✅ Hoàn Thiện Login & OAuth - Hướng Dẫn

## 📋 Tổng Quan

Hệ thống authentication đã được hoàn thiện với các tính năng:

1. ✅ **Login bằng Email/Password** - `/auth/login`
2. ✅ **Đăng ký tài khoản mới** - `/auth/register`
3. ✅ **Login bằng Google OAuth** - Đã cấu hình
4. ✅ **Login bằng LinkedIn OAuth** - Đã cấu hình
5. ✅ **Login bằng ORCID OAuth** - Đã cấu hình

---

## 🔗 URLs

### Production (ncskit.org)
- **Login:** https://ncskit.org/auth/login
- **Register:** https://ncskit.org/auth/register
- **Google OAuth Callback:** https://ncskit.org/api/auth/callback/google
- **LinkedIn OAuth Callback:** https://ncskit.org/api/auth/callback/linkedin
- **ORCID OAuth Callback:** https://ncskit.org/api/auth/callback/orcid

### Development (localhost)
- **Login:** http://localhost:3000/auth/login
- **Register:** http://localhost:3000/auth/register
- **Google OAuth Callback:** http://localhost:3000/api/auth/callback/google
- **LinkedIn OAuth Callback:** http://localhost:3000/api/auth/callback/linkedin
- **ORCID OAuth Callback:** http://localhost:3000/api/auth/callback/orcid

---

## 🔧 Cấu Hình OAuth Providers

### 1. Google OAuth

**Google Cloud Console:** https://console.cloud.google.com/apis/credentials

**Authorized JavaScript origins:**
```
https://ncskit.org
https://www.ncskit.org
http://localhost:3000
```

**Authorized redirect URIs:**
```
https://ncskit.org/api/auth/callback/google
https://www.ncskit.org/api/auth/callback/google
http://localhost:3000/api/auth/callback/google
```

**Environment Variables:**
```env
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### 2. LinkedIn OAuth

**LinkedIn Developer Portal:** https://www.linkedin.com/developers/apps

**Authorized redirect URLs:**
```
https://ncskit.org/api/auth/callback/linkedin
https://www.ncskit.org/api/auth/callback/linkedin
http://localhost:3000/api/auth/callback/linkedin
```

**Environment Variables:**
```env
LINKEDIN_CLIENT_ID=your-linkedin-client-id
LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret
```

### 3. ORCID OAuth

**ORCID Developer Portal:** https://orcid.org/developer-tools

**Redirect URIs:**
```
https://ncskit.org/api/auth/callback/orcid
https://www.ncskit.org/api/auth/callback/orcid
http://localhost:3000/api/auth/callback/orcid
```

**Environment Variables:**
```env
ORCID_CLIENT_ID=your-orcid-client-id
ORCID_CLIENT_SECRET=your-orcid-client-secret
```

---

## 🎯 Cách Hoạt Động

### Email/Password Login

1. User nhập email và password
2. System kiểm tra credentials trong database
3. Nếu đúng → Tạo session → Redirect to dashboard
4. Nếu sai → Hiển thị lỗi

### OAuth Login (Google/LinkedIn/ORCID)

1. User click button OAuth (Google/LinkedIn/ORCID)
2. Redirect đến provider (Google/LinkedIn/ORCID)
3. User authorize
4. Provider redirect về callback URL với authorization code
5. NextAuth exchange code for access token
6. NextAuth lấy user info từ provider
7. **Tự động tạo user trong database** (nếu chưa có)
8. Tạo session
9. Redirect to dashboard

### Đăng Ký Tài Khoản Mới

1. User nhập thông tin (Họ tên, Email, Password, Xác nhận Password)
2. System validate form
3. Gọi API `/api/auth/register`
4. Tạo user trong database
5. **Tự động login** sau khi đăng ký thành công
6. Redirect to dashboard

---

## 📝 Environment Variables Cần Thiết

### Production (.env.production)

```env
# NextAuth
NEXTAUTH_URL=https://ncskit.org
NEXTAUTH_SECRET=your-production-secret

# App URL
NEXT_PUBLIC_APP_URL=https://ncskit.org

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# LinkedIn OAuth
LINKEDIN_CLIENT_ID=your-linkedin-client-id
LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret

# ORCID OAuth (optional)
ORCID_CLIENT_ID=your-orcid-client-id
ORCID_CLIENT_SECRET=your-orcid-client-secret

# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/ncskit_production
```

### Development (.env.local)

```env
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-dev-secret

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# OAuth (same as production)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
LINKEDIN_CLIENT_ID=your-linkedin-client-id
LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret

# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/ncskit_production
```

---

## ✅ Kiểm Tra

### 1. Test Login Email/Password

1. Vào https://ncskit.org/auth/login
2. Nhập email và password
3. Click "Đăng nhập"
4. Phải redirect về dashboard

### 2. Test Đăng Ký

1. Vào https://ncskit.org/auth/register
2. Điền form (Họ tên, Email, Password, Xác nhận Password)
3. Click "Đăng ký"
4. Phải tự động login và redirect về dashboard

### 3. Test Google OAuth

1. Vào https://ncskit.org/auth/login
2. Click button "Google"
3. Chọn Google account
4. Authorize
5. Phải redirect về dashboard

### 4. Test LinkedIn OAuth

1. Vào https://ncskit.org/auth/login
2. Click button "LinkedIn"
3. Chọn LinkedIn account
4. Authorize
5. Phải redirect về dashboard

---

## 🐛 Troubleshooting

### OAuth Callback về localhost thay vì ncskit.org

**Nguyên nhân:** `NEXTAUTH_URL` không được set đúng trong production

**Fix:**
1. Kiểm tra `.env.production` có `NEXTAUTH_URL=https://ncskit.org`
2. Restart production server
3. Rebuild production

### OAuth "invalid_client" error

**Nguyên nhân:** Client ID hoặc Secret sai

**Fix:**
1. Kiểm tra environment variables
2. Copy lại credentials từ provider console
3. Restart server

### OAuth "redirect_uri_mismatch"

**Nguyên nhân:** Redirect URI không khớp với cấu hình trong provider console

**Fix:**
1. Kiểm tra redirect URIs trong provider console
2. Đảm bảo có cả `https://ncskit.org` và `https://www.ncskit.org`
3. Đảm bảo không có trailing slash `/`

### User không được tạo sau OAuth login

**Nguyên nhân:** Lỗi trong `signIn` callback

**Fix:**
1. Kiểm tra database connection
2. Kiểm tra Prisma schema
3. Xem logs trong production server

---

## 📚 Files Quan Trọng

- **Login Page:** `frontend/src/app/auth/login/page.tsx`
- **Register Page:** `frontend/src/app/auth/register/page.tsx`
- **Auth Form:** `frontend/src/components/auth/auth-form.tsx`
- **Auth Store:** `frontend/src/store/auth.ts`
- **NextAuth Config:** `frontend/src/lib/auth.ts`
- **Register API:** `frontend/src/app/api/auth/register/route.ts`
- **NextAuth Route:** `frontend/src/app/api/auth/[...nextauth]/route.ts`

---

## 🎉 Kết Luận

Tất cả các tính năng authentication đã được hoàn thiện:

✅ Login bằng Email/Password
✅ Đăng ký tài khoản mới
✅ Login bằng Google OAuth
✅ Login bằng LinkedIn OAuth
✅ Login bằng ORCID OAuth
✅ Tự động tạo user khi OAuth login lần đầu
✅ Auto-login sau khi đăng ký
✅ Error handling và retry logic
✅ Responsive design

**Chỉ cần đảm bảo:**
1. Environment variables được set đúng
2. OAuth providers được cấu hình đúng redirect URIs
3. Database đang chạy và accessible

