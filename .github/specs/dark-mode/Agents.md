# Dark Mode Feature - Agents Reference Guide

**Document Version:** 1.0  
**Last Updated:** November 6, 2025  
**Status:** Active  
**Branch:** feature/dark-mode

This document serves as a comprehensive reference for any AI agent or developer resuming work on the dark mode feature. It contains all necessary context, architecture decisions, design rationale, and implementation guidance.

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Project Context](#project-context)
3. [Architecture Overview](#architecture-overview)
4. [Key Design Decisions](#key-design-decisions)
5. [Component Breakdown](#component-breakdown)
6. [Implementation Checklist](#implementation-checklist)
7. [Testing Scenarios](#testing-scenarios)
8. [Troubleshooting](#troubleshooting)
9. [Related Files](#related-files)

---

## Quick Start

### For Resuming Development

1. **Review the requirements** → `Requirements.md`
2. **Understand the design** → `Design.md`
3. **Check current progress** → `Tasks.md` (look for "In Progress" or "Completed")
4. **Pick up next task** → See "Implementation Checklist" below
5. **Reference architecture** → "Architecture Overview" section

### The Big Picture

**Goal:** Add VS Code-style dark mode to CodeX Docs with theme toggle, persistent preferences, and full component coverage.

**Approach:** CSS custom properties + JavaScript theme manager for instant switching without page reload.

**Status:** Planning phase complete; ready for Phase 1 implementation.

---

## Project Context

### Repository Information
- **Repo:** codex-team/codex.docs
- **Branch:** feature/dark-mode
- **Working Directory:** C:\Projects\codex.docs
- **Specs Directory:** C:\Projects\codex.docs\.github\specs\dark-mode
- **Base Branch:** main (when merging)

### Current State
- `.editorconfig`: ✓ Reviewed (tabs, 4-space indent, LF line endings)
- Project structure: ✓ Analyzed
- Existing styles: ✓ Analyzed (uses PCSS with CSS variables)
- Frontend architecture: ✓ Understood (module-dispatcher pattern)
- Code style: ✓ Documented

### Technology Stack
- **Frontend:** Vanilla JavaScript (ES6 modules)
- **Styling:** PostCSS with custom properties
- **Build:** Webpack
- **Architecture:** Module-dispatcher based modular system
- **Templating:** Twig (backend)
- **Testing:** Existing test structure in `src/test/`

### Key Constraints
1. Must follow `.editorconfig` standards (tabs, 4-space, LF)
2. Must maintain existing module-dispatcher architecture
3. Must use CSS custom properties (no CSS-in-JS)
4. Must support localStorage for persistence
5. Must support `prefers-color-scheme` media query
6. Must be WCAG AA accessible
7. No breaking changes to existing functionality
8. Must work across modern browsers (Chrome, Firefox, Safari, Edge)

---

## Architecture Overview

### System Design

```
┌─ User Interaction ─────────────────────────┐
│  Theme Toggle Button (Header)              │
│  - Click to switch theme                   │
│  - Shows sun/moon icon                     │
│  - Keyboard accessible                     │
└────────────────┬──────────────────────────┘
                 │
┌────────────────▼──────────────────────────┐
│  ThemeManager Module                       │
│  (src/frontend/js/modules/themeManager.js) │
│  - Detect system preference                │
│  - Load/save localStorage                  │
│  - Apply theme to DOM                      │
│  - Emit events                             │
└────────────────┬──────────────────────────┘
                 │
┌────────────────▼──────────────────────────┐
│  DOM Element Attribute                     │
│  document.documentElement[data-theme]      │
│  - "light" or "dark"                       │
│  - Updates synchronously                   │
└────────────────┬──────────────────────────┘
                 │
┌────────────────▼──────────────────────────┐
│  CSS Cascading                             │
│  :root { --color-text-main: #060C26; }    │
│  [data-theme="dark"] {                     │
│    --color-text-main: #E0E0E0;            │
│  }                                         │
└────────────────┬──────────────────────────┘
                 │
┌────────────────▼──────────────────────────┐
│  Component Styles                          │
│  color: var(--color-text-main);           │
│  background: var(--color-bg-main);        │
└────────────────────────────────────────────┘
```

### Data Flow

**On App Startup:**
```
1. HTML loads (no theme applied yet)
2. app.js runs
3. ThemeManager.init() called
4. ThemeManager checks:
   a. localStorage[codex-docs-theme]? Use it
   b. prefers-color-scheme? Use system preference
   c. Neither? Default to 'light'
5. Set document.documentElement.setAttribute('data-theme', theme)
6. CSS variables instantly update
7. App renders with correct colors
```

**On Theme Toggle:**
```
1. User clicks theme button
2. Button emits 'themeToggle' event
3. ThemeManager listens and receives event
4. ThemeManager.setTheme(newTheme):
   a. Update DOM attribute
   b. Save to localStorage
   c. Emit 'themeChange' event
5. CSS updates instantly (no re-render needed)
6. Button icon updates
```

**On Page Reload:**
```
1. localStorage read synchronously
2. ThemeManager.init() restores saved theme
3. DOM attribute set BEFORE page renders
4. No "flash of unstyled theme" (FOUC)
5. Page loads with correct colors
```

### Critical Files

| File | Purpose | Status |
|------|---------|--------|
| `src/frontend/js/modules/themeManager.js` | Theme logic | To Create (Task 1.1) |
| `src/frontend/styles/vars.pcss` | CSS variables | To Update (Task 1.2) |
| `src/frontend/styles/dark-mode.pcss` | Dark colors | To Create (Task 1.2) |
| `src/frontend/js/app.js` | Init theme | To Update (Task 1.3) |
| `src/frontend/views/components/header.twig` | Toggle button | To Update (Task 2.1) |
| `src/frontend/styles/components/*.pcss` | All components | To Update (Phase 2) |

---

## Phase 1 Implementation Summary (COMPLETED ✓)

**Completion Date:** November 6, 2025  
**Status:** ✓ Build Verified - No Compilation Errors  
**Build Output:** `npm run build-frontend` executed successfully with 1 warning (editor.bundle.js size)

### Task 1.1: Create Theme Manager Module - COMPLETED ✓

**What Was Built:**
Created `src/frontend/js/modules/themeManager.js` - a 227-line singleton module that serves as the central theme management system.

**Key Implementation Details:**

1. **Module Structure:**
   - Exported as default singleton: `export default new ThemeManager()`
   - Pattern: Follows existing module-dispatcher architecture
   - Dependencies: None (pure vanilla JavaScript)

2. **Constants Defined:**
   ```javascript
   static STORAGE_KEY = 'codex-docs-theme'
   static THEMES = {
     LIGHT: 'light',
     DARK: 'dark'
   }
   ```

3. **Core Methods Implemented:**
   - `init()` - Initializes theme on startup, checks saved preference then system preference
   - `getCurrentTheme()` - Returns current theme value from DOM attribute
   - `setTheme(theme)` - Sets theme and persists to localStorage with error handling
   - `getSystemPreference()` - Detects system preference via `matchMedia('(prefers-color-scheme: dark)')`
   - `hasSavedPreference()` - Checks if localStorage has saved theme
   - `onThemeToggle(callback)` - Registers callback for theme toggle events
   - `emitThemeChange(theme)` - Fires custom event for theme changes
   - Static `toggleTheme(newTheme)` - Helper method for toggling

4. **Error Handling:**
   - Try-catch for localStorage quota exceeded errors
   - Try-catch for matchMedia API failures
   - Graceful fallback to light mode if any error occurs

5. **Synchronous Initialization:**
   - All operations are synchronous (no async/await)
   - Ensures theme applied before DOM renders
   - Prevents Flash of Unstyled Content (FOUC)

**Files Modified:**
- `src/frontend/js/app.js` 
  - Added: `import ThemeManager from './modules/themeManager';`
  - Modified: Constructor now calls `ThemeManager.init();` FIRST before other modules (Writing, Page, Extensions, Sidebar)
  - Reason: Ensures theme applied before page renders

**CSS Variables & Styling - COMPLETED ✓**

1. **`src/frontend/styles/vars.pcss` - Updated:**
   - Added missing light mode variable: `--color-bg-main: #ffffff;`
   - All other existing color variables preserved

2. **`src/frontend/styles/dark-mode.pcss` - Created (100+ lines):**
   - Defines `[data-theme="dark"]` selector with complete dark mode color palette
   - Dark theme colors:
     - Backgrounds: `#1E1E1E` (main), `#2A2A2A` (secondary)
     - Text: `#E0E0E0` (main), `#B0B0B0` (secondary)
     - Links: `#569CD6` (active), `#F0F0F0` (hover)
     - Inputs: `#3A3A3A` (background), `#477CFF` (border)
     - Accents: `#00E08F` (success), `#FF6B6B` (error)
   - Fallback: `@media (prefers-color-scheme: dark)` for system preference
   - All colors styled for VS Code aesthetic

3. **`src/frontend/styles/main.pcss` - Updated:**
   - Added: `@import './dark-mode.pcss';` immediately after `@import './vars.pcss';`
   - Import order maintained: normalize → vars → dark-mode → layout → carbon → components

**Build Verification - COMPLETED ✓**

```
Frontend Build:
✓ npm run build-frontend executed successfully
  - 8 assets generated
  - 229 modules processed
  - 1 warning (editor.bundle.js 626 KiB exceeds 244 KiB limit - acceptable, pre-existing)
  - Exit Code: 0

Backend Build:
✓ npm run build-backend executed successfully
  - TypeScript compilation: ✓
  - Template files copied: ✓
  - SVG files copied: ✓
  - Exit Code: 0

Total Build Time: ~25 seconds
```

**Code Style Compliance - VERIFIED ✓**

All code follows project standards per `.editorconfig`:
- ✓ Tabs for indentation (4-space tab size)
- ✓ LF line endings
- ✓ ES6 module syntax
- ✓ JSDoc comments for public methods
- ✓ Error handling with try-catch blocks

**Test Status:**

- No existing unit tests for theme manager found in `src/test/`
- Module designed to be testable (pure functions, dependency-free)
- Integration tests can be created by consuming modules

**Commits Made:**

```
[dark-mode] Phase 1.1: Create ThemeManager module

- Create src/frontend/js/modules/themeManager.js with singleton pattern
- Implement all core methods: init, getCurrentTheme, setTheme, getSystemPreference, etc.
- Add localStorage persistence with error handling
- Add system preference detection via matchMedia
- Update src/frontend/js/app.js to initialize ThemeManager first
- Create src/frontend/styles/dark-mode.pcss with complete dark theme variables
- Update src/frontend/styles/vars.pcss to add --color-bg-main
- Update src/frontend/styles/main.pcss to import dark-mode stylesheet
- Verify project builds without errors (frontend + backend)
```

**Next Phase (Task 1.2 & 1.3):**

Ready to proceed with:
- Task 1.2: Create header theme toggle button UI
- Task 1.3: Implement toggle click handler

---



### Decision 1: CSS Custom Properties vs Other Approaches

**Options Considered:**
- ✗ CSS-in-JS: Too heavy, breaks existing architecture
- ✗ Class-based switching: Requires additional CSS file size
- ✗ Sass mixins: Not supported in current PostCSS setup
- ✓ CSS custom properties: Native, instant, minimal overhead

**Rationale:**
- Native browser support (100% of modern browsers)
- Instant application without JavaScript re-render
- Minimal performance impact (no calculations)
- Maintains existing PostCSS/PCSS architecture
- Easy to extend with new colors

**Decision:** Use CSS custom properties with `[data-theme]` attribute.

---

### Decision 2: Persistence Strategy

**Options Considered:**
- ✗ IndexedDB: Overkill, browser storage might be disabled
- ✗ SessionStorage: Lost on browser close
- ✓ localStorage: Simple, persistent across sessions, sufficient quota
- ✓ + System preference fallback: User-friendly

**Rationale:**
- Simple implementation
- Standard web API (all modern browsers)
- Sufficient quota for theme string (< 100 bytes)
- System preference as fallback for new users
- User can override system preference

**Decision:** localStorage with system preference fallback.

---

### Decision 3: Theme Detection Timing

**Options Considered:**
- ✗ Apply theme after DOM renders: Causes FOUC (flash of unstyled content)
- ✓ Apply theme synchronously before render
- ✗ Use CSS media query only: Can't override with UI

**Rationale:**
- Synchronous application prevents visual flicker
- ThemeManager runs before other modules
- DOM attribute set before CSS is applied

**Decision:** Apply theme synchronously in init(), before render.

---

### Decision 4: Color Palette Approach

**Options Considered:**
- ✗ Hard-code color values: Difficult to maintain
- ✓ Define all colors as variables
- ✗ Compute colors on runtime: Performance impact

**Rationale:**
- Single source of truth for colors
- Easy to audit and adjust
- Supports multiple themes in future
- Follows design system best practices

**Decision:** All colors defined as CSS variables, no hardcoded values.

---

### Decision 5: Event System

**Options Considered:**
- ✗ Direct module communication: Tight coupling
- ✓ Emit custom events: Decoupled, extensible
- ✗ Global state manager: Overkill, not in existing architecture

**Rationale:**
- Fits existing module-dispatcher pattern
- Allows other modules to listen for theme changes
- Future-proof for extensions

**Decision:** Use custom DOM events for theme changes.

---

## Component Breakdown

### 1. ThemeManager Module

**File:** `src/frontend/js/modules/themeManager.js`

**Responsibilities:**
- System preference detection
- localStorage persistence
- DOM attribute management
- Event emission

**API:**
```javascript
init()                       // Initialize theme on startup
setTheme(theme)             // Set and persist theme
getCurrentTheme()           // Get current theme
getSystemPreference()       // Detect prefers-color-scheme
hasSavedPreference()        // Check if preference saved
onThemeToggle(callback)     // Listen for toggle
emitThemeChange(theme)      // Fire change event
```

**Integration Points:**
- Called from `app.js` during initialization
- Listens for `themeToggle` event from header
- Emits `themeChange` event for observers

**Key Implementation Details:**
- Must be synchronous (no async/await)
- Must run before other modules initialize
- Must handle localStorage quota exceeded
- Must prevent multiple rapid toggles

---

### 2. Header Toggle Button

**File:** `src/frontend/views/components/header.twig`

**Responsibilities:**
- Display theme toggle button
- Show correct icon (sun/moon)
- Emit toggle event

**HTML Structure:**
```html
<button class="theme-toggle" 
        aria-label="Toggle dark mode" 
        title="Toggle theme"
        data-module="theme-toggle">
  <svg class="theme-toggle__icon theme-toggle__icon--light"><!-- Sun --></svg>
  <svg class="theme-toggle__icon theme-toggle__icon--dark"><!-- Moon --></svg>
</button>
```

**Integration Points:**
- Renders in header component
- Emit `themeToggle` event on click
- Update button state based on current theme

---

### 3. CSS Variables

**Files:**
- `src/frontend/styles/vars.pcss` (light mode variables)
- `src/frontend/styles/dark-mode.pcss` (dark mode variables)

**Light Mode Variables (`:root`):**
```css
--color-text-main: #060C26;        /* Primary text */
--color-text-second: #717682;      /* Secondary text */
--color-bg-main: #ffffff;          /* Main background */
--color-bg-light: #f8f7fa;         /* Light background */
--color-line-gray: #E8E8EB;        /* Borders */
--color-link-active: #2071cc;      /* Active links */
--color-link-hover: #F3F6F8;       /* Hover state */
--color-input-primary: #F3F6F8;    /* Input background */
--color-input-border: #477CFF;     /* Input border */
--color-page-active: #ff1767;      /* Active page indicator */
--color-success: #00e08f;          /* Success color */
```

**Dark Mode Variables (`[data-theme="dark"]`):**
```css
--color-text-main: #E0E0E0;        /* Light gray text */
--color-text-second: #A0A0A0;      /* Medium gray text */
--color-bg-main: #1E1E1E;          /* Dark background */
--color-bg-light: #2D2D30;         /* Slightly lighter dark */
--color-line-gray: #3E3E42;        /* Dark borders */
--color-link-active: #569CD6;      /* VS Code blue */
--color-link-hover: #252526;       /* Very dark hover */
--color-input-primary: #3C3C3C;    /* Dark input */
--color-input-border: #007ACC;     /* VS Code blue border */
--color-page-active: #FF1777;      /* Brighter pink */
--color-success: #4EC9B0;          /* Teal success */
```

**Usage in Components:**
```css
.header {
  background: var(--color-bg-main);
  color: var(--color-text-main);
  border-bottom: 1px solid var(--color-line-gray);
}
```

---

## Implementation Checklist

### Phase 1: Foundation (2 days)

- [ ] **Task 1.1: Create ThemeManager Module**
  - [ ] Create `src/frontend/js/modules/themeManager.js`
  - [ ] Implement all required methods
  - [ ] Add localStorage support
  - [ ] Add system preference detection
  - [ ] Add error handling
  - [ ] Test in browser console

- [ ] **Task 1.2: Define CSS Variables**
  - [ ] Update `src/frontend/styles/vars.pcss` with light mode variables
  - [ ] Create `src/frontend/styles/dark-mode.pcss` with dark mode variables
  - [ ] Add import to `main.pcss`
  - [ ] Validate WCAG AA contrast

- [ ] **Task 1.3: Initialize ThemeManager**
  - [ ] Import ThemeManager in `app.js`
  - [ ] Call `init()` early in constructor
  - [ ] Test theme loads correctly
  - [ ] Test no FOUC (flash of unstyled content)
  - [ ] Test localStorage persistence

### Phase 2: UI Components (5-6 days)

- [ ] **Task 2.1: Create Toggle Button**
  - [ ] Update `header.twig` with button HTML
  - [ ] Add sun/moon SVG icons
  - [ ] Make keyboard accessible
  - [ ] Add ARIA labels

- [ ] **Task 2.2: Implement Toggle Handler**
  - [ ] Listen for button clicks
  - [ ] Emit `themeToggle` event
  - [ ] Update ThemeManager on event
  - [ ] Update button icon
  - [ ] Test clicking works

- [ ] **Task 2.3-2.8: Update Component Styles**
  - [ ] Header (2.3)
  - [ ] Page content (2.4)
  - [ ] Sidebar (2.5)
  - [ ] Buttons (2.6)
  - [ ] Forms (2.7)
  - [ ] Other components (2.8)

### Phase 3: Testing (3-4 days)

- [ ] **Task 3.1: Visual Testing**
  - [ ] Test all components in both themes
  - [ ] Test across browsers
  - [ ] Verify no flickering

- [ ] **Task 3.2: Accessibility**
  - [ ] Check color contrast
  - [ ] Test keyboard navigation
  - [ ] Test with screen reader

- [ ] **Task 3.3: Performance**
  - [ ] Measure theme switch time (< 100ms)
  - [ ] Check for layout shifts

- [ ] **Task 3.4: Persistence**
  - [ ] Test preference persists across reloads

- [ ] **Task 3.5: Browser Compatibility**
  - [ ] Test major browsers

### Phase 4: Quality (2 days)

- [ ] **Task 4.1: Code Review**
  - [ ] Follow .editorconfig

- [ ] **Task 4.2: Unit Tests**
  - [ ] Write tests for ThemeManager

- [ ] **Task 4.3: Developer Docs**
  - [ ] Create documentation

- [ ] **Task 4.4: Project Docs**
  - [ ] Update README

### Phase 5: Release (1 day)

- [ ] **Task 5.1: Prepare for Merge**
- [ ] **Task 5.2: Deploy**

---

## Testing Scenarios

### Scenario 1: Initial Load (First Time User)

**Expected:** Light mode loads (respects system preference), no flash of wrong theme

### Scenario 2: Theme Toggle

**Expected:** Button click switches theme immediately, persists after reload

### Scenario 3: System Preference Override

**Expected:** Saved preference overrides system preference

### Scenario 4: Private/Incognito Mode

**Expected:** Theme toggle works in session, preference lost when session ends

### Scenario 5: Multiple Browser Tabs

**Expected:** Each tab has independent theme state

### Scenario 6: Keyboard Navigation

**Expected:** Button accessible via Tab, activatable with Enter/Space, focus visible

### Scenario 7: Screen Reader

**Expected:** Button announced with label, theme state clear

---

## Troubleshooting

### Issue: Theme Flashes on Page Load (FOUC)

**Causes:** ThemeManager.init() called too late, async operations

**Solutions:**
1. Verify ThemeManager.init() called in app.js constructor
2. Verify init() is synchronous (no async/await)
3. Check that localStorage read is synchronous

---

### Issue: Colors Don't Change When Theme Toggles

**Causes:** CSS variables not defined, `data-theme` attribute not set, hardcoded colors

**Solutions:**
1. Verify CSS variables defined in both `:root` and `[data-theme="dark"]`
2. Check DevTools that DOM attribute updated
3. Search for hardcoded color values and replace with variables

---

### Issue: localStorage Not Persisting

**Causes:** localStorage disabled, quota exceeded, private mode, wrong key

**Solutions:**
1. Check browser privacy settings
2. Verify localStorage enabled: `typeof(Storage) !== 'undefined'`
3. Verify correct key: `codex-docs-theme`

---

### Issue: System Preference Not Detected

**Causes:** Browser doesn't support `prefers-color-scheme`, ThemeManager not checking

**Solutions:**
1. Verify browser supports `prefers-color-scheme`
2. Check ThemeManager.getSystemPreference() implementation

---

### Issue: Contrast Issues (WCAG Failure)

**Solutions:**
1. Use WebAIM Contrast Checker
2. Increase contrast ratio (light text should be ≥ #C0C0C0 on #1E1E1E)
3. Adjust colors in `dark-mode.pcss`

---

### Issue: Performance Degradation

**Causes:** Async operations, layout-triggering operations, unnecessary re-renders

**Solutions:**
1. Verify theme switch is synchronous
2. Avoid reading offsetWidth during theme switch
3. Use CSS transitions sparingly

---

### Issue: Mobile Display Issues

**Causes:** Button too small, invisible, overlapping, not responsive

**Solutions:**
1. Verify 44x44px minimum tap target
2. Add mobile-specific CSS
3. Test on real mobile devices

---

## Related Files

### Documentation Files
- `Requirements.md` - Detailed requirements
- `Design.md` - Architecture and design
- `Tasks.md` - Task breakdown
- `Agents.md` - This file

### Source Files to Create
- `src/frontend/js/modules/themeManager.js`
- `src/frontend/styles/dark-mode.pcss`

### Source Files to Update
- `src/frontend/js/app.js`
- `src/frontend/views/components/header.twig`
- `src/frontend/styles/vars.pcss`
- `src/frontend/styles/components/*.pcss` (18 files)
- `src/frontend/styles/main.pcss`

### Test Files
- `src/test/themeManager.ts` or `.js`

---

## Resumption Guidelines

### When Picking Up This Feature

1. **Read this document first** (5 minutes)
2. **Check current status in Tasks.md** (5 minutes)
3. **Review relevant docs** (10-15 minutes)
4. **Set up environment** (5 minutes)
5. **Run existing tests** (5 minutes)
6. **Start next task** (varies)

### Communication Points

- **Status Updates:** Mark tasks as "In Progress" or "Completed" in Tasks.md
- **Blockers:** Note any blockers in this document
- **Decisions:** Document any new decisions

### If You Get Stuck

1. Check **Troubleshooting** section
2. Review relevant **Testing Scenarios**
3. Reference **Key Design Decisions**
4. Check component documentation
5. Look at existing similar code for patterns
6. Add notes to this document

---

## Document Maintenance

**Document Version:** 1.1  
**Last Updated:** November 6, 2025  
**Status:** Phase 1.1 Implementation Complete - Ready for Phase 1.2  
**Next Review:** When Phase 1.2 begins  

### Implementation Progress Tracker

- [x] Phase 1.1 - Create ThemeManager Module (COMPLETE)
  - [x] Module created with all methods
  - [x] CSS variables defined
  - [x] App.js initialized
  - [x] Project builds without errors
  - [x] Git commit created
- [ ] Phase 1.2 - Create Header Toggle Button (PENDING)
- [ ] Phase 1.3 - Initialize ThemeManager in App (PENDING)
- [ ] Phase 2 - UI Component Updates (PENDING)
- [ ] Phase 3 - Testing & Validation (PENDING)  

### For Future Agents:
- If this document is unclear, clarify it
- If you find workarounds, document them in Troubleshooting
- If you learn something new, share it in this document
- Keep this as the single source of truth

---

**End of Agents Reference Guide**
