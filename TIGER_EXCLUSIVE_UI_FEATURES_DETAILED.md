# Tiger-Exclusive UI Features - Complete Detail Guide

**Missing in Lotus | Present in Tiger**

---

## 🎨 **1. CSS ANIMATIONS & STYLING**

### **A. Blink Animation**
```css
/* Tiger only - index.css */
.animate-blink {
  animation: blink 1s step-end infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}
```
**Usage:** Blinking cursor effect for "Ready to generate" state

### **B. Text Cycle Animation**
```css
/* Tiger only - index.css */
.animate-text-cycle {
  animation: textCycle 8s infinite;
}

@keyframes textCycle {
  0%, 20% { content: "Build Better"; }
  25%, 45% { content: "Build Faster"; }
  50%, 70% { content: "Vibe Better"; }
  75%, 95% { content: "Vibe Faster"; }
}
```
**Usage:** Rotating marketing text

### **C. Pulse-Slow Animation**
```javascript
// Tiger only - tailwind.config.js
animation: {
  'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
}
```

---

## 🏗️ **2. SEPARATE SUMMARYVIEW COMPONENT**

### **Complete Component (129 lines)**

**File:** `src/views/SummaryView.tsx` ❌ **NOT in Lotus**

**Features:**
1. **Framer Motion Animations** - Smooth transitions
2. **Tab System** - Switch between Summary/Raw Input
3. **Floating Back Button** - Top-left corner
4. **Gradient Bottom Overlay** - `from-white via-white/95 to-transparent`
5. **Toolbar with 5 Actions:**
   - ThumbsUp (feedback)
   - ThumbsDown (feedback)
   - Regenerate
   - Copy
   - More (dropdown)

**UI Details:**
```tsx
// Floating Back Button
<div className="absolute top-4 left-4 z-10">
  <Button className="rounded-full w-8 h-8 shadow-sm border-gray-200 bg-white/80 backdrop-blur-sm">
    <ArrowLeft className="w-4 h-4 text-gray-600" />
  </Button>
</div>

// Tab Switcher (if rawInput exists)
<div className="absolute top-4 right-4 z-10 flex gap-1 bg-gray-100 p-1 rounded-lg">
  <button className="px-3 py-1 text-xs font-medium rounded">Summary</button>
  <button className="px-3 py-1 text-xs font-medium rounded">Raw Input</button>
</div>

// Content with Motion
<motion.div
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  className="flex-1 overflow-y-auto p-6 pt-16 pb-20"
>
  {activeTab === 'summary' ? summary : rawInput}
</motion.div>

// Bottom Gradient Overlay
<div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white/95 to-transparent pt-12 pb-4 px-4">
  <span className="text-[10px] text-gray-300">AI can make mistakes. Regenerate if needed.</span>
  {/* Toolbar */}
</div>
```

---

## 🛠️ **3. SUMMARY TOOLBAR COMPONENT**

### **Complete Component (316 lines)**

**File:** `src/components/SummaryToolbar.tsx` ❌ **NOT in Lotus**

### **A. Core Toolbar Buttons**

```tsx
<div className="flex items-center gap-1 p-1 bg-white rounded-xl border border-gray-100 shadow-lg min-h-[40px]">
  
  {/* 1. Good Button */}
  <Button className="h-8 w-8 rounded-lg">
    <ThumbsUp className={cn("w-4 h-4", goodActive && "fill-current")} />
  </Button>
  
  {/* Feedback Message */}
  {feedback === 'good' && (
    <div className="text-[10px] font-medium text-green-600 px-1 animate-fade-in">
      Thanks for feedback
    </div>
  )}
  
  {/* 2. Bad Button */}
  <Button className="h-8 w-8 rounded-lg">
    <ThumbsDown className={cn("w-4 h-4", badActive && "fill-current")} />
  </Button>
  
  {/* 3. Divider */}
  <div className="w-px h-4 bg-gray-200 mx-0.5 shrink-0" />
  
  {/* 4. Regenerate */}
  <Button disabled={isRegenerating}>
    <RefreshCw className={cn("w-4 h-4", isRegenerating && "animate-spin text-black")} />
  </Button>
  
  {/* 5. Copy */}
  <Button onClick={handleCopy}>
    <Copy className="w-4 h-4" />
  </Button>
  
  {/* Copy Feedback */}
  {feedback === 'copied' && (
    <div className="text-[10px] font-medium text-gray-700 flex items-center gap-1 animate-fade-in">
      <Check className="w-3 h-3" /> Copied
    </div>
  )}
  
  {/* 6. More Menu (Logged-in only) */}
  {!isGuest && (
    <Button onClick={() => setShowMoreMenu(!showMoreMenu)}>
      <MoreVertical className="w-4 h-4" />
    </Button>
  )}
</div>
```

### **B. More Menu Dropdown (6 Options)**

```tsx
{showMoreMenu && (
  <>
    <div className="fixed inset-0 z-[90]" onClick={close} />
    <div className="absolute bottom-full right-0 mb-2 z-[100] w-48 bg-white rounded-xl shadow-xl border border-gray-200 py-1">
      
      {/* 1. Listen (Text-to-Speech) */}
      <button onClick={() => {
        const utterance = new SpeechSynthesisUtterance(summary);
        window.speechSynthesis.speak(utterance);
      }}>
        <Volume2 className="w-4 h-4" /> Listen
      </button>
      
      {/* 2. PDF Export */}
      <button onClick={() => {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
          <html>
            <head><title>Summary - SummarAI</title></head>
            <body>${summary.replace(/\n/g, '<br>')}</body>
          </html>
        `);
        printWindow.print();
      }}>
        PDF
      </button>
      
      {/* 3. Download JSON */}
      <button onClick={() => {
        const blob = new Blob([JSON.stringify({ summary, date: new Date().toISOString() }, null, 2)]);
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `summary-${Date.now()}.json`;
        a.click();
      }}>
        Download JSON
      </button>
      
      {/* 4. Download Markdown */}
      <button onClick={() => {
        const md = `# Summary\n\n${summary}\n\nGenerated by SummarAI`;
        const blob = new Blob([md], { type: 'text/markdown' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `summary-${Date.now()}.md`;
        a.click();
      }}>
        Download Markdown
      </button>
      
      {/* 5. Mail */}
      <button onClick={() => {
        const subject = encodeURIComponent("Summary from SummarAI");
        const body = encodeURIComponent(summary);
        window.open(`mailto:?subject=${subject}&body=${body}`);
      }}>
        Mail
      </button>
      
      {/* Divider */}
      <div className="h-px bg-gray-100 my-1" />
      
      {/* 6. Report Issue */}
      <button className="text-red-600 hover:bg-red-50" onClick={onReportIssue}>
        Report Issue
      </button>
    </div>
  </>
)}
```

---

## 📝 **4. EDITABLE SUMMARY FEATURE**

### **In HomeView.tsx (Lines 1087-1110)**

```tsx
{summary && genState === 'completed' && (
  <div className="flex-1 overflow-y-auto">
    {isEditing ? (
      // EDITABLE MODE
      <textarea
        value={summary}
        onChange={(e) => setSummary(e.target.value)}
        onBlur={() => setIsEditing(false)}
        autoFocus
        className="flex-1 w-full resize-none no-scrollbar p-6 pt-20 pb-4 text-sm leading-relaxed text-gray-700 text-justify font-sans border-none focus:ring-0 outline-none"
      />
    ) : (
      // READ-ONLY MODE with Smart Formatting
      <div className="flex-1 overflow-y-auto p-6 pt-20 pb-4 custom-scrollbar">
        {summary.split('\n').map((line, i) => {
          const trimmed = line.trim();
          // Bullet point detection
          if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
            return (
              <div key={i} className="flex gap-2 items-start">
                <span className="shrink-0 text-black font-bold">•</span>
                <span>{trimmed.substring(1).trim()}</span>
              </div>
            );
          }
          return <p key={i}>{line}</p>;
        })}
      </div>
    )}
  </div>
)}
```

**State Management:**
```tsx
const [summary, setSummary] = useState<string | null>(null);
const [isEditing, setIsEditing] = useState(false);
```

---

## 🐛 **5. DEBUG TOAST DROPDOWN (Admin Only)**

### **Complete UI (Lines 849-1028)**

**Trigger Button:**
```tsx
<button
  onClick={() => setShowDebugToastDropdown(!showDebugToastDropdown)}
  className="w-full py-1 text-[10px] font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded hover:bg-gray-100 flex items-center justify-center gap-1"
>
  Test Toasts
  <ChevronDown className="w-3 h-3" />
</button>
```

### **Dropdown Structure:**

```tsx
{showDebugToastDropdown && (
  <div className="mt-1 bg-white border border-gray-200 rounded-lg shadow-sm flex flex-col p-1 gap-1">
    
    {/* SUCCESS TYPES SECTION (Collapsible) */}
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between text-[9px] font-semibold text-gray-400 px-1 uppercase tracking-wider cursor-pointer" onClick={() => setShowSuccessTypes(!showSuccessTypes)}>
        <span>Success Types</span>
        <ChevronDown className={cn("w-3 h-3 transition-transform", !showSuccessTypes && "-rotate-90")} />
      </div>
      
      {showSuccessTypes && (
        <>
          {/* 1. Login Success */}
          <button onClick={() => toast.success('Successfully signed in!')} className="py-1 text-[10px] font-medium text-green-600 bg-green-50 border border-green-200 rounded hover:bg-green-100 text-left px-2">
            Login Success
          </button>
          
          {/* 2. Logout Success */}
          <button onClick={() => toast.success('Successfully signed out.')} className="...">
            Logout Success
          </button>
          
          {/* 3. Format Change */}
          <button onClick={() => toast.success('Format changed to JSON')} className="...">
            Format Change
          </button>
          
          {/* 4. History Cleared */}
          <button onClick={() => toast.success('History cleared successfully.')} className="...">
            History Cleared
          </button>
        </>
      )}
    </div>
    
    <div className="h-px bg-gray-100 my-1" />
    
    {/* ERROR TYPES SECTION (Collapsible) */}
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between text-[9px] font-semibold text-gray-400 px-1 uppercase tracking-wider cursor-pointer" onClick={() => setShowErrorTypes(!showErrorTypes)}>
        <span>Error Types</span>
        <ChevronDown className={cn("w-3 h-3 transition-transform", !showErrorTypes && "-rotate-90")} />
      </div>
      
      {showErrorTypes && (
        <>
          {/* 1. Auth Failed */}
          <button onClick={() => toast.error('Login failed. Please try again.')} className="py-1 text-[10px] font-medium text-red-600 bg-red-50 border border-red-200 rounded hover:bg-red-100 text-left px-2">
            Auth Failed
          </button>
          
          {/* 2. Quota Exceeded */}
          <button onClick={() => toast.error("You've used your 3 free summaries today!", { duration: 5000 })} className="...">
            Quota Exceeded
          </button>
          
          {/* 3. No Content */}
          <button onClick={() => toast.error('No user prompts found')} className="...">
            No Content
          </button>
          
          {/* 4. Connection Error */}
          <button onClick={() => toast.error('Tab closed or inaccessible. Please reload the page.')} className="...">
            Connection Error
          </button>
          
          {/* 5. Generic Error */}
          <button onClick={() => toast.error('Error! Something went wrong.')} className="...">
            Generic Error
          </button>
        </>
      )}
    </div>
    
    <div className="h-px bg-gray-100 my-1" />
    
    {/* CUSTOM TOASTS */}
    <button onClick={() => {
      const id = toast.loading('Loading data...');
      setTimeout(() => toast.dismiss(id), 2000);
    }} className="py-1 text-[10px] font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100">
      Loading
    </button>
    
    <button onClick={() => toast('Custom Icon Toast', { icon: '🚀' })} className="py-1 text-[10px] font-medium text-purple-600 bg-purple-50 border border-purple-200 rounded hover:bg-purple-100">
      Custom
    </button>
  </div>
)}
```

### **Simulate Popups Section:**
```tsx
<div className="mt-2 pt-2 border-t border-gray-100">
  <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Simulate Popups</p>
  <div className="grid grid-cols-2 gap-1">
    {/* Guest → Free */}
    <button onClick={() => {
      setActivePopup('profile');
      toast.error("Guest Quota Exceeded (5/5). Sign in for 10 more!", { duration: 3000 });
    }} className="py-1.5 text-[10px] font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100">
      Guest → Free
    </button>
    
    {/* Free → Pro */}
    <button onClick={() => {
      setShowUpgradeModal(true);
      toast.error("Daily Quota Exceeded (10/10). Upgrade to Pro!", { duration: 3000 });
    }} className="py-1.5 text-[10px] font-medium text-purple-600 bg-purple-50 border border-purple-200 rounded hover:bg-purple-100">
      Free → Pro
    </button>
  </div>
</div>
```

**State Variables:**
```tsx
const [showDebugToastDropdown, setShowDebugToastDropdown] = useState(false);
const [showSuccessTypes, setShowSuccessTypes] = useState(true);
const [showErrorTypes, setShowErrorTypes] = useState(true);
```

---

## 📐 **6. LAYOUT & POSITIONING DIFFERENCES**

### **A. Checkboxes Position**

**Tiger:**
```tsx
{/* Inside summary box, at bottom (Lines 1265-1310) */}
<div className="shrink-0 flex flex-col gap-4 pb-2">
  <div className="space-y-3 px-1">
    <CheckboxRow label="Include AI responses" subtext="Summarize the full conversation" checked={includeAI} onChange={...} />
    <CheckboxRow label="Read images" subtext="Include visual context" checked={analyzeImages} onChange={...} />
  </div>
</div>
```

**With Toast Feedback:**
```tsx
onChange={() => {
  const newValue = !includeAI;
  setIncludeAI(newValue);
  if (newValue) {
    if (analyzeImages) {
      toast.success("Including AI responses & Images");
    } else {
      toast.success("Including AI responses");
    }
  } else {
    if (analyzeImages) {
      toast.success("Prompts & Images only");
    } else {
      toast.success("Prompts only");
    }
  }
}}
```

### **B. Generate Button Logic**

**Tiger (Lines 1252-1262):**
```tsx
{/* Shows for LOGGED-IN users when no summary */}
{effectiveUser && !summary && (
  <GenerateButton
    onGenerate={handleGenerate}
    state={genState}
    isRegenerating={isRegenerating}
    disabled={!isSupported}
    includeAI={includeAI}
    analyzeImages={analyzeImages}
    isGuest={false}  // ← Key difference
  />
)}
```

**Lotus:**
```tsx
{/* Shows for GUESTS only */}
{!effectiveUser && !isCompact && genState !== 'completed' && (
  <GenerateButton
    isGuest={true}  // ← Always true
  />
)}
```

---

## 🎯 **7. SUMMARY DISPLAY ENHANCEMENTS**

### **A. Top Solid Header Mask**
```tsx
{/* Line 1083 - Tiger only */}
<div className="absolute top-0 left-0 right-0 h-16 bg-white z-20 border-b border-gray-50" />
```

### **B. Disclaimer Text**
```tsx
{/* Lines 1115-1120 */}
<div className="w-full text-center">
  <span className="text-[10px] text-gray-500 bg-gray-50 px-3 py-1 rounded-full border border-gray-100 opacity-80">
    Captures your final intent. Regenerate if needed.
  </span>
</div>
```

### **C. Bottom Section with Toolbar**
```tsx
{/* Lines 1113-1130 */}
<div className="w-full shrink-0 flex flex-col items-end gap-3 bg-white border-t border-gray-50 pt-4 pb-4 px-4">
  {/* Disclaimer */}
  <div className="w-full text-center">...</div>
  
  {/* Floating Toolbar */}
  <SummaryToolbar
    summary={summary}
    onRegenerate={handleRegenerate}
    onReportIssue={() => setShowReportModal(true)}
    isRegenerating={isRegenerating}
    isGuest={!effectiveUser}
  />
</div>
```

---

## 🔧 **8. ADDITIONAL STATE MANAGEMENT**

**Tiger has these extra states:**
```tsx
const [summary, setSummary] = useState<string | null>(null);
const [isEditing, setIsEditing] = useState(false);
const [showDebugToastDropdown, setShowDebugToastDropdown] = useState(false);
const [showSuccessTypes, setShowSuccessTypes] = useState(true);
const [showErrorTypes, setShowErrorTypes] = useState(true);
const [adminFeatures, setAdminFeatures] = useState({
  imageAnalysis: true,
  creativeTone: true,
  professionalTone: true,
  jsonFormat: true,
  xmlFormat: true
});
```

---

## 📊 **SUMMARY TABLE**

| Feature | Lines in Tiger | Missing in Lotus | Complexity |
|---------|---------------|------------------|------------|
| **SummaryView Component** | 129 lines | ✅ Entire component | High |
| **SummaryToolbar Component** | 316 lines | ✅ Entire component | High |
| **Editable Summary** | ~30 lines | ✅ Full feature | Medium |
| **Debug Toast Dropdown** | ~180 lines | ✅ Full UI | High |
| **Blink Animation** | CSS | ✅ Animation | Low |
| **Text Cycle Animation** | CSS | ✅ Animation | Low |
| **Smart Bullet Formatting** | ~15 lines | ✅ Logic | Low |
| **Checkbox Toast Feedback** | ~40 lines | ✅ UX enhancement | Low |
| **Top Header Mask** | 1 line | ✅ Visual element | Low |
| **Bottom Toolbar Section** | ~20 lines | ✅ Layout | Medium |

**Total Missing Code:** ~750+ lines of UI-specific code

---

**End of Document**
