"""
Pose Engine: MediaPipe Keypoint Adapter
Provides adapter to map MediaPipe Pose keypoints to a standardized format for clinical analysis
"""

import numpy as np
from dataclasses import dataclass
from typing import Optional, Tuple


@dataclass
class StandardBody:
    """
    Universal keypoint structure for clinical pose analysis
    All coordinates are in (x, y, confidence) format
    """
    # Core body points
    nose: Tuple[float, float, float]
    l_shoulder: Tuple[float, float, float]
    r_shoulder: Tuple[float, float, float]
    l_hip: Tuple[float, float, float]
    r_hip: Tuple[float, float, float]
    l_knee: Tuple[float, float, float]
    r_knee: Tuple[float, float, float]
    l_ankle: Tuple[float, float, float]
    r_ankle: Tuple[float, float, float]

    # Optional points
    l_elbow: Optional[Tuple[float, float, float]] = None
    r_elbow: Optional[Tuple[float, float, float]] = None
    l_wrist: Optional[Tuple[float, float, float]] = None
    r_wrist: Optional[Tuple[float, float, float]] = None

    # Extended points
    mid_hip: Optional[Tuple[float, float, float]] = None
    mid_shoulder: Optional[Tuple[float, float, float]] = None

    # Foot keypoints
    l_big_toe: Optional[Tuple[float, float, float]] = None
    r_big_toe: Optional[Tuple[float, float, float]] = None
    l_heel: Optional[Tuple[float, float, float]] = None
    r_heel: Optional[Tuple[float, float, float]] = None

    def __post_init__(self):
        """Calculate derived points after initialization"""
        # Calculate mid-shoulder if we have both shoulders
        if self.l_shoulder and self.r_shoulder:
            self.mid_shoulder = (
                (self.l_shoulder[0] + self.r_shoulder[0]) / 2,
                (self.l_shoulder[1] + self.r_shoulder[1]) / 2,
                min(self.l_shoulder[2], self.r_shoulder[2])
            )

        # Calculate mid-hip if not provided and we have both hips
        if self.mid_hip is None and self.l_hip and self.r_hip:
            self.mid_hip = (
                (self.l_hip[0] + self.r_hip[0]) / 2,
                (self.l_hip[1] + self.r_hip[1]) / 2,
                min(self.l_hip[2], self.r_hip[2])
            )


class MediaPipeAdapter:
    """
    Adapter for MediaPipe Pose (33 keypoints format)

    MediaPipe Pose Keypoint Indices (0-32):
    0: nose, 11: left_shoulder, 12: right_shoulder,
    13: left_elbow, 14: right_elbow, 15: left_wrist, 16: right_wrist,
    23: left_hip, 24: right_hip, 25: left_knee, 26: right_knee,
    27: left_ankle, 28: right_ankle, 29: left_heel, 30: right_heel,
    31: left_foot_index, 32: right_foot_index
    """

    def __init__(self):
        self.keypoint_map = {
            'nose': 0,
            'l_shoulder': 11,
            'r_shoulder': 12,
            'l_elbow': 13,
            'r_elbow': 14,
            'l_wrist': 15,
            'r_wrist': 16,
            'l_hip': 23,
            'r_hip': 24,
            'l_knee': 25,
            'r_knee': 26,
            'l_ankle': 27,
            'r_ankle': 28,
            'l_heel': 29,
            'r_heel': 30,
            'l_big_toe': 31,
            'r_big_toe': 32,
        }

    def to_standard(self, keypoints: np.ndarray, scores: Optional[np.ndarray] = None) -> StandardBody:
        """
        Convert MediaPipe Pose keypoints to StandardBody

        Args:
            keypoints: Array of shape (33, 2) or (33, 3) containing x, y (and optional confidence/visibility)
            scores: Optional array of shape (33,) with confidence scores

        Returns:
            StandardBody instance
        """
        # Handle confidence scores
        if keypoints.shape[1] == 3:
            scores = keypoints[:, 2]
        elif scores is None:
            scores = np.ones(len(keypoints))

        def get_point(name: str) -> Tuple[float, float, float]:
            idx = self.keypoint_map[name]
            return (float(keypoints[idx, 0]), float(keypoints[idx, 1]), float(scores[idx]))

        return StandardBody(
            nose=get_point('nose'),
            l_shoulder=get_point('l_shoulder'),
            r_shoulder=get_point('r_shoulder'),
            l_hip=get_point('l_hip'),
            r_hip=get_point('r_hip'),
            l_knee=get_point('l_knee'),
            r_knee=get_point('r_knee'),
            l_ankle=get_point('l_ankle'),
            r_ankle=get_point('r_ankle'),
            l_elbow=get_point('l_elbow'),
            r_elbow=get_point('r_elbow'),
            l_wrist=get_point('l_wrist'),
            r_wrist=get_point('r_wrist'),
            l_big_toe=get_point('l_big_toe'),
            r_big_toe=get_point('r_big_toe'),
            l_heel=get_point('l_heel'),
            r_heel=get_point('r_heel'),
        )


class PoseAdapter:
    """Factory class to create pose model adapters"""

    @staticmethod
    def create(model_type: str = "mediapipe"):
        """
        Create pose adapter for specified model type

        Args:
            model_type: Type of model - currently only "mediapipe" is supported

        Returns:
            MediaPipeAdapter instance
        """
        if model_type == "mediapipe":
            return MediaPipeAdapter()
        else:
            raise ValueError(f"Unknown model type: {model_type}")
