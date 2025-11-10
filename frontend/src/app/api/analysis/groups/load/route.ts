import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/analysis/groups/load?projectId={projectId}
 * 
 * Load saved variable groups for a project
 * Used to determine if a project is existing (has saved groups) or new
 */
export async function GET(request: NextRequest) {
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

    const searchParams = request.nextUrl.searchParams;
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    // Get project to verify ownership
    const { data: project, error: projectError } = await supabase
      .from('analysis_projects')
      .select('id, name, status, created_at, updated_at')
      .eq('id', projectId)
      .eq('user_id', session.user.id)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Get saved variable groups
    const { data: groups, error: groupsError } = await supabase
      .from('variable_groups')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true });

    if (groupsError) {
      console.error('Error loading groups:', groupsError);
      return NextResponse.json(
        { error: 'Failed to load groups' },
        { status: 500 }
      );
    }

    // Get demographics
    const { data: demographics, error: demographicsError } = await supabase
      .from('demographic_variables')
      .select('*')
      .eq('project_id', projectId);

    if (demographicsError) {
      console.error('Error loading demographics:', demographicsError);
    }

    // Determine if this is a new or existing project
    const hasGroups = groups && groups.length > 0;
    const hasDemographics = demographics && demographics.length > 0;
    const isExistingProject = hasGroups || hasDemographics;

    // Type assertion for project data
    const projectData = project as any;

    return NextResponse.json({
      success: true,
      project: {
        id: projectData.id,
        name: projectData.name,
        status: projectData.status,
        createdAt: projectData.created_at,
        updatedAt: projectData.updated_at,
      },
      groups: groups || [],
      demographics: demographics || [],
      isExistingProject,
      hasGroups,
      hasDemographics,
    });

  } catch (error) {
    console.error('Load groups error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Load failed' },
      { status: 500 }
    );
  }
}
