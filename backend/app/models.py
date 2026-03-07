import datetime
from sqlalchemy import (
    Column, Integer, String, Boolean, Numeric, Date, DateTime, ForeignKey,
    CheckConstraint, Index, Text, func
)
from sqlalchemy.orm import relationship

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    demographics = relationship("PatientDemographics", back_populates="user", uselist=False)
    questionnaire = relationship("QuestionnaireResponse", back_populates="user", uselist=False, foreign_keys="QuestionnaireResponse.username")
    sts_assessment = relationship("STSAssessment", back_populates="user", uselist=False, foreign_keys="STSAssessment.username")


class PatientDemographics(Base):
    __tablename__ = "patient_demographics"

    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String(50), ForeignKey("users.username", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    date_of_birth = Column(Date, nullable=False)
    gender = Column(String(10), nullable=False)
    height_cm = Column(Numeric, nullable=False)
    weight_kg = Column(Numeric, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="demographics")

    __table_args__ = (
        CheckConstraint("gender IN ('Male', 'Female')", name="check_gender"),
        CheckConstraint("height_cm > 0 AND height_cm <= 300", name="check_height"),
        CheckConstraint("weight_kg > 0 AND weight_kg <= 500", name="check_weight"),
    )


class QuestionnaireResponse(Base):
    __tablename__ = "questionnaire_responses"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    username = Column(String(50), ForeignKey("users.username", ondelete="CASCADE"), unique=True, index=True)

    # Function questions (f1-f17)
    f1 = Column(Integer)
    f2 = Column(Integer)
    f3 = Column(Integer)
    f4 = Column(Integer)
    f5 = Column(Integer)
    f6 = Column(Integer)
    f7 = Column(Integer)
    f8 = Column(Integer)
    f9 = Column(Integer)
    f10 = Column(Integer)
    f11 = Column(Integer)
    f12 = Column(Integer)
    f13 = Column(Integer)
    f14 = Column(Integer)
    f15 = Column(Integer)
    f16 = Column(Integer)
    f17 = Column(Integer)

    # Pain questions (p1-p9)
    p1 = Column(Integer)
    p2 = Column(Integer)
    p3 = Column(Integer)
    p4 = Column(Integer)
    p5 = Column(Integer)
    p6 = Column(Integer)
    p7 = Column(Integer)
    p8 = Column(Integer)
    p9 = Column(Integer)

    # Sport/Recreation questions (sp1-sp5)
    sp1 = Column(Integer)
    sp2 = Column(Integer)
    sp3 = Column(Integer)
    sp4 = Column(Integer)
    sp5 = Column(Integer)

    # Stiffness questions (st1-st2)
    st1 = Column(Integer)
    st2 = Column(Integer)

    # Symptom questions (s1-s5)
    s1 = Column(Integer)
    s2 = Column(Integer)
    s3 = Column(Integer)
    s4 = Column(Integer)
    s5 = Column(Integer)

    # Quality of Life questions (q1-q4)
    q1 = Column(Integer)
    q2 = Column(Integer)
    q3 = Column(Integer)
    q4 = Column(Integer)

    # Flexibility test
    toe_touch_test = Column(String(10))

    completed_at = Column(DateTime(timezone=True), server_default=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="questionnaire", foreign_keys=[username])


class STSAssessment(Base):
    __tablename__ = "sts_assessments"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    username = Column(String(50), ForeignKey("users.username", ondelete="CASCADE"), unique=True, index=True)

    repetition_count = Column(Integer, nullable=False)
    knee_alignment = Column(String(10), nullable=False)
    trunk_sway = Column(String(10), nullable=False)
    hip_sway = Column(String(10), nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="sts_assessment", foreign_keys=[username])

    __table_args__ = (
        CheckConstraint("repetition_count >= 0", name="check_repetition_count"),
        CheckConstraint("knee_alignment IN ('normal', 'valgus', 'varus')", name="check_knee_alignment"),
        CheckConstraint("trunk_sway IN ('present', 'absent')", name="check_trunk_sway"),
        CheckConstraint("hip_sway IN ('present', 'absent')", name="check_hip_sway"),
    )


class Exercise(Base):
    __tablename__ = "exercises"

    id = Column(Integer, primary_key=True, autoincrement=True)
    exercise_name = Column(String(100), nullable=False)
    exercise_name_ch = Column(String(100))

    # Position flags
    position_sl_stand = Column(Boolean, default=False)
    position_split_stand = Column(Boolean, default=False)
    position_dl_stand = Column(Boolean, default=False)
    position_quadruped = Column(Boolean, default=False)
    position_supine_lying = Column(Boolean, default=False)
    position_side_lying = Column(Boolean, default=False)

    # Muscle recruitment (0-5)
    muscle_quad = Column(Integer, default=0)
    muscle_hamstring = Column(Integer, default=0)
    muscle_glute_max = Column(Integer, default=0)
    muscle_hip_flexors = Column(Integer, default=0)
    muscle_glute_med_min = Column(Integer, default=0)
    muscle_adductors = Column(Integer, default=0)

    # Core stability
    core_ipsi = Column(Boolean, default=False)
    core_contra = Column(Boolean, default=False)

    # Flexibility
    toe_touch = Column(Boolean, default=False)

    # Difficulty
    difficulty_level = Column(Integer, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        CheckConstraint("difficulty_level BETWEEN 1 AND 10", name="check_difficulty"),
        CheckConstraint("muscle_quad BETWEEN 0 AND 5", name="check_muscle_quad"),
        CheckConstraint("muscle_hamstring BETWEEN 0 AND 5", name="check_muscle_hamstring"),
        CheckConstraint("muscle_glute_max BETWEEN 0 AND 5", name="check_muscle_glute_max"),
        CheckConstraint("muscle_hip_flexors BETWEEN 0 AND 5", name="check_muscle_hip_flexors"),
        CheckConstraint("muscle_glute_med_min BETWEEN 0 AND 5", name="check_muscle_glute_med_min"),
        CheckConstraint("muscle_adductors BETWEEN 0 AND 5", name="check_muscle_adductors"),
    )
