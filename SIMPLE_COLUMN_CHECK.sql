-- Simple query to check column names in analysis_variables
-- Copy and paste this into Supabase SQL Editor

SELECT column_name
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'analysis_variables'
ORDER BY ordinal_position;
