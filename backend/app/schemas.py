from datetime import date, datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


# ── User Schemas ──────────────────────────────────────────────────────────────

class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=50, pattern=r"^[a-zA-Z0-9_-]+$")


class UserResponse(BaseModel):
    id: int
    username: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class UserProgressResponse(BaseModel):
    username: str
    has_demographics: bool
    has_questionnaire: bool
    has_sts_assessment: bool


# ── Auth Schema ───────────────────────────────────────────────────────────────

class PasscodeVerify(BaseModel):
    passcode: str


# ── Demographics Schemas ──────────────────────────────────────────────────────

class DemographicsCreate(BaseModel):
    username: str
    date_of_birth: date
    gender: str = Field(..., pattern=r"^(Male|Female)$")
    height_cm: float = Field(..., gt=0, le=300)
    weight_kg: float = Field(..., gt=0, le=500)


class DemographicsResponse(BaseModel):
    id: int
    username: str
    date_of_birth: date
    gender: str
    height_cm: float
    weight_kg: float
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ── Questionnaire Schemas ─────────────────────────────────────────────────────

class QuestionnaireCreate(BaseModel):
    username: str

    # Function questions
    f1: Optional[int] = Field(None, ge=0, le=4)
    f2: Optional[int] = Field(None, ge=0, le=4)
    f3: Optional[int] = Field(None, ge=0, le=4)
    f4: Optional[int] = Field(None, ge=0, le=4)
    f5: Optional[int] = Field(None, ge=0, le=4)
    f6: Optional[int] = Field(None, ge=0, le=4)
    f7: Optional[int] = Field(None, ge=0, le=4)
    f8: Optional[int] = Field(None, ge=0, le=4)
    f9: Optional[int] = Field(None, ge=0, le=4)
    f10: Optional[int] = Field(None, ge=0, le=4)
    f11: Optional[int] = Field(None, ge=0, le=4)
    f12: Optional[int] = Field(None, ge=0, le=4)
    f13: Optional[int] = Field(None, ge=0, le=4)
    f14: Optional[int] = Field(None, ge=0, le=4)
    f15: Optional[int] = Field(None, ge=0, le=4)
    f16: Optional[int] = Field(None, ge=0, le=4)
    f17: Optional[int] = Field(None, ge=0, le=4)

    # Pain questions
    p1: Optional[int] = Field(None, ge=0, le=4)
    p2: Optional[int] = Field(None, ge=0, le=4)
    p3: Optional[int] = Field(None, ge=0, le=4)
    p4: Optional[int] = Field(None, ge=0, le=4)
    p5: Optional[int] = Field(None, ge=0, le=4)
    p6: Optional[int] = Field(None, ge=0, le=4)
    p7: Optional[int] = Field(None, ge=0, le=4)
    p8: Optional[int] = Field(None, ge=0, le=4)
    p9: Optional[int] = Field(None, ge=0, le=4)

    # Sport/Recreation questions
    sp1: Optional[int] = Field(None, ge=0, le=4)
    sp2: Optional[int] = Field(None, ge=0, le=4)
    sp3: Optional[int] = Field(None, ge=0, le=4)
    sp4: Optional[int] = Field(None, ge=0, le=4)
    sp5: Optional[int] = Field(None, ge=0, le=4)

    # Stiffness questions
    st1: Optional[int] = Field(None, ge=0, le=4)
    st2: Optional[int] = Field(None, ge=0, le=4)

    # Symptom questions
    s1: Optional[int] = Field(None, ge=0, le=4)
    s2: Optional[int] = Field(None, ge=0, le=4)
    s3: Optional[int] = Field(None, ge=0, le=4)
    s4: Optional[int] = Field(None, ge=0, le=4)
    s5: Optional[int] = Field(None, ge=0, le=4)

    # Quality of Life
    q1: Optional[int] = Field(None, ge=0, le=4)
    q2: Optional[int] = Field(None, ge=0, le=4)
    q3: Optional[int] = Field(None, ge=0, le=4)
    q4: Optional[int] = Field(None, ge=0, le=4)

    # Flexibility
    toe_touch_test: Optional[str] = Field(None, pattern=r"^(can|cannot)$")


class QuestionnaireResponse(BaseModel):
    id: int
    username: Optional[str] = None
    f1: Optional[int] = None
    f2: Optional[int] = None
    f3: Optional[int] = None
    f4: Optional[int] = None
    f5: Optional[int] = None
    f6: Optional[int] = None
    f7: Optional[int] = None
    f8: Optional[int] = None
    f9: Optional[int] = None
    f10: Optional[int] = None
    f11: Optional[int] = None
    f12: Optional[int] = None
    f13: Optional[int] = None
    f14: Optional[int] = None
    f15: Optional[int] = None
    f16: Optional[int] = None
    f17: Optional[int] = None
    p1: Optional[int] = None
    p2: Optional[int] = None
    p3: Optional[int] = None
    p4: Optional[int] = None
    p5: Optional[int] = None
    p6: Optional[int] = None
    p7: Optional[int] = None
    p8: Optional[int] = None
    p9: Optional[int] = None
    sp1: Optional[int] = None
    sp2: Optional[int] = None
    sp3: Optional[int] = None
    sp4: Optional[int] = None
    sp5: Optional[int] = None
    st1: Optional[int] = None
    st2: Optional[int] = None
    s1: Optional[int] = None
    s2: Optional[int] = None
    s3: Optional[int] = None
    s4: Optional[int] = None
    s5: Optional[int] = None
    q1: Optional[int] = None
    q2: Optional[int] = None
    q3: Optional[int] = None
    q4: Optional[int] = None
    toe_touch_test: Optional[str] = None
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ── STS Assessment Schemas ────────────────────────────────────────────────────

class STSAssessmentCreate(BaseModel):
    username: str
    repetition_count: int = Field(..., ge=0)
    knee_alignment: str = Field(..., pattern=r"^(normal|valgus|varus)$")
    trunk_sway: str = Field(..., pattern=r"^(present|absent)$")
    hip_sway: str = Field(..., pattern=r"^(present|absent)$")


class STSAssessmentResponse(BaseModel):
    id: int
    username: Optional[str] = None
    repetition_count: int
    knee_alignment: str
    trunk_sway: str
    hip_sway: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ── Exercise Schemas ──────────────────────────────────────────────────────────

class ExerciseResponse(BaseModel):
    id: int
    exercise_name: str
    exercise_name_ch: Optional[str] = None
    position_sl_stand: Optional[bool] = False
    position_split_stand: Optional[bool] = False
    position_dl_stand: Optional[bool] = False
    position_quadruped: Optional[bool] = False
    position_supine_lying: Optional[bool] = False
    position_side_lying: Optional[bool] = False
    muscle_quad: Optional[int] = 0
    muscle_hamstring: Optional[int] = 0
    muscle_glute_max: Optional[int] = 0
    muscle_hip_flexors: Optional[int] = 0
    muscle_glute_med_min: Optional[int] = 0
    muscle_adductors: Optional[int] = 0
    core_ipsi: Optional[bool] = False
    core_contra: Optional[bool] = False
    difficulty_level: int

    class Config:
        from_attributes = True


# ── Recommendation Schemas ────────────────────────────────────────────────────

class RecommendationRequest(BaseModel):
    username: str


class ScoredExercise(BaseModel):
    exercise: ExerciseResponse
    difficulty_score: float
    alignment_modifier: float
    flexibility_modifier: float
    final_score: float


class PositionRecommendation(BaseModel):
    position: str
    position_multiplier: float
    exercises: List[ScoredExercise]


class AlgorithmScores(BaseModel):
    pain_score: float
    symptom_score: float
    sts_score: float
    combined_score: float


class BiomechanicalFlags(BaseModel):
    core_stability_required: bool
    flexibility_deficit: bool
    alignment_issue: bool


class RecommendationResponse(BaseModel):
    position_multipliers: Dict[str, float]
    scores: AlgorithmScores
    recommendations: List[PositionRecommendation]
    biomechanical_flags: BiomechanicalFlags


# ── LLM Recommendation Schemas ───────────────────────────────────────────────

class LLMRecommendationRequest(BaseModel):
    username: str
    language: str = "en"


class LLMRecommendationResponse(BaseModel):
    recommendations: List[Dict[str, Any]]
    reasoning: str
    clinical_justification: str


# ── DeepSeek LLM Recommendation Schemas ──────────────────────────────────────

class DeepSeekRecommendationRequest(BaseModel):
    username: str
    language: str = "en"


class DeepSeekRecommendationResponse(BaseModel):
    biomechanical_targets: List[Dict[str, Any]]
    patient_assessment: Dict[str, Any]
    llm1_recommendations: List[Dict[str, Any]]
    safety_review: Dict[str, Any]
    exercise_decisions: List[Dict[str, Any]]
    final_prescription: List[Dict[str, Any]]
