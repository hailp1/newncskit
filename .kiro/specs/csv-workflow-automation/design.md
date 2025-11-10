# Design Document

## Overview

This design implements automatic workflow progression and variable role tagging for the CSV analysis system. The solution addresses two key problems:

1. **Manual workflow friction**: Users must manually click "Continue" after health check to see grouping suggestions
2. **Missing role configuration**: No way to specify variable roles (IV, DV, Mediator, etc.) for advanced analyses

**Key Design Decisions:**
- Auto-continue from Health Check → Grouping using React useEffect hooks
- Role tags stored at both group and variable levels with override capability
- Smart role suggestions based on semantic analysis of variable names
- Real-time validation of role assignments for different analysis types
- Visual model preview using Mermaid diagrams

## Architecture

### Current Flow (Problem)
```
Upload → Health Check → [USER CLICKS CONTINUE] → Grouping API → Grouping UI
         (auto)          (manual friction)        (delayed)
```

### New Flow (Solution)
```
Upload → Health Check → Grouping API → Grouping UI (with roles)
         (auto)         (auto)          (immediate)
                        ↓
                   Role Tagging
                        ↓
                   Validation
                        ↓
                   Model Preview
```

### Component Architecture

```
NewAnalysisPage (Orchestrator)
├── CSVUploader
├── DataHealthDashboard
│   └── [Auto-triggers grouping on mount]
├── VariableGroupingPanel (Enhanced)
│   ├── GroupSuggestions
│   ├── RoleTagSelector (NEW)
│   ├── RoleValidation (NEW)
│   └── ModelPreview (NEW)
├── DemographicSelectionPanel
├── AnalysisSelector
└── ResultsViewer
```

## Components and Interfaces

### 1. Enhanced NewAnalysisPage

**File:** `frontend/src/app/(dashboard)/analysis/new/page.tsx`


**Key Changes:**
- Add `useEffect` to auto-trigger grouping when health step completes
- Add loading state for grouping API call
- Add error handling with retry capability
- Store role tags in state

```typescript
// Auto-continue from health to grouping
useEffect(() => {
  if (currentStep === 'health' && healthReport && !groupSuggestions.length) {
    // Auto-fetch grouping suggestions
    handleHealthContinue();
  }
}, [currentStep, healthReport]);

const handleHealthContinue = async () => {
  if (!projectId) return;

  setLoading(true);
  setError(null);

  try {
    const response = await fetch(getApiUrl('api/analysis/group'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        projectId,
        headers: uploadedHeaders,
        preview: uploadedPreview
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch grouping suggestions');
    }

    const data = await response.json();
    setGroupSuggestions(data.suggestions || []);
    
    // Auto-transition to grouping step
    setCurrentStep('group');
  } catch (err) {
    setError((err as Error).message);
  } finally {
    setLoading(false);
  }
};
```

### 2. Role Tag Data Models

**File:** `frontend/src/types/analysis.ts`

```typescript
export type VariableRole = 
  | 'none'
  | 'independent'    // IV - predictor
  | 'dependent'      // DV - outcome
  | 'mediator'       // M - explains IV→DV
  | 'moderator'      // Mod - affects IV→DV strength
  | 'control'        // Ctrl - held constant
  | 'latent';        // Latent construct (CFA/SEM)

export interface VariableRoleTag {
  variableId: string;
  columnName: string;
  role: VariableRole;
  confidence?: number;  // For suggestions (0-1)
  reason?: string;      // Why this role was suggested
  isUserAssigned: boolean;
}

export interface GroupRoleTag {
  groupId: string;
  groupName: string;
  role: VariableRole;
  appliesTo: string[];  // Variable IDs
}

export interface RoleSuggestion {
  variableId: string;
  columnName: string;
  suggestedRole: VariableRole;
  confidence: number;
  reasons: string[];
}

export interface AnalysisModelValidation {
  isValid: boolean;
  analysisTypes: AnalysisType[];  // Which analyses are valid
  errors: string[];
  warnings: string[];
  suggestions: string[];
}
```



### 3. RoleTagSelector Component (NEW)

**File:** `frontend/src/components/analysis/RoleTagSelector.tsx`

```typescript
interface RoleTagSelectorProps {
  entityId: string;  // Variable or Group ID
  entityName: string;
  currentRole: VariableRole;
  suggestion?: RoleSuggestion;
  onRoleChange: (role: VariableRole) => void;
  disabled?: boolean;
}

export default function RoleTagSelector({
  entityId,
  entityName,
  currentRole,
  suggestion,
  onRoleChange,
  disabled = false
}: RoleTagSelectorProps) {
  const roleOptions: { value: VariableRole; label: string; color: string; icon: string }[] = [
    { value: 'none', label: 'None', color: 'gray', icon: '○' },
    { value: 'independent', label: 'IV (Independent)', color: 'blue', icon: '→' },
    { value: 'dependent', label: 'DV (Dependent)', color: 'green', icon: '◉' },
    { value: 'mediator', label: 'Mediator', color: 'purple', icon: '⟿' },
    { value: 'moderator', label: 'Moderator', color: 'orange', icon: '⊗' },
    { value: 'control', label: 'Control', color: 'gray', icon: '⊙' },
    { value: 'latent', label: 'Latent', color: 'yellow', icon: '◈' },
  ];

  return (
    <div className="flex items-center gap-2">
      <select
        value={currentRole}
        onChange={(e) => onRoleChange(e.target.value as VariableRole)}
        disabled={disabled}
        className={`
          px-3 py-1 rounded-md border text-sm font-medium
          ${getRoleColor(currentRole)}
        `}
      >
        {roleOptions.map(option => (
          <option key={option.value} value={option.value}>
            {option.icon} {option.label}
          </option>
        ))}
      </select>

      {suggestion && suggestion.suggestedRole !== currentRole && (
        <button
          onClick={() => onRoleChange(suggestion.suggestedRole)}
          className="text-xs text-blue-600 hover:text-blue-800"
          title={suggestion.reasons.join(', ')}
        >
          Suggested: {suggestion.suggestedRole} ({Math.round(suggestion.confidence * 100)}%)
        </button>
      )}
    </div>
  );
}

function getRoleColor(role: VariableRole): string {
  const colors = {
    none: 'bg-gray-100 border-gray-300 text-gray-700',
    independent: 'bg-blue-100 border-blue-300 text-blue-700',
    dependent: 'bg-green-100 border-green-300 text-green-700',
    mediator: 'bg-purple-100 border-purple-300 text-purple-700',
    moderator: 'bg-orange-100 border-orange-300 text-orange-700',
    control: 'bg-gray-100 border-gray-300 text-gray-600',
    latent: 'bg-yellow-100 border-yellow-300 text-yellow-700',
  };
  return colors[role];
}
```

### 4. Role Suggestion Service

**File:** `frontend/src/services/role-suggestion.service.ts`

```typescript
export class RoleSuggestionService {
  private static readonly DV_KEYWORDS = [
    'satisfaction', 'outcome', 'result', 'performance', 'success',
    'intention', 'behavior', 'loyalty', 'trust', 'quality'
  ];

  private static readonly CONTROL_KEYWORDS = [
    'age', 'gender', 'income', 'education', 'experience',
    'tenure', 'size', 'location', 'industry'
  ];

  private static readonly MEDIATOR_KEYWORDS = [
    'perception', 'attitude', 'belief', 'value', 'motivation'
  ];

  static suggestRoles(variables: AnalysisVariable[]): RoleSuggestion[] {
    return variables.map(variable => {
      const name = variable.columnName.toLowerCase();
      
      // Check for DV patterns
      const dvMatch = this.DV_KEYWORDS.find(kw => name.includes(kw));
      if (dvMatch) {
        return {
          variableId: variable.id,
          columnName: variable.columnName,
          suggestedRole: 'dependent',
          confidence: 0.8,
          reasons: [`Contains keyword "${dvMatch}" commonly used for outcomes`]
        };
      }

      // Check for control patterns
      const controlMatch = this.CONTROL_KEYWORDS.find(kw => name.includes(kw));
      if (controlMatch) {
        return {
          variableId: variable.id,
          columnName: variable.columnName,
          suggestedRole: 'control',
          confidence: 0.9,
          reasons: [`Demographic variable "${controlMatch}"`]
        };
      }

      // Check for mediator patterns
      const mediatorMatch = this.MEDIATOR_KEYWORDS.find(kw => name.includes(kw));
      if (mediatorMatch) {
        return {
          variableId: variable.id,
          columnName: variable.columnName,
          suggestedRole: 'mediator',
          confidence: 0.7,
          reasons: [`Contains "${mediatorMatch}" which often mediates relationships`]
        };
      }

      // Default: no suggestion
      return {
        variableId: variable.id,
        columnName: variable.columnName,
        suggestedRole: 'none',
        confidence: 0,
        reasons: []
      };
    });
  }

  static suggestLatentVariables(groups: VariableGroup[]): RoleSuggestion[] {
    return groups
      .filter(group => group.variables && group.variables.length >= 3)
      .map(group => ({
        variableId: group.id,
        columnName: group.name,
        suggestedRole: 'latent' as VariableRole,
        confidence: 0.85,
        reasons: [
          `Group has ${group.variables.length} indicators`,
          'Suitable for latent variable modeling (CFA/SEM)'
        ]
      }));
  }
}
```



### 5. Role Validation Service

**File:** `frontend/src/services/role-validation.service.ts`

```typescript
export class RoleValidationService {
  static validateForRegression(roleTags: VariableRoleTag[]): AnalysisModelValidation {
    const dvs = roleTags.filter(t => t.role === 'dependent');
    const ivs = roleTags.filter(t => t.role === 'independent');
    
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Must have exactly 1 DV
    if (dvs.length === 0) {
      errors.push('Regression requires exactly one Dependent Variable (DV)');
    } else if (dvs.length > 1) {
      errors.push(`Multiple DVs selected (${dvs.length}). Regression requires exactly one DV`);
    }

    // Must have at least 1 IV
    if (ivs.length === 0) {
      errors.push('Regression requires at least one Independent Variable (IV)');
    }

    // Warnings for best practices
    if (ivs.length > 10) {
      warnings.push(`${ivs.length} IVs may cause multicollinearity. Consider reducing.`);
    }

    const controls = roleTags.filter(t => t.role === 'control');
    if (controls.length === 0) {
      suggestions.push('Consider adding control variables to improve model validity');
    }

    return {
      isValid: errors.length === 0,
      analysisTypes: errors.length === 0 ? ['regression'] : [],
      errors,
      warnings,
      suggestions
    };
  }

  static validateForSEM(roleTags: VariableRoleTag[], groups: VariableGroup[]): AnalysisModelValidation {
    const latents = roleTags.filter(t => t.role === 'latent');
    
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Must have at least 2 latent variables
    if (latents.length < 2) {
      errors.push('SEM requires at least 2 latent variables');
    }

    // Each latent must have at least 3 indicators
    latents.forEach(latent => {
      const group = groups.find(g => g.id === latent.variableId);
      if (group && group.variables && group.variables.length < 3) {
        errors.push(`Latent variable "${latent.columnName}" has only ${group.variables.length} indicators. Minimum 3 required.`);
      }
    });

    // Check for paths
    const dvs = roleTags.filter(t => t.role === 'dependent');
    if (dvs.length === 0) {
      warnings.push('No dependent variable specified. SEM model may be incomplete.');
    }

    return {
      isValid: errors.length === 0,
      analysisTypes: errors.length === 0 ? ['sem', 'cfa'] : [],
      errors,
      warnings,
      suggestions
    };
  }

  static validateForMediation(roleTags: VariableRoleTag[]): AnalysisModelValidation {
    const ivs = roleTags.filter(t => t.role === 'independent');
    const dvs = roleTags.filter(t => t.role === 'dependent');
    const mediators = roleTags.filter(t => t.role === 'mediator');
    
    const errors: string[] = [];
    const warnings: string[] = [];

    if (ivs.length === 0) errors.push('Mediation requires at least one IV');
    if (dvs.length === 0) errors.push('Mediation requires at least one DV');
    if (mediators.length === 0) errors.push('Mediation requires at least one Mediator');

    if (mediators.length > 3) {
      warnings.push('Multiple mediators detected. Consider testing them separately.');
    }

    return {
      isValid: errors.length === 0,
      analysisTypes: errors.length === 0 ? ['mediation'] : [],
      errors,
      warnings,
      suggestions: []
    };
  }

  static validateAll(
    roleTags: VariableRoleTag[], 
    groups: VariableGroup[]
  ): AnalysisModelValidation {
    const regression = this.validateForRegression(roleTags);
    const sem = this.validateForSEM(roleTags, groups);
    const mediation = this.validateForMediation(roleTags);

    const allAnalysisTypes = [
      ...regression.analysisTypes,
      ...sem.analysisTypes,
      ...mediation.analysisTypes
    ];

    return {
      isValid: allAnalysisTypes.length > 0,
      analysisTypes: allAnalysisTypes,
      errors: [...regression.errors, ...sem.errors, ...mediation.errors],
      warnings: [...regression.warnings, ...sem.warnings, ...mediation.warnings],
      suggestions: [...regression.suggestions, ...sem.suggestions, ...mediation.suggestions]
    };
  }
}
```



### 6. ModelPreview Component (NEW)

**File:** `frontend/src/components/analysis/ModelPreview.tsx`

```typescript
import { useMemo } from 'react';
import { VariableRoleTag, VariableGroup } from '@/types/analysis';

interface ModelPreviewProps {
  roleTags: VariableRoleTag[];
  groups: VariableGroup[];
  validationResult: AnalysisModelValidation;
}

export default function ModelPreview({ 
  roleTags, 
  groups, 
  validationResult 
}: ModelPreviewProps) {
  const mermaidDiagram = useMemo(() => {
    return generateMermaidDiagram(roleTags, groups);
  }, [roleTags, groups]);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Analysis Model Preview</h3>

      {/* Validation Status */}
      <div className="mb-4">
        {validationResult.isValid ? (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="w-5 h-5" />
            <span>Ready for: {validationResult.analysisTypes.join(', ')}</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="w-5 h-5" />
            <span>Model configuration incomplete</span>
          </div>
        )}
      </div>

      {/* Errors */}
      {validationResult.errors.length > 0 && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
          <p className="font-medium text-red-800 mb-2">Errors:</p>
          <ul className="list-disc list-inside text-sm text-red-700">
            {validationResult.errors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Warnings */}
      {validationResult.warnings.length > 0 && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
          <p className="font-medium text-yellow-800 mb-2">Warnings:</p>
          <ul className="list-disc list-inside text-sm text-yellow-700">
            {validationResult.warnings.map((warn, i) => (
              <li key={i}>{warn}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Mermaid Diagram */}
      <div className="mt-4 p-4 bg-gray-50 rounded border border-gray-200">
        <pre className="text-xs overflow-x-auto">
          <code>{mermaidDiagram}</code>
        </pre>
      </div>

      {/* Variable Summary */}
      <div className="mt-4 grid grid-cols-2 gap-4">
        <RoleSummary roleTags={roleTags} role="independent" label="Independent Variables" />
        <RoleSummary roleTags={roleTags} role="dependent" label="Dependent Variables" />
        <RoleSummary roleTags={roleTags} role="mediator" label="Mediators" />
        <RoleSummary roleTags={roleTags} role="moderator" label="Moderators" />
        <RoleSummary roleTags={roleTags} role="control" label="Control Variables" />
        <RoleSummary roleTags={roleTags} role="latent" label="Latent Variables" />
      </div>
    </div>
  );
}

function RoleSummary({ 
  roleTags, 
  role, 
  label 
}: { 
  roleTags: VariableRoleTag[]; 
  role: VariableRole; 
  label: string;
}) {
  const variables = roleTags.filter(t => t.role === role);
  
  if (variables.length === 0) return null;

  return (
    <div className="p-3 bg-white border border-gray-200 rounded">
      <p className="text-sm font-medium text-gray-700 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{variables.length}</p>
      <p className="text-xs text-gray-500 mt-1">
        {variables.map(v => v.columnName).join(', ')}
      </p>
    </div>
  );
}

function generateMermaidDiagram(
  roleTags: VariableRoleTag[], 
  groups: VariableGroup[]
): string {
  const ivs = roleTags.filter(t => t.role === 'independent');
  const dvs = roleTags.filter(t => t.role === 'dependent');
  const mediators = roleTags.filter(t => t.role === 'mediator');
  const moderators = roleTags.filter(t => t.role === 'moderator');
  const controls = roleTags.filter(t => t.role === 'control');
  const latents = roleTags.filter(t => t.role === 'latent');

  let diagram = 'graph LR\n';

  // Add nodes
  ivs.forEach(iv => {
    diagram += `  ${sanitize(iv.columnName)}[${iv.columnName}]\n`;
  });
  dvs.forEach(dv => {
    diagram += `  ${sanitize(dv.columnName)}[${dv.columnName}]\n`;
  });
  mediators.forEach(m => {
    diagram += `  ${sanitize(m.columnName)}[${m.columnName}]\n`;
  });

  // Add relationships
  if (mediators.length > 0) {
    // Mediation model: IV → M → DV
    ivs.forEach(iv => {
      mediators.forEach(m => {
        diagram += `  ${sanitize(iv.columnName)} --> ${sanitize(m.columnName)}\n`;
      });
    });
    mediators.forEach(m => {
      dvs.forEach(dv => {
        diagram += `  ${sanitize(m.columnName)} --> ${sanitize(dv.columnName)}\n`;
      });
    });
  } else {
    // Direct model: IV → DV
    ivs.forEach(iv => {
      dvs.forEach(dv => {
        diagram += `  ${sanitize(iv.columnName)} --> ${sanitize(dv.columnName)}\n`;
      });
    });
  }

  // Add control variables
  controls.forEach(ctrl => {
    dvs.forEach(dv => {
      diagram += `  ${sanitize(ctrl.columnName)} -.-> ${sanitize(dv.columnName)}\n`;
    });
  });

  return diagram;
}

function sanitize(name: string): string {
  return name.replace(/[^a-zA-Z0-9]/g, '_');
}
```



### 7. Enhanced VariableGroupingPanel

**File:** `frontend/src/components/analysis/VariableGroupingPanel.tsx`

**Key Additions:**
- Import and use RoleTagSelector for each group/variable
- Import and use RoleSuggestionService for smart suggestions
- Import and use RoleValidationService for real-time validation
- Import and use ModelPreview to show analysis model
- Add state for role tags and validation results

```typescript
// Add to existing component
const [roleTags, setRoleTags] = useState<VariableRoleTag[]>([]);
const [roleSuggestions, setRoleSuggestions] = useState<RoleSuggestion[]>([]);
const [validationResult, setValidationResult] = useState<AnalysisModelValidation>({
  isValid: false,
  analysisTypes: [],
  errors: [],
  warnings: [],
  suggestions: []
});

// Generate role suggestions on mount
useEffect(() => {
  if (variables.length > 0) {
    const suggestions = RoleSuggestionService.suggestRoles(variables);
    setRoleSuggestions(suggestions);
    
    // Initialize role tags
    const initialTags: VariableRoleTag[] = variables.map(v => ({
      variableId: v.id,
      columnName: v.columnName,
      role: 'none',
      isUserAssigned: false
    }));
    setRoleTags(initialTags);
  }
}, [variables]);

// Validate roles whenever they change
useEffect(() => {
  const validation = RoleValidationService.validateAll(roleTags, groups);
  setValidationResult(validation);
}, [roleTags, groups]);

// Handle role change
const handleRoleChange = (variableId: string, newRole: VariableRole) => {
  setRoleTags(prev => prev.map(tag => 
    tag.variableId === variableId
      ? { ...tag, role: newRole, isUserAssigned: true }
      : tag
  ));
};

// Handle group role change (applies to all variables in group)
const handleGroupRoleChange = (groupId: string, newRole: VariableRole) => {
  const group = groups.find(g => g.id === groupId);
  if (!group || !group.variables) return;

  setRoleTags(prev => prev.map(tag => 
    group.variables.includes(tag.columnName)
      ? { ...tag, role: newRole, isUserAssigned: true }
      : tag
  ));
};
```

**Updated JSX:**
```typescript
return (
  <div className="space-y-6">
    {/* Existing grouping UI */}
    
    {/* Role Tagging Section */}
    <div className="mt-8">
      <h3 className="text-xl font-semibold mb-4">Variable Roles</h3>
      <p className="text-gray-600 mb-4">
        Assign roles to variables for advanced analyses (Regression, SEM, Mediation)
      </p>

      {/* Groups with role selectors */}
      {groups.map(group => (
        <div key={group.id} className="mb-4 p-4 border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium">{group.name}</h4>
            <RoleTagSelector
              entityId={group.id}
              entityName={group.name}
              currentRole={getGroupRole(group.id)}
              suggestion={getGroupSuggestion(group.id)}
              onRoleChange={(role) => handleGroupRoleChange(group.id, role)}
            />
          </div>
          
          {/* Individual variables in group */}
          <div className="ml-4 space-y-2">
            {group.variables?.map(varName => {
              const variable = variables.find(v => v.columnName === varName);
              if (!variable) return null;
              
              const roleTag = roleTags.find(t => t.variableId === variable.id);
              const suggestion = roleSuggestions.find(s => s.variableId === variable.id);
              
              return (
                <div key={variable.id} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{varName}</span>
                  <RoleTagSelector
                    entityId={variable.id}
                    entityName={varName}
                    currentRole={roleTag?.role || 'none'}
                    suggestion={suggestion}
                    onRoleChange={(role) => handleRoleChange(variable.id, role)}
                  />
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>

    {/* Model Preview */}
    <ModelPreview
      roleTags={roleTags}
      groups={groups}
      validationResult={validationResult}
    />

    {/* Save button with validation */}
    <button
      onClick={handleSave}
      disabled={!validationResult.isValid}
      className={`
        px-6 py-3 rounded-lg font-medium
        ${validationResult.isValid 
          ? 'bg-blue-600 text-white hover:bg-blue-700' 
          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }
      `}
    >
      {validationResult.isValid 
        ? `Continue to Analysis (${validationResult.analysisTypes.join(', ')})` 
        : 'Configure roles to continue'
      }
    </button>
  </div>
);
```



## Data Models

### Database Schema Updates

**New Table: `variable_role_tags`**
```sql
CREATE TABLE variable_role_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  variable_id UUID REFERENCES analysis_variables(id) ON DELETE CASCADE,
  group_id UUID REFERENCES variable_groups(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('none', 'independent', 'dependent', 'mediator', 'moderator', 'control', 'latent')),
  is_user_assigned BOOLEAN DEFAULT false,
  confidence DECIMAL(3,2),
  reason TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT role_tag_entity CHECK (
    (variable_id IS NOT NULL AND group_id IS NULL) OR
    (variable_id IS NULL AND group_id IS NOT NULL)
  )
);

CREATE INDEX idx_role_tags_project ON variable_role_tags(project_id);
CREATE INDEX idx_role_tags_variable ON variable_role_tags(variable_id);
CREATE INDEX idx_role_tags_group ON variable_role_tags(group_id);
```

**Update Table: `variable_groups`**
```sql
ALTER TABLE variable_groups 
ADD COLUMN default_role VARCHAR(20) DEFAULT 'none';
```

### API Response Format

**Grouping API Response (Enhanced)**
```typescript
{
  success: true,
  suggestions: [
    {
      groupName: "Trust",
      variables: ["TR1", "TR2", "TR3"],
      confidence: 0.9,
      reasoning: "Common prefix pattern",
      suggestedRole: "latent",  // NEW
      roleConfidence: 0.85       // NEW
    }
  ],
  roleSuggestions: [            // NEW
    {
      variableId: "var-1",
      columnName: "Satisfaction",
      suggestedRole: "dependent",
      confidence: 0.8,
      reasons: ["Contains outcome keyword"]
    }
  ],
  demographics: [...],
  totalVariables: 20,
  suggestedGroups: 5
}
```

## Error Handling

### Auto-Continue Errors

1. **Network Failure**
   - Display: "Failed to fetch grouping suggestions. Check your connection."
   - Action: Show "Retry" button
   - Log: Full error with correlation ID

2. **API Error**
   - Display: Error message from API response
   - Action: Show "Retry" button + "Skip" option
   - Log: API error details

3. **Timeout**
   - Display: "Request timed out. The server may be busy."
   - Action: Show "Retry" button
   - Log: Timeout details

### Role Validation Errors

1. **Invalid Configuration**
   - Display: Inline error messages in ModelPreview
   - Action: Disable "Continue" button
   - Highlight: Invalid role assignments in red

2. **Missing Required Roles**
   - Display: "Regression requires 1 DV and at least 1 IV"
   - Action: Suggest which roles to assign
   - Highlight: Unassigned variables

## Testing Strategy

### Unit Tests

1. **RoleSuggestionService**
   - Test keyword detection for each role type
   - Test confidence scoring
   - Test edge cases (empty names, special characters)

2. **RoleValidationService**
   - Test regression validation rules
   - Test SEM validation rules
   - Test mediation validation rules
   - Test combined validation

3. **Auto-Continue Logic**
   - Test useEffect triggers correctly
   - Test loading states
   - Test error handling
   - Test retry mechanism

### Integration Tests

1. **Full Workflow**
   - Upload CSV → Auto health check → Auto grouping → Role assignment
   - Verify no manual clicks required
   - Verify data persists across steps

2. **Role Assignment Flow**
   - Assign roles to variables
   - Verify validation updates
   - Verify model preview updates
   - Save and verify persistence

3. **Error Recovery**
   - Simulate network failure
   - Verify retry works
   - Verify skip option works
   - Verify state is preserved

### Manual Testing Checklist

- [ ] Upload CSV and verify auto-progression to grouping
- [ ] Verify grouping suggestions appear immediately
- [ ] Assign IV role to a variable
- [ ] Assign DV role to a variable
- [ ] Verify "Ready for Regression" appears
- [ ] Assign Latent role to a group with 3+ variables
- [ ] Verify SEM validation passes
- [ ] Try to continue with invalid configuration
- [ ] Verify error messages are clear
- [ ] Test role suggestions acceptance
- [ ] Test model preview diagram
- [ ] Verify role tags persist after save
- [ ] Test backward navigation
- [ ] Test page refresh (state restoration)



## Performance Optimization

### 1. Lazy Loading
- Load RoleTagSelector component only when grouping step is active
- Defer Mermaid diagram rendering until user scrolls to preview

### 2. Memoization
- Memoize role validation results
- Memoize model preview diagram generation
- Use React.memo for RoleTagSelector components

### 3. Debouncing
- Debounce role validation by 300ms when user changes roles rapidly
- Debounce model preview updates

### 4. Caching
- Cache role suggestions in localStorage
- Cache validation results for common configurations
- Reuse grouping API response across page refreshes

```typescript
// Example: Debounced validation
const debouncedValidation = useMemo(
  () => debounce((tags: VariableRoleTag[], groups: VariableGroup[]) => {
    const result = RoleValidationService.validateAll(tags, groups);
    setValidationResult(result);
  }, 300),
  []
);

useEffect(() => {
  debouncedValidation(roleTags, groups);
}, [roleTags, groups, debouncedValidation]);
```

## Security Considerations

### 1. Input Validation
- Sanitize variable names before using in Mermaid diagrams
- Validate role values against enum
- Prevent XSS in role suggestion reasons

### 2. Authorization
- Verify user owns project before saving role tags
- Check permissions before allowing role modifications

### 3. Data Privacy
- Don't log sensitive variable data
- Sanitize error messages to avoid data leakage

## Deployment Considerations

### Feature Flags

```typescript
// Feature flag for auto-continue
const ENABLE_AUTO_CONTINUE = process.env.NEXT_PUBLIC_ENABLE_AUTO_CONTINUE === 'true';

// Feature flag for role tagging
const ENABLE_ROLE_TAGGING = process.env.NEXT_PUBLIC_ENABLE_ROLE_TAGGING === 'true';
```

### Rollout Plan

1. **Phase 1: Auto-Continue Only**
   - Deploy auto-continue feature
   - Monitor error rates and user feedback
   - Verify no performance degradation

2. **Phase 2: Role Tagging (Beta)**
   - Enable role tagging for 10% of users
   - Collect feedback on UI/UX
   - Monitor validation accuracy

3. **Phase 3: Full Rollout**
   - Enable for all users
   - Monitor adoption metrics
   - Iterate based on feedback

### Monitoring Metrics

1. **Auto-Continue Success Rate**
   - Target: >95% success rate
   - Alert if <90%

2. **Role Assignment Usage**
   - Track % of users who assign roles
   - Track most common role patterns

3. **Validation Accuracy**
   - Track false positives/negatives
   - Improve suggestion algorithms

4. **Performance**
   - Page load time for grouping step
   - Validation computation time
   - Model preview render time

## Success Metrics

### User Experience
- Reduce clicks from upload to analysis by 50% (from 4 to 2)
- Increase grouping step completion rate by 30%
- Reduce time spent on grouping step by 40%

### Feature Adoption
- 60% of users assign at least one role tag
- 40% of users use role suggestions
- 80% of users with valid configurations proceed to analysis

### Technical
- Auto-continue success rate >95%
- Role validation accuracy >90%
- Page load time <2s for grouping step

