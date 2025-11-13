import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { userId, email } = await request.json()

    // Try by email first (more reliable)
    const adminEmail = email || 'phuchai.le@gmail.com'
    
    console.log('Looking for user:', { userId, email: adminEmail })

    // Get current user by email
    let currentUser = await prisma.user.findUnique({
      where: { email: adminEmail },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        status: true,
      }
    })

    // If not found by email, try by ID
    if (!currentUser && userId) {
      currentUser = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          fullName: true,
          role: true,
          status: true,
        }
      })
    }

    if (!currentUser) {
      return NextResponse.json(
        { 
          error: 'User not found',
          details: `No user found with email: ${adminEmail}${userId ? ` or ID: ${userId}` : ''}`,
          suggestion: 'Run: node scripts/create-admin.js to create admin account'
        },
        { status: 404 }
      )
    }

    console.log('Current user:', currentUser)

    // Update role to admin
    const updatedUser = await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        role: 'admin',
        status: 'active',
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        status: true,
      }
    })

    console.log('Updated user:', updatedUser)

    return NextResponse.json({
      success: true,
      before: currentUser,
      after: updatedUser,
      message: 'Role updated to admin. Please logout and login again.'
    })

  } catch (error) {
    console.error('Fix role error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to update role', 
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}
