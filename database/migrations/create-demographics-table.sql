-- Create patient_demographics table
-- Stores demographic information for all patients
-- Created: 2026-01-13

CREATE TABLE IF NOT EXISTS patient_demographics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL UNIQUE REFERENCES users(username) ON DELETE CASCADE,
  date_of_birth DATE NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('male', 'female')),
  height_cm DECIMAL(5,2) NOT NULL CHECK (height_cm > 0 AND height_cm < 300),
  weight_kg DECIMAL(5,2) NOT NULL CHECK (weight_kg > 0 AND weight_kg < 500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create index on username for faster lookups
CREATE INDEX IF NOT EXISTS idx_patient_demographics_username ON patient_demographics(username);

-- Enable Row Level Security
ALTER TABLE patient_demographics ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations for now
-- In production, you should restrict this based on authentication
CREATE POLICY "Allow all operations on patient_demographics" ON patient_demographics
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Add trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_patient_demographics_updated_at
  BEFORE UPDATE ON patient_demographics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments
COMMENT ON TABLE patient_demographics IS 'Stores demographic information for patients including DOB, gender, height, and weight';
COMMENT ON COLUMN patient_demographics.date_of_birth IS 'Patient date of birth for age calculation';
COMMENT ON COLUMN patient_demographics.gender IS 'Patient gender (male or female) - required for STS normative benchmarks';
COMMENT ON COLUMN patient_demographics.height_cm IS 'Height in centimeters';
COMMENT ON COLUMN patient_demographics.weight_kg IS 'Weight in kilograms';
