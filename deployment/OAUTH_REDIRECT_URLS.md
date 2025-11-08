# OAuth Redirect URLs Configuration

## Domain Information
**Production Domain:** `app.ncskit.org`  
**Protocol:** HTTPS (required for OAuth)

---

## Google OAuth Configuration

### Google Cloud Console Setup
1. Go to: https://console.cloud.google.com/
2. Select your project or create a new one
3. Navigate to: **APIs & Services** → **Credentials**
4. Click on your OAuth 2.0 Client ID (or create new)
5. Add the following URLs:

### Authorized JavaScript Origins
```
https://app.ncskit.org
```

### Authorized Redirect URIs
```
https://app.ncskit.org/api/auth/callback/google
https://app.ncskit.org/auth/callback/google
https://app.ncskit.org/api/auth/google/callback
```

### For Development (Optional)
```
http://localhost:3000/api/auth/callback/google
http://localhost:3000/auth/callback/google
```

---

## LinkedIn OAuth Configuration

### LinkedIn Developer Portal Setup
1. Go to: https://www.linkedin.com/developers/apps
2. Select your app or create a new one
3. Navigate to: **Auth** tab
4. Add the following URLs:

### Authorized Redirect URLs
```
https://app.ncskit.org/api/auth/callback/linkedin
https://app.ncskit.org/auth/callback/linkedin
https://app.ncskit.org/api/auth/linkedin/callback
```

### For Development (Optional)
```
http://localhost:3000/api/auth/callback/linkedin
http://localhost:3000/auth/callback/linkedin
```

---

## Environment Variables

Update your `.env.production` or Vercel environment variables:

```bash
# Base URL
NEXT_PUBLIC_APP_URL=https://app.ncskit.org
NEXTAUTH_URL=https://app.ncskit.org

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# LinkedIn OAuth
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret

# NextAuth Secret (generate with: openssl rand -base64 32)
NEXTAUTH_SECRET=your_nextauth_secret_here
```

---

## Vercel Domain Configuration

### 1. Add Custom Domain in Vercel
```bash
# Via Vercel Dashboard:
1. Go to your project settings
2. Navigate to "Domains"
3. Add "app.ncskit.org"
4. Follow DNS configuration instructions
```

### 2. DNS Configuration
Add these records to your DNS provider (e.g., Cloudflare, GoDaddy):

```
Type: CNAME
Name: app
Value: cname.vercel-dns.com
TTL: Auto
```

Or if using A record:
```
Type: A
Name: app
Value: 76.76.21.21 (Vercel's IP)
TTL: Auto
```

### 3. SSL Certificate
Vercel automatically provisions SSL certificates via Let's Encrypt.
Wait 24-48 hours for DNS propagation and SSL activation.

---

## Testing OAuth Flow

### Google OAuth Test
1. Navigate to: `https://app.ncskit.org/login`
2. Click "Sign in with Google"
3. Should redirect to Google consent screen
4. After approval, should redirect back to: `https://app.ncskit.org/api/auth/callback/google`
5. Should land on dashboard or home page

### LinkedIn OAuth Test
1. Navigate to: `https://app.ncskit.org/login`
2. Click "Sign in with LinkedIn"
3. Should redirect to LinkedIn consent screen
4. After approval, should redirect back to: `https://app.ncskit.org/api/auth/callback/linkedin`
5. Should land on dashboard or home page

---

## Common Issues & Solutions

### Issue 1: "Redirect URI Mismatch"
**Solution:** 
- Ensure exact match between configured URL and actual callback URL
- Check for trailing slashes (should not have them)
- Verify HTTPS is used in production

### Issue 2: "Invalid Client"
**Solution:**
- Verify Client ID and Secret are correct
- Check environment variables are set in Vercel
- Ensure credentials match the OAuth provider

### Issue 3: "CORS Error"
**Solution:**
- Add domain to Authorized JavaScript Origins (Google)
- Ensure HTTPS is properly configured
- Check Vercel deployment settings

### Issue 4: "SSL Certificate Not Ready"
**Solution:**
- Wait 24-48 hours for DNS propagation
- Verify DNS records are correct
- Check Vercel domain status

---

## Security Best Practices

### 1. Use HTTPS Only
```javascript
// In your auth configuration
if (process.env.NODE_ENV === 'production') {
  // Force HTTPS
  if (req.headers['x-forwarded-proto'] !== 'https') {
    return res.redirect('https://' + req.headers.host + req.url);
  }
}
```

### 2. Validate Redirect URIs
```javascript
const allowedCallbacks = [
  'https://app.ncskit.org/api/auth/callback/google',
  'https://app.ncskit.org/api/auth/callback/linkedin',
];

if (!allowedCallbacks.includes(callbackUrl)) {
  throw new Error('Invalid callback URL');
}
```

### 3. Secure Session Cookies
```javascript
cookies: {
  sessionToken: {
    name: `__Secure-next-auth.session-token`,
    options: {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure: true, // HTTPS only
    },
  },
}
```

---

## NextAuth.js Configuration Example

```typescript
// pages/api/auth/[...nextauth].ts
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import LinkedInProvider from 'next-auth/providers/linkedin';

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    LinkedInProvider({
      clientId: process.env.LINKEDIN_CLIENT_ID!,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'r_emailaddress r_liteprofile',
        },
      },
    }),
  ],
  pages: {
    signIn: '/login',
    error: '/auth/error',
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
});
```

---

## Deployment Checklist

- [ ] Domain `app.ncskit.org` added to Vercel
- [ ] DNS records configured and propagated
- [ ] SSL certificate active (check with https://www.ssllabs.com/ssltest/)
- [ ] Environment variables set in Vercel:
  - [ ] `NEXT_PUBLIC_APP_URL`
  - [ ] `NEXTAUTH_URL`
  - [ ] `GOOGLE_CLIENT_ID`
  - [ ] `GOOGLE_CLIENT_SECRET`
  - [ ] `LINKEDIN_CLIENT_ID`
  - [ ] `LINKEDIN_CLIENT_SECRET`
  - [ ] `NEXTAUTH_SECRET`
- [ ] Google OAuth redirect URLs configured
- [ ] LinkedIn OAuth redirect URLs configured
- [ ] Test Google OAuth flow
- [ ] Test LinkedIn OAuth flow
- [ ] Verify session persistence
- [ ] Check error handling

---

## Quick Reference

### Google OAuth URLs
```
Authorized Origins: https://app.ncskit.org
Redirect URI: https://app.ncskit.org/api/auth/callback/google
```

### LinkedIn OAuth URLs
```
Redirect URI: https://app.ncskit.org/api/auth/callback/linkedin
```

### Vercel Domain
```
Custom Domain: app.ncskit.org
DNS: CNAME → cname.vercel-dns.com
```

---

## Support Links

- **Google OAuth Setup:** https://console.cloud.google.com/apis/credentials
- **LinkedIn OAuth Setup:** https://www.linkedin.com/developers/apps
- **Vercel Domains:** https://vercel.com/docs/concepts/projects/domains
- **NextAuth.js Docs:** https://next-auth.js.org/configuration/providers/oauth

---

**Last Updated:** November 8, 2024  
**Domain:** app.ncskit.org  
**Status:** Ready for Configuration
