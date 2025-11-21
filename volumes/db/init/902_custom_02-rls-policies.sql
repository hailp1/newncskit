-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.datasets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_cache ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Profiles Policies
-- ============================================

-- Users can view their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Users can insert their own profile
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Users can update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- ============================================
-- Projects Policies
-- ============================================

-- Users can view their own projects
DROP POLICY IF EXISTS "Users can view own projects" ON public.projects;
CREATE POLICY "Users can view own projects"
  ON public.projects
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own projects
DROP POLICY IF EXISTS "Users can create own projects" ON public.projects;
CREATE POLICY "Users can create own projects"
  ON public.projects
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own projects
DROP POLICY IF EXISTS "Users can update own projects" ON public.projects;
CREATE POLICY "Users can update own projects"
  ON public.projects
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own projects
DROP POLICY IF EXISTS "Users can delete own projects" ON public.projects;
CREATE POLICY "Users can delete own projects"
  ON public.projects
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- Datasets Policies
-- ============================================

-- Users can view datasets in their own projects
DROP POLICY IF EXISTS "Users can view datasets in own projects" ON public.datasets;
CREATE POLICY "Users can view datasets in own projects"
  ON public.datasets
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = datasets.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Users can create datasets in their own projects
DROP POLICY IF EXISTS "Users can create datasets in own projects" ON public.datasets;
CREATE POLICY "Users can create datasets in own projects"
  ON public.datasets
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = datasets.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Users can update datasets in their own projects
DROP POLICY IF EXISTS "Users can update datasets in own projects" ON public.datasets;
CREATE POLICY "Users can update datasets in own projects"
  ON public.datasets
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = datasets.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Users can delete datasets in their own projects
DROP POLICY IF EXISTS "Users can delete datasets in own projects" ON public.datasets;
CREATE POLICY "Users can delete datasets in own projects"
  ON public.datasets
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = datasets.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- ============================================
-- Analytics Cache Policies
-- ============================================

-- Anyone can read cache (for performance)
DROP POLICY IF EXISTS "Anyone can read cache" ON public.analytics_cache;
CREATE POLICY "Anyone can read cache"
  ON public.analytics_cache
  FOR SELECT
  USING (true);

-- Only authenticated users can write to cache
DROP POLICY IF EXISTS "Authenticated users can write cache" ON public.analytics_cache;
CREATE POLICY "Authenticated users can write cache"
  ON public.analytics_cache
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Auto-delete expired cache entries (using pg_cron or manual cleanup)
-- This will be handled by a scheduled function
