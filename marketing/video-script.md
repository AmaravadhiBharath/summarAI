# Video Script: Tiger Extension - Bridging the AI Context Gap

**Duration:** 90-120 seconds  
**Target Audience:** Power AI users, SDEs, Investors  
**Tone:** Professional, technical, problem-solving

---

## ACT 1: THE PROBLEM (0:00 - 0:25)

### VISUAL: Screen recording of a user working with ChatGPT/Gemini

**VOICEOVER:**

*"You've been working with AI for hours. Iterating. Refining. Building something incredible."*

### VISUAL: User scrolling through a massive conversation thread (300+ messages)

*"But then you need to share your work. Onboard a teammate. Document your process."*

### VISUAL: User frantically scrolling, trying to remember what they asked for

*"And you realize... you have no idea what you actually built."*

### VISUAL: Split screen showing:
- Left: Messy conversation with contradictions ("Add 3 buttons" → "Remove 2 buttons" → "Make them blue" → "Actually, make them red")
- Right: User confused, copy-pasting everything into a doc

**TEXT OVERLAY:** *"Current AI tools lose context. You lose time."*

---

## ACT 2: THE TECHNICAL GAP (0:25 - 0:45)

### VISUAL: Code-style animation showing the problem

**VOICEOVER:**

*"Here's what's happening under the hood:"*

### VISUAL: Animated diagram showing:
```
Traditional Approach:
User Prompt 1 → AI Response 1
User Prompt 2 → AI Response 2
User Prompt 3 → AI Response 3
...
User Prompt 47 → AI Response 47

Result: 94 messages. Zero compression. Pure chaos.
```

**VOICEOVER:**

*"AI platforms give you the conversation. But not the conclusion."*

### VISUAL: Mathematical notation appearing:

```
Net Effect = Final Intent - Contradictory Steps
```

**VOICEOVER:**

*"They don't understand net effect. They can't compress iterative logic."*

### VISUAL: Example showing:
- Input: "Add feature A" → "Remove feature A" → "Add feature B"
- What you need: "Add feature B"
- What you get: *[entire conversation dump]*

**TEXT OVERLAY:** *"The gap: No semantic compression. No intent extraction."*

---

## ACT 3: THE SOLUTION (0:45 - 1:15)

### VISUAL: Tiger extension logo animation

**VOICEOVER:**

*"Tiger is the missing layer between you and your AI."*

### VISUAL: Extension in action - clean UI, one-click summary

**VOICEOVER:**

*"It scrapes your conversation in real-time using Chrome's native scripting API."*

### VISUAL: Technical diagram showing the architecture:

```
┌─────────────────┐
│   Your Browser  │
│  (ChatGPT/Gemini)│
└────────┬────────┘
         │ chrome.scripting.executeScript
         ▼
┌─────────────────┐
│  Tiger Engine   │
│  • DOM Parser   │
│  • Filter Logic │
│  • Net Effect   │
└────────┬────────┘
         │ Cloudflare Worker (Secure Proxy)
         ▼
┌─────────────────┐
│   GPT-4o-mini   │
│  (Compression)  │
└────────┬────────┘
         │
         ▼
    Clean Summary
```

**VOICEOVER:**

*"Then applies arithmetic logic to your prompts."*

### VISUAL: Animation showing the compression:

**Before:**
```
1. "Write a story about a dog"
2. "Add 3 mangoes to the story"
3. "Remove 1 mango"
4. "Make the dog a cat"
5. "Actually, keep it a dog"
```

**After (Tiger Summary):**
```
"A story about a dog that includes 
two mangoes as narrative elements."
```

**VOICEOVER:**

*"Final intent wins. Contradictions eliminated. Context preserved."*

### VISUAL: Format options appearing (TXT, JSON, XML)

**VOICEOVER:**

*"Export as structured data. JSON for your APIs. XML for your workflows."*

---

## ACT 4: THE TECHNICAL EDGE (1:15 - 1:35)

### VISUAL: Code snippets and architecture highlights

**VOICEOVER:**

*"Built for engineers, by engineers."*

### VISUAL: Feature callouts appearing:

**1. Manifest V3 Compliant**
- No remote code execution
- Service worker architecture
- CSP-hardened security

**2. Hybrid API Model**
- Secure proxy via Cloudflare Workers
- BYO API key support for power users
- Zero vendor lock-in

**3. Intelligent Filtering**
- Checkbox logic: Prompts only vs. Full conversation
- Visual context extraction (images, diagrams)
- Multi-platform support (ChatGPT, Gemini, Claude)

**4. Content-Focused Voice**
- No meta-talk ("The user asked for...")
- Imperative framing ("A request to...")
- Third-person objective tone

**VOICEOVER:**

*"We use GPT-4o-mini at 0.7 temperature for balanced creativity. Cloudflare Workers for sub-100ms latency. And Firebase Auth for enterprise-grade security."*

### VISUAL: Performance metrics:

```
⚡ <100ms API response time
🔒 Zero API key exposure
📊 Structured output (JSON/XML)
♾️  Unlimited with BYO key
```

---

## ACT 5: THE IMPACT (1:35 - 1:50)

### VISUAL: Split screen showing use cases:

**Left Panel - Developer:**
- Exporting ChatGPT code review as JSON
- Importing into Jira ticket
- Team instantly understands context

**Right Panel - Product Manager:**
- Summarizing 500-message product spec conversation
- Sharing clean brief with stakeholders
- Zero back-and-forth

**VOICEOVER:**

*"For developers: Turn AI conversations into documentation. For teams: Share context, not chaos. For investors: This is the infrastructure layer AI has been missing."*

---

## ACT 6: THE CALL TO ACTION (1:50 - 2:00)

### VISUAL: Tiger logo with download button

**VOICEOVER:**

*"Tiger. The AI context layer that actually understands what you built."*

### VISUAL: Text appearing:

```
🚀 Available on Chrome Web Store
🔓 Free tier: 5 summaries/day
⚡ Pro tier: Unlimited + GPT-4o
🛠️ BYO Key: Full control
```

**VOICEOVER:**

*"Stop losing context. Start shipping faster."*

### VISUAL: URL appearing: **tiger-superextension.com**

**TEXT OVERLAY:** *"Tiger - Your AI, Compressed."*

---

## TECHNICAL NOTES FOR PRODUCTION

### Key Messaging Pillars:
1. **Problem:** AI platforms don't compress iterative conversations
2. **Gap:** No semantic understanding of net effect
3. **Solution:** Real-time scraping + arithmetic logic + structured output
4. **Differentiation:** Manifest V3, Cloudflare Workers, hybrid API model
5. **Impact:** Context preservation for technical teams

### Visual Style:
- **Color Palette:** Dark mode UI, vibrant accent colors (orange/blue gradients)
- **Typography:** Monospace for code, Sans-serif for narration
- **Animation:** Smooth transitions, micro-interactions, data flow diagrams
- **Screen Recordings:** Real Chrome extension in action, not mockups

### Music:
- **Intro (0:00-0:25):** Tense, problem-focused (minor key)
- **Solution (0:45-1:15):** Uplifting, tech-forward (major key, synth)
- **Outro (1:50-2:00):** Confident, call-to-action energy

### Voiceover Tone:
- **Pace:** Moderate (140-160 WPM)
- **Style:** Conversational but authoritative
- **Emphasis:** Technical terms (Manifest V3, Cloudflare Workers, GPT-4o-mini)

---

## INVESTOR-SPECIFIC VARIANT (30-SECOND CUT)

**VOICEOVER:**

*"AI conversations generate millions of messages daily. But there's no compression layer. Tiger extracts net intent from iterative prompts using semantic analysis and arithmetic logic. Built on Cloudflare Workers, Manifest V3 compliant, with a hybrid API model that scales from free users to enterprise. We're the infrastructure layer between humans and AI. The market: 200M+ ChatGPT users. The gap: Context preservation. The solution: Tiger."*

**TEXT OVERLAY:**
```
📊 TAM: 200M+ AI power users
💰 Model: Freemium SaaS
🔧 Tech: Cloudflare + Firebase + OpenAI
🎯 Traction: Chrome Web Store launch Q1 2025
```

---

## SDE-SPECIFIC VARIANT (45-SECOND CUT)

**VOICEOVER:**

*"You know the problem. You've had 300-message ChatGPT sessions where you can't remember what you actually asked for. Tiger solves this with DOM scraping via chrome.scripting.executeScript, arithmetic logic for net effect calculation, and structured output in JSON or XML. We're Manifest V3 compliant, use Cloudflare Workers for secure API proxying, and support BYO keys for zero vendor lock-in. Export your conversations as machine-readable data. Integrate with your CI/CD. Stop copy-pasting. Start automating."*

**TEXT OVERLAY:**
```
✅ Manifest V3 compliant
✅ Cloudflare Workers (sub-100ms)
✅ JSON/XML structured output
✅ BYO API key support
✅ Open-source roadmap
```

---

## SCRIPT METADATA

- **Version:** 1.0
- **Created:** 2025-12-23
- **Target Platforms:** YouTube, LinkedIn, Twitter/X, Product Hunt
- **Aspect Ratios:** 16:9 (YouTube), 1:1 (Social), 9:16 (Stories)
- **Accessibility:** Closed captions required, visual-only segments <5s

---

**END SCRIPT**
