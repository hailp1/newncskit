import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST - Bulk action on users
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !['admin', 'moderator'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { userIds, action } = body

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { error: 'User IDs are required' },
        { status: 400 }
      )
    }

    if (!action || !['activate', 'suspend', 'delete'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      )
    }

    let successCount = 0
    let failureCount = 0
    const errors: Array<{ userId: string; error: string }> = []

    for (const userId of userIds) {
      try {
        if (action === 'delete') {
          await prisma.user.delete({
            where: { id: userId }
          })
        } else {
          await prisma.user.update({
            where: { id: userId },
            data: {
              status: action === 'activate' ? 'active' : 'suspended'
            }
          })
        }
        successCount++
      } catch (error: any) {
        failureCount++
        errors.push({
          userId,
          error: error.message || 'Unknown error'
        })
      }
    }

    return NextResponse.json({
      successCount,
      failureCount,
      errors
    })
  } catch (error) {
    console.error('Error performing bulk action:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
