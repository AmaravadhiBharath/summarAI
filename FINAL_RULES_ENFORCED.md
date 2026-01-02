# ✅ FINAL RULES ENFORCED

**Date:** 2026-01-02
**Status:** 🔒 **STRICT COMPLIANCE**

---

## **1. "User-Only" Means USER ONLY**
**Rule:** "When no checkbox is checked... only and only USER data... no data from web... no data from AI response."

### **Implementation:**
- **Frontend (Scraper):**
  - `gemini.adapter.ts`: Targets `<user-query>` tags only.
  - `processor.ts`: Filters out any message where `role !== 'user'`.
- **Backend (API):**
  - **Web Search:** `shouldSearch` is **FORCED TO FALSE** when `includeAI` is false.
    - *Even if user types "search google", it will NOT search.*
  - **AI Response:** The prompt instructs the AI to "IGNORE PREVIOUS AI SUMMARIES" and "Focus ONLY on the User's imperative commands".

---

## **2. Intelligent Consolidation**
**Rule:** "Removal of duplicates... 8th prompt overriding 3rd... omit 3rd prompt detail... final intent."

### **Implementation:**
- **System Prompt:** "Context Consolidator" (Golden Backup v29)
- **Algorithm:**
  1.  **Identify Evolution:** Treat conversation as a timeline.
  2.  **Conflict Resolution:** "Later instructions **OVERRIDE** earlier ones."
  3.  **Topic Persistence:** "Core subject **MUST ALWAYS BE INCLUDED**."
  4.  **Clean State:** "Strip away the back-and-forth."

**Example Handling:**
- *Input:* "Add blue button" (Prompt 3) ... "Actually make it red" (Prompt 8)
- *Output:* "Add red button" (Blue is omitted).

---

## **3. Format & Readability**
**Rule:** "Default para format... readable for users and next AI."

### **Implementation:**
- **Default Format:** "Single well-structured paragraph".
- **Style:** "Professional, clear, and grammatically correct instructions."
- **Goal:** "Master Context Summary" ready to be pasted into a new chat or sent to a co-founder.

---

## **4. Powerful Gemini API**
**Rule:** "Done with powerful gemini API."

### **Implementation:**
- **Model:** `gemini-2.0-flash` (Google's latest stable efficient model).
- **Routing:** Automatically selected for large contexts (>50k chars) or when Gemini is the provider.

---

## **Verification**

The system is now **locked down** to these rules.
- **Backend Version:** `688b652a-462a-47d8-a404-fd2cfd451aa3`
- **Frontend Version:** `v28` (Shadow DOM Fix)

You can proceed with confidence. 🚀
