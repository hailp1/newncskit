# OAuth Redirect URL Fix Guide

## Problem
After OAuth login (Google/LinkedIn), users are redirected to Vercel URL instead of custom domain:
- ❌ Current: `https://frontend-qjvj4aamg-hailp1s-projects.vercel.app/?code=...`
- ✅ Expected: `https://app.ncskit.org/?code=...`

## Root Cause
Supabase Site URL is set to Vercel URL instead of custom domain.

---

## Solution: Update Supabase Configuration

### Step 1: Update Supabase Site URL

1. **Go to Supabase Dashboard**
   - URL: https://supabase.com/dashboard/project/hfczndbrexnaoczxmopn

2. **Navigate to Authentication Settings**
   - Click on **Authentication** in left sidebar
   - Click on **URL Configuration**

3. **Update Site URL**
   - Find **Site URL** field
   - Change from: `https://frontend-qjvj4aamg-hailp1s-projects.vercel.app`
   - Change to: `https://app.ncskit.org`
   - Click **Save**

4. **Update Redirect URLs**
   - Find **Redirect URLs** section
   - Add these URLs (if not already present):
     ```
     https://app.ncskit.org/**
     https://app.ncskit.org/auth/callback
     https://app.ncskit.org/api/auth/callback
     ```
   - Remove old Vercel URLs if present
   - Click **Save**

---

### Step 2: Verify OAuth Provider Settings

#### Google OAuth
**Current Configuration**: ✅ Correct
```
Authorized redirect URIs:
1. https://hfczndbrexnaoczxmopn.supabase.co/auth/v1/callback
2. https://app.ncskit.org/api/auth/callback/google
```

**Action**: No changes needed

#### LinkedIn OAuth
**Current Configuration**: ✅ Correct
```
Authorized redirect URLs:
1. https://hfczndbrexnaoczxmopn.supabase.co/auth/v1/callback
2. https://app.ncskit.org/api/auth/callback/linkedin
```

**Action**: No changes needed

---

### Step 3: Update Vercel Environment Variables

1. **Go to Vercel Dashboard**
   - URL: https://vercel.com/dashboard

2. **Select Your Project**
   - Click on your project

3. **Go to Settings → Environment Variables**

4. **Verify/Update These Variables**:
   ```
   NEXT_PUBLIC_SITE_URL=https://app.ncskit.org
   NEXT_PUBLIC_SUPABASE_URL=https://hfczndbrexnaoczxmopn.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```

5. **Add if missing**:
   ```
   NEXT_PUBLIC_APP_URL=https://app.ncskit.org
   ```

6. **Click Save** and **Redeploy**

---

### Step 4: Update Vercel Domain Settings

1. **Go to Vercel Dashboard → Your Project**

2. **Navigate to Settings → Domains**

3. **Verify Custom Domain**:
   - Primary domain: `app.ncskit.org`
   - Should show: ✅ Valid Configuration

4. **Set as Primary** (if not already):
   - Click on `app.ncskit.org`
   - Click **Set as Primary Domain**

---

## Verification Steps

### Test OAuth Flow

1. **Clear Browser Cache/Cookies**
   - Or use Incognito/Private mode

2. **Go to Login Page**
   - URL: https://app.ncskit.org/auth/login

3. **Click "Sign in with Google" or "Sign in with LinkedIn"**

4. **After OAuth Authorization**
   - Should redirect to: `https://app.ncskit.org/?code=...`
   - NOT to Vercel URL

5. **Verify User is Logged In**
   - Check if redirected to dashboard
   - Verify user session is active

---

## Common Issues & Solutions

### Issue 1: Still Redirecting to Vercel URL
**Solution**:
- Clear Supabase cache: Wait 5-10 minutes after changing Site URL
- Clear browser cache completely
- Try in incognito mode

### Issue 2: "Invalid Redirect URL" Error
**Solution**:
- Verify Site URL in Supabase matches exactly: `https://app.ncskit.org`
- Ensure no trailing slash
- Check Redirect URLs include wildcard: `https://app.ncskit.org/**`

### Issue 3: OAuth Callback 404 Error
**Solution**:
- Verify callback routes exist:
  - `/api/auth/callback/google`
  - `/api/auth/callback/linkedin`
- Check Vercel deployment is successful
- Verify environment variables are set

---

## Quick Checklist

- [ ] Supabase Site URL = `https://app.ncskit.org`
- [ ] Supabase Redirect URLs include `https://app.ncskit.org/**`
- [ ] Google OAuth redirect = `https://app.ncskit.org/api/auth/callback/google`
- [ ] LinkedIn OAuth redirect = `https://app.ncskit.org/api/auth/callback/linkedin`
- [ ] Vercel `NEXT_PUBLIC_SITE_URL` = `https://app.ncskit.org`
- [ ] Vercel primary domain = `app.ncskit.org`
- [ ] Clear browser cache
- [ ] Test OAuth flow

---

## Expected Flow After Fix

```
1. User visits: https://app.ncskit.org/auth/login
2. User clicks: "Sign in with Google"
3. Redirects to: Google OAuth consent screen
4. User authorizes
5. Google redirects to: https://hfczndbrexnaoczxmopn.supabase.co/auth/v1/callback
6. Supabase processes auth
7. Supabase redirects to: https://app.ncskit.org/?code=xxx (✅ CORRECT)
8. App exchanges code for session
9. User redirected to: https://app.ncskit.org/dashboard
```

---

## Additional Notes

### Why This Happens
- Supabase uses the **Site URL** setting to determine where to redirect after OAuth
- If Site URL is set to Vercel URL, all redirects go there
- Custom domain must be set as Site URL for proper redirects

### Best Practices
1. Always set Site URL to your production custom domain
2. Keep Vercel URL as fallback in Redirect URLs for testing
3. Use environment variables for different environments
4. Test OAuth flow after any domain changes

---

## Support

If issues persist after following this guide:

1. **Check Supabase Logs**
   - Dashboard → Logs → Auth Logs
   - Look for redirect URL in logs

2. **Check Browser Network Tab**
   - See where OAuth callback is redirecting
   - Verify Site URL being used

3. **Contact Support**
   - Supabase: https://supabase.com/support
   - Vercel: https://vercel.com/support

---

**Last Updated**: November 9, 2025  
**Status**: Ready to implement
