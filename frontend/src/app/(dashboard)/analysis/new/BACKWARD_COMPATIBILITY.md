# Backward Compatibility Implementation

## Overview

This document describes the backward compatibility implementation for the CSV workflow automation feature. The system now intelligently detects whether a project is new or existing and adjusts the auto-continue behavior accordingly.

## Key Features

### 1. Project State Detection

The system checks if a project has saved groups or demographics to determine if it's an existing project:

```typescript
// API: GET /api/analysis/groups/load?projectId={projectId}
{
  "isExistingProject": true,
  "hasGroups": true,
  "hasDemographics": false,
  "groups": [...],
  "demographics": [...]
}
```

### 2. Auto-Continue Behavior

#### New Projects
- Auto-continue is **enabled** by default
- Workflow automatically progresses from Health Check → Grouping
- Grouping suggestions are fetched and displayed automatically

#### Existing Projects
- Auto-continue is **disabled** by default
- User must manually click "Continue" to proceed
- Saved groups are loaded and displayed
- New suggestions are **not** fetched to preserve existing configuration
- Visual indicator shows "Existing Project Detected"

### 3. Feature Flags

Feature flags allow fine-grained control over auto-continue behavior:

```typescript
// frontend/src/config/feature-flags.ts
export const featureFlags = {
  // Master switch for auto-continue
  enableAutoContinue: true,
  
  // Allow auto-continue for existing projects
  enableAutoContinueForExistingProjects: false,
  
  // Other feature flags...
};
```

#### Environment Variables

Feature flags can be controlled via environment variables:

```bash
# .env.local
NEXT_PUBLIC_ENABLE_AUTO_CONTINUE=true
NEXT_PUBLIC_ENABLE_AUTO_CONTINUE_EXISTING=false
```

## Implementation Details

### 1. Project State Check

When a CSV is uploaded, the system checks the project state:

```typescript
const checkProjectState = async (projectId: string) => {
  const response = await fetch(`/api/analysis/groups/load?projectId=${projectId}`);
  const data = await response.json();
  
  setIsExistingProject(data.isExistingProject);
  setHasSavedGroups(data.hasGroups);
  
  // Load saved groups if available
  if (data.hasGroups) {
    setGroups(data.groups);
  }
};
```

### 2. Auto-Continue Logic

The auto-continue logic respects project state and feature flags:

```typescript
useEffect(() => {
  const autoContinueEnabled = featureFlags.enableAutoContinue;
  const shouldSkipForExistingProject = 
    isExistingProject && !featureFlags.enableAutoContinueForExistingProjects;
  
  if (
    currentStep === 'health' && 
    healthReport && 
    !hasAutoFetchedRef.current &&
    !userInteracted &&
    !hasSkippedAutoGrouping &&
    projectId &&
    autoContinueEnabled &&
    !shouldSkipForExistingProject
  ) {
    // Trigger auto-continue
    handleHealthContinueAuto();
  }
}, [currentStep, healthReport, isExistingProject, ...]);
```

### 3. Saved Groups Protection

When auto-continue is triggered, the system checks if groups are already saved:

```typescript
// Don't override saved groups with new suggestions
if (!hasSavedGroups) {
  setGroupSuggestions(data.suggestions || []);
} else {
  console.log('Skipping suggestions - project has saved groups');
}
```

## User Experience

### New Project Flow

1. User uploads CSV
2. Health check runs automatically
3. **2-second delay** to review health results
4. Grouping suggestions fetched automatically
5. User sees grouping UI with suggestions pre-populated

### Existing Project Flow

1. User uploads CSV (or navigates to existing project)
2. Health check runs automatically
3. **Amber notice** appears: "Existing Project Detected"
4. User must click "Continue" to proceed
5. Saved groups are loaded and displayed
6. No new suggestions are fetched

## Testing

### Test Scenarios

1. **New Project**
   - Upload CSV
   - Verify auto-continue triggers
   - Verify suggestions appear

2. **Existing Project with Saved Groups**
   - Load project with saved groups
   - Verify auto-continue is disabled
   - Verify amber notice appears
   - Verify saved groups are loaded

3. **Feature Flag Disabled**
   - Set `enableAutoContinue = false`
   - Upload CSV
   - Verify auto-continue does not trigger

4. **Existing Project with Flag Enabled**
   - Set `enableAutoContinueForExistingProjects = true`
   - Load existing project
   - Verify auto-continue triggers
   - Verify saved groups are not overridden

### Manual Testing

```bash
# Test with auto-continue disabled
NEXT_PUBLIC_ENABLE_AUTO_CONTINUE=false npm run dev

# Test with existing projects allowed
NEXT_PUBLIC_ENABLE_AUTO_CONTINUE_EXISTING=true npm run dev
```

## API Endpoints

### GET /api/analysis/groups/load

Load saved groups and check project state.

**Query Parameters:**
- `projectId` (required): Project ID

**Response:**
```json
{
  "success": true,
  "project": {
    "id": "uuid",
    "name": "Project Name",
    "status": "draft",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-02T00:00:00Z"
  },
  "groups": [...],
  "demographics": [...],
  "isExistingProject": true,
  "hasGroups": true,
  "hasDemographics": false
}
```

## Logging

All backward compatibility checks are logged:

```typescript
console.log('[Backward Compatibility] Checking project state', {
  projectId,
  timestamp: new Date().toISOString()
});

console.log('[Backward Compatibility] Project state checked', {
  projectId,
  isExistingProject: true,
  hasGroups: true,
  groupCount: 5
});

console.log('[Auto-Continue] Skipping auto-continue for existing project', {
  projectId,
  isExistingProject: true,
  hasSavedGroups: true
});
```

## Configuration

### Default Configuration

```typescript
// Recommended for production
enableAutoContinue: true
enableAutoContinueForExistingProjects: false
```

### Development Configuration

```typescript
// For testing auto-continue with existing projects
enableAutoContinue: true
enableAutoContinueForExistingProjects: true
```

### Conservative Configuration

```typescript
// Disable all auto-continue
enableAutoContinue: false
enableAutoContinueForExistingProjects: false
```

## Migration Guide

### For Existing Users

No migration is required. Existing projects will automatically be detected and handled appropriately:

1. Saved groups are preserved
2. Auto-continue is disabled for existing projects
3. Manual workflow progression is available

### For New Users

New users will experience the full auto-continue workflow:

1. Seamless progression from upload to grouping
2. Intelligent suggestions pre-populated
3. Faster workflow completion

## Troubleshooting

### Auto-Continue Not Working

1. Check feature flag: `featureFlags.enableAutoContinue`
2. Check if project is existing: Look for amber notice
3. Check console logs for "[Auto-Continue]" messages
4. Verify project state API is responding

### Saved Groups Not Loading

1. Check API response: `/api/analysis/groups/load`
2. Verify project ID is correct
3. Check console logs for "[Backward Compatibility]" messages
4. Verify database has saved groups

### Auto-Continue Triggering for Existing Projects

1. Check feature flag: `featureFlags.enableAutoContinueForExistingProjects`
2. Verify project state detection is working
3. Check `isExistingProject` state value
4. Review console logs for project state checks

## Future Enhancements

1. **User Preference**: Allow users to enable/disable auto-continue per project
2. **Smart Detection**: Detect if saved groups are outdated and offer refresh
3. **Partial Auto-Continue**: Auto-continue to grouping but show saved groups first
4. **Analytics**: Track auto-continue usage and success rates
