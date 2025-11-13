import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { rServiceClient } from '@/lib/r-service'
import { readFile } from 'fs/promises'
import path from 'path'
import Papa from 'papaparse'
import { z } from 'zod'

const runAnalysisSchema = z.object({
  datasetId: z.string().uuid(),
  analysisType: z.enum(['sentiment', 'cluster', 'topics']),
  parameters: z.object({
    textColumn: z.string().optional(),
    nClusters: z.number().optional(),
    nTopics: z.number().optional(),
    columns: z.array(z.string()).optional(),
  }).optional(),
})

/**
 * POST /api/analytics/run
 * Run analysis on a dataset using R service
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
    const validationResult = runAnalysisSchema.safeParse(body)
    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0]
      return NextResponse.json(
        { success: false, error: firstError.message },
        { status: 400 }
      )
    }

    const { datasetId, analysisType, parameters = {} } = validationResult.data

    // Check cache first
    const { getCachedAnalysis, setCachedAnalysis } = await import('@/lib/analysis-cache')
    const cachedResult = await getCachedAnalysis(datasetId, analysisType, parameters)

    if (cachedResult) {
      return NextResponse.json({
        success: true,
        data: {
          analysisType,
          results: cachedResult,
          datasetId,
          timestamp: new Date().toISOString(),
          cached: true,
        },
        message: 'Kết quả từ cache',
      })
    }

    // Get dataset
    const dataset = await prisma.analysisProject.findUnique({
      where: { id: datasetId },
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

    // Read and parse CSV file
    const fullPath = path.join(process.cwd(), 'public', dataset.csvFilePath)
    let csvData: any[] = []

    try {
      const fileContent = await readFile(fullPath, 'utf-8')
      const parseResult = Papa.parse(fileContent, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
      })
      csvData = parseResult.data
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Không thể đọc file CSV' },
        { status: 500 }
      )
    }

    if (csvData.length === 0) {
      return NextResponse.json(
        { success: false, error: 'File CSV không có dữ liệu' },
        { status: 400 }
      )
    }

    // Check R service health
    const healthCheck = await rServiceClient.checkHealth()
    if (!healthCheck.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'R service không khả dụng. Vui lòng kiểm tra service đang chạy.' 
        },
        { status: 503 }
      )
    }

    // Run analysis based on type
    let analysisResult

    try {
      switch (analysisType) {
        case 'sentiment':
          analysisResult = await rServiceClient.analyzeSentiment(
            csvData,
            parameters.textColumn || 'text',
            { timeout: 120000 } // 2 minutes
          )
          break

        case 'cluster':
          analysisResult = await rServiceClient.analyzeClustering(
            csvData,
            parameters.nClusters || 3,
            parameters.columns,
            { timeout: 120000 }
          )
          break

        case 'topics':
          analysisResult = await rServiceClient.analyzeTopics(
            csvData,
            parameters.textColumn || 'text',
            parameters.nTopics || 5,
            { timeout: 180000 } // 3 minutes
          )
          break

        default:
          return NextResponse.json(
            { success: false, error: 'Loại phân tích không hợp lệ' },
            { status: 400 }
          )
      }
    } catch (error) {
      console.error('R service error:', error)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Lỗi khi thực hiện phân tích. Vui lòng thử lại.' 
        },
        { status: 500 }
      )
    }

    if (!analysisResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: analysisResult.error || 'Phân tích thất bại' 
        },
        { status: 500 }
      )
    }

    // Cache the results
    const resultData = analysisResult.data || analysisResult
    await setCachedAnalysis(datasetId, analysisType, parameters, resultData, 24)

    // Return results
    return NextResponse.json({
      success: true,
      data: {
        analysisType,
        results: resultData,
        datasetId,
        timestamp: new Date().toISOString(),
        cached: false,
      },
      message: 'Phân tích hoàn thành',
    })
  } catch (error) {
    console.error('Error running analysis:', error)
    return NextResponse.json(
      { success: false, error: 'Không thể thực hiện phân tích' },
      { status: 500 }
    )
  }
}
