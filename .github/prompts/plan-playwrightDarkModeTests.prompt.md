# Plan: Implement Playwright UI Tests for Dark Mode

Add Playwright e2e tests to verify the dark mode feature — theme toggle, localStorage persistence, system preference detection, and visual correctness across all components. Tests auto-start the dev server on port 7777 using NeDB (no external DB required).

---

### Phase A: Setup (sequential)
1. Install `@playwright/test` + browsers
2. Create `playwright.config.ts` with `webServer` config → `yarn dev` on port 7777
3. Update `.gitignore` with Playwright artifacts (`test-results/`, `playwright-report/`, `playwright/.cache`)
4. Add npm scripts: `test:e2e` and `test:e2e:ui`

### Phase B: Core Theme Tests (parallel after A)
5. **`e2e/dark-mode/theme-toggle.spec.ts`** — Toggle button exists, click switches `html[data-theme]` light↔dark, correct ARIA attributes, keyboard accessible (Tab + Enter/Space)
6. **`e2e/dark-mode/theme-persistence.spec.ts`** — Saved to `localStorage` key `codex-docs-theme`, restored on reload, defaults to light when no preference
7. **`e2e/dark-mode/system-preference.spec.ts`** — Uses Playwright's `colorScheme` emulation to test `prefers-color-scheme: dark` as fallback, saved preference overrides system

### Phase C: Visual Component Tests (parallel after A)
8. **`e2e/dark-mode/components.spec.ts`** — Header, sidebar, page content, buttons, auth form, toggle icon visibility — all verified in both themes via `getComputedStyle` on CSS variables
9. **`e2e/dark-mode/no-fouc.spec.ts`** — Set localStorage before navigation, verify `data-theme` is correct on first meaningful paint

### Phase D: Test Fixtures
10. **`e2e/fixtures/setup.ts`** — Auth helper (POST `/auth` with password `secretpassword`), page creation helper, shared selectors

---

### Key Decisions
- **Test against `/auth` page** for guaranteed `layout.twig` — the greeting page (`/` with empty DB) doesn't include `main.bundle.js`, so ThemeManager won't run there
- **CSS variable assertions** — use `getComputedStyle` to verify `--color-bg-main` resolves to `#1E1E1E` in dark, `#ffffff` in light
- **Icon visibility** — assert `style.display` on sun/moon SVGs (set inline by JS)
- **System preference** — Playwright's built-in `colorScheme: 'dark'` context option emulates `prefers-color-scheme`

### Relevant Files
| File | Action |
|------|--------|
| `playwright.config.ts` | Create |
| `e2e/dark-mode/*.spec.ts` (5 files) | Create |
| `e2e/fixtures/setup.ts` | Create |
| `package.json` | Modify (scripts + devDep) |
| `.gitignore` | Modify |

### Verification
1. `npx playwright install` succeeds
2. `yarn test:e2e` — all tests pass (server auto-starts/stops)
3. `yarn test:e2e:ui` — interactive mode works
4. All dark mode acceptance criteria from Requirements.md covered

### Constraint
The greeting page (`/` with empty DB) does **not** load `main.bundle.js` — ThemeManager is inactive there. All tests target pages using `layout.twig` (i.e., `/auth` or created pages).
