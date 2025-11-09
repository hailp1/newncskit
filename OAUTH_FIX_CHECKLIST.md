# OAuth Redirect Fix - Quick Checklist

## 🎯 Problem
After OAuth login → Redirects to Vercel URL instead of `app.ncskit.org`

## ✅ Solution Steps

### 1. Supabase Dashboard (CRITICAL)
🔗 https://supabase.com/dashboard/project/hfczndbrexnaoczxmopn/auth/url-configuration

- [ ] Go to **Authentication** → **URL Configuration**
- [ ] Set **Site URL** to: `https://app.ncskit.org`
- [ ] Add to **Redirect URLs**:
  - `https://app.ncskit.org/**`
  - `https://app.ncskit.org/auth/callback`
- [ ] Click **Save**
- [ ] Wait 5 minutes for cache to clear

### 2. Vercel Dashboard
🔗 https://vercel.com/dashboard

- [ ] Go to **Settings** → **Environment Variables**
- [ ] Verify: `NEXT_PUBLIC_SITE_URL=https://app.ncskit.org`
- [ ] Go to **Settings** → **Domains**
- [ ] Verify: `app.ncskit.org` is **Primary Domain**
- [ ] **Redeploy** if any changes made

### 3. Test
- [ ] Clear browser cache (or use Incognito)
- [ ] Go to: https://app.ncskit.org/auth/login
- [ ] Click "Sign in with Google"
- [ ] After auth, should redirect to: `https://app.ncskit.org/?code=...`
- [ ] ✅ Success if stays on `app.ncskit.org`

## 📝 Current OAuth Config (Already Correct)

### Google ✅
```
https://hfczndbrexnaoczxmopn.supabase.co/auth/v1/callback
https://app.ncskit.org/api/auth/callback/google
```

### LinkedIn ✅
```
https://hfczndbrexnaoczxmopn.supabase.co/auth/v1/callback
https://app.ncskit.org/api/auth/callback/linkedin
```

## 🔍 Root Cause
**Supabase Site URL** is currently set to Vercel URL. Change it to `https://app.ncskit.org`

## ⏱️ Time Required
- Configuration: 5 minutes
- Cache clear: 5 minutes
- Testing: 2 minutes
- **Total**: ~12 minutes

---

**Priority**: 🔴 HIGH  
**Impact**: All OAuth logins  
**Difficulty**: Easy (just config change)
