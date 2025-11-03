# Database Setup Guide

## 🚀 Quick Setup

### 1. Truy cập Supabase Dashboard
- Đi đến: https://ujcsqwegzchvsxigydcl.supabase.co
- Đăng nhập vào dashboard

### 2. Khởi tạo Database Schema
1. Vào **SQL Editor** trong Supabase dashboard
2. Copy nội dung file `schema.sql` và paste vào editor
3. Click **Run** để tạo tất cả tables và policies

### 3. Thêm Sample Data (Optional)
1. Trong **SQL Editor**, copy nội dung file `seed.sql`
2. Click **Run** để thêm sample data

### 4. Cấu hình Authentication
1. Vào **Authentication** > **Providers**
2. Bật **Google OAuth**:
   - Client ID: (cần có từ Google Console)
   - Client Secret: (cần có từ Google Console)
3. Bật **LinkedIn OAuth** (nếu cần)

### 5. Cấu hình RLS (Row Level Security)
- Tất cả policies đã được tạo trong schema.sql
- Kiểm tra trong **Authentication** > **Policies**

## 📊 Database Schema Overview

### Core Tables:
- **users**: User profiles và preferences
- **projects**: Research projects
- **project_collaborators**: Project team members
- **documents**: Project documents và manuscripts
- **references**: Research references và citations
- **milestones**: Project milestones và deadlines
- **activities**: User activity tracking

### Key Features:
- **UUID Primary Keys**: Tất cả tables sử dụng UUID
- **Row Level Security**: Bảo mật data theo user
- **Automatic Timestamps**: created_at và updated_at tự động
- **JSONB Fields**: Flexible metadata storage
- **Foreign Key Constraints**: Data integrity
- **Indexes**: Optimized performance

## 🔐 Security Features

### Row Level Security Policies:
- Users chỉ xem được data của mình
- Project owners có full control
- Collaborators có limited access theo role
- Activities được track theo user

### Authentication:
- Supabase Auth integration
- OAuth providers (Google, LinkedIn)
- JWT tokens
- Session management

## 🧪 Testing Data

Sau khi chạy seed.sql, bạn sẽ có:
- 3 sample users
- 3 sample projects với different phases
- Sample documents, references, milestones
- Sample activities cho dashboard

## 📝 Environment Variables

Đảm bảo file `.env.local` có:
```
NEXT_PUBLIC_SUPABASE_URL=https://ujcsqwegzchvsxigydcl.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqY3Nxd2VnemNodnN4aWd5ZGNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxNzcyMjcsImV4cCI6MjA3Nzc1MzIyN30.XmS0K4v1L2HIx6puTfdjroOy2cPxmIZDwZQ98aaLe6o
```

## 🔧 Troubleshooting

### Common Issues:
1. **RLS Policies**: Nếu không thể access data, check RLS policies
2. **Auth Callback**: Đảm bảo redirect URL đúng trong Supabase settings
3. **CORS**: Thêm domain vào allowed origins nếu cần

### Useful SQL Queries:
```sql
-- Check user count
SELECT COUNT(*) FROM users;

-- Check projects per user
SELECT u.email, COUNT(p.id) as project_count 
FROM users u 
LEFT JOIN projects p ON u.id = p.owner_id 
GROUP BY u.id, u.email;

-- Check recent activities
SELECT a.*, u.email, p.title 
FROM activities a 
JOIN users u ON a.user_id = u.id 
LEFT JOIN projects p ON a.project_id = p.id 
ORDER BY a.created_at DESC 
LIMIT 10;
```