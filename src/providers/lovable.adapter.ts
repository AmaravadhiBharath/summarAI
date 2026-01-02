import type { ProviderAdapter } from './provider-adapter';
import type { ScrapedMessage } from '../core/scraper/types';
import { deepQuerySelectorAll, extractTextRecursively } from '../core/utils';

export class LovableAdapter implements ProviderAdapter {
    name = "lovable";
    detect(): boolean {
        return window.location.hostname.includes('lovable.dev') || window.location.hostname.includes('lovable.ai');
    }

    async getConversation(): Promise<ScrapedMessage[]> {
        const conversation: ScrapedMessage[] = [];
        console.log("[LovableAdapter] Starting aggressive scrape...");

        // 1. Try to find the main chat container
        // Look for the largest scrollable element or just 'main'
        let root: Node | null = document.querySelector('main');
        if (!root) {
            // Fallback: Find the element with the most text
            const divs = deepQuerySelectorAll('div, section, article');
            let maxLen = 0;
            divs.forEach(d => {
                const len = (d as HTMLElement).innerText?.length || 0;
                if (len > maxLen) {
                    maxLen = len;
                    root = d;
                }
            });
        }
        root = root || document.body;

        // 2. Extract ALL text nodes with structure (Handling Shadow DOM)
        const rawText = extractTextRecursively(root);

        // 3. Raw Shotgun: Return the whole thing
        // We do NOT split or filter. We let the AI decide what is important.
        // This ensures we capture phone numbers, codes, and context that might be lost in splitting.

        const cleaned = rawText.trim();
        if (cleaned.length > 0) {
            conversation.push({ role: 'user', content: cleaned });
        }

        console.log(`[LovableAdapter] Captured ${cleaned.length} chars of raw content.`);
        return conversation;
    }
}
