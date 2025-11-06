'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  GitCompare, 
  TrendingUp, 
  BarChart3, 
  X, 
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react';

interface ResultsComparisonProps {
  results: Array<{
    id: string;
    analysisType: string;
    analysisName: string;
    statisticalOutput: any;
    fitIndices: any;
    parameterEstimates: any;
    executedAt: string;
    validation?: {
      overall: 'valid' | 'warning' | 'invalid';
    };
  }>;
  onRemoveResult: (resultId: string) => void;
}

interface ComparisonMetric {
  name: string;
  values: Record<string, number | string>;
  type: 'numeric' | 'categorical';
  format?: 'percentage' | 'decimal' | 'integer';
  interpretation?: string;
}

export const ResultsComparison: React.FC<ResultsComparisonProps> = ({
  results,
  onRemoveResult
}) => {
  const [activeTab, setActiveTab] = useState('overview');

  // Mock comparison data - in real implementation, this would be calculated from actual results
  const comparisonMetrics: ComparisonMetric[] = [
    {
      name: "Cronbach's Alpha",
      values: results.reduce((acc, result) => ({
        ...acc,
        [result.id]: 0.89 + Math.random() * 0.1 - 0.05
      }), {}),
      type: 'numeric',
      format: 'decimal',
      interpretation: 'Higher values indicate better internal consistency'
    },
    {
      name: 'Sample Size',
      values: results.reduce((acc, result) => ({
        ...acc,
        [result.id]: Math.floor(200 + Math.random() * 300)
      }), {}),
      type: 'numeric',
      format: 'integer',
      interpretation: 'Larger samples provide more stable estimates'
    },
    {
      name: 'Model Fit (CFI)',
      values: results.reduce((acc, result) => ({
        ...acc,
        [result.id]: 0.90 + Math.random() * 0.08
      }), {}),
      type: 'numeric',
      format: 'decimal',
      interpretation: 'Values > 0.95 indicate excellent fit'
    },
    {
      name: 'RMSEA',
      values: results.reduce((acc, result) => ({
        ...acc,
        [result.id]: 0.03 + Math.random() * 0.05
      }), {}),
      type: 'numeric',
      format: 'decimal',
      interpretation: 'Values < 0.06 indicate good fit'
    }
  ];

  const formatValue = (value: number | string, format?: string) => {
    if (typeof value === 'string') return value;
    
    switch (format) {
      case 'percentage':
        return `${(value * 100).toFixed(1)}%`;
      case 'decimal':
        return value.toFixed(3);
      case 'integer':
        return Math.round(value).toString();
      default:
        return value.toString();
    }
  };

  const getBestValue = (metric: ComparisonMetric) => {
    const values = Object.values(metric.values) as number[];
    if (metric.name === 'RMSEA') {
      return Math.min(...values); // Lower is better for RMSEA
    }
    return Math.max(...values); // Higher is better for most metrics
  };

  const isHighlighted = (metric: ComparisonMetric, resultId: string) => {
    const value = metric.values[resultId] as number;
    const bestValue = getBestValue(metric);
    return Math.abs(value - bestValue) < 0.001;
  };

  const getValidationIcon = (validation?: { overall: string }) => {
    if (!validation) return <Info className="h-4 w-4 text-gray-600" />;
    switch (validation.overall) {
      case 'valid': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'invalid': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return <Info className="h-4 w-4 text-gray-600" />;
    }
  };

  if (results.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <GitCompare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No results selected for comparison</h3>
          <p className="text-gray-600">
            Select multiple analysis results from the results list to compare them side by side
          </p>
        </CardContent>
      </Card>
    );
  }

  if (results.length === 1) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <GitCompare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Select more results to compare</h3>
          <p className="text-gray-600">
            You need at least 2 results to perform a comparison. Select additional results from the list.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitCompare className="h-5 w-5 text-blue-600" />
            Results Comparison ({results.length} results)
          </CardTitle>
          <CardDescription>
            Side-by-side comparison of selected analysis results
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Selected Results */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Selected Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {results.map(result => (
              <div key={result.id} className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2">
                  {getValidationIcon(result.validation)}
                  <span className="text-sm font-medium">{result.analysisName}</span>
                  <Badge variant="outline" className="text-xs">
                    {result.analysisType}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveResult(result.id)}
                  className="h-6 w-6 p-0 text-gray-500 hover:text-red-600"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="metrics">Detailed Metrics</TabsTrigger>
          <TabsTrigger value="visualizations">Visual Comparison</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2 font-medium">Analysis</th>
                      {results.map(result => (
                        <th key={result.id} className="text-left p-2 font-medium min-w-32">
                          {result.analysisName}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="p-2 text-sm text-gray-600">Type</td>
                      {results.map(result => (
                        <td key={result.id} className="p-2">
                          <Badge variant="outline" className="text-xs">
                            {result.analysisType}
                          </Badge>
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="p-2 text-sm text-gray-600">Validation</td>
                      {results.map(result => (
                        <td key={result.id} className="p-2">
                          <div className="flex items-center gap-1">
                            {getValidationIcon(result.validation)}
                            <span className="text-sm">
                              {result.validation?.overall || 'Unknown'}
                            </span>
                          </div>
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="p-2 text-sm text-gray-600">Executed</td>
                      {results.map(result => (
                        <td key={result.id} className="p-2 text-sm">
                          {new Date(result.executedAt).toLocaleDateString()}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Detailed Metrics Tab */}
        <TabsContent value="metrics" className="space-y-4">
          {comparisonMetrics.map((metric, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  {metric.name}
                </CardTitle>
                {metric.interpretation && (
                  <CardDescription>{metric.interpretation}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {results.map(result => {
                    const value = metric.values[result.id];
                    const highlighted = isHighlighted(metric, result.id);
                    
                    return (
                      <div 
                        key={result.id} 
                        className={`flex items-center justify-between p-3 rounded-lg border ${
                          highlighted ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{result.analysisName}</span>
                          {highlighted && (
                            <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
                              Best
                            </Badge>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold">
                            {formatValue(value, metric.format)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Visual Comparison Tab */}
        <TabsContent value="visualizations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Visual Comparison
              </CardTitle>
              <CardDescription>
                Graphical comparison of key metrics across selected results
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Mock Chart Area */}
              <div className="h-64 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border-2 border-dashed border-blue-300 flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-700 mb-2">Comparison Charts</h3>
                  <p className="text-gray-600">
                    Interactive comparison charts would be displayed here
                  </p>
                </div>
              </div>
              
              {/* Chart Legend */}
              <div className="mt-4 flex flex-wrap gap-2">
                {results.map((result, index) => (
                  <div key={result.id} className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: `hsl(${index * 60}, 70%, 50%)` }}
                    />
                    <span className="text-sm">{result.analysisName}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Comparison Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Comparison Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2">✓ Consistent Findings</h4>
                  <ul className="text-sm text-green-800 space-y-1">
                    <li>• All analyses show acceptable reliability (α &gt; 0.80)</li>
                    <li>• Model fit indices are within acceptable ranges</li>
                    <li>• Similar factor structures across analyses</li>
                  </ul>
                </div>

                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="font-medium text-yellow-900 mb-2">⚠ Notable Differences</h4>
                  <ul className="text-sm text-yellow-800 space-y-1">
                    <li>• Sample sizes vary significantly across analyses</li>
                    <li>• Some variation in fit indices (CFI range: 0.90-0.98)</li>
                    <li>• Different analysis methods may explain some differences</li>
                  </ul>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">📋 Recommendations</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Focus on results with larger sample sizes for more stable estimates</li>
                    <li>• Consider meta-analytic approach to combine findings</li>
                    <li>• Investigate sources of variation in model fit</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};