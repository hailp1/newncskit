import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { VariableGroup } from '@/types/analysis';

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

    const { projectId, groups } = await request.json();

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    if (!groups || !Array.isArray(groups)) {
      return NextResponse.json(
        { error: 'Groups array is required' },
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

    // Update project status if needed
    const { error: statusError } = await (supabase
      .from('analysis_projects') as any)
      .update({ 
        status: 'draft',
        updated_at: new Date().toISOString()
      })
      .eq('id', projectId);

    if (statusError) {
      console.error('Error updating project status:', statusError);
    }

    return NextResponse.json({
      success: true,
      message: 'Groups saved successfully',
      groupCount: insertedGroups?.length || 0,
    });

  } catch (error) {
    console.error('Save groups error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}
