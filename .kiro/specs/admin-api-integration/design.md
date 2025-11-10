# Design Document: Admin API Integration

## Overview

This design implements the missing Next.js API routes that connect the existing admin UI to the Supabase database. The admin pages and database schema already exist, but the API layer is completely missing. This implementation focuses on creating RESTful API endpoints for user management with proper authentication, authorization, and error handling.

### Current State
- ✅ Database schema complete (profiles, permissions tables with RLS)
- ✅ Admin UI pages complete (users, permissions, etc.)
- ✅ Frontend service layer exists (UserServiceClient)
- ❌ API routes missing (no `/api/admin/*` endpoints)
- ❌ Frontend-backend integration incomplete

### Goals
1. Create Next.js API routes for user management
2. Implement admin authentication middleware
3. Connect existing admin pages to new APIs
4. Ensure proper error handling and validation
5. Maintain security with RLS policies

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Admin UI Layer                          │
│  (frontend/src/app/(dashboard)/admin/users/page.tsx)       │
│                                                             │
│  - User list display                                        │
│  - Search & filters                                         │
│  - Role management UI                                       │
│  - Bulk actions                                             │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   │ Uses UserServiceClient
                   │
┌──────────────────▼──────────────────────────────────────────┐
│              Service Layer (Client)                         │
│     (frontend/src/services/user.service.client.ts)         │
│                                                             │
│  - getUsers(filters)                                        │
│  - getUserById(id)                                          │
│  - updateUserRole(id, role)                                 │
│  - toggleUserStatus(id, active)                             │
│  - bulkAction(ids, action)                                  │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   │ HTTP Requests
                   │
┌──────────────────▼──────────────────────────────────────────┐
│                  API Routes Layer                           │
│           (frontend/src/app/api/admin/*)                    │
│                                                             │
│  GET    /api/admin/users                                    │
│  GET    /api/admin/users/[id]                               │
│  PATCH  /api/admin/users/[id]                               │
│  DELETE /api/admin/users/[id]                               │
│  PATCH  /api/admin/users/[id]/role                          │
│                                                             │
│  [Admin Auth Middleware]                                    │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   │ Supabase Server Client
                   │
┌──────────────────▼──────────────────────────────────────────┐
│              Supabase Database                              │
│                                                             │
│  Tables:                                                    │
│  - profiles (users with roles)                              │
│  - permissions (granular permissions)                       │
│                                                             │
│  RLS Policies:                                              │
│  - Admin can view all profiles                              │
│  - Admin can update any profile                             │
│  - Users can view own profile                               │
│                                                             │
│  Helper Functions:                                          │
│  - is_admin(user_id)                                        │
│  - get_user_role(user_id)                                   │
│  - has_permission(user_id, permission)                      │
└─────────────────────────────────────────────────────────────┘
```

### Request Flow

```
User Action (UI) 
  → UserServiceClient method call
    → HTTP Request to API route
      → Admin Auth Middleware (verify session + admin role)
        → Supabase Server Client query
          → RLS Policy check
            → Database operation
              → Response back through layers
```

## Components and Interfaces

### 1. API Routes Structure

```
frontend/src/app/api/admin/
├── users/
│   ├── route.ts                    # GET /api/admin/users (list)
│   └── [id]/
│       ├── route.ts                # GET, PATCH, DELETE /api/admin/users/[id]
│       └── role/
│           └── route.ts            # PATCH /api/admin/users/[id]/role
└── middleware/
    └── admin-auth.ts               # Shared admin authentication logic
```

### 2. Admin Authentication Middleware

**File:** `frontend/src/app/api/admin/middleware/admin-auth.ts`

```typescript
interface AdminAuthResult {
  success: boolean
  user?: {
    id: string
    email: string
    role: string
  }
  error?: string
  statusCode?: number
}

async function verifyAdminAuth(): Promise<AdminAuthResult>
```

**Responsibilities:**
- Verify Supabase session exists
- Check user has admin or super_admin role
- Return user info or error response
- Use RLS helper function `is_admin(user_id)`

**Error Cases:**
- 401: No session or invalid token
- 403: User authenticated but not admin
- 500: Database error checking role

### 3. API Route: List Users

**Endpoint:** `GET /api/admin/users`

**Query Parameters:**
```typescript
{
  page?: number          // Default: 0
  limit?: number         // Default: 20, Max: 100
  search?: string        // Search in email, full_name, institution
  role?: UserRole        // Filter by role
  subscription_type?: string
  is_active?: boolean
  sort_by?: string       // Default: 'created_at'
  sort_order?: 'asc' | 'desc'  // Default: 'desc'
}
```

**Response:**
```typescript
{
  success: true,
  data: {
    users: UserProfile[],
    total: number,
    page: number,
    limit: number,
    total_pages: number
  }
}
```

**Implementation Details:**
- Use Supabase `.select('*', { count: 'exact' })`
- Apply filters with `.or()` for search
- Use `.range()` for pagination
- RLS automatically filters based on admin role
- Validate pagination params (max limit: 100)

### 4. API Route: Get User Details

**Endpoint:** `GET /api/admin/users/[id]`

**Response:**
```typescript
{
  success: true,
  data: {
    user: UserProfile
  }
}
```

**Error Cases:**
- 404: User not found
- 403: Not admin
- 401: Not authenticated

### 5. API Route: Update User Role

**Endpoint:** `PATCH /api/admin/users/[id]/role`

**Request Body:**
```typescript
{
  role: 'user' | 'moderator' | 'admin' | 'super_admin'
}
```

**Response:**
```typescript
{
  success: true,
  data: {
    user: UserProfile
  }
}
```

**Validation:**
- Role must be one of valid values
- Cannot change own role (prevent lockout)
- Check constraint in database enforces valid roles

**Implementation:**
```typescript
// Prevent self-role-change
if (userId === currentUser.id) {
  return error 400: "Cannot change your own role"
}

// Update with validation
await supabase
  .from('profiles')
  .update({ role: newRole, updated_at: new Date().toISOString() })
  .eq('id', userId)
```

### 6. API Route: Delete User

**Endpoint:** `DELETE /api/admin/users/[id]`

**Response:**
```typescript
{
  success: true,
  message: "User deleted successfully"
}
```

**Implementation:**
- Soft delete: Set `is_active = false` and `status = 'deleted'`
- Prevent self-deletion
- Return 204 No Content on success

### 7. API Route: Update User Profile

**Endpoint:** `PATCH /api/admin/users/[id]`

**Request Body:**
```typescript
{
  full_name?: string
  institution?: string
  orcid_id?: string
  research_domains?: string[]
  subscription_type?: 'free' | 'premium' | 'institutional'
  is_active?: boolean
}
```

**Validation:**
- ORCID format: `^\d{4}-\d{4}-\d{4}-\d{3}[0-9X]$`
- Subscription type must be valid enum
- Cannot update: id, email, created_at

## Data Models

### UserProfile (from database)

```typescript
interface UserProfile {
  id: string                    // UUID, references auth.users
  email: string                 // Unique, not null
  full_name: string | null
  avatar_url: string | null
  institution: string | null
  orcid_id: string | null       // Format: 0000-0000-0000-000X
  research_domains: string[] | null
  role: 'user' | 'moderator' | 'admin' | 'super_admin'
  subscription_type: 'free' | 'premium' | 'institutional'
  is_active: boolean            // Default: true
  status: string | null         // 'active', 'suspended', 'deleted'
  created_at: string            // ISO timestamp
  updated_at: string            // ISO timestamp
  last_login_at: string | null
}
```

### API Response Formats

**Success Response:**
```typescript
{
  success: true,
  data: T,
  metadata?: {
    total?: number,
    page?: number,
    limit?: number,
    total_pages?: number
  }
}
```

**Error Response:**
```typescript
{
  success: false,
  error: string,
  details?: any
}
```

## Error Handling

### Error Hierarchy

```
API Route Error Handler
  ├─ Authentication Errors (401)
  │   ├─ No session
  │   └─ Invalid token
  │
  ├─ Authorization Errors (403)
  │   ├─ Not admin
  │   └─ Insufficient permissions
  │
  ├─ Validation Errors (400)
  │   ├─ Invalid role value
  │   ├─ Invalid ORCID format
  │   ├─ Missing required fields
  │   └─ Cannot modify own role/status
  │
  ├─ Not Found Errors (404)
  │   └─ User not found
  │
  └─ Server Errors (500)
      ├─ Database connection error
      ├─ Supabase client error
      └─ Unexpected errors
```

### Error Response Format

```typescript
function handleApiError(error: unknown): NextResponse {
  // Log error for monitoring
  console.error('[Admin API Error]', error)
  
  // Parse error type
  if (error instanceof ValidationError) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    )
  }
  
  if (error instanceof AuthError) {
    return NextResponse.json(
      { success: false, error: 'Authentication required' },
      { status: 401 }
    )
  }
  
  // Default to 500
  return NextResponse.json(
    { success: false, error: 'Internal server error' },
    { status: 500 }
  )
}
```

### Logging Strategy

```typescript
// Log all admin actions
interface AdminActionLog {
  timestamp: string
  admin_user_id: string
  admin_email: string
  action: string
  target_user_id?: string
  changes?: Record<string, any>
  ip_address?: string
  user_agent?: string
}

// Log to console (can be extended to external service)
function logAdminAction(log: AdminActionLog) {
  console.log('[ADMIN ACTION]', JSON.stringify(log))
}
```

## Testing Strategy

### Unit Tests (Optional)

**Test Files:**
- `frontend/src/app/api/admin/users/route.test.ts`
- `frontend/src/app/api/admin/middleware/admin-auth.test.ts`

**Test Cases:**
1. Admin auth middleware
   - ✓ Allows admin users
   - ✓ Blocks non-admin users
   - ✓ Blocks unauthenticated requests

2. List users endpoint
   - ✓ Returns paginated users
   - ✓ Applies search filter
   - ✓ Applies role filter
   - ✓ Validates pagination params

3. Update role endpoint
   - ✓ Updates user role successfully
   - ✓ Validates role value
   - ✓ Prevents self-role-change
   - ✓ Returns updated user

4. Delete user endpoint
   - ✓ Soft deletes user
   - ✓ Prevents self-deletion
   - ✓ Returns 204 on success

### Integration Tests (Manual)

**Test Scenarios:**
1. **Admin Login Flow**
   - Login as admin user
   - Navigate to /admin/users
   - Verify users list loads

2. **User Search**
   - Enter search term
   - Verify filtered results
   - Clear search, verify all users return

3. **Role Management**
   - Select user
   - Change role via dropdown
   - Verify role updates in UI
   - Refresh page, verify persistence

4. **User Status Toggle**
   - Click "Suspend" on active user
   - Verify status changes to suspended
   - Click "Activate" on suspended user
   - Verify status changes to active

5. **Bulk Actions**
   - Select multiple users
   - Click bulk action (activate/suspend)
   - Verify all selected users updated

6. **Error Handling**
   - Logout, try to access /admin/users
   - Verify redirect to login
   - Login as non-admin
   - Verify 403 error or redirect

### API Testing with curl

```bash
# Test list users (requires auth cookie)
curl -X GET 'http://localhost:3000/api/admin/users?page=0&limit=10' \
  -H 'Cookie: sb-access-token=...'

# Test update role
curl -X PATCH 'http://localhost:3000/api/admin/users/[id]/role' \
  -H 'Content-Type: application/json' \
  -H 'Cookie: sb-access-token=...' \
  -d '{"role": "moderator"}'

# Test delete user
curl -X DELETE 'http://localhost:3000/api/admin/users/[id]' \
  -H 'Cookie: sb-access-token=...'
```

## Security Considerations

### 1. Authentication & Authorization

- **Session Verification:** Every API route checks Supabase session
- **Role Verification:** Middleware verifies admin role using `is_admin()` function
- **RLS Enforcement:** Database-level security with Row Level Security policies
- **No Token Exposure:** Use HTTP-only cookies for session tokens

### 2. Input Validation

- **Role Values:** Whitelist valid roles
- **ORCID Format:** Regex validation for ORCID IDs
- **Pagination Limits:** Max limit of 100 to prevent abuse
- **SQL Injection:** Supabase client handles parameterization

### 3. Self-Protection

- **Cannot Change Own Role:** Prevents admin lockout
- **Cannot Delete Self:** Prevents admin lockout
- **Audit Logging:** Log all admin actions for accountability

### 4. Rate Limiting (Future Enhancement)

```typescript
// Can be added later
import { rateLimit } from '@/lib/rate-limit'

const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500,
})

// In API route
await limiter.check(request, 10, 'ADMIN_API') // 10 requests per minute
```

## Performance Considerations

### 1. Database Queries

- **Indexes:** Already exist on profiles table
  - `idx_profiles_role`
  - `idx_profiles_is_active`
  - `idx_profiles_institution`
  
- **Pagination:** Use `.range()` for efficient pagination
- **Count Queries:** Use `{ count: 'exact' }` only when needed
- **Select Specific Columns:** Can optimize by selecting only needed fields

### 2. Caching Strategy (Future)

```typescript
// Can add caching for user list
import { cache } from 'react'

export const getCachedUsers = cache(async (filters) => {
  // Cache for 30 seconds
  return await getUsers(filters)
})
```

### 3. Response Size

- **Pagination:** Default 20 users per page
- **Max Limit:** 100 users per request
- **Field Selection:** Return all fields (can optimize later)

## Frontend Integration

### Update UserServiceClient

The existing `UserServiceClient` already has all methods implemented. It currently calls Supabase directly from the client. We need to update it to call our new API routes instead.

**Changes Required:**

```typescript
// Before (direct Supabase call)
async getUsers(filters: UserFilters = {}): Promise<UserListResponse> {
  const query = this.supabase.from('profiles').select('*')
  // ... build query
}

// After (API call)
async getUsers(filters: UserFilters = {}): Promise<UserListResponse> {
  const params = new URLSearchParams()
  if (filters.page) params.set('page', filters.page.toString())
  if (filters.limit) params.set('limit', filters.limit.toString())
  // ... add other params
  
  const response = await fetch(`/api/admin/users?${params}`)
  if (!response.ok) {
    throw new Error('Failed to fetch users')
  }
  
  const result = await response.json()
  return result.data
}
```

### No Changes to UI Components

The admin pages (`frontend/src/app/(dashboard)/admin/users/page.tsx`) already use `UserServiceClient`, so no changes needed once the service is updated to call APIs.

## Deployment Considerations

### Environment Variables

Required environment variables (already configured):
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
```

### Database Migrations

No new migrations needed. The schema already exists:
- ✅ `20241110_admin_system_complete.sql` already applied

### Verification Steps

1. **Database Check:**
   ```sql
   -- Verify admin user exists
   SELECT id, email, role FROM profiles WHERE role IN ('admin', 'super_admin');
   
   -- Verify RLS policies
   SELECT * FROM pg_policies WHERE tablename = 'profiles';
   ```

2. **API Health Check:**
   ```bash
   # Test API is accessible
   curl http://localhost:3000/api/admin/users
   # Should return 401 if not authenticated
   ```

3. **Frontend Check:**
   - Login as admin
   - Navigate to /admin/users
   - Verify users load
   - Test role change
   - Test user suspension

## Implementation Phases

### Phase 1: Core API Routes (Priority 1)
1. Create admin auth middleware
2. Implement GET /api/admin/users (list)
3. Implement PATCH /api/admin/users/[id]/role
4. Test with existing UI

### Phase 2: Additional Operations (Priority 2)
1. Implement GET /api/admin/users/[id] (details)
2. Implement PATCH /api/admin/users/[id] (update)
3. Implement DELETE /api/admin/users/[id]
4. Update UserServiceClient to use APIs

### Phase 3: Polish & Testing (Priority 3)
1. Add comprehensive error handling
2. Add admin action logging
3. Manual integration testing
4. Performance optimization

## Success Criteria

✅ **Functional Requirements:**
- Admin can view paginated list of users
- Admin can search and filter users
- Admin can update user roles
- Admin can activate/suspend users
- Non-admin users cannot access admin APIs
- Unauthenticated requests are rejected

✅ **Technical Requirements:**
- All API routes return consistent JSON format
- Proper HTTP status codes used
- Error messages are descriptive
- RLS policies enforced at database level
- No sensitive data exposed in errors

✅ **User Experience:**
- Admin pages load real data from database
- Loading states shown during API calls
- Error messages displayed to user
- Success confirmations shown
- No breaking changes to existing UI

## Future Enhancements

1. **Audit Trail:**
   - Create `admin_actions` table
   - Log all admin operations
   - Add audit log viewer page

2. **Bulk Operations:**
   - Optimize bulk actions with batch updates
   - Add progress indicators
   - Support undo functionality

3. **Advanced Filtering:**
   - Date range filters
   - Multiple role selection
   - Saved filter presets

4. **Export Functionality:**
   - Export user list to CSV
   - Export filtered results
   - Schedule automated reports

5. **Real-time Updates:**
   - Use Supabase Realtime for live updates
   - Show when other admins are viewing/editing
   - Conflict resolution for concurrent edits
