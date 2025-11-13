import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/blog/posts/[id]/approve
 * Approve a pending post (change status from 'review' to 'published')
 * Only accessible by admin
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    // Only approve posts with status 'review'
    if (existingPost.status !== 'review') {
      return NextResponse.json(
        { error: `Post is not pending approval. Current status: ${existingPost.status}` },
        { status: 400 }
      )
    }

    // Approve post (change status to published)
    const approvedPost = await prisma.post.update({
      where: { id: postId },
      data: {
        status: 'published',
        publishedAt: new Date(),
        updatedAt: new Date(),
      },
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
    })

    // Transform post to match BlogPost interface
    const transformedPost = {
      id: approvedPost.id.toString(),
      title: approvedPost.title,
      slug: approvedPost.slug || `post-${approvedPost.id}`,
      excerpt: approvedPost.metaDescription || approvedPost.content?.substring(0, 200) || '',
      content: approvedPost.content || '',
      status: approvedPost.status as 'draft' | 'review' | 'scheduled' | 'published',
      author: {
        id: approvedPost.authorId || '',
        username: approvedPost.author?.email || '',
        first_name: approvedPost.author?.fullName?.split(' ')[0] || '',
        last_name: approvedPost.author?.fullName?.split(' ').slice(1).join(' ') || '',
      },
      meta_title: approvedPost.metaDescription || approvedPost.title,
      meta_description: approvedPost.metaDescription || '',
      focus_keyword: '',
      canonical_url: '',
      og_title: approvedPost.title,
      og_description: approvedPost.metaDescription || '',
      word_count: approvedPost.content?.split(/\s+/).length || 0,
      reading_time: Math.ceil((approvedPost.content?.split(/\s+/).length || 0) / 200),
      seo_score: 0,
      readability_score: 0,
      published_at: approvedPost.publishedAt?.toISOString(),
      scheduled_at: null,
      categories: approvedPost.category ? [{
        id: approvedPost.category.id.toString(),
        name: approvedPost.category.name,
        slug: approvedPost.category.slug,
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
      is_published: approvedPost.status === 'published',
      estimated_reading_time: `${Math.ceil((approvedPost.content?.split(/\s+/).length || 0) / 200)} min`,
      created_at: approvedPost.createdAt.toISOString(),
      updated_at: approvedPost.updatedAt.toISOString(),
    }

    return NextResponse.json({
      success: true,
      data: transformedPost,
      message: 'Post approved and published successfully',
    })
  } catch (error) {
    console.error('[POST /api/blog/posts/[id]/approve] Error approving post:', error)
    return NextResponse.json(
      { error: 'Failed to approve post', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

