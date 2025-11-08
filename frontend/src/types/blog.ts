/**
 * Blog System Types
 * Defines types for blog posts, categories, tags, and related operations
 */

/**
 * Blog post status
 */
export type PostStatus = 'draft' | 'published' | 'scheduled' | 'archived';

/**
 * Blog post
 */
export interface Post {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  author_id: string;
  author?: {
    id: string;
    full_name: string | null;
    email: string;
    avatar_url: string | null;
  };
  status: PostStatus;
  category: string | null;
  tags: string[];
  featured_image: string | null;
  meta_description: string | null;
  view_count: number;
  like_count: number;
  published_at: string | null;
  scheduled_at: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Create post input
 */
export interface CreatePostInput {
  title: string;
  content: string;
  excerpt?: string;
  category?: string;
  tags?: string[];
  featured_image?: string;
  meta_description?: string;
  status?: PostStatus;
  scheduled_at?: string;
}

/**
 * Update post input
 */
export interface UpdatePostInput {
  title?: string;
  content?: string;
  excerpt?: string;
  category?: string;
  tags?: string[];
  featured_image?: string;
  meta_description?: string;
  status?: PostStatus;
  scheduled_at?: string;
}

/**
 * Get posts query parameters
 */
export interface GetPostsParams {
  page: number;
  limit: number;
  status?: PostStatus;
  category?: string;
  tag?: string;
  author_id?: string;
  search?: string;
  sort_by?: 'created_at' | 'published_at' | 'view_count' | 'like_count' | 'title';
  sort_order?: 'asc' | 'desc';
}

/**
 * Get posts response
 */
export interface GetPostsResponse {
  posts: Post[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

/**
 * Blog category
 */
export interface Category {
  name: string;
  slug: string;
  description: string | null;
  post_count: number;
}

/**
 * Blog tag
 */
export interface Tag {
  name: string;
  slug: string;
  post_count: number;
}

/**
 * Publish post input
 */
export interface PublishPostInput {
  publish_now?: boolean;
  scheduled_at?: string;
}

/**
 * Schedule post input
 */
export interface SchedulePostInput {
  scheduled_at: string;
}

/**
 * Post with related posts
 */
export interface PostWithRelated extends Post {
  related_posts: Post[];
}

/**
 * Post statistics
 */
export interface PostStats {
  total_views: number;
  total_likes: number;
  average_views_per_post: number;
  most_viewed_post: Post | null;
  most_liked_post: Post | null;
  posts_by_status: Record<PostStatus, number>;
  posts_by_category: Record<string, number>;
}

/**
 * Author statistics
 */
export interface AuthorStats {
  author_id: string;
  author: {
    id: string;
    full_name: string | null;
    email: string;
    avatar_url: string | null;
  };
  total_posts: number;
  published_posts: number;
  total_views: number;
  total_likes: number;
  average_views_per_post: number;
}
