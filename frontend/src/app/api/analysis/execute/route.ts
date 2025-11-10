import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { AnalysisType } from '@/types/analysis';
import { AnalysisService } from '@/services/analysis.service';
import Papa from 'papaparse';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { projectId, analysisTypes } = await request.json();

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    // Verify project ownership
    const { data: project, error: projectError } = await supabase
      .from('analysis_projects')
      .select('*')
      .eq('id', projectId)
      .eq('user_id', session.user.id)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Update project status to analyzing
    await (supabase
      .from('analysis_projects') as any)
      .update({
        status: 'analyzing',
        updated_at: new Date().toISOString(),
      })
      .eq('id', projectId);

    // Load CSV file from storage or inline data
    let fileContent: string;
    const csvFilePath = (project as any).csv_file_path;
    
    if (csvFilePath.startsWith('inline:')) {
      // CSV stored inline in database
      fileContent = csvFilePath.substring(7); // Remove 'inline:' prefix
      console.log('[Execute] Loading CSV from inline storage');
    } else {
      // CSV stored in Supabase Storage
      const { data: fileData, error: downloadError } = await supabase.storage
        .from('analysis-csv-files')
        .download(csvFilePath);

      if (downloadError || !fileData) {
        throw new Error('Failed to download CSV file from storage');
      }

      fileContent = await fileData.text();
      console.log('[Execute] Loading CSV from Supabase Storage');
    }
    const parsed = Papa.parse(fileContent, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
    });

    if (parsed.errors.length > 0) {
      throw new Error('CSV parsing failed');
    }

    // Load variables
    const { data: variables } = await supabase
      .from('analysis_variables')
      .select('*')
      .eq('analysis_project_id', projectId);

    // Load variable groups
    const { data: groups } = await supabase
      .from('variable_groups')
      .select(`
        *,
        variables:analysis_variables(*)
      `)
      .eq('project_id', projectId);

    // Load demographics
    const { data: demographics } = await supabase
      .from('analysis_variables')
      .select(`
        *,
        ranks:demographic_ranks(*),
        categories:ordinal_categories(*)
      `)
      .eq('analysis_project_id', projectId)
      .eq('is_demographic', true);

    // Load analysis configurations
    const { data: configs } = await supabase
      .from('analysis_configurations')
      .select('*')
      .eq('project_id', projectId)
      .in('analysis_type', analysisTypes);

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
      .insert(results);

    if (resultsError) {
      console.error('Error saving results:', resultsError);
    }

    // Update project status to completed
    await (supabase
      .from('analysis_projects') as any)
      .update({
        status: 'completed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', projectId);

    const totalTime = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      message: 'Analyses executed successfully',
      jobId: `job-${Date.now()}`,
      executionTime: totalTime,
      resultsCount: results.length,
      rServiceAvailable: isRServiceHealthy,
    });

  } catch (error) {
    console.error('Execute analysis error:', error);
    
    // Update project status to error
    try {
      const supabase = await createClient();
      const { projectId } = await request.json();
      
      await (supabase
        .from('analysis_projects') as any)
        .update({
          status: 'error',
          updated_at: new Date().toISOString(),
        })
        .eq('id', projectId);
    } catch (updateError) {
      console.error('Error updating project status:', updateError);
    }

    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}
