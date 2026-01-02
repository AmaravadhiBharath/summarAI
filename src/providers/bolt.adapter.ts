import type { ProviderAdapter } from "./provider-adapter";
import type { ScrapedMessage } from "../core/scraper/types";
import { extractTextRecursively } from "../core/utils";

export class BoltAdapter implements ProviderAdapter {
    name = "bolt";
    detect() {
        return location.hostname.includes("bolt.new");
    }

    async getConversation(): Promise<ScrapedMessage[]> {
        const conversation: ScrapedMessage[] = [];
        const text = extractTextRecursively(document.body);
        conversation.push({ role: 'user', content: text });
        return conversation;
    }
}
