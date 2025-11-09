'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { permissionService } from '@/services/permission.service';
import { ErrorHandler } from '@/services/error-handler';
import { 
  Permission, 
  UserRole, 
  ROLE_PERMISSIONS, 
  PERMISSION_CATEGORIES,
  PERMISSION_LABELS,
  PERMISSION_DESCRIPTIONS 
} from '@/lib/permissions/constants';

interface PermissionItem {
  permission: Permission;
  label: string;
  description: string;
  category: string;
}

interface RolePermissionData {
  role: UserRole;
  permissions: Permission[];
}

interface AuditLog {
  id: string;
  admin_id: string;
  action: string;
  target_type: string;
  details: any;
  created_at: string;
  admin_name?: string;
}

export default function AdminPermissions() {
  const [permissionItems, setPermissionItems] = useState<PermissionItem[]>([]);
  const [rolePermissions, setRolePermissions] = useState<RolePermissionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'permissions' | 'roles' | 'audit'>('permissions');
  const [selectedRole, setSelectedRole] = useState<UserRole>('user');
  const [editingRole, setEditingRole] = useState<UserRole | null>(null);
  const [editPermissions, setEditPermissions] = useState<Permission[]>([]);
  const [clearingCache, setClearingCache] = useState(false);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loadingAudit, setLoadingAudit] = useState(false);

  const roles: { value: UserRole; label: string; color: string }[] = [
    { value: 'user', label: 'User', color: 'bg-gray-100 text-gray-800' },
    { value: 'moderator', label: 'Moderator', color: 'bg-green-100 text-green-800' },
    { value: 'admin', label: 'Admin', color: 'bg-blue-100 text-blue-800' },
    { value: 'super_admin', label: 'Super Admin', color: 'bg-purple-100 text-purple-800' }
  ];

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (activeTab === 'audit') {
      loadAuditLogs();
    }
  }, [activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load all permissions from constants
      const items: PermissionItem[] = [];
      
      // Group permissions by category
      Object.entries(PERMISSION_CATEGORIES).forEach(([category, permissions]) => {
        permissions.forEach(permission => {
          items.push({
            permission,
            label: PERMISSION_LABELS[permission],
            description: PERMISSION_DESCRIPTIONS[permission],
            category
          });
        });
      });
      
      setPermissionItems(items);
      
      // Load role permissions
      await loadRolePermissions();
      
    } catch (err) {
      const errorMessage = ErrorHandler.handle(err as Error);
      setError(errorMessage.message);
      console.error('Failed to load permissions:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadRolePermissions = async () => {
    try {
      // Load permissions for all roles
      const roleData: RolePermissionData[] = [];
      
      for (const role of roles) {
        const permissions = await permissionService.getRolePermissions(role.value);
        roleData.push({
          role: role.value,
          permissions
        });
      }
      
      setRolePermissions(roleData);
    } catch (err) {
      console.error('Error loading role permissions:', err);
      throw err;
    }
  };

  const togglePermissionForRole = async (role: UserRole, permission: Permission, currentlyHas: boolean) => {
    try {
      setError(null);
      setSuccess(null);
      
      // Get current permissions for role
      const currentPermissions = rolePermissions.find(rp => rp.role === role)?.permissions || [];
      
      // Add or remove permission
      let updatedPermissions: Permission[];
      if (currentlyHas) {
        updatedPermissions = currentPermissions.filter(p => p !== permission);
      } else {
        updatedPermissions = [...currentPermissions, permission];
      }
      
      // Update role permissions
      // Note: This requires admin user ID - in real implementation, get from auth context
      const adminId = 'current-admin-id'; // TODO: Get from auth context
      await permissionService.updateRolePermissions(role, updatedPermissions, adminId);
      
      // Cache is automatically invalidated by the service
      
      // Reload data
      await loadRolePermissions();
      
      setSuccess(`Đã cập nhật quyền và xóa cache thành công`);
      setTimeout(() => setSuccess(null), 3000);
      
    } catch (err) {
      const errorMessage = ErrorHandler.handle(err as Error);
      setError(errorMessage.message);
      console.error('Failed to update permission:', err);
    }
  };

  const selectedRoleData = rolePermissions.find(rp => rp.role === selectedRole);
  const selectedRolePermissions = selectedRoleData?.permissions || [];

  const openBulkEditor = (role: UserRole) => {
    const roleData = rolePermissions.find(rp => rp.role === role);
    setEditingRole(role);
    setEditPermissions(roleData?.permissions || []);
  };

  const closeBulkEditor = () => {
    setEditingRole(null);
    setEditPermissions([]);
  };

  const togglePermissionInEditor = (permission: Permission) => {
    if (editPermissions.includes(permission)) {
      setEditPermissions(editPermissions.filter(p => p !== permission));
    } else {
      setEditPermissions([...editPermissions, permission]);
    }
  };

  const saveBulkPermissions = async () => {
    if (!editingRole) return;
    
    try {
      setError(null);
      setSuccess(null);
      
      // Update role permissions
      const adminId = 'current-admin-id'; // TODO: Get from auth context
      await permissionService.updateRolePermissions(editingRole, editPermissions, adminId);
      
      // Cache is automatically invalidated by the service
      
      // Reload data
      await loadRolePermissions();
      
      setSuccess(`Đã cập nhật ${editPermissions.length} quyền cho vai trò ${roles.find(r => r.value === editingRole)?.label} và xóa cache`);
      setTimeout(() => setSuccess(null), 3000);
      
      closeBulkEditor();
      
    } catch (err) {
      const errorMessage = ErrorHandler.handle(err as Error);
      setError(errorMessage.message);
      console.error('Failed to save permissions:', err);
    }
  };

  const selectAllInCategory = (category: string) => {
    const categoryPermissions = PERMISSION_CATEGORIES[category as keyof typeof PERMISSION_CATEGORIES];
    const allSelected = categoryPermissions.every(p => editPermissions.includes(p));
    
    if (allSelected) {
      // Deselect all in category
      setEditPermissions(editPermissions.filter(p => !categoryPermissions.includes(p)));
    } else {
      // Select all in category
      const newPermissions = [...editPermissions];
      categoryPermissions.forEach(p => {
        if (!newPermissions.includes(p)) {
          newPermissions.push(p);
        }
      });
      setEditPermissions(newPermissions);
    }
  };

  const clearAllCaches = async () => {
    try {
      setClearingCache(true);
      setError(null);
      
      // Clear cache for all roles
      for (const role of roles) {
        const cacheKey = `role:${role.value}`;
        permissionService.invalidateCache(cacheKey);
      }
      
      // Reload data to refresh from database
      await loadRolePermissions();
      
      setSuccess('Đã xóa cache và làm mới dữ liệu thành công');
      setTimeout(() => setSuccess(null), 3000);
      
    } catch (err) {
      const errorMessage = ErrorHandler.handle(err as Error);
      setError(errorMessage.message);
      console.error('Failed to clear cache:', err);
    } finally {
      setClearingCache(false);
    }
  };

  const loadAuditLogs = async () => {
    try {
      setLoadingAudit(true);
      
      // Load recent permission-related audit logs from database
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from('admin_logs')
        .select(`
          id,
          admin_id,
          action,
          target_type,
          details,
          created_at,
          admin:profiles!admin_logs_admin_id_fkey(full_name)
        `)
        .eq('target_type', 'permission')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) {
        console.error('Failed to load audit logs:', error);
        return;
      }
      
      const formattedLogs: AuditLog[] = (data || []).map((log: any) => ({
        id: log.id,
        admin_id: log.admin_id,
        action: log.action,
        target_type: log.target_type,
        details: log.details,
        created_at: log.created_at,
        admin_name: log.admin?.full_name || 'Unknown Admin'
      }));
      
      setAuditLogs(formattedLogs);
      
    } catch (err) {
      console.error('Error loading audit logs:', err);
    } finally {
      setLoadingAudit(false);
    }
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
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Phân quyền</h1>
          <p className="text-sm text-gray-600 mt-1">Quản lý quyền hạn cho từng vai trò người dùng</p>
        </div>
        <Button
          onClick={clearAllCaches}
          variant="outline"
          disabled={clearingCache || loading}
        >
          {clearingCache ? (
            <>
              <span className="animate-spin mr-2">⟳</span>
              Đang xóa cache...
            </>
          ) : (
            <>
              🔄 Xóa Cache
            </>
          )}
        </Button>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('permissions')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'permissions'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Quyền theo Vai trò
          </button>
          <button
            onClick={() => setActiveTab('roles')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'roles'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Ma trận Quyền
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'audit'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Nhật ký Thay đổi
          </button>
        </nav>
      </div>



      {/* Permissions by Role Tab */}
      {activeTab === 'permissions' && (
        <div className="space-y-6">
          {/* Role Selector */}
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="font-medium">Chọn vai trò:</span>
                {roles.map(role => (
                  <button
                    key={role.value}
                    onClick={() => setSelectedRole(role.value)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedRole === role.value
                        ? role.color
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {role.label}
                  </button>
                ))}
              </div>
              <Button
                onClick={() => openBulkEditor(selectedRole)}
                variant="outline"
                size="sm"
              >
                ✏️ Chỉnh sửa hàng loạt
              </Button>
            </div>
          </Card>

          {/* Permissions by Category */}
          <div className="space-y-4">
            {Object.entries(PERMISSION_CATEGORIES).map(([category, permissions]) => (
              <Card key={category} className="overflow-hidden">
                <div className="p-4 border-b bg-gray-50">
                  <h3 className="text-lg font-semibold text-gray-900">{category}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {permissions.length} quyền
                  </p>
                </div>
                <div className="p-4">
                  <div className="space-y-3">
                    {permissions.map(permission => {
                      const hasPermission = selectedRolePermissions.includes(permission);
                      return (
                        <div key={permission} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">
                              {PERMISSION_LABELS[permission]}
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              {PERMISSION_DESCRIPTIONS[permission]}
                            </div>
                            <div className="text-xs text-gray-500 mt-1 font-mono">
                              {permission}
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                              hasPermission ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                            }`}>
                              {hasPermission ? '✓ Có quyền' : '✗ Không có'}
                            </span>
                            <Button
                              size="sm"
                              variant={hasPermission ? "outline" : "default"}
                              onClick={() => togglePermissionForRole(selectedRole, permission, hasPermission)}
                              disabled={loading}
                            >
                              {hasPermission ? 'Thu hồi' : 'Cấp quyền'}
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Permission Matrix Tab */}
      {activeTab === 'roles' && (
        <div className="space-y-6">
          <Card className="overflow-hidden">
            <div className="p-4 border-b bg-gray-50">
              <h3 className="text-lg font-semibold">Ma trận Phân quyền</h3>
              <p className="text-sm text-gray-600 mt-1">
                Xem tổng quan quyền hạn của tất cả vai trò
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50">
                      Quyền
                    </th>
                    {roles.map(role => (
                      <th key={role.value} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {role.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Object.entries(PERMISSION_CATEGORIES).map(([category, permissions]) => (
                    <>
                      <tr key={`category-${category}`} className="bg-gray-100">
                        <td colSpan={roles.length + 1} className="px-6 py-2 text-sm font-semibold text-gray-700">
                          {category}
                        </td>
                      </tr>
                      {permissions.map(permission => (
                        <tr key={permission} className="hover:bg-gray-50">
                          <td className="px-6 py-4 sticky left-0 bg-white">
                            <div className="text-sm font-medium text-gray-900">
                              {PERMISSION_LABELS[permission]}
                            </div>
                            <div className="text-xs text-gray-500 font-mono mt-1">
                              {permission}
                            </div>
                          </td>
                          {roles.map(role => {
                            const roleData = rolePermissions.find(rp => rp.role === role.value);
                            const hasPermission = roleData?.permissions.includes(permission);
                            return (
                              <td key={`${permission}-${role.value}`} className="px-6 py-4 text-center">
                                {hasPermission ? (
                                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-600">
                                    ✓
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-gray-400">
                                    ✗
                                  </span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
          
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {roles.map(role => {
              const roleData = rolePermissions.find(rp => rp.role === role.value);
              const permissionCount = roleData?.permissions.length || 0;
              const totalPermissions = Object.values(Permission).length;
              const percentage = Math.round((permissionCount / totalPermissions) * 100);
              
              return (
                <Card key={role.value} className="p-4">
                  <div className={`text-sm font-medium mb-2 ${role.color} inline-block px-2 py-1 rounded`}>
                    {role.label}
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {permissionCount}
                  </div>
                  <div className="text-sm text-gray-600">
                    quyền ({percentage}%)
                  </div>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Audit Log Tab */}
      {activeTab === 'audit' && (
        <div className="space-y-6">
          <Card className="overflow-hidden">
            <div className="p-4 border-b bg-gray-50">
              <h3 className="text-lg font-semibold">Nhật ký Thay đổi Phân quyền</h3>
              <p className="text-sm text-gray-600 mt-1">
                Lịch sử các thay đổi về quyền hạn trong hệ thống
              </p>
            </div>
            
            {loadingAudit ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : auditLogs.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p>Chưa có nhật ký thay đổi nào</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {auditLogs.map((log) => {
                  const date = new Date(log.created_at);
                  const actionLabel = log.action === 'update_role_permissions' 
                    ? 'Cập nhật quyền vai trò'
                    : log.action === 'grant_permission'
                    ? 'Cấp quyền'
                    : log.action === 'revoke_permission'
                    ? 'Thu hồi quyền'
                    : log.action;
                  
                  return (
                    <div key={log.id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-900">
                              {log.admin_name}
                            </span>
                            <span className="text-gray-500">•</span>
                            <span className={`px-2 py-1 text-xs font-medium rounded ${
                              log.action === 'update_role_permissions'
                                ? 'bg-blue-100 text-blue-800'
                                : log.action === 'grant_permission'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {actionLabel}
                            </span>
                          </div>
                          
                          <div className="mt-2 text-sm text-gray-600">
                            {log.action === 'update_role_permissions' && log.details?.role && (
                              <div>
                                Đã cập nhật quyền cho vai trò <span className="font-medium">{log.details.role}</span>
                                {log.details.permission_count && (
                                  <span> ({log.details.permission_count} quyền)</span>
                                )}
                              </div>
                            )}
                            {log.action === 'grant_permission' && log.details?.permission && (
                              <div>
                                Đã cấp quyền <span className="font-mono text-xs bg-gray-100 px-1 py-0.5 rounded">{log.details.permission}</span>
                                {log.details.user_id && (
                                  <span> cho người dùng</span>
                                )}
                              </div>
                            )}
                            {log.action === 'revoke_permission' && log.details?.permission && (
                              <div>
                                Đã thu hồi quyền <span className="font-mono text-xs bg-gray-100 px-1 py-0.5 rounded">{log.details.permission}</span>
                              </div>
                            )}
                          </div>
                          
                          {log.details?.permissions && Array.isArray(log.details.permissions) && (
                            <details className="mt-2">
                              <summary className="text-xs text-blue-600 cursor-pointer hover:text-blue-800">
                                Xem chi tiết ({log.details.permissions.length} quyền)
                              </summary>
                              <div className="mt-2 pl-4 border-l-2 border-gray-200">
                                <div className="flex flex-wrap gap-1">
                                  {log.details.permissions.map((perm: string) => (
                                    <span key={perm} className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                                      {perm}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </details>
                          )}
                        </div>
                        
                        <div className="text-right ml-4">
                          <div className="text-sm text-gray-900">
                            {date.toLocaleDateString('vi-VN')}
                          </div>
                          <div className="text-xs text-gray-500">
                            {date.toLocaleTimeString('vi-VN')}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Bulk Permission Editor Modal */}
      {editingRole && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Chỉnh sửa quyền cho {roles.find(r => r.value === editingRole)?.label}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Đã chọn {editPermissions.length} / {Object.values(Permission).length} quyền
                  </p>
                </div>
                <button
                  onClick={closeBulkEditor}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {Object.entries(PERMISSION_CATEGORIES).map(([category, permissions]) => {
                  const allSelected = permissions.every(p => editPermissions.includes(p));
                  const someSelected = permissions.some(p => editPermissions.includes(p));
                  
                  return (
                    <div key={category} className="border rounded-lg overflow-hidden">
                      <div className="bg-gray-50 p-4 border-b flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900">{category}</h3>
                          <p className="text-sm text-gray-600">
                            {permissions.filter(p => editPermissions.includes(p)).length} / {permissions.length} quyền
                          </p>
                        </div>
                        <button
                          onClick={() => selectAllInCategory(category)}
                          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                            allSelected
                              ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                              : someSelected
                              ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {allSelected ? '✓ Bỏ chọn tất cả' : someSelected ? '◐ Chọn tất cả' : 'Chọn tất cả'}
                        </button>
                      </div>
                      <div className="p-4 space-y-2">
                        {permissions.map(permission => {
                          const isSelected = editPermissions.includes(permission);
                          return (
                            <label
                              key={permission}
                              className={`flex items-start p-3 rounded-lg cursor-pointer transition-colors ${
                                isSelected ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50 hover:bg-gray-100'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => togglePermissionInEditor(permission)}
                                className="mt-1 mr-3 h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                              />
                              <div className="flex-1">
                                <div className="font-medium text-gray-900">
                                  {PERMISSION_LABELS[permission]}
                                </div>
                                <div className="text-sm text-gray-600 mt-1">
                                  {PERMISSION_DESCRIPTIONS[permission]}
                                </div>
                                <div className="text-xs text-gray-500 font-mono mt-1">
                                  {permission}
                                </div>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t bg-gray-50 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Tổng cộng: <span className="font-semibold">{editPermissions.length}</span> quyền được chọn
              </div>
              <div className="flex space-x-3">
                <Button
                  onClick={closeBulkEditor}
                  variant="outline"
                >
                  Hủy
                </Button>
                <Button
                  onClick={saveBulkPermissions}
                  disabled={loading}
                >
                  {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}