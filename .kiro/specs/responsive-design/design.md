# Design Document - Responsive Design System

## Overview

Thiết kế hệ thống responsive toàn diện cho website NCSKIT, đảm bảo trải nghiệm người dùng tối ưu trên mọi thiết bị từ mobile (320px) đến desktop (1920px+). Sử dụng mobile-first approach với Tailwind CSS và Next.js 16.

## Architecture

### Responsive Strategy

```
Mobile First Approach:
1. Base styles cho mobile (<768px)
2. Tablet breakpoint (md: 768px)
3. Desktop breakpoint (lg: 1024px)
4. Large desktop (xl: 1280px, 2xl: 1536px)
```

### Breakpoint System

```typescript
// tailwind.config.ts
screens: {
  'sm': '640px',   // Small mobile landscape
  'md': '768px',   // Tablet portrait
  'lg': '1024px',  // Tablet landscape / Small desktop
  'xl': '1280px',  // Desktop
  '2xl': '1536px'  // Large desktop
}
```

### Layout Architecture

```
┌─────────────────────────────────────┐
│           Header (Fixed)            │ <- Sticky top, responsive height
├─────────────┬───────────────────────┤
│   Sidebar   │   Main Content        │ <- Sidebar: hidden/overlay/fixed
│  (Adaptive) │   (Fluid width)       │
│             │                       │
│             │   ┌─────────────┐    │
│             │   │  Component  │    │ <- Responsive components
│             │   └─────────────┘    │
└─────────────┴───────────────────────┘
```

## Components and Interfaces

### 1. Responsive Layout Component

```typescript
// components/layout/responsive-layout.tsx
interface ResponsiveLayoutProps {
  children: React.ReactNode
  sidebar?: React.ReactNode
  header?: React.ReactNode
  showSidebar?: boolean
}

// Behavior:
// Mobile: Sidebar as drawer overlay
// Tablet: Sidebar collapsible with icons
// Desktop: Sidebar fixed with full content
```

### 2. Responsive Header

```typescript
// components/layout/responsive-header.tsx
interface ResponsiveHeaderProps {
  user?: User
  onMenuToggle?: () => void
}

// Features:
// - Mobile: Hamburger menu, compact user menu
// - Tablet: Partial navigation, user dropdown
// - Desktop: Full navigation, expanded user menu
// - Sticky positioning on all devices
```

### 3. Responsive Sidebar

```typescript
// components/layout/responsive-sidebar.tsx
interface ResponsiveSidebarProps {
  isOpen: boolean
  onClose: () => void
  variant: 'mobile' | 'tablet' | 'desktop'
}

// Variants:
// - Mobile: Full-screen overlay with backdrop
// - Tablet: 64px icon-only, expandable on hover
// - Desktop: 256px fixed with full content
```

### 4. Responsive Grid System

```typescript
// components/ui/responsive-grid.tsx
interface ResponsiveGridProps {
  children: React.ReactNode
  cols?: {
    mobile?: number    // default: 1
    tablet?: number    // default: 2
    desktop?: number   // default: 3
  }
  gap?: number
}

// Usage:
<ResponsiveGrid cols={{ mobile: 1, tablet: 2, desktop: 3 }}>
  {items.map(item => <Card key={item.id} {...item} />)}
</ResponsiveGrid>
```

### 5. Responsive Table

```typescript
// components/ui/responsive-table.tsx
interface ResponsiveTableProps {
  data: any[]
  columns: Column[]
  mobileCardView?: boolean  // Convert to cards on mobile
}

// Behavior:
// Mobile: Card layout with stacked data
// Tablet: Horizontal scroll table
// Desktop: Full table with all columns
```

### 6. Responsive Modal

```typescript
// components/ui/responsive-modal.tsx
interface ResponsiveModalProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  fullScreenOnMobile?: boolean
}

// Behavior:
// Mobile: Full screen modal
// Tablet/Desktop: Centered modal with backdrop
```

## Data Models

### Viewport Context

```typescript
// hooks/use-viewport.ts
interface ViewportContext {
  width: number
  height: number
  isMobile: boolean      // < 768px
  isTablet: boolean      // 768-1024px
  isDesktop: boolean     // > 1024px
  orientation: 'portrait' | 'landscape'
}

// Usage:
const { isMobile, isTablet, isDesktop } = useViewport()
```

### Responsive State

```typescript
// store/responsive-store.ts
interface ResponsiveState {
  sidebarOpen: boolean
  sidebarVariant: 'mobile' | 'tablet' | 'desktop'
  headerHeight: number
  contentPadding: number
  
  // Actions
  toggleSidebar: () => void
  setSidebarVariant: (variant: string) => void
  updateDimensions: () => void
}
```

## Responsive Patterns

### Pattern 1: Responsive Typography

```typescript
// Base mobile-first typography
const typography = {
  h1: 'text-2xl md:text-3xl lg:text-4xl font-bold',
  h2: 'text-xl md:text-2xl lg:text-3xl font-semibold',
  h3: 'text-lg md:text-xl lg:text-2xl font-semibold',
  body: 'text-sm md:text-base lg:text-lg',
  small: 'text-xs md:text-sm'
}
```

### Pattern 2: Responsive Spacing

```typescript
// Consistent spacing scale
const spacing = {
  section: 'py-8 md:py-12 lg:py-16',
  container: 'px-4 md:px-6 lg:px-8',
  card: 'p-4 md:p-6 lg:p-8',
  gap: 'gap-4 md:gap-6 lg:gap-8'
}
```

### Pattern 3: Responsive Images

```typescript
// components/ui/responsive-image.tsx
<Image
  src={src}
  alt={alt}
  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
  className="w-full h-auto object-cover"
  loading="lazy"
/>
```

### Pattern 4: Responsive Navigation

```typescript
// Mobile: Hamburger + Drawer
<MobileNav>
  <HamburgerButton onClick={toggleMenu} />
  <Drawer isOpen={isOpen}>
    <NavItems />
  </Drawer>
</MobileNav>

// Desktop: Full Navigation
<DesktopNav>
  <NavItems horizontal />
</DesktopNav>
```

## Implementation Strategy

### Phase 1: Core Layout Components
1. Create responsive layout wrapper
2. Update header for all breakpoints
3. Refactor sidebar with variants
4. Add viewport detection hook

### Phase 2: Component Library
1. Create responsive grid system
2. Build responsive table component
3. Update modal for mobile fullscreen
4. Create responsive card components

### Phase 3: Page Updates
1. Dashboard page responsive
2. Profile page responsive
3. Admin pages responsive
4. Blog pages responsive
5. Settings pages responsive

### Phase 4: Touch Optimization
1. Increase touch target sizes (min 44x44px)
2. Add touch feedback animations
3. Implement swipe gestures
4. Optimize scroll performance

### Phase 5: Performance Optimization
1. Lazy load images with responsive sizes
2. Code split by breakpoint
3. Optimize bundle size
4. Add loading skeletons

## Error Handling

### Viewport Detection Errors

```typescript
// Fallback to desktop if detection fails
try {
  const viewport = detectViewport()
} catch (error) {
  console.error('Viewport detection failed:', error)
  // Default to desktop layout
  return 'desktop'
}
```

### Image Loading Errors

```typescript
// Fallback images for different sizes
<Image
  src={src}
  fallback="/images/placeholder-mobile.jpg"
  onError={(e) => {
    e.target.src = '/images/placeholder.jpg'
  }}
/>
```

## Testing Strategy

### Visual Regression Testing

```typescript
// Test responsive layouts at all breakpoints
describe('Responsive Layout', () => {
  const viewports = [
    { width: 375, height: 667, name: 'iPhone SE' },
    { width: 768, height: 1024, name: 'iPad' },
    { width: 1920, height: 1080, name: 'Desktop' }
  ]
  
  viewports.forEach(viewport => {
    it(`renders correctly on ${viewport.name}`, () => {
      cy.viewport(viewport.width, viewport.height)
      cy.visit('/dashboard')
      cy.matchImageSnapshot()
    })
  })
})
```

### Touch Interaction Testing

```typescript
// Test touch targets
it('all interactive elements meet 44x44px minimum', () => {
  cy.get('button, a, input').each($el => {
    const { width, height } = $el[0].getBoundingClientRect()
    expect(width).to.be.at.least(44)
    expect(height).to.be.at.least(44)
  })
})
```

### Performance Testing

```typescript
// Test mobile performance
it('loads within 3 seconds on 3G', () => {
  cy.throttle('3G')
  cy.visit('/dashboard')
  cy.window().then(win => {
    const perfData = win.performance.timing
    const loadTime = perfData.loadEventEnd - perfData.navigationStart
    expect(loadTime).to.be.lessThan(3000)
  })
})
```

## Accessibility Considerations

### Keyboard Navigation
- All interactive elements accessible via keyboard
- Visible focus indicators at all breakpoints
- Skip links for mobile navigation

### Screen Reader Support
- Proper ARIA labels for responsive components
- Announce layout changes
- Semantic HTML structure

### Zoom Support
- Support 200% zoom without horizontal scroll
- Maintain readability at all zoom levels
- Preserve functionality when zoomed

## Performance Metrics

### Target Metrics
- First Contentful Paint: < 1.5s (mobile), < 1s (desktop)
- Largest Contentful Paint: < 2.5s (mobile), < 2s (desktop)
- Time to Interactive: < 3s (mobile), < 2s (desktop)
- Cumulative Layout Shift: < 0.1
- First Input Delay: < 100ms

### Bundle Size Targets
- Initial bundle: < 200KB (gzipped)
- Per-route chunks: < 50KB (gzipped)
- Images: WebP with fallback, lazy loaded
- Fonts: Subset and preload critical fonts

## Migration Plan

### Step 1: Audit Current State
- Identify non-responsive components
- List pages needing updates
- Document current breakpoints

### Step 2: Create Base Components
- Responsive layout wrapper
- Viewport detection hook
- Responsive utilities

### Step 3: Update Core Layout
- Header responsive
- Sidebar responsive
- Footer responsive

### Step 4: Update Pages (Priority Order)
1. Dashboard (high traffic)
2. Auth pages (critical path)
3. Profile pages (user-facing)
4. Admin pages (internal)
5. Blog pages (content)

### Step 5: Testing & Refinement
- Test on real devices
- Gather user feedback
- Performance optimization
- Accessibility audit

## Maintenance Guidelines

### Adding New Components
1. Start with mobile design
2. Add tablet breakpoint
3. Add desktop breakpoint
4. Test on real devices
5. Document responsive behavior

### Updating Existing Components
1. Check current responsive behavior
2. Identify issues at each breakpoint
3. Apply fixes mobile-first
4. Test across all breakpoints
5. Update documentation

### Code Review Checklist
- [ ] Mobile layout tested (< 768px)
- [ ] Tablet layout tested (768-1024px)
- [ ] Desktop layout tested (> 1024px)
- [ ] Touch targets minimum 44x44px
- [ ] Images have responsive sizes
- [ ] Text readable at all sizes
- [ ] No horizontal scroll
- [ ] Smooth transitions between breakpoints
- [ ] Accessibility maintained
- [ ] Performance impact minimal
