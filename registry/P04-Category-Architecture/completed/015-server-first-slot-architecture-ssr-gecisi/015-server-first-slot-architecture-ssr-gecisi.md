---
id: "015"
title: "Server-First Slot Architecture (SSR Gecisi)"
priority: "High"
status: "Completed"
progress: 100%
project: "P04-Category-Architecture"
created_at: "2026-03-26 12:22:46"
updated_at: "2026-04-01 15:09:53"
artifacts:
  brainstorm: "registry/P04-Category-Architecture/completed/015-server-first-slot-architecture-ssr-gecisi/brainstorm.md"
  plan: "registry/P04-Category-Architecture/completed/015-server-first-slot-architecture-ssr-gecisi/plan.md"
  review: "registry/P04-Category-Architecture/completed/015-server-first-slot-architecture-ssr-gecisi/review.md"
---

# 🛠️ 015: Server-First Slot Architecture (SSR Geçişi)

> **Bağımlılık:** P04/014 (Zemin Temizliği) TAMAMLANMADAN bu göreve başlanamaz.
> **Vizyon Belgesi:** `architectural_vision_brainstorm.md` — Aşama 2 + Aşama 3
> **Sonraki Aşama:** P04/016 (i18n + Slug Konsolidasyonu)

## 🎯 Hedefler
- [ ] Tüm kategori View bileşenlerini (`ShowcaseView`, `LandingView`, `SeriesView`, `GridView`, `DiscoveryView`) standart `SlotProps` interface'ine oturt
- [ ] `CategoryMasterView`'ı temiz slot-router (switch/map) yapısına dönüştür
- [ ] `/category/[slug]/page.tsx` → kategori + ürün verisini SSR olarak çek (paralel `Promise.all`)
- [ ] `/category/[slug]/[sub]/page.tsx` → `initialCategory` prop'u ekle (şu an geçmiyor)
- [ ] `/products/page.tsx` → discovery verilerini SSR olarak çek (null yerine gerçek veri)
- [ ] `CategoryContext`'i sadece navigasyon bileşenleri (MegaMenu, Overlay, Carousel) için tut; sayfa içeriğinden tamamen ayır
- [ ] `CategoryMasterView`'ı "Server data alır + client-side filtre yapar" modeline dönüştür

## ✅ Alt Görevler
- [ ] 1. `SlotProps` interface'ini oluştur (`src/types/slot.ts`) — P04/014'te tanımlanacak
- [ ] 2. Her View bileşenini `SlotProps` alacak şekilde refactor et (5 dosya)
- [ ] 3. `CategoryMasterView`'u slot-router'a dönüştür
- [ ] 4. `/category/[slug]/page.tsx` → SSR veri çekimini kategori+ürün paralel yap
- [ ] 5. `/category/[slug]/[sub]/page.tsx` → `initialCategory` prop'u ekle
- [ ] 6. `/products/page.tsx` → SSR discovery verisi çek
- [ ] 7. `CategoryContext` rolünü daralt (sayfa verisinden çıkar, navigasyon için tut)
- [ ] 8. Hydration testi (server HTML vs client render uyumu)
- [ ] 9. `View Source` testi (Google bot'un ürün listesini HTML'de görmesi)
- [ ] 10. Build + Lint + Type-check + Lighthouse ≥ 80

## 🚩 Riskler
- SSR ↔ Client hydration uyumsuzluğu (en yüksek risk)
- `CategoryContext` daraltılırken MegaMenu/Overlay'in kırılması
- Server Component → Client Component sınırı geçişlerinde props serialization hataları

## 🏁 Başarı Kriterleri
- Google bot, `/category/fanlar` sayfasında ürün listesini HTML içinde görüyor (`curl` testi)
- `pnpm run build` → 0 hata
- Lighthouse Performance ≥ 80