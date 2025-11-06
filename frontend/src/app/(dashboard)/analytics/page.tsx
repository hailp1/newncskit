'use client';

import React from 'react';
import { ProjectDashboard } from '@/components/analytics/project-management';
import { useAuth } from '@/hooks/use-auth';

export default function AnalyticsPage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <ProjectDashboard userId={user.id} />
    </div>
  );
}