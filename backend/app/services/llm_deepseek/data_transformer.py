"""
Data Transformer Module for LLM Integration (Backend version)
Transforms PostgreSQL database data into LLM-ready format
Adapted from LLM_integration/data_fetcher.py for backend use
"""

from typing import Dict, List, Any


# STS Normative Benchmarks (Hong Kong Norms)
STS_BENCHMARKS = {
    'Male': {
        '60-64': {'below': 11, 'average_min': 12, 'average_max': 16, 'above': 17},
        '65-69': {'below': 10, 'average_min': 11, 'average_max': 15, 'above': 16},
        '70-74': {'below': 9, 'average_min': 10, 'average_max': 13, 'above': 14},
        '75-79': {'below': 9, 'average_min': 10, 'average_max': 13, 'above': 14},
        '80-84': {'below': 9, 'average_min': 10, 'average_max': 13, 'above': 14},
        '85-89': {'below': 6, 'average_min': 7, 'average_max': 10, 'above': 11},
        '90+': {'below': 4, 'average_min': 5, 'average_max': 7, 'above': 8}
    },
    'Female': {
        '60-64': {'below': 10, 'average_min': 11, 'average_max': 14, 'above': 15},
        '65-69': {'below': 9, 'average_min': 10, 'average_max': 13, 'above': 14},
        '70-74': {'below': 8, 'average_min': 9, 'average_max': 12, 'above': 13},
        '75-79': {'below': 7, 'average_min': 8, 'average_max': 11, 'above': 12},
        '80-84': {'below': 7, 'average_min': 8, 'average_max': 11, 'above': 12},
        '85-89': {'below': 7, 'average_min': 8, 'average_max': 9, 'above': 10},
        '90+': {'below': 6, 'average_min': 7, 'average_max': 9, 'above': 10}
    }
}


def get_age_group(age: int) -> str:
    """Get age group for STS benchmarking"""
    if age < 60:
        return '60-64'
    elif age < 65:
        return '60-64'
    elif age < 70:
        return '65-69'
    elif age < 75:
        return '70-74'
    elif age < 80:
        return '75-79'
    elif age < 85:
        return '80-84'
    elif age < 90:
        return '85-89'
    else:
        return '90+'


def calculate_sts_benchmark(age: int, gender: str, repetition_count: int) -> Dict[str, Any]:
    """
    Calculate STS benchmark and performance category (Hong Kong Norms)

    Returns:
        {
            'age_gender_benchmark_range': str (e.g., "11 - 14"),
            'benchmark_performance': str ('Below Average' | 'Average' | 'Above Average')
        }
    """
    age_group = get_age_group(age)
    benchmark_data = STS_BENCHMARKS.get(gender, {}).get(age_group, {
        'below': 10, 'average_min': 11, 'average_max': 14, 'above': 15
    })

    # Determine performance category
    if repetition_count <= benchmark_data['below']:
        performance = 'Below Average'
    elif repetition_count >= benchmark_data['above']:
        performance = 'Above Average'
    else:
        performance = 'Average'

    # Format benchmark range string
    benchmark_range = f"{benchmark_data['average_min']} - {benchmark_data['average_max']}"

    return {
        'age_gender_benchmark_range': benchmark_range,
        'benchmark_performance': performance
    }


def calculate_section_scores(questionnaire_dict: Dict) -> Dict[str, Any]:
    """
    Calculate KOOS/WOMAC section scores

    Scoring: 1-4 scale where 1=best, 4=worst
    Normalized: 0-100 scale where 100=best, 0=worst
    Formula: (4 - avg) / 3 * 100
    """
    sections = {
        'symptoms': ['s1', 's2', 's3', 's4', 's5'],
        'stiffness': ['st1', 'st2'],
        'pain': ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8', 'p9'],
        'function_ADL': ['f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8', 'f9',
                         'f10', 'f11', 'f12', 'f13', 'f14', 'f15', 'f16', 'f17'],
        'function_sports': ['sp1', 'sp2', 'sp3', 'sp4', 'sp5'],
        'quality_of_life': ['q1', 'q2', 'q3', 'q4']
    }

    result = {}

    for section, questions in sections.items():
        scores = [questionnaire_dict.get(q, 0) for q in questions]
        avg = sum(scores) / len(scores) if scores else 0
        total = sum(scores)
        normalized = round(((4 - avg) / 3) * 100, 1)

        result[section] = {
            'questions': questions,
            'scores': scores,
            'avg': round(avg, 2),
            'total': total,
            'normalized_0_100': normalized
        }

    return result


def get_position_relevant_questions(questionnaire_dict: Dict) -> Dict[str, Any]:
    """
    Get position-relevant questions WITHOUT pre-calculated scores
    Let LLM interpret raw question-response pairs directly
    """
    # Question text mapping
    QUESTION_TEXT = {
        'f1': 'Descending stairs',
        'f2': 'Ascending stairs',
        'f4': 'Standing',
        'sp1': 'Squatting',
        'sp2': 'Running',
        'sp4': 'Twisting/pivoting on your injured knee',
        'sp5': 'Kneeling'
    }

    # Weight-bearing spectrum questions
    weight_bearing_questions = [
        {'code': 'f1', 'question': QUESTION_TEXT['f1'], 'score': questionnaire_dict.get('f1', 0), 'positions': ['SL_stand']},
        {'code': 'f2', 'question': QUESTION_TEXT['f2'], 'score': questionnaire_dict.get('f2', 0), 'positions': ['split_stand', 'SL_stand']},
        {'code': 'f4', 'question': QUESTION_TEXT['f4'], 'score': questionnaire_dict.get('f4', 0), 'positions': ['DL_stand', 'split_stand']},
        {'code': 'sp1', 'question': QUESTION_TEXT['sp1'], 'score': questionnaire_dict.get('sp1', 0), 'positions': ['DL_stand', 'split_stand']},
        {'code': 'sp4', 'question': QUESTION_TEXT['sp4'], 'score': questionnaire_dict.get('sp4', 0), 'positions': ['split_stand', 'SL_stand']}
    ]

    # Quadruped question (SP5)
    quadruped_questions = [
        {'code': 'sp5', 'question': QUESTION_TEXT['sp5'], 'score': questionnaire_dict.get('sp5', 0)}
    ]

    return {
        'weight_bearing_spectrum': {
            'description': 'DL_stand (F4, SP1) → split_stand (F2, F4, SP1, SP4) → SL_stand (F1, F2, SP4) - increasing difficulty',
            'questions': weight_bearing_questions,
            'interpretation': 'Score scale: 0=None, 1=Mild, 2=Moderate, 3=Severe, 4=Extreme difficulty. Lower scores (0-2) = better capability for standing exercises. Higher scores (3-4) = difficulty with weight-bearing tasks.'
        },
        'quadruped': {
            'description': 'Kneeling tolerance',
            'questions': quadruped_questions,
            'interpretation': 'Score scale: 0=None, 1=Mild, 2=Moderate, 3=Severe, 4=Extreme difficulty. Score 0-2 = can tolerate kneeling. Score 3-4 = avoid quadruped exercises.'
        },
        'lying': {
            'description': 'Supine/side lying positions (easiest, assumed safe for all patients)',
            'questions': [],
            'interpretation': 'No specific questions. Lying positions safe by default.'
        }
    }


def transform_exercises_to_llm_format(exercise_dicts: List[Dict]) -> List[Dict[str, Any]]:
    """
    Transform old schema exercises (boolean flags) to LLM-friendly format

    Note: This works with the OLD schema (boolean position flags).
    For normalized schema v3.0, this would need to be adapted.
    """
    exercises = []

    for ex in exercise_dicts:
        # Build positions list from boolean flags
        positions = []
        if ex.get('position_sl_stand'):
            positions.append('SL_stand')
        if ex.get('position_split_stand'):
            positions.append('split_stand')
        if ex.get('position_dl_stand'):
            positions.append('DL_stand')
        if ex.get('position_quadruped'):
            positions.append('quadruped')
        if ex.get('position_supine_lying'):
            positions.append('supine_lying')
        if ex.get('position_side_lying'):
            positions.append('side_lying')

        # Build muscles structure
        muscles = {
            'primary_movers': [],
            'secondary_movers': [],
            'stabiliser': []
        }

        # Add muscles based on values (simplified - treating all as primary for now)
        if ex.get('muscle_quad', 0) > 0:
            muscles['primary_movers'].append({'muscle': 'quad', 'value': ex['muscle_quad']})
        if ex.get('muscle_hamstring', 0) > 0:
            muscles['primary_movers'].append({'muscle': 'hamstring', 'value': ex['muscle_hamstring']})
        if ex.get('muscle_glute_max', 0) > 0:
            muscles['primary_movers'].append({'muscle': 'glute_max', 'value': ex['muscle_glute_max']})
        if ex.get('muscle_hip_flexors', 0) > 0:
            muscles['primary_movers'].append({'muscle': 'hip_flexors', 'value': ex['muscle_hip_flexors']})
        if ex.get('muscle_glute_med_min', 0) > 0:
            muscles['primary_movers'].append({'muscle': 'glute_med_min', 'value': ex['muscle_glute_med_min']})
        if ex.get('muscle_adductors', 0) > 0:
            muscles['primary_movers'].append({'muscle': 'adductors', 'value': ex['muscle_adductors']})

        exercise = {
            'id': ex['id'],
            'exercise_name': ex['exercise_name'],
            'exercise_name_ch': ex['exercise_name_ch'],
            'positions': positions,
            'muscles': muscles,
            'difficulty': {
                'level': ex['difficulty_level'],
                'category': 'low' if ex['difficulty_level'] <= 3 else 'moderate' if ex['difficulty_level'] <= 6 else 'high'
            },
            'core_ipsi': ex.get('core_ipsi', False),
            'core_contra': ex.get('core_contra', False),
            'safety_constraints': [],  # Not available in old schema
            'progression_from': [],     # Not available in old schema
            'progression_to': [],       # Not available in old schema
        }

        exercises.append(exercise)

    return exercises


def structure_patient_profile(
    questionnaire_dict: Dict,
    sts_dict: Dict,
    exercise_dicts: List[Dict],
    demographics: Dict
) -> Dict[str, Any]:
    """
    Structure patient data into LLM-ready format

    Args:
        questionnaire_dict: Questionnaire responses
        sts_dict: STS assessment data (includes age, gender)
        exercise_dicts: List of exercises from database
        demographics: Demographics data (for additional info)

    Returns:
        Complete patient profile for LLM consumption
    """
    # Calculate section scores
    section_scores = calculate_section_scores(questionnaire_dict)

    # Get position-relevant questions
    position_questions = get_position_relevant_questions(questionnaire_dict)

    # Calculate STS benchmark
    sts_benchmark = calculate_sts_benchmark(
        age=sts_dict['age'],
        gender=sts_dict['gender'],
        repetition_count=sts_dict['repetition_count']
    )

    # Transform exercises to LLM format
    exercises = transform_exercises_to_llm_format(exercise_dicts)

    # Structure complete profile
    profile = {
        'demographics': {
            'age': sts_dict['age'],
            'gender': sts_dict['gender'],
            'height_cm': demographics.get('height_cm', 0),
            'weight_kg': demographics.get('weight_kg', 0),
        },
        'questionnaire_sections': section_scores,
        'position_relevant_questions': position_questions,
        'flexibility': {
            'toe_touch_test': questionnaire_dict.get('toe_touch_test', 'cannot')
        },
        'sts_assessment': {
            'repetition_count': sts_dict['repetition_count'],
            'age_gender_benchmark_range': sts_benchmark['age_gender_benchmark_range'],
            'benchmark_performance': sts_benchmark['benchmark_performance'],
            'trunk_sway': sts_dict['trunk_sway'],
            'hip_sway': sts_dict['hip_sway'],
            'knee_alignment': sts_dict['knee_alignment']
        },
        'exercises': exercises
    }

    return profile
