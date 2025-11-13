import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Get system metrics
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user count
    const userCount = await prisma.user.count()
    
    // Get active users today
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const activeUsersToday = await prisma.user.count({
      where: {
        lastActivityAt: {
          gte: today
        }
      }
    })

    // Get active campaigns (projects)
    const activeCampaigns = await prisma.project.count({
      where: {
        status: 'active'
      }
    })

    // Mock system health data
    const systemHealth = {
      database: 'healthy' as const,
      api: 'healthy' as const,
      storage: 'healthy' as const,
      cache: 'healthy' as const,
      timestamp: new Date().toISOString()
    }

    // Mock performance metrics
    const performanceMetrics = {
      cpuUsage: Math.random() * 50 + 20, // 20-70%
      memoryUsage: Math.random() * 40 + 40, // 40-80%
      diskUsage: Math.random() * 30 + 30, // 30-60%
      loadAverage: Math.random() * 2 + 1 // 1-3
    }

    return NextResponse.json({
      userCount,
      activeUsersToday,
      activeCampaigns,
      totalRevenue: 0, // TODO: Implement revenue tracking
      systemHealth,
      performanceMetrics
    })
  } catch (error) {
    console.error('Error fetching system metrics:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
