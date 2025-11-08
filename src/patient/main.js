import { supabase } from '../shared/supabase.js';
import { storage } from '../shared/storage.js';
import { generateUUID } from '../shared/utils.js';
import { requiredQuestions } from './questionnaire-data.js';
import { calculatePositionMultipliers, validateResponses } from './calculations.js';
import { translations, questionTranslations, getTranslation, getQuestionTranslation } from './translations.js';
import QRCode from 'qrcode';

// State
let responses = {};
let currentPage = 'questionnaire'; // 'questionnaire' or 'result'
let currentLang = 'zh-TW'; // Default to Traditional Chinese

// Initialize app
function init() {
  // Detect browser language and set default
  const browserLang = navigator.language || navigator.userLanguage;
  const savedLang = localStorage.getItem('patient_language');

  if (savedLang) {
    currentLang = savedLang;
  } else if (browserLang && (browserLang.includes('zh') || browserLang.includes('tw') || browserLang.includes('hk'))) {
    currentLang = 'zh-TW';
  } else {
    currentLang = 'zh-TW'; // Default to Chinese
  }

  // Restore saved progress
  const saved = storage.getQuestionnaireProgress();
  if (saved && saved.responses) {
    responses = saved.responses;
  }

  renderQuestionnaire();
  updateProgress();
}

// Switch language
function switchLanguage(newLang) {
  currentLang = newLang;
  localStorage.setItem('patient_language', newLang);
  renderQuestionnaire();
  updateProgress();
}

// Render questionnaire form
function renderQuestionnaire() {
  const app = document.getElementById('app');
  const t = translations[currentLang];

  // Language toggle bar
  let html = `
    <div class="language-bar">
      <div class="language-toggle">
        <button class="lang-btn ${currentLang === 'en' ? 'active' : ''}" data-lang="en">English</button>
        <button class="lang-btn ${currentLang === 'zh-TW' ? 'active' : ''}" data-lang="zh-TW">繁體中文</button>
      </div>
    </div>

    <div class="progress-container">
      <div class="progress-bar">
        <div class="progress-fill" id="progressFill" style="width: 0%"></div>
      </div>
      <p class="progress-text" id="progressText">0 / ${requiredQuestions.length} ${t.progressText}</p>
    </div>

    <form id="questionnaireForm">
  `;

  // Pain Questions Section
  html += `<div class="question-section">`;
  html += `<h2>${t.painQuestions.title}</h2>`;
  html += `<p style="color: var(--text-light); margin-bottom: 20px;"><em>${t.painQuestions.description}</em></p>`;
  ['P1', 'P2', 'P5', 'P6', 'P9'].forEach(code => {
    html += renderQuestionBilingual(code);
  });
  html += `</div>`;

  // Symptom Questions Section
  html += `<div class="question-section">`;
  html += `<h2>${t.symptomQuestions.title}</h2>`;
  html += `<p style="color: var(--text-light); margin-bottom: 20px;"><em>${t.symptomQuestions.description}</em></p>`;
  ['S1', 'S2', 'S3', 'S4', 'S5'].forEach(code => {
    html += renderQuestionBilingual(code);
  });
  html += `</div>`;

  // Position-Specific Core Questions Section
  html += `<div class="question-section">`;
  html += `<h2>${t.positionSpecificQuestions.title}</h2>`;
  html += `<p style="color: var(--text-light); margin-bottom: 20px;"><em>${t.positionSpecificQuestions.description}</em></p>`;

  // Shared by 3 positions
  html += `<h3 class="subsection-title">${t.sharedBy3Positions}</h3>`;
  html += renderQuestionBilingual('SP1');

  // Shared by split_stand & SL_stand
  html += `<h3 class="subsection-title">${t.sharedBySplitAndSingle}</h3>`;
  ['F1', 'F2', 'SP4'].forEach(code => {
    html += renderQuestionBilingual(code);
  });

  // Shared by DL_stand & split_stand
  html += `<h3 class="subsection-title">${t.sharedByDoubleAndSplit}</h3>`;
  html += renderQuestionBilingual('F3');

  // Shared by DL_stand & SL_stand
  html += `<h3 class="subsection-title">${t.sharedByDoubleAndSingle}</h3>`;
  html += renderQuestionBilingual('F4');

  // Shared by DL_stand & quadruped
  html += `<h3 class="subsection-title">${t.sharedByDoubleAndQuad}</h3>`;
  html += renderQuestionBilingual('F5');

  // DL_stand unique
  html += `<h3 class="subsection-title">${t.uniqueToDouble}</h3>`;
  ['F6', 'F8'].forEach(code => {
    html += renderQuestionBilingual(code);
  });

  // split_stand unique
  html += `<h3 class="subsection-title">${t.uniqueToSplit}</h3>`;
  ['F7', 'F13', 'F15'].forEach(code => {
    html += renderQuestionBilingual(code);
  });

  // SL_stand unique
  html += `<h3 class="subsection-title">${t.uniqueToSingle}</h3>`;
  ['F9', 'F11', 'SP2', 'SP3'].forEach(code => {
    html += renderQuestionBilingual(code);
  });

  // quadruped unique
  html += `<h3 class="subsection-title">${t.uniqueToQuad}</h3>`;
  ['SP5', 'ST2', 'P3', 'P4'].forEach(code => {
    html += renderQuestionBilingual(code);
  });

  html += `</div>`;

  html += `
      <div class="submit-container">
        <button type="submit" class="btn btn-secondary btn-large" id="submitBtn" disabled>
          ${t.submitButton}
        </button>
      </div>
    </form>
  `;

  app.innerHTML = html;

  // Add event listeners
  document.getElementById('questionnaireForm').addEventListener('submit', handleSubmit);

  // Language toggle listeners
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      switchLanguage(btn.dataset.lang);
    });
  });

  // Add listeners to all radio buttons
  document.querySelectorAll('.option').forEach(option => {
    option.addEventListener('click', handleOptionClick);
  });

  // Restore selected answers
  restoreAnswers();
}

// Render a single question with bilingual support
function renderQuestionBilingual(code) {
  const questionData = getQuestionTranslation(code, currentLang);
  const isAnswered = responses[code] !== undefined;

  let html = `
    <div class="question" data-code="${code}">
      <div class="question-code">[${code}]${questionData.note ? ' ' + questionData.note : ''}</div>
      <div class="question-text">${questionData.text}</div>
      <div class="options">
  `;

  questionData.options.forEach((optionLabel, index) => {
    const isSelected = responses[code] === index;
    html += `
      <label class="option ${isSelected ? 'selected' : ''}" data-code="${code}" data-value="${index}">
        <input type="radio" name="${code}" value="${index}" ${isSelected ? 'checked' : ''}>
        ${optionLabel} (${index})
      </label>
    `;
  });

  html += `
      </div>
    </div>
  `;

  return html;
}

// Handle option click
function handleOptionClick(e) {
  const option = e.currentTarget;
  const code = option.dataset.code;
  const value = parseInt(option.dataset.value);

  // Update response
  responses[code] = value;

  // Update UI
  const allOptions = document.querySelectorAll(`.option[data-code="${code}"]`);
  allOptions.forEach(opt => opt.classList.remove('selected'));
  option.classList.add('selected');

  // Check the radio button
  const radio = option.querySelector('input[type="radio"]');
  if (radio) radio.checked = true;

  // Save progress
  storage.saveQuestionnaireProgress({ responses });

  // Update progress
  updateProgress();
}

// Restore saved answers
function restoreAnswers() {
  Object.entries(responses).forEach(([code, value]) => {
    const option = document.querySelector(`.option[data-code="${code}"][data-value="${value}"]`);
    if (option) {
      option.classList.add('selected');
      const radio = option.querySelector('input[type="radio"]');
      if (radio) radio.checked = true;
    }
  });
}

// Update progress bar and button
function updateProgress() {
  const validation = validateResponses(responses, requiredQuestions);
  const percentage = (validation.totalAnswered / validation.totalRequired) * 100;
  const t = translations[currentLang];

  const progressFill = document.getElementById('progressFill');
  const progressText = document.getElementById('progressText');
  const submitBtn = document.getElementById('submitBtn');

  if (progressFill) {
    progressFill.style.width = `${percentage}%`;
  }

  if (progressText) {
    progressText.textContent = `${validation.totalAnswered} / ${validation.totalRequired} ${t.progressText}`;
  }

  if (submitBtn) {
    submitBtn.disabled = !validation.isValid;
    if (validation.isValid) {
      submitBtn.textContent = `${t.submitButton} ✓`;
    } else {
      submitBtn.textContent = `${t.submitButton} (${validation.totalAnswered}/${validation.totalRequired})`;
    }
  }
}

// Handle form submission
async function handleSubmit(e) {
  e.preventDefault();

  const validation = validateResponses(responses, requiredQuestions);
  if (!validation.isValid) {
    alert('Please answer all questions before submitting.');
    return;
  }

  // Show loading
  const submitBtn = document.getElementById('submitBtn');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Calculating...';

  try {
    // Calculate position multipliers
    const multipliers = calculatePositionMultipliers(responses);

    // Generate UUID
    const assessmentId = generateUUID();

    // Prepare data for Supabase
    const assessmentData = {
      id: assessmentId,
      position_sl_stand_multiplier: multipliers.position_sl_stand_multiplier,
      position_split_stand_multiplier: multipliers.position_split_stand_multiplier,
      position_dl_stand_multiplier: multipliers.position_dl_stand_multiplier,
      position_quadruped_multiplier: multipliers.position_quadruped_multiplier,
      position_lying_multiplier: multipliers.position_lying_multiplier,
      questionnaire_completed_at: new Date().toISOString()
    };

    // Insert into Supabase
    const { data, error } = await supabase
      .from('assessments')
      .insert([assessmentData])
      .select();

    if (error) {
      console.error('Supabase error:', error);
      throw new Error('Failed to save assessment. Please try again.');
    }

    console.log('Assessment saved:', data);

    // Clear saved progress
    storage.clearQuestionnaireProgress();

    // Show result page with QR code
    showResultPage(assessmentId);

  } catch (error) {
    console.error('Submission error:', error);
    alert(error.message || 'An error occurred. Please try again.');
    submitBtn.disabled = false;
    submitBtn.textContent = 'Submit Questionnaire ✓';
  }
}

// Show result page with QR code
async function showResultPage(assessmentId) {
  const app = document.getElementById('app');
  const t = translations[currentLang];

  app.innerHTML = `
    <div class="qr-container">
      <h2>${t.resultTitle}</h2>
      <p style="font-size: 18px; margin: 20px 0; color: var(--text-color);">
        ${t.resultSubtitle}
      </p>

      <div id="qrcode"></div>

      <div style="margin-top: 30px;">
        <p style="font-weight: 600; margin-bottom: 10px;">${t.assessmentId}</p>
        <div class="uuid-text">${assessmentId}</div>
        <p style="font-size: 14px; color: var(--text-light); margin-top: 10px;">
          ${t.manualIdNote}
        </p>
      </div>

      <div style="margin-top: 40px;">
        <p style="font-size: 14px; color: var(--text-light); white-space: pre-line;">
          ${t.saveInstructions}
        </p>
      </div>
    </div>
  `;

  // Generate QR code
  const qrElement = document.getElementById('qrcode');
  try {
    await QRCode.toCanvas(assessmentId, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    }).then(canvas => {
      qrElement.appendChild(canvas);
    });
  } catch (error) {
    console.error('QR code generation error:', error);
    qrElement.innerHTML = '<p style="color: var(--danger-color);">QR code generation failed. Please use the ID above.</p>';
  }
}

// Start the app
init();
