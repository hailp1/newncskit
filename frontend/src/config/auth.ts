/**
 * Authentication Configuration for Supabase Auth
 */

export const authConfig = {
  // Require authentication for dashboard routes
  requireAuth: true,
  
  // Public routes that don't require authentication
  publicRoutes: [
    '/',
    '/auth/login',
    '/auth/register',
    '/auth/callback',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/about',
    '/features',
    '/blog',
    '/contact',
    '/privacy',
    '/terms',
    '/setup-guide',
    '/tutorials',
  ],
  
  // Protected routes that require authentication
  protectedRoutes: [
    '/dashboard',
    '/projects',
    '/editor',
    '/references',
    '/analytics',
    '/journals',
    '/topics',
    '/reviews',
    '/analysis',
    '/blog-admin',
    '/admin',
    '/profile',
    '/settings',
    '/docs',
  ],
  
  // Redirect paths
  redirects: {
    // Where to redirect when auth is required but user is not authenticated
    requireAuth: '/auth/login',
    
    // Where to redirect after successful login
    afterLogin: '/dashboard',
    
    // Where to redirect after successful registration
    afterRegister: '/dashboard',
    
    // Where to redirect after logout
    afterLogout: '/',
  },
  
  // Session configuration (managed by Supabase)
  session: {
    // Supabase handles session persistence automatically
    // JWT expiry: 1 hour (configurable in Supabase dashboard)
    // Refresh token expiry: 30 days (configurable in Supabase dashboard)
    autoRefresh: true,
  },
  
  // OAuth providers configuration (configured in Supabase dashboard)
  oauth: {
    google: {
      enabled: true,
      redirectTo: '/auth/callback',
    },
    linkedin: {
      enabled: true,
      redirectTo: '/auth/callback',
    },
  },
}