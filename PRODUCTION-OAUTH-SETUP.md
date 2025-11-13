# Production OAuth Setup - ncskit.org

## ✅ Đã Làm

1. ✅ Created `.env.production` với `NEXTAUTH_URL=https://ncskit.org`
2. ✅ Added Google OAuth credentials
3. ✅ Restarted dev server

## ⏳ Cần Làm Tiếp

### Update Google Console (QUAN TRỌNG!)

**Vào:** https://console.cloud.google.com/apis/credentials

**Click vào OAuth 2.0 Client ID**

**Thêm Production URLs:**

#### Authorized JavaScript origins:
```
https://ncskit.org
https://app.ncskit.org
http://localhost:3000  ← Giữ lại cho dev
```

#### Authorized redirect URIs:
```
https://ncskit.org/api/auth/callback/google
https://app.ncskit.org/api/auth/callback/google
http://localhost:3000/api/auth/callback/google  ← Giữ lại cho dev
```

**Click SAVE**

---

## 🧪 Test Sau Khi Update

### Test trên ncskit.org

1. **Vào:**
   ```
   https://ncskit.org/auth/login
   ```

2. **Click "Google" button**

3. **Chọn account**

4. **Success!** → Redirect về dashboard

### Test trên localhost (vẫn hoạt động)

1. **Vào:**
   ```
   http://localhost:3000/auth/login
   ```

2. **Click "Google" button**

3. **Success!** → Vẫn hoạt động

---

## 📊 Configuration Summary

### Development (localhost:3000)
```env
# .env.local
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here
```

### Production (ncskit.org)
```env
# .env.production
NEXTAUTH_URL=https://ncskit.org
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here
```

**Same credentials work for both!**

---

## 🔒 Security Notes

### Current Setup
- ⚠️ Using dev secret in production
- ⚠️ Same database for dev and prod

### Recommended for Production
1. **Generate strong NEXTAUTH_SECRET:**
   ```powershell
   # Generate random secret
   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
   ```
   Update in `.env.production`

2. **Use separate production database:**
   - Setup production PostgreSQL
   - Update DATABASE_URL in `.env.production`

3. **Secure environment variables:**
   - Use environment variable manager
   - Don't commit `.env.production` to git

---

## 🆘 Troubleshooting

### Error: "redirect_uri_mismatch" trên ncskit.org

**Fix:** Thêm production redirect URIs vào Google Console (xem trên)

### Login works on localhost but not ncskit.org

**Check:**
1. Google Console có production URLs chưa?
2. `.env.production` có `NEXTAUTH_URL=https://ncskit.org` chưa?
3. Dev server đã restart chưa?

### Session không persist trên ncskit.org

**Check:**
1. Cookies có được set không? (F12 → Application → Cookies)
2. HTTPS working? (Cloudflare Tunnel OK?)
3. NEXTAUTH_SECRET có trong `.env.production` không?

---

## ✅ Verification Checklist

### Google Console
- [ ] Opened OAuth 2.0 Client ID settings
- [ ] Added `https://ncskit.org` to JavaScript origins
- [ ] Added `https://app.ncskit.org` to JavaScript origins
- [ ] Added `https://ncskit.org/api/auth/callback/google` to redirect URIs
- [ ] Added `https://app.ncskit.org/api/auth/callback/google` to redirect URIs
- [ ] Clicked SAVE

### Local Setup
- [x] Created `.env.production`
- [x] Set `NEXTAUTH_URL=https://ncskit.org`
- [x] Added Google credentials
- [x] Restarted dev server

### Testing
- [ ] Test login on https://ncskit.org
- [ ] Test login on http://localhost:3000
- [ ] Both work successfully

---

## 🎯 After Setup Complete

Both environments will work:
- ✅ **Development:** http://localhost:3000
- ✅ **Production:** https://ncskit.org

Same Google OAuth credentials work for both!

---

**Hãy update Google Console ngay để ncskit.org hoạt động! 🚀**
