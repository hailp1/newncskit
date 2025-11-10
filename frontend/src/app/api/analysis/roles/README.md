# Variable Role Tags API

This API endpoint manages variable role tags for analysis projects.

## Endpoints

### POST /api/analysis/roles/save

Save role tags for variables in a project.

**Request Body:**
```json
{
  "projectId": "uuid-string",
  "roleTags": [
    {
      "variableId": "var-1",
      "columnName": "Satisfaction",
      "role": "dependent",
      "isUserAssigned": true,
      "confidence": 0.9,
      "reason": "Contains outcome keyword"
    },
    {
      "variableId": "var-2",
      "columnName": "Age",
      "role": "control",
      "isUserAssigned": false,
      "confidence": 0.95,
      "reason": "Demographic variable"
    }
  ]
}
```

**Valid Roles:**
- `none` - No role assigned (not stored in database)
- `independent` - Independent Variable (IV/Predictor)
- `dependent` - Dependent Variable (DV/Outcome)
- `mediator` - Mediator Variable
- `moderator` - Moderator Variable
- `control` - Control Variable
- `latent` - Latent Variable (for CFA/SEM)

**Response:**
```json
{
  "success": true,
  "message": "Successfully saved 2 role tags",
  "savedCount": 2
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Project ID is required"
}
```

### GET /api/analysis/roles/save?projectId=xxx

Retrieve saved role tags for a project.

**Query Parameters:**
- `projectId` (required) - The project UUID

**Response:**
```json
{
  "success": true,
  "roleTags": [
    {
      "variableId": "var-1",
      "columnName": "",
      "role": "dependent",
      "isUserAssigned": true,
      "confidence": 0.9,
      "reason": "Contains outcome keyword"
    }
  ],
  "count": 1
}
```

## Usage Example

```typescript
// Save role tags
const response = await fetch('/api/analysis/roles/save', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    projectId: 'my-project-id',
    roleTags: [
      {
        variableId: 'var-1',
        columnName: 'Satisfaction',
        role: 'dependent',
        isUserAssigned: true
      }
    ]
  })
});

const result = await response.json();
console.log(result.message); // "Successfully saved 1 role tags"

// Retrieve role tags
const getResponse = await fetch('/api/analysis/roles/save?projectId=my-project-id');
const data = await getResponse.json();
console.log(data.roleTags); // Array of role tags
```

## Database Schema

Role tags are stored in the `variable_role_tags` table:

```sql
CREATE TABLE variable_role_tags (
  id UUID PRIMARY KEY,
  project_id UUID NOT NULL,
  variable_id UUID,
  group_id UUID,
  role VARCHAR(20) NOT NULL,
  is_user_assigned BOOLEAN DEFAULT FALSE,
  confidence NUMERIC(3,2),
  reason TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

## Notes

- The endpoint uses a "delete and insert" strategy to ensure clean state
- Role tags with `role: 'none'` are filtered out and not stored
- Only variable-level tags are currently supported (group_id is always null)
- The endpoint validates all role values against the allowed enum
- Errors are logged to console with full details for debugging
