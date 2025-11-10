# Workflow Logging Flow Diagram

## Overview

This diagram shows how logging is integrated throughout the CSV analysis workflow.

## Workflow Logging Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     Component Mount                              │
│                                                                   │
│  useEffect(() => {                                               │
│    workflowLogger.startSession('upload')  ← Initialize Session   │
│  }, [])                                                          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                     Step 1: Upload CSV                           │
│                                                                   │
│  handleUploadComplete()                                          │
│    ├─ logStepTransition('upload', 'health')                     │
│    ├─ generateCorrelationId('health-check')                     │
│    ├─ logAPICallStart('api/analysis/health', ...)               │
│    ├─ fetch(api/analysis/health) with X-Correlation-ID          │
│    └─ logAPICallComplete(...) or logAPICallError(...)           │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                  Step 2: Health Check (Auto)                     │
│                                                                   │
│  Auto-continue after 2 seconds                                   │
│    ├─ logStepTransition('health', 'group')                      │
│    ├─ generateCorrelationId('auto-continue')                    │
│    ├─ logAPICallStart('api/analysis/group', ...)                │
│    ├─ fetch(api/analysis/group) with X-Correlation-ID           │
│    └─ logAPICallComplete(...) or logAPICallError(...)           │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                  Step 3: Variable Grouping                       │
│                                                                   │
│  handleGroupsSave()                                              │
│    ├─ generateCorrelationId('save-groups')                      │
│    ├─ logAPICallStart('api/analysis/groups/save', ...)          │
│    ├─ fetch(api/analysis/groups/save) with X-Correlation-ID     │
│    ├─ logAPICallComplete(...) or logAPICallError(...)           │
│    └─ logStepTransition('group', 'demographic')                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                  Step 4: Demographics                            │
│                                                                   │
│  handleDemographicSave()                                         │
│    ├─ generateCorrelationId('save-demographics')                │
│    ├─ logAPICallStart('api/analysis/demographic/save', ...)     │
│    ├─ fetch(api/analysis/demographic/save) with X-Correlation-ID│
│    ├─ logAPICallComplete(...) or logAPICallError(...)           │
│    └─ logStepTransition('demographic', 'analyze')               │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                  Step 5: Analysis Selection                      │
│                                                                   │
│  handleAnalysisSelection()                                       │
│    ├─ generateCorrelationId('save-analysis-config')             │
│    ├─ logAPICallStart('api/analysis/config/save', ...)          │
│    ├─ fetch(api/analysis/config/save) with X-Correlation-ID     │
│    ├─ logAPICallComplete(...) or logAPICallError(...)           │
│    ├─ generateCorrelationId('execute-analysis')                 │
│    ├─ logAPICallStart('api/analysis/execute', ...)              │
│    └─ fetch(api/analysis/execute) with X-Correlation-ID         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                  Step 6: Results                                 │
│                                                                   │
│  handleAnalysisComplete()                                        │
│    ├─ logStepTransition('analyze', 'results')                   │
│    └─ endSession(true, { completedSuccessfully: true })         │
│         └─ Generates comprehensive summary                       │
└─────────────────────────────────────────────────────────────────┘
```

## Error Handling Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     Any Error Occurs                             │
│                                                                   │
│  catch (error) {                                                 │
│    ├─ logAPICallError(...) if API call                          │
│    ├─ logError(error, context, correlationId, metadata)         │
│    └─ Display error to user                                      │
│  }                                                               │
└─────────────────────────────────────────────────────────────────┘
```

## Manual Override Flow

```
┌─────────────────────────────────────────────────────────────────┐
│              User Clicks "Refresh Suggestions"                   │
│                                                                   │
│  handleRefreshSuggestions()                                      │
│    ├─ generateCorrelationId('refresh-suggestions')              │
│    ├─ logAPICallStart('api/analysis/group', ...)                │
│    ├─ fetch(api/analysis/group) with X-Correlation-ID           │
│    └─ logAPICallComplete(...) or logAPICallError(...)           │
└─────────────────────────────────────────────────────────────────┘
```

## Session Lifecycle

```
Component Mount
    ↓
startSession('upload')
    ↓
[Multiple step transitions and API calls]
    ↓
endSession(success, metadata)
    ↓
Generate Summary
    ↓
Clear Session Data
```

## Log Data Structure

```
WorkflowSession {
  sessionId: string
  startTime: string
  endTime?: string
  totalDuration?: number
  currentStep: WorkflowStep
  
  steps: [
    {
      fromStep: WorkflowStep | null
      toStep: WorkflowStep
      timestamp: string
      duration?: number
      metadata?: Record<string, any>
    }
  ]
  
  apiCalls: [
    {
      endpoint: string
      method: string
      correlationId: string
      timestamp: string
      duration?: number
      status?: number
      success?: boolean
      error?: string
      metadata?: Record<string, any>
    }
  ]
  
  errors: [
    {
      message: string
      stack?: string
      timestamp: string
      context: string
      correlationId?: string
      metadata?: Record<string, any>
    }
  ]
}
```

## Correlation ID Flow

```
Frontend                          Backend
   │                                 │
   ├─ Generate Correlation ID        │
   │  (e.g., 'health-check-123')     │
   │                                 │
   ├─ Add to Request Header          │
   │  X-Correlation-ID: health-check-123
   │                                 │
   ├─────── HTTP Request ──────────→ │
   │                                 │
   │                                 ├─ Receive Request
   │                                 ├─ Extract Correlation ID
   │                                 ├─ Process Request
   │                                 ├─ Log with Correlation ID
   │                                 │
   │ ←────── HTTP Response ────────── │
   │                                 │
   ├─ Log Response with              │
   │  Same Correlation ID            │
   │                                 │
```

## Benefits of This Flow

1. **End-to-End Tracing**: Correlation IDs link frontend and backend logs
2. **Performance Monitoring**: Duration tracking at every step
3. **Error Context**: Full stack traces with workflow context
4. **Workflow Analytics**: Complete picture of user journey
5. **Debugging**: Easy to trace issues through the entire flow
