/**
 * Displays analysis results returned from the FastAPI backend.
 */
export function ResultsScreen({ result, onNewRecording }) {
  const agg = result?.results?.aggregate_metrics;

  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: '#0f172a',
      overflowY: 'auto',
      padding: '24px 20px',
      paddingBottom: 'max(24px, env(safe-area-inset-bottom))',
    }}>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: '#4ade80', marginBottom: 4 }}>
        Analysis Complete
      </h2>
      <p style={{ fontSize: 13, color: '#64748b', marginBottom: 24 }}>
        Sit-to-Stand Assessment Results
      </p>

      {agg ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
          <MetricCard label="Total Reps"    value={agg.total_reps}      unit="" />
          <MetricCard label="Valid Reps"    value={agg.valid_reps}      unit="" />
          <MetricCard label="Mean FPPA"     value={agg.mean_fppa?.toFixed(1)}   unit="°" />
          <MetricCard label="Trunk Sway SD" value={agg.mean_trunk_sway_sd?.toFixed(1)} unit="°" />
        </div>
      ) : (
        <p style={{ color: '#94a3b8', marginBottom: 24 }}>
          No aggregate metrics returned from server.
        </p>
      )}

      {result?.download_urls && (
        <div style={{ marginBottom: 24 }}>
          <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 8 }}>Downloads</p>
          {result.download_urls.video && (
            <a href={result.download_urls.video} download
              style={{ display: 'block', color: '#60a5fa', fontSize: 14, marginBottom: 6 }}>
              Annotated Video
            </a>
          )}
          {result.download_urls.graph && (
            <a href={result.download_urls.graph} download
              style={{ display: 'block', color: '#60a5fa', fontSize: 14 }}>
              Analysis Graph
            </a>
          )}
        </div>
      )}

      <button
        onClick={onNewRecording}
        style={{
          width: '100%', padding: '16px 0',
          background: '#1e293b', color: '#f1f5f9',
          fontSize: 16, fontWeight: 700, borderRadius: 12,
          border: '1px solid #334155', minHeight: 56,
        }}
      >
        New Recording
      </button>
    </div>
  );
}

function MetricCard({ label, value, unit }) {
  return (
    <div style={{
      background: '#1e293b', borderRadius: 12,
      padding: '16px 20px',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    }}>
      <span style={{ fontSize: 14, color: '#94a3b8' }}>{label}</span>
      <span style={{ fontSize: 22, fontWeight: 800, color: '#f1f5f9' }}>
        {value ?? '—'}{unit}
      </span>
    </div>
  );
}
