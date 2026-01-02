export * from './chatgpt.adapter';
export * from './claude.adapter';
export * from './figma.adapter';
export * from './gemini.adapter';
export * from './generic.adapter';
export * from './lovable.adapter';
export * from './perplexity.adapter';
export * from './emergent.adapter';
export * from './rocket.adapter';
export * from './bolt.adapter';
export * from './base44.adapter';
export * from './meta-ai.adapter';
export * from './provider-adapter';

import { ChatGPTAdapter } from './chatgpt.adapter';
import { ClaudeAdapter } from './claude.adapter';
import { FigmaAdapter } from './figma.adapter';
import { GeminiAdapter } from './gemini.adapter';
import { GenericAdapter } from './generic.adapter';
import { LovableAdapter } from './lovable.adapter';
import { PerplexityAdapter } from './perplexity.adapter';
import { EmergentAdapter } from './emergent.adapter';
import { RocketAdapter } from './rocket.adapter';
import { BoltAdapter } from './bolt.adapter';
import { Base44Adapter } from './base44.adapter';
import { MetaAIAdapter } from './meta-ai.adapter';

const providers = [
    new ChatGPTAdapter(),
    new ClaudeAdapter(),
    new FigmaAdapter(),
    new GeminiAdapter(),
    new LovableAdapter(),
    new PerplexityAdapter(),
    new EmergentAdapter(),
    new RocketAdapter(),
    new BoltAdapter(),
    new Base44Adapter(),
    new MetaAIAdapter(),
    new GenericAdapter() // Must be last
];

export function getProvider() {
    return providers.find(p => p.detect()) || null;
}
