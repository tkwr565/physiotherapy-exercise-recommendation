/**
 * Complete KOOS/WOMAC Questionnaire Data
 * Extracted from reference HTML with exact wording and structure
 */

export const questionnaireData = {
  sections: [
    {
      id: 'pain',
      title: 'Pain Questions',
      description: 'These questions affect all exercise positions with 25% weight in composite scoring.',
      questions: [
        {
          code: 'P1',
          text: 'How often do you experience knee pain?',
          options: [
            { value: 0, label: 'Never' },
            { value: 1, label: 'Monthly' },
            { value: 2, label: 'Weekly' },
            { value: 3, label: 'Daily' },
            { value: 4, label: 'Always' }
          ]
        },
        {
          code: 'P2',
          text: 'Twisting/pivoting on your knee',
          options: [
            { value: 0, label: 'None' },
            { value: 1, label: 'Mild' },
            { value: 2, label: 'Moderate' },
            { value: 3, label: 'Severe' },
            { value: 4, label: 'Extreme' }
          ]
        },
        {
          code: 'P5',
          text: 'Walking on flat surface',
          options: [
            { value: 0, label: 'None' },
            { value: 1, label: 'Mild' },
            { value: 2, label: 'Moderate' },
            { value: 3, label: 'Severe' },
            { value: 4, label: 'Extreme' }
          ]
        },
        {
          code: 'P6',
          text: 'Going up or down stairs',
          options: [
            { value: 0, label: 'None' },
            { value: 1, label: 'Mild' },
            { value: 2, label: 'Moderate' },
            { value: 3, label: 'Severe' },
            { value: 4, label: 'Extreme' }
          ]
        },
        {
          code: 'P9',
          text: 'Standing upright',
          options: [
            { value: 0, label: 'None' },
            { value: 1, label: 'Mild' },
            { value: 2, label: 'Moderate' },
            { value: 3, label: 'Severe' },
            { value: 4, label: 'Extreme' }
          ]
        }
      ]
    },
    {
      id: 'symptoms',
      title: 'Symptom Questions',
      description: 'These questions affect all exercise positions with 15% weight in composite scoring.',
      questions: [
        {
          code: 'S1',
          text: 'Do you have swelling in your knee?',
          options: [
            { value: 0, label: 'Never' },
            { value: 1, label: 'Rarely' },
            { value: 2, label: 'Sometimes' },
            { value: 3, label: 'Often' },
            { value: 4, label: 'Always' }
          ]
        },
        {
          code: 'S2',
          text: 'Do you feel grinding, hear clicking or any other type of noise when your knee moves?',
          options: [
            { value: 0, label: 'Never' },
            { value: 1, label: 'Rarely' },
            { value: 2, label: 'Sometimes' },
            { value: 3, label: 'Often' },
            { value: 4, label: 'Always' }
          ]
        },
        {
          code: 'S3',
          text: 'Does your knee catch or hang up when moving?',
          options: [
            { value: 0, label: 'Never' },
            { value: 1, label: 'Rarely' },
            { value: 2, label: 'Sometimes' },
            { value: 3, label: 'Often' },
            { value: 4, label: 'Always' }
          ]
        },
        {
          code: 'S4',
          text: 'Can you straighten your knee fully?',
          options: [
            { value: 0, label: 'Always' },
            { value: 1, label: 'Often' },
            { value: 2, label: 'Sometimes' },
            { value: 3, label: 'Rarely' },
            { value: 4, label: 'Never' }
          ]
        },
        {
          code: 'S5',
          text: 'Can you bend your knee fully?',
          options: [
            { value: 0, label: 'Always' },
            { value: 1, label: 'Often' },
            { value: 2, label: 'Sometimes' },
            { value: 3, label: 'Rarely' },
            { value: 4, label: 'Never' }
          ]
        }
      ]
    },
    {
      id: 'core',
      title: 'Position-Specific Core Questions',
      description: 'These questions are used for different exercise positions as core ability indicators (60% weight).',
      subsections: [
        {
          title: '🔗 Shared by 3 positions (DL_stand, split_stand & SL_stand)',
          questions: [
            {
              code: 'SP1',
              text: 'Squatting',
              note: '→ DL_stand, split_stand & SL_stand',
              options: [
                { value: 0, label: 'None' },
                { value: 1, label: 'Mild' },
                { value: 2, label: 'Moderate' },
                { value: 3, label: 'Severe' },
                { value: 4, label: 'Extreme' }
              ]
            }
          ]
        },
        {
          title: '🔗 Shared by split_stand & SL_stand',
          questions: [
            {
              code: 'F1',
              text: 'Descending stairs',
              note: '→ split_stand & SL_stand',
              options: [
                { value: 0, label: 'None' },
                { value: 1, label: 'Mild' },
                { value: 2, label: 'Moderate' },
                { value: 3, label: 'Severe' },
                { value: 4, label: 'Extreme' }
              ]
            },
            {
              code: 'F2',
              text: 'Ascending stairs',
              note: '→ split_stand & SL_stand',
              options: [
                { value: 0, label: 'None' },
                { value: 1, label: 'Mild' },
                { value: 2, label: 'Moderate' },
                { value: 3, label: 'Severe' },
                { value: 4, label: 'Extreme' }
              ]
            },
            {
              code: 'SP4',
              text: 'Twisting/pivoting on your injured knee',
              note: '→ split_stand & SL_stand',
              options: [
                { value: 0, label: 'None' },
                { value: 1, label: 'Mild' },
                { value: 2, label: 'Moderate' },
                { value: 3, label: 'Severe' },
                { value: 4, label: 'Extreme' }
              ]
            }
          ]
        },
        {
          title: '🔗 Shared by DL_stand & split_stand',
          questions: [
            {
              code: 'F3',
              text: 'Rising from sitting',
              note: '→ DL_stand & split_stand',
              options: [
                { value: 0, label: 'None' },
                { value: 1, label: 'Mild' },
                { value: 2, label: 'Moderate' },
                { value: 3, label: 'Severe' },
                { value: 4, label: 'Extreme' }
              ]
            }
          ]
        },
        {
          title: '🔗 Shared by DL_stand & SL_stand',
          questions: [
            {
              code: 'F4',
              text: 'Standing',
              note: '→ DL_stand & SL_stand',
              options: [
                { value: 0, label: 'None' },
                { value: 1, label: 'Mild' },
                { value: 2, label: 'Moderate' },
                { value: 3, label: 'Severe' },
                { value: 4, label: 'Extreme' }
              ]
            }
          ]
        },
        {
          title: '🔗 Shared by DL_stand & quadruped',
          questions: [
            {
              code: 'F5',
              text: 'Bending to floor/pick up an object',
              note: '→ DL_stand & quadruped',
              options: [
                { value: 0, label: 'None' },
                { value: 1, label: 'Mild' },
                { value: 2, label: 'Moderate' },
                { value: 3, label: 'Severe' },
                { value: 4, label: 'Extreme' }
              ]
            }
          ]
        },
        {
          title: '📍 DL_stand Unique Questions',
          questions: [
            {
              code: 'F6',
              text: 'Walking on flat surface',
              note: '→ DL_stand only',
              options: [
                { value: 0, label: 'None' },
                { value: 1, label: 'Mild' },
                { value: 2, label: 'Moderate' },
                { value: 3, label: 'Severe' },
                { value: 4, label: 'Extreme' }
              ]
            },
            {
              code: 'F8',
              text: 'Going shopping',
              note: '→ DL_stand only',
              options: [
                { value: 0, label: 'None' },
                { value: 1, label: 'Mild' },
                { value: 2, label: 'Moderate' },
                { value: 3, label: 'Severe' },
                { value: 4, label: 'Extreme' }
              ]
            }
          ]
        },
        {
          title: '📍 split_stand Unique Questions',
          questions: [
            {
              code: 'F7',
              text: 'Getting in/out of car',
              note: '→ split_stand only',
              options: [
                { value: 0, label: 'None' },
                { value: 1, label: 'Mild' },
                { value: 2, label: 'Moderate' },
                { value: 3, label: 'Severe' },
                { value: 4, label: 'Extreme' }
              ]
            },
            {
              code: 'F13',
              text: 'Getting in/out of bath',
              note: '→ split_stand only',
              options: [
                { value: 0, label: 'None' },
                { value: 1, label: 'Mild' },
                { value: 2, label: 'Moderate' },
                { value: 3, label: 'Severe' },
                { value: 4, label: 'Extreme' }
              ]
            },
            {
              code: 'F15',
              text: 'Getting on/off toilet',
              note: '→ split_stand only',
              options: [
                { value: 0, label: 'None' },
                { value: 1, label: 'Mild' },
                { value: 2, label: 'Moderate' },
                { value: 3, label: 'Severe' },
                { value: 4, label: 'Extreme' }
              ]
            }
          ]
        },
        {
          title: '📍 SL_stand Unique Questions',
          questions: [
            {
              code: 'F9',
              text: 'Putting on socks/stockings',
              note: '→ SL_stand only',
              options: [
                { value: 0, label: 'None' },
                { value: 1, label: 'Mild' },
                { value: 2, label: 'Moderate' },
                { value: 3, label: 'Severe' },
                { value: 4, label: 'Extreme' }
              ]
            },
            {
              code: 'F11',
              text: 'Taking off socks/stockings',
              note: '→ SL_stand only',
              options: [
                { value: 0, label: 'None' },
                { value: 1, label: 'Mild' },
                { value: 2, label: 'Moderate' },
                { value: 3, label: 'Severe' },
                { value: 4, label: 'Extreme' }
              ]
            },
            {
              code: 'SP2',
              text: 'Running',
              note: '→ SL_stand only',
              options: [
                { value: 0, label: 'None' },
                { value: 1, label: 'Mild' },
                { value: 2, label: 'Moderate' },
                { value: 3, label: 'Severe' },
                { value: 4, label: 'Extreme' }
              ]
            },
            {
              code: 'SP3',
              text: 'Jumping',
              note: '→ SL_stand only',
              options: [
                { value: 0, label: 'None' },
                { value: 1, label: 'Mild' },
                { value: 2, label: 'Moderate' },
                { value: 3, label: 'Severe' },
                { value: 4, label: 'Extreme' }
              ]
            }
          ]
        },
        {
          title: '📍 quadruped Unique Questions',
          questions: [
            {
              code: 'SP5',
              text: 'Kneeling',
              note: '→ quadruped only',
              options: [
                { value: 0, label: 'None' },
                { value: 1, label: 'Mild' },
                { value: 2, label: 'Moderate' },
                { value: 3, label: 'Severe' },
                { value: 4, label: 'Extreme' }
              ]
            },
            {
              code: 'ST2',
              text: 'How severe is your knee stiffness after sitting, lying or resting later in the day?',
              note: '→ quadruped only',
              options: [
                { value: 0, label: 'None' },
                { value: 1, label: 'Mild' },
                { value: 2, label: 'Moderate' },
                { value: 3, label: 'Severe' },
                { value: 4, label: 'Extreme' }
              ]
            },
            {
              code: 'P3',
              text: 'Straightening knee fully',
              note: '→ quadruped only',
              options: [
                { value: 0, label: 'None' },
                { value: 1, label: 'Mild' },
                { value: 2, label: 'Moderate' },
                { value: 3, label: 'Severe' },
                { value: 4, label: 'Extreme' }
              ]
            },
            {
              code: 'P4',
              text: 'Bending knee fully',
              note: '→ quadruped only',
              options: [
                { value: 0, label: 'None' },
                { value: 1, label: 'Mild' },
                { value: 2, label: 'Moderate' },
                { value: 3, label: 'Severe' },
                { value: 4, label: 'Extreme' }
              ]
            }
          ]
        }
      ]
    }
  ]
};

// Required questions (30 total)
export const requiredQuestions = [
  'P1', 'P2', 'P5', 'P6', 'P9',  // Pain (5)
  'S1', 'S2', 'S3', 'S4', 'S5',  // Symptoms (5)
  'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F11', 'F13', 'F15',  // Function (12)
  'SP1', 'SP2', 'SP3', 'SP4', 'SP5',  // Sport (5)
  'ST2', 'P3', 'P4'  // Additional (3)
];

// Position definitions for scoring
export const positionDefinitions = {
  DL_stand: {
    name: 'Double Leg Stand',
    core: ['F3', 'F4', 'F5', 'F6', 'F8', 'SP1'],
    pain: ['P1', 'P2', 'P5', 'P6', 'P9'],
    symptoms: ['S1', 'S2', 'S3', 'S4', 'S5']
  },
  split_stand: {
    name: 'Split Stand',
    core: ['F1', 'F2', 'F3', 'F7', 'F13', 'F15', 'SP1', 'SP4'],
    pain: ['P1', 'P2', 'P5', 'P6', 'P9'],
    symptoms: ['S1', 'S2', 'S3', 'S4', 'S5']
  },
  SL_stand: {
    name: 'Single Leg Stand',
    core: ['F1', 'F2', 'F4', 'F9', 'F11', 'SP1', 'SP2', 'SP3', 'SP4'],
    pain: ['P1', 'P2', 'P5', 'P6', 'P9'],
    symptoms: ['S1', 'S2', 'S3', 'S4', 'S5']
  },
  quadruped: {
    name: 'Quadruped',
    core: ['F5', 'SP5', 'ST2', 'P3', 'P4'],
    pain: ['P1', 'P2', 'P5', 'P6', 'P9'],
    symptoms: ['S1', 'S2', 'S3', 'S4', 'S5']
  }
};
