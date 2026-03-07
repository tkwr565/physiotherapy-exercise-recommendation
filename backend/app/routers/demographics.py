from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import PatientDemographics, User
from app.schemas import DemographicsCreate, DemographicsResponse

router = APIRouter()


@router.post("/", response_model=DemographicsResponse)
def upsert_demographics(body: DemographicsCreate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == body.username).first()
    if not user:
        # Auto-create user if it doesn't exist
        user = User(username=body.username)
        db.add(user)
        db.commit()
        db.refresh(user)

    existing = db.query(PatientDemographics).filter(
        PatientDemographics.username == body.username
    ).first()

    if existing:
        existing.date_of_birth = body.date_of_birth
        existing.gender = body.gender
        existing.height_cm = body.height_cm
        existing.weight_kg = body.weight_kg
        db.commit()
        db.refresh(existing)
        return existing

    demo = PatientDemographics(
        username=body.username,
        date_of_birth=body.date_of_birth,
        gender=body.gender,
        height_cm=body.height_cm,
        weight_kg=body.weight_kg,
    )
    db.add(demo)
    db.commit()
    db.refresh(demo)
    return demo


@router.get("/{username}", response_model=DemographicsResponse)
def get_demographics(username: str, db: Session = Depends(get_db)):
    demo = db.query(PatientDemographics).filter(
        PatientDemographics.username == username
    ).first()
    if not demo:
        raise HTTPException(status_code=404, detail="Demographics not found")
    return demo
