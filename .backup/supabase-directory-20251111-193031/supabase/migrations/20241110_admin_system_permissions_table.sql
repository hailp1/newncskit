-- ============================================
-- Admin System Audit - Permissions Table
-- Migration: 20241110_admin_system_permissions_table
-- ============================================
-- This migration creates the permissions table for granular
-- user permission management and role-based access control.

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

-- Create composite index for common queries
CREATE INDEX IF NOT EXISTS idx_permissions_user_permission 
  ON public.permissions(user_id, permission);

-- Add trigger for updated_at
CREATE TRIGGER update_permissions_updated_at
  BEFORE UPDATE ON public.permissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments to document the table structure
COMMENT ON TABLE public.permissions IS 'Granular user permissions for feature access control';
COMMENT ON COLUMN public.permissions.user_id IS 'User who has this permission';
COMMENT ON COLUMN public.permissions.permission IS 'Permission identifier (e.g., create_post, edit_any_post)';
COMMENT ON COLUMN public.permissions.granted_by IS 'User who granted this permission';
COMMENT ON COLUMN public.permissions.granted_at IS 'When the permission was granted';
COMMENT ON COLUMN public.permissions.expires_at IS 'When the permission expires (NULL for permanent)';
