import { useEffect, useRef, useState } from 'react';

/**
 * Manages getUserMedia camera stream and attaches it to a <video> element.
 *
 * @returns {{
 *   videoRef:  React.RefObject<HTMLVideoElement>,
 *   streamRef: React.RefObject<MediaStream>,
 *   isReady:   boolean,   // true once video has enough data to play
 *   error:     string|null
 * }}
 */
export function useCamera() {
  const videoRef  = useRef(null);
  const streamRef = useRef(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError]     = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function startCamera() {
      try {
        // Check if MediaDevices API is available
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          setError('Camera API not available. Please use HTTPS or localhost, and ensure your browser supports camera access.');
          return;
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',   // selfie/front camera
            // No aspect-ratio constraint — let the browser return the camera's
            // natural landscape stream (e.g. 1280×720).  The <video> element
            // and coordinate transform handle orientation automatically.
          },
          audio: false,
        });

        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current   = stream;
        const video         = videoRef.current;
        video.srcObject     = stream;
        video.onloadeddata  = () => { if (!cancelled) setIsReady(true); };
        await video.play();
      } catch (err) {
        if (cancelled) return;
        if (err.name === 'NotAllowedError') {
          setError('Camera access denied. Please allow camera access in your browser settings.');
        } else if (err.name === 'NotFoundError') {
          setError('No camera found on this device.');
        } else {
          setError(`Camera error: ${err.message}`);
        }
      }
    }

    startCamera();

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, []);

  return { videoRef, streamRef, isReady, error };
}
