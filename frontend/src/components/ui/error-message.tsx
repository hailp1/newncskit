'use client'

import React from 'react';
import Link from 'next/link';
import { AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { Button } from './button';
import type { ErrorMessage } from '@/services/error-handler';

interface ErrorMessageProps {
  error: ErrorMessage;
  onDismiss?: () => void;
  className?: string;
}

export function ErrorMessageComponent({ error, onDismiss, className = '' }: ErrorMessageProps) {
  const getIcon = () => {
    switch (error.type) {
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const getBackgroundColor = () => {
    switch (error.type) {
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-red-50 border-red-200';
    }
  };

  const getTextColor = () => {
    switch (error.type) {
      case 'error':
        return 'text-red-800';
      case 'warning':
        return 'text-yellow-800';
      case 'info':
        return 'text-blue-800';
      default:
        return 'text-red-800';
    }
  };

  return (
    <div className={`rounded-lg border p-4 ${getBackgroundColor()} ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <div className="ml-3 flex-1">
          <h3 className={`text-sm font-semibold ${getTextColor()}`}>
            {error.title}
          </h3>
          <p className={`mt-1 text-sm ${getTextColor()}`}>
            {error.message}
          </p>
          {error.action && (
            <div className="mt-3">
              {error.action.href ? (
                <Link href={error.action.href}>
                  <Button
                    variant="outline"
                    size="sm"
                    className={`
                      ${error.type === 'error' ? 'border-red-300 text-red-700 hover:bg-red-100' : ''}
                      ${error.type === 'warning' ? 'border-yellow-300 text-yellow-700 hover:bg-yellow-100' : ''}
                      ${error.type === 'info' ? 'border-blue-300 text-blue-700 hover:bg-blue-100' : ''}
                    `}
                  >
                    {error.action.label}
                  </Button>
                </Link>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={error.action.onClick}
                  className={`
                    ${error.type === 'error' ? 'border-red-300 text-red-700 hover:bg-red-100' : ''}
                    ${error.type === 'warning' ? 'border-yellow-300 text-yellow-700 hover:bg-yellow-100' : ''}
                    ${error.type === 'info' ? 'border-blue-300 text-blue-700 hover:bg-blue-100' : ''}
                  `}
                >
                  {error.action.label}
                </Button>
              )}
            </div>
          )}
        </div>
        {onDismiss && (
          <div className="ml-auto pl-3">
            <button
              type="button"
              onClick={onDismiss}
              className={`
                inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2
                ${error.type === 'error' ? 'text-red-400 hover:bg-red-100 focus:ring-red-600' : ''}
                ${error.type === 'warning' ? 'text-yellow-400 hover:bg-yellow-100 focus:ring-yellow-600' : ''}
                ${error.type === 'info' ? 'text-blue-400 hover:bg-blue-100 focus:ring-blue-600' : ''}
              `}
            >
              <span className="sr-only">Đóng</span>
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Toast notification component for temporary messages
interface ToastProps {
  error: ErrorMessage;
  onDismiss: () => void;
  duration?: number;
}

export function ErrorToast({ error, onDismiss, duration = 5000 }: ToastProps) {
  React.useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onDismiss, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onDismiss]);

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <ErrorMessageComponent error={error} onDismiss={onDismiss} />
    </div>
  );
}

// Inline error for form fields
interface InlineErrorProps {
  message: string;
  className?: string;
}

export function InlineError({ message, className = '' }: InlineErrorProps) {
  return (
    <div className={`flex items-center mt-1 text-sm text-red-600 ${className}`}>
      <AlertCircle className="h-4 w-4 mr-1 flex-shrink-0" />
      <span>{message}</span>
    </div>
  );
}

// Full page error component
interface FullPageErrorProps {
  error: ErrorMessage;
  onRetry?: () => void;
}

export function FullPageError({ error, onRetry }: FullPageErrorProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 text-red-500">
            <AlertCircle className="h-12 w-12" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {error.title}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {error.message}
          </p>
        </div>
        <div className="space-y-3">
          {onRetry && (
            <Button
              onClick={onRetry}
              className="w-full"
            >
              Thử lại
            </Button>
          )}
          {error.action && (
            <div>
              {error.action.href ? (
                <Link href={error.action.href}>
                  <Button variant="outline" className="w-full">
                    {error.action.label}
                  </Button>
                </Link>
              ) : (
                <Button
                  variant="outline"
                  onClick={error.action.onClick}
                  className="w-full"
                >
                  {error.action.label}
                </Button>
              )}
            </div>
          )}
          <Link href="/dashboard">
            <Button variant="ghost" className="w-full">
              Về trang chủ
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}