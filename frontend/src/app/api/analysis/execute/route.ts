import { NextRequest } from 'next/server';
import {
  createErrorResponse,
  createSuccessResponse,
  generateCorrelationId,
  logRequest,
} from '@/lib/api-middleware';
import { AnalysisType } from '@/types/analysis';
import { AnalysisService } from '@/services/analysis.service';
import { getSupabaseClient } from '../lib/supabase';
import { downloadCsvFile } from '../lib/storage';
import { parseCsvWithPapa } from '../lib/parser';
import { ApiError, toApiError } from '../lib/errors';
import type { AnalysisResultInsert } from '@/types/analysis-db';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const correlationId = generateCorrelationId();
  let supabase: Awaited<ReturnType<typeof getSupabaseClient>> | null = null;
  let projectId: string | null = null;

  try {
    logRequest(request, correlationId);

    supabase = await getSupabaseClient(correlationId);

    // Check authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return createErrorResponse('Unauthorized', 401, correlationId);
    }

    const body = await request.json();
    projectId = body.projectId;
    const analysisTypes: AnalysisType[] = body.analysisTypes || [];

    if (!projectId) {
      return createErrorResponse('Project ID is required', 400, correlationId);
    }

    // Verify project ownership
    const { data: project, error: projectError } = await supabase
      .from('analysis_projects')
      .select('*')
      .eq('id', projectId)
      .eq('user_id', session.user.id)
      .single();

    if (projectError || !project) {
      return createErrorResponse('Project not found', 404, correlationId);
    }

    // Update project status to analyzing
    // @ts-ignore - Supabase type inference issue with analysis tables
    await (supabase
      .from('analysis_projects') as any)
      .update({
        status: 'analyzing' as const,
        updated_at: new Date().toISOString(),
      })
      .eq('id', projectId);

    // Load CSV file from storage or inline data
    const fileContent = await downloadCsvFile(supabase, {
      path: (project as any).csv_file_path,
      correlationId,
    });
    const { parsed } = parseCsvWithPapa(fileContent, correlationId);

    // Load variables
    const { data: variables, error: variablesError } = await supabase
      .from('analysis_variables')
      .select('*')
      .eq('project_id', projectId);

    if (variablesError) {
      throw new ApiError(variablesError.message ?? 'Failed to load variables', {
        status: 500,
        details: { correlationId, projectId },
      });
    }

    // Load variable groups
    const { data: groups, error: groupsError } = await supabase
      .from('variable_groups')
      .select(`
        *,
        variables:analysis_variables(*)
      `)
      .eq('project_id', projectId);

    if (groupsError) {
      throw new ApiError(groupsError.message ?? 'Failed to load variable groups', {
        status: 500,
        details: { correlationId, projectId },
      });
    }

    // Load demographics
    const { data: demographics, error: demographicsError } = await supabase
      .from('analysis_variables')
      .select(`
        *,
        ranks:demographic_ranks(*),
        categories:ordinal_categories(*)
      `)
      .eq('project_id', projectId)
      .eq('is_demographic', true);

    if (demographicsError) {
      throw new ApiError(demographicsError.message ?? 'Failed to load demographics', {
        status: 500,
        details: { correlationId, projectId },
      });
    }

    // Load analysis configurations
    const { data: configs, error: configsError } = await supabase
      .from('analysis_configurations')
      .select('*')
      .eq('project_id', projectId)
      .in('analysis_type', analysisTypes);

    if (configsError) {
      throw new ApiError(configsError.message ?? 'Failed to load analysis configurations', {
        status: 500,
        details: { correlationId, projectId },
      });
    }

    // Check R service health
    const isRServiceHealthy = await AnalysisService.checkRServiceHealth();
    
    if (!isRServiceHealthy) {
      console.warn('R Analytics service is not available, using mock results');
    }

    // Prepare data for R
    const preparedData = AnalysisService.prepareDataForR(
      parsed.data,
      variables || [],
      demographics || []
    );

    // Execute each analysis
    const results = [];
    
    for (const analysisType of analysisTypes as AnalysisType[]) {
      const analysisStartTime = Date.now();
      
      try {
        const config = configs?.find(c => (c as any).analysis_type === analysisType);
        const analysisConfig = (config as any)?.configuration || {};

        let analysisResult;

        if (isRServiceHealthy) {
          // Execute real analysis
          analysisResult = await AnalysisService.executeAnalysis(
            analysisType,
            preparedData,
            variables || [],
            groups || [],
            demographics || [],
            analysisConfig
          );
        } else {
          // Use mock results
          analysisResult = {
            message: 'Mock result (R service unavailable)',
            type: analysisType,
            timestamp: new Date().toISOString(),
          };
        }

        const executionTime = Date.now() - analysisStartTime;

        results.push({
          project_id: projectId,
          analysis_type: analysisType,
          results: analysisResult,
          execution_time_ms: executionTime,
        });

      } catch (analysisError) {
        console.error(`Error executing ${analysisType}:`, analysisError);
        
        // Save error result
        results.push({
          project_id: projectId,
          analysis_type: analysisType,
          results: {
            error: true,
            message: (analysisError as Error).message,
          },
          execution_time_ms: Date.now() - analysisStartTime,
        });
      }
    }

    // Save results to database
    const { error: resultsError } = await (supabase
      .from('analysis_results') as any)
      .insert(results as AnalysisResultInsert[]);

    if (resultsError) {
      console.error('Error saving results:', resultsError);
    }

    // Update project status to completed
    await (supabase
      .from('analysis_projects') as any)
      .update({
        status: 'completed' as const,
        updated_at: new Date().toISOString(),
      })
      .eq('id', projectId);

    const totalTime = Date.now() - startTime;

    return createSuccessResponse(
      {
        message: 'Analyses executed successfully',
        jobId: `job-${Date.now()}`,
        executionTime: totalTime,
        resultsCount: results.length,
        rServiceAvailable: isRServiceHealthy,
      },
      correlationId
    );

  } catch (error) {
    const apiError = toApiError(error, 'Analysis execution failed');
    console.error(`[Execute] ${correlationId}: Error`, apiError, { cause: apiError.cause });
    
    // Update project status to error
    if (supabase && projectId) {
      try {
        await (supabase
          .from('analysis_projects') as any)
          .update({
            status: 'error' as const,
            updated_at: new Date().toISOString(),
          })
          .eq('id', projectId);
      } catch (updateError) {
        console.error('Error updating project status:', updateError);
      }
    }

    return createErrorResponse(apiError, apiError.status, correlationId);
  }
}
