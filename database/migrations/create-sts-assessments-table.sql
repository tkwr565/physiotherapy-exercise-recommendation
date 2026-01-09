-- =====================================================================
-- CREATE STS ASSESSMENTS TABLE
-- =====================================================================
-- Stores 30-second Sit-to-Stand test results and related assessments
-- =====================================================================

CREATE TABLE IF NOT EXISTS sts_assessments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    username VARCHAR(50) UNIQUE REFERENCES users(username) ON DELETE CASCADE,

    -- STS Test Results
    repetition_count INTEGER NOT NULL CHECK (repetition_count >= 0),

    -- Demographics for STS Normalization
    age INTEGER NOT NULL CHECK (age BETWEEN 18 AND 120),
    gender VARCHAR(10) NOT NULL CHECK (gender IN ('male', 'female')),

    -- Biomechanical Assessment
    knee_alignment VARCHAR(10) NOT NULL CHECK (knee_alignment IN ('normal', 'valgus', 'varus')),

    -- Core Stability Assessment
    trunk_sway VARCHAR(10) NOT NULL CHECK (trunk_sway IN ('present', 'absent')),
    hip_sway VARCHAR(10) NOT NULL CHECK (hip_sway IN ('present', 'absent')),

    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index on username for faster lookups
CREATE INDEX IF NOT EXISTS idx_sts_assessments_username ON sts_assessments(username);

-- Create index on user_id for faster joins
CREATE INDEX IF NOT EXISTS idx_sts_assessments_user_id ON sts_assessments(user_id);

-- Verify table creation
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'sts_assessments'
ORDER BY ordinal_position;
