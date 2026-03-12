"""
Video Processor for Sit-to-Stand Analysis (MediaPipe Version)
Handles video processing with MediaPipe Pose Landmarker
"""

import cv2
import numpy as np
from pathlib import Path
from typing import List, Tuple, Optional, Dict
import time
from mediapipe.tasks import python
from mediapipe.tasks.python import vision
from mediapipe.tasks.python.vision.core import image as mp_image
import urllib.request

from .pose_engine import StandardBody, PoseAdapter
from .analyzer import SitToStandAnalyzer


def download_model_if_needed(model_dir: Path) -> str:
    """Download MediaPipe Pose Landmarker Heavy model if not present

    Args:
        model_dir: Directory to store the model

    Returns:
        Path to model file
    """
    model_name = "pose_landmarker_heavy.task"
    model_url = "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_heavy/float16/latest/pose_landmarker_heavy.task"

    model_dir.mkdir(parents=True, exist_ok=True)
    model_path = model_dir / model_name

    if not model_path.exists():
        print(f"Downloading {model_name}...")
        urllib.request.urlretrieve(model_url, model_path)
        print(f"Model downloaded to {model_path}")

    return str(model_path)


def init_mediapipe_pose(model_path: str):
    """Initialize MediaPipe Pose Landmarker (Heavy)

    Args:
        model_path: Path to the model file

    Returns:
        MediaPipe PoseLandmarker instance
    """
    base_options = python.BaseOptions(model_asset_path=model_path)
    options = vision.PoseLandmarkerOptions(
        base_options=base_options,
        running_mode=vision.RunningMode.VIDEO,
        num_poses=1,
        min_pose_detection_confidence=0.5,
        min_pose_presence_confidence=0.5,
        min_tracking_confidence=0.5
    )

    landmarker = vision.PoseLandmarker.create_from_options(options)
    return landmarker


def process_mediapipe_frame(landmarker, frame, timestamp_ms):
    """Process a frame with MediaPipe Pose Landmarker

    Args:
        landmarker: MediaPipe PoseLandmarker instance
        frame: Input frame (BGR format)
        timestamp_ms: Frame timestamp in milliseconds

    Returns:
        Tuple of (keypoints, scores) or (None, None) if no detection
    """
    # Convert BGR to RGB
    frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

    # Create MediaPipe Image
    mediapipe_image = mp_image.Image(image_format=mp_image.ImageFormat.SRGB, data=frame_rgb)

    # Process the frame
    results = landmarker.detect_for_video(mediapipe_image, timestamp_ms)

    if not results.pose_landmarks or len(results.pose_landmarks) == 0:
        return None, None

    # Extract keypoints and visibility scores from first detected pose
    h, w, _ = frame.shape
    keypoints = []
    scores = []

    for landmark in results.pose_landmarks[0]:
        # Convert normalized coordinates to pixel coordinates
        x = landmark.x * w
        y = landmark.y * h
        visibility = landmark.visibility

        keypoints.append([x, y])
        scores.append(visibility)

    keypoints = np.array(keypoints, dtype=np.float32)
    scores = np.array(scores, dtype=np.float32)

    return keypoints, scores


def process_video(video_path: Path, model_dir: Path) -> Optional[Tuple[List[StandardBody], float, Tuple[int, int]]]:
    """Process video using MediaPipe Pose Landmarker (Heavy)

    Args:
        video_path: Path to the video file
        model_dir: Directory containing the MediaPipe model

    Returns:
        Tuple of (bodies, fps, dimensions) or None if processing fails
    """
    print(f"Loading MediaPipe Pose Landmarker (Heavy)...")
    model_path = download_model_if_needed(model_dir)
    landmarker = init_mediapipe_pose(model_path)

    print(f"Opening video: {video_path}")
    cap = cv2.VideoCapture(str(video_path))

    if not cap.isOpened():
        print(f"ERROR: Could not open video: {video_path}")
        return None

    fps = cap.get(cv2.CAP_PROP_FPS)
    frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

    print(f"Video: {width}x{height} @ {fps:.1f}fps, {frame_count} frames")

    bodies = []
    adapter = PoseAdapter.create("mediapipe")

    print("Processing frames...")
    start_time = time.time()

    frame_idx = 0
    while True:
        ret, frame = cap.read()
        if not ret:
            break

        # Calculate timestamp in milliseconds for MediaPipe
        timestamp_ms = int((frame_idx / fps) * 1000) if fps > 0 else frame_idx * 33

        # Process frame with MediaPipe
        keypoints, scores = process_mediapipe_frame(landmarker, frame, timestamp_ms)

        if keypoints is not None:
            body = adapter.to_standard(keypoints, scores)
        else:
            # Create empty body for frames without detection
            body = StandardBody(
                nose=(0, 0, 0),
                l_shoulder=(0, 0, 0),
                r_shoulder=(0, 0, 0),
                l_hip=(0, 0, 0),
                r_hip=(0, 0, 0),
                l_knee=(0, 0, 0),
                r_knee=(0, 0, 0),
                l_ankle=(0, 0, 0),
                r_ankle=(0, 0, 0)
            )

        bodies.append(body)
        frame_idx += 1

    cap.release()
    landmarker.close()

    elapsed_time = time.time() - start_time
    print(f"Processed {len(bodies)} frames in {elapsed_time:.2f}s ({len(bodies)/elapsed_time:.2f} fps)")

    # Handle case where fps is 0
    if fps == 0:
        print("WARNING: Video FPS is 0, defaulting to 30. Analysis may be inaccurate.")
        fps = 30

    return bodies, fps, (width, height)


def analyze_video(video_path: Path, model_dir: Path) -> Optional[Dict]:
    """
    Complete video analysis pipeline

    Args:
        video_path: Path to the video file
        model_dir: Directory containing the MediaPipe model

    Returns:
        Dictionary containing analysis results, or None if processing fails
    """
    # Step 1: Process video to extract pose data
    result = process_video(video_path, model_dir)
    if result is None:
        return None

    bodies, fps, dimensions = result

    # Step 2: Run sit-to-stand analysis
    print("\nRunning sit-to-stand analysis...")
    analyzer = SitToStandAnalyzer(fps=fps, filter_type='one_euro', enable_validators=True)
    metrics = analyzer.analyze(bodies)

    # Step 3: Format results
    results = {
        "video_name": video_path.name,
        "pose_model": "MediaPipe Pose Landmarker (Heavy)",
        "aggregate_metrics": {
            "total_reps": metrics.total_reps,
            "valid_reps": metrics.valid_reps,
            "invalid_reps": metrics.invalid_reps,
            "max_trunk_sway_sd": round(metrics.max_trunk_sway_std, 2),
            "max_hip_sway_sd": round(metrics.max_hip_sway_std, 2),
            "mean_trunk_sway_sd": round(metrics.mean_trunk_sway_std, 2),
            "mean_hip_sway_sd": round(metrics.mean_hip_sway_std, 2),
            "mean_fppa": round(metrics.mean_fppa, 2)
        },
        "per_rep_metrics": []
    }

    # Add per-repetition metrics
    for i, rep in enumerate(metrics.repetitions, 1):
        rep_data = {
            "rep_count": i,
            "metrics": {
                "validity": "valid" if rep.is_clinically_valid else "invalid",
                "trunk_sway_sd": round(rep.trunk_sway_std, 2) if rep.trunk_sway_std is not None else None,
                "hip_sway_sd": round(rep.hip_sway_std, 2) if rep.hip_sway_std is not None else None,
                "fppa_peak_valgus_angle": round(rep.peak_valgus_angle, 2) if rep.peak_valgus_angle is not None else None
            }
        }

        if not rep.is_clinically_valid:
            rep_data["validation_failures"] = rep.validator_failures

        results["per_rep_metrics"].append(rep_data)

    return results
