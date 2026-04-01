---
id: "000"
title: "Roadmap"
status: "Active"
---

# P01 - Visual Page Builder (Headless CMS)

## 🎯 Projenin Amacı
Admin kullanıcının hiçbir kod yazmadan, veritabanından (JSONB) beslenen blok tabanlı bileşenlerle kategori/ürün sayfalarını kurgulayabildiği merkezi bir **İçerik Yönetim Sistemi (CMS)** kurmak.

> **Ticari Değerlendirme:** Bu sistem, VentHub'a özgü olmaktan çıkıp genel bir "Block-Based Page Builder" ürününe dönüştürülebilir. Standartları olan, merkezi şekilde yönetilebilen, eklenebilen/silinebilen/değiştirilebilen sayfa içerik yapısı, stil ve renk sistemi.

## 📊 Mevcut Durum

| Görev | İlerleme | Durum |
|-------|----------|-------|
| **017** Visual Page Builder | %90 | Blok sistemi, Builder, Renderer tamamlandı. Mobil polish eksik. |
| **020** Platinum Page Builder | %85 | Tam ekran Studio UX tamamlandı. FAQ/Problem-Solution blokları eksik. |

> ⚠️ **P04 Bağımlılığı:** Bu iki görev işlevsel olarak çalışıyor ama altındaki mimari (P04 Category Architecture) sağlam olmadıkça üretim kalitesinde olamaz. P04/014-015-016 pipeline'ı tamamlandığında bu görevler doğal olarak güçlenecek.

## 🧊 Dondurulan / Backlog'a Alınan Görevler (26.03.2026)

| Görev | Neden |
|-------|-------|
| **008** B2B Hiyerarşisi | Mimari altyapı hazır değil. %0 ilerleme, boş gövde. |
| **009** Fiyatlandırma Motoru | Bağımlılığı (008) bile başlamamış. |
| **018** Series Dönüşümü | P04/014 tarafından absorbe edildi (displayMode → DB). |

## 🚀 Gelecek Vizyon
P04 tamamlandığında bu projenin odağı:
1. **017+020 birleştirme:** Tek bir "Category Studio" deneyimi
2. **Blok çeşitliliği:** FAQ, Problem-Solution, How It Works, Testimonials
3. **Drag & Drop:** Blok sıralama desteği (framer-motion)
4. **Stil Sistemi:** Blok düzeyinde renk/tema yönetimi
5. **Template Kütüphanesi:** Hazır sayfa şablonları (Landing, Showcase, Technical)
