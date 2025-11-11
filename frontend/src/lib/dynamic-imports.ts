/**
 * Dynamic Import Utilities
 * Centralized lazy loading for heavy components and libraries
 */

import dynamic from 'next/dynamic'
import React, { ComponentType } from 'react'

/**
 * Create a lazy-loaded component with loading state
 */
export function createLazyComponent<P = {}>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  LoadingComponent?: ComponentType
) {
  return dynamic(importFn, {
    loading: LoadingComponent ? () => React.createElement(LoadingComponent) : undefined,
    ssr: false,
  })
}

/**
 * Lazy load heavy libraries
 */
export const lazyLibraries = {
  // XLSX for Excel export (500 KB)
  xlsx: () => import('xlsx'),
  
  // D3 modules (only load what's needed)
  d3Scale: () => import('d3-scale'),
  d3Shape: () => import('d3-shape'),
  d3Axis: () => import('d3-axis'),
  d3Array: () => import('d3-array'),
  
  // Chart.js (200 KB)
  chartjs: () => import('chart.js'),
  
  // HTML2Canvas for screenshots (80 KB)
  html2canvas: () => import('html2canvas'),
  
  // DOMPurify for sanitization (50 KB)
  dompurify: () => import('dompurify'),
}

/**
 * Export to Excel with lazy-loaded XLSX
 */
export async function exportToExcel(
  data: any[],
  filename: string = 'export.xlsx',
  sheetName: string = 'Data'
) {
  const XLSX = await lazyLibraries.xlsx()
  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, sheetName)
  XLSX.writeFile(wb, filename)
}

/**
 * Take screenshot with lazy-loaded html2canvas
 */
export async function takeScreenshot(
  element: HTMLElement,
  filename: string = 'screenshot.png'
) {
  const html2canvas = (await lazyLibraries.html2canvas()).default
  const canvas = await html2canvas(element)
  const link = document.createElement('a')
  link.download = filename
  link.href = canvas.toDataURL()
  link.click()
}

/**
 * Sanitize HTML with lazy-loaded DOMPurify
 */
export async function sanitizeHTML(dirty: string): Promise<string> {
  const DOMPurify = (await lazyLibraries.dompurify()).default
  return DOMPurify.sanitize(dirty)
}

/**
 * Preload a component (for better UX)
 */
export function preloadComponent(
  importFn: () => Promise<any>
): void {
  importFn().catch(() => {
    // Silently fail preload
  })
}

/**
 * Lazy load with retry logic
 */
export async function lazyLoadWithRetry<T>(
  importFn: () => Promise<T>,
  retries: number = 3,
  delay: number = 1000
): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await importFn()
    } catch (error) {
      if (i === retries - 1) throw error
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  throw new Error('Failed to load module after retries')
}
