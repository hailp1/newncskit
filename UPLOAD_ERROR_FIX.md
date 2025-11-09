# Upload Error Fix - Server Invalid Response Format

## Problem
Users were experiencing an error when uploading CSV files:
- Error: "Server returned invalid response format"
- Vietnamese message: "Vấn đề kết nối - Đang thử lại..." (Connection issue - Retrying...)
- The error occurred at https://app.ncskit.org/analysis/new

## Root Cause
The upload API route was not consistently returning JSON responses in all error scenarios, causing the client to receive HTML error pages or non-JSON responses.

## Fixes Applied

### 1. Enhanced Upload API Route (`frontend/src/app/api/analysis/upload/route.ts`)

**Changes:**
- Added comprehensive logging for debugging
- Added content-type validation for incoming requests
- Added explicit CORS headers
- Enhanced error handling to always return JSON
- Added GET handler to return proper error for unsupported methods
- Added timestamp to error responses for debugging

**Key improvements:**
```typescript
// Validate content type
const contentType = request.headers.get('content-type');
if (!contentType || !contentType.includes('multipart/form-data')) {
  return NextResponse.json(
    { success: false, error: 'Invalid content type...' },
    { status: 400, headers: responseHeaders }
  );
}

// Always return JSON in catch block
return NextResponse.json(
  { 
    success: false,
    error: errorMessage,
    details: error instanceof Error ? error.stack : undefined,
    timestamp: new Date().toISOString()
  },
  { status: 500, headers: responseHeaders }
);
```

### 2. Improved CSVUploader Component (`frontend/src/components/analysis/CSVUploader.tsx`)

**Changes:**
- Added automatic retry logic with exponential backoff (up to 3 retries)
- Added 30-second timeout for upload requests
- Enhanced error detection for HTML responses
- Better error messages in Vietnamese
- Improved logging for debugging

**Key improvements:**
```typescript
// Retry logic
const uploadFile = async (file: File, retryCount = 0) => {
  const MAX_RETRIES = 3;
  
  try {
    // Add timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    
    const response = await fetch('/api/analysis/upload', {
      method: 'POST',
      body: formData,
      signal: controller.signal,
    });
    
    // Detect HTML responses
    if (text.includes('<!DOCTYPE') || text.includes('<html')) {
      throw new Error('Server error: Received HTML instead of JSON...');
    }
  } catch (err) {
    // Retry on network errors
    if ((error.name === 'AbortError' || error.message.includes('fetch')) 
        && retryCount < MAX_RETRIES) {
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount)));
      return uploadFile(file, retryCount + 1);
    }
  }
};
```

### 3. Added Test Endpoint (`frontend/src/app/api/analysis/test/route.ts`)

Created a simple test endpoint to verify API routes are working:
- GET `/api/analysis/test` - Returns API status
- POST `/api/analysis/test` - Confirms POST requests work

## Testing Instructions

### 1. Test API Endpoint
```bash
# Test if API is reachable
curl https://app.ncskit.org/api/analysis/test

# Expected response:
{
  "success": true,
  "message": "Analysis API is working",
  "timestamp": "2025-11-10T...",
  "endpoints": {
    "upload": "/api/analysis/upload (POST)",
    "health": "/api/analysis/health (POST)",
    "test": "/api/analysis/test (GET)"
  }
}
```

### 2. Test Upload Flow
1. Navigate to https://app.ncskit.org/analysis/new
2. Upload a CSV file
3. Check browser console for detailed logs:
   - `[CSVUploader]` logs show client-side activity
   - `[Upload API]` logs show server-side processing
4. If error occurs, check:
   - Network tab for actual response
   - Console for error details
   - Retry attempts (should retry up to 3 times on network errors)

### 3. Monitor Logs
Check Vercel logs for server-side errors:
```bash
vercel logs --follow
```

Look for:
- `[Upload API]` prefixed messages
- Error stack traces
- Response status codes

## Deployment

### Option 1: Deploy via Vercel CLI
```bash
cd frontend
vercel --prod
```

### Option 2: Deploy via Git Push
```bash
git add .
git commit -m "fix: resolve upload API non-JSON response error"
git push origin main
```

### Option 3: Use PowerShell Script
```powershell
.\deploy-to-vercel.ps1
```

## Verification Checklist

After deployment, verify:

- [ ] Test endpoint responds: `curl https://app.ncskit.org/api/analysis/test`
- [ ] Upload page loads: https://app.ncskit.org/analysis/new
- [ ] CSV upload works without errors
- [ ] Error messages are in Vietnamese when appropriate
- [ ] Retry logic works on network issues
- [ ] Console logs show detailed debugging info

## Additional Improvements

### Future Enhancements
1. Add server-side file validation
2. Implement progress tracking for large files
3. Add file chunking for very large uploads
4. Implement upload resume capability
5. Add more detailed error codes for different failure scenarios

### Monitoring
Consider adding:
- Error tracking (Sentry, LogRocket)
- Performance monitoring
- Upload success/failure metrics
- User feedback collection

## Troubleshooting

### If upload still fails:

1. **Check Network Tab**
   - Look at the actual response from `/api/analysis/upload`
   - Check if it's HTML (Next.js error page) or JSON

2. **Check Server Logs**
   - Look for `[Upload API]` logs in Vercel
   - Check for unhandled exceptions

3. **Verify Environment**
   - Ensure all environment variables are set
   - Check Supabase connection if used

4. **Test Locally**
   ```bash
   cd frontend
   npm run dev
   # Test at http://localhost:3000/analysis/new
   ```

5. **Check Middleware**
   - Verify middleware isn't blocking API routes
   - Check authentication requirements

## Related Files
- `frontend/src/app/api/analysis/upload/route.ts` - Upload API endpoint
- `frontend/src/components/analysis/CSVUploader.tsx` - Upload component
- `frontend/src/app/(dashboard)/analysis/new/page.tsx` - Analysis workflow page
- `frontend/src/middleware.ts` - Next.js middleware (excludes API routes)
- `frontend/next.config.ts` - Next.js configuration

## Contact
If issues persist, check:
- Browser console for client-side errors
- Vercel logs for server-side errors
- Network tab for actual HTTP responses
