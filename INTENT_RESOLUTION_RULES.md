# Complete 21-Rule Intent Resolution System

**Version:** v30 - Enhanced System Prompt  
**Status:** ✅ Fully Implemented  
**Last Updated:** 2026-01-02

---

## 📋 Complete Rule List

### **═══════════════════════════════════════════════════════════════════**
### **FOUNDATIONAL RULES (1-7): Intent Extraction & State Management**
### **═══════════════════════════════════════════════════════════════════**

#### **1. FINAL STATE RULE**
Always output the final resolved state of all instructions. Ignore the conversational journey.
- **What it IS:** A single source of truth. "If I start fresh, what exactly should I build?"
- **What it is NOT:** A chat recap, a transcript, or a reasoning log.
- **Rule:** Do not mention "User changed X to Y". Just state **Y**.

#### **2. OVERRIDE SUPREMACY RULE**
If instructions conflict, the latest explicit instruction wins. Remove all earlier conflicting information completely.
- **Latest Wins:** Later messages represent newer intent.
- **Superseded:** "Make background white" → "Change to black" = **Black** (White is removed).
- **Reverted:** "Add dark mode" → "No, remove dark mode" = **Nothing** (Both removed).

#### **3. SINGLE-MENTION PRESERVATION RULE (PARANOID RECALL)**
Any noun, constraint, or requirement mentioned even once must be preserved unless explicitly overridden.
- If a detail is mentioned **ONLY ONCE** and not overridden, **KEEP IT**.
- **DATA PRESERVATION (CRITICAL)**: Specific data values (Phone Numbers, Emails, URLs, API Keys, IDs, Codes, Addresses, Names) are **ALWAYS INTENT**. Never drop them.
- **TECHNICAL CONTEXT IS INTENT**: Code snippets, JSON objects, data structures, and error messages are NOT noise. They are the *substance* of the intent. Preserve them.
- Dropping a unique fact or value is a failure.

#### **4. DEDUPLICATION WITHOUT LOSS RULE (STRUCTURAL MERGING)**
If the same idea appears multiple times, include it only once, preserving full meaning.
- **Rule:** Merge instructions that target the same object/attribute. We merge MEANING, not sentences.
- *Input:* "Add blue button... Make it larger... Change to red."
- *Output:* "Add a large red button." (Merged structurally).

#### **5. IMPLICIT CONFIRMATION RULE**
If the user continues without rejecting a prior instruction, treat it as accepted.

#### **6. META-LANGUAGE IGNORING RULE (SOFT LANGUAGE = STRONG INTENT)**
Ignore conversational fillers and uncertainty phrases (e.g., "I think", "maybe", "it seems"). Extract only actionable intent.
- Users do not speak in code. Treat these as EQUIVALENT:
  - "Update this to class 5"
  - "This kid is class 5 it seems"
  - "Oh, he's actually in class 5"
- **Rule:** All three mean **Override Grade → Class 5**. Soft language is NOT weak intent.
- **CONTEXT (DISCARD):** Information that helps interpret intent but is not an instruction. Explanations, realizations, background thinking.
  - *Example:* "I think this kid is class 5", "Oh no, this won't work", "Actually, I realized...".
  - **Rule:** Context modifies intent (e.g., triggers an update) but does NOT appear verbatim in the final summary.

#### **7. CLARIFICATION RESOLUTION RULE**
Clarifications replace earlier ambiguous instructions. Treat them as state updates, not additions.

---

### **═══════════════════════════════════════════════════════════════════**
### **CONSTRAINT RULES (8-12): Boundaries & Precision**
### **═══════════════════════════════════════════════════════════════════**

#### **8. NEGATIVE CONSTRAINT RULE**
Explicit exclusions (e.g., "no", "don't", "avoid") are hard constraints and must be preserved exactly.

#### **9. SCOPE LOCK RULE** ⭐ *NEW*
Once scope is fixed (audience, platform, format, context), do not expand or generalize it unless explicitly instructed.
- If user says "for class 5 students", do NOT generalize to "for students" or "for children".
- If user says "ChatGPT conversation", do NOT expand to "AI conversation" unless instructed.

#### **10. INSTRUCTION OVER EXPLANATION RULE**
Instructions override explanations. Informal phrasing may still represent a valid command.

#### **11. LATEST SPECIFICITY WINS RULE** ⭐ *NEW*
More specific instructions override earlier generic ones.
- "Make it blue" → "Make it navy blue" = **Navy blue** (not just "blue").

#### **12. NO ASSUMPTION RULE**
Do not infer missing information. If something is not stated, omit it.
- **SAFETY CLAUSE:** If the user's conversation does NOT mention a specific topic, do NOT invent or add it. Only summarize what the user actually discussed.

---

### **═══════════════════════════════════════════════════════════════════**
### **OUTPUT QUALITY RULES (13-18): Clean, Dense, Coherent**
### **═══════════════════════════════════════════════════════════════════**

#### **13. OUTPUT-ONLY RULE**
Describe what should exist, not how the conversation evolved.
- **Action Execution:** If user says "Replace X with Y", **EXECUTE** it. Output "Y". Do not say "Replace X with Y".
- **STRUCTURAL EXECUTION (INTEGRATED)**: If user says "Separate into A and B" or "Group by X":
  - **DO NOT** repeat the instruction "Separate into...".
  - **DO** integrate the structure directly into the sentence.
  - *Input:* "Include apples and cars. Separate into fruits and vehicles."
  - *Output:* "Include fruits (apples) and vehicles (cars)." (Integrated).
  - *BAD Output:* "Include apples and cars. Separate them." (Repeated instruction).

#### **14. TEMPORAL IRRELEVANCE RULE** ⭐ *NEW*
Remove conversational time references such as "earlier", "now", or "later".

#### **15. TONE NEUTRALIZATION RULE** ⭐ *NEW*
Remove emotional tone from the INPUT conversation (e.g., "I'm so excited!", "This is frustrating").
- **Note:** Still apply the OUTPUT tone setting chosen by user (professional/creative/normal).

#### **16. STRUCTURAL COHERENCE RULE** ⭐ *NEW*
The final summary must read as if written once, with clean sentence structure and logical flow.
- Avoid choppy, disconnected sentences.
- Group related information together.

#### **17. INTENT DENSITY RULE** ⭐ *NEW*
Every sentence must add new, necessary information.
- If removing a sentence does not change understanding, remove it.
- No redundancy, no filler.

#### **18. CROSS-PROMPT CONSOLIDATION RULE** ⭐ *NEW*
If multiple prompts relate to the same task, merge them into one unified intent.
- Don't list separate tasks if they're all part of one larger goal.

---

### **═══════════════════════════════════════════════════════════════════**
### **META RULES (19-21): Authority & Self-Sufficiency**
### **═══════════════════════════════════════════════════════════════════**

#### **19. USER AUTHORITY RULE**
User instructions always override AI suggestions or interpretations.

#### **20. ZERO-HISTORY EXPOSURE RULE** ⭐ *NEW*
The summary must be fully understandable without access to the conversation. Do not reference changes, corrections, or history.
- Never say "updated to", "changed from", "corrected to", "as mentioned earlier".
- Just state the final value.

#### **21. CONTEXT INJECTION RULE** ⭐ *NEW*
If a global context (event, time, setting) applies to most facts, inject it into the first relevant sentence instead of stating it separately.
- *Input:* "It's Diwali. Add lights. Add diyas. Add rangoli."
- *Output:* "Create a Diwali scene with lights, diyas, and rangoli." (Context injected).
- *BAD Output:* "The event is Diwali. Add lights, diyas, and rangoli." (Context stated separately).

---

## 📊 Implementation Summary

### ✅ **Previously Compliant (14 rules)**
Rules 1, 2, 3, 4, 5, 6, 7, 8, 10, 12, 13, 14, 15, 19

### ⭐ **Newly Added (7 rules)**
- **Rule 9:** Scope Lock Rule
- **Rule 11:** Latest Specificity Wins Rule
- **Rule 14:** Temporal Irrelevance Rule
- **Rule 15:** Tone Neutralization Rule
- **Rule 16:** Structural Coherence Rule
- **Rule 17:** Intent Density Rule
- **Rule 18:** Cross-Prompt Consolidation Rule
- **Rule 20:** Zero-History Exposure Rule
- **Rule 21:** Context Injection Rule

### 🔧 **Integration Strategy**
- All 21 rules are now integrated into the backend AI prompt
- No conflicts with existing functionality
- Tone settings (professional/creative/normal) preserved
- Format settings (paragraph/points/JSON/XML) preserved
- User instructions (additionalInfo) preserved

---

## 🎯 Core Philosophy

**"You are compiling intent, not summarizing text."**

The system now operates as a true **Intent-Resolution Engine** that:
1. Extracts final state from conversational noise
2. Preserves all critical data without loss
3. Produces clean, dense, standalone summaries
4. Respects user authority and preferences
5. Outputs implementation-ready specifications

---

## 🚀 Deployment Status

✅ **Backend Updated:** `/backend/src/index.js`  
✅ **Version:** v30 - Complete 21-Rule Intent Resolution Engine  
✅ **Deployed To:** Cloudflare Workers  
✅ **Live URL:** `https://tai-backend.amaravadhibharath.workers.dev`

---

## 📝 Testing Examples

### Example 1: Diwali Scene
**Input:**
```
It's Diwali. Add lights. Add diyas. Add rangoli. Make it colorful.
```

**Expected Output (Rule 21 - Context Injection):**
```
Create a colorful Diwali scene with lights, diyas, and rangoli.
```

### Example 2: Name Preservation
**Input:**
```
J.reed's jacket is red, G.reed's shirt is red, and Jr.J.reed's towel is white. 
J is Joseph and G is George.
```

**Expected Output (Rule 3 - Single-Mention Preservation):**
```
Joseph Reed's jacket is red, George Reed's shirt is red, and Joseph Reed Jr.'s towel is white.
```

### Example 3: Override Supremacy
**Input:**
```
Make the button blue. Actually, make it navy blue. Add a border.
```

**Expected Output (Rule 2 & 11 - Override + Latest Specificity):**
```
Add a navy blue button with a border.
```

---

## 🔍 Quality Metrics

The enhanced system now ensures:
- **Zero Data Loss:** All mentioned details preserved (Rule 3)
- **Clean Output:** No conversational artifacts (Rules 13, 14, 20)
- **Dense Content:** Every sentence adds value (Rule 17)
- **Coherent Flow:** Reads as single document (Rule 16)
- **Scope Precision:** No unwanted generalization (Rule 9)
- **Context Integration:** Global context injected naturally (Rule 21)

---

*Last Updated: 2026-01-02 22:30 IST*
