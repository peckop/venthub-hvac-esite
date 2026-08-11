# Typography — Extended Guide

Detailed typography guidance moved out of SKILL.md: spacing, font selection, modern CSS typography, dark mode, typographic details, accessibility preferences, and ready-to-use CSS/Tailwind setup.

## Practical Scale (Minor Third @ 16px)

```css
--text-xs:   12px;  /* 0.75rem */
--text-sm:   14px;  /* 0.875rem */
--text-base: 16px;  /* 1rem */
--text-lg:   18px;  /* 1.125rem — not in pure scale */
--text-xl:   20px;  /* 1.25rem */
--text-2xl:  24px;  /* 1.5rem */
--text-3xl:  30px;  /* 1.875rem */
--text-4xl:  36px;  /* 2.25rem */
--text-5xl:  48px;  /* 3rem */
```

---

## Spacing Guidelines

### Line Height by Context

| Context | Line Height | Rationale |
|---------|-------------|-----------|
| Body text | 1.5-1.7 | Generous for readability |
| Headings | 1.1-1.3 | Tighter, especially large sizes |
| UI labels | 1.2-1.4 | Compact but legible |
| Buttons | 1.0-1.25 | Single line, tight |

> "The eye does not read letters, but the space between them." — Adrian Frutiger

### Letter Spacing

| Context | Tracking | CSS |
|---------|----------|-----|
| Body text | Default or +0.01em | `tracking-normal` |
| All caps | +0.05em to +0.1em | `tracking-wide` / `tracking-wider` |
| Large headings | -0.01em to -0.02em | `tracking-tight` |
| Small text (<14px) | +0.01em to +0.02em | `tracking-wide` |

**All-caps rule:** Always add tracking. Keep short (1-3 words).

### Paragraph Spacing

- **Between paragraphs:** 1em to 1.5em (equal to or slightly more than line-height)
- **After headings:** Reduced top margin on first paragraph
- **Between sections:** 2-3× paragraph spacing

---

## Font Selection

### System Font Stacks

```css
/* Sans-serif (modern) */
font-family: ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji";

/* Serif */
font-family: ui-serif, Georgia, Cambria, "Times New Roman", serif;

/* Monospace */
font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
```

### Safe Web Font Recommendations

| Category | Fonts | Use Case |
|----------|-------|----------|
| Sans-serif | Inter, Source Sans 3, Work Sans, DM Sans | UI, body text |
| Serif | Source Serif 4, Lora, Merriweather, Literata | Editorial, long-form |
| Monospace | JetBrains Mono, Fira Code, Source Code Pro | Code, data |
| Display | Fraunces, Epilogue, Outfit | Headlines |

### Pairing Principles

- **Pair by contrast** — Serif + sans-serif
- **Match x-height** — For visual harmony when mixed
- **Ensure weight availability** — Both need needed weights/styles

> "A father should not have a favorite among his daughters." — Hermann Zapf (on his typefaces)

---

## Modern CSS Typography

### Text Wrapping

```css
/* Balanced line lengths for headings (≤6 lines) */
h1, h2, h3, blockquote, figcaption {
  text-wrap: balance;
}

/* Prevent orphans in body text */
p, li {
  text-wrap: pretty;
}
```

**Caveat:** Don't use `balance` inside bordered containers—creates visual imbalance.

### Fluid Typography

```css
/* Font scales smoothly between breakpoints */
h1 {
  font-size: clamp(2rem, 1rem + 4vw, 4rem);
  line-height: clamp(1.1, 1.3 - 0.1vw, 1.3);
}

body {
  font-size: clamp(1rem, 0.95rem + 0.25vw, 1.125rem);
}
```

See [fluid-typography.md](fluid-typography.md) for complete scale.

### Text Truncation

```css
/* Single line */
.truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Multi-line (2 lines) */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
```

---

## Dark Mode Typography

### Weight Adjustment

Text appears heavier on dark backgrounds. Reduce weight slightly:

```css
@media (prefers-color-scheme: dark) {
  body {
    font-weight: 350; /* Instead of 400 */
  }
  h1, h2, h3 {
    font-weight: 600; /* Instead of 700 */
  }
}
```

### Font Smoothing

Apply antialiasing on dark backgrounds to counter perceived boldness:

```css
.dark-bg {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

### Color Contrast

- Avoid pure white (#fff) on pure black (#000)—too harsh
- Use off-white (#f5f5f5) and near-black (#1a1a1a)
- Aim for 10:1 to 15:1 contrast in dark mode

---

## Typographic Details

### Quotation Marks

Use curly quotes, not straight:
- Correct: "Hello" and 'world'
- Incorrect: "Hello" and 'world'

### Dashes

| Type | Character | Use |
|------|-----------|-----|
| Hyphen | - | Word breaks, compounds |
| En dash | – | Ranges (2020–2024), relationships |
| Em dash | — | Parenthetical statements |

### Numbers

| Type | Use Case | CSS |
|------|----------|-----|
| Tabular | Tables, prices, alignment | `font-variant-numeric: tabular-nums` |
| Proportional | Body text | `font-variant-numeric: proportional-nums` |
| Old-style | Editorial content | `font-variant-numeric: oldstyle-nums` |
| Slashed zero | Code, data | `font-feature-settings: "zero" 1` |

See [opentype-features.md](opentype-features.md) for complete reference.

---

## Accessibility

### User Preferences

```css
/* Use relative units so users can scale */
body {
  font-size: 1rem; /* Not 16px */
}

/* Respect reduced motion */
@media (prefers-reduced-motion: reduce) {
  * {
    transition: none !important;
  }
}
```

### Dyslexia Considerations

- Avoid justified text
- Prefer sans-serif with distinct letterforms (a vs α, l vs 1 vs I)
- Generous line height and paragraph spacing
- Consider offering OpenDyslexic as option

---

## Quick Implementation

### Minimal Professional Setup

```css
:root {
  --font-sans: Inter, ui-sans-serif, system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', ui-monospace, monospace;
}

body {
  font-family: var(--font-sans);
  font-size: clamp(1rem, 0.95rem + 0.25vw, 1.125rem);
  line-height: 1.6;
  font-feature-settings: "kern" 1, "liga" 1, "calt" 1;
}

h1, h2, h3 {
  line-height: 1.2;
  text-wrap: balance;
  letter-spacing: -0.02em;
}

p {
  text-wrap: pretty;
  max-width: 65ch;
}

code {
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums slashed-zero;
}

@media (prefers-color-scheme: dark) {
  body {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
}
```

### Tailwind Quick Start

```html
<article class="
  prose prose-gray lg:prose-lg
  prose-headings:text-balance
  prose-p:text-pretty
  dark:prose-invert
  max-w-prose mx-auto
">
  <!-- Content -->
</article>
```

See [tailwind-integration.md](tailwind-integration.md) for complete patterns.
