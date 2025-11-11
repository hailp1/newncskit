# Implementation Plan - Responsive Design

## Overview
Implementation tasks để chuẩn hóa responsive design toàn bộ website NCSKIT cho mobile, tablet, và desktop.

---

## Phase 1: Core Infrastructure

### - [ ] 1. Create viewport detection hook
- Create `hooks/use-viewport.ts` with viewport detection logic
- Implement debounced resize listener
- Export viewport state (isMobile, isTablet, isDesktop, width, height)
- Add orientation detection
- _Requirements: 1.1, 2.1, 3.1_

### - [ ] 2. Create responsive utilities
- Create `lib/responsive-utils.ts` with helper functions
- Add breakpoint constants (MOBILE, TABLET, DESKTOP)
- Create utility functions for responsive classes
- Add touch detection utilities
- _Requirements: 4.1, 8.1_

### - [ ] 3. Update Tailwind configuration
- Review and optimize breakpoint values in `tailwind.config.ts`
- Add custom responsive utilities if needed
- Configure container max-widths
- Add touch-friendly spacing scale
- _Requirements: 1.1, 2.1, 3.1_

---

## Phase 2: Layout Components

### - [ ] 4. Create responsive layout wrapper
- Create `components/layout/responsive-layout.tsx`
- Implement mobile/tablet/desktop layout variants
- Add sidebar state management
- Handle layout transitions smoothly
- _Requirements: 1.1, 2.1, 3.1_

### - [ ] 5. Update header component for all breakpoints
- Update `components/layout/header.tsx`
- Mobile: Compact header with hamburger menu
- Tablet: Medium header with partial navigation
- Desktop: Full header with all navigation items
- Ensure sticky positioning works on all devices
- _Requirements: 5.1, 5.2, 5.3_

### - [ ] 6. Refactor sidebar with responsive variants
- Update `components/layout/sidebar.tsx`
- Mobile: Full-screen drawer overlay with backdrop
- Tablet: Icon-only sidebar (64px) with expand on hover
- Desktop: Fixed sidebar (256px) with full content
- Add smooth transitions between states
- _Requirements: 1.2, 2.2, 3.2, 5.2, 5.3_

### - [ ] 7. Update dashboard layout
- Update `app/(dashboard)/layout.tsx`
- Implement responsive padding and spacing
- Handle sidebar visibility per breakpoint
- Add mobile-friendly footer
- _Requirements: 1.1, 2.1, 3.1_

---

## Phase 3: Reusable Components

### - [ ] 8. Create responsive grid component
- Create `components/ui/responsive-grid.tsx`
- Support configurable columns per breakpoint
- Add responsive gap spacing
- Handle empty states gracefully
- _Requirements: 2.4, 3.4, 4.2_

### - [ ] 9. Create responsive table component
- Create `components/ui/responsive-table.tsx`
- Mobile: Convert to card layout
- Tablet: Horizontal scroll with sticky columns
- Desktop: Full table display
- Add sorting and filtering
- _Requirements: 4.2_

### - [ ] 10. Update modal component
- Update `components/ui/modal.tsx` or create responsive version
- Mobile: Full-screen modal
- Tablet/Desktop: Centered modal with backdrop
- Add swipe-to-close on mobile
- Ensure proper focus management
- _Requirements: 4.4_

### - [ ] 11. Create responsive card component
- Create `components/ui/responsive-card.tsx`
- Adjust padding per breakpoint
- Handle image aspect ratios
- Add touch-friendly interactions
- _Requirements: 4.1, 8.1_

---

## Phase 4: Page Updates

### - [ ] 12. Update dashboard page
- Update `app/(dashboard)/dashboard/page.tsx`
- Mobile: Single column layout, stacked cards
- Tablet: 2-column grid
- Desktop: 3-column grid with sidebar
- Optimize quick actions for touch
- _Requirements: 1.1, 2.1, 3.1, 4.1_

### - [ ] 13. Update profile page
- Update `app/(dashboard)/profile/page.tsx`
- Mobile: Stacked sections, full-width cards
- Tablet: 2-column layout for info cards
- Desktop: Optimized grid layout
- Make avatar upload touch-friendly
- _Requirements: 1.1, 2.1, 3.1, 4.1_

### - [ ] 14. Update blog admin page
- Update `app/(dashboard)/blog-admin/page.tsx`
- Mobile: Card view for posts
- Tablet: List view with actions
- Desktop: Table view with all columns
- Add responsive filters and search
- _Requirements: 1.1, 2.1, 3.1, 4.2_

### - [ ] 15. Update admin pages
- Update admin dashboard and sub-pages
- Ensure all admin tables are responsive
- Make user management mobile-friendly
- Optimize permissions page for all devices
- _Requirements: 1.1, 2.1, 3.1, 4.2_

### - [ ] 16. Update settings pages
- Update `app/(dashboard)/settings/page.tsx`
- Mobile: Stacked form fields
- Tablet: 2-column form layout
- Desktop: Optimized form with sidebar
- Make all inputs touch-friendly (min 44px height)
- _Requirements: 4.3, 8.1_

---

## Phase 5: Typography & Content

### - [ ] 17. Implement responsive typography system
- Create typography utility classes
- Mobile: Base font sizes (14-16px)
- Tablet: Medium font sizes (15-17px)
- Desktop: Larger font sizes (16-18px)
- Ensure proper line-height and spacing
- _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

### - [ ] 18. Update all headings
- Audit all h1-h6 elements across the site
- Apply responsive typography classes
- Ensure proper hierarchy on all devices
- Test readability at all breakpoints
- _Requirements: 6.1, 6.2, 6.3_

### - [ ] 19. Optimize content spacing
- Review and update padding/margin across all pages
- Mobile: Compact spacing (16-24px)
- Tablet: Medium spacing (24-32px)
- Desktop: Comfortable spacing (32-48px)
- Ensure consistent spacing scale
- _Requirements: 1.1, 2.1, 3.1_

---

## Phase 6: Images & Media

### - [ ] 20. Implement responsive images
- Create `components/ui/responsive-image.tsx`
- Add srcset for different screen sizes
- Implement lazy loading
- Use WebP with fallback
- Add loading skeletons
- _Requirements: 7.1, 7.2, 7.3, 7.5_

### - [ ] 21. Update all image components
- Replace standard img tags with responsive component
- Add proper alt text for accessibility
- Optimize image sizes for each breakpoint
- Test loading performance
- _Requirements: 7.1, 7.2, 7.3_

### - [ ] 22. Handle video embeds
- Create responsive video wrapper
- Maintain 16:9 aspect ratio
- Add play/pause controls for mobile
- Ensure videos don't autoplay on mobile
- _Requirements: 7.4_

---

## Phase 7: Touch Optimization

### - [ ] 23. Increase touch target sizes
- Audit all interactive elements (buttons, links, inputs)
- Ensure minimum 44x44px touch targets
- Add adequate spacing between touch targets
- Test on real mobile devices
- _Requirements: 1.4, 8.1, 8.2_

### - [ ] 24. Add touch feedback
- Implement active states for all interactive elements
- Add ripple effect or scale animation on tap
- Ensure immediate visual feedback
- Test touch responsiveness
- _Requirements: 8.1_

### - [ ] 25. Implement swipe gestures
- Add swipe-to-close for modals on mobile
- Implement swipe navigation where appropriate
- Add swipe-to-delete for list items
- Ensure gestures don't conflict with scrolling
- _Requirements: 8.2_

### - [ ] 26. Optimize scroll performance
- Implement smooth scrolling
- Add scroll-to-top button on mobile
- Optimize long lists with virtual scrolling
- Test scroll performance on low-end devices
- _Requirements: 8.5, 9.4_

---

## Phase 8: Performance Optimization

### - [ ] 27. Implement code splitting
- Split code by route
- Lazy load heavy components
- Use dynamic imports for modals and drawers
- Measure and optimize bundle sizes
- _Requirements: 9.5_

### - [ ] 28. Optimize images loading
- Implement progressive image loading
- Add blur-up placeholders
- Use appropriate image formats (WebP, AVIF)
- Compress images without quality loss
- _Requirements: 7.2, 7.3, 7.5, 9.3_

### - [ ] 29. Add loading skeletons
- Create skeleton components for all major sections
- Show skeletons during data fetching
- Match skeleton layout to actual content
- Ensure smooth transition from skeleton to content
- _Requirements: 9.1, 9.2_

### - [ ] 30. Optimize CSS and animations
- Use CSS transforms instead of position changes
- Implement will-change for animated elements
- Reduce animation complexity on mobile
- Test animation performance
- _Requirements: 9.4_

---

## Phase 9: Accessibility

### - [ ] 31. Ensure keyboard navigation
- Test all interactive elements with keyboard
- Add visible focus indicators
- Implement skip links for mobile
- Ensure logical tab order
- _Requirements: 10.2, 10.5_

### - [ ] 32. Add ARIA labels
- Add proper ARIA labels to all interactive elements
- Announce layout changes to screen readers
- Add role attributes where needed
- Test with screen readers (NVDA, JAWS, VoiceOver)
- _Requirements: 10.3_

### - [ ] 33. Test zoom functionality
- Test 200% zoom on all pages
- Ensure no horizontal scroll at 200% zoom
- Verify all content remains accessible
- Test on different browsers
- _Requirements: 10.1_

### - [ ] 34. Verify color contrast
- Audit all text/background color combinations
- Ensure WCAG AA compliance (4.5:1 for normal text)
- Test in different lighting conditions
- Add high contrast mode support
- _Requirements: 10.4_

---

## Phase 10: Testing & Refinement

### - [ ] 35. Cross-browser testing
- Test on Chrome, Firefox, Safari, Edge
- Test on mobile browsers (Chrome Mobile, Safari iOS)
- Fix browser-specific issues
- Document any known limitations
- _Requirements: All_

### - [ ] 36. Real device testing
- Test on actual mobile devices (iOS and Android)
- Test on tablets (iPad, Android tablets)
- Test on various desktop screen sizes
- Gather feedback from real users
- _Requirements: All_

### - [ ] 37. Performance testing
- Measure Core Web Vitals on all devices
- Test on slow 3G connection
- Optimize based on performance metrics
- Ensure targets are met (FCP < 1.5s, LCP < 2.5s)
- _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

### - [ ] 38. Accessibility audit
- Run automated accessibility tests (axe, Lighthouse)
- Manual testing with keyboard only
- Screen reader testing
- Fix all accessibility issues
- _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

### - [ ] 39. Visual regression testing
- Set up visual regression tests for all breakpoints
- Capture screenshots at mobile, tablet, desktop sizes
- Compare against baseline
- Fix any visual regressions
- _Requirements: All_

### - [ ] 40. Final polish and documentation
- Review all pages for consistency
- Update component documentation
- Create responsive design guidelines
- Document breakpoints and patterns
- _Requirements: All_

---

## Notes

- Each task should be completed and tested before moving to the next
- Test on real devices whenever possible, not just browser DevTools
- Prioritize mobile experience as it's the most constrained
- Keep performance in mind throughout implementation
- Document any decisions or trade-offs made during implementation
