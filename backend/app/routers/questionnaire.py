from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import QuestionnaireResponse as QRModel, User
from app.schemas import QuestionnaireCreate, QuestionnaireResponse

router = APIRouter()

# All questionnaire field names
QUESTION_FIELDS = [
    "f1", "f2", "f3", "f4", "f5", "f6", "f7", "f8", "f9",
    "f10", "f11", "f12", "f13", "f14", "f15", "f16", "f17",
    "p1", "p2", "p3", "p4", "p5", "p6", "p7", "p8", "p9",
    "sp1", "sp2", "sp3", "sp4", "sp5",
    "st1", "st2",
    "s1", "s2", "s3", "s4", "s5",
    "q1", "q2", "q3", "q4",
    "toe_touch_test",
]


@router.post("/", response_model=QuestionnaireResponse)
def upsert_questionnaire(body: QuestionnaireCreate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == body.username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    existing = db.query(QRModel).filter(QRModel.username == body.username).first()

    if existing:
        for field in QUESTION_FIELDS:
            value = getattr(body, field, None)
            if value is not None:
                setattr(existing, field, value)
        db.commit()
        db.refresh(existing)
        return existing

    qr = QRModel(
        user_id=user.id,
        username=body.username,
        **{field: getattr(body, field, None) for field in QUESTION_FIELDS},
    )
    db.add(qr)
    db.commit()
    db.refresh(qr)
    return qr


@router.get("/{username}", response_model=QuestionnaireResponse)
def get_questionnaire(username: str, db: Session = Depends(get_db)):
    qr = db.query(QRModel).filter(QRModel.username == username).first()
    if not qr:
        raise HTTPException(status_code=404, detail="Questionnaire not found")
    return qr
