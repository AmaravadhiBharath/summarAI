# Debug Analysis: Gemini Scraper Failure

## 1. The "Working" State (approx. 20 mins ago)
*   **Logic:** We used a recursive function `findGeminiMessages` that searched for specific attributes:
    *   `data-message-id`
    *   `class="message-content"`
    *   `class="model-response-text"`
*   **Why it worked:** It accurately identified message blocks.
*   **Why it failed later:** It started picking up "My stuff" (Sidebar) because Gemini likely uses similar classes/attributes in the sidebar history, OR the scraper was too aggressive and picked up the entire body text when it couldn't find specific messages.

## 2. The "Generic/Heuristic" Attempts
*   **Logic:** We tried to find the "Main Container" by looking for `<main>` or the largest scrollable element.
*   **Failure:**
    *   **Sidebar Trap:** It often identified the Sidebar ("My stuff") as the main container because it's also scrollable and text-heavy.
    *   **Geometric Over-kill:** When we added geometric filtering (ignore left 20%), it accidentally filtered out the *actual* chat if the window was small or the layout shifted, leading to "No content found".

## 3. The Root Cause of "No User Messages"
*   The **Geometric Filter** was too strict. It blocked anything starting in the left 15% of the screen.
*   On many screens, the main chat container *starts* near the left edge (especially if the sidebar is collapsed or the screen is narrow).
*   Result: The scraper saw the main chat, said "It's on the left, must be a sidebar", and threw it away.

## 4. The Solution: "Selector + Geometry" Hybrid
We need to combine the precision of **Selectors** with the safety of **Geometry**.

**The Logic:**
1.  **Find Candidates:** Use the specific selectors (`message-content`, `data-message-id`) to find potential messages.
2.  **Validate Position:** For *each* candidate, check its position:
    *   Is it inside the "Sidebar Zone" (Left < 300px width)? -> **REJECT**
    *   Is it in the "Main Chat Zone" (Center/Right)? -> **ACCEPT**

This prevents "My stuff" (Sidebar) from leaking in, while ensuring we don't accidentally throw away the main chat.

## 5. Proposed Fix
I will rewrite `src/content.ts` to implement this **Candidate Validation** model.
*   **Step 1:** Find all elements matching message selectors.
*   **Step 2:** Filter them: `if (rect.left < 300 && rect.width < 300) continue;` (It's a sidebar item).
*   **Step 3:** Extract text from the rest.
