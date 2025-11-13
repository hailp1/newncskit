/**
 * Workflow Logger Service
 * 
 * Provides comprehensive logging for the CSV analysis workflow with:
 * - Step transitions with timestamps
 * - API calls with correlation IDs
 * - Step durations
 * - Error tracking with full details and stack traces
 * - Workflow completion summaries
 * 
 * Requirements: 9.1, 9.2, 9.3, 9.4, 9.5
 */

export type WorkflowStep = 'upload' | 'health' | 'group' | 'demographic' | 'analyze' | 'results';

export interface StepTransitionLog {
  fromStep: WorkflowStep | null;
  toStep: WorkflowStep;
  timestamp: string;
  duration?: number;
  metadata?: Record<string, any>;
}

export interface APICallLog {
  endpoint: string;
  method: string;
  correlationId: string;
  timestamp: string;
  duration?: number;
  status?: number;
  success?: boolean;
  error?: string;
  metadata?: Record<string, any>;
}

export interface ErrorLog {
  message: string;
  stack?: string;
  timestamp: string;
  context: string;
  correlationId?: string;
  metadata?: Record<string, any>;
}

export interface WorkflowSession {
  sessionId: string;
  startTime: string;
  endTime?: string;
  totalDuration?: number;
  steps: StepTransitionLog[];
  apiCalls: APICallLog[];
  errors: ErrorLog[];
  currentStep: WorkflowStep;
}

class WorkflowLoggerService {
  private session: WorkflowSession | null = null;
  private stepStartTimes: Map<WorkflowStep, number> = new Map();
  private apiCallStartTimes: Map<string, number> = new Map();
  private isEnabled: boolean = true;

  /**
   * Initialize a new workflow session
   * Requirement 9.1: Log workflow step transitions with timestamps
   */
  startSession(initialStep: WorkflowStep = 'upload'): string {
    const sessionId = this.generateSessionId();
    const timestamp = new Date().toISOString();

    this.session = {
      sessionId,
      startTime: timestamp,
      steps: [],
      apiCalls: [],
      errors: [],
      currentStep: initialStep,
    };

    this.stepStartTimes.set(initialStep, Date.now());

    if (this.isEnabled) {
      console.log('[Workflow Session] Started', {
        sessionId,
        timestamp,
        initialStep,
      });
    }

    return sessionId;
  }

  /**
   * Log a step transition
   * Requirement 9.1: Log workflow step transitions with timestamps
   * Requirement 9.3: Log step durations
   */
  logStepTransition(
    fromStep: WorkflowStep | null,
    toStep: WorkflowStep,
    metadata?: Record<string, any>
  ): void {
    if (!this.session) {
      console.warn('[Workflow Logger] No active session. Call startSession() first.');
      return;
    }

    const timestamp = new Date().toISOString();
    const now = Date.now();

    // Calculate duration if we have a start time for the previous step
    let duration: number | undefined;
    if (fromStep && this.stepStartTimes.has(fromStep)) {
      duration = now - this.stepStartTimes.get(fromStep)!;
    }

    // Record start time for new step
    this.stepStartTimes.set(toStep, now);

    const log: StepTransitionLog = {
      fromStep,
      toStep,
      timestamp,
      duration,
      metadata,
    };

    this.session.steps.push(log);
    this.session.currentStep = toStep;

    if (this.isEnabled) {
      console.log('[Workflow Step] Transition', {
        sessionId: this.session.sessionId,
        fromStep,
        toStep,
        timestamp,
        duration: duration ? `${duration}ms` : 'N/A',
        metadata,
      });
    }
  }

  /**
   * Log the start of an API call
   * Requirement 9.2: Log API calls with correlation IDs
   */
  logAPICallStart(
    endpoint: string,
    method: string,
    correlationId: string,
    metadata?: Record<string, any>
  ): void {
    if (!this.session) {
      console.warn('[Workflow Logger] No active session. Call startSession() first.');
      return;
    }

    const timestamp = new Date().toISOString();
    const now = Date.now();

    // Store start time for duration calculation
    this.apiCallStartTimes.set(correlationId, now);

    if (this.isEnabled) {
      console.log('[API Call] Started', {
        sessionId: this.session.sessionId,
        endpoint,
        method,
        correlationId,
        timestamp,
        metadata,
      });
    }
  }

  /**
   * Log the completion of an API call
   * Requirement 9.2: Log API calls with correlation IDs
   * Requirement 9.3: Log step durations
   */
  logAPICallComplete(
    endpoint: string,
    method: string,
    correlationId: string,
    status: number,
    success: boolean,
    metadata?: Record<string, any>
  ): void {
    if (!this.session) {
      console.warn('[Workflow Logger] No active session. Call startSession() first.');
      return;
    }

    const timestamp = new Date().toISOString();
    const now = Date.now();

    // Calculate duration
    let duration: number | undefined;
    if (this.apiCallStartTimes.has(correlationId)) {
      duration = now - this.apiCallStartTimes.get(correlationId)!;
      this.apiCallStartTimes.delete(correlationId);
    }

    const log: APICallLog = {
      endpoint,
      method,
      correlationId,
      timestamp,
      duration,
      status,
      success,
      metadata,
    };

    this.session.apiCalls.push(log);

    if (this.isEnabled) {
      const logLevel = success ? 'log' : 'error';
      console[logLevel]('[API Call] Completed', {
        sessionId: this.session.sessionId,
        endpoint,
        method,
        correlationId,
        timestamp,
        status,
        success,
        duration: duration ? `${duration}ms` : 'N/A',
        metadata,
      });
    }
  }

  /**
   * Log an API call error
   * Requirement 9.2: Log API calls with correlation IDs
   * Requirement 9.4: Log errors with full details and stack traces
   */
  logAPICallError(
    endpoint: string,
    method: string,
    correlationId: string,
    error: Error,
    metadata?: Record<string, any>
  ): void {
    if (!this.session) {
      console.warn('[Workflow Logger] No active session. Call startSession() first.');
      return;
    }

    const timestamp = new Date().toISOString();
    const now = Date.now();

    // Calculate duration
    let duration: number | undefined;
    if (this.apiCallStartTimes.has(correlationId)) {
      duration = now - this.apiCallStartTimes.get(correlationId)!;
      this.apiCallStartTimes.delete(correlationId);
    }

    const log: APICallLog = {
      endpoint,
      method,
      correlationId,
      timestamp,
      duration,
      success: false,
      error: error.message,
      metadata: {
        ...metadata,
        stack: error.stack,
      },
    };

    this.session.apiCalls.push(log);

    // Also log as error
    this.logError(error, `API Call: ${method} ${endpoint}`, correlationId, metadata);

    if (this.isEnabled) {
      console.error('[API Call] Error', {
        sessionId: this.session.sessionId,
        endpoint,
        method,
        correlationId,
        timestamp,
        duration: duration ? `${duration}ms` : 'N/A',
        error: error.message,
        stack: error.stack,
        metadata,
      });
    }
  }

  /**
   * Log an error with full details
   * Requirement 9.4: Log errors with full details and stack traces
   */
  logError(
    error: Error,
    context: string,
    correlationId?: string,
    metadata?: Record<string, any>
  ): void {
    if (!this.session) {
      console.warn('[Workflow Logger] No active session. Call startSession() first.');
      return;
    }

    const timestamp = new Date().toISOString();

    const log: ErrorLog = {
      message: error.message,
      stack: error.stack,
      timestamp,
      context,
      correlationId,
      metadata,
    };

    this.session.errors.push(log);

    if (this.isEnabled) {
      console.error('[Workflow Error]', {
        sessionId: this.session.sessionId,
        context,
        correlationId,
        timestamp,
        message: error.message,
        stack: error.stack,
        metadata,
      });
    }
  }

  /**
   * End the workflow session and log summary
   * Requirement 9.5: Log workflow completion summary
   */
  endSession(success: boolean = true, metadata?: Record<string, any>): void {
    if (!this.session) {
      console.warn('[Workflow Logger] No active session to end.');
      return;
    }

    const endTime = new Date().toISOString();
    const totalDuration = Date.now() - new Date(this.session.startTime).getTime();

    this.session.endTime = endTime;
    this.session.totalDuration = totalDuration;

    if (this.isEnabled) {
      console.log('[Workflow Session] Ended', {
        sessionId: this.session.sessionId,
        startTime: this.session.startTime,
        endTime,
        totalDuration: `${totalDuration}ms`,
        success,
        metadata,
      });

      // Log comprehensive summary
      this.logSummary();
    }

    // Clear session
    this.session = null;
    this.stepStartTimes.clear();
    this.apiCallStartTimes.clear();
  }

  /**
   * Log a comprehensive workflow summary
   * Requirement 9.5: Log workflow completion summary
   */
  private logSummary(): void {
    if (!this.session) return;

    const summary = {
      sessionId: this.session.sessionId,
      duration: this.session.totalDuration ? `${this.session.totalDuration}ms` : 'N/A',
      steps: {
        total: this.session.steps.length,
        list: this.session.steps.map(s => ({
          transition: `${s.fromStep || 'START'} → ${s.toStep}`,
          duration: s.duration ? `${s.duration}ms` : 'N/A',
          timestamp: s.timestamp,
        })),
      },
      apiCalls: {
        total: this.session.apiCalls.length,
        successful: this.session.apiCalls.filter(c => c.success).length,
        failed: this.session.apiCalls.filter(c => !c.success).length,
        averageDuration: this.calculateAverageAPIDuration(),
        list: this.session.apiCalls.map(c => ({
          endpoint: c.endpoint,
          method: c.method,
          correlationId: c.correlationId,
          status: c.status,
          success: c.success,
          duration: c.duration ? `${c.duration}ms` : 'N/A',
        })),
      },
      errors: {
        total: this.session.errors.length,
        list: this.session.errors.map(e => ({
          context: e.context,
          message: e.message,
          correlationId: e.correlationId,
          timestamp: e.timestamp,
        })),
      },
    };

    console.log('[Workflow Summary]', summary);
  }

  /**
   * Calculate average API call duration
   */
  private calculateAverageAPIDuration(): string {
    if (!this.session || this.session.apiCalls.length === 0) {
      return 'N/A';
    }

    const durations = this.session.apiCalls
      .filter(c => c.duration !== undefined)
      .map(c => c.duration!);

    if (durations.length === 0) {
      return 'N/A';
    }

    const average = durations.reduce((sum, d) => sum + d, 0) / durations.length;
    return `${Math.round(average)}ms`;
  }

  /**
   * Get current session data
   */
  getSession(): WorkflowSession | null {
    return this.session;
  }

  /**
   * Generate a unique session ID
   */
  private generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Generate a unique correlation ID for API calls
   */
  generateCorrelationId(prefix: string = 'api'): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Enable or disable logging
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  /**
   * Check if logging is enabled
   */
  isLoggingEnabled(): boolean {
    return this.isEnabled;
  }
}

// Export singleton instance
export const workflowLogger = new WorkflowLoggerService();
