'use client';

import React from 'react';
import { AlertCircle } from 'lucide-react';
import { ValidationError } from '@/lib/errors';
import { cn } from '@/lib/utils';

interface FieldErrorProps {
  error: ValidationError | string;
  inline?: boolean;
  className?: string;
}

export function FieldError({ error, inline = true, className }: FieldErrorProps) {
  const errorMessage = typeof error === 'string' ? error : error.message;
  const suggestions = typeof error === 'string' ? [] : error.suggestions;

  if (!errorMessage) return null;

  if (inline) {
    return (
      <div
        className={cn(
          'flex items-start gap-2 mt-1 text-sm text-red-600',
          className
        )}
        role="alert"
      >
        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p>{errorMessage}</p>
          {suggestions.length > 0 && (
            <ul className="mt-1 text-xs space-y-0.5 list-disc list-inside text-red-500">
              {suggestions.map((suggestion, index) => (
                <li key={index}>{suggestion}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'p-3 bg-red-50 border border-red-200 rounded-md',
        className
      )}
      role="alert"
    >
      <div className="flex items-start gap-2">
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-medium text-red-800">{errorMessage}</p>
          {suggestions.length > 0 && (
            <ul className="mt-2 text-xs space-y-1 list-disc list-inside text-red-700">
              {suggestions.map((suggestion, index) => (
                <li key={index}>{suggestion}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
