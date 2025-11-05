'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ErrorMessageComponent } from '@/components/ui/error-message';
import { AnalysisProject } from '@/app/(dashboard)/analysis/page';
import { rAnalysisService } from '@/services/r-analysis';
import { useDataUploadErrorHandling } from '@/hooks/use-error-handling';

interface DataPreviewProps {
  project: AnalysisProject;
  onUpdate: (project: AnalysisProject) => void;
}

export default function DataPreview({ project, onUpdate }: DataPreviewProps) {
  const [healthCheck, setHealthCheck] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [serverStatus, setServerStatus] = useState<any>(null);
  
  const {
    error,
    isRecovering,
    recoveryActions,
    handleError,
    executeRecovery,
    clearError,
    withErrorHandling
  } = useDataUploadErrorHandling({
    onError: (error, context) => {
      console.error('Data preview error:', error, context);
    }
  });

  useEffect(() => {
    performHealthCheck();
    checkServerStatus();
  }, []);

  const checkServerStatus = withErrorHandling(async () => {
    const status = await rAnalysisService.getServerStatus();
    setServerStatus(status);
    return status;
  }, 'checkServerStatus', { showError: false });

  const performHealthCheck = withErrorHandling(async () => {
    setIsLoading(true);
    
    try {
      // First check if server is available
      const status = await rAnalysisService.getServerStatus();
      setServerStatus(status);
      
      if (!status.available) {
        // Use fallback analysis
        const fallbackResult = await rAnalysisService.fallbackDescriptiveAnalysis(project.data);
        setHealthCheck({
          status: 'fallback',
          summary: {
            rows: project.data.length - 1,
            columns: project.columns.length,
            missing_data: [],
            column_types: {},
            numeric_stats: fallbackResult.descriptive?.numeric || [],
            outliers: []
          },
          recommendations: [
            'R analysis server is not available',
            'Basic statistics computed client-side',
            'Start R server for advanced analysis features'
          ]
        });
        return;
      }

      // Perform full health check with R server
      const result = await rAnalysisService.checkDataHealth(project.data);
      setHealthCheck(result);
      
    } catch (error: any) {
      await handleError(error, 'performHealthCheck', { projectData: project.data.length });
      
      // Try fallback analysis
      try {
        const fallbackResult = await rAnalysisService.fallbackDescriptiveAnalysis(project.data);
        setHealthCheck({
          status: 'error_fallback',
          summary: {
            rows: project.data.length - 1,
            columns: project.columns.length,
            missing_data: [],
            column_types: {},
            numeric_stats: fallbackResult.descriptive?.numeric || [],
            outliers: []
          },
          recommendations: [
            'Analysis server error, using basic statistics',
            'Check server connection for full analysis features'
          ]
        });
      } catch (fallbackError) {
        console.error('Fallback analysis also failed:', fallbackError);
      }
    } finally {
      setIsLoading(false);
    }
  }, 'performHealthCheck');

  return (
    <div className="space-y-6">
      {/* Error Display */}
      {error && (
        <ErrorMessageComponent 
          error={error} 
          onDismiss={clearError}
        />
      )}

      {/* Recovery Actions */}
      {recoveryActions.length > 0 && (
        <Card className="p-4 bg-blue-50 border-blue-200">
          <h4 className="text-sm font-medium text-blue-800 mb-2">
            Suggested Actions:
          </h4>
          <div className="space-y-2">
            {recoveryActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => executeRecovery(action)}
                disabled={isRecovering}
                className="mr-2 border-blue-300 text-blue-700 hover:bg-blue-100"
              >
                {isRecovering ? 'Processing...' : action.label}
              </Button>
            ))}
          </div>
        </Card>
      )}

      {/* Server Status */}
      {serverStatus && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${serverStatus.available ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm font-medium">
                R Analysis Server: {serverStatus.available ? 'Available' : 'Unavailable'}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => checkServerStatus()}
              disabled={isLoading}
            >
              Check Status
            </Button>
          </div>
          {serverStatus.version && (
            <p className="text-xs text-gray-500 mt-1">Version: {serverStatus.version}</p>
          )}
        </Card>
      )}

      {/* Data Summary */}
      <Card className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Data Summary</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{project.data.length - 1}</div>
            <div className="text-sm text-gray-500">Rows</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{project.columns.length}</div>
            <div className="text-sm text-gray-500">Columns</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {project.columns.filter(col => col.type === 'numeric').length}
            </div>
            <div className="text-sm text-gray-500">Numeric</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {project.columns.filter(col => col.type === 'categorical').length}
            </div>
            <div className="text-sm text-gray-500">Categorical</div>
          </div>
        </div>
      </Card>

      {/* Health Check Results */}
      {healthCheck && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Data Health Check</h3>
            <div className="flex items-center space-x-2">
              {healthCheck.status === 'fallback' || healthCheck.status === 'error_fallback' ? (
                <span className="text-sm text-orange-600 bg-orange-100 px-2 py-1 rounded">
                  Basic Analysis Mode
                </span>
              ) : (
                <span className="text-sm text-green-600 bg-green-100 px-2 py-1 rounded">
                  Full Analysis Available
                </span>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => performHealthCheck()}
                disabled={isLoading}
              >
                {isLoading ? 'Checking...' : 'Retry Check'}
              </Button>
            </div>
          </div>
          
          {healthCheck.recommendations && healthCheck.recommendations.length > 0 && (
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <h4 className="font-medium text-yellow-800 mb-2">Recommendations:</h4>
              <ul className="list-disc list-inside text-sm text-yellow-700 space-y-1">
                {healthCheck.recommendations.map((rec: string, index: number) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Missing Data Summary */}
          {healthCheck.summary?.missing_data && (
            <div className="mb-4">
              <h4 className="font-medium text-gray-900 mb-2">Missing Data:</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Variable</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Missing Count</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Missing %</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {healthCheck.summary.missing_data
                      .filter((item: any) => item.missing_count > 0)
                      .map((item: any, index: number) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {item.variable}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.missing_count}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              item.missing_percent > 20 
                                ? 'bg-red-100 text-red-800'
                                : item.missing_percent > 10
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {item.missing_percent}%
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Data Preview Table */}
      <Card className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Data Preview</h3>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {project.data[0]?.map((header: any, index: number) => (
                  <th
                    key={index}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    <div>
                      <div>{header}</div>
                      <div className="text-xs text-gray-400 normal-case">
                        {project.columns[index]?.type}
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {project.data.slice(1, 11).map((row: any[], rowIndex: number) => (
                <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  {row.map((cell: any, cellIndex: number) => (
                    <td
                      key={cellIndex}
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                    >
                      {cell?.toString() || '—'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="mt-4 text-sm text-gray-500">
          Showing first 10 rows of {project.data.length - 1} total rows
        </div>
      </Card>

      {/* Column Statistics */}
      <Card className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Column Statistics</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {project.columns.map((column, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">{column.name}</h4>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  column.type === 'numeric' ? 'bg-blue-100 text-blue-800' :
                  column.type === 'categorical' ? 'bg-green-100 text-green-800' :
                  column.type === 'ordinal' ? 'bg-purple-100 text-purple-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {column.type}
                </span>
              </div>
              
              {column.stats && (
                <div className="space-y-1 text-sm text-gray-600">
                  {column.stats.mean !== undefined && (
                    <div>Mean: {column.stats.mean}</div>
                  )}
                  {column.stats.std !== undefined && (
                    <div>SD: {column.stats.std}</div>
                  )}
                  {column.stats.min !== undefined && (
                    <div>Range: {column.stats.min} - {column.stats.max}</div>
                  )}
                  <div>Unique: {column.stats.unique}</div>
                  {column.missing > 0 && (
                    <div className="text-red-600">Missing: {column.missing}</div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {isLoading && (
        <div className="text-center py-4">
          <div className="inline-flex items-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Analyzing data health...
          </div>
        </div>
      )}
    </div>
  );
}