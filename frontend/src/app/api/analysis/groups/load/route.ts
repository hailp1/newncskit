import { NextRequest } from 'next/server';
import {
  createErrorResponse,
  createSuccessResponse,
  generateCorrelationId,
  logRequest,
} from '@/lib/api-middleware';
import { getSupabaseClient } from '../../lib/supabase';
import { toApiError } from '../../lib/errors';

/**
 * GET /api/analysis/groups/load?projectId={projectId}
 * 
 * Load saved variable groups for a project
 * Used to determine if a project is existing (has saved groups) or new
 */
export async function GET(request: NextRequest) {
  const correlationId = generateCorrelationId();

  try {
    logRequest(request, correlationId);

    const supabase = await getSupabaseClient(correlationId);

    // Check authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return createErrorResponse('Unauthorized', 401, correlationId);
    }

    const searchParams = request.nextUrl.searchParams;
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return createErrorResponse('Project ID is required', 400, correlationId);
    }

    // Get project to verify ownership
    const { data: project, error: projectError } = await supabase
      .from('analysis_projects')
      .select('id, name, status, created_at, updated_at')
      .eq('id', projectId)
      .eq('user_id', session.user.id)
      .single();

    if (projectError || !project) {
      return createErrorResponse('Project not found', 404, correlationId);
    }

    // Get saved variable groups
    const { data: groups, error: groupsError } = await supabase
      .from('variable_groups')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true });

    if (groupsError) {
      console.error('Error loading groups:', groupsError);
      return createErrorResponse('Failed to load groups', 500, correlationId);
    }

    // Get demographics
    const { data: demographics, error: demographicsError } = await supabase
      .from('analysis_variables')
      .select('*')
      .eq('project_id', projectId)
      .eq('is_demographic', true);

    if (demographicsError) {
      console.error('Error loading demographics:', demographicsError);
    }

    // Determine if this is a new or existing project
    const hasGroups = groups && groups.length > 0;
    const hasDemographics = demographics && demographics.length > 0;
    const isExistingProject = hasGroups || hasDemographics;

    // Type assertion for project data
    const projectData = project as any;

    return createSuccessResponse(
      {
        project: {
          id: projectData.id,
          name: projectData.name,
          status: projectData.status,
          createdAt: projectData.created_at,
          updatedAt: projectData.updated_at,
        },
        groups: groups || [],
        demographics: demographics || [],
        isExistingProject,
        hasGroups,
        hasDemographics,
      },
      correlationId
    );

  } catch (error) {
    const apiError = toApiError(error, 'Load failed');
    console.error(`[Groups Load] ${correlationId}: Error`, apiError, { cause: apiError.cause });
    return createErrorResponse(apiError, apiError.status, correlationId);
  }
}
