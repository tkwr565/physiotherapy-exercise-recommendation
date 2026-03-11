import { storage } from '../shared/storage.js';

const PHYSIO_PASSCODE = import.meta.env.VITE_PHYSIO_PASSCODE || 'demo1125';

/**
 * Check if physiotherapist is authenticated
 */
export function isAuthenticated() {
  return storage.isPhysioAuthenticated();
}

/**
 * Authenticate with passcode
 */
export function authenticate(passcode) {
  if (passcode === PHYSIO_PASSCODE) {
    storage.savePhysioAuth();
    return true;
  }
  return false;
}

/**
 * Logout physiotherapist
 */
export function logout() {
  storage.clearPhysioAuth();
  storage.clearPhysioSession();
}

/**
 * Render login page
 */
export function renderLoginPage(onSuccess) {
  return `
    <div class="login-container">
      <h2>Physiotherapist Login</h2>
      <p style="text-align: center; color: var(--text-light); margin-bottom: 30px;">
        Enter your passcode to access the assessment system
      </p>

      <form id="loginForm" class="login-form">
        <div>
          <label for="passcode">Passcode</label>
          <input
            type="password"
            id="passcode"
            name="passcode"
            placeholder="Enter passcode"
            autocomplete="off"
            required
          >
        </div>

        <button type="submit" class="btn btn-primary btn-large" style="width: 100%;">
          Login
        </button>

        <div id="loginError" class="error-message hidden"></div>
      </form>

      <p style="text-align: center; color: var(--text-light); margin-top: 30px; font-size: 14px;">
        Demo passcode: demo1125
      </p>
    </div>
  `;
}

/**
 * Setup login form handler
 */
export function setupLoginHandler(onSuccess) {
  const form = document.getElementById('loginForm');
  const errorDiv = document.getElementById('loginError');

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const passcode = document.getElementById('passcode').value;

    if (authenticate(passcode)) {
      onSuccess();
    } else {
      errorDiv.textContent = 'Invalid passcode. Please try again.';
      errorDiv.classList.remove('hidden');
      document.getElementById('passcode').value = '';
      document.getElementById('passcode').focus();
    }
  });
}
