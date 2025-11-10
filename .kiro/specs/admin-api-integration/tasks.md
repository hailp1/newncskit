# Implementation Plan

## Overview
This implementation plan converts the admin API integration design into actionable coding tasks. Each task builds incrementally on previous tasks, focusing on creating the missing API routes and connecting the existing admin UI to the database.

---

## Phase 1: Core Infrastructure

- [ ] 1. Create admin authentication middleware
  - Create `frontend/src/app/api/admin/middleware/admin-auth.ts`
  - Implement `verifyAdminAuth()` function to check session and admin role
  - Use Supabase server client to verify session
  - Query profiles table to check if user has 'admin' or 'super_admin' role
  - Return structured result with user info or error details
  - Handle edge cases: no session, invalid token, non-admin user
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 2. Create user list API endpoint
  - Create `frontend/src/app/api/admin/users/route.ts`
  - Implement GET handler for listing users with pagination
  - Parse query parameters: page, limit, search, role, subscription_type, is_active, sort_by, sort_order
  - Validate pagination parameters (max limit: 100)
  - Use admin auth middleware to verify permissions
  - Build Supabase query with filters and pagination
  - Apply search filter using `.or()` for email, full_name, institution
  - Return paginated response with total count and metadata
  - Add error handling for database errors
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [ ] 3. Create user role update API endpoint
  - Create `frontend/src/app/api/admin/users/[id]/role/route.ts`
  - Implement PATCH handler for updating user roles
  - Parse dynamic route parameter [id]
  - Validate role value against allowed roles: 'user', 'moderator', 'admin', 'super_admin'
  - Use admin auth middleware to verify permissions
  - Prevent admin from changing their own role (self-protection)
  - Update user role in profiles table with updated_at timestamp
  - Return updated user profile
  - Add error handling for invalid role, self-modification, user not found
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

---

## Phase 2: Additional User Management APIs

- [ ] 4. Create user details API endpoint
  - Create GET handler in `frontend/src/app/api/admin/users/[id]/route.ts`
  - Parse dynamic route parameter [id]
  - Use admin auth middleware to verify permissions
  - Query single user from profiles table by ID
  - Return complete user profile with all fields
  - Handle user not found error (404)
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [ ] 5. Create user update API endpoint
  - Add PATCH handler in `frontend/src/app/api/admin/users/[id]/route.ts`
  - Parse request body for updatable fields: full_name, institution, orcid_id, research_domains, subscription_type, is_active
  - Validate ORCID format if provided: `^\d{4}-\d{4}-\d{4}-\d{3}[0-9X]$`
  - Validate subscription_type against allowed values
  - Use admin auth middleware to verify permissions
  - Update user profile in database with validated data
  - Prevent updating protected fields: id, email, created_at
  - Return updated user profile
  - _Requirements: 3.1, 3.2, 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 6. Create user deletion API endpoint
  - Add DELETE handler in `frontend/src/app/api/admin/users/[id]/route.ts`
  - Parse dynamic route parameter [id]
  - Use admin auth middleware to verify permissions
  - Prevent admin from deleting their own account (self-protection)
  - Perform soft delete: set is_active=false and status='deleted'
  - Return 204 No Content on success
  - Handle errors: self-deletion attempt, user not found
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

---

## Phase 3: Frontend Integration

- [ ] 7. Update UserServiceClient to use API routes
  - Modify `frontend/src/services/user.service.client.ts`
  - Replace direct Supabase calls with fetch() calls to API routes
  - Update `getUsers()` to call GET /api/admin/users with query params
  - Update `getUserById()` to call GET /api/admin/users/[id]
  - Update `updateUser()` to call PATCH /api/admin/users/[id]
  - Update `updateUserRole()` to call PATCH /api/admin/users/[id]/role
  - Update `toggleUserStatus()` to call PATCH /api/admin/users/[id] with is_active
  - Update `bulkAction()` to make multiple API calls for bulk operations
  - Maintain existing error handling and retry logic
  - Parse API responses and extract data from response.data
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

- [ ] 8. Add comprehensive error handling
  - Create error handler utility in API routes
  - Implement consistent error response format with success flag and error message
  - Map different error types to appropriate HTTP status codes
  - Add validation error handling (400)
  - Add authentication error handling (401)
  - Add authorization error handling (403)
  - Add not found error handling (404)
  - Add server error handling (500)
  - Log errors to console with context information
  - Ensure no sensitive data exposed in error responses
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

---

## Phase 4: Testing and Validation

- [ ] 9. Test API endpoints manually
  - Start development server
  - Login as admin user to get session cookie
  - Test GET /api/admin/users with various filters and pagination
  - Test GET /api/admin/users/[id] for specific user
  - Test PATCH /api/admin/users/[id]/role to change user role
  - Test PATCH /api/admin/users/[id] to update user profile
  - Test DELETE /api/admin/users/[id] to soft delete user
  - Verify error responses for invalid inputs
  - Verify authentication/authorization checks work
  - Test with non-admin user to verify 403 errors
  - Test without authentication to verify 401 errors
  - _Requirements: All requirements_

- [ ] 10. Test admin UI integration end-to-end
  - Login as admin user
  - Navigate to /admin/users page
  - Verify user list loads from database
  - Test search functionality with various queries
  - Test filter dropdowns (role, subscription, status)
  - Test pagination (next/previous buttons)
  - Test role change via dropdown for a user
  - Test activate/suspend buttons for individual users
  - Test bulk selection and bulk actions
  - Verify loading states display during API calls
  - Verify success messages display after actions
  - Verify error messages display on failures
  - Refresh page and verify data persists
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

---

## Phase 5: Polish and Documentation

- [ ] 11. Add API response format consistency
  - Ensure all success responses include `success: true` and `data` field
  - Ensure all error responses include `success: false` and `error` field
  - Add pagination metadata to list responses: total, page, limit, total_pages
  - Use standard HTTP status codes consistently across all endpoints
  - Format timestamps in ISO 8601 format
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ] 12. Add admin action logging
  - Create logging utility function for admin actions
  - Log all admin operations with timestamp, admin user ID, action type, target user ID
  - Include IP address and user agent in logs if available
  - Log to console with structured format for easy parsing
  - Add logging to all API endpoints: list, view, update, delete, role change
  - Ensure logs don't contain sensitive information
  - _Requirements: 7.2_

---

## Success Criteria Checklist

After completing all tasks, verify:

- [ ] Admin can view paginated list of users
- [ ] Admin can search users by email, name, or institution
- [ ] Admin can filter users by role, subscription, and status
- [ ] Admin can update user roles via dropdown
- [ ] Admin can activate/suspend users
- [ ] Admin can delete users (soft delete)
- [ ] Non-admin users receive 403 errors on admin API calls
- [ ] Unauthenticated requests receive 401 errors
- [ ] All API responses use consistent JSON format
- [ ] Error messages are descriptive and user-friendly
- [ ] Loading states display during API operations
- [ ] Success/error messages display in UI
- [ ] Admin cannot change their own role
- [ ] Admin cannot delete their own account
- [ ] RLS policies enforce database-level security
- [ ] No sensitive data exposed in error responses

---

## Notes

- Focus on MVP functionality first (user list, role management, status toggle)
- The database schema and UI already exist, so no changes needed there
- The UserServiceClient already has the right interface, just needs to call APIs instead of direct Supabase
- RLS policies will automatically enforce security at database level
- All tasks build incrementally - complete in order for best results
