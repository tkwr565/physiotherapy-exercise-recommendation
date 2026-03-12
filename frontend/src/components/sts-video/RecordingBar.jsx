import { useLanguage } from '../../context/LanguageContext';

/**
 * Recording screen with large countdown timer and progress bar.
 */
export function RecordingBar({ secondsLeft }) {
  const { t } = useLanguage();
  const total    = 30;
  const elapsed  = total - (secondsLeft ?? total);
  const progress = elapsed / total;
  const mm = String(Math.floor((secondsLeft ?? 0) / 60)).padStart(2, '0');
  const ss = String((secondsLeft ?? 0) % 60).padStart(2, '0');

  return (
    <>
      {/* Progress bar at top */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, pointerEvents: 'none' }}>
        <div style={{ height: 5, background: 'rgba(255,255,255,0.15)' }}>
          <div style={{
            height: '100%',
            width: `${progress * 100}%`,
            background: '#ef4444',
            transition: 'width 0.9s linear',
          }} />
        </div>
      </div>

      {/* Large countdown overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        pointerEvents: 'none',
      }}>
        <span
          key={secondsLeft}
          style={{
            fontSize: 'min(30vw, 30vh)',
            fontWeight: 900,
            color: '#ffffff',
            textShadow: '0 0 40px rgba(239,68,68,0.8)',
            animation: 'countdownPop 1s ease-out forwards',
            lineHeight: 1,
          }}
        >
          {secondsLeft}
        </span>
        <span style={{
          marginTop: 12,
          fontSize: '4vw',
          color: 'rgba(255,255,255,0.75)',
          fontWeight: 600,
          letterSpacing: 2,
          animation: 'countdownPop 1s ease-out forwards',
        }}>
          {t('sts.recording')}
        </span>

        {/* REC indicator in corner */}
        <div style={{
          position: 'absolute', top: 12, right: 14,
          display: 'flex', alignItems: 'center', gap: 6,
          color: '#ef4444', fontWeight: 700, fontSize: 14,
        }}>
          <span style={{ animation: 'recPulse 1s ease-in-out infinite' }}>●</span>
          <span>{t('sts.rec')} {mm}:{ss}</span>
        </div>
      </div>
    </>
  );
}
