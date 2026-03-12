import { useLanguage } from '../../context/LanguageContext';

/**
 * Shown while MediaPipe model is loading or camera is starting.
 */
export function LoadingScreen({ cameraError, isModelLoaded, onShowDiagnostics }) {
  const { t } = useLanguage();

  return (
    <div style={{
      position: 'absolute', inset: 0,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: '#0f172a', gap: 16, padding: 24,
    }}>
      {cameraError ? (
        <>
          <div style={{ fontSize: 48 }}>📷</div>
          <p style={{ color: '#f87171', textAlign: 'center', fontSize: 16, maxWidth: '500px' }}>
            {cameraError}
          </p>
          <p style={{ color: '#94a3b8', textAlign: 'center', fontSize: 14, maxWidth: '400px' }}>
            {t('sts.cameraErrorFixes')}
          </p>
          <ul style={{ color: '#94a3b8', fontSize: 14, textAlign: 'left', maxWidth: '400px' }}>
            <li>{t('sts.cameraErrorLocalhost')} <code style={{ background: '#1e293b', padding: '2px 6px', borderRadius: '4px' }}>http://localhost:3000</code></li>
            <li>{t('sts.cameraErrorBrowser')}</li>
            <li>{t('sts.cameraErrorOtherApp')}</li>
            <li>{t('sts.cameraErrorPermissions')}</li>
          </ul>
          {onShowDiagnostics && (
            <button
              onClick={onShowDiagnostics}
              style={{
                marginTop: '16px',
                padding: '10px 20px',
                background: '#1e293b',
                color: '#94a3b8',
                border: '1px solid #334155',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              {t('sts.showDiagnostics')}
            </button>
          )}
        </>
      ) : (
        <>
          <Spinner />
          <p style={{ color: '#94a3b8', fontSize: 15 }}>
            {!isModelLoaded ? t('sts.loadingModel') : t('sts.startingCamera')}
          </p>
        </>
      )}
    </div>
  );
}

function Spinner() {
  return (
    <div style={{
      width: 48, height: 48,
      border: '4px solid rgba(255,255,255,0.1)',
      borderTopColor: '#4ade80',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite',
    }} />
  );
}
