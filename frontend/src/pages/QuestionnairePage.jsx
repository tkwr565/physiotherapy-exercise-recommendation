import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { getQuestionnaire, upsertQuestionnaire } from '../services/api';
import {
  questionTranslations,
  questionSections,
  allQuestionCodes,
} from '../i18n/translations';

export default function QuestionnairePage() {
  const { currentUser } = useAuth();
  const { t, lang } = useLanguage();
  const navigate = useNavigate();

  const [answers, setAnswers] = useState({});
  const [toeTouch, setToeTouch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const qTrans = questionTranslations[lang] || questionTranslations.en;

  // Load existing data
  useEffect(() => {
    if (!currentUser) return;
    getQuestionnaire(currentUser.username)
      .then((res) => {
        if (res.data) {
          const loaded = {};
          for (const code of allQuestionCodes) {
            const key = code.toLowerCase();
            if (res.data[key] !== null && res.data[key] !== undefined) {
              loaded[code] = res.data[key];
            }
          }
          setAnswers(loaded);
          if (res.data.toe_touch_test !== null && res.data.toe_touch_test !== undefined) {
            setToeTouch(res.data.toe_touch_test ? 'able' : 'unable');
          }
        }
      })
      .catch(() => {});
  }, [currentUser]);

  const answeredCount = useMemo(
    () => Object.keys(answers).length + (toeTouch ? 1 : 0),
    [answers, toeTouch]
  );
  const totalCount = allQuestionCodes.length + 1; // +1 for toe touch

  const handleAnswer = (code, value) => {
    setAnswers((prev) => ({ ...prev, [code]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Build the payload with lowercase keys
    const payload = { username: currentUser.username };
    for (const code of allQuestionCodes) {
      payload[code.toLowerCase()] = answers[code] !== undefined ? answers[code] : null;
    }
    payload.toe_touch_test = toeTouch === 'able';

    try {
      await upsertQuestionnaire(payload);
      navigate('/sts-assessment');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save questionnaire');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="card questionnaire-card">
        <h1 className="page-title">{t('questionnaire.title')}</h1>
        <p className="page-subtitle">{t('questionnaire.subtitle')}</p>

        {/* Progress bar */}
        <div className="progress-container">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${(answeredCount / totalCount) * 100}%` }}
            />
          </div>
          <span className="progress-text">
            {answeredCount}/{totalCount} {t('questionnaire.progressText')}
          </span>
        </div>

        <form onSubmit={handleSubmit}>
          {questionSections.map((section) => (
            <div key={section.id} className="question-section">
              <h3 className="section-title">
                {lang === 'zh-TW' ? section.titleKeyZh : section.titleKey}
              </h3>
              {section.codes.map((code) => {
                const q = qTrans[code];
                if (!q) return null;
                return (
                  <div key={code} className="question-item">
                    <p className="question-text">
                      <strong>{code}.</strong> {q.text}
                    </p>
                    <div className="option-group">
                      {q.options.map((opt, idx) => (
                        <label
                          key={idx}
                          className={`option-label ${answers[code] === idx ? 'selected' : ''}`}
                        >
                          <input
                            type="radio"
                            name={code}
                            value={idx}
                            checked={answers[code] === idx}
                            onChange={() => handleAnswer(code, idx)}
                          />
                          {opt}
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}

          {/* Toe touch test */}
          <div className="question-section">
            <h3 className="section-title">
              {lang === 'zh-TW' ? '柔韌性測試' : 'Flexibility Test'}
            </h3>
            <div className="question-item">
              <p className="question-text">{t('questionnaire.toeTouch')}</p>
              <div className="option-group">
                <label className={`option-label ${toeTouch === 'able' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="toeTouch"
                    value="able"
                    checked={toeTouch === 'able'}
                    onChange={() => setToeTouch('able')}
                  />
                  {t('questionnaire.toeTouchAble')}
                </label>
                <label className={`option-label ${toeTouch === 'unable' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="toeTouch"
                    value="unable"
                    checked={toeTouch === 'unable'}
                    onChange={() => setToeTouch('unable')}
                  />
                  {t('questionnaire.toeTouchUnable')}
                </label>
              </div>
            </div>
          </div>

          {error && <p className="error-message">{error}</p>}

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/demographics')}
            >
              {t('common.back')}
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? t('common.loading') : t('questionnaire.submitButton')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
