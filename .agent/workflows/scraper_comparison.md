---
description: Comparison of Scraper Implementations
---

# Scraper Comparison

The user asked if we are using the same logic as their provided React hook `useMessageDetector`.

## Our Implementation (`SmartScraper`)
- **Type**: Heuristic-based, Universal.
- **Logic**:
  1. Finds a chat container using common selectors or fallback to body.
  2. Flattens the DOM into text nodes.
  3. Filters text based on length, narrative indicators, and specific patterns (e.g., "The image shows").
  4. Merges consecutive fragments.
- **Goal**: To be robust against DOM changes by avoiding strict reliance on specific class names for messages.

## User's Snippet (`useMessageDetector`)
- **Type**: Selector-based, Platform-Specific.
- **Logic**:
  1. Uses specific CSS selectors for ChatGPT (`[data-message-author-role]`) and Gemini (`.user-query-container`).
  2. Uses `MutationObserver` for real-time updates.
  3. Extracts content based on these specific elements.
- **Goal**: Precise extraction using known DOM structures.

## Conclusion
**No, we are not using the same logic.**
- We moved *away* from the selector-based approach (like the user's snippet) because Gemini's DOM was unstable and lacked clear class names for a while.
- Our current approach is more "brute force" but potentially more resilient to class name changes, though less precise than a working selector-based approach.
