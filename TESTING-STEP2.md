# Testing Step 2: Username Authentication

## What Was Created

1. **[home.html](home.html)** - New landing page with authentication
2. **[src/auth/auth.js](src/auth/auth.js)** - Authentication logic with passcode protection
3. **[styles/auth.css](styles/auth.css)** - Authentication page styling
4. Updated **[vite.config.js](vite.config.js)** - Added new page routes

## Features Implemented

### 🔐 Two-Step Authentication
1. **Step 1: Passcode Entry**
   - Uses `VITE_PHYSIO_PASSCODE` from `.env` file
   - Current passcode: `demo1125`
   - Protects system from unauthorized access

2. **Step 2: Username Entry with Real-Time Feedback** ⭐ NEW!
   - **Real-time username checking** (debounced 500ms)
   - **Visual feedback** while typing:
     - "Checking..." → Gray background with pulse animation
     - "✓ Available - Creating new account" → Green background
     - "✓ Existing account - Logging in" → Blue background
   - **Dynamic button text**:
     - "Create New Account" for new users
     - "Login to Existing Account" for returning users
   - Validates username format (3-50 chars, alphanumeric)

### 🚀 Smart Redirect Logic
The system automatically detects user progress and redirects accordingly:
- **New user** → `/questionnaire.html`
- **Questionnaire completed** → `/sts-assessment.html`
- **Both completed** → `/analysis.html`

### 💾 Data Storage
- Username stored in `localStorage` as `currentUser`
- User ID stored in `localStorage` as `userId`
- User record created in Supabase `users` table

## How to Test

### 1. Start Development Server
```bash
npm run dev
```

### 2. Open Browser
Navigate to: `http://localhost:5173/home.html`

### 3. Test Passcode Protection

**Test Case 1: Wrong Passcode**
1. Enter: `wrongpasscode`
2. Click "Continue"
3. ✅ Should show error: "Incorrect passcode. Please try again."

**Test Case 2: Correct Passcode**
1. Enter: `demo1125`
2. Click "Continue"
3. ✅ Should show username entry screen

### 4. Test Username Authentication with Real-Time Feedback

**Test Case 3: New User (Real-time Check)**
1. Start typing username: `testuser1`
2. After 0.5 seconds, watch for real-time status:
   - First shows: "Checking..." (gray background, pulsing)
   - Then shows: "✓ Available - Creating new account" (green background)
   - Button changes to: "Create New Account"
3. Click "Create New Account"
4. ✅ Should create user in Supabase `users` table
5. ✅ Should redirect to `/questionnaire.html` (will show 404 for now - we'll create it next)

**Test Case 4: Existing User (Real-time Check)**
1. Refresh page and enter passcode again
2. Start typing same username: `testuser1`
3. After 0.5 seconds, watch for real-time status:
   - First shows: "Checking..." (gray background, pulsing)
   - Then shows: "✓ Existing account - Logging in" (blue background)
   - Button changes to: "Login to Existing Account"
4. Click "Login to Existing Account"
5. ✅ Should recognize existing user
6. ✅ Should redirect based on progress (questionnaire for now)

**Test Case 5: Invalid Username**
1. Enter username: `ab` (too short)
2. ✅ Should show error: "Username must be between 3 and 50 characters"
3. Enter username: `test@user!` (invalid chars)
4. ✅ Should show error: "Username can only contain letters, numbers, hyphens, and underscores"

### 5. Verify in Supabase

1. Go to [app.supabase.com](https://app.supabase.com)
2. Open "Table Editor"
3. Click on `users` table
4. ✅ Should see your test user(s) listed

### 6. Test Auto-Login

1. After logging in once, note that `localStorage` has `currentUser`
2. Navigate to `/home.html` again
3. ✅ Should automatically skip login and redirect to appropriate page

### 7. Test Logout / Clear Session

**To test the login page again after auto-login:**

**Option 1: Use Logout URL**
1. Navigate to: `http://localhost:5173/home.html?logout=true`
2. ✅ This clears localStorage and shows the login page

**Option 2: Manual Clear (Browser DevTools)**
1. Open browser DevTools (F12)
2. Go to "Application" or "Storage" tab
3. Find "Local Storage" → `http://localhost:5173`
4. Delete `currentUser` and `userId` keys
5. Refresh page
6. ✅ Should show login page

**Option 3: Console Command**
1. Open browser console (F12)
2. Type: `localStorage.clear()`
3. Press Enter
4. Refresh page
5. ✅ Should show login page

## Expected Behavior Summary

| Action | Expected Result |
|--------|----------------|
| Open home.html | Shows passcode screen |
| Wrong passcode | Error message, stays on screen |
| Correct passcode | Shows username screen |
| New username | Creates user in DB, redirects to questionnaire |
| Existing username | Logs in, redirects based on progress |
| Already logged in | Auto-redirects without showing login |

## Known Issues (Expected)

- ❌ Redirect to `/questionnaire.html` will show 404 - **This is OK!** We'll create it in Step 3
- ❌ Redirect to `/sts-assessment.html` will show 404 - **This is OK!** We'll create it in Step 4
- ❌ Redirect to `/analysis.html` will show 404 - **This is OK!** We'll create it in Step 5

## Next Steps

Once you confirm this step is working:
1. I'll commit and push to `question_sts` branch
2. We'll move to Step 3: Create the questionnaire page with toe touch test

## Troubleshooting

### "Cannot read property 'VITE_PHYSIO_PASSCODE'"
- Make sure `.env` file exists in project root
- Make sure it contains `VITE_PHYSIO_PASSCODE=demo1125`
- Restart dev server (`npm run dev`)

### "Failed to create user"
- Check Supabase connection
- Verify RLS policies are set (from Step 1 migration)
- Check browser console for detailed error

### Page doesn't load
- Make sure dev server is running
- Navigate to `http://localhost:5173/home.html` (not just `/`)
