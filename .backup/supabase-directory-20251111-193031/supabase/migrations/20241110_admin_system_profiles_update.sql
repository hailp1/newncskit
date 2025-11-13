-- ============================================
-- Admin System Audit - Profiles Table Updates
-- Migration: 20241110_admin_system_profiles_update
-- ============================================
-- This migration adds new columns to the profiles table to support
-- enhanced user management, roles, and institutional information.

-- Add new columns to profiles table
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS institution VARCHAR(255),
  ADD COLUMN IF NOT EXISTS orcid_id VARCHAR(19),
  ADD COLUMN IF NOT EXISTS research_domains TEXT[],
  ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user',
  ADD COLUMN IF NOT EXISTS subscription_type VARCHAR(20) DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Add check constraints for valid values
ALTER TABLE public.profiles
  ADD CONSTRAINT check_role_valid 
    CHECK (role IN ('user', 'moderator', 'admin', 'super_admin'));

ALTER TABLE public.profiles
  ADD CONSTRAINT check_subscription_valid 
    CHECK (subscription_type IN ('free', 'premium', 'institutional'));

-- Add check constraint for ORCID format (0000-0000-0000-000X)
ALTER TABLE public.profiles
  ADD CONSTRAINT check_orcid_format 
    CHECK (orcid_id IS NULL OR orcid_id ~ '^\d{4}-\d{4}-\d{4}-\d{3}[0-9X]$');

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription ON public.profiles(subscription_type);
CREATE INDEX IF NOT EXISTS idx_profiles_is_active ON public.profiles(is_active);
CREATE INDEX IF NOT EXISTS idx_profiles_institution ON public.profiles(institution);
CREATE INDEX IF NOT EXISTS idx_profiles_orcid ON public.profiles(orcid_id);

-- Add comment to document the table structure
COMMENT ON COLUMN public.profiles.institution IS 'User affiliated institution or organization';
COMMENT ON COLUMN public.profiles.orcid_id IS 'ORCID identifier in format 0000-0000-0000-000X';
COMMENT ON COLUMN public.profiles.research_domains IS 'Array of research domain tags';
COMMENT ON COLUMN public.profiles.role IS 'User role: user, moderator, admin, super_admin';
COMMENT ON COLUMN public.profiles.subscription_type IS 'Subscription tier: free, premium, institutional';
COMMENT ON COLUMN public.profiles.is_active IS 'Whether the user account is active';
