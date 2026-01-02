export type Role = 'user' | 'assistant';

export interface ScrapedMessage {
    role: Role;
    content: string;
    index?: number; // For DOM-based sorting
}

export interface ScrapedContent {
    url: string;
    title: string;
    platform: 'chatgpt' | 'gemini' | 'claude' | 'generic';
    conversation: ScrapedMessage[];
    rawText: string; // Fallback for when structure fails
    images: string[];
}

export interface ScraperStrategy {
    name: string;
    detect: (url: string) => boolean;
    scrape: () => ScrapedMessage[];
}
