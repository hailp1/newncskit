import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/theories/[id]
 * Get a single theory by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const theoryId = parseInt(id)

    if (isNaN(theoryId)) {
      return NextResponse.json(
        { error: 'Invalid theory ID' },
        { status: 400 }
      )
    }

    const theory = await prisma.theory.findUnique({
      where: { id: theoryId },
    })

    if (!theory) {
      return NextResponse.json(
        { error: 'Theory not found' },
        { status: 404 }
      )
    }

    // Transform to match expected format
    const transformedTheory = {
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
    }

    return NextResponse.json({
      success: true,
      theory: transformedTheory,
    })
  } catch (error) {
    console.error('[GET /api/theories/[id]] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch theory', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

