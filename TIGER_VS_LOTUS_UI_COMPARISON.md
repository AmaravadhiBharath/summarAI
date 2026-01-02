# Tiger vs Lotus: UI Properties Comparison

**Generated:** 2025-12-27  
**Purpose:** Comprehensive list of UI-related properties present in Tiger but missing in Lotus

---

## 📋 Executive Summary

This document catalogs all UI-related differences between **Tiger** (main production version) and **Lotus** (experimental/stable fork). Lotus is designed to be a more stable, minimal version with fewer features but better reliability.

---

## 🎨 **1. CSS & Styling Differences**

### **index.css**

#### **Tiger Has (Missing in Lotus):**
```css
/* Animation utilities in @layer utilities */
.animate-slide-up-fade {
  animation: slideUpFade 0.3s ease-out forwards;
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-out forwards;
}

.animate-blink {
  animation: blink 1s step-end infinite;
}

.animate-text-cycle {
  animation: textCycle 8s infinite;
}

/* Keyframe: blink animation */
@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

/* Keyframe: textCycle animation */
@keyframes textCycle {
  0%, 20% { content: "Build Better"; }
  25%, 45% { content: "Build Faster"; }
  50%, 70% { content: "Vibe Better"; }
  75%, 95% { content: "Vibe Faster"; }
}
```

**Lotus Has:**
- Only basic `slideUpFade` and `fadeIn` animations
- No `blink` or `textCycle` animations
- Simpler animation timing (0.2s vs 0.3s)

---

### **tailwind.config.js**

#### **Tiger Has:**
```javascript
animation: {
  'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
}
```

#### **Lotus Has:**
```javascript
animation: {
  'slide-up-fade': 'slideUpFade 0.3s ease-out forwards',
  'fade-in': 'fadeIn 0.3s ease-out forwards',
},
keyframes: {
  slideUpFade: {
    'from': { opacity: '0', transform: 'translateY(10px)' },
    'to': { opacity: '1', transform: 'translateY(0)' },
  },
  fadeIn: {
    'from': { opacity: '0' },
    'to': { opacity: '1' },
  },
}
```

**Difference:**
- Tiger defines animations in CSS, Lotus defines them in Tailwind config
- Tiger has `pulse-slow` animation
- Lotus has explicit keyframe definitions in config

---

## 🏗️ **2. Component Architecture Differences**

### **App.tsx**

#### **Tiger:**
```tsx
// Two-view architecture
const [view, setView] = useState<'home' | 'summary'>('home');
const [summaryData, setSummaryData] = useState<string>("");

// Switches between HomeView and SummaryView
{view === 'home' ? (
  <HomeView onGenerateComplete={handleGenerateComplete} />
) : (
  <SummaryView summary={summaryData} onBack={handleBack} />
)}
```

#### **Lotus:**
```tsx
// Single-view architecture
const [summaryData, setSummaryData] = useState<string>("");
const [autoGenerate, setAutoGenerate] = useState(false);

// Only HomeView, no separate SummaryView
<HomeView
  onGenerateComplete={handleGenerateComplete}
  autoGenerate={autoGenerate}
  onAutoGenerateHandled={() => setAutoGenerate(false)}
/>
```

**Key Difference:**
- **Tiger:** Has separate `SummaryView` component for displaying results
- **Lotus:** All-in-one `HomeView` that shows both idle and summary states

---

### **Layout.tsx**

#### **Both are identical:**
```tsx
// Same structure in both
<div className="h-screen w-full bg-white text-gray-900 font-sans flex flex-col overflow-hidden">
  {header && <header>...</header>}
  <main className="flex-1 flex flex-col p-4 relative overflow-hidden min-h-0">
    {children}
  </main>
</div>
```

**Difference:**
- Tiger: `flex flex-col h-screen`
- Lotus: `flex flex-col h-screen` (order swapped but functionally same)

---

## 🎯 **3. HomeView.tsx - Major Differences**

### **Tiger-Specific Features (Missing in Lotus):**

#### **1. SummaryView Integration**
```tsx
// Tiger has separate summary view
const [summary, setSummary] = useState<string | null>(null);
const [isEditing, setIsEditing] = useState(false);

// Lotus shows summary inline
const [generatedSummary, setGeneratedSummary] = useState<string>('');
```

#### **2. Debug Toast Dropdown (Admin Feature)**
```tsx
// Tiger only - Lines 69-71, 849-1013
const [showDebugToastDropdown, setShowDebugToastDropdown] = useState(false);
const [showSuccessTypes, setShowSuccessTypes] = useState(true);
const [showErrorTypes, setShowErrorTypes] = useState(true);

// Full debug toast UI with collapsible sections
<div className="relative mt-2">
  <button className="w-full py-1 text-[10px]...">
    Debug Toasts <ChevronDown />
  </button>
  {showDebugToastDropdown && (
    <div className="mt-1 bg-white border...">
      {/* Success Types */}
      {/* Error Types */}
      {/* Custom Toasts */}
    </div>
  )}
</div>
```

**Lotus:** Does NOT have debug toast dropdown

---

#### **3. SummaryToolbar Component**
```tsx
// Tiger only - Lines 1070-1082
import { SummaryToolbar } from '../components/SummaryToolbar';

{summary && genState === 'completed' && (
  <SummaryToolbar
    summary={summary}
    onEdit={() => setIsEditing(!isEditing)}
    onRegenerate={handleRegenerate}
    isEditing={isEditing}
  />
)}
```

**Lotus:** No SummaryToolbar component usage

---

#### **4. Advanced Summary Display**
```tsx
// Tiger - Lines 1084-1575
{summary && genState === 'completed' && (
  <div className="flex-1 overflow-y-auto...">
    {isEditing ? (
      <textarea
        value={summary}
        onChange={(e) => setSummary(e.target.value)}
        className="w-full h-full..."
      />
    ) : (
      <div className="text-sm leading-relaxed...">
        {summary}
      </div>
    )}
  </div>
)}
```

**Lotus - Lines 752-755:**
```tsx
// Simpler summary display
{genState === 'completed' && generatedSummary ? (
  <div className="text-sm leading-relaxed text-gray-700 whitespace-pre-wrap">
    {generatedSummary}
  </div>
) : ...}
```

**Key Differences:**
- Tiger has editable summary with textarea
- Tiger has SummaryToolbar with edit/regenerate controls
- Lotus has read-only summary display

---

#### **5. Checkboxes Position**
```tsx
// Tiger - Lines 1577-1590
{/* Checkboxes - Fixed at bottom */}
<div className="flex-shrink-0 mt-auto pt-4">
  <div className="flex flex-col gap-2">
    <CheckboxRow
      label="Include AI responses"
      checked={includeAI}
      onChange={setIncludeAI}
    />
    <CheckboxRow
      label="Analyze images"
      checked={analyzeImages}
      onChange={setAnalyzeImages}
    />
  </div>
</div>
```

**Lotus - Lines 801-823:**
```tsx
// Checkboxes below summary box
{effectiveUser && !isCompact && (
  <div className="mt-4 flex flex-col gap-2">
    <CheckboxRow ... />
    <CheckboxRow ... />
  </div>
)}
```

**Difference:**
- Tiger: Checkboxes inside summary box at bottom
- Lotus: Checkboxes outside summary box, below it

---

#### **6. Generate Button Placement**
```tsx
// Tiger - Lines 1593-1605
{/* Generate Button - Below checkboxes */}
{effectiveUser && !isCompact && (
  <div className="mt-4">
    <GenerateButton
      onGenerate={handleGenerate}
      state={genState}
      isRegenerating={isRegenerating}
      disabled={!isSupported || !hasConversation}
      includeAI={includeAI}
      analyzeImages={analyzeImages}
    />
  </div>
)}
```

**Lotus - Lines 787-798:**
```tsx
// Guest mode floating button
{!effectiveUser && !isCompact && genState !== 'completed' && (
  <GenerateButton
    onGenerate={handleGenerate}
    state={genState}
    isRegenerating={isRegenerating}
    disabled={!isSupported || !hasConversation}
    includeAI={includeAI}
    analyzeImages={analyzeImages}
    isGuest={true}
  />
)}
```

**Difference:**
- Tiger: Shows button for logged-in users
- Lotus: Shows button only for guests, with `isGuest={true}` prop

---

#### **7. Settings Modal**
```tsx
// Tiger - Lines 1608-1730
{activePopup === 'settings' && (
  <>
    <div className="fixed inset-0 z-[150]" onClick={...} />
    <div className="popup-content fixed top-16 right-4...">
      {/* Provider Selection */}
      <div className="px-4 py-3">
        <p className="text-[10px]...">AI Provider</p>
        <div className="grid grid-cols-3 gap-2 mt-2">
          <button onClick={() => setProvider('auto')}>Auto</button>
          <button onClick={() => setProvider('openai')}>OpenAI</button>
          <button onClick={() => setProvider('google')}>Gemini</button>
        </div>
      </div>
      
      {/* Format Selection */}
      <div className="px-4 py-3">
        <p className="text-[10px]...">Format</p>
        <div className="grid grid-cols-3 gap-2 mt-2">
          <button onClick={() => setSummaryType('TXT')}>TXT</button>
          <button onClick={() => setSummaryType('JSON')}>JSON</button>
          <button onClick={() => setSummaryType('XML')}>XML</button>
        </div>
      </div>
    </div>
  </>
)}
```

**Lotus - Lines 825-893:**
```tsx
// Similar settings modal but simpler styling
{activePopup === 'settings' && (
  <>
    <div className="fixed inset-0 z-[150]" onClick={...} />
    <div className="popup-content fixed top-14 right-4...">
      {/* Same provider and format selection */}
    </div>
  </>
)}
```

**Difference:**
- Tiger: `top-16` positioning
- Lotus: `top-14` positioning
- Tiger: More detailed styling classes

---

#### **8. History Modal**
```tsx
// Tiger - Lines 1733-1788
{activePopup === 'history' && (
  <>
    <div className="fixed inset-0 z-[150]" onClick={...} />
    <div className="popup-content fixed top-16 right-4 w-80...">
      <div className="px-4 py-3 border-b...">
        <h3>History</h3>
        <button onClick={handleClearHistory}>
          <Trash className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {history.length === 0 ? (
          <p>No history yet</p>
        ) : (
          history.map((item) => (
            <button onClick={() => handleViewHistoryItem(item)}>
              <div className="text-xs font-medium...">{item.preview}</div>
              <div className="text-[10px]...">{new Date(item.date).toLocaleString()}</div>
            </button>
          ))
        )}
      </div>
    </div>
  </>
)}
```

**Lotus - Lines 896-951:**
```tsx
// Similar history modal
{activePopup === 'history' && (
  // Same structure but slightly different styling
)}
```

**Difference:**
- Tiger: `w-80` width, `top-16`
- Lotus: `w-80` width, `top-14`

---

#### **9. Help Modal**
```tsx
// Tiger - Lines 1791-1844
{activePopup === 'help' && (
  <>
    <div className="fixed inset-0 z-[150]" onClick={...} />
    <div className="popup-content fixed top-16 right-4...">
      <div className="px-4 py-3 border-b...">
        <h3>Help & Resources</h3>
      </div>
      <div className="flex flex-col">
        <button onClick={() => handleHelpAction('docs')}>
          <Book className="w-3.5 h-3.5" />
          Documentation
          <ExternalLink className="w-3 h-3" />
        </button>
        <button onClick={() => handleHelpAction('faq')}>
          <HelpCircle className="w-3.5 h-3.5" />
          FAQ
        </button>
        <button onClick={() => handleHelpAction('contact')}>
          <Mail className="w-3.5 h-3.5" />
          Contact Support
        </button>
      </div>
    </div>
  </>
)}
```

**Lotus - Lines 954-983:**
```tsx
// Identical help modal structure
```

**Difference:** Minimal styling differences only

---

#### **10. Feedback Modal (Report Issue)**
```tsx
// Tiger - Lines 1847-1852
{activePopup === 'feedback' && (
  <ReportIssueModal
    isOpen={true}
    onClose={() => setActivePopup('none')}
  />
)}
```

**Lotus - Lines 986-991:**
```tsx
// Same implementation
{activePopup === 'feedback' && (
  <ReportIssueModal
    isOpen={true}
    onClose={() => setActivePopup('none')}
  />
)}
```

**Difference:** None

---

#### **11. Upgrade Modal**
```tsx
// Tiger - Lines 1855-1860
{showUpgradeModal && (
  <UpgradeModal
    isOpen={showUpgradeModal}
    onClose={() => setShowUpgradeModal(false)}
  />
)}
```

**Lotus - Lines 994-999:**
```tsx
// Same implementation
```

**Difference:** None

---

#### **12. Pulse Check**
```tsx
// Tiger - Lines 1863-1865
<PulseCheck />
```

**Lotus - Lines 1002-1004:**
```tsx
<PulseCheck />
```

**Difference:** None

---

## 🔧 **4. GenerateButton.tsx Differences**

### **Import Differences**

#### **Tiger:**
```tsx
import { cn, Tooltip } from './ui/Tooltip';
```

#### **Lotus:**
```tsx
import { Tooltip } from './ui/Tooltip';
import { cn } from '../utils/cn';
```

**Difference:**
- Tiger imports `cn` from Tooltip file
- Lotus imports `cn` from separate utils file (better separation of concerns)

---

### **Tooltip Props**

#### **Tiger:**
```tsx
<Tooltip content="..." side="left">
```

#### **Lotus:**
```tsx
<Tooltip content="...">
```

**Difference:**
- Tiger explicitly sets `side="left"` prop in some places
- Lotus uses default side positioning

---

## 📊 **5. Smart AI Provider Routing (Lotus Only)**

### **Lotus Has (Missing in Tiger):**

```tsx
// Lines 334-437 in Lotus HomeView
// Smart provider selection based on content length
let selectedProvider = provider;
const contentLength = textToAnalyze.trim().length;

// Override: Use OpenAI for short content (< 50 chars)
if (contentLength < 50) {
  selectedProvider = 'openai';
  console.log(`Lotus: Short content (${contentLength} chars), using OpenAI`);
} else {
  console.log(`Lotus: Normal content (${contentLength} chars), using ${provider}`);
}

// Try primary provider with automatic fallback
try {
  const [result] = await Promise.all([
    generateSummary(..., selectedProvider, ...),
    animationPromise
  ]);
  summary = result;
  
  trackEvent('summary_generated_success', {
    provider: selectedProvider,
    contentLength,
    wasShortContent: contentLength < 50,
  });
} catch (primaryError) {
  // Fallback to Gemini if OpenAI fails
  if (selectedProvider === 'openai') {
    console.log('Lotus: Attempting fallback to Gemini...');
    try {
      const [result] = await Promise.all([
        generateSummary(..., 'google', ...),
        new Promise(resolve => setTimeout(resolve, 500))
      ]);
      summary = result;
      usedProvider = 'google';
      
      trackEvent('summary_generated_fallback', {
        primaryProvider: 'openai',
        fallbackProvider: 'gemini',
        contentLength,
        primaryError: primaryError.message
      });
      
      toast.success('✨ Summary generated using Gemini (OpenAI temporarily unavailable)');
    } catch (fallbackError) {
      trackEvent('summary_generation_failed', {
        primaryProvider: 'openai',
        fallbackProvider: 'gemini',
        primaryError: primaryError.message,
        fallbackError: fallbackError.message
      });
      throw new Error(`Both providers failed...`);
    }
  }
}
```

**Tiger:**
- Uses selected provider directly without smart routing
- No automatic fallback mechanism
- No content-length-based provider selection

---

## 🎨 **6. Visual/Styling Differences**

### **Profile Popup Positioning**

#### **Tiger:**
```tsx
className="popup-content fixed top-16 right-4..."
```

#### **Lotus:**
```tsx
className="popup-content fixed top-14 right-4..."
```

**Difference:** 2px difference in top positioning

---

### **Admin Debug Section**

#### **Tiger:**
- Has extensive debug toast dropdown (lines 849-1013)
- Multiple toast type testing buttons
- Collapsible success/error sections

#### **Lotus:**
- No debug toast dropdown
- Only basic admin tools (email test, extract prompts, clear cache)

---

### **Summary Box Background**

#### **Tiger:**
```tsx
<div className="w-full h-full flex flex-col relative border border-gray-200 rounded-2xl overflow-hidden">
```

#### **Lotus:**
```tsx
<div className="w-full h-full flex flex-col relative border border-gray-200 rounded-2xl overflow-hidden bg-white">
```

**Difference:** Lotus explicitly sets `bg-white`

---

## 📝 **7. Missing Components in Lotus**

### **1. SummaryView.tsx**
- **Tiger:** Has dedicated `SummaryView` component
- **Lotus:** Does NOT have this component (all-in-one HomeView)

### **2. SummaryToolbar Usage**
- **Tiger:** Uses `<SummaryToolbar>` component
- **Lotus:** Does NOT use SummaryToolbar in HomeView

---

## 🔄 **8. State Management Differences**

### **Tiger:**
```tsx
const [summary, setSummary] = useState<string | null>(null);
const [isEditing, setIsEditing] = useState(false);
const [isRegenerating, setIsRegenerating] = useState(false);
```

### **Lotus:**
```tsx
const [isRegenerating, setIsRegenerating] = useState(false);
const [generatedSummary, setGeneratedSummary] = useState<string>('');
// No isEditing state
```

**Difference:**
- Tiger has `isEditing` state for inline editing
- Lotus uses `generatedSummary` instead of `summary`

---

## 🎯 **9. Feature Flags**

### **Tiger:**
```tsx
const [adminFeatures, setAdminFeatures] = useState({
  imageAnalysis: true,
  creativeTone: true,
  professionalTone: true,
  jsonFormat: true,
  xmlFormat: true
});
```

### **Lotus:**
```tsx
// No adminFeatures state
// Uses subscribeToAdminFeatures but doesn't store in state
```

---

## 🚀 **10. Back Button Implementation**

### **Tiger:**
```tsx
// No back button in HomeView (uses separate SummaryView)
const handleBack = () => {
  setSummary(null);
  setGenState('idle');
};
```

### **Lotus:**
```tsx
// Back button in HomeView (lines 733-750)
{genState === 'completed' && generatedSummary && (
  <div className="absolute top-4 left-4 z-30">
    <Tooltip content="Back">
      <Button
        variant="secondary"
        size="icon"
        onClick={() => {
          setGeneratedSummary('');
          setGenState('idle');
        }}
        className="rounded-full w-8 h-8..."
      >
        <ArrowLeft className="w-4 h-4 text-gray-600" />
      </Button>
    </Tooltip>
  </div>
)}
```

---

## 📊 **Summary Table**

| Feature | Tiger | Lotus | Notes |
|---------|-------|-------|-------|
| **SummaryView Component** | ✅ Yes | ❌ No | Lotus uses all-in-one HomeView |
| **Editable Summary** | ✅ Yes | ❌ No | Tiger has textarea editing |
| **SummaryToolbar** | ✅ Yes | ❌ No | Edit/regenerate controls |
| **Debug Toast Dropdown** | ✅ Yes | ❌ No | Admin-only feature |
| **Smart AI Routing** | ❌ No | ✅ Yes | Content-length based provider selection |
| **Automatic Fallback** | ❌ No | ✅ Yes | OpenAI → Gemini fallback |
| **Back Button in HomeView** | ❌ No | ✅ Yes | Lotus shows back button |
| **Blink Animation** | ✅ Yes | ❌ No | Cursor blinking effect |
| **Text Cycle Animation** | ✅ Yes | ❌ No | Rotating text animation |
| **Pulse-Slow Animation** | ✅ Yes | ❌ No | Tailwind config |
| **Admin Feature Flags State** | ✅ Yes | ❌ No | Stored in component state |
| **Checkboxes Position** | Inside box | Outside box | Different layout |
| **Generate Button Logic** | For logged-in users | For guests only | Different user targeting |
| **Profile Popup Top Position** | `top-16` | `top-14` | 2px difference |
| **Summary Box Background** | Inherited | `bg-white` | Explicit in Lotus |
| **CN Import Location** | `ui/Tooltip` | `utils/cn` | Better separation in Lotus |

---

## 🎨 **CSS Classes Present in Tiger but Missing in Lotus**

### **Animations:**
- `.animate-blink`
- `.animate-text-cycle`
- `@keyframes blink`
- `@keyframes textCycle`

### **Tailwind Config:**
- `animation.pulse-slow`

---

## 🔍 **Conclusion**

**Tiger** is the feature-rich, production version with:
- Separate summary view
- Editable summaries
- Advanced admin debugging tools
- More animations and visual polish
- Complex state management

**Lotus** is the stable, minimal fork with:
- Simplified single-view architecture
- Smart AI provider routing with fallback
- Better code organization (utils/cn)
- Fewer animations for stability
- Guest-focused generate button

**Recommendation:** Use Tiger for full-featured production, Lotus for stable minimal deployment.

---

**End of Report**
