# Logging Implementation Verification Guide

## How to Verify the Logging Implementation

Follow these steps to verify that all logging requirements have been properly implemented.

## Prerequisites

1. Start the development server
2. Open browser developer console (F12)
3. Navigate to the New Analysis page

## Verification Steps

### 1. Verify Session Initialization (Requirement 9.1)

**Action**: Load the New Analysis page

**Expected Console Output**:
```
[Workflow Session] Started {
  sessionId: 'session-...',
  timestamp: '2024-11-10T...',
  initialStep: 'upload'
}
```

**✓ Pass Criteria**: Session ID is generated and logged with timestamp

---

### 2. Verify Step Transition Logging (Requirement 9.1)

**Action**: Upload a CSV file

**Expected Console Output**:
```
[Workflow Step] Transition {
  sessionId: 'session-...',
  fromStep: 'upload',
  toStep: 'health',
  timestamp: '2024-11-10T...',
  duration: 'N/A',
  metadata: {
    projectId: '...',
    hasHealthReport: true,
    variableCount: 25
  }
}
```

**✓ Pass Criteria**: 
- Step transition is logged
- Timestamp is present
- Metadata includes relevant information

---

### 3. Verify API Call Logging with Correlation IDs (Requirement 9.2)

**Action**: Wait for auto-continue to grouping step

**Expected Console Output**:
```
[API Call] Started {
  sessionId: 'session-...',
  endpoint: 'api/analysis/group',
  method: 'POST',
  correlationId: 'auto-continue-...',
  timestamp: '2024-11-10T...',
  metadata: {
    projectId: '...',
    headerCount: 25,
    previewRowCount: 10,
    trigger: 'auto-continue'
  }
}

[API Call] Completed {
  sessionId: 'session-...',
  endpoint: 'api/analysis/group',
  method: 'POST',
  correlationId: 'auto-continue-...',
  timestamp: '2024-11-10T...',
  status: 200,
  success: true,
  duration: '1234ms',
  metadata: {
    suggestionsCount: 5,
    totalVariables: 25,
    suggestedGroups: 5,
    trigger: 'auto-continue'
  }
}
```

**✓ Pass Criteria**:
- API call start is logged
- API call completion is logged
- Correlation ID is present and matches
- Duration is calculated and logged

---

### 4. Verify Step Duration Tracking (Requirement 9.3)

**Action**: Progress through multiple steps

**Expected Console Output**:
```
[Workflow Step] Transition {
  sessionId: 'session-...',
  fromStep: 'health',
  toStep: 'group',
  timestamp: '2024-11-10T...',
  duration: '2345ms',  ← Duration calculated
  metadata: { ... }
}
```

**✓ Pass Criteria**:
- Duration is present (not 'N/A')
- Duration is in milliseconds
- Duration is reasonable (> 0)

---

### 5. Verify Error Logging with Stack Traces (Requirement 9.4)

**Action**: Simulate an error (e.g., disconnect network and try to continue)

**Expected Console Output**:
```
[API Call] Error {
  sessionId: 'session-...',
  endpoint: 'api/analysis/group',
  method: 'POST',
  correlationId: 'auto-continue-...',
  timestamp: '2024-11-10T...',
  duration: '5000ms',
  error: 'Failed to fetch',
  stack: 'Error: Failed to fetch\n    at fetch...',
  metadata: { ... }
}

[Workflow Error] {
  sessionId: 'session-...',
  context: 'API Call: POST api/analysis/group',
  correlationId: 'auto-continue-...',
  timestamp: '2024-11-10T...',
  message: 'Failed to fetch',
  stack: 'Error: Failed to fetch\n    at fetch...',
  metadata: { ... }
}
```

**✓ Pass Criteria**:
- Error is logged
- Stack trace is present
- Context is provided
- Correlation ID is included

---

### 6. Verify Workflow Completion Summary (Requirement 9.5)

**Action**: Complete the entire workflow or close the page

**Expected Console Output**:
```
[Workflow Session] Ended {
  sessionId: 'session-...',
  startTime: '2024-11-10T10:30:00.000Z',
  endTime: '2024-11-10T10:35:00.000Z',
  totalDuration: '300000ms',
  success: true,
  metadata: {
    projectId: '...',
    finalStep: 'results',
    completedSuccessfully: true
  }
}

[Workflow Summary] {
  sessionId: 'session-...',
  duration: '300000ms',
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
      {
        transition: 'health → group',
        duration: '3456ms',
        timestamp: '2024-11-10T10:30:05.801Z'
      },
      {
        transition: 'group → demographic',
        duration: '45678ms',
        timestamp: '2024-11-10T10:30:51.479Z'
      },
      {
        transition: 'demographic → analyze',
        duration: '23456ms',
        timestamp: '2024-11-10T10:31:14.935Z'
      }
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
        correlationId: 'health-check-...',
        status: 200,
        success: true,
        duration: '2333ms'
      },
      {
        endpoint: 'api/analysis/group',
        method: 'POST',
        correlationId: 'auto-continue-...',
        status: 200,
        success: true,
        duration: '1234ms'
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
        correlationId: 'grouping-...',
        timestamp: '2024-11-10T10:30:15.123Z'
      }
    ]
  }
}
```

**✓ Pass Criteria**:
- Summary is generated
- Total duration is calculated
- All steps are listed with durations
- All API calls are listed with success/failure status
- Average API call duration is calculated
- All errors are listed

---

## Additional Verification

### Verify Correlation ID in Network Tab

1. Open Network tab in browser DevTools
2. Trigger an API call (e.g., upload CSV)
3. Click on the request
4. Check Request Headers
5. Verify `X-Correlation-ID` header is present

**Expected**:
```
X-Correlation-ID: health-check-1699876543210-xyz789
```

---

### Verify Manual Override Logging

**Action**: Click "Refresh Suggestions" button

**Expected Console Output**:
```
[Manual Override] User requested refresh suggestions {
  timestamp: '2024-11-10T...',
  projectId: '...'
}

[API Call] Started {
  ...
  correlationId: 'refresh-suggestions-...',
  metadata: {
    trigger: 'refresh'
  }
}

[API Call] Completed {
  ...
  correlationId: 'refresh-suggestions-...',
  metadata: {
    trigger: 'refresh'
  }
}
```

**✓ Pass Criteria**:
- Manual override is logged
- Correlation ID includes 'refresh-suggestions' prefix
- Trigger metadata is 'refresh'

---

## Checklist

Use this checklist to verify all requirements:

- [ ] Session initialization logged on page load
- [ ] Step transitions logged with timestamps
- [ ] Step durations calculated and logged
- [ ] API calls logged with correlation IDs
- [ ] Correlation IDs present in HTTP headers
- [ ] API call durations calculated and logged
- [ ] Errors logged with full stack traces
- [ ] Error context and correlation IDs included
- [ ] Workflow summary generated on completion
- [ ] Summary includes all steps, API calls, and errors
- [ ] Average API call duration calculated
- [ ] Manual override actions logged
- [ ] All metadata included in logs

---

## Troubleshooting

### No Logs Appearing

**Problem**: Console is empty, no logs appearing

**Solution**:
1. Check if logging is enabled: `workflowLogger.isLoggingEnabled()`
2. Enable logging: `workflowLogger.setEnabled(true)`
3. Refresh the page

### Missing Correlation IDs

**Problem**: Correlation IDs not appearing in logs

**Solution**:
1. Check that `generateCorrelationId()` is called before API calls
2. Verify correlation ID is passed to `logAPICallStart()`
3. Check that correlation ID is included in fetch headers

### Duration Shows 'N/A'

**Problem**: Step or API call duration shows 'N/A'

**Solution**:
1. This is expected for the first step (no previous step to measure from)
2. For API calls, ensure `logAPICallStart()` is called before the fetch
3. Ensure `logAPICallComplete()` is called after the fetch

### Summary Not Generated

**Problem**: Workflow summary not appearing

**Solution**:
1. Ensure `endSession()` is called
2. Check that session was started with `startSession()`
3. Verify logging is enabled

---

## Success Criteria

All requirements are met when:

1. ✅ All step transitions are logged with timestamps
2. ✅ All API calls are logged with unique correlation IDs
3. ✅ All durations are calculated and logged
4. ✅ All errors include full stack traces and context
5. ✅ Workflow summary is comprehensive and accurate

---

## Next Steps

After verification:

1. Test in different scenarios (success, error, manual override)
2. Verify logs are helpful for debugging
3. Consider adding remote logging integration
4. Monitor performance impact (should be minimal)
5. Document any issues or improvements needed
