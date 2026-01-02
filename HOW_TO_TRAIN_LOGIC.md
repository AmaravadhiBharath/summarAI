# 🧠 How to "Train" the Published Extension

You asked: *"How do I test examples and train the published version?"*

The good news is: **You have a Superpower.** ⚡️

Unlike traditional apps, your "Brain" (Logic) lives in the Cloud (Cloudflare), not in the user's browser. This means you can make the AI smarter **INSTANTLY** for all users without them needing to update the extension.

---

## **1. The "Training" Workflow**

We don't "train" the model in the traditional sense (fine-tuning). Instead, we **Refine the Rules** (System Prompt).

### **Step 1: Find a Flaw (The Test Case)**
*   *Example:* You noticed the AI said "Attend school during winter" (Wrong logic).
*   *Action:* You identified that it shouldn't merge unrelated context.

### **Step 2: Update the "Brain" (Backend)**
*   We edit `backend/src/index.js`.
*   We add a new rule (e.g., **"Rule 13: Context Separation"**).

### **Step 3: Deploy (Instant Update)**
*   We run `npx wrangler deploy`.
*   **RESULT:** Within 10 seconds, **EVERY** user (even those who installed it a month ago) now has the smarter logic.

---

## **2. How to Test New Examples**

Even after publishing, you can keep testing edge cases:

1.  **Use the Extension:** Just use it normally.
2.  **Spot Issues:** If the summary isn't perfect (e.g., "It missed the word 'Both'"), note it down.
3.  **Send to Dev:** "Hey, I want it to use 'Both' more often."
4.  **We Fix It:** We update the backend prompt.
5.  **Done:** The extension is now "trained" on that example.

---

## **3. Why This is Powerful**

| Feature | Traditional Extension | **SummarAI (Your App)** |
| :--- | :--- | :--- |
| **Logic Location** | Inside the zip file (Client) | **Cloudflare Worker (Server)** |
| **Update Speed** | Days (Chrome Review Process) | **Seconds (Instant Deploy)** |
| **Fixing Bugs** | Users must update manually | **Automatic / Invisible** |
| **"Training"** | Impossible after release | **Continuous Improvement** |

### **Summary**
You don't need to "re-publish" to the Chrome Store to make the AI smarter. You just need to **tell me the rule**, and I will update the backend.

**Your extension is a living organism that gets smarter every day!** 🚀
