'use client';

import { useState, useCallback, useEffect } from 'react';
// import { useDropzone } from 'react-dropzone';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ErrorMessageComponent } from '@/components/ui/error-message';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { DataColumn } from '@/app/(dashboard)/analysis/page';
import { ErrorHandler, ErrorMessage } from '@/services/error-handler';
import { errorRecoveryService, ErrorRecoveryContext, RecoveryAction } from '@/services/error-recovery';

interface DataUploadProps {
  onDataUploaded: (data: any[][], columns: DataColumn[], metadata?: any) => void;
  mode?: 'file' | 'survey' | 'both'; // New dual-mode support
  projectId?: string; // For loading survey data
}

export default function DataUpload({ onDataUploaded, mode = 'both', projectId }: DataUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<ErrorMessage | null>(null);
  const [previewData, setPreviewData] = useState<any[][] | null>(null);
  const [recoveryActions, setRecoveryActions] = useState<RecoveryAction[]>([]);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState<'file' | 'survey'>('file');
  const [availableSurveys, setAvailableSurveys] = useState<any[]>([]);
  const [selectedSurvey, setSelectedSurvey] = useState<string | null>(null);

  const detectColumnType = (values: any[]): 'numeric' | 'categorical' | 'ordinal' | 'text' => {
    const nonNullValues = values.filter(v => v !== null && v !== undefined && v !== '');
    
    if (nonNullValues.length === 0) return 'text';
    
    // Check if all values are numeric
    const numericValues = nonNullValues.filter(v => !isNaN(Number(v)));
    const numericRatio = numericValues.length / nonNullValues.length;
    
    if (numericRatio > 0.8) {
      // Check if it's ordinal (limited unique values)
      const uniqueValues = [...new Set(numericValues.map(v => Number(v)))];
      if (uniqueValues.length <= 10 && uniqueValues.length > 1) {
        return 'ordinal';
      }
      return 'numeric';
    }
    
    // Check if it's categorical
    const uniqueValues = [...new Set(nonNullValues)];
    if (uniqueValues.length <= 20) {
      return 'categorical';
    }
    
    return 'text';
  };

  const calculateStats = (values: any[], type: string) => {
    const nonNullValues = values.filter(v => v !== null && v !== undefined && v !== '');
    
    if (type === 'numeric' || type === 'ordinal') {
      const numericValues = nonNullValues.map(v => Number(v)).filter(v => !isNaN(v));
      
      if (numericValues.length > 0) {
        const mean = numericValues.reduce((a, b) => a + b, 0) / numericValues.length;
        const variance = numericValues.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / numericValues.length;
        const std = Math.sqrt(variance);
        
        return {
          mean: Number(mean.toFixed(3)),
          std: Number(std.toFixed(3)),
          min: Math.min(...numericValues),
          max: Math.max(...numericValues),
          unique: [...new Set(numericValues)].length
        };
      }
    }
    
    return {
      unique: [...new Set(nonNullValues)].length
    };
  };

  const processData = (data: any[][]): DataColumn[] => {
    if (data.length < 2) return [];
    
    const headers = data[0];
    const rows = data.slice(1);
    
    return headers.map((header: string, index: number) => {
      const columnValues = rows.map(row => row[index]);
      const type = detectColumnType(columnValues);
      const missing = columnValues.filter(v => v === null || v === undefined || v === '').length;
      const stats = calculateStats(columnValues, type);
      
      return {
        name: header || `Column_${index + 1}`,
        type,
        role: 'none',
        values: columnValues.slice(0, 100), // Store first 100 values for preview
        missing,
        stats
      };
    });
  };

  const parseCSV = (file: File): Promise<any[][]> => {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        complete: (results) => {
          if (results.errors.length > 0) {
            reject(new Error(`CSV parsing error: ${results.errors[0].message}`));
          } else {
            resolve(results.data as any[][]);
          }
        },
        error: (error) => reject(error),
        skipEmptyLines: true,
        header: false
      });
    });
  };

  const parseExcel = (file: File): Promise<any[][]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          resolve(jsonData as any[][]);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read Excel file'));
      reader.readAsArrayBuffer(file);
    });
  };

  // Enhanced file validation function
  const validateFile = (file: File): { isValid: boolean; error?: string } => {
    // File type validation
    const allowedTypes = ['csv', 'xlsx', 'xls'];
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    if (!fileExtension || !allowedTypes.includes(fileExtension)) {
      return { isValid: false, error: 'Only CSV and Excel files (.csv, .xlsx, .xls) are allowed' };
    }
    
    // File size validation (50MB limit)
    const maxSize = 50 * 1024 * 1024; // 50MB in bytes
    if (file.size > maxSize) {
      return { isValid: false, error: 'File size must be less than 50MB' };
    }
    
    // File name validation (prevent path traversal)
    const fileName = file.name;
    if (fileName.includes('..') || fileName.includes('/') || fileName.includes('\\')) {
      return { isValid: false, error: 'Invalid file name' };
    }
    
    // MIME type validation
    const allowedMimeTypes = [
      'text/csv',
      'application/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    if (file.type && !allowedMimeTypes.includes(file.type)) {
      return { isValid: false, error: 'Invalid file type. Please upload a valid CSV or Excel file' };
    }
    
    return { isValid: true };
  };

  const handleFileUpload = async (files: File[]) => {
    if (files.length === 0) return;
    
    const file = files[0];
    setCurrentFile(file);
    
    const context: ErrorRecoveryContext = {
      operation: 'fileUpload',
      component: 'data-upload',
      data: { fileName: file.name, fileSize: file.size },
      timestamp: new Date(),
      userAction: 'upload_file'
    };
    
    // Enhanced file validation
    const validation = validateFile(file);
    if (!validation.isValid) {
      const errorMsg = ErrorHandler.handleDataIntegrationError(new Error(validation.error));
      setError(errorMsg);
      setRecoveryActions(errorRecoveryService.getRecoveryActions(new Error(validation.error), context));
      return;
    }
    
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    setIsUploading(true);
    setError(null);
    setRecoveryActions([]);
    setUploadProgress(0);
    
    try {
      await errorRecoveryService.withRetry(async () => {
        // Simulate progress
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => Math.min(prev + 10, 90));
        }, 100);
        
        let data: any[][];
        
        try {
          if (fileExtension === 'csv') {
            data = await parseCSV(file);
          } else {
            data = await parseExcel(file);
          }
        } catch (parseError) {
          clearInterval(progressInterval);
          throw new Error(`File parsing failed: ${parseError.message}`);
        }
        
        clearInterval(progressInterval);
        setUploadProgress(95);
        
        // Validate data structure
        if (!data || data.length === 0) {
          throw new Error('File contains no data');
        }
        
        if (data.length < 2) {
          throw new Error('File must contain at least a header row and one data row');
        }
        
        // Process and analyze data
        let columns: DataColumn[];
        try {
          columns = processData(data);
        } catch (processError) {
          throw new Error(`Data processing failed: ${processError.message}`);
        }
        
        setUploadProgress(100);
        setPreviewData(data.slice(0, 6)); // Show first 5 rows + header
        
        // Auto-upload after successful parsing
        setTimeout(() => {
          onDataUploaded(data, columns, {
            dataSource: 'external_file',
            fileName: file.name,
            fileSize: file.size,
            uploadedAt: new Date()
          });
          setError(null);
          setRecoveryActions([]);
        }, 500);
        
      }, context, {
        maxAttempts: 2,
        delay: 1000,
        retryCondition: (error) => {
          const errorMessage = error?.message?.toLowerCase() || '';
          return errorMessage.includes('network') || 
                 errorMessage.includes('timeout') ||
                 errorMessage.includes('temporary');
        }
      });
      
    } catch (error: any) {
      console.error('File upload error:', error);
      
      const userError = ErrorHandler.handleDataIntegrationError(error);
      setError(userError);
      
      const actions = errorRecoveryService.getRecoveryActions(error, context);
      setRecoveryActions(actions);
      
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      handleFileUpload(Array.from(files));
    }
  };

  const handleRecoveryAction = async (action: RecoveryAction) => {
    try {
      const context: ErrorRecoveryContext = {
        operation: 'recovery',
        component: 'data-upload',
        data: { actionType: action.type },
        timestamp: new Date(),
        userAction: 'execute_recovery'
      };

      const success = await errorRecoveryService.executeRecovery(action, context, error);
      if (success) {
        setError(null);
        setRecoveryActions([]);
      }
    } catch (recoveryError) {
      console.error('Recovery action failed:', recoveryError);
    }
  };

  // Load available surveys for the project
  const loadAvailableSurveys = async () => {
    if (!projectId) return;
    
    try {
      // This would typically call a survey service to get completed surveys
      // For now, we'll use mock data
      const mockSurveys = [
        {
          id: 'survey-1',
          title: 'Customer Satisfaction Survey',
          completedResponses: 150,
          completedAt: '2024-01-15',
          status: 'completed'
        },
        {
          id: 'survey-2', 
          title: 'Product Feedback Survey',
          completedResponses: 89,
          completedAt: '2024-01-10',
          status: 'completed'
        }
      ];
      
      setAvailableSurveys(mockSurveys);
    } catch (error) {
      console.error('Failed to load surveys:', error);
    }
  };

  // Load survey data
  const loadSurveyData = async (surveyId: string) => {
    setIsUploading(true);
    setError(null);
    
    try {
      // This would typically call an API to get survey response data
      // For now, we'll generate mock survey data
      const mockSurveyData = generateMockSurveyData();
      const columns = processData(mockSurveyData);
      
      setPreviewData(mockSurveyData.slice(0, 6));
      
      // Create mock survey metadata
      const surveyInfo = availableSurveys.find(s => s.id === surveyId);
      const mockMetadata = {
        dataSource: 'survey_campaign',
        surveyMetadata: {
          surveyId: surveyId,
          campaignId: `campaign-${surveyId}`,
          responseCount: surveyInfo?.completedResponses || 100,
          targetSampleSize: 150,
          collectionPeriod: {
            start: new Date('2024-01-01'),
            end: new Date(surveyInfo?.completedAt || '2024-01-15')
          }
        },
        projectContext: {
          title: `Survey Analysis - ${surveyInfo?.title}`,
          dataCollection: {
            collectionMethod: 'internal_survey'
          },
          researchDesign: {
            theoreticalFrameworks: [{
              name: 'Customer Satisfaction Theory',
              description: 'Framework for measuring customer satisfaction and loyalty'
            }],
            researchVariables: [
              {
                name: 'Customer Satisfaction',
                type: 'dependent',
                construct: 'Satisfaction',
                measurementItems: ['Satisfaction_Q1', 'Satisfaction_Q2', 'Satisfaction_Q3']
              },
              {
                name: 'Customer Loyalty',
                type: 'dependent', 
                construct: 'Loyalty',
                measurementItems: ['Loyalty_Q1', 'Loyalty_Q2']
              },
              {
                name: 'Trust',
                type: 'independent',
                construct: 'Trust',
                measurementItems: ['Trust_Q1', 'Trust_Q2']
              }
            ],
            hypotheses: [
              {
                statement: 'Trust positively influences customer satisfaction',
                type: 'main'
              },
              {
                statement: 'Customer satisfaction positively influences loyalty',
                type: 'main'
              }
            ]
          }
        }
      };
      
      onDataUploaded(mockSurveyData, columns, mockMetadata);
      
    } catch (error: any) {
      const userError = ErrorHandler.handleDataIntegrationError(error);
      setError(userError);
    } finally {
      setIsUploading(false);
    }
  };

  // Generate mock survey data
  const generateMockSurveyData = () => {
    const headers = [
      'ResponseID', 'Age', 'Gender', 'Education', 
      'Satisfaction_Q1', 'Satisfaction_Q2', 'Satisfaction_Q3',
      'Loyalty_Q1', 'Loyalty_Q2', 'Trust_Q1', 'Trust_Q2'
    ];
    
    const data = [headers];
    
    for (let i = 1; i <= 100; i++) {
      const row = [
        `R${i}`,
        (Math.floor(Math.random() * 40) + 20).toString(), // Age 20-60
        Math.random() > 0.5 ? 'Male' : 'Female',
        ['High School', 'Bachelor', 'Master', 'PhD'][Math.floor(Math.random() * 4)],
        (Math.floor(Math.random() * 5) + 1).toString(), // Likert 1-5
        (Math.floor(Math.random() * 5) + 1).toString(),
        (Math.floor(Math.random() * 5) + 1).toString(),
        (Math.floor(Math.random() * 5) + 1).toString(),
        (Math.floor(Math.random() * 5) + 1).toString(),
        (Math.floor(Math.random() * 5) + 1).toString(),
        (Math.floor(Math.random() * 5) + 1).toString()
      ];
      data.push(row);
    }
    
    return data;
  };

  // Set up error recovery event listeners
  useEffect(() => {
    const handleRetryOperation = () => {
      if (currentFile) {
        handleFileUpload([currentFile]);
      }
    };

    const handlePromptReupload = () => {
      setError(null);
      setRecoveryActions([]);
      setPreviewData(null);
      setCurrentFile(null);
      // Reset file input
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    };

    const handleLoadSample = async () => {
      try {
        // Load sample data
        const sampleData = [
          ['ID', 'Age', 'Gender', 'Satisfaction', 'Loyalty'],
          [1, 25, 'Male', 4, 3],
          [2, 30, 'Female', 5, 4],
          [3, 35, 'Male', 3, 2],
          [4, 28, 'Female', 4, 4],
          [5, 32, 'Male', 5, 5]
        ];
        
        const columns = processData(sampleData);
        setPreviewData(sampleData);
        onDataUploaded(sampleData, columns, {
          dataSource: 'sample_data',
          sampleType: 'basic_survey'
        });
        setError(null);
        setRecoveryActions([]);
      } catch (error) {
        console.error('Failed to load sample data:', error);
      }
    };

    window.addEventListener('error-recovery:retry-operation', handleRetryOperation);
    window.addEventListener('data-upload:prompt-reupload', handlePromptReupload);
    window.addEventListener('data-upload:load-sample', handleLoadSample);

    return () => {
      window.removeEventListener('error-recovery:retry-operation', handleRetryOperation);
      window.removeEventListener('data-upload:prompt-reupload', handlePromptReupload);
      window.removeEventListener('data-upload:load-sample', handleLoadSample);
    };
  }, [currentFile, onDataUploaded]);

  // Load surveys when component mounts
  useEffect(() => {
    if (mode === 'survey' || mode === 'both') {
      loadAvailableSurveys();
    }
  }, [projectId, mode]);

  return (
    <div className="space-y-6">
      {/* Mode Selection Tabs */}
      {mode === 'both' && (
        <Card className="p-4">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('file')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'file'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Upload File
            </button>
            <button
              onClick={() => setActiveTab('survey')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'survey'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Load Survey Data
            </button>
          </div>
        </Card>
      )}

      {/* File Upload Mode */}
      {(mode === 'file' || (mode === 'both' && activeTab === 'file')) && (
        <Card className="p-8">
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-gray-900">Upload Your Data</h3>
            <p className="text-gray-600">
              Upload CSV or Excel files for statistical analysis
            </p>
          </div>
        </div>

        <div className="mt-6 border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors border-gray-300 hover:border-gray-400">
          <input
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileChange}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <div className="space-y-2">
              <p className="text-gray-600">
                Click to browse and select your data file
              </p>
              <p className="text-sm text-gray-500">
                Supports CSV, Excel (.xlsx, .xls) files up to 50MB
              </p>
            </div>
          </label>
        </div>

        {isUploading && (
          <div className="mt-6 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Processing file...</span>
              <span>{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="w-full" />
          </div>
        )}

        {error && (
          <div className="mt-4 space-y-4">
            <ErrorMessageComponent 
              error={error} 
              onDismiss={() => {
                setError(null);
                setRecoveryActions([]);
              }}
            />
            
            {recoveryActions.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <h4 className="text-sm font-medium text-blue-800 mb-2">
                  Suggested Actions:
                </h4>
                <div className="space-y-2">
                  {recoveryActions.map((action, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => handleRecoveryAction(action)}
                      className="mr-2 border-blue-300 text-blue-700 hover:bg-blue-100"
                    >
                      {action.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Card>
      )}

      {/* Data Preview */}
      {previewData && (
        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Data Preview</h3>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {previewData[0]?.map((header: any, index: number) => (
                    <th
                      key={index}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {header || `Column ${index + 1}`}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {previewData.slice(1).map((row: any[], rowIndex: number) => (
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
            Showing first 5 rows of data. Click "Next" to continue with full dataset.
          </div>
        </Card>
      )}

      {/* Survey Data Mode */}
      {(mode === 'survey' || (mode === 'both' && activeTab === 'survey')) && (
        <Card className="p-8">
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900">Load Survey Data</h3>
              <p className="text-gray-600">
                Load data from completed survey campaigns
              </p>
            </div>
          </div>

          {availableSurveys.length > 0 ? (
            <div className="mt-8 space-y-4">
              <h4 className="text-md font-medium text-gray-900">Available Surveys</h4>
              {availableSurveys.map((survey) => (
                <div
                  key={survey.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedSurvey === survey.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedSurvey(survey.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-medium text-gray-900">{survey.title}</h5>
                      <p className="text-sm text-gray-600">
                        {survey.completedResponses} responses • Completed {survey.completedAt}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-green-600 bg-green-100 px-2 py-1 rounded">
                        {survey.status}
                      </span>
                      {selectedSurvey === survey.id && (
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            loadSurveyData(survey.id);
                          }}
                          disabled={isUploading}
                        >
                          {isUploading ? 'Loading...' : 'Load Data'}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-8 text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
              <p className="text-gray-500">
                No completed surveys found for this project.
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => window.location.href = '/campaigns'}
              >
                Create Survey Campaign
              </Button>
            </div>
          )}

          {isUploading && (
            <div className="mt-6 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Loading survey data...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
            </div>
          )}
        </Card>
      )}

      {/* Sample Data Templates */}
      <Card className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Sample Data Templates</h3>
        <p className="text-gray-600 mb-4">
          Don't have data? Download our sample templates to get started:
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button variant="outline" className="justify-start">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Customer Survey Data
          </Button>
          
          <Button variant="outline" className="justify-start">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Employee Satisfaction
          </Button>
          
          <Button variant="outline" className="justify-start">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Marketing Research
          </Button>
        </div>
      </Card>
    </div>
  );
}