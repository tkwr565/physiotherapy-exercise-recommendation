import { supabase } from '../shared/supabase.js';
import { fetchExercisesForAlgorithm } from '../shared/exercise-queries.js';

const muscleMapping = {
  quad: 'muscle_quad',
  hamstring: 'muscle_hamstring',
  glute_max: 'muscle_glute_max',
  glute_med_min: 'muscle_glute_med_min',
  adductors: 'muscle_adductors',
  hip_flexors: 'muscle_hip_flexors',
  calves: 'muscle_calves'
};

/**
 * Calculate exercise recommendations
 */
export async function calculateRecommendations(patientData, laterality, muscleFocus, maxDifficulty) {
  // Fetch all exercises from database (denormalized format)
  // This function queries the normalized v3.0 schema and transforms it
  // into the flat structure with muscle_* and position_* fields
  const exercises = await fetchExercisesForAlgorithm();

  if (!exercises || exercises.length === 0) {
    console.error('[Recommendations] No exercises available');
    throw new Error('No exercises found in database');
  }

  // Determine which side(s) to use
  const sides = laterality === 'both' ? ['left', 'right'] : [laterality];

  const results = {};

  sides.forEach(side => {
    // Extract muscle strengths for this side
    const muscleStrengths = {
      quad: patientData[`${side}_quad_strength`],
      hamstring: patientData[`${side}_hamstring_strength`],
      glute_max: patientData[`${side}_glute_max_strength`],
      glute_med_min: patientData[`${side}_glute_med_min_strength`],
      adductors: patientData[`${side}_adductors_strength`],
      hip_flexors: patientData[`${side}_hip_flexors_strength`],
      calves: patientData[`${side}_calves_strength`]
    };

    // Calculate muscle weights
    const muscleWeights = calculateMuscleWeights(muscleFocus);

    // Score each exercise
    const scoredExercises = [];

    exercises.forEach(exercise => {
      // Apply difficulty filter
      if (maxDifficulty && exercise.difficulty_level > maxDifficulty) {
        return;
      }

      // Calculate deficit-recruitment score
      let totalScore = 0;
      const muscleBreakdown = {};

      Object.keys(muscleStrengths).forEach(muscle => {
        const strength = muscleStrengths[muscle];
        const deficit = 5 - strength;
        const recruitment = exercise[muscleMapping[muscle]] || 0;
        const rawScore = deficit * recruitment;
        const normalized = rawScore / 25.0;
        const weight = muscleWeights[muscle];
        const weightedScore = normalized * weight;

        totalScore += weightedScore;

        muscleBreakdown[muscle] = {
          strength,
          deficit,
          recruitment,
          rawScore,
          normalized,
          weight,
          weightedScore
        };
      });

      // Determine exercise position
      const position = getExercisePosition(exercise);

      // Get position multiplier
      const multiplier = getPositionMultiplier(patientData, position);

      // Calculate final score
      const finalScore = totalScore * multiplier;

      scoredExercises.push({
        exercise,
        position,
        deficitRecruitmentScore: totalScore,
        multiplier,
        finalScore,
        muscleBreakdown
      });
    });

    // Sort by final score (descending) and take top 10
    scoredExercises.sort((a, b) => b.finalScore - a.finalScore);
    results[side] = scoredExercises.slice(0, 10);
  });

  return results;
}

/**
 * Calculate muscle weights based on focus
 */
function calculateMuscleWeights(muscleFocus) {
  if (!muscleFocus) {
    // Equal weights (1/7 each)
    return {
      quad: 1 / 7,
      hamstring: 1 / 7,
      glute_max: 1 / 7,
      glute_med_min: 1 / 7,
      adductors: 1 / 7,
      hip_flexors: 1 / 7,
      calves: 1 / 7
    };
  }

  // Focused muscle gets 3x weight, others get 1x
  // Total = 3 + 6×1 = 13
  const weights = {};
  Object.keys(muscleMapping).forEach(muscle => {
    weights[muscle] = muscle === muscleFocus ? 3 / 13 : 1 / 13;
  });

  return weights;
}

/**
 * Get exercise position
 */
function getExercisePosition(exercise) {
  if (exercise.position_sl_stand) return 'SL_stand';
  if (exercise.position_split_stand) return 'split_stand';
  if (exercise.position_dl_stand) return 'DL_stand';
  if (exercise.position_quadruped) return 'quadruped';
  if (exercise.position_lying) return 'lying';
  return 'unknown';
}

/**
 * Get position multiplier from patient data
 */
function getPositionMultiplier(patientData, position) {
  const multiplierMap = {
    'SL_stand': 'position_sl_stand_multiplier',
    'split_stand': 'position_split_stand_multiplier',
    'DL_stand': 'position_dl_stand_multiplier',
    'quadruped': 'position_quadruped_multiplier',
    'lying': 'position_lying_multiplier'
  };

  const field = multiplierMap[position];
  return patientData[field] || 0;
}

/**
 * Get position display name
 */
export function getPositionName(position) {
  const names = {
    'SL_stand': 'Single Leg Stand',
    'split_stand': 'Split Stand',
    'DL_stand': 'Double Leg Stand',
    'quadruped': 'Quadruped',
    'lying': 'Lying'
  };
  return names[position] || position;
}

/**
 * Get muscle display name
 */
export function getMuscleDisplayName(muscle) {
  const names = {
    quad: 'Quadriceps',
    hamstring: 'Hamstrings',
    glute_max: 'Gluteus Maximus',
    glute_med_min: 'Gluteus Medius/Minimus',
    adductors: 'Adductors',
    hip_flexors: 'Hip Flexors',
    calves: 'Calves'
  };
  return names[muscle] || muscle;
}
