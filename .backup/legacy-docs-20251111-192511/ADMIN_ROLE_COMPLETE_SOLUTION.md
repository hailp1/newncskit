# 🔧 Admin Role - Complete Solution

## ⚠️ Current Problem

After logout and login, admin button still not showing.

**Root Cause:** Database role is NOT "admin" yet.

---

## ✅ Solution Options

### Option 1: Use Debug Page API (Easiest)

1. **Go to debug page:**
   ```
   http://localhost:3000/debug-session
   ```

2. **Click "Fix Role to Admin" button**
   - If shows "User not found" → Click "Create Admin Account"

3. **Logout and login again**

---

### Option 2: Direct SQL Update

1. **Open PostgreSQL:**
   ```bash
   # Windows: Open pgAdmin or psql
   psql -U postgres -d ncskit
   ```

2. **Run SQL:**
   ```sql
   UPDATE users 
   SET role = 'admin', 
       account_status = 'active'
   WHERE email = 'phuchai.le@gmail.com';
   
   -- Verify
   SELECT email, role FROM users WHERE email = 'phuchai.le@gmail.com';
   ```

3. **Logout and login**

---

### Option 3: Check Database Connection

If database not connecting:

1. **Check PostgreSQL is running:**
   ```
   Windows: services.msc → Find PostgreSQL → Start
   ```

2. **Check DATABASE_URL in .env.local:**
   ```
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ncskit
   ```

3. **Test connection:**
   ```bash
   cd frontend
   npx prisma db push
   ```

---

## 🔍 Debug Steps

### Step 1: Check Debug Page

```
URL: http://localhost:3000/debug-session
```

**Look for:**
- NextAuth Role: Should show current role
- Auth Store Role: Should match NextAuth
- Is Admin: Should be YES after fix

### Step 2: Check Console

Press F12 → Console tab

**Look for errors:**
- Database connection errors
- Prisma errors
- Auth errors

### Step 3: Check Database

**Option A: Using pgAdmin**
1. Open pgAdmin
2. Connect to ncskit database
3. Run query:
   ```sql
   SELECT * FROM users WHERE email = 'phuchai.le@gmail.com';
   ```
4. Check role column

**Option B: Using psql**
```bash
psql -U postgres -d ncskit
\dt  # List tables
SELECT email, role FROM users WHERE email = 'phuchai.le@gmail.com';
```

---

## 🎯 Most Likely Issues

### Issue 1: Database Not Running

**Symptom:**
```
Cannot fetch data from service
```

**Solution:**
1. Start PostgreSQL service
2. Verify DATABASE_URL
3. Test with `npx prisma studio`

### Issue 2: User Doesn't Exist

**Symptom:**
```
User not found
```

**Solution:**
1. Go to debug page
2. Click "Create Admin Account"
3. Login with credentials shown

### Issue 3: Role Not Updating

**Symptom:**
- Database shows role = "admin"
- Frontend still shows "user"

**Solution:**
1. Hard refresh: Ctrl + Shift + R
2. Clear cookies
3. Logout and login again
4. Check browser console for errors

---

## 🚀 Recommended Flow

### Step 1: Start PostgreSQL

```bash
# Windows
services.msc
# Find PostgreSQL → Right click → Start
```

### Step 2: Verify Database

```bash
cd frontend
npx prisma studio
# Opens GUI at http://localhost:5555
# Check users table → Find your email → Check role
```

### Step 3: Update Role (if needed)

**In Prisma Studio:**
1. Click on users table
2. Find phuchai.le@gmail.com
3. Edit role to "admin"
4. Save

**Or use SQL file:**
```bash
psql -U postgres -d ncskit -f UPDATE_ADMIN_ROLE.sql
```

### Step 4: Logout & Login

```
1. Logout from app
2. Login: http://localhost:3000/login
3. Check header for admin button
```

---

## ✅ Success Checklist

After fix:
- [ ] PostgreSQL is running
- [ ] Database has user with email phuchai.le@gmail.com
- [ ] User role = "admin" in database
- [ ] Logged out and logged in again
- [ ] Debug page shows role = "admin"
- [ ] Header shows admin dropdown
- [ ] Can access /admin page

---

## 📝 Quick Commands

```bash
# Check if PostgreSQL is running
Get-Service -Name postgresql*

# Start PostgreSQL
Start-Service postgresql-x64-14  # Adjust version

# Open Prisma Studio
cd frontend
npx prisma studio

# Test database connection
npx prisma db push

# Check user in database
psql -U postgres -d ncskit -c "SELECT email, role FROM users WHERE email = 'phuchai.le@gmail.com';"
```

---

## 🎊 Final Solution

**The simplest way:**

1. **Start PostgreSQL** (if not running)
2. **Open Prisma Studio:** `npx prisma studio`
3. **Edit user role** to "admin"
4. **Logout and login**
5. **Done!** ✅

---

## 📞 Still Not Working?

If admin button still not showing after all steps:

1. **Share debug page screenshot**
2. **Share console errors** (F12 → Console)
3. **Share database query result:**
   ```sql
   SELECT * FROM users WHERE email = 'phuchai.le@gmail.com';
   ```

This will help identify the exact issue.
