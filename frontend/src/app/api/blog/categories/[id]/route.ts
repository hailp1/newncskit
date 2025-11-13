import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Get single category
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const category = await prisma.blogCategory.findUnique({
      where: { id: parseInt(id) },
      include: {
        _count: {
          select: { posts: true }
        },
        parent: true,
        children: true
      }
    })

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      id: category.id.toString(),
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      color: category.color || '',
      icon: category.icon || '',
      parent: category.parentId?.toString(),
      post_count: category._count.posts,
      created_at: category.createdAt.toISOString(),
      updated_at: category.updatedAt.toISOString()
    })
  } catch (error) {
    console.error('Error fetching category:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH - Update category
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session || !['admin', 'moderator'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()

    const category = await prisma.blogCategory.update({
      where: { id: parseInt(id) },
      data: {
        name: body.name,
        slug: body.slug,
        description: body.description,
        color: body.color,
        icon: body.icon,
        parentId: body.parentId ? parseInt(body.parentId) : null
      },
      include: {
        _count: {
          select: { posts: true }
        }
      }
    })

    return NextResponse.json({
      id: category.id.toString(),
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      color: category.color || '',
      icon: category.icon || '',
      post_count: category._count.posts,
      updated_at: category.updatedAt.toISOString()
    })
  } catch (error) {
    console.error('Error updating category:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Delete category
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session || !['admin', 'super_admin'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }

    const categoryId = parseInt(id)

    if (isNaN(categoryId)) {
      return NextResponse.json(
        { error: 'Invalid category ID' },
        { status: 400 }
      )
    }

    // Check if category exists and get post count
    const category = await prisma.blogCategory.findUnique({
      where: { id: categoryId },
      include: {
        _count: {
          select: { posts: true }
        }
      }
    })

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    // Prevent deletion if category has posts
    if (category._count.posts > 0) {
      return NextResponse.json(
        { 
          error: 'Cannot delete category with posts',
          message: `This category has ${category._count.posts} post(s). Please remove or reassign all posts before deleting.`
        },
        { status: 400 }
      )
    }

    // Delete category
    await prisma.blogCategory.delete({
      where: { id: categoryId }
    })

    return NextResponse.json({ 
      success: true,
      message: 'Category deleted successfully'
    })
  } catch (error) {
    console.error('[DELETE /api/blog/categories/[id]] Error deleting category:', error)
    
    // Check for foreign key constraint errors
    if (error && typeof error === 'object' && 'code' in error) {
      const prismaError = error as any
      if (prismaError.code === 'P2003') {
        return NextResponse.json(
          { 
            error: 'Cannot delete category',
            message: 'This category is being used by posts. Please remove or reassign all posts first.'
          },
          { status: 400 }
        )
      }
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
