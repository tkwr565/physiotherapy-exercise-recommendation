from datetime import date, datetime
import asyncio
from concurrent.futures import ThreadPoolExecutor
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import (
    User, PatientDemographics, QuestionnaireResponse as QRModel,
    STSAssessment, Exercise,
)
from app.schemas import (
    RecommendationRequest, RecommendationResponse,
    LLMRecommendationRequest, LLMRecommendationResponse,
    DeepSeekRecommendationRequest, DeepSeekRecommendationResponse
)
from app.services.algorithm import calculate_recommendations
from app.services.llm_recommendation import get_llm_recommendations
from app.services.llm_deepseek import get_deepseek_recommendations

router = APIRouter()

# Thread pool for running blocking LLM calls asynchronously
executor = ThreadPoolExecutor(max_workers=3)


def _calculate_age(dob: date) -> int:
    today = date.today()
    age = today.year - dob.year
    if (today.month, today.day) < (dob.month, dob.day):
        age -= 1
    return age


def _exercise_to_dict(ex: Exercise) -> dict:
    return {
        "id": ex.id,
        "exercise_name": ex.exercise_name,
        "exercise_name_ch": ex.exercise_name_ch,
        "position_sl_stand": ex.position_sl_stand,
        "position_split_stand": ex.position_split_stand,
        "position_dl_stand": ex.position_dl_stand,
        "position_quadruped": ex.position_quadruped,
        "position_supine_lying": ex.position_supine_lying,
        "position_side_lying": ex.position_side_lying,
        "muscle_quad": ex.muscle_quad,
        "muscle_hamstring": ex.muscle_hamstring,
        "muscle_glute_max": ex.muscle_glute_max,
        "muscle_hip_flexors": ex.muscle_hip_flexors,
        "muscle_glute_med_min": ex.muscle_glute_med_min,
        "muscle_adductors": ex.muscle_adductors,
        "core_ipsi": ex.core_ipsi,
        "core_contra": ex.core_contra,
        "difficulty_level": ex.difficulty_level,
    }


def _questionnaire_to_dict(qr: QRModel) -> dict:
    fields = [
        "f1", "f2", "f3", "f4", "f5", "f6", "f7", "f8", "f9",
        "f10", "f11", "f12", "f13", "f14", "f15", "f16", "f17",
        "p1", "p2", "p3", "p4", "p5", "p6", "p7", "p8", "p9",
        "sp1", "sp2", "sp3", "sp4", "sp5", "st1", "st2",
        "s1", "s2", "s3", "s4", "s5",
        "q1", "q2", "q3", "q4",
        "toe_touch_test",
    ]
    return {f: getattr(qr, f, None) for f in fields}


@router.post("/algorithm")
def get_algorithm_recommendations(body: RecommendationRequest, db: Session = Depends(get_db)):
    """Get rule-based algorithm recommendations."""
    user = db.query(User).filter(User.username == body.username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    demo = db.query(PatientDemographics).filter(PatientDemographics.username == body.username).first()
    if not demo:
        raise HTTPException(status_code=400, detail="Demographics not found. Complete demographics first.")

    qr = db.query(QRModel).filter(QRModel.username == body.username).first()
    if not qr:
        raise HTTPException(status_code=400, detail="Questionnaire not found. Complete questionnaire first.")

    sts = db.query(STSAssessment).filter(STSAssessment.username == body.username).first()
    if not sts:
        raise HTTPException(status_code=400, detail="STS assessment not found. Complete STS assessment first.")

    exercises = db.query(Exercise).all()
    if not exercises:
        raise HTTPException(status_code=500, detail="No exercises found in database.")

    questionnaire_dict = _questionnaire_to_dict(qr)
    exercise_dicts = [_exercise_to_dict(ex) for ex in exercises]

    age = _calculate_age(demo.date_of_birth)
    gender = demo.gender.lower() if demo.gender else "male"

    sts_dict = {
        "repetition_count": sts.repetition_count,
        "age": age,
        "gender": gender,
        "knee_alignment": sts.knee_alignment,
        "trunk_sway": sts.trunk_sway,
        "hip_sway": sts.hip_sway,
    }

    results = calculate_recommendations(questionnaire_dict, sts_dict, exercise_dicts)
    return results


@router.post("/llm")
async def get_llm_recommendation_endpoint(body: LLMRecommendationRequest, db: Session = Depends(get_db)):
    """Get OpenAI LLM-enhanced recommendations using LangChain (async, non-blocking)."""
    print("\n" + "="*80)
    print(f"📥 RECEIVED OpenAI request for username: {body.username}, language: {body.language}")
    print("="*80)

    user = db.query(User).filter(User.username == body.username).first()
    if not user:
        print(f"❌ User not found: {body.username}")
        raise HTTPException(status_code=404, detail="User not found")
    print(f"✓ User found: {body.username}")

    demo = db.query(PatientDemographics).filter(PatientDemographics.username == body.username).first()
    if not demo:
        raise HTTPException(status_code=400, detail="Demographics not found.")

    qr = db.query(QRModel).filter(QRModel.username == body.username).first()
    if not qr:
        raise HTTPException(status_code=400, detail="Questionnaire not found.")

    sts = db.query(STSAssessment).filter(STSAssessment.username == body.username).first()
    if not sts:
        raise HTTPException(status_code=400, detail="STS assessment not found.")

    exercises = db.query(Exercise).all()
    if not exercises:
        raise HTTPException(status_code=500, detail="No exercises found in database.")

    questionnaire_dict = _questionnaire_to_dict(qr)
    exercise_dicts = [_exercise_to_dict(ex) for ex in exercises]

    age = _calculate_age(demo.date_of_birth)
    gender = demo.gender.lower() if demo.gender else "male"

    sts_dict = {
        "repetition_count": sts.repetition_count,
        "age": age,
        "gender": gender,
        "knee_alignment": sts.knee_alignment,
        "trunk_sway": sts.trunk_sway,
        "hip_sway": sts.hip_sway,
    }

    # First run the algorithm
    print("✓ Running algorithm recommendations...")
    algorithm_results = calculate_recommendations(questionnaire_dict, sts_dict, exercise_dicts)

    # Then enhance with OpenAI LLM asynchronously (non-blocking)
    print("✓ All data fetched from database, calling OpenAI service asynchronously...")
    try:
        # Run the blocking OpenAI call in a thread pool to avoid blocking the event loop
        loop = asyncio.get_event_loop()
        llm_results = await loop.run_in_executor(
            executor,
            get_llm_recommendations,
            algorithm_results,
            exercise_dicts,
            sts_dict,
            questionnaire_dict,
            body.language,
        )
        print("✓ OpenAI service completed successfully")
        return llm_results
    except ValueError as e:
        print(f"❌ ValueError in OpenAI service: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print(f"❌ Exception in OpenAI service: {str(e)}")
        raise HTTPException(status_code=500, detail=f"OpenAI LLM error: {str(e)}")


@router.post("/deepseek", response_model=DeepSeekRecommendationResponse)
async def get_deepseek_recommendation_endpoint(body: DeepSeekRecommendationRequest, db: Session = Depends(get_db)):
    """Get DeepSeek LLM-enhanced recommendations using two-LLM architecture (async, non-blocking)."""
    print("\n" + "="*80)
    print(f"📥 RECEIVED DeepSeek request for username: {body.username}, language: {body.language}")
    print("="*80)

    user = db.query(User).filter(User.username == body.username).first()
    if not user:
        print(f"❌ User not found: {body.username}")
        raise HTTPException(status_code=404, detail="User not found")
    print(f"✓ User found: {body.username}")

    demo = db.query(PatientDemographics).filter(PatientDemographics.username == body.username).first()
    if not demo:
        raise HTTPException(status_code=400, detail="Demographics not found.")

    qr = db.query(QRModel).filter(QRModel.username == body.username).first()
    if not qr:
        raise HTTPException(status_code=400, detail="Questionnaire not found.")

    sts = db.query(STSAssessment).filter(STSAssessment.username == body.username).first()
    if not sts:
        raise HTTPException(status_code=400, detail="STS assessment not found.")

    exercises = db.query(Exercise).all()
    if not exercises:
        raise HTTPException(status_code=500, detail="No exercises found in database.")

    questionnaire_dict = _questionnaire_to_dict(qr)
    exercise_dicts = [_exercise_to_dict(ex) for ex in exercises]

    age = _calculate_age(demo.date_of_birth)
    gender = demo.gender.lower() if demo.gender else "male"

    sts_dict = {
        "repetition_count": sts.repetition_count,
        "age": age,
        "gender": gender,
        "knee_alignment": sts.knee_alignment,
        "trunk_sway": sts.trunk_sway,
        "hip_sway": sts.hip_sway,
    }

    demographics_dict = {
        "height_cm": float(demo.height_cm),
        "weight_kg": float(demo.weight_kg),
    }

    # Call DeepSeek two-LLM service asynchronously (non-blocking)
    print("✓ All data fetched from database, calling DeepSeek service asynchronously...")
    try:
        # Run the blocking DeepSeek call in a thread pool to avoid blocking the event loop
        loop = asyncio.get_event_loop()
        deepseek_results = await loop.run_in_executor(
            executor,
            get_deepseek_recommendations,
            questionnaire_dict,
            sts_dict,
            exercise_dicts,
            demographics_dict,
            body.language,
        )
        print("✓ DeepSeek service completed successfully")
        return deepseek_results
    except ValueError as e:
        print(f"❌ ValueError in DeepSeek service: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print(f"❌ Exception in DeepSeek service: {str(e)}")
        raise HTTPException(status_code=500, detail=f"DeepSeek LLM error: {str(e)}")
