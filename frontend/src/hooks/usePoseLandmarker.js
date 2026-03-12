import { useEffect, useRef, useState } from 'react';
import { PoseLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import { landmarksToStandardBody } from '../lib/mediapipeAdapter';
import { validateAll } from '../lib/validators';

// ─── MediaPipe initialization ────────────────────────────────────────────────

async function createPoseLandmarker() {
  const vision = await FilesetResolver.forVisionTasks(
    'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/wasm'
  );
  return PoseLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: '/models/pose_landmarker_lite.task',
      delegate: 'GPU',
    },
    runningMode: 'VIDEO',
    numPoses: 1,
    minPoseDetectionConfidence: 0.5,
    minPosePresenceConfidence:  0.5,
    minTrackingConfidence:      0.5,
  });
}

// ─── Skeleton connections ────────────────────────────────────────────────────

const CONNECTIONS = [
  ['l_shoulder', 'r_shoulder', '#FF8000'],
  ['mid_shoulder', 'mid_hip',  '#FF8000'],
  ['l_shoulder', 'l_hip',     '#FF8000'],
  ['r_shoulder', 'r_hip',     '#FF8000'],
  ['l_hip', 'r_hip',          '#FF00FF'],
  ['l_hip',   'l_knee',       '#FF00FF'],
  ['l_knee',  'l_ankle',      '#FFFF00'],
  ['l_ankle', 'l_heel',       '#00FFFF'],
  ['l_heel',  'l_big_toe',    '#00FF00'],
  ['r_hip',   'r_knee',       '#FF00FF'],
  ['r_knee',  'r_ankle',      '#FFFF00'],
  ['r_ankle', 'r_heel',       '#00FFFF'],
  ['r_heel',  'r_big_toe',    '#00FF00'],
  ['l_heel',  'r_heel',       '#00FF00'],
];

const KEYPOINT_COLORS = {
  l_shoulder: '#FF8000', r_shoulder: '#FF8000', mid_shoulder: '#FF8000',
  l_hip: '#FF00FF',      r_hip: '#FF00FF',      mid_hip: '#FF00FF',
  l_knee: '#FFFF00',     r_knee: '#FFFF00',
  l_ankle: '#00FFFF',    r_ankle: '#00FFFF',
  l_heel: '#00FF00',     r_heel: '#00FF00',
  l_big_toe: '#00FF00',  r_big_toe: '#00FF00',
  nose: '#FFFFFF',
};

// ─── Coordinate transform helpers ────────────────────────────────────────────

/**
 * Compute the scale + offset that maps video pixels → canvas (screen) pixels,
 * replicating exactly what the browser does when it displays the <video> with
 * object-fit:cover on a portrait screen.
 *
 * For a landscape stream (vw > vh) the browser rotates 90° CW first, giving
 * an effective portrait frame of (vh × vw), then scales to cover the canvas.
 * For a native portrait stream (vh > vw) no rotation is needed.
 *
 * Returns { needsRotate, sf, ox, oy }
 *   sf – scale factor applied after (optional) rotation
 *   ox – horizontal pixels cropped from the left of the scaled frame
 *   oy – vertical   pixels cropped from the top  of the scaled frame
 */
function computeTransform(vw, vh, cw, ch) {
  const needsRotate = vw > vh;
  const portraitW   = needsRotate ? vh : vw;  // narrow dim after rotation
  const portraitH   = needsRotate ? vw : vh;  // tall   dim after rotation
  const sf          = Math.max(cw / portraitW, ch / portraitH);
  const ox          = (portraitW * sf - cw) / 2;
  const oy          = (portraitH * sf - ch) / 2;
  return { needsRotate, sf, ox, oy };
}

/**
 * Transform a single [px, py, vis] point from landscape-video pixel space
 * into portrait-canvas pixel space using the precomputed transform.
 */
function transformPoint([px, py, vis], { needsRotate, sf, ox, oy, vh }) {
  if (needsRotate) {
    // CW 90°: portrait_x = vh - py,  portrait_y = px
    return [(vh - py) * sf - ox, px * sf - oy, vis];
  }
  return [px * sf - ox, py * sf - oy, vis];
}

function transformBody(body, t) {
  const result = {};
  for (const [key, val] of Object.entries(body)) result[key] = transformPoint(val, t);
  return result;
}

// ─── Canvas drawing helpers ──────────────────────────────────────────────────

function drawSkeleton(ctx, body) {
  if (!body) return;
  for (const [fromKey, toKey, color] of CONNECTIONS) {
    const from = body[fromKey];
    const to   = body[toKey];
    if (!from || !to || from[2] < 0.3 || to[2] < 0.3) continue;
    ctx.beginPath();
    ctx.moveTo(from[0], from[1]);
    ctx.lineTo(to[0], to[1]);
    ctx.strokeStyle = color;
    ctx.lineWidth   = 3;
    ctx.stroke();
  }
  for (const [key, color] of Object.entries(KEYPOINT_COLORS)) {
    const point = body[key];
    if (!point || point[2] < 0.3) continue;
    const [x, y] = point;
    ctx.beginPath();
    ctx.arc(x, y, 7, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  }
}

function drawValidationBox(ctx, vw, vh, isValid, t) {
  const boxW = vw * 0.80;
  const boxH = vh * 0.72;           // shorter box — more top breathing room
  const x1   = (vw - boxW) / 2;
  const y2   = vh * 0.96;
  const y1   = y2 - boxH;

  const color     = isValid ? '#00FF88' : '#FF4455';
  const colorGlow = isValid ? 'rgba(0,255,136,0.18)' : 'rgba(255,68,85,0.18)';

  // Subtle fill tint
  ctx.fillStyle = colorGlow;
  ctx.fillRect(x1, y1, boxW, boxH);

  // Main border — dashed
  ctx.strokeStyle = color;
  ctx.lineWidth   = 2.5;
  ctx.setLineDash([14, 8]);
  ctx.strokeRect(x1, y1, boxW, boxH);
  ctx.setLineDash([]);

  // Bold corner brackets
  const cs = Math.round(vw * 0.055);
  ctx.strokeStyle = color;
  ctx.lineWidth   = 5;
  ctx.lineCap     = 'round';
  for (const [cx, cy, dx, dy] of [
    [x1,        y1, 1,  1],
    [x1 + boxW, y1, -1, 1],
    [x1,        y2, 1, -1],
    [x1 + boxW, y2, -1,-1],
  ]) {
    ctx.beginPath();
    ctx.moveTo(cx + dx * cs, cy);
    ctx.lineTo(cx, cy);
    ctx.lineTo(cx, cy + dy * cs);
    ctx.stroke();
  }
  ctx.lineCap = 'butt';

  // Label above box
  // Label centred inside the box
  const fs = Math.round(vw * 0.042);
  ctx.font         = `700 ${fs}px sans-serif`;
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor  = 'rgba(0,0,0,0.8)';
  ctx.shadowBlur   = 10;
  ctx.fillStyle    = color;
  ctx.fillText(t('sts.placeBodyInBox'), vw / 2, y1 + boxH * 0.12);
  ctx.shadowBlur   = 0;

  ctx.textAlign    = 'left';
  ctx.textBaseline = 'alphabetic';
}

function drawValidationPanel(ctx, report, vw, t) {
  // Scale relative to canvas width so it looks right on any phone
  const scale = vw / 390;          // 390 = reference portrait width

  const rowH   = Math.round(44 * scale);
  const iconFs = Math.round(18 * scale);
  const labelFs= Math.round(17 * scale);
  const pad    = Math.round(14 * scale);
  const radius = Math.round(14 * scale);

  const rows = report
    ? [
        { label: t('sts.stanceWidth'), ok: report.stanceWidth.isValid },
        { label: t('sts.leftFoot'),    ok: report.footRotationLeft.isValid },
        { label: t('sts.rightFoot'),   ok: report.footRotationRight.isValid },
        { label: t('sts.position'),    ok: report.bodyPlacement.isValid },
      ]
    : [{ label: t('sts.noPersonDetected'), ok: false }];

  const badgeH = Math.round(46 * scale);
  const panelW = Math.round(265 * scale);
  const panelH = rows.length * rowH + badgeH + Math.round(8 * scale);
  const px     = Math.round(14 * scale);
  const py     = Math.round(18 * scale);          // top-left corner

  // ── Card background ────────────────────────────────────────────────────
  ctx.fillStyle = 'rgba(10,15,30,0.82)';
  ctx.beginPath();
  ctx.roundRect(px, py, panelW, panelH, radius);
  ctx.fill();

  // Subtle top border accent
  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.lineWidth   = 1.5;
  ctx.beginPath();
  ctx.roundRect(px, py, panelW, panelH, radius);
  ctx.stroke();

  // ── Rows ───────────────────────────────────────────────────────────────
  ctx.textBaseline = 'middle';

  rows.forEach((row, i) => {
    const ry      = py + Math.round(5 * scale) + i * rowH + rowH / 2;
    const okColor = '#34d399';   // emerald-400
    const noColor = '#f87171';   // red-400
    const col     = row.ok ? okColor : noColor;

    // Row highlight on valid
    if (row.ok) {
      ctx.fillStyle = 'rgba(52,211,153,0.08)';
      ctx.fillRect(px, py + Math.round(5 * scale) + i * rowH, panelW, rowH);
    }

    // Icon pill
    const pillW = Math.round(36 * scale);
    const pillH = Math.round(28 * scale);
    const pillX = px + pad;
    const pillY = ry - pillH / 2;
    ctx.fillStyle = row.ok ? 'rgba(52,211,153,0.2)' : 'rgba(248,113,113,0.15)';
    ctx.beginPath();
    ctx.roundRect(pillX, pillY, pillW, pillH, pillH / 2);
    ctx.fill();

    ctx.fillStyle    = col;
    ctx.font         = `700 ${iconFs}px sans-serif`;
    ctx.textAlign    = 'center';
    ctx.shadowColor  = col;
    ctx.shadowBlur   = 6;
    ctx.fillText(row.ok ? '✓' : '✗', pillX + pillW / 2, ry);
    ctx.shadowBlur   = 0;

    // Label
    ctx.fillStyle = row.ok ? '#d1fae5' : '#fecaca';
    ctx.font      = `600 ${labelFs}px sans-serif`;
    ctx.textAlign = 'left';
    ctx.fillText(row.label, pillX + pillW + Math.round(12 * scale), ry);
  });

  // ── Status badge ───────────────────────────────────────────────────────
  if (report) {
    const badgeOk  = report.allValid;
    const badgeY   = py + rows.length * rowH + Math.round(10 * scale);
    const badgeFs  = Math.round(21 * scale);
    const badgePad = Math.round(10 * scale);

    ctx.fillStyle = badgeOk ? 'rgba(52,211,153,0.22)' : 'rgba(248,113,113,0.18)';
    ctx.beginPath();
    ctx.roundRect(
      px + badgePad, badgeY,
      panelW - badgePad * 2, badgeH - badgePad,
      Math.round(10 * scale)
    );
    ctx.fill();

    const badgeColor = badgeOk ? '#34d399' : '#f87171';
    ctx.strokeStyle  = badgeColor;
    ctx.lineWidth    = 1.5;
    ctx.beginPath();
    ctx.roundRect(
      px + badgePad, badgeY,
      panelW - badgePad * 2, badgeH - badgePad,
      Math.round(10 * scale)
    );
    ctx.stroke();

    ctx.fillStyle    = badgeColor;
    ctx.font         = `700 ${badgeFs}px sans-serif`;
    ctx.textAlign    = 'center';
    ctx.shadowColor  = badgeColor;
    ctx.shadowBlur   = 10;
    ctx.fillText(
      badgeOk ? `✓  ${t('sts.readyToRecord')}` : `✗  ${t('sts.notReady')}`,
      px + panelW / 2,
      badgeY + (badgeH - badgePad) / 2
    );
    ctx.shadowBlur   = 0;
  }

  ctx.textAlign    = 'left';
  ctx.textBaseline = 'alphabetic';
}

function drawCountdownOverlay(ctx, vw, vh, countdown) {
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  ctx.fillRect(0, 0, vw, vh);

  const fontSize = Math.round(vh * 0.28);
  ctx.fillStyle    = '#ffffff';
  ctx.font         = `bold ${fontSize}px sans-serif`;
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(String(countdown), vw / 2, vh / 2);

  ctx.fillStyle    = 'rgba(255,255,255,0.7)';
  ctx.font         = `bold ${Math.round(vw * 0.05)}px sans-serif`;
  ctx.textBaseline = 'top';
  ctx.fillText('HOLD POSITION', vw / 2, vh / 2 + fontSize * 0.6);

  ctx.textAlign    = 'left';
  ctx.textBaseline = 'alphabetic';
}

function drawRecordingBar(ctx, vw, vh, secondsLeft) {
  const progress = (30 - secondsLeft) / 30;
  const barH     = Math.round(vh * 0.006);

  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  ctx.fillRect(0, 0, vw, barH);
  ctx.fillStyle = '#ef4444';
  ctx.fillRect(0, 0, vw * progress, barH);

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const ss = String(secondsLeft % 60).padStart(2, '0');
  const fs = Math.round(vw * 0.04);
  ctx.fillStyle = '#ef4444';
  ctx.font      = `bold ${fs}px sans-serif`;
  ctx.textAlign = 'right';
  ctx.fillText(`REC  ${mm}:${ss}`, vw - Math.round(vw * 0.03), barH + fs + Math.round(vw * 0.01));
  ctx.textAlign = 'left';
}

function drawRecordingStartOverlay(ctx, vw, vh, t) {
  // Semi-transparent background
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  ctx.fillRect(0, 0, vw, vh);

  // Large "Recording Start!" text
  const fontSize = Math.round(vh * 0.12);
  ctx.fillStyle    = '#ffffff';
  ctx.font         = `bold ${fontSize}px sans-serif`;
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor  = '#4ade80';
  ctx.shadowBlur   = 20;
  ctx.fillText(t('sts.recordingStart'), vw / 2, vh / 2);
  ctx.shadowBlur   = 0;

  ctx.textAlign    = 'left';
  ctx.textBaseline = 'alphabetic';
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function usePoseLandmarker(
  videoRef, canvasRef,
  cameraReady, phase, countdown, secondsLeft,
  onReportChange, t
) {
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [showRecordingStart, setShowRecordingStart] = useState(false);

  const landmarkerRef     = useRef(null);
  const latestBodyRef     = useRef(null);
  const latestReportRef   = useRef(null);
  const prevAllValidRef   = useRef(false);
  const onReportChangeRef = useRef(onReportChange);
  const phaseRef          = useRef(phase);
  const countdownRef      = useRef(countdown);
  const secondsLeftRef    = useRef(secondsLeft);
  const tRef              = useRef(t);

  useEffect(() => { onReportChangeRef.current = onReportChange; }, [onReportChange]);
  useEffect(() => { phaseRef.current = phase; },         [phase]);
  useEffect(() => { countdownRef.current = countdown; }, [countdown]);
  useEffect(() => { secondsLeftRef.current = secondsLeft; }, [secondsLeft]);
  useEffect(() => { tRef.current = t; }, [t]);

  // Show "Recording Start!" message when recording begins
  useEffect(() => {
    if (phase === 'RECORDING' && secondsLeft === 30) {
      setShowRecordingStart(true);
      const timer = setTimeout(() => setShowRecordingStart(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [phase, secondsLeft]);

  useEffect(() => {
    let cancelled = false;
    createPoseLandmarker()
      .then((lm) => {
        if (!cancelled) {
          landmarkerRef.current = lm;
          setIsModelLoaded(true);
        }
      })
      .catch((err) => console.error('MediaPipe load failed:', err));
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!cameraReady || !isModelLoaded) return;

    let rafId;
    let lastVideoTime = -1;

    function loop() {
      const video  = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas) { rafId = requestAnimationFrame(loop); return; }

      const vw = video.videoWidth;
      const vh = video.videoHeight;
      if (!vw || !vh) { rafId = requestAnimationFrame(loop); return; }

      // Canvas = screen size (CSS pixels). The <video> element handles display.
      const cw = canvas.clientWidth  || window.innerWidth;
      const ch = canvas.clientHeight || window.innerHeight;
      if (canvas.width  !== cw) canvas.width  = cw;
      if (canvas.height !== ch) canvas.height = ch;

      const ctx = canvas.getContext('2d');
      // The video is rendered by the <video> element; just clear the overlay.
      ctx.clearRect(0, 0, cw, ch);

      // Precompute the video→canvas coordinate transform (mirrors the browser's
      // object-fit:cover display of the <video> element).
      const xform = { ...computeTransform(vw, vh, cw, ch), vh };

      // ── Inference ──────────────────────────────────────────────────────
      if (video.currentTime !== lastVideoTime) {
        lastVideoTime = video.currentTime;

        const result = landmarkerRef.current.detectForVideo(video, performance.now());

        if (result.landmarks?.length > 0) {
          // Get landmarks in video pixel space, then remap to canvas/screen space.
          let body = landmarksToStandardBody(result.landmarks[0], vw, vh);
          body     = transformBody(body, xform);
          const report = validateAll(body, cw, ch);

          latestBodyRef.current   = body;
          latestReportRef.current = report;

          if (report.allValid !== prevAllValidRef.current) {
            prevAllValidRef.current = report.allValid;
            setTimeout(() => onReportChangeRef.current(report), 0);
          }
        } else {
          latestBodyRef.current   = null;
          latestReportRef.current = null;
          if (prevAllValidRef.current !== false) {
            prevAllValidRef.current = false;
            setTimeout(() => onReportChangeRef.current(null), 0);
          }
        }
      }

      // ── Overlays ───────────────────────────────────────────────────────
      const currentPhase = phaseRef.current;
      const body         = latestBodyRef.current;
      const report       = latestReportRef.current;

      const translate = tRef.current;

      if (currentPhase === 'VALIDATING' || currentPhase === 'COUNTDOWN') {
        drawValidationBox(ctx, cw, ch, report?.bodyPlacement?.isValid ?? false, translate);
        drawSkeleton(ctx, body);
        drawValidationPanel(ctx, report, cw, translate);
        if (currentPhase === 'COUNTDOWN' && countdownRef.current != null) {
          drawCountdownOverlay(ctx, cw, ch, countdownRef.current);
        }
      } else if (currentPhase === 'RECORDING') {
        drawSkeleton(ctx, body);
        if (secondsLeftRef.current != null) {
          drawRecordingBar(ctx, cw, ch, secondsLeftRef.current);
        }
        // Show "Recording Start!" overlay for first 1.5 seconds
        if (showRecordingStart) {
          drawRecordingStartOverlay(ctx, cw, ch, translate);
        }
      }

      rafId = requestAnimationFrame(loop);
    }

    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [cameraReady, isModelLoaded, videoRef, canvasRef, showRecordingStart]);

  return { isModelLoaded };
}
