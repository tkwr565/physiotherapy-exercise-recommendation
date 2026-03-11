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
 * Calculate STS (Sit-to-Stand) performance category based on Hong Kong norms
 * Reference: Updated Hong Kong normative data 2026
 *
 * @param {number} repetitionCount - Number of repetitions completed in 30 seconds
 * @param {number} age - Patient age
 * @param {string} gender - 'male' or 'female'
 * @returns {Object} { performance: 'Below Average'|'Average'|'Above Average', benchmarkRange: '11-14', normalizedScore: 0-1 }
 */
export function calculateSTSScore(repetitionCount, age, gender) {
    // Hong Kong normative benchmarks with performance ranges
    const benchmarks = {
        male: {
            '60-64': { below: 11, avgMin: 12, avgMax: 16, above: 17 },
            '65-69': { below: 10, avgMin: 11, avgMax: 15, above: 16 },
            '70-74': { below: 9, avgMin: 10, avgMax: 13, above: 14 },
            '75-79': { below: 9, avgMin: 10, avgMax: 13, above: 14 },
            '80-84': { below: 9, avgMin: 10, avgMax: 13, above: 14 },
            '85-89': { below: 6, avgMin: 7, avgMax: 10, above: 11 },
            '90+': { below: 4, avgMin: 5, avgMax: 7, above: 8 }
        },
        female: {
            '60-64': { below: 10, avgMin: 11, avgMax: 14, above: 15 },
            '65-69': { below: 9, avgMin: 10, avgMax: 13, above: 14 },
            '70-74': { below: 8, avgMin: 9, avgMax: 12, above: 13 },
            '75-79': { below: 7, avgMin: 8, avgMax: 11, above: 12 },
            '80-84': { below: 7, avgMin: 8, avgMax: 11, above: 12 },
            '85-89': { below: 7, avgMin: 8, avgMax: 9, above: 10 },
            '90+': { below: 6, avgMin: 7, avgMax: 9, above: 10 }
        }
    };

    const ageGroup = getAgeGroup(age);
    const benchmarkData = benchmarks[gender]?.[ageGroup] || { below: 10, avgMin: 11, avgMax: 14, above: 15 };

    // Determine performance category
    let performance;
    if (repetitionCount <= benchmarkData.below) {
        performance = 'Below Average';
    } else if (repetitionCount >= benchmarkData.above) {
        performance = 'Above Average';
    } else {
        performance = 'Average';
    }

    // Calculate normalized score for algorithm use (0-1 scale)
    // Map performance to numeric values: Below=0.3, Average=0.65, Above=0.9
    const normalizedScore = performance === 'Above Average' ? 0.9
                          : performance === 'Average' ? 0.65
                          : 0.3;

    return {
        performance: performance,
        benchmarkRange: `${benchmarkData.avgMin}-${benchmarkData.avgMax}`,
        normalizedScore: normalizedScore
    };
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
 * Rank ALL positions based on functional capability
 * Reference: OA Knee doc lines 796-814 (Layer 1 ranking)
 *
 * @param {Object} positionMultipliers - Position multipliers from calculatePositionMultipliers()
 * @returns {Array} ALL positions sorted by multiplier (highest first)
 */
export function selectBestPositions(positionMultipliers) {
    // Create array of positions with their multipliers
    const positionArray = Object.entries(positionMultipliers).map(([position, multiplier]) => ({
        position,
        multiplier
    }));

    // Sort by multiplier (highest = best capability)
    const sortedPositions = positionArray.sort((a, b) => b.multiplier - a.multiplier);

    // Return ALL positions (renamed function but keeping for backward compatibility)
    return sortedPositions;
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
    console.log(`[getExercisesForPosition] Position: ${position}, Total exercises: ${exercises.length}`);

    if (position === 'lying') {
        // Combine both supine and side lying exercises
        const result = exercises.filter(ex =>
            ex.position_supine_lying === true ||
            ex.position_side_lying === true
        );
        console.log(`[getExercisesForPosition] Lying position: ${result.length} exercises`);
        return result;
    }

    // Standard position mapping
    const positionMap = {
        'DL_stand': 'position_dl_stand',
        'split_stand': 'position_split_stand',
        'SL_stand': 'position_sl_stand',
        'quadruped': 'position_quadruped'
    };

    const columnName = positionMap[position];
    console.log(`[getExercisesForPosition] Column name: ${columnName}`);

    if (!columnName) {
        console.log(`[getExercisesForPosition] No column name found for position ${position}`);
        return [];
    }

    const result = exercises.filter(ex => ex[columnName] === true);
    console.log(`[getExercisesForPosition] Filtered ${result.length} exercises for ${position}`);
    console.log(`[getExercisesForPosition] Sample exercise:`, result[0]);

    return result;
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
    console.log(`[rankExercises] Position ${position}: ${positionExercises.length} exercises found (before core filter)`);

    // STEP 1: Apply core stability filter (if needed)
    positionExercises = applyCoreStabilityFilter(positionExercises, trunkSway, hipSway);
    console.log(`[rankExercises] Position ${position}: ${positionExercises.length} exercises after core filter`);

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
    const stsResult = calculateSTSScore(
        stsData.repetition_count,
        stsData.age,
        stsData.gender
    );

    // STEP 4: Calculate enhanced combined score with conflict resolution
    const enhancedCombinedScore = calculateEnhancedCombinedScore(painAvg, symptomsAvg, stsResult.normalizedScore);

    // STEP 5: Rank ALL positions by capability
    const allPositions = selectBestPositions(positionMultipliers);
    console.log('[Algorithm] All positions ranked:', allPositions);

    // STEP 6: Rank exercises within EACH position (to see which have valid exercises)
    const allRecommendations = [];
    for (const { position, multiplier } of allPositions) {
        const rankedExercises = rankExercisesWithinPosition(
            position,
            exercises,
            enhancedCombinedScore,
            stsData.knee_alignment,
            questionnaireData.toe_touch_test,
            stsData.trunk_sway,
            stsData.hip_sway
        );

        allRecommendations.push({
            position,
            positionMultiplier: multiplier,
            exercises: rankedExercises
        });
    }

    // STEP 7: Select top 2 positions that have VALID exercises (not empty)
    const validRecommendations = allRecommendations.filter(rec => rec.exercises.length > 0);
    const recommendations = validRecommendations.slice(0, 2);

    console.log('[Algorithm] Valid positions with exercises:', validRecommendations.length);
    console.log('[Algorithm] Selected top 2:', recommendations.map(r => `${r.position} (${r.exercises.length} exercises)`));

    // Prepare final output
    return {
        positionMultipliers,
        allPositionRankings: allRecommendations, // All positions with their exercise counts
        scores: {
            painScore: (4 - painAvg) / 4,
            symptomScore: (4 - symptomsAvg) / 4,
            stsPerformance: stsResult.performance,
            stsBenchmarkRange: stsResult.benchmarkRange,
            stsNormalizedScore: stsResult.normalizedScore,
            combinedScore: enhancedCombinedScore
        },
        recommendations, // Top 2 positions with valid exercises
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
    if (age >= 90) return '90+';
    return '60-64'; // Default fallback for ages < 60
}
