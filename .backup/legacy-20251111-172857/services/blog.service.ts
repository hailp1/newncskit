/**
 * Blog Service
 * Manages blog posts: create, update, publish, delete
 */

import { createClient } from '@/lib/supabase/client'
import { Permission } from '@/lib/permissions/constants'
import { permissionService } from './permission.service'

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
  /**
   * Create new blog post
   */
  async createPost(post: CreatePostInput, authorId: string) {
    // Check permission
    const hasPermission = await permissionService.hasPermission(
      authorId,
      Permission.CREATE_POST
    )

    if (!hasPermission) {
      throw new Error('Insufficient permissions to create posts')
    }

    const supabase = createClient()

    // Generate slug
    const slug = this.generateSlug(post.title)

    // Check if slug exists
    const { data: existing } = await supabase
      .from('posts')
      .select('id')
      .eq('slug', slug)
      .single()

    const finalSlug = existing ? `${slug}-${Date.now()}` : slug

    // Insert post
    const { data, error } = await (supabase as any)
      .from('posts')
      .insert({
        ...post,
        slug: finalSlug,
        author_id: authorId,
        status: 'draft',
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create post: ${error.message}`)
    }

    return data
  }

  /**
   * Update blog post
   */
  async updatePost(
    postId: number,
    data: UpdatePostInput,
    userId: string
  ): Promise<void> {
    const supabase = createClient()

    // Get post
    const { data: post } = await supabase
      .from('posts')
      .select('author_id')
      .eq('id', postId)
      .single()

    if (!post) {
      throw new Error('Post not found')
    }

    // Check permission
    const canEdit = await this.canEditPost(userId, post)
    if (!canEdit) {
      throw new Error('Insufficient permissions to edit this post')
    }

    // Update slug if title changed
    if (data.title) {
      data = {
        ...data,
        slug: this.generateSlug(data.title),
      } as any
    }

    // Update post
    const { error } = await (supabase as any)
      .from('posts')
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', postId)

    if (error) {
      throw new Error(`Failed to update post: ${error.message}`)
    }
  }

  /**
   * Publish post
   */
  async publishPost(postId: number, userId: string): Promise<void> {
    const supabase = createClient()

    // Get post
    const { data: post } = await supabase
      .from('posts')
      .select('author_id, status')
      .eq('id', postId)
      .single()

    if (!post) {
      throw new Error('Post not found')
    }

    // Check permission
    const canPublish = await permissionService.hasPermission(
      userId,
      Permission.PUBLISH_POST
    )

    if (!canPublish) {
      throw new Error('Insufficient permissions to publish posts')
    }

    // Update status
    const { error } = await (supabase as any)
      .from('posts')
      .update({
        status: 'published',
        published_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', postId)

    if (error) {
      throw new Error(`Failed to publish post: ${error.message}`)
    }
  }

  /**
   * Schedule post for future publication
   */
  async schedulePost(
    postId: number,
    scheduledAt: Date,
    userId: string
  ): Promise<void> {
    const supabase = createClient()

    // Check permission
    const canSchedule = await permissionService.hasPermission(
      userId,
      Permission.SCHEDULE_POST
    )

    if (!canSchedule) {
      throw new Error('Insufficient permissions to schedule posts')
    }

    // Update status
    const { error } = await (supabase as any)
      .from('posts')
      .update({
        status: 'scheduled',
        scheduled_at: scheduledAt.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', postId)

    if (error) {
      throw new Error(`Failed to schedule post: ${error.message}`)
    }
  }

  /**
   * Delete post (archive)
   */
  async deletePost(postId: number, userId: string): Promise<void> {
    const supabase = createClient()

    // Get post
    const { data: post } = await supabase
      .from('posts')
      .select('author_id')
      .eq('id', postId)
      .single()

    if (!post) {
      throw new Error('Post not found')
    }

    // Check permission
    const canDelete = await this.canDeletePost(userId, post)
    if (!canDelete) {
      throw new Error('Insufficient permissions to delete this post')
    }

    // Archive post (soft delete)
    const { error } = await (supabase as any)
      .from('posts')
      .update({
        status: 'archived',
        updated_at: new Date().toISOString(),
      })
      .eq('id', postId)

    if (error) {
      throw new Error(`Failed to delete post: ${error.message}`)
    }
  }

  /**
   * Get published posts with pagination
   */
  async getPublishedPosts(params: GetPostsParams) {
    const supabase = createClient()
    const { page, limit, category, tag } = params

    let query = supabase
      .from('posts')
      .select(
        '*, author:profiles!posts_author_id_fkey(id, full_name, avatar_url)',
        { count: 'exact' }
      )
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .range(page * limit, (page + 1) * limit - 1)

    // Apply filters
    if (category) {
      query = query.eq('category', category)
    }

    if (tag) {
      query = query.contains('tags', [tag])
    }

    const { data, count, error } = await query

    if (error) {
      throw new Error(`Failed to get posts: ${error.message}`)
    }

    return {
      posts: data || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    }
  }

  /**
   * Get post by slug
   */
  async getPostBySlug(slug: string) {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('posts')
      .select('*, author:profiles!posts_author_id_fkey(id, full_name, avatar_url, bio)')
      .eq('slug', slug)
      .eq('status', 'published')
      .single()

    if (error) {
      throw new Error(`Failed to get post: ${error.message}`)
    }

    return data
  }

  /**
   * Get my posts (for author)
   */
  async getMyPosts(authorId: string, params: GetPostsParams) {
    const supabase = createClient()
    const { page, limit, status } = params

    let query = supabase
      .from('posts')
      .select('*', { count: 'exact' })
      .eq('author_id', authorId)
      .order('updated_at', { ascending: false })
      .range(page * limit, (page + 1) * limit - 1)

    if (status) {
      query = query.eq('status', status)
    }

    const { data, count, error } = await query

    if (error) {
      throw new Error(`Failed to get posts: ${error.message}`)
    }

    return {
      posts: data || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    }
  }

  /**
   * Increment view count
   */
  async incrementViewCount(postId: number): Promise<void> {
    const supabase = createClient()

    // Use RPC function if available, otherwise manual increment
    const { data: post } = await supabase
      .from('posts')
      .select('view_count')
      .eq('id', postId)
      .single()

    if (post) {
      await (supabase as any)
        .from('posts')
        .update({ view_count: ((post as any).view_count || 0) + 1 })
        .eq('id', postId)
    }
  }

  /**
   * Check if user can edit post
   */
  async canEditPost(userId: string, post: any): Promise<boolean> {
    // Own post
    if (post.author_id === userId) {
      return await permissionService.hasPermission(userId, Permission.EDIT_OWN_POST)
    }

    // Any post
    return await permissionService.hasPermission(userId, Permission.EDIT_ANY_POST)
  }

  /**
   * Check if user can delete post
   */
  async canDeletePost(userId: string, post: any): Promise<boolean> {
    // Own post
    if (post.author_id === userId) {
      return await permissionService.hasPermission(
        userId,
        Permission.DELETE_OWN_POST
      )
    }

    // Any post
    return await permissionService.hasPermission(userId, Permission.DELETE_ANY_POST)
  }

  /**
   * Generate URL-friendly slug from title
   */
  generateSlug(title: string): string {
    return title
      .toLowerCase()
      .normalize('NFD') // Normalize Vietnamese characters
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
      .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
      .substring(0, 100) // Limit length
  }

  /**
   * Get all categories
   */
  async getCategories() {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('posts')
      .select('category')
      .eq('status', 'published')
      .not('category', 'is', null)

    if (error) {
      throw new Error(`Failed to get categories: ${error.message}`)
    }

    // Count posts per category
    const categories = (data || []).reduce((acc: any, post: any) => {
      const cat = post.category
      acc[cat] = (acc[cat] || 0) + 1
      return acc
    }, {})

    return Object.entries(categories).map(([name, count]) => ({
      name,
      count,
    }))
  }

  /**
   * Get all tags
   */
  async getTags() {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('posts')
      .select('tags')
      .eq('status', 'published')
      .not('tags', 'is', null)

    if (error) {
      throw new Error(`Failed to get tags: ${error.message}`)
    }

    // Flatten and count tags
    const allTags = (data || []).flatMap((post: any) => post.tags || [])
    const tagCounts = allTags.reduce((acc: any, tag: string) => {
      acc[tag] = (acc[tag] || 0) + 1
      return acc
    }, {})

    return Object.entries(tagCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a: any, b: any) => b.count - a.count)
  }
}

// Export singleton instance
export const blogService = new BlogService()
