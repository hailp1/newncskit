import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get recent projects with analysis count
    const { data: projects, error: projectsError } = await supabase
      .from('analysis_projects')
      .select(`
        id,
        name,
        description,
        status,
        row_count,
        column_count,
        created_at,
        updated_at
      `)
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(10);

    if (projectsError) {
      console.error('Error loading recent projects:', projectsError);
      return NextResponse.json(
        { error: 'Failed to load recent projects' },
        { status: 500 }
      );
    }

    // Get analysis counts for each project
    const projectsWithCounts = await Promise.all(
      (projects || []).map(async (project) => {
        const { count } = await supabase
          .from('analysis_results')
          .select('*', { count: 'exact', head: true })
          .eq('analysis_project_id', project.id);

        return {
          ...project,
          analysisCount: count || 0
        };
      })
    );

    return NextResponse.json({
      projects: projectsWithCounts
    });

  } catch (error) {
    console.error('Get recent projects error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}
