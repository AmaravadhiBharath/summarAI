# 🛠️ Lotus Stability Fixes - Implementation Guide

**Priority:** CRITICAL  
**Effort:** 2-3 days  
**Risk:** LOW (additive only)

---

## 🎯 What We're Fixing

### **Current Problems:**
1. ❌ Scraper returns `null` → User sees generic "Failed to scrape content"
2. ❌ Shadow DOM content invisible → Extension appears broken on Gemini/Claude
3. ❌ No platform isolation → One platform's DOM change breaks all platforms
4. ❌ Weak validation → Processes UI noise like "Loading..."

### **After Fixes:**
1. ✅ Detailed error messages → User knows exactly what's wrong
2. ✅ Shadow DOM detected → User gets helpful guidance
3. ✅ Platform configs → Each platform isolated
4. ✅ Smart validation → Only processes real content

---

## 📦 Files to Modify

```
src/core/scraper/
├── types.ts          # Add error types
├── platforms.ts      # NEW: Platform configs
└── scraper.ts        # Update scraping logic

src/views/
└── HomeView.tsx      # Update error handling
```

**Total Changes:** ~200 lines of code  
**Existing Code Changed:** ~50 lines  
**New Code Added:** ~150 lines

---

## 🔧 Step-by-Step Implementation

### **Step 1: Add Error Types** (5 min)

**File:** `src/core/scraper/types.ts`

**Add after line 16:**

```typescript
export interface ScraperError {
    code: 'EMPTY_PAGE' | 'SHADOW_DOM' | 'NO_CONTENT' | 'BLOCKED' | 'VALIDATION_FAILED';
    message: string;
    suggestion: string;
    platform?: string;
}

export type ScraperResult = ScrapedContent | ScraperError;

export function isScraperError(result: ScraperResult): result is ScraperError {
    return 'code' in result;
}
```

---

### **Step 2: Create Platform Configs** (15 min)

**File:** `src/core/scraper/platforms.ts` (NEW)

```typescript
export type Platform = 'chatgpt' | 'gemini' | 'claude' | 'generic';

export interface PlatformConfig {
    name: Platform;
    detect: (url: string) => boolean;
    selectors: string[];
    shadowDOM: boolean;
    minContentLength: number;
}

export const PLATFORMS: PlatformConfig[] = [
    {
        name: 'chatgpt',
        detect: (url) => url.includes('chat.openai.com') || url.includes('chatgpt.com'),
        selectors: [
            '[data-message-author-role]',
            '[data-testid*="conversation"]',
            '[class*="message"]'
        ],
        shadowDOM: false,
        minContentLength: 50
    },
    {
        name: 'gemini',
        detect: (url) => url.includes('gemini.google.com'),
        selectors: [
            'message-content',
            '[role="article"]',
            '.conversation-turn'
        ],
        shadowDOM: true,
        minContentLength: 50
    },
    {
        name: 'claude',
        detect: (url) => url.includes('claude.ai'),
        selectors: [
            '[data-test-render-count]',
            '.font-claude-message',
            '[class*="message"]'
        ],
        shadowDOM: true,
        minContentLength: 50
    }
];

export const detectPlatform = (url: string): PlatformConfig => {
    const detected = PLATFORMS.find(p => p.detect(url));
    
    if (detected) {
        console.log(`Lotus: Detected platform: ${detected.name}`);
        return detected;
    }
    
    console.log('Lotus: Using generic platform');
    return {
        name: 'generic',
        detect: () => true,
        selectors: [
            '[data-message-author-role]',
            '.message',
            '[class*="message"]',
            '[role="article"]'
        ],
        shadowDOM: false,
        minContentLength: 50
    };
};
```

---

### **Step 3: Add Content Validation** (10 min)

**File:** `src/core/scraper/scraper.ts`

**Add before scrapePage function:**

```typescript
const validateContent = (text: string, minLength: number = 50): { valid: boolean; reason?: string } => {
    // Too short
    if (!text || text.trim().length < minLength) {
        return { valid: false, reason: 'Content too short' };
    }
    
    // Common error/loading messages
    const errorPatterns = [
        /^loading\.\.\.$/i,
        /^error \d+/i,
        /^sign in to continue/i,
        /^access denied/i,
        /^404 not found/i,
        /^please wait/i
    ];
    
    const trimmed = text.trim().toLowerCase();
    if (errorPatterns.some(pattern => pattern.test(trimmed))) {
        return { valid: false, reason: 'Appears to be error or loading message' };
    }
    
    // Check for conversation-like content
    const hasQuestionMarks = (text.match(/\?/g) || []).length > 0;
    const hasMultipleSentences = (text.match(/[.!?]/g) || []).length > 2;
    const hasWords = text.split(/\s+/).length > 10;
    
    if (!hasWords) {
        return { valid: false, reason: 'Not enough words' };
    }
    
    return { valid: true };
};
```

---

### **Step 4: Update Scraper** (30 min)

**File:** `src/core/scraper/scraper.ts`

**Replace entire file with:**

```typescript
import type { ScrapedContent, ScraperError, ScraperResult } from './types';
import { detectPlatform } from './platforms';

const validateContent = (text: string, minLength: number = 50): { valid: boolean; reason?: string } => {
    // [Copy from Step 3]
};

export const scrapePage = async (): Promise<ScraperResult> => {
    console.log("Lotus: scrapePage called");
    
    const url = window.location.href;
    const title = document.title;
    const platform = detectPlatform(url);
    
    // Get raw text
    const rawText = document.body.innerText || "";
    
    // Validate raw text
    const validation = validateContent(rawText, platform.minContentLength);
    if (!validation.valid) {
        console.log(`Lotus: Validation failed - ${validation.reason}`);
        
        return {
            code: 'NO_CONTENT',
            message: 'Unable to extract content from this page',
            suggestion: validation.reason === 'Content too short' 
                ? 'Make sure the page is fully loaded before generating a summary'
                : 'This page may not contain conversation content',
            platform: platform.name
        };
    }
    
    // Try to extract structured conversation
    const conversation: any[] = [];
    
    for (const selector of platform.selectors) {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
            console.log(`Lotus: Found ${elements.length} elements with selector: ${selector}`);
            
            elements.forEach(el => {
                const text = el.textContent?.trim();
                if (text && text.length > 10) {
                    conversation.push({
                        role: 'user',
                        content: text
                    });
                }
            });
            
            if (conversation.length > 0) break;
        }
    }
    
    // Check for Shadow DOM issues
    if (platform.shadowDOM && conversation.length === 0 && rawText.length < 100) {
        console.log('Lotus: Shadow DOM platform with minimal content');
        
        return {
            code: 'SHADOW_DOM',
            message: `${platform.name.charAt(0).toUpperCase() + platform.name.slice(1)} uses protected content`,
            suggestion: 'Try selecting and copying the conversation manually, then paste it into the summary input',
            platform: platform.name
        };
    }
    
    // If no structured conversation found, use raw text
    if (conversation.length === 0) {
        console.log('Lotus: No structured conversation, using raw text');
        conversation.push({
            role: 'user',
            content: rawText
        });
    }
    
    console.log(`Lotus: Successfully scraped ${conversation.length} messages`);
    
    return {
        url,
        title,
        platform: platform.name,
        conversation,
        rawText,
        images: []
    };
};
```

---

### **Step 5: Update HomeView Error Handling** (20 min)

**File:** `src/views/HomeView.tsx`

**Find line 288-290 and replace with:**

```typescript
const response = await chrome.tabs.sendMessage(tab.id, { 
    action: 'getPageContent', 
    includeImages: analyzeImages 
}, { frameId: 0 });

// Check if response is a scraper error
if (response && 'code' in response) {
    setGenState('error');
    
    // Show detailed error with suggestion
    toast.error(
        <div>
            <div className="font-semibold">{response.message}</div>
            <div className="text-xs mt-1 opacity-90">💡 {response.suggestion}</div>
            {response.platform && (
                <div className="text-xs mt-1 opacity-75">Platform: {response.platform}</div>
            )}
        </div>,
        { duration: 8000 }
    );
    
    trackEvent('scraping_failed', {
        code: response.code,
        platform: response.platform || 'unknown',
        url: tab.url
    });
    
    return;
}

if (!response) {
    setGenState('error');
    toast.error(
        <div>
            <div className="font-semibold">Unable to access page content</div>
            <div className="text-xs mt-1 opacity-90">💡 Try refreshing the page and waiting for it to fully load</div>
        </div>,
        { duration: 6000 }
    );
    return;
}
```

---

### **Step 6: Add Telemetry** (10 min)

**File:** `src/views/HomeView.tsx`

**After successful scraping (around line 350), add:**

```typescript
// Track successful scraping
trackEvent('scraping_success', {
    platform: response.platform || 'unknown',
    messageCount: response.conversation?.length || 0,
    hasStructuredData: response.conversation && response.conversation.length > 0
});
```

---

## ✅ Testing Checklist

### **Test 1: ChatGPT (Regular DOM)**
- [ ] Open chat.openai.com
- [ ] Start a conversation
- [ ] Click "Generate Summary"
- [ ] **Expected:** ✅ Summary generated successfully
- [ ] **Platform detected:** chatgpt

### **Test 2: Gemini (Shadow DOM)**
- [ ] Open gemini.google.com
- [ ] Start a conversation
- [ ] Click "Generate Summary"
- [ ] **Expected:** ⚠️ Error message with Shadow DOM guidance
- [ ] **Error code:** SHADOW_DOM
- [ ] **Platform detected:** gemini

### **Test 3: Empty Page**
- [ ] Open blank page
- [ ] Click "Generate Summary"
- [ ] **Expected:** ❌ Error "Unable to extract content"
- [ ] **Error code:** NO_CONTENT

### **Test 4: Loading Page**
- [ ] Open slow-loading page
- [ ] Click "Generate Summary" before content loads
- [ ] **Expected:** ❌ Error with suggestion to wait
- [ ] **Error code:** NO_CONTENT

### **Test 5: Generic Site**
- [ ] Open any article/blog
- [ ] Click "Generate Summary"
- [ ] **Expected:** ✅ Summary generated (fallback to raw text)
- [ ] **Platform detected:** generic

---

## 📊 Monitoring

### **After Deployment, Check:**

1. **PostHog Events:**
   - `scraping_success` - Should be >80%
   - `scraping_failed` - Should be <20%
   - Group by `platform` to see which platforms fail most

2. **Error Codes:**
   - `SHADOW_DOM` - Expected for Gemini/Claude
   - `NO_CONTENT` - Should be rare
   - `VALIDATION_FAILED` - Should be rare

3. **User Feedback:**
   - Check if users understand error messages
   - Monitor support requests

---

## 🚀 Deployment

### **Version: 1.2.0**

**Changelog:**
```
v1.2.0 - Stability Improvements
- Added platform detection (ChatGPT, Gemini, Claude)
- Improved error messages with actionable suggestions
- Better content validation
- Shadow DOM detection and guidance
- Telemetry for failure tracking
```

**Build:**
```bash
cd /Users/bharathamaravadi/Desktop/tiger/lotus
npm run build
```

**Test locally:**
1. Load unpacked from `dist/`
2. Run all tests above
3. Verify no regressions

**Deploy:**
1. Update version in manifest to 1.2.0
2. Build production
3. Upload to Chrome Web Store
4. Monitor telemetry for 48 hours

---

## ⏱️ Time Estimate

| Task | Time |
|------|------|
| Step 1: Error types | 5 min |
| Step 2: Platform configs | 15 min |
| Step 3: Validation | 10 min |
| Step 4: Update scraper | 30 min |
| Step 5: Update HomeView | 20 min |
| Step 6: Telemetry | 10 min |
| **Coding Total** | **90 min** |
| Testing | 60 min |
| Documentation | 30 min |
| **Grand Total** | **3 hours** |

---

## ✅ Success Criteria

- [ ] All 5 tests pass
- [ ] No TypeScript errors
- [ ] Build succeeds
- [ ] Extension loads without errors
- [ ] Error messages are clear and helpful
- [ ] Telemetry events firing correctly

---

**Status:** 📋 Ready to implement  
**Next:** Start with Step 1 and work through sequentially
