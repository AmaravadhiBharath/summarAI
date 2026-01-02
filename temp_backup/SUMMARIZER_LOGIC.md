# Tiger Summarizer Workflow & Logic

## 1. Complete Workflow Process
The summarizer follows a linear pipeline: **Scrape → Filter → Prompt Engineering → AI Generation → Formatting**.

### Scraping
- **Method**: Uses `chrome.scripting.executeScript` to inject code into the active tab.
- **Validation**: Checks URL against supported list (chatgpt.com, gemini.google.com, openai.com, figma.com, visily.ai, etc.).
- **Extraction**: Extracts conversation history (User prompts and AI responses) from the DOM.

### Filtering (Checkbox Logic)
- **Checkbox**: "Include AI responses in summary"
    - **Unchecked (Default)**: Filters scraped data to include **only User Prompts**. UI: "Analyzing only your prompts".
    - **Checked**: Includes **both User Prompts and AI Responses**. UI: "Analyzing both your prompts and AI responses".

### Prompt Engineering
Constructs a payload containing:
- **System Prompt**: Strict rules (Compression, Voice, Length).
- **User Content**: Filtered conversation text (and images if present).
- **Format Instruction**: Dynamic instruction based on selection (TXT, JSON, XML).

### AI Generation (OpenAI)
- **API**: POST to `https://api.openai.com/v1/chat/completions`.
- **Model**: `gpt-4o-mini`.
- **Temperature**: `0.7` (balanced creativity).

### Drafting & Formatting
- **Voice**: "Content-Focused Voice" rules.
- **Post-processing**: Removes Markdown code blocks (e.g., ```json) before display.

---

## 2. The Drafting & Analysis Process (System Prompt)
The "brain" uses a detailed System Prompt for **Compression** and **Net Effect Analysis**.

### Core Rules
#### Compression Rules (Net Effect Only)
- **Arithmetic Logic**: If user says "Add 3 mangoes" then "Remove 1 mango", summary must say "Include 2 mangoes". Ignores intermediate steps.
- **Final Intent Wins**: Later instructions overrule earlier contradictory ones.

#### Content-Focused Voice
- **No Meta-Talk**: Forbidden to say "The user asked for...". Use imperative topic (e.g., "A request to translate..." or "A story about...").
- **Objective Tone**: Third-person, objective voice.

#### Length Handling
- **Long Conversations (300+ prompts)**: Identifies 3-5 core themes and describes final states only.

#### Summary Types
- **PROMPT-ONLY SUMMARY (Unchecked)**: Describes net intent and final instructions. **Critical Rule**: Do not answer the question. Do not simulate the result.
- **FULL-TEXT SUMMARY (Checked)**: Describes the final content/solution generated.

---

## 3. Example Trainings & Framing
Specific "One-Shot" training examples teach the AI framing:

### Example Workflow
- **Input**: "Write a dog story" -> "Add 3 mangoes" -> "Remove 1 mango"
- **Output**: "A story about a dog that includes two mangoes as narrative elements."

### Framing Rule for Singular Prompts
- **Input**: "Hello in Spanish"
- **Output**: "How to say 'hello' in informal Spanish." (Instead of "The user wants to know how to...")

---

## 4. Output Formatting
Dynamic prompt changes based on UI selection:
- **TXT**: "Return the single justified paragraph."
- **JSON**: "Return a valid JSON object."
- **XML**: "Return valid XML."

Ensures output is clean and ready for reuse.
