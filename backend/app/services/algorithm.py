"""
OA Knee Exercise Recommendation Algorithm (Python port).

Two-layer ranking system:
  Layer 1 – Position ranking by functional capability (position multipliers)
  Layer 2 – Exercise ranking within positions by difficulty preference + biomechanical targeting
"""

from typing import Dict, List, Any, Optional
import math


# ── Helpers ───────────────────────────────────────────────────────────────────

def _average(values: List[float]) -> float:
    valid = [v for v in values if v and v > 0]
    if not valid:
        return 0.0
    return sum(valid) / len(valid)


def _get_age_group(age: int) -> str:
    if 60 <= age < 65:
        return "60-64"
    if 65 <= age < 70:
        return "65-69"
    if 70 <= age < 75:
        return "70-74"
    if 75 <= age < 80:
        return "75-79"
    if 80 <= age < 85:
        return "80-84"
    if 85 <= age < 90:
        return "85-89"
    if 90 <= age < 95:
        return "90-94"
    return "60-64"


# ── Core functions ────────────────────────────────────────────────────────────

def calculate_position_multipliers(questionnaire: dict) -> Dict[str, float]:
    """Calculate position multipliers from questionnaire data."""
    positions = {
        "DL_stand": ["f3", "f4", "f5", "f6", "f8", "sp1"],
        "split_stand": ["f1", "f2", "f3", "f7", "f13", "f15", "sp1", "sp4"],
        "SL_stand": ["f1", "f2", "f4", "f9", "f11", "sp1", "sp2", "sp3", "sp4"],
        "quadruped": ["f5", "sp5", "st2", "p3", "p4"],
    }

    multipliers: Dict[str, float] = {}

    for position, questions in positions.items():
        values = [int(questionnaire.get(q, 0) or 0) for q in questions]
        avg = _average(values)
        multipliers[position] = (4 - avg) / 4

    best_active = max(
        multipliers["DL_stand"],
        multipliers["split_stand"],
        multipliers["SL_stand"],
        multipliers["quadruped"],
    )
    multipliers["lying"] = max(0.1, 1.0 - best_active)

    return multipliers


def calculate_sts_score(repetition_count: int, age: int, gender: str) -> float:
    """Calculate STS normalized score (0-1)."""
    benchmarks = {
        "male": {"60-64": 14, "65-69": 12, "70-74": 12, "75-79": 11, "80-84": 10, "85-89": 8, "90-94": 7},
        "female": {"60-64": 12, "65-69": 11, "70-74": 10, "75-79": 10, "80-84": 9, "85-89": 8, "90-94": 4},
    }
    age_group = _get_age_group(age)
    g = gender.lower() if gender else "male"
    if g not in benchmarks:
        g = "male"
    benchmark = benchmarks[g].get(age_group, 12)
    return min(1.0, repetition_count / benchmark)


def calculate_enhanced_combined_score(pain_avg: float, symptoms_avg: float, sts_score: float) -> float:
    """Calculate combined score with conflict resolution."""
    pain_score = (4 - pain_avg) / 4
    symptom_score = (4 - symptoms_avg) / 4
    subjective_score = pain_score * 0.5 + symptom_score * 0.5

    combined = sts_score * 0.5 + pain_score * 0.25 + symptom_score * 0.25

    if abs(sts_score - subjective_score) > 0.5:
        conservative = min(sts_score, subjective_score)
        combined = conservative * 0.6 + combined * 0.4

    return max(0.1, min(0.9, combined))


def calculate_difficulty_modifier(combined_score: float, exercise_difficulty: int) -> float:
    preferred = 1 + combined_score * 9
    distance = abs(exercise_difficulty - preferred)
    return 1 / (1 + distance * 0.2)


def apply_core_stability_filter(exercises: List[dict], trunk_sway: str, hip_sway: str) -> List[dict]:
    if trunk_sway == "present" or hip_sway == "present":
        return [ex for ex in exercises if ex.get("core_ipsi")]
    return exercises


def calculate_alignment_modifier(knee_alignment: str, exercise: dict) -> float:
    if knee_alignment == "valgus":
        return 1.0 + (exercise.get("muscle_glute_med_min", 0) or 0) / 5.0
    if knee_alignment == "varus":
        return 1.0 + (exercise.get("muscle_adductors", 0) or 0) / 5.0
    return 1.0


def calculate_flexibility_modifier(toe_touch: str, exercise: dict) -> float:
    if toe_touch == "cannot":
        ham = exercise.get("muscle_hamstring", 0) or 0
        glute = exercise.get("muscle_glute_max", 0) or 0
        return 1.0 + max(ham, glute) / 12.5
    return 1.0


def select_best_positions(multipliers: Dict[str, float]) -> List[dict]:
    arr = [{"position": k, "multiplier": v} for k, v in multipliers.items()]
    arr.sort(key=lambda x: x["multiplier"], reverse=True)
    return arr[:2]


def get_exercises_for_position(position: str, exercises: List[dict]) -> List[dict]:
    if position == "lying":
        return [ex for ex in exercises if ex.get("position_supine_lying") or ex.get("position_side_lying")]
    mapping = {
        "DL_stand": "position_dl_stand",
        "split_stand": "position_split_stand",
        "SL_stand": "position_sl_stand",
        "quadruped": "position_quadruped",
    }
    col = mapping.get(position)
    if not col:
        return []
    return [ex for ex in exercises if ex.get(col)]


def rank_exercises_within_position(
    position: str,
    exercises: List[dict],
    enhanced_combined_score: float,
    knee_alignment: str,
    toe_touch: str,
    trunk_sway: str,
    hip_sway: str,
) -> List[dict]:
    pos_exercises = get_exercises_for_position(position, exercises)
    pos_exercises = apply_core_stability_filter(pos_exercises, trunk_sway, hip_sway)

    scored = []
    for ex in pos_exercises:
        diff = calculate_difficulty_modifier(enhanced_combined_score, ex.get("difficulty_level", 1))
        align = calculate_alignment_modifier(knee_alignment, ex)
        flex = calculate_flexibility_modifier(toe_touch, ex)
        final = diff * align * flex
        scored.append({
            "exercise": ex,
            "difficulty_score": diff,
            "alignment_modifier": align,
            "flexibility_modifier": flex,
            "final_score": final,
        })
    scored.sort(key=lambda x: x["final_score"], reverse=True)
    return scored[:2]


def calculate_recommendations(questionnaire: dict, sts_data: dict, exercises: List[dict]) -> dict:
    """Main orchestration – returns complete recommendation payload."""
    position_multipliers = calculate_position_multipliers(questionnaire)

    pain_qs = ["p1", "p2", "p3", "p4", "p5", "p6", "p7", "p8", "p9"]
    symptom_qs = ["sp1", "sp2", "sp3", "sp4", "sp5"]

    pain_vals = [int(questionnaire.get(q, 0) or 0) for q in pain_qs]
    symptom_vals = [int(questionnaire.get(q, 0) or 0) for q in symptom_qs]

    pain_avg = _average(pain_vals)
    symptoms_avg = _average(symptom_vals)

    sts_score = calculate_sts_score(
        sts_data["repetition_count"],
        sts_data["age"],
        sts_data["gender"],
    )

    combined = calculate_enhanced_combined_score(pain_avg, symptoms_avg, sts_score)

    selected = select_best_positions(position_multipliers)

    recommendations = []
    for item in selected:
        ranked = rank_exercises_within_position(
            item["position"],
            exercises,
            combined,
            sts_data.get("knee_alignment", "normal"),
            questionnaire.get("toe_touch_test", "can"),
            sts_data.get("trunk_sway", "absent"),
            sts_data.get("hip_sway", "absent"),
        )
        recommendations.append({
            "position": item["position"],
            "position_multiplier": item["multiplier"],
            "exercises": ranked,
        })

    return {
        "position_multipliers": position_multipliers,
        "scores": {
            "pain_score": (4 - pain_avg) / 4,
            "symptom_score": (4 - symptoms_avg) / 4,
            "sts_score": sts_score,
            "combined_score": combined,
        },
        "recommendations": recommendations,
        "biomechanical_flags": {
            "core_stability_required": sts_data.get("trunk_sway") == "present" or sts_data.get("hip_sway") == "present",
            "flexibility_deficit": questionnaire.get("toe_touch_test") == "cannot",
            "alignment_issue": sts_data.get("knee_alignment", "normal") != "normal",
        },
    }
