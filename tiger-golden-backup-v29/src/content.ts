// Content script

interface ScrapedContent {
    url: string;
    title: string;
    platform: 'chatgpt' | 'gemini' | 'claude' | 'generic';
    conversation: Array<{ role: 'user' | 'assistant', text: string }>;
    rawText: string;
    images: string[];
}


// Listen for messages from the side panel
chrome.runtime.onMessage.addListener((request: { action: string, includeImages?: boolean }, _sender: chrome.runtime.MessageSender, sendResponse: (response?: ScrapedContent | { error: string } | { pong: boolean }) => void) => {
    if (request.action === 'ping') {
        sendResponse({ pong: true });
        return true;
    }

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

// Global variable to store dynamic selectors
let dynamicSelectors: any = null;

// Load selectors immediately when script loads
chrome.storage.local.get('scraping_config', (data) => {
    if (data.scraping_config) {
        dynamicSelectors = data.scraping_config;
        console.log('Summarai: Loaded dynamic selectors');
    }
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

    // Check for dynamic configuration first
    if (dynamicSelectors) {
        let config = null;
        if (url.includes('chatgpt.com')) config = dynamicSelectors['chatgpt.com'];
        else if (url.includes('gemini.google.com')) config = dynamicSelectors['gemini.google.com'];
        else if (url.includes('claude.ai')) config = dynamicSelectors['claude.ai'];

        if (config) {
            platform = config.platform;

            if (platform === 'chatgpt' && config.selectors) {
                for (const selector of config.selectors) {
                    const elements = document.querySelectorAll(selector);
                    if (elements.length > 0) {
                        elements.forEach(el => {
                            let role: 'user' | 'assistant' = 'assistant';
                            if (config.roleAttribute) {
                                const attr = el.getAttribute(config.roleAttribute);
                                if (attr === config.userRoleValue) role = 'user';
                            }
                            // Fallback role detection if needed

                            const text = (el as HTMLElement).innerText;
                            if (text) conversation.push({ role, text });
                            collectImages(el);
                        });
                        if (conversation.length > 0) return { url, title, platform, conversation, rawText: conversation.map(t => t.text).join('\n\n'), images };
                    }
                }
            }
            // Add other platforms if needed, but fallback is fine for now
        }
    }


    // Check if supported (for internal logic/logging, though we fallback to generic anyway)

    // 1. ChatGPT Scraper
    if (url.includes('chatgpt.com')) {
        platform = 'chatgpt';
        // Try multiple selectors for robustness
        const selectors = [
            '[data-message-author-role]',
            '.text-message',
            '.markdown'
        ];

        let turns: NodeListOf<Element> | null = null;
        for (const selector of selectors) {
            const elements = document.querySelectorAll(selector);
            if (elements.length > 0) {
                turns = elements;
                break;
            }
        }

        if (turns) {
            turns.forEach(turn => {
                const role = turn.getAttribute('data-message-author-role') as 'user' | 'assistant' || 'assistant'; // Default to assistant if unknown
                const text = (turn as HTMLElement).innerText;
                if (text) {
                    conversation.push({ role, text });
                }
                collectImages(turn);
            });
        }
    }
    // 2. Gemini Scraper
    else if (url.includes('gemini.google.com')) {
        platform = 'gemini';

        // Strategy 1: Known Stable Classes (Heuristic)
        const specificSelectors = [
            '.message-content',
            '[data-message-id]',
            '.model-response-text',
            '.user-query',
            'message-content'
        ];

        for (const sel of specificSelectors) {
            const els = document.querySelectorAll(sel);
            if (els.length > 0) {
                els.forEach(el => {
                    const text = (el as HTMLElement).innerText;
                    if (text && text.length > 5) {
                        conversation.push({ role: 'assistant', text });
                    }
                });
            }
        }

        // Strategy 2: The "Nuclear" Option - Scan EVERYTHING
        if (conversation.length === 0) {
            // Find the scrolling container
            const scrollables = Array.from(document.querySelectorAll('[class*="scroll"], [style*="overflow"]'));
            let targetContainer = scrollables.sort((a, b) => {
                const rectA = a.getBoundingClientRect();
                const rectB = b.getBoundingClientRect();
                return (rectB.width * rectB.height) - (rectA.width * rectA.height);
            })[0] as HTMLElement;

            if (!targetContainer) targetContainer = document.body;

            // Get all text nodes
            const walker = document.createTreeWalker(
                targetContainer,
                NodeFilter.SHOW_TEXT,
                {
                    acceptNode: (node) => {
                        const parent = node.parentElement;
                        if (!parent) return NodeFilter.FILTER_REJECT;

                        // Skip hidden elements
                        if ((parent as HTMLElement).offsetParent === null) return NodeFilter.FILTER_REJECT;

                        // EXPLICITLY SKIP INPUT AREAS (User typed but not submitted)
                        if ((parent as HTMLElement).isContentEditable) return NodeFilter.FILTER_REJECT;
                        if (parent.getAttribute('role') === 'textbox') return NodeFilter.FILTER_REJECT;
                        if (parent.closest('[contenteditable="true"]')) return NodeFilter.FILTER_REJECT;

                        const tag = parent.tagName.toLowerCase();
                        if (['script', 'style', 'noscript', 'button', 'nav', 'header', 'footer', 'input', 'textarea', 'select', 'option'].includes(tag)) return NodeFilter.FILTER_REJECT;

                        return NodeFilter.FILTER_ACCEPT;
                    }
                }
            );

            let currentNode;
            while (currentNode = walker.nextNode()) {
                const text = currentNode.textContent?.trim();
                // Capture anything that looks like a sentence or prompt
                if (text && text.length > 10) {
                    // Filter out obvious UI noise
                    if (!['submit', 'cancel', 'regenerate', 'share', 'more_vert', 'edit', 'enter a prompt here'].includes(text.toLowerCase())) {
                        conversation.push({ role: 'assistant', text });
                    }
                }
            }
        }

        collectImages(document.body);
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
        // Check if it's a supported app (where we want to avoid UI noise)
        const SUPPORTED_DOMAINS = [
            'chatgpt.com', 'openai.com', 'gemini.google.com', 'labs.google.com', 'figma.com',
            'visily.ai', 'uizard.io', 'uxmagic.ai', 'banani.co', 'app.emergent.sh', 'rocket.new',
            'lovable.dev', 'bolt.new', 'base44.com', 'create.xyz', 'memex.tech', 'buildfire.com',
            'glideapps.com', 'flatlogic.com', 'retool.com', 'uibakery.io', 'zoho.com', 'appypie.com'
        ];

        const isSupportedApp = SUPPORTED_DOMAINS.some(domain => url.includes(domain));
        let fullText = "";
        const minLength = isSupportedApp ? 50 : 30; // Lowered threshold

        // For Supported Apps (Chat/Builders), use a TreeWalker to capture ALL significant text
        // (including divs, spans) while avoiding duplicates and UI noise.
        if (isSupportedApp) {
            const walker = document.createTreeWalker(
                document.body,
                NodeFilter.SHOW_TEXT,
                {
                    acceptNode: (node) => {
                        const parent = node.parentElement;
                        if (!parent) return NodeFilter.FILTER_REJECT;

                        // Skip invisible elements (basic check)
                        if (parent.offsetParent === null) return NodeFilter.FILTER_REJECT;

                        // EXPLICITLY SKIP INPUT AREAS
                        if ((parent as HTMLElement).isContentEditable) return NodeFilter.FILTER_REJECT;
                        if (parent.getAttribute('role') === 'textbox') return NodeFilter.FILTER_REJECT;
                        if (parent.closest('[contenteditable="true"]')) return NodeFilter.FILTER_REJECT;

                        const tag = parent.tagName.toLowerCase();
                        if (['script', 'style', 'noscript', 'iframe', 'svg', 'path', 'button', 'nav', 'footer', 'header', 'input', 'textarea', 'select'].includes(tag)) {
                            return NodeFilter.FILTER_REJECT;
                        }

                        return NodeFilter.FILTER_ACCEPT;
                    }
                }
            );

            let currentNode;
            while (currentNode = walker.nextNode()) {
                const text = currentNode.textContent?.trim();
                // Heuristic: Only keep "sentence-like" text (> 30 chars) to avoid UI labels
                // But for chat, short prompts like "Make it blue" are important.
                // Let's use > 5 chars to capture almost everything relevant
                if (text && text.length > 5) {
                    fullText += text + "\n\n";
                }
            }
        } else {
            // For Generic sites, use the standard selector approach
            const selector = 'p, h1, h2, h3, h4, h5, li, span, div'; // Added span/div
            const paragraphs = document.querySelectorAll(selector);
            paragraphs.forEach(p => {
                // Only take direct text to avoid duplication? No, innerText handles it.
                // But we need to be careful about duplication.
                // Let's stick to block elements for generic sites to be safe.
                if (['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'LI'].includes(p.tagName)) {
                    const text = (p as HTMLElement).innerText;
                    if (text && text.length > 20) {
                        fullText += text + "\n\n";
                    }
                }
            });
        }

        // If that fails, just body text (only for generic sites)
        if (!fullText.trim() && !isSupportedApp) {
            // Safer fallback: Use TreeWalker to exclude inputs
            const walker = document.createTreeWalker(
                document.body,
                NodeFilter.SHOW_TEXT,
                {
                    acceptNode: (node) => {
                        const parent = node.parentElement;
                        if (!parent) return NodeFilter.FILTER_REJECT;

                        // Exclude inputs
                        if ((parent as HTMLElement).isContentEditable) return NodeFilter.FILTER_REJECT;
                        if (parent.getAttribute('role') === 'textbox') return NodeFilter.FILTER_REJECT;
                        if (parent.closest('[contenteditable="true"]')) return NodeFilter.FILTER_REJECT;

                        const tag = parent.tagName.toLowerCase();
                        if (['script', 'style', 'noscript', 'input', 'textarea', 'select', 'button'].includes(tag)) return NodeFilter.FILTER_REJECT;

                        return NodeFilter.FILTER_ACCEPT;
                    }
                }
            );

            let node;
            while (node = walker.nextNode()) {
                const text = node.textContent?.trim();
                if (text && text.length > 20) {
                    fullText += text + "\n";
                }
            }
        }

        // Logic for Empty Conversations
        if (!fullText || fullText.trim().length < minLength) {
            // Don't throw here yet, let the final check handle it
        }

        collectImages(document);

        if (fullText && fullText.length > minLength) {
            return {
                url,
                title,
                platform: platform === 'generic' && isSupportedApp ? 'generic' : platform, // Keep platform if detected
                conversation: [],
                rawText: fullText,
                images: images.slice(0, 10) // Limit to 10 images to avoid payload issues
            };
        }
    }

    // Validate: Check if we actually found any content
    const hasConversation = conversation.length > 0;
    const hasRawText = conversation.map(t => t.text).join('').length > 20; // Lowered threshold

    if (!hasConversation || !hasRawText) {
        // DESPERATE MODE: If structured scraping failed, just grab the body text.
        // This is a last resort to ensure we never return "No conversation found" if there is text on screen.
        console.warn("Summarai: Structured scraping failed. Falling back to body text.");

        // Safer fallback: Use TreeWalker to exclude inputs even in desperate mode
        let bodyText = "";
        const walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode: (node) => {
                    const parent = node.parentElement;
                    if (!parent) return NodeFilter.FILTER_REJECT;

                    // Exclude inputs
                    if ((parent as HTMLElement).isContentEditable) return NodeFilter.FILTER_REJECT;
                    if (parent.getAttribute('role') === 'textbox') return NodeFilter.FILTER_REJECT;
                    if (parent.closest('[contenteditable="true"]')) return NodeFilter.FILTER_REJECT;

                    const tag = parent.tagName.toLowerCase();
                    if (['script', 'style', 'noscript', 'input', 'textarea', 'select', 'button'].includes(tag)) return NodeFilter.FILTER_REJECT;

                    return NodeFilter.FILTER_ACCEPT;
                }
            }
        );

        let node;
        while (node = walker.nextNode()) {
            const text = node.textContent?.trim();
            if (text && text.length > 20) {
                bodyText += text + "\n\n";
            }
        }

        if (bodyText.length > 50) {
            return {
                url,
                title,
                platform,
                conversation: [{ role: 'assistant', text: bodyText }], // Treat whole page as one block
                rawText: bodyText,
                images: images.slice(0, 10)
            };
        }

        // Only throw if even the body text is empty
        throw new Error("No conversation found on this page. Start a chat first, then generate a summary.");
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
