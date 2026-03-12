import { useLanguage } from '../../context/LanguageContext';

const btnBase = {
  width: '100%', padding: '16px 0',
  fontSize: 16, fontWeight: 700,
  borderRadius: 12, minHeight: 56,
};

/**
 * Shown when upload fails. Offers retry (same blob) or retake (new recording).
 */
export function ErrorScreen({ errorMessage, onRetry, onRetake }) {
  const { t } = useLanguage();

  return (
    <div style={{
      position: 'absolute', inset: 0,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: '#0f172a', gap: 16, padding: 32,
    }}>
      <div style={{ fontSize: 48 }}>⚠️</div>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: '#f87171', textAlign: 'center' }}>
        {t('sts.uploadFailed')}
      </h2>
      <p style={{ fontSize: 14, color: '#94a3b8', textAlign: 'center' }}>
        {errorMessage}
      </p>

      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
        <button
          onClick={onRetry}
          style={{ ...btnBase, background: '#16a34a', color: '#fff', border: 'none' }}
        >
          {t('sts.retryUpload')}
        </button>
        <button
          onClick={onRetake}
          style={{ ...btnBase, background: 'transparent', color: '#94a3b8', border: '2px solid #475569' }}
        >
          {t('sts.retakeVideo')}
        </button>
      </div>
    </div>
  );
}
