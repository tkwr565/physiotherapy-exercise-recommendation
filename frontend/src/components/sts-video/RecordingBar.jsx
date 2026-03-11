/**
 * Recording progress bar shown at the top of the screen during RECORDING phase.
 */
export function RecordingBar({ secondsLeft }) {
  const total    = 30;
  const elapsed  = total - (secondsLeft ?? total);
  const progress = elapsed / total;
  const mm = String(Math.floor((secondsLeft ?? 0) / 60)).padStart(2, '0');
  const ss = String((secondsLeft ?? 0) % 60).padStart(2, '0');

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, pointerEvents: 'none' }}>
      {/* Progress bar track */}
      <div style={{ height: 5, background: 'rgba(255,255,255,0.15)' }}>
        <div style={{
          height: '100%',
          width: `${progress * 100}%`,
          background: '#ef4444',
          transition: 'width 0.9s linear',
        }} />
      </div>

      {/* REC indicator */}
      <div style={{
        position: 'absolute', top: 12, right: 14,
        display: 'flex', alignItems: 'center', gap: 6,
        color: '#ef4444', fontWeight: 700, fontSize: 14,
      }}>
        <span style={{ animation: 'recPulse 1s ease-in-out infinite' }}>●</span>
        <span>REC {mm}:{ss}</span>
      </div>
    </div>
  );
}
