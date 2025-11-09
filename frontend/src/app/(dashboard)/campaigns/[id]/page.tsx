'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BarChart3, Users, Settings, Play, Pause, Square } from 'lucide-react';
import CampaignAnalyticsDashboard from '@/components/campaigns/campaign-analytics-dashboard';

/**
 * Campaign Details Page
 */
export default function CampaignDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params.id as string;
  
  const [campaign, setCampaign] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    // Mock campaign data
    const mockCampaign = {
      id: campaignId,
      title: 'Customer Satisfaction Survey',
      description: 'Quarterly customer satisfaction and feedback collection',
      status: 'active',
      targetParticipants: 500,
      currentParticipants: 234,
      completedResponses: 189,
      tokenReward: 10,
      createdAt: new Date('2024-01-01'),
      launchedAt: new Date('2024-01-05'),
      duration: 30
    };

    setTimeout(() => {
      setCampaign(mockCampaign);
      setIsLoading(false);
    }, 500);
  }, [campaignId]);

  const handleBack = () => {
    router.push('/campaigns');
  };

  const handleStatusChange = (newStatus: string) => {
    setCampaign(prev => ({ ...prev, status: newStatus }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="bg-white p-6 rounded-lg shadow mb-6">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Campaign Not Found</h2>
          <p className="text-gray-600 mb-4">The campaign you're looking for doesn't exist.</p>
          <Button onClick={handleBack}>Back to Campaigns</Button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              onClick={handleBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Campaigns
            </Button>
          </div>
          
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">{campaign.title}</h1>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                  {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                </span>
              </div>
              <p className="text-gray-600">{campaign.description}</p>
              
              {/* Stats */}
              <div className="flex gap-6 mt-4">
                <div>
                  <div className="text-sm text-gray-500">Participants</div>
                  <div className="text-lg font-semibold">
                    {campaign.currentParticipants} / {campaign.targetParticipants}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Completed</div>
                  <div className="text-lg font-semibold">{campaign.completedResponses}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Reward</div>
                  <div className="text-lg font-semibold">{campaign.tokenReward} tokens</div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="outline" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'participants', label: 'Participants', icon: Users },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'analytics' && (
          <CampaignAnalyticsDashboard campaignId={campaignId} />
        )}
        
        {activeTab === 'overview' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Campaign Overview</h3>
            <p className="text-gray-600">Overview content coming soon...</p>
          </div>
        )}
        
        {activeTab === 'participants' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Participants</h3>
            <p className="text-gray-600">Participant management coming soon...</p>
          </div>
        )}
      </div>
    </div>
  );
}
