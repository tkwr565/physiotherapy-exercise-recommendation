import { useCallback, useEffect, useRef, useState } from 'react';
import { uploadVideo } from '../lib/api';

const RECORDING_DURATION_S = 30;

/**
 * Owns the full app state machine:
 *   VALIDATING → COUNTDOWN (3→2→1) → RECORDING (30s) → PREVIEW
 *   → UPLOADING → RESULTS | ERROR
 *
 * @param {React.RefObject<MediaStream>} streamRef - camera stream from useCamera
 * @returns {object} State + callbacks for App.jsx and usePoseLandmarker
 */
export function useRecordingFlow(streamRef) {
  const [phase,          setPhase]          = useState('VALIDATING');
  const [countdown,      setCountdown]      = useState(3);
  const [secondsLeft,    setSecondsLeft]    = useState(null);
  const [recordedBlob,   setRecordedBlob]   = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [errorMessage,   setErrorMessage]   = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Refs so interval callbacks always see latest values without re-creating effects
  const phaseRef             = useRef(phase);
  const countdownIntervalRef = useRef(null);
  const recordingTimerRef    = useRef(null);
  const mediaRecorderRef     = useRef(null);
  const recordedBlobRef      = useRef(null); // for retry after error

  useEffect(() => { phaseRef.current = phase; }, [phase]);

  // ── Countdown ──────────────────────────────────────────────────────────────

  const startCountdown = useCallback(() => {
    setCountdown(3);
    countdownIntervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = null;
          startRecording();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const cancelCountdown = useCallback(() => {
    clearInterval(countdownIntervalRef.current);
    countdownIntervalRef.current = null;
    setCountdown(3);
  }, []);

  // ── Recording ──────────────────────────────────────────────────────────────

  function startRecording() {
    const stream = streamRef.current;
    if (!stream) return;

    const mimeType =
      ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/mp4'].find(
        (t) => MediaRecorder.isTypeSupported(t)
      ) || '';

    const recorder = new MediaRecorder(stream, {
      mimeType,
      videoBitsPerSecond: 2_500_000,
    });

    const chunks = [];
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: mimeType || 'video/webm' });
      recordedBlobRef.current = blob;
      setRecordedBlob(blob);
      setPhase('PREVIEW');
    };

    recorder.start(100); // 100ms timeslices
    mediaRecorderRef.current = recorder;
    setPhase('RECORDING');
    setSecondsLeft(RECORDING_DURATION_S);

    let elapsed = 0;
    recordingTimerRef.current = setInterval(() => {
      elapsed += 1;
      setSecondsLeft(RECORDING_DURATION_S - elapsed);
      if (elapsed >= RECORDING_DURATION_S) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
        mediaRecorderRef.current?.stop();
      }
    }, 1000);
  }

  // ── Posture change callback (called by usePoseLandmarker) ─────────────────

  /**
   * Called when allValid changes. Drives VALIDATING ↔ COUNTDOWN transitions.
   * RECORDING phase is intentionally ignored here — posture doesn't interrupt it.
   */
  const onReportChange = useCallback((report) => {
    const currentPhase = phaseRef.current;
    if (currentPhase === 'RECORDING' || currentPhase === 'PREVIEW' ||
        currentPhase === 'UPLOADING' || currentPhase === 'RESULTS') return;

    if (!report?.allValid) {
      // Posture broken — cancel countdown, return to VALIDATING
      if (currentPhase === 'COUNTDOWN') {
        cancelCountdown();
        setPhase('VALIDATING');
      }
      return;
    }

    // Posture valid — start countdown if not already running
    if (currentPhase === 'VALIDATING') {
      setPhase('COUNTDOWN');
      startCountdown();
    }
  }, [cancelCountdown, startCountdown]);

  // ── Preview actions ────────────────────────────────────────────────────────

  const handleConfirm = useCallback(async () => {
    const blob = recordedBlobRef.current;
    if (!blob) return;
    setPhase('UPLOADING');
    setUploadProgress(0);
    try {
      const result = await uploadVideo(blob, (fraction) => {
        setUploadProgress(fraction);
      });
      setAnalysisResult(result);
      setPhase('RESULTS');
    } catch (err) {
      setErrorMessage(err.message);
      setPhase('ERROR');
    }
  }, []);

  const handleRetake = useCallback(() => {
    // Clean up any recording state and go back to VALIDATING
    clearInterval(recordingTimerRef.current);
    recordingTimerRef.current = null;
    cancelCountdown();
    setRecordedBlob(null);
    setSecondsLeft(null);
    setErrorMessage(null);
    setAnalysisResult(null);
    setUploadProgress(0);
    setPhase('VALIDATING');
  }, [cancelCountdown]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearInterval(countdownIntervalRef.current);
      clearInterval(recordingTimerRef.current);
      mediaRecorderRef.current?.stop();
    };
  }, []);

  return {
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
  };
}
