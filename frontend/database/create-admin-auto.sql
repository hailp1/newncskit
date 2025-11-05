-- =====================================================
-- NCSKIT: Auto Create Super Admin (Using existing auth users)
-- =====================================================
-- This script automatically finds users by email and creates admin profiles
-- Make sure you've created the auth users first!

-- =====================================================
-- Create admin profiles for existing auth users
-- =====================================================

-- Create Primary Admin Profile (admin@ncskit.com)
INSERT INTO public.users (
    id,
    email,
    first_name,
    last_name,
    full_name,
    role,
    status,
    subscription_type,
    token_balance,
    account_status,
    created_at,
    updated_at
)
SELECT 
    au.id,
    au.email,
    'Super',
    'Admin',
    'Super Admin',
    'super_admin',
    'active',
    'institutional',
    10000,
    'active',
    NOW(),
    NOW()
FROM auth.users au
WHERE au.email = 'admin@ncskit.com'
ON CONFLICT (id) DO UPDATE SET
    role = 'super_admin',
    status = 'active',
    subscription_type = 'institutional',
    token_balance = 10000,
    account_status = 'active',
    updated_at = NOW();

-- Create Backup Admin Profile (superadmin@ncskit.com)
INSERT INTO public.users (
    id,
    email,
    first_name,
    last_name,
    full_name,
    role,
    status,
    subscription_type,
    token_balance,
    account_status,
    created_at,
    updated_at
)
SELECT 
    au.id,
    au.email,
    'Backup',
    'Admin',
    'Backup Admin',
    'super_admin',
    'active',
    'institutional',
    10000,
    'active',
    NOW(),
    NOW()
FROM auth.users au
WHERE au.email = 'superadmin@ncskit.com'
ON CONFLICT (id) DO UPDATE SET
    role = 'super_admin',
    status = 'active',
    subscription_type = 'institutional',
    token_balance = 10000,
    account_status = 'active',
    updated_at = NOW();

-- =====================================================
-- Grant permissions to admin users
-- =====================================================

-- Grant permissions to Primary Admin
INSERT INTO public.permissions (
    user_id,
    permission,
    granted_by,
    granted_at
)
SELECT 
    au.id,
    perm.permission,
    'system',
    NOW()
FROM auth.users au
CROSS JOIN (
    VALUES 
        ('admin.users.manage'),
        ('admin.projects.manage'),
        ('admin.posts.manage'),
        ('admin.tokens.manage'),
        ('admin.permissions.manage'),
        ('admin.rewards.manage'),
        ('admin.system.manage'),
        ('projects.create'),
        ('projects.edit'),
        ('projects.delete'),
        ('ai.unlimited')
) AS perm(permission)
WHERE au.email = 'admin@ncskit.com'
ON CONFLICT (user_id, permission) DO NOTHING;

-- Grant permissions to Backup Admin
INSERT INTO public.permissions (
    user_id,
    permission,
    granted_by,
    granted_at
)
SELECT 
    au.id,
    perm.permission,
    'system',
    NOW()
FROM auth.users au
CROSS JOIN (
    VALUES 
        ('admin.users.manage'),
        ('admin.projects.manage'),
        ('admin.posts.manage'),
        ('admin.tokens.manage'),
        ('admin.permissions.manage'),
        ('admin.rewards.manage'),
        ('admin.system.manage'),
        ('projects.create'),
        ('projects.edit'),
        ('projects.delete'),
        ('ai.unlimited')
) AS perm(permission)
WHERE au.email = 'superadmin@ncskit.com'
ON CONFLICT (user_id, permission) DO NOTHING;

-- =====================================================
-- Verification
-- =====================================================

-- Check created admin users
SELECT 
    u.id,
    u.email,
    u.full_name,
    u.role,
    u.status,
    u.token_balance,
    u.created_at
FROM public.users u
WHERE u.role = 'super_admin';

-- Check admin permissions
SELECT 
    u.email,
    p.permission,
    p.granted_at
FROM public.users u
JOIN public.permissions p ON u.id = p.user_id
WHERE u.role = 'super_admin'
ORDER BY u.email, p.permission;

-- Check if auth users exist
SELECT 
    id,
    email,
    created_at,
    email_confirmed_at
FROM auth.users 
WHERE email IN ('admin@ncskit.com', 'superadmin@ncskit.com');