-- =====================================================================
-- FIX: Update P7 and P8 check constraints to accept 0-4 instead of 1-4
-- =====================================================================
-- P7 and P8 were added later and have 1-4 constraints
-- This script updates them to accept 0-4 range
-- =====================================================================

-- Drop old constraints for P7 and P8
ALTER TABLE questionnaire_responses DROP CONSTRAINT IF EXISTS questionnaire_responses_p7_check;
ALTER TABLE questionnaire_responses DROP CONSTRAINT IF EXISTS questionnaire_responses_p8_check;

-- Add new constraints for P7 and P8 (0-4 range)
ALTER TABLE questionnaire_responses ADD CONSTRAINT questionnaire_responses_p7_check CHECK (p7 BETWEEN 0 AND 4);
ALTER TABLE questionnaire_responses ADD CONSTRAINT questionnaire_responses_p8_check CHECK (p8 BETWEEN 0 AND 4);

-- Verify the new constraints
SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'questionnaire_responses'::regclass
AND conname IN ('questionnaire_responses_p7_check', 'questionnaire_responses_p8_check')
ORDER BY conname;
