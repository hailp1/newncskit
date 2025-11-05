export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
    bio?: string;
  };
  category: {
    id: string;
    name: string;
    slug: string;
    color: string;
  };
  tags: string[];
  featured_image?: string;
  featured_image_alt?: string;
  status: 'draft' | 'published' | 'archived';
  published_at?: string;
  created_at: string;
  updated_at: string;
  reading_time: number;
  views: number;
  likes: number;
  seo: {
    meta_title?: string;
    meta_description?: string;
    meta_keywords?: string[];
    og_title?: string;
    og_description?: string;
    og_image?: string;
    canonical_url?: string;
  };
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  post_count: number;
}

export interface BlogTag {
  id: string;
  name: string;
  slug: string;
  post_count: number;
}

export interface BlogStats {
  total_posts: number;
  total_views: number;
  total_likes: number;
  popular_posts: BlogPost[];
  recent_posts: BlogPost[];
  categories: BlogCategory[];
  tags: BlogTag[];
}