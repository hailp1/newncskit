'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface RevenueMetrics {
  totalRevenue: number;
  monthlyRevenue: number;
  totalCampaigns: number;
  activeCampaigns: number;
  averageFeePerCampaign: number;
  topCampaignsByRevenue: Array<{
    id: string;
    title: string;
    revenue: number;
    participants: number;
  }>;
}

interface CampaignRevenueDetail {
  id: string;
  title: string;
  status: string;
  totalParticipants: number;
  completedResponses: number;
  tokenRewardPerParticipant: number;
  totalTokensAwarded: number;
  adminFeeCollected: number;
  createdAt: string;
  launchedAt?: string;
  completedAt?: string;
}

interface AuditLogEntry {
  id: string;
  action: string;
  campaignId: string;
  campaignTitle: string;
  amount: number;
  timestamp: string;
  details: string;
}

interface FinancialSummary {
  totalTokensDistributed: number;
  totalFeesCollected: number;
  averageParticipationRate: number;
  revenueGrowthRate: number;
  topPerformingCampaigns: number;
}

interface RevenueManagerProps {
  className?: string;
}

export default function RevenueManager({ className = '' }: RevenueManagerProps) {
  const [metrics, setMetrics] = useState<RevenueMetrics | null>(null);
  const [campaignDetails, setCampaignDetails] = useState<CampaignRevenueDetail[]>([]);
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [auditLoading, setAuditLoading] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [showDetails, setShowDetails] = useState(false);
  const [showAuditLog, setShowAuditLog] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'campaigns' | 'audit' | 'analytics'>('overview');

  useEffect(() => {
    loadRevenueMetrics();
    loadFinancialSummary();
  }, [selectedTimeRange]);

  const loadRevenueMetrics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/revenue-metrics?timeRange=${selectedTimeRange}`);
      if (response.ok) {
        const data = await response.json();
        setMetrics(data);
      } else {
        console.error('Failed to load revenue metrics');
      }
    } catch (error) {
      console.error('Error loading revenue metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFinancialSummary = async () => {
    try {
      const response = await fetch(`/api/admin/financial-summary?timeRange=${selectedTimeRange}`);
      if (response.ok) {
        const data = await response.json();
        setFinancialSummary(data);
      } else {
        console.error('Failed to load financial summary');
      }
    } catch (error) {
      console.error('Error loading financial summary:', error);
    }
  };

  const loadCampaignDetails = async () => {
    try {
      setDetailsLoading(true);
      const response = await fetch(`/api/admin/campaign-revenue-details?timeRange=${selectedTimeRange}`);
      if (response.ok) {
        const data = await response.json();
        setCampaignDetails(data);
        setActiveTab('campaigns');
      } else {
        console.error('Failed to load campaign details');
      }
    } catch (error) {
      console.error('Error loading campaign details:', error);
    } finally {
      setDetailsLoading(false);
    }
  };

  const loadAuditLog = async () => {
    try {
      setAuditLoading(true);
      const response = await fetch(`/api/admin/revenue-audit-log?timeRange=${selectedTimeRange}`);
      if (response.ok) {
        const data = await response.json();
        setAuditLog(data);
        setActiveTab('audit');
      } else {
        console.error('Failed to load audit log');
      }
    } catch (error) {
      console.error('Error loading audit log:', error);
    } finally {
      setAuditLoading(false);
    }
  };

  const exportRevenueReport = async (format: 'csv' | 'excel' = 'csv') => {
    try {
      const response = await fetch(`/api/admin/export-revenue-report?format=${format}&timeRange=${selectedTimeRange}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `revenue-report-${selectedTimeRange}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        console.error('Failed to export revenue report');
        alert('Failed to export revenue report');
      }
    } catch (error) {
      console.error('Error exporting revenue report:', error);
      alert('Error exporting revenue report');
    }
  };

  const formatCurrency = (amount: number): string => {
    return `${amount.toLocaleString()} tokens`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status: string): string => {
    const colors = {
      'draft': 'text-gray-600 bg-gray-100',
      'active': 'text-green-600 bg-green-100',
      'paused': 'text-yellow-600 bg-yellow-100',
      'completed': 'text-blue-600 bg-blue-100',
      'cancelled': 'text-red-600 bg-red-100'
    };
    return colors[status as keyof typeof colors] || 'text-gray-600 bg-gray-100';
  };

  if (loading) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Revenue Overview', icon: '📊' },
            { id: 'campaigns', label: 'Campaign Details', icon: '📋' },
            { id: 'audit', label: 'Audit Log', icon: '🔍' },
            { id: 'analytics', label: 'Financial Analytics', icon: '📈' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Revenue Overview Tab */}
      {activeTab === 'overview' && (
        <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Revenue Analytics</h2>
          
          {/* Time Range Selector */}
          <div className="flex space-x-2">
            {(['7d', '30d', '90d', '1y'] as const).map((range) => (
              <Button
                key={range}
                variant={selectedTimeRange === range ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedTimeRange(range)}
              >
                {range === '7d' && 'Last 7 Days'}
                {range === '30d' && 'Last 30 Days'}
                {range === '90d' && 'Last 90 Days'}
                {range === '1y' && 'Last Year'}
              </Button>
            ))}
          </div>
        </div>

        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="p-2 bg-green-200 rounded-lg">
                  <svg className="w-6 h-6 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-green-700">Total Revenue</p>
                  <p className="text-2xl font-bold text-green-900">{formatCurrency(metrics.totalRevenue)}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="p-2 bg-blue-200 rounded-lg">
                  <svg className="w-6 h-6 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-blue-700">Period Revenue</p>
                  <p className="text-2xl font-bold text-blue-900">{formatCurrency(metrics.monthlyRevenue)}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="p-2 bg-purple-200 rounded-lg">
                  <svg className="w-6 h-6 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-purple-700">Total Campaigns</p>
                  <p className="text-2xl font-bold text-purple-900">{metrics.totalCampaigns}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="p-2 bg-orange-200 rounded-lg">
                  <svg className="w-6 h-6 text-orange-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-orange-700">Avg Revenue/Campaign</p>
                  <p className="text-2xl font-bold text-orange-900">{formatCurrency(Math.round(metrics.averageFeePerCampaign))}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-200">
          <div className="flex space-x-3">
            <Button
              onClick={loadCampaignDetails}
              disabled={detailsLoading}
              variant="outline"
            >
              {detailsLoading ? 'Loading...' : 'View Campaign Details'}
            </Button>
            
            <Button
              onClick={loadAuditLog}
              disabled={auditLoading}
              variant="outline"
            >
              {auditLoading ? 'Loading...' : 'View Audit Log'}
            </Button>
            
            <Button
              onClick={() => exportRevenueReport('csv')}
              variant="outline"
            >
              Export CSV
            </Button>
            
            <Button
              onClick={() => exportRevenueReport('excel')}
              variant="outline"
            >
              Export Excel
            </Button>
          </div>

          <Button
            onClick={loadRevenueMetrics}
            disabled={loading}
            variant="outline"
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
        </Card>
      )}

      {/* Financial Analytics Tab */}
      {activeTab === 'analytics' && financialSummary && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Financial Analytics</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 border border-indigo-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="p-2 bg-indigo-200 rounded-lg">
                  <svg className="w-6 h-6 text-indigo-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-indigo-700">Revenue Growth Rate</p>
                  <p className="text-2xl font-bold text-indigo-900">{financialSummary.revenueGrowthRate.toFixed(1)}%</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-teal-50 to-teal-100 border border-teal-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="p-2 bg-teal-200 rounded-lg">
                  <svg className="w-6 h-6 text-teal-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-teal-700">Avg Participation Rate</p>
                  <p className="text-2xl font-bold text-teal-900">{financialSummary.averageParticipationRate.toFixed(1)}%</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-rose-50 to-rose-100 border border-rose-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="p-2 bg-rose-200 rounded-lg">
                  <svg className="w-6 h-6 text-rose-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-rose-700">Total Tokens Distributed</p>
                  <p className="text-2xl font-bold text-rose-900">{formatCurrency(financialSummary.totalTokensDistributed)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Revenue vs Distribution Chart Placeholder */}
          <div className="mt-8 p-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <div className="text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Revenue Analytics Chart</h3>
              <p className="mt-1 text-sm text-gray-500">
                Revenue vs Token Distribution trends over time
              </p>
              <p className="mt-2 text-xs text-gray-400">
                Chart visualization would be implemented here with a charting library
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Top Campaigns by Revenue */}
      {metrics?.topCampaignsByRevenue && metrics.topCampaignsByRevenue.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Revenue Generating Campaigns</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Campaign
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Participants
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revenue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revenue/Participant
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {metrics.topCampaignsByRevenue.map((campaign, index) => (
                  <tr key={campaign.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{campaign.title}</div>
                      <div className="text-sm text-gray-500">ID: {campaign.id.substring(0, 8)}...</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {campaign.participants.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                      {formatCurrency(campaign.revenue)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {campaign.participants > 0 ? formatCurrency(Math.round(campaign.revenue / campaign.participants)) : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Campaign Details Tab */}
      {activeTab === 'campaigns' && (
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Campaign Revenue Details</h3>
            <div className="flex space-x-2">
              <Button
                onClick={() => exportRevenueReport('csv')}
                variant="outline"
                size="sm"
              >
                Export CSV
              </Button>
              <Button
                onClick={loadCampaignDetails}
                disabled={detailsLoading}
                variant="outline"
                size="sm"
              >
                {detailsLoading ? 'Refreshing...' : 'Refresh'}
              </Button>
            </div>
          </div>
          
          {detailsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Campaign
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Participants
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Completion Rate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tokens Awarded
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Admin Fee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ROI
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {campaignDetails.map((campaign, index) => {
                    const completionRate = campaign.totalParticipants > 0 
                      ? (campaign.completedResponses / campaign.totalParticipants * 100) 
                      : 0;
                    const roi = campaign.totalTokensAwarded > 0 
                      ? (campaign.adminFeeCollected / campaign.totalTokensAwarded * 100) 
                      : 0;
                    
                    return (
                      <tr key={campaign.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{campaign.title}</div>
                          <div className="text-sm text-gray-500">ID: {campaign.id.substring(0, 8)}...</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(campaign.status)}`}>
                            {campaign.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {campaign.completedResponses} / {campaign.totalParticipants}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${Math.min(completionRate, 100)}%` }}
                              ></div>
                            </div>
                            <span className="text-xs">{completionRate.toFixed(1)}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(campaign.totalTokensAwarded)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                          {formatCurrency(campaign.adminFeeCollected)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className={roi > 10 ? 'text-green-600 font-medium' : roi > 5 ? 'text-yellow-600' : 'text-red-600'}>
                            {roi.toFixed(1)}%
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(campaign.createdAt)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* Audit Log Tab */}
      {activeTab === 'audit' && (
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Revenue Audit Log</h3>
            <div className="flex space-x-2">
              <Button
                onClick={() => exportRevenueReport('csv')}
                variant="outline"
                size="sm"
              >
                Export Audit Log
              </Button>
              <Button
                onClick={loadAuditLog}
                disabled={auditLoading}
                variant="outline"
                size="sm"
              >
                {auditLoading ? 'Refreshing...' : 'Refresh'}
              </Button>
            </div>
          </div>
          
          {auditLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Timestamp
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Campaign
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Details
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {auditLog.map((entry, index) => (
                    <tr key={entry.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(entry.timestamp)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          entry.action.includes('fee_collected') ? 'text-green-600 bg-green-100' :
                          entry.action.includes('token_awarded') ? 'text-blue-600 bg-blue-100' :
                          'text-gray-600 bg-gray-100'
                        }`}>
                          {entry.action.replace(/_/g, ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{entry.campaignTitle}</div>
                        <div className="text-sm text-gray-500">ID: {entry.campaignId.substring(0, 8)}...</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(entry.amount)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                        {entry.details}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {auditLog.length === 0 && (
                <div className="text-center py-8">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No audit entries</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    No revenue audit entries found for the selected time period.
                  </p>
                </div>
              )}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}