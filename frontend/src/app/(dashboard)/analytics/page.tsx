'use client';

import React from 'react';
import { ProjectDashboard } from '@/components/analytics/project-management';
import { useAuthStore } from '@/store/auth';

export default function AnalyticsPage() {
  const { user } = useAuthStore();

  return (
    <div className="container mx-auto px-4 py-6">
      {user && <ProjectDashboard userId={user.id} />}
    </div>
  );
}