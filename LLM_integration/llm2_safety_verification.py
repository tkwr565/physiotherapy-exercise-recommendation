"""
LLM #2: Safety Verification Agent
Reviews exercise recommendations and verifies safety constraints
Uses Pydantic for structured output
"""

import json
from typing import Dict, Any, List
from pathlib import Path
from pydantic import BaseModel, Field


# Pydantic schemas for structured output
class ObjectiveData(BaseModel):
    """Base class for objective measurement data"""

    pass


class WeightBearingObjectiveData(BaseModel):
    sts_benchmark_performance: str = Field(description="STS benchmark performance (Below Average/Average/Above Average)")
    trunk_sway: str = Field(description="Trunk sway status (present/absent)")
    hip_sway: str = Field(description="Hip sway status (present/absent)")


class KneelingObjectiveData(BaseModel):
    sp5_kneeling: int = Field(description="SP5 kneeling difficulty score (1-5)")
    pain_avg: float = Field(description="Average pain score")


class CoreStabilityObjectiveData(BaseModel):
    trunk_sway: str = Field(description="Trunk sway status (present/absent)")
    hip_sway: str = Field(description="Hip sway status (present/absent)")
    f2_standing: int = Field(description="F2 standing difficulty score (1-5)")
    sp4_twisting: int = Field(
        description="SP4 twisting/pivoting difficulty score (1-5)"
    )
    function_ADL_normalized: float = Field(
        description="Function ADL normalized score (0-100)"
    )


class SafetyCheck(BaseModel):
    objective_data: Dict[str, Any] = Field(description="Objective measurement data")
    risk_level: str = Field(description="Risk level (low/moderate/high)")
    reasoning: str = Field(description="Clinical reasoning for risk assessment")
    verdict: str = Field(description="Safety verdict (safe/moderate_risk/high_risk)")


class WeightBearingCheck(BaseModel):
    objective_data: WeightBearingObjectiveData
    risk_level: str = Field(description="Risk level (low/moderate/high)")
    reasoning: str = Field(description="Clinical reasoning")
    verdict: str = Field(description="Safety verdict (safe/moderate_risk/high_risk)")


class KneelingCheck(BaseModel):
    objective_data: KneelingObjectiveData
    risk_level: str = Field(description="Risk level (low/moderate/high)")
    reasoning: str = Field(description="Clinical reasoning")
    verdict: str = Field(description="Safety verdict (safe/moderate_risk/high_risk)")


class CoreStabilityCheck(BaseModel):
    objective_data: CoreStabilityObjectiveData
    risk_level: str = Field(description="Risk level (low/moderate/high)")
    reasoning: str = Field(description="Clinical reasoning using soft start logic")
    verdict: str = Field(description="Safety verdict (safe/moderate_risk/high_risk)")


class SafetyReview(BaseModel):
    weight_bearing_check: WeightBearingCheck
    kneeling_check: KneelingCheck
    core_stability_check: CoreStabilityCheck


class ExerciseDecision(BaseModel):
    exercise_id: int = Field(description="Exercise ID from database")
    exercise_name: str = Field(description="Exercise name")
    safety_constraints_triggered: List[str] = Field(
        description="List of safety constraints triggered (weight_bearing/kneeling/core_stability)"
    )
    decision: str = Field(
        description="Decision: APPROVED / APPROVED WITH MODIFICATIONS / REJECTED"
    )
    modifications: List[str] = Field(
        description="List of specific modifications (empty if approved)"
    )
    reasoning: str = Field(description="Clinical reasoning referencing objective data")
    replacement_suggestion: str = Field(
        default="", description="Only if REJECTED, suggest exercise_id and name"
    )


class FinalPrescriptionExercise(BaseModel):
    exercise_id: int = Field(description="Exercise ID from database")
    exercise_name: str = Field(description="Exercise name in English")
    exercise_name_ch: str = Field(description="Exercise name in Chinese")
    positions: List[str] = Field(description="Exercise positions")
    difficulty: int = Field(description="Difficulty level (1-10)")
    modifications: List[str] = Field(description="Any safety modifications")
    clinical_rationale: str = Field(
        description="Why this exercise, biomechanical targets, progression logic"
    )


class SafetyVerificationOutput(BaseModel):
    safety_review: SafetyReview = Field(description="Overall safety assessment")
    exercise_decisions: List[ExerciseDecision] = Field(
        description="Decision for each proposed exercise"
    )
    final_prescription: List[FinalPrescriptionExercise] = Field(
        description="Final 4 exercises with modifications", min_length=4, max_length=4
    )


def load_system_prompt() -> str:
    """
    Load LLM #2 system prompt from external markdown file
    """
    prompt_path = Path(__file__).parent / "prompts" / "llm2_system_prompt.md"
    with open(prompt_path, "r", encoding="utf-8") as f:
        return f.read()


# Load system prompt from external file
SYSTEM_PROMPT = load_system_prompt()


def verify_safety_and_finalize(
    llm, patient_profile: Dict[str, Any], llm1_output: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Use LLM #2 to verify safety of recommended exercises with structured output

    Args:
        llm: LangChain LLM instance (ChatDeepSeek)
        patient_profile: Structured patient data from data_fetcher
        llm1_output: Exercise recommendations from LLM #1

    Returns:
        {
            "safety_review": {...},
            "exercise_decisions": [...],
            "final_prescription": [...]
        }
    """
    # Create structured LLM with Pydantic schema
    structured_llm = llm.with_structured_output(SafetyVerificationOutput)

    # Create user message with patient data AND LLM #1 recommendations
    user_message = f"""PATIENT DATA:

{json.dumps(patient_profile, indent=2)}

PROPOSED EXERCISES FROM LLM #1:

{json.dumps(llm1_output['selected_exercises'], indent=2)}

Review each proposed exercise for safety using the constraint checks. Remember to use the flexible "soft start" approach for core stability assessment."""

    # Invoke structured LLM
    try:
        result = structured_llm.invoke(
            [
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_message},
            ]
        )

        # Convert Pydantic model to dict
        result_dict = result.model_dump()

        # Validate output
        if len(result_dict["final_prescription"]) != 4:
            raise ValueError(
                f"LLM returned {len(result_dict['final_prescription'])} exercises in final prescription, expected 4"
            )

        return result_dict

    except Exception as e:
        print(f"ERROR in LLM #2: {e}")
        raise


def print_llm2_output(output: Dict[str, Any]) -> None:
    """
    Print LLM #2 output in human-readable format
    """
    print("=" * 80)
    print("LLM #2: SAFETY VERIFICATION AGENT")
    print("=" * 80)

    # Safety review
    review = output["safety_review"]
    print("\n[SAFETY REVIEW]")

    print("\n1. Weight-Bearing Check:")
    wb = review["weight_bearing_check"]
    print(f"   STS Performance: {wb['objective_data']['sts_benchmark_performance']}")
    print(
        f"   Trunk sway: {wb['objective_data']['trunk_sway']} | Hip sway: {wb['objective_data']['hip_sway']}"
    )
    print(f"   Risk: {wb['risk_level'].upper()} - {wb['verdict']}")
    print(f"   Reasoning: {wb['reasoning']}")

    print("\n2. Kneeling Check:")
    kn = review["kneeling_check"]
    print(f"   SP5 (kneeling): {kn['objective_data']['sp5_kneeling']}")
    print(f"   Pain average: {kn['objective_data']['pain_avg']}")
    print(f"   Risk: {kn['risk_level'].upper()} - {kn['verdict']}")
    print(f"   Reasoning: {kn['reasoning']}")

    print("\n3. Core Stability Check:")
    cs = review["core_stability_check"]
    print(
        f"   Trunk sway: {cs['objective_data']['trunk_sway']} | Hip sway: {cs['objective_data']['hip_sway']}"
    )
    print(
        f"   F2 (standing): {cs['objective_data']['f2_standing']} | SP4 (twisting): {cs['objective_data']['sp4_twisting']}"
    )
    print(f"   Function ADL: {cs['objective_data']['function_ADL_normalized']}")
    print(f"   Risk: {cs['risk_level'].upper()} - {cs['verdict']}")
    print(f"   Reasoning: {cs['reasoning']}")

    # Exercise decisions
    print("\n[EXERCISE DECISIONS]")
    for i, decision in enumerate(output["exercise_decisions"], 1):
        print(f"\n{i}. {decision['exercise_name']} (ID: {decision['exercise_id']})")
        print(f"   Decision: {decision['decision']}")

        if decision["safety_constraints_triggered"]:
            print(
                f"   Constraints triggered: {', '.join(decision['safety_constraints_triggered'])}"
            )

        if decision["modifications"]:
            print(f"   Modifications:")
            for mod in decision["modifications"]:
                print(f"     - {mod}")

        print(f"   Reasoning: {decision['reasoning']}")

        if decision["decision"] == "REJECTED" and decision.get(
            "replacement_suggestion"
        ):
            print(f"   Replacement: {decision['replacement_suggestion']}")

    # Final prescription
    print("\n[FINAL PRESCRIPTION]")
    print("=" * 80)
    for i, ex in enumerate(output["final_prescription"], 1):
        print(f"\n{i}. {ex['exercise_name']} ({ex['exercise_name_ch']})")
        print(
            f"   Positions: {', '.join(ex['positions'])} | Difficulty: {ex['difficulty']}/10"
        )
        print(f"   Rationale: {ex['clinical_rationale']}")

        if ex["modifications"]:
            print(f"   Modifications:")
            for mod in ex["modifications"]:
                print(f"     - {mod}")

    print("\n" + "=" * 80)


if __name__ == "__main__":
    print("LLM #2 Safety Verification Agent Module (with Pydantic structured output)")
    print("Import this module in Jupyter notebook to use with LLM")
