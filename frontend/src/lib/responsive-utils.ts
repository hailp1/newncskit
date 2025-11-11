/**
 * Responsive Utilities
 * Helper functions for responsive design and touch interactions
 */

import { BREAKPOINTS } from '@/hooks/use-viewport'

// Re-export breakpoints for convenience
export { BREAKPOINTS }

/**
 * Check if current viewport is mobile
 */
export function isMobile(): boolean {
  if (typeof window === 'undefined') return false
  return window.innerWidth < BREAKPOINTS.mobile
}

/**
 * Check if current viewport is tablet
 */
export function isTablet(): boolean {
  if (typeof window === 'undefined') return false
  const width = window.innerWidth
  return width >= BREAKPOINTS.mobile && width < BREAKPOINTS.tablet
}

/**
 * Check if current viewport is desktop
 */
export function isDesktop(): boolean {
  if (typeof window === 'undefined') return true
  return window.innerWidth >= BREAKPOINTS.tablet
}

/**
 * Get responsive class based on viewport
 * @param mobileClass - Class for mobile
 * @param tabletClass - Class for tablet (optional, defaults to desktop)
 * @param desktopClass - Class for desktop
 */
export function getResponsiveClass(
  mobileClass: string,
  tabletClass: string | null,
  desktopClass: string
): string {
  if (typeof window === 'undefined') return desktopClass

  const width = window.innerWidth
  
  if (width < BREAKPOINTS.mobile) {
    return mobileClass
  } else if (width < BREAKPOINTS.tablet) {
    return tabletClass || desktopClass
  } else {
    return desktopClass
  }
}

/**
 * Generate responsive Tailwind classes
 * @param base - Base classes
 * @param mobile - Mobile-specific classes
 * @param tablet - Tablet-specific classes
 * @param desktop - Desktop-specific classes
 */
export function responsiveClasses(
  base: string = '',
  mobile: string = '',
  tablet: string = '',
  desktop: string = ''
): string {
  const classes = [base]
  
  if (mobile) classes.push(mobile)
  if (tablet) classes.push(`md:${tablet}`)
  if (desktop) classes.push(`lg:${desktop}`)
  
  return classes.filter(Boolean).join(' ')
}

/**
 * Touch Detection Utilities
 */

/**
 * Check if device supports touch
 */
export function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false
  
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    // @ts-ignore - for older browsers
    navigator.msMaxTouchPoints > 0
  )
}

/**
 * Check if device is likely a mobile device (combines touch + small screen)
 */
export function isMobileDevice(): boolean {
  return isTouchDevice() && isMobile()
}

/**
 * Get minimum touch target size (44x44px for accessibility)
 */
export const MIN_TOUCH_TARGET = 44

/**
 * Check if element meets minimum touch target size
 */
export function meetsTouchTarget(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect()
  return rect.width >= MIN_TOUCH_TARGET && rect.height >= MIN_TOUCH_TARGET
}

/**
 * Spacing Utilities
 */

/**
 * Get responsive spacing value
 * @param size - Size multiplier (1-8)
 * @returns Tailwind spacing class
 */
export function getResponsiveSpacing(size: number = 4): string {
  const mobile = Math.max(1, size - 1)
  const tablet = size
  const desktop = Math.min(8, size + 1)
  
  return `p-${mobile} md:p-${tablet} lg:p-${desktop}`
}

/**
 * Get responsive gap value
 * @param size - Size multiplier (1-8)
 * @returns Tailwind gap class
 */
export function getResponsiveGap(size: number = 4): string {
  const mobile = Math.max(1, size - 1)
  const tablet = size
  const desktop = Math.min(8, size + 1)
  
  return `gap-${mobile} md:gap-${tablet} lg:gap-${desktop}`
}

/**
 * Typography Utilities
 */

/**
 * Get responsive text size
 * @param size - Base size (sm, base, lg, xl, 2xl, etc.)
 * @returns Tailwind text size classes
 */
export function getResponsiveTextSize(size: string = 'base'): string {
  const sizeMap: Record<string, { mobile: string; tablet: string; desktop: string }> = {
    xs: { mobile: 'text-xs', tablet: 'md:text-xs', desktop: 'lg:text-sm' },
    sm: { mobile: 'text-xs', tablet: 'md:text-sm', desktop: 'lg:text-base' },
    base: { mobile: 'text-sm', tablet: 'md:text-base', desktop: 'lg:text-lg' },
    lg: { mobile: 'text-base', tablet: 'md:text-lg', desktop: 'lg:text-xl' },
    xl: { mobile: 'text-lg', tablet: 'md:text-xl', desktop: 'lg:text-2xl' },
    '2xl': { mobile: 'text-xl', tablet: 'md:text-2xl', desktop: 'lg:text-3xl' },
    '3xl': { mobile: 'text-2xl', tablet: 'md:text-3xl', desktop: 'lg:text-4xl' },
  }
  
  const sizes = sizeMap[size] || sizeMap.base
  return `${sizes.mobile} ${sizes.tablet} ${sizes.desktop}`
}

/**
 * Grid Utilities
 */

/**
 * Get responsive grid columns
 * @param mobile - Columns on mobile (default: 1)
 * @param tablet - Columns on tablet (default: 2)
 * @param desktop - Columns on desktop (default: 3)
 */
export function getResponsiveGrid(
  mobile: number = 1,
  tablet: number = 2,
  desktop: number = 3
): string {
  return `grid-cols-${mobile} md:grid-cols-${tablet} lg:grid-cols-${desktop}`
}

/**
 * Container Utilities
 */

/**
 * Get responsive container padding
 */
export function getContainerPadding(): string {
  return 'px-4 md:px-6 lg:px-8'
}

/**
 * Get responsive section padding
 */
export function getSectionPadding(): string {
  return 'py-8 md:py-12 lg:py-16'
}

/**
 * Image Utilities
 */

/**
 * Generate responsive image sizes attribute
 * @param mobile - Mobile viewport width (default: 100vw)
 * @param tablet - Tablet viewport width (default: 50vw)
 * @param desktop - Desktop viewport width (default: 33vw)
 */
export function getImageSizes(
  mobile: string = '100vw',
  tablet: string = '50vw',
  desktop: string = '33vw'
): string {
  return `(max-width: ${BREAKPOINTS.mobile}px) ${mobile}, (max-width: ${BREAKPOINTS.tablet}px) ${tablet}, ${desktop}`
}

/**
 * Orientation Utilities
 */

/**
 * Check if device is in portrait mode
 */
export function isPortrait(): boolean {
  if (typeof window === 'undefined') return true
  return window.innerHeight > window.innerWidth
}

/**
 * Check if device is in landscape mode
 */
export function isLandscape(): boolean {
  if (typeof window === 'undefined') return false
  return window.innerWidth > window.innerHeight
}

/**
 * Performance Utilities
 */

/**
 * Debounce function for resize events
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }
    
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Throttle function for scroll events
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

/**
 * Accessibility Utilities
 */

/**
 * Check if reduced motion is preferred
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Check if dark mode is preferred
 */
export function prefersDarkMode(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

/**
 * Get safe area insets for notched devices
 */
export function getSafeAreaInsets() {
  if (typeof window === 'undefined') {
    return { top: 0, right: 0, bottom: 0, left: 0 }
  }
  
  const style = getComputedStyle(document.documentElement)
  
  return {
    top: parseInt(style.getPropertyValue('env(safe-area-inset-top)') || '0'),
    right: parseInt(style.getPropertyValue('env(safe-area-inset-right)') || '0'),
    bottom: parseInt(style.getPropertyValue('env(safe-area-inset-bottom)') || '0'),
    left: parseInt(style.getPropertyValue('env(safe-area-inset-left)') || '0'),
  }
}
