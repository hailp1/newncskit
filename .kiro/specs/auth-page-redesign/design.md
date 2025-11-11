# Design Document - Authentication Page Redesign

## Overview

This design outlines the technical approach for redesigning the authentication pages (login and register) with a modern split-screen layout and modal-based authentication. The solution will provide a seamless user experience across desktop and mobile devices while maintaining the existing authentication logic.

## Architecture

### High-Level Structure

```
┌─────────────────────────────────────────────────────────┐
│                    Auth Pages Layer                      │
│  ┌──────────────────┐      ┌──────────────────┐        │
│  │  Login Page      │      │  Register Page   │        │
│  │  (Full Screen)   │      │  (Full Screen)   │        │
│  └──────────────────┘      └──────────────────┘        │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│              Shared Components Layer                     │
│  ┌──────────────────┐      ┌──────────────────┐        │
│  │  AuthLayout      │      │  AuthModal       │        │
│  │  (Split Screen)  │      │  (Dialog)        │        │
│  └──────────────────┘      └──────────────────┘        │
│  ┌──────────────────┐      ┌──────────────────┐        │
│  │  AuthForm        │      │  IllustrationPanel│       │
│  │  (Login/Register)│      │  (Visuals)       │        │
│  └──────────────────┘      └──────────────────┘        │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                  Auth Store (Zustand)                    │
│         Existing authentication logic                    │
└─────────────────────────────────────────────────────────┘
```

### Component Hierarchy

```
AuthLayout (Split Screen Container)
├── FormPanel (Left - 40% on desktop)
│   └── AuthForm (Login or Register)
│       ├── Form Fields
│       ├── Submit Button
│       └── OAuth Buttons
└── IllustrationPanel (Right - 60% on desktop)
    └── IllustrationCarousel
        ├── Chart Illustration
        ├── Feature Showcase
        └── Testimonial

AuthModal (Dialog Component)
└── AuthForm (Login or Register)
    ├── Form Fields
    ├── Submit Button
    ├── OAuth Buttons
    └── Mode Toggle (Login ↔ Register)
```

## Components and Interfaces

### 1. AuthLayout Component

**Purpose:** Provides the split-screen layout wrapper for full-page authentication

**Props:**
```typescript
interface AuthLayoutProps {
  children: React.ReactNode
  illustrationContent?: React.ReactNode
  mode: 'login' | 'register'
}
```

**Responsibilities:**
- Render two-column layout on desktop (≥1024px)
- Render single-column layout on mobile (<1024px)
- Pass mode to illustration panel for contextual content
- Handle responsive breakpoints

**Styling:**
- Desktop: `grid grid-cols-[40%_60%]`
- Mobile: `flex flex-col`
- Min height: `min-h-screen`

---

### 2. AuthForm Component

**Purpose:** Reusable form component for both login and register, used in both full-page and modal contexts

**Props:**
```typescript
interface AuthFormProps {
  mode: 'login' | 'register'
  onModeChange?: (mode: 'login' | 'register') => void
  onSuccess?: () => void
  isModal?: boolean
  redirectTo?: string
}
```

**State:**
```typescript
interface AuthFormState {
  email: string
  password: string
  confirmPassword?: string // Only for register
  fullName?: string // Only for register
  isLoading: boolean
  error: string | null
}
```

**Responsibilities:**
- Render appropriate fields based on mode (login vs register)
- Handle form validation
- Call auth store methods (login, register, loginWithGoogle, loginWithLinkedIn)
- Display error messages
- Show loading states
- Provide mode toggle link (for modal usage)

**Key Methods:**
- `handleSubmit()` - Process form submission
- `handleOAuthLogin(provider)` - Handle OAuth flows
- `validateForm()` - Client-side validation

---

### 3. IllustrationPanel Component

**Purpose:** Display engaging visual content on the right side of the auth pages

**Props:**
```typescript
interface IllustrationPanelProps {
  mode: 'login' | 'register'
}
```

**State:**
```typescript
interface IllustrationState {
  currentSlide: number
  slides: IllustrationSlide[]
}

interface IllustrationSlide {
  id: string
  type: 'chart' | 'feature' | 'testimonial'
  content: React.ReactNode
  title: string
  description: string
}
```

**Responsibilities:**
- Display contextual illustrations based on mode
- Auto-rotate slides every 5 seconds
- Provide smooth fade transitions
- Show different content for login vs register

**Content Examples:**
- **Login Mode:**
  - "Welcome back" message
  - Recent platform statistics
  - Quick access features preview
  
- **Register Mode:**
  - "Join thousands of researchers"
  - Platform capabilities showcase
  - Success stories/testimonials

---

### 4. AuthModal Component

**Purpose:** Modal dialog for in-app authentication without page navigation

**Props:**
```typescript
interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  initialMode?: 'login' | 'register'
  onSuccess?: () => void
}
```

**State:**
```typescript
interface AuthModalState {
  mode: 'login' | 'register'
}
```

**Responsibilities:**
- Render modal dialog with backdrop
- Prevent body scroll when open
- Handle ESC key and backdrop click to close
- Switch between login and register modes
- Close automatically on successful authentication

**Implementation:**
- Use Radix UI Dialog or Headless UI Dialog
- Backdrop: `bg-black/50`
- Modal: `max-w-md w-full`
- Animation: Fade in/out with scale

---

### 5. useAuthModal Hook

**Purpose:** Global state management for auth modal

**Interface:**
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

**Implementation:**
```typescript
// Using Zustand for global state
const useAuthModal = create<UseAuthModal>((set) => ({
  isOpen: false,
  mode: 'login',
  openLogin: () => set({ isOpen: true, mode: 'login' }),
  openRegister: () => set({ isOpen: true, mode: 'register' }),
  close: () => set({ isOpen: false }),
  setMode: (mode) => set({ mode }),
}))
```

---

## Data Models

### Illustration Content Data

```typescript
interface IllustrationContent {
  login: IllustrationSlide[]
  register: IllustrationSlide[]
}

const illustrationContent: IllustrationContent = {
  login: [
    {
      id: 'welcome',
      type: 'feature',
      title: 'Chào mừng trở lại',
      description: 'Tiếp tục nghiên cứu của bạn',
      content: <WelcomeIllustration />
    },
    {
      id: 'stats',
      type: 'chart',
      title: 'Phân tích dữ liệu mạnh mẽ',
      description: 'Hơn 10,000 phân tích đã hoàn thành',
      content: <StatsChart />
    },
    {
      id: 'features',
      type: 'feature',
      title: 'Công cụ toàn diện',
      description: 'Từ khảo sát đến báo cáo',
      content: <FeaturesShowcase />
    }
  ],
  register: [
    {
      id: 'join',
      type: 'feature',
      title: 'Tham gia cộng đồng',
      description: 'Hàng nghìn nhà nghiên cứu tin tưởng',
      content: <JoinIllustration />
    },
    {
      id: 'capabilities',
      type: 'chart',
      title: 'Khả năng vượt trội',
      description: 'Phân tích thống kê chuyên nghiệp',
      content: <CapabilitiesChart />
    },
    {
      id: 'testimonial',
      type: 'testimonial',
      title: 'Câu chuyện thành công',
      description: 'Từ người dùng thực tế',
      content: <TestimonialCard />
    }
  ]
}
```

---

## File Structure

```
frontend/src/
├── components/
│   └── auth/
│       ├── auth-layout.tsx          # Split screen layout
│       ├── auth-form.tsx            # Reusable form component
│       ├── auth-modal.tsx           # Modal dialog
│       ├── illustration-panel.tsx   # Right side illustrations
│       ├── illustration-carousel.tsx # Slide rotation
│       └── illustrations/
│           ├── welcome-illustration.tsx
│           ├── stats-chart.tsx
│           ├── features-showcase.tsx
│           ├── join-illustration.tsx
│           ├── capabilities-chart.tsx
│           └── testimonial-card.tsx
├── hooks/
│   └── use-auth-modal.ts           # Global modal state
├── app/
│   └── auth/
│       ├── login/
│       │   └── page.tsx            # Updated login page
│       └── register/
│           └── page.tsx            # Updated register page
└── data/
    └── illustration-content.ts     # Illustration data
```

---

## Error Handling

### Form Validation Errors

```typescript
const validationErrors = {
  emailRequired: 'Email là bắt buộc',
  emailInvalid: 'Email không hợp lệ',
  passwordRequired: 'Mật khẩu là bắt buộc',
  passwordTooShort: 'Mật khẩu phải có ít nhất 6 ký tự',
  passwordMismatch: 'Mật khẩu không khớp',
  fullNameRequired: 'Họ tên là bắt buộc'
}
```

### Authentication Errors

- Display errors from auth store
- Show inline error messages above form
- Clear errors on new submission
- Maintain form state on error

### Network Errors

- Detect offline state
- Show retry button
- Graceful degradation for OAuth

---

## Testing Strategy

### Unit Tests

1. **AuthForm Component**
   - Test form validation logic
   - Test mode switching
   - Test error display
   - Test loading states

2. **IllustrationPanel Component**
   - Test slide rotation
   - Test content rendering based on mode
   - Test transition animations

3. **useAuthModal Hook**
   - Test state management
   - Test open/close actions
   - Test mode switching

### Integration Tests

1. **Full Page Flow**
   - Test login page rendering
   - Test register page rendering
   - Test form submission
   - Test OAuth flows
   - Test responsive layout

2. **Modal Flow**
   - Test modal open/close
   - Test mode switching in modal
   - Test successful authentication closes modal
   - Test backdrop and ESC key behavior

### Visual Regression Tests

- Desktop layout (1920x1080)
- Tablet layout (768x1024)
- Mobile layout (375x667)
- Modal appearance
- Illustration transitions

---

## Responsive Design

### Breakpoints

```typescript
const breakpoints = {
  mobile: '< 768px',
  tablet: '768px - 1023px',
  desktop: '≥ 1024px'
}
```

### Layout Behavior

**Desktop (≥1024px):**
- Two-column grid layout
- Form panel: 40% width, max-w-md
- Illustration panel: 60% width
- Modal: max-w-md centered

**Tablet (768px - 1023px):**
- Single column layout
- Hide illustration panel
- Form takes full width with max-w-md
- Modal: max-w-md with side padding

**Mobile (<768px):**
- Single column layout
- Hide illustration panel
- Form takes full width
- Modal: Full width with minimal padding
- Larger touch targets (min 44x44px)

---

## Performance Considerations

### Code Splitting

- Lazy load illustration components
- Lazy load modal component
- Preload auth modal on user interaction

### Image Optimization

- Use Next.js Image component for illustrations
- Provide multiple sizes for responsive images
- Use WebP format with fallbacks

### Animation Performance

- Use CSS transforms for transitions
- Use `will-change` for animated elements
- Debounce slide transitions

### Bundle Size

- Share AuthForm between page and modal
- Minimize illustration component size
- Use SVG for icons and simple graphics

---

## Accessibility

### Keyboard Navigation

- Tab order: Form fields → Submit → OAuth buttons → Mode toggle
- ESC key closes modal
- Focus trap in modal
- Focus management on modal open/close

### Screen Readers

- Proper ARIA labels for all form fields
- ARIA live regions for error messages
- ARIA modal attributes
- Descriptive alt text for illustrations

### Color Contrast

- WCAG AA compliance for all text
- Error messages with sufficient contrast
- Focus indicators clearly visible

---

## Migration Strategy

### Phase 1: Create New Components
- Build AuthLayout, AuthForm, IllustrationPanel
- Build AuthModal and useAuthModal hook
- Create illustration content

### Phase 2: Update Pages
- Update login page to use new components
- Update register page to use new components
- Maintain backward compatibility

### Phase 3: Add Modal Support
- Add AuthModal to root layout
- Add login/register buttons that trigger modal
- Test modal flows

### Phase 4: Polish & Test
- Add animations and transitions
- Responsive testing
- Accessibility audit
- Performance optimization

---

## Design Decisions

### Why Split 40/60 Instead of 50/50?

- Form needs less space (max-w-md is sufficient)
- Illustration benefits from more space for visual impact
- Creates visual hierarchy favoring the illustration

### Why Separate AuthForm Component?

- Reusability between full page and modal
- Single source of truth for form logic
- Easier testing and maintenance

### Why Zustand for Modal State?

- Already used in the project (auth store)
- Simple API for global state
- No additional dependencies

### Why Auto-Rotate Illustrations?

- Keeps user engaged during form filling
- Showcases multiple platform features
- Creates dynamic, modern feel

### Why Not Show Illustration in Modal?

- Modal should be focused and minimal
- Limited space in modal view
- Faster load time without illustrations
