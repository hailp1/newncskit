# Phase 4 & 5 Implementation Plan
## Variable Grouping & Demographic Configuration

## Overview
This document outlines the complete implementation for Phase 4 (Variable Grouping) and Phase 5 (Demographic Configuration) of the CSV Analysis Workflow.

---

## Phase 4: Variable Grouping

### Already Completed ✅
- **VariableGroupService** (`frontend/src/services/variable-group.service.ts`)
  - Prefix-based grouping
  - Numbering-based grouping
  - Semantic-based grouping
  - Confidence scoring
  - Merge overlapping suggestions

### To Implement

#### 1. Variable Grouping API Endpoint
**File:** `frontend/src/app/api/analysis/group/route.ts`

**Functionality:**
- Load variables from database
- Run VariableGroupService.suggestGroups()
- Save suggestions to variable_group_suggestions table
- Return suggestions to frontend

**Request:**
```typescript
POST /api/analysis/group
{
  projectId: string
}
```

**Response:**
```typescript
{
  success: boolean,
  suggestions: VariableGroupSuggestion[],
  variables: AnalysisVariable[]
}
```

#### 2. VariableGroupEditor Component
**File:** `frontend/src/components/analysis/VariableGroupEditor.tsx`

**Features:**
- Display AI-generated suggestions with confidence scores
- Accept/Reject suggestion buttons
- Drag & drop variables between groups
- Create new groups manually
- Edit group names and descriptions
- Delete groups
- Search/filter variables
- Visual indicators for grouped/ungrouped variables
- Save groups to database

**UI Layout:**
```
┌─────────────────────────────────────────────────┐
│ AI Suggestions (3)                    [Refresh] │
├─────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────┐ │
│ │ Trust (Confidence: 85%)                     │ │
│ │ Variables: Trust1, Trust2, Trust3           │ │
│ │ [Accept] [Reject]                           │ │
│ └─────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────┤
│ Your Groups (2)                    [+ New Group]│
├─────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────┐ │
│ │ Quality (5 variables)              [Edit][X]│ │
│ │ ├─ Quality1                                 │ │
│ │ ├─ Quality2                                 │ │
│ │ └─ ...                                      │ │
│ └─────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────┤
│ Ungrouped Variables (12)          [Search: ___]│
│ ┌─────────────────────────────────────────────┐ │
│ │ □ Age                                       │ │
│ │ □ Gender                                    │ │
│ │ □ Income                                    │ │
│ └─────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

#### 3. Save Groups API Endpoint
**File:** `frontend/src/app/api/analysis/groups/save/route.ts`

**Functionality:**
- Save variable groups to variable_groups table
- Update analysis_variables with group_id
- Update project status

**Request:**
```typescript
POST /api/analysis/groups/save
{
  projectId: string,
  groups: Array<{
    name: string,
    description?: string,
    groupType: 'construct' | 'demographic' | 'control',
    variables: string[] // column names
  }>
}
```

---

## Phase 5: Demographic Configuration

### To Implement

#### 1. DemographicConfig Component
**File:** `frontend/src/components/analysis/DemographicConfig.tsx`

**Features:**
- List all variables with checkbox selection
- Highlight suggested demographics (age, gender, income, etc.)
- Semantic name input (age, gender, income, education, etc.)
- Variable type selector (categorical/ordinal/continuous)
- Open RankCreator for continuous variables
- Show demographic summary panel
- Save configuration

**UI Layout:**
```
┌─────────────────────────────────────────────────┐
│ Select Demographic Variables                    │
├─────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────┐ │
│ │ ☑ Age                                       │ │
│ │   Semantic: [age____] Type: [Continuous ▼] │ │
│ │   [Create Ranks]                            │ │
│ ├─────────────────────────────────────────────┤ │
│ │ ☑ Gender                                    │ │
│ │   Semantic: [gender_] Type: [Categorical▼] │ │
│ ├─────────────────────────────────────────────┤ │
│ │ ☑ Income                                    │ │
│ │   Semantic: [income_] Type: [Continuous ▼] │ │
│ │   [Create Ranks]                            │ │
│ └─────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────┤
│ Summary: 3 demographic variables selected       │
│ [Continue to Analysis]                          │
└─────────────────────────────────────────────────┘
```

#### 2. RankCreator Component
**File:** `frontend/src/components/analysis/RankCreator.tsx`

**Features:**
- Add/edit/delete ranks
- Rank label input (e.g., "10-15 triệu")
- Min/max value inputs
- Open-ended range checkboxes (< min, > max)
- Real-time distribution preview
- Validation (no overlaps, no gaps)
- Visual preview with bar chart

**UI Layout:**
```
┌─────────────────────────────────────────────────┐
│ Create Ranks for: Income                        │
├─────────────────────────────────────────────────┤
│ Ranks:                                          │
│ ┌─────────────────────────────────────────────┐ │
│ │ 1. Label: [Dưới 10 triệu___]                │ │
│ │    ☑ Open-ended min  Max: [10______]        │ │
│ │    Preview: ████ 15 people (15%)      [Del] │ │
│ ├─────────────────────────────────────────────┤ │
│ │ 2. Label: [10-15 triệu______]               │ │
│ │    Min: [10______]  Max: [15______]         │ │
│ │    Preview: ██████ 25 people (25%)    [Del] │ │
│ ├─────────────────────────────────────────────┤ │
│ │ 3. Label: [16-20 triệu______]               │ │
│ │    Min: [16______]  Max: [20______]         │ │
│ │    Preview: ████████ 30 people (30%)  [Del] │ │
│ └─────────────────────────────────────────────┘ │
│ [+ Add Rank]                                    │
├─────────────────────────────────────────────────┤
│ Distribution Preview:                           │
│ ┌─────────────────────────────────────────────┐ │
│ │ Dưới 10 triệu    ████████ 15%               │ │
│ │ 10-15 triệu      ████████████ 25%           │ │
│ │ 16-20 triệu      ████████████████ 30%       │ │
│ │ Trên 20 triệu    ████████████ 30%           │ │
│ └─────────────────────────────────────────────┘ │
│ [Cancel] [Save Ranks]                           │
└─────────────────────────────────────────────────┘
```

#### 3. DemographicService
**File:** `frontend/src/services/demographic.service.ts`

**Functionality:**
- Validate rank definitions (no overlaps)
- Categorize data values into ranks
- Generate distribution preview
- Handle ordinal category ordering
- Suggest common demographic patterns

**Methods:**
```typescript
class DemographicService {
  static validateRanks(ranks: RankDefinition[]): ValidationResult
  static categorizeData(data: number[], ranks: DemographicRank[]): string[]
  static previewRankDistribution(data: number[], ranks: RankDefinition[]): RankPreview[]
  static suggestDemographics(variables: AnalysisVariable[]): string[]
  static validateOrdinalOrder(categories: OrdinalCategory[]): ValidationResult
}
```

#### 4. Demographic Configuration API Endpoint
**File:** `frontend/src/app/api/analysis/demographic/save/route.ts`

**Functionality:**
- Update analysis_variables (is_demographic, demographic_type, semantic_name)
- Save demographic_ranks for continuous variables
- Save ordinal_categories for ordinal variables
- Update project status to 'configured'

**Request:**
```typescript
POST /api/analysis/demographic/save
{
  projectId: string,
  demographics: Array<{
    variableId: string,
    semanticName: string,
    demographicType: 'categorical' | 'ordinal' | 'continuous',
    ranks?: RankDefinition[],
    categories?: OrdinalCategory[]
  }>
}
```

---

## Implementation Order

### Step 1: Complete Variable Grouping
1. Create `/api/analysis/group` endpoint
2. Create VariableGroupEditor component
3. Create `/api/analysis/groups/save` endpoint
4. Test grouping workflow

### Step 2: Complete Demographic Configuration
1. Create DemographicService
2. Create DemographicConfig component
3. Create RankCreator component
4. Create `/api/analysis/demographic/save` endpoint
5. Test demographic workflow

### Step 3: Integration
1. Update main analysis page to include both steps
2. Add navigation between steps
3. Add data persistence
4. Test complete workflow

---

## Database Operations

### Variable Grouping
```sql
-- Save group
INSERT INTO variable_groups (project_id, name, description, group_type)
VALUES ($1, $2, $3, $4);

-- Update variables with group
UPDATE analysis_variables 
SET variable_group_id = $1 
WHERE id = ANY($2);

-- Save suggestions
INSERT INTO variable_group_suggestions (project_id, suggested_name, variables, confidence, reason, status)
VALUES ($1, $2, $3, $4, $5, 'pending');
```

### Demographic Configuration
```sql
-- Update variable as demographic
UPDATE analysis_variables 
SET is_demographic = true,
    demographic_type = $1,
    semantic_name = $2
WHERE id = $3;

-- Save ranks
INSERT INTO demographic_ranks (variable_id, rank_order, label, min_value, max_value, is_open_ended_min, is_open_ended_max)
VALUES ($1, $2, $3, $4, $5, $6, $7);

-- Save ordinal categories
INSERT INTO ordinal_categories (variable_id, category_order, category_value, category_label)
VALUES ($1, $2, $3, $4);
```

---

## Testing Checklist

### Variable Grouping
- [ ] AI suggestions generated correctly
- [ ] Accept suggestion creates group
- [ ] Reject suggestion removes it
- [ ] Manual group creation works
- [ ] Drag & drop between groups
- [ ] Edit group name/description
- [ ] Delete group
- [ ] Search/filter variables
- [ ] Save groups to database
- [ ] Load existing groups

### Demographic Configuration
- [ ] Select demographic variables
- [ ] Assign semantic names
- [ ] Choose variable types
- [ ] Create ranks for continuous
- [ ] Validate rank overlaps
- [ ] Preview distribution
- [ ] Open-ended ranges work
- [ ] Ordinal category ordering
- [ ] Save configuration
- [ ] Load existing configuration

---

## Files to Create

### Phase 4 (3 files)
1. `frontend/src/app/api/analysis/group/route.ts` (~100 lines)
2. `frontend/src/components/analysis/VariableGroupEditor.tsx` (~400 lines)
3. `frontend/src/app/api/analysis/groups/save/route.ts` (~80 lines)

### Phase 5 (4 files)
1. `frontend/src/services/demographic.service.ts` (~200 lines)
2. `frontend/src/components/analysis/DemographicConfig.tsx` (~300 lines)
3. `frontend/src/components/analysis/RankCreator.tsx` (~350 lines)
4. `frontend/src/app/api/analysis/demographic/save/route.ts` (~120 lines)

**Total:** 7 new files, ~1,550 lines of code

---

## Estimated Time
- Phase 4: 6-8 hours
- Phase 5: 8-10 hours
- Integration & Testing: 2-3 hours
- **Total: 16-21 hours**

---

## Success Criteria

### Phase 4 Complete When:
- ✅ AI generates grouping suggestions
- ✅ User can accept/reject suggestions
- ✅ User can create groups manually
- ✅ User can drag & drop variables
- ✅ Groups saved to database
- ✅ Can proceed to next step

### Phase 5 Complete When:
- ✅ User can select demographic variables
- ✅ User can assign semantic names
- ✅ User can create custom ranks
- ✅ Rank validation works
- ✅ Distribution preview accurate
- ✅ Configuration saved to database
- ✅ Can proceed to analysis

---

**Status:** Ready for Implementation  
**Priority:** High  
**Dependencies:** Phase 2 & 3 (Complete)

