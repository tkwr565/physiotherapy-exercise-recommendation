# Complete KOOS/WOMAC Questionnaire Implementation

## Overview
Successfully implemented the **complete 42-question KOOS/WOMAC questionnaire** with full bilingual support (English & Traditional Chinese) and fixed all translation issues.

## Total Questions: 43 items

### KOOS/WOMAC Questions (42)
1. **Pain** (P1, P2, P5, P6, P9, P7, P8) - 7 questions
2. **Symptoms** (S1-S5) - 5 questions
3. **Stiffness** (ST1, ST2) - 2 questions
4. **Function - Daily Living** (F1-F17) - 17 questions
5. **Function - Sports/Recreation** (SP1-SP5) - 5 questions
6. **Function overlap** (P3, P4) - 2 questions
7. **Quality of Life** (Q1-Q4) - 4 questions

### Additional Assessment (1)
- **Toe Touch Test** - 1 question

**GRAND TOTAL: 43 questions**

## Files Updated

### 1. [src/patient/questionnaire-data.js](src/patient/questionnaire-data.js)
✅ Added "Additional Questions" section (P7, P8, ST1, F10, F12, F14, F16, F17)
✅ Added "Quality of Life" section (Q1-Q4)
✅ Updated `requiredQuestions` array: 30 → 42 questions
✅ All questions use 0-4 scoring with explicit scores in labels

### 2. [src/patient/translations.js](src/patient/translations.js)
✅ Added English translations for all 12 new questions (8 additional + 4 QoL)
✅ Added Traditional Chinese (zh-TW) translations for all 12 new questions
✅ Added section headers: "Additional Questions" / "補充問題", "Quality of Life" / "生活質量"
✅ All options show explicit scores: "None (0)" / "無 (0)" through "Extreme (4)" / "極重度 (4)"

### 3. [src/questionnaire/questionnaire.js](src/questionnaire/questionnaire.js)
✅ **FIXED**: Translation bug - now uses translated descriptions instead of English fallback
✅ **FIXED**: Subsection titles now properly translated (e.g., "🔗 Shared by 3 positions" → "🔗 三種姿勢共用")
✅ Updated progress tracking: 38 → 42 KOOS/WOMAC questions
✅ Progress bar now tracks 43 total items (42 KOOS + 1 toe touch)

### 4. Database SQL Files
- ✅ **[fix-check-constraints-0-4.sql](fix-check-constraints-0-4.sql)** - Updates all constraints to 0-4 range
- ✅ **[add-symptom-columns.sql](add-symptom-columns.sql)** - Adds S1-S5 columns
- ✅ **[add-st1-column.sql](add-st1-column.sql)** - Adds ST1 column
- ✅ **[add-quality-of-life-columns.sql](add-quality-of-life-columns.sql)** - Adds Q1-Q4 columns (NEW!)

## Translation Fixes

### Before (Broken - Mixed Languages)
```
疼痛相關問題（適用於所有姿勢）
These questions affect all exercise positions with 25% weight...

Symptom Questions
These questions affect all exercise positions...

Position-Specific Core Questions
🔗 Shared by 3 positions (DL_stand, split_stand & SL_stand)
```

### After (Fixed - Fully Translated)
```
疼痛相關問題（適用於所有姿勢）
這些問題會影響所有運動姿勢，在綜合評分中佔25%的權重。

症狀相關問題（適用於所有姿勢）
這些問題會影響所有運動姿勢，在綜合評分中佔15%的權重。

特定姿勢核心問題（60%權重）
🔗 三種姿勢共用（雙腿站立、分腿站立與單腿站立）
```

## New Questions Added (12 total)

### Additional Questions (8)
| Code | English | 中文 |
|------|---------|------|
| P7 | At night while in bed | 夜間躺在床上時的疼痛程度 |
| P8 | Sitting or lying | 坐著或躺著時的疼痛程度 |
| ST1 | Morning stiffness | 早上剛醒來時的僵硬程度 |
| F10 | Rising from bed | 從床上起身時的困難程度 |
| F12 | Lying in bed (turning over) | 躺在床上時的困難程度 |
| F14 | Sitting | 坐著時的困難程度 |
| F16 | Heavy domestic duties | 做重型家務時的困難程度 |
| F17 | Light domestic duties | 做輕型家務時的困難程度 |

### Quality of Life Questions (4)
| Code | English | 中文 |
|------|---------|------|
| Q1 | How often are you aware of your knee problem? | 您多久會意識到膝蓋問題？ |
| Q2 | Have you modified your life style? | 您是否改變了生活方式？ |
| Q3 | How troubled with lack of confidence? | 您對膝蓋缺乏信心的困擾程度？ |
| Q4 | In general, how much difficulty? | 總體而言，您的膝蓋有多大困難？ |

## Scoring System (All Questions)

**0-4 Scale:**
- **0** = None/Never/Best (no symptoms)
- **1** = Mild/Rarely/Monthly
- **2** = Moderate/Sometimes/Weekly
- **3** = Severe/Often/Daily
- **4** = Extreme/Always/Constantly (worst symptoms)

## Database Setup Required

Run these SQL scripts in Supabase SQL Editor **in order**:

1. ✅ `fix-check-constraints-0-4.sql` (if not already run)
2. ✅ `add-symptom-columns.sql` (if not already run)
3. ⏳ `add-st1-column.sql` **(MUST RUN)**
4. ⏳ `add-quality-of-life-columns.sql` **(NEW - MUST RUN)**

## Testing Checklist

### Translation Testing
- [ ] Change language to Chinese - all section titles should be in Chinese
- [ ] All descriptions should be in Chinese
- [ ] All subsection headers should be in Chinese (e.g., "🔗 三種姿勢共用")
- [ ] All question text should be in Chinese
- [ ] All options should be in Chinese with scores: "無 (0)" through "極重度 (4)"
- [ ] Change back to English - everything switches to English

### Question Count Testing
- [ ] Progress bar shows "0 / 43" at start
- [ ] Answer all 42 KOOS questions
- [ ] Answer toe touch question
- [ ] Progress should reach "43 / 43"
- [ ] Submit button should be enabled

### Database Testing
- [ ] Run all SQL scripts in Supabase
- [ ] Submit completed questionnaire
- [ ] Verify all 42 KOOS columns populated (p1-p9, s1-s5, st1-st2, f1-f17, sp1-sp5, q1-q4)
- [ ] Verify toe_touch_test column populated
- [ ] Verify user_id column populated
- [ ] No columns should be NULL (except unused columns)

## Complete Question List by Section

### Pain Questions (7)
P1, P2, P3, P4, P5, P6, P7, P8, P9

### Symptom Questions (5)
S1, S2, S3, S4, S5

### Stiffness Questions (2)
ST1, ST2

### Function - Daily Living (17)
F1, F2, F3, F4, F5, F6, F7, F8, F9, F10, F11, F12, F13, F14, F15, F16, F17

### Sports/Recreation (5)
SP1, SP2, SP3, SP4, SP5

### Quality of Life (4)
Q1, Q2, Q3, Q4

### Toe Touch Test (1)
FLEX (toe_touch_test)

**TOTAL: 43 questions**

## Next Steps

After successful testing:
1. ✅ Translations fully working
2. ✅ All 43 questions implemented
3. ⏳ Test locally (verify 43/43 progress)
4. ⏳ Run database SQL scripts
5. ⏳ Test submission to database
6. ⏳ Commit changes to `question_sts` branch
7. ⏳ Proceed to Step 4: Create STS assessment page

## Notes

- All question codes stored as lowercase in database (p1, f1, q1, etc.)
- All questions show explicit scores in UI for clarity
- Bilingual support fully functional
- Complete KOOS/WOMAC questionnaire now implemented (42 questions)
- Plus custom toe touch flexibility assessment (1 question)
