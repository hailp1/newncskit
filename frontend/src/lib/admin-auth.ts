// Admin authentication middleware
import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

export interface AdminUser {
  userId: string;
  email: string;
  role: string;
}

export async function verifyAdminAuth(request: NextRequest): Promise<AdminUser | null> {
  try {
    // Get token from cookie or Authorization header
    const token = request.cookies.get('auth-token')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return null;
    }

    // Verify JWT token
    const jwtSecret = process.env.JWT_SECRET;
    
    if (!jwtSecret) {
      throw new Error('JWT_SECRET environment variable is required');
    }

    const decoded = jwt.verify(token, jwtSecret) as any;
    
    // Check if user has admin role
    if (decoded.role !== 'admin') {
      return null;
    }

    return {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role
    };
  } catch (error) {
    console.error('Admin auth verification failed:', error);
    return null;
  }
}

export function createUnauthorizedResponse() {
  return new Response(
    JSON.stringify({ 
      success: false, 
      error: 'Unauthorized. Admin access required.' 
    }),
    { 
      status: 401, 
      headers: { 'Content-Type': 'application/json' } 
    }
  );
}