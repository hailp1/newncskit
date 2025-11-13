-- ============================================
-- Admin System - Standalone Migration
-- ============================================
-- This migration can be run on a fresh database
-- It includes base schema + admin system features
-- ============================================

BEGIN;

-- ============================================
-- PART 1: Base Schema Setup
-- ============================================

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create profiles table with all admin system fields
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  -- Admin system fields
  institution VARCHAR(255),
  orcid_id VARCHAR(19),
  research_domains TEXT[],
  role VARCHAR(20) DEFAULT 'user',
  subscription_type VARCHAR(20) DEFAULT 'free',
  is_active BOOLEAN DEFAULT true,
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- Constraints
  CONSTRAINT check_role_valid 
    CHECK (role IN ('user', 'moderator', 'admin', 'super_admin')),
  CONSTRAINT check_subscription_valid 
    CHECK (subscription_type IN ('free', 'premium', 'institutional')),
  CONSTRAINT check_orcid_format 
    CHECK (orcid_id IS NULL OR orcid_id ~ '^\d{4}-\d{4}-\d{4}-\d{3}[0-9X]$')
);

-- Create indexes for profiles
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription ON public.profiles(subscription_type);
CREATE INDEX IF NOT EXISTS idx_profiles_is_active ON public.profiles(is_active);
CREATE INDEX IF NOT EXISTS idx_profiles_institution ON public.profiles(institution);
CREATE INDEX IF NOT EXISTS idx_profiles_orcid ON public.profiles(orcid_id);

-- Add trigger for updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments
COMMENT ON TABLE public.profiles IS 'User profiles with admin system support';
COMMENT ON COLUMN public.profiles.institution IS 'User affiliated institution or organization';
COMMENT ON COLUMN public.profiles.orcid_id IS 'ORCID identifier in format 0000-0000-0000-000X';
COMMENT ON COLUMN public.profiles.research_domains IS 'Array of research domain tags';
COMMENT ON COLUMN public.profiles.role IS 'User role: user, moderator, admin, super_admin';
COMMENT ON COLUMN public.profiles.subscription_type IS 'Subscription tier: free, premium, institutional';
COMMENT ON COLUMN public.profiles.is_active IS 'Whether the user account is active';

-- ============================================
-- PART 2: Permissions Table
-- ============================================

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

-- Create indexes for permissions
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
-- PART 3: Auto-Create Profile on Signup
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, subscription_type, is_active)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    'user',
    'free',
    true
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- PART 4: RLS Policies
-- ============================================

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;

DROP POLICY IF EXISTS "Users can view own permissions" ON public.permissions;
DROP POLICY IF EXISTS "Admins can view all permissions" ON public.permissions;
DROP POLICY IF EXISTS "Admins can grant permissions" ON public.permissions;
DROP POLICY IF EXISTS "Admins can update permissions" ON public.permissions;
DROP POLICY IF EXISTS "Admins can revoke permissions" ON public.permissions;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can update any profile"
  ON public.profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Permissions policies
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
-- PART 5: Helper Functions
-- ============================================

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

-- ============================================
-- PART 6: Grant Permissions
-- ============================================

GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, anon, authenticated, service_role;

COMMIT;

-- ============================================
-- Migration Complete!
-- ============================================
-- Next steps:
-- 1. Run verification: verify_admin_system_migration.sql
-- 2. Create admin user:
--    UPDATE public.profiles 
--    SET role = 'super_admin' 
--    WHERE email = 'your-email@example.com';
-- ============================================
