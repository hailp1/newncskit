/**
 * Responsive Grid Component
 * Configurable grid that adapts to different breakpoints
 */

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface ResponsiveGridProps {
  children: ReactNode
  cols?: {
    mobile?: number
    tablet?: number
    desktop?: number
  }
  gap?: number | {
    mobile?: number
    tablet?: number
    desktop?: number
  }
  className?: string
}

export function ResponsiveGrid({
  children,
  cols = { mobile: 1, tablet: 2, desktop: 3 },
  gap = 4,
  className,
}: ResponsiveGridProps) {
  // Handle gap as number or object
  const gapClasses = typeof gap === 'number'
    ? `gap-${gap}`
    : cn(
        gap.mobile && `gap-${gap.mobile}`,
        gap.tablet && `md:gap-${gap.tablet}`,
        gap.desktop && `lg:gap-${gap.desktop}`
      )

  // Generate grid column classes
  const gridColsClasses = cn(
    `grid-cols-${cols.mobile || 1}`,
    cols.tablet && `md:grid-cols-${cols.tablet}`,
    cols.desktop && `lg:grid-cols-${cols.desktop}`
  )

  return (
    <div className={cn(
      'grid',
      gridColsClasses,
      gapClasses,
      className
    )}>
      {children}
    </div>
  )
}

/**
 * Preset grid configurations
 */
export function ResponsiveGrid1({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <ResponsiveGrid cols={{ mobile: 1, tablet: 1, desktop: 1 }} className={className}>
      {children}
    </ResponsiveGrid>
  )
}

export function ResponsiveGrid2({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <ResponsiveGrid cols={{ mobile: 1, tablet: 2, desktop: 2 }} className={className}>
      {children}
    </ResponsiveGrid>
  )
}

export function ResponsiveGrid3({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <ResponsiveGrid cols={{ mobile: 1, tablet: 2, desktop: 3 }} className={className}>
      {children}
    </ResponsiveGrid>
  )
}

export function ResponsiveGrid4({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <ResponsiveGrid cols={{ mobile: 1, tablet: 2, desktop: 4 }} className={className}>
      {children}
    </ResponsiveGrid>
  )
}

/**
 * Auto-fit grid that automatically adjusts columns based on min width
 */
interface AutoGridProps {
  children: ReactNode
  minWidth?: number
  gap?: number
  className?: string
}

export function AutoGrid({
  children,
  minWidth = 250,
  gap = 4,
  className,
}: AutoGridProps) {
  return (
    <div
      className={cn(`grid gap-${gap}`, className)}
      style={{
        gridTemplateColumns: `repeat(auto-fit, minmax(${minWidth}px, 1fr))`,
      }}
    >
      {children}
    </div>
  )
}

/**
 * Masonry-style grid (CSS Grid approach)
 */
interface MasonryGridProps {
  children: ReactNode
  cols?: {
    mobile?: number
    tablet?: number
    desktop?: number
  }
  gap?: number
  className?: string
}

export function MasonryGrid({
  children,
  cols = { mobile: 1, tablet: 2, desktop: 3 },
  gap = 4,
  className,
}: MasonryGridProps) {
  const gridColsClasses = cn(
    `grid-cols-${cols.mobile || 1}`,
    cols.tablet && `md:grid-cols-${cols.tablet}`,
    cols.desktop && `lg:grid-cols-${cols.desktop}`
  )

  return (
    <div
      className={cn(
        'grid',
        gridColsClasses,
        `gap-${gap}`,
        className
      )}
      style={{
        gridAutoRows: '10px',
      }}
    >
      {children}
    </div>
  )
}
