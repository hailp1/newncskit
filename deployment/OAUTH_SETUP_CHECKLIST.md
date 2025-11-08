# OAuth Setup Checklist - app.ncskit.org

## 📋 Quick Setup Checklist

### ✅ Step 1: Vercel Domain Setup
- [ ] Add `app.ncskit.org` to Vercel project
- [ ] Configure DNS records (CNAME to `cname.vercel-dns.com`)
- [ ] Wait for SSL certificate (24-48 hours)
- [ ] Verify HTTPS works: https://app.ncskit.org

### ✅ Step 2: Google OAuth Setup
- [ ] Go to https://console.cloud.google.com/
- [ ] Navigate to **APIs & Services** → **Credentials**
- [ ] Select or create OAuth 2.0 Client ID
- [ ] Add **Authorized JavaScript origins:**
  ```
  https://app.ncskit.org
  ```
- [ ] Add **Authorized redirect URIs:**
  ```
  https://app.ncskit.org/api/auth/callback/google
  ```
- [ ] Copy Client ID and Client Secret
- [ ] Save changes

### ✅ Step 3: LinkedIn OAuth Setup
- [ ] Go to https://www.linkedin.com/developers/apps
- [ ] Select or create your app
- [ ] Navigate to **Auth** tab
- [ ] Add **Authorized redirect URLs:**
  ```
  https://app.ncskit.org/api/auth/callback/linkedin
  ```
- [ ] Copy Client ID and Client Secret
- [ ] Save changes

### ✅ Step 4: Vercel Environment Variables
- [ ] Go to Vercel project settings → Environment Variables
- [ ] Add the following variables:

```bash
# Base URLs
NEXT_PUBLIC_APP_URL=https://app.ncskit.org
NEXTAUTH_URL=https://app.ncskit.org

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# LinkedIn OAuth
LINKEDIN_CLIENT_ID=your_linkedin_client_id_here
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret_here

# NextAuth Secret (generate with: openssl rand -base64 32)
NEXTAUTH_SECRET=your_generated_secret_here
```

- [ ] Set environment for: **Production**, **Preview**, **Development**
- [ ] Save changes

### ✅ Step 5: Redeploy
- [ ] Trigger new deployment in Vercel
- [ ] Wait for deployment to complete
- [ ] Verify environment variables are loaded

### ✅ Step 6: Test OAuth Flows
- [ ] Test Google OAuth:
  - Visit https://app.ncskit.org/login
  - Click "Sign in with Google"
  - Complete OAuth flow
  - Verify successful login
  
- [ ] Test LinkedIn OAuth:
  - Visit https://app.ncskit.org/login
  - Click "Sign in with LinkedIn"
  - Complete OAuth flow
  - Verify successful login

### ✅ Step 7: Verify Security
- [ ] Check SSL certificate: https://www.ssllabs.com/ssltest/analyze.html?d=app.ncskit.org
- [ ] Verify HTTPS redirect works
- [ ] Test session persistence
- [ ] Check cookie security settings
- [ ] Verify CORS configuration

---

## 🔑 Copy-Paste URLs

### For Google Cloud Console

**Authorized JavaScript origins:**
```
https://app.ncskit.org
```

**Authorized redirect URIs:**
```
https://app.ncskit.org/api/auth/callback/google
```

### For LinkedIn Developer Portal

**Authorized redirect URLs:**
```
https://app.ncskit.org/api/auth/callback/linkedin
```

---

## 🛠️ Generate NextAuth Secret

Run this command to generate a secure secret:

```bash
openssl rand -base64 32
```

Or use Node.js:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## 🧪 Testing Commands

### Test DNS Resolution
```bash
nslookup app.ncskit.org
```

### Test SSL Certificate
```bash
curl -I https://app.ncskit.org
```

### Test OAuth Endpoint
```bash
curl https://app.ncskit.org/api/auth/providers
```

---

## ⚠️ Common Issues

### Issue: "Redirect URI Mismatch"
**Fix:** Ensure URLs match exactly (no trailing slashes)

### Issue: "Invalid Client"
**Fix:** Verify Client ID/Secret in Vercel environment variables

### Issue: "SSL Not Ready"
**Fix:** Wait 24-48 hours for DNS propagation

### Issue: "CORS Error"
**Fix:** Add domain to Authorized JavaScript Origins (Google)

---

## 📞 Support

If you encounter issues:
1. Check Vercel deployment logs
2. Verify environment variables are set
3. Test OAuth provider credentials
4. Check DNS propagation: https://dnschecker.org/

---

**Status:** Ready to Configure  
**Domain:** app.ncskit.org  
**Last Updated:** November 8, 2024
