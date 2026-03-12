# Exercise Recommendation Algorithm Documentation

**Version:** 2.0
**Date:** 2026-01-09
**Implementation:** `src/results/algorithm.js`
**Test Suite:** `src/results/algorithm.test.js`

---

## Overview

The exercise recommendation algorithm uses a **two-layer ranking system** that combines:
1. **Objective performance data** (30-second Sit-to-Stand test)
2. **Subjective assessments** (KOOS/WOMAC questionnaire: pain, symptoms, function)
3. **Biomechanical targeting** (knee alignment, flexibility, core stability)

**Final Output:** 4 exercises (2 positions × 2 exercises per position)

---

## Algorithm Flow

```
Input: Questionnaire + STS Assessment + Exercise Database
  ↓
Step 1: Calculate Position Multipliers (functional capability per position)
  ↓
Step 2: Calculate STS Score (objective performance normalized by age/gender)
  ↓
Step 3: Calculate Enhanced Combined Score (pain + symptoms + STS with conflict resolution)
  ↓
Step 4: LAYER 1 - Select Top 2 Positions (by capability)
  ↓
Step 5: LAYER 2 - Rank Exercises Within Each Position
        ├─ Apply Core Stability Filter (if instability present)
        ├─ Calculate Difficulty Modifier (match exercise difficulty to capability)
        ├─ Calculate Alignment Modifier (target valgus/varus correction)
        └─ Calculate Flexibility Modifier (target hamstring/glute max if poor flexibility)
  ↓
Output: 4 Exercises (top 2 from each of top 2 positions)
```

---

## Core Components

### 1. Position Multiplier Calculation

**Purpose:** Determine patient's functional capability in each position
**Function:** `calculatePositionMultipliers(questionnaireData)`

#### **Position-Specific Questions:**
| Position | Questions | Count |
|----------|-----------|-------|
| **DL Stand** (Double-leg standing) | F4, SP1 | 2 |
| **Split Stand** | F2, F4, SP1, SP4 | 4 |
| **SL Stand** (Single-leg standing) | F1, F2, SP4 | 3 |
| **Quadruped** | F5, SP5, ST2, P3, P4 | 5 |

**Note:** This mapping was updated to focus on the most position-relevant questions. Other questions (F3, F5, F6, F7, F8, F9, F11, F13, F15, SP2, SP3) are still collected in the questionnaire for general functional assessment but are not used for position multiplier calculations.

#### **Formula:**
```javascript
// For active positions (DL, split, SL, quadruped):
avg = average(position_questions)  // 1-4 scale
multiplier = (4 - avg) / 4          // Convert to 0-1 scale (higher = better)

// For lying position (special case):
bestActive = max(DL, split, SL, quadruped multipliers)
lyingMultiplier = max(0.1, 1.0 - bestActive)  // Inverse of best active
```

#### **Clinical Logic:**
- Questionnaire scores 1-4 (1=no difficulty, 4=extreme difficulty)
- Multiplier 0-1 (1.0=perfect function, 0.0=cannot perform)
- Better weight-bearing function → Less need for lying exercises

---

### 2. STS Score Calculation

**Purpose:** Categorize objective performance using Hong Kong normative data
**Function:** `calculateSTSScore(repetitionCount, age, gender)`

#### **Hong Kong Normative Benchmarks (30-second STS):**
| Age Group | Gender | Below Average | Average (HK Norm) | Above Average |
|-----------|--------|---------------|-------------------|---------------|
| 60-64 | Female | ≤10 | 11-14 | ≥15 |
| 65-69 | Female | ≤9 | 10-13 | ≥14 |
| 70-74 | Female | ≤8 | 9-12 | ≥13 |
| 75-79 | Female | ≤7 | 8-11 | ≥12 |
| 80-84 | Female | ≤7 | 8-11 | ≥12 |
| 85-89 | Female | ≤7 | 8-9 | ≥10 |
| 90+ | Female | ≤6 | 7-9 | ≥10 |
| 60-64 | Male | ≤11 | 12-16 | ≥17 |
| 65-69 | Male | ≤10 | 11-15 | ≥16 |
| 70-74 | Male | ≤9 | 10-13 | ≥14 |
| 75-79 | Male | ≤9 | 10-13 | ≥14 |
| 80-84 | Male | ≤9 | 10-13 | ≥14 |
| 85-89 | Male | ≤6 | 7-10 | ≥11 |
| 90+ | Male | ≤4 | 5-7 | ≥8 |

#### **Performance Categories:**
```javascript
if (repetitionCount <= benchmarkData.below) {
    performance = 'Below Average'  // normalizedScore = 0.3
} else if (repetitionCount >= benchmarkData.above) {
    performance = 'Above Average'  // normalizedScore = 0.9
} else {
    performance = 'Average'  // normalizedScore = 0.65
}
```

#### **Examples:**
- **Female 65-69, 14 reps:** Above Average (normalizedScore = 0.9)
- **Female 65-69, 11 reps:** Average (normalizedScore = 0.65)
- **Female 65-69, 8 reps:** Below Average (normalizedScore = 0.3)

---

### 3. Enhanced Combined Score

**Purpose:** Combine subjective (pain/symptoms) and objective (STS) with safety features
**Function:** `calculateEnhancedCombinedScore(painAvg, symptomsAvg, stsNormalizedScore)`

#### **Formula:**
```javascript
// Step 1: Invert questionnaire scores (higher score = worse)
painScore = (4 - painAvg) / 4        // 0-1 scale (higher = better)
symptomScore = (4 - symptomsAvg) / 4  // 0-1 scale (higher = better)

// Step 2: Base calculation (50% objective, 50% subjective)
// stsNormalizedScore from performance categories: Above=0.9, Average=0.65, Below=0.3
combinedScore = (stsNormalizedScore × 0.5) + (painScore × 0.25) + (symptomScore × 0.25)

// Step 3: Conflict Resolution
subjectiveScore = (painScore × 0.5) + (symptomScore × 0.5)
if (|stsNormalizedScore - subjectiveScore| > 0.5) {
    conservativeScore = min(stsNormalizedScore, subjectiveScore)
    combinedScore = (conservativeScore × 0.6) + (combinedScore × 0.4)
}

// Step 4: Floor/Ceiling Protection
combinedScore = clamp(combinedScore, 0.1, 0.9)
```

#### **Clinical Scenarios:**
| Scenario | STS Performance | STS Norm | Pain | Result | Action |
|----------|----------------|----------|------|--------|--------|
| Normal | Average | 0.65 | 0.8 | 0.69 | No conflict |
| Above avg performance, high pain | Above Average | 0.9 | 0.0 | 0.38 | **Conservative** (use min) |
| Below avg performance, low pain | Below Average | 0.3 | 1.0 | 0.45 | **Conservative** (use min) |
| Best case | Above Average | 0.9 | 1.0 | 0.88 | Ceiling at 0.9 |
| Worst case | Below Average | 0.3 | 0.0 | 0.15 | Floor at 0.1 |

---

### 4. Difficulty Modifier

**Purpose:** Match exercise difficulty to patient capability
**Function:** `calculateDifficultyModifier(combinedScore, exerciseDifficulty)`

#### **Formula:**
```javascript
preferredDifficulty = 1 + (combinedScore × 9)  // Map 0-1 to 1-10 scale
distance = |exerciseDifficulty - preferredDifficulty|
difficultyModifier = 1 / (1 + distance × 0.2)
```

#### **Examples:**
| Combined Score | Preferred Difficulty | Difficulty 3 | Difficulty 9 |
|----------------|---------------------|--------------|--------------|
| **0.9** (high capability) | 9.1 | 0.41 ❌ | 0.98 ✅ |
| **0.5** (moderate) | 5.5 | 0.67 | 0.74 |
| **0.2** (low capability) | 2.8 | 0.96 ✅ | 0.45 ❌ |

---

### 5. Core Stability Filter

**Purpose:** Hard filter for core-focused exercises when movement instability detected
**Function:** `applyCoreStabilityFilter(exercises, trunkSway, hipSway)`

#### **Trigger Conditions:**
- Trunk sway = **present** (during STS test)
- Hip sway = **present** (during STS test)
- **ANY instability** → Apply filter

#### **Filter Logic:**
```javascript
if (trunkSway === 'present' || hipSway === 'present') {
    return exercises.filter(ex => ex.core_ipsi === true)
}
return exercises  // No filter
```

#### **Impact:**
- **No instability:** All 33 exercises available
- **Instability detected:** Only 8-12 core stability exercises (vary by position)
- **Core exercises:** Have `core_ipsi = true` flag in database

---

### 6. Alignment Modifier

**Purpose:** Boost exercises targeting biomechanical corrections
**Function:** `calculateAlignmentModifier(kneeAlignment, exercise)`

#### **Targeting Strategy:**
| Alignment | Weakness | Target Muscle | Database Column | Modifier Range |
|-----------|----------|---------------|-----------------|----------------|
| **Normal** | None | - | - | 1.0x |
| **Valgus** (knock-knees) | Hip stabilizers | Glute Med/Min | `muscle_glute_med_min` | 1.0x - 2.0x |
| **Varus** (bow-legged) | Adductors | Adductors | `muscle_adductors` | 1.0x - 2.0x |

#### **Formula:**
```javascript
if (kneeAlignment === 'valgus') {
    modifier = 1.0 + (exercise.muscle_glute_med_min / 5.0)
}
else if (kneeAlignment === 'varus') {
    modifier = 1.0 + (exercise.muscle_adductors / 5.0)
}
else {
    modifier = 1.0  // Normal alignment
}
```

#### **Examples:**
| Exercise | Glute Med/Min | Adductors | Valgus Modifier | Varus Modifier |
|----------|---------------|-----------|-----------------|----------------|
| **SL RDL** | 5 | 4 | 2.0x ✅ | 1.8x ✅ |
| **Clamshell** | 5 | 0 | 2.0x ✅ | 1.0x |
| **DL Squat** | 1 | 2 | 1.2x | 1.4x |

---

### 7. Flexibility Modifier

**Purpose:** Boost exercises targeting hamstring/glute max for poor flexibility
**Function:** `calculateFlexibilityModifier(toeTouch, exercise)`

#### **Assessment:**
- **Question:** "Can you touch your toes while standing with straight legs?"
- **Options:** Able / Unable

#### **Formula:**
```javascript
if (toeTouch === 'cannot') {
    maxRecruitment = max(exercise.muscle_hamstring, exercise.muscle_glute_max)
    modifier = 1.0 + (maxRecruitment / 12.5)  // 1.0 - 1.4 range
}
else {
    modifier = 1.0  // Good flexibility
}
```

#### **Power Comparison:**
| Recruitment | Alignment Modifier | Flexibility Modifier |
|-------------|-------------------|---------------------|
| 0 | 1.0x | 1.0x |
| 1 | 1.2x | 1.08x |
| 3 | 1.6x | 1.24x |
| 5 | 2.0x | **1.4x** (max) |

**Note:** Flexibility modifier is intentionally weaker than alignment modifier (clinical priority)

#### **Examples:**
| Exercise | Hamstring | Glute Max | Can Touch | Cannot Touch |
|----------|-----------|-----------|-----------|--------------|
| **Backward Lunge** | 5 | 5 | 1.0x | 1.4x ✅ |
| **Hip Hinge** | 5 | 4 | 1.0x | 1.4x ✅ |
| **Clamshell** | 1 | 2 | 1.0x | 1.16x |

---

## Two-Layer Ranking System

### **LAYER 1: Position Selection**

**Function:** `selectBestPositions(positionMultipliers)`

#### **Process:**
1. Calculate position multipliers (functional capability)
2. Sort positions by multiplier (highest = best capability)
3. Select **top 2 positions**

#### **Example:**
```
Position Multipliers:
  DL_stand:     0.80  ← Selected #1
  split_stand:  0.60  ← Selected #2
  quadruped:    0.50
  SL_stand:     0.40
  lying:        0.30
```

---

### **LAYER 2: Exercise Selection Within Positions**

**Function:** `rankExercisesWithinPosition(...)`

#### **Process (for each selected position):**

1. **Get exercises** for position
   ```javascript
   exercises = getExercisesForPosition(position)
   // Example: split_stand → 4 exercises
   ```

2. **Apply core stability filter** (if needed)
   ```javascript
   if (trunkSway || hipSway) {
       exercises = exercises.filter(ex => ex.core_ipsi === true)
   }
   ```

3. **Calculate comprehensive score** for each exercise
   ```javascript
   difficultyScore = calculateDifficultyModifier(combinedScore, exercise.difficulty)
   alignmentModifier = calculateAlignmentModifier(kneeAlignment, exercise)
   flexibilityModifier = calculateFlexibilityModifier(toeTouch, exercise)

   finalScore = difficultyScore × alignmentModifier × flexibilityModifier
   ```

4. **Sort by final score** and select **top 2**

#### **Example:**
```
Position: split_stand (capability: 0.60)

Exercises:
  #1 Backward Lunge:   difficulty=0.91 × align=1.6 × flex=1.4 = 2.04 ✅
  #2 Split Leg Squat:  difficulty=0.87 × align=1.4 × flex=1.0 = 1.22 ✅
  #3 Step Up:          difficulty=0.75 × align=1.0 × flex=1.0 = 0.75
  #4 Side Squat:       difficulty=0.68 × align=1.2 × flex=1.0 = 0.82

Selected: Backward Lunge, Split Leg Squat
```

---

## Complete Algorithm Output

### **Data Structure:**
```javascript
{
    positionMultipliers: {
        DL_stand: 0.80,
        split_stand: 0.60,
        SL_stand: 0.40,
        quadruped: 0.50,
        lying: 0.30
    },
    scores: {
        painScore: 0.50,           // (4-2)/4 = 0.50
        symptomScore: 0.50,        // (4-2)/4 = 0.50
        stsPerformance: 'Average', // 11 reps for female 65-69
        stsBenchmarkRange: '10-13',
        stsNormalizedScore: 0.65,  // Average performance
        combinedScore: 0.60        // Weighted average with conflict check
    },
    recommendations: [
        {
            position: 'DL_stand',
            positionMultiplier: 0.80,
            exercises: [
                {
                    exercise: { id: 2, exercise_name: 'DL Hip Hinge', ... },
                    difficultyScore: 0.85,
                    alignmentModifier: 1.0,
                    flexibilityModifier: 1.4,
                    finalScore: 1.19
                },
                {
                    exercise: { id: 1, exercise_name: 'DL Squat', ... },
                    difficultyScore: 0.91,
                    alignmentModifier: 1.0,
                    flexibilityModifier: 1.0,
                    finalScore: 0.91
                }
            ]
        },
        {
            position: 'split_stand',
            positionMultiplier: 0.60,
            exercises: [ ... ]
        }
    ],
    biomechanicalFlags: {
        coreStabilityRequired: false,
        flexibilityDeficit: true,
        alignmentIssue: false
    }
}
```

---

## Clinical Scenarios

### **Scenario 1: Normal Patient**
```
Input:
  - Age: 65, Female
  - STS: 11 reps (Average for HK norm 10-13)
  - Pain: Moderate (2.0/4)
  - Knee: Normal alignment
  - Core: Stable
  - Flexibility: Good

Algorithm Flow:
  → STS Performance: Average (normalized = 0.65)
  → Combined Score: 0.60
  → No filters applied
  → Difficulty preference: ~6.4 (moderate)
  → No biomechanical boosts

Output:
  → 4 exercises from top 2 positions
  → Moderate difficulty (5-7 range)
  → All exercise types available
```

---

### **Scenario 2: Valgus Knee with Core Instability**
```
Input:
  - Age: 70, Male
  - STS: 8 reps (Below Average for HK norm 10-13)
  - Pain: High (3.5/4)
  - Knee: Valgus (knock-knees)
  - Core: Trunk sway present
  - Flexibility: Poor

Algorithm Flow:
  → STS Performance: Below Average (normalized = 0.3)
  → Combined Score: 0.25 (conservative due to high pain)
  → CORE FILTER APPLIED → Only core_ipsi exercises
  → Difficulty preference: ~3.2 (easier)
  → Alignment boost: Glute med/min exercises (1.0x - 2.0x)
  → Flexibility boost: Hamstring/glute max (1.0x - 1.4x)

Output:
  → 4 exercises from top 2 positions
  → ALL are core stability exercises (core_ipsi=true)
  → Easier difficulty (2-4 range)
  → Prioritize glute med/min exercises (e.g., Clamshell, Side Plank)
  → Boost hamstring exercises if available
```

---

### **Scenario 3: High Performance with High Pain (Conflict)**
```
Input:
  - Age: 62, Male
  - STS: 18 reps (Above Average for HK norm 12-16)
  - Pain: Very high (4.0/4 → 0.0 score)
  - Symptoms: High (3.5/4 → 0.125 score)
  - Knee: Normal
  - Core: Stable
  - Flexibility: Good

Algorithm Flow:
  → STS Performance: Above Average (normalized = 0.9)
  → Subjective: 0.0625 (pain + symptoms avg)
  → CONFLICT DETECTED (|0.9 - 0.0625| = 0.84 > 0.5)
  → Conservative approach: min(0.9, 0.0625) = 0.0625
  → Combined Score: (0.0625 × 0.6) + (original × 0.4) ≈ 0.35
  → Difficulty preference: ~4.2 (moderate-easy)

Output:
  → 4 exercises from top 2 positions
  → Moderate-easy difficulty (SAFER despite high performance)
  → Conservative recommendation prioritizes pain experience
```

---

## Tunable Parameters

| Parameter | Current Value | Purpose | Location |
|-----------|---------------|---------|----------|
| **STS Weight** | 50% | Objective performance weight | `calculateEnhancedCombinedScore()` |
| **Pain Weight** | 25% | Subjective pain weight | `calculateEnhancedCombinedScore()` |
| **Symptom Weight** | 25% | Subjective symptom weight | `calculateEnhancedCombinedScore()` |
| **Conflict Threshold** | 0.5 | When to apply conservative approach | `calculateEnhancedCombinedScore()` |
| **Conservative Blend** | 60/40 | Conservative vs original score mix | `calculateEnhancedCombinedScore()` |
| **Difficulty Decay** | 0.2 | Sensitivity to difficulty mismatch | `calculateDifficultyModifier()` |
| **Score Floor** | 0.1 | Minimum combined score | `calculateEnhancedCombinedScore()` |
| **Score Ceiling** | 0.9 | Maximum combined score | `calculateEnhancedCombinedScore()` |
| **Alignment Max Boost** | 2.0x | Max modifier for alignment targeting | `calculateAlignmentModifier()` |
| **Flexibility Max Boost** | 1.4x | Max modifier for flexibility targeting | `calculateFlexibilityModifier()` |

---

## Database Requirements

### **Questionnaire Responses Table:**
- All function questions: `f1`-`f17` (INTEGER 1-4)
- All pain questions: `p1`-`p9` (INTEGER 1-4)
- All sport questions: `sp1`-`sp5` (INTEGER 1-4)
- Stiffness: `st2` (INTEGER 1-4)
- Flexibility: `toe_touch_test` (VARCHAR 'can'/'cannot')

### **STS Assessment Table:**
- `repetition_count` (INTEGER)
- `age` (INTEGER)
- `gender` (VARCHAR 'male'/'female')
- `knee_alignment` (VARCHAR 'normal'/'valgus'/'varus')
- `trunk_sway` (VARCHAR 'present'/'absent')
- `hip_sway` (VARCHAR 'present'/'absent')

### **Exercise Table (33 exercises):**
- **Position flags** (BOOLEAN): `position_sl_stand`, `position_split_stand`, `position_dl_stand`, `position_quadruped`, `position_supine_lying`, `position_side_lying`
- **Muscle recruitment** (INTEGER 0-5): `muscle_quad`, `muscle_hamstring`, `muscle_glute_max`, `muscle_hip_flexors`, `muscle_glute_med_min`, `muscle_adductors`
- **Core flags** (BOOLEAN): `core_ipsi`, `core_contra`
- **Difficulty** (INTEGER 1-10): `difficulty_level`

---

## Testing

### **Test Coverage:**
- ✅ All core calculation functions
- ✅ Two-layer ranking system
- ✅ Biomechanical targeting (alignment, flexibility, core)
- ✅ Conflict resolution
- ✅ Edge cases (missing data, out-of-range values)
- ✅ Complete integration scenarios

### **Run Tests:**
```bash
node src/results/algorithm.test.js
```

### **Expected Results:**
- 11 test suites, all passing
- ~50 individual assertions
- Validates all clinical scenarios

---

## Key Design Principles

1. **Safety First:** Conservative approach when objective and subjective measures conflict
2. **Clinical Relevance:** Evidence-based targeting (alignment, flexibility, core stability)
3. **Biomechanical Precision:** Different modifiers for different clinical priorities
4. **Functional Grading:** Position selection based on capability, not just pain
5. **Difficulty Matching:** Exercises matched to patient capability, not one-size-fits-all
6. **Hard Filtering:** Core instability requires core exercises (non-negotiable)
7. **Transparency:** All scoring components preserved for clinical review

---

## References

- **Master Specification:** `OA_Knee_Algorithm_Improvements_Summary.md`
- **Implementation Progress:** `PROGRESS.md`
- **Source Code:** `src/results/algorithm.js`
- **Test Suite:** `src/results/algorithm.test.js`
- **STS Normative Data:** Lines 699-708 in OA_Knee_Algorithm_Improvements_Summary.md

---

**Document Version:** 1.0
**Algorithm Version:** 2.0
**Last Updated:** 2026-01-09
