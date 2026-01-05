# OA Knee Exercise Recommendation Algorithm - Improvements Summary

## Overview

This document summarizes the major improvements made to the knee osteoarthritis exercise recommendation algorithm, transforming it from a composite scoring system to a streamlined single-machine workflow with objective performance integration and two-layer exercise ranking.

---

## 🏗️ **Major Architecture Changes**

### **System Workflow Transformation**

#### **Before: Two-Component System**
```
Patient Mobile App → Questionnaire → Database → QR Code
                                        ↓
Physiotherapist Web App → QR Scanner → Muscle Assessment → Exercise Recommendations
```

#### **After: Single-Machine Workflow**
```
Patient/Clinician Interface → Questionnaire → STS Input → Exercise Recommendations
```

### **Removed Components**
- ❌ **Physiotherapist separate webpage**
- ❌ **QR code generation and scanning**
- ❌ **Database for patient data storage**
- ❌ **Individual muscle strength assessments**
- ❌ **Muscle deficit/recruitment scoring**

### **New Streamlined Process**
1. **Page 1:** Patient completes 30-question KOOS/WOMAC questionnaire + toe touch flexibility test
2. **Page 2:** STS assessment (repetitions, age, gender, knee alignment, core stability - all manual input)
3. **Page 3:** Exercise recommendations using three-layer ranking with comprehensive biomechanical targeting

---

## 🔄 **Major Algorithmic Changes**

### **1. Two-Layer Exercise Ranking System**

#### **Before: Single Final Score**
```javascript
// Everything multiplied together
finalScore = deficitRecruitmentScore × positionMultiplier × difficultyModifier
// Then sort all exercises by final score
```

#### **After: Position-First Ranking**
```javascript
// Layer 1: Rank positions by capability (primary sort)
positionRanking = positions.sortByMultiplier().slice(0, 2)  // Top 2 positions

// Layer 2: Rank exercises within each position by difficulty preference
for each position {
    exerciseScores = exercises.map(ex => calculateDifficultyModifier(combinedScore, ex.difficulty))
    topExercises = exercises.sortByDifficultyScore().slice(0, 2)  // Top 2 per position
}
```

### **2. Simplified Scoring (No Muscle Component)**

#### **Before: Complex Multi-Factor Scoring**
```javascript
// Required muscle strength assessments + questionnaire + STS
finalScore = muscleDeficitRecruitment × positionMultiplier × difficultyModifier
```

#### **After: Streamlined Difficulty-Only Scoring**
```javascript
// Only questionnaire + STS needed
// Position multipliers used for position ranking (Layer 1)
// Difficulty scoring used within positions (Layer 2)
exerciseScore = calculateDifficultyModifier(enhancedCombinedScore, exercise.difficulty)
```

### **3. Enhanced Difficulty Scoring with Objective Performance**

#### **Before: Subjective Pain/Symptoms Only**
```javascript
// Pain and symptoms only (subjective)
combinedScore = (painAvg × 0.5) + (symptomsAvg × 0.5)
combinedScore = (4 - combinedScore) / 4  // Invert to 0-1
```

#### **After: Objective STS + Subjective with Conflict Resolution**
```javascript
// Includes objective performance data
function calculateEnhancedCombinedScore(painAvg, symptomsAvg, stsScore) {
    // Invert pain/symptoms (higher questionnaire score = worse)
    const painScore = (4 - painAvg) / 4;
    const symptomScore = (4 - symptomsAvg) / 4;
    
    // Combined subjective experience
    const subjectiveScore = (painScore * 0.5) + (symptomScore * 0.5);
    
    // Base calculation: 50% performance, 25% pain, 25% symptoms
    let combinedScore = (stsScore * 0.5) + (painScore * 0.25) + (symptomScore * 0.25);
    
    // Conflict Resolution: Objective vs Subjective
    if (Math.abs(stsScore - subjectiveScore) > 0.5) {
        const conservativeScore = Math.min(stsScore, subjectiveScore);
        combinedScore = (conservativeScore * 0.6) + (combinedScore * 0.4);
    }
    
    // Floor/Ceiling Effects
    combinedScore = Math.max(0.1, Math.min(0.9, combinedScore));
    
    return combinedScore;
}
```

---

## 🎯 **Position Multiplier Calculation**

### **Simplified Approach**
- **Removed:** Pain and symptom questions from position scoring
- **Focus:** Pure functional ability per position

### **Position-Specific Question Mapping**
```javascript
const positions = {
    DL_stand: {questions: ["F3", "F4", "F5", "F6", "F8", "SP1"], count: 6},
    split_stand: {questions: ["F1", "F2", "F3", "F7", "F13", "F15", "SP1", "SP4"], count: 8}, 
    SL_stand: {questions: ["F1", "F2", "F4", "F9", "F11", "SP1", "SP2", "SP3", "SP4"], count: 9},
    quadruped: {questions: ["F5", "SP5", "ST2", "P3", "P4"], count: 5}
};

// Calculate averages and convert to multipliers (0-1 scale)
for (const position of Object.keys(positions)) {
    const coreAvg = calculateAverage(positions[position].questions);
    const multiplier = (4 - coreAvg) / 4;
}

// Special lying calculation: inverse of best active position  
const bestActiveMultiplier = Math.max(DL, split, SL, quadruped multipliers);
const lyingMultiplier = Math.max(0.1, 1.0 - bestActiveMultiplier);
```

### **Exercise Position Mapping**
```javascript
// Implementation handles lying position grouping
function getExercisesForPosition(position) {
    if (position === 'lying') {
        // Combine both supine and side lying exercises (16 total)
        return exercises.filter(ex => 
            ex.position_supine_lying === true || 
            ex.position_side_lying === true
        );
    }
    
    // Standard position mapping for other positions
    const positionMap = {
        'DL_stand': 'position_dl_stand',      // 4 exercises
        'split_stand': 'position_split_stand', // 4 exercises
        'SL_stand': 'position_sl_stand',      // 4 exercises  
        'quadruped': 'position_quadruped'     // 5 exercises
    };
    
    return exercises.filter(ex => ex[positionMap[position]] === true);
}
```
- **Formula:** `multiplier = (4 - coreAvg) / 4`

### **Position-Specific Core Questions**
| Position | Core Questions | Count |
|----------|----------------|-------|
| **DL_stand** | F3, F4, F5, F6, F8, SP1 | 6 |
| **split_stand** | F1, F2, F3, F7, F13, F15, SP1, SP4 | 8 |
| **SL_stand** | F1, F2, F4, F9, F11, SP1, SP2, SP3, SP4 | 9 |
| **quadruped** | F5, SP5, ST2, P3, P4 | 5 |

### **Lying Position (Special Calculation)**
```javascript
// Uses best active position to determine lying suitability
bestActiveMultiplier = Math.max(DL_multiplier, split_multiplier, SL_multiplier, quadruped_multiplier)
lyingMultiplier = Math.max(0.1, 1.0 - bestActiveMultiplier)
```

**Clinical Logic:** Better weight-bearing function → Less need for lying exercises

---

## 🤸 **Toe Touch Flexibility Integration**

### **New Flexibility Assessment**

#### **Additional Questionnaire Question (Page 1)**
- **Question:** "Can you touch your toes while standing with straight legs?"
- **Options:** Can / Cannot
- **Purpose:** Assess hamstring and lower back flexibility

#### **Flexibility Modifier Implementation**
```javascript
function calculateFlexibilityModifier(toeTouch, exercise) {
    let flexibilityModifier = 1.0;  // Default for good flexibility
    
    if (toeTouch === 'cannot') {
        // Poor flexibility - boost hamstring and glute max exercises
        const hamstringRecruitment = exercise.muscle_hamstring; // 0-5 scale
        const gluteMaxRecruitment = exercise.muscle_glute_max;   // 0-5 scale
        
        // Take the higher of the two target muscles
        const maxTargetRecruitment = Math.max(hamstringRecruitment, gluteMaxRecruitment);
        
        // Lower power multiplier (1.0 - 1.4 range)
        flexibilityModifier = 1.0 + (maxTargetRecruitment / 12.5);
    }
    
    return flexibilityModifier;
}
```

#### **Modifier Scaling Comparison**
| Recruitment Level | Alignment Modifier | Flexibility Modifier |
|------------------|-------------------|---------------------|
| 0 (none) | 1.0 | 1.0 |
| 1 (low) | 1.2 | 1.08 |
| 3 (moderate) | 1.6 | 1.24 |
| 5 (high) | 2.0 | 1.4 |

### **Updated Layer 2 Ranking**
```javascript
// Layer 2: Exercise ranking within each position (UPDATED)
for (const position of selectedPositions) {
    let exercises = getExercisesForPosition(position);
    
    // STEP 1: Apply core stability filter (if needed)
    exercises = applyCoreStabilityFilter(exercises, trunkSway, hipSway);
    
    // STEP 2: Calculate comprehensive score for remaining exercises
    const scoredExercises = exercises.map(exercise => {
        const difficultyScore = calculateDifficultyModifier(enhancedCombinedScore, exercise.difficulty_level);
        const alignmentModifier = calculateAlignmentModifier(kneeAlignment, exercise);
        const flexibilityModifier = calculateFlexibilityModifier(toeTouch, exercise);
        
        // Apply all modifiers
        const finalScore = difficultyScore * alignmentModifier * flexibilityModifier;
        
        return {
            exercise,
            difficultyScore,
            alignmentModifier,
            flexibilityModifier,
            finalScore
        };
    });
    
    // STEP 3: Sort and select top 2
    const topExercises = scoredExercises.sortByFinalScore().slice(0, 2);
}
```

---

---

## 🗄️ **Exercise Database Schema**

- `data\exercises_ver2.csv` -- updated exercise table 

### **Updated CSV Structure**
```csv
exercise_name,position_sl_stand,position_split_stand,position_dl_stand,position_quadruped,
position_supine_lying,position_side_lying,muscle_quad,muscle_hamstring,muscle_glute_max,
muscle_hip_flexors,muscle_glute_med_min,muscle_adductors,core_ipsi,core_contra,difficulty_level
```

### **Position Categories (Boolean Flags)**
- **`position_sl_stand`** - Single Leg Standing (4 exercises: Hip hikes, RFESS, SL half squat, SL RDL)
- **`position_split_stand`** - Split Standing (4 exercises: Split leg squat, Backward Lunge, Step up, Side squat)  
- **`position_dl_stand`** - Double Leg Standing (4 exercises: DL squats, Hip hinge variations)
- **`position_quadruped`** - Quadruped (5 exercises: Single limb, Donkey kick, Extensions, Birddog)
- **`position_supine_lying`** - Supine Lying (9 exercises: Glute bridges, Hamstring bridges, Deadbug, etc.)
- **`position_side_lying`** - Side Lying (7 exercises: Clamshells, Side planks, Copenhagen variations)

### **Position Grouping Logic**
```javascript
// Lying position combines both supine and side lying
function getExercisesForPosition(position) {
    if (position === 'lying') {
        return exercises.filter(ex => 
            ex.position_supine_lying === true || 
            ex.position_side_lying === true
        );
    }
    // Other positions use direct boolean flags
    return exercises.filter(ex => ex[`position_${position}`] === true);
}
```

### **Muscle Recruitment Ratings (0-5 Scale)**
- **`muscle_quad`** - Quadriceps recruitment
- **`muscle_hamstring`** - Hamstring recruitment (flexibility targeting) 🤸
- **`muscle_glute_max`** - Gluteus Maximus recruitment (flexibility targeting) 🤸  
- **`muscle_hip_flexors`** - Hip Flexors recruitment
- **`muscle_glute_med_min`** - Gluteus Medius/Minimus recruitment (valgus targeting) ⭐
- **`muscle_adductors`** - Adductors recruitment (varus targeting) ⭐

### **Core Stability Flags (Boolean)**
- **`core_ipsi`** - Ipsilateral core engagement (same-side stability)
- **`core_contra`** - Contralateral core engagement (cross-pattern stability)

### **Exercise Examples by Category**

#### **High Flexibility-Targeting Exercises (muscle_hamstring ≥4 OR muscle_glute_max ≥4)**
```
Single leg hamstrings bridging: hamstring=5, glute_max=4 → flexibility_modifier=1.4
Backward Lunge: hamstring=5, glute_max=5 → flexibility_modifier=1.4  
SL RDL: hamstring=5, glute_max=5 → flexibility_modifier=1.4
Hip hinge: hamstring=5, glute_max=4 → flexibility_modifier=1.4
```

#### **High Alignment-Targeting Exercises**
**Valgus (muscle_glute_med_min ≥4):**
```
Single leg glute bridging: glute_med_min=4 → alignment_modifier=1.8
Side plank Clamshell: glute_med_min=5 → alignment_modifier=2.0
SL RDL: glute_med_min=5 → alignment_modifier=2.0
```

**Varus (muscle_adductors ≥3):**
```
Split leg squat: adductors=3 → alignment_modifier=1.6
DL squat with adductor squeeze: adductors=3 → alignment_modifier=1.6
SL RDL: adductors=4 → alignment_modifier=1.8
```

#### **Core Stability Exercises (core_ipsi=true)**
```
Single leg glute bridging, Side planks, Split leg squat, Backward Lunge, 
Step up, Side squat, Hip hikes, RFESS, SL half squat, SL RDL, 
Copenhagen adductor lv2, Birddog
```

### **Position Distribution Analysis**
- **Total exercises:** 33
- **SL Standing:** 4 exercises (12%) - Most challenging
- **Split Standing:** 4 exercises (12%) - Moderate challenge  
- **DL Standing:** 4 exercises (12%) - Least challenging standing
- **Quadruped:** 5 exercises (15%) - Ground-based, moderate
- **Supine Lying:** 9 exercises (27%) - Most accessible
- **Side Lying:** 7 exercises (21%) - Accessible, core-focused

---

## 🗃️ **Supabase Database Schema**

### **Updated Table Structure**

#### **`users` Table**
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### **`questionnaire_responses` Table**
```sql
CREATE TABLE questionnaire_responses (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    username VARCHAR(50) REFERENCES users(username),
    
    -- KOOS/WOMAC Responses (30 questions)
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
    P1 INTEGER CHECK (P1 BETWEEN 1 AND 4),
    P2 INTEGER CHECK (P2 BETWEEN 1 AND 4),
    P3 INTEGER CHECK (P3 BETWEEN 1 AND 4),
    P4 INTEGER CHECK (P4 BETWEEN 1 AND 4),
    P5 INTEGER CHECK (P5 BETWEEN 1 AND 4),
    P6 INTEGER CHECK (P6 BETWEEN 1 AND 4),
    P7 INTEGER CHECK (P7 BETWEEN 1 AND 4),
    P8 INTEGER CHECK (P8 BETWEEN 1 AND 4),
    P9 INTEGER CHECK (P9 BETWEEN 1 AND 4),
    SP1 INTEGER CHECK (SP1 BETWEEN 1 AND 4),
    SP2 INTEGER CHECK (SP2 BETWEEN 1 AND 4),
    SP3 INTEGER CHECK (SP3 BETWEEN 1 AND 4),
    SP4 INTEGER CHECK (SP4 BETWEEN 1 AND 4),
    SP5 INTEGER CHECK (SP5 BETWEEN 1 AND 4),
    ST2 INTEGER CHECK (ST2 BETWEEN 1 AND 4),
    
    -- New Flexibility Assessment
    toe_touch_test VARCHAR(10) CHECK (toe_touch_test IN ('can', 'cannot')),
    
    completed_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### **`sts_assessments` Table**
```sql
CREATE TABLE sts_assessments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    username VARCHAR(50) REFERENCES users(username),
    
    -- STS Test Results
    repetition_count INTEGER CHECK (repetition_count >= 0),
    
    -- Demographics for STS Normalization
    age INTEGER CHECK (age BETWEEN 18 AND 120),
    gender VARCHAR(10) CHECK (gender IN ('male', 'female')),
    
    -- Manual Assessment Inputs
    knee_alignment VARCHAR(10) CHECK (knee_alignment IN ('normal', 'valgus', 'varus')),
    trunk_sway VARCHAR(10) CHECK (trunk_sway IN ('present', 'absent')),
    hip_sway VARCHAR(10) CHECK (hip_sway IN ('present', 'absent')),
    
    completed_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### **`exercises` Table (Pre-populated)**
```sql
CREATE TABLE exercises (
    id SERIAL PRIMARY KEY,
    exercise_name VARCHAR(100) NOT NULL,
    
    -- Position Categories (Boolean)
    position_sl_stand BOOLEAN DEFAULT FALSE,
    position_split_stand BOOLEAN DEFAULT FALSE,
    position_dl_stand BOOLEAN DEFAULT FALSE,
    position_quadruped BOOLEAN DEFAULT FALSE,
    position_supine_lying BOOLEAN DEFAULT FALSE,
    position_side_lying BOOLEAN DEFAULT FALSE,
    
    -- Muscle Recruitment (0-5 Scale)
    muscle_quad INTEGER CHECK (muscle_quad BETWEEN 0 AND 5),
    muscle_hamstring INTEGER CHECK (muscle_hamstring BETWEEN 0 AND 5),
    muscle_glute_max INTEGER CHECK (muscle_glute_max BETWEEN 0 AND 5),
    muscle_hip_flexors INTEGER CHECK (muscle_hip_flexors BETWEEN 0 AND 5),
    muscle_glute_med_min INTEGER CHECK (muscle_glute_med_min BETWEEN 0 AND 5),
    muscle_adductors INTEGER CHECK (muscle_adductors BETWEEN 0 AND 5),
    
    -- Core Stability Flags
    core_ipsi BOOLEAN DEFAULT FALSE,
    core_contra BOOLEAN DEFAULT FALSE,
    
    -- Difficulty Level
    difficulty_level INTEGER CHECK (difficulty_level BETWEEN 1 AND 10),
    
    created_at TIMESTAMP DEFAULT NOW()
);
```

### **Implementation Flow**

#### **Home Page Authentication**
```javascript
async function handleAuthentication(username) {
    const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .single();
    
    if (existingUser) {
        // Login existing user
        localStorage.setItem('currentUser', username);
        redirectTo('/questionnaire');
    } else {
        // Create new user
        const { data: newUser } = await supabase
            .from('users')
            .insert([{ username: username }])
            .select()
            .single();
            
        localStorage.setItem('currentUser', username);
        redirectTo('/questionnaire');
    }
}
```

#### **Page 1: Questionnaire Submission**
```javascript
async function submitQuestionnaire(responses) {
    const username = localStorage.getItem('currentUser');
    
    const questionnaireData = {
        username: username,
        ...responses,  // All F1-ST2 responses + toe_touch_test
        completed_at: new Date()
    };
    
    const { data, error } = await supabase
        .from('questionnaire_responses')
        .upsert(questionnaireData, { onConflict: 'username' });
    
    if (!error) {
        redirectTo('/sts-assessment');
    }
}
```

#### **Page 2: STS Assessment Submission**
```javascript
async function submitSTSAssessment(assessmentData) {
    const username = localStorage.getItem('currentUser');
    
    const stsData = {
        username: username,
        repetition_count: assessmentData.repetitionCount,
        age: assessmentData.age,
        gender: assessmentData.gender,
        knee_alignment: assessmentData.kneeAlignment,
        trunk_sway: assessmentData.trunkSway,
        hip_sway: assessmentData.hipSway,
        completed_at: new Date()
    };
    
    const { data, error } = await supabase
        .from('sts_assessments')
        .upsert(stsData, { onConflict: 'username' });
    
    if (!error) {
        redirectTo('/analysis');
    }
}
```

#### **Page 3: Analysis Data Retrieval + Calculation**
```javascript
async function loadAnalysisData() {
    const username = localStorage.getItem('currentUser');
    
    // Fetch all required data
    const [questionnaireResult, stsResult, exercisesResult] = await Promise.all([
        supabase.from('questionnaire_responses').select('*').eq('username', username).single(),
        supabase.from('sts_assessments').select('*').eq('username', username).single(),
        supabase.from('exercises').select('*')
    ]);
    
    if (questionnaireResult.data && stsResult.data && exercisesResult.data) {
        // Run algorithm with retrieved data
        const recommendations = calculateRecommendations(
            questionnaireResult.data,
            stsResult.data, 
            exercisesResult.data
        );
        
        // Display dashboard
        renderAnalysisDashboard(recommendations);
    }
}
```

---

## 🎯 **Core Stability Filter Integration**

### **New Movement Quality Assessment**

#### **Additional STS Analysis Inputs (Manual for Now)**
- **Trunk Sway:** Present/Absent
- **Hip Sway:** Present/Absent
- **Filter Trigger:** ANY instability present → Apply core filter

#### **Hard Filter Implementation**
```javascript
function requiresCoreStabilityFocus(trunkSway, hipSway) {
    return (trunkSway === 'present' || hipSway === 'present');
}

function applyCoreStabilityFilter(exercises, trunkSway, hipSway) {
    const needsCoreWork = requiresCoreStabilityFocus(trunkSway, hipSway);
    
    if (needsCoreWork) {
        // HARD FILTER: Only show core ipsilateral exercises
        return exercises.filter(exercise => exercise.core_ipsi === true);
    } else {
        // No filter: Show all exercises
        return exercises;
    }
}
```

#### **Updated Exercise Database Schema**
| Column | Type | Purpose |
|--------|------|---------|
| `core_ipsi` | Boolean | Indicates if exercise targets core stability |
| `muscle_*` | Integer (0-5) | Muscle recruitment ratings |
| `difficulty_level` | Integer (1-10) | Exercise difficulty |

### **Updated Layer 2 Ranking**
```javascript
// Layer 2: Exercise ranking within each position (UPDATED)
for (const position of selectedPositions) {
    let exercises = getExercisesForPosition(position);
    
    // STEP 1: Apply core stability filter (if needed)
    exercises = applyCoreStabilityFilter(exercises, trunkSway, hipSway);
    
    // STEP 2: Calculate scores for remaining exercises
    const scoredExercises = exercises.map(exercise => {
        const difficultyScore = calculateDifficultyModifier(enhancedCombinedScore, exercise.difficulty_level);
        const alignmentModifier = calculateAlignmentModifier(kneeAlignment, exercise);
        const finalScore = difficultyScore * alignmentModifier;
        
        return { exercise, difficultyScore, alignmentModifier, finalScore };
    });
    
    // STEP 3: Sort and select top 2
    const topExercises = scoredExercises.sortByFinalScore().slice(0, 2);
}
```

---

## 🦵 **Knee Alignment Integration**

### **New Biomechanical Assessment Component**

#### **Pose Detection Input (Manual for Now)**
- **Knee Alignment Categories:** Normal, Valgus, Varus
- **Clinical Purpose:** Target specific muscle weaknesses causing malalignment
- **Implementation:** Additional input field on STS test page

#### **Alignment-Specific Muscle Targeting**
| Alignment | Target Muscle | Exercise Database Column | Clinical Rationale |
|-----------|---------------|-------------------------|-------------------|
| **Normal** | None (1.0x modifier) | N/A | No biomechanical deficit |
| **Valgus** | Gluteus Med/Min | `muscle_glute_med_min` | Strengthen hip stabilizers |
| **Varus** | Adductors | `muscle_adductors` | Strengthen inner thigh pull |

### **Alignment Modifier Calculation**
```javascript
function calculateAlignmentModifier(kneeAlignment, exercise) {
    let alignmentModifier = 1.0;  // Default for normal alignment
    
    if (kneeAlignment === 'valgus') {
        // Boost exercises that target gluteus medius/minimus
        const gluteMedMinRecruitment = exercise.muscle_glute_med_min; // 0-5 scale
        alignmentModifier = 1.0 + (gluteMedMinRecruitment / 5.0);    // 1.0-2.0 range
    } 
    else if (kneeAlignment === 'varus') {
        // Boost exercises that target adductors
        const adductorRecruitment = exercise.muscle_adductors; // 0-5 scale
        alignmentModifier = 1.0 + (adductorRecruitment / 5.0); // 1.0-2.0 range
    }
    
    return alignmentModifier;
}
```

### **Clinical Examples**

#### **Valgus Knee Example**
```javascript
// Exercise: Side plank hip abduction (high glute med/min recruitment = 5)
kneeAlignment = 'valgus'
difficultyScore = 0.75                    // Based on pain/symptoms/STS
alignmentModifier = 1.0 + (5/5) = 2.0   // Maximum boost for relevant muscle
finalScore = 0.75 × 2.0 = 1.5           // Significantly boosted

// vs Exercise: Leg press (low glute med/min recruitment = 1)  
alignmentModifier = 1.0 + (1/5) = 1.2   // Minimal boost
finalScore = 0.85 × 1.2 = 1.02          // Slightly boosted

// Result: Glute med/min exercises prioritized for valgus correction
```

#### **Normal Alignment Example**
```javascript
// All exercises get 1.0 alignment modifier
// Pure difficulty preference based on pain/symptoms/STS performance
finalScore = difficultyScore × 1.0 = difficultyScore
```

---

## 🏃‍♂️ **30-Second Sit-to-Stand (STS) Integration**

### **New Objective Performance Component**

#### **Age-Specific Normative Data**
| Age Range | Men | Women |
|-----------|-----|-------|
| 60-64 | < 14 | < 12 |
| 65-69 | < 12 | < 11 |
| 70-74 | < 12 | < 10 |
| 75-79 | < 11 | < 10 |
| 80-84 | < 10 | < 9 |
| 85-89 | < 8 | < 8 |
| 90-94 | < 7 | < 4 |

#### **STS Score Calculation**
```javascript
function calculateSTSScore(repetitionCount, age, gender) {
    const benchmark = getAgeBenchmark(age, gender);
    const performanceRatio = repetitionCount / benchmark;
    
    // Average or above = perfect score (1.0)
    const stsScore = Math.min(1.0, performanceRatio);
    
    return stsScore;
}
```

**Key Design Decision:** Average age-appropriate performance = perfect score (1.0), since pain/symptoms will appropriately moderate difficulty when needed.

---

## ⚖️ **Difficulty Reranker System**

### **Purpose**
Transform pain/symptoms from position multiplier components into exercise difficulty preference modifiers.

### **Difficulty Preference Calculation**
```javascript
function calculateDifficultyModifier(combinedScore, exerciseDifficulty) {
    // Map combined score (0-1) to preferred difficulty (1-10)
    const preferredDifficulty = 1 + (combinedScore * 9);
    
    // Calculate distance from preferred difficulty
    const difficultyDistance = Math.abs(exerciseDifficulty - preferredDifficulty);
    
    // Convert to modifier (closer = higher score)
    const difficultyModifier = 1 / (1 + difficultyDistance * 0.2);
    
    return difficultyModifier;
}
```

### **Clinical Logic Examples**

#### **High Combined Score (0.9) → Prefers Difficult Exercises**
- Preferred difficulty: 1 + (0.9 × 9) = 9.1
- Exercise difficulty 9: distance = 0.1 → modifier = 0.98 ✅
- Exercise difficulty 2: distance = 7.1 → modifier = 0.41 ❌

#### **Low Combined Score (0.2) → Prefers Easy Exercises**  
- Preferred difficulty: 1 + (0.2 × 9) = 2.8
- Exercise difficulty 3: distance = 0.2 → modifier = 0.96 ✅
- Exercise difficulty 8: distance = 5.2 → modifier = 0.49 ❌

#### **Moderate Combined Score (0.5) → Prefers Intermediate Exercises**
- Preferred difficulty: 1 + (0.5 × 9) = 5.5
- Exercise difficulty 5: distance = 0.5 → modifier = 0.91 ✅
- Exercise difficulty 6: distance = 0.5 → modifier = 0.91 ✅

---

## 🛡️ **Safety and Conflict Resolution**

### **Conflict Detection**
```javascript
if (Math.abs(stsScore - subjectiveScore) > 0.5) {
    // Significant mismatch between objective performance and subjective experience
}
```

### **Conservative Resolution**
```javascript
// When in conflict, use the more conservative estimate
const conservativeScore = Math.min(stsScore, subjectiveScore);
combinedScore = (conservativeScore * 0.6) + (combinedScore * 0.4);
```

### **Clinical Scenarios**
1. **High Performance, High Pain:** Performance suggests harder exercises, but pain suggests caution → Go easier
2. **Low Performance, Low Pain:** Pain suggests harder exercises, but performance suggests caution → Go easier
3. **Aligned Scores:** No conflict → Use balanced approach

### **Floor/Ceiling Protection**
```javascript
// Prevent extreme values
combinedScore = Math.max(0.1, Math.min(0.9, combinedScore));
```

---

## 📊 **New Two-Layer Exercise Ranking**

### **Layer 1: Position Ranking**
```javascript
// Calculate position multipliers (unchanged)
DL_multiplier = (4 - DL_coreAvg) / 4
split_multiplier = (4 - split_coreAvg) / 4
SL_multiplier = (4 - SL_coreAvg) / 4
quadruped_multiplier = (4 - quad_coreAvg) / 4
lying_multiplier = Math.max(0.1, 1.0 - Math.max(...activeMultipliers))

// Rank positions by multiplier (highest = best capability)
positionRanking = [
    { position: 'DL_stand', multiplier: 0.8 },
    { position: 'split_stand', multiplier: 0.6 },
    { position: 'lying', multiplier: 0.5 },
    // ... etc
].sortByMultiplier().slice(0, 2)  // Show top 2 positions
```

### **Layer 2: Exercise Ranking Within Each Position**
```javascript
// For each selected position
for (const position of selectedPositions) {
    const exercises = getExercisesForPosition(position);
    
    // Calculate comprehensive score for each exercise
    const scoredExercises = exercises.map(exercise => {
        // Step 1: Calculate difficulty preference score
        const difficultyScore = calculateDifficultyModifier(enhancedCombinedScore, exercise.difficulty_level);
        
        // Step 2: Calculate alignment modifier 
        const alignmentModifier = calculateAlignmentModifier(kneeAlignment, exercise);
        
        // Step 3: Apply alignment modifier to boost biomechanically relevant exercises
        const finalScore = difficultyScore * alignmentModifier;
        
        return {
            exercise,
            difficultyScore,
            alignmentModifier,
            finalScore
        };
    });
    
    // Sort by final score (difficulty + alignment), take top 2
    const topExercises = scoredExercises
        .sortByFinalScore()
        .slice(0, 2);
}
```

### **Expected Output Format**

#### **With Multiple Biomechanical Factors:**
```
⚠️  **Core Stability Required** - Movement instability detected
💪 **Flexibility Deficit** - Toe touch unable

🏆 **Best Position: Double Leg Stand** (Capability: 80%)
  1. Exercise A (Diff: 0.75 × Align: 2.0 × Flex: 1.4 = Final: 2.10) ⭐🔄🤸 
  2. Exercise B (Diff: 0.65 × Align: 1.0 × Flex: 1.24 = Final: 0.81) 🔄🤸

🥈 **Second Position: Split Stand** (Capability: 60%)
  1. Exercise C (Diff: 0.80 × Align: 1.8 × Flex: 1.0 = Final: 1.44) ⭐🔄
  2. Exercise D (Diff: 0.70 × Align: 1.0 × Flex: 1.08 = Final: 0.76) 🔄🤸

Legend: 
⭐ = Alignment-targeted | 🔄 = Core-focused | 🤸 = Flexibility-targeted
```

#### **With Normal Movement Quality:**
```
✓ **Good Movement Quality** - All exercise types available
✓ **Good Flexibility** - Full exercise range available

🏆 **Best Position: Double Leg Stand** (Capability: 80%)
  1. Exercise A (Diff: 0.75 × Align: 2.0 × Flex: 1.0 = Final: 1.50) ⭐
  2. Exercise B (Diff: 0.87 × Align: 1.0 × Flex: 1.0 = Final: 0.87)
```

---

## 🎯 **Key Improvements Summary**

### **1. Enhanced Single-Machine + Supabase Workflow**
- **Username-based authentication** - simple create/login system
- **Data persistence** - all assessment data stored in Supabase
- **Real-time calculation** - algorithm runs client-side with retrieved data
- **Immediate results** - no QR code or multi-device complexity
- **Streamlined data collection** - questionnaire + STS assessment

### **New 4-Page Workflow**
1. **Home Page:** Username authentication (create account or login)
2. **Page 1:** Questionnaire (30 KOOS/WOMAC + toe touch) → Save to Supabase
3. **Page 2:** STS assessment (repetitions + demographics + alignments) → Save to Supabase  
4. **Page 3:** Analysis dashboard (retrieve from Supabase + live calculation + display)

### **Retained + Enhanced Components**
- ✅ **Supabase integration** - Simplified schema for single-machine workflow
- ✅ **Data persistence** - All questionnaire and assessment data stored
- ✅ **User management** - Username-based authentication system
- ✅ **Algorithm processing** - Client-side calculation with retrieved data
- ✅ **Dashboard visualization** - Results display and exercise recommendations

### **Removed Components**
- ❌ **QR code generation/scanning**
- ❌ **Dual-machine physiotherapist interface**
- ❌ **Complex patient ID system**
- ❌ **Individual muscle strength assessments**

### **2. Multi-Layer Ranking with Comprehensive Targeting**
- **Layer 0:** Core stability filter (movement instability → core exercises only)
- **Layer 1:** Position ranking by functional capability  
- **Layer 2:** Exercise ranking by difficulty preference + alignment targeting + flexibility targeting
- **Modifier hierarchy:** Core filter → Position capability → Difficulty preference × Alignment correction × Flexibility improvement

### **3. Enhanced Safety with Simplicity**
- **Objective performance integration** (30-second sit-to-stand test)
- **Conflict resolution** when objective and subjective measures disagree
- **Conservative approach** when in doubt
- **Floor/ceiling protection** against extreme recommendations

### **4. Clinical Relevance with Biomechanical Precision**
- **Evidence-based** STS normative data
- **Biomechanically targeted** exercise selection for alignment correction
- **Functionally graded** position-specific questions
- **Safety-first** philosophy in conflict situations
- **Corrective focus** - addresses underlying movement patterns

### **5. Implementation Simplicity with Data Persistence**
- **Supabase backend** - reliable data storage with simple username authentication
- **No muscle testing** - questionnaire, STS, and movement quality assessment only
- **Single-device workflow** - unified interface with data persistence
- **Immediate feedback** - real-time recommendations with safety filtering
- **Hierarchical safety** - movement quality assessed before exercise complexity
- **User management** - simple account system without complex authentication

---

## 🔧 **Implementation Parameters**

### **Tunable Settings**
- **STS weighting:** Currently 50% (vs 25% each for pain/symptoms)
- **Conflict threshold:** 0.5 (when to apply conservative approach)
- **Conservative blending:** 60% conservative + 40% original
- **Difficulty decay rate:** 0.2 (sensitivity to difficulty mismatch)
- **Score floor/ceiling:** 0.1 to 0.9

### **System Inputs Required**
1. **Username** (simple authentication for account creation/login)
2. **Questionnaire responses** (30 KOOS/WOMAC questions + toe touch flexibility test) → Stored in Supabase
3. **STS assessment bundle** (repetition count, age, gender, knee alignment, core stability) → Stored in Supabase
4. **Exercise database** (33 exercises with position flags, muscle recruitment 0-5, core stability booleans, difficulty 1-10) → Pre-loaded in Supabase

### **System Inputs NO LONGER NEEDED**
- ❌ **Individual muscle strength assessments**
- ❌ **Physiotherapist testing**
- ❌ **QR code scanning**
- ❌ **Complex patient ID systems**

---

## 📈 **Expected Clinical Benefits**

### **Simplified Implementation with Data Persistence**
- **Single-device operation** - can be used on any computer/tablet with internet
- **Simple setup** - Supabase backend with minimal configuration
- **Data continuity** - user progress and assessments stored securely
- **Username authentication** - no complex login systems
- **Immediate deployment** - ready to use with simple account creation

### **Maintained Clinical Quality with Enhanced Targeting**
- **Evidence-based recommendations** through objective STS testing
- **Appropriate difficulty matching** based on pain/symptoms and performance
- **Position-appropriate exercises** based on functional capabilities
- **Biomechanically-targeted selection** for alignment correction
- **Safety mechanisms** through conflict resolution
- **Data integrity** - assessments preserved for follow-up analysis

### **Enhanced Clinical Workflow**
- **Faster assessment** - no lengthy muscle testing required
- **Immediate feedback** - results available instantly after data entry
- **Patient engagement** - clear understanding of their capabilities
- **Focused recommendations** - 4 highly relevant exercises vs overwhelming lists
- **Progress tracking** - stored data enables follow-up assessments
- **User continuity** - patients can return to review recommendations

### **Practical Advantages**
- **No training required** - simple questionnaire, STS test, and basic alignment assessment
- **Standardized assessment** - consistent across different users
- **Objective performance data** - reduces subjective bias
- **Age-appropriate expectations** - normalized for demographics
- **Biomechanically-informed** - automatically addresses movement patterns
- **Corrective focus** - 4 highly targeted exercises vs generic recommendations

---

*This algorithm provides a streamlined, evidence-based approach to exercise prescription for knee osteoarthritis patients, combining questionnaire-based functional assessment with objective performance testing, biomechanical alignment correction, and flexibility deficit targeting in a simple, single-machine workflow that prioritizes movement quality, functional improvement, and patient safety.*