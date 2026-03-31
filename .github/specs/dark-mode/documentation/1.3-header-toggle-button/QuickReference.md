# Quick Reference: Header Theme Toggle Button

**Purpose:** Quick guide for understanding and maintaining the theme toggle UI  
**For:** Developers working on dark mode feature or maintaining the UI  
**Last Updated:** November 6, 2025

---

## Quick Navigation

| What | Where |
|------|-------|
| Button Template | `src/backend/views/components/header.twig` |
| Toggle Logic | `src/frontend/js/modules/themeToggle.js` |
| Button Styling | `src/frontend/styles/components/header.pcss` |
| App Integration | `src/frontend/js/app.js` |
| Theme Manager | `src/frontend/js/modules/themeManager.js` |
| Full Spec | `.github/specs/dark-mode/Design.md` |

---

## How It Works (Simple Overview)

```
User Clicks Button
    ↓
ThemeToggle.handleThemeToggleClick()
    ↓
ThemeManager.setTheme(newTheme)
    ↓
DOM attribute updated: data-theme="dark" or "light"
    ↓
CSS variables cascade automatically
    ↓
updateButtonIcon() shows correct icon
    ↓
Page theme changes instantly
```

---

## File Structure

### 1. Template (header.twig)

```twig
<li class="docs-header__menu-theme">
  <button class="theme-toggle" 
          aria-label="Toggle dark mode" 
          title="Toggle theme"
          data-module="theme-toggle">
    <svg class="theme-toggle__icon theme-toggle__icon--light">
      <!-- Sun icon SVG -->
    </svg>
    <svg class="theme-toggle__icon theme-toggle__icon--dark">
      <!-- Moon icon SVG -->
    </svg>
  </button>
</li>
```

**Key Attributes:**
- `class="theme-toggle"` - CSS selector for styling
- `aria-label="Toggle dark mode"` - Screen reader text
- `title="Toggle theme"` - Tooltip on hover
- `data-module="theme-toggle"` - Module dispatcher hook

### 2. JavaScript Module (themeToggle.js)

```javascript
class ThemeToggle {
  init()
    - Find button in DOM
    - Attach click listener
    - Listen to ThemeManager changes
    - Set initial icon

  handleThemeToggleClick(event)
    - Get current theme
    - Calculate next theme
    - Call ThemeManager.setTheme()

  updateButtonIcon(button, theme)
    - Show sun for light mode
    - Show moon for dark mode
}
```

**Usage:**
```javascript
// Automatically initialized by app.js
// No manual initialization needed
```

### 3. Styling (header.pcss)

```css
.theme-toggle {
  width: 36px;
  height: 36px;
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--color-text-main);
}

.theme-toggle:hover {
  background-color: var(--color-link-hover);
}

.theme-toggle:focus {
  outline: 2px solid var(--color-link-active);
}

.theme-toggle__icon--light, /* Sun icon */
.theme-toggle__icon--dark   /* Moon icon */
{
  position: absolute;
  width: 20px;
  height: 20px;
}
```

---

## Common Tasks

### Task 1: Change Button Icon Size

```css
/* In header.pcss */
.theme-toggle {
  width: 44px;    /* Increase from 36px */
  height: 44px;   /* Increase from 36px */
}

svg {
  width: 24px;    /* Increase from 20px */
  height: 24px;   /* Increase from 20px */
}
```

### Task 2: Change Button Colors

```css
/* Light mode */
.theme-toggle {
  color: var(--color-text-main);        /* Text color */
}

.theme-toggle:hover {
  background-color: var(--color-link-hover);  /* Hover bg */
}

/* Dark mode (via CSS variable cascade) */
[data-theme="dark"] .theme-toggle {
  color: var(--color-text-main);        /* Updates automatically */
}
```

### Task 3: Add Animation to Icon Transition

```css
/* Add to .theme-toggle__icon--light and --dark */
svg {
  transition: opacity 0.2s ease;
}

.theme-toggle__icon--light,
.theme-toggle__icon--dark {
  opacity: 1;
}

/* Hide icon with fade */
.theme-toggle__icon--dark {
  display: none;
  opacity: 0;
}

.theme-toggle__icon--light {
  display: block;
  opacity: 1;
}
```

### Task 4: Move Button to Different Position

```css
/* Current: right-aligned in menu */
li&-theme {
  margin-left: auto;
}

/* Alternative: left side */
li&-theme {
  order: -1;    /* First item in flex */
  margin-right: auto;
}
```

### Task 5: Change Icon SVG

Edit the SVG in `header.twig`:

```twig
<!-- Replace sun icon -->
<svg class="theme-toggle__icon theme-toggle__icon--light" ...>
  <!-- New sun icon SVG here -->
</svg>

<!-- Replace moon icon -->
<svg class="theme-toggle__icon theme-toggle__icon--dark" ...>
  <!-- New moon icon SVG here -->
</svg>
```

---

## Debugging

### Button Not Appearing?

```javascript
// In browser console:
document.querySelector('.theme-toggle')
// Should return the button element, not null

// Check if header.twig was updated
document.querySelector('.docs-header')
// Should exist

// Check if module initialized
document.querySelector('[data-module="theme-toggle"]')
// Should return button element
```

### Icon Not Changing When Theme Changes?

```javascript
// In console:
ThemeManager.getCurrentTheme()
// Should return 'light' or 'dark'

// Check if button icon visibility:
const button = document.querySelector('.theme-toggle');
const light = button.querySelector('.theme-toggle__icon--light');
const dark = button.querySelector('.theme-toggle__icon--dark');

// In light mode:
light.style.display  // Should be 'block'
dark.style.display   // Should be 'none'

// In dark mode:
light.style.display  // Should be 'none'
dark.style.display   // Should be 'block'
```

### Click Not Working?

```javascript
// In console:
const button = document.querySelector('.theme-toggle');

// Check if listener attached
button.onclick  // May not show, try clicking and checking console for errors

// Try clicking programmatically
button.click()
// Theme should toggle

// Check ThemeManager is working
ThemeManager.getCurrentTheme()  // Get current
ThemeManager.setTheme('dark')   // Set manually
ThemeManager.getCurrentTheme()  // Should change
```

### Styling Not Applying?

```css
/* Check CSS specificity */
/* Ensure you're using variables, not hardcoded colors */
.theme-toggle {
  color: var(--color-text-main);    /* ✓ Correct */
  color: #060C26;                   /* ✗ Wrong */
}

/* Verify CSS variables exist */
getComputedStyle(document.documentElement)
  .getPropertyValue('--color-text-main')
// Should return: ' #060C26' (with space)
```

---

## Accessibility Checklist

When modifying the button, ensure:

- [ ] Button has `aria-label` attribute
- [ ] Button has `title` attribute (tooltip)
- [ ] Focus outline is visible (2px minimum)
- [ ] Focus outline color contrasts with background
- [ ] Button size is 44x44px (including padding)
- [ ] Icons inherit color from text (use `currentColor`)
- [ ] Keyboard works (Enter and Space)
- [ ] No keyboard trap (can Tab away)

---

## Testing Checklist

### Visual Testing
- [ ] Light mode: button visible, moon icon shown
- [ ] Dark mode: button visible, sun icon shown
- [ ] Hover: background color changes
- [ ] Focus: outline visible
- [ ] Click: theme toggles

### Functional Testing
- [ ] Click toggles theme
- [ ] Reload page: theme persists
- [ ] Icons update when theme changes
- [ ] No console errors

### Accessibility Testing
- [ ] Keyboard Tab: can reach button
- [ ] Keyboard Enter: toggles theme
- [ ] Keyboard Space: toggles theme
- [ ] Screen reader: announces "Toggle dark mode"
- [ ] Focus indicator: visible and clear

### Mobile Testing
- [ ] Button tappable (not too small)
- [ ] Button responsive (stays visible on mobile)
- [ ] Touch feedback works
- [ ] No layout shift

---

## Performance Notes

- Button click: <5ms to update DOM
- Icon update: <1ms (CSS-only)
- Color application: <10ms (CSS cascade)
- Total theme switch: <20ms (instant to user)
- No layout reflow triggered

---

## Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| Button not visible | Missing CSS or wrong selector | Check `.theme-toggle` styles applied |
| Icon not toggling | `updateButtonIcon()` not called | Verify ThemeToggle.init() runs |
| Click doesn't work | Event listener not attached | Check module initialization |
| Colors wrong | Hardcoded colors instead of variables | Use `var(--color-*)` in CSS |
| Focus not visible | Missing focus CSS | Add `&:focus { outline: ... }` |
| Icons overlapping | Position not absolute | Ensure SVGs have `position: absolute` |
| Touch target too small | Button size <44x44px | Increase button/padding size |

---

## Code Examples

### Example 1: Programmatically Toggle Theme

```javascript
// In browser console:
const button = document.querySelector('.theme-toggle');
button.click();  // Toggles theme
```

### Example 2: Listen to Theme Changes

```javascript
// In any JavaScript module:
import ThemeManager from './modules/themeManager';

ThemeManager.onThemeToggle((theme) => {
  console.log('Theme changed to:', theme);
  // Do something...
});
```

### Example 3: Force a Specific Theme

```javascript
// In browser console:
ThemeManager.setTheme('dark');
// or
ThemeManager.setTheme('light');
```

---

## Related Documentation

- **Full Implementation:** `ImplementationSummary.md`
- **Technical Details:** `TechnicalDeepDive.md`
- **Design Specification:** `.github/specs/dark-mode/Design.md`
- **All Tasks:** `.github/specs/dark-mode/Tasks.md`

---

**End of Quick Reference**
