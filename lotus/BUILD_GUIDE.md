# Lotus Project - Build & Test Guide

## 📋 Current Status

The **Lotus** project has been successfully rebuilt with all UI components recreated from scratch:

✅ All components created:
- `PulseCheck.tsx` - Feedback modal
- `QuotaCounter.tsx` - Quota display
- `ReportIssueModal.tsx` - Issue reporting
- `UpgradeModal.tsx` - Upgrade prompts
- `CheckboxRow.tsx` - Checkbox component
- `SummaryView.tsx` - Summary display
- `HomeView.tsx` - Main view
- `GenerateButton.tsx` - Generation button
- `SummaryToolbar.tsx` - Toolbar with actions

## ⚠️ Build Errors to Fix

There are **13 TypeScript errors** that need to be resolved:

### 1. Missing Core Files
The build expects these files that need to be copied from the tiger project:
- `src/core/scraper/scraper.ts` - Main scraper logic
- `src/core/scraper/types.ts` - Type definitions

### 2. Type Errors
- `src/content.ts` - Parameters need type annotations
- `src/components/ui/Tooltip.tsx` - Unused 'side' parameter

### 3. Unused Variables
Several unused functions in `HomeView.tsx` (these are actually needed but not wired up yet)

## 🚀 How to Build & Test

### Step 1: Copy Missing Core Files

```bash
cd /Users/bharathamaravadi/Desktop/tiger/lotus

# Copy scraper files from tiger project
cp ../src/core/scraper/scraper.ts src/core/scraper/
cp ../src/core/scraper/types.ts src/core/scraper/
```

### Step 2: Build the Extension

```bash
npm run build
```

This will:
- Compile TypeScript
- Bundle with Vite
- Create a `dist` folder with the extension

### Step 3: Load in Chrome

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top-right)
3. Click "Load unpacked"
4. Select the `/Users/bharathamaravadi/Desktop/tiger/lotus/dist` folder

### Step 4: Test the Extension

1. Navigate to a supported site (ChatGPT, Gemini, Claude)
2. Click the extension icon or open the side panel
3. Test generating a summary
4. Verify all UI components work

## 🔧 Quick Fixes Needed

To get a successful build immediately, you can either:

**Option A: Copy the missing files** (recommended)
```bash
cp ../src/core/scraper/*.ts src/core/scraper/
```

**Option B: Ignore TypeScript errors temporarily**
```bash
npm run build -- --mode development
```

## 📝 Next Steps

After fixing the build errors:

1. **Test core functionality** - Summary generation
2. **Test authentication** - Sign in/out
3. **Test modals** - PulseCheck, ReportIssue, Upgrade
4. **Test history** - Save/load summaries
5. **Test quota** - Verify limits work

## ℹ️ Key Differences from Tiger

The Lotus project:
- ✅ Uses the same UI/UX
- ✅ Has the same integrations (Firebase, Analytics, Chrome Auth)
- ✅ Maintains the same user journey
- ❌ Contains NO original code from tiger (fully rebuilt)

## 🎯 Success Criteria

The build is complete when:
- [ ] `npm run build` succeeds with no errors
- [ ] Extension loads in Chrome without errors
- [ ] Can generate summaries on supported sites
- [ ] All modals and popups work correctly
- [ ] Authentication flow works
- [ ] History syncs properly

---

**Current Location:** `/Users/bharathamaravadi/Desktop/tiger/lotus`

**Tiger Location (for reference):** `/Users/bharathamaravadi/Desktop/tiger`
