-- =====================================================================
-- Table: patient_demographics
-- Description: Patient demographic information (age, gender, height, weight)
-- =====================================================================

CREATE TABLE IF NOT EXISTS patient_demographics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    date_of_birth DATE NOT NULL,
    gender TEXT NOT NULL CHECK (gender IN ('Male', 'Female')),
    height_cm NUMERIC NOT NULL CHECK (height_cm > 0 AND height_cm <= 300),
    weight_kg NUMERIC NOT NULL CHECK (weight_kg > 0 AND weight_kg <= 500),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,

    -- Foreign key
    CONSTRAINT fk_patient_demographics_username
        FOREIGN KEY (username)
        REFERENCES users(username)
        ON DELETE CASCADE
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_patient_demographics_username ON patient_demographics(username);

-- Comments
COMMENT ON TABLE patient_demographics IS 'Patient demographic data for assessment calculations';
COMMENT ON COLUMN patient_demographics.gender IS 'Patient gender (Male/Female) - used for STS benchmarking';
COMMENT ON COLUMN patient_demographics.date_of_birth IS 'Date of birth - used to calculate age for STS normative data';
