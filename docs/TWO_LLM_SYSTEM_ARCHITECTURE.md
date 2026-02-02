# Two-LLM System Architecture

**Purpose:** Define the dual-LLM approach for exercise recommendation with safety verification.

---

## Overview

**Two sequential LLMs with different responsibilities:**

1. **LLM #1: Exercise Recommendation Agent** - Assesses patient, selects exercises based on clinical goals
2. **LLM #2: Safety Verification Agent** - Reviews recommendations, checks safety constraints, approves or modifies

**Analogy:** LLM #1 is the physiotherapist prescribing exercises. LLM #2 is the senior clinician reviewing for safety.

---

## System Flow

```
Patient Data (from database)
    ↓
LLM #1: Exercise Recommendation
    ├─ Analyze patient capability
    ├─ Identify biomechanical targets
    ├─ Select 4 exercises
    ↓
Proposed Exercise List
    ↓
LLM #2: Safety Verification
    ├─ Check each exercise against safety constraints
    ├─ Validate against objective measures (STS)
    ├─ Approve / Modify / Reject exercises
    ↓
Final Exercise Prescription (4 exercises with modifications)
```

---

## Data Provided to BOTH LLMs

### 1. Questionnaire Data (from `questionnaire_responses`)

**Section Scores (average + total for each):**

```javascript
{
  "questionnaire_sections": {
    "symptoms": {
      "questions": ["s1", "s2", "s3", "s4", "s5"],
      "scores": [2, 2, 2, 2, 2],
      "avg": 2.0,
      "total": 10,
      "normalized_0_100": 66.7  // (4-avg)/3 * 100, higher = better
    },
    "stiffness": {
      "questions": ["st1", "st2"],
      "scores": [1, 3],
      "avg": 2.0,
      "total": 4,
      "normalized_0_100": 66.7
    },
    "pain": {
      "questions": ["p1", "p2", "p3", "p4", "p5", "p6", "p7", "p8", "p9"],
      "scores": [2, 2, 2, 2, 2, 2, 2, 1, 2],
      "avg": 1.89,
      "total": 17,
      "normalized_0_100": 70.4
    },
    "function_ADL": {
      "questions": ["f1", "f2", "f3", "f4", "f5", "f6", "f7", "f8", "f9", "f10", "f11", "f12", "f13", "f14", "f15", "f16", "f17"],
      "scores": [2, 2, 3, 1, 2, 2, 2, 1, 2, 1, 1, 2, 2, 1, 2, 2, 2],
      "avg": 1.76,
      "total": 30,
      "normalized_0_100": 74.7
    },
    "function_sports": {
      "questions": ["sp1", "sp2", "sp3", "sp4", "sp5"],
      "scores": [4, 4, 4, 2, 2],
      "avg": 3.2,
      "total": 16,
      "normalized_0_100": 26.7  // Poor sports function
    },
    "quality_of_life": {
      "questions": ["q1", "q2", "q3", "q4"],
      "scores": [2, 2, 2, 2],
      "avg": 2.0,
      "total": 8,
      "normalized_0_100": 66.7
    }
  }
}
```

**Position Capability Scores (RAW, not multipliers):**

```javascript
{
  "position_scores": {
    "sl_stand": {
      "questions": ["f2", "f9", "f10", "f12"],
      "scores": [2, 2, 1, 2],
      "avg": 1.75,
      "normalized_0_100": 75.0
    },
    "split_stand": {
      "questions": ["f1", "f3", "f5", "f6", "f7", "f8", "f9", "f14", "f16"],
      "scores": [2, 3, 2, 2, 2, 1, 2, 1, 2],
      "avg": 1.89,
      "normalized_0_100": 70.4
    },
    "dl_stand": {
      "questions": ["f1", "f3", "f4", "f5", "f6", "f7", "f11"],
      "scores": [2, 3, 1, 2, 2, 2, 1],
      "avg": 1.86,
      "normalized_0_100": 71.4
    },
    "quadruped": {
      "questions": ["f5", "sp5", "st2", "p3", "p4"],
      "scores": [2, 2, 3, 2, 2],
      "avg": 2.2,
      "normalized_0_100": 60.0
    },
    "lying": {
      "questions": ["f13", "f17"],
      "scores": [2, 2],
      "avg": 2.0,
      "normalized_0_100": 66.7
    }
  }
}
```

**Additional relevant data:**

```javascript
{
  "flexibility": {
    "toe_touch_test": "cannot"  // can/cannot
  }
}
```

---

### 2. STS Assessment Data (from `sts_assessments`)

```javascript
{
  "sts_assessment": {
    "repetition_count": 9,
    "age_gender_benchmark": 11,  // NEW: Add this based on patient age/gender
    "benchmark_percent": 81.8,   // (reps / benchmark) * 100

    // Objective biomechanical observations
    "trunk_sway": "absent",      // present/absent
    "hip_sway": "present",       // present/absent
    "knee_alignment": "valgus"   // normal/valgus/varus
  }
}
```

---

### 3. Patient Demographics (from `patient_demographics`)

```javascript
{
  "demographics": {
    "age": 68,
    "gender": "Female",
    "height_cm": 160,
    "weight_kg": 65,
    "date_of_birth": "1958-03-15"
  }
}
```

---

### 4. Exercise Database (from `exercises`)

Provide ALL 33 exercises with their attributes:

```javascript
{
  "exercises": [
    {
      "id": 1,
      "exercise_name": "Straight leg raise",
      "exercise_name_ch": "直膝抬腿",

      // Position flags
      "position_sl_stand": false,
      "position_split_stand": false,
      "position_dl_stand": false,
      "position_quadruped": false,
      "position_supine_lying": true,
      "position_side_lying": false,

      // Muscle recruitment (0-5 scale)
      "muscle_quad": 4,
      "muscle_hamstring": 0,
      "muscle_glute_max": 0,
      "muscle_hip_flexors": 3,
      "muscle_glute_med_min": 1,
      "muscle_adductors": 1,

      // Training targets & clinical hints
      "core_ipsi": false,        // TRUE = Trains core stability (ipsilateral stabilizers)
      "core_contra": false,      // TRUE = Trains contralateral stabilizers for knee alignment
      "toe_touch": false,        // TRUE = Trains posterior chain flexibility

      // Difficulty
      "difficulty_level": 1,

      // Safety constraints (derived from positions)
      "requires_kneeling": false,          // = position_quadruped
      "requires_weight_bearing": false,    // = any standing position
      "requires_core_stability": false     // = core_ipsi
    },
    // ... all 33 exercises
  ]
}
```

**Clinical Interpretation Guide for Exercise Attributes:**

**`core_contra: true`** signals biomechanical targeting priorities:
- If patient has **valgus knee** (knee caves in) → Prioritize exercises with high `muscle_glute_med_min` (4-5)
  - Example: Side plank variations, hip hikes, hip abduction exercises
- If patient has **varus knee** (bow-legged) → Prioritize exercises with high `muscle_adductors` (4-5)
  - Example: Copenhagen adductor exercises, adductor squeezes

**`toe_touch: true`** signals posterior chain flexibility training:
- If patient **cannot touch toes** → Prioritize exercises with high `muscle_hamstring` + `muscle_glute_max`
  - Example: Glute bridges, hamstring bridges, hip hinge, deadlifts
- Targets flexibility through loaded eccentric/concentric movement

**`core_ipsi: true`** signals unilateral stability training:
- Exercises that challenge single-limb control and core activation
- Requires safety verification by LLM #2 (see core stability check)

---

## LLM #1: Exercise Recommendation Agent

### Role
Analyze patient data and select 4 exercises based on clinical reasoning.

### Focus Areas
1. **Patient capability assessment** - Which positions can patient tolerate? (Use position scores + lying score)
2. **Biomechanical targeting** - What issues need addressing?
   - **Valgus knee?** → Use `core_contra: true` + high `muscle_glute_med_min` exercises
   - **Varus knee?** → Use `core_contra: true` + high `muscle_adductors` exercises
   - **Cannot touch toes?** → Use `toe_touch: true` + high `muscle_hamstring` + `muscle_glute_max` exercises
3. **Difficulty matching** - Match exercise difficulty to patient capability (use normalized scores)
4. **Position diversity** - Select from 2 different positions (2 exercises per position)
5. **Progression logic** - Exercises that challenge but don't overwhelm

### Input Data
- All patient data (questionnaire sections, position scores, STS, demographics)
- All 33 exercises with attributes
- **Guideline:** `LLM1_EXERCISE_RECOMMENDATION_GUIDELINE.md`

### Output Format
```javascript
{
  "patient_assessment": {
    "capability_summary": "Patient shows moderate capability across positions. Lying (66.7%) and DL stand (71.4%) best; SL stand (75%) adequate; quadruped (60%) moderate difficulty.",
    "biomechanical_targets": [
      {
        "issue": "valgus_knee",
        "strategy": "Prioritize core_contra=true exercises with high glute_med_min (4-5)",
        "examples": ["Side lying clamshell", "Side plank variations", "Hip hikes"]
      },
      {
        "issue": "cannot_touch_toes",
        "strategy": "Prioritize toe_touch=true exercises with high hamstring + glute_max",
        "examples": ["Glute bridges", "Hip hinge"]
      }
    ],
    "recommended_positions": ["supine_lying", "side_lying"],
    "difficulty_range": "1-3"
  },
  "selected_exercises": [
    {
      "exercise_id": 3,
      "exercise_name": "Double leg glute bridging",
      "position": "supine_lying",
      "reasoning": "Targets glute max/med for valgus correction; low difficulty appropriate for patient capability; supine position safe given lying score 0.25"
    },
    // ... 3 more exercises
  ]
}
```

---

## LLM #2: Safety Verification Agent

### Role
Review LLM #1's recommendations and verify safety against constraints. **Focus on objective measures and overall picture.**

### Safety Constraint Checks

#### 1. **Weight-Bearing Safety**
**Objective indicators to check:**
- `sts_reps` vs `age_gender_benchmark`
- `sts_benchmark_percent` (< 50% = high risk, 50-80% = moderate, >80% = good)
- `trunk_sway` + `hip_sway` (both present = severe instability)

**Overall picture reasoning:**
- If `benchmark_percent > 80%` AND sway absent → Weight-bearing exercises safe
- If `benchmark_percent 50-80%` → Moderate risk, use modifications (wall support, reduced depth)
- If `benchmark_percent < 50%` OR both sways present → High risk, avoid/minimize weight-bearing

**Assessment approach:**
> "Patient has STS 82% of benchmark, trunk sway absent, hip sway present. Functional strength adequate but some postural instability. Weight-bearing exercises appropriate with modifications for balance support."

---

#### 2. **Kneeling Safety**
**Objective indicators to check:**
- `position_quadruped` score (avg of f5, sp5, st2, p3, p4)
- `position_quadruped normalized_0_100` score

**Overall picture reasoning:**
- If `quadruped_score avg < 2.0` AND `normalized > 66%` → Kneeling safe
- If `quadruped_score avg 2.0-3.0` → Moderate risk, use padding, monitor pain
- If `quadruped_score avg > 3.0` OR `normalized < 33%` → High risk, avoid kneeling

**Also consider:**
- `pain.avg` (if overall pain severe, be conservative)
- `symptoms.avg` (swelling may worsen with kneeling)

**Assessment approach:**
> "Patient quadruped position score avg 2.2 (normalized 60%). Moderate difficulty with deep knee flexion. Kneeling exercises acceptable with modifications: thick padding, shorter holds, monitor for increased pain."

---

#### 3. **Core Stability Safety**
**Objective indicators to check (CRITICAL):**
- `trunk_sway` (present/absent)
- `hip_sway` (present/absent)
- Combination patterns:
  - Both present = severe instability
  - Either present = moderate instability
  - Neither present = good stability

**Overall picture reasoning:**
- If both sways absent AND `sl_stand_score normalized > 70%` → Core stability good, unilateral exercises safe
- If one sway present BUT overall sections good (function_ADL > 70%, pain < 2.0) → Moderate instability, allow soft start with guidance
- If both sways present OR `sl_stand_score normalized < 50%` → Severe instability, exclude unilateral exercises

**Flexible "soft start" logic:**
> "Patient has hip sway present (lateral instability) but no trunk sway. SL stand score 75%, function ADL 74.7%, pain avg 1.89. Overall profile strong despite selective hip weakness. Approve core stability exercises with MODIFICATIONS: Start with bilateral lying (single leg bridge), progress to supported split stance (lunges with wall), defer full single-limb standing until hip control improves. Monitor for hip drop, provide corrective cues."

---

### Input Data
- All patient data (same as LLM #1)
- **LLM #1's proposed exercise list** (4 exercises with reasoning)
- **Guideline:** `LLM2_SAFETY_VERIFICATION_GUIDELINE.md`

### Output Format
```javascript
{
  "safety_review": {
    "weight_bearing_check": {
      "objective_data": {
        "sts_benchmark_percent": 81.8,
        "trunk_sway": "absent",
        "hip_sway": "present"
      },
      "risk_level": "moderate",  // low/moderate/high
      "reasoning": "STS 82% adequate strength, but hip sway indicates lateral instability",
      "verdict": "APPROVED with modifications"
    },
    "kneeling_check": {
      "objective_data": {
        "quadruped_avg": 2.2,
        "quadruped_normalized": 60.0
      },
      "risk_level": "moderate",
      "reasoning": "Moderate difficulty with knee flexion tasks",
      "verdict": "APPROVED with modifications"
    },
    "core_stability_check": {
      "objective_data": {
        "trunk_sway": "absent",
        "hip_sway": "present",
        "sl_stand_normalized": 75.0,
        "function_ADL_normalized": 74.7,
        "pain_avg": 1.89
      },
      "risk_level": "moderate",
      "reasoning": "Selective hip instability, but overall strong profile supports soft start",
      "verdict": "APPROVED with modifications and progression guidance"
    }
  },

  "exercise_decisions": [
    {
      "exercise_id": 3,
      "exercise_name": "Double leg glute bridging",
      "safety_constraints_triggered": ["none"],
      "decision": "APPROVED",
      "modifications": []
    },
    {
      "exercise_id": 5,
      "exercise_name": "Single leg hamstrings bridging",
      "safety_constraints_triggered": ["core_stability"],
      "decision": "APPROVED WITH MODIFICATIONS",
      "modifications": [
        "Start with shorter holds (5-10 seconds)",
        "Monitor for hip drop on stance side",
        "Use support under non-stance leg if needed",
        "Progress to longer holds as control improves"
      ],
      "reasoning": "Hip sway indicates lateral instability, but lying position provides support. Bilateral lying exercises completed first before this unilateral progression."
    },
    {
      "exercise_id": 31,
      "exercise_name": "RFESS (Bulgarian split squat)",
      "safety_constraints_triggered": ["core_stability", "weight_bearing"],
      "decision": "REJECTED",
      "replacement_suggestion": "Split leg squat (exercise_id 26)",
      "reasoning": "Difficulty level 7 too high for patient with hip sway. RFESS (rear-foot-elevated) requires advanced single-limb control. Replace with standard split squat (difficulty 4) which provides more stable base."
    }
  ],

  "final_prescription": [
    // 4 approved exercises with any modifications
  ]
}
```

---

## Key Principles

### For LLM #1 (Recommendation):
- **Be ambitious but reasonable** - Challenge the patient appropriately
- **Focus on clinical goals** - Target biomechanical issues (valgus, flexibility, strength)
- **Don't self-censor too much** - Let LLM #2 do the safety verification
- **Explain reasoning** - Why this exercise for this patient?

### For LLM #2 (Safety):
- **Use objective measures first** - STS metrics, trunk/hip sway, position scores
- **Look at overall picture** - Don't rely on single metric
- **Allow "soft starts"** - If overall profile strong, permit challenging exercises with modifications
- **Be conservative when uncertain** - Multiple risk factors = reject
- **Provide alternatives** - If rejecting, suggest safer exercise from same category

---

## Example: Two-LLM Interaction

### Patient Summary:
- Age 68F, STS 82% (9/11), hip sway present, trunk sway absent
- Pain avg 1.89, Function ADL 74.7%, SL stand 75%
- Valgus alignment, cannot touch toes

### LLM #1 Output:
```
Selected exercises:
1. Double leg glute bridging (difficulty 2, supine, targets glute max/med)
2. Single leg glute bridging (difficulty 4, supine, unilateral glute work)
3. Side lying clamshell (difficulty 1, side-lying, glute med for valgus)
4. Hip hikes (difficulty 5, SL standing, glute med + balance challenge)
```

### LLM #2 Review:
```
Exercise 1 (Double leg glute bridging): ✅ APPROVED - No safety concerns
Exercise 2 (Single leg glute bridging): ⚠️ APPROVED WITH MODIFICATIONS
  - Core stability moderate risk (hip sway)
  - Modifications: Short holds, monitor hip drop, progress gradually

Exercise 3 (Side lying clamshell): ✅ APPROVED - No safety concerns
Exercise 4 (Hip hikes): ❌ REJECTED → Replace with "Side plank on knees hold"
  - Core stability moderate risk + Weight-bearing concern (hip sway + SL standing)
  - Hip hikes require high single-limb control patient doesn't have yet
  - Replacement provides glute med work with 3-point support (safer)
```

### Final Prescription:
```
1. Double leg glute bridging
2. Single leg glute bridging (with modifications: 5-10s holds, monitor form)
3. Side lying clamshell
4. Side plank on knees hold (replaced hip hikes)
```

---

## Implementation Notes

1. **Both LLMs receive same patient data** - Ensures consistency
2. **LLM #2 sees LLM #1's reasoning** - Can evaluate logic
3. **LLM #2 has veto power** - Safety trumps ambition
4. **LLM #2 suggests alternatives** - Constructive rejection
5. **Final output always 4 exercises** - LLM #2 must replace rejections

---

## Next Steps

Create two guideline documents:
1. `LLM1_EXERCISE_RECOMMENDATION_GUIDELINE.md` - How to assess patients and select exercises
2. `LLM2_SAFETY_VERIFICATION_GUIDELINE.md` - How to verify safety using objective measures
