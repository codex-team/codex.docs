# Phase 3: Testing — Technical Deep Dive

**Status:** ✅ Complete  
**Total Tests:** 139 Playwright + 30 Mocha unit tests

---

## Table of Contents

1. [Test Architecture Overview](#test-architecture-overview)
2. [Playwright Multi-Browser Configuration](#playwright-multi-browser-configuration)
3. [Fixture Layer Design](#fixture-layer-design)
4. [WCAG Contrast Calculation Methodology](#wcag-contrast-calculation-methodology)
5. [JSDOM Unit Test Environment](#jsdom-unit-test-environment)
6. [Performance Measurement Approach](#performance-measurement-approach)
7. [CSS Specificity Analysis](#css-specificity-analysis)
8. [Cross-Browser Compatibility Strategy](#cross-browser-compatibility-strategy)
9. [Key Bugs: Root Cause Analysis](#key-bugs-root-cause-analysis)

---

## Test Architecture Overview

The test suite is split into two layers:

```
┌──────────────────────────────────────────────────────┐
│                     E2E Layer                        │
│              Playwright (8 spec files)               │
│    Chromium · Firefox · WebKit  ←  Real browsers     │
│    Tests run against live dev server (port 7777)     │
└──────────────┬───────────────────────────────────────┘
               │  shares selectors/helpers via
               │  src/test/e2e/fixtures/setup.ts
┌──────────────┴───────────────────────────────────────┐
│                    Unit Layer                        │
│              Mocha + Chai + JSDOM                    │
│    ThemeManager logic tested in isolation            │
│    No network, no server, no real browser            │
└──────────────────────────────────────────────────────┘
```

**Why two layers?** The E2E layer validates end-user behavior in real browsers: colors render correctly, toggles work, persistence survives reloads, and no layout shift occurs. The unit layer isolates ThemeManager business logic — initialization priority, invalid input handling, event emission — without the overhead of launching browsers.

---

## Playwright Multi-Browser Configuration

### Project Strategy

The Playwright config defines 4 projects with a targeted split:

```typescript
projects: [
  {
    name: 'chromium',
    use: { ...devices['Desktop Chrome'] },
    testIgnore: /browser-compat/,          // ← skip compat tests
  },
  {
    name: 'chromium-compat',
    use: { ...devices['Desktop Chrome'] },
    testMatch: /browser-compat/,           // ← only compat tests
  },
  {
    name: 'firefox-compat',
    use: { ...devices['Desktop Firefox'] },
    testMatch: /browser-compat/,
  },
  {
    name: 'webkit-compat',
    use: { ...devices['Desktop Safari'] },
    testMatch: /browser-compat/,
  },
]
```

**Why this split?** Running all 82 non-compat tests across 3 browsers (246 runs) would be slow and add little value — the 19 compat tests specifically target browser-divergent behaviors (CSS variable resolution, `matchMedia`, `localStorage` serialization). The remaining tests exercise application logic that is browser-independent.

### Test Count Calculation

| Source | Count |
|--------|-------|
| 7 non-compat specs × 1 browser (Chromium) | 82 |
| 1 compat spec × 3 browsers | 57 |
| **Total Playwright runs** | **139** |

### Web Server Auto-Start

```typescript
webServer: {
  command: 'npx cross-env NODE_ENV=development node --loader ts-node/esm src/backend/app.ts -c docs-config.yaml -c docs-config.local.yaml',
  url: 'http://localhost:7777',
  reuseExistingServer: !process.env.CI,
  timeout: 120000,
}
```

In development, `reuseExistingServer: true` means Playwright won't start a new server if one is already running — useful during iterative test development. In CI, a fresh server is always started to guarantee a clean state.

---

## Fixture Layer Design

### `src/test/e2e/fixtures/setup.ts`

The fixture file centralizes three concerns:

**1. CSS Selectors** — A single `selectors` object maps semantic names to CSS selectors. This ensures that if the HTML structure changes (e.g., class rename), only one file needs updating:

```typescript
export const selectors = {
  themeToggleButton: 'button.theme-toggle',
  sunIcon: 'svg.theme-toggle__icon--light',
  moonIcon: 'svg.theme-toggle__icon--dark',
  header: 'header.docs-header',
  // ...
};
```

**2. Expected Color Maps** — The `themeColors` object encodes the ground truth for CSS variable values in each theme. Tests compare live computed values against these:

```typescript
export const themeColors = {
  light: { '--color-bg-main': '#fff', '--color-text-main': '#060c26', ... },
  dark:  { '--color-bg-main': '#18181b', '--color-text-main': '#e4e4e7', ... },
};
```

**3. Helper Functions** — Three utility functions reduce test boilerplate:

| Function | Purpose |
|----------|---------|
| `getCSSVariable(page, var)` | Reads a computed CSS custom property from `:root` via `page.evaluate()` |
| `getThemeAttribute(page)` | Returns `document.documentElement.getAttribute('data-theme')` |
| `goToThemedPage(page)` | Navigates to `/auth` and waits for the toggle button — the greeting page (`/`) with an empty database does not load `main.bundle.js` |

---

## WCAG Contrast Calculation Methodology

### The Algorithm

Accessibility tests in `accessibility.spec.ts` implement the full WCAG 2.1 relative luminance formula inline:

```typescript
function hexToLuminance(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const sR = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
  const sG = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
  const sB = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);

  return 0.2126 * sR + 0.7152 * sG + 0.0722 * sB;
}

function contrastRatio(hex1: string, hex2: string): number {
  const l1 = hexToLuminance(hex1);
  const l2 = hexToLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}
```

### How Tests Use It

Each contrast test:
1. Navigates to the auth page and clicks the toggle to activate dark mode
2. Reads two CSS variable values live from the page via `getCSSVariable()`
3. Computes the contrast ratio using the functions above
4. Asserts against the appropriate WCAG threshold

Example:

```typescript
test('primary text on main background meets 4.5:1', async ({ page }) => {
  const text = await getCSSVariable(page, '--color-text-main');
  const bg = await getCSSVariable(page, '--color-bg-main');
  const ratio = contrastRatio(text, bg);
  expect(ratio).toBeGreaterThanOrEqual(4.5);
});
```

### Why Inline Rather Than a Library?

The formula is ~15 lines. Pulling in a dependency (e.g., `color2k`, `chroma-js`) for just this one calculation would add an npm dependency to the test suite. The WCAG specification is stable — the algorithm won't change.

### Coverage Matrix

The 26 accessibility tests cover these pairs:

| Foreground Variable | Background Variable | Required Ratio | Type |
|--------------------|--------------------|----------------|------|
| `--color-text-main` | `--color-bg-main` | 4.5:1 | Normal text |
| `--color-text-second` | `--color-bg-main` | 4.5:1 | Normal text |
| `--color-text-main` | `--color-bg-light` | 4.5:1 | Normal text |
| `--color-text-second` | `--color-bg-light` | 4.5:1 | Normal text |
| `--color-line-gray` | `--color-bg-main` | 3:1 | UI boundary |
| `--color-line-gray` | `--color-bg-light` | 3:1 | UI boundary |
| `--color-code-comment` | `--color-code-bg` | 4.5:1 | Normal text |
| `--color-checkbox-border` | `--color-bg-main` | 3:1 | UI boundary |
| White (`#ffffff`) | `--color-button-primary` | 4.5:1 | Text on button |
| White (`#ffffff`) | `--color-button-warning` | 4.5:1 | Text on button |

Plus keyboard navigation, focus visibility, ARIA label (`aria-label` toggles between "Switch to dark mode"/"Switch to light mode"), and semantic correctness tests.

---

## JSDOM Unit Test Environment

### The Problem

ThemeManager is a vanilla JS module that relies on browser globals: `document`, `localStorage`, `matchMedia`, `CustomEvent`. Importing it directly in Node.js fails.

### The Solution

Each test creates a fresh JSDOM environment with mocked browser APIs, then constructs a ThemeManager class inline that mirrors the production logic:

```typescript
function createTestEnv(options: { darkSystemPreference?: boolean } = {}) {
  const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
    url: 'http://localhost',
    pretendToBeVisual: true,
  });

  const { window } = dom;
  const { document, CustomEvent, localStorage } = window;

  // Mock matchMedia with sinon
  const matchMediaStub = sinon.stub().returns({
    matches: options.darkSystemPreference ?? false,
    media: '(prefers-color-scheme: dark)',
    addEventListener: sinon.stub(),
    removeEventListener: sinon.stub(),
  });
  (window as any).matchMedia = matchMediaStub;

  // ThemeManager class defined here with access to the JSDOM globals
  class ThemeManager { /* ... mirrors production logic ... */ }

  return { dom, window, document, localStorage, matchMediaStub, ThemeManager };
}
```

### Why Not Import the Real Module?

The production ThemeManager is a singleton ES module that captures globals at import time. In Node.js without a browser, this immediately fails. The JSDOM approach lets us:
- Test each method in isolation with controlled globals
- Verify edge cases (invalid localStorage, missing matchMedia, exception paths)
- Run instantly (~50ms for all 30 tests) without browser overhead

### Test Categories (30 tests)

| Category | Tests | What's Verified |
|----------|-------|----------------|
| `init()` | 5 | Default to light, system pref dark, saved overrides system, invalid saved value, idempotent init |
| `setTheme()` | 5 | Sets dark, sets light, ignores invalid, saves to localStorage, emits event |
| `getCurrentTheme()` | 3 | Returns current, reads from DOM if null, defaults to light |
| `getSystemPreference()` | 3 | Returns false/true, handles matchMedia error |
| `hasSavedPreference()` | 3 | Returns false/true, handles localStorage error |
| `getSavedPreference()` | 4 | Returns null/saved value, ignores invalid, handles error |
| `applyTheme()` | 3 | Sets data-theme attribute, updates currentTheme, handles both themes |
| `emitThemeChange()` | 4 | Dispatches CustomEvent, includes theme in detail, listeners receive event |

---

## Performance Measurement Approach

### Toggle Timing (NFR-3.1.1: < 100ms)

Tests measure the synchronous cost of clicking the toggle button by wrapping the click in `performance.now()` calls inside `page.evaluate()`:

```typescript
const elapsed = await page.evaluate((sel) => {
  const start = performance.now();
  document.querySelector(sel).click();
  const end = performance.now();
  return end - start;
}, selectors.themeToggleButton);

expect(elapsed).toBeLessThan(100);
```

This captures the JS execution time including DOM attribute mutation and CSS variable recalculation. It does **not** capture paint time (which requires `requestAnimationFrame` — not needed here since CSS variable changes trigger synchronous style recalc).

### Cumulative Layout Shift (CLS)

Tests use the `PerformanceObserver` API to capture `layout-shift` entries during theme toggles:

```typescript
const cls = await page.evaluate(async (sel) => {
  let totalShift = 0;
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      totalShift += (entry as any).value;
    }
  });
  observer.observe({ type: 'layout-shift', buffered: true });

  document.querySelector(sel).click();
  await new Promise(r => requestAnimationFrame(r));

  observer.disconnect();
  return totalShift;
}, selectors.themeToggleButton);

expect(cls).toBeLessThanOrEqual(0.01);
```

### FOUC Prevention

Tests verify that the `data-theme` attribute is present on `<html>` **before** the page fully loads, using `page.evaluate()` immediately after navigation. This confirms the inline `<script>` in `layout.twig` runs before first paint.

### CSS Architecture Validation

Structural tests verify the CSS uses custom properties rather than hardcoded values:

```typescript
test('dark-mode.pcss uses CSS custom properties', async () => {
  const content = fs.readFileSync('src/frontend/styles/dark-mode.pcss', 'utf-8');
  const propertyDeclarations = content.match(/--color-[\w-]+\s*:/g) || [];
  expect(propertyDeclarations.length).toBeGreaterThan(10);
});
```

---

## CSS Specificity Analysis

### The Bug

The `@media (prefers-color-scheme: dark)` block in `dark-mode.pcss` originally used a bare `:root` selector:

```css
/* BEFORE (buggy) */
@media (prefers-color-scheme: dark) {
  :root {
    --color-bg-main: #18181b;
    /* ... */
  }
}
```

When a user explicitly chose light mode (`data-theme="light"`), the `@media` block still applied because `:root` matches `<html>` regardless of the `data-theme` attribute. The `[data-theme="light"]` selector had the **same specificity** as `:root` (both 0-1-0), so the `@media` block won based on source order.

### The Fix

Adding a `:not()` guard ensures the media query block only applies when the user hasn't explicitly chosen light mode:

```css
/* AFTER (fixed) */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --color-bg-main: #18181b;
    /* ... */
  }
}
```

Specificity comparison:
- `:root` → `(0, 1, 0)`
- `[data-theme="light"]` → `(0, 1, 0)` — tie, last one wins
- `:root:not([data-theme="light"])` → `(0, 2, 0)` — higher, but the `:not()` condition prevents it from matching when `data-theme="light"` is set

### Testing the Fix

The `browser-compat.spec.ts` and `system-preference.spec.ts` tests both verify this scenario:

```typescript
test('saved preference overrides system dark', async ({ page, context }) => {
  await context.addInitScript(() => {
    localStorage.setItem('codex-docs-theme', 'light');
  });
  // emulate system dark preference
  await page.emulateMedia({ colorScheme: 'dark' });
  await goToThemedPage(page);

  expect(await getThemeAttribute(page)).toBe('light');
  // Verify light colors are actually applied
  const bg = await getCSSVariable(page, '--color-bg-main');
  expect(bg).toBe('#fff');
});
```

---

## Cross-Browser Compatibility Strategy

### What's Browser-Specific

| Feature | Browser Variance |
|---------|-----------------|
| CSS Custom Properties | Fully supported in all 3, but computed value serialization differs (e.g., `rgb()` vs `#hex`) |
| `localStorage` | All support it, but quota and error behavior vary |
| `matchMedia` | All support it, but event listener API differs between older/newer specs |
| `data-theme` attribute selector | No variance — standard CSS |
| `CustomEvent` | No variance — standard DOM API |

### Test Design

The 19 cross-browser tests in `browser-compat.spec.ts` are grouped by concern:

| Group | Tests | What's Verified |
|-------|-------|----------------|
| CSS Custom Properties | 3 | Variables resolve correctly in both themes, `[data-theme]` overrides `:root` |
| Theme Toggle | 3 | Click toggles, attribute updates, icon swap |
| LocalStorage | 4 | Persist/restore, survives reload, clear resets, default |
| System Preference | 3 | Dark system → dark theme, saved pref overrides, light system → light theme |
| Rendered Colors | 3 | Background/text/surface colors match expectations |
| Event System | 3 | `themeChange` event fires, contains correct theme, listeners notified |

### Why Not Run All Tests Cross-Browser?

Diminishing returns. The core 82 tests verify application logic that doesn't depend on browser rendering engines. The 19 compat tests specifically target areas where browsers are known to diverge: CSS variable serialization, localStorage edge cases, and media query evaluation. If a browser difference existed elsewhere, it would almost certainly manifest in one of these 19 tests.

---

## Key Bugs: Root Cause Analysis

### 1. Invalid localStorage Fallback (Phase 3.5)

**Trigger:** `localStorage.setItem('codex-docs-theme', 'garbage')` → reload

**Call chain:**
```
init()
  → hasSavedPreference()  // true — key exists
  → getSavedPreference()  // null — "garbage" is not a valid theme
  → applyTheme(null)      // ❌ sets data-theme="null"
```

**Fix:** Changed `init()` to treat `null` from `getSavedPreference()` as "no saved preference" and fall through to system preference detection:

```javascript
const saved = this.hasSavedPreference() ? this.getSavedPreference() : null;
const theme = saved
  || (this.getSystemPreference() ? 'dark' : 'light');
this.applyTheme(theme);
```

### 2. CSS Specificity Override (Phase 3.5)

See [CSS Specificity Analysis](#css-specificity-analysis) above.

### 3. NeDB Node 24 Crash (Phase 3.1)

**Symptom:** `TypeError: util.isDate is not a function` on server startup.

**Root cause:** Node.js 24 removed `util.isDate()`, `util.isRegExp()`, and other `util.is*` type-checking functions that were deprecated since Node 4. The original `nedb` package (unmaintained since 2016) calls these functions directly.

**Fix:** Replaced `nedb` with `@seald-io/nedb`, a maintained fork that has polyfilled these calls. Since `@seald-io/nedb` is a CJS package imported in an ESM project, a `createRequire()` bridge is used:

```typescript
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const Datastore = require('@seald-io/nedb');
```

### 4. Greeting Page Missing JS Bundle (Phase 3.1)

**Symptom:** Theme toggle present in header (server-rendered) but non-functional on greeting page.

**Root cause:** `src/backend/views/pages/index.twig` (the greeting/empty-DB page) did not include `main.bundle.js`. The toggle button was rendered by the Twig header component, but ThemeManager never initialized because the script wasn't loaded.

**Fix:** Added the script tag to `index.twig`. All other page templates already included it via `layout.twig`.
