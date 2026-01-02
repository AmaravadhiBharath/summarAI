

/**
 * A robust, heuristic-based scraper that works without site-specific adapters.
 * It analyzes the DOM structure and visual styles to identify chat messages.
 */
import type { ScrapedMessage } from "./types";

/**
 * SmartScraper - Hybrid with Shadow DOM Support
 * Combines specific selectors (Gemini) with robust heuristics,
 * and can pierce Shadow DOMs to find hidden elements.
 */
export class SmartScraper {

    public async scrape(): Promise<ScrapedMessage[]> {
        console.log("Tiger: SmartScraper starting (Hybrid + Shadow DOM)...");
        const url = window.location.href;
        let messages: ScrapedMessage[] = [];

        // 1. Gemini Specific (Shadow DOM Aware)
        if (url.includes('gemini.google.com')) {
            console.log("Tiger: Attempting Gemini Shadow DOM extraction...");

            // Helper to find all elements matching a selector, piercing Shadow Roots
            const querySelectorAllShadow = (selector: string, root: Document | ShadowRoot | Element = document): Element[] => {
                let results: Element[] = [];

                // Check current root
                const matches = root.querySelectorAll(selector);
                matches.forEach(el => results.push(el));

                // Check all children for shadow roots
                const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, null);
                let node;
                while (node = walker.nextNode() as Element) {
                    if (node.shadowRoot) {
                        results = results.concat(querySelectorAllShadow(selector, node.shadowRoot));
                    }
                }
                return results;
            };

            // Try to find <user-query> tags anywhere in Shadow DOM
            const userQueries = querySelectorAllShadow('user-query');
            if (userQueries.length > 0) {
                console.log(`Tiger: Found ${userQueries.length} user-query tags in Shadow DOM.`);
                userQueries.forEach(el => {
                    const text = (el as HTMLElement).innerText?.trim();
                    if (text && text.length > 0) {
                        messages.push({ role: 'user', content: text });
                    }
                });
                return messages; // Success!
            }
            console.log("Tiger: No user-query tags found even in Shadow DOM. Falling back to Heuristics.");
        }

        // 2. Fallback: Robust Heuristic Scraper (The "Smart" one, not the "Nuclear" one)
        // This is safer than the backup's nuclear option because it filters AI noise.
        const container = this.findChatContainer();
        if (container) {
            messages = this.extractMessages(container);
        }

        return messages;
    }

    private findChatContainer(): HTMLElement | null {
        const commonSelectors = [
            'infinite-scroller', '[role="log"]', '[role="main"]',
            '.chat-history', '.conversation', 'main'
        ];
        for (const selector of commonSelectors) {
            const el = document.querySelector(selector);
            if (el && (el as HTMLElement).innerText.length > 200) return el as HTMLElement;
        }
        return document.body;
    }

    private extractMessages(container: HTMLElement): ScrapedMessage[] {
        const messages: ScrapedMessage[] = [];
        const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null);
        let currentNode: Node | null;

        while (currentNode = walker.nextNode()) {
            const text = currentNode.textContent?.trim() || "";
            if (text.length < 2) continue;
            if (this.isSystemNoise(text)) continue;

            // Rule 0: Explicit Exclusions (Gemini/Generic)
            if (
                (currentNode.parentElement?.tagName.toLowerCase() === 'model-response') ||
                (currentNode.parentElement?.classList.contains('model-response-text')) ||
                (currentNode.parentElement?.getAttribute('data-message-author-role') === 'assistant')
            ) {
                continue;
            }

            // AGGRESSIVE AI CONTENT FILTERING
            const lowerText = text.toLowerCase();

            // Rule 1: AI Meta-Instructions (story generation requests FROM AI)
            const metaInstructionPatterns = [
                /should be written (about|on|for)/i,
                /the story should/i,
                /story for class \d+/i,
                /resulting in a positive resolution/i,
                /clear moral about/i,
                /focus on (friendship|teamwork|cooperation)/i,
                /\bmet near\b/i,
                /help solve through/i,
                /spend time together/i
            ];

            if (metaInstructionPatterns.some(pattern => pattern.test(text))) {
                continue; // This is an AI-generated meta-instruction, skip it
            }

            // Rule 2: Narrative Story Openings & Patterns
            const narrativePatterns = [
                /^(one|a) (bright|sunny|dark|cold|warm|beautiful|clear) (day|morning|evening|night)/i,
                /once upon a time/i,
                /the end/i,
                /chapter \d+/i,
                /lived (his|her|their) life/i,
                /was a (golden retriever|cow|dog|cat|yellow frog|rabbit)/i,
                /near a (clear|beautiful|sparkling|calm) (pond|river|lake|stream)/i,
                /who met near/i,
                /faces a small problem/i
            ];

            if (narrativePatterns.some(pattern => pattern.test(text))) {
                continue;
            }

            // Rule 3: AI Self-Reference & Phrases
            if (
                lowerText.startsWith('here is') ||
                lowerText.startsWith('sure, i can') ||
                lowerText.startsWith('i have') ||
                lowerText.startsWith('certainly') ||
                lowerText.startsWith('of course') ||
                lowerText.startsWith('here\'s a')
            ) {
                continue;
            }

            // Rule 4: Long Content Filter (strict)
            if (text.length > 200) {
                const strongUserVerbs = ["create", "write", "make", "fix", "generate", "build", "explain", "how", "what", "why", "list", "show", "tell", "give", "help", "find", "debug"];
                const firstWord = text.split(' ')[0].toLowerCase();
                if (!strongUserVerbs.includes(firstWord)) {
                    continue; // Too long and doesn't start with user verb
                }
            }

            // Rule 5: Story Elements & Character Descriptions
            if (
                lowerText.includes('the cow, dog, and') ||
                lowerText.includes('yellow frog') ||
                lowerText.includes('calm problem-solving')
            ) {
                continue;
            }

            // Rule 6: Generic promotional/landing content & help text
            if (
                lowerText.includes('summarai turns') ||
                lowerText.includes('scattered ai conversations') ||
                lowerText.includes('scattered ai conversatoins') || // Typo version
                lowerText.includes('actionable workflow') ||
                lowerText.includes('work with ai with an edge') ||
                lowerText.includes('generates summaries of all prompts') ||
                lowerText.includes('no duplicates') ||
                lowerText.includes('cancel out the conflict')
            ) {
                continue;
            }

            // Rule 7: Image Descriptions
            const imageDescRegex = /^(\d+\.|-|\*|•)?\s*(the image shows|image of|this image depicts)/i;
            if (imageDescRegex.test(text)) continue;

            messages.push({ role: 'user', content: text });
        }
        return this.mergeFragments(messages);
    }

    private isSystemNoise(text: string): boolean {
        const noise = ["Regenerate", "Modify", "Share", "Google", "Copy", "Bad response", "Good response"];
        return noise.includes(text);
    }

    private mergeFragments(messages: ScrapedMessage[]): ScrapedMessage[] {
        if (messages.length === 0) return [];
        const merged: ScrapedMessage[] = [];
        let currentMessage = { ...messages[0] };
        for (let i = 1; i < messages.length; i++) {
            const nextMessage = messages[i];
            if (nextMessage.role === currentMessage.role) {
                currentMessage.content += "\n" + nextMessage.content;
            } else {
                merged.push(currentMessage);
                currentMessage = { ...nextMessage };
            }
        }
        merged.push(currentMessage);
        return merged;
    }
}
