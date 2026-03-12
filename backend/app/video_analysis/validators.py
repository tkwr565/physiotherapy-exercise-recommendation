"""
Posture Validation System
Implements pre-recording and per-repetition validators to ensure valid FPPA measurements

As per MVP Plan Section 3A:
- Pre-Recording Validators: Real-time feedback before recording starts
- Per-Repetition Validators: Post-analysis filtering of invalid reps
"""

import numpy as np
from typing import Tuple, Optional, Dict, List
from dataclasses import dataclass
from .pose_engine import StandardBody


@dataclass
class ValidationResult:
    """Result of a posture validation check"""

    is_valid: bool
    metric_value: float
    failure_reason: Optional[str] = None


@dataclass
class PostureValidationReport:
    """Complete posture validation report"""

    stance_width: ValidationResult
    foot_rotation_left: ValidationResult
    foot_rotation_right: ValidationResult
    body_placement: ValidationResult  # Renamed for clarity
    all_valid: bool = False

    def __post_init__(self):
        """Calculate overall validity"""
        results = [
            self.stance_width,
            self.foot_rotation_left,
            self.foot_rotation_right,
            self.body_placement,
        ]
        self.all_valid = all(r.is_valid for r in results)


class PostureValidator:
    """
    Main validator class for both real-time and post-analysis validation
    """

    def __init__(self, confidence_threshold: float = 0.3):
        """
        Args:
            confidence_threshold: Minimum keypoint confidence to use
        """
        self.confidence_threshold = confidence_threshold

        # Validation thresholds (from MVP Plan Section 3A)
        self.STANCE_RATIO_MIN = 0.8
        self.STANCE_RATIO_MAX = 1.2
        self.FOOT_ROTATION_MAX = 0.7  # ~35° rotation (loosened for camera angle)

    def validate_stance_width(self, body: StandardBody) -> ValidationResult:
        """
        Validator 1: Stance Width
        Prevent wide "sumo" stance that artificially prevents valgus

        Halpe-26 Keypoints:
        - Shoulders: 5 (Left), 6 (Right)
        - Heels: 24 (Left), 25 (Right) OR Ankles: 15 (Left), 16 (Right)

        Valid Range: 0.8 ≤ Stance_Ratio ≤ 1.2 (shoulder-width apart)
        """
        # Use shoulders as reference (clinical standard)
        if not all([body.l_shoulder, body.r_shoulder]):
            return ValidationResult(
                is_valid=False,
                metric_value=0.0,
                failure_reason="Missing shoulder keypoints",
            )

        # Check confidence for shoulders
        if any(
            kp[2] < self.confidence_threshold
            for kp in [body.l_shoulder, body.r_shoulder]
        ):
            return ValidationResult(
                is_valid=False,
                metric_value=0.0,
                failure_reason="Low shoulder confidence",
            )

        # Calculate shoulder width
        shoulder_width = np.sqrt(
            (body.r_shoulder[0] - body.l_shoulder[0]) ** 2
            + (body.r_shoulder[1] - body.l_shoulder[1]) ** 2
        )

        # ALWAYS use heels (no fallback)
        if not all([body.l_heel, body.r_heel]):
            return ValidationResult(
                is_valid=False,
                metric_value=0.0,
                failure_reason="Missing heel keypoints",
            )

        if (
            body.l_heel[2] < self.confidence_threshold
            or body.r_heel[2] < self.confidence_threshold
        ):
            return ValidationResult(
                is_valid=False,
                metric_value=0.0,
                failure_reason="Low heel confidence",
            )

        # Calculate heel width
        foot_width = np.sqrt(
            (body.r_heel[0] - body.l_heel[0]) ** 2
            + (body.r_heel[1] - body.l_heel[1]) ** 2
        )

        if shoulder_width == 0:
            return ValidationResult(
                is_valid=False,
                metric_value=0.0,
                failure_reason="Invalid shoulder width",
            )

        stance_ratio = foot_width / shoulder_width

        is_valid = self.STANCE_RATIO_MIN <= stance_ratio <= self.STANCE_RATIO_MAX
        failure_reason = (
            None if is_valid else f"FEET TOO WIDE (Ratio: {stance_ratio:.2f})"
        )

        return ValidationResult(
            is_valid=is_valid, metric_value=stance_ratio, failure_reason=failure_reason
        )

    def validate_foot_rotation(
        self, body: StandardBody, side: str = "left"
    ) -> ValidationResult:
        """
        Validator 2: Duck Foot (Foot Rotation)
        Detect excessive external foot rotation that hides valgus collapse

        Halpe-26 Keypoints:
        - Left Foot: 24 (Heel), 20 (Big Toe)
        - Right Foot: 25 (Heel), 21 (Big Toe)

        Valid Range: Rotation_Ratio < 0.5 (< 30° rotation)
        """
        # Select heel and toe based on side
        if side == "left":
            heel = body.l_heel
            toe = body.l_big_toe
        else:
            heel = body.r_heel
            toe = body.r_big_toe

        # ALWAYS use heel-toe method (no fallback)
        if not all([heel, toe]):
            return ValidationResult(
                is_valid=False,
                metric_value=0.0,
                failure_reason="Missing heel or toe keypoints",
            )

        if heel[2] < self.confidence_threshold or toe[2] < self.confidence_threshold:
            return ValidationResult(
                is_valid=False,
                metric_value=0.0,
                failure_reason="Low heel/toe confidence",
            )

        # Calculate foot vector (heel to toe)
        foot_dx = toe[0] - heel[0]
        foot_dy = toe[1] - heel[1]

        # Calculate sagittal plane (should point forward)
        # In frontal view, forward = vertical (y-axis)
        # Rotation is the lateral (x) component relative to length
        foot_length = np.sqrt(foot_dx**2 + foot_dy**2)

        if foot_length == 0:
            return ValidationResult(
                is_valid=False,
                metric_value=0.0,
                failure_reason="Invalid foot length",
            )

        # Rotation ratio: lateral displacement / total length
        rotation_ratio = abs(foot_dx) / foot_length

        is_valid = rotation_ratio < self.FOOT_ROTATION_MAX
        failure_reason = (
            None if is_valid else f"FEET ROTATED OUT ({side}: {rotation_ratio:.2f})"
        )

        return ValidationResult(
            is_valid=is_valid,
            metric_value=rotation_ratio,
            failure_reason=failure_reason,
        )

    def validate_body_position(
        self, body: StandardBody, frame_shape: tuple[int, int]
    ) -> ValidationResult:
        """
        Validator 3: Body Position (Pre-recording)
        Ensure the user's torso is within a predefined box, scaled to the frame height.
        The box has a fixed 4:3 aspect ratio, designed for a sitting person.
        """
        h, w = frame_shape

        # Define a fixed-aspect-ratio box, scaled by the frame height.
        # Box height is 50% of frame height
        box_height = h * 0.5
        # Box width has a 4:3 aspect ratio relative to its height for a wider view
        box_width = box_height * (4 / 3)

        # Position the box:
        # Horizontally centered
        box_x1 = int((w - box_width) / 2)
        box_x2 = int(box_x1 + box_width)
        # Bottom of the box is 5% from the bottom of the frame
        box_y2 = int(h * 0.95)
        box_y1 = int(box_y2 - box_height)

        # Stricter check: ALL visible keypoints must be inside the box
        points_to_check = [
            body.l_shoulder, body.r_shoulder,
            body.l_hip, body.r_hip,
            body.l_knee, body.r_knee,
            body.l_ankle, body.r_ankle,
            body.l_heel, body.r_heel,
            body.l_big_toe, body.r_big_toe
        ]

        # Check if at least some keypoints are detected
        if not any(p and p[2] > self.confidence_threshold for p in points_to_check):
             return ValidationResult(is_valid=False, metric_value=0.0,
                                    failure_reason="No keypoints detected.")

        for point in points_to_check:
            # Skip points that are not detected with high confidence
            if not (point and point[2] > self.confidence_threshold):
                continue

            x, y = int(point[0]), int(point[1])
            if not (box_x1 <= x <= box_x2 and box_y1 <= y <= box_y2):
                return ValidationResult(is_valid=False, metric_value=0.0,
                                        failure_reason="Please ensure your whole body is inside the box.")

        is_valid = True
        metric = 1.0
        failure_reason = "User is in the designated area."

        return ValidationResult(is_valid=is_valid, metric_value=metric, failure_reason=failure_reason)


    def validate_all_pre_recording(
        self, body: StandardBody, frame_shape: tuple[int, int]
    ) -> PostureValidationReport:
        """
        Run all pre-recording validators
        Used for real-time feedback before recording starts

        Args:
            body: StandardBody instance
            frame_shape: A tuple (height, width) of the video frame

        Returns:
            PostureValidationReport with all validation results
        """
        stance = self.validate_stance_width(body)
        foot_left = self.validate_foot_rotation(body, "left")
        foot_right = self.validate_foot_rotation(body, "right")
        body_placement = self.validate_body_position(body, frame_shape)

        return PostureValidationReport(
            stance_width=stance,
            foot_rotation_left=foot_left,
            foot_rotation_right=foot_right,
            body_placement=body_placement,
        )

    def validate_all_per_repetition(
        self, body: StandardBody
    ) -> PostureValidationReport:
        """
        Run all per-repetition validators
        Used during post-analysis filtering
        Returns:
            PostureValidationReport with all validation results
        """
        stance = self.validate_stance_width(body)
        foot_left = self.validate_foot_rotation(body, "left")
        foot_right = self.validate_foot_rotation(body, "right")
        # Body placement validation is not part of per-repetition checks
        body_placement = ValidationResult(is_valid=True, metric_value=1.0)
        return PostureValidationReport(
            stance_width=stance,
            foot_rotation_left=foot_left,
            foot_rotation_right=foot_right,
            body_placement=body_placement,
        )


class RepetitionValidator:
    """
    Validator for entire repetitions during post-analysis
    Checks SITTING and ASCENDING states for posture violations
    """

    def __init__(self):
        self.validator = PostureValidator()

    def validate_repetition(
        self, bodies: List[StandardBody], start_frame: int, end_frame: int
    ) -> Tuple[bool, List[str]]:
        """
        Validate a repetition by checking all frames in SITTING and ASCENDING states

        Args:
            bodies: List of all StandardBody objects
            start_frame: Start frame of repetition
            end_frame: End frame of repetition

        Returns:
            Tuple of (is_valid, failure_reasons)
        """
        rep_bodies = bodies[start_frame : end_frame + 1]
        failure_reasons = []

        # Check frames for violations
        for i, body in enumerate(rep_bodies):
            frame_num = start_frame + i
            report = self.validator.validate_all_per_repetition(body)

            if not report.all_valid:
                # Collect failure reasons
                if not report.stance_width.is_valid:
                    failure_reasons.append(
                        f"Frame {frame_num}: {report.stance_width.failure_reason}"
                    )
                if not report.foot_rotation_left.is_valid:
                    failure_reasons.append(
                        f"Frame {frame_num}: {report.foot_rotation_left.failure_reason}"
                    )
                if not report.foot_rotation_right.is_valid:
                    failure_reasons.append(
                        f"Frame {frame_num}: {report.foot_rotation_right.failure_reason}"
                    )

        # Repetition is invalid if any frame has violations
        is_valid = len(failure_reasons) == 0

        return is_valid, failure_reasons


# Testing
if __name__ == "__main__":
    print("=== Posture Validator Test ===\n")

    from .pose_engine import StandardBody

    # Create test body with normal posture
    normal_body = StandardBody(
        nose=(320, 100, 0.9),
        l_shoulder=(280, 150, 0.9),
        r_shoulder=(360, 150, 0.9),
        mid_shoulder=(320, 150, 0.9),
        l_hip=(290, 300, 0.9),
        r_hip=(350, 300, 0.9),
        mid_hip=(320, 300, 0.9),
        l_knee=(285, 450, 0.9),
        r_knee=(355, 450, 0.9),
        l_ankle=(280, 600, 0.9),
        r_ankle=(360, 600, 0.9),
        l_heel=(280, 620, 0.9),
        r_heel=(360, 620, 0.9),
        l_big_toe=(290, 640, 0.9),
        r_big_toe=(370, 640, 0.9),
    )

    # Create test body with wide stance
    wide_stance_body = StandardBody(
        nose=(320, 100, 0.9),
        l_shoulder=(280, 150, 0.9),
        r_shoulder=(360, 150, 0.9),
        mid_shoulder=(320, 150, 0.9),
        l_hip=(290, 300, 0.9),
        r_hip=(350, 300, 0.9),
        mid_hip=(320, 300, 0.9),
        l_knee=(250, 450, 0.9),
        r_knee=(390, 450, 0.9),
        l_ankle=(220, 600, 0.9),
        r_ankle=(420, 600, 0.9),
        l_heel=(220, 620, 0.9), # Too wide
        r_heel=(420, 620, 0.9), # Too wide
        l_big_toe=(230, 640, 0.9),
        r_big_toe=(430, 640, 0.9),
    )

    validator = PostureValidator()
    # Define a dummy vertical frame shape (height, width)
    frame_shape_vertical = (1280, 720)

    # Test normal posture
    print("Test 1: Normal Posture (Vertical Frame)")
    report = validator.validate_all_pre_recording(normal_body, frame_shape_vertical)
    print(f"  All Valid: {report.all_valid}")
    print(
        f"  Stance Width: {report.stance_width.is_valid} (Ratio: {report.stance_width.metric_value:.2f})"
    )
    print(
        f"  Foot Rotation (L): {report.foot_rotation_left.is_valid} (Ratio: {report.foot_rotation_left.metric_value:.2f})"
    )
    print(
        f"  Foot Rotation (R): {report.foot_rotation_right.is_valid} (Ratio: {report.foot_rotation_right.metric_value:.2f})"
    )
    print(
        f"  Body Placement: {report.body_placement.is_valid} (Failure: {report.body_placement.failure_reason})"
    )

    # Test wide stance
    print("\nTest 2: Wide Stance (Vertical Frame)")
    report = validator.validate_all_pre_recording(wide_stance_body, frame_shape_vertical)
    print(f"  All Valid: {report.all_valid}")
    print(
        f"  Stance Width: {report.stance_width.is_valid} (Ratio: {report.stance_width.metric_value:.2f})"
    )
    if not report.stance_width.is_valid:
        print(f"  Failure: {report.stance_width.failure_reason}")
    print(
        f"  Body Placement: {report.body_placement.is_valid} (Failure: {report.body_placement.failure_reason})"
    )


    print("\n✓ Validator tests completed!")
