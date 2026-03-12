import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { getSTSAssessment, upsertSTSAssessment } from '../services/api';
import { VideoSTSAssessment } from '../components/sts-video/VideoSTSAssessment';

export default function STSAssessmentPage() {
  const { currentUser } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [assessmentMode, setAssessmentMode] = useState(null); // null | 'manual' | 'video'
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
    getSTSAssessment(currentUser)
      .then((res) => {
        if (res.data) {
          setForm({
            repetitions: res.data.repetition_count ?? '',
            knee_alignment: res.data.knee_alignment || 'normal',
            trunk_sway: res.data.trunk_sway === 'present',
            hip_sway: res.data.hip_sway === 'present',
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
        username: currentUser,
        repetition_count: parseInt(form.repetitions, 10),
        knee_alignment: form.knee_alignment,
        trunk_sway: form.trunk_sway ? 'present' : 'absent',
        hip_sway: form.hip_sway ? 'present' : 'absent',
      });
      navigate('/results');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save STS assessment');
    } finally {
      setLoading(false);
    }
  };

  // Handle video analysis results
  const handleVideoComplete = async (analysisResult) => {
    setLoading(true);
    setError('');

    try {
      const agg = analysisResult?.aggregate_metrics;

      if (!agg) {
        throw new Error('Invalid analysis results');
      }

      // Map video analysis results to STS assessment format
      // FPPA: negative = valgus (knock-knee), mean_fppa < -12 indicates significant valgus
      const hasValgus = agg.mean_fppa < -12;
      const kneeAlignment = hasValgus ? 'valgus' : 'normal';

      // Trunk/hip sway: SD > 2.5° indicates instability
      const hasTrunkSway = agg.mean_trunk_sway_sd > 2.5;
      const hasHipSway = agg.mean_hip_sway_sd > 2.5;

      await upsertSTSAssessment({
        username: currentUser,
        repetition_count: agg.valid_reps || agg.total_reps,
        knee_alignment: kneeAlignment,
        trunk_sway: hasTrunkSway ? 'present' : 'absent',
        hip_sway: hasHipSway ? 'present' : 'absent',
      });

      navigate('/results');
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to save video assessment');
      setAssessmentMode(null); // Return to mode selection on error
    } finally {
      setLoading(false);
    }
  };

  // Mode selection screen
  if (assessmentMode === null) {
    return (
      <div className="page-container">
        <div className="card">
          <h1 className="page-title">{t('sts.title')}</h1>
          <p className="page-subtitle">{t('sts.subtitle')}</p>

          <div className="info-box">
            <p>{t('sts.modeSelectionPrompt')}</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '2rem' }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setAssessmentMode('video')}
              style={{ padding: '1.5rem', fontSize: '1.1rem' }}
            >
              📹 {t('sts.videoModeButton')}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setAssessmentMode('manual')}
              style={{ padding: '1.5rem', fontSize: '1.1rem' }}
            >
              ✏️ {t('sts.manualModeButton')}
            </button>
          </div>

          <div className="form-actions" style={{ marginTop: '2rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/questionnaire')}
            >
              {t('sts.backButton')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Video mode - Complete video recording and analysis workflow
  if (assessmentMode === 'video') {
    return (
      <VideoSTSAssessment
        onBack={() => setAssessmentMode(null)}
        onComplete={handleVideoComplete}
      />
    );
  }

  // Manual mode (existing form)
  return (
    <div className="page-container">
      <div className="card">
        <h1 className="page-title">{t('sts.title')} - {t('sts.manualMode')}</h1>
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
              onClick={() => setAssessmentMode(null)}
            >
              {t('common.back')}
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
