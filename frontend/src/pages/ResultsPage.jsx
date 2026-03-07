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
    getAlgorithmRecommendations(currentUser)
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
      const res = await getLLMRecommendations(currentUser);
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
                    {results.scores?.pain_score !== undefined
                      ? Number(results.scores.pain_score).toFixed(2)
                      : '—'}
                  </span>
                </div>
                <div className="score-card">
                  <span className="score-label">{t('results.symptomScore')}</span>
                  <span className="score-value">
                    {results.scores?.symptom_score !== undefined
                      ? Number(results.scores.symptom_score).toFixed(2)
                      : '—'}
                  </span>
                </div>
                <div className="score-card">
                  <span className="score-label">{t('results.stsScore')}</span>
                  <span className="score-value">
                    {results.scores?.sts_score !== undefined
                      ? Number(results.scores.sts_score).toFixed(2)
                      : '—'}
                  </span>
                </div>
                <div className="score-card highlight">
                  <span className="score-label">{t('results.combinedScore')}</span>
                  <span className="score-value">
                    {results.scores?.combined_score !== undefined
                      ? Number(results.scores.combined_score).toFixed(2)
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
                  {results.recommendations.map((positionGroup, posIdx) => (
                    <div key={posIdx} className="position-group">
                      <h3 className="position-title">
                        {positionGroup.position} (Multiplier: {Number(positionGroup.position_multiplier).toFixed(2)})
                      </h3>
                      {positionGroup.exercises && positionGroup.exercises.map((scoredEx, exIdx) => (
                        <div key={exIdx} className="exercise-card">
                          <div className="exercise-header">
                            <h4 className="exercise-name">
                              {scoredEx.exercise?.exercise_name || scoredEx.exercise?.exercise_name_ch || 'Unknown'}
                            </h4>
                            <span className="exercise-score">
                              {t('results.finalScore')}: {Number(scoredEx.final_score).toFixed(3)}
                            </span>
                          </div>
                          <div className="exercise-details">
                            <span className="exercise-tag">
                              {t('results.difficulty')}: Level {scoredEx.exercise?.difficulty_level || '—'}
                            </span>
                            <span className="exercise-tag">
                              Difficulty Match: {Number(scoredEx.difficulty_score).toFixed(3)}
                            </span>
                            <span className="exercise-tag">
                              Alignment Modifier: {Number(scoredEx.alignment_modifier).toFixed(2)}
                            </span>
                            <span className="exercise-tag">
                              Flexibility Modifier: {Number(scoredEx.flexibility_modifier).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      ))}
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
