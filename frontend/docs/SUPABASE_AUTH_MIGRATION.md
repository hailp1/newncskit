# Supabase Authentication Migration Guide

## Overview

This document describes the migration from NextAuth to Supabase Auth for the NCSKIT application.

## What Was Implemented

### 1. Authentication Store (`src/store/auth.ts`)

Created a Zustand store for managing authentication state with Supabase:

- **State Management**: User, session, loading states, and errors
- **Actions**: 
  - `initialize()`: Initialize auth and listen for auth state changes
  - `login()`: Email/password login
  - `register()`: User registration
  - `loginWithGoogle()`: Google OAuth
  - `loginWithLinkedIn()`: LinkedIn OAuth
  - `logout()`: Sign out
  - `refreshSession()`: Refresh user session
- **Persistence**: User and session data persisted to localStorage

### 2. Authentication Pages

Created complete authentication flow pages:

- **Login Page** (`/auth/login`): Email/password and OAuth login
- **Register Page** (`/auth/register`): User registration with email confirmation
- **Forgot Password** (`/auth/forgot-password`): Password reset request
- **Reset Password** (`/auth/reset-password`): Set new password
- **Auth Callback** (`/auth/callback`): OAuth callback handler

### 3. Protected Routes Middleware

Updated `src/middleware.ts` to:

- Check authentication for protected routes
- Redirect unauthenticated users to login
- Redirect authenticated users away from auth pages
- Maintain session across requests

Protected routes include:
- `/dashboard`
- `/projects`
- `/editor`
- `/analytics`
- `/admin`
- And more...

### 4. API Routes

Created authentication API routes:

- **Session Check** (`/api/auth/session`): Get current session
- **Logout** (`/api/auth/logout`): Server-side logout

### 5. UI Components

Updated components to use Supabase auth:

- **Navbar**: Shows user info and logout button
- **Dashboard Layout**: Checks authentication and shows loading state

## Configuration

### Environment Variables

Required environment variables in `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Supabase Dashboard Configuration

1. **Enable Email Auth**:
   - Go to Authentication > Providers
   - Enable Email provider
   - Configure email templates

2. **Enable OAuth Providers**:
   - Enable Google OAuth
   - Enable LinkedIn OAuth
   - Configure redirect URLs: `https://your-domain.com/auth/callback`

3. **Configure Auth Settings**:
   - JWT expiry: 1 hour
   - Refresh token expiry: 30 days
   - Enable automatic token refresh

## Usage

### Client-Side Authentication

```typescript
import { useAuthStore } from '@/store/auth'

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuthStore()

  // Login
  await login({ email, password })

  // Register
  await register({ email, password, fullName })

  // OAuth
  await loginWithGoogle()
  await loginWithLinkedIn()

  // Logout
  await logout()
}
```

### Server-Side Authentication

```typescript
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }
  
  // ... rest of handler
}
```

### Middleware Protection

Routes are automatically protected by middleware. No additional code needed in pages.

## Migration Checklist

- [x] Create Supabase auth helpers
- [x] Create authentication store
- [x] Create login page
- [x] Create register page
- [x] Create forgot password page
- [x] Create reset password page
- [x] Create OAuth callback handler
- [x] Update middleware for route protection
- [x] Update dashboard layout
- [x] Update navbar component
- [x] Create auth API routes
- [x] Update auth configuration

## Next Steps

### To Complete Migration:

1. **Remove NextAuth Dependencies** (Task 3.5):
   ```bash
   npm uninstall next-auth @next-auth/prisma-adapter
   ```

2. **Test Authentication Flow**:
   - Test email/password registration
   - Test email/password login
   - Test Google OAuth
   - Test LinkedIn OAuth
   - Test password reset
   - Test protected routes
   - Test session persistence

3. **Configure Supabase**:
   - Set up email templates
   - Configure OAuth providers
   - Set up RLS policies for user data

4. **Update User Profile**:
   - Create profile page to display user info
   - Allow users to update their profile
   - Sync with Supabase profiles table

## Troubleshooting

### Session Not Persisting

- Check that cookies are enabled
- Verify Supabase URL and keys are correct
- Check browser console for errors

### OAuth Not Working

- Verify OAuth providers are enabled in Supabase
- Check redirect URLs are configured correctly
- Ensure OAuth credentials are set in Supabase dashboard

### Protected Routes Not Working

- Check middleware configuration
- Verify route patterns in middleware matcher
- Check that Supabase client is initialized correctly

## Security Considerations

1. **Row Level Security**: Ensure RLS policies are set up in Supabase
2. **API Keys**: Never expose service role key on client side
3. **HTTPS**: Always use HTTPS in production
4. **CORS**: Configure allowed origins in Supabase dashboard
5. **Rate Limiting**: Consider implementing rate limiting for auth endpoints

## Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Supabase Next.js Guide](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)
- [Supabase SSR Package](https://supabase.com/docs/guides/auth/server-side/nextjs)
