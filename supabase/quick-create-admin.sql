-- ============================================
-- QUICK CREATE ADMIN USER
-- ============================================
-- Run this AFTER creating user in Dashboard
-- ============================================

-- STEP 1: First, create user in Supabase Dashboard:
-- Go to: Authentication > Users > Add user
-- Email: admin@ncskit.org
-- Password: admin123
-- ✅ Check "Auto Confirm User"
-- Click "Create user"

-- STEP 2: Then run this SQL to set admin role:

-- Set admin role
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'
),
raw_user_meta_data = jsonb_set(
  raw_user_meta_data,
  '{full_name}',
  '"Super Admin"'
)
WHERE email = 'admin@ncskit.org';

-- Update profile
UPDATE public.profiles
SET 
  full_name = 'Super Admin',
  updated_at = NOW()
WHERE email = 'admin@ncskit.org';

-- STEP 3: Verify admin user created successfully:

SELECT 
  '✅ Admin User Details' as status,
  id,
  email,
  raw_user_meta_data->>'role' as role,
  raw_user_meta_data->>'full_name' as full_name,
  email_confirmed_at,
  created_at
FROM auth.users
WHERE email = 'admin@ncskit.org';

SELECT 
  '✅ Admin Profile Details' as status,
  id,
  email,
  full_name,
  created_at,
  updated_at
FROM public.profiles
WHERE email = 'admin@ncskit.org';

-- Expected Results:
-- ✅ User exists with email: admin@ncskit.org
-- ✅ Role: admin
-- ✅ Full Name: Super Admin
-- ✅ Email confirmed: YES
-- ✅ Profile exists

-- DONE! You can now login with:
-- Email: admin@ncskit.org
-- Password: admin123
