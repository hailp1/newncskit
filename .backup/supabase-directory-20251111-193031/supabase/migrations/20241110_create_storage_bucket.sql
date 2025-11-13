-- ============================================================================
-- Create Storage Bucket for CSV Files
-- ============================================================================
-- Description: Creates the analysis-csv-files bucket for storing uploaded CSV files
-- Date: 2024-11-10
-- ============================================================================

-- Create storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'analysis-csv-files',
  'analysis-csv-files',
  false, -- Not public
  52428800, -- 50MB limit
  ARRAY['text/csv', 'application/vnd.ms-excel', 'text/plain']
)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy: Users can upload their own files
CREATE POLICY "Users can upload their own CSV files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'analysis-csv-files' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can read their own files
CREATE POLICY "Users can read their own CSV files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'analysis-csv-files' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can update their own files
CREATE POLICY "Users can update their own CSV files"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'analysis-csv-files' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can delete their own files
CREATE POLICY "Users can delete their own CSV files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'analysis-csv-files' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Log completion
DO $$
BEGIN
  RAISE NOTICE 'Storage bucket created: analysis-csv-files';
  RAISE NOTICE 'File size limit: 50MB';
  RAISE NOTICE 'Allowed types: CSV, Excel, Text';
  RAISE NOTICE 'RLS policies: 4 policies created';
END $$;
