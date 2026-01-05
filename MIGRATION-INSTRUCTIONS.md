# Database Migration Instructions - Step by Step

## Overview
This guide will walk you through updating your Supabase database schema using the SQL Editor on the Supabase web interface.

---

## Step 1: Access Supabase SQL Editor

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Log in to your account
3. Select your project for this physiotherapy app
4. In the left sidebar, click on **"SQL Editor"** (looks like a document/code icon)

---

## Step 2: Open the Migration File

1. Open the file `database-migration.sql` in this project folder
2. Select **ALL** the content (Ctrl+A or Cmd+A)
3. Copy it to your clipboard (Ctrl+C or Cmd+C)

---

## Step 3: Create New Query in Supabase

1. In the Supabase SQL Editor, click the **"New query"** button (usually in the top right)
2. You'll see an empty SQL editor window
3. Paste the entire migration script (Ctrl+V or Cmd+V)

---

## Step 4: Run the Migration

1. Click the **"Run"** button (or press Ctrl+Enter / Cmd+Enter)
2. Wait for the script to execute (should take 5-10 seconds)
3. Check the output panel at the bottom:
   - ✅ **Success**: You should see "Success. No rows returned"
   - ❌ **Error**: If you see any red error messages, copy them and let me know

---

## Step 5: Verify Tables Were Created

1. In the left sidebar, click on **"Table Editor"**
2. You should see the following tables:
   - ✅ **users** - User accounts
   - ✅ **questionnaire_responses** - KOOS/WOMAC + toe touch data
   - ✅ **sts_assessments** - STS test + alignment data
   - ✅ **exercises** - Exercise database (empty for now)
   - ❌ **assessments** - This OLD table should be GONE

---

## Step 6: Verify Table Structure

### Check `users` table:
1. Click on "users" in Table Editor
2. Click the "⚙️" icon or "Definition" tab
3. You should see columns:
   - `id` (int8)
   - `username` (varchar)
   - `created_at` (timestamptz)
   - `updated_at` (timestamptz)

### Check `questionnaire_responses` table:
1. Click on "questionnaire_responses"
2. You should see columns:
   - `id`, `user_id`, `username`
   - `F1` through `F17` (all int4)
   - `P1` through `P9` (all int4)
   - `SP1` through `SP5` (all int4)
   - `ST2` (int4)
   - `toe_touch_test` (varchar) ⭐ **NEW**
   - `completed_at`, `created_at`

### Check `sts_assessments` table:
1. Click on "sts_assessments"
2. You should see columns:
   - `id`, `user_id`, `username`
   - `repetition_count` (int4)
   - `age` (int4)
   - `gender` (varchar)
   - `knee_alignment` (varchar) ⭐ **NEW**
   - `trunk_sway` (varchar) ⭐ **NEW**
   - `hip_sway` (varchar) ⭐ **NEW**
   - `completed_at`, `created_at`

### Check `exercises` table:
1. Click on "exercises"
2. You should see columns:
   - `id`, `exercise_name`
   - Position flags: `position_sl_stand`, `position_split_stand`, `position_dl_stand`, `position_quadruped`, `position_supine_lying`, `position_side_lying` (all bool)
   - Muscle recruitment: `muscle_quad`, `muscle_hamstring`, `muscle_glute_max`, `muscle_hip_flexors`, `muscle_glute_med_min`, `muscle_adductors` (all int4)
   - Core flags: `core_ipsi`, `core_contra` (all bool) ⭐ **NEW**
   - `difficulty_level` (int4)
   - `created_at`

---

## Step 7: Next Steps

After verifying the tables are created correctly:

1. ✅ **Mark Step 1 as COMPLETE**
2. 📋 **Next**: We'll import the exercise data from `exercises_ver2.csv`
3. 💻 **Then**: We'll start building the new frontend pages

---

## Troubleshooting

### Error: "relation already exists"
- One of the tables already exists
- Either drop the existing tables manually first, or let me know which table is conflicting

### Error: "permission denied"
- Make sure you're logged in as the project owner
- Check that you selected the correct project

### Error: "syntax error"
- Make sure you copied the ENTIRE SQL file
- Try copying again and pasting into a fresh SQL Editor window

### Table shows up but columns are missing
- Click the refresh button in Table Editor
- Or try closing and reopening the Table Editor

---

## What This Migration Does

1. **Drops** the old `assessments` table (no longer needed)
2. **Creates** `users` table for username-based authentication
3. **Creates** `questionnaire_responses` table with toe touch test
4. **Creates** `sts_assessments` table with biomechanical data
5. **Creates** new `exercises` table with alignment/flexibility targeting
6. **Enables** Row Level Security (RLS) with public access policies
7. **Adds** indexes for faster queries
8. **Adds** documentation comments on all tables/columns

---

## Ready to Proceed?

Once you've successfully run the migration and verified the tables:
1. Take a screenshot of your Table Editor showing the 4 new tables
2. Let me know "Migration complete!"
3. I'll guide you through the next step (importing exercise data)
