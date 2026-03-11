const btnBase = {
  width: '100%', padding: '16px 0',
  fontSize: 16, fontWeight: 700,
  borderRadius: 12, minHeight: 56,
};

/**
 * Shown when upload fails. Offers retry (same blob) or retake (new recording).
 */
export function ErrorScreen({ message, onRetry, onRetake }) {
  return (
    <div style={{
      position: 'absolute', inset: 0,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: '#0f172a', gap: 16, padding: 32,
    }}>
      <div style={{ fontSize: 48 }}>⚠️</div>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: '#f87171', textAlign: 'center' }}>
        Upload Failed
      </h2>
      <p style={{ fontSize: 14, color: '#94a3b8', textAlign: 'center' }}>
        {message}
      </p>

      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
        <button
          onClick={onRetry}
          style={{ ...btnBase, background: '#16a34a', color: '#fff', border: 'none' }}
        >
          Retry Upload
        </button>
        <button
          onClick={onRetake}
          style={{ ...btnBase, background: 'transparent', color: '#94a3b8', border: '2px solid #475569' }}
        >
          Retake Video
        </button>
      </div>
    </div>
  );
}
