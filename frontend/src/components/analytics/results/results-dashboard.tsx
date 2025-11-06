'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart3, 
  TrendingUp, 
  Download, 
  Share2, 
  Eye, 
  FileText, 
  Image, 
  CheckCircle,
  AlertTriangle,
  Info,
  Zap
} from 'lucide-react';
import { VisualizationGallery } from './visualization-gallery';
import { StatisticalInterpretation } from './statistical-interpretation';
import { ResultsComparison } from './results-comparison';
import { ExportInterface } from './export-interface';
import { analyticsService } from '@/services/analytics';

interface ResultsDashboardProps {
  projectId: string;
  results: AnalysisResult[];
  onResultSelect?: (result: AnalysisResult) => void;
}

interface AnalysisResult {
  id: string;
  projectId: string;
  analysisType: string;
  analysisName: string;
  statisticalOutput: any;
  fitIndices: any;
  parameterEstimates: any;
  statisticalInterpretation: string;
  practicalSignificance: string;
  limitations: string;
  rCode: string;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  executedAt: string;
  completedAt?: string;
  executionTime?: string;
  validation?: {
    overall: 'valid' | 'warning' | 'invalid';
    details: any;
  };
}

interface ResultsSummary {
  totalAnalyses: number;
  completedAnalyses: number;
  validResults: number;
  warningResults: number;
  invalidResults: number;
  averageExecutionTime: number;
  lastUpdated: string;
}

export const ResultsDashboard: React.FC<ResultsDashboardProps> = ({
  projectId,
  results,
  onResultSelect
}) => {
  const [selectedResult, setSelectedResult] = useState<AnalysisResult | null>(null);
  const [comparisonResults, setComparisonResults] = useState<AnalysisResult[]>([]);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date');

  const [summary, setSummary] = useState<ResultsSummary>({
    totalAnalyses: 0,
    completedAnalyses: 0,
    validResults: 0,
    warningResults: 0,
    invalidResults: 0,
    averageExecutionTime: 0,
    lastUpdated: new Date().toISOString()
  });

  useEffect(() => {
    calculateSummary();
    if (results.length > 0 && !selectedResult) {
      setSelectedResult(results[0]);
    }
  }, [results]);

  const calculateSummary = () => {
    const completed = results.filter(r => r.status === 'completed');
    const valid = completed.filter(r => r.validation?.overall === 'valid');
    const warning = completed.filter(r => r.validation?.overall === 'warning');
    const invalid = completed.filter(r => r.validation?.overall === 'invalid');
    
    const executionTimes = completed
      .filter(r => r.executionTime)
      .map(r => parseFloat(r.executionTime || '0'));
    
    const avgTime = executionTimes.length > 0 
      ? executionTimes.reduce((a, b) => a + b, 0) / executionTimes.length 
      : 0;

    setSummary({
      totalAnalyses: results.length,
      completedAnalyses: completed.length,
      validResults: valid.length,
      warningResults: warning.length,
      invalidResults: invalid.length,
      averageExecutionTime: avgTime,
      lastUpdated: new Date().toISOString()
    });
  };

  const filteredResults = results.filter(result => {
    if (filterType === 'all') return true;
    if (filterType === 'completed') return result.status === 'completed';
    if (filterType === 'valid') return result.validation?.overall === 'valid';
    if (filterType === 'warning') return result.validation?.overall === 'warning';
    if (filterType === 'invalid') return result.validation?.overall === 'invalid';
    return result.analysisType === filterType;
  });

  const sortedResults = [...filteredResults].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.executedAt).getTime() - new Date(a.executedAt).getTime();
      case 'name':
        return a.analysisName.localeCompare(b.analysisName);
      case 'type':
        return a.analysisType.localeCompare(b.analysisType);
      case 'status':
        return a.status.localeCompare(b.status);
      default:
        return 0;
    }
  });

  const handleResultClick = (result: AnalysisResult) => {
    setSelectedResult(result);
    onResultSelect?.(result);
  };

  const handleComparisonToggle = (result: AnalysisResult) => {
    setComparisonResults(prev => {
      const exists = prev.find(r => r.id === result.id);
      if (exists) {
        return prev.filter(r => r.id !== result.id);
      } else if (prev.length < 3) {
        return [...prev, result];
      }
      return prev;
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'running': return <Zap className="h-4 w-4 text-blue-600 animate-pulse" />;
      case 'failed': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'cancelled': return <Info className="h-4 w-4 text-gray-600" />;
      default: return <Info className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'running': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      case 'cancelled': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getValidationColor = (validation?: { overall: string }) => {
    if (!validation) return 'bg-gray-100 text-gray-800 border-gray-200';
    switch (validation.overall) {
      case 'valid': return 'bg-green-100 text-green-800 border-green-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'invalid': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analysis Results</h2>
          <p className="text-gray-600">
            Comprehensive dashboard for viewing and interpreting analysis results
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowExportDialog(true)}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export Results
          </Button>
          <Button className="flex items-center gap-2">
            <Share2 className="h-4 w-4" />
            Share Dashboard
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Analyses</p>
                <p className="text-2xl font-bold text-gray-900">{summary.totalAnalyses}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{summary.completedAnalyses}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Valid Results</p>
                <p className="text-2xl font-bold text-gray-900">{summary.validResults}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Time</p>
                <p className="text-2xl font-bold text-gray-900">
                  {summary.averageExecutionTime.toFixed(1)}s
                </p>
              </div>
              <Zap className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Results List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-base">Analysis Results</CardTitle>
                <div className="flex gap-2">
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="valid">Valid</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="invalid">Invalid</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date">Date</SelectItem>
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="type">Type</SelectItem>
                      <SelectItem value="status">Status</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-96 overflow-y-auto">
                {sortedResults.length === 0 ? (
                  <div className="p-8 text-center">
                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
                    <p className="text-gray-600">Try adjusting your filters</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {sortedResults.map(result => (
                      <div
                        key={result.id}
                        className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                          selectedResult?.id === result.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                        }`}
                        onClick={() => handleResultClick(result)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              {getStatusIcon(result.status)}
                              <h4 className="font-medium text-sm">{result.analysisName}</h4>
                            </div>
                            <p className="text-xs text-gray-600 mb-2">{result.analysisType}</p>
                            <div className="flex items-center gap-2">
                              <Badge className={getStatusColor(result.status)}>
                                {result.status}
                              </Badge>
                              {result.validation && (
                                <Badge className={getValidationColor(result.validation)}>
                                  {result.validation.overall}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <input
                              type="checkbox"
                              checked={comparisonResults.some(r => r.id === result.id)}
                              onChange={() => handleComparisonToggle(result)}
                              onClick={(e) => e.stopPropagation()}
                              className="h-4 w-4"
                            />
                            <span className="text-xs text-gray-500">
                              {new Date(result.executedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Results Panel */}
        <div className="lg:col-span-2">
          {selectedResult ? (
            <Tabs defaultValue="interpretation" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="interpretation">Interpretation</TabsTrigger>
                <TabsTrigger value="visualizations">Charts</TabsTrigger>
                <TabsTrigger value="comparison">Compare</TabsTrigger>
                <TabsTrigger value="export">Export</TabsTrigger>
              </TabsList>

              <TabsContent value="interpretation">
                <StatisticalInterpretation result={selectedResult} />
              </TabsContent>

              <TabsContent value="visualizations">
                <VisualizationGallery result={selectedResult} />
              </TabsContent>

              <TabsContent value="comparison">
                <ResultsComparison 
                  results={comparisonResults}
                  onRemoveResult={(resultId) => {
                    setComparisonResults(prev => prev.filter(r => r.id !== resultId));
                  }}
                />
              </TabsContent>

              <TabsContent value="export">
                <ExportInterface 
                  result={selectedResult}
                  projectId={projectId}
                />
              </TabsContent>
            </Tabs>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a result to view</h3>
                <p className="text-gray-600">Choose an analysis result from the list to see detailed information</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Comparison Panel */}
      {comparisonResults.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Comparison Mode ({comparisonResults.length} selected)
            </CardTitle>
            <CardDescription>
              Selected results will be compared in the Compare tab
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {comparisonResults.map(result => (
                <Badge key={result.id} variant="outline" className="flex items-center gap-1">
                  {result.analysisName}
                  <button
                    onClick={() => handleComparisonToggle(result)}
                    className="ml-1 text-gray-500 hover:text-gray-700"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Export Dialog */}
      {showExportDialog && (
        <ExportInterface
          result={selectedResult}
          projectId={projectId}
          onClose={() => setShowExportDialog(false)}
        />
      )}
    </div>
  );
};