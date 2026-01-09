-- =====================================================================
-- FIX: Update check constraints to accept 1-5 instead of 1-4
-- =====================================================================
-- The questionnaire has 5 options per question (0-4 or Never/Mild/Moderate/Severe/Extreme)
-- But database was created with CHECK BETWEEN 1 AND 4
-- This script updates all constraints to CHECK BETWEEN 1 AND 5
-- =====================================================================

-- Drop old constraints and add new ones for Function questions (F1-F17)
ALTER TABLE questionnaire_responses DROP CONSTRAINT IF EXISTS questionnaire_responses_f1_check;
ALTER TABLE questionnaire_responses DROP CONSTRAINT IF EXISTS questionnaire_responses_f2_check;
ALTER TABLE questionnaire_responses DROP CONSTRAINT IF EXISTS questionnaire_responses_f3_check;
ALTER TABLE questionnaire_responses DROP CONSTRAINT IF EXISTS questionnaire_responses_f4_check;
ALTER TABLE questionnaire_responses DROP CONSTRAINT IF EXISTS questionnaire_responses_f5_check;
ALTER TABLE questionnaire_responses DROP CONSTRAINT IF EXISTS questionnaire_responses_f6_check;
ALTER TABLE questionnaire_responses DROP CONSTRAINT IF EXISTS questionnaire_responses_f7_check;
ALTER TABLE questionnaire_responses DROP CONSTRAINT IF EXISTS questionnaire_responses_f8_check;
ALTER TABLE questionnaire_responses DROP CONSTRAINT IF EXISTS questionnaire_responses_f9_check;
ALTER TABLE questionnaire_responses DROP CONSTRAINT IF EXISTS questionnaire_responses_f10_check;
ALTER TABLE questionnaire_responses DROP CONSTRAINT IF EXISTS questionnaire_responses_f11_check;
ALTER TABLE questionnaire_responses DROP CONSTRAINT IF EXISTS questionnaire_responses_f12_check;
ALTER TABLE questionnaire_responses DROP CONSTRAINT IF EXISTS questionnaire_responses_f13_check;
ALTER TABLE questionnaire_responses DROP CONSTRAINT IF EXISTS questionnaire_responses_f14_check;
ALTER TABLE questionnaire_responses DROP CONSTRAINT IF EXISTS questionnaire_responses_f15_check;
ALTER TABLE questionnaire_responses DROP CONSTRAINT IF EXISTS questionnaire_responses_f16_check;
ALTER TABLE questionnaire_responses DROP CONSTRAINT IF EXISTS questionnaire_responses_f17_check;

-- Add new constraints for F1-F17
ALTER TABLE questionnaire_responses ADD CONSTRAINT questionnaire_responses_f1_check CHECK (f1 BETWEEN 1 AND 5);
ALTER TABLE questionnaire_responses ADD CONSTRAINT questionnaire_responses_f2_check CHECK (f2 BETWEEN 1 AND 5);
ALTER TABLE questionnaire_responses ADD CONSTRAINT questionnaire_responses_f3_check CHECK (f3 BETWEEN 1 AND 5);
ALTER TABLE questionnaire_responses ADD CONSTRAINT questionnaire_responses_f4_check CHECK (f4 BETWEEN 1 AND 5);
ALTER TABLE questionnaire_responses ADD CONSTRAINT questionnaire_responses_f5_check CHECK (f5 BETWEEN 1 AND 5);
ALTER TABLE questionnaire_responses ADD CONSTRAINT questionnaire_responses_f6_check CHECK (f6 BETWEEN 1 AND 5);
ALTER TABLE questionnaire_responses ADD CONSTRAINT questionnaire_responses_f7_check CHECK (f7 BETWEEN 1 AND 5);
ALTER TABLE questionnaire_responses ADD CONSTRAINT questionnaire_responses_f8_check CHECK (f8 BETWEEN 1 AND 5);
ALTER TABLE questionnaire_responses ADD CONSTRAINT questionnaire_responses_f9_check CHECK (f9 BETWEEN 1 AND 5);
ALTER TABLE questionnaire_responses ADD CONSTRAINT questionnaire_responses_f10_check CHECK (f10 BETWEEN 1 AND 5);
ALTER TABLE questionnaire_responses ADD CONSTRAINT questionnaire_responses_f11_check CHECK (f11 BETWEEN 1 AND 5);
ALTER TABLE questionnaire_responses ADD CONSTRAINT questionnaire_responses_f12_check CHECK (f12 BETWEEN 1 AND 5);
ALTER TABLE questionnaire_responses ADD CONSTRAINT questionnaire_responses_f13_check CHECK (f13 BETWEEN 1 AND 5);
ALTER TABLE questionnaire_responses ADD CONSTRAINT questionnaire_responses_f14_check CHECK (f14 BETWEEN 1 AND 5);
ALTER TABLE questionnaire_responses ADD CONSTRAINT questionnaire_responses_f15_check CHECK (f15 BETWEEN 1 AND 5);
ALTER TABLE questionnaire_responses ADD CONSTRAINT questionnaire_responses_f16_check CHECK (f16 BETWEEN 1 AND 5);
ALTER TABLE questionnaire_responses ADD CONSTRAINT questionnaire_responses_f17_check CHECK (f17 BETWEEN 1 AND 5);

-- Drop old constraints and add new ones for Pain questions (P1-P9)
ALTER TABLE questionnaire_responses DROP CONSTRAINT IF EXISTS questionnaire_responses_p1_check;
ALTER TABLE questionnaire_responses DROP CONSTRAINT IF EXISTS questionnaire_responses_p2_check;
ALTER TABLE questionnaire_responses DROP CONSTRAINT IF EXISTS questionnaire_responses_p3_check;
ALTER TABLE questionnaire_responses DROP CONSTRAINT IF EXISTS questionnaire_responses_p4_check;
ALTER TABLE questionnaire_responses DROP CONSTRAINT IF EXISTS questionnaire_responses_p5_check;
ALTER TABLE questionnaire_responses DROP CONSTRAINT IF EXISTS questionnaire_responses_p6_check;
ALTER TABLE questionnaire_responses DROP CONSTRAINT IF EXISTS questionnaire_responses_p9_check;

ALTER TABLE questionnaire_responses ADD CONSTRAINT questionnaire_responses_p1_check CHECK (p1 BETWEEN 1 AND 5);
ALTER TABLE questionnaire_responses ADD CONSTRAINT questionnaire_responses_p2_check CHECK (p2 BETWEEN 1 AND 5);
ALTER TABLE questionnaire_responses ADD CONSTRAINT questionnaire_responses_p3_check CHECK (p3 BETWEEN 1 AND 5);
ALTER TABLE questionnaire_responses ADD CONSTRAINT questionnaire_responses_p4_check CHECK (p4 BETWEEN 1 AND 5);
ALTER TABLE questionnaire_responses ADD CONSTRAINT questionnaire_responses_p5_check CHECK (p5 BETWEEN 1 AND 5);
ALTER TABLE questionnaire_responses ADD CONSTRAINT questionnaire_responses_p6_check CHECK (p6 BETWEEN 1 AND 5);
ALTER TABLE questionnaire_responses ADD CONSTRAINT questionnaire_responses_p9_check CHECK (p9 BETWEEN 1 AND 5);

-- Drop old constraints and add new ones for Sport/Position questions (SP1-SP5)
ALTER TABLE questionnaire_responses DROP CONSTRAINT IF EXISTS questionnaire_responses_sp1_check;
ALTER TABLE questionnaire_responses DROP CONSTRAINT IF EXISTS questionnaire_responses_sp2_check;
ALTER TABLE questionnaire_responses DROP CONSTRAINT IF EXISTS questionnaire_responses_sp3_check;
ALTER TABLE questionnaire_responses DROP CONSTRAINT IF EXISTS questionnaire_responses_sp4_check;
ALTER TABLE questionnaire_responses DROP CONSTRAINT IF EXISTS questionnaire_responses_sp5_check;

ALTER TABLE questionnaire_responses ADD CONSTRAINT questionnaire_responses_sp1_check CHECK (sp1 BETWEEN 1 AND 5);
ALTER TABLE questionnaire_responses ADD CONSTRAINT questionnaire_responses_sp2_check CHECK (sp2 BETWEEN 1 AND 5);
ALTER TABLE questionnaire_responses ADD CONSTRAINT questionnaire_responses_sp3_check CHECK (sp3 BETWEEN 1 AND 5);
ALTER TABLE questionnaire_responses ADD CONSTRAINT questionnaire_responses_sp4_check CHECK (sp4 BETWEEN 1 AND 5);
ALTER TABLE questionnaire_responses ADD CONSTRAINT questionnaire_responses_sp5_check CHECK (sp5 BETWEEN 1 AND 5);

-- Drop old constraint and add new one for Stiffness question (ST2)
ALTER TABLE questionnaire_responses DROP CONSTRAINT IF EXISTS questionnaire_responses_st2_check;
ALTER TABLE questionnaire_responses ADD CONSTRAINT questionnaire_responses_st2_check CHECK (st2 BETWEEN 1 AND 5);

-- Drop old constraints and add new ones for Symptom questions (S1-S5)
ALTER TABLE questionnaire_responses DROP CONSTRAINT IF EXISTS questionnaire_responses_s1_check;
ALTER TABLE questionnaire_responses DROP CONSTRAINT IF EXISTS questionnaire_responses_s2_check;
ALTER TABLE questionnaire_responses DROP CONSTRAINT IF EXISTS questionnaire_responses_s3_check;
ALTER TABLE questionnaire_responses DROP CONSTRAINT IF EXISTS questionnaire_responses_s4_check;
ALTER TABLE questionnaire_responses DROP CONSTRAINT IF EXISTS questionnaire_responses_s5_check;

ALTER TABLE questionnaire_responses ADD CONSTRAINT questionnaire_responses_s1_check CHECK (s1 BETWEEN 1 AND 5);
ALTER TABLE questionnaire_responses ADD CONSTRAINT questionnaire_responses_s2_check CHECK (s2 BETWEEN 1 AND 5);
ALTER TABLE questionnaire_responses ADD CONSTRAINT questionnaire_responses_s3_check CHECK (s3 BETWEEN 1 AND 5);
ALTER TABLE questionnaire_responses ADD CONSTRAINT questionnaire_responses_s4_check CHECK (s4 BETWEEN 1 AND 5);
ALTER TABLE questionnaire_responses ADD CONSTRAINT questionnaire_responses_s5_check CHECK (s5 BETWEEN 1 AND 5);

-- Verify the new constraints
SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'questionnaire_responses'::regclass
AND conname LIKE '%_check'
ORDER BY conname;
