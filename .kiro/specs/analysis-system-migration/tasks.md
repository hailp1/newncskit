# Implementation Plan

- [x] 1. Add AnalysisResult model to Prisma schema






  - Add the AnalysisResult model to `frontend/prisma/schema.prisma` with all required fields (id, projectId, analysisType, config, results, resultsPath, status, executedAt, executionTime, createdAt)
  - Add the results relation to the AnalysisProject model
  - Run `npx prisma migrate dev --name add-analysis-results` to create and apply the migration
  - Run `npx prisma generate` to update the Prisma client
  - _Requirements: 5.1, 5.4, 6.2_

- [x] 2. Create data transformation utilities


  - [x] 2.1 Create CSV file reading utility


    - Create a utility function in `frontend/src/lib/csv-utils.ts` to read CSV files from the file system using Node.js fs/promises
    - Handle file not found errors and invalid file paths
    - Parse CSV content into a 2D array format
    - _Requirements: 1.1, 4.4_
  
  - [x] 2.2 Create R data format transformation utility


    - Create a utility function to transform CSV data and variables into R-compatible format
    - Convert 2D array to column-based object structure (Record<string, any[]>)
    - Separate variables into numeric and categorical arrays
    - Transform variable groups into group name to variable names mapping
    - _Requirements: 1.3, 2.2_
  
  - [x] 2.3 Create demographic data processing utility


    - Create a utility function to apply demographic ranks and categories to data
    - Extract demographic variables from the variables array
    - Apply demographic type information to the R data format
    - Handle missing demographic data gracefully
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 3. Create result storage service





  - [x] 3.1 Create result size calculation utility


    - Create a utility function to calculate the size of analysis results in KB
    - Determine storage strategy (database vs file system) based on 100KB threshold
    - _Requirements: 6.3_
  

  - [x] 3.2 Implement file system result storage

    - Create a function to store large results (>100KB) in the file system at `uploads/results/`
    - Ensure the results directory exists before writing
    - Generate unique filenames using projectId and timestamp
    - Return the relative file path for database storage
    - _Requirements: 6.3_

  

  - [x] 3.3 Implement database result storage

    - Create a function to store analysis results in the database using Prisma
    - Store small results (<100KB) in the results JSON field
    - Store large results file path in the resultsPath field
    - Include projectId, analysisType, config, status, executedAt, and executionTime
    - _Requirements: 6.1, 6.2, 6.4_
-

- [x] 4. Implement execute route handler




  - [x] 4.1 Set up route structure and authentication


    - Create the POST handler in `frontend/src/app/api/analysis/execute/route.ts`
    - Generate correlation ID using `generateCorrelationId()`
    - Log the request using `logRequest(request, correlationId)`
    - Authenticate the request using `getServerSession(authOptions)`
    - Return 401 error if not authenticated
    - _Requirements: 1.1, 4.1, 7.1, 7.5_
  
  - [x] 4.2 Implement request validation

    - Parse the request body to extract projectId and optional analysisType/config
    - Validate that projectId is provided, return 400 error if missing
    - _Requirements: 1.1, 4.1_
  
  - [x] 4.3 Implement data retrieval logic

    - Query the database using Prisma to retrieve the project with `findUnique`
    - Include variables (with group relation) and groups (with variables) in the query
    - Return 404 error if project not found
    - Validate project ownership by comparing project.userId with session.user.id
    - Return 403 error if user doesn't own the project
    - Validate that variables exist for the project, return 404 if none found
    - _Requirements: 1.1, 1.2, 2.1, 4.2_
  
  - [x] 4.4 Implement CSV data loading

    - Read the CSV file from the file system using the project.csvFilePath
    - Parse the CSV content into a 2D array
    - Handle file not found errors with appropriate error messages
    - _Requirements: 1.1_
  
  - [x] 4.5 Implement data preparation

    - Transform the CSV data and variables into R-compatible format using the transformation utilities
    - Apply demographic processing if demographic variables exist
    - Prepare variable groups for the R service
    - _Requirements: 1.3, 2.2, 2.3, 3.1, 3.2_
  
  - [x] 4.6 Implement R service integration

    - Import and use the existing `rAnalysisService` from `@/services/r-analysis`
    - Determine the analysis type (default to 'descriptive' if not specified)
    - Call the appropriate R service method based on analysis type (descriptiveAnalysis, reliabilityAnalysis, etc.)
    - Handle R service errors and return 500 error with R service error details
    - Handle R service timeout errors appropriately
    - _Requirements: 1.3, 1.4, 4.3_
  
  - [x] 4.7 Implement result storage

    - Calculate the execution time in milliseconds
    - Store the analysis results using the result storage service
    - Handle storage failures and return 500 error if storage fails
    - _Requirements: 1.4, 6.1, 6.2, 6.3, 6.4_
  
  - [x] 4.8 Implement success response

    - Create a success response using `createSuccessResponse()` from api-middleware
    - Include analysisId, projectId, results, and executedAt in the response data
    - Return the response with correlation ID
    - _Requirements: 1.5, 7.2, 7.4_
  
  - [x] 4.9 Implement comprehensive error handling

    - Wrap the entire handler in a try-catch block
    - Transform errors using `toApiError()` from the errors utility
    - Return standardized error responses using `createErrorResponse()`
    - Include correlation ID in all error responses
    - Log all errors with correlation ID and error details
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 7.3, 7.5_
-

- [x] 5. Remove Supabase dependencies




  - Search for any remaining Supabase imports or usage in the execute route
  - Remove any Supabase client initialization or queries
  - Verify that only Prisma is used for database operations
  - _Requirements: 5.1, 5.2, 5.3_

- [x] 6. Verify consistency with other migrated routes





  - Compare the execute route implementation with upload, variables, and group routes
  - Ensure authentication pattern matches
  - Ensure correlation ID pattern matches
  - Ensure error response format matches
  - Ensure success response format matches
  - Ensure logging pattern matches
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 7. Test the implementation




  - [x] 7.1 Test authentication and authorization


    - Test executing analysis without authentication (expect 401)
    - Test executing analysis with another user's project (expect 403)
    - Test executing analysis with valid authentication and ownership (expect success)
    - _Requirements: 1.1, 4.1_
  
  - [x] 7.2 Test data retrieval and validation


    - Test with invalid project ID (expect 404)
    - Test with project that has no variables (expect 404)
    - Test with valid project and variables (expect success)
    - _Requirements: 1.1, 1.2, 4.2_
  
  - [x] 7.3 Test analysis execution


    - Test descriptive analysis with valid data
    - Test reliability analysis with variable groups
    - Test with different analysis types
    - Verify results are returned correctly
    - _Requirements: 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 3.1, 3.2, 3.3_
  
  - [x] 7.4 Test result storage


    - Test with small results (<100KB) stored in database
    - Test with large results (>100KB) stored in file system
    - Verify database records are created correctly
    - Verify file system files are created correctly
    - _Requirements: 6.1, 6.2, 6.3_
  
  - [x] 7.5 Test error scenarios


    - Test with R service unavailable (expect 500 with R service error)
    - Test with missing CSV file (expect 500 with file error)
    - Test with malformed CSV data (expect appropriate error)
    - Verify all errors include correlation IDs
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_
