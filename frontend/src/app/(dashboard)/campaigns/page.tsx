'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import EnhancedCampaignDashboard from '@/components/campaigns/enhanced-campaign-dashboard';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

/**
 * Campaigns Dashboard Page
 * 
 * Main page for campaign management - lists all campaigns
 * and provides access to creation, analytics, and management.
 */
export default function CampaignsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const handleCreateCampaign = () => {
    router.push('/campaigns/create');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white p-6 rounded-lg shadow">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Survey Campaigns</h1>
              <p className="text-gray-600 mt-1">
                Create and manage your survey campaigns
              </p>
            </div>
            <Button onClick={handleCreateCampaign} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Campaign
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <EnhancedCampaignDashboard />
      </div>
    </div>
  );
}
