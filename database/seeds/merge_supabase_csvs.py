"""
Merge Supabase normalized CSVs into a single denormalized CSV for the backend.

This script reads the normalized Supabase CSV files and creates a single
exercises.csv file that the backend seed script expects.
"""

import csv
import os
from collections import defaultdict

# Get the directory where this script is located
script_dir = os.path.dirname(os.path.abspath(__file__))
supabase_dir = os.path.join(script_dir, "supabase")
output_file = os.path.join(script_dir, "exercises.csv")

print(f"Reading from: {supabase_dir}")
print(f"Output to: {output_file}")

# Read all CSV files
exercises = {}  # id -> exercise data
positions = defaultdict(list)  # exercise_id -> list of positions
muscles = defaultdict(dict)  # exercise_id -> {muscle_name: value}

# Read exercises.csv
with open(os.path.join(supabase_dir, "exercises.csv"), encoding="utf-8-sig") as f:
    reader = csv.DictReader(f)
    for row in reader:
        exercises[row["id"]] = {
            "exercise_name": row["exercise_name"],
            "exercise_name_ch": row["exercise_name_ch"],
            "difficulty_level": row["difficulty_level"],
            "core_ipsi": row["core_ipsi"],
            "core_contra": row["core_contra"],
            "toe_touch": row["toe_touch"],
        }

# Read exercise_positions.csv
with open(os.path.join(supabase_dir, "exercise_positions.csv"), encoding="utf-8-sig") as f:
    reader = csv.DictReader(f)
    for row in reader:
        positions[row["exercise_id"]].append(row["position"])

# Read exercise_muscles.csv
with open(os.path.join(supabase_dir, "exercise_muscles.csv"), encoding="utf-8-sig") as f:
    reader = csv.DictReader(f)
    for row in reader:
        ex_id = row["exercise_id"]
        muscle = row["muscle"]
        value = row.get("muscle_value", "0")
        muscles[ex_id][muscle] = value

# Create merged CSV
output_rows = []
for ex_id, ex_data in exercises.items():
    # Get positions for this exercise
    ex_positions = positions.get(ex_id, [])

    # Get muscles for this exercise
    ex_muscles = muscles.get(ex_id, {})

    # Create the merged row
    row = {
        "exercise_name": ex_data["exercise_name"],
        "exercise_name_ch": ex_data["exercise_name_ch"],
        "difficulty_level": ex_data["difficulty_level"],

        # Positions (set to True/False based on presence)
        "position_sl_stand": "sl_stand" in ex_positions or "single_leg_stand" in ex_positions,
        "position_split_stand": "split_stand" in ex_positions,
        "position_dl_stand": "dl_stand" in ex_positions or "double_leg_stand" in ex_positions,
        "position_quadruped": "quadruped" in ex_positions,
        "position_supine_lying": "supine_lying" in ex_positions,
        "position_side_lying": "side_lying" in ex_positions,

        # Muscles (0-5 scale)
        "muscle_quad": ex_muscles.get("quad", "0"),
        "muscle_hamstring": ex_muscles.get("hamstring", "0"),
        "muscle_glute_max": ex_muscles.get("glute_max", "0"),
        "muscle_hip_flexors": ex_muscles.get("hip_flexors", "0"),
        "muscle_glute_med_min": ex_muscles.get("glute_med_min", "0"),
        "muscle_adductors": ex_muscles.get("adductors", "0"),

        # Core and flexibility
        "core_ipsi": ex_data["core_ipsi"],
        "core_contra": ex_data["core_contra"],
        "toe_touch": ex_data["toe_touch"],
    }

    output_rows.append(row)

# Write the merged CSV
fieldnames = [
    "exercise_name",
    "exercise_name_ch",
    "difficulty_level",
    "position_sl_stand",
    "position_split_stand",
    "position_dl_stand",
    "position_quadruped",
    "position_supine_lying",
    "position_side_lying",
    "muscle_quad",
    "muscle_hamstring",
    "muscle_glute_max",
    "muscle_hip_flexors",
    "muscle_glute_med_min",
    "muscle_adductors",
    "core_ipsi",
    "core_contra",
    "toe_touch",
]

with open(output_file, "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(output_rows)

print(f"\nSuccessfully merged {len(output_rows)} exercises!")
print(f"Output file: {output_file}")
print(f"\nYou can now restart Docker to load the exercise data:")
print("  docker compose down")
print("  docker compose up --build")
