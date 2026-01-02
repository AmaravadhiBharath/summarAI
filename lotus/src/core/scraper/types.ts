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

// Error types for better user feedback
export interface ScraperError {
    code: 'EMPTY_PAGE' | 'SHADOW_DOM' | 'NO_CONTENT' | 'BLOCKED' | 'VALIDATION_FAILED';
    message: string;
    suggestion: string;
    platform?: string;
}

export type ScraperResult = ScrapedContent | ScraperError;

// Type guard to check if result is an error
export function isScraperError(result: ScraperResult): result is ScraperError {
    return 'code' in result;
}
