-- =====================================================================
-- DIAGNOSTIC: Check questionnaire_responses table structure
-- =====================================================================
-- Run this in Supabase SQL Editor to see what columns exist
-- =====================================================================

-- Check if table exists
SELECT EXISTS (
   SELECT FROM information_schema.tables
   WHERE table_schema = 'public'
   AND table_name = 'questionnaire_responses'
) AS table_exists;

-- List all columns in the table
SELECT column_name, data_type, character_maximum_length, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'questionnaire_responses'
ORDER BY ordinal_position;

-- Count total columns
SELECT COUNT(*) as total_columns
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'questionnaire_responses';
