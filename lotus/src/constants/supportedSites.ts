export const SUPPORTED_SITES = [
    // Major AI Chatbots
    { name: 'ChatGPT', domain: 'chatgpt.com', url: 'https://chatgpt.com' },
    { name: 'Claude', domain: 'claude.ai', url: 'https://claude.ai' },
    { name: 'OpenAI', domain: 'openai.com', url: 'https://openai.com' },
    { name: 'Perplexity', domain: 'perplexity.ai', url: 'https://perplexity.ai' },
    { name: 'Gemini', domain: 'gemini.google.com', url: 'https://gemini.google.com' },
    { name: 'Meta AI', domain: 'meta.ai', url: 'https://meta.ai' },
    { name: 'Microsoft Copilot', domain: 'copilot.microsoft.com', url: 'https://copilot.microsoft.com' },
    { name: 'Poe', domain: 'poe.com', url: 'https://poe.com' },
    { name: 'Character.AI', domain: 'character.ai', url: 'https://character.ai' },
    { name: 'You.com', domain: 'you.com', url: 'https://you.com' },
    { name: 'Pi', domain: 'pi.ai', url: 'https://pi.ai' },
    { name: 'HuggingChat', domain: 'huggingface.co', url: 'https://huggingface.co/chat' },
    { name: 'DeepSeek', domain: 'deepseek.com', url: 'https://deepseek.com' },
    { name: 'Phind', domain: 'phind.com', url: 'https://phind.com' },

    // AI Code Editors
    { name: 'Cursor', domain: 'cursor.sh', url: 'https://cursor.sh' },

    // Design Tools
    { name: 'Figma', domain: 'figma.com', url: 'https://figma.com' },
    { name: 'Visily', domain: 'visily.ai', url: 'https://visily.ai' },
    { name: 'Uizard', domain: 'uizard.io', url: 'https://uizard.io' },
    { name: 'UX Magic', domain: 'uxmagic.ai', url: 'https://uxmagic.ai' },
    { name: 'Banani', domain: 'banani.co', url: 'https://banani.co' },

    // Development Platforms
    { name: 'Emergent', domain: 'app.emergent.sh', url: 'https://app.emergent.sh' },
    { name: 'Rocket', domain: 'rocket.new', url: 'https://rocket.new' },
    { name: 'Lovable', domain: 'lovable.dev', url: 'https://lovable.dev' },
    { name: 'Bolt', domain: 'bolt.new', url: 'https://bolt.new' },
    { name: 'Base44', domain: 'base44.com', url: 'https://base44.com' },
    { name: 'Create XYZ', domain: 'create.xyz', url: 'https://create.xyz' },
    { name: 'Memex', domain: 'memex.tech', url: 'https://memex.tech' },

    // No-Code/Low-Code Platforms
    { name: 'BuildFire', domain: 'buildfire.com', url: 'https://buildfire.com' },
    { name: 'Glide', domain: 'glideapps.com', url: 'https://glideapps.com' },
    { name: 'Flatlogic', domain: 'flatlogic.com', url: 'https://flatlogic.com' },
    { name: 'Retool', domain: 'retool.com', url: 'https://retool.com' },
    { name: 'UI Bakery', domain: 'uibakery.io', url: 'https://uibakery.io' },
    { name: 'Zoho', domain: 'zoho.com', url: 'https://zoho.com' },
    { name: 'Appy Pie', domain: 'appypie.com', url: 'https://appypie.com' },
];

export const isUrlSupported = (url: string): boolean => {
    // Normalize URL to handle www variants
    const normalizedUrl = url.replace('www.', '').toLowerCase();

    // Only support URLs that match one of the SUPPORTED_SITES domains
    return SUPPORTED_SITES.some(site => normalizedUrl.includes(site.domain));
};

export const getCurrentSite = (url: string) => {
    // Normalize URL to handle www variants
    const normalizedUrl = url.replace('www.', '');
    return SUPPORTED_SITES.find(site => normalizedUrl.includes(site.domain));
};
