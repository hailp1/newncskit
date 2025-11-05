// Blog service - Client-side interface that calls API endpoints
import type { BlogPost, BlogCategory, BlogTag, BlogStats } from '@/types/blog';

class BlogService {
  // Get all published posts with pagination
  async getPosts(options: {
    page?: number;
    limit?: number;
    category?: string;
    tag?: string;
    search?: string;
    featured?: boolean;
  } = {}): Promise<{ posts: BlogPost[]; total: number; hasMore: boolean }> {
    try {
      const {
        page = 1,
        limit = 10,
        category,
        tag,
        search,
        featured
      } = options;

      const offset = (page - 1) * limit;
      let whereConditions = ["status = 'published'"];
      let params: any[] = [];
      let paramIndex = 1;

      if (category) {
        whereConditions.push(`category->>'slug' = $${paramIndex}`);
        params.push(category);
        paramIndex++;
      }

      if (tag) {
        whereConditions.push(`$${paramIndex} = ANY(tags)`);
        params.push(tag);
        paramIndex++;
      }

      if (search) {
        whereConditions.push(`(title ILIKE $${paramIndex} OR content ILIKE $${paramIndex} OR excerpt ILIKE $${paramIndex})`);
        params.push(`%${search}%`);
        paramIndex++;
      }

      if (featured) {
        whereConditions.push(`featured_image IS NOT NULL`);
      }

      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

      // Get total count
      const countResult = await db.query(`
        SELECT COUNT(*) FROM posts ${whereClause}
      `, params);
      const total = parseInt(countResult.rows[0].count);

      // Get posts
      const postsResult = await db.query(`
        SELECT * FROM posts 
        ${whereClause}
        ORDER BY published_at DESC, created_at DESC
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `, [...params, limit, offset]);

      const posts = postsResult.rows.map(this.formatPost);
      const hasMore = offset + limit < total;

      return { posts, total, hasMore };
    } catch (error) {
      console.error('Error fetching posts:', error);
      throw error;
    }
  }

  // Get single post by slug
  async getPostBySlug(slug: string): Promise<BlogPost | null> {
    try {
      const result = await db.query(`
        SELECT * FROM posts 
        WHERE slug = $1 AND status = 'published'
      `, [slug]);

      if (!result.rows.length) {
        return null;
      }

      // Increment view count
      await db.query(`
        UPDATE posts 
        SET views = views + 1 
        WHERE slug = $1
      `, [slug]);

      return this.formatPost(result.rows[0]);
    } catch (error) {
      console.error('Error fetching post by slug:', error);
      throw error;
    }
  }

  // Get related posts
  async getRelatedPosts(postId: string, limit: number = 4): Promise<BlogPost[]> {
    try {
      const result = await db.query(`
        SELECT p2.* FROM posts p1
        JOIN posts p2 ON (
          p1.category->>'id' = p2.category->>'id' OR
          p1.tags && p2.tags
        )
        WHERE p1.id = $1 
        AND p2.id != $1 
        AND p2.status = 'published'
        ORDER BY p2.published_at DESC
        LIMIT $2
      `, [postId, limit]);

      return result.rows.map(this.formatPost);
    } catch (error) {
      console.error('Error fetching related posts:', error);
      return [];
    }
  }

  // Get categories
  async getCategories(): Promise<BlogCategory[]> {
    try {
      const result = await db.query(`
        SELECT 
          category->>'id' as id,
          category->>'name' as name,
          category->>'slug' as slug,
          category->>'description' as description,
          category->>'color' as color,
          COUNT(*) as post_count
        FROM posts 
        WHERE status = 'published'
        GROUP BY category->>'id', category->>'name', category->>'slug', category->>'description', category->>'color'
        ORDER BY post_count DESC
      `);

      return result.rows.map(row => ({
        id: row.id,
        name: row.name,
        slug: row.slug,
        description: row.description || '',
        color: row.color || '#3B82F6',
        post_count: parseInt(row.post_count)
      }));
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  }

  // Get tags
  async getTags(): Promise<BlogTag[]> {
    try {
      const result = await db.query(`
        SELECT 
          unnest(tags) as tag_name,
          COUNT(*) as post_count
        FROM posts 
        WHERE status = 'published'
        GROUP BY tag_name
        ORDER BY post_count DESC
        LIMIT 50
      `);

      return result.rows.map(row => ({
        id: row.tag_name.toLowerCase().replace(/\s+/g, '-'),
        name: row.tag_name,
        slug: row.tag_name.toLowerCase().replace(/\s+/g, '-'),
        post_count: parseInt(row.post_count)
      }));
    } catch (error) {
      console.error('Error fetching tags:', error);
      return [];
    }
  }

  // Get blog stats
  async getStats(): Promise<BlogStats> {
    try {
      // Total posts
      const totalResult = await db.query(`
        SELECT COUNT(*) as total_posts, SUM(views) as total_views, SUM(likes) as total_likes
        FROM posts WHERE status = 'published'
      `);

      // Popular posts
      const popularResult = await db.query(`
        SELECT * FROM posts 
        WHERE status = 'published'
        ORDER BY views DESC, likes DESC
        LIMIT 5
      `);

      // Recent posts
      const recentResult = await db.query(`
        SELECT * FROM posts 
        WHERE status = 'published'
        ORDER BY published_at DESC, created_at DESC
        LIMIT 5
      `);

      const categories = await this.getCategories();
      const tags = await this.getTags();

      return {
        total_posts: parseInt(totalResult.rows[0].total_posts) || 0,
        total_views: parseInt(totalResult.rows[0].total_views) || 0,
        total_likes: parseInt(totalResult.rows[0].total_likes) || 0,
        popular_posts: popularResult.rows.map(this.formatPost),
        recent_posts: recentResult.rows.map(this.formatPost),
        categories,
        tags
      };
    } catch (error) {
      console.error('Error fetching blog stats:', error);
      throw error;
    }
  }

  // Like a post
  async likePost(postId: string): Promise<void> {
    try {
      await db.query(`
        UPDATE posts 
        SET likes = likes + 1 
        WHERE id = $1
      `, [postId]);
    } catch (error) {
      console.error('Error liking post:', error);
      throw error;
    }
  }

  // Search posts
  async searchPosts(query: string, limit: number = 10): Promise<BlogPost[]> {
    try {
      const result = await db.query(`
        SELECT *, 
        ts_rank(to_tsvector('english', title || ' ' || content), plainto_tsquery('english', $1)) as rank
        FROM posts 
        WHERE status = 'published'
        AND (
          to_tsvector('english', title || ' ' || content) @@ plainto_tsquery('english', $1)
          OR title ILIKE $2
          OR content ILIKE $2
        )
        ORDER BY rank DESC, published_at DESC
        LIMIT $3
      `, [query, `%${query}%`, limit]);

      return result.rows.map(this.formatPost);
    } catch (error) {
      console.error('Error searching posts:', error);
      return [];
    }
  }

  // Generate sitemap data
  async getSitemapData(): Promise<Array<{ slug: string; updated_at: string }>> {
    try {
      const result = await db.query(`
        SELECT slug, updated_at FROM posts 
        WHERE status = 'published'
        ORDER BY updated_at DESC
      `);

      return result.rows;
    } catch (error) {
      console.error('Error fetching sitemap data:', error);
      return [];
    }
  }

  // Private helper to format post data
  private formatPost(row: any): BlogPost {
    return {
      id: row.id,
      title: row.title,
      slug: row.slug || this.generateSlug(row.title),
      excerpt: row.excerpt || this.generateExcerpt(row.content),
      content: row.content,
      author: {
        id: row.author_id?.toString() || '1',
        name: row.author_name || 'NCSKIT Team',
        avatar: row.author_avatar,
        bio: row.author_bio
      },
      category: row.category || {
        id: 'general',
        name: 'General',
        slug: 'general',
        color: '#3B82F6'
      },
      tags: row.tags || [],
      featured_image: row.featured_image,
      featured_image_alt: row.featured_image_alt,
      status: row.status || 'published',
      published_at: row.published_at || row.created_at,
      created_at: row.created_at,
      updated_at: row.updated_at,
      reading_time: this.calculateReadingTime(row.content),
      views: row.views || 0,
      likes: row.likes || 0,
      seo: {
        meta_title: row.meta_title || row.title,
        meta_description: row.meta_description || this.generateExcerpt(row.content),
        meta_keywords: row.meta_keywords || row.tags,
        og_title: row.og_title || row.title,
        og_description: row.og_description || this.generateExcerpt(row.content),
        og_image: row.og_image || row.featured_image,
        canonical_url: row.canonical_url
      }
    };
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, 'a')
      .replace(/[èéẹẻẽêềếệểễ]/g, 'e')
      .replace(/[ìíịỉĩ]/g, 'i')
      .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, 'o')
      .replace(/[ùúụủũưừứựửữ]/g, 'u')
      .replace(/[ỳýỵỷỹ]/g, 'y')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  private generateExcerpt(content: string, length: number = 160): string {
    const text = content.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    return text.length > length ? text.substring(0, length) + '...' : text;
  }

  private calculateReadingTime(content: string): number {
    const wordsPerMinute = 200;
    const words = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute);
  }
}

export const blogService = new BlogService();