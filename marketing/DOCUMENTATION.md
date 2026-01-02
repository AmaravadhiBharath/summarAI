# SummarAI Documentation

## How It Works: The Secretary Analogy

### Overview

Think of SummarAI as **your personal AI secretary** who sits in on all your AI conversations and takes perfect notes.

---

## The Problem

You've had a 2-hour conversation with ChatGPT. You made 20 different requests:

```
1. "Make the button red"
2. "Add a login form"
3. "Make the button blue"
4. "Add a navigation bar"
5. "Remove the login form"
6. "Make the button green"
7. "Add a footer"
8. "Make the navbar sticky"
...and 12 more prompts
```

**Question:** What did you actually ask for?

**Answer:** 🤷 You have to scroll through everything to figure it out.

---

## The Solution

SummarAI acts like a **smart secretary** who:

1. **Listens to everything** - Reads all 20 prompts
2. **Takes notes** - Understands what you asked for
3. **Consolidates** - Merges, cancels, and cleans up
4. **Reports back** - Gives you ONE clean summary

---

## How the "Brain" Works

### Architecture

```
┌─────────────────────────────────────────────┐
│ YOU (The CEO)                               │
│ "I need a summary of this conversation"    │
└─────────────────┬───────────────────────────┘
                  │
                  ↓
┌─────────────────────────────────────────────┐
│ EXTENSION (The Secretary)                   │
│ "Let me collect all the meeting notes..."  │
│                                             │
│ 📝 Scrapes all 20 prompts from webpage     │
│ 📦 Packages them into one document         │
│ 📬 Sends to the AI for processing          │
└─────────────────┬───────────────────────────┘
                  │
                  ↓
┌─────────────────────────────────────────────┐
│ AI MODEL (The Brain) 🧠                     │
│ Gemini 2.0 Flash / GPT-4o-mini            │
│                                             │
│ Reads: All 20 prompts                       │
│ Thinks: "Let me consolidate this..."       │
│ Applies: Smart logic (see below)           │
│ Returns: One clean summary                  │
└─────────────────┬───────────────────────────┘
                  │
                  ↓
┌─────────────────────────────────────────────┐
│ EXTENSION (The Secretary)                   │
│ "Here's your executive summary, boss!"     │
│                                             │
│ ✨ Displays the clean summary              │
└─────────────────────────────────────────────┘
```

---

## The Smart Logic

The AI applies **4 core rules** to consolidate your prompts:

### 1. Merge Similar (Deduplication)

**Rule:** Combine requests that mean the same thing.

**Example:**
```
Input:
  "Make the button blue"
  "Change button color to blue"
  "Button should be blue"

AI Logic:
  → All 3 mean the same thing
  → Merge into one

Output:
  "Make the button blue"
```

---

### 2. Cancel Opposites (Conflict Resolution)

**Rule:** If you add something then remove it, cancel both out.

**Example:**
```
Input:
  "Add a login form"
  "Remove the login form"

AI Logic:
  → Add + Remove = Net Zero
  → Cancel both instructions

Output:
  (Nothing - they canceled each other)
```

---

### 3. Latest Wins (Temporal Ordering)

**Rule:** When there are conflicting instructions, the most recent one wins.

**Example:**
```
Input:
  "Make button red"
  "Make button blue"
  "Make button green"

AI Logic:
  → All refer to the same button color
  → Latest instruction (green) wins
  → Previous ones are superseded

Output:
  "Make the button green"
```

---

### 4. Net Result (State Calculation)

**Rule:** Calculate the final state from a series of changes.

**Example:**
```
Input:
  "Add 5 items to cart"
  "Remove 2 items"
  "Add 3 more items"

AI Logic:
  → 5 - 2 + 3 = 6
  → Calculate net result

Output:
  "Add 6 items to cart"
```

---

## Multi-Entity Tracking

The AI can track **multiple objects** with **multiple properties** simultaneously.

### Example: 3 Buttons, 3 Colors

**Input:**
```
1. "Make the login button red"
2. "Make the submit button blue"
3. "Make the cancel button green"
4. "Actually, make the login button blue"
5. "Remove the submit button"
```

**AI Processing:**

| Step | Login Button | Submit Button | Cancel Button |
|------|-------------|---------------|---------------|
| 1    | ✅ Red      | -             | -             |
| 2    | ✅ Red      | ✅ Blue       | -             |
| 3    | ✅ Red      | ✅ Blue       | ✅ Green      |
| 4    | ✅ **Blue** | ✅ Blue       | ✅ Green      |
| 5    | ✅ Blue     | ❌ Removed    | ✅ Green      |

**Output:**
```
- Make the login button blue
- Make the cancel button green
```

*(Submit button was added then removed, so it's canceled out)*

---

## Technical Details

### What Gets Sent to the AI?

**ALL your prompts in ONE request:**

```json
{
  "content": "User: Make button red\n\nUser: Add login form\n\nUser: Make button blue\n\n...(all 20 prompts)",
  "provider": "google",
  "options": {
    "format": "paragraph",
    "tone": "normal",
    "includeAI": false
  }
}
```

### The System Prompt

The AI receives these instructions:

```
You are a "Strict Prompt Consolidator"

CRITICAL RULES:
1. Merge Similar: Combine related requests
2. Cancel Opposites: "Add X" then "Remove X" = omit
3. Net Result: "Add 3" -> "Remove 1" = "Include 2"
4. Latest Wins: If conflicting, use most recent

MODE: Prompt-Only (summarize user's intent, don't answer questions)
FORMAT: Paragraph
TONE: Normal
```

### Processing Time

- **Scraping:** ~100ms (reads webpage)
- **AI Processing:** ~1-2 seconds (consolidates all prompts)
- **Display:** ~50ms (shows summary)
- **Total:** ~2-3 seconds for any conversation length

---

## Use Cases

### 1. Long ChatGPT Sessions

**Before:**
- 50 prompts over 2 hours
- Can't remember what you asked
- Have to scroll through everything

**After:**
- Click "Generate Summary"
- Get clean list of final requests
- Copy and paste into new chat

---

### 2. Code Reviews

**Before:**
```
"Add error handling"
"Fix the login bug"
"Add validation"
"Remove error handling"
"Add better error handling"
"Fix the signup bug too"
```

**After:**
```
"Add better error handling, fix login and signup bugs, add validation"
```

---

### 3. Design Iterations

**Before:**
```
"Make header blue"
"Add logo"
"Make header red"
"Make logo bigger"
"Make header green"
"Remove logo"
```

**After:**
```
"Make header green"
```
*(Logo was added then removed = canceled)*

---

## FAQ

### Q: Does it use the DOM?

**A:** Only for scraping the text. The AI consolidation happens in pure text processing - no DOM involved.

### Q: Do all 20 prompts reach the AI?

**A:** Yes! All prompts are sent in ONE request. The AI reads everything and consolidates.

### Q: Where does the "brain" live?

**A:** The AI model (Gemini 2.0 Flash or GPT-4o-mini) runs on Google's or OpenAI's servers.

### Q: Is my data private?

**A:** Yes. We only send the text content to the AI for processing. No data is stored on our servers.

### Q: How much does it cost?

**A:** Free tier: 3 summaries/day (guest), 14/day (signed in). Pro: Unlimited.

---

## API Reference

### `generateSummary(content, options, provider)`

Sends content to AI for consolidation.

**Parameters:**
- `content` (string): All prompts combined
- `options` (object): Format, tone, includeAI settings
- `provider` (string): 'auto', 'google', or 'openai'

**Returns:**
- Promise<string>: Consolidated summary

**Example:**
```javascript
const summary = await generateSummary(
  "Make button red\nMake button blue\nMake button green",
  { format: 'paragraph', tone: 'normal' },
  'auto'
);
// Returns: "Make the button green"
```

---

## Advanced Topics

### Custom Prompts

You can add "Additional Info" to guide the AI:

```
Additional Info: "Focus on UI changes only"

Prompts:
  "Fix the database bug"
  "Make button blue"
  "Optimize queries"
  "Add navbar"

Summary:
  "Make button blue and add navbar"
  (Database and query changes ignored per your instruction)
```

### Image Analysis

If enabled, the AI can analyze images in the conversation:

```
Prompts + Images:
  "What's in this screenshot?" [image of login form]
  "Make it look better"

Summary:
  "Improve the login form design (currently has username/password fields and a blue submit button)"
```

---

## Troubleshooting

### "No summary generated"

**Cause:** Page content couldn't be scraped  
**Solution:** Refresh the page and try again

### "Summary is too generic"

**Cause:** AI couldn't find specific requests  
**Solution:** Use "Additional Info" to guide the AI

### "Summary includes removed items"

**Cause:** Removal instruction wasn't clear  
**Solution:** Be explicit: "Remove the X" not "Delete it"

---

## Conclusion

SummarAI is your **AI secretary** that:
- 📝 Collects all your prompts (even 20+)
- 🧹 Removes duplicates automatically
- ✨ Resolves conflicts intelligently
- 📊 Gives you ONE clean summary

**No more scrolling. No more confusion. Just clean summaries.**

---

## Support

- 📧 Email: support@summarai.com
- 🐛 Report Issues: https://forms.gle/N9VJY9Cb2F8v2VHF6
- 📖 Docs: https://docs.summarai.com
- 💬 Discord: https://discord.gg/summarai

---

*Last updated: December 2025*
