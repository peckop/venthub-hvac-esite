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
| Lighthouse Performance | ?/10 | FAZ 2'de ölçülecek |
| SSR / Client Boundary | 6/10 | 36 dosya gereksiz 'use client' |
| Bundle Boyutu | 7.5/10 | 26 dosyada framer-motion |
| Güvenlik | 7/10 | RLS var, CSP/rate-limit eksik |
| Dead Code | 5/10 | 77 kullanılmayan dosya |
| i18n Disiplini | 7/10 | Hardcoded metinler var |

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

**Durum:** Beklemede
**Tahmini Süre:** 2-3 oturum
**Risk:** Düşük

### Strateji
1. Knip raporunu kategorize: components, utils, types, hooks
2. Her kategori ayrı PR (kapsam kirlenmesi olmasın)
3. `ProductDetailPage.tsx` vs `ProductDetailPageView.tsx` dual implementasyonu çöz

### Kazanım
- Build süresi kısalır
- TypeScript indexing hızlanır
- Mental model netleşir (77 dosya eksilir)

### Doğrulama
- `npx knip --reporter compact` → 0 unused file
- TSC + Build PASS
- Mevcut testler geçmeli

---

## FAZ 6 — i18n Disiplini + Final Lighthouse Push (P02-F)

**Durum:** Beklemede
**Tahmini Süre:** 2-3 oturum
**Risk:** Düşük

### i18n Temizliği
- `AccountOverviewPage`: "Merhaba", "B2B portalinize hoş geldiniz", ship status
- `AuthCallbackPage`: "E-posta Doğrulanıyor...", "Doğrulama Başarılı"
- `AccountShipmentsPage`: "Siparişlerime Git", "Kargoda"
- `Product3DViewer`: "3D Model Yüklenemedi", "GERİ", "GÖRÜNÜM"
- Service layer → error codes (PAYMENT_INIT_FAILED)

### Final Lighthouse Optimizasyonları
- Preconnect/prefetch hints
- Critical CSS inline
- Service Worker (opsiyonel)

### Hedef Skoru

| Metrik | Baz | Hedef |
|--------|-----|-------|
| Performance | ? | 95+ |
| Accessibility | ? | 100 |
| Best Practices | ? | 100 |
| SEO | ? | 100 |

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
