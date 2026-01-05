# STS Assessment Page Documentation

## Overview
The STS (Sit-to-Stand) Assessment page is Page 2 of the 3-page patient workflow. It collects objective functional performance data and biomechanical assessments that complement the subjective KOOS/WOMAC questionnaire data.

## Page Flow
**Previous:** [questionnaire.html](../questionnaire.html) → **Current:** [sts-assessment.html](../sts-assessment.html) → **Next:** results.html

## Data Collected

### 1. **30-Second Sit-to-Stand Test Results**
- **Field:** `repetition_count` (INTEGER, >= 0)
- **Description:** Number of complete sit-to-stand cycles performed in 30 seconds
- **Purpose:** Objective measure of lower limb functional strength and endurance

### 2. **Demographics for STS Normalization**
- **Age** (INTEGER, 18-120)
  - Used to compare against age-specific normative data
- **Gender** (male/female)
  - Different normative benchmarks for males and females

### 3. **Biomechanical Assessment**
- **Knee Alignment** (normal/valgus/varus)
  - **Normal:** No malalignment
  - **Valgus:** Knock-knees (knees collapse inward)
  - **Varus:** Bow-legged (knees bow outward)
  - **Purpose:** Target specific muscle weaknesses causing malalignment

### 4. **Core Stability Assessment**
- **Trunk Sway** (present/absent)
  - Excessive lateral or forward trunk movement during test
- **Hip Sway** (present/absent)
  - Hip instability or lateral hip shift during test
- **Purpose:** Identify need for core stability-focused exercises

## Database Schema

```sql
CREATE TABLE sts_assessments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    username VARCHAR(50) UNIQUE REFERENCES users(username),

    -- STS Test Results
    repetition_count INTEGER NOT NULL CHECK (repetition_count >= 0),

    -- Demographics
    age INTEGER NOT NULL CHECK (age BETWEEN 18 AND 120),
    gender VARCHAR(10) NOT NULL CHECK (gender IN ('male', 'female')),

    -- Biomechanics
    knee_alignment VARCHAR(10) NOT NULL CHECK (knee_alignment IN ('normal', 'valgus', 'varus')),

    -- Core Stability
    trunk_sway VARCHAR(10) NOT NULL CHECK (trunk_sway IN ('present', 'absent')),
    hip_sway VARCHAR(10) NOT NULL CHECK (hip_sway IN ('present', 'absent')),

    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

## Features

### Bilingual Support
- Full English and Traditional Chinese (zh-TW) translations
- Language toggle button
- All labels, instructions, and validation messages translated

### Form Validation
- All fields required
- Repetition count must be >= 0
- Age must be between 18-120
- Gender, knee alignment, and stability assessments must be selected

### Data Persistence
- Loads previously saved STS data if exists
- Upserts based on username (one assessment per user)
- Links to `users` table via `user_id` and `username`

### Navigation Controls
- **Back Button:** Returns to questionnaire page
- **Submit Button:** Saves data and proceeds to results page

### LocalStorage Flags
- Checks `questionnaireCompleted` flag (redirects if not completed)
- Sets `stsAssessmentCompleted` flag upon successful submission

## Clinical Significance

### STS Test Normative Data
Used in algorithm to calculate `stsScore` (0-1 scale):

| Age Range | Men Benchmark | Women Benchmark |
|-----------|---------------|-----------------|
| 60-64     | < 14          | < 12            |
| 65-69     | < 12          | < 11            |
| 70-74     | < 12          | < 10            |
| 75-79     | < 11          | < 10            |
| 80-84     | < 10          | < 9             |
| 85-89     | < 8           | < 8             |
| 90-94     | < 7           | < 4             |

**Formula:** `stsScore = Math.min(1.0, repetitionCount / benchmark)`

### Knee Alignment Impact
- **Valgus:** Boosts exercises targeting gluteus medius/minimus (hip abductors)
- **Varus:** Boosts exercises targeting hip adductors
- **Normal:** No alignment modifier (1.0x)

### Core Stability Filter
- **ANY instability present** (trunk OR hip sway) → Hard filter applied
- Exercises with `requiresCoreStability === true` are filtered out
- Safety-first approach for movement quality issues

## Usage in Algorithm

The STS assessment data is used in multiple parts of the exercise recommendation algorithm:

1. **Enhanced Combined Score** - `stsScore` weighted at 50% (vs 25% each for pain/symptoms)
2. **Alignment Modifier** - Targets muscle weaknesses based on knee alignment
3. **Core Stability Filter** - Removes unstable exercises if instability detected
4. **Conflict Resolution** - Conservative approach when objective/subjective measures disagree

## File Structure

```
sts-assessment.html              # HTML page structure
src/sts/sts-assessment.js        # Assessment logic with bilingual support
styles/patient.css               # Form styling
data/sql_scripts/create-sts-assessments-table.sql  # Database schema
```

## Future Enhancements

### Potential Automation
- **Video Analysis:** Automatic repetition counting using pose detection
- **Movement Quality:** Automated trunk/hip sway detection via computer vision
- **Alignment Detection:** Pose-based knee alignment assessment

### Currently Manual
All assessments currently require manual input from clinician or patient.

## Testing Checklist

- [ ] Navigate from completed questionnaire page
- [ ] Test language toggle (English ↔ Chinese)
- [ ] Fill in all fields and submit
- [ ] Verify data saves to Supabase
- [ ] Confirm redirect to results page
- [ ] Test back button functionality
- [ ] Verify previously saved data loads on revisit
- [ ] Test validation messages
- [ ] Check responsive design on mobile

## API Integration

### Save Assessment
```javascript
const stsData = {
  user_id: userData.id,
  username: currentUser,
  repetition_count: assessmentData.repetition_count,
  age: assessmentData.age,
  gender: assessmentData.gender,
  knee_alignment: assessmentData.knee_alignment,
  trunk_sway: assessmentData.trunk_sway,
  hip_sway: assessmentData.hip_sway
};

const { error } = await supabase
  .from('sts_assessments')
  .upsert(stsData, { onConflict: 'username' });
```

### Load Previous Assessment
```javascript
const { data, error } = await supabase
  .from('sts_assessments')
  .select('*')
  .eq('username', currentUser)
  .order('created_at', { ascending: false })
  .limit(1)
  .single();
```
