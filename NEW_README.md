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
                    HTTPS (Port 443)
                          │
                    ┌─────▼─────┐
                    │   Nginx   │  (SSL Termination)
                    │  (Alpine) │
                    └─────┬─────┘
                          │
         ┌────────────────┴────────────────┐
         │                                 │
    ┌────▼─────┐                    ┌─────▼──────┐
    │ Frontend │                    │  Backend   │───┐
    │  React   │                    │  FastAPI   │   │
    │  (Vite)  │                    │ (port 8000)│   │
    └──────────┘                    └─────┬──────┘   │
                                          │          │
                                    ┌─────▼──────┐   │
                                    │ PostgreSQL │   │
                                    │  Database  │   │
                                    │ (port 5432)│   │
                                    └────────────┘   │
                                                     │
                    ┌────────────────────────────────┘
                    │
         ┌──────────┴───────────┐
         │                      │
    ┌────▼─────┐         ┌─────▼───────┐
    │  OpenAI  │         │  DeepSeek   │
    │   API    │         │     API     │
    │(optional)│         │  (optional) │
    └──────────┘         └─────────────┘
```

- **Nginx** — SSL termination, reverse proxy, serves frontend (Alpine Linux)
- **Frontend** — React 18, React Router, Axios, Vite, i18n, MediaPipe Pose (client-side)
- **Backend** — Python 3.12, FastAPI, SQLAlchemy, LangChain, LangChain-OpenAI, LangChain-DeepSeek
- **Database** — PostgreSQL 16

### STS Video Assessment Feature

The system includes a complete video-based assessment workflow for the 30-second Sit-to-Stand test with dual analysis pipeline:

**Frontend - Real-time Posture Validation (MediaPipe Pose Lite)**
- **Client-side pose detection** — Runs in browser using MediaPipe Pose Lite (GPU-accelerated)
- **Real-time validation** — Validates stance width, foot rotation, and body placement before recording
- **Visual guidance** — Skeleton overlay and validation panel guide users to correct positioning
- **Auto-start countdown** — Recording begins automatically when posture is valid (3-2-1 countdown)
- **30-second recording** — Records video with real-time countdown display
- **Preview & upload** — Users can review their recording before uploading for analysis
- **HTTPS required** — Camera access requires secure connection (handled by Nginx SSL)
- **Fully bilingual** — All on-screen annotations and messages in English and Traditional Chinese

**Backend - Video Analysis (MediaPipe Pose Heavy)**
- **Server-side biomechanical analysis** — Uses MediaPipe Pose Landmarker Heavy model
- **Complete STS analysis pipeline** — Preprocessing → Global calibration → Repetition segmentation → Biomechanical metrics
- **Clinical metrics extraction**:
  - FPPA (Frontal Plane Projection Angle) for knee valgus/varus detection
  - Trunk sway standard deviation (lateral trunk angle variability)
  - Hip sway standard deviation (lateral hip displacement variability)
  - Repetition count (total and clinically valid reps)
- **Automatic result mapping** — Maps video analysis to database format and saves to STS assessment table
- **One Euro Filter** — Adaptive low-pass filtering for smooth keypoint tracking

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
1. Start a **PostgreSQL** database (port 5432)
2. Start the **FastAPI backend** (port 8000, auto-creates tables and seeds exercise data)
3. Build and start the **React frontend** (internal port 80)
4. Start **Nginx reverse proxy** with SSL termination (ports 80→443, 443)

### 3. Access the application

#### Local Development (Desktop Browser)

| Service | URL |
|---|---|
| **Frontend (HTTPS)** | [https://localhost](https://localhost) |
| Frontend (HTTP) | [http://localhost](http://localhost) (auto-redirects to HTTPS) |
| Backend API | [http://localhost:8000](http://localhost:8000) |
| API Docs (Swagger) | [http://localhost:8000/docs](http://localhost:8000/docs) |

#### Mobile Testing (Camera Features)

For testing camera features on mobile devices:

1. Find your local IP address:
   ```bash
   # Windows
   ipconfig
   # Look for "IPv4 Address" under your network adapter (e.g., 192.168.1.118)

   # macOS/Linux
   ifconfig | grep "inet "
   ```

2. Access from mobile device: **`https://YOUR_LOCAL_IP`** (e.g., `https://192.168.1.118`)

3. Accept the security warning:
   - Chrome: "Your connection is not private" → Advanced → Proceed
   - Safari: "This Connection Is Not Private" → Show Details → Visit Website
   - The self-signed certificate is safe for local development

**First-time usage:**
1. Navigate to `https://localhost` (or `https://YOUR_LOCAL_IP` on mobile)
2. Accept the browser security warning for the self-signed certificate
3. Enter the passcode (default: `physio2024` from `.env`)
4. Enter a username to create/login
5. Complete the assessment flow: Demographics → Questionnaire → **STS Assessment** → Results
   - **Manual mode**: Enter results manually (traditional form)
   - **Video mode**: Use camera for real-time posture validation (requires HTTPS)
6. On the Results Dashboard, optionally click "Get AI Recommendations" to generate LLM-enhanced exercise plans

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
├── docker-compose.yml          # Docker orchestration with Nginx
├── .env.example                # Environment variable template
├── .gitignore                  # Git ignore rules (protects .env and SSL keys)
│
├── nginx/                      # SSL termination and reverse proxy
│   ├── nginx.conf              # Nginx configuration
│   └── ssl/
│       ├── fullchain.pem       # Public SSL certificate (safe to commit)
│       └── privkey.pem         # Private SSL key (GIT-IGNORED)
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
│       │   ├── recommendations.py
│       │   └── video_analysis.py      # Video upload and analysis endpoint
│       ├── services/
│       │   ├── algorithm.py           # Rule-based recommendation engine
│       │   ├── llm_recommendation.py  # OpenAI GPT-4o-mini integration
│       │   └── llm_deepseek/          # DeepSeek two-LLM system
│       │       ├── deepseek_recommendation_service.py  # Main orchestrator
│       │       ├── data_transformer.py                  # Patient profile structuring
│       │       ├── llm1_recommendation.py               # Exercise recommendation agent
│       │       └── llm2_safety_verification.py         # Safety verification agent
│       └── video_analysis/            # Video analysis pipeline
│           ├── pose_engine.py         # MediaPipe adapter and body keypoint conversion
│           ├── video_processor.py     # Frame processing and model initialization
│           ├── repetition_segmentation.py  # STS repetition detection
│           ├── biomechanics_analyzer.py    # FPPA, sway, and clinical metrics
│           └── one_euro_filter.py     # Keypoint smoothing filter
│
├── frontend/
│   ├── Dockerfile
│   ├── nginx.conf              # Production Nginx config (in container)
│   ├── package.json
│   ├── vite.config.js
│   ├── public/
│   │   └── models/
│   │       └── pose_landmarker_lite.task  # MediaPipe Pose model (5.8 MB)
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── services/api.js     # Axios API client
│       ├── context/
│       │   ├── AuthContext.jsx
│       │   └── LanguageContext.jsx
│       ├── i18n/translations.js
│       ├── lib/                # MediaPipe utilities
│       │   ├── mediapipeAdapter.js   # Landmark to body keypoints converter
│       │   └── validators.js         # Posture validation logic
│       ├── hooks/              # React hooks for video features
│       │   ├── useCamera.js          # Camera stream management
│       │   ├── usePoseLandmarker.js  # MediaPipe pose detection
│       │   └── useRecordingFlow.js   # Video recording state machine
│       ├── pages/
│       │   ├── HomePage.jsx
│       │   ├── DemographicsPage.jsx
│       │   ├── QuestionnairePage.jsx
│       │   ├── STSAssessmentPage.jsx  # Mode selector (manual/video)
│       │   └── ResultsPage.jsx
│       ├── components/
│       │   ├── Header.jsx
│       │   └── sts-video/      # Video assessment UI components
│       │       ├── VideoSTSAssessment.jsx  # Main video component
│       │       ├── CameraView.jsx
│       │       ├── LoadingScreen.jsx
│       │       ├── CountdownOverlay.jsx
│       │       ├── RecordingBar.jsx
│       │       ├── PreviewModal.jsx
│       │       ├── UploadingScreen.jsx
│       │       ├── ResultsScreen.jsx
│       │       └── ErrorScreen.jsx
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
| POST | `/api/video-analysis/analyze-sts-video` | Analyze STS video and return biomechanical metrics |
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

## Production Deployment on VM

For production deployment on a Virtual Machine with a domain name:

### 1. SSL Certificate Setup

Replace the self-signed certificate with a real SSL certificate from Let's Encrypt:

```bash
# On your VM, install certbot
sudo apt update
sudo apt install certbot

# Stop the application
docker compose down

# Generate SSL certificate (replace yourdomain.com)
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# Copy certificates to nginx/ssl/
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem nginx/ssl/
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem nginx/ssl/

# Set proper permissions
sudo chown $USER:$USER nginx/ssl/*.pem
```

### 2. Update Configuration

**Update `nginx/nginx.conf`** (if needed):
- Change `server_name _;` to `server_name yourdomain.com www.yourdomain.com;`

**Update `docker-compose.yml`**:
```yaml
backend:
  environment:
    CORS_ORIGINS: https://yourdomain.com,https://www.yourdomain.com
```

**Update `.env`**:
```bash
# Production values
PHYSIO_PASSCODE=your_secure_passcode_here
POSTGRES_PASSWORD=secure_production_password
```

### 3. Deploy

```bash
docker compose up -d --build
```

### 4. SSL Certificate Auto-Renewal

Set up automatic certificate renewal:

```bash
# Create renewal script
cat > ~/renew-ssl.sh << 'EOF'
#!/bin/bash
docker compose -f /path/to/docker-compose.yml down
certbot renew --quiet
cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem /path/to/nginx/ssl/
cp /etc/letsencrypt/live/yourdomain.com/privkey.pem /path/to/nginx/ssl/
docker compose -f /path/to/docker-compose.yml up -d
EOF

chmod +x ~/renew-ssl.sh

# Add to crontab (runs at 2 AM on the 1st of each month)
(crontab -l 2>/dev/null; echo "0 2 1 * * ~/renew-ssl.sh") | crontab -
```

### 5. Firewall Configuration

```bash
# Allow HTTPS and HTTP
sudo ufw allow 443/tcp
sudo ufw allow 80/tcp
sudo ufw enable
```

### Production Security Checklist

- ✅ Use real SSL certificates (Let's Encrypt)
- ✅ Change default passwords in `.env` and `docker-compose.yml`
- ✅ Set strong `PHYSIO_PASSCODE`
- ✅ Configure firewall (allow only 80, 443, and SSH)
- ✅ Enable automatic SSL renewal
- ✅ Regular database backups (`docker compose exec db pg_dump`)
- ✅ Monitor logs: `docker compose logs -f`
- ✅ Keep Docker images updated: `docker compose pull && docker compose up -d`

## SSL Certificate Management

### Development (Self-Signed Certificate)

The repository includes a self-signed certificate valid for local development:
- **Location**: `nginx/ssl/fullchain.pem` (public) and `nginx/ssl/privkey.pem` (private, git-ignored)
- **Valid for**: Local IP addresses (e.g., 192.168.1.118)
- **Browser warning**: Accept once per device
- **Security**: Safe for local development, NOT for production

### Production (Let's Encrypt Certificate)

For production with a domain name, use Let's Encrypt for free, trusted SSL certificates:
- **Validity**: 90 days (auto-renewable)
- **Cost**: Free
- **Browser trust**: All browsers trust Let's Encrypt
- **Setup time**: ~5 minutes

### Regenerating Development Certificate

If you need to regenerate the development certificate (e.g., for a different IP):

```bash
cd nginx/ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout privkey.pem -out fullchain.pem \
  -subj "//C=US\ST=State\L=City\O=PhysioAIign\CN=YOUR_LOCAL_IP"

# Example for IP 192.168.1.118:
# ... -subj "//C=US\ST=State\L=City\O=PhysioAIign\CN=192.168.1.118"
```
