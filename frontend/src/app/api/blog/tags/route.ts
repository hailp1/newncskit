import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - List tags with usage counts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const limit = parseInt(searchParams.get('limit') || '50')

    // Get all posts with tags
    const posts = await prisma.post.findMany({
      where: {
        status: 'published',
        tags: {
          not: null
        }
      },
      select: {
        tags: true
      }
    })

    // Aggregate tags and count usage
    const tagMap = new Map<string, number>()
    
    posts.forEach(post => {
      if (post.tags && Array.isArray(post.tags)) {
        (post.tags as string[]).forEach(tag => {
          const normalizedTag = tag.trim().toLowerCase()
          if (normalizedTag) {
            tagMap.set(normalizedTag, (tagMap.get(normalizedTag) || 0) + 1)
          }
        })
      }
    })

    // Convert to array and sort by usage count
    let tags = Array.from(tagMap.entries()).map(([name, count]) => ({
      id: name,
      name: name,
      slug: name.replace(/\s+/g, '-'),
      post_count: count
    }))

    // Filter by search if provided
    if (search) {
      tags = tags.filter(tag => 
        tag.name.toLowerCase().includes(search.toLowerCase())
      )
    }

    // Sort by usage count (descending) and limit
    tags.sort((a, b) => b.post_count - a.post_count)
    tags = tags.slice(0, limit)

    return NextResponse.json({
      results: tags,
      count: tags.length
    })
  } catch (error) {
    console.error('Error fetching tags:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create/suggest tag (returns tag info for autocomplete)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const tagName = body.name?.trim()

    if (!tagName) {
      return NextResponse.json(
        { error: 'Tag name is required' },
        { status: 400 }
      )
    }

    // Check if tag already exists in any post
    const existingPosts = await prisma.post.findMany({
      where: {
        tags: {
          array_contains: [tagName.toLowerCase()]
        }
      },
      select: {
        id: true
      }
    })

    return NextResponse.json({
      id: tagName.toLowerCase(),
      name: tagName,
      slug: tagName.toLowerCase().replace(/\s+/g, '-'),
      post_count: existingPosts.length,
      exists: existingPosts.length > 0,
      created_at: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error creating tag:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
