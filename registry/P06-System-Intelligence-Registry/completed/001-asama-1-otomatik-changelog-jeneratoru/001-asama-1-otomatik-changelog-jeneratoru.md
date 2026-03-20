---
id: 001
title: "Aşama 1: Otomatik CHANGELOG Jeneratörü"
priority: "Medium"
created_at: "2026-03-19 02:26:00"
depends_on: []
artifacts:
  brainstorm: "registry/P06-System-Intelligence-Registry/completed/001-asama-1-otomatik-changelog-jeneratoru/brainstorm.md"
  plan: "registry/P06-System-Intelligence-Registry/completed/001-asama-1-otomatik-changelog-jeneratoru/plan.md"
  review: "registry/P06-System-Intelligence-Registry/completed/001-asama-1-otomatik-changelog-jeneratoru/review.md"
started_at: "2026-03-19 02:27:59"
status: Completed
progress: 100%
completed_at: "2026-03-19 02:29:01"
updated_at: "2026-03-20 17:24:02"
---




# 001 - Otomatik CHANGELOG Jeneratörü

## 🎯 Hedef
`completed` klasörüne taşınan her görevin `review.md` içeriğini kullanarak projenin ana dizinindeki `docs/CHANGELOG.md` dosyasını otonom olarak güncellemek.

## ✅ Alt Görevler
- [ ] `manage_registry.py` içerisindeki `move_task` fonksiyonunu kancalanabilir hale getir.
- [ ] `review.md` dosyasını parse eden merkezi bir fonksiyon geliştir.
- [ ] `docs/CHANGELOG.md` dosyasını okuyan ve yeni veriyi en başa ekleyen yazıcıyı (writer) kodla.
- [ ] Bir test görevi oluşturarak tüm akışı denetle.