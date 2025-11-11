/**
 * Responsive Card Component
 * Card that adapts padding and layout based on viewport
 */

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface ResponsiveCardProps {
  children: ReactNode
  className?: string
  padding?: 'none' | 'sm' | 'md' | 'lg'
  hover?: boolean
  onClick?: () => void
}

export function ResponsiveCard({
  children,
  className,
  padding = 'md',
  hover = false,
  onClick,
}: ResponsiveCardProps) {
  const paddingClasses = {
    none: '',
    sm: 'p-3 md:p-4 lg:p-4',
    md: 'p-4 md:p-6 lg:p-8',
    lg: 'p-6 md:p-8 lg:p-10',
  }

  return (
    <div
      className={cn(
        'bg-white rounded-lg border border-gray-200 shadow-sm transition-all',
        paddingClasses[padding],
        hover && 'hover:shadow-md hover:border-gray-300 cursor-pointer',
        onClick && 'cursor-pointer touch-target',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

/**
 * Card Header
 */
interface CardHeaderProps {
  children: ReactNode
  className?: string
}

export function CardHeader({ children, className }: CardHeaderProps) {
  return (
    <div className={cn('mb-4 md:mb-6', className)}>
      {children}
    </div>
  )
}

/**
 * Card Title
 */
interface CardTitleProps {
  children: ReactNode
  className?: string
}

export function CardTitle({ children, className }: CardTitleProps) {
  return (
    <h3 className={cn(
      'text-lg md:text-xl lg:text-2xl font-semibold text-gray-900',
      className
    )}>
      {children}
    </h3>
  )
}

/**
 * Card Description
 */
interface CardDescriptionProps {
  children: ReactNode
  className?: string
}

export function CardDescription({ children, className }: CardDescriptionProps) {
  return (
    <p className={cn(
      'text-sm md:text-base text-gray-600 mt-1',
      className
    )}>
      {children}
    </p>
  )
}

/**
 * Card Content
 */
interface CardContentProps {
  children: ReactNode
  className?: string
}

export function CardContent({ children, className }: CardContentProps) {
  return (
    <div className={cn('text-sm md:text-base', className)}>
      {children}
    </div>
  )
}

/**
 * Card Footer
 */
interface CardFooterProps {
  children: ReactNode
  className?: string
}

export function CardFooter({ children, className }: CardFooterProps) {
  return (
    <div className={cn(
      'mt-4 md:mt-6 pt-4 md:pt-6 border-t border-gray-200',
      className
    )}>
      {children}
    </div>
  )
}

/**
 * Card with Image
 */
interface ImageCardProps {
  image: string
  imageAlt: string
  title: string
  description?: string
  children?: ReactNode
  className?: string
  onClick?: () => void
}

export function ImageCard({
  image,
  imageAlt,
  title,
  description,
  children,
  className,
  onClick,
}: ImageCardProps) {
  return (
    <ResponsiveCard
      padding="none"
      hover={!!onClick}
      onClick={onClick}
      className={className}
    >
      <div className="aspect-video w-full overflow-hidden rounded-t-lg">
        <img
          src={image}
          alt={imageAlt}
          className="h-full w-full object-cover transition-transform hover:scale-105"
        />
      </div>
      <div className="p-4 md:p-6">
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
        {children && <div className="mt-4">{children}</div>}
      </div>
    </ResponsiveCard>
  )
}

/**
 * Stat Card - for displaying statistics
 */
interface StatCardProps {
  label: string
  value: string | number
  change?: {
    value: number
    trend: 'up' | 'down'
  }
  icon?: ReactNode
  className?: string
}

export function StatCard({ label, value, change, icon, className }: StatCardProps) {
  return (
    <ResponsiveCard padding="md" className={className}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-xs md:text-sm text-gray-600 uppercase tracking-wide">
            {label}
          </p>
          <p className="mt-2 text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">
            {value}
          </p>
          {change && (
            <p className={cn(
              'mt-2 text-xs md:text-sm font-medium',
              change.trend === 'up' ? 'text-green-600' : 'text-red-600'
            )}>
              {change.trend === 'up' ? '↑' : '↓'} {Math.abs(change.value)}%
            </p>
          )}
        </div>
        {icon && (
          <div className="flex-shrink-0 ml-4">
            <div className="w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              {icon}
            </div>
          </div>
        )}
      </div>
    </ResponsiveCard>
  )
}
