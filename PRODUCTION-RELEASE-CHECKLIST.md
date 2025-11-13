# 🚀 Production Release Checklist - ncskit.org

## ✅ Pre-Release Checklist

### 1. Code & Configuration

- [x] ✅ Code đã được cập nhật với `getBaseUrl()` và `redirect()` callback
- [x] ✅ LinkedIn OAuth provider đã được cấu hình
- [x] ✅ Google OAuth provider đã được cấu hình
- [ ] ⏳ Environment variables đã được set trong production
- [ ] ⏳ OAuth redirect URIs đã được cấu hình trong Google/LinkedIn consoles

### 2. OAuth Configuration

#### Google OAuth
- [ ] ⏳ **Google Cloud Console** đã được cập nhật:
  - [ ] Authorized JavaScript origins: `https://ncskit.org`, `https://www.ncskit.org`
  - [ ] Authorized redirect URIs: `https://ncskit.org/api/auth/callback/google`, `https://www.ncskit.org/api/auth/callback/google`

#### LinkedIn OAuth
- [ ] ⏳ **LinkedIn Developer Portal** đã được cập nhật:
  - [ ] Authorized Redirect URLs: `https://ncskit.org/api/auth/callback/linkedin`, `https://www.ncskit.org/api/auth/callback/linkedin`
  - [ ] Permissions: Sign In with LinkedIn using OpenID Connect

### 3. Environment Variables (Production)

Đảm bảo các biến sau được set trong production environment:

```env
# Base URLs
NEXTAUTH_URL=https://ncskit.org
NEXT_PUBLIC_APP_URL=https://ncskit.org
NODE_ENV=production

# NextAuth
NEXTAUTH_SECRET=<strong-production-secret>

# Google OAuth
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>

# LinkedIn OAuth
LINKEDIN_CLIENT_ID=<your-linkedin-client-id>
LINKEDIN_CLIENT_SECRET=<your-linkedin-client-secret>

# Database
DATABASE_URL=<production-database-url>

# Other
GEMINI_API_KEY=<your-gemini-key>
```

### 4. Services Status

- [x] ✅ PostgreSQL đang chạy (Port 5432)
- [x] ✅ Next.js đang chạy (Port 3000)
- [x] ✅ Cloudflare Tunnel đang chạy
- [ ] ⏳ DNS đã propagate (kiểm tra: `nslookup ncskit.org`)

### 5. Testing

- [ ] ⏳ Test Google OAuth trên production:
  - [ ] Vào https://ncskit.org/auth/login
  - [ ] Click "Login with Google"
  - [ ] Verify callback về `https://ncskit.org/api/auth/callback/google`
  - [ ] Verify login thành công

- [ ] ⏳ Test LinkedIn OAuth trên production:
  - [ ] Vào https://ncskit.org/auth/login
  - [ ] Click "Login with LinkedIn"
  - [ ] Verify callback về `https://ncskit.org/api/auth/callback/linkedin`
  - [ ] Verify login thành công

- [ ] ⏳ Test Email/Password login
- [ ] ⏳ Test session persistence
- [ ] ⏳ Test logout

---

## 🔧 Release Steps

### Step 1: Update OAuth Consoles

#### Google Cloud Console
1. Vào: https://console.cloud.google.com/apis/credentials
2. Click vào OAuth 2.0 Client ID
3. Thêm URLs (xem checklist trên)
4. Click **SAVE**

#### LinkedIn Developer Portal
1. Vào: https://www.linkedin.com/developers/apps
2. Chọn app của bạn
3. Vào tab **Auth**
4. Thêm Redirect URLs (xem checklist trên)
5. Click **Update**

### Step 2: Set Environment Variables

Nếu dùng Cloudflare Tunnel, set environment variables trong:
- Cloudflare Dashboard → Workers/Pages → Environment Variables
- Hoặc trong `.env.production` nếu deploy local

### Step 3: Rebuild & Deploy

```powershell
cd frontend
npm run build
npm start
```

Hoặc nếu dùng Docker:
```powershell
docker-compose -f docker-compose.production.yml up -d --build
```

### Step 4: Verify Services

```powershell
.\check-tunnel-status.ps1
```

### Step 5: Test OAuth Flows

1. Test Google: https://ncskit.org/auth/login → Click Google
2. Test LinkedIn: https://ncskit.org/auth/login → Click LinkedIn

---

## 📋 Post-Release Verification

### URLs to Test

- [ ] https://ncskit.org (Homepage)
- [ ] https://ncskit.org/auth/login (Login page)
- [ ] https://ncskit.org/api/auth/providers (Should return JSON)
- [ ] https://ncskit.org/api/auth/session (Should return JSON)

### OAuth Flows

- [ ] Google OAuth flow hoạt động
- [ ] LinkedIn OAuth flow hoạt động
- [ ] Callback URLs đúng domain (không về localhost)
- [ ] Session được tạo và persist
- [ ] Logout hoạt động

### Error Handling

- [ ] Kiểm tra browser console không có lỗi
- [ ] Kiểm tra Next.js logs không có lỗi
- [ ] Test với các edge cases (cancel OAuth, network error, etc.)

---

## 🎯 Success Criteria

✅ **Release thành công khi:**
- Tất cả OAuth providers hoạt động trên production
- Callback URLs về đúng domain (không về localhost)
- Session được tạo và persist đúng
- Không có lỗi trong console/logs
- Website accessible qua https://ncskit.org

---

*Tạo: 2025-11-13*

