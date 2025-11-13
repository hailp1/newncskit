# Setup Google OAuth - Hướng Dẫn Nhanh (10 phút)

## ❌ Lỗi Hiện Tại

```
http://localhost:3000/api/auth/error?error=OAuthSignin
```

**Nguyên nhân:** Google OAuth credentials chưa được cấu hình

**File `.env.local`:**
```env
GOOGLE_CLIENT_ID=          ← Trống!
GOOGLE_CLIENT_SECRET=      ← Trống!
```

---

## ✅ Giải Pháp - Setup Google OAuth

### Bước 1: Tạo Google Cloud Project (2 phút)

1. **Vào Google Cloud Console:**
   ```
   https://console.cloud.google.com/
   ```

2. **Đăng nhập** với Google account

3. **Tạo project mới:**
   - Click dropdown ở top bar (bên cạnh "Google Cloud")
   - Click "NEW PROJECT"
   - Project name: `NCSKIT`
   - Click "CREATE"
   - Đợi project được tạo (~30 giây)

4. **Chọn project vừa tạo:**
   - Click dropdown lại
   - Chọn "NCSKIT"

---

### Bước 2: Enable Google+ API (1 phút)

1. **Vào APIs & Services:**
   - Sidebar → "APIs & Services" → "Library"

2. **Search "Google+ API":**
   - Gõ "google+" vào search box
   - Click "Google+ API"

3. **Enable:**
   - Click "ENABLE"
   - Đợi enable xong

---

### Bước 3: Configure OAuth Consent Screen (2 phút)

1. **Vào OAuth consent screen:**
   - Sidebar → "OAuth consent screen"

2. **Chọn User Type:**
   - Chọn "External"
   - Click "CREATE"

3. **App information:**
   - App name: `NCSKIT`
   - User support email: (chọn email của bạn)
   - Developer contact: (nhập email của bạn)

4. **App domain (Optional - có thể skip):**
   - Application home page: `http://localhost:3000`
   - Skip các field khác

5. **Scopes:**
   - Click "ADD OR REMOVE SCOPES"
   - Chọn:
     - `.../auth/userinfo.email`
     - `.../auth/userinfo.profile`
   - Click "UPDATE"
   - Click "SAVE AND CONTINUE"

6. **Test users (Optional):**
   - Click "ADD USERS"
   - Thêm email của bạn
   - Click "SAVE AND CONTINUE"

7. **Summary:**
   - Click "BACK TO DASHBOARD"

---

### Bước 4: Tạo OAuth Credentials (2 phút)

1. **Vào Credentials:**
   - Sidebar → "Credentials"

2. **Create Credentials:**
   - Click "CREATE CREDENTIALS"
   - Chọn "OAuth client ID"

3. **Application type:**
   - Chọn "Web application"

4. **Name:**
   - Name: `NCSKIT Web Client`

5. **Authorized JavaScript origins:**
   Click "ADD URI" và thêm:
   ```
   http://localhost:3000
   ```

6. **Authorized redirect URIs:**
   Click "ADD URI" và thêm:
   ```
   http://localhost:3000/api/auth/callback/google
   ```

7. **Create:**
   - Click "CREATE"
   - Popup hiện ra với Client ID và Client Secret

8. **Copy credentials:**
   - Copy "Client ID" (dạng: xxx.apps.googleusercontent.com)
   - Copy "Client secret"
   - Click "OK"

---

### Bước 5: Update .env.local (1 phút)

1. **Mở file:**
   ```
   frontend/.env.local
   ```

2. **Paste credentials:**
   ```env
   # Google OAuth
   GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your_client_secret_here
   ```

3. **Save file**

---

### Bước 6: Restart Dev Server (1 phút)

```powershell
# Stop dev server (Ctrl+C trong terminal)

# Start lại
cd frontend
npm run dev
```

---

### Bước 7: Test Google Login (1 phút)

1. **Vào login page:**
   ```
   http://localhost:3000/auth/login
   ```

2. **Click "Google" button**

3. **Chọn Google account**

4. **Authorize app:**
   - Click "Continue" hoặc "Allow"

5. **Success!**
   - Redirect về dashboard
   - User được tạo trong database
   - Login thành công ✅

---

## 📋 Quick Reference

### Google Cloud Console URLs

**Main Console:**
```
https://console.cloud.google.com/
```

**APIs & Services:**
```
https://console.cloud.google.com/apis/dashboard
```

**Credentials:**
```
https://console.cloud.google.com/apis/credentials
```

**OAuth Consent:**
```
https://console.cloud.google.com/apis/credentials/consent
```

---

## 🔧 Configuration Summary

### .env.local (Development)
```env
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxx
```

### Google Cloud Console

**Authorized JavaScript origins:**
```
http://localhost:3000
```

**Authorized redirect URIs:**
```
http://localhost:3000/api/auth/callback/google
```

---

## 🚀 Production Setup (Sau này)

Khi deploy lên production:

### 1. Update .env.local (Production)
```env
NEXTAUTH_URL=https://ncskit.org
```

### 2. Update Google Console

**Thêm vào Authorized JavaScript origins:**
```
https://ncskit.org
https://app.ncskit.org
```

**Thêm vào Authorized redirect URIs:**
```
https://ncskit.org/api/auth/callback/google
https://app.ncskit.org/api/auth/callback/google
```

### 3. Publish OAuth Consent Screen

- Vào OAuth consent screen
- Click "PUBLISH APP"
- Submit for verification (nếu cần)

---

## 🆘 Troubleshooting

### Error: "redirect_uri_mismatch"

**Nguyên nhân:** Redirect URI không khớp

**Fix:**
1. Check Google Console → Credentials
2. Verify redirect URI chính xác:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
3. Không có trailing slash `/`
4. Không có typo

### Error: "invalid_client"

**Nguyên nhân:** Client ID hoặc Secret sai

**Fix:**
1. Check `.env.local`
2. Copy lại credentials từ Google Console
3. Không có space thừa
4. Restart dev server

### Error: "access_denied"

**Nguyên nhân:** User từ chối authorize

**Fix:**
- User cần click "Allow" khi Google hỏi
- Check OAuth consent screen đã setup đúng

### Popup bị block

**Fix:**
- Allow popups cho localhost
- Hoặc dùng redirect flow (đã config sẵn)

---

## ✅ Verification Checklist

### Google Cloud Console
- [ ] Project created
- [ ] Google+ API enabled
- [ ] OAuth consent screen configured
- [ ] OAuth credentials created
- [ ] JavaScript origins added
- [ ] Redirect URIs added

### Local Setup
- [ ] GOOGLE_CLIENT_ID filled in .env.local
- [ ] GOOGLE_CLIENT_SECRET filled in .env.local
- [ ] Dev server restarted
- [ ] No syntax errors in .env.local

### Testing
- [ ] Login page loads
- [ ] Google button visible
- [ ] Click redirects to Google
- [ ] Can select account
- [ ] Authorize screen shows
- [ ] Redirects back to app
- [ ] User created in database
- [ ] Login successful

---

## 💡 Tips

### Development

1. **Test users:** Thêm email của bạn vào test users trong OAuth consent
2. **Multiple accounts:** Test với nhiều Google accounts
3. **Incognito:** Test trong incognito để clear session

### Security

1. **Never commit:** Không commit `.env.local` vào git
2. **Rotate secrets:** Thay secret định kỳ
3. **Restrict domains:** Trong production, restrict authorized domains

### Performance

1. **Cache:** NextAuth tự động cache session
2. **Database:** User info được lưu local database
3. **No API calls:** Sau login, không cần call Google API nữa

---

## 📊 Expected Flow

```
User clicks "Google" button
    ↓
Redirect to Google login
    ↓
User selects account
    ↓
Google shows consent screen
    ↓
User clicks "Allow"
    ↓
Google redirects back with code
    ↓
NextAuth exchanges code for tokens
    ↓
NextAuth creates/updates user in database
    ↓
User logged in, redirect to dashboard
    ↓
Success! ✅
```

---

## 🎯 Next Steps

Sau khi Google OAuth hoạt động:

1. [ ] Setup LinkedIn OAuth (10 min)
2. [ ] Setup ORCID OAuth (10 min)
3. [ ] Test all login methods
4. [ ] Upload team avatars
5. [ ] Ready for production!

---

**Làm theo 7 bước trên và Google login sẽ hoạt động! 🚀**

**Thời gian: ~10 phút**
**Độ khó: Dễ**
**Kết quả: Google OAuth working ✅**
