# useVariableGroupingAutoSave Hook

## Overview

A custom React hook that provides auto-save functionality for variable grouping in the CSV analysis workflow. It automatically saves groups to localStorage at regular intervals and tracks unsaved changes.

## Features

- ✅ Auto-save to localStorage every 30 seconds (configurable)
- ✅ Track unsaved changes by comparing current vs initial state
- ✅ Show save indicator with last saved timestamp
- ✅ Restore from localStorage after browser crash
- ✅ Manual save trigger
- ✅ Clear backup after successful database save
- ✅ Enable/disable auto-save functionality

## Usage

```typescript
import { useVariableGroupingAutoSave } from '@/hooks/useVariableGroupingAutoSave';

function VariableGroupingPanel() {
  const [groups, setGroups] = useState<VariableGroup[]>([]);
  const initialGroups = []; // From props or initial load

  const {
    hasUnsavedChanges,
    lastSaved,
    isSaving,
    saveNow,
    clearBackup,
    restoreFromLocalStorage,
    markAsSaved,
  } = useVariableGroupingAutoSave({
    groups,
    initialGroups,
    interval: 30000, // 30 seconds
    enabled: true,
  });

  // Restore from localStorage on mount
  useEffect(() => {
    const restored = restoreFromLocalStorage();
    if (restored && restored.length > 0) {
      if (confirm('Restore previous session?')) {
        setGroups(restored);
      }
    }
  }, []);

  // Handle manual save
  const handleSave = async () => {
    await saveToDatabase(groups);
    clearBackup();
    markAsSaved();
  };

  return (
    <div>
      {/* Your UI */}
      {hasUnsavedChanges && (
        <button onClick={handleSave}>
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      )}
      {lastSaved && <p>Last saved: {lastSaved.toLocaleTimeString()}</p>}
    </div>
  );
}
```

## API

### Parameters

```typescript
interface UseVariableGroupingAutoSaveOptions {
  groups: VariableGroup[];           // Current groups state
  initialGroups: VariableGroup[];    // Initial groups for comparison
  interval?: number;                 // Auto-save interval in ms (default: 30000)
  storageKey?: string;               // localStorage key (default: 'variable-grouping-backup')
  enabled?: boolean;                 // Enable/disable auto-save (default: true)
}
```

### Return Value

```typescript
{
  // State
  hasUnsavedChanges: boolean;        // True if groups differ from initial
  lastSaved: Date | null;            // Timestamp of last save
  isSaving: boolean;                 // True during save operation
  
  // Actions
  saveNow: () => void;               // Trigger immediate save
  clearBackup: () => void;           // Remove localStorage backup
  restoreFromLocalStorage: () => VariableGroup[] | null;  // Restore saved groups
  markAsSaved: () => void;           // Mark current state as saved
}
```

## How It Works

### 1. Change Detection

The hook compares the current `groups` with `initialGroups` using JSON serialization:

```typescript
const hasChanges = JSON.stringify(groups) !== JSON.stringify(initialGroups);
```

### 2. Auto-Save Interval

When changes are detected and auto-save is enabled, the hook sets up an interval:

```typescript
setInterval(() => {
  saveToLocalStorage();
}, interval);
```

### 3. localStorage Format

Data is saved in the following format:

```json
{
  "groups": [...],
  "timestamp": "2025-11-09T19:30:00.000Z",
  "version": "1.0"
}
```

### 4. Save Prevention

The hook prevents saving when:
- Auto-save is disabled (`enabled: false`)
- No unsaved changes exist
- A save operation is already in progress

## Examples

### Basic Usage

```typescript
const { hasUnsavedChanges, lastSaved } = useVariableGroupingAutoSave({
  groups,
  initialGroups,
});
```

### Custom Interval

```typescript
const { saveNow } = useVariableGroupingAutoSave({
  groups,
  initialGroups,
  interval: 60000, // Save every 60 seconds
});
```

### Disabled Auto-Save

```typescript
const { saveNow } = useVariableGroupingAutoSave({
  groups,
  initialGroups,
  enabled: false, // Only manual saves
});
```

### Custom Storage Key

```typescript
const { clearBackup } = useVariableGroupingAutoSave({
  groups,
  initialGroups,
  storageKey: 'my-custom-backup-key',
});
```

## Integration with Database Save

```typescript
const handleSave = async () => {
  try {
    // Save to database
    await fetch('/api/groups/save', {
      method: 'POST',
      body: JSON.stringify({ groups }),
    });

    // Clear localStorage backup on success
    clearBackup();
    markAsSaved();
    
    toast.success('Saved successfully');
  } catch (error) {
    toast.error('Save failed. Changes kept in localStorage.');
  }
};
```

## Best Practices

1. **Always restore on mount**: Check for localStorage backup when component mounts
2. **Clear backup after DB save**: Call `clearBackup()` after successful database save
3. **Mark as saved**: Call `markAsSaved()` to update the last saved timestamp
4. **Handle errors**: Keep localStorage backup if database save fails
5. **User confirmation**: Ask user before restoring from localStorage

## Requirements Met

- ✅ **Requirement 7.1**: Auto-save to localStorage every 30 seconds
- ✅ **Requirement 7.2**: Track unsaved changes and show save indicator
- ✅ **Requirement 7.3**: Restore from localStorage after browser crash
- ✅ **Requirement 7.4**: Clear localStorage backup after successful save

## Performance Considerations

- Uses `useRef` to prevent unnecessary re-renders
- Uses `useCallback` for stable function references
- Only saves when changes are detected
- Clears interval when no changes exist
- Prevents concurrent save operations

## Browser Compatibility

Works in all modern browsers that support:
- localStorage API
- JSON.stringify/parse
- setInterval/clearInterval

## Troubleshooting

### Auto-save not working

1. Check if `enabled` is set to `true`
2. Verify `hasUnsavedChanges` is `true`
3. Check browser console for errors
4. Ensure localStorage is not full

### Changes not detected

1. Verify `groups` and `initialGroups` are different
2. Check if objects are properly serializable
3. Ensure state updates are triggering re-renders

### localStorage quota exceeded

1. Clear old backups: `clearBackup()`
2. Reduce save frequency: increase `interval`
3. Check browser localStorage limits

## Related

- `VariableGroupingPanel` component
- `VariableGroupingService` service
- `VariableGroup` type definition

---

**Version**: 1.0.0  
**Last Updated**: November 9, 2025  
**Requirements**: React 18+, TypeScript 5+
