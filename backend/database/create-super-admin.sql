-- =====================================================
-- NCSKIT: Create Super Admin User Script
-- =====================================================
-- This script creates the default super admin user
-- Run this AFTER setting up the main database

-- 1. Create Super Admin User in auth.users (Supabase Auth)
-- Note: This needs to be done via Supabase Dashboard or Auth API
-- Email: admin@ncskit.com
-- Password: admin123
-- Confirm email: true

-- 2. Insert Super Admin Profile in users table
-- Replace 'ADMIN_USER_ID' with the actual UUID from Supabase Auth
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
) VALUES (
    'ADMIN_USER_ID', -- Replace with actual UUID from Supabase Auth
    'admin@ncskit.com',
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
) ON CONFLICT (id) DO UPDATE SET
    role = 'super_admin',
    status = 'active',
    subscription_type = 'institutional',
    token_balance = 10000,
    account_status = 'active',
    updated_at = NOW();

-- 3. Grant all permissions to Super Admin
INSERT INTO public.permissions (
    user_id,
    permission,
    granted_by,
    granted_at
) VALUES 
    ('ADMIN_USER_ID', 'admin.users.manage', 'system', NOW()),
    ('ADMIN_USER_ID', 'admin.projects.manage', 'system', NOW()),
    ('ADMIN_USER_ID', 'admin.posts.manage', 'system', NOW()),
    ('ADMIN_USER_ID', 'admin.tokens.manage', 'system', NOW()),
    ('ADMIN_USER_ID', 'admin.permissions.manage', 'system', NOW()),
    ('ADMIN_USER_ID', 'admin.rewards.manage', 'system', NOW()),
    ('ADMIN_USER_ID', 'admin.system.manage', 'system', NOW()),
    ('ADMIN_USER_ID', 'projects.create', 'system', NOW()),
    ('ADMIN_USER_ID', 'projects.edit', 'system', NOW()),
    ('ADMIN_USER_ID', 'projects.delete', 'system', NOW()),
    ('ADMIN_USER_ID', 'ai.unlimited', 'system', NOW())
ON CONFLICT (user_id, permission) DO NOTHING;

-- 4. Create backup admin user profile (optional)
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
) VALUES (
    'BACKUP_ADMIN_USER_ID', -- Replace with actual UUID from Supabase Auth
    'superadmin@ncskit.com',
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
) ON CONFLICT (id) DO UPDATE SET
    role = 'super_admin',
    status = 'active',
    subscription_type = 'institutional',
    token_balance = 10000,
    account_status = 'active',
    updated_at = NOW();

-- 5. Grant permissions to backup admin
INSERT INTO public.permissions (
    user_id,
    permission,
    granted_by,
    granted_at
) VALUES 
    ('BACKUP_ADMIN_USER_ID', 'admin.users.manage', 'system', NOW()),
    ('BACKUP_ADMIN_USER_ID', 'admin.projects.manage', 'system', NOW()),
    ('BACKUP_ADMIN_USER_ID', 'admin.posts.manage', 'system', NOW()),
    ('BACKUP_ADMIN_USER_ID', 'admin.tokens.manage', 'system', NOW()),
    ('BACKUP_ADMIN_USER_ID', 'admin.permissions.manage', 'system', NOW()),
    ('BACKUP_ADMIN_USER_ID', 'admin.rewards.manage', 'system', NOW()),
    ('BACKUP_ADMIN_USER_ID', 'admin.system.manage', 'system', NOW()),
    ('BACKUP_ADMIN_USER_ID', 'projects.create', 'system', NOW()),
    ('BACKUP_ADMIN_USER_ID', 'projects.edit', 'system', NOW()),
    ('BACKUP_ADMIN_USER_ID', 'projects.delete', 'system', NOW()),
    ('BACKUP_ADMIN_USER_ID', 'ai.unlimited', 'system', NOW())
ON CONFLICT (user_id, permission) DO NOTHING;

-- 6. Log admin creation
INSERT INTO public.admin_logs (
    admin_id,
    action,
    target_type,
    target_id,
    details,
    ip_address,
    created_at
) VALUES 
    ('system', 'admin_created', 'user', 1, '{"email": "admin@ncskit.com", "role": "super_admin"}', '127.0.0.1', NOW()),
    ('system', 'admin_created', 'user', 2, '{"email": "superadmin@ncskit.com", "role": "super_admin"}', '127.0.0.1', NOW());

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check if admin users were created
SELECT 
    id,
    email,
    full_name,
    role,
    status,
    token_balance,
    created_at
FROM public.users 
WHERE role = 'super_admin';

-- Check admin permissions
SELECT 
    u.email,
    p.permission,
    p.granted_at
FROM public.users u
JOIN public.permissions p ON u.id = p.user_id
WHERE u.role = 'super_admin'
ORDER BY u.email, p.permission;

-- =====================================================
-- NOTES:
-- =====================================================
-- 1. You MUST create the auth users first in Supabase Dashboard:
--    - Go to Authentication > Users
--    - Add user: admin@ncskit.com / admin123
--    - Add user: superadmin@ncskit.com / SuperAdmin2024!
--    - Copy the UUIDs and replace ADMIN_USER_ID and BACKUP_ADMIN_USER_ID
--
-- 2. Make sure to confirm the email addresses in Supabase Auth
--
-- 3. After running this script, the admin users can access:
--    - /admin dashboard
--    - All admin functions
--    - Unlimited tokens
--    - All permissions
-- =====================================================