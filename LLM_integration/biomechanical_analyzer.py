"""
Biomechanical Target Analyzer
Rule-based identification of biomechanical targets from patient assessment data
This replaces LLM-based target identification to improve consistency and reduce tokens
"""

from typing import Dict, Any, List


class BiomechanicalTarget:
    """Data class for biomechanical targets"""

    def __init__(self, issue: str, strategy: str, examples: List[str]):
        self.issue = issue
        self.strategy = strategy
        self.examples = examples

    def to_dict(self) -> Dict[str, Any]:
        return {
            "issue": self.issue,
            "strategy": self.strategy,
            "examples": self.examples,
        }


def identify_biomechanical_targets(
    patient_profile: Dict[str, Any],
) -> List[BiomechanicalTarget]:
    """
    Rule-based identification of biomechanical targets from patient data

    Args:
        patient_profile: Structured patient data from data_fetcher

    Returns:
        List of BiomechanicalTarget objects
    """
    targets = []

    # Extract relevant data
    sts_assessment = patient_profile.get("sts_assessment", {})
    flexibility = patient_profile.get("flexibility", {})

    knee_alignment = sts_assessment.get("knee_alignment", "").lower()
    trunk_sway = sts_assessment.get("trunk_sway", "").lower()
    hip_sway = sts_assessment.get("hip_sway", "").lower()
    touch_toes = flexibility.get("toe_touch_test", "").lower()

    # 1. Check for Valgus alignment (knock-knees)
    if knee_alignment == "valgus":
        targets.append(
            BiomechanicalTarget(
                issue="Dynamic knee instability (Valgus alignment - knock-knees)",
                strategy=(
                    "Dynamic knee instability usually associates with weak core anti-rotation control, "
                    "to prioritize exercises with `core_contra=true`. Prioritize exercises with high "
                    "glute_med_min in muscles.primary_movers or muscles.secondary_movers (value 4-5). "
                    "Match muscle role to functional capacity: for lower function patient, try to find "
                    "those muscle target in muscles.primary_movers or muscles.secondary_movers; for "
                    "higher function patient, prioritize finding those muscle target in muscles.stabiliser"
                ),
                examples=[
                    "Side lying clamshell",
                    "hip abduction",
                    "side plank variations",
                ],
            )
        )

    # 2. Check for Varus alignment (bow-legged)
    if knee_alignment == "varus":
        targets.append(
            BiomechanicalTarget(
                issue="Dynamic knee instability (Varus alignment - bow-legged)",
                strategy=(
                    "Dynamic knee instability usually associates with weak core anti-rotation control, "
                    "to prioritize exercises with `core_contra=true`. Prioritize exercises with high "
                    "adductors in muscles (value 4-5). Match muscle role to functional capacity: for "
                    "lower function patient, try to find those muscle target in muscles.primary_movers "
                    "or muscles.secondary_movers; for higher function patient, prioritize finding those "
                    "muscle target in muscles.stabiliser"
                ),
                examples=["Copenhagen adductor exercises", "adductor squeezes"],
            )
        )

    # 3. Check if patient cannot touch toes
    if touch_toes == "cannot":
        targets.append(
            BiomechanicalTarget(
                issue="Limited posterior chain flexibility (cannot touch toes)",
                strategy=(
                    "Prioritize exercises with high hamstring + glute_max in muscles (value 4-5 each)"
                ),
                examples=["Glute bridges", "hamstring bridges", "hip hinge exercises"],
            )
        )

    # 4. Check for core instability (trunk or hip sway)
    # Note: We check if EITHER trunk_sway or hip_sway is present
    if trunk_sway == "present" or hip_sway == "present":
        sway_types = []
        if trunk_sway == "present":
            sway_types.append("trunk sway")
        if hip_sway == "present":
            sway_types.append("hip sway")

        targets.append(
            BiomechanicalTarget(
                issue=f"Core instability ({' and '.join(sway_types)} present)",
                strategy=("Prioritize exercises where `core_ipsi=true`"),
                examples=["Exercises requiring ipsilateral core stability"],
            )
        )

    # 5. Special case: Can touch toes (optional guidance)
    if touch_toes == "can":
        targets.append(
            BiomechanicalTarget(
                issue="Good posterior chain flexibility (can touch toes)",
                strategy=(
                    "Patient has adequate hamstring/glute flexibility. May consider Quadruped Position "
                    "over Supine if kneeling tolerance allows."
                ),
                examples=["Quadruped exercises may be appropriate"],
            )
        )

    return targets


def format_targets_for_prompt(targets: List[BiomechanicalTarget]) -> str:
    """
    Format biomechanical targets as text for LLM prompt

    Args:
        targets: List of BiomechanicalTarget objects

    Returns:
        Formatted string for LLM prompt
    """
    if not targets:
        return "No specific biomechanical targets identified."

    lines = ["IDENTIFIED BIOMECHANICAL TARGETS FOR THIS PATIENT:", ""]

    for i, target in enumerate(targets, 1):
        lines.append(f"{i}. Issue: {target.issue}")
        lines.append(f"   Strategy: {target.strategy}")
        lines.append(f"   Examples: {', '.join(target.examples)}")
        lines.append("")

    return "\n".join(lines)


def print_biomechanical_targets(targets: List[BiomechanicalTarget]) -> None:
    """
    Print biomechanical targets in human-readable format

    Args:
        targets: List of BiomechanicalTarget objects
    """
    print("=" * 80)
    print("BIOMECHANICAL TARGET ANALYSIS (RULE-BASED)")
    print("=" * 80)

    if not targets:
        print("\nNo specific biomechanical targets identified.")
    else:
        print(f"\n{len(targets)} biomechanical target(s) identified:\n")
        for i, target in enumerate(targets, 1):
            print(f"{i}. Issue: {target.issue}")
            print(f"   Strategy: {target.strategy}")
            print(f"   Examples: {', '.join(target.examples)}")
            print()

    print("=" * 80)


if __name__ == "__main__":
    # Test with sample data
    sample_patient = {
        "sts_assessment": {
            "repetition_count": 14,
            "age_gender_benchmark_range": "11 - 14",
            "benchmark_performance": "Average",
            "trunk_sway": "present",
            "hip_sway": "absent",
            "knee_alignment": "valgus",
        },
        "flexibility": {"touch_toes": "cannot"},
    }

    targets = identify_biomechanical_targets(sample_patient)
    print_biomechanical_targets(targets)
    print("\nFormatted for LLM prompt:")
    print(format_targets_for_prompt(targets))
