-- =====================================================================
-- UPDATE EXERCISES TABLE WITH CHINESE NAMES AND TOE_TOUCH COLUMN
-- =====================================================================
-- Based on exercises_ver4.csv
-- Adds exercise_name_ch column and toe_touch boolean column
-- =====================================================================

-- Step 1: Add new columns if they don't exist
ALTER TABLE exercises
ADD COLUMN IF NOT EXISTS exercise_name_ch VARCHAR(100),
ADD COLUMN IF NOT EXISTS toe_touch BOOLEAN DEFAULT FALSE;

-- Step 2: Update existing exercises with Chinese names and toe_touch values
UPDATE exercises SET exercise_name_ch = '直膝抬腿', toe_touch = FALSE WHERE exercise_name = 'Straight leg raise';
UPDATE exercises SET exercise_name_ch = '雙腳臀橋', toe_touch = TRUE WHERE exercise_name = 'Double leg glute bridging';
UPDATE exercises SET exercise_name_ch = '雙腳膕旁肌橋式', toe_touch = TRUE WHERE exercise_name = 'Double leg hamstrings bridging';
UPDATE exercises SET exercise_name_ch = '單腳臀橋', toe_touch = TRUE WHERE exercise_name = 'Single leg glute bridging';
UPDATE exercises SET exercise_name_ch = '單腳膕旁肌橋式', toe_touch = TRUE WHERE exercise_name = 'Single leg hamstrings bridging';
UPDATE exercises SET exercise_name_ch = '仰臥剪刀式', toe_touch = TRUE WHERE exercise_name = 'Scissors';
UPDATE exercises SET exercise_name_ch = '仰臥三個月姿勢髖部下放', toe_touch = TRUE WHERE exercise_name = '3-months supine hip lowering';
UPDATE exercises SET exercise_name_ch = '死蟲式', toe_touch = TRUE WHERE exercise_name = 'Deadbug';
UPDATE exercises SET exercise_name_ch = '側臥蚌殼式', toe_touch = FALSE WHERE exercise_name = 'Side lying Clamshell';
UPDATE exercises SET exercise_name_ch = '跪姿側棒式髖部升降', toe_touch = FALSE WHERE exercise_name = 'Side plank on knees hip dip';
UPDATE exercises SET exercise_name_ch = '跪姿側棒式停留', toe_touch = FALSE WHERE exercise_name = 'Side plank on knees hold';
UPDATE exercises SET exercise_name_ch = '側棒式蚌殼式', toe_touch = FALSE WHERE exercise_name = 'Side plank Clamshell';
UPDATE exercises SET exercise_name_ch = '側棒式髖外展', toe_touch = FALSE WHERE exercise_name = 'Side plank hip abduction';
UPDATE exercises SET exercise_name_ch = '哥本哈根內收肌運動 Lv1', toe_touch = FALSE WHERE exercise_name = 'Copenhagen adductor lv1';
UPDATE exercises SET exercise_name_ch = '哥本哈根內收肌運動 Lv2', toe_touch = FALSE WHERE exercise_name = 'Copenhagen adductor lv2';
UPDATE exercises SET exercise_name_ch = '四足跪姿單肢活動', toe_touch = FALSE WHERE exercise_name = 'Quadruped single limb movement';
UPDATE exercises SET exercise_name_ch = '四足跪姿驢踢', toe_touch = FALSE WHERE exercise_name = 'Quadruped donkey kick';
UPDATE exercises SET exercise_name_ch = '四足跪姿後踢', toe_touch = FALSE WHERE exercise_name = 'Quadruped leg extension';
UPDATE exercises SET exercise_name_ch = '四足跪姿髖外展', toe_touch = FALSE WHERE exercise_name = 'Quadruped hip abduction';
UPDATE exercises SET exercise_name_ch = '鳥狗式', toe_touch = FALSE WHERE exercise_name = 'Birddog';
UPDATE exercises SET exercise_name_ch = '雙腳深蹲', toe_touch = FALSE WHERE exercise_name = 'DL squat';
UPDATE exercises SET exercise_name_ch = '彈力帶雙腳深蹲', toe_touch = FALSE WHERE exercise_name = 'DL squat with band';
UPDATE exercises SET exercise_name_ch = '雙腳深蹲(夾內收肌)', toe_touch = FALSE WHERE exercise_name = 'DL squat with adductor squeeze';
UPDATE exercises SET exercise_name_ch = '髖關節鉸鏈', toe_touch = FALSE WHERE exercise_name = 'Hip hinge';
UPDATE exercises SET exercise_name_ch = '分腿蹲', toe_touch = FALSE WHERE exercise_name = 'Split leg squat';
UPDATE exercises SET exercise_name_ch = '後弓箭步', toe_touch = FALSE WHERE exercise_name = 'Backward Lunge';
UPDATE exercises SET exercise_name_ch = '登階運動', toe_touch = FALSE WHERE exercise_name = 'Step up';
UPDATE exercises SET exercise_name_ch = '側蹲', toe_touch = FALSE WHERE exercise_name = 'Side squat';
UPDATE exercises SET exercise_name_ch = '骨盆側提', toe_touch = FALSE WHERE exercise_name = 'Hip hikes';
UPDATE exercises SET exercise_name_ch = '保加利亞分腿蹲', toe_touch = FALSE WHERE exercise_name = 'RFESS';
UPDATE exercises SET exercise_name_ch = '單腳半蹲', toe_touch = FALSE WHERE exercise_name = 'SL half squat';
UPDATE exercises SET exercise_name_ch = '單腳羅馬尼亞硬舉', toe_touch = FALSE WHERE exercise_name = 'SL RDL';

-- Step 3: Verify the updates
SELECT
    exercise_name,
    exercise_name_ch,
    toe_touch,
    position_supine_lying,
    position_side_lying,
    position_quadruped,
    position_dl_stand,
    position_split_stand,
    position_sl_stand
FROM exercises
ORDER BY difficulty_level, exercise_name;

-- Step 4: Create index on exercise_name_ch for faster lookups
CREATE INDEX IF NOT EXISTS idx_exercises_name_ch ON exercises(exercise_name_ch);

-- =====================================================================
-- VERIFICATION QUERIES
-- =====================================================================

-- Count exercises with Chinese names
SELECT COUNT(*) as total_exercises,
       COUNT(exercise_name_ch) as with_chinese_names,
       COUNT(CASE WHEN toe_touch = TRUE THEN 1 END) as requires_toe_touch
FROM exercises;

-- Show exercises that require toe touch
SELECT exercise_name, exercise_name_ch, toe_touch
FROM exercises
WHERE toe_touch = TRUE
ORDER BY exercise_name;
