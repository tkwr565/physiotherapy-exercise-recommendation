/**
 * Bilingual translations for patient questionnaire
 * Default: Traditional Chinese (zh-TW)
 * Secondary: English (en)
 */

export const translations = {
  'en': {
    // Page Header (for dynamic rendering)
    pageTitle: "Knee Exercise Assessment",
    pageSubtitle: "Page 1 of 3: Questionnaire",

    // Header & Navigation
    headerTitle: "Knee Exercise Assessment",
    headerSubtitle: "Patient Questionnaire",
    progressText: "questions answered",

    // Language toggle
    languageLabel: "Language",
    english: "English",
    chinese: "繁體中文",

    // Buttons
    submitButton: "Submit Questionnaire",

    // Section headers
    painQuestions: {
      title: "Pain Questions"
    },
    symptomsQuestions: {
      title: "Symptom Questions"
    },
    additionalQuestions: {
      title: "Additional Questions",
      description: "Additional pain, stiffness, and daily function questions for comprehensive assessment."
    },
    qualityQuestions: {
      title: "Quality of Life",
      description: "Questions about how your knee affects your overall quality of life."
    },
    coreQuestions: {
      title: "Position-Specific Core Questions"
    },

    // Subsection headers
    sharedBy3Positions: "🔗 Shared by 3 positions (DL_stand, split_stand & SL_stand):",
    sharedBySplitAndSingle: "🔗 Shared by split_stand & SL_stand:",
    sharedByDoubleAndSplit: "🔗 Shared by DL_stand & split_stand:",
    sharedByDoubleAndSingle: "🔗 Shared by DL_stand & SL_stand:",
    sharedByDoubleAndQuad: "🔗 Shared by DL_stand & quadruped:",
    uniqueToDouble: "📍 DL_stand Unique Questions:",
    uniqueToSplit: "📍 split_stand Unique Questions:",
    uniqueToSingle: "📍 SL_stand Unique Questions:",
    uniqueToQuad: "📍 quadruped Unique Questions:",

    // Result page
    resultTitle: "✓ Questionnaire Complete!",
    resultSubtitle: "Please show this QR code to your physiotherapist",
    assessmentId: "Your Assessment ID:",
    manualIdNote: "You can also provide this ID manually if needed",
    saveInstructions: "📱 Save this screen or take a screenshot\n💾 Your assessment has been saved"
  },

  'zh-TW': {
    // Page Header (for dynamic rendering)
    pageTitle: "膝關節運動評估",
    pageSubtitle: "第1頁，共3頁：問卷調查",

    // Header & Navigation
    headerTitle: "膝關節運動評估",
    headerSubtitle: "病患問卷調查",
    progressText: "已回答問題",

    // Language toggle
    languageLabel: "語言",
    english: "English",
    chinese: "繁體中文",

    // Buttons
    submitButton: "提交問卷",

    // Section headers
    painQuestions: {
      title: "疼痛相關問題（適用於所有姿勢）"
    },
    symptomsQuestions: {
      title: "症狀相關問題（適用於所有姿勢）"
    },
    additionalQuestions: {
      title: "補充問題",
      description: "額外的疼痛、僵硬和日常功能問題，以進行全面評估。"
    },
    qualityQuestions: {
      title: "生活質量",
      description: "關於您的膝蓋如何影響您整體生活質量的問題。"
    },
    coreQuestions: {
      title: "特定姿勢核心問題"
    },

    // Subsection headers
    sharedBy3Positions: "🔗 三種姿勢共用（雙腿站立、分腿站立與單腿站立）：",
    sharedBySplitAndSingle: "🔗 分腿站立與單腿站立共用：",
    sharedByDoubleAndSplit: "🔗 雙腿站立與分腿站立共用：",
    sharedByDoubleAndSingle: "🔗 雙腿站立與單腿站立共用：",
    sharedByDoubleAndQuad: "🔗 雙腿站立與四足跪姿共用：",
    uniqueToDouble: "📍 雙腿站立特有問題：",
    uniqueToSplit: "📍 分腿站立特有問題：",
    uniqueToSingle: "📍 單腿站立特有問題：",
    uniqueToQuad: "📍 四足跪姿特有問題：",

    // Result page
    resultTitle: "✓ 問卷已完成！",
    resultSubtitle: "請向您的物理治療師出示此QR碼",
    assessmentId: "您的評估編號：",
    manualIdNote: "如有需要，您也可以手動提供此編號",
    saveInstructions: "📱 保存此畫面或截圖\n💾 您的評估已儲存"
  }
};

// Question translations
export const questionTranslations = {
  'en': {
    P1: {
      text: "How often do you experience knee pain?",
      options: ["Never (0)", "Monthly (1)", "Weekly (2)", "Daily (3)", "Always (4)"]
    },
    P2: {
      text: "Twisting/pivoting on your knee",
      options: ["None (0)", "Mild (1)", "Moderate (2)", "Severe (3)", "Extreme (4)"]
    },
    P3: {
      text: "Straightening knee fully",
      note: "→ quadruped only",
      options: ["None (0)", "Mild (1)", "Moderate (2)", "Severe (3)", "Extreme (4)"]
    },
    P4: {
      text: "Bending knee fully",
      note: "→ quadruped only",
      options: ["None (0)", "Mild (1)", "Moderate (2)", "Severe (3)", "Extreme (4)"]
    },
    P5: {
      text: "Walking on flat surface",
      options: ["None (0)", "Mild (1)", "Moderate (2)", "Severe (3)", "Extreme (4)"]
    },
    P6: {
      text: "Going up or down stairs",
      options: ["None (0)", "Mild (1)", "Moderate (2)", "Severe (3)", "Extreme (4)"]
    },
    P9: {
      text: "Standing upright",
      options: ["None (0)", "Mild (1)", "Moderate (2)", "Severe (3)", "Extreme (4)"]
    },
    S1: {
      text: "Do you have swelling in your knee?",
      options: ["Never (0)", "Rarely (1)", "Sometimes (2)", "Often (3)", "Always (4)"]
    },
    S2: {
      text: "Do you feel grinding, hear clicking or any other type of noise when your knee moves?",
      options: ["Never (0)", "Rarely (1)", "Sometimes (2)", "Often (3)", "Always (4)"]
    },
    S3: {
      text: "Does your knee catch or hang up when moving?",
      options: ["Never (0)", "Rarely (1)", "Sometimes (2)", "Often (3)", "Always (4)"]
    },
    S4: {
      text: "Can you straighten your knee fully?",
      options: ["Always (0)", "Often (1)", "Sometimes (2)", "Rarely (3)", "Never (4)"]
    },
    S5: {
      text: "Can you bend your knee fully?",
      options: ["Always (0)", "Often (1)", "Sometimes (2)", "Rarely (3)", "Never (4)"]
    },
    P7: {
      text: "At night while in bed",
      options: ["None (0)", "Mild (1)", "Moderate (2)", "Severe (3)", "Extreme (4)"]
    },
    P8: {
      text: "Sitting or lying",
      options: ["None (0)", "Mild (1)", "Moderate (2)", "Severe (3)", "Extreme (4)"]
    },
    ST1: {
      text: "How severe is your knee joint stiffness after first wakening in the morning?",
      options: ["None (0)", "Mild (1)", "Moderate (2)", "Severe (3)", "Extreme (4)"]
    },
    F10: {
      text: "Rising from bed",
      options: ["None (0)", "Mild (1)", "Moderate (2)", "Severe (3)", "Extreme (4)"]
    },
    F12: {
      text: "Lying in bed (turning over, maintaining knee position)",
      options: ["None (0)", "Mild (1)", "Moderate (2)", "Severe (3)", "Extreme (4)"]
    },
    F14: {
      text: "Sitting",
      options: ["None (0)", "Mild (1)", "Moderate (2)", "Severe (3)", "Extreme (4)"]
    },
    F16: {
      text: "Heavy domestic duties (moving heavy boxes, scrubbing floors, etc)",
      options: ["None (0)", "Mild (1)", "Moderate (2)", "Severe (3)", "Extreme (4)"]
    },
    F17: {
      text: "Light domestic duties (cooking, dusting, etc)",
      options: ["None (0)", "Mild (1)", "Moderate (2)", "Severe (3)", "Extreme (4)"]
    },
    Q1: {
      text: "How often are you aware of your knee problem?",
      options: ["Never (0)", "Monthly (1)", "Weekly (2)", "Daily (3)", "Constantly (4)"]
    },
    Q2: {
      text: "Have you modified your life style to avoid potentially damaging activities to your knee?",
      options: ["Not at all (0)", "Mildly (1)", "Moderately (2)", "Severely (3)", "Totally (4)"]
    },
    Q3: {
      text: "How much are you troubled with lack of confidence in your knee?",
      options: ["Not at all (0)", "Mildly (1)", "Moderately (2)", "Severely (3)", "Extremely (4)"]
    },
    Q4: {
      text: "In general, how much difficulty do you have with your knee?",
      options: ["None (0)", "Mild (1)", "Moderate (2)", "Severe (3)", "Extreme (4)"]
    },
    SP1: {
      text: "Squatting",
      note: "→ DL_stand, split_stand & SL_stand",
      options: ["None (0)", "Mild (1)", "Moderate (2)", "Severe (3)", "Extreme (4)"]
    },
    F1: {
      text: "Descending stairs",
      note: "→ split_stand & SL_stand",
      options: ["None (0)", "Mild (1)", "Moderate (2)", "Severe (3)", "Extreme (4)"]
    },
    F2: {
      text: "Ascending stairs",
      note: "→ split_stand & SL_stand",
      options: ["None (0)", "Mild (1)", "Moderate (2)", "Severe (3)", "Extreme (4)"]
    },
    SP4: {
      text: "Twisting/pivoting on your injured knee",
      note: "→ split_stand & SL_stand",
      options: ["None (0)", "Mild (1)", "Moderate (2)", "Severe (3)", "Extreme (4)"]
    },
    F3: {
      text: "Rising from sitting",
      note: "→ DL_stand & split_stand",
      options: ["None (0)", "Mild (1)", "Moderate (2)", "Severe (3)", "Extreme (4)"]
    },
    F4: {
      text: "Standing",
      note: "→ DL_stand & SL_stand",
      options: ["None (0)", "Mild (1)", "Moderate (2)", "Severe (3)", "Extreme (4)"]
    },
    F5: {
      text: "Bending to floor/pick up an object",
      note: "→ DL_stand & quadruped",
      options: ["None (0)", "Mild (1)", "Moderate (2)", "Severe (3)", "Extreme (4)"]
    },
    F6: {
      text: "Walking on flat surface",
      note: "→ DL_stand only",
      options: ["None (0)", "Mild (1)", "Moderate (2)", "Severe (3)", "Extreme (4)"]
    },
    F8: {
      text: "Going shopping",
      note: "→ DL_stand only",
      options: ["None (0)", "Mild (1)", "Moderate (2)", "Severe (3)", "Extreme (4)"]
    },
    F7: {
      text: "Getting in/out of car",
      note: "→ split_stand only",
      options: ["None (0)", "Mild (1)", "Moderate (2)", "Severe (3)", "Extreme (4)"]
    },
    F13: {
      text: "Getting in/out of bath",
      note: "→ split_stand only",
      options: ["None (0)", "Mild (1)", "Moderate (2)", "Severe (3)", "Extreme (4)"]
    },
    F15: {
      text: "Getting on/off toilet",
      note: "→ split_stand only",
      options: ["None (0)", "Mild (1)", "Moderate (2)", "Severe (3)", "Extreme (4)"]
    },
    F9: {
      text: "Putting on socks/stockings",
      note: "→ SL_stand only",
      options: ["None (0)", "Mild (1)", "Moderate (2)", "Severe (3)", "Extreme (4)"]
    },
    F11: {
      text: "Taking off socks/stockings",
      note: "→ SL_stand only",
      options: ["None (0)", "Mild (1)", "Moderate (2)", "Severe (3)", "Extreme (4)"]
    },
    SP2: {
      text: "Running",
      note: "→ SL_stand only",
      options: ["None (0)", "Mild (1)", "Moderate (2)", "Severe (3)", "Extreme (4)"]
    },
    SP3: {
      text: "Jumping",
      note: "→ SL_stand only",
      options: ["None (0)", "Mild (1)", "Moderate (2)", "Severe (3)", "Extreme (4)"]
    },
    SP5: {
      text: "Kneeling",
      note: "→ quadruped only",
      options: ["None (0)", "Mild (1)", "Moderate (2)", "Severe (3)", "Extreme (4)"]
    },
    ST2: {
      text: "How severe is your knee stiffness after sitting, lying or resting later in the day?",
      note: "→ quadruped only",
      options: ["None (0)", "Mild (1)", "Moderate (2)", "Severe (3)", "Extreme (4)"]
    }
  },

  'zh-TW': {
    P1: {
      text: "您多久會感到膝蓋疼痛？",
      options: ["從不 (0)", "每月一次 (1)", "每週一次 (2)", "每天 (3)", "持續疼痛 (4)"]
    },
    P2: {
      text: "膝蓋扭轉/轉向時的疼痛程度",
      options: ["無 (0)", "輕度 (1)", "中度 (2)", "重度 (3)", "極重度 (4)"]
    },
    P3: {
      text: "完全伸直膝蓋時的疼痛程度",
      note: "→ 僅限四足跪姿",
      options: ["無 (0)", "輕度 (1)", "中度 (2)", "重度 (3)", "極重度 (4)"]
    },
    P4: {
      text: "完全彎曲膝蓋時的疼痛程度",
      note: "→ 僅限四足跪姿",
      options: ["無 (0)", "輕度 (1)", "中度 (2)", "重度 (3)", "極重度 (4)"]
    },
    P5: {
      text: "在平地上行走時的疼痛程度",
      options: ["無 (0)", "輕度 (1)", "中度 (2)", "重度 (3)", "極重度 (4)"]
    },
    P6: {
      text: "上下樓梯時的疼痛程度",
      options: ["無 (0)", "輕度 (1)", "中度 (2)", "重度 (3)", "極重度 (4)"]
    },
    P9: {
      text: "直立站立時的疼痛程度",
      options: ["無 (0)", "輕度 (1)", "中度 (2)", "重度 (3)", "極重度 (4)"]
    },
    S1: {
      text: "您的膝蓋有腫脹嗎？",
      options: ["從不 (0)", "偶爾 (1)", "有時 (2)", "經常 (3)", "總是 (4)"]
    },
    S2: {
      text: "當膝蓋活動時，您是否感到磨擦聲、聽到喀喀聲或其他類型的雜音？",
      options: ["從不 (0)", "偶爾 (1)", "有時 (2)", "經常 (3)", "總是 (4)"]
    },
    S3: {
      text: "膝蓋移動時是否會卡住或僵住？",
      options: ["從不 (0)", "偶爾 (1)", "有時 (2)", "經常 (3)", "總是 (4)"]
    },
    S4: {
      text: "您能完全伸直膝蓋嗎？",
      options: ["總是可以 (0)", "經常可以 (1)", "有時可以 (2)", "偶爾可以 (3)", "從不可以 (4)"]
    },
    S5: {
      text: "您能完全彎曲膝蓋嗎？",
      options: ["總是可以 (0)", "經常可以 (1)", "有時可以 (2)", "偶爾可以 (3)", "從不可以 (4)"]
    },
    P7: {
      text: "夜間躺在床上時的疼痛程度",
      options: ["無 (0)", "輕度 (1)", "中度 (2)", "重度 (3)", "極重度 (4)"]
    },
    P8: {
      text: "坐著或躺著時的疼痛程度",
      options: ["無 (0)", "輕度 (1)", "中度 (2)", "重度 (3)", "極重度 (4)"]
    },
    ST1: {
      text: "早上剛醒來時，您膝關節的僵硬程度有多嚴重？",
      options: ["無僵硬 (0)", "輕度僵硬 (1)", "中度僵硬 (2)", "重度僵硬 (3)", "極重度僵硬 (4)"]
    },
    F10: {
      text: "從床上起身時的困難程度",
      options: ["無困難 (0)", "輕度困難 (1)", "中度困難 (2)", "重度困難 (3)", "極重度困難 (4)"]
    },
    F12: {
      text: "躺在床上時的困難程度（翻身、保持膝蓋位置）",
      options: ["無困難 (0)", "輕度困難 (1)", "中度困難 (2)", "重度困難 (3)", "極重度困難 (4)"]
    },
    F14: {
      text: "坐著時的困難程度",
      options: ["無困難 (0)", "輕度困難 (1)", "中度困難 (2)", "重度困難 (3)", "極重度困難 (4)"]
    },
    F16: {
      text: "做重型家務時的困難程度（搬運重物、擦地板等）",
      options: ["無困難 (0)", "輕度困難 (1)", "中度困難 (2)", "重度困難 (3)", "極重度困難 (4)"]
    },
    F17: {
      text: "做輕型家務時的困難程度（烹飪、除塵等）",
      options: ["無困難 (0)", "輕度困難 (1)", "中度困難 (2)", "重度困難 (3)", "極重度困難 (4)"]
    },
    Q1: {
      text: "您多久會意識到膝蓋問題？",
      options: ["從不 (0)", "每月一次 (1)", "每週一次 (2)", "每天 (3)", "持續 (4)"]
    },
    Q2: {
      text: "您是否改變了生活方式以避免可能損害膝蓋的活動？",
      options: ["完全沒有 (0)", "輕微 (1)", "中度 (2)", "嚴重 (3)", "完全改變 (4)"]
    },
    Q3: {
      text: "您對膝蓋缺乏信心的困擾程度如何？",
      options: ["完全沒有 (0)", "輕微 (1)", "中度 (2)", "嚴重 (3)", "極度 (4)"]
    },
    Q4: {
      text: "總體而言，您的膝蓋有多大困難？",
      options: ["無困難 (0)", "輕度困難 (1)", "中度困難 (2)", "重度困難 (3)", "極重度困難 (4)"]
    },
    SP1: {
      text: "蹲下時的困難程度",
      note: "→ 雙腿站立、分腿站立與單腿站立",
      options: ["無困難 (0)", "輕度困難 (1)", "中度困難 (2)", "重度困難 (3)", "極重度困難 (4)"]
    },
    F1: {
      text: "下樓梯時的困難程度",
      note: "→ 分腿站立與單腿站立",
      options: ["無困難 (0)", "輕度困難 (1)", "中度困難 (2)", "重度困難 (3)", "極重度困難 (4)"]
    },
    F2: {
      text: "上樓梯時的困難程度",
      note: "→ 分腿站立與單腿站立",
      options: ["無困難 (0)", "輕度困難 (1)", "中度困難 (2)", "重度困難 (3)", "極重度困難 (4)"]
    },
    SP4: {
      text: "受傷膝蓋扭轉/轉向時的困難程度",
      note: "→ 分腿站立與單腿站立",
      options: ["無困難 (0)", "輕度困難 (1)", "中度困難 (2)", "重度困難 (3)", "極重度困難 (4)"]
    },
    F3: {
      text: "從坐姿起身時的困難程度",
      note: "→ 雙腿站立與分腿站立",
      options: ["無困難 (0)", "輕度困難 (1)", "中度困難 (2)", "重度困難 (3)", "極重度困難 (4)"]
    },
    F4: {
      text: "站立時的困難程度",
      note: "→ 雙腿站立與單腿站立",
      options: ["無困難 (0)", "輕度困難 (1)", "中度困難 (2)", "重度困難 (3)", "極重度困難 (4)"]
    },
    F5: {
      text: "彎腰至地面/撿拾物品時的困難程度",
      note: "→ 雙腿站立與四足跪姿",
      options: ["無困難 (0)", "輕度困難 (1)", "中度困難 (2)", "重度困難 (3)", "極重度困難 (4)"]
    },
    F6: {
      text: "在平地上行走時的困難程度",
      note: "→ 僅限雙腿站立",
      options: ["無困難 (0)", "輕度困難 (1)", "中度困難 (2)", "重度困難 (3)", "極重度困難 (4)"]
    },
    F8: {
      text: "購物時的困難程度",
      note: "→ 僅限雙腿站立",
      options: ["無困難 (0)", "輕度困難 (1)", "中度困難 (2)", "重度困難 (3)", "極重度困難 (4)"]
    },
    F7: {
      text: "進出汽車時的困難程度",
      note: "→ 僅限分腿站立",
      options: ["無困難 (0)", "輕度困難 (1)", "中度困難 (2)", "重度困難 (3)", "極重度困難 (4)"]
    },
    F13: {
      text: "進出浴缸時的困難程度",
      note: "→ 僅限分腿站立",
      options: ["無困難 (0)", "輕度困難 (1)", "中度困難 (2)", "重度困難 (3)", "極重度困難 (4)"]
    },
    F15: {
      text: "上下馬桶時的困難程度",
      note: "→ 僅限分腿站立",
      options: ["無困難 (0)", "輕度困難 (1)", "中度困難 (2)", "重度困難 (3)", "極重度困難 (4)"]
    },
    F9: {
      text: "穿襪子/絲襪時的困難程度",
      note: "→ 僅限單腿站立",
      options: ["無困難 (0)", "輕度困難 (1)", "中度困難 (2)", "重度困難 (3)", "極重度困難 (4)"]
    },
    F11: {
      text: "脫襪子/絲襪時的困難程度",
      note: "→ 僅限單腿站立",
      options: ["無困難 (0)", "輕度困難 (1)", "中度困難 (2)", "重度困難 (3)", "極重度困難 (4)"]
    },
    SP2: {
      text: "跑步時的困難程度",
      note: "→ 僅限單腿站立",
      options: ["無困難 (0)", "輕度困難 (1)", "中度困難 (2)", "重度困難 (3)", "極重度困難 (4)"]
    },
    SP3: {
      text: "跳躍時的困難程度",
      note: "→ 僅限單腿站立",
      options: ["無困難 (0)", "輕度困難 (1)", "中度困難 (2)", "重度困難 (3)", "極重度困難 (4)"]
    },
    SP5: {
      text: "跪下時的困難程度",
      note: "→ 僅限四足跪姿",
      options: ["無困難 (0)", "輕度困難 (1)", "中度困難 (2)", "重度困難 (3)", "極重度困難 (4)"]
    },
    ST2: {
      text: "在一天後期坐著、躺著或休息後，您膝蓋的僵硬程度有多嚴重？",
      note: "→ 僅限四足跪姿",
      options: ["無僵硬 (0)", "輕度僵硬 (1)", "中度僵硬 (2)", "重度僵硬 (3)", "極重度僵硬 (4)"]
    }
  }
};

/**
 * Get translation for a specific key
 */
export function getTranslation(key, lang = 'zh-TW') {
  const keys = key.split('.');
  let value = translations[lang];

  for (const k of keys) {
    if (value && typeof value === 'object') {
      value = value[k];
    } else {
      return key; // Return key if translation not found
    }
  }

  return value || key;
}

/**
 * Get question translation
 */
export function getQuestionTranslation(code, lang = 'zh-TW') {
  return questionTranslations[lang]?.[code] || questionTranslations['en'][code];
}
