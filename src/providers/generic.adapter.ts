import type { ProviderAdapter } from './provider-adapter';
import type { ScrapedMessage } from '../core/scraper/types';
import { deepQuerySelectorAll, extractTextRecursively } from '../core/utils';

export class GenericAdapter implements ProviderAdapter {
    name = "generic";
    detect(): boolean {
        return true; // Always true for generic fallback
    }

    async getConversation(): Promise<ScrapedMessage[]> {
        // Generic scraping logic
        // 1. Try to find main content area
        const main = document.querySelector('main') || document.querySelector('article') || document.body;

        // 2. Extract text recursively
        const raw = extractTextRecursively(main);
        const lines = raw.split('\n').map(l => l.trim()).filter(l => l.length > 0);

        // 3. Heuristic: If we have very few lines, maybe it's a dynamic app (Shadow DOM?)
        if (lines.length < 5) {
            // FALLBACK 1: Try to find common chat containers
            const chatContainer = document.querySelector('[class*="chat"], [class*="conversation"], [class*="messages"]');
            if (chatContainer) {
                const chatText = extractTextRecursively(chatContainer);
                const chatLines = chatText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
                if (chatLines.length > 0) {
                    return [{ role: 'user', content: chatLines.join('\n') }];
                }
            }

            // FALLBACK 2: Try to find body text again but be more aggressive
            const bodyText = extractTextRecursively(document.body);
            const bodyLines = bodyText.split('\n').map(l => l.trim()).filter(l => l.length > 0);

            if (bodyLines.length > 0) {
                return [{ role: 'user', content: bodyLines.join('\n') }];
            }

            // ULTIMATE FALLBACK 2: Desperation Mode (Deep Query All)
            // If we are here, Shadow DOM extraction failed or was filtered out.
            // Let's just grab every single text node we can find.
            const allElements = deepQuerySelectorAll('p, div, span, h1, h2, h3, h4, h5, li');
            let desperateText = '';

            allElements.forEach(el => {
                const text = (el as HTMLElement).innerText || '';
                if (text && text.length > 20 && !desperateText.includes(text.substring(0, 20))) {
                    desperateText += text + '\n';
                }
            });

            if (desperateText.length > 50) {
                return [{ role: 'user', content: desperateText }];
            }

            // ULTIMATE FALLBACK 3: Just document.body.innerText
            const simpleText = document.body.innerText;
            if (simpleText && simpleText.length > 10) {
                return [{ role: 'user', content: simpleText }];
            }

            return [];
        }

        // Return as single user block (generic)
        return [{ role: 'user', content: lines.join('\n') }];
    }
}
