import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST() {
  try {
    const email = 'phuchai.le@gmail.com'
    const password = 'Admin123'
    const name = 'Phuc Hai Le'

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        role: true,
      }
    })

    if (existingUser) {
      // User exists, just update role
      const updated = await prisma.user.update({
        where: { email },
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

      return NextResponse.json({
        success: true,
        action: 'updated',
        user: updated,
        message: 'Existing user updated to admin. Please logout and login again.'
      })
    }

    // Create new admin user
    const hashedPassword = await bcrypt.hash(password, 10)

    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        fullName: name,
        firstName: 'Phuc Hai',
        lastName: 'Le',
        emailVerified: true,
        emailVerifiedAt: new Date(),
        role: 'admin',
        status: 'active',
        subscriptionType: 'premium',
        tokenBalance: 10000,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        status: true,
      }
    })

    return NextResponse.json({
      success: true,
      action: 'created',
      user: newUser,
      credentials: {
        email,
        password,
      },
      message: 'Admin user created successfully!'
    })

  } catch (error) {
    console.error('Create admin error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to create admin', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
