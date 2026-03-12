# Prompt Changes Log

## 2026-02-20 - LLM #1 System Prompt Updates

### Changes based on physiotherapist team feedback:

**Section 2: Identify Biomechanical Targets**
- Changed valgus/varus targeting approach
- Old: Target glute_med_min for valgus, adductors for varus
- New: Dynamic knee instability → prioritize `core_contra=true` exercises

**Section 3: Select Exercises**
- Position count: 2 → 2-3 positions
- Exercise count: 2 per position (total 4) → 1-2 per position (total 4-5)
- Added rule: High-functioning patients (Above Average STS + symptoms.avg < 2) must have ≥1 weight-bearing exercise

**Section 4: Position Selection Guidelines**
- Updated question mappings (no functional change, formatting consistency)
- DL_stand: F4, SP1 (unchanged)
- Split_stand: F2, F4, SP1, SP4 (unchanged)
- SL_stand: F1, F2, SP4 (unchanged)

---

## 2026-02-20 - LLM #2 System Prompt Updates

### Changes based on physiotherapist team feedback:

**Section 3: Core Stability Safety**
- Check criteria: Old: `core_ipsi = true OR safety_constraints contains "Core_stability"` → New: Only check `safety_constraints contains "Core_stability"`
- Added objective indicator: `sts_assessment.knee_alignment` (valgus/varus indicates dynamic knee instability)
- Updated MODERATE RISK criteria: Now includes valgus/varus alignment as risk factor
- Updated modifications:
  * If sway present → Regress to lying/side lying/quadruped with `core_ipsi = true`
  * If valgus/varus present → Regress to lying/quadruped with `core_contra = true`

**Overall Assessment & Critical Requirements**
- Exercise count: 4 → 4-5 exercises in final prescription
