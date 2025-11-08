-- Create storage bucket for CSV analysis files
-- Run this in Supabase SQL Editor or via migration

-- Create bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'analysis-csv-files',
  'analysis-csv-files',
  false, -- private bucket
  52428800, -- 50MB limit
  ARRAY['text/csv', 'application/vnd.ms-excel', 'text/plain']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for analysis-csv-files bucket

-- Policy: Users can upload their own CSV files
CREATE POLICY "Users can upload CSV files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'analysis-csv-files'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Users can view their own CSV files
CREATE POLICY "Users can view their own CSV files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'analysis-csv-files'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Users can update their own CSV files
CREATE POLICY "Users can update their own CSV files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'analysis-csv-files'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Users can delete their own CSV files
CREATE POLICY "Users can delete their own CSV files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'analysis-csv-files'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Note: Files will be stored with path: {user_id}/{project_id}/{filename}.csv
