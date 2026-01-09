-- =====================================================================
-- SUPABASE DATABASE MIGRATION SCRIPT
-- Physiotherapy Exercise Recommendation System - Version 2
-- =====================================================================
--
-- HOW TO RUN THIS MIGRATION:
-- 1. Go to your Supabase project dashboard (https://app.supabase.com)
-- 2. Click on "SQL Editor" in the left sidebar
-- 3. Click "New query" button
-- 4. Copy and paste this ENTIRE file into the SQL editor
-- 5. Click "Run" button (or press Ctrl+Enter)
-- 6. Check for any error messages - all statements should succeed
-- 7. Verify tables were created: Go to "Table Editor" and check for:
--    - users
--    - questionnaire_responses
--    - sts_assessments
--    - exercises (updated structure)
--
-- NOTE: This script will DROP the old 'assessments' table and create
-- new tables. Make sure you have backed up any important data first!
-- =====================================================================

-- =====================================================================
-- STEP 1: Clean up old schema (drop old assessments table)
-- =====================================================================

DROP TABLE IF EXISTS assessments CASCADE;

-- =====================================================================
-- STEP 2: Create new users table
-- =====================================================================

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for faster username lookups
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Add comment for documentation
COMMENT ON TABLE users IS 'User accounts for the physiotherapy assessment system';
COMMENT ON COLUMN users.username IS 'Unique username for authentication';

-- =====================================================================
-- STEP 3: Create questionnaire_responses table
-- =====================================================================

CREATE TABLE IF NOT EXISTS questionnaire_responses (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    username VARCHAR(50) REFERENCES users(username) ON DELETE CASCADE,

    -- Function Questions (F1-F17)
    F1 INTEGER CHECK (F1 BETWEEN 1 AND 4),
    F2 INTEGER CHECK (F2 BETWEEN 1 AND 4),
    F3 INTEGER CHECK (F3 BETWEEN 1 AND 4),
    F4 INTEGER CHECK (F4 BETWEEN 1 AND 4),
    F5 INTEGER CHECK (F5 BETWEEN 1 AND 4),
    F6 INTEGER CHECK (F6 BETWEEN 1 AND 4),
    F7 INTEGER CHECK (F7 BETWEEN 1 AND 4),
    F8 INTEGER CHECK (F8 BETWEEN 1 AND 4),
    F9 INTEGER CHECK (F9 BETWEEN 1 AND 4),
    F10 INTEGER CHECK (F10 BETWEEN 1 AND 4),
    F11 INTEGER CHECK (F11 BETWEEN 1 AND 4),
    F12 INTEGER CHECK (F12 BETWEEN 1 AND 4),
    F13 INTEGER CHECK (F13 BETWEEN 1 AND 4),
    F14 INTEGER CHECK (F14 BETWEEN 1 AND 4),
    F15 INTEGER CHECK (F15 BETWEEN 1 AND 4),
    F16 INTEGER CHECK (F16 BETWEEN 1 AND 4),
    F17 INTEGER CHECK (F17 BETWEEN 1 AND 4),

    -- Pain Questions (P1-P9)
    P1 INTEGER CHECK (P1 BETWEEN 1 AND 4),
    P2 INTEGER CHECK (P2 BETWEEN 1 AND 4),
    P3 INTEGER CHECK (P3 BETWEEN 1 AND 4),
    P4 INTEGER CHECK (P4 BETWEEN 1 AND 4),
    P5 INTEGER CHECK (P5 BETWEEN 1 AND 4),
    P6 INTEGER CHECK (P6 BETWEEN 1 AND 4),
    P7 INTEGER CHECK (P7 BETWEEN 1 AND 4),
    P8 INTEGER CHECK (P8 BETWEEN 1 AND 4),
    P9 INTEGER CHECK (P9 BETWEEN 1 AND 4),

    -- Sport/Position Questions (SP1-SP5)
    SP1 INTEGER CHECK (SP1 BETWEEN 1 AND 4),
    SP2 INTEGER CHECK (SP2 BETWEEN 1 AND 4),
    SP3 INTEGER CHECK (SP3 BETWEEN 1 AND 4),
    SP4 INTEGER CHECK (SP4 BETWEEN 1 AND 4),
    SP5 INTEGER CHECK (SP5 BETWEEN 1 AND 4),

    -- Stiffness Questions (ST2)
    ST2 INTEGER CHECK (ST2 BETWEEN 1 AND 4),

    -- NEW: Flexibility Assessment
    toe_touch_test VARCHAR(10) CHECK (toe_touch_test IN ('can', 'cannot')),

    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for faster username lookups
CREATE INDEX IF NOT EXISTS idx_questionnaire_username ON questionnaire_responses(username);

-- Add unique constraint - one questionnaire per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_questionnaire_unique_user ON questionnaire_responses(username);

-- Add comment for documentation
COMMENT ON TABLE questionnaire_responses IS 'KOOS/WOMAC questionnaire responses (30 questions) plus toe touch flexibility test';
COMMENT ON COLUMN questionnaire_responses.toe_touch_test IS 'Can the user touch their toes with straight legs? (can/cannot)';

-- =====================================================================
-- STEP 4: Create sts_assessments table
-- =====================================================================

CREATE TABLE IF NOT EXISTS sts_assessments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    username VARCHAR(50) REFERENCES users(username) ON DELETE CASCADE,

    -- STS Test Results
    repetition_count INTEGER CHECK (repetition_count >= 0),

    -- Demographics for STS Normalization
    age INTEGER CHECK (age BETWEEN 18 AND 120),
    gender VARCHAR(10) CHECK (gender IN ('male', 'female')),

    -- Manual Assessment Inputs
    knee_alignment VARCHAR(10) CHECK (knee_alignment IN ('normal', 'valgus', 'varus')),
    trunk_sway VARCHAR(10) CHECK (trunk_sway IN ('present', 'absent')),
    hip_sway VARCHAR(10) CHECK (hip_sway IN ('present', 'absent')),

    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for faster username lookups
CREATE INDEX IF NOT EXISTS idx_sts_username ON sts_assessments(username);

-- Add unique constraint - one STS assessment per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_sts_unique_user ON sts_assessments(username);

-- Add comments for documentation
COMMENT ON TABLE sts_assessments IS '30-second Sit-to-Stand test results plus biomechanical assessments';
COMMENT ON COLUMN sts_assessments.repetition_count IS 'Number of sit-to-stand repetitions completed in 30 seconds';
COMMENT ON COLUMN sts_assessments.knee_alignment IS 'Knee alignment during movement (normal/valgus/varus)';
COMMENT ON COLUMN sts_assessments.trunk_sway IS 'Trunk instability observed during movement';
COMMENT ON COLUMN sts_assessments.hip_sway IS 'Hip instability observed during movement';

-- =====================================================================
-- STEP 5: Create/Update exercises table
-- =====================================================================

-- Drop old exercises table if it exists (to update structure)
DROP TABLE IF EXISTS exercises CASCADE;

CREATE TABLE exercises (
    id SERIAL PRIMARY KEY,
    exercise_name VARCHAR(100) NOT NULL,

    -- Position Categories (Boolean flags)
    position_sl_stand BOOLEAN DEFAULT FALSE,
    position_split_stand BOOLEAN DEFAULT FALSE,
    position_dl_stand BOOLEAN DEFAULT FALSE,
    position_quadruped BOOLEAN DEFAULT FALSE,
    position_supine_lying BOOLEAN DEFAULT FALSE,
    position_side_lying BOOLEAN DEFAULT FALSE,

    -- Muscle Recruitment (0-5 Scale)
    muscle_quad INTEGER CHECK (muscle_quad BETWEEN 0 AND 5) DEFAULT 0,
    muscle_hamstring INTEGER CHECK (muscle_hamstring BETWEEN 0 AND 5) DEFAULT 0,
    muscle_glute_max INTEGER CHECK (muscle_glute_max BETWEEN 0 AND 5) DEFAULT 0,
    muscle_hip_flexors INTEGER CHECK (muscle_hip_flexors BETWEEN 0 AND 5) DEFAULT 0,
    muscle_glute_med_min INTEGER CHECK (muscle_glute_med_min BETWEEN 0 AND 5) DEFAULT 0,
    muscle_adductors INTEGER CHECK (muscle_adductors BETWEEN 0 AND 5) DEFAULT 0,

    -- Core Stability Flags
    core_ipsi BOOLEAN DEFAULT FALSE,
    core_contra BOOLEAN DEFAULT FALSE,

    -- Difficulty Level (1-10 scale)
    difficulty_level INTEGER CHECK (difficulty_level BETWEEN 1 AND 10) NOT NULL,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add comments for documentation
COMMENT ON TABLE exercises IS 'Exercise database with biomechanical targeting information';
COMMENT ON COLUMN exercises.muscle_glute_med_min IS 'Targets valgus knee alignment (0-5 recruitment scale)';
COMMENT ON COLUMN exercises.muscle_adductors IS 'Targets varus knee alignment (0-5 recruitment scale)';
COMMENT ON COLUMN exercises.muscle_hamstring IS 'Targets flexibility deficit - hamstrings (0-5 recruitment scale)';
COMMENT ON COLUMN exercises.muscle_glute_max IS 'Targets flexibility deficit - glute max (0-5 recruitment scale)';
COMMENT ON COLUMN exercises.core_ipsi IS 'Requires ipsilateral core stability (same-side)';
COMMENT ON COLUMN exercises.core_contra IS 'Requires contralateral core stability (cross-pattern)';
COMMENT ON COLUMN exercises.difficulty_level IS 'Exercise difficulty on 1-10 scale';

-- =====================================================================
-- STEP 6: Create RLS (Row Level Security) Policies
-- =====================================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE questionnaire_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE sts_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;

-- Allow public read access to exercises (no authentication needed)
CREATE POLICY "Allow public read access to exercises"
    ON exercises FOR SELECT
    TO public
    USING (true);

-- Allow public insert/update/delete for users (simple username auth)
CREATE POLICY "Allow public access to users"
    ON users FOR ALL
    TO public
    USING (true)
    WITH CHECK (true);

-- Allow public insert/update/delete for questionnaire_responses
CREATE POLICY "Allow public access to questionnaire_responses"
    ON questionnaire_responses FOR ALL
    TO public
    USING (true)
    WITH CHECK (true);

-- Allow public insert/update/delete for sts_assessments
CREATE POLICY "Allow public access to sts_assessments"
    ON sts_assessments FOR ALL
    TO public
    USING (true)
    WITH CHECK (true);

-- =====================================================================
-- STEP 7: Create trigger to auto-update updated_at timestamp
-- =====================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================================
-- MIGRATION COMPLETE!
-- =====================================================================
--
-- Next steps:
-- 1. Verify tables were created successfully in "Table Editor"
-- 2. Prepare your exercises CSV file (exercises_ver2.csv)
-- 3. Upload exercise data via Supabase Table Editor or CSV import
-- 4. Test the application with the new schema
--
-- =====================================================================
