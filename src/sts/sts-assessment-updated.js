import { supabase } from '../shared/supabase.js';
import { i18n, t } from '../shared/i18n.js';

// State
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
  // Initialize language from localStorage
  i18n.initLanguage();

  // Check if user is logged in
  const currentUser = localStorage.getItem('currentUser');
  if (!currentUser) {
    window.location.href = '/home.html';
    return;
  }

  // Check if questionnaire is completed
  const questionnaireCompleted = localStorage.getItem('questionnaire Completed');
  if (!questionnaireCompleted) {
    alert(t('stsAssessment.messages.prerequisite'));
    window.location.href = '/questionnaire.html';
    return;
  }

  // Try to load previously saved assessment data
  loadSavedData();

  // Render page header
  renderHeader();

  // Render the assessment form
  renderAssessment();
}

// Render page header
function renderHeader() {
  const header = document.getElementById('pageHeader');
  header.innerHTML = `
    <h1>${t('stsAssessment.pageTitle')}</h1>
    <p>${t('stsAssessment.pageSubtitle')}</p>
  `;
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
    console.log('No previous STS assessment data found');
  }
}

// Render assessment form
function renderAssessment() {
  const container = document.getElementById('assessmentContainer');

  container.innerHTML = `
    <!-- Language Toggle Bar -->
    <div class="language-bar">
      <div class="language-toggle">
        <button class="lang-btn ${i18n.getLanguage() === 'en' ? 'active' : ''}" data-lang="en">${t('common.language.english')}</button>
        <button class="lang-btn ${i18n.getLanguage() === 'zh-TW' ? 'active' : ''}" data-lang="zh-TW">${t('common.language.chinese')}</button>
      </div>
    </div>

    <div class="assessment-form">
      <p class="instructions">${t('stsAssessment.instructions')}</p>

      <div class="info-box">
        <h3>${t('stsAssessment.testInstructions.title')}</h3>
        <p>${t('stsAssessment.testInstructions.description')}</p>
      </div>

      <form id="stsForm">
        <!-- Repetition Count -->
        <div class="form-group">
          <label for="repetitionCount">${t('stsAssessment.form.repetitionCount.label')} *</label>
          <input
            type="number"
            id="repetitionCount"
            name="repetitionCount"
            placeholder="${t('stsAssessment.form.repetitionCount.placeholder')}"
            min="0"
            value="${assessmentData.repetition_count || ''}"
            required
          >
        </div>

        <!-- Age -->
        <div class="form-group">
          <label for="age">${t('stsAssessment.form.age.label')} *</label>
          <input
            type="number"
            id="age"
            name="age"
            placeholder="${t('stsAssessment.form.age.placeholder')}"
            min="18"
            max="120"
            value="${assessmentData.age || ''}"
            required
          >
        </div>

        <!-- Gender -->
        <div class="form-group">
          <label>${t('stsAssessment.form.gender.label')} *</label>
          <div class="radio-group">
            <label class="radio-option">
              <input
                type="radio"
                name="gender"
                value="male"
                ${assessmentData.gender === 'male' ? 'checked' : ''}
                required
              >
              ${t('common.gender.male')}
            </label>
            <label class="radio-option">
              <input
                type="radio"
                name="gender"
                value="female"
                ${assessmentData.gender === 'female' ? 'checked' : ''}
                required
              >
              ${t('common.gender.female')}
            </label>
          </div>
        </div>

        <!-- Knee Alignment -->
        <div class="form-group">
          <label>${t('stsAssessment.form.kneeAlignment.label')} *</label>
          <div class="radio-group">
            <label class="radio-option">
              <input
                type="radio"
                name="kneeAlignment"
                value="normal"
                ${assessmentData.knee_alignment === 'normal' ? 'checked' : ''}
                required
              >
              ${t('stsAssessment.form.kneeAlignment.normal')}
            </label>
            <label class="radio-option">
              <input
                type="radio"
                name="kneeAlignment"
                value="valgus"
                ${assessmentData.knee_alignment === 'valgus' ? 'checked' : ''}
                required
              >
              ${t('stsAssessment.form.kneeAlignment.valgus')}
            </label>
            <label class="radio-option">
              <input
                type="radio"
                name="kneeAlignment"
                value="varus"
                ${assessmentData.knee_alignment === 'varus' ? 'checked' : ''}
                required
              >
              ${t('stsAssessment.form.kneeAlignment.varus')}
            </label>
          </div>
        </div>

        <!-- Core Stability Assessment -->
        <div class="form-section">
          <h3>${t('stsAssessment.form.coreStability.title')}</h3>
          <p class="form-subtitle">${t('stsAssessment.form.coreStability.subtitle')}</p>

          <!-- Trunk Sway -->
          <div class="form-group">
            <label>${t('stsAssessment.form.coreStability.trunkSway')} *</label>
            <div class="radio-group">
              <label class="radio-option">
                <input
                  type="radio"
                  name="trunkSway"
                  value="present"
                  ${assessmentData.trunk_sway === 'present' ? 'checked' : ''}
                  required
                >
                ${t('common.status.present')}
              </label>
              <label class="radio-option">
                <input
                  type="radio"
                  name="trunkSway"
                  value="absent"
                  ${assessmentData.trunk_sway === 'absent' ? 'checked' : ''}
                  required
                >
                ${t('common.status.absent')}
              </label>
            </div>
          </div>

          <!-- Hip Sway -->
          <div class="form-group">
            <label>${t('stsAssessment.form.coreStability.hipSway')} *</label>
            <div class="radio-group">
              <label class="radio-option">
                <input
                  type="radio"
                  name="hipSway"
                  value="present"
                  ${assessmentData.hip_sway === 'present' ? 'checked' : ''}
                  required
                >
                ${t('common.status.present')}
              </label>
              <label class="radio-option">
                <input
                  type="radio"
                  name="hipSway"
                  value="absent"
                  ${assessmentData.hip_sway === 'absent' ? 'checked' : ''}
                  required
                >
                ${t('common.status.absent')}
              </label>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="button-group">
          <button type="button" class="btn btn-secondary" id="backBtn">
            ${t('stsAssessment.backButton')}
          </button>
          <button type="submit" class="btn btn-primary">
            ${t('stsAssessment.submitButton')}
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
  i18n.setLanguage(lang);
  renderHeader();
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
    alert(t('stsAssessment.validation.invalidRepetition'));
    return;
  }

  if (!age || age < 18 || age > 120) {
    alert(t('stsAssessment.validation.invalidAge'));
    return;
  }

  if (!gender || !kneeAlignment || !trunkSway || !hipSway) {
    alert(t('stsAssessment.validation.allRequired'));
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
    alert(t('stsAssessment.messages.saveError'));
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
