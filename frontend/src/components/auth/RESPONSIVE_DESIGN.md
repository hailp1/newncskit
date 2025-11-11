# Responsive Design Guide

This document describes the responsive design implementation for the authentication system.

## Table of Contents

1. [Breakpoints](#breakpoints)
2. [Layout Behavior](#layout-behavior)
3. [Component Adaptations](#component-adaptations)
4. [Touch Targets](#touch-targets)
5. [Typography](#typography)
6. [Spacing](#spacing)
7. [Testing](#testing)

---

## Breakpoints

The authentication system uses three primary breakpoints:

```typescript
const breakpoints = {
  mobile: '< 768px',
  tablet: '768px - 1023px',
  desktop: '≥ 1024px'
}
```

### Tailwind CSS Classes

```css
/* Mobile-first approach */
.class                  /* < 768px (mobile) */
.sm:class              /* ≥ 640px */
.md:class              /* ≥ 768px (tablet) */
.lg:class              /* ≥ 1024px (desktop) */
.xl:class              /* ≥ 1280px */
.2xl:class             /* ≥ 1536px */
```

---

## Layout Behavior

### AuthLayout Component

#### Desktop (≥1024px)

```
┌─────────────────────────────────────────────────┐
│                                                 │
│  ┌──────────────┐  ┌─────────────────────────┐ │
│  │              │  │                         │ │
│  │     Form     │  │     Illustrations       │ │
│  │    (40%)     │  │        (60%)            │ │
│  │              │  │                         │ │
│  └──────────────┘  └─────────────────────────┘ │
│                                                 │
└─────────────────────────────────────────────────┘
```

**Implementation**:
```tsx
<div className="lg:grid lg:grid-cols-[40%_60%]">
  <main className="lg:px-8">
    {/* Form content */}
  </main>
  <aside className="hidden lg:flex">
    {/* Illustration content */}
  </aside>
</div>
```

#### Tablet (768px - 1023px)

```
┌─────────────────────────────────────────────────┐
│                                                 │
│              ┌──────────────┐                   │
│              │              │                   │
│              │     Form     │                   │
│              │   (100%)     │                   │
│              │              │                   │
│              └──────────────┘                   │
│                                                 │
└─────────────────────────────────────────────────┘
```

**Behavior**:
- Single-column layout
- Form centered with max-width
- Illustrations hidden
- Increased padding

#### Mobile (<768px)

```
┌───────────────────────┐
│                       │
│   ┌───────────────┐   │
│   │               │   │
│   │     Form      │   │
│   │    (100%)     │   │
│   │               │   │
│   └───────────────┘   │
│                       │
└───────────────────────┘
```

**Behavior**:
- Single-column layout
- Form takes full width
- Illustrations hidden
- Minimal padding
- Larger touch targets

---

## Component Adaptations

### AuthForm

#### Desktop
```tsx
<div className="space-y-6">
  <h2 className="text-3xl">Title</h2>
  <input className="py-2 text-sm" />
  <button className="text-sm">Submit</button>
</div>
```

#### Mobile
```tsx
<div className="space-y-4">
  <h2 className="text-2xl">Title</h2>
  <input className="py-3 text-base min-h-[44px]" />
  <button className="text-base min-h-[44px]">Submit</button>
</div>
```

**Key Changes**:
- Reduced spacing on mobile (`space-y-4` vs `space-y-6`)
- Larger text on mobile (`text-base` vs `text-sm`)
- Larger inputs on mobile (`py-3` vs `py-2`)
- Minimum touch target size (`min-h-[44px]`)

### AuthModal

#### Desktop
```tsx
<Dialog.Content className="max-w-md p-6">
  {/* Modal content */}
</Dialog.Content>
```

#### Mobile
```tsx
<Dialog.Content className="w-[calc(100%-2rem)] p-4">
  {/* Modal content */}
</Dialog.Content>
```

**Key Changes**:
- Full width with margin on mobile
- Reduced padding on mobile
- Larger close button on mobile

### IllustrationPanel

#### Desktop
```tsx
<div className="p-12">
  <h2 className="text-3xl">Title</h2>
  <p className="text-base">Description</p>
</div>
```

#### Mobile
```tsx
<div className="hidden lg:flex">
  {/* Hidden on mobile */}
</div>
```

**Behavior**:
- Completely hidden on mobile and tablet
- Only visible on desktop (≥1024px)
- Saves bandwidth and improves performance

---

## Touch Targets

All interactive elements meet WCAG 2.1 AA standards for touch target size.

### Minimum Size: 44x44 pixels

#### Form Inputs
```tsx
<input className="min-h-[44px] px-3 py-3 md:py-2" />
```

#### Buttons
```tsx
<button className="min-h-[44px] px-4 py-3 md:py-2" />
```

#### Links
```tsx
<a className="min-h-[44px] inline-flex items-center px-1" />
```

#### OAuth Buttons
```tsx
<button className="min-h-[44px] px-4" />
```

#### Slide Indicators
```tsx
<button className="min-w-[44px] min-h-[44px] flex items-center justify-center">
  <span className="h-2 w-2" />
</button>
```

### Touch Target Spacing

Maintain minimum 8px spacing between touch targets:

```tsx
<div className="grid grid-cols-2 gap-3">
  <button className="min-h-[44px]">Google</button>
  <button className="min-h-[44px]">LinkedIn</button>
</div>
```

---

## Typography

### Heading Sizes

| Element | Mobile | Desktop |
|---------|--------|---------|
| Page Title | `text-2xl` (24px) | `text-3xl` (30px) |
| Section Title | `text-xl` (20px) | `text-2xl` (24px) |
| Subsection | `text-lg` (18px) | `text-xl` (20px) |

### Body Text

| Element | Mobile | Desktop |
|---------|--------|---------|
| Form Labels | `text-base` (16px) | `text-sm` (14px) |
| Input Text | `text-base` (16px) | `text-sm` (14px) |
| Button Text | `text-base` (16px) | `text-sm` (14px) |
| Helper Text | `text-sm` (14px) | `text-xs` (12px) |
| Error Text | `text-sm` (14px) | `text-sm` (14px) |

### Implementation

```tsx
<h2 className="text-2xl md:text-3xl">
  Đăng nhập vào NCSKIT
</h2>

<input 
  className="text-base md:text-sm"
  placeholder="Email"
/>

<button className="text-base md:text-sm">
  Đăng nhập
</button>
```

### Font Weights

- Headings: `font-extrabold` (800)
- Buttons: `font-medium` (500)
- Body: `font-normal` (400)
- Labels: `font-medium` (500)

---

## Spacing

### Container Padding

| Screen Size | Padding |
|-------------|---------|
| Mobile | `px-4` (16px) |
| Tablet | `px-6` (24px) |
| Desktop | `px-8` (32px) |

### Vertical Spacing

| Screen Size | Form Spacing | Section Spacing |
|-------------|--------------|-----------------|
| Mobile | `space-y-4` (16px) | `py-8` (32px) |
| Tablet | `space-y-6` (24px) | `py-12` (48px) |
| Desktop | `space-y-6` (24px) | `py-12` (48px) |

### Implementation

```tsx
<main className="px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
  <div className="space-y-4 sm:space-y-6">
    {/* Form content */}
  </div>
</main>
```

---

## Testing

### Device Testing Matrix

| Device | Screen Size | Orientation | Priority |
|--------|-------------|-------------|----------|
| iPhone SE | 375x667 | Portrait | High |
| iPhone 12 Pro | 390x844 | Portrait | High |
| iPhone 12 Pro | 844x390 | Landscape | Medium |
| iPad Mini | 768x1024 | Portrait | Medium |
| iPad Pro | 1024x1366 | Portrait | Medium |
| Desktop | 1920x1080 | - | High |
| Desktop | 1366x768 | - | Medium |

### Browser Testing

- Chrome (Desktop & Mobile)
- Safari (Desktop & Mobile)
- Firefox (Desktop)
- Edge (Desktop)

### Testing Checklist

#### Layout
- [ ] Form displays correctly on all screen sizes
- [ ] Illustrations hidden on mobile/tablet
- [ ] Modal adapts to screen size
- [ ] No horizontal scrolling

#### Touch Targets
- [ ] All buttons are at least 44x44px
- [ ] All inputs are at least 44px tall
- [ ] Links have adequate touch area
- [ ] Spacing between targets is sufficient

#### Typography
- [ ] Text is readable on all screen sizes
- [ ] Font sizes scale appropriately
- [ ] Line heights are comfortable
- [ ] No text overflow

#### Spacing
- [ ] Padding is appropriate for screen size
- [ ] Spacing between elements is consistent
- [ ] Content doesn't touch screen edges
- [ ] Vertical rhythm is maintained

#### Interactions
- [ ] Tap targets work on touch devices
- [ ] Hover states work on desktop
- [ ] Focus states are visible
- [ ] Animations are smooth

---

## Responsive Utilities

### Custom Breakpoint Hook

```typescript
import { useEffect, useState } from 'react'

export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = useState<'mobile' | 'tablet' | 'desktop'>('desktop')
  
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      if (width < 768) {
        setBreakpoint('mobile')
      } else if (width < 1024) {
        setBreakpoint('tablet')
      } else {
        setBreakpoint('desktop')
      }
    }
    
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  
  return breakpoint
}
```

### Usage

```typescript
const breakpoint = useBreakpoint()

if (breakpoint === 'mobile') {
  // Mobile-specific logic
}
```

### Media Query Hook

```typescript
export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false)
  
  useEffect(() => {
    const media = window.matchMedia(query)
    setMatches(media.matches)
    
    const listener = (e: MediaQueryListEvent) => setMatches(e.matches)
    media.addEventListener('change', listener)
    return () => media.removeEventListener('change', listener)
  }, [query])
  
  return matches
}
```

### Usage

```typescript
const isMobile = useMediaQuery('(max-width: 767px)')
const isDesktop = useMediaQuery('(min-width: 1024px)')
```

---

## Performance Considerations

### Mobile Optimizations

1. **Hide Illustrations**: Reduces initial load time
2. **Lazy Load Modal**: Only load when needed
3. **Optimize Images**: Use appropriate sizes
4. **Reduce Animations**: Simpler animations on mobile

### Implementation

```tsx
// Hide illustrations on mobile
<aside className="hidden lg:flex">
  <IllustrationPanel mode={mode} />
</aside>

// Lazy load modal
const AuthModal = lazy(() => import('./auth-modal'))

// Conditional animations
<div className={`
  transition-all duration-300
  ${isMobile ? 'duration-200' : 'duration-300'}
`}>
```

---

## Accessibility

### Responsive Accessibility

- **Touch Targets**: Minimum 44x44px on all devices
- **Text Size**: Minimum 16px on mobile (prevents zoom)
- **Contrast**: Maintained across all screen sizes
- **Focus Indicators**: Visible on all devices
- **Screen Readers**: Work on mobile and desktop

### Mobile-Specific Considerations

- **Zoom Prevention**: Use 16px minimum font size
- **Orientation**: Support both portrait and landscape
- **Keyboard**: Support external keyboards on tablets
- **Voice Control**: Ensure proper labeling

---

## Common Patterns

### Responsive Container

```tsx
<div className="
  w-full max-w-md mx-auto
  px-4 sm:px-6 lg:px-8
  py-8 sm:py-12
">
  {/* Content */}
</div>
```

### Responsive Grid

```tsx
<div className="
  grid grid-cols-1 gap-3
  sm:grid-cols-2 sm:gap-4
  lg:grid-cols-3 lg:gap-6
">
  {/* Items */}
</div>
```

### Responsive Text

```tsx
<h1 className="
  text-2xl sm:text-3xl lg:text-4xl
  font-bold
">
  Title
</h1>
```

### Responsive Spacing

```tsx
<div className="
  space-y-4 sm:space-y-6 lg:space-y-8
">
  {/* Content */}
</div>
```

---

## Troubleshooting

### Common Issues

**Text too small on mobile**:
- Ensure minimum 16px font size
- Use `text-base` instead of `text-sm`

**Touch targets too small**:
- Add `min-h-[44px]` to all interactive elements
- Increase padding on mobile

**Layout breaks on tablet**:
- Test at 768px and 1023px breakpoints
- Use `md:` and `lg:` prefixes appropriately

**Horizontal scrolling**:
- Check for fixed widths
- Use `max-w-full` or `w-full`
- Ensure proper container padding

---

## Best Practices

1. **Mobile-First**: Start with mobile styles, add desktop enhancements
2. **Touch-Friendly**: Ensure all targets are at least 44x44px
3. **Readable Text**: Use 16px minimum on mobile
4. **Test Real Devices**: Emulators don't catch everything
5. **Performance**: Hide non-essential content on mobile
6. **Accessibility**: Maintain standards across all screen sizes

---

## Related Documentation

- [API Documentation](./AUTH_COMPONENTS_API.md)
- [Authentication Flow](./AUTH_FLOW_GUIDE.md)
- [Design Document](../../.kiro/specs/auth-page-redesign/design.md)
