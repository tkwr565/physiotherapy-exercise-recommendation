/**
 * Muscle Name Translations
 * Maps muscle group IDs to bilingual names
 */

export const muscleTranslations = {
  en: {
    quad: 'Quadriceps',
    hamstring: 'Hamstrings',
    glute_max: 'Gluteus Maximus',
    hip_flexors: 'Hip Flexors',
    glute_med_min: 'Gluteus Medius/Minimus',
    adductors: 'Adductors',
    core: 'Core',
    core_ipsi: 'Core (Ipsilateral)',
    core_contra: 'Core (Contralateral)'
  },
  'zh-TW': {
    quad: '股四頭肌',
    hamstring: '膕旁肌',
    glute_max: '臀大肌',
    hip_flexors: '髖屈肌',
    glute_med_min: '臀中肌/臀小肌',
    adductors: '內收肌',
    core: '核心肌群',
    core_ipsi: '核心肌群（同側）',
    core_contra: '核心肌群（對側）'
  }
};

/**
 * Generate muscle description from exercise data
 * @param {Object} exercise - Exercise object from database
 * @param {string} lang - Language code ('en' or 'zh-TW')
 * @returns {string} Comma-separated muscle names
 */
export function getMuscleDescription(exercise, lang = 'en') {
  const muscles = [];
  const translations = muscleTranslations[lang] || muscleTranslations['en'];

  // Check each muscle group and add if level > 0
  if (exercise.muscle_quad > 0) muscles.push(translations.quad);
  if (exercise.muscle_hamstring > 0) muscles.push(translations.hamstring);
  if (exercise.muscle_glute_max > 0) muscles.push(translations.glute_max);
  if (exercise.muscle_hip_flexors > 0) muscles.push(translations.hip_flexors);
  if (exercise.muscle_glute_med_min > 0) muscles.push(translations.glute_med_min);
  if (exercise.muscle_adductors > 0) muscles.push(translations.adductors);

  // Core muscles (check boolean flags)
  if (exercise.core_ipsi) muscles.push(translations.core_ipsi);
  if (exercise.core_contra) muscles.push(translations.core_contra);

  return muscles.length > 0 ? muscles.join(', ') : (lang === 'zh-TW' ? '全身' : 'Full body');
}

/**
 * Get detailed muscle engagement info
 * @param {Object} exercise - Exercise object from database
 * @returns {Object} Muscle engagement details with levels
 */
export function getMuscleEngagement(exercise) {
  return {
    quad: exercise.muscle_quad || 0,
    hamstring: exercise.muscle_hamstring || 0,
    glute_max: exercise.muscle_glute_max || 0,
    hip_flexors: exercise.muscle_hip_flexors || 0,
    glute_med_min: exercise.muscle_glute_med_min || 0,
    adductors: exercise.muscle_adductors || 0,
    core_ipsi: exercise.core_ipsi || false,
    core_contra: exercise.core_contra || false
  };
}

/**
 * Get primary target muscles (highest engagement levels only)
 * @param {Object} exercise - Exercise object from database
 * @param {string} lang - Language code
 * @returns {string} Comma-separated primary muscle names (only muscles with max engagement)
 */
export function getPrimaryMuscles(exercise, lang = 'en') {
  const translations = muscleTranslations[lang] || muscleTranslations['en'];

  // Create array of muscles with their engagement levels
  const muscleEngagements = [
    { name: translations.quad, level: exercise.muscle_quad || 0 },
    { name: translations.hamstring, level: exercise.muscle_hamstring || 0 },
    { name: translations.glute_max, level: exercise.muscle_glute_max || 0 },
    { name: translations.hip_flexors, level: exercise.muscle_hip_flexors || 0 },
    { name: translations.glute_med_min, level: exercise.muscle_glute_med_min || 0 },
    { name: translations.adductors, level: exercise.muscle_adductors || 0 }
  ];

  // Find the highest engagement level
  const maxLevel = Math.max(...muscleEngagements.map(m => m.level));

  // If no muscles engaged, return fallback
  if (maxLevel === 0) {
    return lang === 'zh-TW' ? '全身' : 'Full body';
  }

  // Get only muscles with the highest engagement level
  const primaryMuscles = muscleEngagements
    .filter(m => m.level === maxLevel)
    .map(m => m.name);

  return primaryMuscles.join(', ');
}

export default {
  muscleTranslations,
  getMuscleDescription,
  getMuscleEngagement,
  getPrimaryMuscles
};
