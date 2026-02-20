"""
LLM #1: Exercise Recommendation Agent
Analyzes patient data and recommends 4 exercises based on clinical reasoning
Uses Pydantic for structured output
"""

import json
from typing import Dict, Any, List
from pathlib import Path
from pydantic import BaseModel, Field


# Pydantic schemas for structured output
class BiomechanicalTarget(BaseModel):
    issue: str = Field(
        description="Biomechanical issue (e.g., valgus_knee, cannot_touch_toes)"
    )
    strategy: str = Field(description="Treatment strategy for this issue")
    examples: List[str] = Field(description="Example exercise types")


class PatientAssessment(BaseModel):
    capability_summary: str = Field(
        description="2-3 sentence summary of patient capability"
    )
    biomechanical_targets: List[BiomechanicalTarget] = Field(
        description="List of biomechanical issues to address"
    )
    recommended_positions: List[str] = Field(
        description="2 recommended exercise positions"
    )
    difficulty_range: str = Field(description="Difficulty range (e.g., '1-3', '2-5')")


class MuscleTargets(BaseModel):
    primary: List[str] = Field(
        description="Primary muscle targets (e.g., ['quad:5', 'glute_max:3'])"
    )
    secondary: List[str] = Field(description="Secondary muscle targets")
    stabiliser: List[str] = Field(description="Stabiliser muscles")


class SelectedExercise(BaseModel):
    exercise_id: int = Field(description="Exercise ID from database")
    exercise_name: str = Field(description="Exercise name in English")
    exercise_name_ch: str = Field(description="Exercise name in Chinese")
    positions: List[str] = Field(description="Exercise positions")
    difficulty: int = Field(description="Difficulty level (1-10)")
    muscle_targets: MuscleTargets = Field(description="Muscle recruitment details")
    reasoning: str = Field(description="Clinical reasoning for selecting this exercise")


class ExerciseRecommendation(BaseModel):
    patient_assessment: PatientAssessment = Field(
        description="Patient capability assessment"
    )
    selected_exercises: List[SelectedExercise] = Field(
        description="4 recommended exercises", min_length=4, max_length=4
    )


def load_system_prompt() -> str:
    """
    Load LLM #1 system prompt from external markdown file
    """
    prompt_path = Path(__file__).parent / "prompts" / "llm1_system_prompt.md"
    with open(prompt_path, "r", encoding="utf-8") as f:
        return f.read()


# Load system prompt from external file
SYSTEM_PROMPT = load_system_prompt()


def generate_exercise_recommendations(
    llm, patient_profile: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Use LLM #1 to generate exercise recommendations with structured output

    Args:
        llm: LangChain LLM instance (ChatDeepSeek)
        patient_profile: Structured patient data from data_fetcher

    Returns:
        {
            "patient_assessment": {...},
            "selected_exercises": [...]
        }
    """
    # Create structured LLM with Pydantic schema
    structured_llm = llm.with_structured_output(ExerciseRecommendation)

    # Create user message with patient data
    user_message = f"""PATIENT DATA:

{json.dumps(patient_profile, indent=2)}

Analyze this patient and recommend 4 exercises based on their capability and biomechanical needs."""

    # Invoke structured LLM
    try:
        result = structured_llm.invoke(
            [
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_message},
            ]
        )

        # Debug: Check if result is None
        if result is None:
            raise ValueError(
                "LLM returned None - this may indicate structured output failed. Check if the model supports tool calling."
            )

        # Convert Pydantic model to dict
        result_dict = result.model_dump()

        # Validate output
        if len(result_dict["selected_exercises"]) != 4:
            raise ValueError(
                f"LLM returned {len(result_dict['selected_exercises'])} exercises, expected 4"
            )

        return result_dict

    except AttributeError as e:
        print(f"ERROR in LLM #1: {e}")
        print(f"Result type: {type(result)}")
        print(f"Result value: {result}")
        raise
    except Exception as e:
        print(f"ERROR in LLM #1: {e}")
        raise


def print_llm1_output(output: Dict[str, Any]) -> None:
    """
    Print LLM #1 output in human-readable format
    """
    print("=" * 80)
    print("LLM #1: EXERCISE RECOMMENDATION AGENT")
    print("=" * 80)

    # Patient assessment
    assessment = output["patient_assessment"]
    print("\n[PATIENT ASSESSMENT]")
    print(f"\nCapability Summary:")
    print(f"  {assessment['capability_summary']}")

    print(f"\nBiomechanical Targets:")
    for i, target in enumerate(assessment["biomechanical_targets"], 1):
        print(f"  {i}. Issue: {target['issue']}")
        print(f"     Strategy: {target['strategy']}")
        print(f"     Examples: {', '.join(target['examples'])}")

    print(f"\nRecommended Positions: {', '.join(assessment['recommended_positions'])}")
    print(f"Difficulty Range: {assessment['difficulty_range']}")

    # Selected exercises
    print("\n[SELECTED EXERCISES]")
    for i, ex in enumerate(output["selected_exercises"], 1):
        print(f"\n{i}. {ex['exercise_name']} ({ex['exercise_name_ch']})")
        print(
            f"   ID: {ex['exercise_id']} | Positions: {', '.join(ex['positions'])} | Difficulty: {ex['difficulty']}/10"
        )
        print(f"   Primary muscles: {', '.join(ex['muscle_targets']['primary'])}")
        if ex["muscle_targets"].get("secondary"):
            print(
                f"   Secondary muscles: {', '.join(ex['muscle_targets']['secondary'])}"
            )
        if ex["muscle_targets"].get("stabiliser"):
            print(
                f"   Stabiliser muscles: {', '.join(ex['muscle_targets']['stabiliser'])}"
            )
        print(f"   Reasoning: {ex['reasoning']}")

    print("\n" + "=" * 80)


if __name__ == "__main__":
    print("LLM #1 Recommendation Agent Module (with Pydantic structured output)")
    print("Import this module in Jupyter notebook to use with LLM")
