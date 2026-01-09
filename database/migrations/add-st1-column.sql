-- =====================================================================
-- Add missing ST1 column to questionnaire_responses table
-- =====================================================================
-- ST1: Morning stiffness question (part of complete KOOS/WOMAC)
-- =====================================================================

ALTER TABLE questionnaire_responses
ADD COLUMN IF NOT EXISTS st1 INTEGER CHECK (st1 BETWEEN 0 AND 4);

-- Verify column was added
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'questionnaire_responses'
AND column_name = 'st1';
