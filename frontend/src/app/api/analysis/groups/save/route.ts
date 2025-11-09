import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { VariableGroup, DemographicType, RankDefinition } from '@/types/analysis';

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

    const { projectId, groups, demographics } = await request.json();

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    // Validate that at least one of groups or demographics is provided
    if ((!groups || !Array.isArray(groups)) && (!demographics || !Array.isArray(demographics))) {
      return NextResponse.json(
        { error: 'Either groups or demographics array is required' },
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

    let groupCount = 0;
    let demographicCount = 0;

    // ========================================================================
    // SAVE VARIABLE GROUPS
    // ========================================================================
    if (groups && Array.isArray(groups) && groups.length > 0) {
      // Delete existing groups for this project
      const { error: deleteError } = await supabase
        .from('variable_groups')
        .delete()
        .eq('project_id', projectId);

      if (deleteError) {
        console.error('Error deleting existing groups:', deleteError);
      }

      // Insert new groups
      const groupsToInsert = groups.map((group: VariableGroup, index: number) => ({
        project_id: projectId,
        name: group.name,
        description: group.description || null,
        group_type: group.groupType || 'construct',
        display_order: index,
      }));

      const { data: insertedGroups, error: insertError } = await supabase
        .from('variable_groups')
        .insert(groupsToInsert as any)
        .select();

      if (insertError) {
        return NextResponse.json(
          { error: 'Failed to save groups: ' + insertError.message },
          { status: 500 }
        );
      }

      groupCount = insertedGroups?.length || 0;

      // Update variables with their group assignments
      // Create a map of group name to group id
      const groupNameToId = new Map(
        (insertedGroups as any[])?.map((g: any) => [g.name, g.id]) || []
      );

      // Update each variable's group_id
      for (const group of groups) {
        const groupId = groupNameToId.get(group.name);
        if (!groupId || !group.variables || group.variables.length === 0) {
          continue;
        }

        const variableIds = group.variables.map(v => v.id);

        const { error: updateError } = await (supabase
          .from('analysis_variables') as any)
          .update({ variable_group_id: groupId })
          .in('id', variableIds);

        if (updateError) {
          console.error('Error updating variables:', updateError);
        }
      }

      // Clear group_id for variables not in any group
      const allGroupedVariableIds = groups.flatMap(g => 
        g.variables?.map(v => v.id) || []
      );

      if (allGroupedVariableIds.length > 0) {
        const { error: clearError } = await (supabase
          .from('analysis_variables') as any)
          .update({ variable_group_id: null })
          .eq('project_id', projectId)
          .not('id', 'in', `(${allGroupedVariableIds.join(',')})`);

        if (clearError) {
          console.error('Error clearing ungrouped variables:', clearError);
        }
      }
    }

    // ========================================================================
    // SAVE DEMOGRAPHIC VARIABLES
    // ========================================================================
    if (demographics && Array.isArray(demographics) && demographics.length > 0) {
      demographicCount = demographics.length;

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
    }

    // Update project status
    const newStatus = demographicCount > 0 ? 'configured' : 'draft';
    const { error: statusError } = await (supabase
      .from('analysis_projects') as any)
      .update({ 
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', projectId);

    if (statusError) {
      console.error('Error updating project status:', statusError);
    }

    // Build success message
    const messages: string[] = [];
    if (groupCount > 0) {
      messages.push(`${groupCount} group${groupCount > 1 ? 's' : ''}`);
    }
    if (demographicCount > 0) {
      messages.push(`${demographicCount} demographic${demographicCount > 1 ? 's' : ''}`);
    }
    const message = messages.length > 0 
      ? `Saved ${messages.join(' and ')} successfully`
      : 'Configuration saved successfully';

    return NextResponse.json({
      success: true,
      message,
      groupCount,
      demographicCount,
    });

  } catch (error) {
    console.error('Save groups error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}
