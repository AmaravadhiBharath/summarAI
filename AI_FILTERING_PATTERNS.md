# AI Content Filtering - Pattern Reference

This document lists all the patterns that SummarAI filters out when "Include AI Responses" is OFF.

## What Gets Filtered (AI Content)

### 1. Meta-Instructions (Story Generation Requests)
These are instructions **about** creating content, not the actual user request:
- ❌ "should be written about..."
- ❌ "the story should focus on..."
- ❌ "story for class 5 students"
- ❌ "resulting in a positive resolution"
- ❌ "clear moral about teamwork"
- ❌ "focus on friendship/teamwork/cooperation"
- ❌ "met near a pond"
- ❌ "help solve through cooperation"
- ❌ "spend time together"

### 2. Narrative Story Patterns
These are AI-generated story content:
- ❌ "One bright sunny day..."
- ❌ "A dark cold morning..."
- ❌ "Once upon a time..."
- ❌ "The end"
- ❌ "Chapter 3"
- ❌ "lived his/her life"
- ❌ "was a golden retriever/cow/dog/yellow frog"
- ❌ "near a clear pond/river/lake"
- ❌ "who met near..."
- ❌ "faces a small problem"

### 3. AI Self-Reference Phrases
AI introducing its own output:
- ❌ "Here is..."
- ❌ "Sure, I can..."
- ❌ "I have..."
- ❌ "Certainly..."
- ❌ "Of course..."
- ❌ "Here's a..."

### 4. Long Content Without User Intent
Text longer than 200 characters that doesn't start with:
- ✅ create, write, make, fix, generate, build
- ✅ explain, how, what, why, list, show
- ✅ tell, give, help, find, debug

### 5. Story Elements & Characters
Specific story-related content:
- ❌ "the cow, dog, and..."
- ❌ "yellow frog"
- ❌ "calm problem-solving"

### 6. Promotional/Landing Content
Extension marketing text:
- ❌ "SummarAI turns scattered AI conversations..."
- ❌ "actionable workflow"

### 7. Image Descriptions
Auto-generated image alt text:
- ❌ "The image shows..."
- ❌ "Image of..."
- ❌ "This image depicts..."

### 8. System UI Noise
Button labels and UI elements:
- ❌ "Regenerate"
- ❌ "Modify"
- ❌ "Share"
- ❌ "Google"
- ❌ "Copy"
- ❌ "Bad response"
- ❌ "Good response"

---

## What Gets Captured (User Prompts)

### ✅ User Questions
- "How do I fix this bug?"
- "What is the difference between X and Y?"
- "Why does this happen?"

### ✅ User Requests
- "Create a story about a cow and a frog"  ← This is the **actual prompt**
- "Write a function that does X"
- "Generate ideas for..."
- "Make this better"

### ✅ User Commands
- "Explain this concept"
- "List the top 10..."
- "Show me how to..."
- "Debug this code"

---

## Example Scenarios

### ❌ Filtered Out (AI Response)
```
One bright sunny day, a story for Class 5 students should be written about 
a cow, a dog, and a yellow frog who met near a clear pond. The story should 
focus on friendship, teamwork, and calm problem-solving. The cow, dog, and 
yellow frog spend time together, and the yellow frog faces a small problem 
that the cow and dog help solve through cooperation, resulting in a positive 
resolution and a clear moral about teamwork.
```
**Why?** Contains multiple red flags:
- "One bright sunny day" (narrative opening)
- "should be written" (meta-instruction)
- "the story should" (meta-instruction)
- "focus on friendship/teamwork" (meta-instruction)
- "clear moral about" (meta-instruction)

### ✅ Captured (User Prompt)
```
Write a short story for Class 5 students about a cow, a dog, and a yellow frog 
who become friends and solve a problem together. Focus on teamwork.
```
**Why?** Starts with user verb "Write" and is giving instructions **to** the AI, not describing what the AI should generate.

---

## Edge Cases

### When User Prompt is Very Long (>200 chars)
Only captured if it starts with a user verb:
- ✅ "Create a detailed analysis of..."
- ✅ "Explain the entire process of..."
- ❌ "The analysis shows that over time..." (doesn't start with user verb)

### When AI Quotes the User
If the AI says: "Sure, I can help you write a story..."
- ❌ Filtered out because it starts with "Sure, I can"

### When User Asks for a Story
User: "Write a story about animals"
AI: "One bright sunny day, there were three friends..."
- ✅ User's prompt is captured
- ❌ AI's story is filtered out

---

## Technical Implementation

All filtering happens in:
- **File:** `/src/core/scraper/smart-scraper.ts`
- **Method:** `extractMessages()`
- **Rules:** 7 sequential filter rules with regex patterns
- **Fallback:** If no content passes filters, shows empty result (no content found)

---

Last Updated: January 2, 2026
