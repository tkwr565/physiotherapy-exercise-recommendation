# DeepSeek LLM Integration Guide

This guide explains how the DeepSeek two-LLM architecture has been integrated into the Docker local demo.

## 🎯 Overview

The DeepSeek integration adds a **two-LLM sequential architecture** for exercise recommendations:

1. **LLM #1 (Exercise Recommendation Agent)**: Analyzes patient data and recommends 4 exercises
2. **LLM #2 (Safety Verification Agent)**: Reviews recommendations and applies safety constraints

This system runs **in addition to** the existing OpenAI LLM endpoint, giving you three recommendation options:
- `/api/recommendations/algorithm` - Rule-based algorithm only
- `/api/recommendations/llm` - OpenAI GPT-4o-mini enhancement
- `/api/recommendations/deepseek` - DeepSeek two-LLM system (NEW)

---

## 📁 What Was Added

### Backend Changes

#### New Service Module: `backend/app/services/llm_deepseek/`
```
llm_deepseek/
├── __init__.py
├── deepseek_recommendation_service.py  # Main orchestrator
├── biomechanical_analyzer.py           # Rule-based target identification
├── data_transformer.py                 # PostgreSQL data → LLM format
├── llm1_recommendation.py              # Exercise Recommendation Agent
├── llm2_safety_verification.py         # Safety Verification Agent
└── prompts/
    ├── llm1_system_prompt.md           # LLM #1 system prompt
    └── llm2_system_prompt.md           # LLM #2 system prompt
```

#### Updated Files
- `backend/requirements.txt` - Added `langchain-deepseek==0.1.5`
- `backend/app/schemas.py` - Added `DeepSeekRecommendationRequest` and `DeepSeekRecommendationResponse`
- `backend/app/routers/recommendations.py` - Added `/api/recommendations/deepseek` endpoint

### Frontend Changes

- `frontend/src/services/api.js` - Added `getDeepSeekRecommendations()` function
- `frontend/src/pages/ResultsPage.jsx` - Added DeepSeek section with rich UI:
  - Biomechanical targets display
  - Patient capability assessment
  - Safety review summary
  - Final prescription with modifications

### Configuration Changes

- `.env.example` - Added `DEEPSEEK_API_KEY` documentation
- `docker-compose.yml` - Added `DEEPSEEK_API_KEY` environment variable to backend service

---

## 🚀 How to Use

### 1. Get DeepSeek API Key

1. Visit [DeepSeek Platform](https://platform.deepseek.com/)
2. Sign up and get your API key
3. Copy the key (starts with `sk-...`)

### 2. Configure Environment Variables

Create or update `.env` file in the project root:

```bash
# DeepSeek API Key for two-LLM exercise recommendations
DEEPSEEK_API_KEY=your_deepseek_api_key_here

# Optional: OpenAI API Key for comparison
OPENAI_API_KEY=your_openai_key_here

# Passcode for patient access
PHYSIO_PASSCODE=physio2024
```

### 3. Start Docker Services

```bash
# Build and start all services
docker compose up --build

# Or in detached mode
docker compose up --build -d
```

This will:
1. Start PostgreSQL database (port 5432)
2. Start FastAPI backend (port 8000)
3. Start React frontend (port 3000)

### 4. Access the Application

1. Open browser: [http://localhost:3000](http://localhost:3000)
2. Enter passcode: `physio2024`
3. Create/login with a username
4. Complete the assessment flow:
   - Demographics
   - KOOS/WOMAC Questionnaire
   - STS Assessment
5. View results page
6. Click **"Get DeepSeek AI Recommendations"** button

---

## 🔍 Testing the Integration

### Test Scenario 1: Basic Workflow

1. Create new patient account
2. Fill demographics (e.g., Age: 65, Gender: Female)
3. Complete questionnaire with moderate pain/function scores
4. Complete STS assessment:
   - Repetitions: 10
   - Knee alignment: Valgus
   - Trunk sway: Present
   - Hip sway: Absent
5. View results and click DeepSeek button
6. Expected output:
   - Biomechanical targets showing valgus alignment + core instability
   - Patient assessment with recommended positions
   - Safety review for all 3 constraints
   - 4 exercises with clinical rationale

### Test Scenario 2: Missing API Key

1. **Do not** set `DEEPSEEK_API_KEY` in `.env`
2. Complete patient assessment
3. Click DeepSeek button
4. Expected: Error message "DEEPSEEK_API_KEY not found in environment variables"

### Test Scenario 3: Compare Recommendations

1. Complete assessment for same patient
2. View all three recommendation types:
   - Algorithm (rule-based)
   - OpenAI LLM (if API key provided)
   - DeepSeek two-LLM
3. Compare outputs for clinical appropriateness

---

## 📊 API Endpoint Documentation

### POST `/api/recommendations/deepseek`

**Request:**
```json
{
  "username": "patient123",
  "language": "en"  // "en" or "zh"
}
```

**Response:**
```json
{
  "biomechanical_targets": [
    {
      "issue": "Dynamic knee instability (Valgus alignment - knock-knees)",
      "strategy": "Prioritize exercises with core_contra=true and high glute_med_min...",
      "examples": ["Side lying clamshell", "hip abduction", "side plank variations"]
    }
  ],
  "patient_assessment": {
    "capability_summary": "Patient shows moderate functional capacity...",
    "recommended_positions": ["supine_lying", "DL_stand"],
    "difficulty_range": "2-4"
  },
  "llm1_recommendations": [
    {
      "exercise_id": 5,
      "exercise_name": "Side Lying Hip Abduction",
      "exercise_name_ch": "側臥髖外展",
      "positions": ["side_lying"],
      "difficulty": 2,
      "muscle_targets": {
        "primary": ["glute_med_min:5"],
        "secondary": [],
        "stabiliser": ["core_ipsi:true"]
      },
      "reasoning": "Targets valgus alignment with appropriate difficulty..."
    }
    // ... 3 more exercises
  ],
  "safety_review": {
    "weight_bearing_check": {
      "objective_data": {
        "sts_benchmark_performance": "Below Average",
        "trunk_sway": "present",
        "hip_sway": "absent"
      },
      "risk_level": "moderate",
      "reasoning": "STS performance below average with trunk sway...",
      "verdict": "moderate_risk"
    },
    "kneeling_check": {...},
    "core_stability_check": {...}
  },
  "exercise_decisions": [
    {
      "exercise_id": 5,
      "exercise_name": "Side Lying Hip Abduction",
      "safety_constraints_triggered": ["core_stability"],
      "decision": "APPROVED WITH MODIFICATIONS",
      "modifications": [
        "Start with 2 sets of 8 reps",
        "Focus on controlled movement"
      ],
      "reasoning": "Core instability noted, starting conservatively",
      "replacement_suggestion": ""
    }
    // ... 3 more decisions
  ],
  "final_prescription": [
    {
      "exercise_id": 5,
      "exercise_name": "Side Lying Hip Abduction",
      "exercise_name_ch": "側臥髖外展",
      "positions": ["side_lying"],
      "difficulty": 2,
      "modifications": ["Start with 2 sets of 8 reps", "Focus on controlled movement"],
      "clinical_rationale": "Targets valgus knee alignment and core stability..."
    }
    // ... 3 more exercises
  ]
}
```

**Error Responses:**

- `400 Bad Request`: Missing patient data (demographics/questionnaire/STS)
- `400 Bad Request`: Missing DEEPSEEK_API_KEY
- `404 Not Found`: User not found
- `500 Internal Server Error`: LLM processing error

---

## 🔧 Troubleshooting

### Issue: "DEEPSEEK_API_KEY not found in environment variables"

**Solution:**
1. Ensure `.env` file exists in project root
2. Add `DEEPSEEK_API_KEY=your_key_here`
3. Restart Docker services: `docker compose down && docker compose up --build`

### Issue: Docker container fails to start

**Solution:**
1. Check logs: `docker compose logs backend`
2. Ensure `langchain-deepseek` is in `requirements.txt`
3. Rebuild: `docker compose build --no-cache backend`

### Issue: Frontend shows "Failed to get DeepSeek AI recommendations"

**Solution:**
1. Check backend logs: `docker compose logs backend`
2. Verify API key is valid
3. Check network tab in browser DevTools for error details
4. Ensure patient has completed all assessment steps

### Issue: LLM returns invalid JSON

**Solution:**
1. This is rare with temperature=0, but can happen
2. Check backend logs for detailed error
3. Try again (LLM may have had a temporary issue)
4. If persistent, check if DeepSeek API is having issues

### Issue: Import error for `langchain_deepseek`

**Solution:**
1. Ensure you're using the correct package name: `langchain-deepseek` (with hyphen)
2. Check `requirements.txt` has version `0.1.5` or later
3. Rebuild container: `docker compose build --no-cache backend`

---

## 🎨 Frontend UI Features

The DeepSeek section on the Results page displays:

1. **Biomechanical Targets** (blue background)
   - Issues identified by rule-based analyzer
   - Clinical strategies for each issue

2. **Patient Assessment** (yellow background)
   - Capability summary from LLM #1
   - Recommended exercise positions
   - Difficulty range

3. **Safety Review** (green background)
   - Weight-bearing check verdict
   - Kneeling check verdict
   - Core stability check verdict

4. **Final Prescription** (4 exercise cards)
   - Exercise name (English + Chinese)
   - Positions and difficulty level
   - Modifications (if any) with warning icon
   - Clinical rationale explaining the "why"

---

## 📚 Architecture Comparison

| Feature | Rule-Based Algorithm | OpenAI LLM | DeepSeek Two-LLM |
|---------|---------------------|------------|------------------|
| **Endpoint** | `/recommendations/algorithm` | `/recommendations/llm` | `/recommendations/deepseek` |
| **Provider** | Local (Python) | OpenAI GPT-4o-mini | DeepSeek Chat |
| **Architecture** | Fixed formulas | Single LLM enhancement | Two-LLM sequential |
| **Safety Verification** | Built into algorithm | Not separate | Dedicated LLM #2 agent |
| **Biomechanical Targeting** | Rule-based modifiers | LLM reasoning | Rule-based + LLM selection |
| **Output Format** | Position groups with scores | Enhanced recommendations | Full safety workflow |
| **Cost** | Free | ~$0.01 per request | ~$0.005 per request |
| **Response Time** | <1 second | ~3-5 seconds | ~5-8 seconds |
| **Flexibility** | Low | Medium | High |

---

## 🔬 Development Notes

### Key Differences from `LLM_integration/`

The backend implementation differs from the original `LLM_integration/` folder:

1. **Data Source**: PostgreSQL (via SQLAlchemy) instead of Supabase
2. **Exercise Schema**: Old schema (boolean position flags) instead of normalized v3.0
3. **Data Transformer**: `data_transformer.py` instead of `data_fetcher.py`
4. **Integration**: FastAPI endpoint instead of Jupyter notebook

### Extending the System

To modify prompts or logic:

1. **Prompts**: Edit files in `backend/app/services/llm_deepseek/prompts/`
2. **Biomechanical Rules**: Modify `biomechanical_analyzer.py`
3. **Data Structure**: Update `data_transformer.py`
4. **Safety Logic**: Adjust Pydantic schemas in `llm2_safety_verification.py`

### Testing Locally (Development)

For local development without Docker:

```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
export DEEPSEEK_API_KEY=your_key_here
export DATABASE_URL=postgresql://...
uvicorn app.main:app --reload

# Frontend
cd frontend
npm install
npm run dev
```

---

## 📝 Next Steps

1. **Get DeepSeek API key** and test the integration
2. **Compare outputs** between algorithm, OpenAI, and DeepSeek
3. **Gather clinical feedback** on recommendation quality
4. **Monitor costs** (DeepSeek is typically cheaper than OpenAI)
5. **Iterate on prompts** based on testing results

---

## 🙏 Credits

- Original LLM integration: `LLM_integration/` folder
- DeepSeek LLM: [DeepSeek Platform](https://platform.deepseek.com/)
- LangChain integration: `langchain-deepseek` package

---

**Version**: 1.0.0
**Last Updated**: 2026-03-08
**Branch**: `feature/integrate-llm-to-docker`
