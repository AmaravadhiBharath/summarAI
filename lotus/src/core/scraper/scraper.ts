import type { ScraperResult, ScraperError } from './types';
import { detectPlatform } from './platforms';

// Content validation function
const validateContent = (text: string, minLength: number = 50): { valid: boolean; reason?: string } => {
    const trimmed = text.trim();

    // Too short
    if (!trimmed || trimmed.length < 10) {
        return { valid: false, reason: 'Content too short' };
    }

    // Common error/loading messages
    const errorPatterns = [
        /^loading\.\.\.$/i,
        /^error \d+/i,
        /^sign in to continue/i,
        /^access denied/i,
        /^404 not found/i,
        /^please wait/i,
        /^forbidden/i
    ];

    const lowerText = trimmed.toLowerCase();
    if (errorPatterns.some(pattern => pattern.test(lowerText))) {
        return { valid: false, reason: 'Appears to be error or loading message' };
    }

    // For content less than minLength, check quality
    if (trimmed.length < minLength) {
        const wordCount = trimmed.split(/\s+/).length;

        // Need at least 3 words
        if (wordCount < 3) {
            return { valid: false, reason: 'Not enough words' };
        }

        // Check for conversation markers or questions
        const hasMarkers = /[?!]|user:|ai:|assistant:|how|what|why|when|where/i.test(trimmed);
        if (!hasMarkers && wordCount < 5) {
            return { valid: false, reason: 'Content too vague' };
        }
    }

    return { valid: true };
};

// Main scraper function
export const scrapePage = async (options: { includeImages?: boolean } = {}): Promise<ScraperResult> => {
    console.log("Lotus: scrapePage called");

    const url = window.location.href;
    const title = document.title;
    const platform = detectPlatform(url);

    // Get raw text (fallback)
    const rawText = document.body.innerText || "";

    // Validate raw text
    const validation = validateContent(rawText, platform.minContentLength);
    if (!validation.valid) {
        console.log(`Lotus: Validation failed - ${validation.reason}`);
        return {
            code: 'NO_CONTENT',
            message: 'Unable to extract content from this page',
            suggestion: validation.reason === 'Content too short'
                ? 'Make sure the page is fully loaded before generating a summary'
                : 'This page may not contain conversation content',
            platform: platform.name
        };
    }

    // Try to extract structured conversation
    const conversation: any[] = [];

    // Helper to scrape by selector and role
    const scrapeBySelector = (selector: string, role: 'user' | 'assistant') => {
        if (!selector) return;

        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
            console.log(`Lotus: Found ${elements.length} ${role} messages with selector: ${selector}`);
            elements.forEach((el) => {
                let text = el.textContent?.trim() || '';

                // Extract images if requested
                if (options.includeImages) {
                    const images = el.querySelectorAll('img');
                    if (images.length > 0) {
                        const imageTexts: string[] = [];
                        images.forEach(img => {
                            const alt = img.getAttribute('alt');
                            const src = img.getAttribute('src');
                            if (alt) imageTexts.push(`[Image: ${alt}]`);
                            else if (src) imageTexts.push(`[Image: ${src.split('/').pop()?.split('?')[0] || 'embedded'}]`);
                        });
                        if (imageTexts.length > 0) {
                            text += '\n' + imageTexts.join('\n');
                        }
                    }
                }

                if (text && text.length > 0) {
                    // Store with index to sort later if needed (though usually they appear in order in DOM)
                    // Note: This simple push approach assumes we can sort or they are interleaved.
                    // For now, we just push them. A more advanced scraper would traverse the tree to keep order.
                    // But since we are consolidating USER prompts, order matters less than role correctness.
                    conversation.push({
                        role: role,
                        content: text,
                        // We can use bounding client rect top to sort strictly by visual order
                        position: el.getBoundingClientRect().top
                    });
                }
            });
        }
    };

    // Scrape User Messages
    scrapeBySelector(platform.userSelector, 'user');

    // Scrape AI Messages
    scrapeBySelector(platform.aiSelector, 'assistant');

    // Sort by visual position (top to bottom) to maintain chronological order
    conversation.sort((a, b) => a.position - b.position);

    console.log("Lotus: Scraped Conversation:", JSON.stringify(conversation, null, 2));

    // Scrape AI Messages (only if we might need them, but we do it to have a complete picture)
    scrapeBySelector(platform.aiSelector, 'assistant');

    // Sort conversation by position in DOM to maintain chronological order
    conversation.sort((a, b) => a.position - b.position);

    // Clean up the position property before returning
    const cleanConversation = conversation.map(({ position, ...msg }) => msg);

    // Check for Shadow DOM issues (Gemini/Claude often hide content)
    if (platform.shadowDOM && cleanConversation.length === 0 && rawText.length < 100) {
        console.log('Lotus: Shadow DOM platform with minimal content');
        return {
            code: 'SHADOW_DOM',
            message: `${platform.name.charAt(0).toUpperCase() + platform.name.slice(1)} uses protected content`,
            suggestion: 'Try selecting and copying the conversation manually, then paste it into a text field for summarization',
            platform: platform.name
        };
    }

    // If no structured conversation found, use raw text (Fallback)
    if (cleanConversation.length === 0) {
        console.log('Lotus: No structured conversation, using raw text');
        cleanConversation.push({
            role: 'user', // Fallback assumes user content if we can't distinguish
            content: rawText
        });
    }

    console.log(`Lotus: Successfully scraped ${cleanConversation.length} messages from ${platform.name}`);

    return {
        url,
        title,
        platform: platform.name,
        conversation: cleanConversation,
        rawText,
        images: []
    };
};
