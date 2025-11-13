import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Validation schema
const createPostSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  content: z.string().min(1, 'Content is required'),
  excerpt: z.string().optional(),
  categoryId: z.union([z.number().int().positive(), z.null()]).optional(),
  tags: z.array(z.string()).optional(),
  featuredImage: z.union([z.string().url(), z.literal(''), z.null()]).optional(),
  metaDescription: z.union([z.string().max(500), z.null()]).optional(),
  status: z.enum(['draft', 'published', 'review']).default('draft'),
})

// Generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 100)
}

/**
 * POST /api/blog/posts
 * Create a new blog post
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      console.error('[POST /api/blog/posts] No session found')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user ID from session - ensure it's a valid UUID
    let userId = (session.user as any).id
    
    if (!userId) {
      console.error('[POST /api/blog/posts] User ID not found in session:', JSON.stringify(session.user, null, 2))
      return NextResponse.json(
        { error: 'User ID not found in session' },
        { status: 401 }
      )
    }

    // Validate UUID format (UUID v4 has 36 characters with dashes, or 32 without)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    const uuidSimpleRegex = /^[0-9a-f]{32}$/i
    
    // If userId is not a valid UUID, try to get it from database using email
    if (!uuidRegex.test(userId) && !uuidSimpleRegex.test(userId)) {
      console.warn('[POST /api/blog/posts] User ID is not a valid UUID, fetching from database:', userId)
      
      if (session.user.email) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true }
          })
          
          if (dbUser) {
            userId = dbUser.id
            console.log('[POST /api/blog/posts] Found UUID from database:', userId)
          } else {
            console.error('[POST /api/blog/posts] User not found in database with email:', session.user.email)
            return NextResponse.json(
              { error: 'User not found in database' },
              { status: 401 }
            )
          }
        } catch (error) {
          console.error('[POST /api/blog/posts] Error fetching user from database:', error)
          return NextResponse.json(
            { error: 'Failed to validate user' },
            { status: 500 }
          )
        }
      } else {
        console.error('[POST /api/blog/posts] No email in session, cannot fetch UUID')
        return NextResponse.json(
          { error: 'Invalid user session' },
          { status: 401 }
        )
      }
    }

    console.log('[POST /api/blog/posts] User ID (UUID):', userId)

    // Parse and validate request body
    const body = await request.json()
    console.log('[POST /api/blog/posts] Request body:', JSON.stringify(body, null, 2))
    
    const validatedData = createPostSchema.parse(body)
    console.log('[POST /api/blog/posts] Validated data:', JSON.stringify(validatedData, null, 2))

    // Generate slug
    const baseSlug = generateSlug(validatedData.title)
    console.log('[POST /api/blog/posts] Generated slug:', baseSlug)
    
    // Check if slug exists and make it unique
    const existingPost = await prisma.post.findUnique({
      where: { slug: baseSlug },
    })
    
    const slug = existingPost ? `${baseSlug}-${Date.now()}` : baseSlug
    console.log('[POST /api/blog/posts] Final slug:', slug)

    // Check if category is "paper" - if so, set status to "review" instead of "published"
    let finalStatus = validatedData.status
    if (validatedData.categoryId) {
      const category = await prisma.blogCategory.findUnique({
        where: { id: validatedData.categoryId },
        select: { name: true, slug: true }
      })
      
      // If category is "paper" and user tries to publish, set to "review" for admin approval
      if (category && (category.name.toLowerCase() === 'paper' || category.slug.toLowerCase() === 'paper')) {
        if (validatedData.status === 'published') {
          finalStatus = 'review'
          console.log('[POST /api/blog/posts] Category is "paper", changing status from "published" to "review" for admin approval')
        }
      }
    }

    // Prepare data for Prisma
    const postData: any = {
      title: validatedData.title,
      content: validatedData.content,
      slug,
      authorId: userId,
      status: finalStatus,
      publishedAt: finalStatus === 'published' ? new Date() : null,
    }

    // Handle optional fields
    if (validatedData.categoryId !== undefined && validatedData.categoryId !== null) {
      postData.categoryId = validatedData.categoryId
    }

    if (validatedData.tags && Array.isArray(validatedData.tags) && validatedData.tags.length > 0) {
      postData.tags = validatedData.tags
    } else {
      postData.tags = null
    }

    if (validatedData.featuredImage && validatedData.featuredImage.trim() !== '') {
      postData.featuredImage = validatedData.featuredImage
    } else {
      postData.featuredImage = null
    }

    if (validatedData.metaDescription && validatedData.metaDescription.trim() !== '') {
      postData.metaDescription = validatedData.metaDescription
    } else {
      postData.metaDescription = null
    }

    console.log('[POST /api/blog/posts] Post data to create:', JSON.stringify(postData, null, 2))

    // Create post
    const post = await prisma.post.create({
      data: postData,
      include: {
        author: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    })

    console.log('[POST /api/blog/posts] Post created successfully:', post.id)

    return NextResponse.json({
      success: true,
      data: post,
      message: 'Post created successfully',
    })
  } catch (error) {
    console.error('[POST /api/blog/posts] Error creating post:', error)
    
    // Log full error details
    if (error instanceof Error) {
      console.error('[POST /api/blog/posts] Error message:', error.message)
      console.error('[POST /api/blog/posts] Error stack:', error.stack)
    }

    if (error instanceof z.ZodError) {
      console.error('[POST /api/blog/posts] Validation errors:', JSON.stringify(error.issues, null, 2))
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      )
    }

    // Check for Prisma errors
    if (error && typeof error === 'object' && 'code' in error) {
      console.error('[POST /api/blog/posts] Prisma error code:', (error as any).code)
      console.error('[POST /api/blog/posts] Prisma error meta:', JSON.stringify((error as any).meta, null, 2))
    }

    return NextResponse.json(
      { 
        error: 'Failed to create post',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/blog/posts
 * Get posts with pagination and filters
 * For admin: can load all posts (no status filter)
 * For public: only published posts
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication for admin access
    const session = await getServerSession(authOptions)
    const isAdmin = session?.user && ((session.user as any).role === 'admin' || (session.user as any).role === 'super_admin')

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const categoryId = searchParams.get('categoryId')
    const tag = searchParams.get('tag')
    const search = searchParams.get('search')
    const statusParam = searchParams.get('status')
    
    // Default to 'published' for public, allow all for admin if no status specified
    const status = statusParam || (isAdmin ? undefined : 'published')

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    
    // Only filter by status if specified (admin can see all)
    if (status) {
      where.status = status
    }

    if (categoryId) {
      const categoryIdNum = parseInt(categoryId)
      if (!isNaN(categoryIdNum)) {
        where.categoryId = categoryIdNum
        // When filtering by category, ensure we only get published posts for public access
        if (!isAdmin && !status) {
          where.status = 'published'
        }
      }
    }

    if (tag) {
      where.tags = {
        array_contains: tag,
      }
    }

    // Support search in title and content
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ]
    }

    // Get posts with count
    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        skip,
        take: limit,
        orderBy: status === 'published' ? { publishedAt: 'desc' } : { createdAt: 'desc' },
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
      prisma.post.count({ where }),
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

    // Get base URL from request headers (for Cloudflare tunnel compatibility)
    const protocol = request.headers.get('x-forwarded-proto') || 
                     (request.url.startsWith('https') ? 'https' : 'http')
    const host = request.headers.get('host') || 
                 request.headers.get('x-forwarded-host') ||
                 new URL(request.url).host
    
    // Use production URL if available, otherwise construct from request
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
                    process.env.NEXTAUTH_URL ||
                    (host ? `${protocol}://${host}` : request.url.split('?')[0].replace(/\/api\/blog\/posts.*$/, ''))
    
    const apiPath = '/api/blog/posts'
    
    // Return format matching blogService expectation
    return NextResponse.json({
      results: transformedPosts,
      count: total,
      next: page * limit < total ? `${baseUrl}${apiPath}?page=${page + 1}&limit=${limit}` : undefined,
      previous: page > 1 ? `${baseUrl}${apiPath}?page=${page - 1}&limit=${limit}` : undefined,
    })
  } catch (error) {
    console.error('[GET /api/blog/posts] Error fetching posts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch posts', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
