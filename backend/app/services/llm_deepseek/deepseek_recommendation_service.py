"""
DeepSeek Recommendation Service
Main orchestrator for two-LLM sequential architecture
"""

import os
from typing import Dict, Any, List
from langchain_deepseek import ChatDeepSeek

from .data_transformer import structure_patient_profile
from .llm1_recommendation import generate_exercise_recommendations
from .llm2_safety_verification import verify_safety_and_finalize


def get_deepseek_recommendations(
    questionnaire_dict: Dict,
    sts_dict: Dict,
    exercise_dicts: List[Dict],
    demographics: Dict,
    language: str = "en"
) -> Dict[str, Any]:
    """
    Get exercise recommendations using DeepSeek two-LLM architecture

    Args:
        questionnaire_dict: Questionnaire responses
        sts_dict: STS assessment data (includes age, gender)
        exercise_dicts: List of exercises from database
        demographics: Demographics data
        language: Language code ("en" or "zh")

    Returns:
        {
            "biomechanical_targets": [...],
            "patient_assessment": {...},
            "llm1_recommendations": [...],
            "safety_review": {...},
            "exercise_decisions": [...],
            "final_prescription": [...]
        }
    """
    # Check if DeepSeek API key is available
    api_key = os.getenv("DEEPSEEK_API_KEY")
    if not api_key:
        raise ValueError(
            "DEEPSEEK_API_KEY not found in environment variables. "
            "Please set it in .env file or docker-compose.yml"
        )

    # Initialize DeepSeek LLM
    llm = ChatDeepSeek(
        model="deepseek-chat",
        api_key=api_key,
        temperature=0,
    )

    # Step 1: Transform data to LLM-ready format
    patient_profile = structure_patient_profile(
        questionnaire_dict=questionnaire_dict,
        sts_dict=sts_dict,
        exercise_dicts=exercise_dicts,
        demographics=demographics
    )

    # Step 2: Run LLM #1 (Exercise Recommendation Agent)
    llm1_output = generate_exercise_recommendations(llm, patient_profile)

    # Step 3: Run LLM #2 (Safety Verification Agent)
    llm2_output = verify_safety_and_finalize(llm, patient_profile, llm1_output)

    # Step 4: Combine outputs
    result = {
        "biomechanical_targets": llm1_output.get("biomechanical_targets", []),
        "patient_assessment": llm1_output.get("patient_assessment", {}),
        "llm1_recommendations": llm1_output.get("selected_exercises", []),
        "safety_review": llm2_output.get("safety_review", {}),
        "exercise_decisions": llm2_output.get("exercise_decisions", []),
        "final_prescription": llm2_output.get("final_prescription", [])
    }

    return result
