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
| **DL Stand** (Double-leg standing) | F3, F4, F5, F6, F8, SP1 | 6 |
| **Split Stand** | F1, F2, F3, F7, F13, F15, SP1, SP4 | 8 |
| **SL Stand** (Single-leg standing) | F1, F2, F4, F9, F11, SP1, SP2, SP3, SP4 | 9 |
| **Quadruped** | F5, SP5, ST2, P3, P4 | 5 |

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

**Purpose:** Normalize objective performance using age/gender benchmarks
**Function:** `calculateSTSScore(repetitionCount, age, gender)`

#### **Normative Benchmarks (30-second STS):**
| Age Range | Male | Female |
|-----------|------|--------|
| 60-64 | 14 | 12 |
| 65-69 | 12 | 11 |
| 70-74 | 12 | 10 |
| 75-79 | 11 | 10 |
| 80-84 | 10 | 9 |
| 85-89 | 8 | 8 |
| 90-94 | 7 | 4 |

#### **Formula:**
```javascript
benchmark = lookupBenchmark(age, gender)
stsScore = min(1.0, repetitionCount / benchmark)
```

#### **Examples:**
- **At benchmark:** 11 reps / 11 benchmark = 1.0 (perfect)
- **Above benchmark:** 15 reps / 11 benchmark = 1.36 → capped at 1.0
- **Below benchmark:** 8 reps / 11 benchmark = 0.73 (proportional)

---

### 3. Enhanced Combined Score

**Purpose:** Combine subjective (pain/symptoms) and objective (STS) with safety features
**Function:** `calculateEnhancedCombinedScore(painAvg, symptomsAvg, stsScore)`

#### **Formula:**
```javascript
// Step 1: Invert questionnaire scores (higher score = worse)
painScore = (4 - painAvg) / 4        // 0-1 scale (higher = better)
symptomScore = (4 - symptomsAvg) / 4  // 0-1 scale (higher = better)

// Step 2: Base calculation (50% objective, 50% subjective)
combinedScore = (stsScore × 0.5) + (painScore × 0.25) + (symptomScore × 0.25)

// Step 3: Conflict Resolution
subjectiveScore = (painScore × 0.5) + (symptomScore × 0.5)
if (|stsScore - subjectiveScore| > 0.5) {
    conservativeScore = min(stsScore, subjectiveScore)
    combinedScore = (conservativeScore × 0.6) + (combinedScore × 0.4)
}

// Step 4: Floor/Ceiling Protection
combinedScore = clamp(combinedScore, 0.1, 0.9)
```

#### **Clinical Scenarios:**
| Scenario | STS | Pain | Result | Action |
|----------|-----|------|--------|--------|
| Normal | 0.8 | 0.8 | 0.65 | No conflict |
| High performance, high pain | 1.0 | 0.0 | 0.40 | **Conservative** (use min) |
| Low performance, low pain | 0.3 | 1.0 | 0.45 | **Conservative** (use min) |
| Best case | 1.0 | 1.0 | 0.88 | Ceiling at 0.9 |
| Worst case | 0.0 | 0.0 | 0.10 | Floor at 0.1 |

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
        painScore: 0.50,      // (4-2)/4 = 0.50
        symptomScore: 0.50,   // (4-2)/4 = 0.50
        stsScore: 1.0,        // 12/11 = 1.09 → capped at 1.0
        combinedScore: 0.65   // Weighted average with conflict check
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
  - STS: 12 reps (at benchmark)
  - Pain: Moderate (2.0/4)
  - Knee: Normal alignment
  - Core: Stable
  - Flexibility: Good

Algorithm Flow:
  → STS Score: 1.0 (12/11 capped)
  → Combined Score: 0.65
  → No filters applied
  → Difficulty preference: ~6.9 (moderate-hard)
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
  - STS: 8 reps (below benchmark)
  - Pain: High (3.5/4)
  - Knee: Valgus (knock-knees)
  - Core: Trunk sway present
  - Flexibility: Poor

Algorithm Flow:
  → STS Score: 0.67 (8/12)
  → Combined Score: 0.30 (conservative due to high pain)
  → CORE FILTER APPLIED → Only core_ipsi exercises
  → Difficulty preference: ~3.7 (easier)
  → Alignment boost: Glute med/min exercises (1.0x - 2.0x)
  → Flexibility boost: Hamstring/glute max (1.0x - 1.4x)

Output:
  → 4 exercises from top 2 positions
  → ALL are core stability exercises (core_ipsi=true)
  → Easier difficulty (3-5 range)
  → Prioritize glute med/min exercises (e.g., Clamshell, Side Plank)
  → Boost hamstring exercises if available
```

---

### **Scenario 3: High Performance with High Pain (Conflict)**
```
Input:
  - Age: 62, Male
  - STS: 18 reps (well above benchmark → 1.0 score)
  - Pain: Very high (4.0/4 → 0.0 score)
  - Symptoms: High (3.5/4 → 0.125 score)
  - Knee: Normal
  - Core: Stable
  - Flexibility: Good

Algorithm Flow:
  → STS Score: 1.0 (18/14 capped)
  → Subjective: 0.0625 (pain + symptoms avg)
  → CONFLICT DETECTED (|1.0 - 0.0625| = 0.94 > 0.5)
  → Conservative approach: min(1.0, 0.0625) = 0.0625
  → Combined Score: (0.0625 × 0.6) + (original × 0.4) ≈ 0.40
  → Difficulty preference: ~4.6 (moderate-easy)

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
