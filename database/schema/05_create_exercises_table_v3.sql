-- =====================================================================
-- EXERCISE DATABASE SCHEMA V3.0 - Normalized Design
-- Description: Properly normalized PostgreSQL schema for exercise data
-- Preserves all information from Excel without data loss
-- =====================================================================

-- =====================================================================
-- Main Table: exercises
-- Core exercise information
-- =====================================================================
CREATE TABLE IF NOT EXISTS exercises (
    id SERIAL PRIMARY KEY,

    -- Exercise names (bilingual)
    exercise_name VARCHAR(100) NOT NULL UNIQUE,
    exercise_name_ch VARCHAR(100),

    -- Difficulty
    difficulty_level INTEGER NOT NULL CHECK (difficulty_level BETWEEN 1 AND 10),
    difficulty_category VARCHAR(50) NOT NULL,
    -- Categories: beginner, beginner_to_intermediate, intermediate, intermediate_to_advance, advance

    -- Core stability requirements
    core_ipsi BOOLEAN DEFAULT FALSE,
    core_contra BOOLEAN DEFAULT FALSE,

    -- Flexibility requirement
    toe_touch BOOLEAN DEFAULT FALSE,

    -- Clinical notes
    clinical_summary TEXT,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================
-- Table: exercise_positions
-- Junction table for exercise positions (many-to-many)
-- One exercise can be performed in multiple positions
-- =====================================================================
CREATE TABLE IF NOT EXISTS exercise_positions (
    id SERIAL PRIMARY KEY,
    exercise_id INTEGER NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
    position VARCHAR(50) NOT NULL,
    -- Valid positions: SL_stand, split_stand, DL_stand, quadruped, supine_lying, side_lying

    UNIQUE(exercise_id, position),
    CHECK (position IN ('SL_stand', 'split_stand', 'DL_stand', 'quadruped', 'supine_lying', 'side_lying'))
);

-- =====================================================================
-- Table: exercise_muscles
-- Detailed muscle recruitment data
-- Preserves muscle type (P=Primary, N=Secondary, S=Stabiliser) and intensity value (0-5)
-- =====================================================================
CREATE TABLE IF NOT EXISTS exercise_muscles (
    id SERIAL PRIMARY KEY,
    exercise_id INTEGER NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
    muscle VARCHAR(50) NOT NULL,
    -- Valid muscles: quad, hamstring, glute_max, hip_flexors, glute_med_min, adductors
    muscle_type CHAR(1) NOT NULL,
    -- P = Primary mover, N = Secondary mover, S = Stabiliser
    muscle_value INTEGER NOT NULL CHECK (muscle_value BETWEEN 0 AND 5),

    UNIQUE(exercise_id, muscle),
    CHECK (muscle IN ('quad', 'hamstring', 'glute_max', 'hip_flexors', 'glute_med_min', 'adductors')),
    CHECK (muscle_type IN ('P', 'N', 'S'))
);

-- =====================================================================
-- Table: exercise_progressions
-- Exercise progression relationships
-- =====================================================================
CREATE TABLE IF NOT EXISTS exercise_progressions (
    id SERIAL PRIMARY KEY,
    exercise_id INTEGER NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
    related_exercise_name VARCHAR(100) NOT NULL,
    -- We store the name instead of ID to handle cases where the related exercise might not exist yet
    progression_type VARCHAR(20) NOT NULL,
    -- 'progression' = harder exercise, 'regression' = easier exercise

    CHECK (progression_type IN ('progression', 'regression'))
);

-- =====================================================================
-- Table: exercise_safety_constraints
-- Safety flags for exercises
-- =====================================================================
CREATE TABLE IF NOT EXISTS exercise_safety_constraints (
    id SERIAL PRIMARY KEY,
    exercise_id INTEGER NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
    constraint_type VARCHAR(50) NOT NULL,
    -- Valid types: Kneeling, Weight_bear, Core_stability

    UNIQUE(exercise_id, constraint_type),
    CHECK (constraint_type IN ('Kneeling', 'Weight_bear', 'Core_stability'))
);

-- =====================================================================
-- Table: exercise_sports
-- Sport similarity associations
-- =====================================================================
CREATE TABLE IF NOT EXISTS exercise_sports (
    id SERIAL PRIMARY KEY,
    exercise_id INTEGER NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
    sport VARCHAR(50) NOT NULL,
    -- Examples: running, hiking, cycling, swimming, dancing, racket sports

    UNIQUE(exercise_id, sport)
);

-- =====================================================================
-- Indexes for Performance
-- =====================================================================
CREATE INDEX IF NOT EXISTS idx_exercises_difficulty_level ON exercises(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_exercises_difficulty_category ON exercises(difficulty_category);
CREATE INDEX IF NOT EXISTS idx_exercises_name ON exercises(exercise_name);

CREATE INDEX IF NOT EXISTS idx_exercise_positions_exercise_id ON exercise_positions(exercise_id);
CREATE INDEX IF NOT EXISTS idx_exercise_positions_position ON exercise_positions(position);

CREATE INDEX IF NOT EXISTS idx_exercise_muscles_exercise_id ON exercise_muscles(exercise_id);
CREATE INDEX IF NOT EXISTS idx_exercise_muscles_muscle ON exercise_muscles(muscle);
CREATE INDEX IF NOT EXISTS idx_exercise_muscles_type ON exercise_muscles(muscle_type);

CREATE INDEX IF NOT EXISTS idx_exercise_progressions_exercise_id ON exercise_progressions(exercise_id);
CREATE INDEX IF NOT EXISTS idx_exercise_progressions_related ON exercise_progressions(related_exercise_name);

CREATE INDEX IF NOT EXISTS idx_exercise_safety_exercise_id ON exercise_safety_constraints(exercise_id);
CREATE INDEX IF NOT EXISTS idx_exercise_sports_exercise_id ON exercise_sports(exercise_id);

-- =====================================================================
-- Comments for Documentation
-- =====================================================================
COMMENT ON TABLE exercises IS 'Main exercise table with core information (normalized schema v3.0)';
COMMENT ON TABLE exercise_positions IS 'Exercise positions - junction table supporting multiple positions per exercise';
COMMENT ON TABLE exercise_muscles IS 'Muscle recruitment data with type (P/N/S) and intensity (0-5)';
COMMENT ON TABLE exercise_progressions IS 'Exercise progression and regression relationships';
COMMENT ON TABLE exercise_safety_constraints IS 'Safety constraint flags for exercises';
COMMENT ON TABLE exercise_sports IS 'Sport similarity associations';

COMMENT ON COLUMN exercises.exercise_name IS 'Exercise name in English (unique identifier)';
COMMENT ON COLUMN exercises.exercise_name_ch IS 'Exercise name in Traditional Chinese (繁體中文)';
COMMENT ON COLUMN exercises.difficulty_level IS 'Exercise difficulty (1=easiest, 10=hardest)';
COMMENT ON COLUMN exercises.difficulty_category IS 'Difficulty category: beginner, beginner_to_intermediate, intermediate, intermediate_to_advance, advance';
COMMENT ON COLUMN exercises.core_ipsi IS 'Requires ipsilateral core stability';
COMMENT ON COLUMN exercises.core_contra IS 'Requires contralateral core stability';
COMMENT ON COLUMN exercises.toe_touch IS 'Targets toe touch flexibility (posterior chain)';

COMMENT ON COLUMN exercise_muscles.muscle_type IS 'P=Primary mover, N=Secondary mover, S=Stabiliser';
COMMENT ON COLUMN exercise_muscles.muscle_value IS 'Muscle recruitment intensity (0-5 scale)';

COMMENT ON COLUMN exercise_progressions.progression_type IS 'progression=harder exercise, regression=easier exercise';
