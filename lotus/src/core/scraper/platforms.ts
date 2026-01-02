export type Platform = 'chatgpt' | 'gemini' | 'claude' | 'generic';

export interface PlatformConfig {
    name: Platform;
    detect: (url: string) => boolean;
    userSelector: string;
    aiSelector: string;
    shadowDOM: boolean;
    minContentLength: number;
}

export const PLATFORMS: PlatformConfig[] = [
    {
        name: 'chatgpt',
        detect: (url) => url.includes('chat.openai.com') || url.includes('chatgpt.com'),
        // ChatGPT is very semantic. User messages explicitly have this attribute.
        userSelector: '[data-message-author-role="user"]',
        aiSelector: '[data-message-author-role="assistant"]',
        shadowDOM: false,
        minContentLength: 10
    },
    {
        name: 'claude',
        detect: (url) => url.includes('claude.ai'),
        // Claude uses specific classes.
        userSelector: '.font-user-message',
        aiSelector: '.font-claude-message',
        shadowDOM: true,
        minContentLength: 10
    },
    {
        name: 'gemini',
        detect: (url) => url.includes('gemini.google.com'),
        // Gemini is tricky. It often uses 'user-query' or specific attributes.
        // Fallback: We might need to look for specific containers.
        userSelector: 'user-query, .user-query, [data-role="user"]',
        aiSelector: 'model-response, .model-response, [data-role="model"]',
        shadowDOM: true,
        minContentLength: 10
    }
];

export const detectPlatform = (url: string): PlatformConfig => {
    const detected = PLATFORMS.find(p => p.detect(url));

    if (detected) {
        console.log(`Lotus: Detected platform: ${detected.name}`);
        return detected;
    }

    console.log('Lotus: Using generic platform');
    return {
        name: 'generic',
        detect: () => true,
        // Generic fallback: Try to guess based on common patterns, but this is risky.
        // Better to be conservative.
        userSelector: '[data-message-author-role="user"], .user-message, .human',
        aiSelector: '[data-message-author-role="assistant"], .ai-message, .bot',
        shadowDOM: false,
        minContentLength: 50
    };
};
