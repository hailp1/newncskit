'use client';

import React from 'react';
import { AlertCircle, AlertTriangle, XCircle, RefreshCw, Flag, X } from 'lucide-react';
import { ErrorState } from '@/types/workflow';
import { cn } from '@/lib/utils';

interface ErrorDisplayProps {
  error: ErrorState;
  onRetry?: () => void;
  onDismiss?: () => void;
  onReport?: () => void;
  className?: string;
}

export function ErrorDisplay({
  error,
  onRetry,
  onDismiss,
  onReport,
  className,
}: ErrorDisplayProps) {
  const Icon = error.type === 'critical' ? XCircle : 
               error.type === 'error' ? AlertCircle : 
               AlertTriangle;

  const bgColor = error.type === 'critical' ? 'bg-red-50 border-red-200' :
                  error.type === 'error' ? 'bg-orange-50 border-orange-200' :
                  'bg-yellow-50 border-yellow-200';

  const iconColor = error.type === 'critical' ? 'text-red-600' :
                    error.type === 'error' ? 'text-orange-600' :
                    'text-yellow-600';

  const textColor = error.type === 'critical' ? 'text-red-900' :
                    error.type === 'error' ? 'text-orange-900' :
                    'text-yellow-900';

  return (
    <div
      className={cn(
        'rounded-lg border-2 p-4',
        bgColor,
        className
      )}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <Icon className={cn('w-6 h-6 flex-shrink-0 mt-0.5', iconColor)} />

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Message */}
          <h3 className={cn('font-semibold mb-1', textColor)}>
            {error.type === 'critical' ? 'Critical Error' :
             error.type === 'error' ? 'Error' :
             'Warning'}
          </h3>
          <p className={cn('text-sm mb-2', textColor)}>
            {error.message}
          </p>

          {/* Details */}
          {error.details && (
            <p className={cn('text-xs mb-3 opacity-80', textColor)}>
              {error.details}
            </p>
          )}

          {/* Suggestions */}
          {error.suggestions.length > 0 && (
            <div className="mb-3">
              <p className={cn('text-xs font-medium mb-1', textColor)}>
                Suggestions:
              </p>
              <ul className={cn('text-xs space-y-1 list-disc list-inside', textColor)}>
                {error.suggestions.map((suggestion, index) => (
                  <li key={index}>{suggestion}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            {error.canRetry && onRetry && (
              <button
                onClick={onRetry}
                className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-1.5',
                  'text-xs font-medium rounded-md',
                  'bg-white border shadow-sm',
                  'hover:bg-gray-50 transition-colors',
                  'focus:outline-none focus:ring-2 focus:ring-offset-2',
                  error.type === 'critical' ? 'border-red-300 text-red-700 focus:ring-red-500' :
                  error.type === 'error' ? 'border-orange-300 text-orange-700 focus:ring-orange-500' :
                  'border-yellow-300 text-yellow-700 focus:ring-yellow-500'
                )}
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Retry
              </button>
            )}

            {error.canReport && onReport && (
              <button
                onClick={onReport}
                className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-1.5',
                  'text-xs font-medium rounded-md',
                  'bg-white border shadow-sm',
                  'hover:bg-gray-50 transition-colors',
                  'focus:outline-none focus:ring-2 focus:ring-offset-2',
                  'border-gray-300 text-gray-700 focus:ring-gray-500'
                )}
              >
                <Flag className="w-3.5 h-3.5" />
                Report Issue
              </button>
            )}
          </div>
        </div>

        {/* Dismiss Button */}
        {error.type === 'warning' && onDismiss && (
          <button
            onClick={onDismiss}
            className={cn(
              'flex-shrink-0 p-1 rounded-md',
              'hover:bg-yellow-100 transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-yellow-500',
              'text-yellow-600'
            )}
            aria-label="Dismiss warning"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
