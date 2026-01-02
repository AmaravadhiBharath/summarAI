export interface SummaryOptions {
    format: 'TXT' | 'JSON' | 'XML' | 'paragraph' | 'points';
    length: 'short' | 'medium' | 'long';
    tone?: 'normal' | 'professional' | 'casual' | 'creative';
    includeAI?: boolean;
    auto?: boolean;
    images?: string[];
    apiKey?: string;
    provider?: 'openai' | 'google' | 'auto';
    mode?: 'verbatim' | 'consolidate';
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


        console.log(`[Proxy] Sending to Worker (${provider})...`);
        console.log(`[Proxy] CONTENT PAYLOAD:`, content.slice(0, 500) + "..."); // Log first 500 chars
        console.log(`[Proxy] Options:`, JSON.stringify(options, null, 2));

        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(BACKEND_URL, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
                content: content, // Send raw content
                additionalInfo: additionalInfo, // Send as separate field
                provider: provider,
                deviceId: deviceId, // Send Device ID
                options: {
                    format: options.format,
                    includeAI: options.includeAI,
                    images: options.images,
                    tone: options.tone,
                    mode: options.mode // Pass mode
                }
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Worker Error: ${response.status}`);
        }

        const data = await response.json();

        // Save quota info to chrome storage for UI display
        if (data.quotaUsed !== undefined && data.quotaLimit !== undefined) {
            chrome.storage.local.set({
                quotaUsed: data.quotaUsed,
                quotaLimit: data.quotaLimit
            });
        }

        if (!data.summary || data.summary.trim().length === 0) {
            console.error("❌ Backend returned empty summary. Full Response:", JSON.stringify(data, null, 2));
            throw new Error("AI returned an empty summary. This might be due to content safety filters or an API issue.");
        }

        return data.summary;

    } catch (error: any) {
        console.error("Backend Error:", error);

        // Provide user-friendly error messages
        if (error.message?.includes('Failed to fetch')) {
            throw new Error("Unable to connect to backend. Please check your internet connection.");
        } else if (error.message?.includes('Method Not Allowed')) {
            throw new Error("Backend configuration error. Please contact support.");
        } else {
            throw new Error(error.message || "Failed to generate summary. Please try again.");
        }
    }
};
