import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/datasets/[id]
 * Get dataset details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Await params in Next.js 16
    const { id } = await params

    const dataset = await prisma.analysisProject.findUnique({
      where: { id },
      include: {
        variables: true,
        groups: {
          include: {
            variables: true,
          },
        },
      },
    })

    if (!dataset) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy dataset' },
        { status: 404 }
      )
    }

    // Verify ownership
    if (dataset.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Không có quyền truy cập' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      success: true,
      data: dataset,
    })
  } catch (error) {
    console.error('Error fetching dataset:', error)
    return NextResponse.json(
      { success: false, error: 'Không thể tải dataset' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/datasets/[id]
 * Delete dataset
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Await params in Next.js 16
    const { id } = await params

    // Check if dataset exists and user owns it
    const existingDataset = await prisma.analysisProject.findUnique({
      where: { id },
    })

    if (!existingDataset) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy dataset' },
        { status: 404 }
      )
    }

    if (existingDataset.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Không có quyền truy cập' },
        { status: 403 }
      )
    }

    // Delete dataset (cascade will delete related variables and groups)
    await prisma.analysisProject.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: 'Xóa dataset thành công',
    })
  } catch (error) {
    console.error('Error deleting dataset:', error)
    return NextResponse.json(
      { success: false, error: 'Không thể xóa dataset' },
      { status: 500 }
    )
  }
}
