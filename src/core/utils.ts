// Shared utilities for text cleaning

const BLOCKLIST = [
    'My stuff', 'Gemini', 'Upgrade to Google AI Plus', 'New chat',
    'Help', 'Settings', 'Activity', 'Gems', 'Recent', 'Sign out',
    'Google', 'Privacy', 'Terms', 'Expand', 'Collapse',
    'Cookie Preferences', 'Check important info', 'Accept all', 'Reject all'
];

const DEBUG_PATTERNS = [
    /^init\(/, /^function\(/, /^var /, /^window\./, /^console\./,
    /^\d+(\.\d+)?,\s*\d+(\.\d+)?/, // Number lists
    /AF_initDataCallback/, /jsname/, /WIZ_global_data/
];

export const cleanText = (text: string): string | null => {
    if (!text) return null;
    const trimmed = text.trim();
    if (trimmed.length < 1) return null;

    // 1. Blocklist Check (Exact or StartsWith)
    if (BLOCKLIST.some(blocked => trimmed === blocked || trimmed.startsWith(blocked + '\n'))) return null;
    if (trimmed.includes('Upgrade to')) return null;
    if (trimmed.startsWith("init('") || trimmed.startsWith('init("')) return null;

    // 2. Debug Pattern Check
    if (DEBUG_PATTERNS.some(pattern => pattern.test(trimmed))) return null;

    // 3. Length/Content Check
    // Allow short valid words (ok, yes, dog) but block garbage (v1, 1, x)
    if (trimmed.split(/\s+/).length < 2 && trimmed.length < 4) {
        if (!/^[a-zA-Z]+$/.test(trimmed)) return null;
    }

    return trimmed;
};

// Recursive function to extract text from a node, handling Shadow DOM
export const extractTextRecursively = (node: Node, ignoreClasses: string[] = []): string => {
    if (node.nodeType === Node.TEXT_NODE) {
        return node.textContent || "";
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as Element;
        const tag = el.tagName.toLowerCase();

        // Skip non-content tags
        if (['script', 'style', 'noscript', 'iframe', 'svg', 'path', 'meta', 'link', 'header', 'nav', 'footer'].includes(tag)) {
            return "";
        }

        // Skip Cookie Banners / Consent
        if (tag !== 'body' && tag !== 'html' && el.className && typeof el.className === 'string') {
            const lowerClass = el.className.toLowerCase();
            if (
                lowerClass.includes('cookie') ||
                lowerClass.includes('consent') ||
                lowerClass.includes('banner') ||
                lowerClass.includes('policy') ||
                ignoreClasses.some(cls => lowerClass.includes(cls))
            ) {
                return "";
            }
        }

        // VISIBILITY CHECK REMOVED: It was causing "No content found" on Gemini.
        // We will rely on the Global Regex Nuke to filter out hidden debug text like init().

        // REMOVED: Aggressive sidebar/menu filtering that was blocking content

        let text = "";

        // Handle Shadow Root
        if (el.shadowRoot) {
            Array.from(el.shadowRoot.childNodes).forEach(child => {
                text += extractTextRecursively(child, ignoreClasses);
            });
        }

        // Handle Children
        if (node.childNodes && node.childNodes.length > 0) {
            Array.from(node.childNodes).forEach(child => {
                text += extractTextRecursively(child, ignoreClasses);
            });
        }

        // Block-level elements should add a newline
        if (['div', 'p', 'section', 'article', 'li', 'br'].includes(tag)) {
            text += "\n";
        }

        return text;
    }

    return "";
};

export const collectImages = (root: Document | Element): string[] => {
    const images: string[] = [];
    try {
        const imgs = root.querySelectorAll('img');
        imgs.forEach(img => {
            if (img.width > 50 && img.height > 50 && img.src && !img.src.startsWith('data:')) {
                if (!images.includes(img.src)) images.push(img.src);
            }
        });
    } catch (e) {
        console.warn("Image collection failed", e);
    }
    return images.slice(0, 10);
};

export const deepQuerySelectorAll = (selector: string, root: Node = document): Element[] => {
    let nodes = Array.from((root as ParentNode).querySelectorAll(selector));
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, null);
    let node;
    while (node = walker.nextNode()) {
        if ((node as Element).shadowRoot) {
            nodes = [...nodes, ...deepQuerySelectorAll(selector, (node as Element).shadowRoot!)];
        }
    }
    return nodes;
};

/**
 * Ensures the service worker is awake and responsive before proceeding
 * Prevents "Could not establish connection. Receiving end does not exist" errors
 */
export const wakeUpServiceWorker = async (maxRetries = 3): Promise<boolean> => {
    for (let i = 0; i < maxRetries; i++) {
        try {
            // Send a ping to the service worker
            const response = await chrome.runtime.sendMessage({ type: 'TEST_CONNECTION' });

            if (response && response.status) {
                console.log('Service Worker is responsive:', response.status);
                return true;
            }

            // If no response, wait and retry
            await new Promise(resolve => setTimeout(resolve, 100 * (i + 1)));
        } catch (error) {
            console.warn(`SW wake attempt ${i + 1} failed:`, error);

            if (i < maxRetries - 1) {
                // Wait before retrying (exponential backoff)
                await new Promise(resolve => setTimeout(resolve, 100 * (i + 1)));
            }
        }
    }

    console.error('Service Worker failed to wake up after', maxRetries, 'attempts');
    return false;
};
