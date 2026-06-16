# VentHub HVAC: Master Design System & UI/UX Standards

This document defines the absolute, production-ready design system and UI/UX specification corpus for the VentHub HVAC ecosystem. It establishes token hierarchies, CSS utilities, interaction curves, and design blueprints to guarantee a world-class, premium visual identity and high-end usability.

---

## 1. Global Token Hierarchy (CSS Custom Properties)

All styles must consume CSS Custom Properties. Hardcoding hex colors or arbitrary spacing values is strictly prohibited to ensure layout stability and seamless dark/light theme switching.

### A. Dynamic HSL Theme Colors
We use HSL color tokens to allow opacity modifiers (e.g., `bg-primary/20` in Tailwind) and programmatic styling.

```css
:root {
  /* Brand Core Palettes - Industrial Slate & Safety Accent */
  --primary: 215 16% 47%;          /* #64748B - Industrial Grey */
  --primary-foreground: 210 40% 98%; /* White-Slate */
  
  --secondary: 210 20% 65%;        /* #94A3B8 - Slate Accent */
  --secondary-foreground: 222 47% 11%;
  
  --accent: 25 95% 53%;            /* #F97316 - Safety Orange */
  --accent-foreground: 210 40% 98%;
  
  /* Backgrounds & Canvas States */
  --background: 210 40% 98%;       /* #F8FAFC - Soft Ice White */
  --card: 0 0% 100%;               /* Pure White */
  --card-foreground: 222 47% 11%;  /* Deep Slate Text */
  
  /* Borders, Inputs, and Muted States */
  --border: 214 32% 91%;           /* Slate-200 */
  --input: 214 32% 91%;
  --ring: 215 16% 47%;
  --muted: 215 16% 47%;
  --muted-foreground: 215 16% 35%; /* High-contrast body text */
}

/* Dark Mode Override (Activated via .dark class on <html>) */
.dark {
  --primary: 210 40% 98%;
  --primary-foreground: 222 47% 11%;
  
  --secondary: 215 16% 47%;
  --secondary-foreground: 210 40% 98%;
  
  --accent: 25 95% 53%;
  --accent-foreground: 210 40% 98%;
  
  --background: 222 47% 8%;        /* Slate-950 */
  --card: 222 47% 11%;             /* Slate-900 */
  --card-foreground: 210 40% 98%;
  
  --border: 217 32% 17%;           /* Slate-800 */
  --input: 217 32% 17%;
  --ring: 210 40% 98%;
  --muted: 215 20% 65%;
  --muted-foreground: 215 20% 75%;
}
```

---

### B. Fluid Typography Scale
To prevent layout jumpiness and unnecessary breakpoint adjustments, we use fluid font-sizing using the CSS `clamp()` function.

| Type Token | CSS Utility | Size Formula (Fluid Scale) | Target Application |
| :--- | :--- | :--- | :--- |
| `fs-display` | `.text-display` | `clamp(2.5rem, 6vw, 4.5rem)` | Hero titles (Landing page) |
| `fs-h1` | `.text-h1` | `clamp(2rem, 4.5vw, 3rem)` | Page level headers |
| `fs-h2` | `.text-h2` | `clamp(1.5rem, 3.5vw, 2.25rem)` | Section headers |
| `fs-h3` | `.text-h3` | `clamp(1.25rem, 2.5vw, 1.75rem)` | Subsections, card headers |
| `fs-body` | `.text-body` | `clamp(0.95rem, 1.5vw, 1.1rem)` | Paragraph text (high readability) |
| `fs-small` | `.text-small` | `0.85rem` (Static) | Captions, metadata, tooltips |

*   **Heading Font Pairing:** Satoshi (Geometric, modern, professional)
*   **Body Font Pairing:** General Sans (Highly legible, crisp rendering at small scales)
*   **Fallback Font Chain:** `system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`

---

### C. Layout Grid & Spacing System
We enforce a strict grid rhythm using spacing variables to align all components.

```css
:root {
  --space-3xs: 0.125rem; /* 2px */
  --space-2xs: 0.25rem;  /* 4px */
  --space-xs: 0.5rem;    /* 8px */
  --space-sm: 0.75rem;   /* 12px */
  --space-md: 1rem;      /* 16px */
  --space-lg: 1.5rem;    /* 24px */
  --space-xl: 2rem;      /* 32px */
  --space-2xl: 3rem;     /* 48px */
  --space-3xl: 4.5rem;    /* 72px */
  
  --max-content-width: 80rem; /* 1280px */
}
```

---

## 2. Advanced CSS Styles: Liquid Glass & Glassmorphism

The visual design system of VentHub HVAC is based on **Liquid Glass**: smooth, flowing glass panels, animated blurs, translucent layers, and high-end lighting reflections.

```css
/* Glassmorphism Card Style */
.liquid-glass-card {
  background: rgba(255, 255, 255, 0.45);
  backdrop-filter: blur(16px) saturate(180%);
  -webkit-backdrop-filter: blur(16px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 
    0 4px 30px rgba(0, 0, 0, 0.03),
    inset 0 1px 1px rgba(255, 255, 255, 0.4);
  border-radius: 1.25rem;
  transition: all 400ms cubic-bezier(0.16, 1, 0.3, 1);
}

.dark .liquid-glass-card {
  background: rgba(15, 23, 42, 0.45);
  backdrop-filter: blur(16px) saturate(180%);
  -webkit-backdrop-filter: blur(16px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 
    0 4px 30px rgba(0, 0, 0, 0.2),
    inset 0 1px 1px rgba(255, 255, 255, 0.05);
}

/* Premium Hover Lift State */
.liquid-glass-card:hover {
  transform: translateY(-4px) scale(1.01);
  background: rgba(255, 255, 255, 0.6);
  border-color: rgba(255, 255, 255, 0.5);
  box-shadow: 
    0 12px 40px rgba(0, 0, 0, 0.06),
    inset 0 1px 2px rgba(255, 255, 255, 0.6);
}

.dark .liquid-glass-card:hover {
  background: rgba(15, 23, 42, 0.60);
  border-color: rgba(255, 255, 255, 0.15);
  box-shadow: 
    0 12px 40px rgba(0, 0, 0, 0.4),
    inset 0 1px 2px rgba(255, 255, 255, 0.1);
}
```

---

## 3. High-Fidelity UI Component Blueprints

Here are concrete, copy-pasteable CSS and React component guidelines for core elements of a world-class website.

### A. Value-Driven Call-To-Action (CTA) Banner
*Standard rule: Never use generic CTA text like "Click Here" or "Submit". Always use value-oriented verbs.*

```tsx
import React from 'react';
import { ArrowRight } from 'lucide-react';

export function PremiumCTABanner() {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-slate-900 dark:bg-slate-950 p-8 md:p-12 shadow-2xl border border-white/5">
      {/* Dynamic Background Blob */}
      <div className="absolute -right-20 -top-20 w-80 h-80 bg-orange-500/10 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-slate-500/10 rounded-full blur-[80px] pointer-events-none" />
      
      <div className="relative z-10 max-w-2xl space-y-6">
        <span className="inline-block px-3 py-1 text-xs font-black text-orange-500 bg-orange-500/10 rounded-full uppercase tracking-wider">
          Kurumsal HVAC Yönetimi
        </span>
        <h2 className="text-3xl md:text-4xl font-extrabold text-white leading-tight">
          Fabrika ve Tesis Alanlarında Hava Akışını Optimize Edin
        </h2>
        <p className="text-slate-400 text-sm md:text-base leading-relaxed">
          Vortice endüstriyel vantilatörler ve akıllı kontrol üniteleri ile işletmenizin karbon ayak izini azaltın, enerji verimliliğini %35'e kadar yükseltin.
        </p>
        
        <div className="flex flex-wrap gap-4 pt-2">
          {/* Primary CTA */}
          <button className="flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 active:scale-98 text-white font-bold rounded-xl shadow-lg transition-all duration-200 cursor-pointer">
            Fiyat Teklifi Talep Et
            <ArrowRight className="w-4 h-4" />
          </button>
          
          {/* Secondary CTA */}
          <button className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-xl border border-white/10 transition-colors duration-200 cursor-pointer">
            Kataloğu İncele (PDF)
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

### B. Floating Sticky Header / Navbar
A world-class header should float above content, blend into the background dynamically using backdrop blurs, and adapt to scroll positions.

```tsx
import React, { useState, useEffect } from 'react';

export function FloatingNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={`fixed top-4 left-4 right-4 z-header transition-all duration-300 rounded-2xl ${
        isScrolled 
          ? 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-lg border border-slate-200/50 dark:border-slate-800/50 p-4' 
          : 'bg-transparent p-6'
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-widest">
          Venthub <span className="text-orange-500">HVAC</span>
        </div>

        {/* Navigation Items */}
        <nav className="hidden md:flex gap-8">
          <a href="#" className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-orange-500 transition-colors">Ana Sayfa</a>
          <a href="#" className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-orange-500 transition-colors">Ürünler</a>
          <a href="#" className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-orange-500 transition-colors">Hesaplayıcılar</a>
          <a href="#" className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-orange-500 transition-colors">Destek</a>
        </nav>

        {/* Action Button */}
        <div>
          <button className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold uppercase rounded-lg hover:opacity-90 transition-opacity cursor-pointer">
            Bayi Girişi
          </button>
        </div>
      </div>
    </header>
  );
}
```

---

## 4. Strict Styling Restrictions & Anti-Patterns

To maintain enterprise-level code quality and design integrity, all code changes must adhere to these strict restrictions:

1.  **Tailwind Arbitrary Class Ban:** Using inline arbitrary values (e.g. `bg-[#ff0000]`, `h-[42px]`, `w-[92vw]`) inside HTML/JSX files is strictly prohibited. They disrupt color and theme tokens. If a specific style is necessary, use inline style object or define a class inside `index.css`.
2.  **No Emoji Icons:** Emojis (🎨, 🚀, ⚙️) are strictly banned as icons. Use verified SVG assets from `lucide-react` or `heroicons`.
3.  **No Layout-Shifting Hovers:** Never scale items on hover in a way that shifts the layout of surrounding elements (e.g. changing `border-width` or `padding` on hover). Use relative absolute outline shadows or transition scale transforms.
4.  **Instant States Blocked:** All state changes (button focus, hover, modal open) must use transition curves (minimum 150ms, maximum 300ms) with `cubic-bezier(0.4, 0, 0.2, 1)` or standard ease-out transitions.

---

## 5. Accessibility (A11y) & Interactive Standards

All interactive elements must conform to WCAG 2.2 AA standards:

*   **Keyboard Traps:** Modals and menus must handle keyboard traps, allowing users to close them using the `Escape` key and navigate through options using `Tab` and `Shift+Tab`.
*   **Touch Targets:** Clickable zones on touch screens must be at least **44x44px** to prevent accidental clicks.
*   **Focus Visible:** Focus outlines must never be disabled. Use custom, high-contrast rings:
    ```css
    .focusable:focus-visible {
      outline: 2px solid var(--accent);
      outline-offset: 2px;
    }
    ```
*   **Contrast Guard:** Light mode text must maintain a minimum contrast ratio of **4.5:1** against the background. Body copy must use slate-700/800, never light gray-400.
