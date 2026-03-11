import { positionDefinitions } from './questionnaire-data.js';

/**
 * Calculate position multipliers from questionnaire responses
 * Algorithm from reference HTML implementation
 */
export function calculatePositionMultipliers(responses) {
  // Pain and symptom questions are shared across all positions
  const painQuestions = ['P1', 'P2', 'P5', 'P6', 'P9'];
  const symptomQuestions = ['S1', 'S2', 'S3', 'S4', 'S5'];

  // Calculate averages
  const painAvg = calculateAverage(responses, painQuestions);
  const symptomsAvg = calculateAverage(responses, symptomQuestions);

  const multipliers = {};
  const compositeScores = [];

  // Calculate for each position
  for (const [posKey, posData] of Object.entries(positionDefinitions)) {
    const coreAvg = calculateAverage(responses, posData.core);

    // Composite score: (Core × 0.6) + (Pain × 0.25) + (Symptoms × 0.15)
    const composite = (coreAvg * 0.6) + (painAvg * 0.25) + (symptomsAvg * 0.15);

    // Multiplier: (4 - composite) ÷ 4
    const multiplier = (4 - composite) / 4;

    multipliers[posKey] = {
      name: posData.name,
      coreAvg,
      composite,
      multiplier: Math.max(0, multiplier) // Ensure non-negative
    };

    compositeScores.push(composite);
  }

  // Lying position uses penalty-based calculation
  const bestActiveScore = Math.min(...compositeScores);
  const lyingPenalty = bestActiveScore / 4;
  const lyingMultiplier = Math.max(0.1, 1.0 - lyingPenalty);

  return {
    position_sl_stand_multiplier: multipliers.SL_stand.multiplier,
    position_split_stand_multiplier: multipliers.split_stand.multiplier,
    position_dl_stand_multiplier: multipliers.DL_stand.multiplier,
    position_quadruped_multiplier: multipliers.quadruped.multiplier,
    position_lying_multiplier: lyingMultiplier,
    // Additional data for debugging/display
    _debug: {
      painAvg,
      symptomsAvg,
      positions: multipliers,
      bestActiveScore,
      lyingPenalty
    }
  };
}

/**
 * Calculate average of specific question responses
 */
function calculateAverage(responses, questionCodes) {
  const values = questionCodes.map(code => responses[code]);
  const sum = values.reduce((acc, val) => acc + val, 0);
  return sum / values.length;
}

/**
 * Validate that all required questions are answered
 */
export function validateResponses(responses, requiredQuestions) {
  const answeredQuestions = Object.keys(responses);
  const missingQuestions = requiredQuestions.filter(q => !answeredQuestions.includes(q));

  return {
    isValid: missingQuestions.length === 0,
    missingQuestions,
    totalAnswered: answeredQuestions.length,
    totalRequired: requiredQuestions.length
  };
}
