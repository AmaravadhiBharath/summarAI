/**
 * Cloudflare Worker for Tiger Extension (Production Smart v22)
 * MODEL: Gemini 2.0 Flash & OpenAI
 * FEATURES: Multimodal (Images), Clean Text, Q&A Context, Tone/Format Control
 * FIX: 3 Tones (Normal/Professional/Creative)
 */

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

export default {
    async fetch(request, env) {
        if (request.method === 'OPTIONS') return new Response(null, { headers: CORS_HEADERS });
        if (request.method !== 'POST') return new Response('Method Not Allowed', { status: 405, headers: CORS_HEADERS });

        try {
            const body = await request.json();
            const { content, options, provider = 'auto', deviceId } = body;

            // --- AUTHENTICATION & QUOTA LOGIC ---
            let userEmail = null;
            let quotaKey = "";
            let limit = 3; // Default Guest Limit

            // 1. Check for Auth Token
            const authHeader = request.headers.get('Authorization');
            if (authHeader && authHeader.startsWith('Bearer ')) {
                const token = authHeader.split(' ')[1];
                const verifyResp = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`);

                if (verifyResp.ok) {
                    const tokenInfo = await verifyResp.json();
                    userEmail = tokenInfo.email;
                    limit = 14; // Logged-in User Limit
                }
            }

            // 2. Determine Quota Key
            const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

            if (userEmail) {
                // Logged-in: Track by Email
                quotaKey = `quota:email:${userEmail}:${today}`;
            } else if (deviceId) {
                // Guest: Track by Device ID
                quotaKey = `quota:device:${deviceId}:${today}`;
            } else {
                // Fallback if neither provided (shouldn't happen with updated client)
                // Fail closed or allow strict limit? Let's require one.
                return new Response(JSON.stringify({ error: "Missing Identity (Login or Device ID)" }), {
                    status: 400,
                    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
                });
            }

            // 3. Check Quota
            let currentUsage = 0;
            try {
                const usageStr = await env.USER_QUOTA.get(quotaKey);
                if (usageStr) {
                    currentUsage = parseInt(usageStr, 10);
                }
            } catch (e) {
                console.error("KV Error:", e);
            }

            if (currentUsage >= limit) {
                const message = userEmail
                    ? "Daily Quota Exceeded (14/14). Come back tomorrow!"
                    : "Guest Quota Exceeded (3/3). Sign in for more!";

                return new Response(JSON.stringify({ error: message }), {
                    status: 429,
                    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
                });
            }

            // Increment Usage
            await env.USER_QUOTA.put(quotaKey, (currentUsage + 1).toString(), { expirationTtl: 86400 });

            if (!content) {
                throw new Error("No content provided to summarize.");
            }

            // --- TONE & FORMAT LOGIC ---
            let toneInstruction = "TONE: Balanced, clear, and neutral (Default/Normal).";
            let temperature = 0.7; // Default temp

            if (options?.tone === 'creative') {
                toneInstruction = "TONE: Creative, engaging, and slightly informal.";
                temperature = 0.9;
            } else if (options?.tone === 'professional') {
                toneInstruction = "TONE: Professional, precise, and objective.";
                temperature = 0.5;
            }

            const formatInstruction = options?.format === 'points'
                ? "FORMAT: BULLETED LIST (STRICT). You MUST output a bulleted list. Even if there is only one item, format it as a single bullet point."
                : "FORMAT: Single well-structured paragraph (Default).";

            // Common System Prompt
            const systemPrompt = `
Role & Purpose
You are a "Strict Prompt Consolidator" and "Intelligent Assistant".

Input Structure
- Conversation History: The content to process.
- User Settings:
  - Mode: ${options?.includeAI ? "**FULL-TEXT SUMMARY** (User + AI)" : "**PROMPT-ONLY MODE** (User Only)"}
  - ${toneInstruction}
  - ${formatInstruction}

**CRITICAL RULES:**
1. **CORE SUMMARIZATION (The Foundation)**:
   - **Merge Similar**: Combine related requests.
   - **Cancel Opposites**: "Add X" then "Remove X" = omit.
   - **Net Result**: "Add 3" -> "Remove 1" = "Include 2".
   
   - **PROMPT-ONLY MODE (Include AI = OFF)**:
     - **GOAL**: Rewrite the user's intent into a single imperative command.
     - **CONSTRAINT**: **DO NOT ANSWER** the user's question. **DO NOT** provide the solution.
     - **EXAMPLE**:
       - Input: "How do I fix this bug?"
       - BAD: "You can fix it by..." (This is an answer)
       - GOOD: "Explain how to fix the bug." (This is a summary)
     - **CONTENT**: ONLY summarize what the USER asked. Ignore AI responses if present.

   - **FULL-TEXT MODE (Include AI = ON)**:
     - Summarize the entire Q&A flow (User asked X, AI answered Y).
     - Capture the solution provided by the AI.

2. **ADDITIONAL INFO & WEB SEARCH**:
   - The user may provide "Additional Info".
   - **IF** the user explicitly asks to "search", "find latest", "lookup", or "check web" -> **USE GOOGLE SEARCH**.
   - **IF** the user asks a specific question ("Explain this code") -> Answer it using the provided content.
   - **IF** the user asks for a "Report" -> Structure as a formal report with headers.
   - **OTHERWISE** -> Just apply the additional info as a constraint to the summary (e.g., "Focus on X").

3. **OUTPUT FORMAT**:
   - Clean plain text (unless "Report" requested).
   - No markdown bolding/italics in standard summaries.
   - **List Mode**: Use bullet points if requested.
`;

            let finalProvider = provider;

            // SMART AUTO LOGIC
            if (provider === 'auto') {
                const contentLength = content.length || 0;
                if (contentLength > 50000) {
                    finalProvider = 'google';
                } else {
                    finalProvider = 'openai';
                }
            }

            let summary = "";

            // --- GOOGLE GEMINI (v1beta / gemini-2.0-flash) ---
            if (finalProvider === 'google') {
                const apiKey = env.GOOGLE_API_KEY;
                const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

                // Construct Parts (Text + Images)
                const parts = [{ text: `${systemPrompt}\n\nHere is the conversation content:\n\n${content}` }];

                // Handle Images (if present)
                if (options?.images && Array.isArray(options.images) && options.images.length > 0) {
                    for (const imgUrl of options.images) {
                        try {
                            let mimeType = "image/jpeg";
                            let data = "";

                            if (imgUrl.startsWith("data:")) {
                                // Base64 Data URL
                                const matches = imgUrl.match(/^data:(.+);base64,(.+)$/);
                                if (matches) {
                                    mimeType = matches[1];
                                    data = matches[2];
                                }
                            } else {
                                // External URL - Fetch it
                                const imgResp = await fetch(imgUrl);
                                if (imgResp.ok) {
                                    const arrayBuffer = await imgResp.arrayBuffer();
                                    data = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
                                    const contentType = imgResp.headers.get("content-type");
                                    if (contentType) mimeType = contentType;
                                }
                            }

                            if (data) {
                                parts.push({
                                    inlineData: {
                                        mimeType: mimeType,
                                        data: data
                                    }
                                });
                            }
                        } catch (e) {
                            console.error("Failed to process image:", imgUrl, e);
                        }
                    }
                }

                // Check for explicit search intent in the content (which includes additionalInfo)
                const searchTriggers = ["search", "find latest", "lookup", "check web", "google it"];
                const shouldSearch = searchTriggers.some(trigger => content.toLowerCase().includes(trigger));

                const requestBody = {
                    contents: [{ parts: parts }]
                };

                // Only enable Google Search if explicitly requested
                if (shouldSearch) {
                    requestBody.tools = [{ googleSearch: {} }];
                }

                const response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(requestBody)
                });

                const data = await response.json();

                if (!response.ok) {
                    const errorDetails = JSON.stringify(data.error || data);
                    throw new Error(`Google API Error (v22 - Gemini 2.0): ${errorDetails}`);
                }

                summary = data.candidates?.[0]?.content?.parts?.[0]?.text || "No summary generated.";

            }

            // --- OPENAI (STANDARD API) ---
            else {
                // Default / OpenAI
                const apiUrl = 'https://api.openai.com/v1/chat/completions';
                const apiKey = env.OPENAI_API_KEY;
                const model = 'gpt-4o-mini';

                // Construct Messages
                const messages = [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: `Here is the conversation content:\n\n${content}` }
                ];

                // Handle Images (OpenAI Vision)
                if (options?.images && Array.isArray(options.images) && options.images.length > 0) {
                    // OpenAI expects images in the user content array
                    const userContent = [{ type: "text", text: `Here is the conversation content:\n\n${content}` }];

                    for (const imgUrl of options.images) {
                        userContent.push({
                            type: "image_url",
                            image_url: {
                                url: imgUrl // OpenAI handles URLs directly (if public) or base64
                            }
                        });
                    }
                    // Replace the simple text content with the array
                    messages[1] = { role: 'user', content: userContent };
                }

                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${apiKey}`
                    },
                    body: JSON.stringify({
                        model: model,
                        messages: messages,
                        temperature: temperature, // Use dynamic temp
                        max_tokens: 1000
                    })
                });

                const data = await response.json();

                if (!response.ok) {
                    const errorDetails = JSON.stringify(data.error || data);
                    throw new Error(`${finalProvider} API Error: ${errorDetails}`);
                }

                summary = data.choices[0].message.content;
            }

            // Cleanup markdown code blocks
            summary = summary.replace(/^```\w*\n?/, '').replace(/\n?```$/, '');

            return new Response(JSON.stringify({ summary, provider: finalProvider }), {
                headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
            });

        } catch (error) {
            return new Response(JSON.stringify({ error: error.message }), {
                status: 500,
                headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
            });
        }
    }
};
