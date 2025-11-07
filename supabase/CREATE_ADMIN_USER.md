# 👤 Tạo Admin User trong Supabase

## Thông Tin Admin User

- **Email:** `admin@ncskit.org`
- **Password:** `admin123`
- **Role:** `super admin`
- **Full Name:** `Super Admin`

---

## 🚀 Cách 1: Tạo qua Supabase Dashboard (Recommended)

### Bước 1: Tạo User

1. Mở [Supabase Dashboard](https://app.supabase.com)
2. Chọn project của bạn
3. Vào **Authentication** > **Users**
4. Click **Add user** (nút xanh ở góc phải)
5. Chọn **Create new user**

### Bước 2: Điền Thông Tin

Điền form như sau:

```
Email: admin@ncskit.org
Password: admin123
```

**QUAN TRỌNG:** 
- ✅ Check box **Auto Confirm User** (để không cần confirm email)
- ✅ Check box **Send user a magic link** (optional - nếu muốn gửi email)

### Bước 3: Create User

Click **Create user**

### Bước 4: Set Admin Role

Sau khi user được tạo:

1. Vào **SQL Editor**
2. Copy và chạy script sau:

```sql
-- Set admin role for the user
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'
)
WHERE email = 'admin@ncskit.org';

-- Update profile with full name
UPDATE public.profiles
SET 
  full_name = 'Super Admin',
  updated_at = NOW()
WHERE email = 'admin@ncskit.org';

-- Verify admin user
SELECT 
  id,
  email,
  raw_user_meta_data->>'role' as role,
  raw_user_meta_data->>'full_name' as full_name,
  email_confirmed_at,
  created_at
FROM auth.users
WHERE email = 'admin@ncskit.org';
```

### Bước 5: Verify

Chạy query để verify:

```sql
-- Check user in auth.users
SELECT 
  id,
  email,
  raw_user_meta_data,
  email_confirmed_at
FROM auth.users
WHERE email = 'admin@ncskit.org';

-- Check profile
SELECT *
FROM public.profiles
WHERE email = 'admin@ncskit.org';
```

Expected results:
- ✅ User exists với email `admin@ncskit.org`
- ✅ `email_confirmed_at` có giá trị (not null)
- ✅ `raw_user_meta_data` có `"role": "admin"`
- ✅ Profile exists với `full_name = 'Super Admin'`

---

## 🔧 Cách 2: Tạo qua SQL (Advanced)

**Lưu ý:** Cách này phức tạp hơn vì Supabase Auth có encryption cho password.

### Option A: Sử dụng Supabase Admin API

Tạo file script (chạy trong terminal):

```bash
# create-admin.sh
curl -X POST 'https://[YOUR-PROJECT-REF].supabase.co/auth/v1/admin/users' \
  -H "apikey: [YOUR-SERVICE-ROLE-KEY]" \
  -H "Authorization: Bearer [YOUR-SERVICE-ROLE-KEY]" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@ncskit.org",
    "password": "admin123",
    "email_confirm": true,
    "user_metadata": {
      "role": "admin",
      "full_name": "Super Admin"
    }
  }'
```

**Thay thế:**
- `[YOUR-PROJECT-REF]` với project reference của bạn
- `[YOUR-SERVICE-ROLE-KEY]` với service role key (từ Settings > API)

### Option B: Sử dụng Supabase JS Client

Tạo file `create-admin.js`:

```javascript
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://[YOUR-PROJECT-REF].supabase.co'
const supabaseServiceKey = '[YOUR-SERVICE-ROLE-KEY]'

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createAdminUser() {
  // Create user
  const { data: user, error: createError } = await supabase.auth.admin.createUser({
    email: 'admin@ncskit.org',
    password: 'admin123',
    email_confirm: true,
    user_metadata: {
      role: 'admin',
      full_name: 'Super Admin'
    }
  })

  if (createError) {
    console.error('Error creating user:', createError)
    return
  }

  console.log('✅ Admin user created:', user)

  // Update profile
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ full_name: 'Super Admin' })
    .eq('email', 'admin@ncskit.org')

  if (profileError) {
    console.error('Error updating profile:', profileError)
    return
  }

  console.log('✅ Profile updated')
}

createAdminUser()
```

Chạy:
```bash
node create-admin.js
```

---

## ✅ Verify Admin User

### 1. Test Login

1. Truy cập: http://localhost:3000/auth/login
2. Đăng nhập với:
   - Email: `admin@ncskit.org`
   - Password: `admin123`
3. Expected:
   - ✅ Login thành công
   - ✅ Redirect to `/dashboard`
   - ✅ Navbar hiển thị "Super Admin"
   - ✅ Có nút "Admin Panel" (màu đỏ)

### 2. Test Admin Access

1. Click vào nút **Admin Panel** trong navbar
2. Expected:
   - ✅ Redirect to `/admin`
   - ✅ Có thể access admin features

### 3. Check Database

Trong Supabase Dashboard:

**Authentication > Users:**
```
Email: admin@ncskit.org
Provider: email
Confirmed: Yes
Last Sign In: [timestamp]
```

**Table Editor > profiles:**
```
id: [uuid]
email: admin@ncskit.org
full_name: Super Admin
created_at: [timestamp]
```

**SQL Query:**
```sql
SELECT 
  u.id,
  u.email,
  u.raw_user_meta_data->>'role' as role,
  p.full_name,
  u.email_confirmed_at,
  u.last_sign_in_at
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.email = 'admin@ncskit.org';
```

Expected result:
```
id: [uuid]
email: admin@ncskit.org
role: admin
full_name: Super Admin
email_confirmed_at: [timestamp]
last_sign_in_at: [timestamp or null]
```

---

## 🔐 Security Notes

### Change Password After First Login

Sau khi tạo admin user, nên đổi password:

1. Login với `admin@ncskit.org` / `admin123`
2. Vào Settings hoặc Profile
3. Đổi password thành password mạnh hơn

### Password Requirements

Để tăng security, cân nhắc:
- Minimum 12 characters
- Include uppercase, lowercase, numbers, symbols
- Không sử dụng password dễ đoán

### Revoke Access

Nếu cần revoke admin access:

```sql
-- Remove admin role
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data - 'role'
WHERE email = 'admin@ncskit.org';

-- Or set to regular user
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  raw_user_meta_data,
  '{role}',
  '"user"'
)
WHERE email = 'admin@ncskit.org';
```

---

## 🎯 Admin Features

Admin user (`admin@ncskit.org`) sẽ có access to:

### 1. Admin Panel
- URL: `/admin`
- Features: User management, system settings, analytics

### 2. Blog Admin
- URL: `/blog-admin`
- Features: Create/edit/delete blog posts

### 3. All User Data
- Can view all projects (if implemented)
- Can manage all users
- Can access system logs

### 4. Special UI Elements
- Red "Admin Panel" button in navbar
- Admin badge in user menu
- Access to admin-only routes

---

## 🐛 Troubleshooting

### User không được tạo
**Giải pháp:**
- Check email format đúng
- Verify password đủ mạnh (min 6 chars)
- Check Supabase logs: Dashboard > Logs

### Profile không được tạo
**Giải pháp:**
- Check trigger `on_auth_user_created` exists
- Manually create profile:
```sql
INSERT INTO public.profiles (id, email, full_name)
SELECT id, email, 'Super Admin'
FROM auth.users
WHERE email = 'admin@ncskit.org';
```

### Admin role không hoạt động
**Giải pháp:**
- Verify metadata:
```sql
SELECT raw_user_meta_data FROM auth.users WHERE email = 'admin@ncskit.org';
```
- Should see: `{"role": "admin", ...}`

### Không thấy Admin Panel button
**Giải pháp:**
- Check navbar.tsx logic
- Verify user metadata có `role: "admin"`
- Clear browser cache và refresh

---

## 📝 Summary

**Cách nhanh nhất:**
1. Vào Supabase Dashboard > Authentication > Users
2. Click "Add user" > "Create new user"
3. Email: `admin@ncskit.org`, Password: `admin123`
4. Check "Auto Confirm User"
5. Create user
6. Chạy SQL để set admin role
7. Test login

**Total time:** ~2 phút

✅ Admin user ready to use!
