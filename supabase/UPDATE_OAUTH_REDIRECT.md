# Fix OAuth Redirect URL

## Issue
OAuth login redirects to `http://localhost:3000` instead of production URL.

## Solution

### 1. Update Supabase Auth Configuration

Go to: https://app.supabase.com/project/hfczndbrexnaoczxmopn/auth/url-configuration

#### Site URL
Update to production URL:
```
https://frontend-qjvj4aamg-hailp1s-projects.vercel.app
```

#### Redirect URLs
Add these URLs to the allowed list:
```
https://frontend-qjvj4aamg-hailp1s-projects.vercel.app/auth/callback
https://frontend-qjvj4aamg-hailp1s-projects.vercel.app/**
https://*.vercel.app/auth/callback
https://*.vercel.app/**
http://localhost:3000/auth/callback
http://localhost:3000/**
```

### 2. Update OAuth Provider Settings

#### Google OAuth
Go to: https://console.cloud.google.com/apis/credentials

Update Authorized redirect URIs:
```
https://hfczndbrexnaoczxmopn.supabase.co/auth/v1/callback
https://frontend-qjvj4aamg-hailp1s-projects.vercel.app/auth/callback
```

#### LinkedIn OAuth
Go to: https://www.linkedin.com/developers/apps

Update Redirect URLs:
```
https://hfczndbrexnaoczxmopn.supabase.co/auth/v1/callback
https://frontend-qjvj4aamg-hailp1s-projects.vercel.app/auth/callback
```

### 3. Verify Configuration

After updating, test OAuth flow:
1. Go to production URL
2. Click "Login with Google"
3. Should redirect to Google
4. After auth, should redirect back to production URL

## Quick Fix Steps

1. **Supabase Dashboard**
   - URL Configuration → Site URL → Update to production URL
   - URL Configuration → Redirect URLs → Add production URLs

2. **Google Console**
   - Credentials → OAuth 2.0 Client → Authorized redirect URIs → Add production URL

3. **LinkedIn Developer**
   - App Settings → Auth → Redirect URLs → Add production URL

4. **Test**
   - Clear browser cache
   - Try OAuth login again
