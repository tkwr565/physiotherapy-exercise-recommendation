import { supabase } from '../shared/supabase.js';
import { storage } from '../shared/storage.js';

const muscleGroups = [
  { id: 'quad', label: 'Quadriceps', category: 'Knee' },
  { id: 'hamstring', label: 'Hamstrings', category: 'Knee' },
  { id: 'glute_max', label: 'Gluteus Maximus', category: 'Hip' },
  { id: 'glute_med_min', label: 'Gluteus Medius/Minimus', category: 'Hip' },
  { id: 'adductors', label: 'Adductors', category: 'Hip' },
  { id: 'hip_flexors', label: 'Hip Flexors', category: 'Hip' },
  { id: 'calves', label: 'Calves', category: 'Ankle' }
];

/**
 * Render assessment form
 */
export function renderAssessmentForm(patientUuid, patientData) {
  // Restore saved assessment data if available
  const session = storage.getPhysioSession();
  const savedAssessment = (session && session.patientUuid === patientUuid) ? session.assessment : null;

  return `
    <div class="physio-container">
      <div class="assessment-section">
        <h2>Patient Assessment</h2>
        <p style="color: var(--text-light); margin-bottom: 20px;">
          Patient ID: <code>${patientUuid}</code>
        </p>

        <form id="assessmentForm">
          <!-- Muscle Strength Assessment -->
          <div style="margin-bottom: 30px;">
            <h3 style="margin-bottom: 20px; color: var(--dark-color);">
              Muscle Strength (Oxford Scale 0-5)
            </h3>

            ${renderMuscleTable('Knee', muscleGroups.filter(m => m.category === 'Knee'), savedAssessment)}
            ${renderMuscleTable('Hip', muscleGroups.filter(m => m.category === 'Hip'), savedAssessment)}
            ${renderMuscleTable('Ankle', muscleGroups.filter(m => m.category === 'Ankle'), savedAssessment)}
          </div>

          <!-- Submit Button -->
          <div style="text-align: center; margin-top: 40px;">
            <button type="submit" class="btn btn-secondary btn-large" id="assessmentSubmitBtn" disabled>
              Complete Assessment & View Recommendations
            </button>
            <p style="margin-top: 15px; color: var(--text-light);" id="assessmentProgress">
              Please complete all muscle strength assessments
            </p>
          </div>
        </form>
      </div>
    </div>
  `;
}

/**
 * Render muscle strength table
 */
function renderMuscleTable(category, muscles, savedAssessment) {
  return `
    <div style="margin-bottom: 30px;">
      <h4 style="margin-bottom: 15px; color: var(--text-color);">${category}</h4>
      <table class="muscle-table">
        <thead>
          <tr>
            <th style="width: 40%;">Muscle</th>
            <th style="width: 30%; text-align: center;">Right</th>
            <th style="width: 30%; text-align: center;">Left</th>
          </tr>
        </thead>
        <tbody>
          ${muscles.map(muscle => {
            const rightValue = savedAssessment?.[`right_${muscle.id}_strength`] ?? '';
            const leftValue = savedAssessment?.[`left_${muscle.id}_strength`] ?? '';

            return `
              <tr>
                <td>${muscle.label}</td>
                <td style="text-align: center;">
                  <select name="right_${muscle.id}_strength" class="muscle-select" data-side="right" data-muscle="${muscle.id}">
                    <option value="">-</option>
                    ${[0, 1, 2, 3, 4, 5].map(val => `<option value="${val}" ${rightValue == val ? 'selected' : ''}>${val}</option>`).join('')}
                  </select>
                </td>
                <td style="text-align: center;">
                  <select name="left_${muscle.id}_strength" class="muscle-select" data-side="left" data-muscle="${muscle.id}">
                    <option value="">-</option>
                    ${[0, 1, 2, 3, 4, 5].map(val => `<option value="${val}" ${leftValue == val ? 'selected' : ''}>${val}</option>`).join('')}
                  </select>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;
}

/**
 * Setup assessment form handlers
 */
export function setupAssessmentHandlers(patientUuid, patientData, onComplete) {
  const form = document.getElementById('assessmentForm');
  const selects = document.querySelectorAll('.muscle-select');

  // Track assessment data
  let assessmentData = {};

  // Restore saved data
  const session = storage.getPhysioSession();
  if (session && session.patientUuid === patientUuid && session.assessment) {
    assessmentData = session.assessment;
  }

  // Update progress on select change
  selects.forEach(select => {
    select.addEventListener('change', (e) => {
      const name = e.target.name;
      const value = e.target.value;

      if (value === '') {
        delete assessmentData[name];
      } else {
        assessmentData[name] = parseInt(value);
      }

      // Save to session storage
      storage.savePhysioSession({
        patientUuid,
        patientData,
        assessment: assessmentData
      });

      updateAssessmentProgress();
    });
  });

  // Form submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!validateAssessment()) {
      alert('Please complete all muscle strength assessments.');
      return;
    }

    await submitAssessment(patientUuid, assessmentData, onComplete);
  });

  // Initial progress check
  updateAssessmentProgress();

  function validateAssessment() {
    const requiredFields = [];
    muscleGroups.forEach(muscle => {
      requiredFields.push(`right_${muscle.id}_strength`);
      requiredFields.push(`left_${muscle.id}_strength`);
    });

    return requiredFields.every(field => assessmentData[field] !== undefined && assessmentData[field] !== '');
  }

  function updateAssessmentProgress() {
    const totalRequired = muscleGroups.length * 2; // 7 muscles × 2 sides = 14
    const completed = Object.keys(assessmentData).length;

    const submitBtn = document.getElementById('assessmentSubmitBtn');
    const progressText = document.getElementById('assessmentProgress');

    const isComplete = validateAssessment();

    if (submitBtn) {
      submitBtn.disabled = !isComplete;
    }

    if (progressText) {
      if (isComplete) {
        progressText.textContent = '✓ Assessment complete - Ready to view recommendations';
        progressText.style.color = 'var(--secondary-color)';
      } else {
        progressText.textContent = `${completed} / ${totalRequired} assessments completed`;
        progressText.style.color = 'var(--text-light)';
      }
    }
  }
}

/**
 * Submit assessment to database
 */
async function submitAssessment(patientUuid, assessmentData, onComplete) {
  const submitBtn = document.getElementById('assessmentSubmitBtn');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Saving...';

  try {
    // Update the patient's assessment in Supabase
    const updateData = {
      ...assessmentData,
      assessment_completed_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('assessments')
      .update(updateData)
      .eq('id', patientUuid)
      .select();

    if (error) {
      console.error('Supabase error:', error);
      throw new Error('Failed to save assessment. Please try again.');
    }

    console.log('Assessment saved:', data);

    // Update session storage with complete data
    const session = storage.getPhysioSession();
    storage.savePhysioSession({
      ...session,
      assessment: assessmentData,
      assessmentComplete: true
    });

    // Proceed to recommendations
    onComplete(patientUuid, data[0]);

  } catch (error) {
    console.error('Submission error:', error);
    alert(error.message || 'An error occurred. Please try again.');
    submitBtn.disabled = false;
    submitBtn.textContent = 'Complete Assessment & View Recommendations';
  }
}
