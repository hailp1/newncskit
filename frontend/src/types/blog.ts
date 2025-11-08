/**
 * Blog System Types
 * Defines types for blog posts, categories, tags, and related operations
 */

/**
 * Blog post status
 */
export type PostStatus = 'draft' | 'published' | 'scheduled' | 'archived';

/**
 * Blog post (alias for backward compatibility)
 */
export type BlogPost = Post;

/**
 * Blog category (alias for backward compatibility)
 */
export type BlogCategory = Category;

/**
 * Blog tag (alias for backward compatibility)
 */
export type BlogTag = Tag;

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
    name?: string | null; // Alias for full_name
    email: string;
    avatar_url: string | null;
  };
  status: PostStatus;
  category: string | null;
  tags: string[];
  featured_image: string | null;
  featured_image_alt?: string | null;
  meta_description: string | null;
  view_count: number;
  like_count: number;
  views?: number; // Alias for view_count
  likes?: number; // Alias for like_count
  reading_time?: number; // Estimated reading time in minutes
  published_at: string | null;
  scheduled_at: string | null;
  created_at: string;
  updated_at: string;
  seo?: {
    title?: string;
    meta_title?: string; // Alias for title
    description?: string;
    meta_description?: string; // Alias for description
    keywords?: string[];
    meta_keywords?: string; // Alias for keywords
    og_image?: string;
    og_title?: string;
    og_description?: string;
    twitter_card?: string;
    canonical_url?: string;
  };
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
  id?: string;
  name: string;
  slug: string;
  description: string | null;
  post_count: number;
  color?: string;
}

/**
 * Blog tag
 */
export interface Tag {
  id?: string;
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

/**
 * Project summary for dashboard
 */
export interface ProjectSummary {
  id: string;
  title: string;
  name?: string;
  description?: string | null;
  status?: 'active' | 'completed' | 'archived';
  phase?: string;
  progress?: number;
  lastActivity?: Date;
  collaboratorCount?: number;
  created_at?: string;
  updated_at?: string;
  row_count?: number;
  column_count?: number;
}

/**
 * Reference for research
 */
export interface Reference {
  id: string;
  title: string;
  authors: string[] | Array<{ firstName: string; lastName: string }>;
  year: number;
  journal?: string;
  doi?: string;
  url?: string;
  notes?: string;
  tags?: string[];
  created_at?: string;
  createdAt?: string; // Alias for created_at
  attachments?: string[];
  metadata?: {
    publisher?: string;
    volume?: string;
    issue?: string;
    pages?: string;
    abstract?: string;
    type?: string;
    keywords?: string[];
    citationCount?: number;
    impactFactor?: number;
  };
  publication?: {
    name?: string;
    volume?: string;
    issue?: string;
    pages?: string;
    journal?: string;
    year?: number;
    doi?: string;
  };
}

/**
 * Full project details
 */
export interface Project {
  id: string;
  title: string;
  description?: string;
  phase: string;
  progress?: number;
  status?: string;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
  lastActivity?: Date;
  collaboratorCount?: number;
}

/**
 * Project creation input
 */
export interface ProjectCreation {
  title: string;
  description?: string;
  phase?: string;
  status?: string;
}
