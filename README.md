# Physiotherapy Exercise Recommendation System

> A bilingual (English/繁體中文) web application for evidence-based knee osteoarthritis exercise prescription using KOOS/WOMAC assessment and biomechanical screening.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](https://github.com)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Algorithm](#algorithm)
- [Database Schema](#database-schema)
- [Deployment](#deployment)
- [Documentation](#documentation)
- [Contributing](#contributing)

## 🎯 Overview

This system implements an evidence-based exercise recommendation algorithm for patients with knee osteoarthritis (OA). It combines subjective patient-reported outcomes (KOOS/WOMAC) with objective functional performance (30-second Sit-to-Stand test) and biomechanical assessment to provide personalized exercise prescriptions.

### Key Improvements from v1.0

**v1.0** (Legacy): Two-component system with QR codes, separate physiotherapist interface, and manual muscle strength assessments.

**v2.0** (Current): Streamlined single-workflow system with:
- Integrated patient assessment workflow (3 pages)
- Objective functional testing (STS normative benchmarking)
- Two-layer exercise ranking (position capability → exercise difficulty matching)
- Comprehensive biomechanical targeting (alignment, flexibility, core stability)
- Full bilingual support (English/Traditional Chinese)

## ✨ Features

### 🩺 Clinical Assessment

- **30-Question KOOS/WOMAC Questionnaire** - Validated knee function assessment
- **Sit-to-Stand (STS) Test** - Age/gender-normalized functional performance
- **Biomechanical Screening** - Knee alignment, trunk/hip stability assessment
- **Flexibility Testing** - Toe touch test for posterior chain flexibility

### 🎯 Exercise Recommendation Algorithm

- **Two-Layer Ranking System**
  - Layer 1: Position selection by functional capability
  - Layer 2: Exercise ranking by difficulty matching + biomechanical targeting
- **Conflict Resolution** - Conservative approach when objective/subjective measures disagree
- **Targeted Biomechanical Modifiers**
  - Alignment correction (valgus → hip abductors, varus → adductors)
  - Flexibility improvement (hamstrings/glute max targeting)
  - Core stability filtering (hard filter for instability)

### 🌐 User Experience

- **Bilingual Interface** - Seamless English/Traditional Chinese switching
- **Progressive Workflow** - 3-page patient journey with persistence
- **Position-Grouped Results** - Clear exercise tables by position with scoring breakdown
- **Color-Coded Indicators** - Visual status feedback (green=normal, red=abnormal)
- **Responsive Design** - Mobile-optimized for patient use

## 🛠 Tech Stack

| Component | Technology |
|-----------|-----------|
| **Frontend** | Vite + Vanilla JavaScript (ES6 modules) |
| **Backend** | Supabase (PostgreSQL + Auth + RLS) |
| **Styling** | CSS3 with responsive design |
| **Deployment** | Vercel |
| **Dependencies** | `@supabase/supabase-js`, `qrcode`, `html5-qrcode` |

## 🚀 Getting Started

### Prerequisites

- Node.js 16+
- Supabase account with database setup
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd physiotherapy-exercise-recommendation
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**

Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **Set up the database**

Run the migration scripts in order:
```bash
# Navigate to database/migrations
cd database/migrations

# Run schema creation
psql -f database-migration.sql

# Run STS assessments table
psql -f create-sts-assessments-table.sql

# Add quality of life improvements
psql -f add-quality-of-life-columns.sql
```

5. **Seed exercise data**
```bash
# Import exercises from CSV
# Use Supabase dashboard or CLI to import database/seeds/exercises.csv
```

6. **Run development server**
```bash
npm run dev
```

The application will be available at `http://localhost:5178`

### Build for Production

```bash
npm run build
npm run preview  # Preview production build locally
```

## 📁 Project Structure

```
physiotherapy-exercise-recommendation/
├── src/
│   ├── auth/                    # Authentication logic
│   ├── patient/                 # Patient-facing components
│   │   ├── calculations.js      # Score calculations
│   │   ├── questionnaire-data.js # Question definitions
│   │   └── translations.js      # Questionnaire translations
│   ├── questionnaire/           # Questionnaire page logic
│   │   └── questionnaire.js
│   ├── sts/                     # STS assessment page
│   │   ├── sts-assessment.js
│   │   └── sts-assessment-updated.js
│   ├── results/                 # Results & algorithm
│   │   ├── results.js           # Results page UI
│   │   ├── algorithm.js         # Core recommendation algorithm ⭐
│   │   └── algorithm.test.js    # Comprehensive test suite
│   └── shared/                  # Shared utilities
│       ├── supabase.js          # Database connection
│       ├── i18n.js              # Internationalization
│       ├── muscle-translations.js
│       └── storage.js
├── styles/
│   ├── auth.css                 # Authentication styles
│   ├── patient.css              # Questionnaire/STS styles
│   ├── results.css              # Results page styles
│   └── shared.css               # Global styles
├── database/
│   ├── migrations/              # SQL migration scripts
│   └── seeds/                   # Data seed files
│       └── exercises.csv        # 33 exercises with metadata
├── docs/                        # Documentation
│   ├── ALGORITHM_DOCUMENTATION.md  # Algorithm reference
│   ├── STS-ASSESSMENT.md        # STS test documentation
│   ├── Unified_WOMAC_KOOS_Form.md  # Questionnaire reference
│   └── questionnaire_translation_zh_TW.md
├── home.html                    # Authentication page
├── questionnaire.html           # Questionnaire page (Page 1)
├── sts-assessment.html          # STS assessment page (Page 2)
├── results.html                 # Results page (Page 3)
└── package.json
```

## 🧮 Algorithm

The recommendation algorithm uses a **two-layer ranking system** with biomechanical targeting:

### Layer 1: Position Ranking

Ranks exercise positions by functional capability based on questionnaire responses:

```javascript
positionMultiplier = (4 - avgQuestionnaireScore) / 4  // Higher = better capability
// Selects top 2 positions for exercise prescription
```

**Position Categories:**
- Double-leg standing
- Split stance standing
- Single-leg standing
- Quadruped (four-point kneeling)
- Lying (supine + side lying combined)

### Layer 2: Exercise Ranking

Within each selected position, ranks exercises by comprehensive scoring:

```javascript
difficultyScore = 1 / (1 + abs(exerciseDifficulty - preferredDifficulty) * 0.2)
alignmentModifier = 1.0 + (targetMuscleRecruitment / 5.0)  // 1.0-2.0x
flexibilityModifier = 1.0 + (targetMuscleRecruitment / 12.5)  // 1.0-1.4x

finalScore = difficultyScore × alignmentModifier × flexibilityModifier
```

### Enhanced Combined Score

Integrates objective performance with subjective symptoms:

```javascript
enhancedCombinedScore = (stsScore × 0.5) + (painScore × 0.25) + (symptomScore × 0.25)

// Conflict resolution: If objective/subjective differ by >0.5
if (abs(stsScore - subjectiveScore) > 0.5) {
    conservativeScore = min(stsScore, subjectiveScore)
    enhancedCombinedScore = (conservativeScore × 0.6) + (enhancedCombinedScore × 0.4)
}
```

### Biomechanical Modifiers

- **Knee Alignment**
  - Valgus (knock-knees) → Boost gluteus medius/minimus exercises
  - Varus (bow-legged) → Boost adductor exercises
- **Flexibility Deficit** → Boost hamstring/glute max exercises
- **Core Instability** → Hard filter to core ipsilateral exercises only

For detailed algorithm documentation, see [docs/ALGORITHM_DOCUMENTATION.md](docs/ALGORITHM_DOCUMENTATION.md).

## 🗄 Database Schema

### Tables

#### `users`
```sql
- id (SERIAL PRIMARY KEY)
- username (VARCHAR UNIQUE)
- created_at (TIMESTAMP)
```

#### `questionnaire_responses`
```sql
- id (SERIAL PRIMARY KEY)
- user_id (INTEGER FK → users)
- username (VARCHAR FK → users)
- f1...f17 (INTEGER 1-4) -- Function questions
- p1...p9 (INTEGER 1-4)  -- Pain questions
- sp1...sp5 (INTEGER 1-4) -- Sport questions
- st2 (INTEGER 1-4)       -- Stiffness question
- toe_touch_test (VARCHAR) -- 'can' or 'cannot'
- created_at (TIMESTAMP)
```

#### `sts_assessments`
```sql
- id (SERIAL PRIMARY KEY)
- user_id (INTEGER FK → users)
- username (VARCHAR FK → users)
- repetition_count (INTEGER)
- age (INTEGER 18-120)
- gender (VARCHAR) -- 'male' or 'female'
- knee_alignment (VARCHAR) -- 'normal', 'valgus', 'varus'
- trunk_sway (VARCHAR) -- 'present', 'absent'
- hip_sway (VARCHAR) -- 'present', 'absent'
- created_at (TIMESTAMP)
```

#### `exercises`
```sql
- id (SERIAL PRIMARY KEY)
- exercise_name (TEXT)
- exercise_name_ch (TEXT) -- Chinese name
- position_sl_stand (BOOLEAN)
- position_split_stand (BOOLEAN)
- position_dl_stand (BOOLEAN)
- position_quadruped (BOOLEAN)
- position_supine_lying (BOOLEAN)
- position_side_lying (BOOLEAN)
- muscle_quad (INTEGER 0-5)
- muscle_hamstring (INTEGER 0-5)
- muscle_glute_max (INTEGER 0-5)
- muscle_hip_flexors (INTEGER 0-5)
- muscle_glute_med_min (INTEGER 0-5)
- muscle_adductors (INTEGER 0-5)
- core_ipsi (BOOLEAN)
- core_contra (BOOLEAN)
- difficulty_level (INTEGER 1-10)
```

## 🌍 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel dashboard
3. Configure environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy

**URLs:**
- Home/Auth: `https://your-app.vercel.app/`
- Questionnaire: `https://your-app.vercel.app/questionnaire.html`
- STS Assessment: `https://your-app.vercel.app/sts-assessment.html`
- Results: `https://your-app.vercel.app/results.html`

### Supabase Setup

1. Create new project in Supabase dashboard
2. Run migration scripts in SQL editor
3. Import exercise data via CSV import
4. Configure Row Level Security (RLS) policies
5. Copy project URL and anon key to `.env`

## 📚 Documentation

- **[Algorithm Documentation](docs/ALGORITHM_DOCUMENTATION.md)** - Complete algorithm flow, formulas, and clinical scenarios
- **[STS Assessment Guide](docs/STS-ASSESSMENT.md)** - STS test protocol and normative data
- **[KOOS/WOMAC Reference](docs/Unified_WOMAC_KOOS_Form.md)** - Questionnaire structure
- **[Chinese Translations](docs/questionnaire_translation_zh_TW.md)** - Translation reference

## 🧪 Testing

Run the comprehensive algorithm test suite:

```bash
node src/results/algorithm.test.js
```

**Test Coverage:**
- Position multiplier calculation
- STS score normalization
- Enhanced combined score with conflict resolution
- Difficulty modifier (high/moderate/low capability)
- Core stability filtering
- Alignment modifiers (valgus/varus)
- Flexibility modifiers
- Layer 1 position selection
- Layer 2 exercise ranking
- Complete algorithm integration (4 clinical scenarios)
- Edge cases and boundary conditions

## 🤝 Contributing

This project was developed for physiotherapy research and clinical application. Contributions are welcome for:
- Algorithm refinement based on clinical evidence
- Additional exercise content
- UI/UX improvements
- Test coverage expansion
- Documentation improvements

## 📄 License

This project is for demonstration and research purposes. See LICENSE file for details.

## 🙏 Acknowledgments

- KOOS/WOMAC questionnaire from standardized assessment tools
- STS normative data from clinical research literature
- Exercise database from physiotherapy research
- Built with Claude Code assistance

## 📞 Support

For questions, issues, or feature requests:
- Open an issue on GitHub
- Contact the development team
- Review documentation in `/docs`

---

**Version 2.0.0** - Complete rewrite with streamlined workflow and enhanced biomechanical targeting
