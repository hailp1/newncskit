// Error Recovery Service
// Provides automatic error recovery and retry mechanisms

export interface RetryOptions {
  maxAttempts: number;
  delay: number; // milliseconds
  backoffMultiplier: number;
  retryCondition?: (error: any) => boolean;
}

export interface RecoveryAction {
  type: 'retry' | 'fallback' | 'manual' | 'redirect';
  label: string;
  action: () => Promise<void> | void;
  priority: 'high' | 'medium' | 'low';
}

export interface ErrorRecoveryContext {
  operation: string;
  component: string;
  data?: any;
  timestamp: Date;
  userAction?: string;
}

class ErrorRecoveryService {
  private retryAttempts: Map<string, number> = new Map();
  private recoveryHistory: Array<{
    context: ErrorRecoveryContext;
    error: any;
    recoveryAction?: RecoveryAction;
    success: boolean;
  }> = [];

  /**
   * Execute operation with automatic retry
   */
  async withRetry<T>(
    operation: () => Promise<T>,
    context: ErrorRecoveryContext,
    options: Partial<RetryOptions> = {}
  ): Promise<T> {
    const defaultOptions: RetryOptions = {
      maxAttempts: 3,
      delay: 1000,
      backoffMultiplier: 2,
      retryCondition: (error) => this.isRetryableError(error)
    };

    const finalOptions = { ...defaultOptions, ...options };
    const operationKey = `${context.component}-${context.operation}`;
    
    let lastError: any;
    let attempt = 0;

    while (attempt < finalOptions.maxAttempts) {
      try {
        const result = await operation();
        
        // Reset retry count on success
        this.retryAttempts.delete(operationKey);
        
        // Log successful recovery if this was a retry
        if (attempt > 0) {
          this.logRecovery(context, lastError, undefined, true);
        }
        
        return result;
      } catch (error) {
        lastError = error;
        attempt++;
        
        this.retryAttempts.set(operationKey, attempt);
        
        // Check if we should retry
        if (attempt >= finalOptions.maxAttempts || 
            (finalOptions.retryCondition && !finalOptions.retryCondition(error))) {
          break;
        }
        
        // Wait before retry with exponential backoff
        const delay = finalOptions.delay * Math.pow(finalOptions.backoffMultiplier, attempt - 1);
        await this.sleep(delay);
      }
    }

    // Log failed recovery
    this.logRecovery(context, lastError, undefined, false);
    throw lastError;
  }

  /**
   * Get recovery actions for an error
   */
  getRecoveryActions(error: any, context: ErrorRecoveryContext): RecoveryAction[] {
    const actions: RecoveryAction[] = [];
    const errorMessage = error?.message?.toLowerCase() || '';

    // Survey Builder recovery actions
    if (context.component === 'survey-builder') {
      if (errorMessage.includes('question bank') || errorMessage.includes('template')) {
        actions.push({
          type: 'fallback',
          label: 'Tạo câu hỏi thủ công',
          action: () => this.fallbackToManualQuestionCreation(context),
          priority: 'high'
        });
        
        actions.push({
          type: 'retry',
          label: 'Thử tải lại câu hỏi mẫu',
          action: () => this.retryQuestionBankLoad(context),
          priority: 'medium'
        });
      }

      if (errorMessage.includes('generation failed')) {
        actions.push({
          type: 'fallback',
          label: 'Sử dụng template có sẵn',
          action: () => this.fallbackToSurveyTemplate(context),
          priority: 'high'
        });
      }

      if (errorMessage.includes('validation')) {
        actions.push({
          type: 'manual',
          label: 'Kiểm tra và sửa lỗi',
          action: () => this.showValidationErrors(context),
          priority: 'high'
        });
      }
    }

    // Campaign Management recovery actions
    if (context.component === 'campaign-manager') {
      if (errorMessage.includes('insufficient tokens')) {
        actions.push({
          type: 'redirect',
          label: 'Nạp thêm token',
          action: () => this.redirectToTokenPurchase(),
          priority: 'high'
        });
        
        actions.push({
          type: 'manual',
          label: 'Giảm số lượng người tham gia',
          action: () => this.adjustCampaignTargets(context),
          priority: 'medium'
        });
      }

      if (errorMessage.includes('no eligible participants')) {
        actions.push({
          type: 'manual',
          label: 'Điều chỉnh tiêu chí',
          action: () => this.adjustEligibilityCriteria(context),
          priority: 'high'
        });
        
        actions.push({
          type: 'fallback',
          label: 'Sử dụng tiêu chí rộng hơn',
          action: () => this.expandEligibilityCriteria(context),
          priority: 'medium'
        });
      }

      if (errorMessage.includes('launch failed')) {
        actions.push({
          type: 'retry',
          label: 'Thử khởi chạy lại',
          action: () => this.retryCampaignLaunch(context),
          priority: 'high'
        });
        
        actions.push({
          type: 'manual',
          label: 'Kiểm tra cấu hình',
          action: () => this.validateCampaignConfig(context),
          priority: 'medium'
        });
      }
    }

    // Data Integration recovery actions
    if (context.component === 'data-upload') {
      if (errorMessage.includes('parsing error') || errorMessage.includes('corrupt')) {
        actions.push({
          type: 'manual',
          label: 'Tải file khác',
          action: () => this.promptFileReupload(context),
          priority: 'high'
        });
        
        actions.push({
          type: 'fallback',
          label: 'Sử dụng dữ liệu mẫu',
          action: () => this.loadSampleData(context),
          priority: 'low'
        });
      }

      if (errorMessage.includes('format')) {
        actions.push({
          type: 'manual',
          label: 'Chuyển đổi sang CSV',
          action: () => this.showFormatConversionHelp(),
          priority: 'high'
        });
      }

      if (errorMessage.includes('analysis failed')) {
        actions.push({
          type: 'retry',
          label: 'Thử phân tích lại',
          action: () => this.retryDataAnalysis(context),
          priority: 'high'
        });
        
        actions.push({
          type: 'fallback',
          label: 'Phân tích cơ bản',
          action: () => this.fallbackToBasicAnalysis(context),
          priority: 'medium'
        });
      }
    }

    // Generic recovery actions
    if (this.isNetworkError(error)) {
      actions.push({
        type: 'retry',
        label: 'Kiểm tra kết nối và thử lại',
        action: () => this.retryWithNetworkCheck(context),
        priority: 'high'
      });
    }

    if (this.isServerError(error)) {
      actions.push({
        type: 'retry',
        label: 'Thử lại sau ít phút',
        action: () => this.retryAfterDelay(context, 60000), // 1 minute
        priority: 'medium'
      });
    }

    return actions.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * Execute recovery action
   */
  async executeRecovery(action: RecoveryAction, context: ErrorRecoveryContext, error: any): Promise<boolean> {
    try {
      await action.action();
      this.logRecovery(context, error, action, true);
      return true;
    } catch (recoveryError) {
      console.error('Recovery action failed:', recoveryError);
      this.logRecovery(context, error, action, false);
      return false;
    }
  }

  /**
   * Get recovery suggestions based on error history
   */
  getRecoverySuggestions(context: ErrorRecoveryContext): string[] {
    const suggestions: string[] = [];
    const recentErrors = this.recoveryHistory
      .filter(entry => entry.context.component === context.component)
      .slice(-5);

    if (recentErrors.length > 2) {
      suggestions.push('Bạn đang gặp nhiều lỗi. Hãy thử làm mới trang hoặc liên hệ hỗ trợ.');
    }

    const failedRetries = recentErrors.filter(entry => !entry.success && entry.recoveryAction?.type === 'retry');
    if (failedRetries.length > 1) {
      suggestions.push('Thử lại nhiều lần không thành công. Hãy kiểm tra kết nối internet.');
    }

    return suggestions;
  }

  // Private helper methods

  private isRetryableError(error: any): boolean {
    const errorMessage = error?.message?.toLowerCase() || '';
    const retryableErrors = [
      'network',
      'timeout',
      'connection',
      'server error',
      '500',
      '502',
      '503',
      '504',
      'fetch'
    ];

    return retryableErrors.some(keyword => errorMessage.includes(keyword));
  }

  private isNetworkError(error: any): boolean {
    const errorMessage = error?.message?.toLowerCase() || '';
    return errorMessage.includes('network') || 
           errorMessage.includes('connection') || 
           errorMessage.includes('fetch');
  }

  private isServerError(error: any): boolean {
    const errorMessage = error?.message?.toLowerCase() || '';
    return errorMessage.includes('500') || 
           errorMessage.includes('502') || 
           errorMessage.includes('503') || 
           errorMessage.includes('504') ||
           errorMessage.includes('internal server error');
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private logRecovery(
    context: ErrorRecoveryContext,
    error: any,
    recoveryAction?: RecoveryAction,
    success: boolean = false
  ): void {
    this.recoveryHistory.push({
      context,
      error,
      recoveryAction,
      success
    });

    // Keep only last 100 entries
    if (this.recoveryHistory.length > 100) {
      this.recoveryHistory.splice(0, this.recoveryHistory.length - 100);
    }
  }

  // Recovery action implementations

  private async fallbackToManualQuestionCreation(context: ErrorRecoveryContext): Promise<void> {
    // Emit event for component to handle
    window.dispatchEvent(new CustomEvent('survey-builder:fallback-manual', { 
      detail: { context } 
    }));
  }

  private async retryQuestionBankLoad(context: ErrorRecoveryContext): Promise<void> {
    window.dispatchEvent(new CustomEvent('survey-builder:retry-question-load', { 
      detail: { context } 
    }));
  }

  private async fallbackToSurveyTemplate(context: ErrorRecoveryContext): Promise<void> {
    window.dispatchEvent(new CustomEvent('survey-builder:fallback-template', { 
      detail: { context } 
    }));
  }

  private async showValidationErrors(context: ErrorRecoveryContext): Promise<void> {
    window.dispatchEvent(new CustomEvent('survey-builder:show-validation', { 
      detail: { context } 
    }));
  }

  private async redirectToTokenPurchase(): Promise<void> {
    window.location.href = '/dashboard/tokens';
  }

  private async adjustCampaignTargets(context: ErrorRecoveryContext): Promise<void> {
    window.dispatchEvent(new CustomEvent('campaign-manager:adjust-targets', { 
      detail: { context } 
    }));
  }

  private async adjustEligibilityCriteria(context: ErrorRecoveryContext): Promise<void> {
    window.dispatchEvent(new CustomEvent('campaign-manager:adjust-criteria', { 
      detail: { context } 
    }));
  }

  private async expandEligibilityCriteria(context: ErrorRecoveryContext): Promise<void> {
    window.dispatchEvent(new CustomEvent('campaign-manager:expand-criteria', { 
      detail: { context } 
    }));
  }

  private async retryCampaignLaunch(context: ErrorRecoveryContext): Promise<void> {
    window.dispatchEvent(new CustomEvent('campaign-manager:retry-launch', { 
      detail: { context } 
    }));
  }

  private async validateCampaignConfig(context: ErrorRecoveryContext): Promise<void> {
    window.dispatchEvent(new CustomEvent('campaign-manager:validate-config', { 
      detail: { context } 
    }));
  }

  private async promptFileReupload(context: ErrorRecoveryContext): Promise<void> {
    window.dispatchEvent(new CustomEvent('data-upload:prompt-reupload', { 
      detail: { context } 
    }));
  }

  private async loadSampleData(context: ErrorRecoveryContext): Promise<void> {
    window.dispatchEvent(new CustomEvent('data-upload:load-sample', { 
      detail: { context } 
    }));
  }

  private async showFormatConversionHelp(): Promise<void> {
    window.open('/help/file-formats', '_blank');
  }

  private async retryDataAnalysis(context: ErrorRecoveryContext): Promise<void> {
    window.dispatchEvent(new CustomEvent('data-upload:retry-analysis', { 
      detail: { context } 
    }));
  }

  private async fallbackToBasicAnalysis(context: ErrorRecoveryContext): Promise<void> {
    window.dispatchEvent(new CustomEvent('data-upload:fallback-basic', { 
      detail: { context } 
    }));
  }

  private async retryWithNetworkCheck(context: ErrorRecoveryContext): Promise<void> {
    // Check network connectivity
    try {
      await fetch('/api/health', { method: 'HEAD' });
      window.dispatchEvent(new CustomEvent('error-recovery:retry-operation', { 
        detail: { context } 
      }));
    } catch {
      alert('Vui lòng kiểm tra kết nối internet và thử lại.');
    }
  }

  private async retryAfterDelay(context: ErrorRecoveryContext, delay: number): Promise<void> {
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('error-recovery:retry-operation', { 
        detail: { context } 
      }));
    }, delay);
  }
}

// Create and export singleton instance
export const errorRecoveryService = new ErrorRecoveryService();
export default errorRecoveryService;