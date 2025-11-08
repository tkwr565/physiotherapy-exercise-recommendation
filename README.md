# Physiotherapy Exercise Recommendation System

A bilingual (English/繁體中文) web application for knee osteoarthritis exercise recommendations using KOOS/WOMAC questionnaires and muscle strength assessments.

## Features

### Patient Questionnaire (Mobile-Optimized)
- 30 KOOS/WOMAC standardized questions
- Bilingual support (English/Traditional Chinese)
- Progress tracking with localStorage persistence
- Automatic position multiplier calculations
- QR code generation for physiotherapist identification

### Physiotherapist Assessment (Desktop/Tablet)
- Secure passcode authentication
- QR code scanning with camera access
- Manual UUID entry fallback
- 7 muscle group strength assessment (Oxford Scale 0-5)
- Real-time exercise recommendations

### Exercise Recommendation Engine
- Deficit-recruitment scoring algorithm
- Position multipliers (Lying, Quadruped, DL Stand, Split Stand, SL Stand)
- Manual controls (laterality, muscle focus, difficulty filter)
- Top 10 exercises with detailed breakdowns
- Color-coded position badges
- Signal bar difficulty indicators

## Tech Stack

- **Frontend**: Vite + Vanilla JavaScript
- **Database**: Supabase
- **QR Code**: qrcode.js (generation), html5-qrcode (scanning)
- **Deployment**: Vercel
- **Styling**: CSS3 with responsive design

## Getting Started

### Prerequisites
- Node.js 16+
- Supabase account with exercises database

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd demo_v1
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file with Supabase credentials:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_PHYSIO_PASSCODE=your_passcode
```

4. Run development server:
```bash
npm run dev
```

5. Build for production:
```bash
npm run build
```

## Usage

### Patient Flow
1. Open patient questionnaire at `/`
2. Switch language using toggle (defaults to 繁體中文)
3. Answer all 30 questions
4. Receive QR code and UUID
5. Show QR code to physiotherapist

### Physiotherapist Flow
1. Open physiotherapist interface at `/physio`
2. Login with passcode
3. Scan patient QR code or enter UUID manually
4. Complete muscle strength assessment (7 groups × 2 sides)
5. View top 10 exercise recommendations
6. Adjust filters (laterality, muscle focus, difficulty)

## Database Schema

### assessments table
- `id` (UUID, primary key)
- `position_sl_stand_multiplier` (numeric)
- `position_split_stand_multiplier` (numeric)
- `position_dl_stand_multiplier` (numeric)
- `position_quadruped_multiplier` (numeric)
- `position_lying_multiplier` (numeric)
- `right_*_strength` (integer 0-5, for 7 muscle groups)
- `left_*_strength` (integer 0-5, for 7 muscle groups)
- `questionnaire_completed_at` (timestamp)
- `assessment_completed_at` (timestamp)

### exercises table
- `id` (primary key)
- `exercise_name` (text)
- `difficulty_level` (integer 1-5)
- `position_*` (boolean for 5 positions)
- `muscle_*` (integer 0-3 recruitment level for 7 muscles)

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

The app will be available at:
- Patient: `https://your-app.vercel.app/`
- Physio: `https://your-app.vercel.app/physio`

## Algorithm Details

### Position Multiplier Calculation
```
Composite = (Core × 0.6) + (Pain × 0.25) + (Symptoms × 0.15)
Multiplier = (4 - Composite) / 4
```

### Deficit-Recruitment Score
```
For each muscle:
  Deficit = 5 - Strength
  Raw Score = Deficit × Recruitment
  Normalized = Raw Score / 25
  Weighted = Normalized × Muscle Weight

Final Score = Total Weighted Score × Position Multiplier
```

## License

This project is for demonstration and testing purposes.

## Acknowledgments

- KOOS/WOMAC questionnaire from standardized assessment tools
- Exercise database from physiotherapy research
- Built with Claude Code assistance
