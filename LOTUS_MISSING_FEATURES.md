# Lotus Missing Features - Quick Reference

**What Lotus is Missing from Tiger (UI/UX Only)**

---

## 🎨 **CSS & Animations**

### **Missing Animations:**
```css
/* Not in Lotus */
.animate-blink
.animate-text-cycle
@keyframes blink
@keyframes textCycle
animation: 'pulse-slow'
```

---

## 🏗️ **Component Architecture**

### **1. SummaryView.tsx Component**
❌ **Lotus does NOT have a separate SummaryView component**
- Tiger switches between HomeView ↔ SummaryView
- Lotus uses all-in-one HomeView

### **2. Editable Summary**
❌ **No inline editing in Lotus**
```tsx
// Tiger has:
{isEditing ? (
  <textarea value={summary} onChange={...} />
) : (
  <div>{summary}</div>
)}

// Lotus only has:
<div>{generatedSummary}</div>
```

### **3. SummaryToolbar Component**
❌ **Not used in Lotus HomeView**
```tsx
// Tiger has:
<SummaryToolbar
  summary={summary}
  onEdit={() => setIsEditing(!isEditing)}
  onRegenerate={handleRegenerate}
  isEditing={isEditing}
/>
```

---

## 🛠️ **Admin Features**

### **Debug Toast Dropdown**
❌ **Lotus does NOT have debug toast testing UI**

Tiger has extensive debug UI with:
- Success toast types (4 variants)
- Error toast types (5 variants)
- Custom toast inputs
- Collapsible sections

```tsx
// Tiger only - ~164 lines of debug UI
<div className="relative mt-2">
  <button>Debug Toasts</button>
  {showDebugToastDropdown && (
    <div>
      {/* Success Types Section */}
      {/* Error Types Section */}
      {/* Custom Toasts Section */}
    </div>
  )}
</div>
```

---

## 🎯 **State Management**

### **Missing State Variables:**
```tsx
// Tiger has (Lotus doesn't):
const [summary, setSummary] = useState<string | null>(null);
const [isEditing, setIsEditing] = useState(false);
const [adminFeatures, setAdminFeatures] = useState({...});
const [showDebugToastDropdown, setShowDebugToastDropdown] = useState(false);
const [showSuccessTypes, setShowSuccessTypes] = useState(true);
const [showErrorTypes, setShowErrorTypes] = useState(true);
```

---

## 📐 **Layout Differences**

### **Checkboxes Position**
- **Tiger:** Inside summary box at bottom
- **Lotus:** Outside summary box, below it

### **Generate Button Logic**
- **Tiger:** Shows for logged-in users
- **Lotus:** Shows for guests only (`isGuest={true}`)

### **Profile Popup**
- **Tiger:** `top-16` positioning
- **Lotus:** `top-14` positioning

---

## 🎨 **Visual Styling**

### **Summary Box**
```tsx
// Tiger:
<div className="...rounded-2xl overflow-hidden">

// Lotus:
<div className="...rounded-2xl overflow-hidden bg-white">
```
Lotus explicitly sets `bg-white`

---

## ✨ **What Lotus HAS that Tiger DOESN'T**

### **1. Smart AI Provider Routing**
```tsx
// Lotus only:
if (contentLength < 50) {
  selectedProvider = 'openai'; // Use OpenAI for short content
}
```

### **2. Automatic Fallback**
```tsx
// Lotus only:
try {
  // Try OpenAI
} catch (primaryError) {
  // Fallback to Gemini
  toast.success('✨ Summary generated using Gemini (OpenAI temporarily unavailable)');
}
```

### **3. Back Button in HomeView**
```tsx
// Lotus only:
{genState === 'completed' && generatedSummary && (
  <div className="absolute top-4 left-4 z-30">
    <Button onClick={() => { setGeneratedSummary(''); setGenState('idle'); }}>
      <ArrowLeft />
    </Button>
  </div>
)}
```

### **4. Better Code Organization**
```tsx
// Tiger:
import { cn, Tooltip } from './ui/Tooltip';

// Lotus:
import { Tooltip } from './ui/Tooltip';
import { cn } from '../utils/cn';
```

---

## 📊 **Quick Decision Matrix**

| Use Tiger If You Need: | Use Lotus If You Need: |
|------------------------|------------------------|
| Editable summaries | Stable, minimal UI |
| Separate summary view | All-in-one view |
| Admin debug tools | Smart AI routing |
| More animations | Automatic fallback |
| Feature-rich experience | Simplified architecture |

---

## 🎯 **Migration Path: Lotus → Tiger**

To add Tiger features to Lotus:

1. **Add SummaryView component** (create new file)
2. **Add edit state** (`isEditing`, `summary`)
3. **Add SummaryToolbar** (import and use)
4. **Add debug UI** (copy lines 849-1013 from Tiger HomeView)
5. **Add animations** (copy from Tiger index.css)
6. **Move checkboxes** (inside summary box)
7. **Update generate button logic** (show for logged-in users)

---

**End of Quick Reference**
