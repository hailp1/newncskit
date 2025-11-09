'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import CampaignCreationWizard from '@/components/campaigns/campaign-creation-wizard';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Campaign Creation Page
 * 
 * Wizard-based campaign creation with multiple steps
 */
export default function CreateCampaignPage() {
  const router = useRouter();

  const handleBack = () => {
    router.push('/campaigns');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={handleBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Campaigns
            </Button>
            <div className="border-l border-gray-300 pl-4">
              <h1 className="text-2xl font-bold text-gray-900">Create New Campaign</h1>
              <p className="text-gray-600 mt-1">
                Set up your survey campaign with our step-by-step wizard
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CampaignCreationWizard />
      </div>
    </div>
  );
}
