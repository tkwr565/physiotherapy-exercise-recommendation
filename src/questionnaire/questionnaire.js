import { supabase } from '../shared/supabase.js';
import { questionnaireData, requiredQuestions } from '../patient/questionnaire-data.js';
import { translations, questionTranslations, getTranslation, getQuestionTranslation } from '../patient/translations.js';

// State
let responses = {};
let toeTouch = null; // 'can' or 'cannot'
let currentLang = 'zh-TW'; // Default to Traditional Chinese

// Initialize app
function init() {
  // Check if user is logged in
  const currentUser = localStorage.getItem('currentUser');
  if (!currentUser) {
    // Not logged in, redirect to home
    window.location.href = '/home.html';
    return;
  }

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

  // Try to restore previous progress
  loadSavedProgress();

  renderQuestionnaire();
  updateProgress();
}

// Load saved progress from localStorage
function loadSavedProgress() {
  const savedResponses = localStorage.getItem('questionnaire_responses');
  const savedToeTouch = localStorage.getItem('questionnaire_toe_touch');

  if (savedResponses) {
    try {
      responses = JSON.parse(savedResponses);
    } catch (e) {
      console.error('Error loading saved responses:', e);
      responses = {};
    }
  }

  if (savedToeTouch) {
    toeTouch = savedToeTouch;
  }
}

// Save progress to localStorage
function saveProgress() {
  localStorage.setItem('questionnaire_responses', JSON.stringify(responses));
  if (toeTouch) {
    localStorage.setItem('questionnaire_toe_touch', toeTouch);
  }
}

// Clear saved progress
function clearProgress() {
  localStorage.removeItem('questionnaire_responses');
  localStorage.removeItem('questionnaire_toe_touch');
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
      <p class="progress-text" id="progressText">0 / ${requiredQuestions.length + 1} ${t.progressText}</p>
    </div>

    <form id="questionnaireForm">
  `;

  // Render sections from questionnaireData
  questionnaireData.sections.forEach(section => {
    html += `<div class="question-section">`;
    html += `<h2>${t[section.id + 'Questions']?.title || section.title}</h2>`;

    // Use translated description if available
    const translatedDescription = t[section.id + 'Questions']?.description;
    if (translatedDescription) {
      html += `<p style="color: var(--text-light); margin-bottom: 20px;"><em>${translatedDescription}</em></p>`;
    }

    if (section.questions) {
      // Simple section with direct questions
      section.questions.forEach(q => {
        html += renderQuestionBilingual(q.code);
      });
    } else if (section.subsections) {
      // Section with subsections (core questions)
      section.subsections.forEach(subsection => {
        // Translate subsection titles
        const subsectionKey = subsection.title.includes('🔗 Shared by 3') ? 'sharedBy3Positions' :
                             subsection.title.includes('split_stand & SL_stand') ? 'sharedBySplitAndSingle' :
                             subsection.title.includes('DL_stand & split_stand') ? 'sharedByDoubleAndSplit' :
                             subsection.title.includes('DL_stand & SL_stand') ? 'sharedByDoubleAndSingle' :
                             subsection.title.includes('DL_stand & quadruped') ? 'sharedByDoubleAndQuad' :
                             subsection.title.includes('DL_stand Unique') ? 'uniqueToDouble' :
                             subsection.title.includes('split_stand Unique') ? 'uniqueToSplit' :
                             subsection.title.includes('SL_stand Unique') ? 'uniqueToSingle' :
                             subsection.title.includes('quadruped Unique') ? 'uniqueToQuad' : null;

        const translatedSubsectionTitle = subsectionKey ? t[subsectionKey] : subsection.title;
        html += `<h3 class="subsection-title">${translatedSubsectionTitle}</h3>`;
        subsection.questions.forEach(q => {
          html += renderQuestionBilingual(q.code);
        });
      });
    }

    html += `</div>`;
  });

  // NEW: Toe Touch Test Section
  html += `<div class="question-section">`;
  html += `<h2>${currentLang === 'zh-TW' ? '柔軟度評估' : 'Flexibility Assessment'}</h2>`;
  html += `<p style="color: var(--text-light); margin-bottom: 20px;"><em>${
    currentLang === 'zh-TW'
      ? '此問題用於評估您的後腿肌肉和下背部的柔軟度。'
      : 'This question assesses your hamstring and lower back flexibility.'
  }</em></p>`;

  html += `
    <div class="question" data-code="toe_touch">
      <div class="question-code">[FLEX]</div>
      <div class="question-text">${
        currentLang === 'zh-TW'
          ? '您能在雙腿伸直站立時觸摸到腳趾嗎？'
          : 'Can you touch your toes while standing with straight legs?'
      }</div>
      <div class="options">
        <label class="option ${toeTouch === 'can' ? 'selected' : ''}" data-code="toe_touch" data-value="can">
          <input type="radio" name="toe_touch" value="can" ${toeTouch === 'can' ? 'checked' : ''}>
          ${currentLang === 'zh-TW' ? '可以' : 'Can'}
        </label>
        <label class="option ${toeTouch === 'cannot' ? 'selected' : ''}" data-code="toe_touch" data-value="cannot">
          <input type="radio" name="toe_touch" value="cannot" ${toeTouch === 'cannot' ? 'checked' : ''}>
          ${currentLang === 'zh-TW' ? '不可以' : 'Cannot'}
        </label>
      </div>
    </div>
  `;
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
    const value = index; // Use 0-based indexing (0-4) for KOOS/WOMAC scoring
    const isSelected = responses[code] === value;
    html += `
      <label class="option ${isSelected ? 'selected' : ''}" data-code="${code}" data-value="${value}">
        <input type="radio" name="${code}" value="${value}" ${isSelected ? 'checked' : ''}>
        ${optionLabel}
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
  const value = option.dataset.value;

  if (code === 'toe_touch') {
    // Handle toe touch test
    toeTouch = value;
  } else {
    // Handle regular question
    responses[code] = parseInt(value);
  }

  // Update UI
  const allOptions = document.querySelectorAll(`.option[data-code="${code}"]`);
  allOptions.forEach(opt => opt.classList.remove('selected'));
  option.classList.add('selected');

  // Check the radio button
  const radio = option.querySelector('input[type="radio"]');
  if (radio) radio.checked = true;

  // Save progress
  saveProgress();

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

  // Restore toe touch
  if (toeTouch) {
    const option = document.querySelector(`.option[data-code="toe_touch"][data-value="${toeTouch}"]`);
    if (option) {
      option.classList.add('selected');
      const radio = option.querySelector('input[type="radio"]');
      if (radio) radio.checked = true;
    }
  }
}

// Update progress bar and button
function updateProgress() {
  const totalRequired = requiredQuestions.length + 1; // 42 KOOS/WOMAC questions + toe touch
  const answeredQuestions = requiredQuestions.filter(q => responses[q] !== undefined).length;
  const toeTouchAnswered = toeTouch !== null ? 1 : 0;
  const totalAnswered = answeredQuestions + toeTouchAnswered;

  const percentage = (totalAnswered / totalRequired) * 100;
  const t = translations[currentLang];

  const progressFill = document.getElementById('progressFill');
  const progressText = document.getElementById('progressText');
  const submitBtn = document.getElementById('submitBtn');

  if (progressFill) {
    progressFill.style.width = `${percentage}%`;
  }

  if (progressText) {
    progressText.textContent = `${totalAnswered} / ${totalRequired} ${t.progressText}`;
  }

  if (submitBtn) {
    const isValid = totalAnswered === totalRequired;
    submitBtn.disabled = !isValid;
    if (isValid) {
      submitBtn.textContent = `${t.submitButton} ✓`;
    } else {
      submitBtn.textContent = `${t.submitButton} (${totalAnswered}/${totalRequired})`;
    }
  }
}

// Validate responses
function validateResponses() {
  const missingQuestions = requiredQuestions.filter(q => responses[q] === undefined);
  const toeTouchMissing = toeTouch === null;

  return {
    isValid: missingQuestions.length === 0 && !toeTouchMissing,
    totalRequired: requiredQuestions.length + 1,
    totalAnswered: requiredQuestions.length - missingQuestions.length + (toeTouchMissing ? 0 : 1),
    missingQuestions: toeTouchMissing ? [...missingQuestions, 'toe_touch'] : missingQuestions
  };
}

// Handle form submission
async function handleSubmit(e) {
  e.preventDefault();

  const validation = validateResponses();
  if (!validation.isValid) {
    alert(`Please answer all questions before submitting. Missing: ${validation.missingQuestions.join(', ')}`);
    return;
  }

  const currentUser = localStorage.getItem('currentUser');
  if (!currentUser) {
    alert('Session expired. Please log in again.');
    window.location.href = '/home.html';
    return;
  }

  // Show loading
  const submitBtn = document.getElementById('submitBtn');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Saving...';

  try {
    // Fetch user_id from users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('username', currentUser)
      .single();

    if (userError || !userData) {
      throw new Error('User not found. Please log in again.');
    }

    // Convert all response keys to lowercase for database
    const lowercaseResponses = {};
    Object.keys(responses).forEach(key => {
      lowercaseResponses[key.toLowerCase()] = responses[key];
    });

    // Prepare data for Supabase questionnaire_responses table
    const questionnaireData = {
      user_id: userData.id,
      username: currentUser,
      // All 30 KOOS/WOMAC questions (lowercase keys)
      ...lowercaseResponses,
      // NEW: Toe touch flexibility test
      toe_touch_test: toeTouch,
      completed_at: new Date().toISOString()
    };

    // DEBUG: Log the data being sent
    console.log('Attempting to save questionnaire data:', questionnaireData);
    console.log('User ID:', userData.id);
    console.log('Username:', currentUser);
    console.log('Response count:', Object.keys(lowercaseResponses).length);
    console.log('Toe touch:', toeTouch);

    // Insert or update questionnaire responses
    const { data, error } = await supabase
      .from('questionnaire_responses')
      .upsert(questionnaireData, { onConflict: 'username' })
      .select();

    if (error) {
      console.error('Supabase error details:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      console.error('Error hint:', error.hint);
      console.error('Error details:', error.details);
      throw new Error(`Failed to save questionnaire: ${error.message || 'Unknown error'}`);
    }

    console.log('Questionnaire saved successfully:', data);

    // Clear saved progress
    clearProgress();

    // Mark questionnaire as completed
    localStorage.setItem('questionnaireCompleted', 'true');

    // Redirect to STS assessment page
    window.location.href = '/sts-assessment.html';

  } catch (error) {
    console.error('Submission error:', error);
    alert(error.message || 'An error occurred. Please try again.');
    submitBtn.disabled = false;
    submitBtn.textContent = translations[currentLang].submitButton + ' ✓';
  }
}

// Start the app
init();
