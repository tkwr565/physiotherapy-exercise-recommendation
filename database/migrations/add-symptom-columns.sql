-- Add missing symptom columns S1-S5 to questionnaire_responses table

ALTER TABLE questionnaire_responses
ADD COLUMN IF NOT EXISTS s1 INTEGER CHECK (s1 BETWEEN 1 AND 4),
ADD COLUMN IF NOT EXISTS s2 INTEGER CHECK (s2 BETWEEN 1 AND 4),
ADD COLUMN IF NOT EXISTS s3 INTEGER CHECK (s3 BETWEEN 1 AND 4),
ADD COLUMN IF NOT EXISTS s4 INTEGER CHECK (s4 BETWEEN 1 AND 4),
ADD COLUMN IF NOT EXISTS s5 INTEGER CHECK (s5 BETWEEN 1 AND 4);

-- Verify columns were added
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'questionnaire_responses'
AND column_name IN ('s1', 's2', 's3', 's4', 's5')
ORDER BY column_name;
