// Admin authentication middleware
// NOTE: This file is deprecated - use Supabase Auth instead
import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export interface AdminUser {
  userId: string;
  email: string;
  role: string;
}

export async function verifyAdminAuth(request: NextRequest): Promise<AdminUser | null> {
  try {
    // Use Supabase Auth instead of JWT
    const supabase = createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return null;
    }

    // Check if user has admin role from user metadata
    const role = user.user_metadata?.role || user.app_metadata?.role;
    
    if (role !== 'admin') {
      return null;
    }

    return {
      userId: user.id,
      email: user.email || '',
      role: role
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