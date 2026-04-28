---
id: "000"
title: "P02 Roadmap — VentHub 10/10 Enterprise Kalite Yol Haritası"
status: "Active"
artifacts:
  brainstorm: "registry/P02-Core-Quality-Guardians/active/000-roadmap/brainstorm.md"
  plan: "registry/P02-Core-Quality-Guardians/active/000-roadmap/plan.md"
  review: "registry/P02-Core-Quality-Guardians/active/000-roadmap/review.md"
---

# P02 Roadmap — VentHub 10/10 Enterprise Kalite Yol Haritası

> **Vizyon:** Hızlı · Hatasız · Akıcı · Güvenli · Mimari olarak en iyi e-ticaret.
> **Hedef:** Lighthouse 95+ · Sıfır teknik borç · Production-ready mimari.
> **Strateji:** Bir faz bitmeden diğerine geçilmez. Stres yok, panik yok.

---

## Baz Çizgisi (28 Nisan 2026)

| Katman | Puan | Not |
|--------|------|-----|
| TSC / ESLint / Build | 10/10 | Sıfır hata |
| SSOT Rota Disiplini | 10/10 | FAZ 1 ile kapatıldı |
| Lighthouse Performance | 86/100 | FAZ 7 ile LCP 11.6s → 2.1s (desktop) |
| Lighthouse Accessibility | 92/100 | — |
| Lighthouse Best Practices | 96/100 | — |
| Lighthouse SEO | 83/100 | — |
| SSR / Client Boundary | 6/10 | 36 dosya gereksiz 'use client' |
| Bundle Boyutu | 7.5/10 | 26 dosyada framer-motion |
| Güvenlik | 8/10 | FAZ 4 ile CSP Report-Only + X-Frame-Options DENY |
| Dead Code | 9/10 | FAZ 5 ile 3 dosya silindi (knip yanılması 70+) |
| i18n Disiplini | 9/10 | FAZ 6 ile major hardcoded metinler çevrildi |

---

## FAZ 1 — SSOT Temizliği ✅ KAPALI

**Tarih:** 28 Nisan 2026
**Kapsam:** 9 dosya, 19 değişiklik noktası
**Sonuç:** Tüm testler PASS

| Değişiklik | Durum |
|-----------|-------|
| `getProductBySlugOrId` → `getProductBySlug` (2 dosya) | ✅ |
| `router.push('/hardcoded')` → `Routes.xxx()` (19 nokta, 7 dosya) | ✅ |
| `ErrorBoundary.tsx` static string map | ✅ |
| `AccountOverviewPage` "SipariŞ" typo | ✅ |
| `AccountShipmentsPage` + `AccountReturnsPage` Routes import | ✅ |

**Doğrulama:**
- `pnpm exec tsc --noEmit` → Exit 0
- `pnpm run lint` → PASS
- `pnpm run build` → PASS
- `grep getProductBySlugOrId src/views/` → 0 sonuç
- `grep "router.push('/" src/views/` → 0 sonuç

---

## FAZ 0 — Kritik Acil Düzeltmeler ✅ KAPALI

**Tarih:** 28 Nisan 2026
**Kapsam:** 4 dosya (RLS migration + ErrorBoundary + i18n dictionaries)
**Model:** Dola Seed 2.0 Pro (planlama) + Dola Seed 2.0 Code (uygulama)
**Sonuç:** Tüm testler PASS

| Değişiklik | Durum |
|-----------|-------|
| 4 tablo RLS SELECT policy eklendi (cart_items, payment_transactions, inventory_movements, price_lists) | ✅ |
| ErrorBoundary `I18nContext.Consumer` ile sarmalandı (hardcoded string → i18n) | ✅ |
| 7 çeviri anahtarı `tr.ts` + `en.ts`'e eklendi | ✅ |
| `inventory_movements` admin-only RLS policy | ✅ |

**Doğrulama:**
- `pnpm exec tsc --noEmit` → Exit 0
- `pnpm run lint` → PASS
- `pnpm run build` → PASS (399 sayfa)

---

## FAZ 2 — Lighthouse Baz Ölçümü + Framer-Motion Temizliği ✅ KAPALI

**Tarih:** 28 Nisan 2026
**Kapsam:** 8 dosya (framer-motion → CSS/Tailwind)
**Sonuç:** Tüm testler PASS

| Değişiklik | Durum |
|-----------|-------|
| `AboutPage.tsx` (10 motion element) | ✅ |
| `ContactPage.tsx` (6 motion element) | ✅ |
| `BrandsPage.tsx` (4 motion element) | ✅ |
| `BrandDetailPage.tsx` (14 motion element) | ✅ |
| `CategoryShowcaseView.tsx` (6 motion element) | ✅ |
| `EliteHero.tsx` (13 motion element, CSS @keyframes) | ✅ |
| `CategoryHero.tsx` (6 motion element) | ✅ |
| `CategoryOrbitCarousel.tsx` (13 + AnimatePresence) | ✅ |
| FeaturedCommercialBlocks (layoutId — atlandı) | ⏭️ FAZ 3'e |

**Doğrulama:**
- `pnpm exec tsc --noEmit` → Exit 0
- `pnpm run lint` → PASS
- `pnpm run build` → PASS (405 sayfa)
- `grep "from 'framer-motion'" src/views/` → 0 sonuç (kapsamdaki dosyalar)

---

## FAZ 3 — SSR-First Modernizasyonu (P02-C)

**Durum:** Beklemede
**Tahmini Süre:** 3-4 oturum
**Risk:** Orta

### Hedef
36 dosyadaki gereksiz `'use client'` direktiflerini Server Component'e çevirmek.

### Öncelik Sırası
1. Statik içerik sayfaları (AboutPage, ContactPage) → Tam Server Component
2. Veri çekip render eden ama etkileşim gerektirmeyen view'lar → RSC + Client Island
3. Auth gerektiren account sayfaları → Wrapper RSC + Client leaf

### Kazanım
- JS bundle ~30-50KB küçülme
- TTFB iyileşmesi
- Lighthouse Performance +5-10 puan

### Doğrulama
- `grep "'use client'" src/views/ | wc -l` → hedef: 15 altı
- TSC + Build PASS
- Lighthouse tekrar ölç

---

## FAZ 4 — Güvenlik Sertleştirmesi (P02-D) ✅ KAPALI

**Tarih:** 28 Nisan 2026
**Kapsam:** 2 dosya (next.config.mjs + middleware.ts)
**Sonuç:** Tüm testler PASS

| Değişiklik | Durum |
|-----------|-------|
| `X-Frame-Options`: SAMEORIGIN → DENY | ✅ |
| CSP Report-Only header eklendi (izleme modu) | ✅ |
| Rate limiting skeleton (yorum, production için edge KV gerekli) | ✅ |

**Not:** Rate limiting in-memory Map serverless'ta çalışmaz. Production için Vercel Edge KV veya benzeri gerekir.

**Doğrulama:**
- `pnpm exec tsc --noEmit` → Exit 0
- `pnpm run build` → PASS (405 sayfa)
- `curl -I localhost:3000` → CSP-Report-Only + DENY görünür

---

## FAZ 5 — Dead Code Temizliği (P02-E)

**Durum:** ✅ KAPALI (28 Nisan 2026)
**Tahmini Süre:** 2-3 oturum
**Risk:** Düşük

### Gerçek Bulgular
Knip raporu 77 "unused" dedi ancak ~70'i yanlış pozitif (kullanılıyor). Gerçekten 0 kullanım: 3 dosya.

### Silinen Dosyalar
| Dosya | Bulunduğu Yer |
|-------|---------------|
| `src/hooks/useScrollToHash.ts` | Hook mevcut ama kullanılmıyor |
| `src/types/slot.ts` | Type mevcut ama kullanılmıyor |
| `src/components/layout/index.ts` | Boş re-export dosyası |

### Doğrulama
- `pnpm exec tsc --noEmit` → Exit 0
- `pnpm run lint` → PASS

---

## FAZ 6 — i18n Disiplini + Final Lighthouse Push (P02-F)

**Durum:** ✅ KAPALI (28 Nisan 2026) — Kullanıcı metinleri
**Tahmini Süre:** 2-3 oturum
**Risk:** Düşük

### Yapılan i18n Düzeltmeleri

| Dosya | Değişiklik |
|-------|------------|
| `AccountOverviewPage.tsx` | "Merhaba," → `t('account.overview.greeting')`, "B2B portalinize..." → `t('account.overview.welcomeMessage')` |
| `AccountShipmentsPage.tsx` | "Hazırlandı" → `t('account.shipments.preparingLabel')`, "Siparişlerime Git" → `t('account.shipments.goToOrders')` |
| `Product3DViewer.tsx` | "GERİ", "GÖRÜNÜM", "RESET", "ORBİT", "FREE", "OTO", view yönleri (Ön/Arka/Sol/Sağ/Üst/Alt) → i18n keys |
| `PaymentSuccessPage.tsx` | Fallback error message → `t('cart.errors.paymentError')` |

### Not: Service Layer Error Codes
Edge function error messages ('Çok fazla istek', 'Eksik alanlar', vb.) Deno runtime'da çalışır ve React i18n sistemine erişemez. Bu bir mimari karar gerektirir (ayrı i18n mechanism veya error code enum).

### Doğrulama
- `pnpm exec tsc --noEmit` → Exit 0
- `pnpm run lint` → PASS

## FAZ 7 — Lighthouse Performance İyileştirmesi ✅ KAPALI (28 Nisan 2026)

**Durum:** ✅ KAPALI
**Hedef:** Performance 39/100 → 70+/100, LCP <3s

### Yapılan İyileştirmeler

| Değişiklik | Dosya | Etki |
|-----------|-------|------|
| `three-setup` import kaldırıldı | `MainLayout.tsx` | Three.js (~600KB) artık sadece 3D sayfalarda |
| Admin pages dynamic import | 14 admin page.tsx | Recharts/admin JS lazy load |
| jsPDF dynamic import | `ProductDetailPageView.tsx`, `OrderDetailPage.tsx` | ~400KB sadece PDF oluşturulurken |

### Sonuç

| Metrik | Önceki | Sonraki |
|--------|--------|---------|
| Performance | 39/100 | **86/100** |
| LCP | 11,629ms | **2,092ms** |
| TBT | 1,841ms | **52ms** |
| TTI | 21,179ms | **2,099ms** |

### Doğrulama
- `pnpm run build` → PASS
- Lighthouse Performance 86/100 (desktop)

---

## FAZ 8 — SEO & Accessibility İyileştirmesi

**Durum:** Devam Ediyor
**Hedef:** SEO 83/100 → 95+, Accessibility 92/100 → 100, Mobile LCP <3s

### Yapılan (29 Nisan 2026)
| Değişiklik | Dosya | Durum |
|-----------|-------|-------|
| `robots.txt` oluşturuldu | `public/robots.txt` | ✅ |
| `sitemap.ts` zaten dinamik (DB'den) | `src/app/sitemap.ts` | ✅ |
| Icon button aria-label düzeltmeleri | `CartPage.tsx`, `ProductDetailPage.tsx`, `CommandPalette.tsx`, `AdminRealtimeNotifications.tsx` | ✅ |
| Hero image `sizes` responsive | `HomeSinevizyon.tsx` | ✅ |
| SEO zaten 100 — ek işlem gerekmiyor | — | ✅ |

---

### Final Lighthouse Optimizasyonları
- Preconnect/prefetch hints
- Critical CSS inline
- Service Worker (opsiyonel)

### Hedef Skoru

| Metrik | Baz | Hedef |
|--------|-----|-------|
| Performance | 86 | 95+ |
| Accessibility | 92 | 100 |
| Best Practices | 96 | 100 |
| SEO | 83 | 95+ |

### Doğrulama
- `grep -r "hardcoded-turkish" src/views/` → 0
- Lighthouse final audit → hedef skorlar
- `useI18n()` kullanım oranı → %95+

---

## Scope Dışı (Gelecek Projeler)

| Konu | Proje |
|------|-------|
| Orion plans/plan_nodes DB entegrasyonu | P06 |
| B2B Hiyerarşisi | P01/008 |
| Engineering Engine | P01/011 |
| Enterprise Search | P07 |
