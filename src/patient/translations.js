/**
 * Bilingual translations for patient questionnaire
 * Default: Traditional Chinese (zh-TW)
 * Secondary: English (en)
 */

export const translations = {
  'en': {
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
      title: "Pain Questions",
      description: "These questions affect all exercise positions with 25% weight in composite scoring."
    },
    symptomQuestions: {
      title: "Symptom Questions",
      description: "These questions affect all exercise positions with 15% weight in composite scoring."
    },
    positionSpecificQuestions: {
      title: "Position-Specific Core Questions",
      description: "These questions are used for different exercise positions as core ability indicators (60% weight)."
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
      title: "疼痛相關問題（適用於所有姿勢）",
      description: "這些問題會影響所有運動姿勢，在綜合評分中佔25%的權重。"
    },
    symptomQuestions: {
      title: "症狀相關問題（適用於所有姿勢）",
      description: "這些問題會影響所有運動姿勢，在綜合評分中佔15%的權重。"
    },
    positionSpecificQuestions: {
      title: "特定姿勢核心問題（60%權重）",
      description: "這些問題用於評估不同運動姿勢的核心能力指標。"
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
      options: ["Never", "Monthly", "Weekly", "Daily", "Always"]
    },
    P2: {
      text: "Twisting/pivoting on your knee",
      options: ["None", "Mild", "Moderate", "Severe", "Extreme"]
    },
    P3: {
      text: "Straightening knee fully",
      options: ["None", "Mild", "Moderate", "Severe", "Extreme"]
    },
    P4: {
      text: "Bending knee fully",
      options: ["None", "Mild", "Moderate", "Severe", "Extreme"]
    },
    P5: {
      text: "Walking on flat surface",
      options: ["None", "Mild", "Moderate", "Severe", "Extreme"]
    },
    P6: {
      text: "Going up or down stairs",
      options: ["None", "Mild", "Moderate", "Severe", "Extreme"]
    },
    P9: {
      text: "Standing upright",
      options: ["None", "Mild", "Moderate", "Severe", "Extreme"]
    },
    S1: {
      text: "Do you have swelling in your knee?",
      options: ["Never", "Rarely", "Sometimes", "Often", "Always"]
    },
    S2: {
      text: "Do you feel grinding, hear clicking or any other type of noise when your knee moves?",
      options: ["Never", "Rarely", "Sometimes", "Often", "Always"]
    },
    S3: {
      text: "Does your knee catch or hang up when moving?",
      options: ["Never", "Rarely", "Sometimes", "Often", "Always"]
    },
    S4: {
      text: "Can you straighten your knee fully?",
      options: ["Always", "Often", "Sometimes", "Rarely", "Never"]
    },
    S5: {
      text: "Can you bend your knee fully?",
      options: ["Always", "Often", "Sometimes", "Rarely", "Never"]
    },
    SP1: {
      text: "Squatting",
      note: "→ DL_stand, split_stand & SL_stand",
      options: ["None", "Mild", "Moderate", "Severe", "Extreme"]
    },
    F1: {
      text: "Descending stairs",
      note: "→ split_stand & SL_stand",
      options: ["None", "Mild", "Moderate", "Severe", "Extreme"]
    },
    F2: {
      text: "Ascending stairs",
      note: "→ split_stand & SL_stand",
      options: ["None", "Mild", "Moderate", "Severe", "Extreme"]
    },
    SP4: {
      text: "Twisting/pivoting on your injured knee",
      note: "→ split_stand & SL_stand",
      options: ["None", "Mild", "Moderate", "Severe", "Extreme"]
    },
    F3: {
      text: "Rising from sitting",
      note: "→ DL_stand & split_stand",
      options: ["None", "Mild", "Moderate", "Severe", "Extreme"]
    },
    F4: {
      text: "Standing",
      note: "→ DL_stand & SL_stand",
      options: ["None", "Mild", "Moderate", "Severe", "Extreme"]
    },
    F5: {
      text: "Bending to floor/pick up an object",
      note: "→ DL_stand & quadruped",
      options: ["None", "Mild", "Moderate", "Severe", "Extreme"]
    },
    F6: {
      text: "Walking on flat surface",
      note: "→ DL_stand only",
      options: ["None", "Mild", "Moderate", "Severe", "Extreme"]
    },
    F8: {
      text: "Going shopping",
      note: "→ DL_stand only",
      options: ["None", "Mild", "Moderate", "Severe", "Extreme"]
    },
    F7: {
      text: "Getting in/out of car",
      note: "→ split_stand only",
      options: ["None", "Mild", "Moderate", "Severe", "Extreme"]
    },
    F13: {
      text: "Getting in/out of bath",
      note: "→ split_stand only",
      options: ["None", "Mild", "Moderate", "Severe", "Extreme"]
    },
    F15: {
      text: "Getting on/off toilet",
      note: "→ split_stand only",
      options: ["None", "Mild", "Moderate", "Severe", "Extreme"]
    },
    F9: {
      text: "Putting on socks/stockings",
      note: "→ SL_stand only",
      options: ["None", "Mild", "Moderate", "Severe", "Extreme"]
    },
    F11: {
      text: "Taking off socks/stockings",
      note: "→ SL_stand only",
      options: ["None", "Mild", "Moderate", "Severe", "Extreme"]
    },
    SP2: {
      text: "Running",
      note: "→ SL_stand only",
      options: ["None", "Mild", "Moderate", "Severe", "Extreme"]
    },
    SP3: {
      text: "Jumping",
      note: "→ SL_stand only",
      options: ["None", "Mild", "Moderate", "Severe", "Extreme"]
    },
    SP5: {
      text: "Kneeling",
      note: "→ quadruped only",
      options: ["None", "Mild", "Moderate", "Severe", "Extreme"]
    },
    ST2: {
      text: "How severe is your knee stiffness after sitting, lying or resting later in the day?",
      note: "→ quadruped only",
      options: ["None", "Mild", "Moderate", "Severe", "Extreme"]
    }
  },

  'zh-TW': {
    P1: {
      text: "您多久會感到膝蓋疼痛？",
      options: ["從不", "每月一次", "每週一次", "每天", "持續疼痛"]
    },
    P2: {
      text: "膝蓋扭轉/轉向時的疼痛程度",
      options: ["無", "輕度", "中度", "重度", "極重度"]
    },
    P3: {
      text: "完全伸直膝蓋時的疼痛程度",
      options: ["無", "輕度", "中度", "重度", "極重度"]
    },
    P4: {
      text: "完全彎曲膝蓋時的疼痛程度",
      options: ["無", "輕度", "中度", "重度", "極重度"]
    },
    P5: {
      text: "在平地上行走時的疼痛程度",
      options: ["無", "輕度", "中度", "重度", "極重度"]
    },
    P6: {
      text: "上下樓梯時的疼痛程度",
      options: ["無", "輕度", "中度", "重度", "極重度"]
    },
    P9: {
      text: "直立站立時的疼痛程度",
      options: ["無", "輕度", "中度", "重度", "極重度"]
    },
    S1: {
      text: "您的膝蓋有腫脹嗎？",
      options: ["從不", "偶爾", "有時", "經常", "總是"]
    },
    S2: {
      text: "當膝蓋活動時，您是否感到磨擦聲、聽到喀喀聲或其他類型的雜音？",
      options: ["從不", "偶爾", "有時", "經常", "總是"]
    },
    S3: {
      text: "膝蓋移動時是否會卡住或僵住？",
      options: ["從不", "偶爾", "有時", "經常", "總是"]
    },
    S4: {
      text: "您能完全伸直膝蓋嗎？",
      options: ["總是可以", "經常可以", "有時可以", "偶爾可以", "從不可以"]
    },
    S5: {
      text: "您能完全彎曲膝蓋嗎？",
      options: ["總是可以", "經常可以", "有時可以", "偶爾可以", "從不可以"]
    },
    SP1: {
      text: "蹲下時的困難程度",
      note: "→ 雙腿站立、分腿站立與單腿站立",
      options: ["無困難", "輕度困難", "中度困難", "重度困難", "極重度困難"]
    },
    F1: {
      text: "下樓梯時的困難程度",
      note: "→ 分腿站立與單腿站立",
      options: ["無困難", "輕度困難", "中度困難", "重度困難", "極重度困難"]
    },
    F2: {
      text: "上樓梯時的困難程度",
      note: "→ 分腿站立與單腿站立",
      options: ["無困難", "輕度困難", "中度困難", "重度困難", "極重度困難"]
    },
    SP4: {
      text: "受傷膝蓋扭轉/轉向時的困難程度",
      note: "→ 分腿站立與單腿站立",
      options: ["無困難", "輕度困難", "中度困難", "重度困難", "極重度困難"]
    },
    F3: {
      text: "從坐姿起身時的困難程度",
      note: "→ 雙腿站立與分腿站立",
      options: ["無困難", "輕度困難", "中度困難", "重度困難", "極重度困難"]
    },
    F4: {
      text: "站立時的困難程度",
      note: "→ 雙腿站立與單腿站立",
      options: ["無困難", "輕度困難", "中度困難", "重度困難", "極重度困難"]
    },
    F5: {
      text: "彎腰至地面/撿拾物品時的困難程度",
      note: "→ 雙腿站立與四足跪姿",
      options: ["無困難", "輕度困難", "中度困難", "重度困難", "極重度困難"]
    },
    F6: {
      text: "在平地上行走時的困難程度",
      note: "→ 僅限雙腿站立",
      options: ["無困難", "輕度困難", "中度困難", "重度困難", "極重度困難"]
    },
    F8: {
      text: "購物時的困難程度",
      note: "→ 僅限雙腿站立",
      options: ["無困難", "輕度困難", "中度困難", "重度困難", "極重度困難"]
    },
    F7: {
      text: "進出汽車時的困難程度",
      note: "→ 僅限分腿站立",
      options: ["無困難", "輕度困難", "中度困難", "重度困難", "極重度困難"]
    },
    F13: {
      text: "進出浴缸時的困難程度",
      note: "→ 僅限分腿站立",
      options: ["無困難", "輕度困難", "中度困難", "重度困難", "極重度困難"]
    },
    F15: {
      text: "上下馬桶時的困難程度",
      note: "→ 僅限分腿站立",
      options: ["無困難", "輕度困難", "中度困難", "重度困難", "極重度困難"]
    },
    F9: {
      text: "穿襪子/絲襪時的困難程度",
      note: "→ 僅限單腿站立",
      options: ["無困難", "輕度困難", "中度困難", "重度困難", "極重度困難"]
    },
    F11: {
      text: "脫襪子/絲襪時的困難程度",
      note: "→ 僅限單腿站立",
      options: ["無困難", "輕度困難", "中度困難", "重度困難", "極重度困難"]
    },
    SP2: {
      text: "跑步時的困難程度",
      note: "→ 僅限單腿站立",
      options: ["無困難", "輕度困難", "中度困難", "重度困難", "極重度困難"]
    },
    SP3: {
      text: "跳躍時的困難程度",
      note: "→ 僅限單腿站立",
      options: ["無困難", "輕度困難", "中度困難", "重度困難", "極重度困難"]
    },
    SP5: {
      text: "跪下時的困難程度",
      note: "→ 僅限四足跪姿",
      options: ["無困難", "輕度困難", "中度困難", "重度困難", "極重度困難"]
    },
    ST2: {
      text: "在一天後期坐著、躺著或休息後，您膝蓋的僵硬程度有多嚴重？",
      note: "→ 僅限四足跪姿",
      options: ["無僵硬", "輕度僵硬", "中度僵硬", "重度僵硬", "極重度僵硬"]
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
