---
description: Detailed breakdown of how summaries are generated, processed, and drafted in the Lotus (Tiger) extension.
---

# Summary Generation Process

This document outlines the end-to-end workflow of the Lotus (Tiger) extension, from the user's click to the final AI-generated summary.

## 1. User Interaction (Frontend)
- **Trigger**: The user opens the extension popup and clicks the **"Generate"** button.
- **Options**:
  - **Include AI**: Toggle to include/exclude AI responses (default: false).
  - **Read Images**: Toggle to analyze images in the chat (default: false).
  - **Format**: Paragraph (default), Bullet Points, JSON, or XML.

## 2. Content Scraping (Content Script)
- **Engine**: `SmartScraper` (Heuristic-based).
- **Process**:
  1.  **Identify Container**: Locates the main chat area using common selectors or falls back to the document body.
  2.  **Extract Text**: Flattens the DOM into a linear sequence of text nodes.
  3.  **Filter Noise**:
      - **Length Check**: Discards long blocks of text (likely AI responses).
      - **Narrative Check**: Discards text that sounds like a story or explanation.
      - **Image Description Check**: Discards text starting with "The image shows...", "Image of...", etc.
      - **System Noise**: Removes UI elements like "Regenerate", "Copy", etc.
  4.  **Image Collection**: If "Read Images" is checked, collects visible image URLs.

## 3. Backend Processing (Cloudflare Worker)
- **Endpoint**: `/` (POST request).
- **Mode Selection**:
  - **Verbatim Mode (Default)**:
    - **System Prompt**: `VERBATIM_PROMPT`.
    - **Goal**: Extract user prompts *exactly* as typed.
    - **Output**: A strict numbered list of prompts.
  - **Consolidate Mode**:
    - **Trigger**: User clicks the "Sparkles" button *after* initial generation.
    - **System Prompt**: `CONSOLIDATE_PROMPT`.
    - **Goal**: Merge the list of prompts into a single, cohesive "Master Context Summary".
    - **Logic**: Resolves conflicts (latest overrides earliest), merges additions, and ignores abandoned paths.

## 4. AI Generation
- **Provider**:
  - **Auto (Default)**: Uses OpenAI (`gpt-4o-mini`) for short content, Google Gemini (`gemini-2.0-flash`) for long content (>50k chars).
  - **Manual**: User can force OpenAI or Google.
- **Execution**: The constructed system prompt and scraped content are sent to the selected AI model.

## 5. Result Display & Actions
- **Display**: The generated summary (or list) is shown in the popup.
- **Toolbar Actions**:
  - **Consolidate**: Triggers the consolidation flow (if in Verbatim mode).
  - **Copy**: Copies text to clipboard.
  - **Regenerate**: Retries the generation.
  - **Report**: Allows user to flag bad responses.
