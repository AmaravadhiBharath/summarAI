/**
 * Cloudflare Worker for Tiger Extension (Production Smart v22)
 * MODEL: Gemini 2.0 Flash & OpenAI
 * FEATURES: Multimodal (Images), Clean Text, Q&A Context, Tone/Format Control
 * FIX: 3 Tones (Normal/Professional/Creative)
 */

import nodemailer from 'nodemailer';

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

export default {
    async fetch(request, env) {
        if (request.method === 'OPTIONS') return new Response(null, { headers: CORS_HEADERS });

        const url = new URL(request.url);

        // GET /selectors - Serve dynamic scraping configuration
        if (request.method === 'GET' && url.pathname === '/selectors') {
            return handleGetSelectors(env);
        }

        // POST /send-welcome-email - Send welcome email
        if (request.method === 'POST' && url.pathname === '/send-welcome-email') {
            return handleWelcomeEmail(request, env);
        }

        if (request.method !== 'POST') return new Response('Method Not Allowed', { status: 405, headers: CORS_HEADERS });

        try {
            const body = await request.json();
            const { content, options, provider = 'auto' } = body;

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

            let formatInstruction = "FORMAT: Single well-structured paragraph (Default).";
            if (options?.format === 'points') {
                formatInstruction = "FORMAT: BULLETED LIST (STRICT). You MUST output a bulleted list. Even if there is only one item, format it as a single bullet point.";
            } else if (options?.format === 'JSON') {
                formatInstruction = "FORMAT: JSON. Output valid JSON only. Structure the summary data appropriately.";
            } else if (options?.format === 'XML') {
                formatInstruction = "FORMAT: XML. Output valid XML only. Structure the summary data appropriately.";
            }

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
1. **CORE CONSOLIDATION (The Foundation)**:
   - **Merge Similar**: Combine related requests.
   - **Cancel Opposites**: "Add X" then "Remove X" = omit.
   - **Net Result**: "Add 3" -> "Remove 1" = "Include 2".
   
   - **PROMPT-ONLY MODE (Include AI = OFF)**:
     - **GOAL**: Extract and consolidate the user's intent. Output ONLY the consolidated prompt/request.
     - **CONSTRAINT**: Do NOT add meta-commentary like "Summarize the request to..." or "The user wants to...". Just output the actual consolidated content.
     - **EXAMPLE**:
       - Input: "generate red"
       - BAD: "Summarize the request to generate something red from a conversation with Gemini."
       - BAD: "The user wants to generate something red."
       - GOOD: "Generate something red."
       
       - Input: "How do I fix this bug?"
       - BAD: "Summarize the request to explain how to fix the bug."
       - GOOD: "Explain how to fix the bug."
       
       - Input: "Make it blue" then "Actually, make it green" then "Add a border"
       - GOOD: "Make it green and add a border."
     - **CONTENT**: ONLY consolidate what the USER asked. Ignore AI responses if present.

   - **FULL-TEXT MODE (Include AI = ON)**:
     - Consolidate the entire Q&A flow (User asked X, AI answered Y).
     - Capture the solution provided by the AI.
     - Output the consolidated conversation, not a description of it.

2. **ADDITIONAL INFO & WEB SEARCH**:
   - **NOTE**: Respect any [User Context/Note] provided at the start of the content.
   - The user may provide "Additional Info".
   - **IF** the user explicitly asks to "search", "find latest", "lookup", or "check web" -> **USE GOOGLE SEARCH**.
   - **IF** the user asks a specific question ("Explain this code") -> Answer it using the provided content.
   - **IF** the user asks for a "Report" -> Structure as a formal report with headers.
   - **OTHERWISE** -> Just apply the additional info as a constraint to the consolidation (e.g., "Focus on X").

3. **OUTPUT FORMAT**:
   - Clean plain text (unless "Report", JSON, or XML requested).
   - No markdown bolding/italics in standard summaries.
   - **List Mode**: Use bullet points if requested.
   - **NEVER** start with phrases like "Summarize the request to...", "The user wants to...", "This is about...", etc.
   - Output the ACTUAL consolidated content directly.
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

async function handleWelcomeEmail(request, env) {
    try {
        const { email, name } = await request.json();

        if (!email) throw new Error("Email is required");

        // Email Template
        const subject = "Bharath from SummarAI";
        const htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                <h2 style="color: #000;">Welcome to SummarAI, ${name || 'User'}!</h2>
                <p>Thanks for installing SummarAI. We're excited to help you summarize the web.</p>
                
                <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #eee;">
                    <h3 style="margin-top: 0; color: #2563eb;">🛡️ Double-Protection Logic</h3>
                    <p>We know reliability is key. That's why SummarAI uses a unique <strong>Double-Protection</strong> system:</p>
                    <ul style="line-height: 1.6;">
                        <li><strong>Smart Parsing:</strong> We intelligently extract conversation structures from supported sites like ChatGPT and Gemini.</li>
                        <li><strong>Fallback Safety:</strong> If structure extraction fails, our robust fallback engine captures the raw text, ensuring you never lose content.</li>
                    </ul>
                    <p>This ensures you get accurate summaries, every time.</p>
                </div>

                <p>Happy Summarizing!</p>
                <p><strong>The SummarAI Team</strong></p>
            </div>
        `;

        // Send via Gmail SMTP (Nodemailer)
        // REQUIRES: node_compat = true in wrangler.toml
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: env.GMAIL_USER || 'amaravadhibharath@gmail.com',
                pass: env.GMAIL_APP_PASSWORD
            }
        });

        await transporter.sendMail({
            from: `"SummarAI Team" <${env.GMAIL_USER || 'amaravadhibharath@gmail.com'}>`,
            to: email,
            subject: subject,
            html: htmlContent
        });

        return new Response(JSON.stringify({ success: true }), {
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
        });

    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), {
            status: 500,
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
        });
    }
}

async function handleGetSelectors(env) {
    try {
        // Fetch from Firebase Realtime Database
        const firebaseUrl = 'https://tiger-superextension-09-default-rtdb.firebaseio.com/scraping_config.json';

        const response = await fetch(firebaseUrl);

        if (!response.ok) {
            throw new Error('Failed to fetch selectors from Firebase');
        }

        const selectors = await response.json();

        // Return default config if Firebase returns null
        const config = selectors || {
            'gemini.google.com': {
                platform: 'gemini',
                selectors: ['[data-test-id*="message"]', '[data-message-id]', '.conversation-turn'],
                roleAttribute: 'data-test-id',
                userRoleValue: 'user-message'
            },
            'chatgpt.com': {
                platform: 'chatgpt',
                selectors: ['[data-message-author-role]', '.text-message'],
                roleAttribute: 'data-message-author-role',
                userRoleValue: 'user'
            },
            'claude.ai': {
                platform: 'claude',
                selectors: ['.font-user-message', '.font-claude-message'],
                userClassName: 'font-user-message'
            }
        };

        return new Response(JSON.stringify(config), {
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
        });

    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), {
            status: 500,
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
        });
    }
}
