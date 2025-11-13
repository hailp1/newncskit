# Supabase to NextAuth Migration Guide

## Overview

NCSKIT has been successfully migrated from Supabase Authentication to NextAuth.js. This guide documents the migration process, code changes, and provides reference information for the transition.

**Migration Date:** November 11, 2025  
**Status:** ✅ Complete

---

## Migration Summary

### What Changed

| Component | Before (Supabase) | After (NextAuth) |
|-----------|------------------|------------------|
| Auth Provider | Supabase Auth | NextAuth.js |
| Session Management | Supabase Session | NextAuth Session |
| Database | Supabase PostgreSQL | Local PostgreSQL + Prisma |
| Auth Store | Zustand + Supabase | Zustand + NextAuth |
| OAuth | Supabase OAuth | NextAuth OAuth |
| Middleware | Supabase Middleware | NextAuth Middleware |

---

## Architecture Changes

### Before (Supabase)

```
┌─────────────────────────────────────────┐
│         NCSKIT Application              │
├─────────────────────────────────────────┤
│                                         │
│  ┌──────────────┐                      │
│  │   Supabase   │                      │
│  │     Auth     │                      │
│  └──────────────┘                      │
│         ⚠️                              │
│    Slow pages                           │
│    Security warnings                    │
└─────────────────────────────────────────┘
```

### After (NextAuth)

```
┌─────────────────────────────────────────┐
│         NCSKIT Application              │
├─────────────────────────────────────────┤
│                                         │
│              ┌──────────────┐           │
│              │   NextAuth   │           │
│              │   + Prisma   │           │
│              └──────────────┘           │
│                     ✅                  │
│                Fast & Secure            │
└─────────────────────────────────────────┘
```

---

## Files Migrated

### ✅ Core Auth Files (CRITICAL)

1. **Authentication Configuration**
   - Created: `frontend/src/lib/auth.ts` - NextAuth config
   - Removed: `frontend/src/lib/supabase/client.ts` - Supabase client
   - Removed: `frontend/src/lib/supabase/server.ts` - Supabase server
   - Removed: `frontend/src/lib/supabase/auth.ts` - Supabase auth functions
   - Removed: `frontend/src/lib/supabase/middleware.ts` - Supabase middleware

2. **Auth Store**
   - Updated: `frontend/src/store/auth.ts` - Now uses NextAuth
   - Removed: `frontend/src/store/auth-supabase.backup.ts` - Old Supabase store

3. **Type Definitions**
   - Removed: `frontend/src/types/supabase.ts` - Supabase types
   - Removed: `frontend/src/types/supabase-analysis-types.ts` - Supabase analysis types

### ✅ Auth Pages (HIGH)

1. **Login Pages**
   - Updated: `frontend/src/app/(auth)/login/page.tsx` - Uses NextAuth
   - Removed: `frontend/src/app/auth/login/page.tsx` - Old Supabase login

2. **Registration**
   - Updated: Registration flow to use NextAuth
   - Removed: Supabase registration code

3. **Password Reset**
   - Updated: `frontend/src/app/auth/reset-password/page.tsx` - NextAuth flow
   - Updated: `frontend/src/app/auth/forgot-password/page.tsx` - NextAuth flow

4. **OAuth Callback**
   - Updated: `frontend/src/app/auth/callback/route.ts` - NextAuth callback

### ✅ Dashboard & Layout (CRITICAL)

1. **Dashboard Layout**
   - Updated: `frontend/src/app/(dashboard)/layout.tsx` - Uses NextAuth session

2. **Components**
   - Updated: `frontend/src/components/layout/sidebar.tsx` - NextAuth user data
   - Updated: `frontend/src/components/layout/header.tsx` - NextAuth session
   - Updated: `frontend/src/components/auth/protected-route.tsx` - NextAuth protection

### ✅ Services (MEDIUM)

1. **User Services**
   - Updated: `frontend/src/services/user.service.ts` - Uses Prisma instead of Supabase
   - Updated: `frontend/src/services/user.service.client.ts` - Uses API routes
   - Updated: `frontend/src/services/profile.service.ts` - Prisma integration
   - Updated: `frontend/src/services/auth.service.ts` - NextAuth integration

2. **Admin Services**
   - Updated: `frontend/src/services/admin.service.ts` - Prisma queries
   - Updated: `frontend/src/services/permission.service.ts` - NextAuth session checks

### ✅ API Routes

1. **Auth API Routes**
   - Created: `frontend/src/app/api/auth/[...nextauth]/route.ts` - NextAuth handler
   - Updated: `frontend/src/app/api/auth/session/route.ts` - NextAuth session
   - Updated: `frontend/src/app/api/auth/logout/route.ts` - NextAuth logout
   - Removed: `frontend/src/app/api/health/supabase/route.ts` - Supabase health check

2. **Analysis API Routes**
   - Updated: All analysis routes to use Prisma instead of Supabase
   - Removed: `frontend/src/app/api/analysis/lib/supabase.ts` - Supabase utilities

---

## Code Migration Examples

### Authentication Store

**Before (Supabase):**
```typescript
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

// Login
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password
})

// Get user
const { data: { user } } = await supabase.auth.getUser()
```

**After (NextAuth):**
```typescript
import { signIn, signOut, useSession } from 'next-auth/react'

// Login
await signIn('credentials', {
  email,
  password,
  redirect: false
})

// Get user
const { data: session } = useSession()
const user = session?.user
```

### Database Queries

**Before (Supabase):**
```typescript
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

// Query users
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', userId)
```

**After (Prisma):**
```typescript
import { prisma } from '@/lib/prisma'

// Query users
const user = await prisma.user.findUnique({
  where: { id: userId }
})
```

### Protected Routes

**Before (Supabase Middleware):**
```typescript
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  const supabase = createServerClient(...)
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.redirect('/login')
  }
}
```

**After (NextAuth Middleware):**
```typescript
import { withAuth } from 'next-auth/middleware'

export default withAuth({
  callbacks: {
    authorized: ({ token }) => !!token
  }
})
```

---

## Environment Variables Changes

### Removed (Supabase)
```env
# Supabase credentials (REMOVED)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

### Added (NextAuth)
```env
# NextAuth configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/ncskit

# OAuth (Optional)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

---

## Migration Process

### Phase 1: Core Infrastructure ✅

**Tasks Completed:**
1. ✅ Setup NextAuth configuration
2. ✅ Create NextAuth-based auth store
3. ✅ Update middleware for NextAuth
4. ✅ Create auth utilities

### Phase 2: Dashboard Layout ✅

**Tasks Completed:**
1. ✅ Update `(dashboard)/layout.tsx`
2. ✅ Update sidebar component
3. ✅ Update header component
4. ✅ Test navigation

### Phase 3: Key Pages ✅

**Tasks Completed:**
1. ✅ Update settings page
2. ✅ Update profile page
3. ✅ Update admin pages
4. ✅ Test all pages

### Phase 4: Services Migration ✅

**Tasks Completed:**
1. ✅ Migrate user services to Prisma
2. ✅ Migrate profile services to Prisma
3. ✅ Migrate admin services to Prisma
4. ✅ Update all API routes

### Phase 5: Cleanup ✅

**Tasks Completed:**
1. ✅ Remove Supabase dependencies
2. ✅ Remove unused Supabase files
3. ✅ Update documentation
4. ✅ Final testing

---

## Issues Resolved

### 1. Slow Page Load Times ✅

**Problem:**
```
/settings - ~800ms
/profile - ~900ms
```

**Cause:** Pages were trying to connect to Supabase

**Solution:** Migrated to NextAuth, pages now load instantly

### 2. Security Warnings ✅

**Problem:**
```
Using the user object as returned from supabase.auth.getSession() 
could be insecure!
```

**Cause:** Supabase client usage in components

**Solution:** Replaced with NextAuth session management

### 3. 404 Errors ✅

**Problem:**
```
GET /auth 404
```

**Cause:** Old Supabase auth routes

**Solution:** Removed Supabase routes, using NextAuth endpoints

---

## Files Requiring Refactoring (Reference)

These files were identified during the migration and have been updated:

### High Priority (Completed)
- ✅ `frontend/src/services/profile.service.ts`
- ✅ `frontend/src/services/profile.service.client.ts`
- ✅ `frontend/src/services/permission.service.ts`
- ✅ `frontend/src/services/admin.service.ts`
- ✅ `frontend/src/services/auth.ts`

### Medium Priority (Completed)
- ✅ `frontend/src/services/supabase.service.ts` - Deleted
- ✅ `frontend/src/lib/analytics-cache.ts`
- ✅ `frontend/src/lib/admin-auth.ts`
- ✅ `frontend/src/lib/permissions/check.ts`

### API Routes (Completed)
- ✅ All analysis API routes migrated to Prisma
- ✅ Auth API routes migrated to NextAuth
- ✅ Supabase health check removed

---

## Testing Checklist

### ✅ Authentication Flow
- [x] Email/password registration works
- [x] Email/password login works
- [x] Google OAuth works
- [x] Password reset works
- [x] Logout works
- [x] Session persistence works

### ✅ Protected Routes
- [x] Unauthenticated users redirected to login
- [x] Authenticated users can access dashboard
- [x] Admin users can access admin panel
- [x] Session maintained across page refreshes

### ✅ Database Operations
- [x] User creation works
- [x] User queries work
- [x] Profile updates work
- [x] Project operations work
- [x] Dataset operations work

### ✅ Performance
- [x] Pages load quickly (no Supabase delays)
- [x] No security warnings in console
- [x] No 404 errors for auth routes

---

## Benefits of Migration

### Performance Improvements
- ✅ **Faster page loads:** No external Supabase calls
- ✅ **Reduced latency:** Local database queries
- ✅ **Better caching:** NextAuth session caching

### Security Improvements
- ✅ **No security warnings:** Proper session management
- ✅ **Better control:** Full control over auth flow
- ✅ **Secure sessions:** Server-side session validation

### Developer Experience
- ✅ **Simpler setup:** No Supabase configuration needed
- ✅ **Better TypeScript:** Full type safety with Prisma
- ✅ **Easier debugging:** All code in one place

### Cost Savings
- ✅ **No Supabase costs:** Self-hosted authentication
- ✅ **No external dependencies:** Reduced vendor lock-in

---

## Rollback Instructions

If you need to rollback to Supabase (not recommended):

1. **Restore Supabase files from Git:**
   ```bash
   git checkout <commit-hash> -- frontend/src/lib/supabase/
   git checkout <commit-hash> -- frontend/src/store/auth-supabase.backup.ts
   ```

2. **Restore environment variables:**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
   ```

3. **Reinstall Supabase packages:**
   ```bash
   npm install @supabase/supabase-js @supabase/ssr
   ```

4. **Revert auth store:**
   ```bash
   mv frontend/src/store/auth.ts frontend/src/store/auth-nextauth.ts
   mv frontend/src/store/auth-supabase.backup.ts frontend/src/store/auth.ts
   ```

---

## Troubleshooting

### Session Not Working

**Problem:** User session not persisting

**Solution:**
```bash
# Check NextAuth configuration
# Verify NEXTAUTH_SECRET is set
# Ensure NEXTAUTH_URL matches your domain
```

### OAuth Not Working

**Problem:** Google OAuth fails

**Solution:**
```bash
# Verify OAuth credentials in .env.local
# Check redirect URLs in Google Console
# Ensure callback URL is correct: /api/auth/callback/google
```

### Database Connection Issues

**Problem:** Cannot connect to database

**Solution:**
```bash
# Check DATABASE_URL in .env.local
# Verify PostgreSQL is running
# Test connection: psql -U postgres -d ncskit
```

---

## Related Documentation

- [Django to Node.js Migration](./django-to-nodejs.md) - Backend migration details
- [Local Setup Guide](../setup/local-setup.md) - Complete setup instructions
- [API Documentation](../api/API_DOCUMENTATION.md) - API endpoints
- [Troubleshooting Guide](../troubleshooting/admin-issues.md) - Common issues

---

## Support

If you encounter issues after the Supabase migration:

1. **Check Environment Variables:** Ensure all NextAuth variables are set
2. **Review Setup Guide:** See [Local Setup Guide](../setup/local-setup.md)
3. **Test Authentication:** Try logging in with test credentials
4. **Check Logs:** Review Next.js console for errors

---

**Last Updated:** November 11, 2025  
**Migration Status:** ✅ Complete  
**Risk Level:** Low (all functionality migrated and tested)  
**Rollback:** Available via Git history (not recommended)
