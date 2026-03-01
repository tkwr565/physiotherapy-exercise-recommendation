from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import STSAssessment, User
from app.schemas import STSAssessmentCreate, STSAssessmentResponse

router = APIRouter()


@router.post("/", response_model=STSAssessmentResponse)
def upsert_sts_assessment(body: STSAssessmentCreate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == body.username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    existing = db.query(STSAssessment).filter(STSAssessment.username == body.username).first()

    if existing:
        existing.repetition_count = body.repetition_count
        existing.knee_alignment = body.knee_alignment
        existing.trunk_sway = body.trunk_sway
        existing.hip_sway = body.hip_sway
        db.commit()
        db.refresh(existing)
        return existing

    sts = STSAssessment(
        user_id=user.id,
        username=body.username,
        repetition_count=body.repetition_count,
        knee_alignment=body.knee_alignment,
        trunk_sway=body.trunk_sway,
        hip_sway=body.hip_sway,
    )
    db.add(sts)
    db.commit()
    db.refresh(sts)
    return sts


@router.get("/{username}", response_model=STSAssessmentResponse)
def get_sts_assessment(username: str, db: Session = Depends(get_db)):
    sts = db.query(STSAssessment).filter(STSAssessment.username == username).first()
    if not sts:
        raise HTTPException(status_code=404, detail="STS assessment not found")
    return sts
