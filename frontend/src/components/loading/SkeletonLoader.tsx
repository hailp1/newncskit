'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonLoaderProps {
  type: 'table' | 'chart' | 'card' | 'text';
  rows?: number;
  columns?: number;
  height?: number;
  className?: string;
}

export function SkeletonLoader({
  type,
  rows = 5,
  columns = 4,
  height = 300,
  className,
}: SkeletonLoaderProps) {
  const shimmer = 'animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200';

  if (type === 'table') {
    return (
      <div className={cn('w-full', className)}>
        {/* Table Header */}
        <div className="flex gap-4 mb-4">
          {Array.from({ length: columns }).map((_, i) => (
            <div
              key={i}
              className={cn('h-8 rounded flex-1', shimmer)}
            />
          ))}
        </div>

        {/* Table Rows */}
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="flex gap-4 mb-3">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <div
                key={colIndex}
                className={cn('h-6 rounded flex-1', shimmer)}
              />
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (type === 'chart') {
    return (
      <div className={cn('w-full', className)} style={{ height }}>
        <div className={cn('w-full h-full rounded-lg', shimmer)} />
      </div>
    );
  }

  if (type === 'card') {
    return (
      <div className={cn('w-full p-6 border rounded-lg', className)}>
        <div className={cn('h-6 w-1/3 rounded mb-4', shimmer)} />
        <div className={cn('h-4 w-full rounded mb-2', shimmer)} />
        <div className={cn('h-4 w-5/6 rounded mb-2', shimmer)} />
        <div className={cn('h-4 w-4/6 rounded', shimmer)} />
      </div>
    );
  }

  if (type === 'text') {
    return (
      <div className={cn('w-full space-y-2', className)}>
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-4 rounded',
              shimmer,
              i === rows - 1 ? 'w-3/4' : 'w-full'
            )}
          />
        ))}
      </div>
    );
  }

  return null;
}
