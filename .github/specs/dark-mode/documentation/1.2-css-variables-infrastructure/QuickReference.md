# CSS Variables Infrastructure - Quick Reference

**Task:** 1.2 - Define CSS Custom Properties for Colors  
**Version:** 1.0  
**Last Updated:** November 6, 2025

---

## 🚀 Quick Start

### Using a CSS Variable

```css
/* Instead of: */
color: #060C26;

/* Use: */
color: var(--color-text-main);
```

### Available Variables

```css
/* Text */
var(--color-text-main)      /* Primary text - #060C26 light, #E0E0E0 dark */
var(--color-text-second)    /* Secondary text - #717682 light, #A0A0A0 dark */

/* Backgrounds */
var(--color-bg-main)        /* Primary - #ffffff light, #1E1E1E dark */
var(--color-bg-light)       /* Secondary - #f8f7fa light, #2D2D30 dark */

/* Links */
var(--color-link-active)    /* Active links - #2071cc light, #569CD6 dark */
var(--color-link-hover)     /* Hover state - #F3F6F8 light, #252526 dark */

/* UI Elements */
var(--color-line-gray)      /* Borders - #E8E8EB light, #3E3E42 dark */

/* Buttons */
var(--color-button-primary)
var(--color-button-primary-hover)
var(--color-button-primary-active)
var(--color-button-secondary)
var(--color-button-secondary-hover)
var(--color-button-secondary-active)
var(--color-button-warning)
var(--color-button-warning-hover)
var(--color-button-warning-active)

/* Code Syntax */
var(--color-code-bg)        /* Background */
var(--color-code-main)      /* Main text */
var(--color-code-keyword)   /* Keywords */
var(--color-code-string)    /* Strings */
var(--color-code-comment)   /* Comments */
/* ... 6 more syntax colors */

/* Form Inputs */
var(--color-input-primary)  /* Input background */
var(--color-input-border)   /* Focus border */

/* Status Colors */
var(--color-page-active)    /* Active indicator */
var(--color-success)        /* Success state */
```

### Complete Variable List

All variables defined in `src/frontend/styles/vars.pcss`:

| Group | Light Mode | Dark Mode |
|-------|-----------|-----------|
| **Text Main** | #060C26 | #E0E0E0 |
| **Text Second** | #717682 | #A0A0A0 |
| **BG Main** | #ffffff | #1E1E1E |
| **BG Light** | #f8f7fa | #2D2D30 |
| **Line Gray** | #E8E8EB | #3E3E42 |
| **Link Active** | #2071cc | #569CD6 |
| **Link Hover** | #F3F6F8 | #252526 |
| **Input Primary** | #F3F6F8 | #3C3C3C |
| **Input Border** | #477CFF | #007ACC |
| **Page Active** | #ff1767 | #FF1777 |
| **Success** | #00e08f | #4EC9B0 |
| **Code BG** | #252935 | #1E1E1E |
| **Code Main** | #E1EBFE | #D4D4D4 |

---

## 🎨 Color Categories Reference

### Text Colors

```css
--color-text-main           /* Primary text content */
--color-text-second         /* Secondary/metadata text */
```

**Usage:**
```css
body {
  color: var(--color-text-main);
}

.metadata {
  color: var(--color-text-second);
}
```

### Background Colors

```css
--color-bg-main             /* Main backgrounds */
--color-bg-light            /* Secondary backgrounds */
```

**Usage:**
```css
body {
  background: var(--color-bg-main);
}

.sidebar {
  background: var(--color-bg-light);
}
```

### Link Colors

```css
--color-link-active         /* Links and active states */
--color-link-hover          /* Hover backgrounds */
```

**Usage:**
```css
a {
  color: var(--color-link-active);
}

a:hover {
  background: var(--color-link-hover);
}
```

### Button Colors

**Primary Buttons:**
```css
--color-button-primary
--color-button-primary-hover
--color-button-primary-active
```

**Secondary Buttons:**
```css
--color-button-secondary
--color-button-secondary-hover
--color-button-secondary-active
```

**Warning Buttons:**
```css
--color-button-warning
--color-button-warning-hover
--color-button-warning-active
```

**Usage:**
```css
.button-primary {
  background: var(--color-button-primary);
  
  &:hover {
    background: var(--color-button-primary-hover);
  }
  
  &:active {
    background: var(--color-button-primary-active);
  }
}
```

### Code Colors

```css
--color-code-bg             /* Code block background */
--color-code-main           /* Code block text */
--color-code-keyword        /* Keywords (if, for, etc) */
--color-code-class          /* Class names */
--color-code-variable       /* Variable names */
--color-code-string         /* String literals */
--color-code-params         /* Function parameters */
--color-code-tag            /* HTML tags */
--color-code-number         /* Numbers */
--color-code-comment        /* Comments */
```

**Usage:**
```css
.code-block {
  background: var(--color-code-bg);
  color: var(--color-code-main);
  
  .keyword { color: var(--color-code-keyword); }
  .string { color: var(--color-code-string); }
  .comment { color: var(--color-code-comment); }
}
```

### Input Colors

```css
--color-input-primary       /* Input field background */
--color-input-border        /* Focus border */
```

**Usage:**
```css
input, textarea {
  background: var(--color-input-primary);
  border: 1px solid var(--color-line-gray);
  
  &:focus {
    border-color: var(--color-input-border);
  }
}
```

### Status Colors

```css
--color-page-active         /* Active page indicator */
--color-success             /* Success messages */
```

**Usage:**
```css
.page.active::before {
  background: var(--color-page-active);
}

.success-message {
  color: var(--color-success);
}
```

---

## 📝 Common Tasks

### Task: Add a New Color Variable

**Step 1:** Identify the color purpose
```
Example: "I need a color for warning backgrounds"
```

**Step 2:** Find appropriate section in vars.pcss
```css
/* Status Colors */
--color-page-active: #ff1767;
--color-success: #00e08f;
--color-warning-bg: #FFF3CD;     /* ← Add here */
```

**Step 3:** Add to light mode (:root section)
```css
--color-warning-bg: #FFF3CD;
```

**Step 4:** Add to dark mode (dark-mode.pcss, [data-theme="dark"])
```css
--color-warning-bg: #4D3C23;
```

**Step 5:** Add to media query fallback (@media prefers-color-scheme)
```css
--color-warning-bg: #4D3C23;
```

**Step 6:** Use in CSS
```css
.warning {
  background: var(--color-warning-bg);
}
```

### Task: Update a Color Value

**For Light Mode:**
```css
/* vars.pcss - in :root section */
--color-text-main: #060C26;  /* ← Update here */
```

**For Dark Mode:**
```css
/* dark-mode.pcss - in [data-theme="dark"] section */
--color-text-main: #E0E0E0;  /* ← Update here */
```

**For Fallback:**
```css
/* dark-mode.pcss - in @media query */
--color-text-main: #E0E0E0;  /* ← Update here too */
```

### Task: Create a New Theme

**Step 1:** Add new selector to dark-mode.pcss
```css
[data-theme="high-contrast"] {
  --color-text-main: #000000;
  --color-bg-main: #FFFFFF;
  --color-text-second: #000000;
  --color-bg-light: #F0F0F0;
  /* ... override all variables ... */
}
```

**Step 2:** Set theme from JavaScript
```javascript
document.documentElement.setAttribute('data-theme', 'high-contrast');
```

### Task: Test Theme Switching

**In Browser Console:**
```javascript
/* Switch to dark mode */
document.documentElement.setAttribute('data-theme', 'dark');

/* Switch back to light */
document.documentElement.removeAttribute('data-theme');

/* Get current theme */
document.documentElement.getAttribute('data-theme');
```

---

## 🔍 Troubleshooting

### Problem: Color not changing when theme switches

**Check 1:** CSS is using variable
```css
color: #060C26;           /* ✗ Wrong - hardcoded */
color: var(--color-text-main);  /* ✓ Correct */
```

**Check 2:** Variable is defined in vars.pcss
```css
/* Search: grep "color-text-main" src/frontend/styles/vars.pcss */
Should find: --color-text-main: #060C26;
```

**Check 3:** Variable override exists in dark-mode.pcss
```css
/* In [data-theme="dark"] section */
--color-text-main: #E0E0E0;
```

**Check 4:** dark-mode.pcss is imported in main.pcss
```css
@import './dark-mode.pcss';
```

**Check 5:** Build was run
```bash
npm run build-frontend
npm run build-backend
```

### Problem: Wrong color in dark mode

**Solution:** Update override in dark-mode.pcss
```css
/* dark-mode.pcss */
[data-theme="dark"] {
  --color-text-main: #E0E0E0;  /* ← Change this value */
}
```

### Problem: CSS variable not found error

**Check:** Variable exists in vars.pcss
```bash
grep "color-new-var" src/frontend/styles/vars.pcss
```

**If missing:** Add it
```css
/* vars.pcss */
--color-new-var: #CCCCCC;

/* dark-mode.pcss */
[data-theme="dark"] {
  --color-new-var: #333333;
}
```

### Problem: Media query fallback not working

**Check:** Both light and dark sections updated
```css
/* vars.pcss - :root section */
--color-text-main: #060C26;

/* dark-mode.pcss - [data-theme="dark"] section */
--color-text-main: #E0E0E0;

/* dark-mode.pcss - @media section */
--color-text-main: #E0E0E0;  /* ← Must also update here */
```

---

## 📂 File Locations

```
src/frontend/styles/
├── vars.pcss               ← Light mode variables & defaults
├── dark-mode.pcss          ← Dark mode overrides & fallback
└── main.pcss               ← Import location for both
```

## 🔗 File Cross-References

| File | Purpose | Key Content |
|------|---------|-------------|
| **vars.pcss** | Light mode variables | `:root { --color-*: value; }` |
| **dark-mode.pcss** | Dark overrides + fallback | `[data-theme="dark"]` and `@media query` |
| **main.pcss** | Import orchestration | `@import './vars.pcss'` |

## 🧪 Variable Testing Checklist

Before committing changes:

- [ ] Light mode colors look correct in browser
- [ ] Dark mode colors look correct (toggle theme)
- [ ] System dark mode preference works (OS setting)
- [ ] No console errors
- [ ] CSS builds without warnings
- [ ] All related color categories updated together
- [ ] No hardcoded hex values remain
- [ ] WCAG contrast requirements met

---

## 💡 Best Practices

✅ **DO:**
- Use semantic names: `--color-button-primary-hover`
- Update all three locations (light, dark, fallback)
- Group related colors together
- Use variables everywhere

❌ **DON'T:**
- Create color variables like `--color-blue` (not semantic)
- Hardcode hex values in component CSS
- Skip the media query fallback
- Use `!important` to override variables

---

## 📚 More Information

See related documentation:
- **ImplementationSummary.md** - What was built and why
- **TechnicalDeepDive.md** - Architecture and advanced topics
- **Task 1.1 Docs** - ThemeManager integration
- **Task 2.1-2.3 Docs** - Header toggle button implementation

---

**End of Quick Reference**
