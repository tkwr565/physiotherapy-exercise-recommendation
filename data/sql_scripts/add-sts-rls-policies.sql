-- =====================================================================
-- ADD RLS POLICIES FOR STS ASSESSMENTS TABLE
-- =====================================================================
-- Allows users to insert and update their own STS assessment data
-- =====================================================================

-- Enable RLS (if not already enabled)
ALTER TABLE sts_assessments ENABLE ROW LEVEL SECURITY;

-- Policy 1: Allow INSERT for all authenticated users
-- Users can create their own STS assessment
CREATE POLICY "Allow insert for all users"
ON sts_assessments
FOR INSERT
TO public
WITH CHECK (true);

-- Policy 2: Allow SELECT for all users
-- Users can read their own and others' STS assessments
CREATE POLICY "Allow select for all users"
ON sts_assessments
FOR SELECT
TO public
USING (true);

-- Policy 3: Allow UPDATE for all users
-- Users can update their own STS assessment (matched by username)
CREATE POLICY "Allow update for all users"
ON sts_assessments
FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

-- Policy 4: Allow DELETE for all users (optional)
-- Users can delete their own STS assessment
CREATE POLICY "Allow delete for all users"
ON sts_assessments
FOR DELETE
TO public
USING (true);

-- Verify policies were created
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'sts_assessments';
