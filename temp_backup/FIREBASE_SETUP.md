# Feature Gating Strategy

To divide features between Free and Pro tiers, we use a "Double-Lock" system:

## 1. Client-Side (The UI Lock)
We visually disable features for Free users to improve UX.
- **Free User**:
  - "Read Images" checkbox is disabled (greyed out) with a 🔒 icon.
  - "Creative" tone is disabled.
  - "Export to Docs" shows a "Pro" badge.
- **Pro User**: All features unlocked.

## 2. Server-Side (The Real Lock)
The backend enforces the rules so hackers can't bypass the UI.
- **Middleware Check**:
  - If `user.plan === 'free'` AND `request.hasImages`, return Error 403.
  - If `user.plan === 'free'` AND `daily_usage > 5`, return Error 429 (Too Many Requests).

---

# Phase 2: Authentication Setup Instructions

To implement this, we need **Firebase Authentication**. Please follow these steps to get your configuration keys:

1.  Go to [Firebase Console](https://console.firebase.google.com/).
2.  Click **"Add project"** and name it `Tiger Extension`.
3.  Disable Google Analytics (not needed for now).
4.  Click **Create Project**.
5.  Once created, go to **Build** -> **Authentication** -> **Get Started**.
6.  **Sign-in method**: Select **Google**, enable it, and save.
7.  Go to **Project Settings** (Gear icon) -> **General**.
8.  Scroll down to "Your apps" -> Click the **Web (</>)** icon.
9.  Register app (name it "Tiger Extension").
10. **Copy the `firebaseConfig` object**.

**Please paste the `firebaseConfig` here so I can integrate it.**
It looks like this:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};
```
