import { supabase } from '../shared/supabase.js';

// Get passcode from environment
const PASSCODE = import.meta.env.VITE_PHYSIO_PASSCODE;

// State
let currentStep = 'passcode'; // 'passcode' or 'username'

// Initialize
function init() {
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

// Render passcode entry screen
function renderPasscodeScreen() {
  const app = document.getElementById('app');

  app.innerHTML = `
    <div class="auth-container">
      <div class="auth-title">Access Control</div>
      <div class="auth-subtitle">Please enter the passcode to continue</div>

      <form id="passcodeForm" class="auth-form">
        <div class="form-group">
          <label for="passcode" class="form-label">Passcode</label>
          <input
            type="password"
            id="passcode"
            class="form-input"
            placeholder="Enter passcode"
            autocomplete="off"
            required
          />
        </div>

        <div id="passcodeError" class="form-error"></div>

        <button type="submit" class="auth-button" id="passcodeBtn">
          Continue
        </button>
      </form>

      <div class="info-box">
        <h3>About This System</h3>
        <ul>
          <li>KOOS/WOMAC questionnaire assessment</li>
          <li>30-second sit-to-stand test</li>
          <li>Personalized exercise recommendations</li>
          <li>Evidence-based biomechanical targeting</li>
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
    showError('Please enter a passcode', passcodeInput, errorDiv);
    return;
  }

  if (enteredPasscode !== PASSCODE) {
    showError('Incorrect passcode. Please try again.', passcodeInput, errorDiv);
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
      <div class="auth-title">Welcome</div>
      <div class="auth-subtitle">Enter your username to begin your assessment</div>

      <form id="usernameForm" class="auth-form">
        <div class="form-group">
          <label for="username" class="form-label">Username</label>
          <input
            type="text"
            id="username"
            class="form-input"
            placeholder="Enter your username"
            autocomplete="username"
            minlength="3"
            maxlength="50"
            required
          />
          <span class="form-hint">3-50 characters, letters and numbers only</span>
          <div id="usernameStatus" class="form-status"></div>
        </div>

        <div id="usernameError" class="form-error"></div>

        <button type="submit" class="auth-button" id="usernameBtn">
          Continue to Assessment
        </button>
      </form>

      <div class="info-box">
        <h3>What to Expect</h3>
        <ul>
          <li>Page 1: Answer 30 questionnaire questions</li>
          <li>Page 2: Complete sit-to-stand test</li>
          <li>Page 3: View your personalized exercises</li>
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
    usernameBtn.textContent = 'Continue to Assessment';
    return;
  }

  // Validate format
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    statusDiv.textContent = '';
    statusDiv.className = 'form-status';
    usernameBtn.textContent = 'Continue to Assessment';
    return;
  }

  // Show checking state
  statusDiv.textContent = 'Checking...';
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
      statusDiv.textContent = '✓ Existing account - Logging in';
      statusDiv.className = 'form-status existing';
      usernameBtn.textContent = 'Login to Existing Account';
    } else {
      // Username available - creating new
      statusDiv.textContent = '✓ Available - Creating new account';
      statusDiv.className = 'form-status available';
      usernameBtn.textContent = 'Create New Account';
    }
  } catch (error) {
    console.error('Error checking username:', error);
    statusDiv.textContent = '';
    statusDiv.className = 'form-status';
    usernameBtn.textContent = 'Continue to Assessment';
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
    showError('Please enter a username', usernameInput, errorDiv);
    return;
  }

  if (username.length < 3 || username.length > 50) {
    showError('Username must be between 3 and 50 characters', usernameInput, errorDiv);
    return;
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    showError('Username can only contain letters, numbers, hyphens, and underscores', usernameInput, errorDiv);
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

      // New user - start from questionnaire
      window.location.href = '/questionnaire.html';
    }

  } catch (error) {
    console.error('Authentication error:', error);
    showError('An error occurred. Please try again.', usernameInput, errorDiv);
    usernameBtn.disabled = false;
    usernameBtn.textContent = 'Continue to Assessment';
  }
}

// Check user progress and redirect appropriately
async function checkUserProgress(username) {
  try {
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

    // Determine where to redirect
    if (questionnaireData && stsData) {
      // Both completed - go to results
      window.location.href = '/results.html';
    } else if (questionnaireData) {
      // Questionnaire done, STS pending
      window.location.href = '/sts-assessment.html';
    } else {
      // Nothing done yet - start from questionnaire
      window.location.href = '/questionnaire.html';
    }

  } catch (error) {
    console.error('Error checking user progress:', error);
    // On error, default to questionnaire
    window.location.href = '/questionnaire.html';
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
