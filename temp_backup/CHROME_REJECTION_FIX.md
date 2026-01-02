# Chrome Web Store Rejection Fix - Action Plan

## Problem
Extension rejected for including remotely-hosted code:
- `https://apis.google.com/js/api.js`
- `https://www.google.com/recaptcha/api.js`
- `https://www.google.com/recaptcha/enterprise.js`

## Root Cause
Firebase Auth SDK includes references to these remote scripts, even though we're using `chrome.identity` API.

## Solution Options

### ✅ OPTION 1: Remove Firebase Auth from Extension (RECOMMENDED)
**Impact:** Medium  
**Effort:** 1 hour  
**Success Rate:** 100%

Since you're already using `chrome.identity` for authentication, Firebase Auth is redundant in the extension context.

**Steps:**
1. Keep Firebase Auth ONLY in web pages (landing.tsx, mobile.tsx, welcome.tsx)
2. Remove Firebase Auth from extension pages (sidepanel, content scripts)
3. Use `chrome.identity` + Firestore directly

**Files to modify:**
- `src/services/firebase.ts` - Remove auth, keep only Firestore
- `src/views/HomeView.tsx` - Use chrome.identity instead of Firebase Auth

---

### ⚠️ OPTION 2: Use Firebase Modular SDK with Tree-Shaking
**Impact:** Low  
**Effort:** 2 hours  
**Success Rate:** 70%

Try to tree-shake Firebase better to remove unused code.

**Steps:**
1. Ensure using modular imports (already done)
2. Add Rollup plugin to remove dead code
3. Configure Vite to aggressively tree-shake

---

### ❌ OPTION 3: Fork Firebase SDK
**Impact:** High  
**Effort:** 8+ hours  
**Success Rate:** 50%

Not recommended - too much maintenance burden.

---

## RECOMMENDED APPROACH

### Phase 1: Separate Auth Contexts (1 hour)

**Extension Context (Side Panel):**
- Use `chrome.identity` ONLY
- Remove Firebase Auth imports
- Keep Firestore for data

**Web Context (Landing, Mobile, Welcome):**
- Keep Firebase Auth
- These pages don't go to Chrome Web Store

### Phase 2: Update Code

#### 1. Create new `firebase-extension.ts` (Firestore only)
```typescript
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = { /* ... */ };
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// NO AUTH - use chrome.identity instead
```

#### 2. Update `HomeView.tsx`
```typescript
// ❌ Remove
import { signInWithGoogle } from '../services/firebase';

// ✅ Add
const signIn = async () => {
    const token = await chrome.identity.getAuthToken({ interactive: true });
    // Use token with Firestore directly
};
```

#### 3. Keep `firebase-web.ts` unchanged
This is only used in web pages, not in the extension bundle.

---

## Implementation Steps

1. **Create `src/services/firebase-extension.ts`** - Firestore only, no auth
2. **Update `src/views/HomeView.tsx`** - Use chrome.identity directly
3. **Update imports** - Extension pages use firebase-extension.ts
4. **Test** - Ensure auth still works
5. **Build** - Check for remote URLs
6. **Submit** - Resubmit to Chrome Web Store

---

## Verification

After changes, run:
```bash
npm run build
grep -r "apis.google.com\|recaptcha" dist/assets/
```

Should return: **0 results**

---

## Timeline

- **Option 1 (Recommended):** 1-2 hours
- **Option 2:** 2-4 hours  
- **Option 3:** Not recommended

---

## Next Steps

**Choose your approach:**
1. I can implement Option 1 (recommended) - removes Firebase Auth from extension
2. Try Option 2 - aggressive tree-shaking
3. Something else?

Let me know and I'll proceed with the fix!
