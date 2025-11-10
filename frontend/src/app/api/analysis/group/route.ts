import { NextRequest } from 'next/server';
import { VariableGroupingService } from '@/services/variable-grouping.service';
import { DemographicService } from '@/services/demographic.service';
import { RoleSuggestionService } from '@/services/role-suggestion.service';
import {
  createErrorResponse,
  createSuccessResponse,
  generateCorrelationId,
  logRequest,
} from '@/lib/api-middleware';
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

    // Load variables from database
    console.log('[Group] Loading variables for project:', projectId);
    const { data: dbVariables, error: variablesError } = await supabase
      .from('analysis_variables')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at');

    if (variablesError) {
      console.error('[Group] Database error:', variablesError);
      console.error('[Group] Error details:', JSON.stringify(variablesError, null, 2));
      return createErrorResponse(
        `Failed to load variables: ${variablesError.message || 'Unknown error'}`,
        500,
        correlationId
      );
    }

    console.log('[Group] Loaded', dbVariables?.length || 0, 'variables');

    // Convert database variables to AnalysisVariable format
    const variables = (dbVariables || []).map((v: any) => ({
      id: v.id,
      projectId: v.project_id,
      columnName: v.column_name,
      displayName: v.display_name,
      dataType: v.data_type || 'numeric',
      isDemographic: v.is_demographic || false,
      missingCount: v.missing_count || 0,
      uniqueCount: v.unique_count || 0,
      createdAt: v.created_at
    }));

    if (variables.length === 0) {
      return createErrorResponse('No variables found for project', 404, correlationId);
    }

    // Get grouping suggestions using the service
    const groupingSuggestions = VariableGroupingService.suggestGroupsCaseInsensitive(variables);

    // Get demographic suggestions
    const demographicSuggestions = DemographicService.detectDemographics(variables);

    // Generate role suggestions for variables
    const roleSuggestions = RoleSuggestionService.suggestRoles(variables);

    // Generate latent variable suggestions for groups
    const groupsForLatent = groupingSuggestions.map(s => ({
      id: `group-${s.suggestedName}`,
      name: s.suggestedName,
      variables: s.variables,
      projectId,
      createdAt: new Date(),
      updatedAt: new Date(),
      isCustom: false
    }));
    const latentSuggestions = RoleSuggestionService.suggestLatentVariables(groupsForLatent);

    return createSuccessResponse(
      {
        suggestions: groupingSuggestions.map(s => ({
          groupName: s.suggestedName,
          variables: s.variables,
          confidence: s.confidence,
          reasoning: s.reason
        })),
        demographics: demographicSuggestions.map(d => ({
          variable: d.variable,
          confidence: d.confidence,
          reasons: d.reasons,
          suggestedType: d.type
        })),
        roleSuggestions: roleSuggestions.filter(r => r.suggestedRole !== 'none'),
        latentSuggestions,
        totalVariables: variables.length,
        suggestedGroups: groupingSuggestions.length,
        suggestedDemographics: demographicSuggestions.length
      },
      correlationId
    );

  } catch (error) {
    const apiError = toApiError(error, 'Grouping failed');
    console.error(`[Group] ${correlationId}: Error`, apiError, { cause: apiError.cause });
    return createErrorResponse(apiError, apiError.status, correlationId);
  }
}
