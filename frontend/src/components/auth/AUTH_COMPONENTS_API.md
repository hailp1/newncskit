# Authentication Components API Documentation

This document provides comprehensive API documentation for all authentication components in the redesigned authentication system.

## Table of Contents

1. [AuthForm](#authform)
2. [AuthLayout](#authlayout)
3. [AuthModal](#authmodal)
4. [IllustrationPanel](#illustrationpanel)
5. [LazyAuthModal](#lazyauthmodal)
6. [OAuthFallbackInstructions](#oauthfallbackinstructions)
7. [Hooks](#hooks)
8. [Utilities](#utilities)

---

## AuthForm

Reusable authentication form component that handles both login and registration flows.

### Import

```typescript
import { AuthForm } from '@/components/auth/auth-form'
```

### Props

```typescript
interface AuthFormProps {
  mode: 'login' | 'register'
  onModeChange?: (mode: 'login' | 'register') => void
  onSuccess?: () => void
  isModal?: boolean
}
```

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `mode` | `'login' \| 'register'` | Yes | - | Determines whether to show login or register form |
| `onModeChange` | `(mode: 'login' \| 'register') => void` | No | - | Callback when user wants to switch between login/register |
| `onSuccess` | `() => void` | No | - | Callback when authentication succeeds |
| `isModal` | `boolean` | No | `false` | Whether the form is rendered in a modal context |

### Features

- **Real-time Validation**: Validates fields on blur with inline error messages
- **Network Status Detection**: Shows warning when offline
- **Error Handling**: Comprehensive error handling with retry functionality
- **OAuth Support**: Google and LinkedIn authentication
- **Loading States**: Visual feedback during authentication
- **Success States**: Success animation before redirect
- **Accessibility**: Full ARIA support and keyboard navigation

### Usage Examples

#### Basic Login Form

```typescript
<AuthForm mode="login" />
```

#### Register Form with Mode Toggle

```typescript
<AuthForm 
  mode="register"
  onModeChange={(newMode) => setMode(newMode)}
/>
```

#### Modal Context with Success Callback

```typescript
<AuthForm 
  mode="login"
  isModal={true}
  onSuccess={() => {
    closeModal()
    router.push('/dashboard')
  }}
  onModeChange={(newMode) => setMode(newMode)}
/>
```

### Validation Rules

- **Email**: Required, valid email format
- **Password**: Required, minimum 6 characters
- **Confirm Password** (register only): Required, must match password
- **Full Name** (register only): Required

### Error Handling

The component handles various error types:

- **Validation Errors**: Inline field-level errors
- **Network Errors**: Offline detection with retry button
- **Authentication Errors**: Invalid credentials, user not found, etc.
- **OAuth Errors**: Popup blocked, access denied, provider errors
- **Rate Limit Errors**: Too many attempts with retry delay

---

## AuthLayout

Split-screen layout component for authentication pages with responsive design.

### Import

```typescript
import { AuthLayout } from '@/components/auth/auth-layout'
```

### Props

```typescript
interface AuthLayoutProps {
  children: React.ReactNode
  mode: 'login' | 'register'
  illustrationContent?: React.ReactNode
}
```

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `children` | `React.ReactNode` | Yes | - | Form content to display in the left panel |
| `mode` | `'login' \| 'register'` | Yes | - | Determines illustration content to show |
| `illustrationContent` | `React.ReactNode` | No | `<IllustrationPanel mode={mode} />` | Custom illustration content |

### Responsive Behavior

- **Desktop (≥1024px)**: Two-column grid (40% form, 60% illustration)
- **Tablet (768px-1023px)**: Single column (illustration hidden)
- **Mobile (<768px)**: Single column (illustration hidden)

### Usage Examples

#### Basic Usage

```typescript
<AuthLayout mode="login">
  <AuthForm mode="login" />
</AuthLayout>
```

#### Custom Illustration Content

```typescript
<AuthLayout 
  mode="register"
  illustrationContent={<CustomIllustration />}
>
  <AuthForm mode="register" />
</AuthLayout>
```

### Accessibility

- Semantic HTML with `<main>` and `<aside>` elements
- ARIA labels for screen readers
- Proper focus management

---

## AuthModal

Modal dialog component for in-app authentication without page navigation.

### Import

```typescript
import { AuthModal } from '@/components/auth/auth-modal'
```

### Props

The component uses the `useAuthModal` hook for state management and doesn't accept props directly.

### Features

- **Focus Management**: Traps focus within modal, restores focus on close
- **Backdrop Click**: Closes modal when clicking outside
- **ESC Key**: Closes modal when pressing Escape
- **Body Scroll Lock**: Prevents background scrolling when open
- **Mode Switching**: Smooth animation when switching between login/register
- **Responsive**: Adapts to mobile and desktop screens

### Usage

The modal is controlled via the `useAuthModal` hook:

```typescript
import { useAuthModal } from '@/hooks/use-auth-modal'

function MyComponent() {
  const { openLogin, openRegister } = useAuthModal()
  
  return (
    <>
      <button onClick={openLogin}>Login</button>
      <button onClick={openRegister}>Sign Up</button>
    </>
  )
}
```

### Global Setup

Add the modal to your root layout:

```typescript
// app/layout.tsx
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

---

## IllustrationPanel

Animated illustration panel that displays rotating content showcasing platform features.

### Import

```typescript
import { IllustrationPanel } from '@/components/auth/illustration-panel'
```

### Props

```typescript
interface IllustrationPanelProps {
  mode: 'login' | 'register'
}
```

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `mode` | `'login' \| 'register'` | Yes | Determines which illustration set to display |

### Features

- **Auto-rotation**: Slides change every 5 seconds
- **Smooth Transitions**: Fade and scale animations
- **Manual Navigation**: Click indicators to jump to specific slide
- **Responsive**: Adapts to different screen sizes
- **Accessible**: Keyboard navigation and ARIA labels

### Illustration Content

Content is defined in `@/data/illustration-content.tsx`:

- **Login Mode**: Welcome message, platform statistics, feature highlights
- **Register Mode**: Join community, capabilities showcase, testimonials

### Usage

```typescript
<IllustrationPanel mode="login" />
```

---

## LazyAuthModal

Lazy-loaded wrapper for AuthModal to optimize bundle size.

### Import

```typescript
import { LazyAuthModal } from '@/components/auth/lazy-auth-modal'
```

### Features

- **Code Splitting**: Modal code is loaded on demand
- **Suspense Fallback**: Shows nothing while loading
- **Preloading**: Can be preloaded on user interaction

### Usage

```typescript
// In root layout
<LazyAuthModal />
```

### Preloading

```typescript
import { preloadAuthModal } from '@/components/auth/lazy-auth-modal'

// Preload on hover
<button 
  onClick={openLogin}
  onMouseEnter={preloadAuthModal}
>
  Login
</button>
```

---

## OAuthFallbackInstructions

Component that displays helpful instructions when OAuth authentication fails.

### Import

```typescript
import { OAuthFallbackInstructions } from '@/components/auth/oauth-fallback-instructions'
```

### Props

```typescript
interface OAuthFallbackInstructionsProps {
  provider: 'google' | 'linkedin'
  errorType: 'popup_blocked' | 'access_denied' | 'general'
}
```

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `provider` | `'google' \| 'linkedin'` | Yes | OAuth provider that failed |
| `errorType` | `'popup_blocked' \| 'access_denied' \| 'general'` | Yes | Type of OAuth error |

### Usage

```typescript
<OAuthFallbackInstructions 
  provider="google"
  errorType="popup_blocked"
/>
```

---

## Hooks

### useAuthModal

Global state management hook for the authentication modal.

#### Import

```typescript
import { useAuthModal } from '@/hooks/use-auth-modal'
```

#### API

```typescript
interface UseAuthModal {
  isOpen: boolean
  mode: 'login' | 'register'
  openLogin: () => void
  openRegister: () => void
  close: () => void
  setMode: (mode: 'login' | 'register') => void
}
```

#### Usage

```typescript
const { isOpen, mode, openLogin, openRegister, close, setMode } = useAuthModal()

// Open login modal
openLogin()

// Open register modal
openRegister()

// Close modal
close()

// Switch mode
setMode('register')
```

### useNetworkStatus

Hook for monitoring network connectivity status.

#### Import

```typescript
import { useNetworkStatus } from '@/hooks/use-network-status'
```

#### API

```typescript
interface NetworkStatus {
  isOnline: boolean
  isOffline: boolean
  effectiveType?: '4g' | '3g' | '2g' | 'slow-2g'
  downlink?: number
  rtt?: number
  isSlow: boolean
}
```

#### Usage

```typescript
const networkStatus = useNetworkStatus()

if (networkStatus.isOffline) {
  // Show offline warning
}

if (networkStatus.isSlow) {
  // Show slow connection warning
}
```

---

## Utilities

### Error Handling

#### parseSupabaseError

Parses Supabase errors into user-friendly messages.

```typescript
import { parseSupabaseError } from '@/lib/errors/auth-errors'

const parsedError = parseSupabaseError(error)
// Returns: { type, message, isRetryable, retryAfter }
```

#### Error Types

```typescript
enum AuthErrorType {
  VALIDATION = 'validation',
  AUTHENTICATION = 'authentication',
  NETWORK = 'network',
  OAUTH = 'oauth',
  RATE_LIMIT = 'rate_limit',
  SERVER = 'server',
  UNKNOWN = 'unknown'
}
```

### Retry Logic

#### retryAsync

Utility for retrying failed operations with exponential backoff.

```typescript
import { retryAsync } from '@/lib/utils/retry'

await retryAsync(
  async () => await someOperation(),
  {
    maxAttempts: 2,
    initialDelay: 2000,
    shouldRetry: (error) => isRetryableError(error),
  }
)
```

---

## Styling

All components use Tailwind CSS for styling with the following design tokens:

### Colors

- Primary: `blue-600`
- Success: `green-600`
- Error: `red-600`
- Background: `white`, `gray-50`

### Breakpoints

- Mobile: `< 768px`
- Tablet: `768px - 1023px`
- Desktop: `≥ 1024px`

### Animations

- Fade in/out: `300ms`
- Scale: `0.95` to `1.0`
- Slide: `8px` (0.5rem)

---

## Accessibility

All components follow WCAG 2.1 AA standards:

- **Keyboard Navigation**: Full keyboard support
- **Screen Readers**: Proper ARIA labels and live regions
- **Focus Management**: Visible focus indicators
- **Color Contrast**: Minimum 4.5:1 ratio
- **Touch Targets**: Minimum 44x44px

---

## Performance

### Bundle Sizes

- AuthForm: ~8KB
- AuthModal: ~5KB (lazy loaded)
- Illustrations: ~2KB each (lazy loaded)

### Optimizations

- Code splitting for modal and illustrations
- Lazy loading with Suspense
- Preloading on user interaction
- Optimized animations with `will-change`

---

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

## Examples

### Complete Login Page

```typescript
// app/auth/login/page.tsx
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

### Complete Register Page

```typescript
// app/auth/register/page.tsx
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

### Header with Modal Triggers

```typescript
// components/layout/header.tsx
import { useAuthModal } from '@/hooks/use-auth-modal'
import { preloadAuthModal } from '@/components/auth/lazy-auth-modal'

export function Header() {
  const { openLogin, openRegister } = useAuthModal()
  
  return (
    <header>
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
    </header>
  )
}
```

---

## Troubleshooting

### Modal doesn't open

- Ensure `<LazyAuthModal />` is added to root layout
- Check that `useAuthModal` hook is being called correctly

### Illustrations not loading

- Check that illustration content is defined in `@/data/illustration-content.tsx`
- Verify lazy loading is working (check Network tab)

### OAuth errors

- Ensure popup blockers are disabled
- Check OAuth provider configuration
- Verify redirect URLs are correct

### Network errors

- Check browser console for actual error messages
- Verify API endpoints are accessible
- Test with different network conditions

---

## Migration Guide

### From Old Auth Pages

1. Replace old form components with `<AuthForm>`
2. Wrap pages with `<AuthLayout>`
3. Add `<LazyAuthModal />` to root layout
4. Update navigation to use `useAuthModal` hook

### Example Migration

**Before:**
```typescript
// Old login page
export default function LoginPage() {
  return (
    <div className="container">
      <LoginForm />
    </div>
  )
}
```

**After:**
```typescript
// New login page
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

---

## Contributing

When adding new features to authentication components:

1. Update this API documentation
2. Add TypeScript types for all props
3. Include usage examples
4. Test accessibility
5. Verify responsive design
6. Check performance impact

---

## Related Documentation

- [Design Document](../../.kiro/specs/auth-page-redesign/design.md)
- [Requirements Document](../../.kiro/specs/auth-page-redesign/requirements.md)
- [Illustration Components](./illustrations/README.md)
- [Auth Store](../../store/auth.ts)
