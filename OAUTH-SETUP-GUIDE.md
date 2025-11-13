# OAuth Setup Guide - Google, LinkedIn, ORCID

## Tổng Quan

Hệ thống authentication hiện hỗ trợ 4 phương thức:
1. ✅ **Email/Password** (Credentials) - Đã hoạt động
2. 🔧 **Google OAuth** - Cần setup
3. 🔧 **LinkedIn OAuth** - Cần setup
4. 🔧 **ORCID OAuth** - Cần setup

---

## 1. GOOGLE OAUTH SETUP

### Bước 1: Tạo OAuth Credentials

1. Vào **Google Cloud Console**: https://console.cloud.google.com/apis/credentials
2. Chọn project hoặc tạo project mới
3. Click **"Create Credentials"** → **"OAuth 2.0 Client ID"**
4. Chọn **"Web application"**

### Bước 2: Cấu Hình URLs

**Authorized JavaScript origins:**
```
https://ncskit.org
https://app.ncskit.org
http://localhost:3000
```

**Authorized redirect URIs:**
```
https://ncskit.org/api/auth/callback/google
https://app.ncskit.org/api/auth/callback/google
http://localhost:3000/api/auth/callback/google
```

### Bước 3: Lấy Credentials

Sau khi tạo, copy:
- **Client ID**
- **Client Secret**

### Bước 4: Cập Nhật .env.local

```env
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
```

---

## 2. LINKEDIN OAUTH SETUP

### Bước 1: Tạo LinkedIn App

1. Vào **LinkedIn Developers**: https://www.linkedin.com/developers/apps
2. Click **"Create app"**
3. Điền thông tin:
   - **App name**: NCSKit
   - **LinkedIn Page**: Chọn company page (hoặc tạo mới)
   - **App logo**: Upload logo
   - **Legal agreement**: Check box

### Bước 2: Cấu Hình OAuth Settings

1. Vào tab **"Auth"**
2. Thêm **Redirect URLs**:
```
https://ncskit.org/api/auth/callback/linkedin
https://app.ncskit.org/api/auth/callback/linkedin
http://localhost:3000/api/auth/callback/linkedin
```

### Bước 3: Request Permissions

Trong tab **"Products"**, request:
- ✅ **Sign In with LinkedIn using OpenID Connect**

Đợi LinkedIn approve (thường instant cho Sign In)

### Bước 4: Lấy Credentials

Trong tab **"Auth"**:
- **Client ID**
- **Client Secret** (click "Show" để xem)

### Bước 5: Cập Nhật .env.local

```env
LINKEDIN_CLIENT_ID=your_linkedin_client_id_here
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret_here
```

---

## 3. ORCID OAUTH SETUP

### Bước 1: Đăng Ký ORCID Developer Account

1. Vào **ORCID Developer Tools**: https://orcid.org/developer-tools
2. Đăng nhập với ORCID account (hoặc tạo mới)
3. Click **"Register for the free ORCID public API"**

### Bước 2: Tạo OAuth Application

1. Điền thông tin:
   - **Application name**: NCSKit
   - **Application website**: https://ncskit.org
   - **Description**: Research collaboration platform
   - **Redirect URIs**:
```
https://ncskit.org/api/auth/callback/orcid
https://app.ncskit.org/api/auth/callback/orcid
http://localhost:3000/api/auth/callback/orcid
```

### Bước 3: Chọn API

- ✅ **Public API** (free, cho authentication)
- Hoặc **Member API** (nếu tổ chức là ORCID member)

### Bước 4: Lấy Credentials

Sau khi đăng ký, bạn sẽ nhận:
- **Client ID**
- **Client Secret**

### Bước 5: Cập Nhật .env.local

```env
ORCID_CLIENT_ID=your_orcid_client_id_here
ORCID_CLIENT_SECRET=your_orcid_client_secret_here
```

---

## KIỂM TRA CẤU HÌNH

### File .env.local Hoàn Chỉnh

```env
# NextAuth
NEXTAUTH_URL=https://ncskit.org
NEXTAUTH_SECRET=your_nextauth_secret_here

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# LinkedIn OAuth
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret

# ORCID OAuth
ORCID_CLIENT_ID=your_orcid_client_id
ORCID_CLIENT_SECRET=your_orcid_client_secret
```

### Test Từng Provider

**Development (localhost:3000):**
```env
NEXTAUTH_URL=http://localhost:3000
```

**Production (ncskit.org):**
```env
NEXTAUTH_URL=https://ncskit.org
```

---

## REDIRECT URLS SUMMARY

### Google Console
```
JavaScript Origins:
- https://ncskit.org
- https://app.ncskit.org
- http://localhost:3000

Redirect URIs:
- https://ncskit.org/api/auth/callback/google
- https://app.ncskit.org/api/auth/callback/google
- http://localhost:3000/api/auth/callback/google
```

### LinkedIn App
```
Redirect URLs:
- https://ncskit.org/api/auth/callback/linkedin
- https://app.ncskit.org/api/auth/callback/linkedin
- http://localhost:3000/api/auth/callback/linkedin
```

### ORCID Application
```
Redirect URIs:
- https://ncskit.org/api/auth/callback/orcid
- https://app.ncskit.org/api/auth/callback/orcid
- http://localhost:3000/api/auth/callback/orcid
```

---

## TEST AUTHENTICATION

### 1. Start Dev Server
```powershell
cd frontend
npm run dev
```

### 2. Test Login Page
Mở: http://localhost:3000/auth/login

Bạn sẽ thấy 4 options:
- 📧 Email/Password
- 🔵 Sign in with Google
- 💼 Sign in with LinkedIn
- 🎓 Sign in with ORCID

### 3. Test Từng Provider

**Email/Password:**
- Nhập email và password
- Click "Sign In"

**Google:**
- Click "Sign in with Google"
- Chọn Google account
- Authorize app
- Redirect về app

**LinkedIn:**
- Click "Sign in with LinkedIn"
- Đăng nhập LinkedIn
- Authorize app
- Redirect về app

**ORCID:**
- Click "Sign in with ORCID"
- Đăng nhập ORCID
- Authorize app
- Redirect về app

---

## TROUBLESHOOTING

### Lỗi "Redirect URI mismatch"
→ Kiểm tra redirect URIs trong OAuth console khớp với NEXTAUTH_URL

### Lỗi "Invalid client"
→ Kiểm tra CLIENT_ID và CLIENT_SECRET đã điền đúng

### Lỗi "Access denied"
→ Kiểm tra permissions/scopes đã được approve

### User không tạo trong database
→ Kiểm tra database connection
→ Xem logs trong terminal

---

## SECURITY NOTES

### Production
- ✅ Dùng HTTPS (https://ncskit.org)
- ✅ Giữ CLIENT_SECRET bí mật
- ✅ Không commit .env.local vào git
- ✅ Dùng strong NEXTAUTH_SECRET

### Development
- ✅ Có thể dùng HTTP (http://localhost:3000)
- ✅ Dùng separate OAuth apps cho dev/prod
- ✅ Test trên localhost trước khi deploy

---

## NEXT STEPS

1. ✅ Setup database (PostgreSQL)
2. ✅ Setup OAuth providers (Google, LinkedIn, ORCID)
3. ✅ Test authentication
4. ✅ Deploy to production
5. ✅ Update OAuth redirect URIs for production

Sau khi setup xong, tất cả 4 phương thức login sẽ hoạt động!
