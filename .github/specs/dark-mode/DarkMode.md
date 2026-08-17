# Dark Mode Implementation

**Branch:** `feature/dark-mode`  
**Status:** ✅ Complete  
**Last Updated:** March 31, 2026

## Overview

A complete dark mode implementation with theme persistence, system preference detection, and full accessibility compliance (WCAG 2.1 AA). The feature includes 139 Playwright e2e tests and 30 Mocha unit tests, all passing.

## Architecture

### ThemeManager Module
Singleton pattern with synchronous initialization to prevent flash of unstyled content (FOUC):
- **Storage:** localStorage key `codex-docs-theme` persists user preference
- **System Detection:** `prefers-color-scheme` media query for system preference detection
- **Priority:** Saved preference > System preference > Light mode default
- **Event:** Custom `themeChange` event for reactive module updates

### CSS Variables System
Theme values defined via CSS custom properties with automatic switching:
- **Light theme:** `:root` selector in `vars.pcss` (default)
- **Dark theme:** `[data-theme="dark"]` selector in `dark-mode.pcss`
- **System preference:** `@media (prefers-color-scheme: dark)` fallback

### Theme Toggle UI
- Header button with sun/moon SVG icons (`header.twig`)
- Keyboard support: Enter and Space keys activate toggle
- ARIA labels for screen reader accessibility

## Implementation Details

### Files Created
- `src/frontend/js/modules/themeManager.js` — Theme management
- `src/frontend/styles/dark-mode.pcss` — Dark theme CSS variables
- `playwright.config.ts` — Multi-browser test configuration
- `src/test/e2e/dark-mode/*.spec.ts` — E2E test suite (9 files)
- `src/test/modules/themeManager.ts` — Unit tests

### Files Modified
- `src/frontend/js/app.js` — Import & init ThemeManager first
- `src/frontend/js/modules/themeToggle.js` — Fixed event listener
- `src/frontend/styles/vars.pcss` — Light theme color definitions
- `src/frontend/styles/components/header.pcss`, `copy-button.pcss`, `page.pcss`, `sidebar.pcss`, `writing.pcss`, `diff.pcss` — Replaced hardcoded colors with CSS variables
- `src/backend/database/local.ts` — Migrated to `@seald-io/nedb` for Node 24 compatibility
- `src/backend/routes/pages.ts` — Fixed race condition with `await`

## Bug Fixes

| Issue | Root Cause | Solution |
|-------|-----------|----------|
| Icons not updating | Event listener used wrong name | Changed to listen for `themeChange` event |
| Page white in dark mode | Hardcoded `white` backgrounds | Replaced with `var(--color-bg-main)` |
| Dark mode lost after login | Missing script tag | Added `main.bundle.js` to login template |
| Redirect 500 error | Async `alias.save()` not awaited | Added `await` keyword |
| Node 24 crash | `util.isDate` removed from Node 24 | Migrated to `@seald-io/nedb` fork |

## WCAG AA Compliance

All color contrast ratios updated to meet WCAG AA standards:
- Text on background: 4.5:1 minimum
- UI boundary elements: 3:1 minimum
- Tested with 26 dedicated accessibility tests

## Testing Coverage

- **Visual & Functional:** 35 tests (toggle, persistence, system preference, component colors, FOUC prevention)
- **Accessibility:** 26 tests (contrast ratios, keyboard navigation, focus visibility, ARIA/semantics)
- **Performance:** 12 tests (toggle timing <100ms, layout stability, CSS architecture)
- **Cross-browser:** 57 tests (Chromium, Firefox, WebKit)
- **Unit:** 30 tests (ThemeManager with JSDOM)

## Color Palette

Final zinc-based palette (WCAG AA compliant):
- Background: `#18181B`
- Surface/Cards: `#27272A`
- Borders: `#71717A`
- Text: `#E4E4E7`
- Accent colors adjusted for contrast compliance

## API

### ThemeManager
```javascript
import ThemeManager from './modules/themeManager';

// Initialize (called in app startup)
ThemeManager.init();

// Get current theme
ThemeManager.getCurrentTheme(); // Returns 'light' or 'dark'

// Set theme
ThemeManager.setTheme('dark');

// Listen for changes
document.addEventListener('themeChange', (e) => {
  console.log('Theme changed to:', e.detail.theme);
});
```

## Browser Support

- Chromium (v100+)
- Firefox (v97+)
- WebKit/Safari (v15+)
- Requires CSS custom properties & `prefers-color-scheme` support
