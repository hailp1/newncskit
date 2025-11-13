# Admin Issues Troubleshooting Guide

## Overview

This guide consolidates all admin-related issues and solutions for the NCSKit application. It covers role management, authentication, and access control problems.

---

## Table of Contents

1. [Admin Account Setup](#admin-account-setup)
2. [Common Issues](#common-issues)
3. [Role Management](#role-management)
4. [Session & Authentication](#session--authentication)
5. [Debug Tools](#debug-tools)
6. [Database Operations](#database-operations)

---

## Admin Account Setup

### Default Admin Account

| Field | Value |
|-------|-------|
| **Email** | phuchai.le@gmail.com |
| **Password** | Admin123 |
| **Role** | admin |
| **Status** | active |
| **Subscription** | premium |

### Login Instructions

1. Navigate to: `http://localhost:3000/login`
2. Enter credentials above
3. After login, admin links should appear in header dropdown

### Expected Admin Privileges

- ✅ Access to `/admin` panel
- ✅ User management capabilities
- ✅ System settings access
- ✅ Premium features unlocked
- ✅ Unlimited projects, datasets, and analyses

---

## Common Issues

### Issue 1: Admin Button Not Showing After Login

**Symptoms:**
- Logged in successfully
- Role shows "user" instead of "admin"
- No admin links in header dropdown

**Root Cause:**
Session token cached with old role data

**Solution A: Use Incognito Mode (Fastest)**

1. Open incognito window: `Ctrl + Shift + N`
2. Navigate to `http://localhost:3000/login`
3. Login with admin credentials
4. Admin button should appear ✅

**Solution B: Clear Browser Data**

1. Press `Ctrl + Shift + Delete`
2. Select "Cookies and other site data"
3. Select "Cached images and files"
4. Time range: "All time"
5. Click "Clear data"
6. Close all browser tabs
7. Login again

**Solution C: Force Logout**

1. Navigate to `http://localhost:3000/force-logout`
2. Page will automatically:
   - Logout from NextAuth
   - Clear all cookies
   - Clear localStorage
   - Redirect to login page
3. Login again with admin credentials

---

### Issue 2: Database Role Not Set to Admin

**Symptoms:**
- Debug page shows role = "authenticated" or "user"
- Database query shows incorrect role

**Solution: Update Database Role**

**Option 1: Using Prisma Studio (GUI)**

```bash
cd frontend
npx prisma studio
```

1. Opens at `http://localhost:5555`
2. Click on `users` table
3. Find user by email: `phuchai.le@gmail.com`
4. Edit `role` field to `admin`
5. Edit `status` field to `active`
6. Save changes
7. Logout and login again

**Option 2: Using SQL**

```sql
UPDATE users 
SET role = 'admin', 
    status = 'active'
WHERE email = 'phuchai.le@gmail.com';

-- Verify
SELECT email, role, status FROM users 
WHERE email = 'phuchai.le@gmail.com';
```

**Option 3: Using Debug API**

1. Navigate to `http://localhost:3000/debug-session`
2. Click "Fix Role to Admin" button
3. If user not found, click "Create Admin Account"
4. Logout and login again

---

### Issue 3: Cannot Access Admin Pages

**Symptoms:**
- Redirected when accessing `/admin`
- "Access Denied" message
- Protected route blocks access

**Diagnostic Steps:**

1. **Check Authentication Status**
   ```
   Navigate to: http://localhost:3000/debug-session
   
   Verify:
   - Status: "authenticated"
   - Role: "admin"
   - Is Admin: YES
   ```

2. **Check Database**
   ```bash
   cd frontend
   node -e "const {PrismaClient}=require('@prisma/client');const p=new PrismaClient();p.user.findUnique({where:{email:'phuchai.le@gmail.com'}}).then(u=>console.log('Role:',u.role)).finally(()=>p.\$disconnect())"
   ```
   
   Expected output: `Role: admin`

3. **Check Browser Console**
   - Press `F12`
   - Go to Console tab
   - Look for authentication errors

**Solutions:**

- If database role is wrong → Use Issue 2 solutions
- If session is wrong → Use Issue 1 solutions
- If still blocked → Check `frontend/src/lib/auth-utils.ts` for role validation logic

---

### Issue 4: Database Connection Errors

**Symptoms:**
```
Cannot fetch data from service
Error: P1001: Can't reach database server
```

**Solutions:**

1. **Check PostgreSQL Service**
   ```bash
   # Windows
   services.msc
   # Find "PostgreSQL" and ensure it's running
   ```

2. **Verify DATABASE_URL**
   
   Check `frontend/.env.local`:
   ```
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ncskit
   ```

3. **Test Connection**
   ```bash
   cd frontend
   npx prisma db push
   ```

---

### Issue 5: Session Not Syncing

**Symptoms:**
- NextAuth shows role = "admin"
- Auth Store shows role = "user" or null
- Inconsistent state between systems

**Solution:**

1. Hard refresh browser: `Ctrl + Shift + R`
2. Clear cookies and login again
3. Check console for sync errors
4. Verify `SessionSync` component is working in `frontend/src/components/auth/session-provider-wrapper.tsx`

---

## Role Management

### Role Hierarchy

| Role | Level | Permissions |
|------|-------|-------------|
| **user** | 1 | Basic access |
| **moderator** | 2 | Content moderation |
| **admin** | 3 | Full admin access |
| **super_admin** | 4 | System administration |

### Checking User Role

**Method 1: Debug Page**
```
URL: http://localhost:3000/debug-session
```

**Method 2: Database Query**
```sql
SELECT email, role, status FROM users WHERE email = 'your@email.com';
```

**Method 3: Prisma Studio**
```bash
cd frontend
npx prisma studio
# Navigate to users table
```

### Updating User Role

See [Issue 2: Database Role Not Set to Admin](#issue-2-database-role-not-set-to-admin)

---

## Session & Authentication

### How NextAuth Session Works

```
Login → NextAuth reads user from database
         ↓
Database has role = "admin"
         ↓
NextAuth creates JWT token with role = "admin"
         ↓
Token stored in encrypted cookie
         ↓
Frontend reads role from token
         ↓
isAdmin(user) returns true
         ↓
Admin links appear in header
```

### Why Logout/Login is Required After Role Change

```
Before Logout:
Database: role = "admin" ✅
Session Token (cookie): role = "user" ❌ (cached)
Frontend: Shows "user" ❌

After Logout & Login:
Database: role = "admin" ✅
Old session: DELETED ✅
Cookies: CLEARED ✅
New session: role = "admin" ✅
Frontend: Shows "admin" ✅
```

### Session Debugging

1. **Check NextAuth Session**
   ```
   URL: http://localhost:3000/debug-session
   ```

2. **Check Cookies**
   - Press `F12`
   - Go to Application tab
   - Click Cookies → localhost:3000
   - Look for `next-auth.session-token`

3. **Check Auth Store**
   - Debug page shows both NextAuth and Auth Store state
   - Both should match

---

## Debug Tools

### Debug Session Page

**URL:** `http://localhost:3000/debug-session`

**Features:**
- ✅ Display NextAuth session data
- ✅ Display Auth Store state
- ✅ Check admin role status
- ✅ Compare both authentication systems
- ✅ Fix role button (if needed)
- ✅ Manual logout button

### Force Logout Page

**URL:** `http://localhost:3000/force-logout`

**Auto-performs:**
1. Logout from NextAuth
2. Clear all cookies
3. Clear localStorage
4. Redirect to login page

### Admin Management Scripts

**Check Admin Account:**
```bash
cd frontend
node scripts/check-admin.js
```

**Fix Admin Role:**
```bash
cd frontend
node scripts/fix-admin-role.js
```

**Create Admin User:**
```bash
cd frontend
node scripts/create-admin.js
```

---

## Database Operations

### View User Data

**Using Prisma Studio (Recommended):**
```bash
cd frontend
npm run db:studio
# Opens at http://localhost:5555
```

**Using psql:**
```bash
psql -U postgres -d ncskit
SELECT * FROM users WHERE email = 'phuchai.le@gmail.com';
```

### Update User Role

```sql
UPDATE users 
SET role = 'admin', 
    status = 'active',
    email_verified = true
WHERE email = 'phuchai.le@gmail.com';
```

### Clear Old Sessions

```sql
DELETE FROM sessions WHERE user_id IN (
  SELECT id FROM users WHERE email = 'phuchai.le@gmail.com'
);
```

### Create Admin User

```sql
INSERT INTO users (
  email, 
  password, 
  full_name, 
  role, 
  status, 
  email_verified,
  subscription_type,
  token_balance
) VALUES (
  'admin@example.com',
  '[hashed_password]',  -- Use bcrypt to hash
  'Admin User',
  'admin',
  'active',
  true,
  'premium',
  10000
);
```

---

## Permission System

### Role-Based Access Control (RBAC)

The system uses RBAC with the following structure:

**Admin Check Function:**
```typescript
// frontend/src/lib/auth-utils.ts
export function isAdmin(user: any): boolean {
  return ['super_admin', 'admin', 'moderator'].includes(user?.role)
}

export function isSuperAdmin(user: any): boolean {
  return user?.role === 'super_admin'
}

export function isModerator(user: any): boolean {
  return ['super_admin', 'admin', 'moderator'].includes(user?.role)
}
```

**Protected Route Component:**
```typescript
<ProtectedRoute requireAdmin={true}>
  {/* Admin-only content */}
</ProtectedRoute>
```

**Admin Layout:**
All pages under `/admin/*` are automatically protected by the admin layout wrapper.

---

## Verification Checklist

After fixing admin issues, verify:

- [ ] Can login with admin credentials
- [ ] Debug page shows role = "admin"
- [ ] Debug page shows "Is Admin: YES"
- [ ] Header dropdown has "Admin Panel" link
- [ ] Header dropdown has "Cài đặt Admin" link
- [ ] Can access `/admin` page without redirect
- [ ] No console errors (F12 → Console)
- [ ] Account page shows role = "admin"
- [ ] Database shows correct role

---

## Quick Reference Commands

```bash
# Start PostgreSQL (Windows)
services.msc  # Find PostgreSQL → Start

# Open Prisma Studio
cd frontend
npx prisma studio

# Test database connection
npx prisma db push

# Check admin account
node scripts/check-admin.js

# Fix admin role
node scripts/fix-admin-role.js

# Create admin user
node scripts/create-admin.js

# Start dev server
npm run dev
```

---

## Related Documentation

- [Local Setup Guide](../setup/local-setup.md)
- [Authentication Guide](./authentication.md)
- [Database Setup](../../DATABASE_SETUP_GUIDE.md)
- [Admin System Guide](../../ADMIN_SYSTEM_GUIDE.md)

---

## Support

If issues persist after trying all solutions:

1. Check PostgreSQL is running
2. Verify DATABASE_URL in `.env.local`
3. Check browser console for errors (F12)
4. Check network tab for failed API calls
5. Review server logs in terminal

---

**Last Updated:** November 11, 2025
**Status:** Consolidated from 13 admin fix documents
# Admin Issues Troubleshooting

This guide consolidates solutions for common admin panel issues.

## Admin Button Not Appearing

### Problem
Admin button doesn't show in header after login, even though user has admin role in database.

### Root Causes
1. **Wrong authentication system**: Using Supabase auth instead of NextAuth
2. **Database role mismatch**: Role in database doesn't match session role
3. **Session not refreshed**: Old session cached with wrong role
4. **Missing NextAuth API route**: `/api/auth/[...nextauth]/route.ts` not configured

### Solutions

#### 1. Verify Database Role
Check user role in database:
```sql
SELECT id, email, role FROM users WHERE email = 'your-email@example.com';
```

Role should be `admin` or `super_admin`, not `authenticated`.

#### 2. Clear Sessions and Re-login
```sql
-- Clear all sessions
DELETE FROM sessions;
```

Then logout and login again with correct credentials.

#### 3. Verify NextAuth Configuration
Ensure `/api/auth/[...nextauth]/route.ts` exists and is properly configured:
```typescript
import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth'

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
```

#### 4. Check Session in Browser
Open browser console and check:
```javascript
// Check session
fetch('/api/auth/session').then(r => r.json()).then(console.log)
```

Session should include `user.role` field.

#### 5. Force Refresh Auth
If using force-refresh-auth middleware, ensure it's not calling Supabase:
```typescript
// WRONG - causes timeouts
const supabase = createClient()
await supabase.auth.getSession()

// RIGHT - use NextAuth only
const session = await getServerSession(authOptions)
```

## Admin Panel Access Denied

### Problem
User can see admin button but gets "Access Denied" when clicking.

### Solutions

1. **Check Permissions**: Verify user has required permissions in database
2. **Check Middleware**: Ensure middleware allows admin routes
3. **Check Role-Based Access**: Verify role checking logic in admin components

## Admin Features Not Working

### Problem
Admin features like user management, role assignment don't work.

### Solutions

1. **Check API Routes**: Ensure admin API routes exist and are protected
2. **Check Database Schema**: Verify tables for admin features exist
3. **Check Permissions Service**: Ensure permission checking works correctly

## Performance Issues in Admin Panel

### Problem
Admin pages load very slowly (30-60 seconds).

### Root Cause
- Supabase calls in middleware causing timeouts
- Too many database queries
- Missing indexes

### Solutions

1. **Remove Supabase from Middleware**: Use NextAuth only
2. **Add Database Indexes**: Index frequently queried columns
3. **Implement Caching**: Cache permission checks and user data
4. **Optimize Queries**: Use Prisma's `select` to fetch only needed fields

## Related Documentation

- [Authentication Issues](./authentication.md)
- [Performance Issues](./performance.md)
- [Supabase to NextAuth Migration](../migration/supabase-to-nextauth.md)
