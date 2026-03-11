/**
 * MediaPipe Landmark Adapter
 *
 * Converts MediaPipe Tasks Vision NormalizedLandmark[] (33 points) to a
 * StandardBody object with pixel coordinates — mirroring Python's MediaPipeAdapter
 * in pose_engine.py.
 *
 * MediaPipe landmark indices:
 *   0: nose
 *   11: left_shoulder,  12: right_shoulder
 *   13: left_elbow,     14: right_elbow
 *   15: left_wrist,     16: right_wrist
 *   23: left_hip,       24: right_hip
 *   25: left_knee,      26: right_knee
 *   27: left_ankle,     28: right_ankle
 *   29: left_heel,      30: right_heel
 *   31: left_foot_index (big toe),  32: right_foot_index (big toe)
 */

const KEYPOINT_MAP = {
  nose:       0,
  l_shoulder: 11, r_shoulder: 12,
  l_elbow:    13, r_elbow:    14,
  l_wrist:    15, r_wrist:    16,
  l_hip:      23, r_hip:      24,
  l_knee:     25, r_knee:     26,
  l_ankle:    27, r_ankle:    28,
  l_heel:     29, r_heel:     30,
  l_big_toe:  31, r_big_toe:  32,
};

/**
 * Extract a single landmark as a [x_px, y_px, visibility] tuple.
 * MediaPipe normalizes to [0,1]; we multiply by video dimensions.
 */
function getPoint(landmarks, name, vw, vh) {
  const lm = landmarks[KEYPOINT_MAP[name]];
  return [lm.x * vw, lm.y * vh, lm.visibility ?? 0];
}

/**
 * Convert MediaPipe landmark result to a StandardBody pixel-coordinate object.
 *
 * @param {NormalizedLandmark[]} landmarks - result.landmarks[0] from detectForVideo()
 * @param {number} videoWidth  - pixel width of the video element
 * @param {number} videoHeight - pixel height of the video element
 * @returns {StandardBody} Plain object with [x, y, visibility] tuples for each keypoint
 */
export function landmarksToStandardBody(landmarks, videoWidth, videoHeight) {
  const vw = videoWidth;
  const vh = videoHeight;
  const p  = (name) => getPoint(landmarks, name, vw, vh);

  const ls = p('l_shoulder');
  const rs = p('r_shoulder');
  const lh = p('l_hip');
  const rh = p('r_hip');

  return {
    nose:       p('nose'),
    l_shoulder: ls,
    r_shoulder: rs,
    l_elbow:    p('l_elbow'),
    r_elbow:    p('r_elbow'),
    l_wrist:    p('l_wrist'),
    r_wrist:    p('r_wrist'),
    l_hip:      lh,
    r_hip:      rh,
    l_knee:     p('l_knee'),
    r_knee:     p('r_knee'),
    l_ankle:    p('l_ankle'),
    r_ankle:    p('r_ankle'),
    l_heel:     p('l_heel'),
    r_heel:     p('r_heel'),
    l_big_toe:  p('l_big_toe'),
    r_big_toe:  p('r_big_toe'),
    // Derived midpoints (mirrors Python StandardBody.__post_init__)
    mid_shoulder: [
      (ls[0] + rs[0]) / 2,
      (ls[1] + rs[1]) / 2,
      Math.min(ls[2], rs[2]),
    ],
    mid_hip: [
      (lh[0] + rh[0]) / 2,
      (lh[1] + rh[1]) / 2,
      Math.min(lh[2], rh[2]),
    ],
  };
}
