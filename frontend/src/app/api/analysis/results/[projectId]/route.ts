import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
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

    const projectId = params.projectId;

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

    // Get all analysis results
    const { data: results, error: resultsError } = await supabase
      .from('analysis_results')
      .select('*')
      .eq('project_id', projectId)
      .order('executed_at', { ascending: false });

    if (resultsError) {
      return NextResponse.json(
        { error: 'Failed to load results: ' + resultsError.message },
        { status: 500 }
      );
    }

    // Get variable groups
    const { data: groups } = await supabase
      .from('variable_groups')
      .select(`
        *,
        variables:analysis_variables(*)
      `)
      .eq('project_id', projectId);

    // Get demographics
    const { data: demographics } = await supabase
      .from('analysis_variables')
      .select('*')
      .eq('analysis_project_id', projectId)
      .eq('is_demographic', true);

    return NextResponse.json({
      success: true,
      project: {
        id: (project as any).id,
        name: (project as any).name,
        description: (project as any).description,
        status: (project as any).status,
        rowCount: (project as any).row_count,
        columnCount: (project as any).column_count,
        createdAt: (project as any).created_at,
        updatedAt: (project as any).updated_at,
      },
      results: results || [],
      groups: groups || [],
      demographics: demographics || [],
    });

  } catch (error) {
    console.error('Get results error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}
