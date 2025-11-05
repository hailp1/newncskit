// Use PostgreSQL database instead of Supabase

export interface FeaturePermission {
  feature_name: string;
  is_allowed: boolean;
  token_cost: number;
  daily_limit: number;
  monthly_limit: number;
  usage_today: number;
  usage_this_month: number;
}

export interface PermissionCheckResult {
  allowed: boolean;
  reason?: string;
  cost: number;
  remaining_daily?: number;
  remaining_monthly?: number;
}

class PermissionService {
  async getUserPermissions(userId: string, userRole: string): Promise<FeaturePermission[]> {
    try {
      // Get user role permissions
      const { data: permissions, error } = await supabase
        .from('user_role_permissions')
        .select(`
          *,
          feature:feature_permissions(feature_name, feature_name_vi, category)
        `)
        .eq('role', userRole);

      if (error) throw error;

      // Get user usage for today and this month
      const today = new Date().toISOString().split('T')[0];
      const thisMonth = new Date().toISOString().substring(0, 7);

      const { data: usage, error: usageError } = await supabase
        .from('user_feature_usage')
        .select('feature_id, usage_count, usage_date')
        .eq('user_id', userId)
        .gte('usage_date', thisMonth + '-01');

      if (usageError) throw usageError;

      // Calculate usage
      const usageMap = new Map();
      usage?.forEach((u: any) => {
        const key = u.feature_id;
        if (!usageMap.has(key)) {
          usageMap.set(key, { today: 0, month: 0 });
        }
        
        if (u.usage_date === today) {
          usageMap.get(key).today += u.usage_count;
        }
        usageMap.get(key).month += u.usage_count;
      });

      // Format permissions with usage
      return permissions?.map((p: any) => ({
        feature_name: p.feature?.feature_name || '',
        is_allowed: p.is_allowed,
        token_cost: p.token_cost,
        daily_limit: p.daily_limit,
        monthly_limit: p.monthly_limit,
        usage_today: usageMap.get(p.feature_id)?.today || 0,
        usage_this_month: usageMap.get(p.feature_id)?.month || 0
      })) || [];
    } catch (error) {
      console.error('Error getting user permissions:', error);
      return [];
    }
  }

  async checkFeaturePermission(
    userId: string, 
    userRole: string, 
    featureName: string
  ): Promise<PermissionCheckResult> {
    try {
      // Get feature permission for user role
      const { data: permission, error } = await supabase
        .from('user_role_permissions')
        .select(`
          *,
          feature:feature_permissions!inner(feature_name, is_active)
        `)
        .eq('role', userRole)
        .eq('feature.feature_name', featureName)
        .eq('feature.is_active', true)
        .single();

      if (error || !permission) {
        return {
          allowed: false,
          reason: 'Feature not found or inactive',
          cost: 0
        };
      }

      const perm = permission as any;
      if (!perm.is_allowed) {
        return {
          allowed: false,
          reason: 'Feature not allowed for your subscription plan',
          cost: perm.token_cost
        };
      }

      // Check usage limits
      const today = new Date().toISOString().split('T')[0];
      const thisMonth = new Date().toISOString().substring(0, 7);

      const { data: usage, error: usageError } = await supabase
        .from('user_feature_usage')
        .select('usage_count, usage_date')
        .eq('user_id', userId)
        .eq('feature_id', perm.feature_id)
        .gte('usage_date', thisMonth + '-01');

      if (usageError) throw usageError;

      let usageToday = 0;
      let usageThisMonth = 0;

      usage?.forEach((u: any) => {
        if (u.usage_date === today) {
          usageToday += u.usage_count;
        }
        usageThisMonth += u.usage_count;
      });

      // Check daily limit
      if (perm.daily_limit > 0 && usageToday >= perm.daily_limit) {
        return {
          allowed: false,
          reason: 'Daily usage limit exceeded',
          cost: perm.token_cost,
          remaining_daily: 0
        };
      }

      // Check monthly limit
      if (perm.monthly_limit > 0 && usageThisMonth >= perm.monthly_limit) {
        return {
          allowed: false,
          reason: 'Monthly usage limit exceeded',
          cost: perm.token_cost,
          remaining_monthly: 0
        };
      }

      return {
        allowed: true,
        cost: perm.token_cost,
        remaining_daily: perm.daily_limit > 0 ? perm.daily_limit - usageToday : undefined,
        remaining_monthly: perm.monthly_limit > 0 ? perm.monthly_limit - usageThisMonth : undefined
      };
    } catch (error) {
      console.error('Error checking feature permission:', error);
      return {
        allowed: false,
        reason: 'Error checking permissions',
        cost: 0
      };
    }
  }

  async recordFeatureUsage(
    userId: string, 
    featureName: string, 
    tokensCost: number
  ): Promise<boolean> {
    try {
      // Get feature ID
      const { data: feature, error: featureError } = await supabase
        .from('feature_permissions')
        .select('id')
        .eq('feature_name', featureName)
        .single();

      if (featureError || !feature) {
        throw new Error('Feature not found');
      }

      const today = new Date().toISOString().split('T')[0];

      // Record or update usage
      const { error: usageError } = await supabase
        .from('user_feature_usage')
        .upsert({
          user_id: userId,
          feature_id: feature.id,
          usage_date: today,
          usage_count: 1,
          tokens_spent: tokensCost
        }, {
          onConflict: 'user_id,feature_id,usage_date',
          ignoreDuplicates: false
        });

      if (usageError) throw usageError;

      // Deduct tokens from user balance if cost > 0
      if (tokensCost > 0) {
        const { data: user, error: userError } = await supabase
          .from('users')
          .select('token_balance')
          .eq('id', userId)
          .single();

        if (userError) throw userError;

        const newBalance = (user.token_balance || 0) - tokensCost;

        const { error: balanceError } = await supabase
          .from('users')
          .update({ token_balance: Math.max(0, newBalance) })
          .eq('id', userId);

        if (balanceError) throw balanceError;

        // Record token transaction
        const { error: transactionError } = await supabase
          .from('user_tokens')
          .insert({
            user_id: userId,
            transaction_type: 'spend',
            amount: -tokensCost,
            balance_after: Math.max(0, newBalance),
            description: `Used feature: ${featureName}`,
            reference_type: 'feature_usage',
            reference_id: featureName
          });

        if (transactionError) throw transactionError;
      }

      return true;
    } catch (error) {
      console.error('Error recording feature usage:', error);
      return false;
    }
  }

  async getUserTokenBalance(userId: string): Promise<number> {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('token_balance')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return user.token_balance || 0;
    } catch (error) {
      console.error('Error getting token balance:', error);
      return 0;
    }
  }
}

export const permissionService = new PermissionService();