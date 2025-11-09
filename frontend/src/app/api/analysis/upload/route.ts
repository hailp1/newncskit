import { NextRequest, NextResponse } from 'next/server';

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

export async function POST(request: NextRequest) {
  // Set response headers
  const responseHeaders = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store',
    'Access-Control-Allow-Origin': '*',
  };

  try {
    console.log('[Upload API] Starting upload...');
    console.log('[Upload API] Request method:', request.method);
    console.log('[Upload API] Request URL:', request.url);
    console.log('[Upload API] Request headers:', Object.fromEntries(request.headers.entries()));
    
    // Validate content type
    const contentType = request.headers.get('content-type');
    if (!contentType || !contentType.includes('multipart/form-data')) {
      console.error('[Upload API] Invalid content type:', contentType);
      return NextResponse.json(
        { success: false, error: 'Invalid content type. Expected multipart/form-data' },
        { status: 400, headers: responseHeaders }
      );
    }
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const name = formData.get('name') as string;

    console.log('[Upload API] File received:', file?.name, file?.size, file?.type);

    if (!file) {
      console.error('[Upload API] No file provided');
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400, headers: responseHeaders }
      );
    }

    // Read file content
    let text: string;
    try {
      text = await file.text();
      console.log('[Upload API] File read successfully, length:', text.length);
    } catch (readError) {
      console.error('[Upload API] Error reading file:', readError);
      return NextResponse.json(
        { success: false, error: 'Failed to read file content' },
        { status: 400, headers: responseHeaders }
      );
    }

    // Split lines and filter empty ones
    const lines = text.split(/\r?\n/).filter(line => line.trim());
    console.log('[Upload API] Total lines:', lines.length);
    
    if (lines.length < 2) {
      console.error('[Upload API] Not enough lines');
      return NextResponse.json(
        { success: false, error: 'File must contain at least a header row and one data row' },
        { status: 400, headers: responseHeaders }
      );
    }

    // Parse CSV header - handle both comma and semicolon
    const delimiter = lines[0].includes(';') ? ';' : ',';
    const csvHeaders = lines[0]
      .split(delimiter)
      .map(h => h.trim().replace(/^["']|["']$/g, ''))
      .filter(h => h.length > 0);
    
    console.log('[Upload API] CSV Headers:', csvHeaders);
    
    if (csvHeaders.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid headers found in CSV file' },
        { status: 400, headers: responseHeaders }
      );
    }

    // Parse first few rows for preview
    const previewRows = lines.slice(1, Math.min(6, lines.length)).map((line, idx) => {
      try {
        const values = line
          .split(delimiter)
          .map(v => v.trim().replace(/^["']|["']$/g, ''));
        
        const row: Record<string, string> = {};
        csvHeaders.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        return row;
      } catch (parseError) {
        console.error(`[Upload API] Error parsing row ${idx}:`, parseError);
        return {};
      }
    }).filter(row => Object.keys(row).length > 0);

    console.log('[Upload API] Preview rows:', previewRows.length);

    // Generate project ID
    const projectId = `project-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    console.log('[Upload API] Generated project ID:', projectId);

    const response = {
      success: true,
      project: {
        id: projectId,
        name: name || file.name.replace('.csv', ''),
        rowCount: lines.length - 1,
        columnCount: csvHeaders.length
      },
      preview: previewRows,
      headers: csvHeaders
    };

    console.log('[Upload API] Sending response:', JSON.stringify(response).substring(0, 200));

    return NextResponse.json(response, {
      status: 200,
      headers: responseHeaders,
    });

  } catch (error) {
    console.error('[Upload API] Unexpected error:', error);
    console.error('[Upload API] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    const errorMessage = error instanceof Error ? error.message : 'Upload failed';
    
    // Ensure we always return JSON
    const errorResponse = { 
      success: false,
      error: errorMessage,
      details: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    };
    
    console.log('[Upload API] Sending error response:', JSON.stringify(errorResponse));
    
    return NextResponse.json(
      errorResponse,
      { 
        status: 500,
        headers: responseHeaders,
      }
    );
  }
}

// Add a catch-all handler to ensure we always return JSON
export async function GET() {
  return NextResponse.json(
    { 
      success: false, 
      error: 'Method not allowed. Use POST to upload files.',
      allowedMethods: ['POST', 'OPTIONS']
    },
    { 
      status: 405,
      headers: {
        'Content-Type': 'application/json',
        'Allow': 'POST, OPTIONS'
      }
    }
  );
}
