# Tổng Hợp Vấn Đề Admin Role

## Vấn Đề Phát Hiện

User `phuchai.le@gmail.com` đã được cập nhật role = 'super_admin' trong database nhưng frontend vẫn hiển thị role = 'user'.

## Nguyên Nhân

1. **Zustand Store Cache**: Auth store được persist trong localStorage với key `auth-storage`
2. **Profile Service Cache**: Profile service có cache riêng
3. **Multiple Data Sources**: Role được lấy từ nhiều nguồn:
   - `auth.users` metadata
   - `profiles` table
   - Zustand store cache

## Các File Cần Kiểm Tra

### 1. Auth Store (`frontend/src/store/auth.ts`)
- ✅ Đã cập nhật để fetch từ `profiles` table
- ✅ Có persist middleware cache trong localStorage
- ⚠️ Cần verify rằng `updateUser()` function hoạt động đúng

### 2. Force Refresh Auth (`frontend/src/lib/force-refresh-auth.ts`)
- ✅ Đã thêm timeout 5 giây
- ✅ Fetch từ `profiles` table
- ⚠️ Cần verify response được return đúng

### 3. Profile Page (`frontend/src/app/(dashboard)/profile/page.tsx`)
- ⚠️ Hiển thị `profile.role` từ service, không từ auth store
- ⚠️ Không sync với auth store khi refresh

### 4. Dashboard Page (`frontend/src/app/(dashboard)/dashboard/page.tsx`)
- ✅ Hiển thị `user.role` từ auth store
- ✅ Có nút refresh profile

### 5. Header (`frontend/src/components/layout/header.tsx`)
- ✅ Có dropdown menu với refresh profile
- ✅ Check admin bằng `isAdmin()` function

### 6. Sidebar (`frontend/src/components/layout/sidebar.tsx`)
- ✅ Có dropdown menu với refresh profile
- ✅ Check admin bằng `isAdmin()` function

## Giải Pháp

### Bước 1: Verify Database
```sql
SELECT id, email, role, subscription_type, is_active 
FROM profiles 
WHERE email = 'phuchai.le@gmail.com';
```
Kết quả phải là: `role = 'super_admin'`

### Bước 2: Clear Cache Hoàn Toàn
```javascript
// Trong Console (F12)
localStorage.removeItem('auth-storage')
sessionStorage.clear()
location.reload()
```

### Bước 3: Login Lại
- Logout
- Login lại với `phuchai.le@gmail.com`
- Auth store sẽ fetch fresh data từ `profiles` table

### Bước 4: Verify Auth Store
```javascript
// Trong Console (F12)
const authData = JSON.parse(localStorage.getItem('auth-storage'))
console.log('User role:', authData.state.user.role)
```
Phải hiển thị: `super_admin`

### Bước 5: Test Refresh Profile
- Click nút "Làm mới thông tin" ở header hoặc sidebar
- Kiểm tra Console xem có error không
- Verify role được cập nhật

## Checklist Kiểm Tra

- [ ] Database có `role = 'super_admin'` cho `phuchai.le@gmail.com`
- [ ] Clear localStorage và sessionStorage
- [ ] Logout và login lại
- [ ] Auth store có `role = 'super_admin'`
- [ ] Header hiển thị "super_admin" trong dropdown
- [ ] Sidebar hiển thị admin menu
- [ ] Profile page hiển thị "super_admin"
- [ ] Dashboard hiển thị đúng role
- [ ] Nút "Làm mới thông tin" hoạt động (< 5 giây)
- [ ] Admin Panel accessible
- [ ] Admin Settings accessible

## Debug Commands

### 1. Check Current User in Store
```javascript
const store = JSON.parse(localStorage.getItem('auth-storage'))
console.log('Current user:', store.state.user)
console.log('Role:', store.state.user.role)
```

### 2. Test Force Refresh
```javascript
const { forceRefreshAuth } = await import('/src/lib/force-refresh-auth.ts')
const freshData = await forceRefreshAuth()
console.log('Fresh data:', freshData)
```

### 3. Check Supabase Direct
```javascript
const { createClient } = await import('@/lib/supabase/client')
const supabase = createClient()
const { data: session } = await supabase.auth.getSession()
const { data: profile } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', session.session.user.id)
  .single()
console.log('Profile from DB:', profile)
```

## Kết Luận

Vấn đề chính là **cache trong localStorage**. Giải pháp đơn giản nhất:
1. Clear cache
2. Logout/Login lại
3. Hoặc dùng nút "Làm mới thông tin"

Nếu vẫn không được, cần kiểm tra:
- Database có đúng role chưa
- Network request có fetch đúng không (xem Network tab)
- Console có error không
