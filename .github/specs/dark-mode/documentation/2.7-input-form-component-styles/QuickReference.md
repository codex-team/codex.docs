# Task 2.7: Input/Form Component Styles - Quick Reference

**Document Version:** 1.0  
**Created:** November 7, 2025  
**Status:** ✅ COMPLETE

---

## Quick Navigation

### Key Files Modified
- `src/frontend/styles/vars.pcss` - Light mode CSS variables
- `src/frontend/styles/dark-mode.pcss` - Dark mode CSS variables
- `src/frontend/styles/components/writing.pcss` - Component styling

### New CSS Variables
```css
--color-writing-header-bg       /* Background color for writing header */
--color-writing-header-shadow   /* Shadow color for writing header */
```

---

## CSS Variables Reference

### Light Mode (`vars.pcss`)
```css
:root {
  --color-writing-header-bg: #ffffff;
  --color-writing-header-shadow: #ffffff;
}
```

### Dark Mode (`dark-mode.pcss`)
```css
[data-theme="dark"] {
  --color-writing-header-bg: #2D2D30;
  --color-writing-header-shadow: rgba(0, 0, 0, 0.3);
}
```

### System Preference Fallback
```css
@media (prefers-color-scheme: dark) {
  :root {
    --color-writing-header-bg: #2D2D30;
    --color-writing-header-shadow: rgba(0, 0, 0, 0.3);
  }
}
```

---

## Component Usage

### Writing Header (Updated)
```css
.writing-header {
  background: var(--color-writing-header-bg);
  box-shadow: 0 3px 10px var(--color-writing-header-shadow);
}
```

### Form Inputs (Already Supporting Dark Mode)
```css
/* Select dropdowns */
select {
  @apply --select;  /* Uses CSS variables from vars.pcss */
}

/* Text inputs */
input {
  @apply --input;   /* Uses CSS variables from vars.pcss */
}
```

---

## How Dark Mode Works

### Theme Toggle Flow
```
User clicks toggle button
         ↓
ThemeManager.setTheme(newTheme)
         ↓
document.documentElement.setAttribute('data-theme', theme)
         ↓
CSS custom properties update instantly
         ↓
All components using var(--color-*) update
```

### Component Automatic Update
```css
.writing-header {
  background: var(--color-writing-header-bg);  /* Updates with theme */
}

/* Light mode: #ffffff */
/* Dark mode: #2D2D30 */
/* System preference: #2D2D30 (if no saved theme) */
```

---

## Usage Examples

### Adding Dark Mode Support to New Components

**Step 1: Define CSS Variables**
```css
/* In vars.pcss - Light mode */
:root {
  --color-my-component-bg: #ffffff;
  --color-my-component-text: #000000;
}
```

**Step 2: Define Dark Mode Overrides**
```css
/* In dark-mode.pcss - Dark mode */
[data-theme="dark"] {
  --color-my-component-bg: #2D2D30;
  --color-my-component-text: #E0E0E0;
}
```

**Step 3: Use Variables in Component**
```css
/* In components/my-component.pcss */
.my-component {
  background: var(--color-my-component-bg);
  color: var(--color-my-component-text);
}
```

---

## Testing Checklist

### Visual Testing
- [ ] Writing header background in light mode (white)
- [ ] Writing header background in dark mode (dark gray)
- [ ] Shadow effect visible in both themes
- [ ] No visual glitches during theme toggle
- [ ] Text contrast acceptable

### Functionality Testing
- [ ] Form inputs accept text
- [ ] Select dropdowns function correctly
- [ ] Focus states work correctly
- [ ] Theme toggle updates writing header
- [ ] Page reload maintains saved theme

### Browser Testing
- [ ] Chrome/Chromium
- [ ] Firefox
- [ ] Safari
- [ ] Edge

### Accessibility Testing
- [ ] Text contrast meets WCAG AA (4.5:1)
- [ ] Text contrast meets WCAG AAA (7:1)
- [ ] Focus indicators visible
- [ ] Keyboard navigation works
- [ ] Screen reader reads content correctly

---

## Debugging Tips

### Theme Not Applying to Writing Header
**Check:**
1. CSS custom properties defined in both `vars.pcss` and `dark-mode.pcss`
2. Component uses `var(--color-writing-header-bg)` instead of hardcoded color
3. CSS compiled successfully (`npm run build-frontend`)
4. Browser cache cleared (hard refresh: Ctrl+Shift+R)

**Solution:**
```bash
# Clear build and rebuild
rm -rf dist && npm run build-frontend && npm run build-backend
```

### Writing Header Color Incorrect
**Check:**
1. Verify `dark-mode.pcss` has correct color value
2. Check if `data-theme="dark"` attribute applied to root element
3. Verify system preference fallback in `dark-mode.pcss`

**Debug in Browser Console:**
```javascript
// Check current theme
document.documentElement.getAttribute('data-theme')

// Check computed CSS variable
getComputedStyle(document.documentElement)
  .getPropertyValue('--color-writing-header-bg')
```

### CSS Variables Not Updating
**Possible Causes:**
1. CSS not recompiled - run `npm run build-frontend`
2. Browser cache - hard refresh (Ctrl+Shift+R)
3. CSS selector specificity - check if other rules override
4. PostCSS compilation error - check build output

---

## Color Palette Reference

### Light Mode
| Element | Variable | Light Value |
|---------|----------|-------------|
| Header Background | `--color-writing-header-bg` | `#ffffff` |
| Header Shadow | `--color-writing-header-shadow` | `#ffffff` |
| Input Background | `--color-input-primary` | `#F3F6F8` |
| Input Border | `--color-input-border` | `#477CFF` |
| Text Main | `--color-text-main` | `#060C26` |

### Dark Mode
| Element | Variable | Dark Value |
|---------|----------|------------|
| Header Background | `--color-writing-header-bg` | `#2D2D30` |
| Header Shadow | `--color-writing-header-shadow` | `rgba(0, 0, 0, 0.3)` |
| Input Background | `--color-input-primary` | `#3C3C3C` |
| Input Border | `--color-input-border` | `#007ACC` |
| Text Main | `--color-text-main` | `#E0E0E0` |

---

## Common Tasks

### Add Support for New Form Element
1. Create CSS variable in `vars.pcss` (light mode)
2. Add dark mode override in `dark-mode.pcss`
3. Update component to use `var(--color-*)`
4. Test in both themes
5. Update this documentation

### Change Writing Header Color
1. Update value in `vars.pcss` for light mode
2. Update corresponding value in `dark-mode.pcss` for dark mode
3. Run `npm run build-frontend`
4. Test in browser (hard refresh)

### Verify Theme Support
```css
/* Before (not supporting dark mode) */
.element { color: #000; }

/* After (supporting dark mode) */
.element { color: var(--color-text-main); }

/* In vars.pcss */
--color-text-main: #000;     /* Light mode */

/* In dark-mode.pcss */
--color-text-main: #E0E0E0;  /* Dark mode */
```

---

## Performance Tips

### CSS Variables Best Practices
1. Define at root level (`:root`) for global inheritance
2. Use computed/cache values when possible
3. Avoid redundant variable definitions
4. Group related variables together

### Optimal Theme Application
```css
/* Good: CSS variables (native browser support) */
.header { background: var(--color-writing-header-bg); }

/* Avoid: JavaScript calculations */
const color = darkMode ? '#2D2D30' : '#ffffff';

/* Avoid: Multiple property changes */
.header { background: #fff; }
.header { background: #2D2D30; }  /* Override */
```

---

## Related Documentation

- **Implementation Summary:** See `ImplementationSummary.md`
- **Technical Deep Dive:** See `TechnicalDeepDive.md`
- **Button Components:** See `../2.6-button-component-styles/`
- **CSS Variables:** See `../1.2-css-variables-infrastructure/`
- **Theme Manager:** See `../1.1-theme-manager-foundation/`

---

## Frequently Asked Questions

**Q: Why add new CSS variables if writing-header only needs 2 changes?**  
A: Variables enable future maintenance, prevent regressions, and allow for easy customization.

**Q: What if system preference changes while app is running?**  
A: App listens to `prefers-color-scheme` changes and updates automatically.

**Q: Can users customize form colors?**  
A: Currently uses predefined variables. Custom theming could be added in future.

**Q: Do CSS variables work in all browsers?**  
A: Yes, modern browsers (Chrome 49+, Firefox 31+, Safari 9.1+, Edge 15+).

**Q: Is there a performance penalty?**  
A: No, CSS variables are natively supported and incur no runtime cost.

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Nov 7, 2025 | Initial release |

---

## Support

For issues or questions about form component styling:
1. Check `ImplementationSummary.md` for detailed overview
2. Review `TechnicalDeepDive.md` for architecture
3. Debug using Chrome DevTools (inspect computed CSS variables)
4. Check browser console for errors
