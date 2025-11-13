-- ============================================
-- Admin System Audit - Complete Migration
-- Migration: 20241110_admin_system_complete
-- ============================================
-- This is a combined migration file that includes all changes
-- for the admin system audit. Run this file to apply all changes.
--
-- Includes:
-- 0. Base profiles table creation (if not exists)
-- 1. Profiles table updates (new columns)
-- 2. Permissions table creation
-- 3. RLS policies for admin access
--
-- Usage:
--   psql -h <host> -U <user> -d <database> -f 20241110_admin_system_complete.sql
--   OR use Supabase Dashboard SQL Editor
-- ============================================

BEGIN;

-- ============================================
-- PART 0: Base Schema (if not exists)
-- ============================================

-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$ LANGUAGE plpgsql;

-- Add trigger for updated_at on profiles
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS on profiles (if not already enabled)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create basic profile policies if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND policyname = 'Users can insert own profile'
  ) THEN
    CREATE POLICY "Users can insert own profile"
      ON public.profiles
      FOR INSERT
      WITH CHECK (auth.uid() = id);
  END IF;
END $$;

-- ============================================
-- PART 1: Profiles Table Updates
-- ============================================

-- Add new columns to profiles table
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS institution VARCHAR(255),
  ADD COLUMN IF NOT EXISTS orcid_id VARCHAR(19),
  ADD COLUMN IF NOT EXISTS research_domains TEXT[],
  ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user',
  ADD COLUMN IF NOT EXISTS subscription_type VARCHAR(20) DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Add check constraints for valid values
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'check_role_valid'
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT check_role_valid 
        CHECK (role IN ('user', 'moderator', 'admin', 'super_admin'));
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'check_subscription_valid'
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT check_subscription_valid 
        CHECK (subscription_type IN ('free', 'premium', 'institutional'));
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'check_orcid_format'
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT check_orcid_format 
        CHECK (orcid_id IS NULL OR orcid_id ~ '^\d{4}-\d{4}-\d{4}-\d{3}[0-9X]$');
  END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription ON public.profiles(subscription_type);
CREATE INDEX IF NOT EXISTS idx_profiles_is_active ON public.profiles(is_active);
CREATE INDEX IF NOT EXISTS idx_profiles_institution ON public.profiles(institution);
CREATE INDEX IF NOT EXISTS idx_profiles_orcid ON public.profiles(orcid_id);

-- Add comments
COMMENT ON COLUMN public.profiles.institution IS 'User affiliated institution or organization';
COMMENT ON COLUMN public.profiles.orcid_id IS 'ORCID identifier in format 0000-0000-0000-000X';
COMMENT ON COLUMN public.profiles.research_domains IS 'Array of research domain tags';
COMMENT ON COLUMN public.profiles.role IS 'User role: user, moderator, admin, super_admin';
COMMENT ON COLUMN public.profiles.subscription_type IS 'Subscription tier: free, premium, institutional';
COMMENT ON COLUMN public.profiles.is_active IS 'Whether the user account is active';

-- ============================================
-- PART 2: Permissions Table Creation
-- ============================================

-- Create permissions table
CREATE TABLE IF NOT EXISTS public.permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  permission VARCHAR(100) NOT NULL,
  granted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_user_permission UNIQUE(user_id, permission)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_permissions_user_id ON public.permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_permissions_expires_at ON public.permissions(expires_at);
CREATE INDEX IF NOT EXISTS idx_permissions_permission ON public.permissions(permission);
CREATE INDEX IF NOT EXISTS idx_permissions_granted_by ON public.permissions(granted_by);
CREATE INDEX IF NOT EXISTS idx_permissions_user_permission ON public.permissions(user_id, permission);

-- Add trigger for updated_at
DROP TRIGGER IF EXISTS update_permissions_updated_at ON public.permissions;
CREATE TRIGGER update_permissions_updated_at
  BEFORE UPDATE ON public.permissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments
COMMENT ON TABLE public.permissions IS 'Granular user permissions for feature access control';
COMMENT ON COLUMN public.permissions.user_id IS 'User who has this permission';
COMMENT ON COLUMN public.permissions.permission IS 'Permission identifier (e.g., create_post, edit_any_post)';
COMMENT ON COLUMN public.permissions.granted_by IS 'User who granted this permission';
COMMENT ON COLUMN public.permissions.granted_at IS 'When the permission was granted';
COMMENT ON COLUMN public.permissions.expires_at IS 'When the permission expires (NULL for permanent)';

-- ============================================
-- PART 3: RLS Policies
-- ============================================

-- Enable RLS on permissions table
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate with admin support
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
DROP POLICY IF EXISTS "Super admins can manage roles" ON public.profiles;

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
  ON public.profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

-- Users can update their own profile (but not role/subscription)
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Admins can update any profile
CREATE POLICY "Admins can update any profile"
  ON public.profiles
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

-- Permissions table policies
DROP POLICY IF EXISTS "Users can view own permissions" ON public.permissions;
DROP POLICY IF EXISTS "Admins can view all permissions" ON public.permissions;
DROP POLICY IF EXISTS "Admins can grant permissions" ON public.permissions;
DROP POLICY IF EXISTS "Admins can update permissions" ON public.permissions;
DROP POLICY IF EXISTS "Admins can revoke permissions" ON public.permissions;

CREATE POLICY "Users can view own permissions"
  ON public.permissions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all permissions"
  ON public.permissions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can grant permissions"
  ON public.permissions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can update permissions"
  ON public.permissions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can revoke permissions"
  ON public.permissions FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- ============================================
-- PART 4: Helper Functions
-- ============================================

-- Function to check if user has a specific permission
CREATE OR REPLACE FUNCTION public.has_permission(
  check_user_id UUID,
  check_permission VARCHAR
)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.permissions
    WHERE user_id = check_user_id
    AND permission = check_permission
    AND (expires_at IS NULL OR expires_at > NOW())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has admin role
CREATE OR REPLACE FUNCTION public.is_admin(check_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = check_user_id
    AND role IN ('admin', 'super_admin')
    AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(check_user_id UUID)
RETURNS VARCHAR AS $$
DECLARE
  user_role VARCHAR;
BEGIN
  SELECT role INTO user_role
  FROM public.profiles
  WHERE id = check_user_id;
  
  RETURN COALESCE(user_role, 'user');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comments
COMMENT ON FUNCTION public.has_permission IS 'Check if user has a specific permission (excluding expired)';
COMMENT ON FUNCTION public.is_admin IS 'Check if user has admin or super_admin role';
COMMENT ON FUNCTION public.get_user_role IS 'Get user role, defaults to user if not found';

COMMIT;

-- ============================================
-- Verification Queries
-- ============================================
-- Run these queries after migration to verify success:
--
-- 1. Check profiles table structure:
--    SELECT column_name, data_type, is_nullable 
--    FROM information_schema.columns 
--    WHERE table_name = 'profiles' AND table_schema = 'public';
--
-- 2. Check permissions table exists:
--    SELECT * FROM information_schema.tables 
--    WHERE table_name = 'permissions' AND table_schema = 'public';
--
-- 3. Check indexes:
--    SELECT indexname, indexdef 
--    FROM pg_indexes 
--    WHERE tablename IN ('profiles', 'permissions');
--
-- 4. Check RLS policies:
--    SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
--    FROM pg_policies 
--    WHERE tablename IN ('profiles', 'permissions');
--
-- 5. Test helper functions:
--    SELECT public.is_admin(auth.uid());
--    SELECT public.get_user_role(auth.uid());
