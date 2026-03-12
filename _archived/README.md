# Archived Files

This directory contains archived code and files from previous implementations that are not part of the current Docker-based production system.

## Directory Structure

### `legacy-vercel-supabase/`

Contains the original Vercel + Supabase implementation that predates the current Docker-based FastAPI + React architecture.

**Contents:**
- HTML files: Static HTML pages for the original implementation
- JavaScript source files (`src/`): Client-side JavaScript modules
- CSS styles (`styles/`): Original styling
- Configuration files: `vercel.json`, `vite.config.js`, `package.json`
- Build artifacts: `dist/` directory
- Dependencies: `node_modules/`
- Development files: `ammend/` directory

**Note:** This implementation used:
- Supabase for backend/database
- Vercel for hosting
- Vanilla JavaScript (no React)
- Static HTML pages

**Do not use these files** - they are kept for reference only.

### `LLM_integration/`

Contains the standalone Jupyter notebook implementation for DeepSeek two-LLM exercise recommendation system.

**Contents:**
- `main.ipynb`: Interactive notebook for testing LLM recommendations
- Python modules: `llm1_recommendation.py`, `llm2_safety_verification.py`, `biomechanical_analyzer.py`, `data_fetcher.py`
- Prompts directory: LLM prompt templates
- Output directory: Generated recommendation outputs

**Note:** This standalone implementation has been integrated into the backend at `backend/app/services/llm_deepseek/`. The notebook is kept for development/testing reference only.

### `docs/`

Contains legacy documentation files that predate the current system.

**Contents:**
- `ALGORITHM_DOCUMENTATION.md`: Original algorithm documentation
- `ALGORITHM_TO_LLM_TRANSITION.md`: Migration guide from algorithm to LLM
- `TWO_LLM_SYSTEM_ARCHITECTURE.md`: DeepSeek system architecture details
- `STS-ASSESSMENT.md`: STS assessment documentation
- `EXERCISE_DATABASE_TRANSITION.md`: Exercise data migration guide
- `WEB_ALGORITHM_FIX.md`: Legacy web algorithm fixes
- Translation guides and references

**Note:** Most information has been consolidated into `NEW_README.md` in the repository root.

### Root-level Archived Files

- **`legacy-README.md`**: Original README (superseded by `NEW_README.md`)
- **`DEEPSEEK_INTEGRATION_GUIDE.md`**: DeepSeek integration guide (information now in `NEW_README.md`)
- **`QUICKSTART_DEEPSEEK.md`**: DeepSeek quickstart guide (information now in `NEW_README.md`)

---

## Current Production System

The active codebase is in the repository root and consists of:

- **`backend/`** - FastAPI Python backend with integrated LLM services
- **`frontend/`** - React 18 + Vite frontend with video assessment
- **`database/`** - PostgreSQL schema and seed data
- **`nginx/`** - SSL termination and reverse proxy
- **`docker-compose.yml`** - Docker orchestration
- **`NEW_README.md`** - **Current documentation** (use this for all setup and usage)

For setup and usage instructions, refer to `NEW_README.md` in the repository root.
