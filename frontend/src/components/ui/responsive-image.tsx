/**
 * Responsive Image Component
 * Optimized image loading with srcset and lazy loading
 */

'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface ResponsiveImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  quality?: number
  fill?: boolean
  sizes?: string
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down'
  loading?: 'lazy' | 'eager'
  onLoad?: () => void
  onError?: () => void
}

export function ResponsiveImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  quality = 75,
  fill = false,
  sizes,
  objectFit = 'cover',
  loading = 'lazy',
  onLoad,
  onError,
}: ResponsiveImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const handleLoad = () => {
    setIsLoading(false)
    onLoad?.()
  }

  const handleError = () => {
    setIsLoading(false)
    setHasError(true)
    onError?.()
  }

  // Default sizes if not provided
  const defaultSizes = sizes || '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw'

  if (hasError) {
    return (
      <div className={cn(
        'flex items-center justify-center bg-gray-100 text-gray-400',
        className
      )}>
        <svg
          className="w-12 h-12"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
    )
  }

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      
      {fill ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={defaultSizes}
          quality={quality}
          priority={priority}
          className={cn(
            'transition-opacity duration-300',
            isLoading ? 'opacity-0' : 'opacity-100',
            objectFit === 'cover' && 'object-cover',
            objectFit === 'contain' && 'object-contain',
            objectFit === 'fill' && 'object-fill',
            objectFit === 'none' && 'object-none',
            objectFit === 'scale-down' && 'object-scale-down'
          )}
          onLoad={handleLoad}
          onError={handleError}
        />
      ) : (
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          sizes={defaultSizes}
          quality={quality}
          priority={priority}
          loading={loading}
          className={cn(
            'transition-opacity duration-300',
            isLoading ? 'opacity-0' : 'opacity-100',
            objectFit === 'cover' && 'object-cover',
            objectFit === 'contain' && 'object-contain',
            objectFit === 'fill' && 'object-fill',
            objectFit === 'none' && 'object-none',
            objectFit === 'scale-down' && 'object-scale-down'
          )}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
    </div>
  )
}

/**
 * Avatar Image - Responsive circular image
 */
interface AvatarImageProps {
  src?: string
  alt: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  fallback?: string
  className?: string
}

export function AvatarImage({
  src,
  alt,
  size = 'md',
  fallback,
  className,
}: AvatarImageProps) {
  const [hasError, setHasError] = useState(false)

  const sizeClasses = {
    sm: 'w-8 h-8 md:w-10 md:h-10',
    md: 'w-10 h-10 md:w-12 md:h-12',
    lg: 'w-12 h-12 md:w-16 md:h-16',
    xl: 'w-16 h-16 md:w-20 md:h-20',
  }

  if (!src || hasError) {
    return (
      <div className={cn(
        'rounded-full bg-blue-600 flex items-center justify-center text-white font-medium',
        sizeClasses[size],
        className
      )}>
        {fallback || alt.charAt(0).toUpperCase()}
      </div>
    )
  }

  return (
    <div className={cn('relative rounded-full overflow-hidden', sizeClasses[size], className)}>
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        onError={() => setHasError(true)}
      />
    </div>
  )
}

/**
 * Background Image - Responsive background with overlay
 */
interface BackgroundImageProps {
  src: string
  alt: string
  children?: React.ReactNode
  overlay?: boolean
  overlayOpacity?: number
  className?: string
}

export function BackgroundImage({
  src,
  alt,
  children,
  overlay = false,
  overlayOpacity = 0.5,
  className,
}: BackgroundImageProps) {
  return (
    <div className={cn('relative overflow-hidden', className)}>
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        sizes="100vw"
        priority
      />
      {overlay && (
        <div
          className="absolute inset-0 bg-black"
          style={{ opacity: overlayOpacity }}
        />
      )}
      {children && (
        <div className="relative z-10">
          {children}
        </div>
      )}
    </div>
  )
}

/**
 * Image Gallery - Responsive image grid
 */
interface ImageGalleryProps {
  images: Array<{
    src: string
    alt: string
    caption?: string
  }>
  cols?: {
    mobile?: number
    tablet?: number
    desktop?: number
  }
  gap?: number
  className?: string
}

export function ImageGallery({
  images,
  cols = { mobile: 1, tablet: 2, desktop: 3 },
  gap = 4,
  className,
}: ImageGalleryProps) {
  const gridColsClasses = cn(
    `grid-cols-${cols.mobile || 1}`,
    cols.tablet && `md:grid-cols-${cols.tablet}`,
    cols.desktop && `lg:grid-cols-${cols.desktop}`
  )

  return (
    <div className={cn('grid', gridColsClasses, `gap-${gap}`, className)}>
      {images.map((image, index) => (
        <div key={index} className="group relative aspect-square overflow-hidden rounded-lg">
          <ResponsiveImage
            src={image.src}
            alt={image.alt}
            fill
            objectFit="cover"
            className="transition-transform group-hover:scale-110"
          />
          {image.caption && (
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4">
              <p className="text-white text-sm md:text-base">{image.caption}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
