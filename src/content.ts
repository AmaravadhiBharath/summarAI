// Content script
console.log('Tiger Extension Content Script Loaded');

interface ScrapedContent {
    url: string;
    title: string;
    platform: 'chatgpt' | 'gemini' | 'claude' | 'generic';
    conversation: Array<{ role: 'user' | 'assistant', text: string }>;
    rawText: string;
    images: string[];
}


// Listen for messages from the side panel
chrome.runtime.onMessage.addListener((request: { action: string, includeImages?: boolean }, _sender: chrome.runtime.MessageSender, sendResponse: (response?: ScrapedContent | { error: string }) => void) => {
    if (request.action === 'getPageContent') {
        try {
            const content = scrapeContent(request.includeImages);
            sendResponse(content);
        } catch (e: any) {
            sendResponse({ error: e.message });
        }
    }
    return true; // Keep channel open for async response
});

function scrapeContent(includeImages: boolean = false): ScrapedContent {
    const url = window.location.href;
    const title = document.title;

    // 1. Protocol Validation
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        throw new Error("Cannot summarize this page. Please use a valid website (http/https).");
    }

    let platform: ScrapedContent['platform'] = 'generic';
    let conversation: ScrapedContent['conversation'] = [];
    let images: string[] = [];

    // Helper to collect images
    const collectImages = (root: Document | Element) => {
        if (!includeImages) return;
        const imgs = root.querySelectorAll('img');
        imgs.forEach(img => {
            // Filter out small icons/avatars (heuristic: width > 50px)
            if (img.width > 50 && img.height > 50 && img.src) {
                // Avoid duplicates
                if (!images.includes(img.src)) {
                    images.push(img.src);
                }
            }
        });
    };

    // Check if supported (for internal logic/logging, though we fallback to generic anyway)
    // const isSupported = SUPPORTED_DOMAINS.some(domain => url.includes(domain));

    // 1. ChatGPT Scraper
    if (url.includes('chatgpt.com')) {
        platform = 'chatgpt';
        const turns = document.querySelectorAll('[data-message-author-role]');
        turns.forEach(turn => {
            const role = turn.getAttribute('data-message-author-role') as 'user' | 'assistant';
            const text = (turn as HTMLElement).innerText;
            if (role && text) {
                conversation.push({ role, text });
            }
            collectImages(turn);
        });
    }
    // 2. Gemini Scraper (Approximate selectors, these change often)
    else if (url.includes('gemini.google.com')) {
        platform = 'gemini';
        // Gemini structure is complex and obfuscated. 
        // We'll try to find user queries and model responses based on common container classes or attributes if possible.
        // Fallback to a simpler heuristic: looking for large text blocks.
        // For now, let's grab all text as a fallback for Gemini until we have exact selectors.
        // A simple heuristic for "User" vs "Model" in Gemini is hard without stable classes.
        // We will default to generic full-text scrape for Gemini for safety in this version.
        // Fallback for Gemini (extract all text + images)
        collectImages(document);
    }
    // 3. Claude Scraper
    else if (url.includes('claude.ai')) {
        platform = 'claude';
        const turns = document.querySelectorAll('.font-user-message, .font-claude-message');
        turns.forEach(turn => {
            const isUser = turn.classList.contains('font-user-message');
            conversation.push({
                role: isUser ? 'user' : 'assistant',
                text: (turn as HTMLElement).innerText
            });
            collectImages(turn);
        });
    }

    // Generic Fallback: If no conversation detected, grab the main text
    if (conversation.length === 0) {
        // Simple readability-like fallback: grab paragraphs
        const paragraphs = document.querySelectorAll('p, h1, h2, h3, h4, h5, li');
        let fullText = "";
        paragraphs.forEach(p => {
            const text = (p as HTMLElement).innerText;
            if (text && text.length > 20) { // Filter tiny bits
                fullText += text + "\n\n";
            }
        });

        // If that fails, just body text
        if (!fullText.trim()) {
            fullText = document.body.innerText;
        }

        // Logic for Empty Conversations
        if (!fullText || fullText.trim().length < 50) {
            throw new Error("No conversation content found. Please ensure you are on a valid page with content.");
        }

        collectImages(document);

        return {
            url,
            title,
            platform: 'generic',
            conversation: [],
            rawText: fullText,
            images: images.slice(0, 10) // Limit to 10 images to avoid payload issues
        };
    }

    return {
        url,
        title,
        platform,
        conversation,
        rawText: conversation.map(t => `${t.role.toUpperCase()}: ${t.text}`).join('\n\n'),
        images: images.slice(0, 10)
    };
}
