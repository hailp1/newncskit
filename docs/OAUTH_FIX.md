# 🔧 OAuth Login Fix & Configuration Guide

## The Issue
Google Login was failing because of a mismatch between the Redirect URIs configured in Google/Supabase and the ones used by the application.

The application uses Supabase Auth, which requires a specific flow:
1. **App** initiates login -> redirects to **Google**.
2. **Google** authenticates user -> redirects to **Supabase**.
3. **Supabase** creates session -> redirects back to **App**.

## ✅ Required Configuration

### 1. Google Cloud Console
**Redirect URI:**
```
https://<your-project-ref>.supabase.co/auth/v1/callback
```
*Replace `<your-project-ref>` with your Supabase project ID (e.g., `ujcsqwegzchvsxigydcl`).*

### 2. Supabase Dashboard
**Location:** Authentication -> URL Configuration -> Redirect URLs

**Add these URLs:**
- `http://localhost:3000/auth/callback` (Local Development)
- `https://ncskit.org/auth/callback` (Production)
- `https://app.ncskit.org/auth/callback` (Production Alternate)

### 3. Environment Variables (`frontend/.env.local`)
Ensure these are set correctly:
```env
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

## Code Changes Applied
- **`frontend/src/lib/supabase/auth.ts`**: 
  - Removed manual popup logic (which conflicts with Supabase's redirect flow).
  - Simplified `signInWithGoogle` and `signInWithLinkedIn` to use standard redirect behavior.
- **`scripts/setup-oauth.md`**: Updated with correct redirect URI instructions.

## Verification
1. Restart the frontend: `cd frontend && npm run dev`
2. Go to `http://localhost:3000/login`
3. Click "Continue with Google"
4. You should be redirected to Google, then back to `/dashboard` (or the intended page).

