import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    // Load variables from database
    console.log('[Variables] Loading for project:', projectId);
    const { data: dbVariables, error: variablesError } = await supabase
      .from('analysis_variables')
      .select('*')
      .eq('analysis_project_id', projectId)
      .order('created_at');

    if (variablesError) {
      console.error('[Variables] Database error:', variablesError);
      console.error('[Variables] Error details:', JSON.stringify(variablesError, null, 2));
      return NextResponse.json(
        { error: `Failed to load variables: ${variablesError.message || 'Unknown error'}` },
        { status: 500 }
      );
    }

    console.log('[Variables] Loaded', dbVariables?.length || 0, 'variables');

    // Convert database variables to AnalysisVariable format
    const variables = (dbVariables || []).map((v: any) => ({
      id: v.id,
      projectId: v.analysis_project_id,
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

    return NextResponse.json({
      success: true,
      variables,
    });

  } catch (error) {
    console.error('Load variables error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to load variables' },
      { status: 500 }
    );
  }
}
