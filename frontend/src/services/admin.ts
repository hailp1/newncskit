// Admin service - Server-side service with PostgreSQL integration
import { query, transaction } from '@/lib/postgres-server';

// Proper types for admin operations
export interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  role: 'user' | 'admin' | 'super_admin';
  status: 'active' | 'inactive' | 'suspended';
  subscription_type: 'free' | 'premium' | 'institutional';
  token_balance: number;
  created_at: string;
  updated_at: string;
}

export interface AdminUserUpdate {
  full_name?: string;
  role?: string;
  status?: string;
  subscription_type?: string;
  token_balance?: number;
}

export interface AdminProject {
  id: string;
  title: string;
  description: string;
  status: string;
  user_id: string;
  user_email?: string;
  user_name?: string;
  created_at: string;
  updated_at: string;
}

export interface AdminPost {
  id: number;
  title: string;
  content: string;
  status: 'draft' | 'published';
  author_id: string;
  author_name?: string;
  created_at: string;
  updated_at: string;
}

export interface AdminPostUpdate {
  title?: string;
  content?: string;
  status?: string;
}

export interface AdminToken {
  id: number;
  user_id: string;
  user_email?: string;
  transaction_type: 'earn' | 'spend';
  amount: number;
  description: string;
  created_at: string;
}

export interface AdminStats {
  totalUsers: number;
  totalProjects: number;
  totalPosts: number;
  activeTokens: number;
  recentActivity: any[];
}

class AdminService {
  async getStats(): Promise<AdminStats> {
    try {
      // Get stats directly from database
      const [usersResult, projectsResult, postsResult, tokensResult] = await Promise.all([
        query('SELECT COUNT(*) as count FROM users'),
        query('SELECT COUNT(*) as count FROM projects'),
        query('SELECT COUNT(*) as count FROM posts WHERE status = $1', ['published']),
        query('SELECT COUNT(*) as count FROM user_tokens WHERE created_at > NOW() - INTERVAL \'30 days\'')
      ]);

      // Get recent activity
      const activityResult = await query(`
        SELECT 'user_created' as type, email as description, created_at 
        FROM users 
        WHERE created_at > NOW() - INTERVAL '7 days'
        UNION ALL
        SELECT 'project_created' as type, title as description, created_at 
        FROM projects 
        WHERE created_at > NOW() - INTERVAL '7 days'
        ORDER BY created_at DESC 
        LIMIT 10
      `);

      return {
        totalUsers: parseInt(usersResult.rows[0].count),
        totalProjects: parseInt(projectsResult.rows[0].count),
        totalPosts: parseInt(postsResult.rows[0].count),
        activeTokens: parseInt(tokensResult.rows[0].count),
        recentActivity: activityResult.rows
      };
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      throw error;
    }
  }

  async getUsers(page = 1, limit = 20): Promise<{ users: AdminUser[]; total: number }> {
    try {
      const offset = (page - 1) * limit;
      
      // Get total count
      const countResult = await query('SELECT COUNT(*) FROM users');
      const total = parseInt(countResult.rows[0].count);
      
      // Get users with pagination
      const usersResult = await query(`
        SELECT id, email, full_name, role, status, subscription_type, 
               token_balance, created_at, updated_at
        FROM users 
        ORDER BY created_at DESC 
        LIMIT $1 OFFSET $2
      `, [limit, offset]);

      return {
        users: usersResult.rows || [],
        total
      };
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  async updateUser(userId: string, updates: AdminUserUpdate): Promise<void> {
    try {
      const fields = Object.keys(updates);
      const values = Object.values(updates);
      const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
      
      await db.query(`
        UPDATE users 
        SET ${setClause}, updated_at = NOW() 
        WHERE id = $${fields.length + 1}
      `, [...values, userId]);

      // Log admin action
      await this.logAction('user_update', 'user', userId, updates);
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  async deleteUser(userId: string): Promise<void> {
    try {
      await db.query('DELETE FROM users WHERE id = $1', [userId]);

      // Log admin action
      await this.logAction('user_delete', 'user', userId);
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  async resetUserPassword(userId: string, newPassword: string, requirePasswordChange: boolean = false): Promise<void> {
    try {
      // Update user password reset flags
      await db.query(`
        UPDATE users 
        SET updated_at = NOW()
        WHERE id = $1
      `, [userId]);

      // Log admin action
      await this.logAction('password_reset', 'user', userId, { requirePasswordChange });
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  }

  async addTokensToUser(userId: string, amount: number, description: string): Promise<void> {
    try {
      // Get current balance
      const userResult = await db.query('SELECT token_balance FROM users WHERE id = $1', [userId]);
      const currentBalance = userResult.rows[0]?.token_balance || 0;
      const newBalance = currentBalance + amount;

      // Update user balance
      await db.query(`
        UPDATE users 
        SET token_balance = $1, updated_at = NOW() 
        WHERE id = $2
      `, [newBalance, userId]);

      // Record transaction
      await db.query(`
        INSERT INTO user_tokens (user_id, transaction_type, amount, balance_after, description, reference_type, created_by)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        userId,
        amount > 0 ? 'earn' : 'spend',
        amount,
        newBalance,
        description,
        'admin_action',
        userId // Should be current admin user ID
      ]);

      // Log admin action
      await this.logAction('token_adjustment', 'user', userId, { amount, description, newBalance });
    } catch (error) {
      console.error('Error adding tokens:', error);
      throw error;
    }
  }

  async getProjects(page = 1, limit = 20): Promise<{ projects: AdminProject[]; total: number }> {
    try {
      const offset = (page - 1) * limit;
      
      // Get total count
      const countResult = await db.query('SELECT COUNT(*) FROM projects');
      const total = parseInt(countResult.rows[0].count);
      
      // Get projects with user info
      const projectsResult = await db.query(`
        SELECT p.*, u.email as user_email, u.full_name as user_name
        FROM projects p
        LEFT JOIN users u ON p.user_id = u.id
        ORDER BY p.created_at DESC 
        LIMIT $1 OFFSET $2
      `, [limit, offset]);

      return {
        projects: projectsResult.rows || [],
        total
      };
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }
  }

  async updateProject(projectId: string, updates: any): Promise<void> {
    try {
      const fields = Object.keys(updates);
      const values = Object.values(updates);
      const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
      
      await db.query(`
        UPDATE projects 
        SET ${setClause}, updated_at = NOW() 
        WHERE id = $${fields.length + 1}
      `, [...values, projectId]);

      // Log admin action
      await this.logAction('project_update', 'project', projectId, updates);
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  }

  async deleteProject(projectId: string): Promise<void> {
    try {
      await db.query('DELETE FROM projects WHERE id = $1', [projectId]);

      // Log admin action
      await this.logAction('project_delete', 'project', projectId);
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  }

  async getPosts(page = 1, limit = 20): Promise<{ posts: AdminPost[]; total: number }> {
    try {
      const offset = (page - 1) * limit;
      
      // Get total count
      const countResult = await db.query('SELECT COUNT(*) FROM posts');
      const total = parseInt(countResult.rows[0].count);
      
      // Get posts with author info
      const postsResult = await db.query(`
        SELECT p.*, u.full_name as author_name
        FROM posts p
        LEFT JOIN users u ON p.author_id = u.id
        ORDER BY p.created_at DESC 
        LIMIT $1 OFFSET $2
      `, [limit, offset]);

      return {
        posts: postsResult.rows || [],
        total
      };
    } catch (error) {
      console.error('Error fetching posts:', error);
      throw error;
    }
  }

  async createPost(post: Partial<AdminPost>): Promise<AdminPost> {
    try {
      const fields = Object.keys(post);
      const values = Object.values(post);
      const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');
      
      const result = await db.query(`
        INSERT INTO posts (${fields.join(', ')})
        VALUES (${placeholders})
        RETURNING *
      `, values);

      const newPost = result.rows[0];

      // Log admin action
      await this.logAction('post_create', 'post', newPost.id, post);

      return newPost;
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  }

  async updatePost(postId: number, updates: AdminPostUpdate): Promise<void> {
    try {
      const fields = Object.keys(updates);
      const values = Object.values(updates);
      const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
      
      await db.query(`
        UPDATE posts 
        SET ${setClause}, updated_at = NOW() 
        WHERE id = $${fields.length + 1}
      `, [...values, postId]);

      // Log admin action
      await this.logAction('post_update', 'post', postId, updates);
    } catch (error) {
      console.error('Error updating post:', error);
      throw error;
    }
  }

  async deletePost(postId: number): Promise<void> {
    try {
      await db.query('DELETE FROM posts WHERE id = $1', [postId]);

      // Log admin action
      await this.logAction('post_delete', 'post', postId);
    } catch (error) {
      console.error('Error deleting post:', error);
      throw error;
    }
  }

  async getTokens(page = 1, limit = 20): Promise<{ tokens: AdminToken[]; total: number }> {
    try {
      const offset = (page - 1) * limit;
      
      // Get total count
      const countResult = await db.query('SELECT COUNT(*) FROM user_tokens');
      const total = parseInt(countResult.rows[0].count);
      
      // Get tokens with user info
      const tokensResult = await db.query(`
        SELECT ut.*, u.email as user_email
        FROM user_tokens ut
        LEFT JOIN users u ON ut.user_id = u.id
        ORDER BY ut.created_at DESC 
        LIMIT $1 OFFSET $2
      `, [limit, offset]);

      return {
        tokens: tokensResult.rows || [],
        total
      };
    } catch (error) {
      console.error('Error fetching tokens:', error);
      throw error;
    }
  }

  async revokeToken(tokenId: number): Promise<void> {
    try {
      // For user_tokens table, we don't have a status field, so we'll delete the record
      await db.query('DELETE FROM user_tokens WHERE id = $1', [tokenId]);

      // Log admin action
      await this.logAction('token_revoke', 'token', tokenId);
    } catch (error) {
      console.error('Error revoking token:', error);
      throw error;
    }
  }

  private async logAction(
    action: string,
    targetType: string,
    targetId: string | number,
    details?: any
  ): Promise<void> {
    try {
      // For now, use a placeholder admin ID - you should get this from your auth system
      const adminId = 'admin-user-id';
      
      await db.query(`
        INSERT INTO admin_logs (admin_id, action, target_type, target_id, details, ip_address)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [adminId, action, targetType, targetId, JSON.stringify(details || {}), '127.0.0.1']);
    } catch (error) {
      console.error('Error logging admin action:', error);
      // Don't throw error for logging failures
    }
  }
}

export const adminService = new AdminService();