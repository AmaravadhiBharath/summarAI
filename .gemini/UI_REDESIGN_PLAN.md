# Side Panel UI Redesign Plan

## Objective
Redesign the extension side panel to feel like a native Chrome feature with modern UX, dark/light mode support, and browser color scheme matching.

## Design Principles
1. **Browser-Native Look**: Match Chrome's modern, minimal design language
2. **Adaptive Theming**: Auto-detect and match system/browser theme (dark/light)
3. **Clean & Minimal**: Remove visual clutter, focus on core actions
4. **Tooltips**: Add helpful tooltips for all interactive elements
5. **Responsive**: Adapt to side panel resize

## Key Changes

### 1. Theme System
- Detect system color scheme (`prefers-color-scheme`)
- Support light/dark/auto modes
- Use CSS variables for all colors
- Match Chrome's native color palette

### 2. Layout Redesign
```
┌─────────────────────────────┐
│  Logo  SummarAI    [Pro][👤] │ ← Minimal header
├─────────────────────────────┤
│                             │
│  [Summary Content Area]     │ ← Main focus
│  - Clean typography         │
│  - Proper spacing           │
│  - Syntax highlighting      │
│                             │
├─────────────────────────────┤
│ ☑ Include AI  ☑ Images      │ ← Compact options
│ [Generate]  [⚙]  [📜]  [❓]  │ ← Icon toolbar
└─────────────────────────────┘
```

### 3. UI Components to Update
- **Header**: Minimal, browser-like chrome://... appearance
- **Buttons**: Rounded, ghost-style buttons with hover states
- **Dropdowns**: Match Chrome's native dropdown style
- **Tooltips**: Add to all icons and actions
- **Modals**: Overlay style matching Chrome settings
- **Summary Display**: Clean card with proper typography

### 4. Color Scheme

####Light Mode:
- Background: `#ffffff`
- Surface: `#f8f9fa`
- Border: `#e8eaed`
- Text Primary: `#202124`
- Text Secondary: `#5f6368`
- Accent: `#1a73e8` (Chrome blue)

#### Dark Mode:
- Background: `#202124`
- Surface: `#292a2d`
- Border: `#3c4043`
- Text Primary: `#e8eaed`
- Text Secondary: `#9aa0a6`
- Accent: `#8ab4f8` (Chrome blue light)

### 5. Typography
- Font: System font stack (match browser)
- Headings: 500-600 weight
- Body: 400 weight
- Monospace: For code/JSON/XML output

## Technical Implementation

### Files to Modify:
1. `/lotus/src/index.css` - Add CSS variables and theme styles
2. `/lotus/src/App.tsx` - Add theme provider
3. `/lotus/src/views/HomeView.tsx` - Redesign main UI
4. `/lotus/src/components/Layout.tsx` - Update container styles
5. Create `/lotus/src/hooks/useTheme.ts` - Theme detection hook

### Keep Intact (Core Functionality):
- All state management logic
- API calls and data processing
- Authentication flow
- History/settings management
- Quota tracking
- Content processing pipeline

## Phase 1: Theme System (30 min)
1. Create CSS variables in index.css
2. Create useTheme hook
3. Add theme toggle capability

## Phase 2: Layout Redesign (45 min)
1. Simplify header
2. Redesign main container
3. Update button styles
4. Add tooltips

## Phase 3: Components (30 min)
1. Update modals
2. Restyle dropdowns
3. Improve summary display
4. Add icons where needed

## Phase 4: Testing (15 min)
1. Test light/dark switching
2. Verify all features work
3. Check responsive behavior
4. Build and verify

Total Time: ~2 hours
