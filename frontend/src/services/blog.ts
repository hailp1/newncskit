import { apiClient } from './api-client';

// Service-specific BlogPost type with all required fields
export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  status: 'draft' | 'review' | 'scheduled' | 'published';
  author: {
    id: string;
    username: string;
    first_name: string;
    last_name: string;
  };
  collaborators?: Array<{
    id: string;
    username: string;
    first_name: string;
    last_name: string;
  }>;
  meta_title: string;
  meta_description: string;
  focus_keyword: string;
  canonical_url: string;
  og_title: string;
  og_description: string;
  og_image?: MediaFile;
  twitter_title: string;
  twitter_description: string;
  twitter_image?: MediaFile;
  word_count: number;
  reading_time: number;
  seo_score: number;
  readability_score: number;
  published_at?: string;
  scheduled_at?: string;
  categories: BlogCategory[];
  tags: BlogTag[];
  featured_image?: MediaFile;
  view_count: number;
  like_count: number;
  share_count: number;
  comment_count: number;
  is_published: boolean;
  estimated_reading_time: string;
  created_at: string;
  updated_at: string;
}

// Service-specific category with additional fields
export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  parent?: string;
  color: string;
  icon: string;
  meta_title: string;
  meta_description: string;
  post_count: number;
  children?: BlogCategory[];
  hierarchy?: BlogCategory[];
  created_at: string;
  updated_at: string;
}

export interface BlogTag {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  post_count: number;
  created_at: string;
}

export interface MediaFile {
  id: string;
  filename: string;
  original_name: string;
  mime_type: string;
  file_size: number;
  file_size_mb: number;
  storage_path: string;
  cdn_url: string;
  width?: number;
  height?: number;
  alt_text: string;
  caption: string;
  description: string;
  ai_description: string;
  ai_tags: string[];
  detected_objects: string[];
  folder?: MediaFolder;
  tags: MediaTag[];
  usage_count: number;
  last_used?: string;
  uploaded_by: {
    id: string;
    username: string;
  };
  is_image: boolean;
  created_at: string;
  updated_at: string;
}

export interface MediaFolder {
  id: string;
  name: string;
  slug: string;
  parent?: string;
}

export interface MediaTag {
  name: string;
  slug: string;
}

export interface SEOAnalysis {
  overall_score: number;
  grade: string;
  title_score: number;
  description_score: number;
  content_score: number;
  keyword_score: number;
  readability_score: number;
  technical_score: number;
  focus_keyword: string;
  keyword_density: number;
  keyword_distribution: Record<string, number>;
  related_keywords: string[];
  flesch_kincaid_score: number;
  gunning_fog_score: number;
  coleman_liau_score: number;
  sentence_count: number;
  paragraph_count: number;
  internal_links: number;
  external_links: number;
  images_without_alt: number;
  heading_structure: Record<string, number>;
  suggestions: Array<{
    type: string;
    priority: string;
    message: string;
    action: string;
    impact: number;
  }>;
  competitor_data: Record<string, any>;
  analyzed_at: string;
}

export interface BlogComment {
  id: string;
  author: {
    id: string;
    username: string;
    first_name: string;
    last_name: string;
  };
  content: string;
  parent?: string;
  replies: BlogComment[];
  is_approved: boolean;
  is_spam: boolean;
  created_at: string;
  updated_at: string;
}

export class BlogService {
  private baseUrl = '/api/blog';

  // Blog Posts
  async getPosts(options: {
    page?: number;
    limit?: number;
    category?: string;
    categoryId?: string | number;
    tag?: string;
    search?: string;
    status?: string;
    author?: string;
  } = {}): Promise<{ results: BlogPost[], count: number, next?: string, previous?: string }> {
    const params = new URLSearchParams();
    
    if (options.page) params.append('page', options.page.toString());
    if (options.limit) params.append('limit', options.limit.toString());
    if (options.category) params.append('category', options.category);
    if (options.categoryId) params.append('categoryId', options.categoryId.toString());
    if (options.tag) params.append('tag', options.tag);
    if (options.search) params.append('search', options.search);
    if (options.status) params.append('status', options.status);
    if (options.author) params.append('author', options.author);

    const response = await apiClient.get(`${this.baseUrl}/posts?${params.toString()}`);
    return response.data;
  }

  async getPostById(id: string): Promise<BlogPost> {
    const response = await apiClient.get(`${this.baseUrl}/posts/${id}`);
    return response.data;
  }

  async getPostBySlug(slug: string): Promise<BlogPost> {
    const response = await apiClient.get(`${this.baseUrl}/posts/slug/${slug}`);
    return response.data;
  }

  async createPost(postData: Partial<BlogPost>): Promise<BlogPost> {
    const response = await apiClient.post(`${this.baseUrl}/posts`, postData);
    return response.data;
  }

  async updatePost(id: string, postData: Partial<BlogPost>): Promise<BlogPost> {
    const response = await apiClient.patch(`${this.baseUrl}/posts/${id}`, postData);
    return response.data;
  }

  async deletePost(id: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/posts/${id}`);
  }

  async publishPost(id: string): Promise<BlogPost> {
    const response = await apiClient.post(`${this.baseUrl}/posts/${id}/publish`);
    return response.data;
  }

  async getPendingPosts(options: {
    page?: number;
    limit?: number;
  } = {}): Promise<{ results: BlogPost[], count: number, next?: string, previous?: string }> {
    const params = new URLSearchParams();
    if (options.page) params.append('page', options.page.toString());
    if (options.limit) params.append('limit', options.limit.toString());

    const response = await apiClient.get(`${this.baseUrl}/posts/pending?${params.toString()}`);
    return response.data;
  }

  async approvePost(id: string): Promise<BlogPost> {
    const response = await apiClient.post(`${this.baseUrl}/posts/${id}/approve`);
    return response.data;
  }

  async schedulePost(id: string, scheduledAt: string): Promise<BlogPost> {
    const response = await apiClient.post(`${this.baseUrl}/posts/${id}/schedule`, {
      scheduled_at: scheduledAt
    });
    return response.data;
  }

  async getPublishedPosts(options: {
    page?: number;
    limit?: number;
    category?: string;
    tag?: string;
  } = {}): Promise<{ results: BlogPost[], count: number }> {
    return this.getPosts({ ...options, status: 'published' });
  }

  async getDraftPosts(): Promise<BlogPost[]> {
    const response = await this.getPosts({ status: 'draft' });
    return response.results;
  }

  async getRelatedPosts(id: string): Promise<BlogPost[]> {
    const response = await apiClient.get(`${this.baseUrl}/posts/${id}/related`);
    return response.data;
  }

  async incrementView(id: string): Promise<{ view_count: number }> {
    const response = await apiClient.post(`${this.baseUrl}/posts/${id}/view`);
    return response.data;
  }

  async likePost(id: string, action: 'like' | 'unlike' = 'like'): Promise<{ like_count: number }> {
    const response = await apiClient.post(`${this.baseUrl}/posts/${id}/like`, { action });
    return response.data;
  }

  async searchPosts(query: string): Promise<BlogPost[]> {
    const response = await apiClient.get(`${this.baseUrl}/posts/search?q=${encodeURIComponent(query)}`);
    return response.data;
  }

  // Categories
  async getCategories(): Promise<BlogCategory[]> {
    const response = await apiClient.get(`${this.baseUrl}/categories`);
    return response.data.results || response.data;
  }

  async getCategoryHierarchy(): Promise<BlogCategory[]> {
    const response = await apiClient.get(`${this.baseUrl}/categories/hierarchy`);
    return response.data;
  }

  async createCategory(categoryData: Partial<BlogCategory>): Promise<BlogCategory> {
    const response = await apiClient.post(`${this.baseUrl}/categories`, categoryData);
    return response.data;
  }

  async updateCategory(id: string, categoryData: Partial<BlogCategory>): Promise<BlogCategory> {
    const response = await apiClient.patch(`${this.baseUrl}/categories/${id}`, categoryData);
    return response.data;
  }

  async deleteCategory(id: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/categories/${id}`);
  }

  async getCategoryPosts(id: string): Promise<BlogPost[]> {
    const response = await apiClient.get(`${this.baseUrl}/categories/${id}/posts`);
    return response.data;
  }

  // Tags
  async getTags(): Promise<BlogTag[]> {
    const response = await apiClient.get(`${this.baseUrl}/tags`);
    return response.data.results || response.data;
  }

  async getPopularTags(): Promise<BlogTag[]> {
    const response = await apiClient.get(`${this.baseUrl}/tags/popular`);
    return response.data;
  }

  async createTag(tagData: Partial<BlogTag>): Promise<BlogTag> {
    const response = await apiClient.post(`${this.baseUrl}/tags`, tagData);
    return response.data;
  }

  async updateTag(id: string, tagData: Partial<BlogTag>): Promise<BlogTag> {
    const response = await apiClient.patch(`${this.baseUrl}/tags/${id}`, tagData);
    return response.data;
  }

  async deleteTag(id: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/tags/${id}`);
  }

  async getTagPosts(id: string): Promise<BlogPost[]> {
    const response = await apiClient.get(`${this.baseUrl}/tags/${id}/posts`);
    return response.data;
  }

  // Media
  async getMediaFiles(options: {
    page?: number;
    limit?: number;
    search?: string;
    folder?: string;
  } = {}): Promise<{ results: MediaFile[], count: number }> {
    const params = new URLSearchParams();
    
    if (options.page) params.append('page', options.page.toString());
    if (options.limit) params.append('limit', options.limit.toString());
    if (options.search) params.append('search', options.search);
    if (options.folder) params.append('folder', options.folder);

    const response = await apiClient.get(`${this.baseUrl}/media?${params.toString()}`);
    return response.data;
  }

  async getImages(): Promise<MediaFile[]> {
    const response = await apiClient.get(`${this.baseUrl}/media/images`);
    return response.data;
  }

  async uploadMedia(file: File, metadata: {
    alt_text?: string;
    caption?: string;
    description?: string;
    folder?: string;
  } = {}): Promise<MediaFile> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('original_name', file.name);
    
    if (metadata.alt_text) formData.append('alt_text', metadata.alt_text);
    if (metadata.caption) formData.append('caption', metadata.caption);
    if (metadata.description) formData.append('description', metadata.description);
    if (metadata.folder) formData.append('folder', metadata.folder);

    const response = await apiClient.post(`${this.baseUrl}/media`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async generateAltText(id: string): Promise<{ alt_text: string }> {
    const response = await apiClient.post(`${this.baseUrl}/media/${id}/alt-text`);
    return response.data;
  }

  // SEO Analysis
  async analyzeSEO(id: string, focusKeyword?: string): Promise<SEOAnalysis> {
    const response = await apiClient.post(`${this.baseUrl}/posts/${id}/seo`, {
      focus_keyword: focusKeyword
    });
    return response.data;
  }

  async analyzeContent(content: {
    content: string;
    title: string;
    meta_description: string;
    focus_keyword: string;
  }): Promise<any> {
    const response = await apiClient.post(`${this.baseUrl}/seo/analyze`, content);
    return response.data;
  }

  // Analytics
  async getPostAnalytics(id: string): Promise<any[]> {
    const response = await apiClient.get(`${this.baseUrl}/posts/${id}/analytics`);
    return response.data;
  }

  // Comments
  async getComments(postId: string): Promise<BlogComment[]> {
    const response = await apiClient.get(`${this.baseUrl}/comments?post=${postId}`);
    return response.data.results || response.data;
  }

  async createComment(postId: string, content: string, parentId?: string): Promise<BlogComment> {
    const response = await apiClient.post(`${this.baseUrl}/comments`, {
      post: postId,
      content,
      parent: parentId
    });
    return response.data;
  }

  async replyToComment(commentId: string, content: string): Promise<BlogComment> {
    const response = await apiClient.post(`${this.baseUrl}/comments/${commentId}/reply`, {
      content
    });
    return response.data;
  }
}

export const blogService = new BlogService();