# Design Document - Variable Grouping & Demographic Improvements

## Overview

Thiết kế cải tiến cho chức năng gom biến tự động và chỉ định biến demographic. Giải pháp bao gồm:
1. Case-insensitive pattern matching cho variable grouping
2. Editable group names với inline editing
3. Smart demographic detection với checkbox confirmation
4. Auto-save và state management

## Architecture

### High-Level Flow

```
CSV Upload
    ↓
Variable Extraction
    ↓
┌─────────────────────────────────────┐
│  Variable Grouping Service          │
│  - Case-insensitive matching        │
│  - Pattern detection (prefix, num)  │
│  - Generate group suggestions        │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│  Demographic Detection Service      │
│  - Keyword matching                 │
│  - Confidence scoring               │
│  - Auto-select suggestions          │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│  Variable Grouping UI               │
│  - Display groups with edit button  │
│  - Inline name editing              │
│  - Drag & drop variables            │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│  Demographic Selection UI           │
│  - Checkbox for each variable       │
│  - Pre-selected suggestions         │
│  - Visual indicators                │
└─────────────────────────────────────┘
    ↓
Auto-save (30s) + Manual Save
    ↓
Persist to Database
```

## Components and Interfaces

### 1. Enhanced Variable Grouping Service

**File**: `frontend/src/services/variable-grouping.service.ts` (UPDATE)

**New Methods**:

```typescript
class VariableGroupingService {
  /**
   * Suggest groups with case-insensitive matching
   * EM1, Em2, em3 → Group "Em"
   */
  static suggestGroupsCaseInsensitive(
    variables: AnalysisVariable[]
  ): VariableGroupSuggestion[] {
    // Normalize to lowercase for matching
    // Preserve original case in results
    // Return suggestions with editable names
  }

  /**
   * Normalize variable name for pattern matching
   */
  private static normalizeForMatching(name: string): string {
    return name.toLowerCase().trim();
  }

  /**
   * Get most common case variation for group name
   * EM1, Em2, em3 → "Em" (most common)
   */
  private static getMostCommonCase(names: string[]): string {
    // Count case variations
    // Return most frequent
  }

  /**
   * Validate group name
   */
  static validateGroupName(name: string, existingNames: string[]): {
    valid: boolean;
    error?: string;
  } {
    if (!name || name.trim().length === 0) {
      return { valid: false, error: 'Group name cannot be empty' };
    }
    if (existingNames.includes(name)) {
      return { valid: false, error: 'Group name already exists' };
    }
    return { valid: true };
  }
}
```

**Algorithm for Case-Insensitive Grouping**:

```typescript
// Step 1: Normalize all variable names
const normalized = variables.map(v => ({
  original: v.columnName,
  normalized: v.columnName.toLowerCase(),
  variable: v
}));

// Step 2: Group by normalized prefix
const groups = new Map<string, typeof normalized>();
normalized.forEach(item => {
  const match = item.normalized.match(/^([a-z]+)\d+/);
  if (match) {
    const prefix = match[1];
    if (!groups.has(prefix)) {
      groups.set(prefix, []);
    }
    groups.get(prefix)!.push(item);
  }
});

// Step 3: Generate suggestions with most common case
return Array.from(groups.entries()).map(([prefix, items]) => {
  const originalNames = items.map(i => i.original);
  const suggestedName = getMostCommonCase(originalNames, prefix);
  
  return {
    suggestedName,
    variables: originalNames,
    confidence: 0.9,
    reason: `Variables share prefix "${prefix}" (case-insensitive)`
  };
});
```

### 2. Enhanced Demographic Detection Service

**File**: `frontend/src/services/demographic.service.ts` (UPDATE)

**New Methods**:

```typescript
class DemographicService {
  /**
   * Detect demographic variables with confidence scores
   */
  static detectDemographics(
    variables: AnalysisVariable[]
  ): DemographicSuggestion[] {
    return variables
      .map(v => this.analyzeDemographic(v))
      .filter(s => s.confidence > 0.6)
      .sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Analyze single variable for demographic likelihood
   */
  private static analyzeDemographic(
    variable: AnalysisVariable
  ): DemographicSuggestion {
    const name = variable.columnName.toLowerCase();
    let confidence = 0;
    let type: DemographicType | null = null;
    let reasons: string[] = [];

    // Check for demographic keywords
    const patterns = [
      { keywords: ['age', 'tuoi'], type: 'continuous', weight: 0.95 },
      { keywords: ['gender', 'sex', 'gioi_tinh'], type: 'nominal', weight: 0.95 },
      { keywords: ['income', 'salary', 'thu_nhap'], type: 'ordinal', weight: 0.9 },
      { keywords: ['education', 'hoc_van'], type: 'ordinal', weight: 0.9 },
      { keywords: ['location', 'city', 'province', 'dia_diem'], type: 'nominal', weight: 0.85 },
      { keywords: ['occupation', 'job', 'nghe_nghiep'], type: 'nominal', weight: 0.85 },
      { keywords: ['marital', 'married', 'hon_nhan'], type: 'nominal', weight: 0.8 },
    ];

    for (const pattern of patterns) {
      if (pattern.keywords.some(kw => name.includes(kw))) {
        confidence = Math.max(confidence, pattern.weight);
        type = pattern.type as DemographicType;
        reasons.push(`Contains keyword: ${pattern.keywords.find(kw => name.includes(kw))}`);
      }
    }

    // Check data characteristics
    if (variable.dataType === 'number' && variable.uniqueValues < 10) {
      confidence += 0.1;
      reasons.push('Numeric with few unique values');
    }

    return {
      variable,
      confidence,
      type,
      reasons,
      autoSelected: confidence > 0.8
    };
  }

  /**
   * Generate semantic name from column name
   */
  static generateSemanticName(columnName: string): string {
    return columnName
      .replace(/_/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .trim()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }
}
```

### 3. Variable Grouping UI Component

**File**: `frontend/src/components/analysis/VariableGroupingPanel.tsx` (NEW)

**Component Structure**:

```typescript
interface VariableGroupingPanelProps {
  variables: AnalysisVariable[];
  initialGroups?: VariableGroup[];
  onGroupsChange: (groups: VariableGroup[]) => void;
  onSave: () => void;
}

export default function VariableGroupingPanel({
  variables,
  initialGroups,
  onGroupsChange,
  onSave
}: VariableGroupingPanelProps) {
  const [groups, setGroups] = useState<VariableGroup[]>(initialGroups || []);
  const [suggestions, setSuggestions] = useState<VariableGroupSuggestion[]>([]);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Auto-generate suggestions on mount
  useEffect(() => {
    const suggested = VariableGroupingService.suggestGroupsCaseInsensitive(variables);
    setSuggestions(suggested);
  }, [variables]);

  // Auto-save every 30 seconds
  useAutoSave(groups, 30000);

  return (
    <div className="space-y-6">
      {/* Suggestions Section */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="flex items-center gap-2 font-semibold mb-3">
          <Sparkles className="h-5 w-5 text-blue-600" />
          Suggested Groups ({suggestions.length})
        </h3>
        
        {suggestions.map((suggestion, idx) => (
          <SuggestionCard
            key={idx}
            suggestion={suggestion}
            onAccept={() => acceptSuggestion(suggestion)}
            onReject={() => rejectSuggestion(idx)}
          />
        ))}
      </div>

      {/* Current Groups Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Variable Groups ({groups.length})</h3>
          <button
            onClick={createNewGroup}
            className="btn-secondary"
          >
            + New Group
          </button>
        </div>

        {groups.map(group => (
          <GroupCard
            key={group.id}
            group={group}
            isEditing={editingGroupId === group.id}
            onStartEdit={() => setEditingGroupId(group.id)}
            onEndEdit={() => setEditingGroupId(null)}
            onNameChange={(newName) => updateGroupName(group.id, newName)}
            onAddVariables={(vars) => addVariablesToGroup(group.id, vars)}
            onRemoveVariable={(varName) => removeVariableFromGroup(group.id, varName)}
            onDelete={() => deleteGroup(group.id)}
          />
        ))}
      </div>

      {/* Ungrouped Variables */}
      <UngroupedVariables
        variables={getUngroupedVariables()}
        onAddToGroup={(varName, groupId) => addVariableToGroup(varName, groupId)}
      />

      {/* Save Button */}
      {hasUnsavedChanges && (
        <div className="fixed bottom-4 right-4">
          <button
            onClick={onSave}
            className="btn-primary shadow-lg"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </button>
        </div>
      )}
    </div>
  );
}
```

**GroupCard Component**:

```typescript
function GroupCard({
  group,
  isEditing,
  onStartEdit,
  onEndEdit,
  onNameChange,
  onAddVariables,
  onRemoveVariable,
  onDelete
}: GroupCardProps) {
  const [editedName, setEditedName] = useState(group.name);
  const [showAddVariables, setShowAddVariables] = useState(false);

  const handleSaveName = () => {
    const validation = VariableGroupingService.validateGroupName(
      editedName,
      existingGroupNames
    );
    
    if (validation.valid) {
      onNameChange(editedName);
      onEndEdit();
    } else {
      toast.error(validation.error);
    }
  };

  return (
    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
      {/* Group Header */}
      <div className="flex items-center justify-between mb-3">
        {isEditing ? (
          <input
            type="text"
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
            onBlur={handleSaveName}
            onKeyPress={(e) => e.key === 'Enter' && handleSaveName()}
            className="input-primary flex-1 mr-2"
            autoFocus
          />
        ) : (
          <h4
            className="font-semibold text-lg cursor-pointer hover:text-blue-600"
            onClick={onStartEdit}
          >
            {group.name}
            <Edit2 className="inline h-4 w-4 ml-2 opacity-50" />
          </h4>
        )}

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            {group.variables.length} variables
          </span>
          <button
            onClick={() => setShowAddVariables(!showAddVariables)}
            className="btn-sm btn-secondary"
          >
            + Add
          </button>
          <button
            onClick={onDelete}
            className="btn-sm btn-danger"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Variables List */}
      <div className="flex flex-wrap gap-2">
        {group.variables.map(varName => (
          <VariableChip
            key={varName}
            name={varName}
            onRemove={() => onRemoveVariable(varName)}
          />
        ))}
      </div>

      {/* Add Variables Dropdown */}
      {showAddVariables && (
        <AddVariablesDropdown
          availableVariables={ungroupedVariables}
          onAdd={(vars) => {
            onAddVariables(vars);
            setShowAddVariables(false);
          }}
          onCancel={() => setShowAddVariables(false)}
        />
      )}
    </div>
  );
}
```

### 4. Demographic Selection UI Component

**File**: `frontend/src/components/analysis/DemographicSelectionPanel.tsx` (NEW)

**Component Structure**:

```typescript
interface DemographicSelectionPanelProps {
  variables: AnalysisVariable[];
  initialDemographics?: DemographicVariable[];
  onDemographicsChange: (demographics: DemographicVariable[]) => void;
  onSave: () => void;
}

export default function DemographicSelectionPanel({
  variables,
  initialDemographics,
  onDemographicsChange,
  onSave
}: DemographicSelectionPanelProps) {
  const [demographics, setDemographics] = useState<DemographicVariable[]>(
    initialDemographics || []
  );
  const [suggestions, setSuggestions] = useState<DemographicSuggestion[]>([]);

  // Auto-detect demographics on mount
  useEffect(() => {
    const detected = DemographicService.detectDemographics(variables);
    setSuggestions(detected);
    
    // Auto-select high-confidence suggestions
    const autoSelected = detected
      .filter(s => s.autoSelected)
      .map(s => ({
        ...s.variable,
        semanticName: DemographicService.generateSemanticName(s.variable.columnName),
        demographicType: s.type,
        isDemographic: true,
        confidence: s.confidence,
        reasons: s.reasons
      }));
    
    setDemographics(autoSelected);
  }, [variables]);

  const toggleDemographic = (variable: AnalysisVariable) => {
    const exists = demographics.find(d => d.columnName === variable.columnName);
    
    if (exists) {
      // Remove
      setDemographics(demographics.filter(d => d.columnName !== variable.columnName));
    } else {
      // Add with smart defaults
      const suggestion = suggestions.find(s => s.variable.columnName === variable.columnName);
      setDemographics([
        ...demographics,
        {
          ...variable,
          semanticName: DemographicService.generateSemanticName(variable.columnName),
          demographicType: suggestion?.type || 'nominal',
          isDemographic: true,
          confidence: suggestion?.confidence,
          reasons: suggestion?.reasons
        }
      ]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Smart Suggestions */}
      <div className="bg-green-50 p-4 rounded-lg">
        <h3 className="flex items-center gap-2 font-semibold mb-3">
          <Sparkles className="h-5 w-5 text-green-600" />
          Smart Demographic Detection
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          We automatically detected {suggestions.length} potential demographic variables.
          Review and adjust as needed.
        </p>
      </div>

      {/* Variable List with Checkboxes */}
      <div className="space-y-2">
        <h3 className="font-semibold mb-3">
          Select Demographic Variables ({demographics.length}/{variables.length})
        </h3>

        {variables.map(variable => {
          const isDemographic = demographics.some(d => d.columnName === variable.columnName);
          const suggestion = suggestions.find(s => s.variable.columnName === variable.columnName);
          const isAutoDetected = suggestion && suggestion.confidence > 0.8;

          return (
            <DemographicVariableRow
              key={variable.columnName}
              variable={variable}
              isSelected={isDemographic}
              isAutoDetected={isAutoDetected}
              suggestion={suggestion}
              onToggle={() => toggleDemographic(variable)}
              onConfigure={() => openConfiguration(variable)}
            />
          );
        })}
      </div>

      {/* Selected Demographics Configuration */}
      {demographics.length > 0 && (
        <div className="border-t pt-6">
          <h3 className="font-semibold mb-4">Configure Selected Demographics</h3>
          {demographics.map(demo => (
            <DemographicConfigCard
              key={demo.columnName}
              demographic={demo}
              onUpdate={(updates) => updateDemographic(demo.columnName, updates)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
```

**DemographicVariableRow Component**:

```typescript
function DemographicVariableRow({
  variable,
  isSelected,
  isAutoDetected,
  suggestion,
  onToggle,
  onConfigure
}: DemographicVariableRowProps) {
  return (
    <div
      className={`
        flex items-center justify-between p-3 rounded-lg border
        ${isSelected ? 'bg-blue-50 border-blue-300' : 'bg-white border-gray-200'}
        ${isAutoDetected ? 'ring-2 ring-green-300' : ''}
        hover:shadow-sm transition-all
      `}
    >
      <div className="flex items-center gap-3 flex-1">
        {/* Checkbox */}
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onToggle}
          className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />

        {/* Variable Info */}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium">{variable.columnName}</span>
            
            {isAutoDetected && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                <Sparkles className="h-3 w-3 mr-1" />
                Auto-detected
              </span>
            )}
          </div>

          {suggestion && (
            <div className="text-sm text-gray-600 mt-1">
              <div className="flex items-center gap-2">
                <span>Confidence: {(suggestion.confidence * 100).toFixed(0)}%</span>
                <span>•</span>
                <span>Type: {suggestion.type}</span>
              </div>
              <div className="text-xs text-gray-500 mt-0.5">
                {suggestion.reasons.join(', ')}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        {isSelected && (
          <button
            onClick={onConfigure}
            className="btn-sm btn-secondary"
          >
            <Settings className="h-4 w-4 mr-1" />
            Configure
          </button>
        )}
      </div>
    </div>
  );
}
```

## Data Models

### VariableGroup

```typescript
interface VariableGroup {
  id: string;
  name: string;
  variables: string[]; // column names
  createdAt: Date;
  updatedAt: Date;
  isCustom: boolean; // true if user created/edited
}
```

### VariableGroupSuggestion

```typescript
interface VariableGroupSuggestion {
  suggestedName: string;
  variables: string[];
  confidence: number; // 0-1
  reason: string;
  pattern: 'prefix' | 'numbering' | 'semantic';
}
```

### DemographicSuggestion

```typescript
interface DemographicSuggestion {
  variable: AnalysisVariable;
  confidence: number; // 0-1
  type: DemographicType | null;
  reasons: string[];
  autoSelected: boolean; // true if confidence > 0.8
}
```

### DemographicVariable

```typescript
interface DemographicVariable extends AnalysisVariable {
  semanticName: string;
  demographicType: DemographicType;
  isDemographic: true;
  confidence?: number;
  reasons?: string[];
  ranks?: RankDefinition[];
  ordinalCategories?: string[];
}
```

## Error Handling

### Validation Errors

```typescript
// Group name validation
if (groupName.trim().length === 0) {
  throw new ValidationError('Group name cannot be empty');
}

if (existingGroups.some(g => g.name === groupName)) {
  throw new ValidationError('Group name already exists');
}

// Group size validation
if (group.variables.length < 2) {
  showWarning('Groups should contain at least 2 variables');
}

// Demographic type validation
if (demographicType === 'ordinal' && !ordinalCategories) {
  throw new ValidationError('Ordinal demographics require category order');
}
```

### Auto-save Error Handling

```typescript
try {
  await saveToDatabase(groups, demographics);
  localStorage.removeItem('unsaved_groups');
  toast.success('Changes saved successfully');
} catch (error) {
  // Retry with exponential backoff
  await retryWithBackoff(
    () => saveToDatabase(groups, demographics),
    { maxAttempts: 3, baseDelay: 1000 }
  );
  
  // If still fails, keep in localStorage
  localStorage.setItem('unsaved_groups', JSON.stringify(groups));
  toast.error('Failed to save. Changes stored locally.');
}
```

## Testing Strategy

### Unit Tests

1. **VariableGroupingService**
   - Test case-insensitive matching (EM1, Em2, em3)
   - Test prefix detection (Q1_, Q2_, Q3_)
   - Test numbering detection (Item1, Item2, Item3)
   - Test group name validation

2. **DemographicService**
   - Test keyword detection (age, gender, income)
   - Test confidence scoring
   - Test semantic name generation
   - Test auto-selection logic

### Integration Tests

1. **Variable Grouping Flow**
   - Upload CSV → Auto-suggest groups → Edit names → Save
   - Test case-insensitive grouping end-to-end
   - Test group management (add, remove, delete)

2. **Demographic Selection Flow**
   - Upload CSV → Auto-detect demographics → Review → Configure → Save
   - Test checkbox selection
   - Test auto-selection of high-confidence variables

### UI Tests

1. **Inline Editing**
   - Click group name → Edit → Save
   - Test validation errors
   - Test escape to cancel

2. **Checkbox Interaction**
   - Check/uncheck variables
   - Test visual feedback
   - Test auto-selected state

## Performance Considerations

### Optimization Strategies

1. **Debounced Auto-save**
   ```typescript
   const debouncedSave = useMemo(
     () => debounce(saveToLocalStorage, 30000),
     []
   );
   ```

2. **Memoized Suggestions**
   ```typescript
   const suggestions = useMemo(
     () => VariableGroupingService.suggestGroupsCaseInsensitive(variables),
     [variables]
   );
   ```

3. **Virtual Scrolling for Large Variable Lists**
   ```typescript
   import { FixedSizeList } from 'react-window';
   
   <FixedSizeList
     height={600}
     itemCount={variables.length}
     itemSize={60}
   >
     {({ index, style }) => (
       <DemographicVariableRow
         style={style}
         variable={variables[index]}
         {...props}
       />
     )}
   </FixedSizeList>
   ```

## Deployment Notes

### Database Migrations

No schema changes required - uses existing tables:
- `analysis_variables`
- `demographic_variables`
- `variable_groups` (if exists, otherwise create)

### Feature Flags

```typescript
const FEATURE_FLAGS = {
  CASE_INSENSITIVE_GROUPING: true,
  SMART_DEMOGRAPHIC_DETECTION: true,
  AUTO_SAVE: true,
  INLINE_EDITING: true
};
```

### Rollout Plan

1. **Phase 1**: Deploy case-insensitive grouping
2. **Phase 2**: Deploy smart demographic detection
3. **Phase 3**: Deploy inline editing UI
4. **Phase 4**: Enable auto-save

---

**Date**: November 9, 2024  
**Status**: Design Complete  
**Next**: Implementation Tasks
