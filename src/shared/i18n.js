/**
 * Internationalization (i18n) Module
 * Centralized translation system for the entire application
 *
 * Best Practices:
 * 1. All translations in one place for easy maintenance
 * 2. Nested structure for organization by feature/page
 * 3. Consistent key naming convention
 * 4. Dynamic language switching support
 * 5. Fallback to English if translation missing
 */

export const translations = {
  en: {
    // Common/Shared translations
    common: {
      appName: 'Physiotherapy Exercise Recommendation System',
      loading: 'Loading...',
      error: 'An error occurred',
      save: 'Save',
      cancel: 'Cancel',
      confirm: 'Confirm',
      back: 'Back',
      next: 'Next',
      submit: 'Submit',
      continue: 'Continue',
      yes: 'Yes',
      no: 'No',
      ok: 'OK',

      // Language toggle
      language: {
        english: 'English',
        chinese: '繁體中文'
      },

      // Gender
      gender: {
        male: 'Male',
        female: 'Female'
      },

      // Common status
      status: {
        present: 'Present',
        absent: 'Absent',
        completed: 'Completed',
        pending: 'Pending',
        failed: 'Failed'
      }
    },

    // Home page
    home: {
      title: 'Welcome to Physiotherapy Assessment',
      subtitle: 'Personalized Exercise Recommendations for Knee Health',
      loginPrompt: 'Enter your username to begin',
      usernamePlaceholder: 'Username',
      loginButton: 'Start Assessment',
      instructions: 'Complete a brief assessment to receive personalized exercise recommendations.',

      // Validation
      validation: {
        usernameRequired: 'Please enter a username',
        usernameInvalid: 'Username must be 3-20 characters, alphanumeric only',
        usernameTaken: 'This username is already taken',
        usernameAvailable: 'Username is available'
      }
    },

    // Questionnaire page (Page 1)
    questionnaire: {
      pageTitle: 'Knee Exercise Assessment',
      pageSubtitle: 'Page 1 of 3: Questionnaire',
      pageIndicator: 'Step 1 of 3: Questionnaire',

      instructions: 'Please answer the following questions about your knee condition. Your responses will help us recommend the most appropriate exercises for you.',

      // Section titles
      sections: {
        pain: 'Pain Assessment',
        painDescription: 'How much pain do you experience in the following situations?',
        symptoms: 'Symptom Assessment',
        symptomsDescription: 'Please indicate the frequency of these symptoms',
        positionSpecific: 'Position-Specific Assessment',
        positionDescription: 'Rate your difficulty with specific movements',
        flexibility: 'Flexibility Assessment',
        flexibilityDescription: 'Assess your current flexibility level'
      },

      // Toe touch test
      toeTouch: {
        label: 'Toe Touch Test',
        instruction: 'Stand with feet together, keep legs straight, and try to touch your toes. How far can you reach?',
        options: [
          'Can touch toes easily',
          'Can almost touch toes',
          'Can reach mid-shin',
          'Can reach knees only',
          'Cannot reach knees'
        ]
      },

      // Buttons
      submitButton: 'Continue to STS Assessment',
      backButton: 'Back to Home',

      // Validation
      validation: {
        allRequired: 'Please answer all questions before proceeding',
        invalidValue: 'Please select a valid option'
      },

      // Messages
      messages: {
        savingData: 'Saving your responses...',
        saveSuccess: 'Questionnaire saved successfully',
        saveError: 'Failed to save questionnaire. Please try again.'
      }
    },

    // STS Assessment page (Page 2)
    stsAssessment: {
      pageTitle: '30-Second Sit-to-Stand Assessment',
      pageSubtitle: 'Page 2 of 3: Functional Performance Test',
      pageIndicator: 'Step 2 of 3: Functional Test',

      instructions: 'Please complete the following assessment to help us recommend the most appropriate exercises for you.',

      // Test instructions
      testInstructions: {
        title: 'Test Instructions',
        description: 'Perform as many sit-to-stand repetitions as possible in 30 seconds. Start from a seated position and stand up fully, then return to seated. Count each complete cycle.'
      },

      // Form fields
      form: {
        repetitionCount: {
          label: 'Number of repetitions completed',
          placeholder: 'Enter number (e.g., 12)'
        },
        age: {
          label: 'Age',
          placeholder: 'Enter your age'
        },
        gender: {
          label: 'Gender',
          male: 'Male',
          female: 'Female'
        },
        kneeAlignment: {
          label: 'Knee Alignment',
          normal: 'Normal',
          valgus: 'Valgus (Knock-knees)',
          varus: 'Varus (Bow-legged)'
        },
        coreStability: {
          title: 'Core Stability Assessment',
          subtitle: 'Observe during the sit-to-stand test:',
          trunkSway: 'Trunk Sway',
          hipSway: 'Hip Sway'
        }
      },

      // Buttons
      submitButton: 'Continue to Results',
      backButton: 'Back to Questionnaire',

      // Validation
      validation: {
        allRequired: 'Please fill in all required fields',
        invalidRepetition: 'Please enter a valid number of repetitions',
        invalidAge: 'Please enter a valid age (18-120)'
      },

      // Messages
      messages: {
        prerequisite: 'Please complete the questionnaire first.',
        savingData: 'Saving assessment data...',
        saveError: 'Failed to save assessment data. Please try again.'
      }
    },

    // Results page (Page 3)
    results: {
      pageTitle: 'Your Personalized Exercise Recommendations',
      pageSubtitle: 'Page 3 of 3: Assessment Results & Exercise Plan',
      pageIndicator: 'Step 3 of 3: Results',

      loading: 'Loading your assessment results...',
      error: 'Failed to load assessment data. Please try again.',

      // Notice
      placeholderNotice: 'Note: Algorithm implementation in progress',
      comingSoon: 'Coming soon',

      // Summary section
      summary: {
        title: 'Assessment Summary',
        yourScores: 'Your Scores',
        painScore: 'Pain Score',
        symptomScore: 'Symptom Score',
        stsScore: 'Functional Performance (STS)',
        combinedScore: 'Overall Combined Score'
      },

      // Demographics
      demographics: {
        title: 'Your Profile',
        age: 'Age',
        gender: 'Gender'
      },

      // STS results
      sts: {
        title: 'Sit-to-Stand Assessment',
        repetitions: 'Repetitions Completed',
        benchmark: 'Normative Benchmark',
        performance: 'Performance Level',
        performanceLevels: {
          excellent: 'Excellent - Above benchmark',
          good: 'Good - Meeting benchmark',
          fair: 'Fair - Below benchmark',
          poor: 'Poor - Significantly below benchmark'
        }
      },

      // Biomechanics
      biomechanics: {
        title: 'Biomechanical Assessment',
        kneeAlignment: 'Knee Alignment',
        kneeTypes: {
          normal: 'Normal',
          valgus: 'Valgus (Knock-knees)',
          varus: 'Varus (Bow-legged)'
        },
        coreStability: 'Core Stability',
        trunkSway: 'Trunk Sway',
        hipSway: 'Hip Sway'
      },

      // Flexibility
      flexibility: {
        title: 'Flexibility Assessment',
        toeTouch: 'Toe Touch Test',
        levels: [
          'Can touch toes easily',
          'Can almost touch toes',
          'Can reach mid-shin',
          'Can reach knees only',
          'Cannot reach knees'
        ]
      },

      // Exercises
      exercises: {
        title: 'Recommended Exercises',
        subtitle: 'Exercises are ranked based on your assessment results',
        table: {
          rank: 'Rank',
          name: 'Exercise',
          position: 'Position',
          score: 'Match Score',
          muscles: 'Target Muscles',
          notes: 'Notes'
        },
        positions: {
          supine: 'Supine (Lying on back)',
          prone: 'Prone (Lying face down)',
          four_kneeling: 'Four-point Kneeling',
          quadruped: 'Four-point Kneeling',
          DL_stand: 'Double-leg Standing',
          split_stand: 'Split Stance',
          SL_stand: 'Single-leg Standing',
          side_lying: 'Side Lying'
        }
      },

      // Action buttons
      actions: {
        backButton: 'Back to Assessment',
        retakeButton: 'Retake Assessment',
        downloadButton: 'Download Results (PDF)',
        printButton: 'Print Results',
        retakeConfirm: 'Are you sure you want to retake the assessment?'
      }
    }
  },

  'zh-TW': {
    // Common/Shared translations
    common: {
      appName: '物理治療運動推薦系統',
      loading: '載入中...',
      error: '發生錯誤',
      save: '儲存',
      cancel: '取消',
      confirm: '確認',
      back: '返回',
      next: '下一步',
      submit: '提交',
      continue: '繼續',
      yes: '是',
      no: '否',
      ok: '確定',

      // Language toggle
      language: {
        english: 'English',
        chinese: '繁體中文'
      },

      // Gender
      gender: {
        male: '男性',
        female: '女性'
      },

      // Common status
      status: {
        present: '存在',
        absent: '不存在',
        completed: '已完成',
        pending: '待處理',
        failed: '失敗'
      }
    },

    // Home page
    home: {
      title: '歡迎使用物理治療評估系統',
      subtitle: '為膝關節健康提供個人化運動建議',
      loginPrompt: '輸入您的使用者名稱以開始',
      usernamePlaceholder: '使用者名稱',
      loginButton: '開始評估',
      instructions: '完成簡短評估以獲得個人化運動建議。',

      // Validation
      validation: {
        usernameRequired: '請輸入使用者名稱',
        usernameInvalid: '使用者名稱必須為3-20個字元，僅限英數字',
        usernameTaken: '此使用者名稱已被使用',
        usernameAvailable: '使用者名稱可用'
      }
    },

    // Questionnaire page (Page 1)
    questionnaire: {
      pageTitle: '膝關節運動評估',
      pageSubtitle: '第1頁，共3頁：問卷調查',
      pageIndicator: '步驟 1/3：問卷調查',

      instructions: '請回答以下關於您膝關節狀況的問題。您的回答將幫助我們為您推薦最合適的運動。',

      // Section titles
      sections: {
        pain: '疼痛評估',
        painDescription: '在以下情況下您感受到多少疼痛？',
        symptoms: '症狀評估',
        symptomsDescription: '請指出這些症狀的頻率',
        positionSpecific: '特定姿勢評估',
        positionDescription: '評估您在特定動作中的困難程度',
        flexibility: '柔韌性評估',
        flexibilityDescription: '評估您目前的柔韌性水平'
      },

      // Toe touch test
      toeTouch: {
        label: '觸摸腳趾測試',
        instruction: '雙腳併攏站立，保持雙腿伸直，嘗試觸摸腳趾。您能夠到多遠？',
        options: [
          '可以輕鬆觸摸腳趾',
          '幾乎可以觸摸腳趾',
          '可以觸摸小腿中部',
          '只能觸摸膝蓋',
          '無法觸摸膝蓋'
        ]
      },

      // Buttons
      submitButton: '繼續進行坐站測試',
      backButton: '返回首頁',

      // Validation
      validation: {
        allRequired: '請在繼續之前回答所有問題',
        invalidValue: '請選擇有效選項'
      },

      // Messages
      messages: {
        savingData: '正在儲存您的回答...',
        saveSuccess: '問卷已成功儲存',
        saveError: '儲存問卷失敗。請重試。'
      }
    },

    // STS Assessment page (Page 2)
    stsAssessment: {
      pageTitle: '30秒坐站測試',
      pageSubtitle: '第2頁，共3頁：功能性表現測試',
      pageIndicator: '步驟 2/3：功能測試',

      instructions: '請完成以下評估，以幫助我們為您推薦最合適的運動。',

      // Test instructions
      testInstructions: {
        title: '測試說明',
        description: '在30秒內盡可能多地完成坐站循環。從坐姿開始，完全站起，然後回到坐姿。計算每個完整循環。'
      },

      // Form fields
      form: {
        repetitionCount: {
          label: '完成的重複次數',
          placeholder: '輸入數字（例如：12）'
        },
        age: {
          label: '年齡',
          placeholder: '輸入您的年齡'
        },
        gender: {
          label: '性別',
          male: '男性',
          female: '女性'
        },
        kneeAlignment: {
          label: '膝蓋排列',
          normal: '正常',
          valgus: '外翻（X型腿）',
          varus: '內翻（O型腿）'
        },
        coreStability: {
          title: '核心穩定性評估',
          subtitle: '在坐站測試期間觀察：',
          trunkSway: '軀幹搖晃',
          hipSway: '髖部搖晃'
        }
      },

      // Buttons
      submitButton: '繼續查看結果',
      backButton: '返回問卷',

      // Validation
      validation: {
        allRequired: '請填寫所有必填欄位',
        invalidRepetition: '請輸入有效的重複次數',
        invalidAge: '請輸入有效的年齡（18-120）'
      },

      // Messages
      messages: {
        prerequisite: '請先完成問卷。',
        savingData: '正在保存評估數據...',
        saveError: '保存評估數據失敗。請重試。'
      }
    },

    // Results page (Page 3)
    results: {
      pageTitle: '您的個人化運動建議',
      pageSubtitle: '第3頁，共3頁：評估結果與運動計劃',
      pageIndicator: '步驟 3/3：結果',

      loading: '正在載入您的評估結果...',
      error: '無法載入評估數據。請重試。',

      // Notice
      placeholderNotice: '注意：演算法實施進行中',
      comingSoon: '即將推出',

      // Summary section
      summary: {
        title: '評估摘要',
        yourScores: '您的分數',
        painScore: '疼痛分數',
        symptomScore: '症狀分數',
        stsScore: '功能表現 (STS)',
        combinedScore: '整體綜合分數'
      },

      // Demographics
      demographics: {
        title: '您的資料',
        age: '年齡',
        gender: '性別'
      },

      // STS results
      sts: {
        title: '坐站測試評估',
        repetitions: '完成次數',
        benchmark: '標準基準',
        performance: '表現水平',
        performanceLevels: {
          excellent: '優秀 - 高於基準',
          good: '良好 - 達到基準',
          fair: '尚可 - 低於基準',
          poor: '需改善 - 明顯低於基準'
        }
      },

      // Biomechanics
      biomechanics: {
        title: '生物力學評估',
        kneeAlignment: '膝蓋排列',
        kneeTypes: {
          normal: '正常',
          valgus: '外翻（X型腿）',
          varus: '內翻（O型腿）'
        },
        coreStability: '核心穩定性',
        trunkSway: '軀幹搖晃',
        hipSway: '髖部搖晃'
      },

      // Flexibility
      flexibility: {
        title: '柔韌性評估',
        toeTouch: '觸摸腳趾測試',
        levels: [
          '可以輕鬆觸摸腳趾',
          '幾乎可以觸摸腳趾',
          '可以觸摸小腿中部',
          '只能觸摸膝蓋',
          '無法觸摸膝蓋'
        ]
      },

      // Exercises
      exercises: {
        title: '推薦運動',
        subtitle: '運動根據您的評估結果排序',
        table: {
          rank: '排名',
          name: '運動名稱',
          position: '姿勢',
          score: '匹配分數',
          muscles: '目標肌肉',
          notes: '備註'
        },
        positions: {
          supine: '仰臥（背部平躺）',
          prone: '俯臥（面朝下）',
          four_kneeling: '四足跪姿',
          quadruped: '四足跪姿',
          DL_stand: '雙腿站立',
          split_stand: '弓步站立',
          SL_stand: '單腿站立',
          side_lying: '側臥'
        }
      },

      // Action buttons
      actions: {
        backButton: '返回評估',
        retakeButton: '重新評估',
        downloadButton: '下載結果 (PDF)',
        printButton: '列印結果',
        retakeConfirm: '確定要重新開始評估嗎？'
      }
    }
  }
};

/**
 * Translation utility class
 */
class I18n {
  constructor() {
    this.currentLang = 'zh-TW'; // Default language
    this.translations = translations;
  }

  /**
   * Set current language
   * @param {string} lang - Language code ('en' or 'zh-TW')
   */
  setLanguage(lang) {
    if (this.translations[lang]) {
      this.currentLang = lang;
      localStorage.setItem('preferredLanguage', lang);
    }
  }

  /**
   * Get current language
   * @returns {string} Current language code
   */
  getLanguage() {
    return this.currentLang;
  }

  /**
   * Initialize language from localStorage or default
   */
  initLanguage() {
    const savedLang = localStorage.getItem('preferredLanguage');
    if (savedLang && this.translations[savedLang]) {
      this.currentLang = savedLang;
    }
  }

  /**
   * Get translation by key path
   * @param {string} keyPath - Dot-separated key path (e.g., 'common.language.english')
   * @param {object} params - Optional parameters for dynamic values
   * @returns {string} Translated text or key if not found
   */
  t(keyPath, params = {}) {
    const keys = keyPath.split('.');
    let value = this.translations[this.currentLang];

    // Navigate through nested objects
    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        // Fallback to English if translation not found
        value = this.translations['en'];
        for (const fallbackKey of keys) {
          if (value && typeof value === 'object' && fallbackKey in value) {
            value = value[fallbackKey];
          } else {
            console.warn(`Translation not found for key: ${keyPath}`);
            return keyPath;
          }
        }
      }
    }

    // Replace parameters in string
    if (typeof value === 'string' && Object.keys(params).length > 0) {
      return value.replace(/\{(\w+)\}/g, (match, key) => {
        return params[key] !== undefined ? params[key] : match;
      });
    }

    return value;
  }

  /**
   * Get translation object by prefix
   * @param {string} prefix - Key prefix (e.g., 'common')
   * @returns {object} Translation object
   */
  getSection(prefix) {
    const keys = prefix.split('.');
    let value = this.translations[this.currentLang];

    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return {};
      }
    }

    return value;
  }
}

// Create singleton instance
export const i18n = new I18n();

// Initialize language on module load
i18n.initLanguage();

/**
 * Convenience function for getting translations
 * @param {string} key - Translation key
 * @param {object} params - Optional parameters
 * @returns {string} Translated text
 */
export function t(key, params) {
  return i18n.t(key, params);
}

export default i18n;
