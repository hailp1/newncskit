# ✅ Google OAuth Đã Sẵn Sàng!

## 🎉 Credentials Đã Được Cấu Hình

### .env.local Updated
```env
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here
```

### Dev Server
- ✅ Restarted với credentials mới
- ✅ Running on http://localhost:3000
- ✅ Google OAuth ready to test

---

## 🧪 Test Google Login Ngay

### Bước 1: Vào Login Page
```
http://localhost:3000/auth/login
```

### Bước 2: Click "Google" Button
- Nút màu trắng với logo Google
- Text: "Google"

### Bước 3: Chọn Google Account
- Popup hoặc redirect đến Google
- Chọn account muốn dùng

### Bước 4: Authorize (Lần đầu)
- Google sẽ hỏi permission
- Click "Continue" hoặc "Allow"
- Permissions:
  - View email address
  - View basic profile info

### Bước 5: Success!
- Redirect về http://localhost:3000/dashboard
- User được tạo trong database
- Session được lưu
- Login thành công ✅

---

## 🔍 Verify Google Console Setup

### Required Settings

**Authorized JavaScript origins:**
```
http://localhost:3000
```

**Authorized redirect URIs:**
```
http://localhost:3000/api/auth/callback/google
```

### Check Settings

1. Vào: https://console.cloud.google.com/apis/credentials
2. Click vào OAuth 2.0 Client ID
3. Verify:
   - ✅ JavaScript origins có `http://localhost:3000`
   - ✅ Redirect URIs có `http://localhost:3000/api/auth/callback/google`

---

## 🆘 Nếu Gặp Lỗi

### Error: "redirect_uri_mismatch"

**Nguyên nhân:** Redirect URI chưa được thêm vào Google Console

**Fix:**
1. Vào Google Console → Credentials
2. Edit OAuth client
3. Thêm vào "Authorized redirect URIs":
   ```
   http://localhost:3000/api/auth/callback/google
   ```
4. Save
5. Thử lại

### Error: "invalid_client"

**Nguyên nhân:** Client ID hoặc Secret sai

**Fix:**
1. Check `.env.local` không có space thừa
2. Copy lại credentials từ Google Console
3. Restart dev server

### Error: "access_denied"

**Nguyên nhân:** User từ chối authorize

**Fix:**
- Click "Allow" khi Google hỏi permission
- Không click "Cancel"

### Popup bị block

**Fix:**
- Allow popups cho localhost trong browser settings
- Hoặc OAuth sẽ dùng redirect (vẫn hoạt động)

---

## 📊 Expected Behavior

### First Time Login

1. **Click Google button** → Redirect to Google
2. **Select account** → Choose Google account
3. **Authorize** → Click "Allow"
4. **Create user** → User created in database
5. **Redirect** → Back to app dashboard
6. **Success** → Logged in ✅

### Subsequent Logins

1. **Click Google button** → Redirect to Google
2. **Auto-select** → Google remembers account
3. **No authorize** → Already authorized
4. **Login** → Instant login
5. **Redirect** → Back to dashboard
6. **Success** → Logged in ✅

---

## 🎯 What Happens Behind The Scenes

### OAuth Flow

```
1. User clicks "Google"
   ↓
2. App redirects to Google with client_id
   ↓
3. User authorizes on Google
   ↓
4. Google redirects back with authorization code
   ↓
5. NextAuth exchanges code for access token
   ↓
6. NextAuth gets user info from Google
   ↓
7. NextAuth creates/updates user in database
   ↓
8. NextAuth creates session
   ↓
9. User logged in ✅
```

### Database

User được tạo với:
- Email từ Google
- Name từ Google
- Avatar URL từ Google
- Email verified: true
- Created timestamp

### Session

- Stored in JWT token
- Cookie: `next-auth.session-token`
- Expires: 30 days (default)
- Secure: httpOnly

---

## 🔒 Security Notes

### Development (Current)

- ✅ HTTP localhost OK
- ✅ Credentials in .env.local
- ✅ Not committed to git

### Production (Later)

- [ ] HTTPS only
- [ ] Update redirect URIs to production domain
- [ ] Environment variables in secure vault
- [ ] Rotate secrets regularly

---

## 📱 Test Scenarios

### Scenario 1: New User

1. User chưa có account
2. Login với Google
3. User được tạo mới
4. Redirect về dashboard
5. ✅ Success

### Scenario 2: Existing User

1. User đã có account (email match)
2. Login với Google
3. User được update (avatar, name)
4. Redirect về dashboard
5. ✅ Success

### Scenario 3: Multiple Accounts

1. Login với Google account A
2. Logout
3. Login với Google account B
4. 2 users riêng biệt trong database
5. ✅ Success

---

## 🎨 UI Elements

### Login Page

**Google Button:**
- Icon: Google logo (colorful)
- Text: "Google"
- Style: White background, border
- Hover: Scale up slightly

**Position:**
- Below email/password form
- Next to LinkedIn button
- Above ORCID button

---

## 💾 Database Schema

### User Created

```sql
INSERT INTO users (
  id,              -- UUID
  email,           -- from Google
  full_name,       -- from Google
  avatar_url,      -- from Google
  email_verified,  -- true
  email_verified_at, -- now()
  created_at,      -- now()
  updated_at       -- now()
)
```

### Check Database

```powershell
cd frontend
npx prisma studio
```

Opens GUI at http://localhost:5555

---

## ✅ Success Checklist

### Configuration
- [x] GOOGLE_CLIENT_ID in .env.local
- [x] GOOGLE_CLIENT_SECRET in .env.local
- [x] Dev server restarted
- [ ] Google Console redirect URIs configured

### Testing
- [ ] Login page loads
- [ ] Google button visible
- [ ] Click redirects to Google
- [ ] Can select account
- [ ] Authorize works
- [ ] Redirects back to app
- [ ] User created in database
- [ ] Dashboard loads
- [ ] Session persists

---

## 🚀 Next Steps

### After Google OAuth Works

1. [ ] Test with multiple Google accounts
2. [ ] Test logout and re-login
3. [ ] Setup LinkedIn OAuth (10 min)
4. [ ] Setup ORCID OAuth (10 min)
5. [ ] Upload team avatars
6. [ ] Ready for production!

---

## 📞 Support

### If Login Works
🎉 Congratulations! Google OAuth is working!

### If Login Fails
1. Check browser console for errors
2. Check dev server logs
3. Verify Google Console settings
4. Check `.env.local` credentials
5. Try incognito mode
6. Clear browser cache

---

**Google OAuth đã sẵn sàng! Hãy test ngay tại:**
```
http://localhost:3000/auth/login
```

**Click nút "Google" và enjoy! 🚀**
