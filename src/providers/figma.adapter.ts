import type { ProviderAdapter } from './provider-adapter';
import type { ScrapedMessage } from '../core/scraper/types';
import { extractTextRecursively } from '../core/utils';

export class FigmaAdapter implements ProviderAdapter {
    name = "figma";
    detect(): boolean {
        return window.location.hostname.includes('figma.com');
    }

    async getConversation(): Promise<ScrapedMessage[]> {
        // Figma renders design on Canvas, so we can't scrape the design itself easily.
        // We focus on Comments and UI Text.

        const conversation: ScrapedMessage[] = [];

        // 1. Scrape Comments (heuristic class names)
        // Figma classes change often, so we look for generic comment indicators or aria-labels
        const comments = document.querySelectorAll('[class*="comment"], [aria-label*="comment"]');
        comments.forEach(c => {
            const text = (c as HTMLElement).innerText;
            if (text && text.length > 3) {
                conversation.push({ role: 'user', content: text });
            }
        });

        // 2. Fallback: Recursive scrape of the UI (excluding canvas)
        if (conversation.length === 0) {
            const root = document.querySelector('#react-page') || document.body;
            const raw = extractTextRecursively(root);

            // Filter out known Figma UI noise
            const NOISE = ['Share', 'Present', 'Zoom', 'Layers', 'Assets', 'Design', 'Prototype'];

            const lines = raw.split('\n')
                .map(l => l.trim())
                .filter(l => l.length > 5 && !NOISE.includes(l));

            if (lines.length > 0) {
                return [{ role: 'user', content: lines.join('\n') }];
            }
        }

        return conversation;
    }
}
