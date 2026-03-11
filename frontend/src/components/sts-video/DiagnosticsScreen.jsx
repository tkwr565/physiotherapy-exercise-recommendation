/**
 * Diagnostics screen to help debug camera/browser issues
 */
export function DiagnosticsScreen() {
  const diagnostics = {
    'User Agent': navigator.userAgent,
    'Protocol': window.location.protocol,
    'Hostname': window.location.hostname,
    'Port': window.location.port,
    'Full URL': window.location.href,
    'navigator exists': typeof navigator !== 'undefined' ? 'Yes' : 'No',
    'navigator.mediaDevices exists': typeof navigator?.mediaDevices !== 'undefined' ? 'Yes' : 'No',
    'getUserMedia exists': typeof navigator?.mediaDevices?.getUserMedia !== 'undefined' ? 'Yes' : 'No',
    'HTTPS or localhost': (window.location.protocol === 'https:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'Yes' : 'No',
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: '#0f172a',
      color: '#fff',
      padding: '40px',
      overflowY: 'auto',
      fontFamily: 'monospace',
    }}>
      <h1 style={{ color: '#f87171', marginBottom: '24px' }}>Camera Diagnostics</h1>

      <div style={{
        background: '#1e293b',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '24px',
      }}>
        <h2 style={{ marginTop: 0 }}>Environment Information</h2>
        {Object.entries(diagnostics).map(([key, value]) => (
          <div key={key} style={{
            display: 'flex',
            gap: '12px',
            padding: '8px 0',
            borderBottom: '1px solid #334155',
          }}>
            <strong style={{ minWidth: '200px', color: '#94a3b8' }}>{key}:</strong>
            <span style={{
              color: value?.includes('No') ? '#f87171' : '#4ade80',
              wordBreak: 'break-all',
            }}>
              {String(value)}
            </span>
          </div>
        ))}
      </div>

      <div style={{
        background: '#1e293b',
        padding: '20px',
        borderRadius: '8px',
      }}>
        <h2 style={{ marginTop: 0 }}>Troubleshooting Steps</h2>
        <ol style={{ lineHeight: '1.8' }}>
          <li>Ensure you're accessing via <code style={{ background: '#334155', padding: '2px 6px', borderRadius: '4px' }}>http://localhost:3000</code> or <code style={{ background: '#334155', padding: '2px 6px', borderRadius: '4px' }}>https://</code></li>
          <li>If using Chrome/Edge, camera requires HTTPS or localhost</li>
          <li>Try Firefox which has more lenient camera access policies</li>
          <li>Check browser console (F12) for additional error messages</li>
          <li>Ensure no other application is using the camera</li>
        </ol>
      </div>
    </div>
  );
}
