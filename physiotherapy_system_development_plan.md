# Physiotherapy Exercise Recommendation System - Development Plan

## Project Overview

A web-based system for testing and gathering feedback on an exercise recommendation algorithm for knee osteoarthritis patients. The system consists of patient questionnaires and physiotherapist assessments that generate personalized exercise recommendations.

## Infrastructure Setup (COMPLETED)

### Database: Supabase
- **Project ID**: `xgwqurhzctkpembiwskf`
- **URL**: `https://xgwqurhzctkpembiwskf.supabase.co`
- **Anon Public Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhnd3F1cmh6Y3RrcGVtYml3c2tmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1MDU1ODMsImV4cCI6MjA3ODA4MTU4M30.dq1ZTfna8QUM-p7YuKYa4Us4jciZ9RnI0sFnO7I2iIQ`
- **Region**: Southeast Asia (Singapore)
- **Tables Created**: `assessments`, `exercises`
- **Exercise Data**: 33 exercises imported successfully from CSV

### Hosting: Vercel
- **Account**: Ready for deployment
- **Deployment**: Will be connected to GitHub repository
- **No additional tokens required**

### Authentication
- **Physio Passcode**: `demo1125` (hardcoded initially)
- **No patient authentication required**

### Reference Files Available
- **Original HTML Demo**: `old_version/Integrated_Physiotherapy_Test_Tool.html`
  - Contains complete working questionnaire with KOOS/WOMAC questions
  - Has all scoring calculation algorithms implemented
  - Includes UI patterns and validation logic
- **Original Excel Database**: `old_version/OA_Knee_Exercise_Database.xlsx`
  - Original exercise data for reference
- **Formatted CSV**: `data/exercises_for_supabase.csv`
  - Cleaned exercise data, already imported to Supabase

## System Architecture

```
Patient Mobile → Patient Questionnaire → Supabase DB ← Physio Assessment → Physio Device
```

### Core Workflow
1. Patient scans QR code → fills questionnaire → gets UUID QR code
2. Physio scans patient's QR code → conducts assessment → gets exercise recommendations

## Database Schema

### `assessments` Table
```sql
- id (UUID, PRIMARY KEY)
- created_at (TIMESTAMP)

-- Patient questionnaire results (calculated position multipliers)
- position_sl_stand_multiplier (DECIMAL)
- position_split_stand_multiplier (DECIMAL) 
- position_dl_stand_multiplier (DECIMAL)
- position_quadruped_multiplier (DECIMAL)
- position_lying_multiplier (DECIMAL)
- questionnaire_completed_at (TIMESTAMP)

-- Physio assessment results (raw muscle strengths 0-5)
- left_quad_strength (INTEGER)
- left_hamstring_strength (INTEGER)
- left_glute_max_strength (INTEGER)
- left_glute_med_min_strength (INTEGER)
- left_adductors_strength (INTEGER)
- left_hip_flexors_strength (INTEGER)
- left_calves_strength (INTEGER)

- right_quad_strength (INTEGER)
- right_hamstring_strength (INTEGER)
- right_glute_max_strength (INTEGER)
- right_glute_med_min_strength (INTEGER)
- right_adductors_strength (INTEGER)
- right_hip_flexors_strength (INTEGER)
- right_calves_strength (INTEGER)

- assessment_completed_at (TIMESTAMP)
```

### `exercises` Table
```sql
- id (SERIAL, PRIMARY KEY)
- exercise_name (TEXT)
- position_sl_stand (BOOLEAN)
- position_split_stand (BOOLEAN)
- position_dl_stand (BOOLEAN)
- position_quadruped (BOOLEAN)
- position_lying (BOOLEAN)
- muscle_quad (DECIMAL, 0-5)
- muscle_hamstring (DECIMAL, 0-5)
- muscle_glute_max (DECIMAL, 0-5)
- muscle_glute_med_min (DECIMAL, 0-5)
- muscle_adductors (DECIMAL, 0-5)
- muscle_hip_flexors (DECIMAL, 0-5)
- muscle_calves (DECIMAL, 0-5)
- difficulty_level (INTEGER, 1-5)
```

## Component 1: Patient Questionnaire Web App

### Access Method
- **URL**: Patient scans QR code or visits direct link
- **Device**: Mobile-optimized responsive design
- **Offline**: Should work with intermittent connectivity

### Features Required
1. **Session Persistence**
   - Use localStorage to save progress
   - Auto-restore if browser closed/refreshed
   - Clear localStorage after successful submission

2. **Form Validation**
   - Frontend: Ensure all questions answered before submission
   - Visual indicators for incomplete sections
   - Progress indicator

3. **Questionnaire Content**
   - Based on KOOS/WOMAC subset (use existing HTML questionnaire)
   - 5-point Likert scales (0-4)
   - Sections: Pain, Symptoms, ADL, Sport/Recreation, Quality of Life

4. **Calculation Engine**
   - Calculate position multipliers client-side
   - Algorithm: Composite = (Core × 0.6) + (Pain × 0.25) + (Symptoms × 0.15)
   - Multiplier = (4 - composite) ÷ 4
   - Lying position penalty-based calculation

5. **Result Display**
   - Generate UUID for the assessment
   - Display large QR code containing UUID
   - Display UUID as text backup
   - Instructions to show QR code to physiotherapist
   - Save/screenshot capability

6. **Database Integration**
   - Submit position multipliers to Supabase
   - Create new row in `assessments` table with UUID
   - Handle submission errors gracefully

### Technical Requirements
- **Framework**: Vanilla HTML/CSS/JavaScript or simple framework
- **QR Generation**: qrcode.js library
- **Responsive**: Mobile-first design
- **HTTPS**: Required for QR code functionality

## Component 2: Physiotherapist Assessment Web App

### Access Control
- **Login**: Simple passcode entry (`demo1125`)
- **Session**: Persistent login (localStorage)
- **Security**: Basic protection for demo purposes

### UI Flow
1. **Login Page**: Simple passcode input
2. **Home Page**: Blank page with top navigation bar
3. **Top Navigation**: Always visible with "Next Patient" button
4. **QR Scanning Page**: Camera access for QR code scanning
5. **Assessment Form**: Muscle strength testing interface
6. **Recommendation Page**: Exercise recommendations with manual controls

### Features Required

#### Navigation System
- **Persistent Top Bar**: Always visible after login
- **Next Patient Button**: Clears current session, warns about unsaved data
- **Session Management**: Track current patient UUID

#### QR Code Scanning
- **Camera Access**: Use html5-qrcode library
- **Manual Entry**: Backup UUID text input
- **Validation**: Check UUID exists in database
- **Error Handling**: Clear error messages for invalid UUIDs

#### Assessment Form
1. **Session Persistence**
   - Save form data to localStorage
   - Restore on page refresh
   - Clear data when moving to next patient

2. **Muscle Strength Testing**
   - 7 muscle groups per side (left/right)
   - 0-5 scale for each muscle
   - Clean, intuitive interface
   - Visual validation

3. **Data Submission**
   - Store raw muscle strength values
   - Update existing UUID row in database
   - NO muscle weighting at this stage

#### Exercise Recommendation Engine
1. **Manual Controls** (top of page)
   - **Laterality**: Left / Right / Both knees
   - **Muscle Focus**: Dropdown (None, Quad, Hamstring, etc.)
   - **Max Difficulty**: 1-5 filter
   - **Recommend Button**: Trigger calculation

2. **Calculation Process**
   - Fetch patient data by UUID
   - Fetch all exercises from database
   - Apply difficulty filter
   - Calculate muscle deficit scores: (5 - strength)
   - Apply muscle weights:
     - Equal weights: 1/7 each
     - Focused muscle: 3/13, others 2/13
   - Calculate final scores: Deficit-Recruitment × Position Multiplier
   - Sort and return top 10

3. **Results Display**
   - **Top 10 exercises** ranked by final score
   - **Exercise details**: Name, position, difficulty, final score
   - **Detailed breakdown** (expandable): Show muscle-by-muscle scoring
   - **Real-time updates**: Change settings and re-calculate instantly

### Technical Requirements
- **QR Scanning**: html5-qrcode library
- **Camera Permissions**: HTTPS required
- **Responsive Design**: Works on tablets/laptops
- **Session Management**: localStorage for persistence

## Scoring Algorithm Implementation

### Position Multiplier Calculation (Patient Side)
```javascript
// Core questionnaire processing
const coreAvg = calculateCoreAverage(responses);
const painAvg = calculatePainAverage(responses);
const symptomsAvg = calculateSymptomsAverage(responses);

// Position composite scores
const composite = (coreAvg * 0.6) + (painAvg * 0.25) + (symptomsAvg * 0.15);
const multiplier = (4 - composite) / 4;

// Lying position (penalty-based)
const bestActiveScore = Math.min(coreAvg); // Implement best active position logic
const lyingPenalty = bestActiveScore / 4;
const lyingMultiplier = Math.max(0.1, 1.0 - lyingPenalty);
```

### Exercise Recommendation Calculation (Physio Side)
```javascript
// For each exercise and selected laterality
for (const exercise of exercises) {
    let totalScore = 0;
    
    // For each muscle group
    for (const muscle of muscleGroups) {
        const deficit = 5 - patientStrength[muscle];
        const recruitment = exercise[`muscle_${muscle}`];
        const rawScore = deficit * recruitment;
        const normalized = rawScore / 25;
        const weighted = normalized * muscleWeights[muscle];
        totalScore += weighted;
    }
    
    // Apply position multiplier
    const position = getExercisePosition(exercise);
    const positionMultiplier = patientMultipliers[position];
    const finalScore = totalScore * positionMultiplier;
    
    results.push({
        exercise: exercise,
        finalScore: finalScore,
        breakdown: muscleBreakdown
    });
}

// Sort by final score and return top 10
return results.sort((a, b) => b.finalScore - a.finalScore).slice(0, 10);
```

## Technical Stack

### Frontend
- **Base**: HTML5, CSS3, JavaScript (ES6+)
- **QR Generation**: qrcode.js
- **QR Scanning**: html5-qrcode
- **Styling**: CSS Grid/Flexbox, mobile-first responsive design
- **State Management**: localStorage for persistence

### Backend/Database
- **Database**: Supabase (PostgreSQL)
- **API**: Supabase REST API (no custom backend needed)
- **Authentication**: None (public access with RLS policies)

### Deployment
- **Platform**: Vercel
- **Domain**: Auto-generated .vercel.app domain
- **SSL**: Automatic HTTPS
- **CDN**: Global distribution

## Development Phases

### Phase 1: Core Infrastructure
1. Set up GitHub repository
2. Create basic project structure
3. Configure Supabase connection
4. Deploy initial version to Vercel

### Phase 2: Patient Questionnaire
1. Implement questionnaire form
2. Add client-side validation
3. Implement position multiplier calculations
4. Add QR code generation
5. Integrate with Supabase

### Phase 3: Physio Assessment
1. Create login system
2. Implement QR scanning
3. Build assessment form
4. Add session persistence
5. Integrate with database

### Phase 4: Recommendation Engine
1. Implement exercise scoring algorithm
2. Create recommendation interface
3. Add manual controls
4. Build results display
5. Add detailed breakdowns

### Phase 5: Testing & Refinement
1. Cross-browser testing
2. Mobile device testing
3. Performance optimization
4. Bug fixes and polish

## Environment Variables
```env
VITE_SUPABASE_URL=https://xgwqurhzctkpembiwskf.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhnd3F1cmh6Y3RrcGVtYml3c2tmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1MDU1ODMsImV4cCI6MjA3ODA4MTU4M30.dq1ZTfna8QUM-p7YuKYa4Us4jciZ9RnI0sFnO7I2iIQ
VITE_PHYSIO_PASSCODE=demo1125
```

**Notes**: 
- Supabase anon key is safe to use in frontend code
- No additional Vercel credentials needed - deployment via GitHub integration
- Environment file should be created as `.env` in project root

## File Structure
```
/
├── index.html (Patient questionnaire entry point)
├── physio.html (Physio assessment entry point)
├── css/
│   ├── patient.css
│   ├── physio.css
│   └── shared.css
├── js/
│   ├── patient/
│   │   ├── questionnaire.js
│   │   ├── calculations.js
│   │   └── qr-generator.js
│   ├── physio/
│   │   ├── auth.js
│   │   ├── qr-scanner.js
│   │   ├── assessment.js
│   │   └── recommendations.js
│   └── shared/
│       ├── supabase.js
│       ├── storage.js
│       └── utils.js
├── assets/
│   └── images/
└── vercel.json (Deployment configuration)
```

## Testing Requirements

### Functional Testing
- Patient questionnaire completion flow
- QR code generation and scanning
- Physio assessment form submission
- Exercise recommendation calculation
- Session persistence across page refreshes

### Device Testing
- iOS Safari (mobile)
- Android Chrome (mobile)
- Desktop Chrome/Firefox/Safari
- Tablet devices

### Edge Cases
- Network interruption during submission
- Invalid QR codes
- Incomplete form submissions
- Browser permission denials for camera access

## Success Criteria

### For Demo/Testing Phase
1. **Functionality**: All core features working smoothly
2. **Usability**: Intuitive interface for both patients and physios
3. **Reliability**: Handles common errors gracefully
4. **Performance**: Fast loading and responsive interactions
5. **Compatibility**: Works on common mobile devices and browsers

### Ready for Feedback Collection
- Physios can successfully assess multiple patients
- Exercise recommendations are generated correctly
- System is stable enough for real user testing
- Data is being captured properly for algorithm analysis

---

## Implementation Guidance

### Using Reference Files
1. **HTML Demo Analysis**: Examine `old_version/Integrated_Physiotherapy_Test_Tool.html` for:
   - Complete KOOS/WOMAC question set with exact wording
   - Question categorization logic (Pain, Symptoms, ADL, Sport/Recreation, QoL)
   - Position multiplier calculation algorithms (already working)
   - Form validation patterns and UI components
   - JavaScript functions for scoring

2. **Database Verification**: Reference `old_version/OA_Knee_Exercise_Database.xlsx` to:
   - Verify exercise data structure matches imported CSV
   - Understand original column mappings
   - Cross-check muscle recruitment values and difficulty levels

3. **Data Structure**: Use `data/exercises_for_supabase.csv` as:
   - Source of truth for exercise data format
   - Reference for boolean position mappings (True/False)
   - Verification that data matches Supabase import

### Key Implementation Notes
- **Reuse existing questionnaire logic** - Don't recreate from scratch
- **Maintain algorithm consistency** - Use same calculation methods as HTML demo
- **Preserve question order and wording** - Critical for scoring accuracy
- **Mobile-first approach** - Patient questionnaire must work seamlessly on phones
- **Session persistence** - Use localStorage for both patient and physio sides

## Notes for Implementation

- Keep the codebase simple and maintainable
- Prioritize mobile experience for patient questionnaire
- Ensure offline capability where possible
- Add comprehensive error handling
- Use semantic HTML for accessibility
- Comment code thoroughly for future updates
