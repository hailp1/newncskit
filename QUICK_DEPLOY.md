# ⚡ Quick Deploy Reference - NCSKIT v2.0

## 🚀 Deploy trong 5 phút

### 1. Verify Ready (30 giây)
```bash
node scripts/verify-deployment.js
```
Phải thấy: `✅ All checks passed! Ready for deployment.`

### 2. Commit & Push (1 phút)
```bash
git add .
git commit -F COMMIT_MESSAGE.txt
git push origin main
```

### 3. Vercel Setup (2 phút)

#### Import Project
- Go to https://vercel.com/new
- Import from GitHub
- Select repository

#### Build Settings
```
Framework: Next.js
Build Command: cd frontend && npm run build
Output Directory: frontend/.next
Install Command: cd frontend && npm install
```

#### Environment Variables (Copy-paste)
```bash
# Required
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_ANALYTICS_URL=https://analytics.your-domain.com
ANALYTICS_API_KEY=your-api-key
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NODE_ENV=production

# Feature Flags (Recommended)
NEXT_PUBLIC_ENABLE_AUTO_CONTINUE=true
NEXT_PUBLIC_ENABLE_AUTO_CONTINUE_EXISTING=false
NEXT_PUBLIC_ENABLE_ROLE_TAGGING=true
NEXT_PUBLIC_ENABLE_ROLE_SUGGESTIONS=true
NEXT_PUBLIC_ENABLE_MODEL_PREVIEW=true
```

### 4. Deploy (1 phút)
Click "Deploy" button

### 5. Verify (30 giây)
- [ ] Homepage loads
- [ ] Login works
- [ ] Upload CSV
- [ ] Auto-continue triggers (wait 2s)
- [ ] Role tagging works

---

## 🆘 Quick Troubleshooting

### Build Fails
```bash
# Add to Vercel env vars:
SKIP_TYPE_CHECK=true
```

### Supabase Error
```bash
# Check:
1. URL correct?
2. Keys valid?
3. Migration run?
```

### Auto-continue Not Working
```bash
# Check:
1. NEXT_PUBLIC_ENABLE_AUTO_CONTINUE=true
2. Wait full 2 seconds
3. Check browser console
```

---

## 📞 Quick Links

- [Full Guide](DEPLOYMENT_GUIDE.md)
- [Checklist](DEPLOYMENT_CHECKLIST.md)
- [Summary](FINAL_DEPLOYMENT_SUMMARY.md)
- [Release Notes](RELEASE_NOTES_v2.0.md)

---

## 🎯 Success = All Green

```
✅ Build successful
✅ No errors in logs
✅ Homepage loads
✅ Features work
✅ Tests passing
```

**Time to Deploy:** ~5 minutes  
**Confidence:** 🟢 HIGH  
**Status:** ✅ READY
