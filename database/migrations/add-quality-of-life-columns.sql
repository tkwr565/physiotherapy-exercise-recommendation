-- =====================================================================
-- Add Quality of Life columns (Q1-Q4) to questionnaire_responses table
-- =====================================================================
-- Complete KOOS questionnaire includes 4 Quality of Life questions
-- =====================================================================

ALTER TABLE questionnaire_responses
ADD COLUMN IF NOT EXISTS q1 INTEGER CHECK (q1 BETWEEN 0 AND 4),
ADD COLUMN IF NOT EXISTS q2 INTEGER CHECK (q2 BETWEEN 0 AND 4),
ADD COLUMN IF NOT EXISTS q3 INTEGER CHECK (q3 BETWEEN 0 AND 4),
ADD COLUMN IF NOT EXISTS q4 INTEGER CHECK (q4 BETWEEN 0 AND 4);

-- Verify columns were added
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'questionnaire_responses'
AND column_name IN ('q1', 'q2', 'q3', 'q4')
ORDER BY column_name;
