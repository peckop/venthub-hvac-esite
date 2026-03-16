---
updated_at: "2026-03-16 16:30:00"
id: 030
title: "Gelişmiş Arama UX & Backend Optimizasyonu"
status: "Backlog"
progress: "0%"
priority: "High"
depends_on: null
artifacts:
  brainstorm: null
  plan: null
  review: null
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
