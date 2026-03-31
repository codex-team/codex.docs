# CSS Variables Infrastructure - Technical Deep Dive

**Task:** 1.2 - Define CSS Custom Properties for Colors  
**Version:** 1.0  
**Last Updated:** November 6, 2025  
**Audience:** Front-end developers, CSS architects, theme maintainers

---

## Table of Contents

1. [CSS Custom Properties Overview](#css-custom-properties-overview)
2. [Variable Architecture](#variable-architecture)
3. [Color System Design](#color-system-design)
4. [Cascade and Specificity](#cascade-and-specificity)
5. [Implementation Patterns](#implementation-patterns)
6. [Browser Compatibility](#browser-compatibility)
7. [Performance Characteristics](#performance-characteristics)
8. [System Preference Integration](#system-preference-integration)
9. [Advanced Techniques](#advanced-techniques)
10. [Future Enhancements](#future-enhancements)

---

## CSS Custom Properties Overview

### What Are CSS Variables?

CSS Custom Properties (CSS Variables) are native CSS features that allow defining reusable values. They're part of the CSS spec and supported in all modern browsers.

**Syntax:**
```css
/* Define a variable */
--variable-name: value;

/* Use a variable */
property: var(--variable-name);

/* Provide fallback */
property: var(--variable-name, fallback-value);
```

**Key Characteristics:**
- Native browser feature (no compilation needed)
- Can be scoped (global or component-level)
- Can be changed dynamically via JavaScript
- Support inheritance
- Support cascading
- Support CSS functions like `calc()`

### Why CSS Variables Over Other Approaches?

**Comparison Table:**

| Feature | Approach | Pros | Cons |
|---------|----------|------|------|
| **CSS Variables** | Native CSS | Runtime change, no build, cascade | Browser support (98% modern) |
| **SASS Variables** | Preprocessor | Strong tooling | Compiled at build time, can't change runtime |
| **CSS-in-JS** | JavaScript | Dynamic, scoped | Complexity, performance overhead |
| **Theme CSS files** | Multiple files | Simple | Duplication, hard to maintain |
| **CSS Classes** | Class switching | Specific override | Not granular, multiple selectors |

**Decision:** CSS Variables are ideal because:
- ✅ Change at runtime (no page reload)
- ✅ No build step required
- ✅ Native browser support
- ✅ Clean syntax
- ✅ Cascade-friendly
- ✅ Works with existing SASS/PostCSS pipeline

---

## Variable Architecture

### Scope Hierarchy

CSS variables inherit from parent elements, following the DOM hierarchy:

```
Window/Document Root (:root)
    ↓
Specific Themes ([data-theme="dark"])
    ↓
Components (<div class="sidebar">)
    ↓
Sub-components (<button class="btn">)
```

### Definition Structure

**Scope 1: Global Scope (vars.pcss)**
```css
:root {
  /* All variables accessible everywhere */
  --color-text-main: #060C26;
  --color-bg-main: #ffffff;
}
```

**Properties:**
- Defined on root element (entire document)
- Highest level in hierarchy
- Inherited by all elements
- Fallback when no overrides present

**Scope 2: Theme Scope (dark-mode.pcss)**
```css
[data-theme="dark"] {
  /* Only applies when data-theme="dark" */
  --color-text-main: #E0E0E0;
  --color-bg-main: #1E1E1E;
}
```

**Properties:**
- Overrides root values when condition matches
- More specific selector (attribute selector)
- Only affects descendant elements
- Can be applied to any element (not just root)

**Scope 3: System Preference (dark-mode.pcss)**
```css
@media (prefers-color-scheme: dark) {
  :root {
    /* Applies when system prefers dark */
    --color-text-main: #E0E0E0;
    --color-bg-main: #1E1E1E;
  }
}
```

**Properties:**
- Media query scope (lowest specificity override)
- Browser/OS-controlled
- Progressive enhancement fallback
- Graceful degradation

### Inheritance Rules

CSS variables follow CSS inheritance rules:

```html
<div style="--color: blue">      <!-- Define variable -->
  <p>Text color: blue</p>        <!-- Inherits variable -->
  
  <div style="--color: red">     <!-- Override variable -->
    <p>Text color: red</p>       <!-- Inherits override -->
  </div>
</div>
```

**Code Example:**
```css
/* Define at body level */
body {
  --color-text-main: #060C26;
}

/* Auto-inherited by children */
p {
  color: var(--color-text-main);  /* Gets body's value */
}

/* Scoped override */
.dark-section {
  --color-text-main: #E0E0E0;     /* Override just in this section */
}

.dark-section p {
  color: var(--color-text-main);  /* Gets .dark-section value */
}
```

**Cascade Priority (Highest to Lowest):**
```
1. Inline styles          (style="--color: red")
2. Attribute selectors    ([data-theme="dark"])
3. Class selectors        (.dark-mode)
4. Element selectors      (div)
5. Media queries          (@media)
6. :root                  (:root)
```

---

## Color System Design

### Semantic Naming Convention

**Pattern:** `--color-{element}-{state}`

**Components:**

| Component | Purpose | Examples |
|-----------|---------|----------|
| `color-` | Prefix | All color variables start with this |
| `{element}` | What the color applies to | text, bg, button, link, input |
| `-{state}` | Optional state modifier | active, hover, disabled, focus |

**Examples:**
```
--color-text-main       (main text - no state)
--color-text-second     (secondary text - different element, no state)
--color-button-primary  (button type - no state)
--color-button-primary-hover       (button type + state)
--color-button-primary-active      (button type + state)
--color-input-border    (input element + state)
--color-code-keyword    (code syntax + element)
```

**Anti-Patterns to Avoid:**
```css
/* ❌ Not semantic - doesn't indicate purpose */
--color-blue
--color-#2071cc
--color-1

/* ❌ Too specific - hard to reuse */
--color-link-in-header
--color-button-in-navbar

/* ✅ Semantic - indicates purpose and reuse */
--color-link-active
--color-button-primary
```

### Color Functional Groups

Colors are organized by functional purpose:

**Group 1: Text Colors**
```css
--color-text-main       /* Primary content text */
--color-text-second     /* Secondary/metadata text */
```

**Group 2: Backgrounds**
```css
--color-bg-main         /* Primary page background */
--color-bg-light        /* Secondary/container background */
```

**Group 3: UI Elements**
```css
--color-line-gray       /* Borders, dividers, lines */
--color-link-active     /* Links and active states */
--color-link-hover      /* Hover background */
```

**Group 4: Form Inputs**
```css
--color-input-primary   /* Input field background */
--color-input-border    /* Input border (focus) */
```

**Group 5: Status/Feedback**
```css
--color-page-active     /* Active page indicator */
--color-success         /* Success/positive state */
```

**Group 6: Code Syntax**
```css
--color-code-bg         /* Code block background */
--color-code-main       /* Code block text */
--color-code-keyword    /* Keywords */
--color-code-string     /* Strings */
--color-code-comment    /* Comments */
/* ... 5 more syntax colors */
```

**Group 7: Buttons**
```css
--color-button-primary
--color-button-primary-hover
--color-button-primary-active
--color-button-secondary        /* Button variant */
--color-button-secondary-hover
--color-button-secondary-active
--color-button-warning          /* Status variant */
--color-button-warning-hover
--color-button-warning-active
```

**Organization Benefits:**
- Related colors are grouped together
- Easy to locate and update
- Clear responsibility boundaries
- Aligns with component structure

---

## Cascade and Specificity

### Selector Specificity

**Specificity Calculation:**
```css
/* Specificity: 0, 0, 0 (least specific) */
:root { --color: red; }

/* Specificity: 0, 1, 0 (attribute selector) */
[data-theme="dark"] { --color: blue; }

/* Specificity: 0, 1, 1 (attribute + element) */
body[data-theme="dark"] { --color: green; }

/* Specificity: 0, 2, 0 (two attributes) */
[data-theme="dark"][lang="en"] { --color: purple; }
```

### Resolution Priority

**Example Scenario:**

```html
<html style="--color-text: yellow">
  <body data-theme="dark">
    <div class="sidebar">
      <p>Text here</p>
    </div>
  </body>
</html>
```

**CSS:**
```css
:root {
  --color-text: #060C26;
}

[data-theme="dark"] {
  --color-text: #E0E0E0;
}

.sidebar {
  --color-text: #808080;
}

p {
  color: var(--color-text);
}
```

**Resolution Process:**

| Level | Selector | Value | Applied? |
|-------|----------|-------|----------|
| 1 | inline style | yellow | ✗ (lowest priority) |
| 2 | .sidebar | #808080 | ✓ (highest in cascade) |
| 3 | [data-theme="dark"] | #E0E0E0 | ✗ (lower priority than .sidebar) |
| 4 | :root | #060C26 | ✗ (overridden) |

**Result:** `<p>` text is `#808080` (from .sidebar scope)

### Important Considerations

**Inheritance Quirk:** Variables only inherit; they don't force re-evaluation
```css
:root {
  --size: 10px;
  margin: calc(var(--size) * 2);  /* Calculated at :root = 20px */
}

div {
  --size: 20px;                   /* Override doesn't recalculate margin */
  margin: calc(var(--size) * 2);  /* Must be re-declared = 40px */
}
```

**Fallback Chains:**
```css
p {
  /* Fallback chain: try primary, then secondary, then default */
  color: var(--color-primary, var(--color-secondary, blue));
}
```

**Invalid Values:**
```css
:root {
  --color: 10px;  /* Valid: stores string "10px" */
}

p {
  width: var(--color);  /* Invalid in width context - uses fallback or initial */
}
```

---

## Implementation Patterns

### Pattern 1: Color System Matrix

**Structure:** Different colors for different contexts

```css
:root {
  /* Primary text */
  --color-text-main: #060C26;
  
  /* Secondary text */
  --color-text-second: #717682;
  
  /* Background */
  --color-bg-main: #ffffff;
}

[data-theme="dark"] {
  --color-text-main: #E0E0E0;
  --color-text-second: #A0A0A0;
  --color-bg-main: #1E1E1E;
}
```

**Usage:**
```css
body {
  background: var(--color-bg-main);
  color: var(--color-text-main);
}

.metadata {
  color: var(--color-text-second);
}
```

### Pattern 2: State-Based Colors

**Structure:** Variations for interactive states

```css
:root {
  --color-button-primary: #3389FF;
  --color-button-primary-hover: #2E7AE6;
  --color-button-primary-active: #296DCC;
}

[data-theme="dark"] {
  --color-button-primary: #0E639C;
  --color-button-primary-hover: #1177BB;
  --color-button-primary-active: #007ACC;
}
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

### Pattern 3: Component-Level Scope

**Structure:** Variables scoped to component container

```css
.sidebar {
  --color-bg: var(--color-bg-light);
  --color-text: var(--color-text-main);
  
  background: var(--color-bg);
  color: var(--color-text);
}

/* Dark theme override just in sidebar */
[data-theme="dark"] .sidebar {
  --color-bg: var(--color-bg-light);     /* Uses dark-mode value of --color-bg-light */
  --color-text: var(--color-text-main);  /* Uses dark-mode value of --color-text-main */
}
```

### Pattern 4: Dynamic Runtime Changes

**JavaScript Example:**
```javascript
// Change theme
document.documentElement.setAttribute('data-theme', 'dark');

// Remove theme (use system preference)
document.documentElement.removeAttribute('data-theme');

// Set custom variable
document.documentElement.style.setProperty('--color-custom', '#FF0000');

// Get current value
const color = getComputedStyle(document.documentElement)
  .getPropertyValue('--color-text-main')
  .trim();
```

### Pattern 5: Fallback Values

**Structure:** Graceful degradation

```css
/* Primary definition */
p {
  color: var(--color-text-main, #060C26);
}

/* Fallback to related variable */
p {
  color: var(--color-text-main, var(--color-text-second, #717682));
}

/* Fallback with calc() */
p {
  font-size: var(--font-size, calc(1rem * 1.2));
}
```

---

## Browser Compatibility

### Modern Browser Support

**CSS Custom Properties Support:**
- ✅ Chrome 49+
- ✅ Firefox 31+
- ✅ Safari 9.1+
- ✅ Edge 15+
- ✅ Opera 36+
- ⚠️ IE 11: NOT SUPPORTED

**Can I Use:** 98%+ of modern browsers (excludes IE)

### Polyfill Strategy

For IE 11 support (if needed):

**Option 1: CSS Variables Polyfill**
```html
<!-- For IE 11 -->
<script src="https://cdn.jsdelivr.net/npm/css-vars-ponyfill@2"></script>
<script>
  cssVars({
    onlyLegacy: true,
    preserveStatic: true
  });
</script>
```

**Option 2: Progressive Enhancement**
```css
/* Fallback for IE */
p {
  color: #060C26;  /* Hard fallback */
  color: var(--color-text-main);  /* Modern browsers use this */
}
```

**Option 3: Light Mode Default**
```css
:root {
  --color-text-main: #060C26;
}

/* IE 11 gets light mode always (defined at top) */
/* Modern browsers with JavaScript can change theme */
```

**Recommendation:** Light mode as default + modern browser requirement

### Known Limitations

**Limitation 1: Media Query Time Resolution**
```css
@media (prefers-color-scheme: dark) {
  :root {
    --color-text: #E0E0E0;
  }
}

/* Variables resolved at query evaluation time, not at use time */
```

**Limitation 2: Invalid Values**
```css
:root {
  --size: invalid;  /* Stores as-is (valid in custom properties) */
}

div {
  width: var(--size);  /* Invalid context - property ignored */
}
```

**Limitation 3: Syntax Restrictions**
```css
:root {
  --color: red blue;     /* ✓ Valid - stores literal value */
  --color: url(*.svg);   /* ✓ Valid */
  --color: ;             /* ✓ Valid (empty) */
}
```

---

## Performance Characteristics

### Performance Benefits

**Advantage 1: Lazy Evaluation**
```
Traditional SASS:
  ✗ All colors compiled to CSS at build time
  ✗ Recompile needed for any color change
  ✗ Build step required
  
CSS Variables:
  ✓ Evaluated at runtime
  ✓ Change without rebuild
  ✓ No build step
```

**Advantage 2: Reduced CSS Output**
```
No duplication needed:
  
Traditional Theme CSS Files:
  light-theme.css (50 KB)
  dark-theme.css  (50 KB)
  Total: 100 KB
  
CSS Variables:
  main.css        (50 KB, one copy with variables)
  Total: 50 KB
  
Savings: 50% file size reduction
```

**Advantage 3: Minimal Repaints**
```javascript
/* One variable change triggers minimal repaints */
document.documentElement.style.setProperty('--color-bg-main', '#000000');

/* Browser repaints only affected elements */
/* More efficient than class switching on body */
```

### Performance Costs

**Cost 1: Variable Resolution**
- Each variable lookup has small overhead
- Modern browsers optimize heavily
- Impact negligible for typical usage (< 1ms)

**Cost 2: Computed Style Lookups**
```javascript
/* Expensive - don't do in loop */
for (let i = 0; i < 1000000; i++) {
  getComputedStyle(el).getPropertyValue('--color');
}

/* Better - cache result */
const color = getComputedStyle(el).getPropertyValue('--color');
```

**Cost 3: Complex Calculations**
```css
/* Small overhead */
background: var(--color-bg);

/* Slightly higher overhead (but still negligible) */
background: linear-gradient(45deg, var(--color-1), var(--color-2));
```

### Optimization Strategies

**Strategy 1: Batch Variable Updates**
```javascript
/* Inefficient - multiple layouts */
el1.style.setProperty('--color-1', 'red');
el2.style.setProperty('--color-2', 'blue');
el3.style.setProperty('--color-3', 'green');

/* Better - single root update */
document.documentElement.style.setProperty('--color-main', 'red');
```

**Strategy 2: Cache Computed Values**
```javascript
/* Cache computed style */
class ThemeManager {
  constructor() {
    this.computedStyle = getComputedStyle(document.documentElement);
  }
  
  getCurrentColor(varName) {
    return this.computedStyle.getPropertyValue(varName).trim();
  }
}
```

**Strategy 3: Use CSS Variables Strategically**
```css
/* ✓ Use for theme colors (changes rarely) */
body { background: var(--color-bg); }

/* ✓ Use for component variants */
.button { background: var(--color-button); }

/* ✗ Avoid for dynamic animations */
@keyframes slide {
  from { x: var(--slide-distance); }  /* Not recommended */
  to { x: 0; }
}
```

---

## System Preference Integration

### Media Query Mechanism

**How It Works:**

```css
@media (prefers-color-scheme: dark) {
  /* Applied when browser/OS indicates dark preference */
  :root {
    --color-text-main: #E0E0E0;
    --color-bg-main: #1E1E1E;
  }
}

@media (prefers-color-scheme: light) {
  /* Applied when browser/OS indicates light preference */
  :root {
    --color-text-main: #060C26;
    --color-bg-main: #ffffff;
  }
}

@media (prefers-color-scheme: no-preference) {
  /* Applied when browser can't determine preference */
  :root {
    --color-text-main: #060C26;  /* Default to light */
    --color-bg-main: #ffffff;
  }
}
```

### Browser Detection

**How Browsers Determine Preference:**

| OS | Detection Method |
|----|------------------|
| **Windows 10+** | Settings > Personalization > Colors |
| **macOS** | System Preferences > General > Appearance |
| **iOS** | Settings > Display & Brightness |
| **Android** | Developer Options > Night Light or System theme |
| **Linux** | GTK/Qt desktop environment setting |

**Testing in Browser:**

```javascript
/* Check system preference */
if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
  console.log('System prefers dark mode');
}

/* Listen for changes */
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
  console.log('System preference changed to:', e.matches ? 'dark' : 'light');
});
```

### Override Strategy

**Priority in CodeX Docs:**

```
1. User's explicit choice (data-theme attribute) [HIGHEST]
   └─ Set by ThemeManager when user clicks toggle
   
2. System preference (media query evaluation)
   └─ Browser detects OS-level preference
   
3. Default light mode (:root variables) [LOWEST]
   └─ Fallback if everything else fails
```

**Implementation:**

```css
/* Level 1: Default light mode */
:root {
  --color-text-main: #060C26;
}

/* Level 2: System preference (no JavaScript needed) */
@media (prefers-color-scheme: dark) {
  :root {
    --color-text-main: #E0E0E0;
  }
}

/* Level 3: User explicit choice (data-theme attribute) */
[data-theme="dark"] {
  --color-text-main: #E0E0E0;
}
```

---

## Advanced Techniques

### Technique 1: Calculated Colors with CSS calc()

**Dynamic Color Adjustments:**

```css
:root {
  --color-opacity: 0.8;
}

.component {
  /* Calculate opacity dynamically */
  background: rgba(var(--color-value), calc(var(--color-opacity) * 1));
}
```

**Limitation:** Cannot use with color functions directly
```css
/* ✗ Won't work - hex values in calc() */
background: calc(var(--color-hex) * 1.1);

/* ✓ Works with numeric values */
background: rgb(
  calc(var(--color-r) * 1.1),
  calc(var(--color-g) * 1.1),
  calc(var(--color-b) * 1.1)
);
```

### Technique 2: Feature Queries

**Conditional Variable Support:**

```css
/* Check if browser supports CSS variables */
@supports (--css: variables) {
  :root {
    --color-text-main: #060C26;
  }
  
  body {
    color: var(--color-text-main);
  }
}

/* Fallback for browsers without support */
@supports not (--css: variables) {
  body {
    color: #060C26;
  }
}
```

### Technique 3: Component-Level Theme

**Scoped Color Override:**

```css
.modal {
  --color-bg: var(--color-bg-light);
  --color-text: var(--color-text-main);
  --color-border: var(--color-line-gray);
  
  background: var(--color-bg);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

/* Modal gets dark theme styling automatically */
[data-theme="dark"] .modal {
  /* Variables automatically use dark values */
}
```

### Technique 4: Conditional Variables

**JavaScript-Driven Variables:**

```javascript
class ThemeSystem {
  static setTheme(theme) {
    if (theme === 'dark') {
      document.documentElement.style.setProperty('--color-theme', 'dark');
    } else {
      document.documentElement.style.removeProperty('--color-theme');
    }
  }
  
  static setCustomColor(element, color) {
    element.style.setProperty('--component-color', color);
  }
}
```

**CSS Usage:**
```css
.button {
  background: var(--component-color, var(--color-button-primary));
}
```

### Technique 5: Variable Aliases

**Creating Shortcuts:**

```css
:root {
  /* Primary definitions */
  --color-primary: #3389FF;
  --color-secondary: #717682;
  
  /* Aliases for common uses */
  --button-bg: var(--color-primary);
  --button-hover: var(--color-primary-hover);
  --text-color: var(--color-text-main);
}
```

**Benefit:** Easier to update usage pattern
```css
/* Instead of referencing multiple primary variables */
.button { background: var(--button-bg); }
```

---

## Future Enhancements

### Enhancement 1: Multi-Theme Support

**Current:** Light + Dark

**Future:** Light, Dark, High Contrast, Sepia, etc.

```css
/* Add new themes */
[data-theme="high-contrast"] {
  --color-text-main: #000000;
  --color-bg-main: #FFFFFF;
}

[data-theme="sepia"] {
  --color-text-main: #704214;
  --color-bg-main: #F4EDE4;
}
```

### Enhancement 2: Dynamic Color Customization

**Allow users to customize colors:**

```javascript
class ColorCustomizer {
  static setColor(element, newColor) {
    document.documentElement.style.setProperty(
      `--color-${element}`,
      newColor
    );
    localStorage.setItem(`theme-color-${element}`, newColor);
  }
  
  static restoreColors() {
    /* Load from localStorage on page load */
  }
}
```

### Enhancement 3: Animated Color Transitions

**Smooth theme transitions:**

```css
:root {
  --transition-duration: 0.3s;
}

body {
  transition: background-color var(--transition-duration),
              color var(--transition-duration);
}
```

### Enhancement 4: Accessibility Themes

**High contrast for vision impairments:**

```css
[data-theme="high-contrast-light"] {
  --color-text-main: #000000;
  --color-bg-main: #FFFFFF;
  --color-line-gray: #000000;
}

[data-theme="high-contrast-dark"] {
  --color-text-main: #FFFFFF;
  --color-bg-main: #000000;
  --color-line-gray: #FFFFFF;
}
```

### Enhancement 5: Per-Component Theme Overrides

**Allow components to define their own color palette:**

```css
.custom-widget {
  /* Override theme colors just for this component */
  --color-text-main: #AA5500;
  --color-bg-main: #FFEECC;
  
  background: var(--color-bg-main);
  color: var(--color-text-main);
}
```

---

## Migration Guide

### Migrating Existing Components

**Before (Hardcoded Colors):**
```css
.component {
  color: #060C26;
  background: #ffffff;
  border: 1px solid #E8E8EB;
}
```

**After (CSS Variables):**
```css
.component {
  color: var(--color-text-main);
  background: var(--color-bg-main);
  border: 1px solid var(--color-line-gray);
}
```

**Checklist:**
- [ ] Identify all hardcoded color values
- [ ] Find matching variable name (or create new)
- [ ] Replace with `var(--color-name)`
- [ ] Test light and dark modes
- [ ] Verify WCAG contrast
- [ ] Update documentation

---

## Debugging Tips

### Debugging Variable Resolution

**In Browser DevTools:**

```javascript
/* Get computed variable value */
const computed = getComputedStyle(element);
const color = computed.getPropertyValue('--color-text-main').trim();

/* Check all variables at element */
const allVars = computed.getProperties()
  .filter(prop => prop.startsWith('--color'));
```

### Common Issues

**Issue: Variable not found (shows fallback)**
```
Solution: Check if variable is defined in correct scope
  1. Check :root in vars.pcss
  2. Check [data-theme="dark"] in dark-mode.pcss
  3. Check @media query in dark-mode.pcss
  4. Rebuild with: npm run build-frontend
```

**Issue: Wrong color in dark mode**
```
Solution: Update override value in dark-mode.pcss
  1. Find variable name in dark-mode.pcss
  2. Update hex value to correct dark color
  3. Update @media fallback too
  4. Rebuild and refresh browser (Ctrl+Shift+R)
```

**Issue: Color not changing on theme switch**
```
Solution: Ensure CSS uses variable
  1. Check CSS file uses var(--color-name)
  2. Check variable is not overridden by more specific selector
  3. Check z-index/stacking context isn't hiding change
  4. Check browser dev tools "Computed" tab
```

---

## Testing Checklist

Before deploying theme changes:

- [ ] Light mode colors correct
- [ ] Dark mode colors correct
- [ ] System preference fallback works
- [ ] Theme persists on page reload
- [ ] No console errors
- [ ] WCAG AA contrast maintained
- [ ] All component colors updated
- [ ] Frontend build successful
- [ ] Backend build successful
- [ ] No hardcoded colors remain
- [ ] Documentation updated

---

## References

**Official Specs:**
- MDN Web Docs: CSS Custom Properties
- W3C Spec: CSS Variables Level 1
- CSSWG Draft: CSS Custom Properties for Cascading Variables

**Related Tasks:**
- Task 1.1: ThemeManager - Variable initialization
- Task 2.1-2.3: Header UI - Variable usage
- Task 2.4: Page Styles - Variable expansion

**Tools:**
- CSS Color Tool: https://chir.mn/projects/ntc
- Contrast Checker: https://webaim.org/resources/contrastchecker/

---

**End of Technical Deep Dive**
