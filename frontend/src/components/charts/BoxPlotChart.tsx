'use client';

import React from 'react';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import { cn } from '@/lib/utils';

interface BoxPlotData {
  variable: string;
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
  outliers: number[];
}

interface BoxPlotChartProps {
  data: BoxPlotData[];
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-semibold text-gray-900 mb-2">{data.variable}</p>
        <div className="space-y-1 text-sm">
          <p className="text-gray-600">
            Max: <span className="font-medium">{data.max.toFixed(2)}</span>
          </p>
          <p className="text-gray-600">
            Q3: <span className="font-medium">{data.q3.toFixed(2)}</span>
          </p>
          <p className="text-gray-600">
            Median: <span className="font-medium text-blue-600">{data.median.toFixed(2)}</span>
          </p>
          <p className="text-gray-600">
            Q1: <span className="font-medium">{data.q1.toFixed(2)}</span>
          </p>
          <p className="text-gray-600">
            Min: <span className="font-medium">{data.min.toFixed(2)}</span>
          </p>
          {data.outliers.length > 0 && (
            <p className="text-red-600">
              Outliers: <span className="font-medium">{data.outliers.length}</span>
            </p>
          )}
        </div>
      </div>
    );
  }
  return null;
};

export function BoxPlotChart({
  data,
  orientation = 'vertical',
  className,
}: BoxPlotChartProps) {
  // Prepare data for rendering
  const chartData = data.map((item, index) => ({
    ...item,
    x: index,
    name: item.variable,
  }));

  // Prepare outlier points
  const outlierPoints = data.flatMap((item, varIndex) =>
    item.outliers.map((value) => ({
      x: varIndex,
      y: value,
      variable: item.variable,
    }))
  );

  const isVertical = orientation === 'vertical';

  return (
    <div className={cn('w-full', className)}>
      <ResponsiveContainer width="100%" height={400}>
        <ScatterChart
          margin={{ top: 20, right: 20, bottom: 60, left: 60 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          
          <XAxis
            type="category"
            dataKey="name"
            name="Variable"
            stroke="#6b7280"
            angle={-45}
            textAnchor="end"
            height={80}
          />
          
          <YAxis
            type="number"
            name="Value"
            stroke="#6b7280"
          />
          
          <Tooltip content={<CustomTooltip />} />

          {/* Render box plots using custom shapes */}
          {chartData.map((item, index) => {
            const boxWidth = 0.4;
            const xPos = index;

            return (
              <g key={index}>
                {/* Whisker line (min to Q1) */}
                <line
                  x1={xPos}
                  y1={item.min}
                  x2={xPos}
                  y2={item.q1}
                  stroke="#6b7280"
                  strokeWidth={1}
                  strokeDasharray="3 3"
                />
                
                {/* Whisker line (Q3 to max) */}
                <line
                  x1={xPos}
                  y1={item.q3}
                  x2={xPos}
                  y2={item.max}
                  stroke="#6b7280"
                  strokeWidth={1}
                  strokeDasharray="3 3"
                />

                {/* Min cap */}
                <line
                  x1={xPos - boxWidth / 4}
                  y1={item.min}
                  x2={xPos + boxWidth / 4}
                  y2={item.min}
                  stroke="#6b7280"
                  strokeWidth={2}
                />

                {/* Max cap */}
                <line
                  x1={xPos - boxWidth / 4}
                  y1={item.max}
                  x2={xPos + boxWidth / 4}
                  y2={item.max}
                  stroke="#6b7280"
                  strokeWidth={2}
                />

                {/* Box (Q1 to Q3) */}
                <rect
                  x={xPos - boxWidth / 2}
                  y={item.q3}
                  width={boxWidth}
                  height={item.q1 - item.q3}
                  fill="#3b82f6"
                  fillOpacity={0.6}
                  stroke="#2563eb"
                  strokeWidth={2}
                />

                {/* Median line */}
                <line
                  x1={xPos - boxWidth / 2}
                  y1={item.median}
                  x2={xPos + boxWidth / 2}
                  y2={item.median}
                  stroke="#1e40af"
                  strokeWidth={3}
                />
              </g>
            );
          })}

          {/* Outliers */}
          <Scatter
            data={outlierPoints}
            fill="#ef4444"
            shape="circle"
          >
            {outlierPoints.map((entry, index) => (
              <Cell key={`outlier-${index}`} fill="#ef4444" />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 justify-center text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-3 bg-blue-500 border-2 border-blue-700 opacity-60" />
          <span className="text-gray-600">IQR (Q1-Q3)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-blue-900" />
          <span className="text-gray-600">Median</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-gray-500 border-dashed" />
          <span className="text-gray-600">Whiskers</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-500" />
          <span className="text-gray-600">Outliers</span>
        </div>
      </div>
    </div>
  );
}
