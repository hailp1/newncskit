# Requirements Document

## Introduction

This specification addresses critical architectural, security, and stability issues identified in the R Analytics module audit. The module currently has broken helper function references, unsafe global state management, unrestricted CORS configuration, and unhandled edge cases that prevent production deployment. This fix ensures the R Analytics API is functional, secure, and stable for production use.

## Glossary

- **R Analytics Module**: The Plumber-based REST API service that provides statistical analysis endpoints for the NCS Kit application
- **Helper Functions**: Reusable R functions that perform specific statistical calculations (e.g., `calculate_descriptive_stats()`, `perform_linear_regression()`)
- **Plumber Server**: The R web framework that exposes R functions as REST API endpoints
- **Global State**: In-memory data storage using R's `new.env()` for caching analysis data
- **CORS (Cross-Origin Resource Sharing)**: HTTP security mechanism that controls which domains can access the API
- **Edge Cases**: Unusual input conditions that can cause crashes (e.g., zero variance, small sample sizes)
- **Bootstrap Simulation**: Statistical resampling technique used in mediation and factor analysis
- **TTL (Time To Live)**: Expiration time for cached data entries

## Requirements

### Requirement 1: Fix Helper Function Architecture

**User Story:** As a data analyst, I want all R Analytics API endpoints to execute successfully, so that I can perform statistical analyses without encountering "object not found" errors.

#### Acceptance Criteria

1. WHEN the Plumber Server starts, THE R Analytics Module SHALL source all helper function files from the endpoints directory
2. WHEN a client calls any analysis endpoint, THE R Analytics Module SHALL execute the corresponding helper function without errors
3. THE R Analytics Module SHALL verify that all required helper functions are loaded during server initialization
4. IF a helper function file fails to load, THEN THE R Analytics Module SHALL log the error and prevent server startup
5. THE R Analytics Module SHALL provide a health check endpoint that confirms all helper functions are available

### Requirement 2: Implement Safe Data Storage

**User Story:** As a system administrator, I want analysis data to persist reliably and handle concurrent requests safely, so that users do not lose their work or experience data corruption.

#### Acceptance Criteria

1. THE R Analytics Module SHALL store analysis data with unique project identifiers as keys
2. WHEN storing analysis data, THE R Analytics Module SHALL include a timestamp and TTL of 3600 seconds
3. WHEN retrieving analysis data, THE R Analytics Module SHALL check the TTL and return NULL if expired
4. THE R Analytics Module SHALL provide a cleanup function that removes expired data entries every 300 seconds
5. WHEN multiple concurrent requests access the same project data, THE R Analytics Module SHALL prevent race conditions through proper locking mechanisms

### Requirement 3: Restrict CORS and Add Authentication

**User Story:** As a security engineer, I want the R Analytics API to only accept requests from authorized origins with valid credentials, so that sensitive analysis data is protected from unauthorized access.

#### Acceptance Criteria

1. THE R Analytics Module SHALL restrict CORS to a whitelist of allowed origins defined in environment variables
2. WHEN a request arrives from an unauthorized origin, THE R Analytics Module SHALL reject the request with HTTP 403 status
3. THE R Analytics Module SHALL require an API key in the X-API-Key header for all analysis endpoints
4. WHEN a request lacks a valid API key, THE R Analytics Module SHALL return HTTP 401 status with an error message
5. THE R Analytics Module SHALL support OPTIONS preflight requests for CORS compliance

### Requirement 4: Handle Zero Variance Edge Cases

**User Story:** As a data analyst, I want the system to gracefully handle constant variables and zero variance data, so that my analysis does not crash when encountering such data.

#### Acceptance Criteria

1. WHEN calculating z-scores for a variable with zero standard deviation, THE R Analytics Module SHALL return NA values with a warning message
2. WHEN performing normality tests on constant variables, THE R Analytics Module SHALL return a result indicating "constant_variable" without attempting statistical tests
3. WHEN detecting outliers in data with zero variance, THE R Analytics Module SHALL return an empty outlier list with a warning
4. THE R Analytics Module SHALL check for zero variance before any statistical operation that requires non-zero standard deviation
5. WHEN correlation analysis encounters variables with zero variance, THE R Analytics Module SHALL exclude those variables and log a warning

### Requirement 5: Validate Sample Size Requirements

**User Story:** As a data analyst, I want the system to validate that my dataset meets minimum sample size requirements, so that I receive clear error messages instead of cryptic statistical test failures.

#### Acceptance Criteria

1. WHEN performing Shapiro-Wilk normality test, THE R Analytics Module SHALL require at least 3 observations
2. WHEN performing Kolmogorov-Smirnov test, THE R Analytics Module SHALL require at least 2 observations
3. IF sample size is insufficient for a requested test, THEN THE R Analytics Module SHALL return HTTP 400 with a descriptive error message
4. THE R Analytics Module SHALL validate sample size before executing any statistical test
5. WHEN sample size validation fails, THE R Analytics Module SHALL specify the minimum required sample size in the error response

### Requirement 6: Ensure Factor Type Conversion

**User Story:** As a data analyst, I want categorical variables to be automatically converted to factors, so that ANOVA and t-tests execute correctly without type warnings.

#### Acceptance Criteria

1. WHEN performing ANOVA, THE R Analytics Module SHALL convert all grouping variables to factor type
2. WHEN performing t-tests, THE R Analytics Module SHALL convert the grouping variable to factor type if it is character or numeric
3. THE R Analytics Module SHALL preserve the original data and only convert types in the analysis context
4. WHEN a variable cannot be converted to factor, THE R Analytics Module SHALL return HTTP 400 with an error message
5. THE R Analytics Module SHALL log factor conversions for debugging purposes

### Requirement 7: Fix Outlier Index Mapping

**User Story:** As a data analyst, I want outlier detection to return correct row indices from the original dataset, so that I can identify and review the actual outlier observations.

#### Acceptance Criteria

1. WHEN detecting outliers in data with missing values, THE R Analytics Module SHALL map outlier indices back to the original dataset positions
2. THE R Analytics Module SHALL return outlier information including original indices, values, and z-scores
3. WHEN no outliers are detected, THE R Analytics Module SHALL return an empty list with indices, values, and z_scores fields
4. THE R Analytics Module SHALL handle datasets where all values are NA without errors
5. THE R Analytics Module SHALL validate that returned outlier indices correspond to actual data rows

### Requirement 8: Make Bootstrap Simulations Configurable

**User Story:** As a data analyst, I want to control the number of bootstrap simulations, so that I can balance analysis accuracy with computation time based on my needs.

#### Acceptance Criteria

1. THE R Analytics Module SHALL accept a bootstrap_sims parameter with a default value of 1000
2. WHEN bootstrap_sims exceeds 5000, THE R Analytics Module SHALL log a warning about potential performance impact
3. THE R Analytics Module SHALL allow clients to disable bootstrap by setting bootstrap_sims to 0 or FALSE
4. THE R Analytics Module SHALL validate that bootstrap_sims is a positive integer or FALSE
5. WHEN performing CFA or mediation analysis, THE R Analytics Module SHALL use the client-specified bootstrap_sims value

### Requirement 9: Add Comprehensive Error Handling

**User Story:** As a developer integrating with the R Analytics API, I want consistent error responses with clear messages, so that I can handle failures gracefully in the frontend application.

#### Acceptance Criteria

1. THE R Analytics Module SHALL wrap all statistical operations in tryCatch blocks
2. WHEN an error occurs during analysis, THE R Analytics Module SHALL return HTTP 500 with a JSON error object containing message and details fields
3. THE R Analytics Module SHALL log all errors with stack traces to the server console
4. THE R Analytics Module SHALL distinguish between client errors (HTTP 400) and server errors (HTTP 500)
5. THE R Analytics Module SHALL return validation errors with HTTP 400 and descriptive field-level error messages

### Requirement 10: Implement Health Check and Monitoring

**User Story:** As a DevOps engineer, I want health check endpoints and logging, so that I can monitor the R Analytics service status and diagnose issues quickly.

#### Acceptance Criteria

1. THE R Analytics Module SHALL provide a GET /health endpoint that returns HTTP 200 when all systems are operational
2. THE R Analytics Module SHALL include helper function availability status in the health check response
3. THE R Analytics Module SHALL log all incoming requests with timestamp, endpoint, and execution time
4. THE R Analytics Module SHALL log memory usage and cached data count every 60 seconds
5. WHEN the cleanup function runs, THE R Analytics Module SHALL log the number of expired entries removed
