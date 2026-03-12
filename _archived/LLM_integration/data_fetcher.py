"""
Data Fetcher Module for LLM Integration
Fetches patient data from Supabase and structures it for LLM consumption

UPDATED FOR NORMALIZED EXERCISE SCHEMA V3.0
"""

from datetime import datetime
from typing import Dict, List, Any


# STS Normative Benchmarks (Hong Kong Norms)
# Structure: {gender: {age_group: {'below': int, 'average_min': int, 'average_max': int, 'above': int}}}
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


def get_age_from_dob(date_of_birth: str) -> int:
    """Calculate age from date of birth"""
    dob = datetime.strptime(date_of_birth, '%Y-%m-%d')
    today = datetime.today()
    age = today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))
    return age


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


def calculate_section_scores(questionnaire_data: Dict) -> Dict[str, Any]:
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
        scores = [questionnaire_data.get(q, 0) for q in questions]
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


def get_position_relevant_questions(questionnaire_data: Dict) -> Dict[str, Any]:
    """
    Get position-relevant questions WITHOUT pre-calculated scores
    Let LLM interpret raw question-response pairs directly

    Position categories:
    - Weight-bearing spectrum: DL_stand → split_stand → SL_stand (increasing difficulty)
    - Quadruped: Kneeling tolerance
    - Lying: Safe by default (no specific questions)

    Returns question text + score for each question
    """
    # Question text mapping (from Unified_WOMAC_KOOS_Form.md)
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
    # DL_stand: F4, SP1
    # Split_stand: F2, F4, SP1, SP4
    # SL_stand: F1, F2, SP4
    weight_bearing_questions = [
        {'code': 'f1', 'question': QUESTION_TEXT['f1'], 'score': questionnaire_data.get('f1', 0), 'positions': ['SL_stand']},
        {'code': 'f2', 'question': QUESTION_TEXT['f2'], 'score': questionnaire_data.get('f2', 0), 'positions': ['split_stand', 'SL_stand']},
        {'code': 'f4', 'question': QUESTION_TEXT['f4'], 'score': questionnaire_data.get('f4', 0), 'positions': ['DL_stand', 'split_stand']},
        {'code': 'sp1', 'question': QUESTION_TEXT['sp1'], 'score': questionnaire_data.get('sp1', 0), 'positions': ['DL_stand', 'split_stand']},
        {'code': 'sp4', 'question': QUESTION_TEXT['sp4'], 'score': questionnaire_data.get('sp4', 0), 'positions': ['split_stand', 'SL_stand']}
    ]

    # Quadruped question (SP5)
    quadruped_questions = [
        {'code': 'sp5', 'question': QUESTION_TEXT['sp5'], 'score': questionnaire_data.get('sp5', 0)}
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


def fetch_patient_data(supabase, username: str) -> Dict[str, Any]:
    """
    Fetch all patient data from Supabase

    Returns:
        {
            'demographics': {...},
            'questionnaire': {...},
            'sts': {...}
        }
    """
    # Fetch demographics
    demographics_response = supabase.table('patient_demographics').select('*').eq('username', username).execute()
    demographics = demographics_response.data[0] if demographics_response.data else None

    if not demographics:
        raise ValueError(f"No patient demographics found for username: {username}")

    # Fetch questionnaire responses
    questionnaire_response = supabase.table('questionnaire_responses').select('*').eq('username', username).execute()
    questionnaire = questionnaire_response.data[0] if questionnaire_response.data else None

    if not questionnaire:
        raise ValueError(f"No questionnaire responses found for username: {username}")

    # Fetch STS assessment
    sts_response = supabase.table('sts_assessments').select('*').eq('username', username).execute()
    sts = sts_response.data[0] if sts_response.data else None

    if not sts:
        raise ValueError(f"No STS assessment found for username: {username}")

    return {
        'demographics': demographics,
        'questionnaire': questionnaire,
        'sts': sts
    }


def fetch_all_exercises_v3(supabase) -> List[Dict[str, Any]]:
    """
    Fetch all exercises from NORMALIZED SCHEMA V3.0 (6 tables)

    Joins:
    - exercises (main)
    - exercise_positions
    - exercise_muscles
    - exercise_progressions
    - exercise_safety_constraints
    - exercise_sports

    Returns list of exercises in LLM-ready format (matching exercises_formatted.json)
    """
    # Fetch main exercises
    exercises_response = supabase.table('exercises').select('*').execute()
    exercises_raw = exercises_response.data if exercises_response.data else []

    if not exercises_raw:
        raise ValueError("No exercises found in database - check RLS settings on exercises table")

    # Fetch all related data in parallel
    positions_response = supabase.table('exercise_positions').select('*').execute()
    muscles_response = supabase.table('exercise_muscles').select('*').execute()
    progressions_response = supabase.table('exercise_progressions').select('*').execute()
    safety_response = supabase.table('exercise_safety_constraints').select('*').execute()
    sports_response = supabase.table('exercise_sports').select('*').execute()

    positions_data = positions_response.data if positions_response.data else []
    muscles_data = muscles_response.data if muscles_response.data else []
    progressions_data = progressions_response.data if progressions_response.data else []
    safety_data = safety_response.data if safety_response.data else []
    sports_data = sports_response.data if sports_response.data else []

    # Group related data by exercise_id
    positions_by_exercise = {}
    muscles_by_exercise = {}
    progressions_by_exercise = {}
    safety_by_exercise = {}
    sports_by_exercise = {}

    for pos in positions_data:
        ex_id = pos['exercise_id']
        if ex_id not in positions_by_exercise:
            positions_by_exercise[ex_id] = []
        positions_by_exercise[ex_id].append(pos['position'])

    for muscle in muscles_data:
        ex_id = muscle['exercise_id']
        if ex_id not in muscles_by_exercise:
            muscles_by_exercise[ex_id] = {'primary_movers': [], 'secondary_movers': [], 'stabiliser': []}

        muscle_entry = {'muscle': muscle['muscle'], 'value': muscle['muscle_value']}

        if muscle['muscle_type'] == 'P':
            muscles_by_exercise[ex_id]['primary_movers'].append(muscle_entry)
        elif muscle['muscle_type'] == 'N':
            muscles_by_exercise[ex_id]['secondary_movers'].append(muscle_entry)
        elif muscle['muscle_type'] == 'S':
            muscles_by_exercise[ex_id]['stabiliser'].append(muscle_entry)

    for prog in progressions_data:
        ex_id = prog['exercise_id']
        if ex_id not in progressions_by_exercise:
            progressions_by_exercise[ex_id] = {'progression_from': [], 'progression_to': []}

        if prog['progression_type'] == 'regression':
            progressions_by_exercise[ex_id]['progression_from'].append(prog['related_exercise_name'])
        elif prog['progression_type'] == 'progression':
            progressions_by_exercise[ex_id]['progression_to'].append(prog['related_exercise_name'])

    for safety in safety_data:
        ex_id = safety['exercise_id']
        if ex_id not in safety_by_exercise:
            safety_by_exercise[ex_id] = []
        safety_by_exercise[ex_id].append(safety['constraint_type'])

    for sport in sports_data:
        ex_id = sport['exercise_id']
        if ex_id not in sports_by_exercise:
            sports_by_exercise[ex_id] = []
        sports_by_exercise[ex_id].append(sport['sport'])

    # Construct final exercise list
    exercises = []
    for ex in exercises_raw:
        ex_id = ex['id']

        exercise = {
            'id': ex_id,
            'exercise_name': ex['exercise_name'],
            'exercise_name_ch': ex['exercise_name_ch'],
            'positions': positions_by_exercise.get(ex_id, []),
            'muscles': muscles_by_exercise.get(ex_id, {'primary_movers': [], 'secondary_movers': [], 'stabiliser': []}),
            'difficulty': {
                'level': ex['difficulty_level'],
                'category': ex['difficulty_category']
            },
            'safety_constraints': safety_by_exercise.get(ex_id, []),
            'sport_similarity': sports_by_exercise.get(ex_id, []),
            'progression_from': progressions_by_exercise.get(ex_id, {}).get('progression_from', []),
            'progression_to': progressions_by_exercise.get(ex_id, {}).get('progression_to', []),
            'core_ipsi': ex['core_ipsi'],
            'core_contra': ex['core_contra'],
            'toe_touch': ex['toe_touch'],
            'clinical_summary': ex.get('clinical_summary', '')
        }

        exercises.append(exercise)

    return exercises


def structure_patient_profile(raw_data: Dict[str, Any], exercises: List[Dict]) -> Dict[str, Any]:
    """
    Structure raw patient data into LLM-ready format

    Args:
        raw_data: Output from fetch_patient_data()
        exercises: Output from fetch_all_exercises_v3()

    Returns:
        Complete patient profile for LLM consumption
    """
    demographics = raw_data['demographics']
    questionnaire = raw_data['questionnaire']
    sts = raw_data['sts']

    # Calculate age
    age = get_age_from_dob(demographics['date_of_birth'])

    # Calculate section scores
    section_scores = calculate_section_scores(questionnaire)

    # Get position-relevant questions (NO pre-calculated scores)
    position_questions = get_position_relevant_questions(questionnaire)

    # Calculate STS benchmark
    sts_benchmark = calculate_sts_benchmark(
        age=age,
        gender=demographics['gender'],
        repetition_count=sts['repetition_count']
    )

    # Structure complete profile
    profile = {
        'demographics': {
            'age': age,
            'gender': demographics['gender'],
            'height_cm': float(demographics['height_cm']),
            'weight_kg': float(demographics['weight_kg']),
            'date_of_birth': demographics['date_of_birth']
        },
        'questionnaire_sections': section_scores,
        'position_relevant_questions': position_questions,
        'flexibility': {
            'toe_touch_test': questionnaire.get('toe_touch_test', 'cannot')
        },
        'sts_assessment': {
            'repetition_count': sts['repetition_count'],
            'age_gender_benchmark_range': sts_benchmark['age_gender_benchmark_range'],
            'benchmark_performance': sts_benchmark['benchmark_performance'],
            'trunk_sway': sts['trunk_sway'],
            'hip_sway': sts['hip_sway'],
            'knee_alignment': sts['knee_alignment']
        },
        'exercises': exercises
    }

    return profile


def print_patient_summary(profile: Dict[str, Any]) -> None:
    """
    Print a human-readable summary of patient profile
    """
    print("="*80)
    print("PATIENT PROFILE SUMMARY")
    print("="*80)

    demo = profile['demographics']
    print(f"\nDemographics:")
    print(f"  Age: {demo['age']} | Gender: {demo['gender']}")
    print(f"  Height: {demo['height_cm']} cm | Weight: {demo['weight_kg']} kg")

    sts = profile['sts_assessment']
    print(f"\nSTS Assessment:")
    print(f"  Repetitions: {sts['repetition_count']}")
    print(f"  HK Norm (Average): {sts['age_gender_benchmark_range']}")
    print(f"  Performance: {sts['benchmark_performance']}")
    print(f"  Knee alignment: {sts['knee_alignment']}")
    print(f"  Trunk sway: {sts['trunk_sway']} | Hip sway: {sts['hip_sway']}")

    print(f"\nQuestionnaire Sections (normalized 0-100, higher=better):")
    for section, data in profile['questionnaire_sections'].items():
        print(f"  {section:20s}: {data['normalized_0_100']:5.1f} (avg: {data['avg']:.2f})")

    print(f"\nPosition-Relevant Questions (0=None, 1=Mild, 2=Moderate, 3=Severe, 4=Extreme):")
    print(f"  Weight-bearing:")
    for q in profile['position_relevant_questions']['weight_bearing_spectrum']['questions']:
        print(f"    {q['code'].upper()}: {q['question']} = {q['score']}")

    print(f"  Quadruped:")
    for q in profile['position_relevant_questions']['quadruped']['questions']:
        print(f"    {q['code'].upper()}: {q['question']} = {q['score']}")

    print(f"  Lying: Safe by default (no specific questions)")

    print(f"\nFlexibility:")
    print(f"  Toe touch test: {profile['flexibility']['toe_touch_test']}")

    print(f"\nExercise database: {len(profile['exercises'])} exercises loaded (normalized schema v3.0)")
    print("="*80)


# Backward compatibility wrapper
def fetch_all_exercises(supabase) -> List[Dict[str, Any]]:
    """
    Wrapper for backward compatibility
    Calls the new v3 fetch function
    """
    return fetch_all_exercises_v3(supabase)


if __name__ == "__main__":
    # Test module with sample data
    print("Data Fetcher Module - Test Mode (Schema V3.0)")
    print("Import this module in Jupyter notebook to use with Supabase")
