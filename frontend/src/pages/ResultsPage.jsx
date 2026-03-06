import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { getAlgorithmRecommendations, getLLMRecommendations } from '../services/api';

export default function ResultsPage() {
  const { currentUser } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [results, setResults] = useState(null);
  const [llmResults, setLlmResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [llmLoading, setLlmLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!currentUser) return;
    setLoading(true);
    getAlgorithmRecommendations(currentUser.username)
      .then((res) => {
        setResults(res.data);
      })
      .catch((err) => {
        setError(err.response?.data?.detail || 'Failed to load results');
      })
      .finally(() => setLoading(false));
  }, [currentUser]);

  const handleLLM = async () => {
    setLlmLoading(true);
    try {
      const res = await getLLMRecommendations(currentUser.username);
      setLlmResults(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to get AI recommendations');
    } finally {
      setLlmLoading(false);
    }
  };

  const handleRetake = () => {
    navigate('/demographics');
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="card loading-card">
          <p>{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (error && !results) {
    return (
      <div className="page-container">
        <div className="card">
          <p className="error-message">{error}</p>
          <button className="btn btn-primary" onClick={handleRetake}>
            {t('results.retakeButton')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="card results-card">
        <h1 className="page-title">{t('results.title')}</h1>
        <p className="page-subtitle">{t('results.subtitle')}</p>

        {/* Scores Summary */}
        {results && (
          <>
            <section className="scores-section">
              <h2>{t('results.summaryTitle')}</h2>
              <div className="scores-grid">
                <div className="score-card">
                  <span className="score-label">{t('results.painScore')}</span>
                  <span className="score-value">
                    {results.pain_score !== undefined ? results.pain_score : '—'}
                  </span>
                </div>
                <div className="score-card">
                  <span className="score-label">{t('results.symptomScore')}</span>
                  <span className="score-value">
                    {results.symptom_score !== undefined ? results.symptom_score : '—'}
                  </span>
                </div>
                <div className="score-card">
                  <span className="score-label">{t('results.stsScore')}</span>
                  <span className="score-value">
                    {results.sts_score !== undefined
                      ? Number(results.sts_score).toFixed(2)
                      : '—'}
                  </span>
                </div>
                <div className="score-card highlight">
                  <span className="score-label">{t('results.combinedScore')}</span>
                  <span className="score-value">
                    {results.combined_score !== undefined
                      ? Number(results.combined_score).toFixed(2)
                      : '—'}
                  </span>
                </div>
              </div>
            </section>

            {/* Exercise Recommendations */}
            <section className="exercises-section">
              <h2>{t('results.exercisesTitle')}</h2>
              {results.recommendations && results.recommendations.length > 0 ? (
                <div className="exercise-list">
                  {results.recommendations.map((rec, idx) => (
                    <div key={idx} className="exercise-card">
                      <div className="exercise-header">
                        <h3 className="exercise-name">
                          {idx + 1}. {rec.exercise_name}
                        </h3>
                        <span className="exercise-score">
                          {t('results.finalScore')}: {Number(rec.final_score).toFixed(3)}
                        </span>
                      </div>
                      <div className="exercise-details">
                        <span className="exercise-tag">
                          {t('results.position')}: {rec.position}
                        </span>
                        <span className="exercise-tag">
                          {t('results.difficulty')}: {Number(rec.difficulty_match).toFixed(3)}
                        </span>
                      </div>
                      {rec.target_muscles && (
                        <div className="exercise-muscles">
                          <span className="muscles-label">{t('results.muscles')}:</span>{' '}
                          {Array.isArray(rec.target_muscles)
                            ? rec.target_muscles.join(', ')
                            : rec.target_muscles}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p>No exercises recommended.</p>
              )}
            </section>
          </>
        )}

        {/* LLM Recommendations */}
        <section className="llm-section">
          <h2>{t('results.llmTitle')}</h2>
          {!llmResults && (
            <button
              className="btn btn-accent"
              onClick={handleLLM}
              disabled={llmLoading}
            >
              {llmLoading ? t('results.llmLoading') : t('results.llmButton')}
            </button>
          )}
          {llmResults && (
            <div className="llm-results">
              {llmResults.llm_enhanced && (
                <div className="llm-badge">✨ AI-Enhanced</div>
              )}
              {llmResults.clinical_reasoning && (
                <div className="llm-reasoning">
                  <h4>Clinical Reasoning</h4>
                  <p>{llmResults.clinical_reasoning}</p>
                </div>
              )}
              {llmResults.recommendations && llmResults.recommendations.length > 0 && (
                <div className="exercise-list">
                  {llmResults.recommendations.map((rec, idx) => (
                    <div key={idx} className="exercise-card llm-card">
                      <div className="exercise-header">
                        <h3 className="exercise-name">
                          {idx + 1}. {rec.exercise_name}
                        </h3>
                        <span className="exercise-score">
                          {t('results.finalScore')}: {Number(rec.final_score).toFixed(3)}
                        </span>
                      </div>
                      <div className="exercise-details">
                        <span className="exercise-tag">
                          {t('results.position')}: {rec.position}
                        </span>
                      </div>
                      {rec.rationale && (
                        <p className="exercise-rationale">{rec.rationale}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>

        {error && <p className="error-message">{error}</p>}

        <div className="form-actions">
          <button className="btn btn-secondary" onClick={handleRetake}>
            {t('results.retakeButton')}
          </button>
        </div>
      </div>
    </div>
  );
}
