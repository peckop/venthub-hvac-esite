# Lighthouse Performans Onarım Planı (birleştirilmiş) — 2026-06-10

> **ARŞİV NOTU (T072, 2026-08-17).** Bu belge NotebookLM ikizinde **tek kopya** olarak
> duruyordu; depoda karşılığı yoktu. T072 temizliğinde ikizden kaldırılması kararlaştırıldı
> (uygulanmış ve kapanmış tarihsel kayıt; render stratejisi denetimi 2026-08-16 onu aştı),
> ama silmek **kalıcı kayıp** olacaktı — bu yüzden içeriği `source_read` ile ikizden okunup
> buraya arşivlendi, sonra kaynak silindi.
>
> `docs/archive/` doküman hattının tarama kapsamında **değil** (`source_dirs: [src, .]`),
> yani bu dosya ikize geri yüklenmez. Arşiv amaçlı durur.
>
> **Hâlâ geçerli olan üç kural** aşağıda: `LazyInView` zaten mevcut (yenisini yazma),
> arbitrary Tailwind değeri yasak (token kullan), `PCFSoftShadowMap` yasak.
> Bunlar bugün `CLAUDE.md` kural 8/9/10 ve `docs/standards/3d-webgl-standard.md`'de yaşıyor.

---

## Lighthouse Plan Karşılaştırması — Antigravity vs Dijital İkiz

### 🤝 Ortak Noktalar (her iki plan da aynı fikirde)

| # | Konu | Antigravity | Dijital İkiz |
|---|---|---|---|
| 1 | Footer CLS | `min-height` ekle | `min-h-*` Tailwind token kullan (arbitrary yasak!) |
| 2 | Three.js lazy-load | `next/dynamic` + `ssr: false` | `next/dynamic` zorunlu, `React.lazy` yasak (AX-08) |
| 3 | OrbitalProductsShowcase | CategoryOrbitCarousel içinde dynamic yap | Aynı — ağır 3D vitrinler dynamic olmalı |
| 4 | HDR kaldır | Navigasyondan kaldır, `ambientLight` kullan | Aynı — `preset="city"` kaldır, temel ışıklandırma kullan |
| 5 | IntersectionObserver | Custom `Lazy3D` wrapper bileşeni | `LazyInView` bileşeni zaten projede var! |
| 6 | DPR + frameloop | Zaten yapıldı ✅ | Doğruladı — `dpr=[1,1.5]`, `frameloop="demand"` ✅ |

### 🔴 Farklılıklar ve İkiz'in ek uyarıları

| # | Konu | Antigravity | Dijital İkiz | Kazanan |
|---|---|---|---|---|
| 1 | Footer min-height yöntemi | `style={{ minHeight: '320px' }}` inline | ⚠️ Arbitrary class yasak! Tailwind token kullan (`min-h-96` vb.) | 🧠 İkiz |
| 2 | StickyHeader lazy-load | Bahsetmedi | 🔴 `SearchOverlay`, `MegaMenu`, `CategoryHubOverlay` → `React.lazy()` kullanıyor, `next/dynamic`'e geçirilmeli | 🧠 İkiz |
| 3 | `content-visibility: auto` | Bahsetmedi | ✅ `.content-auto` sınıfı zaten projede var (index.css L392-400), 3D wrapper'lara eklenmeli (AX-03) | 🧠 İkiz |
| 4 | Gölge optimizasyonu | Bahsetmedi | ⚠️ `PCFSoftShadowMap` yasak (AX-02), `<BakeShadows />` veya `<ContactShadows />` kullanılmalı | 🧠 İkiz |

### 🧠 Sadece İkiz'den gelen kritik bilgiler

1. **`LazyInView` bileşeni zaten var!** Yeni `Lazy3D` wrapper önerilirken, İkiz projedeki mevcut
   `LazyInView` bileşenini buldu. Tekrar yazılmasına gerek yok — sadece kullanılmalı.
2. **Arbitrary Tailwind class yasağı.** Footer fix için `style={{ minHeight: '320px' }}` yazmak
   projede yasak. Enterprise token sistemi var — `min-h-80` (320px) veya `min-h-96` (384px)
   gibi standart token kullanılmalı.
3. **`StickyHeader.tsx` ek sızıntı noktası.** StickyHeader'daki 3 ağır bileşen (`SearchOverlay`,
   `MegaMenu`, `CategoryHubOverlay`) hâlâ `React.lazy()` kullanıyor. AX-08 kuralına göre bunlar
   `next/dynamic` olmalı.

### ✅ Birleştirilmiş final plan

**Faz 1 — CLS Fix (tahmini: +15 puan)**

| # | İş | Dosya | Detay |
|---|---|---|---|
| 1.1 | Footer `min-h-80` token ekle | `Footer.tsx` | Tailwind token, arbitrary yasak |
| 1.2 | Footer logolarına `width`/`height` ekle | `Footer.tsx` | Görsel CLS önleme |
| 1.3 | Products grid `min-height` + skeleton | Grid container | `content-visibility: auto` |

**Faz 2 — TBT Fix (tahmini: +30 puan)**

| # | İş | Dosya | Detay |
|---|---|---|---|
| 2.1 | `OrbitalProductsShowcase` → `next/dynamic` | `CategoryOrbitCarousel.tsx` | Three.js chunk ayrılır |
| 2.2 | `CategoryMasterView` 5 view → `next/dynamic` | `CategoryMasterView.tsx` | Unused JS −200KB+ |
| 2.3 | `StickyHeader` 3 bileşen → `next/dynamic` | `StickyHeader.tsx` | `React.lazy` → `next/dynamic` |
| 2.4 | `LazyInView` wrapper'ı 3D Canvas'lara ekle | 3D bileşenler | Mevcut bileşeni kullan |
| 2.5 | `.content-auto` sınıfı ekle | 3D container'lar | Below-fold render sıfırlama |

**Faz 3 — Network (tahmini: +10 puan)**

| # | İş | Dosya | Detay |
|---|---|---|---|
| 3.1 | Nav bileşenlerinden `<Environment preset="city"/>` kaldır | 6 dosya | `ambientLight` + `directionalLight` |
| 3.2 | Ürün sahnesi → self-hosted düşük çözünürlük HDR | `Product3DViewer.tsx` | `public/env/city_256.hdr` (~50KB) |
| 3.3 | Browserslist güncelle → polyfill kaldır | `package.json` | −13KB |

**Faz 4 — Render (tahmini: +5 puan)**

| # | İş | Dosya | Detay |
|---|---|---|---|
| 4.1 | Forced reflow → `requestAnimationFrame` | Layout JS | DOM ölçme optimizasyonu |

**Doğrulama:** her faz sonrası `npx tsc --noEmit` + `npx next build` · `pnpm run analyze`
(bundle boyut kontrolü) · canlı Lighthouse testi.

### Sonuç

İkiz'in katkısı kritik oldu — 3 şey kaçırılmıştı: `LazyInView` zaten var (tekrar yazılmayacak),
arbitrary class yasağı (token kullanılacak), `StickyHeader` sızıntı noktası (düzeltilecek).
