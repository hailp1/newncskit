import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/blog/posts/pending
 * Get posts pending admin approval (status = 'review')
 * Only accessible by admin
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    const isAdmin = session?.user && ((session.user as any).role === 'admin' || (session.user as any).role === 'super_admin')

    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    // Get posts with status 'review' (pending approval)
    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where: {
          status: 'review',
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: {
              id: true,
              fullName: true,
              email: true,
              avatarUrl: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      }),
      prisma.post.count({ where: { status: 'review' } }),
    ])

    // Transform posts to match BlogPost interface
    const transformedPosts = posts.map(post => ({
      id: post.id.toString(),
      title: post.title,
      slug: post.slug || `post-${post.id}`,
      excerpt: post.metaDescription || post.content?.substring(0, 200) || '',
      content: post.content || '',
      status: post.status as 'draft' | 'review' | 'scheduled' | 'published',
      author: {
        id: post.authorId || '',
        username: post.author?.email || '',
        first_name: post.author?.fullName?.split(' ')[0] || '',
        last_name: post.author?.fullName?.split(' ').slice(1).join(' ') || '',
      },
      meta_title: post.metaDescription || post.title,
      meta_description: post.metaDescription || '',
      focus_keyword: '',
      canonical_url: '',
      og_title: post.title,
      og_description: post.metaDescription || '',
      word_count: post.content?.split(/\s+/).length || 0,
      reading_time: Math.ceil((post.content?.split(/\s+/).length || 0) / 200),
      seo_score: 0,
      readability_score: 0,
      published_at: post.publishedAt?.toISOString(),
      scheduled_at: null,
      categories: post.category ? [{
        id: post.category.id.toString(),
        name: post.category.name,
        slug: post.category.slug,
        description: '',
        color: '',
        icon: '',
        meta_title: '',
        meta_description: '',
        post_count: 0,
        created_at: '',
        updated_at: '',
      }] : [],
      tags: [],
      view_count: 0,
      like_count: 0,
      share_count: 0,
      comment_count: 0,
      is_published: post.status === 'published',
      estimated_reading_time: `${Math.ceil((post.content?.split(/\s+/).length || 0) / 200)} min`,
      created_at: post.createdAt.toISOString(),
      updated_at: post.updatedAt.toISOString(),
    }))

    // Get base URL from environment or request
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 
      (request.headers.get('x-forwarded-proto') && request.headers.get('host')
        ? `${request.headers.get('x-forwarded-proto')}://${request.headers.get('host')}`
        : request.url.split('?')[0].replace(/\/api\/blog\/posts\/pending.*$/, ''))
    
    const apiPath = '/api/blog/posts/pending'
    
    return NextResponse.json({
      results: transformedPosts,
      count: total,
      next: page * limit < total ? `${baseUrl}${apiPath}?page=${page + 1}&limit=${limit}` : undefined,
      previous: page > 1 ? `${baseUrl}${apiPath}?page=${page - 1}&limit=${limit}` : undefined,
    })
  } catch (error) {
    console.error('[GET /api/blog/posts/pending] Error fetching pending posts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch pending posts', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

