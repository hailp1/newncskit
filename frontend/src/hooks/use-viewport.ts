/**
 * Viewport Detection Hook
 * Detects current viewport size and device type with debounced resize listener
 */

import { useState, useEffect } from 'react'

// Breakpoint constants matching Tailwind config
export const BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
  desktop: 1280,
} as const

export interface ViewportState {
  width: number
  height: number
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  orientation: 'portrait' | 'landscape'
}

/**
 * Custom hook to detect viewport dimensions and device type
 * @param debounceMs - Debounce delay for resize events (default: 150ms)
 * @returns ViewportState object with current viewport information
 */
export function useViewport(debounceMs: number = 150): ViewportState {
  const [viewport, setViewport] = useState<ViewportState>(() => {
    // Initialize with current window dimensions (SSR safe)
    if (typeof window === 'undefined') {
      return {
        width: 0,
        height: 0,
        isMobile: false,
        isTablet: false,
        isDesktop: true, // Default to desktop for SSR
        orientation: 'landscape',
      }
    }

    const width = window.innerWidth
    const height = window.innerHeight

    return {
      width,
      height,
      isMobile: width < BREAKPOINTS.mobile,
      isTablet: width >= BREAKPOINTS.mobile && width < BREAKPOINTS.tablet,
      isDesktop: width >= BREAKPOINTS.tablet,
      orientation: width > height ? 'landscape' : 'portrait',
    }
  })

  useEffect(() => {
    // Skip if running on server
    if (typeof window === 'undefined') return

    let timeoutId: NodeJS.Timeout

    const handleResize = () => {
      // Clear previous timeout
      clearTimeout(timeoutId)

      // Debounce resize events
      timeoutId = setTimeout(() => {
        const width = window.innerWidth
        const height = window.innerHeight

        setViewport({
          width,
          height,
          isMobile: width < BREAKPOINTS.mobile,
          isTablet: width >= BREAKPOINTS.mobile && width < BREAKPOINTS.tablet,
          isDesktop: width >= BREAKPOINTS.tablet,
          orientation: width > height ? 'landscape' : 'portrait',
        })
      }, debounceMs)
    }

    // Add resize listener
    window.addEventListener('resize', handleResize)

    // Add orientation change listener for mobile devices
    window.addEventListener('orientationchange', handleResize)

    // Cleanup
    return () => {
      clearTimeout(timeoutId)
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleResize)
    }
  }, [debounceMs])

  return viewport
}

/**
 * Helper function to get current viewport state without hook
 * Useful for one-time checks or server-side rendering
 */
export function getViewportState(): ViewportState {
  if (typeof window === 'undefined') {
    return {
      width: 0,
      height: 0,
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      orientation: 'landscape',
    }
  }

  const width = window.innerWidth
  const height = window.innerHeight

  return {
    width,
    height,
    isMobile: width < BREAKPOINTS.mobile,
    isTablet: width >= BREAKPOINTS.mobile && width < BREAKPOINTS.tablet,
    isDesktop: width >= BREAKPOINTS.tablet,
    orientation: width > height ? 'landscape' : 'portrait',
  }
}

/**
 * Helper function to check if device supports touch
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
