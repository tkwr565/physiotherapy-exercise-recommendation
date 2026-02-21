"""
LLM #1: Exercise Recommendation Agent
Analyzes patient data and recommends 4 exercises based on clinical reasoning
Uses Pydantic for structured output
"""

import json
from typing import Dict, Any, List
from pathlib import Path
from pydantic import BaseModel, Field
from biomechanical_analyzer import (
    identify_biomechanical_targets,
    format_targets_for_prompt,
)


# Pydantic schemas for structured output
class PatientAssessment(BaseModel):
    capability_summary: str = Field(
        description="2-3 sentence summary of patient capability"
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
            "biomechanical_targets": [...],  # Added from rule-based analysis
            "patient_assessment": {...},
            "selected_exercises": [...]
        }
    """
    # Step 1: Rule-based biomechanical target identification
    biomechanical_targets = identify_biomechanical_targets(patient_profile)
    targets_text = format_targets_for_prompt(biomechanical_targets)

    # Step 2: Inject biomechanical targets into system prompt
    # Replace the placeholder section with actual identified targets
    customized_system_prompt = SYSTEM_PROMPT.replace(
        "### 2. **Address Biomechanical Targets**\n"
        "The biomechanical targets specific to this patient have been identified and are provided in the patient data section below. "
        "Your task is to select exercises that address these identified targets using the strategies provided.",
        f"### 2. **Address Biomechanical Targets**\n\n{targets_text}\n\n"
        "Your task is to select exercises that address these identified targets using the strategies provided.",
    )

    # Step 3: Create structured LLM with Pydantic schema
    structured_llm = llm.with_structured_output(ExerciseRecommendation)

    # Step 4: Create user message with patient data only
    user_message = f"""PATIENT DATA:

{json.dumps(patient_profile, indent=2)}

Analyze this patient and recommend 4 exercises based on their capability and the biomechanical targets identified above."""

    # Step 5: Invoke structured LLM with customized system prompt
    try:
        result = structured_llm.invoke(
            [
                {"role": "system", "content": customized_system_prompt},
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

        # Add biomechanical targets to output
        result_dict["biomechanical_targets"] = [
            target.to_dict() for target in biomechanical_targets
        ]

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

    # Biomechanical targets (from rule-based analysis)
    if "biomechanical_targets" in output:
        print("\n[BIOMECHANICAL TARGETS - RULE-BASED ANALYSIS]")
        if output["biomechanical_targets"]:
            for i, target in enumerate(output["biomechanical_targets"], 1):
                print(f"\n  {i}. Issue: {target['issue']}")
                print(f"     Strategy: {target['strategy']}")
                print(f"     Examples: {', '.join(target['examples'])}")
        else:
            print("  No specific biomechanical targets identified.")

    # Patient assessment
    assessment = output["patient_assessment"]
    print("\n[PATIENT ASSESSMENT - LLM ANALYSIS]")
    print(f"\nCapability Summary:")
    print(f"  {assessment['capability_summary']}")

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
