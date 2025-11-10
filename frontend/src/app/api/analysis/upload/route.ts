import { NextRequest, NextResponse } from 'next/server';
import {
  generateCorrelationId,
  createErrorResponse,
  createSuccessResponse,
  validateMethod,
  logRequest,
  getCorsHeaders,
} from '@/lib/api-middleware';
import { DataHealthService } from '@/services/data-health.service';

// Handle OPTIONS for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(),
  });
}

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

    // Parse CSV header - handle both comma and semicolon
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

    console.log(`[Upload] ${correlationId}: Parsed ${csvHeaders.length} headers`);

    // Parse all data for health check
    const allRows = lines.map(line => {
      return line
        .split(delimiter)
        .map(v => v.trim().replace(/^["']|["']$/g, ''));
    });

    // Parse first few rows for preview
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

    // Perform health check
    let healthReport;
    try {
      healthReport = DataHealthService.performHealthCheck(allRows);
      console.log(`[Upload] ${correlationId}: Health check completed`);
    } catch (healthError) {
      console.error(`[Upload] ${correlationId}: Health check failed:`, healthError);
      // Continue without health report if it fails
      healthReport = null;
    }

    const responseData = {
      project: {
        id: projectId,
        name: name || file.name.replace('.csv', ''),
        rowCount: lines.length - 1,
        columnCount: csvHeaders.length,
      },
      preview: previewRows,
      headers: csvHeaders,
      healthReport,
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
