# Authentication System - Complete Setup Guide

## ✅ ĐÃ HOÀN THÀNH

### 1. Code Implementation
- ✅ Thêm LinkedIn Provider vào NextAuth
- ✅ Thêm ORCID Provider vào NextAuth (custom)
- ✅ Update auth callbacks để xử lý OAuth sign-in
- ✅ Tự động tạo user khi đăng nhập OAuth lần đầu
- ✅ Lưu ORCID ID vào database
- ✅ Update UI - thêm ORCID button vào login form
- ✅ Update auth store - thêm loginWithOrcid method
- ✅ Fix loginWithLinkedIn method

### 2. Hệ Thống Authentication Hiện Tại

**4 Phương Thức Đăng Nhập:**
1. ✅ **Email/Password** (Credentials) - Hoạt động
2. 🔧 **Google OAuth** - Cần setup credentials
3. 🔧 **LinkedIn OAuth** - Cần setup credentials  
4. 🔧 **ORCID OAuth** - Cần setup credentials

---

## 🔧 CẦN LÀM TIẾP

### Bước 1: Setup Database (Khẩn Cấp)

**Vấn đề:** Docker Desktop chưa khởi động được

**Giải pháp A - Đợi Docker:**
```powershell
# Kiểm tra Docker
docker ps

# Nếu OK, chạy:
docker-compose -f docker-compose.production.yml up -d postgres
cd frontend
npx prisma db push
```

**Giải pháp B - Dùng Cloud Database (Nhanh hơn):**
1. Tạo free database trên Supabase: https://supabase.com
2. Copy connection string
3. Update `.env.local`:
   ```env
   DATABASE_URL=postgresql://postgres:[password]@[host]:5432/postgres
   ```
4. Chạy:
   ```powershell
   cd frontend
   npx prisma db push
   ```

### Bước 2: Setup OAuth Providers

#### A. Google OAuth

**1. Google Cloud Console:**
https://console.cloud.google.com/apis/credentials

**2. Cấu hình:**

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

**3. Update .env.local:**
```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

#### B. LinkedIn OAuth

**1. LinkedIn Developers:**
https://www.linkedin.com/developers/apps

**2. Tạo app và cấu hình:**

**Redirect URLs:**
```
https://ncskit.org/api/auth/callback/linkedin
https://app.ncskit.org/api/auth/callback/linkedin
http://localhost:3000/api/auth/callback/linkedin
```

**3. Request permissions:**
- Sign In with LinkedIn using OpenID Connect

**4. Update .env.local:**
```env
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
```

#### C. ORCID OAuth

**1. ORCID Developer Tools:**
https://orcid.org/developer-tools

**2. Register application:**

**Redirect URIs:**
```
https://ncskit.org/api/auth/callback/orcid
https://app.ncskit.org/api/auth/callback/orcid
http://localhost:3000/api/auth/callback/orcid
```

**3. Update .env.local:**
```env
ORCID_CLIENT_ID=your_orcid_client_id
ORCID_CLIENT_SECRET=your_orcid_client_secret
```

### Bước 3: Cấu Hình Environment

**File `.env.local` hoàn chỉnh:**
```env
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/ncskit_production

# NextAuth
NEXTAUTH_URL=http://localhost:3000
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

**Cho Production:**
```env
NEXTAUTH_URL=https://ncskit.org
```

---

## 🧪 TESTING

### 1. Start Dev Server
```powershell
cd frontend
npm run dev
```

### 2. Test Login Page
Mở: http://localhost:3000/auth/login

Bạn sẽ thấy:
- 📧 Email/Password form
- 🔵 Sign in with Google button
- 💼 Sign in with LinkedIn button
- 🎓 Sign in with ORCID button

### 3. Test Từng Phương Thức

**Email/Password:**
1. Nhập email và password
2. Click "Đăng nhập"
3. Kiểm tra redirect về dashboard

**Google:**
1. Click "Google" button
2. Chọn Google account
3. Authorize
4. Kiểm tra user được tạo trong database

**LinkedIn:**
1. Click "LinkedIn" button
2. Đăng nhập LinkedIn
3. Authorize
4. Kiểm tra user được tạo

**ORCID:**
1. Click "ORCID" button
2. Đăng nhập ORCID
3. Authorize
4. Kiểm tra ORCID ID được lưu

---

## 📁 FILES ĐÃ THAY ĐỔI

### 1. Backend/Auth Configuration
- ✅ `frontend/src/lib/auth.ts` - Thêm LinkedIn và ORCID providers
- ✅ `frontend/.env.local` - Thêm OAuth credentials

### 2. Frontend Components
- ✅ `frontend/src/components/auth/auth-form.tsx` - Thêm ORCID button
- ✅ `frontend/src/store/auth.ts` - Thêm loginWithOrcid method

### 3. Documentation
- ✅ `OAUTH-SETUP-GUIDE.md` - Hướng dẫn chi tiết setup OAuth
- ✅ `AUTHENTICATION-COMPLETE-SETUP.md` - File này

---

## 🔒 SECURITY CHECKLIST

### Development
- [ ] Dùng HTTP cho localhost OK
- [ ] Separate OAuth apps cho dev/prod
- [ ] Không commit .env.local

### Production
- [ ] Dùng HTTPS (https://ncskit.org)
- [ ] Strong NEXTAUTH_SECRET
- [ ] Giữ CLIENT_SECRET bí mật
- [ ] Update redirect URIs cho production

---

## 🐛 TROUBLESHOOTING

### "Redirect URI mismatch"
→ Kiểm tra redirect URIs trong OAuth console khớp với NEXTAUTH_URL

### "Invalid client"
→ Kiểm tra CLIENT_ID và CLIENT_SECRET đã điền đúng

### "Database connection error"
→ Kiểm tra DATABASE_URL và PostgreSQL đang chạy

### User không tạo trong database
→ Kiểm tra signIn callback trong auth.ts
→ Xem logs trong terminal

### OAuth popup bị block
→ Cho phép popups trong browser
→ Hoặc dùng redirect flow

---

## 📊 WORKFLOW

```
User clicks OAuth button
    ↓
NextAuth redirects to provider
    ↓
User authorizes on provider site
    ↓
Provider redirects back with code
    ↓
NextAuth exchanges code for tokens
    ↓
signIn callback checks/creates user
    ↓
User logged in, redirect to dashboard
```

---

## ✅ VERIFICATION CHECKLIST

### Database
- [ ] PostgreSQL running
- [ ] Database schema created (`npx prisma db push`)
- [ ] Can connect from app

### OAuth Providers
- [ ] Google credentials configured
- [ ] LinkedIn credentials configured
- [ ] ORCID credentials configured
- [ ] All redirect URIs added

### Testing
- [ ] Email/password login works
- [ ] Google OAuth works
- [ ] LinkedIn OAuth works
- [ ] ORCID OAuth works
- [ ] User created in database
- [ ] ORCID ID saved correctly

### Production
- [ ] Update NEXTAUTH_URL to https://ncskit.org
- [ ] Update all OAuth redirect URIs for production
- [ ] Test on production domain

---

## 🎯 NEXT STEPS

1. **Ưu tiên 1:** Fix database connection
2. **Ưu tiên 2:** Setup Google OAuth (phổ biến nhất)
3. **Ưu tiên 3:** Setup LinkedIn OAuth
4. **Ưu tiên 4:** Setup ORCID OAuth (cho researchers)
5. **Ưu tiên 5:** Test toàn bộ hệ thống
6. **Ưu tiên 6:** Deploy và test trên production

---

## 📞 CẦN TRỢ GIÚP?

Nếu gặp vấn đề:
1. Kiểm tra logs trong terminal
2. Kiểm tra browser console
3. Xem file `OAUTH-SETUP-GUIDE.md` để biết chi tiết
4. Báo lỗi cụ thể để tôi giúp debug

**Hệ thống authentication đã sẵn sàng! Chỉ cần setup credentials và database là có thể dùng ngay.**
