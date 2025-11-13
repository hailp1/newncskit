import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/projects/user/[userId]
 * Get all projects for a user
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { userId } = await params

    // Verify user can only access their own projects (unless admin)
    const isAdmin = (session.user as any).role === 'admin' || (session.user as any).role === 'super_admin'
    const sessionUserId = (session.user as any).id

    if (!isAdmin && sessionUserId !== userId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Get projects from database
    const projects = await prisma.project.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    })

    // Transform to match expected format
    const transformedProjects = projects.map((project: any) => ({
      id: project.id,
      title: project.title || 'Untitled Project',
      description: project.description || '',
      business_domain_id: project.businessDomainId || 0,
      business_domain_name: 'Unknown Domain', // Project model doesn't have category relation
      selected_models: project.selectedModels || [],
      selected_model_names: [],
      research_outline: project.researchOutline || {},
      status: project.status || 'draft',
      progress: project.progress || 0,
      user_id: project.userId,
      created_at: project.createdAt.toISOString(),
      updated_at: project.updatedAt.toISOString(),
      tags: project.tags || [],
      word_count: project.wordCount || 0,
      reference_count: project.referenceCount || 0,
    }))

    return NextResponse.json({
      success: true,
      data: transformedProjects,
    })
  } catch (error) {
    console.error('[GET /api/projects/user/[userId]] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch projects', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

