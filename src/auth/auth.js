import { supabase } from '../shared/supabase.js';

// Get passcode from environment
const PASSCODE = import.meta.env.VITE_PHYSIO_PASSCODE;

// Translations
const translations = {
  'en': {
    // Header
    pageTitle: 'Physiotherapy Exercise Recommendation',
    pageSubtitle: 'Knee Osteoarthritis Assessment System',

    // Passcode Screen
    passcodeTitle: 'Access Control',
    passcodeSubtitle: 'Please enter the passcode to continue',
    passcodeLabel: 'Passcode',
    passcodePlaceholder: 'Enter passcode',
    passcodeButton: 'Continue',
    passcodeErrorEmpty: 'Please enter a passcode',
    passcodeErrorIncorrect: 'Incorrect passcode. Please try again.',

    // Username Screen
    usernameTitle: 'Welcome',
    usernameSubtitle: 'Enter your username to begin your assessment',
    usernameLabel: 'Username',
    usernamePlaceholder: 'Enter your username',
    usernameHint: '3-50 characters, letters and numbers only',
    usernameButton: 'Continue to Assessment',
    usernameButtonLogin: 'Login to Existing Account',
    usernameButtonCreate: 'Create New Account',
    usernameStatusChecking: 'Checking...',
    usernameStatusExisting: '✓ Existing account - Logging in',
    usernameStatusAvailable: '✓ Available - Creating new account',
    usernameErrorEmpty: 'Please enter a username',
    usernameErrorLength: 'Username must be between 3 and 50 characters',
    usernameErrorFormat: 'Username can only contain letters, numbers, hyphens, and underscores',
    usernameErrorGeneral: 'An error occurred. Please try again.',

    // Info Boxes
    aboutTitle: 'About This System',
    aboutItem1: 'KOOS/WOMAC questionnaire assessment',
    aboutItem2: '30-second sit-to-stand test',
    aboutItem3: 'Personalized exercise recommendations',
    aboutItem4: 'Evidence-based biomechanical targeting',

    whatToExpectTitle: 'What to Expect',
    expectItem1: 'Page 1: Answer 30 questionnaire questions',
    expectItem2: 'Page 2: Complete sit-to-stand test',
    expectItem3: 'Page 3: View your personalized exercises'
  },
  'zh-TW': {
    // Header
    pageTitle: '物理治療運動建議系統',
    pageSubtitle: '膝關節骨性關節炎評估系統',

    // Passcode Screen
    passcodeTitle: '訪問控制',
    passcodeSubtitle: '請輸入密碼以繼續',
    passcodeLabel: '密碼',
    passcodePlaceholder: '輸入密碼',
    passcodeButton: '繼續',
    passcodeErrorEmpty: '請輸入密碼',
    passcodeErrorIncorrect: '密碼錯誤。請重試。',

    // Username Screen
    usernameTitle: '歡迎',
    usernameSubtitle: '輸入您的用戶名以開始評估',
    usernameLabel: '用戶名',
    usernamePlaceholder: '輸入您的用戶名',
    usernameHint: '3-50個字符，僅限字母和數字',
    usernameButton: '繼續評估',
    usernameButtonLogin: '登入現有帳戶',
    usernameButtonCreate: '創建新帳戶',
    usernameStatusChecking: '檢查中...',
    usernameStatusExisting: '✓ 現有帳戶 - 登入中',
    usernameStatusAvailable: '✓ 可用 - 創建新帳戶',
    usernameErrorEmpty: '請輸入用戶名',
    usernameErrorLength: '用戶名必須介於3到50個字符之間',
    usernameErrorFormat: '用戶名只能包含字母、數字、連字符和下劃線',
    usernameErrorGeneral: '發生錯誤。請重試。',

    // Info Boxes
    aboutTitle: '關於本系統',
    aboutItem1: 'KOOS/WOMAC問卷評估',
    aboutItem2: '30秒坐站測試',
    aboutItem3: '個人化運動建議',
    aboutItem4: '基於證據的生物力學目標定位',

    whatToExpectTitle: '評估流程',
    expectItem1: '第1步：回答30個問卷問題',
    expectItem2: '第2步：完成坐站測試',
    expectItem3: '第3步：查看您的個人化運動'
  }
};

// State
let currentStep = 'passcode'; // 'passcode' or 'username'
let currentLang = localStorage.getItem('patient_language') || 'zh-TW';

// Translation helper
function t(key) {
  return translations[currentLang][key] || key;
}

// Initialize
function init() {
  // Set language
  currentLang = localStorage.getItem('patient_language') || 'zh-TW';

  // Render header and language toggle
  renderHeader();

  // Check for logout parameter
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('logout') === 'true') {
    // Clear localStorage and show login
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userId');
    // Remove the logout parameter from URL
    window.history.replaceState({}, document.title, '/home.html');
    renderPasscodeScreen();
    return;
  }

  // Check if user is already logged in
  const currentUser = localStorage.getItem('currentUser');
  if (currentUser) {
    // User already logged in, redirect to questionnaire
    window.location.href = '/questionnaire.html';
    return;
  }

  renderPasscodeScreen();
}

// Render header with language toggle
function renderHeader() {
  const header = document.querySelector('.header');

  header.innerHTML = `
    <div class="header-content">
      <div>
        <h1>${t('pageTitle')}</h1>
        <p>${t('pageSubtitle')}</p>
      </div>
      <div class="language-toggle">
        <button class="lang-btn ${currentLang === 'en' ? 'active' : ''}" data-lang="en">English</button>
        <button class="lang-btn ${currentLang === 'zh-TW' ? 'active' : ''}" data-lang="zh-TW">繁體中文</button>
      </div>
    </div>
  `;

  // Add language toggle listeners
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      switchLanguage(btn.dataset.lang);
    });
  });
}

// Switch language
function switchLanguage(lang) {
  // Save current form values before switching
  let savedPasscode = '';
  let savedUsername = '';

  if (currentStep === 'passcode') {
    savedPasscode = document.getElementById('passcode')?.value || '';
  } else {
    savedUsername = document.getElementById('username')?.value || '';
  }

  currentLang = lang;
  localStorage.setItem('patient_language', lang);
  renderHeader();

  // Re-render the current screen
  if (currentStep === 'passcode') {
    renderPasscodeScreen();
    // Restore passcode value
    if (savedPasscode) {
      document.getElementById('passcode').value = savedPasscode;
    }
  } else {
    renderUsernameScreen();
    // Restore username value and trigger availability check
    if (savedUsername) {
      const usernameInput = document.getElementById('username');
      usernameInput.value = savedUsername;
      // Trigger username availability check
      checkUsernameAvailability(savedUsername);
    }
  }
}

// Render passcode entry screen
function renderPasscodeScreen() {
  const app = document.getElementById('app');

  app.innerHTML = `
    <div class="auth-container">
      <div class="auth-title">${t('passcodeTitle')}</div>
      <div class="auth-subtitle">${t('passcodeSubtitle')}</div>

      <form id="passcodeForm" class="auth-form">
        <div class="form-group">
          <label for="passcode" class="form-label">${t('passcodeLabel')}</label>
          <input
            type="password"
            id="passcode"
            class="form-input"
            placeholder="${t('passcodePlaceholder')}"
            autocomplete="off"
            required
          />
        </div>

        <div id="passcodeError" class="form-error"></div>

        <button type="submit" class="auth-button" id="passcodeBtn">
          ${t('passcodeButton')}
        </button>
      </form>

      <div class="info-box">
        <h3>${t('aboutTitle')}</h3>
        <ul>
          <li>${t('aboutItem1')}</li>
          <li>${t('aboutItem2')}</li>
          <li>${t('aboutItem3')}</li>
          <li>${t('aboutItem4')}</li>
        </ul>
      </div>
    </div>
  `;

  // Add event listener
  document.getElementById('passcodeForm').addEventListener('submit', handlePasscodeSubmit);

  // Focus on passcode field
  document.getElementById('passcode').focus();
}

// Handle passcode submission
async function handlePasscodeSubmit(e) {
  e.preventDefault();

  const passcodeInput = document.getElementById('passcode');
  const passcodeBtn = document.getElementById('passcodeBtn');
  const errorDiv = document.getElementById('passcodeError');
  const enteredPasscode = passcodeInput.value.trim();

  // Clear previous error
  errorDiv.classList.remove('visible');
  errorDiv.textContent = '';
  passcodeInput.classList.remove('error');

  // Validate passcode
  if (!enteredPasscode) {
    showError(t('passcodeErrorEmpty'), passcodeInput, errorDiv);
    return;
  }

  if (enteredPasscode !== PASSCODE) {
    showError(t('passcodeErrorIncorrect'), passcodeInput, errorDiv);
    passcodeInput.value = '';
    passcodeInput.focus();
    return;
  }

  // Passcode correct, show username screen
  currentStep = 'username';
  renderUsernameScreen();
}

// Render username entry screen
function renderUsernameScreen() {
  const app = document.getElementById('app');

  app.innerHTML = `
    <div class="auth-container">
      <div class="auth-title">${t('usernameTitle')}</div>
      <div class="auth-subtitle">${t('usernameSubtitle')}</div>

      <form id="usernameForm" class="auth-form">
        <div class="form-group">
          <label for="username" class="form-label">${t('usernameLabel')}</label>
          <input
            type="text"
            id="username"
            class="form-input"
            placeholder="${t('usernamePlaceholder')}"
            autocomplete="username"
            minlength="3"
            maxlength="50"
            required
          />
          <span class="form-hint">${t('usernameHint')}</span>
          <div id="usernameStatus" class="form-status"></div>
        </div>

        <div id="usernameError" class="form-error"></div>

        <button type="submit" class="auth-button" id="usernameBtn">
          ${t('usernameButton')}
        </button>
      </form>

      <div class="info-box">
        <h3>${t('whatToExpectTitle')}</h3>
        <ul>
          <li>${t('expectItem1')}</li>
          <li>${t('expectItem2')}</li>
          <li>${t('expectItem3')}</li>
        </ul>
      </div>
    </div>
  `;

  // Add event listeners
  const usernameInput = document.getElementById('username');

  document.getElementById('usernameForm').addEventListener('submit', handleUsernameSubmit);

  // Add real-time username checking with debounce
  let debounceTimer;
  usernameInput.addEventListener('input', (e) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      checkUsernameAvailability(e.target.value.trim());
    }, 500); // Wait 500ms after user stops typing
  });

  // Focus on username field
  usernameInput.focus();
}

// Check username availability in real-time
async function checkUsernameAvailability(username) {
  const statusDiv = document.getElementById('usernameStatus');
  const usernameBtn = document.getElementById('usernameBtn');

  // Clear status if username is too short
  if (!username || username.length < 3) {
    statusDiv.textContent = '';
    statusDiv.className = 'form-status';
    usernameBtn.textContent = t('usernameButton');
    return;
  }

  // Validate format
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    statusDiv.textContent = '';
    statusDiv.className = 'form-status';
    usernameBtn.textContent = t('usernameButton');
    return;
  }

  // Show checking state
  statusDiv.textContent = t('usernameStatusChecking');
  statusDiv.className = 'form-status checking';

  try {
    // Check if username exists
    const { data: existingUser, error } = await supabase
      .from('users')
      .select('username')
      .eq('username', username)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    if (existingUser) {
      // Username exists - logging in
      statusDiv.textContent = t('usernameStatusExisting');
      statusDiv.className = 'form-status existing';
      usernameBtn.textContent = t('usernameButtonLogin');
    } else {
      // Username available - creating new
      statusDiv.textContent = t('usernameStatusAvailable');
      statusDiv.className = 'form-status available';
      usernameBtn.textContent = t('usernameButtonCreate');
    }
  } catch (error) {
    console.error('Error checking username:', error);
    statusDiv.textContent = '';
    statusDiv.className = 'form-status';
    usernameBtn.textContent = t('usernameButton');
  }
}

// Handle username submission
async function handleUsernameSubmit(e) {
  e.preventDefault();

  const usernameInput = document.getElementById('username');
  const usernameBtn = document.getElementById('usernameBtn');
  const errorDiv = document.getElementById('usernameError');
  const username = usernameInput.value.trim();

  // Clear previous error
  errorDiv.classList.remove('visible');
  errorDiv.textContent = '';
  usernameInput.classList.remove('error');

  // Validate username format
  if (!username) {
    showError(t('usernameErrorEmpty'), usernameInput, errorDiv);
    return;
  }

  if (username.length < 3 || username.length > 50) {
    showError(t('usernameErrorLength'), usernameInput, errorDiv);
    return;
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    showError(t('usernameErrorFormat'), usernameInput, errorDiv);
    return;
  }

  // Show loading state
  usernameBtn.disabled = true;
  usernameBtn.innerHTML = 'Processing<span class="loading-spinner"></span>';

  try {
    // Check if user exists
    const { data: existingUser, error: selectError } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .maybeSingle();

    if (selectError && selectError.code !== 'PGRST116') {
      throw selectError;
    }

    if (existingUser) {
      // User exists - login
      console.log('User exists, logging in:', existingUser);
      localStorage.setItem('currentUser', username);
      localStorage.setItem('userId', existingUser.id);

      // Check if they have completed assessments
      await checkUserProgress(username);

    } else {
      // New user - create account
      console.log('Creating new user:', username);

      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert([{ username: username }])
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      console.log('New user created:', newUser);
      localStorage.setItem('currentUser', username);
      localStorage.setItem('userId', newUser.id);

      // New user - start from demographics
      window.location.href = '/demographics.html';
    }

  } catch (error) {
    console.error('Authentication error:', error);
    showError(t('usernameErrorGeneral'), usernameInput, errorDiv);
    usernameBtn.disabled = false;
    usernameBtn.textContent = t('usernameButton');
  }
}

// Check user progress and redirect appropriately
async function checkUserProgress(username) {
  try {
    // Check demographics completion
    const { data: demographicsData, error: dError } = await supabase
      .from('patient_demographics')
      .select('*')
      .eq('username', username)
      .maybeSingle();

    if (dError && dError.code !== 'PGRST116') {
      throw dError;
    }

    // Check questionnaire completion
    const { data: questionnaireData, error: qError } = await supabase
      .from('questionnaire_responses')
      .select('*')
      .eq('username', username)
      .maybeSingle();

    if (qError && qError.code !== 'PGRST116') {
      throw qError;
    }

    // Check STS assessment completion
    const { data: stsData, error: stsError } = await supabase
      .from('sts_assessments')
      .select('*')
      .eq('username', username)
      .maybeSingle();

    if (stsError && stsError.code !== 'PGRST116') {
      throw stsError;
    }

    // Determine where to redirect based on completion status
    if (!demographicsData) {
      // No demographics - start from demographics
      window.location.href = '/demographics.html';
    } else if (questionnaireData && stsData) {
      // All completed - go to results
      window.location.href = '/results.html';
    } else if (questionnaireData) {
      // Demographics and questionnaire done, STS pending
      window.location.href = '/sts-assessment.html';
    } else {
      // Demographics done, questionnaire pending
      window.location.href = '/questionnaire.html';
    }

  } catch (error) {
    console.error('Error checking user progress:', error);
    // On error, default to demographics
    window.location.href = '/demographics.html';
  }
}

// Helper function to show error
function showError(message, inputElement, errorElement) {
  errorElement.textContent = message;
  errorElement.classList.add('visible');
  inputElement.classList.add('error');
  inputElement.focus();
}

// Start the app
init();
