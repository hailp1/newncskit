/**
 * Responsive Table Component
 * Converts to card layout on mobile, horizontal scroll on tablet, full table on desktop
 */

'use client'

import { ReactNode } from 'react'
import { useViewport } from '@/hooks/use-viewport'
import { cn } from '@/lib/utils'

export interface Column<T = any> {
  key: string
  header: string
  render?: (item: T) => ReactNode
  className?: string
  mobileLabel?: string // Custom label for mobile card view
}

interface ResponsiveTableProps<T = any> {
  data: T[]
  columns: Column<T>[]
  keyExtractor: (item: T, index: number) => string | number
  mobileCardView?: boolean
  className?: string
  onRowClick?: (item: T) => void
}

export function ResponsiveTable<T = any>({
  data,
  columns,
  keyExtractor,
  mobileCardView = true,
  className,
  onRowClick,
}: ResponsiveTableProps<T>) {
  const { isMobile } = useViewport()

  // Mobile: Card view
  if (isMobile && mobileCardView) {
    return (
      <div className={cn('space-y-4', className)}>
        {data.map((item, index) => (
          <div
            key={keyExtractor(item, index)}
            className={cn(
              'bg-white rounded-lg border border-gray-200 p-4 shadow-sm',
              onRowClick && 'cursor-pointer hover:shadow-md touch-target'
            )}
            onClick={() => onRowClick?.(item)}
          >
            {columns.map((column) => (
              <div key={column.key} className="flex justify-between py-2 border-b border-gray-100 last:border-0">
                <span className="font-medium text-gray-700 text-sm">
                  {column.mobileLabel || column.header}:
                </span>
                <span className="text-gray-900 text-sm text-right">
                  {column.render ? column.render(item) : (item as any)[column.key]}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    )
  }

  // Tablet/Desktop: Table view with horizontal scroll on tablet
  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className={cn(
                  'px-4 py-3 md:px-6 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
                  column.className
                )}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((item, index) => (
            <tr
              key={keyExtractor(item, index)}
              className={cn(
                'hover:bg-gray-50 transition-colors',
                onRowClick && 'cursor-pointer'
              )}
              onClick={() => onRowClick?.(item)}
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={cn(
                    'px-4 py-4 md:px-6 md:py-4 whitespace-nowrap text-sm text-gray-900',
                    column.className
                  )}
                >
                  {column.render ? column.render(item) : (item as any)[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      
      {data.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No data available
        </div>
      )}
    </div>
  )
}

/**
 * Simple responsive table with basic styling
 */
interface SimpleTableProps {
  headers: string[]
  rows: (string | ReactNode)[][]
  className?: string
}

export function SimpleTable({ headers, rows, className }: SimpleTableProps) {
  const { isMobile } = useViewport()

  if (isMobile) {
    return (
      <div className={cn('space-y-4', className)}>
        {rows.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm"
          >
            {headers.map((header, colIndex) => (
              <div key={colIndex} className="flex justify-between py-2 border-b border-gray-100 last:border-0">
                <span className="font-medium text-gray-700 text-sm">{header}:</span>
                <span className="text-gray-900 text-sm text-right">{row[colIndex]}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {headers.map((header, index) => (
              <th
                key={index}
                className="px-4 py-3 md:px-6 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-gray-50">
              {row.map((cell, cellIndex) => (
                <td
                  key={cellIndex}
                  className="px-4 py-4 md:px-6 md:py-4 whitespace-nowrap text-sm text-gray-900"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
