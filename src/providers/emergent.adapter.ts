import type { ProviderAdapter } from "./provider-adapter";
import type { ScrapedMessage } from "../core/scraper/types";
import { extractTextRecursively } from "../core/utils";

export class EmergentAdapter implements ProviderAdapter {
    name = "emergent";
    detect() {
        return location.hostname.includes("emergent.sh");
    }

    async getConversation(): Promise<ScrapedMessage[]> {
        const conversation: ScrapedMessage[] = [];
        let text = extractTextRecursively(document.body);
        if (!text || text.trim().length === 0) {
            text = document.body.innerText;
        }
        conversation.push({ role: 'user', content: text });
        return conversation;
    }
}
