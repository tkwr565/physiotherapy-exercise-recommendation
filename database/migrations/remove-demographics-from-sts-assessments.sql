-- Remove demographic columns from sts_assessments table
-- These fields have been moved to the patient_demographics table
-- Created: 2026-01-13

-- Remove age and gender columns from sts_assessments
ALTER TABLE sts_assessments
DROP COLUMN IF EXISTS age,
DROP COLUMN IF EXISTS gender;

-- Add comment to document the change
COMMENT ON TABLE sts_assessments IS 'Stores sit-to-stand assessment data. Demographic information (age, gender, height, weight) is now stored in patient_demographics table.';
