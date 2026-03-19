---
completed_at: null
started_at: null
created_at: "2026-03-17 15:50:57"
updated_at: "2026-03-19 13:00:02"
id: 030
title: "Gelişmiş Arama UX & Backend Optimizasyonu"
status: "Planning"
progress: "0%"
priority: "High"
depends_on: null
artifacts:
  brainstorm: "registry/P00-Standalone/backlog/030-gelismis-arama-ux-backend-optimizasyonu/brainstorm.md"
  plan: "registry/P00-Standalone/backlog/030-gelismis-arama-ux-backend-optimizasyonu/plan.md"
  review: "registry/P00-Standalone/backlog/030-gelismis-arama-ux-backend-optimizasyonu/review.md"
---













































# 030 - Gelişmiş Arama UX & Backend Optimizasyonu

## 🎯 Hedef
Arama deneyimini kurumsal seviyeye taşımak. Sadece ürün bulmak değil, kullanıcının ne aradığını saniyeler içinde anlamak ve yönlendirmek.

## ✅ Alt Görevler
- [ ] **Mobil Arama Paneli:** Mobilde tam ekran açılan, hızlı erişim butonları içeren modern arama katmanı.
- [ ] **Sonuç Sekmeleri:** Arama sonuçlarını "Ürünler", "Kategoriler" ve "Markalar" olarak ayırmak.
- [ ] **PostgreSQL Normalizasyon:** `fts_search_products` fonksiyonuna Turkish Case Sensitivity (i/I, ı/I) desteği eklenmesi.
- [ ] **Popüler Aramalar:** Arama kutusu boşken gösterilecek "Sık Arananlar" listesi.
- [ ] **"Bunu mu demek istediniz?"**: Yanlış yazımlarda (typo) benzer terimleri önerme (Trigram similarity).

## 🛠️ Teknik Detaylar
- Component: `src/components/SearchOverlay.tsx`
- Database RPC: `fts_search_products`
- Library: Framer Motion (Transizyonlar için)
