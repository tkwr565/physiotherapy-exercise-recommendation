/**
 * Exercise Query Helper - Normalized Schema v3.0
 *
 * This module provides functions to query the normalized exercise database
 * and transform it into the denormalized format expected by the algorithm.
 *
 * Schema Structure:
 * - exercises: Core exercise data
 * - exercise_positions: Junction table for positions
 * - exercise_muscles: Muscle recruitment data
 */

import { supabase } from './supabase.js';

/**
 * Fetch all exercises with positions and muscles in denormalized format
 * This function transforms the normalized v3.0 schema back to the format
 * expected by the algorithm (flat structure with boolean position fields
 * and numeric muscle fields)
 *
 * @returns {Promise<Array>} Array of exercises in denormalized format
 */
export async function fetchExercisesForAlgorithm() {
  try {
    // Fetch all exercises
    const { data: exercises, error: exerciseError } = await supabase
      .from('exercises')
      .select('*');

    if (exerciseError) throw exerciseError;
    if (!exercises || exercises.length === 0) {
      console.warn('[Exercise Queries] No exercises found in database');
      return [];
    }

    // Fetch all exercise positions
    const { data: positions, error: positionError } = await supabase
      .from('exercise_positions')
      .select('*');

    if (positionError) throw positionError;

    // Fetch all exercise muscles
    const { data: muscles, error: muscleError } = await supabase
      .from('exercise_muscles')
      .select('*');

    if (muscleError) throw muscleError;

    // Transform to denormalized format
    const denormalizedExercises = exercises.map(exercise => {
      // Get positions for this exercise
      const exercisePositions = positions?.filter(p => p.exercise_id === exercise.id) || [];

      // Get muscles for this exercise
      const exerciseMuscles = muscles?.filter(m => m.exercise_id === exercise.id) || [];

      // Create denormalized object
      const denormalized = {
        ...exercise,
        // Add boolean position fields (expected by algorithm)
        position_sl_stand: exercisePositions.some(p => p.position === 'SL_stand'),
        position_split_stand: exercisePositions.some(p => p.position === 'split_stand'),
        position_dl_stand: exercisePositions.some(p => p.position === 'DL_stand'),
        position_quadruped: exercisePositions.some(p => p.position === 'quadruped'),
        position_supine_lying: exercisePositions.some(p => p.position === 'supine_lying'),
        position_side_lying: exercisePositions.some(p => p.position === 'side_lying'),

        // Add numeric muscle fields (expected by algorithm)
        muscle_quad: getMuscleValue(exerciseMuscles, 'quad'),
        muscle_hamstring: getMuscleValue(exerciseMuscles, 'hamstring'),
        muscle_glute_max: getMuscleValue(exerciseMuscles, 'glute_max'),
        muscle_glute_med_min: getMuscleValue(exerciseMuscles, 'glute_med_min'),
        muscle_adductors: getMuscleValue(exerciseMuscles, 'adductors'),
        muscle_hip_flexors: getMuscleValue(exerciseMuscles, 'hip_flexors'),
      };

      return denormalized;
    });

    console.log(`[Exercise Queries] Fetched ${denormalizedExercises.length} exercises`);
    return denormalizedExercises;

  } catch (error) {
    console.error('[Exercise Queries] Error fetching exercises:', error);
    throw error;
  }
}

/**
 * Get muscle recruitment value from exercise_muscles array
 * @param {Array} exerciseMuscles - Array of muscle records for an exercise
 * @param {string} muscleName - Name of muscle (quad, hamstring, etc.)
 * @returns {number} Muscle value (0-5 scale)
 */
function getMuscleValue(exerciseMuscles, muscleName) {
  const muscleRecord = exerciseMuscles.find(m => m.muscle === muscleName);
  return muscleRecord?.muscle_value || 0;
}

/**
 * Get muscle type (P=Primary, N=Secondary, S=Stabiliser)
 * @param {Array} exerciseMuscles - Array of muscle records for an exercise
 * @param {string} muscleName - Name of muscle
 * @returns {string|null} Muscle type ('P', 'N', 'S', or null)
 */
export function getMuscleType(exerciseMuscles, muscleName) {
  const muscleRecord = exerciseMuscles.find(m => m.muscle === muscleName);
  return muscleRecord?.muscle_type || null;
}

/**
 * Fetch exercises with full normalized structure (for display purposes)
 * This returns the exercises in their normalized form with related tables
 *
 * @returns {Promise<Array>} Array of exercises with positions and muscles as arrays
 */
export async function fetchExercisesNormalized() {
  try {
    // Note: Supabase doesn't support nested array aggregation directly,
    // so we fetch separately and combine (same as above but keep structure)

    const { data: exercises, error: exerciseError } = await supabase
      .from('exercises')
      .select('*');

    if (exerciseError) throw exerciseError;

    const { data: positions, error: positionError } = await supabase
      .from('exercise_positions')
      .select('*');

    if (positionError) throw positionError;

    const { data: muscles, error: muscleError } = await supabase
      .from('exercise_muscles')
      .select('*');

    if (muscleError) throw muscleError;

    // Combine into normalized structure
    const normalizedExercises = exercises.map(exercise => ({
      ...exercise,
      positions: positions?.filter(p => p.exercise_id === exercise.id) || [],
      muscles: muscles?.filter(m => m.exercise_id === exercise.id) || [],
    }));

    return normalizedExercises;

  } catch (error) {
    console.error('[Exercise Queries] Error fetching normalized exercises:', error);
    throw error;
  }
}
