import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { readFile } from 'fs/promises'
import path from 'path'

/**
 * GET /api/datasets/[id]/download
 * Download dataset CSV file
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

    // Get dataset
    const dataset = await prisma.analysisProject.findUnique({
      where: { id },
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

    // Read file
    const fullPath = path.join(process.cwd(), 'public', dataset.csvFilePath)
    const fileBuffer = await readFile(fullPath)

    // Extract filename from path
    const fileName = path.basename(dataset.csvFilePath)

    // Return file as download
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': fileBuffer.length.toString(),
      },
    })
  } catch (error) {
    console.error('Error downloading file:', error)
    return NextResponse.json(
      { success: false, error: 'Không thể tải file' },
      { status: 500 }
    )
  }
}
