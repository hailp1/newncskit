# Hướng Dẫn Hệ Thống Admin và Phân Quyền

## Mục Lục

1. [Tổng Quan](#tổng-quan)
2. [Cấu Trúc Phân Quyền](#cấu-trúc-phân-quyền)
3. [Các Trang Admin](#các-trang-admin)
4. [Kiểm Tra Quyền](#kiểm-tra-quyền)
5. [Hướng Dẫn Sử Dụng](#hướng-dẫn-sử-dụng)
6. [Troubleshooting](#troubleshooting)

---

## Tổng Quan

Hệ thống admin của NCSKIT sử dụng **Role-Based Access Control (RBAC)** với 4 cấp độ quyền:

### Các Vai Trò (Roles)

| Vai Trò | Mô Tả | Màu Sắc | Số Quyền |
|---------|-------|---------|----------|
| **User** | Người dùng thường | Gray | 3 quyền |
| **Moderator** | Người kiểm duyệt | Green | 8 quyền |
| **Admin** | Quản trị viên | Blue | 17 quyền |
| **Super Admin** | Quản trị tối cao | Purple | Tất cả quyền |

---

## Cấu Trúc Phân Quyền

### 1. User Management (Quản Lý Người Dùng)

| Quyền | Code | User | Moderator | Admin | Super Admin |
|-------|------|------|-----------|-------|-------------|
| Xem người dùng | `view_users` | ❌ | ❌ | ✅ | ✅ |
| Sửa người dùng | `edit_users` | ❌ | ❌ | ✅ | ✅ |
| Xóa người dùng | `delete_users` | ❌ | ❌ | ❌ | ✅ |
| Quản lý vai trò | `manage_roles` | ❌ | ❌ | ✅ | ✅ |
| Tạm ngưng tài khoản | `suspend_users` | ❌ | ❌ | ✅ | ✅ |

### 2. Blog Management (Quản Lý Blog)

| Quyền | Code | User | Moderator | Admin | Super Admin |
|-------|------|------|-----------|-------|-------------|
| Tạo bài viết | `create_post` | ✅ | ✅ | ✅ | ✅ |
| Sửa bài viết của mình | `edit_own_post` | ✅ | ✅ | ✅ | ✅ |
| Sửa bất kỳ bài viết | `edit_any_post` | ❌ | ✅ | ✅ | ✅ |
| Xóa bài viết của mình | `delete_own_post` | ✅ | ✅ | ✅ | ✅ |
| Xóa bất kỳ bài viết | `delete_any_post` | ❌ | ❌ | ✅ | ✅ |
| Xuất bản bài viết | `publish_post` | ❌ | ✅ | ✅ | ✅ |
| Lên lịch bài viết | `schedule_post` | ❌ | ✅ | ✅ | ✅ |

### 3. Administration (Quản Trị)

| Quyền | Code | User | Moderator | Admin | Super Admin |
|-------|------|------|-----------|-------|-------------|
| Xem nhật ký admin | `view_admin_logs` | ❌ | ❌ | ✅ | ✅ |
| Quản lý phân quyền | `manage_permissions` | ❌ | ❌ | ❌ | ✅ |
| Xem thống kê | `view_analytics` | ❌ | ❌ | ✅ | ✅ |
| Quản lý danh mục | `manage_categories` | ❌ | ❌ | ✅ | ✅ |
| Quản lý tags | `manage_tags` | ❌ | ❌ | ✅ | ✅ |

### 4. Moderation (Kiểm Duyệt)

| Quyền | Code | User | Moderator | Admin | Super Admin |
|-------|------|------|-----------|-------|-------------|
| Kiểm duyệt bình luận | `moderate_comments` | ❌ | ✅ | ✅ | ✅ |
| Xóa bình luận | `delete_comments` | ❌ | ✅ | ✅ | ✅ |

---

## Các Trang Admin

### Cấu Trúc URL

```
/admin                          # Dashboard chính
├── /admin/users               # Quản lý người dùng
├── /admin/permissions         # Quản lý phân quyền ⭐
├── /admin/posts               # Quản lý bài viết
├── /admin/projects            # Quản lý dự án
├── /admin/tokens              # Quản lý tokens
├── /admin/rewards             # Quản lý phần thưởng
├── /admin/config              # Cấu hình hệ thống
├── /admin/health              # Kiểm tra sức khỏe
└── /admin/monitoring          # Giám sát hệ thống
```

### Trang Quản Lý Phân Quyền (`/admin/permissions`)

**URL**: `https://app.ncskit.org/admin/permissions`

**Chức năng chính:**

1. **Tab "Quyền theo Vai trò"**
   - Chọn vai trò để xem quyền
   - Cấp/Thu hồi quyền từng cái
   - Chỉnh sửa hàng loạt

2. **Tab "Ma trận Quyền"**
   - Xem tổng quan tất cả quyền
   - So sánh quyền giữa các vai trò
   - Thống kê số lượng quyền

3. **Tab "Nhật ký Thay đổi"**
   - Xem lịch sử thay đổi quyền
   - Ai thay đổi, khi nào, thay đổi gì
   - Chi tiết từng thay đổi

**Tính năng:**
- ✅ Cấp/Thu hồi quyền real-time
- ✅ Chỉnh sửa hàng loạt
- ✅ Chọn tất cả theo danh mục
- ✅ Cache tự động invalidate
- ✅ Audit log đầy đủ
- ✅ UI trực quan với màu sắc

---

## Kiểm Tra Quyền

### 1. Kiểm Tra Vai Trò (Role Check)

**File**: `frontend/src/lib/auth-utils.ts`

```typescript
import { isAdmin, isSuperAdmin, isModerator } from '@/lib/auth-utils'

// Kiểm tra admin (admin, moderator, super_admin)
if (isAdmin(user)) {
  // Cho phép truy cập admin panel
}

// Kiểm tra super admin
if (isSuperAdmin(user)) {
  // Cho phép quản lý phân quyền
}

// Kiểm tra moderator trở lên
if (isModerator(user)) {
  // Cho phép kiểm duyệt
}
```

### 2. Protected Route

**File**: `frontend/src/components/auth/protected-route.tsx`

```typescript
<ProtectedRoute requireAdmin={true}>
  {/* Nội dung chỉ admin mới thấy */}
</ProtectedRoute>
```

**Cách hoạt động:**
1. Check `isAuthenticated` - Nếu chưa đăng nhập → redirect `/auth/login`
2. Check `requireAdmin` - Nếu không phải admin → redirect `/dashboard`
3. Hiển thị loading spinner khi đang check
4. Render children khi pass tất cả checks

### 3. Admin Layout

**File**: `frontend/src/app/(dashboard)/admin/layout.tsx`

```typescript
export default function AdminLayout({ children }) {
  return (
    <ProtectedRoute requireAdmin={true}>
      <div className="admin-panel">
        {children}
      </div>
    </ProtectedRoute>
  )
}
```

**Tất cả trang trong `/admin/*` tự động được bảo vệ**

### 4. Sidebar Menu

**File**: `frontend/src/components/layout/sidebar.tsx`

```typescript
const isAdmin = checkIsAdmin(user)

{isAdmin && (
  <div className="admin-section">
    <Link href="/admin">Admin Dashboard</Link>
    <Link href="/admin/users">Manage Users</Link>
    {/* ... */}
  </div>
)}
```

**Menu admin chỉ hiển thị khi user có quyền admin**

---

## Hướng Dẫn Sử Dụng

### Cách Truy Cập Admin Panel

1. **Đăng nhập** với tài khoản admin
2. **Kiểm tra vai trò** trong sidebar (có badge "admin", "moderator", etc.)
3. **Click vào "Admin"** trong sidebar hoặc header
4. **Chọn chức năng** cần quản lý

### Cách Quản Lý Phân Quyền

#### A. Cấp Quyền Cho Vai Trò

1. Vào `/admin/permissions`
2. Tab "Quyền theo Vai trò"
3. Chọn vai trò cần cấp quyền
4. Click "Cấp quyền" bên cạnh quyền muốn cấp
5. Hệ thống tự động:
   - Cập nhật database
   - Xóa cache
   - Ghi audit log

#### B. Chỉnh Sửa Hàng Loạt

1. Vào `/admin/permissions`
2. Tab "Quyền theo Vai trò"
3. Click "✏️ Chỉnh sửa hàng loạt"
4. Modal mở ra với tất cả quyền
5. Chọn/Bỏ chọn quyền:
   - Click từng checkbox
   - Hoặc "Chọn tất cả" theo danh mục
6. Click "Lưu thay đổi"

#### C. Xem Ma Trận Quyền

1. Vào `/admin/permissions`
2. Tab "Ma trận Quyền"
3. Xem bảng so sánh:
   - Hàng: Các quyền
   - Cột: Các vai trò
   - ✓ = Có quyền
   - ✗ = Không có quyền

#### D. Xem Nhật Ký

1. Vào `/admin/permissions`
2. Tab "Nhật ký Thay đổi"
3. Xem lịch sử:
   - Ai thay đổi
   - Thay đổi gì
   - Khi nào
   - Chi tiết thay đổi

### Cách Xóa Cache

**Tự động**: Cache tự động xóa khi cập nhật quyền

**Thủ công**:
1. Vào `/admin/permissions`
2. Click "🔄 Xóa Cache" ở góc trên bên phải
3. Hệ thống xóa cache và reload data

---

## Troubleshooting

### Vấn Đề 1: Không Thấy Menu Admin

**Nguyên nhân:**
- User không có role admin/moderator/super_admin
- Role chưa được set trong database

**Giải pháp:**
```sql
-- Kiểm tra role của user
SELECT id, email, role FROM profiles WHERE email = 'your@email.com';

-- Cập nhật role
UPDATE profiles SET role = 'admin' WHERE email = 'your@email.com';
```

### Vấn Đề 2: Bị Redirect Khi Vào /admin

**Nguyên nhân:**
- `isAdmin()` function return false
- Role không match với ['super_admin', 'admin', 'moderator']

**Giải pháp:**
1. Check role trong database
2. Check `auth-utils.ts` function
3. Thêm email vào fallback list nếu cần

### Vấn Đề 3: Quyền Không Cập Nhật

**Nguyên nhân:**
- Cache chưa được xóa
- Database chưa cập nhật

**Giải pháp:**
1. Click "🔄 Xóa Cache"
2. Reload trang
3. Check database:
```sql
SELECT * FROM role_permissions WHERE role = 'admin';
```

### Vấn Đề 4: Trang Load Chậm

**Nguyên nhân:**
- Load quá nhiều data
- Không có cache

**Giải pháp:**
- Cache đã được implement
- Nếu vẫn chậm, check network tab
- Optimize query nếu cần

---

## Database Schema

### Table: `profiles`

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE,
  full_name TEXT,
  role TEXT DEFAULT 'user', -- 'user', 'moderator', 'admin', 'super_admin'
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Table: `role_permissions`

```sql
CREATE TABLE role_permissions (
  id UUID PRIMARY KEY,
  role TEXT NOT NULL, -- 'user', 'moderator', 'admin', 'super_admin'
  permission TEXT NOT NULL, -- 'view_users', 'edit_users', etc.
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(role, permission)
);
```

### Table: `admin_logs`

```sql
CREATE TABLE admin_logs (
  id UUID PRIMARY KEY,
  admin_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  target_type TEXT,
  details JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## API Endpoints

### Permission Service

**Base**: `frontend/src/services/permission.service.ts`

```typescript
// Get permissions for a role
await permissionService.getRolePermissions('admin')

// Update role permissions
await permissionService.updateRolePermissions(
  'admin',
  [Permission.VIEW_USERS, Permission.EDIT_USERS],
  adminId
)

// Check if user has permission
await permissionService.checkPermission(userId, Permission.VIEW_USERS)

// Invalidate cache
permissionService.invalidateCache('role:admin')
```

---

## Security Best Practices

### 1. Luôn Check Quyền Ở Backend

```typescript
// ❌ BAD - Chỉ check frontend
if (isAdmin(user)) {
  deleteUser(userId)
}

// ✅ GOOD - Check cả backend
if (isAdmin(user)) {
  await api.deleteUser(userId) // Backend sẽ check lại quyền
}
```

### 2. Sử Dụng RLS (Row Level Security)

```sql
-- Chỉ admin mới xem được tất cả users
CREATE POLICY "Admins can view all users"
  ON profiles FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role IN ('admin', 'super_admin')
    )
  );
```

### 3. Audit Log Mọi Thay Đổi

```typescript
// Tự động log khi cập nhật quyền
await permissionService.updateRolePermissions(role, permissions, adminId)
// → Tự động ghi vào admin_logs
```

### 4. Cache Invalidation

```typescript
// Cache tự động invalidate khi update
await permissionService.updateRolePermissions(...)
// → Cache bị xóa
// → Lần fetch tiếp theo sẽ lấy data mới
```

---

## Checklist Kiểm Tra Hệ Thống

### ✅ Kiểm Tra Cơ Bản

- [ ] User có role admin có thể vào `/admin`
- [ ] User thường không thể vào `/admin`
- [ ] Menu admin chỉ hiển thị cho admin
- [ ] Protected routes hoạt động đúng

### ✅ Kiểm Tra Phân Quyền

- [ ] Trang `/admin/permissions` load được
- [ ] Hiển thị đúng quyền cho từng role
- [ ] Cấp quyền hoạt động
- [ ] Thu hồi quyền hoạt động
- [ ] Chỉnh sửa hàng loạt hoạt động
- [ ] Ma trận quyền hiển thị đúng

### ✅ Kiểm Tra Cache

- [ ] Cache được tạo khi load permissions
- [ ] Cache được xóa khi update permissions
- [ ] Nút "Xóa Cache" hoạt động
- [ ] Data refresh sau khi xóa cache

### ✅ Kiểm Tra Audit Log

- [ ] Audit log được ghi khi cập nhật quyền
- [ ] Hiển thị đúng thông tin admin
- [ ] Hiển thị đúng thời gian
- [ ] Chi tiết thay đổi đầy đủ

---

## Liên Hệ

Nếu có vấn đề về hệ thống admin hoặc phân quyền:

1. Check documentation này trước
2. Check console logs
3. Check database
4. Liên hệ team dev

---

**Last Updated:** 2024-01-11
**Version:** 1.0.0
