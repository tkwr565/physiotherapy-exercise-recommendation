-- =====================================================================
-- MASTER MIGRATION SCRIPT
-- Physiotherapy Exercise Recommendation System - Database Setup
-- =====================================================================
--
-- This script runs all migrations in the correct order.
-- Run this file in Supabase SQL Editor to set up a fresh database.
--
-- Tables created:
-- 1. users                     - User accounts
-- 2. patient_demographics      - Patient demographic data
-- 3. questionnaire_responses   - KOOS/WOMAC questionnaire (10-minute assessment)
-- 4. sts_assessments          - 30-second Sit-to-Stand test results
-- 5. exercises                - Exercise database (33 exercises)
--
-- =====================================================================

-- Enable UUID extension for patient_demographics
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Run migrations in order
\i 01_create_users_table.sql
\i 02_create_patient_demographics_table.sql
\i 03_create_questionnaire_responses_table.sql
\i 04_create_sts_assessments_table.sql
\i 05_create_exercises_table.sql

-- =====================================================================
-- NEXT STEPS:
-- =====================================================================
-- 1. Import exercise data from: database/seeds/exercises.csv
--    - Use Supabase dashboard: Database → Tables → exercises → Insert → Import CSV
--
-- 2. Set up Row Level Security (RLS) policies if needed
--
-- 3. Verify all tables were created:
--    SELECT table_name FROM information_schema.tables
--    WHERE table_schema = 'public'
--    ORDER BY table_name;
-- =====================================================================
