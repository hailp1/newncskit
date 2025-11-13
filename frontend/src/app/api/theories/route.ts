import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/theories
 * Get all theories with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const group = searchParams.get('group')
    const domain = searchParams.get('domain')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    
    if (group) {
      where.group = group
    }
    
    if (domain) {
      where.domain = {
        contains: domain,
        mode: 'insensitive',
      }
    }
    
    if (search) {
      where.OR = [
        { theory: { contains: search, mode: 'insensitive' } },
        { noteVi: { contains: search, mode: 'insensitive' } },
        { domain: { contains: search, mode: 'insensitive' } },
        { reference: { contains: search, mode: 'insensitive' } },
      ]
    }

    // Get theories with count
    const [theories, total] = await Promise.all([
      prisma.theory.findMany({
        where,
        skip,
        take: limit,
        orderBy: { theory: 'asc' },
      }),
      prisma.theory.count({ where }),
    ])

    // Transform to match expected format
    const transformedTheories = theories.map((theory) => ({
      id: theory.id,
      theory: theory.theory,
      constructs_full: theory.constructsFull,
      constructs_code: theory.constructsCode,
      note_vi: theory.noteVi,
      group: theory.group,
      domain: theory.domain,
      dependent_variable: theory.dependentVariable,
      reference: theory.reference,
      application_vi: theory.applicationVi,
      definition_long: theory.definitionLong,
      constructs_detailed: theory.constructsDetailed,
      sample_scales: theory.sampleScales,
      related_theories: theory.relatedTheories,
      limitations: theory.limitations,
    }))

    return NextResponse.json({
      success: true,
      theories: transformedTheories,
      count: total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('[GET /api/theories] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch theories', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

