import { useEffect, useMemo } from 'react';
import { useLanguage } from '../../context/LanguageContext';

const btnBase = {
  flex: 1,
  padding: '16px 0',
  fontSize: 16,
  fontWeight: 700,
  borderRadius: 12,
  minHeight: 56,   // WCAG 2.5.5 touch target
};

/**
 * Full-screen modal showing the recorded clip for user review.
 * onConfirm → upload; onRetake → back to VALIDATING.
 */
export function PreviewModal({ videoBlob, onConfirm, onRetake }) {
  const { t } = useLanguage();
  const url = useMemo(() => URL.createObjectURL(videoBlob), [videoBlob]);

  // Revoke the object URL when the component unmounts to free memory
  useEffect(() => {
    return () => URL.revokeObjectURL(url);
  }, [url]);

  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: '#0f172a',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{ padding: '16px 20px 8px', flexShrink: 0 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9' }}>
          {t('sts.reviewRecording')}
        </h2>
        <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>
          {t('sts.reviewInstructions')}
        </p>
      </div>

      {/* Video player */}
      <video
        src={url}
        controls
        autoPlay
        loop
        playsInline
        style={{
          flex: 1,
          width: '100%',
          background: '#000',
          objectFit: 'contain',
          minHeight: 0,
        }}
      />

      {/* Action buttons */}
      <div style={{
        display: 'flex', gap: 12,
        padding: '16px 20px',
        paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
        flexShrink: 0,
      }}>
        <button
          onClick={onRetake}
          style={{
            ...btnBase,
            background: 'transparent',
            border: '2px solid #475569',
            color: '#94a3b8',
          }}
        >
          {t('sts.retake')}
        </button>
        <button
          onClick={onConfirm}
          style={{
            ...btnBase,
            background: '#16a34a',
            color: '#ffffff',
            border: 'none',
          }}
        >
          {t('sts.sendForAnalysis')}
        </button>
      </div>
    </div>
  );
}
