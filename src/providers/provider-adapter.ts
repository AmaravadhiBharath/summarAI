import type { ScrapedMessage } from '../core/scraper/types';

export interface ProviderAdapter {
    name: string;
    detect(): boolean;
    getConversation(): Promise<ScrapedMessage[]>;
}
