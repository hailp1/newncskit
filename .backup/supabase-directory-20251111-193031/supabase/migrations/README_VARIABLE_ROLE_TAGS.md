# Variable Role Tags Migration

## Overview

This migration adds support for variable role tagging to enable automatic configuration of advanced statistical analyses (Regression, SEM, Mediation, etc.).

## Migration File

- **File**: `20241110_variable_role_tags.sql`
- **Date**: 2024-11-10
- **Purpose**: Add role tagging infrastructure for variables and groups

## What This Migration Does

### 1. Creates `variable_role_tags` Table

Stores role assignments for variables and groups with the following columns:

- `id` - Primary key (UUID)
- `project_id` - Reference to analysis project (UUID, NOT NULL)
- `variable_id` - Reference to variable (UUID, nullable)
- `group_id` - Reference to variable group (UUID, nullable)
- `role` - Role type (VARCHAR, CHECK constraint)
- `is_user_assigned` - Whether user manually assigned (BOOLEAN)
- `confidence` - Confidence score for suggestions (NUMERIC 0-1)
- `reason` - Explanation for suggestion (TEXT)
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

**Supported Roles:**
- `none` - No role assigned
- `independent` - Independent Variable (IV/Predictor)
- `dependent` - Dependent Variable (DV/Outcome)
- `mediator` - Mediator Variable
- `moderator` - Moderator Variable
- `control` - Control Variable
- `latent` - Latent Variable (for CFA/SEM)

**Constraints:**
- XOR constraint: Exactly one of `variable_id` or `group_id` must be set
- Unique constraint: One role per variable per project
- Unique constraint: One role per group per project

### 2. Creates Indexes

- `idx_role_tags_project` - Fast project-level queries
- `idx_role_tags_variable` - Fast variable lookups (partial index)
- `idx_role_tags_group` - Fast group lookups (partial index)
- `idx_role_tags_role` - Filter by role type
- `idx_role_tags_project_role` - Composite index for project + role queries

### 3. Updates `variable_groups` Table

Adds `default_role` column:
- Type: VARCHAR(20)
- Default: 'none'
- CHECK constraint: Same role values as above
- Purpose: Default role applied to all variables in the group

### 4. Creates Helper Functions

#### `get_project_role_tags(project_uuid UUID)`
Returns all role tags for a project with entity details.

**Returns:**
- `id` - Role tag ID
- `entity_type` - 'variable' or 'group'
- `entity_id` - Variable or group ID
- `entity_name` - Variable column name or group name
- `role` - Assigned role
- `is_user_assigned` - Manual vs suggested
- `confidence` - Suggestion confidence
- `reason` - Suggestion reason

#### `get_variables_by_role(project_uuid UUID, role_filter VARCHAR)`
Returns all variables with a specific role for a project.

**Returns:**
- `variable_id` - Variable ID
- `column_name` - Variable column name
- `display_name` - Variable display name
- `is_user_assigned` - Manual vs suggested
- `confidence` - Suggestion confidence

#### `validate_role_configuration(project_uuid UUID, analysis_type VARCHAR)`
Validates role configuration for a specific analysis type.

**Supported Analysis Types:**
- `regression` - Requires 1 DV, ≥1 IV
- `sem` / `cfa` - Requires ≥2 latent variables
- `mediation` - Requires ≥1 IV, ≥1 DV, ≥1 Mediator

**Returns:**
- `is_valid` - Whether configuration is valid
- `error_messages` - Array of error messages
- `warning_messages` - Array of warning messages

#### `update_role_tag_timestamp()`
Trigger function to update `updated_at` timestamp.

### 5. Creates Triggers

- `update_variable_role_tags_timestamp` - Updates timestamp on UPDATE

### 6. Enables Row Level Security (RLS)

Four policies for `variable_role_tags`:
- Users can view role tags of their projects (SELECT)
- Users can create role tags for their projects (INSERT)
- Users can update role tags of their projects (UPDATE)
- Users can delete role tags of their projects (DELETE)

All policies check that the user owns the project via `auth.uid()`.

## How to Apply This Migration

### Option 1: Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy the contents of `20241110_variable_role_tags.sql`
5. Paste into the editor
6. Click **Run** or press `Ctrl+Enter`
7. Verify success messages in the output

### Option 2: Supabase CLI

```bash
# Navigate to project root
cd /path/to/project

# Apply migration
supabase db push

# Or apply specific migration
supabase migration up --file supabase/migrations/20241110_variable_role_tags.sql
```

### Option 3: Direct PostgreSQL Connection

```bash
# Connect to your database
psql "postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/postgres"

# Run migration
\i supabase/migrations/20241110_variable_role_tags.sql

# Verify
\dt variable_role_tags
\d variable_role_tags
```

## Verification

After applying the migration, verify it was successful:

```sql
-- Check table exists
SELECT EXISTS (
  SELECT 1 FROM information_schema.tables 
  WHERE table_name = 'variable_role_tags'
);

-- Check indexes
SELECT indexname FROM pg_indexes 
WHERE tablename = 'variable_role_tags';

-- Check column added to variable_groups
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'variable_groups' 
AND column_name = 'default_role';

-- Check functions
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name LIKE '%role%';

-- Check RLS policies
SELECT policyname 
FROM pg_policies 
WHERE tablename = 'variable_role_tags';
```

## Usage Examples

### Insert a Role Tag

```sql
-- Assign IV role to a variable
INSERT INTO variable_role_tags (
  project_id, 
  variable_id, 
  role, 
  is_user_assigned, 
  confidence, 
  reason
)
VALUES (
  'project-uuid-here',
  'variable-uuid-here',
  'independent',
  TRUE,
  NULL,
  'User manually assigned'
);
```

### Query Role Tags

```sql
-- Get all role tags for a project
SELECT * FROM get_project_role_tags('project-uuid-here');

-- Get all IVs for a project
SELECT * FROM get_variables_by_role('project-uuid-here', 'independent');

-- Validate configuration for regression
SELECT * FROM validate_role_configuration('project-uuid-here', 'regression');
```

### Update a Role Tag

```sql
-- Change role from IV to DV
UPDATE variable_role_tags
SET role = 'dependent', is_user_assigned = TRUE
WHERE project_id = 'project-uuid-here'
AND variable_id = 'variable-uuid-here';
```

### Delete Role Tags

```sql
-- Remove all role tags for a project
DELETE FROM variable_role_tags
WHERE project_id = 'project-uuid-here';
```

## Rollback

If you need to rollback this migration:

```sql
-- Drop RLS policies
DROP POLICY IF EXISTS "Users can view role tags of their projects" ON variable_role_tags;
DROP POLICY IF EXISTS "Users can create role tags for their projects" ON variable_role_tags;
DROP POLICY IF EXISTS "Users can update role tags of their projects" ON variable_role_tags;
DROP POLICY IF EXISTS "Users can delete role tags of their projects" ON variable_role_tags;

-- Drop triggers
DROP TRIGGER IF EXISTS update_variable_role_tags_timestamp ON variable_role_tags;

-- Drop functions
DROP FUNCTION IF EXISTS get_project_role_tags(UUID);
DROP FUNCTION IF EXISTS get_variables_by_role(UUID, VARCHAR);
DROP FUNCTION IF EXISTS validate_role_configuration(UUID, VARCHAR);
DROP FUNCTION IF EXISTS update_role_tag_timestamp();

-- Remove column from variable_groups
ALTER TABLE variable_groups DROP COLUMN IF EXISTS default_role;

-- Drop table (cascades to indexes)
DROP TABLE IF EXISTS variable_role_tags CASCADE;
```

## Dependencies

This migration depends on the following tables existing:
- `analysis_projects`
- `analysis_variables`
- `variable_groups`

If these tables don't exist, the foreign key constraints will be skipped (handled gracefully in the migration).

## Related Files

- **Migration**: `supabase/migrations/20241110_variable_role_tags.sql`
- **Frontend Types**: `frontend/src/types/analysis.ts`
- **Services**: 
  - `frontend/src/services/role-suggestion.service.ts`
  - `frontend/src/services/role-validation.service.ts`
- **Components**:
  - `frontend/src/components/analysis/RoleTagSelector.tsx`
  - `frontend/src/components/analysis/ModelPreview.tsx`

## Support

For issues or questions:
1. Check the verification queries above
2. Review the migration file for detailed comments
3. Check Supabase logs for error messages
4. Ensure all dependent tables exist before applying

## Changelog

- **2024-11-10**: Initial migration created
  - Added `variable_role_tags` table
  - Added 5 indexes for performance
  - Added `default_role` column to `variable_groups`
  - Added 4 helper functions
  - Added 1 trigger
  - Added 4 RLS policies
