-- ============================================
-- Create Admin User
-- ============================================
-- Email: admin@ncskit.org
-- Password: admin123
-- Role: super admin
-- ============================================

-- Step 1: Create the admin user in auth.users
-- Note: You need to do this through Supabase Dashboard or use the Admin API
-- This SQL creates the profile and sets admin role

-- First, you need to create the user through Supabase Dashboard:
-- 1. Go to Authentication > Users
-- 2. Click "Add user" > "Create new user"
-- 3. Email: admin@ncskit.org
-- 4. Password: admin123
-- 5. Auto Confirm User: YES (check this box)
-- 6. Click "Create user"

-- After creating the user in Dashboard, get the user ID and run this:

-- Step 2: Update the user's metadata to set admin role
-- Replace 'USER_ID_HERE' with the actual UUID from the created user

-- Method 1: Update user metadata (run after getting user ID)
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'
)
WHERE email = 'admin@ncskit.org';

-- Step 3: Update the profile with admin info
UPDATE public.profiles
SET 
  full_name = 'Super Admin',
  updated_at = NOW()
WHERE email = 'admin@ncskit.org';

-- Step 4: Verify the admin user
SELECT 
  id,
  email,
  raw_user_meta_data->>'role' as role,
  raw_user_meta_data->>'full_name' as full_name,
  email_confirmed_at,
  created_at
FROM auth.users
WHERE email = 'admin@ncskit.org';

-- Step 5: Verify the profile
SELECT *
FROM public.profiles
WHERE email = 'admin@ncskit.org';
