# Quick Start: DeepSeek LLM Integration

## ⚡ Get Started in 3 Steps

### Step 1: Get DeepSeek API Key

1. Visit [https://platform.deepseek.com/](https://platform.deepseek.com/)
2. Sign up for an account
3. Navigate to API Keys section
4. Create a new API key (starts with `sk-...`)
5. Copy the key

### Step 2: Configure Environment

Create a `.env` file in the project root:

```bash
# Required for DeepSeek LLM
DEEPSEEK_API_KEY=sk-your-actual-api-key-here

# Optional: OpenAI for comparison
# OPENAI_API_KEY=sk-your-openai-key-here

# Passcode (default)
PHYSIO_PASSCODE=physio2024
```

### Step 3: Run Docker

```bash
# Build and start all services
docker compose up --build

# Wait for services to start (30-60 seconds)
# Backend will be ready when you see: "Application startup complete"
```

## 🎯 How to Test

1. **Open browser**: [http://localhost:3000](http://localhost:3000)

2. **Login**:
   - Enter passcode: `physio2024`
   - Create username: `test_patient_01`

3. **Complete Assessment**:
   - **Demographics**: Age 65, Female, Height 160cm, Weight 60kg
   - **Questionnaire**: Fill with moderate scores (2-3 range)
   - **STS Assessment**:
     - Repetitions: 10
     - Knee alignment: Valgus
     - Trunk sway: Present
     - Hip sway: Absent

4. **View Results**:
   - Scroll to "DeepSeek AI Recommendations" section
   - Click **"Get DeepSeek AI Recommendations"** button
   - Wait 5-10 seconds for processing

5. **Review Output**:
   - ✅ Biomechanical Targets (blue box)
   - ✅ Patient Assessment (yellow box)
   - ✅ Safety Review (green box)
   - ✅ Final Prescription (4 exercises with rationale)

## 📊 Expected Output Example

**Biomechanical Targets:**
- Dynamic knee instability (Valgus alignment)
- Core instability (Trunk sway present)

**Patient Assessment:**
- Capability: Moderate functional capacity with postural instability
- Positions: supine_lying, side_lying
- Difficulty: 1-3

**Safety Review:**
- Weight-Bearing: moderate_risk
- Kneeling: safe
- Core Stability: moderate_risk

**Final Prescription:**
1. Side Lying Hip Abduction (側臥髖外展)
   - Positions: side_lying
   - Difficulty: 2/10
   - Modifications: Start with 2 sets of 8 reps
   - Rationale: Targets valgus knee alignment...

## 🛑 Troubleshooting

### "DEEPSEEK_API_KEY not found"
- Check `.env` file exists in project root
- Verify key is set correctly (no quotes, no spaces)
- Restart: `docker compose down && docker compose up --build`

### Backend won't start
```bash
# Check logs
docker compose logs backend

# Rebuild from scratch
docker compose down -v
docker compose up --build
```

### Frontend shows error
- Open browser DevTools (F12) → Network tab
- Look for failed `/api/recommendations/deepseek` request
- Check response for detailed error message

## 📚 Full Documentation

For complete documentation, see:
- [DEEPSEEK_INTEGRATION_GUIDE.md](./DEEPSEEK_INTEGRATION_GUIDE.md) - Full integration guide
- [NEW_README.md](./NEW_README.md) - Docker setup documentation

## 🎉 Success Indicators

You'll know it's working when you see:

1. ✅ Backend logs show: `INFO: Application startup complete.`
2. ✅ Frontend loads at [http://localhost:3000](http://localhost:3000)
3. ✅ DeepSeek button appears on Results page
4. ✅ Clicking button shows loading state
5. ✅ Results appear with 4 exercises + clinical rationale

## 💰 Cost Estimate

DeepSeek is very affordable:
- ~$0.005 per recommendation request
- Cheaper than OpenAI GPT-4o-mini
- Good for testing and development

## 🔧 Advanced: Local Development

If you prefer to run without Docker:

```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
export DEEPSEEK_API_KEY=your_key
export DATABASE_URL=postgresql://physio:physio_password@localhost:5432/physio_db
uvicorn app.main:app --reload --port 8000

# Frontend (separate terminal)
cd frontend
npm install
npm run dev
```

Access at: [http://localhost:5173](http://localhost:5173)

---

**Branch**: `feature/integrate-llm-to-docker`

**Need help?** Check the full [DEEPSEEK_INTEGRATION_GUIDE.md](./DEEPSEEK_INTEGRATION_GUIDE.md)
