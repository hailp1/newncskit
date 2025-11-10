# Workflow Logger Service

## Overview

The Workflow Logger Service provides comprehensive logging for the CSV analysis workflow. It tracks step transitions, API calls, errors, and generates workflow completion summaries.

## Features

- **Step Transition Logging**: Tracks workflow step changes with timestamps and durations
- **API Call Logging**: Logs all API calls with correlation IDs for request tracing
- **Error Tracking**: Captures errors with full stack traces and context
- **Duration Tracking**: Measures time spent in each step and API call
- **Session Management**: Groups all logs into a workflow session
- **Completion Summary**: Generates comprehensive summary at workflow end

## Requirements Fulfilled

- **Requirement 9.1**: Log workflow step transitions with timestamps
- **Requirement 9.2**: Log API calls with correlation IDs
- **Requirement 9.3**: Log step durations
- **Requirement 9.4**: Log errors with full details and stack traces
- **Requirement 9.5**: Log workflow completion summary

## Usage

### Initialize Session

```typescript
import { workflowLogger } from '@/services/workflow-logger.service';

// Start a new workflow session
const sessionId = workflowLogger.startSession('upload');
```

### Log Step Transitions

```typescript
// Log transition from one step to another
workflowLogger.logStepTransition('upload', 'health', {
  projectId: 'project-123',
  variableCount: 25,
});
```

### Log API Calls

```typescript
// Generate correlation ID
const correlationId = workflowLogger.generateCorrelationId('health-check');

// Log API call start
workflowLogger.logAPICallStart('api/analysis/health', 'POST', correlationId, {
  projectId: 'project-123',
});

try {
  const response = await fetch(url, {
    headers: {
      'X-Correlation-ID': correlationId,
    },
  });

  // Log API call completion
  workflowLogger.logAPICallComplete(
    'api/analysis/health',
    'POST',
    correlationId,
    response.status,
    true,
    { variableCount: 25 }
  );
} catch (error) {
  // Log API call error
  workflowLogger.logAPICallError(
    'api/analysis/health',
    'POST',
    correlationId,
    error as Error,
    { projectId: 'project-123' }
  );
}
```

### Log Errors

```typescript
try {
  // Some operation
} catch (error) {
  workflowLogger.logError(
    error as Error,
    'Context description',
    correlationId,
    { additionalMetadata: 'value' }
  );
}
```

### End Session

```typescript
// End session with success
workflowLogger.endSession(true, {
  projectId: 'project-123',
  finalStep: 'results',
});
```

## Log Output Examples

### Step Transition Log

```
[Workflow Step] Transition {
  sessionId: 'session-1699876543210-abc123',
  fromStep: 'upload',
  toStep: 'health',
  timestamp: '2024-11-10T10:30:45.123Z',
  duration: '2345ms',
  metadata: {
    projectId: 'project-123',
    variableCount: 25
  }
}
```

### API Call Log

```
[API Call] Started {
  sessionId: 'session-1699876543210-abc123',
  endpoint: 'api/analysis/health',
  method: 'POST',
  correlationId: 'health-check-1699876543210-xyz789',
  timestamp: '2024-11-10T10:30:45.123Z',
  metadata: {
    projectId: 'project-123'
  }
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
  metadata: {
    variableCount: 25,
    hasHealthReport: true
  }
}
```

### Error Log

```
[Workflow Error] {
  sessionId: 'session-1699876543210-abc123',
  context: 'API Call: POST api/analysis/health',
  correlationId: 'health-check-1699876543210-xyz789',
  timestamp: '2024-11-10T10:30:47.456Z',
  message: 'Network request failed',
  stack: 'Error: Network request failed\n    at fetch...',
  metadata: {
    status: 500,
    errorData: { error: 'Internal server error' }
  }
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
      {
        transition: 'START → upload',
        duration: 'N/A',
        timestamp: '2024-11-10T10:30:00.000Z'
      },
      {
        transition: 'upload → health',
        duration: '2345ms',
        timestamp: '2024-11-10T10:30:02.345Z'
      },
      // ... more steps
    ]
  },
  apiCalls: {
    total: 8,
    successful: 7,
    failed: 1,
    averageDuration: '1234ms',
    list: [
      {
        endpoint: 'api/analysis/health',
        method: 'POST',
        correlationId: 'health-check-1699876543210-xyz789',
        status: 200,
        success: true,
        duration: '2333ms'
      },
      // ... more API calls
    ]
  },
  errors: {
    total: 1,
    list: [
      {
        context: 'API Call: POST api/analysis/group',
        message: 'Network request failed',
        correlationId: 'grouping-1699876543210-def456',
        timestamp: '2024-11-10T10:30:15.123Z'
      }
    ]
  }
}
```

## Integration Points

The workflow logger is integrated into the following components:

### NewAnalysisPage

- Session initialization on component mount
- Step transition logging on step changes
- API call logging for all workflow API calls
- Error logging for all caught errors
- Session end on workflow completion

### API Endpoints

All API calls include the `X-Correlation-ID` header for request tracing:

```typescript
fetch(url, {
  headers: {
    'Content-Type': 'application/json',
    'X-Correlation-ID': correlationId,
  },
});
```

## Debugging

### Enable/Disable Logging

```typescript
// Disable logging
workflowLogger.setEnabled(false);

// Enable logging
workflowLogger.setEnabled(true);

// Check if logging is enabled
const isEnabled = workflowLogger.isLoggingEnabled();
```

### Access Current Session

```typescript
const session = workflowLogger.getSession();
console.log('Current session:', session);
```

## Best Practices

1. **Always use correlation IDs**: Generate unique correlation IDs for each API call to enable request tracing
2. **Include metadata**: Add relevant metadata to logs for better debugging
3. **Log errors immediately**: Log errors as soon as they occur with full context
4. **End sessions properly**: Always call `endSession()` when workflow completes or component unmounts
5. **Use consistent naming**: Use descriptive names for correlation ID prefixes (e.g., 'health-check', 'grouping-manual')

## Performance Considerations

- Logging is synchronous but lightweight
- All logs are output to console (no network overhead)
- Session data is stored in memory (cleared on session end)
- Minimal impact on application performance

## Future Enhancements

- Send logs to remote logging service (e.g., Sentry, LogRocket)
- Add log levels (DEBUG, INFO, WARN, ERROR)
- Implement log filtering and search
- Add performance metrics and analytics
- Export logs to file for offline analysis
