/**
 * Optimized D3 Utilities
 * Import only needed D3 modules instead of entire library
 */

// Only import specific D3 modules to reduce bundle size
// Instead of: import * as d3 from 'd3' (300 KB)
// We import: specific modules (~50 KB total)

export { scaleLinear, scaleTime, scaleBand, scaleOrdinal } from 'd3-scale'
export { line, area, arc, pie } from 'd3-shape'
export { axisBottom, axisLeft, axisRight, axisTop } from 'd3-axis'
export { select, selectAll } from 'd3-selection'
export { max, min, extent, mean, median, sum } from 'd3-array'
export { format } from 'd3-format'
export { timeFormat, timeParse } from 'd3-time-format'

/**
 * Common D3 patterns as utilities
 */

export function createLinearScale(
  domain: [number, number],
  range: [number, number]
) {
  const { scaleLinear } = require('d3-scale')
  return scaleLinear().domain(domain).range(range)
}

export function createTimeScale(
  domain: [Date, Date],
  range: [number, number]
) {
  const { scaleTime } = require('d3-scale')
  return scaleTime().domain(domain).range(range)
}

export function createBandScale(
  domain: string[],
  range: [number, number],
  padding: number = 0.1
) {
  const { scaleBand } = require('d3-scale')
  return scaleBand().domain(domain).range(range).padding(padding)
}

/**
 * Format numbers for display
 */
export function formatNumber(value: number, decimals: number = 2): string {
  return value.toFixed(decimals)
}

export function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(value)
}

/**
 * Calculate statistics
 */
export function calculateMean(values: number[]): number {
  return values.reduce((a, b) => a + b, 0) / values.length
}

export function calculateMedian(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid]
}

export function calculateStdDev(values: number[]): number {
  const mean = calculateMean(values)
  const squareDiffs = values.map(value => Math.pow(value - mean, 2))
  const avgSquareDiff = calculateMean(squareDiffs)
  return Math.sqrt(avgSquareDiff)
}

/**
 * Data transformation utilities
 */
export function groupBy<T>(
  array: T[],
  key: keyof T
): Record<string, T[]> {
  return array.reduce((result, item) => {
    const group = String(item[key])
    if (!result[group]) {
      result[group] = []
    }
    result[group].push(item)
    return result
  }, {} as Record<string, T[]>)
}

export function sortBy<T>(
  array: T[],
  key: keyof T,
  order: 'asc' | 'desc' = 'asc'
): T[] {
  return [...array].sort((a, b) => {
    const aVal = a[key]
    const bVal = b[key]
    if (aVal < bVal) return order === 'asc' ? -1 : 1
    if (aVal > bVal) return order === 'asc' ? 1 : -1
    return 0
  })
}
