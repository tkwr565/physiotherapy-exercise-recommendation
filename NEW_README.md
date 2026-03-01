# Physiotherapy Exercise Recommendation System

A full-stack application that provides personalized knee exercise recommendations based on clinical assessments (KOOS/WOMAC questionnaire and 30-second Sit-to-Stand test). Features both rule-based algorithm and AI-enhanced (LLM) recommendations.

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│   Frontend   │────▶│   Backend    │────▶│  PostgreSQL  │
│  React/Vite  │     │   FastAPI    │     │   Database   │
│  (port 3000) │     │  (port 8000) │     │  (port 5432) │
└─────────────┘     └──────────────┘     └──────────────┘
                          │
                          ▼
                    ┌──────────────┐
                    │   OpenAI     │
                    │  (optional)  │
                    └──────────────┘
```

- **Frontend** — React 18, React Router, Axios, Vite, served via Nginx in production
- **Backend** — Python 3.12, FastAPI, SQLAlchemy, LangChain, LangChain-OpenAI
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
| `OPENAI_API_KEY` | OpenAI API key for LLM recommendations (optional) | _(empty — falls back to algorithm)_ |
| `PHYSIO_PASSCODE` | Access passcode for patients | `physio2024` |

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
│           ├── algorithm.py    # Rule-based recommendation engine
│           └── llm_recommendation.py  # LangChain LLM enhancement
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
        └── exercises.csv       # Exercise seed data
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
| POST | `/api/recommendations/llm` | Get LLM-enhanced recommendations |

## Algorithm

The recommendation engine uses a **two-layer ranking system**:

1. **Position Selection** — Evaluates patient's functional capability for each exercise position (standing, quadruped, supine, side-lying, etc.) using questionnaire responses as multipliers
2. **Exercise Ranking** — Within selected positions, ranks exercises by:
   - Difficulty matching (patient capability vs exercise difficulty)
   - Alignment modifier (based on STS knee alignment observation)
   - Flexibility modifier (based on toe-touch test)
   - Core stability filter (based on trunk/hip sway)

## LLM Enhancement

When an OpenAI API key is provided, the system enhances recommendations using GPT-4o-mini via LangChain:
- Validates algorithm recommendations against clinical reasoning
- Provides exercise-specific rationale
- Can adjust ordering based on holistic patient profile
- Falls back gracefully to algorithm-only results if API key is missing

## Bilingual Support

The application supports:
- **English** (default)
- **Traditional Chinese (繁體中文)**

Toggle between languages using the language button in the header.
