# Web-Based Rule-Based Algorithm Fix Documentation

**Date:** 2026-02-21
**Version:** 1.0
**Status:** ✅ Fixed

---

## Problem Summary

After migrating to the normalized database schema (v3.0) and updating STS benchmarks, the web-based rule-based algorithm stopped functioning. This document details the issues found and the fixes applied.

---

## Issues Identified

### Issue 1: STS Benchmark Data ✅ Already Correct

**Status:** No changes needed

**Finding:** The Hong Kong normative benchmarks in `src/results/algorithm.js` (lines 61-80) already match the documentation in `docs/ALGORITHM_DOCUMENTATION.md`. The implementation correctly uses:

- 7 age groups (60-64, 65-69, 70-74, 75-79, 80-84, 85-89, 90+)
- Separate benchmarks for male and female
- Three performance categories: Below Average, Average, Above Average
- Normalized scores: 0.3, 0.65, 0.9

**Reference:** [ALGORITHM_DOCUMENTATION.md:85-102](docs/ALGORITHM_DOCUMENTATION.md#L85-L102)

---

### Issue 2: Database Schema Migration ❌ CRITICAL BUG

**Status:** ✅ Fixed

**Problem:** The algorithm expected a denormalized schema but the database uses a normalized schema (v3.0).

#### Expected Schema (Old):
```javascript
// Single exercises table with flat structure
{
  id: 1,
  exercise_name: "DL Squat",
  difficulty_level: 5,
  // Boolean position fields
  position_dl_stand: true,
  position_split_stand: false,
  position_sl_stand: false,
  // Numeric muscle fields
  muscle_quad: 4,
  muscle_hamstring: 2,
  muscle_glute_max: 3,
  muscle_glute_med_min: 1,
  muscle_adductors: 2,
  muscle_hip_flexors: 1,
  // Core flags
  core_ipsi: false,
  core_contra: false
}
```

#### Current Schema (v3.0):
```sql
-- Normalized structure with junction tables
exercises (
  id, exercise_name, difficulty_level, core_ipsi, core_contra
)

exercise_positions (
  exercise_id, position  -- 'DL_stand', 'split_stand', etc.
)

exercise_muscles (
  exercise_id, muscle, muscle_type, muscle_value
  -- muscle: 'quad', 'hamstring', etc.
  -- muscle_type: 'P' (Primary), 'N' (Secondary), 'S' (Stabiliser)
  -- muscle_value: 0-5 scale
)
```

**Impact:**
- `src/results/algorithm.js` - References `exercise.position_dl_stand`, `exercise.muscle_quad`, etc.
- `src/results/results.js` - Queries `.from('exercises').select('*')`
- `src/physio/recommendations.js` - Queries `.from('exercises').select('*')`

---

## Solution Implemented

### 1. Created Abstraction Layer: `src/shared/exercise-queries.js`

**Purpose:** Query the normalized v3.0 schema and transform it into the denormalized format expected by the algorithm.

**Key Function:**
```javascript
export async function fetchExercisesForAlgorithm()
```

**Process:**
1. Fetch from `exercises`, `exercise_positions`, `exercise_muscles` tables
2. Group by exercise ID
3. Transform to flat structure:
   - Convert positions to boolean fields: `position_dl_stand`, `position_split_stand`, etc.
   - Convert muscles to numeric fields: `muscle_quad`, `muscle_hamstring`, etc.
4. Return array of denormalized exercises

**Benefits:**
- ✅ Algorithm code remains unchanged
- ✅ Single source of truth for denormalization logic
- ✅ Easy to update if schema changes again
- ✅ Supports both normalized and denormalized access patterns

---

### 2. Updated File: `src/results/results.js`

**Changes:**
```diff
+ import { fetchExercisesForAlgorithm } from '../shared/exercise-queries.js';

  async function loadExercises() {
-   const { data: exercises, error } = await supabase
-     .from('exercises')
-     .select('*');
+   const exercises = await fetchExercisesForAlgorithm();
```

**Line:** 341-356

---

### 3. Updated File: `src/physio/recommendations.js`

**Changes:**
```diff
+ import { fetchExercisesForAlgorithm } from '../shared/exercise-queries.js';

  export async function calculateRecommendations(...) {
-   const { data: exercises, error } = await supabase
-     .from('exercises')
-     .select('*');
+   const exercises = await fetchExercisesForAlgorithm();
```

**Line:** 16-25

---

## Files Modified

| File | Purpose | Changes |
|------|---------|---------|
| **`src/shared/exercise-queries.js`** | New abstraction layer | Created - Handles denormalization |
| **`src/results/results.js`** | Results page | Import + use `fetchExercisesForAlgorithm()` |
| **`src/physio/recommendations.js`** | Physio recommendations | Import + use `fetchExercisesForAlgorithm()` |
| **`src/results/algorithm.js`** | Core algorithm | No changes needed ✅ |

---

## Verification Steps

To verify the fix is working:

### 1. Check Database Has Data
```sql
-- Verify exercises exist
SELECT COUNT(*) FROM exercises;

-- Verify positions are populated
SELECT COUNT(*) FROM exercise_positions;

-- Verify muscles are populated
SELECT COUNT(*) FROM exercise_muscles;

-- Sample denormalization (manual check)
SELECT
  e.id,
  e.exercise_name,
  e.difficulty_level,
  e.core_ipsi,
  array_agg(DISTINCT ep.position) as positions,
  array_agg(DISTINCT em.muscle || '=' || em.muscle_value) as muscles
FROM exercises e
LEFT JOIN exercise_positions ep ON e.id = ep.exercise_id
LEFT JOIN exercise_muscles em ON e.id = em.exercise_id
GROUP BY e.id, e.exercise_name, e.difficulty_level, e.core_ipsi
LIMIT 5;
```

### 2. Test Web Application
1. Navigate to results page: `/results.html`
2. Open browser console (F12)
3. Look for log: `[Exercise Queries] Fetched X exercises`
4. Check that exercise recommendations are displayed
5. Verify positions and muscle targeting are correct

### 3. Test Algorithm Output
```javascript
// In browser console on results.html
console.log('Algorithm Results:', algorithmResults);
console.log('Exercise Recommendations:', exerciseRecommendations);

// Should show:
// - positionMultipliers (DL_stand, split_stand, etc.)
// - scores (painScore, symptomScore, stsScore, combinedScore)
// - recommendations (array with 2 positions × 2 exercises each)
```

---

## Algorithm Flow (Post-Fix)

```
User completes assessment
  ↓
results.html loads
  ↓
loadExercises() called
  ↓
fetchExercisesForAlgorithm()
  ├─ Query: exercises
  ├─ Query: exercise_positions
  ├─ Query: exercise_muscles
  └─ Transform: Denormalize
  ↓
calculateRecommendations(questionnaire, sts, exercises)
  ├─ Layer 1: Position ranking
  └─ Layer 2: Exercise ranking within positions
  ↓
Display 4 exercises (2 positions × 2 exercises)
```

---

## Backward Compatibility

### If Old Denormalized Data Still Exists

The abstraction layer **only uses the normalized v3.0 schema**. If old denormalized data exists in a legacy `exercises` table with flat columns, it will be ignored.

**Migration Required:** Use the scripts in `database/migrations/` to populate the normalized schema.

---

## Testing Checklist

- [x] Created abstraction layer (`exercise-queries.js`)
- [x] Updated `results.js` to use abstraction layer
- [x] Updated `recommendations.js` to use abstraction layer
- [x] Verified algorithm.js needs no changes
- [ ] Manual testing with sample patient data
- [ ] Verify exercise recommendations display correctly
- [ ] Check position multipliers are calculated
- [ ] Check biomechanical flags work (valgus/varus, core, flexibility)
- [ ] Verify STS performance categories are correct

---

## Known Limitations

1. **Performance:** Three separate database queries per page load (exercises, positions, muscles). Could be optimized with a database view if needed.

2. **Caching:** No caching layer. Consider adding client-side or server-side cache if exercise data changes infrequently.

3. **Partial Data:** If an exercise exists in `exercises` table but has no entries in `exercise_positions` or `exercise_muscles`, it will have all position fields as `false` and all muscle fields as `0`. The algorithm will naturally deprioritize these exercises.

---

## Future Improvements

### Recommended (Optional)
1. **Database View:** Create a PostgreSQL view that denormalizes the schema automatically
   ```sql
   CREATE VIEW exercises_denormalized AS ...
   ```

2. **Client-Side Caching:** Cache denormalized exercises in localStorage with timestamp
   ```javascript
   const CACHE_DURATION = 1000 * 60 * 30; // 30 minutes
   ```

3. **Progressive Enhancement:** Load core exercise data first, then enhance with positions/muscles asynchronously

---

## References

- **Schema Documentation:** `database/schema/05_create_exercises_table_v3.sql`
- **Algorithm Documentation:** `docs/ALGORITHM_DOCUMENTATION.md`
- **Transition Guide:** `docs/EXERCISE_DATABASE_TRANSITION.md`
- **STS Documentation:** `docs/STS-ASSESSMENT.md`

---

**Document Version:** 1.0
**Last Updated:** 2026-02-21
**Status:** ✅ Web-based rule-based algorithm is now compatible with normalized schema v3.0
