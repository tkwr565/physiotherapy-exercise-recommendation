# Exercise Database Transition Plan

**Version:** 1.0
**Date:** 2026-01-25
**Purpose:** Migrate from rule-based algorithm to LLM-powered exercise recommendation

---

## Why We're Transitioning

### Current System: Rule-Based Algorithm
- Fixed numeric scoring formulas
- Rigid decision rules
- Difficult to update without code changes
- Limited ability to explain recommendations

### New System: LLM + RAG (Retrieval-Augmented Generation)
- **Flexible reasoning**: LLM can handle complex multi-factor decisions
- **Natural language explanations**: Can explain WHY an exercise was chosen
- **Easy to update**: Change clinical guidelines without touching code
- **Better scalability**: Easy to add new exercises to database
- **Patient engagement**: Can match exercises to patient's sport preferences

---

## Current Database Analysis

### Column Usage in Rule-Based Algorithm

| Column | Data Type | Current Usage | Impact Level | Keep/Remove |
|--------|-----------|---------------|--------------|-------------|
| **exercise_name** | String | Display | CRITICAL | ✅ Keep |
| **exercise_name_ch** | String | Display (bilingual) | CRITICAL | ✅ Keep |
| **position_sl_stand** | Boolean | Position filtering | CRITICAL | ✅ Transform |
| **position_split_stand** | Boolean | Position filtering | CRITICAL | ✅ Transform |
| **position_dl_stand** | Boolean | Position filtering | CRITICAL | ✅ Transform |
| **position_quadruped** | Boolean | Position filtering | CRITICAL | ✅ Transform |
| **position_supine_lying** | Boolean | Position filtering | CRITICAL | ✅ Transform |
| **position_side_lying** | Boolean | Position filtering | CRITICAL | ✅ Transform |
| **muscle_glute_med_min** | Integer (0-5) | Valgus correction (1.0x - 2.0x boost) | HIGH | ✅ Transform |
| **muscle_adductors** | Integer (0-5) | Varus correction (1.0x - 2.0x boost) | HIGH | ✅ Transform |
| **muscle_hamstring** | Integer (0-5) | Flexibility boost (1.0x - 1.4x boost) | MEDIUM | ✅ Transform |
| **muscle_glute_max** | Integer (0-5) | Flexibility boost (1.0x - 1.4x boost) | MEDIUM | ✅ Transform |
| **muscle_quad** | Integer (0-5) | **UNUSED** | NONE | ✅ Keep for metadata |
| **muscle_hip_flexors** | Integer (0-5) | **UNUSED** | NONE | ✅ Keep for metadata |
| **core_ipsi** | Boolean | Hard safety filter (instability) | CRITICAL | ✅ Transform |
| **core_contra** | Boolean | **UNUSED** | NONE | ❌ Remove |
| **toe_touch** | Boolean | **UNUSED** (uses patient data instead) | NONE | ❌ Remove |
| **difficulty_level** | Integer (1-10) | Difficulty matching | CRITICAL | ✅ Transform |

**Key Finding**: 3 columns never used, others need categorical transformation for LLM

---

## New Database Structure

### Final Schema (Simple & LLM-Friendly)

```json
{
  "exercise_name": "Single leg glute bridging",
  "exercise_name_ch": "單腳臀橋",

  "positions": ["supine_lying"],

  "muscles": {
    "primary_movers": [
      { "muscle": "glute_max", "value": 5 },
      { "muscle": "glute_med_min", "value": 4 }
    ],
    "secondary_movers": [
      { "muscle": "hamstring", "value": 3 },
      { "muscle": "adductors", "value": 2 }
    ]
  },

  "difficulty": {
    "level": 4,
    "category": "beginner_to_intermediate"
  },

  "safety_constraints": {
    "core_stability": true,
    "requires_full_knee_flexion": false,
    "requires_full_knee_extension": false,
    "high_impact": false
  },

  "sport_similarity": ["running", "cycling"],

  "progression_from": ["Double leg glute bridging"],
  "progression_to": ["Single leg hamstrings bridging"],

  "clinical_summary": "Unilateral hip extension in supine. Targets glute max/med, hamstrings. Requires core stability. Addresses valgus alignment and posterior chain flexibility."
}
```

---

## Categorical Transformations Required

### 1. Muscle Recruitment Categories

**Rule**: Simplify 0-5 scale into 2 categories

- **Primary Movers**: Value 4-5
- **Secondary Movers**: Value 2-3
- **Omit**: Value 0-1 (not included in database)

**Example:**
- Original: `muscle_glute_max = 5` → New: Primary mover with value 5
- Original: `muscle_hamstring = 3` → New: Secondary mover with value 3
- Original: `muscle_quad = 1` → Omitted (too minimal)

---

### 2. Difficulty Categories

**Categorical Cutoffs:**

| Difficulty Level | Category | Appropriate Patient Score Range |
|------------------|----------|----------------------------------|
| 1-2 | beginner | 0.10 - 0.35 |
| 3-4 | beginner_to_intermediate | 0.30 - 0.60 |
| 5-6 | intermediate | 0.50 - 0.75 |
| 7-8 | intermediate_to_advanced | 0.70 - 0.90 |
| 9-10 | advanced | 0.85 - 1.00 |

**Note**: Score ranges stored in **guidelines document**, NOT in database (to save tokens)

---

### 3. Position Transformation

**Change**: Boolean columns → Single array

**Before:**
```
position_supine_lying = TRUE
position_side_lying = FALSE
position_dl_stand = FALSE
...
```

**After:**
```
positions: ["supine_lying"]
```

---

### 4. Safety Constraints (New)

**Add Boolean Flags** (easy to extend with new safety checks):

| Flag | Patient Check | Meaning |
|------|---------------|---------|
| `core_stability` | trunk_sway OR hip_sway = 'present' | Exercise requires core stability |
| `requires_full_knee_flexion` | s5 >= 3 | Deep knee bend required |
| `requires_full_knee_extension` | s4 >= 3 | Full knee straightening required |
| `high_impact` | s1 >= 3 OR p1 >= 3 | High impact on joint |

**Physiotherapist Decision**: What other safety flags should we add?
- Requires balance?
- End-range loading?
- Rotation demands?

---

### 5. Sport Similarity (New)

**Purpose**: Match exercises to patient's preferred activities

**Suggested Categories:**
- walking
- running
- cycling
- swimming
- hiking
- golf
- tennis
- dancing
- tai_chi
- yoga
- general_fitness

**Example Mappings:**
- Single leg RDL → `["running", "hiking"]`
- DL squat → `["cycling", "general_fitness"]`
- Side plank → `["golf", "tennis"]`
- Swimming exercises → `["swimming", "yoga"]`

**Physiotherapist Task**: Review and approve sport mappings for all 33 exercises

---

## What Goes Where?

### Database (Structured Facts)
- Exercise names
- Positions
- Muscle recruitment (with values)
- Difficulty level + category
- Safety constraint flags (boolean)
- Sport similarity tags
- Progression links
- Clinical summary (1-2 sentences)

### Knowledge Base Documents (Clinical Reasoning)
- **WHY** glute_med_min targets valgus
- **WHEN** to use core stability filter
- **HOW** to match difficulty to patient capability
- Detailed exercise descriptions
- Safety rule explanations
- Progression principles

**Key Principle**: Database = Facts, Knowledge Base = Clinical Logic

---

## Transformation Process

### Step 1: Define Categories
- ✅ Difficulty categories (done above)
- ✅ Muscle recruitment thresholds (done above)
- ⏳ **Physiotherapist approval needed**

### Step 2: Add Safety Flags
- Review each exercise
- Determine boolean safety constraints
- **Physiotherapist expertise required**

### Step 3: Map Sport Similarities
- Match each exercise to relevant sports
- **Physiotherapist review required**

### Step 4: Write Clinical Summaries
- 1-2 sentence summary per exercise
- Used for semantic search (RAG)
- **Physiotherapist to write**

### Step 5: Write Progression Links
- Identify prerequisite exercises (`progression_from`)
- Identify next-level exercises (`progression_to`)
- **Physiotherapist expertise required**

### Step 6: Create Knowledge Base Documents
- Guidelines for LLM on how to use database
- Clinical reasoning explanations
- Safety rules and thresholds
- **Physiotherapist + developer collaboration**

---

## Key Thresholds for Physiotherapist Review

### Patient Capability Thresholds

| Combined Score | Capability Level | Interpretation |
|----------------|------------------|----------------|
| < 0.30 | Low | Significant functional limitation |
| 0.30 - 0.60 | Moderate | Moderate functional limitation |
| 0.60 - 0.85 | High | Mild functional limitation |
| > 0.85 | Very High | Minimal limitation |

### Position Multiplier Thresholds

| Position Multiplier | Interpretation | Action |
|---------------------|----------------|--------|
| < 0.30 | Poor tolerance | Avoid this position |
| 0.30 - 0.50 | Limited capability | Easy exercises only |
| 0.50 - 0.70 | Moderate capability | Most exercises appropriate |
| > 0.70 | Good capability | Full range of exercises |

### Biomechanical Targeting Priority Rules

**Valgus Knee Alignment:**
- **Target Muscle**: `glute_med_min`
- **Priority Order**:
  1. Primary mover with value 5 (highest priority)
  2. Primary mover with value 4
  3. Secondary mover with value 3
  4. Secondary mover with value 2
- **Clinical Rationale**: Hip abductor weakness causes valgus collapse

**Varus Knee Alignment:**
- **Target Muscle**: `adductors`
- **Priority Order**:
  1. Primary mover with value 5 (highest priority)
  2. Primary mover with value 4
  3. Secondary mover with value 3
  4. Secondary mover with value 2
- **Clinical Rationale**: Adductor weakness contributes to varus alignment

**Posterior Chain Flexibility Deficit:**
- **Target Muscles**: `hamstring` OR `glute_max` (use higher value)
- **Priority Order**:
  1. Either muscle as primary mover with value 5 (highest)
  2. Either muscle as primary mover with value 4
  3. Either muscle as secondary mover with value 3
- **Clinical Rationale**: Cannot touch toes indicates posterior chain tightness

**Question for Physiotherapists**: Do these priority rankings feel clinically appropriate?

---

## Next Steps

### Immediate Actions Required from Physiotherapy Team:

1. **Review Categorical Cutoffs**
   - Approve difficulty-to-capability score ranges
   - Approve position multiplier thresholds
   - Approve biomechanical boost values

2. **Define Safety Constraints**
   - Review proposed safety flags (core_stability, flexion, extension, impact)
   - Suggest additional safety flags needed
   - Map safety flags for all 33 exercises

3. **Map Sport Similarities**
   - Review proposed sport categories
   - Assign sport tags to each exercise
   - Add/remove sport categories as needed

4. **Write Clinical Summaries**
   - 1-2 sentence summary for each exercise
   - Focus on: position, primary targets, clinical indication
   - Will be used for semantic search

5. **Define Progression Pathways**
   - Link exercises in progression chains
   - Identify prerequisites and next steps

6. **Create Clinical Guidelines**
   - Document clinical reasoning for LLM
   - Explain safety rules
   - Progression principles

---

## Expected Benefits

### For Patients:
- Exercises matched to their sport/activity goals
- Natural language explanations for recommendations
- More personalized selections

### For Clinicians:
- Easier to update clinical guidelines (no code changes)
- Can add new exercises easily
- Better transparency in decision-making
- Can override LLM recommendations if needed

### For System:
- Scalable to 100+ exercises
- Flexible reasoning instead of rigid formulas
- Better handling of edge cases
- Can incorporate new research findings quickly

---

## Questions for Discussion

1. Are the difficulty category cutoffs clinically appropriate?
2. What additional safety constraint flags should we add?
3. Should sport similarity apply a scoring boost? If yes, how much? (Currently: 1.2x)
4. Who will write the clinical summaries for each exercise?
5. Who will define the progression pathways?
6. Timeline for completing the transformation?

---

**Next Meeting**: Review this document with physiotherapy team and get approvals on thresholds and categories.
