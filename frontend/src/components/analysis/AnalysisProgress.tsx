'use client';

import { useState, useEffect } from 'react';
import { Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface AnalysisProgressProps {
  projectId: string;
  onComplete: () => void;
  onError: (error: string) => void;
}

export default function AnalysisProgress({
  projectId,
  onComplete,
  onError,
}: AnalysisProgressProps) {
  const [status, setStatus] = useState<'analyzing' | 'completed' | 'error'>('analyzing');
  const [progress, setProgress] = useState(0);
  const [currentAnalysis, setCurrentAnalysis] = useState<string>('');
  const [completedCount, setCompletedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/analysis/status/${projectId}`);
        
        if (!response.ok) {
          throw new Error('Failed to check status');
        }

        const data = await response.json();

        setProgress(data.progress.percentage);
        setCompletedCount(data.progress.completed);
        setTotalCount(data.progress.total);
        setResults(data.results || []);

        if (data.project.status === 'completed') {
          setStatus('completed');
          clearInterval(intervalId);
          setTimeout(() => onComplete(), 1000);
        } else if (data.project.status === 'error') {
          setStatus('error');
          clearInterval(intervalId);
          onError('Analysis execution failed');
        } else if (data.project.status === 'analyzing') {
          // Determine current analysis
          if (data.results && data.results.length > 0) {
            const lastResult = data.results[0];
            setCurrentAnalysis(lastResult.analysis_type);
          }
        }

      } catch (error) {
        console.error('Status check error:', error);
        setStatus('error');
        clearInterval(intervalId);
        onError((error as Error).message);
      }
    };

    // Initial check
    checkStatus();

    // Poll every 2 seconds
    intervalId = setInterval(checkStatus, 2000);

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [projectId, onComplete, onError]);

  const getAnalysisName = (type: string): string => {
    const names: Record<string, string> = {
      descriptive: 'Descriptive Statistics',
      reliability: 'Reliability Analysis',
      efa: 'Exploratory Factor Analysis',
      cfa: 'Confirmatory Factor Analysis',
      correlation: 'Correlation Analysis',
      anova: 'ANOVA',
      regression: 'Linear Regression',
      sem: 'Structural Equation Modeling',
    };
    return names[type] || type;
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        {/* Status Icon */}
        <div className="flex justify-center mb-6">
          {status === 'analyzing' && (
            <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />
          )}
          {status === 'completed' && (
            <CheckCircle className="w-16 h-16 text-green-500" />
          )}
          {status === 'error' && (
            <XCircle className="w-16 h-16 text-red-500" />
          )}
        </div>

        {/* Status Text */}
        <div className="text-center mb-6">
          {status === 'analyzing' && (
            <>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Analyzing Your Data...
              </h3>
              <p className="text-gray-600">
                Please wait while we process your analyses
              </p>
            </>
          )}
          {status === 'completed' && (
            <>
              <h3 className="text-xl font-bold text-green-900 mb-2">
                Analysis Complete!
              </h3>
              <p className="text-green-700">
                All analyses have been executed successfully
              </p>
            </>
          )}
          {status === 'error' && (
            <>
              <h3 className="text-xl font-bold text-red-900 mb-2">
                Analysis Failed
              </h3>
              <p className="text-red-700">
                An error occurred during analysis execution
              </p>
            </>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Progress
            </span>
            <span className="text-sm font-medium text-gray-900">
              {completedCount} / {totalCount} analyses
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                status === 'completed'
                  ? 'bg-green-500'
                  : status === 'error'
                  ? 'bg-red-500'
                  : 'bg-blue-500'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-center mt-2">
            <span className="text-sm text-gray-600">{progress}%</span>
          </div>
        </div>

        {/* Current Analysis */}
        {status === 'analyzing' && currentAnalysis && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 text-blue-600 animate-spin flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-blue-900">
                  Currently Running
                </p>
                <p className="text-sm text-blue-700">
                  {getAnalysisName(currentAnalysis)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Completed Analyses */}
        {results.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">
              Completed Analyses
            </h4>
            {results.map((result, index) => {
              const hasError = (result as any).results?.error;
              
              return (
                <div
                  key={index}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    hasError
                      ? 'bg-red-50 border border-red-200'
                      : 'bg-green-50 border border-green-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {hasError ? (
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    ) : (
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    )}
                    <span className={`text-sm font-medium ${
                      hasError ? 'text-red-900' : 'text-green-900'
                    }`}>
                      {getAnalysisName((result as any).analysis_type)}
                    </span>
                  </div>
                  <span className="text-xs text-gray-600">
                    {((result as any).execution_time_ms / 1000).toFixed(1)}s
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Info Message */}
        {status === 'analyzing' && (
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              This may take a few minutes depending on your data size
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
