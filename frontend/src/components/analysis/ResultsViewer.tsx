'use client';

import { useState, useEffect } from 'react';
import { 
  AnalysisType,
  DescriptiveStatsResult,
  ReliabilityResult,
  EFAResult,
  CFAResult,
  CorrelationResult,
  ANOVAResult,
  RegressionResult,
  SEMResult
} from '@/types/analysis';
import { 
  BarChart3, 
  Activity, 
  Layers, 
  GitBranch, 
  Network, 
  TrendingUp,
  Download,
  FileText,
  Loader2
} from 'lucide-react';

interface ResultsViewerProps {
  projectId: string;
}

export default function ResultsViewer({ projectId }: ResultsViewerProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [project, setProject] = useState<any>(null);
  const [results, setResults] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<AnalysisType | null>(null);

  useEffect(() => {
    loadResults();
  }, [projectId]);

  const loadResults = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/analysis/results/${projectId}`);
      
      if (!response.ok) {
        throw new Error('Failed to load results');
      }

      const data = await response.json();
      setProject(data.project);
      setResults(data.results);
      
      // Set first result as active tab
      if (data.results.length > 0) {
        setActiveTab(data.results[0].analysis_type);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/analysis/export/excel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId }),
      });

      if (!response.ok) {
        throw new Error('Failed to export to Excel');
      }

      // Download file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${project?.name || 'analysis'}_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/analysis/export/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId }),
      });

      if (!response.ok) {
        throw new Error('Failed to export to PDF');
      }

      // Open in new window for printing
      const html = await response.text();
      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.document.write(html);
        newWindow.document.close();
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const getAnalysisIcon = (type: AnalysisType) => {
    const icons: Record<AnalysisType, React.ReactNode> = {
      descriptive: <BarChart3 className="w-5 h-5" />,
      reliability: <Activity className="w-5 h-5" />,
      efa: <Layers className="w-5 h-5" />,
      cfa: <GitBranch className="w-5 h-5" />,
      correlation: <Network className="w-5 h-5" />,
      ttest: <TrendingUp className="w-5 h-5" />,
      anova: <TrendingUp className="w-5 h-5" />,
      regression: <TrendingUp className="w-5 h-5" />,
      sem: <Network className="w-5 h-5" />,
    };
    return icons[type];
  };

  const getAnalysisName = (type: AnalysisType): string => {
    const names: Record<AnalysisType, string> = {
      descriptive: 'Descriptive Statistics',
      reliability: 'Reliability Analysis',
      efa: 'Exploratory Factor Analysis',
      cfa: 'Confirmatory Factor Analysis',
      correlation: 'Correlation Analysis',
      ttest: 'T-Test',
      anova: 'ANOVA',
      regression: 'Linear Regression',
      sem: 'Structural Equation Modeling',
    };
    return names[type];
  };

  const activeResult = results.find(r => r.analysis_type === activeTab);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600">No results available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analysis Results</h2>
          <p className="text-sm text-gray-600 mt-1">
            {project?.name} • {results.length} {results.length === 1 ? 'analysis' : 'analyses'}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportExcel}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export to Excel
          </button>
          <button
            onClick={handleExportPDF}
            disabled={loading}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export to PDF
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-2 overflow-x-auto">
          {results.map((result) => (
            <button
              key={result.analysis_type}
              onClick={() => setActiveTab(result.analysis_type)}
              className={`
                flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap
                ${activeTab === result.analysis_type
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
                }
              `}
            >
              {getAnalysisIcon(result.analysis_type)}
              <span className="font-medium">
                {getAnalysisName(result.analysis_type)}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Result Content */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {activeResult && (
          <div>
            {/* Execution Info */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {getAnalysisName(activeResult.analysis_type)}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Executed on {new Date(activeResult.executed_at).toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Execution Time</p>
                <p className="text-lg font-semibold text-gray-900">
                  {(activeResult.execution_time_ms / 1000).toFixed(2)}s
                </p>
              </div>
            </div>

            {/* Result Display */}
            <div className="space-y-6">
              {activeResult.results.error ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800 font-medium">Analysis Error</p>
                  <p className="text-red-700 text-sm mt-1">
                    {activeResult.results.message}
                  </p>
                </div>
              ) : activeResult.results.message ? (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-800">
                    {activeResult.results.message}
                  </p>
                  <p className="text-blue-700 text-sm mt-2">
                    Full results visualization will be available in the next update.
                  </p>
                </div>
              ) : (
                <div>
                  <pre className="bg-gray-50 rounded-lg p-4 overflow-auto text-sm">
                    {JSON.stringify(activeResult.results, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Total Analyses</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{results.length}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Total Execution Time</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {(results.reduce((sum, r) => sum + (r.execution_time_ms || 0), 0) / 1000).toFixed(1)}s
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Success Rate</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {Math.round((results.filter(r => !r.results?.error).length / results.length) * 100)}%
          </p>
        </div>
      </div>
    </div>
  );
}
