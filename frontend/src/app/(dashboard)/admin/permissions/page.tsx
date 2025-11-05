'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
// Use PostgreSQL database instead of Supabase

interface FeaturePermission {
  id: number;
  feature_name: string;
  feature_name_vi: string;
  description: string;
  description_vi: string;
  category: string;
  is_active: boolean;
}

interface RolePermission {
  id: number;
  role: string;
  feature_id: number;
  feature_name: string;
  feature_name_vi: string;
  is_allowed: boolean;
  token_cost: number;
  daily_limit: number;
  monthly_limit: number;
}

export default function AdminPermissions() {
  const [features, setFeatures] = useState<FeaturePermission[]>([]);
  const [rolePermissions, setRolePermissions] = useState<RolePermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'features' | 'permissions' | 'costs'>('features');
  const [selectedRole, setSelectedRole] = useState<string>('free');

  const roles = [
    { value: 'free', label: 'Free User', color: 'bg-gray-100 text-gray-800' },
    { value: 'premium', label: 'Premium User', color: 'bg-blue-100 text-blue-800' },
    { value: 'institutional', label: 'Institutional User', color: 'bg-purple-100 text-purple-800' },
    { value: 'admin', label: 'Admin', color: 'bg-red-100 text-red-800' }
  ];

  const categories = [
    { value: 'ai', label: 'AI Features', icon: '🤖' },
    { value: 'project', label: 'Project Management', icon: '📁' },
    { value: 'collaboration', label: 'Collaboration', icon: '👥' },
    { value: 'export', label: 'Export', icon: '📤' },
    { value: 'analysis', label: 'Analytics', icon: '📊' },
    { value: 'support', label: 'Support', icon: '🎧' },
    { value: 'integration', label: 'Integration', icon: '🔗' },
    { value: 'customization', label: 'Customization', icon: '🎨' }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([loadFeatures(), loadRolePermissions()]);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFeatures = async () => {
    const { data, error } = await supabase
      .from('feature_permissions')
      .select('*')
      .order('category', { ascending: true });

    if (error) throw error;
    setFeatures(data || []);
  };

  const loadRolePermissions = async () => {
    const { data, error } = await supabase
      .from('user_role_permissions')
      .select(`
        *,
        feature:feature_permissions(feature_name, feature_name_vi, category)
      `)
      .order('role', { ascending: true });

    if (error) throw error;

    const formattedPermissions = data?.map((permission: any) => ({
      ...permission,
      feature_name: permission.feature?.feature_name || '',
      feature_name_vi: permission.feature?.feature_name_vi || ''
    })) || [];

    setRolePermissions(formattedPermissions);
  };

  const updatePermission = async (permissionId: number, updates: any) => {
    try {
      const { error } = await supabase
        .from('user_role_permissions')
        .update(updates)
        .eq('id', permissionId);

      if (error) throw error;
      await loadRolePermissions();
    } catch (error) {
      console.error('Failed to update permission:', error);
      alert('Failed to update permission');
    }
  };

  const toggleFeatureStatus = async (featureId: number, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('feature_permissions')
        .update({ is_active: !isActive })
        .eq('id', featureId);

      if (error) throw error;
      await loadFeatures();
    } catch (error) {
      console.error('Failed to toggle feature:', error);
      alert('Failed to toggle feature');
    }
  };

  const filteredPermissions = rolePermissions.filter(p => p.role === selectedRole);

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
        <h1 className="text-2xl font-bold text-gray-900">Permission Management</h1>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('features')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'features'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Features
          </button>
          <button
            onClick={() => setActiveTab('permissions')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'permissions'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Role Permissions
          </button>
          <button
            onClick={() => setActiveTab('costs')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'costs'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Usage Costs
          </button>
        </nav>
      </div>

      {/* Features Tab */}
      {activeTab === 'features' && (
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">System Features</h3>
            <div className="space-y-4">
              {categories.map(category => {
                const categoryFeatures = features.filter(f => f.category === category.value);
                return (
                  <div key={category.value} className="border rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                      <span className="mr-2">{category.icon}</span>
                      {category.label} ({categoryFeatures.length})
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {categoryFeatures.map(feature => (
                        <div key={feature.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                          <div className="flex-1">
                            <div className="font-medium">{feature.feature_name_vi}</div>
                            <div className="text-sm text-gray-600">{feature.feature_name}</div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              feature.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {feature.is_active ? 'Active' : 'Inactive'}
                            </span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => toggleFeatureStatus(feature.id, feature.is_active)}
                            >
                              {feature.is_active ? 'Disable' : 'Enable'}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      {/* Permissions Tab */}
      {activeTab === 'permissions' && (
        <div className="space-y-6">
          {/* Role Selector */}
          <Card className="p-4">
            <div className="flex items-center space-x-4">
              <span className="font-medium">Select Role:</span>
              {roles.map(role => (
                <button
                  key={role.value}
                  onClick={() => setSelectedRole(role.value)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium ${
                    selectedRole === role.value
                      ? role.color
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {role.label}
                </button>
              ))}
            </div>
          </Card>

          {/* Permissions Table */}
          <Card className="overflow-hidden">
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold">
                Permissions for {roles.find(r => r.value === selectedRole)?.label}
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Feature
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Allowed
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Token Cost
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Daily Limit
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Monthly Limit
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPermissions.map((permission) => (
                    <tr key={permission.id}>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {permission.feature_name_vi}
                          </div>
                          <div className="text-sm text-gray-500">
                            {permission.feature_name}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          permission.is_allowed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {permission.is_allowed ? 'Allowed' : 'Denied'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {permission.token_cost} 🪙
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {permission.daily_limit || 'Unlimited'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {permission.monthly_limit || 'Unlimited'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const newCost = prompt('Enter new token cost:', permission.token_cost.toString());
                            if (newCost !== null) {
                              updatePermission(permission.id, { token_cost: parseInt(newCost) || 0 });
                            }
                          }}
                        >
                          Edit Cost
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Costs Tab */}
      {activeTab === 'costs' && (
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Feature Usage Costs by Role</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Feature</th>
                    <th className="text-center py-2">Free</th>
                    <th className="text-center py-2">Premium</th>
                    <th className="text-center py-2">Institutional</th>
                  </tr>
                </thead>
                <tbody>
                  {features.map(feature => {
                    const freePermission = rolePermissions.find(p => p.feature_id === feature.id && p.role === 'free');
                    const premiumPermission = rolePermissions.find(p => p.feature_id === feature.id && p.role === 'premium');
                    const institutionalPermission = rolePermissions.find(p => p.feature_id === feature.id && p.role === 'institutional');

                    return (
                      <tr key={feature.id} className="border-b">
                        <td className="py-3">
                          <div className="font-medium">{feature.feature_name_vi}</div>
                          <div className="text-sm text-gray-500">{feature.feature_name}</div>
                        </td>
                        <td className="text-center py-3">
                          {freePermission?.is_allowed ? (
                            <span className="text-green-600">{freePermission.token_cost} 🪙</span>
                          ) : (
                            <span className="text-red-600">❌</span>
                          )}
                        </td>
                        <td className="text-center py-3">
                          {premiumPermission?.is_allowed ? (
                            <span className="text-blue-600">{premiumPermission.token_cost} 🪙</span>
                          ) : (
                            <span className="text-red-600">❌</span>
                          )}
                        </td>
                        <td className="text-center py-3">
                          {institutionalPermission?.is_allowed ? (
                            <span className="text-purple-600">{institutionalPermission.token_cost} 🪙</span>
                          ) : (
                            <span className="text-red-600">❌</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}