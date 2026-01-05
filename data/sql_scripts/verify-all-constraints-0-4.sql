-- =====================================================================
-- COMPREHENSIVE CHECK: Verify and fix ALL questionnaire constraints to 0-4
-- =====================================================================
-- This script ensures ALL question columns have 0-4 constraints
-- Excludes: id, user_id, username, toe_touch_test, completed_at, created_at
-- =====================================================================

-- Pain questions (P1-P9) - Note: P7, P8 added later
ALTER TABLE questionnaire_responses DROP CONSTRAINT IF EXISTS questionnaire_responses_p1_check;
ALTER TABLE questionnaire_responses DROP CONSTRAINT IF EXISTS questionnaire_responses_p2_check;
ALTER TABLE questionnaire_responses DROP CONSTRAINT IF EXISTS questionnaire_responses_p3_check;
ALTER TABLE questionnaire_responses DROP CONSTRAINT IF EXISTS questionnaire_responses_p4_check;
ALTER TABLE questionnaire_responses DROP CONSTRAINT IF EXISTS questionnaire_responses_p5_check;
ALTER TABLE questionnaire_responses DROP CONSTRAINT IF EXISTS questionnaire_responses_p6_check;
ALTER TABLE questionnaire_responses DROP CONSTRAINT IF EXISTS questionnaire_responses_p7_check;
ALTER TABLE questionnaire_responses DROP CONSTRAINT IF EXISTS questionnaire_responses_p8_check;
ALTER TABLE questionnaire_responses DROP CONSTRAINT IF EXISTS questionnaire_responses_p9_check;

ALTER TABLE questionnaire_responses ADD CONSTRAINT questionnaire_responses_p1_check CHECK (p1 BETWEEN 0 AND 4);
ALTER TABLE questionnaire_responses ADD CONSTRAINT questionnaire_responses_p2_check CHECK (p2 BETWEEN 0 AND 4);
ALTER TABLE questionnaire_responses ADD CONSTRAINT questionnaire_responses_p3_check CHECK (p3 BETWEEN 0 AND 4);
ALTER TABLE questionnaire_responses ADD CONSTRAINT questionnaire_responses_p4_check CHECK (p4 BETWEEN 0 AND 4);
ALTER TABLE questionnaire_responses ADD CONSTRAINT questionnaire_responses_p5_check CHECK (p5 BETWEEN 0 AND 4);
ALTER TABLE questionnaire_responses ADD CONSTRAINT questionnaire_responses_p6_check CHECK (p6 BETWEEN 0 AND 4);
ALTER TABLE questionnaire_responses ADD CONSTRAINT questionnaire_responses_p7_check CHECK (p7 BETWEEN 0 AND 4);
ALTER TABLE questionnaire_responses ADD CONSTRAINT questionnaire_responses_p8_check CHECK (p8 BETWEEN 0 AND 4);
ALTER TABLE questionnaire_responses ADD CONSTRAINT questionnaire_responses_p9_check CHECK (p9 BETWEEN 0 AND 4);

-- Symptom questions (S1-S5)
ALTER TABLE questionnaire_responses DROP CONSTRAINT IF EXISTS questionnaire_responses_s1_check;
ALTER TABLE questionnaire_responses DROP CONSTRAINT IF EXISTS questionnaire_responses_s2_check;
ALTER TABLE questionnaire_responses DROP CONSTRAINT IF EXISTS questionnaire_responses_s3_check;
ALTER TABLE questionnaire_responses DROP CONSTRAINT IF EXISTS questionnaire_responses_s4_check;
ALTER TABLE questionnaire_responses DROP CONSTRAINT IF EXISTS questionnaire_responses_s5_check;

ALTER TABLE questionnaire_responses ADD CONSTRAINT questionnaire_responses_s1_check CHECK (s1 BETWEEN 0 AND 4);
ALTER TABLE questionnaire_responses ADD CONSTRAINT questionnaire_responses_s2_check CHECK (s2 BETWEEN 0 AND 4);
ALTER TABLE questionnaire_responses ADD CONSTRAINT questionnaire_responses_s3_check CHECK (s3 BETWEEN 0 AND 4);
ALTER TABLE questionnaire_responses ADD CONSTRAINT questionnaire_responses_s4_check CHECK (s4 BETWEEN 0 AND 4);
ALTER TABLE questionnaire_responses ADD CONSTRAINT questionnaire_responses_s5_check CHECK (s5 BETWEEN 0 AND 4);

-- Stiffness questions (ST1, ST2)
ALTER TABLE questionnaire_responses DROP CONSTRAINT IF EXISTS questionnaire_responses_st1_check;
ALTER TABLE questionnaire_responses DROP CONSTRAINT IF EXISTS questionnaire_responses_st2_check;

ALTER TABLE questionnaire_responses ADD CONSTRAINT questionnaire_responses_st1_check CHECK (st1 BETWEEN 0 AND 4);
ALTER TABLE questionnaire_responses ADD CONSTRAINT questionnaire_responses_st2_check CHECK (st2 BETWEEN 0 AND 4);

-- Function questions (F1-F17)
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

ALTER TABLE questionnaire_responses ADD CONSTRAINT questionnaire_responses_f1_check CHECK (f1 BETWEEN 0 AND 4);
ALTER TABLE questionnaire_responses ADD CONSTRAINT questionnaire_responses_f2_check CHECK (f2 BETWEEN 0 AND 4);
ALTER TABLE questionnaire_responses ADD CONSTRAINT questionnaire_responses_f3_check CHECK (f3 BETWEEN 0 AND 4);
ALTER TABLE questionnaire_responses ADD CONSTRAINT questionnaire_responses_f4_check CHECK (f4 BETWEEN 0 AND 4);
ALTER TABLE questionnaire_responses ADD CONSTRAINT questionnaire_responses_f5_check CHECK (f5 BETWEEN 0 AND 4);
ALTER TABLE questionnaire_responses ADD CONSTRAINT questionnaire_responses_f6_check CHECK (f6 BETWEEN 0 AND 4);
ALTER TABLE questionnaire_responses ADD CONSTRAINT questionnaire_responses_f7_check CHECK (f7 BETWEEN 0 AND 4);
ALTER TABLE questionnaire_responses ADD CONSTRAINT questionnaire_responses_f8_check CHECK (f8 BETWEEN 0 AND 4);
ALTER TABLE questionnaire_responses ADD CONSTRAINT questionnaire_responses_f9_check CHECK (f9 BETWEEN 0 AND 4);
ALTER TABLE questionnaire_responses ADD CONSTRAINT questionnaire_responses_f10_check CHECK (f10 BETWEEN 0 AND 4);
ALTER TABLE questionnaire_responses ADD CONSTRAINT questionnaire_responses_f11_check CHECK (f11 BETWEEN 0 AND 4);
ALTER TABLE questionnaire_responses ADD CONSTRAINT questionnaire_responses_f12_check CHECK (f12 BETWEEN 0 AND 4);
ALTER TABLE questionnaire_responses ADD CONSTRAINT questionnaire_responses_f13_check CHECK (f13 BETWEEN 0 AND 4);
ALTER TABLE questionnaire_responses ADD CONSTRAINT questionnaire_responses_f14_check CHECK (f14 BETWEEN 0 AND 4);
ALTER TABLE questionnaire_responses ADD CONSTRAINT questionnaire_responses_f15_check CHECK (f15 BETWEEN 0 AND 4);
ALTER TABLE questionnaire_responses ADD CONSTRAINT questionnaire_responses_f16_check CHECK (f16 BETWEEN 0 AND 4);
ALTER TABLE questionnaire_responses ADD CONSTRAINT questionnaire_responses_f17_check CHECK (f17 BETWEEN 0 AND 4);

-- Sport/Recreation questions (SP1-SP5)
ALTER TABLE questionnaire_responses DROP CONSTRAINT IF EXISTS questionnaire_responses_sp1_check;
ALTER TABLE questionnaire_responses DROP CONSTRAINT IF EXISTS questionnaire_responses_sp2_check;
ALTER TABLE questionnaire_responses DROP CONSTRAINT IF EXISTS questionnaire_responses_sp3_check;
ALTER TABLE questionnaire_responses DROP CONSTRAINT IF EXISTS questionnaire_responses_sp4_check;
ALTER TABLE questionnaire_responses DROP CONSTRAINT IF EXISTS questionnaire_responses_sp5_check;

ALTER TABLE questionnaire_responses ADD CONSTRAINT questionnaire_responses_sp1_check CHECK (sp1 BETWEEN 0 AND 4);
ALTER TABLE questionnaire_responses ADD CONSTRAINT questionnaire_responses_sp2_check CHECK (sp2 BETWEEN 0 AND 4);
ALTER TABLE questionnaire_responses ADD CONSTRAINT questionnaire_responses_sp3_check CHECK (sp3 BETWEEN 0 AND 4);
ALTER TABLE questionnaire_responses ADD CONSTRAINT questionnaire_responses_sp4_check CHECK (sp4 BETWEEN 0 AND 4);
ALTER TABLE questionnaire_responses ADD CONSTRAINT questionnaire_responses_sp5_check CHECK (sp5 BETWEEN 0 AND 4);

-- Quality of Life questions (Q1-Q4)
ALTER TABLE questionnaire_responses DROP CONSTRAINT IF EXISTS questionnaire_responses_q1_check;
ALTER TABLE questionnaire_responses DROP CONSTRAINT IF EXISTS questionnaire_responses_q2_check;
ALTER TABLE questionnaire_responses DROP CONSTRAINT IF EXISTS questionnaire_responses_q3_check;
ALTER TABLE questionnaire_responses DROP CONSTRAINT IF EXISTS questionnaire_responses_q4_check;

ALTER TABLE questionnaire_responses ADD CONSTRAINT questionnaire_responses_q1_check CHECK (q1 BETWEEN 0 AND 4);
ALTER TABLE questionnaire_responses ADD CONSTRAINT questionnaire_responses_q2_check CHECK (q2 BETWEEN 0 AND 4);
ALTER TABLE questionnaire_responses ADD CONSTRAINT questionnaire_responses_q3_check CHECK (q3 BETWEEN 0 AND 4);
ALTER TABLE questionnaire_responses ADD CONSTRAINT questionnaire_responses_q4_check CHECK (q4 BETWEEN 0 AND 4);

-- =====================================================================
-- VERIFICATION: Check all constraints
-- =====================================================================
SELECT
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'questionnaire_responses'::regclass
  AND contype = 'c'  -- Check constraints only
  AND conname LIKE 'questionnaire_responses_%_check'
ORDER BY conname;

-- =====================================================================
-- SUMMARY: Count all question columns
-- =====================================================================
-- Expected: 42 question columns (all with 0-4 constraints)
-- P1-P9 (9), S1-S5 (5), ST1-ST2 (2), F1-F17 (17), SP1-SP5 (5), Q1-Q4 (4)
-- Total: 9 + 5 + 2 + 17 + 5 + 4 = 42 columns
SELECT
  COUNT(*) as total_check_constraints,
  COUNT(CASE WHEN pg_get_constraintdef(oid) LIKE '%BETWEEN 0 AND 4%' THEN 1 END) as constraints_0_to_4,
  COUNT(CASE WHEN pg_get_constraintdef(oid) NOT LIKE '%BETWEEN 0 AND 4%' THEN 1 END) as constraints_other
FROM pg_constraint
WHERE conrelid = 'questionnaire_responses'::regclass
  AND contype = 'c'
  AND conname LIKE 'questionnaire_responses_%_check';
