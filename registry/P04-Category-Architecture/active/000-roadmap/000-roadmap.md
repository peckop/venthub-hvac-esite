---
id: "000"
title: "Roadmap"
status: "Active"
artifacts:
  brainstorm: "registry/P04-Category-Architecture/active/000-roadmap/brainstorm.md"
  plan: "registry/P04-Category-Architecture/active/000-roadmap/plan.md"
  review: "registry/P04-Category-Architecture/active/000-roadmap/review.md"
---


# P04 - Category Architecture: Server-First Slot Architecture

## 🎯 Projenin Amacı
VentHub kategori/ürün mimarisini **"Anakart-Yuva (Slot Architecture)"** modeline dönüştürmek:
- **Anakart** = `CategoryMasterView` (Shell) — Veri alır, doğru yuvaya yönlendirir
- **Yuvalar** = View bileşenleri (showcase, landing, series, grid, discovery) — Takılıp çıkarılabilir
- **Veri Yolu** = Server-side fetch → props → Shell → Slot — SEO ve performans dostu
- **Karar Mekanizması** = DB `metadata.display_mode` — Kod değişikliği gerektirmez

> **Vizyon Belgesi:** `architectural_vision_brainstorm.md` (Antigravity Artifacts, 26.03.2026)

## 🚧 Yol Haritası (Roadmap)

### ✅ Tamamlanan Aşamalar (Temel)
- [x] Aşama 1: Tip Birleştirme — `DomainCategory` ViewModel zırhı
- [x] Aşama 2: DB Migration — `CategoryMetadata` kolonu
- [x] Aşama 3: Gateway Mimarisi — `useCategoryGateway` tek veri kapısı
- [x] Aşama 4: ProductsPage Birleştirme → `CategoryMasterView`
- [x] Aşama 5: PDP Gateway — Ürün detay sayfası
- [x] Aşama 6: Navigasyon Entegrasyonu — MegaMenu, Overlay
- [x] Aşama 7: UCS Entegrasyonu — `CategoryMasterView` Shell oldu

### 🔥 Aktif Pipeline (Sıralı, Bağımlı)
```
P04/014 (Zemin Temizliği) → P04/015 (SSR Slot Arch.) → P04/016 (i18n + Slug)
```

| Görev | Aşama | Kapsam | Bağımlılık |
|-------|-------|--------|------------|
| **014** | Zemin Temizliği | Registry silme, hardcoded → DB, SlotProps tanımı | Yok (başlangıç) |
| **015** | SSR Slot Architecture | View'ları SlotProps'a oturt, SSR geçişi, Context daraltma | 014 bitmeli |
| **016** | Son Kilometre | i18n kilitleme, slug konsolidasyonu, 301 redirect | 015 bitmeli |

## 🛠 Teknik İlkeler
- **Single Source of Truth (Veri):** Tüm kategori verisi ve gösterim kararları DB'den gelir
- **Single Source of Truth (Tip):** UI tarafında `DomainCategory` tek model, `SlotProps` tek kontrat
- **Server-First:** Sayfa verileri sunucuda çekilir, client sadece interaktif filtreler için kullanılır
- **Slot Bağımsızlığı:** Yeni bir görünüm eklemek = 1 dosya oluştur + DB'de display_mode güncelle

## 📈 Başarı Kriterleri (P04 Mühürü)
1. `categoryRegistry.ts` projeden silinmiş olmalı
2. Hiçbir View bileşeninde hardcoded slug listesi kalmamalı
3. Google bot kategori sayfalarında ürün HTML'ini görmeli
4. Yeni Slot eklemek için tek dosya + DB güncellemesi yeterli olmalı
5. `pnpm run build` → 0 hata, Lighthouse ≥ 80
6. Tüm user-facing text `useI18n()` altında

## 🔗 İlişkili Projeler
- **P01 (Visual Page Builder):** P04 tamamlandığında P01 doğal olarak güçlenir. Admin Builder'ın altındaki veri mimarisi P04'tür.
- **P05 (Next15 Modernization):** SSR geçişi (015) aynı zamanda Next.js 15 performans hedeflerini karşılar.
