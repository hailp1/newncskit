# Authentication Flow Documentation

This document describes the complete authentication flows in the redesigned authentication system.

## Table of Contents

1. [Overview](#overview)
2. [Full-Page Authentication](#full-page-authentication)
3. [Modal Authentication](#modal-authentication)
4. [OAuth Authentication](#oauth-authentication)
5. [Error Handling Flow](#error-handling-flow)
6. [Network Error Recovery](#network-error-recovery)
7. [State Management](#state-management)
8. [Security Considerations](#security-considerations)

---

## Overview

The authentication system supports two primary flows:

1. **Full-Page Authentication**: Traditional page-based login/register
2. **Modal Authentication**: In-app modal for seamless authentication

Both flows share the same underlying components and logic, ensuring consistency.

---

## Full-Page Authentication

### Login Flow

```
User visits /auth/login
         ↓
AuthLayout renders with mode="login"
         ↓
AuthForm displays login fields
         ↓
User enters credentials
         ↓
Form validation (client-side)
         ↓
Submit to Supabase Auth
         ↓
Success → Redirect to /dashboard
Error → Display error message
```

### Register Flow

```
User visits /auth/register
         ↓
AuthLayout renders with mode="register"
         ↓
AuthForm displays register fields
         ↓
User enters details
         ↓
Form validation (client-side)
         ↓
Submit to Supabase Auth
         ↓
Success → Redirect to /dashboard
Error → Display error message
```

### Implementation

**Login Page** (`app/auth/login/page.tsx`):
```typescript
import { AuthLayout } from '@/components/auth/auth-layout'
import { AuthForm } from '@/components/auth/auth-form'

export default function LoginPage() {
  return (
    <AuthLayout mode="login">
      <AuthForm mode="login" />
    </AuthLayout>
  )
}
```

**Register Page** (`app/auth/register/page.tsx`):
```typescript
import { AuthLayout } from '@/components/auth/auth-layout'
import { AuthForm } from '@/components/auth/auth-form'

export default function RegisterPage() {
  return (
    <AuthLayout mode="register">
      <AuthForm mode="register" />
    </AuthLayout>
  )
}
```

### User Experience

1. **Desktop (≥1024px)**:
   - Split-screen layout
   - Form on left (40%)
   - Animated illustrations on right (60%)
   - Smooth transitions between slides

2. **Mobile (<1024px)**:
   - Single-column layout
   - Form takes full width
   - Illustrations hidden for performance

---

## Modal Authentication

### Opening the Modal

```
User clicks "Login" button
         ↓
useAuthModal.openLogin() called
         ↓
Modal state updated (isOpen=true, mode='login')
         ↓
AuthModal component renders
         ↓
Focus trapped in modal
         ↓
Body scroll locked
```

### Modal Login Flow

```
Modal opens with login form
         ↓
User enters credentials
         ↓
Form validation
         ↓
Submit to Supabase Auth
         ↓
Success → Close modal → Redirect
Error → Display error in modal
```

### Mode Switching in Modal

```
User viewing login modal
         ↓
Clicks "Create account" link
         ↓
Fade out animation (200ms)
         ↓
Mode changes to 'register'
         ↓
Fade in animation (50ms)
         ↓
Register form displayed
```

### Implementation

**Root Layout** (`app/layout.tsx`):
```typescript
import { LazyAuthModal } from '@/components/auth/lazy-auth-modal'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <LazyAuthModal />
      </body>
    </html>
  )
}
```

**Header Component** (`components/layout/header.tsx`):
```typescript
import { useAuthModal } from '@/hooks/use-auth-modal'
import { preloadAuthModal } from '@/components/auth/lazy-auth-modal'

export function Header() {
  const { openLogin, openRegister } = useAuthModal()
  
  return (
    <nav>
      <button 
        onClick={openLogin}
        onMouseEnter={preloadAuthModal}
      >
        Login
      </button>
      <button 
        onClick={openRegister}
        onMouseEnter={preloadAuthModal}
      >
        Sign Up
      </button>
    </nav>
  )
}
```

### Modal Features

- **Focus Management**: Focus trapped within modal, restored on close
- **Backdrop Click**: Closes modal when clicking outside
- **ESC Key**: Closes modal when pressing Escape
- **Body Scroll Lock**: Prevents background scrolling
- **Smooth Animations**: Fade and scale transitions

---

## OAuth Authentication

### Google OAuth Flow

```
User clicks "Google" button
         ↓
Check network status
         ↓
Check for popup blockers
         ↓
Open OAuth popup window
         ↓
User authenticates with Google
         ↓
Google redirects to callback URL
         ↓
Supabase processes OAuth response
         ↓
Success → Close modal/redirect
Error → Display error with fallback instructions
```

### LinkedIn OAuth Flow

```
User clicks "LinkedIn" button
         ↓
Check network status
         ↓
Check for popup blockers
         ↓
Open OAuth popup window
         ↓
User authenticates with LinkedIn
         ↓
LinkedIn redirects to callback URL
         ↓
Supabase processes OAuth response
         ↓
Success → Close modal/redirect
Error → Display error with fallback instructions
```

### OAuth Error Handling

**Popup Blocked**:
```
Browser blocks popup
         ↓
Detect popup blocker
         ↓
Show OAuthFallbackInstructions
         ↓
Display steps to allow popups
         ↓
User enables popups
         ↓
Retry OAuth flow
```

**Access Denied**:
```
User denies permissions
         ↓
OAuth returns error
         ↓
Show OAuthFallbackInstructions
         ↓
Explain required permissions
         ↓
User can retry with correct permissions
```

### Implementation

**OAuth Functions** (`lib/supabase/auth.ts`):
```typescript
export async function signInWithGoogle() {
  // Check if popup will be blocked
  const testPopup = window.open('', '_blank', 'width=1,height=1')
  if (!testPopup || testPopup.closed) {
    throw new Error('Popup blocked')
  }
  testPopup.close()
  
  // Proceed with OAuth
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  })
  
  if (error) throw error
}
```

---

## Error Handling Flow

### Validation Errors

```
User submits form
         ↓
Client-side validation
         ↓
Validation fails
         ↓
Display inline error messages
         ↓
Highlight invalid fields
         ↓
User corrects errors
         ↓
Validation passes
         ↓
Submit to server
```

### Authentication Errors

```
User submits valid form
         ↓
Send to Supabase Auth
         ↓
Authentication fails
         ↓
Parse error response
         ↓
Categorize error type
         ↓
Display user-friendly message
         ↓
Determine if retryable
         ↓
Show retry button (if applicable)
```

### Error Categories

1. **Validation Errors** (Not Retryable):
   - Invalid email format
   - Password too short
   - Passwords don't match
   - Missing required fields

2. **Authentication Errors** (Not Retryable):
   - Invalid credentials
   - User not found
   - Email already registered
   - Email not confirmed

3. **Network Errors** (Retryable):
   - Connection timeout
   - Network offline
   - Server unreachable

4. **OAuth Errors** (Retryable):
   - Popup blocked
   - Provider error
   - Timeout

5. **Rate Limit Errors** (Retryable with Delay):
   - Too many attempts
   - Rate limit exceeded

6. **Server Errors** (Retryable):
   - 500 Internal Server Error
   - 502 Bad Gateway
   - 503 Service Unavailable

---

## Network Error Recovery

### Offline Detection

```
Page loads
         ↓
useNetworkStatus hook initializes
         ↓
Listen to online/offline events
         ↓
Network goes offline
         ↓
Update state (isOffline=true)
         ↓
Display network warning banner
         ↓
Prevent form submission
         ↓
Network comes back online
         ↓
Update state (isOffline=false)
         ↓
Hide warning banner
         ↓
Allow form submission
```

### Automatic Retry

```
User submits form
         ↓
Network request fails
         ↓
Detect retryable error
         ↓
Wait 2 seconds (exponential backoff)
         ↓
Retry request automatically
         ↓
Success → Continue
Failure → Show error with manual retry button
```

### Manual Retry

```
Network error displayed
         ↓
User clicks "Retry" button
         ↓
Button shows loading state
         ↓
Wait 1 second
         ↓
Retry the operation
         ↓
Success → Clear error, continue
Failure → Show error again
```

### Implementation

**Network Status Hook** (`hooks/use-network-status.ts`):
```typescript
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])
  
  return {
    isOnline,
    isOffline: !isOnline,
  }
}
```

**Retry Logic** (`lib/utils/retry.ts`):
```typescript
export async function retryAsync<T>(
  fn: () => Promise<T>,
  options: RetryOptions
): Promise<T> {
  let lastError: unknown
  
  for (let attempt = 1; attempt <= options.maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      
      if (attempt === options.maxAttempts) break
      if (!options.shouldRetry(error)) break
      
      const delay = options.initialDelay * Math.pow(2, attempt - 1)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  throw lastError
}
```

---

## State Management

### Auth Store (Zustand)

**Location**: `store/auth.ts`

**State**:
```typescript
interface AuthState {
  user: User | null
  isLoading: boolean
  error: string | null
  login: (credentials: LoginCredentials) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  loginWithGoogle: () => Promise<void>
  loginWithLinkedIn: () => Promise<void>
  logout: () => Promise<void>
  clearError: () => void
}
```

**Usage**:
```typescript
const { user, isLoading, error, login } = useAuthStore()

// Login
await login({ email, password })

// Check auth state
if (user) {
  // User is authenticated
}
```

### Modal Store (Zustand)

**Location**: `hooks/use-auth-modal.ts`

**State**:
```typescript
interface AuthModalState {
  isOpen: boolean
  mode: 'login' | 'register'
  openLogin: () => void
  openRegister: () => void
  close: () => void
  setMode: (mode: 'login' | 'register') => void
}
```

**Usage**:
```typescript
const { isOpen, mode, openLogin, close } = useAuthModal()

// Open login modal
openLogin()

// Close modal
close()
```

---

## Security Considerations

### Client-Side Validation

- **Purpose**: Improve UX, not security
- **Implementation**: Validate format, length, matching
- **Note**: Server-side validation is still required

### Password Requirements

- Minimum 6 characters (enforced by Supabase)
- No maximum length (handled by Supabase)
- No special character requirements (for better UX)

### OAuth Security

- **PKCE Flow**: Supabase handles PKCE automatically
- **State Parameter**: Prevents CSRF attacks
- **Redirect URL Validation**: Only whitelisted URLs allowed

### Session Management

- **HTTP-Only Cookies**: Session tokens stored securely
- **Automatic Refresh**: Supabase handles token refresh
- **Logout**: Clears all session data

### Error Messages

- **Generic Messages**: Don't reveal if email exists
- **Rate Limiting**: Prevents brute force attacks
- **No Sensitive Data**: Error messages don't expose system details

---

## Performance Optimizations

### Code Splitting

- **Modal**: Lazy loaded on demand (~5KB)
- **Illustrations**: Lazy loaded per slide (~2KB each)
- **Total Savings**: ~20KB from initial bundle

### Preloading Strategy

1. **Automatic**: Preload modal after 2 seconds
2. **On Hover**: Preload when user hovers over login button
3. **On Touch**: Preload when user touches login button (mobile)

### Animation Performance

- **CSS Transforms**: Hardware accelerated
- **will-change**: Optimizes rendering
- **Debouncing**: Prevents excessive re-renders

---

## Testing Checklist

### Manual Testing

- [ ] Login with valid credentials
- [ ] Login with invalid credentials
- [ ] Register new account
- [ ] Register with existing email
- [ ] Switch between login/register in modal
- [ ] OAuth login with Google
- [ ] OAuth login with LinkedIn
- [ ] Test with popup blocker enabled
- [ ] Test offline behavior
- [ ] Test network error recovery
- [ ] Test on mobile devices
- [ ] Test keyboard navigation
- [ ] Test screen reader compatibility

### Automated Testing

- [ ] Unit tests for validation logic
- [ ] Unit tests for error parsing
- [ ] Integration tests for form submission
- [ ] E2E tests for complete flows
- [ ] Visual regression tests

---

## Troubleshooting

### Common Issues

**Modal doesn't open**:
- Check that `<LazyAuthModal />` is in root layout
- Verify `useAuthModal` hook is called correctly
- Check browser console for errors

**OAuth popup blocked**:
- Ensure user action triggers OAuth (not automatic)
- Check browser popup settings
- Display fallback instructions

**Network errors**:
- Check browser console for actual errors
- Verify API endpoints are accessible
- Test with different network conditions

**Validation not working**:
- Check that validation functions are called on blur
- Verify error state is updated correctly
- Check that error messages are displayed

---

## Future Enhancements

### Planned Features

1. **Social Login**: Add more OAuth providers (Facebook, Twitter)
2. **Two-Factor Authentication**: SMS or authenticator app
3. **Passwordless Login**: Magic link via email
4. **Biometric Auth**: Face ID, Touch ID on mobile
5. **Remember Me**: Persistent sessions
6. **Account Recovery**: Password reset flow

### Performance Improvements

1. **Service Worker**: Offline support
2. **Progressive Enhancement**: Load features on demand
3. **Image Optimization**: WebP format for illustrations
4. **Bundle Analysis**: Further reduce bundle size

---

## Related Documentation

- [API Documentation](./AUTH_COMPONENTS_API.md)
- [Design Document](../../.kiro/specs/auth-page-redesign/design.md)
- [Requirements Document](../../.kiro/specs/auth-page-redesign/requirements.md)
- [Responsive Design Guide](./RESPONSIVE_DESIGN.md)
