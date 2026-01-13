import { supabase } from '../shared/supabase.js';
import { storage } from '../shared/storage.js';

// Translations
const translations = {
  'en': {
    // Header
    pageTitle: 'Patient Demographics',
    pageSubtitle: 'Step 1 of 4: Personal Information',

    // Form
    introTitle: 'Personal Information',
    introText: 'Please provide your demographic information. This helps us calculate age-appropriate benchmarks and body mass index (BMI) for personalized exercise recommendations.',
    labelDOB: 'Date of Birth',
    hintDOB: 'Used to calculate your age',
    labelGender: 'Gender',
    optionMale: 'Male',
    optionFemale: 'Female',
    optionOther: 'Other',
    labelHeight: 'Height',
    hintHeight: 'Enter height in centimeters',
    labelWeight: 'Weight',
    hintWeight: 'Enter weight in kilograms',
    labelBMI: 'Your BMI:',
    btnContinue: 'Continue to Questionnaire',

    // Info box
    infoTitle: 'Why We Need This Information',
    infoAge: 'Age: Used for age-appropriate normative comparisons',
    infoBMI: 'BMI: Helps adjust exercise recommendations',
    infoGender: 'Gender: Used for sit-to-stand benchmarks',
    infoPrivacy: 'Your data is stored securely and used only for assessment purposes',

    // BMI categories
    bmiUnderweight: 'Underweight',
    bmiNormal: 'Normal weight',
    bmiOverweight: 'Overweight',
    bmiObese: 'Obese',

    // Errors
    errorInvalidDate: 'Please enter a valid date of birth',
    errorFutureDate: 'Date of birth cannot be in the future',
    errorTooYoung: 'You must be at least 18 years old',
    errorTooOld: 'Please verify your date of birth',
    errorGender: 'Please select your gender',
    errorHeight: 'Please enter a valid height (50-250 cm)',
    errorWeight: 'Please enter a valid weight (20-300 kg)',
    errorSaving: 'Error saving demographics. Please try again.',

    // Logout
    logout: 'Logout',
    user: 'User',
    confirmLogout: 'Are you sure you want to logout? Unsaved progress will be lost.'
  },
  'zh-TW': {
    // Header
    pageTitle: '患者資料',
    pageSubtitle: '第1步，共4步：個人資料',

    // Form
    introTitle: '個人資料',
    introText: '請提供您的基本資料。這有助於我們計算適合您年齡的基準值和身體質量指數（BMI），以提供個人化的運動建議。',
    labelDOB: '出生日期',
    hintDOB: '用於計算您的年齡',
    labelGender: '性別',
    optionMale: '男性',
    optionFemale: '女性',
    optionOther: '其他',
    labelHeight: '身高',
    hintHeight: '請輸入身高（公分）',
    labelWeight: '體重',
    hintWeight: '請輸入體重（公斤）',
    labelBMI: '您的BMI：',
    btnContinue: '繼續填寫問卷',

    // Info box
    infoTitle: '為什麼需要這些資訊',
    infoAge: '年齡：用於年齡適當的常模比較',
    infoBMI: 'BMI：幫助調整運動建議',
    infoGender: '性別：用於坐站測試基準值',
    infoPrivacy: '您的資料將安全存儲，僅用於評估目的',

    // BMI categories
    bmiUnderweight: '體重過輕',
    bmiNormal: '正常體重',
    bmiOverweight: '體重過重',
    bmiObese: '肥胖',

    // Errors
    errorInvalidDate: '請輸入有效的出生日期',
    errorFutureDate: '出生日期不能是未來日期',
    errorTooYoung: '您必須年滿18歲',
    errorTooOld: '請確認您的出生日期',
    errorGender: '請選擇性別',
    errorHeight: '請輸入有效的身高（50-250公分）',
    errorWeight: '請輸入有效的體重（20-300公斤）',
    errorSaving: '保存資料時發生錯誤，請重試。',

    // Logout
    logout: '登出',
    user: '用戶',
    confirmLogout: '確定要登出嗎？未保存的進度將會丟失。'
  }
};

// State
let currentLang = localStorage.getItem('patient_language') || 'en';

// Translation helper
function t(key) {
  return translations[currentLang][key] || key;
}

// Initialize
async function init() {
  // Check if user is logged in
  const currentUser = localStorage.getItem('currentUser');
  if (!currentUser) {
    window.location.href = '/home.html';
    return;
  }

  // Set language
  currentLang = localStorage.getItem('patient_language') || 'en';

  // Render page
  renderHeader();
  renderContent();
  setupFormHandlers();

  // Set max date for date of birth (today)
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('dateOfBirth').setAttribute('max', today);

  // Try to load existing demographics data
  await loadExistingData();
}

// Render header
function renderHeader() {
  const header = document.getElementById('pageHeader');
  const currentUser = localStorage.getItem('currentUser');

  header.innerHTML = `
    <div class="header-content">
      <div>
        <h1>${t('pageTitle')}</h1>
        <p>${t('pageSubtitle')}</p>
      </div>
      <div class="header-actions">
        <span class="current-user">${t('user')}: ${currentUser}</span>
        <button type="button" class="btn btn-logout" id="logoutBtn">
          ${t('logout')}
        </button>
      </div>
    </div>
  `;

  document.getElementById('logoutBtn').addEventListener('click', handleLogout);
}

// Render content
function renderContent() {
  document.getElementById('introTitle').textContent = t('introTitle');
  document.getElementById('introText').textContent = t('introText');
  document.getElementById('labelDOB').textContent = t('labelDOB');
  document.getElementById('hintDOB').textContent = t('hintDOB');
  document.getElementById('labelGender').textContent = t('labelGender');
  document.getElementById('optionMale').textContent = t('optionMale');
  document.getElementById('optionFemale').textContent = t('optionFemale');
  document.getElementById('optionOther').textContent = t('optionOther');
  document.getElementById('labelHeight').textContent = t('labelHeight');
  document.getElementById('hintHeight').textContent = t('hintHeight');
  document.getElementById('labelWeight').textContent = t('labelWeight');
  document.getElementById('hintWeight').textContent = t('hintWeight');
  document.getElementById('labelBMI').textContent = t('labelBMI');
  document.getElementById('btnContinue').textContent = t('btnContinue');
  document.getElementById('infoTitle').textContent = t('infoTitle');
  document.getElementById('infoAge').textContent = t('infoAge');
  document.getElementById('infoBMI').textContent = t('infoBMI');
  document.getElementById('infoGender').textContent = t('infoGender');
  document.getElementById('infoPrivacy').textContent = t('infoPrivacy');
}

// Setup form handlers
function setupFormHandlers() {
  const form = document.getElementById('demographicsForm');
  const heightInput = document.getElementById('height');
  const weightInput = document.getElementById('weight');

  // BMI calculation on height/weight change
  heightInput.addEventListener('input', updateBMI);
  weightInput.addEventListener('input', updateBMI);

  // Form submission
  form.addEventListener('submit', handleSubmit);
}

// Update BMI preview
function updateBMI() {
  const height = parseFloat(document.getElementById('height').value);
  const weight = parseFloat(document.getElementById('weight').value);
  const bmiPreview = document.getElementById('bmiPreview');
  const bmiValue = document.getElementById('bmiValue');
  const bmiCategory = document.getElementById('bmiCategory');

  if (height > 0 && weight > 0) {
    // Calculate BMI: weight (kg) / (height (m))^2
    const heightInMeters = height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);

    bmiValue.textContent = bmi.toFixed(1);
    bmiPreview.style.display = 'block';

    // Categorize BMI
    let category = '';
    let categoryClass = '';

    if (bmi < 18.5) {
      category = t('bmiUnderweight');
      categoryClass = 'underweight';
    } else if (bmi < 25) {
      category = t('bmiNormal');
      categoryClass = 'normal';
    } else if (bmi < 30) {
      category = t('bmiOverweight');
      categoryClass = 'overweight';
    } else {
      category = t('bmiObese');
      categoryClass = 'obese';
    }

    bmiCategory.textContent = category;
    bmiCategory.className = `bmi-category ${categoryClass}`;
  } else {
    bmiPreview.style.display = 'none';
  }
}

// Load existing demographics data if available
async function loadExistingData() {
  const currentUser = localStorage.getItem('currentUser');

  try {
    const { data, error } = await supabase
      .from('patient_demographics')
      .select('*')
      .eq('username', currentUser)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      console.error('Error loading demographics:', error);
      return;
    }

    if (data) {
      // Populate form with existing data
      document.getElementById('dateOfBirth').value = data.date_of_birth;
      document.querySelector(`input[name="gender"][value="${data.gender}"]`).checked = true;
      document.getElementById('height').value = data.height_cm;
      document.getElementById('weight').value = data.weight_kg;

      // Update BMI
      updateBMI();
    }
  } catch (err) {
    console.error('Error loading demographics:', err);
  }
}

// Handle form submission
async function handleSubmit(e) {
  e.preventDefault();

  const errorDiv = document.getElementById('formError');
  const submitBtn = document.getElementById('submitBtn');
  errorDiv.classList.remove('visible');
  errorDiv.textContent = '';

  // Get form values
  const dateOfBirth = document.getElementById('dateOfBirth').value;
  const gender = document.querySelector('input[name="gender"]:checked')?.value;
  const height = parseFloat(document.getElementById('height').value);
  const weight = parseFloat(document.getElementById('weight').value);

  // Validate
  const validation = validateForm(dateOfBirth, gender, height, weight);
  if (!validation.valid) {
    showError(validation.message, errorDiv);
    return;
  }

  // Show loading state
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<span>Saving<span class="loading-spinner"></span></span>';

  try {
    const currentUser = localStorage.getItem('currentUser');

    // Save to database (upsert)
    const { data, error } = await supabase
      .from('patient_demographics')
      .upsert({
        username: currentUser,
        date_of_birth: dateOfBirth,
        gender: gender,
        height_cm: height,
        weight_kg: weight
      }, {
        onConflict: 'username'
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    console.log('Demographics saved:', data);

    // Set completion flag
    localStorage.setItem('demographicsCompleted', 'true');

    // Redirect to questionnaire
    window.location.href = '/questionnaire.html';

  } catch (error) {
    console.error('Error saving demographics:', error);
    showError(t('errorSaving'), errorDiv);
    submitBtn.disabled = false;
    submitBtn.innerHTML = `<span>${t('btnContinue')}</span>`;
  }
}

// Validate form
function validateForm(dateOfBirth, gender, height, weight) {
  // Validate date of birth
  if (!dateOfBirth) {
    return { valid: false, message: t('errorInvalidDate') };
  }

  const dob = new Date(dateOfBirth);
  const today = new Date();

  if (dob > today) {
    return { valid: false, message: t('errorFutureDate') };
  }

  // Calculate age
  const age = Math.floor((today - dob) / (365.25 * 24 * 60 * 60 * 1000));

  if (age < 18) {
    return { valid: false, message: t('errorTooYoung') };
  }

  if (age > 120) {
    return { valid: false, message: t('errorTooOld') };
  }

  // Validate gender
  if (!gender) {
    return { valid: false, message: t('errorGender') };
  }

  // Validate height
  if (!height || height < 50 || height > 250) {
    return { valid: false, message: t('errorHeight') };
  }

  // Validate weight
  if (!weight || weight < 20 || weight > 300) {
    return { valid: false, message: t('errorWeight') };
  }

  return { valid: true };
}

// Show error
function showError(message, errorDiv) {
  errorDiv.textContent = message;
  errorDiv.classList.add('visible');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Handle logout
function handleLogout() {
  if (confirm(t('confirmLogout'))) {
    storage.logout();
  }
}

// Start
init();
