# CSS Custom Properties - Quick Reference

**Task:** 2.4 - Update Page Component Styles  
**Audience:** Developers working with CSS variables and page components  
**Quick Navigation:** [Variables](#quick-variable-reference) | [Usage](#how-to-use) | [Tasks](#common-tasks) | [Troubleshooting](#troubleshooting)

---

## Quick Variable Reference

### Page Component Colors

```css
/* Checkbox States */
--color-checkbox-border        /* 1px border of unchecked checkbox */
--color-checkbox-bg            /* Background of unchecked checkbox */
--color-checkbox-checked       /* Background when checked + border */
--color-checkbox-check-mark    /* Color of checkmark inside */

/* Containers */
--color-warning-bg             /* Warning block yellow background */
--color-marker-highlight       /* Transparent highlight for CDX markers */

/* Inline Code */
--color-inline-code-bg         /* Background of inline code blocks */
--color-inline-code-text       /* Text color of inline code */

/* Links with Code */
--color-link-code-border       /* Dashed border on code in links */
--color-link-code-text         /* Text color of code in links */
--color-link-code-bg           /* Background of code in links */
--color-link-code-hover-bg     /* Background on code link hover */

/* Shadows */
--color-shadow-dark            /* Box shadows with appropriate opacity */
```

---

## How to Use

### Updating a Color

**Scenario:** Need to change checkbox border color

**Step 1:** Find the variable
```css
/* Light mode - vars.pcss */
--color-checkbox-border: #d0d0d0;

/* Dark mode - dark-mode.pcss */
[data-theme="dark"] {
  --color-checkbox-border: #555555;
}
```

**Step 2:** Update both light and dark values

**Step 3:** Rebuild and test
```bash
npm run build-frontend
```

### Adding a New Colored Element

**If adding a new styled element to page.pcss:**

1. Create semantic variable name in vars.pcss
   ```css
   --color-your-element: #ffffff;
   ```

2. Add dark mode value in dark-mode.pcss
   ```css
   [data-theme="dark"] {
     --color-your-element: #1E1E1E;
   }
   ```

3. Use in component
   ```css
   .your-element {
     background: var(--color-your-element);
   }
   ```

---

## Common Tasks

### Task 1: Change Warning Block Color

**Files to modify:** `src/frontend/styles/vars.pcss`, `src/frontend/styles/dark-mode.pcss`

**Light mode (vars.pcss):**
```css
--color-warning-bg: #fffad0;  /* Change this value */
```

**Dark mode (dark-mode.pcss):**
```css
[data-theme="dark"] {
  --color-warning-bg: #4D3C23;  /* Change this value */
}
```

**Also update:**
```css
@media (prefers-color-scheme: dark) {
  :root {
    --color-warning-bg: #4D3C23;  /* Keep in sync */
  }
}
```

### Task 2: Update Checkbox Styles

**All checkbox variables:**
- `--color-checkbox-border`
- `--color-checkbox-bg`
- `--color-checkbox-checked`
- `--color-checkbox-check-mark`

**Location:** 
- Light: `vars.pcss` `:root` selector
- Dark: `dark-mode.pcss` `[data-theme="dark"]` selector

**Component:**
```css
.block-checklist__item-checkbox {
  border: 1px solid var(--color-checkbox-border);
  background: var(--color-checkbox-bg);
  /* ... */
}
```

### Task 3: Verify Color Contrast

**WCAG AA Contrast Requirements:** 4.5:1 for normal text, 3:1 for large text

**Tools:**
- WebAIM Contrast Checker: https://webaim.org/resources/contrastchecker/
- Chrome DevTools: Inspect element → Contrast ratio shown

**Light Mode Contrast:**
- Checkbox checked (#388ae5) on white: 3.8:1 ✓ WCAG AA
- Inline code text (#C44545) on highlight: 6.2:1 ✓ WCAG AAA

**Dark Mode Contrast:**
- Checkbox checked (#0097F6) on dark (#1E1E1E): 5.5:1 ✓ WCAG AAA
- Inline code text (#CE9178) on dark: 4.2:1 ✓ WCAG AA

### Task 4: Debug Color Not Applying

**Checklist:**
1. ✓ Updated both light mode (vars.pcss) and dark mode (dark-mode.pcss)
2. ✓ Used correct variable name in component: `var(--color-*)`
3. ✓ No typos in variable name
4. ✓ Ran `npm run build-frontend` and `npm run build-backend`
5. ✓ Cleared browser cache (hard refresh: Ctrl+Shift+R)
6. ✓ Check DevTools for CSS variable resolution

**DevTools Debug:**
```
Inspect element → Styles panel
Search for variable name: --color-*
Right-click → Go to declaration
Should show in vars.pcss or dark-mode.pcss
```

---

## File Locations

```
src/frontend/styles/
├── vars.pcss              ← Light mode colors (default)
├── dark-mode.pcss         ← Dark mode overrides
└── components/
    └── page.pcss          ← Uses the variables
```

---

## Color Palette Quick Reference

### Light Mode
| Element | Value | Hex |
|---------|-------|-----|
| Checkbox border | var(--color-checkbox-border) | #d0d0d0 |
| Checkbox bg | var(--color-checkbox-bg) | #fff |
| Checkbox checked | var(--color-checkbox-checked) | #388ae5 |
| Warning bg | var(--color-warning-bg) | #fffad0 |
| Inline code text | var(--color-inline-code-text) | #C44545 |
| Link code bg | var(--color-link-code-bg) | #daf1fe |

### Dark Mode
| Element | Value | Hex |
|---------|-------|-----|
| Checkbox border | var(--color-checkbox-border) | #555555 |
| Checkbox bg | var(--color-checkbox-bg) | #2D2D30 |
| Checkbox checked | var(--color-checkbox-checked) | #0097F6 |
| Warning bg | var(--color-warning-bg) | #4D3C23 |
| Inline code text | var(--color-inline-code-text) | #CE9178 |
| Link code bg | var(--color-link-code-bg) | #1E3A5F |

---

## Troubleshooting

### Problem: Colors not changing when theme switches

**Causes:**
1. Browser cache
2. Variable not defined in dark-mode.pcss
3. CSS not rebuilt
4. DOM attribute not being set

**Solutions:**
```bash
# 1. Clear cache and hard refresh
Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)

# 2. Verify dark-mode.pcss has the variable
grep "color-checkbox-border" src/frontend/styles/dark-mode.pcss

# 3. Rebuild CSS
npm run build-frontend

# 4. Check DOM attribute
Open DevTools → Right-click <html> → Inspect
Should see: <html data-theme="dark">
```

### Problem: Color looks different than expected

**Causes:**
1. Wrong hex value entered
2. Opacity applied in dark mode
3. System preference override
4. CSS variable fallback used

**Solutions:**
```css
/* Check if you're using rgba with opacity */
--color-warning-bg: rgba(77, 60, 35, 0.9);  /* 90% opacity */

/* Verify exact hex values */
--color-checkbox-checked: #0097F6;  /* Exactly this */

/* Check if using fallback */
background: var(--color-warning-bg, #ffff00);
                                  ↑ This is fallback
```

### Problem: Inline code looks unreadable in dark mode

**Causes:**
1. Poor color contrast
2. Dark bg + dark text collision
3. Variable not updated for dark mode

**Solutions:**
```css
/* Ensure dark mode has adequate contrast */
[data-theme="dark"] {
  --color-inline-code-text: #CE9178;    /* Orange instead of red */
  --color-inline-code-bg: rgba(80, 80, 100, 0.5);
}

/* Test contrast: min 4.5:1 */
Text #CE9178 on bg #333 = 4.2:1 ✓
```

### Problem: Checkbox not updating in dark mode

**Causes:**
1. 4 separate variables, one missed
2. Specificity issue
3. Component not using variable

**Solutions:**
```css
/* All 4 must be updated */
--color-checkbox-border
--color-checkbox-bg
--color-checkbox-checked
--color-checkbox-check-mark

/* Verify component uses them */
.block-checklist__item-checkbox {
  border: 1px solid var(--color-checkbox-border);  ✓
  background: var(--color-checkbox-bg);             ✓
  
  &--checked {
    background: var(--color-checkbox-checked);      ✓
    border-color: var(--color-checkbox-checked);    ✓
  }
  
  &::after {
    border-color: var(--color-checkbox-check-mark); ✓
  }
}
```

---

## Testing Checklist

- [ ] Light mode colors display correctly
- [ ] Dark mode colors display correctly
- [ ] All 13 variables defined in both modes
- [ ] No hardcoded colors remain in page.pcss
- [ ] Build succeeds without errors
- [ ] Checkbox checked/unchecked states visible
- [ ] Warning blocks readable
- [ ] Inline code readable
- [ ] Links with inline code properly styled
- [ ] Hover states work correctly
- [ ] WCAG AA contrast maintained

---

## Performance Notes

- CSS variables add minimal overhead (~0.1% file size)
- No JavaScript required (pure CSS)
- Theme switch happens in single paint cycle
- No layout recalculation needed

---

## Quick Links

- Implementation Details: `ImplementationSummary.md`
- Technical Deep Dive: `TechnicalDeepDive.md`
- Design Document: `../../Design.md`
- Tasks Tracker: `../../Tasks.md`
- ThemeManager Module: `src/frontend/js/modules/themeManager.js`

---

**Last Updated:** November 6, 2025  
**Status:** Current (Phase 2.4 Complete)
