'use client';

import React from 'react';
import { RServerUnavailableError } from '@/services/analysis.service';

interface RServerErrorDisplayProps {
  error: RServerUnavailableError;
  onRetry: () => void;
  onDismiss?: () => void;
}

export function RServerErrorDisplay({ error, onRetry, onDismiss }: RServerErrorDisplayProps) {
  const handleCheckStatus = () => {
    window.open('http://localhost:8000/__docs__/', '_blank');
  };

  return (
    <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 my-4">
      <div className="flex items-start">
        {/* Error Icon */}
        <div className="flex-shrink-0">
          <svg 
            className="h-8 w-8 text-red-600" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
            />
          </svg>
        </div>
        
        {/* Error Content */}
        <div className="ml-4 flex-1">
          <h3 className="text-lg font-semibold text-red-800 mb-2">
            {error.message}
          </h3>
          
          {error.serverError && (
            <p className="text-sm text-red-700 mb-4">
              Details: {error.serverError}
            </p>
          )}
          
          {/* Instructions */}
          {error.instructions && error.instructions.length > 0 && (
            <div className="mt-4 bg-white rounded-md p-4 border border-red-200">
              <div className="font-mono text-sm space-y-1">
                {error.instructions.map((line, index) => (
                  <div 
                    key={index} 
                    className={`${
                      line.startsWith('🔴') || line.startsWith('📍') || line.startsWith('🚀') || line.startsWith('✅')
                        ? 'font-semibold text-gray-900 mt-2'
                        : line.startsWith('Option') || line.startsWith('  ')
                        ? 'text-gray-700 pl-2'
                        : line === ''
                        ? 'h-2'
                        : 'text-gray-800'
                    }`}
                  >
                    {line || '\u00A0'}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={onRetry}
              className="inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
            >
              <svg 
                className="w-4 h-4 mr-2" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
                />
              </svg>
              Retry Connection
            </button>
            
            <button
              onClick={handleCheckStatus}
              className="inline-flex items-center px-4 py-2 border-2 border-red-600 text-red-600 text-sm font-medium rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
            >
              <svg 
                className="w-4 h-4 mr-2" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" 
                />
              </svg>
              Check Server Status
            </button>
            
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
              >
                Dismiss
              </button>
            )}
          </div>
          
          {/* Help Text */}
          <div className="mt-4 text-xs text-gray-600">
            <p>
              💡 <strong>Tip:</strong> The R Analytics server is only needed when executing advanced statistical analyses 
              (Cronbach's Alpha, EFA, CFA, SEM, ANOVA, Regression). You can continue configuring your analysis without it.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RServerErrorDisplay;
