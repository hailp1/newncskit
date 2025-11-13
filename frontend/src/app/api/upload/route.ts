import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { randomUUID } from 'crypto'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = ['text/csv', 'application/vnd.ms-excel']
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads')

/**
 * POST /api/upload
 * Handle CSV file upload
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

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'Không có file được tải lên' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type) && !file.name.endsWith('.csv')) {
      return NextResponse.json(
        { success: false, error: 'Chỉ chấp nhận file CSV' },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: 'File vượt quá kích thước cho phép (10MB)' },
        { status: 400 }
      )
    }

    // Create upload directory if it doesn't exist
    if (!existsSync(UPLOAD_DIR)) {
      await mkdir(UPLOAD_DIR, { recursive: true })
    }

    // Generate unique filename
    const fileExtension = path.extname(file.name)
    const fileNameWithoutExt = path.basename(file.name, fileExtension)
    const uniqueFileName = `${fileNameWithoutExt}-${randomUUID()}${fileExtension}`
    const filePath = path.join(UPLOAD_DIR, uniqueFileName)

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // Return file info
    const fileUrl = `/uploads/${uniqueFileName}`
    
    return NextResponse.json({
      success: true,
      data: {
        fileName: file.name,
        uniqueFileName,
        filePath: fileUrl,
        fileSize: file.size,
        uploadedAt: new Date().toISOString(),
      },
      message: 'Tải file thành công',
    })
  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json(
      { success: false, error: 'Không thể tải file lên' },
      { status: 500 }
    )
  }
}
