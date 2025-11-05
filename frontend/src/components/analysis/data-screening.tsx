'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, CheckCircle, XCircle, Eye, Filter, Trash2 } from 'lucide-react';

interface DataScreeningProps {
  project: any;
  onUpdate: (project: any) => void;
  onNext: () => void;
  onPrevious: () => void;
}

interface DataQualityIssue {
  type: 'missing' | 'outlier' | 'duplicate' | 'invalid' | 'inconsistent';
  severity: 'low' | 'medium' | 'high';
  column: string;
  count: number;
  description: string;
  rows?: number[];
}

interface OutlierDetection {
  method: 'zscore' | 'iqr' | 'isolation';
  threshold: number;
  results: Array<{
    column: string;
    outliers: number[];
    values: number[];
  }>;
}

export default function DataScreening({ project, onUpdate, onNext, onPrevious }: DataScreeningProps) {
  const [dataQuality, setDataQuality] = useState<{
    issues: DataQualityIssue[];
    completeness: number;
    consistency: number;
    validity: number;
    overall: number;
  }>({
    issues: [],
    completeness: 0,
    consistency: 0,
    validity: 0,
    overall: 0
  });

  const [outlierDetection, setOutlierDetection] = useState<OutlierDetection>({
    method: 'zscore',
    threshold: 3,
    results: []
  });

  const [selectedIssues, setSelectedIssues] = useState<string[]>([]);
  const [cleaningActions, setCleaningActions] = useState<{
    removeDuplicates: boolean;
    handleMissing: 'remove' | 'impute' | 'keep';
    handleOutliers: 'remove' | 'winsorize' | 'keep';
    imputationMethod: 'mean' | 'median' | 'mode' | 'regression';
  }>({
    removeDuplicates: true,
    handleMissing: 'impute',
    handleOutliers: 'winsorize',
    imputationMethod: 'mean'
  });

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [cleanedData, setCleanedData] = useState<any>(null);

  useEffect(() => {
    if (project?.data) {
      analyzeDataQuality();
    }
  }, [project]);

  const analyzeDataQuality = async () => {
    setIsAnalyzing(true);
    
    // Simulate data quality analysis
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const issues: DataQualityIssue[] = [
      {
        type: 'missing',
        severity: 'medium',
        column: 'age',
        count: 15,
        description: '15 missing values in age column (3.2% of data)',
        rows: [12, 45, 78, 123, 156, 189, 234, 267, 301, 334, 367, 401, 434, 467, 489]
      },
      {
        type: 'outlier',
        severity: 'high',
        column: 'income',
        count: 8,
        description: '8 extreme outliers detected using Z-score method (threshold: 3)',
        rows: [23, 67, 145, 234, 345, 456, 567, 678]
      },
      {
        type: 'duplicate',
        severity: 'low',
        column: 'respondent_id',
        count: 3,
        description: '3 duplicate records found',
        rows: [89, 156, 234]
      },
      {
        type: 'invalid',
        severity: 'medium',
        column: 'email',
        count: 7,
        description: '7 invalid email formats detected',
        rows: [34, 78, 123, 189, 267, 345, 423]
      }
    ];

    const completeness = 94.2;
    const consistency = 91.8;
    const validity = 88.5;
    const overall = (completeness + consistency + validity) / 3;

    setDataQuality({
      issues,
      completeness,
      consistency,
      validity,
      overall
    });

    // Outlier detection results
    setOutlierDetection({
      method: 'zscore',
      threshold: 3,
      results: [
        {
          column: 'income',
          outliers: [23, 67, 145, 234, 345, 456, 567, 678],
          values: [150000, 180000, 200000, 250000, 300000, 350000, 400000, 500000]
        },
        {
          column: 'age',
          outliers: [12, 456],
          values: [15, 85]
        }
      ]
    });

    setIsAnalyzing(false);
  };

  const handleCleanData = async () => {
    setIsAnalyzing(true);
    
    // Simulate data cleaning process
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const originalRows = project.data.length;
    let cleanedRows = originalRows;
    
    // Apply cleaning actions
    if (cleaningActions.removeDuplicates) {
      cleanedRows -= 3; // Remove duplicates
    }
    
    if (cleaningActions.handleMissing === 'remove') {
      cleanedRows -= 15; // Remove rows with missing values
    }
    
    if (cleaningActions.handleOutliers === 'remove') {
      cleanedRows -= 8; // Remove outliers
    }

    const cleaningReport = {
      originalRows,
      cleanedRows,
      removedRows: originalRows - cleanedRows,
      actions: {
        duplicatesRemoved: cleaningActions.removeDuplicates ? 3 : 0,
        missingHandled: cleaningActions.handleMissing === 'remove' ? 15 : 
                       cleaningActions.handleMissing === 'impute' ? 15 : 0,
        outliersHandled: cleaningActions.handleOutliers === 'remove' ? 8 :
                        cleaningActions.handleOutliers === 'winsorize' ? 8 : 0
      }
    };

    setCleanedData({
      data: project.data, // In real implementation, this would be the cleaned data
      report: cleaningReport
    });

    // Update project with cleaned data
    const updatedProject = {
      ...project,
      dataScreening: {
        quality: dataQuality,
        outliers: outlierDetection,
        cleaningActions,
        cleaningReport
      },
      cleanedData: true
    };

    onUpdate(updatedProject);
    setIsAnalyzing(false);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getIssueIcon = (type: string) => {
    switch (type) {
      case 'missing': return <XCircle className="h-4 w-4" />;
      case 'outlier': return <AlertTriangle className="h-4 w-4" />;
      case 'duplicate': return <Filter className="h-4 w-4" />;
      case 'invalid': return <XCircle className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Data Quality Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Data Quality Assessment</CardTitle>
        </CardHeader>
        <CardContent>
          {isAnalyzing && !dataQuality.issues.length ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Analyzing data quality...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Quality Metrics */}
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{dataQuality.overall.toFixed(1)}%</div>
                  <div className="text-sm text-gray-600">Overall Quality</div>
                  <Progress value={dataQuality.overall} className="mt-2" />
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{dataQuality.completeness.toFixed(1)}%</div>
                  <div className="text-sm text-gray-600">Completeness</div>
                  <Progress value={dataQuality.completeness} className="mt-2" />
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{dataQuality.consistency.toFixed(1)}%</div>
                  <div className="text-sm text-gray-600">Consistency</div>
                  <Progress value={dataQuality.consistency} className="mt-2" />
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{dataQuality.validity.toFixed(1)}%</div>
                  <div className="text-sm text-gray-600">Validity</div>
                  <Progress value={dataQuality.validity} className="mt-2" />
                </div>
              </div>

              {/* Issues Summary */}
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div>
                  <h4 className="font-medium mb-3">Data Quality Issues</h4>
                  <div className="space-y-2">
                    {dataQuality.issues.map((issue, index) => (
                      <div key={index} className={`p-3 rounded-lg border ${getSeverityColor(issue.severity)}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {getIssueIcon(issue.type)}
                            <span className="font-medium capitalize">{issue.type}</span>
                            <Badge variant="outline">{issue.count}</Badge>
                          </div>
                          <Badge variant={issue.severity === 'high' ? 'destructive' : 
                                        issue.severity === 'medium' ? 'default' : 'secondary'}>
                            {issue.severity}
                          </Badge>
                        </div>
                        <p className="text-sm mt-1">{issue.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Outlier Detection</h4>
                  <div className="space-y-2">
                    {outlierDetection.results.map((result, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{result.column}</span>
                          <Badge variant="outline">{result.outliers.length} outliers</Badge>
                        </div>
                        <div className="text-sm text-gray-600">
                          Method: {outlierDetection.method.toUpperCase()} (threshold: {outlierDetection.threshold})
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Values: {result.values.slice(0, 3).join(', ')}
                          {result.values.length > 3 && '...'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Data Cleaning Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Data Cleaning Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Missing Data Handling */}
          <div>
            <h4 className="font-medium mb-3">Missing Data Handling</h4>
            <div className="grid grid-cols-3 gap-3">
              <label className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="missing"
                  value="remove"
                  checked={cleaningActions.handleMissing === 'remove'}
                  onChange={(e) => setCleaningActions({...cleaningActions, handleMissing: e.target.value as any})}
                />
                <div>
                  <div className="font-medium text-sm">Listwise Deletion</div>
                  <div className="text-xs text-gray-600">Remove rows with missing values</div>
                </div>
              </label>
              
              <label className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="missing"
                  value="impute"
                  checked={cleaningActions.handleMissing === 'impute'}
                  onChange={(e) => setCleaningActions({...cleaningActions, handleMissing: e.target.value as any})}
                />
                <div>
                  <div className="font-medium text-sm">Imputation</div>
                  <div className="text-xs text-gray-600">Replace with estimated values</div>
                </div>
              </label>
              
              <label className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="missing"
                  value="keep"
                  checked={cleaningActions.handleMissing === 'keep'}
                  onChange={(e) => setCleaningActions({...cleaningActions, handleMissing: e.target.value as any})}
                />
                <div>
                  <div className="font-medium text-sm">Keep Missing</div>
                  <div className="text-xs text-gray-600">Handle in analysis phase</div>
                </div>
              </label>
            </div>

            {cleaningActions.handleMissing === 'impute' && (
              <div className="mt-3">
                <label className="block text-sm font-medium mb-2">Imputation Method</label>
                <select
                  value={cleaningActions.imputationMethod}
                  onChange={(e) => setCleaningActions({...cleaningActions, imputationMethod: e.target.value as any})}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="mean">Mean Imputation</option>
                  <option value="median">Median Imputation</option>
                  <option value="mode">Mode Imputation</option>
                  <option value="regression">Regression Imputation</option>
                </select>
              </div>
            )}
          </div>

          {/* Outlier Handling */}
          <div>
            <h4 className="font-medium mb-3">Outlier Handling</h4>
            <div className="grid grid-cols-3 gap-3">
              <label className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="outliers"
                  value="remove"
                  checked={cleaningActions.handleOutliers === 'remove'}
                  onChange={(e) => setCleaningActions({...cleaningActions, handleOutliers: e.target.value as any})}
                />
                <div>
                  <div className="font-medium text-sm">Remove Outliers</div>
                  <div className="text-xs text-gray-600">Delete outlier cases</div>
                </div>
              </label>
              
              <label className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="outliers"
                  value="winsorize"
                  checked={cleaningActions.handleOutliers === 'winsorize'}
                  onChange={(e) => setCleaningActions({...cleaningActions, handleOutliers: e.target.value as any})}
                />
                <div>
                  <div className="font-medium text-sm">Winsorization</div>
                  <div className="text-xs text-gray-600">Cap at percentile values</div>
                </div>
              </label>
              
              <label className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="outliers"
                  value="keep"
                  checked={cleaningActions.handleOutliers === 'keep'}
                  onChange={(e) => setCleaningActions({...cleaningActions, handleOutliers: e.target.value as any})}
                />
                <div>
                  <div className="font-medium text-sm">Keep Outliers</div>
                  <div className="text-xs text-gray-600">Retain for analysis</div>
                </div>
              </label>
            </div>
          </div>

          {/* Other Options */}
          <div>
            <h4 className="font-medium mb-3">Other Cleaning Options</h4>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={cleaningActions.removeDuplicates}
                onChange={(e) => setCleaningActions({...cleaningActions, removeDuplicates: e.target.checked})}
              />
              <span className="text-sm">Remove duplicate records</span>
            </label>
          </div>

          {/* Clean Data Button */}
          <div className="pt-4 border-t">
            <Button 
              onClick={handleCleanData} 
              disabled={isAnalyzing}
              className="w-full"
            >
              {isAnalyzing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Cleaning Data...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clean Data
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Cleaning Results */}
      {cleanedData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
              Data Cleaning Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3">Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Original rows:</span>
                    <span className="font-medium">{cleanedData.report.originalRows}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cleaned rows:</span>
                    <span className="font-medium text-green-600">{cleanedData.report.cleanedRows}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Removed rows:</span>
                    <span className="font-medium text-red-600">{cleanedData.report.removedRows}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Data retention:</span>
                    <span className="font-medium">
                      {((cleanedData.report.cleanedRows / cleanedData.report.originalRows) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Actions Applied</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Duplicates removed: {cleanedData.report.actions.duplicatesRemoved}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Missing values handled: {cleanedData.report.actions.missingHandled}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Outliers handled: {cleanedData.report.actions.outliersHandled}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrevious}>
          Previous: Data Collection
        </Button>
        <Button 
          onClick={onNext}
          disabled={!cleanedData}
        >
          Continue to Descriptive Analysis
        </Button>
      </div>
    </div>
  );
}