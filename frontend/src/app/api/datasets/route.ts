import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/datasets
 * List datasets (AnalysisProjects) for authenticated user
 * Can filter by projectId if provided
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build where clause
    const where: any = {
      userId: session.user.id,
    }

    if (projectId) {
      where.id = projectId
    }

    // Fetch datasets with pagination
    const [datasets, total] = await Promise.all([
      prisma.analysisProject.findMany({
        where,
        orderBy: {
          updatedAt: 'desc',
        },
        take: limit,
        skip: offset,
        include: {
          variables: {
            take: 5, // Include first 5 variables for preview
          },
          groups: {
            take: 3, // Include first 3 groups for preview
          },
        },
      }),
      prisma.analysisProject.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: {
        datasets,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total,
        },
      },
    })
  } catch (error) {
    console.error('Error fetching datasets:', error)
    return NextResponse.json(
      { success: false, error: 'Không thể tải danh sách datasets' },
      { status: 500 }
    )
  }
}
