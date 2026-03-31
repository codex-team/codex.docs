# Phase 3: Testing — Quick Reference

**Status:** ✅ Complete  
**Test Suite:** 139 Playwright + 30 Mocha unit tests  
**Build:** ✅ Passing

---

## Quick Navigation

| Section | Purpose |
|---------|---------|
| [Running Tests](#running-tests) | Commands to run all test types |
| [Test File Map](#test-file-map) | Where each test file lives and what it covers |
| [Fixture Helpers](#fixture-helpers) | Shared utilities in setup.ts |
| [Color Reference](#color-reference) | Current dark mode color values (post-WCAG fixes) |
| [WCAG Requirements](#wcag-requirements) | Contrast ratio thresholds |
| [Troubleshooting](#troubleshooting) | Common issues and fixes |

---

## Running Tests

### E2E Tests (Playwright)

```bash
# All tests (Chromium + Firefox + WebKit)
npx playwright test

# With line reporter (CI-friendly)
npx playwright test --reporter=line

# Single spec file
npx playwright test src/test/e2e/dark-mode/accessibility.spec.ts

# Single test by name
npx playwright test -g "primary text on main background"

# Chromium-only (skip cross-browser compat tests)
npx playwright test --project=chromium

# Interactive UI mode
npx playwright test --ui
```

### Unit Tests (Mocha)

```bash
# ThemeManager unit tests
npx ts-mocha src/test/modules/themeManager.ts --timeout 5000
```

### All Tests Together

```bash
# Unit + E2E
npx ts-mocha src/test/modules/themeManager.ts --timeout 5000 && npx playwright test --reporter=line
```

---

## Test File Map

```
src/test/
├── e2e/
│   ├── fixtures/
│   │   └── setup.ts              # Shared selectors, helpers, color maps
│   └── dark-mode/
│       ├── theme-toggle.spec.ts       #  6 tests — button, click, keyboard
│       ├── theme-persistence.spec.ts  # 14 tests — save/restore, edge cases
│       ├── system-preference.spec.ts  #  4 tests — prefers-color-scheme
│       ├── components.spec.ts         # 16 tests — CSS vars, rendered colors
│       ├── no-fouc.spec.ts            #  4 tests — flash prevention
│       ├── accessibility.spec.ts      # 26 tests — WCAG AA, keyboard, ARIA
│       ├── performance.spec.ts        # 12 tests — timing, CLS, architecture
│       └── browser-compat.spec.ts     # 19 tests × 3 browsers
└── modules/
    └── themeManager.ts            # 30 tests — JSDOM unit tests
```

### Playwright Config Projects

| Project | Browser | Tests Run |
|---------|---------|-----------|
| `chromium` | Desktop Chrome | All specs **except** browser-compat |
| `chromium-compat` | Desktop Chrome | browser-compat.spec.ts only |
| `firefox-compat` | Desktop Firefox | browser-compat.spec.ts only |
| `webkit-compat` | Desktop Safari | browser-compat.spec.ts only |

---

## Fixture Helpers

### setup.ts Exports

```typescript
// CSS selectors for dark mode elements
export const selectors = {
  themeToggleButton: 'button.theme-toggle',
  sunIcon: 'svg.theme-toggle__icon--light',
  moonIcon: 'svg.theme-toggle__icon--dark',
  header: 'header.docs-header',
  sidebar: 'div.docs-sidebar',
  sidebarContent: 'aside.docs-sidebar__content',
  pageArticle: 'article.page',
  pageContent: 'section.page__content',
  authForm: 'form.auth-form',
};

// localStorage key
export const STORAGE_KEY = 'codex-docs-theme';

// Expected CSS variable values per theme
export const themeColors = {
  light: {
    '--color-bg-main': '#fff',
    '--color-text-main': '#060c26',
    '--color-bg-light': '#f8f7fa',
    '--color-line-gray': '#e8e8eb',
  },
  dark: {
    '--color-bg-main': '#18181b',
    '--color-text-main': '#e4e4e7',
    '--color-bg-light': '#27272a',
    '--color-line-gray': '#71717a',
  },
};

// Helper functions
getCSSVariable(page, variable)   // Get computed CSS var from :root
getThemeAttribute(page)          // Get data-theme attribute value
goToThemedPage(page)             // Navigate to /auth (has JS bundle)
```

---

## Color Reference

### Dark Mode Palette (Tailwind Zinc — current values)

| Variable | Value | Usage |
|----------|-------|-------|
| `--color-bg-main` | `#18181B` | Page background |
| `--color-bg-light` | `#27272A` | Surface/card backgrounds |
| `--color-text-main` | `#E4E4E7` | Primary text |
| `--color-text-second` | `#A1A1AA` | Secondary text |
| `--color-line-gray` | `#71717A` | Borders, dividers |
| `--color-button-primary` | `#2563EB` | Primary button bg |
| `--color-button-warning` | `#C2410C` | Warning/delete button bg |
| `--color-code-bg` | `#131316` | Code block background |
| `--color-code-comment` | `#909099` | Code comments |
| `--color-checkbox-border` | `#71717A` | Checkbox border |

---

## WCAG Requirements

### Contrast Ratios (WCAG 2.1 AA)

| Type | Minimum Ratio | Examples |
|------|---------------|----------|
| Normal text (< 18pt) | **4.5:1** | Body text, labels, code comments |
| Large text (≥ 18pt / 14pt bold) | **3:1** | Headings |
| UI component boundaries | **3:1** | Borders, checkboxes, dividers |
| Text on colored buttons | **4.5:1** | White text on button backgrounds |

### How Contrast Tests Work

Tests in `accessibility.spec.ts` extract CSS variable values live from the page, compute luminance using the WCAG formula, and calculate contrast ratios:

```typescript
function hexToLuminance(hex: string): number {
  // sRGB → linear RGB → relative luminance
}

function contrastRatio(hex1: string, hex2: string): number {
  return (lighter + 0.05) / (darker + 0.05);
}
```

---

## Troubleshooting

### Tests fail with "Target page, context or browser has been closed"

WebKit occasionally drops connections. This is a transient Playwright/WebKit issue. Re-run the tests — it typically passes on retry.

### Tests fail with "Theme toggle button not found"

The greeting page (`/`) with an empty database does NOT include `main.bundle.js`, so ThemeManager won't initialize. Tests use `/auth` which always includes the JS bundle.

### Unit tests fail with "document is not defined"

The JSDOM environment must be set up before importing ThemeManager. The unit test file handles this in `before()` hooks. Run with:
```bash
npx ts-mocha src/test/modules/themeManager.ts --timeout 5000
```

### Cross-browser tests are slow

Firefox and WebKit tests run sequentially (1 worker). This is expected — 57 cross-browser tests add ~60s to the total run. Use `--project=chromium` to skip them during development.

### "Port 7777 already in use"

Kill any existing Node processes:
```bash
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
```

### Webpack rebuild required after CSS changes

After modifying any `.pcss` file, rebuild before running tests:
```bash
npx webpack --mode=production
```
