# Requirements Document - Admin System Audit & Fix

## Introduction

Rà soát và sửa lỗi toàn bộ hệ thống admin bao gồm: settings, quản lý thông tin cá nhân, phân quyền, và quản lý vai trò. Hiện tại hệ thống có nhiều vấn đề về API calls, data mapping, và UI/UX.

## Glossary

- **Admin System**: Hệ thống quản trị của NCSKit
- **User Management**: Quản lý người dùng
- **Permission System**: Hệ thống phân quyền
- **Role Management**: Quản lý vai trò
- **Settings Page**: Trang cài đặt tài khoản
- **Profile Page**: Trang thông tin cá nhân

## Requirements

### Requirement 1: Fix User Management API Integration

**User Story:** As an admin, I want the user management page to work correctly with the backend API, so that I can manage users effectively.

#### Acceptance Criteria

1. WHEN admin accesses `/admin/users`, THE Admin System SHALL fetch users from the correct API endpoint
2. THE Admin System SHALL handle API authentication using the current auth system (Supabase)
3. WHEN API call fails, THE Admin System SHALL display a user-friendly error message
4. THE Admin System SHALL support pagination for large user lists
5. WHEN filtering users, THE Admin System SHALL send correct query parameters to the API

### Requirement 2: Fix Permission Management System

**User Story:** As an admin, I want to manage user permissions and roles, so that I can control access to features.

#### Acceptance Criteria

1. WHEN admin views permissions page, THE Admin System SHALL load permissions from the database
2. THE Admin System SHALL display current role-permission mappings accurately
3. WHEN admin updates a permission, THE Admin System SHALL save changes to the database
4. THE Admin System SHALL validate permission changes before saving
5. WHEN permission is updated, THE Admin System SHALL invalidate the permission cache

### Requirement 3: Fix Settings Page Data Persistence

**User Story:** As a user, I want my settings to be saved correctly, so that my preferences are remembered.

#### Acceptance Criteria

1. WHEN user updates profile information, THE Admin System SHALL save changes to the database
2. THE Admin System SHALL validate all input fields before saving
3. WHEN save is successful, THE Admin System SHALL display a success message
4. IF save fails, THE Admin System SHALL display the specific error message
5. THE Admin System SHALL reload user data after successful save

### Requirement 4: Fix Profile Page Information Display

**User Story:** As a user, I want to see my complete profile information, so that I can verify my account details.

#### Acceptance Criteria

1. WHEN user views profile page, THE Admin System SHALL display all profile fields correctly
2. THE Admin System SHALL show institution, ORCID ID, and research domains if available
3. WHEN user has no data for a field, THE Admin System SHALL display "Not specified" instead of undefined
4. THE Admin System SHALL format dates in Vietnamese locale
5. THE Admin System SHALL display user's subscription type and status

### Requirement 5: Implement Proper Error Handling

**User Story:** As a developer, I want comprehensive error handling, so that users get helpful feedback when things go wrong.

#### Acceptance Criteria

1. WHEN an API call fails, THE Admin System SHALL log the error details
2. THE Admin System SHALL display user-friendly error messages in Vietnamese
3. WHEN network error occurs, THE Admin System SHALL suggest retry action
4. THE Admin System SHALL differentiate between client errors (4xx) and server errors (5xx)
5. WHEN authentication fails, THE Admin System SHALL redirect to login page

### Requirement 6: Fix Role Management UI

**User Story:** As an admin, I want to assign and modify user roles, so that I can manage access levels.

#### Acceptance Criteria

1. WHEN admin views user list, THE Admin System SHALL display current role for each user
2. THE Admin System SHALL provide a dropdown to change user roles
3. WHEN role is changed, THE Admin System SHALL update the database immediately
4. THE Admin System SHALL log all role changes for audit purposes
5. WHEN role change fails, THE Admin System SHALL revert the UI to previous state

### Requirement 7: Implement Data Validation

**User Story:** As a system, I want to validate all user inputs, so that data integrity is maintained.

#### Acceptance Criteria

1. THE Admin System SHALL validate email format before saving
2. THE Admin System SHALL validate ORCID ID format (0000-0000-0000-0000)
3. WHEN password is changed, THE Admin System SHALL enforce minimum length of 8 characters
4. THE Admin System SHALL prevent SQL injection and XSS attacks
5. THE Admin System SHALL sanitize all user inputs before sending to API

### Requirement 8: Fix API Client Configuration

**User Story:** As a developer, I want API calls to use the correct base URL, so that requests reach the right backend.

#### Acceptance Criteria

1. THE Admin System SHALL use environment variable for API base URL
2. WHEN environment variable is not set, THE Admin System SHALL use a sensible default
3. THE Admin System SHALL include authentication headers in all API requests
4. THE Admin System SHALL handle CORS issues gracefully
5. THE Admin System SHALL retry failed requests up to 3 times with exponential backoff

### Requirement 9: Implement Loading States

**User Story:** As a user, I want to see loading indicators, so that I know the system is processing my request.

#### Acceptance Criteria

1. WHEN data is being fetched, THE Admin System SHALL display a loading spinner
2. WHEN form is being submitted, THE Admin System SHALL disable the submit button
3. THE Admin System SHALL show skeleton loaders for list views
4. WHEN action is in progress, THE Admin System SHALL prevent duplicate submissions
5. THE Admin System SHALL show progress for long-running operations

### Requirement 10: Fix Database Schema Alignment

**User Story:** As a developer, I want frontend code to match the database schema, so that data mapping works correctly.

#### Acceptance Criteria

1. THE Admin System SHALL use correct field names from the database schema
2. WHEN mapping API responses, THE Admin System SHALL handle missing fields gracefully
3. THE Admin System SHALL convert snake_case from API to camelCase for frontend
4. THE Admin System SHALL handle nested objects correctly
5. THE Admin System SHALL validate data types match schema definitions

