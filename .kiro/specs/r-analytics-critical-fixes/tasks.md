# Implementation Plan

- [x] 1. Fix helper function architecture





  - [x] 1.1 Update analysis_server.R to source helper files

    - Add source() calls at the top of `backend/r_analysis/analysis_server.R`
    - Source `endpoints/descriptive-stats.R`
    - Source `endpoints/regression.R`
    - Source `endpoints/factor-analysis.R`
    - Source `endpoints/sem.R`
    - Source `endpoints/advanced-analysis.R`
    - Add error handling with tryCatch for source operations
    - Log successful loading of each helper file

    - _Requirements: 1.1, 1.2, 1.3, 1.4_
  


  - [ ] 1.2 Verify helper functions are loaded
    - Create verification function to check if required functions exist
    - List required functions: calculate_descriptive_stats, perform_linear_regression, perform_efa, perform_sem
    - Log missing functions if any

    - Stop server initialization if critical functions are missing

    - _Requirements: 1.3, 1.4_

  
  - [ ] 1.3 Add health check endpoint
    - Create GET /health endpoint in analysis_server.R

    - Check helper function availability


    - Return status, helper_functions, data_cached, timestamp
    - Return "unhealthy" status if functions are missing
    - _Requirements: 1.5, 10.1, 10.2_

- [ ] 2. Implement safe data storage with TTL
  - [x] 2.1 Create data store functions

    - Create `store_data(project_id, data)` function
    - Use project_id as key with "project_" prefix
    - Store data with timestamp and TTL of 3600 seconds
    - Log when data is stored
    - _Requirements: 2.1, 2.2_
  
  - [x] 2.2 Create data retrieval function

    - Create `get_data(project_id)` function
    - Check if data exists for project_id
    - Validate TTL and remove expired data

    - Return NULL if data not found or expired
    - Log retrieval attempts
    - _Requirements: 2.1, 2.3_


  
  - [ ] 2.3 Implement cleanup function
    - Create `cleanup_expired()` function
    - Iterate through all stored data



    - Remove entries where TTL has expired



    - Log number of removed entries

    - _Requirements: 2.4, 10.5_
  
  - [ ] 2.4 Schedule automatic cleanup
    - Use later::later() to schedule cleanup every 300 seconds
    - Ensure cleanup runs in background
    - Add reschedule logic after each cleanup


    - _Requirements: 2.4_

- [ ] 3. Implement CORS restrictions and authentication
  - [x] 3.1 Create CORS filter

    - Add @filter cors to analysis_server.R
    - Read allowed origins from ALLOWED_ORIGINS environment variable
    - Check request origin against whitelist

    - Set CORS headers only for allowed origins
    - Handle OPTIONS preflight requests
    - _Requirements: 3.1, 3.2, 3.5_


  




  - [x] 3.2 Create authentication filter

    - Add @filter auth to analysis_server.R

    - Skip authentication for /health endpoint

    - Check X-API-Key header in requests
    - Validate against ANALYTICS_API_KEY environment variable
    - Return 401 for invalid or missing API keys

    - _Requirements: 3.3, 3.4_
  
  - [ ] 3.3 Create error handler filter
    - Add @filter error-handler to wrap all endpoints

    - Use tryCatch to catch all errors
    - Return 500 status with error message
    - Log errors with endpoint and timestamp
    - _Requirements: 9.1, 9.2, 9.3_



- [x] 4. Add safe helper functions for edge cases

  - [ ] 4.1 Create safe z-score calculation
    - Update `calculate_descriptive_stats()` in descriptive-stats.R
    - Check for zero or NA standard deviation
    - Return NA values with warning if sd = 0
    - Calculate z-scores only when sd > 0
    - _Requirements: 4.1, 4.4_

  

  - [x] 4.2 Create safe normality test


    - Create `test_normality_safe()` function


    - Check sample size >= 3
    - Check for constant variables (unique values = 1)
    - Check for zero variance
    - Return descriptive result for edge cases
    - Run Shapiro-Wilk test only when valid
    - Wrap in tryCatch for error handling

    - _Requirements: 4.2, 5.1_

  
  - [ ] 4.3 Create safe outlier detection
    - Create `detect_outliers_safe()` function
    - Check for zero variance before calculating z-scores
    - Return empty list with warning if sd = 0

    - Map outlier indices back to original dataset positions


    - Handle NA values correctly


    - Return indices, values, and z_scores
    - _Requirements: 4.3, 7.1, 7.2, 7.3, 7.4, 7.5_
  
  - [ ] 4.4 Update correlation analysis
    - Check for zero variance variables before correlation
    - Exclude zero variance variables with warning
    - Log excluded variables


    - _Requirements: 4.5_

- [ ] 5. Add sample size validation
  - [x] 5.1 Create sample size validator


    - Create `validate_sample_size()` function

    - Check minimum requirements for different tests
    - Shapiro-Wilk: n >= 3

    - Kolmogorov-Smirnov: n >= 2
    - Return validation result with error message
    - _Requirements: 5.1, 5.2, 5.4_

  
  - [ ] 5.2 Add validation to regression
    - Update `perform_linear_regression()` in regression.R
    - Calculate minimum n = number of predictors + 2

    - Validate sample size before fitting model
    - Return HTTP 400 with descriptive error if insufficient
    - Include required sample size in error message

    - _Requirements: 5.3, 5.5_

  

  - [ ] 5.3 Add validation to factor analysis
    - Update `perform_efa()` in factor-analysis.R




    - Require n >= p * 3 (3 times number of variables)
    - Return error with required sample size
    - _Requirements: 5.3, 5.5_



- [ ] 6. Implement factor type conversion
  - [ ] 6.1 Add factor conversion to ANOVA
    - Update ANOVA functions to check variable types
    - Convert character variables to factors

    - Convert numeric grouping variables to factors


    - Log conversions for debugging
    - Preserve original data
    - _Requirements: 6.1, 6.3, 6.5_
  
  - [x] 6.2 Add factor conversion to t-tests

    - Update t-test functions to check grouping variable type
    - Convert to factor if character or numeric
    - Return error if conversion fails
    - _Requirements: 6.2, 6.4_


- [ ] 7. Make bootstrap simulations configurable
  - [x] 7.1 Add bootstrap_sims parameter to CFA


    - Update `perform_cfa()` in factor-analysis.R


    - Add bootstrap parameter (default FALSE)
    - Add bootstrap_samples parameter (default 1000)
    - Validate bootstrap_samples is positive integer
    - Log warning if bootstrap_samples > 2000
    - _Requirements: 8.1, 8.2, 8.4, 8.5_
  

  - [ ] 7.2 Add bootstrap_sims parameter to mediation
    - Update mediation analysis function
    - Add sims parameter with default 1000
    - Validate sims <= 5000
    - Log warning for high values
    - _Requirements: 8.1, 8.2, 8.4, 8.5_
  
  - [ ] 7.3 Allow disabling bootstrap
    - Accept bootstrap_sims = 0 or FALSE to disable
    - Skip bootstrap when disabled
    - _Requirements: 8.3_

- [ ] 8. Add comprehensive error handling
  - [ ] 8.1 Wrap statistical operations in tryCatch
    - Add tryCatch to all statistical function calls
    - Return structured error response
    - Include error message and details
    - _Requirements: 9.1, 9.2_
  
  - [ ] 8.2 Implement error response format
    - Create standard error response: list(success = FALSE, error = message, timestamp)
    - Create standard success response: list(success = TRUE, data = results, timestamp)
    - Use consistent format across all endpoints
    - _Requirements: 9.2, 9.4, 9.5_
  
  - [ ] 8.3 Add error logging
    - Log all errors with correlation ID (if available)
    - Include endpoint, method, and timestamp
    - Log stack traces for debugging
    - _Requirements: 9.3_

- [ ] 9. Add request logging and monitoring
  - [ ] 9.1 Implement request logging
    - Log all incoming requests with timestamp
    - Log endpoint path and method
    - Log execution time for each request
    - _Requirements: 10.3_
  
  - [ ] 9.2 Add memory monitoring
    - Log memory usage every 60 seconds
    - Log number of cached data entries
    - Use later::later() for scheduling
    - _Requirements: 10.4_
  
  - [ ] 9.3 Log cleanup operations
    - Log when cleanup function runs
    - Log number of expired entries removed
    - _Requirements: 10.5_

- [ ] 10. Update environment configuration
  - [ ] 10.1 Create .env.example file
    - Add ALLOWED_ORIGINS with example values
    - Add ANALYTICS_API_KEY placeholder
    - Add LOG_LEVEL option
    - Document each variable
    - _Requirements: 3.1, 3.3_
  
  - [ ] 10.2 Update Dockerfile
    - Ensure all R packages are installed (plumber, jsonlite, psych, lavaan, later)
    - Copy all application files
    - Set working directory
    - Expose port 8000
    - Add CMD to start server
    - _Requirements: All_

- [ ] 11. Test R Analytics locally
  - [ ] 11.1 Test helper function loading
    - Start R server
    - Check logs for successful helper loading
    - Call /health endpoint
    - Verify all functions are loaded
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_
  
  - [ ] 11.2 Test data storage and TTL
    - Store test data with project_id
    - Retrieve data immediately
    - Wait for TTL expiration
    - Verify data is removed
    - Test cleanup function
    - _Requirements: 2.1, 2.2, 2.3, 2.4_
  
  - [ ] 11.3 Test CORS and authentication
    - Send request without API key → expect 401
    - Send request with invalid API key → expect 401
    - Send request with valid API key → expect 200
    - Send request from unauthorized origin → expect 403
    - _Requirements: 3.1, 3.2, 3.3, 3.4_
  
  - [ ] 11.4 Test edge cases
    - Test with zero variance data
    - Test with small sample size (n < 3)
    - Test with constant variables
    - Test with missing values
    - Verify graceful error handling
    - _Requirements: 4.1, 4.2, 4.3, 5.1, 5.2_
  
  - [ ] 11.5 Test bootstrap configuration
    - Test CFA with bootstrap enabled
    - Test CFA with bootstrap disabled
    - Test with high bootstrap samples (>2000)
    - Verify warnings are logged
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ] 12. Deploy and verify
  - [ ] 12.1 Build Docker image
    - Build image with updated Dockerfile
    - Verify all dependencies are installed
    - Test image locally
    - _Requirements: All_
  
  - [ ] 12.2 Deploy to production
    - Push Docker image to registry
    - Update deployment configuration
    - Set environment variables
    - Deploy to production environment
    - _Requirements: All_
  
  - [ ] 12.3 Verify production deployment
    - Test /health endpoint
    - Test analysis endpoints with valid data
    - Verify CORS and authentication
    - Monitor logs for errors
    - Check memory usage
    - _Requirements: All_
