import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { getSTSAssessment, upsertSTSAssessment } from '../services/api';

export default function STSAssessmentPage() {
  const { currentUser } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    repetitions: '',
    knee_alignment: 'normal',
    trunk_sway: false,
    hip_sway: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!currentUser) return;
    getSTSAssessment(currentUser.username)
      .then((res) => {
        if (res.data) {
          setForm({
            repetitions: res.data.repetitions ?? '',
            knee_alignment: res.data.knee_alignment || 'normal',
            trunk_sway: !!res.data.trunk_sway,
            hip_sway: !!res.data.hip_sway,
          });
        }
      })
      .catch(() => {});
  }, [currentUser]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await upsertSTSAssessment({
        username: currentUser.username,
        repetitions: parseInt(form.repetitions, 10),
        knee_alignment: form.knee_alignment,
        trunk_sway: form.trunk_sway,
        hip_sway: form.hip_sway,
      });
      navigate('/results');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save STS assessment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="card">
        <h1 className="page-title">{t('sts.title')}</h1>
        <p className="page-subtitle">{t('sts.subtitle')}</p>

        <div className="info-box">
          <p>{t('sts.instructions')}</p>
        </div>

        <form onSubmit={handleSubmit} className="form-grid">
          <div className="form-group">
            <label htmlFor="repetitions">{t('sts.repetitionLabel')}</label>
            <input
              id="repetitions"
              name="repetitions"
              type="number"
              min="0"
              max="100"
              value={form.repetitions}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="knee_alignment">{t('sts.kneeAlignmentLabel')}</label>
            <select
              id="knee_alignment"
              name="knee_alignment"
              value={form.knee_alignment}
              onChange={handleChange}
              required
            >
              <option value="normal">{t('sts.kneeNormal')}</option>
              <option value="valgus">{t('sts.kneeValgus')}</option>
              <option value="varus">{t('sts.kneeVarus')}</option>
            </select>
          </div>

          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="trunk_sway"
                checked={form.trunk_sway}
                onChange={handleChange}
              />
              <span>
                {t('sts.trunkSwayLabel')}: {form.trunk_sway ? t('sts.present') : t('sts.absent')}
              </span>
            </label>
          </div>

          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="hip_sway"
                checked={form.hip_sway}
                onChange={handleChange}
              />
              <span>
                {t('sts.hipSwayLabel')}: {form.hip_sway ? t('sts.present') : t('sts.absent')}
              </span>
            </label>
          </div>

          {error && <p className="error-message">{error}</p>}

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/questionnaire')}
            >
              {t('sts.backButton')}
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? t('common.loading') : t('sts.submitButton')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
