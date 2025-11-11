/**
 * Responsive Utilities
 * Helper functions and constants for responsive design
 */

import { BREAKPOINTS } from '@/hooks/use-viewport'

// Re-export breakpoints for convenience
export { BREAKPOINTS }

// Breakpoint constants
export const MOBILE_MAX = BREAKPOINTS.mobile - 1
export const TABLET_MIN = BREAKPOINTS.mobile
export const TABLET_MAX = BREAKPOINTS.tablet - 1
export const DESKTOP_MIN = BREAKPOINTS.tablet

/**
 * Check if current width is mobile
 */
export function isMobileWidth(width: number): boolean {
  return width < BREAKPOINTS.mobile
}

/**
 * Check if current width is tablet
 */
export function isTabletWidth(width: number): boolean {
  return width >= BREAKPOINTS.mobile && width < BREAKPOINTS.tablet
}

/**
 * Check if current width is desktop
 */
export function isDesktopWidth(width: number): boolean {
  return width >= BREAKPOINTS.tablet
}

/**
 * Get responsive class based on viewport
 */
export function getResponsiveClass(
  mobile: string,
  tablet: string,
  desktop: string,
  currentWidth: number
): string {
  if (isMobileWidth(currentWidth)) return mobile
  if (isTabletWidth(currentWidth)) return tablet
  return desktop
}

/**
 * Touch detection utilities
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
 * Check if device has hover capability
 */
export function hasHoverCapability(): boolean {
  if (typeof window === 'undefined') return true
  
  return window.matchMedia('(hover: hover)').matches
}

/**
 * Get optimal image size based on viewport width
 */
export function getOptimalImageSize(width: number): 'small' | 'medium' | 'large' {
  if (width < BREAKPOINTS.mobile) return 'small'
  if (width < BREAKPOINTS.tablet) return 'medium'
  return 'large'
}

/**
 * Calculate responsive font size
 */
export function getResponsiveFontSize(
  baseSize: number,
  width: number,
  minSize: number = baseSize * 0.875,
  maxSize: number = baseSize * 1.125
): number {
  if (width < BREAKPOINTS.mobile) return minSize
  if (width >= BREAKPOINTS.desktop) return maxSize
  
  // Linear interpolation between mobile and desktop
  const ratio = (width - BREAKPOINTS.mobile) / (BREAKPOINTS.desktop - BREAKPOINTS.mobile)
  return minSize + (maxSize - minSize) * ratio
}

/**
 * Get responsive spacing value
 */
export function getResponsiveSpacing(
  width: number,
  mobileSpacing: number = 16,
  tabletSpacing: number = 24,
  desktopSpacing: number = 32
): number {
  if (width < BREAKPOINTS.mobile) return mobileSpacing
  if (width < BREAKPOINTS.tablet) return tabletSpacing
  return desktopSpacing
}

/**
 * Responsive grid columns calculator
 */
export function getResponsiveColumns(
  width: number,
  mobileColumns: number = 1,
  tabletColumns: number = 2,
  desktopColumns: number = 3
): number {
  if (width < BREAKPOINTS.mobile) return mobileColumns
  if (width < BREAKPOINTS.tablet) return tabletColumns
  return desktopColumns
}

/**
 * Check if element meets minimum touch target size (44x44px)
 */
export function meetsTouchTargetSize(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect()
  return rect.width >= 44 && rect.height >= 44
}

/**
 * Get safe area insets for notched devices
 */
export function getSafeAreaInsets() {
  if (typeof window === 'undefined' || !CSS.supports) {
    return { top: 0, right: 0, bottom: 0, left: 0 }
  }

  const getInset = (position: string) => {
    const value = getComputedStyle(document.documentElement)
      .getPropertyValue(`env(safe-area-inset-${position})`)
    return parseInt(value) || 0
  }

  return {
    top: getInset('top'),
    right: getInset('right'),
    bottom: getInset('bottom'),
    left: getInset('left'),
  }
}

/**
 * Responsive breakpoint media queries
 */
export const mediaQueries = {
  mobile: `(max-width: ${MOBILE_MAX}px)`,
  tablet: `(min-width: ${TABLET_MIN}px) and (max-width: ${TABLET_MAX}px)`,
  desktop: `(min-width: ${DESKTOP_MIN}px)`,
  mobileAndTablet: `(max-width: ${TABLET_MAX}px)`,
  tabletAndDesktop: `(min-width: ${TABLET_MIN}px)`,
  touch: '(hover: none) and (pointer: coarse)',
  hover: '(hover: hover) and (pointer: fine)',
} as const

/**
 * Responsive container max-widths
 */
export const containerMaxWidths = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const

/**
 * Responsive typography scale
 */
export const typographyScale = {
  mobile: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '0.875rem', // 14px
    lg: '1rem',       // 16px
    xl: '1.125rem',   // 18px
    '2xl': '1.25rem', // 20px
    '3xl': '1.5rem',  // 24px
  },
  tablet: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
  },
  desktop: {
    xs: '0.875rem',   // 14px
    sm: '1rem',       // 16px
    base: '1.125rem', // 18px
    lg: '1.25rem',    // 20px
    xl: '1.5rem',     // 24px
    '2xl': '1.875rem', // 30px
    '3xl': '2.25rem', // 36px
  },
} as const
