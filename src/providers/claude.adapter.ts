import type { ProviderAdapter } from './provider-adapter';
import type { ScrapedMessage } from '../core/scraper/types';
import { cleanText } from '../core/utils';

export class ClaudeAdapter implements ProviderAdapter {
    name = "claude";
    detect(): boolean {
        return window.location.hostname.includes('claude.ai');
    }

    async getConversation(): Promise<ScrapedMessage[]> {
        const conversation: ScrapedMessage[] = [];

        // Strategy 1: Specific Classes
        let turns = document.querySelectorAll('.font-user-message, .font-claude-message');

        // Strategy 2: Fallback to data-test-id or other attributes if classes change
        if (turns.length === 0) {
            turns = document.querySelectorAll('[data-test-id*="user-message"], [data-test-id*="claude-message"]');
        }

        turns.forEach(turn => {
            const isUser = turn.classList.contains('font-user-message') || turn.getAttribute('data-test-id')?.includes('user');
            const raw = (turn as HTMLElement).innerText;
            const text = cleanText(raw);
            if (text) conversation.push({ role: isUser ? 'user' : 'assistant', content: text });
        });

        return conversation;
    }
}
