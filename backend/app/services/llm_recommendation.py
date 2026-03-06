"""
LLM-powered exercise recommendation using LangChain.

Uses the algorithm results + clinical guidelines to produce
natural-language reasoning and enhanced recommendations.
"""

from typing import Dict, List, Any
from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from langchain.output_parsers import PydanticOutputParser
from pydantic import BaseModel, Field

from app.config import settings


class ExerciseRecommendation(BaseModel):
    exercise_name: str = Field(description="Name of the recommended exercise")
    position: str = Field(description="Exercise position")
    difficulty_level: int = Field(description="Difficulty level 1-10")
    reasoning: str = Field(description="Why this exercise was selected")


class LLMRecommendationOutput(BaseModel):
    recommendations: List[ExerciseRecommendation] = Field(description="List of recommended exercises")
    clinical_justification: str = Field(description="Overall clinical reasoning")
    progression_notes: str = Field(description="Notes on exercise progression")


SYSTEM_PROMPT = """You are an expert physiotherapist specializing in knee osteoarthritis rehabilitation.
You use evidence-based clinical guidelines to recommend exercises.

Given a patient profile and algorithm-generated scores, provide refined exercise recommendations
with clinical justification.

## Clinical Guidelines

### Priority Hierarchy:
1. **Safety** – Never recommend exercises that would cause harm. Core stability must be
   addressed if trunk or hip sway is present.
2. **Biomechanical Targeting** – Address alignment issues (valgus → glute med/min;
   varus → adductors) and flexibility deficits (poor toe touch → hamstring/glute max).
3. **Difficulty Matching** – Match exercise difficulty to patient capability.
4. **Position Suitability** – Select positions where the patient has the best functional capability.

### Exercise Selection Rules:
- Select exercises from the top 2 most suitable positions.
- Pick 2 exercises per position (4 total).
- If core instability is present, only select exercises with core stability requirements.
- Boost exercises that target the patient's specific alignment issues.
- Consider flexibility deficits when ranking exercises.

{format_instructions}
"""

USER_PROMPT = """## Patient Profile

**Scores:**
- Pain Score: {pain_score:.0%}
- Symptom Score: {symptom_score:.0%}
- STS Performance: {sts_score:.0%}
- Combined Score: {combined_score:.0%}

**Biomechanical Findings:**
- Knee Alignment: {knee_alignment}
- Trunk Sway: {trunk_sway}
- Hip Sway: {hip_sway}
- Toe Touch: {toe_touch}

**Position Multipliers:**
{position_multipliers}

**Algorithm-Selected Exercises:**
{algorithm_exercises}

**Available Exercise Database:**
{exercise_database}

Please provide your refined recommendations with clinical justification.
Respond in {language}.
"""


def get_llm_recommendations(
    algorithm_results: Dict[str, Any],
    exercises: List[Dict[str, Any]],
    sts_data: Dict[str, Any],
    questionnaire: Dict[str, Any],
    language: str = "en",
) -> Dict[str, Any]:
    """Generate LLM-enhanced exercise recommendations using LangChain."""

    if not settings.openai_api_key or settings.openai_api_key == "your-openai-api-key-here":
        # Fallback: return algorithm results with a note
        return {
            "recommendations": [
                {
                    "exercise_name": ex["exercise"].get("exercise_name", "Unknown"),
                    "position": rec["position"],
                    "difficulty_level": ex["exercise"].get("difficulty_level", 1),
                    "reasoning": f"Algorithm score: {ex['final_score']:.2f} "
                                 f"(difficulty match: {ex['difficulty_score']:.2f}, "
                                 f"alignment: {ex['alignment_modifier']:.2f}, "
                                 f"flexibility: {ex['flexibility_modifier']:.2f})",
                }
                for rec in algorithm_results.get("recommendations", [])
                for ex in rec.get("exercises", [])
            ],
            "reasoning": "LLM recommendations unavailable (no API key configured). "
                         "Showing algorithm-based results.",
            "clinical_justification": "Based on rule-based algorithm analysis.",
        }

    try:
        llm = ChatOpenAI(
            model="gpt-4o-mini",
            temperature=0.3,
            api_key=settings.openai_api_key,
        )

        parser = PydanticOutputParser(pydantic_object=LLMRecommendationOutput)

        prompt = ChatPromptTemplate.from_messages([
            ("system", SYSTEM_PROMPT),
            ("human", USER_PROMPT),
        ])

        # Format position multipliers
        pos_mult_str = "\n".join(
            f"- {k}: {v:.2f}" for k, v in algorithm_results.get("position_multipliers", {}).items()
        )

        # Format algorithm exercises
        algo_ex_str = ""
        for rec in algorithm_results.get("recommendations", []):
            algo_ex_str += f"\n### Position: {rec['position']} (multiplier: {rec['position_multiplier']:.2f})\n"
            for ex in rec.get("exercises", []):
                algo_ex_str += (
                    f"- {ex['exercise'].get('exercise_name', 'Unknown')} "
                    f"(difficulty: {ex['exercise'].get('difficulty_level', '?')}, "
                    f"score: {ex['final_score']:.2f})\n"
                )

        # Format exercise database (summary)
        ex_db_str = "\n".join(
            f"- {ex.get('exercise_name', 'Unknown')} | "
            f"Difficulty: {ex.get('difficulty_level', '?')} | "
            f"Quad: {ex.get('muscle_quad', 0)}, Ham: {ex.get('muscle_hamstring', 0)}, "
            f"GMax: {ex.get('muscle_glute_max', 0)}, GMed: {ex.get('muscle_glute_med_min', 0)}, "
            f"Add: {ex.get('muscle_adductors', 0)} | "
            f"Core: {'Yes' if ex.get('core_ipsi') else 'No'}"
            for ex in exercises[:20]  # Limit to avoid token overflow
        )

        scores = algorithm_results.get("scores", {})

        chain = prompt | llm | parser

        result = chain.invoke({
            "format_instructions": parser.get_format_instructions(),
            "pain_score": scores.get("pain_score", 0),
            "symptom_score": scores.get("symptom_score", 0),
            "sts_score": scores.get("sts_score", 0),
            "combined_score": scores.get("combined_score", 0),
            "knee_alignment": sts_data.get("knee_alignment", "normal"),
            "trunk_sway": sts_data.get("trunk_sway", "absent"),
            "hip_sway": sts_data.get("hip_sway", "absent"),
            "toe_touch": questionnaire.get("toe_touch_test", "can"),
            "position_multipliers": pos_mult_str,
            "algorithm_exercises": algo_ex_str,
            "exercise_database": ex_db_str,
            "language": language,
        })

        return {
            "recommendations": [r.model_dump() for r in result.recommendations],
            "reasoning": result.clinical_justification,
            "clinical_justification": result.progression_notes,
        }

    except Exception as e:
        # Fallback to algorithm results on any LLM error
        return {
            "recommendations": [
                {
                    "exercise_name": ex["exercise"].get("exercise_name", "Unknown"),
                    "position": rec["position"],
                    "difficulty_level": ex["exercise"].get("difficulty_level", 1),
                    "reasoning": f"Algorithm score: {ex['final_score']:.2f}",
                }
                for rec in algorithm_results.get("recommendations", [])
                for ex in rec.get("exercises", [])
            ],
            "reasoning": f"LLM unavailable ({str(e)}). Showing algorithm-based results.",
            "clinical_justification": "Based on rule-based algorithm analysis.",
        }
