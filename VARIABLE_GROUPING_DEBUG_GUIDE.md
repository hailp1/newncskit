# Variable Grouping Debug Guide

## Issue Report

**Problem:** Variable Grouping step không chạy được  
**Status:** Components và services đã được implement nhưng có thể có issues với integration  
**Date:** November 8, 2025

---

## Components Status

### ✅ Implemented Components

1. **VariableGroupEditor** (`frontend/src/components/analysis/VariableGroupEditor.tsx`)
   - ✅ Drag & drop interface
   - ✅ Create/edit/delete groups
   - ✅ Accept/reject AI suggestions
   - ✅ Search functionality
   - ✅ Group naming and description

2. **Page Integration** (`frontend/src/app/(dashboard)/analysis/new/page.tsx`)
   - ✅ Component is imported and used
   - ✅ Workflow step 'group' exists
   - ✅ Props are passed correctly

3. **API Endpoint** (`frontend/src/app/api/analysis/group/route.ts`)
   - ✅ POST endpoint exists
   - ✅ Authentication check
   - ✅ Database queries
   - ✅ Service integration

4. **Service** (`frontend/src/services/variable-group.service.ts`)
   - ✅ Prefix-based grouping
   - ✅ Number pattern grouping
   - ✅ Semantic grouping
   - ✅ Confidence scoring

---

## Potential Issues

### Issue 1: Database Schema Mismatch ⚠️

**Problem:** API endpoint queries `analysis_variables` table with column `analysis_project_id`, but schema might use `project_id`

**Location:** `frontend/src/app/api/analysis/group/route.ts:50`

```typescript
// Current code:
const { data: variables, error: variablesError } = await supabase
  .from('analysis_variables')
  .select('*')
  .eq('analysis_project_id', projectId)  // ⚠️ Column name might be wrong
  .order('column_name');
```

**Fix:**
```typescript
// Should be:
const { data: variables, error: variablesError } = await supabase
  .from('analysis_variables')
  .select('*')
  .eq('project_id', projectId)  // ✅ Correct column name
  .order('column_name');
```

**Verification:**
```sql
-- Check actual column name in database
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'analysis_variables' 
  AND column_name LIKE '%project%';
```

### Issue 2: No Variables in Database ⚠️

**Problem:** Health check might not be saving variables to database

**Check:**
1. Does health check API save variables?
2. Are variables being created with correct project_id?
3. Is the foreign key relationship correct?

**Verification:**
```sql
-- Check if variables exist for a project
SELECT COUNT(*) 
FROM analysis_variables 
WHERE project_id = 'your-project-id';

-- Check variable data
SELECT id, column_name, data_type, project_id 
FROM analysis_variables 
WHERE project_id = 'your-project-id'
LIMIT 10;
```

### Issue 3: Workflow Navigation Issue ⚠️

**Problem:** User might not be able to reach the grouping step

**Possible Causes:**
1. Health check doesn't complete successfully
2. "Continue" button doesn't trigger navigation
3. State not being set correctly

**Debug Steps:**
```typescript
// Add console logs in page.tsx:

const handleHealthContinue = async () => {
  console.log('Health continue clicked', { projectId });
  
  if (!projectId) {
    console.error('No project ID!');
    return;
  }

  setLoading(true);
  setError(null);

  try {
    console.log('Fetching grouping suggestions...');
    const response = await fetch('/api/analysis/group', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId }),
    });

    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('API error:', errorData);
      throw new Error(errorData.error || 'Failed to get grouping suggestions');
    }

    const data = await response.json();
    console.log('Grouping data received:', data);
    
    setGroupSuggestions(data.suggestions || []);
    setCurrentStep('group');
    console.log('Moved to group step');
  } catch (err) {
    console.error('Error in handleHealthContinue:', err);
    setError((err as Error).message);
  } finally {
    setLoading(false);
  }
};
```

### Issue 4: Empty Suggestions Array ⚠️

**Problem:** VariableGroupService might return empty array if variable names don't match patterns

**Test Cases:**

```typescript
// Test with different variable naming patterns:

// Case 1: Prefix pattern (should work)
const vars1 = [
  { columnName: 'Q1_trust', dataType: 'numeric' },
  { columnName: 'Q1_quality', dataType: 'numeric' },
  { columnName: 'Q1_satisfaction', dataType: 'numeric' },
];

// Case 2: Number pattern (should work)
const vars2 = [
  { columnName: 'Item1', dataType: 'numeric' },
  { columnName: 'Item2', dataType: 'numeric' },
  { columnName: 'Item3', dataType: 'numeric' },
];

// Case 3: No pattern (won't work)
const vars3 = [
  { columnName: 'age', dataType: 'numeric' },
  { columnName: 'gender', dataType: 'categorical' },
  { columnName: 'income', dataType: 'numeric' },
];

// Test:
const suggestions1 = VariableGroupService.suggestGroups(vars1);
console.log('Suggestions for prefix pattern:', suggestions1);

const suggestions2 = VariableGroupService.suggestGroups(vars2);
console.log('Suggestions for number pattern:', suggestions2);

const suggestions3 = VariableGroupService.suggestGroups(vars3);
console.log('Suggestions for no pattern:', suggestions3); // Should be empty
```

### Issue 5: Component Not Rendering ⚠️

**Problem:** Component might not render if props are invalid

**Check:**
```typescript
// In VariableGroupEditor.tsx, add validation:

export default function VariableGroupEditor({
  projectId,
  variables,
  existingGroups = [],
  suggestions = [],
  onSave,
  onCancel,
}: VariableGroupEditorProps) {
  
  // Add debug logs
  console.log('VariableGroupEditor props:', {
    projectId,
    variablesCount: variables.length,
    existingGroupsCount: existingGroups.length,
    suggestionsCount: suggestions.length,
  });

  // Validate props
  if (!projectId) {
    return <div className="text-red-600">Error: No project ID provided</div>;
  }

  if (!variables || variables.length === 0) {
    return <div className="text-yellow-600">Warning: No variables to group</div>;
  }

  // ... rest of component
}
```

---

## Testing Checklist

### Step 1: Database Verification

- [ ] Check if `analysis_variables` table exists
- [ ] Verify column names (project_id vs analysis_project_id)
- [ ] Check if variables are being saved during health check
- [ ] Verify foreign key relationships

### Step 2: API Testing

- [ ] Test health check API saves variables
- [ ] Test grouping API with valid project ID
- [ ] Check API response format
- [ ] Verify authentication works

### Step 3: Component Testing

- [ ] Add console logs to track workflow
- [ ] Verify component receives correct props
- [ ] Test with different variable naming patterns
- [ ] Check if suggestions are generated

### Step 4: Integration Testing

- [ ] Upload a CSV file
- [ ] Complete health check
- [ ] Click "Continue" button
- [ ] Verify navigation to grouping step
- [ ] Check if suggestions appear
- [ ] Test drag & drop functionality
- [ ] Test create/edit/delete groups
- [ ] Test save functionality

---

## Quick Fixes

### Fix 1: Update Column Name

```typescript
// In frontend/src/app/api/analysis/group/route.ts

// Change line 50 from:
.eq('analysis_project_id', projectId)

// To:
.eq('project_id', projectId)
```

### Fix 2: Add Error Handling

```typescript
// In frontend/src/app/(dashboard)/analysis/new/page.tsx

const handleHealthContinue = async () => {
  if (!projectId) {
    setError('No project ID available');
    return;
  }

  setLoading(true);
  setError(null);

  try {
    const response = await fetch('/api/analysis/group', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to get grouping suggestions');
    }

    console.log('Grouping suggestions:', data);
    
    setGroupSuggestions(data.suggestions || []);
    
    // Always move to next step even if no suggestions
    setCurrentStep('group');
    
  } catch (err) {
    console.error('Grouping error:', err);
    setError((err as Error).message);
  } finally {
    setLoading(false);
  }
};
```

### Fix 3: Handle Empty Suggestions

```typescript
// In VariableGroupEditor.tsx

// Add message when no suggestions:
{showSuggestions && suggestions.length === 0 && (
  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
    <p className="text-sm text-blue-800">
      No automatic grouping suggestions found. You can create groups manually below.
    </p>
  </div>
)}
```

---

## Manual Testing Steps

### Test 1: Basic Flow

1. Go to `/analysis/new`
2. Upload a CSV file with variables like: Q1_trust, Q1_quality, Q2_service, Q2_price
3. Wait for health check to complete
4. Click "Continue" button
5. **Expected:** Should see grouping interface with suggestions
6. **Actual:** [Document what happens]

### Test 2: API Direct Test

```bash
# Test the API directly with curl:

# 1. Get auth token from browser DevTools
# 2. Replace PROJECT_ID and TOKEN

curl -X POST http://localhost:3000/api/analysis/group \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"projectId": "YOUR_PROJECT_ID"}'
```

### Test 3: Database Query

```sql
-- Check if variables exist
SELECT 
  ap.id as project_id,
  ap.name as project_name,
  COUNT(av.id) as variable_count
FROM analysis_projects ap
LEFT JOIN analysis_variables av ON av.project_id = ap.id
GROUP BY ap.id, ap.name
ORDER BY ap.created_at DESC
LIMIT 10;

-- Check variable details
SELECT 
  column_name,
  data_type,
  is_demographic,
  variable_group_id
FROM analysis_variables
WHERE project_id = 'YOUR_PROJECT_ID';
```

---

## Expected Behavior

### When Working Correctly:

1. **Upload CSV** → Creates project, saves file
2. **Health Check** → Analyzes data, saves variables to database
3. **Click Continue** → Calls `/api/analysis/group`
4. **API Response** → Returns suggestions array
5. **Component Renders** → Shows suggestions and grouping interface
6. **User Interaction** → Can accept suggestions, create groups, drag variables
7. **Save** → Calls `/api/analysis/groups/save` and moves to next step

### Current Behavior:

[Document what actually happens when you test]

---

## Next Steps

1. **Verify database schema** - Check column names match
2. **Add debug logging** - Track data flow through system
3. **Test API directly** - Isolate API issues
4. **Check browser console** - Look for JavaScript errors
5. **Review network tab** - Check API calls and responses

---

## Contact Points

- **Component:** `frontend/src/components/analysis/VariableGroupEditor.tsx`
- **Page:** `frontend/src/app/(dashboard)/analysis/new/page.tsx`
- **API:** `frontend/src/app/api/analysis/group/route.ts`
- **Service:** `frontend/src/services/variable-group.service.ts`
- **Database:** `analysis_variables` table

---

**Status:** Awaiting testing and verification  
**Priority:** High - Blocks workflow progression  
**Estimated Fix Time:** 1-2 hours once issue is identified
