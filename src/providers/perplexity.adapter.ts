import type { ProviderAdapter } from "./provider-adapter";
import type { ScrapedMessage } from "../core/scraper/types";
import { extractTextRecursively } from "../core/utils";

export class PerplexityAdapter implements ProviderAdapter {
    name = "perplexity";
    detect() {
        return location.hostname.includes("perplexity.ai");
    }

    async getConversation(): Promise<ScrapedMessage[]> {
        const conversation: ScrapedMessage[] = [];
        // Perplexity often uses specific classes. We'll try a broad selector first.
        const elements = document.querySelectorAll('.prose, div[class*="message"], div[class*="Message"]');

        if (elements.length > 0) {
            elements.forEach((el, i) => {
                const text = extractTextRecursively(el);
                if (text && text.length > 10) {
                    conversation.push({
                        role: i % 2 === 0 ? 'user' : 'assistant',
                        content: text.trim()
                    });
                }
            });
        } else {
            // Fallback to main or body
            const root = document.querySelector('main') || document.body;
            let text = extractTextRecursively(root);

            if (!text || text.trim().length === 0) {
                text = (root as HTMLElement).innerText;
            }

            if (text && text.trim().length > 0) {
                conversation.push({ role: 'user', content: text });
            }
        }
        return conversation.filter(msg => msg.content && msg.content.trim().length > 0);
    }
}
