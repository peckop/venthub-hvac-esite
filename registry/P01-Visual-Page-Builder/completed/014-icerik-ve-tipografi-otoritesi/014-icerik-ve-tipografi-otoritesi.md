---
completed_at: "2026-03-19 22:30:00"
started_at: "2026-03-19 22:12:00"
created_at: "2026-03-17 15:50:57"
updated_at: "2026-03-20 17:24:01"
id: 014
title: "İçerik ve Tipografi Otoritesi"
status: "Completed"
progress: "100%"
priority: "High"
depends_on: [006]
artifacts:
  brainstorm: "registry/P01-Visual-Page-Builder/completed/014-icerik-ve-tipografi-otoritesi/brainstorm.md"
  plan: "registry/P01-Visual-Page-Builder/completed/014-icerik-ve-tipografi-otoritesi/plan.md"
  review: "registry/P01-Visual-Page-Builder/completed/014-icerik-ve-tipografi-otoritesi/review.md"
---

# 014 - İçerik ve Tipografi Otoritesi

## 🎯 Hedef
Otorite sayfalarındaki mühendislik metinlerinin hiyerarşisini, font ağırlıklarını ve okunabilirliğini (Readability) standartlaştıran tasarım kurallarını mühürlemek.

## ✅ Alt Görevler
- [x] `tailwind.config.js` içine VentHub özel font scale (vh-h1..vh-h6) tanımları eklendi.
- [x] `src/styles/typography.css` dosyası oluşturuldu ve `@layer components` seviyesinde mühürlendi.
- [x] `CategoryHero` ve `ProductDetailPage` üzerindeki başlıklar bu yeni otoriteye bağlandı.
- [x] `ProductCard` (Grid/List) yazı stilleri standardize edildi.
- [x] `docs/DESIGN_SYSTEM.md` güncellendi.