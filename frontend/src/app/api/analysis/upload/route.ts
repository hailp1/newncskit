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
import { ApiError, toApiError } from '../lib/errors';
import { parseCsvContent } from '../lib/parser';
import { getSupabaseClient } from '../lib/supabase';
import { uploadCsvFile } from '../lib/storage';
import type { AnalysisProject, AnalysisVariableInsert } from '@/types/analysis-db';

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
    const supabase = await getSupabaseClient(correlationId);

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
    const fileContent = await file.text();
    const { headers: csvHeaders, allRows, previewRows } = parseCsvContent(fileContent, correlationId);

    console.log(`[Upload] ${correlationId}: Parsed ${csvHeaders.length} headers`);

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
    const uploadResult = await uploadCsvFile(supabase, {
      userId: session.user.id,
      file,
      fileContent,
      correlationId,
    });

    // Create project in database
    // @ts-ignore - Supabase type inference issue with analysis tables
    const projectResult = await supabase
      .from('analysis_projects')
      .insert({
        user_id: session.user.id,
        name: name || file.name.replace('.csv', ''),
        description: `Uploaded on ${new Date().toLocaleDateString()}${uploadResult.fromStorage ? '' : ' (CSV stored inline)'}`,
        csv_file_path: uploadResult.path,
        csv_file_size: file.size,
        row_count: allRows.length - 1,
        column_count: csvHeaders.length,
        status: 'draft', // Valid status: draft, configured, analyzing, completed, error
      })
      .select()
      .single();
    
    const project = projectResult.data as AnalysisProject | null;
    const projectError = projectResult.error;

    if (projectError || !project) {
      throw new ApiError(`Failed to create project: ${projectError?.message || 'Unknown error'}`, {
        status: 500,
        details: { correlationId, supabaseError: projectError },
      });
    }

    console.log(`[Upload] ${correlationId}: Project created: ${project.id}`);

    // Create variables in database
    const variables: AnalysisVariableInsert[] = csvHeaders.map((header) => ({
      project_id: project.id,  // Column name is 'project_id' not 'analysis_project_id'
      column_name: header,
      display_name: header,
      data_type: 'numeric' as const, // Will be detected properly later
      is_demographic: false,
      missing_count: 0,
      unique_count: 0,
    }));

    console.log(`[Upload] ${correlationId}: Inserting ${variables.length} variables`);
    // @ts-ignore - Supabase type inference issue with analysis tables
    const variablesResult = await supabase
      .from('analysis_variables')
      .insert(variables)
      .select();
    
    const insertedVariables = variablesResult.data;
    const variablesError = variablesResult.error;

    if (variablesError) {
      // This is critical - without variables, the project is unusable
      // Try to delete the project and fail the upload
      await supabase.from('analysis_projects').delete().eq('id', project.id);

      throw new ApiError(`Failed to create variables: ${variablesError?.message || 'Unknown error'}`, {
        status: 500,
        details: { correlationId, supabaseError: variablesError, projectId: project.id },
      });
    }

    console.log(`[Upload] ${correlationId}: Created ${insertedVariables?.length || 0} variables successfully`);

    const responseData = {
      project: {
        id: project.id,
        name: project.name,
        rowCount: allRows.length,
        columnCount: csvHeaders.length,
      },
      preview: previewRows,
      headers: csvHeaders,
      healthReport,
    };

    console.log(`[Upload] ${correlationId}: Success - Project ${project.id} created`);

    return createSuccessResponse(responseData, correlationId);

  } catch (error) {
    const apiError = toApiError(error, 'Upload failed');
    console.error(`[Upload] ${correlationId}: Error:`, apiError, { cause: apiError.cause });
    return createErrorResponse(
      apiError,
      apiError.status,
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
