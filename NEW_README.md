# Physiotherapy Exercise Recommendation System

A full-stack application that provides personalized knee exercise recommendations based on clinical assessments (KOOS/WOMAC questionnaire and 30-second Sit-to-Stand test). Features rule-based algorithm and dual AI-enhanced (LLM) recommendation options with comprehensive bilingual dashboard.

## Key Features

- **Bilingual Support** — Full English and Traditional Chinese (繁體中文) interface
- **Comprehensive Assessment Dashboard** — Visual presentation of patient demographics, STS performance, and KOOS questionnaire results with color-coded health indicators
- **Dual AI Recommendation Systems**:
  - **OpenAI (GPT-4o-mini)** — Single-LLM clinical reasoning enhancement
  - **DeepSeek** — Two-LLM safety-verified architecture with biomechanical targeting
- **Rule-Based Algorithm** — Fallback recommendation engine based on clinical guidelines

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│   Frontend   │────▶│   Backend    │────▶│  PostgreSQL  │
│  React/Vite  │     │   FastAPI    │     │   Database   │
│  (port 3000) │     │  (port 8000) │     │  (port 5432) │
└─────────────┘     └──────────────┘     └──────────────┘
                          │
                          ├──────▶ OpenAI API (optional)
                          │
                          └──────▶ DeepSeek API (optional)
```

- **Frontend** — React 18, React Router, Axios, Vite, i18n, served via Nginx in production
- **Backend** — Python 3.12, FastAPI, SQLAlchemy, LangChain, LangChain-OpenAI, LangChain-DeepSeek
- **Database** — PostgreSQL 16

## Quick Start with Docker

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/) installed

### 1. Clone & configure environment

```bash
git clone <repository-url>
cd physiotherapy-exercise-recommendation

# Copy the example env file and edit as needed
cp .env.example .env
```

Edit `.env` with your settings:

| Variable | Description | Default |
|---|---|---|
| `OPENAI_API_KEY` | OpenAI API key for GPT-4o-mini recommendations (optional) | _(empty)_ |
| `DEEPSEEK_API_KEY` | DeepSeek API key for two-LLM safety system (optional) | _(empty)_ |
| `PHYSIO_PASSCODE` | Access passcode for patients | `physio2024` |

**Note:** At least one AI API key is recommended to enable LLM-enhanced recommendations. The system works without API keys using the rule-based algorithm only.

### 2. Build & run

```bash
docker compose up --build
```

This will:
1. Start a **PostgreSQL** database
2. Start the **FastAPI backend** (auto-creates tables and seeds exercise data)
3. Build and start the **React frontend**

### 3. Access the application

| Service | URL |
|---|---|
| Frontend | [http://localhost:3000](http://localhost:3000) |
| Backend API | [http://localhost:8000](http://localhost:8000) |
| API Docs (Swagger) | [http://localhost:8000/docs](http://localhost:8000/docs) |

**First-time usage:**
1. Navigate to [http://localhost:3000](http://localhost:3000)
2. Enter the passcode (default: `physio2024` from `.env`)
3. Enter a username to create/login
4. Complete the assessment flow: Demographics → Questionnaire → STS Assessment → Results
5. On the Results Dashboard, optionally click "Get AI Recommendations" to generate LLM-enhanced exercise plans

### 4. Stop

```bash
docker compose down
```

To also remove the database volume (all data):

```bash
docker compose down -v
```

## Local Development (without Docker)

### Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # macOS/Linux
# venv\Scripts\activate   # Windows

# Install dependencies
pip install -r requirements.txt

# Set environment variables
export DATABASE_URL="postgresql://user:password@localhost:5432/physio_db"
export PHYSIO_PASSCODE="physio2024"
export OPENAI_API_KEY="sk-..."  # optional
export DEEPSEEK_API_KEY="sk-..."  # optional

# Run the server
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Run dev server (proxies API calls to backend:8000)
npm run dev
```

The Vite dev server runs on `http://localhost:5173` and proxies `/api/*` requests to the backend.

## Project Structure

```
├── docker-compose.yml          # Docker orchestration
├── .env.example                # Environment variable template
│
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── start.sh                # Startup script (init DB + seed + run)
│   └── app/
│       ├── main.py             # FastAPI application entry
│       ├── config.py           # Pydantic settings
│       ├── database.py         # SQLAlchemy engine & session
│       ├── models.py           # SQLAlchemy ORM models
│       ├── schemas.py          # Pydantic request/response schemas
│       ├── init_db.py          # Database table creation
│       ├── seed.py             # Seed exercises from CSV
│       ├── routers/
│       │   ├── users.py
│       │   ├── demographics.py
│       │   ├── questionnaire.py
│       │   ├── sts_assessment.py
│       │   ├── exercises.py
│       │   └── recommendations.py
│       └── services/
│           ├── algorithm.py           # Rule-based recommendation engine
│           ├── llm_recommendation.py  # OpenAI GPT-4o-mini integration
│           └── llm_deepseek/          # DeepSeek two-LLM system
│               ├── deepseek_recommendation_service.py  # Main orchestrator
│               ├── data_transformer.py                  # Patient profile structuring
│               ├── llm1_recommendation.py               # Exercise recommendation agent
│               └── llm2_safety_verification.py         # Safety verification agent
│
├── frontend/
│   ├── Dockerfile
│   ├── nginx.conf              # Nginx config with API proxy
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── services/api.js     # Axios API client
│       ├── context/
│       │   ├── AuthContext.jsx
│       │   └── LanguageContext.jsx
│       ├── i18n/translations.js
│       ├── pages/
│       │   ├── HomePage.jsx
│       │   ├── DemographicsPage.jsx
│       │   ├── QuestionnairePage.jsx
│       │   ├── STSAssessmentPage.jsx
│       │   └── ResultsPage.jsx
│       ├── components/Header.jsx
│       └── styles/shared.css
│
└── database/
    ├── schema/                 # SQL migrations (reference)
    └── seeds/
        ├── exercises.csv       # Exercise seed data (denormalized format)
        ├── merge_supabase_csvs.py  # Script to merge normalized CSVs
        └── supabase/           # Normalized exercise data from Supabase
            ├── exercises.csv
            ├── exercise_positions.csv
            └── exercise_muscles.csv
```

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/users/verify-passcode` | Verify access passcode |
| POST | `/api/users/` | Create or login user |
| GET | `/api/users/{username}` | Get user info |
| GET | `/api/users/{username}/progress` | Get assessment progress |
| POST | `/api/demographics/` | Upsert patient demographics |
| GET | `/api/demographics/{username}` | Get demographics |
| POST | `/api/questionnaire/` | Upsert questionnaire responses |
| GET | `/api/questionnaire/{username}` | Get questionnaire |
| POST | `/api/sts-assessment/` | Upsert STS assessment |
| GET | `/api/sts-assessment/{username}` | Get STS assessment |
| GET | `/api/exercises/` | List all exercises |
| POST | `/api/recommendations/algorithm` | Get algorithm-based recommendations |
| POST | `/api/recommendations/llm` | Get OpenAI GPT-4o-mini enhanced recommendations |
| POST | `/api/recommendations/deepseek` | Get DeepSeek two-LLM safety-verified recommendations |

## Algorithm

The recommendation engine uses a **two-layer ranking system**:

1. **Position Selection** — Evaluates patient's functional capability for each exercise position (standing, quadruped, supine, side-lying, etc.) using questionnaire responses as multipliers
2. **Exercise Ranking** — Within selected positions, ranks exercises by:
   - Difficulty matching (patient capability vs exercise difficulty)
   - Alignment modifier (based on STS knee alignment observation)
   - Flexibility modifier (based on toe-touch test)
   - Core stability filter (based on trunk/hip sway)

## AI-Enhanced Recommendations

The system offers two AI-powered recommendation engines, each with distinct advantages:

### OpenAI (GPT-4o-mini) - Single LLM Approach

When an OpenAI API key is configured:
- Uses GPT-4o-mini via LangChain for clinical reasoning enhancement
- Validates algorithm recommendations against evidence-based guidelines
- Provides detailed exercise-specific rationale
- Adjusts exercise selection based on holistic patient profile
- **Best for:** Quick, clinically-reasoned recommendations with natural language explanations

### DeepSeek - Two-LLM Safety Architecture

When a DeepSeek API key is configured:
- **LLM #1 (Recommendation Agent):** Analyzes patient biomechanics and generates exercise candidates
- **LLM #2 (Safety Verification Agent):** Independently reviews recommendations for safety concerns and contraindications
- Provides biomechanical target identification and safety rationale
- Implements separation of concerns for enhanced clinical safety
- **Best for:** Maximum safety assurance with dual-layer verification

Both systems fall back gracefully to the rule-based algorithm if API keys are not configured.

## Exercise Data Setup

The backend seeds exercise data from `database/seeds/exercises.csv` on startup. This file is in a denormalized format required by the algorithm.

### Using Supabase CSV Data

If you have normalized exercise data from Supabase (in `database/seeds/supabase/`), use the merge script to convert it:

```bash
cd database/seeds
python merge_supabase_csvs.py
```

This will generate `exercises.csv` from:
- `supabase/exercises.csv` (base exercise data)
- `supabase/exercise_positions.csv` (position relationships)
- `supabase/exercise_muscles.csv` (muscle recruitment values)

Then restart Docker to load the new data:

```bash
docker compose down
docker compose up --build
```

## Bilingual Support

The application provides comprehensive bilingual support:
- **English** (default)
- **Traditional Chinese (繁體中文)**

**Translated Components:**
- All UI elements, navigation, and labels
- Patient demographics and assessment forms
- KOOS questionnaire sections and questions
- Results dashboard with color-coded health indicators
- AI recommendation titles and interface elements

**Note:** LLM-generated recommendation content (clinical reasoning, exercise rationale) is generated in the selected language by passing the language parameter to the AI models.

Toggle between languages using the language button in the header.

## Results Dashboard

The Results page displays a comprehensive assessment dashboard with four main sections:

### 1. Patient Demographics
- Age, Gender, Height, Weight
- **BMI with color-coded health category** (Underweight/Normal/Overweight/Obese)

### 2. STS Assessment Results
- **30-second repetition count with performance rating** (Excellent/Good/Fair/Poor) based on HK normative data
- Knee alignment (Normal/Valgus/Varus)
- Trunk and hip sway observations

### 3. KOOS Questionnaire Scores
- Six categories: Symptoms, Stiffness, Pain, Function (ADL), Function (Sports), Quality of Life
- **Color-coded status indicators:** Green (≥70), Orange (40-69), Red (<40)
- Scores normalized to 0-100 scale

### 4. AI-Enhanced Recommendations
- Choose between OpenAI or DeepSeek recommendation engines
- Displays biomechanical targets, clinical reasoning, and personalized exercise prescription
- Loading indicator with estimated wait time (1-2 minutes for DeepSeek)

All dashboard cards use **dynamic color coding** to provide immediate visual feedback on health status.
