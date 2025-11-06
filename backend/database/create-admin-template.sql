-- =====================================================
-- NCSKIT: Create Super Admin User Script (Template)
-- =====================================================
-- INSTRUCTIONS:
-- 1. Create users in Supabase Auth Dashboard first
-- 2. Copy their UUIDs from the dashboard
-- 3. Replace the UUIDs below with the real ones
-- 4. Run this script in Supabase SQL Editor

-- =====================================================
-- STEP 1: Replace these UUIDs with real ones from Supabase Auth
-- =====================================================
-- Primary Admin UUID (replace with real UUID from admin@ncskit.com)
-- Example: '12345678-1234-1234-1234-123456789abc'

-- Backup Admin UUID (replace with real UUID from superadmin@ncskit.com)  
-- Example: '87654321-4321-4321-4321-cba987654321'

-- =====================================================
-- STEP 2: Insert Admin Profiles
-- =====================================================

-- Insert Primary Admin Profile
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
    '12345678-1234-1234-1234-123456789abc', -- REPLACE WITH REAL UUID
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

-- Insert Backup Admin Profile
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
    '87654321-4321-4321-4321-cba987654321', -- REPLACE WITH REAL UUID
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

-- =====================================================
-- STEP 3: Grant Admin Permissions
-- =====================================================

-- Grant permissions to Primary Admin
INSERT INTO public.permissions (
    user_id,
    permission,
    granted_by,
    granted_at
) VALUES 
    ('12345678-1234-1234-1234-123456789abc', 'admin.users.manage', 'system', NOW()),
    ('12345678-1234-1234-1234-123456789abc', 'admin.projects.manage', 'system', NOW()),
    ('12345678-1234-1234-1234-123456789abc', 'admin.posts.manage', 'system', NOW()),
    ('12345678-1234-1234-1234-123456789abc', 'admin.tokens.manage', 'system', NOW()),
    ('12345678-1234-1234-1234-123456789abc', 'admin.permissions.manage', 'system', NOW()),
    ('12345678-1234-1234-1234-123456789abc', 'admin.rewards.manage', 'system', NOW()),
    ('12345678-1234-1234-1234-123456789abc', 'admin.system.manage', 'system', NOW()),
    ('12345678-1234-1234-1234-123456789abc', 'projects.create', 'system', NOW()),
    ('12345678-1234-1234-1234-123456789abc', 'projects.edit', 'system', NOW()),
    ('12345678-1234-1234-1234-123456789abc', 'projects.delete', 'system', NOW()),
    ('12345678-1234-1234-1234-123456789abc', 'ai.unlimited', 'system', NOW())
ON CONFLICT (user_id, permission) DO NOTHING;

-- Grant permissions to Backup Admin
INSERT INTO public.permissions (
    user_id,
    permission,
    granted_by,
    granted_at
) VALUES 
    ('87654321-4321-4321-4321-cba987654321', 'admin.users.manage', 'system', NOW()),
    ('87654321-4321-4321-4321-cba987654321', 'admin.projects.manage', 'system', NOW()),
    ('87654321-4321-4321-4321-cba987654321', 'admin.posts.manage', 'system', NOW()),
    ('87654321-4321-4321-4321-cba987654321', 'admin.tokens.manage', 'system', NOW()),
    ('87654321-4321-4321-4321-cba987654321', 'admin.permissions.manage', 'system', NOW()),
    ('87654321-4321-4321-4321-cba987654321', 'admin.rewards.manage', 'system', NOW()),
    ('87654321-4321-4321-4321-cba987654321', 'admin.system.manage', 'system', NOW()),
    ('87654321-4321-4321-4321-cba987654321', 'projects.create', 'system', NOW()),
    ('87654321-4321-4321-4321-cba987654321', 'projects.edit', 'system', NOW()),
    ('87654321-4321-4321-4321-cba987654321', 'projects.delete', 'system', NOW()),
    ('87654321-4321-4321-4321-cba987654321', 'ai.unlimited', 'system', NOW())
ON CONFLICT (user_id, permission) DO NOTHING;

-- =====================================================
-- STEP 4: Verification
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