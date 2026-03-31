# Quick Reference: ThemeManager Usage

**Purpose:** Quick guide to understand and use the ThemeManager module  
**For:** Developers working on dark mode feature or consuming theme-related functionality  
**Last Updated:** November 6, 2025

---

## Quick Navigation

| Topic | Location |
|-------|----------|
| Module Code | `src/frontend/js/modules/themeManager.js` |
| CSS Light Theme | `src/frontend/styles/vars.pcss` |
| CSS Dark Theme | `src/frontend/styles/dark-mode.pcss` |
| Main Stylesheet | `src/frontend/styles/main.pcss` |
| App Initialization | `src/frontend/js/app.js` |
| Requirements Spec | `.github/specs/dark-mode/Requirements.md` |
| Full Design Doc | `.github/specs/dark-mode/Design.md` |
| Task List | `.github/specs/dark-mode/Tasks.md` |

---

## How ThemeManager Works (Simple Overview)

```
User Changes Theme
        ↓
Button Emits 'themeToggle' Event
        ↓
ThemeManager.setTheme() Called
        ↓
Updates DOM: <html data-theme="dark">
        ↓
Saves to localStorage
        ↓
CSS Variables Update Automatically
        ↓
Whole Page Theme Changes Instantly
```

---

## Using ThemeManager in Code

### Basic Usage Pattern

```javascript
import ThemeManager from './modules/themeManager';

// During app initialization (already done in app.js)
ThemeManager.init();

// Get current theme anywhere in your code
const current = ThemeManager.getCurrentTheme();
// Returns: 'light' or 'dark'

// Change theme
ThemeManager.setTheme('dark');

// Listen for theme changes
ThemeManager.onThemeToggle((newTheme) => {
  console.log('Theme changed to:', newTheme);
});

// Check if user has saved a preference
if (ThemeManager.hasSavedPreference()) {
  console.log('User has a saved preference');
}

// Get system OS preference
const preference = ThemeManager.getSystemPreference();
// Returns: 'light', 'dark', or null if not supported
```

### Common Scenarios

#### Scenario 1: React to Theme Changes
```javascript
// In any module/component
ThemeManager.onThemeToggle((theme) => {
  // Update component-specific state
  this.updateComponentForTheme(theme);
});
```

#### Scenario 2: Apply Custom Logic on Theme Change
```javascript
// Listen for theme change events
document.addEventListener('themeChange', (e) => {
  const newTheme = e.detail.theme;
  // Custom logic here
  updateCustomElements(newTheme);
});
```

#### Scenario 3: Force a Theme
```javascript
// Programmatically set theme (e.g., user preference in settings)
ThemeManager.setTheme('dark');
// Automatically:
// 1. Updates DOM data-theme attribute
// 2. Saves to localStorage
// 3. Emits event for listeners
```

---

## CSS Variable Usage

### For Component Developers

Always use CSS variables, never hardcoded colors:

```css
/* ✓ CORRECT */
.my-component {
  background-color: var(--color-bg-main);
  color: var(--color-text-main);
  border: 1px solid var(--color-line-gray);
}

/* ✗ WRONG */
.my-component {
  background-color: #ffffff;  /* Breaks in dark mode! */
  color: #060C26;
}
```

### Available CSS Variables

#### Light Mode (default)
```css
/* In :root selector */
--color-text-main: #060C26        /* Primary text */
--color-text-second: #717682      /* Secondary text */
--color-bg-main: #ffffff          /* Main background */
--color-bg-light: #f8f7fa         /* Light background */
--color-line-gray: #E8E8EB        /* Borders */
--color-link-active: #2071cc      /* Active links */
--color-link-hover: #F3F6F8       /* Link hover state */
--color-input-primary: #F3F6F8    /* Input backgrounds */
--color-input-border: #477CFF     /* Input borders */
--color-page-active: #ff1767      /* Active page indicator */
--color-success: #00e08f          /* Success/positive */
```

#### Dark Mode (when data-theme="dark")
```css
--color-text-main: #E0E0E0        /* Light text */
--color-text-second: #B0B0B0      /* Muted text */
--color-bg-main: #1E1E1E          /* Dark background */
--color-bg-light: #2A2A2A         /* Lighter dark background */
--color-line-gray: #404040        /* Dark borders */
--color-link-active: #569CD6      /* Blue links */
--color-link-hover: #F0F0F0       /* Light hover */
--color-input-primary: #3A3A3A    /* Dark inputs */
--color-input-border: #477CFF     /* Input borders */
--color-page-active: #FF6B9D      /* Pink accent */
--color-success: #00E08F          /* Green success */
```

---

## Adding Theme Support to a Component

### Step-by-Step Guide

**1. Update Your Component's Stylesheet**

Replace all hardcoded colors with CSS variables:

```css
/* Before */
.sidebar {
  background: #f8f7fa;
  color: #060C26;
  border-right: 1px solid #E8E8EB;
}

/* After */
.sidebar {
  background: var(--color-bg-light);
  color: var(--color-text-main);
  border-right: 1px solid var(--color-line-gray);
}
```

**2. If Component Needs Custom Logic on Theme Change**

Add a listener:

```javascript
export default class MyComponent {
  init() {
    ThemeManager.onThemeToggle((theme) => {
      this.updateForTheme(theme);
    });
  }
  
  updateForTheme(theme) {
    // Custom logic if needed
  }
}
```

**3. Test Both Themes**

- Load component in light mode
- Verify all colors correct
- Toggle to dark mode
- Verify all colors correct
- Check text contrast meets WCAG AA

---

## How Theme Preference Works

### Priority Order (What Gets Used)

```
1. User's Saved localStorage Preference (Highest Priority)
   └─ If found, use this
   
2. System OS/Browser Preference (if no saved preference)
   └─ Detected via matchMedia('(prefers-color-scheme: dark)')
   
3. Default: Light Mode (Lowest Priority)
   └─ Fallback if nothing else available
```

### Example Flow

```
User visits page for first time
  → No localStorage value
  → Check system preference (OS dark mode setting)
  → If OS has dark mode: use dark theme
  → If OS has light mode: use light theme
  → Otherwise: default to light mode

User toggles theme in app
  → Theme saved to localStorage
  
User visits page again
  → localStorage value found
  → Use saved preference (ignores OS setting)
  
User clears browser data
  → localStorage cleared
  → System goes back to Step 1
```

---

## Debugging Theme Issues

### Is the theme being applied?

Check browser DevTools:
```javascript
// In console:
document.documentElement.getAttribute('data-theme')
// Should return: 'light' or 'dark'

// Get actual color value
getComputedStyle(document.documentElement)
  .getPropertyValue('--color-bg-main').trim()
// Should return: '#ffffff' or '#1E1E1E'
```

### Check localStorage

```javascript
// In console:
localStorage.getItem('codex-docs-theme')
// Should return: 'light' or 'dark'
```

### Check system preference

```javascript
// In console:
window.matchMedia('(prefers-color-scheme: dark)').matches
// true = system prefers dark, false = system prefers light
```

### Force a theme for testing

```javascript
// In console:
ThemeManager.setTheme('dark')  // Force dark mode
ThemeManager.setTheme('light') // Force light mode

// Check what's active
ThemeManager.getCurrentTheme()
```

---

## Common Mistakes to Avoid

❌ **Don't hardcode colors in CSS**
```css
/* WRONG */
.button { background: #477CFF; }
```
✓ **Do use CSS variables**
```css
/* CORRECT */
.button { background: var(--color-link-active); }
```

---

❌ **Don't forget to import ThemeManager**
```javascript
/* WRONG */
this.onThemeToggle = (callback) => { }  // Won't work
```
✓ **Do import and use the module**
```javascript
/* CORRECT */
import ThemeManager from './modules/themeManager';
ThemeManager.onThemeToggle((theme) => { /* ... */ });
```

---

❌ **Don't apply theme to individual elements only**
```css
/* WRONG - only dark mode specific */
[data-theme="dark"] .my-component {
  background: #1E1E1E;
}
/* Missing light mode, breaks when switching */
```
✓ **Do define both light and dark versions via variables**
```css
/* CORRECT - uses variables in both modes */
.my-component {
  background: var(--color-bg-main);
}
```

---

❌ **Don't modify ThemeManager storage key**
```javascript
/* WRONG - will break theme persistence */
localStorage.setItem('my-theme', 'dark');
```
✓ **Do use ThemeManager.setTheme()**
```javascript
/* CORRECT */
ThemeManager.setTheme('dark');
```

---

## Quick Checklist: Adding Dark Mode Support

When updating a component for dark mode:

- [ ] Read the CSS variables list above
- [ ] Review component's current CSS
- [ ] Replace hardcoded colors with `var(--color-*)`
- [ ] Test in light mode
- [ ] Test in dark mode
- [ ] Check contrast passes WCAG AA
- [ ] Verify no console errors
- [ ] Commit with `[dark-mode]` prefix

---

## Questions?

See full documentation:
- **Design Details:** `.github/specs/dark-mode/Design.md`
- **Requirements:** `.github/specs/dark-mode/Requirements.md`
- **Technical Deep Dive:** `.github/specs/dark-mode/foundation-setup/TechnicalDeepDive.md`
- **All Tasks:** `.github/specs/dark-mode/Tasks.md`

---

**End of Quick Reference**
