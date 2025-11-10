# Logging and Debugging Implementation Summary

## Task 14: Add logging and debugging

**Status**: ✅ Completed

## Overview

Implemented comprehensive logging and debugging infrastructure for the CSV analysis workflow. The implementation provides detailed tracking of workflow progression, API calls, errors, and performance metrics.

## Requirements Fulfilled

### ✅ Requirement 9.1: Log workflow step transitions with timestamps
- Implemented `logStepTransition()` method in WorkflowLoggerService
- Logs every step change with timestamp and metadata
- Tracks previous and current steps
- Integrated into NewAnalysisPage for all step transitions

### ✅ Requirement 9.2: Log API calls with correlation IDs
- Implemented `logAPICallStart()` and `logAPICallComplete()` methods
- Generates unique correlation IDs for each API call
- Includes correlation IDs in HTTP headers (`X-Correlation-ID`)
- Logs all API calls in the workflow:
  - Health check API
  - Grouping API (auto-continue, manual, refresh)
  - Save groups API
  - Save demographics API
  - Save analysis config API
  - Execute analysis API

### ✅ Requirement 9.3: Log step durations
- Automatically calculates and logs duration for each step
- Tracks API call durations from start to completion
- Includes duration in all log outputs
- Calculates average API call duration in summary

### ✅ Requirement 9.4: Log errors with full details and stack traces
- Implemented `logError()` and `logAPICallError()` methods
- Captures full error messages and stack traces
- Includes context and correlation IDs
- Logs errors for all failure scenarios:
  - API call failures
  - Network errors
  - Validation errors
  - Analysis execution errors

### ✅ Requirement 9.5: Log workflow completion summary
- Implemented `endSession()` method with comprehensive summary
- Generates detailed summary including:
  - Total workflow duration
  - All step transitions with durations
  - All API calls with success/failure status
  - Average API call duration
  - All errors encountered
  - Success/failure counts

## Implementation Details

### Files Created

1. **`frontend/src/services/workflow-logger.service.ts`**
   - Core logging service with singleton pattern
   - Session management
   - Step transition tracking
   - API call tracking
   - Error logging
   - Summary generation

2. **`frontend/src/services/workflow-logger.README.md`**
   - Comprehensive documentation
   - Usage examples
   - Integration guide
   - Best practices

3. **`frontend/src/services/__tests__/workflow-logger.service.test.ts`**
   - Unit tests for all logging functionality
   - Tests for session management
   - Tests for step transitions
   - Tests for API call logging
   - Tests for error logging
   - Tests for summary generation

4. **`frontend/src/services/LOGGING_IMPLEMENTATION_SUMMARY.md`**
   - This file - implementation summary

### Files Modified

1. **`frontend/src/app/(dashboard)/analysis/new/page.tsx`**
   - Imported WorkflowLoggerService
   - Initialized session on component mount
   - Added logging to all step transitions
   - Added logging to all API calls with correlation IDs
   - Added error logging for all error scenarios
   - Added session end on workflow completion

## Key Features

### Session Management
```typescript
// Start session
const sessionId = workflowLogger.startSession('upload');

// End session with summary
workflowLogger.endSession(true, { reason: 'Workflow completed' });
```

### Step Transition Logging
```typescript
workflowLogger.logStepTransition('upload', 'health', {
  projectId: 'project-123',
  variableCount: 25,
});
```

### API Call Logging
```typescript
// Generate correlation ID
const correlationId = workflowLogger.generateCorrelationId('health-check');

// Log start
workflowLogger.logAPICallStart('api/analysis/health', 'POST', correlationId, {
  projectId: 'project-123',
});

// Log completion
workflowLogger.logAPICallComplete('api/analysis/health', 'POST', correlationId, 200, true, {
  variableCount: 25,
});

// Log error
workflowLogger.logAPICallError('api/analysis/health', 'POST', correlationId, error, {
  status: 500,
});
```

### Error Logging
```typescript
workflowLogger.logError(error, 'Context description', correlationId, {
  additionalMetadata: 'value',
});
```

## Log Output Examples

### Step Transition
```
[Workflow Step] Transition {
  sessionId: 'session-1699876543210-abc123',
  fromStep: 'upload',
  toStep: 'health',
  timestamp: '2024-11-10T10:30:45.123Z',
  duration: '2345ms',
  metadata: { projectId: 'project-123', variableCount: 25 }
}
```

### API Call
```
[API Call] Started {
  sessionId: 'session-1699876543210-abc123',
  endpoint: 'api/analysis/health',
  method: 'POST',
  correlationId: 'health-check-1699876543210-xyz789',
  timestamp: '2024-11-10T10:30:45.123Z',
  metadata: { projectId: 'project-123' }
}

[API Call] Completed {
  sessionId: 'session-1699876543210-abc123',
  endpoint: 'api/analysis/health',
  method: 'POST',
  correlationId: 'health-check-1699876543210-xyz789',
  timestamp: '2024-11-10T10:30:47.456Z',
  status: 200,
  success: true,
  duration: '2333ms',
  metadata: { variableCount: 25, hasHealthReport: true }
}
```

### Error
```
[Workflow Error] {
  sessionId: 'session-1699876543210-abc123',
  context: 'API Call: POST api/analysis/health',
  correlationId: 'health-check-1699876543210-xyz789',
  timestamp: '2024-11-10T10:30:47.456Z',
  message: 'Network request failed',
  stack: 'Error: Network request failed\n    at fetch...',
  metadata: { status: 500, errorData: { error: 'Internal server error' } }
}
```

### Workflow Summary
```
[Workflow Summary] {
  sessionId: 'session-1699876543210-abc123',
  duration: '45678ms',
  steps: {
    total: 5,
    list: [
      { transition: 'START → upload', duration: 'N/A', timestamp: '...' },
      { transition: 'upload → health', duration: '2345ms', timestamp: '...' },
      { transition: 'health → group', duration: '3456ms', timestamp: '...' },
      { transition: 'group → demographic', duration: '4567ms', timestamp: '...' },
      { transition: 'demographic → analyze', duration: '5678ms', timestamp: '...' }
    ]
  },
  apiCalls: {
    total: 8,
    successful: 7,
    failed: 1,
    averageDuration: '1234ms',
    list: [...]
  },
  errors: {
    total: 1,
    list: [...]
  }
}
```

## Integration Points

### NewAnalysisPage Component
- Session initialization on mount
- Step transition logging on all step changes
- API call logging for:
  - Health check (auto and manual)
  - Grouping (auto-continue, manual, refresh)
  - Save groups
  - Save demographics
  - Save analysis config
  - Execute analysis
- Error logging for all error scenarios
- Session end on workflow completion or unmount

### Correlation ID Headers
All API calls now include the `X-Correlation-ID` header for request tracing:
```typescript
fetch(url, {
  headers: {
    'Content-Type': 'application/json',
    'X-Correlation-ID': correlationId,
  },
});
```

## Testing

### Unit Tests
- ✅ Session management tests
- ✅ Step transition logging tests
- ✅ API call logging tests
- ✅ Error logging tests
- ✅ Summary generation tests
- ✅ Enable/disable logging tests

### Test Coverage
- All core functionality covered
- Edge cases tested
- Duration calculation verified
- Correlation ID uniqueness verified

## Benefits

1. **Debugging**: Detailed logs make it easy to trace issues through the workflow
2. **Performance Monitoring**: Duration tracking helps identify bottlenecks
3. **Request Tracing**: Correlation IDs enable end-to-end request tracking
4. **Error Analysis**: Full stack traces and context help diagnose problems
5. **Workflow Analytics**: Summary provides insights into workflow completion

## Future Enhancements

1. Send logs to remote logging service (e.g., Sentry, LogRocket)
2. Add log levels (DEBUG, INFO, WARN, ERROR)
3. Implement log filtering and search
4. Add performance metrics and analytics
5. Export logs to file for offline analysis
6. Add user action tracking
7. Implement log aggregation and visualization

## Verification

To verify the implementation:

1. Open browser console
2. Navigate to New Analysis page
3. Upload a CSV file
4. Observe detailed logs for each step
5. Check for correlation IDs in API call logs
6. Verify error logs include stack traces
7. Complete workflow and check summary log

## Conclusion

The logging and debugging implementation provides comprehensive visibility into the CSV analysis workflow. All requirements have been fulfilled with detailed logging of step transitions, API calls, errors, and workflow summaries. The implementation is production-ready and provides a solid foundation for debugging and monitoring.
