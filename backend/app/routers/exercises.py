from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Exercise
from app.schemas import ExerciseResponse

router = APIRouter()


@router.get("/", response_model=List[ExerciseResponse])
def list_exercises(db: Session = Depends(get_db)):
    return db.query(Exercise).all()


@router.get("/{exercise_id}", response_model=ExerciseResponse)
def get_exercise(exercise_id: int, db: Session = Depends(get_db)):
    ex = db.query(Exercise).filter(Exercise.id == exercise_id).first()
    if not ex:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Exercise not found")
    return ex
