'use client';

import React, { useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { WorkflowStepper } from '@/components/workflow/WorkflowStepper';
import { ErrorDisplay } from '@/components/errors/ErrorDisplay';
import { SkeletonLoader } from '@/components/loading/SkeletonLoader';
import { UploadProgress } from '@/components/loading/UploadProgress';
import { QualityScoreGauge } from '@/components/charts/QualityScoreGauge';
import { MissingDataChart } from '@/components/charts/MissingDataChart';
import { BoxPlotChart } from '@/components/charts/BoxPlotChart';
import ErrorBoundary from '@/components/errors/ErrorBoundary';
import { FieldError } from '@/components/errors/FieldError';
import { useWorkflowStore } from '@/stores/workflowStore';
import { queryClient } from '@/lib/queryClient';
import { WorkflowStep, ErrorState } from '@/types/workflow';
import { ValidationError } from '@/lib/errors';

function WorkflowDemoContent() {
  const {
    currentStep,
    completedSteps,
    setCurrentStep,
    markStepComplete,
    getProgress,
    canNavigateTo,
  } = useWorkflowStore();

  const [showError, setShowError] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showUpload, setShowUpload] = useState(false);
  const [showFieldError, setShowFieldError] = useState(false);
  const [throwError, setThrowError] = useState(false);

  // Sample data for charts
  const missingDataSample = [
    { variable: 'Age', missingCount: 0, totalCount: 1000, percentage: 0 },
    { variable: 'Income', missingCount: 25, totalCount: 1000, percentage: 2.5 },
    { variable: 'Education', missingCount: 50, totalCount: 1000, percentage: 5 },
    { variable: 'Gender', missingCount: 150, totalCount: 1000, percentage: 15 },
    { variable: 'Location', missingCount: 300, totalCount: 1000, percentage: 30 },
  ];

  const boxPlotSample = [
    {
      variable: 'Age',
      min: 18,
      q1: 25,
      median: 35,
      q3: 45,
      max: 65,
      outliers: [15, 16, 70, 72, 75],
    },
    {
      variable: 'Income',
      min: 20000,
      q1: 35000,
      median: 50000,
      q3: 75000,
      max: 120000,
      outliers: [150000, 180000, 200000],
    },
    {
      variable: 'Experience',
      min: 0,
      q1: 2,
      median: 5,
      q3: 10,
      max: 20,
      outliers: [25, 28, 30],
    },
  ];

  const fieldErrorSample = new ValidationError(
    'email',
    'Invalid email format',
    ['Use format: user@example.com', 'Check for typos']
  );

  // Trigger error for ErrorBoundary demo
  if (throwError) {
    throw new Error('This is a test error for ErrorBoundary demo');
  }

  const handleStepClick = (step: WorkflowStep) => {
    if (canNavigateTo(step)) {
      setCurrentStep(step);
    }
  };

  const handleCompleteStep = () => {
    markStepComplete(currentStep);
    
    // Move to next step
    const steps: WorkflowStep[] = [
      'upload',
      'health-check',
      'grouping',
      'demographic',
      'analysis-selection',
      'execution',
      'results',
    ];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const sampleError: ErrorState = {
    type: 'error',
    message: 'Failed to upload CSV file',
    details: 'The file size exceeds the maximum allowed size of 50MB',
    suggestions: [
      'Reduce the file size by removing unnecessary columns',
      'Split the data into multiple files',
      'Compress the file before uploading',
    ],
    canRetry: true,
    canReport: true,
  };

  const simulateUpload = () => {
    setShowUpload(true);
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Workflow UX Demo
          </h1>
          <p className="text-gray-600">
            Demonstration of enhanced UX components for CSV analysis workflow
          </p>
        </div>

        {/* Workflow Stepper */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Workflow Stepper</h2>
          <WorkflowStepper
            currentStep={currentStep}
            completedSteps={completedSteps}
            onStepClick={handleStepClick}
            progress={getProgress()}
          />
          <div className="mt-4 flex gap-2">
            <button
              onClick={handleCompleteStep}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Complete Current Step
            </button>
          </div>
        </div>

        {/* Quality Score Gauge */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Quality Score Gauge</h2>
          <div className="flex gap-8 justify-center">
            <QualityScoreGauge score={45} size="sm" />
            <QualityScoreGauge score={72} size="md" />
            <QualityScoreGauge score={95} size="lg" />
          </div>
        </div>

        {/* Error Display */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Error Display</h2>
          <button
            onClick={() => setShowError(!showError)}
            className="mb-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            {showError ? 'Hide' : 'Show'} Error
          </button>
          {showError && (
            <ErrorDisplay
              error={sampleError}
              onRetry={() => alert('Retry clicked')}
              onReport={() => alert('Report clicked')}
            />
          )}
        </div>

        {/* Upload Progress */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Upload Progress</h2>
          <button
            onClick={simulateUpload}
            className="mb-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Simulate Upload
          </button>
          {showUpload && (
            <UploadProgress
              progress={uploadProgress}
              fileName="survey-data.csv"
              fileSize={2500000}
              uploadSpeed={250000}
              isComplete={uploadProgress === 100}
              onCancel={() => setShowUpload(false)}
            />
          )}
        </div>

        {/* Skeleton Loaders */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Skeleton Loaders</h2>
          <button
            onClick={() => setShowLoading(!showLoading)}
            className="mb-4 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            {showLoading ? 'Hide' : 'Show'} Loading States
          </button>
          {showLoading && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium mb-2">Table Skeleton</h3>
                <SkeletonLoader type="table" rows={5} columns={4} />
              </div>
              <div>
                <h3 className="text-sm font-medium mb-2">Chart Skeleton</h3>
                <SkeletonLoader type="chart" height={200} />
              </div>
              <div>
                <h3 className="text-sm font-medium mb-2">Card Skeleton</h3>
                <SkeletonLoader type="card" />
              </div>
            </div>
          )}
        </div>

        {/* Missing Data Chart */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Missing Data Chart</h2>
          <p className="text-sm text-gray-600 mb-4">
            Visualize missing data across variables with color-coded severity
          </p>
          <MissingDataChart
            data={missingDataSample}
            onVariableClick={(variable) => alert(`Clicked: ${variable}`)}
          />
        </div>

        {/* Box Plot Chart */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Box Plot Chart</h2>
          <p className="text-sm text-gray-600 mb-4">
            Display distribution and outliers for numeric variables
          </p>
          <BoxPlotChart data={boxPlotSample} />
        </div>

        {/* Field Error */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Field Error</h2>
          <button
            onClick={() => setShowFieldError(!showFieldError)}
            className="mb-4 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
          >
            {showFieldError ? 'Hide' : 'Show'} Field Error
          </button>
          {showFieldError && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border-2 border-red-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="user@example"
                />
                <FieldError error={fieldErrorSample} inline />
              </div>
              <div>
                <FieldError error={fieldErrorSample} inline={false} />
              </div>
            </div>
          )}
        </div>

        {/* Error Boundary Demo */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Error Boundary</h2>
          <p className="text-sm text-gray-600 mb-4">
            Click the button below to trigger an error and see the ErrorBoundary in action
          </p>
          <button
            onClick={() => setThrowError(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
          >
            Trigger Error
          </button>
          <p className="text-xs text-gray-500 mt-2">
            Note: This will crash this component and show the error boundary fallback UI
          </p>
        </div>
      </div>
    </div>
  );
}

export default function WorkflowDemoPage() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <WorkflowDemoContent />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
