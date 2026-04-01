---
id: "014"
title: "Global Architectural Consolidation & i18n Finalization"
priority: "High"
status: "Completed"
progress: 100%
project: "P04-Category-Architecture"
created_at: "2026-03-24 15:34:18"
updated_at: "2026-04-01 14:08:00"
artifacts:
  brainstorm: "registry/P04-Category-Architecture/completed/014-global-architectural-consolidation--i18n-finalization/brainstorm.md"
  plan: "registry/P04-Category-Architecture/completed/014-global-architectural-consolidation--i18n-finalization/plan.md"
  review: "registry/P04-Category-Architecture/completed/014-global-architectural-consolidation--i18n-finalization/review.md"
---

# 🛠️ 014: Zemin Temizliği — Tek Otorite & Display Mode Geçişi

> **Vizyon Belgesi:** `architectural_vision_brainstorm.md` (Antigravity Artifacts)
> **Absorbe Ettiği Görevler:** P01/018 (Series Dönüşümü), P04/010 (Discovery Yeniden İnşa)
> **Sonraki Aşama:** P04/015 (Server-First Slot Architecture)

## 🎯 Hedefler
- [ ] `categories` tablosuna `display_mode` (TEXT) kolonu ekle (DB Migration)
- [ ] Mevcut hardcoded slug listelerini (`showcaseSlugs`, `landingSlugs`) DB'ye seed et
- [ ] `useCategoryViewModel.ts` içindeki hardcoded slug array'lerini kaldır, DB metadata oku
- [ ] `categoryRegistry.ts` bağımlılıklarını (`applicationLinks.ts`, `RadialActionMenu.tsx`) tamamen kaldır
- [ ] `categoryRegistry.ts` dosyasını sil
- [ ] `ProductsDiscoveryView`'ın kendi fetch'ini kaldır, Gateway props'tan veri alsın

## ✅ Alt Görevler
- [ ] 1. DB Migration: `display_mode` kolonu ekleme
- [ ] 2. DB Seed: Mevcut slug → display_mode eşleştirmesi
- [ ] 3. `useCategoryViewModel` refactoru (hardcoded → DB)
- [ ] 4. `categoryRegistry.ts` bağımlılık analizi ve yok etme
- [ ] 5. `ProductsDiscoveryView` Gateway entegrasyonu
- [ ] 6. `SlotProps` interface tanımı (`src/types/slot.ts`)
- [ ] 7. Build + Lint + Type-check doğrulaması