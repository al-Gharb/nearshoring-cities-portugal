# CSS Unused Selectors Report

**Generated:** CSS extraction from index.html to main.css  
**Files Analyzed:** main.css (3,176 lines), index.html (5,800 lines)

---

## Summary

| Metric | Value |
|--------|-------|
| Total CSS selectors analyzed | ~350+ |
| Potentially unused (High confidence) | 3 |
| Potentially unused (Medium confidence) | 5 |
| Potentially unused (Low confidence) | 4 |
| **Percentage potentially unused** | < 4% |

---

## 🔴 High Confidence — Likely Unused

These selectors have no matching class found in the HTML:

| Selector | Notes |
|----------|-------|
| `.skip-link` | Accessibility skip link class not found in HTML. Could be vestigial or planned for future use. |
| `.sr-only` | Screen-reader-only utility class not found in HTML. Common accessibility pattern but not currently implemented. |
| `.key-factor-card` | Component class for "key factor" cards not found in HTML. May be from removed content section. |

### Recommendation
These can be safely removed after verification, OR consider adding `.skip-link` and `.sr-only` to improve accessibility:

```html
<!-- Add at top of <body> for accessibility -->
<a href="#cover" class="skip-link">Skip to main content</a>
```

---

## 🟠 Medium Confidence — Dynamically Used

These selectors exist for states that are applied via JavaScript:

| Selector | Notes |
|----------|-------|
| `.region-tooltip.visible` | The `.visible` state is applied via JavaScript on hover events. **Keep.** |
| `.city-section:not(.expanded)` | State selector for collapsed city profiles. JS toggles `.expanded` class. **Keep.** |
| `.bin-lid`, `.bin-body`, `.bin-icon`, `.bin-label`, `.bin-subtext`, `.bin-badge` | Sub-elements of `.archive-toggle` for the "trash bin" animation. Parent IS used. **Keep.** |
| `[style*="repeat(4, 1fr)"] > div` | Targets inline style grids with 4 columns. May be used in JS-generated content. **Keep.** |

---

## 🟡 Low Confidence — False Positives

These selectors ARE used in the HTML:

| Selector | Status |
|----------|--------|
| `.org-tag` | ✅ CONFIRMED IN USE — Student organization tags in city profiles |
| `.student-orgs`, `.student-orgs-title` | ✅ CONFIRMED IN USE — Student organizations section |
| `.company-fact::before` | ✅ CONFIRMED IN USE — Pseudo-element adding 💡 emoji |
| `.image-credit` | ✅ CONFIRMED IN USE — Image attribution overlays |

---

## Methodology

1. **CSS Extraction**: Analyzed all selectors in main.css including:
   - Class selectors (`.classname`)
   - ID selectors (`#id`)
   - Attribute selectors (`[data-*]`)
   - Compound selectors (`.parent .child`)
   - Pseudo-classes (`:hover`, `:focus`, etc.)

2. **HTML Cross-Reference**: Searched index.html for:
   - All `class="..."` attributes
   - All `id="..."` attributes
   - Data attributes (`data-*`)
   - JavaScript `classList.add()` / `classList.toggle()` patterns

3. **Exclusions Applied**:
   - ✅ Universal selectors (`*`, `html`, `body`) — always used
   - ✅ Pseudo-classes with valid base selectors
   - ✅ Dark mode selectors (`[data-theme="dark"]`) — toggle dynamically
   - ✅ Media query variants of used selectors
   - ✅ JavaScript-toggled class states

---

## CSS Organization

The extracted main.css is organized into 33 sections:

1. Reset & Base Styles
2. CSS Variables & Custom Properties
3. Dark Mode Theme Override
4. Theme Toggle Switch
5. Cover-Specific Theme Toggle
6. Utility Classes
7. Layout Structure
8. Cover Page & Hero
9. Portugal Map SVG
10. City Markers & Tooltips
11. Cover Content & Typography
12. Section Layouts
13. Chart Containers
14. Info Cards & Metrics
15. City Profiles
16. Image Headers
17. Statistics Displays
18. Tables & Data
19. Tags & Badges
20. Accordions & Expandable
21. Navigation
22. Buttons & Interactions
23. Tooltips & Popovers
24. Source Blocks
25. Comparison Tables
26. Matrix & Grids
27. Region Tooltips
28. Archive Toggle Animation
29. Confidence Bars
30. Scroll Indicators
31. Print Styles
32. Accessibility
33. Media Queries (Responsive)

---

## Recommendations

### Safe to Remove
```css
/* After verifying no JS adds these dynamically: */
.skip-link { ... }
.sr-only { ... }  
.key-factor-card { ... }
```

### Consider Adding for Accessibility
Rather than removing `.skip-link` and `.sr-only`, consider implementing them:

```html
<!-- Skip link for keyboard navigation -->
<a href="#cover" class="skip-link">Skip to main content</a>

<!-- Screen reader only content -->
<span class="sr-only">Additional context for screen readers</span>
```

### Code Health
- **Excellent maintainability**: < 4% potentially unused selectors
- **Well-organized**: Clear section comments throughout
- **Dark mode complete**: All components have dark theme variants
- **Responsive**: Comprehensive media queries for mobile/tablet

---

## Files

| File | Lines | Description |
|------|-------|-------------|
| [main.css](main.css) | 3,176 | Extracted external stylesheet |
| [index.html](index.html) | 5,800 | Main HTML document (now uses external CSS) |
