"""
Clinical Sit-to-Stand Analyzer
Implements the complete mathematical pipeline for clinical metrics analysis:
- Preprocessing & Smoothing
- Global Calibration
- Repetition Segmentation (State Machine)
- Biomechanical Analysis (Knee Valgus, Lateral Trunk Sway)
"""

import numpy as np
from dataclasses import dataclass
from typing import List, Tuple, Optional
from enum import Enum
from .pose_engine import StandardBody


class PostureState(Enum):
    """State machine states for sit-to-stand detection"""
    SITTING = 0
    ASCENDING = 1
    STANDING = 2
    DESCENDING = 3


@dataclass
class Repetition:
    """Represents one complete sit-to-stand repetition"""
    start_frame: int
    end_frame: int
    # Phase start/end frames within this repetition
    sitting_start_frame: Optional[int] = None
    sitting_end_frame: Optional[int] = None
    ascending_start_frame: Optional[int] = None
    ascending_end_frame: Optional[int] = None
    standing_start_frame: Optional[int] = None
    standing_end_frame: Optional[int] = None
    descending_start_frame: Optional[int] = None
    descending_end_frame: Optional[int] = None

    # FPPA metrics (using standard FPPA: 180° - interior_angle)
    # Negative = valgus, Positive = varus, 0 = straight
    peak_valgus_angle_left: Optional[float] = None  # Most negative value (peak valgus)
    peak_valgus_angle_right: Optional[float] = None  # Most negative value (peak valgus)
    peak_valgus_angle: Optional[float] = None  # Worst case between left and right

    trunk_sway_std: Optional[float] = None
    hip_sway_std: Optional[float] = None
    has_valgus: bool = False
    has_instability: bool = False
    # Validator results: True if the sitting phase of this rep passed all validators
    is_clinically_valid: bool = True
    validator_failures: List[str] = None

    def __post_init__(self):
        """Initialize mutable default"""
        if self.validator_failures is None:
            self.validator_failures = []


@dataclass
class ClinicalMetrics:
    """Final clinical assessment output"""
    total_reps: int
    valid_reps: int
    invalid_reps: int
    repetitions: List[Repetition]

    # FPPA metrics (standard FPPA: 180° - interior_angle)
    # Negative = valgus, Positive = varus
    mean_fppa: float  # Mean of peak valgus angles across valid reps

    # Sway metrics
    max_trunk_sway_std: float  # Maximum SD across valid reps
    max_hip_sway_std: float    # Maximum SD across valid reps
    mean_trunk_sway_std: float  # Mean SD across valid reps
    mean_hip_sway_std: float    # Mean SD across valid reps

    valgus_count: int
    instability_count: int


class OneEuroFilter:
    """
    One Euro Filter for smooth keypoint tracking
    Reference: https://gery.casiez.net/1euro/
    """

    def __init__(self, freq=30, mincutoff=1.0, beta=0.007, dcutoff=1.0):
        """
        Args:
            freq: Sampling frequency (Hz)
            mincutoff: Minimum cutoff frequency
            beta: Cutoff slope
            dcutoff: Cutoff frequency for derivative
        """
        self.freq = freq
        self.mincutoff = mincutoff
        self.beta = beta
        self.dcutoff = dcutoff
        self.x_prev = None
        self.dx_prev = 0.0

    def __call__(self, x):
        """Apply filter to new value"""
        if self.x_prev is None:
            self.x_prev = x
            return x

        # Estimate derivative
        dx = (x - self.x_prev) * self.freq
        edx = self._smoothing_factor(self.dcutoff) * dx + (1 - self._smoothing_factor(self.dcutoff)) * self.dx_prev

        # Calculate cutoff
        cutoff = self.mincutoff + self.beta * abs(edx)

        # Filter the signal
        result = self._smoothing_factor(cutoff) * x + (1 - self._smoothing_factor(cutoff)) * self.x_prev

        # Update state
        self.x_prev = result
        self.dx_prev = edx

        return result

    def _smoothing_factor(self, cutoff):
        """Calculate smoothing factor"""
        tau = 1.0 / (2 * np.pi * cutoff)
        te = 1.0 / self.freq
        return 1.0 / (1.0 + tau / te)


class MovingAverageFilter:
    """Simple moving average filter for keypoint smoothing"""

    def __init__(self, window_size=5):
        self.window_size = window_size
        self.buffer = []

    def __call__(self, x):
        """Apply moving average to new value"""
        self.buffer.append(x)
        if len(self.buffer) > self.window_size:
            self.buffer.pop(0)
        return np.mean(self.buffer)


class SitToStandAnalyzer:
    """Main analyzer for sit-to-stand clinical metrics"""

    def __init__(self, fps=30, filter_type='one_euro', enable_validators=True):
        """
        Args:
            fps: Frames per second of video
            filter_type: 'one_euro' or 'moving_average'
            enable_validators: Enable per-repetition posture validation
        """
        self.fps = fps
        self.filter_type = filter_type
        self.enable_validators = enable_validators

        # Thresholds (based on clinical literature)
        self.VALGUS_THRESHOLD = 168.0  # degrees
        self.SWAY_THRESHOLD = 2.5  # degrees (standard deviation)
        self.VELOCITY_THRESHOLD = -2.0  # pixels/frame (negative = upward)

        # Calibration values (computed during analysis)
        self.global_stand_y = None
        self.global_sit_y = None
        self.max_trunk_height = None
        self.frame_phases: List[PostureState] = [] # Stores PostureState for each frame

        # Validator (lazy initialization)
        self._validator = None

    def preprocess_sequence(self, bodies: List[StandardBody]) -> np.ndarray:
        """
        Step 1: Preprocess and smooth keypoint sequence

        Args:
            bodies: List of StandardBody objects (one per frame)

        Returns:
            Array of smoothed mid-hip positions (N, 2) with x, y
        """
        # Extract mid-hip positions
        mid_hip_positions = []
        for body in bodies:
            if body.mid_hip is not None and body.mid_hip[2] > 0.3:  # Confidence check
                mid_hip_positions.append([body.mid_hip[0], body.mid_hip[1]])
            else:
                # Use last valid position if current is invalid
                if mid_hip_positions:
                    mid_hip_positions.append(mid_hip_positions[-1])
                else:
                    mid_hip_positions.append([0, 0])

        mid_hip_array = np.array(mid_hip_positions)

        # Apply smoothing
        if self.filter_type == 'one_euro':
            filter_x = OneEuroFilter(freq=self.fps)
            filter_y = OneEuroFilter(freq=self.fps)
            smoothed = np.zeros_like(mid_hip_array)
            for i in range(len(mid_hip_array)):
                smoothed[i, 0] = filter_x(mid_hip_array[i, 0])
                smoothed[i, 1] = filter_y(mid_hip_array[i, 1])
        else:  # moving_average
            filter_x = MovingAverageFilter(window_size=5)
            filter_y = MovingAverageFilter(window_size=5)
            smoothed = np.zeros_like(mid_hip_array)
            for i in range(len(mid_hip_array)):
                smoothed[i, 0] = filter_x(mid_hip_array[i, 0])
                smoothed[i, 1] = filter_y(mid_hip_array[i, 1])

        return smoothed

    def global_calibration(self, bodies: List[StandardBody], smoothed_hip: np.ndarray):
        """
        Step 2: Determine global calibration values

        Args:
            bodies: List of StandardBody objects
            smoothed_hip: Smoothed mid-hip positions (N, 2)
        """
        # Extract all hip y-coordinates
        hip_y_values = smoothed_hip[:, 1]

        # Calculate standing and sitting heights using percentiles
        self.global_stand_y = np.percentile(hip_y_values, 5)  # Standing: lower Y-coordinate (higher in image)
        self.global_sit_y = np.percentile(hip_y_values, 95)   # Sitting: higher Y-coordinate (lower in image)

        # Calculate maximum trunk height
        trunk_heights = []
        for body in bodies:
            if body.mid_hip and body.mid_shoulder:
                if body.mid_hip[2] > 0.3 and body.mid_shoulder[2] > 0.3:
                    trunk_height = abs(body.mid_shoulder[1] - body.mid_hip[1])
                    trunk_heights.append(trunk_height)

        if trunk_heights:
            self.max_trunk_height = max(trunk_heights)
        else:
            self.max_trunk_height = 200  # Default fallback

    def segment_repetitions(self, smoothed_hip: np.ndarray) -> List[Repetition]:
        """
        Step 3: Segment repetitions using state machine, tracking phase for each frame.

        Args:
            smoothed_hip: Smoothed mid-hip positions (N, 2)

        Returns:
            List of Repetition objects
        """
        num_frames = len(smoothed_hip)
        self.frame_phases = [PostureState.SITTING] * num_frames # Initialize all as SITTING

        # Calculate velocity (negative = moving up in image coordinates)
        velocities = np.diff(smoothed_hip[:, 1])
        velocities = np.insert(velocities, 0, 0)  # Pad first frame

        # State machine variables
        current_state = PostureState.SITTING
        repetitions = []
        
        current_rep_data = {
            "start_frame": None,
            "end_frame": None,
            "sitting_start_frame": 0 if current_state == PostureState.SITTING else None, # Initialize for the very first frame
            "sitting_end_frame": None,
            "ascending_start_frame": None,
            "ascending_end_frame": None,
            "standing_start_frame": None,
            "standing_end_frame": None,
            "descending_start_frame": None,
            "descending_end_frame": None,
        }

        for frame in range(num_frames):
            hip_y = smoothed_hip[frame, 1]
            velocity = velocities[frame]

            # Calculate position relative to calibration
            range_height = self.global_sit_y - self.global_stand_y
            # percent_standing: 0 when sitting deep, 1 when standing tall
            percent_standing = (self.global_sit_y - hip_y) / range_height if range_height > 0 else 0
            percent_standing = np.clip(percent_standing, 0, 1)

            previous_state = current_state
            
            # --- State Transition Logic ---
            if current_state == PostureState.SITTING:
                if velocity < self.VELOCITY_THRESHOLD and percent_standing > 0.1:
                    current_state = PostureState.ASCENDING
                    current_rep_data["start_frame"] = frame
                    current_rep_data["ascending_start_frame"] = frame
                    current_rep_data["sitting_end_frame"] = frame - 1 # End of sitting phase for this rep

            elif current_state == PostureState.ASCENDING:
                if percent_standing > 0.8:
                    current_state = PostureState.STANDING
                    current_rep_data["ascending_end_frame"] = frame - 1
                    current_rep_data["standing_start_frame"] = frame
                elif velocity > -self.VELOCITY_THRESHOLD and percent_standing < 0.3: # Aborted ascent
                    current_state = PostureState.SITTING
                    # Reset data as this was an aborted rep, and a new sitting phase starts
                    current_rep_data = {
                        "start_frame": None, "end_frame": None,
                        "sitting_start_frame": frame, # New sitting phase starts here
                        "sitting_end_frame": None,
                        "ascending_start_frame": None, "ascending_end_frame": None,
                        "standing_start_frame": None, "standing_end_frame": None,
                        "descending_start_frame": None, "descending_end_frame": None,
                    }

            elif current_state == PostureState.STANDING:
                if velocity > abs(self.VELOCITY_THRESHOLD):
                    current_state = PostureState.DESCENDING
                    current_rep_data["standing_end_frame"] = frame - 1
                    current_rep_data["descending_start_frame"] = frame

            elif current_state == PostureState.DESCENDING:
                if percent_standing < 0.2:
                    current_state = PostureState.SITTING
                    current_rep_data["descending_end_frame"] = frame - 1
                    current_rep_data["end_frame"] = frame # End of repetition

                    # Record completed repetition
                    if current_rep_data["start_frame"] is not None:
                        repetitions.append(Repetition(
                            start_frame=current_rep_data["start_frame"],
                            end_frame=current_rep_data["end_frame"],
                            sitting_start_frame=current_rep_data["sitting_start_frame"],
                            sitting_end_frame=current_rep_data["sitting_end_frame"],
                            ascending_start_frame=current_rep_data["ascending_start_frame"],
                            ascending_end_frame=current_rep_data["ascending_end_frame"],
                            standing_start_frame=current_rep_data["standing_start_frame"],
                            standing_end_frame=current_rep_data["standing_end_frame"],
                            descending_start_frame=current_rep_data["descending_start_frame"],
                            descending_end_frame=current_rep_data["descending_end_frame"],
                        ))
                    
                    # Reset for next repetition - a new sitting phase starts now
                    current_rep_data = {
                        "start_frame": None, "end_frame": None,
                        "sitting_start_frame": frame, # New sitting phase starts here
                        "sitting_end_frame": None,
                        "ascending_start_frame": None, "ascending_end_frame": None,
                        "standing_start_frame": None, "standing_end_frame": None,
                        "descending_start_frame": None, "descending_end_frame": None,
                    }
            
            # Update frame_phases for the current frame
            self.frame_phases[frame] = current_state

        return repetitions

    def calculate_knee_angle(self, body: StandardBody, side='left') -> Optional[float]:
        """
        Calculate knee angle (FPPA - Frontal Plane Projection Angle)

        Returns STANDARD FPPA: 180° - interior_angle
        - 0° = perfectly straight leg
        - Positive values = VARUS (bow-leg)
        - Negative values = VALGUS (knock-knee)

        Args:
            body: StandardBody instance
            side: 'left' or 'right'

        Returns:
            FPPA angle in degrees (or None if keypoints not available)
        """
        if side == 'left':
            hip = body.l_hip
            knee = body.l_knee
            ankle = body.l_ankle
        else:
            hip = body.r_hip
            knee = body.r_knee
            ankle = body.r_ankle

        # Check confidence
        if any(kp[2] < 0.3 for kp in [hip, knee, ankle]):
            return None

        # Vector from knee to hip (pointing upward)
        v1_x = hip[0] - knee[0]
        v1_y = hip[1] - knee[1]

        # Vector from knee to ankle (pointing downward)
        v2_x = ankle[0] - knee[0]
        v2_y = ankle[1] - knee[1]

        # Calculate the basic angle between vectors using dot product
        dot_product = v1_x * v2_x + v1_y * v2_y
        mag_v1 = np.sqrt(v1_x**2 + v1_y**2)
        mag_v2 = np.sqrt(v2_x**2 + v2_y**2)

        if mag_v1 == 0 or mag_v2 == 0:
            return None

        cos_angle = np.clip(dot_product / (mag_v1 * mag_v2), -1.0, 1.0)
        angle_rad = np.arccos(cos_angle)
        base_angle = np.degrees(angle_rad)

        # base_angle is 0-180° (the angle between the two vectors)
        # For a straight leg pointing down, vectors point in opposite directions: base_angle ≈ 180°
        # For a bent leg: base_angle < 180°
        # We want: straight leg = 180°, bent = deviation from 180°
        straight_angle = base_angle  # Already 180 for straight leg!

        # Now determine deviation: is the knee bent medially (valgus) or laterally (varus)?
        # Use the X-coordinates to determine knee position relative to hip-ankle line

        # Calculate expected knee X if leg was perfectly straight
        # Linear interpolation: knee should be between hip and ankle
        hip_ankle_ratio = 0.5  # Assume knee is roughly halfway
        expected_knee_x = hip[0] + hip_ankle_ratio * (ankle[0] - hip[0])

        knee_deviation = knee[0] - expected_knee_x

        # For LEFT leg:
        #   - If knee_x > expected (knee to the right), it's VALGUS (medial deviation)
        #   - If knee_x < expected (knee to the left), it's VARUS (lateral deviation)
        # For RIGHT leg:
        #   - If knee_x < expected (knee to the left), it's VALGUS (medial deviation)
        #   - If knee_x > expected (knee to the right), it's VARUS (lateral deviation)

        DEVIATION_THRESHOLD = 5  # pixels

        if side == 'left':
            is_valgus = knee_deviation > DEVIATION_THRESHOLD
            is_varus = knee_deviation < -DEVIATION_THRESHOLD
        else:
            is_valgus = knee_deviation < -DEVIATION_THRESHOLD
            is_varus = knee_deviation > DEVIATION_THRESHOLD

        # Report INTERIOR angle:
        # - Straight leg: ~180°
        # The base calculation already gives us the interior angle correctly
        # We just need to adjust based on which direction the knee deviates

        if is_valgus:
            # Knee bent inward (medial) - this creates valgus
            # The calculation will naturally give us the interior angle
            interior_angle = straight_angle
        elif is_varus:
            # Knee bent outward (lateral) - this creates varus
            # Need to reflect the angle to get interior measurement
            deviation_amount = abs(180 - straight_angle)
            interior_angle = 180 + deviation_amount
        else:
            # Approximately straight
            interior_angle = straight_angle

        # Convert to STANDARD FPPA: 180° - interior_angle
        # This makes: 0° = straight, negative = valgus, positive = varus
        fppa_angle = 180.0 - interior_angle

        return fppa_angle

    def calculate_trunk_sway(self, body: StandardBody) -> Optional[float]:
        """
        Step 4C: Calculate lateral trunk sway angle

        Args:
            body: StandardBody instance

        Returns:
            Sway angle in degrees (or None if keypoints not available)
        """
        if body.mid_hip is None or body.mid_shoulder is None:
            return None

        if body.mid_hip[2] < 0.3 or body.mid_shoulder[2] < 0.3:
            return None

        # Calculate trunk vector
        dx = body.mid_shoulder[0] - body.mid_hip[0]
        dy = abs(body.mid_shoulder[1] - body.mid_hip[1])

        # Filter out forward lean (trunk too compressed)
        if dy < 0.5 * self.max_trunk_height:
            return None

        # Calculate sway angle (deviation from vertical)
        sway_angle = np.degrees(np.arctan2(dx, dy))

        return sway_angle

    def calculate_hip_sway(self, body: StandardBody) -> Optional[float]:
        """
        Calculate lateral hip sway angle
        Compares mid-hip position to mid-stance (between heels)

        Args:
            body: StandardBody instance

        Returns:
            Hip sway angle in degrees (or None if keypoints not available)
        """
        if not all([body.mid_hip, body.l_heel, body.r_heel]):
            return None

        if body.mid_hip[2] < 0.3 or body.l_heel[2] < 0.3 or body.r_heel[2] < 0.3:
            return None

        # Calculate mid-stance point (between heels)
        mid_stance_x = (body.l_heel[0] + body.r_heel[0]) / 2
        mid_stance_y = (body.l_heel[1] + body.r_heel[1]) / 2

        # Calculate lateral displacement
        dx = body.mid_hip[0] - mid_stance_x
        dy = abs(body.mid_hip[1] - mid_stance_y)

        if dy == 0:
            return None

        # Calculate hip sway angle (deviation from vertical)
        hip_sway_angle = np.degrees(np.arctan2(dx, dy))

        return hip_sway_angle

    def validate_repetition(self, bodies: List[StandardBody], rep: Repetition) -> Repetition:
        """
        Validate repetition posture using per-repetition validators.
        Validation only occurs during the SITTING phase of the repetition.

        Args:
            bodies: Full list of StandardBody objects
            rep: Repetition to validate

        Returns:
            Updated Repetition with validation results
        """
        if not self.enable_validators:
            rep.is_clinically_valid = True
            return rep

        # Lazy import and initialization
        if self._validator is None:
            from .validators import PostureValidator
            self._validator = PostureValidator()

        # Iterate through frames that are explicitly in the SITTING phase for this repetition
        # Ensure sitting_start_frame and sitting_end_frame are valid
        if rep.sitting_start_frame is None or rep.sitting_end_frame is None:
            rep.is_clinically_valid = False
            rep.validator_failures.append("No defined SITTING phase for validation")
            return rep

        # Check every Nth frame in the sitting phase to reduce computation
        validation_frames = range(rep.sitting_start_frame, rep.sitting_end_frame + 1, 3)

        for frame_idx in validation_frames:
            if frame_idx >= len(bodies):
                continue # Skip if frame_idx is out of bounds (shouldn't happen with correct rep bounds)
            
            # Double-check that this frame is indeed in the SITTING state (redundant but safe)
            if self.frame_phases[frame_idx] != PostureState.SITTING:
                continue

            body = bodies[frame_idx]

            # Run all per-repetition validators
            report = self._validator.validate_all_per_repetition(body)
            
            # DEBUG PRINT
            print(f"[DEBUG] Frame {frame_idx} (SITTING): Stance={report.stance_width.metric_value:.2f}, FootL={report.foot_rotation_left.metric_value:.2f}, FootR={report.foot_rotation_right.metric_value:.2f}")


            if not report.all_valid:
                rep.is_clinically_valid = False

                # Collect failure reasons (only unique ones)
                if not report.stance_width.is_valid:
                    reason = f"Stance Width: {report.stance_width.metric_value:.2f}"
                    if reason not in rep.validator_failures:
                        rep.validator_failures.append(reason)

                if not report.foot_rotation_left.is_valid:
                    reason = f"Duck Foot (L): {report.foot_rotation_left.metric_value:.2f}"
                    if reason not in rep.validator_failures:
                        rep.validator_failures.append(reason)

                if not report.foot_rotation_right.is_valid:
                    reason = f"Duck Foot (R): {report.foot_rotation_right.metric_value:.2f}"
                    if reason not in rep.validator_failures:
                        rep.validator_failures.append(reason)
                
                # If any frame in the sitting phase fails validation, the rep is clinically invalid.
                # No need to check further frames for this rep's clinical validity.
                break 

        return rep

    def analyze_repetition(self, bodies: List[StandardBody], rep: Repetition) -> Repetition:
        """
        Step 4: Analyze biomechanics for a single repetition, using ONLY the ascending phase.

        Args:
            bodies: Full list of StandardBody objects
            rep: Repetition to analyze

        Returns:
            Updated Repetition with metrics
        """
        # First validate the repetition posture (uses SITTING phase)
        rep = self.validate_repetition(bodies, rep)

        # If the rep is not clinically valid, we don't need to calculate biomechanics
        if not rep.is_clinically_valid:
            return rep

        # Define analysis window (Ascending phase only, as per clinical requirements)
        if rep.ascending_start_frame is None or rep.ascending_end_frame is None:
            # This case should ideally not be reached for a clinically valid rep, but as a safeguard:
            print(f"WARNING: Rep starting at frame {rep.start_frame} is valid but has no defined ascending phase. Skipping biomechanical analysis.")
            return rep

        # Ensure frame indices are valid
        start = max(0, rep.ascending_start_frame)
        end = min(len(bodies), rep.ascending_end_frame + 1)
        if start >= end:
            print(f"WARNING: Rep starting at frame {rep.start_frame} has an invalid ascending phase window ({start}-{end}). Skipping.")
            return rep
            
        rep_bodies = bodies[start:end]

        fppa_left_angles = []
        fppa_right_angles = []
        sway_angles = []
        hip_sway_angles = []

        for body in rep_bodies:
            # Knee angles (FPPA: 180° - interior_angle)
            # Negative = valgus, Positive = varus, 0 = straight
            fppa_left = self.calculate_knee_angle(body, 'left')
            if fppa_left is not None:
                fppa_left_angles.append(fppa_left)

            fppa_right = self.calculate_knee_angle(body, 'right')
            if fppa_right is not None:
                fppa_right_angles.append(fppa_right)

            # Trunk sway
            sway = self.calculate_trunk_sway(body)
            if sway is not None:
                sway_angles.append(sway)

            # Hip sway
            hip_sway = self.calculate_hip_sway(body)
            if hip_sway is not None:
                hip_sway_angles.append(hip_sway)

        # Calculate FPPA metrics: Find PEAK VALGUS (minimum/most negative value)
        if fppa_left_angles:
            rep.peak_valgus_angle_left = min(fppa_left_angles)
        if fppa_right_angles:
            rep.peak_valgus_angle_right = min(fppa_right_angles)

        # Determine worst case peak valgus angle between left and right
        if rep.peak_valgus_angle_left is not None and rep.peak_valgus_angle_right is not None:
            rep.peak_valgus_angle = min(rep.peak_valgus_angle_left, rep.peak_valgus_angle_right)
        elif rep.peak_valgus_angle_left is not None:
            rep.peak_valgus_angle = rep.peak_valgus_angle_left
        elif rep.peak_valgus_angle_right is not None:
            rep.peak_valgus_angle = rep.peak_valgus_angle_right

        # Calculate sway metrics: STANDARD DEVIATION
        if sway_angles and len(sway_angles) > 1:
            rep.trunk_sway_std = np.std(sway_angles)
        else:
            rep.trunk_sway_std = 0.0

        if hip_sway_angles and len(hip_sway_angles) > 1:
            rep.hip_sway_std = np.std(hip_sway_angles)
        else:
            rep.hip_sway_std = 0.0

        # Apply thresholds (using FPPA standard: negative = valgus)
        # Valgus threshold: FPPA < -12° (equivalent to interior angle > 192°)
        VALGUS_FPPA_THRESHOLD = -12.0
        rep.has_valgus = (
            (rep.peak_valgus_angle_left is not None and rep.peak_valgus_angle_left < VALGUS_FPPA_THRESHOLD) or
            (rep.peak_valgus_angle_right is not None and rep.peak_valgus_angle_right < VALGUS_FPPA_THRESHOLD)
        )

        # An instability event can be high trunk sway OR high hip sway
        rep.has_instability = (rep.trunk_sway_std and rep.trunk_sway_std > self.SWAY_THRESHOLD) or \
                              (rep.hip_sway_std and rep.hip_sway_std > self.SWAY_THRESHOLD)

        return rep

    def analyze(self, bodies: List[StandardBody]) -> ClinicalMetrics:
        """
        Complete analysis pipeline

        Args:
            bodies: List of StandardBody objects (one per frame)

        Returns:
            ClinicalMetrics with full assessment
        """
        print(f"Starting analysis of {len(bodies)} frames...")

        # Step 1: Preprocessing
        print("Step 1: Preprocessing and smoothing...")
        smoothed_hip = self.preprocess_sequence(bodies)

        # Step 2: Global calibration
        print("Step 2: Global calibration...")
        self.global_calibration(bodies, smoothed_hip)
        print(f"  Standing Y: {self.global_stand_y:.1f}, Sitting Y: {self.global_sit_y:.1f}")
        print(f"  Max trunk height: {self.max_trunk_height:.1f}")

        # Step 3: Segment repetitions
        print("Step 3: Segmenting repetitions...")
        repetitions = self.segment_repetitions(smoothed_hip)
        print(f"  Detected {len(repetitions)} repetitions")

        # Step 4: Analyze each repetition
        print("Step 4: Analyzing biomechanics...")
        # Note: Rep validation now happens inside analyze_repetition
        analyzed_repetitions = [self.analyze_repetition(bodies, rep) for rep in repetitions]

        # Separate clinically valid and invalid reps
        clinically_valid_reps = [r for r in analyzed_repetitions if r.is_clinically_valid]
        clinically_invalid_reps = [r for r in analyzed_repetitions if not r.is_clinically_valid]

        # Compute aggregate metrics (only from CLINICALLY VALID reps)
        peak_valgus_angles = []
        trunk_sway_stds = []
        hip_sway_stds = []

        for r in clinically_valid_reps:
            if r.peak_valgus_angle is not None:
                peak_valgus_angles.append(r.peak_valgus_angle)
            if r.trunk_sway_std is not None:
                trunk_sway_stds.append(r.trunk_sway_std)
            if r.hip_sway_std is not None:
                hip_sway_stds.append(r.hip_sway_std)

        metrics = ClinicalMetrics(
            total_reps=len(repetitions),
            valid_reps=len(clinically_valid_reps),
            invalid_reps=len(clinically_invalid_reps),
            repetitions=analyzed_repetitions,
            mean_fppa=np.mean(peak_valgus_angles) if peak_valgus_angles else 0.0,
            max_trunk_sway_std=max(trunk_sway_stds) if trunk_sway_stds else 0.0,
            max_hip_sway_std=max(hip_sway_stds) if hip_sway_stds else 0.0,
            mean_trunk_sway_std=np.mean(trunk_sway_stds) if trunk_sway_stds else 0.0,
            mean_hip_sway_std=np.mean(hip_sway_stds) if hip_sway_stds else 0.0,
            valgus_count=sum(1 for r in clinically_valid_reps if r.has_valgus),
            instability_count=sum(1 for r in clinically_valid_reps if r.has_instability)
        )

        print("\n=== Analysis Complete ===")
        print(f"Total Reps Detected: {metrics.total_reps}")
        print(f"Clinically Valid Reps (contributing to metrics): {metrics.valid_reps}")
        print(f"Clinically Invalid Reps (posture violations): {metrics.invalid_reps}")

        if clinically_invalid_reps and self.enable_validators:
            print("\nClinically Invalid Reps Details:")
            for i, rep in enumerate(clinically_invalid_reps):
                rep_num = repetitions.index(rep) + 1
                print(f"  Rep {rep_num}: {', '.join(rep.validator_failures)}")

        print(f"\nClinical Metrics (from clinically valid reps):")
        print(f"  Mean FPPA (Peak Valgus Angle): {metrics.mean_fppa:.2f}°")
        print(f"  Max Trunk Sway (SD): {metrics.max_trunk_sway_std:.2f}°")
        print(f"  Mean Trunk Sway (SD): {metrics.mean_trunk_sway_std:.2f}°")
        print(f"  Max Hip Sway (SD): {metrics.max_hip_sway_std:.2f}°")
        print(f"  Mean Hip Sway (SD): {metrics.mean_hip_sway_std:.2f}°")
        print(f"  Valgus Events (in valid reps): {metrics.valgus_count}")
        print(f"  Instability Events (in valid reps): {metrics.instability_count}")

        return metrics


# Test with synthetic data
if __name__ == "__main__":
    print("=== Analyzer Test with Synthetic Data ===\n")

    # Create synthetic sit-to-stand sequence
    num_frames = 300  # 10 seconds at 30fps
    bodies = []

    for i in range(num_frames):
        # Simulate 3 sit-to-stand cycles (each cycle is 100 frames)
        cycle_position = (i % 100) / 100.0
        if cycle_position < 0.3:  # Sitting (0-30%)
            hip_y = 500  # Lower position (higher Y)
        elif cycle_position < 0.5:  # Rising (30-50%)
            progress = (cycle_position - 0.3) / 0.2
            hip_y = 500 - progress * 300  # Move up
        elif cycle_position < 0.7:  # Standing (50-70%)
            hip_y = 200  # Higher position (lower Y)
        else:  # Descending (70-100%)
            progress = (cycle_position - 0.7) / 0.3
            hip_y = 200 + progress * 300  # Move down

        # Add some noise and valgus simulation
        noise = np.random.randn() * 5
        valgus_offset = 15 if i % 100 > 40 and i % 100 < 60 else 0  # Valgus during mid-rise

        from .pose_engine import StandardBody
        body = StandardBody(
            nose=(320, 100, 0.9),
            l_shoulder=(280, 150, 0.9),
            r_shoulder=(360, 150, 0.9),
            l_hip=(290, hip_y + noise, 0.9),
            r_hip=(350 + valgus_offset, hip_y + noise, 0.9),
            l_knee=(285, hip_y + 150 + noise, 0.9),
            r_knee=(355 + valgus_offset, hip_y + 150 + noise, 0.9),
            l_ankle=(280, hip_y + 300, 0.9),
            r_ankle=(360, hip_y + 300, 0.9),
        )
        bodies.append(body)

    # Run analysis
    analyzer = SitToStandAnalyzer(fps=30, filter_type='moving_average')
    metrics = analyzer.analyze(bodies)

    print(f"\n[OK] Test completed successfully!")
