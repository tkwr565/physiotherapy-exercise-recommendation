import { supabase } from '../shared/supabase.js';
import { getMuscleDescription, getPrimaryMuscles } from '../shared/muscle-translations.js';

// Results page translations
const translations = {
  'en': {
    title: "Your Personalized Exercise Recommendations",
    subtitle: "Page 3 of 3: Assessment Results & Exercise Plan",
    loading: "Loading your assessment results...",
    error: "Failed to load assessment data. Please try again.",

    // Summary Section
    summaryTitle: "Assessment Summary",
    yourScores: "Your Scores",
    painScore: "Pain Score",
    symptomScore: "Symptom Score",
    stsScore: "Functional Performance (STS)",
    combinedScore: "Overall Combined Score",

    // Demographics
    demographicsTitle: "Your Profile",
    age: "Age",
    gender: "Gender",
    male: "Male",
    female: "Female",

    // STS Assessment
    stsTitle: "Sit-to-Stand Assessment",
    repetitions: "Repetitions Completed",
    benchmark: "Normative Benchmark",
    performance: "Performance Level",
    performanceExcellent: "Excellent - Above benchmark",
    performanceGood: "Good - Meeting benchmark",
    performanceFair: "Fair - Below benchmark",
    performancePoor: "Poor - Significantly below benchmark",

    // Biomechanical Assessment
    biomechanicsTitle: "Biomechanical Assessment",
    kneeAlignment: "Knee Alignment",
    kneeNormal: "Normal",
    kneeValgus: "Valgus (Knock-knees)",
    kneeVarus: "Varus (Bow-legged)",
    coreStability: "Core Stability",
    trunkSway: "Trunk Sway",
    hipSway: "Hip Sway",
    present: "Present",
    absent: "Absent",

    // Flexibility
    flexibilityTitle: "Flexibility Assessment",
    toeTouch: "Toe Touch Test",
    toeTouch_can: "Able",
    toeTouch_cannot: "Unable",

    // Exercise Recommendations
    exercisesTitle: "Recommended Exercises",
    exercisesSubtitle: "Exercises are ranked based on your assessment results",
    exerciseRank: "Rank",
    exerciseName: "Exercise",
    exercisePosition: "Position",
    exerciseScore: "Match Score",
    exerciseMuscles: "Target Muscles (Major)",
    exerciseNotes: "Notes",

    // Position labels
    position_supine: "Supine (Lying on back)",
    position_prone: "Prone (Lying face down)",
    position_four_kneeling: "Four-point Kneeling",
    position_DL_stand: "Double-leg Standing",
    position_split_stand: "Split Stance",
    position_SL_stand: "Single-leg Standing",

    // Actions
    backButton: "Back to Assessment",
    retakeButton: "Retake Assessment",
    downloadButton: "Download Results (PDF)",
    printButton: "Print Results",

    // Placeholder notices
    placeholderNotice: "Note: Algorithm implementation in progress",
    comingSoon: "Coming soon"
  },
  'zh-TW': {
    title: "您的個人化運動建議",
    subtitle: "第3頁，共3頁：評估結果與運動計劃",
    loading: "正在載入您的評估結果...",
    error: "無法載入評估數據。請重試。",

    // Summary Section
    summaryTitle: "評估摘要",
    yourScores: "您的分數",
    painScore: "疼痛分數",
    symptomScore: "症狀分數",
    stsScore: "功能表現 (STS)",
    combinedScore: "整體綜合分數",

    // Demographics
    demographicsTitle: "您的資料",
    age: "年齡",
    gender: "性別",
    male: "男性",
    female: "女性",

    // STS Assessment
    stsTitle: "坐站測試評估",
    repetitions: "完成次數",
    benchmark: "標準基準",
    performance: "表現水平",
    performanceExcellent: "優秀 - 高於基準",
    performanceGood: "良好 - 達到基準",
    performanceFair: "尚可 - 低於基準",
    performancePoor: "需改善 - 明顯低於基準",

    // Biomechanical Assessment
    biomechanicsTitle: "生物力學評估",
    kneeAlignment: "膝蓋排列",
    kneeNormal: "正常",
    kneeValgus: "外翻（X型腿）",
    kneeVarus: "內翻（O型腿）",
    coreStability: "核心穩定性",
    trunkSway: "軀幹搖晃",
    hipSway: "髖部搖晃",
    present: "存在",
    absent: "不存在",

    // Flexibility
    flexibilityTitle: "柔韌性評估",
    toeTouch: "觸摸腳趾測試",
    toeTouch_can: "能夠",
    toeTouch_cannot: "無法",

    // Exercise Recommendations
    exercisesTitle: "推薦運動",
    exercisesSubtitle: "運動根據您的評估結果排序",
    exerciseRank: "排名",
    exerciseName: "運動名稱",
    exercisePosition: "姿勢",
    exerciseScore: "匹配分數",
    exerciseMuscles: "目標肌肉（主要）",
    exerciseNotes: "備註",

    // Position labels
    position_supine: "仰臥（背部平躺）",
    position_prone: "俯臥（面朝下）",
    position_four_kneeling: "四足跪姿",
    position_DL_stand: "雙腿站立",
    position_split_stand: "弓步站立",
    position_SL_stand: "單腿站立",

    // Actions
    backButton: "返回評估",
    retakeButton: "重新評估",
    downloadButton: "下載結果 (PDF)",
    printButton: "列印結果",

    // Placeholder notices
    placeholderNotice: "注意：演算法實施進行中",
    comingSoon: "即將推出"
  }
};

// State
let currentLang = 'zh-TW'; // Default to Traditional Chinese
let assessmentData = null;
let stsData = null;
let exerciseRecommendations = [];

// Initialize app
async function init() {
  // Check if user is logged in
  const currentUser = localStorage.getItem('currentUser');
  if (!currentUser) {
    window.location.href = '/home.html';
    return;
  }

  // Check if assessments are completed
  const questionnaireCompleted = localStorage.getItem('questionnaireCompleted');
  const stsCompleted = localStorage.getItem('stsAssessmentCompleted');

  if (!questionnaireCompleted || !stsCompleted) {
    alert(currentLang === 'zh-TW' ? '請先完成所有評估。' : 'Please complete all assessments first.');
    window.location.href = '/questionnaire.html';
    return;
  }

  // Load assessment data
  await loadAssessmentData();

  // Render page header
  renderHeader();

  // Render results
  renderResults();
}

// Render page header
function renderHeader() {
  const header = document.getElementById('pageHeader');
  header.innerHTML = `
    <h1>${t('title')}</h1>
    <p>${t('subtitle')}</p>
  `;
}

// Get translation
function t(key) {
  return translations[currentLang][key] || key;
}

// Load all assessment data
async function loadAssessmentData() {
  const currentUser = localStorage.getItem('currentUser');

  try {
    // Load questionnaire responses
    const { data: questionnaireData, error: qError } = await supabase
      .from('questionnaire_responses')
      .select('*')
      .eq('username', currentUser)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (qError) throw qError;
    assessmentData = questionnaireData;

    // Load STS assessment
    const { data: stsAssessment, error: stsError } = await supabase
      .from('sts_assessments')
      .select('*')
      .eq('username', currentUser)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (stsError) throw stsError;
    stsData = stsAssessment;

    // TODO: Calculate exercise recommendations using new algorithm
    // For now, fetch first 5 exercises from database as placeholders
    await loadExercises();

  } catch (err) {
    console.error('Error loading assessment data:', err);
    alert(t('error'));
  }
}

// Load exercises from database
async function loadExercises() {
  try {
    const { data: exercises, error } = await supabase
      .from('exercises')
      .select('*')
      .order('difficulty_level', { ascending: true })
      .limit(10); // Get first 10 exercises as placeholder

    if (error) throw error;

    // Transform exercises to include rank and placeholder scores
    exerciseRecommendations = exercises.map((ex, index) => ({
      rank: index + 1,
      ...ex,
      score: 0.95 - (index * 0.05), // Placeholder descending scores
      notes: currentLang === 'zh-TW' ? '基礎運動' : 'Basic exercise'
    }));

    console.log('Loaded exercises:', exerciseRecommendations);
  } catch (error) {
    console.error('Error loading exercises:', error);
    exerciseRecommendations = [];
  }
}

// Calculate scores from questionnaire data
function calculateScores() {
  if (!assessmentData) return { painScore: 0, symptomScore: 0, combinedScore: 0 };

  // PLACEHOLDER: Actual calculation will be implemented in algorithm
  // For now, show normalized values
  const painQuestions = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8', 'P9'];
  const symptomQuestions = ['S1', 'S2', 'S3', 'S4', 'S5'];

  let painSum = 0;
  let painCount = 0;
  painQuestions.forEach(q => {
    const value = parseInt(assessmentData[q]);
    if (!isNaN(value)) {
      painSum += value;
      painCount++;
    }
  });

  let symptomSum = 0;
  let symptomCount = 0;
  symptomQuestions.forEach(q => {
    const value = parseInt(assessmentData[q]);
    if (!isNaN(value)) {
      symptomSum += value;
      symptomCount++;
    }
  });

  // Normalize to 0-1 scale (invert so higher is better)
  const painScore = painCount > 0 ? 1 - (painSum / (painCount * 4)) : 0;
  const symptomScore = symptomCount > 0 ? 1 - (symptomSum / (symptomCount * 4)) : 0;

  return {
    painScore: painScore,
    symptomScore: symptomScore,
    combinedScore: (painScore + symptomScore) / 2 // Placeholder
  };
}

// Get exercise name based on language
function getExerciseName(exercise) {
  if (currentLang === 'zh-TW' && exercise.exercise_name_ch) {
    return exercise.exercise_name_ch;
  }
  return exercise.exercise_name;
}

// Get exercise position key for translation
function getExercisePosition(exercise) {
  // Check which position is TRUE
  if (exercise.position_supine_lying) return 'supine';
  if (exercise.position_side_lying) return 'side_lying';
  if (exercise.position_prone) return 'prone';
  if (exercise.position_quadruped || exercise.position_four_kneeling) return 'quadruped';
  if (exercise.position_dl_stand) return 'DL_stand';
  if (exercise.position_split_stand) return 'split_stand';
  if (exercise.position_sl_stand) return 'SL_stand';
  return 'supine'; // default
}

// Calculate STS score and benchmark
function calculateStsScore() {
  if (!stsData) return { score: 0, benchmark: 0, performance: 'poor' };

  // PLACEHOLDER: Use normative data from STS documentation
  const age = stsData.age;
  const gender = stsData.gender;
  const reps = stsData.repetition_count;

  // Simplified benchmark lookup
  let benchmark = 12; // Default
  if (age >= 60 && age < 65) benchmark = gender === 'male' ? 14 : 12;
  else if (age >= 65 && age < 70) benchmark = gender === 'male' ? 12 : 11;
  else if (age >= 70 && age < 75) benchmark = gender === 'male' ? 12 : 10;
  else if (age >= 75 && age < 80) benchmark = gender === 'male' ? 11 : 10;
  else if (age >= 80 && age < 85) benchmark = gender === 'male' ? 10 : 9;
  else if (age >= 85 && age < 90) benchmark = gender === 'male' ? 8 : 8;
  else if (age >= 90) benchmark = gender === 'male' ? 7 : 4;

  const score = Math.min(1.0, reps / benchmark);

  let performance = 'poor';
  if (score >= 1.2) performance = 'excellent';
  else if (score >= 1.0) performance = 'good';
  else if (score >= 0.8) performance = 'fair';

  return { score, benchmark, performance };
}

// Render results dashboard
function renderResults() {
  const container = document.getElementById('resultsContainer');

  if (!assessmentData || !stsData) {
    container.innerHTML = `<div class="error">${t('error')}</div>`;
    return;
  }

  const scores = calculateScores();
  const stsScore = calculateStsScore();

  container.innerHTML = `
    <!-- Language Toggle Bar -->
    <div class="language-bar">
      <div class="language-toggle">
        <button class="lang-btn ${currentLang === 'en' ? 'active' : ''}" data-lang="en">English</button>
        <button class="lang-btn ${currentLang === 'zh-TW' ? 'active' : ''}" data-lang="zh-TW">繁體中文</button>
      </div>
    </div>

    <!-- Placeholder Notice -->
    <div class="placeholder-notice">
      ⚠️ ${t('placeholderNotice')} - ${t('comingSoon')}
    </div>

    <!-- Assessment Summary Section -->
    <section class="results-section summary-section">
      <h2>${t('summaryTitle')}</h2>

      <div class="summary-grid">
        <!-- Score Cards -->
        <div class="score-card">
          <div class="score-label">${t('painScore')}</div>
          <div class="score-value">${(scores.painScore * 100).toFixed(0)}%</div>
          <div class="score-bar">
            <div class="score-bar-fill" style="width: ${scores.painScore * 100}%"></div>
          </div>
        </div>

        <div class="score-card">
          <div class="score-label">${t('symptomScore')}</div>
          <div class="score-value">${(scores.symptomScore * 100).toFixed(0)}%</div>
          <div class="score-bar">
            <div class="score-bar-fill" style="width: ${scores.symptomScore * 100}%"></div>
          </div>
        </div>

        <div class="score-card">
          <div class="score-label">${t('stsScore')}</div>
          <div class="score-value">${(stsScore.score * 100).toFixed(0)}%</div>
          <div class="score-bar">
            <div class="score-bar-fill" style="width: ${stsScore.score * 100}%"></div>
          </div>
        </div>

        <div class="score-card combined">
          <div class="score-label">${t('combinedScore')}</div>
          <div class="score-value">${(scores.combinedScore * 100).toFixed(0)}%</div>
          <div class="score-bar">
            <div class="score-bar-fill" style="width: ${scores.combinedScore * 100}%"></div>
          </div>
        </div>
      </div>
    </section>

    <!-- Demographics Section -->
    <section class="results-section demographics-section">
      <h2>${t('demographicsTitle')}</h2>
      <div class="info-grid">
        <div class="info-item">
          <span class="info-label">${t('age')}:</span>
          <span class="info-value">${stsData.age}</span>
        </div>
        <div class="info-item">
          <span class="info-label">${t('gender')}:</span>
          <span class="info-value">${t(stsData.gender)}</span>
        </div>
      </div>
    </section>

    <!-- STS Assessment Section -->
    <section class="results-section sts-section">
      <h2>${t('stsTitle')}</h2>
      <div class="info-grid">
        <div class="info-item">
          <span class="info-label">${t('repetitions')}:</span>
          <span class="info-value">${stsData.repetition_count}</span>
        </div>
        <div class="info-item">
          <span class="info-label">${t('benchmark')}:</span>
          <span class="info-value">${stsScore.benchmark}</span>
        </div>
        <div class="info-item full-width">
          <span class="info-label">${t('performance')}:</span>
          <span class="info-value performance-${stsScore.performance}">
            ${t('performance' + stsScore.performance.charAt(0).toUpperCase() + stsScore.performance.slice(1))}
          </span>
        </div>
      </div>
    </section>

    <!-- Biomechanical Assessment Section -->
    <section class="results-section biomechanics-section">
      <h2>${t('biomechanicsTitle')}</h2>
      <div class="info-grid">
        <div class="info-item">
          <span class="info-label">${t('kneeAlignment')}:</span>
          <span class="info-value">${t('knee' + stsData.knee_alignment.charAt(0).toUpperCase() + stsData.knee_alignment.slice(1))}</span>
        </div>
        <div class="info-item">
          <span class="info-label">${t('trunkSway')}:</span>
          <span class="info-value">${t(stsData.trunk_sway)}</span>
        </div>
        <div class="info-item">
          <span class="info-label">${t('hipSway')}:</span>
          <span class="info-value">${t(stsData.hip_sway)}</span>
        </div>
      </div>
    </section>

    <!-- Flexibility Assessment Section -->
    <section class="results-section flexibility-section">
      <h2>${t('flexibilityTitle')}</h2>
      <div class="info-grid">
        <div class="info-item full-width">
          <span class="info-label">${t('toeTouch')}:</span>
          <span class="info-value">${t('toeTouch_' + assessmentData.toe_touch_test)}</span>
        </div>
      </div>
    </section>

    <!-- Exercise Recommendations Section -->
    <section class="results-section exercises-section">
      <h2>${t('exercisesTitle')}</h2>
      <p class="section-subtitle">${t('exercisesSubtitle')}</p>

      <div class="exercises-table">
        <table>
          <thead>
            <tr>
              <th>${t('exerciseRank')}</th>
              <th>${t('exerciseName')}</th>
              <th>${t('exercisePosition')}</th>
              <th>${t('exerciseScore')}</th>
              <th>${t('exerciseMuscles')}</th>
              <th>${t('exerciseNotes')}</th>
            </tr>
          </thead>
          <tbody>
            ${exerciseRecommendations.map(ex => `
              <tr>
                <td class="rank-cell">#${ex.rank}</td>
                <td class="name-cell">${getExerciseName(ex)}</td>
                <td class="position-cell">${t('position_' + getExercisePosition(ex))}</td>
                <td class="score-cell">${(ex.score * 100).toFixed(0)}%</td>
                <td class="muscles-cell">${getPrimaryMuscles(ex, currentLang)}</td>
                <td class="notes-cell">${ex.notes}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </section>

    <!-- Action Buttons -->
    <div class="button-group">
      <button type="button" class="btn btn-secondary" id="backBtn">
        ${t('backButton')}
      </button>
      <button type="button" class="btn btn-secondary" id="retakeBtn">
        ${t('retakeButton')}
      </button>
      <button type="button" class="btn btn-primary" id="downloadBtn" disabled>
        ${t('downloadButton')}
      </button>
      <button type="button" class="btn btn-primary" id="printBtn" onclick="window.print()">
        ${t('printButton')}
      </button>
    </div>
  `;

  // Add event listeners
  document.getElementById('backBtn').addEventListener('click', () => {
    window.location.href = '/sts-assessment.html';
  });

  document.getElementById('retakeBtn').addEventListener('click', () => {
    if (confirm(currentLang === 'zh-TW' ? '確定要重新開始評估嗎？' : 'Are you sure you want to retake the assessment?')) {
      localStorage.removeItem('questionnaireCompleted');
      localStorage.removeItem('stsAssessmentCompleted');
      window.location.href = '/questionnaire.html';
    }
  });

  // Language toggle listeners
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      switchLanguage(btn.dataset.lang);
    });
  });
}

// Switch language
function switchLanguage(lang) {
  currentLang = lang;
  renderHeader();
  renderResults();
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);
