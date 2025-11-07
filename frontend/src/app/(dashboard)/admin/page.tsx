'use client';

import { useAuthStore } from '@/store/auth';
import EnhancedAdminDashboard from '@/components/admin/enhanced-admin-dashboard';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ShieldCheckIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';



export default function AdminDashboard() {
  const { user } = useAuthStore();

  // No need for auth checking here since the admin layout handles it with ProtectedRoute
  // The layout ensures user is authenticated and has admin role before rendering this component

  // Use the enhanced admin dashboard
  return <EnhancedAdminDashboard user={user} />;
}