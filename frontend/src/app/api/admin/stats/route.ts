import { NextResponse } from 'next/server';
import { query } from '@/lib/postgres-server';

export async function GET() {
  try {
    // Get total users
    const usersResult = await query('SELECT COUNT(*) FROM users');
    const totalUsers = parseInt(usersResult.rows[0].count);

    // Get total projects
    const projectsResult = await query('SELECT COUNT(*) FROM projects');
    const totalProjects = parseInt(projectsResult.rows[0].count);

    // Get total posts
    let totalPosts = 0;
    try {
      const postsResult = await query('SELECT COUNT(*) FROM posts');
      totalPosts = parseInt(postsResult.rows[0].count);
    } catch (error) {
      console.warn('Posts table not found, using 0');
    }

    // Get active tokens
    let activeTokens = 0;
    try {
      const tokensResult = await query('SELECT COUNT(*) FROM user_tokens WHERE transaction_type = $1', ['earn']);
      activeTokens = parseInt(tokensResult.rows[0].count);
    } catch (error) {
      console.warn('User tokens table not found, using 0');
    }

    // Get recent activity
    let recentActivity: any[] = [];
    try {
      const activityResult = await query(`
        SELECT al.*, u.full_name, u.email 
        FROM admin_logs al
        LEFT JOIN users u ON al.admin_id = u.id
        ORDER BY al.created_at DESC 
        LIMIT 10
      `);
      recentActivity = activityResult.rows || [];
    } catch (error) {
      console.warn('Admin logs table not found, using empty array');
    }

    return NextResponse.json({
      success: true,
      data: {
        totalUsers,
        totalProjects,
        totalPosts,
        activeTokens,
        recentActivity
      }
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}