# 🏗️ Lotus Architecture & Workflow Documentation

**Version:** 1.0.6  
**Date:** December 27, 2025  
**Status:** Production

---

## 📊 System Architecture Overview

### **No Adapters - Direct Pipeline**

Lotus uses a **simple, direct pipeline** without adapter pattern:

```
Content Script → Scraper → Normalizer → Processor → AI Backend → UI
```

---

## 🗂️ Directory Structure

```
src/
├── core/
│   ├── scraper/
│   │   ├── index.ts          # Export
│   │   ├── scraper.ts        # Main scraping logic
│   │   └── types.ts          # Type definitions
│   ├── pipeline/
│   │   ├── normalizer.ts     # Clean & deduplicate
│   │   └── processor.ts      # Format for AI
│   └── utils.ts              # Helper functions
├── services/
│   ├── openai.ts             # AI backend communication
│   ├── chrome-auth.ts        # Authentication
│   ├── firebase-extension.ts # Firestore (no Auth SDK)
│   └── analytics.ts          # PostHog tracking
└── views/
    └── HomeView.tsx          # Main UI orchestration
```

---

## 📐 Data Schema

### **1. ScrapedMessage**
```typescript
interface ScrapedMessage {
    role: 'user' | 'assistant';
    content: string;
    index?: number;  // For DOM-based sorting
}
```

### **2. ScrapedContent**
```typescript
interface ScrapedContent {
    url: string;
    title: string;
    platform: 'chatgpt' | 'gemini' | 'claude' | 'generic';
    conversation: ScrapedMessage[];
    rawText: string;  // Fallback
    images: string[];
}
```

### **3. ProcessOptions**
```typescript
interface ProcessOptions {
    includeAI: boolean;  // Include AI responses or just user prompts
}
```

### **4. HistoryItem**
```typescript
interface HistoryItem {
    id: number;
    summary: string;
    date: string;  // ISO format
    preview: string;  // First 100 chars
    platform: string;
    type: 'prompt' | 'prompt+response' | 'prompt+response+image';
}
```

---

## 🔄 Complete Workflow

### **Step 1: User Clicks "Generate Summary"**

**Location:** `HomeView.tsx` → `handleGenerate()`

```typescript
const handleGenerate = async (
    overrideInfo?: string,
    overrideFormat?: 'paragraph' | 'points' | 'JSON' | 'XML',
    overrideTone?: 'normal' | 'professional' | 'creative'
) => {
    setGenState('generating');
    // ...
}
```

**Inputs:**
- `includeAI`: boolean (from checkbox)
- `analyzeImages`: boolean (from checkbox)
- `summaryType`: 'TXT' | 'JSON' | 'XML' (from settings)
- `additionalInfo`: string (optional user input)
- `tone`: 'normal' | 'professional' | 'creative'

---

### **Step 2: Send Message to Content Script**

**Code:**
```typescript
const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
const response = await chrome.tabs.sendMessage(tab.id, { 
    action: 'getPageContent', 
    includeImages: analyzeImages 
});
```

**Message Flow:**
```
HomeView → Chrome Runtime → Content Script
```

---

### **Step 3: Content Script Receives Message**

**Location:** `content.ts`

```typescript
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
    if (request.action === 'getPageContent') {
        scrapePage().then(content => {
            sendResponse(content);
        });
        return true; // Keep channel open
    }
});
```

---

### **Step 4: Scraper Extracts Content**

**Location:** `core/scraper/scraper.ts`

```typescript
export const scrapePage = async (): Promise<ScrapedContent | null> => {
    const url = window.location.href;
    const title = document.title;
    const rawText = document.body.innerText;
    
    // Try structured extraction
    const messageSelectors = [
        '[data-message-author-role]',
        '.message',
        '[class*="message"]',
        '[role="article"]'
    ];
    
    // Extract messages
    const conversation: ScrapedMessage[] = [];
    // ... extraction logic
    
    return {
        url,
        title,
        platform: 'generic',
        conversation,
        rawText,
        images: []
    };
};
```

**Strategy:**
1. Try to find structured messages (chat bubbles)
2. Fall back to raw text if no structure found
3. Return `ScrapedContent` object

---

### **Step 5: Normalize Conversation**

**Location:** `core/pipeline/normalizer.ts`

```typescript
export const normalizeConversation = (conversation: ScrapedMessage[]): ScrapedMessage[] => {
    const normalized: ScrapedMessage[] = [];
    
    conversation.forEach((msg) => {
        // 1. Skip empty messages
        if (!msg.content || msg.content.trim().length === 0) return;
        
        // 2. Deduplication
        const prev = normalized[normalized.length - 1];
        if (prev && prev.role === msg.role && prev.content === msg.content) {
            return;
        }
        
        // 3. Noise Filtering
        const noise = ['Regenerate response', 'Copy code', 'Bad response', 'Good response'];
        if (noise.includes(msg.content)) return;
        
        normalized.push(msg);
    });
    
    return normalized;
};
```

**Cleaning Steps:**
1. ✅ Remove empty messages
2. ✅ Remove duplicates
3. ✅ Filter UI artifacts

---

### **Step 6: Process Content for AI**

**Location:** `core/pipeline/processor.ts`

```typescript
export const processContent = (content: ScrapedContent, options: ProcessOptions): string => {
    if (content.conversation && content.conversation.length > 0) {
        if (options.includeAI) {
            // Full Conversation
            return content.conversation
                .map(turn => `${turn.role === 'user' ? 'User' : 'AI'}: ${turn.content}`)
                .join('\n\n');
        } else {
            // User Only
            return content.conversation
                .filter(turn => turn.role === 'user')
                .map(turn => `User: ${turn.content}`)
                .join('\n\n');
        }
    }
    
    // Fallback to raw text
    return content.rawText || "";
};
```

**Output Formats:**

**With AI responses:**
```
User: What is React?

AI: React is a JavaScript library for building user interfaces...

User: How do I use hooks?

AI: Hooks are functions that let you use state...
```

**Without AI responses:**
```
User: What is React?

User: How do I use hooks?
```

---

### **Step 7: Send to AI Backend**

**Location:** `services/openai.ts`

```typescript
export const generateSummary = async (
    text: string,
    options: SummaryOptions,
    provider: 'openai' | 'gemini',
    additionalInfo?: string,
    authToken?: string,
    deviceId?: string
): Promise<string> => {
    const response = await fetch(`${BACKEND_URL}/summarize`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(authToken && { 'Authorization': `Bearer ${authToken}` })
        },
        body: JSON.stringify({
            text,
            format: options.format,
            tone: options.tone,
            includeAI: options.includeAI,
            additionalInfo,
            deviceId,
            provider
        })
    });
    
    const data = await response.json();
    return data.summary;
};
```

**Backend URL:** `https://tai-backend.amaravadhibharath.workers.dev`

**Request Payload:**
```json
{
    "text": "User: What is React?\n\nAI: React is...",
    "format": "TXT",
    "tone": "normal",
    "includeAI": true,
    "additionalInfo": "",
    "deviceId": "device_1234567890_abc123",
    "provider": "openai"
}
```

**Response:**
```json
{
    "summary": "This conversation discusses React...",
    "usage": { "tokens": 150 }
}
```

---

### **Step 8: Backend Processing**

**Location:** Cloudflare Worker (`backend/src/index.js`)

**Flow:**
```
1. Receive request
2. Validate auth token (if provided)
3. Check quota (Free: 5/day, Pro: unlimited)
4. Call OpenAI/Gemini API
5. Log to Google Sheets
6. Return summary
```

**AI Providers:**
- **OpenAI:** GPT-4o-mini
- **Gemini:** Gemini 2.0 Flash

---

### **Step 9: Display Summary**

**Location:** `HomeView.tsx`

```typescript
setGeneratedSummary(summary);
setGenState('completed');

// Save to history
const newHistoryItem = {
    id: Date.now(),
    summary: summary,
    date: new Date().toISOString(),
    preview: summary.slice(0, 100) + "...",
    platform: response.platform || 'generic',
    type: analyzeImages ? 'prompt+response+image' : (includeAI ? 'prompt+response' : 'prompt')
};

chrome.storage.local.get(['history'], (result) => {
    const currentHistory = (result.history as any[]) || [];
    const updatedHistory = [newHistoryItem, ...currentHistory].slice(0, 50);
    chrome.storage.local.set({ history: updatedHistory });
});
```

**UI Updates:**
1. ✅ Summary appears in scrollable box
2. ✅ Back button shows
3. ✅ GenerateButton hides
4. ✅ Checkboxes stay visible
5. ✅ History updated

---

## 🔌 Integration Points

### **1. Chrome APIs**
```typescript
chrome.tabs.query()           // Get active tab
chrome.tabs.sendMessage()     // Send to content script
chrome.storage.local          // Local storage
chrome.identity.getAuthToken() // Google Sign-In
```

### **2. Firebase**
```typescript
// Firestore only (no Auth SDK)
import { getFirestore, collection, addDoc } from 'firebase/firestore';

const saveHistoryToFirestore = async (userId: string, summary: string, url: string) => {
    await addDoc(collection(db, 'summaries'), {
        userId,
        summary,
        url,
        timestamp: new Date()
    });
};
```

### **3. Analytics**
```typescript
import { trackEvent } from './services/analytics';

trackEvent('summary_generated', {
    platform: response.platform,
    includeAI,
    analyzeImages,
    format: summaryType
});
```

---

## 📈 Data Flow Diagram

```
┌─────────────────┐
│   User Clicks   │
│  "Generate"     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   HomeView      │
│  handleGenerate │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Content Script  │
│  scrapePage()   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    Scraper      │
│  Extract HTML   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Normalizer     │
│  Clean & Dedup  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Processor     │
│  Format Text    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  AI Backend     │
│ (Cloudflare)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  OpenAI/Gemini  │
│  Generate       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Display in UI  │
│  Save History   │
└─────────────────┘
```

---

## 🎯 Key Design Decisions

### **1. No Adapter Pattern**
**Why:** Simple, direct pipeline is easier to maintain and debug.

**Alternative:** Could use Strategy pattern for different platforms, but current generic approach works well.

### **2. Generic Scraping**
**Why:** Platform-specific scrapers break frequently. Generic approach is more robust.

**Trade-off:** Less structured data, but more reliable.

### **3. Fallback to Raw Text**
**Why:** Always have something to summarize, even if structure fails.

**Benefit:** Never fails completely.

### **4. Client-Side Processing**
**Why:** Reduce backend load, faster response.

**What:** Normalization and formatting happen in browser.

### **5. Backend AI Processing**
**Why:** Keep API keys secure, enable quota management.

**What:** All AI calls go through Cloudflare Worker.

---

## 🔒 Security Model

### **Authentication Flow:**
```
1. User clicks "Sign in with Google"
2. chrome.identity.getAuthToken() → Google OAuth
3. Token sent to backend
4. Backend validates with Google
5. User profile stored in Firestore
6. Token used for subsequent requests
```

### **Quota Management:**
```
1. Backend checks user tier (Free/Pro)
2. Free: 5 summaries/day
3. Pro: Unlimited
4. Quota stored in backend (Google Sheets)
5. Reset daily at midnight UTC
```

---

## 📊 Performance Metrics

| Operation | Time | Notes |
|-----------|------|-------|
| **Scraping** | 100-500ms | DOM traversal |
| **Normalization** | <10ms | Client-side |
| **Processing** | <10ms | Client-side |
| **AI Backend** | 2-5s | Network + AI |
| **Total** | 2-6s | User-perceived time |

---

## 🚀 Optimization Opportunities

### **Current:**
- ✅ Simple, working pipeline
- ✅ No adapters needed
- ✅ Generic scraping

### **Future Enhancements:**
1. **Platform-Specific Scrapers** (if needed)
   - ChatGPT adapter
   - Gemini adapter
   - Claude adapter

2. **Caching Layer**
   - Cache scraped content
   - Reduce re-scraping

3. **Streaming Responses**
   - Stream AI output
   - Show partial results

---

## 📝 Summary

**Architecture:** Simple, direct pipeline  
**Adapters:** None (not needed)  
**Schema:** Well-defined TypeScript interfaces  
**Workflow:** 9-step process from click to display  
**Performance:** 2-6 seconds total  
**Reliability:** Fallback mechanisms at every step  

**Status:** ✅ Production-ready, battle-tested

---

**Last Updated:** December 27, 2025  
**Version:** 1.0.6
