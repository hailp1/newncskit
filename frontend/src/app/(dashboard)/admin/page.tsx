'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { adminService } from '@/services/admin-client';

interface AdminStats {
  totalUsers: number;
  totalProjects: number;
  totalPosts: number;
  activeTokens: number;
  recentActivity: any[];
}

interface AdminFeeConfig {
  surveyCampaignFeePercentage: number;
  minimumFeeAmount: number;
  maximumFeeAmount: number;
  lastUpdated: string;
  updatedBy: string;
}

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

interface FeeCalculationPreview {
  targetParticipants: number;
  tokenRewardPerParticipant: number;
  totalTokenCost: number;
  adminFee: number;
  totalCost: number;
  estimatedRevenue: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [feeConfig, setFeeConfig] = useState<AdminFeeConfig | null>(null);
  const [revenueMetrics, setRevenueMetrics] = useState<RevenueMetrics | null>(null);
  const [feeConfigLoading, setFeeConfigLoading] = useState(false);
  const [revenueLoading, setRevenueLoading] = useState(false);
  
  // Fee configuration form state
  const [newFeePercentage, setNewFeePercentage] = useState<number>(5);
  const [minFeeAmount, setMinFeeAmount] = useState<number>(1);
  const [maxFeeAmount, setMaxFeeAmount] = useState<number>(1000);
  
  // Fee calculation preview state
  const [previewParticipants, setPreviewParticipants] = useState<number>(100);
  const [previewReward, setPreviewReward] = useState<number>(10);
  const [calculationPreview, setCalculationPreview] = useState<FeeCalculationPreview | null>(null);

  useEffect(() => {
    loadStats();
    loadFeeConfig();
    loadRevenueMetrics();
  }, []);

  useEffect(() => {
    if (feeConfig) {
      setNewFeePercentage(feeConfig.surveyCampaignFeePercentage);
      setMinFeeAmount(feeConfig.minimumFeeAmount);
      setMaxFeeAmount(feeConfig.maximumFeeAmount);
    }
  }, [feeConfig]);

  useEffect(() => {
    updateCalculationPreview();
  }, [previewParticipants, previewReward, newFeePercentage, minFeeAmount, maxFeeAmount]);

  const loadStats = async () => {
    try {
      const data = await adminService.getStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load admin stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFeeConfig = async () => {
    try {
      setFeeConfigLoading(true);
      const response = await fetch('/api/admin/fee-config');
      if (response.ok) {
        const data = await response.json();
        setFeeConfig(data);
      } else {
        // Set default values if no config exists
        setFeeConfig({
          surveyCampaignFeePercentage: 5,
          minimumFeeAmount: 1,
          maximumFeeAmount: 1000,
          lastUpdated: new Date().toISOString(),
          updatedBy: 'system'
        });
      }
    } catch (error) {
      console.error('Failed to load fee config:', error);
      // Set default values on error
      setFeeConfig({
        surveyCampaignFeePercentage: 5,
        minimumFeeAmount: 1,
        maximumFeeAmount: 1000,
        lastUpdated: new Date().toISOString(),
        updatedBy: 'system'
      });
    } finally {
      setFeeConfigLoading(false);
    }
  };

  const loadRevenueMetrics = async () => {
    try {
      setRevenueLoading(true);
      const response = await fetch('/api/admin/revenue-metrics');
      if (response.ok) {
        const data = await response.json();
        setRevenueMetrics(data);
      } else {
        // Set default values if no metrics exist
        setRevenueMetrics({
          totalRevenue: 0,
          monthlyRevenue: 0,
          totalCampaigns: 0,
          activeCampaigns: 0,
          averageFeePerCampaign: 0,
          topCampaignsByRevenue: []
        });
      }
    } catch (error) {
      console.error('Failed to load revenue metrics:', error);
      // Set default values on error
      setRevenueMetrics({
        totalRevenue: 0,
        monthlyRevenue: 0,
        totalCampaigns: 0,
        activeCampaigns: 0,
        averageFeePerCampaign: 0,
        topCampaignsByRevenue: []
      });
    } finally {
      setRevenueLoading(false);
    }
  };

  const updateFeeConfig = async () => {
    try {
      setFeeConfigLoading(true);
      const response = await fetch('/api/admin/fee-config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          surveyCampaignFeePercentage: newFeePercentage,
          minimumFeeAmount: minFeeAmount,
          maximumFeeAmount: maxFeeAmount,
        }),
      });

      if (response.ok) {
        const updatedConfig = await response.json();
        setFeeConfig(updatedConfig);
        alert('Fee configuration updated successfully!');
      } else {
        throw new Error('Failed to update fee configuration');
      }
    } catch (error) {
      console.error('Failed to update fee config:', error);
      alert('Failed to update fee configuration. Please try again.');
    } finally {
      setFeeConfigLoading(false);
    }
  };

  const updateCalculationPreview = () => {
    if (previewParticipants > 0 && previewReward >= 0) {
      const totalTokenCost = previewParticipants * previewReward;
      let adminFee = Math.ceil(totalTokenCost * (newFeePercentage / 100));
      
      // Apply min/max fee limits
      adminFee = Math.max(minFeeAmount, Math.min(maxFeeAmount, adminFee));
      
      const totalCost = totalTokenCost + adminFee;

      setCalculationPreview({
        targetParticipants: previewParticipants,
        tokenRewardPerParticipant: previewReward,
        totalTokenCost,
        adminFee,
        totalCost,
        estimatedRevenue: adminFee
      });
    } else {
      setCalculationPreview(null);
    }
  };

  const validateFeeConfig = (): string[] => {
    const errors: string[] = [];
    
    if (newFeePercentage < 0 || newFeePercentage > 50) {
      errors.push('Fee percentage must be between 0% and 50%');
    }
    
    if (minFeeAmount < 0) {
      errors.push('Minimum fee amount cannot be negative');
    }
    
    if (maxFeeAmount < minFeeAmount) {
      errors.push('Maximum fee amount must be greater than minimum fee amount');
    }
    
    return errors;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalUsers || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Projects</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalProjects || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Posts</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalPosts || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Tokens</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.activeTokens || 0}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/admin/users">
            <Button className="w-full justify-start" variant="outline">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
              Manage Users
            </Button>
          </Link>

          <Link href="/admin/projects">
            <Button className="w-full justify-start" variant="outline">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Manage Projects
            </Button>
          </Link>

          <Link href="/admin/posts">
            <Button className="w-full justify-start" variant="outline">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
              Manage Posts
            </Button>
          </Link>

          <Link href="/admin/tokens">
            <Button className="w-full justify-start" variant="outline">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              API Tokens
            </Button>
          </Link>
        </div>
      </Card>

      {/* Survey Campaign Fee Configuration */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Survey Campaign Fee Configuration</h2>
        
        {feeConfigLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Fee Settings Form */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fee Percentage (%)
                </label>
                <Input
                  type="number"
                  min="0"
                  max="50"
                  step="0.1"
                  value={newFeePercentage}
                  onChange={(e) => setNewFeePercentage(parseFloat(e.target.value) || 0)}
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">Percentage of total token cost</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Fee (tokens)
                </label>
                <Input
                  type="number"
                  min="0"
                  value={minFeeAmount}
                  onChange={(e) => setMinFeeAmount(parseInt(e.target.value) || 0)}
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">Minimum fee per campaign</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Fee (tokens)
                </label>
                <Input
                  type="number"
                  min="0"
                  value={maxFeeAmount}
                  onChange={(e) => setMaxFeeAmount(parseInt(e.target.value) || 0)}
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">Maximum fee per campaign</p>
              </div>
            </div>

            {/* Validation Errors */}
            {validateFeeConfig().length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-red-800 mb-2">Configuration Errors:</h4>
                <ul className="text-sm text-red-700 space-y-1">
                  {validateFeeConfig().map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Current Configuration Display */}
            {feeConfig && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Current Configuration:</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Fee Percentage:</span>
                    <p className="font-medium">{feeConfig.surveyCampaignFeePercentage}%</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Min Fee:</span>
                    <p className="font-medium">{feeConfig.minimumFeeAmount} tokens</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Max Fee:</span>
                    <p className="font-medium">{feeConfig.maximumFeeAmount} tokens</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Last Updated:</span>
                    <p className="font-medium">{new Date(feeConfig.lastUpdated).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Update Button */}
            <div className="flex justify-end">
              <Button
                onClick={updateFeeConfig}
                disabled={feeConfigLoading || validateFeeConfig().length > 0}
                className="px-6"
              >
                {feeConfigLoading ? 'Updating...' : 'Update Fee Configuration'}
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Fee Calculation Preview */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Fee Calculation Preview</h2>
        
        <div className="space-y-4">
          {/* Preview Input Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Participants
              </label>
              <Input
                type="number"
                min="1"
                value={previewParticipants}
                onChange={(e) => setPreviewParticipants(parseInt(e.target.value) || 0)}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Token Reward per Participant
              </label>
              <Input
                type="number"
                min="0"
                value={previewReward}
                onChange={(e) => setPreviewReward(parseInt(e.target.value) || 0)}
                className="w-full"
              />
            </div>
          </div>

          {/* Calculation Results */}
          {calculationPreview && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-900 mb-3">Cost Breakdown:</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-blue-700">Total Token Cost:</span>
                  <p className="font-bold text-blue-900">{calculationPreview.totalTokenCost} tokens</p>
                </div>
                <div>
                  <span className="text-blue-700">Admin Fee:</span>
                  <p className="font-bold text-blue-900">{calculationPreview.adminFee} tokens</p>
                </div>
                <div>
                  <span className="text-blue-700">Total Cost:</span>
                  <p className="font-bold text-blue-900">{calculationPreview.totalCost} tokens</p>
                </div>
                <div>
                  <span className="text-blue-700">Revenue:</span>
                  <p className="font-bold text-green-600">{calculationPreview.estimatedRevenue} tokens</p>
                </div>
              </div>
              
              <div className="mt-3 text-xs text-blue-600">
                Fee calculation: {calculationPreview.totalTokenCost} × {newFeePercentage}% = {Math.ceil(calculationPreview.totalTokenCost * (newFeePercentage / 100))} tokens
                {calculationPreview.adminFee !== Math.ceil(calculationPreview.totalTokenCost * (newFeePercentage / 100)) && 
                  ` (adjusted to ${calculationPreview.adminFee} tokens due to min/max limits)`
                }
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Revenue Tracking and Reporting */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue Tracking & Reporting</h2>
        
        {revenueLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        ) : revenueMetrics ? (
          <div className="space-y-6">
            {/* Revenue Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-700">Total Revenue</p>
                    <p className="text-lg font-bold text-green-900">{revenueMetrics.totalRevenue}</p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-blue-700">Monthly Revenue</p>
                    <p className="text-lg font-bold text-blue-900">{revenueMetrics.monthlyRevenue}</p>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-purple-700">Total Campaigns</p>
                    <p className="text-lg font-bold text-purple-900">{revenueMetrics.totalCampaigns}</p>
                  </div>
                </div>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-orange-700">Active Campaigns</p>
                    <p className="text-lg font-bold text-orange-900">{revenueMetrics.activeCampaigns}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-700">Avg Fee/Campaign</p>
                    <p className="text-lg font-bold text-gray-900">{revenueMetrics.averageFeePerCampaign.toFixed(1)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Campaigns by Revenue */}
            {revenueMetrics.topCampaignsByRevenue.length > 0 && (
              <div>
                <h3 className="text-md font-medium text-gray-900 mb-3">Top Campaigns by Revenue</h3>
                <div className="bg-gray-50 rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Campaign
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Participants
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Revenue
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {revenueMetrics.topCampaignsByRevenue.map((campaign, index) => (
                        <tr key={campaign.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            <div className="font-medium">{campaign.title}</div>
                            <div className="text-gray-500 text-xs">ID: {campaign.id}</div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {campaign.participants}
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-green-600">
                            {campaign.revenue} tokens
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Refresh Button */}
            <div className="flex justify-end">
              <Button
                onClick={loadRevenueMetrics}
                variant="outline"
                disabled={revenueLoading}
                className="px-4"
              >
                {revenueLoading ? 'Refreshing...' : 'Refresh Metrics'}
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No revenue data available</p>
        )}
      </Card>

      {/* Recent Activity */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {stats?.recentActivity?.length ? (
            stats.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                  <p className="text-sm text-gray-500">{activity.details}</p>
                </div>
                <div className="text-sm text-gray-400">
                  {new Date(activity.created_at).toLocaleDateString()}
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">No recent activity</p>
          )}
        </div>
      </Card>
    </div>
  );
}