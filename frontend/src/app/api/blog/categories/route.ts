import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - List categories
export async function GET(request: NextRequest) {
  try {
    const categories = await prisma.blogCategory.findMany({
      include: {
        _count: {
          select: { posts: true }
        },
        parent: true,
        children: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    const results = categories.map(cat => ({
      id: cat.id.toString(),
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
      color: cat.color || '',
      icon: cat.icon || '',
      parent: cat.parentId?.toString(),
      post_count: cat._count.posts,
      created_at: cat.createdAt.toISOString(),
      updated_at: cat.updatedAt.toISOString()
    }))

    return NextResponse.json({
      results,
      count: results.length
    })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create category
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !['admin', 'moderator'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()

    if (!body.name || !body.slug) {
      return NextResponse.json(
        { error: 'Name and slug are required' },
        { status: 400 }
      )
    }

    const category = await prisma.blogCategory.create({
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
      created_at: category.createdAt.toISOString(),
      updated_at: category.updatedAt.toISOString()
    })
  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
