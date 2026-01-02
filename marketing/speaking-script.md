# Tiger Extension - Speaking Script
**For: Demo, Pitch, or Presentation**  
**Duration:** 3-5 minutes  
**Tone:** Conversational, confident, technical but accessible

---

## OPENING (30 seconds)

Hey everyone, I'm [Your Name], and I want to show you something that's been driving me crazy.

*[Open ChatGPT/Gemini with a long conversation]*

So, I've been using AI tools like ChatGPT and Gemini for months now. And I'm sure many of you have too. You start a conversation, you iterate, you refine... and three hours later, you've built something incredible.

*[Scroll through a massive conversation thread]*

But then someone asks you: "Hey, what did you actually build here?"

And you realize... you have no idea. You'd have to scroll through 300 messages to figure it out.

**That's the problem we're solving.**

---

## THE PROBLEM (1 minute)

Here's what's happening. Let's say I'm designing a landing page with ChatGPT.

*[Show example conversation]*

I start with: "Create a hero section with a blue button."

Then I say: "Actually, add three buttons."

Then: "Remove one button."

Then: "Make them red instead of blue."

Then: "Wait, make them orange."

You see where this is going? By the end, I have no clue what the final design actually is. I have to mentally calculate the **net effect** of all these changes.

And current AI tools? They just give you the entire conversation. No compression. No summary. No understanding of what you *actually* want.

**That's a massive gap.**

---

## THE TECHNICAL GAP (1 minute)

Now, for the technical folks in the room, here's why this is hard.

AI platforms like ChatGPT are great at generating responses. But they don't understand **iterative logic**. They don't know that "Add 3, then remove 1" means "Include 2."

They can't compress contradictory instructions. They can't extract final intent from a messy conversation.

So what happens? You end up copy-pasting everything into a Google Doc, manually highlighting the important parts, and trying to make sense of it all.

**That's not scalable. And it's definitely not how engineers should be working.**

---

## THE SOLUTION - TIGER (1.5 minutes)

So we built Tiger. It's a Chrome extension that sits on top of your AI conversations and does three things:

### 1. Real-Time Scraping
It uses Chrome's native scripting API to extract your conversation in real-time. Every prompt you write, every response the AI gives—Tiger sees it all.

### 2. Net Effect Calculation
Then it applies what we call "arithmetic logic." If you said "Add 3 buttons" and then "Remove 1 button," Tiger understands that the final state is "2 buttons." It eliminates contradictions and extracts your final intent.

### 3. Structured Output
And here's the kicker—it doesn't just give you a text summary. You can export as **JSON** or **XML**. Machine-readable, structured data that you can plug directly into your workflows.

*[Show the extension in action]*

So let me show you. I'm going to click "Generate Summary" on this messy conversation.

*[Click button, show the compression happening]*

And in less than 3 seconds, Tiger gives me this:

*[Show clean summary]*

"A landing page hero section with two orange call-to-action buttons."

That's it. No fluff. No "the user asked for..." Just the final intent.

---

## THE TECHNICAL ARCHITECTURE (1 minute)

Now, for the SDEs and investors here, let me talk about how this actually works under the hood.

### Security First
We're **Manifest V3 compliant**. That means no remote code execution, no security vulnerabilities. Everything runs in a sandboxed service worker.

### Hybrid API Model
We use **Cloudflare Workers** as a secure proxy. Your API key never touches the client. It's stored in Cloudflare's encrypted environment, and we handle all the OpenAI calls server-side.

But—if you're a power user and you want full control, you can bring your own API key. Zero vendor lock-in.

### Performance
We're using **GPT-4o-mini** at 0.7 temperature for balanced creativity. Our Cloudflare Workers give us **sub-100ms latency**. And because we're serverless, we scale infinitely.

### Data Formats
We support **TXT, JSON, and XML** exports. For developers, this means you can integrate Tiger summaries directly into your CI/CD pipelines, Jira tickets, or documentation systems.

---

## THE BUSINESS MODEL (30 seconds)

We're launching with a freemium model:

- **Free Tier:** 5 summaries per day with GPT-4o-mini
- **Pro Tier:** Unlimited summaries with GPT-4o and advanced features
- **BYO Key:** Bring your own OpenAI key for full control

Our target market? The **200 million ChatGPT users** who are already power users. Developers, product managers, researchers—anyone who has long AI conversations and needs to extract value from them.

---

## THE IMPACT (30 seconds)

Here's what this means in practice:

**For developers:** You can turn your ChatGPT code reviews into structured JSON and import them directly into Jira.

**For product managers:** You can summarize a 500-message product spec conversation and share a clean brief with stakeholders.

**For teams:** You can finally share *context*, not chaos.

This isn't just a productivity tool. It's the **infrastructure layer** that AI has been missing.

---

## THE DEMO (1 minute)

Let me show you one more example. I'm going to open a real conversation I had with ChatGPT yesterday.

*[Open a real, messy conversation]*

This is a conversation about building a React component. I went back and forth about 50 times—changing the design, adding features, removing features, refactoring the code.

If I wanted to share this with my team, I'd have to spend 20 minutes summarizing it manually.

Instead, I'm going to click "Generate Summary."

*[Click button]*

And here's what Tiger gives me:

*[Show summary]*

"A React component for a user profile card with avatar, name, bio, and a follow button. Uses Tailwind CSS for styling and includes hover animations."

Perfect. That's exactly what I built. And now I can export this as JSON and add it to our component library documentation.

---

## CLOSING (30 seconds)

So that's Tiger. We're launching on the Chrome Web Store in Q1 2025.

If you're an investor, we'd love to talk about how we're building the context layer for the AI era.

If you're a developer, sign up for early access at **tiger-superextension.com**.

And if you're just someone who's tired of losing track of your AI conversations—we built this for you.

**Tiger. Your AI, Compressed.**

Thank you.

---

## Q&A PREP

### Expected Questions:

**Q: How is this different from just asking ChatGPT to summarize the conversation?**  
A: Great question. ChatGPT can summarize, but it doesn't understand net effect. If you tell it "Add 3, remove 1," it'll say "The user added 3 and then removed 1." Tiger says "Include 2." We apply arithmetic logic that ChatGPT doesn't have built-in. Plus, we give you structured output formats.

**Q: What about privacy? Are you storing our conversations?**  
A: No. Everything happens client-side or through our secure Cloudflare Worker. We don't store your conversations. We don't train models on your data. Your prompts go to OpenAI, get summarized, and come back. That's it.

**Q: Why not just build this into ChatGPT?**  
A: We'd love for OpenAI to build this natively! But until they do, we're the bridge. And we work across multiple platforms—ChatGPT, Gemini, Claude. We're platform-agnostic.

**Q: What's your moat?**  
A: Three things: (1) Our net effect algorithm is proprietary. (2) We're Manifest V3 compliant, which is a huge technical lift. (3) We have first-mover advantage in the "AI context compression" category.

**Q: How do you make money?**  
A: Freemium SaaS. Free users get 5 summaries/day. Pro users pay $9/month for unlimited. We also have an enterprise tier for teams that want shared summaries and collaboration features.

**Q: What's your traction?**  
A: We're pre-launch, but we have 200+ beta users from the SDE community. We're targeting Product Hunt launch in January and Chrome Web Store approval by February.

---

## DELIVERY TIPS

### Pacing:
- **Slow down** on technical terms (Manifest V3, Cloudflare Workers)
- **Speed up** on problem statements (everyone knows the pain)
- **Pause** after showing the demo (let it sink in)

### Energy:
- **High energy** on the problem (you're frustrated too!)
- **Calm confidence** on the solution (you've solved it)
- **Excitement** on the demo (this is the cool part)

### Gestures:
- **Point at screen** when showing messy conversations
- **Hands apart** when talking about the "gap"
- **Hands together** when showing the compressed summary

### Eye Contact:
- **Look at audience** during problem statement
- **Look at screen** during demo
- **Look at audience** during closing

---

**END SCRIPT**

Good luck! 🚀
