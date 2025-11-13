import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Validation schema for update
const updatePostSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  content: z.string().min(1).optional(),
  excerpt: z.string().optional(),
  categoryId: z.number().optional(),
  tags: z.array(z.string()).optional(),
  featuredImage: z.string().url().optional().or(z.literal('')).or(z.null()),
  metaDescription: z.string().max(500).optional(),
  status: z.enum(['draft', 'published', 'archived', 'review']).optional(),
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
 * GET /api/blog/posts/[id]
 * Get a single post by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const postId = parseInt(id)

    if (isNaN(postId)) {
      return NextResponse.json(
        { error: 'Invalid post ID' },
        { status: 400 }
      )
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        author: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatarUrl: true,
            bio: true,
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
    })

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    // Transform post to match BlogPost interface (same as GET /api/blog/posts)
    const transformedPost = {
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
    }

    // Return format matching blogService expectation (direct BlogPost object, not wrapped)
    return NextResponse.json(transformedPost)
  } catch (error) {
    console.error('Error fetching post:', error)
    return NextResponse.json(
      { error: 'Failed to fetch post' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/blog/posts/[id]
 * Update a blog post
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params
    const postId = parseInt(id)

    if (isNaN(postId)) {
      return NextResponse.json(
        { error: 'Invalid post ID' },
        { status: 400 }
      )
    }

    // Get existing post
    const existingPost = await prisma.post.findUnique({
      where: { id: postId },
    })

    if (!existingPost) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    // Check if user is the author or has admin role
    const isAuthor = existingPost.authorId === session.user.id
    const isAdmin = session.user.role === 'admin' || session.user.role === 'super_admin'

    if (!isAuthor && !isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden: You can only edit your own posts' },
        { status: 403 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = updatePostSchema.parse(body)

    // Check if category is "paper" - if so, set status to "review" instead of "published"
    let finalStatus = validatedData.status
    if (validatedData.categoryId !== undefined) {
      const category = await prisma.blogCategory.findUnique({
        where: { id: validatedData.categoryId },
        select: { name: true, slug: true }
      })
      
      // If category is "paper" and user tries to publish, set to "review" for admin approval
      if (category && (category.name.toLowerCase() === 'paper' || category.slug.toLowerCase() === 'paper')) {
        if (validatedData.status === 'published') {
          finalStatus = 'review'
          console.log('[PATCH /api/blog/posts/[id]] Category is "paper", changing status from "published" to "review" for admin approval')
        }
      }
    }

    // Prepare update data
    const updateData: any = {
      ...validatedData,
      status: finalStatus,
      updatedAt: new Date(),
    }

    // Set publishedAt if status changes to published
    if (finalStatus === 'published' && existingPost.status !== 'published') {
      updateData.publishedAt = new Date()
    } else if (finalStatus !== 'published') {
      updateData.publishedAt = null
    }

    // Generate new slug if title changed
    if (validatedData.title && validatedData.title !== existingPost.title) {
      const baseSlug = generateSlug(validatedData.title)
      
      // Check if new slug exists
      const slugExists = await prisma.post.findFirst({
        where: {
          slug: baseSlug,
          id: { not: postId },
        },
      })
      
      updateData.slug = slugExists ? `${baseSlug}-${Date.now()}` : baseSlug
    }

    // Set publishedAt if status changes to published
    if (validatedData.status === 'published' && existingPost.status !== 'published') {
      updateData.publishedAt = new Date()
    }

    // Update post
    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: updateData,
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

    return NextResponse.json({
      success: true,
      data: updatedPost,
      message: 'Post updated successfully',
    })
  } catch (error) {
    console.error('Error updating post:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update post' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/blog/posts/[id]
 * Delete (archive) a blog post
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params
    const postId = parseInt(id)

    if (isNaN(postId)) {
      return NextResponse.json(
        { error: 'Invalid post ID' },
        { status: 400 }
      )
    }

    // Get existing post
    const existingPost = await prisma.post.findUnique({
      where: { id: postId },
    })

    if (!existingPost) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    // Get user ID from session - ensure it's a valid UUID
    let userId = (session.user as any).id

    // Validate UUID format and fetch from database if needed
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    const uuidSimpleRegex = /^[0-9a-f]{32}$/i
    
    if (!userId || (!uuidRegex.test(userId) && !uuidSimpleRegex.test(userId))) {
      if (session.user.email) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true }
          })
          
          if (dbUser) {
            userId = dbUser.id
          }
        } catch (error) {
          console.error('[DELETE /api/blog/posts/[id]] Error fetching user:', error)
        }
      }
    }

    // Check if user is the author or has admin role
    const isAuthor = existingPost.authorId === userId
    const isAdmin = (session.user as any).role === 'admin' || (session.user as any).role === 'super_admin'

    if (!isAuthor && !isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden: You can only delete your own posts' },
        { status: 403 }
      )
    }

    // Hard delete the post (permanently remove from database)
    await prisma.post.delete({
      where: { id: postId },
    })

    console.log('[DELETE /api/blog/posts/[id]] Post deleted successfully:', postId)

    return NextResponse.json({
      success: true,
      message: 'Post deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting post:', error)
    return NextResponse.json(
      { error: 'Failed to delete post' },
      { status: 500 }
    )
  }
}
