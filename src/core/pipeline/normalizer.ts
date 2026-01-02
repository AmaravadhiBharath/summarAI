import type { ScrapedMessage } from '../scraper/types';

export const normalizeConversation = (conversation: ScrapedMessage[]): ScrapedMessage[] => {
    if (!conversation || conversation.length === 0) return [];

    const normalized: ScrapedMessage[] = [];

    conversation.forEach((msg) => {
        // 1. Skip empty messages
        if (!msg.content || msg.content.trim().length === 0) return;

        // 2. Deduplication (Simple: Skip if identical to previous)
        const prev = normalized[normalized.length - 1];
        if (prev && prev.role === msg.role && prev.content === msg.content) {
            return;
        }

        // 3. Noise Filtering (Specific UI artifacts)
        const noise = ['Regenerate response', 'Copy code', 'Bad response', 'Good response'];
        if (noise.includes(msg.content)) return;

        normalized.push(msg);
    });

    return normalized;
};
