# Implementation Plan

- [x] 1. Create API middleware utilities


  - Create `frontend/src/lib/api-middleware.ts` with reusable API utilities
  - Implement `generateCorrelationId()` function for request tracing
  - Implement `getCorsHeaders()` function for consistent CORS configuration
  - Implement `getJsonHeaders()` function for standard JSON response headers
  - Implement `createErrorResponse()` function for standardized error responses
  - Implement `createSuccessResponse()` function for standardized success responses
  - Implement `validateMethod()` function for HTTP method validation
  - Implement `logRequest()` function for request logging with correlation IDs
  - _Requirements: 1.5, 3.1, 3.2, 8.1, 8.2, 8.3, 8.4, 9.1, 9.2, 9.5_

- [x] 2. Update CSV upload API route


  - [x] 2.1 Update OPTIONS handler for CORS preflight


    - Modify `frontend/src/app/api/analysis/upload/route.ts` OPTIONS function
    - Use `getCorsHeaders()` from middleware
    - Return 204 status code instead of 200
    - _Requirements: 1.3, 8.2_
  
  - [x] 2.2 Update POST handler with middleware integration


    - Import middleware utilities at top of file
    - Generate correlation ID at start of request
    - Use `logRequest()` to log incoming request
    - Replace manual error responses with `createErrorResponse()`
    - Replace manual success response with `createSuccessResponse()`
    - Update response format to include correlation ID and timestamp
    - _Requirements: 1.1, 1.2, 1.5, 3.1, 3.2, 4.1, 4.2, 4.3, 4.4, 9.1, 9.2_
  
  - [x] 2.3 Add HEAD method handler


    - Create HEAD function that returns 405 Method Not Allowed
    - Use `validateMethod()` to generate proper error response
    - Include correlation ID in response
    - _Requirements: 1.4, 3.1, 3.3_
  
  - [x] 2.4 Update GET method handler

    - Modify existing GET function to use middleware utilities
    - Use `validateMethod()` for consistent error response
    - Include allowed methods in response
    - _Requirements: 1.4, 3.1, 3.4_

- [x] 3. Update health check API route


  - [x] 3.1 Update GET handler


    - Modify `frontend/src/app/api/health/simple/route.ts` GET function
    - Import middleware utilities
    - Generate correlation ID
    - Use `logRequest()` for logging
    - Use `createSuccessResponse()` for response
    - Include service version and environment in response
    - _Requirements: 2.1, 2.3, 3.1, 9.1_
  
  - [x] 3.2 Add HEAD method handler


    - Create HEAD function for lightweight health checks
    - Return 200 status with no body
    - Include CORS headers
    - Log request with correlation ID
    - Handle errors gracefully with 500 status
    - _Requirements: 2.2, 2.3, 2.5_
  
  - [x] 3.3 Add OPTIONS handler for CORS


    - Create OPTIONS function
    - Return 204 status with CORS headers
    - Use `getCorsHeaders()` from middleware
    - _Requirements: 2.3, 8.2_

- [x] 4. Update frontend CSV uploader component


  - [x] 4.1 Update response parsing logic


    - Modify `frontend/src/components/analysis/CSVUploader.tsx`
    - Update fetch call to include X-Correlation-ID header
    - Update response parsing to handle new success/error format
    - Extract data from `data.data` for success responses
    - Extract error from `data.error` for error responses
    - Log correlation ID for debugging
    - _Requirements: 3.3, 3.5, 9.5_
  
  - [x] 4.2 Improve error handling

    - Check for `data.success === false` to detect errors
    - Display correlation ID in error messages for user support
    - Handle timeout errors with retry logic
    - Validate response structure before processing
    - _Requirements: 3.4, 5.2, 5.3, 5.4_

- [x] 5. Update Vercel configuration


  - [x] 5.1 Add API function configuration


    - Modify `vercel.json` in project root
    - Add functions configuration for API routes
    - Set maxDuration to 30 seconds for upload endpoints
    - Set memory to 1024MB for file processing
    - _Requirements: 5.1, 10.2, 10.3_
  
  - [x] 5.2 Add CORS headers configuration

    - Add headers section to vercel.json
    - Configure CORS headers for all /api/* routes
    - Include Access-Control-Allow-Origin, Methods, and Headers
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 6. Add TypeScript type definitions


  - Create `frontend/src/types/api-responses.ts` file
  - Define `ApiSuccessResponse<T>` interface
  - Define `ApiErrorResponse` interface
  - Define `UploadSuccessData` interface
  - Define `HealthCheckData` interface
  - Export all types for use in components and API routes
  - _Requirements: 3.1, 3.2, 6.1, 6.2, 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 7. Add comprehensive error logging



  - [x] 7.1 Enhance error logging in middleware

    - Update `createErrorResponse()` to log full error details
    - Include request URL, method, headers in error logs
    - Add timestamp and correlation ID to all logs
    - Differentiate between client (4xx) and server (5xx) errors
    - _Requirements: 9.1, 9.2, 9.3, 9.4_
  
  - [x] 7.2 Add request/response logging

    - Log all successful requests with correlation ID
    - Log response status and timing
    - Include user agent and IP address (if available)
    - _Requirements: 9.1, 9.5_

- [ ] 8. Test API routes locally
  - [ ] 8.1 Test upload endpoint
    - Test POST with valid CSV file
    - Test POST with invalid content type
    - Test POST with missing file
    - Test POST with malformed CSV
    - Test GET request returns 405
    - Test HEAD request returns 405
    - Test OPTIONS returns proper CORS headers
    - Verify all responses are JSON format
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 3.1, 4.1, 4.2, 4.3, 4.4_
  
  - [ ] 8.2 Test health check endpoint
    - Test GET request returns 200 with health data
    - Test HEAD request returns 200 with no body
    - Test OPTIONS returns proper CORS headers
    - Verify correlation IDs in all responses
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_
  
  - [ ] 8.3 Test error scenarios
    - Trigger errors and verify JSON error responses
    - Verify no HTML error pages are returned
    - Verify correlation IDs in error logs
    - Verify proper status codes (400, 405, 500)
    - _Requirements: 3.2, 3.3, 3.4, 3.5_

- [ ] 9. Deploy to Vercel and verify
  - [ ] 9.1 Deploy to Vercel preview environment
    - Push changes to feature branch
    - Wait for Vercel preview deployment
    - Get preview URL from Vercel dashboard
    - _Requirements: 10.1, 10.3_
  
  - [ ] 9.2 Test upload in production environment
    - Upload CSV file via preview URL
    - Verify 200 response with project data
    - Check Vercel logs for correlation IDs
    - Verify no 405 or 500 errors
    - _Requirements: 1.1, 1.2, 10.4, 10.5_
  
  - [ ] 9.3 Test health check in production
    - Send GET request to /api/health/simple
    - Send HEAD request to /api/health/simple
    - Verify both return successful responses
    - Check logs for proper logging
    - _Requirements: 2.1, 2.2, 10.5_
  
  - [ ] 9.4 Verify CORS configuration
    - Test from different origin (if applicable)
    - Verify OPTIONS preflight works
    - Verify CORS headers in all responses
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_
  
  - [ ] 9.5 Monitor for errors
    - Check Vercel logs for any errors
    - Verify correlation IDs appear in logs
    - Check for any HTML error responses
    - Monitor response times and success rates
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ] 10. Merge to main and deploy to production
  - Create pull request with all changes
  - Review code changes and test results
  - Merge to main branch
  - Verify production deployment succeeds
  - Monitor production logs for 24 hours
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_
