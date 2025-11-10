import { NextRequest, NextResponse } from 'next/server';
import { VariableGroupingService } from '@/services/variable-grouping.service';
import { DemographicService } from '@/services/demographic.service';
import { RoleSuggestionService } from '@/services/role-suggestion.service';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { projectId } = body;

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    // Load project from database
    const { data: project, error: projectError } = await supabase
      .from('analysis_projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Load variables from database
    console.log('[Group] Loading variables for project:', projectId);
    const { data: dbVariables, error: variablesError } = await supabase
      .from('analysis_variables')
      .select('*')
      .eq('analysis_project_id', projectId)
      .order('display_order');

    if (variablesError) {
      console.error('[Group] Database error:', variablesError);
      console.error('[Group] Error details:', JSON.stringify(variablesError, null, 2));
      return NextResponse.json(
        { error: `Failed to load variables: ${variablesError.message || 'Unknown error'}` },
        { status: 500 }
      );
    }

    console.log('[Group] Loaded', dbVariables?.length || 0, 'variables');

    // Convert database variables to AnalysisVariable format
    const variables = (dbVariables || []).map((v: any) => ({
      id: v.id,
      projectId: v.analysis_project_id,
      columnName: v.column_name,
      displayName: v.display_name,
      dataType: v.data_type || 'numeric',
      isDemographic: v.is_demographic || false,
      missingCount: v.missing_count || 0,
      uniqueCount: v.unique_count || 0,
      createdAt: v.created_at
    }));

    if (variables.length === 0) {
      return NextResponse.json(
        { error: 'No variables found for project' },
        { status: 404 }
      );
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

    return NextResponse.json({
      success: true,
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
      latentSuggestions: latentSuggestions,
      totalVariables: variables.length,
      suggestedGroups: groupingSuggestions.length,
      suggestedDemographics: demographicSuggestions.length
    });

  } catch (error) {
    console.error('Grouping error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Grouping failed' },
      { status: 500 }
    );
  }
}
