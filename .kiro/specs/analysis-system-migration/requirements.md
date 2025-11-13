# Requirements Document

## Introduction

The Analysis System Migration feature addresses the need to complete the migration of the analysis execution functionality from Supabase to Prisma ORM. Currently, the `/api/analysis/execute` endpoint returns a 503 error, blocking users from running statistical analyses on their uploaded CSV data. While other analysis endpoints (upload, variables, group) have been successfully migrated to Prisma, the execute endpoint requires migration of complex dependencies including variable groups, demographics with ranks and categories, analysis configurations, R service integration, and result storage.

## Glossary

- **Analysis System**: The backend service that processes CSV data and executes statistical analyses using R
- **Prisma**: A modern ORM (Object-Relational Mapping) tool used to interact with the PostgreSQL database
- **Supabase**: The previous database client being replaced by Prisma
- **Execute Endpoint**: The API route `/api/analysis/execute` that triggers statistical analysis execution
- **Variable Group**: A collection of related analysis variables grouped together for analysis purposes
- **Demographic Variable**: A variable representing demographic information (age, gender, etc.) with associated ranks and categories
- **R Service**: The external R statistical computing service that performs the actual analysis calculations
- **Analysis Configuration**: The settings and parameters that define how an analysis should be executed
- **Result Storage**: The database tables and file system used to store analysis results

## Requirements

### Requirement 1

**User Story:** As a researcher, I want to execute statistical analyses on my uploaded CSV data, so that I can obtain meaningful insights from my research data.

#### Acceptance Criteria

1. WHEN a user submits a valid analysis execution request with a project ID, THE Analysis System SHALL retrieve the project and associated variables from the database using Prisma
2. WHEN the project data is successfully retrieved, THE Analysis System SHALL validate that all required analysis configurations exist
3. WHEN all validations pass, THE Analysis System SHALL prepare the analysis payload for the R Service
4. WHEN the R Service completes the analysis, THE Analysis System SHALL store the results in the database using Prisma
5. WHEN the results are stored successfully, THE Analysis System SHALL return a success response with the analysis results to the user

### Requirement 2

**User Story:** As a researcher, I want my variable groups to be included in the analysis execution, so that I can analyze related variables together as constructs.

#### Acceptance Criteria

1. WHEN an analysis execution request is received, THE Analysis System SHALL retrieve all variable groups associated with the project using Prisma
2. WHEN variable groups exist for the project, THE Analysis System SHALL include the grouped variables in the analysis payload
3. WHEN a variable belongs to multiple groups, THE Analysis System SHALL handle the relationship correctly without duplication
4. WHEN no variable groups exist, THE Analysis System SHALL proceed with individual variable analysis

### Requirement 3

**User Story:** As a researcher, I want demographic variables with their ranks and categories to be properly processed, so that I can perform demographic-based analyses accurately.

#### Acceptance Criteria

1. WHEN demographic variables are identified in the project, THE Analysis System SHALL retrieve their demographic type and associated metadata using Prisma
2. WHEN demographic categories exist, THE Analysis System SHALL include category mappings in the analysis payload
3. WHEN demographic ranks are defined, THE Analysis System SHALL apply the correct ordering in the analysis
4. WHEN demographic data is incomplete, THE Analysis System SHALL return a validation error with specific details

### Requirement 4

**User Story:** As a researcher, I want the system to handle analysis errors gracefully, so that I understand what went wrong and can take corrective action.

#### Acceptance Criteria

1. WHEN the project ID is invalid or missing, THE Analysis System SHALL return a 400 error with a clear message
2. WHEN the project is not found in the database, THE Analysis System SHALL return a 404 error
3. WHEN the R Service fails to execute the analysis, THE Analysis System SHALL return a 500 error with the R Service error details
4. WHEN database operations fail, THE Analysis System SHALL log the error details and return a generic 500 error to the user
5. WHEN any error occurs, THE Analysis System SHALL include a correlation ID for troubleshooting

### Requirement 5

**User Story:** As a system administrator, I want all database operations to use Prisma instead of Supabase, so that the system uses a consistent data access layer.

#### Acceptance Criteria

1. THE Analysis System SHALL use Prisma client for all database read operations
2. THE Analysis System SHALL use Prisma client for all database write operations
3. THE Analysis System SHALL NOT import or use any Supabase client libraries
4. WHEN database schema changes are needed, THE Analysis System SHALL use Prisma migrations

### Requirement 6

**User Story:** As a researcher, I want my analysis results to be stored persistently, so that I can retrieve and review them later.

#### Acceptance Criteria

1. WHEN an analysis completes successfully, THE Analysis System SHALL create a new analysis result record in the database using Prisma
2. WHEN storing results, THE Analysis System SHALL include the project ID, execution timestamp, and result data
3. WHEN result data exceeds database field limits, THE Analysis System SHALL store the data in the file system and save the file path in the database
4. WHEN result storage fails, THE Analysis System SHALL return an error and not mark the analysis as complete

### Requirement 7

**User Story:** As a developer, I want the execute endpoint to follow the same patterns as other migrated endpoints, so that the codebase is consistent and maintainable.

#### Acceptance Criteria

1. THE Analysis System SHALL use the same authentication pattern as the upload, variables, and group endpoints
2. THE Analysis System SHALL use the correlation ID pattern for request tracking
3. THE Analysis System SHALL use the standardized error response format from the API middleware
4. THE Analysis System SHALL use the standardized success response format from the API middleware
5. THE Analysis System SHALL include appropriate logging at key execution points
