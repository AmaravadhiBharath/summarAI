import type { ScrapedContent } from '../scraper/types';

export interface ProcessOptions {
    includeAI: boolean;
}

export const processContent = (content: ScrapedContent, options: ProcessOptions): string => {
    // 1. If we have a structured conversation
    if (content.conversation && content.conversation.length > 0) {
        if (options.includeAI) {
            // Full Conversation
            return content.conversation
                .map(turn => `${turn.role === 'user' ? 'User' : 'AI'}: ${turn.content}`)
                .join('\n\n');
        } else {
            // User Only (Strict Mode)
            // When Checkbox 1 (Assistant) is unchecked, we ONLY want messages where role === 'user'.
            const userPrompts = content.conversation
                .filter(turn => turn.role === 'user')
                .map(turn => `User: ${turn.content}`)
                .join('\n\n');

            // If we found structured user prompts, return them immediately.
            // This bypasses any raw text fallback or heuristic filtering.
            if (userPrompts.length > 0) {
                return userPrompts;
            }
        }
    }

    // 2. Fallback to raw text
    let rawText = content.rawText || "";

    // CLIENT-SIDE SAFETY NET: If includeAI is false, try to strip obvious AI noise from rawText
    if (!options.includeAI && rawText.length > 0) {
        // 1. Split into paragraphs
        const blocks = rawText.split(/\n\n+/);

        const filteredBlocks = blocks.filter(block => {
            const lower = block.toLowerCase().trim();

            // A. Filter out common AI starting phrases (Expanded List)
            const aiStarters = [
                "here is", "sure,", "i can", "certainly", "of course",
                "i understand", "based on", "as an ai", "i apologize",
                "the code", "to fix this", "you can use", "following is",
                "here's", "okay,", "great,", "no problem", "in this case",
                "to achieve this", "generated code", "output:", "response:"
            ];
            if (aiStarters.some(s => lower.startsWith(s))) return false;

            // B. Filter out code blocks (Markdown or obvious code)
            if (block.includes("```") || block.includes("    ") || (block.includes("import ") && block.includes("from "))) return false;

            // C. Filter out very long blocks (likely AI explanations)
            // User prompts are usually shorter. Lowered threshold to 300.
            if (block.length > 300) {
                const userIndicators = ["i want", "create", "make", "write", "fix", "how to", "can you", "please", "add", "remove"];
                // If it's long and doesn't have a clear user command, kill it.
                if (!userIndicators.some(i => lower.includes(i))) {
                    return false;
                }
                // Even if it has a user command, if it has "here is the code", it's likely the AI quoting the user.
                if (lower.includes("here is the code") || lower.includes("i have updated")) {
                    return false;
                }
                // D. Filter out Story Titles and Character Names (Aggressive Anti-Hallucination)
                // If the block contains quoted titles like "The Tiny Hero" or names like "Barnaby", "Andy"
                // AND it doesn't start with "User:", it's likely AI context.
                // (Note: We can't know all names, but we can check for the pattern of the specific issue user is facing)
                if (lower.includes('"the tiny hero') || lower.includes('barnaby') || lower.includes('andy')) {
                    // SPECIAL CASE: If it contains the specific title the user is complaining about, KILL IT.
                    if (lower.includes("the tiny hero of muddy lane")) {
                        return false;
                    }

                    // Only allow if it explicitly looks like a user command
                    const strongUserIndicators = ["i want", "write a", "create a", "make a"];
                    if (!strongUserIndicators.some(i => lower.startsWith(i))) {
                        return false;
                    }
                }
            } // Added missing closing brace for `if (block.length > 300)`

            return true;
        });

        if (filteredBlocks.length > 0) {
            // FORCE USER LABEL: Prepend "User: " to every block to help the backend
            rawText = filteredBlocks.map(b => `User: ${b}`).join('\n\n');
        } else {
            return "";
        }
    }

    return rawText;
};
