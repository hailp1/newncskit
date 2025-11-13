-- ============================================
-- Admin System Audit - RLS Policies
-- Migration: 20241110_admin_system_rls_policies
-- ============================================
-- This migration sets up Row Level Security policies for
-- profiles and permissions tables with admin access controls.

-- Enable RLS on permissions table
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Enhanced Profiles Policies (Admin Access)
-- ============================================

-- Drop existing policies to recreate with admin support
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

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

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    -- Users cannot change their own role or subscription_type
    (auth.uid() = id AND role = (SELECT role FROM public.profiles WHERE id = auth.uid()))
    AND (auth.uid() = id AND subscription_type = (SELECT subscription_type FROM public.profiles WHERE id = auth.uid()))
  );

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

-- Super admins can update admin roles
CREATE POLICY "Super admins can manage roles"
  ON public.profiles
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() 
      AND role = 'super_admin'
    )
  );

-- ============================================
-- Permissions Table Policies
-- ============================================

-- Users can view their own permissions
CREATE POLICY "Users can view own permissions"
  ON public.permissions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can view all permissions
CREATE POLICY "Admins can view all permissions"
  ON public.permissions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

-- Only admins can grant permissions
CREATE POLICY "Admins can grant permissions"
  ON public.permissions
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

-- Only admins can update permissions
CREATE POLICY "Admins can update permissions"
  ON public.permissions
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

-- Only admins can revoke permissions
CREATE POLICY "Admins can revoke permissions"
  ON public.permissions
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

-- ============================================
-- Helper Functions for Permission Checks
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
