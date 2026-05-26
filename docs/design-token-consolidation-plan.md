# VentHub Design Token Konsolidasyonu v3 — NLM Onaylı

> NLM "VentHub Design System" defteri (a1ca5476) tarafından doğrulanmış ve eksikleri tamamlanmış final plan.

---

## NLM'in Bulduğu Eksikler ve Çözümler

| # | NLM Bulgusu | Çözüm |
|---|-------------|-------|
| 1 | `duration-[250ms]`, `duration-[600ms]`, `ease-[cubic-bezier]` eksik | → `duration-hvac-*` + `ease-hvac-*` token'ları ekle |
| 2 | `blur-[80px]`, `blur-[150px]` tokenize edilmemiş | → `blur-80`, `blur-150` ekle |
| 3 | Glow renkleri ayrı token olmamalı → CSS variable ile | → `--glow-color` yaklaşımı |
| 4 | `text-wrap: balance/pretty` eksik | → Global CSS'e ekle |
| 5 | `max-w-prose` (~65ch) satır uzunluğu eksik | → body text alanlarına uygula |
| 6 | Dark mode antialiased font smoothing eksik | → Global dark mode'a ekle |
| 7 | `transition-[filter,transform,opacity]` vb. kaldı | → Ek transition token'ları |
| 8 | `w-[92%]` → Tailwind `w-11/12` kullanılmalı | → Standart sınıfa geç |

---

## Faz 1: tokens.js Genişletme

```js
// ── SHADOW (MD3 Elevation + Glow) ──────────────
export const boxShadow = {
  // Mevcut korunanlar
  'hvac':        '0 4px 6px -1px rgba(30,64,175,0.1), 0 2px 4px -1px rgba(30,64,175,0.06)',
  'hvac-lg':     '0 10px 15px -3px rgba(30,64,175,0.1), 0 4px 6px -2px rgba(30,64,175,0.05)',
  'glass':       '0 8px 32px 0 rgba(31,38,135,0.37)',
  // MD3 Elevation
  'elevation-1': '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.08)',
  'elevation-2': '0 4px 12px rgba(0,0,0,0.15)',
  'elevation-3': '0 10px 30px rgba(0,0,0,0.25)',
  'elevation-4': '0 20px 50px rgba(0,0,0,0.35)',
  'elevation-5': '0 30px 60px rgba(0,0,0,0.5)',
  // Glow (CSS variable ile renk)
  'glow-sm':     '0 0 10px var(--glow-color, rgba(34,211,238,0.3))',
  'glow-md':     '0 0 20px var(--glow-color, rgba(34,211,238,0.4))',
  'glow-lg':     '0 0 40px var(--glow-color, rgba(34,211,238,0.5))',
  // Utility
  'inset-deep':  'inset 0 0 100px rgba(0,0,0,0.5)',
  'ring':        '0 0 0 2px',
};

// ── HEIGHT (8px grid) ──────────────────────────
export const height = {
  'hvac-input':   '40px',   // 5×8
  'hvac-thumb':   '72px',   // 9×8
  'hvac-card':    '300px',  // mevcut korunan
  'hvac-panel':   '400px',  // mevcut korunan
  'hvac-section': '500px',  // mevcut korunan
  'hvac-hero':    '600px',  // mevcut korunan
  'hvac-hero-lg': '700px',  // lg breakpoint hero
};

export const minHeight = {
  'hvac-input':   '40px',
  'hvac-card':    '160px',  // 20×8
  'hvac-panel':   '300px',
  'hvac-section': '400px',
  'hvac-hero':    '600px',
};

export const maxHeight = {
  'hvac-menu':    '300px',
  'hvac-panel':   '480px',  // 60×8
  'hvac-modal':   '85vh',
  'hvac-drawer':  '90vh',
  'hvac-screen':  '100dvh',
};

// ── WIDTH (8px grid) ───────────────────────────
export const width = {
  'hvac-menu':    '360px',  // 45×8 (toast, küçük panel)
  'hvac-modal':   '480px',  // 60×8
  'hvac-mega-sm': '500px',  // sm mega menu
  'hvac-mega-md': '600px',  // md mega menu
  'hvac-mega-lg': '700px',  // lg mega menu
};

export const minWidth = {
  'hvac-btn':     '120px',  // 15×8
  'hvac-menu':    '140px',
  'hvac-select':  '200px',
  'hvac-sidebar': '240px',
  'hvac-panel':   '280px',
};

// maxWidth → MEVCUT tokens.js'te zaten var, sadece prose ekle:
export const maxWidth = {
  'page':    '100rem',
  'content': '56.25rem',
  'modal':   '26.25rem',
  'prose':   '65ch',     // ← YENİ: Typography SKILL satır uzunluğu
};

// ── DURATION & EASE ────────────────────────────
export const transitionDuration = {
  'hvac-fast':   '150ms',
  'hvac-normal': '250ms',
  'hvac-slow':   '600ms',
  'hvac-glacial':'2000ms',
};

export const transitionTimingFunction = {
  'hvac-ease':   'cubic-bezier(0.16, 1, 0.3, 1)',
  'hvac-spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
};

// ── BLUR (ek) ──────────────────────────────────
export const blur = {
  '80':  '80px',
  '150': '150px',
};

// ── TRANSITION PROPERTY (ek) ───────────────────
export const transitionProperty = {
  'opacity-transform':   'opacity, transform',
  'opacity-only':        'opacity',
  'filter-transform':    'filter, transform, opacity',
  'width-bg':            'width, background-color',
  'width-height':        'width, height',
  'transform-shadow':    'transform, box-shadow',
};
```

---

## Faz 2: index.css Eklemeleri

```css
/* ── Glow Color CSS Variable ── */
:root {
  --glow-color: rgba(34, 211, 238, 0.3); /* cyan default */
}

/* ── Typography Ekleri (NLM bulgusu) ── */
h1, h2, h3, h4, h5, h6 { text-wrap: balance; }
p, li, blockquote { text-wrap: pretty; }
.dark { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
```

---

## Faz 3: Bileşen Migrasyonu — CLI Aksiyonlar

Her satır bir `sed`/`replace` komutu. CLI script'i bunları toplu çalıştıracak.

### Shadow Eşlemeleri

| Mevcut Arbitrary | → Token | Bileşenler |
|------------------|---------|-----------|
| `shadow-[0_0_10px_rgba(34,211,238,*)]` | `shadow-glow-sm` | ColumnsMenu, InventoryCsvImport, CommandPalette |
| `shadow-[0_0_15px_rgba(34,211,238,*)]` | `shadow-glow-md` | AdminEmptyState, ActivityHeatmap, StatCard, CinematicProduct |
| `shadow-[0_0_20px_rgba(34,211,238,*)]` | `shadow-glow-md` | InventoryCsvImport, HomeSinevizyon |
| `shadow-[0_0_40px_rgba(255,255,255,*)]` | `shadow-glow-lg [--glow-color:rgba(255,255,255,0.2)]` | ClientLeadButton, CinematicProduct |
| `shadow-[0_20px_50px_rgba(0,0,0,0.5)]` | `shadow-elevation-4` | ColumnsMenu, ActivityHeatmap, CinematicProduct |
| `shadow-[0_30px_60px_rgba(0,0,0,0.5)]` | `shadow-elevation-5` | ExportMenu |
| `shadow-[0_40px_80px_-20px_rgba(0,0,0,0.5)]` | `shadow-elevation-5` | CategoryHubOverlay |
| `shadow-[0_40px_100px_rgba(0,0,0,0.6)]` | `shadow-elevation-5` | InventoryCsvImport |
| `shadow-[0_18px_35px_-20px_rgba(37,99,235,*)]` | `shadow-elevation-3` | StickyHeader, NavBrand |
| `shadow-[inset_0_0_100px_rgba(0,0,0,0.5)]` | `shadow-inset-deep` | BlueprintCanvas |

### Width/Height — Tailwind Standart veya Token

| Mevcut | → Hedef | Neden |
|--------|---------|-------|
| `w-[92%]` | `w-11/12` | Tailwind native yüzde |
| `w-[42%]` | `w-5/12` | Tailwind native yüzde |
| `h-[400px]` | `h-hvac-panel` | Token |
| `h-[500px]` | `h-hvac-section` | Token |
| `h-[600px]` | `h-hvac-hero` | Token (zaten var) |
| `h-[700px]` | `h-hvac-hero-lg` | Token |
| `min-h-[300px]` | `min-h-hvac-panel` | Token |
| `max-h-[300px]` | `max-h-hvac-menu` | Token |
| `max-h-[85vh]` | `max-h-hvac-modal` | Token |
| `max-h-[90vh]` | `max-h-hvac-drawer` | Token |

### Spacing — Tailwind Standart

| Mevcut | → Hedef |
|--------|---------|
| `p-[25px]` | `p-6` (24px) |
| `p-[32px]` | `p-8` (32px) |
| `gap-x-[30px]` | `gap-x-8` (32px) |
| `mt-[10px]` | `mt-2.5` (10px) |
| `mb-[7px]` | `mb-2` (8px) |
| `gap-[2px]` | `gap-0.5` (2px) |
| `pt-[15vh]` | inline bırak (tek kullanım) |

---

## Token'a ÇEVRİLMEYECEK Değerler (NLM Onaylı)

Bu değerler bileşene özel tek kullanımlık — token sistemi şişirmemek için inline kalacak:

- Grid/Layout: `lg:grid-cols-[1fr,320px]`, `sm:grid-cols-[0.75fr_1fr]`, `auto-rows-[140px]`
- Hassas hizalama: `inset-[-4px]`, `top-[1px]`, `before:w-[3px]`, `stroke-[4px]`, `top-[96px]`
- Animasyon geometri: `perspective-[2000px]`, `origin-[top_center]`, `aspect-[0.85/1]`
- Radial gradient: `bg-[radial-gradient(...)]` (bileşene özgü, tekrar etmiyor)
- Calc: `w-[calc(100vw-32px)]`, `max-h-[calc(100vh-96px)]`
- Radix CSS var: `h-[var(--radix-navigation-menu-viewport-height)]`

---

## CLI Uygulama Stratejisi

```
Adım 1: tokens.js güncelle (tek dosya)
Adım 2: tailwind.config.js güncelle (import'lar)
Adım 3: index.css typography ekleri
Adım 4: Shadow migrasyon script'i (find & replace)
Adım 5: Height/Width migrasyon script'i
Adım 6: Spacing migrasyon script'i
Adım 7: Duration/Ease/Transition migrasyon script'i
Adım 8: Doğrulama (tsc + build + lint)
```

Her adım bir subagent veya script olarak çalışacak.
