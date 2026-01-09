/**
 * OA Knee Exercise Recommendation Algorithm
 * Implementation based on OA_Knee_Algorithm_Improvements_Summary.md
 *
 * This algorithm uses a two-layer ranking system:
 * - Layer 1: Position ranking by functional capability (position multipliers)
 * - Layer 2: Exercise ranking within positions by difficulty preference + biomechanical targeting
 */

/**
 * Calculate position multipliers from questionnaire data
 * Reference: OA Knee doc lines 116-183
 *
 * @param {Object} questionnaireData - All questionnaire responses (lowercase keys: f1, f2, p1, sp1, etc.)
 * @returns {Object} Position multipliers (0-1 scale, higher = better capability)
 */
export function calculatePositionMultipliers(questionnaireData) {
    // Position-specific question mappings
    const positions = {
        DL_stand: ['f3', 'f4', 'f5', 'f6', 'f8', 'sp1'],
        split_stand: ['f1', 'f2', 'f3', 'f7', 'f13', 'f15', 'sp1', 'sp4'],
        SL_stand: ['f1', 'f2', 'f4', 'f9', 'f11', 'sp1', 'sp2', 'sp3', 'sp4'],
        quadruped: ['f5', 'sp5', 'st2', 'p3', 'p4']
    };

    const multipliers = {};

    // Calculate average for each position and convert to multiplier
    for (const [position, questions] of Object.entries(positions)) {
        const values = questions.map(q => parseInt(questionnaireData[q]) || 0);
        const avg = calculateAverage(values);
        // Invert: higher questionnaire score (1-4) = worse function
        // So multiplier = (4 - avg) / 4 converts to 0-1 scale where higher = better
        multipliers[position] = (4 - avg) / 4;
    }

    // Special lying position calculation: inverse of best active position
    // Better at weight-bearing = less need for lying exercises
    const bestActive = Math.max(
        multipliers.DL_stand,
        multipliers.split_stand,
        multipliers.SL_stand,
        multipliers.quadruped
    );
    multipliers.lying = Math.max(0.1, 1.0 - bestActive);

    return multipliers;
}

/**
 * Calculate STS (Sit-to-Stand) normalized score
 * Reference: OA Knee doc lines 695-724
 *
 * @param {number} repetitionCount - Number of repetitions completed in 30 seconds
 * @param {number} age - Patient age
 * @param {string} gender - 'male' or 'female'
 * @returns {number} STS score (0-1 scale, 1.0 = at or above benchmark)
 */
export function calculateSTSScore(repetitionCount, age, gender) {
    // Age-specific normative benchmarks
    const benchmarks = {
        male: {
            '60-64': 14, '65-69': 12, '70-74': 12, '75-79': 11,
            '80-84': 10, '85-89': 8, '90-94': 7
        },
        female: {
            '60-64': 12, '65-69': 11, '70-74': 10, '75-79': 10,
            '80-84': 9, '85-89': 8, '90-94': 4
        }
    };

    const ageGroup = getAgeGroup(age);
    const benchmark = benchmarks[gender]?.[ageGroup] || 12; // Default to 12 if out of range
    const performanceRatio = repetitionCount / benchmark;

    // Average or above = perfect score (1.0)
    // Below average = proportional score (e.g., 10/12 = 0.83)
    return Math.min(1.0, performanceRatio);
}

/**
 * Calculate enhanced combined score with conflict resolution
 * Reference: OA Knee doc lines 86-112
 *
 * @param {number} painAvg - Average pain score (1-4 scale)
 * @param {number} symptomsAvg - Average symptom score (1-4 scale)
 * @param {number} stsScore - STS performance score (0-1 scale)
 * @returns {number} Combined score (0.1-0.9 scale, higher = better capability)
 */
export function calculateEnhancedCombinedScore(painAvg, symptomsAvg, stsScore) {
    // Invert pain/symptoms (higher questionnaire score = worse)
    // Convert 1-4 scale to 0-1 scale where higher = better
    const painScore = (4 - painAvg) / 4;
    const symptomScore = (4 - symptomsAvg) / 4;

    // Combined subjective experience (average of pain and symptoms)
    const subjectiveScore = (painScore * 0.5) + (symptomScore * 0.5);

    // Base calculation: 50% performance, 25% pain, 25% symptoms
    let combinedScore = (stsScore * 0.5) + (painScore * 0.25) + (symptomScore * 0.25);

    // Conflict Resolution: Objective vs Subjective
    // If there's a big mismatch (>0.5), take the conservative approach
    if (Math.abs(stsScore - subjectiveScore) > 0.5) {
        const conservativeScore = Math.min(stsScore, subjectiveScore);
        combinedScore = (conservativeScore * 0.6) + (combinedScore * 0.4);
    }

    // Floor/Ceiling Effects: Prevent extreme values
    combinedScore = Math.max(0.1, Math.min(0.9, combinedScore));

    return combinedScore;
}

/**
 * Calculate difficulty modifier (preference for exercises matching patient capability)
 * Reference: OA Knee doc lines 727-764
 *
 * @param {number} combinedScore - Enhanced combined score (0-1 scale)
 * @param {number} exerciseDifficulty - Exercise difficulty (1-10 scale)
 * @returns {number} Difficulty modifier (0-1 scale, closer to preferred = higher)
 */
export function calculateDifficultyModifier(combinedScore, exerciseDifficulty) {
    // Map combined score (0-1) to preferred difficulty (1-10)
    const preferredDifficulty = 1 + (combinedScore * 9);

    // Calculate distance from preferred difficulty
    const difficultyDistance = Math.abs(exerciseDifficulty - preferredDifficulty);

    // Convert to modifier: closer = higher score
    // Decay rate of 0.2 means each point of distance reduces score
    const difficultyModifier = 1 / (1 + difficultyDistance * 0.2);

    return difficultyModifier;
}

/**
 * Apply core stability filter if trunk or hip sway is present
 * Reference: OA Knee doc lines 573-629
 *
 * @param {Array} exercises - Array of exercise objects
 * @param {string} trunkSway - 'present' or 'absent'
 * @param {string} hipSway - 'present' or 'absent'
 * @returns {Array} Filtered exercises (only core_ipsi=true if instability present)
 */
export function applyCoreStabilityFilter(exercises, trunkSway, hipSway) {
    const needsCoreWork = (trunkSway === 'present' || hipSway === 'present');

    if (needsCoreWork) {
        // HARD FILTER: Only show core ipsilateral exercises
        return exercises.filter(ex => ex.core_ipsi === true);
    }

    // No filter: Show all exercises
    return exercises;
}

/**
 * Calculate alignment modifier (boost exercises targeting specific muscle weaknesses)
 * Reference: OA Knee doc lines 633-692
 *
 * @param {string} kneeAlignment - 'normal', 'valgus', or 'varus'
 * @param {Object} exercise - Exercise object with muscle recruitment data
 * @returns {number} Alignment modifier (1.0-2.0 scale, higher = more relevant)
 */
export function calculateAlignmentModifier(kneeAlignment, exercise) {
    let alignmentModifier = 1.0; // Default for normal alignment

    if (kneeAlignment === 'valgus') {
        // Valgus (knock-knees): Boost exercises that target gluteus medius/minimus
        const gluteMedMinRecruitment = exercise.muscle_glute_med_min || 0; // 0-5 scale
        alignmentModifier = 1.0 + (gluteMedMinRecruitment / 5.0); // 1.0-2.0 range
    }
    else if (kneeAlignment === 'varus') {
        // Varus (bow-legged): Boost exercises that target adductors
        const adductorRecruitment = exercise.muscle_adductors || 0; // 0-5 scale
        alignmentModifier = 1.0 + (adductorRecruitment / 5.0); // 1.0-2.0 range
    }

    return alignmentModifier;
}

/**
 * Calculate flexibility modifier (boost exercises for hamstring/glute max if poor flexibility)
 * Reference: OA Knee doc lines 186-254
 *
 * @param {string} toeTouch - 'can' or 'cannot'
 * @param {Object} exercise - Exercise object with muscle recruitment data
 * @returns {number} Flexibility modifier (1.0-1.4 scale)
 */
export function calculateFlexibilityModifier(toeTouch, exercise) {
    let flexibilityModifier = 1.0; // Default for good flexibility

    if (toeTouch === 'cannot') {
        // Poor flexibility: Boost hamstring and glute max exercises
        const hamstringRecruitment = exercise.muscle_hamstring || 0; // 0-5 scale
        const gluteMaxRecruitment = exercise.muscle_glute_max || 0; // 0-5 scale

        // Take the higher of the two target muscles
        const maxTargetRecruitment = Math.max(hamstringRecruitment, gluteMaxRecruitment);

        // Lower power multiplier than alignment (1.0 - 1.4 range)
        flexibilityModifier = 1.0 + (maxTargetRecruitment / 12.5);
    }

    return flexibilityModifier;
}

/**
 * Select top 2 positions based on functional capability
 * Reference: OA Knee doc lines 796-814 (Layer 1 ranking)
 *
 * @param {Object} positionMultipliers - Position multipliers from calculatePositionMultipliers()
 * @returns {Array} Top 2 positions sorted by multiplier (highest first)
 */
export function selectBestPositions(positionMultipliers) {
    // Create array of positions with their multipliers
    const positionArray = Object.entries(positionMultipliers).map(([position, multiplier]) => ({
        position,
        multiplier
    }));

    // Sort by multiplier (highest = best capability)
    const sortedPositions = positionArray.sort((a, b) => b.multiplier - a.multiplier);

    // Return top 2 positions
    return sortedPositions.slice(0, 2);
}

/**
 * Get exercises for a specific position
 * Reference: OA Knee doc lines 142-164
 *
 * @param {string} position - Position name
 * @param {Array} exercises - All exercises from database
 * @returns {Array} Exercises matching the position
 */
export function getExercisesForPosition(position, exercises) {
    if (position === 'lying') {
        // Combine both supine and side lying exercises
        return exercises.filter(ex =>
            ex.position_supine_lying === true ||
            ex.position_side_lying === true
        );
    }

    // Standard position mapping
    const positionMap = {
        'DL_stand': 'position_dl_stand',
        'split_stand': 'position_split_stand',
        'SL_stand': 'position_sl_stand',
        'quadruped': 'position_quadruped'
    };

    const columnName = positionMap[position];
    if (!columnName) return [];

    return exercises.filter(ex => ex[columnName] === true);
}

/**
 * Rank exercises within a position using comprehensive scoring
 * Reference: OA Knee doc lines 816-846 (Layer 2 ranking)
 *
 * @param {string} position - Position name
 * @param {Array} exercises - All exercises from database
 * @param {number} enhancedCombinedScore - Combined capability score
 * @param {string} kneeAlignment - 'normal', 'valgus', or 'varus'
 * @param {string} toeTouch - 'can' or 'cannot'
 * @param {string} trunkSway - 'present' or 'absent'
 * @param {string} hipSway - 'present' or 'absent'
 * @returns {Array} Top 2 exercises with scoring breakdown
 */
export function rankExercisesWithinPosition(
    position,
    exercises,
    enhancedCombinedScore,
    kneeAlignment,
    toeTouch,
    trunkSway,
    hipSway
) {
    // Get exercises for this position
    let positionExercises = getExercisesForPosition(position, exercises);

    // STEP 1: Apply core stability filter (if needed)
    positionExercises = applyCoreStabilityFilter(positionExercises, trunkSway, hipSway);

    // STEP 2: Calculate comprehensive score for each exercise
    const scoredExercises = positionExercises.map(exercise => {
        const difficultyScore = calculateDifficultyModifier(enhancedCombinedScore, exercise.difficulty_level);
        const alignmentModifier = calculateAlignmentModifier(kneeAlignment, exercise);
        const flexibilityModifier = calculateFlexibilityModifier(toeTouch, exercise);

        // Apply all modifiers
        const finalScore = difficultyScore * alignmentModifier * flexibilityModifier;

        return {
            exercise,
            difficultyScore,
            alignmentModifier,
            flexibilityModifier,
            finalScore
        };
    });

    // STEP 3: Sort by final score and select top 2
    const sortedExercises = scoredExercises.sort((a, b) => b.finalScore - a.finalScore);
    return sortedExercises.slice(0, 2);
}

/**
 * Main algorithm orchestration function
 * Reference: OA Knee doc lines 796-875
 *
 * @param {Object} questionnaireData - Questionnaire responses (lowercase keys)
 * @param {Object} stsData - STS assessment data
 * @param {Array} exercises - All exercises from database
 * @returns {Object} Complete recommendations with scores and rankings
 */
export async function calculateRecommendations(questionnaireData, stsData, exercises) {
    // STEP 1: Calculate position multipliers
    const positionMultipliers = calculatePositionMultipliers(questionnaireData);

    // STEP 2: Calculate pain and symptom averages
    const painQuestions = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8', 'p9'];
    const symptomQuestions = ['sp1', 'sp2', 'sp3', 'sp4', 'sp5'];

    const painValues = painQuestions.map(q => parseInt(questionnaireData[q]) || 0);
    const symptomValues = symptomQuestions.map(q => parseInt(questionnaireData[q]) || 0);

    const painAvg = calculateAverage(painValues);
    const symptomsAvg = calculateAverage(symptomValues);

    // STEP 3: Calculate STS score
    const stsScore = calculateSTSScore(
        stsData.repetition_count,
        stsData.age,
        stsData.gender
    );

    // STEP 4: Calculate enhanced combined score with conflict resolution
    const enhancedCombinedScore = calculateEnhancedCombinedScore(painAvg, symptomsAvg, stsScore);

    // STEP 5: Layer 1 - Select top 2 positions
    const selectedPositions = selectBestPositions(positionMultipliers);

    // STEP 6: Layer 2 - Rank exercises within each selected position
    const recommendations = [];
    for (const { position, multiplier } of selectedPositions) {
        const rankedExercises = rankExercisesWithinPosition(
            position,
            exercises,
            enhancedCombinedScore,
            stsData.knee_alignment,
            questionnaireData.toe_touch_test,
            stsData.trunk_sway,
            stsData.hip_sway
        );

        recommendations.push({
            position,
            positionMultiplier: multiplier,
            exercises: rankedExercises
        });
    }

    // Prepare final output
    return {
        positionMultipliers,
        scores: {
            painScore: (4 - painAvg) / 4,
            symptomScore: (4 - symptomsAvg) / 4,
            stsScore,
            combinedScore: enhancedCombinedScore
        },
        recommendations,
        biomechanicalFlags: {
            coreStabilityRequired: stsData.trunk_sway === 'present' || stsData.hip_sway === 'present',
            flexibilityDeficit: questionnaireData.toe_touch_test === 'cannot',
            alignmentIssue: stsData.knee_alignment !== 'normal'
        }
    };
}

/**
 * Helper: Calculate average of an array of numbers
 */
function calculateAverage(values) {
    const validValues = values.filter(v => !isNaN(v) && v > 0);
    if (validValues.length === 0) return 0;
    return validValues.reduce((sum, v) => sum + v, 0) / validValues.length;
}

/**
 * Helper: Get age group for STS benchmark lookup
 */
function getAgeGroup(age) {
    if (age >= 60 && age < 65) return '60-64';
    if (age >= 65 && age < 70) return '65-69';
    if (age >= 70 && age < 75) return '70-74';
    if (age >= 75 && age < 80) return '75-79';
    if (age >= 80 && age < 85) return '80-84';
    if (age >= 85 && age < 90) return '85-89';
    if (age >= 90 && age < 95) return '90-94';
    return '60-64'; // Default fallback
}
