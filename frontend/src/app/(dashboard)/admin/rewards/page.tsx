'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
// Use PostgreSQL database instead of Supabase

interface ReferralReward {
  id: number;
  reward_type: string;
  reward_name: string;
  reward_name_vi: string;
  token_amount: number;
  conditions: any;
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
  requirements: any;
  max_completions: number;
  is_active: boolean;
  created_at: string;
}

interface UserTaskCompletion {
  id: number;
  user_id: string;
  task_id: number;
  user_email: string;
  task_name: string;
  tokens_earned: number;
  completed_at: string;
}

export default function AdminRewards() {
  const [referralRewards, setReferralRewards] = useState<ReferralReward[]>([]);
  const [taskRewards, setTaskRewards] = useState<TaskReward[]>([]);
  const [taskCompletions, setTaskCompletions] = useState<UserTaskCompletion[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'referrals' | 'tasks' | 'completions'>('referrals');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  const [formData, setFormData] = useState({
    reward_name: '',
    reward_name_vi: '',
    token_amount: 0,
    reward_type: 'signup',
    task_type: 'daily',
    description: '',
    description_vi: '',
    max_completions: 1,
    is_active: true
  });

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'referrals') {
        await loadReferralRewards();
      } else if (activeTab === 'tasks') {
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
    const { data, error } = await supabase
      .from('referral_rewards')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    setReferralRewards(data || []);
  };

  const loadTaskRewards = async () => {
    const { data, error } = await supabase
      .from('task_rewards')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    setTaskRewards(data || []);
  };

  const loadTaskCompletions = async () => {
    const { data, error } = await supabase
      .from('user_task_completions')
      .select(`
        *,
        user:users!user_id(email),
        task:task_rewards!task_id(task_name, task_name_vi)
      `)
      .order('completed_at', { ascending: false })
      .limit(100);

    if (error) throw error;

    const formattedCompletions = data?.map((completion: any) => ({
      ...completion,
      user_email: completion.user?.email || '',
      task_name: completion.task?.task_name_vi || completion.task?.task_name || ''
    })) || [];

    setTaskCompletions(formattedCompletions);
  };

  const createReferralReward = async () => {
    try {
      const { error } = await supabase
        .from('referral_rewards')
        .insert([{
          reward_type: formData.reward_type,
          reward_name: formData.reward_name,
          reward_name_vi: formData.reward_name_vi,
          token_amount: formData.token_amount,
          conditions: { action: formData.reward_type },
          is_active: formData.is_active
        }]);

      if (error) throw error;
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
      const { error } = await supabase
        .from('task_rewards')
        .insert([{
          task_name: formData.reward_name,
          task_name_vi: formData.reward_name_vi,
          description: formData.description,
          description_vi: formData.description_vi,
          task_type: formData.task_type,
          token_reward: formData.token_amount,
          requirements: { action: formData.task_type },
          max_completions: formData.max_completions,
          is_active: formData.is_active
        }]);

      if (error) throw error;
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
      const { error } = await supabase
        .from(table)
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;
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
      token_amount: 0,
      reward_type: 'signup',
      task_type: 'daily',
      description: '',
      description_vi: '',
      max_completions: 1,
      is_active: true
    });
    setEditingItem(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Rewards & Tasks Management</h1>
        <Button onClick={() => setShowCreateForm(true)}>
          Create {activeTab === 'referrals' ? 'Referral Reward' : activeTab === 'tasks' ? 'Task Reward' : ''}
        </Button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('referrals')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'referrals'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Referral Rewards
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'tasks'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Task Rewards
          </button>
          <button
            onClick={() => setActiveTab('completions')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'completions'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Task Completions
          </button>
        </nav>
      </div>

      {/* Create/Edit Form */}
      {showCreateForm && activeTab !== 'completions' && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">
            {editingItem ? 'Edit' : 'Create'} {activeTab === 'referrals' ? 'Referral Reward' : 'Task Reward'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name (English)</label>
              <Input
                value={formData.reward_name}
                onChange={(e) => setFormData({ ...formData, reward_name: e.target.value })}
                placeholder="Reward name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name (Vietnamese)</label>
              <Input
                value={formData.reward_name_vi}
                onChange={(e) => setFormData({ ...formData, reward_name_vi: e.target.value })}
                placeholder="Tên phần thưởng"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Token Amount</label>
              <Input
                type="number"
                value={formData.token_amount}
                onChange={(e) => setFormData({ ...formData, token_amount: parseInt(e.target.value) || 0 })}
                placeholder="Token amount"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {activeTab === 'referrals' ? 'Reward Type' : 'Task Type'}
              </label>
              <select
                value={activeTab === 'referrals' ? formData.reward_type : formData.task_type}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  [activeTab === 'referrals' ? 'reward_type' : 'task_type']: e.target.value 
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {activeTab === 'referrals' ? (
                  <>
                    <option value="signup">Signup</option>
                    <option value="first_purchase">First Purchase</option>
                    <option value="monthly_active">Monthly Active</option>
                    <option value="premium_upgrade">Premium Upgrade</option>
                  </>
                ) : (
                  <>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="achievement">Achievement</option>
                  </>
                )}
              </select>
            </div>
            {activeTab === 'tasks' && (
              <>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description (English)</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Task description"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description (Vietnamese)</label>
                  <textarea
                    value={formData.description_vi}
                    onChange={(e) => setFormData({ ...formData, description_vi: e.target.value })}
                    placeholder="Mô tả nhiệm vụ"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Completions</label>
                  <Input
                    type="number"
                    value={formData.max_completions}
                    onChange={(e) => setFormData({ ...formData, max_completions: parseInt(e.target.value) || 1 })}
                    placeholder="Maximum completions"
                  />
                </div>
              </>
            )}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="mr-2"
              />
              <label htmlFor="is_active" className="text-sm font-medium text-gray-700">Active</label>
            </div>
          </div>
          <div className="flex space-x-3 mt-6">
            <Button
              onClick={() => {
                if (activeTab === 'referrals') {
                  createReferralReward();
                } else {
                  createTaskReward();
                }
              }}
            >
              {editingItem ? 'Update' : 'Create'}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateForm(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
          </div>
        </Card>
      )}

      {/* Content based on active tab */}
      {activeTab === 'referrals' && (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reward
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Token Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {referralRewards.map((reward) => (
                  <tr key={reward.id}>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{reward.reward_name_vi}</div>
                        <div className="text-sm text-gray-500">{reward.reward_name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {reward.reward_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {reward.token_amount} 🪙
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        reward.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {reward.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="space-x-2">
                        <Button size="sm" variant="outline">Edit</Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleItemStatus('referral_rewards', reward.id, reward.is_active)}
                          className={reward.is_active ? 'text-red-600' : 'text-green-600'}
                        >
                          {reward.is_active ? 'Disable' : 'Enable'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeTab === 'tasks' && (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Task
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reward
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Max Completions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {taskRewards.map((task) => (
                  <tr key={task.id}>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{task.task_name_vi}</div>
                        <div className="text-sm text-gray-500">{task.task_name}</div>
                        <div className="text-xs text-gray-400 mt-1">{task.description_vi}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        task.task_type === 'daily' ? 'bg-green-100 text-green-800' :
                        task.task_type === 'weekly' ? 'bg-blue-100 text-blue-800' :
                        task.task_type === 'monthly' ? 'bg-purple-100 text-purple-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {task.task_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {task.token_reward} 🪙
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {task.max_completions}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        task.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {task.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="space-x-2">
                        <Button size="sm" variant="outline">Edit</Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleItemStatus('task_rewards', task.id, task.is_active)}
                          className={task.is_active ? 'text-red-600' : 'text-green-600'}
                        >
                          {task.is_active ? 'Disable' : 'Enable'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeTab === 'completions' && (
        <Card className="overflow-hidden">
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold">Recent Task Completions</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Task
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tokens Earned
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Completed At
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {taskCompletions.map((completion) => (
                  <tr key={completion.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {completion.user_email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {completion.task_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                      +{completion.tokens_earned} 🪙
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(completion.completed_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}