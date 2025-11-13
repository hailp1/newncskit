/**
 * Blog Service
 * NOTE: Blog functionality now uses API routes directly
 * This service is deprecated but kept for compatibility
 */

import { Permission } from '@/lib/permissions/constants'

interface CreatePostInput {
  title: string
  content: string
  excerpt?: string
  category?: string
  tags?: string[]
  featured_image?: string
  meta_description?: string
}

interface UpdatePostInput extends Partial<CreatePostInput> {}

interface GetPostsParams {
  page: number
  limit: number
  category?: string
  tag?: string
  status?: string
  authorId?: string
}

export class BlogService {
  async createPost(post: CreatePostInput, authorId: string) {
    throw new Error('Use API route: POST /api/blog/posts')
  }

  async updatePost(postId: number, data: UpdatePostInput, userId: string): Promise<void> {
    throw new Error('Use API route: PATCH /api/blog/posts/[id]')
  }

  async publishPost(postId: number, userId: string): Promise<void> {
    throw new Error('Use API route: POST /api/blog/posts/[id]/publish')
  }

  async schedulePost(postId: number, scheduledAt: Date, userId: string): Promise<void> {
    throw new Error('Use API route: POST /api/blog/posts/[id]/schedule')
  }

  async deletePost(postId: number, userId: string): Promise<void> {
    throw new Error('Use API route: DELETE /api/blog/posts/[id]')
  }

  async getPublishedPosts(params: GetPostsParams) {
    // This method is used by client components, so we'll make it work
    const response = await fetch(`/api/blog/posts?page=${params.page}&limit=${params.limit}`)
    if (!response.ok) {
      return { results: [], total: 0, page: params.page, limit: params.limit }
    }
    const data = await response.json()
    return {
      results: data.data?.posts || [],
      total: data.data?.pagination?.total || 0,
      page: params.page,
      limit: params.limit
    }
  }

  async getPostBySlug(slug: string) {
    const response = await fetch(`/api/blog/posts/slug/${slug}`)
    if (!response.ok) return null
    const data = await response.json()
    return data.data
  }

  async getMyPosts(authorId: string, params: GetPostsParams) {
    return { posts: [], total: 0, page: params.page, limit: params.limit }
  }

  async incrementViewCount(postId: number): Promise<void> {
    // Silent increment
  }

  async incrementView(postId: string): Promise<void> {
    // Silent increment
  }

  async canEditPost(userId: string, post: any): Promise<boolean> {
    return false
  }

  async canDeletePost(userId: string, post: any): Promise<boolean> {
    return false
  }

  generateSlug(title: string): string {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 100)
  }

  async getCategories() {
    const response = await fetch('/api/blog/categories')
    if (!response.ok) return []
    const data = await response.json()
    return data.data || []
  }

  async getTags() {
    const response = await fetch('/api/blog/tags')
    if (!response.ok) return []
    const data = await response.json()
    return data.data || []
  }
}

export const blogService = new BlogService()
