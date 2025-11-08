import { storage } from '../shared/storage.js';
import { isAuthenticated, renderLoginPage, setupLoginHandler, logout } from './auth.js';
import { renderScannerPage, initScanner, cleanupScanner } from './qr-scanner.js';
import { renderAssessmentForm, setupAssessmentHandlers } from './assessment.js';
import { renderRecommendationsPage, setupRecommendationsHandlers } from './results-display.js';

// App state
let currentPage = 'login'; // 'login', 'home', 'scanner', 'assessment', 'recommendations'
let currentPatientUuid = null;
let currentPatientData = null;

/**
 * Initialize app
 */
function init() {
  // Check if already authenticated
  if (isAuthenticated()) {
    goToHomePage();
  } else {
    goToLoginPage();
  }
}

/**
 * Render top navigation (only shown after login)
 */
function renderTopNav() {
  return `
    <div class="top-nav">
      <h1>Physiotherapist Assessment</h1>
      <div class="nav-buttons">
        <button id="newPatientBtn" class="btn btn-primary">
          Next Patient
        </button>
        <button id="logoutBtn" class="btn btn-danger">
          Logout
        </button>
      </div>
    </div>
  `;
}

/**
 * Setup navigation handlers
 */
function setupNavHandlers() {
  const newPatientBtn = document.getElementById('newPatientBtn');
  const logoutBtn = document.getElementById('logoutBtn');

  if (newPatientBtn) {
    newPatientBtn.addEventListener('click', () => {
      if (currentPatientUuid && currentPage !== 'recommendations') {
        if (!confirm('Are you sure? Unsaved assessment data will be lost.')) {
          return;
        }
      }
      goToHomePage();
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to logout?')) {
        logout();
        goToLoginPage();
      }
    });
  }
}

/**
 * Go to login page
 */
function goToLoginPage() {
  currentPage = 'login';
  const app = document.getElementById('app');

  app.innerHTML = renderLoginPage();
  setupLoginHandler(() => {
    goToHomePage();
  });
}

/**
 * Go to home page (blank with nav)
 */
function goToHomePage() {
  currentPage = 'home';
  currentPatientUuid = null;
  currentPatientData = null;

  // Clear session storage
  storage.clearPhysioSession();

  const app = document.getElementById('app');

  app.innerHTML = `
    ${renderTopNav()}
    <div style="max-width: 800px; margin: 100px auto; text-align: center; padding: 40px;">
      <h2 style="color: var(--dark-color); margin-bottom: 30px;">Ready for Next Patient</h2>
      <p style="color: var(--text-light); margin-bottom: 40px; font-size: 18px;">
        Click the button below to scan the patient's QR code
      </p>
      <button id="startScanBtn" class="btn btn-secondary btn-large">
        Scan Patient QR Code
      </button>
    </div>
  `;

  setupNavHandlers();

  document.getElementById('startScanBtn').addEventListener('click', () => {
    goToScannerPage();
  });
}

/**
 * Go to scanner page
 */
function goToScannerPage() {
  currentPage = 'scanner';
  const app = document.getElementById('app');

  app.innerHTML = `
    ${renderTopNav()}
    ${renderScannerPage()}
  `;

  setupNavHandlers();

  // Initialize QR scanner
  initScanner((uuid, patientData) => {
    currentPatientUuid = uuid;
    currentPatientData = patientData;
    goToAssessmentPage();
  });
}

/**
 * Go to assessment page
 */
function goToAssessmentPage() {
  currentPage = 'assessment';

  // Cleanup scanner if it exists
  cleanupScanner();

  const app = document.getElementById('app');

  app.innerHTML = `
    ${renderTopNav()}
    ${renderAssessmentForm(currentPatientUuid, currentPatientData)}
  `;

  setupNavHandlers();

  setupAssessmentHandlers(currentPatientUuid, currentPatientData, (uuid, updatedData) => {
    currentPatientData = updatedData;
    goToRecommendationsPage();
  });
}

/**
 * Go to recommendations page
 */
function goToRecommendationsPage() {
  currentPage = 'recommendations';
  const app = document.getElementById('app');

  app.innerHTML = `
    ${renderTopNav()}
    ${renderRecommendationsPage(currentPatientUuid, currentPatientData)}
  `;

  setupNavHandlers();

  setupRecommendationsHandlers(currentPatientUuid, currentPatientData);
}

// Start the app
init();
