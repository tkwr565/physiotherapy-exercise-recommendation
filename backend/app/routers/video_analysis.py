"""
Video Analysis Router
Handles video upload and STS analysis
"""

from fastapi import APIRouter, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from pathlib import Path
import shutil
import uuid
from typing import Dict

from app.video_analysis import analyze_video

router = APIRouter()

# Directories
TEMP_DIR = Path(__file__).parent.parent.parent / "temp"
MODEL_DIR = Path(__file__).parent.parent / "video_analysis" / "models"

# Ensure directories exist
TEMP_DIR.mkdir(parents=True, exist_ok=True)
MODEL_DIR.mkdir(parents=True, exist_ok=True)


@router.post("/analyze-sts-video")
async def analyze_sts_video(file: UploadFile = File(...)) -> Dict:
    """
    Analyze uploaded video for sit-to-stand assessment

    Args:
        file: Video file (mp4, webm, avi, mov, mkv)

    Returns:
        JSON containing analysis results
    """
    # Validate file type
    allowed_extensions = {'.mp4', '.webm', '.avi', '.mov', '.mkv'}
    file_ext = Path(file.filename).suffix.lower()

    if file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Allowed: {', '.join(allowed_extensions)}"
        )

    # Generate unique filename
    analysis_id = str(uuid.uuid4())
    temp_video_path = TEMP_DIR / f"{analysis_id}{file_ext}"

    try:
        # Save uploaded file
        with temp_video_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        print(f"Video saved to: {temp_video_path}")

        # Run analysis
        results = analyze_video(temp_video_path, MODEL_DIR)

        if results is None:
            raise HTTPException(
                status_code=500,
                detail="Video analysis failed. Could not process video."
            )

        # Add analysis ID to results
        results["analysis_id"] = analysis_id

        return results

    except Exception as e:
        print(f"Error during video analysis: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Analysis error: {str(e)}"
        )

    finally:
        # Clean up temp file
        if temp_video_path.exists():
            temp_video_path.unlink()
            print(f"Cleaned up temp file: {temp_video_path}")


@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "ok",
        "model_dir": str(MODEL_DIR),
        "model_exists": (MODEL_DIR / "pose_landmarker_heavy.task").exists()
    }
