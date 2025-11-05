# 🔑 NCSKIT Admin Setup Guide

## 👤 **Super Admin Accounts**

### **Primary Admin Account**
```
Email: admin@ncskit.com
Password: admin123
Role: super_admin
Token Balance: 10,000
```

### **Backup Admin Account**
```
Email: superadmin@ncskit.com
Password: SuperAdmin2024!
Role: super_admin
Token Balance: 10,000
```

---

## 🚀 **Setup Instructions**

### **Step 1: Create Auth Users in Supabase**

1. **Go to Supabase Dashboard**
   - Navigate to your project
   - Go to `Authentication` → `Users`

2. **Create Primary Admin**
   - Click `Add user`
   - Email: `admin@ncskit.com`
   - Password: `admin123`
   - ✅ Check `Auto Confirm User`
   - Click `Create user`
   - **Copy the User ID (UUID)**

3. **Create Backup Admin**
   - Click `Add user`
   - Email: `superadmin@ncskit.com`
   - Password: `SuperAdmin2024!`
   - ✅ Check `Auto Confirm User`
   - Click `Create user`
   - **Copy the User ID (UUID)**

### **Step 2: Update SQL Script**

1. **Open:** `frontend/database/create-super-admin.sql`
2. **Replace placeholders:**
   - Replace `ADMIN_USER_ID` with primary admin UUID
   - Replace `BACKUP_ADMIN_USER_ID` with backup admin UUID

### **Step 3: Run SQL Script**

1. **Go to Supabase Dashboard**
2. **Navigate to:** `SQL Editor`
3. **Paste and run:** `create-super-admin.sql`
4. **Verify:** Check the verification queries at the end

---

## 🔐 **Admin Permissions**

Super Admins have access to:

### **Admin Dashboard** (`/admin`)
- ✅ User Management
- ✅ Project Oversight
- ✅ Content Management
- ✅ Token System
- ✅ Permissions Control
- ✅ Rewards System
- ✅ System Logs

### **Special Permissions**
- ✅ `admin.users.manage` - Manage all users
- ✅ `admin.projects.manage` - Manage all projects
- ✅ `admin.posts.manage` - Manage content
- ✅ `admin.tokens.manage` - Manage token system
- ✅ `admin.permissions.manage` - Manage permissions
- ✅ `admin.rewards.manage` - Manage rewards
- ✅ `admin.system.manage` - System administration
- ✅ `ai.unlimited` - Unlimited AI usage

---

## 🧪 **Testing Admin Access**

### **Login Test**
1. Go to: `https://your-domain.vercel.app/login`
2. Login with: `admin@ncskit.com` / `admin123`
3. Should redirect to dashboard

### **Admin Panel Test**
1. Go to: `https://your-domain.vercel.app/admin`
2. Should see admin dashboard
3. Test all admin functions:
   - Users management
   - Projects overview
   - Token system
   - Permissions
   - Content management

---

## 🔧 **Troubleshooting**

### **Can't Login?**
- ✅ Check user exists in Supabase Auth
- ✅ Check email is confirmed
- ✅ Check password is correct
- ✅ Check environment variables are set

### **No Admin Access?**
- ✅ Check user profile exists in `users` table
- ✅ Check `role` is set to `super_admin`
- ✅ Check permissions are granted
- ✅ Check `status` is `active`

### **Admin Panel Not Loading?**
- ✅ Check database connection
- ✅ Check all tables exist
- ✅ Check admin permissions
- ✅ Check browser console for errors

---

## 📊 **Verification Queries**

Run these in Supabase SQL Editor to verify setup:

```sql
-- Check admin users
SELECT id, email, full_name, role, status, token_balance 
FROM users WHERE role = 'super_admin';

-- Check admin permissions
SELECT u.email, p.permission 
FROM users u 
JOIN permissions p ON u.id = p.user_id 
WHERE u.role = 'super_admin';

-- Check admin logs
SELECT * FROM admin_logs 
WHERE action = 'admin_created' 
ORDER BY created_at DESC;
```

---

## 🎉 **Success!**

Once setup is complete, you'll have:
- ✅ 2 Super Admin accounts
- ✅ Full admin panel access
- ✅ All permissions granted
- ✅ 10,000 tokens each
- ✅ System administration capabilities

**🔐 Keep these credentials secure!**

---

## 🚨 **Security Notes**

1. **Change default passwords** after first login
2. **Use strong passwords** in production
3. **Enable 2FA** if available
4. **Limit admin access** to trusted users only
5. **Monitor admin logs** regularly
6. **Backup admin accounts** regularly

**🛡️ Admin security is critical for your platform!**