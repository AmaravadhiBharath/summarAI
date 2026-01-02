import type { ProviderAdapter } from "./provider-adapter";
import type { ScrapedMessage } from "../core/scraper/types";
import { extractTextRecursively } from "../core/utils";

export class Base44Adapter implements ProviderAdapter {
    name = "base44";
    detect() {
        return location.hostname.includes("base44.com");
    }

    async getConversation(): Promise<ScrapedMessage[]> {
        const conversation: ScrapedMessage[] = [];
        const text = extractTextRecursively(document.body);
        conversation.push({ role: 'user', content: text });
        return conversation;
    }
}
