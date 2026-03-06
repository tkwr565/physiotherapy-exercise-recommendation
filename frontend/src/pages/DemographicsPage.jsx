import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { getDemographics, upsertDemographics } from '../services/api';

export default function DemographicsPage() {
  const { currentUser } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    date_of_birth: '',
    gender: '',
    height_cm: '',
    weight_kg: '',
  });
  const [bmi, setBmi] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!currentUser) return;
    getDemographics(currentUser.username)
      .then((res) => {
        if (res.data) {
          setForm({
            date_of_birth: res.data.date_of_birth || '',
            gender: res.data.gender || '',
            height_cm: res.data.height_cm || '',
            weight_kg: res.data.weight_kg || '',
          });
        }
      })
      .catch(() => {});
  }, [currentUser]);

  useEffect(() => {
    const h = parseFloat(form.height_cm);
    const w = parseFloat(form.weight_kg);
    if (h > 0 && w > 0) {
      const hm = h / 100;
      setBmi((w / (hm * hm)).toFixed(1));
    } else {
      setBmi(null);
    }
  }, [form.height_cm, form.weight_kg]);

  const getBmiCategory = (val) => {
    const v = parseFloat(val);
    if (v < 18.5) return { label: t('demographics.bmiUnderweight'), color: '#e67e22' };
    if (v < 25) return { label: t('demographics.bmiNormal'), color: '#27ae60' };
    if (v < 30) return { label: t('demographics.bmiOverweight'), color: '#e67e22' };
    return { label: t('demographics.bmiObese'), color: '#e74c3c' };
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await upsertDemographics({
        username: currentUser.username,
        date_of_birth: form.date_of_birth,
        gender: form.gender,
        height_cm: parseFloat(form.height_cm),
        weight_kg: parseFloat(form.weight_kg),
      });
      navigate('/questionnaire');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save demographics');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="card">
        <h1 className="page-title">{t('demographics.title')}</h1>
        <p className="page-subtitle">{t('demographics.subtitle')}</p>

        <form onSubmit={handleSubmit} className="form-grid">
          <div className="form-group">
            <label htmlFor="date_of_birth">{t('demographics.labelDOB')}</label>
            <input
              id="date_of_birth"
              name="date_of_birth"
              type="date"
              value={form.date_of_birth}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="gender">{t('demographics.labelGender')}</label>
            <select
              id="gender"
              name="gender"
              value={form.gender}
              onChange={handleChange}
              required
            >
              <option value="">--</option>
              <option value="male">{t('demographics.optionMale')}</option>
              <option value="female">{t('demographics.optionFemale')}</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="height_cm">{t('demographics.labelHeight')}</label>
            <input
              id="height_cm"
              name="height_cm"
              type="number"
              step="0.1"
              min="50"
              max="250"
              value={form.height_cm}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="weight_kg">{t('demographics.labelWeight')}</label>
            <input
              id="weight_kg"
              name="weight_kg"
              type="number"
              step="0.1"
              min="20"
              max="300"
              value={form.weight_kg}
              onChange={handleChange}
              required
            />
          </div>

          {bmi && (
            <div className="bmi-display">
              <strong>{t('demographics.labelBMI')}:</strong>{' '}
              <span style={{ color: getBmiCategory(bmi).color, fontWeight: 'bold' }}>
                {bmi} – {getBmiCategory(bmi).label}
              </span>
            </div>
          )}

          {error && <p className="error-message">{error}</p>}

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? t('common.loading') : t('demographics.btnContinue')}
          </button>
        </form>
      </div>
    </div>
  );
}
