import type { ProviderAdapter } from "./provider-adapter";
import type { ScrapedMessage } from "../core/scraper/types";
import { deepQuerySelectorAll } from "../core/utils";

export class GeminiAdapter implements ProviderAdapter {
    name = "gemini";
    detect() {
        return location.hostname.includes("gemini.google.com");
    }

    async getConversation(): Promise<ScrapedMessage[]> {
        const conversation: ScrapedMessage[] = [];

        // STRATEGY 1: Deep Search for 'user-query' tags (Gemini's custom element)
        // This handles Shadow DOM automatically via deepQuerySelectorAll
        const userQueries = deepQuerySelectorAll('user-query');

        if (userQueries.length > 0) {
            userQueries.forEach((query: Element) => {
                const text = (query as HTMLElement).innerText?.trim();
                if (text && text.length > 0) {
                    conversation.push({ role: 'user', content: text });
                }
            });
            return conversation;
        }

        // STRATEGY 2: Deep Search for message containers
        // Look for elements with specific attributes often used in Gemini
        const messageElements = deepQuerySelectorAll('.message-content, [data-message-id], .model-response-text');

        messageElements.forEach((el: Element) => {
            const element = el as HTMLElement;
            let role: 'user' | 'assistant' = 'user';

            // Determine role
            if (
                element.tagName.toLowerCase() === 'model-response' ||
                element.classList.contains('model-response-text') ||
                element.getAttribute('data-message-author-role') === 'assistant'
            ) {
                role = 'assistant';
            } else if (element.getAttribute('data-message-author-role') === 'user') {
                role = 'user';
            } else {
                // Heuristic: Check for specific classes
                if (element.classList.contains('user-query')) role = 'user';
            }

            // Extract text
            const text = element.innerText?.trim();
            if (!text || text.length < 2) return;

            // Skip UI noise
            if (['Regenerate', 'Modify', 'Share', 'Google', 'Copy', 'Export', 'My stuff', 'Gems', 'Manager', 'Chats'].includes(text)) return;

            // Deduplicate (Gemini sometimes duplicates text in shadow dom)
            const lastMsg = conversation[conversation.length - 1];
            if (lastMsg && lastMsg.content === text) return;

            conversation.push({ role, content: text });
        });

        return conversation;
    }
}
