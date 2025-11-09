import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { VariableGroupService } from '@/services/variable-group.service';

export async function POST(request: NextRequest) {
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

    const { projectId } = await request.json();

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    // Get project details
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

    // Load variables from database
    const { data: variables, error: variablesError } = await supabase
      .from('analysis_variables')
      .select('*')
      .eq('project_id', projectId)
      .order('column_name');

    if (variablesError) {
      return NextResponse.json(
        { error: 'Failed to load variables: ' + variablesError.message },
        { status: 500 }
      );
    }

    if (!variables || variables.length === 0) {
      return NextResponse.json(
        { error: 'No variables found for this project' },
        { status: 404 }
      );
    }

    // Convert database format to service format
    const analysisVariables = (variables as any[]).map((v: any) => ({
      id: v.id,
      projectId: v.project_id,
      columnName: v.column_name,
      displayName: v.display_name,
      dataType: v.data_type,
      isDemographic: v.is_demographic || false,
      demographicType: v.demographic_type,
      semanticName: v.semantic_name,
      variableGroupId: v.variable_group_id,
      missingCount: v.missing_count || 0,
      uniqueCount: v.unique_count || 0,
      minValue: v.min_value,
      maxValue: v.max_value,
      meanValue: v.mean_value,
      createdAt: v.created_at,
    }));

    // Run grouping analysis
    const suggestions = VariableGroupService.suggestGroups(analysisVariables);

    return NextResponse.json({
      success: true,
      suggestions,
      totalVariables: variables.length,
      suggestedGroups: suggestions.length,
      variables: analysisVariables, // Include variables in response for debugging
    });

  } catch (error) {
    console.error('Variable grouping error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}
