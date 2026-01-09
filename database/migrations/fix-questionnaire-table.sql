-- =====================================================================
-- FIX: Drop and recreate questionnaire_responses table
-- =====================================================================
-- This will delete any existing data in the table!
-- Run this in Supabase SQL Editor
-- =====================================================================

-- Drop the table completely
DROP TABLE IF EXISTS questionnaire_responses CASCADE;

-- Recreate with correct structure
CREATE TABLE questionnaire_responses (
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

    -- Flexibility Assessment
    toe_touch_test VARCHAR(10) CHECK (toe_touch_test IN ('can', 'cannot')),

    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for faster username lookups
CREATE INDEX idx_questionnaire_username ON questionnaire_responses(username);

-- Add unique constraint - one questionnaire per user
CREATE UNIQUE INDEX idx_questionnaire_unique_user ON questionnaire_responses(username);

-- Enable RLS
ALTER TABLE questionnaire_responses ENABLE ROW LEVEL SECURITY;

-- Allow public access
CREATE POLICY "Allow public access to questionnaire_responses"
    ON questionnaire_responses FOR ALL
    TO public
    USING (true)
    WITH CHECK (true);

-- Add comments
COMMENT ON TABLE questionnaire_responses IS 'KOOS/WOMAC questionnaire responses (30 questions) plus toe touch flexibility test';
COMMENT ON COLUMN questionnaire_responses.toe_touch_test IS 'Can the user touch their toes with straight legs? (can/cannot)';

-- Verify table was created
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'questionnaire_responses'
ORDER BY ordinal_position;
