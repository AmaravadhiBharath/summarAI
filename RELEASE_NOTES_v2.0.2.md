# 🚀 Release Notes: SummarAI v2.0.2 (Logic Overhaul)

**Date:** 2026-01-02
**Backend Version:** v43 (Production)
**Extension Version:** v2.0.2

---

## **🧠 1. Smart Logic Improvements (The "Brain")**

We moved from a "Summarizer" to an **"Intent Architect"**.

### **A. Core Philosophy**
*   **Old:** "Report what the user said." -> *Result:* "User mentioned a red jacket."
*   **New:** "Reconstruct the final state." -> *Result:* "Red jacket."

### **B. New Rules (Hard-Coded)**
1.  **Paranoid Recall:**
    *   *Rule:* "Dropping a user fact is a CRITICAL FAILURE."
    *   *Effect:* Even single-mention details are preserved.
2.  **Global State Reset:**
    *   *Rule:* "This is [Time/Occasion]" acts as an **Assignment (=)**, not Addition (+=).
    *   *Effect:* "It is Christmas... It is Diwali" -> **"It is Diwali"** (Christmas is deleted).
3.  **Action Execution:**
    *   *Rule:* "Execute, Don't Repeat."
    *   *Effect:* "Replace breakfast with lunch" -> **"Lunch set"** (Instruction is removed, result is kept).
4.  **Context Separation:**
    *   *Rule:* "Do not force-merge context."
    *   *Effect:* "School... It is winter" (Keeps them distinct, doesn't say "School during winter").

---

## **🛠 2. Technical Fixes (The "Body")**

1.  **Gemini Shadow DOM:**
    *   Fixed the "My stuff Gems" error by using `deepQuerySelectorAll`.
    *   Now captures **100% of prompts** (verified).
2.  **Prompt Counter:**
    *   Added a Toast Notification: **"Analyzed X prompts"** 🔍.
    *   Gives users immediate confidence that their data is being processed.

---

## **⚡️ 3. "Over-the-Air" Updates**
*   **Logic lives in Cloudflare:** You can update `backend/src/index.js` and run `npx wrangler deploy`.
*   **Instant Effect:** All users get the new logic in **<10 seconds**.
*   **No Store Review:** No need to resubmit to Chrome Web Store for logic tweaks.

---

## **📂 Files**
*   **Upload to Store:** `tiger-published-v2.0.2.zip`
*   **Manual:** `HOW_TO_TRAIN_LOGIC.md`
