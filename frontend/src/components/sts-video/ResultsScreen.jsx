import { useLanguage } from '../../context/LanguageContext';

/**
 * Displays analysis results returned from the FastAPI backend.
 */
export function ResultsScreen({ results, onNewRecording, onSaveAndExit }) {
  const { t } = useLanguage();
  const agg = results?.aggregate_metrics;

  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: '#0f172a',
      overflowY: 'auto',
      padding: '24px 20px',
      paddingBottom: 'max(24px, env(safe-area-inset-bottom))',
    }}>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: '#4ade80', marginBottom: 4 }}>
        {t('sts.analysisComplete')}
      </h2>
      <p style={{ fontSize: 13, color: '#64748b', marginBottom: 24 }}>
        {t('sts.stsAssessmentResults')}
      </p>

      {agg ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
          <MetricCard label={t('sts.totalReps')}    value={agg.total_reps}      unit="" />
          <MetricCard label={t('sts.validReps')}    value={agg.valid_reps}      unit="" />
          <MetricCard label={t('sts.meanFPPA')}     value={agg.mean_fppa?.toFixed(1)}   unit="°" />
          <MetricCard label={t('sts.trunkSwaySD')} value={agg.mean_trunk_sway_sd?.toFixed(1)} unit="°" />
        </div>
      ) : (
        <p style={{ color: '#94a3b8', marginBottom: 24 }}>
          {t('sts.noMetrics')}
        </p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <button
          onClick={onSaveAndExit}
          style={{
            width: '100%', padding: '16px 0',
            background: '#4ade80', color: '#0f172a',
            fontSize: 16, fontWeight: 700, borderRadius: 12,
            border: 'none', minHeight: 56,
            cursor: 'pointer',
          }}
        >
          {t('sts.saveAndContinue')}
        </button>

        <button
          onClick={onNewRecording}
          style={{
            width: '100%', padding: '16px 0',
            background: '#1e293b', color: '#f1f5f9',
            fontSize: 16, fontWeight: 700, borderRadius: 12,
            border: '1px solid #334155', minHeight: 56,
            cursor: 'pointer',
          }}
        >
          {t('sts.newRecording')}
        </button>
      </div>
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
