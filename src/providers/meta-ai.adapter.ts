import type { ProviderAdapter } from "./provider-adapter";
import type { ScrapedMessage } from "../core/scraper/types";
import { extractTextRecursively } from "../core/utils";

export class MetaAIAdapter implements ProviderAdapter {
    name = "meta-ai";
    detect() {
        return location.hostname.includes("meta.ai");
    }

    async getConversation(): Promise<ScrapedMessage[]> {
        const conversation: ScrapedMessage[] = [];
        // Meta AI usually has specific message containers.
        // Fallback to generic text extraction if specific selectors are unknown.
        const text = extractTextRecursively(document.body);
        conversation.push({ role: 'user', content: text });
        return conversation;
    }
}
