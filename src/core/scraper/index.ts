import type { ScrapedContent } from './types';
import { collectImages } from '../utils';
import { ChatGPTAdapter } from '../../providers/chatgpt.adapter';
import { GeminiAdapter } from '../../providers/gemini.adapter';
import { ClaudeAdapter } from '../../providers/claude.adapter';

export const scrapePage = async (includeImages: boolean = false): Promise<ScrapedContent | null> => {
    console.log("Tiger: scrapePage called. Body innerText Length:", document.body.innerText?.length);
    const url = window.location.href;
    const title = document.title;

    let conversation: any[] = [];

    try {
        // Try provider-specific adapters first
        const adapters = [
            new ChatGPTAdapter(),
            new GeminiAdapter(),
            new ClaudeAdapter()
        ];

        const matchedAdapter = adapters.find(adapter => adapter.detect());

        if (matchedAdapter) {
            console.log(`Tiger: Using ${matchedAdapter.name} adapter`);
            conversation = await matchedAdapter.getConversation();
        } else {
            // Fallback to SmartScraper for unknown platforms
            console.log("Tiger: Using SmartScraper (fallback)...");
            const { SmartScraper } = await import('./smart-scraper');
            const scraper = new SmartScraper();
            conversation = await scraper.scrape();
        }
    } catch (e) {
        console.error("Tiger: Scraping failed", e);
    }

    const images = includeImages ? collectImages(document) : [];

    // GLOBAL NUKE: Remove init() calls from the final rawText and conversation
    conversation = conversation.filter(msg => {
        const text = msg.content;
        return !text.startsWith('init(') && !text.includes("init('") && !text.includes('AF_initDataCallback');
    });

    let rawText = conversation.map(c => c.content).join('\n');

    if (!rawText || rawText.trim().length < 10) {
        console.log("Tiger: Recursive extraction failed. Trying innerText fallback.");
        rawText = document.body.innerText || "";

        if (!rawText || rawText.trim().length < 10) {
            const debugMsg = `DEBUG: No content found. URL: ${window.location.hostname}, Body Len: ${document.body.innerText?.length || 0}`;
            console.log(debugMsg);
            return {
                url,
                title,
                platform: 'generic' as any,
                conversation: [{ role: 'user', content: debugMsg }],
                rawText: debugMsg,
                images
            };
        }
    }

    console.log(`Tiger: Final Raw Text Length: ${rawText.length}`);
    if (rawText.length < 100) {
        console.log("Tiger: WARNING - Content is very short:", rawText);
    }

    rawText = rawText.replace(/init\s*\(['""][^)]+\)/g, '');
    rawText = rawText.replace(/AF_initDataCallback\({[^}]+\}\)/g, '');

    return {
        url,
        title,
        platform: 'generic' as any, // Use 'generic' as it is a valid type
        conversation,
        rawText,
        images
    };
};
