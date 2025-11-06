'use client'

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ReferralReward {
  id: number;
  reward_name: string;
  reward_name_vi: string;
  description: string;
  description_vi: string;
  reward_type: string;
  token_amount: number;
  is_active: boolean;
  created_at: string;
}

interface TaskReward {
  id: number;
  task_name: string;
  task_name_vi: string;
  description: string;
  description_vi: string;
  task_type: string;
  token_reward: number;
  is_active: boolean;
  created_at: string;
}

interface TaskCompletion {
  id: number;
  user_id: string;
  task_id: number;
  user_email: string;
  task_name: string;
  completed_at: string;
  reward_claimed: boolean;
}

export default function AdminRewardsPage() {
  const [referralRewards, setReferralRewards] = useState<ReferralReward[]>([]);
  const [taskRewards, setTaskRewards] = useState<TaskReward[]>([]);
  const [taskCompletions, setTaskCompletions] = useState<TaskCompletion[]>([]);
  const [activeTab, setActiveTab] = useState<'referral' | 'task' | 'completions'>('referral');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    reward_name: '',
    reward_name_vi: '',
    description: '',
    description_vi: '',
    reward_type: 'signup',
    task_type: 'daily_login',
    token_amount: 0,
    is_active: true
  });

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'referral') {
        await loadReferralRewards();
      } else if (activeTab === 'task') {
        await loadTaskRewards();
      } else {
        await loadTaskCompletions();
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadReferralRewards = async () => {
    try {
      // Mock data for now - replace with actual API call
      const mockRewards: ReferralReward[] = [];
      setReferralRewards(mockRewards);
    } catch (error) {
      console.error('Error loading referral rewards:', error);
    }
  };

  const loadTaskRewards = async () => {
    try {
      // Mock data for now - replace with actual API call
      const mockRewards: TaskReward[] = [];
      setTaskRewards(mockRewards);
    } catch (error) {
      console.error('Error loading task rewards:', error);
    }
  };

  const loadTaskCompletions = async () => {
    try {
      // Mock data for now - replace with actual API call
      const mockCompletions: TaskCompletion[] = [];
      setTaskCompletions(mockCompletions);
    } catch (error) {
      console.error('Error loading task completions:', error);
    }
  };

  const createReferralReward = async () => {
    try {
      // Mock create - replace with actual API call
      console.log('Creating referral reward:', formData);
      await loadReferralRewards();
      setShowCreateForm(false);
      resetForm();
    } catch (error) {
      console.error('Failed to create referral reward:', error);
      alert('Failed to create referral reward');
    }
  };

  const createTaskReward = async () => {
    try {
      // Mock create - replace with actual API call
      console.log('Creating task reward:', formData);
      await loadTaskRewards();
      setShowCreateForm(false);
      resetForm();
    } catch (error) {
      console.error('Failed to create task reward:', error);
      alert('Failed to create task reward');
    }
  };

  const toggleItemStatus = async (table: string, id: number, currentStatus: boolean) => {
    try {
      // Mock toggle - replace with actual API call
      console.log('Toggling status:', table, id, !currentStatus);
      await loadData();
    } catch (error) {
      console.error('Failed to toggle status:', error);
      alert('Failed to toggle status');
    }
  };

  const resetForm = () => {
    setFormData({
      reward_name: '',
      reward_name_vi: '',
      description: '',
      description_vi: '',
      reward_type: 'signup',
      task_type: 'daily_login',
      token_amount: 0,
      is_active: true
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Reward Management</h1>
        <Button onClick={() => setShowCreateForm(true)}>
          Create New Reward
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('referral')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'referral'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Referral Rewards
        </button>
        <button
          onClick={() => setActiveTab('task')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'task'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Task Rewards
        </button>
        <button
          onClick={() => setActiveTab('completions')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'completions'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Task Completions
        </button>
      </div>

      {/* Create Form Modal */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              Create New {activeTab === 'referral' ? 'Referral' : 'Task'} Reward
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Reward Name (EN)</label>
                <Input
                  value={formData.reward_name}
                  onChange={(e) => setFormData({ ...formData, reward_name: e.target.value })}
                  placeholder="Enter reward name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Reward Name (VI)</label>
                <Input
                  value={formData.reward_name_vi}
                  onChange={(e) => setFormData({ ...formData, reward_name_vi: e.target.value })}
                  placeholder="Nhập tên phần thưởng"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Description (EN)</label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter description"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description (VI)</label>
                <Input
                  value={formData.description_vi}
                  onChange={(e) => setFormData({ ...formData, description_vi: e.target.value })}
                  placeholder="Nhập mô tả"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Token Amount</label>
                <Input
                  type="number"
                  value={formData.token_amount}
                  onChange={(e) => setFormData({ ...formData, token_amount: parseInt(e.target.value) || 0 })}
                  placeholder="Enter token amount"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  {activeTab === 'referral' ? 'Reward Type' : 'Task Type'}
                </label>
                <select
                  value={activeTab === 'referral' ? formData.reward_type : formData.task_type}
                  onChange={(e) => setFormData({
                    ...formData,
                    [activeTab === 'referral' ? 'reward_type' : 'task_type']: e.target.value
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {activeTab === 'referral' ? (
                    <>
                      <option value="signup">Sign Up</option>
                      <option value="first_survey">First Survey</option>
                      <option value="referral">Referral</option>
                    </>
                  ) : (
                    <>
                      <option value="daily_login">Daily Login</option>
                      <option value="survey_completion">Survey Completion</option>
                      <option value="profile_completion">Profile Completion</option>
                    </>
                  )}
                </select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="rounded border-gray-300"
              />
              <label htmlFor="is_active" className="text-sm font-medium">Active</label>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
              <Button onClick={activeTab === 'referral' ? createReferralReward : createTaskReward}>
                Create Reward
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Content */}
      <Card>
        <CardHeader>
          <CardTitle>
            {activeTab === 'referral' && 'Referral Rewards'}
            {activeTab === 'task' && 'Task Rewards'}
            {activeTab === 'completions' && 'Task Completions'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No data available. This is a mock implementation.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}