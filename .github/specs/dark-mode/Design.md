# Dark Mode Feature - Design Document

**Status:** Planning  
**Created:** November 6, 2025  
**Version:** 1.0

## 1. Architecture Overview

The dark mode implementation uses a **CSS custom properties + JavaScript theme manager** approach, inspired by VS Code's theme system. This provides:
- Instant theme switching without page reload
- Persistent user preferences
- Minimal performance impact
- Easy maintenance and extensibility

```
┌─────────────────────────────────────────────────────┐
│                   Application                        │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ┌────────────────────────────────────────────┐    │
│  │  Theme Manager (JavaScript)                │    │
│  │  - Detect system preference                │    │
│  │  - Load saved preference                   │    │
│  │  - Apply theme class                       │    │
│  │  - Listen to toggle events                 │    │
│  └────────────────────────────────────────────┘    │
│           ↓                                         │
│  ┌────────────────────────────────────────────┐    │
│  │  DOM: [data-theme="light|dark"]            │    │
│  │  or: prefers-color-scheme media query      │    │
│  └────────────────────────────────────────────┘    │
│           ↓                                         │
│  ┌────────────────────────────────────────────┐    │
│  │  CSS Custom Properties (Variables)         │    │
│  │  :root {                                   │    │
│  │    --color-text-main: ...                  │    │
│  │    --color-bg-main: ...                    │    │
│  │  }                                         │    │
│  │  [data-theme="dark"] {                     │    │
│  │    --color-text-main: ...                  │    │
│  │    --color-bg-main: ...                    │    │
│  │  }                                         │    │
│  └────────────────────────────────────────────┘    │
│           ↓                                         │
│  ┌────────────────────────────────────────────┐    │
│  │  Component Styles (Use CSS Variables)      │    │
│  │  color: var(--color-text-main);            │    │
│  │  background: var(--color-bg-main);         │    │
│  └────────────────────────────────────────────┘    │
│                                                      │
└─────────────────────────────────────────────────────┘
```

## 2. Color Palette

### 2.1 Light Mode (Existing)
```css
:root {
  /* Text Colors */
  --color-text-main: #060C26;          /* Dark blue-black */
  --color-text-second: #717682;        /* Medium gray */

  /* Background Colors */
  --color-bg-light: #f8f7fa;           /* Off-white */
  --color-bg-main: #ffffff;            /* White */

  /* UI Elements */
  --color-line-gray: #E8E8EB;          /* Light gray border */
  --color-link-active: #2071cc;        /* Blue link */
  --color-link-hover: #F3F6F8;         /* Light hover */

  /* Input Colors */
  --color-input-primary: #F3F6F8;      /* Light input background */
  --color-input-border: #477CFF;       /* Blue input border */

  /* Status Colors */
  --color-page-active: #ff1767;        /* Pink active */
  --color-success: #00e08f;            /* Green success */

  /* Code Block Colors (Already supports dark backgrounds) */
  --color-code-bg: #252935;
  --color-code-main: #E1EBFE;
  /* ... other code colors ... */
}
```

### 2.2 Dark Mode (New)
```css
[data-theme="dark"] {
  /* Text Colors - VS Code inspired */
  --color-text-main: #E0E0E0;          /* Light gray */
  --color-text-second: #A0A0A0;        /* Medium gray */

  /* Background Colors - VS Code inspired */
  --color-bg-light: #2D2D30;           /* Slightly lighter than main */
  --color-bg-main: #1E1E1E;            /* VS Code dark background */

  /* UI Elements */
  --color-line-gray: #3E3E42;          /* Dark gray border */
  --color-link-active: #569CD6;        /* VS Code blue */
  --color-link-hover: #252526;         /* Almost black hover */

  /* Input Colors */
  --color-input-primary: #3C3C3C;      /* Dark input background */
  --color-input-border: #007ACC;       /* VS Code blue border */

  /* Status Colors */
  --color-page-active: #FF1777;        /* Lighter pink for contrast */
  --color-success: #4EC9B0;            /* Teal success */

  /* Code Block Colors - Already supports dark */
  /* (May need slight adjustments for contrast) */
}
```

### 2.3 System Preference Fallback
```css
@media (prefers-color-scheme: dark) {
  :root {
    /* Apply dark colors if no explicit theme is set */
  }
}
```

## 3. Component Architecture

### 3.1 Theme Manager Module (`src/frontend/js/modules/themeManager.js`)

**Responsibilities:**
- Detect system dark mode preference
- Load saved user preference from localStorage
- Apply theme to DOM
- Listen to theme toggle events
- Broadcast theme change events

**Key Methods:**
```javascript
class ThemeManager {
  // Initialize theme on app startup
  init()

  // Get current theme ('light' or 'dark')
  getCurrentTheme()

  // Set theme and persist
  setTheme(theme)

  // Detect system preference
  getSystemPreference()

  // Check if user has saved preference
  hasSavedPreference()

  // Listen for toggle events
  onThemeToggle(callback)

  // Fire theme change event
  emitThemeChange(theme)
}
```

### 3.2 Theme Toggle Component (Header Update)

**Location:** `src/frontend/views/components/header.twig`

**Changes:**
- Add theme toggle button next to existing header controls
- Button shows sun/moon icon based on current theme
- Accessible button with aria-label and keyboard support
- Emit `themeToggle` event when clicked

**HTML Structure:**
```html
<button class="theme-toggle" aria-label="Toggle dark mode" title="Toggle theme">
  <svg class="theme-toggle__icon" data-icon="sun-for-light-mode"><!-- SVG --></svg>
  <svg class="theme-toggle__icon" data-icon="moon-for-dark-mode"><!-- SVG --></svg>
</button>
```

### 3.3 CSS Structure

**Base Variables:** `src/frontend/styles/vars.pcss`
- Define all color variables in `:root`
- Include system preference fallback with `@media (prefers-color-scheme: dark)`

**Dark Mode Overrides:** `src/frontend/styles/dark-mode.pcss`
- Define dark theme colors under `[data-theme="dark"]` selector
- Import this file in `main.pcss` after `vars.pcss`

**Component Updates:**
- Update all `.pcss` files to use CSS variables instead of hardcoded colors
- Example migration:
  ```css
  /* Before */
  .header { background: #ffffff; }

  /* After */
  .header { background: var(--color-bg-main); }
  ```

## 4. Implementation Flow

### 4.1 Application Startup
```
1. HTML body loads with no data-theme attribute
2. ThemeManager.init() is called from app.js
   a. Check localStorage for saved theme
   b. If saved theme exists, use it
   c. If not, check system preference via prefers-color-scheme
   d. Apply chosen theme to document.documentElement
3. DOM renders with theme colors applied
4. Header renders with theme toggle button
5. User can click toggle to switch theme
```

### 4.2 Theme Switch Flow
```
1. User clicks theme toggle button
2. Header emits 'themeToggle' event
3. ThemeManager listens for 'themeToggle' event
4. ThemeManager.setTheme(newTheme)
   a. Update document.documentElement[data-theme]
   b. Save to localStorage
   c. Emit 'themeChange' event
5. CSS updates instantly via :root variables
6. Components auto-update (no JS re-render needed)
```

### 4.3 Page Reload
```
1. Page loads
2. ThemeManager.init() reads localStorage
3. Applies saved theme before DOM renders
4. No flash of wrong theme (FOUC prevention)
```

## 5. CSS Variable Migration Strategy

### Phase 1: Variables Definition
- Update `vars.pcss` to add all CSS variables
- Define both light and dark values
- No component changes yet

### Phase 2: Component Gradual Update
- Update high-impact components first:
  1. `header.pcss`
  2. `page.pcss`
  3. `sidebar.pcss`
  4. `button.pcss`
  5. `auth.pcss`
  6. Other components

### Phase 3: Testing & Refinement
- Test all components in both themes
- Adjust colors for accessibility
- Fix any visual inconsistencies

## 6. Accessibility Considerations

### 6.1 Color Contrast
All text must meet WCAG AA standards (4.5:1 for normal text, 3:1 for large text):
- Light mode text (#060C26) on white: ✓ High contrast
- Dark mode text (#E0E0E0) on #1E1E1E: ✓ High contrast (~13:1)
- Secondary text requires validation
- Link colors require validation

### 6.2 Focus States
- Theme toggle button maintains visible focus indicator
- Focus visible in both light and dark modes
- No hidden focus states

### 6.3 ARIA Labels
- Toggle button has `aria-label="Toggle dark mode"`
- Current theme state announced via label or live region
- Screen readers announce theme changes

## 7. Performance Considerations

### 7.1 Optimization Techniques
1. **CSS Variables**: Native browser support, no runtime calculations
2. **No JavaScript Calculations**: Colors are pre-defined, not computed
3. **Single DOM Update**: Only update `data-theme` attribute, CSS cascades
4. **Lazy Initialization**: ThemeManager loads only when needed

### 7.2 Performance Targets
- Theme detection: < 5ms
- Theme application: < 100ms (perceived instant)
- No layout recalculation (colors-only changes)
- Zero layout shift (FOUC prevention)

### 7.3 Browser Paint Optimization
```javascript
// Prevent FOUC by applying theme synchronously
document.documentElement.setAttribute('data-theme', theme);
// Browser immediately updates custom properties
// All elements using var(--color-*) update instantly
```

## 8. Browser Support

| Browser | Support | Notes |
|---------|---------|-------|
| Chrome/Edge 55+ | ✓ Full | CSS variables supported |
| Firefox 31+ | ✓ Full | CSS variables supported |
| Safari 9.1+ | ✓ Full | CSS variables supported |
| IE 11 | ✗ Fallback | No CSS variable support |

**Fallback for older browsers:**
- Apply light mode by default
- Theme toggle disabled or shows warning
- Page remains fully functional

## 9. Testing Strategy

### 9.1 Unit Tests
- ThemeManager initialization logic
- Theme persistence (localStorage)
- System preference detection
- Event emission

### 9.2 Visual Regression Tests
- All components in light mode
- All components in dark mode
- Theme toggle interaction
- Page reload persistence

### 9.3 Accessibility Tests
- Color contrast validation
- Keyboard navigation
- Screen reader announcement
- Focus management

### 9.4 Integration Tests
- End-to-end theme switching
- Persistence across page reloads
- Multiple page navigation
- localStorage quota limits

## 10. Future Enhancements

- Per-component theme customization
- Custom theme creation UI
- Theme preview before apply
- Auto-switch based on time of day
- Backend preference persistence
- Per-page theme overrides
- Theme export/import functionality
