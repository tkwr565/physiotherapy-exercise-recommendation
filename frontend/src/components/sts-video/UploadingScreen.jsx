/**
 * Shown during UPLOADING phase.
 * progress: 0.0–1.0 (upload phase), then indeterminate spinner for server analysis.
 */
export function UploadingScreen({ progress }) {
  const isUploading  = progress < 1;
  const pct          = Math.round(progress * 100);

  return (
    <div style={{
      position: 'absolute', inset: 0,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: '#0f172a', gap: 20, padding: 32,
    }}>
      <Spinner />

      <p style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9', textAlign: 'center' }}>
        {isUploading ? `Uploading… ${pct}%` : 'Analysing your movement…'}
      </p>
      <p style={{ fontSize: 13, color: '#64748b', textAlign: 'center' }}>
        {isUploading
          ? 'Please keep this screen open.'
          : 'This may take a minute. Please wait.'}
      </p>

      {isUploading && (
        <div style={{ width: '80%', height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 3 }}>
          <div style={{
            height: '100%',
            width: `${pct}%`,
            background: '#4ade80',
            borderRadius: 3,
            transition: 'width 0.3s ease',
          }} />
        </div>
      )}
    </div>
  );
}

function Spinner() {
  return (
    <div style={{
      width: 56, height: 56,
      border: '4px solid rgba(255,255,255,0.1)',
      borderTopColor: '#4ade80',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite',
    }} />
  );
}
