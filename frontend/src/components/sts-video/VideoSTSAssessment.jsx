import { useEffect, useRef } from 'react';
import { useCamera }         from '../../hooks/useCamera';
import { usePoseLandmarker } from '../../hooks/usePoseLandmarker';

import { CameraView }       from './CameraView';
import { LoadingScreen }    from './LoadingScreen';

/**
 * VideoSTSAssessment - Real-time posture validation for STS test setup
 *
 * This component provides real-time guidance to help users position themselves
 * correctly before performing the STS assessment. It validates:
 * - Stance width (feet shoulder-width apart)
 * - Foot rotation (feet pointing forward)
 * - Body placement (entire body visible in frame)
 *
 * Future: Will integrate video recording and backend analysis
 *
 * @param {function} onBack - Callback to return to mode selection
 */
export function VideoSTSAssessment({ onBack }) {
  const canvasRef = useRef(null);

  const { videoRef, streamRef, isReady, error: cameraError } = useCamera();

  const { isModelLoaded } = usePoseLandmarker(
    videoRef, canvasRef,
    isReady,
    'VALIDATING',  // phase - currently always in validation mode
    null,          // countdown
    null,          // secondsLeft
    () => {}       // onReportChange - placeholder for now
  );

  // Add CSS animation for spinner
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const showLoading = !isModelLoaded || !isReady;

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#000' }}>
      {/* Camera + canvas always mounted so stream starts immediately */}
      <CameraView videoRef={videoRef} canvasRef={canvasRef} />

      {showLoading && (
        <LoadingScreen cameraError={cameraError} isModelLoaded={isModelLoaded} />
      )}

      {/* Back button overlay */}
      {!showLoading && (
        <button
          onClick={onBack}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            padding: '12px 20px',
            fontSize: '16px',
            fontWeight: '600',
            color: '#fff',
            background: 'rgba(15, 23, 42, 0.8)',
            border: '2px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '8px',
            cursor: 'pointer',
            zIndex: 1000,
            backdropFilter: 'blur(8px)',
          }}
        >
          ← Back
        </button>
      )}

      {/* Future: Add UI for starting recording, countdown, etc. */}
    </div>
  );
}
