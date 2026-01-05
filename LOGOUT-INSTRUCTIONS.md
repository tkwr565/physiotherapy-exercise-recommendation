# How to Logout / Reset Login

## The Auto-Login Feature

Once you successfully log in, your username is saved in the browser's `localStorage`. This means:

- ✅ **Benefit**: You don't need to log in every time you refresh
- ✅ **Smart**: System remembers where you left off (questionnaire/STS/analysis)
- ⚠️ **Testing**: You need to manually logout to test the login page again

---

## 3 Ways to Logout

### 🎯 **Method 1: Logout URL (Easiest)**

Just visit:
```
http://localhost:5173/home.html?logout=true
```

This will:
1. Clear your session data
2. Show the login page again
3. Let you create a new account or login as different user

---

### 🔧 **Method 2: Browser DevTools**

1. Press `F12` to open DevTools
2. Go to **"Application"** tab (Chrome) or **"Storage"** tab (Firefox)
3. Find **"Local Storage"** in the left sidebar
4. Click on `http://localhost:5173`
5. Find these keys and delete them:
   - `currentUser`
   - `userId`
6. Refresh the page (`F5`)

---

### 💻 **Method 3: Console Command**

1. Press `F12` to open DevTools
2. Go to **"Console"** tab
3. Type: `localStorage.clear()`
4. Press `Enter`
5. Refresh the page (`F5`)

---

## Quick Testing Workflow

### Testing Different Users:
```
1. Login as "user1" → Test flow
2. Visit: http://localhost:5173/home.html?logout=true
3. Login as "user2" → Test flow
4. Repeat
```

### Testing Returning User:
```
1. Login as "testuser" → Complete questionnaire
2. Visit: http://localhost:5173/home.html
3. ✅ Should auto-login and resume at STS page
```

### Testing New User:
```
1. Visit: http://localhost:5173/home.html?logout=true
2. Create new username
3. ✅ Should start at questionnaire page
```

---

## Understanding localStorage

You can inspect what's stored:

1. Open Console (`F12` → Console)
2. Type: `localStorage`
3. Press `Enter`

You'll see:
```javascript
Storage {
  currentUser: "testuser1",
  userId: "42",
  length: 2
}
```

---

## For Production (Future)

Later, we can add:
- Logout button in the UI
- Session timeout (auto-logout after X hours)
- "Switch User" feature
- Remember me checkbox

But for now, the `?logout=true` URL parameter works perfectly for testing!

---

## Bookmark These URLs

**Login Page (Clear Session):**
```
http://localhost:5173/home.html?logout=true
```

**Home Page (Auto-Login if Logged In):**
```
http://localhost:5173/home.html
```

**Production URLs (After Deployment):**
```
https://your-app.vercel.app/home.html?logout=true
https://your-app.vercel.app/home.html
```
