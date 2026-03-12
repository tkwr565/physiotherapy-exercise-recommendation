import { useEffect, useRef } from 'react';
import { useCamera }         from '../../hooks/useCamera';
import { usePoseLandmarker } from '../../hooks/usePoseLandmarker';
import { useRecordingFlow }  from '../../hooks/useRecordingFlow';
import { uploadVideo }       from '../../services/api';
import { useLanguage }       from '../../context/LanguageContext';

import { CameraView }       from './CameraView';
import { LoadingScreen }    from './LoadingScreen';
import { CountdownOverlay } from './CountdownOverlay';
import { RecordingBar }     from './RecordingBar';
import { PreviewModal }     from './PreviewModal';
import { UploadingScreen }  from './UploadingScreen';
import { ResultsScreen }    from './ResultsScreen';
import { ErrorScreen }      from './ErrorScreen';

/**
 * VideoSTSAssessment - Complete video-based STS assessment with recording and analysis
 *
 * State Flow: VALIDATING → COUNTDOWN → RECORDING → PREVIEW → UPLOADING → RESULTS/ERROR
 *
 * @param {function} onBack - Callback to return to mode selection
 * @param {function} onComplete - Callback with analysis results for saving to database
 */
export function VideoSTSAssessment({ onBack, onComplete }) {
  const { t } = useLanguage();
  const canvasRef = useRef(null);

  // Camera setup
  const { videoRef, streamRef, isReady, error: cameraError } = useCamera();

  // Recording flow state machine
  const {
    phase,
    countdown,
    secondsLeft,
    recordedBlob,
    analysisResult,
    errorMessage,
    uploadProgress,
    onReportChange,
    handleConfirm,
    handleRetake,
  } = useRecordingFlow(streamRef, uploadVideo);

  // Pose detection and validation
  const { isModelLoaded } = usePoseLandmarker(
    videoRef, canvasRef,
    isReady,
    phase,
    countdown,
    secondsLeft,
    onReportChange,
    t
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

      {/* Loading screen */}
      {showLoading && (
        <LoadingScreen cameraError={cameraError} isModelLoaded={isModelLoaded} />
      )}

      {/* Countdown overlay (3, 2, 1) */}
      {phase === 'COUNTDOWN' && <CountdownOverlay countdown={countdown} />}

      {/* Recording progress bar */}
      {phase === 'RECORDING' && <RecordingBar secondsLeft={secondsLeft} />}

      {/* Preview modal */}
      {phase === 'PREVIEW' && (
        <PreviewModal
          videoBlob={recordedBlob}
          onConfirm={handleConfirm}
          onRetake={handleRetake}
        />
      )}

      {/* Uploading screen */}
      {phase === 'UPLOADING' && <UploadingScreen progress={uploadProgress} />}

      {/* Results screen */}
      {phase === 'RESULTS' && (
        <ResultsScreen
          results={analysisResult}
          onNewRecording={handleRetake}
          onSaveAndExit={() => onComplete && onComplete(analysisResult)}
        />
      )}

      {/* Error screen */}
      {phase === 'ERROR' && (
        <ErrorScreen
          errorMessage={errorMessage}
          onRetry={handleConfirm}
          onRetake={handleRetake}
        />
      )}

      {/* Back button (only show during VALIDATING phase) */}
      {!showLoading && phase === 'VALIDATING' && (
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
    </div>
  );
}
