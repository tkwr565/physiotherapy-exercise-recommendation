import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { getAlgorithmRecommendations, getLLMRecommendations, getDeepSeekRecommendations } from '../services/api';

export default function ResultsPage() {
  const { currentUser } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  const [results, setResults] = useState(null);
  const [llmResults, setLlmResults] = useState(null);
  const [deepseekResults, setDeepseekResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [llmLoading, setLlmLoading] = useState(false);
  const [deepseekLoading, setDeepseekLoading] = useState(false);
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

  const handleDeepSeek = async () => {
    setDeepseekLoading(true);
    setError('');
    try {
      const res = await getDeepSeekRecommendations(currentUser, language);
      setDeepseekResults(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to get DeepSeek AI recommendations');
    } finally {
      setDeepseekLoading(false);
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

        {/* LLM Recommendations (OpenAI) */}
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

        {/* DeepSeek LLM Recommendations (Two-LLM Architecture) */}
        <section className="llm-section deepseek-section">
          <h2>🤖 DeepSeek AI Recommendations (Two-LLM Safety System)</h2>
          <p style={{fontSize: '0.9em', color: '#666', marginBottom: '1rem'}}>
            Uses a two-stage AI system: Exercise Recommendation Agent + Safety Verification Agent
          </p>
          {!deepseekResults && (
            <button
              className="btn btn-accent"
              onClick={handleDeepSeek}
              disabled={deepseekLoading}
            >
              {deepseekLoading ? 'Loading DeepSeek AI (may take 1-2 minutes)...' : 'Get DeepSeek AI Recommendations'}
            </button>
          )}
          {deepseekResults && (
            <div className="llm-results">
              {/* Biomechanical Targets */}
              {deepseekResults.biomechanical_targets && deepseekResults.biomechanical_targets.length > 0 && (
                <div className="biomech-targets" style={{marginBottom: '1.5rem', padding: '1rem', background: '#f0f8ff', borderRadius: '8px'}}>
                  <h4 style={{marginBottom: '0.5rem'}}>🎯 Identified Biomechanical Targets</h4>
                  {deepseekResults.biomechanical_targets.map((target, idx) => (
                    <div key={idx} style={{marginBottom: '0.5rem'}}>
                      <strong>{target.issue}</strong>: {target.strategy}
                    </div>
                  ))}
                </div>
              )}

              {/* Warning Banner */}
              <div style={{marginBottom: '1.5rem', padding: '1rem', background: '#fff3cd', borderRadius: '8px', border: '1px solid #ffc107'}}>
                <strong>⚠️ Important:</strong> This prescription should be reviewed by a supervising physiotherapist before implementation.
              </div>

              {/* Final Prescription */}
              {deepseekResults.final_prescription && deepseekResults.final_prescription.length > 0 && (
                <div className="final-prescription">
                  <h4 style={{marginBottom: '1rem', color: '#2e7d32'}}>✅ Final Exercise Prescription (4 Exercises)</h4>
                  <div className="exercise-list">
                    {deepseekResults.final_prescription.map((ex, idx) => (
                      <div key={idx} className="exercise-card llm-card" style={{
                        borderLeft: '4px solid #4CAF50',
                        marginBottom: '1rem',
                        padding: '1rem',
                        background: '#fff',
                        borderRadius: '8px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}>
                        <div className="exercise-header" style={{marginBottom: '0.75rem'}}>
                          <h3 className="exercise-name" style={{margin: 0, color: '#1976d2', fontSize: '1.1em'}}>
                            {idx + 1}. {ex.exercise_name} ({ex.exercise_name_ch})
                          </h3>
                        </div>
                        <div className="exercise-details" style={{display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem'}}>
                          <span className="exercise-tag" style={{
                            padding: '0.25rem 0.75rem',
                            background: '#e3f2fd',
                            borderRadius: '12px',
                            fontSize: '0.85em',
                            color: '#1565c0'
                          }}>
                            📍 {ex.positions?.join(', ')}
                          </span>
                          <span className="exercise-tag" style={{
                            padding: '0.25rem 0.75rem',
                            background: ex.difficulty <= 3 ? '#c8e6c9' : ex.difficulty <= 6 ? '#fff9c4' : '#ffccbc',
                            borderRadius: '12px',
                            fontSize: '0.85em',
                            color: '#333',
                            fontWeight: 'bold'
                          }}>
                            🎯 Level {ex.difficulty}/10
                          </span>
                        </div>
                        {ex.modifications && ex.modifications.length > 0 && (
                          <div style={{
                            marginTop: '0.75rem',
                            padding: '0.75rem',
                            background: '#fff3cd',
                            borderRadius: '6px',
                            borderLeft: '3px solid #ffc107'
                          }}>
                            <strong style={{color: '#856404'}}>⚠️ Safety Modifications:</strong>
                            <ul style={{marginTop: '0.5rem', marginBottom: 0, paddingLeft: '1.5rem'}}>
                              {ex.modifications.map((mod, modIdx) => (
                                <li key={modIdx} style={{marginBottom: '0.25rem'}}>{mod}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {ex.clinical_rationale && (
                          <div style={{
                            marginTop: '0.75rem',
                            padding: '0.75rem',
                            background: '#f5f5f5',
                            borderRadius: '6px',
                            fontSize: '0.9em',
                            lineHeight: '1.5'
                          }}>
                            <strong style={{color: '#555'}}>💡 Clinical Rationale:</strong>
                            <p style={{margin: '0.5rem 0 0 0', color: '#666'}}>{ex.clinical_rationale}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
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
