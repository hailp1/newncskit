-- ============================================
-- Storage Buckets and Policies
-- ============================================

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('avatars', 'avatars', true),
  ('datasets', 'datasets', false),
  ('exports', 'exports', false)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- Avatars Bucket Policies
-- ============================================

-- Avatar images are publicly accessible
CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'avatars');

-- Users can upload their own avatar
CREATE POLICY "Users can upload own avatar"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can update their own avatar
CREATE POLICY "Users can update own avatar"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can delete their own avatar
CREATE POLICY "Users can delete own avatar"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================
-- Datasets Bucket Policies
-- ============================================

-- Users can view their own datasets
CREATE POLICY "Users can view own datasets"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'datasets'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can upload their own datasets
CREATE POLICY "Users can upload own datasets"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'datasets'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can update their own datasets
CREATE POLICY "Users can update own datasets"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'datasets'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can delete their own datasets
CREATE POLICY "Users can delete own datasets"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'datasets'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================
-- Exports Bucket Policies
-- ============================================

-- Users can view their own exports
CREATE POLICY "Users can view own exports"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'exports'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can upload their own exports
CREATE POLICY "Users can upload own exports"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'exports'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can delete their own exports
CREATE POLICY "Users can delete own exports"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'exports'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
