from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, PatientDemographics, QuestionnaireResponse as QRModel, STSAssessment
from app.schemas import UserCreate, UserResponse, UserProgressResponse, PasscodeVerify
from app.config import settings

router = APIRouter()


@router.post("/verify-passcode")
def verify_passcode(body: PasscodeVerify):
    if body.passcode != settings.physio_passcode:
        raise HTTPException(status_code=401, detail="Incorrect passcode")
    return {"valid": True, "status": "ok"}


@router.post("/", response_model=UserResponse)
def create_or_login_user(body: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.username == body.username).first()
    if existing:
        return existing

    user = User(username=body.username)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.get("/{username}", response_model=UserResponse)
def get_user(username: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.get("/{username}/progress", response_model=UserProgressResponse)
def get_user_progress(username: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    has_demo = db.query(PatientDemographics).filter(PatientDemographics.username == username).first() is not None
    has_quest = db.query(QRModel).filter(QRModel.username == username).first() is not None
    has_sts = db.query(STSAssessment).filter(STSAssessment.username == username).first() is not None

    return UserProgressResponse(
        username=username,
        has_demographics=has_demo,
        has_questionnaire=has_quest,
        has_sts_assessment=has_sts,
    )
