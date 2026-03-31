# Phase 3: Testing — Implementation Summary

**Status:** ✅ COMPLETE  
**Completion Date:** March 31, 2026  
**Build Status:** ✅ Frontend & Backend Passing  
**Test Suite:** 139 Playwright e2e tests + 30 Mocha unit tests — all passing

---

## Overview

Phase 3 implemented comprehensive testing for the dark mode feature across five sub-phases: visual/structural testing (3.1), WCAG accessibility (3.2), performance (3.3), localStorage persistence (3.4), and cross-browser compatibility (3.5). Testing uncovered and fixed multiple bugs, drove a color palette redesign, and prompted a database migration.

## What Was Built

### Test Infrastructure

- **E2E Framework:** Playwright with Chromium, Firefox, and WebKit
- **Unit Framework:** Mocha + Chai with JSDOM for browser simulation
- **Test Location:** `src/test/e2e/` (e2e) and `src/test/modules/` (unit)
- **Config:** `playwright.config.ts` — auto-starts dev server on port 7777
- **Shared Fixtures:** `src/test/e2e/fixtures/setup.ts` — selectors, helpers, color maps

### Test Suite Summary

| Spec File | Tests | Phase | Coverage |
|-----------|-------|-------|----------|
| `theme-toggle.spec.ts` | 6 | 3.1 | Button visibility, ARIA labels, click toggle, keyboard (Enter/Space) |
| `theme-persistence.spec.ts` | 14 | 3.1+3.4 | Save/restore, reload, edge cases (clear, invalid values, rapid toggles) |
| `system-preference.spec.ts` | 4 | 3.1 | `prefers-color-scheme` emulation, saved preference overrides system |
| `components.spec.ts` | 16 | 3.1 | CSS variable values per theme, body/header/text rendered colors |
| `no-fouc.spec.ts` | 4 | 3.1 | data-theme attribute on load, DOM consistent with localStorage |
| `accessibility.spec.ts` | 26 | 3.2 | WCAG AA contrast ratios, keyboard nav, focus visibility, ARIA/semantics |
| `performance.spec.ts` | 12 | 3.3 | Toggle timing <100ms, CLS, FOUC prevention, CSS architecture |
| `browser-compat.spec.ts` | 19×3 | 3.5 | CSS variables, toggle, localStorage, system pref, colors, events (3 browsers) |

**Chromium-only tests:** 82  
**Cross-browser tests:** 19 × 3 = 57  
**Total Playwright runs:** 139  
**Unit tests:** 30 (ThemeManager with JSDOM)

### Bugs Discovered & Fixed

| Bug | Symptom | Root Cause | Fix |
|-----|---------|------------|-----|
| **themeToggle event** | Icons never updated after click | Event listener used wrong event name | Listen to `themeChange` directly |
| **Missing body bg** | Page still white in dark mode | `body`, `header`, `copy-button` had hardcoded `white` | Replaced with `var(--color-bg-main)` |
| **Greeting page** | Dark mode lost after login | `index.twig` missing `main.bundle.js` | Added script tag |
| **Alias race condition** | Page redirect → 500 error | `alias.save()` missing `await` in pages.ts | Added `await` to insert/update |
| **NeDB Node 24 crash** | `util.isDate is not a function` | Node 24 removed `util.is*` functions | Migrated to `@seald-io/nedb` |
| **Invalid localStorage** | `applyTheme(null)` called | `hasSavedPreference()` true but `getSavedPreference()` null | Fixed init() fallback logic |
| **CSS specificity** | System dark overrides explicit light choice | `@media` `:root` applied over `[data-theme="light"]` | Added `:not([data-theme="light"])` guard |

### WCAG AA Contrast Fixes

| Variable | Before | Ratio | After | Ratio | Standard |
|----------|--------|-------|-------|-------|----------|
| `--color-line-gray` | `#3F3F46` | 1.70:1 ✗ | `#71717A` | 3.67:1 ✓ | 3:1 (UI boundary) |
| `--color-code-comment` | `#71717A` | 3.84:1 ✗ | `#909099` | 5.86:1 ✓ | 4.5:1 (text) |
| `--color-checkbox-border` | `#52525B` | 2.29:1 ✗ | `#71717A` | 3.67:1 ✓ | 3:1 (UI boundary) |
| `--color-button-primary` | `#3B82F6` | 3.68:1 ✗ | `#2563EB` | 5.17:1 ✓ | 4.5:1 (text on bg) |
| `--color-button-warning` | `#FB923C` | 2.26:1 ✗ | `#C2410C` | 5.18:1 ✓ | 4.5:1 (text on bg) |

### Color Palette Redesign (3 iterations)

1. **Original (Phase 2):** VS Code flat grays `#1E1E1E` — feedback: "too boring"
2. **Slate attempt:** Tailwind slate `#0F172A` — feedback: "dark blue mode, not dark mode"
3. **Final (zinc):** Tailwind zinc neutrals `#18181B` bg, `#27272A` surface, `#71717A` borders, `#E4E4E7` text

### Database Migration

Replaced unmaintained `nedb` 1.8.0 with `@seald-io/nedb` (maintained fork) to resolve Node 24 compatibility. Uses `createRequire()` pattern for CJS/ESM interop in `src/backend/database/local.ts`.

## Files Created

| File | Purpose |
|------|---------|
| `playwright.config.ts` | Multi-browser config with webServer auto-start |
| `src/test/e2e/fixtures/setup.ts` | Shared selectors, helpers, expected color values |
| `src/test/e2e/dark-mode/theme-toggle.spec.ts` | Toggle button interaction tests |
| `src/test/e2e/dark-mode/theme-persistence.spec.ts` | localStorage persistence + edge cases |
| `src/test/e2e/dark-mode/system-preference.spec.ts` | System preference detection tests |
| `src/test/e2e/dark-mode/components.spec.ts` | Component color verification tests |
| `src/test/e2e/dark-mode/no-fouc.spec.ts` | Flash-of-unstyled-content prevention tests |
| `src/test/e2e/dark-mode/accessibility.spec.ts` | WCAG AA contrast + a11y tests |
| `src/test/e2e/dark-mode/performance.spec.ts` | Toggle timing + layout shift tests |
| `src/test/e2e/dark-mode/browser-compat.spec.ts` | Cross-browser compatibility tests |
| `src/test/modules/themeManager.ts` | 30 Mocha unit tests with JSDOM |

## Files Modified

| File | Changes |
|------|---------|
| `src/frontend/styles/dark-mode.pcss` | WCAG contrast fixes (9 color values), `:not([data-theme="light"])` guard |
| `src/frontend/styles/components/header.pcss` | Replaced hardcoded `background: white` |
| `src/frontend/styles/components/copy-button.pcss` | Replaced hardcoded `background: white` |
| `src/frontend/styles/diff.pcss` | Replaced 4 hardcoded colors with CSS variables |
| `src/frontend/styles/layout.pcss` | Added `background-color: var(--color-bg-main)` to body |
| `src/frontend/js/modules/themeManager.js` | Fixed init() invalid value fallback, removed dead code |
| `src/frontend/js/modules/themeToggle.js` | Fixed event name (`themeChange`) |
| `src/backend/controllers/pages.ts` | Added `await` to alias operations |
| `src/backend/database/local.ts` | Migrated to `@seald-io/nedb` |
| `src/backend/views/pages/index.twig` | Added missing `main.bundle.js` script tag |
| `package.json` | Added `@seald-io/nedb`, `jsdom`, Playwright deps and scripts |
