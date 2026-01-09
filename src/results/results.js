import { supabase } from '../shared/supabase.js';
import { getMuscleDescription, getPrimaryMuscles } from '../shared/muscle-translations.js';
import { calculateRecommendations } from './algorithm.js';

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
    exercisesSubtitle: "Exercises grouped by position and ranked by suitability",
    topPositionsTitle: "Your Top Exercise Positions",
    positionCapability: "Capability",
    exerciseRank: "Rank",
    exerciseName: "Exercise",
    difficultyMatch: "Difficulty Match",
    finalScore: "Final Match Score",
    exerciseMuscles: "Target Muscles (Major)",
    boostReasons: "Score Boost Reasons",

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
    exercisesSubtitle: "運動按姿勢分組並按適合度排序",
    topPositionsTitle: "您的最佳運動姿勢",
    positionCapability: "能力",
    exerciseRank: "排名",
    exerciseName: "運動名稱",
    difficultyMatch: "難度匹配",
    finalScore: "最終匹配分數",
    exerciseMuscles: "目標肌肉（主要）",
    boostReasons: "分數提升原因",

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
let algorithmResults = null; // Store complete algorithm output

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

    // Load exercises and calculate recommendations using algorithm
    await loadExercises();

  } catch (err) {
    console.error('Error loading assessment data:', err);
    alert(t('error'));
  }
}

// Load exercises from database and run algorithm
async function loadExercises() {
  try {
    // Load all exercises from database
    const { data: exercises, error } = await supabase
      .from('exercises')
      .select('*');

    if (error) throw error;

    // Run the recommendation algorithm
    algorithmResults = await calculateRecommendations(
      assessmentData,
      stsData,
      exercises
    );

    // Transform algorithm results to exercise recommendations for display
    exerciseRecommendations = [];
    let rank = 1;

    for (const positionRec of algorithmResults.recommendations) {
      for (const exerciseItem of positionRec.exercises) {
        exerciseRecommendations.push({
          rank: rank++,
          ...exerciseItem.exercise,
          position: positionRec.position,
          positionMultiplier: positionRec.positionMultiplier,
          difficultyScore: exerciseItem.difficultyScore,
          alignmentModifier: exerciseItem.alignmentModifier,
          flexibilityModifier: exerciseItem.flexibilityModifier,
          finalScore: exerciseItem.finalScore
        });
      }
    }

    console.log('Algorithm results:', algorithmResults);
    console.log('Exercise recommendations:', exerciseRecommendations);
  } catch (error) {
    console.error('Error loading exercises or running algorithm:', error);
    exerciseRecommendations = [];
  }
}

// Calculate scores from algorithm results
function calculateScores() {
  if (!algorithmResults || !algorithmResults.scores) {
    return { painScore: 0, symptomScore: 0, stsScore: 0, combinedScore: 0 };
  }

  return algorithmResults.scores;
}

// Get exercise name based on language
function getExerciseName(exercise) {
  if (currentLang === 'zh-TW' && exercise.exercise_name_ch) {
    return exercise.exercise_name_ch;
  }
  return exercise.exercise_name;
}

// Get position label with translation
function getPositionLabel(position) {
  const positionMap = {
    'DL_stand': 'position_DL_stand',
    'split_stand': 'position_split_stand',
    'SL_stand': 'position_SL_stand',
    'quadruped': 'position_four_kneeling',
    'lying': 'position_supine'
  };

  return t(positionMap[position] || 'position_supine');
}

// Get biomechanical indicator badges for exercise
function getExerciseIndicators(exercise) {
  const indicators = [];

  if (!algorithmResults || !algorithmResults.biomechanicalFlags) return '';

  // Alignment targeting
  if (algorithmResults.biomechanicalFlags.alignmentIssue && exercise.alignmentModifier > 1.5) {
    indicators.push('<span class="indicator alignment" title="Alignment correction">⭐</span>');
  }

  // Core stability
  if (algorithmResults.biomechanicalFlags.coreStabilityRequired && exercise.core_ipsi) {
    indicators.push('<span class="indicator core" title="Core stability">🔄</span>');
  }

  // Flexibility targeting
  if (algorithmResults.biomechanicalFlags.flexibilityDeficit && exercise.flexibilityModifier > 1.2) {
    indicators.push('<span class="indicator flexibility" title="Flexibility improvement">🤸</span>');
  }

  return indicators.length > 0 ? ' ' + indicators.join(' ') : '';
}

// Get boost reasons for exercise (only if boosted)
function getBoostReasons(exercise) {
  const reasons = [];

  if (!exercise.alignmentModifier && !exercise.flexibilityModifier) return '-';

  // Alignment boost
  if (exercise.alignmentModifier > 1.1) {
    const boostPct = ((exercise.alignmentModifier - 1.0) * 100).toFixed(0);
    const reason = currentLang === 'zh-TW'
      ? `姿勢矯正 (+${boostPct}%)`
      : `Alignment correction (+${boostPct}%)`;
    reasons.push(reason);
  }

  // Flexibility boost
  if (exercise.flexibilityModifier > 1.1) {
    const boostPct = ((exercise.flexibilityModifier - 1.0) * 100).toFixed(0);
    const reason = currentLang === 'zh-TW'
      ? `柔韌性改善 (+${boostPct}%)`
      : `Flexibility improvement (+${boostPct}%)`;
    reasons.push(reason);
  }

  return reasons.length > 0 ? reasons.join(', ') : '-';
}

// Get biomechanical notices for display
function getBiomechanicalNotices() {
  if (!algorithmResults || !algorithmResults.biomechanicalFlags) return '';

  const notices = [];
  const flags = algorithmResults.biomechanicalFlags;

  if (flags.coreStabilityRequired) {
    notices.push(currentLang === 'zh-TW'
      ? '<div class="biomech-notice core">⚠️ <strong>需要核心穩定性訓練</strong> - 檢測到運動不穩定</div>'
      : '<div class="biomech-notice core">⚠️ <strong>Core Stability Required</strong> - Movement instability detected</div>'
    );
  }

  if (flags.flexibilityDeficit) {
    notices.push(currentLang === 'zh-TW'
      ? '<div class="biomech-notice flex">💪 <strong>柔韌性不足</strong> - 無法觸摸腳趾</div>'
      : '<div class="biomech-notice flex">💪 <strong>Flexibility Deficit</strong> - Toe touch unable</div>'
    );
  }

  if (flags.alignmentIssue) {
    const alignmentType = stsData.knee_alignment === 'valgus'
      ? (currentLang === 'zh-TW' ? '外翻（X型腿）' : 'Valgus (Knock-knees)')
      : (currentLang === 'zh-TW' ? '內翻（O型腿）' : 'Varus (Bow-legged)');

    notices.push(currentLang === 'zh-TW'
      ? `<div class="biomech-notice align">🎯 <strong>膝蓋排列問題</strong> - ${alignmentType}</div>`
      : `<div class="biomech-notice align">🎯 <strong>Alignment Issue</strong> - ${alignmentType}</div>`
    );
  }

  if (notices.length === 0) {
    return currentLang === 'zh-TW'
      ? '<div class="biomech-notice good">✓ <strong>良好的運動質量</strong> - 所有運動類型可用</div>'
      : '<div class="biomech-notice good">✓ <strong>Good Movement Quality</strong> - All exercise types available</div>';
  }

  return notices.join('\n');
}

// Render position summary table
function renderPositionSummary() {
  if (!algorithmResults || !algorithmResults.recommendations) return '';

  // Only show positions that have exercises
  const validPositions = algorithmResults.recommendations.filter(rec => rec.exercises.length > 0);

  if (validPositions.length === 0) return '';

  const rows = validPositions.map((rec, index) => `
    <tr>
      <td class="position-rank">#${index + 1}</td>
      <td class="position-name"><strong>${getPositionLabel(rec.position)}</strong></td>
      <td class="position-capability">${(rec.positionMultiplier * 100).toFixed(0)}%</td>
      <td class="position-exercises">${rec.exercises.length} ${currentLang === 'zh-TW' ? '個運動' : 'exercises'}</td>
    </tr>
  `).join('');

  return `
    <div class="position-summary">
      <h3>${t('topPositionsTitle')}</h3>
      <table class="position-table">
        <thead>
          <tr>
            <th>${t('exerciseRank')}</th>
            <th>${currentLang === 'zh-TW' ? '姿勢' : 'Position'}</th>
            <th>${t('positionCapability')}</th>
            <th>${currentLang === 'zh-TW' ? '推薦運動數' : 'Recommended Exercises'}</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </div>
  `;
}

// Render position-grouped exercise tables
function renderPositionGroupedExercises() {
  if (!algorithmResults || !algorithmResults.recommendations) return '';

  // Only show positions that have exercises
  const validPositions = algorithmResults.recommendations.filter(rec => rec.exercises.length > 0);

  if (validPositions.length === 0) {
    return `<p class="no-exercises">${currentLang === 'zh-TW' ? '沒有可用的運動' : 'No exercises available'}</p>`;
  }

  return validPositions.map((positionRec, posIndex) => {
    const exerciseRows = positionRec.exercises.map((exItem, exIndex) => {
      const exercise = exItem.exercise;
      return `
        <tr>
          <td class="rank-cell">#${exIndex + 1}</td>
          <td class="name-cell">
            ${getExerciseName(exercise)}
            ${getExerciseIndicators(exercise)}
          </td>
          <td class="difficulty-cell">${(exItem.difficultyScore * 100).toFixed(0)}%</td>
          <td class="final-score-cell"><strong>${(exItem.finalScore * 100).toFixed(0)}%</strong></td>
          <td class="muscles-cell">${getPrimaryMuscles(exercise, currentLang)}</td>
          <td class="boost-cell">${getBoostReasons({
            alignmentModifier: exItem.alignmentModifier,
            flexibilityModifier: exItem.flexibilityModifier
          })}</td>
        </tr>
      `;
    }).join('');

    return `
      <div class="position-group">
        <h3 class="position-group-title">
          ${currentLang === 'zh-TW' ? '姿勢' : 'Position'} #${posIndex + 1}:
          ${getPositionLabel(positionRec.position)}
          <span class="position-capability-badge">${(positionRec.positionMultiplier * 100).toFixed(0)}% ${t('positionCapability')}</span>
        </h3>
        <table class="exercise-table">
          <thead>
            <tr>
              <th>${t('exerciseRank')}</th>
              <th>${t('exerciseName')}</th>
              <th>${t('difficultyMatch')}</th>
              <th>${t('finalScore')}</th>
              <th>${t('exerciseMuscles')}</th>
              <th>${t('boostReasons')}</th>
            </tr>
          </thead>
          <tbody>
            ${exerciseRows}
          </tbody>
        </table>
      </div>
    `;
  }).join('');
}

// Get STS benchmark (helper function)
function getStsBenchmark(age, gender) {
  if (age >= 60 && age < 65) return gender === 'male' ? 14 : 12;
  if (age >= 65 && age < 70) return gender === 'male' ? 12 : 11;
  if (age >= 70 && age < 75) return gender === 'male' ? 12 : 10;
  if (age >= 75 && age < 80) return gender === 'male' ? 11 : 10;
  if (age >= 80 && age < 85) return gender === 'male' ? 10 : 9;
  if (age >= 85 && age < 90) return gender === 'male' ? 8 : 8;
  if (age >= 90) return gender === 'male' ? 7 : 4;
  return 12; // Default
}

// Calculate STS display info
function calculateStsScore() {
  if (!stsData) return { score: 0, benchmark: 0, performance: 'poor' };

  const benchmark = getStsBenchmark(stsData.age, stsData.gender);
  const score = algorithmResults?.scores?.stsScore || 0;

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

    ${getBiomechanicalNotices()}

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

      ${renderPositionSummary()}
      ${renderPositionGroupedExercises()}
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
