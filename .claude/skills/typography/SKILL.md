---
name: typography
description: Applies typography principles for fonts, readability, text styling, type
  scales, and line spacing. Trigger for font modification (font değiştir), readability
  (okunabilirlik), or text styling. Do NOT use for general git operations, running
  unit tests, or database resets.
category: guards
metadata:
  triggers:
  - font değiştir
  - okunabilirlik
  - text styling
  inputs:
  - typography requirements
  outputs:
  - type scale rules
depends_on: []
next_steps: []
run_last: false
exclusions: []
---

# Typography

Professional typography for user interfaces, grounded in principles from the masters.

> "Typography exists to honor content." — Robert Bringhurst

## Reference Files

For detailed guidance on specific topics, consult these references:

| Topic | When to Read |
|-------|--------------|
| [extended-guide.md](references/extended-guide.md) | Spacing/font seçimi/dark-mode/detay tipografi + hazır CSS kurulumu |
| [masters.md](references/masters.md) | Seeking authoritative backing, making nuanced judgments, understanding "why" |
| [variable-fonts.md](references/variable-fonts.md) | Using variable fonts, fluid weight, performance optimization |
| [font-loading.md](references/font-loading.md) | FOIT/FOUT issues, preloading, Core Web Vitals, self-hosting |
| [opentype-features.md](references/opentype-features.md) | Ligatures, tabular numbers, stylistic sets, slashed zero |
| [fluid-typography.md](references/fluid-typography.md) | clamp(), text-wrap, truncation, vertical rhythm, font smoothing |
| [tailwind-integration.md](references/tailwind-integration.md) | Tailwind typography utilities, prose plugin, customization |
| [internationalization.md](references/internationalization.md) | RTL languages, Arabic/Hebrew, CJK, bidirectional text |

## Output Formats

### Type System Recommendations

```markdown
## Type System

### Scale
- Base: [size, e.g., 16px]
- Ratio: [e.g., Minor Third 1.200]
- Rationale: [why this ratio]

### Hierarchy
| Level | Size | Weight | Line Height | Letter Spacing | Use |
|-------|------|--------|-------------|----------------|-----|
| Display | ... | ... | ... | ... | Hero, marketing |
| H1 | ... | ... | ... | ... | Page titles |
| H2 | ... | ... | ... | ... | Section heads |
| Body | ... | ... | ... | ... | Paragraphs |
| Small | ... | ... | ... | ... | Captions, labels |

### Fonts
- Primary: [font] — [rationale]
- Secondary: [font, if applicable]
- Mono: [font, if applicable]

### Implementation
[Ready-to-use CSS/Tailwind]
```

### Typography Audits

```markdown
## Typography Audit

### Issues
| Element | Problem | Recommendation |
|---------|---------|----------------|
| ... | ... | ... |

### Quick Wins
- [Immediate improvement 1]
- [Immediate improvement 2]
```

---

## Core Principles

### The Four Fundamentals (Bringhurst)

The most important typographic considerations for body text:

1. **Point size** — 16px minimum for body; 14px absolute floor for secondary text
2. **Line spacing** — 1.5-1.7 for body; 1.1-1.3 for headings
3. **Line length** — 45-75 characters (66 ideal); use `max-w-prose` (~65ch)
4. **Font choice** — Match typeface to content and context

### Hierarchy Through Contrast

Establish hierarchy using multiple dimensions:

| Dimension | Low Contrast | High Contrast |
|-----------|--------------|---------------|
| Size | 14px → 16px | 16px → 48px |
| Weight | 400 → 500 | 400 → 700 |
| Color | Gray-600 → Gray-900 | Gray-400 → Black |
| Case | Normal | UPPERCASE |

> "Use one typeface per design. Avoid italics and bold—rely on gradations of scale instead." — Massimo Vignelli

### Restraint

- **1-2 font families maximum** — One serif, one sans if pairing
- **3-4 heading levels in practice** — Deeper nesting usually signals structure problems
- **Stick to your type scale** — Resist arbitrary sizes
- **Let whitespace work** — Don't fill every gap

> "In the new computer age, the proliferation of typefaces represents a new level of visual pollution." — Massimo Vignelli

---

## Type Scales

### Modular Scale Ratios

| Name | Ratio | Character |
|------|-------|-----------|
| Minor Second | 1.067 | Subtle, conservative |
| Major Second | 1.125 | Gentle, professional |
| Minor Third | 1.200 | Balanced, versatile |
| Major Third | 1.250 | Bold, impactful |
| Perfect Fourth | 1.333 | Strong hierarchy |
| Golden Ratio | 1.618 | Dramatic, editorial |

### When to Deviate

- **Marketing/hero:** Larger jumps allowed
- **Dense data interfaces:** Tighter scale
- **Mobile:** Slightly larger base (17-18px)

A ready-to-paste CSS scale lives in [extended-guide.md](references/extended-guide.md).

---

## Accessibility — Minimums

| Element | Minimum | Preferred |
|---------|---------|-----------|
| Body text | 16px | 16-18px |
| Secondary text | 14px | 14-16px |
| Legal/caption | 12px | 12px + increased tracking |
| Contrast ratio | 4.5:1 | 7:1 |

User-preference CSS (`rem`, `prefers-reduced-motion`) and dyslexia considerations → [extended-guide.md](references/extended-guide.md).

---

## Common Mistakes

- All-caps body text or long headings
- Centered body paragraphs
- Line length over 80 characters
- Insufficient contrast for "aesthetic" reasons
- Mixing too many font families (>2)
- Decorative fonts for UI text
- Justified text on the web
- Tiny gray text on white backgrounds
- Letter-spacing on Arabic text
- Orphans and widows in prominent text
- Inconsistent heading hierarchy
- Missing font fallbacks
- Layout shift from web font loading
- Underlined text that isn't a link
