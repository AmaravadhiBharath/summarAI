# 27 Supported Sites - Adapter Coverage Report

**Date:** 2026-01-02
**Status:** 🟡 **PARTIAL COVERAGE**

---

## **Current Adapter Coverage**

### **✅ Sites with Dedicated Adapters (12)**

1. ✅ **ChatGPT** - `chatgpt.adapter.ts` (chatgpt.com, openai.com)
2. ✅ **Claude** - `claude.adapter.ts` (claude.ai)
3. ✅ **Gemini** - `gemini.adapter.ts` (gemini.google.com)
4. ✅ **Perplexity** - `perplexity.adapter.ts` (perplexity.ai)
5. ✅ **Figma** - `figma.adapter.ts` (figma.com)
6. ✅ **Meta AI** - `meta-ai.adapter.ts` (meta.ai)
7. ✅ **Lovable** - `lovable.adapter.ts` (lovable.dev)
8. ✅ **Emergent** - `emergent.adapter.ts` (app.emergent.sh)
9. ✅ **Rocket** - `rocket.adapter.ts` (rocket.new)
10. ✅ **Bolt** - `bolt.adapter.ts` (bolt.new)
11. ✅ **Base44** - `base44.adapter.ts` (base44.com)
12. ✅ **Generic** - `generic.adapter.ts` (fallback for all others)

---

### **🟡 Sites Using Generic Adapter (15)**

These sites don't have dedicated adapters and fall back to the generic scraper:

13. 🟡 **Visily** - visily.ai
14. 🟡 **Uizard** - uizard.io
15. 🟡 **UX Magic** - uxmagic.ai
16. 🟡 **Banani** - banani.co
17. 🟡 **Create XYZ** - create.xyz
18. 🟡 **Memex** - memex.tech
19. 🟡 **BuildFire** - buildfire.com
20. 🟡 **Glide** - glideapps.com
21. 🟡 **Flatlogic** - flatlogic.com
22. 🟡 **Retool** - retool.com
23. 🟡 **UI Bakery** - uibakery.io
24. 🟡 **Zoho** - zoho.com
25. 🟡 **Appy Pie** - appypie.com

**Note:** OpenAI (openai.com) uses ChatGPTAdapter

---

## **Total Count**

- **Supported Sites**: 26 sites (27 including both chatgpt.com and openai.com)
- **Dedicated Adapters**: 11 (+ 1 generic fallback)
- **Generic Fallback**: 15 sites

---

## **Why Generic Adapter Works for Most Sites**

The **Generic Adapter** is a robust fallback that:

1. ✅ Extracts text from `main`, `article`, or `body`
2. ✅ Has multiple fallback strategies:
   - Chat container detection (`[class*="chat"]`, `[class*="conversation"]`)
   - Body text extraction
   - Deep query all elements (Shadow DOM support)
   - Desperate mode: grab all `<p>`, `<div>`, `<span>`, headers
   - Ultimate fallback: `document.body.innerText`

3. ✅ Works for:
   - Static websites
   - React/Vue/Angular apps
   - Shadow DOM applications
   - No-code platforms with text editors

---

## **Gemini Error Investigation**

If you're seeing Gemini errors, it's likely **NOT** an adapter issue but one of these:

### **1. API Model Issue**
- ❌ If using `gemini-2.5-flash` (not stable)
- ✅ Should use `gemini-2.0-flash` (stable) ← **ALREADY FIXED**

### **2. Empty Content Issue**
- Gemini adapter might be filtering TOO aggressively
- Result: Empty content sent to backend
- Backend error: "No content provided to summarize"

### **3. Shadow DOM Extraction Failure**
- Gemini uses Shadow DOM with `<user-query>` and `<model-response>` tags
- If extraction fails, you get no content

---

## **Common Error Patterns**

### **Error 1: "No content found to summarize"**
**Cause:** Adapter returned empty array  
**Solution:** Check console logs for what was scraped

### **Error 2: "Google API Error (Gemini 2.0): ..."**
**Cause:** Backend API issue (model name, quota, or auth)  
**Solution:** Check backend logs in Cloudflare

### **Error 3: "Failed to scrape content. Refresh the page and try again."**
**Cause:** Content script not injected or message timeout  
**Solution:** Reload the page

---

## **Recommended Fix Strategy**

Since you said "still seeing Gemini errors," let's debug systematically:

### **Step 1: Test on Different Platforms**

Test the extension on:
1. ✅ **ChatGPT** (chatgpt.com) - Has dedicated adapter
2. ✅ **Gemini** (gemini.google.com) - Has dedicated adapter
3. ✅ **Claude** (claude.ai) - Has dedicated adapter
4. 🟡 **Visily** (visily.ai) - Uses generic adapter
5. 🟡 **Retool** (retool.com) - Uses generic adapter

**Expected:**
- Sites with dedicated adapters should work perfectly
- Sites with generic adapter should work for most text-based content

---

### **Step 2: Check Console Logs**

When you click "Generate Summary," check your browser console:

```
Tiger: Scraper Response: {
  conversation: [...],
  rawText: "...",
  platform: "gemini"
}
```

**If `conversation` is empty:**
- Adapter is filtering too aggressively
- Need to relax Gemini adapter filters

**If `rawText` is empty:**
- Page has no extractable content
- Shadow DOM issue

---

### **Step 3: Gemini-Specific Debug**

For Gemini specifically, the adapter has VERY aggressive filtering to avoid AI responses. Let me check if it's TOO aggressive.

**Current Gemini Adapter Rules:**
- ❌ Skip if contains "once upon a time"
- ❌ Skip if contains "one bright sunny day"
- ❌ Skip if starts with "here is", "sure, i can"
- ❌ Skip if longer than 200 chars without user verbs

**This might be excluding valid user prompts!**

---

## **Quick Fix Options**

### **Option A: Relax Gemini Filters** (if seeing "No content" errors)
Remove the overly aggressive filters from `gemini.adapter.ts`

### **Option B: Add Console Debugging** (to see what's being scraped)
Add `console.log` statements to see scraped content

### **Option C: Use OpenAI Instead of Gemini** (temporary workaround)
Change provider to 'openai' in settings to avoid Gemini API errors

---

## **Action Required**

**To help you fix this, I need to know:**

1. **What is the exact error message you're seeing?**
   - "No content found to summarize"?
   - "Google API Error: [details]"?
   - "Failed to scrape content"?
   - Something else?

2. **Which specific site(s) are you testing on?**
   - Gemini (gemini.google.com)?
   - ChatGPT?
   - One of the generic adapter sites?

3. **What does the browser console say?**
   - Open DevTools (F12)
   - Check Console tab
   - Look for "Tiger: Scraper Response"

**Once I know these details, I can provide a precise fix!**

---

## **Temporary Workaround**

If Gemini errors are blocking you:

1. Open extension popup
2. Click Settings icon
3. Change Provider from "Auto" to "OpenAI"
4. Try generating again

This bypasses Gemini API entirely and uses OpenAI's GPT-4o-mini instead.

---

**Bottom Line:** The generic adapter covers all 27 sites. If you're seeing errors, it's likely:
- Gemini adapter filtering too aggressively (if on gemini.google.com)
- Backend API issue (if error mentions "Google API Error")
- Content script injection issue (if error mentions "connection")

**Please share the exact error message so I can fix it precisely!** 🔍
