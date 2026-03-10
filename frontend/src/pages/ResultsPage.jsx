import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { getDemographics, getQuestionnaire, getSTSAssessment, getLLMRecommendations, getDeepSeekRecommendations } from '../services/api';

export default function ResultsPage() {
  const { currentUser } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  const [demographics, setDemographics] = useState(null);
  const [questionnaire, setQuestionnaire] = useState(null);
  const [stsAssessment, setStsAssessment] = useState(null);
  const [llmResults, setLlmResults] = useState(null);
  const [deepseekResults, setDeepseekResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [llmLoading, setLlmLoading] = useState(false);
  const [deepseekLoading, setDeepseekLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!currentUser) return;
    setLoading(true);

    // Fetch all dashboard data in parallel
    Promise.all([
      getDemographics(currentUser),
      getQuestionnaire(currentUser),
      getSTSAssessment(currentUser),
    ])
      .then(([demoRes, qRes, stsRes]) => {
        setDemographics(demoRes.data);
        setQuestionnaire(qRes.data);
        setStsAssessment(stsRes.data);
      })
      .catch((err) => {
        setError(err.response?.data?.detail || 'Failed to load assessment data');
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
    const lang = language || 'en';  // Default to 'en' if language is undefined
    console.log('DeepSeek button clicked, currentUser:', currentUser, 'language:', lang);
    setDeepseekLoading(true);
    setError('');
    try {
      console.log('Calling getDeepSeekRecommendations API...');
      const res = await getDeepSeekRecommendations(currentUser, lang);
      console.log('DeepSeek API response:', res.data);
      setDeepseekResults(res.data);
    } catch (err) {
      console.error('DeepSeek API error:', err);
      setError(err.response?.data?.detail || 'Failed to get DeepSeek AI recommendations');
    } finally {
      setDeepseekLoading(false);
    }
  };

  const handleRetake = () => {
    navigate('/demographics');
  };

  // Helper function to calculate BMI
  const calculateBMI = () => {
    if (!demographics) return null;
    const heightM = demographics.height_cm / 100;
    const bmi = demographics.weight_kg / (heightM * heightM);
    return bmi.toFixed(1);
  };

  // Helper function to calculate age
  const calculateAge = () => {
    if (!demographics?.date_of_birth) return null;
    const birthDate = new Date(demographics.date_of_birth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Helper function to calculate KOOS scores
  const calculateKOOSScores = () => {
    if (!questionnaire) return null;

    // Symptoms: s1-s5 (7 items total with s4_a-s4_d)
    const symptomFields = ['s1', 's2', 's3', 's4', 's5'];
    const symptomTotal = symptomFields.reduce((sum, field) => sum + (questionnaire[field] || 0), 0);
    const symptomScore = ((symptomTotal / 20) * 100).toFixed(0); // max 20 points (5 questions * 4 max)

    // Stiffness: st1-st2
    const stiffnessFields = ['st1', 'st2'];
    const stiffnessTotal = stiffnessFields.reduce((sum, field) => sum + (questionnaire[field] || 0), 0);
    const stiffnessScore = ((stiffnessTotal / 8) * 100).toFixed(0); // max 8 points

    // Pain: p1-p9
    const painFields = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8', 'p9'];
    const painTotal = painFields.reduce((sum, field) => sum + (questionnaire[field] || 0), 0);
    const painScore = ((painTotal / 36) * 100).toFixed(0); // max 36 points

    // Function ADL: f1-f17
    const adlFields = ['f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8', 'f9', 'f10', 'f11', 'f12', 'f13', 'f14', 'f15', 'f16', 'f17'];
    const adlTotal = adlFields.reduce((sum, field) => sum + (questionnaire[field] || 0), 0);
    const adlScore = ((adlTotal / 68) * 100).toFixed(0); // max 68 points

    // Function Sports: sp1-sp5
    const sportsFields = ['sp1', 'sp2', 'sp3', 'sp4', 'sp5'];
    const sportsTotal = sportsFields.reduce((sum, field) => sum + (questionnaire[field] || 0), 0);
    const sportsScore = ((sportsTotal / 20) * 100).toFixed(0); // max 20 points

    // Quality of Life: q1-q4
    const qolFields = ['q1', 'q2', 'q3', 'q4'];
    const qolTotal = qolFields.reduce((sum, field) => sum + (questionnaire[field] || 0), 0);
    const qolScore = ((qolTotal / 16) * 100).toFixed(0); // max 16 points

    return {
      symptoms: symptomScore,
      stiffness: stiffnessScore,
      pain: painScore,
      functionAdl: adlScore,
      functionSports: sportsScore,
      qualityOfLife: qolScore,
    };
  };

  // Helper function to get STS performance level
  const getSTSPerformanceLevel = () => {
    if (!stsAssessment || !demographics) return null;
    const age = calculateAge();
    const gender = demographics.gender?.toLowerCase();
    const reps = stsAssessment.repetition_count;

    // HK benchmark ranges (simplified)
    if (gender === 'male') {
      if (age < 60) return reps >= 20 ? 'Excellent' : reps >= 15 ? 'Good' : reps >= 10 ? 'Fair' : 'Poor';
      else return reps >= 15 ? 'Excellent' : reps >= 12 ? 'Good' : reps >= 8 ? 'Fair' : 'Poor';
    } else {
      if (age < 60) return reps >= 18 ? 'Excellent' : reps >= 13 ? 'Good' : reps >= 8 ? 'Fair' : 'Poor';
      else return reps >= 13 ? 'Excellent' : reps >= 10 ? 'Good' : reps >= 6 ? 'Fair' : 'Poor';
    }
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

  if (error && !demographics) {
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

  const koosScores = calculateKOOSScores();
  const age = calculateAge();
  const bmi = calculateBMI();
  const stsPerformance = getSTSPerformanceLevel();

  return (
    <div className="page-container">
      <div className="card results-card">
        <h1 className="page-title">Assessment Dashboard</h1>
        <p className="page-subtitle">Comprehensive knee osteoarthritis assessment results</p>

        {/* 1. Patient Demographics */}
        <section className="dashboard-section" style={{marginBottom: '2rem'}}>
          <h2 style={{marginBottom: '1rem', fontSize: '1.3em', color: '#374151'}}>👤 Patient Demographics</h2>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem'}}>
            <div className="info-card" style={{padding: '1rem', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb'}}>
              <div style={{fontSize: '0.85em', color: '#6b7280', marginBottom: '0.25rem'}}>Age / Gender</div>
              <div style={{fontSize: '1.5em', fontWeight: 'bold', color: '#111827'}}>
                {age || '—'} years / {demographics?.gender || '—'}
              </div>
            </div>
            <div className="info-card" style={{padding: '1rem', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb'}}>
              <div style={{fontSize: '0.85em', color: '#6b7280', marginBottom: '0.25rem'}}>Height</div>
              <div style={{fontSize: '1.5em', fontWeight: 'bold', color: '#111827'}}>
                {demographics?.height_cm || '—'} cm
              </div>
            </div>
            <div className="info-card" style={{padding: '1rem', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb'}}>
              <div style={{fontSize: '0.85em', color: '#6b7280', marginBottom: '0.25rem'}}>Weight</div>
              <div style={{fontSize: '1.5em', fontWeight: 'bold', color: '#111827'}}>
                {demographics?.weight_kg || '—'} kg
              </div>
            </div>
            <div className="info-card" style={{padding: '1rem', background: '#dbeafe', borderRadius: '8px', border: '1px solid #3b82f6'}}>
              <div style={{fontSize: '0.85em', color: '#1e40af', marginBottom: '0.25rem'}}>BMI</div>
              <div style={{fontSize: '1.5em', fontWeight: 'bold', color: '#1e3a8a'}}>
                {bmi || '—'}
              </div>
            </div>
          </div>
        </section>

        {/* 2. STS Assessment */}
        <section className="dashboard-section" style={{marginBottom: '2rem'}}>
          <h2 style={{marginBottom: '1rem', fontSize: '1.3em', color: '#374151'}}>📊 Sit-to-Stand (STS) Assessment</h2>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem'}}>
            <div className="info-card" style={{padding: '1rem', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #22c55e'}}>
              <div style={{fontSize: '0.85em', color: '#166534', marginBottom: '0.25rem'}}>Repetitions</div>
              <div style={{fontSize: '1.5em', fontWeight: 'bold', color: '#166534'}}>
                {stsAssessment?.repetition_count || '—'} reps
              </div>
              <div style={{fontSize: '0.8em', color: '#166534', marginTop: '0.25rem'}}>
                Performance: {stsPerformance || '—'}
              </div>
            </div>
            <div className="info-card" style={{padding: '1rem', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb'}}>
              <div style={{fontSize: '0.85em', color: '#6b7280', marginBottom: '0.25rem'}}>Knee Alignment</div>
              <div style={{fontSize: '1.3em', fontWeight: 'bold', color: '#111827'}}>
                {stsAssessment?.knee_alignment || '—'}
              </div>
            </div>
            <div className="info-card" style={{padding: '1rem', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb'}}>
              <div style={{fontSize: '0.85em', color: '#6b7280', marginBottom: '0.25rem'}}>Trunk Sway</div>
              <div style={{fontSize: '1.3em', fontWeight: 'bold', color: '#111827'}}>
                {stsAssessment?.trunk_sway || '—'}
              </div>
            </div>
            <div className="info-card" style={{padding: '1rem', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb'}}>
              <div style={{fontSize: '0.85em', color: '#6b7280', marginBottom: '0.25rem'}}>Hip Sway</div>
              <div style={{fontSize: '1.3em', fontWeight: 'bold', color: '#111827'}}>
                {stsAssessment?.hip_sway || '—'}
              </div>
            </div>
          </div>
        </section>

        {/* 3. KOOS Questionnaire Results */}
        <section className="dashboard-section" style={{marginBottom: '2rem'}}>
          <h2 style={{marginBottom: '1rem', fontSize: '1.3em', color: '#374151'}}>📋 KOOS Questionnaire Results</h2>
          <div style={{overflowX: 'auto'}}>
            <table style={{width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)'}}>
              <thead style={{background: '#f3f4f6'}}>
                <tr>
                  <th style={{padding: '0.75rem', textAlign: 'left', fontSize: '0.9em', fontWeight: '600', color: '#374151', borderBottom: '2px solid #e5e7eb'}}>Category</th>
                  <th style={{padding: '0.75rem', textAlign: 'center', fontSize: '0.9em', fontWeight: '600', color: '#374151', borderBottom: '2px solid #e5e7eb'}}>Score (0-100)</th>
                  <th style={{padding: '0.75rem', textAlign: 'left', fontSize: '0.9em', fontWeight: '600', color: '#374151', borderBottom: '2px solid #e5e7eb'}}>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{borderBottom: '1px solid #f3f4f6'}}>
                  <td style={{padding: '0.75rem', fontSize: '0.95em'}}>Symptoms</td>
                  <td style={{padding: '0.75rem', textAlign: 'center', fontSize: '1.2em', fontWeight: 'bold', color: '#2563eb'}}>{koosScores?.symptoms || '—'}</td>
                  <td style={{padding: '0.75rem'}}>
                    <span style={{padding: '0.25rem 0.75rem', borderRadius: '12px', fontSize: '0.85em', background: koosScores?.symptoms >= 70 ? '#d1fae5' : koosScores?.symptoms >= 40 ? '#fed7aa' : '#fecaca', color: koosScores?.symptoms >= 70 ? '#065f46' : koosScores?.symptoms >= 40 ? '#92400e' : '#991b1b'}}>
                      {koosScores?.symptoms >= 70 ? 'Good' : koosScores?.symptoms >= 40 ? 'Moderate' : 'Severe'}
                    </span>
                  </td>
                </tr>
                <tr style={{borderBottom: '1px solid #f3f4f6'}}>
                  <td style={{padding: '0.75rem', fontSize: '0.95em'}}>Stiffness</td>
                  <td style={{padding: '0.75rem', textAlign: 'center', fontSize: '1.2em', fontWeight: 'bold', color: '#2563eb'}}>{koosScores?.stiffness || '—'}</td>
                  <td style={{padding: '0.75rem'}}>
                    <span style={{padding: '0.25rem 0.75rem', borderRadius: '12px', fontSize: '0.85em', background: koosScores?.stiffness >= 70 ? '#d1fae5' : koosScores?.stiffness >= 40 ? '#fed7aa' : '#fecaca', color: koosScores?.stiffness >= 70 ? '#065f46' : koosScores?.stiffness >= 40 ? '#92400e' : '#991b1b'}}>
                      {koosScores?.stiffness >= 70 ? 'Good' : koosScores?.stiffness >= 40 ? 'Moderate' : 'Severe'}
                    </span>
                  </td>
                </tr>
                <tr style={{borderBottom: '1px solid #f3f4f6'}}>
                  <td style={{padding: '0.75rem', fontSize: '0.95em'}}>Pain</td>
                  <td style={{padding: '0.75rem', textAlign: 'center', fontSize: '1.2em', fontWeight: 'bold', color: '#2563eb'}}>{koosScores?.pain || '—'}</td>
                  <td style={{padding: '0.75rem'}}>
                    <span style={{padding: '0.25rem 0.75rem', borderRadius: '12px', fontSize: '0.85em', background: koosScores?.pain >= 70 ? '#d1fae5' : koosScores?.pain >= 40 ? '#fed7aa' : '#fecaca', color: koosScores?.pain >= 70 ? '#065f46' : koosScores?.pain >= 40 ? '#92400e' : '#991b1b'}}>
                      {koosScores?.pain >= 70 ? 'Good' : koosScores?.pain >= 40 ? 'Moderate' : 'Severe'}
                    </span>
                  </td>
                </tr>
                <tr style={{borderBottom: '1px solid #f3f4f6'}}>
                  <td style={{padding: '0.75rem', fontSize: '0.95em'}}>Function (ADL)</td>
                  <td style={{padding: '0.75rem', textAlign: 'center', fontSize: '1.2em', fontWeight: 'bold', color: '#2563eb'}}>{koosScores?.functionAdl || '—'}</td>
                  <td style={{padding: '0.75rem'}}>
                    <span style={{padding: '0.25rem 0.75rem', borderRadius: '12px', fontSize: '0.85em', background: koosScores?.functionAdl >= 70 ? '#d1fae5' : koosScores?.functionAdl >= 40 ? '#fed7aa' : '#fecaca', color: koosScores?.functionAdl >= 70 ? '#065f46' : koosScores?.functionAdl >= 40 ? '#92400e' : '#991b1b'}}>
                      {koosScores?.functionAdl >= 70 ? 'Good' : koosScores?.functionAdl >= 40 ? 'Moderate' : 'Severe'}
                    </span>
                  </td>
                </tr>
                <tr style={{borderBottom: '1px solid #f3f4f6'}}>
                  <td style={{padding: '0.75rem', fontSize: '0.95em'}}>Function (Sports)</td>
                  <td style={{padding: '0.75rem', textAlign: 'center', fontSize: '1.2em', fontWeight: 'bold', color: '#2563eb'}}>{koosScores?.functionSports || '—'}</td>
                  <td style={{padding: '0.75rem'}}>
                    <span style={{padding: '0.25rem 0.75rem', borderRadius: '12px', fontSize: '0.85em', background: koosScores?.functionSports >= 70 ? '#d1fae5' : koosScores?.functionSports >= 40 ? '#fed7aa' : '#fecaca', color: koosScores?.functionSports >= 70 ? '#065f46' : koosScores?.functionSports >= 40 ? '#92400e' : '#991b1b'}}>
                      {koosScores?.functionSports >= 70 ? 'Good' : koosScores?.functionSports >= 40 ? 'Moderate' : 'Severe'}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style={{padding: '0.75rem', fontSize: '0.95em'}}>Quality of Life</td>
                  <td style={{padding: '0.75rem', textAlign: 'center', fontSize: '1.2em', fontWeight: 'bold', color: '#2563eb'}}>{koosScores?.qualityOfLife || '—'}</td>
                  <td style={{padding: '0.75rem'}}>
                    <span style={{padding: '0.25rem 0.75rem', borderRadius: '12px', fontSize: '0.85em', background: koosScores?.qualityOfLife >= 70 ? '#d1fae5' : koosScores?.qualityOfLife >= 40 ? '#fed7aa' : '#fecaca', color: koosScores?.qualityOfLife >= 70 ? '#065f46' : koosScores?.qualityOfLife >= 40 ? '#92400e' : '#991b1b'}}>
                      {koosScores?.qualityOfLife >= 70 ? 'Good' : koosScores?.qualityOfLife >= 40 ? 'Moderate' : 'Severe'}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p style={{marginTop: '0.75rem', fontSize: '0.85em', color: '#6b7280', fontStyle: 'italic'}}>
            * Higher scores indicate better knee health. Scores: ≥70 = Good, 40-69 = Moderate, &lt;40 = Severe impairment
          </p>
        </section>

        {/* AI-Enhanced Recommendations (Unified Section) */}
        <section className="llm-section">
          <h2>🤖 AI-Enhanced Recommendations</h2>
          <p style={{fontSize: '0.9em', color: '#666', marginBottom: '1rem'}}>
            Choose an AI model to generate personalized exercise recommendations
          </p>

          {/* Show buttons only if neither result exists and not loading */}
          {!llmResults && !deepseekResults && !llmLoading && !deepseekLoading && (
            <div style={{display: 'flex', gap: '1rem', flexWrap: 'wrap'}}>
              <button
                className="btn btn-accent"
                onClick={handleLLM}
                style={{flex: '1', minWidth: '200px'}}
              >
                Get AI Recommendations (OpenAI)
              </button>
              <button
                className="btn btn-accent"
                onClick={handleDeepSeek}
                style={{flex: '1', minWidth: '200px'}}
              >
                Get AI Recommendations (DeepSeek)
              </button>
            </div>
          )}

          {/* Loading spinner */}
          {(llmLoading || deepseekLoading) && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '2rem',
              gap: '1rem'
            }}>
              <div style={{
                width: '50px',
                height: '50px',
                border: '5px solid #f3f3f3',
                borderTop: '5px solid #3498db',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
              <p style={{fontSize: '1.1em', color: '#666'}}>
                Generating AI Recommendations...
              </p>
              {deepseekLoading && (
                <p style={{fontSize: '0.9em', color: '#888'}}>
                  (This may take 1-2 minutes)
                </p>
              )}
            </div>
          )}

          {/* OpenAI Results */}
          {llmResults && (
            <div className="llm-results">
              <div style={{
                padding: '0.5rem 1rem',
                background: '#e3f2fd',
                borderRadius: '8px',
                marginBottom: '1rem',
                display: 'inline-block'
              }}>
                <strong>✨ Powered by OpenAI</strong>
              </div>
              {llmResults.clinical_reasoning && (
                <div className="llm-reasoning" style={{
                  marginBottom: '1.5rem',
                  padding: '1rem',
                  background: '#f5f5f5',
                  borderRadius: '8px'
                }}>
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

          {/* DeepSeek Results */}
          {deepseekResults && (
            <div className="llm-results">
              <div style={{
                padding: '0.5rem 1rem',
                background: '#e8f5e9',
                borderRadius: '8px',
                marginBottom: '1rem',
                display: 'inline-block'
              }}>
                <strong>🤖 Powered by DeepSeek (Two-LLM Safety System)</strong>
              </div>
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
