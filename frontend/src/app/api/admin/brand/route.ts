import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Load brand settings
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get brand settings from database
    let brandSettings = await prisma.brandSettings.findFirst({
      orderBy: { updatedAt: 'desc' }
    })

    // If no settings exist, create default settings
    if (!brandSettings) {
      brandSettings = await prisma.brandSettings.create({
        data: {
          primaryColor: '#2563EB',
          secondaryColor: '#10B981',
          accentColor: '#F59E0B',
          companyName: 'NCSKit',
          tagline: 'Nền tảng phân tích dữ liệu nghiên cứu khoa học',
          logoHeight: 40
        }
      })
    }

    const settings = {
      logo: brandSettings.logo,
      logoHeight: brandSettings.logoHeight,
      logoFooter: brandSettings.logoFooter,
      logoFooterHeight: brandSettings.logoFooterHeight,
      favicon: brandSettings.favicon,
      primaryColor: brandSettings.primaryColor,
      secondaryColor: brandSettings.secondaryColor,
      accentColor: brandSettings.accentColor,
      companyName: brandSettings.companyName,
      tagline: brandSettings.tagline
    }

    return NextResponse.json({ settings })
  } catch (error) {
    console.error('Error loading brand settings:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Save brand settings
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    
    // Validate input
    if (!body.companyName || !body.primaryColor) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get existing settings or create new
    const existingSettings = await prisma.brandSettings.findFirst({
      orderBy: { updatedAt: 'desc' }
    })

    let brandSettings
    if (existingSettings) {
      // Update existing settings
      brandSettings = await prisma.brandSettings.update({
        where: { id: existingSettings.id },
        data: {
          logo: body.logo || null,
          logoHeight: body.logoHeight || 40,
          logoFooter: body.logoFooter || null,
          logoFooterHeight: body.logoFooterHeight || 32,
          favicon: body.favicon || null,
          primaryColor: body.primaryColor,
          secondaryColor: body.secondaryColor,
          accentColor: body.accentColor,
          companyName: body.companyName,
          tagline: body.tagline
        }
      })
    } else {
      // Create new settings
      brandSettings = await prisma.brandSettings.create({
        data: {
          logo: body.logo || null,
          logoHeight: body.logoHeight || 40,
          logoFooter: body.logoFooter || null,
          logoFooterHeight: body.logoFooterHeight || 32,
          favicon: body.favicon || null,
          primaryColor: body.primaryColor,
          secondaryColor: body.secondaryColor,
          accentColor: body.accentColor,
          companyName: body.companyName,
          tagline: body.tagline
        }
      })
    }

    console.log('Brand settings saved:', brandSettings)

    return NextResponse.json({ 
      success: true,
      message: 'Brand settings saved successfully',
      settings: brandSettings
    })
  } catch (error) {
    console.error('Error saving brand settings:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
