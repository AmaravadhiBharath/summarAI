import type { ProviderAdapter } from "./provider-adapter";
import type { ScrapedMessage } from "../core/scraper/types";

export class ChatGPTAdapter implements ProviderAdapter {
    name = "chatgpt";
    detect() {
        return location.hostname.includes("chat.openai.com") || location.hostname.includes("chatgpt.com");
    }

    async getConversation(): Promise<ScrapedMessage[]> {
        const conversation: ScrapedMessage[] = [];

        // Strategy 1: Get all messages in order using the data attribute
        // This is more robust than querying users and assistants separately as it preserves order
        const turns = document.querySelectorAll('[data-message-author-role]');

        if (turns.length > 0) {
            turns.forEach(turn => {
                const role = turn.getAttribute('data-message-author-role') as 'user' | 'assistant';
                // Use innerText to preserve newlines/formatting, fallback to textContent
                const text = (turn as HTMLElement).innerText || turn.textContent || "";

                if (role && text.trim()) {
                    conversation.push({
                        role,
                        content: text.trim()
                    });
                }
            });
            return conversation;
        }

        // Strategy 2: Fallback to article tags (older ChatGPT UI or changed attributes)
        const articles = document.querySelectorAll('article');
        if (articles.length > 0) {
            articles.forEach((article, index) => {
                const text = (article as HTMLElement).innerText?.trim();
                if (text) {
                    // Heuristic: Odd indices are usually AI, Even are User (0-indexed)
                    // But usually the first element is User.
                    const role = index % 2 === 0 ? 'user' : 'assistant';
                    conversation.push({ role, content: text });
                }
            });
        }

        return conversation;
    }
}
