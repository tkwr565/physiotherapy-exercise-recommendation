import { useLanguage } from '../../context/LanguageContext';

/**
 * Full-screen countdown overlay (3 → 2 → 1).
 * key={countdown} on the animated span causes the CSS animation to replay
 * each time the number changes.
 */
export function CountdownOverlay({ countdown }) {
  const { t } = useLanguage();

  return (
    <div style={{
      position: 'absolute', inset: 0,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      pointerEvents: 'none',
    }}>
      <span
        key={countdown}
        style={{
          fontSize: 'min(30vw, 30vh)',
          fontWeight: 900,
          color: '#ffffff',
          textShadow: '0 0 40px rgba(74,222,128,0.8)',
          animation: 'countdownPop 1s ease-out forwards',
          lineHeight: 1,
        }}
      >
        {countdown}
      </span>
      <span style={{
        marginTop: 12,
        fontSize: '4vw',
        color: 'rgba(255,255,255,0.75)',
        fontWeight: 600,
        letterSpacing: 2,
        animation: 'countdownPop 1s ease-out forwards',
      }}>
        {t('sts.holdPosition')}
      </span>
    </div>
  );
}
