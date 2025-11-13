# ✅ LinkedIn OAuth Production Configuration

## 🔍 Kiểm Tra Code

### ✅ Đã Cấu Hình

File `frontend/src/lib/auth.ts` đã có:

```typescript
LinkedInProvider({
  clientId: process.env.LINKEDIN_CLIENT_ID || '',
  clientSecret: process.env.LINKEDIN_CLIENT_SECRET || '',
  authorization: {
    params: {
      scope: 'openid profile email'
    }
  }
})
```

**✅ Code đã đúng!** LinkedIn OAuth đã được cấu hình với:
- Environment variables (`LINKEDIN_CLIENT_ID`, `LINKEDIN_CLIENT_SECRET`)
- Scope: `openid profile email` (đúng cho LinkedIn v2 API)
- Sử dụng cùng `redirect()` callback như Google (tự động detect base URL)

---

## 📋 Cần Cấu Hình LinkedIn Developer Portal

### Bước 1: Vào LinkedIn Developer Portal

**URL:** https://www.linkedin.com/developers/apps

### Bước 2: Chọn App của Bạn

- Chọn app NCSKIT (hoặc tạo mới nếu chưa có)

### Bước 3: Vào Tab "Auth"

### Bước 4: Thêm Authorized Redirect URLs

Thêm các URLs sau:

```
https://ncskit.org/api/auth/callback/linkedin
https://www.ncskit.org/api/auth/callback/linkedin
http://localhost:3000/api/auth/callback/linkedin
```

**⚠️ LƯU Ý:**
- Phải là `https://` cho production (không phải `http://`)
- Không có trailing slash `/`
- Phải có cả `ncskit.org` và `www.ncskit.org`

### Bước 5: Request Permissions

Đảm bảo app có các permissions:
- ✅ **Sign In with LinkedIn using OpenID Connect** (Required)
- ✅ **r_emailaddress** (Email address)
- ✅ **r_liteprofile** hoặc **profile** (Basic profile)

### Bước 6: Click "Update"

---

## 🔧 Environment Variables

Đảm bảo trong production environment có:

```env
# LinkedIn OAuth
LINKEDIN_CLIENT_ID=your-linkedin-client-id
LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret
```

**Lấy từ:** LinkedIn Developer Portal → App → Auth tab

---

## 🧪 Test LinkedIn OAuth

### Test trên Production:

1. Vào: https://ncskit.org/auth/login
2. Click "Login with LinkedIn"
3. Kiểm tra:
   - ✅ Redirect đến LinkedIn login page
   - ✅ Sau khi authorize, callback về `https://ncskit.org/api/auth/callback/linkedin`
   - ✅ Login thành công và redirect về dashboard

### Test trên Development:

1. Vào: http://localhost:3000/auth/login
2. Click "Login with LinkedIn"
3. Phải hoạt động với localhost

---

## ✅ Checklist

- [x] ✅ Code LinkedIn OAuth đã được cấu hình
- [x] ✅ Sử dụng cùng redirect callback như Google
- [ ] ⏳ LinkedIn Developer Portal đã được cập nhật
- [ ] ⏳ Environment variables đã được set trong production
- [ ] ⏳ Test LinkedIn OAuth flow trên production

---

## 🚨 Lưu Ý

1. **LinkedIn API v2:** Code đang dùng scope `openid profile email` (v2 API)
2. **Redirect URL:** Phải match chính xác với URL trong LinkedIn Developer Portal
3. **HTTPS Required:** Production phải dùng `https://` (LinkedIn yêu cầu)
4. **Delay:** Sau khi update LinkedIn Developer Portal, có thể mất 2-3 phút để apply

---

*Cập nhật: 2025-11-13*

