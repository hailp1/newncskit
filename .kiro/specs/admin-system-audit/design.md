# Design Document - Admin System Audit & Fix

## Overview

This document outlines the technical design for fixing and improving the admin system, including user management, permissions, roles, settings, and profile pages. The focus is on fixing API integration, data mapping, error handling, and UI/UX issues.

## Current Issues Identified

### 1. User Management Page
- ❌ Hardcoded API URL without environment variable fallback
- ❌ Using localStorage for auth tokens (should use Supabase client)
- ❌ No error boundary for API failures
- ❌ Mock data in some sections
- ❌ Inconsistent data mapping

### 2. Permission Management Page
- ❌ Using mock data instead of real API
- ❌ No connection to actual permission service
- ❌ Missing role-permission sync
- ❌ No cache invalidation

### 3. Settings Page
- ❌ No actual API calls for saving data
- ❌ Password change not implemented
- ❌ Research domains not persisted
- ❌ Success messages show without actual save

### 4. Profile Page
- ❌ Displays "Not specified" for all fields
- ❌ No data loading from backend
- ❌ Edit form doesn't save changes
- ❌ Missing institution and ORCID fields

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Next.js)                       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Admin      │  │  Settings    │  │   Profile    │      │
│  │   Pages      │  │    Page      │  │    Page      │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │              │
│         └──────────────────┼──────────────────┘              │
│                            │                                 │
│                   ┌────────▼────────┐                        │
│                   │  API Services   │                        │
│                   │  - User Service │                        │
│                   │  - Permission   │                        │
│                   │  - Profile      │                        │
│                   └────────┬────────┘                        │
│                            │                                 │
│                   ┌────────▼────────┐                        │
│                   │  Supabase       │                        │
│                   │  Client         │                        │
│                   └────────┬────────┘                        │
└────────────────────────────┼────────────────────────────────┘
                             │
                    ┌────────▼────────┐
                    │   Supabase      │
                    │   Backend       │
                    │   - Auth        │
                    │   - Database    │
                    │   - RLS         │
                    └─────────────────┘
```

## Data Models

### User Profile
```typescript
interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  institution: string | null;
  orcid_id: string | null;
  research_domains: string[];
  role: 'user' | 'moderator' | 'admin' | 'super_admin';
  subscription_type: 'free' | 'premium' | 'institutional';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
```

### Permission
```typescript
interface Permission {
  id: string;
  user_id: string;
  permission: string; // e.g., 'create_post', 'edit_any_post'
  granted_by: string;
  granted_at: string;
  expires_at: string | null;
}
```

### Role Permission Mapping
```typescript
interface RolePermission {
  role: UserRole;
  permissions: Permission[];
}
```

## API Services Design

### 1. User Service
```typescript
// frontend/src/services/user.service.ts
class UserService {
  // Get all users (admin only)
  async getUsers(filters?: UserFilters): Promise<User[]>
  
  // Get user by ID
  async getUserById(id: string): Promise<User>
  
  // Update user
  async updateUser(id: string, data: Partial<User>): Promise<User>
  
  // Update user role
  async updateUserRole(id: string, role: UserRole): Promise<void>
  
  // Suspend/activate user
  async toggleUserStatus(id: string, isActive: boolean): Promise<void>
  
  // Bulk actions
  async bulkAction(userIds: string[], action: string): Promise<BulkActionResult>
}
```

### 2. Permission Service (Enhanced)
```typescript
// frontend/src/services/permission.service.ts
class PermissionService {
  // Check permission (with caching)
  async hasPermission(userId: string, permission: Permission): Promise<boolean>
  
  // Get user permissions
  async getUserPermissions(userId: string): Promise<Permission[]>
  
  // Grant permission
  async grantPermission(userId: string, permission: Permission, expiresAt?: Date): Promise<void>
  
  // Revoke permission
  async revokePermission(userId: string, permission: Permission): Promise<void>
  
  // Get role permissions
  async getRolePermissions(role: UserRole): Promise<Permission[]>
  
  // Update role permissions
  async updateRolePermissions(role: UserRole, permissions: Permission[]): Promise<void>
  
  // Clear cache
  clearCache(userId: string): void
}
```

### 3. Profile Service
```typescript
// frontend/src/services/profile.service.ts
class ProfileService {
  // Get current user profile
  async getProfile(): Promise<UserProfile>
  
  // Update profile
  async updateProfile(data: Partial<UserProfile>): Promise<UserProfile>
  
  // Change password
  async changePassword(currentPassword: string, newPassword: string): Promise<void>
  
  // Upload avatar
  async uploadAvatar(file: File): Promise<string>
  
  // Delete account
  async deleteAccount(password: string): Promise<void>
}
```

## Component Design

### 1. User Management Page

**Features:**
- User list with pagination
- Search and filters
- Bulk actions
- Role management
- Status toggle
- Export to CSV

**State Management:**
```typescript
interface UserManagementState {
  users: User[];
  loading: boolean;
  error: string | null;
  filters: UserFilters;
  selectedUsers: string[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}
```

### 2. Permission Management Page

**Features:**
- Feature list
- Role-permission matrix
- Permission editor
- Usage cost configuration
- Audit log

**State Management:**
```typescript
interface PermissionManagementState {
  features: Feature[];
  rolePermissions: RolePermission[];
  selectedRole: UserRole;
  loading: boolean;
  error: string | null;
}
```

### 3. Settings Page

**Features:**
- Profile information editor
- Password change
- Research domains selector
- Account summary
- Feature availability

**State Management:**
```typescript
interface SettingsState {
  profile: UserProfile;
  loading: boolean;
  saving: boolean;
  success: boolean;
  error: string | null;
  isDirty: boolean;
}
```

### 4. Profile Page

**Features:**
- View profile information
- Edit mode toggle
- Avatar upload
- Quick actions
- Account statistics

**State Management:**
```typescript
interface ProfileState {
  profile: UserProfile;
  isEditing: boolean;
  loading: boolean;
  error: string | null;
}
```

## Error Handling Strategy

### Error Types
```typescript
enum ErrorType {
  NETWORK_ERROR = 'network_error',
  AUTH_ERROR = 'auth_error',
  VALIDATION_ERROR = 'validation_error',
  PERMISSION_ERROR = 'permission_error',
  NOT_FOUND = 'not_found',
  SERVER_ERROR = 'server_error'
}
```

### Error Handler
```typescript
class ErrorHandler {
  static handle(error: Error): UserFriendlyError {
    // Map technical errors to user-friendly messages
    // Log errors for debugging
    // Return appropriate error response
  }
  
  static getErrorMessage(error: Error): string {
    // Return Vietnamese error message
  }
  
  static shouldRetry(error: Error): boolean {
    // Determine if request should be retried
  }
}
```

## Validation Strategy

### Input Validation
```typescript
class Validator {
  static validateEmail(email: string): boolean
  static validateOrcidId(orcid: string): boolean
  static validatePassword(password: string): ValidationResult
  static sanitizeInput(input: string): string
}
```

### Validation Rules
- Email: RFC 5322 compliant
- ORCID: Format 0000-0000-0000-000X
- Password: Min 8 chars, 1 uppercase, 1 lowercase, 1 number
- Names: No special characters except hyphens and apostrophes
- Institution: Max 255 characters

## Caching Strategy

### Permission Cache
```typescript
interface PermissionCache {
  userId: string;
  permissions: Permission[];
  timestamp: number;
  ttl: number; // 5 minutes
}
```

### Cache Implementation
- Use in-memory cache for permissions
- Invalidate on permission changes
- TTL of 5 minutes
- Clear on logout

## Database Schema Updates

### profiles table
```sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS institution VARCHAR(255);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS orcid_id VARCHAR(19);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS research_domains TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_type VARCHAR(20) DEFAULT 'free';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription ON profiles(subscription_type);
CREATE INDEX IF NOT EXISTS idx_profiles_is_active ON profiles(is_active);
```

### permissions table
```sql
CREATE TABLE IF NOT EXISTS permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  permission VARCHAR(100) NOT NULL,
  granted_by UUID REFERENCES auth.users(id),
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, permission)
);

CREATE INDEX idx_permissions_user ON permissions(user_id);
CREATE INDEX idx_permissions_expires ON permissions(expires_at);
```

## Security Considerations

### Row Level Security (RLS)
```sql
-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Admins can update any profile
CREATE POLICY "Admins can update any profile" ON profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );
```

### API Security
- All admin endpoints require authentication
- Role-based access control
- Rate limiting on sensitive endpoints
- Input sanitization
- CSRF protection

## Testing Strategy

### Unit Tests
- Service methods
- Validation functions
- Error handlers
- Cache logic

### Integration Tests
- API calls
- Database operations
- Permission checks
- Role updates

### E2E Tests
- User management workflow
- Permission assignment
- Profile update
- Settings save

## Performance Optimization

### Strategies
1. **Pagination**: Load users in batches of 20
2. **Caching**: Cache permissions for 5 minutes
3. **Debouncing**: Debounce search input (300ms)
4. **Lazy Loading**: Load user details on demand
5. **Optimistic Updates**: Update UI before API response

### Metrics
- Page load time: < 2s
- API response time: < 500ms
- Search response: < 300ms
- Cache hit rate: > 80%

## Migration Plan

### Phase 1: Database Setup
1. Run migration scripts
2. Add indexes
3. Set up RLS policies
4. Seed initial data

### Phase 2: Service Layer
1. Implement UserService
2. Enhance PermissionService
3. Implement ProfileService
4. Add error handling

### Phase 3: UI Updates
1. Fix User Management page
2. Fix Permission Management page
3. Fix Settings page
4. Fix Profile page

### Phase 4: Testing & Deployment
1. Unit tests
2. Integration tests
3. E2E tests
4. Deploy to staging
5. User acceptance testing
6. Deploy to production

## Rollback Plan

If issues occur:
1. Revert database migrations
2. Restore previous code version
3. Clear permission cache
4. Notify users of temporary issues
5. Investigate and fix root cause

---

**Design Status:** ✅ Complete
**Next Step:** Create implementation tasks
