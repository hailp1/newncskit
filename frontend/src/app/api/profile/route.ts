import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Get current user profile
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user ID from session - ensure it's a valid UUID
    let userId = (session.user as any).id

    if (!userId) {
      console.error('[GET /api/profile] User ID not found in session:', JSON.stringify(session.user, null, 2))
      
      // Try to get user ID from database using email
      if (session.user.email) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true }
          })
          
          if (dbUser) {
            userId = dbUser.id
            console.log('[GET /api/profile] Found UUID from database:', userId)
          } else {
            console.error('[GET /api/profile] User not found in database with email:', session.user.email)
            return NextResponse.json(
              { error: 'User not found in database' },
              { status: 401 }
            )
          }
        } catch (error) {
          console.error('[GET /api/profile] Error fetching user from database:', error)
          return NextResponse.json(
            { error: 'Failed to validate user' },
            { status: 500 }
          )
        }
      } else {
        return NextResponse.json(
          { error: 'User ID not found in session' },
          { status: 401 }
        )
      }
    }

    // Validate UUID format (UUID v4 has 36 characters with dashes, or 32 without)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    const uuidSimpleRegex = /^[0-9a-f]{32}$/i
    
    // If userId is not a valid UUID, try to get it from database using email
    if (!uuidRegex.test(userId) && !uuidSimpleRegex.test(userId)) {
      console.warn('[GET /api/profile] User ID is not a valid UUID, fetching from database:', userId)
      
      if (session.user.email) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true }
          })
          
          if (dbUser) {
            userId = dbUser.id
            console.log('[GET /api/profile] Found UUID from database:', userId)
          } else {
            console.error('[GET /api/profile] User not found in database with email:', session.user.email)
            return NextResponse.json(
              { error: 'User not found in database' },
              { status: 401 }
            )
          }
        } catch (error) {
          console.error('[GET /api/profile] Error fetching user from database:', error)
          return NextResponse.json(
            { error: 'Failed to validate user' },
            { status: 500 }
          )
        }
      } else {
        return NextResponse.json(
          { error: 'Invalid user session' },
          { status: 401 }
        )
      }
    }

    console.log('[GET /api/profile] User ID (UUID):', userId)

    // Get user profile from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        avatarUrl: true,
        institution: true,
        orcidId: true,
        researchDomains: true,
        role: true,
        subscriptionType: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    // Map to UserProfile format
    const profile = {
      id: user.id,
      email: user.email,
      full_name: user.fullName,
      avatar_url: user.avatarUrl,
      institution: user.institution,
      orcid_id: user.orcidId,
      research_domains: user.researchDomains,
      role: user.role,
      subscription_type: user.subscriptionType,
      status: user.status,
      created_at: user.createdAt.toISOString(),
      updated_at: user.updatedAt.toISOString(),
      last_login_at: user.lastLoginAt?.toISOString() || null,
    }

    return NextResponse.json(profile)
  } catch (error) {
    console.error('[GET /api/profile] Error fetching profile:', error)
    
    // Log full error details
    if (error instanceof Error) {
      console.error('[GET /api/profile] Error message:', error.message)
      console.error('[GET /api/profile] Error stack:', error.stack)
    }
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// PATCH - Update current user profile
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user ID from session - ensure it's a valid UUID
    let userId = (session.user as any).id

    if (!userId) {
      console.error('[PATCH /api/profile] User ID not found in session:', JSON.stringify(session.user, null, 2))
      
      // Try to get user ID from database using email
      if (session.user.email) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true }
          })
          
          if (dbUser) {
            userId = dbUser.id
            console.log('[PATCH /api/profile] Found UUID from database:', userId)
          } else {
            console.error('[PATCH /api/profile] User not found in database with email:', session.user.email)
            return NextResponse.json(
              { error: 'User not found in database' },
              { status: 401 }
            )
          }
        } catch (error) {
          console.error('[PATCH /api/profile] Error fetching user from database:', error)
          return NextResponse.json(
            { error: 'Failed to validate user' },
            { status: 500 }
          )
        }
      } else {
        return NextResponse.json(
          { error: 'User ID not found in session' },
          { status: 401 }
        )
      }
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    const uuidSimpleRegex = /^[0-9a-f]{32}$/i
    
    // If userId is not a valid UUID, try to get it from database using email
    if (!uuidRegex.test(userId) && !uuidSimpleRegex.test(userId)) {
      console.warn('[PATCH /api/profile] User ID is not a valid UUID, fetching from database:', userId)
      
      if (session.user.email) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true }
          })
          
          if (dbUser) {
            userId = dbUser.id
            console.log('[PATCH /api/profile] Found UUID from database:', userId)
          } else {
            console.error('[PATCH /api/profile] User not found in database with email:', session.user.email)
            return NextResponse.json(
              { error: 'User not found in database' },
              { status: 401 }
            )
          }
        } catch (error) {
          console.error('[PATCH /api/profile] Error fetching user from database:', error)
          return NextResponse.json(
            { error: 'Failed to validate user' },
            { status: 500 }
          )
        }
      } else {
        return NextResponse.json(
          { error: 'Invalid user session' },
          { status: 401 }
        )
      }
    }

    console.log('[PATCH /api/profile] User ID (UUID):', userId)

    const body = await request.json()

    // Map request body to Prisma format
    const updateData: any = {}
    if (body.full_name !== undefined) updateData.fullName = body.full_name
    if (body.institution !== undefined) updateData.institution = body.institution
    if (body.orcid_id !== undefined) updateData.orcidId = body.orcid_id
    if (body.research_domains !== undefined) updateData.researchDomains = body.research_domains

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        fullName: true,
        avatarUrl: true,
        institution: true,
        orcidId: true,
        researchDomains: true,
        role: true,
        subscriptionType: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true
      }
    })

    // Map to UserProfile format
    const profile = {
      id: updatedUser.id,
      email: updatedUser.email,
      full_name: updatedUser.fullName,
      avatar_url: updatedUser.avatarUrl,
      institution: updatedUser.institution,
      orcid_id: updatedUser.orcidId,
      research_domains: updatedUser.researchDomains,
      role: updatedUser.role,
      subscription_type: updatedUser.subscriptionType,
      status: updatedUser.status,
      created_at: updatedUser.createdAt.toISOString(),
      updated_at: updatedUser.updatedAt.toISOString(),
      last_login_at: updatedUser.lastLoginAt?.toISOString() || null,
    }

    return NextResponse.json(profile)
  } catch (error) {
    console.error('[PATCH /api/profile] Error updating profile:', error)
    
    // Log full error details
    if (error instanceof Error) {
      console.error('[PATCH /api/profile] Error message:', error.message)
      console.error('[PATCH /api/profile] Error stack:', error.stack)
    }
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
