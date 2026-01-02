/**
 * Cloudflare Worker for Tiger Extension (Production Smart v22)
 * MODEL: Gemini 1.5 Flash & OpenAI
 * FEATURES: Multimodal (Images), Clean Text, Q&A Context, Tone/Format Control
 * FIX: 3 Tones (Normal/Professional/Creative)
 */

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export default {
    async fetch(request, env, ctx) {
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

        // --- WELCOME EMAIL ENDPOINT ---
        if (request.method === 'POST' && url.pathname === '/send-welcome-email') {
            try {
                const body = await request.json();
                const { email, name } = body;

                if (!email) {
                    return new Response(JSON.stringify({ error: "Email is required" }), {
                        status: 400,
                        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
                    });
                }

                const firstName = name ? name.split(' ')[0] : 'there';

                // Email HTML Template
                const emailHtml = `
                    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                        <div style="text-align: center; margin-bottom: 32px;">
                            <img src="https://www.superextension.in/logo.png" alt="SummarAI" style="width: 64px; height: 64px;" />
                        </div>
                        
                        <p style="font-size: 16px; color: #333; line-height: 1.6;">Hey ${firstName},</p>
                        
                        <p style="font-size: 16px; color: #333; line-height: 1.6;">Welcome to <strong>SummarAI</strong>! We're excited to have you on board. 🚀</p>
                        
                        <p style="font-size: 16px; color: #333; line-height: 1.6;">A few things to note:</p>
                        
                        <ul style="font-size: 16px; color: #333; line-height: 1.8; padding-left: 24px;">
                            <li>You now have <strong>10 free summaries per day</strong> (up from 5 for guests).</li>
                            <li>Your summary history is now synced across devices.</li>
                            <li>Works on <strong>25+ AI platforms</strong> including ChatGPT, Gemini, and Claude.</li>
                        </ul>
                        
                        <p style="font-size: 16px; color: #333; line-height: 1.6;">We're constantly improving and adding new features. Reply to this email if you have any questions!</p>
                        
                        <p style="font-size: 16px; color: #333; line-height: 1.6;">Happy summarizing! 🎉</p>
                        
                        <p style="font-size: 16px; color: #333; line-height: 1.6; margin-top: 24px;">
                            <strong>Bharath Amaravadhi</strong><br/>
                            <span style="color: #666;">Founder, SummarAI</span>
                        </p>
                        
                        <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;"/>
                        
                        <p style="font-size: 12px; color: #999; text-align: center;">
                            Cursor Layout LLP | <a href="mailto:amaravadhibharath@gmail.com" style="color: #999;">Contact Support</a>
                        </p>
                    </div>
                `;

                // Use Resend API (serverless-compatible, 100 free/day)
                const resendApiKey = env.RESEND_API_KEY;

                if (!resendApiKey) {
                    console.log("RESEND_API_KEY not configured");
                    return new Response(JSON.stringify({ success: false, error: "Email service not configured" }), {
                        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
                    });
                }

                const emailResponse = await fetch('https://api.resend.com/emails', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${resendApiKey}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        from: 'Bharath from SummarAI <hello@superextension.in>',
                        reply_to: 'amaravadhibharath@gmail.com',
                        to: email,
                        subject: "Bharath from SummarAI",
                        html: emailHtml
                    })
                });

                if (!emailResponse.ok) {
                    const errorData = await emailResponse.json();
                    console.error("Resend error:", errorData);
                    return new Response(JSON.stringify({ success: false, error: errorData.message || "Email failed" }), {
                        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
                    });
                }

                return new Response(JSON.stringify({ success: true }), {
                    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
                });

            } catch (error) {
                console.error("Welcome email error:", error);
                return new Response(JSON.stringify({ error: error.message }), {
                    status: 500,
                    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
                });
            }
        }



        if (request.method !== 'POST') return new Response('Method Not Allowed', { status: 405, headers: CORS_HEADERS });

        try {
            const body = await request.json();
            const { content, options, provider = 'auto', deviceId, additionalInfo } = body;

            // --- AUTHENTICATION & QUOTA LOGIC ---
            let userEmail = null;
            let quotaKey = "";
            let limit = 5; // Default Guest Limit

            // 1. Check for Auth Token
            const authHeader = request.headers.get('Authorization');
            if (authHeader && authHeader.startsWith('Bearer ')) {
                const token = authHeader.split(' ')[1];
                // Try access_token verification via UserInfo endpoint to get Name + Email
                const verifyResp = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (verifyResp.ok) {
                    const userInfo = await verifyResp.json();
                    userEmail = userInfo.email;
                    const userName = userInfo.name || "Unknown";

                    console.log(`[Auth] User Identified: ${userEmail} (${userName})`);

                    // Sync to Google Sheets (Fire and Forget)
                    if (env.SHEETS_WEBHOOK_URL) {
                        ctx.waitUntil(
                            fetch(env.SHEETS_WEBHOOK_URL, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    name: userName,
                                    email: userEmail
                                })
                            }).catch(err => console.error("Sheets Sync Error:", err))
                        );
                    }

                    limit = 10; // Free Logged-in User Limit

                    // Check Pro Status from KV
                    const tier = await env.USER_QUOTA.get(`tier:${userEmail}`);
                    if (tier === 'PRO') {
                        limit = 100;
                    }
                }
            }

            // --- ACTIVATE PRO BETA ENDPOINT (Internal) ---
            if (request.method === 'POST' && url.pathname === '/activate-pro-beta') {
                try {
                    const { email } = await request.json();
                    if (!email) throw new Error("Email required");

                    // Set Tier to PRO
                    await env.USER_QUOTA.put(`tier:${email}`, 'PRO');

                    return new Response(JSON.stringify({ success: true, tier: 'PRO' }), {
                        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
                    });
                } catch (e) {
                    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: CORS_HEADERS });
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
                    ? "Daily Quota Exceeded (10/10). Upgrade to Pro for 100 summaries!"
                    : "Guest Quota Exceeded (5/5). Sign in for 10 more!";

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
                ? "FORMAT: BULLETED LIST (STRICT). Output the summary as a bulleted list. Break down the narrative into logical steps or points. Use hyphens (-) for each point. Ensure the CONTENT is consistent with the paragraph version, just structured differently."
                : options?.format === 'XML'
                    ? `FORMAT: XML (STRICT). Output a structured XML document with the following schema:
<?xml version="1.0" encoding="UTF-8"?>
<summary>
  <task>primary action (e.g., create_story, build_app, design_page)</task>
  <target_audience>
    <grade_level>class X or null</grade_level>
    <age_range>age range or null</age_range>
    <description>brief description or null</description>
  </target_audience>
  <characters>
    <character>character 1</character>
    <!-- more characters -->
  </characters>
  <objects>
    <object>object 1</object>
    <!-- more objects -->
  </objects>
  <setting>
    <location>primary location or null</location>
    <weather>weather condition or null</weather>
    <time>time of day or null</time>
    <background_elements>
      <element>element 1</element>
      <!-- more elements -->
    </background_elements>
  </setting>
  <technical_requirements>
    <requirement>requirement 1</requirement>
    <!-- more requirements -->
  </technical_requirements>
  <features>
    <feature>feature 1</feature>
    <!-- more features -->
  </features>
  <constraints>
    <constraint>constraint 1</constraint>
    <!-- more constraints -->
  </constraints>
  <consolidated_request>human-readable summary of the entire request</consolidated_request>
</summary>
Ensure all elements are present (use empty tags for missing data). The XML must be valid and well-formed.`
                    : options?.format === 'JSON'
                        ? `FORMAT: JSON (STRICT). Output a structured JSON object with the following schema:
{
  "task": "primary action (e.g., create_story, build_app, design_page)",
  "target_audience": {
    "grade_level": "class X or null",
    "age_range": "age range or null",
    "description": "brief description or null"
  },
  "characters": ["array of characters/subjects or empty array"],
  "objects": ["array of objects/props or empty array"],
  "setting": {
    "location": "primary location or null",
    "weather": "weather condition or null",
    "time": "time of day or null",
    "background_elements": ["array of background details or empty array"]
  },
  "technical_requirements": ["array of technical specs or empty array"],
  "features": ["array of requested features or empty array"],
  "constraints": ["array of constraints or empty array"],
  "consolidated_request": "human-readable summary of the entire request"
}
Ensure all fields are present (use null or empty arrays for missing data). The JSON must be valid and parseable.`
                        : "FORMAT: Single well-structured paragraph (Default).";

            // Common System Prompt (Golden Backup v29 - WORKING VERSION)
            const systemPrompt = `
Role: You are an expert **Intent Architect**.

**ONE-LINE SYSTEM LAW (CORE DIRECTIVE):**
"Context explains intent. Intent survives. Everything else is noise."

**1. INTENT vs CONTEXT (DEFINITIONS)**
- **INTENT (KEEP):** What the user wants to end up with. Concrete instructions, decisions, constraints, changes.
  - *Example:* "Make the button blue", "Remove the login", "This is for class 5".
  - **Rule:** Intent is actionable and MUST survive to the final output.
- **CONTEXT (DISCARD):** Information that helps interpret intent but is not an instruction. Explanations, realizations, background thinking.
  - *Example:* "I think this kid is class 5", "Oh no, this won't work", "Actually, I realized...".
  - **Rule:** Context modifies intent (e.g., triggers an update) but does NOT appear verbatim in the final summary.

**2. STRUCTURAL MERGING (NOT LINGUISTIC)**
- **Rule:** Merge instructions that target the same object/attribute. We merge MEANING, not sentences.
- *Input:* "Add blue button... Make it larger... Change to red."
- *Output:* "Add a large red button." (Merged structurally).

**3. SAFE REMOVAL (DEDUPLICATION & SUPERSESSION)**
- **Latest Wins:** Later messages represent newer intent.
- **Superseded:** "Make background white" -> "Change to black" = **Black** (White is removed).
- **Reverted:** "Add dark mode" -> "No, remove dark mode" = **Nothing** (Both removed).

**4. SOFT LANGUAGE = STRONG INTENT**
- Users do not speak in code. Treat these as EQUIVALENT:
  - "Update this to class 5"
  - "This kid is class 5 it seems"
  - "Oh, he's actually in class 5"
- **Rule:** All three mean **Override Grade -> Class 5**. Soft language is NOT weak intent.

**5. SUMMARY SCOPE (IMPLEMENTATION-READY)**
- **What it IS:** A single source of truth. "If I start fresh, what exactly should I build?"
- **What it is NOT:** A chat recap, a transcript, or a reasoning log.
- **Rule:** Do not mention "User changed X to Y". Just state **Y**.

**6. EXECUTION RULES**
- **Action Execution:** If user says "Replace X with Y", **EXECUTE** it. Output "Y". Do not say "Replace X with Y".
   - **STRUCTURAL EXECUTION (INTEGRATED)**: If user says "Separate into A and B" or "Group by X":
     - **DO NOT** repeat the instruction "Separate into...".
     - **DO** integrate the structure directly into the sentence.
     - *Input:* "Include apples and cars. Separate into fruits and vehicles."
     - *Output:* "Include fruits (apples) and vehicles (cars)." (Integrated).
     - *BAD Output:* "Include apples and cars. Separate them." (Repeated instruction).

**7. PARANOID RECALL (SAFETY NET)**
- If a detail is mentioned **ONLY ONCE** and not overridden, **KEEP IT**.
- **DATA PRESERVATION (CRITICAL)**: Specific data values (Phone Numbers, Emails, URLs, API Keys, IDs, Codes, Addresses) are **ALWAYS INTENT**. Never drop them.
- **TECHNICAL CONTEXT IS INTENT**: Code snippets, JSON objects, data structures, and error messages are NOT noise. They are the *substance* of the intent. Preserve them.
- Dropping a unique fact or value is a failure.

**SAFETY CLAUSE:**
The examples provided in this system prompt (e.g., Diwali, Bananas, Cars) are for **LOGIC DEMONSTRATION ONLY**. NEVER include them in the output unless the user explicitly mentions them.

**USER SETTINGS:**
- Mode: ${options?.includeAI ? "**FULL-TEXT SUMMARY** (User + AI)" : "**PROMPT-ONLY MODE** (User Only)"}
- ${toneInstruction}
- ${formatInstruction}
${additionalInfo ? `- **USER INSTRUCTION:** ${additionalInfo}` : ""}

**OUTPUT FORMAT:**
Provide **ONLY** the consolidated prompt text.
- **NO META-LABELS**: Do not use labels like "Summary:", "Task:", "Goal:", "Output:".
- **SEMANTIC DISTINCTION (CRITICAL)**:
  - **Label (BAD):** "Summary: Create a login page." (The word 'Summary' describes the output).
  - **Content (GOOD):** "Create a summary of the login page." (The word 'summary' is part of the request).
  - **Rule:** Never use a word to *describe* the text you are generating. Just generate the text.
- **NO INTRODUCTORY PHRASES**: Do not start with "This is a summary of...", "The following is...", "Consolidated request:", "Here is the prompt:".
- **DIRECT START**: Start directly with the core requirement (e.g., "Create a...", "Build a...", "The project is...").
`;

            let finalProvider = provider;

            // SMART AUTO LOGIC (Golden Backup v29)
            if (provider === 'auto') {
                const contentLength = content.length || 0;
                if (contentLength > 50000) {
                    // Large content: Use Gemini (better context window)
                    finalProvider = 'google';
                } else {
                    // Small content: Use OpenAI (faster, cheaper)
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

                // Check for explicit search intent
                const searchTriggers = ["search", "find latest", "lookup", "check web", "google it"];
                // STRICT RULE: If User-Only mode (includeAI=false), NEVER search.
                // "no data from web... not negotiable"
                const shouldSearch = options?.includeAI
                    ? searchTriggers.some(trigger => content.toLowerCase().includes(trigger))
                    : false;

                const requestBody = {
                    contents: [{ parts: parts }]
                };

                // Only enable Google Search if explicitly requested AND in Full Mode
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
                    throw new Error(`Google API Error (Gemini 1.5): ${errorDetails}`);
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
                        max_tokens: 4000
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
