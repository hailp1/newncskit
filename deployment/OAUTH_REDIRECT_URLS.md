# 🔐 OAuth Redirect URLs Configuration

## ⚠️ CRITICAL UPDATE (Nov 2025)

The redirect URI configuration has changed to align with Supabase Auth standards.

### 1. Provider Configuration (Google, LinkedIn, ORCID)
The "Authorized redirect URI" in the provider's developer console MUST be your Supabase project's callback URL:

```
https://<your-project-ref>.supabase.co/auth/v1/callback
```

*Example:* `https://ujcsqwegzchvsxigydcl.supabase.co/auth/v1/callback`

### 2. Supabase Configuration
In Supabase Dashboard -> Authentication -> URL Configuration -> Redirect URLs, add:

**Development:**
- `http://localhost:3000/auth/callback`

**Production:**
- `https://ncskit.org/auth/callback`
- `https://app.ncskit.org/auth/callback`
- `https://www.ncskit.org/auth/callback`

## ❌ Deprecated URLs (Do Not Use)
The following URLs are NO LONGER used and should be removed from your configuration if present:
- `http://localhost:3000/api/auth/callback/google`
- `https://ncskit.org/api/auth/callback/google`
- `http://localhost:3000/api/auth/callback/linkedin`

## Troubleshooting
If you see `redirect_uri_mismatch`:
1. Check the URL in the browser address bar when the error occurs.
2. Decode the `redirect_uri` parameter.
3. Ensure that EXACT URI is added to the provider's console.
