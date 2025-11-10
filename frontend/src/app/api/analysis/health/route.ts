import { NextRequest } from 'next/server';
import {
  createErrorResponse,
  createSuccessResponse,
  generateCorrelationId,
  logRequest,
} from '@/lib/api-middleware';
import { DataHealthService } from '@/services/data-health.service';
import { downloadCsvFile } from '../lib/storage';
import { parseCsvWithPapa } from '../lib/parser';
import { getSupabaseClient } from '../lib/supabase';
import { toApiError } from '../lib/errors';

export async function POST(request: NextRequest) {
  const correlationId = generateCorrelationId();

  try {
    logRequest(request, correlationId);

    const supabase = await getSupabaseClient(correlationId);
    const body = await request.json();
    const { projectId } = body;

    if (!projectId) {
      return createErrorResponse('Project ID is required', 400, correlationId);
    }

    // Load project from database
    const { data: project, error: projectError } = await supabase
      .from('analysis_projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      return createErrorResponse('Project not found', 404, correlationId);
    }

    // Load CSV file from storage or inline data
    const fileContent = await downloadCsvFile(supabase, {
      path: (project as any).csv_file_path,
      correlationId,
    });

    const { parsed, allRows } = parseCsvWithPapa(fileContent, correlationId);

    // Perform health check
    const healthReport = DataHealthService.performHealthCheck(allRows);

    // Load variables
    const { data: variables, error: variablesError } = await supabase
      .from('analysis_variables')
      .select('*')
      .eq('project_id', projectId);

    if (variablesError) {
      throw new Error(variablesError.message);
    }

    return createSuccessResponse(
      {
        healthReport,
        variables: variables || [],
      },
      correlationId
    );

  } catch (error) {
    const apiError = toApiError(error, 'Health check failed');
    console.error(`[Health] ${correlationId}: Error`, apiError, { cause: apiError.cause });
    return createErrorResponse(apiError, apiError.status, correlationId);
  }
}
