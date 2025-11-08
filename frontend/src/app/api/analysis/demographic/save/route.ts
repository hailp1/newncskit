import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { DemographicType, RankDefinition } from '@/types/analysis';

interface DemographicVariable {
  variableId: string;
  columnName: string;
  semanticName: string;
  demographicType: DemographicType;
  ranks?: RankDefinition[];
  ordinalCategories?: Array<{
    categoryOrder: number;
    categoryValue: string;
    categoryLabel?: string;
  }>;
}

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

    const { projectId, demographics } = await request.json();

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    if (!demographics || !Array.isArray(demographics)) {
      return NextResponse.json(
        { error: 'Demographics array is required' },
        { status: 400 }
      );
    }

    // Verify project ownership
    const { data: project, error: projectError } = await supabase
      .from('analysis_projects')
      .select('id')
      .eq('id', projectId)
      .eq('user_id', session.user.id)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Update each demographic variable
    for (const demo of demographics as DemographicVariable[]) {
      // Update variable with demographic info
      const { error: updateError } = await (supabase
        .from('analysis_variables') as any)
        .update({
          is_demographic: true,
          demographic_type: demo.demographicType,
          semantic_name: demo.semanticName,
        })
        .eq('id', demo.variableId);

      if (updateError) {
        console.error('Error updating variable:', updateError);
        continue;
      }

      // Delete existing ranks for this variable
      await (supabase
        .from('demographic_ranks') as any)
        .delete()
        .eq('variable_id', demo.variableId);

      // Insert new ranks if provided
      if (demo.ranks && demo.ranks.length > 0) {
        const ranksToInsert = demo.ranks.map((rank, index) => ({
          variable_id: demo.variableId,
          rank_order: index + 1,
          label: rank.label,
          min_value: rank.minValue,
          max_value: rank.maxValue,
          is_open_ended_min: rank.isOpenEndedMin || false,
          is_open_ended_max: rank.isOpenEndedMax || false,
          count: 0, // Will be calculated during analysis
        }));

        const { error: ranksError } = await (supabase
          .from('demographic_ranks') as any)
          .insert(ranksToInsert);

        if (ranksError) {
          console.error('Error inserting ranks:', ranksError);
        }
      }

      // Delete existing ordinal categories for this variable
      await (supabase
        .from('ordinal_categories') as any)
        .delete()
        .eq('variable_id', demo.variableId);

      // Insert new ordinal categories if provided
      if (demo.ordinalCategories && demo.ordinalCategories.length > 0) {
        const categoriesToInsert = demo.ordinalCategories.map((cat) => ({
          variable_id: demo.variableId,
          category_order: cat.categoryOrder,
          category_value: cat.categoryValue,
          category_label: cat.categoryLabel,
          count: 0, // Will be calculated during analysis
        }));

        const { error: categoriesError } = await (supabase
          .from('ordinal_categories') as any)
          .insert(categoriesToInsert);

        if (categoriesError) {
          console.error('Error inserting ordinal categories:', categoriesError);
        }
      }
    }

    // Clear demographic flag for variables not in the list
    const demographicVariableIds = demographics.map((d: DemographicVariable) => d.variableId);
    
    if (demographicVariableIds.length > 0) {
      const { error: clearError } = await (supabase
        .from('analysis_variables') as any)
        .update({
          is_demographic: false,
          demographic_type: null,
          semantic_name: null,
        })
        .eq('analysis_project_id', projectId)
        .not('id', 'in', `(${demographicVariableIds.join(',')})`);

      if (clearError) {
        console.error('Error clearing non-demographic variables:', clearError);
      }
    }

    // Update project status
    const { error: statusError } = await (supabase
      .from('analysis_projects') as any)
      .update({
        status: 'configured',
        updated_at: new Date().toISOString(),
      })
      .eq('id', projectId);

    if (statusError) {
      console.error('Error updating project status:', statusError);
    }

    return NextResponse.json({
      success: true,
      message: 'Demographic configuration saved successfully',
      demographicCount: demographics.length,
    });

  } catch (error) {
    console.error('Save demographic config error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}
