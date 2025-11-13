import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { readFile } from 'fs/promises'
import path from 'path'
import Papa from 'papaparse'

const createDatasetSchema = z.object({
  name: z.string().min(1, 'Tên dataset không được để trống'),
  description: z.string().optional(),
  fileName: z.string(),
  filePath: z.string(),
  fileSize: z.number(),
})

/**
 * POST /api/datasets/create
 * Create a new dataset with file metadata
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()

    // Validate input
    const validationResult = createDatasetSchema.safeParse(body)
    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0]
      return NextResponse.json(
        { success: false, error: firstError.message },
        { status: 400 }
      )
    }

    const { name, description, fileName, filePath, fileSize } = validationResult.data

    // Read and parse CSV to get row and column count
    let rowCount = 0
    let columnCount = 0

    try {
      const fullPath = path.join(process.cwd(), 'public', filePath)
      const fileContent = await readFile(fullPath, 'utf-8')
      
      const parseResult = Papa.parse(fileContent, {
        header: true,
        skipEmptyLines: true,
      })

      rowCount = parseResult.data.length
      columnCount = parseResult.meta.fields?.length || 0
    } catch (error) {
      console.error('Error parsing CSV:', error)
      // Continue with 0 counts if parsing fails
    }

    // Create dataset in database
    const dataset = await prisma.analysisProject.create({
      data: {
        name,
        description,
        csvFilePath: filePath,
        csvFileSize: fileSize,
        rowCount,
        columnCount,
        userId: session.user.id,
        status: 'draft',
      },
    })

    return NextResponse.json({
      success: true,
      data: dataset,
      message: 'Tạo dataset thành công',
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating dataset:', error)
    return NextResponse.json(
      { success: false, error: 'Không thể tạo dataset' },
      { status: 500 }
    )
  }
}
