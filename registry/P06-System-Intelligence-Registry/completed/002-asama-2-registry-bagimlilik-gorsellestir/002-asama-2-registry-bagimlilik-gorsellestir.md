---
id: 002
title: "Aşama 2: Registry Bağımlılık Görselleştirici (Graph Motor)"
priority: "High"
created_at: "2026-03-19 02:40:00"
depends_on: [001]
artifacts:
  brainstorm: "registry/P06-System-Intelligence-Registry/completed/002-asama-2-registry-bagimlilik-gorsellestir/brainstorm.md"
  plan: "registry/P06-System-Intelligence-Registry/completed/002-asama-2-registry-bagimlilik-gorsellestir/plan.md"
  review: "registry/P06-System-Intelligence-Registry/completed/002-asama-2-registry-bagimlilik-gorsellestir/review.md"
started_at: "2026-03-19 02:36:06"
status: Completed
progress: 100%
completed_at: "2026-03-19 02:37:13"
updated_at: "2026-03-20 17:24:02"
---




# 002 - Registry Bağımlılık Görselleştirici (Graph Motor)

## 🎯 Hedef
Registry'deki görevlerin `depends_on` alanlarını tarayarak, hangi görevin hangisini beklediğini gösteren görsel bir tablo (veya ASCII graph) üretmek. Bu, projenin kritik yolunu (critical path) görmemizi sağlar.

## ✅ Alt Görevler
- [ ] `manage_registry.py` dosyasına `graph` komutu ve argümanları eklendi.
- [ ] Tüm projeleri tarayan ve `depends_on` verilerini toplayan veri motoru yazıldı.
- [ ] Toplanan verileri Mermaid.js formatına dönüştüren jeneratör kodlandı.
- [ ] Terminal çıktısında ASCII tabanlı bir görselleştirme modu eklendi.
- [ ] Döngüsel bağımlılık kontrolü (Circular Check) algoritması entegre edildi.