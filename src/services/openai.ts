export interface SummaryOptions {
    format: 'TXT' | 'JSON' | 'XML' | 'paragraph' | 'points';
    length: 'short' | 'medium' | 'long';
    tone?: 'normal' | 'professional' | 'casual' | 'creative';
    includeAI?: boolean;
    auto?: boolean;
    images?: string[];
    apiKey?: string;
    provider?: 'openai' | 'google' | 'auto';
}

// TODO: Replace with your actual deployed Worker URL
const BACKEND_URL = "https://tai-backend.amaravadhibharath.workers.dev";

export const generateSummary = async (
    content: string,
    options: SummaryOptions,
    provider: 'auto' | 'openai' | 'google' = 'auto',
    additionalInfo?: string,
    token?: string,
    deviceId?: string
): Promise<string> => {

    // Cloudflare Worker Proxy (Preferred)
    try {
        // Append additional info to content if present
        let finalContent = content;
        if (additionalInfo) {
            finalContent = `[User Context/Note: ${additionalInfo}]\n\n${content}`;
        }

        console.log(`[Proxy] Sending to Worker (${provider})...`);

        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(BACKEND_URL, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
                content: finalContent,
                provider: provider,
                deviceId: deviceId, // Send Device ID
                options: {
                    format: options.format,
                    includeAI: options.includeAI,
                    images: options.images,
                    tone: options.tone
                }
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Worker Error: ${response.status}`);
        }

        const data = await response.json();
        return data.summary;

    } catch (error: any) {
        console.error("Backend Error:", error);
        throw new Error(error.message || "Failed to connect to Tiger Backend.");
    }
};
