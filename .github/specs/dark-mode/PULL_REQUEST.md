## Dark Mode for CodeX Docs

### Summary

Adds a complete dark mode feature to CodeX Docs with system preference detection, manual toggle, localStorage persistence, and WCAG 2.1 AA accessibility compliance. Includes comprehensive test coverage (139 Playwright e2e + 30 Mocha unit tests) across Chromium, Firefox, and WebKit.

Built against the feature specification in [`.github/specs/dark-mode/`](.github/specs/dark-mode/README.md), implementing all functional requirements (FR-2.1 through FR-2.5) and non-functional requirements (NFR-3.1 through NFR-3.5) defined in [Requirements.md](.github/specs/dark-mode/Requirements.md).

### What Changed

**Theme System (Phase 1)**
- `ThemeManager` singleton module handles initialization, preference detection, persistence, and theme switching
- CSS custom properties architecture: light defaults in `vars.pcss`, dark overrides via `[data-theme="dark"]` selector in new `dark-mode.pcss`
- Synchronous initialization before other modules to prevent flash of unstyled content (FOUC)
- `@media (prefers-color-scheme: dark)` fallback for JS-disabled users, with `:not([data-theme="light"])` guard to respect explicit user choice

**UI Components (Phase 2)**
- Sun/moon toggle button in the header with animated icon swap
- All 11 component stylesheets audited and migrated to CSS variables — zero hardcoded colors remain ([2.8 audit results](.github/specs/dark-mode/documentation/2.8-remaining-component-styles/ImplementationSummary.md))
- Components covered: header, sidebar, navigator, page, writing, button, copy-button, auth, table-of-content, error, greeting

**Color Palette**
- Tailwind zinc neutrals: `#18181B` background, `#27272A` surfaces, `#71717A` borders, `#E4E4E7` primary text
- All color pairs verified against WCAG 2.1 AA contrast thresholds (4.5:1 for text, 3:1 for UI boundaries)
- 5 initial contrast failures found and fixed during accessibility testing

**Database Migration**
- Replaced unmaintained `nedb` (last updated 2016) with `@seald-io/nedb` — the original package crashes on Node.js ≥ 24 due to removed `util.isDate()` / `util.isRegExp()` functions
- Drop-in replacement, identical on-disk format, no data migration needed

### Test Coverage

| Suite | Tests | Scope |
|-------|-------|-------|
| Theme toggle | 6 | Button visibility, click, keyboard (Enter/Space), ARIA labels |
| Persistence | 14 | Save/restore, reload, clear, invalid values, rapid toggles, format validation |
| System preference | 4 | `prefers-color-scheme` emulation, saved pref overrides system |
| Components | 16 | CSS variable values per theme, rendered body/header/text colors |
| No-FOUC | 4 | `data-theme` present on load, DOM consistent with localStorage |
| Accessibility | 26 | WCAG AA contrast ratios, keyboard nav, focus visibility, ARIA semantics |
| Performance | 12 | Toggle < 100ms, CLS < 0.05, no FOUC, CSS architecture validation |
| Browser compat | 19 × 3 | CSS vars, toggle, localStorage, system pref, colors, events (Chromium + Firefox + WebKit) |
| Unit (Mocha) | 30 | ThemeManager init, setTheme, getCurrentTheme, getSystemPreference, persistence, events |

**Total: 169 tests, all passing**

### Bugs Found & Fixed During Testing

| Bug | Root Cause | Fix |
|-----|-----------|-----|
| Toggle icons never updated | Wrong event name in listener | Listen to `themeChange` |
| Page white in dark mode | Hardcoded `background: white` on body/header/copy-button | Replaced with `var(--color-bg-main)` |
| Greeting page lost dark mode | Missing `main.bundle.js` in `index.twig` | Added script tag |
| Alias 500 error on page save | Missing `await` on `alias.save()` | Added `await` in pages controller |
| Server crash on Node 24 | `nedb` uses removed `util.isDate()` | Migrated to `@seald-io/nedb` |
| `applyTheme(null)` on invalid localStorage | `hasSavedPreference()` true but value invalid | Fixed `init()` fallback chain |
| System dark overrides explicit light choice | CSS `@media` `:root` ties with `[data-theme="light"]` | Added `:not([data-theme="light"])` guard |

### Files Changed (excluding lock files and spec docs)

- **35 files changed**, ~2,700 lines added, ~45 removed
- **New source files:** `themeManager.js`, `themeToggle.js`, `dark-mode.pcss`, `playwright.config.ts`, 8 e2e spec files, 1 fixture, 1 unit test file
- **Modified source files:** `app.js`, `vars.pcss`, `header.pcss`, `sidebar.pcss`, `page.pcss`, `navigator.pcss`, `writing.pcss`, `copy-button.pcss`, `diff.pcss`, `main.pcss`, `header.twig`, `index.twig`, `local.ts`, `pages.ts`, `database.ts`, `package.json`
- **Project docs:** `README.md` (feature list), `DEVELOPMENT.md` (prerequisites, dark mode, testing, nedb migration)

### Documentation

Full implementation documentation is in [`.github/specs/dark-mode/documentation/`](.github/specs/dark-mode/documentation/progress-report.md):

- **Phase 1.3**
App initialization [Quick Reference](https://github.com/Hunta/codex.docs/blob/3deaad7a0eff76bef4bbb01e21a2d54f2493aa7b/.github/specs/dark-mode/documentation/1.3-app-initialization/QuickReference.md): FOUC prevention, synchronous init, DOM timing
- **Phase 2.4–2.8**
Component style migration docs for: 
Page [Quick Reference](https://github.com/Hunta/codex.docs/blob/3deaad7a0eff76bef4bbb01e21a2d54f2493aa7b/.github/specs/dark-mode/documentation/2.4-page-component-styles/QuickReference.md)
Sidebar [Quick reference](https://github.com/Hunta/codex.docs/blob/3deaad7a0eff76bef4bbb01e21a2d54f2493aa7b/.github/specs/dark-mode/documentation/2.5-sidebar-component-styles/QuickReference.md)
Button [Quick Reference](https://github.com/Hunta/codex.docs/blob/3deaad7a0eff76bef4bbb01e21a2d54f2493aa7b/.github/specs/dark-mode/documentation/2.6-button-component-styles/QuickReference.md)
Input / Form [Quick Reference](https://github.com/Hunta/codex.docs/blob/3deaad7a0eff76bef4bbb01e21a2d54f2493aa7b/.github/specs/dark-mode/documentation/2.7-input-form-component-styles/QuickReference.md)
Remaining [Quick Reference](https://github.com/Hunta/codex.docs/blob/3deaad7a0eff76bef4bbb01e21a2d54f2493aa7b/.github/specs/dark-mode/documentation/2.8-remaining-component-styles/QuickReference.md)
- **Phase 3**
Testing [Quick Reference](https://github.com/Hunta/codex.docs/blob/3deaad7a0eff76bef4bbb01e21a2d54f2493aa7b/.github/specs/dark-mode/documentation/3-testing/QuickReference.md): test architecture, WCAG methodology, cross-browser strategy, root cause analyses

### How to Test

```bash
# Start dev server
yarn dev

# Run all e2e tests (auto-starts server)
yarn test:e2e

# Run unit tests
yarn test

# Interactive Playwright UI
yarn test:e2e:ui
```

Toggle the sun/moon button in the header to switch themes. Preference persists across reloads and pages. Remove localStorage key `codex-docs-theme` to reset to system default.

### Getting Started

#### Prerequisites

- **Node.js 20+** is required (eslint-plugin-jsdoc@62.9.0+ only supports Node 20+)
- Docker (optional, for containerized deployment)

#### Local Development with Yarn

1. **Install dependencies:**
   ```bash
   yarn install --ignore-engines
   ```
   (The `--ignore-engines` flag bypasses Node version warnings for some transitive dependencies)

2. **Start the development server:**
   ```bash
   yarn dev
   ```
   This runs the backend on `http://localhost:3000` and watches frontend assets.

3. **Access the app:**
   Open http://localhost:3000 and use the sun/moon toggle button in the header (top-right) to switch themes.

#### Production with Docker

1. **Create a local config file:**
   ```bash
   # Copy the default config
   cp docs-config.yaml docs-config.local.yaml
   ```
   Update `port: 7777` and `host: "0.0.0.0"` in `docs-config.local.yaml` if needed.

2. **Build and start the container:**
   ```bash
   docker compose up -d --build
   ```
   The app will be available at http://localhost:7777

3. **Verify the container:**
   ```bash
   docker logs codexdocs-docs-1 --tail 20
   ```
   You should see: `CodeX Docs server is running`

#### Important Notes

- **Node 22 on local machine:** If you're running Node 22 locally and encounter `eslint-plugin-jsdoc` engine errors during `yarn install`, use the `--ignore-engines` flag:
  ```bash
  yarn install --ignore-engines
  ```

- **Docker builds:** The Dockerfile.prod uses Node 20 and includes `--ignore-engines` flags in yarn install commands to ensure compatibility.

- **Database:** This PR migrates from `nedb` to `@seald-io/nedb`. The new package is a drop-in replacement with identical on-disk format — no data migration required.
