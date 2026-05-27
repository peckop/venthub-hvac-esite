# VentHub CSS Enterprise Polish — CLI Uygulama Planı

> Token konsolidasyonu (Seviye 1) tamamlandı. Bu plan, CSS katmanında enterprise cilalama yapacak.
> TSC + Build + Lint doğrulaması zorunlu.

---

## Adım 1: index.css Global Base Eklemeleri

`src/index.css` dosyasında `@layer base { :root { ... } }` bloğunun içine ekle:

```css
/* :root bloğuna ekle (mevcut --glow-color satırından sonra) */
accent-color: hsl(var(--brand-cyan));
color-scheme: dark light;
```

Ayrıca `@layer base` içine ama `:root` bloğunun DIŞINA şu yeni kuralları ekle:

```css
/* ── Enterprise Global Polish ──────────────────────────────────────── */
::selection {
  background-color: hsl(var(--brand-cyan));
  color: #fff;
}

/* Modern scrollbar — tüm tarayıcılar (Firefox dahil) */
* {
  scrollbar-color: hsl(var(--surface-navy-mid)) transparent;
  scrollbar-width: thin;
}

/* Mobil tap highlight kaldır */
@media (pointer: coarse) {
  * { -webkit-tap-highlight-color: transparent; }
}

/* Yüksek kontrast tercihi */
@media (prefers-contrast: more) {
  :root {
    --surface-deep: 220 30% 5%;
    --steel-gray: 220 15% 55%;
  }
}
```

---

## Adım 2: content-visibility Performans Sınıfı

`src/index.css` dosyasının `@layer utilities` bölümüne (yoksa oluştur) ekle:

```css
@layer utilities {
  .content-auto {
    content-visibility: auto;
    contain-intrinsic-size: auto 500px;
  }
}
```

Sonra şu dosyalardaki ana tablo/liste konteynerlerine `content-auto` sınıfını ekle:
- `src/components/admin/AdminOrdersBoard.tsx` — ana tablo wrapper'ına
- `src/components/admin/InventoryTable.tsx` — tablo wrapper'ına
- `src/components/home/InfiniteProductsShowcase.tsx` — 3D sahne wrapper'ına

---

## Adım 3: focus-visible Stratejisi

Tüm `src/**/*.tsx` dosyalarında şu değişiklikleri yap:

1. `focus:ring-` → `focus-visible:ring-` (tüm dosyalarda)
2. `focus:outline-` → `focus-visible:outline-` (tüm dosyalarda)
3. `focus:border-` → `focus-visible:border-` (tüm dosyalarda)
4. `focus:shadow-` → `focus-visible:shadow-` (tüm dosyalarda)

**DİKKAT:** Sadece interaktif elemanlar (button, a, input, select, textarea) için geçerli.
**DOKUNMA:** `focus:bg-`, `focus:text-` gibi state sınıflarına DOKUNMA — bunlar genellikle fare hover/focus birlikte kullanılıyor.

---

## Adım 4: @tailwindcss/typography Eklentisi

1. Terminalde çalıştır:
```bash
pnpm add -D @tailwindcss/typography
```

2. `tailwind.config.js` dosyasında:
```js
// import satırlarının altına ekle
import typography from '@tailwindcss/typography';

// plugins: [] → plugins: [typography] olarak değiştir
plugins: [typography],
```

3. Şu dosyalarda uzun metin wrapper'larına `prose dark:prose-invert max-w-prose` sınıfı ekle:
- `src/components/knowledge/` altındaki metin bileşenleri
- `src/views/legal/` altındaki yasal sayfa bileşenleri  
- `src/components/home/KnowledgeBlock.tsx` — metin alanına

---

## Adım 5: Dark Mode Shadow Override

`tailwind.config.js` → `extend.boxShadow` objesine ekle:

```js
// Mevcut shadow token'larının altına
'elevation-1-dark': '0 1px 3px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.03)',
'elevation-2-dark': '0 4px 12px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.04)',
'elevation-3-dark': '0 10px 30px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)',
```

NOT: Bu token'ları bileşenlere uygulamak gelecek sprint'te yapılacak. Şimdilik sadece tanımla.

---

## Adım 6: Doğrulama

```bash
pnpm run type-check
pnpm run build
pnpm run lint
```

Üçü de sıfır hata ile geçmeli.

---

## Token'a ÇEVRİLMEYECEK / DOKUNULMAYACAK

- `focus:bg-*`, `focus:text-*` sınıflarına dokunma
- `will-change` olan yerlere dokunma (zaten stratejik kullanılıyor)
- Mevcut `::-webkit-scrollbar` özel stilleri varsa koru (yeni kural ek olarak girecek)
- `@layer base` içindeki mevcut kuralları DEĞİŞTİRME, sadece YENİ kural ekle
