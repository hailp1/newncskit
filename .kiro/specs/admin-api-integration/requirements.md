# Requirements Document

## Introduction

This feature implements the missing Next.js API routes and frontend-backend integration for the admin system. The database schema and UI components already exist, but the APIs connecting them are missing. This spec focuses on creating the REST API endpoints for user management and connecting the existing admin pages to these APIs.

## Glossary

- **Admin System**: The administrative interface for managing users, roles, and permissions
- **Next.js API Routes**: Server-side API endpoints in the Next.js application located in `frontend/src/app/api/`
- **Supabase Client**: The database client used to interact with PostgreSQL database
- **Admin User**: A user with the 'admin' role who can manage other users
- **Role**: A user's permission level (admin, moderator, user)
- **RLS Policies**: Row Level Security policies that control database access

## Requirements

### Requirement 1: User List API

**User Story:** As an admin user, I want to retrieve a paginated list of all users, so that I can view and manage system users.

#### Acceptance Criteria

1. WHEN an authenticated admin requests GET /api/admin/users, THE Admin System SHALL return a paginated list of users with their profiles
2. WHEN the request includes search query parameters, THE Admin System SHALL filter users by email or display name
3. WHEN the request includes pagination parameters (page, limit), THE Admin System SHALL return the specified page of results
4. IF the requesting user is not an admin, THEN THE Admin System SHALL return a 403 Forbidden error
5. THE Admin System SHALL include total count, current page, and total pages in the response metadata

### Requirement 2: User Details API

**User Story:** As an admin user, I want to retrieve detailed information about a specific user, so that I can review their profile and permissions.

#### Acceptance Criteria

1. WHEN an authenticated admin requests GET /api/admin/users/[id], THE Admin System SHALL return the complete user profile
2. THE Admin System SHALL include the user's role, permissions, and metadata in the response
3. IF the user ID does not exist, THEN THE Admin System SHALL return a 404 Not Found error
4. IF the requesting user is not an admin, THEN THE Admin System SHALL return a 403 Forbidden error

### Requirement 3: User Role Update API

**User Story:** As an admin user, I want to update a user's role, so that I can grant or revoke administrative privileges.

#### Acceptance Criteria

1. WHEN an authenticated admin requests PATCH /api/admin/users/[id]/role with a valid role, THE Admin System SHALL update the user's role in the database
2. THE Admin System SHALL validate that the role is one of: 'admin', 'moderator', 'user'
3. WHEN the role is updated successfully, THE Admin System SHALL return the updated user profile
4. IF the requesting user is not an admin, THEN THE Admin System SHALL return a 403 Forbidden error
5. IF the role value is invalid, THEN THE Admin System SHALL return a 400 Bad Request error

### Requirement 4: User Deletion API

**User Story:** As an admin user, I want to delete a user account, so that I can remove users who violate policies or are no longer needed.

#### Acceptance Criteria

1. WHEN an authenticated admin requests DELETE /api/admin/users/[id], THE Admin System SHALL soft-delete the user by setting deleted_at timestamp
2. THE Admin System SHALL prevent deletion of the requesting admin's own account
3. WHEN deletion is successful, THE Admin System SHALL return a 204 No Content response
4. IF the requesting user is not an admin, THEN THE Admin System SHALL return a 403 Forbidden error
5. IF attempting to delete own account, THEN THE Admin System SHALL return a 400 Bad Request error

### Requirement 5: Admin Authentication Middleware

**User Story:** As a system administrator, I want all admin API routes to be protected by authentication and authorization, so that only authorized admins can access them.

#### Acceptance Criteria

1. THE Admin System SHALL verify the user's session token before processing any admin API request
2. THE Admin System SHALL check that the authenticated user has the 'admin' role
3. IF no valid session exists, THEN THE Admin System SHALL return a 401 Unauthorized error
4. IF the user is authenticated but not an admin, THEN THE Admin System SHALL return a 403 Forbidden error
5. THE Admin System SHALL use Supabase RLS policies to enforce database-level security

### Requirement 6: Frontend Admin Pages Integration

**User Story:** As an admin user, I want the admin pages to load real data from the database, so that I can manage actual users instead of seeing mock data.

#### Acceptance Criteria

1. WHEN the admin users page loads, THE Admin System SHALL fetch users from GET /api/admin/users
2. WHEN an admin searches for users, THE Admin System SHALL send the search query to the API
3. WHEN an admin changes a user's role, THE Admin System SHALL call PATCH /api/admin/users/[id]/role
4. WHEN an admin deletes a user, THE Admin System SHALL call DELETE /api/admin/users/[id]
5. WHILE API requests are in progress, THE Admin System SHALL display loading indicators
6. IF an API request fails, THEN THE Admin System SHALL display an error message to the user

### Requirement 7: Error Handling and Validation

**User Story:** As a developer, I want comprehensive error handling in the admin APIs, so that issues are properly reported and logged.

#### Acceptance Criteria

1. THE Admin System SHALL validate all request parameters and return descriptive error messages
2. THE Admin System SHALL log all admin actions with user ID, action type, and timestamp
3. WHEN a database error occurs, THE Admin System SHALL return a 500 Internal Server Error with a generic message
4. THE Admin System SHALL not expose sensitive database information in error responses
5. THE Admin System SHALL handle Supabase client errors gracefully

### Requirement 8: API Response Format

**User Story:** As a frontend developer, I want consistent API response formats, so that I can reliably parse and display data.

#### Acceptance Criteria

1. THE Admin System SHALL return all successful responses in JSON format
2. THE Admin System SHALL include a 'data' field containing the response payload
3. WHEN returning lists, THE Admin System SHALL include pagination metadata (total, page, limit, totalPages)
4. WHEN returning errors, THE Admin System SHALL include an 'error' field with a descriptive message
5. THE Admin System SHALL use standard HTTP status codes for all responses
