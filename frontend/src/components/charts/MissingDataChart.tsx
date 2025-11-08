'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { cn } from '@/lib/utils';

interface MissingDataItem {
  variable: string;
  missingCount: number;
  totalCount: number;
  percentage: number;
}

interface MissingDataChartProps {
  data: MissingDataItem[];
  onVariableClick?: (variable: string) => void;
  className?: string;
}

// Color based on severity
const getColor = (percentage: number) => {
  if (percentage === 0) return '#10b981'; // green - no missing
  if (percentage < 5) return '#3b82f6'; // blue - minimal
  if (percentage < 20) return '#f59e0b'; // yellow - moderate
  return '#ef4444'; // red - severe
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-semibold text-gray-900 mb-1">{data.variable}</p>
        <p className="text-sm text-gray-600">
          Missing: <span className="font-medium">{data.missingCount}</span> / {data.totalCount}
        </p>
        <p className="text-sm text-gray-600">
          Percentage: <span className="font-medium">{data.percentage.toFixed(1)}%</span>
        </p>
      </div>
    );
  }
  return null;
};

export function MissingDataChart({
  data,
  onVariableClick,
  className,
}: MissingDataChartProps) {
  // Sort by percentage descending
  const sortedData = [...data].sort((a, b) => b.percentage - a.percentage);

  return (
    <div className={cn('w-full', className)}>
      <ResponsiveContainer width="100%" height={Math.max(300, sortedData.length * 40)}>
        <BarChart
          data={sortedData}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            type="number"
            domain={[0, 100]}
            tickFormatter={(value) => `${value}%`}
            stroke="#6b7280"
          />
          <YAxis
            type="category"
            dataKey="variable"
            width={90}
            stroke="#6b7280"
            tick={{ fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }} />
          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            formatter={() => 'Missing Data %'}
          />
          <Bar
            dataKey="percentage"
            name="Missing Data %"
            radius={[0, 4, 4, 0]}
            onClick={(data: any) => onVariableClick?.(data.variable)}
            cursor={onVariableClick ? 'pointer' : 'default'}
          >
            {sortedData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getColor(entry.percentage)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 justify-center text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: '#10b981' }} />
          <span className="text-gray-600">No Missing (0%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: '#3b82f6' }} />
          <span className="text-gray-600">Minimal (&lt;5%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: '#f59e0b' }} />
          <span className="text-gray-600">Moderate (5-20%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: '#ef4444' }} />
          <span className="text-gray-600">Severe (&gt;20%)</span>
        </div>
      </div>
    </div>
  );
}
