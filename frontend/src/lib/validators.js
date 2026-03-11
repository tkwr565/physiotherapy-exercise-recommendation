/**
 * Posture Validators — JS port of validators.py PostureValidator
 *
 * All thresholds and logic are exact ports from the Python implementation.
 * Input: StandardBody object with pixel-coordinate [x, y, visibility] tuples.
 * Output: PostureReport plain object.
 *
 * NOTE on box dimensions (portrait phone):
 *   validateBodyPlacement() uses vw*0.76 × vh*0.77  (strict boundary)
 *   drawValidationBox() in usePoseLandmarker uses vw*0.82 × vh*0.82  (visual margin)
 *   These are intentionally different — the drawn box gives the user comfortable margin.
 */

const CONFIDENCE_THRESHOLD = 0.3;
const STANCE_RATIO_MIN     = 0.8;
const STANCE_RATIO_MAX     = 1.2;
const FOOT_ROTATION_MAX    = 0.7;

function dist(a, b) {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  return Math.sqrt(dx * dx + dy * dy);
}

function validPoint(p) {
  return p && p[2] > CONFIDENCE_THRESHOLD;
}

function makeResult(isValid, metricValue, failureReason = null) {
  return { isValid, metricValue, failureReason };
}

/**
 * Validator 1: Stance Width
 * stance_ratio = euclidean(l_heel, r_heel) / euclidean(l_shoulder, r_shoulder)
 * Valid: 0.8 ≤ stance_ratio ≤ 1.2
 *
 * @param {StandardBody} body
 * @returns {ValidationResult}
 */
export function validateStanceWidth(body) {
  const { l_shoulder, r_shoulder, l_heel, r_heel } = body;

  if (!validPoint(l_shoulder) || !validPoint(r_shoulder)) {
    return makeResult(false, 0, 'Low shoulder confidence');
  }
  if (!validPoint(l_heel) || !validPoint(r_heel)) {
    return makeResult(false, 0, 'Missing heel keypoints');
  }

  const shoulderWidth = dist(l_shoulder, r_shoulder);
  if (shoulderWidth === 0) {
    return makeResult(false, 0, 'Invalid shoulder width');
  }

  const footWidth   = dist(l_heel, r_heel);
  const stanceRatio = footWidth / shoulderWidth;
  const isValid     = stanceRatio >= STANCE_RATIO_MIN && stanceRatio <= STANCE_RATIO_MAX;

  return makeResult(
    isValid,
    stanceRatio,
    isValid ? null : `Feet too wide (ratio: ${stanceRatio.toFixed(2)})`
  );
}

/**
 * Validator 2: Foot Rotation (duck foot)
 * rotation_ratio = abs(toe_x - heel_x) / sqrt((toe_x-heel_x)² + (toe_y-heel_y)²)
 * Valid: rotation_ratio < 0.7
 *
 * @param {StandardBody} body
 * @param {'left'|'right'} side
 * @returns {ValidationResult}
 */
export function validateFootRotation(body, side) {
  const heel = side === 'left' ? body.l_heel    : body.r_heel;
  const toe  = side === 'left' ? body.l_big_toe : body.r_big_toe;

  if (!validPoint(heel) || !validPoint(toe)) {
    return makeResult(false, 0, `Missing ${side} foot keypoints`);
  }

  const footDx     = toe[0] - heel[0];
  const footDy     = toe[1] - heel[1];
  const footLength = Math.sqrt(footDx * footDx + footDy * footDy);

  if (footLength === 0) {
    return makeResult(false, 0, `Invalid ${side} foot length`);
  }

  const rotationRatio = Math.abs(footDx) / footLength;
  const isValid       = rotationRatio < FOOT_ROTATION_MAX;

  return makeResult(
    isValid,
    rotationRatio,
    isValid ? null : `${side === 'left' ? 'Left' : 'Right'} foot rotated out (${rotationRatio.toFixed(2)})`
  );
}

/**
 * Validator 3: Body Placement
 * All visible keypoints must be inside a centered guide box.
 *
 * Designed for portrait phone (9:16). Dimensions are intentionally slightly
 * stricter than the drawn box (0.76 vs drawn 0.82 wide, 0.77 vs drawn 0.82 tall)
 * so the visual box gives the user a comfortable margin before the check fails.
 *
 * @param {StandardBody} body
 * @param {number} videoWidth
 * @param {number} videoHeight
 * @returns {ValidationResult}
 */
export function validateBodyPlacement(body, videoWidth, videoHeight) {
  const vw = videoWidth;
  const vh = videoHeight;

  const boxW  = vw * 0.76;
  const boxH  = vh * 0.77;
  const boxX1 = (vw - boxW) / 2;
  const boxX2 = boxX1 + boxW;
  const boxY2 = vh * 0.97;
  const boxY1 = boxY2 - boxH;

  const pointsToCheck = [
    body.l_shoulder, body.r_shoulder,
    body.l_hip,      body.r_hip,
    body.l_knee,     body.r_knee,
    body.l_ankle,    body.r_ankle,
    body.l_heel,     body.r_heel,
    body.l_big_toe,  body.r_big_toe,
  ];

  const visiblePoints = pointsToCheck.filter(validPoint);
  if (visiblePoints.length === 0) {
    return makeResult(false, 0, 'No keypoints detected');
  }

  for (const point of visiblePoints) {
    const [x, y] = point;
    if (x < boxX1 || x > boxX2 || y < boxY1 || y > boxY2) {
      return makeResult(false, 0, 'Move your whole body inside the box');
    }
  }

  return makeResult(true, 1, null);
}

/**
 * Run all validators and return a PostureReport.
 *
 * @param {StandardBody} body
 * @param {number} videoWidth
 * @param {number} videoHeight
 * @returns {PostureReport}
 */
export function validateAll(body, videoWidth, videoHeight) {
  const stanceWidth       = validateStanceWidth(body);
  const footRotationLeft  = validateFootRotation(body, 'left');
  const footRotationRight = validateFootRotation(body, 'right');
  const bodyPlacement     = validateBodyPlacement(body, videoWidth, videoHeight);

  const allValid =
    stanceWidth.isValid &&
    footRotationLeft.isValid &&
    footRotationRight.isValid &&
    bodyPlacement.isValid;

  return { stanceWidth, footRotationLeft, footRotationRight, bodyPlacement, allValid };
}
