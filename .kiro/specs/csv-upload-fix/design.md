# Design Document

## Overview

This design addresses critical failures in the CSV upload and health check endpoints that are preventing the Analysis module from functioning in production. The root cause analysis reveals that while the Next.js API routes are correctly implemented, they are failing in the Vercel production environment due to missing HTTP method handlers and insufficient error handling.

**Key Issues Identified:**
1. `/api/analysis/upload` returns 405 Method Not Allowed in production
2. `/api/health/simple` returns 500 Internal Server Error
3. API routes return HTML error pages instead of JSON responses
4. Missing HEAD method handler for health checks
5. Insufficient CORS configuration for production environment

## Architecture

### Current Architecture

```
┌─────────────────┐
│   Browser       │
│  (Frontend)     │
└────────┬────────┘
         │ POST /api/analysis/upload
         │ HEAD /api/health/simple
         ▼
┌─────────────────────────────────┐
│   Vercel Edge Network           │
│   ┌─────────────────────────┐   │
│   │  Next.js API Routes     │   │
│   │  (Serverless Functions) │   │
│   └─────────────────────────┘   │
└─────────────────────────────────┘
```

### Problem Analysis

**Issue 1: 405 Method Not Allowed**
- Current implementation has POST, OPTIONS, and GET handlers
- Vercel may be routing requests differently in production
- Possible middleware interference or routing configuration issue

**Issue 2: 500 Health Check Error**
- Health check only implements GET method
- Frontend is sending HEAD requests for lightweight checks
- Missing HEAD handler causes 500 error

**Issue 3: HTML Error Pages**
- Next.js default error handling returns HTML
- API routes need explicit JSON error responses
- Missing global error boundary for API routes

### Proposed Architecture

```
┌─────────────────┐
│   Browser       │
│  (Frontend)     │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│   API Route Middleware Layer            │
│   ┌───────────────────────────────┐     │
│   │  CORS Handler                 │     │
│   │  - Preflight OPTIONS          │     │
│   │  - Response headers           │     │
│   └───────────────────────────────┘     │
│   ┌───────────────────────────────┐     │
│   │  Error Handler Middleware     │     │
│   │  - Catch all errors           │     │
│   │  - Return JSON always         │     │
│   │  - Log with correlation ID    │     │
│   └───────────────────────────────┘     │
│   ┌───────────────────────────────┐     │
│   │  Method Validator             │     │
│   │  - Check allowed methods      │     │
│   │  - Return 405 with JSON       │     │
│   └───────────────────────────────┘     │
└─────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│   API Route Handlers                    │
│   ┌───────────────────────────────┐     │
│   │  /api/analysis/upload         │     │
│   │  - POST: Handle file upload   │     │
│   │  - OPTIONS: CORS preflight    │     │
│   │  - GET: Return 405            │     │
│   │  - HEAD: Return 405           │     │
│   └───────────────────────────────┘     │
│   ┌───────────────────────────────┐     │
│   │  /api/health/simple           │     │
│   │  - GET: Return health status  │     │
│   │  - HEAD: Return 200 only      │     │
│   │  - OPTIONS: CORS preflight    │     │
│   └───────────────────────────────┘     │
└─────────────────────────────────────────┘
```

## Components and Interfaces

### 1. API Middleware Utilities

**File:** `frontend/src/lib/api-middleware.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';

// Correlation ID for request tracing
export function generateCorrelationId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

// Standard CORS headers
export function getCorsHeaders(): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, HEAD',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Correlation-ID',
    'Access-Control-Max-Age': '86400',
  };
}

// Standard JSON response headers
export function getJsonHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store',
    ...getCorsHeaders(),
  };
}

// Error response builder
export interface ApiError {
  success: false;
  error: string;
  correlationId: string;
  timestamp: string;
  details?: string;
}

export function createErrorResponse(
  error: Error | string,
  status: number,
  correlationId: string
): NextResponse<ApiError> {
  const errorMessage = typeof error === 'string' ? error : error.message;
  const errorDetails = error instanceof Error ? error.stack : undefined;

  const response: ApiError = {
    success: false,
    error: errorMessage,
    correlationId,
    timestamp: new Date().toISOString(),
    details: process.env.NODE_ENV === 'development' ? errorDetails : undefined,
  };

  console.error(`[API Error] ${correlationId}:`, {
    error: errorMessage,
    status,
    stack: errorDetails,
  });

  return NextResponse.json(response, {
    status,
    headers: getJsonHeaders(),
  });
}

// Success response builder
export interface ApiSuccess<T = any> {
  success: true;
  data: T;
  correlationId: string;
  timestamp: string;
}

export function createSuccessResponse<T>(
  data: T,
  correlationId: string
): NextResponse<ApiSuccess<T>> {
  const response: ApiSuccess<T> = {
    success: true,
    data,
    correlationId,
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(response, {
    status: 200,
    headers: getJsonHeaders(),
  });
}

// Method validator
export function validateMethod(
  request: NextRequest,
  allowedMethods: string[],
  correlationId: string
): NextResponse | null {
  const method = request.method;

  if (!allowedMethods.includes(method)) {
    console.warn(`[API] ${correlationId}: Method ${method} not allowed. Allowed: ${allowedMethods.join(', ')}`);
    
    return NextResponse.json(
      {
        success: false,
        error: `Method ${method} not allowed. Use ${allowedMethods.join(', ')}`,
        correlationId,
        timestamp: new Date().toISOString(),
        allowedMethods,
      },
      {
        status: 405,
        headers: {
          ...getJsonHeaders(),
          'Allow': allowedMethods.join(', '),
        },
      }
    );
  }

  return null;
}

// Request logger
export function logRequest(request: NextRequest, correlationId: string): void {
  console.log(`[API Request] ${correlationId}:`, {
    method: request.method,
    url: request.url,
    headers: Object.fromEntries(request.headers.entries()),
    timestamp: new Date().toISOString(),
  });
}
```

### 2. Updated Upload Route

**File:** `frontend/src/app/api/analysis/upload/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import {
  generateCorrelationId,
  createErrorResponse,
  createSuccessResponse,
  validateMethod,
  logRequest,
  getCorsHeaders,
} from '@/lib/api-middleware';

// Handle OPTIONS for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(),
  });
}

// Handle POST for file upload
export async function POST(request: NextRequest) {
  const correlationId = generateCorrelationId();
  
  try {
    logRequest(request, correlationId);

    // Validate content type
    const contentType = request.headers.get('content-type');
    if (!contentType || !contentType.includes('multipart/form-data')) {
      return createErrorResponse(
        'Invalid content type. Expected multipart/form-data',
        400,
        correlationId
      );
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const name = formData.get('name') as string;

    if (!file) {
      return createErrorResponse('No file provided', 400, correlationId);
    }

    console.log(`[Upload] ${correlationId}: Processing file ${file.name} (${file.size} bytes)`);

    // Read and validate file content
    const text = await file.text();
    const lines = text.split(/\r?\n/).filter(line => line.trim());

    if (lines.length < 2) {
      return createErrorResponse(
        'File must contain at least a header row and one data row',
        400,
        correlationId
      );
    }

    // Parse CSV
    const delimiter = lines[0].includes(';') ? ';' : ',';
    const csvHeaders = lines[0]
      .split(delimiter)
      .map(h => h.trim().replace(/^["']|["']$/g, ''))
      .filter(h => h.length > 0);

    if (csvHeaders.length === 0) {
      return createErrorResponse(
        'No valid headers found in CSV file',
        400,
        correlationId
      );
    }

    // Parse preview rows
    const previewRows = lines.slice(1, Math.min(6, lines.length)).map(line => {
      const values = line
        .split(delimiter)
        .map(v => v.trim().replace(/^["']|["']$/g, ''));

      const row: Record<string, string> = {};
      csvHeaders.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      return row;
    });

    // Generate project ID
    const projectId = `project-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;

    const responseData = {
      project: {
        id: projectId,
        name: name || file.name.replace('.csv', ''),
        rowCount: lines.length - 1,
        columnCount: csvHeaders.length,
      },
      preview: previewRows,
      headers: csvHeaders,
    };

    console.log(`[Upload] ${correlationId}: Success - Project ${projectId} created`);

    return createSuccessResponse(responseData, correlationId);

  } catch (error) {
    return createErrorResponse(
      error instanceof Error ? error : 'Upload failed',
      500,
      correlationId
    );
  }
}

// Handle GET - return method not allowed
export async function GET(request: NextRequest) {
  const correlationId = generateCorrelationId();
  logRequest(request, correlationId);
  
  return validateMethod(request, ['POST', 'OPTIONS'], correlationId)!;
}

// Handle HEAD - return method not allowed
export async function HEAD(request: NextRequest) {
  const correlationId = generateCorrelationId();
  logRequest(request, correlationId);
  
  return validateMethod(request, ['POST', 'OPTIONS'], correlationId)!;
}
```

### 3. Updated Health Check Route

**File:** `frontend/src/app/api/health/simple/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import {
  generateCorrelationId,
  createErrorResponse,
  createSuccessResponse,
  logRequest,
  getCorsHeaders,
} from '@/lib/api-middleware';

// Handle GET for health check
export async function GET(request: NextRequest) {
  const correlationId = generateCorrelationId();
  
  try {
    logRequest(request, correlationId);

    const healthData = {
      status: 'healthy',
      service: 'ncskit-frontend',
      version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
      environment: process.env.NODE_ENV,
    };

    return createSuccessResponse(healthData, correlationId);

  } catch (error) {
    return createErrorResponse(
      error instanceof Error ? error : 'Health check failed',
      500,
      correlationId
    );
  }
}

// Handle HEAD for lightweight health check
export async function HEAD(request: NextRequest) {
  const correlationId = generateCorrelationId();
  
  try {
    logRequest(request, correlationId);

    // Return 200 with no body for HEAD requests
    return new NextResponse(null, {
      status: 200,
      headers: getCorsHeaders(),
    });

  } catch (error) {
    console.error(`[Health Check] ${correlationId}: HEAD request failed`, error);
    return new NextResponse(null, {
      status: 500,
      headers: getCorsHeaders(),
    });
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(),
  });
}
```

### 4. Frontend Response Handler Update

**File:** `frontend/src/components/analysis/CSVUploader.tsx` (partial update)

```typescript
// Update response parsing to handle new format
const response = await fetch(uploadUrl, {
  method: 'POST',
  body: formData,
  signal: controller.signal,
  headers: {
    'X-Correlation-ID': `upload-${Date.now()}`,
  },
});

// Parse response
const data = await response.json();

// Check for new response format
if (data.success === false) {
  console.error('[CSVUploader] Upload failed:', data.error);
  console.error('[CSVUploader] Correlation ID:', data.correlationId);
  throw new Error(data.error || 'Upload failed');
}

// Extract data from new format
const projectData = data.success ? data.data : data;

if (!projectData.project || !projectData.project.id) {
  throw new Error('Invalid response: missing project ID');
}

// Continue with existing logic
onUploadComplete(projectData.project.id, projectData.preview || []);
```

## Data Models

### Upload Response

```typescript
interface UploadSuccessResponse {
  success: true;
  data: {
    project: {
      id: string;
      name: string;
      rowCount: number;
      columnCount: number;
    };
    preview: Array<Record<string, string>>;
    headers: string[];
  };
  correlationId: string;
  timestamp: string;
}

interface UploadErrorResponse {
  success: false;
  error: string;
  correlationId: string;
  timestamp: string;
  details?: string;
}

type UploadResponse = UploadSuccessResponse | UploadErrorResponse;
```

### Health Check Response

```typescript
interface HealthSuccessResponse {
  success: true;
  data: {
    status: 'healthy' | 'degraded' | 'unhealthy';
    service: string;
    version: string;
    environment: string;
  };
  correlationId: string;
  timestamp: string;
}

interface HealthErrorResponse {
  success: false;
  error: string;
  correlationId: string;
  timestamp: string;
}

type HealthResponse = HealthSuccessResponse | HealthErrorResponse;
```

## Error Handling

### Error Categories

1. **Client Errors (4xx)**
   - 400 Bad Request: Invalid file, missing fields, malformed CSV
   - 405 Method Not Allowed: Wrong HTTP method
   - 408 Request Timeout: Upload timeout
   - 413 Payload Too Large: File size exceeds limit

2. **Server Errors (5xx)**
   - 500 Internal Server Error: Unexpected errors
   - 503 Service Unavailable: System overload

### Error Response Format

All errors return consistent JSON structure:

```json
{
  "success": false,
  "error": "Human-readable error message",
  "correlationId": "1699999999999-abc123def",
  "timestamp": "2024-11-10T10:30:00.000Z",
  "details": "Stack trace (development only)"
}
```

### Error Logging Strategy

```typescript
// Log format
{
  level: 'error',
  correlationId: string,
  endpoint: string,
  method: string,
  error: string,
  stack?: string,
  timestamp: string,
  userId?: string,
  requestHeaders: Record<string, string>
}
```

## Testing Strategy

### Unit Tests

1. **API Middleware Tests**
   - Test CORS header generation
   - Test error response formatting
   - Test success response formatting
   - Test method validation
   - Test correlation ID generation

2. **Upload Route Tests**
   - Test valid CSV upload
   - Test invalid content type
   - Test missing file
   - Test malformed CSV
   - Test delimiter detection
   - Test preview generation

3. **Health Check Tests**
   - Test GET request
   - Test HEAD request
   - Test OPTIONS request
   - Test error scenarios

### Integration Tests

1. **End-to-End Upload Flow**
   - Upload valid CSV
   - Verify project creation
   - Verify preview data
   - Verify headers parsed correctly

2. **Error Handling Flow**
   - Upload invalid file
   - Verify error response format
   - Verify correlation ID in logs
   - Verify no HTML responses

3. **CORS Flow**
   - Send OPTIONS preflight
   - Verify CORS headers
   - Send actual request
   - Verify CORS headers in response

### Manual Testing Checklist

- [ ] Upload CSV with comma delimiter
- [ ] Upload CSV with semicolon delimiter
- [ ] Upload CSV with quotes in values
- [ ] Upload empty file
- [ ] Upload file with only headers
- [ ] Upload large file (>10MB)
- [ ] Test health check with GET
- [ ] Test health check with HEAD
- [ ] Test CORS from different origin
- [ ] Verify all responses are JSON
- [ ] Verify correlation IDs in logs
- [ ] Test on Vercel production environment

## Deployment Considerations

### Vercel Configuration

**File:** `vercel.json`

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "buildCommand": "cd frontend && npm run build",
  "devCommand": "cd frontend && npm run dev",
  "installCommand": "cd frontend && npm install",
  "outputDirectory": "frontend/.next",
  "functions": {
    "frontend/src/app/api/**/*.ts": {
      "maxDuration": 30,
      "memory": 1024
    }
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        },
        {
          "key": "Access-Control-Allow-Methods",
          "value": "GET, POST, PUT, DELETE, OPTIONS, HEAD"
        },
        {
          "key": "Access-Control-Allow-Headers",
          "value": "Content-Type, Authorization, X-Correlation-ID"
        }
      ]
    }
  ]
}
```

### Environment Variables

Required environment variables for production:

```bash
# App configuration
NEXT_PUBLIC_APP_URL=https://app.ncskit.org
NEXT_PUBLIC_APP_VERSION=1.0.0
NODE_ENV=production

# Feature flags
NEXT_PUBLIC_ENABLE_DEBUG_LOGS=false
```

### Monitoring and Alerts

1. **Metrics to Track**
   - Upload success rate
   - Upload latency (p50, p95, p99)
   - Error rate by status code
   - Health check response time

2. **Alerts**
   - Upload error rate > 5%
   - Health check failures
   - API response time > 5s
   - 500 errors > 10/minute

3. **Logging**
   - All API requests with correlation ID
   - All errors with stack traces
   - Performance metrics
   - User actions (upload, download)

## Security Considerations

1. **File Upload Security**
   - Validate file size (max 50MB)
   - Validate file type (CSV only)
   - Sanitize file names
   - Scan for malicious content

2. **CORS Security**
   - Restrict origins in production
   - Use credentials: true for authenticated requests
   - Validate Origin header

3. **Rate Limiting**
   - Implement rate limiting per IP
   - Max 10 uploads per minute per user
   - Max 100 requests per minute per IP

4. **Data Privacy**
   - Don't log sensitive data
   - Sanitize error messages
   - Implement data retention policy

## Performance Optimization

1. **File Processing**
   - Stream large files instead of loading into memory
   - Use Web Workers for CSV parsing
   - Implement chunked uploads for large files

2. **Response Optimization**
   - Compress responses with gzip
   - Cache health check responses (5s TTL)
   - Use CDN for static assets

3. **Database Optimization**
   - Index project IDs
   - Implement connection pooling
   - Use read replicas for queries

## Rollback Plan

If issues occur after deployment:

1. **Immediate Rollback**
   - Revert to previous Vercel deployment
   - Monitor error rates
   - Investigate root cause

2. **Gradual Rollout**
   - Deploy to 10% of traffic first
   - Monitor metrics for 1 hour
   - Increase to 50% if stable
   - Full rollout after 24 hours

3. **Feature Flags**
   - Implement feature flag for new upload logic
   - Allow instant disable without deployment
   - A/B test old vs new implementation

## Success Metrics

- Upload success rate > 99%
- Upload latency p95 < 3s
- Health check response time < 100ms
- Zero HTML error responses
- Zero 405 errors for valid requests
- Correlation ID present in 100% of logs
