import { calculateRecommendations, getPositionName, getMuscleDisplayName } from './recommendations.js';

/**
 * Color mappings for exercise positions (easiest → hardest)
 */
const positionColors = {
  'lying': { bg: '#c8e6c9', text: '#1b5e20', label: 'Lying (Easiest)' },        // Light green
  'quadruped': { bg: '#fff9c4', text: '#f57f17', label: 'Quadruped' },          // Yellow
  'DL_stand': { bg: '#b3e5fc', text: '#01579b', label: 'Double Leg Stand' },    // Light blue
  'split_stand': { bg: '#e1bee7', text: '#4a148c', label: 'Split Stand' },      // Purple
  'SL_stand': { bg: '#ffcdd2', text: '#b71c1c', label: 'Single Leg Stand (Hardest)' } // Red
};

/**
 * Get position color styling
 */
function getPositionColor(position) {
  return positionColors[position] || { bg: '#e0e0e0', text: '#333', label: position };
}

/**
 * Generate signal bar indicator for difficulty level
 * Returns HTML for a 5-bar signal strength indicator
 */
function getDifficultySignalBars(level) {
  const totalBars = 5;
  let barsHtml = '';

  for (let i = 1; i <= totalBars; i++) {
    const isFilled = i <= level;
    const height = 8 + (i * 3); // Progressive height: 11px, 14px, 17px, 20px, 23px
    barsHtml += `
      <div class="signal-bar ${isFilled ? 'filled' : 'empty'}" style="height: ${height}px;"></div>
    `;
  }

  return `
    <div class="signal-bars-container">
      ${barsHtml}
    </div>
  `;
}

/**
 * Render recommendations page
 */
export function renderRecommendationsPage(patientUuid, patientData) {
  return `
    <div class="physio-container">
      <div class="assessment-section">
        <h2>Exercise Recommendations</h2>
        <p style="color: var(--text-light); margin-bottom: 20px;">
          Patient ID: <code>${patientUuid}</code>
        </p>

        <!-- Controls Panel -->
        <div class="controls-panel">
          <h3>Recommendation Settings</h3>

          <div class="control-group">
            <label for="laterality">Knee Laterality</label>
            <select id="laterality">
              <option value="left">Left Knee</option>
              <option value="right">Right Knee</option>
              <option value="both">Both Knees</option>
            </select>
          </div>

          <div class="control-group">
            <label for="muscleFocus">Muscle Focus (Optional)</label>
            <select id="muscleFocus">
              <option value="">None - Equal weight to all muscles (1/7 each)</option>
              <option value="quad">Quadriceps - Increased weight (3/13)</option>
              <option value="hamstring">Hamstrings - Increased weight (3/13)</option>
              <option value="glute_max">Gluteus Maximus - Increased weight (3/13)</option>
              <option value="glute_med_min">Gluteus Medius/Minimus - Increased weight (3/13)</option>
              <option value="adductors">Adductors - Increased weight (3/13)</option>
              <option value="hip_flexors">Hip Flexors - Increased weight (3/13)</option>
              <option value="calves">Calves - Increased weight (3/13)</option>
            </select>
            <p style="font-size: 14px; color: #558b2f; font-style: italic; margin-top: 8px;">
              Selecting a muscle gives it 3x weight vs others
            </p>
          </div>

          <div class="control-group">
            <label for="maxDifficulty">Maximum Difficulty Level</label>
            <select id="maxDifficulty">
              <option value="">No limit - Show all exercises</option>
              <option value="1">Level 1 (Easiest)</option>
              <option value="2">Level 2</option>
              <option value="3">Level 3</option>
              <option value="4">Level 4</option>
              <option value="5">Level 5 (Hardest)</option>
            </select>
          </div>

          <div style="text-align: center; margin-top: 25px;">
            <button id="calculateBtn" class="btn btn-secondary btn-large">
              Calculate Recommendations
            </button>
          </div>
        </div>

        <!-- Results Container -->
        <div id="resultsContainer"></div>
      </div>
    </div>
  `;
}

/**
 * Setup recommendations handlers
 */
export function setupRecommendationsHandlers(patientUuid, patientData) {
  const calculateBtn = document.getElementById('calculateBtn');

  calculateBtn.addEventListener('click', async () => {
    const laterality = document.getElementById('laterality').value;
    const muscleFocus = document.getElementById('muscleFocus').value || null;
    const maxDifficulty = document.getElementById('maxDifficulty').value ? parseInt(document.getElementById('maxDifficulty').value) : null;

    await loadRecommendations(patientData, laterality, muscleFocus, maxDifficulty);
  });

  // Auto-calculate on page load
  loadRecommendations(patientData, 'left', null, null);
}

/**
 * Load and display recommendations
 */
async function loadRecommendations(patientData, laterality, muscleFocus, maxDifficulty) {
  const resultsContainer = document.getElementById('resultsContainer');
  const calculateBtn = document.getElementById('calculateBtn');

  // Show loading
  calculateBtn.disabled = true;
  calculateBtn.textContent = 'Calculating...';
  resultsContainer.innerHTML = '<div style="text-align: center; padding: 40px;"><div class="loading"></div><p style="margin-top: 20px;">Calculating recommendations...</p></div>';

  try {
    const recommendations = await calculateRecommendations(patientData, laterality, muscleFocus, maxDifficulty);

    // Display results
    displayRecommendations(recommendations, laterality, muscleFocus, maxDifficulty);

    calculateBtn.disabled = false;
    calculateBtn.textContent = 'Calculate Recommendations';

  } catch (error) {
    console.error('Error calculating recommendations:', error);
    resultsContainer.innerHTML = `
      <div class="error-message">
        Error calculating recommendations: ${error.message}
      </div>
    `;
    calculateBtn.disabled = false;
    calculateBtn.textContent = 'Calculate Recommendations';
  }
}

/**
 * Display recommendations
 */
function displayRecommendations(recommendations, laterality, muscleFocus, maxDifficulty) {
  const resultsContainer = document.getElementById('resultsContainer');

  let html = `
    <div style="margin-top: 40px;">
      <h3 style="margin-bottom: 20px; color: var(--dark-color);">Top 10 Recommended Exercises</h3>

      <!-- Filter Summary -->
      <div style="background-color: #e8f5e9; padding: 15px; border-radius: 8px; margin-bottom: 20px; font-size: 14px;">
        <strong>Current Filters:</strong><br>
        Laterality: <strong>${laterality === 'both' ? 'Both Knees' : (laterality === 'left' ? 'Left Knee' : 'Right Knee')}</strong> |
        Muscle Focus: <strong>${muscleFocus ? getMuscleDisplayName(muscleFocus) + ' (3x weight)' : 'None (equal weights)'}</strong> |
        Max Difficulty: <strong>${maxDifficulty ? 'Level ' + maxDifficulty : 'No limit'}</strong>
      </div>

      <!-- Visual Legend -->
      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
        <h4 style="margin-bottom: 15px; color: var(--dark-color); font-size: 16px;">Visual Legend</h4>

        <div style="margin-bottom: 15px;">
          <strong style="font-size: 14px;">Exercise Position (Easiest → Hardest):</strong>
          <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px;">
            ${Object.entries(positionColors).map(([key, color]) => `
              <span class="color-badge" style="background-color: ${color.bg}; color: ${color.text}; font-size: 12px; padding: 4px 10px;">
                ${color.label}
              </span>
            `).join('')}
          </div>
        </div>

        <div>
          <strong style="font-size: 14px;">Difficulty Level (Signal Strength):</strong>
          <div style="display: flex; flex-wrap: wrap; gap: 15px; margin-top: 10px; align-items: center;">
            ${[1, 2, 3, 4, 5].map(level => `
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 12px; font-weight: 600; color: var(--dark-color);">Level ${level}:</span>
                ${getDifficultySignalBars(level)}
              </div>
            `).join('')}
          </div>
          <p style="font-size: 12px; color: var(--text-light); margin-top: 10px; font-style: italic;">
            More filled bars = Higher difficulty (like mobile signal strength)
          </p>
        </div>
      </div>
  `;

  if (laterality === 'both') {
    // Show results for both knees
    html += renderSideResults('Left Knee', recommendations.left);
    html += '<hr style="margin: 40px 0; border: 2px solid var(--border-color);">';
    html += renderSideResults('Right Knee', recommendations.right);
  } else {
    // Show results for selected knee
    const sideLabel = laterality === 'left' ? 'Left Knee' : 'Right Knee';
    html += renderSideResults(sideLabel, recommendations[laterality]);
  }

  html += `</div>`;

  resultsContainer.innerHTML = html;
}

/**
 * Render results for one side
 */
function renderSideResults(sideLabel, exercises) {
  if (!exercises || exercises.length === 0) {
    return `
      <div style="text-align: center; padding: 40px; background-color: #fff3cd; border-radius: 8px;">
        <p style="color: #856404; font-size: 16px;">No exercises match the current filters. Try adjusting the maximum difficulty level.</p>
      </div>
    `;
  }

  let html = `<h4 style="color: var(--dark-color); margin-bottom: 25px; font-size: 20px;">${sideLabel}</h4>`;

  html += '<div class="exercise-list">';

  exercises.forEach((item, index) => {
    const ex = item.exercise;
    const posColor = getPositionColor(item.position);

    html += `
      <div class="exercise-card">
        <div>
          <span class="exercise-rank">#${index + 1}</span>
          <span class="exercise-name">${ex.exercise_name}</span>
        </div>

        <div class="exercise-details">
          <div class="detail-item">
            <span class="detail-label">Position:</span>
            <span class="color-badge" style="background-color: ${posColor.bg}; color: ${posColor.text};">
              ${getPositionName(item.position)}
            </span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Difficulty:</span>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-weight: 600; color: var(--dark-color);">Level ${ex.difficulty_level}</span>
              ${getDifficultySignalBars(ex.difficulty_level)}
            </div>
          </div>
          <div class="detail-item">
            <span class="detail-label">Deficit-Recruitment:</span>
            <span class="detail-value">${item.deficitRecruitmentScore.toFixed(4)}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Position Multiplier:</span>
            <span class="detail-value">${item.multiplier.toFixed(3)}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Final Score:</span>
            <span class="detail-value" style="color: var(--secondary-color); font-size: 1.2em;">${item.finalScore.toFixed(4)}</span>
          </div>
        </div>

        <!-- Muscle Breakdown -->
        ${index < 5 ? renderMuscleBreakdown(item.muscleBreakdown) : ''}
      </div>
    `;
  });

  html += '</div>';

  return html;
}

/**
 * Render muscle breakdown for an exercise
 */
function renderMuscleBreakdown(breakdown) {
  return `
    <details class="muscle-breakdown">
      <summary>View Muscle Breakdown</summary>
      <table class="breakdown-table">
        <thead>
          <tr>
            <th>Muscle</th>
            <th>Str</th>
            <th>Def</th>
            <th>Rec</th>
            <th>Raw</th>
            <th>Norm</th>
            <th>Wgt</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody>
          ${Object.entries(breakdown).map(([muscle, details]) => `
            <tr>
              <td style="text-align: left; font-size: 11px;">${getMuscleDisplayName(muscle)}</td>
              <td>${details.strength}</td>
              <td>${details.deficit}</td>
              <td>${details.recruitment}</td>
              <td>${details.rawScore}</td>
              <td>${details.normalized.toFixed(3)}</td>
              <td>${details.weight.toFixed(3)}</td>
              <td>${details.weightedScore.toFixed(4)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <p style="margin-top: 10px; font-size: 12px; color: var(--text-light);">
        <strong>Legend:</strong> Str=Strength, Def=Deficit, Rec=Recruitment, Raw=Deficit×Recruitment,
        Norm=Raw/25, Wgt=Weight, Score=Norm×Wgt
      </p>
    </details>
  `;
}
