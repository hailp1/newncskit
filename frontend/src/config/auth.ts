export const authConfig = {
  // Require authentication for dashboard routes
  requireAuth: true,
  
  // Public routes that don't require authentication
  publicRoutes: [
    '/',
    '/login',
    '/register',
    '/about',
    '/features',
    '/auth/callback',
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
  ],
  
  // Redirect paths
  redirects: {
    // Where to redirect when auth is required but user is not authenticated
    requireAuth: '/login',
    
    // Where to redirect after successful login
    afterLogin: '/dashboard',
    
    // Where to redirect after successful registration
    afterRegister: '/dashboard',
    
    // Where to redirect after logout
    afterLogout: '/',
  },
  
  // Session configuration
  session: {
    // How long to persist session in localStorage (in days)
    persistDays: 30,
    
    // Auto refresh session before expiry
    autoRefresh: true,
  },
  
  // OAuth providers configuration
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