# Google OAuth Configuration - Cần Sửa

## Vấn Đề Hiện Tại

Cấu hình Google OAuth của bạn có URL Supabase cũ không cần thiết.

## Cấu Hình Đúng

### 1. Authorized JavaScript Origins
```
https://ncskit.org
https://app.ncskit.org
http://localhost:3000
```

### 2. Authorized Redirect URIs
```
https://ncskit.org/api/auth/callback/google
https://app.ncskit.org/api/auth/callback/google
http://localhost:3000/api/auth/callback/google
```

## Cần Xóa

❌ **Xóa các URL này:**
- `https://hfczndbrexnaoczxmopn.supabase.co/auth/v1/callback` (Supabase cũ)
- LinkedIn callbacks (nếu chưa setup LinkedIn OAuth)

## Tại Sao?

1. **Supabase URL không cần** - Bạn đang dùng NextAuth, không dùng Supabase Auth
2. **LinkedIn chưa setup** - Nếu chưa có LinkedIn OAuth provider trong code
3. **Localhost cần thêm** - Để test OAuth trong development

## Cách Sửa

1. Vào Google Cloud Console: https://console.cloud.google.com/apis/credentials
2. Chọn OAuth 2.0 Client ID của bạn
3. Sửa "Authorized redirect URIs":
   - Xóa URL Supabase
   - Thêm `http://localhost:3000/api/auth/callback/google`
4. Thêm vào "Authorized JavaScript origins":
   - `http://localhost:3000`
5. Save

## Kiểm Tra Trong Code

Đảm bảo `.env.local` có:
```env
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
NEXTAUTH_URL=https://ncskit.org
```

## Sau Khi Sửa

✅ Google OAuth sẽ hoạt động với NextAuth
✅ Có thể test trên localhost
✅ Hoạt động trên production (ncskit.org)
