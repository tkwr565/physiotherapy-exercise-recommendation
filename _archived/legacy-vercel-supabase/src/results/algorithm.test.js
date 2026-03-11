/**
 * Comprehensive Test Suite for OA Knee Exercise Recommendation Algorithm
 *
 * Tests all functions and expected behaviors documented in:
 * - OA_Knee_Algorithm_Improvements_Summary.md
 * - PROGRESS.md (lines 716-725: Testing checklist)
 */

import {
    calculatePositionMultipliers,
    calculateSTSScore,
    calculateEnhancedCombinedScore,
    calculateDifficultyModifier,
    applyCoreStabilityFilter,
    calculateAlignmentModifier,
    calculateFlexibilityModifier,
    selectBestPositions,
    getExercisesForPosition,
    rankExercisesWithinPosition,
    calculateRecommendations
} from './algorithm.js';

// ============================================
// TEST DATA FIXTURES
// ============================================

// Mock questionnaire data (all lowercase keys, 1-4 scale)
const mockQuestionnaireNormal = {
    // Function questions
    f1: 2, f2: 2, f3: 2, f4: 2, f5: 2, f6: 2, f7: 2, f8: 2, f9: 2,
    f10: 2, f11: 2, f12: 2, f13: 2, f14: 2, f15: 2, f16: 2, f17: 2,
    // Pain questions
    p1: 2, p2: 2, p3: 2, p4: 2, p5: 2, p6: 2, p7: 2, p8: 2, p9: 2,
    // Sport/recreation questions
    sp1: 2, sp2: 2, sp3: 2, sp4: 2, sp5: 2,
    // Stiffness
    st2: 2,
    // Flexibility
    toe_touch_test: 'can'
};

const mockQuestionnaireHighPain = {
    ...mockQuestionnaireNormal,
    p1: 4, p2: 4, p3: 4, p4: 4, p5: 4, p6: 4, p7: 4, p8: 4, p9: 4
};

const mockQuestionnairePoorFlexibility = {
    ...mockQuestionnaireNormal,
    toe_touch_test: 'cannot'
};

// Mock STS assessment data
const mockSTSNormal = {
    repetition_count: 12,
    age: 65,
    gender: 'female',
    knee_alignment: 'normal',
    trunk_sway: 'absent',
    hip_sway: 'absent'
};

const mockSTSValgus = {
    ...mockSTSNormal,
    knee_alignment: 'valgus'
};

const mockSTSVarus = {
    ...mockSTSNormal,
    knee_alignment: 'varus'
};

const mockSTSCoreInstability = {
    ...mockSTSNormal,
    trunk_sway: 'present',
    hip_sway: 'present'
};

const mockSTSHighPerformance = {
    ...mockSTSNormal,
    repetition_count: 18,
    age: 65,
    gender: 'female'
};

// Mock exercise database
const mockExercises = [
    // Double leg standing exercises
    {
        id: 1,
        exercise_name: 'DL Squat',
        exercise_name_ch: '雙腿深蹲',
        position_dl_stand: true,
        position_split_stand: false,
        position_sl_stand: false,
        position_quadruped: false,
        position_supine_lying: false,
        position_side_lying: false,
        muscle_quad: 5,
        muscle_hamstring: 2,
        muscle_glute_max: 3,
        muscle_hip_flexors: 1,
        muscle_glute_med_min: 1,
        muscle_adductors: 2,
        core_ipsi: false,
        core_contra: false,
        difficulty_level: 3
    },
    {
        id: 2,
        exercise_name: 'DL Hip Hinge',
        exercise_name_ch: '雙腿髖鉸鏈',
        position_dl_stand: true,
        position_split_stand: false,
        position_sl_stand: false,
        position_quadruped: false,
        position_supine_lying: false,
        position_side_lying: false,
        muscle_quad: 2,
        muscle_hamstring: 5,
        muscle_glute_max: 4,
        muscle_hip_flexors: 0,
        muscle_glute_med_min: 1,
        muscle_adductors: 1,
        core_ipsi: true,
        core_contra: false,
        difficulty_level: 4
    },
    // Split stance exercises
    {
        id: 3,
        exercise_name: 'Backward Lunge',
        exercise_name_ch: '後弓步',
        position_dl_stand: false,
        position_split_stand: true,
        position_sl_stand: false,
        position_quadruped: false,
        position_supine_lying: false,
        position_side_lying: false,
        muscle_quad: 4,
        muscle_hamstring: 5,
        muscle_glute_max: 5,
        muscle_hip_flexors: 2,
        muscle_glute_med_min: 3,
        muscle_adductors: 2,
        core_ipsi: true,
        core_contra: false,
        difficulty_level: 6
    },
    {
        id: 4,
        exercise_name: 'Split Leg Squat',
        exercise_name_ch: '分腿深蹲',
        position_dl_stand: false,
        position_split_stand: true,
        position_sl_stand: false,
        position_quadruped: false,
        position_supine_lying: false,
        position_side_lying: false,
        muscle_quad: 5,
        muscle_hamstring: 3,
        muscle_glute_max: 4,
        muscle_hip_flexors: 1,
        muscle_glute_med_min: 2,
        muscle_adductors: 3,
        core_ipsi: true,
        core_contra: false,
        difficulty_level: 5
    },
    // Single leg standing exercises
    {
        id: 5,
        exercise_name: 'SL RDL',
        exercise_name_ch: '單腿RDL',
        position_dl_stand: false,
        position_split_stand: false,
        position_sl_stand: true,
        position_quadruped: false,
        position_supine_lying: false,
        position_side_lying: false,
        muscle_quad: 2,
        muscle_hamstring: 5,
        muscle_glute_max: 5,
        muscle_hip_flexors: 0,
        muscle_glute_med_min: 5,
        muscle_adductors: 4,
        core_ipsi: true,
        core_contra: false,
        difficulty_level: 8
    },
    {
        id: 6,
        exercise_name: 'Hip Hikes',
        exercise_name_ch: '髖提升',
        position_dl_stand: false,
        position_split_stand: false,
        position_sl_stand: true,
        position_quadruped: false,
        position_supine_lying: false,
        position_side_lying: false,
        muscle_quad: 2,
        muscle_hamstring: 1,
        muscle_glute_max: 2,
        muscle_hip_flexors: 1,
        muscle_glute_med_min: 5,
        muscle_adductors: 1,
        core_ipsi: true,
        core_contra: false,
        difficulty_level: 7
    },
    // Supine lying exercises
    {
        id: 7,
        exercise_name: 'Glute Bridge',
        exercise_name_ch: '臀橋',
        position_dl_stand: false,
        position_split_stand: false,
        position_sl_stand: false,
        position_quadruped: false,
        position_supine_lying: true,
        position_side_lying: false,
        muscle_quad: 1,
        muscle_hamstring: 3,
        muscle_glute_max: 5,
        muscle_hip_flexors: 0,
        muscle_glute_med_min: 1,
        muscle_adductors: 1,
        core_ipsi: false,
        core_contra: false,
        difficulty_level: 2
    },
    {
        id: 8,
        exercise_name: 'Single Leg Glute Bridge',
        exercise_name_ch: '單腿臀橋',
        position_dl_stand: false,
        position_split_stand: false,
        position_sl_stand: false,
        position_quadruped: false,
        position_supine_lying: true,
        position_side_lying: false,
        muscle_quad: 2,
        muscle_hamstring: 4,
        muscle_glute_max: 5,
        muscle_hip_flexors: 0,
        muscle_glute_med_min: 4,
        muscle_adductors: 2,
        core_ipsi: true,
        core_contra: false,
        difficulty_level: 4
    },
    // Side lying exercises
    {
        id: 9,
        exercise_name: 'Clamshell',
        exercise_name_ch: '蚌殼',
        position_dl_stand: false,
        position_split_stand: false,
        position_sl_stand: false,
        position_quadruped: false,
        position_supine_lying: false,
        position_side_lying: true,
        muscle_quad: 0,
        muscle_hamstring: 1,
        muscle_glute_max: 2,
        muscle_hip_flexors: 0,
        muscle_glute_med_min: 5,
        muscle_adductors: 0,
        core_ipsi: false,
        core_contra: false,
        difficulty_level: 2
    },
    {
        id: 10,
        exercise_name: 'Side Plank Clamshell',
        exercise_name_ch: '側棧式蚌殼',
        position_dl_stand: false,
        position_split_stand: false,
        position_sl_stand: false,
        position_quadruped: false,
        position_supine_lying: false,
        position_side_lying: true,
        muscle_quad: 0,
        muscle_hamstring: 1,
        muscle_glute_max: 2,
        muscle_hip_flexors: 0,
        muscle_glute_med_min: 5,
        muscle_adductors: 0,
        core_ipsi: true,
        core_contra: true,
        difficulty_level: 5
    },
    // Quadruped exercises
    {
        id: 11,
        exercise_name: 'Birddog',
        exercise_name_ch: '鳥狗',
        position_dl_stand: false,
        position_split_stand: false,
        position_sl_stand: false,
        position_quadruped: true,
        position_supine_lying: false,
        position_side_lying: false,
        muscle_quad: 1,
        muscle_hamstring: 3,
        muscle_glute_max: 4,
        muscle_hip_flexors: 1,
        muscle_glute_med_min: 3,
        muscle_adductors: 1,
        core_ipsi: true,
        core_contra: true,
        difficulty_level: 4
    }
];

// ============================================
// TEST UTILITIES
// ============================================

function assert(condition, message) {
    if (!condition) {
        throw new Error(`❌ ASSERTION FAILED: ${message}`);
    }
}

function assertApprox(actual, expected, tolerance, message) {
    const diff = Math.abs(actual - expected);
    if (diff > tolerance) {
        throw new Error(`❌ ASSERTION FAILED: ${message}\n   Expected: ${expected}\n   Actual: ${actual}\n   Diff: ${diff}`);
    }
}

function assertRange(value, min, max, message) {
    if (value < min || value > max) {
        throw new Error(`❌ ASSERTION FAILED: ${message}\n   Value: ${value}\n   Expected range: [${min}, ${max}]`);
    }
}

function logTest(testName) {
    console.log(`\n🔬 Testing: ${testName}`);
}

function logSuccess(message) {
    console.log(`  ✅ ${message}`);
}

function logSection(sectionName) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`  ${sectionName}`);
    console.log('='.repeat(60));
}

// ============================================
// TEST SUITE
// ============================================

async function runAllTests() {
    console.log('\n🚀 Starting Algorithm Test Suite\n');

    try {
        // Test 1: Position Multiplier Calculation
        logSection('TEST 1: Position Multiplier Calculation');
        testPositionMultipliers();

        // Test 2: STS Score Calculation
        logSection('TEST 2: STS Score Calculation');
        testSTSScore();

        // Test 3: Enhanced Combined Score
        logSection('TEST 3: Enhanced Combined Score with Conflict Resolution');
        testEnhancedCombinedScore();

        // Test 4: Difficulty Modifier
        logSection('TEST 4: Difficulty Modifier');
        testDifficultyModifier();

        // Test 5: Core Stability Filter
        logSection('TEST 5: Core Stability Filter');
        testCoreStabilityFilter();

        // Test 6: Alignment Modifier
        logSection('TEST 6: Alignment Modifier (Valgus/Varus Targeting)');
        testAlignmentModifier();

        // Test 7: Flexibility Modifier
        logSection('TEST 7: Flexibility Modifier');
        testFlexibilityModifier();

        // Test 8: Position Selection (Layer 1)
        logSection('TEST 8: Position Selection (Layer 1 Ranking)');
        testPositionSelection();

        // Test 9: Exercise Ranking Within Position (Layer 2)
        logSection('TEST 9: Exercise Ranking Within Position (Layer 2)');
        testExerciseRanking();

        // Test 10: Complete Algorithm Integration
        logSection('TEST 10: Complete Algorithm Integration');
        await testCompleteAlgorithm();

        // Test 11: Edge Cases
        logSection('TEST 11: Edge Cases and Safety Features');
        testEdgeCases();

        console.log('\n' + '='.repeat(60));
        console.log('🎉 ALL TESTS PASSED! ✅');
        console.log('='.repeat(60) + '\n');

    } catch (error) {
        console.error('\n' + '='.repeat(60));
        console.error('❌ TEST SUITE FAILED');
        console.error('='.repeat(60));
        console.error(error);
        process.exit(1);
    }
}

// ============================================
// INDIVIDUAL TEST FUNCTIONS
// ============================================

function testPositionMultipliers() {
    logTest('Position multipliers calculation');

    const multipliers = calculatePositionMultipliers(mockQuestionnaireNormal);

    // All multipliers should be between 0 and 1
    Object.entries(multipliers).forEach(([position, multiplier]) => {
        assertRange(multiplier, 0, 1, `${position} multiplier should be 0-1`);
    });

    // All positions should be present
    assert(multipliers.DL_stand !== undefined, 'DL_stand multiplier exists');
    assert(multipliers.split_stand !== undefined, 'split_stand multiplier exists');
    assert(multipliers.SL_stand !== undefined, 'SL_stand multiplier exists');
    assert(multipliers.quadruped !== undefined, 'quadruped multiplier exists');
    assert(multipliers.lying !== undefined, 'lying multiplier exists');

    // Lying should be inverse of best active position
    const bestActive = Math.max(
        multipliers.DL_stand,
        multipliers.split_stand,
        multipliers.SL_stand,
        multipliers.quadruped
    );
    const expectedLying = Math.max(0.1, 1.0 - bestActive);
    assertApprox(multipliers.lying, expectedLying, 0.01, 'Lying multiplier is inverse of best active');

    logSuccess('Position multipliers calculated correctly');
    logSuccess(`Sample values: DL=${multipliers.DL_stand.toFixed(2)}, Split=${multipliers.split_stand.toFixed(2)}, SL=${multipliers.SL_stand.toFixed(2)}, Lying=${multipliers.lying.toFixed(2)}`);
}

function testSTSScore() {
    logTest('STS score with HK norms and performance categories');

    // Test 1: Above Average performance (Female 65-69, 14+ reps)
    const result1 = calculateSTSScore(14, 65, 'female');
    assert(result1.performance === 'Above Average', 'Should be Above Average');
    assert(result1.normalizedScore === 0.9, 'Above Average should map to 0.9');
    assert(result1.benchmarkRange === '10-13', 'Benchmark range should be 10-13');
    logSuccess('Above Average: 14 reps (female 65-69) → Above Average (0.9) ✓');

    // Test 2: Average performance (Female 65-69, 10-13 reps)
    const result2 = calculateSTSScore(11, 65, 'female');
    assert(result2.performance === 'Average', 'Should be Average');
    assert(result2.normalizedScore === 0.65, 'Average should map to 0.65');
    logSuccess('Average: 11 reps (female 65-69) → Average (0.65) ✓');

    // Test 3: Below Average performance (Female 65-69, ≤9 reps)
    const result3 = calculateSTSScore(8, 65, 'female');
    assert(result3.performance === 'Below Average', 'Should be Below Average');
    assert(result3.normalizedScore === 0.3, 'Below Average should map to 0.3');
    logSuccess('Below Average: 8 reps (female 65-69) → Below Average (0.3) ✓');

    // Test 4: Different age/gender (Male 60-64, 17+ reps = Above Average)
    const result4 = calculateSTSScore(17, 62, 'male');
    assert(result4.performance === 'Above Average', 'Should be Above Average');
    assert(result4.benchmarkRange === '12-16', 'Benchmark range should be 12-16');
    logSuccess('Different age/gender: 17 reps (male 62) → Above Average ✓');

    // Test 5: Edge case 90+ age group
    const result5 = calculateSTSScore(10, 92, 'female');
    assert(result5.performance === 'Above Average', '10 reps for 90+ female should be Above Average');
    assert(result5.benchmarkRange === '7-9', 'Benchmark range should be 7-9');
    logSuccess('90+ age group: 10 reps (female 92) → Above Average ✓');
}

function testEnhancedCombinedScore() {
    logTest('Enhanced combined score with conflict resolution');

    // Test 1: Normal case (no conflict)
    const score1 = calculateEnhancedCombinedScore(2.0, 2.0, 0.8);
    assertRange(score1, 0.1, 0.9, 'Score should be within floor/ceiling');
    logSuccess(`Normal case: painAvg=2.0, symptomsAvg=2.0, stsScore=0.8 → ${score1.toFixed(2)} ✓`);

    // Test 2: High pain, high performance (conflict)
    const painAvg = 4.0; // High pain (worse)
    const painScore = (4 - painAvg) / 4; // = 0.0 (worst)
    const symptomScore = (4 - 2.0) / 4; // = 0.5 (moderate)
    const subjectiveScore = (painScore * 0.5) + (symptomScore * 0.5); // = 0.25
    const stsScore = 1.0; // High performance

    const score2 = calculateEnhancedCombinedScore(painAvg, 2.0, stsScore);

    // Should detect conflict (|1.0 - 0.25| = 0.75 > 0.5)
    // Should use conservative approach
    assertRange(score2, 0.1, 0.6, 'Conflict should result in conservative score');
    logSuccess(`High pain + high performance (conflict detected) → ${score2.toFixed(2)} (conservative) ✓`);

    // Test 3: Floor/ceiling protection
    const score3 = calculateEnhancedCombinedScore(4.0, 4.0, 0.0);
    assert(score3 >= 0.1, 'Floor protection at 0.1');
    logSuccess(`Floor protection: worst case → ${score3.toFixed(2)} (>= 0.1) ✓`);

    const score4 = calculateEnhancedCombinedScore(1.0, 1.0, 1.0);
    assert(score4 <= 0.9, 'Ceiling protection at 0.9');
    logSuccess(`Ceiling protection: best case → ${score4.toFixed(2)} (<= 0.9) ✓`);
}

function testDifficultyModifier() {
    logTest('Difficulty preference matching');

    // Test 1: High capability prefers hard exercises
    const score1 = calculateDifficultyModifier(0.9, 9); // Prefers difficulty ~9.1
    const score2 = calculateDifficultyModifier(0.9, 2); // Far from preferred

    assert(score1 > score2, 'High capability should prefer hard exercises');
    logSuccess(`High capability (0.9): Difficulty 9 (${score1.toFixed(2)}) > Difficulty 2 (${score2.toFixed(2)}) ✓`);

    // Test 2: Low capability prefers easy exercises
    const score3 = calculateDifficultyModifier(0.2, 3); // Prefers difficulty ~2.8
    const score4 = calculateDifficultyModifier(0.2, 9); // Far from preferred

    assert(score3 > score4, 'Low capability should prefer easy exercises');
    logSuccess(`Low capability (0.2): Difficulty 3 (${score3.toFixed(2)}) > Difficulty 9 (${score4.toFixed(2)}) ✓`);

    // Test 3: Moderate capability prefers intermediate
    const score5 = calculateDifficultyModifier(0.5, 5); // Prefers difficulty ~5.5
    const score6 = calculateDifficultyModifier(0.5, 6); // Also close

    assertApprox(score5, score6, 0.05, 'Similar difficulties should have similar scores');
    logSuccess(`Moderate capability (0.5): Difficulty 5 (${score5.toFixed(2)}) ≈ Difficulty 6 (${score6.toFixed(2)}) ✓`);
}

function testCoreStabilityFilter() {
    logTest('Core stability filter');

    // Test 1: No instability = all exercises
    const filtered1 = applyCoreStabilityFilter(mockExercises, 'absent', 'absent');
    assert(filtered1.length === mockExercises.length, 'No filter when no instability');
    logSuccess(`No instability: All ${mockExercises.length} exercises available ✓`);

    // Test 2: Trunk sway = only core_ipsi exercises
    const filtered2 = applyCoreStabilityFilter(mockExercises, 'present', 'absent');
    const coreOnlyCount = mockExercises.filter(ex => ex.core_ipsi === true).length;
    assert(filtered2.length === coreOnlyCount, 'Trunk sway filters to core_ipsi only');
    assert(filtered2.every(ex => ex.core_ipsi === true), 'All filtered exercises have core_ipsi=true');
    logSuccess(`Trunk sway present: Filtered to ${filtered2.length} core stability exercises ✓`);

    // Test 3: Hip sway = only core_ipsi exercises
    const filtered3 = applyCoreStabilityFilter(mockExercises, 'absent', 'present');
    assert(filtered3.length === coreOnlyCount, 'Hip sway filters to core_ipsi only');
    logSuccess(`Hip sway present: Filtered to ${filtered3.length} core stability exercises ✓`);

    // Test 4: Both sways = only core_ipsi exercises
    const filtered4 = applyCoreStabilityFilter(mockExercises, 'present', 'present');
    assert(filtered4.length === coreOnlyCount, 'Both sways filter to core_ipsi only');
    logSuccess(`Both sways present: Filtered to ${filtered4.length} core stability exercises ✓`);
}

function testAlignmentModifier() {
    logTest('Alignment-specific muscle targeting');

    // Get a valgus-targeting exercise (high glute_med_min)
    const valgusExercise = mockExercises.find(ex => ex.exercise_name === 'SL RDL'); // glute_med_min = 5

    // Test 1: Normal alignment = no boost (1.0)
    const mod1 = calculateAlignmentModifier('normal', valgusExercise);
    assertApprox(mod1, 1.0, 0.01, 'Normal alignment gives 1.0 modifier');
    logSuccess(`Normal alignment: No boost (${mod1.toFixed(2)}) ✓`);

    // Test 2: Valgus alignment = boost glute_med_min exercises
    const mod2 = calculateAlignmentModifier('valgus', valgusExercise);
    assertApprox(mod2, 2.0, 0.01, 'Valgus with glute_med_min=5 gives 2.0x boost');
    logSuccess(`Valgus + high glute_med_min: Max boost (${mod2.toFixed(2)}x) ✓`);

    // Test 3: Varus alignment = boost adductor exercises
    const varusExercise = mockExercises.find(ex => ex.exercise_name === 'SL RDL'); // adductors = 4
    const mod3 = calculateAlignmentModifier('varus', varusExercise);
    assertApprox(mod3, 1.8, 0.01, 'Varus with adductors=4 gives 1.8x boost');
    logSuccess(`Varus + high adductors: Strong boost (${mod3.toFixed(2)}x) ✓`);

    // Test 4: Valgus on non-targeting exercise = minimal boost
    const nonTargetingEx = mockExercises.find(ex => ex.muscle_glute_med_min === 1);
    const mod4 = calculateAlignmentModifier('valgus', nonTargetingEx);
    assertApprox(mod4, 1.2, 0.01, 'Valgus with glute_med_min=1 gives minimal boost');
    logSuccess(`Valgus + low glute_med_min: Minimal boost (${mod4.toFixed(2)}x) ✓`);
}

function testFlexibilityModifier() {
    logTest('Flexibility deficit targeting');

    // Get a flexibility-targeting exercise (high hamstring/glute_max)
    const flexExercise = mockExercises.find(ex => ex.exercise_name === 'Backward Lunge'); // hamstring=5, glute_max=5

    // Test 1: Good flexibility (can touch toes) = no boost
    const mod1 = calculateFlexibilityModifier('can', flexExercise);
    assertApprox(mod1, 1.0, 0.01, 'Good flexibility gives 1.0 modifier');
    logSuccess(`Good flexibility: No boost (${mod1.toFixed(2)}) ✓`);

    // Test 2: Poor flexibility (cannot touch toes) = boost hamstring/glute_max
    const mod2 = calculateFlexibilityModifier('cannot', flexExercise);
    assertApprox(mod2, 1.4, 0.01, 'Poor flexibility with max recruitment gives 1.4x boost');
    logSuccess(`Poor flexibility + high hamstring/glute_max: Max boost (${mod2.toFixed(2)}x) ✓`);

    // Test 3: Poor flexibility + low recruitment = minimal boost
    const nonFlexEx = mockExercises.find(ex => ex.exercise_name === 'Clamshell'); // hamstring=1, glute_max=2
    if (nonFlexEx) {
        const mod3 = calculateFlexibilityModifier('cannot', nonFlexEx);
        assert(mod3 < 1.2, 'Poor flexibility with low recruitment gives minimal boost');
        logSuccess(`Poor flexibility + low recruitment: Minimal boost (${mod3.toFixed(2)}x) ✓`);
    } else {
        logSuccess('Poor flexibility + low recruitment test skipped (no suitable exercise) ✓');
    }
}

function testPositionSelection() {
    logTest('Layer 1: Position ranking');

    const multipliers = {
        DL_stand: 0.8,
        split_stand: 0.6,
        SL_stand: 0.4,
        quadruped: 0.5,
        lying: 0.3
    };

    const selected = selectBestPositions(multipliers);

    // Should return exactly 2 positions
    assert(selected.length === 2, 'Should select exactly 2 positions');

    // Should be sorted by multiplier (highest first)
    assert(selected[0].multiplier >= selected[1].multiplier, 'Should be sorted by capability');

    // Should select DL_stand (0.8) and split_stand (0.6)
    assert(selected[0].position === 'DL_stand', 'First position should be DL_stand');
    assert(selected[1].position === 'split_stand', 'Second position should be split_stand');

    logSuccess(`Top 2 positions: ${selected[0].position} (${selected[0].multiplier.toFixed(2)}), ${selected[1].position} (${selected[1].multiplier.toFixed(2)}) ✓`);
}

function testExerciseRanking() {
    logTest('Layer 2: Exercise ranking within position');

    const enhancedCombinedScore = 0.5; // Moderate capability
    const kneeAlignment = 'valgus';
    const toeTouch = 'cannot';
    const trunkSway = 'absent';
    const hipSway = 'absent';

    // Test split_stand position
    const ranked = rankExercisesWithinPosition(
        'split_stand',
        mockExercises,
        enhancedCombinedScore,
        kneeAlignment,
        toeTouch,
        trunkSway,
        hipSway
    );

    // Should return exactly 2 exercises
    assert(ranked.length === 2, 'Should return top 2 exercises');

    // Should be sorted by final score
    assert(ranked[0].finalScore >= ranked[1].finalScore, 'Should be sorted by final score');

    // All exercises should have scoring components
    ranked.forEach((item, idx) => {
        assert(item.difficultyScore !== undefined, `Exercise ${idx+1} has difficulty score`);
        assert(item.alignmentModifier !== undefined, `Exercise ${idx+1} has alignment modifier`);
        assert(item.flexibilityModifier !== undefined, `Exercise ${idx+1} has flexibility modifier`);
        assert(item.finalScore !== undefined, `Exercise ${idx+1} has final score`);
    });

    logSuccess(`Top 2 exercises ranked for split_stand position ✓`);
    logSuccess(`  #1: ${ranked[0].exercise.exercise_name} (score: ${ranked[0].finalScore.toFixed(2)}) ✓`);
    logSuccess(`  #2: ${ranked[1].exercise.exercise_name} (score: ${ranked[1].finalScore.toFixed(2)}) ✓`);
}

async function testCompleteAlgorithm() {
    logTest('Complete algorithm integration (normal case)');

    const result = await calculateRecommendations(
        mockQuestionnaireNormal,
        mockSTSNormal,
        mockExercises
    );

    // Check structure
    assert(result.positionMultipliers !== undefined, 'Has position multipliers');
    assert(result.scores !== undefined, 'Has scores');
    assert(result.recommendations !== undefined, 'Has recommendations');
    assert(result.biomechanicalFlags !== undefined, 'Has biomechanical flags');

    // Check scores
    assertRange(result.scores.painScore, 0, 1, 'Pain score in range');
    assertRange(result.scores.symptomScore, 0, 1, 'Symptom score in range');
    assertRange(result.scores.stsScore, 0, 1, 'STS score in range');
    assertRange(result.scores.combinedScore, 0.1, 0.9, 'Combined score in range');

    // Check recommendations
    assert(result.recommendations.length === 2, 'Should recommend 2 positions');
    result.recommendations.forEach((rec, idx) => {
        assert(rec.position !== undefined, `Recommendation ${idx+1} has position`);
        assert(rec.positionMultiplier !== undefined, `Recommendation ${idx+1} has multiplier`);
        assert(rec.exercises.length === 2, `Recommendation ${idx+1} has 2 exercises`);
    });

    logSuccess('Complete algorithm executed successfully ✓');
    logSuccess(`  Positions: ${result.recommendations.map(r => r.position).join(', ')} ✓`);
    logSuccess(`  Total exercises: ${result.recommendations.reduce((sum, r) => sum + r.exercises.length, 0)} ✓`);

    // Test valgus case
    logTest('Complete algorithm integration (valgus alignment)');
    const resultValgus = await calculateRecommendations(
        mockQuestionnaireNormal,
        mockSTSValgus,
        mockExercises
    );
    assert(resultValgus.biomechanicalFlags.alignmentIssue === true, 'Valgus detected');
    logSuccess('Valgus alignment case processed ✓');

    // Test core instability case
    logTest('Complete algorithm integration (core instability)');
    const resultCore = await calculateRecommendations(
        mockQuestionnaireNormal,
        mockSTSCoreInstability,
        mockExercises
    );
    assert(resultCore.biomechanicalFlags.coreStabilityRequired === true, 'Core instability detected');
    // All recommended exercises should have core_ipsi=true
    const allCoreExercises = resultCore.recommendations.every(rec =>
        rec.exercises.every(item => item.exercise.core_ipsi === true)
    );
    assert(allCoreExercises, 'All recommended exercises should be core-focused');
    logSuccess('Core instability case processed with proper filtering ✓');

    // Test poor flexibility case
    logTest('Complete algorithm integration (poor flexibility)');
    const resultFlex = await calculateRecommendations(
        mockQuestionnairePoorFlexibility,
        mockSTSNormal,
        mockExercises
    );
    assert(resultFlex.biomechanicalFlags.flexibilityDeficit === true, 'Flexibility deficit detected');
    logSuccess('Poor flexibility case processed ✓');
}

function testEdgeCases() {
    logTest('Edge case: Very high STS performance with high pain');

    // High performance (18 reps) but high pain (4.0)
    const score = calculateEnhancedCombinedScore(4.0, 4.0, 1.0);
    assertRange(score, 0.1, 0.5, 'Should use conservative approach');
    logSuccess('Conflict resolution working correctly ✓');

    logTest('Edge case: Missing questionnaire data');
    const questionnaireWithMissing = {
        ...mockQuestionnaireNormal,
        f1: null,
        f2: undefined,
        p1: 0
    };

    try {
        const multipliers = calculatePositionMultipliers(questionnaireWithMissing);
        assert(multipliers.DL_stand >= 0 && multipliers.DL_stand <= 1, 'Should handle missing data gracefully');
        logSuccess('Handles missing data without crashing ✓');
    } catch (err) {
        throw new Error('Should not crash on missing data');
    }

    logTest('Edge case: Very young age (should default)');
    const youngResult = calculateSTSScore(15, 50, 'male');
    assert(youngResult.normalizedScore > 0, 'Should handle young age with default benchmark');
    assert(youngResult.performance, 'Should return performance category');
    logSuccess('Handles out-of-range age ✓');

    logTest('Edge case: Position with no exercises');
    const emptyExercises = getExercisesForPosition('SL_stand', []);
    assert(emptyExercises.length === 0, 'Should return empty array for no matches');
    logSuccess('Handles empty exercise sets ✓');
}

// ============================================
// RUN TESTS
// ============================================

runAllTests();
