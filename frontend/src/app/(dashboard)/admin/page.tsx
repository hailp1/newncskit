'use client';

import { useAuthStore } from '@/store/auth';
import EnhancedAdminDashboard from '@/components/admin/enhanced-admin-dashboard';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ShieldCheckIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';



export default function AdminDashboard() {
  const { user, isAuthenticated } = useAuthStore();

  // Check if user has admin privileges
  const isAdmin = user?.is_staff || 
                  user?.is_superuser || 
                  (user?.role && ['super_admin', 'admin', 'moderator'].includes(user.role)) ||
                  user?.email === 'admin@ncskit.com' || 
                  user?.email === 'admin@ncskit.org';

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center py-12">
        <Card className="p-8 max-w-md mx-auto text-center">
          <ExclamationTriangleIcon className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-4">Please log in to access the admin panel.</p>
          <Link href="/login">
            <Button>Go to Login</Button>
          </Link>
        </Card>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center py-12">
        <Card className="p-8 max-w-md mx-auto text-center">
          <ShieldCheckIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">You don't have permission to access the admin panel.</p>
          <Link href="/dashboard">
            <Button>Back to Dashboard</Button>
          </Link>
        </Card>
      </div>
    );
  }

  // Use the enhanced admin dashboard
  return <EnhancedAdminDashboard user={user} />;
}