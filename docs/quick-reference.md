# 🚀 Quick Reference - Admin Access

## ✅ Current Status

**Database:** Role = "admin" ✅
**Solution:** Login in Incognito ✅

---

## 🎯 Quick Steps

```
1. Ctrl + Shift + N
2. http://localhost:3000/login
3. phuchai.le@gmail.com / Admin123
4. Check header → Admin button ✅
```

---

## 📝 Credentials

```
Email: phuchai.le@gmail.com
Password: Admin123
Role: admin
```

---

## 🔗 Important URLs

```
Login:        http://localhost:3000/login
Account:      http://localhost:3000/account
Admin:        http://localhost:3000/admin
Debug:        http://localhost:3000/debug-session
Force Logout: http://localhost:3000/force-logout
```

---

## 🛠️ Useful Commands

```bash
# Update admin role
cd frontend
node fix-admin-complete.js

# Check admin in database
node scripts/check-admin.js

# Start dev server
npm run dev

# Open Prisma Studio
npx prisma studio
```

---

## ✅ Success Checklist

After login:
- [ ] Role shows "admin" on account page
- [ ] Header has admin dropdown
- [ ] "Admin Panel" link visible
- [ ] Can access /admin page
- [ ] No console errors

---

## 🎊 That's All!

**Just use Incognito mode and login!** 🚀
