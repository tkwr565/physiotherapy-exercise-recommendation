# Step 2 - Real-Time Username Feedback Feature

## Visual Flow Diagram

```
┌─────────────────────────────────────────────────────┐
│              PASSCODE SCREEN                        │
│  ┌───────────────────────────────────────────────┐ │
│  │ Passcode: [**********]                        │ │
│  │                                                │ │
│  │ [Continue]                                     │ │
│  └───────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
                        ↓
            (Enter correct passcode)
                        ↓
┌─────────────────────────────────────────────────────┐
│           USERNAME SCREEN (NEW!)                     │
│  ┌───────────────────────────────────────────────┐ │
│  │ Username: [testuser_______]                   │ │
│  │ 3-50 characters, letters and numbers only     │ │
│  │                                                │ │
│  │ 🔄 Checking...                  ← Gray, pulse │ │
│  │                                                │ │
│  │ [Continue to Assessment]                       │ │
│  └───────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
                        ↓
              (After 500ms check)
                        ↓
         ┌──────────────┴──────────────┐
         ↓                              ↓
   NEW USER                       EXISTING USER
         ↓                              ↓
┌──────────────────────┐      ┌──────────────────────┐
│ ✓ Available          │      │ ✓ Existing account   │
│ Creating new account │      │ Logging in           │
│ ← Green background   │      │ ← Blue background    │
│                      │      │                      │
│ [Create New Account] │      │ [Login to Existing   │
│                      │      │  Account]            │
└──────────────────────┘      └──────────────────────┘
```

## Real-Time Feedback States

### State 1: Too Short (< 3 characters)
```
Username: [ab_______]
         (No status shown)
         Button: "Continue to Assessment"
```

### State 2: Checking (after typing)
```
Username: [testuser1_]
         🔄 Checking...    ← Gray background, pulsing animation
         Button: "Continue to Assessment"
```

### State 3a: New Username Available
```
Username: [testuser1_]
         ✓ Available - Creating new account    ← Green background
         Button: "Create New Account"
```

### State 3b: Existing Username Found
```
Username: [existinguser_]
         ✓ Existing account - Logging in    ← Blue background
         Button: "Login to Existing Account"
```

## Technical Implementation

### Debouncing
- User types → Wait 500ms → Check database
- Prevents excessive database queries while typing
- Smooth user experience

### Database Check
```javascript
// Query Supabase users table
const { data: existingUser } = await supabase
  .from('users')
  .select('username')
  .eq('username', username)
  .maybeSingle();

// Update UI based on result
if (existingUser) {
  // Show blue "Existing account" status
} else {
  // Show green "Available" status
}
```

### CSS Animation
```css
/* Pulsing "Checking..." state */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}
```

## User Experience Benefits

✅ **Immediate Clarity**
- Users instantly know if they're creating new account or logging in
- No confusion about what will happen when they click submit

✅ **Error Prevention**
- Real-time validation prevents submission of invalid usernames
- Visual feedback helps users understand requirements

✅ **Professional Feel**
- Smooth animations and transitions
- Color-coded feedback (gray → green/blue)
- Dynamic button text matches action

✅ **Reduced Friction**
- No need for separate "Register" vs "Login" buttons
- Single unified flow handles both cases automatically

## Color Coding

| State | Background | Border | Meaning |
|-------|-----------|--------|---------|
| Checking | `#f5f5f5` | None | Processing |
| New User | `#f0fdf4` | `#22c55e` (green) | Success - Create |
| Existing | `#e6f2ff` | `#0066cc` (blue) | Success - Login |
| Error | `#fee` | `#ef4444` (red) | Validation error |

## Example User Journeys

### Journey 1: First-Time User
1. Enter passcode → ✅
2. Type "john_smith" → See "Checking..." → See "✓ Available - Creating new account"
3. Click "Create New Account" → User created in DB
4. Redirect to questionnaire page

### Journey 2: Returning User
1. Enter passcode → ✅
2. Type "existing_user" → See "Checking..." → See "✓ Existing account - Logging in"
3. Click "Login to Existing Account" → Load user data
4. Redirect based on progress (questionnaire/STS/analysis)

### Journey 3: Typo Correction
1. Type "tes" → No status (too short)
2. Type "testuser1" → See "✓ Available"
3. Realize typo, backspace
4. Type "testuser2" → See "Checking..." → See "✓ Available"
5. Each check happens automatically with 500ms delay
