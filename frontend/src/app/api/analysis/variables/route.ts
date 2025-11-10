import { NextRequest } from 'next/server';
import {
  createErrorResponse,
  createSuccessResponse,
  generateCorrelationId,
  logRequest,
} from '@/lib/api-middleware';
import { getSupabaseClient } from '../lib/supabase';
import { toApiError } from '../lib/errors';

export async function GET(request: NextRequest) {
  const correlationId = generateCorrelationId();

  try {
    logRequest(request, correlationId);

    const supabase = await getSupabaseClient(correlationId);
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return createErrorResponse('Project ID is required', 400, correlationId);
    }

    // Load variables from database
    console.log('[Variables] Loading for project:', projectId);
    const { data: dbVariables, error: variablesError } = await supabase
      .from('analysis_variables')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at');

    if (variablesError) {
      console.error('[Variables] Database error:', variablesError);
      console.error('[Variables] Error details:', JSON.stringify(variablesError, null, 2));
      return createErrorResponse(
        `Failed to load variables: ${variablesError.message || 'Unknown error'}`,
        500,
        correlationId
      );
    }

    console.log('[Variables] Loaded', dbVariables?.length || 0, 'variables');

    // Convert database variables to AnalysisVariable format
    const variables = (dbVariables || []).map((v: any) => ({
      id: v.id,
      projectId: v.project_id,
      columnName: v.column_name,
      displayName: v.display_name,
      semanticName: v.semantic_name,
      dataType: v.data_type || 'numeric',
      isDemographic: v.is_demographic || false,
      demographicType: v.demographic_type,
      missingCount: v.missing_count || 0,
      uniqueCount: v.unique_count || 0,
      createdAt: v.created_at
    }));

    return createSuccessResponse({ variables }, correlationId);

  } catch (error) {
    const apiError = toApiError(error, 'Failed to load variables');
    console.error(`[Variables] ${correlationId}: Error`, apiError, { cause: apiError.cause });
    return createErrorResponse(apiError, apiError.status, correlationId);
  }
}
