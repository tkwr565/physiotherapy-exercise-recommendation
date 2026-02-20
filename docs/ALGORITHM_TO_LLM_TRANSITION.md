# Algorithm Transition: Rule-Based → LLM Agent

**Version:** 1.0
**Date:** 2026-01-25
**Purpose:** Explain how clinical decision-making transitions from fixed formulas to AI-powered reasoning

---

## Overview

### Current System: Rule-Based Algorithm
Fixed mathematical formulas make decisions → Limited flexibility

### New System: LLM Agent
AI reads clinical guidelines and makes informed decisions → Natural reasoning

---

## How the Current Rule-Based Algorithm Works

### Architecture: Two-Layer Ranking System

```
Layer 1: Select Best 2 Positions (based on patient capability)
   ↓
Layer 2: Rank Exercises Within Each Position (based on difficulty + biomechanics)
   ↓
Output: 4 Exercises (2 positions × 2 exercises)
```

---

### Layer 1: Position Selection

**Input:** Patient questionnaire responses

**Process:**
1. Calculate position capability scores (position multipliers)
2. Sort positions by score
3. Select top 2 positions

**Example:**

| Position | Questions Used | Average Score | Multiplier | Rank |
|----------|---------------|---------------|------------|------|
| DL_stand | F4, SP1 | 2.0 | 0.80 | ✅ #1 |
| split_stand | F2, F4, SP1, SP4 | 2.5 | 0.60 | ✅ #2 |
| SL_stand | F1, F2, SP4 | 3.2 | 0.35 | ❌ #3 |
| quadruped | F5, SP5, ST2, P3, P4 | 2.8 | 0.50 | ❌ #4 |
| lying | (inverse of best active) | - | 0.20 | ❌ #5 |

**Note:** Position mappings updated to focus on most position-relevant questions. Other questions still collected for general functional assessment.

**Formula:** `multiplier = (4 - average_score) / 4`
- Higher multiplier = Better capability
- Patient questionnaire uses 1-4 scale (1=no difficulty, 4=extreme difficulty)

**Clinical Logic:**
- Select positions where patient has BEST functional capability
- Avoid positions where patient struggles

---

### Layer 2: Exercise Ranking Within Positions

**For EACH selected position (e.g., DL_stand):**

#### Step 1: Get All Exercises in That Position
Example: DL_stand has 4 exercises
- DL squat
- DL squat with band
- DL squat with adductor squeeze
- Hip hinge

#### Step 2: Apply Safety Filters

**Core Stability Filter (HARD FILTER):**
- **Check:** Does patient have trunk sway OR hip sway?
- **Action:** If YES → ONLY allow exercises with `core_ipsi = true`
- **Result:** May reduce available exercises significantly

Example:
- Patient has trunk sway → Core filter activated
- DL squat: `core_ipsi = false` → ❌ EXCLUDED
- Only core-focused exercises remain

#### Step 3: Score Each Exercise

**Three scoring components (multiply together):**

**A. Difficulty Matching Score**
- Calculate patient's preferred difficulty: `1 + (combined_score × 9)`
- Measure distance from exercise difficulty
- Closer match = Higher score

Example:
- Patient combined_score = 0.65
- Preferred difficulty = 1 + (0.65 × 9) = 6.85
- Exercise difficulty = 5
- Distance = |5 - 6.85| = 1.85
- Score = 1 / (1 + 1.85 × 0.2) = 0.73

**B. Alignment Modifier (Biomechanical Targeting)**

**For Valgus Knee:**
- Target muscle: glute_med_min
- Formula: `1.0 + (muscle_glute_med_min / 5.0)`
- Range: 1.0x (no recruitment) → 2.0x (maximal recruitment)

Example:
- Patient has valgus alignment
- Exercise has glute_med_min = 4
- Modifier = 1.0 + (4/5) = 1.8x

**For Varus Knee:**
- Target muscle: adductors
- Formula: `1.0 + (muscle_adductors / 5.0)`
- Range: 1.0x → 2.0x

**C. Flexibility Modifier**

**For Poor Toe Touch:**
- Target muscles: hamstring OR glute_max (use maximum value)
- Formula: `1.0 + (max_muscle / 12.5)`
- Range: 1.0x (none) → 1.4x (maximal)

Example:
- Patient cannot touch toes
- Exercise has hamstring = 5, glute_max = 3
- Max = 5
- Modifier = 1.0 + (5/12.5) = 1.4x

**D. Final Exercise Score**

`Final Score = Difficulty Score × Alignment Modifier × Flexibility Modifier`

Example:
- Difficulty score = 0.73
- Alignment modifier = 1.8x (valgus correction)
- Flexibility modifier = 1.4x (hamstring focus)
- **Final Score = 0.73 × 1.8 × 1.4 = 1.84**

#### Step 4: Rank and Select Top 2

Sort all exercises by final score, pick top 2

---

### Complete Example Walkthrough

**Patient Profile:**
- Age: 70F
- Questionnaire scores → Combined score: 0.65 (moderate capability)
- STS test: 8 reps (below benchmark)
- Knee alignment: Valgus
- Trunk sway: Present
- Toe touch: Cannot

**Layer 1 - Position Selection:**
1. Calculate position multipliers:
   - DL_stand: 0.80
   - split_stand: 0.60
   - SL_stand: 0.35
   - quadruped: 0.50
   - lying: 0.20
2. Select top 2: **DL_stand (0.80)**, **split_stand (0.60)**

**Layer 2 - DL_stand Exercises:**

1. Get exercises: DL squat, DL squat with band, DL squat with adductor squeeze, Hip hinge

2. Apply core filter (trunk sway present):
   - DL squat: core_ipsi = false → ❌ EXCLUDED
   - DL squat with band: core_ipsi = false → ❌ EXCLUDED
   - DL squat with adductor squeeze: core_ipsi = false → ❌ EXCLUDED
   - Hip hinge: core_ipsi = false → ❌ EXCLUDED

   **Problem: NO exercises pass core filter in this position!**

3. System moves to next best position: **quadruped (0.50)**

**Layer 2 - Quadruped Exercises:**

1. Get exercises: Quadruped single limb, Quadruped donkey kick, Quadruped leg extension, Quadruped hip abduction, Birddog

2. Apply core filter:
   - All quadruped exercises have core_ipsi = true (involve contralateral movements)
   - All 5 exercises pass → ✅

3. Score each:

| Exercise | Difficulty Score | Alignment (Valgus) | Flexibility | Final Score |
|----------|------------------|-------------------|-------------|-------------|
| Birddog | 0.78 | 2.0x (glute_med_min=5) | 1.24x (glute=3) | 1.93 ✅ #1 |
| Quad hip abduction | 0.85 | 2.0x (glute_med_min=5) | 1.24x (glute=3) | 2.11 ✅ #2 |
| Quad leg extension | 0.85 | 1.8x (glute_med_min=4) | 1.24x (glute=3) | 1.90 |
| Quad donkey kick | 0.91 | 1.8x (glute_med_min=4) | 1.24x (glute=3) | 2.03 |

4. Select top 2: **Quad hip abduction**, **Birddog**

**Final Output:** 4 exercises from 2 positions (quadruped + split_stand)

---

## Limitations of Rule-Based Algorithm

### 1. Rigid Formulas
- Cannot handle "in-between" cases
- Example: Patient score 0.59 vs 0.61 treated very differently if cutoff is 0.60
- No flexibility for clinical judgment

### 2. Position Failures
- If top position has NO exercises passing filters → System must backtrack
- Inefficient and may miss better combinations

### 3. No Explanations
- System outputs scores but cannot explain WHY
- Clinician sees "1.84" but not the clinical reasoning

### 4. Difficult to Update
- Changing boost value (1.8x → 2.0x) requires code change
- Adding new biomechanical factor requires algorithm rewrite
- Cannot easily incorporate new research

### 5. Limited Context
- Cannot consider patient goals/preferences beyond fixed categories
- Cannot balance multiple competing priorities naturally
- Cannot explain trade-offs

---

## How LLM Agent Decision-Making Works

### Architecture: Guideline-Based Reasoning

```
Patient Profile (Semantic) → LLM reads Clinical Guidelines → LLM reasons through priorities → Outputs ranked exercises + explanations
```

---

### Key Difference: Priority-Based Instead of Formula-Based

#### Rule-Based Approach:
```
Score = 0.73 × 1.8 × 1.4 = 1.84
```
(No explanation, just a number)

#### LLM Agent Approach:
```
1. Hard Filters (MUST pass):
   - Core stability required? Check core_stability flag
   - Capability minimum? Check if patient score in range
   - Position pain? Check pain scores

2. Clinical Priorities:
   - Valgus alignment → Look for glute_med_min in primary_movers (value 4-5)
   - Flexibility deficit → Look for hamstring/glute_max (value 3+)

3. Patient Preference:
   - Sport similarity → Prefer exercises matching patient's activities

4. Progression Logic:
   - Check prerequisites
   - Ensure appropriate challenge level

Reasoning: "Selected Quadruped hip abduction because:
- Passes core stability requirement (trunk sway present)
- Strongly targets valgus correction (glute_med_min = 5 as primary mover)
- Addresses flexibility deficit (glute_max = 3)
- Appropriate difficulty (4) for patient capability (0.65)
- Progression from Quadruped single limb movement"
```

---

### Example: Same Patient, LLM Agent Decision

**Patient Profile (Transformed to Semantic):**
```
Functional Capability:
- Combined score: 0.65 (moderate limitation)
- Position capabilities: DL_stand=0.80 (good), split_stand=0.60 (moderate),
  SL_stand=0.35 (poor), quadruped=0.50 (moderate)

Biomechanical Findings:
- Knee alignment: Valgus (requires glute med/min strengthening)
- Movement quality: Trunk sway present (requires core stability)
- Flexibility: Cannot touch toes (posterior chain tightness)

Treatment Priorities:
1. Core stability (trunk instability)
2. Valgus correction (alignment issue)
3. Posterior chain flexibility
```

**LLM Reasoning Process:**

**Step 1: Apply Hard Filters**
- Core instability present → ONLY select exercises with `safety_constraints.core_stability = true`
- Patient combined_score = 0.65 → Appropriate for difficulty 3-6
- Position pain check: No severe pain in any position → All positions available

**Step 2: Position Selection with Context**
LLM considers:
- DL_stand has excellent capability (0.80) BUT may lack core-focused exercises
- Quadruped has moderate capability (0.50) AND typically has core exercises
- Split_stand has moderate capability (0.60) AND often includes core work

LLM chooses: **quadruped** and **split_stand** (both have core exercises, align with patient needs)

**Step 3: Exercise Selection from Quadruped**

LLM retrieves candidate exercises, reads clinical summaries:

**Birddog:**
- Clinical summary: "Contralateral limb movement requiring core anti-rotation. Targets glute med/min (5), posterior chain (3)."
- Difficulty: 5 (intermediate) - appropriate for 0.65 score ✅
- Core stability: true ✅
- Muscles: glute_med_min = 5 (primary) → **Excellent for valgus** ✅
- Muscles: glute_max = 3 (secondary) → **Good for flexibility** ✅

**Quadruped hip abduction:**
- Clinical summary: "Hip abduction in quadruped isolates glute med/min without balance demands."
- Difficulty: 4 (beginner-intermediate) - appropriate ✅
- Core stability: true (requires contralateral core) ✅
- Muscles: glute_med_min = 5 (primary) → **Excellent for valgus** ✅
- Muscles: glute_max = 3 (secondary) → **Good for flexibility** ✅

**LLM Ranking Logic:**
1. Both pass all hard filters
2. Both strongly target valgus (glute_med_min = 5)
3. Both address flexibility
4. Birddog slightly harder (5 vs 4) - may be better challenge for 0.65 score
5. Quadruped hip abduction more isolated movement - easier to master

**LLM Decision:**
Select both, rank Birddog #1 (better difficulty match + more comprehensive), Quadruped hip abduction #2

**Step 4: Generate Explanation**

```
Selected Exercises:
1. Birddog (Quadruped, Difficulty 5)
2. Quadruped hip abduction (Quadruped, Difficulty 4)

Clinical Justification:
- Both exercises address the patient's core instability through contralateral limb
  movements requiring anti-rotational control
- Strong valgus correction focus (glute med/min = 5 as primary mover in both)
- Contribute to posterior chain flexibility improvement
- Difficulty range (4-5) appropriate for moderate capability (score 0.65)
- Quadruped position well-tolerated (multiplier 0.50) and reduces balance demands
  compared to standing

Progression Note:
Patient should master these quadruped exercises before progressing to standing
unilateral exercises (SL_stand capability currently poor at 0.35).
```

---

## Key Advantages of LLM Agent Approach

### 1. Natural Language Reasoning
- **Rule-based:** "Score = 1.84"
- **LLM:** "Selected because it targets valgus alignment while meeting core stability requirements"

### 2. Flexible Priority Balancing
- **Rule-based:** Fixed formula (alignment × flexibility × difficulty)
- **LLM:** Can weigh "core stability is MOST important, valgus correction second priority"

### 3. Context-Aware Decisions
- **Rule-based:** Treats all 0.65 scores identically
- **LLM:** "Score 0.65 but trunk sway is concerning → prioritize stability over difficulty optimization"

### 4. Easy to Update
- **Rule-based:** Change boost formula → Modify code → Test → Deploy
- **LLM:** Update guideline document → Done (no code change)

### 5. Transparent Reasoning
- **Rule-based:** Black box math
- **LLM:** Explains each decision step

### 6. Handles Edge Cases
- **Rule-based:** Position has no exercises after core filter → System breaks or backtracks
- **LLM:** "DL_stand preferred but lacks core exercises, selecting quadruped instead due to instability priority"

---

## Transition Strategy

### Phase 1: Parallel Operation
- Run both systems simultaneously
- Compare outputs
- Validate LLM decisions against clinical expertise

### Phase 2: Knowledge Base Creation
- Extract algorithm logic into clinical guidelines
- Document priority hierarchies
- Write safety rules in natural language

### Phase 3: LLM Fine-Tuning
- Train LLM on guideline adherence
- Adjust prompts based on output quality
- Validate against expert physiotherapist review

### Phase 4: Full Cutover
- LLM becomes primary decision engine
- Keep rule-based as fallback/validator
- Monitor and refine

---

## What Stays the Same

### Patient Assessment
- Same questionnaires (KOOS/WOMAC)
- Same STS test protocol
- Same scoring calculations (combined score, position multipliers)

### Clinical Goals
- Still select 4 exercises from 2 positions
- Still prioritize safety
- Still match difficulty to capability
- Still target biomechanical issues

### Exercise Database
- Same 33 exercises (enhanced with new fields)
- Same muscle recruitment values (transformed to categories)
- Same difficulty levels

---

## What Changes

### Decision Process
- FROM: Fixed mathematical formulas
- TO: Clinical guideline interpretation

### Flexibility
- FROM: Rigid cutoffs (score < 0.6 vs >= 0.6)
- TO: Context-aware reasoning ("score 0.59 with excellent position tolerance")

### Explainability
- FROM: Numeric scores without context
- TO: Natural language clinical justifications

### Maintainability
- FROM: Code changes for clinical updates
- TO: Guideline document updates (no code)

### Scalability
- FROM: Complex formula interactions (difficult to add new factors)
- TO: Priority lists (easy to add new considerations)

---

## Example: Adding New Clinical Factor

### Rule-Based System
```
Current formula: Score = difficulty × alignment × flexibility

Want to add: Patient sport preference (1.2× boost)

Required changes:
1. Modify scoring function code
2. Add sport_preference parameter
3. Update formula: Score = difficulty × alignment × flexibility × sport
4. Test all combinations
5. Deploy code update
```

### LLM Agent System
```
Update guideline document:

"## Sport Preference Matching

When ranking exercises:
- If patient has sport preference, use as TIE-BREAKER
- Priority: Safety > Capability > Biomechanics > Sport preference
- Apply preference boost ONLY when exercises are otherwise equal"

Done. No code changes needed.
```

---

## Questions for Physiotherapy Team

1. Does the priority hierarchy make clinical sense?
   - Tier 1: Safety filters
   - Tier 2: Biomechanical targeting
   - Tier 3: Sport preference
   - Tier 4: Progression logic

2. Should LLM have flexibility to override priorities in edge cases?
   - Example: Skip valgus targeting if patient has severe pain in all glute exercises?

3. What level of explanation detail do clinicians want to see?
   - Brief summary?
   - Full reasoning chain?
   - Comparison against alternative exercises?

4. How should we validate LLM decisions?
   - Expert physiotherapist review?
   - Compare against historical successful prescriptions?
   - Patient outcome tracking?

5. What's the fallback if LLM produces questionable recommendation?
   - Flag for clinician review?
   - Use rule-based algorithm as backup?
   - Require manual override?

---

**Next Steps:**
1. Review this transition plan with physiotherapy team
2. Create sample clinical guidelines document
3. Test LLM reasoning with real patient cases
4. Refine prompts and guidelines based on output quality
