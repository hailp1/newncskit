'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface QualityScoreGaugeProps {
  score: number; // 0-100
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  animated?: boolean;
  className?: string;
}

export function QualityScoreGauge({
  score,
  size = 'md',
  showLabel = true,
  animated = true,
  className,
}: QualityScoreGaugeProps) {
  // Clamp score between 0 and 100
  const clampedScore = Math.max(0, Math.min(100, score));
  
  // Calculate color based on score
  const getColor = (score: number) => {
    if (score >= 80) return { stroke: '#10b981', text: 'text-green-600' }; // green
    if (score >= 60) return { stroke: '#f59e0b', text: 'text-yellow-600' }; // yellow
    return { stroke: '#ef4444', text: 'text-red-600' }; // red
  };

  const color = getColor(clampedScore);

  // Size configurations
  const sizeConfig = {
    sm: { radius: 40, strokeWidth: 8, fontSize: 'text-xl' },
    md: { radius: 60, strokeWidth: 10, fontSize: 'text-3xl' },
    lg: { radius: 80, strokeWidth: 12, fontSize: 'text-4xl' },
  };

  const config = sizeConfig[size];
  const circumference = 2 * Math.PI * config.radius;
  const offset = circumference - (clampedScore / 100) * circumference;

  return (
    <div className={cn('flex flex-col items-center', className)}>
      <div className="relative">
        <svg
          width={(config.radius + config.strokeWidth) * 2}
          height={(config.radius + config.strokeWidth) * 2}
          className="transform -rotate-90"
        >
          {/* Background Circle */}
          <circle
            cx={config.radius + config.strokeWidth}
            cy={config.radius + config.strokeWidth}
            r={config.radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth={config.strokeWidth}
          />

          {/* Progress Circle */}
          {animated ? (
            <motion.circle
              cx={config.radius + config.strokeWidth}
              cy={config.radius + config.strokeWidth}
              r={config.radius}
              fill="none"
              stroke={color.stroke}
              strokeWidth={config.strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          ) : (
            <circle
              cx={config.radius + config.strokeWidth}
              cy={config.radius + config.strokeWidth}
              r={config.radius}
              fill="none"
              stroke={color.stroke}
              strokeWidth={config.strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
            />
          )}
        </svg>

        {/* Score Text */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center"
          style={{
            top: config.strokeWidth,
            left: config.strokeWidth,
            right: config.strokeWidth,
            bottom: config.strokeWidth,
          }}
        >
          <span className={cn('font-bold', config.fontSize, color.text)}>
            {Math.round(clampedScore)}
          </span>
          {showLabel && (
            <span className="text-xs text-gray-500 mt-1">Quality Score</span>
          )}
        </div>
      </div>

      {/* Status Label */}
      {showLabel && (
        <div className="mt-3 text-center">
          <span
            className={cn(
              'inline-block px-3 py-1 rounded-full text-xs font-medium',
              clampedScore >= 80 && 'bg-green-100 text-green-700',
              clampedScore >= 60 && clampedScore < 80 && 'bg-yellow-100 text-yellow-700',
              clampedScore < 60 && 'bg-red-100 text-red-700'
            )}
          >
            {clampedScore >= 80 && 'Excellent'}
            {clampedScore >= 60 && clampedScore < 80 && 'Good'}
            {clampedScore < 60 && 'Needs Improvement'}
          </span>
        </div>
      )}
    </div>
  );
}
