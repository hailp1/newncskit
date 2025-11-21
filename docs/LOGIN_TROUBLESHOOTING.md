# Login Troubleshooting Guide

## Current Configuration (Tunnel + Local Supabase)

If you are experiencing login loops or redirects back to the login page, please check the following:

1. **Browser Cookies**:
   - Clear all cookies for `ncskit.org` and `api.ncskit.org`.
   - The configuration now prefers the domain defined in `NEXT_PUBLIC_COOKIE_DOMAIN`. Leave this empty for localhost dev; set it to `.ncskit.org` when using Cloudflare Tunnel to share sessions between the frontend and API.

2. **Google / LinkedIn OAuth Redirect URIs**:
   - In Google Cloud Console **and** LinkedIn Developer Portal, ensure the Authorized redirect URI is EXACTLY:
     `https://api.ncskit.org/auth/v1/callback`
   - Supabase handles the internal redirect back to `https://ncskit.org/auth/callback`, so you do **not** add that URL to the providers.

3. **Supabase Local Config**:
   - The `docker-compose.supabase.yml` has been updated to set `API_EXTERNAL_URL` to `https://api.ncskit.org`.
   - `GOTRUE_SITE_URL` is set to `https://ncskit.org`.
   - If you changed these, run `docker-compose -f docker-compose.supabase.yml up -d` to apply.

4. **Frontend Environment**:
   - `NEXT_PUBLIC_SUPABASE_URL` MUST be `https://api.ncskit.org`.
   - `NEXT_PUBLIC_APP_URL` should match how users access the site (e.g. `https://ncskit.org` for tunnel, `http://localhost:3000` for dev).
   - `NEXT_PUBLIC_COOKIE_DOMAIN` should be `.ncskit.org` for tunnel, and left blank for pure localhost dev.
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` must match the one in `supabase_env.example`.

## Verification Steps

1. Go to `https://ncskit.org/login`.
2. Open Developer Tools (F12) -> Application -> Cookies.
3. Ensure no old cookies exist.
4. Click "Sign in with Google".
5. You should be redirected to Google, then to `api.ncskit.org/auth/v1/callback`, and finally to `ncskit.org/dashboard`.
6. Check Cookies again: You should see `sb-access-token` and `sb-refresh-token` with Domain `.ncskit.org`.

## Common Errors

- **Redirects to `localhost:3000`**: Check `GOTRUE_SITE_URL` in docker-compose **and** ensure `NEXT_PUBLIC_APP_URL` points to `https://ncskit.org` when using the tunnel.
- **Infinite Loop**: Check `middleware.ts` logic (already fixed to exclude `/auth/callback`).
- **Cookie not set**: Ensure `NEXT_PUBLIC_COOKIE_DOMAIN` is configured correctly for your environment so `src/lib/supabase/client.ts`, `middleware.ts`, and `src/lib/supabase/server.ts` can set matching cookies.

