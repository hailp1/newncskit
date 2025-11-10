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
import { createClient } from '@/lib/supabase/server';

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

    // Get Supabase client
    const supabase = await createClient();

    // Check authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return createErrorResponse('Unauthorized', 401, correlationId);
    }

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

    // Try to upload CSV file to Supabase Storage
    const fileName = `${session.user.id}/${Date.now()}-${file.name}`;
    let csvFilePath = fileName;
    let storageUploadSuccess = false;
    
    try {
      const { error: uploadError } = await supabase.storage
        .from('analysis-csv-files')
        .upload(fileName, file, {
          contentType: 'text/csv',
          upsert: false,
        });

      if (uploadError) {
        console.warn(`[Upload] ${correlationId}: Storage upload failed (bucket may not exist):`, uploadError);
        console.log(`[Upload] ${correlationId}: Will store CSV content in database instead`);
        // Store CSV content in database as fallback
        csvFilePath = `inline:${text.substring(0, 1000000)}`; // Store up to 1MB inline
      } else {
        storageUploadSuccess = true;
        console.log(`[Upload] ${correlationId}: File uploaded to storage: ${fileName}`);
      }
    } catch (storageError) {
      console.warn(`[Upload] ${correlationId}: Storage error:`, storageError);
      console.log(`[Upload] ${correlationId}: Will store CSV content in database instead`);
      csvFilePath = `inline:${text.substring(0, 1000000)}`;
    }

    // Create project in database
    const { data: project, error: projectError } = await (supabase
      .from('analysis_projects') as any)
      .insert({
        user_id: session.user.id,
        name: name || file.name.replace('.csv', ''),
        description: `Uploaded on ${new Date().toLocaleDateString()}${storageUploadSuccess ? '' : ' (CSV stored inline)'}`,
        csv_file_path: csvFilePath,
        csv_file_size: file.size,
        row_count: lines.length - 1,
        column_count: csvHeaders.length,
        status: 'draft', // Valid status: draft, configured, analyzing, completed, error
      })
      .select()
      .single();

    if (projectError || !project) {
      console.error(`[Upload] ${correlationId}: Project creation failed:`, projectError);
      console.error(`[Upload] ${correlationId}: Error details:`, JSON.stringify(projectError, null, 2));
      console.error(`[Upload] ${correlationId}: Insert data:`, {
        user_id: session.user.id,
        name: name || file.name.replace('.csv', ''),
        csv_file_size: file.size,
        row_count: lines.length - 1,
        column_count: csvHeaders.length,
      });
      return createErrorResponse(
        `Failed to create project: ${projectError?.message || 'Unknown error'}`,
        500,
        correlationId
      );
    }

    console.log(`[Upload] ${correlationId}: Project created: ${project.id}`);

    // Create variables in database
    const variables = csvHeaders.map((header) => ({
      project_id: project.id,  // Column name is 'project_id' not 'analysis_project_id'
      column_name: header,
      display_name: header,
      data_type: 'numeric', // Will be detected properly later
      is_demographic: false,
      missing_count: 0,
      unique_count: 0,
    }));

    console.log(`[Upload] ${correlationId}: Inserting ${variables.length} variables`);
    const { data: insertedVariables, error: variablesError } = await (supabase
      .from('analysis_variables') as any)
      .insert(variables)
      .select();

    if (variablesError) {
      console.error(`[Upload] ${correlationId}: Variables creation failed:`, variablesError);
      console.error(`[Upload] ${correlationId}: Variables error details:`, JSON.stringify(variablesError, null, 2));
      console.error(`[Upload] ${correlationId}: Sample variable:`, variables[0]);
      
      // This is critical - without variables, the project is unusable
      // Try to delete the project and fail the upload
      await supabase.from('analysis_projects').delete().eq('id', project.id);
      
      return createErrorResponse(
        `Failed to create variables: ${variablesError?.message || 'Unknown error'}. Please try again.`,
        500,
        correlationId
      );
    }

    console.log(`[Upload] ${correlationId}: Created ${insertedVariables?.length || 0} variables successfully`);

    const responseData = {
      project: {
        id: project.id,
        name: project.name,
        rowCount: lines.length - 1,
        columnCount: csvHeaders.length,
      },
      preview: previewRows,
      headers: csvHeaders,
      healthReport,
    };

    console.log(`[Upload] ${correlationId}: Success - Project ${project.id} created`);

    return createSuccessResponse(responseData, correlationId);

  } catch (error) {
    console.error(`[Upload] ${correlationId}: Error:`, error);
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
