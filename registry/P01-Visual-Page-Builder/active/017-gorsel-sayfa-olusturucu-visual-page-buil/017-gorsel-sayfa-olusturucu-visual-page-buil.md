---
completed_at: null
started_at: null
created_at: "2026-03-17 15:50:57"
updated_at: "2026-03-20 17:24:01"
id: 017
title: "Görsel Sayfa Oluşturucu (Visual Page Builder)"
status: "Executing"
progress: "0%"
priority: "Critical"
depends_on: [006, 014, 015, 016]
artifacts:
  brainstorm: "registry/P01-Visual-Page-Builder/active/017-gorsel-sayfa-olusturucu-visual-page-buil/brainstorm.md"
  plan: "registry/P01-Visual-Page-Builder/active/017-gorsel-sayfa-olusturucu-visual-page-buil/plan.md"
  review: "registry/P01-Visual-Page-Builder/active/017-gorsel-sayfa-olusturucu-visual-page-buil/review.md"
---




































# 017 - Görsel Sayfa Oluşturucu (Visual Page Builder)

## 🎯 Hedef
Admin kullanıcının hiçbir kod yazmadan, veritabanından beslenen dinamik bileşenlerle kategori sayfalarını baştan sona kurgulayabildiği görsel arayüzü teslim etmek.

## ✅ Alt Görevler
- [ ] `src/types/authority.ts` dosyasını oluştur.
- [ ] `AuthorityBlock`, `BlockType`, `AuthorityContent` tiplerini tanımla.
- [ ] Zengin metin ve yapılandırma (config) opsiyonlarını ekle.
- [ ] `src/components/admin/authority-builder/` dizinini oluştur.
- [ ] `AuthorityBuilder.tsx`: Ana konteyner (Sıralama, Ekleme, Silme).
- [ ] `BlockEditor.tsx`: Her blok tipi için (Hero, Specs, Media) özelleşmiş form alanları.
- [ ] `BlockPreview.tsx`: Editör içinde anlık görsel önizleme.
- [ ] `src/components/authority/AuthorityRenderer.tsx`: JSON dizisini okuyup ilgili bileşenleri dinamik render eden motor.
- [ ] Blok bileşenlerini (Authority Blocks) oluştur veya mevcut olanları (Medya Otoritesi vb.) sarmala:
- [ ] Kategori düzenleme sayfasında (`src/components/admin/categories/`) yeni bir "Otorite İçeriği" tabı ekle.
- [ ] `authority_content` alanını `AuthorityBuilder` ile bağla.
- [ ] Kaydetme (Submit) mantığını `AuthorityBuilder` verisini içerecek şekilde güncelle.