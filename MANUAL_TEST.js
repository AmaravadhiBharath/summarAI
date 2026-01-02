// ==========================================
// TIGER EXTENSION - MANUAL ADAPTER TESTER
// ==========================================
// Copy and paste this ENTIRE script into the Chrome Console (F12 -> Console)
// on the page you want to test (ChatGPT, Claude, Gemini, etc.).
// It will run the exact scraping logic used by the extension.
// ==========================================

(async function () {
    console.clear();
    console.log("%c🐯 Tiger Adapter Tester Initialized...", "color: orange; font-weight: bold; font-size: 14px;");

    // --- UTILITIES ---
    const BLOCKLIST = ['My stuff', 'Gemini', 'Upgrade to Google AI Plus', 'New chat', 'Help', 'Settings', 'Activity', 'Gems', 'Recent', 'Sign out', 'Google', 'Privacy', 'Terms', 'Expand', 'Collapse', 'Cookie Preferences', 'Check important info', 'Accept all', 'Reject all'];
    const DEBUG_PATTERNS = [/^init\(/, /^function\(/, /^var /, /^window\./, /^console\./, /^\d+(\.\d+)?,\s*\d+(\.\d+)?/, /AF_initDataCallback/, /jsname/, /WIZ_global_data/];

    function cleanText(text) {
        if (!text) return null;
        const trimmed = text.trim();
        if (trimmed.length < 1) return null;
        if (BLOCKLIST.some(blocked => trimmed === blocked || trimmed.startsWith(blocked + '\n'))) return null;
        if (trimmed.includes('Upgrade to')) return null;
        if (trimmed.startsWith("init('") || trimmed.startsWith('init("')) return null;
        if (DEBUG_PATTERNS.some(pattern => pattern.test(trimmed))) return null;
        if (trimmed.split(/\s+/).length < 2 && trimmed.length < 4) {
            if (!/^[a-zA-Z]+$/.test(trimmed)) return null;
        }
        return trimmed;
    }

    function extractTextRecursively(node, ignoreClasses = []) {
        if (node.nodeType === Node.TEXT_NODE) return node.textContent || "";
        if (node.nodeType === Node.ELEMENT_NODE) {
            const el = node;
            const tag = el.tagName.toLowerCase();
            if (['script', 'style', 'noscript', 'iframe', 'svg', 'path', 'meta', 'link', 'header', 'nav', 'footer'].includes(tag)) return "";
            if (el.className && typeof el.className === 'string') {
                const lowerClass = el.className.toLowerCase();
                if (lowerClass.includes('cookie') || lowerClass.includes('consent') || lowerClass.includes('banner') || lowerClass.includes('policy') || ignoreClasses.some(cls => lowerClass.includes(cls))) return "";
            }
            let text = "";
            if (el.shadowRoot) Array.from(el.shadowRoot.childNodes).forEach(child => text += extractTextRecursively(child, ignoreClasses));
            if (node.childNodes && node.childNodes.length > 0) Array.from(node.childNodes).forEach(child => text += extractTextRecursively(child, ignoreClasses));
            if (['div', 'p', 'section', 'article', 'li', 'br'].includes(tag)) text += "\n";
            return text;
        }
        return "";
    }

    function deepQuerySelectorAll(selector, root = document) {
        let nodes = Array.from(root.querySelectorAll(selector));
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, null);
        let node;
        while (node = walker.nextNode()) {
            if (node.shadowRoot) nodes = [...nodes, ...deepQuerySelectorAll(selector, node.shadowRoot)];
        }
        return nodes;
    }

    // --- ADAPTERS ---
    const adapters = [
        {
            name: "chatgpt",
            detect: () => location.hostname.includes("chat.openai.com") || location.hostname.includes("chatgpt.com"),
            scrape: async () => {
                const conversation = [];
                // Strategy 1: Data Attributes
                const turns = document.querySelectorAll('[data-message-author-role]');
                if (turns.length > 0) {
                    turns.forEach(turn => {
                        const role = turn.getAttribute('data-message-author-role');
                        const text = turn.innerText || turn.textContent || "";
                        if (role && text.trim()) conversation.push({ role, content: text.trim() });
                    });
                    return conversation;
                }
                // Strategy 2: Article Tags
                const articles = document.querySelectorAll('article');
                articles.forEach((article, index) => {
                    const text = article.innerText?.trim();
                    if (text) conversation.push({ role: index % 2 === 0 ? 'user' : 'assistant', content: text });
                });
                return conversation;
            }
        },
        {
            name: "claude",
            detect: () => window.location.hostname.includes('claude.ai'),
            scrape: async () => {
                const conversation = [];
                const messages = document.querySelectorAll('.font-user-message, .font-claude-message');
                messages.forEach(msg => {
                    const isUser = msg.classList.contains('font-user-message');
                    const text = cleanText(msg.innerText);
                    if (text) conversation.push({ role: isUser ? 'user' : 'assistant', content: text });
                });
                return conversation;
            }
        },
        {
            name: "gemini",
            detect: () => location.hostname.includes("gemini.google.com"),
            scrape: async () => {
                return window.__GEMINI_CONVERSATION__ || [];
            }
        },
        {
            name: "figma",
            detect: () => window.location.hostname.includes('figma.com'),
            scrape: async () => {
                const conversation = [];
                const comments = deepQuerySelectorAll('.comment--comment--...'); // Simplified for test
                // Using generic fallback for Figma in this test script as deep selectors are complex
                const text = extractTextRecursively(document.body);
                return [{ role: 'user', content: text.substring(0, 500) + "..." }];
            }
        },
        {
            name: "lovable",
            detect: () => window.location.hostname.includes('lovable.dev') || window.location.hostname.includes('lovable.ai'),
            scrape: async () => {
                const conversation = [];
                const messages = document.querySelectorAll('[data-message-role]');
                if (messages.length > 0) {
                    messages.forEach(msg => {
                        const role = msg.getAttribute('data-message-role');
                        const text = extractTextRecursively(msg);
                        if (text) conversation.push({ role, content: text.trim() });
                    });
                    return conversation;
                }
                const fallback = document.querySelectorAll('.prose');
                fallback.forEach((msg, i) => {
                    conversation.push({ role: i % 2 === 0 ? 'user' : 'assistant', content: msg.innerText });
                });
                return conversation;
            }
        },
        {
            name: "generic",
            detect: () => true,
            scrape: async () => {
                const text = extractTextRecursively(document.body, ['nav', 'footer', 'sidebar', 'menu']);
                return [{ role: 'user', content: text.substring(0, 1000) }]; // Limit for test
            }
        }
    ];

    // --- EXECUTION ---
    const adapter = adapters.find(a => a.detect());
    if (adapter) {
        console.log(`%c✅ Adapter Detected: ${adapter.name.toUpperCase()}`, "color: green; font-weight: bold; font-size: 16px;");
        try {
            const result = await adapter.scrape();
            console.log(`%c📄 Scraped ${result.length} messages`, "color: blue; font-weight: bold;");
            console.table(result.slice(0, 5)); // Show first 5
            if (result.length === 0) {
                console.warn("⚠️ No messages found. Selectors might need tweaking.");
            } else {
                console.log("🎉 SUCCESS! The adapter is working.");
            }
        } catch (e) {
            console.error("❌ Scraping Failed:", e);
        }
    } else {
        console.error("❌ No adapter matched this page.");
    }

})();
