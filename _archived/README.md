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

**Do not use these files** - they are kept for reference only. The current production system uses the Docker-based architecture defined in the repository root.

---

## Current Production System

The active codebase is in the repository root and consists of:

- **`backend/`** - FastAPI Python backend
- **`frontend/`** - React 18 + Vite frontend
- **`database/`** - PostgreSQL schema and seed data
- **`docker-compose.yml`** - Docker orchestration
- **`NEW_README.md`** - Current documentation

For setup and usage instructions, refer to `NEW_README.md` in the repository root.
