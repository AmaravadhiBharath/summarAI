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

        const url = new URL(request.url);

        // --- DYNAMIC SELECTORS ENDPOINT ---
        if (request.method === 'GET' && url.pathname === '/selectors') {
            const selectors = {
                "chatgpt.com": {
                    "platform": "chatgpt",
                    "selectors": [
                        "[data-message-author-role]",
                        ".text-message",
                        ".markdown",
                        ".group/conversation-turn"
                    ],
                    "roleAttribute": "data-message-author-role",
                    "userRoleValue": "user",
                    "assistantRoleValue": "assistant"
                },
                "gemini.google.com": {
                    "platform": "gemini",
                    "containerSelectors": ["main", "[class*='scroll']", "body"],
                    "messageSelectors": [".message-content", "[data-message-id]", ".model-response-text", ".user-query"],
                    "excludePatterns": ["create an image", "write anything", "ask gemini"]
                },
                "claude.ai": {
                    "platform": "claude",
                    "selectors": [".font-user-message", ".font-claude-message"],
                    "userClass": "font-user-message"
                }
            };
            return new Response(JSON.stringify(selectors), {
                headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
            });
        }

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
                // Try access_token verification (works with chrome.identity.getAuthToken)
                const verifyResp = await fetch(`https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${token}`);

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

            // 3. Check Quota (Track for all, enforce for non-admin)
            const ADMIN_EMAIL = 'amaravadhibharath@gmail.com';
            const isAdmin = userEmail === ADMIN_EMAIL;

            let currentUsage = 0;
            try {
                const usageStr = await env.USER_QUOTA.get(quotaKey);
                if (usageStr) {
                    currentUsage = parseInt(usageStr, 10);
                }
            } catch (e) {
                console.error("KV Error:", e);
            }

            // Enforce quota only for non-admin users
            if (!isAdmin && currentUsage >= limit) {
                const message = userEmail
                    ? "Daily Quota Exceeded (14/14). Come back tomorrow!"
                    : "Guest Quota Exceeded (3/3). Sign in for more!";

                return new Response(JSON.stringify({
                    error: message,
                    quotaUsed: currentUsage,
                    quotaLimit: limit
                }), {
                    status: 429,
                    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
                });
            }

            // Don't increment quota yet - wait until successful summarization
            // await env.USER_QUOTA.put(quotaKey, (currentUsage + 1).toString(), { expirationTtl: 86400 });

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
                : options?.format === 'XML'
                    ? "FORMAT: XML (STRICT). Output the summary in valid XML format with a root element <summary> and appropriate child elements like <requirement>, <feature>, <constraint>, etc."
                    : options?.format === 'JSON'
                        ? "FORMAT: JSON (STRICT). Output the summary as a valid JSON object with keys like 'objective', 'requirements', 'features', 'constraints', etc. Ensure it's properly formatted and parseable."
                        : "FORMAT: Single well-structured paragraph (Default).";

            // Common System Prompt
            const systemPrompt = `
Role: You are an expert Context Consolidator.

Task: Analyze the provided conversation history to generate a "Master Context Summary" for a brand-new chat session.

**CORE INSTRUCTIONS:**
1. **Identify Evolution**: The conversation is a timeline.
   - **Topic Persistence (CRITICAL)**: The core subject **MUST ALWAYS BE INCLUDED** in the final output.
     * Example: User said "Make a Tic Tac Toe game", then later "Use Car vs Banana" → Output: "Create a Tic-Tac-Toe game with Car vs Banana" (NOT "Create a game with Car vs Banana").
     * Example: User said "Build a Calculator", then later "Add dark mode" → Output: "Build a Calculator with dark mode" (NOT "Add dark mode").
     * The game/app/project TYPE is the anchor - never drop it unless user explicitly says "change to X" or "make Y instead".
   - **Conflicts**: Later instructions **OVERRIDE** earlier ones (e.g., "Blue" -> "Red" = "Red").
   - **Additions**: Later instructions **ADD** to earlier ones (e.g., "Tic Tac Toe" -> "Add score" = "Tic Tac Toe with score").
   - **Prioritize Latest**: Use the most recent information as the source of truth for conflicts.
2. **Consolidate Requirements**: Strip away the back-and-forth and extract only the **FINAL**, desired parameters, technical constraints, and goals.
3. **Context Preservation**: If a user modifies a request (e.g., "change apple to watermelon"), **RESTATE THE FULL REQUEST** with the modification applied (e.g., "Make a Tic Tac Toe with Banana and Watermelon").
4. **Source Discrimination**: The input may contain mixed User and AI text. **IGNORE** AI responses (e.g., "Here is the code", "Please test", "I have updated"). Focus **ONLY** on the User's imperative commands.
5. **NEGATIVE CONSTRAINTS**:
   - Do NOT start with "Test the...", "Verify...", "Check...".
   - Do NOT summarize the "Gameplay" or "Features" list provided by the AI.
   - Do NOT mention "reporting issues".
   - **Clean State**: Do NOT mention the history of changes (e.g., "User changed X to Y"). Just state the **FINAL** requirement.
   - **NO AI EMBELLISHMENTS**: Do NOT add descriptive adjectives or design details that the user never mentioned (e.g., "bright yellow", "vibrant pink", "playful fonts", "smooth animations", "gradient backgrounds", "pulsing glow effects").
6. **User-Origin Only - ZERO TOLERANCE FOR ADDITIONS**:
   - **CRITICAL**: Include ONLY what the user **EXPLICITLY** typed. NO additions, NO inferences, NO assumptions.
   - **ABSOLUTE RULE**: If it's not in the user's prompts, DO NOT include it. Period.
   - **BANNED PHRASES** (never include these unless user typed them):
     * "appropriate colors/colours", "modern design", "professional look", "clean interface"
     * "responsive design", "smooth animations", "gradient backgrounds", "playful fonts"
     * "vibrant", "bright", "bold", "pulsing", "glowing", "shimmering"
     * "events, releases, and special dates" (unless user specified WHICH events/dates)
     * "relevant information", "additional features", "and more"
     * ANY descriptive adjective the user didn't say
     * ANY feature the user didn't explicitly request
   - **EXAMPLES OF FORBIDDEN ADDITIONS**:
     * User: "Car vs Banana" → Output: "Car vs Banana" (NOT "featuring Car 🚗 vs Banana 🍌 emojis with vibrant colors")
     * User: "score tracking" → Output: "score tracking" (NOT "color-coded score cards with animations")
     * User: "calendar for Mahesh Babu" → Output: "calendar for Mahesh Babu" (NOT "calendar with events, releases, and special dates")
   - **ZERO EMBELLISHMENT**: Do not add emojis, adjectives, design details, or vague placeholders.
   - **LITERAL TRANSCRIPTION**: Treat the user's words as sacred. Copy them exactly, consolidate duplicates, but never add new concepts.
   - **PRESERVE COMPARISONS**: If user says "like X" or "similar to Y", KEEP IT. Examples:
     * User: "white minimal like Rolex website" → Output: "white minimal like Rolex website" (NOT just "white minimal")
     * User: "animations like Apple" → Output: "animations like Apple" (NOT just "animations")
7. **Comprehensive Summary**: Consolidate ALL user requirements (e.g., game type, rules, colors, mechanics) into the final prompt. Do not drop context.
   - **CRITICAL**: Do NOT drop nouns, brand names, or references. If user mentioned "Rolex", "Apple", "Tesla", etc., INCLUDE them.
8. **Grammar & Structure**: Refine the raw input into professional, clear, and grammatically correct instructions.
9. **IGNORE SELF-PROMPTING / META-TEXT**:
   - If the input text contains the phrase "Analyze this entire conversation" or "Master Context Summary", **IGNORE** that specific block of text. Do not repeat it.
   - Do not output the text "Your Task:", "Goal:", or "Output Format:".
   - If the input is *only* a prompt, summarize the *intent* of that prompt (e.g. "Generate a master context summary"), do not echo the prompt itself.

**USER SETTINGS:**
- Mode: ${options?.includeAI ? "**FULL-TEXT SUMMARY** (User + AI)" : "**PROMPT-ONLY MODE** (User Only)"}
- ${toneInstruction}
- ${formatInstruction}

**OUTPUT FORMAT:**
Provide **ONLY** the consolidated prompt text.
- **NO GREETINGS**: Do not start with "Here is...", "The user wants...", "Summary:".
- **NO LABELS**: Do not use "Task:", "Goal:", "Output:".
- **DIRECT START**: Start directly with the core requirement (e.g., "Create a...", "Build a...", "The project is...").
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

            // SUCCESS! Now increment quota (only on successful summarization)
            await env.USER_QUOTA.put(quotaKey, (currentUsage + 1).toString(), { expirationTtl: 86400 });

            return new Response(JSON.stringify({
                summary,
                provider: finalProvider,
                quotaUsed: currentUsage + 1, // After increment
                quotaLimit: limit
            }), {
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
