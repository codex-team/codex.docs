# App Initialization - Quick Reference

**Task:** 1.3 - Initialize Theme Manager in App  
**Version:** 1.0  
**Last Updated:** November 6, 2025

---

## 🚀 Quick Start

### What This Task Does

Ensures the correct theme is applied BEFORE the page renders by initializing ThemeManager as the first operation in the app constructor.

### Why This Matters

```
✗ Without Task 1.3:
  1. Page renders (no theme applied yet)
  2. App initializes
  3. ThemeManager.init() runs
  4. Colors change suddenly (FOUC)
  
✓ With Task 1.3:
  1. App initializes
  2. ThemeManager.init() runs (synchronous)
  3. Colors applied
  4. Page renders (correct theme)
  No FOUC!
```

### FOUC = Flash of Unstyled Content

When user sees theme change happen during page load instead of before.

---

## 📝 Code Changes

### What Was Changed

**File:** `src/frontend/js/app.ts`

**Change 1: Added Import**
```javascript
// At the top of app.ts with other imports
import ThemeManager from './modules/themeManager';
```

**Change 2: Initialize in Constructor**
```javascript
export default class App {
  constructor() {
    // First thing: Initialize theme (synchronously)
    ThemeManager.init();
    
    // Then: Initialize other modules
    this.dispatcher = new Dispatcher();
    this.writing = new Writing();
    this.page = new Page();
    this.extensions = new Extensions();
    this.sidebar = new Sidebar();
  }
}
```

### Critical Details

- ✓ `ThemeManager.init()` must be first line in constructor
- ✓ No code before `ThemeManager.init()`
- ✓ All operations are synchronous (instant)
- ✓ DOM attribute applied before page renders

---

## 🔄 Initialization Flow

### Execution Order

```
1. HTML loads
2. app.js runs
3. App constructor called
4. ↓ ThemeManager.init() (synchronous)
   └─ Check localStorage
   └─ Check system preference
   └─ Set DOM attribute: data-theme
5. ↓ CSS cascade triggered
   └─ Variables applied
6. ↓ Other modules initialize
   └─ Writing, Page, Extensions, Sidebar
7. ↓ Page renders
   └─ WITH correct theme already applied
```

**Time Relative to Page Render:**
- Step 4 (ThemeManager.init): **BEFORE render**
- Step 5 (CSS cascade): **BEFORE render**
- Step 6 (Other modules): **BEFORE render**
- Step 7 (Page render): **AFTER everything**

**Result:** No FOUC. Theme applied instantly before visible rendering.

---

## 🧪 How to Verify It Works

### Test 1: Theme Loads Immediately

1. Open browser DevTools
2. Refresh page
3. Watch Network tab
4. Check Elements tab for `data-theme` attribute
   - Should be set instantly
   - Should NOT change after page loads

**Expected:** `<html data-theme="dark">` (or appropriate value)

### Test 2: No FOUC in Network Throttle

1. Open DevTools → Network tab
2. Set Throttle to "Fast 3G"
3. Hard refresh (Ctrl+Shift+R)
4. Watch page load
5. Observe: Theme applies BEFORE content renders

**Expected:** No flash of wrong theme

### Test 3: localStorage Persistence

1. Open DevTools → Console
2. Check current theme: `ThemeManager.getCurrentTheme()`
3. Toggle theme in UI
4. Refresh page
5. Check localStorage: `localStorage.getItem('codex-docs-theme')`

**Expected:** Preference persists across reloads

### Test 4: System Preference Fallback

1. Open DevTools → Console
2. Clear localStorage: `localStorage.clear()`
3. Refresh page
4. System preference should apply
5. Check: `window.matchMedia('(prefers-color-scheme: dark)').matches`

**Expected:** System preference respected if no saved preference

---

## 📊 Initialization Sequence Checklist

**Before ThemeManager.init():**
- [ ] app.js parsed
- [ ] All imports loaded
- [ ] Constructor called

**During ThemeManager.init():**
- [ ] localStorage checked (synchronous)
- [ ] System preference checked (synchronous)
- [ ] DOM attribute set (synchronous)

**After ThemeManager.init():**
- [ ] CSS cascade evaluated
- [ ] Variables resolved
- [ ] Other modules initialize
- [ ] Page renders

**Result:**
- [ ] No errors in console
- [ ] data-theme attribute set
- [ ] Correct colors applied
- [ ] No FOUC visible

---

## 🔍 Debugging

### Problem: FOUC Still Occurring

**Possible Causes:**
1. ThemeManager.init() called too late
2. Called after other DOM manipulation
3. Not called synchronously
4. CSS not imported correctly

**Solutions:**
```javascript
// ✓ Correct placement (first line)
constructor() {
  ThemeManager.init();  // ← First
  // other code
}

// ✗ Wrong: Called after module initialization
constructor() {
  this.page = new Page();  // ← Too early
  ThemeManager.init();     // ← Too late!
}

// ✗ Wrong: Called asynchronously
constructor() {
  setTimeout(() => {
    ThemeManager.init();   // ← Async - causes FOUC
  }, 0);
}
```

### Problem: DOM Attribute Not Set

**Debug Steps:**
1. Open DevTools
2. Inspect `<html>` element
3. Look for `data-theme` attribute
4. Should show `data-theme="light"` or `data-theme="dark"`

**If Missing:**
- Check import statement exists in app.ts
- Check ThemeManager.init() called in constructor
- Check no errors in console
- Clear cache and hard refresh

### Problem: Wrong Theme Applied

**Debug Steps:**
1. Check localStorage: `localStorage.getItem('codex-docs-theme')`
2. Check system preference: `window.matchMedia('(prefers-color-scheme: dark)').matches`
3. Check DOM attribute: `document.documentElement.getAttribute('data-theme')`

**If Wrong Value:**
- User preference overrides system preference (expected)
- Clear localStorage to reset: `localStorage.clear()`
- Check CSS variables defined in vars.pcss and dark-mode.pcss

---

## 🎯 Key Concepts

### Synchronous Operations

All operations in ThemeManager.init() are synchronous (instant, no waiting):

```javascript
✓ localStorage.getItem()        // Synchronous
✓ window.matchMedia()           // Synchronous
✓ setAttribute()                // Synchronous
✗ fetch()                       // Asynchronous - WRONG
✗ setTimeout()                  // Asynchronous - WRONG
✗ async/await                   // Asynchronous - WRONG
```

### Initialization Priority

```
1. ThemeManager.init()    (Synchronous theme setup)
2. Dispatcher             (Event system)
3. Writing               (Edit functionality)
4. Page                  (Page rendering)
5. Extensions            (Plugin system)
6. Sidebar               (Navigation)
```

Theme must initialize before any module modifies the DOM.

### DOM Attribute Cascade

```html
<!-- HTML element gets attribute -->
<html data-theme="dark">

<!-- CSS selects based on attribute -->
[data-theme="dark"] {
  --color-text-main: #E0E0E0;
}

<!-- Components use variable -->
.text {
  color: var(--color-text-main);  /* #E0E0E0 */
}
```

---

## 📚 Related Tasks

**Task 1.1:** ThemeManager Module
- What: Creates the theme management logic
- Why: Needed for theme operations
- Link: `1.1-theme-manager-foundation/`

**Task 1.2:** CSS Variables
- What: Defines color variables for light/dark modes
- Why: Themes need color definitions
- Link: `1.2-css-variables-infrastructure/`

**Task 2.1-2.3:** Header Toggle Button
- What: UI to switch themes manually
- Why: Users need way to change theme
- Depends On: Tasks 1.1-1.3 complete

---

## ✅ Acceptance Criteria

All criteria verified met:

- [x] ThemeManager imported in app.ts
- [x] ThemeManager.init() called in constructor
- [x] Called as first operation in constructor
- [x] All operations are synchronous
- [x] DOM attribute set before page renders
- [x] No FOUC occurs
- [x] Build successful (frontend + backend)
- [x] No new errors or warnings
- [x] Backward compatible (no breaking changes)

---

## 💡 Best Practices

✅ **DO:**
- Keep ThemeManager.init() as first line in constructor
- Keep all operations synchronous
- Always have a fallback to light mode
- Test in DevTools Network throttling

❌ **DON'T:**
- Add async operations to ThemeManager.init()
- Call ThemeManager.init() after other modules
- Add DOM manipulation before ThemeManager.init()
- Use setTimeout or Promises in initialization

---

## 🔗 File Locations

```
src/
└── frontend/
    └── js/
        ├── app.ts              ← Modified file (add import + call)
        └── modules/
            └── themeManager.js  ← Called from app.ts
```

**Modified File:** `src/frontend/js/app.ts`

**Related Files:**
- `src/frontend/styles/vars.pcss` - Light mode colors
- `src/frontend/styles/dark-mode.pcss` - Dark mode colors
- `src/frontend/js/modules/themeManager.js` - Theme logic

---

**End of Quick Reference**
