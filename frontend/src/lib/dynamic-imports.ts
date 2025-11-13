/**
 * Dynamic Import Utilities
 * Centralized lazy loading for heavy components and libraries
 */

import dynamic from 'next/dynamic'
import { ComponentType, createElement } from 'react'

/**
 * Create a lazy-loaded component with loading state
 */
export function createLazyComponent<P = {}>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  LoadingComponent?: ComponentType
) {
  return dynamic(importFn, {
    loading: LoadingComponent ? () => createElement(LoadingComponent) : undefined,
    ssr: false,
  })
}

/**
 * Lazy load heavy libraries
 */
export const lazyLibraries = {
  // Excel writer for exports
  excelWriter: () => import('write-excel-file'),
  
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
  if (!data || data.length === 0) {
    throw new Error('No data provided for export')
  }

  const module = await lazyLibraries.excelWriter()
  const writeXlsxFile = (module as any).default || module

  const headers = Object.keys(data[0])
  const headerRow = headers.map((header) => ({
    value: header,
    fontWeight: 'bold'
  }))

  const sheetRows = [
    headerRow,
    ...data.map((item) =>
      headers.map((key) => {
        const value = item[key]
        if (value === null || value === undefined) {
          return null
        }
        if (value instanceof Date) {
          return { value, type: Date, format: 'yyyy-mm-dd' }
        }
        if (typeof value === 'number') {
          return { value, type: Number }
        }
        if (typeof value === 'boolean') {
          return { value, type: Boolean }
        }
        return { value: value.toString() }
      })
    )
  ]

  const widths = headers.map((header) => {
    const maxLength = data.reduce((max, item) => {
      const cell = item[header]
      const length = cell === null || cell === undefined ? 0 : cell.toString().length
      return Math.max(max, length)
    }, header.length)

    return { width: Math.min(Math.max(maxLength + 2, 10), 50) }
  })

  await writeXlsxFile([sheetRows], {
    fileName: filename,
    sheets: [sheetName],
    columns: [widths],
    dateFormat: 'yyyy-mm-dd'
  })
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
