---
completed_at: null
started_at: null
created_at: "2026-03-17 15:50:57"
updated_at: "2026-03-20 17:24:01"
id: 017
title: "Görsel Sayfa Oluşturucu (Visual Page Builder)"
status: "Executing"
progress: "90%"
priority: "Critical"
depends_on: [006, 014, 015, 016]
artifacts:
  brainstorm: "registry/P01-Visual-Page-Builder/active/017-gorsel-sayfa-olusturucu-visual-page-builder/brainstorm.md"
  plan: "registry/P01-Visual-Page-Builder/active/017-gorsel-sayfa-olusturucu-visual-page-builder/plan.md"
  review: "registry/P01-Visual-Page-Builder/active/017-gorsel-sayfa-olusturucu-visual-page-builder/review.md"
---

# 017 - Görsel Sayfa Oluşturucu (Visual Page Builder)

## 🎯 Hedef
Admin kullanıcının hiçbir kod yazmadan, veritabanından beslenen dinamik bileşenlerle kategori sayfalarını baştan sona kurgulayabildiği görsel arayüzü teslim etmek.

## ✅ Alt Görevler
- [x] `src/types/authority.ts` dosyasını oluştur.
- [x] `AuthorityBlock`, `BlockType`, `AuthorityContent` tiplerini tanımla.
- [x] Zengin metin ve yapılandırma (config) opsiyonlarını ekle.
- [x] `src/components/admin/authority-builder/` dizinini oluştur.
- [x] `AuthorityBuilder.tsx`: Ana konteyner (Sıralama, Ekleme, Silme).
- [x] `BlockEditor.tsx`: Tüm blok tipleri için (Hero, Media, Specs, Features, Comparison, CTA) formlar tamamlandı.
- [x] `CategoryBuilderView.tsx`: Tam ekran Studio arayüzü ve Live Preview.
- [x] `AuthorityRenderer.tsx`: Tüm blok tiplerinin dinamik render motoru ve sunumu tamamlandı.
- [x] Admin Entegrasyonu: Kategori listesinden Builder'a geçiş köprüsü.
- [x] Legacy Migration: Eski kategorilerin otomatik bloklara dönüştürülmesi.
- [ ] Final Polishing: Mobil görünüm ve performance chart entegrasyonu.