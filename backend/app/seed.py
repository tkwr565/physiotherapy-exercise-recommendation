"""Seed exercises from CSV into the database."""

import csv
import os
from app.database import SessionLocal
from app.models import Exercise
from app.init_db import init_db


def seed_exercises():
    init_db()

    # Try Docker mount path first, then relative path for local dev
    csv_path = "/app/seeds/exercises.csv"
    if not os.path.exists(csv_path):
        csv_path = os.path.join(os.path.dirname(__file__), "..", "..", "database", "seeds", "exercises.csv")
        csv_path = os.path.abspath(csv_path)

    if not os.path.exists(csv_path):
        print(f"CSV file not found. Skipping seed.")
        return

    db = SessionLocal()
    try:
        existing_count = db.query(Exercise).count()
        if existing_count > 0:
            print(f"Exercises table already has {existing_count} rows. Skipping seed.")
            return

        with open(csv_path, newline="", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            count = 0
            for row in reader:
                ex = Exercise(
                    exercise_name=row.get("exercise_name", ""),
                    exercise_name_ch=row.get("exercise_name_ch", "") or None,
                    position_sl_stand=row.get("position_sl_stand", "").lower() in ("true", "1", "yes"),
                    position_split_stand=row.get("position_split_stand", "").lower() in ("true", "1", "yes"),
                    position_dl_stand=row.get("position_dl_stand", "").lower() in ("true", "1", "yes"),
                    position_quadruped=row.get("position_quadruped", "").lower() in ("true", "1", "yes"),
                    position_supine_lying=row.get("position_supine_lying", "").lower() in ("true", "1", "yes"),
                    position_side_lying=row.get("position_side_lying", "").lower() in ("true", "1", "yes"),
                    muscle_quad=int(row.get("muscle_quad", 0) or 0),
                    muscle_hamstring=int(row.get("muscle_hamstring", 0) or 0),
                    muscle_glute_max=int(row.get("muscle_glute_max", 0) or 0),
                    muscle_hip_flexors=int(row.get("muscle_hip_flexors", 0) or 0),
                    muscle_glute_med_min=int(row.get("muscle_glute_med_min", 0) or 0),
                    muscle_adductors=int(row.get("muscle_adductors", 0) or 0),
                    core_ipsi=row.get("core_ipsi", "").lower() in ("true", "1", "yes"),
                    core_contra=row.get("core_contra", "").lower() in ("true", "1", "yes"),
                    toe_touch=row.get("toe_touch", "").lower() in ("true", "1", "yes"),
                    difficulty_level=int(row.get("difficulty_level", 1) or 1),
                )
                db.add(ex)
                count += 1

            db.commit()
            print(f"Seeded {count} exercises successfully.")
    except Exception as e:
        db.rollback()
        print(f"Error seeding exercises: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    seed_exercises()
