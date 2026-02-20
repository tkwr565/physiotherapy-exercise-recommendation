# LLM Integration - Exercise Recommendation System

This directory contains the **LLM-based** exercise recommendation system, transitioning from the rule-based algorithm to a two-LLM architecture.

---

## Overview

**Two-LLM Sequential Architecture:**

1. **LLM #1 (Exercise Recommendation Agent)**: Analyzes patient data and recommends 4 exercises based on clinical goals and biomechanical needs
2. **LLM #2 (Safety Verification Agent)**: Reviews recommendations against safety constraints and approves/modifies/rejects exercises

**Architecture Benefits:**
- LLM #1 can be ambitious and clinically effective without self-censoring
- LLM #2 provides independent safety review using objective measures
- Separation of concerns: clinical reasoning vs. safety verification
- Flexible "soft start" logic for progressive rehabilitation

---

## File Structure

```
LLM_integration/
├── main.ipynb                      # Main test notebook (run this!)
├── data_fetcher.py                 # Supabase data fetching and structuring
├── llm1_recommendation.py          # LLM #1: Exercise Recommendation Agent
├── llm2_safety_verification.py     # LLM #2: Safety Verification Agent
├── .env.template                   # Environment variables template
├── .env                           # Your actual environment variables (not committed)
├── IMPLEMENTATION_PLAN.md          # Detailed implementation plan
└── README.md                       # This file
```

---

## Setup Instructions

### 1. Install Dependencies

```bash
pip install python-dotenv langchain-deepseek supabase
```

**Required packages:**
- `python-dotenv`: Load environment variables
- `langchain-deepseek`: DeepSeek LLM integration
- `supabase`: Supabase Python client

### 2. Configure Environment Variables

1. Copy the template:
   ```bash
   cp .env.template .env
   ```

2. Edit `.env` and add your credentials:
   ```env
   DEEPSEEK_API_KEY=your_deepseek_api_key
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

### 3. Ensure Database Has Patient Data

**Test team workflow:**
1. Fill out questionnaire using existing HTML forms:
   - [home.html](../home.html) → Create account
   - [questionnaire.html](../questionnaire.html) → Complete KOOS/WOMAC questionnaire
   - [sts-assessment.html](../sts-assessment.html) → Complete STS assessment
2. Data automatically saves to Supabase
3. Note the username for testing

---

## How to Use

### Running the Notebook

1. Open `main.ipynb` in Jupyter Lab/Notebook or VS Code
2. Run cells sequentially (1 → 2 → 3... → 7)
3. When prompted, enter the patient username from database
4. Review LLM #1 recommendations
5. Review LLM #2 safety verification
6. View final exercise prescription

### Expected Workflow

```
Cell 1: Initialize LLM and Supabase
   ↓
Cell 2: Import custom modules
   ↓
Cell 3: Input patient username
   ↓
Cell 4: Fetch patient data from Supabase
   ↓
Cell 5: Run LLM #1 (Exercise Recommendation)
   ↓
Cell 6: Run LLM #2 (Safety Verification)
   ↓
Cell 7: Display final prescription
   ↓
Cell 8 (Optional): Export to JSON
   ↓
Cell 9 (Optional): Compare with rule-based algorithm
```

---

## Module Documentation

### `data_fetcher.py`

**Purpose:** Fetch and structure patient data for LLM consumption

**Key Functions:**
- `fetch_patient_data(supabase, username)`: Query all patient data from database
- `fetch_all_exercises(supabase)`: Get complete exercise database (33 exercises)
- `calculate_section_scores(questionnaire_data)`: Calculate KOOS/WOMAC section scores
- `calculate_position_scores(questionnaire_data)`: Calculate position capability scores
- `calculate_sts_benchmark(age, gender, reps)`: Get STS normative benchmark
- `structure_patient_profile(raw_data, exercises)`: Format data for LLM
- `print_patient_summary(profile)`: Display human-readable patient summary

**Output Format:**
```python
{
    'demographics': {...},
    'questionnaire_sections': {...},
    'position_scores': {...},
    'flexibility': {...},
    'sts_assessment': {...},
    'exercises': [...]
}
```

---

### `llm1_recommendation.py`

**Purpose:** LLM #1 agent for exercise recommendation

**Key Function:**
- `generate_exercise_recommendations(llm, patient_profile)`: Generate 4 exercise recommendations
- `print_llm1_output(output)`: Display formatted recommendations

**Clinical Logic:**
1. Assess patient capability (position scores, STS performance)
2. Identify biomechanical targets:
   - Valgus → High `muscle_glute_med_min` exercises
   - Varus → High `muscle_adductors` exercises
   - Cannot touch toes → High `muscle_hamstring` + `muscle_glute_max`
3. Select 2 positions based on capability
4. Choose 2 exercises per position (progressive difficulty)

**Output Format:**
```python
{
    'patient_assessment': {
        'capability_summary': "...",
        'biomechanical_targets': [...],
        'recommended_positions': [...],
        'difficulty_range': "..."
    },
    'selected_exercises': [
        {
            'exercise_id': ...,
            'exercise_name': "...",
            'position': "...",
            'difficulty': ...,
            'reasoning': "..."
        }
    ]
}
```

---

### `llm2_safety_verification.py`

**Purpose:** LLM #2 agent for safety verification

**Key Function:**
- `verify_safety_and_finalize(llm, patient_profile, llm1_output)`: Verify safety and finalize prescription
- `print_llm2_output(output)`: Display formatted safety review

**Safety Checks:**
1. **Weight-bearing safety**: Check STS performance + trunk/hip sway
2. **Kneeling safety**: Check quadruped position scores + pain levels
3. **Core stability safety**: Check sway patterns + single-leg capability (with "soft start" flexibility)

**Decision Options:**
- APPROVED: Safe as proposed
- APPROVED WITH MODIFICATIONS: Safe with specific modifications
- REJECTED: Unsafe, replaced with alternative

**Output Format:**
```python
{
    'safety_review': {
        'weight_bearing_check': {...},
        'kneeling_check': {...},
        'core_stability_check': {...}
    },
    'exercise_decisions': [...],
    'final_prescription': [
        {
            'exercise_id': ...,
            'exercise_name': "...",
            'position': "...",
            'difficulty': ...,
            'modifications': [...],
            'clinical_rationale': "..."
        }
    ]
}
```

---

## Testing Scenarios

### Scenario 1: Low Capability Patient
- STS < 50% benchmark
- High pain scores (avg > 2.5)
- Valgus alignment, cannot touch toes
- Expected: Lying position exercises, low difficulty (1-2)

### Scenario 2: Moderate Capability Patient
- STS 60-80% benchmark
- Moderate pain (avg 2.0)
- Hip sway present, trunk sway absent
- Expected: Mix of lying + standing, moderate difficulty (2-4)

### Scenario 3: High Capability Patient
- STS > 80% benchmark
- Low pain (avg < 2.0)
- No sway, normal alignment
- Expected: Standing positions, higher difficulty (4-6)

### Scenario 4: Core Stability Challenges
- Both trunk and hip sway present
- STS adequate but postural instability
- Expected: LLM #2 applies "soft start" logic with modifications

---

## Troubleshooting

### Error: "No patient demographics found"
- Ensure patient completed registration at [home.html](../home.html)
- Check username spelling

### Error: "No questionnaire responses found"
- Patient must complete [questionnaire.html](../questionnaire.html)
- Check for database entry in `questionnaire_responses` table

### Error: "No STS assessment found"
- Patient must complete [sts-assessment.html](../sts-assessment.html)
- Check for database entry in `sts_assessments` table

### Error: "Failed to parse LLM response as JSON"
- LLM returned invalid JSON (rare with temperature=0)
- Check LLM API status
- Review raw response in error message
- May need to refine system prompt

### Error: "LLM returned X exercises, expected 4"
- LLM didn't follow output format
- Check if exercise database is properly loaded
- May need to refine prompt or add output parser

---

## Next Steps

### Immediate (Testing Phase):
1. Test with multiple patient profiles
2. Validate LLM reasoning quality
3. Compare with rule-based algorithm outputs
4. Gather feedback from physiotherapists

### Short-term (Refinement):
1. Refine prompts based on test results
2. Add structured output parsing (Pydantic models)
3. Implement comparison module with rule-based algorithm
4. Add logging for debugging

### Long-term (Production):
1. Create guidelines documents:
   - `LLM1_EXERCISE_RECOMMENDATION_GUIDELINE.md`
   - `LLM2_SAFETY_VERIFICATION_GUIDELINE.md`
2. Implement A/B testing framework
3. Add evaluation metrics (safety compliance, clinical appropriateness)
4. Build feedback loop for continuous improvement
5. Integrate pose-detection model for automated STS assessment

---

## Contributing

When testing or refining the LLM system:

1. **Test with diverse patient profiles**: Low/moderate/high capability
2. **Validate clinical reasoning**: Do recommendations make sense?
3. **Check safety compliance**: Are constraints properly enforced?
4. **Document edge cases**: Unusual patient profiles or failure modes
5. **Iterate on prompts**: Improve clinical reasoning through prompt refinement

---

## References

- [Two-LLM System Architecture](../docs/TWO_LLM_SYSTEM_ARCHITECTURE.md)
- [Algorithm Documentation](../docs/ALGORITHM_DOCUMENTATION.md)
- [Implementation Plan](IMPLEMENTATION_PLAN.md)
- [Main README](../README.md)

---

**Version:** 1.0.0 (LLM Integration Branch)

**Last Updated:** 2026-02-03
