'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Upload, X, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UploadProgressProps {
  progress: number; // 0-100
  fileName: string;
  fileSize: number;
  uploadSpeed?: number; // bytes per second
  onCancel?: () => void;
  isComplete?: boolean;
  className?: string;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function formatSpeed(bytesPerSecond: number): string {
  return formatFileSize(bytesPerSecond) + '/s';
}

export function UploadProgress({
  progress,
  fileName,
  fileSize,
  uploadSpeed,
  onCancel,
  isComplete = false,
  className,
}: UploadProgressProps) {
  return (
    <div
      className={cn(
        'w-full p-4 border-2 rounded-lg bg-white',
        isComplete ? 'border-green-200 bg-green-50' : 'border-blue-200 bg-blue-50',
        className
      )}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className={cn(
            'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center',
            isComplete ? 'bg-green-500' : 'bg-blue-500'
          )}
        >
          {isComplete ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              <Check className="w-6 h-6 text-white" />
            </motion.div>
          ) : (
            <Upload className="w-6 h-6 text-white" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* File Info */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {fileName}
              </p>
              <p className="text-xs text-gray-500">
                {formatFileSize(fileSize)}
                {uploadSpeed && !isComplete && (
                  <span className="ml-2">• {formatSpeed(uploadSpeed)}</span>
                )}
              </p>
            </div>

            {/* Cancel Button */}
            {!isComplete && onCancel && (
              <button
                onClick={onCancel}
                className={cn(
                  'ml-2 p-1 rounded-md',
                  'hover:bg-blue-100 transition-colors',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500',
                  'text-gray-600'
                )}
                aria-label="Cancel upload"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Progress Bar */}
          {!isComplete && (
            <>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-1">
                <motion.div
                  className="h-full bg-blue-600"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                />
              </div>
              <p className="text-xs text-gray-600 text-right">
                {progress}%
              </p>
            </>
          )}

          {/* Success Message */}
          {isComplete && (
            <p className="text-sm text-green-600 font-medium">
              Upload complete!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
