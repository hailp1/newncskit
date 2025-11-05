'use client';

import React, { Component, ReactNode } from 'react';
import { ErrorHandler, ErrorMessage } from '@/services/error-handler';
import { errorRecoveryService, ErrorRecoveryContext, RecoveryAction } from '@/services/error-recovery';
import { FullPageError, ErrorMessageComponent } from '@/components/ui/error-message';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  context?: {
    component: string;
    operation?: string;
  };
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorMessage: ErrorMessage | null;
  recoveryActions: RecoveryAction[];
  isRecovering: boolean;
}

export class WorkflowErrorBoundary extends Component<Props, State> {
  private retryCount = 0;
  private maxRetries = 3;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorMessage: null,
      recoveryActions: [],
      isRecovering: false
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('WorkflowErrorBoundary caught an error:', error, errorInfo);
    
    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Generate user-friendly error message and recovery actions
    this.generateErrorResponse(error);

    // Log error for analytics
    this.logError(error, errorInfo);
  }

  private generateErrorResponse(error: Error) {
    const context = this.props.context;
    let errorMessage: ErrorMessage;
    let recoveryActions: RecoveryAction[] = [];

    // Determine error type and generate appropriate response
    if (context?.component === 'survey-builder') {
      errorMessage = ErrorHandler.handleSurveyBuilderError(error);
    } else if (context?.component === 'campaign-manager') {
      errorMessage = ErrorHandler.handleCampaignError(error);
    } else if (context?.component === 'data-upload') {
      errorMessage = ErrorHandler.handleDataIntegrationError(error);
    } else {
      errorMessage = ErrorHandler.handleGenericError(error);
    }

    // Get recovery actions if context is available
    if (context) {
      const recoveryContext: ErrorRecoveryContext = {
        operation: context.operation || 'unknown',
        component: context.component,
        timestamp: new Date()
      };
      recoveryActions = errorRecoveryService.getRecoveryActions(error, recoveryContext);
    }

    this.setState({
      errorMessage,
      recoveryActions
    });
  }

  private logError(error: Error, errorInfo: React.ErrorInfo) {
    // Log to console for development
    console.group('🚨 Error Boundary Caught Error');
    console.error('Error:', error);
    console.error('Error Info:', errorInfo);
    console.error('Component Stack:', errorInfo.componentStack);
    console.groupEnd();

    // In production, you might want to send this to an error reporting service
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to error reporting service
      // errorReportingService.captureException(error, {
      //   extra: errorInfo,
      //   tags: {
      //     component: this.props.context?.component || 'unknown',
      //     operation: this.props.context?.operation || 'unknown'
      //   }
      // });
    }
  }

  private handleRetry = async () => {
    if (this.retryCount >= this.maxRetries) {
      console.warn('Maximum retry attempts reached');
      return;
    }

    this.setState({ isRecovering: true });
    this.retryCount++;

    try {
      // Wait a bit before retrying
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Reset error state to retry rendering
      this.setState({
        hasError: false,
        error: null,
        errorMessage: null,
        recoveryActions: [],
        isRecovering: false
      });
    } catch (retryError) {
      console.error('Retry failed:', retryError);
      this.setState({ isRecovering: false });
    }
  };

  private handleRecoveryAction = async (action: RecoveryAction) => {
    this.setState({ isRecovering: true });

    try {
      const context: ErrorRecoveryContext = {
        operation: 'error-recovery',
        component: this.props.context?.component || 'error-boundary',
        timestamp: new Date()
      };

      const success = await errorRecoveryService.executeRecovery(
        action, 
        context, 
        this.state.error
      );

      if (success) {
        // Reset error state if recovery was successful
        this.setState({
          hasError: false,
          error: null,
          errorMessage: null,
          recoveryActions: [],
          isRecovering: false
        });
        this.retryCount = 0; // Reset retry count on successful recovery
      } else {
        this.setState({ isRecovering: false });
      }
    } catch (recoveryError) {
      console.error('Recovery action failed:', recoveryError);
      this.setState({ isRecovering: false });
    }
  };

  private handleReset = () => {
    this.retryCount = 0;
    this.setState({
      hasError: false,
      error: null,
      errorMessage: null,
      recoveryActions: [],
      isRecovering: false
    });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Full page error for critical errors
      if (this.state.error && this.isCriticalError(this.state.error)) {
        return (
          <FullPageError
            error={this.state.errorMessage || ErrorHandler.handleGenericError(this.state.error)}
            onRetry={this.handleRetry}
          />
        );
      }

      // Inline error for recoverable errors
      return (
        <div className="min-h-[400px] flex items-center justify-center p-6">
          <Card className="max-w-2xl w-full p-6 space-y-6">
            {this.state.errorMessage && (
              <ErrorMessageComponent
                error={this.state.errorMessage}
                onDismiss={this.handleReset}
              />
            )}

            {this.state.recoveryActions.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Recovery Options
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {this.state.recoveryActions.map((action, index) => (
                    <Button
                      key={index}
                      variant={action.priority === 'high' ? 'default' : 'outline'}
                      onClick={() => this.handleRecoveryAction(action)}
                      disabled={this.state.isRecovering}
                      className="justify-start"
                    >
                      {this.state.isRecovering ? 'Processing...' : action.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
              <Button
                onClick={this.handleRetry}
                disabled={this.state.isRecovering || this.retryCount >= this.maxRetries}
                variant="outline"
              >
                {this.state.isRecovering ? 'Retrying...' : `Retry (${this.retryCount}/${this.maxRetries})`}
              </Button>
              
              <Button
                onClick={this.handleReset}
                variant="ghost"
              >
                Reset
              </Button>

              <Button
                onClick={() => window.location.reload()}
                variant="ghost"
              >
                Refresh Page
              </Button>
            </div>

            {/* Error Details (Development Only) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 p-4 bg-gray-50 rounded-md">
                <summary className="cursor-pointer text-sm font-medium text-gray-700">
                  Error Details (Development)
                </summary>
                <pre className="mt-2 text-xs text-gray-600 overflow-auto">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </Card>
        </div>
      );
    }

    return this.props.children;
  }

  private isCriticalError(error: Error): boolean {
    const criticalKeywords = [
      'chunk',
      'loading',
      'network',
      'script',
      'module',
      'import'
    ];

    const errorMessage = error.message.toLowerCase();
    return criticalKeywords.some(keyword => errorMessage.includes(keyword));
  }
}

// Higher-order component for easy wrapping
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <WorkflowErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </WorkflowErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
}

// Hook for manual error reporting
export function useErrorHandler() {
  const reportError = (error: Error, context?: { component: string; operation?: string }) => {
    // Manually trigger error boundary
    throw error;
  };

  return { reportError };
}