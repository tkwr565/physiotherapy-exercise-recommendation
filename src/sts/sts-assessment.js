import { supabase } from '../shared/supabase.js';

// STS Assessment translations
const translations = {
  'en': {
    title: "30-Second Sit-to-Stand Assessment",
    subtitle: "Page 2 of 3: Functional Performance Test",
    instructions: "Please complete the following assessment to help us recommend the most appropriate exercises for you.",

    // Test Instructions Section
    testInstructionsTitle: "Test Instructions",
    testInstructionsText: "Perform as many sit-to-stand repetitions as possible in 30 seconds. Start from a seated position and stand up fully, then return to seated. Count each complete cycle.",

    // Form Fields
    repetitionLabel: "Number of repetitions completed",
    repetitionPlaceholder: "Enter number (e.g., 12)",

    ageLabel: "Age",
    agePlaceholder: "Enter your age",

    genderLabel: "Gender",
    genderMale: "Male",
    genderFemale: "Female",

    kneeAlignmentLabel: "Knee Alignment",
    kneeAlignmentNormal: "Normal",
    kneeAlignmentValgus: "Valgus (Knock-knees)",
    kneeAlignmentVarus: "Varus (Bow-legged)",

    coreStabilityTitle: "Core Stability Assessment",
    coreStabilitySubtitle: "Observe during the sit-to-stand test:",

    trunkSwayLabel: "Trunk Sway",
    trunkSwayPresent: "Present",
    trunkSwayAbsent: "Absent",

    hipSwayLabel: "Hip Sway",
    hipSwayPresent: "Present",
    hipSwayAbsent: "Absent",

    // Buttons
    submitButton: "Continue to Results",
    backButton: "Back to Questionnaire",

    // Validation messages
    validationRequired: "Please fill in all required fields",
    validationRepetition: "Please enter a valid number of repetitions",
    validationAge: "Please enter a valid age (18-120)",

    // Success/Error
    savingData: "Saving assessment data...",
    errorSaving: "Failed to save assessment data. Please try again."
  },
  'zh-TW': {
    title: "30秒坐站測試",
    subtitle: "第2頁，共3頁：功能性表現測試",
    instructions: "請完成以下評估，以幫助我們為您推薦最合適的運動。",

    // Test Instructions Section
    testInstructionsTitle: "測試說明",
    testInstructionsText: "在30秒內盡可能多地完成坐站循環。從坐姿開始，完全站起，然後回到坐姿。計算每個完整循環。",

    // Form Fields
    repetitionLabel: "完成的重複次數",
    repetitionPlaceholder: "輸入數字（例如：12）",

    ageLabel: "年齡",
    agePlaceholder: "輸入您的年齡",

    genderLabel: "性別",
    genderMale: "男性",
    genderFemale: "女性",

    kneeAlignmentLabel: "膝蓋排列",
    kneeAlignmentNormal: "正常",
    kneeAlignmentValgus: "外翻（X型腿）",
    kneeAlignmentVarus: "內翻（O型腿）",

    coreStabilityTitle: "核心穩定性評估",
    coreStabilitySubtitle: "在坐站測試期間觀察：",

    trunkSwayLabel: "軀幹搖晃",
    trunkSwayPresent: "存在",
    trunkSwayAbsent: "不存在",

    hipSwayLabel: "髖部搖晃",
    hipSwayPresent: "存在",
    hipSwayAbsent: "不存在",

    // Buttons
    submitButton: "繼續查看結果",
    backButton: "返回問卷",

    // Validation messages
    validationRequired: "請填寫所有必填欄位",
    validationRepetition: "請輸入有效的重複次數",
    validationAge: "請輸入有效的年齡（18-120）",

    // Success/Error
    savingData: "正在保存評估數據...",
    errorSaving: "保存評估數據失敗。請重試。"
  }
};

// State
let currentLang = 'zh-TW'; // Default to Traditional Chinese
let assessmentData = {
  repetition_count: null,
  age: null,
  gender: null,
  knee_alignment: null,
  trunk_sway: null,
  hip_sway: null
};

// Initialize app
function init() {
  // Check if user is logged in
  const currentUser = localStorage.getItem('currentUser');
  if (!currentUser) {
    // Not logged in, redirect to home
    window.location.href = '/home.html';
    return;
  }

  // Check if questionnaire is completed
  const questionnaireCompleted = localStorage.getItem('questionnaireCompleted');
  if (!questionnaireCompleted) {
    // Questionnaire not completed, redirect back
    alert(currentLang === 'zh-TW' ? '請先完成問卷。' : 'Please complete the questionnaire first.');
    window.location.href = '/questionnaire.html';
    return;
  }

  // Try to load previously saved assessment data
  loadSavedData();

  // Render the assessment form
  renderAssessment();
}

// Get translation
function t(key) {
  return translations[currentLang][key] || key;
}

// Load previously saved data if exists
async function loadSavedData() {
  const currentUser = localStorage.getItem('currentUser');

  try {
    const { data, error } = await supabase
      .from('sts_assessments')
      .select('*')
      .eq('username', currentUser)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (data && !error) {
      assessmentData = {
        repetition_count: data.repetition_count,
        age: data.age,
        gender: data.gender,
        knee_alignment: data.knee_alignment,
        trunk_sway: data.trunk_sway,
        hip_sway: data.hip_sway
      };
    }
  } catch (err) {
    // No previous data, that's okay
    console.log('No previous STS assessment data found');
  }
}

// Render assessment form
function renderAssessment() {
  const container = document.getElementById('assessmentContainer');
  const t_obj = translations[currentLang];

  container.innerHTML = `
    <!-- Language Toggle Bar -->
    <div class="language-bar">
      <div class="language-toggle">
        <button class="lang-btn ${currentLang === 'en' ? 'active' : ''}" data-lang="en">English</button>
        <button class="lang-btn ${currentLang === 'zh-TW' ? 'active' : ''}" data-lang="zh-TW">繁體中文</button>
      </div>
    </div>

    <div class="assessment-form">
      <p class="instructions">${t('instructions')}</p>

      <div class="info-box">
        <h3>${t('testInstructionsTitle')}</h3>
        <p>${t('testInstructionsText')}</p>
      </div>

      <form id="stsForm">
        <!-- Repetition Count -->
        <div class="form-group">
          <label for="repetitionCount">${t('repetitionLabel')} *</label>
          <input
            type="number"
            id="repetitionCount"
            name="repetitionCount"
            placeholder="${t('repetitionPlaceholder')}"
            min="0"
            value="${assessmentData.repetition_count || ''}"
            required
          >
        </div>

        <!-- Age -->
        <div class="form-group">
          <label for="age">${t('ageLabel')} *</label>
          <input
            type="number"
            id="age"
            name="age"
            placeholder="${t('agePlaceholder')}"
            min="18"
            max="120"
            value="${assessmentData.age || ''}"
            required
          >
        </div>

        <!-- Gender -->
        <div class="form-group">
          <label>${t('genderLabel')} *</label>
          <div class="radio-group">
            <label class="radio-option">
              <input
                type="radio"
                name="gender"
                value="male"
                ${assessmentData.gender === 'male' ? 'checked' : ''}
                required
              >
              ${t('genderMale')}
            </label>
            <label class="radio-option">
              <input
                type="radio"
                name="gender"
                value="female"
                ${assessmentData.gender === 'female' ? 'checked' : ''}
                required
              >
              ${t('genderFemale')}
            </label>
          </div>
        </div>

        <!-- Knee Alignment -->
        <div class="form-group">
          <label>${t('kneeAlignmentLabel')} *</label>
          <div class="radio-group">
            <label class="radio-option">
              <input
                type="radio"
                name="kneeAlignment"
                value="normal"
                ${assessmentData.knee_alignment === 'normal' ? 'checked' : ''}
                required
              >
              ${t('kneeAlignmentNormal')}
            </label>
            <label class="radio-option">
              <input
                type="radio"
                name="kneeAlignment"
                value="valgus"
                ${assessmentData.knee_alignment === 'valgus' ? 'checked' : ''}
                required
              >
              ${t('kneeAlignmentValgus')}
            </label>
            <label class="radio-option">
              <input
                type="radio"
                name="kneeAlignment"
                value="varus"
                ${assessmentData.knee_alignment === 'varus' ? 'checked' : ''}
                required
              >
              ${t('kneeAlignmentVarus')}
            </label>
          </div>
        </div>

        <!-- Core Stability Assessment -->
        <div class="form-section">
          <h3>${t('coreStabilityTitle')}</h3>
          <p class="form-subtitle">${t('coreStabilitySubtitle')}</p>

          <!-- Trunk Sway -->
          <div class="form-group">
            <label>${t('trunkSwayLabel')} *</label>
            <div class="radio-group">
              <label class="radio-option">
                <input
                  type="radio"
                  name="trunkSway"
                  value="present"
                  ${assessmentData.trunk_sway === 'present' ? 'checked' : ''}
                  required
                >
                ${t('trunkSwayPresent')}
              </label>
              <label class="radio-option">
                <input
                  type="radio"
                  name="trunkSway"
                  value="absent"
                  ${assessmentData.trunk_sway === 'absent' ? 'checked' : ''}
                  required
                >
                ${t('trunkSwayAbsent')}
              </label>
            </div>
          </div>

          <!-- Hip Sway -->
          <div class="form-group">
            <label>${t('hipSwayLabel')} *</label>
            <div class="radio-group">
              <label class="radio-option">
                <input
                  type="radio"
                  name="hipSway"
                  value="present"
                  ${assessmentData.hip_sway === 'present' ? 'checked' : ''}
                  required
                >
                ${t('hipSwayPresent')}
              </label>
              <label class="radio-option">
                <input
                  type="radio"
                  name="hipSway"
                  value="absent"
                  ${assessmentData.hip_sway === 'absent' ? 'checked' : ''}
                  required
                >
                ${t('hipSwayAbsent')}
              </label>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="button-group">
          <button type="button" class="btn btn-secondary" id="backBtn">
            ${t('backButton')}
          </button>
          <button type="submit" class="btn btn-primary">
            ${t('submitButton')}
          </button>
        </div>
      </form>
    </div>
  `;

  // Add event listeners
  document.getElementById('stsForm').addEventListener('submit', handleSubmit);
  document.getElementById('backBtn').addEventListener('click', () => {
    window.location.href = '/questionnaire.html';
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
  renderAssessment();
}

// Handle form submission
async function handleSubmit(e) {
  e.preventDefault();

  const form = e.target;
  const formData = new FormData(form);

  // Validate inputs
  const repetitionCount = parseInt(formData.get('repetitionCount'));
  const age = parseInt(formData.get('age'));
  const gender = formData.get('gender');
  const kneeAlignment = formData.get('kneeAlignment');
  const trunkSway = formData.get('trunkSway');
  const hipSway = formData.get('hipSway');

  if (!repetitionCount || repetitionCount < 0) {
    alert(t('validationRepetition'));
    return;
  }

  if (!age || age < 18 || age > 120) {
    alert(t('validationAge'));
    return;
  }

  if (!gender || !kneeAlignment || !trunkSway || !hipSway) {
    alert(t('validationRequired'));
    return;
  }

  // Update assessment data
  assessmentData = {
    repetition_count: repetitionCount,
    age: age,
    gender: gender,
    knee_alignment: kneeAlignment,
    trunk_sway: trunkSway,
    hip_sway: hipSway
  };

  // Save to database
  const success = await saveAssessment();

  if (success) {
    // Mark STS assessment as completed
    localStorage.setItem('stsAssessmentCompleted', 'true');

    // Redirect to results page
    window.location.href = '/results.html';
  } else {
    alert(t('errorSaving'));
  }
}

// Save assessment to Supabase
async function saveAssessment() {
  const currentUser = localStorage.getItem('currentUser');

  try {
    // Get user_id from users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('username', currentUser)
      .single();

    if (userError || !userData) {
      console.error('User not found:', userError);
      return false;
    }

    // Prepare STS data
    const stsData = {
      user_id: userData.id,
      username: currentUser,
      repetition_count: assessmentData.repetition_count,
      age: assessmentData.age,
      gender: assessmentData.gender,
      knee_alignment: assessmentData.knee_alignment,
      trunk_sway: assessmentData.trunk_sway,
      hip_sway: assessmentData.hip_sway
    };

    // DEBUG: Log the data being sent
    console.log('Attempting to save STS assessment:', stsData);

    // Insert or update (upsert) using username as conflict target
    const { data, error } = await supabase
      .from('sts_assessments')
      .upsert(stsData, {
        onConflict: 'username'
      })
      .select();

    if (error) {
      console.error('Supabase error details:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      console.error('Error hint:', error.hint);
      console.error('Error details:', error.details);
      return false;
    }

    console.log('STS assessment saved successfully:', data);
    return true;
  } catch (err) {
    console.error('Unexpected error:', err);
    return false;
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);
