import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { verifyPasscode, createOrLoginUser, getUserProgress } from '../services/api';

export default function HomePage() {
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [step, setStep] = useState('passcode'); // 'passcode' | 'username'
  const [passcode, setPasscode] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePasscode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await verifyPasscode(passcode);
      if (res.data.valid) {
        setStep('username');
      } else {
        setError(t('home.passcodeError'));
      }
    } catch {
      setError(t('home.passcodeError'));
    } finally {
      setLoading(false);
    }
  };

  const handleUsername = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const userRes = await createOrLoginUser(username);
      login(userRes.data);

      // Check progress to redirect to the right step
      try {
        const progress = await getUserProgress(username);
        const p = progress.data;
        if (p.has_questionnaire && p.has_sts) {
          navigate('/results');
        } else if (p.has_questionnaire) {
          navigate('/sts-assessment');
        } else if (p.has_demographics) {
          navigate('/questionnaire');
        } else {
          navigate('/demographics');
        }
      } catch {
        navigate('/demographics');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container home-page">
      <div className="card auth-card">
        <h1 className="page-title">{t('home.title')}</h1>
        <p className="page-subtitle">{t('home.subtitle')}</p>

        {step === 'passcode' && (
          <form onSubmit={handlePasscode} className="auth-form">
            <h2>{t('home.passcodeTitle')}</h2>
            <p className="form-hint">{t('home.passcodeSubtitle')}</p>
            <div className="form-group">
              <label htmlFor="passcode">{t('home.passcodeLabel')}</label>
              <input
                id="passcode"
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder={t('home.passcodePlaceholder')}
                required
              />
            </div>
            {error && <p className="error-message">{error}</p>}
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? t('common.loading') : t('home.passcodeButton')}
            </button>
          </form>
        )}

        {step === 'username' && (
          <form onSubmit={handleUsername} className="auth-form">
            <h2>{t('home.usernameTitle')}</h2>
            <p className="form-hint">{t('home.usernameSubtitle')}</p>
            <div className="form-group">
              <label htmlFor="username">{t('home.usernameLabel')}</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={t('home.usernamePlaceholder')}
                pattern="[a-zA-Z0-9]{3,50}"
                title={t('home.usernameHint')}
                required
              />
              <small className="form-hint">{t('home.usernameHint')}</small>
            </div>
            {error && <p className="error-message">{error}</p>}
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? t('common.loading') : t('home.usernameButton')}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
