import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { VariableRoleTag } from '@/types/analysis';

/**
 * API endpoint for saving variable role tags
 * POST /api/analysis/roles/save
 * 
 * Request body:
 * {
 *   projectId: string;
 *   roleTags: VariableRoleTag[];
 * }
 * 
 * Response:
 * {
 *   success: boolean;
 *   message: string;
 *   savedCount?: number;
 * }
 */

interface SaveRoleTagsRequest {
  projectId: string;
  roleTags: VariableRoleTag[];
}

/**
 * GET endpoint to retrieve role tags for a project
 * GET /api/analysis/roles/save?projectId=xxx
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Project ID is required' 
        },
        { status: 400 }
      );
    }

    // Fetch role tags for the project
    const { data, error } = await supabase
      .from('variable_role_tags')
      .select('*')
      .eq('project_id', projectId);

    if (error) {
      console.error('Error fetching role tags:', error);
      return NextResponse.json(
        { 
          success: false,
          error: 'Failed to fetch role tags',
          details: error.message
        },
        { status: 500 }
      );
    }

    // Transform database format to VariableRoleTag format
    const roleTags: VariableRoleTag[] = (data || []).map((tag: any) => ({
      variableId: tag.variable_id,
      columnName: '', // Will need to be joined with variables table in real implementation
      role: tag.role,
      confidence: tag.confidence,
      reason: tag.reason,
      isUserAssigned: tag.is_user_assigned
    }));

    return NextResponse.json({
      success: true,
      roleTags,
      count: roleTags.length
    });

  } catch (error) {
    console.error('Fetch role tags error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch role tags' 
      },
      { status: 500 }
    );
  }
}

/**
 * POST endpoint to save role tags
 * POST /api/analysis/roles/save
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: SaveRoleTagsRequest = await request.json();
    const { projectId, roleTags } = body;

    // Validate request data
    if (!projectId) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Project ID is required' 
        },
        { status: 400 }
      );
    }

    if (!roleTags || !Array.isArray(roleTags)) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Role tags must be an array' 
        },
        { status: 400 }
      );
    }

    // Validate role tag structure
    for (const tag of roleTags) {
      if (!tag.variableId) {
        return NextResponse.json(
          { 
            success: false,
            error: 'Each role tag must have a variableId' 
          },
          { status: 400 }
        );
      }

      if (!tag.role) {
        return NextResponse.json(
          { 
            success: false,
            error: 'Each role tag must have a role' 
          },
          { status: 400 }
        );
      }

      // Validate role enum
      const validRoles = ['none', 'independent', 'dependent', 'mediator', 'moderator', 'control', 'latent'];
      if (!validRoles.includes(tag.role)) {
        return NextResponse.json(
          { 
            success: false,
            error: `Invalid role: ${tag.role}. Must be one of: ${validRoles.join(', ')}` 
          },
          { status: 400 }
        );
      }
    }

    // Delete existing role tags for this project
    const { error: deleteError } = await supabase
      .from('variable_role_tags')
      .delete()
      .eq('project_id', projectId);

    if (deleteError) {
      console.error('Error deleting existing role tags:', deleteError);
      return NextResponse.json(
        { 
          success: false,
          error: 'Failed to delete existing role tags',
          details: deleteError.message
        },
        { status: 500 }
      );
    }

    // Filter out 'none' roles (no need to store them)
    const tagsToInsert = roleTags.filter(tag => tag.role !== 'none');

    // If no tags to insert, return success
    if (tagsToInsert.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'All role tags cleared successfully',
        savedCount: 0
      });
    }

    // Prepare data for insertion
    const insertData = tagsToInsert.map(tag => ({
      project_id: projectId,
      variable_id: tag.variableId,
      group_id: null, // Currently only supporting variable-level tags
      role: tag.role,
      is_user_assigned: tag.isUserAssigned ?? true,
      confidence: tag.confidence ?? null,
      reason: tag.reason ?? null
    }));

    // Insert new role tags
    const { data, error: insertError } = await supabase
      .from('variable_role_tags')
      .insert(insertData)
      .select();

    if (insertError) {
      console.error('Error inserting role tags:', insertError);
      return NextResponse.json(
        { 
          success: false,
          error: 'Failed to save role tags',
          details: insertError.message
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Successfully saved ${data?.length || 0} role tags`,
      savedCount: data?.length || 0
    });

  } catch (error) {
    console.error('Save role tags error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Failed to save role tags' 
      },
      { status: 500 }
    );
  }
}
